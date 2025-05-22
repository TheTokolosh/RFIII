/*global game, gs, util*/
/*global Item*/
/*global STAT_AS_PERCENT, ROMAN_NUMERAL, NICE_STAT_NAMES*/
/*jshint esversion: 6, loopfunc: true*/
'use strict';

let MAX_TALENT_RANK = 2;

/*
// UPDATE 1.36
let ATTR_REQS = [
	null,
	[null, 10, 14],
	[null, 14, 18],
	[null, 16, 20]
];
*/

/*
// UPDATE 1.37
let ATTR_REQS = [
	null,
	[null, 10, 16],
	[null, 15, 21],
	[null, 20, 24]
];
*/

// UPDATE 1.38
/*
let ATTR_REQS = [
	null,
	[null, 10, 15],
	[null, 15, 20],
	[null, 18, 24]
];
*/

// UPDATE 1.39
let ATTR_REQS = [
	null,
	[null, 10, 14],
	[null, 14, 18],
	[null, 16, 20]
];

// Used by mummy:
let TALENT_LEVEL_REQS = [];
TALENT_LEVEL_REQS[10] = 1;
TALENT_LEVEL_REQS[14] = 5;
TALENT_LEVEL_REQS[16] = 8;
TALENT_LEVEL_REQS[18] = 12;
TALENT_LEVEL_REQS[20] = 16;




