require('source-map-support').install();
var Promise = require('promise');
import redis from 'then-redis';
import theRealThing from '../src/main';

var childProcess = require('child_process');
const SNIPER_ID = 'sniper';
const REDIS_HOSTNAME = 'localhost';
const STATUS = 'STATUS';

var statuses = {
	STATUS_JOINING: 'STATUS_JOINING',
	STATUS_LOST: 'STATUS_LOST'
}

class AuctionSniperDriver{
	showsSniperStatus(statusText) {
		return new Promise((result, err) => {err('not implemented');});
		// webDriver.hasDivCalled(STATUS).hasText(statusText);
	}
}

class ApplicationRunner {
	constructor() {
		this.driver = new AuctionSniperDriver(1000);
	}
	startBiddingIn(auction) {
		// todo: start main program with some arguments
		theRealThing.main();
		return this.driver.showsSniperStatus(statuses.STATUS_JOINING); 
	}
	showsSniperHasLostAuction () {
		return this.driver.showsSniperStatus(statuses.STATUS_LOST); 
	}
	stop(){
		// stop application
		console.log('Hello');
	}
	showSniperHasLostAuction(){

	}
}


class FakeAuctionServer {
	constructor(itemId) {
		this.itemId = itemId;
	}
	hasRecievedJoinRequestFromSniper(){
		throw new Error("join request was not received");
	}
	announceClosed(){
		return redis.createClient().publish(this.itemId, "done");
	}
	startSellingItem() {
		this.redisListener = redis.createClient();
		return this.redisListener.subscribe(this.itemId);
	}
}

describe('the auction sniper', () =>{
	var auction;
	var application;
	before('auction sniper e2e',() => {
		auction = new FakeAuctionServer('item-5347');		
		application = new ApplicationRunner();
	});

	it('joins an auction untill it closes', () => {
		return auction.startSellingItem()
			.then(() => application.startBiddingIn('item-5347'))
			.then(() => auction.hasRecievedJoinRequestFromSniper())
			.then(() => auction.announceClosed())
			.then(() => application.showSniperHasLostAuction());
	});	
	
	after('something', () => {
		application.stop();
	});
});