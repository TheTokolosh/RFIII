/*jshint esversion: 6*/
'use strict';

var SHADOW_COLOR = '#03000f';
var SCALE_FACTOR = 2;
var TILE_SIZE = 40;

var NUM_TILES_X = 40;
var NUM_TILES_Y = 40;

var SCREEN_WIDTH = 1280;
var SCREEN_HEIGHT = 720; // 720
var NUM_SCREEN_TILES_X = 25; //25
var NUM_SCREEN_TILES_Y = 20;

var HUD_WIDTH = 178 * SCALE_FACTOR;
var HUD_START_X = SCREEN_WIDTH - HUD_WIDTH;
var HUD_START_Y = 2;

var LOS_DISTANCE = 7;
var ABILITY_RANGE = 7;


// WORLD:
// ************************************************************************************************
var ZONE_TIER = {
	// THE_UPPER_DUNGEON:
	TheUpperDungeon: {
		dangerLevel: 		[null, 1, 2, 2, 3],
		numNPCs: 			[null, 10, 12, 12, 14],
		numItems: 			[null, 3, 3, 3, 3],
		
		safeStairRadius: 6,
		numGold: 4,
		lootTier: 1,
		
		zoneList: [
			'TheUpperDungeon'
		],
	},
	
	// WILDERNESS:
	Wilderness: {
		dangerLevel: 		[null, 4, 5, 5, 6],
		numNPCs: 			[null, 10, 12, 12, 14],
		numItems:			[null, 2, 2, 2, 2],
		
		safeStairRadius: 4,
		numGold: 4,
		lootTier: 2,
		
		zoneList: [
			'TheSwamp',
			'TheUnderGrove',
			'TheSunlessDesert'
		],	
	},
	
	// TIER_3:
	Tier3: {
		dangerLevel: 		[null, 7, 	8, 	9, 	11, 12, 13],
		numNPCs: 			[null, 12, 	14, 16, 16, 18, 20],
		numItems: 			[null, 2, 2, 2, 2, 2, 2],
		
		safeStairRadius: 6,
		numGold: 4,
		lootTier: 3,
		
		zoneList: [
			'TheOrcFortress',
			'TheDarkTemple',
		],
	},
	
	// BRANCH_1:
	Branch1: {
		dangerLevel: 		[null, 9, 	10, 	12, 13, 14],
		numNPCs: 			[null, 12, 	14, 16, 18, 20],
		numItems:			[null, 2, 2, 2, 2],
		safeStairRadius: 3,
		numGold: 4,
		lootTier: 3,
		
		zoneList: [
			'TheIceCaves',
			'TheCore',
			'TheSewers',
		],
	},
	
	// BRANCH_2:
	Branch2: {
		dangerLevel: 		[null, 12, 13, 15, 16, 16],
		numNPCs: 			[null, 16, 18, 18, 20, 22],
		numItems:			[null, 2, 2, 2, 2],
		safeStairRadius: 3,
		numGold: 4,
		lootTier: 3,
		zoneList: [
			'TheArcaneTower',
			'TheIronForge',
			'TheCrypt',
		],
	},
	
	// THE_VAULT_OF_YENDOR:
	TheVaultOfYendor: {
		dangerLevel: 		[null, 16, 16, 16, 16, 16],
		numNPCs: 			[null, 16, 18, 20, 22, 24],
		numItems:			[null, 2, 2, 2, 2, 2],
		
		safeStairRadius: 2,
		numGold: 2,
		lootTier: 3,
		
		zoneList: [
			'TheVaultOfYendor',	
		],
	}
};

var BOSS_LEVEL_NAMES = {
	// The Sewers:
	ExpanderisTheSlimeKing: 'The Slime Pit',
	TheKraken: 'The Krakens Lair',
	
	// The Ice Caves:
	GraxTheFrostShaman: 'The Spirit Cave',
	TheFrostGiantKing: 'Hall of The Frost Giant King',
	
	// The Core:
	TheEfreetiLord: 'The Palace of Flames',
	LavosaTheEelQueen: 'The Cauldron of Fire',
	
	// The Iron Forge:
	TheForgeMaster: 'The Control Center',
	ControlModule:	'The War Train',
	
	// The Crypt:
	TheLichKing: 'The Tomb of the Lich King',
	TheVampireLord: 'The Hall of Blood',
	
	// The Arcane Tower:
	CazelTheConjuror: 'The Nexus of Conjuration',
	DelasTheDjinniLord: 'The Spire of Storms'
};

