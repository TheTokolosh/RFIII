/*global gs, util*/
/*global ItemGenerator, GameMetric*/
/*global VAULT_CONTENT, VAULT_PLACEMENT, ZONE_TIER*/
/*jshint esversion: 6*/
'use strict';





var FEATURE_TYPE = {
	// ITEMS:
	ITEM:			'ITEM',             // {itemTypeName: string}
	RAND_ITEM:		'RAND_ITEM',        // {itemDropTableName: string}
	
	// NPCS:
	FRIENDLY_NPC:	'FRIENDLY_NPC',     // {npcTypeName: string}
	WANDERING_NPC:	'WANDERING_NPC',    // {npcTypeName: string}
	BOSS:			'BOSS',             // {bossName: string},
	
	// LEVEL_GEN:
	OBJECT:			'OBJECT',           // {objectTypeName: string}
	VAULT_TYPE:		'VAULT_TYPE',       // {vaultTypeName: string}
	VAULT_SET:		'VAULT_SET',		// {vaultSet: string}
	SWITCH:			'SWITCH',           // {toTileIndex}
	ZONE_LINE:		'ZONE_LINE',		// {toZoneName, toZoneLevel, stairsType}
	CONTENT:		'CONTENT',			// {contentType: string},
};

var DungeonGenerator = {
	zoneGenerators: {} // Custom functions to perform generation in each zone
};

// GENERATE:
// This function is called once and only once per game in new-game.js in order to generate the global dungeon features
// ************************************************************************************************
DungeonGenerator.generate = function () {
    // Clear everything:
    this.clear();
    
    // Select zones for each tier:
	this.selectZones();
	
    // Select level features for each level:
    this.selectLevelFeatures();
};

// CLEAR:
// ************************************************************************************************
DungeonGenerator.clear = function () {
    this.zones = {};
	this.zoneList = [];
    this.levelFeaturesList = [];
};

