/*global game, Phaser, gs, console, util, document, navigator, gui, steam*/
/*global ClassSelectMenu, RaceSelectMenu, MainMenu*/
/*global LARGE_WHITE_FONT, TILE_SIZE, SCREEN_WIDTH, SCREEN_HEIGHT, HUD_START_X*/
/*global HUGE_WHITE_FONT, ITEM_SLOT_FRAME, NUM_SCREEN_TILES_X, SMALL_WHITE_FONT, ZONE_FADE_TIME, LARGE_RED_FONT*/
/*global MUSIC_ON_BUTTON_FRAME, MUSIC_OFF_BUTTON_FRAME*/
/*jshint esversion: 6*/

'use strict';

var menuState = {};


// MAIN_MENU_BASE:
// ************************************************************************************************
function MainMenuBase () {
	let tileIndex;
	
	// Group:
	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	
	// Game Title:
	this.titleSprite = gs.createSprite(120, 10, 'Title', this.group);
	this.titleSprite.scale.setTo(1, 1);

	// Version Text:
	this.versionText = gs.createText(4, 0, 'Version: ' + gs.versionStr, 'PixelFont6-White', 12, this.group);

	// Credits Text:
	let str = 'Programming and Art: Justin Wang\n';
	str += 'Design: Justin Wang and Colten Stephens\n';
	str += 'Sound: www.kenney.nl and ArtisticDude\n';
	str += 'Music: Nooskewl Games';
	this.creditsText = gs.createText(4, SCREEN_HEIGHT, str, 'PixelFont6-White', 12, this.group);
	this.creditsText.setAnchor(0, 1);
	
	
	this.group.visible = false;
}

// UPDATE:
// ************************************************************************************************
MainMenuBase.prototype.update = function () {
	
	/*
	if (gs.globalData.userName && gs.globalData.userName.length >= 1) {
		this.userNameText.setText('User Name: ' + gs.globalData.userName);
		this.userNameText.setFont('PixelFont6-White');
	}
	else {
		this.userNameText.setText('Not logged in (see discord FAQ)');
		this.userNameText.setFont('PixelFont6-Red');
	}
	*/
	
	if (gs.globalData.lastVersion !== gs.versionStr) {
		this.openUpdateDialog();
	}
	
	gs.mainMenu.update();
	gs.stateManager.update();
	gs.messageQueue.update();
	
	if (gs.debugProperties.menuMap) {
		// Changing background levels:
		this.count += 1;
		if (util.vectorEqual(util.toTileIndex(this.camPos), this.camDestIndex) || !gs.isInBounds(util.toTileIndex(this.camPos))) {
			// Only change level if enough time has passed:
			if (this.count >= 300) {
				this.count = 0;
				gs.destroyLevel();
				gs.loadRandomMapAsBackground();
			}

			// Get new destIndex:
			this.camDestIndex = gs.getOpenIndexInLevel();
			while( util.vectorEqual(this.camDestIndex, util.toTileIndex(this.camPos))) {
				this.camDestIndex = gs.getOpenIndexInLevel();
			}
			this.camVelocity = util.normal(util.toTileIndex(this.camPos), this.camDestIndex);

		}

		// Panning Camera:
		this.camPos.x += this.camVelocity.x * 2;
		this.camPos.y += this.camVelocity.y * 2;
		game.camera.focusOnXY(this.camPos.x + 124, this.camPos.y);
		
		if (gs.debugProperties.screenShotMode) {
			gs.shadowMaskSprite.x = this.camPos.x - 20;
			gs.shadowMaskSprite.y = this.camPos.y;	
			gs.shadowMaskSprite.visible = true;
			gs.shadowSpritesGroup.alpha = 0.75;
		}
		
		gs.updateTileMapSprites();

		gs.objectSpritesGroup.sort('y', Phaser.Group.SORT_ASCENDING);
	}
	
	
};

// OPEN_UPDATE_DIALOG:
MainMenuBase.prototype.openUpdateDialog = function () {
	var dialog = [{}], onYes, str;
	
	onYes = function () {
		gui.Shell.openExternal('https://steamcommunity.com/games/956450/announcements/');
	};
	
	gs.globalData.lastVersion = gs.versionStr;
	gs.saveGlobalData();
	
	str = 'New Update released: ' + gs.versionStr + '\n';
	str += 'Saves created before this update may no longer function';
	
	dialog[0].text = str;
	dialog[0].responses = [
		{text: 'View Update in Browser', nextLine: 'exit', func: onYes, keys: ['accept']},
		{text: 'Close', nextLine: 'exit', keys: ['escape']},
	];
	
	gs.messageQueue.pushMessage(dialog, false); // false indicates that previous state should not close
};

// START_GAME:
// ************************************************************************************************
MainMenuBase.prototype.startGame = function () {
	let onFlashComplete = function () {
		game.camera.inTransition = false;
	}.bind(this);
	
	let onFadeComplete = function () {
		game.camera.onFadeComplete.removeAll();
		this.close();
		gs.startGame();
		game.camera.flash('#ffffff', ZONE_FADE_TIME * 4);
		game.camera.onFlashComplete.addOnce(onFlashComplete, this);
	}.bind(this);
	
	
	
	// Starting a fade:
	game.camera.fade('#000000', ZONE_FADE_TIME * 2);
    game.camera.onFadeComplete.addOnce(onFadeComplete, this);
	game.camera.inTransition = true;
};

// OPEN:
// ************************************************************************************************
MainMenuBase.prototype.open = function () {
	var tileIndex;
	
	// Random Map Background:
	if (gs.debugProperties.menuMap) {
		gs.loadRandomMapAsBackground();
		gs.shadowMaskSprite.visible = false;
	}
	
	
	// Music:
	gs.stopAllMusic();
	
	// Music On:
	if (gs.musicOn) {
		gs.music.MainMenu.loopFull();
	}
	// Music Off:
	else {
		gs.stopAllMusic();
	}
	
	if (gs.debugProperties.menuMap) {
		tileIndex = gs.getOpenIndexInLevel();
		this.camPos = {x: tileIndex.x * TILE_SIZE - TILE_SIZE / 2, y: tileIndex.y * TILE_SIZE - TILE_SIZE / 2};

		// Get dest (not same as pos):
		this.camDestIndex = gs.getOpenIndexInLevel();
		while (util.vectorEqual(this.camDestIndex, util.toTileIndex(this.camPos))) {
			this.camDestIndex = gs.getOpenIndexInLevel();
		}

		this.camVelocity = util.normal(util.toTileIndex(this.camPos), this.camDestIndex);
		this.count = 0;
	}
	
	

	
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
MainMenuBase.prototype.close = function () {
	this.group.visible = false;
};




