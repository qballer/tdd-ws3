export default class AuctionMessageTranslator {
	constructor(listener) {
		this.listener = listener;
	}

	processMessage(chat, message) {
		let parsed = JSON.parse(message);
		switch(parsed.event) {
			case 'closed' : 
				this.listener.auctionClosed();
				break;
			case 'price' : 
				this.listener.currentPrice(parsed.price, parsed.increment);
				break;
		}
	}
}