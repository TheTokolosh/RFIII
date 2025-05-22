/*global gs, util*/
/*global DungeonGenerator, Item, MonsterSpawner*/
/*global EXCEPTION_TYPE, OCCLUDING_OBJECT_LIST*/
/*global MAX_FIRE_MUSHROOMS*/
/*global DOUBLE_GOLD_CHANCE*/
/*global NUM_FOUNTAINS_PER_LEVEL*/
/*global NUM_CAMP_FIRES*/
/*global MAX_FIRE_POTS, SPAWN_FIRE_POTS_PERCENT*/
/*global MAX_BEAR_TRAPS, SPAWN_BEAR_TRAPS_PERCENT*/
/*global MAX_FIRE_VENTS, SPAWN_FIRE_VENTS_PERCENT*/
/*global MAX_GAS_VENTS, SPAWN_GAS_VENTS_PERCENT*/
/*global MAX_GAS_POTS, SPAWN_GAS_POTS_PERCENT*/
/*global MAX_SPIKE_TRAPS, SPAWN_SPIKE_TRAPS_PERCENT*/
/*global PIT_TRAP_MIN_LEVEL, SPAWN_PIT_TRAP_PERCENT*/
/*global TELEPORT_TRAP_MIN_LEVEL, SPAWN_TELEPORT_TRAP_PERCENT*/
/*global MAX_VINES, SPAWN_VINE_PERCENT, SUPER_VINE_PERCENT*/
/*global MAX_ICE, SPAWN_SHOCK_REEDS_PERCENT*/
/*global LIBRARY_SIZE, FEATURE_TYPE*/
/*jshint esversion: 6, laxbreak: true, loopfunc: true*/
'use strict';

var levelPopulator = {};


// GENERATE_GLOBAL_STUFF:
// ************************************************************************************************
levelPopulator.generateGlobalStuff = function () {
	this.createSwitches();
	this.createItems();
	this.createFriendlyNPCs();
	this.createObjects();
	this.createFountains();
	this.createHazards();
	this.fillRemainingRewardHooks();
};

// FILL_REMAINING_REWARD_HOOKS:
// It looks weird when challenge rooms have empty reward hooks so we fill them here
// ************************************************************************************************
levelPopulator.fillRemainingRewardHooks = function () {
	let rewardHook = this.getEmptyRewardHook();
	
	while (rewardHook) {
		// Creating an item chest:
		let obj = gs.createContainer(rewardHook.tileIndex, 'Chest');
		obj.toTileIndexList = rewardHook.toTileIndexList;
		
		// Get the next reward Hook:
		rewardHook = this.getEmptyRewardHook();
	}
};

// CREATE_FRIENDLY_NPCS:
// ************************************************************************************************
levelPopulator.createFriendlyNPCs = function () {
	let friendlyNPCFeatures = gs.levelFeatures.filter(e => e.featureType === FEATURE_TYPE.FRIENDLY_NPC);
	
	friendlyNPCFeatures.forEach(function (e) {
		// Skip if the npc has already been generated (possibly by a vault):
		if (gs.liveCharacterList().find(npc => npc.type.name === e.npcTypeName)) {
			return;
		}
		
		MonsterSpawner.spawnFriendlyNPC(e.npcTypeName);
	}, this);
};

// CREATE_OBJECTS:
// ************************************************************************************************
levelPopulator.createObjects = function () {
	// Object Level Features:
	let objectFeatures = gs.levelFeatures.filter(e => e.featureType === FEATURE_TYPE.OBJECT);
	objectFeatures.forEach(function (e) {
		let tileIndex = gs.getWideOpenIndexInLevel();
		if (tileIndex) {
			gs.createObject(tileIndex, e.objectTypeName);
		}
	}, this);
	
	// Camp Fires:
	if (gs.zoneType().isCold) {
		let num = NUM_CAMP_FIRES - gs.objectList.filter(obj => obj.type.name === 'CampFire').length;
		for (let i = 0; i < num; i += 1) {
			let tileIndex = gs.getWideOpenIndexInLevel();
			if (tileIndex) {
				gs.createObject(tileIndex, 'CampFire');
			}
		}
	}
};

