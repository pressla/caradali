var ommands = [
	['switch','G1', 0],
	['switch','G1', 10],
	['switch','G1', 50],
	['switch','G1', 65],
	['switch','G1', 100],

];

var commands = [
	['sendcmd',0xFF, 0x00],
	['sendcmd',0xFF, 0x08],
	['sendcmd',0xFF, 0xA0],
	['sendcmd',0xFF, 0x21],
	['sendcmd',0xFF, 0x40],
	['sendcmd',0xFF, 0xB0],
	['sendcmd',0xFF, 0x08],
	['sendcmd',0xFF, 0xA0],
	['sendcmd',0xFF, 0x08],
	['sendcmd',0xFF, 0xA0],
	['sendcmd',0xFF, 0x08],
	['sendcmd',0xFF, 0xA0],
	['sendcmd',0xFF, 0x08],
	['sendcmd',0xFF, 0xA0],
	['sendcmd',0xFF, 0x21],
	['sendcmd',0xFF, 0x41],
	['sendcmd',0xFF, 0xB1],
	['sendcmd',0xFF, 0xB0],
	['sendcmd',0xFF, 0xB1],
	['sendcmd',0xFF, 0xB0],
	['sendcmd',0xFF, 0xB1],
	['sendcmd',0xFF, 0xB0],
	['sendcmd',0xFF, 0xB1],
	['sendcmd',0xFF, 0xB0],
	['sendcmd',0xFF, 0x10],
	['sendcmd',0xFF, 0xA0],
	['sendcmd',0xFF, 0x11],
	['sendcmd',0xFF, 0xA0],
	['sendcmd',0xFF, 0x10],
	['sendcmd',0xFF, 0xA0],
	['sendcmd',0xFF, 0x11],
	['sendcmd',0xFF, 0xA0],
	['sendcmd',0xFF, 0x10],
	['sendcmd',0xFF, 0xA0],
	['sendcmd',0xFF, 0x11],
	['sendcmd',0xFF, 0xA0],


];


var r=0;
var dgram 		= require('dgram'); 
var pub 		= dgram.createSocket("udp4"); 
var multicastID = '239.1.1.200';
var targetPort	= 61088;

pub.bind(12344,function() {			//useless, but I need to set the number of hops to maxx
	pub.setMulticastTTL(255);
});

pub.on('message', function (buf, rinfo) {   
  	var msg = new Buffer(buf).toString('ascii');
  	console.log('Query received :'+msg);
  	
});


setInterval(function(){
	if (r==99) return;
	send(commands[r][0], commands[r][1],commands[r][2]);	
	if (commands[r][2]>=255 && commands[r][2]<=128) {
		sleep(50);
		send(commands[r][0], commands[r][1],commands[r][2]);	
	}
	var adr = (("0" + commands[r][1].toString(16)).substr(-2)).toUpperCase();
	var pay = (("0" + commands[r][2].toString(16)).substr(-2)).toUpperCase();
    console.log("Sent "+ commands[r][0]+adr+pay);
	r++;
	if (r>=commands.length) r=99;

}, 1000);

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function send () {
  var args = [].slice.call(arguments);
  var fn = typeof args[args.length - 1] == 'function' ? args.pop() : null;

  var msg = (args.join(','));
  var buf = new Buffer(msg);
  //console.log(msg);
  pub.send(buf, 0, buf.length, targetPort, multicastID, fn);
};

