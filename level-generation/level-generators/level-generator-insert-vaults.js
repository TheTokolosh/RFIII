/*global gs, util*/
/*global LevelGeneratorBase, LevelGeneratorUtils, AreaGeneratorVault*/
/*global FEATURE_TYPE, VAULT_PLACEMENT, VAULT_CONTENT, EXCEPTION_TYPE*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

// LEVEL_GENERATOR_INSERT_VAULTS:
// ************************************************************************************************
let LevelGeneratorInsertVaults = Object.create(LevelGeneratorBase);
LevelGeneratorInsertVaults.init = function () {
	this.name = 'LevelGeneratorInsertVaults';
};
LevelGeneratorInsertVaults.init();


// GENERATE:
// ************************************************************************************************
LevelGeneratorInsertVaults.generate = function () {	
	this.initNumVaults();
	this.roomAreaList = [];
	
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	LevelGeneratorUtils.placeTileSquare(1, 1, NUM_TILES_X - 1, NUM_TILES_Y - 1, gs.tileTypes.Floor);
	
	this.placeBaseVault();
	this.placeInsertVaults();
	
	this.placeSideVaults(1.0);
};

// PLACE_BASE_VAULT:
// ************************************************************************************************
LevelGeneratorInsertVaults.placeBaseVault = function () {
	// Select Vault:
	let vaultType = this.selectBaseVault();
	
	// Place Vault:
	this.baseArea = AreaGeneratorVault.generate({x: 0, y: 0}, vaultType);
};

// SELECT_BASE_VAULT:
// ************************************************************************************************
LevelGeneratorInsertVaults.selectBaseVault = function () {
	let vaultTypeFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.VAULT_TYPE && !levelFeature.hasGenerated);
	
	// Force vaultType:
	if (vaultTypeFeature) {
		vaultTypeFeature.hasGenerated = true;
		return gs.getVaultType(vaultTypeFeature.vaultTypeName);
	}
	// Select random vaultType:
	else {
		let vaultTypeList = gs.getVaultTypeList(this.baseVaultSet);
		return util.randElem(vaultTypeList);
	}
};

// PLACE_INSERT_VAULTS:
// ************************************************************************************************
LevelGeneratorInsertVaults.placeInsertVaults = function () {
	// Insert Vaults:
	let insertVaultList = this.baseArea.vaultType.getTileTypeMap(this.baseArea.vaultType.vaultAngle).insertVaultList;
	
	// Randomize order:
	insertVaultList = util.shuffleArray(insertVaultList);
	
	// Place insert vaults:
	insertVaultList.forEach(function (data) {
		// Select vaultType:
		let vaultType = this.selectInsertVault();
		
		// Place Vault:
		AreaGeneratorVault.generate(data.box.startTileIndex, vaultType);
	}, this);
};

// SELECT_INSERT_VAULT:
// ************************************************************************************************
LevelGeneratorInsertVaults.selectInsertVault = function () {
	// We shuffle the levelFeatureList so order doesn't matter
	let levelFeatureList = util.shuffleArray(gs.levelFeatures);
	
	// Handling Level-Features:
	for (let i = 0; i < levelFeatureList.length; i += 1) {
        let levelFeature = levelFeatureList[i];
		
		if (!levelFeature.hasGenerated) {
			// BOSS_VAULT:
			if (levelFeature.featureType === FEATURE_TYPE.BOSS) {
				let vaultTypeList = gs.getVaultTypeList(this.bossVaultSet);
				
				vaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.BOSS);
				vaultTypeList = vaultTypeList.filter(vaultType => vaultType.bossName === levelFeature.bossName);

				if (vaultTypeList.length > 0) {
					levelFeature.hasGenerated = true;
					return util.randElem(vaultTypeList);
				}
			}
			
			// CONTENT_VAULT:
			if (levelFeature.featureType === FEATURE_TYPE.CONTENT) {
				let vaultTypeList = gs.getVaultTypeList(this.libraryVaultSet);
				
				vaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === levelFeature.contentType);
				
				if (vaultTypeList.length > 0) {
					levelFeature.hasGenerated = true;
					return util.randElem(vaultTypeList);
				}
			}
		}
	}
	
	// Return a challenge vault by default:
	let vaultTypeList = gs.getVaultTypeList(this.challengeVaultSet);
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.CHALLENGE);
	return util.randElem(vaultTypeList);
};


// LEVEL_GENERATOR_CLOSED_TOMBS:
// ************************************************************************************************
let LevelGeneratorClosedTombs = Object.create(LevelGeneratorInsertVaults);
LevelGeneratorClosedTombs.init = function () {
	this.name = 'LevelGeneratorClosedTombs';
	
	this.baseVaultSet = 'TheCryptTombBase';
	this.bossVaultSet = 'TheCryptTombInsertBoss';
	this.challengeVaultSet = 'TheCryptTombInsertChallenge';
	this.libraryVaultSet = 'TheCryptTombInsertLibrary';
	
};
LevelGeneratorClosedTombs.init();

// LEVEL_GENERATOR_FACTORY_FLOOR:
// ************************************************************************************************
let LevelGeneratorFactoryFloor = Object.create(LevelGeneratorInsertVaults);
LevelGeneratorFactoryFloor.init = function () {
	this.name = 'LevelGeneratorFactoryFloor';
	
	this.baseVaultSet = 'FactoryFloorBase';
	this.bossVaultSet = 'FactoryFloorBoss';
	this.challengeVaultSet = 'FactoryFloorChallenge';
	this.libraryVaultSet = 'FactoryFloorLibrary';
	
};
LevelGeneratorFactoryFloor.init();