/*global gs, game*/
/*global LARGE_WHITE_FONT*/
/*jshint esversion: 6*/
'use strict';

// UI_TEXT_BOX_CONSTRUCTOR:
// **********************************************************************************
function UITextBox (position, group) {
	this.group = game.add.group();
	this.sprite = gs.createSprite(0, 0, 'TextBox', this.group);
	
	this.text = gs.createText(0, 0, 'Default Text', 'PixelFont6-White', 12, this.group);
	this.text.maxWidth = 470; // 464
	
	this.setPosition(position.x, position.y);
	
	if (group) {
		group.add(this.group);
	}
}

// SET_POSITION:
// **********************************************************************************
UITextBox.prototype.setPosition = function (x, y) {
	this.sprite.x = x;
	this.sprite.y = y;
	
	this.text.x = x + 10;
	this.text.y = y + 8;
};

// SET_TEXT:
// **********************************************************************************
UITextBox.prototype.setText = function (str) {
	this.text.setText(str);
};