// TO_DATA:
// ************************************************************************************************
DungeonGenerator.toData = function () {
	let data = {};
	
	// Zones:
	data.zones = this.zones;
	data.zoneList = this.zoneList;
	
	// Level Feature List:
	data.levelFeaturesList = [];
	this.levelFeaturesList.forEach(function (levelFeature) {
		data.levelFeaturesList.push(levelFeature.toData());
	}, this);
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
DungeonGenerator.loadData = function (data) {
	this.clear();
	
	// Zones:
	this.zones = data.zones;
	this.zoneList = data.zoneList;
	
	// Level Features List:
	data.levelFeaturesList.forEach(function (levelFeatureData) {
		this.levelFeaturesList.push(LevelFeatures.createFromData(levelFeatureData));
	}, this);
	
};

// SELECT_ZONES:
// ************************************************************************************************
DungeonGenerator.selectZones = function () {
	this.zones = {};
	
	
	// WILDERNESS:
	this.zones.Wilderness = util.randElem([
		'TheSwamp',
		'TheSunlessDesert',
		'TheUnderGrove',
	]);
	
	// TIER_3:
	this.zones.Tier3 = util.randElem([
		'TheOrcFortress',
		'TheDarkTemple',
	]);
	
	
	// BRANCH-1:
	this.zones.Branch1 = util.randElem([
		'TheSewers',
		'TheCore',
		'TheIceCaves',
	]);
	
	// BRANCH-2:
	this.zones.Branch2 = util.randElem([
		'TheArcaneTower',
		'TheIronForge',
		'TheCrypt',
	]);
	
	
	// DEBUG_SELECT_ZONES:
	this.debugSelectZones();
	
	// METRIC_SELECT_ZONES:
	this.metricSelectAllZones();
	this.metricSelectSingleZone();
    
    // Zone List:
	this.zoneList = [];
	this.zoneList.push('TheUpperDungeon');
	this.zoneList.push(this.zones.Wilderness);
	this.zoneList.push(this.zones.Tier3);
	this.zoneList.push(this.zones.Branch1);
	this.zoneList.push(this.zones.Branch2);
	this.zoneList.push('TheVaultOfYendor');
	

    // Creating the Level-Features list:
	this.zoneList.forEach(function (zoneName) {	
		if (!gs.zoneTypes[zoneName]) {
			throw zoneName;
		}
		for (let ZL = 1; ZL <= gs.zoneTypes[zoneName].numLevels; ZL += 1) {
        	this.levelFeaturesList.push(new LevelFeatures(zoneName, ZL));
    	}
	}, this);
};

// DEBUG_SELECT_ZONES:
// ************************************************************************************************
DungeonGenerator.debugSelectZones = function () {
	// FORCE_ZONES:
	this.zones.Wilderness = gs.debugProperties.forceZones.Wilderness || this.zones.Wilderness;
	this.zones.Tier3 = gs.debugProperties.forceZones.Tier3 || this.zones.Tier3;
	this.zones.Branch1 = gs.debugProperties.forceZones.Branch1 || this.zones.Branch1;
	this.zones.Branch2 = gs.debugProperties.forceZones.Branch2 || this.zones.Branch2;
		
	// START_ZONE:
	if (gs.debugProperties.startZoneName) {
		let zoneName = gs.debugProperties.startZoneName;
		
		// Wilderness:
		if (util.inArray(zoneName, ['TheUnderGrove', 'TheSunlessDesert', 'TheSwamp'])) {
			this.zones.Wilderness = zoneName;
		}
		
		// Tier-3:
		if (util.inArray(zoneName, ['TheOrcFortress', 'TheDarkTemple'])) {
			this.zones.Tier3 = zoneName;
		}
	
		// Branch-1:
		if (util.inArray(zoneName, ['TheIceCaves', 'TheCore', 'TheSewers'])) {
			this.zones.Branch1 = zoneName;
		}
		
		// Branch-2:
		if (util.inArray(zoneName, ['TheCrypt', 'TheIronForge', 'TheArcaneTower'])) {
			this.zones.Branch2 = zoneName;
		}
	}
};

// METRIC_SELECT_ALL_ZONES:
// ************************************************************************************************
DungeonGenerator.metricSelectAllZones = function () {
	if (gs.debugProperties.metricRunFullGame) {
		let branches = ['Branch1', 'Branch2'];
	
		GameMetric.zoneList.forEach(function (zoneName) {
			// Wilderness:
			if (util.inArray(zoneName, ['TheUnderGrove', 'TheSunlessDesert', 'TheSwamp'])) {
				this.zones.Wilderness = zoneName;
			}
			
			// Tier-3:
			if (util.inArray(zoneName, ['TheOrcFortress', 'TheDarkTemple'])) {
				this.zones.Tier3 = zoneName;
			}

			// Branch-1:
			if (util.inArray(zoneName, ['TheIceCaves', 'TheCore', 'TheSewers'])) {
				this.zones.Branch1 = zoneName;
			}

			// Branch-2:
			if (util.inArray(zoneName, ['TheCrypt', 'TheIronForge', 'TheArcaneTower'])) {
				this.zones.Branch2 = zoneName;
			}
		}, this);
	}

};

// METRIC_SELECT_SINGLE_ZONE:
// ************************************************************************************************
DungeonGenerator.metricSelectSingleZone = function () {
	if (gs.debugProperties.metricTestSingleZone) {
		let zoneName = gs.debugProperties.metricTestSingleZone;
		
		// Wilderness:
		if (util.inArray(zoneName, ['TheUnderGrove', 'TheSunlessDesert', 'TheSwamp'])) {
			this.zones.Wilderness = zoneName;
		}
		
		// Tier-3:
		if (util.inArray(zoneName, ['TheOrcFortress', 'TheDarkTemple'])) {
			this.zones.Tier3 = zoneName;
		}

		// Branch-1:
		if (util.inArray(zoneName, ['TheIceCaves', 'TheCore', 'TheSewers'])) {
			this.zones.Branch1 = zoneName;
		}

		// Branch-2:
		if (util.inArray(zoneName, ['TheCrypt', 'TheIronForge', 'TheArcaneTower'])) {
			this.zones.Branch2 = zoneName;
		}
	}

};

// GET_LEVEL_FEATURES:
// ************************************************************************************************
DungeonGenerator.getLevelFeatures = function (zoneName, zoneLevel) {
	zoneName = zoneName || gs.zoneName;
	zoneLevel = zoneLevel || gs.zoneLevel;
	
	if (zoneName === 'TestZone') {
		return [];
	}
	
	let levelFeatures = this.levelFeaturesList.find(levelFeatures => levelFeatures.zoneName === zoneName && levelFeatures.zoneLevel === zoneLevel);
	
	if (levelFeatures) {
		return levelFeatures.features;
	}
	else {
		throw 'DungeonGenerator.getLevelFeatures() ' + zoneName + ':' + zoneLevel;
	}
};

// SELECT_LEVEL_FEATURES:
// ************************************************************************************************
DungeonGenerator.selectLevelFeatures = function () {
    // Special Zone Generators:
    this.zoneList.forEach(function (zoneName) {
        if (this.zoneGenerators[zoneName]) {
			this.zoneGenerators[zoneName].call(this);
		}
    }, this);
	
	// GUARANTEED_EQUIPMENT:
	// In order to help the player fill out his slots in the early game we guarantee at least 4 pieces of equipment from different slots.
	// This equipment can drop in any of the first 8 dungeon levels of the game.
	let dropTableList = util.randSubset(['Body', 'Head', 'Hands', 'Feet', 'Shields', 'Rings', 'MeleeWeapons', 'RangeWeapons'], 4);
	let levelList = util.randSubset([
		{zoneName: 'TheUpperDungeon', zoneLevel: 1},
		{zoneName: 'TheUpperDungeon', zoneLevel: 2},
		{zoneName: 'TheUpperDungeon', zoneLevel: 3},
		{zoneName: 'TheUpperDungeon', zoneLevel: 4},
		{zoneName: this.zones.Wilderness, zoneLevel: 1},
		{zoneName: this.zones.Wilderness, zoneLevel: 2},
		{zoneName: this.zones.Wilderness, zoneLevel: 3},
		{zoneName: this.zones.Wilderness, zoneLevel: 4},
	], 4);
	levelList.forEach(function (level) {
		this.getLevelFeatures(level.zoneName, level.zoneLevel).push({
			featureType: FEATURE_TYPE.RAND_ITEM,
			itemDropTableName: dropTableList.pop()
		});
	}, this);
	
	// TIER_3_MAIN_LIBRARY:
	this.getLevelFeatures(this.zones.Tier3, 3).push({
		featureType: FEATURE_TYPE.VAULT_TYPE,
		vaultTypeName: '_General/MajorReward/Solid/MainLibrary'
	});
	
	// GUARANTEED_ITEMS:
	this.addGuaranteedItems();
	
	
	// WILDERNESS MERCHANT:
	if (util.frac() < 0.5) {
		this.getLevelFeatures(this.zones.Wilderness, util.randInt(2, 4)).push({
        	featureType: FEATURE_TYPE.FRIENDLY_NPC, npcTypeName: 'Merchant'
		});
	}
	
	// TIER_3 MERCHANT:
	this.getLevelFeatures(this.zones.Tier3, util.randInt(1, 5)).push({
		featureType: FEATURE_TYPE.FRIENDLY_NPC, npcTypeName: 'Merchant'
	});
	
	// BRANCH FRIENDLY_NPCS:
	// Guarantee at least 1 merchant
	let npcTypeList = ['Merchant', util.randElem(['Merchant', 'Enchanter', 'TalentTrainer'])];
	npcTypeList = util.shuffleArray(npcTypeList);
	let zoneList = [this.zones.Branch1, this.zones.Branch2];
	zoneList.forEach(function (zoneName) {
		this.getLevelFeatures(zoneName, util.randInt(1, 4)).push({
        	featureType: FEATURE_TYPE.FRIENDLY_NPC, npcTypeName: npcTypeList.pop()
		});
	}, this);
	
	// SHRINE:
	// We perform this step near the end and make sure to insert in a mostly empty level
	this.addShrine();
	
	
	
	// ZONE_CONNECTIONS:
	this.createZoneConnection(this.zones.Wilderness, 4, this.zones.Tier3, 1);
	this.createZoneConnection(this.zones.Tier3, 2, this.zones.Branch1, 1);
	this.createZoneConnection(this.zones.Tier3, 4, this.zones.Branch2, 1);
	this.createZoneConnection(this.zones.Tier3, 6, 'TheVaultOfYendor', 1);
};

// ADD_SHRINE:
// ************************************************************************************************
DungeonGenerator.addShrine = function () {
	let list = [
		{zoneName: this.zones.Tier3, zoneLevel: 1},
		{zoneName: this.zones.Tier3, zoneLevel: 2},
		// Ignore Tier3:3 due to main library
		{zoneName: this.zones.Tier3, zoneLevel: 4},
		{zoneName: this.zones.Tier3, zoneLevel: 5},
		{zoneName: this.zones.Branch1, zoneLevel: 1},
		{zoneName: this.zones.Branch1, zoneLevel: 2},
		{zoneName: this.zones.Branch1, zoneLevel: 3},
		{zoneName: this.zones.Branch1, zoneLevel: 4},
		{zoneName: this.zones.Branch2, zoneLevel: 1},
		{zoneName: this.zones.Branch2, zoneLevel: 2},
		{zoneName: this.zones.Branch2, zoneLevel: 3},
		{zoneName: this.zones.Branch2, zoneLevel: 4},
	];
	
	// We never place a shrine and library on the same level:
	list = list.filter(e => !this.getLevelFeatures(e.zoneName, e.zoneLevel).find(feature => feature.contentType === 'Library'));
	
	// SHRINES:
	let selection = util.randElem(list);
	let shrineName = util.randElem([
		VAULT_CONTENT.SHRINE_OF_STRENGTH,
		VAULT_CONTENT.SHRINE_OF_INTELLIGENCE,
		VAULT_CONTENT.SHRINE_OF_DEXTERITY
	]);
	this.getLevelFeatures(selection.zoneName, selection.zoneLevel).push({
		featureType: FEATURE_TYPE.CONTENT,
		contentType: shrineName,
	});
};


// ADD_GUARANTEED_ITEMS:
// ************************************************************************************************
DungeonGenerator.addGuaranteedItems = function () {
	let zoneList;
	
	// GUARANTEED_FOOD:
	zoneList = [
		'TheUpperDungeon',
		this.zones.Tier3,
		this.zones.Wilderness,
		this.zones.Branch1,
		this.zones.Branch2,
	];
	zoneList.forEach(function (zoneName) {
		this.getLevelFeatures(zoneName, 3).push({
        	featureType: FEATURE_TYPE.ITEM,
        	itemTypeName: 'Meat'
		});
	}, this);
	
	// Guaranteed to drop 1-4 enchantment scrolls or attribute potions in second half of game:
	zoneList = [
		// Tier-3:
		{zoneName: this.zones.Tier3, zoneLevel: 4},
		{zoneName: this.zones.Tier3, zoneLevel: 5},
		
		// Branch-1:
		{zoneName: this.zones.Branch1, zoneLevel: 3},
		{zoneName: this.zones.Branch1, zoneLevel: 4},
		
		// Branch-2:
		{zoneName: this.zones.Branch2, zoneLevel: 1},
		{zoneName: this.zones.Branch2, zoneLevel: 2},
		{zoneName: this.zones.Branch2, zoneLevel: 3},
		{zoneName: this.zones.Branch2, zoneLevel: 4},
	];

	zoneList = util.randSubset(zoneList, util.randInt(1, 4));
	zoneList.forEach(function (e) {
		this.getLevelFeatures(e.zoneName, e.zoneLevel).push({
        	featureType: FEATURE_TYPE.ITEM,
        	itemTypeName: util.randElem(['ScrollOfEnchantment', 'PotionOfGainAttribute'])
		});
	}, this);
};

// CREATE_ZONE_CONNECTION:
// ************************************************************************************************
DungeonGenerator.createZoneConnection = function (fromZoneName, fromZoneLevel, toZoneName, toZoneLevel) {
	this.getLevelFeatures(fromZoneName, fromZoneLevel).push({featureType: FEATURE_TYPE.ZONE_LINE, toZoneName: toZoneName, toZoneLevel: toZoneLevel, stairsType: 'DownStairs'});
	this.getLevelFeatures(toZoneName, toZoneLevel).push({featureType: FEATURE_TYPE.ZONE_LINE, toZoneName: fromZoneName, toZoneLevel: fromZoneLevel, stairsType: 'UpStairs'});
};

// THE_UPPER_DUNGEON:
// ************************************************************************************************
DungeonGenerator.zoneGenerators.TheUpperDungeon = function () {
	// WILDERNESS_CONNECTION:
	// Wilderness:1 => TheUpperDungeon:4
	this.getLevelFeatures(DungeonGenerator.zones.Wilderness, 1).push({featureType: FEATURE_TYPE.ZONE_LINE, toZoneName: 'TheUpperDungeon', toZoneLevel: 4, stairsType: 'UpStairs'});

	// TheUpperDungeon:4 => Wilderness:1
	this.getLevelFeatures('TheUpperDungeon', 4).push({
		featureType: FEATURE_TYPE.ZONE_LINE, 
		toZoneName: DungeonGenerator.zones.Wilderness, 
		toZoneLevel: 1, 
		stairsType: 'DownStairs'
	});
		
    // MINOR_BOSS:
	// Appears 50% of the time:
    if (util.frac() < 0.5) {
        this.getLevelFeatures('TheUpperDungeon', util.randInt(2, 3)).push({
            featureType: FEATURE_TYPE.BOSS,
            bossName: util.randElem([
				'TheRatPiper',
				'TheVampireBat',
				'TheAncientCaveBear',
			])
        });
    }
    
    // MAJOR_BOSS:
	this.getLevelFeatures('TheUpperDungeon', 4).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			'BojackTheBerserker',
			'UmbraTheHighShaman',
			'ArgoxTheWarlord',
			'ArgylTheSwift',
			'BlastoTheArchMagi',
		])
    });
};

