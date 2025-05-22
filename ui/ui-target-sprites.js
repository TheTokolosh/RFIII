/*global gs*/
/*global TILE_SIZE*/
/*jshint esversion: 6*/
'use strict';

// UI_TARGET_SPRITES:
// Sub-system for handling the placement of targetSprites.
// Will init w/ a pool of sprites to use and expand it if needed
// ************************************************************************************************
function UITargetSprites () {
	this.targetSprites = [];
	
	for (let i = 0; i < 30; i += 1) {
		this.targetSprites[i] = gs.createSprite(0, 0, 'Tileset', gs.hudTileSpritesGroup);
		this.targetSprites[i].visible = false;
	}
}

// RESET:
// Called at the start of a frame to hide all targetSprites
// ************************************************************************************************
UITargetSprites.prototype.reset = function () {
	for (let i = 0; i < this.targetSprites.length; i += 1) {
		if (!this.targetSprites[i].isPermanent) {
			this.targetSprites[i].visible = false;
		}
		
	}
};

// CREATE:
// Use this to place and make visible an existing (but unused) target sprite
// Will expand the pool if needed
// ************************************************************************************************
UITargetSprites.prototype.create = function (tileIndex, frame, isPermanent = false) {
	var targetSprite = null;
	
	// Find an existing sprite:
	for (let i = 0; i < this.targetSprites.length; i += 1) {
		if (!this.targetSprites[i].visible) {
			targetSprite = this.targetSprites[i];
			break;
		}
	}
	
	// Need to add a new sprite to pool:
	if (!targetSprite) {
		targetSprite = gs.createSprite(0, 0, 'Tileset', gs.hudTileSpritesGroup);
		this.targetSprites.push(targetSprite);
	}
	
	targetSprite.x = tileIndex.x * TILE_SIZE;
	targetSprite.y = tileIndex.y * TILE_SIZE;
	targetSprite.frame = frame;
	targetSprite.visible = true;
	targetSprite.isPermanent = isPermanent;
};