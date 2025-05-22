/*global game, gs, console, Phaser, util*/
/*global TomeGenerator*/
/*global ASSERT_EQUAL, ASSERT_THROW, ITEM_SLOT*/
/*global NICE_STAT_NAMES, STAT_AS_PERCENT, STAT_AS_FLAG, LINEAR_MODDED_STATS, SELL_ITEM_PERCENT, PERCENT_MODIFIER*/
/*global STAT_MODIFIERS, STAT_AS_NUMERAL, ROMAN_NUMERAL*/
/*jshint white: true, laxbreak: true, esversion: 6*/
'use strict';

// ITEM_CONSTRUCTOR:
// ************************************************************************************************
function Item (typeName, flags = {}) {
	ASSERT_EQUAL(gs.itemTypes.hasOwnProperty(typeName), true, 'Invalid typeName: ' + typeName);
	
	this.type = gs.itemTypes[typeName];
	this.mod = flags.mod || 0;
	this.amount =  flags.amount || this.type.dropAmount;
	this.charges = flags.charges || 0;
	this.chargeTimer = flags.chargeTimer || 0;
	this.talentList = flags.talentList || null;
	this.isOn = false; // Used for wands and charms
	
	// Stats contains the same data as ItemType.stats and will overwrite
	this.stats = flags.stats || {};
	
	// Cap the mod:
	this.mod = Math.min(this.mod, Item.itemTypeMaxEnchantment(this.type));
	
	Object.seal(this);
}

// TO_SHORT_DESC:
// ************************************************************************************************
Item.prototype.toShortDesc = function () {
	var str = '';
	
	if (this.amount > 1) {
		str += this.amount + ' x ';
	}
	
	if (this.mod > 0) {
		str += '+' + this.mod + ' ';
	}
	
	str += this.type.niceName;
	
	return str;
};

// TO_USE_DESC:
// UIUseMenu uses this to create its string:
// ************************************************************************************************
Item.prototype.toUseMenuDesc = function () {
	var str = '';
	
	if (this.mod > 0) {
		str += '+' + this.mod + ' ';
	}
	
	str += this.type.niceName;
	
	if (this.charges > 0) {
		str += '\nCharges: ' + this.charges + '/' + this.getModdedStat('maxCharges');
	}
	
	return str;
};

// TO_ENCHANT_DESC:
// Will show the items current stats and the stats of the next enchantment level
// ************************************************************************************************
Item.prototype.toEnchantDesc = function () {
	var str = '', stats;
	
	if (this.mod > 0) {
		str += '+' + this.mod + ' ';
	}
	
	str += this.type.niceName + '\n';
	
	return str;
};

