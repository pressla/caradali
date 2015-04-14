//setconfig

var request = require('request');
var fs = require('fs');
var colors = require('colors');
var _ = require('lodash');

var allmacsfilename = './allmacs.json';

var allmacs=0;
try {allmacs = JSON.parse(fs.readFileSync(allmacsfilename, 'utf8'));} catch (e){console.log('file read error '+e); console.log('freak out !!!!');process.exit()}

var entry ={};
if (process.argv.length == 5) { 

	entry.role = process.argv[2];
	entry.type = process.argv[3];
	entry.filename = process.argv[4];
}else
{
	console.log ('setconfig <role | all | id | default> <config | firmware> <filename>');
	console.log('set role to update all of a role, all or specific node_ids specified in allmacs file - update must be set to true');
	process.exit();
}

if (entry.role=='default'){
	var s = 'http://acc.ledwifi.de/setconfig?mac='+'00:00:00:00:00:00';
	if (entry.type == 'config') 	s=s+'&config='+entry.filename;
	if (entry.type == 'firmware') 	s=s+'&path='+entry.filename;

	console.log(s);
	request(s, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var r = JSON.parse(body);
			if (r.result=='accepted') {
				console.log((i+' setconfig ok: '+r.sid).green);
			}
	  	} else{
	  		console.log(('http error: '+error).red);
	  	}
	  	process.exit();
	});
}

for (imac in allmacs.nodes) {
	var n = allmacs.nodes[imac];
	if (entry.role==n.role || entry.role=='all') {
		n.update=true;
		if (entry.type == 'firmware') 	n.firmware = entry.filename;
		if (entry.type == 'config') 	n.config = entry.filename;
	}
	if (n.update==true) {
		var s = 'http://acc.ledwifi.de/setconfig?mac='+n.node_id;
		if (n.config != '') 	s=s+'&config='+n.config;
		if (n.firmware != '') 	s=s+'&path='+n.firmware;
		//if (n.name != '') 		s=s+'&name='+n.name;
		console.log(s);
		allmacs.nodes[imac].update=false;
		
		request(s, function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var r = JSON.parse(body);
				if (r.result=='accepted') {
					var i = _.findKey(allmacs.nodes, 'node_id', r.sid.toLowerCase());
					if (i)
						allmacs.nodes[i].update=false;
					console.log((i+' setconfig ok: '+r.sid).green);
				}
		  	} else{
		  		console.log(('http error: '+error).red);
		  	}
			fs.writeFileSync(allmacsfilename, JSON.stringify(allmacs,null,2))
		});
				
	}
}


