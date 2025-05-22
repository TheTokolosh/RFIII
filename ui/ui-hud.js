/*global game, gs, Phaser, util, input*/
/*global PlayerTargeting*/
/*global SCREEN_HEIGHT, TILE_SIZE, SCALE_FACTOR, HUD_START_X*/
/*global INVENTORY_SIZE, LARGE_RED_FONT, LARGE_WHITE_FONT, SMALL_WHITE_FONT, MAX_STATUS_EFFECTS, LARGE_WHITE_FONT, FONT_NAME*/
/*global UIMap, UIAbilityBar, UIItemSlot, UIItemSlotList, NUM_EQUIPMENT_SLOTS, SCREEN_WIDTH*/
/*global MINI_MAP_SIZE_X, MINI_MAP_TILE_SIZE, MAX_COLD_LEVEL, PC_MAX_LEVEL, AMBIENT_COLD_RESISTANCE*/
/*global POISON_BAR_FRAME, CHARACTER_BUTTON_GREEN_FRAME, GREEN_TARGET_BOX_FRAME*/
/*global HEALTH_BAR_FRAME, MANA_BAR_FRAME, FOOD_BAR_FRAME, EXP_BAR_FRAME, SLOT_SELECT_BOX_FRAME, COLD_BAR_FRAME, HUGE_WHITE_FONT, LARGE_BOLD_WHITE_FONT*/
/*global CHARACTER_BUTTON_FRAME, CLOSE_BUTTON_FRAME, OPTIONS_BUTTON_FRAME, SOUND_ON_BUTTON_FRAME, MUSIC_ON_BUTTON_FRAME*/
/*global QUIT_BUTTON_FRAME, EXPLORE_BUTTON_FRAME, SOUND_OFF_BUTTON_FRAME, MUSIC_OFF_BUTTON_FRAME*/
/*global WEAPON_HOT_BAR_WIDTH, WEAPON_HOT_BAR_HEIGHT*/
/*global CONSUMABLE_HOT_BAR_WIDTH, CONSUMABLE_HOT_BAR_HEIGHT*/
/*global HIT_POINTS_DESC, MANA_POINTS_DESC, SPEED_POINTS_DESC, FOOD_POINTS_DESC*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// HUD_CONSTRUCTOR:
// ************************************************************************************************
function HUD() {
	var i, startX = HUD_START_X, width = SCREEN_WIDTH - startX, x, y;
	
	// Group:
	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	// Background Sprite:
	this.menu = gs.createSprite(HUD_START_X, 0, 'HUD', this.group);
	//this.menu.visible = false;
	
	// Red Border:
	this.redBorder = gs.createSprite(0, 0, 'RedBorder', this.group);
	
	this.createBars();
	
	// Dungeon Level Text:
    this.zoneLevelText = gs.createText(HUD_START_X / 2, 2, '', 'PixelFont6-White', 12, this.group);
	this.zoneLevelText.setAnchor(0.5, 0);
	
	// Mini Map:
	this.miniMap = new UIMap(startX + (width - (MINI_MAP_SIZE_X * MINI_MAP_TILE_SIZE)) / 2, 60, this.group);
	
	// Buttons:
	y = 64;
	this.upStairsButton = 		gs.createSmallButton(startX + 8, y + 0 * 28, 1299, this.onUpStairsClicked, this, this.group);
	this.downStairsButton = 	gs.createSmallButton(startX + 8, y + 1 * 28, 1297, this.onDownStairsClicked, this, this.group);
	this.gotoButton =			gs.createSmallButton(startX + 8, y + 2 * 28, 1329, this.onGotoMenuClicked, this, this.group);
	this.exploreButton = 		gs.createSmallButton(startX + 8, y + 3 * 28, EXPLORE_BUTTON_FRAME, this.exploreClicked, this, this.group);
	this.characterMenuButton = 	gs.createSmallButton(startX + 8, y + 4 * 28, CHARACTER_BUTTON_FRAME, this.characterMenuClicked, this, this.group);
	this.menuButton = 			gs.createSmallButton(startX + 8, y + 5 * 28, 1228, this.onMenuClicked, this, this.group);
	
	// Chat Log:
	y = 312;
	this.chatLogTitle = gs.createText(startX + 6, y, '', 'PixelFont6-White', 12, this.group);
	this.chatLogText = gs.createText(startX + 6, y + 22, '', 'PixelFont6-White', 12, this.group);
	this.chatLogText.maxWidth = 350;
	
	y = 80;
	
	// Primary Weapon Slot:
	this.meleeSlot = new UIItemSlot(startX + 204 - 50 - 25, 436 + y, gs.pc.inventory.meleeSlot, 1289, this.weaponSlotClicked, this, this.group);
	this.meleeSlotBar = gs.createSprite(this.meleeSlot.x - 82, this.meleeSlot.y + 26, 'DamageTextBar', this.group);
	this.meleeSlotText = gs.createText(this.meleeSlotBar.x + 41, this.meleeSlotBar.y + 4, 'Weapon Damage: 10', 'PixelFont6-White', 12, this.group);
	this.meleeSlotText.setAnchor(0.5, 0);
		
	// Range Weapon Slot:
	this.rangeSlot = new UIItemSlot(startX + 204 - 25, 436 + y, gs.pc.inventory.rangeSlot, 1290, this.weaponSlotClicked, this, this.group);
	this.rangeSlotBar = gs.createSprite(this.rangeSlot.x + 46, this.rangeSlot.y + 26, 'DamageTextBar', this.group);
	this.rangeSlotText = gs.createText(this.rangeSlotBar.x + 41, this.rangeSlotBar.y + 4, 'Weapon Damage: 10', 'PixelFont6-White', 12, this.group);
	this.rangeSlotText.setAnchor(0.5, 0);
	
	
	// Ability Bar:
	this.abilityBar = new UIAbilityBar(startX + 4, 488 + y, 7, 1, this.group);
	
	
	// Consumable List:
	this.consumableList = new UIItemSlotList(startX + 4, 538 + y, CONSUMABLE_HOT_BAR_WIDTH, CONSUMABLE_HOT_BAR_HEIGHT, gs.pc.inventory.consumableHotBar.itemSlots, this.consumableSlotClicked, this, this.group);
	
	// Consumable Slot Selector:
	this.consumableSlotSelector = gs.createSprite(0, 0, 'UISlot', this.group);
	this.consumableSlotSelector.frame = SLOT_SELECT_BOX_FRAME;
	this.consumableSlotSelector.visible = true;
	
	// State Text:
	this.stateText = gs.createText(HUD_START_X / 2, 32, 'STATE', 'PixelFont6-White', 18, this.group);
	this.stateText.setAnchor(0.5, 0);
	this.stateText.visible = false;
	
	// Status Effects:
	this.statusEffectText = [];
	this.statusEffectGroup = game.add.group();
	for (i = 0; i < MAX_STATUS_EFFECTS; i += 1) {
		this.statusEffectText[i] = gs.createText(6, 4 + i * 20, '',  'PixelFont6-White', 12, this.statusEffectGroup);
		this.statusEffectText[i].inputEnabled = true;
	}
	this.group.add(this.statusEffectGroup);
	
	// DebugText:
	this.debugText = gs.createText(5, SCREEN_HEIGHT - 2, '', 'PixelFont6-White', 12, this.group);
	this.debugText.setAnchor(0, 1);
	
	//this.debugText.visible = false;
	//this.zoneLevelText.visible = false;
	
	this.group.visible = false;
	
	// Can disable refresh during game creation/loading:
	this.allowRefresh = true;
}

// CREATE_BARS:
// ************************************************************************************************
HUD.prototype.createBars = function () {
	// Left Bars:
	this.hpBar = gs.createBar(HUD_START_X + 26, 4, HEALTH_BAR_FRAME, this.group);
	this.foodBar = gs.createBar(HUD_START_X + 26, 30, FOOD_BAR_FRAME, this.group);
	
	// Right Bars
	this.mpBar = gs.createBar(SCREEN_WIDTH - 132 - 18, 4, MANA_BAR_FRAME, this.group);
	this.spBar = gs.createBar(SCREEN_WIDTH - 132 - 18, 30, 1188, this.group);
	
	// EXP_BAR:
	this.expBarFrame = gs.createSprite(HUD_START_X + 160, 4, 'EXPBar', this.group);
	this.expBarFrame.inputEnabled = true;
	this.expBar = gs.createSprite(HUD_START_X + 162, 52, 'Tileset', this.group);
	this.expBar.frame = 1193;
	this.XLText = gs.createText(HUD_START_X + 180, 12, '1', 'PixelFontOutline6-White', 14, this.group);
	this.XLText.setAnchor(0.5, 0);
	this.expBarText = gs.createText(HUD_START_X + 180, 36, '50%', 'PixelFontOutline6-White', 14, this.group);
	this.expBarText.setAnchor(0.5, 0);
	
	
	
	this.rageBar = gs.createBar(HUD_START_X - 132, 4, FOOD_BAR_FRAME, this.group);
	this.coldBar = gs.createBar(HUD_START_X - 132, 30, COLD_BAR_FRAME, this.group);
	
	
	this.poisonBar = gs.createSprite(HUD_START_X + 10, 6, 'Tileset', this.hpBar.group);
	this.poisonBar.frame = POISON_BAR_FRAME;
	this.hpBar.group.moveUp(this.hpBar.text.text);
};

// REFRESH:
// ************************************************************************************************
HUD.prototype.refresh = function () {
	// Game has not started yet:
	if (!gs.zoneName || !this.allowRefresh) {
		return;
	}
	
	if (gs.pc.currentHp <= gs.pc.maxHp * 0.25) {
		this.menu.frame = 1;
		this.redBorder.visible = true;
	}
	else {
		this.menu.frame = 2;
		this.redBorder.visible = false;
	}
	
	
	
	// Refresh Item Slots:
	this.meleeSlot.refresh();
	this.rangeSlot.refresh();
	
	// Refresh Item Lists:
	this.consumableList.refresh();

	// Refresh sub-systems:
	this.abilityBar.refresh();
	this.refreshWeaponText(gs.characterMenu.deltaChar);
	this.refreshSlotSelectors();
	this.refreshStateText();
	this.refreshDebugText();
	this.refreshChatLog();
	this.refreshBars();
	this.refreshStatusEffects();
	this.refreshZoneTitle();
	
	this.miniMap.update();
};

// REFRESH_WEAPON_TEXT:
// ************************************************************************************************
HUD.prototype.refreshWeaponText = function (deltaChar) {	
	let dmgStr = '';

	// Melee Weapon:
	let weapon = gs.pc.inventory.getPrimaryWeapon();
	this.meleeSlotText.setFont('PixelFont6-White');
	dmgStr = gs.pc.weaponDamage(weapon) + ' DMG';
	
	if (deltaChar) {
		let deltaWeapon = deltaChar.inventory.getPrimaryWeapon();
		
		if (gs.pc.weaponDamage(weapon) !== deltaChar.weaponDamage(deltaWeapon)) {
			dmgStr = deltaChar.weaponDamage(deltaWeapon) + ' DMG';
					
			// Positive Text Color (Green):
			if (gs.pc.weaponDamage(weapon) < deltaChar.weaponDamage(deltaWeapon)) {
				this.meleeSlotText.setFont('PixelFont6-Green');
			}
			// Negative Text Color (Red):
			else {
				this.meleeSlotText.setFont('PixelFont6-Red');
			}
		}	
	}
	this.meleeSlotText.setText(dmgStr);
	
	
	
	
	
	// Range Weapon:
	weapon = gs.pc.inventory.getRangeWeapon();
	this.rangeSlotText.setFont('PixelFont6-White');
	if (weapon) {
		dmgStr = gs.pc.weaponDamage(weapon) + ' DMG';
		
		if (deltaChar) {
			if (gs.pc.weaponDamage(weapon) !== deltaChar.weaponDamage(deltaChar.inventory.getRangeWeapon())) {
				dmgStr = deltaChar.weaponDamage(deltaChar.inventory.getRangeWeapon()) + ' DMG';

				// Positive:
				if (gs.pc.weaponDamage(weapon) < deltaChar.weaponDamage(deltaChar.inventory.getRangeWeapon())) {
					this.rangeSlotText.setFont('PixelFont6-Green');
				}
				// Negative:
				else {
					this.rangeSlotText.setFont('PixelFont6-Red');
				}

			}	
		}
		
		this.rangeSlotText.setText(dmgStr);
		this.rangeSlotText.visible = true;
		

	}
	else {
		this.rangeSlotText.visible = false;
	}
};



// REFRESH_SLOT_SELECTORS:
// ************************************************************************************************
HUD.prototype.refreshSlotSelectors = function () {
	// Show consumable slot selector:
	if (gs.pc.selectedItem) {
		this.consumableSlotSelector.visible = true;
		this.consumableSlotSelector.x = this.consumableList.uiItemSlots[gs.pc.inventory.consumableHotBar.itemSlotIndex(gs.pc.selectedItem)].x;
		this.consumableSlotSelector.y = this.consumableList.uiItemSlots[gs.pc.inventory.consumableHotBar.itemSlotIndex(gs.pc.selectedItem)].y;
	}
	else {
		this.consumableSlotSelector.visible = false;
	}
};

// REFRESH_STATE_TEXT:
// ************************************************************************************************
HUD.prototype.refreshStateText = function () {
	this.stateText.visible = false;
	
	// Stairs:
	let stairsObj = gs.getObj(gs.pc.tileIndex, ['DownStairs', 'UpStairs']);
	if (stairsObj) {
		this.stateText.setText('To ' + gs.niceZoneName(stairsObj.toZoneName, stairsObj.toZoneLevel));
		this.stateText.visible = true;
	}
	
	// Pit:
	if (gs.isPit(gs.pc.tileIndex)) {
		this.stateText.setText('Use s or > to descend into pit');
		this.stateText.visible = true;
	}
	
	// Use Ability:
	if (gs.stateManager.isCurrentState('UseAbility')) {
		let str = gs.pc.selectedAbility.type.niceName;
		
		if (gs.pc.selectedAbility.type.attributes.damage) {
			str += ' ' + gs.pc.selectedAbility.type.attributes.damage.value(gs.pc) + ' DMG';
		}
		
		this.stateText.setText(str);
		this.stateText.visible = true;
	}
};

// REFRESH_CHAT_LOG:
// ************************************************************************************************
HUD.prototype.refreshChatLog = function () {
	var desc = this.getDescUnderPointer() || {title: '', text: ''},
		lines;
	
	// Set title:
	this.chatLogTitle.setText(desc.title || '');
	
	// Color title:
	desc.font = desc.font || 'PixelFont6-White';
	this.chatLogTitle.setFont(desc.font);
	
	// FONT TESTING:
	/*
	desc.text = '';
	desc.text += '10 x Scroll of Enchantment\n';
	desc.text += '1234567890\n';
	desc.text += 'abcdefghigklmnop\n';
	desc.text += 'qrstuvwxyz\n';
	desc.text = 'Sphinx of black quartz, judge my vow. 1234567890. Damage: 10-14. Damage bonus: +9 [6]. Exploration Complete!';
	*/
	
	
	
	this.chatLogText.setText(desc.text);
};

