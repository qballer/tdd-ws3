'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _AuctionSniper = require('./AuctionSniper');

var AuctionMessageTranslator = (function () {
	function AuctionMessageTranslator(sniperId, listener) {
		_classCallCheck(this, AuctionMessageTranslator);

		this.listener = listener;
		this.sniperId = sniperId;
	}

	_createClass(AuctionMessageTranslator, [{
		key: 'processMessage',
		value: function processMessage(chat, message) {
			var parsed = JSON.parse(message);
			switch (parsed.event) {
				case 'closed':
					this.listener.auctionClosed();
					break;
				case 'price':
					this.listener.currentPrice(parsed.price, parsed.increment, parsed.bidder == this.sniperId ? _AuctionSniper.PriceSource.fromSniper : _AuctionSniper.PriceSource.fromOtherBidder);
					break;
			}
		}
	}]);

	return AuctionMessageTranslator;
})();

exports['default'] = AuctionMessageTranslator;
module.exports = exports['default'];
//# sourceMappingURL=AuctionMessageTranslator.js.map