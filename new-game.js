/*global gs, game, util, console, debug*/
/*global GameMetric, DungeonGenerator*/
/*global TILE_SIZE, FEATURE_TYPE, ZONE_TIER*/
/*global CLASS_LIST, ZONE_LINE_TYPE*/
/*jshint esversion: 6*/
'use strict';

// GET_DAILY_CHALLENGE_SEED:
// ************************************************************************************************
gs.getDailyChallengeSeed = function () {
	let date = new Date();
	return "" + date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
};

// NEW_GAME:
// ************************************************************************************************
gs.newGame = function () {
	// Force a seed from debugProperties:
	if (this.debugProperties.seed) {
		this.seed = this.debugProperties.seed;
		this.isDailyChallenge = false;
		util.seedRand([this.seed]);
	}
	// Daily challenge seed:
	else if (this.startDailyChallenge) {
		
		//this.playerRace = this.playerRaces.Human;
		
		this.seed = this.getDailyChallengeSeed();
		this.achievements.lastChallenge = this.seed;
		this.isDailyChallenge = true;
		
		util.writeFile('Achievements', JSON.stringify(gs.achievements));
		
		util.seedRand([this.seed]);
		this.playerClass = util.randElem(CLASS_LIST);
		this.playerRace = util.randElem(gs.playerRaceList);
	}
	// Set Seed:
	else if (this.setSeed) {
		this.seed = this.setSeed.toLowerCase();
		this.isDailyChallenge = false;
		util.seedRand([this.seed]);
	}
	// Random seed:
	else {	
		this.seed = '' + (Date.now() - 1639600000000);
		this.isDailyChallenge = false;
		util.seedRand([this.seed]);
	}
	
	// Logging:
	this.nextCloudID = 0;
	
	// Generation:
	DungeonGenerator.generate();
	
	
	// Keeping track of generated stuff to never double gen:
	this.previouslySpawnedVaults = [];
	this.previouslySpawnedItemList = [];
	this.previouslySpawnedCrystalChestItemSets = [];
	this.previouslySpawnedMerchantItemSets = [];
	
	// Setup Player:
	this.pc.setRace(this.playerRace);
	this.pc.setClass(this.playerClass);
	
	
	// Setup Level:
	this.zoneName = null;
	if (gs.debugProperties.startZoneName) {
		this.changeLevel(gs.debugProperties.startZoneName, gs.debugProperties.startZoneLevel);
	}
	else {
		this.changeLevel('TheUpperDungeon', 1);
	}
	
	this.savedTime = 0;
	this.hasNPCActed = false;
	
	// Setup Discovered Zone List:
	gs.pc.discoveredZoneList = [
		{zoneName: this.zoneName, zoneLevel: this.zoneLevel, features: []},
	];
	
	// Setup Player in World:
	this.pc.sprite.visible = true;
	this.setPlayerStartTileIndex();
	
	// Save in case the player dies right away:
	this.saveLevel();
	this.saveWorld();

	if (gs.debugProperties.onNewGame) {
		this.onNewGame();
	}
	
	this.focusCameraOnPC();
	
	if (gs.debugProperties.metricRunFullGame) {
		GameMetric.runFullGame();
	}
	
	if (gs.debugProperties.metricTestSingleZone) {
		GameMetric.testZone();
	}
	
	if (gs.debugProperties.levelViewMode) {
		debug.initLevelViewMode();
	}
};

// SET_PLAYER_START_TILE_INDEX:
// ************************************************************************************************
gs.setPlayerStartTileIndex = function () {
	let tileIndex = null,
		upStairs = gs.objectList.find(obj => obj.type.zoneLineType === ZONE_LINE_TYPE.UP_STAIRS),
		pcSpawnPoint = gs.objectList.find(obj => obj.type === gs.objectTypes.PCSpawnPoint);
	
	// PCSpawnPoint Object:
	if (pcSpawnPoint) {
		tileIndex = pcSpawnPoint.tileIndex;
	}
	// Debug Properties:
	else if (gs.debugProperties.startTileIndex) {
		tileIndex = gs.debugProperties.startTileIndex;
	}
	// Warp to Level: (we must be warping to a level since otherwise UD:1 never has up stairs)
	else if (upStairs) {
		tileIndex = upStairs.tileIndex;
	}
	// Standard Game:
	else {
		tileIndex = this.getSafestIndex();
	}
		
	this.pc.body.snapToTileIndex(tileIndex);
};





// LOAD_RANDOM_MAP_AS_BACKGROUND:
// ************************************************************************************************
gs.loadRandomMapAsBackground = function () {	
	// Load Map:
	gs.debugProperties.mapExplored = true;
	gs.debugProperties.mapVisible = true;
	gs.debugProperties.spawnMobs = true;
	gs.debugProperties.spawnZoos = true;
	gs.debugProperties.generateGlobalStuff = true;
	
    // Clearing previously spawned lists:
	gs.previouslySpawnedVaults = [];
	gs.previouslySpawnedItemList = [];
	gs.previouslySpawnedCrystalChestItemSets = [];
	gs.previouslySpawnedMerchantItemSets = [];
	
    // Seed:
	gs.seed = '' + Date.now();
    
    // Random Zone:
	gs.zoneName = util.randElem([
		'TheUpperDungeon',
		'TheVaultOfYendor',
		ZONE_TIER.Wilderness.zoneList,
		ZONE_TIER.Branch1.zoneList,
		ZONE_TIER.Branch2.zoneList,
	].flat());
	
	// Random Zone Level:
	gs.zoneLevel = util.randInt(1, gs.zoneTypes[gs.zoneName].numLevels);
	
	// Used to force Dungeon-Generator to select zone:
	gs.debugProperties.startZoneName = gs.zoneName;
	
    // Dungeon-Generator:
    DungeonGenerator.generate();
	
	gs.debugProperties.startZoneName = null;
    
    // Generate the level:
	gs.generateLevel();
	
	// Set map visible:
	gs.exploreMap();
	gs.getAllIndex().forEach(function (tileIndex) {
		gs.getTile(tileIndex).visible = true;
	}, this);
	
	// Focus Camera:
	game.world.bounds.setTo(-1000, -1000, (this.numTilesX - 1) * TILE_SIZE + 2000, (this.numTilesY - 1) * TILE_SIZE + 3000);
	game.camera.setBoundsToWorld();

	// Make sure NPCs are visible and not displaying their hud info
	gs.updateTileMapSprites();
	gs.characterList.forEach(function (npc) {
		npc.updateFrame();
		npc.statusText.visible = false;
		
		if (npc.hpBar) {
			npc.hpBar.visible = false;
			npc.hpBarRed.visible = false;
		}
		else {
			npc.hpText.visible = false;
			
			if (npc.mpText) {
				npc.mpText.visible = false;
			}
		}
		npc.ringSprite.visible = false;
	}, this);
	
	this.pc.sprite.visible = false;
};