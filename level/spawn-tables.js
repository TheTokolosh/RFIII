/*global gs, game, util, console*/
/*global NPC_COMMON_PERCENT, NPC_UNCOMMON_PERCENT, NPC_RARE_PERCENT*/
/*global NPC_ELITE_CHANCE, MIN_ELITE_LEVEL, SLEEPING_PERCENT, MOB_WANDER_PERCENT*/
/*global FACTION, SPAWN_TYPE*/
/*jshint esversion: 6*/
'use strict';

let createSpawnTables = {};

// THE_UPPER_DUNGEON:
// ************************************************************************************************
createSpawnTables.TheUpperDungeon = function () {
	gs.spawnTables.TheUpperDungeon = [];
	
	// Zone-Level-1:
	gs.spawnTables.TheUpperDungeon[1] = [
		// Swarm:
        {percent: 30, name: [
            {percent: 60, name: {npcType: 'Rat', min: 1, max: 2}},
            {percent: 40, name: {npcType: 'Bat', min: 1, max: 2}},
        ]},
		
		// Spawner:
		{percent: 10, name: [
			{percent: 100, name: {npcType: 'RatNest', min: 1, max: 1}},
		]},
		
        // Melee:
        {percent: 30, name: [
            {percent: 100, name: {npcType: 'GoblinWarrior', min: 1, max: 1}},
        ]},

        // Range: 
        {percent: 30, name: [
            {percent: 100, name: {npcType: 'GoblinArcher', min: 1, max: 1}},
        ]}
	];
    
    // Zone-Level-2:
	gs.spawnTables.TheUpperDungeon[2] = [
		// Swarm:
        {percent: 20, name: [
            {percent: 60, name: {npcType: 'Rat', min: 2, max: 3}},
            {percent: 40, name: {npcType: 'Bat', min: 2, max: 3}},
        ]},
		
		// Spawner:
		{percent: 10, name: [
			{percent: 100, name: {npcType: 'RatNest', min: 1, max: 1}},
		]},
		
        // Melee:
        {percent: 20, name: [
            {percent: 100, name: {npcType: 'GoblinWarrior', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'GoblinSlaver', min: 1, max: 1}} // NEW
        ]},
		
		// Hard Melee:
		{percent: 10, name: [
            {percent: 100, name: {npcType: 'GoblinBrute', min: 1, max: 1}}, // NEW
        ]},

        // Range: 
        {percent: 30, name: [
            {percent: 100, name: {npcType: 'GoblinArcher', min: 1, max: 1}},
        ]},
		
		// Caster:
		{percent: 10, name: [
			{percent: 50, name: {npcType: 'GoblinFireMage', min: 1, max: 1}}, // NEW
			{percent: 50, name: {npcType: 'GoblinStormMage', min: 1, max: 1}}, // NEW
		]},
	];
    
	// Zone-Level-3:
	gs.spawnTables.TheUpperDungeon[3] = gs.spawnTables.TheUpperDungeon[4] = [
		// Swarm:
        {percent: 20, name: [
            {percent: 60, name: {npcType: 'Rat', min: 2, max: 3}},
            {percent: 40, name: {npcType: 'Bat', min: 2, max: 3}},
        ]},
		
		// Spawner:
		{percent: 10, name: [
			{percent: 100, name: {npcType: 'RatNest', min: 1, max: 1}},
		]},
		
        // Melee:
        {percent: 20, name: [
            {percent: 100, name: {npcType: 'GoblinWarrior', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'GoblinSlaver', min: 1, max: 1}}
        ]},
		
		// Hard Melee:
		{percent: 10, name: [
            {percent: 60, name: {npcType: 'GoblinBrute', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'CaveBear', min: 1, max: 1}}, // NEW
			{percent: 20, name: {npcType: 'Centipede', min: 1, max: 1}}, // NEW
        ]},

        // Range: 
        {percent: 30, name: [
            {percent: 100, name: {npcType: 'GoblinArcher', min: 1, max: 1}},
        ]},
		
		// Caster:
		{percent: 10, name: [
			{percent: 40, name: {npcType: 'GoblinFireMage', min: 1, max: 1}},
			{percent: 40, name: {npcType: 'GoblinStormMage', min: 1, max: 1}},
			{percent: 20, name: {groupType: 'GoblinShamanGroup'}}, // NEW
		]},
	];
		
	gs.dropWallSpawnTables.TheUpperDungeon = [
		{name: 'Rat'},
		{name: 'Bat'},
		{name: 'GoblinWarrior', max: 4},
		{name: 'GoblinArcher', max: 4},
		{name: 'GoblinBrute', max: 2},
		{name: 'GoblinSlaver', max: 3},
		{name: 'GoblinFireMage', max: 2},
		{name: 'GoblinStormMage', max: 2},
		{name: 'Centipede', max: 2},
		{name: 'CaveBear', max: 2},
	];
	gs.dropWallSpawnTables.TestZone = gs.dropWallSpawnTables.TheUpperDungeon;
};

