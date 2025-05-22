/*global gs, game, console, util*/
/*global MonsterSpawner, levelController, Item, FrameSelector, baseGenerator, AreaGeneratorVault, ItemGenerator, LevelGeneratorUtils*/
/*global TILE_SIZE, SCALE_FACTOR, FACTION*/
/*global NUM_TILES_X, NUM_TILES_Y*/
/*jshint esversion: 6, loopfunc: true*/
'use strict';

// LOAD_JSON_LEVEL:
// Load a level from a .json file
// ************************************************************************************************
gs.loadJSONLevel = function (levelName) {	
	let vaultType = gs.getVaultType(levelName);
	
	// Initial Fill:
	this.initiateTileMap();
	
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	AreaGeneratorVault.generate({x: 0, y: 0}, vaultType);
};

// SAVE_LEVEL:
// ************************************************************************************************
gs.saveLevel = function () {	
    let data = {};
	
	// Level Data:
    data.numTilesX = this.numTilesX;
	data.numTilesY = this.numTilesY;
	data.levelController = levelController.toData();
	data.lastTurn = this.turn;
	data.miscLevelData = this.miscLevelData;
	
	// Save tile map:
    data.tileMap = [];
    for (let x = 0; x < this.numTilesX; x += 1) {
        data.tileMap[x] = [];
        for (let y = 0; y < this.numTilesY; y += 1) {
            // Save Tile:
			data.tileMap[x][y] = {
				f: this.tileMap[x][y].frame,
			};
			
			// Optional Data (defaults to false on load):
			if (this.tileMap[x][y].explored)		data.tileMap[x][y].e = 1;
			if (this.tileMap[x][y].isClosed)		data.tileMap[x][y].c = 1;
			if (this.tileMap[x][y].tagID) 			data.tileMap[x][y].t = this.tileMap[x][y].tagID;
			
			if (this.tileMap[x][y].isTriggeredDropWall) {
				data.tileMap[x][y].isTriggeredDropWall = true;
			}
            
            if (this.tileMap[x][y].isStandardDropWall) {
				data.tileMap[x][y].isStandardDropWall = true;
			}
			
			if (this.tileMap[x][y].isDropWallRoom) {
				data.tileMap[x][y].isDropWallRoom = true;
			}
			
			// Save Objects:
			// Note: placedByPlayer is used by the BearTrap talent.
			if (this.getObj(x, y) && !this.getObj(x, y).placedByPlayer) {
				data.tileMap[x][y].obj = this.getObj(x, y).toData();
			}
			
			// Save Floor Triggers:
			if (this.tileMap[x][y].floorTrigger) {
				data.tileMap[x][y].floorTrigger = this.tileMap[x][y].floorTrigger;
			}
			// Save spawnNPC:
			if (this.tileMap[x][y].spawnNPCName) {
				data.tileMap[x][y].spawnNPCName = this.tileMap[x][y].spawnNPCName;
				data.tileMap[x][y].spawnNPCIsAgroed = this.tileMap[x][y].spawnNPCIsAgroed;
			}
			
        }
    }
	
	// Save npcs
    data.npcs = [];
	this.getAllNPCs().forEach(function (npc) {
		data.npcs.push(npc.toData());
	}, this);
    
	// Save Clouds:
	data.clouds = [];
	this.cloudList.forEach(function (cloud) {
		if (cloud.isAlive) {
			data.clouds.push(cloud.toData());
		}
	}, this);
	
    // Save items:
    data.items = [];
    for (let i = 0; i < this.floorItemList.length; i += 1) {
        if (this.floorItemList[i].isAlive) {
            data.items.push(this.floorItemList[i].toData());
        }
    }

	// Write the actual file:
    util.writeFile(this.zoneName + this.zoneLevel, JSON.stringify(data));
};

// RELOAD_LEVEL:
// Load previously saved level:
// ************************************************************************************************
gs.reloadLevel = function (zoneName, zoneLevel) {
    let data = util.readFile(zoneName + zoneLevel);
	
	this.numTilesX = data.numTilesX;
	this.numTilesY = data.numTilesY;
	this.miscLevelData = data.miscLevelData;
	
	levelController.loadData(data.levelController);
	
	

	// Create tile map:
	this.initiateTileMap();
	this.placeTileTypeMap({x: 0, y: 0}, data.tileMap);
	
    // load NPCs:
    for (let i = 0; i < data.npcs.length; i += 1) {
		this.loadNPC(data.npcs[i]);		
    }
    
	// Load Clouds:
	for (let i = 0; i < data.clouds.length; i += 1) {
		this.loadCloud(data.clouds[i]);
	}
	
    // Load Items:
    for (let i = 0; i < data.items.length; i += 1) {
		this.loadFloorItem(data.items[i]);
    }
	
	this.lastTurn = data.lastTurn;
};

