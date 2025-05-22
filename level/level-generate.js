/*global game, gs, Phaser, console, FrameSelector, util, debug, LevelGeneratorStatic*/
/*global Item*/
/*global levelController, levelVerification, MonsterSpawner, levelPopulator*/
/*global NUM_TILES_X, NUM_TILES_Y, EXCEPTION_TYPE, FEATURE_TYPE*/
/*global baseGenerator, VAULT_PLACEMENT*/
/*global swampGenerator, feastHallGenerator*/
/*global SPAWN_TYPE*/
/*global VAULT_CONTENT, ZONE_TIER, LOS_DISTANCE*/
/*global LevelGeneratorTestArea*/
/*global DungeonGenerator*/
/*jshint white: true, esversion: 6, laxbreak: true, loopfunc: true*/

'use strict';

gs.generateLevel = function () {
	var success = false, attempt = 0;
	
	while (!success) {
		success = true;
		
		// Seed Generator:
		// Note we must add the attempt in order to not just keep regening same seed
		if (this.seed) {
			util.seedRand([this.seed, this.zoneName, this.zoneLevel, attempt]);
		}
		
		// During debug we can throw LEVEL_GENERATION exceptions that would normally result in a re-gen
		if (gs.debugProperties.throwAllExceptions) {
			this.generateLevelFunc();
		}
		// During live version:
		else {
			try {
				this.generateLevelFunc();
			}
			catch (e) {
				// Rethrow non-level-gen exceptions:
				if (e.type !== EXCEPTION_TYPE.LEVEL_GENERATION && e.type !== EXCEPTION_TYPE.AREA_GENERATION) {
					throw e;
				}
				// Else we simply log the message and re-gen
				else {
					success = false;
					
					if (gs.debugProperties.logLevelGenExceptions) {
						console.log('Failed to generate ' + gs.zoneName + ':' + gs.zoneLevel + ' attempting again');
						console.log(e);
					}
					
					
					gs.destroyLevel();
					attempt += 1;
				}
			}
		}
		
		if (attempt > 40) {
			throw 'Failed to generate ' + gs.zoneName + ':' + gs.zoneLevel + ' after 40 attemps.';
		}
	}
};

// GENERATE_LEVEL:
// ************************************************************************************************
gs.generateLevelFunc = function () {
	this.currentGenerator = null;
	this.noReeds = false;
	this.noMobSpawn = false;
	this.areaList = [];
	this.tempPreviouslySpawnedVaults = [];
	this.tempPreviouslySpawnedItemList = [];
	this.newLevelFeaturesList = []; // Used to push features to next levels (ex. pushing keys)
	
	// Push any data here that needs to save between levels
	this.miscLevelData = [];
	
	// Creating a clean Level-Features list
	// Level-Generators can freely add to this list without messing up the global list (in case they need to regen)
	this.levelFeatures = [];
	if (gs.debugProperties.spawnDungeonFeatures) {
		DungeonGenerator.getLevelFeatures().forEach(function (levelFeature) {
			levelFeature.hasGenerated = false;
			this.levelFeatures.push(levelFeature);
		}, this);
	}
	
	
	// TEST_AREA:
	if (this.debugProperties.testAreaGenerator.isOn) {
		this.generateTestArea();
	}
	// TEST_ZONE:
	else if (this.zoneName === 'TestZone') {
		this.loadTestZoneLevel();
	}
	/*
	// END_LEVEL:
	else if (this.shouldLoadEndLevel()) {
		gs.currentGenerator = LevelGeneratorStatic;
		this.loadEndLevel();
	}
	*/
	// RANDOM_LEVEL:
	else {
		this.generateRandomLevel();
	}

	// Place Stairs:
	this.generateStairs();
	
	// Generate Global Stuff:
	if (this.debugProperties.generateGlobalStuff && !this.zoneType().noGlobalStuff) {
		levelPopulator.generateGlobalStuff();
	}
	
	// Populate Level (NPCs):
	MonsterSpawner.populateLevel();
	
	// Trim side rooms:
	this.trimDoors();
	this.trimObjects();
	
	this.placeWallDressing();
	
	// Level Verification:
	levelVerification.run();
	

	
	
	levelController.onGenerateLevel();
	
	// Set Alternate Tile Frames:
	FrameSelector.setLevelTileFrames();
	
	this.removeDeadCharacters();
	
	// Connect Tentacles to Kraken:
	this.characterList.forEach(function (character) {
		if (character.type.name === 'Tentacle') {
			let kraken = gs.characterList.find(char => char.type.name === 'TheKraken');
			if (!util.inArray(character.id, kraken.summonIDList)) {
				kraken.summonIDList.push(character.id);
				character.summonerId = kraken.id;
				character.summonDuration = -1;
			}
		}
	}, this);
	
	
	// As a last step we stock merchants or librarians:
	/*
	if (gs.characterList.find(char => char.type.name === 'Merchant')) {
		gs.stockMerchant();
	}
	*/
	
	if (gs.characterList.find(char => char.type.name === 'TheLibrarian')) {
		gs.stockLibrary();
	}

	// As a last step we record the unique vaults and items:
	gs.previouslySpawnedVaults = gs.previouslySpawnedVaults.concat(gs.tempPreviouslySpawnedVaults);
	gs.previouslySpawnedItemList = gs.previouslySpawnedItemList.concat(gs.tempPreviouslySpawnedItemList);
	
	// As a last step we push any newly created level features:
	this.newLevelFeaturesList.forEach(function (e) {
		DungeonGenerator.getLevelFeatures(e.zoneName, e.zoneLevel).push(e.levelFeature);
	}, this);
};

