/*global gs, console, game, menuState, util*/
/*global SCREEN_HEIGHT, SMALL_WHITE_FONT, HUGE_WHITE_FONT, CLASS_LIST, PLAYER_FRAMES, HUD_START_X, SCALE_FACTOR*/
/*global PLAYER_RACE_FRAMES, SLOT_SELECT_BOX_FRAME*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// UI_SEED_GAME_MENU:
// ************************************************************************************************
function UISeedGameMenu() {
	// Dimensions:
	this.width = game.cache.getBaseTexture('TextInputMenu').width * SCALE_FACTOR;
	this.height = game.cache.getBaseTexture('TextInputMenu').height * SCALE_FACTOR;
	this.startX = HUD_START_X / 2 - this.width / 2;
	this.startY = (SCREEN_HEIGHT - this.height) / 2;
	
	// Group:
	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	// Properties:
	this.seedStr = '';
	
	// Menu:
    let sprite = gs.createSprite(this.startX, this.startY, 'TextInputMenu', this.group);

	// Title Text:
	this.titleText = gs.createText(this.startX + this.width / 2, this.startY + 6, 'Gargoyle Necromancer', 'PixelFont6-White', 18, this.group);
	this.titleText.setAnchor(0.5, 0);
	
	// Seed Text:
	this.seedText = gs.createText(this.startX + 20, this.startY + 48, '', 'PixelFont6-White', 12, this.group);
	
	// Buttons:
	gs.createTextButton(this.startX + 84, this.startY + this.height - 22, 'Start Game', this.onStartGameClicked, this, this.group, 'SmallButton');
	gs.createTextButton(this.startX + 236, this.startY + this.height - 22, 'Back', this.onBackClicked, this, this.group, 'SmallButton');
	
	
	// Hide:
	this.group.visible = false;
}

// REFRESH:
// ************************************************************************************************
UISeedGameMenu.prototype.refresh = function () {
	this.titleText.setText(gs.playerRace.name + ' ' + gs.capitalSplit(gs.playerClass));
	
	this.seedText.setText(this.seedStr);
};

// UPDATE:
// ************************************************************************************************
UISeedGameMenu.prototype.update = function () {

};

// CAPTURE_KEY_DOWN:
// ************************************************************************************************
UISeedGameMenu.prototype.captureKeyDown = function (key) {
	let isNum = key.keyCode >= 48 && key.keyCode <= 57;
	let isLetter = key.keyCode >= 65 && key.keyCode <= 90;
	
	// Entering a value:
	if (isNum) {
		if (this.seedText.text.width < 260) {
			this.seedStr += (key.keyCode - 48);
		}
	}
	else if (isLetter) {
		if (this.seedText.text.width < 260) {
			this.seedStr += key.name;
		}
	}
	// Deleting a value:
	else if (key.keyCode === 8) {
		if (this.seedStr.length > 0) {
			this.seedStr = this.seedStr.slice(0, -1);
		}
	}
	else if (key.keyCode === 13) {
		this.onStartGameClicked();
	}

	this.refresh();
};

// ON_START_GAME_CLICKED:
// ************************************************************************************************
UISeedGameMenu.prototype.onStartGameClicked = function () {
	if (this.seedStr.length === 0) {
		return;
	}
	
	// Clearing game data to start the new game
	gs.clearGameData();
	
	// Set New-Game Properties:
	gs.startDailyChallenge = false;
	gs.setSeed = this.seedStr;
	
	// Start Game:
	gs.mainMenuBase.startGame();
};
	
// ON_BACK_CLICKED:
// ************************************************************************************************
UISeedGameMenu.prototype.onBackClicked = function () {
	gs.stateManager.popState();
	gs.stateManager.pushState('NewGameMenu', null, false);
};

// OPEN:
// ************************************************************************************************
UISeedGameMenu.prototype.open = function () {
	this.refresh();
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
UISeedGameMenu.prototype.close = function () {
	this.group.visible = false;
};

// IS_OPEN:
// ************************************************************************************************
UISeedGameMenu.prototype.isOpen = function () {
	return this.group.visible;
};

