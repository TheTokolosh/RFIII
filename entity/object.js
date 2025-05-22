/*global game, gs, console, util*/
/*global Item*/
/*global Door, Container, DefaultObject, ZoneLine, levelController*/
/*global TILE_SIZE, FACTION, NPC_SHOUT_TYPE*/
/*jshint white: true, laxbreak: true, esversion: 6*/
'use strict';




// DEFAULT_OBJECT:
// ************************************************************************************************
function DefaultObject(tileIndex, typeName, frame) {
	if (typeName === 'Blood' && gs.getTile(tileIndex).type.name === 'Water') {
		typeName = 'WaterBlood';
	}
	
	// Unique ID:
	this.id = gs.nextObjectID;
	gs.nextObjectID += 1;
	
	// General Properties:
	this.isAlive = true;
	this.type = gs.objectTypes[typeName];
	this.tileIndex = {x: tileIndex.x, y: tileIndex.y};
	
	// Object Specific Properties:
	this.isSealed = false; // Used by Wardens to seal doors and zoneLines
	this.currentTurn = 0; // For bear traps
	this.isFull = true; // for fountains
	this.isOpen = false; // for doors and containers
	this.customDesc = null;
	this.timer = 0;
	this.item = null; // For Containers
	this.isLocked = false; // For Crystal Chests
	this.groupId = 0;
	this.toTileIndexList = [];
	
	// Automatically set isLocked on Yendor Gate:
	if (typeName === 'YendorEntranceStairs') {
		this.isLocked = true;
	}
	
	// Zone Line Properties:
	this.toZoneName = null;
	this.toZoneLevel = null;
	
	// Sprite:
	let pos = util.toPosition(tileIndex);
	this.sprite = gs.createSprite(pos.x, pos.y, 'MapTileset', gs.objectSpritesGroup);
	this.sprite.anchor.setTo(0.5, 0.75);
	this.sprite.frame = frame || this.type.frame;
	this.sprite.visible = false;
	this.initAnimations();
	
	
	// Type Specific Pixel Offset:
	if (this.type.offset) {
		this.sprite.x += this.type.offset.x;
		this.sprite.y += this.type.offset.y;
	}
	// Must be offset in order to draw in front
	else if ((!gs.getTile(tileIndex).type.passable || gs.getTile(tileIndex).type.name === 'PlatformWall') && !this.type.isWallObject) {
		this.sprite.y += 2;
	}
	
	// Floor objects can be placed on the simple floorObject layer:
	if (this.type.isPassable === 2 && !this.type.anim && !this.type.objectLayer || this.type.floorLayer) {
		gs.floorObjectSpritesGroup.add(this.sprite);
		gs.objectSpritesGroup.remove(this.sprite);
	}
	// Larger objects must be placed on the more complex object layer:
	else {
		gs.floorObjectSpritesGroup.remove(this.sprite);
		gs.objectSpritesGroup.add(this.sprite);
	}
	
	// Light:
	if (this.type.light) {
		this.light = gs.createLightCircle(this.sprite.position, this.type.light.color, this.type.light.radius, 0, this.type.light.startAlpha);
		this.light.noLife = true;
		this.light.fade = false;
	}
	
	// Lists:
	gs.objectList.push(this);
	gs.getTile(tileIndex).object = this;
	
	if (this.syncedAnim) {
		gs.syncedAnimObjectsList.push(this);
	}
}

// INIT_ANIMATIONS:
// ************************************************************************************************
DefaultObject.prototype.initAnimations = function () {
	// Destroy old animation:
	if (this.sprite.animations.getAnimation("anim")) {
		this.sprite.animations.getAnimation("anim").destroy();
	}
	
	if (this.type.anim) {
		// Synchronized animation:
		if (this.type.syncAnim) {
			//this.sprite.animations.currentAnim.setFrame(this.type.anim[0]);
			this.syncedAnim = {
				frames: this.type.anim,
				currentFrameIndex: 0,
				frameDelay: 0,
			};
			
			this.sprite.frame = this.syncedAnim.frames[0];
		}
		// Unsynchronized animation:
		else {
			this.sprite.animations.add('anim', this.type.anim);
			this.sprite.play('anim', 5, true);
			
			this.sprite.animations.currentAnim.setFrame(util.randElem(this.type.anim), true);
		}
	}
};

