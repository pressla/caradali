//ping-pong

var dgram 		= require('dgram'); 
var pub1 		= dgram.createSocket("udp4"); 
var pub2 		= dgram.createSocket("udp4"); 
var multicastIDs = ['239.1.1.200','239.1.1.201'];
var r=0;
var targetPort	= 61088;
var node_id = '00:00:00:00:00:00';

if (process.argv.length <= 2) {
console.log('cmd ip p0 p1 ')
console.log('sendcmd 10.0.0.1 setwifiparam wireless.radio0.channel 3')	
return;	
}
var p = [];
try {multicastIDs[0] = process.argv[2]} catch (e) {multicastIDs = ['239.1.1.200'];}
try {cmd = process.argv[3]} catch (e) {cmd = 'nocmd';}
try {p[0] = process.argv[4]} catch (e) {p[0] = 'P0';}
try {p[1] = process.argv[5]} catch (e) {p[0] = 'P1';}
console.log(p);

/*
pub1.bind(targetPort, function () {
	pub1.setMulticastTTL(255);
   //	pub1.addMembership(multicastIDs[0]);     //listen to this group  
});
*/
/*
pub1.on('message', function (buf, rinfo) {
	var trec = new Date().getTime();
   	var buff = new Buffer(buf).toString('ascii');
   	var obj = buff.split(',');
   	obj.push(rinfo);
   	if (obj[0]=='pong') {
   		console.log(multicastIDs[0]+' :'+obj[0]+' ,'+(trec-obj[1])+'ms ,'+obj[2]+','+obj[3]);
   	}
});
*/
broadcast();

function broadcast() {
	tnow = new Date().getTime();
	send(cmd,p[0],p[1]);	
    console.log(r+cmd+ ','+multicastIDs[0]+',' + cmd+','+p[0]+','+p[1]);
	r++;
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

