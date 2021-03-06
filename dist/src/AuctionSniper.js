"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AuctionSniper = (function () {
	/* implements AuctionEventListener */

	function AuctionSniper(auction, sniperListener) {
		_classCallCheck(this, AuctionSniper);

		this.auction = auction;
		this.sniperListener = sniperListener;
		this.isWinning = false;
	}

	_createClass(AuctionSniper, [{
		key: "auctionClosed",
		value: function auctionClosed() {
			if (this.isWinning) {
				this.sniperListener.sniperWon();
			} else {
				this.sniperListener.sniperLost();
			}
		}
	}, {
		key: "currentPrice",
		value: function currentPrice(price, increment, priceSource) {
			this.isWinning = priceSource == PriceSource.fromSniper;
			if (this.isWinning) {
				this.sniperListener.sniperWinning();
			} else {
				this.auction.bid(price + increment);
				this.sniperListener.sniperBidding();
			}
		}
	}]);

	return AuctionSniper;
})();

var PriceSource = {
	fromSniper: 0,
	fromOtherBidder: 1
};

exports.AuctionSniper = AuctionSniper;
exports.PriceSource = PriceSource;
//# sourceMappingURL=AuctionSniper.js.map