// DEFAULT_OBJECT_DESTROY:
// ************************************************************************************************
DefaultObject.prototype.destroy = function () {
	this.isAlive = false;
	this.sprite.visible = false;
	this.sprite.destroy();
	
	if (this.light) {
		this.light.destroy();
	}
};

// UPDATE_FRAME:
// ************************************************************************************************
DefaultObject.prototype.updateFrame = function () {
	this.syncedAnim.frameDelay += 1;
	
	if (this.syncedAnim.frameDelay > 10) {
		this.syncedAnim.frameDelay = 0;
		
		this.syncedAnim.currentFrameIndex += 1;
		if (this.syncedAnim.currentFrameIndex >= this.syncedAnim.frames.length) {
			this.syncedAnim.currentFrameIndex = 0;
		}
		
		this.sprite.frame = this.syncedAnim.frames[this.syncedAnim.currentFrameIndex];
	}
};

// UPDATE_TURN:
// ************************************************************************************************
DefaultObject.prototype.updateTurn = function () {
	if (this.isAlive && this.type.updateTurn) {
		this.type.updateTurn.call(this);
	}
};

// STEP_ON:
// ************************************************************************************************
DefaultObject.prototype.stepOn = function (character) {
	if (this.isAlive && this.type.activate) {
		this.type.activate.call(this, character);
	}
};

// CAN_INTERACT:
// ************************************************************************************************
DefaultObject.prototype.canInteract = function (character) {
	if (this.isDoor()) {
		return util.distance(character.tileIndex, this.tileIndex) <= 1.5 && !this.isOpen && !this.isSealed;
	}
	else if (this.isContainer()) {
		return util.distance(character.tileIndex, this.tileIndex) <= 1.5 && !this.isOpen;
	}
	else {
		return util.distance(character.tileIndex, this.tileIndex) <= 1.5
			&& this.type.interactFunc
			&& this.isFull
			&& !this.isSealed;
	}
};

// INTERACT:
// ************************************************************************************************
DefaultObject.prototype.interact = function (character) {
	this.type.interactFunc.call(this, character);
};

// EMIT_SIGNAL:
// ************************************************************************************************
DefaultObject.prototype.emitSignal = function () {
	this.toTileIndexList.forEach(function (toTileIndex) {
		// Triggering objects:
		if (gs.getObj(toTileIndex)) {
			gs.getObj(toTileIndex).onTrigger();
		}
		
		// Triggering drop walls:
		levelController.sendSignal(toTileIndex);
		
	}, this);
};

// ON_TRIGGER:
// ************************************************************************************************
DefaultObject.prototype.onTrigger = function () {
	// Type Trigger:
	if (this.type.onTrigger) {
		this.type.onTrigger.call(this);
	}
	
	// Timed Door:
	if (this.type.name === 'TimedDoor') {
		if (!this.isOpen) {
			this.openDoor();
		}
		
		// Keep door permanently open:
		if (this.timer !== -2) {
			this.timer = -2;
			gs.createPopUpTextAtTileIndex(this.tileIndex, 'Click!');
			gs.playSound(gs.sounds.door, this.tileIndex);
		}
	}
	// Closing a Door:
	else if (this.isSimpleDoor() && this.isOpen) {
		this.closeDoor();
	}
	// Opening a door:
	else if (this.isDoor() && !this.isOpen) {
		this.openDoor();
	}
};

// SET_IS_FULL:
// ************************************************************************************************
DefaultObject.prototype.setIsFull = function (b) {
	this.isFull = b;
	
	if (!this.isFull) {
		if (this.type.emptyFrame) {
			this.sprite.frame = this.type.emptyFrame;
		}
		
		if (this.light) {
			this.light.destroy();
			this.light = null;
		}
		
		// Removing from discovered zone list:
		gs.pc.removeDiscoveredZoneFeature(this.type.name);
	}
};