// TEXT:
// ************************************************************************************************
var DANGEROUS_TERRAIN_HELP = 'Hold [Z] key to move onto dangerous terrain.';
var CHARM_TEXT = 'Can be placed in the Melee, Range, or Shield slot.';

// TIMING:
// ************************************************************************************************
var FPS = 50;
var TIME_SCALAR = 60 / FPS;
var PROJECTILE_SPEED = 20 * TIME_SCALAR;
var MOVE_ANIM_SPEED = 8 * TIME_SCALAR;
var FAST_MOVEMENT_SPEED = 16 * TIME_SCALAR;
var KEYBOARD_MOVEMENT_SPEED = 20 * TIME_SCALAR;
var KNOCK_BACK_SPEED = 14 * TIME_SCALAR;



// PLAYER_BALANCE:
// ************************************************************************************************
var MAX_ABILITIES = 8;

// INVENTORY:
var INVENTORY_WIDTH = 5;
var INVENTORY_HEIGHT = 5;
var WEAPON_HOT_BAR_WIDTH = 3;
var WEAPON_HOT_BAR_HEIGHT = 2;
var CONSUMABLE_HOT_BAR_WIDTH = 7;
var CONSUMABLE_HOT_BAR_HEIGHT = 2;
var MERCHANT_INVENTORY_WIDTH = 6;
var MERCHANT_INVENTORY_HEIGHT = 9;

var LIBRARY_SIZE = 10;
var LIBRARY_TALENT_COST = 75;
var SKILL_TRAINER_COST = 25;
var TALENT_TRAINER_COST = 75;
var ENCHANTER_COST = 75;
var PRIEST_COST = 10;
var ATTRIBUTE_SHRINE_COST = 75;

var FRIENDLY_NPC_LIST = ['Merchant', 'TalentTrainer', 'Enchanter', 'Priest', 'TheLibrarian'];

// MECHANICS:
var MAX_REFLECTION = 0.75;
var MAX_RESISTANCE = 0.75;
var MAX_EVASION = 0.75;
var MAX_COOL_DOWN_MODIFIER = 0.75;

var ACTION_TIME = 100;
var MOVEMENT_SPEED = {
	SLOW: 	0,
	NORMAL:	1,
	FAST:	2,
};
var MOVE_TIME = [
	100, 	// SLOW
	100, 	// NORMAL
	50, 	// FAST
];


// ITEMS_AND_EQUIPMENT:
// ************************************************************************************************
var COMMON_ITEM_PERCENT = 70;
var UNCOMMON_ITEM_PERCENT = 25;
var RARE_ITEM_PERCENT = 5;
var NUM_EQUIPMENT_SLOTS = 14;
var SELL_ITEM_PERCENT = 0.30; // The percentage at which items are sold to merchants

var STAT_MODIFIERS = [
	null,					// Base Stat = 0
	[2,  3,  4],			// Base Stat = 1
	[3,  4,  5],			// Base Stat = 2
	[4,  5,  6],			// Base Stat = 3
	[6,  7,  8],			// Base Stat = 4
	[8,  9,  10],			// Base Stat = 5
	[8,  10, 12],			// Base Stat = 6
	[9,  12, 14],			// Base Stat = 7
	[12, 14, 16],			// Base Stat = 8
	[12, 16, 18],			// Base Stat = 9
	[14, 18, 20],			// Base Stat = 10
	[15, 20, 22],			// Base Stat = 11
	[16, 20, 24],			// Base Stat = 12
];


