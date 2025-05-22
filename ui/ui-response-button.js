/*global gs, game, console*/
/*global UIButton*/
/*global LARGE_WHITE_FONT*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// CREATE_RESPONSE_BUTTON:
// *****************************************************************************
gs.createResponseButton = function (x, y, callBack, context, group) {
	var button = new UIResponseButton();
	
	button.init(x, y, callBack, context, group);
	
    return button;
};

// UI_RESPONSE_BUTTON:
// *****************************************************************************
function UIResponseButton () {}
UIResponseButton.prototype = new UIButton();


// INIT:
// *****************************************************************************
UIResponseButton.prototype.init = function (x, y, callBack, context, group) {
	UIButton.prototype.init.call(this, 0, 0, 'TextButton', 1, callBack, context, null);
	
	// Create button group:
    this.group = game.add.group();
    this.group.x = x;
	this.group.y = y;
	
	// Button:
	this.group.add(this.button);
	
	// Text:
	this.text = gs.createText(8, 8, 'Default Text', 'PixelFont6-White', 12, this.group);
	
	if (group) {
		group.add(this.group);
	}	
};

// SET_POSITION:
// *****************************************************************************
UIResponseButton.prototype.setPosition = function (x, y) {
	this.group.x = x;
	this.group.y = y;
};

// SET_VISIBLE:
// *****************************************************************************
UIResponseButton.prototype.setVisible = function (b) {
	this.group.visible = b;
};

// IS_VISIBLE:
UIResponseButton.prototype.isVisible = function () {
	return this.group.visible;
};

// SET_TEXT:
// *****************************************************************************
UIResponseButton.prototype.setText = function (str) {
	var textArray, textSum = '';
	
	textArray = gs.wrapText(str, 50);
	for (let i = 0; i < textArray.length; i += 1) {
		textSum += textArray[i] + '\n';
	}
	this.text.setText(textSum);	
};

// SET_FONT:
// *****************************************************************************
UIResponseButton.prototype.setFont = function (font) {
	this.text.setFont(font);
};
