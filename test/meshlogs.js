//m2m-socket-sub.js
//Alex Pressl for imitrix GmbH 2015

var array = require('lodash/array');
var _ = require('lodash');
var fs = require('fs');
var bwritemactable = false;
var mactable = 0;

var mactablefilename = './mactablem2m.json';

var entries = [];
if (process.argv.length > 2) { //group~group_id wifi~myparam1=1 wifi~myparam2=2

	for (n in process.argv) {
		if (n>1) {
			var pair = process.argv[n].split('~');
			var entry ={};
			entry.type = pair[0];
			entry.param = pair[1];
			entries.push(entry);
		}
	}
	bwritemactable = true;
	//console.log(JSON.stringify(entries,null, 4));
}


var scClient = require('socketcluster-client');
var options = {
 protocol: 'http',
 hostname: 'acc.ledwifi.de',
 port: 8051,
 autoReconnect: true
};

var socket = scClient.connect(options);

var p   = [];
p.push(socket.subscribe('state'));
//p.push(socket.subscribe('mpath'));
//p.push(socket.subscribe('ifconfig'));
p.push(socket.subscribe('info'));
//p.push(socket.subscribe('top'));
p.push(socket.subscribe('error'));
//p.push(socket.subscribe('meshlog'));
p.push(socket.subscribe('module'));

var nodes =[];

for (channel in p) {
	p[channel].watch(function (data) {
		//console.log(JSON.stringify(data[0],null,2));//header
		//console.log(JSON.stringify(data[1],null,2));//body
	if (entries.length>0){
		if (data[0].node_id == entries[0].type)
		 	console.log(data[0].node_id)+' '+data[1]; 

	}else	 	
	 	console.log(data[0].node_id+' '+JSON.stringify(data[1])); 
	});
}

/*
process.on('uncaughtException', function(err) {
    // handle the error safely
	console.log('error', ': UNCAUGHT EXCEPTION '+err);
})


*/