/*
var STAT_MODIFIERS = [
	null,					// Base Stat = 0
	[2,  3,  4],			// Base Stat = 1
	[3,  4,  5],			// Base Stat = 2
	[4,  5,  6],			// Base Stat = 3
	[6,  7,  8],			// Base Stat = 4
	[8,  12, 15],			// Base Stat = 5
	[10, 14, 18],			// Base Stat = 6
	[11, 15, 21],			// Base Stat = 7
	[14, 20, 24],			// Base Stat = 8
	[15, 21, 27],			// Base Stat = 9
	[17, 24, 30],			// Base Stat = 10
	[19, 26, 33],			// Base Stat = 11
	[20, 28, 36],			// Base Stat = 12
];
*/


for (let i = 13; i < 50; i += 1) {
	STAT_MODIFIERS[i] = [
		Math.ceil(i * 1.50),
		Math.ceil(i * 1.75),
		Math.ceil(i * 2.00)
	];
}

var PERCENT_MODIFIER = [
	{base: 0.10, mod: [0.10, 0.15, 0.20, 0.25]},
	{base: 0.15, mod: [0.15, 0.20, 0.25, 0.30]},
	{base: 0.20, mod: [0.20, 0.30, 0.35, 0.40]},
	{base: 0.30, mod: [0.30, 0.40, 0.50, 0.60]},
	{base: 0.40, mod: [0.40, 0.60, 0.70, 0.80]},
];


var LINEAR_MODDED_STATS = [
	'strength',
	'dexterity',
	'intelligence',
	'damage', 
	'stealth', 
	'protection', 
	'maxCharges', 
	'mpRegenTime',
	'lifeTap',
	'manaTap',
	'maxMp',
	'bonusRangeDamage',
	'bonusMeleeDamage',
	'bonusStaffDamage',
];

var STAT_AS_PERCENT = {
	meleeDamageMultiplier: true,
	rangeDamageMultiplier: true,
	lungeDamageMultiplier: true,
	critMultiplier: true,
	
	bonusExpMod: true,
	maxHpModifier: true,
	blockChance: true,
	parryChance: true,
	evasion: true,
	coolDownModifier: true,
	hpPercent: true,
	mpPercent: true,
	
	abilityPower: true,
	magicPower: true,
	reflection: true,
	damageMultiplier: true,
	healPercent: true,
	
	// Resistance:
	fireResistance: true,
	shockResistance: true,
	toxicResistance: true,
	coldResistance: true,
};

var STAT_AS_NUMERAL = {};

var STAT_AS_FLAG = {
	movementSpeed: true,
	isFlying: true,
	isTelepathic: true,
	hasLifeSaving: true,
};



var ITEM_SLOT = {
	PRIMARY: 	'PRIMARY',
	SECONDARY: 	'SECONDARY',
	RANGE:		'RANGE',
	BODY:		'BODY',
	HEAD:		'HEAD',
	HANDS:		'HANDS',
	FEET:		'FEET',
	CHARM:		'CHARM',
	RING:		'RING',
	CONSUMABLE: 'CONSUMABLE',
	TOME:		'TOME',
	NONE:		'NONE'
};

var EQUIPMENT_SLOTS = [
	ITEM_SLOT.SECONDARY,
	ITEM_SLOT.BODY,
	ITEM_SLOT.HEAD,
	ITEM_SLOT.HANDS,
	ITEM_SLOT.FEET,
	ITEM_SLOT.RING,
	ITEM_SLOT.RING,
];


// UI:
// ************************************************************************************************

var MINI_MAP_TILE_SIZE = 6;
var MINI_MAP_SIZE_X = NUM_TILES_X;
var MINI_MAP_SIZE_Y = NUM_TILES_Y;
var MAX_STATUS_EFFECTS = 10;

// FONTS:
// ************************************************************************************************
var FONT_NAME = 'silkscreennormal'; // Inconsolata, Monospace