// OPEN_DOOR
// ************************************************************************************************
DefaultObject.prototype.openDoor = function (emitSignal = true) {
	if (!this.isOpen) {
		
		gs.playSound(gs.sounds.door, this.tileIndex);
		this.isOpen = true;
		gs.calculateLoS();
		gs.HUD.miniMap.refresh();
		
		// Frame:
		if (this.type.openFrames) {
			this.sprite.frame = this.type.openFrames.find(e => e.f1 === this.sprite.frame).f2;
		}
		else {
			this.sprite.frame = this.type.openFrame;
		}
		
		if (this.type.name === 'GlyphDoor') {
			this.shout();
		}
		
		// Send Signal:
		if (emitSignal) {
			this.emitSignal();
		}
		
		
		// Open Adjacent Doors:
		gs.getIndexListCardinalAdjacent(this.tileIndex).forEach(function (tileIndex) {
			var obj = gs.getObj(tileIndex);
			if (obj && obj.isDoor() && !obj.isOpen) {
				// Specifically do not re-emit signals on grouped doors
				obj.openDoor(false);
			}
		}, this);
		
		// Open groupId Doors:
		if (this.groupId) {
			gs.objectList.forEach(function (obj) {
				if (obj.isDoor() && obj.groupId === this.groupId) {
					// Specifically do not re-emit signals on grouped doors
					obj.openDoor(false);
				}
			}, this);
		}
		
	}
};

// CLOSE_DOOR
// ************************************************************************************************
DefaultObject.prototype.closeDoor = function () {
	if (this.isOpen) {
		gs.playSound(gs.sounds.door, this.tileIndex);
		this.isOpen = false;
		this.sprite.frame -= 1;
		gs.calculateLoS();
		
		// Close Adjacent Doors:
		gs.getIndexListCardinalAdjacent(this.tileIndex).forEach(function (tileIndex) {
			var obj = gs.getObj(tileIndex);
			if (obj && obj.isSimpleDoor() && obj.isOpen) {
				obj.closeDoor();
			}
		}, this);
	}
};

// SHOUT:
// ************************************************************************************************
DefaultObject.prototype.shout = function () {
	gs.shout(this.tileIndex, FACTION.HOSTILE, true, NPC_SHOUT_TYPE.STRONG);
};

// IS_PASSABLE:
// ************************************************************************************************
DefaultObject.prototype.isPassable = function () {
	if (this.isDoor()) {
		if (this.isOpen) {
			return 2;
		}
		else {
			return 0;
		}
		
	}
	else {
		return this.type.isPassable;
	}
};

// IS_TRANSPARENT:
// ************************************************************************************************
DefaultObject.prototype.isTransparent = function () {
	if (this.isDoor()) {
		return this.isOpen || this.type.isTransparent;
	}
	else {
		return this.type.isTransparent;
	}
};

// IS_ZONE_LINE:
// ************************************************************************************************
DefaultObject.prototype.isZoneLine = function () {
	return this.type.zoneLineType;
};

// IS_SIMPLE_DOOR:
// ************************************************************************************************
DefaultObject.prototype.isSimpleDoor = function () {
	return this.type.interactFunc === gs.objectFuncs.openSimpleDoor;
};

// IS_DOOR:
// ************************************************************************************************
DefaultObject.prototype.isDoor = function () {
	return this.type.interactFunc === gs.objectFuncs.openSimpleDoor
		|| this.type.interactFunc === gs.objectFuncs.openGlyphDoor
		|| this.type.interactFunc === gs.objectFuncs.openKeyDoor
		|| this.type.interactFunc === gs.objectFuncs.openSwitchDoor
		|| this.type.interactFunc === gs.objectFuncs.openTimedDoor;
};

// IS_CONTAINER:
// ************************************************************************************************
DefaultObject.prototype.isContainer = function () {
	return this.type.interactFunc === gs.objectFuncs.openChest
		|| this.type.interactFunc === gs.objectFuncs.meatRack;
};

