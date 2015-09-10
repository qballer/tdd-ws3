'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _thenRedis = require('then-redis');

var _thenRedis2 = _interopRequireDefault(_thenRedis);

// import theRealThing from '../src/main';

require('source-map-support').install();
var Promise = require('bluebird');
var assert = require('chai').assert;
var childProcess = require('child_process');
var SNIPER_ID = 'sniper';
var REDIS_HOSTNAME = 'localhost';
var STATUS = 'STATUS';

var webdriverio = require('webdriverio');
var options = { desiredCapabilities: { browserName: 'chrome' } };

var statuses = {
	STATUS_JOINING: 'joining',
	STATUS_LOST: 'lost'
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
			return client.url('localhost:8888').then(function () {
				return client.getText('#status');
			}).then(function (text) {
				assert.equal(text, statusText, 'wrong status');
				console.log('Assert Passed!!');
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
			this.runningServer = childProcess.exec('node ./dist/src/main.js ' + auction, function (error, stdout) {
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
		this.redisListener.on('message', function (channel, msg) {
			_this.count += 1;
			_this.message = msg;
		});
	}

	_createClass(FakeAuctionServer, [{
		key: 'hasRecievedJoinRequestFromSniper',
		value: function hasRecievedJoinRequestFromSniper() {
			assert(this.count > 0, 'did not receive a message');
			return new Promise(function (res, rej) {
				res();
			});
		}
	}, {
		key: 'announceClosed',
		value: function announceClosed() {
			return _thenRedis2['default'].createClient().publish(this.itemId, "lost");
		}
	}, {
		key: 'startSellingItem',
		value: function startSellingItem() {
			return this.redisListener.subscribe(this.itemId);
		}
	}]);

	return FakeAuctionServer;
})();

describe('the auction sniper', function () {
	var auction;
	var application;
	beforeEach('auction sniper e2e', function () {
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

	afterEach('something', function () {
		application.stop();
	});
});
//# sourceMappingURL=e2e.spec.js.map