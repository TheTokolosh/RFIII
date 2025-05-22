/*global gs, game*/
/*global SCALE_FACTOR, HUD_START_X, SCREEN_HEIGHT, HUGE_WHITE_FONT*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UIMenuBase () {}

// INIT:
// ************************************************************************************************
UIMenuBase.prototype.init = function (titleStr, menuSprite = 'SmallMenu') {
	// Dimensions:
	this.width = game.cache.getBaseTexture(menuSprite).width * SCALE_FACTOR;
	this.height = game.cache.getBaseTexture(menuSprite).height * SCALE_FACTOR;
	this.startX = HUD_START_X / 2 - this.width / 2;
	this.startY = (SCREEN_HEIGHT - this.height) / 2;
	
	// Menu Group:
	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	// Menu Sprite:
	let sprite = gs.createSprite(this.startX, this.startY, menuSprite, this.group);
	
	// Title Text:
	this.titleText = gs.createText(this.startX + this.width / 2, this.startY + 6, titleStr, 'PixelFont6-White', 18, this.group);
	this.titleText.setAnchor(0.5, 0);
	
	// Buttons List:
	this.buttons = [];
	
	// Close button:
	this.closeButton = this.createTextButton(this.startX + this.width / 2, this.startY + this.height - 20, 'Close', this.onCloseButtonClicked, this, this.group);
};

// ON_CLOSE_BUTTON_CLICKED:
// ************************************************************************************************
UIMenuBase.prototype.onCloseButtonClicked = function () {
	gs.stateManager.popState();
};

// CLOSE:
// ************************************************************************************************
UIMenuBase.prototype.close = function () {
	this.group.visible = false;
};

// RESET_BUTTONS:
// ************************************************************************************************
UIMenuBase.prototype.resetButtons = function () {
	// Make sure to unclick all buttons:
	this.buttons.forEach(function (button) {
		button.button.frame = 0;
	});
};

// CREATE_TEXT_BUTTON:
// ************************************************************************************************
UIMenuBase.prototype.createTextButton = function (x, y, text, callBack, context, group, image = 'SmallTextButton') {
	// Create button:
	let button = gs.createTextButton(x, y, text, callBack, context, group, image);
	
	// Add to button list:
	this.buttons.push(button);
	
	// Return:
	return button;
};