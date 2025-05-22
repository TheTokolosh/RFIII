/*global gs, util, console*/
/*jshint esversion: 6*/
'use strict';

// LOAD_GLOBAL_DATA:
// ************************************************************************************************
gs.loadGlobalData = function () {
	
	// Achievements:
	if (util.doesFileExist('Achievements')) {
		gs.achievements = util.readFile('Achievements');
		
	}
	else {
		gs.achievements = {};
	}
	
	// Fill missing achievements:
	if (!gs.achievements.hasOwnProperty('Warrior')) 	gs.achievements.Warrior = 0;
	if (!gs.achievements.hasOwnProperty('Barbarian')) 	gs.achievements.Barbarian = 0;
	if (!gs.achievements.hasOwnProperty('Ranger')) 		gs.achievements.Ranger = 0;
	if (!gs.achievements.hasOwnProperty('Rogue')) 		gs.achievements.Rogue = 0;
	if (!gs.achievements.hasOwnProperty('FireMage')) 	gs.achievements.FireMage = 0;
	if (!gs.achievements.hasOwnProperty('StormMage')) 	gs.achievements.StormMage = 0;
	if (!gs.achievements.hasOwnProperty('IceMage')) 	gs.achievements.IceMage = 0;
	if (!gs.achievements.hasOwnProperty('Necromancer')) gs.achievements.Necromancer = 0;
	if (!gs.achievements.hasOwnProperty('Enchanter')) 	gs.achievements.Enchanter = 0;
	if (!gs.achievements.hasOwnProperty('Duelist')) 	gs.achievements.Duelist = 0;

	// globalData:
	if (util.doesFileExist('GlobalData')) {
		try {
			gs.globalData = util.readFile('GlobalData');
		}
		catch (err) {
			console.log('GLOBAL DATA FILE WAS CORRUPTED: Creating a new one... Please contact Justin about this issue.');
			gs.globalData = {};
		}
	}
	else {
		gs.globalData = {};
	}
	
	// Fill missing globalData:
	if (!gs.globalData.hasOwnProperty('items')) 		gs.globalData.items = false;
	if (!gs.globalData.hasOwnProperty('books')) 		gs.globalData.books = false;
	if (!gs.globalData.hasOwnProperty('stairs')) 		gs.globalData.stairs = false;
	if (!gs.globalData.hasOwnProperty('rest')) 			gs.globalData.rest = false;
	if (!gs.globalData.hasOwnProperty('unsafeMove')) 	gs.globalData.unsafeMove = false;
	if (!gs.globalData.hasOwnProperty('musicOn')) 		gs.globalData.musicOn = true;
	if (!gs.globalData.hasOwnProperty('soundOn')) 		gs.globalData.soundOn = true;
	if (!gs.globalData.hasOwnProperty('userName')) 		gs.globalData.userName = "";
	if (!gs.globalData.hasOwnProperty('musicVolume')) 	gs.globalData.musicVolume = 0.5;
	if (!gs.globalData.hasOwnProperty('soundVolume')) 	gs.globalData.soundVolume = 0.5;
	if (!gs.globalData.hasOwnProperty('fullScreen')) 	gs.globalData.fullScreen = false;
	if (!gs.globalData.hasOwnProperty('focusCamera'))	gs.globalData.focusCamera = true;
	if (!gs.globalData.hasOwnProperty('useHPText'))		gs.globalData.useHPText = false;
	if (!gs.globalData.hasOwnProperty('useMPText'))		gs.globalData.useMPText = true;
	if (!gs.globalData.hasOwnProperty('lastVersion'))	gs.globalData.lastVersion = '1.0';
	
	if (!gs.globalData.userName) {
		gs.globalData.userName = "";
	}
	
	if (!gs.achievements.lastChallenge) {
		gs.achievements.lastChallenge = null;
	}
	
	// Game Records:
	gs.loadGameRecords();
};

// SAVE_GLOBAL_DATA:
// ************************************************************************************************
gs.saveGlobalData = function () {
	gs.globalData.soundOn = gs.soundOn;
	gs.globalData.musicOn = gs.musicOn;
	gs.globalData.soundVolume = gs.soundVolume;
	gs.globalData.musicVolume = gs.musicVolume;
	gs.globalData.fullScreen = gs.fullScreen;
	
	util.writeFile('GlobalData', JSON.stringify(gs.globalData));
};