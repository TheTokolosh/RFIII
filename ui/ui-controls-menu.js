/*global game, gs, console, nw, window, input, util*/
/*global UIMenuBase*/
/*global LARGE_WHITE_FONT, HUGE_WHITE_FONT, HEALTH_BAR_FRAME*/
/*global HUD_START_X, SCREEN_HEIGHT*/
/*jshint esversion: 6*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UIControlsMenu() {	
	UIMenuBase.prototype.init.call(this, 'Game Controls');
	
	// Create Catagory buttons:
	this.catagoryButtons = [];
	['Navigation', 'Actions', 'UI'].forEach(function (name, i) {
		this.catagoryButtons[i] = this.createTextButton(this.startX + 114 + i * 124, this.startY + 60, name, this.catagoryButtonClicked, this, this.group, 'SmallButton');
		this.catagoryButtons[i].catagoryName = name;
	}, this);
	
	// Create Binding Interface:
	this.actionBindingInterfaces = [];
	let spacing = 32;
	for (let i = 0; i < 14; i += 1) {
		this.actionBindingInterfaces[i] = new UIBindingInterface(this.startX + 54, this.startY + 100 + i * spacing, this.onButtonClicked, this, this.group);
	}
	
	// Defaults button:
	this.defaultsButtons = this.createTextButton(this.startX + this.width / 2, this.startY + this.height - 52, 'Restore Defaults', this.onRestoreDefaults, this, this.group);

	this.group.visible = false;
}
UIControlsMenu.prototype = new UIMenuBase();

// REFRESH:
// ************************************************************************************************
UIControlsMenu.prototype.refresh = function () {
	var actionList = input.getActionList(this.currentCatagory);
	
	
	this.actionBindingInterfaces.forEach(function (bindingInterface, i) {		
		if (i < actionList.length) {
			bindingInterface.setAction(actionList[i].name);
			bindingInterface.refresh();
			bindingInterface.setVisible(true);
		}
		else {
			bindingInterface.setVisible(false);
		}
	}, this);
};


// CAPTURE_KEY_DOWN:
// ************************************************************************************************
UIControlsMenu.prototype.captureKeyDown = function (key) {
	// Player is not rebinding a key so we don't capture escape.
	// Allows escape to exit the menu
	if (key.name === 'ESC' && !this.actionName) {
		return false; // Don't capture key
	}
	
	// Capture the escape key to cancel rebinding:
	if (key.name === 'ESC' && this.actionName) {
		input.destroyKeyBinding(this.actionName, this.actionSlot);
		this.stopRebind();
		this.refresh();
		return true; // Captured key
	}
	
	// Currently rebinding:
	if (this.actionName && !util.inArray(key.name, input.unbindableKeys)) {
		input.destroyKeyBinding(this.actionName, this.actionSlot);
		input.createKeyBinding(this.actionName, this.actionSlot, key.name, input.getKeyModifier());
		this.stopRebind();
		this.refresh();
		return true; // Captured key
	}
	
	return true;
};

// STOP_REBIND:
// Stops the rebinding action
// ************************************************************************************************
UIControlsMenu.prototype.stopRebind = function () {
	this.actionName = null;
	this.actionSlot = -1;
};


// ON_RESTORE_DEFAULTS:
// ************************************************************************************************
UIControlsMenu.prototype.onRestoreDefaults = function () {
	var dialog = [{}],
		yesClicked;
	
	yesClicked = function () {
		input.setDefaultKeyBindings();
		input.saveKeyBindings();
		this.refresh();
	}.bind(this);

	dialog[0].text = 'Are you sure you want to reset all keys to default?';
	dialog[0].responses = [
		{text: 'Yes', nextLine: 'exit', func: yesClicked, keys: ['accept']},
		{text: 'No', nextLine: 'exit', keys: ['escape']}
	];
	
	gs.messageQueue.pushMessage(dialog);
};

// ON_BUTTON_CLICKED:
// ************************************************************************************************
UIControlsMenu.prototype.onButtonClicked = function (button) {	
	this.actionName = button.actionName;
	this.actionSlot = button.actionSlot;
	
	this.refresh();
	
};

// CATAGORY_BUTTON_CLICKED:
// ************************************************************************************************
UIControlsMenu.prototype.catagoryButtonClicked = function (button) {
	this.currentCatagory = button.catagoryName;
	this.stopRebind();
	this.refresh();
};

// OPEN:
// ************************************************************************************************
UIControlsMenu.prototype.open = function () {
	this.stopRebind();
	
	this.currentCatagory = 'Navigation';
	
	this.refresh();
	gs.timer.pause();
	this.group.visible = true;
	this.resetButtons();
};

// CLOSE:
// ************************************************************************************************
UIControlsMenu.prototype.close = function () {
	input.saveKeyBindings();	
	this.group.visible = false;
};

// IS_OPEN:
// ************************************************************************************************
UIControlsMenu.prototype.isOpen = function () {
	return this.group.visible;
};

// UI_BINDING_INTERFACE_CONSTRUCTOR:
// ************************************************************************************************
function UIBindingInterface (x, y, callBack, context, group) {
	let spacing = 124;
	
	this.group = game.add.group();
	
	this.actionName = null;
	
	this.actionButton = gs.createTextButton(x + 100, y, 'Action', null, null, this.group);
	
	this.keySlots = [];
	for (let i = 0; i < 3; i += 1) {
		this.keySlots[i] = gs.createTextButton(x + 264 + i * spacing, y, 'Key', callBack, context, this.group, 'SmallButton');
		this.keySlots[i].actionSlot = i;
	}
	
	group.add(this.group);
}

// SET_ACTION:
// ************************************************************************************************
UIBindingInterface.prototype.setAction = function (actionName) {
	this.actionName = actionName;
	this.keySlots[0].actionName = actionName;
	this.keySlots[1].actionName = actionName;
	this.keySlots[2].actionName = actionName;
	
};

// REFRESH:
// ************************************************************************************************
UIBindingInterface.prototype.refresh = function () {
	var binding;
	
	this.actionButton.setText(gs.capitalSplit(this.actionName));
	
	for (let i = 0; i < 3; i += 1) {
		binding = input.getKeyBinding(this.actionName, i);
			
		// We are currently rebinding this slot:
		if (gs.controlsMenu.actionName === this.actionName && gs.controlsMenu.actionSlot === i) {
			this.keySlots[i].setText('...');
		}
		// There is a keyCombo bound to this slot:
		else if (binding) {
			this.keySlots[i].setText(input.getKeyComboStr(binding.keyName, binding.keyModifier));
		}
		// There is no keyCombo bound to this slot:
		else {
			this.keySlots[i].setText('');
		}
	}
};

// SET_VISIBLE:
// ************************************************************************************************
UIBindingInterface.prototype.setVisible = function (b) {
	this.group.visible = b;
};