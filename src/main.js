require('source-map-support').install();

var AuctionMessageTranslator = require('../src/AuctionMessageTranslator');
var express = require('express');
var app = express();
var server;
var status = 'joining';
var redis = require('then-redis')
var itemToSnipe = process.argv[3];
var sniperId = process.argv[2];

const UNUSED_CHAT = null;

var client = redis.createClient();

class SniperListener{
	sniperLost(){
		status = 'lost';
	}
}

class AuctionEventListener {
	constructor(sniperListener){
		this.sniperListener = sniperListener;
	}
	auctionClosed() {
		this.sniperListener.sniperLost();
	}

	currentPrice(price, increment) {
		status = 'bidding';
		//if (sniperId !== parsed.bidder){
		client.publish(itemToSnipe, JSON.stringify({event:'bid', price:(price + increment), bidder:sniperId}));
		//}
	}
}

function main(){
	client.publish(itemToSnipe, 'join');
	var subscriber = redis.createClient();
	var listener = new AuctionEventListener(new SniperListener());
	var auctionMessageTranslator = new AuctionMessageTranslator(listener);
	subscriber.subscribe(itemToSnipe);
	
	subscriber.on('message', (channel, msg) => {
		auctionMessageTranslator.processMessage(UNUSED_CHAT, msg);
	});
	
	app.get('/', function (req, res) {
		res.send(`<html><body><div id="status">${status}</div></body></html>`);
	});
	server = app.listen(8888, function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('Example app listening at http://%s:%s', host, port);
	}); 
}

main();

