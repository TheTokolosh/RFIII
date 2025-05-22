/*global gs, game, util, debug, nw*/
/*global UIMap, DungeonGenerator, MonsterSpawner*/
/*global LevelGeneratorCave, LevelGeneratorSewersTunnels*/
/*global VAULT_PLACEMENT*/
/*global NUM_TILES_X, NUM_TILES_Y*/
/*global SCREEN_WIDTH, SCREEN_HEIGHT, MINI_MAP_SIZE_X, MINI_MAP_TILE_SIZE*/
/*global GREEN_TARGET_BOX_FRAME*/
/*global FEATURE_TYPE*/
'use strict';

// OPEN_LEVEL_VIEW_MODE:


// INIT_LEVEL_VIEW_MODE:
// ************************************************************************************************
debug.initLevelViewMode = function () {
    gs.setMusicVolume(0);
	gs.exploreMap();
	
	this.screenShotMode = false;
    let offsetX = 0;
	let offsetY = 20;
	
	if (this.screenShotMode) {
		offsetX = (SCREEN_WIDTH - NUM_TILES_X * 20) / 2 - 60;
	}
	
	
	this.offsetX = offsetX;
	this.offsetY = offsetY;
	
	// Sprite Group:
	this.spriteGroup = game.add.group();
	this.objGroup = game.add.group();
	this.spriteGroup.fixedToCamera = true;
	this.objGroup.fixedToCamera = true;
	
	// Level View Map:
	this.levelViewMap = util.create2DArray(NUM_TILES_X, NUM_TILES_Y, function (x, y) {
		// Tile Sprite:
		let tileSprite = gs.createSprite(x * 20 + offsetX, y * 20 - 20 + offsetY, 'MapTileset', this.spriteGroup);
		tileSprite.scale.setTo(1, 1);
		tileSprite.visible = false;
		
		// Object Sprite:
		let objSprite = gs.createSprite(x * 20 + offsetX, y * 20 - 20 + offsetY, 'MapTileset', this.spriteGroup);
		objSprite.scale.setTo(1, 1);
		objSprite.visible = false;
		
		// Debug Sprite:
		let debugSprite = gs.createSprite(x * 20 + offsetX, y * 20 - 20 + offsetY, 'MapTileset', this.spriteGroup);
		debugSprite.scale.setTo(1, 1);
		debugSprite.visible = false;
		
		// Item Sprite:
		let itemSprite = gs.createSprite(x * 20 + offsetX, y * 20 + offsetY, 'Tileset', this.spriteGroup);
		itemSprite.scale.setTo(1, 1);
		itemSprite.visible = false;
		
		// Char Sprite:
		let charSprite = gs.createSprite(x * 20 + offsetX, y * 20 + offsetY, 'Tileset', this.spriteGroup);
		charSprite.scale.setTo(1, 1);
		charSprite.visible = false;
		
		
		
		return {tileSprite: tileSprite, objSprite: objSprite, debugSprite: debugSprite, itemSprite: itemSprite, charSprite: charSprite};
	}, this);
	
	// Hide all other sprites:
	gs.tileMapSpritesGroup.visible = false;
	gs.floorObjectSpritesGroup.visible = false;
	gs.ringSpritesGroup.visible = false;
	gs.underObjectSpritesGroup.visible = false;
	gs.objectSpritesGroup.visible = false;
	gs.shadowSpritesGroup.visible = false;
	gs.projectileSpritesGroup.visible = false;
	gs.hudTileSpritesGroup.visible = false;
	gs.characterHUDGroup.visible = false;
	gs.popUpTextSpritesGroup.visible = false;
	
	// Mini-Map:
	this.miniMap = new UIMap(SCREEN_WIDTH - MINI_MAP_SIZE_X * MINI_MAP_TILE_SIZE, 0, this.spriteGroup);
	
	// Level Name Text:
	this.levelNameText = gs.createText(SCREEN_WIDTH - MINI_MAP_SIZE_X * MINI_MAP_TILE_SIZE - 260, 0, 'Debug Text', 'PixelFont6-White', 18, this.spriteGroup);
	
	// Level Text:
	this.levelText = gs.createText(SCREEN_WIDTH - (MINI_MAP_SIZE_X * MINI_MAP_TILE_SIZE + 260), 280, 'Debug Text', 'PixelFont6-White', 12, this.spriteGroup);
	
	// Debug Text:
	this.debugText = gs.createText(SCREEN_WIDTH - (MINI_MAP_SIZE_X * MINI_MAP_TILE_SIZE + 260), SCREEN_HEIGHT, 'Debug Text', 'PixelFont6-White', 12, this.spriteGroup);
	this.debugText.setAnchor(0, 1);
	this.debugText.maxWidth = MINI_MAP_SIZE_X * MINI_MAP_TILE_SIZE + 260;
	
	// Selection Sprite:
	this.cursorSprite = gs.createSprite(0, 0, 'Tileset', this.spriteGroup);
	this.cursorSprite.scale.setTo(1, 1);
	this.cursorSprite.frame = GREEN_TARGET_BOX_FRAME;
	
	// Portal Sprite:
	this.portalSprite = gs.createSprite(0, 0, 'MapTileset', this.spriteGroup);
	this.portalSprite.scale.setTo(1, 1);
	this.portalSprite.frame = 67;
	
	if (this.screenShotMode) {
		this.levelNameText.x = 2;
		this.levelNameText.y = 2;
		this.levelText.visible = false;
		this.debugText.visible = false;
		this.cursorSprite.visible = false;
		this.miniMap.borderSprite.visible = false;
	}
										   
	// First Draw:
	this.refreshLevelViewMode();
};