// SEAL:
// ************************************************************************************************
DefaultObject.prototype.seal = function () {
	this.isSealed = true;
	
	
	if (this.isSimpleDoor() && this.isOpen) {
		this.closeDoor();
	}
};

// GET_DESC:
// ************************************************************************************************
DefaultObject.prototype.getDesc = function () {
	var desc = {
		title: this.type.niceName, 
		text: ''
	};
	
	
	// ZONE_LINES:
	if (this.isZoneLine()) {
		let toZoneType = gs.zoneTypes[this.toZoneName];
		
		desc.text += 'To ' + gs.niceZoneName(this.toZoneName, this.toZoneLevel);
		
		if (this.type.name === 'DownStairs') { 
			desc.text += '\n\nUse s or > to descend stairs. You can also use > to fast travel to down stairs once discovered.';
		}
		else if (this.type.name === 'UpStairs') {
			desc.text += '\n\nUse s or < to ascend stairs. You can also use < to fast travel to up stairs once discovered.'; 
		}
	} 
	// GENERAL_OBJECTS:
	else {
		// Trap Damage:
		if (gs.getTrapDamage(this.type.name) && !this.damage) {
			desc.text += 'Damage: ' + gs.getTrapDamage(this.type.name) + '\n\n';
		}
		
		// Saved Damage:
		if (this.damage) {
			desc.text += 'Damage: ' + this.damage + '\n\n';
		}
		
		// Timed Doors:
		if (this.type.name === 'TimedDoor') {
			if (this.timer > 0) {
				desc.text += 'Turns Remaining: ' + this.timer + '\n';
			}
			else if (this.timer === -1) {
				desc.text += 'Turns Remaining: 0 [Sealed]\n';
			}
			else {
				desc.text += 'Turns Remaining: 0 [Open]\n';
			}
			
		}
		
		// Object Type Desc:
		if (this.type.desc) {
			desc.text += this.type.desc;
		}
		
		// Crystal chests need to show their contents:
		if (this.type.name === 'CrystalChest' && this.item) {
			let itemDesc = this.item.toLongDesc();
			desc.text += itemDesc.title;
			desc.text += itemDesc.text;
		}
	}
	
	return desc;
};

// TO_DATA:
// ************************************************************************************************
DefaultObject.prototype.toData = function () {
	var data = {};
	
	data.frame = this.sprite.frame;
	data.typeFrame = this.type.frame;
	data.isFull = this.isFull;
	data.id = this.id;
	data.isOpen = this.isOpen;
	data.isLocked = this.isLocked;
	
	if (this.casterId) {
		data.casterId = this.casterId;
	}
	
	// Talent List:
	if (this.talentList) {
		data.talentList = this.talentList;
	}
	
	// Zone Line:
	if (this.isZoneLine()) {
		data.toZoneName = this.toZoneName;
		data.toZoneLevel = this.toZoneLevel;
	}
	
	// Door:
	if (this.isDoor()) {
		data.isOpen = this.isOpen;
		data.timer = this.timer;
	}
	
	// Containers:
	if (this.item) {
		data.item = this.item.toData();
		data.isLocked = this.isLocked;
	}
	
	// Group Id:
	if (this.groupId) {
		data.groupId = this.groupId;
	}
	
	// Storing the name of corpses:
	if (this.npcTypeName) {
		data.npcTypeName = this.npcTypeName;
	}

	// Storing toTileIndex of portals:
	if (this.toTileIndexList) {
		data.toTileIndexList = this.toTileIndexList;
	}
	
	// Storing damage of ice bombs:
	if (this.damage) {
		data.damage = this.damage;
	}
	
	// Loop Time:
	if (this.loopTurns) {
		data.loopTurns = this.loopTurns;
	}
	
	// Current Turn:
	if (this.currentTurn) {
		data.currentTurn = this.currentTurn;
	}
	
	// Custom Desc: (ex. sign posts):
	if (this.customDesc) {
		data.customDesc = this.customDesc;
	}
				
	return data;
};

