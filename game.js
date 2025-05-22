/*global game, Phaser, menuState, loseState, console, winState, util, nw, window, input*/
/*global ClassSelectMenu, RaceSelectMenu, UIRecordMenu, MainMenu, MainMenuBase*/
/*global PlayerCharacter, NPC, Container, Shop, gameMetric, ItemSlotList, FrameSelector, levelController, ItemGenerator, DungeonGenerator*/
/*global UIStatMenu, UICharacterMenu, UIShopMenu, UIDialogMenu, UIEnchantmentMenu, UIAcquirementMenu, UITransferanceMenu, UILibraryMenu, HUD*/
/*global UIGameMenu, UIOptionsMenu, UIUseMenu, UIWieldMenu, UIControlsMenu, UIStateManager, UIGotoMenu, UINewRecordMenu, UIRecordMenuV2, UIStatTablesMenu*/
/*global UINewGameMenu, UISeedGameMenu*/
/*global TomeGenerator, CrystalChestGenerator, VaultLoader*/
/*global SPAWN_ENEMY_TURNS*/
/*global NUM_SCREEN_TILES_X, TILE_SIZE, LOS_DISTANCE, HUGE_WHITE_FONT*/
/*global MERCHANT_INVENTORY_WIDTH, MERCHANT_INVENTORY_HEIGHT*/
/*global HUD_WIDTH, FRIENDLY_NPC_LIST*/
/*global CLASS_LIST, RACE_LIST*/
/*global VaultTypeLoader, achievements, steam*/

/*jshint white: true, laxbreak: true, esversion: 6*/
'use strict';


var gs = {};

// PRELOAD:
// ************************************************************************************************
gs.preload = function () {
	game.time.advancedTiming = true;
};

// CREATE:
// ************************************************************************************************
gs.create = function () {
	this.setDebugProperties();
	
	this.timer = game.time.create(false);
	
	// Init Achievements:
	if (steam.isConnected) {
		achievements.init();
	}
	
	
	// Data (Achievements and Help):
	this.loadGlobalData();
	
	// Lists:
	this.floorItemList = [];
	this.characterList = [];
	this.projectileList = [];
	this.particleList = [];
	this.cloudList = [];
	this.damageText = [];
	this.objectList = [];
	this.syncedAnimObjectsList = [];
	this.particleGeneratorList = [];

	// Sprite Groups (for layering):
	this.createSpriteGroups();
	
	// Create Types:
	this.createAbilityTypes();
	this.createPlayerType();
	this.createNPCTypes();
	this.createAnimEffectTypes();
	this.createStatusEffectTypes();
	this.createTileTypes();
	this.createProjectileTypes();
	this.createNPCGroupTypes();
	this.createSpawnTables();
	this.createZoneTileFrames();
	this.createZoneTypes();
	this.createObjectTypes();
	
	
	
	this.createUniqueNPCTypes();
	this.createTalents();
	this.setAbilityTypeDefaults();
	this.createItemTypes();
	this.createReligionTypes();
	this.createCloudTypes();
	this.createPlayerClasses();
	this.createPlayerRaces();
	this.createNPCClassTypes();
	
	
	
	// Init Sub-Systems:
	FrameSelector.init();
	ItemGenerator.init();
	CrystalChestGenerator.init();
	
	VaultTypeLoader.parseVaultTypeFiles();
	
	this.verifyNPCTypes();
	
	// Create Pools:
	this.createParticlePool();
	this.createObjectPool();
	this.createNPCPool();
	this.createProjectilePool();
	
	// Initiate Zone:
	this.createTileMapSprites();
	
	// Verification:
	VaultTypeLoader.verifyVaultTypes();
	
	// Sound:
	this.soundOn = true;//this.globalData.soundOn;
	this.musicOn = this.globalData.musicOn;
	this.soundVolume = this.globalData.soundVolume;
	this.musicVolume = this.globalData.musicVolume;
	this.fullScreen = this.globalData.fullScreen;
	this.setMusicVolume(this.musicVolume);
	
	if (this.fullScreen) {
		nw.Window.get().enterFullscreen();
	}
	else {
		nw.Window.get().leaveFullscreen();
	}
	
	
	
	// Player:
	input.createKeys();
	this.createPlayerCharacter();
	this.createLoSRays();
	
	// Merchent Inventory (shared between all merchants):
	this.merchantInventory = new ItemSlotList(MERCHANT_INVENTORY_WIDTH * MERCHANT_INVENTORY_HEIGHT);
	
	// Interface:
	this.createHUDSprites();
	this.HUD = new HUD();
	
	// Create Game Menus:
	
	this.shopMenu = new UIShopMenu();
	this.characterMenu = new UICharacterMenu();
	this.enchantmentMenu = new UIEnchantmentMenu();
	this.acquirementMenu = new UIAcquirementMenu();
	this.transferanceMenu = new UITransferanceMenu();
	this.libraryMenu = new UILibraryMenu();
	this.gameMenu = new UIGameMenu();
	this.useMenu = new UIUseMenu();
	this.wieldMenu = new UIWieldMenu();
	this.gotoMenu = new UIGotoMenu();
	
	
	// Create Main Menus:
	this.mainMenu = new MainMenu();
	this.mainMenuBase = new MainMenuBase();
	this.newGameMenu = new UINewGameMenu();
	this.seedGameMenu = new UISeedGameMenu();
	this.classSelectMenu = new ClassSelectMenu();
	this.raceSelectMenu = new RaceSelectMenu();
	this.recordMenu = new UIRecordMenuV2();
	this.statTablesMenu = new UIStatTablesMenu();
	this.optionsMenu = new UIOptionsMenu();
	this.controlsMenu = new UIControlsMenu();
	
	// Dialog menu is last so that it appears on top:
	this.dialogMenu = new UIDialogMenu();
	
	// Create last as it must capture all of the menus
	this.stateManager = new UIStateManager();
	
	
	// Forcing quick start:
	if (gs.debugProperties.startClass) {
		gs.clearGameData();
		gs.playerClass = gs.debugProperties.startClass;
		gs.playerRace = gs.playerRaces[gs.debugProperties.startRace];
		gs.startGame();
	}
	// Starting main menu as normal:
	else {
		this.startMainMenu();
	}
};

