/*global game, gs, console, Phaser, util, extend*/
/*global ITEM_SLOT, SHROOM_HP, SHROOM_EP, CHARM_TEXT*/
/*jshint white: true, laxbreak: true, esversion: 6*/
'use strict';

// CREATE_ITEM_TYPES:
// ************************************************************************************************
gs.createItemTypes = function () {
	var key,
		pct,
		LOW,
		MED,
		HIGH;

	this.createWeaponEffects();
	this.createWeaponProcEffects();
	this.createItemEffects();
	
	// Extend Items:
	let _ = function (base, ext) {
		let newObj = {};
		
		for (let key in base) {
			if (base.hasOwnProperty(key)) {
				newObj[key] = base[key];
			}
		}
		
		for (let key in ext) {
			if (ext.hasOwnProperty(key)) {
				newObj[key] = ext[key];
			}
		}
		
		return newObj;
	};
	
	// Melee Templates:
	let Melee = 		{slot: ITEM_SLOT.PRIMARY, hands: 1, attackEffect: 'Melee', range: 1.5};
	let Cleave = 		{slot: ITEM_SLOT.PRIMARY, hands: 1, attackEffect: 'Cleave', range: 1.5};
	let Pole =			{slot: ITEM_SLOT.PRIMARY, hands: 1, attackEffect: 'PoleArm', range: 2.0};
	let Blunt =			{slot: ITEM_SLOT.PRIMARY, hands: 1, attackEffect: 'Melee', range: 1.5, noMitigation: 1};
	let Flame =			{slot: ITEM_SLOT.PRIMARY, hands: 1, attackEffect: 'Flame', range: 1.5};
	let Storm =			{slot: ITEM_SLOT.PRIMARY, hands: 1, attackEffect: 'StormChopper', range: 1.5};
	
	// Range Templates:
	let Proj = 			{slot: ITEM_SLOT.RANGE, hands: 2, attackEffect: 'SingleProjectile'};
	let Staff =			{slot: ITEM_SLOT.RANGE, hands: 2, attackEffect: 'MagicStaff', range: 4.0};
					
	// Misc Templates:
	let Wand =			{slot: ITEM_SLOT.CONSUMABLE, stackable: false, sound: gs.sounds.jewlery};
	let Charm =			{slot: ITEM_SLOT.CHARM, sound: gs.sounds.jewlery, stackable: false};
	let Ring =			{slot: ITEM_SLOT.RING};
	let Shield =		{slot: ITEM_SLOT.SECONDARY};
	let Armor =			{slot: ITEM_SLOT.BODY};
	let Helmet =		{slot: ITEM_SLOT.HEAD};
	let Gloves =		{slot: ITEM_SLOT.HANDS};
	let Boots =			{slot: ITEM_SLOT.FEET};
	
	// ITEM_TYPES:
	// ********************************************************************************************
	this.itemTypes = {
		// MISC_WEAPONS:
		Fists: 				{f: 0, slot: ITEM_SLOT.PRIMARY, hands: 1, attackEffect: 'Melee', range: 1.5, stats: {damage: 2}},
		MobFucker: 			{f: 0, slot: ITEM_SLOT.PRIMARY, hands: 1, attackEffect: 'MobFucker', range: 1000, stats: {damage: 1000}},
		
		// MELEE_WEAPONS_TIER I:
		// ********************************************************************************************
		ShortSword:				_(Melee, 	{f: 0,		tier: 1, maxTier: 2, hands: 1, stats: {damage: 6, parryChance: 0.20}}),
		HandAxe:				_(Cleave, 	{f: 64,		tier: 1, maxTier: 2, hands: 1, stats: {damage: 4}}),
		
		// Unique:
		BloodStainedAxe:		_(Cleave, 	{f: 72,	 	tier: 1, hands: 1, stats: {damage: 5, maxHp: 6}}),
		
		// MELEE_WEAPONS_TIER II:
		// ********************************************************************************************
		LongSword: 				_(Melee, 	{f: 1,		tier: 1, hands: 1, stats: {damage: 8, parryChance: 0.20}}),
		BroadAxe:				_(Cleave, 	{f: 65,		tier: 1, hands: 1, stats: {damage: 6}}),
		Spear: 					_(Pole, 	{f: 33,		tier: 1, hands: 1, stats: {damage: 8}}),
		Mace:					_(Blunt, 	{f: 97,		tier: 1, hands: 1, stats: {damage: 10}}),
		
		// Unique:
		SerpentFangDagger:		_(Melee, 	{f: 7,	 	tier: 2, hands: 1, stats: {damage: 8, parryChance: 0.20}, procEffect: 'Poison'}),
		BloodStinger:			_(Melee, 	{f: 8, 		tier: 2, hands: 1, stats: {damage: 8, parryChance: 0.20}, procEffect: 'LifeTap'}),
		
		
		// MELEE_WEAPONS_TIER_III:
		// ********************************************************************************************
		// One Hand:
		BroadSword: 			_(Melee, 	{f: 2,		tier: 3, hands: 1, stats: {damage: 10, parryChance: 0.20}}),
		WarAxe:					_(Cleave, 	{f: 66,		tier: 3, hands: 1, stats: {damage: 8}}),
		Pike: 					_(Pole, 	{f: 34,		tier: 3, hands: 1, stats: {damage: 10}}),
		Hammer:					_(Blunt, 	{f: 98,		tier: 3, hands: 1, stats: {damage: 12}}),
		
		// One Hand Magic:
		StormChopper:			_(Storm,	{f: 70, 	tier: 3, hands: 1, stats: {damage: 12, shockResistance: 0.20}}),
		InfernoSword:			_(Flame,	{f: 6, 		tier: 3, hands: 1, stats: {damage: 12, parryChance: 0.20, fireResistance: 0.20}}),
		BladeOfEnergy:			_(Melee,	{f: 9, 		tier: 3, hands: 1, stats: {damage: 10, parryChance: 0.20}, procEffect: 'EnergyDrain'}),
		SlimeCoveredHarpoon:	_(Pole,		{f: 38,		tier: 3, hands: 1, stats: {damage: 10}, procEffect: 'Poison'}),
		FrostForgedHammer:		_(Blunt,	{f: 102, 	tier: 3, hands: 1, stats: {damage: 12}, procEffect: 'Freeze'}),
		
		// Two Hand:
		TwoHandSword: 			_(Melee, 	{f: 3,		tier: 3, hands: 2, stats: {damage: 15, parryChance: 0.20}}),
		BattleAxe:				_(Cleave, 	{f: 67,		tier: 3, hands: 2, stats: {damage: 13}}),
		Halberd: 				_(Pole, 	{f: 35,		tier: 3, hands: 2, stats: {damage: 15}}),
		WarHammer:				_(Blunt, 	{f: 99,		tier: 3, hands: 2, stats: {damage: 17}}),
		
		// Two Hand Magic:
		ScythOfReaping:			_(Cleave,	{f: 71, 	tier: 3, hands: 2, stats: {damage: 13, lifeTap: 2}, procEffect: 'LifeTap'}),
		HammerOfCrushing:		_(Blunt, 	{f: 103,	tier: 3, hands: 2, stats: {damage: 17, strength: 2}, attackEffect: 'Crush'}),
		
		// RANGE_WEAPONS_TIER_I:
		// ********************************************************************************************
		ShortBow:				_(Proj, 	{f: 128, 	tier: 1, maxTier: 2, hands: 2, projectileName: 'Dart', range: 5.0, stats: {damage: 4}}),
		
		// Unique:
		GoblinSwiftBow:			_(Proj, 	{f: 136, 	tier: 1, hands: 2, projectileName: 'Dart', range: 5.0, stats: {damage: 5, evasion: 0.1}}),
		
		// RANGE_WEAPONS_TIER_II:
		// ********************************************************************************************
		LongBow:				_(Proj,		{f: 129, 	tier: 1, hands: 2, projectileName: 'Dart', range: 5.0, stats: {damage: 6}}),
	
		// Unique:
		HeartwoodBow:			_(Proj,		{f: 133, 	tier: 2, hands: 2, projectileName: 'VineDart', range: 5.0, stats: {damage: 6}}),
	
		// RANGE_WEAPONS_TIER_III:
		// ********************************************************************************************
		CrossBow:				_(Proj,		{f: 131, 	tier: 3, hands: 2, projectileName: 'Bolt', range: 4.0, stats: {damage: 8}}),
		CompoundBow:			_(Proj,		{f: 130, 	tier: 3, hands: 2, projectileName: 'Dart', range: 5.0, stats: {damage: 8}}),
		
		// Unique:
		SpiritBow:				_(Proj,		{f: 135, 	tier: 3, hands: 2, projectileName: 'Dart', range: 5.0, stats: {damage: 9, maxHp: 12}}),
		DrachnidWebBow:			_(Proj,		{f: 137, 	tier: 3, hands: 2, projectileName: 'WebDart', range: 5.0, stats: {damage: 9}}),
		HandCannon:				_(Proj,		{f: 138,	tier: 3, hands: 2, projectileName: 'Shot', shootSound: gs.sounds.shoot, range: 5.0, stats: {damage: 10}}),
		
		// STAVES_TIER_I:
		// ********************************************************************************************
		StaffOfFire:			_(Staff,	{f: 16, 	tier: 1, maxTier: 2, projectileName: 'FireArrow', 			stats: {damage: 5}}),
		StaffOfStorms:			_(Staff,	{f: 24, 	tier: 1, maxTier: 2, projectileName: 'Spark', 				stats: {damage: 5}}),
		StaffOfIce:				_(Staff,	{f: 48, 	tier: 1, maxTier: 2, projectileName: 'IceArrow', 			stats: {damage: 5}}),
		StaffOfPoison:			_(Staff,	{f: 56, 	tier: 1, maxTier: 2, projectileName: 'StrongPoisonArrow', 	stats: {damage: 5}}),
		StaffOfMagicMissiles:	_(Staff,	{f: 80, 	tier: 1, maxTier: 2, projectileName: 'MagicMissile', 		stats: {damage: 5}}),
		
		// Unique:
        GoblinBattleStaff:    	_(Staff,    {f: 84,     tier: 1, projectileName: 'MagicMissile',        stats: {damage: 6, abilityPower: 0.1}}),
		
		// STAVES_TIER_II:
		// ********************************************************************************************
		StaffOfEnergy:			_(Staff,	{f: 81, 	tier: 2, projectileName: 'MagicMissile', 		stats: {damage: 7, maxMp: 6}}),
		StaffOfPower:			_(Staff,	{f: 82, 	tier: 2, projectileName: 'MagicMissile', 		stats: {damage: 7, abilityPower: 0.2}}),		
		GreaterStaffOfFire:		_(Staff,	{f: 17, 	tier: 3, projectileName: 'FireArrow', 			stats: {damage: 9}}),
		GreaterStaffOfStorms:	_(Staff,	{f: 25, 	tier: 3, projectileName: 'Spark', 				stats: {damage: 9}}),
		GreaterStaffOfIce:		_(Staff,	{f: 49, 	tier: 3, projectileName: 'IceArrow', 			stats: {damage: 9}}),
		GreaterStaffOfPoison:	_(Staff,	{f: 57, 	tier: 3, projectileName: 'StrongPoisonArrow', 	stats: {damage: 16}}),
		
		// Unique:
		RunicStaffOfDeath:		_(Staff,	{f: 83, 	tier: 2, projectileName: 'LifeTap', 			stats: {damage: 7}}),
		
		// STAVES_TIER_III:
		// ********************************************************************************************
		// Unique:
		GlacierForgedStaff:		_(Staff,	{f: 50, 	tier: 3, projectileName: 'FreezeArrow', 		stats: {damage: 10, coldResistance: 0.20}}),
		MoltenForgedStaff:		_(Staff, 	{f: 18, 	tier: 3, projectileName: 'FireArrow', 			stats: {damage: 10, fireResistance: 0.20}, knockBack: 1}),
		LightningForgedStaff:	_(Staff,	{f: 26,		tier: 3, projectileName: 'SparkBall',			stats: {damage: 10, shockResistance: 0.20}, knockBack: 1}),
		
		// TIER_I_ARMOR_ARMOR:
		// ********************************************************************************************
		// CLOTH:
		Robe:					_(Armor,	{f: 192,	tier: 1, 	maxTier: 2, stats: {enc: 3, maxMp: 4},			canRandArt: true}),
		Hat:					_(Helmet,	{f: 224,	tier: 1, 	maxTier: 2, stats: {enc: 1, maxMp: 2},			canRandArt: true}),
		ClothGloves:			_(Gloves,	{f: 256,	tier: 1, 	maxTier: 2, stats: {enc: 1, maxMp: 2},			canRandArt: true}),
		Shoes:					_(Boots,	{f: 288,	tier: 1, 	maxTier: 2, stats: {enc: 1, maxMp: 2},			canRandArt: true}),
		
		// LEATHER:
		LeatherArmor:			_(Armor,	{f: 193,	tier: 1, 	maxTier: 2, stats: {enc: 4, protection: 3},		canRandArt: true}),
		LeatherHelm:			_(Helmet,	{f: 225,	tier: 1, 	maxTier: 2, stats: {enc: 2, protection: 1},		canRandArt: true}),
		LeatherGloves:			_(Gloves,	{f: 257,	tier: 1, 	maxTier: 2, stats: {enc: 2, protection: 1},		canRandArt: true}),
		LeatherBoots:			_(Boots,	{f: 289,	tier: 1, 	maxTier: 2, stats: {enc: 2, protection: 1},		canRandArt: true}),
        
        // SHIELDS:
        WoodenBuckler:			_(Shield,	{f: 336,	tier: 1,	maxTier: 2, stats: {enc: 4, protection: 1}}),    
        GoblinWarShield:        _(Shield,   {f: 348,    tier: 1,    stats: {enc: 4, protection: 2, maxHp: 6}}),
		
		// ARMOR:
		BearHideCloak:			_(Armor,	{f: 220,	tier: 1,	stats: {enc: 4, protection: 2, maxHp: 6}}),
		
		// TIER_II_ARMOR:
		// ********************************************************************************************
		// CHAIN:
		ChainArmor:				_(Armor,	{f: 194,	tier: 2, 	stats: {enc: 5, protection: 4},	canRandArt: true}),
		ChainCoif:				_(Helmet,	{f: 226,	tier: 2, 	stats: {enc: 3, protection: 2},		canRandArt: true}),
		ChainGloves:			_(Gloves,	{f: 258,	tier: 2, 	stats: {enc: 3, protection: 2},		canRandArt: true}),
		ChainBoots:				_(Boots,	{f: 290,	tier: 2, 	stats: {enc: 3, protection: 2},		canRandArt: true}),
		
		// ROBES:
		RobeOfProtection:		_(Armor,	{f: 321,	tier: 2,	stats: {enc: 3, maxMp: 4, protection: 3}}),
		RobeOfFlames:			_(Armor,	{f: 322,	tier: 2,	stats: {enc: 3, maxMp: 4, fireResistance: 0.2}}),
		RobeOfStorms:			_(Armor,	{f: 323,	tier: 2,	stats: {enc: 3, maxMp: 4, shockResistance: 0.2}}),
		RobeOfIce:				_(Armor,	{f: 324,	tier: 2,	stats: {enc: 3, maxMp: 4, coldResistance: 0.2}}),
		RobeOfDeath:			_(Armor,	{f: 325,	tier: 2,	stats: {enc: 3, maxMp: 4, toxicResistance: 0.2}}),
		
		// ARMOR:
		CloakOfStealth:			_(Armor,	{f: 210,	tier: 2,	stats: {enc: 3, stealth: 2}}),
		EntWoodArmor:			_(Armor,	{f: 208,	tier: 2,	stats: {enc: 5, protection: 3, maxHp: 6}}),
		NoxiousCarapaceArmor:	_(Armor,	{f: 209,	tier: 2,	stats: {enc: 5, protection: 3, toxicResistance: 0.2}}),
		
		// HELMETS:
		MysticSkullHelm:		_(Helmet,	{f: 244,	tier: 2, 	stats: {enc: 1}, cantEnchant: true}),
		CircletOfKnowledge:		_(Helmet,	{f: 240,	tier: 2,	stats: {enc: 1, intelligence: 2}}),
		VeilOfTheSwamp:			_(Helmet,	{f: 246,	tier: 2,	stats: {enc: 1, intelligence: 1, mentalResistance: 1}}),
		HelmOfTelepathy:		_(Helmet,	{f: 242,	tier: 3, 	stats: {enc: 1, isTelepathic: 1, intelligence: 1}}),
		ArcheryGoggles: 		_(Helmet,	{f: 243,	tier: 3,	stats: {enc: 1, bonusRangeDamage: 3}}),
		
		// GLOVES:
		GlovesOfVampirism: 		_(Gloves,	{f: 274,	tier: 3,	stats: {enc: 2, lifeTap: 2}}),
		BeastMastersGloves:		_(Gloves,	{f: 275,	tier: 3,	stats: {enc: 2, protection: 1, isDSImmune: 1}, cantEnchant: true}),
		
		// BOOTS:
		BootsOfStealth: 		_(Boots,	{f: 306,	tier: 2,	stats: {enc: 1, stealth: 1}}),
		BootsOfFlight:			_(Boots,	{f: 304,	tier: 2, 	stats: {enc: 1, isFlying: 1}, cantEnchant: true}),
		BootsOfTheSilentSands:	_(Boots,	{f: 308,	tier: 2, 	stats: {enc: 1, stealth: 1, maxSp: 1}}),
        
        // SHIELDS:
        WoodenShield:			_(Shield,	{f: 337,	tier: 2,	stats: {enc: 5, protection: 2}}),
		SpikyShield:			_(Shield,	{f: 340,	tier: 2,	stats: {enc: 5, protection: 2, physicalDamageShield: 2}}),
		MushroomCapShield:		_(Shield,   {f: 349,    tier: 2,    stats: {enc: 5, protection: 2, maxHp: 9}}),
		
		// TIER_III_EQUIPMENT
		// ********************************************************************************************
		// PLATE:
		PlateArmor:				_(Armor,	{f: 195,	tier: 3, 	stats: {enc: 6, protection: 5},	canRandArt: true}),
		PlateHelm:				_(Helmet,	{f: 227,	tier: 3, 	stats: {enc: 4, protection: 3},		canRandArt: true}),
		PlateGauntlets:			_(Gloves,	{f: 259,	tier: 3, 	stats: {enc: 4, protection: 3},		canRandArt: true}),
		PlateBoots:				_(Boots,	{f: 291,	tier: 3, 	stats: {enc: 4, protection: 3},		canRandArt: true}),
		
		// SHADOW_SILK:
		ShadowSilkArmor:		_(Armor,	{f: 199,	tier: 3, 	stats: {enc: 4, protection: 3, dexterity: 2, toxicResistance: 0.30},	canRandArt: true}),
		ShadowSilkHelm:			_(Helmet,	{f: 231,	tier: 3, 	stats: {enc: 2, protection: 1, dexterity: 1, toxicResistance: 0.20},	canRandArt: true}),
		ShadowSilkGloves:		_(Gloves,	{f: 263,	tier: 3, 	stats: {enc: 2, protection: 1, dexterity: 1, toxicResistance: 0.20},	canRandArt: true}),
		ShadowSilkBoots:		_(Boots,	{f: 295,	tier: 3, 	stats: {enc: 2, protection: 1, dexterity: 1, toxicResistance: 0.20},	canRandArt: true}),
		
		// ARCH-MAGE:
		RobeOfWizardry:			_(Armor,	{f: 200,	tier: 3, 	stats: {enc: 3, intelligence: 2, fireResistance: 0.2, coldResistance: 0.2, shockResistance: 0.2},	canRandArt: true}),
		HatOfWizardry:			_(Helmet,	{f: 232,	tier: 3, 	stats: {enc: 1, intelligence: 1, fireResistance: 0.1, coldResistance: 0.1, shockResistance: 0.1},	canRandArt: true}),
		GlovesOfWizardry:		_(Gloves,	{f: 264,	tier: 3, 	stats: {enc: 1, intelligence: 1, fireResistance: 0.1, coldResistance: 0.1, shockResistance: 0.1},	canRandArt: true}),
		ShoesOfWizardry:		_(Boots,	{f: 296,	tier: 3, 	stats: {enc: 1, intelligence: 1, fireResistance: 0.1, coldResistance: 0.1, shockResistance: 0.1},	canRandArt: true}),
		
		// HEAVY_BRASS:
		HeavyBrassArmor:		_(Armor,	{f: 196,	tier: 3,	stats: {enc: 8, protection: 5, strength: 2}, canRandArt: true}),
		HeavyBrassHelm:			_(Helmet,	{f: 228,	tier: 3,	stats: {enc: 5, protection: 3, strength: 1}, canRandArt: true}),
		HeavyBrassGauntlets:	_(Gloves,	{f: 260,	tier: 3,	stats: {enc: 5, protection: 3, strength: 1}, canRandArt: true}),
		HeavyBrassBoots:		_(Boots,	{f: 292,	tier: 3,	stats: {enc: 5, protection: 3, strength: 1}, canRandArt: true}),
		
		// ROBES:
		RobeOfPyromancy:		_(Armor,	{f: 326,	tier: 3,	stats: {enc: 3, maxMp: 9, fireResistance: 0.2, abilityPower: 0.2}}),
		RobeOfStormology:		_(Armor,	{f: 327,	tier: 3,	stats: {enc: 3, maxMp: 9, shockResistance: 0.2, abilityPower: 0.2}}),
		RobeOfCryomancy:		_(Armor,	{f: 328,	tier: 3,	stats: {enc: 3, maxMp: 9, coldResistance: 0.2, abilityPower: 0.2}}),
		RobeOfNecromancy:		_(Armor,	{f: 329,	tier: 3,	stats: {enc: 3, maxMp: 9, toxicResistance: 0.2, abilityPower: 0.2}}),
		RobeOfFlowingMana:		_(Armor,	{f: 330,	tier: 3, 	stats: {enc: 3, maxMp: 15}}),
		
		// DRAGON_SCALE_ARMOR:
		RedDragonScaleArmor:	_(Armor,	{f: 211,	tier: 3,	stats: {enc: 6, protection: 5, fireResistance: 0.4}}),
		GreenDragonScaleArmor:	_(Armor,	{f: 212,	tier: 3,	stats: {enc: 6, protection: 5, toxicResistance: 0.4}}),
		BlueDragonScaleArmor:	_(Armor,	{f: 213,	tier: 3,	stats: {enc: 6, protection: 5, shockResistance: 0.4}}),
		WhiteDragonScaleArmor:	_(Armor,	{f: 214,	tier: 3,	stats: {enc: 6, protection: 5, coldResistance: 0.4}}),
		
		// ARMOR::
		ClockworkPowerArmor:	_(Armor,	{f: 219,	tier: 3,	stats: {enc: 6, protection: 5, strength: 3}}),
		CrystalArmor:			_(Armor,	{f: 215,	tier: 3,	stats: {enc: 6, protection: 4, reflection: 0.20}}),
		PolarBearCloak:			_(Armor,	{f: 216,	tier: 3,	stats: {enc: 5, protection: 3, maxHp: 12, coldResistance: 0.2}}),
		LockJawHideVest:		_(Armor,	{f: 217,	tier: 3,	stats: {enc: 5, protection: 3, maxHp: 12, toxicResistance: 0.2}}),
		FlamingCarapace:		_(Armor,	{f: 218,	tier: 3,	stats: {enc: 5, protection: 3, fireDamageShield: 4, fireResistance: 0.2}}),
		
		// BOOTS:
		BootsOfSpeed: 			_(Boots,	{f: 305,	tier: 3,	stats: {enc: 1, maxSp: 2}}),
		BootsOfVampirism:		_(Boots,	{f: 307,	tier: 3,	stats: {enc: 1, hasBloodVampirism: 1}, cantEnchant: true}),
		MoltenForgedBoots:		_(Boots,	{f: 309,	tier: 3,	stats: {enc: 1, protection: 1, fireResistance: 0.2, isLavaImmune: 1}}),
		BootsOfDexterity:		_(Boots,	{f: 310,	tier: 3,	stats: {enc: 1, dexterity: 2}}),
		BootsOfWind:			_(Boots,	{f: 311,	tier: 3, 	stats: {enc: 1, isFlying: 1, reflection: 0.1}}),
        
		
		// GLOVES:
		GauntletsOfStrength: 	_(Gloves,	{f: 273,	tier: 3,	stats: {enc: 1, strength: 2}}),
		GlovesOfDexterity:		_(Gloves,	{f: 272,	tier: 3,	stats: {enc: 1, dexterity: 2}}),
		
		// HELMS:
		CrownOfPower:			_(Helmet,	{f: 241,	tier: 3,	stats: {enc: 1, strength: 2}}),
		CrownOfBrilliance:		_(Helmet,	{f: 247,	tier: 3,	stats: {enc: 1, intelligence: 3, mentalResistance: 1}}),
		CrownOfSlime:			_(Helmet,	{f: 248,	tier: 3,	stats: {enc: 1, toxicDamageShield: 4, toxicResistance: 0.2}}),
		TurbanOfFlames:			_(Helmet,	{f: 245,	tier: 3,	stats: {enc: 1, intelligence: 2, fireResistance: 0.2}}),
		
        // HEAVY_SHIELDS::
		MetalShield:			_(Shield,	{f: 338,	tier: 3,	stats: {enc: 6, protection: 3}}),
		RedDragonScaleShield:	_(Shield,	{f: 341,	tier: 3,	stats: {enc: 6, protection: 4, fireResistance: 0.4}}),
		GreenDragonScaleShield:	_(Shield,	{f: 342,	tier: 3,	stats: {enc: 6, protection: 4, toxicResistance: 0.4}}),
		BlueDragonScaleShield:	_(Shield,	{f: 343,	tier: 3,	stats: {enc: 6, protection: 4, shockResistance: 0.4}}),
		WhiteDragonScaleShield:	_(Shield,	{f: 344,	tier: 3,	stats: {enc: 6, protection: 4, coldResistance: 0.4}}),
		ChampionsShield:		_(Shield,	{f: 350,	tier: 3,	stats: {enc: 6, protection: 4, maxHp: 18}}),
		
		// LIGHT_SHIELDS:
		ShieldOfPower:			_(Shield,	{f: 345,	tier: 3,	stats: {enc: 4, protection: 2, abilityPower: 0.2}}),
		ShieldOfHealth:			_(Shield,	{f: 346,	tier: 3,	stats: {enc: 4, protection: 2, maxHp: 12}}),
		ShieldOfMana:			_(Shield,	{f: 347,	tier: 3,	stats: {enc: 4, protection: 2, maxMp: 6}}),
		ShieldOfReflection:		_(Shield,	{f: 339,	tier: 3,	stats: {enc: 4, protection: 2, reflection: 0.20}}),
		
		
		
		// TIER_I_RINGS:						 
		// ********************************************************************************************
		RingOfHealth:			_(Ring, 	{f: 352,	tier: 1,	stats: {maxHp: 10}}),
		RingOfMana:				_(Ring, 	{f: 353,	tier: 1,	stats: {maxMp: 6}}),
		RingOfFire: 			_(Ring, 	{f: 354, 	tier: 1,	stats: {fireResistance: 0.2}}),
		RingOfToxic:			_(Ring, 	{f: 355, 	tier: 1,	stats: {toxicResistance: 0.2}}),
		RingOfStorm:			_(Ring, 	{f: 356, 	tier: 1,	stats: {shockResistance: 0.2}}),
		RingOfIce:				_(Ring, 	{f: 357, 	tier: 1,	stats: {coldResistance: 0.2}}),
		RingOfProtection:		_(Ring, 	{f: 358,	tier: 1,	stats: {protection: 2}}),
		RingOfReflection:		_(Ring, 	{f: 359, 	tier: 1,	stats: {reflection: 0.20}}),
		RingOfSlaying:			_(Ring, 	{f: 360,	tier: 1,	stats: {bonusMeleeDamage: 3}}),
		RingOfArchery:			_(Ring, 	{f: 361,	tier: 1,	stats: {bonusRangeDamage: 3}}),
		RingOfSpeed:			_(Ring, 	{f: 405, 	tier: 1,	stats: {maxSp: 3}}),
		RingOfPower:			_(Ring, 	{f: 362,	tier: 1,	stats: {abilityPower: 0.20}}),
		RingOfStealth:			_(Ring, 	{f: 363,	tier: 1,	stats: {stealth: 1}}),
		RingOfFlight:			_(Ring, 	{f: 364, 	tier: 1,	stats: {isFlying: 1}, 								cantEnchant: true}),
		RingOfTheVampire:		_(Ring, 	{f: 365, 	tier: 1,	stats: {lifeTap: 1}}),
		RingOfSustenance: 		_(Ring, 	{f: 366, 	tier: 1,	stats: {hasSustenance: 1}, 							cantEnchant: true}),
		RingOfLifeSaving:		_(Ring, 	{f: 402, 	tier: 1,	stats: {hasLifeSaving: 1}, 							cantEnchant: true}),
		RingOfWealth:			_(Ring, 	{f: 403, 	tier: 1,	stats: {bonusGoldMod: 1.0, maxHpModifier: -0.20}, 	cantEnchant: true}),
		RingOfLearning: 		_(Ring, 	{f: 404, 	tier: 1,	stats: {bonusExpMod: 0.5, maxHpModifier: -0.20}, 	cantEnchant: true}),
		RingOfEvasion:			_(Ring, 	{f: 367,	tier: 1,	stats: {evasion: 0.1}}),
		
		// TIER_II_RINGS:
		// ********************************************************************************************
		// Attribute Rings:
		RingOfStrength:			_(Ring, 	{f: 368, 	tier: 2,	stats: {strength: 2}}),
		RingOfIntelligence:		_(Ring, 	{f: 369, 	tier: 2,	stats: {intelligence: 2}}),
		RingOfDexterity:		_(Ring, 	{f: 370, 	tier: 2,	stats: {dexterity: 2}}),
		
		// Unique:
		RingOfSpiritShielding:	_(Ring, 	{f: 390,	tier: 2,	stats: {hasSpiritShield: 1, maxMp: 3}}),
			
		// TIER_III_RINGS:
		// ********************************************************************************************
		InfernoRing:			_(Ring, 	{f: 400, 	tier: 3,	stats: {fireResistance: 0.2, fireDamageShield: 4}}),
		RingOfThunder:			_(Ring, 	{f: 401, 	tier: 3,	stats: {shockResistance: 0.2, shockDamageShield: 4}}),
		RingOfFortitude:		_(Ring, 	{f: 384,	tier: 3,	stats: {maxHp: 10, protection: 1}}),
		RingOfWizardry:			_(Ring, 	{f: 385, 	tier: 3,	stats: {maxMp: 6, abilityPower: 0.2}}),
		RingOfFlameShielding:	_(Ring, 	{f: 386, 	tier: 3,	stats: {fireResistance: 0.2, protection: 1}}),
		RingOfToxicShielding:	_(Ring, 	{f: 387, 	tier: 3,	stats: {toxicResistance: 0.2, protection: 1}}),
		RingOfStormShielding:	_(Ring, 	{f: 388, 	tier: 3,	stats: {shockResistance: 0.2, protection: 1}}),
		RingOfIceShielding:		_(Ring, 	{f: 389, 	tier: 3,	stats: {coldResistance: 0.2, protection: 1}}),
		RingOfTheWinds:			_(Ring, 	{f: 396, 	tier: 3,	stats: {isFlying: 1, reflection: 0.20}}),
		RingOfHarmony:			_(Ring, 	{f: 391, 	tier: 3,	stats: {maxHp: 10, maxMp: 6}}),
		RingOfResistance:		_(Ring, 	{f: 392, 	tier: 3,	stats: {fireResistance: 0.1, toxicResistance: 0.1, shockResistance: 0.1, coldResistance: 0.1}}),
		RingOfFlameEnergy:		_(Ring, 	{f: 371, 	tier: 3,	stats: {fireResistance: 0.2, maxMp: 6}}),
		RingOfToxicEnergy:		_(Ring, 	{f: 372, 	tier: 3,	stats: {toxicResistance: 0.2, maxMp: 6}}),
		RingOfStormEnergy:		_(Ring, 	{f: 373, 	tier: 3,	stats: {shockResistance: 0.2, maxMp: 6}}),
		RingOfIceEnergy:		_(Ring, 	{f: 374, 	tier: 3,	stats: {coldResistance: 0.2, maxMp: 6}}),
		
		// Unique:
		RingOfBlood:			_(Ring, 	{f: 397, 	tier: 3,	stats: {lifeTap: 2, maxHp: 12}}),
		
		
		// CHARMS:
		// ********************************************************************************************
		// STAT_CHARMS:
		CharmOfHealth:			_(Charm, 	{f: 176, tier: 3, stats: {maxHp: 15}}),
		CharmOfEnergy:			_(Charm, 	{f: 177, tier: 3, stats: {maxMp: 9}}),
		CharmOfSpeed:			_(Charm,	{f: 178, tier: 3, stats: {maxSp: 3}}),
		CharmOfExtension:		_(Charm, 	{f: 179, tier: 3, stats: {bonusProjectileRange: 1}, cantEnchant: true}),
		CharmOfSwiftness:		_(Charm, 	{f: 180, tier: 3, stats: {coolDownModifier: 0.20}, cantEnchant: true}),
		CharmOfDraining:		_(Charm, 	{f: 181, tier: 3, stats: {manaTap: 1}, cantEnchant: true}),
		CharmOfConservation:	_(Charm, 	{f: 182, tier: 3, stats: {manaConservation: 1}, cantEnchant: true}),
		
		// UNIQUE_CHARMS:
		TotemOfStrength:		_(Charm, 	{f: 189, tier: 1, stats: {strength: 2}}),
		TotemOfDexterity:		_(Charm, 	{f: 190, tier: 1, stats: {dexterity: 2}}),
		TotemOfIntelligence:	_(Charm, 	{f: 191, tier: 1, stats: {intelligence: 2}}),
		
		
		/*
		
		
		// ABILITY_CHARMS:
		CharmOfEnergy:			_(Charm, 	{f: 176, useEffect: 'Energy', 				coolDown: [300, 200, 150, 100]}),
		CharmOfHealing:			_(Charm, 	{f: 177, useEffect: 'Healing', 				coolDown: [300, 200, 150, 100]}),
		CharmOfFire:			_(Charm, 	{f: 178, useEffect: 'BurstOfFlame', 		coolDown: [300, 200, 150, 100]}),
		CharmOfShocking:		_(Charm, 	{f: 179, useEffect: 'Shock', 				coolDown: [300, 200, 150, 100]}),
		CharmOfDisease:			_(Charm, 	{f: 180, useEffect: 'InfectiousDisease',	coolDown: [300, 200, 150, 100]}),
		CharmOfFreezing:		_(Charm, 	{f: 181, useEffect: 'Freeze', 				coolDown: [300, 200, 150, 100]}),
		CharmOfConfusion:		_(Charm, 	{f: 183, useEffect: 'Confusion',			coolDown: [300, 200, 150, 100]}),
		*/
		
		
		// WANDS_AND_EVOKABLES:
		WandOfFire:				_(Wand,		{f: 144, useEffect: 'FireBall',			stats: {maxCharges: 5}}),
		WandOfLightning:		_(Wand,		{f: 145, useEffect: 'LightningBolt',	stats: {maxCharges: 5}}),
		WandOfCold:				_(Wand,		{f: 146, useEffect: 'ConeOfCold',		stats: {maxCharges: 5}}),
		WandOfDraining:			_(Wand,		{f: 147, useEffect: 'LifeDrain',		stats: {maxCharges: 5}}),
		WandOfConfusion:		_(Wand,		{f: 148, useEffect: 'Confusion',		stats: {maxCharges: 5}}),
		FanOfWinds:				_(Wand,		{f: 152, useEffect: 'BurstOfWind',		stats: {maxCharges: 5}}),
		MossyBranch:			_(Wand, 	{f: 153, useEffect: 'SummonVines',		stats: {maxCharges: 5}}),
		WandOfBlades:			_(Wand,		{f: 149, useEffect: 'SummonBlades',		stats: {maxCharges: 5}}),
		FluteOfTheScavengers:	_(Wand,		{f: 151, useEffect: 'SummonRats', 		stats: {maxCharges: 5}}),
		FluteOfTheSewers:		_(Wand, 	{f: 154, useEffect: 'SummonSewerRats',	stats: {maxCharges: 5}}),
		WandOfBlinking:			_(Wand,		{f: 150, useEffect: 'Blink',			stats: {maxCharges: 3}}),
		TotemOfTheBeasts:		_(Wand, 	{f: 159, useEffect: 'SummonWolves', 	stats: {maxCharges: 5}}),
		AmuletOfLife:			_(Wand, 	{f: 174, useEffect: 'Healing', 			stats: {maxCharges: 3}}),

		
		// CONSUMABLE_PROJECTILES:
		Javelin:				{f: 113, slot: ITEM_SLOT.CONSUMABLE, isThrowingWeapon: true, useEffect: 'Javelin', dropAmount: 6, stackable: true, sound: gs.sounds.weapon},
		ThrowingNet:			{f: 114, slot: ITEM_SLOT.CONSUMABLE, isThrowingWeapon: true, useEffect: 'ThrowingNet', cantEnchant: true, dropAmount: 6, stackable: true, sound: gs.sounds.weapon},
        Chakram:           		{f: 116, slot: ITEM_SLOT.CONSUMABLE, isThrowingWeapon: true, useEffect: 'Chakram', cantEnchant: true, dropAmount: 6, stackable: true, sound: gs.sounds.weapon},
		Bomb:					{f: 115, slot: ITEM_SLOT.CONSUMABLE, isThrowingWeapon: true, useEffect: 'Bomb', cantEnchant: true, dropAmount: 6, stackable: true, sound: gs.sounds.weapon},
		
		// CONSUMABLES:
		PotionOfHealing:		{f: 416, slot: ITEM_SLOT.CONSUMABLE, isPotion: true, useEffect: 'PotionOfHealing', edible: true},
		PotionOfEnergy:			{f: 417, slot: ITEM_SLOT.CONSUMABLE, isPotion: true, useEffect: 'PotionOfEnergy', edible: true},
		PotionOfExperience:		{f: 418, slot: ITEM_SLOT.CONSUMABLE, isPotion: true, useEffect: 'PotionOfExperience', edible: true},
		PotionOfResistance: 	{f: 419, slot: ITEM_SLOT.CONSUMABLE, isPotion: true, useEffect: 'PotionOfResistance', edible: true},
		PotionOfPower:			{f: 420, slot: ITEM_SLOT.CONSUMABLE, isPotion: true, useEffect: 'PotionOfPower', edible: true},
		PotionOfLevitation:		{f: 421, slot: ITEM_SLOT.CONSUMABLE, isPotion: true, statusEffectName: 'Levitation', edible: true},
		PotionOfGainAttribute:	{f: 422, slot: ITEM_SLOT.CONSUMABLE, isPotion: true, useEffect: 'PotionOfGainAttribute', edible: true},
		PotionOfAmnesia:		{f: 423, slot: ITEM_SLOT.CONSUMABLE, isPotion: true, useEffect: 'PotionOfAmnesia', edible: true, tier: 3},
		
		// MISC_CONSUMABLES:
		Meat:					{f: 431, slot: ITEM_SLOT.CONSUMABLE, useEffect: 'Eat', sound: gs.sounds.food, edible: true},
		HealingShroom:			{f: 428, slot: ITEM_SLOT.CONSUMABLE, useEffect: 'HealingShroom', sound: gs.sounds.food, edible: true},
		EnergyShroom:			{f: 429, slot: ITEM_SLOT.CONSUMABLE, useEffect: 'EnergyShroom', sound: gs.sounds.food, edible: true},
		
		// SCROLLS:
		ScrollOfTeleportation:	{f: 432, slot: ITEM_SLOT.CONSUMABLE, isScroll: true, useEffect: 'Teleportation', sound: gs.sounds.scroll},
		ScrollOfBlink:			{f: 433, slot: ITEM_SLOT.CONSUMABLE, isScroll: true, useEffect: 'Blink', sound: gs.sounds.scroll},
		ScrollOfFear:			{f: 434, slot: ITEM_SLOT.CONSUMABLE, isScroll: true, useEffect: 'ScrollOfFear', sound: gs.sounds.scroll},
		ScrollOfEnchantment:	{f: 435, slot: ITEM_SLOT.CONSUMABLE, isScroll: true, useEffect: 'ScrollOfEnchantment', sound: gs.sounds.scroll},
		ScrollOfAcquirement:	{f: 436, slot: ITEM_SLOT.CONSUMABLE, isScroll: true, useEffect: 'ScrollOfAcquirement', sound: gs.sounds.scroll},
		ScrollOfHellFire:		{f: 437, slot: ITEM_SLOT.CONSUMABLE, isScroll: true, useEffect: 'HellFire', sound: gs.sounds.scroll},
		ScrollOfDomination:		{f: 438, slot: ITEM_SLOT.CONSUMABLE, isScroll: true, useEffect: 'Domination', sound: gs.sounds.scroll},
		ScrollOfFlashFreeze:	{f: 439, slot: ITEM_SLOT.CONSUMABLE, isScroll: true, useEffect: 'FlashFreeze', sound: gs.sounds.scroll},
		
		// TALENT_TOMES:
		// ********************************************************************************************
		// MAGIC:
		TomeOfPyromancy:		{f: 443, slot: ITEM_SLOT.CONSUMABLE, isTome: true, useEffect: 'ReadTome', stackable: false, sound: gs.sounds.scroll},
		TomeOfStormology:		{f: 444, slot: ITEM_SLOT.CONSUMABLE, isTome: true, useEffect: 'ReadTome', stackable: false, sound: gs.sounds.scroll},
		TomeOfCryomancy:		{f: 445, slot: ITEM_SLOT.CONSUMABLE, isTome: true, useEffect: 'ReadTome', stackable: false, sound: gs.sounds.scroll},
		TomeOfNecromancy:		{f: 446, slot: ITEM_SLOT.CONSUMABLE, isTome: true, useEffect: 'ReadTome', stackable: false, sound: gs.sounds.scroll},
		TomeOfEnchantments:		{f: 447, slot: ITEM_SLOT.CONSUMABLE, isTome: true, useEffect: 'ReadTome', stackable: false, sound: gs.sounds.scroll},
		
		// NON-MAGIC
		TomeOfWar:				{f: 475, slot: ITEM_SLOT.CONSUMABLE, isTome: true, useEffect: 'ReadTome', stackable: false, sound: gs.sounds.scroll},
		TomeOfRage:				{f: 476, slot: ITEM_SLOT.CONSUMABLE, isTome: true, useEffect: 'ReadTome', stackable: false, sound: gs.sounds.scroll},
		TomeOfArchery:			{f: 477, slot: ITEM_SLOT.CONSUMABLE, isTome: true, useEffect: 'ReadTome', stackable: false, sound: gs.sounds.scroll},
		TomeOfStealth:			{f: 478, slot: ITEM_SLOT.CONSUMABLE, isTome: true, useEffect: 'ReadTome', stackable: false, sound: gs.sounds.scroll},
		TomeOfDueling:			{f: 479, slot: ITEM_SLOT.CONSUMABLE, isTome: true, useEffect: 'ReadTome', stackable: false, sound: gs.sounds.scroll},
		
		
		// RUNES:
		RuneOfFire:				{f: 464, slot: ITEM_SLOT.NONE, isRune: true, sound: gs.sounds.levelUp},
		RuneOfIce:				{f: 465, slot: ITEM_SLOT.NONE, isRune: true, sound: gs.sounds.levelUp},
		RuneOfDeath:			{f: 466, slot: ITEM_SLOT.NONE, isRune: true, sound: gs.sounds.levelUp},
		RuneOfMagic:			{f: 467, slot: ITEM_SLOT.NONE, isRune: true, sound: gs.sounds.levelUp},
		RuneOfSlime:			{f: 468, slot: ITEM_SLOT.NONE, isRune: true, sound: gs.sounds.levelUp},
		RuneOfIron:				{f: 469, slot: ITEM_SLOT.NONE, isRune: true, sound: gs.sounds.levelUp},
		RuneOfMight:			{f: 470, slot: ITEM_SLOT.NONE, isRune: true, sound: gs.sounds.levelUp},
		RuneOfChaos:			{f: 471, slot: ITEM_SLOT.NONE, isRune: true, sound: gs.sounds.levelUp},
		
		// MISC:
		GoldCoin:			{f: 448, slot: ITEM_SLOT.NONE},
		Key:				{f: 450, slot: ITEM_SLOT.NONE},
		GobletOfYendor:		{f: 451, slot: ITEM_SLOT.NONE, sound: gs.sounds.jewlery},
		TestArmor:			{f: 193, slot: ITEM_SLOT.BODY},
		
	};
	this.nameTypes(this.itemTypes);
	
	
	// TEST_ARMOR_STATS:
	// ********************************************************************************************
	this.itemTypes.TestArmor.stats = {
		fireResistance: 0.2,
		coldResistance: 0.2,
		shockResistance: 0.2,
		toxicResistance: 0.2,
		protection: 2,
		reflection: 0.2,
		evasion: 0.2,
		lifeTap: 1,
		isFlying: 1,
		fireDamageShield: 2,
		stealth: 1,
	};
	
	// ITEM_ANIMS:
	// ********************************************************************************************
	this.itemTypes.GoldCoin.anim = [448, 449];

	this.setItemDescriptions();
	this.setItemCosts();
	
	this.setItemTypeDefaultProperties();
};



