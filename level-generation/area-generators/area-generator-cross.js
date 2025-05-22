/*global gs, util*/
/*global AreaGeneratorBase, LevelGeneratorUtils, AreaGeneratorLong*/
/*global EXCEPTION_TYPE*/
'use strict';

// AREA_GENERATOR_CROSS:
// ********************************************************************************************
let AreaGeneratorCross = Object.create(AreaGeneratorBase);

// ROOM_SIZE_LIST:
// ********************************************************************************************
AreaGeneratorCross.MIN_SIZE_PERCENT = 0.5; // Allows narrow rooms
AreaGeneratorCross.roomSizeList = [
	{width: 11, height: 11},
	{width: 13, height: 13},
	{width: 15, height: 15},	
];

AreaGeneratorCross.tallRoomSizeList = [
	{width: 7, height: 11},
	{width: 7, height: 13},
	{width: 7, height: 15},

	{width: 9, height: 13},
	{width: 9, height: 15},

	{width: 11, height: 15}
];

AreaGeneratorCross.wideRoomSizeList = [
	{width: 11, height: 7},
	{width: 13, height: 7},
	{width: 15, height: 7},

	{width: 13, height: 9},
	{width: 15, height: 9},

	{width: 15, height: 11},
];

// GENERATE:
// ********************************************************************************************
AreaGeneratorCross.generate = function (boundsBox) {
	// Room Boxes:
	let tallRoomBox = this.selectRandomRoomBox(boundsBox, this.tallRoomSizeList);
	let wideRoomBox = this.selectRandomRoomBox(boundsBox, this.wideRoomSizeList);
	
	// Walls:
	LevelGeneratorUtils.placeTileSquare(tallRoomBox.startX, tallRoomBox.startY, tallRoomBox.endX, tallRoomBox.endY, gs.tileTypes.Wall);
	LevelGeneratorUtils.placeTileSquare(wideRoomBox.startX, wideRoomBox.startY, wideRoomBox.endX, wideRoomBox.endY, gs.tileTypes.Wall);
	
	// Floors:
	let tallFloorBox = util.innerBox(tallRoomBox);
	let wideFloorBox = util.innerBox(wideRoomBox);
	LevelGeneratorUtils.placeTileSquare(tallFloorBox.startX, tallFloorBox.startY, tallFloorBox.endX, tallFloorBox.endY, gs.tileTypes.Floor);
	LevelGeneratorUtils.placeTileSquare(wideFloorBox.startX, wideFloorBox.startY, wideFloorBox.endX, wideFloorBox.endY, gs.tileTypes.Floor);
	
	// Create Area:
	let area = LevelGeneratorUtils.createArea(boundsBox.startX, boundsBox.startY, boundsBox.endX, boundsBox.endY);
	
	// Set Area Properties:
	area.areaGenerator = this;
	
	// Randomly select rooms for dressing:
	if (util.frac() < 0.5) {	
		area.pillarRoomBox = tallRoomBox;
		area.liquidRoomBox = wideRoomBox;
	}
	else {
		area.pillarRoomBox = wideRoomBox;
		area.liquidRoomBox = tallRoomBox;
	}
	return area;
};


// PLACE_PILLARS:
// ********************************************************************************************
AreaGeneratorCross.placePillars = function (area) {
	AreaGeneratorLong.placePillars(area.pillarRoomBox);
};

// PLACE_LIQUID:
// ********************************************************************************************
AreaGeneratorCross.placeLiquid = function (area, tileType) {
	// Destroy any objects in the area (created by the placePillars pass):
	gs.getIndexListInBox(util.innerBox(area.liquidRoomBox, 2)).forEach(function (tileIndex) {
		if (gs.getObj(tileIndex)) {
			gs.destroyObject(gs.getObj(tileIndex));
		}
	}, this);
	
	AreaGeneratorLong.placeLiquid(area.liquidRoomBox, tileType);
};




