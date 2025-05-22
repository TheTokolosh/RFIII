/*global require, console, achievements*/
'use strict';
var steam = {};

// INIT:
// ************************************************************************************************
steam.init = function () {
	// Load Green Works:
	this.greenworks = require('./greenworks.js');
	
	// Not connected:
	if (!this.greenworks.initAPI()) {  
  		console.log('Error on initializing Steam API');
		this.isConnected = false;
		return;
	} 

	console.log('Steam API has been initalized successfully!');
	this.isConnected = true;
	
	// Getting the users steamId:
	this.steamId = this.greenworks.getSteamId();
};