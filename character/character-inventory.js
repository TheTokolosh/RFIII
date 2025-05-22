/*global gs, console, util*/
/*global ItemSlot, ItemSlotList, Item, PlayerCharacter*/
/*global ASSERT_EQUAL, ASSERT_THROW*/
/*global EQUIPMENT_SLOTS*/
/*global CHARACTER_SIZE, ITEM_SLOT*/
/*global INVENTORY_WIDTH, INVENTORY_HEIGHT*/
/*global WEAPON_HOT_BAR_WIDTH, WEAPON_HOT_BAR_HEIGHT*/
/*global CONSUMABLE_HOT_BAR_WIDTH, CONSUMABLE_HOT_BAR_HEIGHT*/
/*global achievements*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// CHARACTER_INVENTORY:
// ************************************************************************************************
function CharacterInventory (character) {	
	this.character = character;
	
	// Item Slots:
	this.meleeSlot = 		new ItemSlot(ITEM_SLOT.PRIMARY);
	this.rangeSlot =		new ItemSlot(ITEM_SLOT.RANGE);
	
	// Item Slot Lists:
	this.inventory = 		new ItemSlotList(INVENTORY_WIDTH * INVENTORY_HEIGHT);
	this.consumableHotBar = new ItemSlotList(CONSUMABLE_HOT_BAR_WIDTH * CONSUMABLE_HOT_BAR_HEIGHT, ITEM_SLOT.CONSUMABLE);
	this.equipment = 		new ItemSlotList(EQUIPMENT_SLOTS.length);
	
	// Equipment Slot Types:
	EQUIPMENT_SLOTS.forEach(function (name, index) {
		this.equipment.itemSlots[index].itemSlotType = name;
	}, this);
	
	// Misc:
	this.gold = 0;
	
	// Default Weapon:
	this.fists = Item.createItem('Fists');
}

// CLEAR:
// ************************************************************************************************
CharacterInventory.prototype.clear = function () {
	this.gold = 0;
	
	// Item Slots:
	this.meleeSlot.clear();
	this.rangeSlot.clear();
	
	// Item Lists:
	this.inventory.clear();
	this.consumableHotBar.clear();
	this.equipment.clear();
};

// EQUIPMENT_SLOT:
// Easy access to equipment slots by name
// ************************************************************************************************
CharacterInventory.prototype.equipmentSlot = function (slotType) {
	if (slotType === ITEM_SLOT.PRIMARY) {
		return this.meleeSlot;
	}
	else if (slotType === ITEM_SLOT.RANGE) {
		return this.rangeSlot;
	}
	else if (EQUIPMENT_SLOTS.indexOf(slotType) > -1) {
		return this.equipment.itemSlots[EQUIPMENT_SLOTS.indexOf(slotType)];
	}
	else {
		throw 'Invalid slotType: ' + slotType;
	}
};

// ITEM_IN_SLOT:
// Easy access to items by slot name:
// ************************************************************************************************
CharacterInventory.prototype.itemInSlot = function (slotName) {
	ASSERT_EQUAL(EQUIPMENT_SLOTS.indexOf(slotName) > -1, true, 'Invalid slotName: ' + slotName);
	
	return this.equipment.itemSlots[EQUIPMENT_SLOTS.indexOf(slotName)].item;
};

// TO_DATA:
// ************************************************************************************************
CharacterInventory.prototype.toData = function () {
	var data = {};
	
	// Save Item Slots:
	data.meleeSlot = 	this.meleeSlot.toData();
	data.rangeSlot = 	this.rangeSlot.toData();
	
	// Save Item Lists:
	data.inventory = this.inventory.toData();
	data.consumableHotBar = this.consumableHotBar.toData();
	data.equipment = this.equipment.toData();
	
	// Misc:
	data.gold = this.gold;
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
CharacterInventory.prototype.loadData = function (data) {
	// Load Item Slots:
	this.meleeSlot.loadData(data.meleeSlot);
	this.rangeSlot.loadData(data.rangeSlot);
	
	// Load Item Lists:
	this.inventory.loadData(data.inventory);
	this.consumableHotBar.loadData(data.consumableHotBar);
	this.equipment.loadData(data.equipment);
	
	// Load Misc:
	this.gold = data.gold;
};

// CAN_ADD_ITEM:
// ************************************************************************************************
CharacterInventory.prototype.canAddItem = function (item) {
	ASSERT_EQUAL(Item.isItem(item), true, 'Invalid item: ' + item);
	
	if (item.type.name === 'GoldCoin' || item.type.name === 'Key' || item.type.name === 'GobletOfYendor') {
		return true;
	}
	else if (this.consumableHotBar.canAddItem(item)) {
		return true;
	}
	else if (this.inventory.canAddItem(item)) {
		return true;
	}
	
	return false;
};

// ADD_GOLD:
// ************************************************************************************************
CharacterInventory.prototype.addGold = function (amount) {
	this.gold += amount;
	
	if (this.gold >= 1000) {
		achievements.get('DRAGONS_HOARD');
	}
};

// ADD_ITEM:
// ************************************************************************************************
CharacterInventory.prototype.addItem = function (item, popUpText = true) {
	var color = 'White';
	
	// Popup Text:
	if (popUpText && gs.turn > 0 && !util.inArray(item.name, ['HealingShroom', 'EnergyShroom'])) {
		if (item.isRandArt()) {
			color = 'Blue';
		}
		else if (item.mod > 0) {
			color = 'Green';
		}
		
		this.character.popUpText(item.toShortDesc(), color);
	}
	
	gs.HUD.refresh();
	
	// Add Gold:
	if (item.type.name === 'GoldCoin') {
		this.addGold(item.amount);
	}
	// Mummy tries to add edibles to main inventory:
	else if (this.character.race.name === 'Mummy' && item.type.edible && (this.inventory.canStackItem(item) || this.inventory.canAddItem(item))) {
		this.inventory.addItem(item);
	}
	// First try to stack on consumable:
	else if (this.consumableHotBar.canStackItem(item)) {
		this.consumableHotBar.addItem(item);
	}
	// First try to stack on inventory:
	else if (this.inventory.canStackItem(item)) {
		this.inventory.addItem(item);
	}
	// Add charged items to inventory:
	else if (item.type.maxMpCost && this.inventory.canAddItem(item)) {
		this.inventory.addItem(item);
	}
	// Add item to consumable hotbar:
	else if (this.consumableHotBar.canAddItem(item)) {
		this.consumableHotBar.addItem(item);
	}
	// Adding to inventory:
	else if (this.inventory.canAddItem(item)) {
		this.inventory.addItem(item);
	}
	// Can't add item:
	else {
		this.character.dropItem(item);
	}
};

// REMOVE_ITEM:
// ************************************************************************************************
CharacterInventory.prototype.removeItem = function (item, amount) {
	ASSERT_EQUAL(Item.isItem(item), true, 'Invalid item: ' + item);
	
	// Try to remove from consumableHotBar:
	if (this.consumableHotBar.containsItem(item)) {
		this.consumableHotBar.removeItem(item, amount);
	}
	// Try to remove from inventory:
	else if (this.inventory.containsItem(item)) {
		this.inventory.removeItem(item, amount);
	}
	// Try to remove from equipment:
	else if (this.equipment.containsItem(item)) {
		this.equipment.removeItem(item, amount);
		this.character.onUnequipItem(item);
	}
	// Try to remove from Primary Slot:
	else if (this.meleeSlot.item === item) {
		this.meleeSlot.removeItem(amount);
	}
	// Try to remove from Range Slot:
	else if (this.rangeSlot.item === item) {
		this.rangeSlot.removeItem(amount);
	}
	else {
		throw 'Failed to remove item: ' + item;
	}
	
	this.character.updateStats();
};

// REMOVE_ITEM_TYPE:
// ************************************************************************************************
CharacterInventory.prototype.removeItemType = function (itemType, amount = 1) {
	this.removeItem(this.itemOfType(itemType), amount);
};

// ALL_FULL_ITEM_SLOTS:
// Used when we need to create a list of all the players slots for stuff like merchant, enchantment, transferance menus.
// ************************************************************************************************
CharacterInventory.prototype.allFullItemSlots = function () {
	var list = [];
	
	// Pushing Lists:
	list = list.concat(this.equipment.allFullItemSlots());
	list = list.concat(this.consumableHotBar.allFullItemSlots());
	list = list.concat(this.inventory.allFullItemSlots());
	
	// Pushing Primary:
	if (this.meleeSlot.hasItem()) {
		list.push(this.meleeSlot);
	}
	
	// Pushing Range:
	if (this.rangeSlot.hasItem()) {
		list.push(this.rangeSlot);
	}
	
	return list;
};

// GET_ALL_ITEMS_LIST:
// Returns a list of all items in inventory or equipment:
// ************************************************************************************************
CharacterInventory.prototype.getAllItemsList = function () {
	return this.allFullItemSlots().map(slot => slot.item);
};

// HIGHEST_MOD:
// Returns the highest mod of the itemType in the inventory or 0 if no item
// ************************************************************************************************
CharacterInventory.prototype.highestMod = function (itemType) {
	var itemList;
	itemList = this.allFullItemSlots().map(slot => slot.item);
	itemList = itemList.filter(item => item.type === itemType);
	itemList.sort((a, b) => b.mod - a.mod);
	return itemList.length > 0 ? itemList[0].mod : 0;
};

// ITEM_OF_TYPE:
// Returns the item in the players inventory of the specified type
// ************************************************************************************************
CharacterInventory.prototype.itemOfType = function (type) {
	
	if (this.consumableHotBar.itemOfType(type)) {
		return this.consumableHotBar.itemOfType(type);
	}
	else if (this.inventory.itemOfType(type)) {
		return this.inventory.itemOfType(type);
	}
	else if (this.equipment.itemOfType(type)) {
		return this.equipment.itemOfType(type);
	}
	else if (this.meleeSlot.item && this.meleeSlot.item.type === type) {
		return this.meleeSlot.item;
	}
	else if (this.rangeSlot.item && this.rangeSlot.item.type === type) {
		return this.rangeSlot.item;
	}
	else {
		return null;
	}
};

// HAS_ITEM_TYPE:
// ************************************************************************************************
CharacterInventory.prototype.hasItemType = function (itemType) {
	return Boolean(this.itemOfType(itemType));
};

// COUNT_ITEM_OF_TYPE:
// ************************************************************************************************
CharacterInventory.prototype.countItemOfType = function (type) {
	var item = this.itemOfType(type);
	
	if (item) {
		return item.amount;
	}
	else {
		return 0;
	}
};

// GET_PRIMARY_WEAPON:
// ************************************************************************************************
CharacterInventory.prototype.getPrimaryWeapon = function () {
	if (this.meleeSlot.hasItem() && this.meleeSlot.item.type.slot !== ITEM_SLOT.CHARM) {
		return this.meleeSlot.item;
	}
	else {
		return this.fists;
	}
};

// GET_RANGE_WEAPON:
// ************************************************************************************************
CharacterInventory.prototype.getRangeWeapon = function () {
	if (this.rangeSlot.hasItem() && this.rangeSlot.item.type.slot !== ITEM_SLOT.CHARM) {
		return this.rangeSlot.item;
	}
	else {
		return null;
	}
};

// ON_UPDATE_TURN:
// ************************************************************************************************
CharacterInventory.prototype.onUpdateTurn = function () {
	this.allFullItemSlots().forEach(function (slot) {
		slot.item.onUpdateTurn();
	}, this);
};

// ON_UPDATE_STATS:
// ************************************************************************************************
CharacterInventory.prototype.onUpdateStats = function (character) {
	this.character = character;
	
	// Equipment stats:
	this.equipmentList().forEach(function(item) {
		item.applyEquipmentStats(this.character);
	}, this);	
};

// CONSUME_MAX_MP:
// ************************************************************************************************
CharacterInventory.prototype.consumeMaxMp = function (character) {
	this.character = character;
	
	let list = this.allFullItemSlots();
	list = list.filter(slot => slot.item.type.maxMpCost);
	
	list.forEach(function (slot) {
		if (slot.itemSlotType === ITEM_SLOT.CONSUMABLE && character.maxMp >= slot.item.type.maxMpCost) {
			character.maxMp -= slot.item.type.maxMpCost;
			slot.item.isOn = true;
			
			slot.item.applyEquipmentStats(this.character);
		}
		else if (character === gs.pc) {
			slot.item.isOn = false;
			
			if (slot.item.type.coolDown) {
				slot.item.chargeTimer = slot.item.getModdedStat('coolDown');
			}
			
		}
	}, this);
	
};

// EQUIPMENT_LIST:
// Return a list of all the items the character is currently wearing
// Returns a list of 'Items'
// ************************************************************************************************
CharacterInventory.prototype.equipmentList = function () {
	var list = [];
	

	
	this.equipment.itemSlots.forEach(function (itemSlot) {
		if (itemSlot.hasItem()) {
			if (itemSlot.itemSlotType !== ITEM_SLOT.SECONDARY) {
				list.push(itemSlot.item);
			}
			else if (this.canWieldShield()) {
				list.push(itemSlot.item);
			}
		}
		
	}, this);

	if (this.meleeSlot.hasItem()) {
		list.push(this.meleeSlot.item);
	}
	
	if (this.rangeSlot.hasItem()) {
		list.push(this.rangeSlot.item);
	}
	
	/*
	// Adding Primary Weapon:
	list.push(this.getPrimaryWeapon());
	
	// Adding Range Weapon:
	if (this.getRangeWeapon()) {
		list.push(this.getRangeWeapon());
	}
	*/
	
	return list;
};

