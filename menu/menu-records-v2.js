/*global gs, console, game, menuState, util*/
/*global SCREEN_HEIGHT, SMALL_WHITE_FONT, HUGE_WHITE_FONT, CLASS_LIST, PLAYER_FRAMES, HUD_START_X, SCALE_FACTOR*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// UI_RECORD_MENU:
// ************************************************************************************************
function UIRecordMenuV2() {
	// Selected Index:
	this.selectedClassIndex = 0;
	this.selectedRaceIndex = 0;
	this.selectedGameTypeIndex = 0;
	
	// Lists:
	this.classList = ['All'].concat(CLASS_LIST);
	this.raceList = ['All'].concat(gs.playerRaceList.map(e => e.name));
	this.gameTypeList = ['All', 'Standard', 'Daily Challenge'];
	
	// Dimensions:
	this.width = game.cache.getBaseTexture('RecordsMenu').width * SCALE_FACTOR;
	this.height = game.cache.getBaseTexture('RecordsMenu').height * SCALE_FACTOR;
	this.startX = HUD_START_X / 2 - this.width / 2;
	this.startY = (SCREEN_HEIGHT - this.height) / 2;
	
	// Group:
	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	// Menu:
    let sprite = gs.createSprite(this.startX, this.startY, 'RecordsMenu', this.group);
	
	// Line Highlight:
	this.lineHighLight = gs.createSprite(this.startX + 2, this.startY + 2, 'RecordHighlight', this.group);
	this.lineHighLight.visible = false;
	
	// Class Select:
	this.classSelectSprite = gs.createSprite(this.startX + 2, this.startY + 2, 'RecordHighlight', this.group);
	this.classSelectSprite.visible = false;
	this.classSelectSprite.frame = 1;
	
	// Race Select:
	this.raceSelectSprite = gs.createSprite(this.startX + 2, this.startY + 2, 'RecordHighlight', this.group);
	this.raceSelectSprite.visible = false;
	this.raceSelectSprite.frame = 1;
	
	// Game-Type Select:
	this.gameTypeSelectSprite = gs.createSprite(this.startX + 2, this.startY + 2, 'RecordHighlight', this.group);
	this.gameTypeSelectSprite.visible = false;
	this.gameTypeSelectSprite.frame = 1;
	
	// Class Title:
	gs.createText(this.startX + 6, this.startY + 6, 'Class', 'PixelFont6-White', 18, this.group);
	
	// Class List:
	for (let i = 0; i < this.classList.length; i += 1) {
		gs.createText(this.startX + 6, this.startY + 38 + i * 20, '*' + gs.capitalSplit(this.classList[i]), 'PixelFont6-White', 12, this.group);
	}
	
	// Race Title:
	gs.createText(this.startX + 6, this.startY + 260, 'Race', 'PixelFont6-White', 18, this.group);
	
	// Race List:
	for (let i = 0; i < this.raceList.length; i += 1) {
		gs.createText(this.startX + 6, this.startY + 290 + i * 20, '*' + gs.capitalSplit(this.raceList[i]), 'PixelFont6-White', 12, this.group);
	}
	
	// Game-Type Title:
	gs.createText(this.startX + 6, this.startY + 470, 'Game Type', 'PixelFont6-White', 18, this.group);
	
	// Game-Type List:
	for (let i = 0; i < this.gameTypeList.length; i += 1) {
		gs.createText(this.startX + 6, this.startY + 498 + i * 20, '*' + gs.capitalSplit(this.gameTypeList[i]), 'PixelFont6-White', 12, this.group);
	}
	
	// RECORDS_PANEL:
	// ********************************************************************************************
	// Title:
	gs.createText(this.startX + 314, this.startY + 6, 'Records', 'PixelFont6-White', 18, this.group);
	
	// Stat Names:
	gs.createText(this.startX + 314, this.startY + 38 + 0 * 20, '*Wins', 'PixelFont6-White', 12, this.group);
	gs.createText(this.startX + 314, this.startY + 38 + 1 * 20, '*Deaths', 'PixelFont6-White', 12, this.group);
	gs.createText(this.startX + 314, this.startY + 38 + 2 * 20, '*Win Percent', 'PixelFont6-White', 12, this.group);
	gs.createText(this.startX + 314, this.startY + 38 + 3 * 20, '*Best Time', 'PixelFont6-White', 12, this.group);
	gs.createText(this.startX + 314, this.startY + 38 + 4 * 20, '*Win Streak', 'PixelFont6-White', 12, this.group);
	
	// Stat Values:
	this.winValText 	= gs.createText(this.startX + 314 + 210, this.startY + 38 + 0 * 20, '0', 'PixelFont6-White', 12, this.group);
	this.deathValText 	= gs.createText(this.startX + 314 + 210, this.startY + 38 + 1 * 20, '10', 'PixelFont6-White', 12, this.group);
	this.percentValText = gs.createText(this.startX + 314 + 210, this.startY + 38 + 2 * 20, '100%', 'PixelFont6-White', 12, this.group);
	this.timeValText 	= gs.createText(this.startX + 314 + 210, this.startY + 38 + 3 * 20, '1:00', 'PixelFont6-White', 12, this.group);
	this.streakValText 	= gs.createText(this.startX + 314 + 210, this.startY + 38 + 4 * 20, '3', 'PixelFont6-White', 12, this.group);
	
	// Stat Value Anchors:
	this.winValText.setAnchor(1, 0);
	this.deathValText.setAnchor(1, 0);
	this.percentValText.setAnchor(1, 0);
	this.timeValText.setAnchor(1, 0);
	this.streakValText.setAnchor(1, 0);
	
	// Records Text:
	this.recordsText = gs.createText(this.startX + 170, this.startY + 160, '0', 'PixelFont6-White', 12, this.group);
	
	// Tab Buttons:
	gs.createTextButton(this.startX + 420, this.startY + this.height - 20, 'Close', this.onCloseClicked, this, this.group, 'SmallButton');
		
	this.group.visible = false;
}

// REFRESH:
// ************************************************************************************************
UIRecordMenuV2.prototype.refresh = function () {
	let wins = gs.numWinsWith(this.classList[this.selectedClassIndex], this.raceList[this.selectedRaceIndex], this.gameTypeList[this.selectedGameTypeIndex]);
	let deaths = gs.numDeathsWith(this.classList[this.selectedClassIndex], this.raceList[this.selectedRaceIndex], this.gameTypeList[this.selectedGameTypeIndex]);
	let percent;
	let time = gs.fastestWinTimeWith(this.classList[this.selectedClassIndex], this.raceList[this.selectedRaceIndex], this.gameTypeList[this.selectedGameTypeIndex]);
	let streak = gs.bestWinStreakWith(this.classList[this.selectedClassIndex], this.raceList[this.selectedRaceIndex], this.gameTypeList[this.selectedGameTypeIndex]);
					
	if ((wins + deaths) > 0) {
		percent = util.toPercentStr(wins / (wins + deaths));
	}
	else {
		percent = '0%';
	}
	
	// Set Records Text:
	this.winValText.setText(wins);
	this.deathValText.setText(deaths);
	this.percentValText.setText(percent);
	this.timeValText.setText(gs.timeToString(time));
	this.streakValText.setText(streak);
	
	
	// RECENT_GAMES:
	let latestRecords = gs.gameRecords;
	if (this.gameTypeList[this.selectedGameTypeIndex] === 'Daily Challenge') {
		latestRecords = latestRecords.filter(record => record.isChallenge);
	}
	else if (this.gameTypeList[this.selectedGameTypeIndex] === 'Standard') {
		latestRecords = latestRecords.filter(record => !record.isChallenge);
	}
	
	latestRecords = latestRecords.filter(record => record.playerClass === this.classList[this.selectedClassIndex] || this.classList[this.selectedClassIndex] === 'All');
	latestRecords = latestRecords.filter(record => record.playerRace === this.raceList[this.selectedRaceIndex] || this.raceList[this.selectedRaceIndex] === 'All');
		
	// Most recet 7 games:
	latestRecords = latestRecords.slice(-7);
	
	// Text:
	let str = '';
	latestRecords.reverse();
	latestRecords.forEach(function (record) {
		str += record.toString() + '\n\n';
	}, this);
	
	let lines = gs.wrapText(str, 55);
	this.recordsText.setText(lines.join('\n'));
};

// UPDATE:
// ************************************************************************************************
UIRecordMenuV2.prototype.update = function () {
	this.lineHighLight.visible = false;
	this.classSelectSprite.visible = false;
	this.raceSelectSprite.visible = false;
	this.gameTypeSelectSprite.visible = false;
	
	// Class Line Highlight:
	if (this.classIndexUnderPointer() >= 0) {
		this.lineHighLight.x = this.startX + 2;
		this.lineHighLight.y = this.startY + 34 + this.classIndexUnderPointer() * 20;
		this.lineHighLight.visible = true;
	}
	
	// Race Line Highlight:
	if (this.raceIndexUnderPointer() >= 0) {
		this.lineHighLight.x = this.startX + 2;
		this.lineHighLight.y = this.startY + 286 + this.raceIndexUnderPointer() * 20;
		this.lineHighLight.visible = true;
	}
	
	// Game-Type Line Highlight:
	if (this.gameTypeIndexUnderPointer() >= 0) {
		this.lineHighLight.x = this.startX + 2;
		this.lineHighLight.y = this.startY + 494 + this.gameTypeIndexUnderPointer() * 20;
		this.lineHighLight.visible = true;
	}
	
	// Class Selected Sprite:
	if (this.selectedClassIndex >= 0) {
		this.classSelectSprite.x = this.startX + 2;
		this.classSelectSprite.y = this.startY + 34 + this.selectedClassIndex * 20;
		this.classSelectSprite.visible = true;
	}
	
	// Race Selected Sprite:
	if (this.selectedRaceIndex >= 0) {
		this.raceSelectSprite.x = this.startX + 2;
		this.raceSelectSprite.y = this.startY + 286 + this.selectedRaceIndex * 20;
		this.raceSelectSprite.visible = true;
	}
	
	// Misc Selected Sprite:
	if (this.selectedGameTypeIndex >= 0) {
		this.gameTypeSelectSprite.x = this.startX + 2;
		this.gameTypeSelectSprite.y = this.startY + 494 + this.selectedGameTypeIndex * 20;
		this.gameTypeSelectSprite.visible = true;
	}
	
	// Pointer Down:
	if (game.input.activePointer.isDown) {
		// Select Class:
		if (this.classIndexUnderPointer() >= 0) {
			this.selectedClassIndex = this.classIndexUnderPointer();
			this.refresh();
		}
		
		// Select Race:
		if (this.raceIndexUnderPointer() >= 0) {
			this.selectedRaceIndex = this.raceIndexUnderPointer();
			this.refresh();
		}
		
		// Select Game-Type:
		if (this.gameTypeIndexUnderPointer() >= 0) {
			this.selectedGameTypeIndex = this.gameTypeIndexUnderPointer();
			this.refresh();
		}
	}
};

// CLASS_INDEX_UNDER_POINTER:
// ************************************************************************************************
UIRecordMenuV2.prototype.classIndexUnderPointer = function () {
	for (let i = 0; i < this.classList.length; i += 1) {
		if (game.input.activePointer.x > this.startX + 2
			&& game.input.activePointer.x < this.startX + 156
			&& game.input.activePointer.y >= this.startY + 34 + i * 20
			&& game.input.activePointer.y < this.startY + 34 + i * 20 + 20) {
			
			return i;
		}
	}
	
	return -1; 
};

// RACE_INDEX_UNDER_POINTER:
// ************************************************************************************************
UIRecordMenuV2.prototype.raceIndexUnderPointer = function () {
	for (let i = 0; i < this.raceList.length; i += 1) {
		if (game.input.activePointer.x > this.startX + 2
			&& game.input.activePointer.x < this.startX + 156
			&& game.input.activePointer.y >= this.startY + 286 + i * 20
			&& game.input.activePointer.y < this.startY + 286 + i * 20 + 20) {
			
			return i;
		}
	}
	
	return -1; 
};

// GAME_TYPE_INDEX_UNDER_POINTER:
// ************************************************************************************************
UIRecordMenuV2.prototype.gameTypeIndexUnderPointer = function () {
	for (let i = 0; i < this.gameTypeList.length; i += 1) {
		if (game.input.activePointer.x > this.startX + 2
			&& game.input.activePointer.x < this.startX + 156
			&& game.input.activePointer.y >= this.startY + 494 + i * 20 
			&& game.input.activePointer.y < this.startY + 494 + i * 20 + 20) {

			return i;
		}
	}
	
	return -1;
};

// ON_CLOSE_CLICKED:
// ************************************************************************************************
UIRecordMenuV2.prototype.onCloseClicked = function () {
	gs.stateManager.popState();
};

// OPEN:
// ************************************************************************************************
UIRecordMenuV2.prototype.open = function () {
	this.refresh();
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
UIRecordMenuV2.prototype.close = function () {
	this.group.visible = false;
};

// IS_OPEN:
// ************************************************************************************************
UIRecordMenuV2.prototype.isOpen = function () {
	return this.group.visible;
};