
var Dgram = require('dgram');
var sub = Dgram.createSocket('udp4');
var pub = Dgram.createSocket('udp4');

var internals = {
	initialized:false,
	multicastID: '239.1.1.201',
	targetPort:  61088
};

sub.bind(internals.targetPort, function () {
  	sub.addMembership(internals.multicastID);     //listen to this group  
  	console.log('info','server registered to listen to multicast ip: '+internals.multicastID);
});

sub.on('listening', function () {
  	var address = sub.address();
  	//console.log('info',address);
  	console.log('info','UDP listening ' + address.address + ":" + address.port);
});

sub.on('message', function (buf, rinfo) {
	console.log('forward '+buf);
		pub.send(buf, 0, buf.length, internals.targetPort, '239.1.1.200');
});

 
