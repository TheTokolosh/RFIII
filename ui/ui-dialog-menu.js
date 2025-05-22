/*global game, gs, console, util*/
/*global UITextBox, UIResponseButton*/
/*global FONT_NAME, LARGE_WHITE_FONT, HUD_START_X, SCREEN_HEIGHT*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';


let NUM_DIALOG_LINES = 9;
let MAX_RESPONSES = 7;

// UI_DIALOG_MENU:
// *****************************************************************************
function UIDialogMenu() {
	var width = 480,
        height = 520,
		sprite,
		text,
		startX = HUD_START_X / 2 - width / 2,
		startY = 440;
	
	this.defaultPosition = {x: startX, y: startY};
	this.longDialogPosition = {x: startX, y: startY - 200};
		 
    // Group:
    this.group = game.add.group();
    this.group.fixedToCamera = true;
    
	// Text Box Title:
	this.textBoxTitleSprite = gs.createSprite(0, 0, 'TextBoxTitle', this.group);
	this.textBoxTitleSprite.anchor.setTo(0.5, 0);
	this.textBoxTitleText = gs.createText(0, 0, 'Default Text', 'PixelFont6-White', 12, this.group);
	this.textBoxTitleText.setAnchor(0.5, 0);
	
	// Text Box:
    this.textBox = new UITextBox({x: startX + 20, y: startY + 20}, this.group);

	// Response Buttons:
	this.responseButtonsStartY = startY + NUM_DIALOG_LINES * 18 + 6;
	this.buttons = [];
	for (let i = 0; i < MAX_RESPONSES; i += 1) {
		this.buttons[i] = gs.createResponseButton(startX + 20, startY + 258 + 20 * i, this.buttonClicked, this, this.group);
		this.buttons[i].index = i;
	}
	
	this.setPosition(startX, startY);

	this.group.visible = false;
}

// SET_POSITION: 
// ************************************************************************************************
UIDialogMenu.prototype.setPosition = function (x, y) {
	this.textBox.setPosition(x, y);
	
	this.textBoxTitleSprite.x = x + this.textBox.sprite.width / 2;
	this.textBoxTitleSprite.y = y - 24;
	this.textBoxTitleText.x = x + this.textBox.sprite.width / 2;
	this.textBoxTitleText.y = y - 18;
	
	for (let i = 0; i < MAX_RESPONSES; i += 1) {
		this.buttons[i].setPosition(x, y + 162 + 36 * i);
	}
	
	this.responseButtonsStartY = y + NUM_DIALOG_LINES * 18 + 20;
};

// SET_TITLE:
// ************************************************************************************************
UIDialogMenu.prototype.setTitle = function (text) {
	//this.titleText.setText(text);
};

// SET_TEXT:
// ************************************************************************************************
UIDialogMenu.prototype.setText = function (text) {
	this.textBox.setText(text);
};

// OPEN:
// ************************************************************************************************
UIDialogMenu.prototype.open = function (dialog) {
	var lineIndex = 0;
	
	if (gs.pc) {
		gs.pc.statusEffects.onOpenDialog();
		
		gs.pc.isTravelling = false;
	}
	
	for (let i = 0; i < this.buttons.length; i += 1) {
		this.buttons[i].button.frame = 0;
	}
	
	if (dialog) {
		this.setDialog(dialog[0]);
		
		// this.dialog is refering to the dialog from menus:
		this.dialog = dialog;
	} 
	else {

		// NPC Has Dialog:
		if (gs.dialog[gs.dialogNPC.name]) {
			// Has an init function:
			if (gs.dialogInit[gs.dialogNPC.name]) {
				this.setDialog(gs.dialog[gs.dialogNPC.name][gs.dialogInit[gs.dialogNPC.name]()]);

			// Does not have an init function:
			} else {
				this.setDialog(gs.dialog[gs.dialogNPC.name][0]);
			}

		// NPC Has No Dialog:
		} else {
			this.setDialog(gs.dialog.Default[0]);
		}
	}

	this.group.visible = true;
	
	// Pause Timer:
	if (gs.timer) {
		gs.timer.pause();
	}
	
};

// CLOSE:
// ************************************************************************************************
UIDialogMenu.prototype.close = function () {
	this.dialog = null;
	this.group.visible = false;
	
	// unpause Timer:
	if (gs.timer) {
		gs.timer.resume();
	}
	
};

// SET_DIALOG:
// ************************************************************************************************
UIDialogMenu.prototype.setDialog = function (dialog) {
	var i, responseButtonIndex = 0;

	if (!dialog) {
		throw 'No Dialog (did you forget a default in the init function?';
	}
	
	if (!dialog.text) {
		throw 'DialogError: Missing text list, did you spell it wrong AGAIN?';
	}
	
	this.currentDialog = dialog;
	
	// Setting Title:
	if (dialog.title) {
		this.textBoxTitleSprite.visible = true;
		this.textBoxTitleText.visible = true;
		this.textBoxTitleText.setText(dialog.title);
	}
	else {
		this.textBoxTitleSprite.visible = false;
		this.textBoxTitleText.visible = false;
	}
	
	// Setting Text:
	if (typeof dialog.text === 'function') {
		this.setText(dialog.text());
	}
	else {	
		this.setText(dialog.text);
	}

	for (i = 0; i < MAX_RESPONSES; i += 1) {
		this.buttons[i].setVisible(false);
	}

	if (!dialog.responses) {
		throw 'DialogError: Missing responses list, did you spell it wrong AGAIN?';
	}

	// Set Dialog Responses:
	for (i = 0; i < MAX_RESPONSES; i += 1) {
		if (i < dialog.responses.length && (!dialog.responses[i].prereq || dialog.responses[i].prereq())) {
			let button = this.buttons[responseButtonIndex];
			
			button.setVisible(true);
			
			let text;
			
			// Setting Text:
			if (typeof dialog.responses[i].text === 'function') {
				text = dialog.responses[i].text();
			}
			else {	
				text = dialog.responses[i].text;
			}
			
			button.setText((i + 1) + '. ' + text);
			
			// Special Color:
			if (dialog.responses[i].font) {
				button.setFont(dialog.responses[i].font);
			}
			// Default:
			else {
				button.setFont('PixelFont6-White');
			}
			
			
			// Set Index:
			button.index = i;
			
			// Set Description:
			if (dialog.responses[i].desc) {
				button.desc = dialog.responses[i].desc;
			}
			else {
				button.desc = null;
			}
			
			responseButtonIndex += 1;
		}
	}

	// Apply dialog function (if it exists):
	if (dialog.func) {
		dialog.func();
	}
	
	// Set Position:
	this.setPosition(this.defaultPosition.x, SCREEN_HEIGHT - 146 - 18 - responseButtonIndex * 36);
};

// ACCEPT_CLICKED:
// Will look for and 'click' a response in which keys contains 'accept'
// ************************************************************************************************
UIDialogMenu.prototype.acceptClicked = function () {
	this.currentDialog.responses.forEach(function (response, i) {
		if (response.keys && util.inArray('accept', response.keys)) {
			this.buttonClicked({index: i});
		}
	}, this);
};

// ESCAPE_CLICKED:
// Will look for and 'click' a response in which keys contains 'escape'
// ************************************************************************************************
UIDialogMenu.prototype.escapeClicked = function () {
	this.currentDialog.responses.forEach(function (response, i) {
		if (response.keys && util.inArray('escape', response.keys)) {
			this.buttonClicked({index: i});
		}
	}, this);
};

// BUTTON_CLICKED:
// ************************************************************************************************
UIDialogMenu.prototype.buttonClicked = function (button) {
	var response;
	
	if (this.currentDialog.responses.length <= button.index) {
		return;
	}
	
	response = this.currentDialog.responses[button.index];
	
	// Prereq:
	if (response.prereq && !response.prereq()) {
		return;
	}
	
	
	
	// No next line (same dialog):
	if (response.nextLine === 'none') {
		// Pass
	}
	// Exiting:
	else if (response.nextLine === 'exit') {
		gs.stateManager.popState();
	}
	// Opening Shop:
	else if (response.nextLine === 'barter') {
		gs.stateManager.popState();
		gs.stateManager.pushState('ShopMenu');
	}
	// Opening Library:
	else if (response.nextLine === 'library') {
		gs.stateManager.popState();
		gs.stateManager.pushState('LibraryMenu');
	}
	// Different Line:
	else {
		// Dialog from menus:
		if (this.dialog) {
			this.setDialog(this.dialog[response.nextLine]);
		} 
		// Dialog from npcs:
		else {
			this.setDialog(gs.dialog[gs.dialogNPC.name][response.nextLine]);
		}
	}
	
	// Call a function on a response
	if (response.func) {
		response.func();
	}
	
};

// GET_DESC_UNDER_POINTER:
// ************************************************************************************************
UIDialogMenu.prototype.getDescUnderPointer = function () {
	for (let i = 0; i < this.buttons.length; i += 1) {
		if (this.buttons[i].isPointerOver() && this.buttons[i].desc) {
			return this.buttons[i].desc;
		}
	}
	
	return null;
};


// CAPTURE_KEY_DOWN:
// ************************************************************************************************
UIDialogMenu.prototype.captureKeyDown = function (key) {
	// Space or Enter are used to accept:
	if (key.name === 'SPACEBAR' || key.name === 'ENTER') {
		this.acceptClicked();
		return true;
	}
	
	return false;
};

