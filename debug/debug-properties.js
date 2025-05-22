/*global gs, console, debug, pcx, pcy, date, util, irynaDebug, coltenDebug*/
/*global ItemSlotList, ItemSlot, CharacterInventory, Item, ItemGenerator, VaultTypeLoader, TomeGenerator*/
/*global VAULT_PLACEMENT*/
/*jshint esversion: 6*/
'use strict';

// SET_DEBUG_PROPERTIES:
// ************************************************************************************************
gs.setDebugProperties = function () {
	this.versionStr = '2.0.8';
	
	gs.loadGlobalData();
	if (gs.globalData.debugProfile === 'Iryna') {
		irynaDebug.setDebugProperties();
		return;
	}
	if (gs.globalData.debugProfile === 'Colten') {
		coltenDebug.setDebugProperties();
		return;
	}
	
	this.debugProperties = {
		throwExceps: true,
		showAreas: false,
		
		showCharactersOnMap: false,
		generateGlobalStuff: true,
		saveLevels: true,
		allowFastTravel: false, // false
		logAStarTunnels: false,
		logStats: true,
		showDebugText: true,
		onNewGame: true,
		
		// Force Zones:
		forceZones: {
			Wilderness: null,
			Tier3: null,
			Branch1: null,
			Branch2: null,
		},
		
		
		// Test Area:
		testAreaGenerator: {
			isOn: false,
			areaGenerator: null, //AreaGeneratorCircle,
			vaultTypeName: 902,
			rewardVault: {rewardType: 'CrystalChest', doorType: 'TimedDoor'}
		},
		
		// Level Generation:
		seed: null, // null
		mapExplored: false, // false
		mapVisible: false,
		spawnMobs: true, // true
		spawnStaticMobs: true,
		spawnDungeonFeatures: true,
		
		// Character:
		startClass: 'Warrior',
		startRace: 'Vampire',
		
		// Start Position:
		startZoneName: 'TestZone', // Use 'TestZone' for dev
		startZoneLevel: 1,
		//startTileIndex: {x: 11, y: 20},
		
		// Force Features:
		//forceVaultType: 2193,
		//levelGenerator: LevelGeneratorStatic,
		
		// ID Features:
		idVaultsWithTileType: null, //'ToxicWaste'
		idVaultsWithTileFrame: null, // 576
		idVaultsWithObjectType: null, //'SteamVent'
		idVaultsWithObjectFrame: null,
		idVaultsWithNPCType: null,
		idVaultsList: [],
		
		// Game Play:
		allowRespawn: true,
		disableMana: true, // false
		disableDamage: true, // false
		warpStairs: false,
		enableDebugKey: true,
		npcCanAgro: true, // true
		levelViewMode: false,
		
		// Game Metric:
		//metricRunFullGame: false,
		//metricTestSingleZone: 'TheVaultOfYendor',
	
		// Should be set false in live version
		// Setting to true will throw levelGen exceptions
		// Normally these would cause levelGen to re-execute
		throwAllExceptions: false, // false
		logLevelGenExceptions: true,
	};
	
	this.clearDebugProperties();
	
	//this.debugProperties.startZoneName = 'TheVaultOfYendor';
	//this.debugProperties.startZoneLevel = 5;
	//this.debugProperties.allowRespawn = true;
	//this.debugProperties.forceZones.Branch1 = 'TheCore';
	//this.debugProperties.enableDebugKey = true;
	
	// Forcing zones in a standard game:
	/*
	this.debugProperties.forceZones.Wilderness 	= 'TheUnderGrove';
	this.debugProperties.forceZones.Tier3 		= 'TheDarkTemple';
	this.debugProperties.forceZones.Branch1 	= 'TheSewers';
	this.debugProperties.forceZones.Branch2 	= 'TheCrypt';
	*/
	
};