// CAN_WIELD_SHIELD:
// Determines if the player can validly equip an item in the shield slot.
// ************************************************************************************************
CharacterInventory.prototype.canWieldShield = function () {
	//return this.getPrimaryWeapon().type.hands === 1 || this.character.size === CHARACTER_SIZE.LARGE;
	return this.getPrimaryWeapon().type.hands === 1;
};

// HAS_SHIELD_EQUIPPED:
// Used for determining if the character can use shield abilities.
// Note that this will return false for items like orbs of power even though they fit in the shield slot
// ************************************************************************************************
CharacterInventory.prototype.hasShieldEquipped = function () {
	return this.equipmentSlot(ITEM_SLOT.SECONDARY).hasItem()
		&& this.equipmentSlot(ITEM_SLOT.SECONDARY).item.type.stats.protection > 0 // Note: not using getStats since a rand-art may have protection without being a shield
		&& this.canWieldShield();
};

// NUM_POTIONS:
// Used by mystic skull helm
// ************************************************************************************************
CharacterInventory.prototype.numPotions = function () {
	var list;
	
	list = this.consumableHotBar.allFullItemSlots();
	list = list.concat(this.inventory.allFullItemSlots());
	list = list.filter(slot => slot.item.type.edible && slot.item.type.name !== 'Meat');
	
	return list.reduce((pv, nv) => pv + nv.item.amount, 0);
};

// NUM_RUNES:
// ************************************************************************************************
CharacterInventory.prototype.numRunes = function () {
	return this.allFullItemSlots().filter(slot => slot.item.type.isRune).length;
};