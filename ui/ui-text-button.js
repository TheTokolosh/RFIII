/*global gs, game, console*/
/*global UIButton*/
/*global SMALL_WHITE_FONT, LARGE_WHITE_FONT*/
/*jshint esversion: 6*/
'use strict';

// CREATE_TEXT_BUTTON:
// Text will be centered in the button
// ************************************************************************************************
gs.createTextButton = function (x, y, text, callBack, context, group, image = 'SmallTextButton') {
	var button = new UITextButton();
	
	button.init(x, y, text, callBack, context, group, image);
	
    return button;
};

// TEXT_BUTTON_CONSTRUCTOR:
// ************************************************************************************************
function UITextButton () {}
UITextButton.prototype = new UIButton();

// INIT:
// ************************************************************************************************
UITextButton.prototype.init = function (x, y, text, callBack, context, group, image) {
	UIButton.prototype.init.call(this, 0, 0, image, 1, callBack, context, null);
	
	// Create button group:
    this.group = game.add.group();
    this.group.x = x;
	this.group.y = y;
	
	// Button:
	this.button.anchor.setTo(0.5, 0.5);
	this.group.add(this.button);
	
    // Create text:
	this.text = gs.createText(0, 2, text, 'PixelFont6-White', 12, this.group);
	this.text.setAnchor(0.5, 0.5);

	
	// Adding to outer group:
	if (group) {
		group.add(this.group);
	}
};

// SET_POSITION:
// ************************************************************************************************
UITextButton.prototype.setPosition = function (x, y) {
	this.group.x = x;
	this.group.y = y;
};

// SET_TEXT:
// ************************************************************************************************
UITextButton.prototype.setText = function (str) {
	this.text.setText(str);
};

// SET_VISIBLE:
// ************************************************************************************************
UITextButton.prototype.setVisible = function (b) {
	this.group.visible = b;
};

// IS_VISIBLE:
// ************************************************************************************************
UITextButton.prototype.isVisible = function () {
	return this.group.visible;
};

// SET_FONT:
// ************************************************************************************************
UITextButton.prototype.setFont = function (font) {
	this.text.setFont(font);
};

// CREATE_STAT_TEXT_BUTTON:
// Text will be left aligned and val text will be right aligned
// ************************************************************************************************
gs.createStatTextButton = function (x, y, text, callBack, context, group) {
	var button = new UIStatTextButton();
		
	button.init(x, y, text, callBack, context, group);
		
	return button;
};

// ************************************************************************************************
// STAT_TEXT_BUTTON_CONSTRUCTOR:
// ************************************************************************************************
function UIStatTextButton () {}
UIStatTextButton.prototype = new UITextButton();

// INIT:
// ************************************************************************************************
UIStatTextButton.prototype.init = function (x, y, text, callBack, context, group) {
	UITextButton.prototype.init.call(this, x, y, text, callBack, context, group, 'Button');
	
	// Right align text:
	this.text.x = this.button.x - this.button.width / 2 + 6;
	this.text.y = this.button.y + 2;
	this.text.setAnchor(0, 0.5);
	
	// Create left aligned numText:
	this.numText = gs.createText(this.button.x + this.button.width / 2 - 4, this.button.y + 2, '5/5', 'PixelFont6-White', 12, this.group);
	this.numText.setAnchor(1, 0.5);
};

// SET_NUM_TEXT:
// ************************************************************************************************
UIStatTextButton.prototype.setNumText = function (str) {
	this.numText.setText(str);
};

// SET_STYLE:
// ************************************************************************************************
UIStatTextButton.prototype.setFont = function (font) {
	this.text.setFont(font);
	this.numText.setFont(font);
};