// ON_NEW_GAME:
// ************************************************************************************************
gs.onNewGame = function () {
	if (gs.globalData.debugProfile === 'Iryna') {
		irynaDebug.onNewGame();
		return;
	}
	if (gs.globalData.debugProfile === 'Colten') {
		coltenDebug.onNewGame();
		return;
	}
	
	this.debugLog();
	
	// STARTING ATTRIBUTES:
	//gs.pc.baseAttributes.strength = 24;
	//gs.pc.baseAttributes.intelligence = 20;
	//gs.pc.baseAttributes.dexterity = 24;
	
	debug.learnTalent('Confusion');
	debug.addItem('Javelin');
	debug.addItem('Bomb');
	debug.addItem('Chakram');
	
	// Update stats:
	gs.pc.updateStats();
	gs.pc.currentHp = gs.pc.maxHp;
	gs.pc.currentSp = gs.pc.maxSp;
	gs.pc.currentMp = gs.pc.maxMp;
	
	gs.pc.currentHp = 1;
	
	
	

	
	//gs.characterList.find(char => char.type.name === 'CannonModule').death();
	//gs.characterList.find(char => char.type.name === 'PyroModule').death();
	

	/*
	gs.characterList.forEach(function (char) {
		if (char.faction === FACTION.HOSTILE && char.type.name !== 'TheVampireLord') {
			char.destroy();
		}
	}, this);
	*/

	
	// CREATE_NPCS::
	// ex. debug.createNPC('DervishArcher');
	
	// ADD_ITEMS::
	// ex. debug.addItem('RingOfSpiritShielding');
	
	// EQUIPMENT:
	// ex. debug.addEquipment('PlateArmor');
	//debug.addEquipment('BootsOfFlight');
	
	// LEARN_TALENTS:
	// ex. gs.pc.addAbility(gs.abilityTypes.SandBlast);
	// ex. debug.learnTalent('Charge');
	
	// Stocking NPCs:
	//gs.stockMerchant();
	//gs.stockLibrary();
	
	// Stocking Tome of Knowledge:
	
	if (gs.objectList.find(obj => obj.type.name === 'TomeOfKnowledge')) {
		gs.objectList.find(obj => obj.type.name === 'TomeOfKnowledge').talentList = TomeGenerator.getTomeOfKnowledgeTalentList(1);
	}
	
	
	// Yendor 1.39 w/ Attribute point changes:
	//debug.loadPlayer('Yendor-Warrior-1.39');
	//debug.loadPlayer('Yendor-Barbarian-1.39');
	//debug.loadPlayer('Yendor-Ranger-1.39');
	//debug.loadPlayer('Yendor-StormMage-1.39');
	//debug.loadPlayer('Yendor-FireMage-1.39');
	//debug.loadPlayer('Yendor-Necromancer-1.39');

	//debug.loadPlayer('Yendor-Ogre-StormMage-1.40');
	
	// AUTO_GENERATE:
	// Once a crash is detected in Auto-Generate can use the seed to replicate the exact perameters here:
	// *********************************************************************************************
	/*
	gs.zoneName = 'TheOrcFortress';
	gs.previouslySpawnedVaults = [];
	gs.seed = "1628878635827";
		
	// Refresh level-features:
	DungeonGenerator.generate();
	
	// Generate Levels:
	for (let zl = 1; zl <= 3; zl += 1) {
		console.log('ZL:' + zl);
		gs.changeLevel(gs.zoneName, zl, true);
	}
	*/
	
	
	
};

