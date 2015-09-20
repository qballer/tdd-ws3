export default class Auction {
	constructor(itemToSnipe, sniperId, client) {
		this.sniperId = sniperId;
		this.itemToSnipe = itemToSnipe;
		this.client = client;
	}
	join() {
		this.client.publish(this.itemToSnipe, 'join');
	}
	bid(amount) {
		this.client.publish(this.itemToSnipe, JSON.stringify({event:'bid', price:amount, bidder:this.sniperId}));
	}
}