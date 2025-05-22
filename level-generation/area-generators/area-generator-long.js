/*global gs, util*/
/*global AreaGeneratorBase, LevelGeneratorUtils*/
/*global EXCEPTION_TYPE*/
'use strict';

// AREA_GENERATOR_LONG:
// ********************************************************************************************
let AreaGeneratorLong = Object.create(AreaGeneratorBase);

// ROOM_SIZE_LIST:
// ********************************************************************************************
AreaGeneratorLong.MIN_SIZE_PERCENT = 0.5; // Allows narrow rooms
AreaGeneratorLong.roomSizeList = [
	// Tall:
	{width: 7, height: 11},
	{width: 7, height: 13},
	{width: 7, height: 15},
	{width: 9, height: 13},
	{width: 9, height: 15},
	{width: 11, height: 15},

	// Wide:
	{width: 11, height: 7},
	{width: 13, height: 7},
	{width: 15, height: 7},
	{width: 13, height: 9},
	{width: 15, height: 9},
	{width: 15, height: 11},
];

// GENERATE:
// Returns a new area for the generated room
// Throws EXCEPTION_TYPE.AREA_GENERATION if cannot select a valid room size.
// ********************************************************************************************
AreaGeneratorLong.generate = function (boundsBox) {
	// Select Random Room Box:
	let roomBox = this.selectRandomRoomBox(boundsBox, this.roomSizeList);
	
	// Place Wall:
	LevelGeneratorUtils.placeTileSquare(roomBox.startX, roomBox.startY, roomBox.endX, roomBox.endY, gs.tileTypes.Wall);

	// Place Floor:
	let floorBox = util.innerBox(roomBox);
	LevelGeneratorUtils.placeTileSquare(floorBox.startX, floorBox.startY, floorBox.endX, floorBox.endY, gs.tileTypes.Floor);
	
	// Create Area:
	let area = LevelGeneratorUtils.createArea(roomBox.startX, roomBox.startY, roomBox.endX, roomBox.endY);
	
	// Set Area Properties:
	area.areaGenerator = this;

	return area;
};

// PLACE_PILLARS:
// ********************************************************************************************
AreaGeneratorLong.placePillars = function (area) {
	// Get the objectType and Frame:
	let pillar = this.getPillarDesc();
	let objectTypeName = pillar.objectTypeName;
	let objectFrame = pillar.objectFrame;
	
	// We want pillars to be 1 tile away from the walls:
	let pillarBox = util.innerBox(area, 2);
	
	let indexList = gs.getIndexListInBox(pillarBox);
	
	// Handle Wide Case:
	if (area.width > area.height) {
		// Pillars go down the center on narrow rooms:
		if (area.height <= 7) {
			indexList = indexList.filter(idx => idx.y === pillarBox.centerY);
		}
		// Pillars along the sides:
		else {
			indexList = indexList.filter(idx => idx.y === pillarBox.startY || idx.y === pillarBox.endY - 1);
		}
		
		// Pillars only at corners:
		if (area.width <= 9) {
			indexList = indexList.filter(idx => idx.x === pillarBox.startX || idx.x === pillarBox.endX - 1);
		}
		// Pillars at corners + center:
		else {
			indexList = indexList.filter(idx => idx.x === pillarBox.startX || idx.x === pillarBox.endX - 1 || idx.x === pillarBox.centerX);
		}
	}
	// Handle Tall Case:
	else {
		// Pillars go down the center on narrow rooms:
		if (area.width <= 7) {
			indexList = indexList.filter(idx => idx.x === pillarBox.centerX);
		}
		// Pillars along the sides:
		else {
			indexList = indexList.filter(idx => idx.x === pillarBox.startX || idx.x === pillarBox.endX - 1);
		}
		
		// Pillars only at corners:
		if (area.height <= 9) {
			indexList = indexList.filter(idx => idx.y === pillarBox.startY || idx.y === pillarBox.endY - 1);
		}
		// Pillars at corners + center:
		else {
			indexList = indexList.filter(idx => idx.y === pillarBox.startY || idx.y === pillarBox.endY - 1 || idx.y === pillarBox.centerY);
		}
	}
	
	// Create Pillars:
	indexList.forEach(function (tileIndex) {
		if (!gs.getObj(tileIndex)) {
			gs.createObject(tileIndex, objectTypeName, objectFrame);
		}
	}, this);
	
};

// PLACE_LIQUID:
// ********************************************************************************************
AreaGeneratorLong.placeLiquid = function (area, tileType) {
	let waterBoxList = [];
	
	// 1 Tile Border:
	waterBoxList.push(util.innerBox(area, 2));
	
	// 2 Tiles Both:
	if (area.width >= 9 && area.height >= 9) {
		waterBoxList.push(util.innerBox(area, 3));
	}
	
	// 2 Tile Above and Below:
	if (area.height >= 9) {
		let box = util.innerBox(area, 2);
		waterBoxList.push(util.createBox(box.startX, box.startY + 1, box.endX, box.endY - 1));
	}
	
	// 2 Tile Left and Right:
	if (area.width >= 9) {
		let box = util.innerBox(area, 2);
		waterBoxList.push(util.createBox(box.startX + 1, box.startY, box.endX - 1, box.endY));
	}
	
	// Select on of the valid waterBoxes:
	let waterBox = util.randElem(waterBoxList);
	
	// Set Tiles:
	gs.getIndexListInBox(waterBox).forEach(function (tileIndex) {
		// mustBeFloor is set in arcane generator:
		if (!gs.getTile(tileIndex).mustBeFloor && gs.isPassable(tileIndex)) {
			gs.setTileType(tileIndex, tileType);
		}
	}, this);
	
	// Random chance to cut down center:
	if (util.frac() < 0.25) {
		let box = util.innerBox(area, 2);
		
		if (area.height >= 13) {
			LevelGeneratorUtils.placeTileLine({x: box.startX, y: box.centerY}, {x: box.endX - 1, y: box.centerY}, 1, gs.tileTypes.Floor);
		}
		
		if (area.width >= 13) {
			LevelGeneratorUtils.placeTileLine({x: box.centerX, y: box.startY}, {x: box.centerX, y: box.endY - 1}, 1, gs.tileTypes.Floor);
		}
			
	}
};