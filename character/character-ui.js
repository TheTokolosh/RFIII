/*global gs, util*/
/*global Character*/
/*global CHARACTER_STATUS_FONT, CHARACTER_HEALTH_FONT*/
/*global FACTION, SMALL_BAR_FRAME, TILE_SIZE*/
/*global RING_FRAME*/
/*jshint esversion: 6*/
'use strict';

// CREATE_CHARACTER_UI:
// ************************************************************************************************
Character.prototype.createCharacterUI = function () {
	// Ring Sprite:
	this.ringSprite = gs.createSprite(0, 0, 'UITileset', gs.ringSpritesGroup);
	this.ringSprite.anchor.setTo(0.5, 0.5);
	this.ringSprite.visible = false;
	
	// Status Text:
	this.statusText = gs.createText(0, 0, '', 'PixelFontOutline6-White', 14, gs.characterHUDGroup);
	this.statusText.setAnchor(0.5, 0.5);
	this.statusText.visible = false;
	
	// HP Text:
	if (gs.globalData.useHPText) {
		this.createUIText();
	}
	// HP Bars:
	else {
		this.createUIBars();
	}
	
	// Pop up text:
	this.popUpTimer = 0;
	this.popUpQueue = [];
	this.popUpTextList = [];
};

// DESTROY_UI:
// ************************************************************************************************
Character.prototype.destroyUI = function () {
	if (this.hpBar) {
		this.hpBar.destroy();
		this.hpBarRed.destroy();
	}
	
	if (this.mpBar) {
		this.mpBar.destroy();
		this.mpBarRed.destroy();
	}
	
	if (this.hpText) {
		this.hpText.destroy();
	}
	
	if (this.mpText) {
		this.mpText.destroy();
	}
	
	this.hpBar = null;
	this.hpBarRed = null;
	this.mpBar = null;
	this.mpBarRed = null;
	this.hpText = null;
	this.mpText = null;
};

// CREATE_UI_BARS:
// ************************************************************************************************
Character.prototype.createUIBars = function () {
	// HP Bar:
	this.hpBarRed = gs.createSprite(0, 0, 'Tileset', gs.characterHUDGroup);
	this.hpBarRed.frame = SMALL_BAR_FRAME.RED;
	this.hpBarRed.scale.setTo(TILE_SIZE, 1);
	this.hpBarRed.visible = false;
	
	this.hpBar = gs.createSprite(0, 0, 'Tileset', gs.characterHUDGroup);
	this.hpBar.frame = SMALL_BAR_FRAME.GREEN;
	this.hpBar.visible = false;
	
	// MP Bar:
	if (this.type && this.type.name === 'Player') {
		this.mpBarRed = gs.createSprite(0, 0, 'Tileset', gs.characterHUDGroup);
		this.mpBarRed.frame = SMALL_BAR_FRAME.RED;
		this.mpBarRed.scale.setTo(TILE_SIZE, 1);
		this.mpBarRed.visible = false;
		
		this.mpBar = gs.createSprite(0, 0, 'Tileset', gs.characterHUDGroup);
		this.mpBar.frame = SMALL_BAR_FRAME.PURPLE;
		this.mpBar.visible = false;
	}
};

// CREATE_UI_TEXT:
// ************************************************************************************************
Character.prototype.createUIText = function () {
	// HP Text:
	this.hpText = gs.createText(0, 0, '', 'PixelFontOutline6-Green', 14, gs.characterHUDGroup);
	this.hpText.visible = false;
	
	// MP Bar:
	if (this.type && this.type.name === 'Player') {
		this.mpText = gs.createText(0, 0, '', 'PixelFontOutline6-Purple', 14, gs.characterHUDGroup);
		this.mpText.visible = false;
	}
};

// UPDATE_UI_FRAME:
// ************************************************************************************************
Character.prototype.updateUIFrame = function () {
	if (gs.globalData.useHPText) {
		this.updateUIText();
	}
	else {
		this.updateUIBars();
	}
	
	this.updateUIRing();
	
	// Position Status Text:
	this.statusText.setText(this.getStatusTextStr());
	this.statusText.x = this.body.position.x;
	this.statusText.y = this.body.position.y - 24;

	if (this.type.niceName === 'The Wizard Yendor') {
		this.statusText.y = this.body.position.y - 38;
	}
	
};

// UPDATE_UI_TEXT:
// ************************************************************************************************
Character.prototype.updateUIText = function () {
	this.hpText.setText(this.currentHp);
	this.hpText.x = this.body.position.x - 24;
	this.hpText.y = this.body.position.y + 14;
	
	// Offset adjacent enemy HP to not block mana
	if (this !== gs.pc && this.tileIndex.x === gs.pc.tileIndex.x + 1 && this.tileIndex.y === gs.pc.tileIndex.y) {
		this.hpText.x = this.body.position.x;
	}
	
	if (this.mpText) {
		this.mpText.setText(this.currentMp);
		this.mpText.x = this.body.position.x + 8;
		this.mpText.y = this.body.position.y + 14;
		this.mpText.visible = gs.globalData.useMPText;
	}
	
};

