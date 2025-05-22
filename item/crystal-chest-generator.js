/*global gs, util*/
/*global ItemGenerator*/
'use strict';
let CrystalChestGenerator = {};

// INIT:
// ************************************************************************************************
CrystalChestGenerator.init = function () {
	// Properties:
	this.nextGroupId = 0;
	this.itemTableList = [];
	
	// Standard Lists:
	this._createItemTable('Wands', 				['WandOfFire', 'WandOfLightning', 'WandOfCold', 'WandOfDraining', 'WandOfConfusion', 'WandOfBlades', 'WandOfBlinking']);
	
	
	// Rings:
	this._createItemTable('ElementalRings01', 	['RingOfFire', 'RingOfStorm', 'RingOfIce', 'RingOfToxic']);
	this._createItemTable('ElementalRings02', 	['RingOfFlameShielding', 'RingOfToxicShielding', 'RingOfStormShielding', 'RingOfIceShielding']);
	this._createItemTable('ElementalRings03', 	['RingOfFlameEnergy', 'RingOfToxicEnergy', 'RingOfStormEnergy', 'RingOfIceEnergy']);
	this._createItemTable('StatRings', 			['RingOfSlaying', 'RingOfArchery', 'RingOfPower', 'RingOfHealth', 'RingOfMana', 'RingOfEvasion']);
	this._createItemTable('AttributeRings',		['RingOfStrength', 'RingOfIntelligence', 'RingOfDexterity']);
	
	// Tier I Weapons:
	this._createItemTable('Tier1Weapons',		['ShortSword', 'HandAxe', 'ShortBow']);
	this._createItemTable('Tier1Staves',		['StaffOfFire', 'StaffOfStorms', 'StaffOfIce', 'StaffOfPoison', 'StaffOfMagicMissiles']);
	
	// Tier II Weapons:
	this._createItemTable('Tier2Weapons',		['LongSword', 'BroadAxe', 'Spear', 'Mace', 'LongBow']);
	
	// Tier III Weapons:
	this._createItemTable('Tier3Weapons',		['BroadSword', 'WarAxe', 'Pike', 'Hammer', 'TwoHandSword', 'BattleAxe', 'Halberd', 'WarHammer', 'CompoundBow', 'CrossBow']);
	this._createItemTable('Tier3Staves',		['GreaterStaffOfFire', 'GreaterStaffOfStorms', 'GreaterStaffOfIce', 'GreaterStaffOfPoison', 'StaffOfEnergy', 'StaffOfPower', ]);
			
	// Chest:
	this._createItemTable('BodyArmor',			['Robe', 'LeatherArmor', 'ChainArmor', 'PlateArmor']);
	this._createItemTable('DragonScaleArmor',	['RedDragonScaleArmor', 'BlueDragonScaleArmor', 'WhiteDragonScaleArmor', 'GreenDragonScaleArmor']);
	this._createItemTable('BasicRobes',			['RobeOfProtection', 'RobeOfFlames', 'RobeOfStorms', 'RobeOfIce', 'RobeOfDeath']);
	this._createItemTable('AdvancedRobes',		['RobeOfPyromancy', 'RobeOfCryomancy', 'RobeOfNecromancy', 'RobeOfStormology']);
	
	// Shields:
	this._createItemTable('DragonScaleShields',	['RedDragonScaleShield', 'BlueDragonScaleShield', 'WhiteDragonScaleShield', 'GreenDragonScaleShield']);
	this._createItemTable('StatShields',		['ShieldOfPower', 'ShieldOfHealth', 'ShieldOfMana', 'ShieldOfReflection']);
	
	// Armor Sets:
	this._createItemTable('ClothSet',			['Robe', 'ClothGloves', 'Shoes', 'Hat']);
	this._createItemTable('LeatherSet',			['LeatherArmor', 'LeatherGloves', 'LeatherBoots', 'LeatherHelm']);
	this._createItemTable('ChainSet',			['ChainArmor', 'ChainCoif', 'ChainGloves', 'ChainBoots']);
	this._createItemTable('PlateSet',			['PlateArmor', 'PlateGauntlets', 'PlateBoots', 'PlateHelm']);
};

// LOAD_DATA:
// ************************************************************************************************
CrystalChestGenerator.loadData = function (data) {
	this.nextGroupId = data.nextGroupId;
};

