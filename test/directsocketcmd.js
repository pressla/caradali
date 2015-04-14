var net = require('net');
//var client = net.connect({host:'10.0.0.1', port: 61000},
var client = net.connect({host:'192.168.88.245', port: 61000},
    function() { //'connect' listener
  console.log('connected to server!');
  client.write('TEST,G0,c4:93:00:02:18:c6');
});
client.on('data', function(data) {
  console.log(data.toString());
  client.end();
});
client.on('end', function() {
  console.log('disconnected from server');
});
