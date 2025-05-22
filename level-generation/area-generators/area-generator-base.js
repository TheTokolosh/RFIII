/*global gs, util*/
/*global LevelGeneratorUtils*/
/*global EXCEPTION_TYPE*/
'use strict';

// AREA_GENERATOR_BASE:
// ********************************************************************************************
let AreaGeneratorBase = {
	MIN_SIZE_PERCENT: 0.75,
};

// GET_VALID_ROOM_SIZE:
// Returns a random roomSize that fits the maxRoomSize
// If maxRoomSize === null, will return a random validRoomSize
// ********************************************************************************************
AreaGeneratorBase.getValidRoomSize = function (maxRoomSize) {
	if (!maxRoomSize) {
		return util.randElem(this.roomSizeList);
	}
	
	let maxWidth = maxRoomSize.width,
		maxHeight = maxRoomSize.height,
		minWidth = Math.ceil(maxRoomSize.width / 2),
		minHeight = Math.ceil(maxRoomSize.height / 2);
	
	// Filter by Size:
	let validRoomSizeList = this.roomSizeList.filter(function (roomSize) {
		return roomSize.width >= minWidth
			&& roomSize.height >= minHeight
			&& roomSize.width <= maxWidth
			&& roomSize.height <= maxHeight;
	}, this);
	
	// Return Random Size:
	if (validRoomSizeList.length > 0) {
		return util.randElem(validRoomSizeList);
	}
	// No valid roomSize:
	else {
		return null;
	}
};

// SELECT_RANDOM_ROOM_BOX:
// We try to match the boundsBox as closely as possible
// Returns a roomBox with random size and startTileIndex (within the bounds)
// Throws EXCEPTION_TYPE.AREA_GENERATION if cannot select a valid room Box
// ********************************************************************************************
AreaGeneratorBase.selectRandomRoomBox = function (boundsBox, roomSizeList = null) {
	let minWidth = Math.floor(boundsBox.width * this.MIN_SIZE_PERCENT),
		minHeight = Math.floor(boundsBox.height * this.MIN_SIZE_PERCENT),
		maxWidth = boundsBox.width,
		maxHeight = boundsBox.height;
	
	roomSizeList = roomSizeList || this.roomSizeList;
		
	// Filter out anything that is too large:
	roomSizeList = roomSizeList.filter(roomSize => roomSize.width <= maxWidth && roomSize.height <= maxHeight);
	
	// Filter out anything that is too small:
	roomSizeList = roomSizeList.filter(roomSize => roomSize.width >= minWidth && roomSize.height >= minHeight);
	
	// Error Handling:
	if (roomSizeList.length === 0) {
		throw {type: EXCEPTION_TYPE.AREA_GENERATION, text: 'No valid roomSize for boundsBox: ', boundsBox: boundsBox};
	}
	
	// A random roomSize:
	let roomSize = util.randElem(roomSizeList);
	
	// A random tileIndex:
	let tileIndex = {x: boundsBox.startX + util.randInt(0, boundsBox.width - roomSize.width),
					 y: boundsBox.startY + util.randInt(0, boundsBox.height - roomSize.height)};
	
	// Return the Box:
	return util.createBox(tileIndex.x, tileIndex.y, tileIndex.x + roomSize.width, tileIndex.y + roomSize.height);
};

// DRESS_AREA:
// The default dressArea function .
// Area-Generators can override placePillars(area) and placeLiquid(area)
// Area-Generator-Cave and Area-Generator-Vault override this function
// ********************************************************************************************
AreaGeneratorBase.dressArea = function (area) {
	let zoneType = gs.zoneType(),
		hasFluid = false;
	
	// Pillars:
	if (util.frac() < 0.25) {
		this.placePillars(area);
	}
	
	
	// Water:
	if (util.frac() < 0.25 && zoneType.spawnWater) {
		this.placeLiquid(area, gs.tileTypes.Water);
		hasFluid = true;
	}
	
	// Lava:
	if (util.frac() < 0.25 && !hasFluid && zoneType.spawnLava) {
		this.placeLiquid(area, gs.tileTypes.Lava);
		hasFluid = true;
	}
	
	// Toxic Waste
	if (util.frac() < 0.25 && !hasFluid && zoneType.spawnToxicWaste) {
		this.placeLiquid(area, gs.tileTypes.ToxicWaste);
		hasFluid = true;
	}
	
	// Pit:
	if (util.frac() < 0.10 && !hasFluid && zoneType.spawnPits && gs.zoneLevel < zoneType.numLevels) {
		this.placeLiquid(area, gs.tileTypes.DungeonPit);
		gs.trimPits(area);
	}
};

// PLACE_PILLARS:
// ********************************************************************************************
AreaGeneratorBase.placePillars = function (area) {
	// Pass
};

// PLACE_LIQUID:
// ********************************************************************************************
AreaGeneratorBase.placeLiquid = function (area, tileType) {
	// Pass
};

// GET_PILLAR_DESC:
// returns {objectTypeName, objectFrame}
// ********************************************************************************************
AreaGeneratorBase.getPillarDesc = function () {
	// Default Pillar Object:
	let objectTypeName = 'Pillar',
		objectFrame = null;

	// ZoneType can provide a RandomTable of {objectTypeName, objectFrame = null}: 
	if (gs.zoneType().pillarTypeTable) {
		let pillar = util.chooseRandom(gs.zoneType().pillarTypeTable);
		objectTypeName = pillar.objectTypeName;
		objectFrame = pillar.objectFrame;
	}
	
	return {objectTypeName: objectTypeName, objectFrame: objectFrame};
};