// UPDATE_OBJECTS:
// Frame based update:
// ************************************************************************************************
gs.updateObjects = function () {
	for (let i = 0; i < this.syncedAnimObjectsList.length; i += 1) {
		this.syncedAnimObjectsList[i].updateFrame();
	}
};

// CREATE_ZONE_LINE:
// ************************************************************************************************
gs.createZoneLine = function (tileIndex, typeName, toZoneName, toZoneLevel) {
	var obj = this.createObject(tileIndex, typeName);
		
	obj.toZoneName = toZoneName;
	obj.toZoneLevel = toZoneLevel;
	
	return obj;
};

// CREATE_DOOR:
// ************************************************************************************************
gs.createDoor = function (tileIndex, typeName, isOpen) {
	var obj = this.createObject(tileIndex, typeName);
	
	// Special Properties:
	obj.isOpen = isOpen || false;

	// Set Sprite Frame:
	obj.sprite.frame = obj.isOpen ? obj.type.openFrame : obj.type.frame;
		
	return obj;
};

// CREATE_CONTAINER:
// ************************************************************************************************
gs.createContainer = function (tileIndex, typeName, itemDropTableName, isOpen) {
	var obj = this.createObject(tileIndex, typeName);
	
	obj.isOpen = isOpen || false;
	
	// Select random item for the closed container:
	if (!obj.isOpen) {
		obj.item = this.createRandomItem(itemDropTableName, true);
	}
	
	// Set sprite open/closed:
	obj.sprite.frame = obj.isOpen ? obj.type.openFrame : obj.type.frame;
	
	return obj;
};

// CREATE_VINE_PATCH:
// ************************************************************************************************
gs.createVinePatch = function (tileIndex, maxDepth, objectName, percent, pred) {
	var iterFunc;

	percent = percent || 1;
	
	let validIndex = function (x, y) {
		if (pred && !pred({x: x, y: y})) {
			return false;
		}
		
		return gs.isInBounds(x, y)
			&& gs.getTile(x, y).type.passable === 2
			&& !gs.getTile(x, y).isClosed
			&& !gs.getObj(x, y)
			&& !gs.isPit(x, y)
			&& gs.getTile(x, y).type.name !== 'Water'
			&& gs.getTile(x, y).type.name !== 'Lava'
			&& gs.getTile(x, y).type.name !== 'ToxicWaste'
			&& gs.getTile(x, y).type.name !== 'Blood';
	};
	
	// ITER FUNC:
	// *********************************************************************
	iterFunc = function (x, y, depth) {
		if (depth > maxDepth) {
			return;
		}

		if (validIndex(x, y) && util.frac() <= percent) {
			
			if (objectName === 'Water') {
				gs.setTileType({x: x, y: y}, gs.tileTypes.Water);
			} else {
				gs.createObject({x: x, y: y}, objectName);
			}
		}

		if (validIndex(x + 1, y)) {
			iterFunc(x + 1, y, depth + 1);
		}
		if (validIndex(x - 1, y)) {
			iterFunc(x - 1, y, depth + 1);
		}
		if (validIndex(x, y + 1)) {
			iterFunc(x, y + 1, depth + 1);
		}
		if (validIndex(x, y - 1)) {
			iterFunc(x, y - 1, depth + 1);
		}
	};


	iterFunc(tileIndex.x, tileIndex.y, 0);
};

// CREATE_OBJECT:
// ************************************************************************************************
gs.createObject = function (tileIndex, objectTypeName, frame) {
	// ERROR_CHECKING:
	if (gs.getObj(tileIndex)) {
		console.log('TileIndex: ' + tileIndex.x + ', ' + tileIndex.y);
		console.log('Existing objectTypeName: ' + gs.getObj(tileIndex).type.name);
		console.log('Creating objectTypeName: ' + objectTypeName);
		throw 'ERROR: [gs.createObject] - object already exists at tileIndex';
	}
	
	// ERROR_CHECKING:
	if (!gs.objectTypes[objectTypeName]) {
		throw 'ERROR: [gs.createObject] - not a valid objectTypeName: ' + objectTypeName;
	}
	
	// Never create blood on toxic waste or lava:
	if (util.inArray(objectTypeName, ['Blood', 'Oil']) && util.inArray(gs.getTile(tileIndex).type.name, ['ToxicWaste', 'Lava'])) {
		return null;
	}
	
	let obj = new DefaultObject(tileIndex, objectTypeName, frame);
	
	// Make sure to update terrain effects:
	if (gs.getChar(tileIndex)) {
		gs.getChar(tileIndex).updateTerrainEffects();
	}
	
	return obj;
};

