/*global gs, util*/
/*global Item, PlayerCharacter*/
/*global PLAYER_FRAMES, ITEM_SLOT*/
'use strict';

// CREATE_PLAYER_CLASSES:
// ************************************************************************************************
gs.createPlayerClasses = function () {
	this.classAttributes = {
		Warrior: 		{strength: 2,	dexterity: 0,	intelligence: 0},
		Barbarian: 		{strength: 2,	dexterity: 0,	intelligence: 0},
		Duelist:		{strength: 0,	dexterity: 2,	intelligence: 0},
		Ranger:			{strength: 0,	dexterity: 2,	intelligence: 0},
		Rogue:			{strength: 0,	dexterity: 2,	intelligence: 0},
		FireMage:		{strength: 0,	dexterity: 0,	intelligence: 2},
		StormMage:		{strength: 0,	dexterity: 0,	intelligence: 2},
		IceMage:		{strength: 0,	dexterity: 0,	intelligence: 2},
		Necromancer:	{strength: 0,	dexterity: 0,	intelligence: 2},
		Enchanter:		{strength: 0,	dexterity: 0,	intelligence: 2},
	};
};

// SET_CLASS:
// ************************************************************************************************
PlayerCharacter.prototype.setClass = function (className) {	
	this.characterClass = className;
	gs.HUD.allowRefresh = false;
	
	
	// Starting Food:
	if (this.race.name !== 'Mummy') {
		this.inventory.addItem(Item.createItem('Meat'));
		
		if (util.inArray(className, ['Necromancer', 'Enchanter', 'FireMage', 'IceMage', 'StormMage'])) {
			this.inventory.addItem(Item.createItem('PotionOfEnergy'));
		}
		else {
			this.inventory.addItem(Item.createItem('PotionOfHealing'));
		}
	}
	
	// Set Talents:
	for (let tier = 1; tier <= 3; tier += 1) {
		// Add active:
		gs.classTalents[className].active.forEach(function (talentName) {
			if (gs.talents[talentName].tier === tier) {
				this.talents.addTalent(talentName);
			}
		}, this);
		
		// Add passive:
		gs.classTalents[className].passive.forEach(function (talentName) {
			if (gs.talents[talentName].tier === tier) {
				this.talents.addTalent(talentName);
			}
		}, this);
	}
	
	// Learning the first active talent:
	this.talents.learnTalent(gs.classTalents[className].active[0]);
	
	// WARRIOR:
	if (className === 'Warrior') {
		// Equipment:
		this.inventory.equipmentSlot(ITEM_SLOT.PRIMARY).addItem(Item.createItem('ShortSword'));
		this.inventory.equipmentSlot(ITEM_SLOT.SECONDARY).addItem(Item.createItem('WoodenBuckler'));
	}
	// BARBARIAN:
	else if (className === 'Barbarian') {
		// Equipment:
		this.inventory.equipmentSlot(ITEM_SLOT.PRIMARY).addItem(Item.createItem('HandAxe'));
	}
	// RANGER:
	else if (className === 'Ranger') {
		// Equipment:
		this.inventory.equipmentSlot(ITEM_SLOT.RANGE).addItem(Item.createItem('ShortBow'));
	}
	// ROGUE:
	else if (className === 'Rogue') {
		// Equipment:
		this.inventory.equipmentSlot(ITEM_SLOT.RANGE).addItem(Item.createItem('ShortBow'));
	}
	// DUELIST:
	else if (className === 'Duelist') {
		// Equipment:
		this.inventory.equipmentSlot(ITEM_SLOT.PRIMARY).addItem(Item.createItem('ShortSword'));	
	}
	// FIRE_MAGE:
	else if (className === 'FireMage') {
		// Equipment:
		this.inventory.equipmentSlot(ITEM_SLOT.RANGE).addItem(Item.createItem('StaffOfFire'));
	}
	// ICE_MAGE:
	else if (className === 'IceMage') {
		// Equipment:
		this.inventory.equipmentSlot(ITEM_SLOT.RANGE).addItem(Item.createItem('StaffOfIce'));
	}
	// STORM_MAGE:
	else if (className === 'StormMage') {
		// Equipment:
		this.inventory.equipmentSlot(ITEM_SLOT.RANGE).addItem(Item.createItem('StaffOfStorms'));
	}
	// NECROMANCER:
	else if (className === 'Necromancer') {
		// Equipment:
		this.inventory.equipmentSlot(ITEM_SLOT.RANGE).addItem(Item.createItem('StaffOfPoison'));
	}
	// ENCHANTER:
	else if (className === 'Enchanter') {
		// Equipment:
		this.inventory.equipmentSlot(ITEM_SLOT.RANGE).addItem(Item.createItem('StaffOfMagicMissiles'));
	} 
	else {
		throw 'Invalid className';
	}	
	
	this.updateStats();
	this.talentPoints = 0;
	this.currentHp = this.maxHp;
	this.currentMp = this.maxMp;
	this.currentSp = this.maxSp;
	this.sprite.frame = this.getSpriteFrame();
	this.type.frame = this.getSpriteFrame();
	
	// Mark starting items:
	this.inventory.getAllItemsList().forEach(function (item) {
		if (Item.isUniqueItem(item.type.name)) {
			gs.previouslySpawnedItemList.push(item.type.name);
		}
	}, this);
	
	gs.HUD.allowRefresh = true;
};
