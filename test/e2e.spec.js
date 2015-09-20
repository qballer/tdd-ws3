require('source-map-support').install();
var Promise = require('bluebird');
var assert = require('chai').assert;
import redis from 'then-redis';
var childProcess = require('child_process');
const SNIPER_ID = 'sniper';
const REDIS_HOSTNAME = 'localhost';
const STATUS = 'STATUS';

var webdriverio = require('webdriverio');
var options = { desiredCapabilities: { browserName: 'phantomjs' } };

var statuses = {
	STATUS_JOINING: 'joining',
	STATUS_LOST: 'lost', 
	STATUS_BIDDING: 'bidding'
}
var client;

class AuctionSniperDriver{
	// todo connect with browser to localhost http server, assert that html response shows expected status
	constructor(){
		client = webdriverio.remote(options);
		this.first = true;
	}
	showsSniperStatus(statusText) {
		if (this.first){
			client = client.init();
			this.first = false;
		}
		return client.url('http://localhost:8888')
				.then( () => client.getText('#status'))
				.then(text => {
					assert.equal(text, statusText, 'wrong status');
				});
	}
	stop(){
		client.end();
	}
}

class ApplicationRunner {
	constructor() {
		this.driver = new AuctionSniperDriver(1000);
	}
	startBiddingIn(auction) {
		// start main program with some arguments
		this.runningServer = childProcess.exec('node ./dist/src/main.js ' +  SNIPER_ID + ' ' + auction , (error,stdout) => {
			console.log(stdout);
			console.log(error);
		});
		return this.driver.showsSniperStatus(statuses.STATUS_JOINING); 
	}
	showsSniperHasLostAuction () {
		return this.driver.showsSniperStatus(statuses.STATUS_LOST);
	}

	hasShownSniperIsBidding() {
		return this.driver.showsSniperStatus(statuses.STATUS_BIDDING);
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
		this.redisListener = redis.createClient();
		this.redisPublisher = redis.createClient();
		this.redisListener.on('message', (channel, msg) => {
				this.count += 1;
				this.message = msg;
		})
	}
	hasRecievedJoinRequestFromSniper(){
        assert(this.count > 0, 'did not receive a message');
        assert.equal(this.message, 'join', 'message mismatch');
		return new Promise((res, rej) =>{
			res();
		});
	}
	
	
	hasReceivedBid(bid, sniperId) {
		var parsedMessage = JSON.parse(this.message);
		assert.equal(parsedMessage.event,'bid', 'event mismatch');
		assert.equal(parsedMessage.bidder, sniperId, 'bidder mismatch');
		assert.equal(parsedMessage.price, bid, 'price mismatch');
		return new Promise((res, rej) =>{
			res();
		});
	}
	
	announceClosed(){
		return this.redisPublisher.publish(this.itemId, JSON.stringify({event:"closed"}));
	}
	startSellingItem() {
		return this.redisListener.subscribe(this.itemId);
	}

	reportPrice(price, increment, bidder) {
		return this.redisPublisher.publish(this.itemId, JSON.stringify({event:'price', price, increment, bidder}));
	}
}

describe('the auction sniper', () =>{
	var auction;
	var application;
	beforeEach('initialize auction server and application runner objects',() => {
		auction = new FakeAuctionServer('item-5347');		
		application = new ApplicationRunner();
	});

	it('joins an auction untill it closes', () => {
		return auction.startSellingItem()
			.then(() => application.startBiddingIn('item-5347'))
			.then(() => auction.hasRecievedJoinRequestFromSniper())
			.then(() => auction.announceClosed())
			.then(() => application.showsSniperHasLostAuction());
	});
	
	it('sniper makes a higher bid but loses', () => {
		return auction.startSellingItem()
			.then(() => application.startBiddingIn('item-5347'))
			.then(() => auction.hasRecievedJoinRequestFromSniper())

			.then(() => auction.reportPrice(1000, 98, "other bidder"))
			.then(() => application.hasShownSniperIsBidding())

			.then(() => auction.hasReceivedBid(1098, SNIPER_ID))

			.then(() => auction.announceClosed())
			.then(() => application.showsSniperHasLostAuction());
	});

	afterEach('stop application', () => {
		application.stop();
	});
});