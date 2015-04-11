//m2m-socket-sub.js
//Alex Pressl for imitrix GmbH 2015

var scClient = require('socketcluster-client');
var options = {
  protocol: 'http',
  hostname: 'acc.ledwifi.de',
  port: 8051,
  autoReconnect: true
};

var socket = scClient.connect(options);


var perfChannel 	  = socket.subscribe('perf');
var meshChannel   = socket.subscribe('meshlog');
var moduleChannel = socket.subscribe('module');

moduleChannel.watch(function (data) {
    console.log('module :\n'+JSON.stringify(data,null,2));
});

perfChannel.watch(function (data) {
    console.log('perf :\n'+JSON.stringify(data,null,2));
});

meshChannel.watch(function (data) {
    console.log('meshlog:\n'+JSON.stringify(data,null,2));
});

//console.log(meshlog);