var SMALL_WHITE_FONT = 		{font: '14px ' + FONT_NAME, fill: '#ffffff'};
var LARGE_WHITE_FONT = 		{font: '16px ' + FONT_NAME, fill: '#ffffff'};
var LARGE_YELLOW_FONT = 	{font: '16px ' + FONT_NAME, fill: '#ffff00'};
var LARGE_BOLD_WHITE_FONT = {font: '16px ' + FONT_NAME, fill: '#ffffff', stroke: '#000000', strokeThickness: 4};
var HUGE_WHITE_FONT = 		{font: '24px ' + FONT_NAME, fill: '#ffffff', stroke: '#000000', strokeThickness: 4};
var SMALL_GREEN_FONT = 		{font: '14px ' + FONT_NAME, fill: '#00ff00'};
var LARGE_GREEN_FONT = 		{font: '16px ' + FONT_NAME, fill: '#00ff00'};
var LARGE_RED_FONT = 		{font: '16px ' + FONT_NAME, fill: '#ff0000'}; //{font: '16px ' + FONT_NAME, fill: '#ff0000', stroke: '#000000', strokeThickness: 4};
var CHARACTER_HEALTH_FONT = {font: '14px ' + FONT_NAME, fill: '#00ff00', stroke: '#111111', strokeThickness: 3};
var CHARACTER_STATUS_FONT = {font: '14px ' + FONT_NAME, fill: '#ffffff', stroke: '#111111', strokeThickness: 3};

// GENERATION:
// ************************************************************************************************
let CONNECTION_MAP_LIST_4x4 = [
	{x: 0, y: 0},
	{x: 5, y: 0},
	{x: 10, y: 0},
	{x: 15, y: 0},
	{x: 20, y: 0},
	{x: 25, y: 0},
	{x: 30, y: 0},
	{x: 35, y: 0},
	{x: 45, y: 0},
	{x: 50, y: 0},
	{x: 55, y: 0},
];

let CONNECTION_MAP_LIST_3x3 = [
	{x: 0, y: 23},
	{x: 4, y: 23},
	{x: 8, y: 23},
	{x: 12, y: 23},
	{x: 16, y: 23},
	{x: 20, y: 23},
	{x: 24, y: 23},
	{x: 28, y: 23},
	{x: 32, y: 23},
];

var DOUBLE_GOLD_CHANCE = 0.10; // chance to spawn double max gold on a level


// Good Stuff (stuff that helps the player):
var NUM_FOUNTAINS_PER_LEVEL = 2;
var DROP_GOLD_PERCENT = 0.75; // What is the chance to drop gold, otherwise drop an item

// Fire Mushrooms:
var MAX_FIRE_MUSHROOMS = 8;

// Vines:
var SPAWN_VINE_PERCENT = 0.50;
var MAX_VINES = 8;
var SUPER_VINE_PERCENT = 0.05;

// Ice:
var MAX_ICE = 4;
var SUPER_ICE_PERCENT = 0.05;

// Water:
var SPAWN_WATER_PERCENT = 0.50;
var MAX_WATER = 4;
var SUPER_WATER_PERCENT = 0.05;

// Lava:
var MAX_LAVA = 6;
var SUPER_LAVA_PERCENT = 0.05;

// Teleport Trap:
var TELEPORT_TRAP_MIN_LEVEL = 2;
var SPAWN_TELEPORT_TRAP_PERCENT = 0.30;

// Pit Traps:
var PIT_TRAP_MIN_LEVEL = 3;
var SPAWN_PIT_TRAP_PERCENT = 0.15;

// Bear Traps:
var SPAWN_BEAR_TRAPS_PERCENT = 0.25;
var MAX_BEAR_TRAPS = 10;

// Fire Traps:
var SPAWN_FIRE_VENTS_PERCENT = 0.25;
var MAX_FIRE_VENTS = 10;

// Spike Traps:
var SPAWN_SPIKE_TRAPS_PERCENT = 0.25;
var MAX_SPIKE_TRAPS = 10;

// Fire Pots:
var SPAWN_FIRE_POTS_PERCENT = 0.25;
var MAX_FIRE_POTS = 10;

// Gas Barrels:
var SPAWN_GAS_POTS_PERCENT = 0.25;
var MAX_GAS_POTS = 10;