// CREATE_TALENTS:
// ************************************************************************************************
gs.createTalents = function () {
	this.talents = {};
	let _ = this.talents;
	
	var RACIAL = 		[null, {level: 1}, {level: 8}, {level: 16}];
	
	
	gs.classTalents = {
		FireMage: {
			tomeName: 	'TomeOfPyromancy',
			attribute:	'intelligence',
			active: 	['FireBall',			'BurstOfFlame',		'InfusionOfFire', 		'FlamingBattleSphere'],
			passive: 	['ShieldOfFlames',		'MentalClarity'],
			
		},
		StormMage: {
			tomeName: 	'TomeOfStormology',
			attribute:	'intelligence',
			active: 	['LightningBolt',		'BurstOfWind',		'InfusionOfStorms', 	'Shock'],
			passive: 	['ShroudOfWind',		'MentalClarity'],
			
		},
		
		IceMage: {
			tomeName: 	'TomeOfCryomancy',
			attribute:	'intelligence',
			active: 	['ConeOfCold',			'FreezingCloud',	'ShieldOfIce',			'Freeze'],
			passive: 	['ArmorOfFrost',			'MentalClarity'],
		},
		
		Necromancer: {
			tomeName: 	'TomeOfNecromancy',
			attribute:	'intelligence',
			active: 	['LifeSpike',			'PoisonCloud',	'Cannibalise',			'SummonSkeleton'],
			passive: 	['MentalClarity',		'AuraOfDeath'],
		},
		
		Enchanter: {
		tomeName: 	'TomeOfEnchantments',
			attribute:	'intelligence',
			active: 	['Confusion',			'Discord',			'Dominate'],
			passive: 	['MentalClarity', 		'MagicMastery',		'EnchantItem'],
		},
		
		Warrior: {
			tomeName: 	'TomeOfWar',
			attribute:	'strength',
			active: 	['ShieldsUp',			'Recovery',			'ShieldWall'],
			passive: 	['WeaponMastery',		'Fortitude',		'ShieldBlock'],
		},
		
		Barbarian: {
			tomeName: 	'TomeOfRage',
			attribute:	'strength',
			active: 	['Charge',				'CycloneStrike',	'Berserk'],
			passive: 	['WeaponMastery',		'Fortitude',		'KillingStrikes'],
		},
		
		Duelist: {
			tomeName: 	'TomeOfDueling',
			attribute:	'dexterity',
			active: 	['Disengage',			'Lunge',			'DashAttack'],
			passive: 	['WeaponMastery',		'Evasive', 			'SecondWind'],
		},
		
		Ranger: {
			tomeName: 	'TomeOfArchery',
			attribute:	'dexterity',
			active: 	['PowerShot',			'TunnelShot',		'StormShot'],
			passive: 	['PerfectAim',			'Evasive',			'StrafeAttack',
			],
		},
		
		Rogue: {
			tomeName: 	'TomeOfStealth',
			attribute:	'dexterity',
			active: 	['SleepBomb',			'BearTrap',			'Vanish'],
			passive: 	['StealthMastery', 		'Evasive',			'Precision'],
		},
	};
	
	// GENERAL_TALENTS:
	// ********************************************************************************************
	// Tier-1:
	_.MentalClarity = 		{tier: 1, attrs: ['INT'], attributes: {maxMp: [null, 6, 18]}};
	_.WeaponMastery =		{tier: 1, attrs: ['STR'], attributes: {bonusMeleeDamage: [null, 2, 6]}};
	_.Fortitude = 			{tier: 1, attrs: ['STR'], attributes: {maxHp: [null, 10, 30]}};
	_.Evasive =				{tier: 1, attrs: ['DEX'], attributes: {evasion: [null, 0.1, 0.2]}};
	
	
	
	// STORM_MAGIC:
	// ********************************************************************************************
	// Tier-1:
	_.LightningBolt = 		{tier: 1, attrs: ['INT']};
	_.ShroudOfWind =		{tier: 1, attrs: ['INT'], attributes: {reflection: [null, 0.10, 0.20]}};
	
	// Tier-2:
	_.BurstOfWind =			{tier: 2, attrs: ['INT']};
	_.InfusionOfStorms = 	{tier: 2, attrs: ['INT']};
	
	// Tier-3:
	_.Shock =				{tier: 3, attrs: ['INT']};

	// NECROMANCY:
	// ********************************************************************************************
	// Tier-1:
	_.LifeSpike = 			{tier: 1, attrs: ['INT']};
	_.AuraOfDeath =			{tier: 1, attrs: ['INT'], attributes: {lifeTap: [null, 1, 3]}};
	
	// Tier-2:
	_.PoisonCloud = 		{tier: 2, attrs: ['INT']};
	_.Cannibalise = 		{tier: 2, attrs: ['INT']};
	
	// Tier-3:
	_.SummonSkeleton =		{tier: 3, attrs: ['INT']};
	
	
	// WARRIOR:
	// ********************************************************************************************
	// Tier-1:
	_.ShieldsUp =			{tier: 1, attrs: ['STR']};
	
	// Tier-2:
	_.Recovery =			{tier: 2, attrs: ['STR']};
	_.ShieldBlock = 		{tier: 2, attrs: ['STR'], attributes: {blockChance: [null, 0.20, 0.30]}};
	
	// Tier-3:
	_.ShieldWall =			{tier: 3, attrs: ['STR'], attributes: {blockChance: [null, 0.20, 0.30], hpPercent: [null, 0.4, 0.5]}};
	
	// BARBARIAN:
	// ********************************************************************************************
	// Tier-1:
	_.Charge =				{tier: 1, attrs: ['STR']};
	
	// Tier-2:
	_.CycloneStrike =		{tier: 2, attrs: ['STR']};
	_.KillingStrikes =		{tier: 2, attrs: ['STR'], attributes: {hpPercent: [null, 0.2, 0.3]}};
	
	// Tier-3:
	_.Berserk = 			{tier: 3, attrs: ['STR'], attributes: {meleeDamageMultiplier: [null, 0.20, 0.30], hpPercent: [null, 0.4, 0.5]}};
	
	// DUELIST:
	// ********************************************************************************************
	// Tier-1:
	_.Disengage =			{tier: 1, attrs: ['DEX']};
	
	// Tier-2:
	_.Lunge =				{tier: 2, attrs: ['DEX'], attributes: {lungeDamageMultiplier: [null, 1.6, 2.0]}};
	_.SecondWind =			{tier: 2, attrs: ['DEX']};
	
	// Tier-3:
	_.DashAttack = 			{tier: 3, attrs: ['DEX']};
	
	// RANGER:
	// ********************************************************************************************
	// Tier-1:
	_.PowerShot = 			{tier: 1, attrs: ['DEX']};
	_.PerfectAim =			{tier: 1, attrs: ['DEX'], attributes: {bonusProjectileRange: [null, 1, 2]}};
	
	// Tier-2:
	_.TunnelShot = 			{tier: 2, attrs: ['DEX']};
	_.StrafeAttack =		{tier: 2, attrs: ['DEX']};
	
	// Tier-3:
	_.StormShot =			{tier: 3, attrs: ['DEX']};
	
	// ROGUE:
	// ********************************************************************************************
	// Tier-1:
	_.SleepBomb =			{tier: 1, attrs: ['DEX']};
	_.StealthMastery =		{tier: 1, attrs: ['DEX'], attributes: {stealth: [null, 1, 2]}};
	
	// Tier-2:
	_.BearTrap =			{tier: 2, attrs: ['DEX']};
	_.Precision = 			{tier: 2, attrs: ['DEX'], attributes: {critMultiplier: [null, 0.2, 0.4]}};
	
	// Tier-3:
	_.Vanish = 				{tier: 3, attrs: ['DEX']};
	
	
	// FIRE_MAGIC:
	// ********************************************************************************************
	// Tier-1:
	_.FireBall = 			{tier: 1, attrs: ['INT']};
	_.ShieldOfFlames =		{tier: 1, attrs: ['INT'], attributes: {fireResistance: [null, 0.2, 0.3], fireDamageShield: [null, 2, 4]}};
	
	// Tier-2:
	_.InfusionOfFire =		{tier: 2, attrs: ['INT']};
	_.BurstOfFlame = 		{tier: 2, attrs: ['INT']};
	
	// Tier-3:
	//_.StickyFlame = 		{tier: 3, attrs: ['INT']};
	_.FlamingBattleSphere =	{tier: 3, attrs: ['INT']};
	
	// ICE_MAGIC:
	// ********************************************************************************************
	// Tier-1:
	_.ConeOfCold =			{tier: 1, attrs: ['INT']};
	_.ArmorOfFrost =		{tier: 1, attrs: ['INT'], attributes: {coldResistance: [null, 0.2, 0.3], protection: [null, 2, 4]}};
	
	// Tier-2:
	_.FreezingCloud =		{tier: 2, attrs: ['INT']};
	_.ShieldOfIce =			{tier: 2, attrs: ['INT'], attributes: {protectHp: [null, 10, 20]}};
	
	// Tier-3:
	_.Freeze =				{tier: 3, attrs: ['INT']};
	
	// ENCHANTMENT_MAGIC:
	// ********************************************************************************************
	// Tier I:
	_.Confusion =			{tier: 1, attrs: ['INT']};
	_.MagicMastery =		{tier: 1, attrs: ['INT'], attributes: {magicPower: [null, 0.2, 0.3]}};
	
	// Tier II:
	_.Discord =				{tier: 2, attrs: ['INT']};
	_.EnchantItem =			{tier: 2, attrs: ['INT']};

	// Tier III:
	_.Dominate =			{tier: 3, attrs: ['INT']};
	
	// RACIAL_TALENTS:
	// ********************************************************************************************
	_.StoneSkin =			{tier: 1, requirements: RACIAL, attributes: {protection: [null, 4, 8]}, neverDrop: true};
	
	// DEPRECATED:
	// ********************************************************************************************
	/*
	_.Athletics =			{tier: 2, attrs: ['DEX'], attributes: {spRegenTime: [null, -5, -10]}};
	_.FireStorm =			{tier: 3, attrs: ['INT']};
	_.IcicleStrike =		{tier: 3, attrs: ['INT']};
	_.RangeMastery =		{tier: 1, attrs: ['DEX'], attributes: {bonusRangeDamage: [null, 2, 4]}};
	// RESISTANCE:
	// ********************************************************************************************
	_.ShockResistance =		{tier: 2, attributes: {shockResistance: [null, 1, 2]}};
	_.ColdResistance =		{tier: 1, attributes: {coldResistance: [null, 1, 2]}};
	_.ToxicResistance =		{tier: 2, attributes: {toxicResistance: [null, 1, 2]}};
	

	// FIRE_MAGIC:
	// ********************************************************************************************
	
	_.WallOfFire =			{tier: 2};
	_.FireStrike =			{tier: 3};

	// COLD_MAGIC:
	// ********************************************************************************************
	
	_.Charm =				{tier: 2};
	
	_.FlashFreeze =			{tier: 3};
	

	_.GatherMana =			{tier: 2};
	_.Tranquility =			{tier: 3, attributes: {mpRegenTime: [null, 1, 2]}};
	

	// MELEE:
	// ********************************************************************************************
	_.PowerStrike = 		{tier: 1};
	_.Rage =				{tier: 2, attributes: {maxRage: [null, 3, 6]}};

	// STEALTH:
	// ********************************************************************************************
	_.SleepingDart = 		{tier: 1};
	
	_.DungeonSense = 		{tier: 2};
	
	
	
	_.InfusionOfBlood =		{tier: 1};
	_.Deflect =				{tier: 2};
	_.AirStrike =			{tier: 2};
	_.StaticDischarge =		{tier: 3};
	_.InfectiousDisease =	{tier: 3};
	//this.talents.Fear =					{requirements: INT_TIER_2, skillName: 'Enchantment'};
	
	//this.talents.FireResistance =			{skillName: 'FireMagic',	level: TIER_II, resistance: [null, 1, 2, 3]};
	//this.talents.ShockResistance =		{skillName: 'StormMagic',	level: TIER_II, resistance: [null, 1, 2, 3]};
	//this.talents.ColdResistance =			{skillName: 'ColdMagic',	level: TIER_II, resistance: [null, 1, 2, 3]};
	//this.talents.InfusionOfFire = 		{skillName: 'FireMagic',	level: TIER_I};
	//
	//this.talents.ShieldOfIce = 		{skillName: 'ColdMagic',	level: TIER_I};
	//this.talents.ToxicAttunement = 		{skillName: 'Necromancy',	level: TIER_I};
	//this.talents.Mesmerize =				{skillName: 'Enchantment',	level: TIER_II};
	//this.talents.ThunderClap = 			{skillName: 'StormMagic',	level: TIER_II};
	//this.talents.NimbleFingers =			{skillName: 'Stealth',		level: TIER_II};
	//this.talents.HeadShot = 				{skillName: 'Range',		level: [8]};
	//this.talents.KeenHearing = 			{skillName: 'Stealth',		level: TIER_II, range: [10, 15, 20]};
	*/
	
	this.createTalentEffects();
	this.createTalentDesc();
	this.setTalentTypeDefaultProperties();
	
	
	// UPDATE_1.37:
	// ********************************************************************************************
	/*
	// MENTAL_CLARITY:
	_.MentalClarity.effect = function (character) {
		// Rank 1:
		if (character.talents.getTalentRank('MentalClarity') === 1) {
			character.maxMp += 1 * (character.intelligence - 10);
		}
		// Rank 2:
		else {
			character.maxMp += 2 * (character.intelligence - 10);
		}
	};
	_.MentalClarity.onLearn = function (character) {
		// Rank 1:
		if (character.talents.getTalentRank('MentalClarity') === 1) {
			character.restoreMp(1 * (character.intelligence - 10));
		}
		// Rank 2:
		else {
			character.restoreMp(2 * (character.intelligence - 10));
		}
	};
	_.MentalClarity.desc = function (rank) {
		let str = '';
		
		// Rank 1:
		if (rank <= 1) {
			str += 'Enhances your mental clarity.\n\n';
			str += '+1MP per INT over 10.\n\n';
		}
		// Rank 2:
		else {
			str += 'Enhances your mental clarity.\n\n';
			str += '+2MP per INT over 10.\n\n';
		}
		
		return str;
	};
	
	// SHIELD_OF_FLAMES:
	_.ShieldOfFlames.attributes = null;
	_.ShieldOfFlames.effect = function (character) {
		// Rank 1:
		if (character.talents.getTalentRank('ShieldOfFlames') === 1) {
			character.damageShield.Fire += 2;
			character.resistance.Fire += 0.03 * (character.intelligence - 10);
		}
		// Rank 2:
		else {
			character.damageShield.Fire += 4; 
			character.resistance.Fire += 0.04 * (character.intelligence - 10);
		}
	};
	_.ShieldOfFlames.desc = function (rank) {
		let str = '';
		
		// Rank 1:
		if (rank <= 1) {
			str += 'Surrounds your body in a shield of flames.\n\n';
			str += '+2 Fire Damage shield.\n\n';
			str += '+3% Fire Resistance per INT over 10.\n\n';
		}
		// Rank 2:
		else {
			str += 'Surrounds your body in a shield of flames.\n\n';
			str += '+4 Fire Damage shield.\n\n';
			str += '+4% Fire Resistance per INT over 10.\n\n';
		}
		
		return str;
	};
	
	// SHROUD_OF_WIND:
	_.ShroudOfWind.effect = function (character) {
		// Rank 1:
		if (character.talents.getTalentRank('ShroudOfWind') === 1) {
			character.reflection += 0.02 * (character.intelligence - 10);
		}
		// Rank 2:
		else {
			character.reflection += 0.03 * (character.intelligence - 10);
			character.isFlying += 1;
		}
	};
	_.ShroudOfWind.desc = function (rank) {
		let str = '';
		
		// Rank 1:
		if (rank <= 1) {
			str += 'Surrounds your body in a shroud of wind.\n\n';
			str += '+2% Reflection per INT over 10.\n\n';
		}
		// Rank 2:
		else {
			str += 'Surrounds your body in a shroud of wind.\n\n';
			str += '+3% Reflection per INT over 10.\n\n';
			str += 'Grants permanent flight.';
		}
		
		return str;
	};
	
	// FROST_ARMOR:
	_.ArmorOfFrost.effect = function (character) {
		character.resistance.Cold += this.attributes.coldResistance[character.talents.getTalentRank('ArmorOfFrost')];
		character.protection += this.attributes.protection[character.talents.getTalentRank('ArmorOfFrost')];
	};
	

	// FORTITUDE:
	_.Fortitude.effect = function (character) {
		character.maxHp += this.attributes.maxHp[character.talents.getTalentRank('Fortitude')];
	};
	
	_.Fortitude.onLearn = function (character) {
		character.healHp(this.attributes.maxHp[character.talents.getTalentRank('Fortitude')]);
	};
	
	// EVASIVE:
	_.Evasive.effect = function (character) {
		character.evasion += this.attributes.evasion[character.talents.getTalentRank('Evasive')];
	};
	


	// DEATH_AURA:
	_.AuraOfDeath.effect = function (character) {
		let rank = character.talents.getTalentRank('AuraOfDeath');
		character.lifeTap += this.attributes.lifeTap[rank];
	};
	*/
	
	
	// Validate Class Talents:
	gs.forEachType(gs.classTalents, function (e) {
		// Active List:
		e.active.forEach(function (talentName) {
			if (!gs.talents[talentName]) {
				throw 'Invalid talent: ' + talentName;
			}
		}, this);
		
		// Passive List:
		e.passive.forEach(function (talentName) {
			if (!gs.talents[talentName]) {
				throw 'Invalid talent: ' + talentName;
			}
		}, this);
	}, this);
	
};

