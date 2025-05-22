/*global gs, game, console*/
/*global ROMAN_NUMERAL, MAX_TALENT_RANK*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// UI_TALENT_PANEL:
// ************************************************************************************************
function UITalentPanel (startX, startY, group) {
	this.group = game.add.group();
	
	this.startX = startX;
	this.startY = startY;
	this.width = 132 * 2;
	this.centerX = startX + this.width / 2;
	
	this.maxLines = 16;
	this.pageNum = 1;
	
	// Panel Sprite:
	gs.createSprite(startX, startY, 'TalentPanel', this.group);
	
	// Talent Points:
	this.talentPointText = gs.createText(startX + 250, startY + 8, '5', 'PixelFont6-Yellow', 12, this.group);
	this.talentPointText.setAnchor(0.5, 0);
	
	// Highlight:
	this.lineHighLight = gs.createSprite(startX + 2, 0, 'StatHighlight', this.group);
	this.lineHighLight.visible = false;
	
	// Talent Lines:
	this.talentLines = [];
	for (let i = 0; i < this.maxLines; i += 1) {
		this.talentLines[i] = new UITalentLine(startX + 8, startY + 34 + 20 * i, this.group);
	}
	
	// Title:
	this.titleText = gs.createText(startX + this.width / 2 - 10, startY + 4, 'Talents', 'PixelFont6-White', 18, this.group);
	this.titleText.setAnchor(0.5, 0);
	
	// Scroll buttons:
	this.leftButton = gs.createSmallButton(startX - 6, startY - 6, 1320, this.onLeftClicked, this, this.group);
	this.rightButton = gs.createSmallButton(startX + 204, startY - 6, 1318, this.onRightClicked, this, this.group);
	
	
	group.add(this.group);
}

// UPDATE:
// ************************************************************************************************
UITalentPanel.prototype.update = function () {
	// Hide talent buttons when holding an item:
	if (!gs.characterMenu.cursorItemSlot.isEmpty()) {
		this.talentLines.forEach(function (talentLine) {
			talentLine.button.setVisible(false);
		}, this);
	}
};

// REFRESH:
// ************************************************************************************************
UITalentPanel.prototype.refresh = function () {
	// Scroll Buttons:
	this.leftButton.setVisible(false);
	this.rightButton.setVisible(false);
	this.titleText.setText('Talents');
	
	if (gs.pc.talents.talentList.length > this.maxLines) {
		if (this.pageNum === 1) {
			this.rightButton.setVisible(true);	
		} 
		else if (this.pageNum === 2) {
			this.leftButton.setVisible(true);
		}
		this.titleText.setText('Talents ' + this.pageNum + '/2');
	}

	// Talent Points:
	this.talentPointText.setText(gs.pc.talentPoints);
	
	// Talent Points:
	if (gs.pc.talentPoints > 0) {	
		this.talentPointText.setFont('PixelFont6-Yellow');
	}
	else {
		this.talentPointText.setFont('PixelFont6-White');
	}
	
	this.talentLines.forEach(function (talentLine) {
		talentLine.clear();
	}, this);
	
	// Set the talent for each line in the known and available talent lists:
	// Sorted by tier
	let list = gs.pc.talents.talentList.slice(0);
	
	
	list.forEach(function (talent, index) {
		if (this.pageNum === 2 && index < this.maxLines) {
			return;
		}
		
		let line = this.talentLines.find(line => line.talent === null);
		
		// As long as we have found a line (not exceeded the cap) we can assign the talent:
		if (line) {
			line.setTalent(talent);
		}
	}, this);
	
	// Line High Light:
	this.lineHighLight.visible = false;
	let talentLine = this.getLineUnderPointer();
	if (talentLine) {
		this.lineHighLight.x = talentLine.text.x - 6; 
		this.lineHighLight.y = talentLine.text.y - 4;
		this.lineHighLight.visible = true;
	}
	
	// Show Reqs:
	this.talentLines.forEach(function (talentLine) {
		let talent = talentLine.talent;
		
		if (talentLine.button.isPointerOver()) {
			if (!gs.pc.talents.hasMetRequirements(talent.type.requirements[talent.rank + 1])) {
				talentLine.text.setText('Requires: ' + gs.getTalentReqStr(talent.type.requirements[talent.rank + 1]));
				talentLine.text.setFont('PixelFont6-Red');
			}			
		}						 
	}, this);
};

// GET_LINE_UNDER_POINTER:
// ************************************************************************************************
UITalentPanel.prototype.getLineUnderPointer = function () {
	if (game.input.activePointer.x > this.startX && game.input.activePointer.x < this.startX + this.width) {
		for (let i = 0; i < this.talentLines.length; i += 1) {
			if (this.talentLines[i].isPointerOver()) {
				return this.talentLines[i];
			}
		}
	}

	return null;
};

// GET_DESC_UNDER_POINTER:
// ************************************************************************************************
UITalentPanel.prototype.getDescUnderPointer = function () {
	// Mouse over learn/upgrade button:
	for (let i = 0; i < this.talentLines.length; i += 1) {
		if (this.talentLines[i].button.isPointerOver()) {
			return gs.getTalentDescription(this.talentLines[i].talent.type.name, true);
		}
	}
	
	if (this.getLineUnderPointer() && this.getLineUnderPointer().talent.type) {
		return gs.getTalentDescription(this.getLineUnderPointer().talent.type.name);
	}
	
	return null;
	
};

// GET_UPGRADE_TALENT_NAME_UNDER_POINTER:
// ************************************************************************************************
UITalentPanel.prototype.getUpgradeTalentNameUnderPointer = function () {
	for (let i = 0; i < this.talentLines.length; i += 1) {
		if (this.talentLines[i].button.isPointerOver()) {
			return this.talentLines[i].talent.type.name;
		}
	}
	
	return null;
};

// ON_LEFT_CLICKED:
// ************************************************************************************************
UITalentPanel.prototype.onLeftClicked = function () {
	this.pageNum -= 1;
	gs.playSound(gs.sounds.scroll);
	this.refresh();
};

// ON_RIGHT_CLICKED:
// ************************************************************************************************
UITalentPanel.prototype.onRightClicked = function () {
	this.pageNum += 1;
	gs.playSound(gs.sounds.scroll);
	this.refresh();
};







// UI_TALENT_LINE:
// ************************************************************************************************
function UITalentLine (startX, startY, group) {
	this.talent = null;
	
	// Text:
	this.text = gs.createText(startX, startY, 'Talent Name', 'PixelFont6-White', 12, group);
	
	// Val Text
	this.valText = gs.createText(startX + 246, startY, '0 / 2', 'PixelFont6-White', 12, group);
	this.valText.setAnchor(1, 0);
	
	// Learn Talent Button:
	this.button = gs.createSmallButton(startX + 194, startY - 12, 1312, this.onButtonClicked, this, group);
}



// ON_BUTTON_CLICKED:
// ************************************************************************************************
UITalentLine.prototype.onButtonClicked = function (button) {
	if (!gs.pc.isAlive) {
		return;
	}
	
	if (gs.characterMenu.abilityIndexOnCursor !== -1) {
		return;
	}
	
	if (gs.pc.talents.canLearnTalent(button.talentName) && gs.pc.talentPoints > 0) {
		gs.pc.talentPoints -= 1;
		gs.pc.talents.learnTalent(button.talentName);
		gs.playSound(gs.sounds.point);
		
		gs.characterMenu.refresh();
	}	
};

// SET_TALENT:
// ************************************************************************************************
UITalentLine.prototype.setTalent = function (talent) {
	this.talent = talent;
	
	// Setup Text:
	this.text.visible = true;
	this.text.setText('*' + gs.capitalSplit(this.talent.type.name));
	
	this.valText.visible = true;
	this.valText.setText(talent.rank);
	
	// Color:
	if (talent.rank > 0) {
		this.text.setFont('PixelFont6-Green');
		this.valText.setFont('PixelFont6-Green');
	}
	else {
		this.text.setFont('PixelFont6-White');
		this.valText.setFont('PixelFont6-White');
	}
	
	// Button:
	this.button.setVisible(true);
	this.button.talentName = this.talent.type.name;
	
	// Max Rank (hide):
	if (talent.rank == MAX_TALENT_RANK) {
		this.button.setVisible(false);
	}
	// Reqs Met + Talent Point: Yellow
	else if (gs.pc.talents.canLearnTalent(talent.type.name) && gs.pc.talentPoints > 0) {
		this.button.setFrames(1317);
	}
	// Reqs Met + No Talent Point: White
	else if (gs.pc.talents.canLearnTalent(talent.type.name) && gs.pc.talentPoints === 0) {
		this.button.setFrames(1313);
	}
	else {
		this.button.setFrames(1315);
	}

};

// IS_POINTER_OVER:
// ************************************************************************************************
UITalentLine.prototype.isPointerOver = function () {
	return game.input.activePointer.x > this.text.x
		&& game.input.activePointer.x < this.text.x + 263
		&& game.input.activePointer.y >= this.text.y - 6 // -2
		&& game.input.activePointer.y < this.text.y + 16 // + 18
		&& this.text.visible;
};

// CLEAR:
// ************************************************************************************************
UITalentLine.prototype.clear = function () {
	this.text.visible = false;
	this.valText.visible = false;
	this.button.setVisible(false);
	this.talent = null;
};