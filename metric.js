/*global game, gs, console, Phaser, util, debug*/
/*global DungeonGenerator*/
/*jshint laxbreak: true, esversion: 6, loopfunc: true*/
'use strict';

var GameMetric = {};

GameMetric.zoneList = [
	'TheUpperDungeon',
	'TheSunlessDesert',
	'TheOrcFortress',
	'TheSewers',
	'TheCrypt',
	'TheVaultOfYendor'
];

// RUN_FULL_GAME:
// ************************************************************************************************
GameMetric.runFullGame = function () {
	gs.soundOn = false;
	
	let table = [];
	
	this.zoneList.forEach(function (zoneName) {
		for (let zoneLevel = 1; zoneLevel <= 4; zoneLevel += 1) {
			// Log:
			console.log('Generating: ' + zoneName + ':' + zoneLevel);
			
			// Warp to level:
			gs.changeLevel(zoneName, zoneLevel);
		
			// Clear level:
			debug.clearLevel();
			
			// Clear PC Inventory:
			gs.pc.inventory.clear();
			
			// Log:
			table.push({
				zoneName: zoneName,
				zoneLevel: zoneLevel,
				XL: gs.pc.level
			});
		}
	}, this);
	
	console.table(table);
};

// TEST_ZONE:
// ************************************************************************************************
GameMetric.testZone = function () {
	let TRIALS = 10;
	let zoneName = gs.debugProperties.metricTestSingleZone;
	
	for (let i = 0; i < TRIALS; i += 1) {
		console.log(zoneName + ' trial: ' + i);
		
		// Clearing Lists:
		gs.previouslySpawnedVaults = [];
		gs.seed = '' + Date.now();
		
		// Refresh level-features:
		DungeonGenerator.generate();
		
		// Generate Levels:
		for (let zl = 1; zl <= gs.zoneTypes[zoneName].numLevels; zl += 1) {
			console.log('ZL:' + zl);
			gs.changeLevel(zoneName, zl, true);
			
			/*
			if (gs.objectList.find(obj => obj.type.niceName === 'Conveyor Belt' && !gs.getTile(obj.tileIndex).type.passable)) {
				console.log('FOUND IT!');
				return;
			}
			*/
			
		}
		
	}
};
