/*global game, gs, console, util, debug*/
/*global DungeonGenerator*/
/*global TILE_SIZE, ZONE_TIER, FEATURE_TYPE*/
/*global NPC, Container, Shop, Inventory, bspGenerator, SPAWN_ENEMY_TURNS, FACTION, BOSS_LEVEL_NAMES*/
/*jshint laxbreak: true, esversion: 6*/

'use strict';

// ZONE_TYPE:
// Returns the type of zone
// ************************************************************************************************
gs.zoneType = function () {
	let zoneType = gs.zoneTypes[gs.zoneName];
	
	let subZoneList = zoneType.subZones.filter(subZone => subZone.zoneLevel === gs.zoneLevel);
	
	for (let i = 0; i < subZoneList.length; i += 1) {
		if (!subZoneList[i].pred || subZoneList[i].pred()) {
			return gs.zoneTypes[subZoneList[i].zoneName];
		}
	}
	
	return zoneType;
};

// NEXT_LEVEL:
// Returns {zoneName, zoneLevel} of the next level (upon falling down a pit)
// Returns null if there is no next valid next level (in this case the player character will be killed by the fall)
// ************************************************************************************************
gs.nextLevel = function () {
	
	// Next Level:
	if (this.zoneLevel < this.zoneType().numLevels) {
		return {zoneName: this.zoneName, zoneLevel: this.zoneLevel + 1};
	}
	// TheUpperDungeon:4 => Wilderness:
	else if (this.zoneName === 'TheUpperDungeon') {
		return {zoneName: DungeonGenerator.zones.Wilderness, zoneLevel: 1};
	}
	// Wilderness:4 => Tier-3:
	else if (this.zoneName === DungeonGenerator.zones.Wilderness) {
		return {zoneName: DungeonGenerator.zones.Tier3, zoneLevel: 1};
	}
	// Tier-3:4 => Yendor:
	else if (this.zoneName === DungeonGenerator.zones.Tier3) {
		return {zoneName: 'TheVaultOfYendor', zoneLevel: 1};
	}
	else {
		return null;
	}
};

// PREVIOUS_LEVEL:
// Returns {zoneName, zoneLevel} of the previous level:
// ************************************************************************************************
gs.previousLevel = function () {
	// Prev Level:
	if (this.zoneLevel > 1) {
		return {zoneName: this.zoneName, zoneLevel: this.zoneLevel - 1};
	}
	// Prev Zone:
	else {
		let levelFeatures = DungeonGenerator.getLevelFeatures(this.zoneName, this.zoneLevel);
		let zoneLine = levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.ZONE_LINE);
		
		if (zoneLine) {
			return {zoneName: zoneLine.toZoneName, zoneLevel: zoneLine.toZoneLevel};
		}
	}
	
	return null;
};

