/*global game, gs, console, Phaser, util*/
/*global bspGenerator, caveGenerator, pitPathGenerator, DungeonGenerator*/
/*global cryptGenerator, sewerTunnelsGenerator, sewerRoadsGenerator, templateTempleGenerator, dungeonTunnelsGenerator*/
/*global templateIronForgeGenerator, lairGenerator, templateFortressGenerator, cryptTemplateGenerator*/
/*global sewerTemplateGenerator, centerGenerator, hallGenerator*/
/*global ZONE_TIER*/
/*global NUM_FOUNTAINS_PER_LEVEL*/

// LEVEL_GENERATORS:
/*global LevelGeneratorRoomGrid, LevelGeneratorCycles, LevelGeneratorMajorVault*/
/*global LevelGeneratorBSP, LevelGeneratorCave, LevelGeneratorSewersTunnels, LevelGeneratorArcane, LevelGeneratorCrypt*/
/*global LevelGeneratorRing, LevelGeneratorNarrowHalls, LevelGeneratorCaveRooms, LevelGeneratorPitPaths*/
/*global LevelGeneratorCryptTunnels, LevelGeneratorIronForgeTunnels, LevelGeneratorYendorLiquidTunnels*/
/*global LevelGeneratorWaterPaths, LevelGeneratorOrc1Cave, LevelGeneratorUpperDungeonCaveTunnels, LevelGeneratorStatic*/
/*global LevelGeneratorYendorCenter, LevelGeneratorLavaIslands, LevelGeneratorConnectedCircles, LevelGeneratorTemple, LevelGeneratorWaterBridges*/
/*global LevelGeneratorSlimePit, LevelGeneratorMajorCrypt, LevelGeneratorIronForgeLavaTunnels, LevelGeneratorLavaTunnels, LevelGeneratorClosedTombs*/
/*global LevelGeneratorCryptSmallTunnels, LevelGeneratorCryptBigTunnels, LevelGeneratorFactoryFloor, LevelGeneratorFactoryTunnels, LevelGeneratorConveyorBeltRooms*/
/*global LevelGeneratorArcanePitPaths, LevelGeneratorBossPortals*/

/*jshint esversion: 6, laxbreak: true*/
'use strict';

