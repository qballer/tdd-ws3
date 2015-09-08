var childProcess = require('child_process');
const SNIPER_ID = 'sniper';
const SNIPER_PASSWORD = 'sniper';
const XMPP_HOSTNAME = 'localhost';
const STATUS = 'STATUS';


class AuctionSniperDriver{
	showsSniperStatus(statusText) {
		return webDriver.hasDivCalled(STATUS).hasText(statusText);
	}
}

class ApplicationRunner {
	constructor() {
		this.driver = null;
	}
	startBiddingIn(auction) {
		this.messageBroker = childProcess.exec('node messageBroker.js ' + XMPP_HOSTNAME + ' ' + SNIPER_ID + ' ' + SNIPER_PASSWORD + 
			' ' + auction.getItemId(), function (stderr){
				console.log('things that make you go boom: ' + stderr);
			});
		this.driver = new AuctionSniperDriver(1000); 
		this.driver.showsSniperStatus(STATUS_JOINING); 
	}
	showsSniperHasLostAuction () {
		this.driver.showsSniperStatus(STATUS_LOST); 
	}
	stop(){
		this.messageBroker.exit();
	}
}

describe('the auction sniper', () =>{
	var auction;
	var application;
	before('auction sniper e2e',() => {
		application = new ApplicationRunner();
		auction = new FakeAuctionServer('item-5347');		
	});

	it('joins an auction untill it closes', () => {
		auction.startSellingItem();
		application.startBiddingIn(auction);
		auction.hasRecievedJoinRequestFromSniper();
		auction.announceClosed();
		application.showSniperHasLostAuction();
	});	
	after('something', () => {
		application.stop();
		auction.stop();
	});
});