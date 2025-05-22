/*global gs, console, debug, pcx, pcy, date, util, irynaDebug*/
/*global ItemSlotList, ItemSlot, CharacterInventory, Item, ItemGenerator, VaultTypeLoader, TomeGenerator*/
/*global VAULT_PLACEMENT*/
/*jshint esversion: 6*/
'use strict';
let coltenDebug = {};

// SET_DEBUG_PROPERTIES:
// ************************************************************************************************
coltenDebug.setDebugProperties = function () {
	gs.versionStr = '1.37.7';
	
	gs.debugProperties = {
		throwExceps: true,
		showAreas: false,
		mapVisible: false,
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
			rewardVault: null // {rewardType: 'CrystalChest', doorType: 'TimedDoor'}
		},
		
		// Level Generation:
		seed: null,
		mapExplored: false, // false
		spawnMobs: true  , // true
		spawnStaticMobs: true,
		spawnDungeonFeatures: false,
		
		// Character:
		startClass: 'FireMage',
		startRace: 'Human',
		
		// Start Position:
		startZoneName: 'TheVaultOfYendor', // Use 'TestZone' for dev
		startZoneLevel: 4,
		//startTileIndex: {x: 11, y: 20},
		
		// Force Features:
		//forceVaultType: 'TheUpperDungeon/Challenge/Solid/GoblinDropWall01',
		//forceVaultType: 1803,
		//levelGenerator: LevelGeneratorMajorVault,
		//levelGenerator: LevelGeneratorStatic,
        //levelGenerator: LevelGeneratorSwampBridges,
		// ID Features:
		idVaultsWithTileType: null, //'ToxicWaste'
		idVaultsWithTileFrame: null, // 576
		idVaultsWithObjectType: null, //'SteamVent'
		idVaultsWithObjectFrame: null,
		idVaultsList: [],
		
		// Game Play:
		allowRespawn: true,
		disableMana: false, // false
		disableDamage: false, // false
		warpStairs: false,
		enableDebugKey: true,
		npcCanAgro: true, // true
		levelViewMode: false,
		
		// Game Metric:
		//metricRunFullGame: false,
		//metricTestSingleZone: 'TheCore',
	
		// Should be set false in live version
		// Setting to true will throw levelGen exceptions
		// Normally these would cause levelGen to re-execute
		throwAllExceptions: false, // false
		logLevelGenExceptions: false,
	};
	
	//gs.clearDebugProperties();
};

// ON_NEW_GAME:
// ************************************************************************************************
coltenDebug.onNewGame = function () {
	// STARTING ATTRIBUTES:
	//debug.setPlayerLevel(16);
	debug.learnTalent('ConeOfCold');
	gs.pc.baseAttributes.intelligence = 20;
	gs.pc.baseAttributes.strength = 20;
	gs.pc.baseAttributes.dexterity = 20;
	gs.pc.exp = 249;
	gs.pc.inventory.gold = 500;
	gs.pc.attributePoints = 1;
	gs.pc.talentPoints = 6;
	debug.addItem('RingOfStrength');
	debug.addEquipment('BootsOfFlight');
	debug.addEquipment('BattleAxe');
    debug.addItem('PotionOfHealing');

	// Update stats:
	gs.pc.updateStats();
	gs.pc.currentSp = gs.pc.maxSp;
	gs.pc.currentMp = gs.pc.maxMp;
	debug.learnTalent('DashAttack');
    debug.learnTalent('Charge');
	debug.addItem('TomeOfDueling');
    debug.addItem('TomeOfDueling');
	debug.addItem('TomeOfPyromancy');
	debug.addItem('TomeOfPyromancy');
	debug.addItem('ScrollOfFear');
	debug.addItem('WandOfDraining');
	debug.addItem('ScrollOfDomination');

    
    //console.log("Foo");
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
		gs.objectList.find(obj => obj.type.name === 'TomeOfKnowledge').talentList = TomeGenerator.getTomeOfKnowledgeTalentList(2);
	}
	
	// Setting Start State:
	//gs.stateManager.pushState('ShopMenu');
	
	// LOAD_PC:
	// Branch-II
	//debug.loadPlayer('Branch-II-Warrior');
	//debug.loadPlayer('Branch-II-StormMage');
	//debug.loadPlayer('Branch-II-Ranger');
	//debug.loadPlayer('Branch-II-Necromancer');
	//debug.loadPlayer('Branch-II-Barbarian');
	//debug.loadPlayer('Branch-II-FireMage');
	
	// Branch-II-Boss
	//debug.loadPlayer('Boss-Branch-II-Warrior');
	//debug.loadPlayer('Boss-Branch-II-StormMage');
	//debug.loadPlayer('Boss-Branch-II-Ranger');
	
	// Yendor:
	debug.loadPlayer('Yendor-Warrior-1.39');
	//debug.loadPlayer('Yendor-Barbarian');
	//debug.loadPlayer('Yendor-Ranger-1.39');
	//debug.loadPlayer('Yendor-IceMage');
	//debug.loadPlayer('Yendor-FireMage');
	//debug.loadPlayer('Yendor-Necro-1.39');
	//debug.loadPlayer('Yendor-StormMage');
};