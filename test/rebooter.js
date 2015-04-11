//rebooter.js


var request = require('request');
var fs = require('fs');
var colors = require('colors');
var _ = require('lodash');
var exec		= require('child_process').exec;
var allmacsfilename = './allmacs.json';

var allmacs=0;
try {allmacs = JSON.parse(fs.readFileSync(allmacsfilename, 'utf8'));} catch (e){console.log('file read error '+e); console.log('freak out !!!!');process.exit()}

var bootme = function() {

	var cmdline = 'node sendbash.js \"reboot\"';
	console.log(cmdline)	
    exec(cmdline,
        function(error,stdout,stderr) {
            if (error) console.log('error'+' CANNOT SEND CMD: '+cmdline);
        }
    );

}

bootme();
setInterval(bootme, 100000);

