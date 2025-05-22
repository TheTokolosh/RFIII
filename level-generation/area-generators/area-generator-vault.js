/*global gs, debug, util*/
/*global Item, VaultLoader, LevelGeneratorUtils, CrystalChestGenerator, AreaGeneratorBase*/
/*global DungeonGenerator, FEATURE_TYPE, TIMED_GATE_TIME*/
/*global VAULT_PLACEMENT*/
'use strict';

let AreaGeneratorVault = Object.create(AreaGeneratorBase);

// GENERATE:
// Places a vault at the tileIndex by destroying all existing objects and replacing all existing tiles.
// Will create and return a new area.
// Will flag all tiles as belonging to that area.
// ********************************************************************************************
AreaGeneratorVault.generate = function (tileIndex, vaultType, angle = 0, reflect = 0) {
	
	// Load the tileTypeMap:
	let tileTypeMap = vaultType.getTileTypeMap(angle, reflect);
	
	// Place the vault:
	gs.placeTileTypeMap(tileIndex, tileTypeMap);
	
	// Create the Area:
	let area = LevelGeneratorUtils.createArea(tileIndex.x, tileIndex.y, tileIndex.x + tileTypeMap.width, tileIndex.y + tileTypeMap.height);
	
	// Special Flags like isSolidWall:
	this._flagAreaTiles(tileIndex, vaultType, tileTypeMap);
	
	this._addHooksToArea(tileIndex, area, tileTypeMap);
	
	// Custom VaultType Generation:
	if (vaultType.generateFunc) {
		vaultType.generateFunc(area);
	}
    
	// Crystal Chests:
	// Must be after the customGen function in case it stocks the chests:
	this._stockCrystalChests(area);
	
	// Mark as used:
	if (vaultType.isUnique) {
		gs.tempPreviouslySpawnedVaults.push(vaultType.id);
	}
	
	// Setting Area Properties:
	area.areaGenerator = this;
	area.vaultType = vaultType;
	area.vaultAngle = angle;
	area.isVault = true;

	return area;
};

// DRESS_AREA:
// ************************************************************************************************
AreaGeneratorVault.dressArea = function (area) {
	let zoneType = gs.zoneType();
	
	// Pillars:
	if (util.frac() < 0.25) {
		this.placePillars(area);
	}
	
	// Water:
	if (!area.hasLiquid && util.frac() < 0.25 && zoneType.spawnWater) {
		this.placeLiquid(area, gs.tileTypes.Water);
	}
	
	// Lava:
	if (!area.hasLiquid && util.frac() < 0.25 && zoneType.spawnLava) {
		this.placeLiquid(area, gs.tileTypes.Lava);
	}
	
	// Toxic Waste
	if (!area.hasLiquid && util.frac() < 0.25 && zoneType.spawnToxicWaste) {
		this.placeLiquid(area, gs.tileTypes.ToxicWaste);
	}
	
	
	// Insert Vaults:
	this.dressAreaInsertVaults(area);
};

// PLACE_LIQUID:
// ************************************************************************************************
AreaGeneratorVault.placeLiquid = function (area, tileType) {
	let tileTypeMap = area.vaultType.getTileTypeMap(area.vaultAngle);
	
	for (let x = 0; x < tileTypeMap.width; x += 1) {
		for (let y = 0; y < tileTypeMap.height; y += 1) {
			let offsetTileIndex = {x: area.startX + x, y: area.startY + y};
			
			if (tileTypeMap[x][y].floorField && !gs.getTile(offsetTileIndex).mustBeFloor) {
				gs.setTileType(offsetTileIndex, tileType);
			}
		}
	}
	
	area.hasLiquid = true;
};

// PLACE_PILLARS:
// ************************************************************************************************
AreaGeneratorVault.placePillars = function (area) {
	let tileTypeMap = area.vaultType.getTileTypeMap(area.vaultAngle);
	
	// Get the objectType and Frame:
	let pillar = this.getPillarDesc();
	let objectTypeName = pillar.objectTypeName;
	let objectFrame = pillar.objectFrame;
	
	for (let x = 0; x < tileTypeMap.width; x += 1) {
		for (let y = 0; y < tileTypeMap.height; y += 1) {
			let offsetTileIndex = {x: area.startX + x, y: area.startY + y};
				
			if (tileTypeMap[x][y].pillarFlag && !gs.getObj(offsetTileIndex)) {
				gs.setTileType(offsetTileIndex, gs.tileTypes.Floor);
				gs.createObject(offsetTileIndex, objectTypeName, objectFrame);
			}
		}
	}
};