// LOAD_TEST_ZONE_LEVEL:
// ************************************************************************************************
gs.loadTestZoneLevel = function () {
	this.currentGenerator = LevelGeneratorStatic;
	if (gs.zoneLevel < 4) {
		this.loadJSONLevel('_Debug/TestLevel/TestLevel0' + gs.zoneLevel);
	}
	else {
		this.generateRandomLevel();
	}
	
};




// END_LEVEL_VAULT_LIST:
// ************************************************************************************************
gs.endLevelVaultList = function () {
	let vaultTypeList = gs.vaultTypeList;
    vaultTypeList = vaultTypeList.filter(vaultType => util.inArray(vaultType.vaultSet, gs.zoneType().vaultSets));
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.END_LEVEL);
	return vaultTypeList;
};

// SHOULD_LOAD_END_LEVEL:
// ************************************************************************************************
gs.shouldLoadEndLevel = function () {
	return this.zoneLevel === this.zoneType().numLevels 
		&& this.endLevelVaultList().length > 0;
};

// LOAD_END_LEVEL:
// ************************************************************************************************
gs.loadEndLevel = function () {
	// Select the end level:
	let vaultType = util.randElem(this.endLevelVaultList());
	
	this.staticLevelName = vaultType.name;
	
	// Load the static map:
	this.loadJSONLevel(this.staticLevelName);
	this.isStaticLevel = true;
};

// GENERATE_TEST_AREA:
// ************************************************************************************************
gs.generateTestArea = function () {
	gs.initiateTileMap();
	
	LevelGeneratorTestArea.generate();
		
	// Dress Areas:
	this.dressAreas();
};


// GENERATE_RANDOM_LEVEL:
// ************************************************************************************************
gs.generateRandomLevel = function () {
	// Debug forcing a vaultType:
	if (gs.debugProperties.forceVaultType) {
		if (!gs.getVaultType(gs.debugProperties.forceVaultType)) {
			throw 'ERROR - invalid debugProperties.forceVaultType: ' + gs.debugProperties.forceVaultType;
		}
		
		gs.levelFeatures.push({
			featureType: FEATURE_TYPE.VAULT_TYPE, 
			vaultTypeName: gs.debugProperties.forceVaultType,
			hasGenerated: false
		});
	}
	
	/*
	// Debug forcing a static level:
	else if (this.debugProperties.forceStaticLevel) {
		gs.currentGenerator = LevelGeneratorStatic;
		this.loadJSONLevel(this.debugProperties.forceStaticLevel);
	}
	*/
	
	// Select Generator:
	let generator;
	if (gs.debugProperties.levelGenerator) {
		generator = gs.debugProperties.levelGenerator;
	}
	else if (gs.debugProperties.forceVaultType && gs.getVaultType(gs.debugProperties.forceVaultType).placementType === VAULT_PLACEMENT.LEVEL) {
		generator = LevelGeneratorStatic;
	}
	else {
		generator = util.chooseRandom(this.zoneType().generators);
	}
	
	// Saving the generator so that debug knows what we're using.
	this.currentGenerator = generator;
	
	// Clear the tileMap before generation:
	gs.initiateTileMap();

	// Call the generator:
	generator.generate();
	
    // Fail if we missed Level-Feature-Vaults:
	let ignoreList = [
		FEATURE_TYPE.FRIENDLY_NPC, 
		FEATURE_TYPE.BOSS, 
		FEATURE_TYPE.SWITCH, 
		FEATURE_TYPE.ITEM, 
		FEATURE_TYPE.RAND_ITEM,
		FEATURE_TYPE.ZONE_LINE
	];
	
	gs.levelFeatures.forEach(function (levelFeature) {
		if (!levelFeature.hasGenerated && !util.inArray(levelFeature.featureType, ignoreList)) {
			throw {
				type: EXCEPTION_TYPE.LEVEL_GENERATION, 
				text: 'Failed to place a Level-Feature.',
				levelFeature: levelFeature
			};
		}
	}, this);
	
	// Fail if we miss a boss that hasVault:
	gs.levelFeatures.forEach(function (levelFeature) {
		if (!levelFeature.hasGenerated && levelFeature.featureType === FEATURE_TYPE.BOSS && gs.npcTypes[levelFeature.bossName].hasVault) {
			throw {
				type: EXCEPTION_TYPE.LEVEL_GENERATION, 
				text: 'Failed to place a boss vault.',
				levelFeature: levelFeature
			};
		}
	}, this);
    
	// Dress Areas:
	this.dressAreas();
    
    // Trimming:
	this.trimDiagonalWalls();
	this.trimPits();
};

