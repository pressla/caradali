//Alex Pressl for imitrix GmbH

// Declare internals
var scluster = require('socketcluster-client');
var sPipe = require('m2m-socket-pipe');
var Dgram = require('dgram');
var Emitter = require('events').EventEmitter;
var Relay = new Emitter();
var sub = Dgram.createSocket('udp4');
var pub = Dgram.createSocket('udp4');

var internals = {
	initialized:false,
	listeningPort:  8060
};
var scClient = require('socketcluster-client');
var options = {
 protocol: 'http',
 hostname: 'acc.ledwifi.de',
 port: 8051,
 autoReconnect: true
};

var socket = scClient.connect(options);
var perfChannel   = socket.subscribe('perf');
var meshChannel   = socket.subscribe('meshlog');
var moduleChannel = socket.subscribe('module');

var myApp = {
}

myApp.logger = {};
sPipe.createLogger ('acc.ledwifi.de');

myApp.logger.log = function (message, payload){
	sPipe.m2mlog ('socket-server', message, payload);
}

sPipe.m2mlog('socket-server','info', 'app.logger.log active');


   	myApp.logger.log('info','m2m-dali.initBegin');

	sub.bind(internals.listeningPort, function () {
    	myApp.logger.log('info','server registered to listen to '+internals.listeningPort);
	});

	sub.on('listening', function () {
    	var address = sub.address();
    	//myApp.logger.log('info',address);
    	myApp.logger.log('info','UDP listening ' + address.address + ":" + address.port);
	});

	sub.on('message', function (buf, rinfo) {
    	var obj = [];
		var sb = new Buffer(buf).toString('ascii');    	
    	obj.push(sb)
    	obj.push(rinfo);
    	var payload = JSON.parse(obj[0]);
    	socket.publish(payload[0].content, payload);
    	//console.log(payload);
    	var p = payload[0];
    	var b = payload[1];
    	if (p.content == 'ifconfig' || p.content == 'top' || p.content == 'meshlog') {
    		var rep = '['+p.node_id+']: ';
    		switch (p.content) {
    			case 'ifconfig':
    				rep = rep + ' WAN:'+b['br-wan'][1].address.replace('\"','');
    				rep = rep + ' Rx:'+b['meshif'][1].Rx_packets;
    				rep = rep + ' Tx:'+b['meshif'][1].Tx_packets;
					break;
    			case 'meshlog':
    				rep = rep + ' MESH:'+p['mesh_id'];
    				rep = rep + ' COUNT:'+p.length-1;
    				break;
    			case 'top':
		    		console.log('logs' + 'perf data received ['+payload[0].node_id+']: '+ payload[0].content);
    				break;
  				default:
  					rep = rep + "default";
    		}
    		
			console.log(rep);    		
    		
    	} else {
	    	console.log(obj[0].replace('\n\r', ''));
    	}
    	//myApp.logger.log('debug',JSON.stringify(obj));
    	//plugin.log('info',obj);
    	Relay.emit(buf[0].content, obj);    //Fire the event for each command
	});




Relay.on('iperf', function (msg) {
    myApp.logger.log('info','iperf '+obj[0][0].node_id);
}); 











function m2mUtilsApplyToDefaults(current, update){
	for (var key in update) {
	   if (update.hasOwnProperty(key)) {
	      current[key] = update[key];
	      myApp.logger.log('info','[m2mUtilsApplyToDefaults]: '+key+'  = '+update[key]);
	   }
	}
    current.initialized = true;
}
