/*global gs, util*/
/*global Item, TomeGenerator, CrystalChestGenerator*/
/*global ITEM_SLOT*/
/*jshint esversion: 6*/
'use strict';


// STOCK_MERCHANT:
// Call during first generation of merchant to add to the global merchant inventory
// ************************************************************************************************

gs.stockMerchant = function () {
	var numAdded = 0, count = 0;
	
	// During main menu there is no merchant inventory:
	if (!gs.merchantInventory) {
		return;
	}
	
	// Merchant always sells one food:
	this.addItemToMerchant('Meat');
	
	// Deeper merchants drop Amnesia and Levitation potions:
	if (gs.dangerLevel() >= 7) {
		this.addItemToMerchant('PotionOfAmnesia');
		this.addItemToMerchant('PotionOfLevitation');
	}
	
	// Equipment:
	gs.stockMerchantEquipment();
	
	// Good Consumable (enchantment or attribute):
	if (util.frac() <= 0.50) {
		this.addRandomItemToMerchant('GoodConsumables');
	}

	// Stock 4 x Consumables:
	for (let i = 0; i < 4; i += 1) {
		this.addRandomItemToMerchant('Consumables');
	}
};

// STOCK_MERCHANT_EQUIPMENT:
// ************************************************************************************************
gs.stockMerchantEquipment = function () {
	let dropTableList = [
		'Head',
		'Body',
		'Hands',
		'Feet',
		'Shields',
		'Rings', 'Rings', // 2x chance since 2x slots
		'MeleeWeapons',
		'RangeWeapons',
		'Wands',
		'Tomes',
	];
	
	// There are only Tier-2 and above staves:
	if (gs.lootTier() >= 2) {
		dropTableList.push('Staves');
	}
	
	// There are only Tier-3 and above charms:
	if (gs.lootTier() >= 3) {
		dropTableList.push('Charms');
	}
	
	
	dropTableList = util.randSubset(dropTableList, 5);
	
	dropTableList.forEach(function (dropTableName) {
		this.addRandomItemToMerchant(dropTableName);
	}, this);
};

// ADD_ITEM_SET_TO_MERCHANT:
// ************************************************************************************************
gs.addItemSetToMerchant = function () {
	let itemTableList = CrystalChestGenerator.itemTableList;
	
	// Filter tier:
	itemTableList = itemTableList.filter(e => gs.lootTier() >= e.tier && gs.lootTier() < e.maxTier);
	
	// Filter previously spawned:
	itemTableList = itemTableList.filter(e => !util.inArray(e.name, gs.previouslySpawnedMerchantItemSets));
	
	// Select random table:
	let itemTable = util.randElem(itemTableList);
	let itemTypeNameList = itemTable.itemTypeNameList;

	// Flag as spawned:
	gs.previouslySpawnedMerchantItemSets.push(itemTable.name);
	
	// Don't generate previously spawned items:
	itemTypeNameList = itemTypeNameList.filter(itemName => !util.inArray(itemName, gs.previouslySpawnedItemList.concat(gs.tempPreviouslySpawnedItemList)));

	// Subset:
	if (itemTypeNameList.length > 4) {
		itemTypeNameList = util.randSubset(itemTypeNameList, 4);
	}
	
	for (let i = 0; i < itemTypeNameList.length; i += 1) {
		this.addItemToMerchant(itemTypeNameList[i]);
	}
};

// ADD_ITEM_TO_MERCHANT:
// Creates and adds a new item to the merchants inventory as long as he has room
// ************************************************************************************************
gs.addItemToMerchant = function (itemTypeName) {
	// Create Item:
	let item = Item.createItem(itemTypeName);
	
	// Try to add to merchant inventory:
	if (gs.merchantInventory.canAddItem(item)) {
		gs.merchantInventory.addItem(item);
	}
};

// ADD_TOME_TO_MERCHANT:
// ************************************************************************************************
gs.addRandomTomeToMerchant = function () {
	// Create Tome:
	let item = TomeGenerator.createTomes(3, 1)[0];
	
	// Try to add to merchant inventory:
	if (gs.merchantInventory.canAddItem(item)) {
		gs.merchantInventory.addItem(item);
	}
};