// DRESS_AREAS:
// ************************************************************************************************
gs.dressAreas = function () {
	this.areaList.forEach(function (area) {
		if (area.areaGenerator) {
			area.areaGenerator.dressArea(area);
		}
	}, this);
};

// GENERATE_STAIRS:
// ************************************************************************************************
gs.generateStairs = function () {
	// Destroying upstairs on UD:1 (placed by major vaults):
	if (this.zoneName === 'TheUpperDungeon' && this.zoneLevel === 1) {
		let stairsObj = this.findObj(obj => obj.type.name === 'UpStairs');
		if (stairsObj) {
			gs.destroyObject(stairsObj);
		}
	}
	
	// Creating spawn point on UD:1:
	if (this.zoneName === 'TheUpperDungeon' && this.zoneLevel === 1) {
		let tileIndex = this.getStairIndex();
		gs.createObject(tileIndex, 'PCSpawnPoint');
		
		// Close tiles to spawning:
		this.getIndexListInFlood(tileIndex, gs.isStaticPassable, LOS_DISTANCE).forEach(function (index) {
			this.getTile(index).isClosed = true;
		}, this);
	}
	
	// Downstairs within a zone:
	if (this.zoneLevel < this.zoneType().numLevels) {
		this.placeStairs('DownStairs', this.zoneName, this.zoneLevel + 1, 0);
	}

	// Upstairs within a zone:
	if (this.zoneLevel > 1) {
		this.placeStairs('UpStairs', this.zoneName, this.zoneLevel - 1, this.zoneType().zoneTier.safeStairRadius);
	}

	// Branch Stairs:
	let zoneLineFeatureList = gs.levelFeatures.filter(levelFeature => levelFeature.featureType === FEATURE_TYPE.ZONE_LINE);
	zoneLineFeatureList.forEach(function (levelFeature) {
		this.placeStairs(levelFeature.stairsType, levelFeature.toZoneName, levelFeature.toZoneLevel, this.zoneType().zoneTier.safeStairRadius);
	}, this);
	
	// Destroying any stairs that were not used (placed by major vaults):
	let list = gs.objectList.filter(obj => obj.isZoneLine() && (!obj.toZoneName || !obj.toZoneLevel));
	list.forEach(function (obj) {
		console.log('destroying unconnected stairs');
		gs.destroyObject(obj);
	}, this);
	
	

};

// PLACE_STAIRS:
// ************************************************************************************************
gs.placeStairs = function (stairsType, toZoneName, toZoneLevel, closeRadius = 0) {
	let stairsObj = null;
	
	// Find the exact stairs that already exist:
	stairsObj = this.findObj(obj => obj.toZoneName === toZoneName && obj.toZoneLevel === toZoneLevel);
	
	// Find unconnected stairs that already exist
	if (!stairsObj) {
		
		stairsObj = this.findObj(obj => obj.type.name === stairsType && !obj.toZoneName);
		
		if (stairsObj) {
			stairsObj.toZoneName = toZoneName;
			stairsObj.toZoneLevel = toZoneLevel;
		}
	}
	
	// Otherwise create stairs:
	if (!stairsObj) {
		let tileIndex = this.getStairIndex();
		
		if (tileIndex) {
			stairsObj = this.createZoneLine(tileIndex, stairsType, toZoneName, toZoneLevel);
		}
	}
	
	// Error if we cannot find any valid location:
	if (!stairsObj) {
		throw {
			type: EXCEPTION_TYPE.LEVEL_GENERATION, 
			text: 'Unable to place stairs to: ' + toZoneName + ':' + toZoneLevel
		}; 
	}
	
	// Close tiles to spawning:
	this.getIndexListInRadius(stairsObj.tileIndex, closeRadius).forEach(function (index) {
		this.getTile(index).isClosed = true;
	}, this);
};

