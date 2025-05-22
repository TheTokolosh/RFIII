/*global gs, game, console, util*/
/*global VaultType, Item, CrystalChestGenerator, ItemGenerator, TomeGenerator*/
/*global VAULT_SET, VAULT_CONTENT, VAULT_PLACEMENT, ORIENTATION_TYPE*/
/*global TILE_SIZE, SCALE_FACTOR, FEATURE_TYPE*/
/*global nw, fs, path, process*/
'use strict';

//let VAULT_PATH_ROOT = nw.App.startPath + '/rogue-fable-III/assets/maps/vault-types/';

let VAULT_PATH_ROOT = process.cwd() + '/rogue-fable-III/assets/maps/vault-types/';

// VAULT_TYPE_LOADER:
// The main sub-system responsible for loading vaultTypes.
// VaultTypeLoader makes 3 passes:
// #1: Load the raw JSON in loader.js
// #2: Set properties in gs.create()
// #3: Verify contents in gs.create() after all other types have been created.
// ************************************************************************************************
let VaultTypeLoader = {
	nextVaultTypeId: 0,
	combinedVaultSetData: []
};

// LOAD_VAULT_TYPE_FILES:
// Called from loader.js to async load all the json files.
// loader.js will wait until all json is loaded before continuing.
// ************************************************************************************************
VaultTypeLoader.loadVaultTypeFiles = function () {
	let boxSet; 
	gs.vaultTypeList = [];
    
	// Load the main Zone-Vault-Sets:
	gs.forEachType(VAULT_SET, function (vaultSet) {
		this._loadContentVaultSet(vaultSet);
		this._loadEndLevelVaultSet(vaultSet);
	}, this);
	
	// Load Test Levels:
	this._loadVaultTypeFile('_Debug/TestLevel/TestLevel01');
	this._loadVaultTypeFile('_Debug/TestLevel/TestLevel02');
	this._loadVaultTypeFile('_Debug/TestLevel/TestLevel03');
	this._loadVaultTypeFile('_Debug/TestLevel/TestLevel04');
	
	// Load Test Vaults:
	boxSet = util.createBoxSet(0, 0, 7, 7, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TestZone', '_Debug/TestLevel/Test-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.CHALLENGE});

	boxSet = util.createBoxSet(0, 10, 9, 9, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TestZone', '_Debug/TestLevel/Test-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.CHALLENGE});

	
	// Load Circle Vaults:
	this._loadVaultTypeFile('_General/CircleRooms/CircleRoom9');
	this._loadVaultTypeFile('_General/CircleRooms/CircleRoom11');
	this._loadVaultTypeFile('_General/CircleRooms/CircleRoom13');
	
	// Load Library Vaults:
	boxSet = util.createBoxSet(0, 0, 7, 7, 3, 3, 8, 1);
	this._loadCombinedVaultSet('_General', '_General/Library-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.LIBRARY});
	
	// Load Merchant Vaults:
	boxSet = util.createBoxSet(0, 10, 7, 7, 3, 3, 8, 1);
	this._loadCombinedVaultSet('_General', '_General/Library-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.MERCHANT});
	
	// Load Shrine Vaults:
	boxSet = util.createBoxSet(0, 20, 7, 7, 3, 3, 8, 1);
	this._loadCombinedVaultSet('_General', '_General/Library-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.SHRINE_OF_STRENGTH});
	
	boxSet = util.createBoxSet(0, 30, 7, 7, 3, 3, 8, 1);
	this._loadCombinedVaultSet('_General', '_General/Library-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.SHRINE_OF_INTELLIGENCE});
	
	boxSet = util.createBoxSet(0, 40, 7, 7, 3, 3, 8, 1);
	this._loadCombinedVaultSet('_General', '_General/Library-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.SHRINE_OF_DEXTERITY});
	
	
	// Load zone vault-types:
	this.Generic();
	this.TheUpperDungeon();
	this.TheUnderGrove();
	this.TheSwamp();
	this.TheSunlessDesert();
	this.TheOrcFortress();
	this.TheDarkTemple();
	this.TheCore();
	this.TheSewers();
	this.TheIceCaves();
	this.TheCrypt();
	this.TheIronForge();
	this.TheVaultOfYendor();
	
	// Sewers Connected Tunnels:
	this._loadConnectedTunnelsTemplates('SewersTunnelsTemplates', 'TheSewers/SewersTunnelsTemplates/');

    // Crypt Connected Tunnels:
	this._loadSpecialVaultSet('TheLichKingsLair', 'TheCrypt/TheLichKingsLairTemplates/');
	
	// Arcane Rings Templates:
	this._loadSpecialVaultSet('ArcaneRingOuter', 'TheArcaneTower/RingTemplates/Outer/');
	this._loadSpecialVaultSet('ArcaneRingMiddle', 'TheArcaneTower/RingTemplates/Middle/');
	this._loadSpecialVaultSet('ArcaneRingInner', 'TheArcaneTower/RingTemplates/Inner/');
	
	// Iron Forge:
	this._loadConnectedTunnelsTemplates('IronForgeTunnels', 'TheIronForge/Tunnels/');
	this._loadConnectedTunnelsTemplates('IronForgeLavaTunnels', 'TheIronForge/LavaTunnels/');

	// Yendor:
	this._loadConnectedTunnelsTemplates('YendorLiquidTunnels', 'TheVaultOfYendor/LiquidTunnels/');
	
	// Yendor Center Templates:
	this._loadSpecialVaultSet('YendorCenter', 'TheVaultOfYendor/CenterTemplates/Center/', {isUnique: true});
	this._loadSpecialVaultSet('YendorSide', 'TheVaultOfYendor/CenterTemplates/Side/', {contentType: VAULT_CONTENT.CHALLENGE});
	
	// Yendor End Level Templates:
	this._loadSpecialVaultSet('YendorEndLevelCenter', 'TheVaultOfYendor/EndLevelTemplates/Center/', {isUnique: true});
	this._loadSpecialVaultSet('YendorEndLevelFirst', 'TheVaultOfYendor/EndLevelTemplates/First/', {contentType: VAULT_CONTENT.CHALLENGE});
	this._loadSpecialVaultSet('YendorEndLevelSecond', 'TheVaultOfYendor/EndLevelTemplates/Second/', {contentType: VAULT_CONTENT.CHALLENGE});
	this._loadSpecialVaultSet('YendorEndLevelFinal', 'TheVaultOfYendor/EndLevelTemplates/Final/', {contentType: VAULT_CONTENT.CHALLENGE});
	

	
	
	// THE_ARCANE_TOWER - PORTAL_ROOMS:
	// ********************************************************************************************
	// Corner:
	boxSet = util.createBoxSet(0, 0, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheArcaneTower-PortalRooms', 'TheArcaneTower/Portal-Rooms', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 83, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheArcaneTower-PortalRooms', 'TheArcaneTower/Portal-Rooms', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.CHALLENGE});

	// Four Way:
	boxSet = util.createBoxSet(0, 16, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheArcaneTower-PortalRooms', 'TheArcaneTower/Portal-Rooms', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 99, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheArcaneTower-PortalRooms', 'TheArcaneTower/Portal-Rooms', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.CHALLENGE});

	// One Way:
	boxSet = util.createBoxSet(0, 32, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheArcaneTower-PortalRooms', 'TheArcaneTower/Portal-Rooms', boxSet, {placementType: VAULT_PLACEMENT.ONE_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 115, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheArcaneTower-PortalRooms', 'TheArcaneTower/Portal-Rooms', boxSet, {placementType: VAULT_PLACEMENT.ONE_WAY, contentType: VAULT_CONTENT.CHALLENGE});

	// Straight:
	boxSet = util.createBoxSet(0, 48, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheArcaneTower-PortalRooms', 'TheArcaneTower/Portal-Rooms', boxSet, {placementType: VAULT_PLACEMENT.STRAIGHT, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 131, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheArcaneTower-PortalRooms', 'TheArcaneTower/Portal-Rooms', boxSet, {placementType: VAULT_PLACEMENT.STRAIGHT, contentType: VAULT_CONTENT.CHALLENGE});

	// Three Way:
	boxSet = util.createBoxSet(0, 64, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheArcaneTower-PortalRooms', 'TheArcaneTower/Portal-Rooms', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 147, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheArcaneTower-PortalRooms', 'TheArcaneTower/Portal-Rooms', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.CHALLENGE});

	// Major:
	boxSet = util.createBoxSet(0, 166, 26, 13, 3, 3, 6, 2);
	this._loadCombinedVaultSet('TheArcaneTower-PortalRooms', 'TheArcaneTower/Portal-Rooms', boxSet, {placementType: VAULT_PLACEMENT.MAJOR, contentType: VAULT_CONTENT.AESTHETIC});
	
	
	// THE_ARCANE_TOWER - ARCANE_PIT_PATHS:
	// ********************************************************************************************
	// Corner:
	boxSet = util.createBoxSet(0, 0, 13, 13, 3, 3, 18, 1);
	this._loadCombinedVaultSet('ArcanePitPaths', 'TheArcaneTower/Arcane-Pit-Paths', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 51, 13, 13, 3, 3, 18, 3);
	this._loadCombinedVaultSet('ArcanePitPaths', 'TheArcaneTower/Arcane-Pit-Paths', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.CHALLENGE});
	
	// Four-Way:
	boxSet = util.createBoxSet(0, 16, 13, 13, 3, 3, 18, 1);
	this._loadCombinedVaultSet('ArcanePitPaths', 'TheArcaneTower/Arcane-Pit-Paths', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 102, 13, 13, 3, 3, 18, 3);
	this._loadCombinedVaultSet('ArcanePitPaths', 'TheArcaneTower/Arcane-Pit-Paths', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.CHALLENGE});
	
	// Three-Way:
	boxSet = util.createBoxSet(0, 32, 13, 13, 3, 3, 18, 1);
	this._loadCombinedVaultSet('ArcanePitPaths', 'TheArcaneTower/Arcane-Pit-Paths', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 153, 13, 13, 3, 3, 18, 3);
	this._loadCombinedVaultSet('ArcanePitPaths', 'TheArcaneTower/Arcane-Pit-Paths', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.CHALLENGE});
		
	// Library Vaults:
	boxSet = util.createBoxSet(0, 201, 13, 13, 3, 3, 1, 1);
	this._loadCombinedVaultSet('ArcanePitPaths', 'TheArcaneTower/Arcane-Pit-Paths', boxSet, {contentType: VAULT_CONTENT.LIBRARY});
	
	
	// THE_ARCANE_TOWER - CHALLENGE_SIDE_VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 5, 4, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheArcaneTower', 'TheArcaneTower/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	boxSet = util.createBoxSet(0, 7, 7, 6, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheArcaneTower', 'TheArcaneTower/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	boxSet = util.createBoxSet(0, 16, 7, 2, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheArcaneTower', 'TheArcaneTower/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	boxSet = util.createBoxSet(0, 21, 5, 5, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheArcaneTower', 'TheArcaneTower/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	// THE_ARCANE_TOWER - BOSS_LEVELS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 3, 2);
	this._loadCombinedVaultSet('TheArcaneTowerBossLevels', 'TheArcaneTower/Boss-Levels', boxSet, {isUnique: true, placementType: VAULT_PLACEMENT.LEVEL});
	
	// THE_ARCANE_TOWER - STATIC_LEVELS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 3, 4);
	this._loadCombinedVaultSet('TheArcaneTower', 'TheArcaneTower/Static-Levels', boxSet, {isUnique: true, placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});
	
	
	// THE_VAULT_OF_YENDOR - PIT_PATHS:
	// ********************************************************************************************
	// Corner:
	boxSet = util.createBoxSet(0, 0, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('PitPathsTemplates', 'TheVaultOfYendor/ThreeTiles - PitPaths', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.AESTHETIC});
	
	// Four-Way:
	boxSet = util.createBoxSet(0, 16, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('PitPathsTemplates', 'TheVaultOfYendor/ThreeTiles - PitPaths', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	
	// Three-Way:
	boxSet = util.createBoxSet(0, 32, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('PitPathsTemplates', 'TheVaultOfYendor/ThreeTiles - PitPaths', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.AESTHETIC});
};

// GENERIC:
// Load all the generic vault-types:
// ************************************************************************************************
VaultTypeLoader.Generic = function () {
	let boxSet;
	
	// GENERIC_DUNGEON - AESTHETIC_VAULTS:
	// ********************************************************************************************
	// 5x5:
	boxSet = util.createBoxSet(0, 0, 5, 5, 3, 3, 12, 1);
	this._loadCombinedVaultSet('_Dungeon', '_Dungeon/Aesthetic-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.AESTHETIC});
	
	// 7x7:
	boxSet = util.createBoxSet(0, 8, 7, 7, 3, 3, 12, 1);
	this._loadCombinedVaultSet('_Dungeon', '_Dungeon/Aesthetic-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.AESTHETIC});
	
	// 9x9:
	boxSet = util.createBoxSet(0, 18, 9, 9, 3, 3, 12, 1);
	this._loadCombinedVaultSet('_Dungeon', '_Dungeon/Aesthetic-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.AESTHETIC});
	
	// 11x11:
	boxSet = util.createBoxSet(0, 30, 11, 11, 3, 3, 12, 1);
	this._loadCombinedVaultSet('_Dungeon', '_Dungeon/Aesthetic-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.AESTHETIC});
	
	// 13x13:
	boxSet = util.createBoxSet(0, 44, 13, 13, 3, 3, 8, 1);
	this._loadCombinedVaultSet('_Dungeon', '_Dungeon/Aesthetic-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.AESTHETIC});
	
	// 15x15:
	boxSet = util.createBoxSet(0, 60, 15, 15, 3, 3, 8, 1);
	this._loadCombinedVaultSet('_Dungeon', '_Dungeon/Aesthetic-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.AESTHETIC});
	
	// 17x17:
	boxSet = util.createBoxSet(0, 78, 17, 17, 3, 3, 8, 1);
	this._loadCombinedVaultSet('_Dungeon', '_Dungeon/Aesthetic-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.AESTHETIC});
	
	// GENERIC_DUNGEON - MAJOR_VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 7, 4);
	this._loadCombinedVaultSet('_Dungeon', '_Dungeon/Major-Vaults', boxSet, {placementType: VAULT_PLACEMENT.MAJOR, contentType: VAULT_CONTENT.AESTHETIC});
	
	// TIER_3 - ZONE_LINE_VAULTS:
	// ********************************************************************************************
	// 5x5:
	boxSet = util.createBoxSet(0, 0, 5, 5, 3, 3, 12, 1);
	this._loadCombinedVaultSet('_Tier3', '_General/Zone-Line-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.ZONE_LINE});
	
	// 7x7:
	boxSet = util.createBoxSet(0, 8, 7, 7, 3, 3, 12, 1);
	this._loadCombinedVaultSet('_Tier3', '_General/Zone-Line-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.ZONE_LINE});
	
	// 9x9:
	boxSet = util.createBoxSet(0, 18, 9, 9, 3, 3, 14, 1);
	this._loadCombinedVaultSet('_Tier3', '_General/Zone-Line-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.ZONE_LINE});
	
	// 11x11:
	boxSet = util.createBoxSet(0, 30, 11, 11, 3, 3, 12, 1);
	this._loadCombinedVaultSet('_Tier3', '_General/Zone-Line-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.ZONE_LINE});
	
};

// THE_UPPER_DUNGEON:
// Load all the vault-types for The-Upper-Dungeon
// ************************************************************************************************
VaultTypeLoader.TheUpperDungeon = function () {
	let boxSet;
	
	// THE_UPPER_DUNGEON - ZONE_LINE_VAULTS:
	// ********************************************************************************************
	// Major:
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 3);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Zone-Line-Vaults', boxSet, {placementType: VAULT_PLACEMENT.MAJOR, contentType: VAULT_CONTENT.ZONE_LINE});
	
	// Solid 13x13:
	boxSet = util.createBoxSet(0, 129, 13, 13, 3, 3, 4, 3);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Zone-Line-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.ZONE_LINE});
	
	// Side 5x5:
	boxSet = util.createBoxSet(0, 177, 5, 5, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Zone-Line-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.ZONE_LINE});
	
	// Side 7x7:
	boxSet = util.createBoxSet(0, 185, 7, 7, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Zone-Line-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.ZONE_LINE});
	
	
	// THE_UPPER_DUNGEON - LEVEL_VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 3);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Level-Vaults', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});
	
	
	// THE_UPPER_DUNGEON - MAJOR_CAVE_VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 4);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Major-Cave-Vaults', boxSet, {placementType: VAULT_PLACEMENT.MAJOR_CAVE, contentType: VAULT_CONTENT.AESTHETIC});


	// THE_UPPER_DUNGEON - CHALLENGE_OPEN_VAULTS:
	// ********************************************************************************************
	// 7x7
	boxSet = util.createBoxSet(0, 0, 7, 7, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Challenge-Open-Vaults', boxSet, {placementType: VAULT_PLACEMENT.OPEN, contentType: VAULT_CONTENT.CHALLENGE});

	// 9x9
	boxSet = util.createBoxSet(0, 10, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Challenge-Open-Vaults', boxSet, {placementType: VAULT_PLACEMENT.OPEN, contentType: VAULT_CONTENT.CHALLENGE});

	
	// THE_UPPER_DUNGEON - CHALLENGE_SIDE_VAULTS:
	// ********************************************************************************************
	// 5x5
	boxSet = util.createBoxSet(0, 0, 5, 5, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	// 7x7
	boxSet = util.createBoxSet(0, 8, 7, 7, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	// 9x6
	boxSet = util.createBoxSet(0, 18, 9, 6, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	
	// THE_UPPER_DUNGEON - NARROW_HALLS:
	// ********************************************************************************************
	// Corner:
	boxSet = util.createBoxSet(0, 0, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonNarrowHalls', 'TheUpperDungeon/ThreeTiles - UpperDungeonNarrowHalls', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 51, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonNarrowHalls', 'TheUpperDungeon/ThreeTiles - UpperDungeonNarrowHalls', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.CHALLENGE});

	// Four Way:
	boxSet = util.createBoxSet(0, 16, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonNarrowHalls', 'TheUpperDungeon/ThreeTiles - UpperDungeonNarrowHalls', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 67, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonNarrowHalls', 'TheUpperDungeon/ThreeTiles - UpperDungeonNarrowHalls', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.CHALLENGE});

	// Three Way:
	boxSet = util.createBoxSet(0, 32, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonNarrowHalls', 'TheUpperDungeon/ThreeTiles - UpperDungeonNarrowHalls', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 83, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonNarrowHalls', 'TheUpperDungeon/ThreeTiles - UpperDungeonNarrowHalls', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.CHALLENGE});

	// Boss Vaults:
	boxSet = util.createBoxSet(0, 102, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonNarrowHalls', 'TheUpperDungeon/ThreeTiles - UpperDungeonNarrowHalls', boxSet, {contentType: VAULT_CONTENT.BOSS});
	
	
	// THE_UPPER_DUNGEON - CAVE_TUNNELS:
	// ********************************************************************************************
	// Corner:
	boxSet = util.createBoxSet(0, 0, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonCaveTunnels', 'TheUpperDungeon/ThreeTiles - UpperDungeonCaveTunnels', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 83, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonCaveTunnels', 'TheUpperDungeon/ThreeTiles - UpperDungeonCaveTunnels', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.CHALLENGE});

	// Four Way:
	boxSet = util.createBoxSet(0, 16, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonCaveTunnels', 'TheUpperDungeon/ThreeTiles - UpperDungeonCaveTunnels', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 99, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonCaveTunnels', 'TheUpperDungeon/ThreeTiles - UpperDungeonCaveTunnels', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.CHALLENGE});

	// One Way:
	boxSet = util.createBoxSet(0, 32, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonCaveTunnels', 'TheUpperDungeon/ThreeTiles - UpperDungeonCaveTunnels', boxSet, {placementType: VAULT_PLACEMENT.ONE_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 115, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonCaveTunnels', 'TheUpperDungeon/ThreeTiles - UpperDungeonCaveTunnels', boxSet, {placementType: VAULT_PLACEMENT.ONE_WAY, contentType: VAULT_CONTENT.CHALLENGE});

	// Straight:
	boxSet = util.createBoxSet(0, 48, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonCaveTunnels', 'TheUpperDungeon/ThreeTiles - UpperDungeonCaveTunnels', boxSet, {placementType: VAULT_PLACEMENT.STRAIGHT, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 131, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonCaveTunnels', 'TheUpperDungeon/ThreeTiles - UpperDungeonCaveTunnels', boxSet, {placementType: VAULT_PLACEMENT.STRAIGHT, contentType: VAULT_CONTENT.CHALLENGE});

	// Three Way:
	boxSet = util.createBoxSet(0, 64, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonCaveTunnels', 'TheUpperDungeon/ThreeTiles - UpperDungeonCaveTunnels', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 147, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('UpperDungeonCaveTunnels', 'TheUpperDungeon/ThreeTiles - UpperDungeonCaveTunnels', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.CHALLENGE});

	// Major:
	boxSet = util.createBoxSet(0, 166, 26, 13, 3, 3, 6, 1);
	this._loadCombinedVaultSet('UpperDungeonCaveTunnels', 'TheUpperDungeon/ThreeTiles - UpperDungeonCaveTunnels', boxSet, {placementType: VAULT_PLACEMENT.MAJOR, contentType: VAULT_CONTENT.AESTHETIC});
	
	// THE_UPPER_DUNGEON - BOSS_VAULTS:
	// ********************************************************************************************
	// Level-Vault:
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 5, 2);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Boss-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.LEVEL});
	
	// Major-Vault:
	boxSet = util.createBoxSet(0, 89, 40, 40, 3, 3, 4, 1);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Boss-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.MAJOR});
	
	// Major-Cave-Vault:
	boxSet = util.createBoxSet(0, 135, 40, 40, 3, 3, 5, 1);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Boss-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.MAJOR_CAVE});
	
	// Solid-Vault 13x13:
	boxSet = util.createBoxSet(0, 178, 13, 13, 3, 3, 8, 2);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Boss-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.SOLID});
	
	// Solid-Vault 15x15:
	boxSet = util.createBoxSet(0, 213, 15, 15, 3, 3, 8, 2);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Boss-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.SOLID});
	
	// THE_UPPER_DUNGEON - CHALENGE_VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 7, 7, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Challenge-Solid-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});
	
	boxSet = util.createBoxSet(0, 10, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Challenge-Solid-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});
	
	boxSet = util.createBoxSet(0, 22, 11, 11, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Challenge-Solid-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});
	
	boxSet = util.createBoxSet(0, 36, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheUpperDungeon', 'TheUpperDungeon/Challenge-Solid-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});
	
};

