/*global gs, console, game, util*/
/*global nw, require, process*/
/*global Item, DungeonGenerator, TomeGenerator*/
/*global FACTION, ITEM_SLOT*/
/*jshint esversion: 6*/
'use strict';

var debug = {};

// CREATE_DEBUG_SPRITE:
// ************************************************************************************************
debug.createDebugSprite = function (tileIndex, frame = 68) {
	if (!this.debugSpritesList) {
		this.debugSpritesList = [];
	}
	
	let pos = util.toPosition(tileIndex);
	
	let sprite = gs.createSprite(pos.x, pos.y - 20, 'MapTileset', gs.projectileSpritesGroup);
	sprite.anchor.setTo(0.5, 0.5);
	sprite.frame = frame;
	
	this.debugSpritesList.push(sprite);
};

// SET_DEBUG_PROFILE:
// ************************************************************************************************
debug.setDebugProfile = function (profileName) {
	gs.globalData.debugProfile = profileName;
	gs.saveGlobalData();
};

// SAVE_PLAYER:
// ************************************************************************************************
debug.savePlayer = function (fileName) {
	util.writeFile('../SaveCharacters/' + fileName, JSON.stringify(gs.pc.toData()));
};

// LOAD_PLAYER:
// ************************************************************************************************
debug.loadPlayer = function (fileName) {
	if (util.doesFileExist('../SaveCharacters/' + fileName)) {
		let data = util.readFile('../SaveCharacters/' + fileName);
		
		gs.pc.reset();
		gs.pc.loadData(data);
		
		// Discover zone:
		gs.pc.discoverZone(gs.zoneName, gs.zoneLevel);
	}
	else {
		console.log('Invalid fileName');
	}
};

// CLEAR_YENDOR:
// ************************************************************************************************
debug.clearYendor = function () {
	gs.characterList.forEach(function(char) {
		if (char.type.niceName !== 'The Wizard Yendor' && char.type.name !== 'GobletShield' && char !== gs.pc) {
			char.destroy();
		}
	});
};

// CHARGE_WANDS:
// ************************************************************************************************
debug.chargeWands = function () {
	let list = gs.pc.inventory.consumableHotBar.allFullItemSlots();
	
	list.forEach(function (itemSlot) {
		if (itemSlot.item.getModdedStat('maxCharges')) {
			itemSlot.item.charges = itemSlot.item.getModdedStat('maxCharges');
		}
	}, this);
};

// REGEN_LEVEL:
// ************************************************************************************************
debug.regenLevel = function () {

	gs.seed = '' + (Date.now() - 1639600000000);
	util.seedRand([gs.seed]);
	
	gs.debugProperties.startZoneName = gs.zoneName;
	DungeonGenerator.generate();
	
	gs.previouslySpawnedVaults = [];
	gs.previouslySpawnedItemList = [];
	gs.previouslySpawnedMerchantItemSets = [];
	

	
	gs.changeLevel(gs.zoneName, gs.zoneLevel, true);
	gs.setPlayerStartTileIndex();
	
	gs.HUD.miniMap.refresh();
	
	if (gs.debugProperties.levelViewMode) {
		this.refreshLevelViewMode();
	}	
	
	gs.pc.resetAllCoolDowns();

};

// CHARGE_WANDS:
// ************************************************************************************************
debug.chargeWands = function () {
	let list = gs.pc.inventory.allFullItemSlots();
	list = list.filter(slot => slot.item.type.maxMpCost);
	
	list.forEach(function (slot) {
		slot.item.charges = slot.item.getModdedStat('maxCharges');
	}, this);
};

// CREATE_OBJECT:
// ************************************************************************************************
debug.createObject = function (typeName, tileIndex = {x: gs.pc.tileIndex.x + 1, y: gs.pc.tileIndex.y}) {
	var obj;
	obj = gs.createObject(tileIndex, typeName);
	
	gs.updateTileMapSprites();
	
	return obj;
};

