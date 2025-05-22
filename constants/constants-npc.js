/*global LOS_DISTANCE*/
/*jshint esversion: 6*/
'use strict';
// NPC BALANCE:
// ************************************************************************************************
var MAX_LEVEL = 16;


// NPC HIT POINTS:
// ************************************************************************************************
var NPC_INITIAL_HP = {
	LOW: 	8, 
	MLOW: 	12, 
	MEDIUM: 16,
	MHIGH: 	20,
	HIGH: 	24,
};
var NPC_MAX_HP = {};
var NPC_HP_PER_LEVEL = {};
for (let key in NPC_INITIAL_HP) {
	if (NPC_INITIAL_HP.hasOwnProperty(key)) {
		NPC_MAX_HP[key] = NPC_INITIAL_HP[key] * 3.5;
		NPC_HP_PER_LEVEL[key] = (NPC_MAX_HP[key] - NPC_INITIAL_HP[key]) / (MAX_LEVEL - 1);
	}
}

var YENDOR_MAX_HP = [200, 300, 400];

// NPC DAMAGE:
// ************************************************************************************************
var NPC_INITIAL_DAMAGE = {
	LOW: 2, 
	MLOW: 3, 
	MEDIUM: 4,
	MHIGH: 6,
	HIGH: 8, 
};
var NPC_MAX_DAMAGE = {};
var NPC_DAMAGE_PER_LEVEL = {};
for (let key in NPC_INITIAL_DAMAGE) {
	if (NPC_INITIAL_DAMAGE.hasOwnProperty(key)) {
		NPC_MAX_DAMAGE[key] = NPC_INITIAL_DAMAGE[key] * 3.5;
		NPC_DAMAGE_PER_LEVEL[key] = (NPC_MAX_DAMAGE[key] - NPC_INITIAL_DAMAGE[key]) / (MAX_LEVEL - 1);
	}
}

// SPAWNING:
// ************************************************************************************************
var NPC_COMMON_PERCENT = 70;
var NPC_UNCOMMON_PERCENT = 25;
var NPC_RARE_PERCENT  = 5;
var SPAWN_ENEMY_TURNS = 60; // How many turns between respawn
var SLEEPING_PERCENT = 0.1; // What is the chance for a mob to be spawned asleep
var MOB_WANDER_PERCENT = 0.40; // What is the chance for a mob to be spawned wandering

// AGRO:
// ************************************************************************************************
var MAX_SPOT_AGRO_RANGE = LOS_DISTANCE; // The maximum distance at which the npc can Spot agro the player
var MAX_SHOUT_AGRO_RANGE = LOS_DISTANCE * 1.5; // The maximum distance at which the npc will respond to a shout
var SHOUT_RANGE = 6; // The distance in which an enemy will respond to shouts
var NPC_UNAGRO_TIME = 20;
var NPC_SHOUT_TYPE = {
	STANDARD:	'STANDARD',
	AMBUSH:		'AMBUSH', // Will alert other hidden enemies
	STRONG:		'STRONG', // Will ignore maxDistance checks (used by distant, grouped, glyph doors)
};

// MOVEMENT:
// ************************************************************************************************
var RANDOM_MOVE_PERCENT = 0.1;

// FLEEING: 
// ************************************************************************************************
var NPC_FLEE_HP_PERCENT = 0.20; // The percent of maxHP at which NPC may start fleeing
var NPC_FLEE_CHANCE = 0.10;		// The percent chance per hit that NPC will start fleeing
var SAFE_TURNS_TO_STOP_FLEEING = 3;

// MISC:
// ************************************************************************************************
var CROSS_GLYPH_DURATION = 5;

// ENUMS:
// ************************************************************************************************
var FACTION = {
	NEUTRAL: 0,
	PLAYER: 1,
	HOSTILE: 2,
	DESTRUCTABLE: 3,
};