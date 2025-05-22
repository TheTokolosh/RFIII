/*global game, gs, console, util, fs*/
/*global Item, ItemGenerator, VaultTypeLoader*/
/*global dungeonTunnelsGenerator, pitPathGenerator, templateFortressGenerator, cryptTemplateGenerator, sewerTemplateGenerator, hallRoomsGenerator*/
/*global TILE_SIZE, SCALE_FACTOR*/
/*jshint esversion: 6*/
'use strict';

let VAULT_SET = {
	_General:				'_General',
	_Dungeon:				'_Dungeon',
	_Tier3:					'_Tier3',
	THE_UPPER_DUNGEON:		'TheUpperDungeon',
	THE_UNDER_GROVE:		'TheUnderGrove',
	THE_SUNLESS_DESERT:		'TheSunlessDesert',
	THE_SWAMP:				'TheSwamp',
	THE_ORC_FORTRESS:		'TheOrcFortress',
	THE_DARK_TEMPLE:		'TheDarkTemple',
	THE_SEWERS:				'TheSewers',
	THE_ICE_CAVES:			'TheIceCaves',
	THE_CORE:				'TheCore',
	THE_ARCANE_TOWER:		'TheArcaneTower',
	THE_CRYPT:				'TheCrypt',
	THE_IRON_FORGE:			'TheIronForge',
	THE_VAULT_OF_YENDOR:	'TheVaultOfYendor',	
};

let VAULT_PLACEMENT = {
	// NEW:
	SOLID:		'Solid',
	OPEN:		'Open',
	SIDE:		'Side',
	PRE_CAVE:	'PreCave',
	MAJOR_CAVE:	'MajorCave',
	MAJOR: 		'Major',
	LEVEL: 		'Level',
	SPECIAL:	'Special',
	
	// CONNECTED_TUNNELS:
	ONE_WAY:	'OneWay',
	STRAIGHT:	'Straight',
	CORNER:		'Corner',
	THREE_WAY:	'ThreeWay',
	FOUR_WAY:	'FourWay',
	
	// OLD:
	INSERT: 	'INSERT',
	
};

let VAULT_CONTENT = {
	CHALLENGE:				'Challenge',
	MAJOR_REWARD:			'MajorReward',
	AESTHETIC:				'Aesthetic',
	BOSS:					'Boss',
	SPECIAL:				'Special', // Placed by Level-Generators via some special code
	END_LEVEL: 				'EndLevel',
	ZONE_LINE:				'ZoneLine',
	LIBRARY:				'Library',
	MERCHANT:				'Merchant',
	SHRINE_OF_STRENGTH: 	'ShrineOfStrength',
	SHRINE_OF_INTELLIGENCE: 'ShrineOfIntelligence',
	SHRINE_OF_DEXTERITY:	'ShrineOfDexterity',
};

// VAULT_TYPE:
// ************************************************************************************************
function VaultType (name) {
	this.id = VaultTypeLoader.nextVaultTypeId;
	VaultTypeLoader.nextVaultTypeId += 1;
	
	this.name = name;
	this.vaultSet = null;
	this.contentType = null;
	this.placementType = null;
	this.generateFunc = null;
	this.vaultTags = [];
	
	this.width = 0;
	this.height = 0;
	this.allowRotate = true;
	this.orientationAngle = 0;
	this.isUnique = false;
	this.allowStairs = true;
	this.toZoneName = null;
	this.toZoneLevel = null;
	this.noReeds = false;
	this.noMobSpawn = false;
	
	// Contents:
	this.npcTypeNameList = []; // Holds a list of npcTypeNames included in the vault
	this.itemTypeNameList = []; // Holds a list of itemTypeNames included in the vault
	this.bossName = null;
	this.hasWater = false; // Will only be true if the vault has non-floorField water
	this.isZoo = false;
	this.isDropWallRoom = false;
	this.totalNPCExp = 0; // The total exp from all npcs
	this.dangerLevel = 0; // The XL of the highest level npc
	
	// Combined Vault Sets:
	this.isCombinedVaultSet = false;
	this.fileName = null;
	this.box = null;
	
	
	Object.seal(this);
}

