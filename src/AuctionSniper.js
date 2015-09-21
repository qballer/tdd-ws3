class AuctionSniper { /* implements AuctionEventListener */
	constructor(auction, sniperListener){
		this.auction = auction;
		this.sniperListener = sniperListener;
		this.isWinning = false;
	}
	auctionClosed() {
		if (this.isWinning) {
			this.sniperListener.sniperWon();
		} else {
			this.sniperListener.sniperLost();
		}
	}

	currentPrice(price, increment, priceSource) {
		this.isWinning = (priceSource == PriceSource.fromSniper);
		if (this.isWinning) {
			this.sniperListener.sniperWinning();
		} else {
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