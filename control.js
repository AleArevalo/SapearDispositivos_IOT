let mysql = require('mysql');
let mqtt = require('mqtt');

//CREDENCIALES MYSQL
let con = mysql.createConnection({
    host: "server.latamcodigo.com",
    user: "admin",
    password: "$MYSQLadmin/lc.1590",
    database: "latamdomotica_registro"
});

//nos conectamos
con.connect(function(err){
    if (err) throw err;
  
    //una vez conectados, podemos hacer consultas.
    console.log(">> MYSQL - Conexión a MYSQL exitosa!!!");
});

//CREDENCIALES MQTT
let options = {
    port: 1883,
    host: 'latamdomotica.com',
    clientId: 'sapear_' + Math.round(Math.random() * (0- 10000) * -1) ,
    username: 'aarevalo',
    password: 'aarevalold',
    keepalive: 60,
    reconnectPeriod: 1000,
    protocolId: 'MQIsdp',
    protocolVersion: 3,
    clean: true,
    encoding: 'utf8'
};
  
var client = mqtt.connect("mqtt://latamdomotica.com", options);

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

//Comprobar si hay comandos pendientes
setInterval(function () {
    let query = 'SELECT * FROM Device_Registro WHERE IDEstado = 2;';
    let command = '';
  
    con.query(query, function (err, result, fields) {
        console.log(result);
        if (err) {
            console.log(">> MYSQL - Conexión a MYSQL fallida! ERROR: " + err);
        } else {
            client.publish('command', 'on', (error) => {
                if (!error) {
                    console.log('>> MQTT -Suscripción fallida! ' + error);
                } else {
                    console.log('>> MQTT -Suscripción correcta! Command:' + command);
                }
            });
        }
    });
});  