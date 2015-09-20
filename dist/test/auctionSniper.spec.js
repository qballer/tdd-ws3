'use strict';

require('source-map-support').install();
var sinon = require('sinon');
var assert = require('chai').assert;
var AuctionSniper = require('../src/AuctionSniper').AuctionSniper;
var Auction = require('../src/Auction');

describe('auction sniper test', function () {
	var sniper;
	var sniperListener;
	var auction;
	before('', function () {
		sniperListener = {
			sniperLost: sinon.spy(),
			sniperBidding: sinon.spy()
		};
		auction = {
			bid: sinon.spy()
		};
		sniper = new AuctionSniper(auction, sniperListener);
	});

	it('reports lost when auction closes', function () {
		sniper.auctionClosed();
		assert(sniperListener.sniperLost.calledOnce, 'sniperListener.sniperLost not called once');
	});

	it('bids higher and reports bidding when new price arrives', function () {
		var price = 1001;
		var increment = 25;
		sniper.currentPrice(price, increment);
		assert(auction.bid.calledOnce, 'auction.bid not called once');
		assert(auction.bid.calledWith(price + increment), 'auction.bid not called with ' + price + ',' + increment);
		assert(sniperListener.sniperBidding.called, 'sniperListener.sniperBidding not called at least once');
	});
});
//# sourceMappingURL=auctionSniper.spec.js.map