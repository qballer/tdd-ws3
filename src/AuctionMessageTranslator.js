import {AuctionSniper, PriceSource} from './AuctionSniper';

export default class AuctionMessageTranslator {
	constructor(sniperId, listener) {
		this.listener = listener;
		this.sniperId = sniperId;
	}

	processMessage(chat, message) {
		let parsed = JSON.parse(message);
		switch(parsed.event) {
			case 'closed' : 
				this.listener.auctionClosed();
				break;
			case 'price' : 
				this.listener.currentPrice(parsed.price, parsed.increment, 
										  (parsed.bidder == this.sniperId ? PriceSource.fromSniper : PriceSource.fromOtherBidder));
				break;
		}
	}
}