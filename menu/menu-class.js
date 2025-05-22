/*global game, gs, console, Phaser, util*/
/*global menuState*/
/*global SMALL_WHITE_FONT, LARGE_WHITE_FONT, CLASS_LIST, HUD_START_X, HUGE_WHITE_FONT*/
/*global ITEM_SLOT_FRAME, PLAYER_FRAMES, SCREEN_WIDTH, SCREEN_HEIGHT, ZONE_FADE_TIME*/
/*jshint esversion: 6*/

'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function ClassSelectMenu () {
	var sprite, 
		iconSpaceY, 
		i = 0, 
		startX = HUD_START_X, 
		startY = 0,
		width = SCREEN_WIDTH - startX,
		str;
	
	// Group:
	this.group = game.add.group();
	this.group.fixedToCamera = true;

	// Menu Sprite:
	sprite = gs.createSprite(HUD_START_X, 0, 'HUD', this.group);
	
	// Title Text:
	this.titleText = gs.createText(startX + width / 2, 4, 'Select Class', 'PixelFont6-White', 18, this.group); 
	this.titleText.setAnchor(0.5, 0);
	
	iconSpaceY = 50;
	
	// Create class panels:
	this.classPanelList = [];
	CLASS_LIST.forEach(function (className, i) {
		this.classPanelList.push(this.createClassPanel(startX + 6, startY + 34 + i * iconSpaceY, className));
	}, this);
	
	
	// Daily Challenge:
	this.createChallengePanel(startX + 6, 534);
	
	// Back button:
	this.backButton = gs.createTextButton(startX + width / 2, 534 + 70, 'Back', this.onBackClicked, this, this.group);
	
	// Achievement Text:
	this.achievementText = gs.createText(startX + 8, SCREEN_HEIGHT - 4, '', 'PixelFont6-White', 12, this.group);
	this.achievementText.lineSpacing = -5;
	this.achievementText.setAnchor(0, 1);
	
	this.group.visible = false;
}

// CREATE_CHALLENGE_PANEL:
// ************************************************************************************************
ClassSelectMenu.prototype.createChallengePanel = function (x, y) {
	this.challengeButton = gs.createButton(x, y, 'UISlot', 1, this.challengeClicked, this, this.group);
	
	this.challengeSprite = gs.createSprite(x + 4, y + 4, 'Tileset', this.group);
	this.challengeSprite.frame = 1226;
	
	this.challengeText = gs.createText(x + 60, y - 2, 'Daily Challenge', 'PixelFont6-White', 12, this.group);
	
	this.challengeAchivements = [];
	for (let i = 0; i < 3; i += 1) {
		this.challengeAchivements[i] = gs.createSprite(x + 54 + i * 32, y + 14, 'Tileset', this.group);
		this.challengeAchivements[i].frame = 1269 + i;
		this.challengeAchivements[i].inputEnabled = true;
	}
	

};

// CREATE_CLASS_PANEL:
// ************************************************************************************************
ClassSelectMenu.prototype.createClassPanel = function (x, y, className) {
	var classPanel = {}, str;
	
	classPanel.className = className;
	
	classPanel.button = gs.createButton(x, y, 'UISlot', 1, this.classClicked, this, this.group);
	classPanel.button.className = className;

	// Class Image: 
	classPanel.image =  gs.createSprite(x + 4, y + 4, 'Tileset', this.group);
	classPanel.image.scale.setTo(2, 2);
	classPanel.image.frame = PLAYER_FRAMES[className];

	// Class Name Text:
	classPanel.text = gs.createText(x + 60, y, this.classNameText(className), 'PixelFont6-White', 12, this.group);

	
	// Achievements:
	classPanel.achievementIcons = [];
	classPanel.achievementIcons[0] = gs.createSprite(x + 54, y + 14, 'Tileset', this.group);
	classPanel.achievementIcons[0].frame = 1266;
	classPanel.achievementIcons[0].inputEnabled = true;
	


	classPanel.achievementIcons[1] = gs.createSprite(x + 54 + 32, y + 14, 'Tileset', this.group);
	classPanel.achievementIcons[1].frame = 1267;
	classPanel.achievementIcons[1].inputEnabled = true;
	


	classPanel.achievementIcons[2] = gs.createSprite(x + 54 + 64, y + 14, 'Tileset', this.group);
	classPanel.achievementIcons[2].frame = 1268;
	classPanel.achievementIcons[2].inputEnabled = true;


	return classPanel;
};

// CLASS_NAME_TEXT:
// ************************************************************************************************
ClassSelectMenu.prototype.classNameText = function (className) {
	var str = gs.capitalSplit(className);
	if (gs.achievements[className] > 0) {
		str += ' [' + gs.timeToString(gs.achievements[className]) + ']';
	}
	
	return str;
};