// SET_TALENT_TYPE_DEFAULT_PROPERTIES:
// ************************************************************************************************
gs.setTalentTypeDefaultProperties = function () {
	// Set Default Properties:
	this.talentList = [];
	this.nameTypes(this.talents);
	this.forEachType(this.talents, function (talent) {
		// Setting abilities:
		if (this.abilityTypes[talent.name]) {
			talent.ability = this.abilityTypes[talent.name];
		}
		
		// Setting requirements:
		if (talent.attrs) {
			talent.requirements = [null];
			
			for (let rank = 1; rank <= 3; rank += 1) {
				talent.requirements[rank] = {};
				
				if (util.inArray('STR', talent.attrs)) {
					talent.requirements[rank].strength = 10 + (ATTR_REQS[talent.tier][rank] - 10) / talent.attrs.length;
				}
				
				if (util.inArray('DEX', talent.attrs)) {
					talent.requirements[rank].dexterity = 10 + (ATTR_REQS[talent.tier][rank] - 10) / talent.attrs.length;
				}
				
				if (util.inArray('INT', talent.attrs)) {
					talent.requirements[rank].intelligence = 10 + (ATTR_REQS[talent.tier][rank] - 10) / talent.attrs.length;
				}
			}
		}
		
	
		this.talentList.push(talent);
	}, this);
};