// CHANGE_LEVEL:
// Called from: zoneTo, pitTrap, player.load and when starting a new game.
// ************************************************************************************************
gs.changeLevel = function (toDungeonName, toDungeonLevel, forceGenerate) {
	var prevZoneName = this.zoneName;
	
	// Pause Timer:
	if (gs.timer) {
		gs.timer.pause();
	}
	
	forceGenerate = forceGenerate || false;
	
	// Make all enemies unagroed when leaving a level:
	gs.characterList.forEach(function (character) {
		if (character.faction === FACTION.HOSTILE) {
			character.isAgroed = false;
		}
	});
	
	// Save the previous level:
	if (prevZoneName && gs.debugProperties.saveLevels) {
		this.saveLevel();
		this.saveWorld();
	}
	
	this.zoneName = toDungeonName;
	this.zoneLevel = toDungeonLevel;
	
	
	// Destroy stuff:
	this.destroyLevel();
	
	// Reset character list and push player:
	gs.stateManager.clearStates();
    this.characterList = [];
    this.characterList.push(gs.pc);
    
	// Make sure player starts first:
	this.activeCharacterIndex = 0;
	this.pc.waitTime = 0;
	
	// Load a previously visited level:
	if (this.canReloadLevel(toDungeonName, toDungeonLevel) && !forceGenerate) {
		this.reloadLevel(toDungeonName, toDungeonLevel);
	}
	// Generating level:
	else {
		this.generateLevel();
		this.isEnteringNewLevel = true;
	}
	
	// Camera:
	game.world.bounds.setTo(-1000, -1000, (this.numTilesX - 1) * TILE_SIZE + 2000, (this.numTilesY - 1) * TILE_SIZE + 3000);
	game.camera.setBoundsToWorld();
	
	// Stop music if the toZone has no music or if it is different then the current track: 
	if (!this.getZoneMusic(toDungeonName) || this.getZoneMusic(toDungeonName) !== this.getZoneMusic(prevZoneName)) {
		this.stopAllMusic();
	}
	
	// Start music if it exists:
	if (this.musicOn && this.getZoneMusic(toDungeonName) && this.getZoneMusic(toDungeonName) !== this.getZoneMusic(prevZoneName)) {
		this.getZoneMusic(toDungeonName).loopFull();
	}
	
	// Dungeon Sense:
	if (gs.pc.talents.hasLearnedTalent('DungeonSense')) {
		gs.revealDungeonSenese();
	}
	
	// Discover zone:
	gs.pc.discoverZone(gs.zoneName, gs.zoneLevel);
	
	gs.pc.statusEffects.onChangeLevel();
	
	gs.cleanMerchant();
	
	gs.markCornerTiles();
	
	// Explore Level:
	if (this.debugProperties.mapExplored) {
		this.exploreMap();
	}
};

// MARK_CORNER_TILES:
// Used by player vision to make corners visible:
// ************************************************************************************************
gs.markCornerTiles = function () {
	let isSolid = function (x, y) {
		return !gs.isInBounds(x, y) || !gs.getTile(x, y).type.passable || (gs.getObj(x, y) && !gs.getObj(x, y).type.passable);
	};
	
	let isOpen = function (x, y) {
		return gs.isInBounds(x, y) && gs.getTile(x, y).type.passable;
	};
	
	gs.getAllIndex().forEach(function (tileIndex) {
		let indexList = gs.getIndexListAdjacent(tileIndex);
		
		if (!gs.getTile(tileIndex).type.passable) {
			if (isSolid(tileIndex.x - 1, tileIndex.y) && isSolid(tileIndex.x, tileIndex.y - 1) && isOpen(tileIndex.x - 1, tileIndex.y - 1)) {
				gs.getTile(tileIndex).isCorner = true;
			}
			
			if (isSolid(tileIndex.x, tileIndex.y - 1) && isSolid(tileIndex.x + 1, tileIndex.y) && isOpen(tileIndex.x + 1, tileIndex.y - 1)) {
				gs.getTile(tileIndex).isCorner = true;
			}
			
			if (isSolid(tileIndex.x + 1, tileIndex.y) && isSolid(tileIndex.x, tileIndex.y + 1) && isOpen(tileIndex.x + 1, tileIndex.y + 1)) {
				gs.getTile(tileIndex).isCorner = true;
			}
			
			if (isSolid(tileIndex.x, tileIndex.y + 1) && isSolid(tileIndex.x - 1, tileIndex.y) && isOpen(tileIndex.x - 1, tileIndex.y + 1)) {
				gs.getTile(tileIndex).isCorner = true;
			}
			
		}
	}, this);
};