// THE_SUNLESS_DESERT:
// ************************************************************************************************
createSpawnTables.TheSunlessDesert = function () {
	gs.spawnTables.TheSunlessDesert = [];
	
	// Zone-Level-1:
	gs.spawnTables.TheSunlessDesert[1] = [
		// Upper-Dungeon-Table:
		{percent: 10, name: [
			{percent: 25, name: {npcType: 'Rat', min: 3, max: 6}},
			{percent: 25, name: {npcType: 'Bat', min: 3, max: 6}},
			{percent: 25, name: {npcType: 'RatNest', min: 1, max: 1}},
			{percent: 25, name: {groupType: 'GoblinHoard'}},
		]},
		
		// Main-Table:
		{percent: 90, name: [
			// Swarm:
			{percent: 33, name: [
				{percent: 80, name: {npcType: 'Scarab', min: 1, max: 3}},
				{percent: 20, name: {npcType: 'ScarabUrn', min: 1, max: 1}},
			]},

			// Melee:
			{percent: 33, name: [
				{percent: 80, name: {npcType: 'DervishRaider', min: 1, max: 1}},
				{percent: 20, name: {npcType: 'TrapDoorSpider', min: 1, max: 2}},
			]},

			// Range: 
			{percent: 33, name: [
				{percent: 80, name: {npcType: 'DervishArcher', min: 1, max: 1}},
				{percent: 20, name: {npcType: 'SpittingViper', min: 1, max: 1}},
			]}
		]},
	];
	
	// Zone-Level-2:
	gs.spawnTables.TheSunlessDesert[2] = [
		// Upper-Dungeon-Table:
		{percent: 10, name: [
			{percent: 25, name: {npcType: 'Rat', min: 3, max: 6}},
			{percent: 25, name: {npcType: 'Bat', min: 3, max: 6}},
			{percent: 25, name: {npcType: 'RatNest', min: 1, max: 1}},
			{percent: 25, name: {groupType: 'GoblinHoard'}},
		]},
		
		// Main-Table:
		{percent: 80, name: [
			// Swarm:
			{percent: 30, name: [
				{percent: 80, name: {npcType: 'Scarab', min: 2, max: 4}},
				{percent: 20, name: {npcType: 'ScarabUrn', min: 1, max: 1}},
			]},

			// Melee:
			{percent: 35, name: [
				{percent: 40, name: {npcType: 'DervishRaider', min: 1, max: 1}},
				{percent: 20, name: {npcType: 'TrapDoorSpider', min: 1, max: 2}},
				{percent: 20, name: {npcType: 'Scorpion', min: 1, max: 1}},
				{percent: 20, name: {npcType: 'Goat', min: 1, max: 3}},
			]},

			// Range: 
			{percent: 35, name: [
				{percent: 60, name: {npcType: 'DervishArcher', min: 1, max: 1}},
				{percent: 20, name: {npcType: 'SpittingViper', min: 1, max: 1}},
				{percent: 20, name: {npcType: 'DervishMagi', min: 1, max: 1}},
			]}
		]},
		
		// Out-of-Depth:
		{percent: 10, name: [
			{percent: 33, name: {groupType: 'MummyPriestGroup'}},
			{percent: 33, name: {npcType: 'SunFlower', min: 1, max: 1}},
			{percent: 33, name: {npcType: 'Mummy', min: 1, max: 1}},
		]}
	];
	
	// Zone-Level-3:
	gs.spawnTables.TheSunlessDesert[3] = gs.spawnTables.TheSunlessDesert[4] = [		
		// Swarm:
		{percent: 20, name: [
			{percent: 80, name: {npcType: 'Scarab', min: 3, max: 6}},
			{percent: 20, name: {npcType: 'ScarabUrn', min: 1, max: 1}},
		]},

		// Melee:
		{percent: 40, name: [
			{percent: 20, name: {npcType: 'DervishRaider', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'TrapDoorSpider', min: 1, max: 2}},
			{percent: 20, name: {npcType: 'Scorpion', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'Goat', min: 2, max: 4}},
			{percent: 20, name: {npcType: 'Mummy', min: 1, max: 1}},
		]},

		// Range: 
		{percent: 40, name: [
			{percent: 20, name: {npcType: 'DervishArcher', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'SpittingViper', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'DervishMagi', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'SunFlower', min: 1, max: 1}},
			{percent: 20, name: {groupType: 'MummyPriestGroup'}}
		]}
	];

	gs.dropWallSpawnTables.TheSunlessDesert = [
		{name: 'Scarab'},
		{name: 'SpittingViper', max: 4},
		{name: 'Scorpion', max: 4},
		{name: 'Goat', max: 4},
		{name: 'Mummy', max: 3},
	];
};

// THE_UNDER_GROVE:
// ************************************************************************************************
createSpawnTables.TheUnderGrove = function () {
	gs.spawnTables.TheUnderGrove = [];
	
	// Zone-Level-1:
	gs.spawnTables.TheUnderGrove[1] = [
		// Upper-Dungeon-Table:
		{percent: 10, name: [
			{percent: 25, name: {npcType: 'Rat', min: 3, max: 6}},
			{percent: 25, name: {npcType: 'Bat', min: 3, max: 6}},
			{percent: 25, name: {npcType: 'RatNest', min: 1, max: 1}},
			{percent: 25, name: {groupType: 'GoblinHoard'}},
		]},
		
		// Main-Table:
		{percent: 80, name: [
			// Swarm:
			{percent: 33, name: [
				{percent: 80, name: {npcType: 'GiantBee', min: 1, max: 3}},
				{percent: 20, name: {npcType: 'BeeHive', min: 1, max: 1}},
			]},

			// Melee:
			{percent: 33, name: [
				{percent: 50, name: {npcType: 'Jaguar', min: 1, max: 1}},
				{percent: 50, name: {npcType: 'Spider', min: 1, max: 1}},
			]},

			// Range: 
			{percent: 33, name: [
				{percent: 100, name: {npcType: 'ElectricEel', min: 1, max: 1}},
			]}
		]},
		
		// Out-of-Depth:
		{percent: 10, name: [
			{percent: 1, name: {npcType: 'CentaurArcher', min: 1, max: 1}},
			{percent: 1, name: {npcType: 'CentaurWarrior', min: 1, max: 1}},
			{percent: 1, name: {npcType: 'PoisonSpider', min: 1, max: 1}},
			{percent: 1, name: {npcType: 'SpiderNest',	min: 1, max: 1}},
		]}
	];
	
	// Zone-Level-2:
	gs.spawnTables.TheUnderGrove[2] = [
		// Upper-Dungeon-Table:
		{percent: 10, name: [
			{percent: 25, name: {npcType: 'Rat', min: 3, max: 6}},
			{percent: 25, name: {npcType: 'Bat', min: 3, max: 6}},
			{percent: 25, name: {npcType: 'RatNest', min: 1, max: 1}},
			{percent: 25, name: {groupType: 'GoblinHoard'}},
		]},
		
		// Main-Table:
		{percent: 80, name: [
			// Swarm:
			{percent: 33, name: [
				{percent: 70, name: {npcType: 'GiantBee', min: 2, max: 4}},
				{percent: 20, name: {npcType: 'BeeHive', min: 1, max: 1}},
				{percent: 10, name: {npcType: 'SpiderNest', min: 1, max: 1}},
			]},

			// Melee:
			{percent: 33, name: [
				{percent: 25, name: {npcType: 'Jaguar', min: 1, max: 2}},
				{percent: 25, name: {npcType: 'Spider', min: 1, max: 2}},
				{percent: 25, name: {npcType: 'CentaurWarrior', min: 1, max: 1}},
				{percent: 25, name: {npcType: 'PoisonSpider',	min: 1, max: 1}},
				
			]},

			// Range: 
			{percent: 33, name: [
				{percent: 1, name: {npcType: 'ElectricEel', min: 1, max: 1}},
				{percent: 1, name: {npcType: 'CentaurArcher', min: 1, max: 1}},
				{percent: 1, name: {npcType: 'CorruptedDruid', min: 1, max: 1}},
			]}
		]},
		
		// Out-of-Depth:
		{percent: 10, name: [
			{percent: 1, name: {npcType: 'Chameleon', min: 1, max: 1}},
			{percent: 1, name: {npcType: 'Elephant', min: 1, max: 2}},
			{percent: 1, name: {npcType: 'CorruptedDruid', min: 1, max: 1}},
		]}
	];
	
	// Zone-Level-3:
	gs.spawnTables.TheUnderGrove[3] = gs.spawnTables.TheUnderGrove[4] = [
		// Swarm:
		{percent: 33, name: [
			{percent: 70, name: {npcType: 'GiantBee', min: 2, max: 4}},
			{percent: 20, name: {npcType: 'BeeHive', min: 1, max: 1}},
			{percent: 10, name: {npcType: 'SpiderNest', min: 1, max: 1}},
		]},

		// Melee:
		{percent: 33, name: [
			{percent: 20, name: {npcType: 'Jaguar', min: 1, max: 3}},
			{percent: 20, name: {npcType: 'Spider', min: 1, max: 3}},
			{percent: 20, name: {npcType: 'CentaurWarrior', min: 1, max: 2}},
			{percent: 20, name: {npcType: 'PoisonSpider', min: 1, max: 2}},
			{percent: 20, name: {npcType: 'Elephant', min: 1, max: 2}},
		]},

		// Range: 
		{percent: 33, name: [
			{percent: 30, name: {npcType: 'ElectricEel', min: 1, max: 1}},
			{percent: 40, name: {npcType: 'CentaurArcher', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'Chameleon', min: 1, max: 1}},
			{percent: 10, name: {npcType: 'CorruptedDruid', min: 1, max: 1}},
		]}
	];
	
	gs.dropWallSpawnTables.TheUnderGrove = [
		{name: 'GiantBee'},
		{name: 'Jaguar', max: 4},
		{name: 'Spider', max: 2},
		{name: 'PoisonSpider', max: 2},
		{name: 'Elephant', max: 2},
	];
};

