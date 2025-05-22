/*global gs, util*/
/*global LevelGeneratorBase, LevelGeneratorUtils, AreaGeneratorVault, MonsterSpawner*/
/*global FEATURE_TYPE, VAULT_PLACEMENT, VAULT_CONTENT, EXCEPTION_TYPE*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

// LEVEL_GENERATOR_STATIC:
// ************************************************************************************************
let LevelGeneratorStatic = Object.create(LevelGeneratorBase);
LevelGeneratorStatic.init = function () {
	this.name = 'LevelGeneratorStatic';
};
LevelGeneratorStatic.init();


// GENERATE:
// ************************************************************************************************
LevelGeneratorStatic.generate = function () {
	this.roomAreaList = [];
	
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	// Place Vault:
	let vaultType = this.selectStaticLevelVault();
	let area = AreaGeneratorVault.generate({x: 0, y: 0}, vaultType);
	this.roomAreaList.push(area);
	
	// Level Feature Side Vaults:
	this.placeLevelFeatureSideVaults(1.0);
	
	// Level Flags:
	if (vaultType.noReeds) {
		gs.noReeds = true;
	}
	
	if (vaultType.noMobSpawn || gs.zoneType().noMobSpawn) {
		gs.noMobSpawn = true;
	}
		
	gs.areaList = this.roomAreaList;
};

LevelGeneratorStatic.selectStaticLevelVault = function () {
	// VAULT_TYPE:
	let vaultLevelFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.VAULT_TYPE && !levelFeature.hasGenerated);
	if (vaultLevelFeature) {
		
		
		let vaultType = gs.vaultTypeList.find(vaultType => vaultType.placementType === VAULT_PLACEMENT.LEVEL && (vaultType.name === vaultLevelFeature.vaultTypeName || vaultType.id === vaultLevelFeature.vaultTypeName));
		if (vaultType) {
			vaultLevelFeature.hasGenerated = true;
			return gs.getVaultType(vaultLevelFeature.vaultTypeName);
		}
	}
	
	// BOSS:
	let bossLevelFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.BOSS && !levelFeature.hasGenerated);
    if (bossLevelFeature) {
		let vaultTypeList = gs.vaultTypeList;
        vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.LEVEL);
        vaultTypeList = vaultTypeList.filter(vaultType => vaultType.bossName === bossLevelFeature.bossName);
		
		if (vaultTypeList.length > 0) {
            bossLevelFeature.hasGenerated = true;
            return util.randElem(vaultTypeList);
        }
	}
	
	// VAULT_SET:
    let vaultSetFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.VAULT_SET && !levelFeature.hasGenerated);
    if (vaultSetFeature) {
        let vaultTypeList = gs.vaultTypeList;
        vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.LEVEL);
        vaultTypeList = vaultTypeList.filter(vaultType => vaultType.vaultSet === vaultSetFeature.vaultSet);
        
        if (vaultTypeList.length > 0) {
            vaultSetFeature.hasGenerated = true;
            return util.randElem(vaultTypeList);
        }
    }
	
	// DEFAULT_ZONE_VAULT_SET:
	let vaultTypeList = gs.getVaultTypeList();
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.LEVEL);
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.AESTHETIC);
	
	// Filtering for exp:
	if (gs.zoneName !== 'TheVaultOfYendor') {
		vaultTypeList = vaultTypeList.filter(vaultType => vaultType.totalNPCExp <= MonsterSpawner.totalExp() * 1.5);
	}
	
	
	if (vaultTypeList.length > 0) {
         return util.randElem(vaultTypeList);
	}
	
	// THROW_EXCEPTION:
	// No valid static levels
	throw {
		type: EXCEPTION_TYPE.LEVEL_GENERATION, 
		text: 'No valid static levels.',
	};
};