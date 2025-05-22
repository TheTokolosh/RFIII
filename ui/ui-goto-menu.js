/*global gs, game, Phaser*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UIGotoMenu() {
	var startX = 36,
		startY = 100,
		width = 426 * 2;

	this.group = game.add.group();
	this.group.fixedToCamera = true;
	
	// Menu Sprite:
	let sprite = gs.createSprite(startX, startY, 'SmallCharacterMenu', this.group);
	
	this.zoneButtons = {};
	
	// Main Dungeon:
	this.zoneButtons.TheUpperDungeon = this.createZoneIcons(startX + 8, startY + 8);
	/*
	this.zoneButtons.Wilderness = this.createZoneIcons(startX + 8 + 210 * 1, startY + 8);
	this.zoneButtons.Tier3 = this.createZoneIcons(startX + 8 + 210 * 2, startY + 8);
	this.zoneButtons.TheVaultOfYendor = this.createZoneIcons(startX + 8 + 210 * 3, startY + 8);
	
	// Branches:
	this.zoneButtons.Branch1 = this.createBranchZoneIcons(this.zoneButtons.Tier3[0].x, startY + 70);
	this.zoneButtons.Branch2 = this.createBranchZoneIcons(this.zoneButtons.Tier3[3].x, startY + 70);
	*/
	
	
	this.group.visible = false;
}

// CREATE_ZONE_ICONS:
// ************************************************************************************************
UIGotoMenu.prototype.createZoneIcons = function (startX, startY) {
	let list = [];
	
	for (let i = 0; i < 4; i += 1) {
		/*
		let button = gs.createButton(startX, startY + i * 28, 'UISlot', 33, this.onLevelClicked, this, this.group);
		button.button.hitArea = new Phaser.Rectangle(7, 7, 11, 11);
		list.push(button);
		*/
		
		let sprite = gs.createSprite(startX, startY + i * 26, 'UISlot', this.group);
		sprite.frame = 32;
		
	}
	
	return list;
};

// CREATE_BRANCH ZONE_ICONS:
// ************************************************************************************************
UIGotoMenu.prototype.createBranchZoneIcons = function (startX, startY) {
	let list = [];
	
	for (let i = 0; i < 4; i += 1) {
		list.push(gs.createButton(startX, startY + i * 46, 'UISlot', 33, this.onLevelClicked, this, this.group));
	}
	
	return list;
};

// ON_LEVEL_CLICKED:
// ************************************************************************************************
UIGotoMenu.prototype.onLevelClicked = function (button) {
	
};


// REFRESH:
// ************************************************************************************************
UIGotoMenu.prototype.refresh = function () {
	
};

// UPDATE:
// ************************************************************************************************
UIGotoMenu.prototype.update = function () {
	
};

// OPEN:
// ************************************************************************************************
UIGotoMenu.prototype.open = function () {
	gs.pc.stopExploring();
	this.refresh();
	this.group.visible = true;
	gs.playSound(gs.sounds.scroll);
};

// CLOSE:
// ************************************************************************************************
UIGotoMenu.prototype.close = function () {
	this.group.visible = false;
	gs.playSound(gs.sounds.scroll);
};