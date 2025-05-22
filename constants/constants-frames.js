'use strict';

var SMALL_BAR_FRAME = {
	GREEN: 1190,
	PURPLE: 1191,
	RED: 1192,
};

var RING_FRAME = {
	YELLOW: 16,
	BLUE: 17,
	GREEN: 18,
	RED: 19,
	PURPLE: 20
};

// FRAMES:
// ************************************************************************************************
var EQUIPMENT_SLOT_FRAMES = {
	BODY: 1280,
	HANDS: 1282,
	FEET: 1283,
	HEAD: 1284,
	RING: 1285,
	SECONDARY: 1286,
	CHARM: 1287,
	
};

// Targeting:
var GREEN_TARGET_BOX_FRAME = 1152;
var RED_TARGET_BOX_FRAME = 1153; // For targeting standard attacks
var PURPLE_TARGET_BOX_FRAME = 1154;
	
var GREEN_SELECT_BOX_FRAME = 1157;
var RED_SELECT_BOX_FRAME = 1158;
var PURPLE_SELECT_BOX_FRAME = 1159;

var GREEN_BOX_FRAME = 1162;
var RED_BOX_FRAME = 1163;
var PURPLE_BOX_FRAME = 1164;

var X_FRAME = 1167;

// Bars:
var HEALTH_BAR_FRAME = 1184;
var MANA_BAR_FRAME = 1185;
var FOOD_BAR_FRAME = 1186;
var EXP_BAR_FRAME = 1187;
var COLD_BAR_FRAME = 1188;
var POISON_BAR_FRAME = 1189;



// Slots:
var ITEM_SLOT_FRAME = 0;
var ABILITY_SLOT_FRAME = 2;
var ABILITY_SLOT_RED_FRAME = 4;
var ABILITY_SLOT_GREEN_FRAME = 6;
var SLOT_SELECT_BOX_FRAME = 10;
var RIGHT_RING_SELECT_BOX_FRAME = 1233;
var LEFT_RING_SELECT_BOX_FRAME = 1234;

// UI_BUTTONS:
var CHARACTER_BUTTON_FRAME = 1273;
var CHARACTER_BUTTON_GREEN_FRAME = 1275;
var CLOSE_BUTTON_FRAME = 1250;
var OPTIONS_BUTTON_FRAME = 1252;
var SOUND_ON_BUTTON_FRAME = 1254;
var MUSIC_ON_BUTTON_FRAME = 1256;
var QUIT_BUTTON_FRAME = 1258;
var EXPLORE_BUTTON_FRAME = 1260;
var SOUND_OFF_BUTTON_FRAME = 1262;
var MUSIC_OFF_BUTTON_FRAME = 1264;



var PARTICLE_FRAMES = {
	RED:	1666,
	BLUE:	1667,
	GREEN:	1668,
	PURPLE:	1669,
	WHITE:	1670,
	YELLOW:	1671,
	SMOKE:	1672,
	MEZ:	1673,
};

var PLAYER_FRAMES = {
	Warrior:		1952,
	Barbarian:		1953,
	Ranger:			1954,
	Rogue:			1955,
	Duelist:		1956,
	FireMage:		1957,
	StormMage:		1958,
	IceMage:		1959,
	Enchanter:		1960,
	Necromancer:	1961,	
};

var PLAYER_RACE_FRAMES = {
	Human: {
		Warrior:		1952,
		Barbarian:		1953,
		Ranger:			1954,
		Rogue:			1955,
		Duelist:		1956,
		FireMage:		1957,
		StormMage:		1958,
		IceMage:		1959,
		Enchanter:		1960,
		Necromancer:	1961,	
	},
	
	Ogre: {
		Warrior:		1984,
		Barbarian:		1985,
		Ranger:			1986,
		Rogue:			1987,
		Duelist:		1988,
		FireMage:		1989,
		StormMage:		1990,
		IceMage:		1991,
		Enchanter:		1992,
		Necromancer:	1993,
	},
	
	Gnome: {
		Warrior:		2016,
		Barbarian:		2017,
		Ranger:			2018,
		Rogue:			2019,
		Duelist:		2020,
		FireMage:		2021,
		StormMage:		2022,
		IceMage:		2023,
		Enchanter:		2024,
		Necromancer:	2025,
	},
	
	Troll: {
		Warrior:		2048,
		Barbarian:		2049,
		Ranger:			2050,
		Rogue:			2051,
		Duelist:		2052,
		FireMage:		2053,
		StormMage:		2054,
		IceMage:		2055,
		Enchanter:		2056,
		Necromancer:	2057,
	},
	
	Mummy: {
		Warrior:		2080,
		Barbarian:		2081,
		Ranger:			2082,
		Rogue:			2083,
		Duelist:		2084,
		FireMage:		2085,
		StormMage:		2086,
		IceMage:		2087,
		Enchanter:		2088,
		Necromancer:	2089,
	},
	
	Gargoyle: {
		Warrior:		2112,
		Barbarian:		2113,
		Ranger:			2114,
		Rogue:			2115,
		Duelist:		2116,
		FireMage:		2117,
		StormMage:		2118,
		IceMage:		2119,
		Enchanter:		2120,
		Necromancer:	2121,
	},
	
	Fairy: {
		Warrior:		2144,
		Barbarian:		2145,
		Ranger:			2146,
		Rogue:			2147,
		Duelist:		2148,
		FireMage:		2149,
		StormMage:		2150,
		IceMage:		2151,
		Enchanter:		2152,
		Necromancer:	2153,
	},
	
	Vampire: {
		Warrior:		2176,
		Barbarian:		2177,
		Ranger:			2178,
		Rogue:			2179,
		Duelist:		2180,
		FireMage:		2181,
		StormMage:		2182,
		IceMage:		2183,
		Enchanter:		2184,
		Necromancer:	2185,
	},
};