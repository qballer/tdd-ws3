require('source-map-support').install();
var Promise = require('bluebird');
var assert = require('chai').assert;
import redis from 'then-redis';
// import theRealThing from '../src/main';

var childProcess = require('child_process');
const SNIPER_ID = 'sniper';
const REDIS_HOSTNAME = 'localhost';
const STATUS = 'STATUS';

var webdriverio = require('webdriverio');
var options = { desiredCapabilities: { browserName: 'phantomjs' } };

var statuses = {
	STATUS_JOINING: 'joining',
	STATUS_LOST: 'lost'
};
var client;
class AuctionSniperDriver{
	constructor(){
		client = webdriverio.remote(options).init();
	}
	showsSniperStatus(statusText) {
		return client.url('http://localhost:8888')
		.then( () => client.getText('#status'))
		.then(text => {
			assert.equal(text, statusText, 'wrong status');
			console.log('Assert Passed!!');
		});
	}
	stop(){
		client.end();
	}
}

class ApplicationRunner {
	startBiddingIn(auction) {
		this.driver = new AuctionSniperDriver(1000);
		// start main program with some arguments
		this.runningServer = childProcess.exec('node ./dist/src/main.js ' + auction, (error,stdout) => {
			console.log(stdout);
			console.log(error);
		});
		return this.driver.showsSniperStatus(statuses.STATUS_JOINING); 
	}
	showsSniperHasLostAuction () {
		return this.driver.showsSniperStatus(statuses.STATUS_LOST); 
	}
	stop(){
		 this.runningServer.kill('SIGINT');
         this.driver.stop();
	}
	
}

class FakeAuctionServer {
	constructor(itemId) {
		this.count = 0;
		this.itemId = itemId;
		this.publisher = redis.createClient();
		this.listener = redis.createClient();
		this.listener.on('message', (channel, msg) => {
				this.count += 1;
				this.message = msg;
		})
	}
	hasReceivedJoinRequestFromSniper(){
        assert(this.count > 0, 'did not receive a message');
		return new Promise((res) =>{
			res();
		});
	}
	announceClosed(){
		return this.publisher.publish(this.itemId, "closed");
	}
	startSellingItem() {
		return this.listener.subscribe(this.itemId);
	}
	stop(){
		this.listener.quit();
		this.publisher.quit();
	}
}

describe('the auction sniper', () =>{
	var auction;
	var application;
	beforeEach('auction sniper e2e',() => {
		auction = new FakeAuctionServer('item-5347');		
		application = new ApplicationRunner();
	});

	it('makes higher bid but loses', () => {
		return auction.startSellingItem()
			.then(() => application.startBiddingIn('item-5347'))
			.then(() => auction.hasReceivedJoinRequestFromSniper())

			.then(() => auction.reportPrice(1000, 98, 'other bidder'))
			.then(() => application.hasShownSniperIsBidding())
			.then(() => auction.hasReceivedBid(1098, SNIPER_ID))

			.then(() => auction.announceClosed())
			.then(() => application.showsSniperHasLostAuction());
	});

	it('joins an auction untill it closes', () => {
		return auction.startSellingItem()
			.then(() => application.startBiddingIn('item-5347'))
			.then(() => auction.hasReceivedJoinRequestFromSniper())
			.then(() => auction.announceClosed())
			.then(() => application.showsSniperHasLostAuction());
	});	
	
	afterEach('something', () => {
		application.stop();
		auction.stop();
	});
});