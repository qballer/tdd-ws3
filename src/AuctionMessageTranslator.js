require('source-map-support').install();

export default class AuctionMessageTranslator{

	constructor(listener) {
		this.listener = listener;
	}

	processMessage(channel, message){
		const parsedMessage = JSON.parse(message);
		console.log('parsedMessage', parsedMessage);
		switch (parsedMessage.event) {
			case 'closed':
				this.listener.auctionClosed();
				break;
			case 'price':
				this.listener.currentPrice(parsedMessage.price, parsedMessage.increment, parsedMessage.bidder);
				break;
			default:
				throw new Error('wtf ' + parsedMessage.event);
		}
	}
}