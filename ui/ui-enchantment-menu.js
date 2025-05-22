/*global game, gs, Phaser, console, */
/*global Item, UIItemMenu*/
/*global HUGE_WHITE_FONT, SCREEN_HEIGHT, NUM_EQUIPMENT_SLOTS, HUD_START_X*/
/*global UIItemSlotList, ItemSlotList*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UIEnchantmentMenu() {
	this.init('Enchant Item');
	
	this.group.visible = false;
}
UIEnchantmentMenu.prototype = new UIItemMenu();
	
// SLOT_CLICKED:
// ************************************************************************************************
UIEnchantmentMenu.prototype.slotClicked = function (slot) {
	// Possible to esc close the menu before releasing click:
	if (!gs.stateManager.isCurrentState('EnchantmentMenu')) {
		return;
	}
	
	slot.item.enchant();
	gs.pc.popUpText('Enchanted ' + gs.capitalSplit(slot.item.type.name));
	
	// Effect:
	gs.createEXPEffect(gs.pc.tileIndex);
	
	gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	
	// When using a fountaing:
	if (gs.usingFountain) {
		gs.usingFountain.setIsFull(false);
		gs.usingFountain = null;
	}
	// When level up as gnome:
	else if (gs.pc.levelUpEnchant) {
		gs.pc.levelUpEnchant = false;
	}
	// When using a scroll:
	else {
		gs.pc.inventory.removeItem(gs.pc.inventory.itemOfType(gs.itemTypes.ScrollOfEnchantment), 1);
	}
	
	gs.stateManager.popState();
};

// CLOSE:
// ************************************************************************************************
UIEnchantmentMenu.prototype.close = function () {
	gs.usingFountain = null;
	this.group.visible = false;
};

// GET_DESC_UNDER_POINTER:
// ************************************************************************************************
UIEnchantmentMenu.prototype.getDescUnderPointer = function () {
	if (this.uiItemSlotList.getItemUnderPointer()) {
		return this.uiItemSlotList.getItemUnderPointer().toLongDesc(true);
	}
	
	return null;
};

// ITEM_DESC:
// ************************************************************************************************
UIEnchantmentMenu.prototype.itemDesc = function (item) {
	return item.toEnchantDesc();
};

// VALID_ITEM_SLOT_LIST:
// ************************************************************************************************
UIEnchantmentMenu.prototype.validItemSlotList = function (item) {
	var list;
	
	list = gs.pc.inventory.allFullItemSlots();
	list = list.filter(slot => slot.item.canEnchant());
	
	return list;
};