// THE_SWAMP:
// ************************************************************************************************
createSpawnTables.TheSwamp = function () {
	
	gs.spawnTables.TheSwamp = [];
	
	// Zone-Level-1:
	gs.spawnTables.TheSwamp[1] = [
		// Upper-Dungeon-Table:
		{percent: 10, name: [
			{percent: 25, name: {npcType: 'Rat', min: 3, max: 6}},
			{percent: 25, name: {npcType: 'Bat', min: 3, max: 6}},
			{percent: 25, name: {npcType: 'RatNest', min: 1, max: 1}},
			{percent: 25, name: {groupType: 'GoblinHoard'}},
		]},
		
		// Main-Table:
		{percent: 80, name: [
			// Swarm:
			{percent: 33, name: [
				{percent: 50, name: {npcType: 'Pirahna', min: 1, max: 3}},
				{percent: 50, name: {npcType: 'BlinkFrog', min: 1, max: 3}},
			]},

			// Melee:
			{percent: 33, name: [
				{percent: 100, name: {npcType: 'PoisonViper', min: 1, max: 1}},
			]},

			// Range: 
			{percent: 33, name: [
				{percent: 100, name: {npcType: 'ElectricEel', min: 1, max: 1}},
			]}
		]},
		
		// Out-of-Depth:
		{percent: 10, name: [
			{percent: 33, name: {npcType: 'Mosquito', min: 1, max: 1}},
			{percent: 33, name: {npcType: 'SpinyFrog', min: 1, max: 1}},
			{percent: 33, name: {npcType: 'SwampFungoid', min: 1, max: 1}},
		]}
	];
	
	// Zone-Level-2:
	gs.spawnTables.TheSwamp[2] = [
		// Upper-Dungeon-Table:
		{percent: 10, name: [
			{percent: 25, name: {npcType: 'Rat', min: 3, max: 6}},
			{percent: 25, name: {npcType: 'Bat', min: 3, max: 6}},
			{percent: 25, name: {npcType: 'RatNest', min: 1, max: 1}},
			{percent: 25, name: {groupType: 'GoblinHoard'}},
		]},
		
		// Main-Table:
		{percent: 80, name: [
			// Swarm:
			{percent: 33, name: [
				{percent: 50, name: {npcType: 'Pirahna', min: 2, max: 4}},
				{percent: 50, name: {npcType: 'BlinkFrog', min: 2, max: 4}},
			]},

			// Melee:
			{percent: 33, name: [
				{percent: 60, name: {npcType: 'PoisonViper', min: 1, max: 1}},
				{percent: 20, name: {npcType: 'Mosquito', min: 1, max: 1}},
				{percent: 20, name: {npcType: 'SpinyFrog', min: 1, max: 1}},
			]},

			// Range: 
			{percent: 33, name: [
				{percent: 50, name: {npcType: 'ElectricEel', min: 1, max: 1}},
				{percent: 50, name: {npcType: 'SwampFungoid', min: 1, max: 1}},
			]}
		]},
		
		// Out-of-Depth:
		{percent: 10, name: [
			{percent: 33, name: {npcType: 'LickyToad', min: 1, max: 1}},
			{percent: 33, name: {npcType: 'BullFrog', min: 1, max: 1}},
			{percent: 33, name: {npcType: 'SnappingTurtle', min: 1, max: 1}},
		]}
	];
	
	// Zone-Level-3:
	gs.spawnTables.TheSwamp[3] = gs.spawnTables.TheSwamp[4] = [
		// Swarm:
		{percent: 33, name: [
			{percent: 50, name: {npcType: 'Pirahna', min: 2, max: 5}},
			{percent: 50, name: {npcType: 'BlinkFrog', min: 2, max: 5}},
		]},

		// Melee:
		{percent: 33, name: [
			{percent: 20, name: {npcType: 'PoisonViper', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'Mosquito', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'SpinyFrog', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'BullFrog', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'SnappingTurtle', min: 1, max: 1}},
		]},

		// Range: 
		{percent: 33, name: [
			{percent: 40, name: {npcType: 'ElectricEel', min: 1, max: 1}},
			{percent: 40, name: {npcType: 'SwampFungoid', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'LickyToad', min: 1, max: 1}},
		]}
	];
	
	gs.dropWallSpawnTables.TheSwamp = [
		{name: 'BlinkFrog'},
		{name: 'PoisonViper', max: 4},
		{name: 'Mosquito', max: 4},
		{name: 'SwampFungoid', max: 2},
	];
};

