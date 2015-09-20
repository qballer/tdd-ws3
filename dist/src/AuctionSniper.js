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
	}

	_createClass(AuctionSniper, [{
		key: "auctionClosed",
		value: function auctionClosed() {
			this.sniperListener.sniperLost();
		}
	}, {
		key: "currentPrice",
		value: function currentPrice(price, increment) {
			this.auction.bid(price + increment);
			this.sniperListener.sniperBidding();
		}
	}]);

	return AuctionSniper;
})();

exports["default"] = AuctionSniper;
module.exports = exports["default"];
//# sourceMappingURL=AuctionSniper.js.map