// CREATE_TALENT_DESC:
// ************************************************************************************************
gs.createTalentDesc = function () {
	let _ = this.talents;
	
	var RACIAL = 		[null, {level: 1}, {level: 8}, {level: 16}];
	
	
	// NECROMANCY_MAGIC:
	// ********************************************************************************************	
	_.LifeSpike.desc = 			'Drains the life of the target over time, healing the caster. Can be stacked multiple times.';
	_.Cannibalise.desc = 		'Converts some of your hit points into mana.';
	_.PoisonCloud.desc = 		'Summons a cloud of poison gas.';
	_.SummonSkeleton.desc =		'Summons one or more skeletal minions to fight for you.';
	_.AuraOfDeath.desc =		'Permanently surrounds you in an aura of death. You will tap the life of every monster you kill.';
	
	// FIRE_MAGIC:
	// ********************************************************************************************
	_.FireBall.desc = 			'Shoots a ball of fire which explodes on impact.';
	//_.FlameBolt.desc = 			'Sends forth a bolt of flaming clouds which will persist for several turns.';
	_.ShieldOfFlames.desc =		'Permanently surrounds you in a shield of flames. Grants Fire resistance and damages every monster that hits you.';
	_.InfusionOfFire.desc = 	'Draws power from a nearby fire source, restoring your mana and temporarily raising your ability power.';
	
	_.BurstOfFlame.desc =		function (talentLevel) {
		if (talentLevel < 2) {
			return 'Creates a burst of flame on a single tile. Will create a large burst if used on a torch or other flaming object.';
		}
		else {
			return 'Creates a burst of flame on a single tile. Will create a large burst if used on a torch or other flaming object.\n\nFlaming objects will only be consumed 50% of the time.';
		}
		
	};
	
	//_.StickyFlame.desc =		'Sends forth a bolt of flames which will stick to enemies and deal damage over 5 turns.';
	
	_.FlamingBattleSphere.desc = 'Summons a temporary Flaming Battle Sphere which attacks nearby enemies.';
	
	// STORM_MAGIC:
	// ********************************************************************************************	
	_.LightningBolt.desc = 		'Sends forth a bolt of lightning, hitting multiple monsters in a straight line.';
	_.BurstOfWind.desc =		'Damages and knocks back all nearby enemies.';
	_.Shock.desc =				'Shocks your target and spreads to all adjacent characters.';
	_.InfusionOfStorms.desc = 	'Draws power from the air around you, restoring your mana and temporarily raising your ability power.';
	_.ShroudOfWind.desc =		function (talentLevel) {
		if (talentLevel < 2) {
			return 'Permanently surrounds you in a shroud of wind which reflects projectiles.';
		}
		else {
			return 'Permanently surrounds you in a shroud of wind which reflects projectiles.\n\nThe shroud of wind lifts you up, granting levitation.';
		}
		
	};
	
	// COLD_MAGIC:
	// ********************************************************************************************	
	_.ConeOfCold.desc =			'Blasts a group of enemies with freezing cold, damaging, slowing and knocking them back.';
	_.ArmorOfFrost.desc =		'Permanently encases you in armor of frost, granting cold resistance and protection';	
	_.FreezingCloud.desc =		'Summons a cloud of freezing vapours that will damage characters standing within it.';
	_.ShieldOfIce.desc =		'Surrounds you in a slowly regenerating shield of ice which will block and absorb all damage.';
	_.Freeze.desc =				'Freezes an enemy in a block of ice, rendering them unable to act for the duration of the effect.';
	
	// ENCHANTMENT_MAGIC:
	// ********************************************************************************************	
	_.Confusion.desc =			'Confuses one or more creatures causing them to attack their nearest target.';
	_.Discord.desc =			'The target will take increased damage from all sources for the duration of the effect.';
	_.EnchantItem.desc =		function (talentLevel) {
		if (talentLevel < 2) {
			return 'Immediately summons 2 x Scrolls of Enchantment.';
		}
		else {
			return 'Immediately summons 2 x Scrolls of Enchantment.';
		}
	};
	
	_.Dominate.desc =				'Permanently charms a single enemy, turning it to your side.';
	
	// WARRIOR:
	// ********************************************************************************************
	_.ShieldWall.desc =			'You will automatically adopt a defensive posture at low HP granting an increased chance to block melee and projectiles with your shield.';
	
	
	
	_.ShieldsUp.desc =		function (talentLevel) {
		if (talentLevel < 2) {
			return 'You will block and counterattack against every enemy that strikes you in the next turn.';
		}
		else {
			return 'You will block and counterattack against every enemy that strikes you in the next turn.\n\nYou will also reflect all projectiles fired at you in the next turn.';
		}
	};
	
	_.Recovery.desc =			'Restores a portion of your HP and cures physical effects.';
	_.ShieldBlock.desc =		'Grants an innate chance to block enemy melee or projectile attacks with your shield.';
	
	// BARBARIAN:
	// ********************************************************************************************
	_.Charge.desc = 			'Charge towards an enemy and attack in a single turn. Crunching an enemy against a wall will result in double damage.';
	_.CycloneStrike.desc = 		'Strikes every enemy around you, dealing extra damage and knocking them back.';
	_.KillingStrikes.desc = 	'You will automatically perform a killing strike against low HP enemies.';
	_.Berserk.desc = 			'You will automatically go berserk at low HP granting increased melee damage.';
	
	// DUELIST:
	// ********************************************************************************************
	_.Evasive.desc = 			'Improves your chance of dodging melee and projectile attacks.';
	_.SecondWind.desc =			'Restores a portion of your speed points.';

	
	_.Disengage.desc = function (talentLevel) {
		let str = 'Use 1 speed point to attack an enemy and back up a step without ending your turn.';
		
		if (talentLevel > 1) {
			str += '\n\nNo speed point cost when dealing a killing blow.';
		}
		
		return str;
	};
	
	_.Lunge.desc = function (talentLevel) {
		let str = 'Use 1 speed point to lunge forward a step and attack an enemy without ending your turn.';
		
		if (talentLevel > 1) {
			str += '\n\nNo speed point cost when dealing a killing blow.';
		}
		
		return str;
	};
		
	_.DashAttack.desc = function (talentLevel) {
		let str = 'Dash and attack multiple enemies in a line using 1 speed point per move without ending your turn';
		
		if (talentLevel > 1) {
			str += '\n\nKilling blows will not consume speed points.';
		}
		
		return str;
	};
	
	// RANGER:
	// ********************************************************************************************	
	_.PowerShot.desc = 			'Delivers a powerful shot with your ranged weapon dealing increased damage and knockback.';
	_.TunnelShot.desc = 		'Fires a projectile clear through a number of monsters, dealing increased damage.';
	_.StormShot.desc =			'Fires a storm of 3 projectiles each turn of the effect. You can move, but attacking, using an ability or consumable will interupt the ability.';
	_.PerfectAim.desc =			function (talentLevel) {
		// Rank 1:
		if (talentLevel < 2) {
			return 'Extends your range with bows and staves';
		}
		// Rank 2:
		else {
			return 'Extends your range with bows and staves.\n\nAllows you to shoot at your desired target through other enemies.';
		}
	};
	_.StrafeAttack.desc =		function (talentLevel) {
		// Rank 1:
		if (talentLevel < 2) {
			return 'You will automatically attack the nearest enemy when moving towards or strafing.';
		}
		// Rank 2:
		else {
			return 'You will automatically attack the nearest enemy when moving towards or strafing.\n\nYou will also perform strafe attacks when quick moving.';
		}
		
	};
	
	// ROGUE:
	// ********************************************************************************************	
	_.SleepBomb.desc =			function (talentLevel) {
		// Rank 1:
		if (talentLevel < 2) {
			return 'Puts a single enemy into a deep sleep.';
		}
		// Rank 2:
		else {
			return 'Puts multiple enemies into a deep sleep';
		}
		
	};
	
	_.Precision.desc =			'Increases damage of all critical hits.';
	_.Vanish.desc = 			'When activated, all monsters will immediately forget about you.';
	
	
	// GENERAL:
	// ********************************************************************************************
	_.MagicMastery.desc = 		'Increases the power of all magic abilities.';
	_.MentalClarity.desc = 		'Increases your maximum mana points.';
	_.Fortitude.desc =			'Increases your maximum hit points.';
	_.StealthMastery.desc =		'Reduces the max range at which enemies can spot you.';	
	_.WeaponMastery.desc =		'Increases your damage with melee weapons.';
	
	
	
	// RACIAL:
	// ********************************************************************************************
	_.StoneSkin.desc = 			'Increases your base protection.';
	
	// DEPRECATED:
	// ************************************************************************************************
	/*
		_.Athletics.desc = 			'Improves the rate at which you regen speed points.';

		_.IcicleStrike.desc =		'Fires a volley of 3 icicles which will pass through and damage every enemy in their path.';

	
	_.FireStorm.desc =			'Creates a storm of fire around you for several turns. You can move, but attacking, using an ability or consumable will interupt the spell.';
	_.RangeMastery.desc = 		'Increases your damage with all ranged weapons.';	
	_.SleepingDart.desc = 	"Puts an enemy into a deep sleep.";
	_.DungeonSense.desc = 	'Reveals the location of all treasure and stairs on your mini-map.';
		_.Tranquility.desc =		'Decreases the number of turns needed to regenerate 1MP.';
	_.GatherMana.desc =			'Restores a portion of your Mana Points and cures mental effects.';
	_.Charm.desc =				'Charms a single creature, turning it temporarily to your side.';
	
	//_.InfectiousDisease.desc = 	'Infects a single target with a disease which will spread to nearby characters.';	
	_.Regeneration.desc =		'Decreases the number of turns needed to regenerate 1HP.';
	//_.Deflect.desc =			'Allows you to reflect projectiles with your shield for the duration of the effect.';
	//_.PowerStrike.desc = 		'Delivers a powerful strike with your weapon dealing increased damage and knockback.';
	_.Rage.desc = 				'Your rage will increase with each enemy you kill, increasing your melee power.';
	
	
	
	_.DeadEye.desc = 			'When activated, you will deal critical hits with every ranged attack for the duration of the effect.';
	//_.Mesmerize.desc =			'Puts a group of enemies into a deep sleep.';
	//_.Precision.desc = 	'Allows you to sneak attack unaware enemies. Additional talent levels will raise sneak attack damage by 20%';
	//_.Sneak.desc = 			'When activated, your stealth skill will be greatly increased';
	//_.KeenHearing.desc = 	'You gain the permanent ability to detect nearby monsters on your mini-map.';
	//_.HeadShot.desc =		'Allows you to perform ranged sneak attacks.';
	//_.ToxicAttunement.desc = 	'Increases your toxic magic power and reduces toxic magic mana cost by 1MP for the duration of the effect.';
	//_.AmmoConservation.desc = 	'+10% chance to save ammo per talent level.';
	//_.ThunderClap.desc = 		'Creates a massive boom of thunder stunning all enemies for the duration of the effect.';
	//_.Fear.desc =				'Causes all enemies in a radius around you to run away in fear.';
	//_.NimbleFingers.desc =	'Allows you to pick up and place traps.';
	
		_.ShroudOfWind.desc = function (rank) {
		if (rank < 2) {
			return 'Surrounds you in a shroud of swirling winds which reflects projectiles.';
		}
		else {
			return 'Surrounds you in a shroud of swirling winds which reflects projectiles and allows you to levitate.';
		}
	};
	_.FireResistance.desc = function (talentLevel) {
		if (talentLevel <= this.maxRank) {
			return '+1 Fire Resistance.';
		}
		else {
			return '';
		}
	};	
	
	_.ColdResistance.desc = function (talentLevel) {
		if (talentLevel <= this.maxRank) {
			return '+1 Cold Resistance.';
		}
		else {
			return '';
		}
	};	
	_.ShockResistance.desc = function (talentLevel) {
		if (talentLevel <= this.maxRank) {
			return '+1 Shock Resistance.';
		}
		else {
			return '';
		}
	};	
	_.ToxicResistance.desc = function (talentLevel) {
		if (talentLevel <= this.maxRank) {
			return '+1 Toxic Resistance.';
		}
		else {
			return '';
		}
	};	
	//
	
	
	
	
	//_.ShieldOfIce.desc = 	'Restores some of your mana and raises your cold magic power for the duration of the effect.';
	_.KeenHearing.desc = function (talentLevel) {
		if (talentLevel <= this.maxRank) {
			return 'Allows you to detect nearby monsters on your mini-map up to a range of  ' + this.range[talentLevel - 1] + ' tiles.';
		}
		else {
			return '';
		}
	};
	*/
};