// CAN_RELOAD_LEVEL:
// Can load previously saved level:
// ************************************************************************************************
gs.canReloadLevel = function (zoneName, zoneLevel) {
	return util.doesFileExist(zoneName + zoneLevel);
};

// PLACE_TILE_TYPE_MAP:
// Given a tileTypeMap object, fill the tilemap with tiles and objects
// This function DOES NOT create NPCs
// This function DOES NOT create items
// ************************************************************************************************
gs.placeTileTypeMap = function (startTileIndex, tileTypeMap) {
    var numTilesX = tileTypeMap.length,
		numTilesY = tileTypeMap[0].length,
		obj;
	
	if (startTileIndex.x < 0 || 
		startTileIndex.y < 0 || 
		startTileIndex.x + tileTypeMap.width > this.numTilesX ||
		startTileIndex.y + tileTypeMap.height > this.numTilesY) {
		console.log(tileTypeMap.vaultType);
		console.log('startTileIndex: ' + startTileIndex.x + ', ' + startTileIndex.y);
		console.log('width: ' + tileTypeMap.width);
		console.log('height: ' + tileTypeMap.height);
		throw 'out of bounds';
	}
	
	// Place Tiles:
    for (let x = 0; x < numTilesX; x += 1) {
        for (let y = 0; y < numTilesY; y += 1) {
			let tileIndex = {x: startTileIndex.x + x, y: startTileIndex.y + y};
			let tileData = tileTypeMap[x][y];
			
			// Tile Type:
			// a frame of -1 is used by vaults to indicate no tile placement
			// Note how we include tile properties in this test so that vaults don't overwrite closed, solid etc flags w/ their null tiles
			if (tileData.f !== -1) {
				let tileType = this.tileTypes[this.getNameFromFrame(tileData.f, this.tileTypes)];
				
				if (!tileType) {
					console.log(tileIndex);
					console.log('frame: ' + tileData.f);
				}
				
				this.setTileType(tileIndex, tileType);
				this.getTile(tileIndex).frame = tileData.f;
			}
			
			// Tile Properties:
			let tile = this.getTile(tileIndex);
			
			tile.explored = 		tileData.e || false;
			tile.isClosed = 		tileData.c || false;
			tile.tagID =			tileData.t || 0;
			
			tile.isTriggeredDropWall = tileData.isTriggeredDropWall || false;
            tile.isStandardDropWall = tileData.isStandardDropWall || false;
			tile.isDropWallRoom = tileData.isDropWallRoom || false;
			
			// Solid wall:
			if (tileData.s) {
				tile.isSolidWall = true;
			}
			
			// Drop Walls are set solid to stop accidental tunneling:
			if (tile.isTriggeredDropWall || tile.isStandardDropWall || tileData.overWriteMask || tileData.areaWallMask) {
				tile.isSolidWall = true;
			}
			
			// Drop Wall Rooms are closed by default:
			if (tile.isDropWallRoom) {
				tile.isClosed = true;
			}
			
			// Stairs are closed by default:
			if (tile.type.name === 'Steps') {
				tile.isClosed = true;
			}
		}
	}
	
	// Place Objects:
	for (let x = 0; x < numTilesX; x += 1) {
        for (let y = 0; y < numTilesY; y += 1) {
			let tileIndex = {x: startTileIndex.x + x, y: startTileIndex.y + y};
			let tileData = tileTypeMap[x][y];
			
			// Objects:
			if (tileData.obj) {
				let typeName = gs.getNameFromFrame(tileData.obj.typeFrame, gs.objectTypes);
				
				// Only place on passable tiles unless a passable tile in front (a front facing wall) :
				if (typeName === 'Portal' || gs.getTile(tileIndex).type.passable || (tileIndex.y < NUM_TILES_Y - 1 && gs.getTile(tileIndex.x, tileIndex.y + 1).type.passable)) {
					// Offset toTileIndexList:
					if (tileData.obj.toTileIndexList) {
						tileData.obj.toTileIndexList.forEach(function (toTileIndex) {
							toTileIndex.x = toTileIndex.x + startTileIndex.x;
							toTileIndex.y = toTileIndex.y + startTileIndex.y;
						}, this);
					}

					// Loading the object:
					gs.loadObj(tileIndex, tileData.obj);
				}
				
			}
			
			// Clouds:
			if (tileData.cloudTypeName) {
				gs.createCloud(tileIndex, tileData.cloudTypeName, 0, 10000);
			}
			
			// Floor Triggers:
			if (tileData.floorTrigger) {
				// Offset toTileIndexList:
				if (tileData.floorTrigger.toTileIndexList) {
					tileData.floorTrigger.toTileIndexList.forEach(function (toTileIndex) {
						toTileIndex.x = toTileIndex.x + startTileIndex.x;
						toTileIndex.y = toTileIndex.y + startTileIndex.y;
					}, this);
				}
				
				// Creating the floor trigger:
				this.getTile(tileIndex).floorTrigger = {toTileIndexList: tileData.floorTrigger.toTileIndexList};
			}
			
			// Reward Hooks Triggers:
			if (tileData.rewardHook) {
				
				// Offset toTileIndexList:
				if (tileData.rewardHook.toTileIndexList) {
					tileData.rewardHook.toTileIndexList.forEach(function (toTileIndex) {
						toTileIndex.x = toTileIndex.x + startTileIndex.x;
						toTileIndex.y = toTileIndex.y + startTileIndex.y;
					}, this);
				}
				
				// Create Reward Hook:
				this.getTile(tileIndex).rewardHook = {
					tileIndex: {x: tileIndex.x, y: tileIndex.y},
					toTileIndexList: tileData.rewardHook.toTileIndexList
				};
				
				this.getTile(tileIndex).isClosed = true;
			}
			
			// Special Rewards:
			if (tileData.specialReward) {
				let choice = util.chooseRandom([
					{percent: 30, name: 'FountainOfGainAttribute'},
					{percent: 30, name: 'EnchantmentTable'},
					{percent: 20, name: 'WellOfWishing'},
					{percent: 20, name: 'FountainOfKnowledge'},
					
				]);
				
				gs.createObject(tileIndex, choice);
			}
			
			// Item:
			if (tileData.itemTypeName) {
				gs.createFloorItem(tileIndex, Item.createItem(tileData.itemTypeName));
				
				if (Item.isUniqueItem(tileData.itemTypeName)) {
					gs.tempPreviouslySpawnedItemList.push(tileData.itemTypeName);
				}
			}
			
			// Item Flag:
			if (tileData.itemDropTableName) {
				let itemTypeName = ItemGenerator.getRandomItemName(tileData.itemDropTableName);
				gs.createFloorItem(tileIndex, Item.createItem(itemTypeName));
			}
			
			// NPC Spawn:
			if (tileData.spawnNPCName) {
				gs.getTile(tileIndex).spawnNPCName = tileData.spawnNPCName;
				gs.getTile(tileIndex).spawnNPCIsAgroed = tileData.spawnNPCIsAgroed;
				gs.getTile(tileIndex).isClosed = true;
			}
        }
    }
	
	// PLACE_MONSTERS:
	if (gs.zoneName === 'TestZone' || (gs.debugProperties.spawnStaticMobs && gs.debugProperties.spawnMobs)) {
		for (let x = 0; x < numTilesX; x += 1) {
			for (let y = 0; y < numTilesY; y += 1) {
				let npc;
				let tileIndex = {x: startTileIndex.x + x, y: startTileIndex.y + y};
				let tileData = tileTypeMap[x][y];


				// NPC (Given a specific NPC type):
				if (tileData.npcTypeName) {
					npc = gs.createNPC(tileIndex, tileData.npcTypeName);
					
					if (tileData.npcClassType) {
						npc.npcClassType = gs.npcClassTypes[tileData.npcClassType];
					}

					if (tileData.npcIsAlly) {
						npc.faction = FACTION.PLAYER;
					}
				}

				// NPC (Given an npcTypeList):
				if (tileData.npcTypeList) {
					npc = gs.createNPC(tileIndex, util.randElem(tileData.npcTypeList));
				}

				// spawnRandomNPC:
				if (tileData.spawnRandomNPC) {
					npc = MonsterSpawner.spawnRandomMonsterAt(tileIndex);
					npc.isAsleep = false;
					npc.isWandering = false;
				}

				// spawnRandomZooNPC:
				if (tileData.spawnRandomZooNPC) {
					npc = MonsterSpawner.spawnZooMonsterAt(tileIndex);

					if (!npc) {
						console.log(tileIndex);
					}

					npc.isAsleep = false;
					npc.isWandering = false;
				}	
			}
		}
	}			
};