// THE_SUNLESS_DESERT:
// ************************************************************************************************
DungeonGenerator.zoneGenerators.TheSunlessDesert = function () {
	// LIBRARY:
	this.getLevelFeatures('TheSunlessDesert', util.randInt(2, 4)).push({
		featureType: FEATURE_TYPE.CONTENT,
		contentType: VAULT_CONTENT.LIBRARY,
	});
		
	// MINOR_BOSS:
    if (util.frac() < 0.5) {
        this.getLevelFeatures('TheSunlessDesert', util.randInt(1, 3)).push({
            featureType: FEATURE_TYPE.BOSS,
            bossName: util.randElem([
				'CylomarTheAncientPyromancer'
			])
        });
    }
	
	// MAJOR_BOSS:
	this.getLevelFeatures('TheSunlessDesert', 4).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			'KingUrazzoTheAncient', 
			'TheKingOfThieves',
			'SynaxTheSnakeCharmer'
		])
    });
};

// THE_SWAMP:
// ************************************************************************************************
DungeonGenerator.zoneGenerators.TheSwamp = function () {
	// LIBRARY:
	this.getLevelFeatures('TheSwamp', util.randInt(2, 4)).push({
		featureType: FEATURE_TYPE.CONTENT,
		contentType: VAULT_CONTENT.LIBRARY,
	});
	
	// MINOR_BOSS:
    if (util.frac() < 0.5) {
        this.getLevelFeatures('TheSwamp', util.randInt(1, 3)).push({
            featureType: FEATURE_TYPE.BOSS,
            bossName: util.randElem([
				'KasicTheMosquitoPrince'
			])
        });
    }
	
	// MAJOR_BOSS:
	this.getLevelFeatures('TheSwamp', 4).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			'GixloTheWitchDoctor', 
			'IraTheSwampSiren',
			'FergusTheFungusKing',
		])
    });
};

