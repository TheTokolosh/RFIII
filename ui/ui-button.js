/*global gs, game, console, Phaser*/
/*global SCALE_FACTOR*/
'use strict';

// CREATE_BUTTON:
// ************************************************************************************************
gs.createButton = function (x, y, image, frame, callBack, context, group) {
	var button = new UIButton();
	
	button.init(x, y, image, frame, callBack, context, group);
	
    return button;
};

// CREATE_SMALL_BUTTON:
// ************************************************************************************************
gs.createSmallButton = function (x, y, frame, callBack, context, group) {
	var button;
	button = gs.createButton(x, y, 'Tileset', frame + 1, callBack, context, group);
	button.button.hitArea = new Phaser.Rectangle(4, 4, 12, 10);
	return button;
};

// UI_BUTTON_CONSTRUCTOR:
// ************************************************************************************************
function UIButton () {}

// INIT:
// ************************************************************************************************
UIButton.prototype.init = function (x, y, image, frame, callBack, context, group) {
	// Button:
	this.button = game.add.button(x, y, image, null, null, frame, frame - 1);
	this.button.smoothed = false;
	this.button.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	
	// Setting up events:
	this.button.onInputDown.add(this.onInputDown, this);
	this.button.onInputOut.add(this.onInputOut, this);
	this.button.onInputUp.add(this.onInputUp, this);
	
	// Properties:
	this.clicked = false;
	this.callBack = callBack;
	this.context = context;
	this.x = x;
	this.y = y;
	this.width = this.button.width;
	this.height = this.button.height;
	
	if (group) {
		group.add(this.button);
	}
};



// SET_POSITION:
// ************************************************************************************************
UIButton.prototype.setPosition = function (x, y) {
	this.button.x = x;
	this.button.y = y;
};

// ON_INPUT_DOWN:
// ************************************************************************************************
UIButton.prototype.onInputDown = function () {
	this.clicked = true;
};

// ON_INPUT_OUT:
// ************************************************************************************************
UIButton.prototype.onInputOut = function () {
	this.clicked = false;
};

// ON_INPUT_UP:
// ************************************************************************************************
UIButton.prototype.onInputUp = function () {
	
	if (this.clicked) {
		this.callBack.call(this.context, this);
	}
};

// SET_FRAMES:
// ************************************************************************************************
UIButton.prototype.setFrames = function (base, mouseOver) {
	
	mouseOver = mouseOver || base - 1;
	
	this.button.setFrames(base, mouseOver);
};

// IS_POINTER_OVER:
// ************************************************************************************************
UIButton.prototype.isPointerOver = function () {
	return this.isVisible() && this.button.input.checkPointerOver(game.input.activePointer);
};

// IS_VISIBLE:
// ************************************************************************************************
UIButton.prototype.isVisible = function () {
	return this.button.visible;
};

// SET_VISIBLE:
// ************************************************************************************************
UIButton.prototype.setVisible = function (b) {
	this.button.visible = b;
};