// GET_TILE_TYPE_MAP:
// ************************************************************************************************
gs.getTileTypeMap = function (vaultType, rotate, reflect) {
	var tileTypeMap,
		data,
		object,
		frame,
		frameOffset,
		objData,
		typeName,
		startX,
		startY,
		width,
		height;
	
	let areaTriggerList = [];

	data = vaultType.getData();
	frameOffset = data.tilesets[1].firstgid - 1;

	// Handling combinedVaultSets:
	if (vaultType.isCombinedVaultSet) {
		startX = vaultType.box.startX;
		startY = vaultType.box.startY;
		width = vaultType.box.width;
		height = vaultType.box.height;
	}
	else {
		startX = 0;
		startY = 0;
		width = data.width;
		height = data.height;
	}
	
	// INIT_TILE_TYPE_MAP:
	// ********************************************************************************************
	tileTypeMap = [];
	for (let x = 0; x < width; x += 1) {
		tileTypeMap[x] = [];
		for (let y = 0; y < height; y += 1) {
			tileTypeMap[x][y] = {};
		}
	}
	tileTypeMap.width = width;
	tileTypeMap.height = height;
	tileTypeMap.vaultType = vaultType;
	
	
	// Insert Vaults:
	tileTypeMap.insertVaultList = [];
	

	// LOADING_TILE_LAYER:
	// ********************************************************************************************
	for (let x = 0; x < width; x += 1) {
		for (let y = 0; y < height; y += 1) {
			// Frame from the JSON file:
			let frame = data.layers[0].data[(startY + y) * data.width + (startX + x)] - 1;
						
			// Insert the frame to our tileTypeMap:
			tileTypeMap[x][y].f = frame;
			
			// VALIDATION - Checking for unidentified frames:
			if (frame !== -1) {
				if (!gs.getNameFromFrame(frame, gs.tileTypes)) {
					console.log(vaultType.name);
					throw 'ERROR [getTileTypeMap] - Loading Tile Layer failed on tileIndex: ' + x + ', ' + y + ' with frame: ' + frame + ' for vault: ' + vaultType.name;
				}
			}
		}
	}
	
	// LOADING_FLAG_LAYER:
	// ********************************************************************************************
	if (data.layers[2]) {
		for (let y = 0; y < height; y += 1) {
			for (let x = 0; x < width; x += 1) {
				// Get frame:
				let frame = data.layers[2].data[(startY + y) * data.width + (startX + x)] - 1;
			
				
				if (frame === -1) {
					continue;
				}

				// SOLID_WALL:
				if (frame === 64) {
					tileTypeMap[x][y].s = true;
					tileTypeMap[x][y].c = true; // SolidWalls are also closed
				}
				// FLOOR_FIELD:
				else if (frame === 69) {
					tileTypeMap[x][y].floorField = true;
				}
				// AREA_WALL_MASK
				else if (frame === 89) {
					tileTypeMap[x][y].areaWallMask = true;
				}
				// OVER_WRITE_MASK
				else if (frame === 90) {
					tileTypeMap[x][y].overWriteMask = true;
				}
				// CLOSED:
				else if (frame === 68) {
					tileTypeMap[x][y].c = true;
				}
				// STANDARD_DROP_WALL:
				else if (frame === 93) {
					tileTypeMap[x][y].isStandardDropWall = true;
				}
				// TRIGGERED_DROP_WALL:
				else if (frame === 94) {
					tileTypeMap[x][y].isTriggeredDropWall = true;
				}
				// DROP_WALL_ROOM:
				else if (frame == 95) {
					tileTypeMap[x][y].isDropWallRoom = true;
				}
				// AREA_TRIGGER::
				else if (frame === 91) {
					// Creating an empty toTileIndex list which will be filled at the end with all triggered drop walls
					tileTypeMap[x][y].floorTrigger = {toTileIndexList: []};
					
					// We will pass over this list at end:
					areaTriggerList.push(tileTypeMap[x][y].floorTrigger);
				}
				// Warning:
				else {
					console.log('WARNING - invalid frame in flagLayer for vaultType: ' + vaultType.name + ' at: ' + x + ', ' + y);	
				}
			}
		}
	}
	
	
	// LOADING_OBJECT_LAYER:
	// ********************************************************************************************
	for (let i = 0; i < data.layers[1].objects.length; i += 1) {
		object = data.layers[1].objects[i];
		object.properties = object.properties || {};
		frame = object.gid - 1;
		let x = Math.round(object.x / (TILE_SIZE / SCALE_FACTOR));
		let y = Math.round(object.y / (TILE_SIZE / SCALE_FACTOR)) - 1;
		
		if (vaultType.isCombinedVaultSet) {
			if (x < vaultType.box.startX || y < vaultType.box.startY || x >= vaultType.box.endX || y >= vaultType.box.endY) {
				continue;
			}
		}
		
		let tile = tileTypeMap[x - startX][y - startY];

		// Give the object a percent = {0.0 - 1.0} in tiled to only spawn sometimes:
		if (object.properties.percent && util.frac() > object.properties.percent) {
			continue;
		}

		// Loading Objects:
		if (gs.getNameFromFrame(frame, gs.objectTypes)) {
			tile.obj = this.parseObject(frame, object.properties, vaultType, {x: startX, y: startY});
		}
		// Loading Clouds:
		else if (gs.getNameFromFrame(frame - frameOffset, gs.cloudTypes)) {
			tile.cloudTypeName = gs.getNameFromFrame(frame - frameOffset, gs.cloudTypes);
		}
		// Insert Vault Rect:
		else if (object.gid === undefined) {
			tileTypeMap.insertVaultList.push(this.parseInsertVault(object, startX, startY));
		}
		// Hall Hook:
		else if (frame === 65) {
			tile.hasHallHook = true;
		}
		// Pillar Flag:
		else if (frame === 66) {
			tile.pillarFlag = true;
		}
		// Portal Hook:
		else if (frame === 67) {
			tile.hasPortalHook = true;
		}
		// Standard Drop Wall
		else if (frame === 93) {
			tile.isStandardDropWall = true;
		}
		// Triggered Drop Wall:
		else if (frame === 94) {
			tile.isTriggeredDropWall = true;
		}
		// Character
		else if (gs.getNameFromFrame(frame - frameOffset, gs.npcTypes)) {
			tile.npcTypeName = gs.getNameFromFrame(frame - frameOffset, gs.npcTypes);

			if (object.properties.hasOwnProperty('isAlly')) {
				tile.npcIsAlly = true;
			}
			
			if (object.properties.hasOwnProperty('npcClassType')) {
				tile.npcClassType = object.properties.npcClassType;
			}
		}
		// Items:
		else if (gs.getNameFromFrame(frame - frameOffset, gs.itemTypes)) {
			tile.itemTypeName = gs.getNameFromFrame(frame - frameOffset, gs.itemTypes);
		}
		// Tag Tiles:
		else if (frame >= 78 && frame <= 85) {
			tile.t = frame - 78 + 1;
			tile.c = true;
		}
		// Major-Reward-Hook:
		else if (frame === 71) {
			tile.rewardHook = this.parseRewardHook(object.properties, {x: startX, y: startY}, tileTypeMap);			
		}
		// Special-Reward-Hook:
		else if (frame === 76) {
			tile.specialReward = true;
		}
		// Item Flag:
		else if (frame === 74) {
			if (object.properties.itemDropTableName) {
				let itemDropTableName = object.properties.itemDropTableName;
			
				if (!ItemGenerator.itemDropTables[itemDropTableName]) {
					throw 'Invalid itemDropTableName in vaultType: ' + vaultType.name;
				}

				tile.itemDropTableName = itemDropTableName;
			}
			else if (object.properties.itemTypeNameList) {
				let itemTypeNameList = JSON.parse(object.properties.itemTypeNameList);
				
				// Verification:
				itemTypeNameList.forEach(function (itemTypeName) {
					if (!gs.itemTypes[itemTypeName]) {
						throw 'Invalid itemTypeName ' + itemTypeName + ' in vault: ' + vaultType.name;
					}
				}, this);
				
				tile.itemTypeName = util.randElem(itemTypeNameList);
			}
			else {
				throw 'Invalid or missing property on Loot-Flag in vaultType: ' + vaultType.name + '. Expecting itemDropTableName or itemTypeNameList';
			}
			
		}
		// Mob Spawn Object:
		else if (frame === 73) {
			// With a list:
			if (object.properties.npcTypeList) {
				tile.npcTypeList = JSON.parse(object.properties.npcTypeList);
			}
			// Random:
			else {
				tile.spawnRandomNPC = true;
			}
		}
		// Zoo Mob Spawn Object:
		else if (frame === 72) {
			tile.spawnRandomZooNPC = true;
		}
		// Floor Trigger:
		else if (frame === 92) {
			tile.floorTrigger = this.parseFloorTrigger(object.properties, vaultType, data, {x: startX, y: startY});
		}
		// Properties object will set properties of the vaultType
		// Since we getTileTypeMap() when we parse vault types, this will set properties when loading
		else if (frame === 97) {
			for (let key in object.properties) {
				if (object.properties.hasOwnProperty(key)) {
					if (key === 'vaultTags') {
						vaultType[key] = JSON.parse(object.properties[key]);
					}
					else {
						vaultType[key] = object.properties[key];
					}
					
				}
			}
			
		}
		// Echo ID: to console log the vaults unique Id
		else if (frame === 98) {
			console.log(vaultType.name + ' Id: ' + vaultType.id);
		}
		// Mob Spawn:
		else if (frame === 86) {
			if (object.properties.hasOwnProperty('name')) {
				tile.spawnNPCName = object.properties.name;
			}
			else {
				tile.spawnNPCName = 'REPLACE_ME';
			}
			
			
			if (object.properties.hasOwnProperty('isAgroed')) {
				tile.spawnNPCIsAgroed = object.properties.isAgroed;
			}
			else {
				tile.spawnNPCIsAgroed = true;
			}
		}
		// Warning:
		else {
			console.log('WARNING - invalid frame ' + frame + ' in objectLayer for vaultType: ' + vaultType.name + ' at: ' + x + ', ' + y);	
		}
	}
	
	// LOADING_SIMPLE_OBJECT_LAYER:
	// ********************************************************************************************	
	if (data.layers[3] && data.layers[3].type === 'tilelayer') {
		for (let y = 0; y < height; y += 1) {
			for (let x = 0; x < width; x += 1) {
				// Get frame:
				let frame = data.layers[3].data[(startY + y) * data.width + (startX + x)] - 1;
			
				
				if (frame === -1) {
					continue;
				}
				
				// Loading Objects:
				if (gs.getNameFromFrame(frame, gs.objectTypes)) {
					let objectType = gs.objectTypes[gs.getNameFromFrame(frame, gs.objectTypes)];
					
					tileTypeMap[x][y].obj = {
						frame: frame,
						type: objectType,
						typeFrame: objectType.frame
					};
				}
			}
		}
	}
	
	// Connecting area triggers:
	if (areaTriggerList.length > 0) {
		let list = [];
		
		// find all triggered drop walls:
		for (let y = 0; y < height; y += 1) {
			for (let x = 0; x < width; x += 1) {
				if (tileTypeMap[x][y].isTriggeredDropWall) {
					list.push({x: x, y: y});
				}
			}
		}
		
		areaTriggerList.forEach(function (areaTrigger) {
			
			list.forEach(function (tileIndex) {
				areaTrigger.toTileIndexList.push({x: tileIndex.x, y: tileIndex.y});
			}, this);
			
		}, this);
	}
	
	
	
	// Rotate map:
	if (rotate) {
		tileTypeMap = this.rotateMap(tileTypeMap, rotate);
	}
	
	// Reflect map:
	if (reflect) {
		tileTypeMap = this.reflectMap(tileTypeMap);
	}
	
	
	return tileTypeMap;
};

