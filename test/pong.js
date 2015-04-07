//ping-pong

var dgram 		= require('dgram'); 
var pub1 		= dgram.createSocket("udp4"); 
var pub2 		= dgram.createSocket("udp4"); 
var multicastIDs = ['239.1.1.200','239.1.1.201'];
var r=0;
var targetPort	= 61088;

pub1.bind(targetPort, function () {
	pub1.setMulticastTTL(255);
   	pub1.addMembership(multicastIDs[0]);     //listen to this group  
});

	var node_id = '12:34:54:56:79:99';

pub1.on('message', function (buf, rinfo) {
	var buff = new Buffer(buf).toString('ascii');
	var obj = buff.split(',');
	if (obj.length > 3) return;	//do not forward forwarded messages
	console.log(obj);
    if (obj[0] == 'ping') {
		var sres = 'pong,'+obj[1]+','+node_id+','+obj[2];
        var res = new Buffer(sres);
        pub1.send(res, 0, res.length, targetPort, multicastIDs[0]);
	}            
	buff = buff+','+node_id;
	var buffy = new Buffer(buff);
    pub1.send(buffy, 0, buffy.length,targetPort, multicastIDs[0]);
    console.log('forward '+buffy);
	
});

function send () {
  var args = [].slice.call(arguments);
  var fn = typeof args[args.length - 1] == 'function' ? args.pop() : null;

  var msg = (args.join(','));
  var buf = new Buffer(msg);
  //console.log(msg);
  pub1.send(buf, 0, buf.length, targetPort, multicastIDs[0], fn);
  //pub2.send(buf, 0, buf.length, targetPort, multicastIDs[1], fn);
};

