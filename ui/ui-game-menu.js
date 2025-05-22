/*global game, gs, Phaser, console, nw*/
/*global Item, UIMenuBase*/
/*global HUGE_WHITE_FONT, SCREEN_HEIGHT, NUM_EQUIPMENT_SLOTS, HUD_START_X*/
/*global UIItemSlotList, ItemSlotList*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UIGameMenu() {
	UIMenuBase.prototype.init.call(this, 'Game Menu', 'GameMenu');
	
	// Buttons:
	let spacing = 34;
	
	// Buttons:
	this.createTextButton(this.startX + this.width / 2, this.startY + 60 + spacing * 0, 'Controls', this.onControlsClicked, this, this.group);
	this.createTextButton(this.startX + this.width / 2, this.startY + 60 + spacing * 1, 'Options', this.onOptionsClicked, this, this.group);
	this.createTextButton(this.startX + this.width / 2, this.startY + 60 + spacing * 2, 'Exit to Main Menu', this.onMainMenuClicked, this, this.group);
	this.createTextButton(this.startX + this.width / 2, this.startY + 60 + spacing * 3, 'Exit to Desktop', this.onDesktopClicked, this, this.group);	
	
	// Seed Text:
	this.seedText = gs.createText(this.startX + this.width / 2, this.startY + this.height - 56, 'Hello World', 'PixelFont6-White', 12, this.group);
	this.seedText.setAnchor(0.5, 0);
	
	this.group.visible = false;
}
UIGameMenu.prototype = new UIMenuBase();

// OPEN:
// ************************************************************************************************
UIGameMenu.prototype.open = function () {
	gs.pc.stopExploring();
	gs.timer.pause();
	
	this.seedText.setText('Seed: ' + gs.seed);
	
	this.group.visible = true;
	this.resetButtons();
};

// CLOSE:
// ************************************************************************************************
UIGameMenu.prototype.close = function () {
	gs.timer.resume();
	this.group.visible = false;
};

// ON_CONTROLS_CLICKED:
// ************************************************************************************************
UIGameMenu.prototype.onControlsClicked = function () {
	gs.stateManager.pushState('ControlsMenu');
};

// ON_OPTIONS_CLICKED:
// ************************************************************************************************
UIGameMenu.prototype.onOptionsClicked = function () {
	gs.stateManager.pushState('OptionsMenu');
};

// ON_DESKTOP_CLICKED:
// ************************************************************************************************
UIGameMenu.prototype.onDesktopClicked = function () {
	gs.saveLevel();
	gs.saveWorld();
	gs.saveGlobalData();
	
	nw.App.closeAllWindows();
};

// ON_MAIN_MENU_CLICKED:
// ************************************************************************************************
UIGameMenu.prototype.onMainMenuClicked = function () {
	this.close();
	
	gs.saveLevel();
	gs.saveWorld();
	
	gs.destroyLevel();
	gs.startMainMenu();
};