// SET_ITEM_DESCRIPTIONS:
// ************************************************************************************************
gs.setItemDescriptions = function () {
	let _ = this.itemTypes;
	
	// RUNES:
	_.RuneOfFire.desc = 		'Unlocks the gate to The Vault of Yendor.';
	_.RuneOfIce.desc = 			'Unlocks the gate to The Vault of Yendor.';
	_.RuneOfDeath.desc = 		'Unlocks the gate to The Vault of Yendor.';
	_.RuneOfMagic.desc = 		'Unlocks the gate to The Vault of Yendor.';
	_.RuneOfSlime.desc = 		'Unlocks the gate to The Vault of Yendor.';
	_.RuneOfIron.desc = 		'Unlocks the gate to The Vault of Yendor.';
	_.RuneOfMight.desc = 		'Unlocks the gate to The Vault of Yendor.';
	_.RuneOfChaos.desc = 		'Unlocks the gate to The Vault of Yendor.';
	
	// CHARMS:
	_.CharmOfHealth.desc = CHARM_TEXT;
	_.CharmOfEnergy.desc = CHARM_TEXT;
	_.CharmOfSpeed.desc = CHARM_TEXT;
	_.CharmOfExtension.desc = CHARM_TEXT;
	_.CharmOfSwiftness.desc = CHARM_TEXT;
	_.CharmOfDraining.desc = CHARM_TEXT;
	_.CharmOfConservation.desc = CHARM_TEXT + '\n\nReduces the mana cost of all spells.';
	_.TotemOfStrength.desc = CHARM_TEXT;
	_.TotemOfDexterity.desc = CHARM_TEXT;
	_.TotemOfIntelligence.desc = CHARM_TEXT;
	
		
	
	
	// AXES:
	_.HandAxe.desc = 				'Cleaves with every attack, hitting up to 3 adjacent enemies.';
	_.BloodStainedAxe.desc =		'Cleaves with every attack, hitting up to 3 adjacent enemies.';
	_.BroadAxe.desc = 				'Cleaves with every attack, hitting up to 3 adjacent enemies.';
	_.WarAxe.desc =					'Cleaves with every attack, hitting up to 3 adjacent enemies.';
	_.BattleAxe.desc = 				'A two handed weapon. Cleaves with every attack, hitting up to 3 adjacent enemies.';		
	_.ScythOfReaping.desc = 		'A two handed weapon. Cleaves with every attack, hitting up to 3 adjacent enemies. Lifetap enemies on 25% of attacks, healing your hp.';
	_.StormChopper.desc = 			'Cleaves with every attack, hitting up to 3 adjacent enemies with a powerful shocking attack.';
	
	// HAMMERS:
    _.Mace.desc = 					'Penetrates all armor, completely ignoring protection.';
    _.Hammer.desc =					'Penetrates all armor, completely ignoring protection.';
	_.WarHammer.desc = 				'A two handed weapon. Penetrates all armor, completely ignoring protection.';
	_.HammerOfCrushing.desc = 		"A two handed weapon. Penetrates all armor, completely ignoring protection. Inflicts critical hits when crushing enemies against walls.";
	_.FrostForgedHammer.desc =		'Penetrates all armor, completely ignoring protection.\n\nFreezes enemies on 10% of attacks.';
	
	// POLE_ARMS:
	_.Spear.desc = 					'Can attack enemies two tiles away.\n\nIgnores enemy damage shields.';
	_.Pike.desc =					'Can attack enemies two tiles away.\n\nIgnores enemy damage shields.';
	_.Halberd.desc = 				'Can attack enemies two tiles away.\n\nIgnores enemy damage shields.\n\nA two handed weapon.';
	_.SlimeCoveredHarpoon.desc =	'Can attack enemies two tiles away.\n\nIgnores enemy damage shields.\n\nPoisons enemies on 25% of attacks for 2x base damage.';
	
	// MELEE_WEAPONS:
	_.TwoHandSword.desc = 			'A two handed weapon.';
	
	// MAGIC_MELEE_WEAPONS:
	_.InfernoSword.desc = 			'Attacks with a powerful flaming attack';	
	_.SerpentFangDagger.desc = 		'Poisons enemies on 25% of attacks for 2x base damage.';
	_.BloodStinger.desc = 			'Lifetaps enemies on 25% of attacks, healing your hp.';
	_.BladeOfEnergy.desc = 			"Taps energy on 25% of attacks, restoring your mana.";
	
	// RANGE_WEAPONS:
	_.CrossBow.desc = 				'Penetrates all armor, completely ignoring protection.';
	_.HandCannon.desc =				'Penetrates all armor, completely ignoring protection.';
	
	// MAGIC_RANGE_WEAPONS:
	_.HeartwoodBow.desc = 			'Creates vines around the target on 20% of attacks.';
	_.DrachnidWebBow.desc =			'Creates webs around the target on 20% of attacks.';
	
	// THROWING_WEAPONS:
	_.Chakram.desc = 				"Hits multiple enemies in a line";
	_.ThrowingNet.desc =			'Traps an enemy for, rendering them unable to move for 8 turns.';
	
	// STAVES:
	_.StaffOfPoison.desc = 			'Fires projectiles that will poison enemies.';
	_.GreaterStaffOfPoison.desc = 	'Fires projectiles that will poison enemies.';
	_.StaffOfIce.desc = 			'Fires freezing projectiles that will slow enemies.';
	_.GreaterStaffOfIce.desc = 		'Fires freezing projectiles that will slow enemies.';
	_.RunicStaffOfDeath.desc = 		'Lifetaps enemies on 25% of attacks, healing your hp.';
	_.GlacierForgedStaff.desc = 	'Freezes enemies on 10% of attacks.';
	_.MoltenForgedStaff.desc =		'Knocks enemies back on 25% of attacks.';
	_.LightningForgedStaff.desc =	'Knocks enemies back on 25% of attacks.';
	
	
	// POTIONS:
	_.Meat.desc = 					"*Completely satiates your hunger\n*Restores half your max HP, MP and SP";
	_.HealingShroom.desc = 			"Heals " + SHROOM_HP + " hit points. Will also cure poison.";
	_.EnergyShroom.desc = 			"Restores " + SHROOM_EP + " mana points.";
	_.PotionOfHealing.desc = 		"*Completely restores your HP.\n*Cures negative physical effects.\n*+3 Max HP if used at full health.";
	_.PotionOfResistance.desc = 	"*Completely restores your HP.\n*Cures negative physical effects.\n*Increases your defense to all damage types for 50 turns.";
	_.PotionOfEnergy.desc = 		"*Completely restores your MP and SP.\n*Cures negative mental effects.\n*+2 Max MP if used at full mana.";
	_.PotionOfPower.desc = 			"*Completely restores your MP and SP.\n*Cures negative mental effects.\n*Increases your melee, range and Magic power for 20 turns.";
	_.PotionOfExperience.desc = 	"Temporarily increases your rate of experience gain.";
	_.PotionOfLevitation.desc = 	"Levitate for 200 turns.";
	_.PotionOfGainAttribute.desc = 	"Permenantly increase either strength, intelligence or dexterity";
	_.PotionOfAmnesia.desc = 		"Forget a single talent and recover the talent points.";
	
	// SCROLLS:
	_.ScrollOfTeleportation.desc = 	"Immediately teleports you to a random location in the current level.";
	_.ScrollOfBlink.desc = 			"Immediately teleport to any visible tile.";
	_.ScrollOfFear.desc = 			"Fears all visible enemies, causing them to run away from you.";
	_.ScrollOfEnchantment.desc = 	"Enchant a piece of equipment.";
	_.ScrollOfAcquirement.desc = 	"Randomly summons an item. You can choose from weapons, armor, rings, scrolls, potions and food, but cannot select the exact item.";
	_.ScrollOfHellFire.desc = 		"Engulfs all visible monsters in hell fire.";
	_.ScrollOfFlashFreeze.desc =	'Freezes all visible monsters in a block of ice, rendering them unable to act.';
	_.ScrollOfDomination.desc = 	"Permanently charms a creature, turning it to your side";
	
	// WANDS:
	_.WandOfBlades.desc = 			'Summons a temporary swarm of spectral blades which will attack your enemies.';
	_.WandOfDraining.desc = 		'Drains the health of enemies around you, healing you in the process.';
	_.FluteOfTheScavengers.desc = 	'Summons a temporary swarm of rats which will attack your enemies.';
	_.FluteOfTheSewers.desc = 		'Summons a temporary swarm of sewer rats which will attack your enemies.';
	_.MossyBranch.desc =			'Summons a patch of vines.';
	_.WandOfBlinking.desc =			'Immediately teleport to any visible tile.';
	
	// RINGS:
	_.RingOfFlight.desc = 			"Allows you to fly, avoiding all negative terrain effects.";
	_.RingOfLifeSaving.desc = 		"Grants you a one time resurrection upon death. The ring will be consumed in the process.";
	_.RingOfWealth.desc = 			"You will pick up double gold.";
	_.InfernoRing.desc = 			"Burns anyone hitting you with melee.";
	_.RingOfThunder.desc = 			"Shocks anyone hitting you with melee.";
	_.RingOfSustenance.desc = 		"You will consume food at half the normal rate.";
	_.RingOfTheVampire.desc =		"Allows you to heal yourself by stealing the life of every monster you kill.";
	
	// CHARMS:
	_.RingOfSpiritShielding.desc = 	'All damage taken will be split between your hit points and mana.';
	_.TotemOfTheBeasts.desc =		'Summons a temporary swarm of wolves which will attack your enemies.';
	
	// MAGIC_ARMOR:
	_.BootsOfFlight.desc = 			"Allows you to fly, avoiding all negative terrain effects.";
	_.BootsOfWind.desc = 			"Allows you to fly, avoiding all negative terrain effects.";
	_.HelmOfTelepathy.desc = 		"Allows you to see enemies on your mini-map and also spot hidden enemies.";
	_.MysticSkullHelm.desc = 		"Grants an additional +2HP for each potion in your inventory.";
	_.BeastMastersGloves.desc = 	"Grants immunity to enemy damage shields.";
	_.BootsOfVampirism.desc =		"You will draw life from any blood you step on, healing 5% of your max HP.";
	_.VeilOfTheSwamp.desc =			"Protects you from all mental effects such as confusion, charm and lure.";
	_.CrownOfBrilliance.desc =		"Protects you from all mental effects such as confusion, charm and lure.";
	_.GlovesOfVampirism.desc =		"Allows you to heal yourself by stealing the life of every monster you kill.";
	_.MoltenForgedBoots.desc =		"Allows you to walk in lava without taking damage.";
	
	// MISC:
	_.Key.desc = 					"Allows you to open locked doors";
};