// PARSE_FLOOR_TRIGGER:
// ************************************************************************************************
gs.parseFloorTrigger = function (objectProperties, vaultType, data, startTileIndex) {
	let floorTrigger = {};
	
	// Parse toTileIndex:
	if (objectProperties.hasOwnProperty('toTileIndex')) {
		floorTrigger.toTileIndexList = [];
		floorTrigger.toTileIndexList[0] = JSON.parse(objectProperties.toTileIndex);
	}
	// Parse toTileIndexList:
	else if (objectProperties.hasOwnProperty('toTileIndexList')) {
		floorTrigger.toTileIndexList = JSON.parse(objectProperties.toTileIndexList);
		
		// Converting arrays to tileIndex:
		if (!floorTrigger.toTileIndexList[0].hasOwnProperty('x')) {
			let list = [];
			floorTrigger.toTileIndexList.forEach(function (arr) {
				list.push({x: arr[0], y: arr[1]});
			}, this);
			floorTrigger.toTileIndexList = list;
		}
		
	}
	// Parse grouId:
	else if (objectProperties.hasOwnProperty('groupId')) {
		floorTrigger.toTileIndexList = [];
		
		for (let i = 0; i < data.layers[1].objects.length; i += 1) {
			let object = data.layers[1].objects[i];
			object.properties = object.properties || {};
			let frame = object.gid - 1;
			let x = Math.round(object.x / (TILE_SIZE / SCALE_FACTOR));
			let y = Math.round(object.y / (TILE_SIZE / SCALE_FACTOR)) - 1;
			
			if (vaultType.isCombinedVaultSet) {
				if (x < vaultType.box.startX || y < vaultType.box.startY || x >= vaultType.box.endX || y >= vaultType.box.endY) {
					continue;
				}
			}
			
			// Mob Portal Spawn:
			if (frame === 86 && object.properties.groupId) {
				// Single ID:
				if (object.properties.groupId === objectProperties.groupId) {
					floorTrigger.toTileIndexList.push({x: x, y: y});
				}
				// List of IDs:
				else if (typeof object.properties.groupId === 'string') {
					
					let list = JSON.parse(object.properties.groupId);
					
					if (util.inArray(objectProperties.groupId, list)) {
						floorTrigger.toTileIndexList.push({x: x, y: y});
					}
				}
			} 
			
			
			
		}
			
	
	}
	else {
		console.log('WARNING - a floor trigger is missing a toTileIndex/toTileIndexList in vaultType: ' + vaultType.name);
	}
	
	// Offseting:
	floorTrigger.toTileIndexList.forEach(function (tileIndex) {
		tileIndex.x = tileIndex.x - startTileIndex.x;
		tileIndex.y = tileIndex.y - startTileIndex.y;
	}, this);
	
	
	return floorTrigger;
};