// CREATE_SPRITE_GROUPS:
// ************************************************************************************************
gs.createSpriteGroups = function () {
	this.tileMapSpritesGroup = game.add.group();
	this.floorObjectSpritesGroup = game.add.group();
	this.lightSpritesGroup = game.add.group();
	this.ringSpritesGroup = game.add.group();
	this.underObjectSpritesGroup = game.add.group();
	this.objectSpritesGroup = game.add.group();
	this.overObjectSpritesGroup = game.add.group();
	this.shadowSpritesGroup = game.add.group();
	this.cloudSpritesGroup = game.add.group();
	this.hudTileSpritesGroup = game.add.spriteBatch();
	this.characterHUDGroup = game.add.group();
	this.popUpTextSpritesGroup = game.add.group();
	this.projectileSpritesGroup = game.add.group();
	
	// Performance:
	// Post Update:
	this.tileMapSpritesGroup.noPostUpdate = true;
	//this.floorObjectSpritesGroup.noPostUpdate = true;
	this.objectSpritesGroup.noPostUpdate = true;
	this.projectileSpritesGroup.noPostUpdate = true;
	this.hudTileSpritesGroup.noPostUpdate = true;
	this.characterHUDGroup.noPostUpdate = true;
	this.popUpTextSpritesGroup.noPoseUpdate = true;

	// Pre Update:
	this.tileMapSpritesGroup.noPreUpdate = true;
	//this.floorObjectSpritesGroup.noPreUpdate = true;
};

// START_MAIN_MENU:
// ************************************************************************************************
gs.startMainMenu = function () {
	// Distinguish between main menu and game:
	this.globalState = 'MAIN_MENU_STATE';
	this.stateManager.clearStates();
	
	// Data (Achievements and Help):
	this.loadGlobalData();
	
	this.mainMenu.open();
	this.mainMenuBase.open();
	
	//console.log('Forcing records menu open');
	//gs.stateManager.pushState('SeedGameMenu', null, false);
	//gs.stateManager.pushState('RecordMenu', null, false);
	//gs.stateManager.pushState('StatTablesMenu', null, false);
	//gs.stateManager.pushState('NewGameMenu', null, false);
	
	this.HUD.close();
	this.pc.sprite.visible = false;
	
	if (this.pc.hpBar) {
		this.pc.hpBar.visible = false;
		this.pc.hpBarRed.visible = false;
		this.pc.mpBar.visible = false;
		this.pc.mpBarRed.visible = false;
	}
	
	
	// Make sure to clear status effects in case stuff like web sprite must be destroyed
	this.pc.statusEffects.clear();
};

// START_GAME:
// ************************************************************************************************
gs.startGame = function () {
	gs.hasGameStarted = false;
	
	this.setDebugProperties();
	
	// Distinguish between main menu and game:
	this.globalState = 'GAME_STATE';
	this.mainMenu.close();
	this.mainMenuBase.close();
	
	// Game proporties:
	this.stateManager.clearStates();
	this.characterMenu.talentPanel.pageNum = 1;
	this.turn = 0;
	this.globalTurnTimer = 0;
	this.activeCharacterIndex = 0;
	this.pauseTime = 0;
	
	
	// Reset Player:
	this.pc.reset();
	this.HUD.abilityBar.clear();
	
	// Reset Merchant:
	this.merchantInventory.clear();
	
	// Reset Library:
	this.libraryTalents = [];
	
	
	
	// New Game or Load Game:
	if (util.doesFileExist('WorldData')) {
		this.loadWorld();
	} 
	else {
		this.newGame();
	}
	
	if (!gs.debugProperties.levelViewMode) {
		this.pc.updateStats();
		this.HUD.open();
		this.HUD.refresh();
		this.HUD.miniMap.refresh(true);
		this.startTime = Date.now();
	}
	
	
	gs.hasGameStarted = true;
	
	// Start Timer:
	this.timer = game.time.create(false);
	this.timer.start();
	this.timer.pause();
};