// PARSE_COMBINED_VAULT:
// ************************************************************************************************
VaultType.prototype.parseCombinedVault = function () {
	this.width = this.box.width;
	this.height = this.box.height;	
};

// PARSE_SINGLE_VAULT:
// ************************************************************************************************
VaultType.prototype.parseSingleVault = function () {
	var data = this.getData();
		
	// Properties:
	this.width = data.width;
	this.height = data.height;	
	this.allowRotate = data.properties.allowRotate;
	this.noReeds = data.properties.noReeds;
	this.noMobSpawn = data.properties.noMobSpawn;

	// Orientation Angle:
	if (data.properties.hasOwnProperty('orientationAngle')) {
		this.orientationAngle = data.properties.orientationAngle;

		// Warning:
		if (this.allowRotate) {
			console.log('WARNING - vaultType: ' + this.name + ' has allowRotate AND orientationAngle!');
		}
	}
};

// PARSE_DATA:
// ************************************************************************************************
VaultType.prototype.parseData = function () {
	
	if (this.isCombinedVaultSet) {
		this.parseCombinedVault();
	}
	else {
		this.parseSingleVault();
	}
	
	let tileTypeMap = gs.getTileTypeMap(this);
	let maxXL = -1; // The max XL of monsters in the vault
	
	// Dimensions:
	let minX = 1000;
	let minY = 1000;
	let maxX = 0;
	let maxY = 0;
	
	for (let x = 0; x < this.width; x += 1) {
		for (let y = 0; y < this.height; y += 1) {
			// Identifying dimensions:
			if (tileTypeMap[x][y].obj || tileTypeMap[x][y].f !== -1 || tileTypeMap[x][y].areaWallMask) {
				minX = Math.min(x, minX);
				minY = Math.min(y, minY);
				maxX = Math.max(x, maxX);
				maxY = Math.max(y, maxY);
			}
			
			// Debug Identify Tile-Frame:
			if (gs.debugProperties.idVaultsWithTileFrame && tileTypeMap[x][y].f === gs.debugProperties.idVaultsWithTileFrame) {
				if (!util.inArray(this.name, gs.debugProperties.idVaultsList)) {
					console.log('IDENTIFIED TILE FRAME IN: ' + this.name);
					gs.debugProperties.idVaultsList.push(this.name);
				}
				
			}
			// Debug Identify Tile-Type:
			if (gs.debugProperties.idVaultsWithTileType && gs.getNameFromFrame(tileTypeMap[x][y].f, gs.tileTypes) === gs.debugProperties.idVaultsWithTileType) {
				if (!util.inArray(this.name, gs.debugProperties.idVaultsList)) {
					console.log('IDENTIFIED TILE TYPE IN: ' + this.name);
					gs.debugProperties.idVaultsList.push(this.name);
				}
			}
			// Debug Identify Object-Frame:
			if (gs.debugProperties.idVaultsWithObjectFrame && tileTypeMap[x][y].obj && tileTypeMap[x][y].obj.frame === gs.debugProperties.idVaultsWithObjectFrame) {
				if (!util.inArray(this.name, gs.debugProperties.idVaultsList)) {
					console.log('IDENTIFIED OBJECT FRAME IN: ' + this.name);
					gs.debugProperties.idVaultsList.push(this.name);
				}
				
			}
			// Debug Identify Object-Type:
			if (gs.debugProperties.idVaultsWithObjectType && tileTypeMap[x][y].obj && tileTypeMap[x][y].obj.type.name === gs.debugProperties.idVaultsWithObjectType) {
				if (!util.inArray(this.name, gs.debugProperties.idVaultsList)) {
					console.log('IDENTIFIED OBJECT TYPE IN: ' + this.name);
					gs.debugProperties.idVaultsList.push(this.name);
				}
				
			}
			// Debug Identify NPC-Type:
			if (gs.debugProperties.idVaultsWithNPCType && tileTypeMap[x][y].npcTypeName === gs.debugProperties.idVaultsWithNPCType) {
				if (!util.inArray(this.name, gs.debugProperties.idVaultsList)) {
					console.log('IDENTIFIED NPC TYPE IN: ' + this.name);
					gs.debugProperties.idVaultsList.push(this.name);
				}
				
			}
			
			// Portal Validation:
			if (tileTypeMap[x][y].obj && tileTypeMap[x][y].obj.toTileIndexList) {
				tileTypeMap[x][y].obj.toTileIndexList.forEach(function (tileIndex) {
					if (tileIndex.x < 0 || tileIndex.y < 0 || tileIndex.x >= this.width || tileIndex.y >= this.height) {
						console.log('WARNING: ' + this.name + ' has an invalid portal toTileIndexList');
					}
				}, this);
			}
			
			// Floor Trigger Validation:
			if (tileTypeMap[x][y].floorTrigger && tileTypeMap[x][y].floorTrigger.toTileIndexList) {
				tileTypeMap[x][y].floorTrigger.toTileIndexList.forEach(function (tileIndex) {
					if (tileIndex.x < 0 || tileIndex.y < 0 || tileIndex.x >= this.width || tileIndex.y >= this.height) {
						console.log('WARNING: ' + this.name + ' has an invalid floorTrigger toTileIndexList');
					}
				}, this);
			}
			
			// Reward Hook Validation:
			if (tileTypeMap[x][y].rewardHook && tileTypeMap[x][y].rewardHook.toTileIndexList) {
				tileTypeMap[x][y].rewardHook.toTileIndexList.forEach(function (tileIndex) {
					if (tileIndex.x < 0 || tileIndex.y < 0 || tileIndex.x >= this.width || tileIndex.y >= this.height) {
						console.log('WARNING: ' + this.name + ' has an invalid rewardHook toTileIndexList');
					}
				}, this);
			}
			
			// Conveyor Belt Validation:
			if (tileTypeMap[x][y].obj && tileTypeMap[x][y].obj.type.niceName === 'Conveyor Belt') {
				// Left:
				if (x > 0 && tileTypeMap[x - 1][y].obj && tileTypeMap[x - 1][y].obj.type.niceName === 'Conveyor Belt') {
					if (tileTypeMap[x][y].obj.type.name !== tileTypeMap[x - 1][y].obj.type.name) {
						console.log('WARNING: ' + this.name + ' has invalid adjacent conveyor belts');
					}
				}
				
				// Right:
				if (x < this.width - 1 && tileTypeMap[x + 1][y].obj && tileTypeMap[x + 1][y].obj.type.niceName === 'Conveyor Belt') {
					if (tileTypeMap[x][y].obj.type.name !== tileTypeMap[x + 1][y].obj.type.name) {
						console.log('WARNING: ' + this.name + ' has invalid adjacent conveyor belts');
					}
				}
				
				// Up:
				if (y > 0 && tileTypeMap[x][y - 1].obj && tileTypeMap[x][y - 1].obj.type.niceName === 'Conveyor Belt') {
					if (tileTypeMap[x][y].obj.type.name !== tileTypeMap[x][y - 1].obj.type.name) {
						console.log('WARNING: ' + this.name + ' has invalid adjacent conveyor belts');
					}
				}
				
				// Down:
				if (y < this.height - 1 && tileTypeMap[x][y + 1].obj && tileTypeMap[x][y + 1].obj.type.niceName === 'Conveyor Belt') {
					if (tileTypeMap[x][y].obj.type.name !== tileTypeMap[x][y + 1].obj.type.name) {
						console.log('WARNING: ' + this.name + ' has invalid adjacent conveyor belts');
					}
				}
			}
			
			// Zoo:
			if (tileTypeMap[x][y].obj && tileTypeMap[x][y].obj.type.name === 'GlyphDoor') {
				this.isZoo = true;
			}
			
			// Drop Wall:
			if (tileTypeMap[x][y].isStandardDropWall || tileTypeMap[x][y].isTriggeredDropWall) {
				this.isDropWallRoom = true;
			}
			
			// Zone Lines:
			if (tileTypeMap[x][y].obj && tileTypeMap[x][y].obj.toZoneName) {
				this.toZoneName = tileTypeMap[x][y].obj.toZoneName;
				this.toZoneLevel = tileTypeMap[x][y].obj.toZoneLevel;
			}
			
			// Items:
			if (tileTypeMap[x][y].itemTypeName) {
				let itemType = gs.itemTypes[tileTypeMap[x][y].itemTypeName];
				
				if (!itemType) {
					console.log('WARNING: ' + this.name + ' has an invalid itemType: ' + tileTypeMap[x][y].itemTypeName);
				}
				
				// Add to list of items:
				if (!util.inArray(itemType.name, this.itemTypeNameList)) {
					this.itemTypeNameList.push(itemType.name);
				}
			}
				
			// NPCs:
			if (tileTypeMap[x][y].npcTypeName) {
				let npcType = gs.npcTypes[tileTypeMap[x][y].npcTypeName];
			
				// Detecting max XL:
				maxXL = Math.max(maxXL, npcType.level);

				// Add to list of npcs:
				if (!util.inArray(npcType.name, this.npcTypeNameList)) {
					this.npcTypeNameList.push(npcType.name);
				}
				
				// Adding to totalNPCExp
				this.totalNPCExp += gs.NPCTypeExp(npcType.name);

				// Detecting Bosses:
				if (npcType.isBoss) {
					// Store the boss name as part of the vault:
					this.bossName = npcType.name;

					// Set contentType to Boss:
					if (this.contentType !== VAULT_CONTENT.END_LEVEL) {
						this.contentType = VAULT_CONTENT.BOSS;
					}

					// Bosses w/ a vault will only spawn in the vault
					if (this.name !== '_Debug/TestLevel/TestLevel01') {
						npcType.hasVault = true;
					}
				}
			}
		}
	}
	
	// Dimensions:
	if (util.inArray(this.placementType, [VAULT_PLACEMENT.SOLID, VAULT_PLACEMENT.SIDE, VAULT_PLACEMENT.OPEN, VAULT_PLACEMENT.PRE_CAVE])) {
		this.width = maxX - minX + 1;
		this.height = maxY - minY + 1;
		
		if (this.isCombinedVaultSet) {
			this.box = util.createBox(this.box.startX + minX, this.box.startY + minY, this.box.startX + maxX + 1, this.box.startY + maxY + 1);
		}
	}
	
	
	// If the dangerLevel was alreadys set (in the vault file) we don't need to set it here:
	// This allows vaults to contain out-of-range monsters
	if (!this.dangerLevel) {
		this.dangerLevel = maxXL;
	}
	
	
	// No DL restriction on bosses:
	if (this.bossName) {
		this.dangerLevel = -1;
	}
	
	// No DL restriction on zonelines:
	if (this.contentType === VAULT_CONTENT.ZONE_LINE) {
		this.dangerLevel = -1;
	}
	
		// MAJOR:
	if (this.placementType === VAULT_PLACEMENT.MAJOR) {
		this.isUnique = true;
	}
	
	// MAJOR-REWARD-VAULTS:
	if (this.contentType === VAULT_CONTENT.MAJOR_REWARD) {
		this.allowStairs = false;
	}
	
	// MAJOR-REWARD-VAULTS:
	if (this.contentType === VAULT_CONTENT.ZONE_LINE) {
		this.allowStairs = false;
	}
	
	// BOSS-VAULTS:
	if (this.contentType === VAULT_CONTENT.BOSS) {
		this.allowStairs = false;
	}
	
	// CHALLENGE_VAULTS:
	if (this.contentType === VAULT_CONTENT.CHALLENGE) {
		this.isUnique = true;
		this.allowStairs = false;
	}

	// LEVEL:
	if (this.placementType === VAULT_PLACEMENT.LEVEL) {
		this.isUnique = true;
		this.allowStairs = true;
	}
};