// PARSE_REWARD_HOOK:
// ************************************************************************************************
gs.parseRewardHook = function (objectProperties, startTileIndex, tileTypeMap) {
	let rewardHook = {};
	
	// Parse toTileIndex:
	if (objectProperties.hasOwnProperty('toTileIndex')) {
		rewardHook.toTileIndexList = [];
		rewardHook.toTileIndexList[0] = JSON.parse(objectProperties.toTileIndex);
	}
	// Parse toTileIndexList:
	else if (objectProperties.hasOwnProperty('toTileIndexList')) {		
		// Connnecting to all area drop walls:
		if (objectProperties.toTileIndexList === 'ALL') {
			let list = [];
		
			// find all triggered drop walls:
			for (let y = 0; y < tileTypeMap.height; y += 1) {
				for (let x = 0; x < tileTypeMap.width; x += 1) {
					if (tileTypeMap[x][y].isTriggeredDropWall) {
						list.push({x: x + startTileIndex.x, y: y + startTileIndex.y});
					}
				}
			}
			
			rewardHook.toTileIndexList = list;
		}
		// A tileIndex list:
		else {
			rewardHook.toTileIndexList = JSON.parse(objectProperties.toTileIndexList);
			
			// Converting the list to tileIndex:
			if (!rewardHook.toTileIndexList[0].hasOwnProperty('x')) {
				let list = [];

				rewardHook.toTileIndexList.forEach(function (arr) {
					list.push({x: arr[0], y: arr[1]});
				}, this);

				rewardHook.toTileIndexList = list;
			}
		}
		
	}
	else {
		rewardHook.toTileIndexList = [];
	}
	
	// Offesting:
	if (rewardHook.toTileIndexList) {
		rewardHook.toTileIndexList.forEach(function (tileIndex) {
			tileIndex.x = tileIndex.x - startTileIndex.x;
			tileIndex.y = tileIndex.y - startTileIndex.y;
		}, this);
	}
	
	return rewardHook;
};

