/*global game, util, gs, console*/
/*global LevelGeneratorUtils, LevelGeneratorBase*/
/*global AreaGeneratorSquare, AreaGeneratorCave, AreaGeneratorLong, AreaGeneratorCircle, AreaGeneratorCross, AreaGeneratorVault*/ 
/*global VAULT_PLACEMENT*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

let LevelGeneratorTestArea = Object.create(LevelGeneratorBase);

// INIT:
// ************************************************************************************************
LevelGeneratorTestArea.init = function () {
	this.name = 'LevelGeneratorTestArea';
	
};

LevelGeneratorTestArea.init();

// GENERATE:
// ************************************************************************************************
LevelGeneratorTestArea.generate = function () {
	this.areaList = [];
	
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	// Vault Type (from debugProperties):
	let areaGenerator = gs.debugProperties.testAreaGenerator.areaGenerator;
	let rewardVault = gs.debugProperties.testAreaGenerator.rewardVault;
		
		
		
	// AREA_GENERATOR:
	if (areaGenerator) {
		this.generateArea(areaGenerator);
	}
	// REWARD_VAULT:
	else if (rewardVault) {
		let rewardDesc = this.getMajorRewardDesc(rewardVault.rewardType, rewardVault.doorType);
		let area = this.generateSideVault(rewardDesc.vaultType);
		AreaGeneratorVault.dressAreaMajorReward(area, rewardDesc.rewardType, rewardDesc.doorType);
		
	}
	// VAULT:
	else {
		let vaultType = gs.getVaultType(gs.debugProperties.testAreaGenerator.vaultTypeName);
		
		
		
		// SIDE_VAULT:
		if (vaultType.placementType === VAULT_PLACEMENT.SIDE) {
			this.generateSideVault(vaultType);
		}
		// SOLID_VAULT:
		else if (vaultType.placementType === VAULT_PLACEMENT.SOLID) {
			this.generateSolidVault(vaultType);
		}
		
		
	}
	
};

// GENERATE_AREA:
// ************************************************************************************************
LevelGeneratorTestArea.generateArea = function (areaGenerator) {
	let boundsBox = util.createBox(15, 15, 30, 30);
	
	let roomArea = areaGenerator.generate(boundsBox);
	
	let openBoxList = [
		util.createBox(1, 18, 5, 22),
		util.createBox(35, 18, 39, 22),
		util.createBox(18, 1, 22, 5),
		util.createBox(18, 35, 22, 39)
	];
	
	openBoxList.forEach(function (box) {
		LevelGeneratorUtils.placeTileSquare(box.startX, box.startY, box.endX, box.endY, gs.tileTypes.Floor);
		LevelGeneratorUtils.placeHall(box.centerTileIndex, roomArea);
	}, this);
	
	// Player Spawn Point:
	let indexList = gs.getIndexListInArea(roomArea).filter(index => gs.isPassable(index));
	let pcTileIndex = util.nearestTo(roomArea.centerTileIndex, indexList);
	gs.createObject(pcTileIndex, 'PCSpawnPoint');
};

// GENERATE_SIDE_VAULT:
// ************************************************************************************************
LevelGeneratorTestArea.generateSideVault = function (sideVaultType) {	
	// First create a large room for the Side-Vault to connect to:
	let boundsBox = util.createBox(10, 20, 30, 40);
	let roomArea = AreaGeneratorSquare.generate(boundsBox);
	
	// Create Side-Vault:
	let sideVaultArea = this.tryToPlaceVault(sideVaultType);
	this.areaList.push(sideVaultArea);
	
	// Player Spawn Point:
	gs.createObject(roomArea.centerTileIndex, 'PCSpawnPoint');
	
	return sideVaultArea;
};

// GENERATE_SOLID_VAULT:
// ************************************************************************************************
LevelGeneratorTestArea.generateSolidVault = function (vaultType) {
	// Create Solid-Vault:
	let tileIndex = {x: 20 - Math.floor(vaultType.width / 2), y: 20 - Math.floor(vaultType.height / 2)};
	
	let angle = 0;
	if (vaultType.allowRotate) {
		angle = util.randElem([0, 90, 180, 270]);
	}
	
	
	let solidVaultArea = AreaGeneratorVault.generate(tileIndex, vaultType, angle);
	this.areaList.push(solidVaultArea);
	
	let openBoxList = [
		util.createBox(1, 18, 5, 22),
		util.createBox(35, 18, 39, 22),
		util.createBox(18, 1, 22, 5),
		util.createBox(18, 35, 22, 39)
	];
	
	openBoxList.forEach(function (box) {
		LevelGeneratorUtils.placeTileSquare(box.startX, box.startY, box.endX, box.endY, gs.tileTypes.Floor);
		LevelGeneratorUtils.placeHall(box.centerTileIndex, solidVaultArea);
	}, this);
	
	// Filling reward hooks:
	gs.createDoor({x: 19, y: 36}, 'SwitchDoor');
	gs.levelFeatures.push({featureType: FEATURE_TYPE.SWITCH, toTileIndex: {x: 19, y: 36}});
	levelPopulator.createSwitches();
	//levelPopulator.createItems();
	
	// Player Spawn Point:
	let indexList = gs.getIndexListInArea(solidVaultArea).filter(index => gs.isPassable(index));
	let pcTileIndex = util.nearestTo(solidVaultArea.centerTileIndex, indexList);
	gs.createObject(pcTileIndex, 'PCSpawnPoint');
};