// CREATE_TALENT_EFFECTS:
// ************************************************************************************************
gs.createTalentEffects = function () {
	let _ = this.talents;

	// SHIELD_OF_FLAMES:
	_.ShieldOfFlames.effect = function (character) {
		character.resistance.Fire += this.attributes.fireResistance[character.talents.getTalentRank('ShieldOfFlames')];
		character.damageShield.Fire += this.attributes.fireDamageShield[character.talents.getTalentRank('ShieldOfFlames')];
	};
	
	// FROST_ARMOR:
	_.ArmorOfFrost.effect = function (character) {
		character.resistance.Cold += this.attributes.coldResistance[character.talents.getTalentRank('ArmorOfFrost')];
		character.protection += this.attributes.protection[character.talents.getTalentRank('ArmorOfFrost')];
	};
	
	// PRECISION:
	_.Precision.effect = function (character) {
		character.critMultiplier += this.attributes.critMultiplier[character.talents.getTalentRank('Precision')];
	};
	
	// MENTAL_CLARITY:
	_.MentalClarity.effect = function (character) {
		character.maxMp += this.attributes.maxMp[character.talents.getTalentRank('MentalClarity')];
	};
	
	_.MentalClarity.onLearn = function (character) {
		character.restoreMp(this.attributes.maxMp[character.talents.getTalentRank('MentalClarity')]);	
	};
	
	// FORTITUDE:
	_.Fortitude.effect = function (character) {
		character.maxHp += this.attributes.maxHp[character.talents.getTalentRank('Fortitude')];
	};
	
	_.Fortitude.onLearn = function (character) {
		character.healHp(this.attributes.maxHp[character.talents.getTalentRank('Fortitude')]);
	};
	

	
	// STEALTH_MASTERY:
	_.StealthMastery.effect = function (character) {
		character.stealth += this.attributes.stealth[character.talents.getTalentRank('StealthMastery')];
	};
	

	
	// WEAPON_MASTERY:
	_.WeaponMastery.effect = function (character) {
		character.bonusMeleeDamage += this.attributes.bonusMeleeDamage[character.talents.getTalentRank('WeaponMastery')];
	};
	
	// EVASIVE:
	_.Evasive.effect = function (character) {
		character.evasion += this.attributes.evasion[character.talents.getTalentRank('Evasive')];
	};

	// LUNGE:
	_.Lunge.effect = function (character) {
		character.hasLunge += 1;
		
		character.lungeDamageMultiplier += this.attributes.lungeDamageMultiplier[character.talents.getTalentRank('Lunge')];
	};
	
	// PERFECT_AIM:
	_.PerfectAim.effect = function (character) {
		character.bonusProjectileRange += this.attributes.bonusProjectileRange[character.talents.getTalentRank('PerfectAim')];
		
		if (character.talents.getTalentRank('PerfectAim') === 2) {
			character.hasPerfectAim += 1;
		}
	};
	
	// MAGIC_MASTERY:
	_.MagicMastery.effect = function (character) {
		character.magicPower += this.attributes.magicPower[character.talents.getTalentRank('MagicMastery')];
	};
	
	// STONE_SKIN:
	_.StoneSkin.effect = function (character) {
		character.protection += this.attributes.protection[character.talents.getTalentRank('StoneSkin')];
	};
	

	

	// SHIELD_BLOCK:
	_.ShieldBlock.effect = function (character) {
		let rank = character.talents.getTalentRank('ShieldBlock');
		character.blockChance += this.attributes.blockChance[rank];		
	};
	
	// SHROUD_OF_WIND:
	_.ShroudOfWind.effect = function (character) {
		let rank = character.talents.getTalentRank('ShroudOfWind');
		
		character.reflection += this.attributes.reflection[rank];
		
		if (rank === 2) {
			character.isFlying += 1;
		}
	};
	
	// DEATH_AURA:
	_.AuraOfDeath.effect = function (character) {
		let rank = character.talents.getTalentRank('AuraOfDeath');
		character.lifeTap += this.attributes.lifeTap[rank];
	};
	
	// ENCHANT_ITEM:
	_.EnchantItem.onLearn = function (character) {
		character.inventory.addItem(Item.createItem('ScrollOfEnchantment', {amount: 2}));
	};
	
	
	
	
	// DEPRICATED:
	// ********************************************************************************************
	/*
		
	// RANGE_MASTERY:
	_.RangeMastery.effect = function (character) {
		character.bonusRangeDamage += this.attributes.bonusRangeDamage[character.talents.getTalentRank('RangeMastery')];
	};
		// TOXIC_RESISTANCE:
	_.ToxicResistance.effect = function (character) {
		let rank = character.talents.getTalentRank('ToxicResistance');
		character.resistance.Toxic += this.attributes.toxicResistance[rank];
	};
	
	// SHOCK_RESISTANCE:
	_.ShockResistance.effect = function (character) {
		let rank = character.talents.getTalentRank('ShockResistance');
		character.resistance.Shock += this.attributes.shockResistance[rank];
	};
	
	// COLD_RESISTANCE:
	_.ColdResistance.effect = function (character) {
		let rank = character.talents.getTalentRank('ColdResistance');
		character.resistance.Cold += this.attributes.coldResistance[rank];
	};
	
	
		// TRANQUILITY:
	_.Tranquility.effect = function (character) {
		character.mpRegenTime -= this.attributes.mpRegenTime[character.talents.getTalentRank('Tranquility')];
	};
	


	// DUNGEON_SENSE:
	_.DungeonSense.onLearn = function () {
		gs.revealDungeonSenese();
	};
	
		// FIRE_RESISTANCE:
	_.FireResistance.effect = function (character) {
		character.resistance.Fire += this.resistance[character.talents.getTalentRank('FireResistance')];
	};
	
	// COLD_RESISTANCE:
	_.ColdResistance.effect = function (character) {
		character.resistance.Cold += gs.talents.ColdResistance.resistance[character.talents.getTalentRank('ColdResistance') - 1];
	};
	
	// SHOCK_RESISTANCE:
	_.ShockResistance.effect = function (character) {
		character.resistance.Shock += gs.talents.ShockResistance.resistance[character.talents.getTalentRank('ShockResistance') - 1];
	};
	
	
	
	// KEEN_HEARING:
	_.KeenHearing.effect = function (character) {
		character.hasKeenHearing += 1;
	};
	
	_.KeenHearing.onLearn = function () {
		gs.HUD.miniMap.refresh();
	};
	*/
};


