/*global gs, util, game*/
/*global DungeonGenerator*/
/*global FACTION, SLEEPING_PERCENT, MOB_WANDER_PERCENT, MIN_ELITE_LEVEL, NPC_ELITE_CHANCE, FEATURE_TYPE, VAULT_CONTENT*/
/*global VAULT_PLACEMENT*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

const SPAWN_TYPE = {
	DEFAULT: 		'DEFAULT',
	WATER: 			'WATER',
	LAVA: 			'LAVA',
	TOXIC_WASTE: 	'TOXIC_WASTE',
	MERCHANT: 		'MERCHANT',
	WIDE_OPEN: 		'WIDE_OPEN',
};

let MonsterSpawner = {};

// POPULATE_LEVEL:
// ************************************************************************************************
MonsterSpawner.populateLevel = function () {
	if (!gs.debugProperties.spawnMobs || gs.zoneType().noSpawn || (gs.currentGenerator && gs.currentGenerator.noSpawn) || gs.noMobSpawn) {
		return;
	}
	
	let totalExp = this.totalExp();
	let count = 0;
	
	while (this.currentExp() < totalExp) {
		let spawnObj = util.chooseRandom(gs.zoneType().spawnTable[gs.zoneLevel]);
		
		this.spawnAtRandomPos(spawnObj);
		
		count += 1;
		if (count > 500) {
			throw 'MonsterSpawner.populateLevel() - could not place enough monsters.';
		}
	}
	
	// Handling Boss Level-Features:
	gs.levelFeatures.forEach(function (levelFeature) {
		if (levelFeature.featureType === FEATURE_TYPE.BOSS && !levelFeature.hasGenerated) {
			let tileIndex = MonsterSpawner.getBaseSpawnTileIndex({npcType: levelFeature.bossName});
			MonsterSpawner.spawnNPCType(tileIndex, levelFeature.bossName);
		}
	}, this);
};

// TOTAL_EXP:
// The desired total exp for the current dungeon level.
// ************************************************************************************************
MonsterSpawner.totalExp = function () {
	let totalMonsters = gs.zoneType().zoneTier.numNPCs[gs.zoneLevel],
		zoneDL = gs.dangerLevel();
	
	return totalMonsters * (10 + zoneDL);
};

// CURRENT_EXP:
// The total exp of all monsters currently spawned on the dungeon level.
// ************************************************************************************************
MonsterSpawner.currentExp = function () {
	var list = gs.getAllNPCs();
	
	list = list.filter(npc => npc.faction === FACTION.HOSTILE);
	
	let sum = 0;
	
	list.forEach(function (npc) {
		let exp = npc.killedExp();
		
		if (npc.type.isBoss) {
			// pass
		}
		else if (gs.getTile(npc.tileIndex).isClosed) {
			sum += exp / 2;
		}
		else {
			sum += exp;
		}
	}, this);
	
	// Spawn Portals:
	gs.getAllIndex().forEach(function (tileIndex) {
		if (gs.getTile(tileIndex).spawnNPCName) {
			sum += gs.npcTypes[gs.getTile(tileIndex).spawnNPCName].exp;
		}
	}, this);
		
	return sum;
};

// SPAWN_AT_RANDOM_POS:
// spawnObjs are held in the the spawn-tables and are of the form:
// {npcType, min, max}, or {groupType}
// ************************************************************************************************
MonsterSpawner.spawnAtRandomPos = function (spawnObj) {
	
	// Get tileIndex:
	let baseSpawnTileIndex = this.getBaseSpawnTileIndex(spawnObj);
		
	if (baseSpawnTileIndex) {
		// Spawn Single (or repeat):
		if (spawnObj.npcType) {
			let num = util.randInt(spawnObj.min, spawnObj.max);
			let charList = [];
			
			for (let i = 0; i < num; i += 1) {
				let char = this.spawnNPCType(baseSpawnTileIndex, spawnObj.npcType);
				
				if (char) {
					charList.push(char);
				}
			}
		}
		// Spawn Group:
		else if (spawnObj.groupType) {
			this.spawnGroup(baseSpawnTileIndex, spawnObj.groupType);
		}
	}
};

// SPAWN_RANDOM_MONSTER_AT:
// Spawns an appropriate random monster from the zones spawn-table at the tileIndex
// This is called when loading vaults encounters the Mob-Flag
// ************************************************************************************************
MonsterSpawner.spawnRandomMonsterAt = function (tileIndex) {
	let spawnObj = null, 
		count = 0;
	
	// Getting an appropriate spawn obj:
	do {
		spawnObj = util.chooseRandom(gs.zoneType().spawnTable[gs.zoneLevel]);
		
		count += 1;
		if (count > 1000) {
			throw 'ERROR [MonsterSpawner.spawnRandomMonsterAt] - Could not find a valid npcType for tileIndex: ' + tileIndex.x + ', ' + tileIndex.y;
		}
	} while (!this.isTileIndexValidForSpawn(spawnObj, tileIndex));
	
	return this.spawnNPCType(tileIndex, spawnObj.npcType, true);
};

// SPAWN_ZOO_MONSTER_AT:
// Spawns an appropriate random monster from the zone spawn-table atthe tileIndex
// this is called when loading vaults encounters the Mob-Zoo-Flag
// Zoo monsters only include monsters that can move
// ************************************************************************************************
MonsterSpawner.spawnZooMonsterAt = function (tileIndex) {
	let npcType;
	
	let isInvalidNPCType = function (npcType) {
		return npcType.movementSpeed === 'NONE'
			|| util.inArray(SPAWN_TYPE.WATER, npcType.spawnType)
			|| util.inArray(SPAWN_TYPE.LAVA, npcType.spawnType)
			|| util.inArray(SPAWN_TYPE.TOXIC_WASTE, npcType.spawnType);
	};
	
	do {
		let spawnObj = util.chooseRandom(gs.zoneType().spawnTable[gs.zoneLevel]);
		let npcTypeName = spawnObj.npcType;
		

		// Select random from group:
		if (spawnObj.groupType) {
			let npcGroupType = gs.npcGroupTypes[spawnObj.groupType];
			let list = [];

			list = list.concat(npcGroupType.npcTypes.map(e => e.name));

			if (npcGroupType) {
				list = list.concat(npcGroupType.forceNPCTypes);
			}

			npcTypeName = util.randElem(list);
		}
		
		npcType = gs.npcTypes[npcTypeName];
	} while (isInvalidNPCType(npcType));
	
	return this.spawnNPCType(tileIndex, npcType.name, true);
};

// SPAWN_FRIENDLY_NPC:
// ************************************************************************************************
MonsterSpawner.spawnFriendlyNPC = function (npcTypeName) {
	var indexList = gs.getAllIndex();
	
	indexList = indexList.filter(index => this.isValidFloorSpawnIndex(index));
	indexList = indexList.filter(index => !gs.getItem(index));
	indexList = indexList.filter(index => gs.isWidePassable(index));
	indexList = indexList.filter(index => gs.getIndexListAdjacent(index).filter(idx => gs.isPit(idx)).length === 0); // Don't spawn adjacent to pits
	indexList = indexList.filter(index => !gs.getObj(index, 'Track'));
	indexList = indexList.filter(index => !gs.isTileIndexOccluded(index));
	if (indexList.length > 0) {
		let tileIndex = util.randElem(indexList);
		
		if (tileIndex) {
			gs.createNPC(tileIndex, npcTypeName);
		}
	}
};

// IS_TILE_INDEX_VALID_FOR_SPAWN:
// ************************************************************************************************
MonsterSpawner.isTileIndexValidForSpawn = function (spawnObj, tileIndex) {
	let npcType = gs.npcTypes[spawnObj.npcType],
		tileTypeName = gs.getTile(tileIndex).type.name;
	
	if (!spawnObj.npcType) {
		return false;
	}

	// Water:
	if (tileTypeName === 'Water') {
		if (!util.inArray(SPAWN_TYPE.WATER, npcType.spawnType)) {
			return false;
		}
	}
	// Lava:
	else if (tileTypeName === 'Lava') {
		if (!util.inArray(SPAWN_TYPE.LAVA, npcType.spawnType)) {
			return false;
		}
	}
	// Toxic Waste:
	else if (tileTypeName === 'ToxicWaste') {
		if (!util.inArray(SPAWN_TYPE.TOXIC_WASTE, npcType.spawnType)) {
			return false;
		}
	}
	// Any other tile:
	else {
		if (!util.inArray(SPAWN_TYPE.DEFAULT, npcType.spawnType)) {
			return false;
		}
	}
	
	// Don't spawn near gas:
	if (!spawnObj.npcType.isGasImmune && gs.isNearGasVent(tileIndex)) {
		return false;
	}

	return true;
};

// SPAWN_NPC_TYPE:
// ************************************************************************************************
MonsterSpawner.spawnNPCType = function (baseSpawnTileIndex, npcTypeName, atBaseSpawnTileIndex = false) {
	let npcFlags = {
		isAsleep: 		util.frac() < SLEEPING_PERCENT,
		isWandering:	util.frac() < MOB_WANDER_PERCENT,
		level:			gs.adjustedMonsterLevel(gs.npcTypes[npcTypeName].level)
	};

	// Elite:
	if (gs.dangerLevel() >= MIN_ELITE_LEVEL && util.frac() < NPC_ELITE_CHANCE) {
		npcFlags.npcClassType = gs.getNPCClassType(npcTypeName);
	}
	
	// Tile Index:
	let spawnTileIndex = baseSpawnTileIndex;
	if (!atBaseSpawnTileIndex) {
		spawnTileIndex = this.getSpawnTileIndex(baseSpawnTileIndex, gs.npcTypes[npcTypeName]);
	}
		
	// Create the NPC:
    if (spawnTileIndex) {
        let npc = gs.createNPC(spawnTileIndex, npcTypeName, npcFlags);
    
        // On Spawn Function (typically creates some objects around the newly spawned npc):
        if (gs.npcTypes[npcTypeName].onSpawn) {
            gs.npcTypes[npcTypeName].onSpawn.call(npc);
        }

        // Closing tiles around spawners:
        if (util.inArray(SPAWN_TYPE.WIDE_OPEN, gs.npcTypes[npcTypeName].spawnType)) {
            gs.getIndexListAdjacent(npc.tileIndex).forEach(function (index) {
                gs.getTile(index).isClosed = true;
            }, this);  
        }

        return npc;
    }
    
    return null;
};

// SPAWN_GROUP:
// ************************************************************************************************
MonsterSpawner.spawnGroup = function (baseSpawnTileIndex, groupTypeName) {
	let groupType = gs.npcGroupTypes[groupTypeName];
	let charList = [];
	
	// The entire group can be asleep:
	let isAsleep = util.frac() < SLEEPING_PERCENT;
	
	// Force NPC Types
	if (groupType.forceNPCTypes) {
		groupType.forceNPCTypes.forEach(function (npcTypeName) {
			let npc = this.spawnNPCType(baseSpawnTileIndex, npcTypeName);

			if (npc) {
				npc.isWandering = false;
				npc.isAsleep = isAsleep;
				charList.push(npc);
			}
		}, this);
	}
	
	// Random NPCs:
	let num = util.randInt(groupType.min,  groupType.max);
	for (let i = 0; i < num; i += 1) {
		let npcTypeName =  util.chooseRandom(groupType.npcTypes);		
		
		let npc = this.spawnNPCType(baseSpawnTileIndex, npcTypeName);
		
		if (npc) {
			npc.isWandering = false;
			npc.isAsleep = isAsleep;
			charList.push(npc);
		}
	}
};

// GET_BASE_SPAWN_TILE_INDEX:
// ************************************************************************************************
MonsterSpawner.getBaseSpawnTileIndex = function (spawnObj) {
	let spawnType = null;
	
	// NPC Type:
	if (spawnObj.npcType) {
		spawnType = gs.npcTypes[spawnObj.npcType].spawnType;
	}
	// Group:
	else if (spawnObj.groupType) {
		spawnType = gs.npcGroupTypes[spawnObj.groupType].spawnType;
	}
	
	let indexList = [];
	
	// Water:
	if (util.inArray(SPAWN_TYPE.WATER, spawnType)) {
		indexList = indexList.concat(gs.getAllIndex().filter(index => this.isValidWaterSpawnIndex(index)));
	}
	
	// Lava:
	if (util.inArray(SPAWN_TYPE.LAVA, spawnType)) {
		indexList = indexList.concat(gs.getAllIndex().filter(index => this.isValidLavaSpawnIndex(index)));
	}
	
	// Toxic Waste:
	if (util.inArray(SPAWN_TYPE.TOXIC_WASTE, spawnType)) {
		indexList = indexList.concat(gs.getAllIndex().filter(index => this.isValidToxicWasteSpawnIndex(index)));
	}
	
	// Wide Open:
	if (util.inArray(SPAWN_TYPE.WIDE_OPEN, spawnType)) {
		indexList = indexList.concat(gs.getAllIndex().filter(index => this.isValidFloorSpawnIndex(index) && gs.isWidePassable(index)));
	}
	
	// Default:
	if (util.inArray(SPAWN_TYPE.DEFAULT, spawnType)) {
		indexList = indexList.concat(gs.getAllIndex().filter(index => this.isValidFloorSpawnIndex(index)));
	}
	
	
	
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_SPAWN_TILE_INDEX:
// ************************************************************************************************
MonsterSpawner.getSpawnTileIndex = function (baseSpawnTileIndex, npcType) {
	let indexList = [];
	
	// Water Spawns:
	if (util.inArray(SPAWN_TYPE.WATER, npcType.spawnType)) {
		// Default is OK:
		if (this.isValidWaterSpawnIndex(baseSpawnTileIndex)) {
			return baseSpawnTileIndex;
		}
		
		// Flood tiles:
		let list = gs.getIndexListInFlood(baseSpawnTileIndex, tileIndex => gs.isStaticPassable(tileIndex) && gs.getTile(tileIndex).type.name === 'Water', 3);
										   
		// Filter Valid:
		list = list.filter(tileIndex => this.isValidWaterSpawnIndex(tileIndex), this);
		
		indexList = indexList.concat(list);
	}
	
	// Lava Spawns:
	if (util.inArray(SPAWN_TYPE.LAVA, npcType.spawnType)) {
		if (this.isValidLavaSpawnIndex(baseSpawnTileIndex)) {
			return baseSpawnTileIndex;
		}
		
		// Flood tiles:
		let list = gs.getIndexListInFlood(baseSpawnTileIndex, tileIndex => gs.isStaticPassable(tileIndex) && gs.getTile(tileIndex).type.name === 'Lava', 3);
		
		// Filter Valid:
		list = list.filter(tileIndex => this.isValidLavaSpawnIndex(tileIndex), this);
		
		indexList = indexList.concat(list);
	}
	
	
	// Toxic Waste Spawns:
	if (util.inArray(SPAWN_TYPE.TOXIC_WASTE, npcType.spawnType)) {
		if (this.isValidToxicWasteSpawnIndex(baseSpawnTileIndex)) {
			return baseSpawnTileIndex;
		}
		
		// Flood tiles:
		let list = gs.getIndexListInFlood(baseSpawnTileIndex, tileIndex => gs.isStaticPassable(tileIndex) && gs.getTile(tileIndex).type.name === 'ToxicWaste', 3);
		
		// Filter Valid:
		list = list.filter(tileIndex => this.isValidToxicWasteSpawnIndex(tileIndex), this);
		
		indexList = indexList.concat(list);
	}
	
	// Normal Spawns:
	if (util.inArray(SPAWN_TYPE.DEFAULT, npcType.spawnType) || util.inArray(SPAWN_TYPE.WIDE_OPEN, npcType.spawnType)) {
		if (this.isValidFloorSpawnIndex(baseSpawnTileIndex)) {
			// Don't spawn near gas:
			if (!npcType.isGasImmune && gs.isNearGasVent(baseSpawnTileIndex)) {
				// Pass
			}
			else {
				return baseSpawnTileIndex;
			}
		}
        
		// Flood tiles:
		let list = gs.getIndexListInFlood(baseSpawnTileIndex, gs.isStaticPassable, 3);
                       
		// Filter Valid:
		list = list.filter(tileIndex => this.isValidFloorSpawnIndex(tileIndex), this);
		
		indexList = indexList.concat(list);
	}
	
	// Don't spawn near gas:
	if (!npcType.isGasImmune) {
		indexList = indexList.filter(tileIndex => !gs.isNearGasVent(tileIndex));
	}
	
    if (indexList.length > 0) {
        return util.nearestTo(baseSpawnTileIndex, indexList);
    }
    else {
        return null;
    }
};

// IS_VALID_SPAWN_INDEX:
// ************************************************************************************************
MonsterSpawner.isValidSpawnIndex = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	
	
	return gs.isPassable(tileIndex)
		&& !gs.getTile(tileIndex).isClosed
        && !gs.getTile(tileIndex).isDropWallRoom
        && !gs.isPit(tileIndex)
        && !gs.getObj(tileIndex, obj => obj.isZoneLine())
		&& !gs.getObj(tileIndex, obj => obj.type.activate);	
};

// IS_VALID_FLOOR_SPAWN_INDEX:
// ************************************************************************************************
MonsterSpawner.isValidFloorSpawnIndex = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	// Never spawn in challenge vaults:
	if (gs.getTile(tileIndex).area && gs.getTile(tileIndex).area.vaultType) {
		let vaultType = gs.getTile(tileIndex).area.vaultType;
		
		if (vaultType.placementType !== VAULT_PLACEMENT.MAJOR && vaultType.placementType !== VAULT_PLACEMENT.LEVEL) {
			if (vaultType.contentType === VAULT_CONTENT.CHALLENGE || vaultType.contentType === VAULT_CONTENT.BOSS) {
				return false;
			}
		}	
	}
	
	return this.isValidSpawnIndex(tileIndex)
		&& !gs.isUncoveredLiquid(tileIndex)
		&& gs.isIndexSafe(tileIndex)
		&& !gs.getObj(tileIndex, 'Track')
		&& !gs.getObj(tileIndex, obj => obj.type.niceName === 'Conveyor Belt');
		
};

// IS_VALID_WATER_SPAWN_INDEX:
// ************************************************************************************************
MonsterSpawner.isValidWaterSpawnIndex = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return this.isValidSpawnIndex(tileIndex)
		&& gs.getTile(tileIndex).type.name === 'Water'
		&& gs.isIndexSafe(tileIndex);
};

// IS_VALID_LAVA_SPAWN_INDEX:
// ************************************************************************************************
MonsterSpawner.isValidLavaSpawnIndex = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return this.isValidSpawnIndex(tileIndex)
		&& gs.getTile(tileIndex).type.name === 'Lava';
};

// IS_VALID_TOXIC_WASTE_SPAWN_INDEX:
// ************************************************************************************************
MonsterSpawner.isValidToxicWasteSpawnIndex = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return this.isValidSpawnIndex(tileIndex)
		&& gs.getTile(tileIndex).type.name === 'ToxicWaste';
};



