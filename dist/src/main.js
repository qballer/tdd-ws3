'use strict';

var express = require('express');
var sourcemaps = require("gulp-sourcemaps");
var app = express();
var server;
var state = 'joining';
var redis = require('then-redis');
var itemToSnipe = process.argv[2];

function main() {
	var client = redis.createClient();
	client.publish(itemToSnipe, 'join');
	var listener = redis.createClient();
	listener.subscribe(itemToSnipe);

	listener.on('message', function (channel, msg) {
		state = msg;
	});

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
//# sourceMappingURL=main.js.map