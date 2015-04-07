//m2m_config.js
/*Author: jingjing wang for imitrix GmbH, 2015
 * Last Update: 03/28, 2015
 */

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


var mac, firmversion, configversion, config;
var fs = require('fs');
var exec=require('child_process').exec;
var critical = 0; //Set 1 when firmware upgrades

//read system data only once
readSystemData();

//start timers based on timer settings
setInterval(VPN_Setting, m2mParam.interval.checkRequestVPN+Math.random()*20000); VPN_Setting();
setInterval(Config_Setting, m2mParam.interval.checkConfig +Math.random()*20000); Config_Setting();

var socketlog=require('/usr/bin/m2m_socket_log.js');

socketlog.options.mac 			= mac;
socketlog.options.firmversion 	= firmversion;
socketlog.options.configversion = configversion;
socketlog.options.config 		= config;

socketlog.push(); //this will start the interval logging


function readSystemData() {
	try {mac = fs.readFileSync('/sys/class/ieee80211/phy0/macaddress', 'ascii').replace('\n','');} catch (e) {mac = 'c4:93:00:00:00:00';}
	try {firmversion = fs.readFileSync('/etc/openwrt_version', 'ascii').replace('\n','');} catch (e) {firmversion = '201503300808';}
	try {configversion = fs.readFileSync('/etc/config/config_version', 'ascii').replace('\n','');} catch (e) {configversion = firmversion;}
	try {config=JSON.parse(fs.readFileSync('/etc/config/m2mwifi', 'utf8'));} catch (e) {config = JSON.parse('{\"interval\":{\"firmware\":10, \"vpn\":10, \"socketlog\":10}}');}
}

/*
 * find() Function
 * Finds key value from the array
 */
function find (arr, key, val) 
{
  for (var ai, i = arr.length; i--;)
    if ((ai = arr[i]) && ai[key] == val)
      return ai;
  return null;
}

/*
 * compareVersions() Function
 * Usage:   compareVersions("0.1.3", ">", "");
 * Example: 0.1.3 > 0.1.4 false
 * 
 */
function compareVersions(v1, comp, v2) {
    "use strict";
    var v1parts = v1.split('.'), v2parts = v2.split('.');
    var maxLen = Math.max(v1parts.length, v2parts.length);
    var part1, part2;
    var cmp = 0;
    for(var i = 0; i < maxLen && !cmp; i++) {
        part1 = parseInt(v1parts[i], 10) || 0;
        part2 = parseInt(v2parts[i], 10) || 0;
        if(part1 < part2)
            cmp = 1;
        if(part1 > part2)
            cmp = -1;
    }
    return eval('0' + comp + cmp);
}
/*
 * VPN_Setting() Function
 * Enable/Disalbe SoftEtherVPN client according to its MAC address
 */
function VPN_Setting()
{
    var vpnrunning=0;
    var fs = require('fs');
    if (fs.existsSync('/var/run/vpnclient.pid')) vpnrunning=1;
    var httpoptions = {
	host: 'acc.ledwifi.de',
	port: 80,
	path: '/vpnrequest?mac='+mac,
	method: 'GET',
	headers: {'Content-Type': 'application/json'}
    };
    var http = require('http');
    var req = http.request(httpoptions, function(res)
    {
	var output = '';
	res.setEncoding('utf8');

	res.on('data', function (chunk) {
	    output += chunk;
	});

	res.on('end', function() {
	    var obj = JSON.parse(output);
	    if (obj.vpn == 'up' && !vpnrunning) exec('/etc/init.d/softethervpnclient start');
	    if (obj.vpn == 'down' && vpnrunning) exec('/etc/init.d/softethervpnclient stop');
	});
    });
    req.on('error', function(err) {/*console.log('error: ' + err.message);*/});req.end();
    
    setTimeout(function() {req.abort(); if (!critical) setTimeout(VPN_Setting, config.interval.vpn);}, 10000);
}
/*
 * Config_Setting() Function
 * Upgrades Device configs and Firmware
 */
function Config_Setting()
{
    var upgrade_path='/usr/bin/m2m_upgrade ';
    var httpoptions = {
	host: 'acc.ledwifi.de',
	port: 80,
	path: '/config?mac='+mac,
	method: 'GET',
	headers: {
	    'Content-Type': 'application/json'
	}
    };
    var http = require('http');
    function puts(error,stdout,stderr){sys.puts(stdout);}
    var req = http.request(httpoptions, function(res)
    {
	var output = '';
	//console.log(httpoptions.host + ':' + res.statusCode);
	res.setEncoding('utf8');
	res.on('data', function (chunk) {
	    output += chunk;
	});
	res.on('end', function() {
	      var obj = JSON.parse(output);
	      var caram = find(obj, 'name', 'image-carambola');
	      //Check Carambola Firmware Version
	      if (caram!=null)
	      {
		  var tmp = caram.path.split('/'); //extract parts from image-carambola/carambola2-32342abcd21321458-20150330.bin
		  tmp = tmp[tmp.length-1];
		  var hash = tmp.split('-')[1]; //md5sum
		  var ver = tmp.split('-')[2]; //201503300126.bin
		  ver=ver.split('.')[0]; //exclude .bin
		  if (compareVersions(ver,'>', firmversion)){
			upgrade_path+='1 ' + caram.path + ' ' + hash; //firmware upgrade mode=1
			critical = 1; //Expecting Restart
			exec(upgrade_path);
		  }
		  else
		  {
			tmp = caram.config.split('/'); //extract parts from config-carambola/config-1b31c4c2af8ee6af9df9eb06130c0206-201503301708.tar.gz.bin
			tmp = tmp[tmp.length-1];
			hash = tmp.split('-')[1]; //md5sum
			ver = tmp.split('-')[2]; //201503301025.tar.gz.bin
			ver = ver.split('.')[0]; //exclude .tar.gz.bin
			if (compareVersions(ver,'>', configversion)){
			      upgrade_path+='2 ' + caram.config + ' ' + hash; //configuration mode=2
			      critical = 1; //Expecting Restart
			      exec(upgrade_path);
			}
		  }
	      }
	});
    });
    req.on('error', function(err) {/*res.send('error: ' + err.message);*/});req.end();
    setTimeout(function() {req.abort(); if (!critical) setTimeout(Config_Setting, config.interval.firmware);}, 30000);
}
/*
 * Several Modules Here
 */