// Gas Vents:
var SPAWN_GAS_VENTS_PERCENT = 0.5;
var MAX_GAS_VENTS = 5;

// Camp fires:
var NUM_CAMP_FIRES = 2;

// Shock Reeds:
var SPAWN_SHOCK_REEDS_PERCENT = 0.5;

// Elites:
var MIN_ELITE_LEVEL = 4;
var NPC_ELITE_CHANCE = 0.05;

// MECHANICS:
// ************************************************************************************************
var CHARACTER_SIZE = {
	SMALL: 0,
	MEDIUM: 1,
	LARGE: 2
};

var MOVEMENT_TYPE = {
	NORMAL: 0,
	FAST: 1,
	SNAP: 2,
};

var DAMAGE_TYPES = [
	'Fire',
	'Cold',
	'Shock',
	'Toxic',
	'Physical'
];

var DAMAGE_TYPE = {
	FIRE: 		'Fire',
	COLD: 		'Cold',
	SHOCK:		'Shock',
	TOXIC:		'Toxic',
	PHYSICAL:	'Physical',
	NONE:		'None', // Unmitigatable
};

var SPOTTED_OBJECT_LIST = [
	'GlyphDoor', 'KeyGate', 'TimedGate', 'SwitchGate',
	'UpStairs',  'DownStairs', 
	'HealthFountain', 'EnergyFountain', 'ExperienceFountain', 'WellOfWishing', 'FountainOfKnowledge', 'FountainOfGainAttribute',
	'EnchantmentTable', 'TransferanceTable', 'TomeOfKnowledge',
	'Switch',
	'CrystalChest',
	'AltarOfTrog', 'AltarOfWealth', 'AltarOfTheArcher', 'AltarOfTheWizard', 'AltarOfHealth', 'AltarOfExploration',
	'ShrineOfStrength', 'ShrineOfIntelligence', 'ShrineOfDexterity',
];

var OCCLUDING_OBJECT_LIST = [
	'Pillar', 'Tusk', 'ArcanePillar', 'Flag', 'Totem', 'Tent', 'WizardStatue',
	'FireObelisk', 'ToxicObelisk', 'StormObelisk', 'IceObelisk', 'YellowObelisk', 'ArcaneObelisk',
	'WoodenPost', 'StonePost', 'WoodenCrossBeam', 'StoneCrossBeam', 'StoneArch',
	'WoodenBars', 'MetalBars', 
];

var ZONE_FEATURE_OBJECT_LIST = [
	'WellOfWishing', 'FountainOfKnowledge', 'FountainOfGainAttribute', 'EnchantmentTable', 'TransferanceTable', 'TomeOfKnowledge',
	'ShrineOfStrength', 'ShrineOfIntelligence', 'ShrineOfDexterity',
];
					
var MAX_PLAYER_SLEEP_TIME = 10;
var MP_REGEN_TIME = 100; // How many turns to regenerate 0->max hp or ep?
var HP_REGEN_TIME = 200;
var MIN_HP_REGEN_TIME = 5;
var CRIT_MULTIPLIER = 1.5; // How much are critical hits multiplied by
var INVENTORY_SIZE = 15; // Number of slots in character inventories
var SPREAD_DAMAGE_MOD = 0.75;
var TIMED_GATE_TIME = 100; 
var CORRODE_PERCENT = 0.5;
var EXTENDED_WAIT_TURNS = 200;
var TELEPORT_PER_TURN_PERCENT = 0.3;
var SKELETON_REVIVE_TIME = 60;
var COLD_TIME = 15;
var MAX_COLD_LEVEL = 10; // 0=NORMAL, 1=COLD, 2=FREEZING
var FREEZING_DAMAGE = 5;
var SPIDER_EGG_HATCH_TURNS = 5;
var HELL_PORTAL_HATCH_TURNS = 5;
var INFERNO_RING_DAMAGE = 3;

var SHROOM_HP = 10;
var SHROOM_EP = 4;
var ZONE_FADE_TIME = 250; // 250
var CONFUSION_RANDOM_MOVE_PERCENT = 0.25;
var MIN_TELEPORT_DISTANCE = 5;