// GET_TALENT_REQ_STR:
// requirements = {strength, dexterity, intelligence, level}
// ************************************************************************************************
gs.getTalentReqStr = function (requirements) {
	let list = [];
	
	if (requirements.level) {
		list.push('LEVEL: ' + requirements.level);
	}
	
	/*
	// Gnome:
	if (gs.pc.race.name === 'Gnome') {
		if (requirements.strength) {
			list.push('STR/INT: ' + requirements.strength);
		}

		if (requirements.dexterity) {
			list.push('DEX/INT: ' + requirements.dexterity);
		}

		if (requirements.intelligence) {
			list.push('INT: ' + requirements.intelligence);
		}	
	}
	*/
	
	// Mummy:
	if (gs.pc.race.name === 'Mummy' || this.pc.race.name === 'Vampire') {
		if (requirements.strength) {
			list.push('LEVEL: ' + TALENT_LEVEL_REQS[requirements.strength]);
		}

		if (requirements.dexterity) {
			list.push('LEVEL: ' + TALENT_LEVEL_REQS[requirements.dexterity]);
		}

		if (requirements.intelligence) {
			list.push('LEVEL: ' + TALENT_LEVEL_REQS[requirements.intelligence]);
		}	
	}
	else {
		if (requirements.strength) {
			list.push('STR: ' + requirements.strength);
		}

		if (requirements.dexterity) {
			list.push('DEX: ' + requirements.dexterity);
		}

		if (requirements.intelligence) {
			list.push('INT: ' + requirements.intelligence);
		}	
	}

	
	return list.join(', ');
};



