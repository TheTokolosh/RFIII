/*global game, gs, Phaser, console, util */
/*global Item, UIMenuBase*/
/*global HUGE_WHITE_FONT, SCREEN_HEIGHT, LARGE_WHITE_FONT, HUD_START_X*/
/*global UIItemSlotList, ItemSlotList, TomeGenerator*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UIAcquirementMenu() {
	var spacing = 34,
		list;
	
	UIMenuBase.prototype.init.call(this, 'Summon Item');
	
	list = [
		{text: 'Melee Weapon', callBack: this.summonEquipment.bind(this, 'MeleeWeapons')},
		{text: 'Ranged Weapon', callBack: this.summonEquipment.bind(this, 'RangeWeapons')},
		{text: 'Staves', callBack: this.summonStaff},
		{text: 'Armor', callBack: this.summonEquipment.bind(this, 'Armor')},
		{text: 'Shield', callBack: this.summonEquipment.bind(this, 'Shields')},
		{text: 'Ring', callBack: this.summonEquipment.bind(this, 'Rings')},
		{text: 'Charm', callBack: this.summonEquipment.bind(this, 'Charms')},
		{text: 'Wand', callBack: this.summonEquipment.bind(this, 'Wands')},
		{text: 'Potion', callBack: this.potionClicked},
		{text: 'Scroll', callBack: this.scrollClicked},
		{text: 'Food', callBack: this.foodClicked},
		{text: 'Book', callBack: this.summonBook},
	];
	
	// Create Buttons:
	list.forEach(function (e, i) {
		this.createTextButton(this.startX + this.width / 2, this.startY + 60 + spacing * i, e.text, e.callBack, this, this.group);
	}, this);
	
	// Desc Text:
	this.descText = gs.createText(this.startX + this.width / 2, this.startY + 520, 'Select an item type to summon.', 'PixelFont6-White', 12, this.group);
	this.descText.setAnchor(0.5, 0);
	
	this.group.visible = false;
}
UIAcquirementMenu.prototype = new UIMenuBase();

// OPEN:
// ************************************************************************************************
UIAcquirementMenu.prototype.open = function () {
	gs.pc.stopExploring();
	this.group.visible = true;
	this.resetButtons();
};

// CLOSE:
// ************************************************************************************************
UIAcquirementMenu.prototype.close = function () {
	gs.usingFountain = null;
	this.group.visible = false;
};

// CONSUME_SCROLL_OR_FOUNTAIN:
// ************************************************************************************************
UIAcquirementMenu.prototype.consumeScrollOrFountain = function () {
	// Using Scroll:
	if (!gs.usingFountain) {
		gs.pc.inventory.removeItem(gs.pc.inventory.itemOfType(gs.itemTypes.ScrollOfAcquirement), 1);
	}
	// Using Fountain:
	else {
		gs.usingFountain.setIsFull(false);
		gs.usingFountain = null;
	}
};

// ON_SUMMON:
// Call after summoning an item
// ************************************************************************************************
UIAcquirementMenu.prototype.onSummon = function () {
	this.consumeScrollOrFountain();
	gs.stateManager.popState();
	gs.createSummonEffect(gs.pc.tileIndex);
	gs.playSound(gs.sounds.cure);
};

// SUMMON_BOOK:
// ************************************************************************************************
UIAcquirementMenu.prototype.summonBook = function () {
	let maxTalentTier = gs.pc.level <= 6 ? 2 : 3;
	let item = TomeGenerator.createTomes(1, maxTalentTier)[0];
	
	gs.pc.inventory.addItem(item);
	
	this.onSummon();
};

// SUMMON_EQUIPMENT:
// ************************************************************************************************
UIAcquirementMenu.prototype.summonEquipment = function (tableName) {
	let maxTier = 0;
	
	if (tableName === 'Charms') {
		maxTier = 3;
	}
	
	// Create Item:
	let item = gs.createRandomItem(tableName, true, maxTier);
	
	// Special Acquirement Mod:
	item.mod = this.getMod(item.type);
	
	// Make sure we set charges to max:
	if (item.getModdedStat('maxCharges')) {
		item.charges = item.getModdedStat('maxCharges');
	}
	
	// Add item to player:
	gs.pc.inventory.addItem(item);
	
	this.onSummon();
};

// SUMMON_STAFF:
// We need a special function here since low tier staves do not normally drop:
// ************************************************************************************************
UIAcquirementMenu.prototype.summonStaff = function () {
	
	if (gs.lootTier() === 1) {
		this.summonEquipment('BasicStaves');
	}
	else {
		this.summonEquipment('Staves');
	}
	
};

// THROWING_WEAPON_CLICKED:
// ************************************************************************************************
UIAcquirementMenu.prototype.throwingWeaponClicked = function () {	
	// Create Item:
	let item = gs.createRandomItem('ThrowingWeapons');
	item.mod = this.getMod(item.type);
	item.amount = item.type.dropAmount * 3;
	
	// Add item to player:
	gs.pc.inventory.addItem(item);
	
	this.onSummon();
};

// POTION_CLICKED:
// ************************************************************************************************
UIAcquirementMenu.prototype.potionClicked = function () {
	// Create Item:
	let item = gs.createRandomItem('Potions');
	
	if (item.type.name === 'PotionOfGainAttribute') {
		item.amount = 2;
	}
	else {
		item.amount = 3;
	}
	
	item.amount = 3;

	
	// Add to player:
	gs.pc.inventory.addItem(item);
	
	this.onSummon();
};

// SCROLL_CLICKED:
// ************************************************************************************************
UIAcquirementMenu.prototype.scrollClicked = function () {
	let item = null;
	
	do {
		item = gs.createRandomItem('Scrolls');
	} while (item.type.name === 'ScrollOfAcquirement');
	

	if (item.type.name === 'ScrollOfEnchantment') {
		item.amount = 2;
	}
	else {
		item.amount = 3;
	}
	
	gs.pc.inventory.addItem(item);
	
	this.onSummon();
};

// FOOD_CLICKED:
// ************************************************************************************************
UIAcquirementMenu.prototype.foodClicked = function () {
	gs.pc.inventory.addItem(Item.createItem('Meat', {amount: 3}));
	this.onSummon();
};

// GET_MOD:
// ************************************************************************************************
UIAcquirementMenu.prototype.getMod = function (itemType) {
	var mod = Math.min(Item.itemTypeMaxEnchantment(itemType), Math.ceil(gs.pc.level / 6));
	
	// If an item is not stackable i.e. not throwing ammo, then summon an upgrade:
	if (!itemType.stackable && gs.pc.inventory.itemOfType(itemType) && gs.pc.inventory.itemOfType(itemType).mod >= mod) {
		mod = gs.pc.inventory.itemOfType(itemType).mod + 1;
	}
	
	if (itemType.cantEnchant) {
		mod = 0;
	}
	
	// Never exceed mod cap:
	mod = Math.min(mod, Item.itemTypeMaxEnchantment(itemType));
	
	return mod;
};