// FLOOD_OBJECT:
// ************************************************************************************************
debug.floodObject = function () {
	var tileIndex = gs.getNearestPassableSafeIndex(gs.pc.tileIndex);
	
	console.log(tileIndex.depth);
	
	gs.debugCreateObject('Table', tileIndex);
	
	gs.updateTileMapSprites();
};

// CREATE_PARTICLE_POOF
// ************************************************************************************************
debug.createParticlePoof = function() {
	gs.createParticlePoof({x: gs.pc.tileIndex.x + 1, y: gs.pc.tileIndex.y});
};

// CREATE_NPC:
// Quick debug function for creating NPCs adjacent to the player
// Generally called from the console during testing and debugging
// ************************************************************************************************
debug.createNPC = function (typeName, flags) {
	console.log('Creating NPC: ' + typeName);
    gs.createNPC({x: gs.pc.tileIndex.x + 1, y: gs.pc.tileIndex.y}, typeName, flags);
	gs.updateCharacterFrames();
	gs.updateTileMapSprites();
	
};

// AGRO_ALL_NPCS:
// ************************************************************************************************
debug.agroAllNPCs = function () {
	gs.characterList.forEach(function (npc) {
		if (npc.isAlive && npc.faction === FACTION.HOSTILE) {
			npc.agroPlayer();
		}
	}, this);
};

// ADD_ITEM:
// ************************************************************************************************
debug.addItem = function (typeName, flags) {
	gs.pc.inventory.addItem(Item.createItem(typeName, flags));
};

// ADD_EQUIPMENT:
// ************************************************************************************************
debug.addEquipment = function (typeName, flags) {
	let item = Item.createItem(typeName, flags);
	
	if (gs.pc.inventory.equipmentSlot(item.type.slot).hasItem()) {
		gs.pc.inventory.equipmentSlot(item.type.slot).clear();
	}
	
	gs.pc.inventory.equipmentSlot(item.type.slot).addItem(item);
};

// LEARN_TALENT:
// ************************************************************************************************
debug.learnTalent = function (talentName) {
	if (!gs.talents.hasOwnProperty(talentName)) {
		throw 'Invalid talent name: ' + talentName;
	}
	
	gs.pc.talents.addTalent(talentName);
	gs.pc.talents.learnTalent(talentName);
};

// CREATE_FLOOR_ITEM:
// ************************************************************************************************
debug.createFloorItem = function (typeName, flags) {
	var tileIndex = {x: gs.pc.tileIndex.x + 1, y: gs.pc.tileIndex.y};
	
	if (gs.itemTypes[typeName].isTome) {
		let tome = TomeGenerator.createSingleTome(typeName, 3);
		gs.createFloorItem(tileIndex, tome); 
	}
	else {
		gs.createFloorItem(tileIndex, Item.createItem(typeName, flags)); 
	}
	
	
};


// CREATE_RANDOM_FLOOR_ITEM:
// ************************************************************************************************
debug.createRandomFloorItem = function (dropTableName) {
	var tileIndex = {x: gs.pc.tileIndex.x + 1, y: gs.pc.tileIndex.y};
	gs.createRandomFloorItem(tileIndex, dropTableName);
};

// SET_LEVEL:
// Use this to hack the players level
// ************************************************************************************************
debug.setPlayerLevel = function (level) {
	while (gs.pc.level < level) {
		gs.pc.gainExperience(gs.expPerLevel[gs.pc.level + 1] - gs.pc.exp);
	}
};

// CLEAR_TO:
// ************************************************************************************************
debug.clearTo = function (zoneName, zoneLevel) {
	this.clearLevel();
	
	debug.shouldClearLevel = true;
	gs.pc.gotoLevel(zoneName, zoneLevel);
};

