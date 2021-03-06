//m2m-socket-sub.js
//Alex Pressl for imitrix GmbH 2015

var array = require('lodash/array');
var _ = require('lodash');
var fs = require('fs');
var coler = require('colors');
var exec		= require('child_process').exec;
var bwritemactable = false;
var mactable = 0;
var allmacs = 0;

var mactablefilename = './mactablem2m.json';
var allmacsfilename = './allmacs.json';

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

var update = true;
var nodes =[];
var mdumper = 'NO MESHDUMP COMING IN';
var dumper;
var droptable = 0;
for (channel in p) {
	p[channel].watch(function (data) {
		try {allmacs = JSON.parse(fs.readFileSync(allmacsfilename, 'utf8'));} catch (e){console.log('file read error '+e); console.log('freak out !!!!');allmacs = {nodes:[]};}
		//if (update==false) {
			try {mactable = JSON.parse(fs.readFileSync(mactablefilename, 'utf8'));} catch (e){console.log('file read error '+e); console.log('freak out !!!!');mactable = {nodes:[]};}
			try {var nodes = JSON.parse(fs.readFileSync('./meshdump2', 'utf8'));} catch(err) { console.log('freak out !!!!');nodes=[];}
		//}
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
				n = b.indexOf('switch G')
				if (n>=0)  //,"switch G1:00"
				{
					nodes[i].sw = b.substr(n+7,7);	
				}
			}
			if (header.content == 'mpath') {
				mdumper = header.node_id+'\n';
				nodes[i].meshdest = b.length-2;
				mdumper = mdumper+data[1].toString().replace(/,/g,'\n').replace(/ /g,'\t');
				//console.log(JSON.stringify(data[1],null,2));//body
				pushNetwork(data);
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
					nodes[i].gatemode = bs.hwmp_rootmode;
				}else	//old version
					nodes[i].cversion = b;
			}
	 
	 
	 
	 
 		dumper = '\n\n\n\n'+meshwork.length+'\n'+mdumper.green+'\n\n';
	 	
 		dump = _.padLeft('CNT',3);
 		dump = dump+_.padLeft('MAC',18);
 		dump = dump+' '+_.padRight('VERSION',14);
 		dump = dump+_.padRight('WAN IP',16);
 		dump = dump+_.padRight('VPN IP',16);
 		dump = dump+_.padLeft('MESH',4);
 		dump = dump+_.padLeft('DALI',8);
 		dump = dump+_.padLeft('ERR',5);
 		dump = dump+_.padLeft('CH',3);
 		dump = dump+_.padLeft('GT',3);
 		dump = dump+_.padLeft('MESH_ID',10);
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
//	 						if (!nodes[n].dali) nodes[n].dali = '---'
//	 		dump = dump+_.padLeft(nodes[n].dali,5);
	 						if (!nodes[n].sw) nodes[n].sw = '---'
	 		dump = dump+_.padLeft(nodes[n].sw,8);
	 						if (!nodes[n].error) nodes[n].error = 0;
	 		dump = dump+_.padLeft(nodes[n].error,5);

	 						if (!nodes[n].channel) nodes[n].channel = '-';
	 		dump = dump+_.padLeft(nodes[n].channel,3);
	 						if (!nodes[n].gatemode) nodes[n].gatemode = '-';
	 		dump = dump+_.padLeft(nodes[n].gatemode,3);
	 						if (!nodes[n].mesh_id) nodes[n].mesh_id = '---';
	 		dump = dump+_.padLeft(nodes[n].mesh_id,10);

	 		if (nodes[n].gatemode >1 && nodes[n].gatemode <=4)
	 			dumper= dumper+((dump).red+'\n');
	 		else
	 			dumper= dumper+((dump)+'\n');

	 		if (bwritemactable == true) writemactable(nodes[n].node_id);
	 		writeallmacs(nodes[n].node_id);
		 	
	 	}
	 	dumper = dumper + '[S]SendFile to nodes [R]Reset meshlog [M]dump meshwork'.yellow;
 	  	//if (droptable!=0) {fs.unlink(mactablefilename);fs.unlink('./meshdump2'); droptable=0;}
	 	fs.writeFileSync('./meshdump2',JSON.stringify(nodes));
	});
	setInterval(terminal, 300);

}
function terminal(){
	if (update==true)
 		if (dumper) console.log(dumper);
}
process.stdin.setEncoding('utf8');


