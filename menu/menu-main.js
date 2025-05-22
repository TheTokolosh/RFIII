/*global gs, game, nw, console, util, gui*/
/*global menuState*/
/*global HUD_START_X, SCREEN_WIDTH, ZONE_FADE_TIME, HUGE_WHITE_FONT, LARGE_WHITE_FONT*/
/*global SCREEN_HEIGHT, SMALL_WHITE_FONT*/
/*jshint esversion: 6*/
'use strict';




// CONSTRUCTOR:
// ************************************************************************************************
function MainMenu () {
	var startX = HUD_START_X, 
		startY = 0,
		width = SCREEN_WIDTH - startX,
		sprite;
	
	// Group:
	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	// Menu Sprite:
	sprite = gs.createSprite(HUD_START_X, 0, 'HUD', this.group);
	
	// Title Text:
	this.titleText = gs.createText(startX + width / 2, 4, 'Main Menu', 'PixelFont6-White', 18, this.group); 
	this.titleText.setAnchor(0.5, 0);
	
	// Buttons:
	let y = 65, spacing = 34, i = 0;
	
	this.newGameButton = 		gs.createTextButton(startX + width / 2, y + spacing * i++, 'New Game', 			this.onNewGameClicked, this, this.group);
	this.continueGameButton = 	gs.createTextButton(startX + width / 2, y + spacing * i++, 'Continue Game', 	this.onContinueGameClicked, this, this.group);
	this.recordsButton = 		gs.createTextButton(startX + width / 2, y + spacing * i++, 'Game Records', 		this.onMenuClicked.bind(this, 'RecordMenu'), this, this.group);
	this.tablesButton =			gs.createTextButton(startX + width / 2, y + spacing * i++, 'Records Tables', 	this.onMenuClicked.bind(this, 'StatTablesMenu'), this, this.group);
	this.controlsButton =		gs.createTextButton(startX + width / 2, y + spacing * i++, 'Controls', 			this.onMenuClicked.bind(this, 'ControlsMenu'), this, this.group);	
	this.optionsButton =		gs.createTextButton(startX + width / 2, y + spacing * i++, 'Options', 			this.onMenuClicked.bind(this, 'OptionsMenu'), this, this.group);	
	this.exitButton = 			gs.createTextButton(startX + width / 2, y + spacing * i++, 'Exit', 				this.onExitClicked, this, this.group);	
	
	// Text:
	this.text = gs.createText(startX + 8, SCREEN_HEIGHT - 4, '', 'PixelFont6-White', 12, this.group);
	this.text.lineSpacing = -5;
	this.text.setAnchor(0, 1);
	
	this.group.visible = false;
}

// UPDATE:
// ************************************************************************************************
MainMenu.prototype.update = function () {
	let str = '';
	
	// Set Continue Text:
	if (util.doesFileExist('WorldData') && this.continueGameButton.button.input.checkPointerOver(game.input.activePointer)) {		
		str = 'level ' + this.saveData.player.level + ' ';
		str += gs.capitalSplit(this.saveData.player.race) + ' ';
		str += gs.capitalSplit(this.saveData.player.characterClass) + '\n';
		str += gs.capitalSplit(this.saveData.zoneName) + ': ' + this.saveData.zoneLevel;
	}
	
	this.text.setText(gs.wrapText(str, 32).join('\n'));
};