// CREATE_FOUNTAINS:
// ************************************************************************************************
levelPopulator.createFountains = function () {
	let count = 0;
	
	// Recovery Fountains:
	let num = util.randInt(Math.ceil(gs.zoneType().numFountains / 2), gs.zoneType().numFountains);
	
	while (this.countFountains() < num) {
		let tileIndex = gs.getWideOpenIndexInLevel();
		
		// Use a reward hook if it exists:
		let rewardHook = this.getEmptyRewardHook();
		if (rewardHook) {
			tileIndex = rewardHook.tileIndex;
		}
		
		if (tileIndex) {
			let obj = gs.createObject(tileIndex, util.chooseRandom([
				{name: 'HealthFountain', percent: 50},
				{name: 'EnergyFountain', percent: 40},
				{name: 'ExperienceFountain', percent: 10},
			]));
			
			if (rewardHook) {
				obj.toTileIndexList = rewardHook.toTileIndexList;
			}
		}
		
		count += 1;
		if (count >= 10) {
			break;
		}
	}

};

// CREATE_SWITCHES
// ************************************************************************************************
levelPopulator.createSwitches = function () {
	let switchLevelFeatures = gs.levelFeatures.filter(e => e.featureType === FEATURE_TYPE.SWITCH);
	
	switchLevelFeatures.forEach(function (e) {
		let rewardHook = this.getEmptyRewardHook();
		
		if (rewardHook) {
			let obj = gs.createObject(rewardHook.tileIndex, 'Switch');
			obj.toTileIndexList = rewardHook.toTileIndexList;
			obj.toTileIndexList.push(e.toTileIndex);
		}
		else {
			let switchTileIndex;
			
			// Find a tileIndex as far from downStairs as possible:
			if (gs.objectList.find(obj => obj.type.name === 'DownStairs')) {
				let downStairsIndex = gs.objectList.find(obj => obj.type.name === 'DownStairs').tileIndex;

				let indexList = gs.getAllIndex();
				indexList = indexList.filter(index => gs.isWideOpen(index));
				indexList.forEach(function (tileIndex) {
					tileIndex.distance = util.distance(tileIndex, e.toTileIndex) + util.distance(tileIndex, downStairsIndex);
				}, this);

				indexList.sort((a, b) => b.distance - a.distance);
				
				switchTileIndex = indexList[0];
			}
			// No downStairs:
			else {
				let indexList = gs.getAllIndex();
				indexList = indexList.filter(index => gs.isWideOpen(index));
				switchTileIndex = util.randElem(indexList);
			}
			
			
			// Create a switch:
			if (switchTileIndex) {
				let obj = gs.createObject(switchTileIndex, 'Switch');
				obj.toTileIndexList = [{x: e.toTileIndex.x, y: e.toTileIndex.y}];
			}
			// Throw Exception:
			else {
				throw {
					type: EXCEPTION_TYPE.LEVEL_GENERATION, 
					text: 'Failed to find tileIndex for switch.',
				};
			}
			
		}
	}, this);
};

