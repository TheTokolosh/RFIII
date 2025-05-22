/*global gs, util*/
'use strict';

var help = {};

// SHOW_HELP_MESSAGE:
// ************************************************************************************************
help.showHelpMessage = function (str, flag) {
	var dialog;
	
	// Setup Dialog:
	dialog = [{}];
	dialog[0].text = str;
	dialog[0].responses = [
		{text: 'Ok', nextLine: 'exit', keys: ['escape', 'accept']}
	];
	
	// Update global data:
	gs.globalData[flag] = true;
	util.writeFile('globalData', JSON.stringify(gs.globalData));
	
	// Push Dialog:
	gs.messageQueue.pushMessage(dialog);
};

// TALENT_DIALOG:
// ************************************************************************************************
help.talentDialog = function () {
	if (!gs.globalData.talents) {
		this.showHelpMessage('You have gained a talent point!. You will gain a talent point every 4 levels. You began the game with a book specific to your class from which you can learn new talents. If you have found other books you can also learn talents from them. All talents have a minimum skill requirement.',
							 'talents');
	}	
};

// ITEM_DIALOG:
// ************************************************************************************************
help.itemDialog = function () {
	if (!gs.globalData.items) {
		this.showHelpMessage('You have just picked up a piece of equipment, press C to open your character menu and equip it!',
							 'items');
	}	
};

// BOOK_DIALOG:
// ************************************************************************************************
help.bookDialog = function () {
	if (!gs.globalData.books) {
		this.showHelpMessage('You have just picked up a talent book. Press C to open your character menu and view your available talents. When you have talent points available you can choose to learn new talents from it.',
							 'books');
	}	
};

// STAIRS_DIALOG:
// ************************************************************************************************
help.stairsDialog = function () {
	if (!gs.globalData.stairs) {
		this.showHelpMessage('You have discovered a flight of stairs leading deeper into the dungeon. Use the < or > keys to descend or click the button on the HUD.',
							 'stairs');
	}	
};

// REST_DIALOG:
// ************************************************************************************************
help.restDialog = function () {
	if (!gs.globalData.rest) {
		this.showHelpMessage('Your health is low, shift + click yourself to rest until healed.',
							 'rest');
	}	
};

// UNSAFE_MOVE_DIALOG:
// ************************************************************************************************
help.unsafeMoveDialog = function () {
	if (!gs.globalData.unsafeMove) {
		this.showHelpMessage('There is a dangerous hazard in this tile, use shift + click to move onto hazardous terrain.',
							 'unsafeMove');
	}	
};