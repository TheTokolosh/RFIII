/*global gs, game, console, input*/
/*global UIItemSlotList, UIItemMenu*/
/*global HUD_START_X, SCREEN_HEIGHT, HUGE_WHITE_FONT, SMALL_WHITE_FONT, ITEM_SLOT*/
/*global ACTION_TIME*/
/*jshint esversion: 6*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UIWieldMenu() {
	this.init('Wield Weapon');
	
	this.group.visible = false;
}
UIWieldMenu.prototype = new UIItemMenu();

// SLOT_CLICKED:
// ************************************************************************************************
UIWieldMenu.prototype.slotClicked = function (slot) {
	// Skip if the slot is empty:
	if (!slot) {
		return;
	}
	
	gs.stateManager.popState();
	
	let weaponSlot;
	
	if (slot.item.type.slot === ITEM_SLOT.PRIMARY) {
		weaponSlot = gs.pc.inventory.meleeSlot;
	}
	else {
		weaponSlot = gs.pc.inventory.rangeSlot;
	}
		
		
	// Remove current weapon:
	if (weaponSlot.hasItem()) {
		let item = weaponSlot.item;
		weaponSlot.removeItem();
		gs.pc.inventory.addItem(item, false);
	}

	// Remove new weapon from inventory slot:
	let item = slot.item;
	slot.removeItem();

	// Add new weapon to weapon slot:
	weaponSlot.addItem(item);

	gs.pc.endTurn(ACTION_TIME);
	
};

// ITEM_DESC:
// ************************************************************************************************
UIWieldMenu.prototype.itemDesc = function (item) {
	return item.toUseMenuDesc();
};

// VALID_ITEM_SLOT_LIST:
// ************************************************************************************************
UIWieldMenu.prototype.validItemSlotList = function () {
	let list = gs.pc.inventory.allFullItemSlots();
	
	list = list.filter(slot => slot.item.type.slot === ITEM_SLOT.PRIMARY || slot.item.type.slot === ITEM_SLOT.RANGE);
	list = list.filter(slot => slot.itemSlotType !== ITEM_SLOT.PRIMARY && slot.itemSlotType !== ITEM_SLOT.RANGE);
	
	return list;
};