// CREATE_ITEMS:
// ************************************************************************************************
levelPopulator.createItems = function () {
	// Forcing Items:
	let forceItemFeatures = gs.levelFeatures.filter(e => e.featureType === FEATURE_TYPE.ITEM);
	forceItemFeatures.forEach(function (e) {
		let rewardHook = this.getEmptyRewardHook();
		
		// Try a rewardHook chest:
		if (rewardHook) {
			let obj = gs.createContainer(rewardHook.tileIndex, 'Chest');
			obj.item = Item.createItem(e.itemTypeName);
			obj.toTileIndexList = rewardHook.toTileIndexList;
		}
		// Else just place it on the ground:
		else {
			let tileIndex = this.getItemIndex();
		
			if (tileIndex) {
				gs.createFloorItem(tileIndex, Item.createItem(e.itemTypeName));
			}
		}
	}, this);
	
	
	// Forcing Rand Items:
	let randItemFeatures = gs.levelFeatures.filter(e => e.featureType === FEATURE_TYPE.RAND_ITEM);
	randItemFeatures.forEach(function (e) {
		let rewardHook = this.getEmptyRewardHook();
		
		// Try a rewardHook chest:
		if (rewardHook) {
			let obj = gs.createContainer(rewardHook.tileIndex, 'Chest', e.itemDropTableName);
			obj.toTileIndexList = rewardHook.toTileIndexList;
		}
		// Else we place it on the floor
		else {
			let tileIndex = this.getItemIndex();
		
			if (tileIndex) {
				gs.createRandomFloorItem(tileIndex, e.itemDropTableName);
			}
		}
	}, this);
	
	// Random Items:
	if (gs.zoneType().spawnItems) {
		let loopCount = 0;
		while (this.countItems() < gs.zoneType().zoneTier.numItems[gs.zoneLevel]) {
			let rewardHook = this.getEmptyRewardHook();

			// Try a rewardHook chest:
			if (rewardHook) {
				let obj = gs.createContainer(rewardHook.tileIndex, 'Chest');
				obj.toTileIndexList = rewardHook.toTileIndexList;
			}
			else {
				// Random chest:
				let tileIndex = gs.getWideOpenIndexInLevel();
				if (tileIndex && util.frac() < 0.5) {
					let obj = gs.createContainer(tileIndex, 'Chest');
				}
				// Try an item:
				else {
					tileIndex = this.getItemIndex();

					if (tileIndex) {
						gs.createRandomFloorItem(tileIndex);
					}
				}
			}

			loopCount += 1;
			if (loopCount > 20) {
				break;
			}
		}
	}
	
	// Gold Piles:
	if (gs.zoneType().spawnGold) {
		let numGold = gs.zoneType().zoneTier.numGold;
	
		if (util.frac() <= DOUBLE_GOLD_CHANCE) {
			numGold = numGold * 2;
		}

		for (let i = 0; i < numGold; i += 1) {
			let tileIndex = this.getItemIndex();

			if (tileIndex) {
				let amount = util.randInt(Math.ceil(gs.dropGoldAmount() / 2), gs.dropGoldAmount());

				gs.createFloorItem(tileIndex, Item.createItem('GoldCoin', {amount: amount}));
			}
		}
	}

};