// ON_ENTER_NEW_LEVEL:
// Called when the player reaches a level for the first time
// ************************************************************************************************
gs.onEnterNewLevel = function () {
	if (!this.isEnteringNewLevel) {
		return;
	}
	
	this.isEnteringNewLevel = false;
	
	// Exploration god heal:
	if (gs.pc.religion === 'Exploration' && gs.pc.currentHp < gs.pc.maxHp) {
		gs.pc.healHp(gs.pc.maxHp);
	}

	// Gargoyle Heals:
	if (gs.pc.race && gs.pc.race.name === 'Gargoyle' && gs.turn > 0) {
		gs.pc.healHp(gs.pc.maxHp);
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	
		// Effect:
		gs.createHealingEffect(gs.pc.tileIndex);	
	}

	// Yendor Dialog:
	if (gs.zoneName === 'TheUpperDungeon' && gs.zoneLevel === 2) {
		gs.messageQueue.pushMessage(gs.dialog.TheUpperDungeonYendor);
	}
	if (gs.zoneName === 'TheOrcFortress' && gs.zoneLevel === 1) {
		gs.messageQueue.pushMessage(gs.dialog.TheOrcFortressYendor);
	}
	if (gs.zoneName === 'TheDarkTemple' && gs.zoneLevel === 1) {
		gs.messageQueue.pushMessage(gs.dialog.TheDarkTempleYendor);
	}
	if (gs.zoneName === 'TheVaultOfYendor' && gs.zoneLevel === 1) {
		gs.messageQueue.pushMessage(gs.dialog.TheVaultOfYendor);
	}
	
	// Timed treasure room dialog:
	let door = gs.objectList.find(obj => obj.type.name === 'TimedDoor');
	if (door && door.timer > 0) {
		gs.messageQueue.pushMessage(gs.dialog.TimedTreasureRoom);
		gs.getTile(door.tileIndex).explored = true;
		gs.HUD.miniMap.refresh();
	}
	
	
};



// GET_PULL_NPC_LIST:
// ************************************************************************************************
gs.getPullNPCList = function (zoneLine) {
	var list = [];
	
	// Pull Hostile NPCs
	this.getIndexListInRadius(zoneLine.tileIndex, 1.5).forEach(function (index) {
		let char = this.getChar(index);
		if (char && char !== this.pc && char.isAgroed && char.faction === FACTION.HOSTILE && !char.isStunned && !char.isImmobile && !char.type.isSwimmer && !char.summonerId) {
			list.push(char.toData());
			char.destroy();
		}
	}, this);
	
	return list;
};

// GET_PULL_ALLY_LIST:
// ************************************************************************************************
gs.getPullAllyList = function () {
	var list = [];
	
	// Pull Friendly Allies from everywhere:
	this.getAllAllies().forEach(function (char) {
		if (!char.type.isImmobile && !char.type.isSwimmer) {
			
			
			list.push(char.toData());
			char.destroy();
		}
	}, this);
	
	return list;
};

// DESCEND_LEVEL:
// Called when falling down pits and pit traps.
// Will handle transitions between zones.
// ************************************************************************************************
gs.descendLevel = function () {
	var nextLevel = gs.nextLevel(),
		pullNPCList;
	
	if (!nextLevel) {
		throw 'Error: cannot descent on this level';
	}

	this.changeLevel(nextLevel.zoneName, nextLevel.zoneLevel);
};

// ZONE_TO:
// Called when interacting with a zoneline.
// ************************************************************************************************
gs.zoneTo = function (zoneLine) {
	let prevZoneName = this.zoneName;
	let prevZoneLevel = this.zoneLevel;
	let pullNPCList = this.getPullNPCList(zoneLine).concat(this.getPullAllyList());
	
	// Change level:
	this.changeLevel(zoneLine.toZoneName, zoneLine.toZoneLevel);
	
	// Search for a connecting zoneLine in the new zone:
	let zoneLineTileIndex;
	
	if (zoneLine.type.name === 'OneWayDownStairs') {
		zoneLineTileIndex = gs.objectList.find(obj => obj.type.name === 'OneWayUpStairs').tileIndex;
	}
	else if (this.getZoneLineTileIndex(prevZoneName, prevZoneLevel)) {
		zoneLineTileIndex = this.getZoneLineTileIndex(prevZoneName, prevZoneLevel);
	}
	else {
		throw 'Zoning from ' + prevZoneName + ' to ' + zoneLine.toZoneName + ', no valid zoneline';
	}
	
	// Set to true to stop strafe attacks from triggering:
	this.pc.isMultiMoving = true;
	this.pc.isQuickMoving = false;
	
	// Move player to zoneline:
	let tileIndex = gs.getNearestPassableSafeIndex(zoneLineTileIndex);
	this.getTile(tileIndex).explored = true; // Manually setting explore suppresses the 'spotted downstairs' message
	this.pc.body.snapToTileIndex(tileIndex);
	this.focusCameraOnPC();
	
	
	// Now in new zone:
	// Note we need to make sure the player keeps travelling after zoning:
	let isTravelling = gs.pc.isTravelling;
	this.pc.stopExploring();
	
	this.pc.isTravelling = isTravelling;
	
	
	
	this.calculateLoS(true);
	gs.HUD.miniMap.refresh(true);
	
	this.placePulledNPCs(pullNPCList);
	
	// Force it to be players turn:
	this.activeCharacterIndex = 0;
	
	gs.pc.updateStats();
	
	this.onEnterNewLevel();
};

