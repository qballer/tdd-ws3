require('source-map-support').install();
var sinon = require('sinon');
var assert = require('chai').assert;
import {AuctionSniper, PriceSource} from '../src/AuctionSniper';
var Auction = require('../src/Auction');

describe('auction sniper test', () =>{
	var sniper;
	var sniperListener;
	var auction;
	var sniperState;
	beforeEach('',() => {
		sniperListener = {
			sniperLost : sinon.spy(),
			sniperWon : sinon.spy(),
			sniperBidding : sinon.spy(),
			sniperWinning : sinon.spy()
		};
		auction = {
			bid : sinon.spy()
		};
		sniper = new AuctionSniper(auction, sniperListener);
		sniperState = null;
	});

	it('reports lost when auction closes immediately', () => {
		sniper.auctionClosed();
		assert(sniperListener.sniperLost.called, 'sniperListener.sniperLost not called at least once');
	});

	it('bids higher and reports bidding when new price arrives', () => {
		let price = 1001;
		let increment = 25;
		sniper.currentPrice(price, increment, PriceSource.fromOtherBidder);
		assert(auction.bid.calledOnce, 'auction.bid not called once');
		assert(auction.bid.calledWith(price + increment), 'auction.bid not called with '+price+','+increment);
		assert(sniperListener.sniperBidding.called, 'sniperListener.sniperBidding not called at least once');
	});

	it('reports is winning when current price comes from sniper', () => {
		sniper.currentPrice(123, 45, PriceSource.fromSniper);
		assert(sniperListener.sniperWinning.calledOnce, 'sniperListener.sniperWinning not called once');
	});

	it('reports lost if auction closes when bidding', () => {
		sniper.currentPrice(123, 45, PriceSource.fromOtherBidder);
		sniper.auctionClosed();
		sniperState = "bidding"; //TODO: Update from sniper...
		assert.equal(sniperState, "bidding", "sniper state mismatch")
		assert(sniperListener.sniperLost.called, 'sniperListener.sniperLost not called at least once');
	});

	it('reports won if auction closes when winning', () => {
		sniper.currentPrice(123, 45, PriceSource.fromSniper);
		sniper.auctionClosed();
		sniperState = "winning"; //TODO: Update from sniper...
		assert.equal(sniperState, "winning", "sniper state mismatch")
		assert(sniperListener.sniperWon.called, 'sniperListener.sniperWon not called at least once');
	});
});