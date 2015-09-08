'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var childProcess = require('child_process');
var SNIPER_ID = 'sniper';
var SNIPER_PASSWORD = 'sniper';
var XMPP_HOSTNAME = 'localhost';
var STATUS = 'STATUS';

var AuctionSniperDriver = (function () {
	function AuctionSniperDriver() {
		_classCallCheck(this, AuctionSniperDriver);
	}

	_createClass(AuctionSniperDriver, [{
		key: 'showsSniperStatus',
		value: function showsSniperStatus(statusText) {
			return webDriver.hasDivCalled(STATUS).hasText(statusText);
		}
	}]);

	return AuctionSniperDriver;
})();

var ApplicationRunner = (function () {
	function ApplicationRunner() {
		_classCallCheck(this, ApplicationRunner);

		this.driver = null;
	}

	_createClass(ApplicationRunner, [{
		key: 'startBiddingIn',
		value: function startBiddingIn(auction) {
			console.log(childProcess.exec);
			this.messageBroker = childProcess.exec('node messageBroker.js ' + XMPP_HOSTNAME + ' ' + SNIPER_ID + ' ' + SNIPER_PASSWORD + ' ' + auction.getItemId(), function (stderr) {
				console.log('things that make you go boom: ' + stderr);
			});
			console.log('yo ' + this.messageBroker);
			this.driver = new AuctionSniperDriver(1000);
			this.driver.showsSniperStatus(STATUS_JOINING);
		}
	}, {
		key: 'showsSniperHasLostAuction',
		value: function showsSniperHasLostAuction() {
			this.driver.showsSniperStatus(STATUS_LOST);
		}
	}, {
		key: 'stop',
		value: function stop() {
			console.log('yo1 ' + this.messageBroker);
			this.messageBroker.exit();
		}
	}]);

	return ApplicationRunner;
})();

describe('the auction sniper', function () {
	var auction;
	var application;
	before('auction sniper e2e', function () {
		application = new ApplicationRunner();
		// auction = new FakeAuctionServer('item-5347');		
	});

	it('joins an auction untill it closes', function () {
		// auction.startSellingItem();
		application.startBiddingIn(auction);
		auction.hasRecievedJoinRequestFromSniper();
		auction.announceClosed();
		application.showSniperHasLostAuction();
	});
	after('something', function () {
		application.stop();
		auction.stop();
	});
});