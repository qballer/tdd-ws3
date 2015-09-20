'use strict';

require('source-map-support').install();
var AuctionMessageTranslator = require('../src/AuctionMessageTranslator');
var sinon = require('sinon');
var assert = require('chai').assert;

var UNUSED_CHAT = null;

describe('auction message translator test', function () {
	var translator;
	var auctionListener;
	before('', function () {
		auctionListener = {
			auctionClosed: sinon.spy(),
			currentPrice: sinon.spy()
		};
		translator = new AuctionMessageTranslator(auctionListener);
	});

	it('notify message closed when close message received', function () {
		var message = JSON.stringify({ event: 'closed' });
		translator.processMessage(UNUSED_CHAT, message);
		assert(auctionListener.auctionClosed.calledOnce, 'auctionListener.auctionClosed not called once');
	});

	it('notifies bid details when current price message received', function () {
		var message = JSON.stringify({ event: 'price', price: 192, increment: 7, bidder: 'someone else' });
		translator.processMessage(UNUSED_CHAT, message);
		assert(auctionListener.currentPrice.calledOnce, 'auctionListener.currentPrice not called once');
		assert(auctionListener.currentPrice.calledWith(192, 7), 'auctionListener.currentPrice not called with 192, 7');
	});

	afterEach('', function () {});
});
//# sourceMappingURL=auctionMessageTranslator.spec.js.map