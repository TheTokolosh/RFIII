/*global game, gs, Phaser, console, util*/
/*global UIMenuBase*/
/*global HUGE_WHITE_FONT, SCREEN_HEIGHT, LARGE_WHITE_FONT, HUD_START_X*/
/*global LIBRARY_SIZE, LIBRARY_TALENT_COST*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UILibraryMenu() {
	var spacing = 34;
	
	UIMenuBase.prototype.init.call(this, 'The Librarian');
	
	// Talent Buttons:
	this.talentButtons = [];
	for (let i = 0; i < LIBRARY_SIZE; i += 1) {
		this.talentButtons[i] = this.createTextButton(this.startX + this.width / 2, this.startY + 60 + spacing * i, 'Default', this.onTalentClicked, this, this.group);
	}
	
	// Gold Text:
	this.goldText = gs.createText(this.startX + this.width / 2, this.startY + 384, '', 'PixelFont6-White', 12, this.group);
	this.goldText.setAnchor(0.5, 0);
	
	// Desc Text:
	this.descText = gs.createText(this.startX + this.width / 2, this.startY + 404, '', 'PixelFont6-White', 12, this.group);
	this.descText.setAnchor(0.5, 0);
	
	this.group.visible = false;
}
UILibraryMenu.prototype = new UIMenuBase();

// UPDATE:
// ************************************************************************************************
UILibraryMenu.prototype.update = function () {
	var str = '';
	
	for (let i = 0; i < LIBRARY_SIZE; i += 1) {
		if (this.talentButtons[i].button.input.checkPointerOver(game.input.activePointer)) {
			let talentType = gs.talents[this.talentButtons[i].talentName];
			
			// Can Learn:
			if (gs.pc.talents.hasMetRequirements(talentType.requirements[1])) {
				str = 'Learn ' + gs.capitalSplit(talentType.name) + ' for ' + LIBRARY_TALENT_COST + ' gold';
			}
			// Cannot Learn:
			else {
				str = 'Requires ' + gs.getTalentReqStr(talentType.requirements[1]);
			}
		}
	}
	
	this.descText.setText(str);
};

// REFRESH:
// ************************************************************************************************
UILibraryMenu.prototype.refresh = function () {
	var talentNames = gs.libraryTalents;
	
	talentNames = talentNames.filter(talentName => gs.pc.talents.canAddTalent(talentName));
	
	let validList = talentNames.filter(talentName => gs.pc.talents.hasMetRequirements(gs.talents[talentName].requirements[1]));
	let invalidList = talentNames.filter(talentName => !gs.pc.talents.hasMetRequirements(gs.talents[talentName].requirements[1]));
	talentNames = validList.concat(invalidList);
	
	for (let i = 0; i < LIBRARY_SIZE; i += 1) {
		if (i < talentNames.length) {
			this.talentButtons[i].setVisible(true);
			this.talentButtons[i].setText(gs.capitalSplit(talentNames[i]));
			this.talentButtons[i].talentName = talentNames[i];
			
			
			let talentType = gs.talents[talentNames[i]];
			if (gs.pc.talents.hasMetRequirements(talentType.requirements[1])) {
				this.talentButtons[i].setFont('PixelFont6-White');
			}
			else {
				this.talentButtons[i].setFont('PixelFont6-Red');
			}
			
		}
		else {
			this.talentButtons[i].setVisible(false);
		}
	}
	
	this.goldText.setText('Gold: ' + gs.pc.inventory.gold);
};

// ON_TALENT_CLICKED:
// ************************************************************************************************
UILibraryMenu.prototype.onTalentClicked = function (button) {
	let talentType = gs.talents[button.talentName];
	
	if (gs.pc.inventory.gold >= LIBRARY_TALENT_COST && gs.pc.talents.hasMetRequirements(talentType.requirements[1])) {
	
		gs.pc.inventory.gold -= LIBRARY_TALENT_COST;
		
		gs.pc.talents.addTalent(button.talentName);
		gs.pc.talents.learnTalent(button.talentName);
		gs.playSound(gs.sounds.point);
		
		util.removeFromArray(button.talentName, gs.libraryTalents);
		
		this.refresh();
	}
};

// OPEN:
// ************************************************************************************************
UILibraryMenu.prototype.open = function () {
	gs.pc.stopExploring();
	this.refresh();
	this.group.visible = true;
	this.resetButtons();
};

// GET_DESC_UNDER_POINTER:
// ************************************************************************************************
UILibraryMenu.prototype.getDescUnderPointer = function () {
	for (let i = 0; i < this.talentButtons.length; i += 1) {
		if (this.talentButtons[i].isPointerOver()) {
			return gs.getTalentDescription(this.talentButtons[i].talentName, true);
		}
	}
	
	return null;
};