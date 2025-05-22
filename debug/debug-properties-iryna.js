/*global gs, util*/
'use strict';
let irynaDebug = {};

// SET_DEBUG_PROPERTIES:
// ************************************************************************************************
irynaDebug.setDebugProperties = function () {
	gs.debugProperties = {
		onNewGame: true,
		enableDebugKey: true,
		levelGenerator: null,
		testAreaGenerator: {isOn: false},
		
		// Force Zones:
		forceZones: {
			Wilderness: null,
			Tier3: null,
			Branch1: null,
			Branch2: null,
		},
		
		// Level Generation:
		mapExplored: false,
		spawnMobs: false,
		spawnStaticMobs: false,
		levelViewMode: false,
		
		// Character:
		startClass: 'Warrior',
		startRace: 'Human',
		
		// Start Position:
		startZoneName: 'TestZone',
		startZoneLevel: 2,
		//startTileIndex: {x: 11, y: 20},
		
		// Game Play:
		allowRespawn: true,
		disableMana: false,
		disableDamage: false,
		npcCanAgro: true,
	};
	
	// Uncomment this to disable debug mode:
	//gs.clearDebugProperties();
};


irynaDebug.onNewGame = function () {
	// STARTING ATTRIBUTES:
	//gs.pc.inventory.gold = 100;
	//debug.setPlayerLevel(12);
	//gs.pc.currentMp = 30;
	//gs.pc.currentHp = 10;

	// CREATE_NPCS::
	// ex. debug.createNPC('DervishArcher');
	
	// ADD_ITEMS::
	// ex. debug.addItem('PotionOfHealing');
	
	// EQUIPMENT:
	// ex. debug.addEquipment('PlateArmor');
	
	// LEARN_TALENTS:
	// ex. debug.learnTalent('Charge');
	
	// ANIMATION:
    /*
	// Poison
    gs.animEffectTypes.TestAnim = {
		tileset: 'EffectsTileset',
		startFrame: 736,
		numFrames: 12,
		speed: 20,
	};
    */
};

// P Key
irynaDebug.onDebugKey = function () {
	// Player Position:
	let pos = util.toPosition(gs.pc.tileIndex);
	
	// Animation:
	gs.createAnimEffect({x: pos.x, y: pos.y}, 'TestAnim');
	
	// Lighting: (position, color, radius, duration, startAlpha)
	// startAlpha ranges from 00 to FF (hex)
	gs.createLightCircle({x: pos.x, y: pos.y + 10}, '#66b266', 60, 90, '66');
	
	gs.playSound(gs.sounds.cure);	
};