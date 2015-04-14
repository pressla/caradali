//ping-pong

var dgram 		= require('dgram'); 
var pub1 		= dgram.createSocket("udp4"); 
var multicastIDs = ['239.1.1.200'];
var r=0;
var targetPort	= 61088;
var node_id = '00:00:00:00:00:00';

if (process.argv.length <= 2) {
console.log('cmd  <command line> <opt:ip>');

return;	
}
var p = [];
try {cmd = process.argv[2]} catch (e) {cmd = 'ls';}
if (process.argv.length ==4) {
  multicastIDs[0] = process.argv[3];
}
console.log(p);

broadcast();

function broadcast() {
	tnow = new Date().getTime();
	send('callBash',cmd,0);	
    console.log(r+cmd+ ','+multicastIDs[0]+',' + cmd);
	r++;
  //process.exit();
};



function send () {
  var args = [].slice.call(arguments);
  var fn = typeof args[args.length - 1] == 'function' ? args.pop() : null;

  var msg = (args.join(','));
  var buf = new Buffer(msg);
  //console.log(msg);
  pub1.send(buf, 0, buf.length, targetPort, multicastIDs[0], fn);
  //pub2.send(buf, 0, buf.length, targetPort, multicastIDs[1], fn);
};

