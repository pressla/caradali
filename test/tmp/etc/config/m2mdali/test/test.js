//test.js

var serial = require ('serialport').SerialPort;

var serialPort = new serial ('/dev/ttyUSB0', {baudrate:115200});

serialPort.on("open", function () {
  	console.log('open');
  	serialPort.on('data', function(data) {
    	console.log('data received: ' + data);
  	});
  	serialPort.write("#DALI:FFA0\r\n", function(err, results) {
    	console.log('err ' + err);
    	console.log('results ' + results);
  	});
});

