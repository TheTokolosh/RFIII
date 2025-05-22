/*global gs, console, util*/
/*global MOVEMENT_SPEED, DANGEROUS_TERRAIN_HELP*/
/*jshint esversion: 6*/
'use strict';

// CREATE_CLOUD:
// ************************************************************************************************
gs.createCloud = function (tileIndex, typeName, damage, life, flags) {
	// A cloud already exists:
	if (gs.getCloud(tileIndex)) {
		// Weak clouds never overwrite
		if (typeName === 'Smoke' || typeName === 'Steam') {
			return;
		}
		// Nothing overwrites ice blocks:
		else if (gs.getCloud(tileIndex, 'IceBlock')) {
			return;
		}
		else {
			// Clouds will overwrite existing clouds:
			gs.getCloud(tileIndex).destroy();
		}
		
	}
	
    return new Cloud(tileIndex, typeName, damage, life, flags);
};

// CLOUD_CONSTRUCTOR:
// ************************************************************************************************
function Cloud(tileIndex, typeName, damage, life, flags = {}) {
	var position = util.toPosition(tileIndex);

	this.id = gs.nextCloudID;
	gs.nextCloudID += 1;
	
	// Properties:
	this.type = gs.cloudTypes[typeName];
	this.name = gs.capitalSplit(this.type.name);
	this.life = life || 20;
	this.startLife = this.life;
	this.damage = damage || 0;
	this.isAlive = true;
	this.isTransparent = this.type.isTransparent;
	this.tileIndex = {x: tileIndex.x, y: tileIndex.y};
	this.isPassable = this.type.isPassable;
	this.firstTurn = true;
	
	if (flags.hasOwnProperty('firstTurn')) {
		this.firstTurn = flags.firstTurn;
	}
	
	// Flags:
	if (flags.hasOwnProperty('maxSpread')) {
		this.maxSpread = flags.maxSpread;
	}
	else {
		this.maxSpread = 2;
	}
	
	// Sprite:
	this.sprite = gs.createSprite(position.x, position.y, 'Tileset', gs.cloudSpritesGroup);
	this.sprite.anchor.setTo(0.5, 0.5);
	this.sprite.frame = this.type.frame;
	this.sprite.alpha = this.type.alpha;
	
	if (this.type.onCreate) {
		this.type.onCreate.call(this);
	}
	
	// Place on map:
    gs.getTile(tileIndex).cloud = this;
    
	// Push to effect list:
    gs.cloudList.push(this);
}

// LOAD_CLOUD:
// ************************************************************************************************
gs.loadCloud = function (data) {
	let cloud = gs.createCloud(data.tileIndex, data.typeName, data.damage, data.life);
	
	// Additional Properties:
	cloud.startLife = data.startLife;
	cloud.firstTurn = data.firstTurn;
	cloud.maxSpread = data.maxSpread;
	cloud.dontSpread = data.dontSpread;
	
	return cloud;
};

// TO_DATA:
// ************************************************************************************************
Cloud.prototype.toData = function () {
	let data = {};
	
	// Base Properties:
	data.tileIndex = this.tileIndex;
	data.typeName = this.type.name;
	data.damage = this.damage;
	data.life = this.life;
	
	// Additional Properties:
	data.startLife = this.startLife;
	data.firstTurn = this.firstTurn;
	data.maxSpread = this.maxSpread;
	data.dontSpread = this.dontSpread;
	
	return data;
};

// DESTROY:
// ************************************************************************************************
Cloud.prototype.destroy = function () {
	this.sprite.destroy();
	gs.getTile(this.tileIndex).cloud = null;
	this.isAlive = false;
		
	util.removeFromArray(this, gs.cloudList);
};

// STEP_ON:
// Called when a character enters the tile:
// ************************************************************************************************
Cloud.prototype.stepOn = function (character) {
	if (this.type.onEnterTile) {
		this.type.onEnterTile.call(this, character);
	}
};

// UPDATE_TURN:
// ************************************************************************************************
Cloud.prototype.updateTurn = function () {
	if (this.type.updateTurn) {
		this.type.updateTurn.call(this);
	}
	
	if (!this.firstTurn) {
		this.life -= 1;
	}
	else {
		this.firstTurn = false;
	}
	
	// Running out of life:
	if (this.life === 0) {
		// Make sure to call destroy first to safely remove from tile
		this.destroy();
		
		if (this.type.onDestroy) {
			this.type.onDestroy.call(this);
		}
	}
};

// CHARACTER_TURN_EFFECT:
// ************************************************************************************************
Cloud.prototype.characterTurnEffect = function (character) {
	if (this.type.characterTurnEffect) {
		this.type.characterTurnEffect.call(this, character);
	}
};

// GET_DESC:
// ************************************************************************************************
Cloud.prototype.getDesc = function () {
	let desc = {title: this.type.niceName, text: ''};
	
	if (this.damage) {
		desc.text += 'Damage: ' + this.damage + '\n';
	}
	
	if (this.life && !util.inArray(this.type.name, ['Smoke', 'ChargeSmoke', 'WhiteSmoke', 'Steam', 'Dust'])) {
		desc.text += 'Duration: ' + this.life + '\n';
	}
	
	if (this.damage) {
		desc.text += '\n' + DANGEROUS_TERRAIN_HELP;
	}
	
	
	
	return desc;
};

// DESTROY_ALL_CLOUDS:
// ************************************************************************************************
gs.destroyAllClouds = function () {
	for (let i = this.cloudList.length - 1; i >= 0 ; i -= 1) {
		this.cloudList[i].destroy();
	}
	
	this.cloudList = [];
};

// GET_CLOUD_WITH_ID:
// ************************************************************************************************
gs.getCloudWithID = function (id) {
	if (typeof id !== 'number') {
		throw 'getCloudWithID: id is not a number';
	}
	
	for (let i = 0; i < this.cloudList.length; i += 1) {
		if (this.cloudList[i].id === id && this.cloudList[i].isAlive) {
			return this.cloudList[i];
		}
	}
	
	return null;
};