// THE_UNDER_GROVE:
// Load all the vault-types for The-Under-Grove
// ************************************************************************************************
VaultTypeLoader.TheUnderGrove = function () {
	let boxSet;
	
	// THE_UNDER_GROVE - LEVEL_VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 1);
	this._loadCombinedVaultSet('TheUnderGrove', 'TheUnderGrove/Level-Vaults', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});
	
	// THE_UNDER_GROVE - CHALLENGE_OPEN_VAULTS:
	// ********************************************************************************************
	// 9x9
	boxSet = util.createBoxSet(0, 0, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheUnderGrove', 'TheUnderGrove/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.OPEN, contentType: VAULT_CONTENT.CHALLENGE});

	// 13x13
	boxSet = util.createBoxSet(0, 12, 13, 13, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheUnderGrove', 'TheUnderGrove/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.OPEN, contentType: VAULT_CONTENT.CHALLENGE});

	// THE_UNDER_GROVE - CHALLENGE_SIDE_VAULTS:
	// ********************************************************************************************
	// 7x7
	boxSet = util.createBoxSet(0, 30, 7, 7, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheUnderGrove', 'TheUnderGrove/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	// 9x9
	boxSet = util.createBoxSet(0, 40, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheUnderGrove', 'TheUnderGrove/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	// THE_UNDER_GROVE - CHALLENGE_PRE_CAVE_VAULTS:
	// ********************************************************************************************
	// 13x13
	boxSet = util.createBoxSet(0, 52, 13, 13, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheUnderGrove', 'TheUnderGrove/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.PRE_CAVE, contentType: VAULT_CONTENT.CHALLENGE});

	// THE_UNDER_GROVE - CHALLENGE_PRE_CAVE_VAULTS:
	// ********************************************************************************************
	// 7x7
	boxSet = util.createBoxSet(0, 68, 7, 7, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheUnderGrove', 'TheUnderGrove/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.CHALLENGE});

	// THE_UNDER_GROVE - BOSS_VAULTS:
	// ********************************************************************************************
	// LEVEL_VAULTS:
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheUnderGrove', 'TheUnderGrove/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.BOSS});

	// PRE_CAVE_VAULTS:
	boxSet = util.createBoxSet(0, 46, 15, 15, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheUnderGrove', 'TheUnderGrove/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.PRE_CAVE, contentType: VAULT_CONTENT.BOSS});
};

// THE_SWAMP:
// Load all the vault-types for The-Swamp
// ************************************************************************************************
VaultTypeLoader.TheSwamp = function () {
	let boxSet;
	
		// THE_SEWERS - WATER_BRIDGES_VAULTS:
	// ********************************************************************************************
	// Corner
	boxSet = util.createBoxSet(0, 0, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSwamp-SwampBridges', 'TheSwamp/Swamp-Bridges', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.CORNER});	

	// Four-Way
	boxSet = util.createBoxSet(0, 16, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSwamp-SwampBridges', 'TheSwamp/Swamp-Bridges', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.FOUR_WAY});	

	// Three-Way
	boxSet = util.createBoxSet(0, 32, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSwamp-SwampBridges', 'TheSwamp/Swamp-Bridges', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.THREE_WAY});	

	// Challenge Corner
	boxSet = util.createBoxSet(0, 51, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSwamp-SwampBridges', 'TheSwamp/Swamp-Bridges', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.CORNER});	

	// Challenge Four-Way
	boxSet = util.createBoxSet(0, 67, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSwamp-SwampBridges', 'TheSwamp/Swamp-Bridges', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.FOUR_WAY});	

	// Challenge Three-Way
	boxSet = util.createBoxSet(0, 83, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSwamp-SwampBridges', 'TheSwamp/Swamp-Bridges', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.THREE_WAY});	

	// Boss Corner
	boxSet = util.createBoxSet(0, 102, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSwamp-SwampBridges', 'TheSwamp/Swamp-Bridges', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.CORNER});	

	// Boss Four-Way
	boxSet = util.createBoxSet(0, 118, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSwamp-SwampBridges', 'TheSwamp/Swamp-Bridges', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.FOUR_WAY});	

	// Boss Three-Way
	boxSet = util.createBoxSet(0, 134, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSwamp-SwampBridges', 'TheSwamp/Swamp-Bridges', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.THREE_WAY});	

	
	// THE_SWAMP - BOSS_VAULTS:
	// ********************************************************************************************
	// LEVEL_VAULTS:
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheSwamp', 'TheSwamp/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.BOSS});

	// PRE_CAVE_VAULTS:
	boxSet = util.createBoxSet(0, 46, 15, 15, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheSwamp', 'TheSwamp/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.PRE_CAVE, contentType: VAULT_CONTENT.BOSS});

	boxSet = util.createBoxSet(0, 64, 11, 11, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheSwamp', 'TheSwamp/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.PRE_CAVE, contentType: VAULT_CONTENT.BOSS});

	
	// THE_SWAMP - CHALLENGE_OPEN_VAULTS:
	// ********************************************************************************************
	// 9x9:
	boxSet = util.createBoxSet(0, 0, 9, 9, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheSwamp', 'TheSwamp/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.OPEN, contentType: VAULT_CONTENT.CHALLENGE});
	
	// 7x7:
	boxSet = util.createBoxSet(0, 12, 7, 7, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheSwamp', 'TheSwamp/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.OPEN, contentType: VAULT_CONTENT.CHALLENGE});
	
	// 13x13:
	boxSet = util.createBoxSet(0, 22, 13, 13, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheSwamp', 'TheSwamp/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.OPEN, contentType: VAULT_CONTENT.CHALLENGE});
	
	// THE_SWAMP - CHALLENGE_PRE_CAVE_VAULTS:
	// ********************************************************************************************
	// 13x13:
	boxSet = util.createBoxSet(0, 41, 13, 13, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheSwamp', 'TheSwamp/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.PRE_CAVE, contentType: VAULT_CONTENT.CHALLENGE});
	
	// THE_SWAMP - CHALLENGE_SIDE_VAULTS:
	// ********************************************************************************************
	// 7x7:
	boxSet = util.createBoxSet(0, 60, 7, 7, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSwamp', 'TheSwamp/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});
	
	// 9x9:
	boxSet = util.createBoxSet(0, 70, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSwamp', 'TheSwamp/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});
	
	// THE_SWAMP - CHALLENGE_SOLID_VAULTS:
	// ********************************************************************************************
	// 9x9:
	boxSet = util.createBoxSet(0, 85, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSwamp', 'TheSwamp/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.CHALLENGE});
	
};

// THE_SUNLESS_DESERT:
// Load all the vault-types for The-Sunless-Desert
// ************************************************************************************************
VaultTypeLoader.TheSunlessDesert = function () {
	let boxSet;
	
	// THE_SUNLESS_DESERT - OPEN_VAULTS:
	// ********************************************************************************************
	// 5x6
	boxSet = util.createBoxSet(0, 0, 5, 6, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSunlessDesert', 'TheSunlessDesert/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.OPEN, contentType: VAULT_CONTENT.CHALLENGE});

	// 7x7
	boxSet = util.createBoxSet(0, 9, 7, 7, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSunlessDesert', 'TheSunlessDesert/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.OPEN, contentType: VAULT_CONTENT.CHALLENGE});

	// 9x9
	boxSet = util.createBoxSet(0, 19, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSunlessDesert', 'TheSunlessDesert/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.OPEN, contentType: VAULT_CONTENT.CHALLENGE});

	// THE_SUNLESS_DESERT - CHALLENGE_SIDE_VAULTS:
	// ********************************************************************************************
	// 7x7
	boxSet = util.createBoxSet(0, 34, 7, 7, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSunlessDesert', 'TheSunlessDesert/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	// 7x9
	boxSet = util.createBoxSet(0, 44, 7, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSunlessDesert', 'TheSunlessDesert/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	// 9x9
	boxSet = util.createBoxSet(0, 56, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSunlessDesert', 'TheSunlessDesert/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	// THE_SUNLESS_DESERT - CHALLENGE_PRE_CAVE_VAULTS:
	// ********************************************************************************************
	// 11x11
	boxSet = util.createBoxSet(0, 71, 11, 11, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSunlessDesert', 'TheSunlessDesert/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.PRE_CAVE, contentType: VAULT_CONTENT.CHALLENGE});

	// 15x15
	boxSet = util.createBoxSet(0, 85, 15, 15, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheSunlessDesert', 'TheSunlessDesert/Challenge-Vaults', boxSet, {placementType: VAULT_PLACEMENT.PRE_CAVE, contentType: VAULT_CONTENT.CHALLENGE});

	// THE_SUNLESS_DESERT - BOSS_VAULTS:
	// ********************************************************************************************
	// Level:
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 1);
	this._loadCombinedVaultSet('TheSunlessDesert', 'TheSunlessDesert/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.BOSS});

	// Open:
	boxSet = util.createBoxSet(0, 46, 9, 9, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheSunlessDesert', 'TheSunlessDesert/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.OPEN, contentType: VAULT_CONTENT.BOSS});

	// Pre-Cave:
	boxSet = util.createBoxSet(0, 61, 20, 20, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheSunlessDesert', 'TheSunlessDesert/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.PRE_CAVE, contentType: VAULT_CONTENT.BOSS});

	// Side:
	boxSet = util.createBoxSet(0, 87, 7, 7, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheSunlessDesert', 'TheSunlessDesert/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.BOSS});
	
	// Solid:
	boxSet = util.createBoxSet(0, 100, 9, 9, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheSunlessDesert', 'TheSunlessDesert/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.BOSS});

	// THE_SUNLESS_DESERT - LEVEL_VAULTS:
	// ********************************************************************************************
	// Level:
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 2);
	this._loadCombinedVaultSet('TheSunlessDesert', 'TheSunlessDesert/Level-Vaults', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});

};