// REFRESH_DEBUG_TEXT:
// ************************************************************************************************
HUD.prototype.refreshDebugText = function () {
	if (gs.debugProperties.showDebugText) {
		let str, tileIndex;
		
		if (this.miniMap.isPointerOver()) {
			tileIndex = this.miniMap.indexUnderPointer();
		}
		else {
			tileIndex = gs.pointerTileIndex();
		}
		
		str = '';
		str += 'X: ' + tileIndex.x;
		str += ', Y: ' + tileIndex.y;
		str += ', T: ' + gs.turn;
		str += ', FPS: ' + game.time.fps || '--';
		
		// Testing:
		//str += ', ' + gs.isRayShootable(gs.pc.tileIndex, gs.characterList[1].tileIndex);
		//str += ', ' + gs.isRayShootable(gs.characterList[1].tileIndex, gs.pc.tileIndex);
		
		
		this.debugText.setText(str);
	}
	else {
		this.debugText.visible = false;
	}
	
};


// REFRESH_BARS:
// ************************************************************************************************
HUD.prototype.refreshBars = function () {
	// Update Text:
	
	this.hpBar.setText('HP: ' + gs.pc.currentHp + '/' + gs.pc.maxHp);
	this.mpBar.setText('MP: ' + gs.pc.currentMp + '/' + gs.pc.maxMp);
	this.foodBar.setText('FD: ' + gs.pc.currentFood + '/' + gs.pc.maxFood);
	this.coldBar.setText('COLD: ' + gs.pc.coldLevel + '/' + MAX_COLD_LEVEL);
	this.rageBar.setText('RAGE: ' + gs.pc.rage + '/' + gs.pc.maxRage);
	this.spBar.setText('SP: ' + gs.pc.currentSp + '/' + gs.pc.maxSp);
	
	// Update Bars:
	this.mpBar.setPercent(gs.pc.currentMp / gs.pc.maxMp);
	this.foodBar.setPercent(gs.pc.currentFood / gs.pc.maxFood);
	this.coldBar.setPercent(gs.pc.coldLevel / MAX_COLD_LEVEL);
	this.rageBar.setPercent(gs.pc.rage / gs.pc.maxRage);
	this.spBar.setPercent(gs.pc.currentSp / gs.pc.maxSp);
	
	// Exp Bar:
	this.XLText.setText(gs.pc.level);
	this.expBarText.setText(gs.pc.expPercent() + '%');
	if (gs.pc.expPercent() === 0) {
		this.expBar.visible = false;
	}
	else {
		this.expBar.visible = true;
		this.expBar.scale.setTo(SCALE_FACTOR, gs.pc.expPercent() * 0.01 * -23 * SCALE_FACTOR);
	}
	
	// Hide EXP Text at XL:16
	if (gs.pc.level === 16) {
		this.expBarText.visible = false;
		this.expBar.visible = false;
	}
	else {
		this.expBarText.visible = true;
	}
	
	// SHOW OR HIDE BARS:
	this.rageBar.setVisible(false);
	this.coldBar.setVisible(false);
	
	let activeBars = [];
	
	if (gs.pc.maxRage) {
		activeBars.push('rageBar');
	}
	
	if (gs.zoneType().isCold && gs.pc.resistance.Cold < AMBIENT_COLD_RESISTANCE) {
		activeBars.push('coldBar');
	}
		
	for (let i = 0; i < activeBars.length; i += 1) {
		this[activeBars[i]].setVisible(true);
		this[activeBars[i]].setPosition(HUD_START_X - 132, 2 + i * 26);
	}
	

	// Update Bar Scale:
	this.hpBar.bar.scale.setTo(Math.max(0, Math.floor((gs.pc.currentHp / gs.pc.maxHp) * 62) * SCALE_FACTOR), SCALE_FACTOR);
	
	// Poison Bar:
	if (gs.pc.poisonDamage > 0) {
		this.poisonBar.visible = true;
		this.poisonBar.x = this.hpBar.bar.x + Math.max(0, Math.floor(((gs.pc.currentHp - gs.pc.poisonDamage) / gs.pc.maxHp) * 62) * SCALE_FACTOR);
		this.poisonBar.scale.setTo(Math.max(0, Math.ceil((gs.pc.poisonDamage / gs.pc.maxHp) * 62) * SCALE_FACTOR), SCALE_FACTOR);
	}
	else {
		this.poisonBar.visible = false;
	}
	
	// Update Text Color:
	this.hpBar.text.setFont(gs.pc.currentHp < gs.pc.maxHp / 4 		? 'PixelFontOutline6-Red' : 'PixelFontOutline6-White');
	this.mpBar.text.setFont(gs.pc.currentMp < gs.pc.maxMp / 4 		? 'PixelFontOutline6-Red' : 'PixelFontOutline6-White');
	this.foodBar.text.setFont(gs.pc.currentFood <= 3 				? 'PixelFontOutline6-Red' : 'PixelFontOutline6-White');
    this.coldBar.text.setFont(gs.pc.coldLevel === MAX_COLD_LEVEL 	? 'PixelFontOutline6-Red' : 'PixelFontOutline6-White');
	
	if (gs.pc.statusEffects.has('Slow') || gs.pc.isEncumbered) {
		this.spBar.text.setFont('PixelFontOutline6-Red');
	}
	else {
		this.spBar.text.setFont('PixelFontOutline6-White');
	}
	
	
	// Mummy has no food:
	if (gs.pc.race && gs.pc.race.name === 'Mummy') {
		this.foodBar.setVisible(false);
	}
	else {
		this.foodBar.setVisible(true);
	}
};