// TO_LONG_DESC:
// ************************************************************************************************
Item.prototype.toLongDesc = function (showEnchantmentBonus = false) {
	var str = '', statName, val, niceName, stats, desc = {};
	
	// Get stats object w/ rand-art overrides:
	stats = this.getStats();

	// Title:
	desc.title = this.toShortDesc() + '\n';
	
	// Enchanted color:
	if (this.isRandArt()) {
		desc.font = 'PixelFont6-Blue';
	}
	else if (this.mod > 0) {
		desc.font = 'PixelFont6-Green';
	}
	
	// Damage of Weapons:
	if ((this.type.slot === ITEM_SLOT.PRIMARY || this.type.slot === ITEM_SLOT.RANGE) && stats.damage > 0) {
		
		str += '*Damage: ' + this.getModdedStat('damage');
		str += ' [' + gs.pc.weaponDamage(this) + ']';
		
		
		// Max melee attribute bonus:	
		if (this.type.attackEffect.skill === 'Melee') { 
			if (gs.pc.strength >= (10 + this.getModdedStat('damage'))) {
				str += ' MAX STR';
			}
		}
		// Max staff attribute bonus:
		else if (this.type.attackEffect === gs.weaponEffects.MagicStaff) {
			if (gs.pc.intelligence >= (10 + this.getModdedStat('damage'))) {
				str += ' MAX INT';
			}
		}
		// Max range attribute bonus:
		else {
			if (gs.pc.dexterity >= (10 + this.getModdedStat('damage'))) {
				str += ' MAX DEX';
			}
		}
			
	
	
		
		
		if (showEnchantmentBonus) {
			
			str += ' } ';
			
			str += this.getModdedStat('damage', this.mod + 1);
			str += ' [' + gs.pc.weaponDamage(this, this.mod + 1) + ']';


			// Max attribute bonus:	
			if (this.type.attackEffect.skill === 'Melee') {
				if (gs.pc.strength >= (10 + this.getModdedStat('damage', this.mod + 1))) {
					str += ' MAX STR';
				}
			}
			else if (this.type.attackEffect === gs.weaponEffects.MagicStaff) {
				if (gs.pc.intelligence >= (10 + this.getModdedStat('damage', this.mod + 1))) {
					str += ' MAX INT';
				}
			}
			else {
				if (gs.pc.dexterity >= (10 + this.getModdedStat('damage', this.mod + 1))) {
					str += ' MAX DEX';
				}
			}
			
			
		}
		
		str += '\n';
	}

	// Range:
	if (this.type.slot === ITEM_SLOT.RANGE) {
		if (this.type.range !== gs.pc.weaponRange(this)) {
			str += '*Range: ' + this.type.range + ' [' + gs.pc.weaponRange(this) + ']\n';
		}
		else {
			str += '*Range: ' + this.type.range + '\n';
		}
	}
	

	// Encumberance:
	if (stats.encumberance) {
		str += '*Encumberance: ' + stats.encumberance + '\n';
	}
	

	// Equipment Stats:
	for (statName in stats) {
		if (stats.hasOwnProperty(statName) && statName !== 'damage' && statName !== 'encumberance') {
			
			niceName = NICE_STAT_NAMES[statName];
			val = this.getModdedStat(statName);
			
			if (niceName) {
				// Display the stat as a percent:
				if (STAT_AS_PERCENT[statName]) {
					str +=  '*' + niceName + ': '  + util.toPercentStr(val);
					
					if (showEnchantmentBonus && val !== this.getModdedStat(statName, this.mod + 1)) {
						val = this.getModdedStat(statName, this.mod + 1);
						str += ' } ' + util.toPercentStr(val);
					}
					
					str += '\n';
				}
				// Display as numeral:
				else if (STAT_AS_NUMERAL[statName]) {
					str += '*' + niceName + ' '  + ROMAN_NUMERAL[val];
					
					if (showEnchantmentBonus && val !== this.getModdedStat(statName, this.mod + 1)) {
						val = this.getModdedStat(statName, this.mod + 1);
						str += ' } ' + ROMAN_NUMERAL[val];
					}
					
					str += '\n';
				}
				// Display just the stat name:
				else if (STAT_AS_FLAG[statName]) {
					str += '*' + niceName + '\n';
				}
				// Display as value:
				else {
					str += '*' + niceName + ': ' + val;
					
					if (showEnchantmentBonus) {
						val = this.getModdedStat(statName, this.mod + 1);
						str += ' } ' + val;
					}
					
					str += '\n';
				}
			}
		}
	}
	
	// Max MP Cost::
	if (this.type.maxMpCost) {
		str += '*Max MP Cost: ' + this.type.maxMpCost + '\n';
	}
	
	// Cool Down::
	if (this.type.coolDown) {
		if (showEnchantmentBonus) {
			str += '*Cool Down: ' + this.getModdedStat('coolDown', this.mod);
			str += ' } ' + this.getModdedStat('coolDown', this.mod + 1);
		}
		else {
			str += '*Cool Down: ' + this.getModdedStat('coolDown', this.mod);
		}
		
		str += '\n';
	}
	
	// Charges:
	if (this.type.stats.maxCharges) {
		if (showEnchantmentBonus) {
			str += '*Charges: ' + this.charges + '/' + this.getModdedStat('maxCharges', this.mod);
			
			let newMaxCharges = this.getModdedStat('maxCharges', this.mod + 1);
			str += ' } ' + newMaxCharges + '/' + newMaxCharges;
		}
		else {
			str += '*Charges: ' + this.charges + '/' + this.getModdedStat('maxCharges', this.mod);
		}
		
		str += '\n';
	}
	
	// Ability Desc:
	if (this.type.useEffect && gs.abilityTypes[this.type.useEffect.name]) {
		if (gs.abilityDesc({type: this.type.useEffect}, this)) {
			let abilityDesc = gs.abilityDesc({type: this.type.useEffect}, this);
			str += abilityDesc.title;
			str += abilityDesc.text;
		}
	}
	
	// Talents:
	if (this.talentList) {
		for (let i = 0; i < this.talentList.length; i += 1) {
			if (this.talentList[i] === 'intelligence') {
				str += '+1 Intelligence';
			}
			else if (this.talentList[i] === 'strength') {
				str += '+1 Strength';
			}
			else if (this.talentList[i] === 'dexterity') {
				str += '+1 Dexterity';
			}
			else {
				str += '*' + gs.capitalSplit(this.talentList[i]) + '\n';
			}
		}
	}

	// Item Desc:
	if (this.type.desc) {
		// Adding an additional line between stats and desc.
		// Will not add the additional line for items with no stats.
		if (str.length > 0) {
			str += '\n';
		}
		
		str += this.type.desc;
	}
	
	desc.text = str;

	return desc;
};

