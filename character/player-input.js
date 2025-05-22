/*global gs, game, console, Phaser, nw, util, debug*/
/*global SCREEN_HEIGHT, SCREEN_WIDTH, HUD_START_X, MOVEMENT_TYPE, ZONE_LINE_TYPE*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

var input = {};

// CREATE_KEYS:
// ************************************************************************************************
input.createKeys = function () {
	
	// RAW_KEYS:
	this.keys = {};
	this.keyList = [];
	
	for (let key in Phaser.Keyboard) {
		if (Phaser.Keyboard.hasOwnProperty(key) && key !== 'NUM_LOCK') {
			this.keys[key] = game.input.keyboard.addKey(Phaser.Keyboard[key]);
			this.keys[key].onDown.add(this.onKeyDown, this);
			this.keys[key].name = key;
			
			this.keyList.push(this.keys[key]);
		}
	}
	
	// SHORT_KEY_NAMES:
	this.shortKeyNames = {
		NUMPAD_1: 'NP_1',
		NUMPAD_2: 'NP_2',
		NUMPAD_3: 'NP_3',
		NUMPAD_4: 'NP_4',
		NUMPAD_5: 'NP_5',
		NUMPAD_6: 'NP_6',
		NUMPAD_7: 'NP_7',
		NUMPAD_8: 'NP_8',
		NUMPAD_9: 'NP_9',
	};
	
	// UNBINDABLE_KEYS:
	// A List of keys that cannot be bound to:
	// ********************************************************************************************
	this.unbindableKeys = [
		'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'ZERO',
		'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
		'ESC',
		'SHIFT', 'CONTROL', 'ALT'
	];

	// ACTIONS:
	// ********************************************************************************************
	this.actions = {};
	
	// Menu:
	this.createAction('OpenCharacterMenu', 	'UI', this.onCharacterMenuClicked);
	this.createAction('OpenWieldMenu', 		'UI', this.onWieldMenuClicked);
	this.createAction('OpenUseMenu', 		'UI', this.onUseMenuClicked);
	this.createAction('OpenGotoMenu',		'UI', this.onGotoMenuClicked);
	
	// Actions:
	//this.createAction('SwapWeapon', 		'Actions', this.onSwapWeaponClicked);
	this.createAction('Accept', 			'Actions', this.onAcceptClicked);
	this.createAction('Wait', 				'Actions', this.onWaitClicked);
	this.createAction('Rest',				'Actions', this.onRestClicked);
	this.createAction('FocusCamera', 		'Actions', this.onFocusCamera);
	this.createAction('AutoAttack', 		'Actions', this.onAutoAttack);
	this.createAction('QuickAttack', 		'Actions', this.onQuickAttack);
	this.createAction('ToggleTargetMode', 	'Actions', this.onToggleTargetMode);
	
	this.createAction('Escape', 			'Fixed', this.onEscape); // Unbindable
	
	// Navigation:
	this.createAction('Up', 				'Navigation', this.onDirrectionClicked.bind(this, {x: 0, y: -1}), true);
	this.createAction('Down', 				'Navigation', this.onDirrectionClicked.bind(this, {x: 0, y: 1}), true);
	this.createAction('Left', 				'Navigation', this.onDirrectionClicked.bind(this, {x: -1, y: 0}), true);
	this.createAction('Right', 				'Navigation', this.onDirrectionClicked.bind(this, {x: 1, y: 0}), true);
	this.createAction('UpLeft', 			'Navigation', this.onDirrectionClicked.bind(this, {x: -1, y: -1}), true);
	this.createAction('UpRight', 			'Navigation', this.onDirrectionClicked.bind(this, {x: 1, y: -1}), true);
	this.createAction('DownLeft', 			'Navigation', this.onDirrectionClicked.bind(this, {x: -1, y: 1}), true);
	this.createAction('DownRight', 			'Navigation', this.onDirrectionClicked.bind(this, {x: 1, y: 1}), true);
	this.createAction('UseStairs', 			'Navigation', this.onUseStairsClicked);
	this.createAction('GotoUpStairs', 		'Navigation', this.onGotoUpStairs);
	this.createAction('GotoDownStairs', 	'Navigation', this.onGotoDownStairs);
	this.createAction('Explore', 			'Navigation', this.onExploreClicked);
	this.createAction('SlowExplore', 		'Navigation', this.onSlowExploreClicked);
	this.createAction('UnsafeMove',			'Navigation', null);
	
	// Abilities:
	this.createAction('UseAbility1',		'Fixed', this.onNumKeyDown.bind(this, 0));
	this.createAction('UseAbility2',		'Fixed', this.onNumKeyDown.bind(this, 1));
	this.createAction('UseAbility3',		'Fixed', this.onNumKeyDown.bind(this, 2));
	this.createAction('UseAbility4',		'Fixed', this.onNumKeyDown.bind(this, 3));
	this.createAction('UseAbility5',		'Fixed', this.onNumKeyDown.bind(this, 4));
	this.createAction('UseAbility6',		'Fixed', this.onNumKeyDown.bind(this, 5));
	this.createAction('UseAbility7',		'Fixed', this.onNumKeyDown.bind(this, 6));
	this.createAction('UseAbility8',		'Fixed', this.onNumKeyDown.bind(this, 7));
	
	// KEY_BINDINGS:
	// ********************************************************************************************
	this.setDefaultKeyBindings();
	this.loadKeyBindings();
	
	// FIXED_KEY_BINDINGS:
	// ********************************************************************************************
	// Pointer:
	game.input.activePointer.leftButton.onDown.add(this.onLeftClick, this);
	game.input.activePointer.rightButton.onDown.add(this.onRightClick, this);
	game.input.addMoveCallback(this.onMovePointer, this);
	
	game.input.activePointer.middleButton.onDown.add(function () {
		debug.onMiddleClick();
		

		
	}, this);
	
	// Keys:
	this.keys.F10.onDown.add(this.onOpenDebug, this);
	this.keys.F11.onDown.add(debug.takeScreenShot, debug);
	this.keys.P.onDown.add(gs.onDebugKey, gs);
};

// SET_DEFAULT_KEY_BINDINGS:
// ************************************************************************************************
input.setDefaultKeyBindings = function () {
	this.keyBindings = [];
	
	// Menu Bindings:
	this.createKeyBinding('OpenCharacterMenu', 	0, 'C', 'none');
	this.createKeyBinding('OpenWieldMenu', 		0, 'W', 'shift');
	this.createKeyBinding('OpenUseMenu', 		0, 'U', 'none');
	this.createKeyBinding('OpenGotoMenu',		0, 'G', 'none');
	
	// Action Bindings:
	//this.createKeyBinding('SwapWeapon', 		0, 'W', 'none');
	this.createKeyBinding('Accept', 			0, 'NUMPAD_5', 'none');
	this.createKeyBinding('Accept', 			1, 'ENTER', 'none');
	this.createKeyBinding('Accept', 			2, 'SPACEBAR', 'none');
	this.createKeyBinding('Wait', 				0, 'SPACEBAR', 'none');
	this.createKeyBinding('Rest',				0, 'SPACEBAR', 'shift');
	this.createKeyBinding('FocusCamera', 		0, 'F', 'none');
	this.createKeyBinding('AutoAttack', 		0, 'TAB', 'none');
	this.createKeyBinding('QuickAttack', 		0, 'Q', 'none');
	this.createKeyBinding('ToggleTargetMode', 	0, 'R', 'none');
	this.createKeyBinding('Escape', 			0, 'ESC', 'none');
	
	// Navigation Bindings:
	this.createKeyBinding('Up', 				0, 'W', 'none');
	this.createKeyBinding('Down', 				0, 'S', 'none');
	this.createKeyBinding('Left', 				0, 'A', 'none');
	this.createKeyBinding('Right', 				0, 'D', 'none');
	//this.createKeyBinding('UpLeft', 			0, 'NUMPAD_7', 'none');
	//this.createKeyBinding('UpRight', 			0, 'NUMPAD_9', 'none');
	//this.createKeyBinding('DownLeft', 		0, 'NUMPAD_1', 'none');
	//this.createKeyBinding('DownRight', 		0, 'NUMPAD_3', 'none');
	this.createKeyBinding('Up', 				1, 'UP', 'none');
	this.createKeyBinding('Down', 				1, 'DOWN', 'none');
	this.createKeyBinding('Left', 				1, 'LEFT', 'none');
	this.createKeyBinding('Right', 				1, 'RIGHT', 'none');
	this.createKeyBinding('UseStairs', 			0, 'S', 'SHIFT');
	this.createKeyBinding('GotoUpStairs', 		0, 'COMMA', 'none');
	this.createKeyBinding('GotoUpStairs', 		1, 'COMMA', 'shift');
	this.createKeyBinding('GotoDownStairs', 	0, 'PERIOD', 'none');
	this.createKeyBinding('GotoDownStairs', 	1, 'PERIOD', 'shift');
	this.createKeyBinding('Explore', 			0, 'E', 'none');
	this.createKeyBinding('SlowExplore', 		0, 'E', 'control');
	this.createKeyBinding('UnsafeMove', 		0, 'Z', 'none');
	
	// Fixed Key Bindings:
	this.createKeyBinding('UseAbility1',		0, 'ONE', 'none');
	this.createKeyBinding('UseAbility2',		0, 'TWO', 'none');
	this.createKeyBinding('UseAbility3',		0, 'THREE', 'none');
	this.createKeyBinding('UseAbility4',		0, 'FOUR', 'none');
	this.createKeyBinding('UseAbility5',		0, 'FIVE', 'none');
	this.createKeyBinding('UseAbility6',		0, 'SIX', 'none');
	this.createKeyBinding('UseAbility7',		0, 'SEVEN', 'none');
	this.createKeyBinding('UseAbility8',		0, 'EIGHT', 'none');
	
};

// SAVE_KEY_BINDINGS:
// ************************************************************************************************
input.saveKeyBindings = function () {
	gs.globalData.keyBindings = this.keyBindings;
	gs.saveGlobalData();
};

// LOAD_KEY_BINDINGS:
// ************************************************************************************************
input.loadKeyBindings = function () {
	if (!gs.globalData.keyBindings) {
		return;
	}
	
	this.keyBindings = gs.globalData.keyBindings;
	
	// Add Z - Unsafe move:
	if (!this.keyBindings.find(e => e.actionName === 'UnsafeMove')) {
		
		// Remove any keybinding using Z:
		if (this.keyBindings.find(e => e.keyName === 'Z')) {
			util.removeFromArray(this.keyBindings.find(e => e.keyName === 'Z'), this.keyBindings);
		}
		
		this.createKeyBinding('UnsafeMove', 		0, 'Z', 'none');
	}
};

// GET_ACTION_LIST:
// ************************************************************************************************
input.getActionList = function (catagoryName) {
	var list = [];
	
	for (let key in this.actions) {
		if (this.actions.hasOwnProperty(key) && this.actions[key].catagoryName === catagoryName) {
			list.push(this.actions[key]);
		}
	}
	return list;
};

// CREATE_ACTION:
// ************************************************************************************************
input.createAction = function (actionName, catagoryName, actionFunc, noKeyModifier = false) {
	this.actions[actionName] = {
		name: actionName,
		catagoryName: catagoryName,
		func: actionFunc,
		noKeyModifier: noKeyModifier,
	};
};

// DESTROY_KEY_BINDING:
// ************************************************************************************************
input.destroyKeyBinding = function (actionName, actionSlot) {
	var keyBinding = this.keyBindings.find(binding => binding.actionName === actionName && binding.actionSlot === actionSlot);
	
	if (keyBinding) {
		util.removeFromArray(keyBinding, this.keyBindings);
	}
};

// CREATE_KEY_BINDING:
// ************************************************************************************************
input.createKeyBinding = function (actionName, actionSlot, keyName, keyModifier) {
	var binding = {
		actionName: actionName,
		actionSlot: actionSlot,
		keyName: keyName,
		keyModifier: keyModifier,
	};
	
	this.keyBindings.push(binding);
};

// KEY_COMBO_STR:
// ************************************************************************************************
input.getKeyComboStr = function (keyName, keyModifier) {
	var str;
	
	if (this.shortKeyNames.hasOwnProperty(keyName)) {
		keyName = this.shortKeyNames[keyName];
	}
	
	if (keyModifier !== 'none') {
		str = keyModifier + ' ' + keyName;
	}
	else {
		str = keyName;
	}
	
	return str;
};

// GET_KEY_BINDING:
// ************************************************************************************************
input.getKeyBinding = function (actionName, actionSlot) {
	return this.keyBindings.find(binding => binding.actionName === actionName && binding.actionSlot === actionSlot);
};

// IS_ACTION_KEY_DOWN:
// Are any of the keys for the action being held down:
// ************************************************************************************************
input.isActionKeyDown = function (actionName) {
	let noKeyModifier = this.actions[actionName].noKeyModifier;
	
	// Each action can have 3 associated bindings:
	for (let i = 0; i < 3; i += 1) {
		let binding = this.getKeyBinding(actionName, i);
		if (binding && this.keys[binding.keyName].isDown && (noKeyModifier || this.getKeyModifier() === binding.keyModifier)) {
			return true;
		}
	}
};

// ON_KEY_DOWN:
// ************************************************************************************************
input.onKeyDown = function (key) {	
	var modifier, 
		bindingList;
	
	// Any click stops exploration:
	if (gs.pc.isExploring) {
		gs.pc.stopExploring();
		return;
	}
	
	// Menus or states capturing the key press:
	if (gs.stateManager.captureKeyDown(key)) {
		return;
	}
	
	modifier = this.getKeyModifier();
	
	bindingList = this.keyBindings.filter(binding => binding.keyName === key.name && binding.keyModifier === modifier);
	
	bindingList.forEach(function (binding) {
		if (this.actions[binding.actionName] && this.actions[binding.actionName].func) {
			this.actions[binding.actionName].func();
		}
	}, this);
};



// GET_KEY_INDEX:
// Converts numKeys to 1-10 and letters to 11(a)-36(z)
// ************************************************************************************************
input.getIndexOfKey = function (key) {
	if (key.keyCode === 48) {
		return 10;
	}
	else if (key.keyCode >= 65 && key.keyCode < 91) {
		return key.keyCode - 54;
	}
	else if (key.keyCode > 48 && key.keyCode < 58){
		return key.keyCode - 48;
	}
	else {
		return -1;
	}
};

// GET_KEY_OF_INDEX:
// Converts index 1-36 to either num or letters (str)
// ************************************************************************************************
input.getKeyOfIndex = function (index) {
	if (index === 10) {
		return '0';
	}
	else if (index <= 9) {
		return '' + index;
	}
	else {
		return String.fromCharCode(index + 54);
	}
};

// GET_KEY_MODIFIER:
// Returns the current key modifier: ['none', 'shift']
// ************************************************************************************************
input.getKeyModifier = function () {
	if (this.keys.SHIFT.isDown) {
		return 'shift';
	}
	else if (this.keys.CONTROL.isDown) {
		return 'control';
	}
	else if (this.keys.ALT.isDown) {
		return 'alt';
	}
	else {
		return 'none';
	}
};


	
// ON_EXPLORE_CLICKED:
// ************************************************************************************************
input.onExploreClicked = function () {
	if (gs.stateManager.isCurrentState('GameState') && gs.pc.isReadyForInput()) {
		if (gs.pc.isExploring) {
			gs.pc.stopExploring();
		}
		else {
			gs.pc.startExploring();
		}
		
	}
};

input.onSlowExploreClicked = function () {
	
};

// ON_CHARACTER_MENU_CLICKED:
// ************************************************************************************************
input.onCharacterMenuClicked = function () {
	
	if (gs.stateManager.isCurrentState('GameState') && gs.pc.isReadyForInput()) {
		gs.stateManager.pushState('CharacterMenu');
	} 
	else if (gs.stateManager.isCurrentState('CharacterMenu') || gs.stateManager.isCurrentState('ShopMenu')) {
		gs.stateManager.popState();
	}
};

// ON_WIELD_MENU_CLICKED:
// ************************************************************************************************
input.onWieldMenuClicked = function () {
	if (gs.stateManager.isCurrentState('GameState') && gs.pc.isReadyForInput()) {
		gs.stateManager.pushState('WieldMenu');
	} 
	else if (gs.stateManager.isCurrentState('WieldMenu')) {
		gs.stateManager.popState();
	}
};

// ON_GOTO_MENU_CLICKED:
// ************************************************************************************************
input.onGotoMenuClicked = function () {
	if (gs.stateManager.isCurrentState('GameState')) {
		gs.openGotoLevelMenu();
	}
	else if (gs.stateManager.isCurrentState('DialogMenu') && gs.dialogMenu.dialog[0].text === 'Goto which Zone?') {
		gs.stateManager.popState();
	}
	
};


// ON_DIRRECTION_CLICKED:
// Remember that this is seprate from holding the keys which is handled in an update funciton.
// Moves the character or moves the cursor when in keyBoardMode
// ************************************************************************************************
input.onDirrectionClicked = function (vector) {
	gs.lastInputType = 'KEYBOARD';
	gs.pc.keyHoldTime = 20;
	
	// Moving Cursor:
	if (gs.keyBoardMode || gs.stateManager.isCurrentState('UseAbility')) {
		gs.pc.moveCursor(vector);
	} 
	// Single stepping:
	else if (gs.stateManager.isCurrentState('GameState')) {
		gs.pc.stopExploring();
		gs.pc.clickTileIndex({x: gs.pc.tileIndex.x + vector.x, y: gs.pc.tileIndex.y + vector.y}, false, MOVEMENT_TYPE.SNAP);
	}
};

// ON_ACCEPT_CLICKED:
// ************************************************************************************************
input.onAcceptClicked = function () {
	if (gs.pc.isReadyForInput()) {
		if (gs.keyBoardMode || gs.stateManager.isCurrentState('UseAbility')) {
			gs.pc.clickTileIndex(gs.cursorTileIndex);
		}
		else if (gs.stateManager.isCurrentState('DialogMenu')) {
			gs.dialogMenu.acceptClicked();
		}
	}
};

// ON_WAIT_CLICKED:
// ************************************************************************************************
input.onWaitClicked = function () {
	if (gs.debugProperties.levelViewMode) {
		debug.onSpaceBar();
		return;
	}
	
	if (gs.pc.isReadyForInput()) {
		if (gs.stateManager.isCurrentState('GameState')) {
			gs.pc.stopExploring();
			gs.pc.clickTileIndex(gs.pc.tileIndex);
		} 
	}
};

// ON_REST_CLICKED:
// ************************************************************************************************
input.onRestClicked = function () {
	if (gs.pc.isReadyForInput() && gs.stateManager.isCurrentState('GameState')) {
		gs.pc.stopExploring();
		gs.pc.rest();
	}
};

// ON_USE_MENU_CLICKED:
// ************************************************************************************************
input.onUseMenuClicked = function () {
	if (gs.stateManager.isCurrentState('GameState') && gs.pc.isReadyForInput()) {
		gs.stateManager.pushState('UseMenu');
	} 
	else if (gs.stateManager.isCurrentState('UseMenu')) {
		gs.stateManager.popState();
	}
};

// ON_USE_STAIRS_CLICKED:
// ************************************************************************************************
input.onUseStairsClicked = function () {
	if (!gs.stateManager.isCurrentState('GameState') || !gs.pc.isReadyForInput()) {
		return;
	}
		
	if (gs.getObj(gs.pc.tileIndex, obj => obj.type.zoneLineType) || gs.isPit(gs.pc.tileIndex)) {
		gs.pc.clickZoneLine(gs.pc.tileIndex);
	}
};


// ON_GOTO_DOWN_STAIRS:
// ************************************************************************************************
input.onGotoDownStairs = function () {
	if (gs.debugProperties.levelViewMode) {
		debug.onChangeLevel('DOWN');
		return;
	}
	
	if (!gs.stateManager.isCurrentState('GameState') || !gs.pc.isReadyForInput()) {
		return;
	}
	
	// Stop all movement and traveling:
	gs.pc.stopExploring();
	gs.pc.gotoLevelQueue = [];
	
	// Use down stairs:
	if (gs.getObj(gs.pc.tileIndex, obj => obj.type.zoneLineType === ZONE_LINE_TYPE.DOWN_STAIRS) || gs.isPit(gs.pc.tileIndex)) {
		gs.pc.clickZoneLine(gs.pc.tileIndex);
	}
	// Goto down stairs:
	else {
		let list = gs.objectList.filter(obj => obj.type.zoneLineType === ZONE_LINE_TYPE.DOWN_STAIRS && gs.getTile(obj.tileIndex).explored);
		
		// Only one stair:
		if (list.length === 1) {
			gs.pc.gotoStairs(list[0].tileIndex);
		}
		// Multiple stairs:
		else {
			gs.openGotoStairsMenu(list);
			
			
		}
	}
	
};

// ON_GOTO_UP_STAIRS:
// ************************************************************************************************
input.onGotoUpStairs = function () {
	if (gs.debugProperties.levelViewMode) {
		debug.onChangeLevel('UP');
		return;
	}
	
	if (!gs.stateManager.isCurrentState('GameState') || !gs.pc.isReadyForInput()) {
		return;
	}
	
	// Stop all movement and traveling:
	gs.pc.stopExploring();
	gs.pc.gotoLevelQueue = [];

	// Use up stairs:
	if (gs.getObj(gs.pc.tileIndex, obj => obj.type.zoneLineType === ZONE_LINE_TYPE.UP_STAIRS)) {
		gs.pc.clickZoneLine(gs.pc.tileIndex);
	}
	// Goto down stairs:
	else {
		let list = gs.objectList.filter(obj => obj.type.zoneLineType === ZONE_LINE_TYPE.UP_STAIRS && gs.getTile(obj.tileIndex).explored);
		
		// Only one stairs:
		if (list.length === 1) {
			gs.pc.gotoStairs(list[0].tileIndex);
		}
		// Multiple Stairs:
		else {
			gs.openGotoStairsMenu(list);
		}
	}
	
};



// ON_FOCUS_CAMERA:
// ************************************************************************************************
input.onFocusCamera = function () {
	gs.focusCameraOnPC();
};

// ON_AUTO_ATTACK:
// ************************************************************************************************
input.onAutoAttack = function () {
	gs.pc.autoMeleeAttack();
};

// ON_QUICK_ATTACK:
// ************************************************************************************************
input.onQuickAttack = function () {
	gs.pc.autoRangeAttack();
};

// ON_TOGGLE_TARGET_MODE:
// ************************************************************************************************
input.onToggleTargetMode = function () {
	gs.toggleKeyBoardMode(true);
};

// ON_LEFT_CLICK:
// ************************************************************************************************
input.onLeftClick = function () {
	// Using the alt-key to force right clicks (mac):
	if (this.keys.ALT.isDown && !this.keys.CONTROL.isDown) {
		this.onRightClick();
		return;
	}
	
	if (gs.debugProperties.levelViewMode) {
		debug.onLeftClick();
		return;
	}
	
	// Any click stops exploration:
	if (gs.pc.isExploring || gs.pc.isTravelling) {
		gs.pc.stopExploring();
		return;
	}
	
	// Clicking the mini-map:
	if (gs.HUD.miniMap.isPointerOver() && gs.stateManager.isCurrentState('GameState') && gs.isInBounds(gs.HUD.miniMap.indexUnderPointer()) && gs.getTile(gs.HUD.miniMap.indexUnderPointer()).explored) {
		gs.pc.clickTileIndex(gs.HUD.miniMap.indexUnderPointer(), true, MOVEMENT_TYPE.FAST);
	}
	// Clicking a tile:
	else if (gs.isPointerInWorld() && (gs.stateManager.isCurrentState('GameState') || gs.stateManager.isCurrentState('UseAbility'))) {
		gs.pc.clickTileIndex(gs.pointerTileIndex(), false, MOVEMENT_TYPE.NORMAL);
	} 
};

// ON_RIGHT_CLICK:
// ************************************************************************************************
input.onRightClick = function () {
	// Phaser interprets control clicking as a right click.
	// We need to ignore this.
	if (this.keys.CONTROL.isDown) {
		this.onLeftClick();
		return;
	}
	
	if (gs.stateManager.isCurrentState('UseAbility')) {
		gs.pc.cancelUseAbility();
	}
	else if (gs.isPointerInWorld() && 
			 gs.stateManager.isCurrentState('GameState') &&
			 util.vectorEqual(gs.pc.tileIndex, gs.pointerTileIndex()) && 
			 gs.getObj(gs.pc.tileIndex, obj => obj.isZoneLine())) {
		gs.pc.clickZoneLine(gs.pc.tileIndex);
	}
	else if (gs.isPointerInWorld() && gs.stateManager.isCurrentState('GameState')) {
		gs.pc.clickTileIndex(gs.pointerTileIndex(), false, MOVEMENT_TYPE.NORMAL, true);
	}
};

// ON_MOVE_POINTER:
// ************************************************************************************************
input.onMovePointer = function () {
	this.lastInputType = 'MOUSE';
};

// ON_OPEN_DEBUG:
// ************************************************************************************************
input.onOpenDebug = function () {
	nw.Window.get().showDevTools();
};

// ON_NUM_KEY_DOWN:
// Quick selects abilities
// ************************************************************************************************
input.onNumKeyDown = function (index) {
	// DIALOG_MENU:
	if (gs.stateManager.isCurrentState('DialogMenu')) {
		gs.dialogMenu.buttonClicked({index: index});
		return;
	}
	
	// Clicking ability slots:
	if (gs.pc.isReadyForInput()) {		
		gs.HUD.abilityBar.slotClicked(gs.HUD.abilityBar.abilitySlots[index]);
		
		if (gs.lastInputType === 'KEYBOARD' && gs.stateManager.isCurrentState('UseAbility')) {
			gs.toggleKeyBoardMode(true);
		}
	}
};

// ON_ESCAPE:
// ************************************************************************************************
input.onEscape = function () {
	// MAIN_MENU:
	if (gs.globalState === 'MAIN_MENU_STATE') {
		if (gs.stateManager.currentState().canEsc) {
			gs.stateManager.popState();
		}		
		return;
	}
	
	// DIALOG_MENU:
	if (gs.stateManager.isCurrentState('DialogMenu')) {
		gs.dialogMenu.escapeClicked();
		return;
	}
	
	// GAME_MENU:
	if (gs.stateManager.isCurrentState('GameMenu') || gs.stateManager.isCurrentState('OptionsMenu')|| gs.stateManager.isCurrentState('ControlsMenu')) {
		gs.stateManager.popState();
		return;
	}
	
	if (gs.pc.isReadyForInput()) {
		if (gs.stateManager.currentState().canEsc) {
			gs.stateManager.popState();
		}
		else if (gs.stateManager.isCurrentState('UseAbility')) {
			gs.pc.cancelUseAbility();
		}
		else if (gs.stateManager.isCurrentState('GameState') && !gs.keyBoardMode) {
			gs.stateManager.pushState('GameMenu');
		}
		
		if (gs.keyBoardMode) {
			gs.toggleKeyBoardMode(false);
		}

		gs.pc.stopExploring();
	}
	else if (gs.stateManager.isCurrentState('CharacterMenu')) {
		gs.stateManager.popState();
	}
	/*
	// Closing character menu from the death state
	else if (!gs.pc.isAlive && gs.stateManager.isCurrentState('CharacterMenu')) {
		gs.stateManager.popState();
	}
	*/
};

