/*global gs, console, XMLHttpRequest, steam*/
/*global CLASS_LIST*/
/*jshint esversion: 6*/
'use strict';





// FASTEST_WIN_TIME:
// ************************************************************************************************
gs.fastestWinTime = function () {
	var minTime = 10 * 60 * 60 * 1000, // 10 hours
		minClassName;
	
	CLASS_LIST.forEach(function (className) {
		if (this.achievements[className]) {
			if (this.achievements[className] < minTime) {
				minTime = this.achievements[className];
				minClassName = className;
			}
		}
	}, this);
	
	if (minTime === 10 * 60 * 60 * 1000) {
		return false;
	}
	else {
		return {time: minTime, className: minClassName};
	}
};





// TOTAL_WINS:
// ************************************************************************************************
gs.totalWins = function () {
	return this.gameRecords.filter(record => record.isWin).length;
};

// TOTAL_DEATHS:
// ************************************************************************************************
gs.totalDeaths = function () {
	return this.gameRecords.filter(record => !record.isWin).length;
};

// TOTAL_GAMES:
// ************************************************************************************************
gs.totalGames = function () {
	return this.totalWins() + this.totalDeaths();
};

// NUM_WINS_WITH_CLASS:
// ************************************************************************************************
gs.numWinsWithClass = function (className) {
	return this.gameRecords.filter(record => record.isWin && record.playerClass === className).length;
};

// NUM_DEATHS_WITH_CLASS:
// ************************************************************************************************
gs.numDeathsWithClass = function (className) {
	return this.gameRecords.filter(record => !record.isWin && record.playerClass === className).length;
};

// NUM_WINS_WITH:
// gameMode: {Standard, Daily Challenge, All}
// ************************************************************************************************
gs.numWinsWith = function (className, raceName, gameMode) {
	let list = this.gameRecords;
	
	list = list.filter(record => record.isWin);
	list = list.filter(record => record.playerClass === className || className === 'All');
	list = list.filter(record => record.playerRace === raceName || raceName === 'All');
	
	// Game Mode:
	if (gameMode === 'Standard') {
		list = list.filter(record => !record.isChallenge);
	}
	else if (gameMode === 'Daily Challenge') {
		list = list.filter(record => record.isChallenge);
	}
	
	return list.length;			   
};

// NUM_DEATHS_WITH:
// gameMode: {Standard, Daily Challenge, All}
// ************************************************************************************************
gs.numDeathsWith = function (className, raceName, gameMode) {
	let list = this.gameRecords;
	
	list = list.filter(record => !record.isWin);
	list = list.filter(record => record.playerClass === className || className === 'All');
	list = list.filter(record => record.playerRace === raceName || raceName === 'All');
	
	// Game Mode:
	if (gameMode === 'Standard') {
		list = list.filter(record => !record.isChallenge);
	}
	else if (gameMode === 'Daily Challenge') {
		list = list.filter(record => record.isChallenge);
	}
	
	return list.length;	
};

// FASTEST_WIN_TIME_WITH:
// gameMode: {Standard, Daily Challenge, All}
// ************************************************************************************************
gs.fastestWinTimeWith = function (className, raceName, gameMode) {
	
	let list = this.gameRecords;
	list = list.filter(record => record.isWin);
	list = list.filter(record => record.playerClass === className || className === 'All');
	list = list.filter(record => record.playerRace === raceName || raceName === 'All');
	
	// Game Mode:
	if (gameMode === 'Standard') {
		list = list.filter(record => !record.isChallenge);
	}
	else if (gameMode === 'Daily Challenge') {
		list = list.filter(record => record.isChallenge);
	}
	
	let minTime = 10 * 60 * 60 * 1000;
	list.forEach(function (record) {
		if (record.gameTime < minTime) {
			minTime = record.gameTime;
		}
	}, this);
	
	if (minTime !== 10 * 60 * 60 * 1000) {
		return minTime;
	}
	else {
		return 0;
	}
};

// BEST_WIN_STREAK_WITH:
// gameMode: {Standard, Daily Challenge, All}
// ************************************************************************************************
gs.bestWinStreakWith = function (className, raceName, gameMode) {
	var count = 0, maxCount = 0;
	
	let list = this.gameRecords;
	list = list.filter(record => record.playerClass === className || className === 'All');
	list = list.filter(record => record.playerRace === raceName || raceName === 'All');
	
	// Game Mode:
	if (gameMode === 'Standard') {
		list = list.filter(record => !record.isChallenge);
	}
	else if (gameMode === 'Daily Challenge') {
		list = list.filter(record => record.isChallenge);
	}
	
	list.forEach(function (record) {
		if (record.isWin) {
			count += 1;
			
			maxCount = Math.max(count, maxCount);
		}
		else {
			count = 0;
		}
	}, this);
	
	return maxCount;
};