// START_MUSIC:
// Starts the appropriate music for the zone:
// ************************************************************************************************
gs.startMusic = function () {
	if (this.zoneType().musicTrack) {
		this.getZoneMusic(this.zoneName).fadeIn(1000, true);
	}
};

// STOP_ALL_MUSIC:
// ************************************************************************************************
gs.stopAllMusic = function () {
	this.musicList.forEach(function (track) {
		track.stop();
	}, this);
};


// PLAY_SOUND:
// ************************************************************************************************
gs.playSound = function (sound, tileIndex) {
	if (!tileIndex || gs.getTile(tileIndex).visible || util.distance(gs.pc.tileIndex, tileIndex) < 10) {
		if (this.soundOn) {
			sound.play(null, null, gs.soundVolume);
		}
	}
};

// GAME_TIME:
// Returns the time since starting new game.
// Takes loading and continuing into account
// ************************************************************************************************
gs.gameTime = function () {
	return this.timer.ms + gs.savedTime;
};



// SET_STATE:
// ************************************************************************************************
gs.setState = function (newState) {
	this.state = newState;
};

// SET_MUSIC_VOLUME:
// ************************************************************************************************
gs.setMusicVolume = function (volume) {
	gs.musicList.forEach(function (music) {
		music.volume = volume;
	}, this);
};

// ON_WINDOW_CLOSE:
// ************************************************************************************************
gs.onWindowClose = function () {
	if (gs.globalState === 'GAME_STATE' && gs.pc.isAlive) {
		gs.saveLevel();
		gs.saveWorld();
	}
	
	gs.saveGlobalData();
};


// SAVE_WORLD:
// ************************************************************************************************
gs.saveWorld = function () {
	var data = {};
	
	// IDs:
	data.nextCharacterID 			= this.nextCharacterID;
	data.nextObjectID 				= this.nextObjectID;
	data.nextCloudID 				= this.nextCloudID;

	// World:
	data.isDailyChallenge 			= this.isDailyChallenge || false;
	data.seed 						= this.seed;
	data.setSeed					= this.setSeed;
	
	// Player Location:
	data.zoneName 					= this.zoneName;
	data.zoneLevel 					= this.zoneLevel;
	data.tileIndex 					= gs.pc.tileIndex;
	data.savedTime 					= this.gameTime();
	data.turn 						= this.turn;

	// Sub-Systems:
	data.crystalChestGenerator 		= CrystalChestGenerator.toData();
	data.dungeonGenerator 			= DungeonGenerator.toData();
	
	// Keeping track of what has spawned already:
	data.previouslySpawnedVaults 	= this.previouslySpawnedVaults;
	data.previouslySpawnedItemList 	= this.previouslySpawnedItemList;
	data.previouslySpawnedCrystalChestItemSets = this.previouslySpawnedCrystalChestItemSets;
	data.previouslySpawnedMerchantItemSets = this.previouslySpawnedMerchantItemSets;
	
	// Merchant and Librarian:
	data.libraryTalents 			= this.libraryTalents;
	data.merchantInventory 			= this.merchantInventory.toData();
	
	// Player:
	data.player						= this.pc.toData();
	
	// Save File:
	util.writeFile('WorldData', JSON.stringify(data));
	
	gs.saveGlobalData();
};

// LOAD_WORLD:
// ************************************************************************************************
gs.loadWorld = function () {
	var data = util.readFile('WorldData');
	
	// IDs:
	this.nextCharacterID 			= data.nextCharacterID;
	this.nextObjectID 				= data.nextObjectID;
	this.nextCloudID 				= data.nextCloudID;
	
	// World:
	this.isDailyChallenge 			= data.isDailyChallenge || false;
	this.seed 						= data.seed;
	this.setSeed					= data.setSeed;
	
	// Sub-Systems:
	CrystalChestGenerator.loadData(data.crystalChestGenerator);
	DungeonGenerator.loadData(data.dungeonGenerator);
	
	// Player Location:
	this.zoneName = null; // Need to add this to not save shit from the main menu level
	this.turn 						= data.turn || 0;
	this.savedTime 					= data.savedTime;
	
	// Keeping track of spawned stuff:
	this.previouslySpawnedVaults 		= data.previouslySpawnedVaults;
	this.previouslySpawnedItemList 		= data.previouslySpawnedItemList;
	this.previouslySpawnedCrystalChestItemSets = data.previouslySpawnedCrystalChestItemSets;
	this.previouslySpawnedMerchantItemSets = data.previouslySpawnedMerchantItemSets;
	
	// Merchant and Librarian:
	this.merchantInventory.loadData(data.merchantInventory);
	this.libraryTalents 				= data.libraryTalents || [];
	
	// Set Location:
	this.changeLevel(data.zoneName, data.zoneLevel);
	
	// Player:
	this.pc.loadData(data.player);
	this.pc.previousTileIndex = {x: data.tileIndex.x, y: data.tileIndex.y};
	this.pc.body.snapToTileIndex(data.tileIndex);
};