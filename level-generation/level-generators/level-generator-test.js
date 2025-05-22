/*global game, util, gs, console*/
/*global LevelGeneratorUtils, LevelGeneratorBase*/
/*global AreaGeneratorSquare, AreaGeneratorCave, AreaGeneratorLong, AreaGeneratorCircle, AreaGeneratorCross, AreaGeneratorVault*/ 
/*global VAULT_PLACEMENT*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

let LevelGeneratorTest = Object.create(LevelGeneratorBase);

// INIT:
// ************************************************************************************************
LevelGeneratorTest.init = function () {
	this.name = 'LevelGeneratorTest';
};

LevelGeneratorTest.init();

// GENERATE:
// ************************************************************************************************
LevelGeneratorTest.generate = function () {	
	let areaList = [];
	
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	LevelGeneratorUtils.placeTileSquare(1, 1, NUM_TILES_X - 1, NUM_TILES_Y - 1, gs.tileTypes.Floor);
	
	// Create Vaults:
	areaList.push(AreaGeneratorVault.generate({x: 0, y: 0}, gs.getVaultType(672)));
	areaList.push(AreaGeneratorVault.generate({x: 0, y: 11}, gs.getVaultType(673)));
	
	// Room List:
	gs.areaList = areaList;
};

