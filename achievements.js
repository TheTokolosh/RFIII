/*global gs, steam*/
/*global CLASS_LIST*/
'use strict';
let achievements = {};

// INIT:
// ************************************************************************************************
achievements.init = function () {
	let list = steam.greenworks.getAchievementNames();
	let achivementList = [];
	
	list.forEach(function (name) {
		steam.greenworks.getAchievement(name, function (b) {
			achivementList.push({name: name, isAchieved: b});
		});
	}, this);
	
	this.achievementList = achivementList;
};

// GET:
// Call to post the achievement to the steam servers
// ************************************************************************************************
achievements.get = function (name) {
	// No achievements on seeded game:
	if (gs.setSeed) {
		return;
	}
	
	// Not connected to steam:
	if (!steam.isConnected) {
		console.log('not connected to steam: ' + name);
		return;
	}
	
	// Already have achievement:
	let achieve = this.achievementList.find(e => e.name === name);
	if (achieve && achieve.isAchieved) {
		return;
	}
	

	// Post to steam:
	steam.greenworks.activateAchievement(name, function (success) {
		console.log('get achievement: ' + name);
	});
};

// ON_WIN_GAME:
// Call whenever the player wins the game to set achievements that depend on victory.
// ************************************************************************************************
achievements.onWinGame = function () {
	// No achievements on seeded game:
	if (gs.setSeed) {
		return;
	}
	
	// VICTORY:
	this.get('VICTORY_AT_LAST');
	
	// NO_TIME_TO_THINK:
	let time = gs.fastestWinTimeWith('All', 'All', 'All');
	if (time <= 30 * 60 * 1000) { // 30 Minutes
		this.get('NO_TIME_TO_THINK');
	}
	
	// HAT_TRICK:
	let streak = gs.bestWinStreakWith('All', 'All', 'All');
	if (streak >= 3) {
		this.get('HAT_TRICK');
	}
	
	// MASTER_OF_CHANCE:
	let challengeStreak = gs.bestWinStreakWith('All', 'All', 'Daily Challenge');
	if (challengeStreak >= 3) {
		this.get('MASTER_OF_CHANCE');
	}
	
	// MENAGERIE:
	let raceList = gs.playerRaceList.map(e => e.name);
	let raceWins = 0;
	raceList.forEach(function (raceName) {
		if (gs.numWinsWith('All', raceName, 'All') >= 1) {
			raceWins += 1;
		}
	}, this);
	
	if (raceWins >= raceList.length) {
		this.get('MENAGERIE');
	}
	
	// POLYMATH:
	let classList = CLASS_LIST;
	let classWins = 0;
	classList.forEach(function (className) {
		if (gs.numWinsWith(className, 'All', 'All') >= 1) {
			classWins += 1;
		}
	}, this);
	
	if (classWins >= classList.length) {
		this.get('POLYMATH');
	}
	
	// NUDIST:
	if (gs.pc.isNudist) {
		this.get('NUDIST');
	}
	
	// UNTOUCHABLE:
	if (gs.pc.isUntouchable) {
		this.get('UNTOUCHABLE');
	}
	
};