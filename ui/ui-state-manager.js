/*global gs, console*/
/*global ASSERT_EQUAL*/
/*jshint esversion: 6*/
'use strict';

// UI_STATE_MANAGER:
// ************************************************************************************************
function UIStateManager () {
	this.states = {
		// Game States:
		GameState: 			{},
		ZoningState:		{},
		UseAbility:			{},
		EndTurn:			{},
		
		// Game Menus:
		DialogMenu:			{menu: gs.dialogMenu},
		GameMenu:			{menu: gs.gameMenu, canEsc: true},
		ControlsMenu:		{menu: gs.controlsMenu, canEsc: true},
		OptionsMenu:		{menu: gs.optionsMenu, canEsc: true},
		ShopMenu:			{menu: gs.shopMenu, canEsc: true},
		LibraryMenu:		{menu: gs.libraryMenu, canEsc: true},
		EnchantmentMenu:	{menu: gs.enchantmentMenu, canEsc: true},
		AcquirementMenu:	{menu: gs.acquirementMenu, canEsc: true},
		CharacterMenu:		{menu: gs.characterMenu, canEsc: true},
		TransferanceMenu:	{menu: gs.transferanceMenu, canEsc: true},
		UseMenu:			{menu: gs.useMenu, canEsc: true},
		WieldMenu:			{menu: gs.wieldMenu, canEsc: true},
		GotoMenu:			{menu: gs.gotoMenu, canEsc: true},
		
		// Main Menus:
		MainMenu:			{menu: gs.mainMenu},
		NewGameMenu:		{menu: gs.newGameMenu, canEsc: true},
		SeedGameMenu:		{menu: gs.seedGameMenu, canEsc: true},
		ClassSelectMenu:	{menu: gs.classSelectMenu, canEsc: true},
		RaceSelectMenu:		{menu: gs.raceSelectMenu, canEsc: true},
		RecordMenu:			{menu: gs.recordMenu, canEsc: true},
		StatTablesMenu:		{menu: gs.statTablesMenu, canEsc: true},
	};
	
	gs.nameTypes(this.states);
	
	this.stateStack = [];
}

// UPDATE:
// ************************************************************************************************
UIStateManager.prototype.update = function () {
	if (this.currentState().menu && this.currentState().menu.update) {
		this.currentState().menu.update();
	}
};

// GET_DESC_UNDER_POINTER:
// ************************************************************************************************
UIStateManager.prototype.getDescUnderPointer = function () {
	if (this.currentState().menu && this.currentState().menu.getDescUnderPointer) {
		return this.currentState().menu.getDescUnderPointer();
	}
	
	return null;
};

// PUSH_STATE:
// ************************************************************************************************
UIStateManager.prototype.pushState = function (stateName, data, closePrev = true) {
	ASSERT_EQUAL(this.states.hasOwnProperty(stateName), true, 'Invalid stateName ' + stateName);
	
	let state = this.states[stateName];
	
	// Close the current State:
	if (this.currentState().menu && this.currentState().menu.close && closePrev) {
		this.currentState().menu.close();
	}
	
	state.data = data || null;
	
	// Start the State:
	if (state.menu && state.menu.open) {
		state.menu.open(state.data);
	}
	
	this.stateStack.push(state);
};

// POP_STATE:
// ************************************************************************************************
UIStateManager.prototype.popState = function () {
	// Close the current state:
	if (this.currentState().menu && this.currentState().menu.close) {
		this.currentState().menu.close();
		this.currentState().data = null;
	}
	
	this.stateStack.pop();
	
	
	
	// Open the next state:
	if (this.currentState() && this.currentState().menu && this.currentState().menu.close) {
		this.currentState().menu.open(this.currentState().data);
	}
};

// CLEAR_STATES:
// ************************************************************************************************
UIStateManager.prototype.clearStates = function () {
	while (this.stateStack.length > 0) {
		// Close the current state:
		if (this.currentState().menu && this.currentState().menu.close) {
			this.currentState().menu.close();
		}
	
		this.stateStack.pop();
	}
};

// CURRENT_STATE:
// ************************************************************************************************
UIStateManager.prototype.currentState = function () {
	if (this.stateStack.length > 0) {
		return this.stateStack[this.stateStack.length - 1];
	}
	else if (gs.globalState === 'MAIN_MENU_STATE') {
		return this.states.MainMenu;
	}
	else {
		return this.states.GameState;
	}
};

// IS_CURRENT_STATE:
// ************************************************************************************************
UIStateManager.prototype.isCurrentState = function (stateName) {
	ASSERT_EQUAL(this.states.hasOwnProperty(stateName), true, 'Invalid stateName ' + stateName);
	
	return this.currentState().name === stateName;
};

// TO_STR:
// ************************************************************************************************
UIStateManager.prototype.toStr = function () {
	return this.stateStack.reduce((pv, nv) => pv + nv.name + ', ', '');
};

// CAPTURE_KEY_DOWN
// ************************************************************************************************
UIStateManager.prototype.captureKeyDown = function (key) {
	if (this.currentState().menu && this.currentState().menu.captureKeyDown) {
		return this.currentState().menu.captureKeyDown(key);
	}
	
	return false;
};

