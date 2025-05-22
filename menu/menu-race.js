/*global game, gs, console, Phaser, menuState*/
/*global SCREEN_WIDTH, ZONE_FADE_TIME, SMALL_WHITE_FONT, HUD_START_X, SCREEN_HEIGHT, HUD_WIDTH*/
/*global LARGE_WHITE_FONT, HUGE_WHITE_FONT*/

'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function RaceSelectMenu () {
	var sprite,
		startX = HUD_START_X,
		width = SCREEN_WIDTH - startX,
		iconSpaceY = 34;
	
	// Group:
	this.group = game.add.group();
	this.group.fixedToCamera = true;

	// Menu Sprite:
	sprite = gs.createSprite(HUD_START_X, 0, 'HUD', this.group);
	
	// Title Text:
	this.titleText = gs.createText(startX + width / 2, 4, 'Select Race', 'PixelFont6-White', 18, this.group); 
	this.titleText.setAnchor(0.5, 0);
	
	// Text:
	this.text = gs.createText(startX + 8, SCREEN_HEIGHT - 4, '', 'PixelFont6-White', 12, this.group); 
	this.text.maxWidth = 344;
	this.text.setAnchor(0, 1);
	
	// Create Race Buttons:
	this.raceButtons = [];
	gs.playerRaceList.forEach(function (playerRace, i) {
		var button;
		button = gs.createTextButton(startX + width / 2, 50 + i * iconSpaceY, playerRace.name, this.raceClicked, this, this.group);
		button.playerRace = playerRace;
		this.raceButtons.push(button);
	}, this);
	
	// Back button:
	this.backButton = gs.createTextButton(startX + width / 2, this.raceButtons[this.raceButtons.length - 1].group.y + iconSpaceY, 'Back', this.onBackClicked, this, this.group);
	
	this.group.visible = false;
}

// UPDATE:
// ************************************************************************************************
RaceSelectMenu.prototype.update = function () {
	var str = '';
	
	this.raceButtons.forEach(function (textButton) {
		if (textButton.button.input.checkPointerOver(game.input.activePointer)) {
			str = textButton.playerRace.desc();
		}
	}, this);
	
	this.text.setText(str);
};

// RACE_CLICKED:
// ************************************************************************************************
RaceSelectMenu.prototype.raceClicked = function (button) {
	// Clearing game data to start the new game
	gs.clearGameData();
	
	gs.startDailyChallenge = false;
	
	// Set Race:
	gs.playerRace = button.playerRace;
	
	gs.mainMenuBase.startGame();
};


// OPEN:
// ************************************************************************************************
RaceSelectMenu.prototype.open = function () {
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
RaceSelectMenu.prototype.close = function () {
	this.group.visible = false;
};

// ON_BACK_CLICKED:
// ************************************************************************************************
RaceSelectMenu.prototype.onBackClicked = function () {
	gs.stateManager.popState();
};

// IS_OPEN:
// ************************************************************************************************
RaceSelectMenu.prototype.isOpen = function () {
	return this.group.visible;
};