// THE_UNDER_GROVE:
// ************************************************************************************************
DungeonGenerator.zoneGenerators.TheUnderGrove = function () {
	// LIBRARY:
	this.getLevelFeatures('TheUnderGrove', util.randInt(2, 4)).push({
		featureType: FEATURE_TYPE.CONTENT,
		contentType: VAULT_CONTENT.LIBRARY,
	});
	
	// MINOR_BOSS:
    if (util.frac() < 0.5) {
        this.getLevelFeatures('TheUnderGrove', util.randInt(1, 3)).push({
            featureType: FEATURE_TYPE.BOSS,
            bossName: util.randElem([
				'TheCatLord'
			])
        });
    }
	
	// MAJOR_BOSS:
	this.getLevelFeatures('TheUnderGrove', 4).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			'TheCorruptedEnt',
			'TheQueenSpider',
			'TheCentaurKing'
		])
    });
};

// THE_ORC_FORTRESS:
// ************************************************************************************************
DungeonGenerator.zoneGenerators.TheOrcFortress = function () {
	// MINOR_BOSS:
    this.getLevelFeatures('TheOrcFortress', util.randInt(2, 5)).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			'TheArcheryCaptain', 
			'TheCrystalCaptain'
		])
    });

	
	// MAJOR_BOSS:
	this.getLevelFeatures('TheOrcFortress', 6).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			'KingMonRacar',
			'ManfridTheMinotaurKing',
			'ThurgTheHighShaman', 
		])
    });
};