// THE_DARK_TEMPLE:
// Load all the vault-types for The-Dark-Temple
// ************************************************************************************************
VaultTypeLoader.TheDarkTemple = function () {
	let boxSet;
	
	// THE_DARK_TEMPLE - MAJOR_VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 6, 6);
	this._loadCombinedVaultSet('TheDarkTemple', 'TheDarkTemple/Major-Vaults', boxSet, {placementType: VAULT_PLACEMENT.MAJOR, contentType: VAULT_CONTENT.AESTHETIC});
	
	
	// THE_DARK_TEMPLE - CHALENGE_SOLID_VAULTS:
	// ********************************************************************************************
	// 7x7:
	boxSet = util.createBoxSet(0, 0, 7, 7, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheDarkTemple', 'TheDarkTemple/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});
	
	// 9x9:
	boxSet = util.createBoxSet(0, 13, 9, 9, 3, 3, 19, 2);
	this._loadCombinedVaultSet('TheDarkTemple', 'TheDarkTemple/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});
	
	// 11x11:
	boxSet = util.createBoxSet(0, 40, 11, 11, 3, 3, 19, 1);
	this._loadCombinedVaultSet('TheDarkTemple', 'TheDarkTemple/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});
	
	// 13x13:
	boxSet = util.createBoxSet(0, 57, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('TheDarkTemple', 'TheDarkTemple/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});
	
	// 15x15:
	boxSet = util.createBoxSet(0, 76, 15, 15, 3, 3, 10, 1);
	this._loadCombinedVaultSet('TheDarkTemple', 'TheDarkTemple/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});
	
	// 17x17:
	boxSet = util.createBoxSet(0, 97, 17, 17, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheDarkTemple', 'TheDarkTemple/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});
	
	// THE_DARK_TEMPLE - CHALLENGE_SIDE_VAULTS:
	// ********************************************************************************************
	// 5x5:
	boxSet = util.createBoxSet(0, 120, 5, 5, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheDarkTemple', 'TheDarkTemple/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});
	
	// 7x7:
	boxSet = util.createBoxSet(0, 131, 7, 7, 3, 3, 16, 2);
	this._loadCombinedVaultSet('TheDarkTemple', 'TheDarkTemple/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});
	
	// 9x9:
	boxSet = util.createBoxSet(0, 154, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheDarkTemple', 'TheDarkTemple/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});
	
	
	// THE_DARK_TEMPLE - CONNECTED_CIRCLES:
	// ********************************************************************************************
	// Corner:
	boxSet = util.createBoxSet(0, 0, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('ConnectedCircles', 'TheDarkTemple/Connected-Circles', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 83, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('ConnectedCircles', 'TheDarkTemple/Connected-Circles', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.CHALLENGE});

	// Four Way:
	boxSet = util.createBoxSet(0, 16, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('ConnectedCircles', 'TheDarkTemple/Connected-Circles', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 99, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('ConnectedCircles', 'TheDarkTemple/Connected-Circles', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.CHALLENGE});

	// One Way:
	boxSet = util.createBoxSet(0, 32, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('ConnectedCircles', 'TheDarkTemple/Connected-Circles', boxSet, {placementType: VAULT_PLACEMENT.ONE_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 115, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('ConnectedCircles', 'TheDarkTemple/Connected-Circles', boxSet, {placementType: VAULT_PLACEMENT.ONE_WAY, contentType: VAULT_CONTENT.CHALLENGE});

	// Straight:
	boxSet = util.createBoxSet(0, 48, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('ConnectedCircles', 'TheDarkTemple/Connected-Circles', boxSet, {placementType: VAULT_PLACEMENT.STRAIGHT, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 131, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('ConnectedCircles', 'TheDarkTemple/Connected-Circles', boxSet, {placementType: VAULT_PLACEMENT.STRAIGHT, contentType: VAULT_CONTENT.CHALLENGE});

	// Three Way:
	boxSet = util.createBoxSet(0, 64, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('ConnectedCircles', 'TheDarkTemple/Connected-Circles', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 147, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('ConnectedCircles', 'TheDarkTemple/Connected-Circles', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.CHALLENGE});

	// THE_DARK_TEMPLE - BOSS_VAULTS:
	// ********************************************************************************************
	// Level:
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 6, 1);
	this._loadCombinedVaultSet('TheDarkTemple', 'TheDarkTemple/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.BOSS});
	
	// Major:
	boxSet = util.createBoxSet(0, 46, 40, 40, 3, 3, 6, 3);
	this._loadCombinedVaultSet('TheDarkTemple', 'TheDarkTemple/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.MAJOR, contentType: VAULT_CONTENT.BOSS});
	
	// Solid:
	boxSet = util.createBoxSet(0, 178, 13, 13, 3, 3, 6, 1);
	this._loadCombinedVaultSet('TheDarkTemple', 'TheDarkTemple/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.BOSS});
	
	// THE_ORC_FORTRESS - ZONE_LINE_VAULTS:
	// ********************************************************************************************	
	// Major:
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheDarkTemple', 'TheDarkTemple/Zone-Line-Vaults', boxSet, {contentType: VAULT_CONTENT.ZONE_LINE, placementType: VAULT_PLACEMENT.MAJOR});
	
	// Side:
	boxSet = util.createBoxSet(0, 46, 9, 9, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheDarkTemple', 'TheDarkTemple/Zone-Line-Vaults', boxSet, {contentType: VAULT_CONTENT.ZONE_LINE, placementType: VAULT_PLACEMENT.SIDE});
	
	// THE_DARK_TEMPLE - TEMPLE_TEMPLATE_VAULTS:
	// ********************************************************************************************	
	// Top:
	boxSet = util.createBoxSet(0, 0, 40, 10, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheDarkTemple - Temple-Templates-Top', 'TheDarkTemple/Temple-Template-Vaults', boxSet, {contentType: VAULT_CONTENT.SPECIAL, placementType: VAULT_PLACEMENT.SPECIAL});
	
	// Middle:
	boxSet = util.createBoxSet(0, 16, 40, 10, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheDarkTemple - Temple-Templates-Middle', 'TheDarkTemple/Temple-Template-Vaults', boxSet, {contentType: VAULT_CONTENT.SPECIAL, placementType: VAULT_PLACEMENT.SPECIAL});
	
	// Bottom:
	boxSet = util.createBoxSet(0, 32, 40, 10, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheDarkTemple - Temple-Templates-Bottom', 'TheDarkTemple/Temple-Template-Vaults', boxSet, {contentType: VAULT_CONTENT.SPECIAL, placementType: VAULT_PLACEMENT.SPECIAL});	

	// THE_DARK_TEMPLE - LEVEL_VAULTS:
	// ********************************************************************************************	
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 5, 4);
	this._loadCombinedVaultSet('TheDarkTemple', 'TheDarkTemple/Level-Vaults', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});
	
};

// THE_ORC_FORTRESS:
// Load all the vault-types for The-Orc-Fortress
// ************************************************************************************************
VaultTypeLoader.TheOrcFortress = function () {
	let boxSet;
	
	// THE_ORC_FORTRESS - ZONE_LINE_VAULTS:
	// ********************************************************************************************	
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 3, 3);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Zone-Line-Vaults', boxSet, {contentType: VAULT_CONTENT.ZONE_LINE, placementType: VAULT_PLACEMENT.MAJOR});
	
	boxSet = util.createBoxSet(0, 129, 15, 15, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Zone-Line-Vaults', boxSet, {contentType: VAULT_CONTENT.ZONE_LINE, placementType: VAULT_PLACEMENT.SOLID});
	
	
	// THE_ORC_FORTRESS - MAJOR_VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 6, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Major-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.MAJOR});
	
	// Gates:
	boxSet = util.createBoxSet(0, 43, 40, 40, 3, 3, 4, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Major-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.MAJOR, allowRotate: false});
	
	boxSet = util.createBoxSet(0, 86, 40, 40, 3, 3, 1, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Major-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.MAJOR});
	
	// Feast Halls:
	boxSet = util.createBoxSet(0, 129, 40, 40, 3, 3, 4, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Major-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.MAJOR, allowRotate: false});
	
	// Halls:
	boxSet = util.createBoxSet(0, 172, 40, 40, 3, 3, 1, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Major-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.MAJOR, allowRotate: false});
	
	// Mino Halls
	boxSet = util.createBoxSet(0, 215, 40, 40, 3, 3, 1, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Major-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.MAJOR, allowRotate: false});
	
	// THE_ORC_FORTESS - CHALLENGE_SOLID_VAULTS:
	// ********************************************************************************************
	// 7x11
	boxSet = util.createBoxSet(0, 0, 7, 11, 3, 3, 24, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});
	
	// 11x11
	boxSet = util.createBoxSet(0, 14, 11, 11, 3, 3, 24, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});
	
	// 13x13
	boxSet = util.createBoxSet(0, 28, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});
	
	// 15x15
	boxSet = util.createBoxSet(0, 44, 15, 15, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});
	
	// 7x7
	boxSet = util.createBoxSet(0, 62, 7, 7, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});
	
	// 9x9
	boxSet = util.createBoxSet(0, 72, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});	

	// THE_ORC_FORTESS - CHALLENGE_SIDE_VAULTS:
	// ********************************************************************************************
	// 5x5
	boxSet = util.createBoxSet(0, 87, 5, 5, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});	

	// 7x7
	boxSet = util.createBoxSet(0, 95, 7, 7, 3, 3, 16, 2);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});	

	// THE_ORC_FORTRESS - LEVEL_VAULTS:
	// ********************************************************************************************	
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 3);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Level-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.LEVEL});	

	// THE_ORC_FORTESS - CHALLENGE_OPEN_VAULTS:
	// ********************************************************************************************
	// 7x7
	boxSet = util.createBoxSet(0, 142, 7, 7, 3, 3, 16, 2);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.OPEN});	

	// 9x9
	boxSet = util.createBoxSet(0, 162, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.OPEN});	

	
	// THE_ORC_FORTRESS - BOSS_VAULTS:
	// ********************************************************************************************	
	// Level:
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 4);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Boss-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.LEVEL});	

	// Solid 11x11: 
	boxSet = util.createBoxSet(0, 175, 11, 11, 3, 3, 4, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Boss-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.SOLID});	

	// Solid 13x13: 
	boxSet = util.createBoxSet(0, 189, 13, 13, 3, 3, 4, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Boss-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.SOLID});	

	// Solid 15x15: 
	boxSet = util.createBoxSet(0, 205, 15, 15, 3, 3, 4, 1);
	this._loadCombinedVaultSet('TheOrcFortress', 'TheOrcFortress/Boss-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.SOLID});	

};

// THE_CORE:
// Load all the vault-types for The-Core
// ************************************************************************************************
VaultTypeLoader.TheCore = function () {
	let boxSet;
	
	// THE_CORE - CHALLENGE_OPEN_VAULTS:
	// ********************************************************************************************
	// 5x5
	boxSet = util.createBoxSet(0, 0, 5, 5, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore', 'TheCore/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.OPEN});	

	// 7x7
	boxSet = util.createBoxSet(0, 8, 7, 7, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore', 'TheCore/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.OPEN});	

	// 9x9
	boxSet = util.createBoxSet(0, 18, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore', 'TheCore/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.OPEN});	

	// THE_CORE - CHALLENGE_PRE_CAVE_VAULTS:
	// ********************************************************************************************
	// 13x13
	boxSet = util.createBoxSet(0, 49, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore', 'TheCore/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.PRE_CAVE});	

	// THE_CORE - CHALLENGE_SIDE_VAULTS:
	// ********************************************************************************************
	// 5x5
	boxSet = util.createBoxSet(0, 68, 5, 5, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore', 'TheCore/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});	

	// 7x7
	boxSet = util.createBoxSet(0, 76, 7, 7, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore', 'TheCore/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});	

	// 9x9
	boxSet = util.createBoxSet(0, 86, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore', 'TheCore/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});	

	// 11x11
	boxSet = util.createBoxSet(0, 98, 11, 11, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore', 'TheCore/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});	

	// THE_CORE - CHALLENGE_SOLID_VAULTS:
	// ********************************************************************************************
	// 11x11
	boxSet = util.createBoxSet(0, 115, 11, 11, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore', 'TheCore/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SOLID});	

	// THE_CORE - LAVA_ISLAND_VAULTS:
	// ********************************************************************************************
	// Corner
	boxSet = util.createBoxSet(0, 0, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaIslands', 'TheCore/Lava-Island-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.CORNER});	

	// Four-Way
	boxSet = util.createBoxSet(0, 16, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaIslands', 'TheCore/Lava-Island-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.FOUR_WAY});	

	// Three-Way
	boxSet = util.createBoxSet(0, 32, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaIslands', 'TheCore/Lava-Island-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.THREE_WAY});	

	// Boss Corner
	boxSet = util.createBoxSet(0, 102, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaIslands', 'TheCore/Lava-Island-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.CORNER});	

	// Boss Four-Way
	boxSet = util.createBoxSet(0, 118, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaIslands', 'TheCore/Lava-Island-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.FOUR_WAY});	

	// Boss Three-Way
	boxSet = util.createBoxSet(0, 134, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaIslands', 'TheCore/Lava-Island-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.THREE_WAY});	

	// THE_CORE - LAVA_TUNNEL_VAULTS:
	// ********************************************************************************************
	// Aesthetic Corner
	boxSet = util.createBoxSet(0, 0, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaTunnels', 'TheCore/Lava-Tunnel-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.CORNER});	

	// Aesthetic Four-Way
	boxSet = util.createBoxSet(0, 16, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaTunnels', 'TheCore/Lava-Tunnel-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.FOUR_WAY});	

	// Aesthetic One-Way
	boxSet = util.createBoxSet(0, 32, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaTunnels', 'TheCore/Lava-Tunnel-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.ONE_WAY});	

	// Aesthetic Straight
	boxSet = util.createBoxSet(0, 48, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaTunnels', 'TheCore/Lava-Tunnel-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.STRAIGHT});	

	// Aesthetic Three-Way
	boxSet = util.createBoxSet(0, 64, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaTunnels', 'TheCore/Lava-Tunnel-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.THREE_WAY});	

	// Challenge Corner
	boxSet = util.createBoxSet(0, 83, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaTunnels', 'TheCore/Lava-Tunnel-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.CORNER});	

	// Challenge Four-Way
	boxSet = util.createBoxSet(0, 99, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaTunnels', 'TheCore/Lava-Tunnel-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.FOUR_WAY});	

	// Challenge One-Way
	boxSet = util.createBoxSet(0, 115, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaTunnels', 'TheCore/Lava-Tunnel-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.ONE_WAY});	

	// Challenge Straight
	boxSet = util.createBoxSet(0, 131, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaTunnels', 'TheCore/Lava-Tunnel-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.STRAIGHT});	

	// Challenge Three-Way
	boxSet = util.createBoxSet(0, 147, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaTunnels', 'TheCore/Lava-Tunnel-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.THREE_WAY});	

	// Boss Corner
	boxSet = util.createBoxSet(0, 166, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaTunnels', 'TheCore/Lava-Tunnel-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.CORNER});	

	// Boss Four-Way
	boxSet = util.createBoxSet(0, 182, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaTunnels', 'TheCore/Lava-Tunnel-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.FOUR_WAY});	

	// Boss One-Way
	boxSet = util.createBoxSet(0, 198, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaTunnels', 'TheCore/Lava-Tunnel-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.ONE_WAY});	

	// Boss Straight
	boxSet = util.createBoxSet(0, 214, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaTunnels', 'TheCore/Lava-Tunnel-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.STRAIGHT});	

	// Boss Three-Way
	boxSet = util.createBoxSet(0, 230, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheCore-LavaTunnels', 'TheCore/Lava-Tunnel-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.THREE_WAY});	

	// THE_CORE - LEVEL_VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 4);
	this._loadCombinedVaultSet('TheCore', 'TheCore/Level-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.LEVEL});	

	// THE_CORE - BOSS_VAULTS:
	// ********************************************************************************************
	// Level:
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 2);
	this._loadCombinedVaultSet('TheCore', 'TheCore/Boss-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.LEVEL});	

	// Open:
	boxSet = util.createBoxSet(0, 89, 13, 13, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheCore', 'TheCore/Boss-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.OPEN});	

	// Pre-Cave:
	boxSet = util.createBoxSet(0, 108, 13, 13, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheCore', 'TheCore/Boss-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.PRE_CAVE});	

	// Side:
	boxSet = util.createBoxSet(0, 127, 13, 13, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheCore', 'TheCore/Boss-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.SIDE});	

	// Solid:
	boxSet = util.createBoxSet(0, 146, 11, 11, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheCore', 'TheCore/Boss-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.SOLID});	
};