// PARSE_OBJECT:
// ************************************************************************************************
gs.parseObject = function (frame, objectProperties, vaultType, startTileIndex) {
	let objectType = gs.objectTypes[gs.getNameFromFrame(frame, gs.objectTypes)];
		
	// Creating objData:
	let objData = {
		frame: frame,
		type: objectType,
		typeFrame: objectType.frame
	};

	// Adding additional properties:
	for (let key in objectProperties) {
		if (objectProperties.hasOwnProperty(key)) {
			objData[key] = objectProperties[key];
		}
	}
	
	// Parse toTileIndex:
	if (objectProperties.hasOwnProperty('toTileIndex')) {
		objData.toTileIndexList = [];
		objData.toTileIndexList[0] = JSON.parse(objectProperties.toTileIndex);
	}
	
	// Parse toTileIndexList:
	if (objectProperties.hasOwnProperty('toTileIndexList')) {
		objData.toTileIndexList = JSON.parse(objectProperties.toTileIndexList);
		
		// Converting arrays to tileIndex:
		if (!objData.toTileIndexList[0].hasOwnProperty('x')) {
			let list = [];
			
			objData.toTileIndexList.forEach(function (arr) {
				list.push({x: arr[0], y: arr[1]});
			}, this);
			
			objData.toTileIndexList = list;
		}
	}
	
	if (objData.toTileIndexList) {
		objData.toTileIndexList.forEach(function (tileIndex) {
			tileIndex.x = tileIndex.x - startTileIndex.x;
			tileIndex.y = tileIndex.y - startTileIndex.y;
		}, this);
	}

	// Parse groupId:
	if (objData.hasOwnProperty('groupId')) {
		objData.groupId = vaultType.name + objData.groupId;
	}
	
	// Validate:
	if (objData.type === gs.objectTypes.Portal && !objData.hasOwnProperty('toTileIndex') && !objData.hasOwnProperty('toTileIndexList')) {
		console.log('WARNING - a portal is missing a toTileIndex in vaultType: ' + vaultType.name);
	}
	
	return objData;
};