// GET_STAIR_INDEX:
// Stairs can be spawned in any open tile index in the level as long as it is not a side room
// Returns null if no possible tile is found
// ************************************************************************************************
gs.getStairIndex = function () {
	var indexList = gs.getAllIndex();
	
	indexList = indexList.filter(index => this.isIndexOpen(index));
	indexList = indexList.filter(index => util.inArray(gs.getTile(index).type.name, ['Floor', 'CaveFloor']));
	indexList = indexList.filter(index => gs.getIndexListCardinalAdjacent(index).filter(idx => this.isIndexOpen(idx)).length >= 4);
	indexList = indexList.filter(index => !gs.getArea(index) || !gs.getArea(index).isVault || gs.getArea(index).vaultType.allowStairs);
	
	// Dont place within view of a drop wall:
	indexList = indexList.filter(function (tileIndex) {
		if (gs.getIndexListInRadius(tileIndex, 3).find(index => gs.getTile(index).isStandardDropWall)) {
			return false;
		}
		
		return true;
		
	}, this);
	
	// Don't place within 10 tiles of the nearest stairs:
	indexList = indexList.filter(function (tileIndex) {
		let zoneLineList = gs.objectList.filter(obj => obj.isZoneLine());
		
		for (let i = 0; i < zoneLineList.length; i += 1) {
			if (util.distance(tileIndex, zoneLineList[i].tileIndex) < 10) {
				return false;
			}
		}
		
		return true;
		
	}, this);
	
	return indexList.length > 0 ? util.randElem(indexList) : null;
};


// TRIM_HAZARDS:
// ************************************************************************************************
gs.trimHazards = function () {
	// Trimming Lava from walls:
	gs.getAllIndex().forEach(function (tileIndex) {
		var indexList;
		
		// Skip Vaults:
		if (this.getArea(tileIndex) && this.getArea(tileIndex).isVault) {
			return;
		}
		
		
		
		if (this.getTile(tileIndex).type.name === 'Lava') {
			indexList = this.getIndexListCardinalAdjacent(tileIndex);
			indexList = indexList.filter(index => this.getTile(index).type.name === 'CaveWall');
			
			if (indexList.length > 0) {
				this.setTileType(tileIndex, this.tileTypes.CaveFloor);
				
				// Removing lava only chars (so they arn't floating on solid ground):
				if (gs.getChar(tileIndex) && util.inArray(SPAWN_TYPE.LAVA, gs.getChar(tileIndex).type.spawnType)) {
					gs.getChar(tileIndex).destroy();
				}
				
			}
		}
	}, this);
	
	// Trimming single lava:
	gs.getAllIndex().forEach(function (tileIndex) {
		// Skip Vaults:
		if (this.getArea(tileIndex) && this.getArea(tileIndex).isVault) {
			return;
		}
		
		if (this.getTile(tileIndex).type.name === 'Lava') {
			let indexList = this.getIndexListCardinalAdjacent(tileIndex);
			indexList = indexList.filter(index => this.getTile(index).type.name === 'Lava');
			
			if (indexList.length === 0) {
				this.setTileType(tileIndex, this.tileTypes.CaveFloor);
			}
		}
			
	}, this);
};


// TRIM_OBJECTS:
// ************************************************************************************************
gs.trimObjects = function () {
	gs.getAllIndex().forEach(function (index) {
		if (gs.getObj(index, 'LongGrass') && gs.getTile(index).type.name === 'Water') {
			gs.destroyObject(gs.getObj(index));
		}
		
		if (gs.getObj(index, 'LongGrass') && gs.getTile(index).type.name === 'Lava') {
			gs.destroyObject(gs.getObj(index));
		}
		
		if (gs.getObj(index, 'LongGrass') && gs.getTile(index).type.name === 'ToxicWaste') {
			gs.destroyObject(gs.getObj(index));
		}
	}, this);
};