// GET_DATA:
// Returns the raw file data of the VaultType:
// ************************************************************************************************
VaultType.prototype.getData = function () {
	let data;
	if (this.isCombinedVaultSet) {
		data = game.cache.getJSON(this.fileName);
	}
	else {
		data = game.cache.getJSON(this.name);
	}
	
	if (!data) {
		throw 'ERROR [VaultType.getData()] - json data failed to load for vaultType: ' + this.name;
	}
	
	return data;
};

// GET_TILE_TYPE_MAP:
// ************************************************************************************************
VaultType.prototype.getTileTypeMap = function (rotate, reflect) {
	return gs.getTileTypeMap(this, rotate, reflect);
};

// GET_MASK:
// Returns a 2D array in which a 1 indicates part of the vault and 0 indicates empty space.
// 2 Indicates an areaWall overlap (for side rooms)
// Can handle rotation by an angle (default 0)
// ************************************************************************************************
VaultType.prototype.getMask = function (angle) {
	// Load and rotate the vault:
	let tileTypeMap = this.getTileTypeMap(angle);
	
	// Create vaultMask with a 1 wherever there is a frame:
	let vaultMask = util.create2DArray(tileTypeMap.width, tileTypeMap.height, function (x, y) {
		if (tileTypeMap[x][y].overWriteMask) {
			return 0;
		}
		else if (tileTypeMap[x][y].areaWallMask) {
			return 2;
		}
		else if (tileTypeMap[x][y].f !== -1) {
			return 1;
		}
		else {
			return 0;
		}
	}, this);
	
	vaultMask.width = tileTypeMap.width;
	vaultMask.height = tileTypeMap.height;
	
	return vaultMask;
};

