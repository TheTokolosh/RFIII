/*global gs, game, util, console*/
/*global Item, DungeonGenerator*/
/*global COMMON_ITEM_PERCENT, UNCOMMON_ITEM_PERCENT, RARE_ITEM_PERCENT*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// CREATE_RANDOM_ITEM:
// ************************************************************************************************
gs.createRandomItem = function (dropTableName, flagUniques, maxTier) {
	if (!dropTableName) {
		dropTableName = gs.zoneType().dropTableName;
	}
	
	let itemTypeName = ItemGenerator.getRandomItemName(dropTableName, maxTier);
	let item = ItemGenerator.createDropItem(itemTypeName);

	
	// Flag item as previously spawned:
	if (flagUniques && Item.isUniqueItem(item.type.name)) {
		gs.tempPreviouslySpawnedItemList.push(item.type.name);
	}
	
	return item;
};

var ItemGenerator = {};



// CREATE_DROP_ITEM
// Will set stats appropriate to the DL:
// ************************************************************************************************
ItemGenerator.createDropItem = function (itemTypeName) {
	var itemType, amount, mod, randArtStats = {};
	
	itemType = gs.itemTypes[itemTypeName];
	amount = itemType.dropAmount;
	mod = 0;

	// Mod:
	if (Item.canEnchantItemType(itemType) && util.frac() < this.enchantedItemChance()) {
		mod = this.dropItemModifier(itemType);
	}
	
	// Upgrade: (Always drop one higher mod than player currently has)
	if (gs.pc && Item.canEnchantItemType(itemType) && gs.pc.inventory.itemOfType(itemType) && !itemType.stackable) {
		mod = gs.pc.inventory.highestMod(itemType) + 1;
	}
	
	// Rand-Art: (never drops modded)
	if (itemType.canRandArt && util.frac() < this.randArtChance()) {
		randArtStats = gs.makeRandArtStats(itemType);
		mod = 0;
	}
	
	// Cap the mod:
	mod = Math.min(mod, Item.itemTypeMaxEnchantment(itemType));
	
	return new Item.createItem(itemTypeName, {mod: mod, amount: amount, stats: randArtStats});
};

// GET_RANDOM_ITEM_NAME:
// ************************************************************************************************
ItemGenerator.getRandomItemName = function (dropTableName = 'Main', maxTier = 0) {
	if (dropTableName === 'Main' && (gs.zoneName === DungeonGenerator.zones.Branch2 || gs.zoneName === 'TheVaultOfYendor')) {
		dropTableName = 'MainTier3';
	}
	
	if (!maxTier) {
		maxTier = gs.lootTier();
	}
	
	
	let dropTable = this.itemDropTables[dropTableName],
		chooseAgain,
		count = 0;
	
	if (!dropTable) {
		throw 'ERROR [gs.getRandomItemName] invalid dropTableName: ' + dropTableName;
	}
	
	chooseAgain = function (itemTypeName) {
		// Don't double drop unique items:
		if (Item.isUniqueItem(itemTypeName) && util.inArray(itemTypeName, gs.previouslySpawnedItemList.concat(gs.tempPreviouslySpawnedItemList)) && count < 100) {
			return true;
		}
		
		// Filter max Tier:
		if (maxTier < gs.itemTypes[itemTypeName].tier) {
			return true;
		}
		
		// Filter min Tier:
		if (gs.lootTier() > gs.itemTypes[itemTypeName].maxTier) {
			return true;
		}
			
		return false;	
	};
	
	let itemTypeName = null;
	
	// Keep choosing items until we get one that has not yet dropped:
	do {
		itemTypeName = util.chooseRandom(dropTable);
		count += 1;
	} while (chooseAgain(itemTypeName));
	
	return itemTypeName;
};

// GET_RANDOM_ITEM_SUBSET:
// ************************************************************************************************
ItemGenerator.getRandomItemSubset = function (numItems, dropTableName = 'Main') {
	if (dropTableName === 'Main' && (gs.zoneName === DungeonGenerator.zones.Branch2 || gs.zoneName === 'TheVaultOfYendor')) {
		dropTableName = 'MainTier3';
	}
	
	let dropTable = this.itemDropTables[dropTableName];
	
	if (!dropTable) {
		throw 'ERROR [gs.getRandomItemName] invalid dropTableName: ' + dropTableName;
	}
	
	return util.randSubset(dropTable, numItems).map(e => e.name);
};

// INIT:
// ************************************************************************************************
ItemGenerator.init = function () {
	this.itemDropTables = {};
	let _ = this.itemDropTables;
	
	_.Head = [
		// BASIC:
		{percent: 70,	name: [
			{percent: 1,	name: 'Hat'},
			{percent: 1,	name: 'LeatherHelm'},
			{percent: 1,	name: 'ChainCoif'},
			{percent: 1,	name: 'PlateHelm'},
		]},
		
		// SPECIAL:
		{percent: 30,	name: [
			{percent: 1,	name: 'CircletOfKnowledge'},
			{percent: 1,	name: 'ArcheryGoggles'},
			{percent: 1,	name: 'HelmOfTelepathy'},
		]},
	];
	
	_.Body = [
		// BASIC:
		{percent: 70,	name: [
			{percent: 1,	name: 'Robe'},
			{percent: 1,	name: 'LeatherArmor'},
			{percent: 1,	name: 'ChainArmor'},
			{percent: 1,	name: 'PlateArmor'},
		]},
		
		// SPECIAL:
		{percent: 30,	name: [
			{percent: 1,	name: 'RobeOfProtection'},
			{percent: 1,	name: 'CloakOfStealth'},
			{percent: 1,	name: 'CrystalArmor'},
			
			{percent: 1,	name: 'RobeOfFlames'},
			{percent: 1,	name: 'RobeOfStorms'},
			{percent: 1,	name: 'RobeOfIce'},
			{percent: 1,	name: 'RobeOfDeath'},

			{percent: 1,	name: 'RobeOfPyromancy'},
			{percent: 1,	name: 'RobeOfCryomancy'},
			{percent: 1,	name: 'RobeOfNecromancy'},
			{percent: 1,	name: 'RobeOfStormology'},

			{percent: 1,	name: 'RedDragonScaleArmor'},
			{percent: 1,	name: 'GreenDragonScaleArmor'},
			{percent: 1,	name: 'BlueDragonScaleArmor'},
			{percent: 1,	name: 'WhiteDragonScaleArmor'},
		]},
	];
	
	_.Hands = [
		// BASIC:
		{percent: 70,	name: [
			{percent: 1,	name: 'ClothGloves'},
			{percent: 1,	name: 'LeatherGloves'},
			{percent: 1,	name: 'ChainGloves'},
			{percent: 1,	name: 'PlateGauntlets'},
		]},
		
		// SPECIAL:
		{percent: 30,	name: [
			{percent: 1,	name: 'GauntletsOfStrength'},
			{percent: 1,	name: 'GlovesOfDexterity'},
			{percent: 1,	name: 'GlovesOfVampirism'},
		]},
	];
	
	_.Feet = [
		// BASIC:
		{percent: 70,	name: [
			{percent: 1,	name: 'Shoes'},
			{percent: 1,	name: 'LeatherBoots'},
			{percent: 1,	name: 'ChainBoots'},
			{percent: 1,	name: 'PlateBoots'},
		]},
		
		// SPECIAL:
		{percent: 30,	name: [
			{percent: 1,	name: 'BootsOfStealth'},
			{percent: 1,	name: 'BootsOfSpeed'},
			{percent: 1,	name: 'BootsOfFlight'},
			{percent: 1,	name: 'BootsOfVampirism'},
			{percent: 1,	name: 'BootsOfDexterity'},
		]},
	];
	
	_.Shields = [
		// COMMON:
		{percent: 70,	name: [
			{percent: 1,	name: 'WoodenBuckler'},
			{percent: 1,	name: 'WoodenShield'},
			{percent: 1,	name: 'MetalShield'},
			{percent: 1,	name: 'ShieldOfMana'},
			{percent: 1,	name: 'ShieldOfPower'},
			{percent: 1,	name: 'ShieldOfHealth'},
			{percent: 1,	name: 'SpikyShield'},
		]},
		
		// UNCOMMON:
		{percent: 30,	name: [
			{percent: 1,	name: 'ShieldOfReflection'},
			{percent: 1,	name: 'RedDragonScaleShield'},
			{percent: 1,	name: 'GreenDragonScaleShield'},
			{percent: 1,	name: 'BlueDragonScaleShield'},
			{percent: 1,	name: 'WhiteDragonScaleShield'},
		]},
	];
	
	_.Armor = [
		{percent: 25, name: _.Body},
		{percent: 25, name: _.Head},
		{percent: 25, name: _.Hands},
		{percent: 25, name: _.Feet},
	];
	
	_.Rings = [
		// Attributes:
		{percent: 1,	name: 'RingOfStrength'},
		{percent: 1,	name: 'RingOfIntelligence'},
		{percent: 1,	name: 'RingOfDexterity'},
		
		// Elemental:
		{percent: 1,	name: 'RingOfFire'},
		{percent: 1,	name: 'RingOfStorm'},
		{percent: 1,	name: 'RingOfToxic'},
		{percent: 1,	name: 'RingOfIce'},
		{percent: 1,	name: 'RingOfFlameShielding'},
		{percent: 1,	name: 'RingOfToxicShielding'},
		{percent: 1,	name: 'RingOfStormShielding'},
		{percent: 1,	name: 'RingOfIceShielding'},
		{percent: 1,	name: 'InfernoRing'},
		{percent: 1,	name: 'RingOfThunder'},
		{percent: 1,	name: 'RingOfFlameEnergy'},
		{percent: 1,	name: 'RingOfToxicEnergy'},
		{percent: 1,	name: 'RingOfStormEnergy'},
		{percent: 1,	name: 'RingOfIceEnergy'},
		
		// Health + Protection:
		{percent: 1,	name: 'RingOfHealth'},
		{percent: 1,	name: 'RingOfProtection'},
		{percent: 1,	name: 'RingOfFortitude'},
		
		// Mana + Magic Power:
		{percent: 1,	name: 'RingOfMana'},
		{percent: 1,	name: 'RingOfPower'},
		{percent: 1,	name: 'RingOfWizardry'},
		
		// Reflection + Levitation:
		{percent: 1,	name: 'RingOfReflection'},
		{percent: 1,	name: 'RingOfFlight'},
		{percent: 1,	name: 'RingOfTheWinds'},
		
		// Special:
		{percent: 1,	name: 'RingOfLearning'},
		{percent: 1,	name: 'RingOfWealth'},
		{percent: 1,	name: 'RingOfLifeSaving'},
		{percent: 1,	name: 'RingOfSustenance'},
		
		// Stats:
		{percent: 1,	name: 'RingOfStealth'},
		{percent: 1,	name: 'RingOfSlaying'},
		{percent: 1,	name: 'RingOfArchery'},
		{percent: 1,	name: 'RingOfTheVampire'},
		{percent: 1,	name: 'RingOfSpeed'},
		{percent: 1,	name: 'RingOfEvasion'},
		
		{percent: 1,	name: 'RingOfHarmony'},
		{percent: 1,	name: 'RingOfResistance'},
	];
	
	_.Charms = [
		{percent: 1,	name: 'CharmOfHealth'},
		{percent: 1,	name: 'CharmOfEnergy'},
		{percent: 1,	name: 'CharmOfSpeed'},
		{percent: 1,	name: 'CharmOfExtension'},
		{percent: 1,	name: 'CharmOfSwiftness'},
		{percent: 1,	name: 'CharmOfDraining'},
		{percent: 1,	name: 'CharmOfConservation'},
	];

	_.MeleeWeapons = [
		// COMMON:
		{percent: 70,	name: [
			// Tier II:
			{percent: 1,	name: 'LongSword'},
			{percent: 1,	name: 'Spear'},
			{percent: 1,	name: 'BroadAxe'},
			{percent: 1,	name: 'Mace'},
			
			// Tier III:
			{percent: 1,	name: 'BroadSword'},
			{percent: 1,	name: 'Pike'},
			{percent: 1,	name: 'WarAxe'},
			{percent: 1,	name: 'Hammer'},
		]},
		
		// UNCOMMON:
		{percent: 20,	name: [
			{percent: 1,	name: 'TwoHandSword'},
			{percent: 1,	name: 'Halberd'},
			{percent: 1,	name: 'BattleAxe'},
			{percent: 1,	name: 'WarHammer'},
		]},
		
		// RARE:
		{percent: 10,	name: [
			{percent: 1,	name: 'InfernoSword'},
			{percent: 1,	name: 'StormChopper'},
			{percent: 1,	name: 'BladeOfEnergy'},
		]},
	];
	
	_.RangeWeapons = [
		{percent: 1,	name: 'CrossBow'},
		{percent: 1,	name: 'LongBow'},
		{percent: 1,	name: 'CompoundBow'},
	];
	
	// Need this for aquirement:
	_.BasicStaves = [
		{percent: 1,	name: 'StaffOfFire'},
		{percent: 1,	name: 'StaffOfStorms'},
		{percent: 1,	name: 'StaffOfPoison'},
		{percent: 1,	name: 'StaffOfIce'},
	];
	
	_.Staves = [
		{percent: 1,	name: 'GreaterStaffOfFire'},
		{percent: 1,	name: 'GreaterStaffOfStorms'},
		{percent: 1,	name: 'GreaterStaffOfPoison'},
		{percent: 1,	name: 'GreaterStaffOfIce'},
		{percent: 1,	name: 'StaffOfPower'},
		{percent: 1,	name: 'StaffOfEnergy'},
	];
	
	_.Wands = [
		{percent: 1,	name: 'WandOfFire'},
		{percent: 1,	name: 'WandOfLightning'},
		{percent: 1,	name: 'WandOfCold'},
		{percent: 1,	name: 'WandOfDraining'},
		{percent: 1,	name: 'WandOfConfusion'},
		{percent: 1,	name: 'WandOfBlades'},
		{percent: 1,	name: 'WandOfBlinking'},
		{percent: 1,	name: 'FanOfWinds'},
	];
	
	_.Tomes = [
		// Intelligence:
		{percent: 40,	name: [
			{percent: 1,	name: 'TomeOfPyromancy'},
			{percent: 1,	name: 'TomeOfStormology'},
			{percent: 1,	name: 'TomeOfCryomancy'},
			{percent: 1,	name: 'TomeOfNecromancy'},
			{percent: 1,	name: 'TomeOfEnchantments'},
		]},
		
		// Dexterity:
		{percent: 30, name: [
			{percent: 1,	name: 'TomeOfDueling'},
			{percent: 1,	name: 'TomeOfStealth'},
			{percent: 1,	name: 'TomeOfArchery'},
		]},
		
		// Strength:
		{percent: 30, name: [
			{percent: 1,	name: 'TomeOfRage'},
			{percent: 1,	name: 'TomeOfWar'},
		]},
	];
	
	_.Equipment = [
		// Armor:
		{name: _.Armor,				percent: 40},
		{name: _.Shields,			percent: 10},
		{name: _.Rings,				percent: 15},
		{name: _.Charms,			percent: 5},
		
		// Weapons:
		{name: _.MeleeWeapons,		percent: 10},
		{name: _.RangeWeapons,		percent: 5},
		{name: _.Staves,			percent: 5},
		
		// Charged Items:
		{name: _.Wands,				percent: 10},
	];
	
	_.Potions = [
		// Recovery Potions:
		{percent: 60,	name: [
			{percent: 60,	name: 'PotionOfHealing'},
			{percent: 35,	name: 'PotionOfEnergy'},
		]},
		
		// Buff Potions:
		{percent: 40,	name: [
			{percent: 40,	name: 'PotionOfResistance'},
			{percent: 40,	name: 'PotionOfPower'},
			{percent: 20,	name: 'PotionOfExperience'},
		]},
	];
	
	_.Scrolls = [
		// Common Scrolls:
		{percent: 75,	name: [
			{percent: 1,		name: 'ScrollOfTeleportation'},
			{percent: 1,		name: 'ScrollOfBlink'},
			{percent: 1,		name: 'ScrollOfFear'},
			
		]},
		
		// Uncommon Scrolls:
		{percent: 25,	name: [
			{percent: 1, 		name: 'ScrollOfHellFire'},
			{percent: 1,		name: 'ScrollOfDomination'},
			{percent: 1, 		name: 'ScrollOfFlashFreeze'},
		]},
	];
	
	_.GoodConsumables = [
		{percent: 50,	name: 'ScrollOfEnchantment'},
		{percent: 30,	name: 'PotionOfGainAttribute'},
		{percent: 20,	name: 'ScrollOfAcquirement'},
	];
	
	_.ThrowingWeapons = [
		{percent: 30,			name: 'Javelin'},
		{percent: 10,			name: 'ThrowingNet'},
		{percent: 10,			name: 'Bomb'},
		{percent: 10,			name: 'Chakram'},
	];
	
	_.Consumables = [
		{name: _.Potions,			percent: 50},
		{name: _.Scrolls,			percent: 25},
		{name: _.ThrowingWeapons,	percent: 20},
		
		{name: 'Meat',				percent: 5},
	];
	
	_.Main = [
		{percent: 40, 	name: _.Equipment},
		{percent: 55, 	name: _.Consumables},
		{percent: 5,	name: _.GoodConsumables},
	];
	
	_.RewardTable = [
		{percent: 90, 	name: _.Equipment},
		{percent: 10,	name: _.GoodConsumables},
	];
	
	_.EquipmentTier3 = [
		// Armor:
		{percent: 40, name: [
			// Head:
			{percent: 25, name: [
				{percent: 1,	name: 'PlateHelm'},
				{percent: 1,	name: 'CircletOfKnowledge'},
				{percent: 1,	name: 'ArcheryGoggles'},
				{percent: 1,	name: 'HelmOfTelepathy'},
			]},
			
			// Body:
			{percent: 25, name: [
				{percent: 1,	name: 'PlateArmor'},
				
				{percent: 1,	name: 'RobeOfProtection'},
				{percent: 1,	name: 'CloakOfStealth'},
				{percent: 1,	name: 'CrystalArmor'},
				
				{percent: 1,	name: 'RobeOfPyromancy'},
				{percent: 1,	name: 'RobeOfCryomancy'},
				{percent: 1,	name: 'RobeOfNecromancy'},
				{percent: 1,	name: 'RobeOfStormology'},
				
				{percent: 1,	name: 'RedDragonScaleArmor'},
				{percent: 1,	name: 'GreenDragonScaleArmor'},
				{percent: 1,	name: 'BlueDragonScaleArmor'},
				{percent: 1,	name: 'WhiteDragonScaleArmor'},
			]},
			
			// Hands:
			{percent: 25, name: [
				{percent: 1,	name: 'PlateGauntlets'},
				{percent: 1,	name: 'GauntletsOfStrength'},
				{percent: 1,	name: 'GlovesOfDexterity'},
				{percent: 1,	name: 'GlovesOfVampirism'},
			]},
			
			// Feet:
			{percent: 25, name: [
				{percent: 1,	name: 'PlateBoots'},
				{percent: 1,	name: 'BootsOfStealth'},
				{percent: 1,	name: 'BootsOfSpeed'},
				{percent: 1,	name: 'BootsOfWind'},
				{percent: 1,	name: 'BootsOfVampirism'},
				{percent: 1,	name: 'BootsOfDexterity'},
			]},
		]},
		
		// Shields:
		{percent: 10, name: [
			{percent: 1,	name: 'ShieldOfMana'},
			{percent: 1,	name: 'ShieldOfPower'},
			{percent: 1,	name: 'ShieldOfHealth'},
			{percent: 1,	name: 'SpikyShield'},
			{percent: 1,	name: 'ShieldOfReflection'},
			
			{percent: 1,	name: 'RedDragonScaleShield'},
			{percent: 1,	name: 'GreenDragonScaleShield'},
			{percent: 1,	name: 'BlueDragonScaleShield'},
			{percent: 1,	name: 'WhiteDragonScaleShield'},
		]},
		
		// Rings:
		{percent: 15, name: [
			// Attributes:
			{percent: 1,	name: 'RingOfStrength'},
			{percent: 1,	name: 'RingOfIntelligence'},
			{percent: 1,	name: 'RingOfDexterity'},
			
			// Elemental:
			{percent: 1,	name: 'RingOfFlameShielding'},
			{percent: 1,	name: 'RingOfToxicShielding'},
			{percent: 1,	name: 'RingOfStormShielding'},
			{percent: 1,	name: 'RingOfIceShielding'},
			{percent: 1,	name: 'InfernoRing'},
			{percent: 1,	name: 'RingOfThunder'},
			{percent: 1,	name: 'RingOfFlameEnergy'},
			{percent: 1,	name: 'RingOfToxicEnergy'},
			{percent: 1,	name: 'RingOfStormEnergy'},
			{percent: 1,	name: 'RingOfIceEnergy'},
			
			// Health + Protection:
			{percent: 1,	name: 'RingOfFortitude'},
			
			// Mana + Magic Power:
			{percent: 1,	name: 'RingOfWizardry'},
			
			// Reflection + Levitation:
			{percent: 1,	name: 'RingOfTheWinds'},
			
			// Special:
			{percent: 1,	name: 'RingOfLearning'},
			{percent: 1,	name: 'RingOfWealth'},
			{percent: 1,	name: 'RingOfLifeSaving'},
			{percent: 1,	name: 'RingOfSustenance'},

			// Stats:
			{percent: 1,	name: 'RingOfStealth'},
			{percent: 1,	name: 'RingOfSlaying'},
			{percent: 1,	name: 'RingOfArchery'},
			{percent: 1,	name: 'RingOfTheVampire'},
			{percent: 1,	name: 'RingOfSpeed'},
			{percent: 1,	name: 'RingOfEvasion'},
			
			{percent: 1,	name: 'RingOfHarmony'},
			{percent: 1,	name: 'RingOfResistance'},
		]},
		
		// Charms:
		{percent: 5, name: [
			{percent: 1,	name: 'CharmOfExtension'},
			{percent: 1,	name: 'CharmOfSwiftness'},
			{percent: 1,	name: 'CharmOfDraining'},
			{percent: 1,	name: 'CharmOfConservation'},
		]},
		
		// Melee Weapons:
		{percent: 10, name: [
			// One Handed:
			{percent: 1,	name: 'BroadSword'},
			{percent: 1,	name: 'Pike'},
			{percent: 1,	name: 'WarAxe'},
			{percent: 1,	name: 'Hammer'},
			
			// Two Handed:
			{percent: 1,	name: 'TwoHandSword'},
			{percent: 1,	name: 'Halberd'},
			{percent: 1,	name: 'BattleAxe'},
			{percent: 1,	name: 'WarHammer'},
			
			// Magic:
			{percent: 1,	name: 'InfernoSword'},
			{percent: 1,	name: 'StormChopper'},
			{percent: 1,	name: 'BladeOfEnergy'},
		]},
		
		// Range Weapons:
		{percent: 5, name: [
			{percent: 1,	name: 'CompoundBow'},
			{percent: 1,	name: 'CrossBow'},
		]},
		
		// Staves:
		{percent: 5, name: _.Staves},
		
		// Charged Items:
		{percent: 10, name: _.Wands},
	];
	
	_.MainTier3 = [
		{percent: 40, 	name: _.EquipmentTier3},
		{percent: 55, 	name: _.Consumables},
		{percent: 5,	name: _.GoodConsumables},
	];
	

	
	_.HeavyBrassArmor = [
		{percent: 1,	name: 'HeavyBrassArmor'},
		{percent: 1,	name: 'HeavyBrassHelm'},
		{percent: 1,	name: 'HeavyBrassGauntlets'},
		{percent: 1,	name: 'HeavyBrassBoots'},
	];
	
	
	_.ShadowSilkArmor = [
		{percent: 1,	name: 'ShadowSilkArmor'},
		{percent: 1,	name: 'ShadowSilkHelm'},
		{percent: 1,	name: 'ShadowSilkGloves'},
		{percent: 1,	name: 'ShadowSilkBoots'},
	];
	
	_.WizardryArmor = [
		{percent: 1,	name: 'RobeOfWizardry'},
		{percent: 1,	name: 'HatOfWizardry'},
		{percent: 1,	name: 'GlovesOfWizardry'},
		{percent: 1,	name: 'ShoesOfWizardry'},
	];
	
	gs.nameTypes(this.itemDropTables);
	
	// DEFAULTS_AND_VERIFICATION:
	this.itemTypeNames = {};
	gs.forEachType(this.itemDropTables, function (table) {
		this.verifyTable(table);
	}, this);
	
	// Verify that all items are dropping:
	// Uncomment this to check (don't delete)
	/*
	gs.forEachType(gs.itemTypes, function (itemType) {
		if (!this.itemTypeNames.hasOwnProperty([itemType.name])) {
			console.log('Item not in a drop table: ' + itemType.name);
		}
	}, this);
	*/
};