// GET_TALENT_DESCRIPTION:
// ************************************************************************************************
gs.getTalentDescription = function (talentName, showNextRank = false) {
	var talentType = this.talents[talentName],
		currentRank = gs.pc.talents.getTalentRank(talentName),
		desc = {};
	
	let getStatStr = function (statName, val, upgradeVal) {
		let str = '';
		
		// Show Upgrade:
		if (upgradeVal && val !== upgradeVal) {
			// STAT_AS_PERCENT:
			if (STAT_AS_PERCENT[statName]) {
				str += util.toPercentStr(val);
				
				// Show Base Value:
				if (talentType.ability && talentType.ability.attributes[statName]) {
					let moddedVal = talentType.ability.attributes[statName].value(gs.pc, currentRank);
					
					if (val !== moddedVal) {
						str += ' [' + util.toPercentStr(moddedVal) + ']';
					}
				}
				// Lunge Damage:
				else if (statName === 'lungeDamageMultiplier' || (talentName === 'ShieldWall' && statName === 'blockChance') || (talentName === 'Berserk' && statName === 'meleeDamageMultiplier')) {
					let moddedVal = val + gs.pc.abilityPower;
					
					if (val !== moddedVal) {
						str += ' [' + util.toPercentStr(moddedVal) + ']';
					}
				}
				
				str += ' } ';
				
				str += util.toPercentStr(upgradeVal);
				
				// Show Upgrade Value:
				if (talentType.ability && talentType.ability.attributes[statName]) {
					let moddedVal = talentType.ability.attributes[statName].value(gs.pc, currentRank + 1);
					
					if (upgradeVal !== moddedVal) {
						str += ' [' + util.toPercentStr(moddedVal) + ']';
					}
				}
				// Lunge Damage:
				else if (statName === 'lungeDamageMultiplier' || (talentName === 'ShieldWall' && statName === 'blockChance') || (talentName === 'Berserk' && statName === 'meleeDamageMultiplier')) {
					let moddedVal = upgradeVal + gs.pc.abilityPower;
					
					if (val !== moddedVal) {
						str += ' [' + util.toPercentStr(moddedVal) + ']';
					}
				}
				
				
				str += '\n';
			}
			// STAT_AS_NUMBER:
			else {
				str += val;
				
				// Show Base Value:
				if (talentType.ability && talentType.ability.attributes[statName]) {
					let moddedVal = talentType.ability.attributes[statName].value(gs.pc, currentRank);
					
					if (val !== moddedVal) {
						str += ' [' + moddedVal + ']';
					}
				}
				// Modfied Talent Attributes:
				else if (statName === 'protectHp') {
					let moddedVal = Math.round(val * (1 + gs.pc.magicPower + gs.pc.abilityPower));
					
					if (val !== moddedVal) {
						str += ' [' + moddedVal + ']';
					}
				}
				
				str += ' } ';
				
				str += upgradeVal;
				
				// Show Upgrade Value:
				if (talentType.ability && talentType.ability.attributes[statName]) {
					let moddedVal = talentType.ability.attributes[statName].value(gs.pc, currentRank + 1);
					
					if (upgradeVal !== moddedVal) {
						str += ' [' + moddedVal + ']';
					}
				}
				// Modfied Talent Attributes::
				else if (statName === 'protectHp') {
					let moddedVal = Math.round(upgradeVal * (1 + gs.pc.magicPower + gs.pc.abilityPower));
					
					if (upgradeVal !== moddedVal) {
						str += ' [' + moddedVal + ']';
					}
				}
				
				str += '\n';
			}

		}
		// No Upgrade:
		else {
			// STAT_AS_PERCENT:
			if (STAT_AS_PERCENT[statName]) {
				str += util.toPercentStr(val);
				
				// Show modified value:
				if (talentType.ability && talentType.ability.attributes[statName]) {
					let moddedVal = talentType.ability.attributes[statName].value(gs.pc, currentRank || 1);
					
					if (val !== moddedVal) {
						str += ' [' + util.toPercentStr(moddedVal) + ']';
					}
				}
				// Lunge Damage:
				else if (statName === 'lungeDamageMultiplier' || (talentName === 'ShieldWall' && statName === 'blockChance') || (talentName === 'Berserk' && statName === 'meleeDamageMultiplier')) {
					let moddedVal = val + gs.pc.abilityPower;
					
					if (val !== moddedVal) {
						str += ' [' + util.toPercentStr(moddedVal) + ']';
					}
				}
					
				str += '\n';
			}
			// STAT_AS_NUMBER:
			else {
				str += val;
				
				// Show modified value:
				if (talentType.ability && talentType.ability.attributes[statName]) {
					let moddedVal = talentType.ability.attributes[statName].value(gs.pc, currentRank || 1);

					if (val !== moddedVal) {
						str += ' [' + moddedVal + ']';
					}
				}
				// Modified Talent Attributes::
				else if (statName === 'protectHp') {
					let moddedVal = Math.round(val * (1 + gs.pc.magicPower + gs.pc.abilityPower));
					
					if (val !== moddedVal) {
						str += ' [' + moddedVal + ']';
					}
				}
					
				str += '\n';
			}

		}
		
		return str;
	};
	
	desc.text = '';
	
	// TITLE:
	if (showNextRank) {
		desc.title = 'Learn ' + gs.capitalSplit(talentName) + ' ' + ROMAN_NUMERAL[currentRank + 1];
		desc.text += 'Requires ' + gs.getTalentReqStr(talentType.requirements[currentRank + 1]) + '\n\n';
	}
	else {
		desc.title = gs.capitalSplit(talentName) + ' ' + ROMAN_NUMERAL[currentRank || 1];
	}
	
	
	
	
	// ABILITY_ATTRIBUTES:
	if (talentType.ability) {
		let abilityType = talentType.ability;
		
		// Mana Cost:
		if (abilityType.mana) {
			desc.text += '*Mana: ' + abilityType.mana + '\n';
		}
		
		// Hit Point Cost:
		if (abilityType.hitPointCost) {
			desc.text += '*Hit Points: ' + abilityType.hitPointCost + '\n';
		}
		
		// Cool Down:
		if (abilityType.coolDown) {
			desc.text += '*Cooldown: ' + abilityType.coolDown + '\n';
		}
		
		
		
		// Attributes:
		if (abilityType.attributes) {
			this.forEachType(abilityType.attributes, function (attribute) {
				if (attribute.name === 'aoeRange' && attribute.base[currentRank] === 0 && !showNextRank) {
					return;
				}
				
				if (NICE_STAT_NAMES[attribute.name]) {
					desc.text += '*' + NICE_STAT_NAMES[attribute.name] + ': ';
				}
				else {
					desc.text += '*' + this.capitalSplit(attribute.name) + ': ';
				}
				
				
				if (showNextRank && currentRank !== 0) {
					desc.text += getStatStr(attribute.name, attribute.base[currentRank], attribute.base[currentRank + 1]);
				}
				else {
					desc.text += getStatStr(attribute.name, attribute.base[currentRank || 1]);
				}
			}, this);
		}
	}
	
	// TALENT_ATTRIBUTES:
	if (talentType.attributes) {
		for (let key in talentType.attributes) {
			if (talentType.attributes.hasOwnProperty(key)) {
				desc.text += '*' + NICE_STAT_NAMES[key] + ': ';
				
				if (showNextRank && currentRank !== 0) {
					desc.text += getStatStr(key, talentType.attributes[key][currentRank], talentType.attributes[key][currentRank + 1]);
				}
				else {
					desc.text += getStatStr(key, talentType.attributes[key][currentRank || 1]);
				}
			}
		}
	}
	
	// Need an extra line before the desc:
	if (talentType.ability || talentType.attributes) {
		desc.text += '\n';
	}

	// Talent Description:
	if (talentType.desc && typeof talentType.desc === 'string') {
		desc.text += talentType.desc;
	}
	else if (talentType.desc && typeof talentType.desc === 'function') {
		let rank = gs.pc.talents.getTalentRank(talentName);
		
		if (showNextRank) {
			rank += 1;
		}
		desc.text += talentType.desc(rank);
	}
	
	
	return desc;
};



// COUNT_PLAYER_ABILITIES:
// ************************************************************************************************
gs.countPlayerAbilities = function () {
	var key, count = 0;
	
	for (key in this.talents) {
		if (this.talents.hasOwnProperty(key)) {
			if (this.talents[key].ability) {
				count += 1;
			}
		}
	}
	
	return count;
};