/*global gs, util*/
/*global AreaGeneratorBase, LevelGeneratorUtils*/
'use strict';

// AREA_GENERATOR_SQUARE:
// ********************************************************************************************
let AreaGeneratorSquare = Object.create(AreaGeneratorBase);

// ROOM_SIZE_LIST:
// ********************************************************************************************
AreaGeneratorSquare.roomSizeList = [
	{width: 7, height: 7},
	{width: 9, height: 9},
	{width: 11, height: 11},
	{width: 13, height: 13},
	{width: 15, height: 15},
];

// GENERATE:
// ********************************************************************************************
AreaGeneratorSquare.generate = function (boundsBox) {
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
AreaGeneratorSquare.placePillars = function (area) {
	// Get the objectType and Frame:
	let pillar = this.getPillarDesc();
	let objectTypeName = pillar.objectTypeName;
	let objectFrame = pillar.objectFrame;
	
	// Function: 
	let tryToPlacePillar = function (x, y) {
		if (!gs.getObj(x, y)) {
			gs.createObject({x: x, y: y}, objectTypeName, objectFrame);
		}
	};
	
	// Single Pillar:
	if (area.width === 7) {
		tryToPlacePillar(area.centerX, area.centerY);
	}
	// Corner Pillars:
	else {
		let pillarBox = util.innerBox(area, 2);
		tryToPlacePillar(pillarBox.startX, pillarBox.startY);
		tryToPlacePillar(pillarBox.startX, pillarBox.endY - 1);
		tryToPlacePillar(pillarBox.endX - 1, pillarBox.startY);
		tryToPlacePillar(pillarBox.endX - 1, pillarBox.endY - 1);
	}

};

// PLACE_LIQUID:
// ********************************************************************************************
AreaGeneratorSquare.placeLiquid = function (area, tileType) {
	let waterBoxList = [];
	
	// 1 Tile Border:
	waterBoxList.push(util.innerBox(area, 2));
	
	if (area.width >= 9) {
		// 2 Tile Border:
		waterBoxList.push(util.innerBox(area, 3));
		
		// Mixed Border:
		let box = util.innerBox(area, 2);
		waterBoxList.push(util.createBox(box.startX + 1, box.startY, box.endX - 1, box.endY));
		waterBoxList.push(util.createBox(box.startX, box.startY + 1, box.endX, box.endY - 1));
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
};