// OPEN:
// ************************************************************************************************
MainMenu.prototype.open = function () {
	let y = 65, spacing = 34, i = 0;
	
	// Player has a save:
	if (util.doesFileExist('WorldData')) {
		this.saveData = util.readFile('WorldData');
		
		this.continueGameButton.setVisible(true);
		
		this.newGameButton.group.y = y + spacing * i++;
		this.continueGameButton.group.y = y + spacing * i++;
		this.recordsButton.group.y = y + spacing * i++;
		this.tablesButton.group.y = y + spacing * i++;
		this.controlsButton.group.y = y + spacing * i++;
		this.optionsButton.group.y =y + spacing * i++;
		this.exitButton.group.y = y + spacing * i++;
	}
	// Player has no save:
	else {
		this.continueGameButton.setVisible(false);
		
		this.newGameButton.group.y = y + spacing * i++;
		this.recordsButton.group.y = y + spacing * i++;
		this.tablesButton.group.y = y + spacing * i++;
		this.controlsButton.group.y = y + spacing * i++;
		this.optionsButton.group.y = y + spacing * i++;
		this.exitButton.group.y = y + spacing * i++;
	}
	
	
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
MainMenu.prototype.close = function () {
	this.group.visible = false;
};

// ON_NEW_GAME_CLICKED:
// ************************************************************************************************
MainMenu.prototype.onNewGameClicked = function () {
	var onYes, dialog = [{}];
	
	if (gs.stateManager.isCurrentState('NewGameMenu')) {
		gs.stateManager.popState();
		return;
	}
	
	// Close any existing menus:
	if (!gs.stateManager.isCurrentState('MainMenu')) {
		gs.stateManager.popState();
	}
	
	
	onYes = function () {
		gs.stateManager.pushState('NewGameMenu', null, false);
	}.bind(this);
	
	
	dialog[0].text = 'You currently have a saved game stored. Are you sure you want to start a new game?';
	dialog[0].responses = [
		{text: 'Yes', nextLine: 'exit', func: onYes, keys: ['accept']},
		{text: 'No', nextLine: 'exit', keys: ['escape']},
	];
	
	if (util.doesFileExist('WorldData') && !gs.debugProperties.startClass) {
		gs.messageQueue.pushMessage(dialog, false); // Passing false to not close the main menu
	}
	else {
		onYes();
	}
	
	
};

// ON_CONTINUE_GAME_CLICKED:
// ************************************************************************************************
MainMenu.prototype.onContinueGameClicked = function () {
	// Only start new game if all other menus are closed:
	if (!gs.stateManager.isCurrentState('MainMenu')) {
		return;
	}
	
	if (util.doesFileExist('WorldData')) {
		gs.startDailyChallenge = false;
		gs.setSeed = null;
		gs.mainMenuBase.startGame();
	}
};

// ON_MENU_CLICKED:
// ************************************************************************************************
MainMenu.prototype.onMenuClicked = function (stateName) {
	if (gs.stateManager.isCurrentState('DialogMenu')) {
		return;
	}
	// Closing Record Menu:
	else if (gs.stateManager.isCurrentState(stateName)) {
		gs.stateManager.popState();
	}
	else {
		// Closing current menu:
		if (!gs.stateManager.isCurrentState('MainMenu')) {
			gs.stateManager.popState();
		}
		
		gs.stateManager.pushState(stateName, null, false);
	}
};

// ON_RECORDS_CLICKED:
// ************************************************************************************************
MainMenu.prototype.onRecordsClicked = function () {
	
	if (gs.stateManager.isCurrentState('DialogMenu')) {
		return;
	}
	// Closing Record Menu:
	else if (gs.stateManager.isCurrentState('RecordMenu')) {
		gs.stateManager.popState();
	}
	else {
		// Closing current menu:
		if (!gs.stateManager.isCurrentState('MainMenu')) {
			gs.stateManager.popState();
		}
		
		gs.stateManager.pushState('RecordMenu', null, false);
	}
};

// ON_TABLES_CLICKED:
// ************************************************************************************************
MainMenu.prototype.onTablesClicked = function () {
	
	if (gs.stateManager.isCurrentState('DialogMenu')) {
		return;
	}
	else if (gs.stateManager.isCurrentState('OptionsMenu')) {
		gs.stateManager.popState(); // options menu
		gs.stateManager.pushState('RecordMenu', null, false); // False to keep underlying menu open
	}
	else if (gs.stateManager.isCurrentState('StatTablesMenu')) {
		gs.stateManager.popState();
	}
	else {
		gs.stateManager.pushState('StatTablesMenu', null, false); // False to keep underlying menu open
	}
};




// ON_CONTROLS_CLICKED:
// ************************************************************************************************
MainMenu.prototype.onControlsClicked = function () {
	if (gs.stateManager.isCurrentState('DialogMenu')) {
		return;
	}
	else if (gs.stateManager.isCurrentState('RecordMenu')) {
		gs.stateManager.popState(); // options menu
		gs.stateManager.pushState('ControlsMenu', null, false); // False to keep underlying menu open
	}
	else if (gs.stateManager.isCurrentState('ControlsMenu')) {
		gs.stateManager.popState();
	}
	else {
		gs.stateManager.pushState('ControlsMenu', null, false); // False to keep underlying menu open
	}
};

// ON_OPTIONS_CLICKED:
// ************************************************************************************************
MainMenu.prototype.onOptionsClicked = function () {
	if (gs.stateManager.isCurrentState('DialogMenu')) {
		return;
	}
	else if (gs.stateManager.isCurrentState('RecordMenu')) {
		gs.stateManager.popState(); // options menu
		gs.stateManager.pushState('OptionsMenu', null, false); // False to keep underlying menu open
	}
	else if (gs.stateManager.isCurrentState('OptionsMenu')) {
		gs.stateManager.popState();
	}
	else {
		gs.stateManager.pushState('OptionsMenu', null, false); // False to keep underlying menu open
	}
};

// ON_EXIT_CLICKED:
// ************************************************************************************************
MainMenu.prototype.onExitClicked = function () {
	gs.saveGlobalData();
	nw.App.closeAllWindows();
};

// IS_OPEN:
// ************************************************************************************************
MainMenu.prototype.isOpen = function () {
	return this.group.visible;
};