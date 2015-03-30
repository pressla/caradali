
var wrt = require('wrt');
require('m2m-socket-pipe');
var m2mDali = require('m2m-dali');

var daliOptions = {
	multicastID: '239.1.1.200',
	targetPort:  61088
};

var app = {
}

app.logger = {};
createLogger (wrt.ifconfig().apif[1].MAC);

app.logger.log = function (message, payload){
	m2mlog ('lightcontrol', message, payload);
}
m2mlog('lightcontrol','info', 'app.logger.log active');

m2mDali.initPlugin(app, daliOptions, initComplete);

function initComplete(){
	app.logger.log('info', '[initComplete]');
	console.log('m2m-lightcontrol[initComplete]');
}
