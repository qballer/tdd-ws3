require('source-map-support').install();
var AuctionMessageTranslator = require('../src/AuctionMessageTranslator');
import {AuctionSniper, PriceSource} from '../src/AuctionSniper';
var sinon = require('sinon');
var assert = require('chai').assert;

const UNUSED_CHAT = null;
const SNIPER_ID = 'sniper';

describe('auction message translator test', () =>{
	var translator;
	var auctionListener;
	beforeEach('',() => {
		auctionListener = {
			auctionClosed : sinon.spy(), 
			currentPrice : sinon.spy()
		};
		translator = new AuctionMessageTranslator(SNIPER_ID, auctionListener);
	});
	
	it('notify message closed when close message received', () => {
		var message = JSON.stringify({event: 'closed'});
		translator.processMessage(UNUSED_CHAT, message);
		assert(auctionListener.auctionClosed.calledOnce, 'auctionListener.auctionClosed not called once');
	});

	it('notifies bid details when current price message received from other bidder', () => {
		var message = JSON.stringify({event: 'price', price:192, increment:7, bidder:'someone else'});
		translator.processMessage(UNUSED_CHAT, message);
		assert(auctionListener.currentPrice.calledOnce, 'auctionListener.currentPrice not called once');
		assert(auctionListener.currentPrice.calledWith(192, 7, PriceSource.fromOtherBidder), 'auctionListener.currentPrice not called with 192, 7 and from other bidder');
	});
 
	it('notifies bid details when current price message received from sniper', () => {
		var message = JSON.stringify({event: 'price', price:234, increment:5, bidder:SNIPER_ID});
		translator.processMessage(UNUSED_CHAT, message);
		assert(auctionListener.currentPrice.calledOnce, 'auctionListener.currentPrice not called once');
		assert(auctionListener.currentPrice.calledWith(234, 5, PriceSource.fromSniper), 'auctionListener.currentPrice not called with 234, 5 and from sniper');
	});


	afterEach('', () => {
		
	});
});