// CURRENT_WIN_STREAK_WITH:
// ************************************************************************************************
gs.currentWinStreakWith = function (className, raceName, gameMode) {
	let count = 0;
	
	let list = this.gameRecords;
	list = list.filter(record => record.playerClass === className || className === 'All');
	list = list.filter(record => record.playerRace === raceName || raceName === 'All');
	
	// Game Mode:
	if (gameMode === 'Standard') {
		list = list.filter(record => !record.isChallenge);
	}
	else if (gameMode === 'Daily Challenge') {
		list = list.filter(record => record.isChallenge);
	}
	
	if (list.length === 0) {
		return 0;
	}
	
	for (let i = list.length - 1; i >= 0; i -= 1) {
		if (list[i].isWin) {
			count += 1;
		}
		else {
			break;
		}
	}
	
	return count;
};

// NUM_CHALLENGE_WINS:
// ************************************************************************************************
gs.numChallengeWins = function () {
	return this.gameRecords.filter(record => record.isWin && record.isChallenge).length;
};

// NUM_CHALLENGE_DEATHS:
// ************************************************************************************************
gs.numChallengeDeaths = function () {
	return this.gameRecords.filter(record => !record.isWin && record.isChallenge).length;
};

// HIGHEST_WIN_STREAK:
// ************************************************************************************************
gs.highestWinStreak = function () {
	var max = 0;
	
	CLASS_LIST.forEach(function (className) {
		if (this.bestWinStreakWithClass(className) > max) {
			max = this.bestWinStreakWithClass(className);
		}
	}, this);
	
	return max;
};

// HIGHEST_WIN_STREAK_CLASS:
// ************************************************************************************************
gs.highestWinStreakClass = function () {
	var max = 0, bestClass = null;
	
	CLASS_LIST.forEach(function (className) {
		if (this.bestWinStreakWithClass(className) > max) {
			max = this.bestWinStreakWithClass(className);
			bestClass = className;
		}
	}, this);
	
	return bestClass;
};




// BEST_WIN_STREAK_WITH_CLASS:
// ************************************************************************************************
gs.bestWinStreakWithClass = function (className) {
	var count = 0, maxCount = 0, list;
	
	list = this.gameRecords.filter(record => record.playerClass === className);
	
	list.forEach(function (record) {
		if (record.isWin) {
			count += 1;
			
			maxCount = Math.max(count, maxCount);
		}
		else {
			count = 0;
		}
	}, this);
	
	return maxCount;
};

// CURRENT_WIN_STREAK_WITH_CLASS:
// ************************************************************************************************
gs.currentWinStreakWithClass = function (className) {
	var list = this.gameRecords.filter(record => record.playerClass === className),
		count = 0;
	
	if (list.length === 0) {
		return 0;
	}
	
	for (let i = list.length - 1; i >= 0; i -= 1) {
		if (list[i].isWin) {
			count += 1;
		}
		else {
			break;
		}
	}
	
	return count;
};

// BEST_CHALLENGE_WIN_STREAK:
// ************************************************************************************************
gs.bestChallengeWinStreak = function () {
	var count = 0, maxCount = 0, list;
	
	list = this.gameRecords.filter(record => record.isChallenge);
	
	list.forEach(function (record) {
		if (record.isWin) {
			count += 1;
			
			maxCount = Math.max(count, maxCount);
		}
		else {
			count = 0;
		}
	}, this);
	
	return maxCount;
};

// CURRENT_CHALLENGE_WIN_STREAK:
// ************************************************************************************************
gs.currentChallengeWinStreak = function () {
	var list = this.gameRecords.filter(record => record.isChallenge),
		count = 0;
	
	if (list.length === 0) {
		return 0;
	}
	
	for (let i = list.length - 1; i >= 0; i -= 1) {
		if (list[i].isWin) {
			count += 1;
		}
		else {
			break;
		}
	}
	
	return count;
};

// POST_STATS:
// ************************************************************************************************
gs.postStats = function (text) {
	var gameType,
		gameResult;
	
	if (!steam.isConnected || !gs.debugProperties.logStats) {
		console.log('Not connected to steam: cannot record stats');
		return;
	}
	
	
	if (gs.isDailyChallenge) {
		gameType = 'DAILY_CHALLENGE';
	}
	else {
		gameType = 'STANDARD';
	}
	
	if (gs.pc.isAlive) {
		gameResult = 'WIN';
	}
	else {
		gameResult = 'DEATH';
	}
	
	
	console.log('attempting to send stats to server...');
	var xhttp = new XMLHttpRequest();
	var data = {
		// Steam Data:
		screenName: steam.steamId.screenName,
		accountId: steam.steamId.steamId,
		
		// Player Data:
		playerClass: gs.pc.characterClass,
		playerRace: gs.pc.race.name,
		playerLevel: gs.pc.level,
		
		// Game Data:
		zoneName: gs.capitalSplit(this.zoneName),
		zoneLevel: this.zoneLevel,
		text: text,
		time: gs.gameTime(),
		gameType: gameType,
		gameResult: gameResult,
	};
	//xhttp.open('POST','https://justinwang123.pythonanywhere.com/stats/submit',true);
	
	xhttp.open('POST','http://justinwang123.pythonanywhere.com/submit/',true);
	
	xhttp.send(JSON.stringify(data));
};
