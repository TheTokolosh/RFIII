/*global game, util, gs, console*/
/*global LevelGeneratorBase, LevelGeneratorUtils, ConnectionMap, DungeonGenerator*/
/*global AreaGeneratorVault, AreaGeneratorCave*/ 
/*global VAULT_CONTENT, VAULT_PLACEMENT, FEATURE_TYPE*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

let LevelGeneratorCave = Object.create(LevelGeneratorBase);

// INIT:
// ************************************************************************************************
LevelGeneratorCave.init = function () {
	this.name = 'LevelGeneratorCave';
	this.nodeSize = 10;
};

LevelGeneratorCave.init();

// GENERATE:
// ************************************************************************************************
LevelGeneratorCave.generate = function () {
	this.initNumVaults();
	this.numAestheticVaults = util.randInt(0, 1);
	
	this.roomAreaList = [];
	
	// Tile Mask:
	// Used to force AreaGeneratorCave to place floors or walls to match vaults 
	this.tileMask = util.create2DArray(NUM_TILES_X, NUM_TILES_Y, (x, y) => 0);
	
	// Get Big Mask:
	this.bigMask = LevelGeneratorUtils.getBigCaveMask();

	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.CaveWall);
	
	// Pre-Cave Vaults:
	this.placePreCaveVaults();
	
	// Cave fill:
	this.placeMainCave();
	
	// Major Vault:
	this.placeMajorCaveVault(1.25);
	
	// Place Vaults:
	this.placeLevelFeatureSideVaults(0.25);
	this.placeChallengeSideVaults(0.5);
	this.placeMajorRewardSideVaults(1.0);
	this.placeOpenVaults(1.0);
	this.placeFloatingSolidVaults(1.0);
	
	// Final Chance to catch required vaults:
	this.placeLevelFeatureSideVaults(1.0);
	
	// Trimming:
    this.trimCaveWalls();
	LevelGeneratorUtils.trimWalls();
	
	
	gs.areaList = this.roomAreaList;
};

// PLACE_PRE_CAVE_VAULTS:
// ************************************************************************************************
LevelGeneratorCave.placePreCaveVaults = function () {
	this.setBigMaskSolid(true);
	
	// Chance to handle Level-Feature-Vault:
	gs.levelFeatures.forEach(function (levelFeature) {
		if (!levelFeature.hasGenerated) {
			// BOSS:
			if (levelFeature.featureType === FEATURE_TYPE.BOSS && (util.frac() < 0.25 || this.mustPlaceBossPreCaveVault(levelFeature.bossName))) {
				
				let area = this.tryToPlacePreCaveVault(vaultType => vaultType.bossName === levelFeature.bossName);

				if (area) {
					levelFeature.hasGenerated = true;
				}
			}
			
			// VAULT_TYPE:
			if (levelFeature.featureType === FEATURE_TYPE.VAULT_TYPE) {
				let area = this.tryToPlacePreCaveVault(vaultType => vaultType.id === levelFeature.vaultTypeName);

				if (area) {
					levelFeature.hasGenerated = true;
				}
			}
		}
	}, this);
	
	// Placing at most 1 Challenge Vault:
	if (this.shouldPlaceChallengeVault() && util.frac() < 0.25) {
		let area = this.tryToPlacePreCaveVault(vaultType => vaultType.contentType === VAULT_CONTENT.CHALLENGE);
	}
	
	// Placing at most 1 Aesthetic Vault:
	if (this.numAestheticVaults > 0 && util.frac() < 0.25) {
		let area = this.tryToPlacePreCaveVault(vaultType => vaultType.contentType === VAULT_CONTENT.AESTHETIC);
		
		if (area) {
			this.numAestheticVaults -= 1;
		}
	}
	
	this.setBigMaskSolid(false);
};

// TRY_TO_PLACE_PRE_CAVE_VAULT:
// ************************************************************************************************
LevelGeneratorCave.tryToPlacePreCaveVault = function (vaultTypeFilter) {
	let boundsBox = util.createBox(1, 1, NUM_TILES_X - 1, NUM_TILES_Y - 1);
	
	// Valid Vault Types:
	let vaultTypeList = gs.getVaultTypeList();
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.PRE_CAVE);
	vaultTypeList = vaultTypeList.filter(vaultType => vaultTypeFilter(vaultType));
	vaultTypeList = util.shuffleArray(vaultTypeList);
	
	while (vaultTypeList.length > 0) {
		// Random Vault Type:
		let vaultType = vaultTypeList.pop();

		// Random Tile Index:
		let tileIndex = LevelGeneratorUtils.getTileIndexForClosedBox(vaultType.width, vaultType.height, boundsBox);

		if (tileIndex) {
			// Place the vault:
			let area = AreaGeneratorVault.generate(tileIndex, vaultType);

			// Flag TileMask:
			this.flagTileMask(area);
			
			return area;
		}
	}
	
	return null;
};

// MUST_PLACE_BOSS_PRE_CAVE_VAULT:
// ************************************************************************************************
LevelGeneratorCave.mustPlaceBossPreCaveVault = function (bossName) {
	let vaultTypeList = gs.vaultTypeList.filter(vaultType => vaultType.bossName === bossName);
	
	// All vaults are precave or level:
	if (vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.PRE_CAVE || vaultType.placementType === VAULT_PLACEMENT.LEVEL).length === vaultTypeList.length) {
		return true;
	}
	else {
		return false;
	}
};

// PLACE_MAIN_CAVE:
// ************************************************************************************************
LevelGeneratorCave.placeMainCave = function () {
	let boundsBox = util.createBox(0, 0, NUM_TILES_X, NUM_TILES_Y);
	this.mainCaveArea = AreaGeneratorCave.generate(boundsBox, this.bigMask, this.tileMask);
	this.roomAreaList.push(this.mainCaveArea);
	
	LevelGeneratorUtils.trimWalls();
};

// PLACE_MAJOR_CAVE_VAULT:
// ************************************************************************************************
LevelGeneratorCave.placeMajorCaveVault = function (genPercent) {
	// 25% chance to place a Major-Cave-Vault:
	if (util.frac() >= genPercent) {
		return;
	}
	
	let vaultType = this.selectMajorCaveVaultType();
	
	if (vaultType) {
		let angle = 0;
		if (vaultType.allowRotate) {
			angle = util.randElem([0, 90, 180, 270]);
		}
		
		let area = AreaGeneratorVault.generate({x: 0, y: 0}, vaultType, angle);
		
		// add area to mainCave area:
        this.mainCaveArea.addArea(area);
	}
};

// SELECT_MAJOR_CAVE_VAULT_TYPE:
// ************************************************************************************************
LevelGeneratorCave.selectMajorCaveVaultType = function () {
	// VAULT_TYPE:
	let vaultLevelFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.VAULT_TYPE && !levelFeature.hasGenerated);
	if (vaultLevelFeature) {
		let vaultType = gs.vaultTypeList.find(vaultType => vaultType.placementType === VAULT_PLACEMENT.MAJOR_CAVE && (vaultType.name === vaultLevelFeature.vaultTypeName || vaultType.id === vaultLevelFeature.vaultTypeName));
		if (vaultType) {
			vaultLevelFeature.hasGenerated = true;
			return gs.getVaultType(vaultLevelFeature.vaultTypeName);
		}
	}
	
	// BOSS:
    let bossLevelFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.BOSS && !levelFeature.hasGenerated);
    if (bossLevelFeature && util.frac() <= 0.5) {
        let vaultTypeList = gs.getVaultTypeList();
        vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.MAJOR_CAVE);
        vaultTypeList = vaultTypeList.filter(vaultType => vaultType.bossName === bossLevelFeature.bossName);
        
        if (vaultTypeList.length > 0) {
            bossLevelFeature.hasGenerated = true;
            return util.randElem(vaultTypeList);
        }
    }
	
	// AESTHETIC:
	let vaultTypeList = gs.getVaultTypeList();
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.MAJOR_CAVE);
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.AESTHETIC);
	
	if (vaultTypeList.length > 0) {
		return util.randElem(vaultTypeList);
	}
	
	return null;
};



// PLACE_OPEN_VAULTS:
// ************************************************************************************************
LevelGeneratorCave.placeOpenVaults = function (genPercent) {
	// Chance to handle Level-Feature-Vault:
	gs.levelFeatures.forEach(function (levelFeature) {
		if (!levelFeature.hasGenerated) {
			let area = null;
			
			// VAULT_TYPE:
            if (levelFeature.featureType === FEATURE_TYPE.VAULT_TYPE) {
                let vaultType = gs.getVaultType(levelFeature.vaultTypeName);
				area = this.tryToPlaceVault(vaultType);
            }
			
			// VAULT_SET:
			if (levelFeature.featureType === FEATURE_TYPE.VAULT_SET) {
				let vaultType = gs.vaultTypeList.find(vaultType => vaultType.placementType === VAULT_PLACEMENT.OPEN && vaultType.vaultSet === levelFeature.vaultSet);
                
				if (vaultType) {
                    area = this.tryToPlaceVault(vaultType);
                }
			}
			
			// BOSS:
			if (levelFeature.featureType === FEATURE_TYPE.BOSS  && util.frac() < genPercent) {
				let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.OPEN && vaultType.bossName === levelFeature.bossName;
				area = this.tryToPlaceVault(vaultTypeFilter);	
			}
			
			if (area) {
				levelFeature.hasGenerated = true;
				this.roomAreaList.push(area);
			}
			
		}
	}, this);
	
	// Challenge Vaults:
	for (let i = 0; i < 3; i += 1) {
		if (this.shouldPlaceChallengeVault() && util.frac() <= genPercent) {
			let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.OPEN && vaultType.contentType === VAULT_CONTENT.CHALLENGE;
	
			let area = this.tryToPlaceVault(vaultTypeFilter);
		}
	}
	
	
	
	
	// Placing at most 1 Aesthetic Vault:
	if (this.numAestheticVaults > 0 && util.frac() < 0.5) {
		let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.OPEN && vaultType.contentType === VAULT_CONTENT.AESTHETIC;
	
		let area = this.tryToPlaceVault(vaultTypeFilter);
		
		if (area) {
			this.numAestheticVaults -= 1;
		}
	}
};

// SET_BIG_MASK_SOLID:
// ************************************************************************************************
LevelGeneratorCave.setBigMaskSolid = function (isSolid) {
	for (let x = 0; x < NUM_TILES_X; x += 1) {
		for (let y = 0; y < NUM_TILES_Y; y += 1) {
			if (this.bigMask[Math.floor(x / this.nodeSize)][Math.floor(y / this.nodeSize)]) {
				gs.getTile(x, y).isSolidWall = isSolid;
			}
		}
	}
};

// FLAG_TILE_MASK:
// ************************************************************************************************
LevelGeneratorCave.flagTileMask = function (preCaveArea) {
	// Flag TileMask:
	gs.getIndexListInBox(preCaveArea).forEach(function (tileIndex) {
		// Super Floor:
		if (gs.getTile(tileIndex).type.passable) {
			this.tileMask[tileIndex.x][tileIndex.y] = 1;
		}
		// Super Wall:
		else {
			this.tileMask[tileIndex.x][tileIndex.y] = 2;
		}
	}, this);
};

// GET_VAULT_TYPES:
// ************************************************************************************************
LevelGeneratorCave.getVaultTypes = function (vaultSet) {
	let challengeVaults = [];
	let aesthetic = [];
	let vaultTypeList = null;
	
	// Pre Cave:
	vaultTypeList = gs.vaultTypeList;
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.vaultSet === vaultSet);
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.PRE_CAVE);
	challengeVaults.push(vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.CHALLENGE));
	aesthetic.push(vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.AESTHETIC));
	
	// Major-Cave:
	vaultTypeList = gs.vaultTypeList;
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.vaultSet === vaultSet);
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.MAJOR_CAVE);
	challengeVaults.push(vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.CHALLENGE));
	aesthetic.push(vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.AESTHETIC));
	
	// Side:
	vaultTypeList = gs.vaultTypeList;
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.vaultSet === vaultSet);
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.SIDE);
	challengeVaults.push(vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.CHALLENGE));
	aesthetic.push(vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.AESTHETIC));
	
	// Open:
	vaultTypeList = gs.vaultTypeList;
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.vaultSet === vaultSet);
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.OPEN);
	challengeVaults.push(vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.CHALLENGE));
	aesthetic.push(vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.AESTHETIC));

	// Solid:
	vaultTypeList = gs.vaultTypeList;
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.vaultSet === vaultSet);
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID);
	challengeVaults.push(vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.CHALLENGE));
	aesthetic.push(vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.AESTHETIC));

	let vaultTypes = {
		Challenge: challengeVaults.flat(),
		Aesthetic: aesthetic.flat(),
	};
	
	return vaultTypes;
};

// TRIM_CAVE_WALLS:
// ************************************************************************************************
LevelGeneratorCave.trimCaveWalls = function () {
	let indexList = gs.getAllIndex();
	
	let isFloor = function (x, y) {
		return gs.getTile(x, y).type.name === 'CaveFloor'
			&& !gs.getTile(x, y).isDropWallRoom;
	};
	
	let isWall = function (tileIndex) {
		return gs.getTile(tileIndex).type.name === 'CaveWall'
			&& !gs.getTile(tileIndex).isSolidWall
			&& !gs.getTile(tileIndex).isTriggeredDropWall;
	};
	
	// Finding all the single walls:
	indexList = indexList.filter(function (tileIndex) {
		let x = tileIndex.x,
			y = tileIndex.y;
		
		return x >= 1 && x <= NUM_TILES_X - 2 && y >= 1 && y <= NUM_TILES_Y - 2
			&& isWall(tileIndex)
			&& ((isFloor(x, y - 1) && isFloor(x, y + 1) || (isFloor(x - 1, y) && isFloor(x + 1, y))));
	}, this);
	
	// Replacing w/ Cave Floor:
	indexList.forEach(function (tileIndex) {
		gs.setTileType(tileIndex, gs.tileTypes.CaveFloor);
	}, this);
};