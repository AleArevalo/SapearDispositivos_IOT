var mysql = require('mysql');
var mqtt = require('mqtt');

let UltimoTemp = 0;
let UltimoHume = 0;

//CREDENCIALES MYSQL
var con = mysql.createConnection({
  host: "server.latamcodigo.com",
  user: "admin",
  password: "$MYSQLadmin/lc.1590",
  database: "latamdomotica_registro"
});

//nos conectamos
con.connect(function(err){
    if (err) throw err;
  
    //una vez conectados, podemos hacer consultas.
    console.log(">> MYSQL - Conexión a MYSQL exitosa!!!")
});
  

//CREDENCIALES MQTT
var options = {
  port: 1883,
  host: 'latamcodigo.com',
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

var client = mqtt.connect("mqtt://latamcodigo.com", options);

//SE REALIZA LA CONEXION
client.on('connect', () => {
    console.log('>> MQTT - Conectado por WS! Exito!');

    client.subscribe('values', { qos: 0 }, (error) => {
        if (!error) {
            console.log('>> MQTT - Suscripción exitosa!');
        } else {
            console.log('>> MQTT -Suscripción fallida!');
        }
    });
});

//CUANDO SE RECIBE MENSAJE
client.on('message', function (topic, message) {
  console.log(">> MQTT - Mensaje recibido desde -> " + topic + " Mensaje -> " + message.toString());
  if (topic == "values"){
    var msg = message.toString();
    var sp = msg.split(",");
    var temp = sp[0];
    var hume = sp[1];

    if(UltimoTemp != temp && UltimoHume != hume){
        //Registramos nuevos valores globales
        UltimoTemp = temp;
        UltimoHume = hume;
        //Registramos nuevos datos
        var query = "INSERT INTO registro_tp_hm(RegistroTemperatura, RegistroHumedad) VALUES ("+ temp + ", " + hume + ")";
        con.query(query, function (err, result, fields) {
            if (err) throw err;
            console.log(">> MYSQL - Registro insertada correctamente");
        });
    }
  }
});

//para mantener la sesión con mysql abierta
setInterval(function () {
    var query ='SELECT 1 + 1 as result';
  
    con.query(query, function (err, result, fields) {
      if (err) throw err;
    });
  
}, 5000);  