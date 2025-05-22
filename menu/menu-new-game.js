/*global gs, console, game, menuState, util*/
/*global SCREEN_HEIGHT, SMALL_WHITE_FONT, HUGE_WHITE_FONT, CLASS_LIST, PLAYER_FRAMES, HUD_START_X, SCALE_FACTOR*/
/*global PLAYER_RACE_FRAMES, SLOT_SELECT_BOX_FRAME*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// UI_NEW_GAME_MENU:
// ************************************************************************************************
function UINewGameMenu() {
	// Dimensions:
	this.width = game.cache.getBaseTexture('NewGameMenu').width * SCALE_FACTOR;
	this.height = game.cache.getBaseTexture('NewGameMenu').height * SCALE_FACTOR;
	this.startX = HUD_START_X / 2 - this.width / 2;
	this.startY = (SCREEN_HEIGHT - this.height) / 2;
	
	// Group:
	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	// Menu:
    let sprite = gs.createSprite(this.startX, this.startY, 'NewGameMenu', this.group);
	
	// Properties:
	this.selectedRaceIndex = 0;
	this.selectedClassIndex = 0;
	this.raceList = gs.playerRaceList.map(e => e.name);
	this.classList = CLASS_LIST;
	
	

	
	// Class Icons:
	this.characterSprites = [];
	this.characterBadges = [];
	for (let i = 0; i < this.classList.length; i += 1) {
		let className = this.classList[i];
		let x = this.startX + 160 + (i % 5) * 110;
		let y = this.startY + 6 + Math.floor(i / 5) * 100;
		
		// Name:
		let text = gs.createText(x + 24, y, gs.capitalSplit(className),  'PixelFont6-White', 12, this.group);
		text.setAnchor(0.5, 0);
		
		// Button:
		let button = gs.createButton(x, y + 20, 'UISlot', 1, this.onClassClicked, this, this.group);
		button.classIndex = i;
		
		// Character Sprite:
		let sprite = gs.createSprite(x + 4, y + 20 + 4, 'Tileset',  this.group);
		sprite.frame = PLAYER_RACE_FRAMES.Human[className];
		this.characterSprites.push(sprite);
		
		// Badges:
		this.characterBadges[i] = [];
		for (let j = 0; j < 5; j += 1) {
			let badge = gs.createSprite(x + j * 14 - 8, y + 72, 'AchievementIcons', this.group);
			badge.inputEnabled = true;
			this.characterBadges[i].push(badge);
		}
	}
	
	// Class Select Sprite:
	this.classSelectSprite = gs.createSprite(0, 0, 'UISlot', this.group);
    this.classSelectSprite.frame = SLOT_SELECT_BOX_FRAME;
	
	// Line Highlight:
	this.lineHighLight = gs.createSprite(this.startX + 2, this.startY + 2, 'NewGameHighlight', this.group);
	this.lineHighLight.visible = false;
	
	// Race Select Sprite:
	this.raceSelectSprite = gs.createSprite(this.startX + 2, this.startY + 2, 'NewGameHighlight', this.group);
	this.raceSelectSprite.frame = 1;

	// Race Text List:
	for (let i = 0; i < this.raceList.length; i += 1) {
		gs.createText(this.startX + 6, this.startY + 8 + i * 24, '*' + gs.capitalSplit(this.raceList[i]), 'PixelFont6-White', 12, this.group);
	}
	
	// Desc Text:
	this.descText = gs.createText(this.startX + 6, this.startY + 210, '', 'PixelFont6-White', 12, this.group);
	this.descText.text.maxWidth = 360;
	
	// Record Text:
	this.recordText = gs.createText(this.startX + 440, this.startY + 210, '*Hello', 'PixelFont6-White', 12, this.group);
	
	this.recordVal = gs.createText(this.startX + 670, this.startY + 210, '1', 'PixelFont6-White', 12, this.group);
	this.recordVal.setAnchor(1, 0);
	this.recordVal.text.align = 'right';
	
	// Buttons:
	this.standardGameButton = gs.createTextButton(this.startX + 88, this.startY + this.height - 20, 'Standard Game', this.onStandardGameClicked, this, this.group, 'MediumButton');
	this.seededGameButton = gs.createTextButton(this.startX + 88 + 168 * 1, this.startY + this.height - 20, 'Seeded Game', this.onSeededGameClicked, this, this.group, 'MediumButton');
	this.dailyChallengeButton = gs.createTextButton(this.startX + 88 + 168 * 2, this.startY + this.height - 20, 'Daily Challenge', this.onDailyChallengeClicked, this, this.group, 'MediumButton');
	this.closeButton = gs.createTextButton(this.startX + 88 + 168 * 3, this.startY + this.height - 20, 'Close', this.onCloseClicked, this, this.group, 'MediumButton');
	
	
	// Hide:
	this.group.visible = false;
}

// REFRESH:
// ************************************************************************************************
UINewGameMenu.prototype.refresh = function () {
	// Hide Daily challenge when complete:
	if (this.isDailyChallengeComplete()) {
		this.dailyChallengeButton.setVisible(false);
		this.closeButton.setPosition(this.startX + 88 + 168 * 2, this.startY + this.height - 20);
	}
	else {
		this.dailyChallengeButton.setVisible(true);
		
		this.dailyChallengeButton.setPosition(this.startX + 88 + 168 * 2, this.startY + this.height - 20);
		this.closeButton.setPosition(this.startX + 88 + 168 * 3, this.startY + this.height - 20);
	}
	
	// Set Character Sprites:
	// Based on the selected race
	for (let i = 0; i < this.classList.length; i += 1) {
		let raceName = this.raceList[this.selectedRaceIndex];
		let className = this.classList[i];
		this.characterSprites[i].frame = PLAYER_RACE_FRAMES[raceName][className];
	}
	
	// Class Select Sprite:
	this.classSelectSprite.x = this.characterSprites[this.selectedClassIndex].x - 4;
	this.classSelectSprite.y = this.characterSprites[this.selectedClassIndex].y - 4;
	
	// Race Select Sprite:
	this.raceSelectSprite.x = this.startX + 2;
	this.raceSelectSprite.y = this.startY + 2 + this.selectedRaceIndex * 24;
	
	// Badges:
	for (let i = 0; i < this.classList.length; i += 1) {
		for (let j = 0; j < 5; j += 1) {
			this.characterBadges[i][j].frame = 0;
		}

		let className = this.classList[i];
		let raceName = this.raceList[this.selectedRaceIndex];
		let streak = gs.bestWinStreakWith(className, raceName, 'All');
		let time = gs.fastestWinTimeWith(className, raceName, 'All');

		// Win:
		if (streak >= 1) {
			this.characterBadges[i][0].frame = 1;
		}

		// Time 60 mins:
		if (streak >= 1 && time <= 60 * 60 * 1000) {
			this.characterBadges[i][1].frame = 2;
		}

		// Time 45 mins:
		if (streak >= 1 && time <= 45 * 60 * 1000) {
			this.characterBadges[i][2].frame = 2;
		}

		// Streak x2:
		if (streak >= 2) {
			this.characterBadges[i][3].frame = 3;
		}

		// Streak x3:
		if (streak >= 3) {
			this.characterBadges[i][4].frame = 3;
		}
	}


	
};

// UPDATE:
// ************************************************************************************************
UINewGameMenu.prototype.update = function () {
	// Hide:
	this.lineHighLight.visible = false;
	
	// Race Line Highlight:
	if (this.raceIndexUnderPointer() >= 0) {
		this.lineHighLight.x = this.startX + 2;
		this.lineHighLight.y = this.startY + 2 + this.raceIndexUnderPointer() * 24;
		this.lineHighLight.visible = true;
	}
	
	// Pointer Down:
	if (game.input.activePointer.isDown) {		
		// Select Race:
		if (this.raceIndexUnderPointer() >= 0) {
			this.selectedRaceIndex = this.raceIndexUnderPointer();
			this.refresh();
		}
	}
	
	// Race Desc Text:
	if (this.raceIndexUnderPointer() >= 0) {
		let raceName = this.raceList[this.raceIndexUnderPointer()];
		this.descText.setText(gs.playerRaces[raceName].desc());
	}
	else {
		let raceName = this.raceList[this.selectedRaceIndex];
		this.descText.setText(gs.playerRaces[raceName].desc());
	}

	// Badge Desc Text:
	let raceName = this.raceList[this.selectedRaceIndex];
	for (let i = 0; i < this.classList.length; i += 1) {
		for (let j = 0; j < 5; j += 1) {
			let className = this.classList[i];
			
			if (this.characterBadges[i][j].input.checkPointerOver(game.input.activePointer)) {
				// Win:
				if (j === 0) {
					this.descText.setText('Win the game with ' + raceName + ' ' + gs.capitalSplit(className));
				}

				// Win 60:
				if (j === 1) {
					this.descText.setText('Win the game in under 60 minutes with ' + raceName + ' ' + gs.capitalSplit(className));
				}

				// Win 45:
				if (j === 2) {
					this.descText.setText('Win the game in under 45 minutes with ' + raceName + ' ' + gs.capitalSplit(className));
				}

				// Win-Streak 2:
				if (j === 3) {
					this.descText.setText('Win the game twice in a row with ' + raceName + ' ' + gs.capitalSplit(className));
				}

				// Win-Streak 3:
				if (j === 4) {
					this.descText.setText('Win the game three times in a row with ' + raceName + ' ' + gs.capitalSplit(className));
				}
			}
		}
	}
	
	// Daily Challenge Text:
	if (this.dailyChallengeButton.isPointerOver()) {
		let wins = gs.numWinsWith('All', 'All', 'Daily Challenge');
		let deaths = gs.numDeathsWith('All', 'All', 'Daily Challenge');
		let time = gs.fastestWinTimeWith('All', 'All', 'Daily Challenge');
		let streak = gs.bestWinStreakWith('All', 'All', 'Daily Challenge');
		let currentStreak = gs.currentWinStreakWith('All', 'All', 'Daily Challenge');
		let percent;
		
		if ((wins + deaths) > 0) {
			percent = util.toPercentStr(wins / (wins + deaths));
		}
		else {
			percent = '0%';
		}
		
		// Set Records Text:
		let str = 'Daily Challenge\n';
		str += '*Wins\n';
		str += '*Deaths\n';
		str += '*Win Percent\n';
		str += '*Best Time\n';
		str += '*Win Streak\n';
		str += '*Current Streak\n';
		this.recordText.setText(str);
		
		// Set Records Values:
		str = '\n';
		str += wins + '\n';
		str += deaths + '\n';
		str += percent + '\n';
		str += gs.timeToString(time) + '\n';
		str += streak + '\n';
		str += currentStreak + '\n';
		this.recordVal.setText(str);
	}
	// Display records for selected class / race:
	else {
		// Stats:
		let className = this.classList[this.selectedClassIndex];
		let raceName = this.raceList[this.selectedRaceIndex];
		let wins = gs.numWinsWith(className, raceName, 'All');
		let deaths = gs.numDeathsWith(className, raceName, 'All');
		let percent;
		let time = gs.fastestWinTimeWith(className, raceName, 'All');
		let streak = gs.bestWinStreakWith(className, raceName, 'All');
		let currentStreak = gs.currentWinStreakWith(className, raceName, 'All');

		if ((wins + deaths) > 0) {
			percent = util.toPercentStr(wins / (wins + deaths));
		}
		else {
			percent = '0%';
		}

		let str = raceName + ' ' + gs.capitalSplit(className) + '\n';
		str += '*Wins\n';
		str += '*Deaths\n';
		str += '*Win Percent\n';
		str += '*Best Time\n';
		str += '*Win Streak\n';
		str += '*Current Streak\n';
		this.recordText.setText(str);

		// Set Records Text:
		str = '\n';
		str += wins + '\n';
		str += deaths + '\n';
		str += percent + '\n';
		str += gs.timeToString(time) + '\n';
		str += streak + '\n';
		str += currentStreak + '\n';
		this.recordVal.setText(str);
	}
};

// RACE_INDEX_UNDER_POINTER:
// ************************************************************************************************
UINewGameMenu.prototype.raceIndexUnderPointer = function () {
	for (let i = 0; i < this.raceList.length; i += 1) {
		if (game.input.activePointer.x > this.startX + 2
			&& game.input.activePointer.x < this.startX + 130
			&& game.input.activePointer.y >= this.startY + 2 + i * 24
			&& game.input.activePointer.y < this.startY + 2 + (i + 1) * 24) {
			
			return i;
		}
	}
	
	return -1; 
};

// ON_CLASS_CLICKED:
// ************************************************************************************************
UINewGameMenu.prototype.onClassClicked = function (button) {
	this.selectedClassIndex = button.classIndex;
	this.refresh();
};

// ON_STANDARD_GAME_CLICKED:
// ************************************************************************************************
UINewGameMenu.prototype.onStandardGameClicked = function () {
	// Clearing game data to start the new game
	gs.clearGameData();
	
	// Set New-Game Properties:
	gs.startDailyChallenge = false;
	gs.setSeed = null;
	gs.playerClass = this.classList[this.selectedClassIndex];
	gs.playerRace = gs.playerRaces[this.raceList[this.selectedRaceIndex]];
	
	// Start Game:
	gs.mainMenuBase.startGame();
};

// ON_SEEDED_GAME_CLICKED:
// ************************************************************************************************
UINewGameMenu.prototype.onSeededGameClicked = function () {
	gs.playerClass = this.classList[this.selectedClassIndex];
	gs.playerRace = gs.playerRaces[this.raceList[this.selectedRaceIndex]];
	
	gs.stateManager.popState();
	gs.stateManager.pushState('SeedGameMenu', null, false);
};

// ON_DAILY_CHALLENGE_CLICKED:
// ************************************************************************************************
UINewGameMenu.prototype.onDailyChallengeClicked = function () {
	if (!this.isDailyChallengeComplete()) {
		// Clearing game data to start the new game:
		gs.clearGameData();

		// Set New-Game Properties:
		gs.startDailyChallenge = true;
		gs.setSeed = null;
		
		// Start Game:
		gs.mainMenuBase.startGame();
	}
};

// ON_CLOSE_CLICKED:
// ************************************************************************************************
UINewGameMenu.prototype.onCloseClicked = function () {
	gs.stateManager.popState();
};

// OPEN:
// ************************************************************************************************
UINewGameMenu.prototype.open = function () {
	this.refresh();
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
UINewGameMenu.prototype.close = function () {
	this.group.visible = false;
};

// IS_OPEN:
// ************************************************************************************************
UINewGameMenu.prototype.isOpen = function () {
	return this.group.visible;
};

// IS_DAILY_CHALLENGE_COMPLETE:
// ************************************************************************************************
UINewGameMenu.prototype.isDailyChallengeComplete = function () {
	let date = new Date();
	return gs.achievements.lastChallenge === gs.getDailyChallengeSeed();
};