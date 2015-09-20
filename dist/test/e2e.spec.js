'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _thenRedis = require('then-redis');

var _thenRedis2 = _interopRequireDefault(_thenRedis);

require('source-map-support').install();
var Promise = require('bluebird');
var assert = require('chai').assert;

var childProcess = require('child_process');
var SNIPER_ID = 'sniper';
var REDIS_HOSTNAME = 'localhost';
var STATUS = 'STATUS';

var webdriverio = require('webdriverio');
var options = { desiredCapabilities: { browserName: 'phantomjs' } };

var statuses = {
	STATUS_JOINING: 'joining',
	STATUS_LOST: 'lost',
	STATUS_BIDDING: 'bidding'
};
var client;

var AuctionSniperDriver = (function () {
	// todo connect with browser to localhost http server, assert that html response shows expected status

	function AuctionSniperDriver() {
		_classCallCheck(this, AuctionSniperDriver);

		client = webdriverio.remote(options);
		this.first = true;
	}

	_createClass(AuctionSniperDriver, [{
		key: 'showsSniperStatus',
		value: function showsSniperStatus(statusText) {
			if (this.first) {
				client = client.init();
				this.first = false;
			}
			return client.url('http://localhost:8888').then(function () {
				return client.getText('#status');
			}).then(function (text) {
				assert.equal(text, statusText, 'wrong status');
			});
		}
	}, {
		key: 'stop',
		value: function stop() {
			client.end();
		}
	}]);

	return AuctionSniperDriver;
})();

var ApplicationRunner = (function () {
	function ApplicationRunner() {
		_classCallCheck(this, ApplicationRunner);

		this.driver = new AuctionSniperDriver(1000);
	}

	_createClass(ApplicationRunner, [{
		key: 'startBiddingIn',
		value: function startBiddingIn(auction) {
			// start main program with some arguments
			this.runningServer = childProcess.exec('node ./dist/src/main.js ' + SNIPER_ID + ' ' + auction, function (error, stdout) {
				console.log(stdout);
				console.log(error);
			});
			return this.driver.showsSniperStatus(statuses.STATUS_JOINING);
		}
	}, {
		key: 'showsSniperHasLostAuction',
		value: function showsSniperHasLostAuction() {
			return this.driver.showsSniperStatus(statuses.STATUS_LOST);
		}
	}, {
		key: 'hasShownSniperIsBidding',
		value: function hasShownSniperIsBidding() {
			return this.driver.showsSniperStatus(statuses.STATUS_BIDDING);
		}
	}, {
		key: 'stop',
		value: function stop() {
			this.runningServer.kill('SIGINT');
			this.driver.stop();
		}
	}]);

	return ApplicationRunner;
})();

var FakeAuctionServer = (function () {
	function FakeAuctionServer(itemId) {
		var _this = this;

		_classCallCheck(this, FakeAuctionServer);

		this.count = 0;
		this.itemId = itemId;
		this.redisListener = _thenRedis2['default'].createClient();
		this.redisPublisher = _thenRedis2['default'].createClient();
		this.redisListener.on('message', function (channel, msg) {
			_this.count += 1;
			_this.message = msg;
		});
	}

	_createClass(FakeAuctionServer, [{
		key: 'hasRecievedJoinRequestFromSniper',
		value: function hasRecievedJoinRequestFromSniper() {
			assert(this.count > 0, 'did not receive a message');
			assert.equal(this.message, 'join', 'message mismatch');
			return new Promise(function (res, rej) {
				res();
			});
		}
	}, {
		key: 'hasReceivedBid',
		value: function hasReceivedBid(bid, sniperId) {
			var parsedMessage = JSON.parse(this.message);
			assert.equal(parsedMessage.event, 'bid', 'event mismatch');
			assert.equal(parsedMessage.bidder, sniperId, 'bidder mismatch');
			assert.equal(parsedMessage.price, bid, 'price mismatch');
			return new Promise(function (res, rej) {
				res();
			});
		}
	}, {
		key: 'announceClosed',
		value: function announceClosed() {
			return this.redisPublisher.publish(this.itemId, JSON.stringify({ event: "closed" }));
		}
	}, {
		key: 'startSellingItem',
		value: function startSellingItem() {
			return this.redisListener.subscribe(this.itemId);
		}
	}, {
		key: 'reportPrice',
		value: function reportPrice(price, increment, bidder) {
			return this.redisPublisher.publish(this.itemId, JSON.stringify({ event: 'price', price: price, increment: increment, bidder: bidder }));
		}
	}]);

	return FakeAuctionServer;
})();

describe('the auction sniper', function () {
	var auction;
	var application;
	beforeEach('initialize auction server and application runner objects', function () {
		auction = new FakeAuctionServer('item-5347');
		application = new ApplicationRunner();
	});

	it('joins an auction untill it closes', function () {
		return auction.startSellingItem().then(function () {
			return application.startBiddingIn('item-5347');
		}).then(function () {
			return auction.hasRecievedJoinRequestFromSniper();
		}).then(function () {
			return auction.announceClosed();
		}).then(function () {
			return application.showsSniperHasLostAuction();
		});
	});

	it('sniper makes a higher bid but loses', function () {
		return auction.startSellingItem().then(function () {
			return application.startBiddingIn('item-5347');
		}).then(function () {
			return auction.hasRecievedJoinRequestFromSniper();
		}).then(function () {
			return auction.reportPrice(1000, 98, "other bidder");
		}).then(function () {
			return application.hasShownSniperIsBidding();
		}).then(function () {
			return auction.hasReceivedBid(1098, SNIPER_ID);
		}).then(function () {
			return auction.announceClosed();
		}).then(function () {
			return application.showsSniperHasLostAuction();
		});
	});

	it('sniper wins an auction by bidding higher', function () {
		return auction.startSellingItem().then(function () {
			return application.startBiddingIn('item-5347');
		}).then(function () {
			return auction.hasRecievedJoinRequestFromSniper();
		}).then(function () {
			return auction.reportPrice(1000, 98, "other bidder");
		}).then(function () {
			return application.hasShownSniperIsBidding();
		}).then(function () {
			return auction.hasReceivedBid(1098, SNIPER_ID);
		}).then(function () {
			return auction.reportPrice(1098, 97, SNIPER_ID);
		}).then(function () {
			return application.hasShownSniperIsWinning();
		}).then(function () {
			return auction.announceClosed();
		}).then(function () {
			return application.showsSniperHasWonAuction();
		});
	});

	afterEach('stop application', function () {
		application.stop();
	});
});
//# sourceMappingURL=e2e.spec.js.map