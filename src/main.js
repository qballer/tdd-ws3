require('source-map-support').install();

var AuctionMessageTranslator = require('../src/AuctionMessageTranslator');
import {AuctionSniper, PriceSource} from './AuctionSniper';
var Auction = require('../src/Auction');
var express = require('express');
var app = express();
var server;
var status = 'joining';
var redis = require('then-redis')
var itemToSnipe = process.argv[3];
var sniperId = process.argv[2];

const UNUSED_CHAT = null;

var client = redis.createClient();

class SniperStateDisplayer{ /* implements SniperListener*/
	showStatus(show_status) {
		status = show_status;
	}
	sniperLost(){
		this.showStatus('lost');
	}
	sniperBidding(){
		this.showStatus('bidding');
	}
	sniperWinning(){
		this.showStatus('winning');
	}
}

function main(){
	var subscriber = redis.createClient();
	var auction = new Auction(itemToSnipe, sniperId, client);
	auction.join();
	var auctionMessageTranslator = new AuctionMessageTranslator(sniperId, new AuctionSniper(auction, new SniperStateDisplayer()));
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