// IS_VALID_FOR_MAX_SIZE:
// Must be smaller than maxSize and larger than maxSize / 2
// Handles allowRotate
// ************************************************************************************************
VaultType.prototype.isValidForMaxSize = function (maxSize) {
	return this.getAngleForMaxSize(maxSize) !== null;
};

// GET_ANGLE_FOR_MAX_SIZE:
// Returns the angle required for the vaultType to fit maxSize
// ************************************************************************************************
VaultType.prototype.getAngleForMaxSize = function (maxSize) {
	let angleList = [],
		maxWidth = maxSize.width,
		maxHeight = maxSize.height;
	
	/*
	let minWidth = Math.ceil(maxSize.width / 2),
		minHeight = Math.ceil(maxSize.height / 2);
	*/
	// Nov-27-2020 - no min size:
	let minWidth = 1;
	let minHeight = 1;
	
	// Fits unrotated:
	if (this.width >= minWidth && this.height >= minHeight && this.width <= maxWidth && this.height <= maxHeight) {
		angleList.push(0);
		
		if (this.allowRotate) {
			angleList.push(180);
		}
	}
	
	// Rotatable Vaults:
	if (this.allowRotate && this.height >= minWidth && this.width >= minHeight && this.height <= maxWidth && this.width <= maxHeight) {
		angleList.push(90);
		angleList.push(270);
	}
	
	return angleList.length > 0 ? util.randElem(angleList) : null;
}; 

