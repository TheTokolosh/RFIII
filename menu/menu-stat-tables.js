/*global gs, console, game, menuState, util*/
/*global SCREEN_HEIGHT, SMALL_WHITE_FONT, HUGE_WHITE_FONT, CLASS_LIST, PLAYER_FRAMES, HUD_START_X, SCALE_FACTOR*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// UI_STAT_TABLES_MENU:
// ************************************************************************************************
function UIStatTablesMenu() {
	// Dimensions:
	this.width = game.cache.getBaseTexture('StatTablesMenu').width * SCALE_FACTOR;
	this.height = game.cache.getBaseTexture('StatTablesMenu').height * SCALE_FACTOR;
	this.startX = HUD_START_X / 2 - this.width / 2;
	this.startY = (SCREEN_HEIGHT - this.height) / 2;
	
	// Lists:
	this.classList = CLASS_LIST;
	this.raceList = gs.playerRaceList.map(e => e.name);
	
	// Properties:
	this.viewMode = 'BADGES'; // BADGES, WIN_DEATH, WIN_PERCENT, BEST_TIME, WIN_STREAK
	
	// Group:
	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	// Menu:
    let sprite = gs.createSprite(this.startX, this.startY, 'StatTablesMenu', this.group);
	
	// Class Text:
	for (let i = 0; i < this.classList.length; i += 1) {
		gs.createText(this.startX + 4, this.startY + 36 + i * 30, gs.capitalSplit(this.classList[i]), 'PixelFont6-White', 12, this.group);
	}
	
	// Race Text:
	for (let i = 0; i < this.raceList.length; i += 1) {
		let text = gs.createText(this.startX + 165 + i * 90, this.startY + 8, this.raceList[i], 'PixelFont6-White', 12, this.group);
		text.setAnchor(0.5, 0);
	}
	
	// Val Text:
	this.valText = [];
	for (let x = 0; x < this.raceList.length; x += 1) {
		this.valText[x] = [];
		for (let y = 0; y < this.classList.length; y += 1) {
			let text = gs.createText(this.startX + 165 + x * 90, this.startY + 36 + y * 30, '1/1', 'PixelFont6-White', 12, this.group);
			text.setAnchor(0.5, 0);
			
			this.valText[x][y] = text;
		}
	}
	
	// Badges:
	this.badges = [];
	for (let x = 0; x < this.raceList.length; x += 1) {
		this.badges[x] = [];
		for (let y = 0; y < this.classList.length; y += 1) {
			this.badges[x][y] = [];
			
			for (let i = 0; i < 5; i += 1) {
				let badge = gs.createSprite(this.valText[x][y].x + i * 14 - 36, this.valText[x][y].y, 'AchievementIcons', this.group);
				badge.visible = false;
				badge.inputEnabled = true;
				this.badges[x][y][i] = badge;
			}
		}
	}
	
	
	// Buttons
	gs.createTextButton(this.startX + 70 + 140 * 0, this.startY + this.height - 20, 'Badges', this.onBadgesClicked, this, this.group, 'SmallButton');
	gs.createTextButton(this.startX + 70 + 140 * 1, this.startY + this.height - 20, 'Win/Death', this.onWinDeathClicked, this, this.group, 'SmallButton');
	gs.createTextButton(this.startX + 70 + 140 * 2, this.startY + this.height - 20, 'Win Percent', this.onWinPercentClicked, this, this.group, 'SmallButton');
	gs.createTextButton(this.startX + 70 + 140 * 3, this.startY + this.height - 20, 'Win Streak', this.onWinStreakClicked, this, this.group, 'SmallButton');
	gs.createTextButton(this.startX + 70 + 140 * 4, this.startY + this.height - 20, 'Best Time', this.onBestTimeClicked, this, this.group, 'SmallButton');
	gs.createTextButton(this.startX + 70 + 140 * 5, this.startY + this.height - 20, 'Close', this.onCloseClicked, this, this.group, 'SmallButton');
	
	// Desc Text:
	this.descText = gs.createText(this.startX + this.width / 2, this.startY + this.height - 60, '', 'PixelFont6-White', 12, this.group);
	this.descText.lineSpacing = -5;
	this.descText.setAnchor(0.5, 0);
	
	
	// Hide:
	this.group.visible = false;
}

// REFRESH:
// ************************************************************************************************
UIStatTablesMenu.prototype.refresh = function () {
	// Hide everything:
	for (let x = 0; x < this.raceList.length; x += 1) {
		for (let y = 0; y < this.classList.length; y += 1) {
			this.valText[x][y].visible = false;
			
			// Hide badges:
			for (let i = 0; i < 5; i += 1) {
				this.badges[x][y][i].visible = false;
			}
		}
	}
	
	if (this.viewMode === 'BADGES') {
		for (let x = 0; x < this.raceList.length; x += 1) {
			for (let y = 0; y < this.classList.length; y += 1) {
				for (let i = 0; i < 5; i += 1) {
					this.badges[x][y][i].visible = true;
					this.badges[x][y][i].frame = 0;
				}
					
				let streak = gs.bestWinStreakWith(this.classList[y], this.raceList[x], 'All');
				let time = gs.fastestWinTimeWith(this.classList[y], this.raceList[x], 'All');

				// Win:
				if (streak >= 1) {
					this.badges[x][y][0].frame = 1;
				}

				// Time 60 mins:
				if (streak >= 1 && time <= 60 * 60 * 1000) {
					this.badges[x][y][1].frame = 2;
				}

				// Time 45 mins:
				if (streak >= 1 && time <= 45 * 60 * 1000) {
					this.badges[x][y][2].frame = 2;
				}

				// Streak x2:
				if (streak >= 2) {
					this.badges[x][y][3].frame = 3;
				}

				// Streak x3:
				if (streak >= 3) {
					this.badges[x][y][4].frame = 3;
				}
				
			}
		}
	}
	else if (this.viewMode === 'WIN_DEATH') {
		for (let x = 0; x < this.raceList.length; x += 1) {
			for (let y = 0; y < this.classList.length; y += 1) {
				let wins = gs.numWinsWith(this.classList[y], this.raceList[x], 'All');
				let deaths = gs.numDeathsWith(this.classList[y], this.raceList[x], 'All');
	
				if (wins > 0 || deaths > 0) {
					this.valText[x][y].setText(wins + ' - ' + deaths);
					this.valText[x][y].visible = true;
				}
				
			}
		}
	}
	else if (this.viewMode === 'WIN_PERCENT') {
		for (let x = 0; x < this.raceList.length; x += 1) {
			for (let y = 0; y < this.classList.length; y += 1) {
				let wins = gs.numWinsWith(this.classList[y], this.raceList[x], 'All');
				let deaths = gs.numDeathsWith(this.classList[y], this.raceList[x], 'All');
				let percent;
				
				if (deaths === 0) {
					percent = 1.0;
				}
				else {
					percent = wins / (wins + deaths);
				}
	
				if (wins > 0 || deaths > 0) {
					this.valText[x][y].setText(util.toPercentStr(percent));
					this.valText[x][y].visible = true;
				}
				
			}
		}
	}
	else if (this.viewMode === 'BEST_TIME') {
		for (let x = 0; x < this.raceList.length; x += 1) {
			for (let y = 0; y < this.classList.length; y += 1) {
				let time = gs.fastestWinTimeWith(this.classList[y], this.raceList[x], 'All');

				if (time > 0) {
					this.valText[x][y].setText(gs.timeToString(time));
					this.valText[x][y].visible = true;
				}
			}
		}
	}
	else if (this.viewMode === 'WIN_STREAK') {
		for (let x = 0; x < this.raceList.length; x += 1) {
			for (let y = 0; y < this.classList.length; y += 1) {
				let streak = gs.bestWinStreakWith(this.classList[y], this.raceList[x], 'All');
				
				if (streak > 0) {
					this.valText[x][y].visible = true;
					this.valText[x][y].setText(streak);
				}
			}
		}
	}
};

// UPDATE:
// ************************************************************************************************
UIStatTablesMenu.prototype.update = function () {
	this.descText.setText('');
	
	for (let x = 0; x < this.raceList.length; x += 1) {
		for (let y = 0; y < this.classList.length; y += 1) {
			let raceName = this.raceList[x];
			let className = this.classList[y];
			
			for (let i = 0; i < 5; i += 1) {
				if (this.badges[x][y][i].input.checkPointerOver(game.input.activePointer)) {
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

// OPEN:
// ************************************************************************************************
UIStatTablesMenu.prototype.open = function () {
	this.refresh();
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
UIStatTablesMenu.prototype.close = function () {
	this.group.visible = false;
};

// IS_OPEN:
// ************************************************************************************************
UIStatTablesMenu.prototype.isOpen = function () {
	return this.group.visible;
};

// ON_BADGES_CLICKED:
// ************************************************************************************************
UIStatTablesMenu.prototype.onBadgesClicked = function () {
	this.viewMode = 'BADGES';
	this.refresh();
};

// ON_WIN_DEATH_CLICKED:
// ************************************************************************************************
UIStatTablesMenu.prototype.onWinDeathClicked = function () {
	this.viewMode = 'WIN_DEATH';
	this.refresh();
};

// ON_WIN_PERCENT_CLICKED:
// ************************************************************************************************
UIStatTablesMenu.prototype.onWinPercentClicked = function () {
	this.viewMode = 'WIN_PERCENT';
	this.refresh();
};

// ON_WIN_STREAK_CLICKED:
// ************************************************************************************************
UIStatTablesMenu.prototype.onWinStreakClicked = function () {
	this.viewMode = 'WIN_STREAK';
	this.refresh();
};

// ON_BEST_TIME_CLICKED:
// ************************************************************************************************
UIStatTablesMenu.prototype.onBestTimeClicked = function () {
	this.viewMode = 'BEST_TIME';
	this.refresh();
};

// ON_CLOSE_CLICKED:
// ************************************************************************************************
UIStatTablesMenu.prototype.onCloseClicked = function () {
	gs.stateManager.popState();
};