// TRAPS:
// ************************************************************************************************
var LAVA_DAMAGE = 4;

var FIRE_SHROOM_MIN_DAMAGE = 12;
var FIRE_SHROOM_MAX_DAMAGE = 24;

// (will be x1.5 due to immobile crit)
var BEAR_TRAP_MIN_DAMAGE = 9; 
var BEAR_TRAP_MAX_DAMAGE = 18;

var FIRE_GLYPH_MIN_DAMAGE = 15;
var FIRE_GLYPH_MAX_DAMAGE = 30;

var SPIKE_TRAP_MIN_DAMAGE = 15;
var SPIKE_TRAP_MAX_DAMAGE = 30;

var FIRE_VENT_MIN_DAMAGE = 12;
var FIRE_VENT_MAX_DAMAGE = 24;

var FIRE_POT_MIN_DAMAGE = 24;
var FIRE_POT_MAX_DAMAGE = 48;

var GAS_VENT_MIN_DAMAGE = 6;
var GAS_VENT_MAX_DAMAGE = 12;

var GAS_POT_MIN_DAMAGE = 9;
var GAS_POT_MAX_DAMAGE = 18;


// DESIGN_FLAGS:
// ************************************************************************************************
var NICE_STAT_NAMES = {
	// Attributes:
	strength: 				'Strength',
	dexterity: 				'Dexterity',
	intelligence: 			'Intelligence',
	
	// Damage Bonus
	bonusMeleeDamage:		'Melee Damage',
	bonusRangeDamage:		'Range Damage',
	bonusStaffDamage:		'Staff Damage',
	
	// Damage Multiplier:
	meleeDamageMultiplier: 	'Melee DMG',
	rangeDamageMultiplier:	'Range DMG',
	
	// Power:
	abilityPower: 			'Ability Power',
	magicPower:				'Magic Power',
	
	// Stats:
	maxHp: 					'Hit Points',
	maxMp: 					'Mana Points',
	maxSp: 					'Speed Points',
	maxHpModifier: 			'Hit Points',
	mpRegenTime: 			'MP Regen Turns',
	spRegenTime:			'SP Regen Turns',
	
	// Resistance and Defense:
	fireResistance: 		'Fire Resistance',
	coldResistance: 		'Cold Resistance',
	toxicResistance: 		'Toxic Resistance',
	shockResistance: 		'Shock Resistance',
	
	// Damage Shield:
	physicalDamageShield: 	'Physical Damage Shield',
	fireDamageShield: 		'Fire Damage Shield',
	coldDamageShield: 		'Cold Damage Shield',
	toxicDamageShield: 		'Toxic Damage Shield',
	shockDamageShield: 		'Shock Damage Shield',
	
	// Defense:
	protection: 			'Protection',
	reflection: 			'Reflection',
	blockChance: 			'Block Chance',
	parryChance: 			'Parry Melee',
	evasion:				'Evasion',
	
	// Misc:
	manaConservation:		'Mana Conservation',
	critMultiplier:			'Critical Damage Multiplier',
	movementSpeed:			'Haste',
	bonusExpMod: 			'Bonus EXP',
	stealth: 				'Stealth',
	lifeTap: 				'Life Tap',
	manaTap:				'Mana Tap',
	damageShield: 			'Damage Shield',
	bonusProjectileRange:	'Range Bonus',
	coolDownModifier: 		'Cool Down Reduction',
	maxAttackers: 			'Max Attackers',
	hpPercent:				'HP Percent',
	maxRage:				'Max Rage',
	encumberance: 			'Encumberance',
	lungeDamageMultiplier:	'Melee DMG',
	protectHp:				'Protect HP',
	
	// Flags:
	isTelepathic: 			'Telepathy',
	isFlying: 				'Levitation',
	hasSustenance: 			'Sustenance',
};

var ROMAN_NUMERAL = ['', 'I', 'II', 'III', 'IV', 'V'];

var EXCEPTION_TYPE = {
	LEVEL_GENERATION: 0,
	AREA_GENERATION: 1,
};
