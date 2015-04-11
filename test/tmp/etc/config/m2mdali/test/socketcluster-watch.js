//m2m-socket-sub.js
//Alex Pressl for imitrix GmbH 2015

var array = require('lodash/array');
var _ = require('lodash');
var fs = require('fs');

var scClient = require('socketcluster-client');
var options = {
 protocol: 'http',
 hostname: 'acc.ledwifi.de',
 port: 8051,
 autoReconnect: true
};

var socket = scClient.connect(options);

var p   = [];
p.push(socket.subscribe('perf'));
p.push(socket.subscribe('mpath'));
p.push(socket.subscribe('ifconfig'));
p.push(socket.subscribe('info'));
p.push(socket.subscribe('top'));
p.push(socket.subscribe('error'));
p.push(socket.subscribe('meshlog'));
p.push(socket.subscribe('module'));

var nodes =[];

for (channel in p) {
	p[channel].watch(function (data) {
		try {var nodes = JSON.parse(fs.readFileSync('./meshdump', 'utf8'));} catch(err) {nodes =[];}
		console.log(JSON.stringify(data[0],null,2));
		console.log(JSON.stringify(data[1],null,2));
		var header = data[0];
		var b = data[1];
			if (header.content == 'ifconfig') {
				var wanip = b['br-wan'][1].address.replace('\"','');	 
				var i = _.findKey(nodes, 'node_id', data[0].node_id);
				if (i) {
					nodes[i].wanip = wanip;
				}
			}
			if (header.content == 'mpath') {
				var i = _.findKey(nodes, 'node_id', data[0].node_id);
				if (i) {
					nodes[i].meshdest = b.length-2;
				}
			}
	 
	 
	 
	 
		var key = _.findKey(nodes, 'node_id', data[0].node_id);
	 	if (!key) {
	 		nodes.push(data[0]);
	 	}
	 
	 	for (n in nodes) {
	 		dump = n+'\t';
	 		dump = dump+nodes[n].node_id+'\t';
	 		dump = dump+nodes[n].wanip+'\t';
	 		dump = dump+nodes[n].meshdest+'\t';
	 		console.log(dump);
	 	}
	 	fs.writeFileSync('./meshdump',JSON.stringify(nodes));
	});
}