// CLOSE_LEVEL_VIEW_MODE:
// ************************************************************************************************
debug.closeLevelViewMode = function () {
	this.spriteGroup.visible = false;
	this.objGroup.visible = false;
	
	gs.debugProperties.levelViewMode = false;
	
	// Unexplore everything:
	gs.getAllIndex().forEach(function (tileIndex) {
		gs.getTile(tileIndex).explored = false;
	}, this);
	
	gs.pc.updateStats();
	gs.HUD.open();
	gs.HUD.refresh();
	gs.HUD.miniMap.refresh(true);
	gs.startTime = Date.now();
	
	// Hide all other sprites:
	gs.tileMapSpritesGroup.visible = true;
	gs.floorObjectSpritesGroup.visible = true;
	gs.ringSpritesGroup.visible = true;
	gs.underObjectSpritesGroup.visible = true;
	gs.objectSpritesGroup.visible = true;
	gs.shadowSpritesGroup.visible = true;
	gs.projectileSpritesGroup.visible = true;
	gs.hudTileSpritesGroup.visible = true;
	gs.characterHUDGroup.visible = true;
	gs.popUpTextSpritesGroup.visible = true;
};

// REFRESH_LEVEL_VIEW_MODE:
// ************************************************************************************************
debug.refreshLevelViewMode = function () {
	gs.HUD.group.visible = false;
	gs.exploreMap();
	
	if (!this.screenShotMode) {
		this.miniMap.refresh();
	}
	
	
	for (let x = 0; x < NUM_TILES_X; x += 1) {
		for (let y = 0; y < NUM_TILES_Y; y += 1) {
			let tileIndex = {x: x, y: y};
			
			this.levelViewMap[x][y].tileSprite.visible = false;
			this.levelViewMap[x][y].objSprite.visible = false;
			this.levelViewMap[x][y].itemSprite.visible = false;
			this.levelViewMap[x][y].charSprite.visible = false;
			this.levelViewMap[x][y].debugSprite.visible = false;
			
			// Skipping inner walls:
			let indexList = gs.getIndexListAdjacent(tileIndex).filter(index => gs.getTile(index).type.passable);
			if (!gs.getTile(tileIndex).type.passable && indexList.length === 0) {
				continue;
			}
			
			// Tile:
			this.levelViewMap[x][y].tileSprite.frame = gs.getTile(tileIndex).frame;
			this.levelViewMap[x][y].tileSprite.visible = true;
			
			// Object:
			if (gs.getObj(tileIndex) && !gs.getObj(tileIndex).type.isHidden) {
				this.levelViewMap[x][y].objSprite.frame = gs.getObj(tileIndex).sprite.frame;
				this.levelViewMap[x][y].objSprite.visible = true;
				
				this.levelViewMap[x][y].objSprite.x = x * 20 + this.offsetX;
					this.levelViewMap[x][y].objSprite.y = y * 20 - 20 + this.offsetY;
				
				if (gs.getObj(tileIndex).type.offset) {
					this.levelViewMap[x][y].objSprite.x += gs.getObj(tileIndex).type.offset.x / 2;
					this.levelViewMap[x][y].objSprite.y += gs.getObj(tileIndex).type.offset.y / 2;
					
				}
			}
			
			// Item:
			if (gs.getItem(tileIndex)) {
				this.levelViewMap[x][y].itemSprite.frame = gs.getItem(tileIndex).item.type.frame;
				this.levelViewMap[x][y].itemSprite.visible = true;
			}
			
			// Character:
			if (gs.getChar(tileIndex)) {
				this.levelViewMap[x][y].charSprite.frame = gs.getChar(tileIndex).type.frame;
				this.levelViewMap[x][y].charSprite.visible = true;
			}
			
			// Debug:
       		
			if (gs.getChar(x, y) && gs.getChar(x, y).type.isBoss) {
				this.levelViewMap[x][y].debugSprite.frame = 68;
				this.levelViewMap[x][y].debugSprite.visible = true;
			}
			
            
          	  
		}
	}
	
	this.levelNameText.setText(gs.niceZoneName());
};