// CREATE_HAZARDS:
// ************************************************************************************************
levelPopulator.createHazards = function () {
	// The Lich King Bones:
	if (gs.characterList.find(char => char.type.name === 'TheLichKing')) {
		let indexList = gs.getAllIndex();
		indexList = indexList.filter(index => gs.isPassable(index) && !gs.getTile(index).isClosed && !gs.getObj(index) && gs.getTile(index).type !== gs.tileTypes.Water && !gs.isPit(index));
		
		indexList = util.randSubset(indexList, Math.floor(indexList.length * 0.10));
		
		
		indexList.forEach(function (index) {
			let objTypeName = util.chooseRandom([
				{percent: 50, name: 'SkeletonCorpse'},
				{percent: 50, name: 'Bones'},
			]);
			
			let obj = gs.createObject(index, objTypeName);
			
			// Set skeleton corpse type:
			if (objTypeName === 'SkeletonCorpse') {
				obj.npcTypeName = util.randElem(['SkeletonWarrior', 'SkeletonArcher']);
			}
			
		});
	}
	
			
	// Fire Mushrooms:
	if (gs.zoneType().spawnFireShrooms) {
		let num = util.randInt(Math.ceil(MAX_FIRE_MUSHROOMS / 2), MAX_FIRE_MUSHROOMS);
		for (let i = 0; i < num; i += 1) {
			let tileIndex = TrapGenerator.getRandPatchTileIndex();
			if (tileIndex) {
				TrapGenerator.createTrapPatch(tileIndex, 'FireShroom', 0.75);
			}
		}
	}
	
	// Shock Reeds:
	if (gs.zoneType().spawnShockReeds && !gs.noReeds && util.frac() < SPAWN_SHOCK_REEDS_PERCENT) {
		this.spawnShockReeds();
	}
	
	// Fire Glyph:
	if (gs.zoneType().spawnFireGlyphs) {
		let num = util.randInt(Math.ceil(MAX_FIRE_MUSHROOMS / 2), MAX_FIRE_MUSHROOMS);
		for (let i = 0; i < num; i += 1) {
			let tileIndex = TrapGenerator.getRandPatchTileIndex();
			if (tileIndex) {
				TrapGenerator.createTrapPatch(tileIndex, 'FireGlyph', 0.50);
			}
		}
	}
		
	// Bear Traps:
	if (gs.zoneType().spawnBearTraps && util.frac() < SPAWN_BEAR_TRAPS_PERCENT) {
		TrapGenerator.createTrapObjects('BearTrap', Math.ceil(MAX_BEAR_TRAPS / 2), MAX_BEAR_TRAPS);
	}
	
	// Fire Vents:
	if (gs.zoneType().spawnFireVents && util.frac() < SPAWN_FIRE_VENTS_PERCENT) {
		TrapGenerator.createTrapObjects('FireVent', Math.ceil(MAX_FIRE_VENTS / 2), MAX_FIRE_VENTS);
	}
	
	// Steam Vents:
	if (gs.zoneType().spawnSteamVents && util.frac() < SPAWN_GAS_VENTS_PERCENT) {
		TrapGenerator.createTrapObjects('SteamVent', Math.ceil(MAX_GAS_VENTS / 2), MAX_GAS_VENTS);
	}
	
	// Pit Traps:
	if (gs.zoneType().spawnPitTraps && gs.zoneLevel < gs.zoneType().numLevels && gs.dangerLevel() >= PIT_TRAP_MIN_LEVEL && util.frac() < SPAWN_PIT_TRAP_PERCENT) {
		// Never above a boss level:
		if ((gs.zoneName === DungeonGenerator.zones.Branch1 && gs.zoneLevel === 4)
			|| (gs.zoneName === DungeonGenerator.zones.Branch2 && gs.zoneLevel === 4)
			|| (gs.zoneName === 'TheVaultOfYendor' && gs.zoneLevel === 4)) {
			// Pass
		}
		else {
			TrapGenerator.createTrapObjects('PitTrap', 1, 1);
		}
		
		
	}
	
	// Teleport Traps:
	if (gs.zoneType().spawnTeleportTraps && gs.dangerLevel() >= TELEPORT_TRAP_MIN_LEVEL && util.frac() < SPAWN_TELEPORT_TRAP_PERCENT) {
		TrapGenerator.createTrapObjects('TeleportTrap', 1, 1);
	}
	
	// Spike Traps:
	if (gs.zoneType().spawnSpikeTraps && util.frac() < SPAWN_SPIKE_TRAPS_PERCENT) {
		TrapGenerator.createTrapObjects('SpikeTrap', Math.ceil(MAX_SPIKE_TRAPS / 2), MAX_SPIKE_TRAPS);
	}
	
	// Fire Pots:
	if (gs.zoneType().spawnFirePots && util.frac() < SPAWN_FIRE_POTS_PERCENT) {
		let num = util.randInt(Math.ceil(MAX_FIRE_POTS / 2), MAX_FIRE_POTS);
		for (let i = 0; i < num; i += 1) {
			let tileIndex = gs.getWideOpenIndexInLevel();
			if (tileIndex) {
				gs.createNPC(tileIndex, 'FirePot');
			}
		}
	}
	
	// Gas Pots:
	if (gs.zoneType().spawnGasPots && util.frac() < SPAWN_GAS_POTS_PERCENT) {
		let num = util.randInt(Math.ceil(MAX_GAS_POTS / 2), MAX_GAS_POTS);
		for (let i = 0; i < num; i += 1) {
			let tileIndex = gs.getWideOpenIndexInLevel();
			if (tileIndex) {
				gs.createNPC(tileIndex, 'GasPot');
			}
		}
	}
	
	// Vine Patch:
	if (gs.zoneType().spawnVines && util.frac() < SPAWN_VINE_PERCENT) {
		let num = util.randInt(Math.ceil(MAX_VINES / 2), MAX_VINES);
		
		// Super Vines:
		if (gs.dangerLevel() >= 2 && util.frac() < SUPER_VINE_PERCENT) {
			num = MAX_VINES * 2;
		}
		
		for (let i = 0; i < num; i += 1) {
			let tileIndex = gs.getOpenIndexInLevel();
			if (tileIndex) {
				gs.createVinePatch(tileIndex, util.randInt(1, 3), 'Vine');
			}
		}
	}
	
	// Oil Patch:
	if (gs.zoneType().spawnOil && util.frac() < SPAWN_VINE_PERCENT) {
		let num = util.randInt(Math.ceil(MAX_VINES / 2), MAX_VINES);
		
		// Super Oil:
		if (util.frac() < SUPER_VINE_PERCENT) {
			num = MAX_VINES * 2;
		}
		
		for (let i = 0; i < num; i += 1) {
			let tileIndex = gs.getOpenIndexInLevel();
			if (tileIndex) {
				gs.createVinePatch(tileIndex, util.randInt(1, 3), 'Oil');
			}
		}
	}
	
	// Scrap Patch:
	if (gs.zoneType().spawnOil && util.frac() < SPAWN_VINE_PERCENT + 1) {
		let num = util.randInt(Math.ceil(MAX_VINES / 2), MAX_VINES);
		
		for (let i = 0; i < num; i += 1) {
			let tileIndex = gs.getOpenIndexInLevel();
			if (tileIndex) {
				gs.createVinePatch(tileIndex, util.randInt(1, 3), 'Scrap', 0.5);
			}
		}
	}
	
	// Ice Patch:
	if (gs.zoneType().spawnIce) {
		let num = util.randInt(Math.ceil(MAX_ICE / 2), MAX_ICE);
		
		// Super Vines:
		if (util.frac() < SUPER_VINE_PERCENT) {
			num = MAX_VINES * 2;
		}
		
		for (let i = 0; i < num; i += 1) {
			let tileIndex = gs.getOpenIndexInLevel();
			if (tileIndex) {
				gs.createVinePatch(tileIndex, util.randInt(2, 4), 'Ice');
			}
		}
	}
	
	// Blood:
	if (gs.zoneType().spawnBlood) {
		let indexList = gs.getAllIndex();
		indexList = indexList.filter(index => gs.isPassable(index) && !gs.getObj(index) && gs.getTile(index).type !== gs.tileTypes.Water && !gs.isPit(index));
		indexList = indexList.filter(index => util.frac() < 0.02);
		indexList.forEach(function (index) {
			gs.createObject(index, 'Blood');
		});
	}
};