// PARSE_INSERT_VAULT:
// ************************************************************************************************
gs.parseInsertVault = function (object, vaultStartX, vaultStartY) {
	let insertVault = {
		percent: object.properties.percent || 1.0
	};
	
	// Box:
	let startX = Math.round(object.x / (TILE_SIZE / SCALE_FACTOR)) - vaultStartX;
	let startY = Math.round(object.y / (TILE_SIZE / SCALE_FACTOR)) - vaultStartY;
	let endX = Math.round(object.x / (TILE_SIZE / SCALE_FACTOR) + object.width / (TILE_SIZE / SCALE_FACTOR)) - vaultStartX;
	let endY = Math.round(object.y / (TILE_SIZE / SCALE_FACTOR) + object.height / (TILE_SIZE / SCALE_FACTOR)) - vaultStartY;
	
	insertVault.box = util.createBox(startX, startY, endX, endY); 
			
	// Tags:
	insertVault.tags = [];
	if (object.properties.tag) {
		insertVault.tags.push(object.properties.tag);
	}
				
	return insertVault;
};

// REFLECT_MAP:
// ************************************************************************************************
gs.reflectMap = function (map) {
	var newMap;
	
	let reflectToTileIndexList = function (obj) {
		if (obj.toTileIndexList) {
			for (let i = 0; i < obj.toTileIndexList.length; i += 1) {
				obj.toTileIndexList[i].x = newMap.width - obj.toTileIndexList[i].x - 1;
			}
		}
	};
	
	newMap = [];
	for (let x = 0; x < map.width; x += 1) {
		newMap[x] = [];
		for (let y = 0; y < map.height; y += 1) {
			newMap[x][y] = map[x][y];
		}
	}
	newMap.width = map.width;
	newMap.height = map.height;
	newMap.insertVaultList = map.insertVaultList;
	
	// Reverse Tile Row:
	for (let y = 0; y < newMap.height; y += 1) {
		for (let x = 0; x < Math.floor(newMap.width / 2); x += 1) {
			let temp = newMap[x][y];
			newMap[x][y] = newMap[newMap.width - x - 1][y];
			newMap[newMap.width - x - 1][y] = temp;
		}
	}

	// Reverse tileIndex:
	for (let x = 0; x < newMap.width; x += 1) {
		for (let y = 0; y < newMap.height; y += 1) {
			// Objects:
			if (newMap[x][y].obj) {
				reflectToTileIndexList(newMap[x][y].obj);
			}
			
			// Floor Triggers:
			if (newMap[x][y].floorTrigger) {
				reflectToTileIndexList(newMap[x][y].floorTrigger);
			}
			
			// Floor Triggers:
			if (newMap[x][y].rewardHook) {
				reflectToTileIndexList(newMap[x][y].rewardHook);
			}
		}
	}
	
	// Reflecting object frames:
	for (let x = 0; x < newMap.width; x += 1) {
		for (let y = 0; y < newMap.height; y += 1) {
			if (newMap[x][y].obj) {
				newMap[x][y].obj.frame = gs.reflectObjectFrame(newMap[x][y].obj.frame);
			}
		}
	}
	
	// Reflecting insert vault:
	for (let i = 0; i < newMap.insertVaultList.length; i += 1) {
		let box = newMap.insertVaultList[i].box,
			startX = newMap.width - (box.startX + box.width);
		
		newMap.insertVaultList[i] = {box: util.createBox(startX, box.startY, startX + box.width, box.startY + box.height), tags: newMap.insertVaultList[i].tags};
	}
	
	return newMap;
};

