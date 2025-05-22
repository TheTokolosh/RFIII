/*global game, gs, console, Phaser, util*/
/*global DungeonGenerator, LevelGeneratorUtils, LevelGeneratorCycles, AreaGeneratorVault*/
/*global FEATURE_TYPE, VAULT_PLACEMENT, VAULT_CONTENT*/
/*global NUM_TILES_X, NUM_TILES_Y*/
/*jshint esversion: 6*/
'use strict';

let LevelGeneratorMajorVault = Object.create(LevelGeneratorCycles);

// INIT:
// ************************************************************************************************
LevelGeneratorMajorVault.init = function () {
	this.name = 'LevelGeneratorMajorVault';
};
LevelGeneratorMajorVault.init();

// GENERATE:
// ************************************************************************************************
LevelGeneratorMajorVault.generate = function () {
    this.initNumVaults();
    this.numAestheticVaults = util.randInt(1, 3);
    
	this.previouslyPlacedVaultTypes = [];
	
	this.roomAreaList = [];
	
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	// Place Major Vault:
	this.placeMajorVault();
	this.maxFloorTiles = Math.max(500, gs.countFloorTiles() * 1.5);
	
	// Normal Rooms:
	this.placeRooms();
	this.connectRooms();
	
    // Side Vaults:
    this.placeSideVaults(100);
	
	// Trim Walls
	LevelGeneratorUtils.trimWalls();
	
	// Place Doors:
	LevelGeneratorUtils.placeDoors();
	
	// Room List:
	gs.areaList = this.roomAreaList;
};

// PLACE_MAJOR_VAULT:
// ************************************************************************************************
LevelGeneratorMajorVault.placeMajorVault = function () {
	var rotate = 0,
		vaultType = this.selectMajorVaultType(), 
		width = vaultType.width,
		height = vaultType.height;
	
	// Rotation:
	if (vaultType.allowRotate) {
		rotate = util.randElem([0, 90, 180, 270]);
	}
	
	// Adjust width and height for rotation:
	if (rotate === 90 || rotate === 270) {
		width = vaultType.height;
		height = vaultType.width;
	}
	
	// Create a centered box:
	let tileIndex = {x: Math.floor((NUM_TILES_X - width) / 2), y: Math.floor((NUM_TILES_Y - height) / 2)};

	this.majorVaultArea = AreaGeneratorVault.generate(tileIndex, vaultType, rotate, false);
	this.roomAreaList.push(this.majorVaultArea);
};

// SELECT_MAJOR_VAULT_TYPE:
// ************************************************************************************************
LevelGeneratorMajorVault.selectMajorVaultType = function () {
	
	// VAULT_TYPE:
	let vaultLevelFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.VAULT_TYPE && !levelFeature.hasGenerated);
	if (vaultLevelFeature) {
		let vaultType = gs.vaultTypeList.find(vaultType => vaultType.placementType === VAULT_PLACEMENT.MAJOR && (vaultType.name === vaultLevelFeature.vaultTypeName || vaultType.id === vaultLevelFeature.vaultTypeName));
		if (vaultType) {
			vaultLevelFeature.hasGenerated = true;
			return gs.getVaultType(vaultLevelFeature.vaultTypeName);
		}
	}
	
    // BOSS:
    let bossLevelFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.BOSS && !levelFeature.hasGenerated);
    if (bossLevelFeature && util.frac() <= 0.5) {
        let vaultTypeList = gs.getVaultTypeList();
        vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.MAJOR);
        vaultTypeList = vaultTypeList.filter(vaultType => vaultType.bossName === bossLevelFeature.bossName);
        
        if (vaultTypeList.length > 0) {
            bossLevelFeature.hasGenerated = true;
            return util.randElem(vaultTypeList);
        }
    }
	
	// ZONE_LINE_VAULT:
	let zoneLineFeature =  gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.ZONE_LINE && !levelFeature.hasGenerated);
	if (zoneLineFeature && util.frac() <= 0.5) {
		let vaultTypeList = gs.getVaultTypeList();
        vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.MAJOR);
        vaultTypeList = vaultTypeList.filter(vaultType => vaultType.toZoneName === zoneLineFeature.toZoneName);
        
        if (vaultTypeList.length > 0) {
            zoneLineFeature.hasGenerated = true;
            return util.randElem(vaultTypeList);
        }
	}
	
	
	// VAULT_SET:
    let vaultSetFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.VAULT_SET && !levelFeature.hasGenerated);
    if (vaultSetFeature && util.frac() < 0.5) {
        let vaultTypeList = gs.vaultTypeList;
        vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.MAJOR);
        vaultTypeList = vaultTypeList.filter(vaultType => vaultType.vaultSet === vaultSetFeature.vaultSet);
        
        if (vaultTypeList.length > 0) {
            vaultSetFeature.hasGenerated = true;
            return util.randElem(vaultTypeList);
        }
    }
	
    // AESTHETIC:
	let vaultTypeList = gs.getVaultTypeList();

	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.MAJOR);
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.AESTHETIC);

	if (vaultTypeList.length === 0) {
		throw 'ERROR [LevelGeneratorMajorVault.selectMajorVaultType] - no valid major vaults';
	}

	return util.randElem(vaultTypeList);
    
};
