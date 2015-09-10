require('source-map-support').install();

export default class AuctionMessageTranslator{

	constructor(listener) {
		this.listener = listener;
	}

	processMessage(channel, message){
		this.listener.auctionClosed();
	}
}