// GET_VAULT_TYPE:
// ************************************************************************************************
gs.getVaultType = function (name) {
	let vaultType;
	
	if (typeof name === 'number') {
		vaultType = this.vaultTypeList.find(vaultType => vaultType.id === name);
	}
	else {
		vaultType = this.vaultTypeList.find(vaultType => vaultType.name === name);
	}
	
		
	if (!vaultType) {
		throw 'ERROR [gs.getVaultType] - not a valid vaultTypeName: ' + name;
	}
	
	return vaultType;
};

// GET_VAULT_TYPE_LIST:
// Will filter unique vaults, dangerLevel, and pits on last levels
// ************************************************************************************************
gs.getVaultTypeList = function (vaultSet = null) {
	var list = this.vaultTypeList;
	
	// Specified vaultSet:
	if (vaultSet) {
		list = list.filter(vaultType => vaultType.vaultSet === vaultSet);
	}
	// Default ZoneType.vaultSets:
	else {
		list = list.filter(vaultType => util.inArray(vaultType.vaultSet, gs.zoneType().vaultSets));
	}
	
	// Unique Vaults:
	// Filter out unique vaults that have previously spawned.
	let previouslySpawnedVaults = gs.previouslySpawnedVaults.concat(gs.tempPreviouslySpawnedVaults);
	list = list.filter(vaultType => !vaultType.isUnique || !util.inArray(vaultType.id, previouslySpawnedVaults));
	
	// Unique Items:
	// Filter out vaults containing items that have previously spawned.
	list = list.filter(function (vaultType) {
		// No filter here:
		if (vaultType.itemTypeNameList.length === 0) {
			return true;
		}
		// Check if items have previously generated:
		else {
			let hasNotSpawned = true;
			
			vaultType.itemTypeNameList.forEach(function (itemTypeName) {
				if (Item.isUniqueItem(itemTypeName) && gs.previouslySpawnedItemList.concat(gs.tempPreviouslySpawnedItemList).find(e => e === itemTypeName)) {
					hasNotSpawned = false;
				}
			}, this);
			
			return hasNotSpawned;
		}
	}, this);
	
    // Danger Vault:
	// Filter out vaults with danger levels that are to high.
	list = list.filter(function (vaultType) {
		let maxDL = gs.dangerLevel() + 1;
		
		if (gs.zoneName === 'TheUpperDungeon' && gs.zoneLevel === 1) {
			maxDL = gs.dangerLevel();
		}
		
		return vaultType.contentType === VAULT_CONTENT.BOSS
			|| vaultType.dangerLevel === -1
			|| (vaultType.dangerLevel <= maxDL);
	});

	// Filter out pits on last level:
	if (gs.zoneLevel === gs.zoneType().numLevels) {
		list = list.filter(vaultType => !vaultType.hasPits);
	}
	
	// UpperDungeon:1
	if (gs.zoneName === 'TheUpperDungeon' && gs.zoneLevel === 1) {
		list = list.filter(vaultType => !vaultType.isZoo && !vaultType.isDropWallRoom);
	}
	
	
	return list;
};

// GET_INSERT_VAULT:
// ************************************************************************************************
gs.getInsertVault = function (width, height, tags) {
	var list = this.vaultTypeList,
		andTags = [],
		orTags = [];
	
	tags.forEach(function (tag) {
		if (tag.charAt(0) === '&') {
			andTags.push(tag.substr(1, tag.length));
		}
		else if (tag.charAt(0) === '|') {
			orTags.push(tag.substr(1, tag.length));
		}
		else {
			orTags.push(tag);
		}
	}, this);
	
	list = list.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.INSERT);
	
	list = list.filter(vaultType => vaultType.width <= width && vaultType.height <= height);
	
	// Test OR tags:
	list = list.filter(vaultType => util.arrayIntersect(orTags, vaultType.tags).length > 0);
	
	// Test AND tags:
	list = list.filter(vaultType => util.arrayIntersect(andTags, vaultType.tags).length === andTags.length);
	
	return list.length > 0 ? util.randElem(list) : null;
};