// SET_ITEM_COSTS:
// ************************************************************************************************
gs.setItemCosts = function () {
	var LOW = 40,
		MLOW = 50,
		MED = 70,
		MHIGH = 80,
		HIGH = 100,
		_ = this.itemTypes;
	
	// TIER_I:
	// ********************************************************************************************
	_.ShortSword.cost = 			40;
	_.HandAxe.cost = 				40;
	_.ShortBow.cost = 				40;
	_.StaffOfFire.cost = 			40;
	_.StaffOfStorms.cost = 			40;
	_.StaffOfIce.cost = 			40;
	_.StaffOfPoison.cost = 			40;
	_.StaffOfMagicMissiles.cost = 	40;
	
	// Unique:
	_.BloodStainedAxe.cost =		50;
	_.GoblinBattleStaff.cost =		50;
	_.GoblinSwiftBow.cost =			50;
	
	// TIER_II:
	// ********************************************************************************************
	_.LongSword.cost = 				60;
	_.BroadAxe.cost = 				60;
	_.Spear.cost = 					60;
	_.Mace.cost = 					60;
	_.LongBow.cost = 				60;
	_.HeartwoodBow.cost = 			60;
	_.StaffOfEnergy.cost = 			60;
	_.StaffOfPower.cost = 			60;
	
	// Unique:
	_.RunicStaffOfDeath.cost = 		70;
	_.SerpentFangDagger.cost = 		70;
	_.BloodStinger.cost = 			70;
	
	// TIER_III:
	// ********************************************************************************************
	_.BroadSword.cost =				80;
	_.WarAxe.cost =					80;
	_.Pike.cost =					80;
	_.Hammer.cost =					80;
	_.TwoHandSword.cost = 			80;
	_.Halberd.cost = 				80;
	_.BattleAxe.cost = 				80;
	_.WarHammer.cost = 				80;
	_.CrossBow.cost = 				80;
	_.CompoundBow.cost =			80;
	_.GreaterStaffOfFire.cost = 	80;
	_.GreaterStaffOfStorms.cost = 	80;
	_.GreaterStaffOfIce.cost = 		80;
	_.GreaterStaffOfPoison.cost = 	80;
	
	
	// Unique::
	_.StormChopper.cost = 			120;
	_.InfernoSword.cost = 			120;
	_.ScythOfReaping.cost = 		120;
	_.SpiritBow.cost =				120;
	_.FrostForgedHammer.cost =		120;
	_.BladeOfEnergy.cost =			120;
	_.HammerOfCrushing.cost =		120;
	_.SlimeCoveredHarpoon.cost =	120;
	_.DrachnidWebBow.cost =			120;
	_.GlacierForgedStaff.cost =		120;
	_.MoltenForgedStaff.cost =		120;
	_.LightningForgedStaff.cost =	120;
	_.HandCannon.cost = 			120;
		
	// THROWING_WEAPONS:
	// ********************************************************************************************
	_.Javelin.cost = 2;
	_.ThrowingNet.cost = 5;
	_.Bomb.cost = 5;
	_.Chakram.cost = 2;

	
	// TIER_I_ARMOR:
	// ********************************************************************************************
	// CLOTH:
	_.Robe.cost = 					30;
	_.Hat.cost = 					20;
	_.ClothGloves.cost = 			20;
	_.Shoes.cost = 					20;
	
	// LEATHER:
	_.LeatherArmor.cost = 			30;
	_.LeatherHelm.cost = 			20;
	_.LeatherGloves.cost = 			20;
	_.LeatherBoots.cost = 			20;
	
	// SHIELDS:
	_.WoodenBuckler.cost =			20;
	_.GoblinWarShield.cost =        40;
	
	// UNIQUE:
	_.BearHideCloak.cost =			40;
	
	// TIER_II_ARMOR:
	// ********************************************************************************************
	// CHAIN:
	_.ChainArmor.cost = 			40;
	_.ChainCoif.cost = 				30;
	_.ChainGloves.cost = 			30;
	_.ChainBoots.cost = 			30;
	
	// SHIELDS:
	_.WoodenShield.cost = 			30;
	_.MushroomCapShield.cost =		60;
	_.SpikyShield.cost = 			60;
	
	// ROBES:
	_.RobeOfProtection.cost =		60;
	_.RobeOfFlames.cost = 			60;
	_.RobeOfStorms.cost = 			60;
	_.RobeOfIce.cost = 				60;
	_.RobeOfDeath.cost = 			60;
	
	// BODY:
	_.CloakOfStealth.cost = 		60;
	_.EntWoodArmor.cost = 			MED;
	_.NoxiousCarapaceArmor.cost = 	MED;
	
	// HEAD:
	_.CircletOfKnowledge.cost = 	MED;
	_.ArcheryGoggles.cost = 		MED;
	_.HelmOfTelepathy.cost = 		MED;
	_.MysticSkullHelm.cost = 		MED;
	_.VeilOfTheSwamp.cost =			MED;
	
	// HANDS:
	_.GauntletsOfStrength.cost = 	MED;
	_.GlovesOfDexterity.cost = 		MED;
	_.GlovesOfVampirism.cost = 		MED;
	_.BeastMastersGloves.cost =		MED;
	
	// FEET:
	_.BootsOfStealth.cost = 		MED;
	_.BootsOfSpeed.cost = 			MED;
	_.BootsOfFlight.cost = 			MED;
	_.BootsOfTheSilentSands.cost =	MED;
	_.BootsOfDexterity.cost =		MED;

	// TIER_III_ARMOR:
	// ********************************************************************************************
	// PLATE:
	_.PlateArmor.cost = 			60;
	_.PlateHelm.cost = 				40;
	_.PlateGauntlets.cost = 		40;
	_.PlateBoots.cost = 			40;
	
	_.MetalShield.cost = 			40;
	_.ShieldOfMana.cost = 			80;
	_.ShieldOfPower.cost = 			80;
	_.ShieldOfHealth.cost = 		80;
	_.ShieldOfReflection.cost = 	80;
	_.RedDragonScaleShield.cost = 	80;
	_.GreenDragonScaleShield.cost = 80;
	_.BlueDragonScaleShield.cost = 	80;
	_.WhiteDragonScaleShield.cost = 80;
	_.ChampionsShield.cost 		  = 80;
	
	// HEAVY_BRASS:
	_.HeavyBrassArmor.cost = 		HIGH;
	_.HeavyBrassHelm.cost = 		MHIGH;
	_.HeavyBrassGauntlets.cost = 	MHIGH;
	_.HeavyBrassBoots.cost = 		MHIGH;
	
	// SHADOW_SILK
	_.ShadowSilkArmor.cost = 		HIGH;
	_.ShadowSilkHelm.cost = 		MHIGH;
	_.ShadowSilkGloves.cost = 		MHIGH;
	_.ShadowSilkBoots.cost = 		MHIGH;
	
	// WIZARDRY:
	_.RobeOfWizardry.cost =			HIGH;
	_.HatOfWizardry.cost =			MHIGH;
	_.GlovesOfWizardry.cost =		MHIGH;
	_.ShoesOfWizardry.cost =		MHIGH;
	
	// BODY:
	_.RedDragonScaleArmor.cost = 	HIGH;
	_.GreenDragonScaleArmor.cost = 	HIGH;
	_.BlueDragonScaleArmor.cost =	HIGH;
	_.WhiteDragonScaleArmor.cost =	HIGH;
	_.RobeOfPyromancy.cost =	 	HIGH;
	_.RobeOfCryomancy.cost = 		HIGH;
	_.RobeOfNecromancy.cost =	 	HIGH;
	_.RobeOfStormology.cost = 		HIGH;
	_.CrystalArmor.cost = 			HIGH;
	_.PolarBearCloak.cost = 		HIGH;
	_.LockJawHideVest.cost =		HIGH;
	_.FlamingCarapace.cost =		HIGH;
	_.ClockworkPowerArmor.cost =	HIGH;
	_.RobeOfFlowingMana.cost =		HIGH;
	
	// FEET:
	_.BootsOfVampirism.cost =		MHIGH;
	_.MoltenForgedBoots.cost =		MHIGH;
	_.BootsOfWind.cost = 			MHIGH;
	
	// HEAD:
	_.CrownOfPower.cost = 			MHIGH;
	_.TurbanOfFlames.cost =			MHIGH;
	_.CrownOfSlime.cost =			MHIGH;
	_.CrownOfBrilliance.cost =		MHIGH;
	
	// RINGS:
	// ********************************************************************************************
	// COMMON RINGS:
	_.RingOfHealth.cost = 			LOW;
	_.RingOfMana.cost = 			LOW;
	_.RingOfSlaying.cost =			LOW;
	_.RingOfArchery.cost =			LOW;
	_.RingOfWizardry.cost = 		LOW;
	_.RingOfStealth.cost = 			LOW;
	_.RingOfFire.cost = 			LOW;
	_.RingOfStorm.cost = 			LOW;
	_.RingOfToxic.cost = 			LOW;
	_.RingOfIce.cost = 				LOW;
	_.RingOfProtection.cost = 		LOW;
	_.RingOfReflection.cost = 		LOW;
	_.RingOfPower.cost =			LOW;
	_.RingOfEvasion.cost =			LOW;
			
	
	// UNCOMMON RINGS:
	_.RingOfFlight.cost = 			MED;
	_.RingOfSpeed.cost = 			MED;
	_.RingOfTheVampire.cost = 		MED;
	_.RingOfLearning.cost = 		MED;
	_.RingOfSustenance.cost =		MED;
	_.RingOfStrength.cost = 		MED;
	_.RingOfIntelligence.cost = 	MED;
	_.RingOfDexterity.cost =		MED;
	_.RingOfSpiritShielding.cost =	MED;
	
	
	// RARE_RINGS:
	_.RingOfLifeSaving.cost = 		HIGH;
	_.InfernoRing.cost = 			HIGH;
	_.RingOfThunder.cost = 			HIGH;
	_.RingOfWealth.cost = 			HIGH;
	_.RingOfFortitude.cost = 		HIGH;
	_.RingOfWizardry.cost = 		HIGH;
	_.RingOfFlameShielding.cost = 	HIGH;
	_.RingOfToxicShielding.cost = 	HIGH;
	_.RingOfStormShielding.cost = 	HIGH;
	_.RingOfIceShielding.cost = 	HIGH;
	_.RingOfTheWinds.cost = 		HIGH;
	_.RingOfHarmony.cost =			HIGH;
	_.RingOfResistance.cost =		HIGH;
	_.RingOfBlood.cost =			HIGH;
	_.RingOfFlameEnergy.cost = 		HIGH;
	_.RingOfToxicEnergy.cost = 		HIGH;
	_.RingOfStormEnergy.cost = 		HIGH;
	_.RingOfIceEnergy.cost = 		HIGH;					  
								  
	
	// CHARMS:
	_.CharmOfHealth.cost = MED;
	_.CharmOfEnergy.cost = MED;
	_.CharmOfSpeed.cost = MED;
	_.CharmOfExtension.cost = HIGH;
	_.CharmOfSwiftness.cost = HIGH;
	_.CharmOfDraining.cost = HIGH;
	_.CharmOfConservation.cost = HIGH;
	_.TotemOfStrength.cost = LOW;
	_.TotemOfDexterity.cost = LOW;
	_.TotemOfIntelligence.cost = LOW;
	

	
	// WANDS:
	_.WandOfFire.cost = 50;
	_.WandOfLightning.cost = 50;
	_.WandOfCold.cost = 50;
	_.WandOfDraining.cost = 50;
	_.WandOfConfusion.cost = 50;
	_.WandOfBlades.cost = 50;
	_.FluteOfTheScavengers.cost = 50;
	_.FluteOfTheSewers.cost = 50;
	_.FanOfWinds.cost = 50;
	_.MossyBranch.cost = 50;
	_.WandOfBlinking.cost = 80;
	
	_.TotemOfTheBeasts.cost = HIGH;
	_.AmuletOfLife.cost = HIGH;
	
	// POTIONS:
	_.HealingShroom.cost = 1;
	_.EnergyShroom.cost = 1;
	_.Meat.cost = 20;
	_.PotionOfHealing.cost = 20;
	_.PotionOfEnergy.cost = 20;
	_.PotionOfLevitation.cost = 20;
	_.PotionOfAmnesia.cost = 20;
	_.PotionOfExperience.cost = 30;
	_.PotionOfResistance.cost = 30;
	_.PotionOfPower.cost = 30;
	_.PotionOfGainAttribute.cost = 60;
	
	
	
	// SCROLLS:
	_.ScrollOfTeleportation.cost = 20;
	_.ScrollOfBlink.cost = 20;
	_.ScrollOfFear.cost = 20;
	_.ScrollOfHellFire.cost = 30;
	_.ScrollOfFlashFreeze.cost = 30;
	_.ScrollOfDomination.cost = 30;
	_.ScrollOfEnchantment.cost = 50;
	_.ScrollOfAcquirement.cost = 60;
	
	// TALENT_BOOKS:
	gs.forEachType(this.itemTypes, function (itemType) {
		if (itemType.isTome) {
			itemType.cost = 75;
		}
	}, this);
	
	// MISC:
	_.Fists.cost =			1;
	_.MobFucker.cost =		1;
	_.TestArmor.cost =		1;
	_.Key.cost = 			20;
	_.GoldCoin.cost = 		1;
	_.GobletOfYendor.cost = 1000;
	_.RuneOfFire.cost =		100;
	_.RuneOfIce.cost =		100;
	_.RuneOfDeath.cost =	100;
	_.RuneOfMagic.cost =	100;
	_.RuneOfSlime.cost =	100;
	_.RuneOfIron.cost =		100;
	_.RuneOfMight.cost =	100;
	_.RuneOfChaos.cost = 	100;
};