// REFRESH_STATUS_EFFECTS:
// ************************************************************************************************
HUD.prototype.refreshStatusEffects = function () {
	var i, j = 0;

	for (i = 0; i < gs.pc.statusEffects.list.length; i += 1) {
		if (!gs.pc.statusEffects.list[i].dontShowOnHUD) {
			this.statusEffectText[j].visible = true;
			this.statusEffectText[j].setText(gs.pc.statusEffects.list[i].toShortDesc());
			j += 1;
		}
	}
	
	// Show it poisoned:
	if (gs.pc.poisonDamage > 0) {
		this.statusEffectText[j].setText('Poisoned');
		this.statusEffectText[j].visible = true;
		j += 1;
	}
	
	// Show is asleep:
	if (gs.pc.isAsleep) {
		this.statusEffectText[j].setText('Sleeping');
		this.statusEffectText[j].visible = true;
		j += 1;
	}
	
	// Show is hungry:
	if (gs.pc.isHungry()) {
		this.statusEffectText[j].setText('Hungry');
		this.statusEffectText[j].visible = true;
		j += 1;
	}

	// Show levitation timer:
	if (gs.pc.levitationTimer > 0) {
		this.statusEffectText[j].setText('Levitating: ' + (11 - gs.pc.levitationTimer));
		this.statusEffectText[j].visible = true;
		j += 1;
	}
	
	// Hide remaining status effect text:
	for (j = j; j < MAX_STATUS_EFFECTS; j += 1) {
		this.statusEffectText[j].visible = false;
	}
	
	// Highlight if mouse over:
	for (let i = 0; i < MAX_STATUS_EFFECTS; i += 1) {
		if (i < this.statusEffectText.length && this.statusEffectText[i].input.checkPointerOver(game.input.activePointer)) {
			this.statusEffectText[i].setText('[' + this.statusEffectText[i].text.text + ']');
		}
	}
	
	// Status Effect Caster Sprite:
	for (let i = 0; i < MAX_STATUS_EFFECTS; i += 1) {
		if (i < gs.pc.statusEffects.list.length && this.statusEffectText[i].input.checkPointerOver(game.input.activePointer)) {
			if (gs.pc.statusEffects.list[i].casterId) {
				let caster = gs.getCharWithID(gs.pc.statusEffects.list[i].casterId);
				gs.targetSprites.create(caster.tileIndex, GREEN_TARGET_BOX_FRAME);
			}
		}
	}
};


