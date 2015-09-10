require('source-map-support').install();
var assert = require('chai').assert;
var sinon = require('sinon');
var AuctionMessageTranslator = require('../src/AuctionMessageTranslator');

describe('auction message translator', () => {
	const UNUSED_CHANNEL = null;
	let mockListener;
	let translator;
	beforeEach('init mock listener', ()=>{
		mockListener = {
			auctionClosed : sinon.spy()
		};
		translator = new AuctionMessageTranslator(mockListener);
	});
	it('notifies auction closed when close message received', () => {
		const message = JSON.stringify({event:'close'});
		translator.processMessage(UNUSED_CHANNEL, message);
		assert(mockListener.auctionClosed.calledOnce, 'mockListener.auctionClosed.calledOnce');
	});
});