// PLACE_PULLED_NPCS:
// ************************************************************************************************
gs.placePulledNPCs = function (pullNPCList) {
	var tileIndex, char;
	
	// Pulled NPCS:
	for (let i = 0; i < pullNPCList.length; i += 1) {
		tileIndex = gs.getNearestPassableSafeIndex(this.pc.tileIndex);
		
		if (tileIndex) {
			pullNPCList[i].tileIndex = {x: tileIndex.x, y: tileIndex.y};
			char = this.loadNPC(pullNPCList[i]);
			char.isAgroed = true;
		}
		else {
			console.log('No space to place ally. Deleting to avoid a crash.');
		}
	}
};

// DESTROY_LEVEL:
// ************************************************************************************************
gs.destroyLevel = function () {
	this.destroyAllNPCs();
    this.destroyAllFloorItems();
	this.destroyAllObjects();
	this.destroyAllProjectiles();
	this.destroyAllClouds();
	this.destroyAllPopUpText();
};

// GET_ZONE_LINE_TILE_INDEX:
// With no arguments this function will return the first zone line it finds
// ************************************************************************************************
gs.getZoneLineTileIndex = function (toZoneName, toZoneLevel) {	
	for (let x = 0; x < this.numTilesX; x += 1) {
		for (let y = 0; y < this.numTilesY; y += 1) {
			let obj = this.getObj(x, y, obj => obj.isZoneLine());
			
			
			if (obj && obj.toZoneName === toZoneName && obj.toZoneLevel === toZoneLevel) {
				return {x: x, y: y};
			}
		}
	}
	return null;
};

// GET_AUTO_STAIRS_INDEX:
// Returns the tileIndex of the stairs that auto move should take you to.
// This should prioritise keeping you in the same zone
// stairTypeName = {UpStairs, downStairs}
// ************************************************************************************************
gs.getAutoStairsIndex = function (stairTypeName) {
	var obj, list;
	
	// Get stairs:
	list = this.objectList.filter(obj => obj.type.name === stairTypeName);
	
	if (stairTypeName === 'DownStairs') {
		// Moving between levels in same level:
		obj = list.find(obj => obj.toZoneName === this.nextLevel().zoneName);
		if (obj) {
			return obj.tileIndex;
		}
	}
	else if (stairTypeName === 'UpStairs' && this.previousLevel()) {
		// Moving between levels in same level:
		obj = list.find(obj => obj.toZoneName === this.previousLevel().zoneName);
		if (obj) {
			return obj.tileIndex;
		}
	}
};

// NICE_ZONE_NAME:
// ************************************************************************************************
gs.niceZoneName = function (zoneName, zoneLevel) {
		
	// Defaults to current level:
	zoneName = zoneName || this.zoneName;
	zoneLevel = zoneLevel || this.zoneLevel;
	
	// Test Zone:
	if (zoneName === 'TestZone') {
		return 'Test Zone: ' + zoneLevel + '/' + gs.zoneTypes.TestZone.numLevels;
	}
	
	// Special override to handle branch zones:
	if (zoneName === DungeonGenerator.zones.Branch1 || zoneName === DungeonGenerator.zones.Branch2) {
		// Boss level:
		if (zoneLevel === 5 && DungeonGenerator.getLevelFeatures(zoneName, zoneLevel).find(levelFeature => levelFeature.featureType === 'BOSS')) {
			let bossName = DungeonGenerator.getLevelFeatures(zoneName, zoneLevel).find(levelFeature => levelFeature.featureType === 'BOSS').bossName;
			return BOSS_LEVEL_NAMES[bossName];
		}
		// Standard Level:
		else {
			return gs.capitalSplit(zoneName) + ': ' + zoneLevel + '/4';
		}
	}
	// Default:
	else {
		// Zone Name:
		let str = gs.capitalSplit(zoneName);
	
		// Zone Level:
		if (gs.zoneTypes[zoneName].numLevels > 1) {
			str += ': ' + zoneLevel + '/' + gs.zoneTypes[zoneName].numLevels;
		}
	
		return str;
	}
};



