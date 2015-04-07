//m2m_socket_log.js
//Alex Pressl for imitrix GmbH

var sPipe = require('m2m-socket-pipe');
var wrt			= require('wrt');
var fs			= require('fs');
var os 			= require('os');
var exec		= require('child_process').exec;


//internals
var app = {}
app.logger = {};
var top			= {};
var meshlog 	= {};
var header 		= {};
var prot 		= [2];
var ifconfig 	= wrt.ifconfig();
var m2mParam;
try {
	m2mParam	= require('/etc/config/m2m_param');
} catch(err) {

	m2mParam =  {
		interval: {
			checkRequestVPN:20000,
			checkFirmware:30000,
			checkConfig:45000,
			ProcessData:3600000,
			Passport:86400000,
			MeshIf:300000
		}
	}
}


//interface

exports.options = options = {
	mac: 'c4:93:00:00:00:00',
	firmversion: 'unknown',
	configversion: 'unknown',
	config: ''
}

var site = {
	    last_error_description: "interfaces up",
	    last_error_title: "no error",
	    next: "08-04-2016",
	    node_description: "LED wifi",
	    node_name: "AIM Halle 2",
	    service: "unknown",
	    status: "active",
	    tracker: 0,
	    cpu:{}
	};


exports.push = function() {

	sPipe.createLogger (options.mac);
	sPipe.pipeoptions.consoleOutput = true;

	app.logger.log = function (message, payload){
		sPipe.m2mlog ('M2Mwifi', message, payload);
	}

	header.timestamp 	= new Date().getTime();
	header.node_id 		= options.mac;

	setInterval(pubProcess, m2mParam.interval.ProcessData+Math.random()*600000); pubProcess();

	setInterval(pubPassport, m2mParam.interval.Passport+Math.random()*600000); pubPassport();

	setInterval(pubMeshif, m2mParam.interval.MeshIf+Math.random()*600000); pubMeshif();
}



function pubMeshif() {
	ifconfig 	= wrt.ifconfig();

	exec("iw meshif station dump | awk -f /usr/bin/m2m_log.awk",
	function(error,stdout,stderr) {
		if (error == null) {

			meshlog = JSON.parse(stdout);

			app.logger.log('meshlog', meshlog);
		} else {
			meshlog[1] = error;
		}
	});

	app.logger.log('ifconfig', ifconfig);
}

function pubPassport() {

	site.os 	= {};
    site.os.hostname = os.hostname();
    site.os.type = os.type();
    site.os.platform = os.platform();
    site.os.arch = os.arch();


    site.version_firmware = 'M2Mwifi '+options.firmversion;

	exec("cat /proc/cpuinfo",
	function(error,stdout,stderr) {
		if (error == null) {
			var lines = stdout.split('\n');
			for (line in lines) {
				var l = lines[line].split(':');
				switch (l[0].trim()) {
					case 'system type':
						site.cpu.system = l[1].trim();
						break;
					case 'machine':
						site.cpu.machine = l[1].trim();
						break;
					case 'cpu model':
						site.cpu.model = l[1].trim();
						break;
				}
			}

		}
		else {
			site.cpu.cpuifo = error;
		}
	});

	exec("iw apif info",
	function(error,stdout,stderr) {
		if (error == null) {

			var lines = stdout.split('\t');
			//console.log(lines);
			site.apif = {};
			for (line in lines) {
				var l = lines[line].slice(0,-1); //strip '\n'
				var valpair = l.split(' ');
				site.apif[valpair[0].toString()] = valpair[1];
			}
		} else {
			site.apif = error;
		}

		app.logger.log('module', site);
	});
}


function pubProcess() {


    top.os = {};
    top.os.loadavg = os.loadavg();
    top.process = {};
    top.process.pid = process.pid;
    top.process.title = process.title;
    top.process.memoryUsage = process.memoryUsage();
    top.process.uptime = process.uptime();

	exec("free",
	function(error,stdout,stderr) {
		if (error == null) {

			var lines = stdout.split('\n');
		    top.os.totalmem = lines[1].substr(10,13).trim();
	    	top.os.freemem = (lines[1].substr(33,13)).trim();
			//console.log(top);
		} else {
			top.os.totalmem = error;
		}
		app.logger.log('top', top);
	});
}