// THE_DARK_TEMPLE:
// ************************************************************************************************
DungeonGenerator.zoneGenerators.TheDarkTemple = function () {

	// MINOR_BOSS:
    this.getLevelFeatures('TheDarkTemple', util.randInt(2, 5)).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			'TheCrystalArcher',
			'MorrgueTheMindFlayer',
		])
    });
	
	// MAJOR_BOSS:
	this.getLevelFeatures('TheDarkTemple', 6).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			'DherossoTheDemonologist',
			'PorecsaTheHighPriestess',
			'TheDrachnidQueen',
		])
    });

};

// THE_SEWERS:
// The slime king causes TheSewers:3 to generate the special SlimePit level
// This requires the library and minor boss to never generate on TheSewer:3
// ************************************************************************************************
DungeonGenerator.zoneGenerators.TheSewers = function () {
	let bossName = util.randElem(['TheKraken', 'ExpanderisTheSlimeKing']);
	
	
	
	// SLIME_KING:
	if (bossName === 'ExpanderisTheSlimeKing') {
		// LIBRARY:
		this.getLevelFeatures('TheSewers', util.randInt(1, 3)).push({
			featureType: FEATURE_TYPE.CONTENT,
			contentType: VAULT_CONTENT.LIBRARY,
		});
		
		// MINOR_BOSS:
		if (util.frac() < 0.5) {
			this.getLevelFeatures('TheSewers', util.randInt(1, 3)).push({
				featureType: FEATURE_TYPE.BOSS,
				bossName: util.randElem(['ThePlagueDoctor', 'LockJaw'])
			});
		}
		
		// MAJOR_BOSS:
		this.getLevelFeatures('TheSewers', 5).push({
        	featureType: FEATURE_TYPE.BOSS,
        	bossName: 'ExpanderisTheSlimeKing'
   		 });
	}
	// KRAKEN:
	else {
		// LIBRARY:
		this.getLevelFeatures('TheSewers', util.randInt(1, 4)).push({
			featureType: FEATURE_TYPE.CONTENT,
			contentType: VAULT_CONTENT.LIBRARY,
		});
		
		// MINOR_BOSS:
		if (util.frac() < 0.5) {
			this.getLevelFeatures('TheSewers', util.randInt(2, 4)).push({
				featureType: FEATURE_TYPE.BOSS,
				bossName: util.randElem(['ThePlagueDoctor', 'LockJaw'])
			});
		}
		
		// MAJOR_BOSS:
		this.getLevelFeatures('TheSewers', 5).push({
        	featureType: FEATURE_TYPE.BOSS,
        	bossName: 'TheKraken'
   		 });	
	}
	
};

