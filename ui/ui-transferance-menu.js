/*global game, gs, Phaser, console, */
/*global Item, UIMenuBase*/
/*global HUGE_WHITE_FONT, SCREEN_HEIGHT, NUM_EQUIPMENT_SLOTS, HUD_START_X*/
/*global UIItemSlotList, ItemSlotList, ItemSlot, UIItemSlot*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UITransferanceMenu() {
	UIMenuBase.prototype.init.call(this, 'Transfer Enchantment');
	
	// Arrow sprite:
	this.arrowSprite = gs.createSprite(this.startX + this.width / 2 - 20, this.startY + 44, 'Tileset', this.group);
	this.arrowSprite.frame = 1236;
	
	// Transfer UISlots:
	this.uiSlot1 = new UIItemSlot(this.startX + this.width / 2 - 68, this.startY + 40, this.slot1, null, this.slotClicked, this, this.group);
	this.uiSlot2 = new UIItemSlot(this.startX + this.width / 2 + 20, this.startY + 40, this.slot2, null, this.slotClicked, this, this.group);
	
	// Inventory UISlots:
	this.uiItemSlotList = new UIItemSlotList(this.startX + this.width / 2 - 50 * 3, this.startY + 146, 6, 6, null, this.slotClicked, this, this.group);
	
	// Transfer Button:
	this.transferButton = this.createTextButton(this.startX + this.width / 2, this.startY + 106, 'Transfer', this.transferClicked, this, this.group);
	
	// Mouse UISlot:
	this.mouseUISlot = new UIItemSlot(0, 0, null, null, null, null, this.group);
	this.mouseUISlot.slotSprite.setVisible(false);
	
	this.group.visible = false;
}
UITransferanceMenu.prototype = new UIMenuBase();


// TRANSFER_CLICKED:
// ************************************************************************************************
UITransferanceMenu.prototype.transferClicked = function () {
	var item1, item2;
	
	// Possible to esc close the menu before releasing click:
	if (!gs.stateManager.isCurrentState('TransferanceMenu')) {
		return;
	}
	
	if (this.canTransfer()) {
		item1 = this.uiSlot1.itemSlot.item;
		item2 = this.uiSlot2.itemSlot.item;
		
		// Swapping mods:
		let temp = item1.mod;
		item1.mod = item2.mod;
		item2.mod = temp;
		
		// Cap wand charges:
		item1.charges = Math.min(item1.charges, item1.getModdedStat('maxCharges'));
		item2.charges = Math.min(item2.charges, item2.getModdedStat('maxCharges'));
		
		/*
		// Recharge wands:
		if (item1.getModdedStat('maxCharges')) {
			item1.charges = item1.getModdedStat('maxCharges');
		}
		*/
		
		// The wand to which we are transfering the enchantment gets max charges:
		if (item2.getModdedStat('maxCharges')) {
			item2.charges = item2.getModdedStat('maxCharges');
		}
		
		gs.createParticlePoof(gs.pc.tileIndex, 'PURPLE');
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
		gs.usingFountain.setIsFull(false);
		gs.usingFountain = null;
		gs.stateManager.popState();
	}
};

// CAN_TRANSFER:
// ************************************************************************************************
UITransferanceMenu.prototype.canTransfer = function () {
	var item1, item2;
	
	// Must have an item in each slot:
	if (!this.uiSlot1.itemSlot || !this.uiSlot2.itemSlot || this.uiSlot1.itemSlot.isEmpty() || this.uiSlot2.itemSlot.isEmpty()) {
		return false;
	}
	
	item1 = this.uiSlot1.itemSlot.item;
	item2 = this.uiSlot2.itemSlot.item;
	
	// Cannot transfer if mod is the same:
	if (item1.mod === item2.mod) {
		return false;
	}
	
	// Cannot transfer if either item would exceed its max enchantment:
	if (item1.mod > Item.itemTypeMaxEnchantment(item2.type)) {
		return false;
	}
	if (item2.mod > Item.itemTypeMaxEnchantment(item1.type)) {
		return false;
	}
	
	// Cannot transfer to stackable items (consumable projectiles):
	if (item1.type.stackable || item2.type.stackable) {
		return false;
	}
	
	return true;
};

