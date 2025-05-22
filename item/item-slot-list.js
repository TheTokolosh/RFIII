/*global game, gs, console, Phaser*/
/*global ASSERT_EQUAL, ASSERT_THROW*/
/*global ItemSlot, Item*/
/*jshint esversion: 6*/
'use strict';


// ITEM_SLOT_LIST:
// - A list of ItemSlots with a specific size.
// - The purpose is to allow items to be added and removed from the list without specifying a specific itemSlot.
// - The list can also be accessed on a per slot basis.
// - The main use of ItemSlotList is for inventories.
// ************************************************************************************************
function ItemSlotList(length, itemSlotType = null) {
	// Properties:
	this.itemSlots = [];
	this.length = length;
	
	// Initialize Item Slots:
	for (let i = 0; i < length; i += 1) {
		this.itemSlots[i] = new ItemSlot(itemSlotType);
		this.itemSlots[i].index = i;
	}
	
	Object.seal(this);
}

// CONTAINS_ITEM:
// Returns true if the list contains the exact item
// ************************************************************************************************
ItemSlotList.prototype.containsItem = function (item) {
	ASSERT_EQUAL(Item.isItem(item), true, 'ItemSlotList.containsItem() - not a valid item: ' + item);
	
	for (let i = 0; i < this.length; i += 1) {
		if (this.itemAtIndex(i) === item) {
			return true;
		}
	}
	
	return false;
};

// ITEM_SLOT_INDEX:
// Returns the slot index [number] that the item is located in
// ************************************************************************************************
ItemSlotList.prototype.itemSlotIndex = function (item) {
	ASSERT_EQUAL(Item.isItem(item), true, 'ItemSlotList.itemSlotIndex() - not a valid item: ' + item);
	ASSERT_EQUAL(this.containsItem(item), true, 'ItemSlotList.itemSlotIndex() - does not contain item: ' + item);
	
	for (let i = 0; i < this.length; i += 1) {
		if (this.itemAtIndex(i) === item) {
			return i;
		}
	}
};

// COUNT_ITEM_OF_TYPE:
// ************************************************************************************************
ItemSlotList.prototype.countItemOfType = function (type) {
	ASSERT_EQUAL(gs.itemTypes[type.name], type, 'ItemSlotList.itemOfType() - invalid itemType: ' + type);
	
	if (this.itemOfType(type)) {
		return this.itemOfType(type).amount;
	}
	else {
		return 0;
	}
};

// ITEM_OF_TYPE:
// Returns the item in this list which matches the type or null if no such item exists
// ************************************************************************************************
ItemSlotList.prototype.itemOfType = function (type) {
	ASSERT_EQUAL(gs.itemTypes[type.name], type, 'ItemSlotList.itemOfType() - invalid itemType: ' + type);
	
	for (let i = 0; i < this.length; i += 1) {
		if (this.itemAtIndex(i) && this.itemAtIndex(i).type === type) {
			return this.itemAtIndex(i);
		}
	}
	
	return null;
};

// CAN_STACK_ITEM:
// Returns true if the list contains an item of the same type and mod and the type is stackable:
// ************************************************************************************************
ItemSlotList.prototype.canStackItem = function (item) {
	ASSERT_EQUAL(Item.isItem(item), true, 'ItemSlotList.canStackItem() - not a valid item: ' + item);
	
	for (let i = 0; i < this.length; i += 1) {
		if (this.itemAtIndex(i) && this.itemAtIndex(i).canStackItem(item)) {
			return true;
		}
	}
	
	return false;
};

// ITEM_AT_INDEX:
// Returns the item in the slot at index or null
// ************************************************************************************************
ItemSlotList.prototype.itemAtIndex = function (index) {
	ASSERT_EQUAL(typeof index, 'number', 'index is not a number');
	ASSERT_EQUAL(index >= 0 && index < this.length, true, 'index out of bounds');
	
	return this.itemSlots[index].item;
};

// ADD_ITEM:
// Adds the item to the first valid slot (either stacking, or empty slot)
// Throws an exception if cannot add the item
// ************************************************************************************************
ItemSlotList.prototype.addItem = function (item) {    
	ASSERT_EQUAL(Item.isItem(item), true, 'Invalid item: ' + item);
   
	// Try to add to an existing stack:
	for (let i = 0; i < this.length; i += 1) {
		if (this.itemSlots[i].hasItem() && this.itemSlots[i].item.canStackItem(item)) {
			this.itemSlots[i].addItem(item);
			return;
		}
	}
	
	// Try to add to the first empty slot:
	for (let i = 0; i < this.length; i += 1) {
		if (this.itemSlots[i].isEmpty()) {
			this.itemSlots[i].addItem(item);
			return;
		}
	}
		
	throw 'No room for item';
};

// CAN_ADD_ITEM:
// ************************************************************************************************
ItemSlotList.prototype.canAddItem = function (item) {
	ASSERT_EQUAL(Item.isItem(item), true, 'Invalid item: ' + item);
	
	return Boolean(this.itemSlots.find(slot => slot.canAddItem(item)));
};

// REMOVE_ITEM:
// Tries to remove the item from the entire list:
// ************************************************************************************************
ItemSlotList.prototype.removeItem = function (item, amount = 1) {
	ASSERT_EQUAL(Item.isItem(item), true, 'Not an item: ' + item);
	ASSERT_EQUAL(typeof amount === 'number' && amount > 0, true, 'Invalid amount: ' + amount);
	
	for (let i = 0; i < this.length; i += 1) {
		if (this.itemSlots[i].item === item) {
			this.itemSlots[i].item.amount -= amount;

			// Destroy empty stacks:
			if (this.itemSlots[i].item.amount <= 0) {
				this.itemSlots[i].removeItem();
			}
			
			return;
		}
	}
	
	throw 'item does not exist';
};

// CLEAR:
// Remove all items from slots:
// ************************************************************************************************
ItemSlotList.prototype.clear = function () {
	for (let i = 0; i < this.length; i += 1) {
		if (this.itemSlots[i].hasItem()) {
			this.itemSlots[i].removeItem();
		}
	}
};

// FOR_EACH_ITEM:
// ************************************************************************************************
ItemSlotList.prototype.forEachItem = function (func, context) {
	for (let i = 0; i < this.length; i += 1) {
		if (this.itemSlots[i].hasItem()) {
			func.call(context, this.itemSlots[i].item);
		}
	}
};

// ALL_FULL_ITEM_SLOTS:
// ************************************************************************************************
ItemSlotList.prototype.allFullItemSlots = function () {
	var list = [];
	
	for (let i = 0; i < this.length; i += 1) {
		if (this.itemSlots[i].hasItem()) {
			list.push(this.itemSlots[i]);
		}
	}
	
	return list;
};

// TO_DATA:
// ************************************************************************************************
ItemSlotList.prototype.toData = function () {
	var data = {};
	
	data.length = this.length;
	data.itemSlots = [];
	
	for (let i = 0; i < this.itemSlots.length; i += 1) {
		data.itemSlots.push(this.itemSlots[i].toData());
	}
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
ItemSlotList.prototype.loadData = function (data) {
	for (let i = 0; i < data.length; i += 1) {
		this.itemSlots[i].loadData(data.itemSlots[i]);
	}
};