// THE_ORC_FORTRESS:
// ********************************************************************************************
createSpawnTables.TheOrcFortress = function () {
	gs.spawnTables.TheOrcFortress = [];
	
	// Zone Level 1/2/3:
	gs.spawnTables.TheOrcFortress[1] = gs.spawnTables.TheOrcFortress[2]= gs.spawnTables.TheOrcFortress[3] = [
		// Swarm:
        {percent: 20, name: [
            {percent: 50, name: {npcType: 'Wolf', min: 2, max: 4}},
			{percent: 50, name: {npcType: 'WolfKennel', min: 1, max: 1}},
        ]},
			
        // Melee:
        {percent: 40, name: [
            {percent: 40, name: {npcType: 'OrcWarrior', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'OrcSlaver', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'OrcBerserker', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'Ogre', min: 1, max: 1}},
        ]},
		
        // Range: 
        {percent: 20, name: [
            {percent: 100, name: {npcType: 'OrcArcher', min: 1, max: 1}},
        ]},
		
		// Caster:
		{percent: 20, name: [
			{percent: 50, name: {npcType: 'OrcPyromancer', min: 1, max: 1}},
			{percent: 50, name: {npcType: 'OrcCryomancer', min: 1, max: 1}},
		]},
	];
	
	// Zone Level 4/5/6:
	gs.spawnTables.TheOrcFortress[4] = gs.spawnTables.TheOrcFortress[5]= gs.spawnTables.TheOrcFortress[6] = [
		// Swarm:
        {percent: 20, name: [
            {percent: 50, name: {npcType: 'Wolf', min: 3, max: 6}},
			{percent: 50, name: {npcType: 'WolfKennel', min: 1, max: 1}},
        ]},
			
        // Melee:
        {percent: 40, name: [
            {percent: 40, name: {npcType: 'OrcWarrior', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'OrcSlaver', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'OrcBerserker', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'Ogre', min: 1, max: 1}},
			
			// New:
			{percent: 20, name: {npcType: 'OrcChaosKnight', min: 1, max: 2}},
			{percent: 20, name: {npcType: 'Minotaur', min: 1, max: 1}},
        ]},
		
        // Range: 
        {percent: 20, name: [
            {percent: 100, name: {npcType: 'OrcArcher', min: 1, max: 1}},
			
			// New:
			{percent: 20, name: {npcType: 'Ballista', min: 1, max: 1}},
        ]},
		
		// Caster:
		{percent: 20, name: [
			{percent: 50, name: {npcType: 'OrcPyromancer', min: 1, max: 1}},
			{percent: 50, name: {npcType: 'OrcCryomancer', min: 1, max: 1}},
			
			// New:
			{percent: 30, name: {groupType: 'OrcPriestGroup'}},
			{percent: 10, name: {groupType: 'OrcPriestWolfGroup'}},
			{percent: 20, name: {groupType: 'OgreShamanGroup'}},
			{percent: 10, name: {groupType: 'OgreShamanWolfGroup'}}
		]},
	];
	
	gs.dropWallSpawnTables.TheOrcFortress = [
		{name: 'Wolf'},
		{name: 'OrcArcher', max: 4},
		{name: 'OrcSlaver', max: 4},
		{name: 'OrcWarrior', max: 4},
		{name: 'OrcPyromancer', max: 2},
		{name: 'OrcCryomancer', max: 2},
		{name: 'Ogre', max: 2},
		{name: 'OrcChaosKnight', max: 4},
	];
};

// THE_DARK_TEMPLE:
// ********************************************************************************************
createSpawnTables.TheDarkTemple = function () {
	gs.spawnTables.TheDarkTemple = [];
	
	// Zone-Level 1/2/3:
	gs.spawnTables.TheDarkTemple[1] = gs.spawnTables.TheDarkTemple[2] = gs.spawnTables.TheDarkTemple[3] = [
        // Melee:
        {percent: 30, name: [
            {percent: 80, name: {npcType: 'DarkElfWarrior', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'DarkElfAssassin', min: 1, max: 1}},
        ]},

        // Range: 
        {percent: 30, name: [
            {percent: 100, name: {npcType: 'DarkElfArcher', min: 1, max: 1}},
        ]},
		
		// Caster:
		{percent: 40, name: [
            {percent: 25, name: {npcType: 'DarkElfPyromancer', min: 1, max: 1}},
			{percent: 25, name: {npcType: 'DarkElfStormologist', min: 1, max: 1}},
			{percent: 25, name: {npcType: 'DarkElfCryomancer', min: 1, max: 1}},
			{percent: 25, name: {npcType: 'DarkElfSummoner', min: 1, max: 1}},
        ]},
	];
	
	// Zone-Level 4/5/6:
	gs.spawnTables.TheDarkTemple[4] = gs.spawnTables.TheDarkTemple[5] = gs.spawnTables.TheDarkTemple[6] = [
        // Melee:
        {percent: 30, name: [
            {percent: 50, name: {npcType: 'DarkElfWarrior', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'DarkElfAssassin', min: 1, max: 1}},
			
			// New
			{percent: 30, name: {npcType: 'DrachnidWarrior', min: 1, max: 1}},
        ]},

        // Range: 
        {percent: 30, name: [
            {percent: 40, name: {npcType: 'DarkElfArcher', min: 1, max: 1}},
			
			// New
			{percent: 30, name: {npcType: 'DrachnidArcher', min: 1, max: 1}},
			{percent: 30, name: {npcType: 'ArcaneArcher', min: 1, max: 1}},
        ]},
		
		// Caster:
		{percent: 40, name: [
            {percent: 15, name: {npcType: 'DarkElfPyromancer', min: 1, max: 1}},
			{percent: 15, name: {npcType: 'DarkElfStormologist', min: 1, max: 1}},
			{percent: 15, name: {npcType: 'DarkElfCryomancer', min: 1, max: 1}},
			{percent: 15, name: {npcType: 'DarkElfSummoner', min: 1, max: 1}},
			
			// New:
			{percent: 20, name: {groupType: 'DarkElfPriestGroup'}},
			{percent: 10, name: {npcType: 'MindFlayer', min: 1, max: 1}},
			{percent: 10, name: {npcType: 'SummoningStatue', min: 1, max: 1}}, 
			
        ]},
	];
	
	gs.dropWallSpawnTables.TheDarkTemple = [
		{name: 'DarkElfWarrior', max: 4},
		{name: 'DarkElfArcher', max: 4},
		{name: 'DarkElfPyromancer', max: 2},
		{name: 'DarkElfStormologist', max: 2},
		{name: 'DarkElfCryomancer', max: 2},
		{name: 'ArcaneArcher', max: 2},
	];
};

// THE_SEWERS:
// ********************************************************************************************
createSpawnTables.TheSewers = function () {
	gs.spawnTables.TheSewers = [];
	
	// Zone Level 1/2:
	gs.spawnTables.TheSewers[1] = gs.spawnTables.TheSewers[2] = [
		// Swarms:
		{percent: 20, name: [
			{percent: 60, name: {npcType: 'SewerRat', min: 2, max: 4}},
			{percent: 40, name: {npcType: 'SewerRatNest', min: 1, max: 1}},
		]},

		// Melee:
		{percent: 40, name: [
			{percent: 20, name: {npcType: 'TrollWarrior', min: 1, max: 2}},
			{percent: 20, name: {npcType: 'Crocodile', min: 1, max: 2}},
			{percent: 20, name: {npcType: 'BoaConstrictor', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'BlackMamba', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'GiantLeach', min: 1, max: 2}},
		]},

		// Range:
		{percent: 40, name: [
			{percent: 40, name: {npcType: 'TrollArcher', min: 1, max: 2}},
			{percent: 30, name: {npcType: 'Bloat', min: 1, max: 1}},
			{percent: 30, name: {groupType: 'TrollShamanGroup'}},
		]},
	];
	
	// Zone Level 3/4:
	gs.spawnTables.TheSewers[3] = gs.spawnTables.TheSewers[4] = [
		// Base Monsters:
		{percent: 50, name: gs.spawnTables.TheSewers[1]},
		
		// Advanced Monsters:
		{percent: 50, name: [
			// Melee:
			{percent: 50, name: [
				{percent: 60, name: {npcType: 'Slime', min: 1, max: 1}},
				{percent: 30, name: {npcType: 'AcidicSlime', min: 1, max: 1}},
				{percent: 10, name: {npcType: 'CorrosiveSlime', min: 1, max: 1}},
			]},
			
			// Range:
			{percent: 50, name: [
				{percent: 80, name: {npcType: 'TentacleSpitter', min: 1, max: 1}},
				{percent: 20, name: {npcType: 'ToxicStatue', min: 1, max: 1}},
			]},
		]}
	];
	
	gs.dropWallSpawnTables.TheSewers = [
		{name: 'SewerRat'},
		{name: 'GiantLeach', max: 4},
		{name: 'TrollWarrior', max: 4},
		{name: 'TrollArcher', max: 4},
		{name: 'Crocodile', max: 4},
		{name: 'BlackMamba', max: 4},
		{name: 'BoaConstrictor', max: 4},
		{name: 'Slime', max: 2},
		{name: 'AcidicSlime', max: 2},
		{name: 'Bloat', max: 2},
	];
	
	// THE_SLIME_PIT:
	// ********************************************************************************************
	gs.spawnTables.TheSlimePit = [];
	gs.spawnTables.TheSlimePit[1] = gs.spawnTables.TheSlimePit[2] = gs.spawnTables.TheSlimePit[3] = gs.spawnTables.TheSlimePit[4] = [
		{percent: 30, name: {npcType: 'Slime', min: 1, max: 1}},
		{percent: 30, name: {npcType: 'AcidicSlime', min: 1, max: 1}},
		{percent: 30, name: {npcType: 'TentacleSpitter', min: 1, max: 1}},
		{percent: 10, name: {npcType: 'CorrosiveSlime', min: 1, max: 1}},
	];
};