// TOGGLE_KEY_BOARD_MOVE:
// ************************************************************************************************
gs.toggleKeyBoardMode = function (b) {
	if (b && gs.stateManager.isCurrentState('GameState')) {
		var nearestNPC = gs.pc.getNearestVisibleHostile();

		this.keyBoardMode = true;

		if (nearestNPC) {
			this.cursorTileIndex.x = nearestNPC.tileIndex.x;
			this.cursorTileIndex.y = nearestNPC.tileIndex.y;
		} 
		else {
			this.cursorTileIndex.x = this.pc.tileIndex.x;
			this.cursorTileIndex.y = this.pc.tileIndex.y;
		}
	} 
	else {
		this.keyBoardMode = false;
	}
};


// POINTER_TILE_INDEX:
// ************************************************************************************************
gs.pointerTileIndex = function () {
	return util.toTileIndex({x: game.input.activePointer.x + game.camera.x, y: game.input.activePointer.y + game.camera.y});
};

// IS POINTER IN WORLD:
// ********************************************************************************************
gs.isPointerInWorld = function () {
	
	return game.input.activePointer.x < HUD_START_X
		&& game.input.activePointer.x > 4
		&& game.input.activePointer.y < SCREEN_HEIGHT - 4
		&& game.input.activePointer.y > 4
		&& gs.isInBounds(gs.pointerTileIndex());
	
	//return gs.isInBounds(gs.pointerTileIndex());
};