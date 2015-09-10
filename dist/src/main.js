'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

require('source-map-support').install();

var AuctionMessageTranslator = require('../src/AuctionMessageTranslator');
var express = require('express');
var app = express();
var server;
var status = 'joining';
var redis = require('then-redis');
var itemToSnipe = process.argv[3];
var sniperId = process.argv[2];

var UNUSED_CHAT = null;

var client = redis.createClient();

var AuctionEventListener = (function () {
	function AuctionEventListener() {
		_classCallCheck(this, AuctionEventListener);
	}

	_createClass(AuctionEventListener, [{
		key: 'auctionClosed',
		value: function auctionClosed() {
			status = 'lost';
		}
	}, {
		key: 'currentPrice',
		value: function currentPrice(price, increment) {
			status = 'bidding';
			//if (sniperId !== parsed.bidder){
			client.publish(itemToSnipe, JSON.stringify({ event: 'bid', price: price + increment, bidder: sniperId }));
			//}
		}
	}]);

	return AuctionEventListener;
})();

function main() {
	client.publish(itemToSnipe, 'join');
	var subscriber = redis.createClient();
	var listener = new AuctionEventListener();
	var auctionMessageTranslator = new AuctionMessageTranslator(listener);
	subscriber.subscribe(itemToSnipe);
	subscriber.on('message', function (channel, msg) {
		auctionMessageTranslator.processMessage(UNUSED_CHAT, msg);
	});

	app.get('/', function (req, res) {
		res.send('<html><body><div id="status">' + status + '</div></body></html>');
	});
	server = app.listen(8888, function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('Example app listening at http://%s:%s', host, port);
	});
}

main();
//# sourceMappingURL=main.js.map