// THE_CORE:
// ********************************************************************************************
createSpawnTables.TheCore = function () {
	gs.spawnTables.TheCore = [];
	// ZONE LEVEL 1/2:
	gs.spawnTables.TheCore[1] = gs.spawnTables.TheCore[2] = [
		// Swarm:
		{percent: 20, name: [
			{percent: 80, name: {npcType: 'FireBat', min: 2, max: 4}},
			{percent: 20, name: {npcType: 'FireBatNest', min: 1, max: 1}},
		]},

		// Melee:
		{percent: 40, name: [
			{percent: 60, name: {npcType: 'FlameSpinner', min: 1, max: 2}},
			{percent: 40, name: {npcType: 'ObsidianGolem', min: 1, max: 1}}
		]},

		// Range:
		{percent: 40, name: [
			{percent: 40, name: {npcType: 'FireLizard', min: 1, max: 1}},
			{percent: 30, name: {npcType: 'LavaEel', min: 1, max: 1}},
		]},
	];
	
	// ZONE LEVEL 3/4:
	gs.spawnTables.TheCore[3] = gs.spawnTables.TheCore[4] = [
		// Basic Monsters:
		{percent: 50, name: gs.spawnTables.TheCore[1]},
		
		// Advanced Monsters:
		{percent: 50, name: [
			{percent: 40, name: {npcType: 'FlameVortex', min: 1, max: 3}},
			{percent: 40, name: {npcType: 'FireElemental', min: 1, max: 2}},
			{percent: 20, name: {npcType: 'FireStatue', min: 1, max: 1}},
		]}
	];
	
	gs.dropWallSpawnTables.TheCore = [
		{name: 'FireBat'},
		{name: 'FireLizard', max: 4},
		{name: 'FlameSpinner', max: 4},
		{name: 'Ogre', max: 4},
		{name: 'FlameVortex', max: 4},
		{name: 'FireElemental', max: 2},
		{name: 'ObsidianGolem', max: 2},
	];
};

// THE_ICE_CAVES:
// ********************************************************************************************
createSpawnTables.TheIceCaves = function () {
	gs.spawnTables.TheIceCaves = [];
	
	// ZONE LEVEL 1/2:
	gs.spawnTables.TheIceCaves[1] = gs.spawnTables.TheIceCaves[2] = [
		// Swarm:
		{percent: 33, name: [
			{percent: 80, name: {npcType: 'DireWolf', min: 2, max: 4}},
			{percent: 20, name: {npcType: 'DireWolfKennel', min: 1, max: 1}},
		]},

		// Melee:
		{percent: 33, name: [
			{percent: 33, name: {npcType: 'GnollWarrior', min: 1, max: 2}},
			{percent: 33, name: {npcType: 'Yak', min: 2, max: 3}},
			{percent: 33, name: {npcType: 'PolarBear', min: 1, max: 1}},
		]},

		// Range:
		{percent: 33, name: [
			{percent: 33, name: {npcType: 'GnollArcher', min: 1, max: 2}},
			{percent: 33, name: {npcType: 'Penguin', min: 1, max: 2}},
		]},
	];
	
	// ZONE LEVEL 3/4:
	gs.spawnTables.TheIceCaves[3] = gs.spawnTables.TheIceCaves[4] = [
		// Basic Monsters:
		{percent: 50, name: gs.spawnTables.TheIceCaves[1]},
		
		// Advanced Monsters:
		{percent: 50, name: [
			{percent: 40, name: {npcType: 'FrostVortex', min: 1, max: 3}},
			{percent: 40, name: {npcType: 'IceElemental', min: 1, max: 2}},
			{percent: 20, name: {npcType: 'IceStatue', min: 1, max: 1}},
		]}
	];
	
	gs.dropWallSpawnTables.TheIceCaves = [
		{name: 'DireWolf'},
		{name: 'Yak', max: 6},
		{name: 'GnollWarrior', max: 4},
		{name: 'GnollArcher', max: 4},
		{name: 'Penguin', max: 4},
		{name: 'PolarBear', max: 2},
		{name: 'FrostVortex', max: 4},
		{name: 'IceElemental', max: 2},
	];
};

// THE_CRYPT:
// ********************************************************************************************
createSpawnTables.TheCrypt = function () {
	gs.spawnTables.TheCrypt = [];
	
	// ZONE LEVEL 1/2:
	gs.spawnTables.TheCrypt[1] = gs.spawnTables.TheCrypt[2] = [
		// Swarm:
		{percent: 33, name: [
			{percent: 60, name: {npcType: 'Maggot', min: 2, max: 4}},
			{percent: 20, name: {npcType: 'VampireBat', min: 2, max: 4}},
			{percent: 20, name: {npcType: 'RottingCorpse', min: 1, max: 1}},
		]},

		// Melee:
		{percent: 33, name: [
			{percent: 40, name: {npcType: 'SkeletonWarrior', min: 1, max: 3}},
			{percent: 40, name: {npcType: 'CryptCrawler', min: 1, max: 3}},
			{percent: 20, name: {npcType: 'ZombieBloat', min: 1, max: 3}},
		]},

		// Range:
		{percent: 33, name: [
			{percent: 40, name: {npcType: 'SkeletonArcher', min: 1, max: 3}},
			{percent: 20, name: {npcType: 'TentacleSpitter', min: 1, max: 3}},
			{percent: 20, name: {npcType: 'ToxicStatue', min: 1, max: 1}},
			{percent: 20, name: {groupType: 'NecromancerGroup'}},
		]},
	];
	
	// ZONE LEVEL 3/4:
	gs.spawnTables.TheCrypt[3] = gs.spawnTables.TheCrypt[4] = [
		// Singles:
		{percent: 50, name: [
			// Melee:
			{percent: 1, name: {npcType: 'Wraith', min: 4, max: 6}},
			{percent: 1, name: {npcType: 'RottingCorpse', min: 1, max: 1}},
			{percent: 1, name: {npcType: 'CryptCrawler', min: 1, max: 3}},
			{percent: 1, name: {npcType: 'FleshGolem', min: 1, max: 1}},

			// Range:
			{percent: 1, name: {npcType: 'ZombieBloat', min: 1, max: 3}},
			{percent: 1, name: {npcType: 'TentacleSpitter', min: 1, max: 3}},
			{percent: 1, name: {npcType: 'ToxicStatue', min: 1, max: 1}},
		]},
		
		// Caster Groups:
		{percent: 50, name: [
			{percent: 1, name: {groupType: 'NecromancerGroup'}}, // With Skeletons
			{percent: 1, name: {groupType: 'PestilencePriestGroup1'}}, // With Maggots
			{percent: 1, name: {groupType: 'PestilencePriestGroup2'}}, // With Flesh Golem
		]}
		
	];
	

	gs.dropWallSpawnTables.TheCrypt = [
		{name: 'Maggot'},
		{name: 'VampireBat'},
		{name: 'CryptCrawler', max: 4},
		{name: 'BoneVortex', max: 4},
		{name: 'SkeletonWarrior', max: 4},
		{name: 'SkeletonArcher', max: 4},
	];
};

