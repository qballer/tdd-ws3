class AuctionSniper { /* implements AuctionEventListener */
	constructor(auction, sniperListener){
		this.auction = auction;
		this.sniperListener = sniperListener;
	}
	auctionClosed() {
		this.sniperListener.sniperLost();
	}

	currentPrice(price, increment, fromSniper) {
		if (!fromSniper) {
			this.auction.bid(price + increment);
			this.sniperListener.sniperBidding();
		}
	}
}

const PriceSource = {
	fromSniper : 0,
	fromOtherBidder : 1
};

export { AuctionSniper, PriceSource }