// DRESS_AREA_INSERT_VAULTS:
// ************************************************************************************************
AreaGeneratorVault.dressAreaInsertVaults = function (area) {
	let tileTypeMap = area.vaultType.getTileTypeMap(area.vaultAngle);
	
	for (let i = 0; i < tileTypeMap.insertVaultList.length; i += 1) {
		let insertVaultDesc = tileTypeMap.insertVaultList[i],
			box = insertVaultDesc.box,
			tags = insertVaultDesc.tags,
			valid = true;
		
		// Only place insert vaults 50% of time:
		if (util.frac() > insertVaultDesc.percent) {
			continue;
		}
		
		// Check if floor is valid:
		gs.getIndexListInBox(box).forEach(function (tileIndex) {
			let offsetIndex = {x: tileIndex.x + area.startX, y: tileIndex.y + area.startY};
			
			if (gs.getTile(offsetIndex).type.name !== 'Floor' || gs.getObj(offsetIndex)) {
				valid = false;
			}
		}, this);
		
		// Check if valid back wall:
		if (util.inArray('&BackWall', tags)) {
			if (gs.getIndexListInBox(box.startX, box.startY - 1, box.endX, box.startY).find(function (tileIndex) {
				let offsetIndex = {x: tileIndex.x + area.startX, y: tileIndex.y + area.startY};
				
				return gs.getTile(offsetIndex).type.passable;
			}, this)) {
				valid = false;	
			}
		}
		
		if (!valid) {
			continue;
		}
		
		// Select a valid vault type:
		tags = gs.zoneType().vaultSets.concat(tags);
		let vaultType = gs.getInsertVault(box.width, box.height, tags);
		
		// Place the vault:
		if (vaultType) {
			let tileIndex = {x: area.startX + Math.floor(box.startX + (box.width - vaultType.width) / 2),
							 y: area.startY + Math.floor(box.startY + (box.height - vaultType.height) / 2)};
			
			AreaGeneratorVault.generate(tileIndex, vaultType);
		}
	}
};

// DRESS_AREA_MAJOR_REWARD:
// ************************************************************************************************
AreaGeneratorVault.dressAreaMajorReward = function (area, rewardType, doorType) {
	// KEY_DOOR:
	if (doorType === 'KeyDoor') {
		this._createKeyDoor(area);
	}
	// TIMED_DOOR:
	else if (doorType === 'TimedDoor') {
		this._createTimedDoor(area);
	}
	// SWITCH_DOOR:
	else if (doorType === 'SwitchDoor') {
		this._createSwitchDoor(area);
	}
	
	
	// REWARD:
	let indexList = gs.getIndexListInArea(area);
	indexList = indexList.filter(index => gs.isPassable(index));
	indexList = indexList.filter(index => !gs.getObj(index));
	
	// GOLD:
	if (rewardType === 'Gold') {
		indexList.forEach(function (tileIndex) {
			gs.createFloorItem(tileIndex, Item.createItem('GoldCoin', {amount: gs.dropGoldAmount()}));
		}, this);
	}
	// POTIONS:
	else if (rewardType === 'Potions') {
		indexList = util.randSubset(indexList, util.randInt(2, 3));
		indexList.forEach(function (tileIndex) {
			gs.createRandomFloorItem(tileIndex, 'Potions');
		}, this);
	}
	// SCROLLS:
	else if (rewardType === 'Scrolls') {
		indexList = util.randSubset(indexList, util.randInt(2, 3));
		indexList.forEach(function (tileIndex) {
			gs.createRandomFloorItem(tileIndex, 'Scrolls');
		}, this);
	}
	// FOOD:
	else if (rewardType === 'Food') {
		indexList = util.randSubset(indexList, 2);
		indexList.forEach(function (tileIndex) {
			gs.createFloorItem(tileIndex, Item.createItem('Meat'));
		}, this);
	}
	// TABLE:
	else if (util.inArray(rewardType, ['EnchantmentTable', 'TransferanceTable', 'WellOfWishing', 'FountainOfKnowledge', 'FountainOfGainAttribute',])) {
		let tileIndex = indexList.find(index => gs.getTile(index).tagID === 1);
		gs.createObject(tileIndex, rewardType);
	}
};

// PRIVATE: CREATE_KEY_DOOR:
// ************************************************************************************************
AreaGeneratorVault._createKeyDoor = function (area) {
	// Create Door:
	let doorTileIndex = gs.getIndexListInArea(area).find(index => gs.getObj(index, 'Door'));
	gs.destroyObject(gs.getObj(doorTileIndex));
	gs.createObject(doorTileIndex, 'KeyDoor');

	// Pushing key to the next level if possible:
	if (gs.zoneLevel < gs.zoneType().numLevels) {			
		gs.newLevelFeaturesList.push({
			zoneName: 		gs.zoneName,
			zoneLevel: 		util.randInt(gs.zoneLevel + 1, gs.zoneType().numLevels),
			levelFeature: 	{featureType: FEATURE_TYPE.ITEM, itemTypeName: 'Key'}
		});
	}
	// Pushing key to THIS level:
	else {
		DungeonGenerator.getLevelFeatures(gs.zoneName, gs.zoneLevel).push({
			featureType: FEATURE_TYPE.ITEM,
			itemTypeName: 'Key',
		});
	}
};

