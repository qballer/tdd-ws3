'use strict';

var express = require('express');
var sourcemaps = require("gulp-sourcemaps");
var app = express();
var server;
var state = 'joining';
var redis = require('then-redis');
var itemToSnipe = process.argv[2];
var SNIPER_ID = 'sniper';

function main() {
	function joinAuction(sniperId) {
		client.publish(itemToSnipe, JSON.stringify({ bidder: sniperId, type: 'join' }));
	}

	var client = redis.createClient();
	joinAuction(SNIPER_ID);
	var listener = redis.createClient();
	listener.subscribe(itemToSnipe);

	listener.on('message', function (channel, msg) {
		state = 'lost';
	});

	app.get('/', function (req, res) {
		res.send('<html><head></head><body>\n\t\t<div id="status">' + state + '</div>\n\t\t</body></html>');
	});
	server = app.listen(8888, function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('Example app listening at http://%s:%s', host, port);
	});
}

main();
//# sourceMappingURL=main.js.map