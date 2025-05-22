/*global game, util, gs, console*/
/*global LevelGeneratorBase, LevelGeneratorUtils, DungeonGenerator, levelPopulator*/
/*global AreaGeneratorVault*/ 
/*global VAULT_CONTENT, VAULT_PLACEMENT, FEATURE_TYPE*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

let LevelGeneratorYendorCenter = Object.create(LevelGeneratorBase);

// INIT:
// ************************************************************************************************
LevelGeneratorYendorCenter.init = function () {
	this.centerVaultSet = 'YendorCenter';
	this.sideVaultSet = 'YendorSide';
	
	this.noSpawn = true;
};
LevelGeneratorYendorCenter.init();

// GENERATE:
// ************************************************************************************************
LevelGeneratorYendorCenter.generate = function () {
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	this.roomAreaList = [];
	
	this.placeCenterVault();
	
	this.placeSideVault({x: 0, y: 0}, 0);
	this.placeSideVault({x: 28, y: 0}, 90);
	this.placeSideVault({x: 0, y: 28}, 180);
	this.placeSideVault({x: 0, y: 0}, 270);
	
	// Place Stairs:
	let tileIndex = levelPopulator.getEmptyRewardHook().tileIndex;
	gs.createZoneLine(tileIndex, 'DownStairs');
};

// PLACE_CENTER_VAULT:
// ************************************************************************************************
LevelGeneratorYendorCenter.placeCenterVault = function () {
	let vaultTypeList = gs.getVaultTypeList(this.centerVaultSet);
	
	let vaultType = util.randElem(vaultTypeList);
	let area = AreaGeneratorVault.generate({x: 0, y: 0}, vaultType);
	this.roomAreaList.push(area);
};

// PLACE_SIDE_VAULT:
// ************************************************************************************************
LevelGeneratorYendorCenter.placeSideVault = function (tileIndex, angle) {
	let vaultTypeList = gs.getVaultTypeList(this.sideVaultSet);
	
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.allowRotate || vaultType.orientationAngle === angle);
	
	let vaultType = util.randElem(vaultTypeList);
	let area = AreaGeneratorVault.generate(tileIndex, vaultType, angle);
	this.roomAreaList.push(area);
};