// REFRESH_ZONE_TITLE:
// ************************************************************************************************
HUD.prototype.refreshZoneTitle = function () {
	let str = gs.niceZoneName() + ' [' + gs.timeToString(gs.gameTime()) + ']';
	this.zoneLevelText.setText(str);
};

// ON_GOTO_MENU_CLICKED:
// ************************************************************************************************
HUD.prototype.onGotoMenuClicked = function () {
	if (gs.stateManager.isCurrentState('GameState')) {
		gs.openGotoLevelMenu();
	}
	else if (gs.stateManager.isCurrentState('DialogMenu')) {
		gs.stateManager.popState();
	}
};

// ON_UP_STAIRS_CLICKED:
// ************************************************************************************************
HUD.prototype.onUpStairsClicked = function () {
	input.onGotoUpStairs();
};

// ON_DOWN_STAIRS_CLICKED:
// ************************************************************************************************
HUD.prototype.onDownStairsClicked = function () {
	input.onGotoDownStairs();
};


// WEAPON_SLOT_CLICKED:
// ************************************************************************************************
HUD.prototype.weaponSlotClicked = function (slot) {
	if (gs.stateManager.isCurrentState('ShopMenu')) {
		gs.shopMenu.playerItemClicked(slot);
	}
	else if (gs.stateManager.isCurrentState('CharacterMenu')) {
		gs.characterMenu.slotClicked(slot);
	}
};