// TO_DATA:
// ************************************************************************************************
CrystalChestGenerator.toData = function () {
	let data = {};
	
	data.nextGroupId = this.nextGroupId;
	
	return data;
};

// STOCK_CRYSTAL_CHESTS:
// ************************************************************************************************
CrystalChestGenerator.stockCrystalChests = function (area, itemTypeNameList = null) {
	// Get all Crystal Chests in the area:
	let chestList = gs.objectList.filter(obj => gs.getArea(obj.tileIndex) === area && obj.type.name === 'CrystalChest');
	
	// Set groupId on chests:
	this.nextGroupId = this.nextGroupId + 1;
	chestList.forEach(function (chest) {
		chest.groupId = this.nextGroupId;
	}, this);
	
	// Forced itemTypeNameList:
	if (itemTypeNameList) {
		itemTypeNameList = util.randSubset(itemTypeNameList, chestList.length);
	}
	// Random Items (either proc-gen or table)
	else {
		itemTypeNameList = this._getItemTypeNameList(chestList.length);
	}
	
	// Create items for each chest:
	chestList.forEach(function (chest) {
		chest.item = ItemGenerator.createDropItem(itemTypeNameList.pop());
	}, this);
};

// PRIVATE: GET_ITEM_TYPE_NAME_LIST:
// ************************************************************************************************
CrystalChestGenerator._getItemTypeNameList = function (numItems) {
	let itemTableList = this.itemTableList;
	
	// Filter tier:
	itemTableList = itemTableList.filter(e => gs.lootTier() >= e.tier);
	
	// Filter maxTier:
	itemTableList = itemTableList.filter(e => gs.lootTier() < e.maxTier);
	
	// Filter previously spawned:
	itemTableList = itemTableList.filter(e => !util.inArray(e.name, gs.previouslySpawnedCrystalChestItemSets));
	
	// Item Table:
	if (itemTableList.length > 0 && util.frac() < 0.50) {
		let count = 0;
		
		while (count < 20) {
			// Select random table:
			let itemTable = util.randElem(itemTableList);
			let itemTypeNameList = itemTable.itemTypeNameList;
			
			// Don't generate previously spawned items:
			itemTypeNameList = itemTypeNameList.filter(itemName => !util.inArray(itemName, gs.previouslySpawnedItemList.concat(gs.tempPreviouslySpawnedItemList)));
			
			// Flag as spawned:
			gs.previouslySpawnedCrystalChestItemSets.push(itemTable.name);
			
			// All Items Available:
			if (itemTypeNameList.length >= numItems) {
				return util.randSubset(itemTypeNameList, numItems);
			}
			// One missing item => Enchant Scroll
			else if (itemTypeNameList.length === numItems - 1) {
				return itemTypeNameList.concat(util.randElem(['ScrollOfEnchantment', 'PotionOfGainAttribute']));
			}
			
			count += 1;
		}
	}
	
	
	
	// Proc-Gen:
	let itemTypeNameList = [];
		
	do {
		let itemTypeName = ItemGenerator.getRandomItemName('RewardTable');
			
		if (!util.inArray(itemTypeName, itemTypeNameList)) {
			itemTypeNameList.push(itemTypeName);
		}
	} while (itemTypeNameList.length < numItems);
		
	return itemTypeNameList;
};

// PRIVATE: CREATE_ITEM_TABLE:
// Creates an itemTable = {itemTypeNameList, tier} and pushes it to itemTables
// ************************************************************************************************
CrystalChestGenerator._createItemTable = function (tableName, itemTypeNameList) {
	let tier = 0,
		maxTier = 10;
	
	itemTypeNameList.forEach(function (itemTypeName) {
		// Verify its a valid itemTypeName:
		if (!gs.itemTypes[itemTypeName]) {
			throw 'ERROR [CrystalChestGenerator.createItemTable] - Invalid itemTypeName: '  + itemTypeName;
		}
		
		// Find tier:
		tier = Math.max(tier, gs.itemTypes[itemTypeName].tier);
		
		// Find maxTier:
		maxTier = Math.min(maxTier, gs.itemTypes[itemTypeName].maxTier);
	}, this);
	
	// Push To Table:
	this.itemTableList.push({
		name: tableName,
		itemTypeNameList: itemTypeNameList,
		tier: tier,
		maxTier: maxTier,
	});
};