// TO_STRING:
// ************************************************************************************************
Item.prototype.toString = function () {
	var str = this.type.name;
	str += this.mod ? ', mod: ' + this.mod : '';
	str += this.amount > 1 ? ', amount: ' + this.amount : '';
	str += this.charges ? ', charges: ' + this.charges : '';
	str += this.chargeTimer ? ', chargeTimer: ' + this.chargeTimer : '';
	str += this.talentList ? ', talents: ' + this.talentList : '';
	
	return str;
};

// CAN_STACK_ITEM:
// Returns true if this item can stack with otherItem
// ************************************************************************************************
Item.prototype.canStackItem = function (otherItem) {
	ASSERT_EQUAL(Item.isItem(otherItem), true, 'Not a valid item: ' + otherItem);
	
	return this.type === otherItem.type && this.mod === otherItem.mod && this.type.stackable;
};

// CAN_ENCHANT_ITEM:
// ************************************************************************************************
Item.prototype.canEnchant = function () {
	// Cannot enchant the itemType:
	if (!Item.canEnchantItemType(this.type)) {
		return false;
	}
	
	// Cant enchant rand-arts:
	if (this.isRandArt()) {
		return false;
	}
	
	// Exceeded max enchantment:
	if (this.mod >= this.maxEnchantment()) {
		return false;
	}
	
	return true;
};

// MAX_ENCHANTMENT:
// ************************************************************************************************
Item.prototype.maxEnchantment = function () {
	return Item.itemTypeMaxEnchantment(this.type);
};



// ON_UPDATE_TURN:
// ************************************************************************************************
Item.prototype.onUpdateTurn = function () {
	// Charged Items:
	if (this.type.maxMpCost && this.type.coolDown) {
		if (this.isOn) {
			if (this.chargeTimer > 0) {
				this.chargeTimer -= 1;
				
				if (this.chargeTimer === 0) {
					gs.pc.popUpText(this.type.niceName + ' charged');
				}
			}
		}
		else {
			this.chargeTimer = this.getModdedStat('coolDown');
		}	
	} 
};

