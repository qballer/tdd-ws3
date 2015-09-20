'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

require('source-map-support').install();

var AuctionMessageTranslator = require('../src/AuctionMessageTranslator');
var AuctionSniper = require('../src/AuctionSniper');
var Auction = require('../src/Auction');
var express = require('express');
var app = express();
var server;
var status = 'joining';
var redis = require('then-redis');
var itemToSnipe = process.argv[3];
var sniperId = process.argv[2];

var UNUSED_CHAT = null;

var client = redis.createClient();

var SniperStateDisplayer = (function () {
	function SniperStateDisplayer() {
		_classCallCheck(this, SniperStateDisplayer);
	}

	_createClass(SniperStateDisplayer, [{
		key: 'showStatus',
		/* implements SniperListener*/
		value: function showStatus(show_status) {
			status = show_status;
		}
	}, {
		key: 'sniperLost',
		value: function sniperLost() {
			this.showStatus('lost');
		}
	}, {
		key: 'sniperBidding',
		value: function sniperBidding() {
			this.showStatus('bidding');
		}
	}, {
		key: 'sniperWinning',
		value: function sniperWinning() {
			this.showStatus('winning');
		}
	}]);

	return SniperStateDisplayer;
})();

function main() {
	var subscriber = redis.createClient();
	var auction = new Auction(itemToSnipe, sniperId, client);
	var auctionMessageTranslator = new AuctionMessageTranslator(new AuctionSniper(auction, new SniperStateDisplayer()));
	auction.join();
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