/*global game, gs, console, Phaser*/
/*global SMALL_WHITE_FONT, LARGE_WHITE_FONT*/
/*jshint esversion: 6*/
'use strict';

// UI_TEXT_BUTTON_LIST
// ************************************************************************************************
function UITextButtonList(startX, startY, numButtons, callback, context, group) {
	var buttonSpace = 34;
	
	this.startIndex = 0;
	this.group = group;
	this.buttons = [];
	
	// Buttons:
	for (let i = 0; i < numButtons; i += 1) {
		this.buttons[i] =  this.createButton(startX, startY + i * buttonSpace, callback, context);
	}
	
	// Arrows:
	this.upArrow = gs.createButton(startX + 120, startY - 20, 'Tileset', 1296, this.upClicked, this, this.group);
	this.downArrow = gs.createButton(startX + 120, startY + (numButtons - 1) * buttonSpace - 20, 'Tileset', 1294, this.downClicked, this, this.group);
}

// CREATE_BUTTON:
// ************************************************************************************************
UITextButtonList.prototype.createButton = function (x, y, callback, context) {
	return gs.createStatTextButton(x, y, '', callback, context, this.group);
};

// DOWN_CLICKED:
// ************************************************************************************************
UITextButtonList.prototype.downClicked = function () {
	this.startIndex += 1;
	gs.characterMenu.refresh();
};

// UP_CLICKED:
// ************************************************************************************************
UITextButtonList.prototype.upClicked = function () {
	if (this.startIndex > 0) {
		this.startIndex -= 1;
		gs.characterMenu.refresh();
	}
};