// UPDATE_UI_BARS:
// ************************************************************************************************
Character.prototype.updateUIBars = function () {	
	// HP Bar:
	if ((this.currentHp < this.maxHp || this.currentMp < this.maxMp) && this.isAlive && (this === gs.pc || this.isAgroed)) {
		this.hpBarRed.x = this.body.position.x - 20;
		this.hpBarRed.y = this.body.position.y + 20;
		this.hpBar.x = this.body.position.x - 20;
		this.hpBar.y = this.body.position.y + 20;
		this.hpBar.scale.setTo(Math.round(this.currentHp / this.maxHp * 40), 1);
		
		this.hpBar.visible = true;
		this.hpBarRed.visible = true;
	}
	else {
		this.hpBar.visible = false;
		this.hpBarRed.visible = false;
	}
	
	// MP Bar:
	if (this.mpBar) {
		if (this.currentMp < this.maxMp) {
			this.mpBarRed.x = this.body.position.x - 20;
			this.mpBarRed.y = this.body.position.y + 23;
			this.mpBar.x = this.body.position.x - 20;
			this.mpBar.y = this.body.position.y + 23;
			this.mpBar.scale.setTo(Math.round(this.currentMp / this.maxMp * 40), 1);

			this.mpBar.visible = true;
			this.mpBarRed.visible = true;
		}
		else {
			this.mpBar.visible = false;
			this.mpBarRed.visible = false;
		}
	}
};

// UPDATE_UI_RING:
// ************************************************************************************************
Character.prototype.updateUIRing = function () {
	// Position Ring sprite:
	this.ringSprite.x = this.body.position.x;
	this.ringSprite.y = this.body.position.y + 2;
	
	// Set ring sprite:
	if (this.faction === FACTION.PLAYER && this !== gs.pc) {
		this.ringSprite.frame = RING_FRAME.GREEN;
	}
	else if (this.type.isBoss) {
		this.ringSprite.frame = RING_FRAME.PURPLE;
	}
	else if (this.npcClassType) {
		this.ringSprite.frame = RING_FRAME.YELLOW;
	}
	else if (this.summonerId && this.type.name !== 'Tentacle') {
		this.ringSprite.frame = RING_FRAME.BLUE;
	}
	else {
		this.ringSprite.frame = 0;
	}
};

// GET_STATUS_TEXT_STR:
// ************************************************************************************************
Character.prototype.getStatusTextStr = function () {
	// Set Status:
	if (this !== gs.pc && this.isHidden) {
		return 'H';
	}
	else if (this.isAsleep) {
		return 'ZZZ';
	} 
	else if (this !== gs.pc && !this.isAgroed && gs.debugProperties.npcCanAgro) {
		if (this.canDetectPlayer()) {
			return '???';
		}
		else {
			return '?';
		}
	} 
	else if (this.isFeared) {
		return '!';
	}
	else {
		return this.statusEffects.toUIString();
	}
};

// SET_UI_VISIBLE:
// ************************************************************************************************
Character.prototype.setUIVisible = function (bool) {
	// HP Text:
	if (gs.globalData.useHPText) {
		this.hpText.visible = bool;
	}
	// HP Bar:
	else {
		this.hpBar.visible = bool;
		this.hpBarRed.visible = bool;
	}
	
	this.statusText.visible = bool;
	this.ringSprite.visible = bool;
	
	
	if (!this.ringSprite.frame) {
		this.ringSprite.visible = false;
	}
};

// POP_UP_TEXT:
// ************************************************************************************************
Character.prototype.popUpText = function (text, color = 'White') {
	// Push to front of list:
	this.popUpQueue.unshift({text: text, color: color});
	
	this.processPopUpText();
};

// PROCESS_POP_UP_TEXT:
// ************************************************************************************************
Character.prototype.processPopUpText = function () {
	// Remove dead text:
	for (let i = this.popUpTextList.length - 1; i >= 0; i -= 1) {
		if (!this.popUpTextList[i].isAlive) {
			util.removeFromArray(this.popUpTextList[i], this.popUpTextList);
		}
	}
	
	if (this.popUpTimer > 0) {
		this.popUpTimer -= 1;
	}
	
	// Pop next text:
	if (this.popUpQueue.length > 0 && this.popUpTimer === 0) {
		// Create the next text:
		let element = this.popUpQueue.pop();
		let text = gs.createCharPopUpText(this, element.text, element.color);
		this.popUpTextList.unshift(text);
		this.popUpTimer = 10;
		
		
	}
	
	for (let i = 1; i < this.popUpTextList.length; i += 1) {
		this.popUpTextList[i].relativePos.y = this.popUpTextList[i - 1].relativePos.y - 16;
	}
};