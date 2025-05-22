/*global gs, util, console, game, menuState*/
/*global SCREEN_HEIGHT, SMALL_WHITE_FONT, HUGE_WHITE_FONT, CLASS_LIST, PLAYER_FRAMES, HUD_START_X, SCALE_FACTOR, PLAYER_RACE_FRAMES*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// UI_RECORD_MENU:
// ************************************************************************************************
function UINewRecordMenu() {
	// Dimensions:
	this.width = game.cache.getBaseTexture('CharacterMenu').width * SCALE_FACTOR;
	this.height = game.cache.getBaseTexture('CharacterMenu').height * SCALE_FACTOR;
	this.startX = HUD_START_X / 2 - this.width / 2;
	this.startY = (SCREEN_HEIGHT - this.height) / 2;
	
	this.group = game.add.group();
	this.group.fixedToCamera = true;
		
	// Menu:
    let sprite = gs.createSprite(this.startX, this.startY, 'CharacterMenu', this.group);
	
	// Title:
	//this.titleText = gs.createText(this.startX + this.width / 2, this.startY + 4, 'Game Records', 'PixelFont6-White', 18, this.group);
	//this.titleText.setAnchor(0.5, 0);
	
	// Class / Race Icons:
	this.slots = [];
	for (let x = 0; x < 10; x += 1) {
		this.slots[x] = [];
		
		let className = CLASS_LIST[x];
		
		for (let y = 0; y < 8; y += 1) {
			let raceName = gs.playerRaceList[y].name;
			
			this.slots[x][y] = {};
			this.slots[x][y].className = className;
			this.slots[x][y].raceName = raceName;
			
			let xPos = this.startX + 48 + x * 86;
			let yPos = this.startY + 8 + y * 86;
			
			// Icon:
			this.slots[x][y].icon = gs.createSprite(xPos, yPos, 'UISlot', this.group);
			this.slots[x][y].icon.visible = false;
			
			// Char Icon:
			this.slots[x][y].charIcon = gs.createSprite(xPos + 4, yPos + 4, 'Tileset', this.group);
			this.slots[x][y].charIcon.frame = PLAYER_RACE_FRAMES[raceName][className];
			this.slots[x][y].charIcon.visible = false;
			
			// Achievement Icons:
			this.slots[x][y].achievementIcons = [];
			for (let i = 0; i < 5; i += 1) {
				let achievementIcon = gs.createSprite(xPos + i * 12 - 6, yPos + 50, 'AchievementIcons', this.group);
				achievementIcon.visible = false;
				achievementIcon.inputEnabled = true;
				this.slots[x][y].achievementIcons.push(achievementIcon);
			}
			
			
			// Text:
			this.slots[x][y].text = gs.createText(xPos + 24, yPos + 50, '', 'PixelFont6-White', 12, this.group);
			this.slots[x][y].text.visible = false;
			this.slots[x][y].text.setAnchor(0.5, 0);
		}
	}
	
	// Buttons:
	gs.createTextButton(this.startX + 66 + 130 * 0, this.startY + this.height - 20, 'Records', this.onRecordsClicked, this, this.group, 'SmallButton');
	gs.createTextButton(this.startX + 66 + 130 * 1, this.startY + this.height - 20, 'Badges', this.onBadgesClicked, this, this.group, 'SmallButton');
	gs.createTextButton(this.startX + 66 + 130 * 2, this.startY + this.height - 20, 'Win/Death', this.onWinDeathClicked, this, this.group, 'SmallButton');
	gs.createTextButton(this.startX + 66 + 130 * 3, this.startY + this.height - 20, 'Win Percent', this.onPercentClicked, this, this.group, 'SmallButton');
	gs.createTextButton(this.startX + 66 + 130 * 4, this.startY + this.height - 20, 'Win Streak', this.onStreakClicked, this, this.group, 'SmallButton');
	gs.createTextButton(this.startX + 66 + 130 * 5, this.startY + this.height - 20, 'Best Time', this.onBestTimeClicked, this, this.group, 'SmallButton');
	gs.createTextButton(this.startX + 66 + 130 * 6, this.startY + this.height - 20, 'Close', this.onCloseClicked, this, this.group, 'SmallButton');
	
	
	// Class Buttons:
	let startX = (this.width - (12 * 54)) / 2;
	let startY = 2;
	this.classButtons = [];
	['All'].concat(CLASS_LIST.concat(['Challenge'])).forEach(function (className, i) {
		let x = startX + i * 50 + 4,
			y = startY + 40;
		
		let e = {};
		
		// Button:
		e.button = gs.createButton(x, y, 'UISlot', 1, this.classClicked, this, this.group);
		e.button.className = className;
		e.button.setVisible(false);
		
		// Sprite:
		e.sprite = gs.createSprite(x + 4, y + 4, 'Tileset',  this.group);
		if (className === 'Challenge') {
			e.sprite.frame = 1226;
		}
		else if (className === 'All') {
			e.sprite.frame = 1227;
		}
		else {
			e.sprite.frame = PLAYER_FRAMES[className];
		}
		e.sprite.visible = false;
		
		this.classButtons.push(e);
	}, this);
	
	this.raceButtons = [];
	gs.playerRaceList.forEach(function (raceName) {
		
	}, this);
	
	// Select Sprite:
	this.selectSprite = gs.createSprite(0, 0, 'UISlot', this.group);
	this.selectSprite.frame = 10;
	
	// Text:
	this.text = gs.createText(this.startX + 6, startY + 100, '', 'PixelFont6-White', 12, this.group);
	
	// Start with All selected:
	this.classClicked(this.classButtons[0].button);
	
	// Desc Text:
	this.descText = gs.createText(HUD_START_X + 8, SCREEN_HEIGHT - 4, '', 'PixelFont6-White', 12, this.group);
	this.descText.lineSpacing = -5;
	this.descText.maxWidth = 344;
	this.descText.setAnchor(0, 1);
	
	
	
	this.group.visible = false;
}

// ON_RECORDS_CLICKED:
// ************************************************************************************************
UINewRecordMenu.prototype.onRecordsClicked = function () {
	this.refresh('RECORDS');
};

// ON_BADGES_CLICKED:
// ************************************************************************************************
UINewRecordMenu.prototype.onBadgesClicked = function () {
	this.refresh('BADGES');
};

// ON WIN_DEATH_CLICKED:
// ************************************************************************************************
UINewRecordMenu.prototype.onWinDeathClicked = function () {
	this.refresh('WIN_DEATH');
};

// ON_PERCENT_CLICKED:
// ************************************************************************************************
UINewRecordMenu.prototype.onPercentClicked = function () {
	this.refresh('PERCENT');
};

// ON_STREAK_CLICKED:
// ************************************************************************************************
UINewRecordMenu.prototype.onStreakClicked = function () {
	this.refresh('STREAK');
};

// ON_BEST_TIME_CLICKED:
// ************************************************************************************************
UINewRecordMenu.prototype.onBestTimeClicked = function () {
	this.refresh('BEST_TIME');
};

// CLASS_CLICKED:
// ************************************************************************************************
UINewRecordMenu.prototype.classClicked = function (button) {
	// Previous button:
	if (this.selectedClass) {
		this.classButtons.find(e => e.button.className === this.selectedClass).button.setFrames(1, 0);
	}
	
	this.selectedClass = button.className;
	
	this.selectSprite.x = button.x;
	this.selectSprite.y = button.y;
	
	this.refresh('RECORDS');
};



// REFRESH:
// view = {RECORDS, BADGES, WIN_DEATH, PERCENT, STREAK}
// ************************************************************************************************
UINewRecordMenu.prototype.refresh = function (view) {
	this.classButtons.forEach(function (e) {
		e.button.setVisible(false);
		e.sprite.visible = false;
	}, this);
	
	this.text.visible = false;
	this.selectSprite.visible = false;
	
	// Set visibility:
	for (let x = 0; x < 10; x += 1) {
		for (let y = 0; y < 8; y += 1) {
			this.slots[x][y].icon.visible = false;
			this.slots[x][y].charIcon.visible = false;
			this.slots[x][y].text.visible = false;
			
			this.slots[x][y].achievementIcons.forEach(function (icon) {
				icon.visible = false;
			}, this);
			
		}
	}
	
	
	if (view === 'RECORDS') {
		// Show Class Buttons:
		this.classButtons.forEach(function (e) {
			e.button.setVisible(true);
			e.sprite.visible = true;
		}, this);
		
		// Show Text:
		this.text.visible = true;
		this.selectSprite.visible = true;
		
		this.refreshRecords();
	}

	
	if (view === 'BADGES') {
		for (let x = 0; x < 10; x += 1) {
			for (let y = 0; y < 8; y += 1) {
				this.slots[x][y].icon.visible = true;
				this.slots[x][y].charIcon.visible = true;
				
				// Set visibility:
				this.slots[x][y].achievementIcons.forEach(function (icon) {
					icon.visible = true;
					icon.frame = 0;
				}, this);
				
				let streak = gs.bestWinStreakWith(this.slots[x][y].className, this.slots[x][y].raceName);
				let time = gs.fastestWinTimeWith(this.slots[x][y].className, this.slots[x][y].raceName);
				
				// Win:
				if (streak >= 1) {
					this.slots[x][y].achievementIcons[0].frame = 1;
				}
				
				// Time 60 mins:
				if (streak >= 1 && time <= 60 * 60 * 1000) {
					this.slots[x][y].achievementIcons[1].frame = 2;
				}
				
				// Time 45 mins:
				if (streak >= 1 && time <= 45 * 60 * 1000) {
					this.slots[x][y].achievementIcons[2].frame = 2;
				}
				
				// Streak x2:
				if (streak >= 2) {
					this.slots[x][y].achievementIcons[3].frame = 3;
				}
				
				// Streak x3:
				if (streak >= 3) {
					this.slots[x][y].achievementIcons[4].frame = 3;
				}
			}
		}
	}
	
	if (view === 'WIN_DEATH') {
		for (let x = 0; x < 10; x += 1) {
			for (let y = 0; y < 8; y += 1) {
				this.slots[x][y].icon.visible = true;
				this.slots[x][y].charIcon.visible = true;
				
				let wins = gs.numWinsWith(this.slots[x][y].className, this.slots[x][y].raceName);
				let deaths = gs.numDeathsWith(this.slots[x][y].className, this.slots[x][y].raceName);
				
				if (wins > 0 || deaths > 0) {
					this.slots[x][y].text.visible = true;
					
					this.slots[x][y].text.setText(wins + '/' + deaths);
				}
			}
		}
	}
	
	if (view === 'PERCENT') {
		for (let x = 0; x < 10; x += 1) {
			for (let y = 0; y < 8; y += 1) {
				this.slots[x][y].icon.visible = true;
				this.slots[x][y].charIcon.visible = true;
				
				let wins = gs.numWinsWith(this.slots[x][y].className, this.slots[x][y].raceName);
				let deaths = gs.numDeathsWith(this.slots[x][y].className, this.slots[x][y].raceName);
				
				if (wins > 0 || deaths > 0) {
					this.slots[x][y].text.visible = true;
					
					if (deaths === 0) {
						this.slots[x][y].text.setText('100%');
					}
					else {
						this.slots[x][y].text.setText(util.toPercentStr(wins / deaths));
					}
				}
			}
		}
	}
	
	if (view === 'STREAK') {
		for (let x = 0; x < 10; x += 1) {
			for (let y = 0; y < 8; y += 1) {	
				this.slots[x][y].icon.visible = true;
				this.slots[x][y].charIcon.visible = true;
				
				let streak = gs.bestWinStreakWith(this.slots[x][y].className, this.slots[x][y].raceName);
				
				if (streak > 0) {
					this.slots[x][y].text.visible = true;
					this.slots[x][y].text.setText(streak);
				}
			}
		}
	}
	
	if (view === 'BEST_TIME') {
		for (let x = 0; x < 10; x += 1) {
			for (let y = 0; y < 8; y += 1) {
				this.slots[x][y].icon.visible = true;
				this.slots[x][y].charIcon.visible = true;
				
				let time = gs.fastestWinTimeWith(this.slots[x][y].className, this.slots[x][y].raceName);
				
				if (time > 0) {
					this.slots[x][y].text.visible = true;
					this.slots[x][y].text.setText(gs.timeToString(time));
				}
			}
		}
	}
};

// REFRESH_RECORDS:
// ************************************************************************************************
UINewRecordMenu.prototype.refreshRecords = function () {
		var str = '',
		latestRecords,
		numWins,
		numDeaths;
	
	// WINS_LOSSES_AND_PERCENT:
	if (this.selectedClass === 'All') {
		numWins = gs.totalWins();
		numDeaths = gs.totalDeaths();
	}
	else if (this.selectedClass === 'Challenge') {
		numWins = gs.numChallengeWins();
		numDeaths = gs.numChallengeDeaths();
	}
	else {
		numWins = gs.numWinsWithClass(this.selectedClass);
		numDeaths = gs.numDeathsWithClass(this.selectedClass);
	}
	
	str += 'Total Wins: ' + numWins + '\n';
	str += 'Total Deaths: ' + numDeaths + '\n';

	if (numWins + numDeaths > 0) {
		str += 'Win Percent: ' + util.toPercentStr(numWins / (numWins + numDeaths)) + '\n';
	}
	
	// FASTEST_TIME:
	if (this.selectedClass === 'All') {
		let obj = gs.fastestWinTime();
		if (obj) {
			str += 'Fastest Win Time: ' + gs.timeToString(obj.time) + ' - ' + gs.capitalSplit(obj.className) + '\n';
		}
		
	}
	else if (this.selectedClass === 'Challenge') {
		
	}
	else {
		if (gs.achievements[this.selectedClass] > 0) {
			str += 'Fastest win Time: ' + gs.timeToString(gs.achievements[this.selectedClass]) + '\n';
		}	
	}

	// WIN_STREAK:
	if (this.selectedClass === 'All') {
		if (gs.highestWinStreak() > 1) {
			str += 'Best Win Streak: ' + gs.highestWinStreak() + ' - ' + gs.highestWinStreakClass() +'\n';
		}
	}
	else if (this.selectedClass === 'Challenge') {
		if (gs.bestChallengeWinStreak() > 1) {
			str += 'Best Win Streak: ' + gs.bestChallengeWinStreak() + '\n';
		}
	}
	else {
		if (gs.bestWinStreakWithClass(this.selectedClass) > 1) {
			str += 'Best Win Streak: ' + gs.bestWinStreakWithClass(this.selectedClass) + '\n';
		}
	}
	str += '\n';
	
	
	// Get the last 7 games:
	if (this.selectedClass === 'All') {
		latestRecords = gs.gameRecords.slice(-7);
	}
	else if (this.selectedClass === 'Challenge') {
		latestRecords = gs.gameRecords.filter(record => record.isChallenge).slice(-7);
	}
	else {
		latestRecords = gs.gameRecords.filter(record => record.playerClass === this.selectedClass).slice(-7);
	}
	
	
	
	
	latestRecords.reverse();
	latestRecords.forEach(function (record) {
		str += record.toString() + '\n\n';
	}, this);
	
	let lines = gs.wrapText(str, 100);
	this.text.setText(lines.join('\n'));
};

// UPDATE:
// ************************************************************************************************
UINewRecordMenu.prototype.update = function () {
	this.descText.setText('');
	
	for (let x = 0; x < 10; x += 1) {
			for (let y = 0; y < 8; y += 1) {
				let className = this.slots[x][y].className;
				let raceName = this.slots[x][y].raceName;
				
				for (let i = 0; i < 5; i += 1) {
					if (this.slots[x][y].achievementIcons[i].input.checkPointerOver(game.input.activePointer)) {
						// Win:
						if (i === 0) {
							this.descText.setText('Win the game with ' + raceName + ' ' + gs.capitalSplit(className));
						}
						
						// Win 60:
						if (i === 1) {
							this.descText.setText('Win the game in under 60 minutes with ' + raceName + ' ' + gs.capitalSplit(className));
						}
						
						// Win 45:
						if (i === 2) {
							this.descText.setText('Win the game in under 45 minutes with ' + raceName + ' ' + gs.capitalSplit(className));
						}
						
						// Win-Streak 2:
						if (i === 3) {
							this.descText.setText('Win the game twice in a row with ' + raceName + ' ' + gs.capitalSplit(className));
						}
						
						// Win-Streak 3:
						if (i === 4) {
							this.descText.setText('Win the game three times in a row with ' + raceName + ' ' + gs.capitalSplit(className));
						}
					}
				}
			}
	}
};

// ON_CLOSE_BUTTON_CLICKED:
// ************************************************************************************************
UINewRecordMenu.prototype.onCloseClicked = function () {
	gs.stateManager.popState();
};

// OPEN:
// ************************************************************************************************
UINewRecordMenu.prototype.open = function () {
	this.group.visible = true;
	this.refresh('RECORDS');
};

// CLOSE:
// ************************************************************************************************
UINewRecordMenu.prototype.close = function () {
	this.group.visible = false;
};

// IS_OPEN:
// ************************************************************************************************
UINewRecordMenu.prototype.isOpen = function () {
	return this.group.visible;
};