// THE_IRON_FORGE:
// ********************************************************************************************
createSpawnTables.TheIronForge = function () {
	gs.spawnTables.TheIronForge = [];
	
	// ZONE LEVEL 1/2:
	gs.spawnTables.TheIronForge[1] = gs.spawnTables.TheIronForge[2] = [
		// Swarms:
		{percent: 20, name: [
			{percent: 60, name: {npcType: 'ClockworkRat', min: 2, max: 4}},
			{percent: 20, name: {npcType: 'Bombomber', min: 2, max: 4}},
			{percent: 20, name: {npcType: 'ClockworkFactory', min: 1, max: 1}},
		]},

		// Melee:
		{percent: 40, name: [
			{percent: 80, name: {npcType: 'ClockworkWarrior', min: 1, max: 2}},
			{percent: 20, name: {npcType: 'CorrosiveSlime', min: 1, max: 1}},
		]},

		// Range:
		{percent: 40, name: [
			{percent: 80, name: {npcType: 'ClockworkArcher', min: 1, max: 2}},
			{percent: 20, name: {npcType: 'ClockworkBomber', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'ClockworkPyro', min: 1, max: 1}},
		]},
	];
	
	// ZONE LEVEL 3/4:
	gs.spawnTables.TheIronForge[3] = gs.spawnTables.TheIronForge[4] = gs.spawnTables.TheIronForge[5] =[
		// Basic Monsters:
		{percent: 75, name: gs.spawnTables.TheIronForge[1]},
		
		// Advanced Monsters:
		// Note: Turrets are placed by vault generation so we don't need much here
		{percent: 25, name: [
			{percent: 50, name: {npcType: 'ClockworkRhino', min: 1, max: 1}},
			{percent: 50, name: {npcType: 'ClockworkKnight', min: 1, max: 1}},
		]}
	];
	
	gs.dropWallSpawnTables.TheIronForge = [
		{name: 'ClockworkRat'},
		{name: 'ClockworkArcher', max: 4},
		{name: 'ClockworkWarrior', max: 4},
		{name: 'ClockworkBomber', max: 2},
		{name: 'ClockworkPyro', max: 2},
		{name: 'ClockworkRhino', max: 2},
		{name: 'CorrosiveSlime', max: 2},
		{name: 'ClockworkKnight', max: 2},
	];
};

// THE_ARCANE_TOWER:
// ********************************************************************************************
createSpawnTables.TheArcaneTower = function () {
	gs.spawnTables.TheArcaneTower = [];
	
	// ZONE LEVEL 1/2
	gs.spawnTables.TheArcaneTower[1] = gs.spawnTables.TheArcaneTower[2] = [
		// Imp:
		{percent: 40, name: [
			{percent: 25, name: {npcType: 'IronImp', min: 1, max: 3}},
			{percent: 25, name: {npcType: 'FireImp', min: 1, max: 3}},
			{percent: 25, name: {npcType: 'StormImp', min: 1, max: 3}},
			{percent: 25, name: {npcType: 'IceImp', min: 1, max: 3}},
		]},
		
		// Melee:
		{percent: 20, name: [
			{percent: 40, name: {npcType: 'FlameVortex', min: 2, max: 3}},
			{percent: 40, name: {npcType: 'FrostVortex', min: 2, max: 3}},
			{percent: 20, name: {npcType: 'ManaViper', min: 1, max: 1}},
		]},

		// Elemental + Casters:
		{percent: 20, name: [
			{percent: 20, name: {npcType: 'FireElemental', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'IceElemental', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'StormElemental', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'DarkElfSummoner', min: 1, max: 1}},
		]},

		// Statue:
		{percent: 20, name: [
			{percent: 25, name: {npcType: 'FireStatue', min: 1, max: 1}},
			{percent: 25, name: {npcType: 'StormStatue', min: 1, max: 1}},
			{percent: 25, name: {npcType: 'IceStatue', min: 1, max: 1}},
			{percent: 25, name: {npcType: 'SummoningStatue', min: 1, max: 1}},
		]},
	];
	
	// ZONE LEVEL 3/4
	gs.spawnTables.TheArcaneTower[3] = gs.spawnTables.TheArcaneTower[4] = gs.spawnTables.TheArcaneTower[5] = [
		// Basic Monsters:
		{percent: 75, name: gs.spawnTables.TheArcaneTower[1]},
		
		// Advanced Monsters:
		{percent: 25, name: [
			{percent: 25, name: {npcType: 'EvilEye', min: 1, max: 1}},
			{percent: 25, name: {npcType: 'StoneGolem', min: 1, max: 1}},
			{percent: 25, name: {npcType: 'FireStaffTurret', min: 1, max: 1}},
			{percent: 25, name: {npcType: 'Demonologist', min: 1, max: 1}},
		]}
	];
	
	gs.dropWallSpawnTables.TheArcaneTower = [
		{name: 'FireImp', max: 4},
		{name: 'StormImp', max: 4},
		{name: 'IceImp', max: 4},
		{name: 'IronImp', max: 4},
		{name: 'FlameVortex', max: 4},
		{name: 'FrostVortex', max: 4},
		{name: 'ManaViper', max: 3},
		{name: 'StoneGolem', max: 2},
	];
};