// CONSUMABLE_SLOT_CLICKED:
// ************************************************************************************************
HUD.prototype.consumableSlotClicked = function (slot) {
	if (gs.stateManager.isCurrentState('ShopMenu')) {
		gs.shopMenu.playerItemClicked(slot);
	}
	else if (gs.stateManager.isCurrentState('CharacterMenu')) {
		gs.characterMenu.slotClicked(slot);
	}
	else if (gs.stateManager.isCurrentState('GameState') || gs.stateManager.isCurrentState('UseAbility')) {
		if (slot.hasItem()) {
			gs.pc.consumableSlotClicked(slot);
		}
	}
};

// PICK_UP_CLICKED:
// ************************************************************************************************
HUD.prototype.pickUpClicked = function () {
	if (gs.getItem(gs.pc.tileIndex)) {
		gs.pc.pickUpItem(gs.getItem(gs.pc.tileIndex));
	}
};

// EXPLORE_CLICKED:
// ************************************************************************************************
HUD.prototype.exploreClicked = function () {
	gs.pc.startExploring();
};

// CHARACTER_MENU_CLICKED:
// ************************************************************************************************
HUD.prototype.characterMenuClicked = function () {
	gs.pc.actionQueue = [];
	input.onCharacterMenuClicked();
};

// ON_MENU_CLICKED:
// ************************************************************************************************
HUD.prototype.onMenuClicked = function () {
	if (gs.activeCharacter() === gs.pc && gs.stateManager.isCurrentState('GameState')) {
		gs.stateManager.pushState('GameMenu');
	}
	else if (gs.stateManager.isCurrentState('GameMenu')) {
		gs.stateManager.popState();
	}
};

