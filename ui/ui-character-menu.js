/*global game, gs, console, util*/
/*global UIItemSlot, UITextButtonList, UIItemSlotList, ItemSlot, UIStatPanel, Talent, UITalentPanel*/
/*global SCREEN_HEIGHT, ITEM_SLOT*/
/*global NUM_EQUIPMENT_SLOTS, SLOT_SELECT_BOX_FRAME, RIGHT_RING_SELECT_BOX_FRAME, LEFT_RING_SELECT_BOX_FRAME*/
/*global TILE_SIZE, SMALL_GREEN_FONT*/
/*global EQUIPMENT_SLOTS, EQUIPMENT_SLOT_FRAMES, INVENTORY_WIDTH, INVENTORY_HEIGHT*/
/*global ACTION_TIME, HUD_START_X*/
/*global LARGE_WHITE_FONT, HUGE_WHITE_FONT, LARGE_YELLOW_FONT, LARGE_GREEN_FONT, SMALL_WHITE_FONT*/
/*global ATTRIBUTE_LIST, PC_HP_PER_STR, PC_EVASION_PER_DEX, PC_MAX_MP_PER_INT, PC_ABILITY_POWER_PER_INT*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UICharacterMenu() {
	var startX = 36,
		startY = 100,
		width = 426 * 2;

	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	// Menu Sprite:
	this.menuSprite = gs.createSprite(startX, startY, 'SmallCharacterMenu', this.group);
	
	// PANELS:
	// ***************************************
	this.statPanel = new UIStatPanel(startX, startY, this.group);

	this.createAttributePanel(startX + 588, startY);
	this.talentPanel = new UITalentPanel(startX + 588, startY + 92, this.group);
	this.createEquipmentPanel(startX + 370 - 44, startY + 50);
	this.createInventoryPanel(startX + 346 - 44, startY + 230);
	
	// Rearanging abilities:
	// ***************************************
	this.abilityIndexOnCursor = -1;
	this.cursorSprite = gs.createSprite(0, 0, 'Tileset', this.group);
	this.cursorSprite.visible = false;
	
	// Moving items:
	this.cursorItemSlot = new ItemSlot();
	
	
	this.group.visible = false;
}

// CREATE_ATTRIBUTE_PANEL:
// ************************************************************************************************
UICharacterMenu.prototype.createAttributePanel = function (startX, startY) {
	
	// Panel Sprite:
	gs.createSprite(startX, startY, 'SkillPanel', this.group);
	
	// Line High Light:
	this.lineHighLight = gs.createSprite(0, 0, 'StatHighlight', this.group);
	this.lineHighLight.visible = false;
	
	// Title:
	let title = gs.createText(startX + 132, startY + 4, 'Attributes', 'PixelFont6-White', 18, this.group);
	title.setAnchor(0.5, 0);
	
	// Attribute Points:
	this.attributePointText = gs.createText(startX + 250, startY + 8, '0', 'PixelFont6-Yellow', 12, this.group);
	this.attributePointText.setAnchor(0.5, 0);
	
	// Skill Lines:
	this.attributeText = {};
	this.attributeValText = {};
	this.attributeButtons = {};
	
	
	ATTRIBUTE_LIST.forEach(function (attributeName, i) {
		let y = startY + 34 + i * 20;
		
		// Name Text:
		this.attributeText[attributeName] = gs.createText(startX + 8, y, '*' + attributeName, 'PixelFont6-White', 12, this.group);
		
		// Val Text:
		this.attributeValText[attributeName] = gs.createText(startX + 255, y, '0/0', 'PixelFont6-White', 12, this.group);
		this.attributeValText[attributeName].setAnchor(1, 0);
		
		// Button:
		this.attributeButtons[attributeName] = gs.createSmallButton(startX + 202, y - 12, 1316, this.onAttributeClicked, this, this.group);
		this.attributeButtons[attributeName].attributeName = attributeName;
	}, this);
	
	
};

// IS_POINTER_OVER_ATTRIBUTE:
// ************************************************************************************************
UICharacterMenu.prototype.isPointerOverAttribute = function (attributeName) {
	return game.input.activePointer.x > this.attributeText[attributeName].x
		&& game.input.activePointer.x < this.attributeText[attributeName].x + 263
		&& game.input.activePointer.y >= this.attributeText[attributeName].y - 2
		&& game.input.activePointer.y < this.attributeText[attributeName].y + 18;
};

// IS_POINTER_OVER_ATTRIBUTE_BUTTON:
// ************************************************************************************************
UICharacterMenu.prototype.isPointerOverAttributeButton = function () {
	return this.attributeButtons.strength.isPointerOver()
		|| this.attributeButtons.intelligence.isPointerOver()
		|| this.attributeButtons.dexterity.isPointerOver();
};

// CREATE_EQUIPMENT_PANEL:
// ************************************************************************************************
UICharacterMenu.prototype.createEquipmentPanel = function (startX, startY) {
	let centerX = startX + 50 * 2;
	
	// Equipment Title:
	let text = gs.createText(centerX, startY - 24, 'Equipment', 'PixelFont6-White', 18, this.group);
	text.setAnchor(0.5, 0);
	
	// Equipment:
	this.equipmentSlots = new UIItemSlotList(startX, startY, 4, 2, gs.pc.inventory.equipment.itemSlots, this.slotClicked, this, this.group, 7);
	
	// Encumberance Text:
	this.encText = gs.createText(startX, startY + 100, 'Encumberance: ', 'PixelFont6-White', 12, this.group);
	this.encText.inputEnabled = true;
	
	// Gold Text:
	this.goldText = gs.createText(startX, startY + 120, 'Gold: ', 'PixelFont6-White', 12, this.group);
};

// CREATE_INVENTORY_PANEL:
// ************************************************************************************************
UICharacterMenu.prototype.createInventoryPanel = function (startX, startY) {
	let centerX = startX + 50 * 2.5;
	
	// Inventory Title:
	let text = gs.createText(centerX, startY - 24, 'Inventory', 'PixelFont6-White', 18, this.group);
	text.setAnchor(0.5, 0);
	
	// Inventory:
	this.inventorySlots = new UIItemSlotList(startX, startY, INVENTORY_WIDTH, INVENTORY_HEIGHT, gs.pc.inventory.inventory.itemSlots, this.slotClicked, this, this.group);
};

// REFRESH:
// ************************************************************************************************
UICharacterMenu.prototype.refresh = function (deltaChar = null) {
	this.statPanel.refresh(deltaChar);
	this.talentPanel.refresh();
	this.refreshAttributePanel(deltaChar);
	this.refreshEquipmentPanel(deltaChar);
	
	// Inventory:
	this.inventorySlots.refresh();
};

// REFRESH_EQUIPMENT_PANEL:
// ************************************************************************************************
UICharacterMenu.prototype.refreshEquipmentPanel = function (deltaChar) {
	// Equipment Slots:
	this.equipmentSlots.refresh();
	
	let char = deltaChar || gs.pc;
	
	// Encumberance Text:
	this.encText.setText('Encumberance: ' + char.encumberance + '/' + char.maxEncumberance);
	
	if (gs.pc.race.name === 'Ogre') {
		this.encText.visible  = false;
		this.goldText.y = 250;
	}
	else {
		this.encText.visible = true;
		this.goldText.y = 270;
	}
	
	// Set Text Color:
	if (char.encumberance > char.maxEncumberance) {
		this.encText.setFont('PixelFont6-Red');
	}
	else {
		this.encText.setFont('PixelFont6-White');
	}
	
	// Delta Char +maxEnc:
	if (deltaChar && deltaChar.maxEncumberance != gs.pc.maxEncumberance) {
		let str = 'Encumberance: ' + gs.pc.encumberance + '/' + gs.pc.maxEncumberance;
		str += ' } ';
		str += deltaChar.encumberance + '/' + deltaChar.maxEncumberance;
		this.encText.setText(str);
	}
	
	// Gold Text:
	this.goldText.setText('Gold: ' + gs.pc.inventory.gold);
};


// REFRESH_ATTRIBUTE_PANEL:
// ************************************************************************************************
UICharacterMenu.prototype.refreshAttributePanel = function (deltaChar) {
	// Attribute Point Text:
	this.attributePointText.setText(gs.pc.attributePoints);
	if (gs.pc.attributePoints > 0) {
		this.attributePointText.setFont('PixelFont6-Yellow');
	}
	else {
		this.attributePointText.setFont('PixelFont6-White');
	}
	
	// Attribute Lines and Buttons:
	['strength', 'dexterity', 'intelligence'].forEach(function (attributeName) {
		this.attributeValText[attributeName].setFont('PixelFont6-White');
		
		if (deltaChar && deltaChar[attributeName] !== gs.pc[attributeName] && !this.isPointerOverAttributeButton()) {
			this.attributeValText[attributeName].setText(deltaChar[attributeName] + ' { ' + gs.pc[attributeName]);
			
			// Font Color:
			if (deltaChar[attributeName] < gs.pc[attributeName]) {
				this.attributeValText[attributeName].setFont('PixelFont6-Red');
			}
			else if (deltaChar[attributeName] > gs.pc[attributeName]) {
				this.attributeValText[attributeName].setFont('PixelFont6-Green');
			}
		}
		else {
			this.attributeValText[attributeName].setText(gs.pc[attributeName]);
		}
		
		// Get Base Attribute:
		let baseAttribute = gs.pc.baseAttributes[attributeName];
		baseAttribute += gs.classAttributes[gs.pc.characterClass][attributeName];
		baseAttribute += gs.pc.race.attributes[attributeName];
		
		// Display gain attribute button:
		if (gs.pc.attributePoints > 0 && baseAttribute < gs.pc.maxAttributes[attributeName] && this.cursorItemSlot.isEmpty()) {
			this.attributeButtons[attributeName].setVisible(true);
		}
		// Hide gain attribute button:
		else {
			this.attributeButtons[attributeName].setVisible(false);
		}
	}, this);
};

// UPDATE:
// ************************************************************************************************
UICharacterMenu.prototype.update = function () {
	// Rearanging abilities:
	if (this.abilityIndexOnCursor !== -1) {
		this.cursorSprite.visible = true;
		this.cursorSprite.frame = gs.pc.abilities.abilityInSlot(this.abilityIndexOnCursor).type.frame;
		this.cursorSprite.x = game.input.activePointer.x;
		this.cursorSprite.y = game.input.activePointer.y;
	}
	// Item on cursor:
	else if (this.cursorItemSlot.hasItem()) {
		this.cursorSprite.visible = true;
		this.cursorSprite.frame = this.cursorItemSlot.item.type.frame;
		this.cursorSprite.x = game.input.activePointer.x;
		this.cursorSprite.y = game.input.activePointer.y;
	}
	else {
		this.cursorSprite.visible = false;
	}
	
	this.statPanel.update();
	
	// Stat Comparison:
	// Any sub-system can set deltaChar and we will display the stat comparison at the end:
	this.deltaChar = null;
	this.talentStatComparison();
	this.equipmentStatComparison();
	this.attributeStatComparison();
	
	if (this.deltaChar) {
		this.deltaChar.updateStats();
		this.refresh(this.deltaChar);
	}
	else {
		this.refresh();
	}
	
	// Mouse over Attribute:
	this.lineHighLight.visible = false;
	ATTRIBUTE_LIST.forEach(function (attributeName) {
		if (this.isPointerOverAttribute(attributeName)) {
			this.lineHighLight.x = this.attributeText[attributeName].x - 6;
			this.lineHighLight.y = this.attributeText[attributeName].y - 4;
			this.lineHighLight.visible = true;
		}
	}, this);
	
	// Dropping an ability on the screen:
	if (this.abilityIndexOnCursor !== -1 && game.input.activePointer.isDown && !this.isPointerOverMenu()) {
		this.abilityIndexOnCursor = -1;
	}
	
	// Dropping an item on the screen:
	if (this.cursorItemSlot.hasItem() && game.input.activePointer.isDown && !this.isPointerOverMenu()) {
		let item = this.cursorItemSlot.item;
		
		if (item.getSound()) {
			gs.playSound(item.getSound(), gs.pc.tileIndex);
		}
		
		gs.pc.dropItem(item);
		this.cursorItemSlot.clear();
	}
	
	// Picking up an ability:
	let talentLine = this.talentPanel.getLineUnderPointer();
	if (game.input.activePointer.isDown && talentLine && !talentLine.button.isPointerOver() && this.abilityIndexOnCursor === -1) {
		let talent = talentLine.talent;
		
		if (talent.type.ability) {
			let abilityIndex = gs.pc.abilities.getAbilityIndex(talent.type.ability.name);
			this.abilityIndexOnCursor = abilityIndex;
		}
	}
	
	// Update Talent Panel:
	this.talentPanel.update();
};

// IS_POINTER_OVER_MENU:
// ************************************************************************************************
UICharacterMenu.prototype.isPointerOverMenu = function () {
	return (game.input.activePointer.x >= this.menuSprite.left
		&& game.input.activePointer.x <= this.menuSprite.right
		&& game.input.activePointer.y >= this.menuSprite.top
		&& game.input.activePointer.y <= this.menuSprite.bottom)
		|| game.input.activePointer.x >= HUD_START_X;
};

// ATTRIBUTE_STAT_COMPARISON:
// ************************************************************************************************
UICharacterMenu.prototype.attributeStatComparison = function () {
	// Strength:
	if (this.attributeButtons.strength.isPointerOver()) {
		this.deltaChar = this.createDeltaChar();
		this.deltaChar.baseAttributes.strength += 1;
	}
	// Dexterity:
	else if (this.attributeButtons.dexterity.isPointerOver()) {
		this.deltaChar = this.createDeltaChar();
		this.deltaChar.baseAttributes.dexterity += 1;
	}
	// Intelligence:
	else if (this.attributeButtons.intelligence.isPointerOver()) {
		this.deltaChar = this.createDeltaChar();
		this.deltaChar.baseAttributes.intelligence += 1;
	}
};

// TALENT_STAT_COMPARISON:
// ************************************************************************************************
UICharacterMenu.prototype.talentStatComparison = function () {
	// Handle Talent Mouse Over:
	let talentName = this.talentPanel.getUpgradeTalentNameUnderPointer();
	
	if (talentName && gs.pc.talents.canLearnTalent(talentName)) {
		// Copy:
		let deltaChar = this.createDeltaChar();
		
		// Delta:
		for (let i = 0; i < deltaChar.talents.talentList.length; i += 1) {
			if (deltaChar.talents.talentList[i].type.name === talentName) {
				deltaChar.talents.talentList[i].rank += 1;
			}
		}
		
		this.deltaChar = deltaChar;
	}
};

// EQUIPMENT_STAT_COMPARISON:
// ************************************************************************************************
UICharacterMenu.prototype.equipmentStatComparison = function () {
	// Get slot mouse over:
	let mouseOverSlot = this.getItemSlotUnderPointer();
	
	// Mouse over slot and item on mouse:
	if (mouseOverSlot && this.cursorItemSlot.hasItem() && mouseOverSlot.doesSlotMatch(this.cursorItemSlot.item.type.slot)) {
		let deltaChar = this.createDeltaChar();
		
		// Find the slot:
		let newSlot = null;
		
		// Equipment Slot:
		for (let i = 0; i < deltaChar.inventory.equipment.itemSlots.length; i += 1) {
			if (deltaChar.inventory.equipment.itemSlots[i] === mouseOverSlot) {
				deltaChar.inventory.equipment.itemSlots[i] = Object.create(mouseOverSlot);
				newSlot = deltaChar.inventory.equipment.itemSlots[i];
			}
		}
		
		// Primary Slot:
		if (gs.pc.inventory.meleeSlot === mouseOverSlot) {
			deltaChar.inventory.meleeSlot = Object.create(mouseOverSlot);
			newSlot = deltaChar.inventory.meleeSlot;
		}
		
		// Range Slot:
		if (gs.pc.inventory.rangeSlot === mouseOverSlot) {
			deltaChar.inventory.rangeSlot = Object.create(mouseOverSlot);
			newSlot = deltaChar.inventory.rangeSlot;
		}
		
		if (newSlot) {
			newSlot.item = this.cursorItemSlot.item;
			this.deltaChar = deltaChar;
		}	
	}
};

// CREATE_DELTA_CHAR:
// ************************************************************************************************
UICharacterMenu.prototype.createDeltaChar = function () {
	let deltaChar = Object.create(gs.pc);
	
	// Must copy these obj stats:
	deltaChar.resistance = Object.create(gs.pc.resistance);
	deltaChar.damageShield = Object.create(gs.pc.damageShield);
	
	// Copies of inventory:
	deltaChar.inventory = Object.create(gs.pc.inventory);
	deltaChar.inventory.equipment = Object.create(gs.pc.inventory.equipment);
	deltaChar.inventory.equipment.itemSlots = Object.create(deltaChar.inventory.equipment.itemSlots);
	
	deltaChar.inventory.meleeSlot = Object.create(deltaChar.inventory.meleeSlot);
	deltaChar.inventory.rangeSlot = Object.create(deltaChar.inventory.rangeSlot);
	
	// Copies of talents:
	deltaChar.talents = Object.create(gs.pc.talents);
	deltaChar.talents.talentList = [];
	for (let i = 0; i < gs.pc.talents.talentList.length; i += 1) {
		let talent = new Talent(gs.pc.talents.talentList[i].type.name);
		talent.rank = gs.pc.talents.talentList[i].rank;
		deltaChar.talents.talentList.push(talent);
	}
	
	// Copies of status effects:
	deltaChar.statusEffects = Object.create(gs.pc.statusEffects);
	deltaChar.statusEffects.character = deltaChar;
	
	// Copies of attributes:
	deltaChar.baseAttributes = {};
	ATTRIBUTE_LIST.forEach(function (attributeName) {
		deltaChar.baseAttributes[attributeName] = gs.pc.baseAttributes[attributeName];
	}, this);

	
	return deltaChar;
};

// ON_ATTRIBUTE_CLICKED:
// ************************************************************************************************
UICharacterMenu.prototype.onAttributeClicked = function (attributeButton) {
	let attributeName = attributeButton.attributeName;
	
	if (!gs.pc.isAlive) {
		return;
	}
	
	// Get Base Attribute:
	let baseAttribute = gs.pc.baseAttributes[attributeName];
	baseAttribute += gs.classAttributes[gs.pc.characterClass][attributeName];
	baseAttribute += gs.pc.race.attributes[attributeName];
	
	if (gs.pc.attributePoints > 0 && baseAttribute < gs.pc.maxAttributes[attributeName]) {
		gs.pc.attributePoints -= 1;
		gs.playSound(gs.sounds.point);
		
		gs.pc.gainAttribute(attributeName);
		
		this.refresh();
	}
};



// SLOT_CLICKED:
// ************************************************************************************************
UICharacterMenu.prototype.slotClicked = function (slot) {
	if (!gs.pc.isAlive) {
		return;
	}
	
	if (this.abilityIndexOnCursor !== -1) {
		return;
	}
	
	let equipmentSlots = EQUIPMENT_SLOTS.concat([ITEM_SLOT.PRIMARY, ITEM_SLOT.RANGE]);
	let endTurn = false;
								   
	// Pick up item:
	if (slot.hasItem() && this.cursorItemSlot.isEmpty()) {
		this.cursorItemSlot.addItem(slot.item);
		slot.removeItem();
		gs.pc.updateStats();
		
		// Unequip Item:
		if (util.inArray(slot.itemSlotType, equipmentSlots)) {
			gs.pc.onUnequipItem(this.cursorItemSlot.item);
		}
	}
	// Place Item:
	//else if (this.cursorItemSlot.hasItem() && slot.isEmpty() && (!slot.itemSlotType || slot.itemSlotType === this.cursorItemSlot.item.type.slot)) {
	else if (this.cursorItemSlot.hasItem() && slot.isEmpty() && slot.doesSlotMatch(this.cursorItemSlot.item.type.slot)) {
		slot.addItem(this.cursorItemSlot.item);
		this.cursorItemSlot.clear();
		gs.pc.updateStats();
		
		// Equip Item:
		if (util.inArray(slot.itemSlotType, equipmentSlots)) {
			gs.pc.onEquipItem(slot.item);
			endTurn = true;
		}
	}
	// Swap Item:
	///else if (this.cursorItemSlot.hasItem() && (!slot.itemSlotType || slot.itemSlotType === this.cursorItemSlot.item.type.slot)) {
	else if (this.cursorItemSlot.hasItem() && slot.doesSlotMatch(this.cursorItemSlot.item.type.slot)) {
		// Unequip Item:
		let tempItem = slot.item;
		slot.removeItem();
		gs.pc.updateStats();
		if (util.inArray(slot.itemSlotType, equipmentSlots)) {
			gs.pc.onUnequipItem(tempItem);
		}
		
		// Equip Item:
		slot.addItem(this.cursorItemSlot.item);
		gs.pc.updateStats();
		this.cursorItemSlot.clear();
		this.cursorItemSlot.addItem(tempItem);
		if (util.inArray(slot.itemSlotType, equipmentSlots)) {
			gs.pc.onEquipItem(slot.item);
			endTurn = true;
		}
	}
	
	// Ending Turn:
	// Will close menu if nearby danger
	if (endTurn) {
		gs.pc.endTurn(ACTION_TIME);
		
		if (gs.isNearbyDanger()) {
			gs.stateManager.popState();
		}
	}
	
	// Checking for no longer flying:
	if (!gs.pc.isFlying && gs.isPit(gs.pc.tileIndex)) {
		if (gs.stateManager.isCurrentState('CharacterMenu')) {
			gs.stateManager.popState();
		}
			
		gs.pc.fallDownPit();
	}
	
	this.refresh();
	gs.HUD.refresh();
};

// OPEN:
// ************************************************************************************************
UICharacterMenu.prototype.open = function () {
	gs.pc.stopExploring();
	gs.pc.updateStats();
	this.refresh();
	this.group.visible = true;
	gs.playSound(gs.sounds.scroll);
};

// CLOSE:
// ************************************************************************************************
UICharacterMenu.prototype.close = function () {
	this.group.visible = false;
	
	gs.playSound(gs.sounds.scroll);
	
	this.deltaChar = null;
	
	if (this.abilityIndexOnCursor !== -1) {
		gs.HUD.abilityBar.addAbility(this.abilityIndexOnCursor);
		this.abilityIndexOnCursor = -1;
	}

	if (this.cursorItemSlot.hasItem()) {
		gs.pc.inventory.addItem(this.cursorItemSlot.item, false);
		this.cursorItemSlot.clear();
	}
	
	// Encumbered will set MvP to 0:
	if (gs.pc.isEncumbered) {
		gs.pc.currentSp = 0;
	}
};

// GET_DESC_UNDER_POINTER:
// ************************************************************************************************
UICharacterMenu.prototype.getDescUnderPointer = function () {
	// ENCUMBERANCE:
	if (this.encText.input.checkPointerOver(game.input.activePointer)) {
		return this.statPanel.getStatDesc('Encumberance');
	}
	
	// INVENTORY_ITEMS:
	if (this.inventorySlots.getItemUnderPointer()) {
		return this.inventorySlots.getItemUnderPointer().toLongDesc();
	}
	
	// EQUIPMENT_ITEMS:
	if (this.equipmentSlots.getItemUnderPointer()) {
		return this.equipmentSlots.getItemUnderPointer().toLongDesc();
	}
	
	// STAT_PANEL:
	if (this.statPanel.getDescUnderPointer()) {
		return this.statPanel.getDescUnderPointer();
	}
	
	// TALENT_PANEL:
	if (this.talentPanel.getDescUnderPointer()) {
		return this.talentPanel.getDescUnderPointer();
	}
	
	// ATTRIBUTE_BONUS:
	if (this.getAttributeBonusDescUnderPointer()) {
		return this.getAttributeBonusDescUnderPointer();
	}
	
	// ATTRIBUTES:
	if (this.getAttributeDescUnderPointer()) {
		return this.getAttributeDescUnderPointer();
	}
	

	return null;
};

// GET_ATTRIBUTE_BONUS_DESC_UNDER_POINTER:
// ************************************************************************************************
UICharacterMenu.prototype.getAttributeBonusDescUnderPointer = function () {
	for (let i = 0; i < ATTRIBUTE_LIST.length; i += 1) {
		if (this.attributeButtons[ATTRIBUTE_LIST[i]].isPointerOver()) {
			let attributeName = ATTRIBUTE_LIST[i];
			let desc = {title: 'Improve ' + attributeName, text: ''};
			
			// Show Desc:
			desc.text += gs.pc.getAttributeDesc(attributeName);
			
			return desc;
		}
	}
			
	return null;
};

// GET_ATTRIBUTE_DESC_UNDER_POINTER:
// ************************************************************************************************
UICharacterMenu.prototype.getAttributeDescUnderPointer = function () {
	for (let i = 0; i < ATTRIBUTE_LIST.length; i += 1) {
		if (this.isPointerOverAttribute(ATTRIBUTE_LIST[i])) {
			let attributeName = ATTRIBUTE_LIST[i];
			let desc = {title: attributeName, text: ''};
			
			
		
			
			// Strength:
			if (attributeName === 'strength') {
				let strength = gs.pc[attributeName];
				
				// Hit Points:
				let maxHp = (strength - 10) * PC_HP_PER_STR[gs.pc.race.name];
				desc.text += '*Hit Points: ' + util.toSignStr(maxHp) + maxHp + '\n';
				
				// Melee Damage:
				let meleeDamage = (strength - 10);
				desc.text += '*Melee Damage: ' + util.toSignStr(meleeDamage) + meleeDamage + '\n';
				
				// Encumberance:
				let enc = strength;
				desc.text += '*Encumberance: ' + enc + '\n';
			}
			// Dexterity:
			else if (attributeName === 'dexterity') {
				let dexterity = gs.pc[attributeName];
				
				// Speed Points:
				let maxSp = (dexterity - 10);
				desc.text += '*Speed Points: ' + util.toSignStr(maxSp) + maxSp + '\n';
				
				// Range Damage:
				let rangeDamage = (dexterity - 10);
				desc.text += '*Range Damage: ' + util.toSignStr(rangeDamage) + rangeDamage + '\n';
				
				// Evasion:
				let evasion = (dexterity - 10) * PC_EVASION_PER_DEX[gs.pc.race.name];
				desc.text += '*Evasion: ' + util.toSignStr(evasion) + util.toPercentStr(evasion) + '\n';
				
				
			}
			// Intellignce:
			else if (attributeName === 'intelligence') {
				let intelligence = gs.pc[attributeName];
				
				// Mana Points:
				let maxMp = (intelligence - 10) * PC_MAX_MP_PER_INT;
				desc.text += '*Mana Points: ' + util.toSignStr(maxMp) + maxMp + '\n';
				
				// Staff Damage:
				let staffDamage = (intelligence - 10);
				desc.text += '*Staff Damage: ' + util.toSignStr(staffDamage) + staffDamage + '\n';
				
				// Ability power:
				let abilityPower = (intelligence - 10) * PC_ABILITY_POWER_PER_INT[gs.pc.race.name];
				desc.text += '*Ability Power: ' + util.toSignStr(abilityPower) + util.toPercentStr(abilityPower) + '\n';
			}
			
			// Show Max:
			desc.text += '\n';
			desc.text += 'Based on your class and race your max ' + attributeName + ' is ' + gs.pc.maxAttributes[attributeName] + '.';
	
			
			return desc;	
		}
	}
	
	return null;
};

// GET_ITEM_SLOT_UNDER_POINTER:
// ************************************************************************************************
UICharacterMenu.prototype.getItemSlotUnderPointer = function () {
	// INVENTORY_ITEMS:
	if (this.inventorySlots.getItemSlotUnderPointer()) {
		return this.inventorySlots.getItemSlotUnderPointer();
	}
	
	// EQUIPMENT_ITEMS:
	if (this.equipmentSlots.getItemSlotUnderPointer()) {
		return this.equipmentSlots.getItemSlotUnderPointer();
	}
	
	// PRIMARY_SLOT:
	if (gs.HUD.meleeSlot.isPointerOver()) {
		return gs.HUD.meleeSlot.itemSlot;
	}
	
	// RANGE_SLOT:
	if (gs.HUD.rangeSlot.isPointerOver()) {
		return gs.HUD.rangeSlot.itemSlot;
	}
	
	// CONSUMABLES:
	if (gs.HUD.consumableList.getItemSlotUnderPointer()) {
		return gs.HUD.consumableList.getItemSlotUnderPointer();
	}
};