// THE_VAULT_OF_YENDOR:
// ********************************************************************************************
createSpawnTables.TheVaultOfYendor = function () {
	// THE_VAULT_OF_YENDOR:
	// ********************************************************************************************
	gs.spawnTables.TheVaultOfYendor = [];
	
	// Zone-Level-1:
	gs.spawnTables.TheVaultOfYendor[1] = [
        // Main-Table:
        {percent: 80, name: [
             // Swarms:
            {percent: 20, name: [
                {percent: 80, name: {npcType: 'HellHound', min: 3, max: 6}},
                {percent: 20, name: {npcType: 'HellGate', min: 1, max: 1}},
            ]},
            
            // Melee:
            {percent: 35, name: [
				{percent: 60, name: {npcType: 'OrcChaosKnight', min: 1, max: 1}},
                {percent: 40, name: {npcType: 'DrachnidWarrior', min: 1, max: 1}},
				
            ]},
            
            // Range:
            {percent: 35, name: [
				{percent: 60, name: {npcType: 'ArcaneArcher', min: 1, max: 1}},
				{percent: 40, name: {npcType: 'DrachnidArcher', min: 1, max: 1}},
            ]},
			
			// Statue:
			{percent: 10, name: [
				{percent: 25, name: {npcType: 'StormStatue', min: 1, max: 1}},
				{percent: 25, name: {npcType: 'FireStatue', min: 1, max: 1}},
				{percent: 25, name: {npcType: 'IceStatue', min: 1, max: 1}},
				{percent: 25, name: {npcType: 'ToxicStatue', min: 1, max: 1}},
			]}
        ]},
        // Out-of-Depth:
        {percent: 20, name: [
            {percent: 20, name: {npcType: 'BladeDancer', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'CrystalGolem', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'Demonologist', min: 1, max: 1}},
			{percent: 20, name: {groupType: 'InfernoLichGroup'}},
			{percent: 20, name: {groupType: 'StormLichGroup'}},
        ]},
	];
	
	// Zone-Level-2:
	gs.spawnTables.TheVaultOfYendor[2] = [
        // Main-Table:
        {percent: 80, name: [
             // Swarms:
            {percent: 20, name: [
                {percent: 80, name: {npcType: 'HellHound', min: 3, max: 6}},
                {percent: 20, name: {npcType: 'HellGate', min: 1, max: 1}},
            ]},
            
            // Melee:
            {percent: 35, name: [
				{percent: 40, name: {npcType: 'OrcChaosKnight', min: 1, max: 1}},
                {percent: 20, name: {npcType: 'DrachnidWarrior', min: 1, max: 1}},
				{percent: 20, name: {npcType: 'BladeDancer', min: 1, max: 1}},
				{percent: 20, name: {npcType: 'CrystalGolem', min: 1, max: 1}},
				
            ]},
            
            // Range:
            {percent: 35, name: [
				{percent: 40, name: {npcType: 'ArcaneArcher', min: 1, max: 1}},
				{percent: 30, name: {npcType: 'DrachnidArcher', min: 1, max: 1}},
				{percent: 10, name: {npcType: 'Demonologist', min: 1, max: 1}},
				{percent: 10, name: {groupType: 'InfernoLichGroup'}},
				{percent: 10, name: {groupType: 'StormLichGroup'}},
            ]},
			
			// Statue:
			{percent: 10, name: [
				{percent: 25, name: {npcType: 'StormStatue', min: 1, max: 1}},
				{percent: 25, name: {npcType: 'FireStatue', min: 1, max: 1}},
				{percent: 25, name: {npcType: 'IceStatue', min: 1, max: 1}},
				{percent: 25, name: {npcType: 'ToxicStatue', min: 1, max: 1}},
			]}
        ]},
        // Out-of-Depth:
        {percent: 20, name: [
			{percent: 33, name: {npcType: 'TentacleTerror', min: 1, max: 1}},
			{percent: 33, name: {npcType: 'Succubus', min: 1, max: 1}},
			{percent: 33, name: {groupType: 'VaultChaosPriestGroup'}},
        ]},
	];
	
	// Zone-Level-3:
	gs.spawnTables.TheVaultOfYendor[3] = gs.spawnTables.TheVaultOfYendor[4] = [
		 // Swarms:
		{percent: 20, name: [
			{percent: 80, name: {npcType: 'HellHound', min: 3, max: 6}},
			{percent: 20, name: {npcType: 'HellGate', min: 1, max: 1}},
		]},

		// Melee:
		{percent: 35, name: [
			{percent: 20, name: {npcType: 'OrcChaosKnight', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'DrachnidWarrior', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'BladeDancer', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'CrystalGolem', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'TentacleTerror', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'Succubus', min: 1, max: 1}},
		]},

		// Range:
		{percent: 35, name: [
			{percent: 20, name: {npcType: 'ArcaneArcher', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'DrachnidArcher', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'Demonologist', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'InfernoLich', min: 1, max: 1}},
			{percent: 20, name: {npcType: 'StormLich', min: 1, max: 1}},
			{percent: 20, name: {groupType: 'VaultChaosPriestGroup'}},
		]},

		// Statue:
		{percent: 10, name: [
			{percent: 25, name: {npcType: 'StormStatue', min: 1, max: 1}},
			{percent: 25, name: {npcType: 'FireStatue', min: 1, max: 1}},
			{percent: 25, name: {npcType: 'IceStatue', min: 1, max: 1}},
			{percent: 25, name: {npcType: 'ToxicStatue', min: 1, max: 1}},
		]}
	];
	
	gs.dropWallSpawnTables.TheVaultOfYendor = [
		{name: 'HellHound'},
		{name: 'DrachnidWarrior', max: 4},
		{name: 'DrachnidArcher', max: 4},
		{name: 'OrcChaosKnight', max: 4},
		{name: 'ArcaneArcher', max: 4},
		{name: 'BladeDancer', max: 3},
		{name: 'CrystalGolem', max: 2},
		{name: 'TentacleTerror', max: 2},
		
		{name: 'FlameVortex'},
		{name: 'FrostVortex'},
	];
};

// CREATE_SPAWN_TABLES:
// ************************************************************************************************
gs.createSpawnTables = function () {
	this.spawnTables = {};
	this.dropWallSpawnTables = {};
	
	// Zone Spawn Tables:
	createSpawnTables.TheUpperDungeon();
	createSpawnTables.TheUnderGrove();
	createSpawnTables.TheSunlessDesert();
	createSpawnTables.TheSwamp();
	createSpawnTables.TheOrcFortress();
	createSpawnTables.TheDarkTemple();
	createSpawnTables.TheSewers();
	createSpawnTables.TheCore();
	createSpawnTables.TheIceCaves();
	createSpawnTables.TheCrypt();
	createSpawnTables.TheIronForge();
	createSpawnTables.TheArcaneTower();
    createSpawnTables.TheVaultOfYendor();
    	
	// DROP_WALL_VERIFICATION:
	gs.forEachType(this.dropWallSpawnTables, function (table) {
		table.forEach(function (e) {
			if (!this.npcTypes[e.name]) {
				throw 'dropWallSpawnTable: Invalid npcType: ' + e.name;
			}
		}, this);
	}, this);
	
	
	/*
	this.forEachType(this.spawnTables, function (spawnTable) {
		spawnTable.forEach(function (levelTable) {
			levelTable.forEach(function (e) {
				if (!this.npcTypes[e.name] && !this.npcGroupTypes[e.name]) {
					throw 'Invalid npcType or npcGroupType: ' + e.name;
				}
			}, this);
		}, this);
	}, this);
	*/
};