// PRIVATE: CREATE_TIMED_DOOR:
// ************************************************************************************************
AreaGeneratorVault._createTimedDoor = function (area) {
	// Create Door:
	let doorTileIndex = gs.getIndexListInArea(area).find(index => gs.getObj(index, 'Door'));
	gs.destroyObject(gs.getObj(doorTileIndex));
	let door = gs.createDoor(doorTileIndex, 'TimedDoor', true);
	
	gs.getIndexListInArea(area).forEach(function (tileIndex) {
		gs.getTile(tileIndex).floorTrigger = {
			toTileIndexList: [{x: doorTileIndex.x, y: doorTileIndex.y}]
		};
	}, this);
		
	// Start the timer:
	door.timer = TIMED_GATE_TIME;
};

// PRIVATE: CREATE_SWITCH_DOOR:
// ************************************************************************************************
AreaGeneratorVault._createSwitchDoor = function (area) {
	// Create Door:
	let doorTileIndex = gs.getIndexListInArea(area).find(index => gs.getObj(index, 'Door'));
	gs.destroyObject(gs.getObj(doorTileIndex));
	gs.createObject(doorTileIndex, 'SwitchDoor');

	// Close tiles early (so switch doesn't get spawned in here):
	gs.getIndexListInArea(area).forEach(function (tileIndex) {
		gs.getTile(tileIndex).isClosed = true;
	}, this);

	// Push a switch somewhere else on the level:
	gs.levelFeatures.push({
		featureType: FEATURE_TYPE.SWITCH,
		toTileIndex: {x: doorTileIndex.x, y: doorTileIndex.y}
	});
};


// PRIVATE: STOCK_CRYSTAL_CHESTS:
// ************************************************************************************************
AreaGeneratorVault._stockCrystalChests = function (area) {
	// Get all Crystal Chests in the area:
	let chestList = gs.objectList.filter(obj => gs.getArea(obj.tileIndex) === area && obj.type.name === 'CrystalChest');
	
	// No Crystal Chests in area:
	if (chestList.length === 0) {
		return;
	}
	
	// Crystal Chests were already stocked (likely in custom vaultGen func):
	if (chestList.find(chest => chest.item)) {
		return;
	}
	
	CrystalChestGenerator.stockCrystalChests(area);
};

// PRIVATE: FLAG_AREA_TILES:
// ************************************************************************************************
AreaGeneratorVault._flagAreaTiles = function (tileIndex, vaultType, tileTypeMap) {
	for (let x = 0; x < tileTypeMap.width; x += 1) {
		for (let y = 0; y < tileTypeMap.height; y += 1) {
			let offsetIndex = {x: tileIndex.x + x, y: tileIndex.y + y};
			
			// Skip if the vault did not place tiles here:
			if (tileTypeMap[x][y].f === -1) {
				continue;
			}
			
			// Pre-Caves always flag their wall tiles solid:
			if (vaultType.placementType === VAULT_PLACEMENT.PRE_CAVE) {
				if (!gs.isStaticPassable(offsetIndex)) {
					gs.getTile(offsetIndex).isSolidWall = true;
				}
			}
			
			// Side-Rooms flag their walls solid (as long as not over)
			if (vaultType.placementType === VAULT_PLACEMENT.SIDE) {
				if (!gs.isStaticPassable(offsetIndex) && !tileTypeMap[x][y].areaWallMask && !tileTypeMap[x][y].overWriteMask) {
					gs.getTile(offsetIndex).isSolidWall = true;
				}
			}
		}
	}
};

// PRIVATE: ADD_HOOKS_TO_AREA:
AreaGeneratorVault._addHooksToArea = function (tileIndex, area, tileTypeMap) {
	for (let x = 0; x < tileTypeMap.width; x += 1) {
		for (let y = 0; y < tileTypeMap.height; y += 1) {
			let offsetIndex = {x: tileIndex.x + x, y: tileIndex.y + y};
			
			if (tileTypeMap[x][y].hasHallHook) {
				area.hallHookTileIndexList.push(offsetIndex);
			}
			
			if (tileTypeMap[x][y].hasPortalHook) {
				if (!area.portalHookTileIndexList) {
					area.portalHookTileIndexList = [];
				}
				
				area.portalHookTileIndexList.push(offsetIndex);
			}
		}
	}
};


