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
p.push(socket.subscribe('info'));
//p.push(socket.subscribe('top'));
p.push(socket.subscribe('error'));
p.push(socket.subscribe('meshlog'));
p.push(socket.subscribe('module'));

var nodes =[];
var mdumper = 'NO MESHDUMP COMING IN';

for (channel in p) {
	p[channel].watch(function (data) {
		try {mactable = JSON.parse(fs.readFileSync(mactablefilename, 'utf8'));} catch (e){console.log('file read error '+e); mactable = {nodes:[]};}
		try {var nodes = JSON.parse(fs.readFileSync('./meshdump2', 'utf8'));} catch(err) {nodes =[];}
		//console.log(JSON.stringify(data[0],null,2));//header
		//console.log(data[0].node_id +' '+JSON.stringify(data[1],null,2));//body
		var i = _.findKey(nodes, 'node_id', data[0].node_id);
	 	if (!i) {
	 		nodes.push(data[0]);
	 		i=nodes.length-1;
	 	}
		var header = data[0];
		var b = data[1];

			if (header.content == 'ifconfig') {
				var wanip = b['br-wan'][1].address.replace('\"','');	 
				nodes[i].wanip = wanip;
				try {
					var vpnip = b['vpn_acc'][1].address.replace('\"','');	 
					nodes[i].vpnip = vpnip;
				} catch (e) {}
			}
			if (header.content == 'info') {
				n = b.indexOf('\u0002DALI:FF')
				if (n>=0)  //,"DALI.BUS:\u0002DALI:FF00\u0003
				{
					nodes[i].dali = b.substr(n+6,4);	
				}
			}
			if (header.content == 'mpath') {
				mdumper = header.node_id+'\n';
				nodes[i].meshdest = b.length-2;
				mdumper = mdumper+data[1].toString().replace(/,/g,'\n');
				//console.log(JSON.stringify(data[1],null,2));//body
			}
			if (header.content == 'error') {
				try{nodes[i].error = nodes[i].error + 1;}catch(e){nodes[i].error=0;}
				nodes[i].errortxt = b;
			}
			if (header.content == 'state') {
				var d = typeof b;
				if (d != 'string') {
					var bs = (b);
					nodes[i].cversion = bs.version;
					nodes[i].restart_count = bs.restart_count;
					nodes[i].channel = bs.channel;
					nodes[i].ssid = bs.ssid;
					nodes[i].mesh_id = bs.mesh_id;
				}else	//old version
					nodes[i].cversion = b;
			}
	 
	 
	 
	 
 		var dumper = '\f'+mdumper+'\n\n';
	 	
 		dump = _.padLeft('cnt',3);
 		dump = dump+_.padLeft('MAC',18);
 		dump = dump+' '+_.padRight('VERSION',14);
 		dump = dump+_.padRight('WAN IP',16);
 		dump = dump+_.padRight('VPN IP',16);
 		dump = dump+_.padLeft('MESH',4);
 		dump = dump+_.padLeft('DALI',5);
 		dump = dump+_.padLeft('ERR',5);
 		dumper= dumper+(dump)+'\n';

	 	for (n in nodes) {
	 		dump = _.padLeft(n,3);
	 		dump = dump+_.padLeft(nodes[n].node_id,18);
	 		if (!nodes[n].cversion) nodes[n].cversion = '---'
	 		dump = dump+' '+_.padRight(nodes[n].cversion,13);
	 						if (!nodes[n].wanip) nodes[n].wanip = '---'
	 		try{var v=nodes[n].wanip.slice(0,15)}catch(e){v='---'}
	 		dump = dump+' '+_.padRight(v,16);
	 						if (!nodes[n].vpnip) nodes[n].vpnip = '---'
	 		try{var v=nodes[n].vpnip.slice(0,15)}catch(e){v='---'}
	 		dump = dump+_.padRight(v,16);
	 						if (!nodes[n].meshdest) nodes[n].meshdest = '---'
	 		dump = dump+_.padLeft(nodes[n].meshdest,4);
	 						if (!nodes[n].dali) nodes[n].dali = '---'
	 		dump = dump+_.padLeft(nodes[n].dali,5);
	 						if (!nodes[n].error) nodes[n].error = 0;
	 		dump = dump+_.padLeft(nodes[n].error,5);
	 		dumper= dumper+(dump)+'\n';
		 	if (bwritemactable == true) writemactable(nodes[n].node_id);
	 	}
	 	dumper = dumper + '[S]SendFile to nodes [C]Channel: 55 [I]SSID: AIMLED [R]Reset meshlog';
	 	console.log(dumper)
	 	fs.writeFileSync('./meshdump2',JSON.stringify(nodes));
	});
}

var keypress = require('keypress');
 
// make `process.stdin` begin emitting "keypress" events 
keypress(process.stdin);
 
// listen for the "keypress" event 
process.stdin.on('keypress', function (ch, key) {
  console.log('got "keypress"', key);
  if (key.name == 's') {
    process.exit();
  }
});
 
process.stdin.resume();

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
		if (mac != 'c4:93:00:02:18:d8' && mac != 'c4:93:00:00:bd:74') {
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


    }
    //console.log(JSON.stringify(mactable,null,4));
    try {fs.writeFileSync(mactablefilename, JSON.stringify(mactable,null,4))} catch (e) {}
}

function readmactable() {


}
/*
process.on('uncaughtException', function(err) {
    // handle the error safely
	console.log('error', ': UNCAUGHT EXCEPTION '+err);
})


*/