process.stdin.on('readable', function() {
	update=false;
  	var chunk = process.stdin.read();
  	if (chunk !== null) {
	    process.stdout.write('data: ' + chunk[0]);
		update = false;
	  	if (chunk.charAt(0) == 'c') {
	  		console.log(' SET CHANNEL '+chunk.substr(1,2));
	  	}
	  	if (chunk.charAt(0) == 'm') {
	  		console.log(' write MESHWORK '+chunk.substr(1,2));
	  		writeNetwork();
	  		//meshwork = [];
	  	}
	  	if (chunk.charAt(0) == 'r') {
			console.log(' RESET MESHDUMP '.red);
		  	nodes.length=0;
		  	mactable = {nodes:[]};
		 	fs.writeFileSync('./meshdump2',JSON.stringify(nodes));
			try {fs.writeFileSync(mactablefilename, JSON.stringify(mactable,null,4))} catch (e) {console.log(e);}		 	
		    //process.exit();
		}
		if (chunk.charAt(0) == 's') {
			console.log('SEND PARAMETERS TO NODES '.red);
		    try {
		        exec('node sendfile '+mactablefilename+' /etc/config/mactablem2m.json',
		        function(error,stdout,stderr) {
		        });
		    } catch (e) {
		        console.log('error, NO SUCCESS '.red+e);
		    }
		}
	}
  setTimeout(cont, 3000);
});

function cont() {
	update = true;
}
 

//var readline = require('readline');


function writeallmacs(mac) { //'wifi', wireless.radio0.channel, 3
    var found = _.findKey(allmacs.nodes,'node_id',mac); //does this node exist?
    if (found) {							//update an entry
    	var t=new Date().getTime();
    	allmacs.nodes[found].lastseen=t;
    	allmacs.nodes[found].name='node';	//add attribute to existing entry here
    } else {								//add new entry in table
    	var newone = {};
    	newone.node_id=mac;
    	newone.update=false;
    	newone.mesh_id='mesh1';
    	newone.role = 'node';
    	newone.firmware = '';
    	newone.config = '';
    	newone.name='node';
    	allmacs.nodes.push(newone);
    }
    try {fs.writeFileSync(allmacsfilename, JSON.stringify(allmacs,null,2))} catch (e) {console.log(e)}

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
		if ( mac != 'c4:93:00:00:bd:74' && mac != 'c4:93:00:02:98:8e' && mac != 'c4:93:00:02:98:85' && mac != 'c4:93:00:02:a4:f1' && mac != 'c4:93:00:02:a8:63' && mac != 'c4:93:00:02:98:6d') {
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
    try {fs.writeFileSync(mactablefilename, JSON.stringify(mactable,null,4))} catch (e) {console.log(e);}
}

function stripMAC(str) {
    return str.replace('c4:93:00', '');  
}

var meshwork = [];

function pushNetwork(data) {
	var found = -1;
	var mac = data[0].node_id;
	for (i in meshwork){
		if (meshwork[i][0].node_id == mac) {
			meshwork[i] = data;
			found = i;
		}		
	}

    //var found = _.findKey(meshwork,'node_id',mac); //does this node exist?
   	//console.log(found);
    if (found == -1) {
    	meshwork.push(data);
    }

}

function writeNetwork() {
	var regex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

	var wstream = fs.createWriteStream('meshwork.dot');
	wstream.write('strict digraph G {\n');
	for (m in meshwork) {
		var rec = meshwork[m];
		header=rec[0];
		if (header &&'content' in header)
			if (header['content'] === 'mpath') {
				console.log(header);
				body=rec[1];
				if ('node_id' in header) node_id = header['node_id'];
				for (idx in body) {
					path=body[idx];
					var res = path.split(" ");
					if (regex.test(res[0]))
						wstream.write("\"" + stripMAC(node_id) + "\" -> \"" + stripMAC(res[1]) + 
						"\" [label=\"to" + stripMAC(res[0]) + "\"]\n");
				}
			}
	}
	
	wstream.write("}");
	wstream.end();

}


/*
process.on('uncaughtException', function(err) {
    // handle the error safely
	console.log('error', ': UNCAUGHT EXCEPTION '+err);
})
*/