// THE_CORE:
// ************************************************************************************************
DungeonGenerator.zoneGenerators.TheCore = function () {
	// LIBRARY:
	this.getLevelFeatures('TheCore', util.randInt(1, 4)).push({
		featureType: FEATURE_TYPE.CONTENT,
		contentType: VAULT_CONTENT.LIBRARY,
	});
	
	// MINOR_BOSS:
	this.getLevelFeatures('TheCore', util.randInt(2, 4)).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			'AjaxTheFlameShaman',
			'TheFlameSpinnerQueen'
		])
    });
	
	// MAJOR_BOSS:
	this.getLevelFeatures('TheCore', 5).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			'TheEfreetiLord',
			'LavosaTheEelQueen',
		])
    });
};

// THE_ICE_CAVES:
// ************************************************************************************************
DungeonGenerator.zoneGenerators.TheIceCaves = function () {
	// LIBRARY:
	this.getLevelFeatures('TheIceCaves', util.randInt(1, 4)).push({
		featureType: FEATURE_TYPE.CONTENT,
		contentType: VAULT_CONTENT.LIBRARY,
	});
	
	// MINOR_BOSS:
	this.getLevelFeatures('TheIceCaves', util.randInt(2, 4)).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			'IceBerg', 
			'BeastMasterNyx'
		])
    });
	
	// MAJOR_BOSS:
	this.getLevelFeatures('TheIceCaves', 5).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			'TheFrostGiantKing',
			'GraxTheFrostShaman',
		])
    });
	
};

