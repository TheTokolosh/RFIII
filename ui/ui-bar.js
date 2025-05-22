/*global gs, game, console*/
/*global SCALE_FACTOR, LARGE_BOLD_WHITE_FONT*/
'use strict';

// CREATE_BAR:
// ************************************************************************************************
gs.createBar = function (x, y, frame, group) {
	var bar = new UIBar(x, y, frame);
	
	if (group) {
		group.add(bar.group);
	}
	
	return bar;
};

// BAR_CONSTRUCTOR:
// ************************************************************************************************
function UIBar (x, y, frame) {
	this.group = game.add.group();
	
	
	// The bar outline:
	this.frame = gs.createSprite(0, 0, 'Bar', this.group);
	this.frame.inputEnabled = true;
	
	// The actual slider bar:
	this.bar = gs.createSprite(0, 0, 'Tileset', this.group);
	this.bar.frame = frame;
	
	
	// The text:
	this.text = gs.createText(0, 0, '', 'PixelFontOutline6-White', 14, this.group);
	this.text.setAnchor(0.5, 0.5);
	
	this.setPosition(x, y);
}

// SET_POSITION:
// ************************************************************************************************
UIBar.prototype.setPosition = function (x, y) {
	this.frame.x = x;
	this.frame.y = y;
	
	this.bar.x = x + SCALE_FACTOR;
	this.bar.y = y + SCALE_FACTOR;
	
	this.text.x = x + this.frame.width / 2;
	this.text.y = y + 14;
};

// SET_PERCENT:
// ************************************************************************************************
UIBar.prototype.setPercent = function (percent) {
	if (percent === 0) {
		this.bar.visible = false;
	}
	else {
		this.bar.visible = true;
		this.bar.scale.setTo(Math.max(0, percent * 62 * SCALE_FACTOR), SCALE_FACTOR);
	}
};

// SET_VISIBLE:
// ************************************************************************************************
UIBar.prototype.setVisible = function (b) {
	this.group.visible = b;
};

// SET_TEXT:
// ************************************************************************************************
UIBar.prototype.setText = function (str) {
	this.text.setText(str);
};

// IS_POINTER_OVER:
// ************************************************************************************************
UIBar.prototype.isPointerOver = function () {
	return this.frame.input.checkPointerOver(game.input.activePointer);
};