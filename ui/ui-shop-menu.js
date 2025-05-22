/*global game, gs, console*/
/*global UIMenuBase*/
/*global SCREEN_HEIGHT, INVENTORY_SIZE, HUD_START_X*/
/*global UIItemSlotList, ItemSlotList, SELL_ITEM_PERCENT*/
/*global MERCHANT_INVENTORY_WIDTH, MERCHANT_INVENTORY_HEIGHT*/
/*global INVENTORY_WIDTH, INVENTORY_HEIGHT*/
/*global LARGE_RED_FONT, LARGE_WHITE_FONT, HUGE_WHITE_FONT, ITEM_SLOT*/
/*jshint esversion: 6*/
'use strict';



// CONSTRUCTOR:
// ************************************************************************************************
function UIShopMenu() {
	let text, x;
	
	UIMenuBase.prototype.init.call(this, 'The Merchant');

	// Shop Equipment Slots:
	this.shopItemSlots = new UIItemSlotList(this.startX + 30, this.startY + 70, MERCHANT_INVENTORY_WIDTH, 4, null, this.merchantItemClicked, this, this.group);

	// Shop Consumable Slots:
	this.shopConsumableSlots =  new UIItemSlotList(this.startX + 30, this.startY + 318, MERCHANT_INVENTORY_WIDTH, 4, null, this.merchantItemClicked, this, this.group);
	
	// Equipment Title:
	x = this.shopItemSlots.uiItemSlots[3].x;
	text = gs.createText(x, this.startY + 40, 'Merchant Equipment', 'PixelFont6-White', 18, this.group);
	text.setAnchor(0.5, 0);
	
	// Consumable Title:
	text = gs.createText(x, this.startY + 290, 'Merchant Consumables', 'PixelFont6-White', 18, this.group);
	text.setAnchor(0.5, 0);
	
	// Equipment:
	this.equipmentSlots = new UIItemSlotList(this.startX + this.width / 2 + 30 + 48, this.startY + 70, 4, 2, gs.pc.inventory.equipment.itemSlots, this.playerItemClicked, this, this.group, 7);
	
	// Inventory:
	this.inventorySlots = new UIItemSlotList(this.startX + this.width / 2 + 30 + 24, this.startY + 170 + 48, INVENTORY_WIDTH, INVENTORY_HEIGHT, gs.pc.inventory.inventory.itemSlots, this.playerItemClicked, this, this.group);
	
	// Equipment Title:
	x = this.equipmentSlots.uiItemSlots[2].x;
	text = gs.createText(x, this.startY + 40, 'Player Equipment', 'PixelFont6-White', 18, this.group);
	text.setAnchor(0.5, 0);
	
	// Inventory Title:
	x = this.inventorySlots.uiItemSlots[3].x;
	text = gs.createText(x - 24, this.startY + 190, 'Player Inventory', 'PixelFont6-White', 18, this.group);
	text.setAnchor(0.5, 0);
	
	// Gold Text:
	this.goldText = gs.createText(x - 24, this.startY + 470, 'Gold', 'PixelFont6-White', 12, this.group);
	this.goldText.setAnchor(0.5, 0);
	
	// Item Description:
	this.nameText = gs.createText(this.startX + this.width / 2, this.startY + 530, '', 'PixelFont6-White', 12, this.group);
	this.nameText.setAnchor(0.5, 0);
	
	this.costText = gs.createText(this.startX + this.width / 2, this.startY + 550, '', 'PixelFont6-White', 12, this.group);
	this.costText.setAnchor(0.5, 0);
	
	this.group.visible = false;
}
UIShopMenu.prototype = new UIMenuBase();

// MERCHANT_ITEM_CLICKED:
// Buying an item:
// ************************************************************************************************
UIShopMenu.prototype.merchantItemClicked = function (slot) {
	var cost, item , newItem;
	
	if (!slot || slot.isEmpty()) {
		return;
	}

	item = slot.item;
	
	// Item Cost:
	cost = item.baseValue();
	
	// Buy Item:
	if (gs.pc.inventory.gold >= cost) {
		// Play Item Sound:
		gs.playSound(item.getSound());
		gs.playSound(gs.sounds.coin);
		
		// Add item:
		newItem = Object.create(item);
		newItem.amount = 1;
		gs.pc.inventory.addItem(newItem);
		
		// Remove item:
		gs.pc.inventory.gold -= cost;
		
		// Update UI:
		gs.merchantInventory.removeItem(item, 1);
		
		// Refresh both inventories:
		this.open();
		
		this.nameText.setText('');
		this.costText.setText('');
		this.refresh();
	}
};

// PLAYER_ITEM_CLICKED:
// Selling an item:
// ************************************************************************************************
UIShopMenu.prototype.playerItemClicked = function (slot) {
	var cost, item;
	
	if (!slot || slot.isEmpty()) {
		return;
	}
	
	// Cannot sell runes:
	if (slot.item.type.isRune) {
		return;
	}
	
	// Play Item Sound:
	gs.playSound(slot.item.getSound());
	gs.playSound(gs.sounds.coin);

	// Make a copy of the item w/ amount = 1 to add to merchant:
	item = Object.create(slot.item);
	item.amount = 1;
	
	// Selling Item:
	cost = slot.item.sellValue();
	gs.pc.inventory.removeItem(slot.item, 1);
	gs.pc.inventory.addGold(cost);
		
	// Update UI:
	if (gs.merchantInventory.canAddItem(item)) {
		gs.merchantInventory.addItem(item);
		item.wasSold = true;
	}
	
	// Refresh both inventories:
	this.open();
	
	// Refresh player stats:
	gs.pc.updateStats();
	
	this.nameText.setText('');
	this.costText.setText('');
	this.refresh();
};