// TRIM_DOORS:
// Remove all short hall doors
// ************************************************************************************************
gs.trimDoors = function () {
	gs.getIndexListInBox(1, 1, NUM_TILES_X - 1, NUM_TILES_Y - 1).forEach(function (index) {
		// Horizontal short halls:
		if (gs.isPassable(index) && 
			(!gs.getArea(index) || gs.getArea(index).isVault === false) &&
			gs.getObj(index.x + 1, index.y, obj => obj.type.name === 'Door') &&
			gs.getObj(index.x - 1, index.y, obj => obj.type.name === 'Door')) {
		
			gs.destroyObject(gs.getObj(index.x + 1, index.y));
			gs.destroyObject(gs.getObj(index.x - 1, index.y));
		}
		
		// Vertical short halls:
		if (gs.isPassable(index) && 
			(!gs.getArea(index) || gs.getArea(index).isVault === false) &&
			gs.getObj(index.x, index.y + 1, obj => obj.type.name === 'Door') &&
			gs.getObj(index.x, index.y - 1, obj => obj.type.name === 'Door')) {
		
			gs.destroyObject(gs.getObj(index.x, index.y + 1));
			gs.destroyObject(gs.getObj(index.x, index.y - 1));
		}
		
		// Freestanding doors:
		if (gs.getObj(index, obj => obj.type.name === 'Door') && gs.getIndexListCardinalAdjacent(index).filter(idx => !gs.isPassable(idx)).length <= 1) {
			gs.destroyObject(gs.getObj(index));
		}
		
		
		
	}, this);
};

// TRIM_DIAGONAL_WALLS:
// ************************************************************************************************
gs.trimDiagonalWalls = function () {
	for (let x = 0; x < gs.numTilesX - 1; x += 1) {
		for (let y = 0; y < gs.numTilesY - 1; y += 1) {
			// X O
			// O X
			if (!gs.getTile(x, y).type.passable &&
				!gs.getTile(x + 1, y + 1).type.passable  &&
				gs.getTile(x + 1, y).type.passable && 
				gs.getTile(x, y + 1).type.passable) {
				
				if (gs.getTile(x, y).type.name === 'Wall') {
					gs.setTileType({x: x, y: y}, gs.tileTypes.Floor);
				}
				else if (gs.getTile(x, y).type.name === 'CaveWall') {
					gs.setTileType({x: x, y: y}, gs.tileTypes.CaveFloor);
				}
			}
			
			// O X
			// X O
			if (gs.getTile(x, y).type.passable &&
				gs.getTile(x + 1, y + 1).type.passable  &&
				!gs.getTile(x + 1, y).type.passable && 
				!gs.getTile(x, y + 1).type.passable) {
				
				if (gs.getTile(x, y).type.name === 'Wall') {
					gs.setTileType({x: x, y: y}, gs.tileTypes.Floor);
				}
				else if (gs.getTile(x, y).type.name === 'CaveWall') {
					gs.setTileType({x: x, y: y}, gs.tileTypes.CaveFloor);
				}
			}
		}
	}
};

// TRIM_PITS:
// Remove single pits
// ************************************************************************************************
gs.trimPits = function (area) {
	var isSinglePit, change = true;
	
	let indexList;
	if (area) {
		indexList = gs.getIndexListInArea(area);
	}
	else {
		indexList = gs.getAllIndex();
	}
		
	
	isSinglePit = function (x, y) {
		if (gs.getTile(x, y).type.name === 'DungeonPit') {
			if ((gs.getTile(x + 1, y).type.name !== 'DungeonPit' && gs.getTile(x - 1, y).type.name !== 'DungeonPit')
			|| 	(gs.getTile(x, y + 1).type.name !== 'DungeonPit' && gs.getTile(x, y - 1).type.name !== 'DungeonPit')) {
				return true;
			}
		}
	
		if (gs.getTile(x, y).type.name === 'CavePit') {
			if ((gs.getTile(x + 1, y).type.name !== 'CavePit' && gs.getTile(x - 1, y).type.name !== 'CavePit')
			|| 	(gs.getTile(x, y + 1).type.name !== 'CavePit' && gs.getTile(x, y - 1).type.name !== 'CavePit')) {
				return true;
			}
		}
		
		if (gs.getTile(x, y).type.name === 'DungeonPit') {
			if (gs.getIndexListCardinalAdjacent({x: x, y: y}).filter(idx => gs.getTile(idx).type.name === 'DungeonPit').length <= 1) {
				return true;
			}
		}
		
		return false;
	};
	
	while (change) {
		change = false;
		indexList.forEach(function (tileIndex) {
			if (isSinglePit(tileIndex.x, tileIndex.y)) {
				
				if (gs.getTile(tileIndex).type.name === 'CavePit') {
					gs.setTileType(tileIndex, gs.tileTypes.CaveFloor);
				}
				else {
					gs.setTileType(tileIndex, gs.tileTypes.Floor);
				}
				change = true;
			}
		}, this);
	}
};