// LOAD_OBJ:
// ************************************************************************************************
gs.loadObj = function (tileIndex, data) {
	var obj, typeName;
	
	typeName = this.getNameFromFrame(data.typeFrame, this.objectTypes);
	
	if (!typeName) {
		throw 'Cannot load object, unknown typeFrame: ' + data.typeFrame;
	}
	
	// Zone Line:
	if (gs.isFrameZoneLine(data.typeFrame)) {
		obj = this.createZoneLine(tileIndex, typeName, data.toZoneName, data.toZoneLevel);
	}
	// Door:
	else if (gs.isFrameDoor(data.typeFrame)) {
		obj = this.createDoor(tileIndex, typeName, data.isOpen);
	}
	// Container:
	else if (gs.isFrameContainer(data.typeFrame)) {
		obj = this.createContainer(tileIndex, typeName, data.itemDropTableName, data.isOpen);
	}
	// Standard Object:
	else {
		obj = this.createObject(tileIndex, typeName);	
	}
	
	if (!obj.syncedAnim) {
		obj.sprite.frame = data.frame;	
	}
	
	obj.id = data.id;
	
	// Additional data:
	obj.timer = data.timer;
	
	// Talent List:
	if (data.talentList) {
		obj.talentList = data.talentList;
	}

	// Loop Time:
	if (data.loopTurns) {
		obj.loopTurns = data.loopTurns;
	}
	
	// Current Turn:
	if (data.currentTurn) {
		obj.currentTurn = data.currentTurn;
	}
	
	// Container contents:
	if (data.item) {
		obj.item = Item.createAndLoadItem(data.item);
	}
	
	if (data.isOpen) {
		obj.isOpen = data.isOpen;
	}
	
	if (data.hasOwnProperty('isLocked')) {
		obj.isLocked = data.isLocked;
	}
	
	// Creating Crystal chest item (used when loading from a static json file):
	if (obj.type.name === 'CrystalChest' && !data.item && data.itemDropTableName) {
		obj.item = gs.createRandomItem(data.itemDropTableName);
	}
	
	if (data.groupId) {
		obj.groupId = data.groupId;
	}
	
	if (data.casterId) {
		obj.casterId = data.casterId;
	}
	
	if (data.hasOwnProperty('isFull')) {
		obj.isFull = data.isFull;
	}
	
	// Storing the name of corpses:
	if (data.npcTypeName) {
		obj.npcTypeName = data.npcTypeName;
	}

	// Storing toTileIndex of portals:
	if (data.toTileIndexList) {
		obj.toTileIndexList = data.toTileIndexList;
	}
	
	// Storing damage of ice bombs:
	if (data.damage) {
		obj.damage = data.damage;
	}
	
	// Custom Desc: (ex. sign posts):
	if (data.customDesc) {
		obj.customDesc = data.customDesc;
	}
	
	// Automatically closing the toTileIndex of portals:
	if (obj.type === gs.objectTypes.Portal) {
		gs.getTile(obj.toTileIndexList[0]).isClosed = true;
		gs.getTile(obj.toTileIndexList[0]).mustBeFloor = true;
	}
	
	
	return obj;
};

// DESTROY_OBJECT:
// Call this from anywhere to safely destroy object and remove it from lists
// ************************************************************************************************
gs.destroyObject = function (obj) {
	util.removeFromArray(obj, this.objectList);
	this.getTile(obj.tileIndex).object = null;
	obj.destroy();
};