// CLEAR_LEVEL:
// ************************************************************************************************
debug.clearLevel = function () {
	let list;
	
	// Kill all NPCs:
	list = gs.getAllNPCs().filter(npc => npc.faction === FACTION.HOSTILE);
	list.forEach(function (npc) {
		npc.takeDamage(1000, 'None');
	}, this);
	
	// Open all chests:
	list = gs.objectList.filter(obj => obj.isContainer() && !obj.isOpen);
	list.forEach(function (obj) {
		gs.pc.interact(obj.tileIndex);
	}, this);
	
	// Pick up all floor items:
	list = gs.floorItemList.filter(floorItem => floorItem.isAlive);
	list.forEach(function (floorItem) {
		gs.pc.pickUpItem(floorItem);
	}, this);
	
	gs.exploreMap();
	gs.HUD.miniMap.refresh();
	
	gs.hasNPCActed = false;
};

// TAKE_SCREEN_SHOT:
// ************************************************************************************************
debug.takeScreenShot = function () {
	var win = nw.Window.get();
	var fs = require('fs');

	win.capturePage(function(buffer) {
		var dirPath = nw.App.dataPath + '/ScreenShots/';
		
		// Make a ScreenShot folder if it doesn't exist:
		if (!fs.existsSync(dirPath)){
			console.log('Creating ScreenShot folder at: ' + dirPath);
    		fs.mkdirSync(dirPath);
		}
		
		// Getting the date for the filename:
		let date = new Date(Date.now());
		let fileName = (date.getMonth() + 1);
		fileName += '-' + date.getDate();
		fileName += '-' + date.getFullYear();
		fileName += ' [' + date.getHours();
		fileName += '-' + date.getMinutes();
		fileName += '-' + date.getSeconds() + ']';

		let filePath = dirPath + fileName + '.png';
		
		// Save the screen shot:
		fs.writeFile(filePath, buffer, function (err) {
			if (err) {
				console.error(err);
			}

			console.log('Saving screenshot to: ' + filePath);
		});
	}, { format : 'png', datatype : 'buffer'} );
};

// CONSOLE_LOG_ONCE:
// ************************************************************************************************
debug.consoleLogOnce = function (text) {
	if (!this.hasConsoleLog) {
		this.hasConsoleLog = true;
		console.log(text);
	}
};

// COUNT_VAULTS:
// ************************************************************************************************
debug.countVaults = function (zoneName) {
	let vaultTypeList = gs.vaultTypeList;
	
	console.log(zoneName + ':');
	
	// Challenge vaults:
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.vaultSet === 'TheUpperDungeon');
	console.log('Total Vaults: ' + vaultTypeList.length);
};

// ON_MIDDLE_CLICK:
// ************************************************************************************************
debug.onMiddleClick = function () {
	if (!gs.debugProperties.enableDebugKey) {
		return;
	}
	
	let tileIndex = gs.pointerTileIndex();
	/*
	if (gs.getChar(tileIndex).summonerId) {
		console.log(gs.getChar(tileIndex).summonerId);
	}
	else {
		console.log(gs.getChar(tileIndex).id);
	}
	*/
	

						   
	if (gs.debugProperties.levelViewMode) {
		tileIndex = debug.pointerTileIndex();
	}
	
	this.tile = gs.getTile(tileIndex);


	if (gs.getChar(tileIndex)) {
		gs.getChar(tileIndex).destroy();
	}
	
	// ITEMS:
	let obj = gs.getObj(tileIndex);
	if (obj && obj.item) {
		console.log(obj.item.type.name);
	}
	else if (gs.getChar(tileIndex)) {
		console.log(gs.getChar(tileIndex));
	}
	else {
		console.log(gs.getTile(tileIndex));
	}
	
	
	//gs.createNPC(tileIndex, 'PracticeDummy');
	
	
};

// LOG_ITEM_TABLE:
// ************************************************************************************************
debug.logItemTable = function () {
	let table = [];
	
	// Push All Items:
	gs.forEachType(gs.itemTypes, function (itemType) {
		table.push(itemType);
	}, this);
	
	// Filter Items:
	//table = table.filter(itemType => itemType.name.includes('Leather') || itemType.name.includes('Chain'));
	table = table.filter(itemType => itemType.tier === 1);
	
	console.table(table, ['name', 'cost']);
};