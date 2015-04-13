var sPipe = require('m2m-socket-pipe');

	sPipe.createLogger('mysock');
var i=0;
var id = 0;
var t=function(){
	i++;
	sPipe.m2mlog ('M2Mwifi', 'error', 'payload '+i);
	if (i>1000) clearInterval(id);
}

id = setInterval(t,1000);
