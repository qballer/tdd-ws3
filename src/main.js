var express = require('express');
var app = express();
var server;
var state = 'joining';
var redis = require('then-redis')
var itemToSnipe = process.argv[2];

function main(){
	client = redis.createClient();
	client.publish(itemToSnipe, 'join');
	
	app.get('/', function (req, res) {
		res.send('<div id="status">' + state + '</div>');
	});
	server = app.listen(8888, function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('Example app listening at http://%s:%s', host, port);
	}); 
}

main();

