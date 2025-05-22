/*global gs, game, console, input*/
/*global UIItemSlotList, UIItemMenu*/
/*global HUD_START_X, SCREEN_HEIGHT, HUGE_WHITE_FONT, SMALL_WHITE_FONT*/
/*jshint esversion: 6*/
'use strict';

function UIUseMenu () {
	this.init('Use Item');
	
	this.group.visible = false;
}
UIUseMenu.prototype = new UIItemMenu();

// SLOT_CLICKED:
// ************************************************************************************************
UIUseMenu.prototype.slotClicked = function (slot) {
	gs.stateManager.popState();
	gs.pc.consumableSlotClicked(slot);
};

// ITEM_DESC:
// ************************************************************************************************
UIUseMenu.prototype.itemDesc = function (item) {
	return item.toUseMenuDesc();
};

// VALID_ITEM_SLOT_LIST:
// ************************************************************************************************
UIUseMenu.prototype.validItemSlotList = function (item) {
	var list;
	
	list = gs.pc.inventory.consumableHotBar.allFullItemSlots();
	list = list.filter(slot => slot.item.type.slot === ITEM_SLOT.CONSUMABLE);
	
	return list;
};