// GET_DESC_UNDER_POINTER:
// ************************************************************************************************
HUD.prototype.getDescUnderPointer = function () {
	
	// Ability Bar:
	if (this.abilityBar.getAbilityUnderPointer()) {
		return gs.abilityDesc(this.abilityBar.getAbilityUnderPointer());
	}
	// Items:
	else if (this.getItemUnderPointer()) {
		return this.getItemUnderPointer().toLongDesc();
	}
	// HUD Bars:
	else if (this.getHUDBarDescUnderPointer()) {
		return this.getHUDBarDescUnderPointer();
	}
	// Primary Slot:
	if (this.meleeSlot.isPointerOver()) {
		if (gs.pc.inventory.meleeSlot.hasItem()) {
			return gs.pc.inventory.meleeSlot.item.toLongDesc();
		}
		else {
			return {title: 'Primary Slot', text: ''};
		}
		
	}
	// Range Slot:
	else if (this.rangeSlot.isPointerOver()) {
		if (gs.pc.inventory.rangeSlot.hasItem()) {
			return gs.pc.inventory.rangeSlot.item.toLongDesc();
		}
		else {
			return {title: 'Range Slot', text: ''};
		}
		
	}
	// Mini-Map:
	else if (this.miniMap.getDescUnderPointer()) {
		return this.miniMap.getDescUnderPointer();
	}
	// Status Effect:
	else if (this.getStatusEffectDescUnderPointer()) {
		return this.getStatusEffectDescUnderPointer();
	}
	// Button:
	else if (this.getButtonDescUnderPointer()) {
		return this.getButtonDescUnderPointer();
	}
	// Current State:
	else if (gs.stateManager.getDescUnderPointer()) {
		return gs.stateManager.getDescUnderPointer();
	}
	// Tile, Object, Item, Character (in world):
	else if (this.getTileDescUnderCursor()) {
        return this.getTileDescUnderCursor();
	}
	else {
		return {title: '', text: ''};
	}
};

