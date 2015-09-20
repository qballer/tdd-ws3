require('source-map-support').install();
var sinon = require('sinon');
var assert = require('chai').assert;
var AuctionSniper = require('../src/AuctionSniper').AuctionSniper;
var Auction = require('../src/Auction');

describe('auction sniper test', () =>{
	var sniper;
	var sniperListener;
	var auction;
	before('',() => {
		sniperListener = {
			sniperLost : sinon.spy(), 
			sniperBidding : sinon.spy()
		};
		auction = {
			bid : sinon.spy()
		};
		sniper = new AuctionSniper(auction, sniperListener);
	});

	it('reports lost when auction closes', () => {
		sniper.auctionClosed();
		assert(sniperListener.sniperLost.calledOnce, 'sniperListener.sniperLost not called once');
	});

	it('bids higher and reports bidding when new price arrives', () => {
		let price = 1001;
		let increment = 25;
		sniper.currentPrice(price, increment);
		assert(auction.bid.calledOnce, 'auction.bid not called once');
		assert(auction.bid.calledWith(price + increment), 'auction.bid not called with '+price+','+increment);
		assert(sniperListener.sniperBidding.called, 'sniperListener.sniperBidding not called at least once');
	});
});