// COUNT_ITEMS:
// Counts items (not gold)
// ************************************************************************************************
levelPopulator.countItems = function () {
	let count = 0;
	
	count += gs.objectList.filter(obj => obj.isContainer() && obj.type.name !== 'CrystalChest').length;
	count += gs.floorItemList.filter(floorItem => floorItem.item.type.name !== 'GoldCoin').length;
	
	return count;
};

// COUNT_FOUNTAINS:
// ************************************************************************************************
levelPopulator.countFountains = function () {
	let count = 0;
	
	count += gs.objectList.filter(obj => util.inArray(obj.type.name, ['HealthFountain', 'EnergyFountain', 'ExperienceFountain']));
	
	return count;
};

// GET_ITEM_INDEX:
// ************************************************************************************************
levelPopulator.getItemIndex = function () {
	let indexList = gs.getAllIndex();
	
	indexList = indexList.filter(function (tileIndex) {
		return gs.isPassable(tileIndex)
			&& !gs.getObj(tileIndex, obj => obj.type.isDangerous)
			&& !gs.getObj(tileIndex, 'Portal')
			&& !gs.getObj(tileIndex, obj => obj.type.niceName === 'Conveyor Belt')
			&& !gs.getObj(tileIndex, obj => obj.isDoor())
			&& !gs.getItem(tileIndex)
			&& !gs.isUncoveredLiquid(tileIndex)
			&& !gs.isPit(tileIndex)
			&& !gs.getTile(tileIndex).isClosed
			&& (!gs.getObj(tileIndex.x, tileIndex.y + 1) || !util.inArray(gs.getObj(tileIndex.x, tileIndex.y + 1).type.name, OCCLUDING_OBJECT_LIST));
		
	}, this);

	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_EMPTY_REWARD_HOOK:
// ************************************************************************************************
levelPopulator.getEmptyRewardHook = function () {
	// All valid reward hooks:
	let indexList = gs.getAllIndex();
	indexList = indexList.filter(tileIndex => gs.getTile(tileIndex).rewardHook);
	indexList = indexList.filter(tileIndex => !gs.getTile(tileIndex).character && !gs.getTile(tileIndex).object && !gs.getTile(tileIndex).item);
	
	
	// Prioritise reward hooks w/ triggers (drop walls):
	let triggerIndexList = indexList.filter(tileIndex => gs.getTile(tileIndex).rewardHook.toTileIndexList.length > 0);
	if (triggerIndexList.length > 0) {
		return gs.getTile(util.randElem(triggerIndexList)).rewardHook;
	}
	
	// Prioritise reward hooks in zoos:
	let zooIndexList = indexList.filter(tileIndex => gs.getTile(tileIndex).area && gs.getTile(tileIndex).area.vaultType && gs.getTile(tileIndex).area.vaultType.isZoo);
	if (zooIndexList.length > 0) {
		return gs.getTile(util.randElem(zooIndexList)).rewardHook;
	}
	
	// Any reward hook:
	if (indexList.length > 0) {
		return gs.getTile(util.randElem(indexList)).rewardHook;
	}
	
	
	return null;
	
};

// SPAWN_SHOCK_REEDS:
// ************************************************************************************************
levelPopulator.spawnShockReeds = function () {
	var numWater, num, indexList;
	
	indexList = gs.getAllIndex().filter(index => gs.getTile(index).type.name === 'Water');
	numWater = indexList.length;
	
	if (numWater === 0) {
		return;
	}
	
	num = util.randInt(1, Math.ceil(numWater / 24));
	for (let i = 0; i < num; i += 1) {
		indexList = indexList.filter(index => !gs.getObj(index) && !gs.getChar(index));
		
		if (indexList.length > 0) {
			let tileIndex = util.randElem(indexList);
		
			gs.createObject(tileIndex, 'ShockReeds');
		}
	}
};

// PLACE_WALL_DRESSING:
// ************************************************************************************************
gs.placeWallDressing = function () {
	let isValid = function (tileIndex) {
		return gs.isVisibleWall(tileIndex)
			&& !gs.isDropWall(tileIndex)
			&& !gs.getObj(tileIndex)
			&& !gs.getTile(tileIndex.x, tileIndex.y + 1).isDropWallRoom;
	};
	
	// Torches:
	let indexList = this.getAllIndex();
	indexList = indexList.filter(index => isValid(index) && index.x % 2 === 0 && util.frac() < 0.50);
	indexList.forEach(function (index) {
		gs.createObject(index, 'Torch');
	});
	
	// Wall Flags:
	if (this.zoneType().spawnWallFlags && util.frac() < 0.5) {
		indexList = this.getAllIndex();
		indexList = indexList.filter(index => isValid(index) && gs.getTile(index).type.name === 'Wall' && index.x % 2 === 1 && util.frac() < 0.10);
		indexList.forEach(function (index) {
			gs.createObject(index, 'WallFlag');
		});
	}
	
	// Eye of Yendor:
	if (this.zoneType().spawnEyeOfYendor && util.frac() < 0.25) {
		// Middle of zone:
		indexList = gs.getIndexListInBox(10, 10, 30, 30);
		
		// Valid wall:
		indexList = indexList.filter(index => isValid(index) && gs.getTile(index).type.name === 'Wall');
		
		// Must be clear at least 2 tiles down:
		indexList = indexList.filter(index => gs.isPassable(index.x, index.y + 2));
		
		// Must be slightly centered on a wall:
		indexList = indexList.filter(index => gs.getTile(index.x - 1, index.y).type.name === 'Wall' && gs.getTile(index.x + 1, index.y).type.name === 'Wall');
		
		// Never in a corner:
		indexList = indexList.filter(index => gs.isPassable(index.x - 1, index.y + 1)&& gs.isPassable(index.x + 1, index.y + 1));
		
		if (indexList.length > 0) {
			
			gs.createObject(util.randElem(indexList), 'EyeOfYendor');
		}
	}
};



// STOCK_LIBRARY:
// Call when the librarian is generated to stock with talents the player does not have
// ************************************************************************************************
gs.stockLibrary = function () {
	var talentList = gs.talentList.map(talent => talent.name);
	
	talentList = talentList.filter(talentName => gs.pc.talents.canAddTalent(talentName));
	talentList = talentList.filter(talentName => !gs.talents[talentName].neverDrop);
	
	talentList = util.randSubset(talentList, Math.min(LIBRARY_SIZE, talentList.length));
	
	this.libraryTalents = talentList;
};

// TRAP_GENERATOR:
// A singleton system responsible for:
// - Finding appropriate locations for traps
// - Creating traps
// ************************************************************************************************
var TrapGenerator = {};

// GET_RAND_PATCH_TILE_INDEX:
// Returns a random tileIndex suitable for generating a trap patch.
// Looks for very wide open areas in order to prioritize placement in rooms.
// ************************************************************************************************
TrapGenerator.getRandPatchTileIndex = function () {

    let indexList = gs.getAllIndex();
    indexList = indexList.filter(index => gs.isIndexOpen(index) && !gs.isPit(index));
    indexList = indexList.filter(index => gs.getIndexListCardinalAdjacent(index).filter(idx => gs.isStaticPassable(idx)).length > 2);
    
    return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_RAND_TRAP_OBJECT_TILE_INDEX:
// ************************************************************************************************
TrapGenerator.getRandTrapObjectTileIndex = function () {
	let indexList = gs.getAllIndex();
    
	// Open:
	indexList = indexList.filter(index => gs.isIndexOpen(index));
	
	// Only basic floor types (i.e. won't spawn on floor grates or stairs and stuff):
	indexList = indexList.filter(index => util.inArray(gs.getTile(index).type.name, ['Floor', 'CaveFloor']));
	
	// Only spawn if orthoganally passable:
	indexList = indexList.filter(index => gs.getIndexListCardinalAdjacent(index).filter(idx => gs.isStaticPassable(idx)).length === 4);
	
	// Don't spawn orthoganally to a conveyor belt:
	indexList = indexList.filter(index => gs.getIndexListCardinalAdjacent(index).filter(idx => gs.getObj(idx, obj => obj.type.niceName === 'Conveyor Belt')).length === 0);
	
	// Don't spawn behind an occluding object:
	indexList = indexList.filter(index => !gs.isTileIndexOccluded(index));
	
	indexList = indexList.filter(index => this.isOpenTrapIndex(index.x, index.y));

	
	let isTrap = function (obj) {
		return obj.type.isDangerous
			|| util.inArray(obj.type.name, ['GasVent', 'SteamVent', 'FlamingCloudVent', 'FreezingCloudVent']);
	};
	
	// Don't spawn next to another trap:
	indexList = indexList.filter(index => gs.getIndexListAdjacent(index).filter(idx => gs.getObj(idx, obj => isTrap(obj))).length === 0);
	
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// CREATE_TRAP_OBJECTS:
// ************************************************************************************************
TrapGenerator.createTrapObjects = function (trapTypeName, min, max) {
	let num = util.randInt(min, max);
	
	// Don't place additional traps if vaults have already placed them:
	num -= gs.objectList.filter(obj => obj.type.name === trapTypeName).length;
	
	for (let i = 0; i < num; i += 1) {
		let tileIndex = this.getRandTrapObjectTileIndex();
		if (tileIndex) {
			gs.createObject(tileIndex, trapTypeName);
		}
	}
};

// CREATE_TRAP_PATCH:
// ************************************************************************************************
TrapGenerator.createTrapPatch = function (tileIndex, trapTypeName, density) {
	let indexList = gs.getIndexListInFlood(tileIndex, gs.isPassable.bind(gs), 2);
	
    indexList = indexList.filter(index => gs.isIndexOpen(index) && !gs.isPit(index));
   
	let isOpen = function (x, y) {
		return gs.isStaticPassable(x, y) && !gs.isPit(x, y) && !gs.getObj(x, y, obj => obj.type.isDangerous);
	};
	
	indexList.forEach(function (index) {
		let x = index.x,
			y = index.y;
		
		// Don't spawn orthoganally to a conveyor belt or door:
		if (gs.getIndexListCardinalAdjacent(index).filter(function (idx) {
			return gs.getObj(idx, obj => obj.type.niceName === 'Conveyor Belt')
				|| gs.getObj(idx, obj => obj.isDoor());
		}).length > 0) {
			return;
		}
		
		// Don't spawn behind a pillar or other occluding object:
		if (gs.isTileIndexOccluded(x, y)) {
			return;
		}
		
		if (!this.isOpenTrapIndex(x, y)) {
			return;
		}
		
		
		if ((isOpen(x - 1, y) || isOpen(x + 1, y)) && (isOpen(x, y - 1) || isOpen(x, y + 1))) {
			// Base Spawn Percent:
			// 1.0 => 0.20 based on flood depth
			let spawnPercent = 1 / (index.depth + 1);

			// Density:
			spawnPercent *= density;

			// Create Trap:
			if (util.frac() < spawnPercent) {
				gs.createObject(index, trapTypeName);
			}
		}
		
	}, this);
};

// IS_OPEN_TRAP_INDEX:
TrapGenerator.isOpenTrapIndex = function (x, y) {

	let isOpen = function (x, y) {
		return gs.isStaticPassable(x, y) && !gs.isPit(x, y) && !gs.getObj(x, y, obj => obj.type.isDangerous);
	};
	
	
	// Don't spawn when blocked on 4 corners:
	if (!isOpen(x - 1, y - 1) && !isOpen(x + 1, y - 1) && !isOpen(x - 1, y + 1) && !isOpen(x + 1, y + 1)) {
		return false;
	}

	// Don't block a hall above:
	if (isOpen(x, y - 1) && !isOpen(x - 1, y - 1) && !isOpen(x + 1, y - 1)) {
		return false;
	}

	// Don't block a hall below:
	if (isOpen(x, y + 1) && !isOpen(x - 1, y + 1) && !isOpen(x + 1, y + 1)) {
		return false;
	}

	// Don't block a hall to the left:
	if (isOpen(x - 1, y) && !isOpen(x - 1, y - 1) && !isOpen(x - 1, y + 1)) {
		return false;
	}

	// Don't block a hall to the right:
	if (isOpen(x + 1, y) && !isOpen(x + 1, y - 1) && !isOpen(x + 1, y + 1)) {
		return false;
	}
	
	return true;
};

// IS_TILE_INDEX_OCCLUDED:
// Returns true if a pillar, span or other object is blocking sight of the tileIndex
// Used for spawning traps and NPCs so they are not hidden
// ************************************************************************************************
gs.isTileIndexOccluded = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return gs.getObj(tileIndex.x, tileIndex.y + 1) && util.inArray(gs.getObj(tileIndex.x, tileIndex.y + 1).type.name, OCCLUDING_OBJECT_LIST);
};