// THE_SEWERS:
// Load all the vault-types for The-Sewers
// ************************************************************************************************
VaultTypeLoader.TheSewers = function () {
	let boxSet;
	
	// THE_SEWERS - WATER_PATHS_VAULTS:
	// ********************************************************************************************
	// Corner
	boxSet = util.createBoxSet(0, 0, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterPaths', 'TheSewers/Water-Paths-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.CORNER});	

	// Four-Way
	boxSet = util.createBoxSet(0, 16, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterPaths', 'TheSewers/Water-Paths-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.FOUR_WAY});	

	// Three-Way
	boxSet = util.createBoxSet(0, 32, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterPaths', 'TheSewers/Water-Paths-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.THREE_WAY});	

	// Challenge Corner
	boxSet = util.createBoxSet(0, 51, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterPaths', 'TheSewers/Water-Paths-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.CORNER});	

	// Challenge Four-Way
	boxSet = util.createBoxSet(0, 67, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterPaths', 'TheSewers/Water-Paths-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.FOUR_WAY});	

	// Challenge Three-Way
	boxSet = util.createBoxSet(0, 83, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterPaths', 'TheSewers/Water-Paths-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.THREE_WAY});	

	// Boss Corner
	boxSet = util.createBoxSet(0, 102, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterPaths', 'TheSewers/Water-Paths-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.CORNER});	

	// Boss Four-Way
	boxSet = util.createBoxSet(0, 118, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterPaths', 'TheSewers/Water-Paths-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.FOUR_WAY});	

	// Boss Three-Way
	boxSet = util.createBoxSet(0, 134, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterPaths', 'TheSewers/Water-Paths-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.THREE_WAY});	

	// Library
	boxSet = util.createBoxSet(0, 153, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterPaths', 'TheSewers/Water-Paths-Vaults', boxSet, {contentType: VAULT_CONTENT.LIBRARY});	
	
	// THE_SEWERS - WATER_BRIDGES_VAULTS:
	// ********************************************************************************************
	// Corner
	boxSet = util.createBoxSet(0, 0, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterBridges', 'TheSewers/Water-Bridges-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.CORNER});	

	// Four-Way
	boxSet = util.createBoxSet(0, 16, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterBridges', 'TheSewers/Water-Bridges-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.FOUR_WAY});	

	// Three-Way
	boxSet = util.createBoxSet(0, 32, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterBridges', 'TheSewers/Water-Bridges-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.THREE_WAY});	

	// Challenge Corner
	boxSet = util.createBoxSet(0, 51, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterBridges', 'TheSewers/Water-Bridges-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.CORNER});	

	// Challenge Four-Way
	boxSet = util.createBoxSet(0, 67, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterBridges', 'TheSewers/Water-Bridges-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.FOUR_WAY});	

	// Challenge Three-Way
	boxSet = util.createBoxSet(0, 83, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterBridges', 'TheSewers/Water-Bridges-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.THREE_WAY});	

	// Boss Corner
	boxSet = util.createBoxSet(0, 102, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterBridges', 'TheSewers/Water-Bridges-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.CORNER});	

	// Boss Four-Way
	boxSet = util.createBoxSet(0, 118, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterBridges', 'TheSewers/Water-Bridges-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.FOUR_WAY});	

	// Boss Three-Way
	boxSet = util.createBoxSet(0, 134, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-WaterBridges', 'TheSewers/Water-Bridges-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.THREE_WAY});	

	
	// THE_SEWERS - SEWERS_TUNNELS_VAULTS:
	// ********************************************************************************************
	// Aesthetic Corner
	boxSet = util.createBoxSet(0, 0, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-SewersTunnels', 'TheSewers/Sewers-Tunnels-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.CORNER});	

	// Aesthetic Four-Way
	boxSet = util.createBoxSet(0, 11, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-SewersTunnels', 'TheSewers/Sewers-Tunnels-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.FOUR_WAY});	

	// Aesthetic One-Way
	boxSet = util.createBoxSet(0, 23, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-SewersTunnels', 'TheSewers/Sewers-Tunnels-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.ONE_WAY});	

	// Aesthetic Straight
	boxSet = util.createBoxSet(0, 35, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-SewersTunnels', 'TheSewers/Sewers-Tunnels-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.STRAIGHT});	

	// Aesthetic Three-Way
	boxSet = util.createBoxSet(0, 47, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-SewersTunnels', 'TheSewers/Sewers-Tunnels-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.THREE_WAY});	

	// Challenge Corner
	boxSet = util.createBoxSet(0, 62, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-SewersTunnels', 'TheSewers/Sewers-Tunnels-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.CORNER});	

	// Challenge Four-Way
	boxSet = util.createBoxSet(0, 74, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-SewersTunnels', 'TheSewers/Sewers-Tunnels-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.FOUR_WAY});	

	// Challenge One-Way
	boxSet = util.createBoxSet(0, 86, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-SewersTunnels', 'TheSewers/Sewers-Tunnels-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.ONE_WAY});	

	// Challenge Straight
	boxSet = util.createBoxSet(0, 98, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-SewersTunnels', 'TheSewers/Sewers-Tunnels-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.STRAIGHT});	

	// Challenge Three-Way
	boxSet = util.createBoxSet(0, 110, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-SewersTunnels', 'TheSewers/Sewers-Tunnels-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.THREE_WAY});	

	// Major 18x9:
	boxSet = util.createBoxSet(0, 140, 18, 9, 3, 3, 6, 1);
	this._loadCombinedVaultSet('TheSewers-SewersTunnels', 'TheSewers/Sewers-Tunnels-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.MAJOR});	

	// Major 18x18:
	boxSet = util.createBoxSet(0, 152, 18, 18, 3, 3, 6, 1);
	this._loadCombinedVaultSet('TheSewers-SewersTunnels', 'TheSewers/Sewers-Tunnels-Vaults', boxSet, {contentType: VAULT_CONTENT.AESTHETIC, placementType: VAULT_PLACEMENT.MAJOR});	

	
	// Boss
	boxSet = util.createBoxSet(0, 125, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-SewersTunnels', 'TheSewers/Sewers-Tunnels-Vaults', boxSet, {contentType: VAULT_CONTENT.BOSS, placementType: VAULT_PLACEMENT.CORNER});	

	// Stairs
	boxSet = util.createBoxSet(0, 175, 5, 6, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers-SewersTunnels', 'TheSewers/Sewers-Tunnels-Vaults', boxSet, {contentType: VAULT_CONTENT.SPECIAL, placementType: VAULT_PLACEMENT.SIDE});	


	// THE_SEWERS - CHALLENGE_SIDE_VAULTS:
	// ********************************************************************************************
	// 5x5
	boxSet = util.createBoxSet(0, 0, 5, 5, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers', 'TheSewers/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});	

	// 7x7
	boxSet = util.createBoxSet(0, 8, 7, 7, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers', 'TheSewers/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});	

	// 9x9
	boxSet = util.createBoxSet(0, 18, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers', 'TheSewers/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});	

	// 11x11
	boxSet = util.createBoxSet(0, 30, 11, 11, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheSewers', 'TheSewers/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});	

	// THE_SEWERS - LEVEL_VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 4);
	this._loadCombinedVaultSet('TheSewers', 'TheSewers/Level-Vaults', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});
	
	
	// THE_SEWERS - BOSS-VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 8, 2);
	this._loadCombinedVaultSet('TheSewers', 'TheSewers/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.BOSS});
	
	// THE_SEWERS - SLIME_PIT_LEVELS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 6, 2);
	this._loadCombinedVaultSet('TheSlimePit', 'TheSewers/Slime-Pit-Levels', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});
};