// TO_DATA:
// ************************************************************************************************
Item.prototype.toData = function () {
	var data = {};
	
	data.typeName = this.type.name;
	data.mod = this.mod;
	data.amount = this.amount;
	data.charges = this.charges;
	data.chargeTimer = this.chargeTimer;
	data.talentList = this.talentList;
	data.stats = this.stats;
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
Item.prototype.loadData = function (data) {
	this.type = gs.itemTypes[data.typeName];
	this.mod = data.mod;
	this.amount = data.amount;
	this.charges = data.charges;
	this.chargeTimer = data.chargeTimer;
	this.talentList = data.talentList;
	this.stats = data.stats || {};
};


// GET_MODDED_STAT:
// ************************************************************************************************
Item.prototype.getModdedStat = function (statName, mod) {
	var baseVal = this.getStats()[statName] || 0;
	
	mod = mod || this.mod;
	
	// Wand coolDown:
	if (statName === 'coolDown') {
		return this.type.coolDown[mod];
	}
	
	// Return base value if cannot enchant item:
	if (this.type.cantEnchant) {
		return baseVal;
	}
	// Don't mod negative or 0 stats:
	else if (baseVal <= 0) {
		return baseVal;
	}
	// Modding standard wands:
	else if (statName === 'maxCharges' && baseVal === 5) {
		return [5, 8, 10, 12][mod];
	}
	else if (statName === 'coolDownModifier') {
		return baseVal + mod * 0.10;
	}
	else if (statName === 'protection') {
		return baseVal + mod;
	}
	// Don't mod flags and encumberance:
	else if (STAT_AS_FLAG[statName] || statName === 'encumberance') {
		return baseVal;	
	}
	// Percent Mod:
	else if (STAT_AS_PERCENT[statName]) {
		let percentModifier = PERCENT_MODIFIER.find(e => e.base === baseVal);
		
		return percentModifier.mod[mod];
	}
	// No mod:
	else if (mod === 0) {
		return baseVal;
	}
	// Weapon damage:
	else if (statName === 'damage') {
		return baseVal + mod;
	}
	else if (STAT_AS_NUMERAL[statName]) {
		return Math.min(3, baseVal + mod);
	}
	// Modding based on STAT_MODIFIERS table:
	else {
		return STAT_MODIFIERS[baseVal][mod - 1];
	}
};

// APPLY_EQUIPMENT_STATS:
// Add the stats of an equipped item to the character
// ********************************************************************************************
Item.prototype.applyEquipmentStats = function (character) {
	var statName, stats;
	
	// Get stats object with rand-art overrides:
	stats = this.getStats();

	for (statName in stats) {
		if (stats.hasOwnProperty(statName)) {
			// Damage:
			if (statName == 'damage') {
				// Damage is not added to player
			}
			// Encumberance Special Case:
			else if (statName === 'encumberance') {
				character.encumberance += this.getModdedStat(statName);
			}
			// Adding resistance:
			else if (statName === 'fireResistance') {
				character.resistance.Fire += this.getModdedStat(statName);
			}
			else if (statName === 'coldResistance') {
				character.resistance.Cold += this.getModdedStat(statName);
			}
			else if (statName === 'shockResistance') {
				character.resistance.Shock += this.getModdedStat(statName);
			}
			else if (statName === 'toxicResistance') {
				character.resistance.Toxic += this.getModdedStat(statName);
			}
			// Adding Damage Shield:
			else if (statName === 'physicalDamageShield') {
				character.damageShield.Physical += this.getModdedStat(statName);
			}
			else if (statName === 'fireDamageShield') {
				character.damageShield.Fire += this.getModdedStat(statName);
			}
			else if (statName === 'coldDamageShield') {
				character.damageShield.Cold += this.getModdedStat(statName);
			}
			else if (statName === 'shockDamageShield') {
				character.damageShield.Shock += this.getModdedStat(statName);
			}
			else if (statName === 'toxicDamageShield') {
				character.damageShield.Toxic += this.getModdedStat(statName);
			}
			// Everything Else:
			else {
				character[statName] += this.getModdedStat(statName);
			}			
		}
	}
};

// GET_STATS:
// Returns an object with the items stats as statName:statVal pairs
// If the object has a stat object (RandArt), the stat object properties will overwrite the ItemType properties
// ************************************************************************************************
Item.prototype.getStats = function () {
	var stats = {};
	
	// Add the ItemType.stats:
	for (let key in this.type.stats) {
		if (this.type.stats.hasOwnProperty(key)) {
			stats[key] = this.type.stats[key];
		}
	}
	
	// Overwrite any values in this.stats (rand-arts):
	for (let key in this.stats) {
		if (this.stats.hasOwnProperty(key)) {
			stats[key] = this.stats[key];
		}
	}
	
	// Mystic Skull Helm:
	if (this.type.name === 'MysticSkullHelm') {
		stats.maxHp = gs.pc.inventory.numPotions() * 2;
	}
	
	return stats;
};

// ENCHANT:
// ************************************************************************************************
Item.prototype.enchant = function () {
	this.mod += 1;
	
	// Fully recharge wands when enchanting:
	if (this.getStats().maxCharges) {
		this.charges = this.getModdedStat('maxCharges');
	}
	
	// Reset cooldown:
	if (this.type.coolDown) {
		this.chargeTimer = 0;
	}
};

// GET_SOUND:
// ************************************************************************************************
Item.prototype.getSound = function () {
	if (this.type.sound) {
		return this.type.sound;
	}
	else if (util.inArray(this.type.slot, [ITEM_SLOT.BODY, ITEM_SLOT.HEAD, ITEM_SLOT.HANDS, ITEM_SLOT.FEET, ITEM_SLOT.SECONDARY])) {
		return gs.sounds.armor;
	}
	else if (util.inArray(this.type.slot, [ITEM_SLOT.RING]) || this.type.name === 'Key') {
		return gs.sounds.jewlery;
	}
	else if (util.inArray(this.type.slot, [ITEM_SLOT.PRIMARY, ITEM_SLOT.RANGE])) {
		return gs.sounds.weapon;
	}
	else if (this.type.slot === ITEM_SLOT.CONSUMABLE) {
		return gs.sounds.potion;
	}
	else if (this.type.name === 'GoldCoin') {
		return gs.sounds.coin;
	}
	else if (this.type.isTome) {
		return gs.sounds.scroll;
	}
	
};

// BASE_VALUE:
// ************************************************************************************************
Item.prototype.baseValue = function () {
	// Base Cost:
	let cost = this.type.cost;
	
	// Enchanted Items:
	cost += this.mod * 10;
	
	// Rand Art Items:
	if (this.isRandArt()) {
		cost = Math.round(cost * 1.5);
	}
	
	// Charged Items (Wands):
	if (this.getModdedStat('maxCharges')) {
		cost = Math.round(cost * (this.charges / this.getModdedStat('maxCharges')));
	}
	
	return cost;
};


// SELL_VALUE:
// How much does the player get when selling the item
// ************************************************************************************************
Item.prototype.sellValue = function () {
	if (this.type.cost === 0) {
		return 0;
	}
	else {
		return Math.max(1, Math.floor(SELL_ITEM_PERCENT * this.baseValue()));
	}
};

// IS_RAND_ART:
// ************************************************************************************************
Item.prototype.isRandArt = function () {
	for (let key in this.stats) {
		if (this.stats.hasOwnProperty(key)) {
			return true;
		}
	}
	
	return false;
};

// ************************************************************************************************
// ITEM_STATIC_FUNCTIONS:
// ************************************************************************************************
// ************************************************************************************************
// CREATE_ITEM:
// ************************************************************************************************
Item.createItem = function (typeName, flags = {}) {
	ASSERT_EQUAL(gs.itemTypes.hasOwnProperty(typeName), true, 'Invalid typeName: ' + typeName);
	
	var item;
	
	// Unspecified amount for gold
	// Defaults to the dropGoldAmount of the zone level
	if (typeName === 'GoldCoin' && !flags.amount) {
		flags.amount = util.randInt(Math.ceil(gs.dropGoldAmount() / 2), gs.dropGoldAmount());
	}
	
	// Create the new item:
	item = new Item(typeName, flags);
	
	// Wands have their charges set to max by default:
	if (item.type.stats.maxCharges && item.type.slot === ITEM_SLOT.CONSUMABLE && !flags.charges) {
		item.charges = item.getModdedStat('maxCharges');
	}
	
	// Book talents:
	if (item.type.isTome && gs.pc) {
		if (flags.talentList) {
			item.talentList = flags.talentList;
		}
		else {
			let tome = TomeGenerator.createSingleTome(typeName, 3);
			item.talentList = tome.talentList;
		}
		
	}
	
	
	return item;
};

// CREATE_AND_LOAD_ITEM:
// Creates and loads an item from data
// ************************************************************************************************
Item.createAndLoadItem = function (data) {
	return new Item(data.typeName, data);
};

// IS_ITEM:
// Used to confirm that the object in question is actually a valid item
// ************************************************************************************************
Item.isItem = function (item) {
	return Boolean(typeof item === 'object' && item.type && gs.itemTypes[item.type.name]);
};

// IS_UNIQUE_ITEM:
// ************************************************************************************************
Item.isUniqueItem = function (itemTypeName) {
	var itemType = gs.itemTypes[itemTypeName];
	
	if (!itemType) {
		throw 'ERROR [gs.isUniqueItem] invalid itemTypeName: ' + itemTypeName;
	}
	
	let slotTypeList = [
		ITEM_SLOT.PRIMARY,
		ITEM_SLOT.SECONDARY,
		ITEM_SLOT.RANGE,
		ITEM_SLOT.BODY,
		ITEM_SLOT.HEAD,
		ITEM_SLOT.HANDS,
		ITEM_SLOT.FEET,
		ITEM_SLOT.RING,
	];

	return util.inArray(itemType.slot, slotTypeList) && !itemType.stackable;
};

// ITEM_TYPE_MAX_ENCHANTMENT:
// ************************************************************************************************
Item.itemTypeMaxEnchantment = function (itemType) {
	if (util.inArray(itemType.slot, [ITEM_SLOT.PRIMARY, ITEM_SLOT.RANGE, ITEM_SLOT.CHARM, ITEM_SLOT.SECONDARY, ITEM_SLOT.CONSUMABLE, ITEM_SLOT.BODY])) {
		return 3;
	}
	else {
		return 2;
	}
};

// CAN_ENCHANT_ITEM_TYPE:
// Note the test for maxCharges to catch wands.
// ************************************************************************************************
Item.canEnchantItemType = function (itemType) {
	let isEquipment = util.inArray(itemType.slot, [
		ITEM_SLOT.PRIMARY,
		ITEM_SLOT.SECONDARY,
		ITEM_SLOT.RANGE,
		ITEM_SLOT.BODY,
		ITEM_SLOT.HEAD,
		ITEM_SLOT.HANDS,
		ITEM_SLOT.FEET,
		ITEM_SLOT.RING,
		ITEM_SLOT.CHARM,
	]);
	
	let isWand = itemType.coolDown || itemType.stats.maxCharges;
	
	return (isEquipment || isWand) && !itemType.cantEnchant;
};