// GET_HUD_BAR_DESC_UNDER_POINTER:
// ************************************************************************************************
HUD.prototype.getHUDBarDescUnderPointer = function () {
	if (this.hpBar.isPointerOver()) {
		return {title: 'Hit Points', text: HIT_POINTS_DESC + '\n\nRegen Rate: ' + gs.pc.getPCHPRegen().hp + ' HP per ' + gs.pc.getPCHPRegen().turns + ' Turns'};
	}	
	else if (this.mpBar.isPointerOver()) {
		return {title: 'Mana Points', text: MANA_POINTS_DESC + '\n\nRegen Rate: 1 MP per ' + gs.pc.mpRegenTime + ' turns'};
	}	
	else if (this.spBar.isPointerOver()) {
		return {title: 'Speed Points', text: SPEED_POINTS_DESC + '\n\nRegen Rate: 1 SP per ' + gs.pc.spRegenTime + ' turns'};
	}
	else if (this.foodBar.isPointerOver()) {
		return {title: 'Food Points', text: FOOD_POINTS_DESC + '\n\nConsumption Rate: 1 Food per ' + gs.pc.foodTime() + ' turns'};
	}
	
	else if (this.expBarFrame.input.checkPointerOver(game.input.activePointer)) {
		return {title: 'Experience Points', text: 'Your progress towards the next level.\n\nCurrent Level: ' + gs.pc.level};
	}

	else {
		return null;
	}
};

