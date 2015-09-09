'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _thenRedis = require('then-redis');

var _thenRedis2 = _interopRequireDefault(_thenRedis);

var _srcMain = require('../src/main');

var _srcMain2 = _interopRequireDefault(_srcMain);

require('source-map-support').install();
var Promise = require('promise');

var childProcess = require('child_process');
var SNIPER_ID = 'sniper';
var REDIS_HOSTNAME = 'localhost';
var STATUS = 'STATUS';

var statuses = {
	STATUS_JOINING: 'STATUS_JOINING',
	STATUS_LOST: 'STATUS_LOST'
};

var AuctionSniperDriver = (function () {
	function AuctionSniperDriver() {
		_classCallCheck(this, AuctionSniperDriver);
	}

	_createClass(AuctionSniperDriver, [{
		key: 'showsSniperStatus',
		value: function showsSniperStatus(statusText) {
			return new Promise(function (result, err) {
				err('not implemented');
			});
			// webDriver.hasDivCalled(STATUS).hasText(statusText);
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
			// todo: start main program with some arguments
			_srcMain2['default'].main();
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
			// stop application
			console.log('Hello');
		}
	}, {
		key: 'showSniperHasLostAuction',
		value: function showSniperHasLostAuction() {}
	}]);

	return ApplicationRunner;
})();

var FakeAuctionServer = (function () {
	function FakeAuctionServer(itemId) {
		_classCallCheck(this, FakeAuctionServer);

		this.itemId = itemId;
	}

	_createClass(FakeAuctionServer, [{
		key: 'hasRecievedJoinRequestFromSniper',
		value: function hasRecievedJoinRequestFromSniper() {
			throw new Error("join request was not received");
		}
	}, {
		key: 'announceClosed',
		value: function announceClosed() {
			return _thenRedis2['default'].createClient().publish(this.itemId, "done");
		}
	}, {
		key: 'startSellingItem',
		value: function startSellingItem() {
			this.redisListener = _thenRedis2['default'].createClient();
			return this.redisListener.subscribe(this.itemId);
		}
	}]);

	return FakeAuctionServer;
})();

describe('the auction sniper', function () {
	var auction;
	var application;
	before('auction sniper e2e', function () {
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
			return application.showSniperHasLostAuction();
		});
	});

	after('something', function () {
		application.stop();
	});
});
//# sourceMappingURL=e2e.spec.js.map