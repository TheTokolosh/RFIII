/*global gs, util, console, LZString*/
/*jshint esversion: 6*/
'use strict';

// GAME_RECORD:
// ************************************************************************************************
function GameRecord () {}

// LOAD_GAME_RECORDS:
// ************************************************************************************************
gs.loadGameRecords = function () {
	var data;
	
	if (util.doesFileExist('GameRecords')) {
		data = util.readFile('GameRecords');
	}
	
	gs.gameRecords = [];
	
	if (data) {
		data.forEach(function (e) {
			gs.gameRecords.push(gs.loadGameRecord(e));
		}, this);
	}
};

// LOG_GAME_RECORD:
// Call this to create a new game record:
// ************************************************************************************************
gs.logGameRecord = function (text, isWin) {
	var gameRecord = new GameRecord();
	
	// Skip if seeded game:
	if (gs.setSeed) {
		return;
	}
	
	gameRecord.date = Date.now();
	gameRecord.isChallenge = gs.isDailyChallenge;
	gameRecord.gameTime = gs.gameTime();
	gameRecord.zoneName = gs.capitalSplit(gs.zoneName);
	gameRecord.zoneLevel = gs.zoneLevel;
	gameRecord.playerClass = gs.pc.characterClass;
	gameRecord.playerRace = gs.pc.race.name;
	gameRecord.playerLevel = gs.pc.level;
	gameRecord.isWin = isWin;
	gameRecord.text = text;
	gameRecord.seed = gs.seed;
	
	this.gameRecords.push(gameRecord);
	
	console.log('creating game record...');
	
	util.writeFile('GameRecords', JSON.stringify(this.gameRecords));
};

// LOAD_GAME_RECORD:
// ************************************************************************************************
gs.loadGameRecord = function (data) {
	var gameRecord = new GameRecord();
	
	gameRecord.date = data.date;
	gameRecord.isChallenge = data.isChallenge;
	gameRecord.gameTime = data.gameTime;
	gameRecord.zoneName = data.zoneName;
	gameRecord.zoneLevel = data.zoneLevel;
	gameRecord.playerClass = data.playerClass;
	gameRecord.playerRace = data.playerRace;
	gameRecord.playerLevel = data.playerLevel;
	gameRecord.isWin = data.isWin;
	gameRecord.text = data.text || "";
	gameRecord.seed = data.seed || null;
	
	return gameRecord;
};



// TO_STRING:
// ************************************************************************************************
GameRecord.prototype.toString = function () {
	var str = '', date;
	
	// Date Title:
	date = new Date(this.date);
	str += '*' + date.toDateString();
	
	// Time:
	str += ' - ' + gs.timeToString(this.gameTime);
	
	// Seed:
	if (this.seed) {
		str += ' - ' + this.seed;
	}
	
	str += '\n';
	
	
	str += 'lvl ' + this.playerLevel + ' ';
	str += gs.capitalSplit(this.playerClass) + ' ';
	
	
	if (this.isWin) {
		str += 'Successfully retrieved the goblet.';
	}
	else if (this.text && this.text.length > 0) {
		str += this.text + ' in ' + gs.capitalSplit(this.zoneName) + ' ' + this.zoneLevel + '.';
	}
	else {
		str += 'Was killed in ' + gs.capitalSplit(this.zoneName) + ' ' + this.zoneLevel + '.';
	}

	
	
	return str;
};