// THE_CRYPT:
// ************************************************************************************************
DungeonGenerator.zoneGenerators.TheCrypt = function () {
	// LIBRARY:
	this.getLevelFeatures('TheCrypt', util.randInt(1, 4)).push({
		featureType: FEATURE_TYPE.CONTENT,
		contentType: VAULT_CONTENT.LIBRARY,
	});
	
	// MINOR_BOSS:
	this.getLevelFeatures('TheCrypt', util.randInt(2, 4)).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			'TheSkeletalChampion',
			'TheTormentedMarksman',
		])
    });
	
	// MAJOR_BOSS:
	this.getLevelFeatures('TheCrypt', 5).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			'TheVampireLord',
			'TheLichKing',
		])
    });
	
	// ZONE_LOOT:
	let itemTypeNameList = ItemGenerator.getRandomItemSubset(util.randInt(0, 2), 'ShadowSilkArmor');
	itemTypeNameList.forEach(function (itemTypeName) {
		this.getLevelFeatures('TheCrypt', util.randInt(1, 4)).push({
        	featureType: FEATURE_TYPE.ITEM,
        	itemTypeName: itemTypeName
    	});
	}, this);
};

// THE_ARCANE_TOWER:
// ************************************************************************************************
DungeonGenerator.zoneGenerators.TheArcaneTower = function () {
	// LIBRARY:
	this.getLevelFeatures('TheArcaneTower', util.randInt(1, 4)).push({
		featureType: FEATURE_TYPE.CONTENT,
		contentType: VAULT_CONTENT.LIBRARY,
	});
	
	// MAJOR_BOSS:
	this.getLevelFeatures('TheArcaneTower', 5).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			'CazelTheConjuror',
			'DelasTheDjinniLord',
		])
    });
	
	// ZONE_LOOT:
	let itemTypeNameList = ItemGenerator.getRandomItemSubset(util.randInt(0, 2), 'WizardryArmor');
	itemTypeNameList.forEach(function (itemTypeName) {
		this.getLevelFeatures('TheArcaneTower', util.randInt(1, 4)).push({
        	featureType: FEATURE_TYPE.ITEM,
        	itemTypeName: itemTypeName
    	});
	}, this);
};

