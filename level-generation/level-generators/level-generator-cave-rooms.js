/*global game, util, gs, console*/
/*global LevelGeneratorUtils, DungeonGenerator*/
/*global AreaGeneratorCave, AreaGeneratorVault, AreaGeneratorSquare, AreaGeneratorCross, AreaGeneratorLong*/ 
/*global VAULT_CONTENT, VAULT_PLACEMENT, FEATURE_TYPE*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

let LevelGeneratorCaveRooms = Object.create(LevelGeneratorBase);

// INIT:
// ************************************************************************************************
LevelGeneratorCaveRooms.init = function () {
	this.name = 'LevelGeneratorCaveRooms';
};
LevelGeneratorCaveRooms.init();

// GENERATE:
// ************************************************************************************************
LevelGeneratorCaveRooms.generate = function () {
	this.initNumVaults();
	
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	// Get Big Mask:
	let bigMask = LevelGeneratorUtils.getBigCaveMask();
	
	// Cave fill:
	let boundsBox = util.createBox(4, 4, NUM_TILES_X - 4, NUM_TILES_Y - 4);
	this.mainCaveArea = AreaGeneratorCave.generate(boundsBox, this.bigMask);
	
	// Rooms:
	this.roomAreaList = [];
	this.placeRooms();
	this.connectRooms();
	
	// Trim Walls
	LevelGeneratorUtils.trimWalls();
	
	// Place Doors:
	LevelGeneratorUtils.placeDoors();
	
	this.roomAreaList.push(this.mainCaveArea);
	gs.areaList = this.roomAreaList;
};

// PLACE_ROOMS:
// ************************************************************************************************
LevelGeneratorCaveRooms.placeRooms = function () {
	for (let i = 0; i < 20; i += 1) {
		let maxRoomSize = {width: util.randInt(7, 15), height: util.randInt(7, 15)};
		let tileIndex = this.getTileIndexForRoom(maxRoomSize);
		let area = null;
	
		if (tileIndex) {
			// Vault:
			area = this.tryToPlaceVault(tileIndex, maxRoomSize);
			
			// Random Room:
			if (!area) {
				area = this.tryToPlaceRandomRoom(tileIndex, maxRoomSize);
			}
			
			if (area) {
				this.roomAreaList.push(area);
			}
		}
		
		if (this.roomAreaList.length > 5) {
			break;
		}
	}
};

// TRY_TO_PLACE_VAULT:
// ************************************************************************************************
LevelGeneratorCaveRooms.tryToPlaceVault = function (tileIndex, maxRoomSize) {
	let vaultTypeList = gs.getVaultTypeList();
	
	// Size Filter:
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.isValidForMaxSize(maxRoomSize));
	
	// Placement Filter:
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID);
	
	// Content Filter:
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.AESTHETIC);
	
	if (vaultTypeList.length > 0) {
		let vaultType = util.randElem(vaultTypeList);
			
		let angle = vaultType.getAngleForMaxSize(maxRoomSize);

		let area = AreaGeneratorVault.generate(tileIndex, vaultType, angle);

		return area;
	}
};

// TRY_TO_PLACE_RANDOM_ROOM:
// ************************************************************************************************
LevelGeneratorCaveRooms.tryToPlaceRandomRoom = function (tileIndex, maxRoomSize) {
	let areaGeneratorList = [
		AreaGeneratorSquare, 
		AreaGeneratorCross, 
		AreaGeneratorLong
	];
	areaGeneratorList = util.shuffleArray(areaGeneratorList);
	
	while(areaGeneratorList.length > 0) {
		let areaGenerator = areaGeneratorList.pop();
	
		let roomSize = areaGenerator.getValidRoomSize(maxRoomSize);
		
		if (roomSize) {
			let roomBox = util.createBox(tileIndex.x, tileIndex.y, tileIndex.x + roomSize.width, tileIndex.y + roomSize.height);
			let roomArea = areaGenerator.generate(roomBox);
			return roomArea;
		}
	}
	
	return null;
};

// GET_TILE_INDEX_FOR_ROOM:
// Returns a tileIndex for a room of maxRoomSize such that it overlaps both solid and open cave tiles.
// ************************************************************************************************
LevelGeneratorCaveRooms.getTileIndexForRoom = function (maxRoomSize) {
	var validList = [],
		width = maxRoomSize.width,
		height = maxRoomSize.height;
	
	for (let x = 0; x < NUM_TILES_X - width - 1; x += 1) {
		for (let y = 0; y < NUM_TILES_Y - height - 1; y += 1) {
			let indexList = gs.getIndexListInBox(x, y, x + width, y + height);
			
			let numCaveWalls = indexList.filter(index => gs.getTile(index).type.name === 'CaveWall').length;
			let numCaveFloors = indexList.filter(index => gs.getTile(index).type.name === 'CaveFloor').length;
			let numFloors = indexList.filter(index => gs.getTile(index).type.name === 'Floor').length;
			
			// To assure we don't overlap other rooms:
			let numAreaWalls = indexList.filter(index => gs.getTile(index).type.name === 'Wall' && gs.isExternalWall(index)).length;
			
			if (indexList.length === width * height
				&& numCaveWalls >= width * height / 2 
				&& numCaveFloors > 1 
				&& numCaveFloors <= Math.min(width, height) 
				&& numFloors === 0
			   	&& numAreaWalls === 0) {
				
				validList.push({x: x, y: y});
			}
		}
	}
	
	return validList.length > 0 ? util.randElem(validList) : null;
};

// CONNECT_ROOMS:
// ************************************************************************************************
LevelGeneratorCaveRooms.connectRooms = function () {
	// Connect rooms to cave:
	this.roomAreaList.forEach(function (roomArea1) {
		LevelGeneratorUtils.placeShortestHall(roomArea1, this.mainCaveArea);
		
		this.roomAreaList.forEach(function (roomArea2) {
			// Skip Self:
			if (roomArea1 === roomArea2) {
				return;
			}
			
			// Shortest Distance:
			let indexPair = LevelGeneratorUtils.getShortestHallIndexPair(roomArea1, roomArea2);
			let distance = util.distance(indexPair[0], indexPair[1]);
			
			// Only if close
			if (distance < 10) {
				LevelGeneratorUtils.placeShortestHall(roomArea1, roomArea2);
			}
		}, this);
	}, this);
};