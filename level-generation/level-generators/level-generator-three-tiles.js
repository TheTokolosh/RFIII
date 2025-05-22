/*global game, util, gs, console*/
/*global LevelGeneratorBase, LevelGeneratorUtils, DungeonGenerator*/
/*global AreaGeneratorVault*/ 
/*global VAULT_CONTENT, VAULT_PLACEMENT, FEATURE_TYPE*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

let LevelGeneratorThreeTiles = Object.create(LevelGeneratorBase);
LevelGeneratorThreeTiles.PLACE_SIDE_VAULTS = true;

// GENERATE:
// ************************************************************************************************
LevelGeneratorThreeTiles.generate = function () {
    this.initNumVaults();
    this.numAestheticVaults = util.randInt(1, 3);
    
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	this.roomAreaList = [];
	
	// List of Templates:
	let list = [
		// Corners:
		{tileIndex: {x: 0, y: 0}, placementType: VAULT_PLACEMENT.CORNER, angle: 0},
		{tileIndex: {x: 26, y: 0}, placementType: VAULT_PLACEMENT.CORNER, angle: 90},
		{tileIndex: {x: 26, y: 26}, placementType: VAULT_PLACEMENT.CORNER, angle: 180},
		{tileIndex: {x: 0, y: 26}, placementType: VAULT_PLACEMENT.CORNER, angle: 270},
		
		// Edges:
		{tileIndex: {x: 13, y: 0}, placementType: VAULT_PLACEMENT.THREE_WAY, angle: 0},
		{tileIndex: {x: 26, y: 13}, placementType: VAULT_PLACEMENT.THREE_WAY, angle: 90},
		{tileIndex: {x: 13, y: 26}, placementType: VAULT_PLACEMENT.THREE_WAY, angle: 180},
		{tileIndex: {x: 0, y: 13}, placementType: VAULT_PLACEMENT.THREE_WAY, angle: 270},
		
		// Middle:
		{tileIndex: {x: 13, y: 13}, placementType: VAULT_PLACEMENT.FOUR_WAY, angle: 0},
	];

	// Random Order:
	// This allows special features like bosses to generate in any position rather than always appearing in the top left
	list = util.shuffleArray(list);
	
	// Place Templates:
	list.forEach(function (e) {
		this.placeTemplateVault(e.tileIndex, e.placementType, e.angle);
	}, this);
	
    
    // Side Vaults:
	if (this.PLACE_SIDE_VAULTS) {
		this.placeSideVaults(1.0);
	}
    

	gs.areaList = this.roomAreaList;
};

// PLACE_TEMPLATE_VAULT:
// ************************************************************************************************
LevelGeneratorThreeTiles.placeTemplateVault = function (tileIndex, placementType, angle) {
	let vaultTypeList = gs.getVaultTypeList(this.vaultSet);
	
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === placementType);
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.allowRotate || vaultType.orientationAngle === angle);
    
	// CONTENT_VAULTS:
	let contentVaultFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.CONTENT && !levelFeature.hasGenerated);
	if (contentVaultFeature) {
        let contentVaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === contentVaultFeature.contentType);
        
        if (contentVaultTypeList.length > 0) {
            contentVaultFeature.hasGenerated = true;
            
            let vaultType = util.randElem(contentVaultTypeList);
			
			// Don't rotate:
			if (!vaultType.allowRotate) {
				angle = 0;
			}
			
            let area = AreaGeneratorVault.generate(tileIndex, vaultType, angle);
            this.roomAreaList.push(area);
            return;
        }
    }
	
    // BOSS_VAULTS:
    let bossLevelFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.BOSS && !levelFeature.hasGenerated);
    if (bossLevelFeature) {
        let bossVaultTypeList = vaultTypeList.filter(vaultType => vaultType.bossName === bossLevelFeature.bossName);
        
        if (bossVaultTypeList.length > 0) {
            bossLevelFeature.hasGenerated = true;
            
            let vaultType = util.randElem(bossVaultTypeList);
			
			// Don't rotate:
			if (!vaultType.allowRotate) {
				angle = 0;
			}
			
            let area = AreaGeneratorVault.generate(tileIndex, vaultType, angle);
            this.roomAreaList.push(area);
            return;
        }
    }
	
	// Challenge Vaults:
	let challengeVaults = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.CHALLENGE);
	if (this.shouldPlaceChallengeVault() && challengeVaults.length > 0 && util.frac() <= 0.50) {
		let vaultType = util.randElem(challengeVaults);
		
		// Don't rotate:
		if (!vaultType.allowRotate) {
			angle = 0;
		}
		
		let area = AreaGeneratorVault.generate(tileIndex, vaultType, angle);
		this.roomAreaList.push(area);
		return;
	}
	
    
    // AESTHETIC_VAULTS:
    vaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.AESTHETIC);
	if (vaultTypeList.length > 0) {
		let vaultType = util.randElem(vaultTypeList);
		
		// Don't rotate:
		if (!vaultType.allowRotate) {
			angle = 0;
		}
		
		let area = AreaGeneratorVault.generate(tileIndex, vaultType, angle);
		this.roomAreaList.push(area);
	}
	else {
		throw 'LevelGeneratorThreeTiles.placeTemplateVault: failed to place a vault. ' + placementType + ' ' + angle;
	}
	
};

// NARROW_HALLS:
// The Upper Dungeon
let LevelGeneratorNarrowHalls = Object.create(LevelGeneratorThreeTiles);
LevelGeneratorNarrowHalls.vaultSet = 'UpperDungeonNarrowHalls';

// ARCANE_PIT_PATHS:
// The Arcane Tower
let LevelGeneratorArcanePitPaths = Object.create(LevelGeneratorThreeTiles);
LevelGeneratorArcanePitPaths.vaultSet = 'ArcanePitPaths';
LevelGeneratorArcanePitPaths.PLACE_SIDE_VAULTS = false;

// PIT_PATHS:
// The Vault of Yendor
let LevelGeneratorPitPaths = Object.create(LevelGeneratorThreeTiles);
LevelGeneratorPitPaths.vaultSet = 'PitPathsTemplates';

// WATER_PATHS:
// The Sewers
let LevelGeneratorWaterPaths = Object.create(LevelGeneratorThreeTiles);
LevelGeneratorWaterPaths.vaultSet = 'TheSewers-WaterPaths';

// WATER_BRIDGES:
// The Sewers
let LevelGeneratorWaterBridges = Object.create(LevelGeneratorThreeTiles);
LevelGeneratorWaterBridges.vaultSet = 'TheSewers-WaterBridges';

// SWAMP_BRIDGES:
// The Swamp
let LevelGeneratorSwampBridges = Object.create(LevelGeneratorThreeTiles);
LevelGeneratorSwampBridges.vaultSet = 'TheSwamp-SwampBridges';

// SLIME_PIT:
// The Sewers
let LevelGeneratorSlimePit = Object.create(LevelGeneratorThreeTiles);
LevelGeneratorSlimePit.vaultSet = 'SlimePitTemplates';

// LAVA_ISLANDS:
// The Core
let LevelGeneratorLavaIslands = Object.create(LevelGeneratorThreeTiles);
LevelGeneratorLavaIslands.vaultSet = 'TheCore-LavaIslands';