// CREATE_LEVEL_TYPES:
// ************************************************************************************************
gs.createZoneTypes = function () {
	this.zoneTypes = {};
	
	// TEST_ZONE:
	// ********************************************************************************************
	this.zoneTypes.TestZone = {
		zoneTier: ZONE_TIER.TheUpperDungeon,
		
		// Level Generation:
		numLevels: 12,
		tileFrames: this.zoneTileFrames.MainDungeon,
		vaultSets: ['TestZone'],
		
		// Spawning:
		noSpawn: true, // Just turns off global level population
		spawnTable: this.spawnTables.TheSewers,
		
		spawnToxicWaste: true,
		spawnLava: true,
		spawnWater: true,
		spawnPits: true,
		
		// Spawning
		noGlobalStuff: true,
		spawnFireShrooms: true,
		spawnGold: true,
		spawnItems: true,
		spawnSpikeTraps: true,
		
		
		generators: [
			{percent: 100, name: LevelGeneratorCycles},
		],
		
		// Used by Area-Generators when placing pillars
		// Used by Area-Generator-Vault to handle the pillarFlag
		pillarTypeTable: [
			// Pillar: 90% 
			{percent: 90, name: {objectTypeName: 'Pillar', objectFrame: 896}},
			
			// Other: 10%
			{percent: 10, name: [
				{percent: 1, name: {objectTypeName: 'Totem', objectFrame: 906}},
				{percent: 1, name: {objectTypeName: 'Brazier'}},
				{percent: 1, name: {objectTypeName: 'Tusk'}},
			]}
		]
	};
	
	// THE_UPPER_DUNGEON:
	// ********************************************************************************************
	this.zoneTypes.TheUpperDungeon = {
		zoneTier: ZONE_TIER.TheUpperDungeon,
		
		// Level Generation:
		numLevels: 4,
		tileFrames: this.zoneTileFrames.MainDungeon,
		musicTrack: this.music.TheUpperDungeon,
		vaultSets: ['_General', '_Dungeon', 'TheUpperDungeon'],
		
		generators: [	
			// Cave:
			{percent: 20, name: [
				{percent: 50, name: LevelGeneratorCave},
				{percent: 50, name: LevelGeneratorUpperDungeonCaveTunnels},
			]},
			
			// Dungeon:
			{percent: 70, name: [
				{percent: 10, name: LevelGeneratorNarrowHalls},
				{percent: 10, name: LevelGeneratorBSP},
            	{percent: 20, name: LevelGeneratorRoomGrid},
            	{percent: 20, name: LevelGeneratorCycles},
            	{percent: 20, name: LevelGeneratorMajorVault},
			]},
			
			// Static-Level:
			{percent: 10, name: LevelGeneratorStatic},
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheUpperDungeon,
		
		// Environment:
		spawnMushrooms: true,
		spawnShockReeds: true,
		spawnWater: true,
		spawnVines: true,
		spawnFireShrooms: true,
		spawnWallFlags: true,
		
		// Used by Area-Generators when placing pillars
		// Used by Area-Generator-Vault to handle the pillarFlag
		pillarTypeTable: [
			// Pillar: 90% 
			{percent: 90, name: {objectTypeName: 'Pillar', objectFrame: 896}},
			
			// Other: 10%
			{percent: 10, name: [
				{percent: 1, name: {objectTypeName: 'Totem', objectFrame: 906}},
				{percent: 1, name: {objectTypeName: 'Brazier'}},
				{percent: 1, name: {objectTypeName: 'Tusk'}},
			]}
		],
		
		subZones: [
			{zoneLevel: 1, zoneName: 'TheUpperDungeon01'},
		]
	};
	
	// THE_UPPER_DUNGEON_01:
	// No static levels
	// ********************************************************************************************
	this.zoneTypes.TheUpperDungeon01 = Object.assign({}, this.zoneTypes.TheUpperDungeon, {
		generators: [
			// Cave:
			{percent: 30, name: [
				{percent: 50, name: LevelGeneratorCave},
				{percent: 50, name: LevelGeneratorUpperDungeonCaveTunnels},
			]},
			
			// Dungeon:
			{percent: 70, name: [
				{percent: 10, name: LevelGeneratorNarrowHalls},
				{percent: 10, name: LevelGeneratorBSP},
            	{percent: 20, name: LevelGeneratorRoomGrid},
            	{percent: 20, name: LevelGeneratorCycles},
            	{percent: 20, name: LevelGeneratorMajorVault},
			]},
		],
	});
	
	// THE_UNDER_GROVE: (WILDERNESS)
	// ********************************************************************************************
	this.zoneTypes.TheUnderGrove = {
		zoneTier: ZONE_TIER.Wilderness,
		
		// Level Generation:
		numLevels: 4,
		tileFrames: this.zoneTileFrames.TheUnderGrove,
		musicTrack: this.music.TheUnderGrove,
		
		vaultSets: ['_General', 'TheUnderGrove'],
		generators: [
			{percent: 90, name: LevelGeneratorCave},
			{percent: 10, name: LevelGeneratorStatic},
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheUnderGrove,
							 
		// Environment:
		spawnMushrooms: true,
		spawnShockReeds: true,
		spawnWater: true,
		spawnVines: true,
		spawnBearTraps: true,
		spawnFirePots: true,
		spawnFireShrooms: true,
		
		// Used by Area-Generators when placing pillars
		// Used by Area-Generator-Vault to handle the pillarFlag
		pillarTypeTable: [
			// Pillar: 90% 
			{percent: 90, name: {objectTypeName: 'Pillar', objectFrame: 896}},
			
			// Other: 10%
			{percent: 10, name: [
				{percent: 1, name: {objectTypeName: 'Totem', objectFrame: 906}},
				{percent: 1, name: {objectTypeName: 'Brazier'}},
				{percent: 1, name: {objectTypeName: 'Tusk'}},
			]}
		]
	};
	
	// THE_SUNLESS_DESERT: (WILDERNESS)
	// ********************************************************************************************
	this.zoneTypes.TheSunlessDesert = {
		zoneTier: ZONE_TIER.Wilderness,
		
		// Level Generation:
		numLevels: 4,
		tileFrames: this.zoneTileFrames.TheSunlessDesert,
		musicTrack: this.music.TheUnderGrove,

		vaultSets: ['_General', 'TheSunlessDesert'],
		generators: [
			{percent: 90, name: LevelGeneratorCave},
			{percent: 10, name: LevelGeneratorStatic},
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheSunlessDesert,
		
		// Environment:
		spawnMushrooms: true,
		spawnShockReeds: true,
		spawnFirePots: true,
		spawnFireShrooms: true,
		
		// Used by Area-Generators when placing pillars
		// Used by Area-Generator-Vault to handle the pillarFlag
		pillarTypeTable: [
			// Pillar: 90% 
			{percent: 90, name: {objectTypeName: 'Pillar', objectFrame: 896}},
			
			// Other: 10%
			{percent: 10, name: [
				{percent: 1, name: {objectTypeName: 'Totem', objectFrame: 906}},
				{percent: 1, name: {objectTypeName: 'Brazier'}},
				{percent: 1, name: {objectTypeName: 'Tusk'}},
			]}
		]
	};
	
	// THE_SWAMP: (WILDERNESS)
	// ********************************************************************************************
	this.zoneTypes.TheSwamp = {
		zoneTier: ZONE_TIER.Wilderness,
		
		// Level Generation:
		numLevels: 4,
		tileFrames: this.zoneTileFrames.TheSwamp,
		musicTrack: this.music.TheUnderGrove,
		vaultSets: ['_General', 'TheSwamp'],
		generators: [
			{percent: 90, name: LevelGeneratorCave},
			{percent: 10, name: LevelGeneratorStatic},
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheSwamp,
		
		// Environment:
		spawnMushrooms: true,
		spawnShockReeds: true,
		spawnWater: true,
		spawnVines: true,
		spawnBearTraps: true,
		spawnFirePots: true,
		spawnFireShrooms: true,
		
		// Used by Area-Generators when placing pillars
		// Used by Area-Generator-Vault to handle the pillarFlag
		pillarTypeTable: [
			// Pillar: 90% 
			{percent: 90, name: {objectTypeName: 'Pillar', objectFrame: 896}},
			
			// Other: 10%
			{percent: 10, name: [
				{percent: 1, name: {objectTypeName: 'Totem', objectFrame: 906}},
				{percent: 1, name: {objectTypeName: 'Brazier'}},
				{percent: 1, name: {objectTypeName: 'Tusk'}},
			]}
		]
	};
	
	
	
	
	// THE_ORC_FORTRESS:
	// ********************************************************************************************
	this.zoneTypes.TheOrcFortress = {
		zoneTier: ZONE_TIER.Tier3,
		
		// Level Generation:
		numLevels: 6,
		tileFrames: this.zoneTileFrames.MainDungeon,
		musicTrack: this.music.TheUpperDungeon,
		vaultSets: ['_General', '_Tier3', 'TheOrcFortress', '_Dungeon'], 
		
		generators: [
			{percent: 30, name: LevelGeneratorMajorVault},
			{percent: 20, name: LevelGeneratorCycles},
			{percent: 10, name: LevelGeneratorRoomGrid},
			{percent: 10, name: LevelGeneratorBSP},
			{percent: 10, name: LevelGeneratorCave},
			{percent: 10, name: LevelGeneratorStatic},
			
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheOrcFortress,
		
		// Environment:
		spawnMushrooms: true,
		spawnShockReeds: true,
		spawnWater: true,
		spawnVines: true,
		spawnFireShrooms: true,
		spawnPits: true,
		spawnFirePots: true,
		spawnWallFlags: true,
		spawnEyeOfYendor: true,
		
		// Used by Area-Generators when placing pillars
		// Used by Area-Generator-Vault to handle the pillarFlag
		pillarTypeTable: [
			// Pillar: 90% 
			{percent: 90, name: {objectTypeName: 'Pillar', objectFrame: 896}},
			
			// Other: 10%
			{percent: 10, name: [
				{percent: 1, name: {objectTypeName: 'Totem', objectFrame: 906}},
				{percent: 1, name: {objectTypeName: 'Brazier'}},
				{percent: 1, name: {objectTypeName: 'Tusk'}},
			]}
		],
		
		subZones: [
			{zoneLevel: 6, zoneName: 'OrcEndLevel'},
		]
	};
	
	this.zoneTypes.OrcEndLevel = Object.assign({}, this.zoneTypes.TheOrcFortress, {
		generators: [
			{percent: 100, name: LevelGeneratorStatic}
		],
		spawnGold: false,
		spawnItems: false,
	});
	
	// THE_DARK_TEMPLE: (TIER_III)
	// ********************************************************************************************
	this.zoneTypes.TheDarkTemple = {
		zoneTier: ZONE_TIER.Tier3,
		
		// Level Generation:
		numLevels: 6,
		tileFrames: this.zoneTileFrames.TheDarkTemple,
		musicTrack: this.music.TheUpperDungeon,
		vaultSets: ['_General', '_Tier3', 'TheDarkTemple'],
		
		generators: [
			{percent: 40, name: LevelGeneratorMajorVault},
			{percent: 20, name: LevelGeneratorCycles},
			{percent: 30, name: LevelGeneratorConnectedCircles},
			{percent: 10, name: LevelGeneratorStatic},
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheDarkTemple,
		
		// Environment:
		spawnMushrooms: true,
		spawnShockReeds: true,
		spawnWater: true,
		spawnVines: true,
		spawnFireShrooms: true,
		spawnPits: true,
		spawnFirePots: true,
		spawnEyeOfYendor: true,
		
		// Used by Area-Generators when placing pillars
		// Used by Area-Generator-Vault to handle the pillarFlag
		pillarTypeTable: [
			// Pillar: 90% 
			{percent: 90, name: {objectTypeName: 'Pillar', objectFrame: 2944}},
			
			// Other: 10%
			{percent: 10, name: [
				{percent: 1, name: {objectTypeName: 'Brazier'}},
				{percent: 1, name: {objectTypeName: 'Candle'}},
			]}
		],
		
		subZones: [
			{zoneLevel: 6, zoneName: 'TheDarkTempleHighPriestess', pred: function () {
				return DungeonGenerator.getLevelFeatures('TheDarkTemple', 6).find(feature => feature.bossName === 'PorecsaTheHighPriestess');
			}},
			{zoneLevel: 6, zoneName: 'TempleEndLevel'},
		]
	};
	
	// TEMPLE_END_LEVEL:
	// ********************************************************************************************
	this.zoneTypes.TempleEndLevel = Object.assign({}, this.zoneTypes.TheDarkTemple, {
		generators: [
			{percent: 50, name: LevelGeneratorMajorVault},
			{percent: 50, name: LevelGeneratorStatic}
		],
		
		spawnGold: false,
		spawnItems: false,
	});
	
	// THE_DARK_TEMPLE_HIGH_PRIESTESS
	// ********************************************************************************************
	this.zoneTypes.TheDarkTempleHighPriestess = Object.assign({}, this.zoneTypes.TheDarkTemple, {
		generators: [
			{percent: 100, name: LevelGeneratorTemple}
		],
		
		spawnGold: false,
		spawnItems: false,
	});
	
	// THE_SEWERS: (BRANCH-1)
	// ********************************************************************************************
	this.zoneTypes.TheSewers = {
		zoneTier: ZONE_TIER.Branch1,
		
		// Level Generation:
		numLevels: 5,
		tileFrames: this.zoneTileFrames.TheSewers,
		musicTrack: this.music.TheIronForge,
		vaultSets: ['_General', 'TheSewers'],
		generators: [
			{percent: 50, name: LevelGeneratorSewersTunnels},
			{percent: 20, name: LevelGeneratorWaterPaths},
			{percent: 20, name: LevelGeneratorWaterBridges},
			{percent: 10, name: LevelGeneratorStatic},
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheSewers,
		
		// Environment:
		spawnMushrooms: true,
		spawnShockReeds: true,
		spawnVines: true,
		spawnGasPots: true,
		spawnFireShrooms: true,
		spawnToxicWaste: true,
		spawnWater: true,
		spawnEyeOfYendor: true,
		
		pillarTypeTable: [
			{percent: 100, name: {objectTypeName: 'Pillar', objectFrame: 3784}},
		],
		
		subZones: [
			{zoneLevel: 4, zoneName: 'TheSlimePit', pred: function () {
				return DungeonGenerator.getLevelFeatures('TheSewers', 5).find(feature => feature.bossName === 'ExpanderisTheSlimeKing');
			}},
			
			{zoneLevel: 5, zoneName: 'TheSewersEndLevel'},
		]
	};
	
	// THE_SLIME_PIT:
	// ********************************************************************************************
	this.zoneTypes.TheSlimePit = Object.assign({}, this.zoneTypes.TheSewers, {
		vaultSets: ['_General', 'TheSlimePit'],
		generators: [{percent: 100, name: LevelGeneratorStatic}],
		spawnTable: this.spawnTables.TheSlimePit,
	});
	
	// THE_SEWERS_END_LEVEL:
	// ********************************************************************************************
	this.zoneTypes.TheSewersEndLevel = Object.assign({}, this.zoneTypes.TheSewers, {
		generators: [{percent: 100, name: LevelGeneratorStatic}],
		spawnGold: false,
		spawnItems: false,
		noReeds: true,
		noMobSpawn: true,
	});

	// THE_CORE: (BRANCH-1)
	// ********************************************************************************************
	this.zoneTypes.TheCore = {
		zoneTier: ZONE_TIER.Branch1,
		
		// Level Generation:
		numLevels: 5,
		tileFrames: this.zoneTileFrames.TheCore,
		musicTrack: this.music.TheCore,
		vaultSets: ['_General', 'TheCore'],
		generators: [
			{percent: 50, name: LevelGeneratorCave},
			{percent: 20, name: LevelGeneratorLavaIslands},
			{percent: 20, name: LevelGeneratorLavaTunnels},
			{percent: 10, name: LevelGeneratorStatic},
			
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheCore,
		
		// Environment:
		spawnVines: true,
		spawnLava: true,
		spawnFireVents: true,
		spawnPits: true,
		
		subZones: [
			{zoneLevel: 5, zoneName: 'TheCoreEndLevel'},
		]
	};
	
	// THE_CORE_END_LEVEL:
	// ********************************************************************************************
	this.zoneTypes.TheCoreEndLevel = Object.assign({}, this.zoneTypes.TheCore, {
		generators: [{percent: 100, name: LevelGeneratorStatic}],
		spawnGold: false,
		spawnItems: false,
		noSpawn: true, // Turns off global level population
	});

	// THE_ICE_CAVES: (BRANCH-1)
	// ********************************************************************************************
	this.zoneTypes.TheIceCaves = {
		zoneTier: ZONE_TIER.Branch1,
		
		// Level Generation:
		numLevels: 5,
		tileFrames: this.zoneTileFrames.TheIceCaves,
		musicTrack: this.music.TheIceCaves,
		vaultSets: ['_General', 'TheIceCaves'],
		generators: [
			{percent: 90, name: LevelGeneratorCave},
			{percent: 10, name: LevelGeneratorStatic},
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheIceCaves,
		
		// Environment:
		spawnWater: true,
		spawnIce: true,
		isCold: true,
		spawnPits: true,
		spawnBearTraps: true,
		
		subZones: [
			{zoneLevel: 5, zoneName: 'TheIceCavesEndLevel'},
		]
	};
	
	// THE_ICE_CAVES_END_LEVEL:
	// ********************************************************************************************
	this.zoneTypes.TheIceCavesEndLevel = Object.assign({}, this.zoneTypes.TheIceCaves, {
		noSpawn: true, // Turns off global level population
		spawnGold: false,
		spawnItems: false,
		
		generators: [{percent: 100, name: LevelGeneratorStatic}]
	});
	
	// THE_IRON_FORGE: (BRANCH-2)
	// ********************************************************************************************
	this.zoneTypes.TheIronForge = {
		zoneTier: ZONE_TIER.Branch2,
		
		// Level Generation:
		numLevels: 5,
		tileFrames: this.zoneTileFrames.TheIronForge,
		musicTrack: this.music.TheIronForge,
		vaultSets: ['_General', 'TheIronForge'],
		generators: [
			{percent: 50, name: LevelGeneratorFactoryFloor},
			{percent: 30, name: LevelGeneratorFactoryTunnels},
			{percent: 10, name: LevelGeneratorConveyorBeltRooms},
			{percent: 10, name: LevelGeneratorStatic},
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheIronForge,
		
		// Environment:
		spawnMushrooms: true,
		spawnShockReeds: true,
		spawnWater: false,
		spawnLava: true,
		spawnOil: true,
		spawnFirePots: true,
		spawnFireVents: true,
		spawnFireShrooms: true,
		spawnSteamVents: true,
		
		// Used by Area-Generators when placing pillars
		// Used by Area-Generator-Vault to handle the pillarFlag
		pillarTypeTable: [
			// Pillar: 90% 
			{percent: 90, name: {objectTypeName: 'Pillar', objectFrame: 4032}},
			
			// Other: 10%
			{percent: 10, name: [
				{percent: 1, name: {objectTypeName: 'GasLamp'}},
			]}
		],
		
		subZones: [
			{zoneLevel: 5, zoneName: 'TheIronForgeEndLevel'},
		]
	};
	
	// THE_IRON_FORGE_END_LEVEL:
	// ********************************************************************************************
	this.zoneTypes.TheIronForgeEndLevel = Object.assign({}, this.zoneTypes.TheIronForge, {
		noSpawn: true, // Turns off global level population
		spawnGold: false,
		spawnItems: false,
		
		spawnFireShrooms: false,
		spawnFirePots: false,
		spawnFireVents: false,
		spawnSteamVents: false,
		
		generators: [{percent: 100, name: LevelGeneratorStatic}]
	});
	
	// THE_ARCANE_TOWER: (BRANCH-2)
	// ********************************************************************************************
	this.zoneTypes.TheArcaneTower = {
		zoneTier: ZONE_TIER.Branch2,
		
		// Level Generation:
		numLevels: 5,
		tileFrames: this.zoneTileFrames.TheArcaneTower,
		musicTrack: this.music.TheIronForge,
		vaultSets: ['_General', 'TheArcaneTower'],
		generators: [
			{percent: 30, name: LevelGeneratorArcanePitPaths},
			{percent: 60, name: LevelGeneratorArcane},
			{percent: 10, name: LevelGeneratorStatic}
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheArcaneTower,
		
		// Environment:
		spawnMushrooms: true,
		spawnShockReeds: true,
		spawnWater: true,
		spawnFirePots: true,
		spawnFireGlyphs: true,
		spawnEyeOfYendor: true,
		
		// Used by Area-Generators when placing pillars
		// Used by Area-Generator-Vault to handle the pillarFlag
		pillarTypeTable: [
			// Pillar: 90% 
			{percent: 90, name: {objectTypeName: 'Pillar', objectFrame: 4480}},
			
			// Other: 10%
			{percent: 10, name: [
				{percent: 1, name: {objectTypeName: 'Brazier'}},
			]}
		],
		
		subZones: [
			{zoneLevel: 5, zoneName: 'TheArcaneTowerEndLevel'},
		]
	};
	
	// THE_ARCANE_TOWER_END_LEVEL:
	// ********************************************************************************************
	this.zoneTypes.TheArcaneTowerEndLevel = Object.assign({}, this.zoneTypes.TheArcaneTower, {
		noSpawn: true, // Turns off global level population
		spawnGold: false,
		spawnItems: false,
		spawnFirePots: false,
			
		generators: [{percent: 100, name: LevelGeneratorStatic}]
	});
	
	
	// THE_CRYPT: (BRANCH-2)
	// ********************************************************************************************
	this.zoneTypes.TheCrypt = {
		zoneTier: ZONE_TIER.Branch2,
		
		// Level Generation:
		numLevels: 5,
		tileFrames: this.zoneTileFrames.TheCrypt,
		musicTrack: this.music.TheCrypt,
		vaultSets: ['_General', 'TheCrypt'],
		generators: [
			{percent: 30, name: LevelGeneratorCryptSmallTunnels},
			{percent: 30, name: LevelGeneratorClosedTombs},
			{percent: 10, name: LevelGeneratorStatic},
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheCrypt,
		
		// Environment:
		spawnBlood: true,
		spawnMushrooms: true,
		spawnShockReeds: true,
		spawnWater: true,
		spawnVines: true,
		spawnSpikeTraps: true,
		spawnGasPots: true,
		spawnFireShrooms: true,
		spawnEyeOfYendor: true,
		
		pillarTypeTable: [
			{percent: 100, name: {objectTypeName: 'Pillar', objectFrame: 4800}},
		],
		
		subZones: [
			{zoneLevel: 5, zoneName: 'TheCryptEndLevel'},
		]
	};
	

	
	// THE_CRYPT_END_LEVEL:
	// ********************************************************************************************
	this.zoneTypes.TheCryptEndLevel = Object.assign({}, this.zoneTypes.TheCrypt, {
		noSpawn: true, // Turns off global level population
		spawnGold: false,
		spawnItems: false,
		
		generators: [{percent: 100, name: LevelGeneratorStatic}]
	});

	// THE_VAULT_OF_YENDOR (TIER_IV):
	// ********************************************************************************************
	this.zoneTypes.TheVaultOfYendor = {
		zoneTier: ZONE_TIER.TheVaultOfYendor,
		
		// Level Generation:
		numLevels: 5,
		tileFrames: this.zoneTileFrames.TheVaultOfYendor,
		musicTrack: this.music.TheUpperDungeon,
		vaultSets: ['_General', 'TheVaultOfYendor'],
		generators: [
			{percent: 100, name: LevelGeneratorStatic}
		],
		
		// NPCs:
		spawnTable: this.spawnTables.TheVaultOfYendor,
		
		// Loot:
		numFountains: 2,		
						 
		// Environment:
		spawnMushrooms: true,
		spawnShockReeds: true,
		spawnWater: true,
		spawnVines: true,
		spawnFireShrooms: true,
		spawnPits: true,
		spawnFirePots: true,
		spawnLava: true,
		noSpawn: true,
		spawnPitTraps: false,
		spawnEyeOfYendor: true,
		
		pillarTypeTable: [
			{percent: 100, name: {objectTypeName: 'Pillar', objectFrame: 5120}},
		],
		
		subZones: [
			{zoneLevel: 5, zoneName: 'TheVaultOfYendorBoss'},
		]
	};
	
	// THE_VAULT_OF_YENDOR_END_LEVEL:
	// ********************************************************************************************
	this.zoneTypes.TheVaultOfYendorBoss = Object.assign({}, this.zoneTypes.TheVaultOfYendor, {
		generators: [
			{percent: 100, name: LevelGeneratorBossPortals},
		],
		
		//vaultSets: ['TheVaultOfYendorBoss'],
		
		spawnVines: false,
		spawnGold: false,
		spawnItems: false,
		spawnFirePots: false,
		spawnFireShrooms: false,
		spawnShockReeds: false,
		noSpawn: true,
		spawnTeleportTraps: false,
	});
	

	
	// Zone name list:
	this.nameTypes(this.zoneTypes);
	this.zoneNamesList = [];
	
	// Setting Default zoneType properties:
	this.forEachType(this.zoneTypes, function (zoneType) {
		this.zoneNamesList.push(zoneType.name);
		
		zoneType.floatingFeatures = zoneType.floatingFeatures || [];
		
		zoneType.numFountains = zoneType.numFountains || NUM_FOUNTAINS_PER_LEVEL;
		
		if (!zoneType.hasOwnProperty('spawnPitTraps')) {
			zoneType.spawnPitTraps = true;
		}
		
		if (!zoneType.hasOwnProperty('spawnTeleportTraps')) {
			zoneType.spawnTeleportTraps = true;
		}
		
		if (!zoneType.hasOwnProperty('dropTableName')) {
			zoneType.dropTableName = 'Main';
		}
		
		if (!zoneType.hasOwnProperty('subZones')) {
			zoneType.subZones = [];
		}
		
		if (!zoneType.hasOwnProperty('spawnGold')) {
			zoneType.spawnGold = true;
		}
		
		if (!zoneType.hasOwnProperty('spawnItems')) {
			zoneType.spawnItems = true;
		}
	}, this);
};



	
