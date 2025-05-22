/*global game, gs, console, Phaser*/
/*global EQUIPMENT_SLOT_FRAMES, ITEM_SLOT*/
/*global LARGE_WHITE_FONT, SMALL_WHITE_FONT, SMALL_GREEN_FONT, ITEM_SLOT_FRAME, ABILITY_SLOT_RED_FRAME*/
'use strict';

/*
// ************************************************************************************************
						UI_ITEM_SLOT:
// ************************************************************************************************	
- Used to give a visual and interactable representation of an ItemSlot
- Needs to be passed an itemSlot at construction
- By calling refresh the UIItemSlot will update its appearence to match the contents of the ItemSlot
- Can pass in a callback function for when the UIItemSlot is clicked
*/
function UIItemSlot(x, y, itemSlot, emptyFrame, callback, context, group) {
	this.itemSlot = itemSlot;
	this.callback = callback;
	this.context = context;
	this.emptyFrame = emptyFrame || 0;
	this.x = x;
	this.y = y;
	
	// Slot Sprite:
	this.slotSprite = gs.createButton(0, 0, 'UISlot', ITEM_SLOT_FRAME + 1, this.slotClicked, this, group);
	
	// Item Sprite:
	this.itemSprite = gs.createSprite(0, 0, 'Tileset', group);
	
	// Item text:
	this.amountText = gs.createText(0, 0, '10', 'PixelFont6-White', 12, group);
	this.amountText.setAnchor(1, 1);
	
	this.setPosition(x, y);
}

// SET_POSITION:
// ************************************************************************************************
UIItemSlot.prototype.setPosition = function (x, y) {
	this.x = x;
	this.y = y;
	
	this.slotSprite.setPosition(x, y);
	
	this.itemSprite.x = x + 4;
	this.itemSprite.y = y + 4;
	this.amountText.x = x + 46;
	this.amountText.y = y + 48;
};

// SET_VISIBLE:
// ************************************************************************************************
UIItemSlot.prototype.setVisible = function (b) {
	this.slotSprite.visible = b;
	this.itemSprite.visible = b;
	this.amountText.visible = b;
};

// REFRESH:
// ************************************************************************************************
UIItemSlot.prototype.refresh = function () {
	// Not connected to an item slot:
	if (!this.itemSlot) {
		this.itemSprite.visible = false;
		this.amountText.visible = false;
		return;
	}
	
	this.slotSprite.setFrames(ITEM_SLOT_FRAME + 1, ITEM_SLOT_FRAME);
	
	if (this.itemSlot.hasItem()) {
		this.refreshFullSlot();
	} 
	else {
		this.refreshEmptySlot();
	}
};

// REFRESH_EMPTY_SLOT:
// ************************************************************************************************
UIItemSlot.prototype.refreshEmptySlot = function () {
	// Set emptyFrame:
	if (this.itemSlot && EQUIPMENT_SLOT_FRAMES[this.itemSlot.itemSlotType]) {
		this.emptyFrame = EQUIPMENT_SLOT_FRAMES[this.itemSlot.itemSlotType];
	}

	if (this.emptyFrame) {
		this.itemSprite.frame = this.emptyFrame;
	} 
	else {
		this.itemSprite.visible = false;
	}
	this.amountText.visible = false;
};

// REFRESH_FULL_SLOT:
// ************************************************************************************************
UIItemSlot.prototype.refreshFullSlot = function () {
	var str = '',
		item = this.itemSlot.item;
	
	// Set shields red (two handed):
	if (this.itemSlot.itemSlotType === ITEM_SLOT.SECONDARY && !gs.pc.inventory.canWieldShield()) {
		this.slotSprite.setFrames(ABILITY_SLOT_RED_FRAME + 1, ABILITY_SLOT_RED_FRAME);
	}

	// Set item icons:
	this.itemSprite.frame = item.type.frame;
	this.itemSprite.visible = true;

	// Color Modded items:
	if (item.mod > 0 && (!item.type.coolDown || this.itemSlot.itemSlotType !== ITEM_SLOT.CONSUMABLE)) {
		this.amountText.setFont('PixelFont6-Green');
	} 
	else {
		this.amountText.setFont('PixelFont6-White');
	}

	// Set item count:
	if (item.amount > 1) {

		str = '' + item.amount;
		this.amountText.visible = true;
	}
	// Showing Charges:
	else if (item.type.stats.maxCharges) {
		str = item.charges + '/' + item.getModdedStat('maxCharges');
		this.amountText.visible = true;
	}
	// Showing Cooldown:
	else if (item.type.coolDown && this.itemSlot.itemSlotType === ITEM_SLOT.CONSUMABLE) {
		// Red Cooldown Text if no mana:
		if (!item.isOn) {
			this.slotSprite.setFrames(ABILITY_SLOT_RED_FRAME + 1, ABILITY_SLOT_RED_FRAME);
			str = '-MP';
			this.amountText.visible = true;
		}
		
		// Show cooldown:
		else if (item.chargeTimer > 0) {
			this.slotSprite.setFrames(ABILITY_SLOT_RED_FRAME + 1, ABILITY_SLOT_RED_FRAME);
			str = item.chargeTimer;
			this.amountText.visible = true;
		}
	}
	// Showing Mod:
	else {
		if (item.mod > 0) {
			str = '+' + item.mod;
			this.amountText.visible = true;
		} 
		else {
			this.amountText.visible = false;
		}
	}
	
	this.amountText.setText(str);
};
// SLOT_CLICKED:
// ************************************************************************************************
UIItemSlot.prototype.slotClicked = function () {
	if (this.callback) {
		this.callback.call(this.context, this.itemSlot, this);
	}
};

// GET_ITEM:
// ************************************************************************************************
UIItemSlot.prototype.getItem = function () {
	if (this.itemSlot) {
		return this.itemSlot.item;
	}
	else {
		return null;
	}
	
};

// IS_POINTER_OVER:
// ************************************************************************************************
UIItemSlot.prototype.isPointerOver = function () {
	return this.slotSprite.isPointerOver();
};