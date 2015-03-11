
var Hapi    = require('hapi');
var Good    = require('good');
var t       = require('joi');

var fs      = require('fs');

var activevpn = {
        mac:'',
        vpn:'down'
}

var server = new Hapi.Server();
server.connection({ port: 8051 });

// auto update of firmware and config files. the node is fetching the json file and compares if new versions exist. if so, it 
// downloads the files and resets the device
// TODO: ssl
server.route({
    method: 'GET',
    path: '/config',
    handler: function (request, reply) {
	var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
	reply (JSON.stringify(config));
    }
});

// node is sending this request to ask server if a vpn connection shall be opened between server and node. server replys ok if yes
//otherwise it replys "no" and node stays on its own. This is used for manual service request and remote access to the router
// TODO: this is a backdoor and must be ssl and authenticated too.
server.route({
    method: 'GET',
    path:'/vpnrequest', 
    handler: function (request, reply) {
	var res = {mac:'2332323', vpn:'down'};
	res.mac = request.query.mac;
	
	if (request.query.mac == activevpn.mac) {
		res.mac = activevpn.mac;
		res.vpn = activevpn.vpn;
	}

	console.log(JSON.stringify(res));
        reply(JSON.stringify(res));
    }
});

server.route({
    method: 'GET',
    path:'/vpnconfigure',
    config: {
        validate: {
            query: {
                param1: t.string().insensitive().required()
            }
        },
        tags: ['admin', 'api'],
        description: 'this function allows to enable7disable vpn connectivity',
        notes: 'test note bla'
    },

    handler: function (request, reply) {
	var res = {mac:'???', vpn:'down', res:'ok'};

	if (request.query.mac) {
		activevpn.mac = request.query.mac;
		activevpn.vpn = request.query.vpn;
		res.mac = activevpn.mac;
		res.vpn = activevpn.vpn;
	} else {
		res.res = 'bad request';
	}

       console.log(JSON.stringify(res));
       reply(JSON.stringify(res));
    }
});

// serve a read only repository for config files and firmware
// TODO: use ssl and authentication to prevent theft. The trick must be that if someone hacks client he cannot get access to it either.
// possible solution is, if the device is altered the server finds out and can bann the device, so the password is useless for that 
// hacked client.
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: './data',
            listing: true
        }
    }
});

//**************************  plugins registration  ************************
//register lout plugin. document server routes
server.register({ register: require('lout') }, function(err) {
    });

//register poop, a exception logger and cleaner
server.register({
    register: require('m2mwifi-dali'),
    options: {
        multicastID: '239.1.1.200'

    }
}, function(err)  {if (err) throw err;}
);

//register Good plugin for logging
server.register({
    register: Good,
    options: {
        reporters: [{
            reporter: require('good-console'),
            args:[{ log: '*', response: '*' }]
        }]
    }
}, function (err) {
    if (err) { throw err;} // something bad happened loading the plugin

    server.start(function () {
		
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});
