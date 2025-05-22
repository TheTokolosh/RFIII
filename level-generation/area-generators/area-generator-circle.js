/*global gs, util, console*/
/*global AreaGeneratorBase, LevelGeneratorUtils, VaultLoader*/
/*global EXCEPTION_TYPE*/
'use strict';

// AREA_GENERATOR_CIRCLE:
// ********************************************************************************************
let AreaGeneratorCircle = Object.create(AreaGeneratorBase);

// ROOM_SIZE_LIST:
// ********************************************************************************************
AreaGeneratorCircle.roomSizeList = [
	{width: 9, height: 9, vaultTypeName: '_General/CircleRooms/CircleRoom9'},
	{width: 11, height: 11, vaultTypeName: '_General/CircleRooms/CircleRoom11'},
	{width: 13, height: 13, vaultTypeName: '_General/CircleRooms/CircleRoom13'},
];

// GENERATE:
// ********************************************************************************************
AreaGeneratorCircle.generate = function (boundsBox) {
	// Select Random Room Box:
	let roomBox = this.selectRandomRoomBox(boundsBox, this.roomSizeList);
	
	// Create the tileTypeMap:
	let vaultType = this.getVaultType(roomBox);
	let tileTypeMap = vaultType.getTileTypeMap();
	
	// Place the tileTypeMap:
	gs.placeTileTypeMap(roomBox.startTileIndex, tileTypeMap);
	
	// Create the Area:
	let area = LevelGeneratorUtils.createArea(roomBox.startX, roomBox.startY, roomBox.endX, roomBox.endY);
	
	// Set Area Properties:
	area.areaGenerator = this;
	area.vaultType = vaultType; // Remember the vaultType
	
	return area;
};

// GET_VAULT_TYPE_NAME:
// ********************************************************************************************
AreaGeneratorCircle.getVaultType = function (roomBox) {
	let vaultTypeName = this.roomSizeList.find(size => size.width === roomBox.width && size.height === roomBox.height).vaultTypeName;
	return gs.getVaultType(vaultTypeName);
};

// PLACE_PILLARS:
// ********************************************************************************************
AreaGeneratorCircle.placePillars = function (area) {
	// Reload the tileTypeMap:
	let tileTypeMap = area.vaultType.getTileTypeMap();
	
	// Get the objectType and Frame:
	let pillar = this.getPillarDesc();
	let objectTypeName = pillar.objectTypeName;
	let objectFrame = pillar.objectFrame;
	
	// Search for pillarFlags:
	for (let x = 0; x < tileTypeMap.width; x += 1) {
		for (let y = 0; y < tileTypeMap.height; y += 1) {
			// Need to offset:
			let offsetTileIndex = {x: area.startX + x, y: area.startY + y};
			
			// Create if we find a pillarFlag:
			if (tileTypeMap[x][y].pillarFlag && !gs.getObj(offsetTileIndex)) {
				gs.createObject(offsetTileIndex, objectTypeName, objectFrame);
			}
		}
	}
};

// PLACE_LIQUID:
// ********************************************************************************************
AreaGeneratorCircle.placeLiquid = function (area, tileType) {
	// Reload the tileTypeMap:
	let tileTypeMap = area.vaultType.getTileTypeMap();
	
	// Floor fields:
	for (let x = 0; x < tileTypeMap.width; x += 1) {
		for (let y = 0; y < tileTypeMap.height; y += 1) {
			// Need to offset:
			let offsetTileIndex = {x: area.startX + x, y: area.startY + y};
			
			// Create if we find floodField:
			if (tileTypeMap[x][y].floorField && gs.isPassable(offsetTileIndex) && !gs.getTile(offsetTileIndex).mustBeFloor) {
				gs.setTileType(offsetTileIndex, tileType);
			}
		}
	}
	
};