// CREATE_NPC_GROUP_TYPES:
// ************************************************************************************************
gs.createNPCGroupTypes = function () {
	this.npcGroupTypes = {
		// THE_UPPER_DUNGEON:
		// ****************************************************************************************
		GoblinShamanGroup: {
			min: 2,
			max: 3,
			npcTypes: [
				{name: 'GoblinWarrior', 	percent: 50},
				{name: 'GoblinArcher', 		percent: 50},
			],
			forceNPCTypes: ['GoblinShaman'],
			
		},
		
		GoblinHoard: {
			min: 3,
			max: 6,
			npcTypes: [
				{name: 'GoblinWarrior', 	percent: 30},	   
				{name: 'GoblinBrute', 		percent: 20},   
				{name: 'GoblinArcher', 		percent: 20},   
				{name: 'GoblinFireMage', 	percent: 10},
				{name: 'GoblinStormMage', 	percent: 10},
				{name: 'GoblinShaman', 		percent: 10}
			]
		},
		
		// THE_DARK_TEMPLE:
		// ****************************************************************************************
		DarkElfPriestGroup: {
			min: 2,
			max: 4,
			npcTypes: [
				{name: 'DarkElfWarrior', 	percent: 50},
				{name: 'DarkElfArcher', 	percent: 50},
			],
			forceNPCTypes: ['DarkElfPriest'],
		},
		
		// THE_ORC_FORTRESS:
		// ****************************************************************************************
		OrcPriestGroup: {
			min: 2,
			max: 4,
			npcTypes: [
				{name: 'OrcWarrior', 		percent: 50},
				{name: 'OrcArcher', 		percent: 50},
			],
			forceNPCTypes: ['OrcPriest'],
		},
		
		OrcPriestWolfGroup: {
			min: 3,
			max: 6,
			npcTypes: [
				{name: 'Wolf',				percent: 100},
			],
			forceNPCTypes: ['OrcPriest'],
		},
		
		OgreShamanGroup: {
			min: 2,
			max: 4,
			npcTypes: [
				{name: 'Ogre', 				percent: 100}
			],
			forceNPCTypes: ['OgreShaman'],
		},
		
		OgreShamanWolfGroup: {
			min: 3,
			max: 6,
			npcTypes: [
				{name: 'Wolf', 				percent: 100}
			],
			forceNPCTypes: ['OgreShaman'],
		},

		// THE_VAULT_OF_YENDOR:
		// ****************************************************************************************
		InfernoLichGroup: {
			min: 2,
			max: 4,
			npcTypes: [
				{name: 'OrcChaosKnight', 	percent: 75},
				{name: 'ArcaneArcher', 		percent: 25},
			],
			forceNPCTypes: ['InfernoLich'],
		},
		
		StormLichGroup: {
			min: 2,
			max: 4,
			npcTypes: [
				{name: 'OrcChaosKnight', 	percent: 75},
				{name: 'ArcaneArcher', 		percent: 25},
			],
			forceNPCTypes: ['StormLich'],
		},
		
		VaultChaosPriestGroup: {
			min: 2,
			max: 4,
			npcTypes: [
				{name: 'OrcChaosKnight', 	percent: 75},
				{name: 'ArcaneArcher', 		percent: 25},
			],
			forceNPCTypes: ['VaultChaosPriest'],
		},
		
		// THE_SUNLESS:
		// ****************************************************************************************
		MummyPriestGroup: {
			min: 2,
			max: 3,
			npcTypes: [
				{name: 'Mummy', 			percent: 100},
			],
			forceNPCTypes: ['MummyPriest'],
		},
		
		// THE_SEWERS:
		// ****************************************************************************************
		TrollShamanGroup: {
			min: 2,
			max: 3,
			npcTypes: [
				{name: 'TrollWarrior', 		percent: 50},
				{name: 'TrollArcher', 		percent: 50},
			],
			forceNPCTypes: ['TrollShaman'],
		},
		
		// THE_IRON_FORGE:
		// ****************************************************************************************
		MarkIIClockworkWarriorGroup: {
			min: 3,
			max: 6,
			npcTypes: [
				{name: 'ClockworkWarrior', 	percent: 75},
				{name: 'ClockworkArcher', 	percent: 25},
			],
			forceNPCTypes: ['MarkIIClockworkWarrior'],
		},
		
		MarkIIClockworkArcherGroup: {
			min: 3,
			max: 6,
			npcTypes: [
				{name: 'ClockworkArcher', 	percent: 100},
			],
			forceNPCTypes: ['MarkIIClockworkArcher'],
		},
		
		// THE_CRYPT_GROUPS:
		// ****************************************************************************************
		NecromancerGroup: {
			min: 2,
			max: 4,
			npcTypes: [
				{name: 'SkeletonWarrior', 	percent: 40},
				{name: 'SkeletonArcher', 	percent: 40},
				{name: 'Necromancer', 		percent: 20}
			],
			forceNPCTypes: ['Necromancer'],
		},
		
		PestilencePriestGroup1: {
			min: 4,
			max: 6,
			npcTypes: [
				{name: 'Maggot', 			percent: 90},
				{name: 'PestilencePriest', 	percent: 10},
			],
			forceNPCTypes: ['PestilencePriest'],
		},
		
		PestilencePriestGroup2: {
			min: 1,
			max: 2,
			npcTypes: [
				{name: 'FleshGolem', percent: 90},
				{name: 'PestilencePriest', 	percent: 10},
			],
			forceNPCTypes: ['PestilencePriest'],
		},
		
		TheSkeletalChampionGroup: {
			min: 3,
			max: 6,
			npcTypes: [
				{name: 'SkeletonWarrior', percent: 75},
				{name: 'SkeletonArcher', percent: 25},
			],
			forceNPCTypes: ['TheSkeletalChampion'],
		},
		
		TheTormentedMarksmanGroup: {
			min: 3,
			max: 6,
			npcTypes: [
				{name: 'SkeletonArcher', percent: 100},
			],
			forceNPCTypes: ['TheTormentedMarksman'],
		},
	};
	
	this.nameTypes(this.npcGroupTypes);
	
	// VERIFICATION:
	this.forEachType(this.npcGroupTypes, function (npcGroupType) {
		// Defaults:
		npcGroupType.forceNPCTypes = npcGroupType.forceNPCTypes || [];
		npcGroupType.npcTypes = npcGroupType.npcTypes || [];
		npcGroupType.spawnType = npcGroupType.spawnType || [SPAWN_TYPE.DEFAULT];
		
		// Verify forceNPCTypes:
		npcGroupType.forceNPCTypes.forEach(function (typeName) {
			if (!gs.npcTypes[typeName]) {
				throw 'VERIFICATION ERROR [createNPCGroupTypes] - invalid forceNPCType: ' + typeName;
			}
		}, this);
		
		
		// Verify npcTypes:
		npcGroupType.npcTypes.forEach(function (e) {
			if (!gs.npcTypes[e.name]) {
				throw 'VERIFICATION ERROR [createNPCGroupTypes] - invalid npcTypes: ' + e.name;
			}
		}, this);
		
	}, this);
};