// THE_ICE_CAVES:
// Load all the vault-types for The-Ice-Caves
// ************************************************************************************************
VaultTypeLoader.TheIceCaves = function () {
	let boxSet;
	
	// THE_ICE_CAVES - CHALLENGE_OPEN_VAULTS:		
	// ********************************************************************************************
	// 7x7
	boxSet = util.createBoxSet(0, 0, 7, 7, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheIceCaves', 'TheIceCaves/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.OPEN});	

	// 9x9
	boxSet = util.createBoxSet(0, 10, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheIceCaves', 'TheIceCaves/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.OPEN});	

	// 11x11
	boxSet = util.createBoxSet(0, 22, 11, 11, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheIceCaves', 'TheIceCaves/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.OPEN});	

	// 13x13
	boxSet = util.createBoxSet(0, 36, 13, 13, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheIceCaves', 'TheIceCaves/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.OPEN});	

	// THE_ICE_CAVES - CHALLENGE_SIDE_VAULTS:		
	// ********************************************************************************************
	// 5x5
	boxSet = util.createBoxSet(0, 55, 5, 5, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheIceCaves', 'TheIceCaves/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});	

	// 7x7
	boxSet = util.createBoxSet(0, 63, 7, 7, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheIceCaves', 'TheIceCaves/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});	

	// 9x9
	boxSet = util.createBoxSet(0, 73, 9, 9, 3, 3, 16, 1);
	this._loadCombinedVaultSet('TheIceCaves', 'TheIceCaves/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});	

	// 11x11
	boxSet = util.createBoxSet(0, 85, 11, 11, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheIceCaves', 'TheIceCaves/Challenge-Vaults', boxSet, {contentType: VAULT_CONTENT.CHALLENGE, placementType: VAULT_PLACEMENT.SIDE});	

	// THE_ICE_CAVES - LEVEL_VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 4);
	this._loadCombinedVaultSet('TheIceCaves', 'TheIceCaves/Level-Vaults', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});

	// THE_ICE_CAVES - MAJOR_CAVE_VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 4);
	this._loadCombinedVaultSet('TheIceCaves', 'TheIceCaves/Major-Cave-Vaults', boxSet, {placementType: VAULT_PLACEMENT.MAJOR_CAVE, contentType: VAULT_CONTENT.AESTHETIC});
	
	// THE_ICE_CAVES - BOSS_VAULTS:
	// ********************************************************************************************
	// Level:
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 2);
	this._loadCombinedVaultSet('TheIceCaves', 'TheIceCaves/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.BOSS});

	// Open:
	boxSet = util.createBoxSet(0, 89, 9, 9, 3, 3, 4, 1);
	this._loadCombinedVaultSet('TheIceCaves', 'TheIceCaves/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.OPEN, contentType: VAULT_CONTENT.BOSS});

	// Side:
	boxSet = util.createBoxSet(0, 103, 9, 9, 3, 3, 4, 1);
	this._loadCombinedVaultSet('TheIceCaves', 'TheIceCaves/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.BOSS});
};

// THE_CRYPT:
// Load all the vault-types for The-Crypt
// ************************************************************************************************
VaultTypeLoader.TheCrypt = function () {
	let boxSet;
	
	// THE_CRYPT - INSERT-TOMBS:
	// ********************************************************************************************
	// Base Vaults:
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 2, 4);
	this._loadCombinedVaultSet('TheCryptTombBase', 'TheCrypt/Insert-Tombs', boxSet, {isUnique: true});
	
	// Insert Vaults:
	boxSet = util.createBoxSet(86, 0, 11, 11, 3, 3, 8, 4);
	this._loadCombinedVaultSet('TheCryptTombInsertChallenge', 'TheCrypt/Insert-Tombs', boxSet, {contentType: VAULT_CONTENT.CHALLENGE});
	
	// Boss Vaults:
	boxSet = util.createBoxSet(86, 56, 11, 11, 3, 3, 4, 1);
	this._loadCombinedVaultSet('TheCryptTombInsertBoss', 'TheCrypt/Insert-Tombs', boxSet, {contentType: VAULT_CONTENT.BOSS});
	
	// Library:
	boxSet = util.createBoxSet(86, 70, 11, 11, 3, 3, 1, 1);
	this._loadCombinedVaultSet('TheCryptTombInsertLibrary', 'TheCrypt/Insert-Tombs', boxSet, {contentType: VAULT_CONTENT.LIBRARY});
	
	// THE-CRYPT - SMALL-TUNNELS:
	// ********************************************************************************************
	// Corner:
	boxSet = util.createBoxSet(0, 0, 9, 9, 3, 3, 5, 1);
	this._loadCombinedVaultSet('TheCryptSmallTunnels', 'TheCrypt/Small-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 93, 9, 9, 3, 3, 24, 1);
	this._loadCombinedVaultSet('TheCryptSmallTunnels', 'TheCrypt/Small-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.CHALLENGE});

	// Four Way:
	boxSet = util.createBoxSet(0, 12, 9, 9, 3, 3, 5, 1);
	this._loadCombinedVaultSet('TheCryptSmallTunnels', 'TheCrypt/Small-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 105, 9, 9, 3, 3, 24, 1);
	this._loadCombinedVaultSet('TheCryptSmallTunnels', 'TheCrypt/Small-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.CHALLENGE});
	
	// One Way:
	boxSet = util.createBoxSet(0, 24, 9, 9, 3, 3, 4, 1);
	this._loadCombinedVaultSet('TheCryptSmallTunnels', 'TheCrypt/Small-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.ONE_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 117, 9, 9, 3, 3, 24, 1);
	this._loadCombinedVaultSet('TheCryptSmallTunnels', 'TheCrypt/Small-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.ONE_WAY, contentType: VAULT_CONTENT.CHALLENGE});
	boxSet = util.createBoxSet(0, 177, 9, 9, 3, 3, 4, 1);
	this._loadCombinedVaultSet('TheCryptSmallTunnels', 'TheCrypt/Small-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.ONE_WAY, contentType: VAULT_CONTENT.BOSS});
	
	// Straight:
	boxSet = util.createBoxSet(0, 36, 9, 9, 3, 3, 6, 1);
	this._loadCombinedVaultSet('TheCryptSmallTunnels', 'TheCrypt/Small-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.STRAIGHT, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 129, 9, 9, 3, 3, 24, 1);
	this._loadCombinedVaultSet('TheCryptSmallTunnels', 'TheCrypt/Small-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.STRAIGHT, contentType: VAULT_CONTENT.CHALLENGE});
	
	// Three Way:
	boxSet = util.createBoxSet(0, 48, 9, 9, 3, 3, 6, 1);
	this._loadCombinedVaultSet('TheCryptSmallTunnels', 'TheCrypt/Small-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 141, 9, 9, 3, 3, 24, 1);
	this._loadCombinedVaultSet('TheCryptSmallTunnels', 'TheCrypt/Small-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.CHALLENGE});
	boxSet = util.createBoxSet(0, 201, 9, 9, 3, 3, 12, 1);
	this._loadCombinedVaultSet('TheCryptSmallTunnels', 'TheCrypt/Small-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.BOSS});
	
	// Major:
	boxSet = util.createBoxSet(0, 60, 18, 9, 3, 3, 6, 1);
	this._loadCombinedVaultSet('TheCryptSmallTunnels', 'TheCrypt/Small-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.MAJOR, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 72, 9, 18, 3, 3, 2, 1);
	this._loadCombinedVaultSet('TheCryptSmallTunnels', 'TheCrypt/Small-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.MAJOR, contentType: VAULT_CONTENT.AESTHETIC, allowRotate: false});
	boxSet = util.createBoxSet(84, 72, 18, 18, 3, 3, 5, 1);
	this._loadCombinedVaultSet('TheCryptSmallTunnels', 'TheCrypt/Small-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.MAJOR, contentType: VAULT_CONTENT.AESTHETIC, allowRotate: false});
	
	// THE-CRYPT - BIG-TUNNELS:
	// ********************************************************************************************
	// Corner:
	boxSet = util.createBoxSet(0, 0, 13, 13, 3, 3, 6, 1);
	this._loadCombinedVaultSet('TheCrypt-BigTunnels', 'TheCrypt/Big-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 96, 13, 13, 3, 3, 12, 1);
	this._loadCombinedVaultSet('TheCrypt-BigTunnels', 'TheCrypt/Big-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.CHALLENGE});

	// Four Way:
	boxSet = util.createBoxSet(0, 16, 13, 13, 3, 3, 7, 1);
	this._loadCombinedVaultSet('TheCrypt-BigTunnels', 'TheCrypt/Big-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 112, 13, 13, 3, 3, 12, 1);
	this._loadCombinedVaultSet('TheCrypt-BigTunnels', 'TheCrypt/Big-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.CHALLENGE});
	boxSet = util.createBoxSet(0, 237, 13, 13, 3, 3, 2, 1);
	this._loadCombinedVaultSet('TheCrypt-BigTunnels', 'TheCrypt/Big-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.BOSS});

	// One Way:
	boxSet = util.createBoxSet(0, 32, 13, 13, 3, 3, 1, 1);
	this._loadCombinedVaultSet('TheCrypt-BigTunnels', 'TheCrypt/Big-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.ONE_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 128, 13, 13, 3, 3, 12, 1);
	this._loadCombinedVaultSet('TheCrypt-BigTunnels', 'TheCrypt/Big-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.ONE_WAY, contentType: VAULT_CONTENT.CHALLENGE});
	boxSet = util.createBoxSet(0, 253, 13, 13, 3, 3, 2, 1);
	this._loadCombinedVaultSet('TheCrypt-BigTunnels', 'TheCrypt/Big-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.ONE_WAY, contentType: VAULT_CONTENT.BOSS});

	// Straight:
	boxSet = util.createBoxSet(0, 48, 13, 13, 3, 3, 7, 1);
	this._loadCombinedVaultSet('TheCrypt-BigTunnels', 'TheCrypt/Big-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.STRAIGHT, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 144, 13, 13, 3, 3, 12, 1);
	this._loadCombinedVaultSet('TheCrypt-BigTunnels', 'TheCrypt/Big-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.STRAIGHT, contentType: VAULT_CONTENT.AESTHETIC});

	// Three Way:
	boxSet = util.createBoxSet(0, 64, 13, 13, 3, 3, 10, 1);
	this._loadCombinedVaultSet('TheCrypt-BigTunnels', 'TheCrypt/Big-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 160, 13, 13, 3, 3, 12, 1);
	this._loadCombinedVaultSet('TheCrypt-BigTunnels', 'TheCrypt/Big-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.CHALLENGE});
	boxSet = util.createBoxSet(0, 285, 13, 13, 3, 3, 2, 1);
	this._loadCombinedVaultSet('TheCrypt-BigTunnels', 'TheCrypt/Big-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.BOSS, allowRotate: false});

	// Major:
	boxSet = util.createBoxSet(0, 192, 13, 26, 3, 3, 5, 1);
	this._loadCombinedVaultSet('TheCrypt-BigTunnels', 'TheCrypt/Big-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.MAJOR, contentType: VAULT_CONTENT.AESTHETIC});

	// THE-CRYPT - SIDE_VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 7, 9, 3, 3, 7, 1);
	this._loadCombinedVaultSet('TheCrypt', 'TheCrypt/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	boxSet = util.createBoxSet(0, 12, 8, 7, 3, 3, 3, 1);
	this._loadCombinedVaultSet('TheCrypt', 'TheCrypt/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	boxSet = util.createBoxSet(0, 22, 11, 7, 3, 3, 4, 1);
	this._loadCombinedVaultSet('TheCrypt', 'TheCrypt/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	boxSet = util.createBoxSet(0, 32, 7, 5, 3, 3, 4, 1);
	this._loadCombinedVaultSet('TheCrypt', 'TheCrypt/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	boxSet = util.createBoxSet(0, 56, 5, 5, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheCrypt', 'TheCrypt/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	// THE_CRYPT - LEVEL_VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 4);
	this._loadCombinedVaultSet('TheCrypt', 'TheCrypt/Level-Vaults', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});

	
	// THE_CRYPT - BOSS_VAULTS:
	// ********************************************************************************************
	// Level:
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 2);
	this._loadCombinedVaultSet('TheCrypt', 'TheCrypt/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.BOSS});

	// Side:
	boxSet = util.createBoxSet(0, 89, 13, 13, 3, 3, 4, 1);
	this._loadCombinedVaultSet('TheCrypt', 'TheCrypt/Boss-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.BOSS});
};

// THE_IRON_FORGE:
// Load all the vault-types for The-Iron-Forge
// ************************************************************************************************
VaultTypeLoader.TheIronForge = function () {
	let boxSet;
	
	

	// THE_IRON_FORGE - CONVEYOR_BELT_ROOMS:
	// ********************************************************************************************
	// Corner:
	boxSet = util.createBoxSet(0, 45, 13, 13, 3, 3, 16, 3);
	this._loadCombinedVaultSet('IronForge-ConveyorBeltRooms', 'TheIronForge/Conveyor-Belt-Rooms', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.AESTHETIC, isUnique: true});

	// Four-Way:
	boxSet = util.createBoxSet(0, 96, 13, 13, 3, 3, 16, 2);
	this._loadCombinedVaultSet('IronForge-ConveyorBeltRooms', 'TheIronForge/Conveyor-Belt-Rooms', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.AESTHETIC, isUnique: true});

	// Three-Way:
	boxSet = util.createBoxSet(0, 131, 13, 13, 3, 3, 16, 2);
	this._loadCombinedVaultSet('IronForge-ConveyorBeltRooms', 'TheIronForge/Conveyor-Belt-Rooms', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.AESTHETIC, isUnique: true});

	// Straight:
	boxSet = util.createBoxSet(0, 166, 13, 13, 3, 3, 16, 2);
	this._loadCombinedVaultSet('IronForge-ConveyorBeltRooms', 'TheIronForge/Conveyor-Belt-Rooms', boxSet, {placementType: VAULT_PLACEMENT.STRAIGHT, contentType: VAULT_CONTENT.AESTHETIC, isUnique: true});

	// Corner Stairs:
	boxSet = util.createBoxSet(0, 201, 13, 13, 3, 3, 1, 1);
	this._loadCombinedVaultSet('IronForge-ConveyorBeltRooms-Stairs', 'TheIronForge/Conveyor-Belt-Rooms', boxSet, {placementType: VAULT_PLACEMENT.CORNER});
	boxSet = util.createBoxSet(16, 201, 13, 13, 3, 3, 1, 1);
	this._loadCombinedVaultSet('IronForge-ConveyorBeltRooms-Stairs', 'TheIronForge/Conveyor-Belt-Rooms', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY});

	
	// THE_IRON_FORGE - FACTORY_TUNNELS:
	// ********************************************************************************************
	// Corner:
	boxSet = util.createBoxSet(0, 0, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('IronForge-FactoryTunnels', 'TheIronForge/Factory-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 83, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('IronForge-FactoryTunnels', 'TheIronForge/Factory-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.CORNER, contentType: VAULT_CONTENT.CHALLENGE});

	// Four Way:
	boxSet = util.createBoxSet(0, 16, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('IronForge-FactoryTunnels', 'TheIronForge/Factory-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 99, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('IronForge-FactoryTunnels', 'TheIronForge/Factory-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.FOUR_WAY, contentType: VAULT_CONTENT.CHALLENGE});

	// One Way:
	boxSet = util.createBoxSet(0, 32, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('IronForge-FactoryTunnels', 'TheIronForge/Factory-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.ONE_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 115, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('IronForge-FactoryTunnels', 'TheIronForge/Factory-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.ONE_WAY, contentType: VAULT_CONTENT.CHALLENGE});

	// Straight:
	boxSet = util.createBoxSet(0, 48, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('IronForge-FactoryTunnels', 'TheIronForge/Factory-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.STRAIGHT, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 131, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('IronForge-FactoryTunnels', 'TheIronForge/Factory-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.STRAIGHT, contentType: VAULT_CONTENT.CHALLENGE});

	// Three Way:
	boxSet = util.createBoxSet(0, 64, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('IronForge-FactoryTunnels', 'TheIronForge/Factory-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.AESTHETIC});
	boxSet = util.createBoxSet(0, 147, 13, 13, 3, 3, 16, 1);
	this._loadCombinedVaultSet('IronForge-FactoryTunnels', 'TheIronForge/Factory-Tunnels', boxSet, {placementType: VAULT_PLACEMENT.THREE_WAY, contentType: VAULT_CONTENT.CHALLENGE});

	
	// THE_IRON_FORGE - FACTORY_FLOOR:
	// ********************************************************************************************
	// Base Vaults:
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 6, 2);
	this._loadCombinedVaultSet('FactoryFloorBase', 'TheIronForge/FactoryFloor', boxSet, {isUnique: true});
	
	// Challenge Vaults:
	boxSet = util.createBoxSet(0, 86, 7, 7, 3, 3, 20, 3);
	this._loadCombinedVaultSet('FactoryFloorChallenge', 'TheIronForge/FactoryFloor', boxSet, {contentType: VAULT_CONTENT.CHALLENGE});

	// Boss Vaults:
	boxSet = util.createBoxSet(0, 116, 7, 7, 3, 3, 4, 1);
	this._loadCombinedVaultSet('FactoryFloorBoss', 'TheIronForge/FactoryFloor', boxSet, {contentType: VAULT_CONTENT.BOSS});
	
	// Library Vaults:
	boxSet = util.createBoxSet(0, 126, 7, 7, 3, 3, 1, 1);
	this._loadCombinedVaultSet('FactoryFloorLibrary', 'TheIronForge/FactoryFloor', boxSet, {contentType: VAULT_CONTENT.LIBRARY});
	
	// THE_IRON_FORGE - SIDE_VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 5, 4, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheIronForge', 'TheIronForge/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	boxSet = util.createBoxSet(0, 7, 10, 4, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheIronForge', 'TheIronForge/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	boxSet = util.createBoxSet(0, 14, 11, 6, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheIronForge', 'TheIronForge/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	boxSet = util.createBoxSet(0, 23, 7, 7, 3, 3, 12, 1);
	this._loadCombinedVaultSet('TheIronForge', 'TheIronForge/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	// Small Zoos
	boxSet = util.createBoxSet(0, 41, 5, 5, 3, 3, 10, 1);
	this._loadCombinedVaultSet('TheIronForge', 'TheIronForge/Challenge-Side-Vaults', boxSet, {placementType: VAULT_PLACEMENT.SIDE, contentType: VAULT_CONTENT.CHALLENGE});

	// THE_IRON_FORGE - BOSS_LEVELS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 3, 2);
	this._loadCombinedVaultSet('TheIronForge', 'TheIronForge/Boss-Levels', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.BOSS});
	
	// THE_IRON_FORGE - LEVEL_VAULTS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 4);
	this._loadCombinedVaultSet('TheIronForge', 'TheIronForge/Level-Vaults', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});
};

// THE_VAULT_OF_YENDOR:
// Load all The-Vault-Of-Yendor vault-types:
// ************************************************************************************************
VaultTypeLoader.TheVaultOfYendor = function () {
	let boxSet;
	
	// THE_VAULT_OF_YENDOR - LEVEL_VAULTS_1.41:
	// ********************************************************************************************
	//boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 4, 4);
	//this._loadCombinedVaultSet('TheVaultOfYendor', 'TheVaultOfYendor/Level-Vaults-1.41', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});
	
	
	// THE_VAULT_OF_YENDOR - LEVEL_VAULTS_ROUGH_01:
	// ********************************************************************************************
	// LEVEL_01:
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 8, 1);
	this._loadCombinedVaultSet('TheVaultOfYendor-Rough', 'TheVaultOfYendor/Level-Vaults-Rough01', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});
	
	// LEVEL_02:
	boxSet = util.createBoxSet(0, 43, 40, 40, 3, 3, 9, 1);
	this._loadCombinedVaultSet('TheVaultOfYendor-Rough', 'TheVaultOfYendor/Level-Vaults-Rough01', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});
	
	// THE_VAULT_OF_YENDOR - LEVEL_VAULTS_ROUGH_02:
	// ********************************************************************************************
	// LEVEL_01:
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 7, 1);
	this._loadCombinedVaultSet('TheVaultOfYendor-Rough', 'TheVaultOfYendor/Level-Vaults-Rough02', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});
	
	// LEVEL_02:
	boxSet = util.createBoxSet(0, 43, 40, 40, 3, 3, 6, 2);
	this._loadCombinedVaultSet('TheVaultOfYendor-Rough', 'TheVaultOfYendor/Level-Vaults-Rough02', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});
	
	// THE_VAULT_OF_YENDOR - LEVEL_VAULTS_FINAL:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 6, 10);
	this._loadCombinedVaultSet('TheVaultOfYendor', 'TheVaultOfYendor/Level-Vaults-Final', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});
	
	// THE_VAULT_OF_YENDOR - BOSS_LEVELS:
	// ********************************************************************************************
	boxSet = util.createBoxSet(0, 0, 40, 40, 3, 3, 3, 3);
	this._loadCombinedVaultSet('TheVaultOfYendorBoss', 'TheVaultOfYendor/Boss-Levels', boxSet, {placementType: VAULT_PLACEMENT.LEVEL, contentType: VAULT_CONTENT.AESTHETIC});
	
	// THE_VAULT_OF_YENDOR - BOSS_TELEPORT_LEVELS:
	// ********************************************************************************************
	// Entrance:
	boxSet = util.createBoxSet(0, 0, 9, 8, 3, 3, 1, 1);
	this._loadCombinedVaultSet('TheVaultOfYendor-TeleportBossEntrance', 'TheVaultOfYendor/Boss-Teleport-Levels', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.AESTHETIC});
	
	// Minor:
	boxSet = util.createBoxSet(0, 11, 17, 15, 3, 3, 6, 2);
	this._loadCombinedVaultSet('TheVaultOfYendor-TeleportBossMinor', 'TheVaultOfYendor/Boss-Teleport-Levels', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.AESTHETIC});
	
	// Major:
	boxSet = util.createBoxSet(0, 47, 23, 17, 3, 3, 6, 1);
	this._loadCombinedVaultSet('TheVaultOfYendor-TeleportBossMajor', 'TheVaultOfYendor/Boss-Teleport-Levels', boxSet, {placementType: VAULT_PLACEMENT.SOLID, contentType: VAULT_CONTENT.AESTHETIC});
	
};
	

// PARSE_VAULT_TYPE_FILES:
// Called in gs.create(), after json has loaded to parse the data in each vault file
// ************************************************************************************************
VaultTypeLoader.parseVaultTypeFiles = function () {
	// Create combined vault types:
	this.parseCombinedVaultSets();
	
	// Parse each vault:
	gs.vaultTypeList.forEach(function (vaultType) {
		vaultType.parseData();
	}, this);
	
	this.createVaultGenerateFuncs();
};

// PARSE_COMBINED_VAULT_SETS
// ************************************************************************************************
VaultTypeLoader.parseCombinedVaultSets = function () {
	this.combinedVaultSetData.forEach(function (data) {
		let fileName = data.fileName;
		let vaultSet = data.vaultSet;
		let boxList = data.boxList;
		let vaultProperties = data.vaultProperties;
		
		let fileData = game.cache.getJSON(fileName);
		
		// Create a vaultType for each box:
		boxList.forEach(function (box, i) {
			// Skip if empty:
			if (this._isCombinedVaultBoxEmpty(fileName, box)) {
				return;
			}

			// Skip if out of bounds:
			if (box.endX > fileData.width) {
				return;
			}
			
			let name = vaultSet;

			// Adding placementType to name:
			if (vaultProperties.placementType) {
				name += '/' + vaultProperties.placementType;
			}

			// Adding contentType to name:
			if (vaultProperties.contentType) {
				name += '/' + vaultProperties.contentType;
			}

			// Adding number:
			name += '0' + (i + 1);

			let vaultType = new VaultType(name);

			// Set Properties:
			vaultType.vaultSet = vaultSet;
			vaultType.isCombinedVaultSet = true;
			vaultType.fileName = fileName;
			vaultType.box = box;

			// Additional Properties:
			for (let key in vaultProperties) {
				if (vaultProperties.hasOwnProperty(key)) {
					vaultType[key] = vaultProperties[key];
				}
			}

			gs.vaultTypeList.push(vaultType);

			return vaultType;
		}, this);	
	}, this);
};

// PRIVATE: IS_EMPTY_COMBINED_VAULT_BOX:
// Returns true if there are no tiles in the box for the combined vault set
// This makes it easy to add new vaults since we can specify a large range and only those boxes that are filled will be loaded.
// ************************************************************************************************
VaultTypeLoader._isCombinedVaultBoxEmpty = function (fileName, box) {
	// Data:
	let data = game.cache.getJSON(fileName);
	
	// Search for at least 1 frame in the box:
	for (let x = 0; x < box.width; x += 1) {
		for (let y = 0; y < box.height; y += 1) {
			// Frame from the JSON file:
			let frame = data.layers[0].data[(box.startY + y) * data.width + (box.startX + x)] - 1;
			
			// We have found at least 1 tile so the box is not empty
			if (frame !== -1) {
				return false;
			}
		}
	}
	
	// We have found no tiles so the box is empty:
	return true;
};

// VERIFY_VAULT_TYPES:
// Called in gs.create(), after json has loaded and the data has been parsed
// ************************************************************************************************
VaultTypeLoader.verifyVaultTypes = function () {
	gs.vaultTypeList.forEach(function (vaultType) {
		if (vaultType.isCombinedVaultSet) {
			return;
		}
		
		// Handles all verification in order to avoid duplication of code:
		try {
			let tileTypeMap = vaultType.getTileTypeMap();
			
			// Tagging Water:
			for (let x = 0; x < tileTypeMap.width; x += 1) {
				for (let y = 0; y < tileTypeMap.height; y += 1) {
					if (gs.getNameFromFrame(tileTypeMap[x][y].f, gs.tileTypes) === 'Water') {
						vaultType.hasWater = true;
					}
				}
			}
			
			// WARNING: glyph door w/o solid walls:
			let hasGlyphDoor = false;
			let hasSolidWall = false;
			for (let x = 0; x < tileTypeMap.width; x += 1) {
				for (let y = 0; y < tileTypeMap.height; y += 1) {
					if (tileTypeMap[x][y].s) {
						hasSolidWall = true;
					}
					
					if (tileTypeMap[x][y].obj && tileTypeMap[x][y].obj.type.name === 'GlyphDoor') {
						hasGlyphDoor = true;
					}
				}
			}
			if (vaultType.placementType !== VAULT_PLACEMENT.LEVEL && hasGlyphDoor && !hasSolidWall) {
				//console.log('WARNING - Vault Verification: glyph door w/o solidWalls: ' + vaultType.name);
			}
			
		}
		catch (e) {
			console.log('Vault verification error for: ' + vaultType.name);
			throw e;
		}
		
		
		
	}, this);
};

// PRIVATE: LOAD_COMBINED_VAULT_SET
// ************************************************************************************************
VaultTypeLoader._loadCombinedVaultSet = function (vaultSet, fileName, boxList, vaultProperties = {}) {
	// Load the JSON:	
	game.load.json(fileName, 'assets/maps/vault-types/' + fileName + '.json');
	
	// Create the combined vault set:
	// Later this will be used during parsing to create the vault type
	this.combinedVaultSetData.push({
		vaultSet: vaultSet,
		fileName: fileName,
		boxList: boxList,
		vaultProperties: vaultProperties
	});
};



// PRIVATE: LOAD_CONTENT_VAULT_SET:
// ************************************************************************************************
VaultTypeLoader._loadContentVaultSet = function (vaultSet) {
	let loadList = [];
	
	// We will attempt to load every combinations of contentType, and placementType:	
	gs.forEachType(VAULT_CONTENT, function (contentType) {
		gs.forEachType(VAULT_PLACEMENT, function (placementType) {
			loadList.push({vaultSet: vaultSet, contentType: contentType, placementType: placementType});
		}, this);
	}, this);

	// Attempt to load from every directory:
	loadList.forEach(function (e) {
		let dirPath = path.normalize(VAULT_PATH_ROOT + vaultSet + '/' + e.contentType + '/' + e.placementType + '/');
		
		if (fs.existsSync(dirPath)) {
			fs.readdir(dirPath, null, function (error, fileList) {
				if (error) {
					throw error;
				}
				
                // Load each vault:
                fileList.forEach(function (fileName) {

                    if (path.parse(fileName).ext === '.json') {
                        // END_LEVELS:
						if (e.contentType === VAULT_CONTENT.END_LEVEL) {
							// Pass (handled in _loadEndLevelVaultset)
						}
						// CONTENT_VAULTS:
						else {
							// Parse the name:
							let name = vaultSet + '/' + e.contentType + '/' + e.placementType + '/' + path.parse(fileName).name;

							// Create the VaultType:
							let vaultType = VaultTypeLoader._loadVaultTypeFile(name);

							// Set Properties:
							vaultType.vaultSet = vaultSet;
							vaultType.contentType = e.contentType;
							vaultType.placementType = e.placementType;
						}
                    }
                    
 

                }, this);
				
			});
		}
	}, this);
};

// PRIVATE: LOAD_PLACEMENT_VAULT_SET:
// ************************************************************************************************
VaultTypeLoader._loadPlacementVaultSet = function (vaultSet, subPath, properties) {
	let loadList = [];
	
	if (!fs.existsSync(VAULT_PATH_ROOT + subPath)) {
		throw 'Invalid Directory: ' + vaultSet;
	}
	
	// We will attempt to load every combinations of contentType, and placementType:	
	gs.forEachType(VAULT_PLACEMENT, function (placementType) {
		loadList.push({vaultSet: vaultSet, contentType: VAULT_CONTENT.SPECIAL, placementType: placementType});
	}, this);

	// Attempt to load from every directory:
	loadList.forEach(function (e) {
		let dirPath = path.normalize(VAULT_PATH_ROOT + subPath + e.placementType + '/');
		
		
		if (fs.existsSync(dirPath)) {
			fs.readdir(dirPath, null, function (error, fileList) {
				if (error) {
					throw error;
				}
				
				
                // Load each vault:
                fileList.forEach(function (fileName) {
                    if (path.parse(fileName).ext === '.json') {
                 
						// Parse the name:
						let name = subPath + e.placementType + '/' + path.parse(fileName).name;
						
						// Create the VaultType:
						let vaultType = VaultTypeLoader._loadVaultTypeFile(name);

						// Set Properties:
						vaultType.vaultSet = vaultSet;
						vaultType.contentType = e.contentType;
						vaultType.placementType = e.placementType;
						
						// Set Override Properties:
						for (let key in properties) {
							if (properties.hasOwnProperty(key)) {
								vaultType[key] = properties[key];
							}
						}
                    }
                }, this);
				
			});
		}
	}, this);
};

// PRIVATE: LOAD_END_LEVEL_VAULT_SET:
// ************************************************************************************************
VaultTypeLoader._loadEndLevelVaultSet = function (vaultSet) {
	let dirPath = path.normalize(VAULT_PATH_ROOT + vaultSet + '/EndLevel/');
	
	
		
	if (fs.existsSync(dirPath)) {
		
		fs.readdir(dirPath, null, function (error, fileList) {
			if (error) {
				throw error;
			}
			else {
				// Load each vault:
				fileList.forEach(function (fileName) {
					if (path.parse(fileName).ext === '.json') {
						// Parse the name:
						let name = vaultSet + '/EndLevel/' + path.parse(fileName).name;

						// Create the VaultType:
						let vaultType = VaultTypeLoader._loadVaultTypeFile(name);

						// Set Properties:
						vaultType.vaultSet = vaultSet;
						vaultType.contentType = VAULT_CONTENT.END_LEVEL;
						vaultType.placementType = VAULT_PLACEMENT.LEVEL;
					}
				}, this);
			}
		});
	}
};

// PRIVATE: LOAD_SPECIAL_VAULT_SET:
// ************************************************************************************************
VaultTypeLoader._loadSpecialVaultSet = function (vaultSet, subPath, properties) {

	let dirPath = path.normalize(VAULT_PATH_ROOT + subPath);

	if (fs.existsSync(dirPath)) {
		fs.readdir(dirPath, null, function (error, fileList) {
			if (error) {
				throw error;
			}
			else {
				// Load each vault:
				fileList.forEach(function (fileName) {
					if (path.parse(fileName).ext === '.json') {
						
						// Parse the name:
						let name = subPath + path.parse(fileName).name;

						// Create the VaultType:
						let vaultType = VaultTypeLoader._loadVaultTypeFile(name);

						// Set Default Properties:
						vaultType.vaultSet = vaultSet;
						vaultType.placementType = VAULT_PLACEMENT.SPECIAL;

						// Set Override Properties:
						for (let key in properties) {
							if (properties.hasOwnProperty(key)) {
								vaultType[key] = properties[key];
							}
						}
					}
				}, this);
			}
		});
	}
	
};

// PRIVATE: LOAD_CONNECTED_TUNNELS_TEMPLATES
// ************************************************************************************************
VaultTypeLoader._loadConnectedTunnelsTemplates = function (vaultSet, subPath) {
	// List of directories to load from:
	let loadList = [];
	gs.forEachType(VAULT_CONTENT, function (contentType) {
		gs.forEachType(VAULT_PLACEMENT, function (placementType) {
			loadList.push({contentType: contentType, placementType: placementType});
		}, this);
	}, this);
	
	// Attempt to load from every directory:
	loadList.forEach(function (e) {
		let dirPath = path.normalize(VAULT_PATH_ROOT + subPath + e.contentType + '/' + e.placementType + '/');
		
		if (fs.existsSync(dirPath)) {
            
			fs.readdir(dirPath, null, function (error, fileList) {
				if (error) {
					throw error;
				}
				else {
					
					// Load each vault:
					fileList.forEach(function (fileName) {
						// Parse the name:
						let name = subPath + e.contentType + '/' + e.placementType + '/' + path.parse(fileName).name;
		
						// Create the VaultType:
						let vaultType = VaultTypeLoader._loadVaultTypeFile(name);
						
						// Set Properties:
						vaultType.vaultSet = vaultSet;
						vaultType.contentType = e.contentType;
						vaultType.placementType = e.placementType;
					}, this);
				}
			});
		}
	}, this);
};

// PRIVATE: LOAD_VAULT_TYPE_FILE:
// Loads a single Vault-Type-File given its unique name (also its file path)
// ************************************************************************************************
VaultTypeLoader._loadVaultTypeFile = function (name) {
	let vaultType = new VaultType(name);
		
	game.load.json(vaultType.name, 'assets/maps/vault-types/' + vaultType.name + '.json');
		
	gs.vaultTypeList.push(vaultType);
		
	return vaultType;
};

// CREATE_VAULT_GENERATE_FUNCS:
// ************************************************************************************************
VaultTypeLoader.createVaultGenerateFuncs = function () {
	let generateFunc, createPopulateFunction;
	
	createPopulateFunction = function (npcTypeList) {
		return function (area) {
			let indexList = gs.getIndexListInArea(area).filter(index => gs.getTile(index).tagID === 1);
			
			let npcTypeName = util.randElem(npcTypeList);
			
			indexList.forEach(function (tileIndex) {
				gs.createNPC(tileIndex, npcTypeName);
			}, this);
		};
	};
	
	// YENDOR_BOSS:
	// ********************************************************************************************
	/*
	generateFunc = function (area) {
		let tileIndex = gs.getAllIndex().find(index => gs.getTile(index).tagID === 1);
		
		let typeName = util.randElem(['TheWizardYendorFire', 'TheWizardYendorStorm', 'TheWizardYendorIce', 'TheWizardYendorToxic', 'TheWizardYendorMagic']);
		
		gs.createNPC(tileIndex, typeName);
	};
	gs.getVaultType('YendorBoss01').generateFunc = generateFunc;
	*/
	
	// MONSTER_PORTAL_SPAWNER:
	// ******************************************************************************************** 
    generateFunc = function (area) {
		let indexList = gs.getIndexListInArea(area);
		
		let npcTypeList = gs.dropWallSpawnTables[gs.zoneName].filter(e => gs.npcTypes[e.name].level <= gs.dangerLevel());
        let npcTypeList2 = gs.dropWallSpawnTables[gs.zoneName].filter(e => gs.npcTypes[e.name].level <= gs.dangerLevel());
		let type = util.randElem(npcTypeList);
        let type2= util.randElem(npcTypeList2);
		
		indexList.forEach(function (tileIndex) {
			if (gs.getTile(tileIndex).spawnNPCName === 'REPLACE_ME') {
				if(util.frac() < 0.5){
                    gs.getTile(tileIndex).spawnNPCName = type2.name;
                } 
                else {
                    gs.getTile(tileIndex).spawnNPCName = type.name;
			     }    
            }
		}, this);
	};
    gs.getVaultType('DarkTemple-PortalSpawn01').generateFunc = generateFunc;
	gs.getVaultType('DarkTemple-PortalSpawn02').generateFunc = generateFunc;
	gs.getVaultType('DarkTemple-PortalSpawn03').generateFunc = generateFunc;
	gs.getVaultType('DarkTemple-PortalSpawn04').generateFunc = generateFunc;
	gs.getVaultType('DarkTemple-PortalSpawn05').generateFunc = generateFunc;
	gs.getVaultType('DarkTemple-PortalSpawn06').generateFunc = generateFunc;
	gs.getVaultType('DarkTemple-PortalSpawn07').generateFunc = generateFunc;
	gs.getVaultType('DarkTemple-PortalSpawn08').generateFunc = generateFunc;
	gs.getVaultType('DarkTemple-PortalSpawn09').generateFunc = generateFunc;
    gs.getVaultType('DarkTemple-PortalSpawn10').generateFunc = generateFunc;
	
	// THE_ICE_CAVES - FROST_GIANT_KING_03:
	// Placing health or energy fountains on all Tag-1
	// ********************************************************************************************
	generateFunc = function (area) {
		let indexList = gs.getAllIndex().filter(index => gs.getTile(index).tagID === 1);		
		indexList.forEach(function (tileIndex) {
			gs.createObject(tileIndex, util.randElem(['HealthFountain', 'EnergyFountain']));
		}, this);		
	};
	gs.getVaultType('TheIceCaves-FrostGiantKing').generateFunc = generateFunc;
    
	
	// THE_UPPER_DUNGEON - TOME_OF_KNOWLEDGE:
	//********************************************************************************************
	generateFunc = function (area) {
		gs.objectList.find(obj => obj.type.name === 'TomeOfKnowledge').talentList = TomeGenerator.getTomeOfKnowledgeTalentList(1);
	};
	gs.getVaultType('TheUpperDungeon-TomeOfKnowledge').generateFunc = generateFunc;
    
	
    // THE_UPPER_DUNGEON - UpperDungeon-ambushBridge 
    //Spawn ememies of the same type
    //********************************************************************************************
	generateFunc = function (area) {
		let indexList = gs.getAllIndex().filter(index => gs.getTile(index).tagID === 1);
        let indexList2 = gs.getAllIndex().filter(index => gs.getTile(index).tagID === 2);	
		let npcTypeName;
        let npcTypeName2;
            if(gs.zoneLevel==1 || gs.zoneLevel==2){
                npcTypeName = util.randElem(['GoblinArcher', 'GoblinWarrior']);
                if(util.frac()<0.5){
                npcTypeName2 = util.randElem(['GoblinFireMage', 'GoblinStormMage','GoblinShaman']);
            }}
            else{
                npcTypeName = util.randElem(['Centipede', 'CaveBear']);
            }
      indexList.forEach(function (tileIndex) {
			     gs.createNPC(tileIndex, npcTypeName);
		          }, this);
        if(npcTypeName2){
        indexList2.forEach(function (tileIndex) {
			     gs.createNPC(tileIndex, npcTypeName2);
		          }, this);
        }
        };
	gs.getVaultType('UpperDungeon_ambushBridge').generateFunc = generateFunc;

	// THE_SEWERS-GATE_LEVEL:
	// ********************************************************************************************
	generateFunc = function (area) {
		gs.levelFeatures.push({featureType: FEATURE_TYPE.SWITCH, toTileIndex: {x: 19, y: 3}});
	};
	gs.getVaultType('TheSewers-GateLevel').generateFunc = generateFunc;
		
	// YENDOR - FOUR_VAULTS:
	// ********************************************************************************************
	generateFunc = createPopulateFunction(['CrystalGolem', 'TentacleTerror']);
	gs.getVaultType('TheVaultOfYendor/CenterTemplates/Side/Golem01').generateFunc = generateFunc;
	gs.getVaultType('TheVaultOfYendor/CenterTemplates/Side/Golem02').generateFunc = generateFunc;
	
	generateFunc = createPopulateFunction(['EvilEye', 'Demonologist', 'StormLich', 'InfernoLich']);
	gs.getVaultType('TheVaultOfYendor/CenterTemplates/Side/Caster01').generateFunc = generateFunc;
	
	// IRON_FORGE - CLOCKWORK_NOOKS:
	// ********************************************************************************************
	generateFunc = function (area) {
		let indexList = gs.getIndexListInArea(area).filter(index => gs.getTile(index).tagID === 1);
	
		let npcTypeName = util.randElem(['ClockworkWarrior', 'ClockworkArcher', 'ClockworkPyro']);
		
		indexList.forEach(function (tileIndex) {
			gs.createNPC(tileIndex, npcTypeName);
		}, this);
	};
	gs.getVaultType('TheIronForge-Nooks01').generateFunc = generateFunc;
	gs.getVaultType('TheIronForge-Nooks02').generateFunc = generateFunc;
	gs.getVaultType('TheIronForge-Nooks03').generateFunc = generateFunc;
	gs.getVaultType('TheIronForge-Nooks04').generateFunc = generateFunc;
	
	// YENDOR - DROP_WALL_VORTEX:
	// ********************************************************************************************
	generateFunc = function (area) {
		let indexList = gs.getIndexListInArea(area).filter(index => gs.getTile(index).tagID === 1);
	
		let npcTypeName = util.randElem(['FrostVortex', 'FlameVortex']);
		
		indexList.forEach(function (tileIndex) {
			gs.createNPC(tileIndex, npcTypeName);
		}, this);
	};
	gs.getVaultType('TheVaultOfYendor/Challenge/Solid/DropWallVortex01').generateFunc = generateFunc;
	gs.getVaultType('TheVaultOfYendor/Challenge/Solid/DropWallVortex02').generateFunc = generateFunc;
	

	// DROP_WALL_GENERIC:
	// ********************************************************************************************
	generateFunc = function (area) {
		if (!gs.debugProperties.spawnMobs) {
			return;
		}
		
		// Changing Tiles to match the drop wall:
		let indexList = gs.getIndexListInBox(area).filter(index => gs.getTile(index).isStandardDropWall);
		let numDungeon = indexList.filter(index => gs.getTile(index).type.name === 'Wall').length;
		let numCave = indexList.filter(index => gs.getTile(index).type.name === 'CaveWall').length;
		
		// Changing the default dungeon walls and floor to cave:
		if (numCave > numDungeon) {
			let indexList = gs.getIndexListInBox(area); 
			indexList.forEach(function (tileIndex) {
				// Wall -> Cave Wall:
				if (gs.getTile(tileIndex).type.name === 'Wall') {
					gs.setTileType(tileIndex, gs.tileTypes.CaveWall);
				}
				
				// Floor -> Cave Floor:
				if (gs.getTile(tileIndex).type.name === 'Floor') {
					gs.setTileType(tileIndex, gs.tileTypes.CaveFloor);
				}
			}, this);
		}
		
		
		
		// Dont Spawn Monsters:
		if (!gs.debugProperties.spawnStaticMobs) {
			return;
		}
		// Spawning Monsters:
		else {
			let indexList = gs.getIndexListInArea(area).filter(index => gs.getTile(index).tagID === 1);
		
			let npcTypeList = gs.dropWallSpawnTables[gs.zoneName].filter(e => gs.npcTypes[e.name].level <= gs.dangerLevel());

			let type = util.randElem(npcTypeList);

			if (type.max && indexList.length > type.max) {
				indexList = util.randSubset(indexList, type.max);
			}

			indexList.forEach(function (tileIndex) {
				gs.createNPC(tileIndex, type.name);
			}, this);
		}
	};
	gs.getVaultType('_General/Challenge/Side/DropWallGeneric01').generateFunc = generateFunc;
	gs.getVaultType('_General/Challenge/Side/DropWallGeneric02').generateFunc = generateFunc;
	gs.getVaultType('_General/Challenge/Side/DropWallGeneric03').generateFunc = generateFunc;
	gs.getVaultType('_General/Challenge/Side/DropWallGeneric04').generateFunc = generateFunc;
	gs.getVaultType('_General/Challenge/Side/DropWallGeneric05').generateFunc = generateFunc;
	
	
	// VAULT_OF_YENDOR: END_LEVEL:
	// Places the goblet at a random tagged tileIndex
	// ********************************************************************************************
	generateFunc = function (area) {
		let indexList = gs.getAllIndex().filter(index => gs.getTile(index).tagID === 1);
		gs.createFloorItem(util.randElem(indexList), Item.createItem('GobletOfYendor'));
	};
	gs.getVaultType('TheVaultOfYendor/EndLevel/EndLevel03').generateFunc = generateFunc;
	gs.getVaultType('TheVaultOfYendor/EndLevel/EndLevel04').generateFunc = generateFunc;
	
	// VAULT_OF_YENDOR: PORTAL_LOOPS:
	// Places the Down-Stairs and two Reward-Hooks at tagID:1
	// ********************************************************************************************
	generateFunc = function (area) {
		let indexList = gs.getAllIndex().filter(index => gs.getTile(index).tagID === 1);
		indexList = util.shuffleArray(indexList);
		
		// Down-Stairs:
		gs.createObject(indexList[0], 'DownStairs');
		
		// Reward-Hooks:
		gs.getTile(indexList[1]).rewardHook = {tileIndex: {x: indexList[1].x, y: indexList[1].y}, toTileIndexList: []};
		gs.getTile(indexList[2]).rewardHook = {tileIndex: {x: indexList[2].x, y: indexList[2].y}, toTileIndexList: []};
	};
	gs.getVaultType('Portal-Loops-01').generateFunc = generateFunc;
	gs.getVaultType('Portal-Loops-02').generateFunc = generateFunc;
	gs.getVaultType('Portal-Loops-03').generateFunc = generateFunc;
	gs.getVaultType('Portal-Loops-04').generateFunc = generateFunc;
	gs.getVaultType('Portal-Loops-05').generateFunc = generateFunc;
	gs.getVaultType('Pit-Paths-Ice').generateFunc = generateFunc;
	gs.getVaultType('Arena03').generateFunc = generateFunc;
	
	// VAULT_OF_YENDOR: MULTI-CRYPT-02:
	// Places the Down-Stairs and three Reward-Hooks at tagID:1
	// ********************************************************************************************
	generateFunc = function (area) {
		let indexList = gs.getAllIndex().filter(index => gs.getTile(index).tagID === 1);
		indexList = util.shuffleArray(indexList);
		
		// Down-Stairs:
		gs.createObject(indexList[0], 'DownStairs');
		
		// Reward-Hooks:
		gs.getTile(indexList[1]).rewardHook = {tileIndex: {x: indexList[1].x, y: indexList[1].y}, toTileIndexList: []};
		gs.getTile(indexList[2]).rewardHook = {tileIndex: {x: indexList[2].x, y: indexList[2].y}, toTileIndexList: []};
		gs.getTile(indexList[3]).rewardHook = {tileIndex: {x: indexList[3].x, y: indexList[3].y}, toTileIndexList: []};
	};
	gs.getVaultType('Multi-Crypt-02').generateFunc = generateFunc;
	gs.getVaultType('Multi-Crypt-03').generateFunc = generateFunc;
	gs.getVaultType('Multi-Crypt-04').generateFunc = generateFunc;
	gs.getVaultType('Multi-Crypt-05').generateFunc = generateFunc;
	gs.getVaultType('Multi-Crypt-06').generateFunc = generateFunc;

	
	// VAULT_OF_YENDOR: QUAD_HOARD_FIRE_AND_ICE: 
	// Places a switch and two Reward-Hooks at tagID:1
	// ********************************************************************************************
	generateFunc = function (area) {
		let indexList = gs.getAllIndex().filter(index => gs.getTile(index).tagID === 1);
		indexList = util.shuffleArray(indexList);
		
		// Gate tileIndex:
		let tileIndex = gs.objectList.find(obj => obj.type.niceName === "Switch Gate").tileIndex;
		
		// Switch:
		let obj = gs.createObject(indexList[0], 'Switch');
		obj.toTileIndexList = [{x: tileIndex.x, y: tileIndex.y}];
		
		// Reward-Hooks:
		gs.getTile(indexList[1]).rewardHook = {tileIndex: {x: indexList[1].x, y: indexList[1].y}, toTileIndexList: []};
		gs.getTile(indexList[2]).rewardHook = {tileIndex: {x: indexList[2].x, y: indexList[2].y}, toTileIndexList: []};
	};
	gs.getVaultType('Quad-Hoard-Fire').generateFunc = generateFunc;
	gs.getVaultType('Quad-Hoard-Ice').generateFunc = generateFunc;
	
	// VAULT_OF_YENDOR: PYRAMID_FORTRESS: 
	// Places a switch and Reward-Hook at tagID:1
	// ********************************************************************************************
	generateFunc = function (area) {
		let indexList = gs.getAllIndex().filter(index => gs.getTile(index).tagID === 1);
		indexList = util.shuffleArray(indexList);
		
		// Gate tileIndex:
		let tileIndex = gs.objectList.find(obj => obj.type.niceName === "Switch Gate").tileIndex;
		
		// Switch:
		let obj = gs.createObject(indexList[0], 'Switch');
		obj.toTileIndexList = [{x: tileIndex.x, y: tileIndex.y}];
		
		// Reward-Hooks:
		gs.getTile(indexList[1]).rewardHook = {tileIndex: {x: indexList[1].x, y: indexList[1].y}, toTileIndexList: []};
	};
	gs.getVaultType('Pyramid-Fortress-01').generateFunc = generateFunc;
	gs.getVaultType('Pyramid-Fortress-02').generateFunc = generateFunc;
	gs.getVaultType('Pyramid-Fortress-03').generateFunc = generateFunc;
	
	// VAULT_OF_YENDOR: QUAD_HOARD - STORM, TOXIC, SLIME: 
	// Places the Down-Stairs and one Reward-Hook at tagID:1
	// ********************************************************************************************
	generateFunc = function (area) {
		let indexList = gs.getAllIndex().filter(index => gs.getTile(index).tagID === 1);
		indexList = util.shuffleArray(indexList);
		
		// Switch:
		let obj = gs.createObject(indexList[0], 'DownStairs');
		
		// Reward-Hook:
		gs.getTile(indexList[1]).rewardHook = {tileIndex: {x: indexList[1].x, y: indexList[1].y}, toTileIndexList: []};
	};
	gs.getVaultType('Quad-Hoard-Storm').generateFunc = generateFunc;
	gs.getVaultType('Quad-Hoard-Toxic').generateFunc = generateFunc;
	gs.getVaultType('Quad-Hoard-Slime').generateFunc = generateFunc;
	
    
    // VAULT_OF_YENDOR: Ring-Room, Piramid-Room, Poison-Room:
	// Places the Stairs at a random tagged tileIndex
	// ********************************************************************************************
	generateFunc = function (area) {
		let indexList = gs.getAllIndex().filter(index => gs.getTile(index).tagID === 1);
		gs.createObject(util.randElem(indexList), 'DownStairs');
	};
	
	gs.getVaultType('Yendor-Ring-Room').generateFunc = generateFunc;
    gs.getVaultType('Yendor-Pyramid-Room').generateFunc = generateFunc;
    gs.getVaultType('Yendor-Poison-Room').generateFunc = generateFunc;
    gs.getVaultType('Yendor-Water-Room').generateFunc = generateFunc;
	
	// THE_CORE_LEVEL: LITTLE_FORTS:
	// Places a switch to open the locked downstairs gate in one of the 3 forts:
	// ********************************************************************************************
	generateFunc = function (area) {
		let indexList = gs.getAllIndex().filter(index => gs.getTile(index).tagID === 1);
		let obj = gs.createObject(util.randElem(indexList), 'Switch');
		obj.toTileIndexList = [{x: 18, y: 16}];
	};
	
	gs.getVaultType('TheCore-LittleForts').generateFunc = generateFunc;

	// THE_CORE_END_LEVEL: EFREETI:
	// Places a portal to the efreeti in one of the 4 lava river nooks.
	// Otherwise places a fire statue
	// ********************************************************************************************
	/*
	generateFunc = function (area) {
		let indexList = gs.getAllIndex().filter(index => gs.getTile(index).tagID === 1);
		util.shuffleArray(indexList);
		
		// Portal:
		let obj = gs.createObject(indexList[0], 'Portal');
		obj.toTileIndexList = [{x: 20, y: 6}];
		
		// Remaining are FireStatues:
		gs.createNPC(indexList[1], 'FireStatue');
		gs.createNPC(indexList[2], 'FireStatue');
		gs.createNPC(indexList[3], 'FireStatue');
	};
	gs.getVaultType('TheCore/EndLevel/Efreeti').generateFunc = generateFunc;
	*/
	
	
	// THE_SEWERS_END_LEVEL_02:
	// ********************************************************************************************
	/*
	generateFunc = function (area) {
		let indexList = gs.getAllIndex().filter(index => gs.getTile(index).tagID === 1);
		util.shuffleArray(indexList);
		
		gs.createFloorItem(indexList[0], Item.createItem('RuneOfSlime'));
		gs.createContainer(indexList[1], 'Chest');
		gs.createContainer(indexList[2], 'Chest');
		gs.createContainer(indexList[3], 'Chest');
		
	};
	gs.getVaultType('TheSewers/EndLevel/EndLevel02').generateFunc = generateFunc;
	*/
	
	// SMALL_LIBRARY:
	// ********************************************************************************************
	generateFunc = function (area) {
		let maxTalentTier;

		// Wilderness Zone:
		if (gs.dangerLevel() <= 6) {
			maxTalentTier = 1;
		}
		else {
			maxTalentTier = 3;
		}
		
		let talentList = TomeGenerator.getTomeOfKnowledgeTalentList(maxTalentTier);
		let tileIndex = gs.getIndexListInArea(area).find(index => gs.getObj(index, 'TomeOfKnowledge'));
		let tomeOfKnowledge = gs.getObj(tileIndex);
		tomeOfKnowledge.talentList = talentList;
	};
	gs.vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.LIBRARY).forEach(function (vaultType) {
		vaultType.generateFunc = generateFunc;
	}, this);
	

	// MAIN_LIBRARY:
	// ********************************************************************************************
	generateFunc = function (area) {
		let talentList = TomeGenerator.getTomeOfKnowledgeTalentList(3);
		let tileIndex = gs.getIndexListInArea(area).find(index => gs.getObj(index, 'TomeOfKnowledge'));
		let tomeOfKnowledge = gs.getObj(tileIndex);
		tomeOfKnowledge.talentList = talentList;		
	};
	gs.getVaultType('_General/MajorReward/Solid/MainLibrary').generateFunc = generateFunc;
	
	
    // THE_PLAGUE_LORD:
	// ********************************************************************************************
	/*
	generateFunc = function (area) {
		let obj;
		
		let list = [
			{switchTileIndex: {x: 9, y: 10}, doorTileIndex: {x: 11, y: 10}},
			{switchTileIndex: {x: 28, y: 9}, doorTileIndex: {x: 28, y: 11}},
			{switchTileIndex: {x: 29, y: 28}, doorTileIndex: {x: 27, y: 28}},
			{switchTileIndex: {x: 10, y: 29}, doorTileIndex: {x: 10, y: 27}},
		];
		list = util.randSubset(list, 4);
		
		// Island 1 (No Gate):
		obj = gs.createObject(list[0].switchTileIndex, 'Switch');
		obj.toTileIndexList.push(list[1].doorTileIndex);
		
		// Island 2 (Gate):
		gs.createDoor(list[1].doorTileIndex, 'SwitchDoor');
		obj = gs.createObject(list[1].switchTileIndex, 'Switch');
		obj.toTileIndexList.push(list[2].doorTileIndex);
		
		// Island 3 (Gate):
		gs.createDoor(list[2].doorTileIndex, 'SwitchDoor');
		obj = gs.createObject(list[2].switchTileIndex, 'Switch');
		obj.toTileIndexList.push(list[3].doorTileIndex);
		
		// Island 4 (Portal):
		gs.createDoor(list[3].doorTileIndex, 'SwitchDoor');
		obj = gs.createObject(list[3].switchTileIndex, 'Portal');
		obj.toTileIndexList.push({x: 19, y: 23});
	};
  
    gs.getVaultType('TheSewers/EndLevel/ThePlagueLord').generateFunc = generateFunc;
    */

    
	
	/*

	// ARCHERY_RANGE:
	// ********************************************************************************************
	this.vaultGenerateFuncs.Orc_ArcheryRange01 = function (area) {
		stockCrystalChests(area, [
			'LongBow', 
			'RingOfDexterity', 
			'ArcheryGoggles'
		]);
	};
	
	// THE_OGRE_CAVES:
	// ********************************************************************************************
	this.vaultGenerateFuncs.Orc_OgreCaves01 = function (area) {
		stockCrystalChests(area, [
			'WarHammer',
			'BattleAxe',
			'RingOfStrength', 
			'GauntletsOfStrength', 
		]);
	};
	this.vaultGenerateFuncs.Orc_OgreCaves02 = this.vaultGenerateFuncs.Orc_OgreCaves01;
	
	// THE_ORC_KINGS_HALL:
	// ********************************************************************************************
	this.vaultGenerateFuncs.Orc_KingsHall01 = function (area) {
		stockCrystalChests(area, [
			'WarHammer',
			'BattleAxe',
			'Halberd',
			'TwoHandSword',
			'RingOfStrength', 
			'GauntletsOfStrength',
			'HeavyBrassArmor',
		]);
	};
	
	// GRAX_THE_FROST_SHAMAN:
	// ********************************************************************************************
	this.vaultGenerateFuncs.Ice_GraxTheFrostShaman01 = function (area) {
		// Crystal Chests:
		stockCrystalChests(area, [
			'RingOfIce',
			'GreaterStaffOfIce',
			'RobeOfIce',
			'WhiteDragonScaleArmor',
			'WhiteDragonScaleShield',
			'WandOfCold',
		]);
	};
	

	
	// ARCH_MAGI_FLAME_01:
	// ********************************************************************************************
	this.vaultGenerateFuncs.AT_ArchMagiFlame01 = function (area) {
		let indexList = gs.getAllIndex().filter(index => gs.getTile(index).tagID === 1);
		indexList = util.randSubset(indexList, 3);
		
		// Portal:
		let object = gs.createObject(indexList[0], 'Portal');
		object.toTileIndex = {x: 20, y: 4};
		
		// Chests:
		gs.createObject(indexList[1], 'Chest');
		gs.createObject(indexList[2], 'Chest');
		
		// Crystal Chests:
		stockCrystalChests(area, [
			'RingOfFire',
			'GreaterStaffOfFire',
			'RobeOfFlames',
			'RedDragonScaleArmor',
			'RedDragonScaleShield',
			'InfernoSword',
			'WandOfFire',
		]);
	};
	
	
	
	
	
	// IRON_WAR_ENGINE_01:
	// ********************************************************************************************
	this.vaultGenerateFuncs.Iron_WarEngine01 = function (area) {
		// Crystal Chests:
		stockCrystalChests(area, [
			'BattleAxe',
			'Bomb', 
			'RingOfStrength',
			'RingOfProtection',
			'ScrollOfEnchantment',
			'ScrollOfAcquirement',

		]);
	};
	
	// CORE_STATIC_04:
	// ********************************************************************************************
	this.vaultGenerateFuncs.Core_Static04 = function (area) {
		let indexList = gs.getAllIndex().filter(index => gs.getTile(index).tagID === 1);
		gs.createObject(util.randElem(indexList), 'DownStairs');
	};
	
	// TEST_LEVEL_01:
	// ********************************************************************************************
	this.vaultGenerateFuncs.TestLevel01 = function (area) {
		// Crystal Chests:
		stockCrystalChests(area, [
			'PotionOfHealing',
			'PotionOfEnergy',
			'PotionOfResistance',
		]);
	};
	
	
	*/
};

// COUNT_VAULTS:
// ************************************************************************************************
VaultTypeLoader.countVaults = function () {
	
	
	// Vault-Sets per zone:
	let zoneList = {
		// Upper Dungeon:
		TheUpperDungeon: 	{vaultSetList: ['_General', '_Dungeon', 'TheUpperDungeon', 'UpperDungeonNarrowHalls', 'UpperDungeonCaveTunnels']},
		
		// Wilderness:
		TheSwamp: 			{vaultSetList: ['_General', 'TheSwamp']},
		TheSunlessDesert: 	{vaultSetList: ['_General', 'TheSunlessDesert']},
		TheUnderGrove: 		{vaultSetList: ['_General', 'TheUnderGrove']},
		
		// Tier-3:
		TheDarkTemple:		{vaultSetList: [
			'_General',
			'_Tier3',
			'TheDarkTemple',
			'ConnectedCircles',
			'TheDarkTemple - Temple-Templates-Top',
			'TheDarkTemple - Temple-Templates-Middle',
			'TheDarkTemple - Temple-Templates-Bottom',
		]},
		TheOrcFortress:		{vaultSetList: ['_General', '_Tier3', '_Dungeon', 'TheOrcFortress']},
		
		// Branch-1:
		TheSewers: 			{vaultSetList: [
			'_General', 
			'TheSewers', 
			'SewersTunnelsTemplates', 
			'WaterPathsTemplates', 
			'WaterBridgesTemplates', 
			'SlimePitTemplates', 
			'TheSlimePit',
			'TheSewers-WaterPaths',
			'TheSewers-SewersTunnels',
			'TheSewers-WaterBridges',
		]},
		TheCore: 			{vaultSetList: [
			'_General',
			'TheCore',
			'LavaIslandsTemplates',
			'TheCore-LavaIslands',
			'TheCore-LavaTunnels',
		]},
		TheIceCaves: 		{vaultSetList: ['_General', 'TheIceCaves']},
		
		// Branch-2:
		TheIronForge: 		{vaultSetList: [
			'_General',
			'TheIronForge',
			'IronForgeTunnels',
			'IronForge-ConveyorBeltRooms',
			'IronForge-ConveyorBeltRooms-Stairs',
			'IronForge-FactoryTunnels',
			'FactoryFloorBase',
			'FactoryFloorChallenge',
			'FactoryFloorBoss',
			'FactoryFloorLibrary',
		]},
		TheArcaneTower: 	{vaultSetList: [
			'_General',
			'TheArcaneTower',
			'PortalRooms',
			'ArcaneRingOuter',
			'ArcaneRingMiddle',
			'ArcaneRingInner',
			'TheArcaneTower-PortalRooms',
			'ArcanePitPaths',
			'TheArcaneTowerBossLevels',
		]},
		TheCrypt: 			{vaultSetList: [
			'_General', 
			'TheCrypt', 
			'TheLichKingsLair', 
			'SmallCryptTunnelsTemplates', 
			'CryptTunnelsTemplates',
			'TheCryptTombBase',
			'TheCryptTombInsertChallenge',
			'TheCryptTombInsertBoss',
			'TheCryptTombInsertLibrary',
			'TheCryptSmallTunnels',
			'TheCrypt-BigTunnels'
		]},
		
		// Yendor:
		TheVaultOfYendor: 	{vaultSetList: [
			'_General', 
			'TheVaultOfYendor', 
			'PitPathsTemplates', 
			'YendorLiquidTunnels', 
			'YendorCenter', 
			'YendorSide', 
			'YendorEndLevelCenter',
			'YendorEndLevelFirst',
			'YendorEndLevelSecond',
			'YendorEndLevelFinal',
		]},
	};
	gs.nameTypes(zoneList);
	
	// Get all Vault-Sets:
	let vaultSets = [];
	gs.vaultTypeList.forEach(function (vaultType) {
		if (!util.inArray(vaultType.vaultSet, vaultSets)) {
			vaultSets.push(vaultType.vaultSet);
		}
	}, this);
	
	// Confirm that we have listed all Vault-Sets:
	vaultSets.forEach(function (vaultSet) {
		let found = false;
		
		// Checking each zone:
		gs.forEachType(zoneList, function (zone) {
			if (util.inArray(vaultSet, zone.vaultSetList)) {
				found = true;
			}
		}, this);
		
		if (vaultSet && !util.inArray(vaultSet, ['_General', 'TestZone']) && !found) {
			console.log('Unidentified vaultSet: ' + vaultSet);
		}
	}, this);
	
	// Confirm that all Vault-Sets are valid:
	gs.forEachType(zoneList, function (zone) {
		zone.vaultSetList.forEach(function (vaultSet) {
			if (!util.inArray(vaultSet, vaultSets)) {
				console.log('No vault-set exists: ' + vaultSet);
			}
		}, this);
	}, this);
	
	// Counting Vaults per zone:
	gs.forEachType(zoneList, function (zone) {
		zone.numVaults = 0;
		zone.numChallengeVaults = 0;
		zone.numBossVaults = 0;
		zone.numDropWallVaults = 0;
		zone.numZooVaults = 0;
		zone.numMajorVaults = 0;
		zone.numStaticLevels = 0;
		
		
		zone.vaultSetList.forEach(function (vaultSet) {
			let vaultTypeList;
			
			// Num Vaults:
			vaultTypeList = gs.vaultTypeList;
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.vaultSet === vaultSet);
			zone.numVaults += vaultTypeList.length;
			
			// Num Challenge Vaults:
			vaultTypeList = gs.vaultTypeList;
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.vaultSet === vaultSet);
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.CHALLENGE);
			zone.numChallengeVaults += vaultTypeList.length;
			
			// Num Boss Vaults:
			vaultTypeList = gs.vaultTypeList;
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.vaultSet === vaultSet);
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.BOSS);
			zone.numBossVaults += vaultTypeList.length;
			
			// Num Drop Wall Vaults:
			vaultTypeList = gs.vaultTypeList;
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.vaultSet === vaultSet);
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.CHALLENGE);
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.name.includes('DropWall'));
			zone.numDropWallVaults += vaultTypeList.length;
			
			// Num Drop Zoos:
			vaultTypeList = gs.vaultTypeList;
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.vaultSet === vaultSet);
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.CHALLENGE);
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.name.includes('Zoo'));
			zone.numZooVaults += vaultTypeList.length;
			
			// Num Major Vaults:
			vaultTypeList = gs.vaultTypeList;
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.vaultSet === vaultSet);
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.MAJOR || vaultType.placementType === VAULT_PLACEMENT.MAJOR_CAVE);
			zone.numMajorVaults += vaultTypeList.length;
			
			// Static Levels:
			vaultTypeList = gs.vaultTypeList;
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.vaultSet === vaultSet);
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.LEVEL);
			vaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.AESTHETIC);
			zone.numStaticLevels += vaultTypeList.length;
			
		}, this);
	}, this);
	
	// Formatting the output table:
	let table = {};
	gs.forEachType(zoneList, function (zone) {
		table[zone.name] = {
			vaults: 		zone.numVaults,
			challenge:		zone.numChallengeVaults,
			boss:			zone.numBossVaults,
			dropWall:		zone.numDropWallVaults,
			zoo:			zone.numZooVaults,
			major:			zone.numMajorVaults,
			staticLevel:	zone.numStaticLevels,
		};
	}, this);

	// Logging table:
	console.table(table);
};

// COUNT_BOSS_VAULTS:
// ************************************************************************************************
VaultTypeLoader.countBossVaults = function () {
	let bossNameList = gs.npcTypeList.filter(npcType => npcType.isBoss).map(npcType => npcType.name);
	
	// Only display some bosses:
	let restrictList = [
		// The Upper Dungeon:
		'UmbraTheHighShaman',
		'ArgoxTheWarlord',
		'BlastoTheArchMagi',
		'BojackTheBerserker',
		'ArgylTheSwift',
		
		// The Swamp:
		'GixloTheWitchDoctor', 
		'IraTheSwampSiren',
		
		// The Under Grove:
		'TheCorruptedEnt',
		'TheQueenSpider',
		'TheCentaurKing',
		
		// The Sunless Desert:
		'KingUrazzoTheAncient', 
		'TheKingOfThieves',
		'SynaxTheSnakeCharmer',
	];
	
	// Formatting output table:
	let table = {};
	bossNameList.forEach(function (bossName) {
		if (util.inArray(bossName, restrictList)) {
			table[bossName] = {};
			
			// Count Vaults:
			let vaultTypeList = gs.vaultTypeList.filter(vaultType => vaultType.bossName === bossName);
			
			// Total Vaults:
			table[bossName].vaults = vaultTypeList.length;
			
			// Level Vaults:
			table[bossName].levelVaults = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.LEVEL).length;
			
			
		}
		
	}, this);
	
	// Logging table:
	console.table(table);
};
	
// COUNT_ENTRANCE_VAULTS:
// ************************************************************************************************
VaultTypeLoader.countEntranceVaults = function () {
	let branchList = [
		'TheCore',
		'TheIceCaves',
		'TheSewers',
		'TheArcaneTower',
		'TheCrypt',
		'TheIronForge',
	];
	
	// Formatting output table:
	let table = {};
	branchList.forEach(function (zoneName) {
		
		table[zoneName] = {};

		// Count Vaults:
		let vaultTypeList = gs.vaultTypeList.filter(vaultType => vaultType.toZoneName === zoneName);

		// Total Vaults:
		table[zoneName].total = vaultTypeList.length;
		
		// Side Vaults:
		table[zoneName].side = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.SIDE).length;
												    
		// Major Vaults:
		table[zoneName].major = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.MAJOR).length;
		
		
	}, this);
	
	// Logging table:
	console.table(table);
};