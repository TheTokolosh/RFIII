/*global game, gs, console, util*/
/*global FACTION, DAMAGE_TYPES, MAX_LEVEL, DAMAGE_TYPE*/
/*global NPC, NPC_INITIAL_HP, NPC_INITIAL_DAMAGE, NPC_DAMAGE_PER_LEVEL, NPC_HP_PER_LEVEL*/
/*global LOS_DISTANCE, ABILITY_RANGE, CHARACTER_SIZE*/
/*global SPAWN_TYPE, MOVEMENT_SPEED, ZONE_TIER*/
/*jshint white: true, laxbreak: true, esversion: 6*/
'use strict';



let SHOOT_ARROW = {
	niceName: 'Shoot Arrow',
	typeName: 'ProjectileAttack', 
	stats: {
		damage: 'MLOW', 
		coolDown: 2, 
		projectileTypeName: 'Dart',
		range: 5.0
	}
};

let FIRE_PROJECTILE = {
	niceName: 'Throw Fire',
	typeName: 'ProjectileAttack', 
	stats: {
		damage: 'MEDIUM', 
		coolDown: 4, 
		range: 4.0, 
		projectileTypeName: 'FireArrow', 
		shootEffect: 'FireShoot'
	}
};

let SHOCK_PROJECTILE = {
	niceName: 'Throw Spark',
	typeName: 'ProjectileAttack',
	stats: {
		damage: 'MEDIUM',
		coolDown: 4,
		range: 4.0,
		projectileTypeName: 'Spark',
		shootEffect: 'ElectricShoot'
	},
};

let COLD_PROJECTILE = {
	niceName: 'Throw Ice',
	typeName: 'ProjectileAttack', 
	stats: {
		damage: 'MEDIUM',
		coolDown: 4,
		range: 4.0,
		projectileTypeName: 'IceArrow', 
		shootEffect: 'ColdShoot'
	},
};

let POISON_PROJECTILE = {
	niceName: 'Poison Ball',
	typeName: 'ProjectileAttack',
	stats: {
		damage: 'HIGH',
		coolDown: 4,
		range: 4.0,
		projectileTypeName: 'PoisonArrow', 
		shootEffect: 'ToxicShoot'
	},
};

let ACID_PROJECTILE = {
	niceName: 'Shoot Acid',
	typeName: 'ProjectileAttack',
	stats: {
		damage: 'MEDIUM',
		coolDown: 4,
		range: 4.0,
		projectileTypeName: 'Acid',
		shootEffect: 'ToxicShoot'
	}
};

let MAGIC_PROJECTILE = {
	niceName: 'Magic Missile',
	typeName: 'ProjectileAttack',
	stats: {
		damage: 'MEDIUM',
		coolDown: 4,
		range: 4.0,
		projectileTypeName: 'MagicMissile', 
		shootEffect: 'MagicShoot'
	}
};

let ORB_OF_FIRE = {
	typeName: 'OrbOfFire', 
	stats: {
		damage: 'HIGH', 
		coolDown: 5, 
		mana: 0,
		isSpell: true,
	}
};

let LIGHTNING_BOLT = {
	typeName: 'LightningBolt',
	stats: {
		damage: 'MEDIUM', 
		coolDown: 5,
		range: 4.0,
		mana: 0,
		isSpell: true
	}	
};

let SHOCKING_GRASP = {
	typeName: 'ShockingGrasp',
	stats: {
		damage: 'MEDIUM',
		coolDown: 2,
	}
};

// EXTEND_NPC_TYPE:
// ************************************************************************************************
function extend (base, stats) {
	let newObj = {
		stats: {},
	};
	
	for (let key in base) {
		if (base.hasOwnProperty(key)) {
			
			if (key === 'stats') {
				for (let k in base.stats) {
					newObj.stats[k] = base.stats[k];
				}
			}
			else {
				newObj[key] = base[key];
			}
		}
	}
	
	for (let key in stats) {
		if (stats.hasOwnProperty(key)) {
			newObj.stats[key] = stats[key];
		}
	}
	
	return newObj;
}

// EXTEND_NPC_TYPE:
// ************************************************************************************************
function extendNPCType (base, extension) {
	let npcType = {};
	
	// Base:
	for (let key in base) {
		if (base.hasOwnProperty(key)) {
			npcType[key] = base[key];
		}
	}
	
	// Extension:
	for (let key in extension) {
		if (extension.hasOwnProperty(key)) {
			npcType[key] = extension[key];
		}
	}
	
	return npcType;
}

// NPC_TYPE_TEMPLATES:
// ************************************************************************************************
let SLIME = {
	// DEFENSE:
	resistance: {Toxic: 1},
	isGasImmune: true,
	isToxicWasteImmune: true,
	isPoisonImmune: true,
	canSwim: true,
	isUnstableImmune: true,
	
	// MISC:
	neverRun: true,
	canOpenDoors: false,
	noBlood: true,
};

let IMMOBILE = {
	// DEFENSE:
	isUnstableImmune: true,
	
	// MISC:
	movementSpeed: 'NONE',
	neverSleep: true,
	neverRun: true,
	noBlood: true,
	noRegen: true,
	spawnType: [SPAWN_TYPE.WIDE_OPEN],
};

var createNPCTypes = {};