// DANGER_LEVEL:
// ************************************************************************************************
gs.dangerLevel = function (zoneName, zoneLevel) {
	zoneName = zoneName || this.zoneName;
	zoneLevel = zoneLevel || this.zoneLevel;
	
	return gs.zoneTypes[zoneName].zoneTier.dangerLevel[zoneLevel];
};

// DROP_GOLD_AMOUNT:
// How much gold should spawn on floor and be dropped by enemies.
// This will be based on the dangerLevel()
// ************************************************************************************************
gs.dropGoldAmount = function () {
	if (gs.dangerLevel() <= 4) {
		return 2;
	}
	else if (gs.dangerLevel() <= 8) {
		return 3;
	}
	else {
		return 4;
	}
};

// LOOT_TIER:
// ************************************************************************************************
gs.lootTier = function () {
	//return gs.zoneType().zoneTier.lootTier;
	
	// UD:1-4 and Wilderness:1-3
	if (gs.dangerLevel() <= 5) {
		return 1;
	}
	// Wilderness:4, Fortress:1-3, Branch-I:1-2
	else if (gs.dangerLevel() <= 10) {
		return 2;
	}
	// Fortress:4-6, Branch-I:3-5, Branch-II
	else {
		return 3;
	}
};


// GET_ZONE_MUSIC:
// ************************************************************************************************
gs.getZoneMusic = function (zoneName) {
	// No zone data:
	if (this.zoneTypes[zoneName]) {
		return this.zoneTypes[zoneName].musicTrack;
	} else {
		return null;
	}
};

// UNEXPLORED_TILES_REMAINING:
// ************************************************************************************************
gs.unexploredTilesRemaining = function () {
	var indexList = gs.getAllIndex();
	
	indexList = indexList.filter(function (tileIndex) {
		return !gs.getTile(tileIndex).explored 
			&& gs.getTile(tileIndex).type.passable
			&& !gs.getTile(tileIndex).isDropWallRoom
			&& !gs.isPit(tileIndex);
	});
		

	return indexList.length > 0;
};

// GET_UP_STAIRS_TILE_INDEX:
// ************************************************************************************************
gs.getUpStairsTileIndex = function () {
	// Up Stairs:
	let upStairs = gs.objectList.find(obj => obj.type.name === 'UpStairs');
	if (upStairs) {
		return upStairs.tileIndex;
	}
	
	// PC Spawn Point:
	let pcSpawnPoint = gs.objectList.find(obj => obj.type.name === 'PCSpawnPoint');
	if (pcSpawnPoint) {
		return pcSpawnPoint.tileIndex;
	}
	
	throw 'ERROR [getUpStairsTileIndex] - no upstairs or pcSpawnPoint on level';
};

// GET_LEVEL_CONNECTIONS:
// ************************************************************************************************
gs.getLevelConnections = function (zoneName, zoneLevel) {
	let list = [];
	
	// Down Stairs:
	if (zoneLevel < gs.zoneTypes[zoneName].numLevels) {
		list.push({zoneName: zoneName, zoneLevel: zoneLevel + 1});
	}
	
	// Up Stairs:
	if (zoneLevel > 1) {
		list.push({zoneName: zoneName, zoneLevel: zoneLevel - 1});
	}
	
	// Branch Stairs:
	let zoneLineFeatures = DungeonGenerator.getLevelFeatures(zoneName, zoneLevel).filter(levelFeature => levelFeature.featureType === FEATURE_TYPE.ZONE_LINE);
	zoneLineFeatures.forEach(function (zoneLineFeature) {
		list.push({zoneName: zoneLineFeature.toZoneName, zoneLevel: zoneLineFeature.toZoneLevel});
	}, this);
	
	return list;
};

