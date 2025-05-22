/*global game, gs, console, Phaser, util*/
/*global Item*/
/*global ITEM_SLOT, ASSERT_EQUAL, ASSERT_THROW*/
/*jslint white: true, esversion: 6 */
'use strict';

// ITEM_SLOT:
// - Item slots used by characters and containers for holding items.
// - Item slots can be made generic by setting itemSlotType to null.
// ************************************************************************************************
function ItemSlot(itemSlotType = null) {
	this.item = null;
	this.itemSlotType = itemSlotType;
	this.index = -1; // Use when the item slot is part of a list;
	
	Object.seal(this);
}

// CLEAR:
// ************************************************************************************************
ItemSlot.prototype.clear = function () {
	this.item = null;
};

// HAS_ITEM:
// ************************************************************************************************
ItemSlot.prototype.hasItem = function () {
	return Boolean(this.item);
};

// IS_EMPTY:
// ************************************************************************************************
ItemSlot.prototype.isEmpty = function () {
	return !this.hasItem();
};

// DOES_SLOT_MATCH:
// ************************************************************************************************
ItemSlot.prototype.doesSlotMatch = function (slotType) {
	return !this.itemSlotType
		|| this.itemSlotType === slotType 
		|| (slotType === ITEM_SLOT.CHARM && util.inArray(this.itemSlotType, [ITEM_SLOT.PRIMARY, ITEM_SLOT.RANGE, ITEM_SLOT.SECONDARY]));
};

// CAN_ADD_ITEM:
// ************************************************************************************************
ItemSlot.prototype.canAddItem = function (item) {
	ASSERT_EQUAL(Item.isItem(item), true, 'Not a valid item: ' + item);
	
	// Slot mismatch:
	if (!this.doesSlotMatch(item.type.slot)) {
		return false;
	}
	// Stackable:
	else if (this.hasItem() && this.item.canStackItem(item)) {
		return true;
	}
	// Full:
	else if (this.hasItem()) {
		return false;
	}
	// Empty:
	else {
		return true;
	}
};

// CAN_STACK_ITEM:
// ************************************************************************************************
ItemSlot.prototype.canStackItem = function (item) {
	return this.hasItem() && this.item.canStackItem(item);
};

// ADD_ITEM:
// ************************************************************************************************
ItemSlot.prototype.addItem = function (item) {
	ASSERT_EQUAL(Item.isItem(item), true, 'Not a valid item: ' + item);
	ASSERT_EQUAL(this.canAddItem(item), true, 'Cannot add item: ' + item);
	
	// Adding to empty slot:
	if (this.isEmpty()) {
		this.item = item;
	}
	// Adding to stack:
	else if (this.item.canStackItem(item)) {
		this.item.amount += item.amount;
	}
	else {
		throw 'failed to add item';
	}
};

// REMOVE_ITEM:
// ************************************************************************************************
ItemSlot.prototype.removeItem = function (amount) {
	if (!amount) {
		this.item = null;
	} 
	else {
		this.item.amount -= amount;
		if (this.item.amount <= 0) {
			this.item = null;
		}
	}
};

// TO_DATA:
// ************************************************************************************************
ItemSlot.prototype.toData = function () {
	var data = {};
	
	data.itemSlotType = this.itemSlotType;
	data.item = this.hasItem() ? this.item.toData() : null;
	data.index = this.index;
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
ItemSlot.prototype.loadData = function (data) {
	
	this.itemSlotType = data.itemSlotType;
	this.item = data.item ? Item.createAndLoadItem(data.item) : null;
	this.index = data.index;
};