// THE_UPPER_DUNGEON:
// ************************************************************************************************
createNPCTypes.TheUpperDungeon = function () {
	let _ = gs.npcTypes;
	
	// THE_UPPER_DUNGEON:
	// ****************************************************************************************
	_.Rat = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {baseDamage: 2}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'LOW',
		isRandomMover: true,
		size: CHARACTER_SIZE.SMALL,
		canOpenDoors: false,
	};

	_.Bat = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {baseDamage: 1}}
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		maxHp: 4,
		isRandomMover: true,
		isFlying: true,
		size: CHARACTER_SIZE.SMALL,
		canOpenDoors: false,
	};

	_.RatNest = extendNPCType(IMMOBILE, {
		abilityTypes: [
			{typeName: 'SpawnNPC', stats: {numSpawned: 1, coolDown: 5, npcTypeName: 'Rat'}}
		],
		hitPointType: 'MEDIUM',
		maxMp: 6,
		onSpawn: function () {
			gs.createVinePatch({x: this.tileIndex.x, y: this.tileIndex.y}, 2, 'Bones', 0.5);
		}
	});

	_.GoblinWarrior = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		size: CHARACTER_SIZE.SMALL,
	};

	_.GoblinArcher = {
		abilityTypes: [
			SHOOT_ARROW,
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		size: CHARACTER_SIZE.SMALL,
	};

	_.GoblinBrute = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MHIGH'}},
			{typeName: 'NPCBerserk', stats: {coolDown: 100, mana: 0}}
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
	};

	_.GoblinSlaver = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'WhipAttack', stats: {damage: 'MLOW', coolDown: 1}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		size: CHARACTER_SIZE.SMALL,
	};

	_.GoblinFireMage = {
		abilityTypes: [
			FIRE_PROJECTILE,
			ORB_OF_FIRE,
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		size: CHARACTER_SIZE.SMALL,
	};

	_.GoblinStormMage = {
		abilityTypes: [
			SHOCKING_GRASP,
			{typeName: 'OrbOfStorm', stats: {coolDown: 20}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		size: CHARACTER_SIZE.SMALL,
	};

	_.Centipede = {
		abilityTypes: [
			{typeName: 'PoisonAttack', stats: {damage: 'MEDIUM'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		size: CHARACTER_SIZE.SMALL,
		canOpenDoors: false,
	};

	_.GoblinShaman = {
		abilityTypes: [
			COLD_PROJECTILE,
			{typeName: 'Heal', stats: {coolDown: 5, healPercent: 0.5}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		size: CHARACTER_SIZE.SMALL,
	};

	_.CaveBear = {
		abilityTypes: [
			{typeName: 'MeleeAttack', 	stats: {damage: 'MHIGH'}},
			{typeName: 'NPCBerserk', 		stats: {coolDown: 100, mana: 0}}
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		size: CHARACTER_SIZE.LARGE,
		canOpenDoors: false,
	};


	// THE_UPPER_DUNGEON_UNIQUES:
	// ****************************************************************************************
	_.TheVampireBat = {
		abilityTypes: [
			{typeName: 'VampireAttack', stats: {damage: 'MEDIUM'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		isRandomMover: true,
		isFlying: true,
		isBoss: true,
		size: CHARACTER_SIZE.SMALL,
		canOpenDoors: false,
		dropTable: [
			{name: 'RingOfTheVampire', percent: 100}
		]
	};

	_.TheRatPiper = {
		abilityTypes: [
			SHOOT_ARROW,
			{typeName: 'SummonMonsters', 	stats: {npcTypeName: 'Rat', num: 3, coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		isBoss: true,
		dropTable: [
			{name: 'FluteOfTheScavengers', percent: 100}
		]
	};
	
	_.TheAncientCaveBear = {
		abilityTypes: [
			{typeName: 'MeleeAttack', 		stats: {damage: 'MHIGH'}},
			{typeName: 'NPCBerserk', 		stats: {coolDown: 100, mana: 0}}
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'MHIGH',
		size: CHARACTER_SIZE.LARGE,
		canOpenDoors: false,
		isBoss: true,
		dropTable: [
			{name: 'BearHideCloak', percent: 100}
		]
	};
    
    _.ArgoxTheWarlord = {
        abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MHIGH'}},
			{typeName: 'Recovery', stats: {coolDown: 50}},
            {typeName: 'BlinkAlly', stats: {coolDown: 5}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'HIGH',
        isBoss: true,
        dropTable: [
            {name: 'GoblinWarShield', percent: 100},
        ]
        
    };

	_.UmbraTheHighShaman = {
		abilityTypes: [
			extend(COLD_PROJECTILE, {coolDown: 2, range: 6.0}),
			{typeName: 'Heal', 	stats: {coolDown: 3, healPercent: 0.50}},
			{typeName: 'Haste', stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		size: CHARACTER_SIZE.SMALL,
		isBoss: true,
		dropTable: [
			{name: 'MysticSkullHelm', percent: 100}
		]
	};

	_.BlastoTheArchMagi = {
		abilityTypes: [
            MAGIC_PROJECTILE,
            {typeName: 'SummonMonsters', stats: {npcTypeName: 'SpectralBlade', num: 1, coolDown: 4}},
        ],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		isBoss: true,
		size: CHARACTER_SIZE.SMALL,
		dropTable: [
			{name: 'GoblinBattleStaff', percent: 80},
			{name: 'TotemOfIntelligence', percent: 20},
		]
	};
	
	_.BojackTheBerserker = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MHIGH'}},
			{typeName: 'WarCry', stats: {coolDown: 10}},
			{typeName: 'NPCBerserk', stats: {coolDown: 100, mana: 0}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
        isBoss: true,
        dropTable: [
            {name: 'BloodStainedAxe', percent: 80},
			{name: 'TotemOfStrength', percent: 20},
        ]
	};
	
	_.ArgylTheSwift = {
		abilityTypes: [
			SHOOT_ARROW,
			{typeName: 'ArcaneArrow', stats: {damage: 'MHIGH', cooldown: 5}},
			{typeName: 'Haste', stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'MLOW',
		minRange: 3,
		size: CHARACTER_SIZE.SMALL,
		isBoss: true,
		dropTable: [
            {name: 'GoblinSwiftBow', percent: 80},
			{name: 'TotemOfDexterity', percent: 20},
        ]
	};
	

};

// THE_ORC_FORTRESS:
// ************************************************************************************************
createNPCTypes.TheOrcFortress = function () {
	let _ = gs.npcTypes;
	_.Wolf = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'LOW'}},
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'LOW',
		canOpenDoors: false,
	};

	_.WolfKennel = extendNPCType(IMMOBILE, {
		abilityTypes: [
			{typeName: 'SpawnNPC', stats: {numSpawned: 3, coolDown: 6, npcTypeName: 'Wolf'}}
		],
		hitPointType: 'MEDIUM',
		maxMp: 3,
	});

	_.OrcWarrior = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
	};

	_.OrcArcher = {
		abilityTypes: [
			SHOOT_ARROW,
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};

	_.OrcBerserker = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'NPCShortBerserk', stats: {duration: 5, coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
	};

	_.OrcPyromancer = {
		abilityTypes: [
			FIRE_PROJECTILE,
			ORB_OF_FIRE,
			{typeName: 'NPCFireStorm', stats: {damage: 'HIGH', coolDown: 20, mana: 0}},
			{typeName: 'NPCWallOfFire', stats: {damage: 'MEDIUM', coolDown: 10, mana: 0}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};

	_.OrcCryomancer = {
		abilityTypes: [
			COLD_PROJECTILE,
			{typeName: 'NPCFreezingCloud', stats: {damage: 'MEDIUM', coolDown: 10, mana: 0}},
			{typeName: 'SummonIceBomb', stats: {damage: 'HIGH', coolDown: 15}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};

	_.OrcSlaver = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'WhipAttack', stats: {damage: 'MLOW', coolDown: 1}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
	};
	

	_.Ogre = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MHIGH'}},
			{typeName: 'NPCBerserk', stats: {coolDown: 100, mana: 0}}
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		size: CHARACTER_SIZE.LARGE,
	};
		
	_.OrcPriest = {
		abilityTypes: [
			{typeName: 'Smite', stats: {damage: 30, coolDown: 3}},
			{typeName: 'Heal', stats: {coolDown: 3, healPercent: 0.5}},
			{typeName: 'Haste', stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};


	_.OrcChaosKnight = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		resistance: {Physical: 1},
	};
	
	_.Minotaur = {
		abilityTypes: [
			{typeName: 'Trample', 	stats: {damage: 'MEDIUM'}},
			{typeName: 'SlowCharge', 		stats: {damage: 'HIGH'}},
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		size: CHARACTER_SIZE.LARGE
	};
	
	_.OgreShaman = {
		abilityTypes: [
			COLD_PROJECTILE,
			{typeName: 'Heal', stats: {coolDown: 3, healPercent: 0.5}},
			{typeName: 'Haste', stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'MEDIUM',
		minRange: 3,
		size: CHARACTER_SIZE.LARGE,
	};
	
	_.Ballista = extendNPCType(IMMOBILE, {
		abilityTypes: [
			{typeName: 'RotateProjectileAttack', stats: {damage: 'MHIGH', range: 7.0, coolDown: 2, projectileTypeName: 'Dart'}}
		],
		hitPointType: 'MEDIUM',
		dontFace: true,
		bloodTypeName: 'Oil',
		rotateAim: true,
	});
	
	// THE_ORC_FORTRESS - MAJOR_BOSSES:
	// ************************************************************************************************
	_.KingMonRacar = {
		niceName: "Mon'Racar The Orc King",
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MHIGH'}},
			{typeName: 'BlinkAlly', stats: {coolDown: 5}},
			{typeName: 'NPCBerserk', stats: {coolDown: 100, mana: 0}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'HIGH',
		resistance: {Physical: 1},
		size: CHARACTER_SIZE.LARGE,
		isBoss: true,
		dropTable: [
			{name: 'CrownOfPower', percent: 100},
		]
	};
	
	_.ManfridTheMinotaurKing = {
		abilityTypes: [
			{typeName: 'Trample', 		stats: {damage: 'MHIGH'}},
			{typeName: 'SlowCharge', 	stats: {coolDown: 10, damage: 'HIGH'}},
			{typeName: 'WarCry', 		stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'HIGH',
		size: CHARACTER_SIZE.LARGE,
		isBoss: true,
		dropTable: [
			{name: 'HammerOfCrushing', percent: 100},
		]
	};
	
	_.ThurgTheHighShaman = {
		abilityTypes: [
			extend(COLD_PROJECTILE, {coolDown: 1}),
			{typeName: 'GroupHeal', stats: {coolDown: 5, healPercent: 0.5}},
			{typeName: 'SummonMonsters', 	stats: {npcTypeName: 'Wolf', num: 2, coolDown: 5}},
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		minRange: 3,
		size: CHARACTER_SIZE.LARGE,
		resistance: {Cold: 1},
		isBoss: true,
		dropTable: [
			{name: 'TotemOfTheBeasts', percent: 100},
		]
	};
	
	// THE_ORC_FORTRESS - MINOR_BOSSES:
	// ************************************************************************************************
	_.TheArcheryCaptain = {
		abilityTypes: [
			extend(SHOOT_ARROW, {coolDown: 1}),
			{typeName: 'NPCDiscord', stats: {damage: 'MEDIUM', duration: 5, coolDown: 10, mana: 0}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		isBoss: true,
		dropTable: [
			{name: 'CompoundBow', percent: 100},
		]
	};

	_.TheCrystalCaptain = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MHIGH'}},
			{typeName: 'NPCBerserk', stats: {coolDown: 100, mana: 0}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'HIGH',
		resistance: {Physical: 1},
		reflection: 0.75,
		dropTable: [
			{name: 'CrystalArmor', percent: 40},
			{name: 'ShieldOfReflection', percent: 40},
			{name: 'RingOfReflection', percent: 20}
		],
		isBoss: true,
	};
};

// THE_SUNLESS_DESERT:
// ****************************************************************************************
createNPCTypes.TheSunlessDesert = function () {
	let _ = gs.npcTypes;
	
	_.Scarab = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'LOW'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		maxHp: 12,
		isRandomMover: true,
		size: CHARACTER_SIZE.SMALL,
		canOpenDoors: false,
	};
	
	_.ScarabUrn = extendNPCType(IMMOBILE, {
		abilityTypes: [
			{typeName: 'SpawnNPC', stats: {numSpawned: 2, coolDown: 6, npcTypeName: 'Scarab'}}
		],
		hitPointType: 'MEDIUM',
		maxMp: 3,
	});

	_.SpittingViper = {
		abilityTypes: [
			extend(ACID_PROJECTILE, {range: 5.0})
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		resistance: {Cold: -1},
		canOpenDoors: false,
	};

	_.TrapDoorSpider = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		neverWander: true,
		startHidden: true,
		ambushDistance: 3,
		neverRespondToShout: true,
		canOpenDoors: false,
	};

	_.Scorpion = {
		abilityTypes: [
			{typeName: 'PoisonAttack', stats: {damage: 'MEDIUM'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		canOpenDoors: false,
	};

	_.SunFlower = extendNPCType(IMMOBILE, {
		abilityTypes: [
			extend(FIRE_PROJECTILE, {range: 7.0, coolDown: 1}),
			{typeName: 'NPCWallOfFire', stats: {damage: 'MEDIUM', coolDown: 10, mana: 0, isSpell: false}}
		],
		hitPointType: 'MEDIUM',
		resistance: {Fire: 1, Cold: -1},
		noBlood: true,
	});

	_.Goat = {
		abilityTypes: [
			{typeName: 'Trample', 	stats: {damage: 'MEDIUM'}},
			{typeName: 'SlowCharge', 		stats: {damage: 'HIGH'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		canOpenDoors: false,
	};

	_.Mummy = {
		abilityTypes: [
			{typeName: 'DrainingAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'NPCBerserk', stats: {coolDown: 100, mana: 0}}
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		resistance: {Fire: -1},
		neverRun: true,
		neverSleep: true,
		noBlood: true,

	};

	_.MummyPriest = {
		abilityTypes: [
			{typeName: 'Smite', stats: {damage: 'HIGH', coolDown: 4}},
			{typeName: 'Heal', stats: {coolDown: 3, healPercent: 0.5}},
			{typeName: 'Haste', stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'MLOW',
		minRange: 3,
		resistance: {Fire: -1},
		neverRun: true,
		neverSleep: true,
		noBlood: true,
	};

	_.DervishRaider = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
	};

	_.DervishArcher = {
		abilityTypes: [
			SHOOT_ARROW,
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};

	_.DervishMagi = {
		abilityTypes: [
			MAGIC_PROJECTILE,
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'SpectralBlade', num: 3, coolDown: 12}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};

	
	// THE_SUNLESS_DESERT - BOSSES:
	// ************************************************************************************************
	_.CylomarTheAncientPyromancer = {
		abilityTypes: [
			extend(FIRE_PROJECTILE, {coolDown: 2, range: 6.0}),
			{typeName: 'NPCFireStorm', stats: {damage: 'HIGH', coolDown: 20, mana: 0}},
			{typeName: 'NPCWallOfFire', stats: {damage: 'MEDIUM', coolDown: 10, mana: 0}}
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'MEDIUM',
		minRange: 3,
		resistance: {Fire: -1},
		isBoss: true,
		dropTable: [
			{name: 'RobeOfFlames', percent: 100}
		]
	};
	
	_.KingUrazzoTheAncient = {
		abilityTypes: [
			extend(FIRE_PROJECTILE, {coolDown: 2, range: 6.0}),
			{typeName: 'SandBlast', stats: {damage: 'MEDIUM', coolDown: 10, mana: 0}},
			{typeName: 'NPCWallOfFire', stats: {damage: 'MEDIUM', coolDown: 10, mana: 0}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		resistance: {Fire: -1},
		isBoss: true,
		dropTable: [
			{name: 'RingOfSpiritShielding', percent: 100}
		]
	};

	_.TheKingOfThieves = {
		abilityTypes: [
			{typeName: 'PoisonAttack', stats: {damage: 'MEDIUM'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		isBoss: true,
		dropTable: [
			{name: 'BootsOfTheSilentSands', percent: 100}
		]
	};
	
	_.SynaxTheSnakeCharmer = {
		abilityTypes: [
			{typeName: 'PoisonAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'SummonMonsters', 	stats: {npcTypeName: 'PoisonViper', num: 1, coolDown: 5}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		isBoss: true,
		dropTable: [
			{name: 'SerpentFangDagger', percent: 100}
		]
	};
};

// VAULT_OF_YENDOR:
// ************************************************************************************************
createNPCTypes.TheVaultOfYendor = function () {
	let _ = gs.npcTypes;
	
	_.HellHound = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'LOW', damageType: DAMAGE_TYPE.FIRE}},
			//{typeName: 'MeleeSurroundBlink', stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'LOW',
		isFlamingCloudImmune: true,
		resistance: {Fire: 1},
		canOpenDoors: false,
		isLavaImmune: true,
	};
	
	_.HellGate = extendNPCType(IMMOBILE, {
		abilityTypes: [
			{typeName: 'SpawnNPC', stats: {numSpawned: 3, coolDown: 5, npcTypeName: 'HellHound'}}
		],
		hitPointType: 'MEDIUM',
		maxMp: 4,
	});

	_.KnightOfYendor = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		resistance: {Physical: 1},
	};
	
	_.DeathWatchArcher = {
		abilityTypes: [
			extend(SHOOT_ARROW, {range: 7.0, coolDown: 1}),
			{typeName: 'SinglePoisonArrow', stats: {damage: 60, cooldown: 5}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};
	
	_.BladeDancer = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'SpectralBlade', num: 2, coolDown: 5}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		reposteAttacks: true
	};
	
	_.Demotaur = {
		abilityTypes: [
			{typeName: 'Trample', 	stats: {damage: 'MEDIUM'}},
			{typeName: 'SlowCharge', 		stats: {damage: 'HIGH'}},
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		size: CHARACTER_SIZE.LARGE
	};
	
	_.CrystalGolem = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MHIGH'}},
			{typeName: 'Constrict', stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		resistance: {Physical: 1},
		
		noBlood: true,
		noRegen: true,
		reflection: 0.75,
		neverSleep: true,
		size: CHARACTER_SIZE.LARGE,
	};
	
	
	_.IndigoSlime = extendNPCType(SLIME, {
		abilityTypes: [
			{typeName: 'ManaDrainAttack', stats: {damage: 'MEDIUM'}},
		],
		hitPointType: 'MEDIUM',
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		onHit: this.npcOnHit.SlimeSplit,
		damageShield: {Toxic: 'LOW'},
		noRegen: true,
	});
	
	_.FrostLich = {
		abilityTypes: [
			COLD_PROJECTILE,
			{typeName: 'SummonIceBomb', stats: {damage: 'HIGH', coolDown: 10}},
			{typeName: 'ReviveSkeleton', stats: {coolDown: 4}}
		],
		resistance: {Cold: 1},
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		onDeath: {typeName: 'SkeletonCorpse'},
		noBlood: true,
	};

	_.InfernoLich = {
		abilityTypes: [
			FIRE_PROJECTILE,
			ORB_OF_FIRE,
			{typeName: 'ReviveSkeleton', stats: {coolDown: 4}}
		],
		resistance: {Fire: 1},
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		onDeath: {typeName: 'SkeletonCorpse'},
		noBlood: true,
	};
	
	_.StormLich = {
		abilityTypes: [
			SHOCK_PROJECTILE,
			{typeName: 'SummonTornado', stats: {damage: 'MHIGH', coolDown: 5}},
			{typeName: 'ReviveSkeleton', stats: {coolDown: 4}}
		],
		resistance: {Shock: 1},
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		onDeath: {typeName: 'SkeletonCorpse'},
		noBlood: true,
	};
	
	_.ToxicLich = {
		abilityTypes: [
			POISON_PROJECTILE,
			{typeName: 'NPCPoisonCloud', stats: {damage: 'MLOW', coolDown: 10}},
			{typeName: 'ReviveSkeleton', stats: {coolDown: 4}}
		],
		resistance: {Toxic: 1},
		isGasImmune: true,
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		onDeath: {typeName: 'SkeletonCorpse'},
		noBlood: true,
	};
	
	_.VaultChaosPriest = {
		abilityTypes: [
				{typeName: 'Smite', stats: {damage: 40, coolDown: 2}},
				{typeName: 'Torment', stats: {coolDown: 10}},
				{typeName: 'GroupHeal', stats: {coolDown: 5, healPercent: 0.5}},
			],
			movementSpeed: MOVEMENT_SPEED.NORMAL,
			hitPointType: 'MLOW',
			minRange: 3,
	};
	
	_.TentacleTerror = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'TonguePull', stats: {coolDown: 10, tongueFrame: 1746}, niceName: 'Tentacle Pull'},
			{typeName: 'Constrict', stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		size: CHARACTER_SIZE.LARGE,
	};

	_.Succubus = {
		abilityTypes: [
			{typeName: 'VampireAttack', stats: {damage: 'MEDIUM', healPercent: 1.0}},
			{typeName: 'NPCDiscord', stats: {damage: 'MEDIUM', duration: 5, coolDown: 10, mana: 0}},
			{typeName: 'NPCCharm', stats: {coolDown: 20}},

		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
	};
	
	_.GuardianStatue = extendNPCType(IMMOBILE, {
		abilityTypes: [
			extend(MAGIC_PROJECTILE, {range: 7.0, coolDown: 3}),
			{typeName: 'WallOfForce', stats: {coolDown: 10}},
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'SpectralBlade', num: 3, coolDown: 3}},
		],
		hitPointType: 'MEDIUM',
		resistance: {Physical: 1},
	});
	
	// THE_VAULT_OF_YENDOR_UNIQUES:
	// ************************************************************************************
	let THE_WIZARD_YENDOR = {
		niceName: 'The Wizard Yendor',
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		maxHp: 500,
		minRange: 3,
		isBoss: true,
		neverRun: true,
		isDominateImmune: true,
		isFlying: true,
		size: CHARACTER_SIZE.LARGE,
		noRegen: true,
	};
	
	_.TheWizardYendorFire = extendNPCType(THE_WIZARD_YENDOR, {
		abilityTypes: [
			extend(FIRE_PROJECTILE, {coolDown: 0, range: 7.0}),
			extend(ORB_OF_FIRE, {coolDown: 0}),
			{typeName: 'NPCWallOfFire', stats: {damage: 'MEDIUM', coolDown: 10, mana: 0}},
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'FlameVortex', num: 6, summonDuration: 5, coolDown: 10}},
			
			// Transform:
			{typeName: 'EscapeBlink', stats: {maxDistance: 5, coolDown: 10}},
		],
		
		resistance: {Fire: 1},
		isFlamingCloudImmune: true,
	});

	_.TheWizardYendorStorm = extendNPCType(THE_WIZARD_YENDOR, {
		abilityTypes: [
			extend(SHOCK_PROJECTILE, {coolDown: 0, range: 7.0}),
			{typeName: 'SummonTornado', stats: {damage: 'MHIGH', coolDown: 5}},
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'StormVortex', num: 6, summonDuration: 5, coolDown: 10}},
			
			// Transform:
			{typeName: 'EscapeBlink', stats: {maxDistance: 5, coolDown: 10}},
		],
		
		resistance: {Shock: 1},
	});
	
	// Ice-Yendor spawns with a lot of melee allies (typically ice giants).
	// He is a healer and will support his allies in combat
	_.TheWizardYendorIce = extendNPCType(THE_WIZARD_YENDOR, {
		abilityTypes: [
			extend(COLD_PROJECTILE, {coolDown: 0, range: 7.0}),
			{typeName: 'Heal', stats: {coolDown: 5, healPercent: 1.0}},
			{typeName: 'BlinkAlly', stats: {coolDown: 5}},
			{typeName: 'NPCFreezingCloud', stats: {damage: 'MEDIUM', coolDown: 5, mana: 0}},
			
			// Transform:
			{typeName: 'EscapeBlink', stats: {maxDistance: 5, coolDown: 10}},
		],
		
		resistance: {Cold: 1},
	});
	
	// Toxic-Yendor spawns with a lot of slimes and with levels filled with toxic waste.
	// His slimes are quite dangerous and will quickly fill the level so his attacks are mostly avoidable.
	_.TheWizardYendorToxic = extendNPCType(THE_WIZARD_YENDOR, {
		abilityTypes: [
			extend(ACID_PROJECTILE, {coolDown: 0, range: 7.0}),
			{typeName: 'SinglePoisonArrow', stats: {damage: 80, cooldown: 5}},
			{typeName: 'NPCPoisonCloud', stats: {damage: 'MEDIUM', coolDown: 5}},
			{typeName: 'SummonTentacleSpitters', stats: {coolDown: 5}},
			
			// Transform:
			{typeName: 'EscapeBlink', stats: {maxDistance: 5, coolDown: 10}},
		],

		resistance: {Toxic: 1},
		isGasImmune: true,
	});
	
	_.TheWizardYendorMagic = extendNPCType(THE_WIZARD_YENDOR, {
		abilityTypes: [
			extend(MAGIC_PROJECTILE, {coolDown: 0, range: 7.0}),
			{typeName: 'FieldOfForce', stats: {coolDown: 3}},
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'SpectralBlade', num: 6, coolDown: 10}},
			{typeName: 'SummonBattleSphere', stats: {npcTypeName: 'ArcaneBattleSphere', coolDown: 5}},
			
			
			// Transform:
			{typeName: 'EscapeBlink', stats: {maxDistance: 5, coolDown: 10}},
		],
	});
	
	_.GobletShield = {
		faction: FACTION.HOSTILE,
		maxHp: 100,
		movementSpeed: 'NONE',
		isGasImmune: true,
		isPoisonImmune: true,
		noRegen: true,
		onDeath: {typeName: 'BreakGobletShield'},
	};
};

// THE_IRON_FORGE:
// ****************************************************************************************
createNPCTypes.TheIronForge = function () {
	let _ = gs.npcTypes;
	
	_.ClockworkRat = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'LOW'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'LOW',
		resistance: {Physical: 1, Fire: 1},
		isRandomMover: true,
		size: CHARACTER_SIZE.SMALL,
		canOpenDoors: false,
		
		// Clockwork:
		noRegen: true,
		neverRun: true,
		neverSleep: true,
		bloodTypeName: 'Oil',
		isLavaImmune: true,
	};
	
	_.ClockworkFactory = extendNPCType(IMMOBILE, {
		abilityTypes: [
			{typeName: 'SpawnNPC', stats: {numSpawned: 3, coolDown: 5, npcTypeName: 'ClockworkRat'}}
		],
		hitPointType: 'MEDIUM',
		resistance: {Physical: 1, Fire: 1},
		maxMp: 3,
	});

	_.Bombomber = {
		abilityTypes: [
			{typeName: 'Suicide'}
		],
		onDeath: {typeName: 'Explode', stats: {damage: 'HIGH'}},
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		maxHp: 15,
		resistance: {Fire: 1},
		noBlood: true,
		size: CHARACTER_SIZE.SMALL,
		canOpenDoors: false,
		
		// Clockwork:
		noRegen: true,
		neverRun: true,
		neverSleep: true,
		bloodTypeName: 'Oil',
		isLavaImmune: true,
	};

	_.ClockworkWarrior = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		resistance: {Physical: 1, Fire: 1},
		
		// Clockwork:
		noRegen: true,
		neverRun: true,
		neverSleep: true,
		bloodTypeName: 'Oil',
		isLavaImmune: true,
	};

	_.ClockworkArcher = {
		abilityTypes: [
			{typeName: 'ProjectileAttack', stats: {damage: 'MLOW', coolDown: 2, projectileTypeName: 'Dart', range: 6.0}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		resistance: {Physical: 1, Fire: 1},
		minRange: 3,
		
		// Clockwork:
		noRegen: true,
		neverRun: true,
		neverSleep: true,
		bloodTypeName: 'Oil',
		isLavaImmune: true,
	};

	_.ClockworkBomber = {
		abilityTypes: [
			{typeName: 'ProjectileAttack', stats: {damage: 'MLOW', coolDown: 2, projectileTypeName: 'KnockBackCannonBall', range: 6.0}},
			{typeName: 'ThrowBomb', stats: {damage: 'HIGH', coolDown: 1, range: 5}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		resistance: {Physical: 1, Fire: 1},
		
		// Clockwork:
		noRegen: true,
		neverRun: true,
		neverSleep: true,
		bloodTypeName: 'Oil',
		isLavaImmune: true,
	};

	_.ClockworkPyro = {
		abilityTypes: [
			extend(FIRE_PROJECTILE, {coolDown: 0, range: 7.0}),
			{typeName: 'ProjectileAttack', stats: {coolDown: 5, projectileTypeName: 'Oil'}, niceName: 'Throw Oil'},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		resistance: {Physical: 1, Fire: 1},
		minRange: 3,

		// Clockwork:
		noRegen: true,
		neverRun: true,
		neverSleep: true,
		bloodTypeName: 'Oil',
		isLavaImmune: true,
	};

	_.ClockworkKnight = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'NPCShieldsUp', stats: {coolDown: 5}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MHIGH',
		resistance: {Physical: 1, Fire: 1},

		// Clockwork:
		noRegen: true,
		neverRun: true,
		neverSleep: true,
		bloodTypeName: 'Oil',
		isLavaImmune: true,
	};
	
	_.ClockworkRhino = {
		abilityTypes: [
			{typeName: 'Trample', stats: {damage: 'MEDIUM'}},
			{typeName: 'SlowCharge', stats: {damage: 'HIGH'}}
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		resistance: {Physical: 1, Fire: 1},
		size: CHARACTER_SIZE.LARGE,
		canOpenDoors: false,
	
		// Clockwork:
		noRegen: true,
		neverRun: true,
		neverSleep: true,
		bloodTypeName: 'Oil',
		isLavaImmune: true,
	};
	
	_.CannonTurret = extendNPCType(IMMOBILE, {
		abilityTypes: [
			{typeName: 'RotateProjectileAttack', stats: {damage: 'MEDIUM', range: 7.5, coolDown: 1, projectileTypeName: 'KnockBackCannonBall'}, niceName: 'Cannon Shot'},
			{typeName: 'ThrowBomb', stats: {damage: 'HIGH', coolDown: 3, range: 7.0}}
		],
		hitPointType: 'MHIGH',
		resistance: {Physical: 1, Fire: 1},
		
		dontFace: true,
		bloodTypeName: 'Oil',
		rotateAim: true,
	});
	
	_.PyroTurret = extendNPCType(IMMOBILE, {
		abilityTypes: [
			extend(FIRE_PROJECTILE, {damage: 'MEDIUM', range: 7.5, coolDown: 1}),
			{typeName: 'FlamingCloudBolt', stats: {damage: 'MLOW', coolDown: 3, cloudDuration: 2, range: 7.0, isSpell: false}},
		],
		hitPointType: 'MHIGH',
		resistance: {Physical: 1, Fire: 1},
		
		dontFace: true,
		bloodTypeName: 'Oil',
		rotateAim: true,
	});

	_.WarEngine = {
		abilityTypes: [
			{typeName: 'ProjectileAttack', stats: {damage: 'MEDIUM', coolDown: 3, range: 7.0, projectileTypeName: 'ExplosiveCannonBall'}},
			extend(ORB_OF_FIRE, {isSpell: false}),
		],
		movementSpeed: 'NONE',
		hitPointType: 'MHIGH',
		resistance: {Physical: 1, Fire: 1},
		dontFace: true,
		neverRun: true,
		bloodTypeName: 'Oil',
		noRegen: true,
		neverSleep: true,
		rotateAim: true,
		isLavaImmune: true,
		isUnstableImmune: true,
		updateTurn: this.npcUpdateTurn.FollowTrainTracks,
	};
	
	// THE_IRON_FORGE_UNIQUES:
	_.TheForgeMaster = extendNPCType(IMMOBILE, {
		abilityTypes: [
			{typeName: 'SpawnClockworks', stats: {coolDown: 10}},
			{typeName: 'ActivateTurrets', stats: {coolDown: 25}},
		],
		resistance: {Physical: 1, Fire: 1},
		hitPointType: 'HIGH',
		isBoss: true,
		onDeath: {typeName: 'OpenLockedGate'},
		onDominate: {typeName: 'OpenLockedGate'},
	});
	
	_.MarkIIClockworkWarrior = {
		niceName: "Mark II Clockwork Warrior",
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		resistance: {Physical: 1, Fire: 1},
		neverRun: true,
		bloodTypeName: 'Oil',
		noRegen: true,
		neverSleep: true,
		isBoss: true,
		dropTable: [
			{name: 'HeavyBrassArmor',		percent: 25},
			{name: 'HeavyBrassHelm',		percent: 25},
			{name: 'HeavyBrassGauntlets',	percent: 25},
			{name: 'HeavyBrassBoots',		percent: 25},
		]
	};

	_.MarkIIClockworkArcher = {
		niceName: "Mark II Clockwork Archer",
		abilityTypes: [
			{typeName: 'ProjectileAttack', stats: {damage: 'MLOW', coolDown: 2, projectileTypeName: 'Dart', range: 6.0}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		resistance: {Physical: 1, Fire: 1},
		minRange: 3,
		bloodTypeName: 'Oil',
		noRegen: true,
		neverSleep: true,
		isBoss: true,
		dropTable: [
			{name: 'ArcheryGoggles',		percent: 100}
		]
	};
	
	// CLOCK_WORK_WAR_TRAIN_MODULES:
	_.CannonModule = {
		abilityTypes: [
			{typeName: 'RotateProjectileAttack', stats: {damage: 'MEDIUM', range: 7.5, coolDown: 1, projectileTypeName: 'KnockBackCannonBall'}, niceName: 'Cannon Shot'},
			{typeName: 'ThrowBomb', stats: {damage: 'HIGH', coolDown: 3, range: 7.0}}
		],
		movementSpeed: 'NONE',
		hitPointType: 'MHIGH',
		resistance: {Physical: 1, Fire: 1},
		dontFace: true,
		neverRun: true,
		bloodTypeName: 'Oil',
		noRegen: true,
		isRepairable: true,
		neverSleep: true,
		isLavaImmune: true,
		isUnstableImmune: true,
		
		rotateAim: true,
		onDeath: {typeName: 'TrainModuleDeath'},
		//rotateAim: true,
		//updateTurn: this.npcUpdateTurn.FollowTrainTracks,
	};
	
	_.PyroModule = {
		abilityTypes: [
			extend(FIRE_PROJECTILE, {damage: 'MEDIUM', range: 7.5, coolDown: 1}),
			{typeName: 'FlamingCloudBolt', stats: {damage: 'MLOW', coolDown: 3, cloudDuration: 2, range: 7.0, isSpell: false}},
		],
		movementSpeed: 'NONE',
		hitPointType: 'MHIGH',
		resistance: {Physical: 1, Fire: 1},
		dontFace: true,
		neverRun: true,
		bloodTypeName: 'Oil',
		noRegen: true,
		isRepairable: true,
		neverSleep: true,
		isLavaImmune: true,
		isUnstableImmune: true,
		
		rotateAim: true,
		onDeath: {typeName: 'TrainModuleDeath'},
		//rotateAim: true,
		//updateTurn: this.npcUpdateTurn.FollowTrainTracks,
	};
	
	_.BombModule = {
		abilityTypes: [
			{typeName: 'SpawnNPC', stats: {numSpawned: 1, coolDown: 5, npcTypeName: 'Bombomber', mana: 0}}
		],
		movementSpeed: 'NONE',
		hitPointType: 'MHIGH',
		resistance: {Physical: 1, Fire: 1},
		dontFace: true,
		neverRun: true,
		bloodTypeName: 'Oil',
		noRegen: true,
		isRepairable: true,
		neverSleep: true,
		isLavaImmune: true,
		isUnstableImmune: true,
		
		onDeath: {typeName: 'TrainModuleDeath'},
		//rotateAim: true,
		//updateTurn: this.npcUpdateTurn.FollowTrainTracks,
	};
	
	_.RepairModule = {
		abilityTypes: [
			{typeName: 'Heal', stats: {coolDown: 3, healPercent: 0.50, casterText: 'Repairing', targetText: 'Repaired!'}}
		],
		movementSpeed: 'NONE',
		hitPointType: 'MHIGH',
		resistance: {Physical: 1, Fire: 1},
		dontFace: true,
		neverRun: true,
		bloodTypeName: 'Oil',
		noRegen: true,
		neverSleep: true,
		isLavaImmune: true,
		isUnstableImmune: true,
		
		onDeath: {typeName: 'TrainModuleDeath'},
		//rotateAim: true,
		//updateTurn: this.npcUpdateTurn.FollowTrainTracks,
	};
	
	_.ControlModule = {
		abilityTypes: [
		],
		movementSpeed: 'NONE',
		hitPointType: 'MHIGH',
		resistance: {Physical: 1, Fire: 1},
		dontFace: true,
		neverRun: true,
		bloodTypeName: 'Oil',
		noRegen: true,
		isRepairable: true,
		neverSleep: true,
		isLavaImmune: true,
		isUnstableImmune: true,
		isBoss: true,
		
		onDeath: {typeName: 'ControlModuleDeath'},
		
		//rotateAim: true,
		updateTurn: this.npcUpdateTurn.ControlModule,
	};
	
	_.CannonModuleDead = {
		niceName: 'Cannon Module',
		hitPointType: 'MHIGH',
		isDamageImmune: true,
		dontFace: true,
		movementSpeed: 'NONE',
		hideInterface: true,
		ignoreProjectiles: true,
	};
	
	_.PyroModuleDead = {
		niceName: 'Pyro Module',
		hitPointType: 'MHIGH',
		isDamageImmune: true,
		dontFace: true,
		movementSpeed: 'NONE',
		hideInterface: true,
		ignoreProjectiles: true,
	};
	
	_.RepairModuleDead = {
		niceName: 'Repair Module',
		hitPointType: 'MHIGH',
		isDamageImmune: true,
		dontFace: true,
		movementSpeed: 'NONE',
		hideInterface: true,
		ignoreProjectiles: true,
	};
	
	_.BombModuleDead = {
		niceName: 'Bomb Module',
		hitPointType: 'MHIGH',
		isDamageImmune: true,
		dontFace: true,
		movementSpeed: 'NONE',
		hideInterface: true,
		ignoreProjectiles: true,
	};
};

// THE_CRYPT:
// ****************************************************************************************
createNPCTypes.TheCrypt = function () {
	let _ = gs.npcTypes;
	
	_.Maggot = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 6}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'LOW',
		isGasImmune: true,
		isRandomMover: true,
		size: CHARACTER_SIZE.SMALL,
		isUnstableImmune: true,
		canOpenDoors: false,
	};

	_.RottingCorpse = extendNPCType(IMMOBILE, {
		abilityTypes: [
			{typeName: 'SpawnNPC', stats: {numSpawned: 3, coolDown: 5, npcTypeName: 'Maggot'}}
		],
		hitPointType: 'MEDIUM',
		maxMp: 3,
		noBlood: false,
		onSpawn: function () {
			gs.createVinePatch(this.tileIndex, 2, 'Blood', 0.5);
		},
	});
	
	_.CryptCrawler = {
		abilityTypes: [
			{typeName: 'PoisonAttack', stats: {damage: 'MEDIUM', poisonChance: 0.5, poisonDamage: 60}},
			{typeName: 'SpiderWeb',	stats: {coolDown: 10}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		isUnstableImmune: true,
		canOpenDoors: false,
	};

	_.SkeletonWarrior = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
		],
		onDeath: {typeName: 'SkeletonCorpse'},
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		noBlood: true,
		neverRun: true,
		noRegen: true,
		neverSleep: true,
		resistance: {Toxic: 1},
		statusEffectImmunities: ['InfectiousDisease'],
		isGasImmune: true,
	};

	_.SkeletonArcher = {
		abilityTypes: [
			SHOOT_ARROW,
			{typeName: 'SingleArcaneArrow', stats: {damage: 'MHIGH', cooldown: 5}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		onDeath: {typeName: 'SkeletonCorpse'},
		noBlood: true,
		neverRun: true,
		noRegen: true,
		neverSleep: true,
		resistance: {Toxic: 1},
		statusEffectImmunities: ['InfectiousDisease'],
		isGasImmune: true,
	};

	_.VampireBat = {
		abilityTypes: [
			{typeName: 'VampireAttack', stats: {damage: 'MEDIUM', healPercent: 1.0}}
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'LOW',
		isRandomMover: true,
		isFlying: true,
		size: CHARACTER_SIZE.SMALL,
		canOpenDoors: false,
	};

	_.ZombieBloat = {
		// Abilities:
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'PoisonCloudBolt', niceName: 'Belch Poison Cloud', stats: {damage: 'MEDIUM', coolDown: 4, isSpell: false}},
		],
		onDeath: {typeName: 'Bloat', stats: {damage: 'MEDIUM', maxSpread: 2}},
		
		// Basic Attributes:
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		
		// Special Attributes:
		neverRun: true,
		noRegen: true,
		neverSleep: true,
		resistance: {Toxic: 1},
		isGasImmune: true,
		isToxicWasteImmune: true,
	};

	_.Wraith = {
		abilityTypes: [
			{typeName: 'VampireAttack', stats: {damage: 'MEDIUM', healPercent: 1.0}},
			{typeName: 'MeleeSurroundBlink', stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'LOW',
		noBlood: true,
		neverRun: true,
		noRegen: true,
		neverSleep: true,
		isGasImmune: true,
	};
	
	_.Necromancer = {
		abilityTypes: [
			POISON_PROJECTILE,
			{typeName: 'SummonBoneBomb', stats: {damage: 'HIGH', coolDown: 10}},
			{typeName: 'ReviveSkeleton', stats: {coolDown: 5}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		resistance: {Toxic: 1},
	};

	_.PestilencePriest = {
		abilityTypes: [
			POISON_PROJECTILE,
			{typeName: 'NPCPoisonCloud', stats: {damage: 'MLOW', coolDown: 10}},
			{typeName: 'SummonMonsters', 	stats: {npcTypeName: 'Maggot', num: 4, coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		resistance: {Toxic: 1},
		isGasImmune: true,
	};
	
	_.FleshGolem = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MHIGH'}},
			{typeName: 'Constrict', stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		resistance: {Toxic: 1},
		isGasImmune: true,
		neverSleep: true,
		onHit: this.npcOnHit.Bleed,
		noRegen: true,
		size: CHARACTER_SIZE.LARGE,
	};
	
	_.BoneVortex = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM', damageType: DAMAGE_TYPE.PHYSICAL}},
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'MLOW',
		damageShield: {Physical: 'MLOW'},
		isFlying: true,
		canOpenDoors: false,
		bloodTypeName: 'Bones',
		neverRun: true,
	};


	// THE_CRYPT_UNIQUE_NPCS:
	// ****************************************************************************************
	_.TheLichKing = {
		abilityTypes: [
			ACID_PROJECTILE,
			{typeName: 'NPCPoisonCloud', stats: {damage: 'MLOW', coolDown: 10}},
			{typeName: 'EscapeBlink', stats: {maxDistance: 10, coolDown: 10}},
			{typeName: 'RaiseDead', stats: {coolDown: 5}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		minRange: 3,
		isBoss: true,
		neverRun: true,
		resistance: {Toxic: 1},
		statusEffectImmunities: ['InfectiousDisease'],
		isGasImmune: true,
		onDeath: {typeName: 'OpenLockedGate'},
		onDominate: {typeName: 'OpenLockedGate'},
		dropTable: [
			{name: 'ScythOfReaping', percent: 100},
		]
	};
	
	_.TheVampireLord = {
		abilityTypes: [
			{typeName: 'VampireAttack', stats: {damage: 'MEDIUM', healPercent: 1.0}},
			{typeName: 'LifeSpike', stats: {damage: 'LOW', mana: 0, coolDown: 10}},
			{typeName: 'BatForm'}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MHIGH',
		neverRun: true,
		isBoss: true,
		isDominateImmune: true,
		onDeath: {typeName: 'OpenLockedGate'},
		onDominate: {typeName: 'OpenLockedGate'},
		dropTable: [
			{name: 'RingOfBlood', percent: 100},
		]
	};
	
	_.TheSkeletalChampion = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
		],
		onDeath: {typeName: 'SkeletonCorpse'},
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		noBlood: true,
		neverRun: true,
		noRegen: true,
		neverSleep: true,
		resistance: {Toxic: 1},
		statusEffectImmunities: ['InfectiousDisease'],
		isGasImmune: true,
		isBoss: true,
		dropTable: [
			{name: 'ChampionsShield',		percent: 100},
		]
	};

	_.TheTormentedMarksman = {
		abilityTypes: [
			SHOOT_ARROW,
			{typeName: 'ArcaneArrow', stats: {damage: 'MHIGH', cooldown: 5}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		onDeath: {typeName: 'SkeletonCorpse'},
		noBlood: true,
		neverRun: true,
		noRegen: true,
		neverSleep: true,
		resistance: {Toxic: 1},
		statusEffectImmunities: ['InfectiousDisease'],
		isGasImmune: true,
		isBoss: true,
		dropTable: [
			{name: 'SpiritBow', percent: 100}
		]
	};

	

};

// ICE_CAVES:
// ****************************************************************************************
createNPCTypes.TheIceCaves = function () {
	let _ = gs.npcTypes;
	
	_.DireWolf = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'LOW'}},
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'LOW',
		resistance: {Cold: 1},
		canOpenDoors: false,
	};

	_.DireWolfKennel = extendNPCType(IMMOBILE, {
		abilityTypes: [
			{typeName: 'SpawnNPC', stats: {numSpawned: 3, coolDown: 5, npcTypeName: 'DireWolf'}}
		],
		hitPointType: 'MEDIUM',
		maxMp: 3,
	});

	_.Penguin = {
		abilityTypes: [
			{typeName: 'ProjectileAttack', stats: {damage: 'MLOW', projectileTypeName: 'Snowball'}},
			{typeName: 'Slide'},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		resistance: {Cold: 1},
		canOpenDoors: false,
	};

	_.Yak = {
		abilityTypes: [
			{typeName: 'Trample', 	stats: {damage: 'MEDIUM'}},
			{typeName: 'SlowCharge', 		stats: {damage: 'HIGH'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		resistance: {Cold: 1},
		canOpenDoors: false,
	};

	

	_.PolarBear = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MHIGH'}},
			{typeName: 'NPCBerserk', stats: {coolDown: 100, mana: 0}}
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		size: CHARACTER_SIZE.LARGE,
		resistance: {Cold: 1},
		canOpenDoors: false,
	};

	_.IceElemental = {
		abilityTypes: [
			extend(COLD_PROJECTILE, {coolDown: 0, range: 7.0}),
			{typeName: 'SummonIceBomb', stats: {damage: 'HIGH', coolDown: 10}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		minRange: 3,
		noBlood: true,
		isFlying: true,
		resistance: {Cold: 1, Fire: -1},
	};
	
	_.IceStatue = extendNPCType(IMMOBILE, {
		abilityTypes: [
			extend(COLD_PROJECTILE, {coolDown: 1, range: 7.0}),
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'FrostVortex', num: 1, coolDown: 3}},
		],
		hitPointType: 'MEDIUM',
		resistance: {Physical: 1, Cold: 1},
	});
	
	_.FrostVortex = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM', damageType: DAMAGE_TYPE.COLD}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		noBlood: true,
		damageShield: {Cold: 'MLOW'},
		resistance: {Cold: 1, Fire: -1},
		isFlying: true,
		canOpenDoors: false,
		neverRun: true,
	};
	
	_.GnollWarrior = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		resistance: {Cold: 1},
	};

	_.GnollArcher = {
		abilityTypes: [
			SHOOT_ARROW,
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		resistance: {Cold: 1},
	};
	
	_.FrostGiant = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MHIGH'}},
			{typeName: 'NPCBerserk', stats: {coolDown: 100, mana: 0}}
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		size: CHARACTER_SIZE.LARGE,
		resistance: {Cold: 1},
	};
	
	// UNIQUES:
	_.GraxTheFrostShaman = {
		abilityTypes: [
			extend(COLD_PROJECTILE, {coolDown: 1}),
			{typeName: 'Haste', stats: {coolDown: 5}},
			{typeName: 'GroupHeal', stats: {coolDown: 5, healPercent: 0.5}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		minRange: 3,
		resistance: {Cold: 1},
		isBoss: true,
		neverUnagro: true,
		dropTable: [
			{name: 'GlacierForgedStaff', percent: 100}
		]
	};
	
	_.BeastMasterNyx = {
		abilityTypes: [
			{typeName: 'WhipAttack', stats: {damage: 'MLOW', coolDown: 2}},
			{typeName: 'ThrowNet', stats: {coolDown: 10, duration: 5}},
			{typeName: 'SummonMonsters', 	stats: {npcTypeName: 'DireWolf', num: 2, coolDown: 5}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		minRange: 3,
		isBoss: true,
		dropTable: [
			{name: 'BeastMastersGloves', percent: 100}
		]
	};
	
	_.IceBerg = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MHIGH'}},
			{typeName: 'NPCBerserk', stats: {coolDown: 100, mana: 0}}
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		size: CHARACTER_SIZE.LARGE,
		resistance: {Cold: 1},
		isBoss: true,
		dropTable: [
			{name: 'PolarBearCloak',	percent: 1}
		],
		canOpenDoors: false,
	};
	
	_.TheFrostGiantKing = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MHIGH'}},
			{typeName: 'NPCBerserk', stats: {coolDown: 100, mana: 0}},
            {typeName: 'BlinkAlly', stats: {coolDown: 5}},
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		resistance: {Cold: 1},
		size: CHARACTER_SIZE.LARGE,
		isBoss: true,
		neverUnagro: true,
		onDeath: {typeName: 'OpenLockedGate'},
		onDominate: {typeName: 'OpenLockedGate'},
		dropTable: [
			{name: 'FrostForgedHammer',	percent: 1}
		],
	};
};

// THE_SEWERS:
// ****************************************************************************************
createNPCTypes.TheSewers = function () {
	let _ = gs.npcTypes;

	_.SewerRat = {
		abilityTypes: [
			{typeName: 'PoisonAttack', stats: {damage: 'LOW'}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'LOW',
		isGasImmune: true,
		isRandomMover: true,
		size: CHARACTER_SIZE.SMALL,
		resistance: {Toxic: 1},
		canOpenDoors: false,
	};
	
	_.SewerRatNest = extendNPCType(IMMOBILE, {
		abilityTypes: [
			{typeName: 'SpawnNPC', stats: {numSpawned: 3, coolDown: 6, npcTypeName: 'SewerRat'}}
		],
		hitPointType: 'MEDIUM',
		maxMp: 3,
		isGasImmune: true,
		onSpawn: function () {
			gs.createVinePatch({x: this.tileIndex.x, y: this.tileIndex.y}, 2, 'Bones', 0.5);
		},
	});
	
	_.GiantLeach = {
		abilityTypes: [
			{typeName: 'VampireAttack', stats: {damage: 'MEDIUM'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		canSwim: true,
		spawnType: [SPAWN_TYPE.WATER],
		canOpenDoors: false,
	};

	_.BoaConstrictor = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'Constrict', stats: {coolDown: 1}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		resistance: {Cold: -1},
		canOpenDoors: false,
	};

	_.TrollWarrior = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'MEDIUM',
		regenPerTurn: 0.05,
		resistance: {Fire: -1},
	};
	
	_.TrollArcher = {
		abilityTypes: [
			SHOOT_ARROW,
		],
		minRange: 3,
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'MLOW',
		regenPerTurn: 0.05,
		resistance: {Fire: -1},
	};
	
	_.TrollShaman = {
		abilityTypes: [
			POISON_PROJECTILE,
			{typeName: 'LifeSpike', stats: {damage: 'LOW', mana: 0, coolDown: 10}},
			{typeName: 'Heal', stats: {coolDown: 3, healPercent: 0.50}}
		],
		minRange: 3,
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'MLOW',
		regenPerTurn: 0.05,
		resistance: {Fire: -1},
	};
	
	_.Crocodile = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		neverWander: true,
		startHidden: true,
		ambushDistance: 3,
		neverRespondToShout: true,
		canSwim: true,
		spawnType: [SPAWN_TYPE.WATER],
		resistance: {Cold: -1},
		canOpenDoors: false,
	};
	
	_.BlackMamba = {
		abilityTypes: [
			{typeName: 'PoisonAttack', stats: {damage: 'MEDIUM', poisonChance: 0.5, poisonDamage: 50}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		resistance: {Cold: -1},
		canOpenDoors: false,
	};

	_.TentacleSpitter = {
		abilityTypes: [
			extend(ACID_PROJECTILE, {damage: 'MLOW', range: 7.0, coolDown: 1})
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		
		minRange: 3,
		neverWander: true,
		startHidden: true,
		ambushDistance: 5.0,
		canSwim: true,
		isSwimmer: true,
		neverRun: true,
		isGasImmune: true,
		isToxicWasteImmune: true,
		spawnType: [SPAWN_TYPE.WATER, SPAWN_TYPE.TOXIC_WASTE],
		resistance: {Toxic: 1},
		canOpenDoors: false,
	};

	_.Bloat = {
		abilityTypes: [
			ACID_PROJECTILE,
			{typeName: 'PoisonCloudBolt', stats: {damage: 'MEDIUM', coolDown: 4, isSpell: false}},
		],
		onDeath: {typeName: 'Bloat', stats: {damage: 'MEDIUM', maxSpread: 2}},
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		minRange: 3,
		hitPointType: 'MLOW',
		noBlood: true,
		isFlying: true,
		neverRun: true,
		isGasImmune: true,
		resistance: {Toxic: 1, Fire: -1},
		canOpenDoors: false,
	};

	_.Slime = extendNPCType(SLIME, {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MLOW', damageType: DAMAGE_TYPE.TOXIC}},
		],
		hitPointType: 'HIGH',
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		onHit: this.npcOnHit.SlimeSplit,
		noRegen: true,
	});
	
	_.AcidicSlime = extendNPCType(SLIME, {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM', damageType: DAMAGE_TYPE.TOXIC}}
		],
		hitPointType: 'MEDIUM',
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		onHit: this.npcOnHit.SlimeSplit,
		damageShield: {Toxic: 'LOW'},
		noRegen: true,
	});
	
	_.CorrosiveSlime = extendNPCType(SLIME, {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM', damageType: DAMAGE_TYPE.FIRE}}
		],
		hitPointType: 'MEDIUM',
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		resistance: {Fire: 1},
		isLavaImmune: true,
		onHit: this.npcOnHit.SlimeSplit,
		isCorrosive: true,
		noRegen: true,
	});

	_.ToxicStatue = extendNPCType(IMMOBILE, {
		abilityTypes: [
			extend(ACID_PROJECTILE, {range: 7.0, coolDown: 3}),
			{typeName: 'PoisonCloudBolt', stats: {damage: 'MEDIUM', coolDown: 5}},
			{typeName: 'WallOfPoisonGas', stats: {damage: 'MEDIUM', coolDown: 10}},

		],
		hitPointType: 'MEDIUM',
		resistance: {Physical: 1, Toxic: 1},
		isGasImmune: true,
	});

	// THE_SEWERS_UNIQUES:
	_.TheKraken = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'TonguePull', stats: {coolDown: 10, tongueFrame: 1746, range: 4.0}, niceName: 'Tentacle Pull'},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'HIGH',
		neverRun: true,
		canSwim: true,
		isSwimmer: true,
		isKnockBackImmune: true,
		dontSubmerge: true,
		isBoss: true,
		canPassAllies: true,
		isDominateImmune: true,
		neverUnagro: true,
		size: CHARACTER_SIZE.LARGE,
		onDeath: {typeName: 'OpenLockedGate'},
		onDominate: {typeName: 'OpenLockedGate'},
		dropTable: [
			{name: 'SlimeCoveredHarpoon', percent: 100}
		],
	};
	
	_.Tentacle = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'LOW'}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		neverRun: true,
		canSwim: true,
		isSwimmer: true,
		dontSubmerge: true,
		isDominateImmune: true,
		neverUnagro: true,
		isKnockBackImmune: true,
		regenPerTurn: 0.05,
		maxDistanceToSummoner: 3,
	};
	
	_.ExpanderisTheSlimeKing = extendNPCType(SLIME, {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM', damageType: DAMAGE_TYPE.TOXIC}},
			{typeName: 'SlimeKingSplit', stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		neverRun: true,
		isBoss: true,
		neverUnagro: true,
		isDominateImmune: true,
		onDeath: {typeName: 'OpenLockedGate'},
		onDominate: {typeName: 'OpenLockedGate'},
		dropTable: [
			{name: 'CrownOfSlime', percent: 100}
		],
		noRegen: true,
	});
	
	_.ThePlagueDoctor = {
		abilityTypes: [
			ACID_PROJECTILE,
			{typeName: 'Heal', stats: {coolDown: 3, healPercent: 0.50}},
			{typeName: 'SummonMonsters', 	stats: {npcTypeName: 'SewerRat', num: 4, coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		resistance: {Toxic: 1},
		minRange: 3,
		isBoss: true,
		dropTable: [
			{name: 'FluteOfTheSewers', percent: 100},
		]
	};
	
	_.LockJaw = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'MEDIUM',
		neverWander: true,
		startHidden: true,
		ambushDistance: 3,
		neverRespondToShout: true,
		canSwim: true,
		spawnType: [SPAWN_TYPE.WATER],
		resistance: {Cold: -1},
		isBoss: true,
		dropTable: [
			{name: 'LockJawHideVest', percent: 100}
		],
		canOpenDoors: false,
	};
};


// THE_CORE:
// ****************************************************************************************
createNPCTypes.TheCore = function () {
	let _ = gs.npcTypes;
	
	_.FireBat = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'LOW', damageType: DAMAGE_TYPE.FIRE}},
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'LOW',
		isRandomMover: true,
		isFlying: true,
		size: CHARACTER_SIZE.SMALL,
		resistance: {Fire: 1, Cold: -1},
		canOpenDoors: false,
	};

	_.FireBatNest = extendNPCType(IMMOBILE, {
		abilityTypes: [
			{typeName: 'SpawnNPC', stats: {numSpawned: 3, coolDown: 8, npcTypeName: 'FireBat'}}
		],
		hitPointType: 'MEDIUM',
		maxMp: 3,
	});

	_.FireLizard = {
		abilityTypes: [
			{typeName: 'FlamingCloudBolt', stats: {damage: 'MLOW', coolDown: 4, isSpell: false}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		minRange: 3,
		isLavaImmune: 1,
		resistance: {Fire: 1, Cold: -1},
		isFlamingCloudImmune: true,
		canOpenDoors: false,
	};
	
	_.FlameSpinner = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'SpiderWeb',	stats: {coolDown: 10}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		isUnstableImmune: true,
		resistance: {Fire: 1, Cold: -1},
		canOpenDoors: false,
		isFlameWebImmune: true,
		isLavaImmune: 1,
	};

	_.LavaEel = {
		abilityTypes: [
			extend(FIRE_PROJECTILE, {damage: 'MLOW', range: 7.0, coolDown: 1}),
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		
		minRange: 3,
		neverWander: true,
		startHidden: true,
		ambushDistance: 5.0,
		isFlamingCloudImmune: true,
		noBlood: true,
		isSwimmer: true,
		canSwim: true,
		isLavaImmune: 1,
		neverRun: true,
		resistance: {Fire: 1, Cold: -1},
		spawnType: [SPAWN_TYPE.LAVA],
		canOpenDoors: false,
	};

	_.FireStatue = extendNPCType(IMMOBILE, {
		abilityTypes: [
			extend(FIRE_PROJECTILE, {range: 7.0}),
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'FlameVortex', num: 1, coolDown: 3}},
		],
		hitPointType: 'MEDIUM',
		resistance: {Physical: 1, Fire: 1},
	});

	_.FireElemental = {
		abilityTypes: [
			extend(FIRE_PROJECTILE, {coolDown: 0, range: 7.0}),
			//ORB_OF_FIRE,
			{typeName: 'HomingFireOrb', stats: {damage: 'MHIGH', coolDown: 10, mana: 0}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		minRange: 3,
		noBlood: true,
		isFlying: true,
		isLavaImmune: 1,
		resistance: {Fire: 1, Cold: -1},
	};

	_.ObsidianGolem = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MHIGH'}},
			{typeName: 'Constrict', stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		resistance: {Fire: 1, Physical: 1},
		isLavaImmune: 1,
		noBlood: true,
		noRegen: true,
		neverSleep: true,
		size: CHARACTER_SIZE.LARGE,
		
	};

	_.HomingFireOrb = {
		abilityTypes: [
			{typeName: 'Suicide'}
		],
		onDeath: {typeName: 'Explode'}, // Set damage in HomingFireOrb ability
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		maxHp: 11,
		noBlood: true,
		isFlying: true,
		neverRun: true,
		isLavaImmune: 1,
		noRegen: true,
		poofWhenNoTarget: true,
		updateTurn: this.npcUpdateTurn.HomingFireOrb,
		light: {color: '#ff0000', radius: 60, startAlpha: 'aa'},
		resistance: {Fire: 1, Cold: -1},
		immunities: {
			sleep: true,
			lifeTap: true,
		},
		canOpenDoors: false,
	};
	
	_.FlameVortex = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM', damageType: DAMAGE_TYPE.FIRE}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		noBlood: true,
		isFlying: true,
		isFlamingCloudImmune: true,
		damageShield: {Fire: 'MLOW'},
		resistance: {Fire: 1, Cold: -1},
		canOpenDoors: false,
		neverRun: true,
	};
	
	// UNIQUES:
	// ********************************************************************************************
	// MINOR_BOSS:
	_.AjaxTheFlameShaman = {
		abilityTypes: [
			FIRE_PROJECTILE,
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'FlameVortex', num: 1, coolDown: 5}},
			{typeName: 'Heal', stats: {coolDown: 3, healPercent: 0.5}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		resistance: {Fire: 1},
		isBoss: true,
		isLavaImmune: true,
		dropTable: [
			{name: 'MoltenForgedBoots', 	percent: 100},
		]
	};
	
	// MINOR_BOSS:
	_.TheFlameSpinnerQueen = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'SpiderWeb',	stats: {coolDown: 10}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		isUnstableImmune: true,
		resistance: {Fire: 1, Cold: -1},
		isBoss: true,
		isFlameWebImmune: true,
		isLavaImmune: 1,
		dropTable: [
			{name: 'FlamingCarapace', 	percent: 100},
		]
	};
	
	// MAJOR_BOSS:
	_.TheEfreetiLord = {
		abilityTypes: [
			extend(FIRE_PROJECTILE, {range: 7.0, coolDown: 1}),
			{typeName: 'EfreetiFlames', stats: {damage: 'MEDIUM'}},
			{typeName: 'EscapeBlink', stats: {maxDistance: 10, coolDown: 20}},
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'FlameVortex', num: 2, coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		minRange: 3,
		neverRun: true,
		isFlying: true,
		resistance: {Fire: 1, Cold: -1},
		isFlamingCloudImmune: true,
		isBoss: true,
		neverUnagro: true,
		onDeath: {typeName: 'OpenLockedGate'},
		onDominate: {typeName: 'OpenLockedGate'},
		dropTable: [
			{name: 'TurbanOfFlames', percent: 100}
		]
	};
	
	// MAJOR_BOSS:
	_.LavosaTheEelQueen = {
		abilityTypes: [
			extend(FIRE_PROJECTILE, {range: 7.0, coolDown: 1}),
			extend(ORB_OF_FIRE, {coolDown: 2}),
			{typeName: 'NPCFlamingCloud', stats: {damage: 'MEDIUM', coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MHIGH',
		minRange: 3,
		noBlood: true,
		isSwimmer: true,
		canSwim: true,
		isLavaImmune: 1,
		isFlamingCloudImmune: true,
		isDominateImmune: true,
		neverRun: true,
		resistance: {Fire: 1, Cold: -1},
		isBoss: true,
		neverUnagro: true,
		spawnType: [SPAWN_TYPE.LAVA],
		canOpenDoors: false,
		onDeath: {typeName: 'OpenLockedGate'},
		onDominate: {typeName: 'OpenLockedGate'},
		dropTable: [
			{name: 'MoltenForgedStaff', percent: 100}
		]
	};
	

};

// THE_ARCANE_TOWER:
// ************************************************************************************************
createNPCTypes.TheArcaneTower = function () {
	let _ = gs.npcTypes;

	_.ManaViper = {
		abilityTypes: [
			{typeName: 'ManaDrainAttack', stats: {damage: 'MEDIUM'}},
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'MLOW',
		resistance: {Cold: -1},
		canOpenDoors: false,
	};

	_.FireImp = {
		abilityTypes: [
			extend(FIRE_PROJECTILE, {coolDown: 2, damage: 'MLOW'}),
			{typeName: 'SingleFireArrow', stats: {coolDown: 5, damage: 'MHIGH'}},
			{typeName: 'SurroundBlink', stats: {coolDown: 3}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		isFlying: true,
		minRange: 3,
		size: CHARACTER_SIZE.SMALL,
		resistance: {Fire: 1, Cold: -1},
	};

	_.StormImp = {
		abilityTypes: [
			extend(SHOCK_PROJECTILE, {coolDown: 2}),
			{typeName: 'SingleShockArrow', stats: {coolDown: 5, damage: 'MHIGH'}},
			{typeName: 'SurroundBlink', stats: {coolDown: 3}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		isFlying: true,
		minRange: 3,
		size: CHARACTER_SIZE.SMALL,
		resistance: {Shock: 1},
	};

	_.IceImp = {
		abilityTypes: [
			extend(COLD_PROJECTILE, {coolDown: 2}),
			{typeName: 'SingleIceArrow', stats: {coolDown: 5, damage: 'MHIGH'}},
			{typeName: 'SurroundBlink', stats: {coolDown: 3}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		isFlying: true,
		minRange: 3,
		size: CHARACTER_SIZE.SMALL,
		resistance: {Cold: 1, Fire: -1},
	};

	_.IronImp = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'MLOW',
		isFlying: true,
		onHit: this.npcOnHit.ImpBlink,
		size: CHARACTER_SIZE.SMALL,
	};


	_.StormVortex = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM', damageType: DAMAGE_TYPE.SHOCK}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		noBlood: true,
		isFlying: true,
		damageShield: {Shock: 'MLOW'},
		resistance: {Shock: 1},
		canOpenDoors: false,
		neverRun: true,
	};
	
	_.StoneGolem = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MHIGH'}},
			{typeName: 'Constrict', stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		resistance: {Physical: 1},
		
		noBlood: true,
		noRegen: true,
		neverSleep: true,
		neverRun: true,
		size: CHARACTER_SIZE.LARGE,
	};
	
	_.EvilEye = {
		abilityTypes: [
			MAGIC_PROJECTILE,
			{typeName: 'NPCDiscord', stats: {damage: 'MEDIUM', duration: 5, coolDown: 10, mana: 0}},
			{typeName: 'NPCConfusion', stats: {coolDown: 20}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		isFlying: true,
		canOpenDoors: false,
	};
	
	_.FireStaffTurret = extendNPCType(IMMOBILE, {
		abilityTypes: [
			{typeName: 'RotateProjectileAttack', niceName: 'Throw Fire', stats: {damage: 'HIGH', range: 7.0, projectileTypeName: 'FireArrow', shootEffect: 'FireShoot'}},		
			extend(ORB_OF_FIRE, {isSpell: false}),
		],
		hitPointType: 'HIGH',
		dontFace: true,
		rotateAim: true,
	});

	_.StormStatue = extendNPCType(IMMOBILE, {
		abilityTypes: [
			extend(SHOCK_PROJECTILE, {range: 7.0}),
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'StormVortex', num: 1, coolDown: 3}},
		],
		hitPointType: 'MEDIUM',
		resistance: {Physical: 1, Shock: 1},
	});
	
	_.StormElemental = {
		abilityTypes: [
			extend(SHOCK_PROJECTILE, {coolDown: 0, range: 7.0}),
			{typeName: 'SummonTornado', stats: {damage: 'MHIGH', coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		minRange: 3,
		noBlood: true,
		isFlying: true,
		resistance: {Shock: 1},
	};

	_.Demonologist = {
		abilityTypes: [
			MAGIC_PROJECTILE,
			{typeName: 'SummonHellPortal', stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};
	
	// UNIQUES:
	// ************************************************************************************************
	_.CazelTheConjuror = {
		abilityTypes: [
			MAGIC_PROJECTILE,
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'SpectralBlade', num: 3, coolDown: 10}},
			{typeName: 'FieldOfForce', stats: {coolDown: 3}},
			{typeName: 'SummonBattleSphere', stats: {npcTypeName: 'ArcaneBattleSphere', coolDown: 10}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		minRange: 3,
		isBoss: true,
		onDeath: {typeName: 'OpenLockedGate'},
		onDominate: {typeName: 'OpenLockedGate'},
		dropTable: [
			{name: 'RobeOfFlowingMana', percent: 100},
		],
	};
	
	_.DelasTheDjinniLord = {
		abilityTypes: [
			SHOCK_PROJECTILE,
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'StormVortex', num: 2, coolDown: 10}},
			{typeName: 'SummonTornado', stats: {damage: 'MHIGH', coolDown: 5}},
			{typeName: 'EscapeBlink', stats: {maxDistance: 10, coolDown: 20}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		minRange: 3,
		isFlying: true,
		isBoss: true,
		onDeath: {typeName: 'OpenLockedGate'},
		onDominate: {typeName: 'OpenLockedGate'},
		dropTable: [
			{name: 'LightningForgedStaff', percent: 100}
		]
	};
};

// THE_SWAMP:
// ****************************************************************************************
createNPCTypes.TheSwamp = function () {
	let _ = this.npcTypes;
	
	_.Pirahna = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'LOW'}},
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'LOW',
		neverWander: true,
		startHidden: true,
		ambushDistance: 5.0,
		canSwim: true,
		isSwimmer: true,
		neverRun: true,
		spawnType: [SPAWN_TYPE.WATER],
		canOpenDoors: false,
	};

	_.PoisonViper = {
		abilityTypes: [
			{typeName: 'PoisonAttack', stats: {damage: 'MEDIUM'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		resistance: {Cold: -1},
		canOpenDoors: false,
	};

	_.BlinkFrog = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MLOW'}},
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'MLOW',
		onHit: this.npcOnHit.BlinkFrog,
		canSwim: true,
		resistance: {Cold: -1},
		canOpenDoors: false,
	};

	_.Mosquito = {
		abilityTypes: [
			{typeName: 'VampireAttack', stats: {damage: 'MEDIUM'}},
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'MEDIUM',
		isFlying: true,
		canOpenDoors: false,
	};

	_.SpinyFrog = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		damageShield: {Physical: 'LOW'},
		canSwim: true,
		resistance: {Cold: -1},
		canOpenDoors: false,
	};

	_.ElectricEel = {
		abilityTypes: [
			extend(SHOCK_PROJECTILE, {range: 7.0, coolDown: 3}),
		],
		resistance: {Shock: 1},
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		
		minRange: 3,
		neverWander: true,
		startHidden: true,
		ambushDistance: 5.0,
		canSwim: true,
		isSwimmer: true,
		neverRun: true,
		spawnType: [SPAWN_TYPE.WATER],
		canOpenDoors: false,
	};

	_.BullFrog = {
		abilityTypes: [
			{typeName: 'Trample', stats: {damage: 'MEDIUM'}},
			{typeName: 'SlowCharge', stats: {damage: 'HIGH'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'HIGH',
		canSwim: true,
		resistance: {Cold: -1},
		canOpenDoors: false,
	};

	_.SnappingTurtle = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'HideInShell'}
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		resistance: {Cold: -1, Physical: 1},
		canOpenDoors: false,
	};
	
	_.SwampFungoid = {
		abilityTypes: [
			{typeName: 'PoisonCloudBolt', stats: {damage: 'MEDIUM', coolDown: 4, isSpell: false}},
		],

		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'MEDIUM',
		resistance: {Toxic: 1},
		isGasImmune: true,
		minRange: 3,
		noBlood: true,
	};

	_.LickyToad = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'TonguePull', stats: {coolDown: 10}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		canSwim: true,
		resistance: {Cold: -1},
		canOpenDoors: false,
	};

	// THE_SWAMP_UNIQUES:
	// ****************************************************************************************
	_.KasicTheMosquitoPrince = {
		abilityTypes: [
			{typeName: 'VampireAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'LifeSpike', stats: {damage: 'LOW', mana: 0, coolDown: 10}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		isFlying: true,
		isBoss: true,
		dropTable: [
			{name: 'BloodStinger', percent: 100},
		],
		canOpenDoors: false,
	};

	_.GixloTheWitchDoctor = {
		abilityTypes: [
			POISON_PROJECTILE,
			{typeName: 'NPCPoisonCloud', stats: {damage: 'MLOW', coolDown: 10}},
			{typeName: 'Heal', stats: {coolDown: 3, healPercent: 0.5}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		isBoss: true,
		resistance: {Toxic: 1},
		dropTable: [
			{name: 'RunicStaffOfDeath', percent: 100},
		]
	};
	
	_.IraTheSwampSiren = {
		abilityTypes: [
			{typeName: 'VampireAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'NPCCharm', stats: {coolDown: 20}},
			{typeName: 'Lure', stats: {coolDown: 3}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		isBoss: true,
		dropTable: [
			{name: 'VeilOfTheSwamp', percent: 100},
		]
	};
	
	_.FergusTheFungusKing = {
		abilityTypes: [
			{typeName: 'PoisonCloudBolt', stats: {damage: 'MEDIUM', coolDown: 5, isSpell: false}},
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'Fungling', num: 1, coolDown: 3, summonDuration: 20, isSpell: false}},
		],
		movementSpeed: 'NONE',
		hitPointType: 'HIGH',
		isBoss: true,
		maxSummons: 6,
		noBlood: true,
		canOpenDoors: false,
		neverRun: true,
		
		// Defense:
		resistance: {Toxic: 1},
		isGasImmune: true,
		
		dropTable: [
			{name: 'MushroomCapShield', percent: 100},
		]
	};
	
	_.Fungling = {
		// Abilities:
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MLOW'}}
		],
		onDeath: {typeName: 'Bloat', stats: {damage: 'MLOW'}},
		
		// Properties:
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'LOW',
		noBlood: true,
		canOpenDoors: false,
		
		// Defense:
		resistance: {Toxic: 1},
		isGasImmune: true,
	};
};

// THE_DARK_TEMPLE:
// ************************************************************************************************
createNPCTypes.TheDarkTemple = function () {
	let _ = gs.npcTypes;
	
	_.DarkElfWarrior = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
	};

	_.DarkElfArcher = {
		abilityTypes: [
			SHOOT_ARROW,
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};
	
	_.DarkElfAssassin = {
		abilityTypes: [
			{typeName: 'PoisonAttack', stats: {damage: 'MEDIUM', poisonDamage: 40}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		
		// Ambusher:
		neverWander: true,
		startHidden: true,
		ambushDistance: 3,
		neverRespondToShout: true,
	};
	
	_.DarkElfPyromancer = {
		abilityTypes: [
			FIRE_PROJECTILE,
			ORB_OF_FIRE,
			{typeName: 'SummonBattleSphere', stats: {npcTypeName: 'BattleSphereOfFire', coolDown: 10}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};

	_.DarkElfStormologist = {
		abilityTypes: [
			SHOCK_PROJECTILE,
			{typeName: 'AirStrike', stats: {damage: 'MEDIUM', coolDown: 10}},
			{typeName: 'SummonBattleSphere', stats: {npcTypeName: 'BattleSphereOfStorm', coolDown: 10}}

		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};
	
	_.DarkElfCryomancer = {
		abilityTypes: [
			COLD_PROJECTILE,
			{typeName: 'NPCFreezingCloud', stats: {damage: 'MEDIUM', coolDown: 20, mana: 0}},
			{typeName: 'SummonIceBomb', stats: {damage: 'HIGH', coolDown: 15}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};
	
	_.DarkElfSummoner = {
		abilityTypes: [
			MAGIC_PROJECTILE,
			{typeName: 'NPCDiscord', stats: {damage: 'MEDIUM', duration: 5, coolDown: 10, mana: 0}},
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'SpectralBlade', num: 3, coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};
	
	_.SummoningStatue = extendNPCType(IMMOBILE, {
		abilityTypes: [
			extend(MAGIC_PROJECTILE, {range: 7.0, coolDown: 3}),
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'SpectralBlade', num: 2, coolDown: 2}},
		],
		hitPointType: 'MEDIUM',
		resistance: {Physical: 1},
	});
	
	_.DarkElfPriest = {
		abilityTypes: [
			{typeName: 'Smite', stats: {damage: 30, coolDown: 4}},
			{typeName: 'Heal', stats: {coolDown: 3, healPercent: 0.5}},
			{typeName: 'Haste', stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};

	_.ArcaneArcher = {
		abilityTypes: [
			SHOOT_ARROW,
			{typeName: 'ArcaneArrow', stats: {damage: 'MHIGH', cooldown: 5}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};
	
	_.MindFlayer = {
		abilityTypes: [
			MAGIC_PROJECTILE,
			{typeName: 'ManaDrainAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'NPCConfusion', stats: {coolDown: 20}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
	};
	
	_.DrachnidWarrior = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'SpiderWeb',	stats: {coolDown: 10, range: 5.0}}
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'MEDIUM',
		isUnstableImmune: true,
	};

	_.DrachnidArcher = {
		abilityTypes: [
			SHOOT_ARROW,
			{typeName: 'SpiderWeb',	stats: {coolDown: 10, range: 5.0}}
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'MLOW',
		minRange: 3,
		isUnstableImmune: true,
	};
	
	
	// BOSSES:
	_.DherossoTheDemonologist = {
		abilityTypes: [
			extend(COLD_PROJECTILE, {range: 7.0, coolDown: 2}),
			ORB_OF_FIRE,
			{typeName: 'AirStrike', stats: {damage: 'MEDIUM', coolDown: 10}},
			{typeName: 'SummonHellPortal', stats: {coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		isBoss: true,
		dropTable: [
			{name: 'CrownOfBrilliance', percent: 100}
		]
	};
	
	_.PorecsaTheHighPriestess = {
		abilityTypes: [
			{typeName: 'Torment', stats: {coolDown: 10}},
			{typeName: 'Smite', stats: {damage: 40, coolDown: 3}},
			{typeName: 'GroupHeal', stats: {coolDown: 5, healPercent: 0.5}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		isBoss: true,
		dropTable: [
			{name: 'AmuletOfLife', percent: 100}
		]
	};
	
	_.TheDrachnidQueen = {
		abilityTypes: [
			extend(SHOOT_ARROW, {range: 7.0, coolDown: 0, damage: 'MEDIUM'}),
			{typeName: 'NPCDiscord', stats: {damage: 'MEDIUM', duration: 5, coolDown: 10, mana: 0}},
			{typeName: 'SpiderWeb',	stats: {coolDown: 5, range: 5.0}}
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'MEDIUM',
		minRange: 3,
		isUnstableImmune: true,
		isBoss: true,
		dropTable: [
			{name: 'DrachnidWebBow', percent: 100},
		]
	};

	_.TheCrystalArcher = {
		abilityTypes: [
			extend(SHOOT_ARROW, {coolDown: 1}),
			{typeName: 'ArcaneArrow', stats: {damage: 'MHIGH', cooldown: 5}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		minRange: 3,
		reflection: 0.75,
		isBoss: true,
		dropTable: [
			{name: 'CrystalArmor', percent: 50},
			{name: 'RingOfReflection', percent: 50}
		],
	};
	
	_.MorrgueTheMindFlayer = {
		abilityTypes: [
			MAGIC_PROJECTILE,
			{typeName: 'NPCDiscord', stats: {damage: 'MEDIUM', duration: 5, coolDown: 10, mana: 0}},
			{typeName: 'NPCConfusion', stats: {coolDown: 20}},
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'SpectralBlade', num: 3, coolDown: 10}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		minRange: 3,
		isBoss: true,
		dropTable: [
			{name: 'RingOfIntelligence', percent: 25},
			{name: 'CircletOfKnowledge', percent: 25},
			{name: 'StaffOfPower', percent: 25},
			{name: 'StaffOfEnergy', percent: 25}
		],
		
	};
	
	
	/*
	_.DarkElfWarden = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'SealDoors', stats: {coolDown: 40}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',	
	};

	_.DarkElfSentinel = {
		abilityTypes: [
			SHOOT_ARROW,
			{typeName: 'WatchPlayer', stats: {coolDown: 20}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};
	
	_.DarkElfPyromancer = {
		abilityTypes: [
			FIRE_PROJECTILE,
			ORB_OF_FIRE,
			{typeName: 'NPCFireStorm', stats: {damage: 'HIGH', coolDown: 20, mana: 0}},
			{typeName: 'NPCWallOfFire', stats: {damage: 'MEDIUM', coolDown: 20, mana: 0}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		resistance: {Fire: 1}
	};

	_.DarkElfStormologist = {
		abilityTypes: [
			SHOCKING_GRASP,
			LIGHTNING_BOLT,
			{typeName: 'OrbOfStorm', stats: {coolDown: 20}},

		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		resistance: {Shock: 1}
	};

	


	_.DarkElfWarper = {
		abilityTypes: [
			MAGIC_PROJECTILE,
			{typeName: 'BlinkAlly', stats: {coolDown: 10}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};
*/

	
};



// THE_UNDER_GROVE:
// ****************************************************************************************
createNPCTypes.TheUnderGrove = function () {
	let _ = gs.npcTypes;
	
	_.Jaguar = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'MLOW',
		canOpenDoors: false,
	};

	_.Spider = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'SpiderWeb',	stats: {coolDown: 10}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		isUnstableImmune: true,
		canOpenDoors: false,
	};

	_.SpiderNest = extendNPCType(IMMOBILE, {
		abilityTypes: [
			{typeName: 'SpawnNPC', stats: {numSpawned: 1, coolDown: 5, npcTypeName: 'Spider'}}
		],
		hitPointType: 'MEDIUM',
		maxMp: 3,
		onSpawn: function () {
			gs.createVinePatch({x: this.tileIndex.x - 1, y: this.tileIndex.y}, 2, 'SpiderWeb', 0.5);
		},
	});
	
	_.BeeHive = extendNPCType(IMMOBILE, {
		abilityTypes: [
			{typeName: 'SpawnNPC', stats: {numSpawned: 3, coolDown: 5, npcTypeName: 'GiantBee'}}
		],
		hitPointType: 'MEDIUM',
		maxMp: 3,
	});

	_.PoisonSpider = {
		abilityTypes: [
			{typeName: 'PoisonAttack', stats: {damage: 'MEDIUM'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		isUnstableImmune: true,
		canOpenDoors: false,
	};

	_.CentaurArcher = {
		abilityTypes: [
			SHOOT_ARROW,
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'MLOW',
		minRange: 3,
	};

	_.CentaurWarrior = {
		abilityTypes: [
			{typeName: 'Trample', stats: {damage: 'MEDIUM'}},
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'MEDIUM',
	};

	_.Chameleon = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'TonguePull', stats: {coolDown: 10}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		neverWander: true,
		startHidden: true,
		ambushDistance: 5,
		neverRespondToShout: true,
		resistance: {Cold: -1},
		canOpenDoors: false,
	};

	_.Elephant = {
		abilityTypes: [
			{typeName: 'Trample', 	stats: {damage: 'MEDIUM'}},
			{typeName: 'SlowCharge', 		stats: {damage: 'HIGH'}}
		],
		movementSpeed: MOVEMENT_SPEED.SLOW,
		hitPointType: 'HIGH',
		size: CHARACTER_SIZE.LARGE,
		canOpenDoors: false,
	};
		
	_.GiantAnt = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MLOW'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		isRandomMover: true,
		canOpenDoors: false,
		isUnstableImmune: true,
	};

	_.GiantBee = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MLOW'}}
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'LOW',
		isFlying: true,
		canOpenDoors: false,
	};
	
	_.CorruptedDruid = {
		abilityTypes: [
			SHOCK_PROJECTILE,
			{typeName: 'AirStrike', stats: {damage: 'MEDIUM', coolDown: 10}},
			{typeName: 'Heal', stats: {coolDown: 3, healPercent: 0.5}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
	};

	// UNIQUES:
	// ********************************************************************************************
	_.TheQueenSpider = {
		abilityTypes: [
			{typeName: 'PoisonAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'SpawnNPC', stats: {numSpawned: 1, coolDown: 5, mana: 1, npcTypeName: 'SpiderEgg', dontUseWhenCharmed: true}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MEDIUM',
		isBoss: true,
		maxMp: 10,
		canOpenDoors: false,
		isUnstableImmune: true,
		dropTable: [
			{name: 'NoxiousCarapaceArmor', percent: 100},
		],
	};

	_.TheCatLord = {
		abilityTypes: [
			SHOOT_ARROW,
			{typeName: 'SummonMonsters', 	stats: {npcTypeName: 'Jaguar', num: 1, coolDown: 5}},
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'MLOW',
		minRange: 3,
		isBoss: true,
		dropTable: [
			{name: 'RingOfDexterity', percent: 100},
		]
	};

	_.TheCorruptedEnt = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			{typeName: 'TonguePull', stats: {coolDown: 10, tongueFrame: 1746}, niceName: 'Vine Pull'},
			{typeName: 'SummonMonsters', stats: {npcTypeName: 'Root', num: 1, coolDown: 3, summonDuration: -1, isSpell: false}},
		],
		movementSpeed: 'NONE',
		hitPointType: 'HIGH',
		isBoss: true,
		maxSummons: 4,
		resistance: {Fire: -1},
		noBlood: true,
		dropTable: [
			{name: 'EntWoodArmor', 	percent: 100},
		],
		canOpenDoors: false,
	};

	_.Root = {
		abilityTypes: [
			{typeName: 'MeleeAttack', stats: {damage: 'MLOW'}}
		],
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		hitPointType: 'LOW',
		maxDistanceToSummoner: 6,
		resistance: {Fire: -1},
		noBlood: true,
		neverRun: true,
		canOpenDoors: false,
		isUnstableImmune: true,
	};

	_.TheCentaurKing = {
		abilityTypes: [
			{niceName: 'Shoot Vine Arrow', typeName: 'ProjectileAttack', stats: {damage: 'MEDIUM', coolDown: 2, projectileTypeName: 'VineDart' , range: 6.0}}
		],
		movementSpeed: MOVEMENT_SPEED.FAST,
		hitPointType: 'HIGH',
		minRange: 3,
		dropTable: [
			{name: 'HeartwoodBow', percent: 100},
		],
		isBoss: true,
	};
};

// CREATE_NPC_TYPES:
// ************************************************************************************************
gs.createNPCTypes = function () {
	
	this.npcTypes = {
		// MISC:
		// ****************************************************************************************
		Skeleton: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damage: 'MEDIUM'}},
			],
			movementSpeed: MOVEMENT_SPEED.NORMAL,
			hitPointType: 'MEDIUM',
			noBlood: true,
			neverRun: true,
			resistance: {Toxic: 1},
			//regenPerTurn: 0.02,
			sustainedMpCost: 6,
			statusEffectImmunities: ['InfectiousDisease'],
			isGasImmune: true,
		},
		
		OrbOfFire: {
			faction: FACTION.NEUTRAL,
			onDeath: {typeName: 'BigExplode'}, // Set damage in OrbOfFire ability
			isDamageImmune: 1,
			maxHp: 100,
			dontFace: true,
			movementSpeed: MOVEMENT_SPEED.FAST,
			isSlowProjectile: true,
			noBlood: true,
			neverRun: true,
			isFlying: true,
			light: {color: '#ff0000', radius: 60, startAlpha: 'aa'},
			isMindless: true,
			canOpenDoors: false,
			immunities: {
				sleep: true,
			},
		},
		

		Tornado: {
			abilityTypes: [
				{typeName: 'TornadoSuck'},
			],
			faction: FACTION.NEUTRAL,
			isDamageImmune: 1,
			hitPointType: 'LOW',
			movementSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			isFlying: true,
			poofColor: 'WHITE',
			isMindless: true,
			canOpenDoors: false,
			immunities: {sleep: true},
		},
		
		ArcaneArrow: {
			faction: FACTION.NEUTRAL,
			onDeath: {typeName: 'ArcaneArrowBurst'}, // Set damage in OrbOfFire ability
			isDamageImmune: 1,
			maxHp: 100,
			dontFace: true,
			movementSpeed: MOVEMENT_SPEED.FAST,
			isSlowProjectile: true,
			noSlowMoveSmoke: true,
			noBlood: true,
			neverRun: true,
			isFlying: true,
			light: {color: '#ff00ff', radius: 60, startAlpha: '66'},
			isMindless: true,
			canOpenDoors: false,
			immunities: {
				sleep: true,
			},
			ignoreProjectiles: true,
		},
		
		FireArrow: {
			faction: FACTION.NEUTRAL,
			onDeath: {typeName: 'FireArrowBurst'}, // Set damage in OrbOfFire ability
			isDamageImmune: 1,
			maxHp: 100,
			dontFace: true,
			movementSpeed: MOVEMENT_SPEED.FAST,
			isSlowProjectile: true,
			noSlowMoveSmoke: true,
			noBlood: true,
			neverRun: true,
			isFlying: true,
			light: {color: '#ff0000', radius: 60, startAlpha: '66'},
			isMindless: true,
			canOpenDoors: false,
			immunities: {
				sleep: true,
			},
			ignoreProjectiles: true,
		},
		
		IceArrow: {
			faction: FACTION.NEUTRAL,
			onDeath: {typeName: 'IceArrowBurst'}, // Set damage in OrbOfFire ability
			isDamageImmune: 1,
			maxHp: 100,
			dontFace: true,
			movementSpeed: MOVEMENT_SPEED.FAST,
			isSlowProjectile: true,
			noSlowMoveSmoke: true,
			noBlood: true,
			neverRun: true,
			isFlying: true,
			light: {color: '#ffffff', radius: 60, startAlpha: '66'},
			isMindless: true,
			canOpenDoors: false,
			immunities: {
				sleep: true,
			},
			ignoreProjectiles: true,
		},
		
		ShockArrow: {
			faction: FACTION.NEUTRAL,
			onDeath: {typeName: 'ShockArrowBurst'}, // Set damage in OrbOfFire ability
			isDamageImmune: 1,
			maxHp: 100,
			dontFace: true,
			movementSpeed: MOVEMENT_SPEED.FAST,
			isSlowProjectile: true,
			noSlowMoveSmoke: true,
			noBlood: true,
			neverRun: true,
			isFlying: true,
			light: {color: '#0000ff', radius: 60, startAlpha: '66'},
			isMindless: true,
			canOpenDoors: false,
			immunities: {
				sleep: true,
			},
			ignoreProjectiles: true,
		},
		
		PoisonArrow: {
			faction: FACTION.NEUTRAL,
			onDeath: {typeName: 'PoisonArrowBurst'}, // Set damage in OrbOfFire ability
			isDamageImmune: 1,
			maxHp: 100,
			dontFace: true,
			movementSpeed: MOVEMENT_SPEED.FAST,
			isSlowProjectile: true,
			noSlowMoveSmoke: true,
			noBlood: true,
			neverRun: true,
			isFlying: true,
			light: {color: '#00ff00', radius: 60, startAlpha: '66'},
			isMindless: true,
			canOpenDoors: false,
			immunities: {
				sleep: true,
			},
			ignoreProjectiles: true,
		},
		
		OrbOfStorm: {
			abilityTypes: [
				extend(SHOCK_PROJECTILE, {range: 1.5, coolDown: 1, damage: 'MLOW'})
			],
			movementSpeed: MOVEMENT_SPEED.SLOW,
			hitPointType: 'LOW',
			dontFace: true,
			noBlood: true,
			neverRun: true,
			isFlying: 1,
			light: {color: '#0000ff', radius: 120, startAlpha: '88'},
			isMindless: true,
			canOpenDoors: false,
			immunities: {
				sleep: true,
			},
			resistance: {Shock: 1}
		},
		
		
		
		BattleSphereOfFire: {
			abilityTypes: [
				extend(FIRE_PROJECTILE, {range: 3.0, coolDown: 0}),
			],
			faction: FACTION.PLAYER,
			hitPointType: 'LOW',
			dontFace: true,
			movementSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			isFlying: true,
			light: {color: '#e5012b', radius: 60, startAlpha: 'aa'},
			isMindless: true,
			canOpenDoors: false,
			immunities: {sleep: true},
		},
		
		BattleSphereOfStorm: {
			abilityTypes: [
				extend(SHOCK_PROJECTILE, {range: 3.0, coolDown: 0}),
			],
			faction: FACTION.PLAYER,
			hitPointType: 'LOW',
			dontFace: true,
			movementSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			isFlying: true,
			light: {color: '#535ec6', radius: 60, startAlpha: 'aa'},
			isMindless: true,
			canOpenDoors: false,
			immunities: {sleep: true},
		},
		
		ArcaneBattleSphere: {
			abilityTypes: [
				extend(MAGIC_PROJECTILE, {range: 3.0, coolDown: 0}),
			],

			movementSpeed: 'NONE',
			hitPointType: 'LOW',
			dontFace: true,
			noBlood: true,
			neverRun: true,
			isFlying: 1,
			isMindless: true,
			canOpenDoors: false,
			immunities: {sleep: true},
		},
		
		// Summoned by player:
		FlamingBattleSphere: {
			abilityTypes: [
				extend(FIRE_PROJECTILE, {range: 4.0, coolDown: 0}),
			],
			faction: FACTION.PLAYER,
			hitPointType: 'MEDIUM',
			dontFace: true,
			movementSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			isFlying: true,
			light: {color: '#e5012b', radius: 60, startAlpha: 'aa'},
			isMindless: true,
			canOpenDoors: false,
			immunities: {sleep: true},
		},
		
		FirePot: {
			faction: FACTION.DESTRUCTABLE,
			onDeath: {typeName: 'CrossExplode'},
			maxHp: 1,
			movementSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			isGasImmune: true,
			isMindless: true,
			immunities: {
				sleep: true,
			}
		},
		
		GasPot: {
			faction: FACTION.DESTRUCTABLE,
			onDeath: {typeName: 'BreakGasPot'},
			maxHp: 1,
			movementSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			isGasImmune: true,
			isMindless: true,
			immunities: {
				sleep: true,
			}
		},
		
		Crate: {
			faction: FACTION.DESTRUCTABLE,
			maxHp: 1,
			movementSpeed: 'NONE',
			noBlood: true,
			isGasImmune: true,
			neverRun: true,
			dropPercent: 0.25,
			isMindless: true,
			immunities: {
				sleep: true,
			}
		},
		
		SpiderEgg: {
			faction: FACTION.DESTRUCTABLE,
			maxHp: 6,
			movementSpeed: 'NONE',
			noBlood: true,
			isGasImmune: true,
			neverRun: true,
			updateTurn: this.npcUpdateTurn.SpiderEgg,
			isMindless: true,
			immunities: {
				sleep: true,
				lifeTap: true,
			}
		},
		
		HellPortal: {
			faction: FACTION.HOSTILE,
			/*
			abilityTypes: [
				{typeName: 'SummonImp', stats: {numSpawned: 1, coolDown: 3, npcTypeName: ['FireImp', 'StormImp', 'IceImp', 'IronImp']}}
			],
			*/
			updateTurn: this.npcUpdateTurn.HellPortal,
			maxMp: 3,
			maxHp: 25,
			movementSpeed: 'NONE',
			noBlood: true,
			isGasImmune: true,
			neverRun: true,
			isMindless: true,
			immunities: {
				sleep: true,
				lifeTap: true,
			}
		},
		
		SpectralBlade: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damage: 'MLOW'}}
			],
			movementSpeed: MOVEMENT_SPEED.NORMAL,
			hitPointType: 'LOW',
			isFlying: true,
			noCorpse: true,
			noBlood: true,
			neverSpawn: true,
			noRegen: true,
			neverRun: true,
			isMindless: true,
			canOpenDoors: false,
			immunities: {
				sleep: true,
				lifeTap: true,
			}
		},
		
		FlamingBlade: {
			abilityTypes: [
				{typeName: 'MeleeAttack', stats: {damage: 'MLOW', damageType: DAMAGE_TYPE.FIRE}}
			],
			movementSpeed: MOVEMENT_SPEED.NORMAL,
			hitPointType: 'LOW',
			isFlying: true,
			noCorpse: true,
			noBlood: true,
			neverSpawn: true,
			noRegen: true,
			neverRun: true,
			isMindless: true,
			canOpenDoors: false,
			immunities: {
				sleep: true,
				lifeTap: true,
			}
		},
		
		Merchant: {
			faction: FACTION.NEUTRAL,
			maxHp: 100,
			dontFace: true,
			movementSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			isGasImmune: true,
			isDamageImmune: 1,
		},
		
		TheLibrarian: {
			faction: FACTION.NEUTRAL,
			maxHp: 100,
			dontFace: true,
			movementSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			isGasImmune: true,
			isDamageImmune: 1,
		},

		TalentTrainer: {
			faction: FACTION.NEUTRAL,
			maxHp: 100,
			dontFace: true,
			movementSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			isGasImmune: true,
			isDamageImmune: 1,
		},
		
		Enchanter: {
			faction: FACTION.NEUTRAL,
			maxHp: 100,
			dontFace: true,
			movementSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			isGasImmune: true,
			isDamageImmune: 1,
		},
		
		Priest: {
			faction: FACTION.NEUTRAL,
			maxHp: 100,
			dontFace: true,
			movementSpeed: 'NONE',
			noBlood: true,
			neverRun: true,
			isGasImmune: true,
			isDamageImmune: 1,
		},
        
		PracticeDummy: {
			faction: FACTION.HOSTILE,
			maxHp: 10000,
			movementSpeed: 'NONE',
			isGasImmune: true,
			noRegen: true,
			isFlying: true,
		},
		
		
		CryptAltar: {
			faction: FACTION.DESTRUCTABLE,
			maxHp: 45,
			movementSpeed: 'NONE',
			isGasImmune: true,
			noRegen: true,
			noBlood: true,
			neverRun: true,
			isMindless: true,
			immunities: {
				sleep: true,
			}
		}
	};
	
	for (let key in createNPCTypes) {
		if (createNPCTypes.hasOwnProperty(key)) {
			createNPCTypes[key].call(this);
		}
	}
	
	this.nameTypes(this.npcTypes);
	this.setNPCTypeFrames();
	this.setNPCTypeLevels();
	this.setNPCTypeDefaultProperties();	
};

// SET_NPC_TYPE_LEVELS:
// ************************************************************************************************
gs.setNPCTypeLevels = function () {
	let _ = this.npcTypes;
	let baseDL;
	
	// THE_UPPER_DUNGEON (TIER_I):
	// ********************************************************************************************
    // Zone Level 1:
	_.Rat.level = 							1;
	_.Bat.level = 							1;
	_.RatNest.level = 						1;
	_.GoblinArcher.level = 					1;
	_.GoblinWarrior.level = 				1;
    
    // Zone Level 2:
	_.GoblinBrute.level = 					2;
	_.GoblinSlaver.level =					2;
    _.GoblinFireMage.level = 				2;
	_.GoblinStormMage.level = 				2;
	
    // Zone Level 3:
	_.Centipede.level =						3;
	_.GoblinShaman.level = 					3;
	_.CaveBear.level = 						3;
	
	// MINOR_BOSS:
	_.TheVampireBat.level = 				3;
	_.TheRatPiper.level = 					3;
	_.TheAncientCaveBear.level =			3;
	
	// MAJOR_BOSS:
	_.UmbraTheHighShaman.level =			5;
    _.ArgoxTheWarlord.level =           	5;
	_.BlastoTheArchMagi.level =         	5;
	_.BojackTheBerserker.level =			5;
	_.ArgylTheSwift.level =		5;
	
	
	// SHARED (TIER_II):
	// ********************************************************************************************
	baseDL = 4;
	_.ElectricEel.level = 					baseDL;
	_.GiantAnt.level = 						baseDL;
	
	// THE_SUNLESS_DESERT (TIER_II):
	// ********************************************************************************************
	baseDL = 4;
	// Zone Level 1:
	_.Scarab.level =						baseDL - 1;
	_.ScarabUrn.level =						baseDL;
	_.SpittingViper.level =					baseDL;
	_.TrapDoorSpider.level =				baseDL;
	_.DervishRaider.level =					baseDL;
	_.DervishArcher.level =					baseDL;
	
	// Zone Level 2:
	_.Scorpion.level =						baseDL + 1;
	_.DervishMagi.level =					baseDL + 1;
	_.Goat.level = 							baseDL + 1;
	
	// Zone Level 3:
	_.SunFlower.level =						baseDL + 2;
	_.Mummy.level =							baseDL + 2;
	_.MummyPriest.level =					baseDL + 2;
	
	
	// MINOR_BOSS:
	_.CylomarTheAncientPyromancer.level = 	baseDL + 3;
	
	// MAJOR_BOSS:
	_.KingUrazzoTheAncient.level = 			baseDL + 4;
	_.TheKingOfThieves.level =				baseDL + 4;
	_.SynaxTheSnakeCharmer.level =			baseDL + 4;
	
	
	// THE_SWAMP (TIER_II):
	// ********************************************************************************************
	baseDL = 4;
	
	// Zone Level 1:
	_.Pirahna.level =						baseDL - 1;
	_.PoisonViper.level = 					baseDL;
	_.BlinkFrog.level = 					baseDL;
	
	// Zone Level 2:
	_.Mosquito.level =						baseDL + 1;
	_.SpinyFrog.level = 					baseDL + 1;
	_.SwampFungoid.level =					baseDL + 1;
	
	// Zone Level 3:
	_.LickyToad.level =						baseDL + 2;
	_.SnappingTurtle.level =				baseDL + 2;
	_.BullFrog.level =						baseDL + 2;
		
	// MINOR_BOSS:
	_.KasicTheMosquitoPrince.level = 		baseDL + 3;
	
	// MAJOR_BOSS XL8:
	_.GixloTheWitchDoctor.level =			baseDL + 4;
	_.IraTheSwampSiren.level =				baseDL + 4;
	_.FergusTheFungusKing.level =			baseDL + 4;
	
	// MISC:
	_.Fungling.level =						baseDL + 2;
	
	
	// THE_UNDER_GROVE (TIER_II):
	// ********************************************************************************************
	baseDL = 4;
	
	// Zone Level 1:
	_.GiantBee.level =						baseDL - 1;
	_.Jaguar.level = 						baseDL;
	_.BeeHive.level =						baseDL;
	_.Spider.level =						baseDL;
	
	// Zone Level 2:
	_.CentaurArcher.level =					baseDL + 1;
	_.CentaurWarrior.level =				baseDL + 1;
	_.PoisonSpider.level =					baseDL + 1;
	_.SpiderNest.level =					baseDL + 1;
	
	// Zone Level 3:
	_.Chameleon.level =						baseDL + 2;
	_.Elephant.level =						baseDL + 2;
	_.CorruptedDruid.level =				baseDL + 2;
	
	// MINOR_BOSS XL7:
	_.TheCatLord.level =					baseDL + 3;
	
	// MAJOR_BOSS XL8:
	_.TheQueenSpider.level = 				baseDL + 4;
	_.TheCorruptedEnt.level =				baseDL + 4;
	_.TheCentaurKing.level =				baseDL + 4;
	
	// MISC:
	_.Root.level =							baseDL + 2;

	
	// THE_ORC_FORTRESS:
	// ********************************************************************************************
	// Zone Level 1/2/3:
	_.Wolf.level =							6;
	_.WolfKennel.level =					7;
	_.OrcWarrior.level =					7;
	_.OrcArcher.level =						7;
	_.OrcSlaver.level =						7;
	_.OrcBerserker.level =					7;
	_.OrcPyromancer.level =					8;
	_.OrcCryomancer.level =					8;
	_.Ogre.level = 							9;
	
	// Zone Level 4/5/6:
	_.OrcPriest.level =						11;
	_.Ballista.level = 						11;
	_.OrcChaosKnight.level =				12;
	_.OgreShaman.level =					12;
	_.Minotaur.level =						12;
	
	// MINOR_BOSS:
	_.TheArcheryCaptain.level =				13;
	_.TheCrystalCaptain.level =				13;

	// MAJOR_BOSS:
    _.KingMonRacar.level =					16;
	_.ManfridTheMinotaurKing.level =		16;
	_.ThurgTheHighShaman.level =			16;
	
	// THE_DARK_TEMPLE:
	// ********************************************************************************************
	// Zone Level 1/2/3:
	_.DarkElfWarrior.level = 				7;
	_.DarkElfArcher.level =					7;
	_.DarkElfAssassin.level =				7;
	_.DarkElfPyromancer.level =				8;
	_.DarkElfStormologist.level =			8;
	_.DarkElfCryomancer.level =				8;
	_.DarkElfSummoner.level =				9;
	
	// Zone Level 4/5/6:
	_.DarkElfPriest.level =					11;
	_.DrachnidWarrior.level =				11;
	_.DrachnidArcher.level =				11;
	_.SummoningStatue.level =				12;
	_.ArcaneArcher.level =					12;
	_.MindFlayer.level =					12;
	
	// MINOR_BOSS:
	_.TheCrystalArcher.level =				13;
	_.MorrgueTheMindFlayer.level =			13;
	
	// MAJOR_BOSS:
	_.DherossoTheDemonologist.level =		16;
	_.PorecsaTheHighPriestess.level =		16;
	_.TheDrachnidQueen.level =				16;
	
	
	
	// THE_SEWERS:
	// ********************************************************************************************
	// Zone Level 1/2:
	_.SewerRat.level = 						8;
	_.GiantLeach.level = 					9;
	_.SewerRatNest.level = 					9;
	_.TrollWarrior.level = 					9;
	_.TrollArcher.level = 					9;
	_.Crocodile.level = 					9;
	_.Bloat.level = 						10;
	_.TrollShaman.level = 					10;
	_.BlackMamba.level = 					10;
	_.BoaConstrictor.level = 				10;
	
	// Zone Level 3/4:
	_.Slime.level = 						12;
	_.TentacleSpitter.level = 				12;
	_.AcidicSlime.level = 					13;
	_.CorrosiveSlime.level = 				13;
	_.ToxicStatue.level = 					13;
	
	// MINOR_BOSS:
	_.LockJaw.level =						14;
	_.ThePlagueDoctor.level = 				14;
	
	// MAJOR_BOSS XL16:
	_.TheKraken.level =						16;
	_.ExpanderisTheSlimeKing.level =		16;
	_.Tentacle.level =						13;
	
	// THE_CORE:
	// ********************************************************************************************
	// Zone Level 1/2:
	_.FireBat.level = 						8;
	_.FireBatNest.level = 					9;
	_.FireLizard.level = 					9;
	_.FlameSpinner.level = 					9;
	_.LavaEel.level = 						10;
	_.ObsidianGolem.level =					10;
	
	// Zone Level 3/4:	
	_.FlameVortex.level =					12;
	_.FireElemental.level = 				13;
	_.FireStatue.level = 					13;
	
	// MINOR_BOSS:
	_.AjaxTheFlameShaman.level =			14;
	_.TheFlameSpinnerQueen.level = 			14;
	
	// MAJOR_BOSS:
	_.TheEfreetiLord.level =				16;
	_.LavosaTheEelQueen.level =				16;
	
	// MISC:
	_.HomingFireOrb.level = 				7;
	
	// THE_ICE_CAVES:
	// ********************************************************************************************
	// Zone Level 1/2:
	_.DireWolf.level = 						8;
	_.DireWolfKennel.level = 				9;
	_.GnollWarrior.level =					9;
	_.GnollArcher.level =					9;
	_.Yak.level =							10;
	_.Penguin.level =						10;
	_.PolarBear.level = 					10;
	
	// Zone Level 3/4:
	_.FrostVortex.level =					12;
	_.IceElemental.level = 					13;
	_.IceStatue.level = 					13;
	_.FrostGiant.level =					13;
	
	// MINOR_BOSS XL14:
	_.BeastMasterNyx.level =				14;
	_.IceBerg.level =						14;
	
	// MAJOR_BOSS XL16:
	_.GraxTheFrostShaman.level = 			16;
	_.TheFrostGiantKing.level =				16;
	
	// THE_CRYPT (TIER_III):
	// ********************************************************************************************
	// Zone Level 1/2:
	_.Maggot.level = 						11;
	_.VampireBat.level =					11;
	_.RottingCorpse.level = 				12;
	_.SkeletonWarrior.level = 				12;
	_.SkeletonArcher.level = 				12;
	_.CryptCrawler.level =					13;
	_.Necromancer.level =					13;
	_.ZombieBloat.level = 					13;
	
	// Zone Level 3/4:
	_.BoneVortex.level =					15;
	_.Wraith.level =						15;
	_.PestilencePriest.level =				16;
	_.FleshGolem.level =					16;
	
	// MINOR_BOSS:
	_.TheSkeletalChampion.level =			16;
	_.TheTormentedMarksman.level =			16;

	// MAJOR_BOSS:
	_.TheLichKing.level = 					18;
	_.TheVampireLord.level =				18;
	
		
	// THE_IRON_FORGE (TIER_III):
	// ********************************************************************************************	
	// Zone Level 1/2:
	_.ClockworkRat.level =					11;
	_.Bombomber.level =						11;
	_.ClockworkArcher.level = 				12;
	_.ClockworkWarrior.level = 				12;
	_.ClockworkFactory.level = 				12;
	_.ClockworkBomber.level = 				13;
	_.ClockworkPyro.level =					13;
	
	// Zone Level 3/4:
	_.ClockworkKnight.level = 				15;
	_.CannonTurret.level =					15;
	_.PyroTurret.level =					15;
	_.ClockworkRhino.level =				16;
	_.WarEngine.level =						16;
	
	// MINOR_BOSS:
	_.MarkIIClockworkWarrior.level =		16;
	_.MarkIIClockworkArcher.level =			16;
	
	// MAJOR_BOSS:
	_.TheForgeMaster.level =				18;
	_.CannonModule.level = 					18;
	_.PyroModule.level = 					18;
	_.BombModule.level = 					18;
	_.RepairModule.level = 					18;
	_.ControlModule.level = 				18;
	
	_.CannonModuleDead.level =				18;
	_.PyroModuleDead.level =				18;
	_.BombModuleDead.level =				18;
	_.RepairModuleDead.level =				18;
	
	
	// THE_ARCANE_TOWER (TIER_3):
	// ********************************************************************************************
	// Zone Level 1/2:
	_.FireImp.level = 						12;
	_.StormImp.level = 						12;
	_.IceImp.level = 						12;
	_.IronImp.level =						12;
	_.ManaViper.level =						12;
	_.StormVortex.level = 					12;
	_.StormElemental.level = 				13;
	_.StormStatue.level = 					13;
	
	// Zone Level 3/4:
	_.EvilEye.level =						15;
	_.StoneGolem.level = 					15;
	_.FireStaffTurret.level = 				16;
	_.Demonologist.level =					16;
	
	// MAJOR_BOSS XL16:
	_.CazelTheConjuror.level =				18;
	_.DelasTheDjinniLord.level =			18;
	
	
	// THE_VAULT_OF_YENDOR (TIER_4):
	// ********************************************************************************************	
	// Zone Level 1:
	_.HellHound.level = 					14;
	_.HellGate.level =						14;
	_.KnightOfYendor.level =				14;
	_.DeathWatchArcher.level =				14;
	_.BladeDancer.level = 					14;
	_.Demotaur.level =						14;
	
	// Zone Level 2:
	_.CrystalGolem.level =					15;
	_.IndigoSlime.level =					15;
	_.FrostLich.level =						15;
	_.InfernoLich.level =					15;
	_.StormLich.level =						15;
	_.ToxicLich.level =						15;
	
	// Zone Level 3:
	_.VaultChaosPriest.level =				16;
	_.TentacleTerror.level =				16;
	_.Succubus.level =						16;
	_.GuardianStatue.level =				16;
	
	// MAJOR_BOSS:
	_.TheWizardYendorFire.level =			20;
	_.TheWizardYendorStorm.level =			20;
	_.TheWizardYendorIce.level =			20;
	_.TheWizardYendorToxic.level =			20;
	_.TheWizardYendorMagic.level =			20;
	
	

	
	// MISC:
	// ********************************************************************************************
	// Summons (level is set by summoner):
	_.SpectralBlade.level =	0;
	_.FlamingBlade.level = 0;
	_.BattleSphereOfFire.level = 0;
	_.BattleSphereOfStorm.level = 12;
	_.FlamingBattleSphere.level = 0;
	_.ArcaneBattleSphere.level = 12;
	
	_.Skeleton.level = 4;
	_.OrbOfFire.level = 0;
	_.Tornado.level = 0;
	_.Tornado.level = 0;
	_.ArcaneArrow.level = 0;
	_.FireArrow.level = 0;
	_.IceArrow.level = 0;
	_.ShockArrow.level = 0;
	_.PoisonArrow.level = 0;
	_.OrbOfStorm.level = 0;
	_.SpiderEgg.level = 1;
	_.HellPortal.level = 1;
	_.FirePot.level = 1;
	_.GasPot.level = 1;
	_.Merchant.level = 1;
	_.TheLibrarian.level = 1;
	_.TalentTrainer.level = 1;
	_.Enchanter.level = 1;
	_.Priest.level = 1;
	_.Crate.level = 1;
	_.PracticeDummy.level = 1;
	_.CryptAltar.level = 1;
	_.GobletShield.level = 20;
};

// SET_NPC_TYPE_FRAMES:
// ************************************************************************************************
gs.setNPCTypeFrames = function () {
	let _ = this.npcTypes;
	
	// THE_UPPER_DUNGEON:
	// ********************************************************************************************
	// Standard Monsters:
	_.Rat.frame 						= 512;
	_.Bat.frame 						= 513;
	_.RatNest.frame 					= 514;
	_.GoblinWarrior.frame 				= 515;
	_.GoblinArcher.frame 				= 516;
	_.GoblinBrute.frame 				= 517;
	_.GoblinSlaver.frame 				= 518;
	_.GoblinFireMage.frame 				= 519;
	_.GoblinStormMage.frame 			= 520;
	_.GoblinShaman.frame 				= 521;
	_.Centipede.frame 					= 522;
	_.CaveBear.frame 					= 523;
	
	// Boss Monsters:
	_.UmbraTheHighShaman.frame          = 536;
	_.BlastoTheArchMagi.frame 		    = 537;
    _.ArgoxTheWarlord.frame             = 538;
	_.TheRatPiper.frame 				= 539;
	_.TheVampireBat.frame 				= 540;
	_.BojackTheBerserker.frame			= 541;
	_.ArgylTheSwift.frame				= 542;
	_.TheAncientCaveBear.frame			= 543;
	
	// THE_UNDER_GROVE:
	// ********************************************************************************************
	// Standard Monsters:
	_.Jaguar.frame 						= 544;
	_.Spider.frame 						= 545;
	_.SpiderNest.frame 					= 546;
	_.PoisonSpider.frame 				= 547;
	_.GiantBee.frame 					= 548;
	_.CentaurArcher.frame 				= 549;
	_.CentaurWarrior.frame 				= 550;
	_.Chameleon.frame 					= 551;
	_.Elephant.frame 					= 552;
	_.BeeHive.frame 					= 553;
	_.CorruptedDruid.frame				= 554;
	
	// Boss Monsters:
	_.TheCorruptedEnt.frame 			= 568;
	_.TheQueenSpider.frame 				= 569;
	_.TheCatLord.frame 					= 570;
	_.TheCentaurKing.frame 				= 571;
	
	// Misc:
	_.Root.frame 						= 1062;
	
	// THE_SWAMP:
	// ********************************************************************************************
	// Standard Monsters:
	_.Pirahna.frame 					= 576;
	_.PoisonViper.frame 				= 577;
	_.BlinkFrog.frame 					= 578;
	_.Mosquito.frame 					= 579;
	_.SpinyFrog.frame 					= 580;
	_.ElectricEel.frame 				= 581;
	_.BullFrog.frame 					= 582;
	_.GiantAnt.frame 					= 583;
	_.LickyToad.frame 					= 584;
	_.SnappingTurtle.frame 				= 585;
	_.SwampFungoid.frame				= 586; 
	
	// Boss Monsters:
	_.KasicTheMosquitoPrince.frame 		= 600;
	_.GixloTheWitchDoctor.frame 		= 601;
	_.IraTheSwampSiren.frame 			= 602;
	_.FergusTheFungusKing.frame			= 603;
	
	// Misc:
	_.Fungling.frame					= 1064;
	_.SnappingTurtle.shellFrame			= 1103;
	
	// THE_SUNLESS_DESERT:
	// ********************************************************************************************
	// Standard Monsters:
	_.Scarab.frame 						= 608;
	_.ScarabUrn.frame 					= 609;
	_.SpittingViper.frame 				= 610;
	_.TrapDoorSpider.frame 				= 611;
	_.Scorpion.frame 					= 612;
	_.Goat.frame 						= 613;
	_.SunFlower.frame 					= 614;
	_.DervishRaider.frame 				= 617;
	_.DervishArcher.frame 				= 618;
	_.DervishMagi.frame 				= 619;
	_.Mummy.frame 						= 621;
	_.MummyPriest.frame 				= 622;
	
	// Boss Monsters:
	_.CylomarTheAncientPyromancer.frame = 632;
	_.KingUrazzoTheAncient.frame 		= 633;
	_.TheKingOfThieves.frame 			= 634;
	_.SynaxTheSnakeCharmer.frame		= 635;
	
	// THE_ORC_FORTRESS:
	// ********************************************************************************************
	// Standard Monsters:
	_.Wolf.frame 						= 640;
	_.WolfKennel.frame 					= 641;
	_.OrcWarrior.frame 					= 642;
	_.OrcArcher.frame 					= 643;
	_.OrcBerserker.frame 				= 645;
	_.OrcSlaver.frame 					= 646;
	_.OrcPyromancer.frame 				= 647;
	_.OrcCryomancer.frame 				= 648;
	_.Ogre.frame 						= 649;
	_.OrcPriest.frame 					= 650;
	_.Minotaur.frame 					= 651;
	_.OgreShaman.frame					= 652;
	_.Ballista.frame 					= 653;
	_.OrcChaosKnight.frame 				= 654;
	
	// Boss Monsters:
	_.KingMonRacar.frame 				= 664;
	_.TheCrystalCaptain.frame 			= 666;
	_.ThurgTheHighShaman.frame 			= 667;
	_.TheArcheryCaptain.frame 			= 668;
	_.ManfridTheMinotaurKing.frame		= 669;
	
	// THE_DARK_TEMPLE:
	// ********************************************************************************************
	// Standard Monsters:
	_.DarkElfWarrior.frame 				= 896;
	_.DarkElfArcher.frame				= 897;
	_.DarkElfAssassin.frame				= 898;
	_.DarkElfPyromancer.frame			= 899;
	_.DarkElfStormologist.frame			= 900;
	_.DarkElfCryomancer.frame			= 901;
	_.DarkElfSummoner.frame				= 902;
	_.DarkElfPriest.frame				= 903;
	_.ArcaneArcher.frame				= 904;
	_.MindFlayer.frame					= 905;
	_.DrachnidWarrior.frame 			= 906;
	_.DrachnidArcher.frame 				= 907;
	_.SummoningStatue.frame 			= 912;
	
	
	// Boss Monsters:
	_.TheCrystalArcher.frame			= 920;
	_.DherossoTheDemonologist.frame 	= 921;
	_.PorecsaTheHighPriestess.frame		= 922;
	_.TheDrachnidQueen.frame			= 923;
	_.MorrgueTheMindFlayer.frame		= 924;
	
	// THE_CORE:
	// ********************************************************************************************
	// Standard Monsters
	_.FireBat.frame 					= 672;
	_.FireBatNest.frame 				= 673;
	_.FireLizard.frame 					= 674;
	_.FlameSpinner.frame				= 675;
	_.LavaEel.frame 					= 676;
	_.ObsidianGolem.frame 				= 677;
	
	
	_.FireStatue.frame 					= 688;
	_.FireElemental.frame 				= 689;
	_.FlameVortex.frame 				= 690;
	
	// Boss Monsters:
	_.TheEfreetiLord.frame 				= 696;
	_.AjaxTheFlameShaman.frame 			= 697;
	_.TheFlameSpinnerQueen.frame		= 698;
	_.LavosaTheEelQueen.frame				= 699;
	

	// THE_ICE_CAVES:
	// ********************************************************************************************
	// Standard Monsters:
	_.DireWolf.frame 					= 704;
	_.DireWolfKennel.frame 				= 705;
	_.Penguin.frame 					= 706;
	_.PolarBear.frame 					= 707;
	_.Yak.frame 						= 708;
	_.GnollWarrior.frame 				= 712;
	_.GnollArcher.frame 				= 713;
	_.FrostGiant.frame 					= 716;
	_.IceStatue.frame 					= 720;
	_.IceElemental.frame 				= 721;
	_.FrostVortex.frame 				= 722;
	
	
	// Boss Monsters:
	_.GraxTheFrostShaman.frame 			= 728;
	_.IceBerg.frame 					= 729;
	_.BeastMasterNyx.frame 				= 730;
	_.TheFrostGiantKing.frame			= 731;
	
	// Misc:
	_.Penguin.slideFrame 				= 1104;
	
	// THE_SEWERS:
	// ********************************************************************************************
	// Standard Monsters:
	_.SewerRat.frame 					= 736;
	_.SewerRatNest.frame				= 737;
	_.GiantLeach.frame 					= 738;
	_.BoaConstrictor.frame				= 739;
	_.BlackMamba.frame					= 740;
	_.Crocodile.frame 					= 741;
	_.TentacleSpitter.frame 			= 742;
	_.Bloat.frame 						= 743;
	_.Slime.frame 						= 745;
	_.AcidicSlime.frame 				= 746;
	_.TrollWarrior.frame 				= 748;
	_.TrollArcher.frame 				= 749;
	_.TrollShaman.frame 				= 750;
	_.ToxicStatue.frame 				= 752;
	
	// Boss Monsters:
	_.ExpanderisTheSlimeKing.frame 		= 760;
	_.LockJaw.frame 					= 761;
	_.ThePlagueDoctor.frame				= 762;
	_.TheKraken.frame					= 763;
	_.Tentacle.frame					= 764;
	
	// Misc:
	_.Slime.smallFrame					= 1094;
	_.AcidicSlime.smallFrame			= 1097;
	
	// THE_ARCANE_TOWER:
	// ********************************************************************************************
	// Standard Monsters:
	_.ManaViper.frame 					= 768;
	_.FireImp.frame 					= 769;
	_.StormImp.frame 					= 770;
	_.IceImp.frame 						= 771;
	_.IronImp.frame 					= 772;
	_.FireStaffTurret.frame 			= 773;
	_.StoneGolem.frame 					= 775;
	_.EvilEye.frame						= 776;
	_.Demonologist.frame				= 777;
	_.StormStatue.frame 				= 784;
	_.StormElemental.frame				= 785;
	_.StormVortex.frame					= 786;
	
	
	// Boss Monsters:
	_.CazelTheConjuror.frame			= 792;
	_.DelasTheDjinniLord.frame			= 793;
	
	// THE_CRYPT:
	// ********************************************************************************************
	// Standard Monsters:
	_.Maggot.frame 						= 800;
	_.RottingCorpse.frame 				= 801;
	_.VampireBat.frame 					= 802;
	_.CryptCrawler.frame 				= 803;
	_.ZombieBloat.frame 				= 804;
	_.FleshGolem.frame 					= 805;
	_.Wraith.frame 						= 806;
	_.SkeletonWarrior.frame 			= 808;
	_.SkeletonArcher.frame 				= 809;
	_.Necromancer.frame 				= 812;
	_.PestilencePriest.frame 			= 813;
	_.BoneVortex.frame 					= 818;
	
	// Boss Monsters:
	_.TheLichKing.frame 				= 824;
	_.TheSkeletalChampion.frame 		= 825;
	_.TheTormentedMarksman.frame 		= 826;
	_.TheVampireLord.frame				= 830;
	
	// THE_IRON_FORGE:
	// ********************************************************************************************
	// Standard Monsters:
	_.ClockworkRat.frame 				= 832;
	_.ClockworkFactory.frame 			= 833;
	_.Bombomber.frame 					= 834;
	_.ClockworkWarrior.frame 			= 835;
	_.ClockworkArcher.frame 			= 836;
	_.ClockworkBomber.frame 			= 837;
	_.ClockworkRhino.frame 				= 839;
	_.ClockworkPyro.frame 				= 840;
	_.CorrosiveSlime.frame 				= 841;
	_.WarEngine.frame 					= 842;
	_.CannonTurret.frame				= 848;
	_.PyroTurret.frame					= 849;
	_.ClockworkKnight.frame				= 843;
	
	// Boss Monsters:
	_.MarkIIClockworkWarrior.frame 		= 856;
	_.MarkIIClockworkArcher.frame 		= 857;
	_.TheForgeMaster.frame				= 858;
	_.CannonModule.frame				= 1138;
	_.PyroModule.frame					= 1139;
	_.RepairModule.frame				= 1140;
	_.BombModule.frame					= 1141;
	_.ControlModule.frame				= 1142;
	
	// Dead:
	_.CannonModuleDead.frame 			= 1143;
	_.PyroModuleDead.frame 				= 1143;
	_.BombModuleDead.frame 				= 1143;
	_.RepairModuleDead.frame 			= 1143;
	
	// Turrets:
	_.CannonTurret.sprite0				= 1074;
	_.CannonTurret.sprite90				= 1075;
	_.CannonTurret.sprite180			= 1076;
	_.CannonTurret.sprite270			= 1077;
	_.CannonTurret.retractFrame			= 1078;
	
	_.PyroTurret.sprite0				= 1106;
	_.PyroTurret.sprite90				= 1107;
	_.PyroTurret.sprite180				= 1108;
	_.PyroTurret.sprite270				= 1109;
	_.PyroTurret.retractFrame			= 1110;
	
	_.CannonModule.sprite0				= 1138;
	_.CannonModule.sprite90				= 1170;
	_.CannonModule.sprite180			= 1171;
	_.CannonModule.sprite270			= 1172;
	
	_.PyroModule.sprite0				= 1139;
	_.PyroModule.sprite90				= 1202;
	_.PyroModule.sprite180				= 1203;
	_.PyroModule.sprite270				= 1204;
	
	// Misc:
	_.WarEngine.verticalBaseFrame 		= 1092;
	_.WarEngine.horizontalBaseFrame 	= 1093;
	_.WarEngine.sprite0					= 1088;
	_.WarEngine.sprite90				= 1089;
	_.WarEngine.sprite180				= 1090;
	_.WarEngine.sprite270				= 1091;
	_.CorrosiveSlime.smallFrame			= 1100;
	_.ClockworkKnight.shieldsUpFrame	= 1079;
	
	_.CannonModule.verticalBaseFrame 	= 1092;
	_.CannonModule.horizontalBaseFrame 	= 1093;
	_.PyroModule.verticalBaseFrame 		= 1092;
	_.PyroModule.horizontalBaseFrame 	= 1093;
	_.BombModule.verticalBaseFrame 		= 1092;
	_.BombModule.horizontalBaseFrame 	= 1093;
	_.RepairModule.verticalBaseFrame 	= 1092;
	_.RepairModule.horizontalBaseFrame 	= 1093;
	_.ControlModule.verticalBaseFrame 	= 1092;
	_.ControlModule.horizontalBaseFrame = 1093;
	
	// Dead:
	_.CannonModuleDead.verticalBaseFrame 	= 1092;
	_.CannonModuleDead.horizontalBaseFrame 	= 1093;
	_.PyroModuleDead.verticalBaseFrame 		= 1092;
	_.PyroModuleDead.horizontalBaseFrame 	= 1093;
	_.RepairModuleDead.verticalBaseFrame 	= 1092;
	_.RepairModuleDead.horizontalBaseFrame 	= 1093;
	_.BombModuleDead.verticalBaseFrame 		= 1092;
	_.BombModuleDead.horizontalBaseFrame 	= 1093;
	
	// THE_VAULT_OF_YENDOR:
	// ********************************************************************************************
	// Standard Monsters:
	_.HellHound.frame 					= 864;
	_.HellGate.frame					= 865;
	_.KnightOfYendor.frame				= 866;
	_.DeathWatchArcher.frame			= 867;
	_.BladeDancer.frame 				= 868;
	_.Demotaur.frame					= 869;
	_.CrystalGolem.frame 				= 870;
	_.IndigoSlime.frame 				= 871;
	_.FrostLich.frame					= 872;
	_.InfernoLich.frame 				= 873;
	_.StormLich.frame 					= 874;
	_.ToxicLich.frame					= 875;
	_.VaultChaosPriest.frame 			= 876;
	_.TentacleTerror.frame 				= 877;
	_.Succubus.frame 					= 878;
	_.GuardianStatue.frame				= 880;
	
	// Major Bosses:
	_.TheWizardYendorFire.frame 		= 1016;
	_.TheWizardYendorStorm.frame 		= 1017;
	_.TheWizardYendorIce.frame	 		= 1018;
	_.TheWizardYendorToxic.frame 		= 1019;
	_.TheWizardYendorMagic.frame 		= 1020;
	
	// Misc:
	_.GobletShield.frame 				= 1015;
	_.IndigoSlime.smallFrame			= 1065;
	
	// FRIENDLY_NPCS:
	// ********************************************************************************************
	_.PracticeDummy.frame 				= 992;
	_.Merchant.frame 					= 993;
	_.TheLibrarian.frame 				= 994;
	_.TalentTrainer.frame 				= 996;
	_.Enchanter.frame 					= 998;
	_.Priest.frame 						= 997;
	
	// DESTRUCTABLE_OBJECTS:
	// ********************************************************************************************
	_.FirePot.frame 					= 1000;
	_.GasPot.frame 						= 1001;
	_.SpiderEgg.frame 					= 1002;
	_.HellPortal.frame 					= 1003;
	_.Crate.frame 						= 1004;
	_.CryptAltar.frame 					= 1005;
	
	// SLOW_PROJECTILES:
	_.OrbOfFire.frame 					= 1056;
	_.HomingFireOrb.frame 				= 1056;
	_.OrbOfStorm.frame 					= 1057;
	_.ArcaneArrow.frame 				= 1058;
	_.FireArrow.frame					= 1080;
	_.IceArrow.frame					= 1081;
	_.ShockArrow.frame					= 1082;
	_.PoisonArrow.frame					= 1083;
	_.Tornado.frame						= 1060;
	
	// SUMMONS:
	// ********************************************************************************************
	_.Skeleton.frame 					= 1068;
	_.SpectralBlade.frame 				= 1069;
	_.FlamingBlade.frame 				= 1070;
	_.BattleSphereOfFire.frame			= 1071;
	_.FlamingBattleSphere.frame			= 1071;
	_.BattleSphereOfStorm.frame			= 1072;
	_.ArcaneBattleSphere.frame			= 1073;
};

// SET_NPC_TYPE_DEFAULT_PROPERTIES:
// ************************************************************************************************
gs.setNPCTypeDefaultProperties = function () {
	var defaultProperties, requiredProperties;
	
	this.npcTypeList = [];
	
	// Use this to quickly define required properties:
	// Required properties will throw an error if non-existant
	requiredProperties = ['level', 'frame'];

	// Use this to quickly define default properties:
	defaultProperties = [
		{name: 'faction',					val: FACTION.HOSTILE},
		{name: 'movementSpeed',				val: MOVEMENT_SPEED.NORMAL},
		{name: 'dropPercent',				val: 0},
		{name: 'spawnType',					val: [SPAWN_TYPE.DEFAULT]},
		{name: 'bloodTypeName',				val: 'Blood'},
		{name: 'isSlowProjectile',			val: false},
		{name: 'reflection',				val: 0},
		{name: 'evasion',					val: 0},
		{name: 'cropScaleFactor',			val: 0.35},
		{name: 'size',						val: CHARACTER_SIZE.MEDIUM},
		{name: 'immunities',				val: {}},
		{name: 'canOpenDoors',				val: true},
		{name: 'damageShield',				val: {}},
		{name: 'maxMp',						val: 0},
		{name: 'resistance',				val: {}},
		{name: 'protection',				val: 0},
		{name: 'statusEffectImmunities',	val: []},
		{name: 'abilityTypes',				val: []},
		{name: 'regenPerTurn',				val: 0},
		{name: 'canOpenDoors',				val: true},
		{name: 'minRange',					val: 0},
		{name: 'isDamageImmune',			val: 0},
		{name: 'isLavaImmune',				val: 0},
		{name: 'poofColor',					val: 'PURPLE'},
	];
	
	gs.forEachType(this.npcTypes, function (npcType) {
		this.npcTypeList.push(npcType);
		
		// Checking required properties:
		requiredProperties.forEach(function (e) {
			if (!npcType.hasOwnProperty(e)) {
				throw 'npcType missing ' + e + ': ' + npcType.name;
			}
		}, this);
		
		// Setting default properties:
		defaultProperties.forEach(function (e) {
			if (!npcType.hasOwnProperty(e.name)) {
				npcType[e.name] = e.val;
			}
		}, this);
		
		
		// Max HP:
		if (!npcType.maxHp) {
			npcType.maxHp = this.npcMaxHp(npcType.level, npcType);
		}
		
		// Abilities:
		for (let i = 0; i < npcType.abilityTypes.length; i += 1) {
			let niceName = npcType.abilityTypes[i].niceName;
			
			npcType.abilityTypes[i] = gs.createNPCAbilityType(npcType, npcType.abilityTypes[i].typeName, npcType.abilityTypes[i].stats);
			
			if (niceName) {
				npcType.abilityTypes[i].niceName = niceName;
			}
		}
		
		// Setting minAbilityRange:
		let minAbilityRange = LOS_DISTANCE;
		for (let i = 0; i < npcType.abilityTypes.length; i += 1) {
			if (npcType.abilityTypes[i].range) {
				if (typeof npcType.abilityTypes[i].range === 'function') {
					minAbilityRange = Math.min(minAbilityRange, npcType.abilityTypes[i].range());
				}
				else {
					minAbilityRange = Math.min(minAbilityRange, npcType.abilityTypes[i].range);
				}
				
			}
		}
		npcType.minAbilityRange = minAbilityRange;
		
		// On Death:
		if (npcType.onDeath) {
			npcType.onDeath = gs.createNPCAbilityType(npcType, npcType.onDeath.typeName, npcType.onDeath.stats);
		}
		
		// On Dominate:
		if (npcType.onDominate) {
			npcType.onDominate = gs.createNPCAbilityType(npcType, npcType.onDominate.typeName, npcType.onDominate.stats);
		}
		
		// Setting resistance:
		DAMAGE_TYPES.forEach(function (damageType) {
			if (npcType.resistance[damageType]) {
				// Protection is a special
				if (damageType === 'Physical') {
					npcType.protection = Math.ceil(npcType.level * 0.5);
				}
				else if (npcType.resistance[damageType] === 1) {
					npcType.resistance[damageType] = 1.0;
				}
				else if (npcType.resistance[damageType] === -1) {
					npcType.resistance[damageType] = -0.5;
				}
			}
			else {
				npcType.resistance[damageType] = 0;
			}
		}, this);
		
		// DAMAGE_SHIELD:
		DAMAGE_TYPES.forEach(function (damageType) {
			// Setting to 0:
			if (!npcType.damageShield[damageType]) {
				npcType.damageShield[damageType] = 0;
			}
			// Level scaled damage:
			else {
				npcType.damageShield[damageType] = gs.npcDamage(npcType.level, npcType.damageShield[damageType]);
			}
		}, this);
		
		
		// Speed:
		if (npcType.movementSpeed === 'NONE') {
			npcType.isImmobile = true;
			npcType.isUnstableImmune = true;
		}
					
		// Exp:
		npcType.exp = 10 + npcType.level;
		
		// Boss Enemy Types:
		if (npcType.isBoss) {
			npcType.exp = npcType.exp * 4;
		}
		
		// Weak Enemy Types:
		if (this.isWeakNPCType(npcType)) {
			npcType.exp = Math.ceil(npcType.exp * 0.25);
		}
	}, this);
	
	
	
	// Some characters have no exp value:
	this.npcTypes.Skeleton.exp = 0;
	this.npcTypes.FirePot.exp = 0;
	this.npcTypes.OrbOfFire.exp = 0;
	this.npcTypes.HomingFireOrb.exp = 0;
	this.npcTypes.GasPot.exp = 0;
	this.npcTypes.Crate.exp = 0;
	this.npcTypes.ArcaneArrow.exp = 0;
	this.npcTypes.FireArrow.exp = 0;
	this.npcTypes.IceArrow.exp = 0;
	this.npcTypes.ShockArrow.exp = 0;
	this.npcTypes.PoisonArrow.exp = 0;
	this.npcTypes.CannonModuleDead.exp = 0;
	this.npcTypes.PyroModuleDead.exp = 0;
	this.npcTypes.BombModuleDead.exp = 0;
	this.npcTypes.RepairModuleDead.exp = 0;
};

// VERIFY_NPC_TYPES:
// ************************************************************************************************
gs.verifyNPCTypes = function () {
	gs.forEachType(this.npcTypes, function (npcType) {
		// Verify Drop Table:
		if (npcType.dropTable) {
			npcType.dropTable.forEach(function (e) {
				if (!gs.itemTypes[e.name]) {
					throw 'VERIFICATION ERROR [createNPCTypes] - invalid itemType: ' + e.name;
				}
			}, this);
		}
		
	}, this);
};

// IS_WEAK_NPC_TYPE:
// A weak NPC typically appears in swarms of 3 or more
// Ths function is used to automatically detect weak enemy types and adjust their exp value accordingly.
// ************************************************************************************************
gs.isWeakNPCType = function (npcType) {
	if (npcType.faction !== FACTION.HOSTILE) {
		return false;
	}
	
	return util.inArray(npcType.name, [
		'Rat',
		'Bat',
		'RatNest',
		'Wolf',
		'WolfKennel',
		'Scarab',
		'ScarabUrn',
		'HellHound',
		'HellGate',
		'ClockworkRat',
		'ClockworkFactory',
		'Bombomber',
		'Maggot',
		'RottingCorpse',
		'VampireBat',
		'DireWolf',
		'DireWolfKennel',
		'SewerRat',
		'SewerRatNest',
		'FireBat',
		'FireBatNest',
		'Pirahna',
		'BlinkFrog',
		'SpiderNest',
		'GiantAnt',
		'GiantBee',
		'BeeHive',
		'Wraith',
	]);
};

// NPC_DAMAGE:
// ************************************************************************************************
gs.npcDamage = function (level, type) {
	// Preset damage:
	if (typeof type === 'number') {
		return type;
	}
	
	if (!NPC_INITIAL_DAMAGE[type]) throw 'Invalid damageType: ' + type;
	
	return Math.round(NPC_INITIAL_DAMAGE[type] + (level - 1) * NPC_DAMAGE_PER_LEVEL[type]);
};

// NPC_MAX_HP:
// ************************************************************************************************
gs.npcMaxHp = function (level, npcType) {
	if (!NPC_INITIAL_HP[npcType.hitPointType]) throw 'Invalid hpType: ' + npcType.name;
	
	// Linear:
	let val = Math.round(NPC_INITIAL_HP[npcType.hitPointType] + (level - 1) * NPC_HP_PER_LEVEL[npcType.hitPointType]);
	
	// Boss HP:
	if (npcType.isBoss) {
		val = Math.ceil(val * 3.0);
	}
	// Additional hit points for high level monsters (not bosses):
	else {
		if (level === 12) 	val *= 1.05;
		if (level === 13)	val *= 1.10;
		if (level === 14) 	val *= 1.15;
		if (level === 15)	val *= 1.20;
		if (level === 16)	val *= 1.25;
	}
	
	// Rounding to nearest 5:
	if (val >= 20) {
		val = Math.round(val / 5 ) * 5;
		/*
		// Round down for Low - MLow:
		if (npcType.hitPointType === 'LOW' || npcType.hitPointType === 'MLOW') {
			val = Math.floor(val / 5 ) * 5;
		}
		// Round up for Med - High
		else {
			val = Math.ceil(val / 5 ) * 5;
		}
		*/
	}
	
	return val;
};



// CREATE_NPC_CLASS_TYPES:
// ************************************************************************************************
gs.createNPCClassTypes = function () {
	this.npcClassTypes = {};
	
	// TOUGH:
	this.npcClassTypes.Tough = {};
	this.npcClassTypes.Tough.effect = function (npc) {
		// Tripple HP (same as bosses):
		npc.maxHp += npc.type.maxHp * 2;
	};
	
	// STRONG:
	this.npcClassTypes.Strong = {};
	this.npcClassTypes.Strong.effect = function (npc) {
		npc.bonusMeleeDamage += Math.ceil(npc.level / 2);
	
		// Double HP:
		npc.maxHp += npc.type.maxHp;
	};
	
	// BLINKING:
	this.npcClassTypes.Blinking = {};
	this.npcClassTypes.Blinking.onHit = this.npcOnHit.BlinkFrog;
	this.npcClassTypes.Blinking.effect = function (npc) {
		// Double HP:
		npc.maxHp += npc.type.maxHp;
	};
	
	// REGENERATING:
	this.npcClassTypes.Regenerating = {};
	this.npcClassTypes.Regenerating.effect = function (npc) {
		npc.regenPerTurn += 0.05;
		
		// Double HP:
		npc.maxHp += npc.type.maxHp;
	};
	
	// FAST:
	this.npcClassTypes.Fast = {};
	this.npcClassTypes.Fast.effect = function (npc) {
		npc.movementSpeed += 2;
		
		// Double HP:
		npc.maxHp += npc.type.maxHp;
	};
	
	// SPINY:
	this.npcClassTypes.Spiny = {};
	this.npcClassTypes.Spiny.effect = function (npc) {
		npc.damageShield.Physical += gs.npcDamage(npc.level, 'LOW');
		
		// Double HP:
		npc.maxHp += npc.type.maxHp;
	};
	
	this.nameTypes(this.npcClassTypes);
};

// GET_NPC_CLASS_TYPE:
// ************************************************************************************************
gs.getNPCClassType = function (npcTypeName) {
	var npcType = this.npcTypes[npcTypeName],
		validList = [];
	
	if (npcType.isBoss) {
		return null;
	}
	
	// Tough:
	validList.push('Tough');
	
	// Fast:
	if (npcType.movementSpeed < 2 && !npcType.isImmobile) {
		validList.push('Fast');
	}
	
	// Strong:
	if (npcType.abilityTypes.find(e => e.name === 'MeleeAttack')) {
		validList.push('Strong');
	}
	
	// Regenerating:
	if (!npcType.noRegen && !npcType.updateTurn) {
		validList.push('Regenerating');
	}
	
	// Blinking:
	if (!npcType.onHit && !npcType.isImmobile) {
		validList.push('Blinking');
	}
	
	// Spiny
	if (!npcType.damageShield) {
		validList.push('Spiny');
	}
	
	return this.npcClassTypes[util.randElem(validList)];
};