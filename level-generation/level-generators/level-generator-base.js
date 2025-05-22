/*global gs, util*/
/*global LevelGeneratorUtils, AreaGeneratorVault, MonsterSpawner*/
/*global FEATURE_TYPE, VAULT_PLACEMENT, VAULT_CONTENT*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

var LevelGeneratorBase = {
	noSpawn: false,
	PLACE_VAULT_MAX_ATTEMPTS: 20,
};

// INIT_NUM_VAULTS:
// ************************************************************************************************
LevelGeneratorBase.initNumVaults = function () {
	let zoneTier = gs.zoneType().zoneTier;
	
	this.numMajorRewardVaults = 0;
	if (util.frac() < 0.25) {
		this.numMajorRewardVaults = 1;
	}
	
	// Never a reward on UD1:
	if (gs.zoneName === 'TheUpperDungeon' && gs.zoneLevel === 1) {
		this.numMajorRewardVaults = 0;
	}
};

// SHOULD_PLACE_CHALLENGE_VAULT:
// ************************************************************************************************
LevelGeneratorBase.shouldPlaceChallengeVault = function () {
	return MonsterSpawner.currentExp() < MonsterSpawner.totalExp() * 0.5;
};

// PLACE_FLOATING_SOLID_VAULTS:
// ************************************************************************************************
LevelGeneratorBase.placeFloatingSolidVaults = function (genPercent) {
	// Chance to handle Level-Feature-Vault:
	gs.levelFeatures.forEach(function (levelFeature) {
		// Note how Solid-Vaults are the last type to generate so must try to catch all remaining Level-Feature vaults:
		if (!levelFeature.hasGenerated && util.frac() <= genPercent) {
			let area = null;
			
			
            // VAULT_TYPE:
            if (levelFeature.featureType === FEATURE_TYPE.VAULT_TYPE) {
                let vaultType = gs.vaultTypeList.find(vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.name === levelFeature.vaultTypeName);
                
                if (vaultType) {
                    area = this.tryToPlaceVault(vaultType);
                }
            }
			
			// BOSS_VAULT:
			if (levelFeature.featureType === FEATURE_TYPE.BOSS) {
				let vaultTypeList = gs.getVaultTypeList().filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.bossName === levelFeature.bossName);

				if (vaultTypeList.length > 0) {
					area = this.tryToPlaceVault(util.randElem(vaultTypeList));
				}
			}
			
			// VAULT_SET:
			if (levelFeature.featureType === FEATURE_TYPE.VAULT_SET) {
				let vaultTypeList = gs.vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.vaultSet === levelFeature.vaultSet);
                
				if (vaultTypeList.length > 0) {
                    area = this.tryToPlaceVault(util.randElem(vaultTypeList));
                }
			}
			
			// Successfuly Generated:
			if (area) {
				levelFeature.hasGenerated = true;
				this.roomAreaList.push(area);
                this.connectFloatingSolidVault(area);
			}
			
		}
	}, this);
	
	// Challenge-Vaults:
	for (let i = 0; i < 3; i += 1) {
		if (util.frac() <= genPercent && this.shouldPlaceChallengeVault()) {
			let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.contentType === VAULT_CONTENT.CHALLENGE;

			let area = this.tryToPlaceVault(vaultTypeFilter);

			if (area) {
				this.roomAreaList.push(area);
                this.connectFloatingSolidVault(area);
			}
		}
	}
	
	// Aesthetic-Vaults:
	let numVaultsPlaced = 0;
	for (let i = 0; i < this.numAestheticVaults; i += 1) {
		if (util.frac() <= genPercent) {
			let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.contentType === VAULT_CONTENT.AESTHETIC;

			let area = this.tryToPlaceVault(vaultTypeFilter);

			if (area) {
				numVaultsPlaced += 1;
				this.roomAreaList.push(area);
                this.connectFloatingSolidVault(area);
			}
		}
	}
	this.numAestheticVaults -= numVaultsPlaced;
};

// CONNECT_FLOATING_SOLID_VAULT:
// ************************************************************************************************
LevelGeneratorBase.connectFloatingSolidVault = function (area) {
    let floodList = [];
    
    let pred = function (tileIndex) {
        return !gs.getTile(tileIndex).isSolidWall
            && gs.getArea(tileIndex) !== area;
    };
    
    area.hallHookTileIndexList.forEach(function (hallTileIndex) {
		if (hallTileIndex.x > 0 && hallTileIndex.y > 0 && hallTileIndex.x < NUM_TILES_X - 1 && hallTileIndex.y < NUM_TILES_Y - 1) {
			let e = {startTileIndex: hallTileIndex};
			e.flood = gs.getIndexListInFlood(hallTileIndex, pred, 10);
			floodList.push(e);
		}
    }, this);
    
    floodList.forEach(function (e) {
        e.flood = e.flood.filter(tileIndex => gs.isPassable(tileIndex));
        
        if (e.flood.length > 1) {
            let tileIndex = e.flood[0];
			
			// The current walkable path:
			let path = gs.findPath(e.startTileIndex, tileIndex, {noDiagonal: true});
			
			// Only create a new hall if the current walkable path is 'too long':
			if (!path || path.length > util.distance(e.startTileIndex, tileIndex) * 4) {
				LevelGeneratorUtils.placeHall(e.startTileIndex, tileIndex);
			}
        }
        
    }, this);
};

// PLACE_SIDE_VAULTS:
// genPercent: the chance to spawn each vault in this pass
// genPercent = 1.0 means the generator MUST try to generate each remaining vault
// ************************************************************************************************
LevelGeneratorBase.placeSideVaults = function (genPercent) {
	this.placeLevelFeatureSideVaults(genPercent);
    this.placeMajorRewardSideVaults(genPercent);
    this.placeChallengeSideVaults(genPercent);
    this.placeAestheticSideVaults(genPercent);
};

// PLACE_LEVEL_FEATURE_SIDE_VAULTS:
// ************************************************************************************************
LevelGeneratorBase.placeLevelFeatureSideVaults = function (genPercent) {
	let boundsBox = util.createBox(1, 1, NUM_TILES_X - 1, NUM_TILES_Y - 1);
	
	// Chance to handle Level-Feature-Vault:
	gs.levelFeatures.forEach(function (levelFeature) {
		if (!levelFeature.hasGenerated) {
			let area = null;
			
			// MERCHANT:
			if (levelFeature.featureType === FEATURE_TYPE.FRIENDLY_NPC && levelFeature.npcTypeName === 'Merchant') {
				let vaultTypeList = gs.vaultTypeList;
                vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.SIDE && vaultType.contentType === VAULT_CONTENT.MERCHANT);
                
                if (vaultTypeList.length > 0) {
                    area = this.tryToPlaceVault(util.randElem(vaultTypeList), boundsBox);
                }
			}
			
            // VAULT_TYPE:
            if (levelFeature.featureType === FEATURE_TYPE.VAULT_TYPE) {
                let vaultType = gs.vaultTypeList.find(vaultType => vaultType.placementType === VAULT_PLACEMENT.SIDE && (vaultType.name === levelFeature.vaultTypeName || vaultType.id === levelFeature.vaultTypeName));
                
                if (vaultType) {
                    area = this.tryToPlaceVault(vaultType, boundsBox);
                }
            }
			
			// VAULT_SET:
			if (levelFeature.featureType === FEATURE_TYPE.VAULT_SET) {
				let vaultType = gs.vaultTypeList.find(vaultType => vaultType.placementType === VAULT_PLACEMENT.SIDE && vaultType.vaultSet === levelFeature.vaultSet);
                
				if (vaultType) {
                    area = this.tryToPlaceVault(vaultType, boundsBox);
                }
			}
			
			// CONTENT_TYPE:
			if (levelFeature.featureType === FEATURE_TYPE.CONTENT) {
				let pred = function (vaultType) {
					return vaultType.placementType === VAULT_PLACEMENT.SIDE
						&& vaultType.contentType === levelFeature.contentType;
				};
				
				area = this.tryToPlaceVault(pred, boundsBox);
			}
            
			// MAJOR_REWARD:
			if (levelFeature.featureType === FEATURE_TYPE.MAJOR_REWARD && util.frac() <= genPercent) {
                let majorRewardDesc = this.getMajorRewardDesc(levelFeature.rewardType);
				
                area = this.tryToPlaceVault(majorRewardDesc.vaultType, boundsBox);
                
                if (area) {
					AreaGeneratorVault.dressAreaMajorReward(area, majorRewardDesc.rewardType, majorRewardDesc.doorType);
                }
            }
            
            // BOSS:
            if (levelFeature.featureType === FEATURE_TYPE.BOSS && util.frac() <= genPercent) {
                let vaultTypeList = gs.vaultTypeList;
                vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.SIDE && vaultType.bossName === levelFeature.bossName);
                
                if (vaultTypeList.length > 0) {
                    area = this.tryToPlaceVault(util.randElem(vaultTypeList), boundsBox);
                }
            }
			
			// ZONE_LINE:
            if (levelFeature.featureType === FEATURE_TYPE.ZONE_LINE && util.frac() <= genPercent) {
                let vaultTypeList = gs.getVaultTypeList();
                vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.SIDE);
				vaultTypeList = vaultTypeList.filter(vaultType => vaultType.toZoneName === levelFeature.toZoneName && vaultType.toZoneLevel === levelFeature.toZoneLevel);
                
                if (vaultTypeList.length > 0) {
                    area = this.tryToPlaceVault(util.randElem(vaultTypeList), boundsBox);
                }
            }
			
			// Successfuly Generated:
			if (area) {
				levelFeature.hasGenerated = true;
				this.roomAreaList.push(area);
			} 
		}
	}, this);
};

// PLACE_MAJOR_REWARD_SIDE_VAULTS:
// ************************************************************************************************
LevelGeneratorBase.placeMajorRewardSideVaults = function (genPercent) {
	let boundsBox = util.createBox(1, 1, NUM_TILES_X - 1, NUM_TILES_Y - 1);
	let numVaultsPlaced = 0;
	
	for (let i = 0; i < this.numMajorRewardVaults; i += 1) {
		if (util.frac() <= genPercent) {
			let majorRewardDesc = this.getMajorRewardDesc();
		
			let area = this.tryToPlaceVault(majorRewardDesc.vaultType, boundsBox);
		
			if (area) {
				AreaGeneratorVault.dressAreaMajorReward(area, majorRewardDesc.rewardType, majorRewardDesc.doorType);
				numVaultsPlaced += 1;
			}
		}
	}
	
	this.numMajorRewardVaults -= numVaultsPlaced;
};

// PLACE_CHALLENGE_SIDE_VAULTS:
// ************************************************************************************************
LevelGeneratorBase.placeChallengeSideVaults = function (genPercent) {
	let boundsBox = util.createBox(1, 1, NUM_TILES_X - 1, NUM_TILES_Y - 1);

	// Challenge Vaults:
	for (let i = 0; i < 3; i += 1) {
		if (util.frac() <= genPercent && this.shouldPlaceChallengeVault()) {
			let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SIDE && vaultType.contentType === VAULT_CONTENT.CHALLENGE;

			let area = this.tryToPlaceVault(vaultTypeFilter, boundsBox);

			if (area) {
				this.roomAreaList.push(area);
			}
		}
	}
};

// PLACE_AESTHETIC_SIDE_VAULTS:
// ************************************************************************************************
LevelGeneratorBase.placeAestheticSideVaults = function (genPercent) {
	let boundsBox = util.createBox(1, 1, NUM_TILES_X - 1, NUM_TILES_Y - 1);
	let numVaultsPlaced = 0;
		
	// Aesthetic Vaults:
	for (let i = 0; i < this.numAestheticVaults; i += 1) {
		if (util.frac() <= genPercent) {
			let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SIDE && vaultType.contentType === VAULT_CONTENT.AESTHETIC;

			let area = this.tryToPlaceVault(vaultTypeFilter, boundsBox);

			if (area) {
				this.roomAreaList.push(area);
				numVaultsPlaced += 1;
			}
		}
	}
	
	this.numAestheticVaults -= numVaultsPlaced;
};

LevelGeneratorBase.rewardTable = [
	{percent: 30, 	name: {type: 'FountainOfGainAttribute', minDL: 1}},
	{percent: 20, 	name: {type: 'CrystalChest', minDL: 1}},
	{percent: 20, 	name: {type: 'EnchantmentTable', minDL: 1}},
	{percent: 10, 	name: {type: 'FountainOfKnowledge', minL: 4}},
	{percent: 5, 	name: {type: 'TransferanceTable', minDL: 8}},
	{percent: 5, 	name: {type: 'WellOfWishing', minDL: 1}},
	
	// ITEMS:
	{percent: 10, name: [
		{percent: 1, name: {type: 'Gold', minDL: 1}},
		{percent: 1, name: {type: 'Potions', minDL: 1}},
		{percent: 1, name: {type: 'Scrolls', minDL: 1}},
		{percent: 1, name: {type: 'Food', minDL: 1}},
	]},
	
];

// GET_MAJOR_REWARD_DESC:
// ************************************************************************************************
LevelGeneratorBase.getMajorRewardDesc = function (rewardType = null, doorType = null) {
	let desc = {
		rewardType: null, 	// string = {'Gold', 'CrystalChest', 'FountainOfKnowledge', etc.}
		doorType: null,		// string = {'Door', 'KeyDoor', etc.}
		vaultType: null,	// vaultType
	};
	
	// Forcing rewardType:
	if (rewardType) {
		desc.rewardType = rewardType;
	}
	// Random rewardType:
	else {
		do {
			desc.rewardType = util.chooseRandom(this.rewardTable);
		} while (desc.rewardType.minDL > gs.dangerLevel());
		
		desc.rewardType = desc.rewardType.type;
	}
	
	// Forcing doorType:
	if (doorType) {
		desc.doorType = doorType;
	}
	// Random doorType:
	else {
		desc.doorType = util.chooseRandom([
			{percent: 1, name: 'Door'},
			{percent: 1, name: 'KeyDoor'},
			{percent: 1, name: 'TimedDoor'},
			{percent: 1, name: 'SwitchDoor'},
		]);
	}
	
	
	// Room Vault Type:
	if (util.inArray(desc.rewardType, ['Gold', 'Potions', 'Scrolls', 'Food'])) {
		desc.vaultType = gs.getVaultType('_General/MajorReward/Side/ItemRoom');
	}
	// Fountain Vault Type:
	else if (util.inArray(desc.rewardType, ['WellOfWishing', 'FountainOfKnowledge', 'FountainOfGainAttribute'])) {
		desc.vaultType = gs.getVaultType('_General/MajorReward/Side/FountainRoom');
	}
	// Table Vault Type:
	else if (util.inArray(desc.rewardType, ['EnchantmentTable', 'TransferanceTable'])) {
		desc.vaultType = gs.getVaultType('_General/MajorReward/Side/TableRoom');
	}
	// Crystal Chest:
	else if (desc.rewardType === 'CrystalChest') {
		desc.vaultType = gs.getVaultType('_General/MajorReward/Side/CrystalChestRoom');
	}
	// Library:
	else if (desc.rewardType === 'Library') {
		desc.vaultType = function (vaultType) {
			return vaultType.contentType === VAULT_CONTENT.LIBRARY;
		};			
	}
	else {
		throw 'ERROR [getMajorRewardDesc] - no valid vaultType for rewardType: ' + desc.rewardType;
	}
	
	return desc;
};

// TRY_TO_PLACE_VAULT:
// Pass either a vaultType or vaultTypeFilter
// boundsBox: the box in which the vault should be generated
// [maxVaultSize]: vaultSize must be smaller than max and larger than max / 2
// Returns the area or null if it failed.
// ************************************************************************************************
LevelGeneratorBase.tryToPlaceVault = function (vaultTypeFilter, boundsBox = null, maxVaultSize = null) {
	boundsBox = boundsBox || util.createBox(0, 0, NUM_TILES_X, NUM_TILES_Y);
	
	let vaultTypeList;
	
	// A filter function:
	if (typeof vaultTypeFilter === 'function') {
		// All vaultTypes that are valid for this zoneType:
		vaultTypeList = gs.getVaultTypeList();

		// Custom Filter:
		if (vaultTypeFilter) {
			vaultTypeList = vaultTypeList.filter(vaultTypeFilter);

			// No valid vaultTypes:
			if (vaultTypeList.length === 0) {
				//throw 'ERROR [this.tryToPlaceVault] - no valid vaultTypes for the vaultTypeFilter';
				return null;
			}
		}

		// Size Filter:
		if (maxVaultSize) {
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.isValidForMaxSize(maxVaultSize));
		}

		if (vaultTypeList.length === 0) {
			return null;
		}
	}
	// Passing a single vaultType:
	else {
		vaultTypeList = [vaultTypeFilter];
	}
	
	// Cycles generator can exclude previously placed vaults:
	if (this.previouslyPlacedVaultTypes) {
		vaultTypeList = vaultTypeList.filter(vaultType => !util.inArray(vaultType, this.previouslyPlacedVaultTypes));
	}
	
	// Randomize order:
	vaultTypeList = util.shuffleArray(vaultTypeList);
	
	for (let count = 0; count < this.PLACE_VAULT_MAX_ATTEMPTS; count += 1) {
		if (vaultTypeList.length === 0) {
			return null;
		}
		
		// Select a random vaultType:
		let vaultType = vaultTypeList.pop();
		
		// All rotations:
		let vaultDescList = [{vaultType: vaultType, angle: 0}];
		if (vaultType.allowRotate) {
			vaultDescList.push({vaultType: vaultType, angle: 90});
			vaultDescList.push({vaultType: vaultType, angle: 180});
			vaultDescList.push({vaultType: vaultType, angle: 270});
		}
		vaultDescList = util.shuffleArray(vaultDescList);
		
		while (vaultDescList.length > 0) {
			// Select a random vaultType:
			let vaultDesc = vaultDescList.pop();

			// Try find valid tileIndex for vault:
			let tileIndex = this.getTileIndexForVault(vaultDesc.vaultType, vaultDesc.angle, boundsBox);

			if (tileIndex) {
				let roomArea = AreaGeneratorVault.generate(tileIndex, vaultDesc.vaultType, vaultDesc.angle);

				return roomArea;
			}
		}
		
		// Used for cycles generator to exclude vaults:
		if (this.previouslyPlacedVaultTypes) {
			this.previouslyPlacedVaultTypes.push(vaultType);
		}
	}
	
	// Failed after many tries:
	return null;
};


// GET_TILE_INDEX_FOR_VAULT:
// Returns the top-left tileIndex at which the vaultType can be placed
// ************************************************************************************************
LevelGeneratorBase.getTileIndexForVault = function (vaultType, angle, boundsBox) {
	// boundsBox defaults to entire level:
	boundsBox = boundsBox || util.createBox(0, 0, NUM_TILES_X, NUM_TILES_Y);
	
	// Create the vaultMask:
	let vaultMask = vaultType.getMask(angle);
	
	// Will store a list of all valid index:
	let validIndexList = [];
	
	// The mask is 'slid' over the existing tilemap in order to discover a spot to place it.
	for (let x = boundsBox.startX; x < boundsBox.endX - vaultMask.width + 1; x += 1) {
		for (let y = boundsBox.startY; y < boundsBox.endY - vaultMask.height + 1; y += 1) {
			if (this.isValidMaskIndex({x: x, y: y}, vaultType, vaultMask)) {
				validIndexList.push({x: x, y: y});
			}
		}
	}
	
	return validIndexList.length > 0 ? util.randElem(validIndexList) : null;
};


// IS_VALID_MASK_INDEX:
// Returns true if the mask 'fits' at the tileIndex:
// ************************************************************************************************
LevelGeneratorBase.isValidMaskIndex = function (tileIndex, vaultType, vaultMask) {
	let isOpen = vaultType.placementType === VAULT_PLACEMENT.OPEN;
		
	for (let x = 0; x < vaultMask.width; x += 1) {
		for (let y = 0; y < vaultMask.height; y += 1) {
			// Vault:
			if (vaultMask[x][y] === 1) {
				let tile = gs.getTile(tileIndex.x + x, tileIndex.y + y);
				
				if (tile.isSolidWall ||
					gs.isExternalWall(tileIndex.x + x, tileIndex.y + y) ||
					tile.isClosed ||
					(tile.area && tile.area.vaultType && tile.area.vaultType.contentType === VAULT_CONTENT.BOSS) ||
					tile.object) {
				
					return false;
				}
				
				if (isOpen && (tile.type.passable !== 2 || tile.type.isPit || tile.type.isLiquid)) {
					return false;
				}
				
				// Don't overlap open vaults:
				if (isOpen && tile.area && tile.area.vaultType) {
					return false;
				}
				
				if (!isOpen && (tile.type.passable || tile.area)) {
					return false;
				}
			}
			// Area Wall Mask (for side vaults):
			else if (vaultMask[x][y] === 2) {
				let tile = gs.getTile(tileIndex.x + x, tileIndex.y + y);
				if (tile.isSolidWall ||
					!gs.isExternalWall(tileIndex.x + x, tileIndex.y + y) ||
					tile.type.passable ||
					tile.object) {
				
					return false;
				}
			}
		}
	}
	
	return true;
};
