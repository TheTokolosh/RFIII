/*global game, gs, console, Phaser, util*/
/*global DungeonGenerator, LevelGeneratorUtils, LevelGeneratorMajorVault, AreaGeneratorVault*/
/*global FEATURE_TYPE, VAULT_PLACEMENT, VAULT_CONTENT*/
/*global NUM_TILES_X, NUM_TILES_Y*/
/*jshint esversion: 6*/
'use strict';

let LevelGeneratorMajorCrypt = Object.create(LevelGeneratorMajorVault);

// INIT:
// ************************************************************************************************
LevelGeneratorMajorCrypt.init = function () {
	this.name = 'LevelGeneratorMajorCrypt';
};
LevelGeneratorMajorCrypt.init();

// GENERATE:
// ************************************************************************************************
LevelGeneratorMajorCrypt.generate = function () {
    this.initNumVaults();
    this.numAestheticVaults = util.randInt(2, 3);
    
	this.previouslyPlacedVaultTypes = [];
	
	this.roomAreaList = [];
	
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	// Place Major Vault:
	this.placeMajorVault();
	this.maxFloorTiles = Math.max(500, gs.countFloorTiles() * 1.5);
	
    // Side Vaults:
    this.placeSideVaults(100);
	
	// Trim Walls
	LevelGeneratorUtils.trimWalls();
	
	// Place Doors:
	LevelGeneratorUtils.placeDoors();
	
	// Room List:
	gs.areaList = this.roomAreaList;
};