// SLOT_CLICKED:
// ************************************************************************************************
UITransferanceMenu.prototype.slotClicked = function (slot, uiSlot) {
	// Pick up item into empty mouse:
	if (slot && slot.hasItem() && !this.mouseUISlot.itemSlot) {
		this.mouseUISlot.itemSlot = slot;
		uiSlot.itemSlot = null;
	}
	// Place mouse into empty slot:
	else if (this.mouseUISlot.itemSlot && !uiSlot.itemSlot) {
		uiSlot.itemSlot = this.mouseUISlot.itemSlot;
		this.mouseUISlot.itemSlot = null;
	}
	// Swap slots:
	else if (slot && slot.hasItem && this.mouseUISlot.itemSlot) {
		let temp = uiSlot.itemSlot;
		uiSlot.itemSlot = this.mouseUISlot.itemSlot;
		this.mouseUISlot.itemSlot = temp;
	}
	
	this.refresh();
};

// UPDATE:
// ************************************************************************************************
UITransferanceMenu.prototype.update = function () {
	this.mouseUISlot.setPosition(game.input.activePointer.x, game.input.activePointer.y);
};

// REFRESH:
// ************************************************************************************************
UITransferanceMenu.prototype.refresh = function () {
	this.uiSlot1.refresh();
	this.uiSlot2.refresh();
	this.mouseUISlot.refresh();
	this.uiItemSlotList.refresh();
	
	// Green or red transfer arrow:
	if (this.canTransfer()) {
		this.arrowSprite.frame = 1235;
	}
	else {
		this.arrowSprite.frame = 1236;
	}
};

// OPEN:
// ************************************************************************************************
UITransferanceMenu.prototype.open = function () {
	var playerItemSlots;
	
	// Get list of all enchantable items:
	playerItemSlots = gs.pc.inventory.allFullItemSlots();
	playerItemSlots = playerItemSlots.filter(slot => slot.item.canEnchant() || slot.item.mod > 0);
	this.uiItemSlotList.setItemSlots(playerItemSlots);
	
	// Empty out slots:
	this.mouseUISlot.itemSlot = null;
	this.uiSlot1.itemSlot = null;
	this.uiSlot2.itemSlot = null;
	
	// Hide slots which contain no item:
	for (let i = 0; i < this.uiItemSlotList.uiItemSlots.length; i += 1) {
		if (!this.uiItemSlotList.uiItemSlots[i].itemSlot || this.uiItemSlotList.uiItemSlots[i].itemSlot.isEmpty()) {
			this.uiItemSlotList.uiItemSlots[i].setVisible(false);
		} 
		else {
			this.uiItemSlotList.uiItemSlots[i].setVisible(true);
		}
	}
	
	this.refresh();
	this.group.visible = true;
	this.resetButtons();
};

// CLOSE:
// ************************************************************************************************
UITransferanceMenu.prototype.close = function () {
	gs.usingFountain = null;
	this.group.visible = false;
};

// GET_DESC_UNDER_POINTER:
// ************************************************************************************************
UITransferanceMenu.prototype.getDescUnderPointer = function () {
	if (this.uiSlot1.isPointerOver() && this.uiSlot1.getItem()) {
		return this.uiSlot1.getItem().toLongDesc();
	}
	else if (this.uiSlot2.isPointerOver() && this.uiSlot2.getItem()) {
		return this.uiSlot2.getItem().toLongDesc();
	}
	else if (this.uiItemSlotList.getItemUnderPointer()) {
		return this.uiItemSlotList.getItemUnderPointer().toLongDesc();
	}
	
	return null;
};