// REFRESH:
// ************************************************************************************************
UIShopMenu.prototype.refresh = function () {
	this.goldText.setText('Gold: ' + gs.pc.inventory.gold);
	
	this.shopItemSlots.refresh();
	this.shopConsumableSlots.refresh();
	this.equipmentSlots.refresh();
	this.inventorySlots.refresh();
	
};

// UPDATE:
// ************************************************************************************************
UIShopMenu.prototype.update = function () {
	var item, str, cost;
	
	// Buying Shop Item:
	if (this.getMerchantItemUnderPointer()) {
		item = this.getMerchantItemUnderPointer();
		str = 'Buy: ';
		if (item.mod > 0) {
			str += '+' + item.mod + ' ';
		}
		str += item.type.niceName;
		this.nameText.setText(str);
		

		this.costText.setText("That will be " + item.baseValue() + (item.amount > 1 ? ' Gold Each' : ' Gold'));
		
		
		// Red text if can't afford:
		if (gs.pc.inventory.gold < item.baseValue()) {
			this.nameText.setFont('PixelFont6-Red');
			this.costText.setFont('PixelFont6-Red');
		}
		else {
			this.nameText.setFont('PixelFont6-White');
			this.costText.setFont('PixelFont6-White');
		}
	}
	// Selling Player Item:
	else if (this.getPlayerItemUnderPointer()) {
		item = this.getPlayerItemUnderPointer();
		
		// Runes:
		if (item.type.isRune) {
			this.nameText.setText(item.type.niceName);
			this.costText.setText('Cannot sell');
			
			this.nameText.setFont('PixelFont6-Red');
			this.costText.setFont('PixelFont6-Red');
		}
		// Normal Items:
		else {
			str = 'Sell: ';
			if (item.mod > 0) {
				str += '+' + item.mod + ' ';
			}
			str += item.type.niceName;
			this.nameText.setText(str);
			this.costText.setText("I'll give you " + item.sellValue() + (item.amount > 1 ? ' Gold Each' : ' Gold'));
			
			this.nameText.setFont('PixelFont6-White');
			this.costText.setFont('PixelFont6-White');
		}
	}
	// No Item:
	else {
		this.nameText.setText('');
		this.costText.setText('');
	}
};

// GET_DESC_UNDER_POINTER:
// Returns either the shop or player item under pointer
// ************************************************************************************************
UIShopMenu.prototype.getDescUnderPointer = function () {
	if (this.shopItemSlots.getItemUnderPointer()) {
		return this.shopItemSlots.getItemUnderPointer().toLongDesc();
	}
	else if (this.shopConsumableSlots.getItemUnderPointer()) {
		return this.shopConsumableSlots.getItemUnderPointer().toLongDesc();
	}
	else if (this.equipmentSlots.getItemUnderPointer()) {
		return this.equipmentSlots.getItemUnderPointer().toLongDesc();
	}
	else if (this.inventorySlots.getItemUnderPointer()) {
		return this.inventorySlots.getItemUnderPointer().toLongDesc();
	}
	
	return null;
};

// GET_ITEM_UNDER_POINTER:
// Refers to the shops items
// ************************************************************************************************
UIShopMenu.prototype.getMerchantItemUnderPointer = function () {
	// Equipment:
	if (this.shopItemSlots.getItemUnderPointer()) {
		return this.shopItemSlots.getItemUnderPointer();
	}
	
	// Consumables:
	if (this.shopConsumableSlots.getItemUnderPointer()) {
		return this.shopConsumableSlots.getItemUnderPointer();
	}
	
	return null;
	
};

// GET_PLAYER_ITEM_UNDER_POINTER:
// Refers to the players items
// ************************************************************************************************
UIShopMenu.prototype.getPlayerItemUnderPointer = function () {
	// Inventory:
	if (this.inventorySlots.getItemUnderPointer()) {
		return this.inventorySlots.getItemUnderPointer();
	}
	// Equipment:
	else if (this.equipmentSlots.getItemUnderPointer()) {
		return this.equipmentSlots.getItemUnderPointer();
	}
	// Consumables:
	else if (gs.HUD.consumableList.getItemUnderPointer()) {
		return gs.HUD.consumableList.getItemUnderPointer();
	}
	// Primary Weapon:
	else if (gs.HUD.meleeSlot.isPointerOver()) {
		return gs.pc.inventory.meleeSlot.item;
	}
	// Range Weapon:
	else if (gs.HUD.rangeSlot.isPointerOver()) {
		return gs.pc.inventory.rangeSlot.item;
	}
};

// OPEN:
// ************************************************************************************************
UIShopMenu.prototype.open = function () {
	this.resetButtons();
	
	let slots;
	
	// Set Equipment slots:
	slots = gs.merchantInventory.allFullItemSlots();
	slots = slots.filter(slot => slot.item.type.slot !== ITEM_SLOT.CONSUMABLE || !slot.item.type.stackable);
	this.shopItemSlots.setItemSlots(slots);
	
	// Set consumable slots:
	slots = gs.merchantInventory.allFullItemSlots();
	slots = slots.filter(slot => slot.item.type.slot === ITEM_SLOT.CONSUMABLE && slot.item.type.stackable);
	this.shopConsumableSlots.setItemSlots(slots);
	
	this.refresh();

	this.group.visible = true;
};