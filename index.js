var mysql = require('mysql');
var mqtt = require('mqtt');

//CREDENCIALES MYSQL
var con = mysql.createConnection({
    host: "server.latamcodigo.com",
    user: "admin_ld",
    password: "$MYSQLadmin/ld.1590",
    database: "LatamDomotica"
});

//nos conectamos
con.connect(function(err) {
    if (err) throw err;

    //una vez conectados, podemos hacer consultas.
    console.log(">> MYSQL - Conexión a MYSQL exitosa!!!")
});


//CREDENCIALES MQTT
var options = {
    port: 1883,
    host: 'mqtt.latamdomotica.com',
    clientId: 'sapear_' + Math.round(Math.random() * (0 - 10000) * -1),
    username: 'aarevalo',
    password: 'aarevalold',
    keepalive: 60,
    reconnectPeriod: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8'
};

var client = mqtt.connect("mqtt://mqtt.latamdomotica.com", options);

//SE REALIZA LA CONEXION
client.on('connect', () => {
    console.log('>> MQTT - Conectado por WS! Exito!');

    client.subscribe('+/#', { qos: 0 }, (error) => {
        if (!error) {
            console.log('>> MQTT - Suscripción exitosa!');
        } else {
            console.log('>> MQTT -Suscripción fallida!');
        }
    });
});

//CUANDO SE RECIBE MENSAJE
client.on('message', function(topic, message) {
    console.log(">> MQTT - Mensaje recibido desde -> " + topic + " Mensaje -> " + message.toString());
    if (topic == "values") {
        const msg = message.toString();
        const sp = msg.split(",");
        const serial = sp[0];
        const temperatura = sp[1];
        const humedad = sp[2];
        const pantalla = sp[3];
        const json = '{"temperatura":"' + temperatura + '","humedad":"' + humedad + '","pantalla":"' + pantalla + '"}';

        //Registramos nuevos datos
        const query = "INSERT INTO Dispositivo_Registro(NumeroSerie, DataRegistro) VALUES ('" + serial + "', '" + json + "')";
        con.query(query, function(err, result, fields) {
            if (err) throw err;
            console.log(">> MYSQL - Registro insertada correctamente");
        });

    }
});

//para mantener la sesión con mysql abierta
setInterval(function() {
    var query = 'SELECT 1 + 1 as result';

    con.query(query, function(err, result, fields) {
        if (err) throw err;
    });

}, 5000);