'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Auction = (function () {
	function Auction(itemToSnipe, sniperId, client) {
		_classCallCheck(this, Auction);

		this.sniperId = sniperId;
		this.itemToSnipe = itemToSnipe;
		this.client = client;
	}

	_createClass(Auction, [{
		key: 'join',
		value: function join() {
			this.client.publish(this.itemToSnipe, 'join');
		}
	}, {
		key: 'bid',
		value: function bid(amount) {
			this.client.publish(this.itemToSnipe, JSON.stringify({ event: 'bid', price: amount, bidder: this.sniperId }));
		}
	}]);

	return Auction;
})();

exports['default'] = Auction;
module.exports = exports['default'];
//# sourceMappingURL=Auction.js.map