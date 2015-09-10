require('source-map-support').install();
var AuctionMessageTranslator = require('../src/AuctionMessageTranslator');
var sinon = require('sinon');
var assert = require('chai').assert;

const UNUSED_CHAT = null;

describe('auction message translator test', () =>{
	var translator
	var listener
	before('',() => {
		listener = {
			auctionClosed : sinon.spy(), 
			currentPrice : sinon.spy()
		};
		translator = new AuctionMessageTranslator(listener);
	});
	
	it('notify message closed when close message received', () => {
		var message = JSON.stringify({event: 'closed'});
		translator.processMessage(UNUSED_CHAT, message);
		assert(listener.auctionClosed.calledOnce, 'listener.auctionClosed not called once');
	});

	it('notifies bid details when current price message received', () => {
		var message = JSON.stringify({event: 'price', price:192, increment:7, bidder:'someone else'});
		translator.processMessage(UNUSED_CHAT, message);
		assert(listener.currentPrice.calledOnce, 'listener.currentPrice not called once');
		assert(listener.currentPrice.calledWith(192, 7), 'listener.currentPrice not called with 192, 7');
	});

	afterEach('', () => {
		
	});
});