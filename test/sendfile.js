//ping-pong

var dgram 		= require('dgram'); 
var fs = require('fs');
var pub1 		= dgram.createSocket("udp4"); 
var multicastIDs = ['239.1.1.200','239.1.1.201'];
var r=0;
var targetPort	= 61088;
var node_id = '00:00:00:00:00:00';

if (process.argv.length <= 2) {
  console.log('sendfile <filetosend> <targetpath> <optional: target ip>')
return;	
}
var p = [];
try {fname = process.argv[2]} catch (e) {cmd = 'nocmd';}
try {fnametarget = process.argv[3]} catch (e) {p[0] = 'P0';}
try {multicastIDs[0] = process.argv[4]} catch (e) {multicastIDs = ['239.1.1.200'];}

broadcast();
var cmd;
function broadcast() {

  var pf = fname.split('/');
  if (pf.length > 0) pf =pf[pf.length-1];
  else pf = fname;
  var tname = fnametarget

  var f = fs.readFileSync(fname);
  cmd = 'FILE~'+tname+'~'+f;
  console.log(cmd.split('~'));

	;	
  setInterval(send, 3000);
  //process.exit();
};



function send () {
  var buf = new Buffer(cmd);
  pub1.send(buf, 0, buf.length, targetPort, multicastIDs[0]);
  console.log (' Sent ');
};