// UPDATE:
// ************************************************************************************************
ClassSelectMenu.prototype.update = function () {
	var str = '';
	this.achievementText.setText('');
	
	
	this.classPanelList.forEach(function (panel) {
		// Set Achievement Text:
		if (panel.achievementIcons[0].input.checkPointerOver(game.input.activePointer)) {
			str = 'Win for the first time.';
		}
		if (panel.achievementIcons[1].input.checkPointerOver(game.input.activePointer)) {
			str = 'Win in under 60 minutes.';
		}
		if (panel.achievementIcons[2].input.checkPointerOver(game.input.activePointer)) {
			str = 'Win in under 45 minutes.';
		}
		
		// Set Class Text:
		if (panel.button.isPointerOver()) {
			str = gs.capitalSplit(panel.button.className);
			
			/*
			if (panel.button.className === 'Barbarian') {
				str += '\nAbility cooldowns recharge when killing enemies.';
			}
			*/
			
			str += this.getStatsFor(panel.button.className);
		}
	}, this);
	
	// Set Daily Challenge Text:
	if (this.challengeButton.isPointerOver()) {
		let date = new Date();
		
		// Already completed challenge:
		if (this.isChallengeComplete()) {
			str = "Daily Challenge Complete for: " + date.toDateString();
		}
		// Challenge not started:
		else {
			str = "Start Daily challenge for: " + date.toDateString();
		}
		
		str += '\nBest Win Streak: ' + gs.bestChallengeWinStreak();
		str += '\nCurrent Win Streak: ' + gs.currentChallengeWinStreak();
	}
	
	// Set Achievement Text:
	if (this.challengeAchivements[0].input.checkPointerOver(game.input.activePointer)) {
		str = 'Win 2 daily challenges in a row.';
	}
	if (this.challengeAchivements[1].input.checkPointerOver(game.input.activePointer)) {
		str = 'Win 3 daily challenges in a row.';
	}
	if (this.challengeAchivements[2].input.checkPointerOver(game.input.activePointer)) {
		str = 'Win 5 daily challenges in a row.';
	}
	
	this.achievementText.setText(gs.wrapText(str, 30).join('\n'));
};

// GET_STATS_FOR:
// ************************************************************************************************
ClassSelectMenu.prototype.getStatsFor = function (className) {
	var str = '\n';
	
	
	str += 'Win/Loss: ' + gs.numWinsWithClass(className) + '/' + gs.numDeathsWithClass(className);
	
	// Percent:
	if (gs.numWinsWithClass(className) > 0 || gs.numDeathsWithClass(className) > 0) {
		if (gs.numDeathsWithClass(className) === 0) {
			str += ' [100%]\n';
		}
		else {
			let percent = gs.numWinsWithClass(className) / (gs.numWinsWithClass(className) + gs.numDeathsWithClass(className));
			str += ' [' + util.toPercentStr(percent) + ']\n';
		}
	}
	else {
		str += '\n';
	}

	str += 'Best Win Streak: ' + gs.bestWinStreakWithClass(className) + '\n';
	str += 'Current Win Streak: ' + gs.currentWinStreakWithClass(className);
	return str;
};

// IS_CHALLENGE_COMPLETE:
// ************************************************************************************************
ClassSelectMenu.prototype.isChallengeComplete = function () {
	let date = new Date();
	return gs.achievements.lastChallenge === "" + date.getFullYear() + date.getMonth() + date.getDate();
};

// CLASS_CLICKED:
// ************************************************************************************************
ClassSelectMenu.prototype.classClicked = function (button) {
	gs.playerClass = button.className;
	gs.stateManager.pushState('RaceSelectMenu');
};

// REFRESH:
// ************************************************************************************************
ClassSelectMenu.prototype.refresh = function () {
	this.classPanelList.forEach(function (panel) {
		panel.text.setText(this.classNameText(panel.className));
		
		// Locked:
		if (gs.achievements[panel.className] === 0) {
			panel.achievementIcons[0].tint = 0x555555;
		}
		else {
			panel.achievementIcons[0].tint = 0xffffff;
		}
		
		// Locked:
		if (gs.achievements[panel.className] === 0 || gs.achievements[panel.className] > 60 * 60 * 1000) {
			panel.achievementIcons[1].tint = 0x555555;
		}
		else {
			panel.achievementIcons[1].tint = 0xffffff;
		}
		
		// Locked:
		if (gs.achievements[panel.className] === 0 || gs.achievements[panel.className] > 45 * 60 * 1000) {
			panel.achievementIcons[2].tint = 0x555555;
		}
		else {
			panel.achievementIcons[2].tint = 0xffffff;
		}
	}, this);
	
	
	if (gs.bestChallengeWinStreak() < 2) {
		this.challengeAchivements[0].tint = 0x555555;
	}
	else {
		this.challengeAchivements[0].tint = 0xffffff;
	}
	
	if (gs.bestChallengeWinStreak() < 3) {
		this.challengeAchivements[1].tint = 0x555555;
	}
	else {
		this.challengeAchivements[1].tint = 0xffffff;
	}
	
	if (gs.bestChallengeWinStreak() < 5) {
		this.challengeAchivements[2].tint = 0x555555;
	}
	else {
		this.challengeAchivements[2].tint = 0xffffff;
	}
};

// OPEN:
// ************************************************************************************************
ClassSelectMenu.prototype.open = function () {
	
	this.refresh();
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
ClassSelectMenu.prototype.close = function () {
	this.group.visible = false;
};

// CHALLENGE_CLICKED:
// ************************************************************************************************
ClassSelectMenu.prototype.challengeClicked = function () {
	if (!this.isChallengeComplete()) {
		// Clearing game data to start the new game:
		gs.clearGameData();

		gs.startDailyChallenge = true;
		
		gs.mainMenuBase.startGame();
	}
};

// ON_BACK_CLICKED
// ************************************************************************************************
ClassSelectMenu.prototype.onBackClicked = function () {
	gs.stateManager.popState();
};

// IS_OPEN:
// ************************************************************************************************
ClassSelectMenu.prototype.isOpen = function () {
	return this.group.visible;
};
