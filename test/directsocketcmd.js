var net = require('net');
//var client = net.connect({host:'10.0.0.1', port: 61000},
var client = net.connect({host:'localhost', port: 61000},
    function() { //'connect' listener
  console.log('connected to server!');
  client.write('TEST,G0,c4:93:00:00:00:00');
});
client.on('data', function(data) {
  console.log(data.toString());
  client.end();
});
client.on('end', function() {
  console.log('disconnected from server');
});