// VERIFY_TABLE:
// ************************************************************************************************
ItemGenerator.verifyTable = function (table) {
	table.forEach(function (e) {
			// Element an item:
			if (!util.isChanceTable(e.name)) {
				let typeName = e.name;
				
				// Make sure the itemTypeName is valid i.e. exists in gs.itemTypes:
				if (!gs.itemTypes[typeName]) {
					throw 'ERROR: [ItemGenerator.init] invalid itemTypeName: ' + typeName + ' in table: ' + table.name;
				}
				
				// Mark the item as 'seen' so we can check if all items are in a drop table:
				this.itemTypeNames[typeName] = true;
			}
			// Element is another table:
			else {
				this.verifyTable(e.name);
			}
		}, this);
};


// DROP_ITEM_MODIFIER:
// What should the mod be on an item
// This will be based on the dangerLevel()
// Will randomly roll
// ************************************************************************************************
ItemGenerator.dropItemModifier = function (itemType) {
	return Math.max(1, gs.lootTier() - itemType.tier);
};

// ENCHANTED_ITEM_CHANCE:
// ************************************************************************************************
ItemGenerator.enchantedItemChance = function () {
	if (gs.dangerLevel() <= 8) {
		return 0.10;
	}
	else if (gs.dangerLevel() <= 12) {
		return 0.15;
	}
	else {
		return 0.20;
	}
};

// RAND_ART_CHANCE:
// ************************************************************************************************
ItemGenerator.randArtChance = function () {
	if (gs.dangerLevel() < 9) {
		return 0;
	}
	else {
		return Math.min(0.5, (gs.dangerLevel() - 8) * 0.05); // Will run from 5% at DL:9 to 50% at DL:18
	}
};