// SET_ITEM_TYPE_DEFAULT_PROPERTIES:
// ************************************************************************************************
gs.setItemTypeDefaultProperties = function () {
	this.itemTypeList = [];
	
	this.forEachType(this.itemTypes, function (itemType) {
		this.itemTypeList.push(itemType);
		
		// Setting frame:
		if (itemType.hasOwnProperty('f')) {	
			itemType.frame = itemType.f;
		}
		else {
			throw 'itemType has no frame: ' + itemType.name;
		}
		
		// Default Consumable Sound:
		if (itemType.slot === ITEM_SLOT.CONSUMABLE && !itemType.hasOwnProperty('sound')) {
			itemType.sound = gs.sounds.potion;
		}
		
		// Weapon Effect:
		if (itemType.hasOwnProperty('attackEffect')) {
			if (!this.weaponEffects[itemType.attackEffect]) throw 'Invalid weaponEffect: ' + itemType.attackEffect;
			itemType.attackEffect = this.weaponEffects[itemType.attackEffect];
		}
		
		// Proc Effect:
		if (itemType.hasOwnProperty('procEffect')) {
			if (!this.weaponProcEffects[itemType.procEffect]) throw 'Invalid weaponProcEffect: ' + itemType.procEffect;
			itemType.procEffect = this.weaponProcEffects[itemType.procEffect];
		}
	
		// Use Effect (Consumables):
		if (itemType.hasOwnProperty('useEffect')) {
			// Ability:
			if (this.abilityTypes[itemType.useEffect]) {
				itemType.useEffect = this.createItemAbilityType(itemType);
			}
			// Item Effect:
			else if (this.itemEffects[itemType.useEffect]) {
				itemType.useEffect = this.itemEffects[itemType.useEffect];
			}
			// Invalid:
			else {
				throw 'Invalid itemEffect: ' + itemType.useEffect;
			}
		}

		// Stackable:
		let slotTypeList = [
			ITEM_SLOT.PRIMARY, 
			ITEM_SLOT.RANGE, 
			ITEM_SLOT.SECONDARY, 
			ITEM_SLOT.BODY,
			ITEM_SLOT.HEAD,
			ITEM_SLOT.HANDS,
			ITEM_SLOT.FEET,
			ITEM_SLOT.RING,
		];
		
		if (itemType.stackable === undefined) {
			if (util.inArray(itemType.slot, slotTypeList)) {
				itemType.stackable = false;
			} 
			else {
				itemType.stackable = true;
			}
		}

		// Drop Amount:
		if (itemType.dropAmount === undefined) {
			itemType.dropAmount = 1;
		}
		
		// Stats:
		if (!itemType.hasOwnProperty('stats')) {
			itemType.stats = {};
		}
		
		// Min Range:
		if (!itemType.hasOwnProperty('minRange')) {
			itemType.minRange = 0;
		}
		
		// Cost:
		if (!itemType.hasOwnProperty('cost')) {
			console.log('missing item cost: ' + itemType.name);
			itemType.cost = 1;
		}
		
		// lootTier:
		if (!itemType.hasOwnProperty('tier')) {
			itemType.tier = 1;
		}
		
		// maxTier:
		if (!itemType.hasOwnProperty('maxTier')) {
			itemType.maxTier = 10;
		}
		
		// Encumberance:
		if (itemType.stats.hasOwnProperty('enc')) {
			itemType.stats.encumberance = itemType.stats.enc;
			delete itemType.stats.enc;
		}
		
		// Shoot Effect:
		if (itemType.projectileName) {
			itemType.shootEffect = {
				FireArrow: 			'FireShoot',
				Spark:				'ElectricShoot',
				SparkBall:			'ElectricShoot',
				IceArrow:			'ColdShoot',
				StrongPoisonArrow:	'ToxicShoot',
				MagicMissle:		'MagicShoot',
				LifeTap:			'ToxicShoot',
			}[itemType.projectileName];
		}
	}, this);
};