debug.pointerTileIndex = function () {
    return {x: Math.floor((game.input.activePointer.x - this.offsetX) / 20), y: Math.floor((game.input.activePointer.y - this.offsetY) / 20)};
};

// UPDATE_LEVEL_VIEW_MODE:
// ************************************************************************************************
debug.updateLevelViewMode = function () {
	
	let tileIndex = this.pointerTileIndex();
	
	// Cursor Sprite:
	this.cursorSprite.x = tileIndex.x * 20;
	this.cursorSprite.y = (tileIndex.y + 1) * 20;
	
	// Portal Sprite:
	let obj = gs.getObj(tileIndex);
	if (obj && obj.toTileIndexList && obj.toTileIndexList.length > 0) {
		let toTileIndex = obj.toTileIndexList[0];
		this.portalSprite.x = toTileIndex.x * 20;
		this.portalSprite.y = toTileIndex.y * 20;
		
		this.portalSprite.visible = true;
	}
	else {
		this.portalSprite.visible = false;
	}
	
	// Debug Text:
	let str = 'x: ' + tileIndex.x + ', y: ' + tileIndex.y + '\n';
	
	// Tile:
	let tile = gs.getTile(tileIndex);
	if (tile) {
		str += tile.type.name + '\n';
	}
	
	// Object:
	obj = gs.getObj(tileIndex);
	if (obj) {
		str += obj.type.name + '\n';
	}
	
	// Area:
	let area = gs.getArea(tileIndex);
	if (area && area.vaultType) {
		let name = area.vaultType.name.replace(/\//g, "/ ");
		str += name + '\n';
	}
	
	// Zone Line:
	let zoneLine = gs.getObj(tileIndex, obj => obj.isZoneLine());
	if (zoneLine) {
		str += 'To ' + zoneLine.toZoneName + ':' + zoneLine.toZoneLevel + '\n';
	}
	
	// NPC:
	let npc = gs.getChar(tileIndex);
	if (npc) {
		str += npc.name + ' - XL:' + npc.level;
	}
	
	this.debugText.setText(str);
	
	this.levelText.setText(this.getLevelStr());
};



// GET_LEVEL_STR:
// ************************************************************************************************
debug.getLevelStr = function () {
	let str = '';
	
	// Danger Level:
	str += 'Danger Level: ' + gs.dangerLevel() + '\n';
	
	str += 'Num Monsters: ' + gs.getHostileNPCList().length + '\n';
	
	// EXP:
	str += 'Current EXP: ' + MonsterSpawner.currentExp() + '\n';
	str += 'Desired EXP: ' + MonsterSpawner.totalExp() + '\n';
	
	// Bosses:
	let bossList = gs.getHostileNPCList().filter(char => char.type.isBoss);
	if (bossList.length > 0) {
		str += 'Bosses: ';
		bossList.forEach(function (char) {
			str += gs.capitalSplit(char.name) + ' ';
		}, this);
		str += '\n';
	}
	
	// Zone Lines:
	let zoneLine = DungeonGenerator.getLevelFeatures().find(levelFeature => levelFeature.featureType === FEATURE_TYPE.ZONE_LINE);
	if (zoneLine) {
		str += 'Zone Line: ';
		str += gs.capitalSplit(zoneLine.toZoneName) + ' ' + zoneLine.toZoneLevel;
		str += '\n';
	}
	
	// Items:
	str += 'Items:\n';
	gs.getAllIndex().forEach(function (tileIndex) {
		let item = null;
		
		// Floor Item:
		if (gs.getTile(tileIndex).item) {
			item = gs.getTile(tileIndex).item.item;
		}
		
		// Container:
		if (gs.getObj(tileIndex, obj => obj.item && obj.type.name !== 'CrystalChest')) {
			item = gs.getObj(tileIndex, obj => obj.item).item;
		}
		
		if (item && item.type.name !== 'GoldCoin') {
			str += '* ' + item.type.niceName + '\n';
		}
		
	}, this);
	
	return str;
};

// GET_VAULT_TYPES_STR:
// ************************************************************************************************
debug.getVaultTypesStr = function () {
	let zoneName = 'TheUpperDungeon';
	
	let str = gs.capitalSplit(zoneName) + ':\n\n';
	
	// Vault Type Counts:
	let vaultTypes = LevelGeneratorCave.getVaultTypes(zoneName);
	
	str += 'Aesthetic-Vaults: ' + vaultTypes.Aesthetic.length + '\n';
    
    str += '\n';
    
	str += 'Challenge-Vaults: ' + vaultTypes.Challenge.length + '\n';
	
	// PLACEMENT:
	let vaultTypesPlacement;
	
	vaultTypesPlacement = vaultTypes.Challenge.filter(vaultType => vaultType.vaultSet === 'SmallCryptTunnelsTemplates');
	str += 'Tunnel: ' + vaultTypesPlacement.length + '\n';
	
	vaultTypesPlacement = vaultTypes.Challenge.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.PRE_CAVE);
	str += 'PreCave: ' + vaultTypesPlacement.length + '\n';
	
	vaultTypesPlacement = vaultTypes.Challenge.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.SIDE);
	str += 'Side: ' + vaultTypesPlacement.length + '\n';
	
	vaultTypesPlacement = vaultTypes.Challenge.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.OPEN);
	str += 'Open: ' + vaultTypesPlacement.length + '\n';
	
	vaultTypesPlacement = vaultTypes.Challenge.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID);
	str += 'Solid: ' + vaultTypesPlacement.length + '\n';
	
    str += '\n';
	
	// DANGER_LEVEL:
	let vaultTypesDL = vaultTypes.Challenge.filter(vaultType => vaultType.dangerLevel <= 9);
	str += 'DL9: ' + vaultTypesDL.length + '\n';
	
	vaultTypesDL = vaultTypes.Challenge.filter(vaultType => vaultType.dangerLevel === 10);
	str += 'DL10: ' + vaultTypesDL.length + '\n';
	
	vaultTypesDL = vaultTypes.Challenge.filter(vaultType => vaultType.dangerLevel === 11);
	str += 'DL11: ' + vaultTypesDL.length + '\n';
	
	vaultTypesDL = vaultTypes.Challenge.filter(vaultType => vaultType.dangerLevel >= 12);
	str += 'DL12: ' + vaultTypesDL.length + '\n';
	
	str += '\n';
	
	// TYPE:
	let vaultTypeList = vaultTypes.Challenge.filter(vaultType => vaultType.name.includes('DropWall'));
	str += 'DropWall: ' + vaultTypeList.length + '\n';
	
	vaultTypeList = vaultTypes.Challenge.filter(vaultType => vaultType.name.includes('Zoo'));
	str += 'Zoo: ' + vaultTypeList.length + '\n';
	
	// NAME:
    /*
	let vaultTypesName = vaultTypes.Challenge.filter(vaultType => vaultType.name.includes('Rat'));
	str += 'Rat: ' + vaultTypesName.length + '\n';
	*/
    
	return str;
};

// ON_SPACE_BAR:
// ************************************************************************************************
debug.onSpaceBar = function () {
	console.log('foo');
	gs.pc.endTurn();
};

// ON_LEFT_CLICK:
// ************************************************************************************************
debug.onLeftClick = function () {
	debug.tile = gs.getTile(this.pointerTileIndex());
	let obj = gs.getObj(this.pointerTileIndex());
	
	if (obj && obj.isZoneLine()) {
		gs.changeLevel(obj.toZoneName, obj.toZoneLevel);
		this.refreshLevelViewMode();
	}
};

// ON_CHANGE_LEVEL:
// ************************************************************************************************
debug.onChangeLevel = function (direction) {
	let toLevel = null;
	
	if (direction === 'DOWN') {
		toLevel = gs.nextLevel();
	}
	else if (direction === 'UP') {
		toLevel = gs.previousLevel();
	}
	
	if (toLevel) {
		gs.changeLevel(toLevel.zoneName, toLevel.zoneLevel);
		this.refreshLevelViewMode();
	}
};