// GET_ITEM_UNDER_POINTER:
// ************************************************************************************************
HUD.prototype.getItemUnderPointer = function () {
	// HUD Consumable:
	if (this.consumableList.getItemUnderPointer()) {
		return this.consumableList.getItemUnderPointer();
	}
	else {
		return null;
	}
};

// GET_BUTTON_DESC_UNDER_POINTER:
// ************************************************************************************************
HUD.prototype.getButtonDescUnderPointer = function () {
	
	if (this.characterMenuButton.isPointerOver()) {
		return {title: 'Open character menu', text: 'Keyboard shortcut: C.'};
	} 
	else if (this.exploreButton.isPointerOver()) {
		return {title: 'Auto Explore', text: 'Keyboard shortcut: E.'};
	} 
	else if (this.menuButton.isPointerOver()) {
		return {title: 'Open game menu', text: 'Keyboard shortcut: ESC.'};
	}
	// Descend Stairs:
	else if (this.downStairsButton.isPointerOver() && gs.getObj(gs.pc.tileIndex, 'DownStairs')) {
		return {title: 'Descend Stairs', text: 'Keyboard shortcut: >'};
	}
	// Descend Pit:
	else if (this.downStairsButton.isPointerOver() && gs.isPit(gs.pc.tileIndex)) {
		return {title: 'Descend Into Pit', text: 'Keyboard shortcut: >'};
	}
	// Ascend Stairs:
	else if (this.upStairsButton.isPointerOver() && gs.getObj(gs.pc.tileIndex, 'UpStairs')) {
		return {title: 'Ascend Stairs', text: 'Keyboard shortcut: <'};
	}
	// Goto Down Stairs:
	else if (this.downStairsButton.isPointerOver()) {
		return {title: 'Goto Down Stairs', text: 'Keyboard shortcut: >'};
	}
	// Goto Up Stairs:
	else if (this.upStairsButton.isPointerOver()) {
		return {title: 'Goto Up Stairs', text: 'Keyboard shortcut: <'};
	}
	// Goto Menu:
	else if (this.gotoButton.isPointerOver()) {
		return {title: 'Open Goto Menu', text: 'Keyboard shortcut: g'};
	}
	return null;
};



// GET_STATUS_EFFECT_DESC_UNDER_POINTER:
// ************************************************************************************************
HUD.prototype.getStatusEffectDescUnderPointer = function () {
	for (let i = 0; i < MAX_STATUS_EFFECTS; i += 1) {
		if (this.statusEffectText[i].input.checkPointerOver(game.input.activePointer)) {
			// Status Effect:
			if (i < gs.pc.statusEffects.list.length) {
				return gs.pc.statusEffects.list[i].toLongDesc();
			}
			// Poisoned:
			else if (this.statusEffectText[i].text.text === '[Poisoned]') {
				let str = 'Total damage: ' + gs.pc.poisonDamage;
				
				return {title: 'Poisoned', text: str};
			}
			// Hungry:
			else if (this.statusEffectText[i].text.text === '[Hungry]') {
				let str = 'You are starving to death and will take damage until you eat food.';
				
				return {title: 'Hungry', text: str};
			}
		}
		
		
	}
	
	return null;
};


// GET_TILE_DESC_UNDER_CURSOR:
// ************************************************************************************************
HUD.prototype.getTileDescUnderCursor = function () { 
	// In a menu:
	if (!gs.stateManager.isCurrentState('GameState') && !gs.stateManager.isCurrentState('UseAbility')) {
		return null;
	}
	// Offscreen:
    else if (!gs.isPointerInWorld()) {
		return null;
	}
	else {
		return gs.descriptionOfTileIndex(gs.cursorTileIndex);
	}
};

// OPEN:
// ************************************************************************************************
HUD.prototype.open = function () { 
	this.group.visible = true;
};

// CLOSE:
// ************************************************************************************************
HUD.prototype.close = function () { 
	this.group.visible = false;
};