gs.debugLog = function () {
	// Logging Vaults:
	let vaultTypeList = gs.vaultTypeList;
	
	// Filtering by NPC Type:
	vaultTypeList = vaultTypeList.filter(vaultType => util.inArray('TheSkeletalChampion', vaultType.npcTypeNameList));
	
	//VaultTypeLoader.countVaults();
	
	//console.log(vaultTypeList);
	
	// Logging Item Stats:
	/*
	let table = [];
	let itemTypeList = gs.itemTypeList;
	itemTypeList.forEach(function (itemType) {
		if (itemType.stats) {
			for (let statName in itemType.stats) {
				if (itemType.stats.hasOwnProperty(statName) && statName !== 'encumberance' && statName !== 'damage') {
					if (itemType.stats[statName] > 6) {
						table.push({
							name: itemType.name,
							stat: statName + ': ' + itemType.stats[statName],
						});
					}
				}
			}
		}
	}, this);
	console.table(table);
	*/
	
	/*
	// Logging Items:
	let table = [];
	let itemTypeList = gs.itemTypeList.filter(itemType =>itemType.slot === ITEM_SLOT.RANGE);
	itemTypeList.forEach(function (itemType) {
		table.push({
			name: itemType.name,
			tier: itemType.tier,
			damage: itemType.stats.damage
		});
	});
	console.table(table);
	*/
	
	// Logging NPCs:
	/*
	let table = [];
	let npcTypeList = gs.npcTypeList.filter(npcType => npcType.isBoss);
	npcTypeList.forEach(function (npcType) {
		table.push({
			name: npcType.name,
			item: npcType.dropTable ? npcType.dropTable[0].name : null
		});
	});
	console.table(table);
	*/
	
	//VaultTypeLoader.countEntranceVaults();
	//VaultTypeLoader.countVaults();
	//VaultTypeLoader.countBossVaults();
	
	// LOG_CONTENT_COUNT:
	//gs.logContentCount();
};

gs.onDebugKey = function () {
	if (this.debugProperties.enableDebugKey) {
		if (gs.globalData.debugProfile === 'Iryna') {
			irynaDebug.onDebugKey();
			return;
		}
		
		
		
		
		//debug.clearLevel();
		debug.regenLevel();
		
		if (gs.objectList.find(obj => obj.type.niceName === 'Conveyor Belt' && !gs.getTile(obj.tileIndex).type.passable)) {
			gs.debugProperties.enableDebugKey = false;
		}
		
		//debug.takeScreenShot();
		
		//gs.createReviveSkeletonEffect(gs.pc.tileIndex);
		
		//gs.createPoisonEffect(gs.pc.tileIndex);
		
		//gs.createHeartEffect(gs.pc.tileIndex);
		//gs.playSound(gs.sounds.cure);
		
		//gs.createAnimEffect({x: gs.pc.sprite.position.x, y: gs.pc.sprite.position.y  + 15}, 'Hearts');	
	}
};

// CLEAR_DEBUG_PROPERTIES:
// ************************************************************************************************
gs.clearDebugProperties = function () {
	this.debugProperties = {
		throwExceps: true,
		showAreas: false,
		mapVisible: false,
		showCharactersOnMap: false,
		npcCanAgro: true, // true
		generateGlobalStuff: true,
		allowRespawn: false,
		saveLevels: true,
		testLevel: false, // false (generates a flat level)
		allowFastTravel: false, // false
		menuMap: true,
		showDebugText: true,
		seed: null,
		enableDebugKey: false,
		
		// Commonly used:
		startClass: null ,//'FireMage', //'Ranger', //'FireMage',
		startZoneName: 'TheUpperDungeon',
		startZoneLevel: 1, // 1
		mapExplored: false, // false
		spawnMobs: true, // true
		spawnStaticMobs: true,
		spawnDungeonFeatures: true,
		disableMana: false, // false
		disableDamage: false, // false
		logStats: true,
		
		// Test Area:
		testAreaGenerator: {isOn: false},
		levelGenerator: null,
		
		// Force Zones:
		forceZones: {
			Wilderness: null,
			Branch1: null,
			Branch2: null,
		},
	};
};

// ASSERT_EQUAL:
// ************************************************************************************************
var ASSERT_EQUAL = function (value, expected, message = "") {
	if (value !== expected) {
		throw 'ASSERT_EQUAL: ' + message;
	}
};

// ASSERT_THROW:
// Make sure the function throws an exception
// ************************************************************************************************
var ASSERT_THROW = function (func, message) {
	try {
		func.apply(this);
	}
	catch (msg) {
		return;
	}
	
	throw 'ASSERT_THROW: ' + message;
};


