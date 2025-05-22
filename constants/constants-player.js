'use strict';

var CLASS_LIST = [
	'Warrior',
	'Barbarian',
	'Rogue',
	'Ranger',
	'Duelist',
	'FireMage',
	'StormMage',
	'IceMage',
	'Necromancer',
	'Enchanter'
];


// CHARACTER_DEVELOPMENT:
var PC_MAX_LEVEL = 16;

// BASE_STATS:
var PC_BASE_MAX_HP = 24;
var PC_BASE_MAX_MP = 6;
var PC_BASE_MAX_SP = 0;
var PC_BASE_MAX_FOOD = 20;
var PC_BASE_MP_REGEN_TURNS = 4;
var PC_BASE_SP_REGEN_TURNS = 10;

// STATS_PER_LEVEL:
var PC_MAX_HP_PER_XL = 1;

// STATS_PER_ATTRIBUTE:
var PC_MAX_MP_PER_INT = 3; //2
var PC_MAX_MOVEMENT_POINTS_PER_DEX = 1;

var PC_HP_PER_STR = {
	Human: 		5,
	Ogre: 		8,
	Gnome: 		2,
	Fairy:		2,
	Elf: 		5,
	Troll:		5,
	Mummy:		5,
	Gargoyle:	5,
	Vampire:	5,
};

var PC_ABILITY_POWER_PER_INT = {
	Human: 		0.05,
	Ogre: 		0.05,
	Gnome: 		0.10,
	Fairy:		0.05,
	Elf: 		0.05,
	Troll:		0.05,
	Mummy:		0.05,
	Gargoyle:	0.05,
	Vampire:	0.05,
};

var PC_EVASION_PER_DEX = {
	Human: 		0.03,
	Ogre: 		0.03,
	Gnome: 		0.03,
	Fairy:		0.05,
	Elf: 		0.03,
	Troll:		0.03,
	Mummy:		0.03,
	Gargoyle:	0.03,
	Vampire:	0.03,
};

// Penalties:
var PC_ABILITY_POWER_PENALTY_PER_ENC = 0.10;

// ATTRIBUTE_LIST:
var ATTRIBUTE_LIST = [
	'strength',
	'dexterity',
	'intelligence',
];


var HIT_POINTS_DESC = 'Your hit points. If your current HP reaches 0 you will die and immediately lose the game.';
var MANA_POINTS_DESC = 'Your mana points used for spell casting.';
var SPEED_POINTS_DESC = 'Your speed points. Hold shift while moving to sprint without ending your turn.';
var FOOD_POINTS_DESC = 'Your food points. If your food points reaches 0 you will not regenerate health.';

// How much does the damage of item abilities (ex. wands) scale per level:
var ITEM_ABILITY_MULTIPLIER_PER_LEVEL = 0.05;

// How many turns must the player break LoS:
var STATUS_EFFECT_BREAK_LOS_TURNS = 3;

// Chance that the player will gain agro when visible to hostiles:
var PLAYER_AGRO_CHANCE = 0.40;

// What level of cold resistance does the player need to resist the ambient cold of The Ice Caves:
var AMBIENT_COLD_RESISTANCE = 0.20;

// Chance the player will proc a weapon effect:
var PC_PROC_CHANCE = 0.25;

// Time to eat a single piece of food
var FOOD_TIME = 80;

// REGEN_TIMERS:
var MAX_PC_HP_REGEN = {maxHp: 1000,	turns: 6,	hp: 2}; // 33HP/100T (CAP)
var PC_HP_REGEN = [
	{maxHp: 30,		turns: 10,	hp: 1}, // 10HP/100T
	{maxHp: 40, 	turns: 9,	hp: 1},
	{maxHp: 50, 	turns: 8,	hp: 1},
	{maxHp: 60, 	turns: 7,	hp: 1},
	{maxHp: 70, 	turns: 6,	hp: 1},
	{maxHp: 80, 	turns: 10,	hp: 2},	// 20HP/100T
	{maxHp: 90, 	turns: 9,	hp: 2},
	{maxHp: 100, 	turns: 8,	hp: 2},
	{maxHp: 110, 	turns: 7,	hp: 2},
	{maxHp: 120, 	turns: 6,	hp: 2}, // 33HP/100T
	MAX_PC_HP_REGEN, 					// 33HP/100T (CAP)
];