export default class AuctionSniper { /* implements AuctionEventListener */
constructor(auction, sniperListener){
		this.auction = auction;
		this.sniperListener = sniperListener;
	}
	auctionClosed() {
		this.sniperListener.sniperLost();
	}

	currentPrice(price, increment) {
		this.auction.bid(price + increment);
		this.sniperListener.sniperBidding();
	}
}