/*global gs, util*/
/*global LARGE_RED_FONT, FONT_NAME*/
/*jshint esversion: 6*/
'use strict';

var NUM_DAMAGE_TEXT_SPRITES = 10;

// UI_POP_UP_TEXT:
// ************************************************************************************************
function UIPopUpText () {
	// Text:
	this.text = gs.createText(0, 0, '', 'PixelFontOutline6-White', 14, gs.popUpTextSpritesGroup);
	this.text.setAnchor(0.5, 0.5);
	this.text.visible = false;
	
	// Position:
	// If character != null then this will be offset from the character.
	// Otherwise this will refer to global world pos
	this.relativePos = {x: 0, y: 0};
	
	// Properties:
	this.isAlive = false;
	this.character = null; // If set then the text will follow the character
	this.life = 0;
}

// INIT:
// Call to start the pop up
// ************************************************************************************************
UIPopUpText.prototype.init = function (position, character, text, color = 'White') {
	this.relativePos.x = position.x;
	this.relativePos.y = position.y;
	
	// Setup Text:
	this.str = text;
	
	this.text.setText(text);
	this.text.setFont('PixelFontOutline6-' + color);
	this.text.alpha = 1.0;
	this.text.visible = true;
	gs.popUpTextSpritesGroup.bringToTop(this.text);
	
	// Properties:
	this.color = color;
	this.character = character;
	this.life = 70;
	this.isAlive = true;
	this.count = 1;
};

// STACK_TEXT:
// ************************************************************************************************
UIPopUpText.prototype.stackText = function () {
	let count = this.count;
	
	//this.init({x: 0, y: -16}, this.character, this.str, this.color);
	
	this.count = count + 1;
	
	this.text.setText(this.count + 'x ' + this.str);
};

// UPDATE:
// ************************************************************************************************
UIPopUpText.prototype.update = function () {
	// Disapear:
	if (this.life === 0) {
		this.isAlive = false;
		this.text.visible = false;
	}
	// Pause and fade:
	else if (this.life < 20) {
		this.life -= 1;
	}
	// Pause:
	else if (this.life < 60) {
		this.life -= 1;
	}
	// Move upwards:
	else {
		this.life -= 1;
		this.relativePos.y -= 1;
	}
	
	// Offset from character:
	if (this.character) {
		this.text.x = this.character.body.position.x + this.relativePos.x;
		this.text.y = this.character.body.position.y + this.relativePos.y;
	}
	else {
		this.text.x = this.relativePos.x;
		this.text.y = this.relativePos.y;
	}
};


// CREATE_POP_UP_TEXT_POOL:
// ************************************************************************************************
gs.createPopUpTextPool = function () {
	this.popUpTextList = [];
	
    for (let i = 0; i < NUM_DAMAGE_TEXT_SPRITES; i += 1) {
		this.popUpTextList.push(new UIPopUpText());
    }
};

// CREATE_POP_UP_TEXT_AT_TILE_INDEX:
// ************************************************************************************************
gs.createPopUpTextAtTileIndex = function (tileIndex, text, color = 'White') {
	let pos = util.toPosition(tileIndex);
	pos.y -= 16;
	
	
	
	for (let i = 0; i < this.popUpTextList.length; i += 1) {
		if (!this.popUpTextList[i].isAlive) {
			this.popUpTextList[i].init(pos, null, text, color);			
			return this.popUpTextList[i];
		}
	}
};

// CREATE_CHAR_POP_UP_TEXT:
// ************************************************************************************************
gs.createCharPopUpText = function (character, text, color = 'White') {
	
	for (let i = 0; i < this.popUpTextList.length; i += 1) {
		if (!this.popUpTextList[i].isAlive) {
			this.popUpTextList[i].init({x: 0, y: -16}, character, text, color);
			return this.popUpTextList[i];
		}
	}
	
	let newText = new UIPopUpText();
	newText.init({x: 0, y: -16}, character, text, color);
	this.popUpTextList.push(newText);
	
	return newText;
};



// UPDATE_POP_UP_TEXT:
// ************************************************************************************************
gs.updatePopUpText = function () {
    for (let i = 0; i < this.popUpTextList.length; i += 1) {
        this.popUpTextList[i].update();
    }
};

// DESTROY_ALL_POP_UP_TEXT:
// ************************************************************************************************
gs.destroyAllPopUpText = function () {
	for (let i = 0; i < this.popUpTextList.length; i += 1) {
		this.popUpTextList[i].life = 0;
		this.popUpTextList[i].isAlive = false;
		this.popUpTextList[i].text.visible = false;
	}
};