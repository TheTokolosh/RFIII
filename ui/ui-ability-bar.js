/*global game, gs, console, Phaser*/
/*global ABILITY_SLOT_FRAME, ABILITY_SLOT_RED_FRAME*/
/*global SMALL_WHITE_FONT, SCALE_FACTOR, TILE_SIZE, SLOT_SELECT_BOX_FRAME, ABILITY_SLOT_GREEN_FRAME*/
/*jshint esversion: 6*/
'use strict';

function UIAbilityBar(startX, startY, numSlotsX, numSlotsY, group) {
	var i = 0,
		x,
		y;

	this.abilityList = gs.pc.abilities.list;
	this.group = game.add.group();
	this.abilitySlots = [];
	this.abilityIcons = [];
	this.abilityText = []; // cooldown
	
	this.numSlotsX = numSlotsX;
	this.numSlotsY = numSlotsY;

	// Create ability slots:
	for (y = 0; y < this.numSlotsY; y += 1) {
        for (x = 0; x < this.numSlotsX; x += 1) {
			let posX = startX + x * (48 + SCALE_FACTOR),
				posY = startY + y * (48 + SCALE_FACTOR);
			
			// AbilitySlots:
			this.abilitySlots[i] = gs.createButton(posX, posY, 'UISlot', ABILITY_SLOT_FRAME + 1, this.slotClicked, this, this.group);
			this.abilitySlots[i].slot = -1;
		
			// Ability Icons:
			this.abilityIcons[i] = gs.createSprite(posX + 4, posY + 4, 'Tileset', this.group);
			
			// Ability Text:
			this.abilityText[i] = gs.createText(posX + 46, posY + 48, '10', 'PixelFont6-White', 12, this.group);
			this.abilityText[i].setAnchor(1, 1);
			
			i += 1;
		}
	}
	
	// Selected Ability Sprite:
	this.selectedAbilitySprite = gs.createSprite(0, 0, 'UISlot', this.group);
    this.selectedAbilitySprite.frame = SLOT_SELECT_BOX_FRAME;
	this.selectedAbilitySprite.visible = false;

	group.add(this.group);
}

// CLEAR:
// ************************************************************************************************
UIAbilityBar.prototype.clear = function () {
	this.abilitySlots.forEach(function (slot) {
		slot.slot = -1;
	}, this);
};

// REFRESH:
// ************************************************************************************************
UIAbilityBar.prototype.refresh = function () {
	this.selectedAbilitySprite.visible = false;
	
	for (let i = 0; i < this.abilitySlots.length; i += 1) {
		let slot = this.abilitySlots[i].slot,
			ability = this.abilityList[slot],
			abilitySlot = this.abilitySlots[i],
			abilityIcon = this.abilityIcons[i],
			abilityText = this.abilityText[i];
		
		if (slot !== -1 && ability) {
			// Set item icons:
			abilityIcon.frame = ability.type.frame;
			abilityIcon.visible = true;
			
			// Sustained on:
			if (ability.type.isSustained && ability.isOn) {
				abilitySlot.setFrames(ABILITY_SLOT_GREEN_FRAME + 1, ABILITY_SLOT_GREEN_FRAME);
			}
			// Red Frame (cannot use):
			else if (gs.pc.cannotUseAbility(slot)) {
				abilitySlot.setFrames(ABILITY_SLOT_RED_FRAME + 1, ABILITY_SLOT_RED_FRAME);
			}
			else {
				abilitySlot.setFrames(ABILITY_SLOT_FRAME + 1, ABILITY_SLOT_FRAME);
			}
		
			abilityText.setFont('PixelFont6-White');
		
			// Cooldown:
			if (ability.coolDown > 0) {
				abilityText.setText(ability.coolDown);
				abilityText.visible = true;
			}
			else {
				abilityText.visible = false;
			}
			
			
			if (gs.stateManager.isCurrentState('UseAbility') && ability === gs.pc.selectedAbility) {
				this.selectedAbilitySprite.x = abilitySlot.x;
				this.selectedAbilitySprite.y = abilitySlot.y;
				this.selectedAbilitySprite.visible = true;
			}
			
			
		} 
		else {
			abilityIcon.visible = false;
			abilityText.visible = false;
			abilitySlot.setFrames(ABILITY_SLOT_FRAME + 1, ABILITY_SLOT_FRAME);
		}
	}
};

// SLOT_CLICKED:
// ************************************************************************************************
UIAbilityBar.prototype.slotClicked = function (button) {
	// Clicking in character menu will rearange abilities:
	if (gs.stateManager.isCurrentState('CharacterMenu')) {
		// Picking up ability:
		if (gs.characterMenu.abilityIndexOnCursor === -1 && this.abilityList[button.slot] && gs.characterMenu.cursorItemSlot.isEmpty()) {
			gs.characterMenu.abilityIndexOnCursor = button.slot;
			button.slot = -1;
			this.refresh();
		}
		// Placing ability in occupied slot (swap):
		else if (gs.characterMenu.abilityIndexOnCursor !== -1 && this.abilityList[button.slot]) {
			let tempSlot = button.slot;
			button.slot = gs.characterMenu.abilityIndexOnCursor;
			gs.characterMenu.abilityIndexOnCursor = tempSlot;
			this.refresh();
			
		}
		// Placing ability in empty slot:
		else if (gs.characterMenu.abilityIndexOnCursor !== -1){
			button.slot = gs.characterMenu.abilityIndexOnCursor;
			gs.characterMenu.abilityIndexOnCursor = -1;
			this.refresh();
		}
	}
	// Clicking in game mode will toggle abilities:
	else if (this.abilityList[button.slot]){
		gs.pc.clickAbility(button.slot);
	}
};

// ADD_ABILITY:
// Adds ability at abilitySlot to the next open buttonSlot (slot = -1)
// ************************************************************************************************
UIAbilityBar.prototype.addAbility = function (abilitySlot) {
	for (let i = 0; i < this.abilitySlots.length; i += 1) {
		if (this.abilitySlots[i].slot === -1) {
			this.abilitySlots[i].slot = abilitySlot;
			return;
		}
	}
};

// REMOVE_ABILITY:
// Removes the ability at abilitySlot:
// ************************************************************************************************
UIAbilityBar.prototype.removeAbility = function (abilitySlot) {
	for (let i = 0; i < this.abilitySlots.length; i += 1) {
		if (this.abilitySlots[i].slot === abilitySlot) {
			this.abilitySlots[i].slot = -1;
			return;
		}
	}
	
	//throw 'Could not remove ability from abilityBar';
};

// GET_ABILITY_UNDER_POINTER:
// ************************************************************************************************
UIAbilityBar.prototype.getAbilityUnderPointer = function () {
	for (let i = 0; i < this.abilitySlots.length; i += 1) {
		if (this.abilitySlots[i].isPointerOver() && this.abilitySlots[i].slot !== -1) {
			return this.abilityList[this.abilitySlots[i].slot];
		}
	}
	return null;
};

// TO_DATA:
// ************************************************************************************************
UIAbilityBar.prototype.toData = function () {
	var data = [];
	
	for (let i = 0; i < this.abilitySlots.length; i += 1) {
		data.push(this.abilitySlots[i].slot);
	}
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
UIAbilityBar.prototype.loadData = function (data) {
	for (let i = 0; i < this.abilitySlots.length; i += 1) {
		this.abilitySlots[i].slot = data[i];
	}
};
