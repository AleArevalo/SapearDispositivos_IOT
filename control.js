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
    clientId: 'comandante_001' ,
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
    console.log('>> COMANDANTE - Consultando comandos pendientes.');
    let query = 'SELECT * FROM Device_Registro WHERE IDEstado = 2;';
    let command = '';
    let id = '1';
  
    con.query(query, function (err, results, fields) {
        results.forEach(result => {
            command = JSON.parse(result.UltimoRegistro);
            id = result.IDRegistro;
            if (err) {
                console.log(">> MYSQL - Conexión a MYSQL fallida! ERROR: " + err);
            } else {
                client.publish('command', command.power, (error) => {
                    if (!error) {
                        let sql = 'UPDATE Device_Registro SET IDEstado = 1 WHERE IDRegistro = ' + id + ';';
                        con.query(sql, function (err, result) {
                            if (err) throw err;
                            console.log(result.affectedRows + " record(s) updated");
                            console.log('>> MQTT -Suscripción correcta! Command:' + command.power);
                        });
                    } else {
                        console.log('>> MQTT -Suscripción fallida! ' + error);
                    }
                });
            }
        });
    });
    return;
});