// THE_IRON_FORGE:
// ************************************************************************************************
DungeonGenerator.zoneGenerators.TheIronForge = function () {
	// LIBRARY:
	this.getLevelFeatures('TheIronForge', util.randInt(1, 4)).push({
		featureType: FEATURE_TYPE.CONTENT,
		contentType: VAULT_CONTENT.LIBRARY,
	});
	
	// MAJOR_BOSS:
	this.getLevelFeatures('TheIronForge', 5).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			'TheForgeMaster',
			'ControlModule',
		])
    });
	
	// ZONE_LOOT:
	let itemTypeNameList = ItemGenerator.getRandomItemSubset(util.randInt(0, 2), 'HeavyBrassArmor');
	itemTypeNameList.forEach(function (itemTypeName) {
		this.getLevelFeatures('TheIronForge', util.randInt(1, 4)).push({
        	featureType: FEATURE_TYPE.ITEM,
        	itemTypeName: itemTypeName
    	});
	}, this);
};


// THE_VAULT_OF_YENDOR:
// ************************************************************************************************
DungeonGenerator.zoneGenerators.TheVaultOfYendor = function () {
	if (gs.debugProperties.forceVaultType) {
		return;
	}
	
	let levelList = gs.vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.LEVEL && vaultType.contentType === VAULT_CONTENT.AESTHETIC && vaultType.vaultSet === 'TheVaultOfYendor');
	let finalList = util.randSubset(levelList, 4);
	
	let isValid = function (list) {
		let valid = true;
		let tagList = [];
		
		for (let i = 0; i < list.length; i += 1) {
			for (let j = 0; j < list[i].vaultTags.length; j += 1) {
				if (util.inArray(list[i].vaultTags[j], tagList)) {
					valid = false;
				}
				else {
					tagList.push(list[i].vaultTags[j]);
				}
			}
		}
		
		return valid;
	};
	
	while (!isValid(finalList)) {
		finalList = util.randSubset(levelList, 4);
	}
	
	this.getLevelFeatures('TheVaultOfYendor', 1).push({featureType: FEATURE_TYPE.VAULT_TYPE, vaultTypeName: finalList[0].id});
	this.getLevelFeatures('TheVaultOfYendor', 2).push({featureType: FEATURE_TYPE.VAULT_TYPE, vaultTypeName: finalList[1].id});
	this.getLevelFeatures('TheVaultOfYendor', 3).push({featureType: FEATURE_TYPE.VAULT_TYPE, vaultTypeName: finalList[2].id});
	this.getLevelFeatures('TheVaultOfYendor', 4).push({featureType: FEATURE_TYPE.VAULT_TYPE, vaultTypeName: finalList[3].id});
	
	// MAJOR_BOSS:
	/*
	this.getLevelFeatures('TheVaultOfYendor', 4).push({
        featureType: FEATURE_TYPE.BOSS,
        bossName: util.randElem([
			//'TheWizardYendorStorm',
			//'TheWizardYendorFire',
		])
    });
	*/
	
};

// LEVEL_FEATURES:
// Contains a list of features for the level that can be set during dungeon generation (start of game).
// ************************************************************************************************
function LevelFeatures (zoneName, zoneLevel) {
	this.zoneName = zoneName;
	this.zoneLevel = zoneLevel;
	this.dangerLevel = gs.dangerLevel(zoneName, zoneLevel);
	
	// List of features:
	this.features = [];
}

// TO_DATA:
// ************************************************************************************************
LevelFeatures.prototype.toData = function () {
	let data = {};
	
	data.zoneName = this.zoneName;
	data.zoneLevel = this.zoneLevel;
	data.features = this.features;
	
	return data;
};

// CREATE_FROM_DATA:
// ************************************************************************************************
LevelFeatures.createFromData = function (data) {
	let levelFeatures = new LevelFeatures(data.zoneName, data.zoneLevel);
	
	levelFeatures.features = data.features;
	
	return levelFeatures;
};

// HAS_FEATURE:
// ************************************************************************************************
LevelFeatures.prototype.hasFeature = function (feature) {
	for (let i = 0; i < this.features.length; i += 1) {
		let match = true;
		
		for (let key in feature) {
			if (feature.hasOwnProperty(key)) {
				if (feature[key] !== this.features[i].key) {
					match = false;
				}
			}
		}
		
		if (match) {
			return true;
		}
	}
	
	return false;
};