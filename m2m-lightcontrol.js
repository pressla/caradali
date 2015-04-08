//Alex Pressl for imitrix GmbH

var sPipe = require('m2m-socket-pipe');
var m2mDali = require('m2m-dali');
var fs = require('fs');

var daliOptions = {
	multicastID: '239.1.1.200',
	targetPort:  61088
};

var app = {}
app.logger = {};

try {app.node_id = fs.readFileSync('/sys/class/ieee80211/phy0/macaddress', 'ascii').replace('\n','');} catch (e) {app.node_id = 'c4:93:00:00:00:00';}

sPipe.createLogger (app.node_id);

app.logger.log = function (message, payload){
	sPipe.m2mlog ('lightcontrol', message, payload);
}
sPipe.m2mlog('lightcontrol','info', 'app.logger.log active');

m2mDali.initPlugin(app, daliOptions, initComplete);

function initComplete(){
	app.logger.log('info', '[initComplete]');
}

process.on('uncaughtException', function(err) {
    // handle the error safely
	app.logger.log('error', 'm2m-lightcontrol: UNCAUGHT EXCEPTION '+err);
})

