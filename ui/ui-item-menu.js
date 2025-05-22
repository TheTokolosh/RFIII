/*global gs, game, console, input*/
/*global UIItemSlotList, UIMenuBase*/
/*global HUD_START_X, SCREEN_HEIGHT, HUGE_WHITE_FONT, SMALL_WHITE_FONT*/
/*jshint esversion: 6*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UIItemMenu() {}
UIItemMenu.prototype = new UIMenuBase();

// INIT:
// ************************************************************************************************
UIItemMenu.prototype.init = function (titleStr) {
	UIMenuBase.prototype.init.call(this, titleStr);
	
	// List containing all usable items:
	this.uiItemSlotList = new UIItemSlotList(this.startX + 6, this.startY + 40, 2, 10, null, this.slotClicked, this, this.group);
	
	// Adjust position of slots:
	for (let i = 0; i < 20; i += 1) {
		let x = this.uiItemSlotList.x + Math.floor(i / 10) * (this.width / 2 - 6),
			y = this.uiItemSlotList.y + (i % 10) * 54;
		
		this.uiItemSlotList.uiItemSlots[i].setPosition(x, y);
	}
	
	// Text:
	this.itemText = [];
	for (let i = 0; i < 20; i += 1) {
		this.itemText[i] = gs.createText(this.uiItemSlotList.uiItemSlots[i].x + 52, this.uiItemSlotList.uiItemSlots[i].y + 24, '', 'PixelFont6-White', 12, this.group);
		this.itemText[i].lineSpacing = -5;
		this.itemText[i].setAnchor(0, 0.5);
	}
};

// CAPTURE_KEY_DOWN:
// Return true if we handled the key:
// ************************************************************************************************
UIItemMenu.prototype.captureKeyDown = function (key) {
	var index = input.getIndexOfKey(key);
	
	if (index < 0 || index > 15) {
		return false;
	}
	
	if (this.uiItemSlotList.uiItemSlots[index - 1].slotSprite.visible) {
		this.slotClicked(this.uiItemSlotList.uiItemSlots[index - 1].itemSlot);
	}
	
	return true;
};

// REFRESH:
// ************************************************************************************************
UIItemMenu.prototype.refresh = function () {
	this.uiItemSlotList.refresh();
	
	// Hide slots which contain no item:
	for (let i = 0; i < this.uiItemSlotList.uiItemSlots.length; i += 1) {
		if (!this.uiItemSlotList.uiItemSlots[i].itemSlot || this.uiItemSlotList.uiItemSlots[i].itemSlot.isEmpty()) {
			this.uiItemSlotList.uiItemSlots[i].slotSprite.visible = false;
			this.itemText[i].visible = false;
		} 
		else {
			this.uiItemSlotList.uiItemSlots[i].slotSprite.visible = true;
			this.itemText[i].visible = true;
		}
	}
	
	// Display text of remaining slots:
	for (let i = 0; i < this.uiItemSlotList.uiItemSlots.length; i += 1) {
		if (this.itemText[i].visible) {
			let str = '';
			
			str += '[' + input.getKeyOfIndex(i + 1) + '] ';
			str += this.itemDesc(this.uiItemSlotList.uiItemSlots[i].itemSlot.item);
				
			this.itemText[i].setText(str);
		}
	}
};

// OPEN:
// ************************************************************************************************
UIItemMenu.prototype.open = function () {
	this.uiItemSlotList.setItemSlots(this.validItemSlotList());
	gs.pc.stopExploring();
	this.refresh();
	this.group.visible = true;
};

// GET_DESC_UNDER_POINTER:
// ************************************************************************************************
UIItemMenu.prototype.getDescUnderPointer = function () {
	if (this.uiItemSlotList.getItemUnderPointer()) {
		return this.uiItemSlotList.getItemUnderPointer().toLongDesc();
	}
	
	return null;
};