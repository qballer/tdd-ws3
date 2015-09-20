'use strict';

require('source-map-support').install();
var AuctionMessageTranslator = require('../src/AuctionMessageTranslator');
var PriceSource = require('../src/AuctionSniper').PriceSource;
var sinon = require('sinon');
var assert = require('chai').assert;

var UNUSED_CHAT = null;
var SNIPER_ID = 'sniper';

describe('auction message translator test', function () {
	var translator;
	var auctionListener;
	beforeEach('', function () {
		auctionListener = {
			auctionClosed: sinon.spy(),
			currentPrice: sinon.spy()
		};
		translator = new AuctionMessageTranslator(SNIPER_ID, auctionListener);
	});

	it('notify message closed when close message received', function () {
		var message = JSON.stringify({ event: 'closed' });
		translator.processMessage(UNUSED_CHAT, message);
		assert(auctionListener.auctionClosed.calledOnce, 'auctionListener.auctionClosed not called once');
	});

	it('notifies bid details when current price message received from other bidder', function () {
		var message = JSON.stringify({ event: 'price', price: 192, increment: 7, bidder: 'someone else' });
		translator.processMessage(UNUSED_CHAT, message);
		assert(auctionListener.currentPrice.calledOnce, 'auctionListener.currentPrice not called once');
		assert(auctionListener.currentPrice.calledWith(192, 7, PriceSource.fromOtherBidder), 'auctionListener.currentPrice not called with 192, 7 and from other bidder');
	});

	it('notifies bid details when current price message received from sniper', function () {
		var message = JSON.stringify({ event: 'price', price: 234, increment: 5, bidder: SNIPER_ID });
		translator.processMessage(UNUSED_CHAT, message);
		assert(auctionListener.currentPrice.calledOnce, 'auctionListener.currentPrice not called once');
		assert(auctionListener.currentPrice.calledWith(234, 5, PriceSource.fromSniper), 'auctionListener.currentPrice not called with 234, 5 and from sniper');
	});

	afterEach('', function () {});
});
//# sourceMappingURL=auctionMessageTranslator.spec.js.map