// DESTROY_ALL_OBJECTS:
// ************************************************************************************************
gs.destroyAllObjects = function () {
	for (let i = 0; i < this.objectList.length; i += 1) {
		this.objectList[i].destroy();
	}

	this.objectList = [];
	this.syncedAnimObjectsList = [];
};

// EXTINGUISH_OBJECT:
// Used by burst of flame and infusion of fire to destroy / extinguish objects
// ************************************************************************************************
gs.extinguishObject = function (tileIndex) {
	// Early break:
	if (!gs.getObj(tileIndex)) {
		return;
	}
	
	// Object name:
	let objName = gs.getObj(tileIndex).type.name;
	
	// Destroy exiting object:
	gs.destroyObject(gs.getObj(tileIndex));
	
	
	if (objName === 'CampFire') {
		gs.createObject(tileIndex, 'UnlitCampFire');
	}
	else if (objName === 'Brazier') {
		gs.createObject(tileIndex, 'UnlitBrazier');
	}
	else if (objName === 'BlueBrazier') {
		gs.createObject(tileIndex, 'UnlitBrazier');
	}
	else if (objName === 'FirePlaceCenter') {
		gs.createObject(tileIndex, 'UnlitFirePlace');
	}
	else if (objName === 'Candle') {
		gs.createObject(tileIndex, 'UnlitCandle');
	}
	else if (objName === 'TikiTorch') {
		gs.createObject(tileIndex, 'UnlitTikiTorch');
	}
	else if (objName === 'Furnace') {
		gs.createObject(tileIndex, 'UnlitFurnace');
	}
};

// CAN_SHOOT_TRAP:
// ************************************************************************************************
gs.canShootTrap = function (tileIndex) {
	return this.getObj(tileIndex, [
		'FireShroom',
		'BearTrap',
		'SpikeTrap',
		'FireVent',
		'FireGlyph',
		'ShockReeds'
	]);
};

// FIND_OBJECT:
// Find an object anywhere on the current level based on either a predicate or a typeName
// ************************************************************************************************
gs.findObj = function (pred) {
	if (typeof pred === 'string') {
		return gs.objectList.find(obj => obj.name === pred);
	}
	else {
		return gs.objectList.find(pred);
	}
};

// CREATE_OBJECT_POOL:
// ************************************************************************************************
gs.createObjectPool = function () {
	/*
	var i;
	this.objectPool = [];
	for (i = 0; i < 200; i += 1) {
		this.objectPool[i] = new DefaultObject();
	}
	*/
	
	this.nextObjectID = 1;
};

// IS_FRAME_ZONE_LINE:
// Used when loading when only available information is frame.
// ************************************************************************************************
gs.isFrameZoneLine = function (frame) {
	var type = this.objectTypes[this.getNameFromFrame(frame, this.objectTypes)];
	
	// Not an object:
	if (!type) {
		return false;
	}
	else {
		return type.interactFunc === this.objectFuncs.useZoneLine
			|| type.name === 'DownStairs'
			|| type.name === 'UpStairs'
			|| type.zoneLineType;
	}
};

// IS_FRAME_DOOR:
// Used when loading when only available information is frame.
// ************************************************************************************************
gs.isFrameDoor = function (frame) {
	var type = this.objectTypes[this.getNameFromFrame(frame, this.objectTypes)];
	return type && 
		(type.interactFunc === this.objectFuncs.openSimpleDoor ||
		 type.interactFunc === this.objectFuncs.openGlyphDoor ||
		 type.interactFunc === this.objectFuncs.openKeyDoor ||
		 type.interactFunc === this.objectFuncs.openTimedDoor ||
		 type.interactFunc === this.objectFuncs.openSwitchDoor);
};

// IS_FRAME_CONTAINER:
// Used when loading when only available information is frame.
// ************************************************************************************************
gs.isFrameContainer = function (frame) {
	var type = this.objectTypes[this.getNameFromFrame(frame, this.objectTypes)];
	return type && (type.interactFunc === this.objectFuncs.openChest || type.interactFunc === this.objectFuncs.meatRack);
};