// ROTATE_MAP_90:
// ************************************************************************************************
gs.rotateMap90 = function (map) {
	var newMap;
	
	let rotateToTileIndexList = function (obj) {
		if (obj.toTileIndexList) {
			for (let i = 0; i < obj.toTileIndexList.length; i += 1) {
				obj.toTileIndexList[i] = {x: obj.toTileIndexList[i].y, y: obj.toTileIndexList[i].x};
			}
		}
	};
	
	// Transpose Tiles:
	newMap = [];
	for (let x = 0; x < map.height; x += 1) {
		newMap[x] = [];
		for (let y = 0; y < map.width; y += 1) {
			newMap[x][y] = map[y][x];
		}
	}
	newMap.width = map.height;
	newMap.height = map.width;
	newMap.insertVaultList = map.insertVaultList;

	// Transpose tileIndex:
	for (let x = 0; x < newMap.width; x += 1) {
		for (let y = 0; y < newMap.height; y += 1) {
			if (newMap[x][y].obj) {
				rotateToTileIndexList(newMap[x][y].obj);
			}
			
			if (newMap[x][y].floorTrigger) {
				rotateToTileIndexList(newMap[x][y].floorTrigger);
			}
			
			if (newMap[x][y].rewardHook) {
				rotateToTileIndexList(newMap[x][y].rewardHook);
			}
		}
	}
	
	// Rotating tile frames:
	for (let x = 0; x < newMap.width; x += 1) {
		for (let y = 0; y < newMap.height; y += 1) {
			newMap[x][y].f = gs.rotateTileFrame(newMap[x][y].f);
		}
	}
	
	// Rotating objects:
	for (let x = 0; x < newMap.width; x += 1) {
		for (let y = 0; y < newMap.height; y += 1) {
			if (newMap[x][y].obj) {
				gs.rotateObjectType(newMap[x][y].obj);
			}
		}
	}

	// Rotating object frames:
	for (let x = 0; x < newMap.width; x += 1) {
		for (let y = 0; y < newMap.height; y += 1) {
			if (newMap[x][y].obj) {
				newMap[x][y].obj.frame = gs.rotateObjectFrame(newMap[x][y].obj.frame);
			}
		}
	}

	// Rotating Insert Vaults:
	for (let i = 0; i < newMap.insertVaultList.length; i += 1) {
		let box = newMap.insertVaultList[i].box;
		newMap.insertVaultList[i] = {box: util.createBox(box.startY, box.startX, box.startY + box.height, box.startX + box.width),
										tags: newMap.insertVaultList[i].tags};
	}

	newMap = this.reflectMap(newMap);

	return newMap;
};

// ROTATE_MAP:
// ************************************************************************************************
gs.rotateMap = function (map, angle) {
	if (angle === 90) {
		return this.rotateMap90(map);
	}
	else if (angle === 180) {
		map = this.rotateMap90(map);
		return this.rotateMap90(map);
	}
	else if (angle === 270) {
		map = this.rotateMap90(map);
		map = this.rotateMap90(map);
		return this.rotateMap90(map);
	}
	else {
		throw 'invalid angle';
	}
};

