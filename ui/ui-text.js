/*global game*/
'use strict';

function UIText (x, y, textStr, font, fontSize, group) {
	this.text = game.add.bitmapText(x, y, font, textStr, fontSize);
	this.text.smoothed = false;
	
	if (group) {
        group.add(this.text);
    }
}

Object.defineProperty(UIText.prototype, "x", {
  	get: function () {return this.text.x;},
	set: function (x) {this.text.x = x;}
});

Object.defineProperty(UIText.prototype, "y", {
  	get: function () {return this.text.y;},
	set: function (y) {this.text.y = y;}
});

Object.defineProperty(UIText.prototype, "visible", {
  	get: function () {return this.text.visible;},
	set: function (b) {this.text.visible = b;}
});

Object.defineProperty(UIText.prototype, "maxWidth", {
  	get: function () {return this.text.maxWidth;},
	set: function (maxWidth) {this.text.maxWidth = maxWidth;}
});

Object.defineProperty(UIText.prototype, "input", {
  	get: function () {return this.text.input;},
});

Object.defineProperty(UIText.prototype, "inputEnabled", {
  	get: function () {return this.text.inputEnabled;},
	set: function (b) {this.text.inputEnabled = b;}
});

UIText.prototype.destroy = function () {
	this.text.destroy();
};

UIText.prototype.setAnchor = function (x, y) {
	this.text.anchor.setTo(x, y);
};

UIText.prototype.setFont = function (fontName) {
	this.text.font = fontName;
	this.text.smoothed = false;
};

UIText.prototype.setText = function (str) {
	this.text.setText(str);
};