// ADD_RANDOM_ITEM_TO_MERCHANT:
// Creates and adds a random new item to the merchants inventory as long as he has room
// ************************************************************************************************
gs.addRandomItemToMerchant = function (itemDropTableName) {
	let item = this.createRandomItem(itemDropTableName);
	
	// Ignore duplicates:
	let count = 0;
	while (!item.type.stackable && gs.merchantInventory.itemOfType(item.type)) {
		item = this.createRandomItem(itemDropTableName);
		
		count += 1;
		if (count > 10) {
			return;
		}
	}
	
	// Merchant tries to stock equipment upgrades:
	if (item.canEnchant() && gs.pc.inventory.itemOfType(item.type) && !item.type.stackable) {
		item.mod = Math.min(item.maxEnchantment(), gs.pc.inventory.itemOfType(item.type).mod + 1);
	}
	
	// Try to add to inventory:
	if (gs.merchantInventory.canAddItem(item)) {
		gs.merchantInventory.addItem(item);
	}
};

// SORT_MERCHANT:
// ************************************************************************************************
gs.sortMerchant = function () {
	let itemList = gs.merchantInventory.itemSlots.map(e => e.item);
	itemList = itemList.filter(item => item);
	
	let newItemList = [];
	// EQUIPMENT:
	// Melee Weapons:
	newItemList = newItemList.concat(itemList.filter(item => item.type.slot === ITEM_SLOT.PRIMARY));
	
	// Range Weapons:
	newItemList = newItemList.concat(itemList.filter(item => item.type.slot === ITEM_SLOT.RANGE && item.type.attackEffect !== gs.weaponEffects.MagicStaff));
	
	// Staves:
	newItemList = newItemList.concat(itemList.filter(item => item.type.slot === ITEM_SLOT.RANGE && item.type.attackEffect === gs.weaponEffects.MagicStaff));
	
	// Shields:
	newItemList = newItemList.concat(itemList.filter(item => item.type.slot === ITEM_SLOT.SECONDARY));
	
	// Body Armor:
	newItemList = newItemList.concat(itemList.filter(item => item.type.slot === ITEM_SLOT.BODY));
	
	// Head Armor:
	newItemList = newItemList.concat(itemList.filter(item => item.type.slot === ITEM_SLOT.HEAD));
	
	// Hand Armor:
	newItemList = newItemList.concat(itemList.filter(item => item.type.slot === ITEM_SLOT.HANDS));
	
	// Feet Armor:
	newItemList = newItemList.concat(itemList.filter(item => item.type.slot === ITEM_SLOT.FEET));
	
	// Charms Armor:
	newItemList = newItemList.concat(itemList.filter(item => item.type.slot === ITEM_SLOT.CHARM));
	
	// Rings Armor:
	newItemList = newItemList.concat(itemList.filter(item => item.type.slot === ITEM_SLOT.RING));
	
	// Wands and Tomes:
	newItemList = newItemList.concat(itemList.filter(item => item.type.slot === ITEM_SLOT.CONSUMABLE && !item.type.stackable));
	
	// CONSUMABLES:
	// Food:
	newItemList = newItemList.concat(itemList.filter(item => item.type.name === 'Meat'));
	
	// Potions:
	newItemList = newItemList.concat(itemList.filter(item => item.type.isPotion));
	
	// Scrolls:
	newItemList = newItemList.concat(itemList.filter(item => item.type.isScroll));
	
	// Throwing Weapons:
	newItemList = newItemList.concat(itemList.filter(item => item.type.isThrowingWeapon));
	
	// Replace inventory:
	for (let i = 0; i < gs.merchantInventory.itemSlots.length; i += 1) {
		if (i < newItemList.length) {
			gs.merchantInventory.itemSlots[i].item = newItemList[i];
		}
		else {
			gs.merchantInventory.itemSlots[i].item = null;
		}
		
	}
};

// CLEAN_MERCHANT:
// Clears items sold to the merchant when the player leaves the level
// ************************************************************************************************
gs.cleanMerchant = function () {
	gs.merchantInventory.allFullItemSlots().forEach(function (slot) {
		if (slot.item.wasSold) {
			slot.clear();
		}
	}, this);
};