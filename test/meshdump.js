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
p.push(socket.subscribe('mpath'));
p.push(socket.subscribe('ifconfig'));
//p.push(socket.subscribe('info'));
//p.push(socket.subscribe('top'));
p.push(socket.subscribe('error'));
p.push(socket.subscribe('meshlog'));
p.push(socket.subscribe('module'));

var nodes =[];

for (channel in p) {
	p[channel].watch(function (data) {
		try {mactable = JSON.parse(fs.readFileSync(mactablefilename, 'utf8'));} catch (e){console.log('file read error '+e); mactable = {nodes:[]};}
		try {var nodes = JSON.parse(fs.readFileSync('./meshdump2', 'utf8'));} catch(err) {nodes =[];}
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
			if (header.content == 'ifconfig') {
				try {
					var vpnip = b['vpn_acc'][1].address.replace('\"','');	 
					var i = _.findKey(nodes, 'node_id', data[0].node_id);
					if (i) {
						nodes[i].vpnip = vpnip;
					}
				} catch (e) {}
			}
			if (header.content == 'mpath') {
				var i = _.findKey(nodes, 'node_id', data[0].node_id);
				if (i) {
					nodes[i].meshdest = b.length-2;
				}
			}
			if (header.content == 'error') {
				var i = _.findKey(nodes, 'node_id', data[0].node_id);
				if (i) {
					nodes[i].error = error + 1;
				}
			}
			if (header.content == 'state') {
				var i = _.findKey(nodes, 'node_id', data[0].node_id);
				if (i) {
					nodes[i].cversion = b;
				}
			}
	 
	 
	 
	 
		var key = _.findKey(nodes, 'node_id', data[0].node_id);
	 	if (!key) {
	 		nodes.push(data[0]);
	 	}
	 
	 	for (n in nodes) {
	 		dump = n+'\t';
	 		dump = dump+nodes[n].node_id+'\t';
	 		dump = dump+nodes[n].cversion+'\t';
	 		dump = dump+nodes[n].wanip+'\t';
	 		dump = dump+nodes[n].vpnip+'\t';
	 		dump = dump+nodes[n].meshdest+'\t';
	 		console.log(dump);
		 	if (bwritemactable == true) writemactable(nodes[n].node_id);
	 	}
	 	fs.writeFileSync('./meshdump2',JSON.stringify(nodes));
	});
}

function writemactable(mac) { //'wifi', wireless.radio0.channel, 3
    //mactable.nodes.push(entry);
    //groups["JSON"]["ARRAY"].filter(function(v){ return v["id"] == "qb45657s"; }); 
    //console.log(JSON.stringify(mactable,null,1));
    var found = _.findKey(mactable.nodes,'node_id',mac); //does this node exist?
   	//console.log(found);
    if (found) {
    	for (i in entries) {
    		var pattern = {};
    		pattern.param = entries[i].param.split('=')[0];
    		pattern.type = entries[i].type;
	    	var paramex = _.findKey(mactable.nodes[found].param, pattern); //does parameter exist?
	    	//var pparex = _.findKey(mactable.nodes[found].param, 'param', entries[i].param.split('=')[0]); //does parameter exist?
	    	//for (x in mactable.nodes[found].param) {
	    	if (paramex) {
		    	//console.log (mactable.nodes[found].param[x].type+'---'+ pattern.type +'---'+ mactable.nodes[found].param[x].param +'---'+ pattern.param) 
		    	//if (mactable.nodes[found].param[x].type == pattern.type && mactable.nodes[found].param[x].param == pattern.param) {
			    	mactable.nodes[found].param[paramex].type = entries[i].type;
			    	mactable.nodes[found].param[paramex].param = entries[i].param.split('=')[0];
			    	mactable.nodes[found].param[paramex].value = entries[i].param.split('=')[1];
		    }else {		// add a new parameter otherwise
				    var p = {};
				    p.type = entries[i].type; 
				    p.param = entries[i].param.split('=')[0]; 
				    p.value = entries[i].param.split('=')[1]; 
				    mactable.nodes[found].param.push(p);
		    }

	    	
	    	//}
    	}

    }else {	//not yet in table, create new
	    var entry = {};
	    entry.node_id = mac;
	    entry.param = [];
    	mactable.nodes.push(entry);
    	//console.log(mactable.nodes.length+'---'+JSON.stringify(entry)+'----'+JSON.stringify(mactable));
	    //console.log(mactable.nodes[mactable.nodes.length-1]);
    	for (i in entries) {
		    var p 	= {};
		    p.type 	= entries[i].type; 
		    p.param = entries[i].param.split('=')[0]; 
		    p.value = entries[i].param.split('=')[1];
	    	mactable.nodes[mactable.nodes.length-1].param.push(p);
	    }

    }
    //console.log(JSON.stringify(mactable,null,4));
    try {fs.writeFileSync(mactablefilename, JSON.stringify(mactable,null,4))} catch (e) {}
}

function readmactable() {


}

process.on('uncaughtException', function(err) {
    // handle the error safely
	console.log('error', ': UNCAUGHT EXCEPTION '+err);
})


