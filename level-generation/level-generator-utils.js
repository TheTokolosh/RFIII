/*global gs, util, console, debug*/
/*global ConnectionMap, Area*/
/*global AreaGeneratorVault, AreaGeneratorSquare, AreaGeneratorCircle, AreaGeneratorCross, AreaGeneratorLong*/
/*global VAULT_PLACEMENT*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

let LevelGeneratorUtils = {
	
};

// CREATE_AREA:
// ************************************************************************************************
LevelGeneratorUtils.createArea = function (startX, startY, endX, endY, overWriteArea = true) {
	return new Area(startX, startY, endX, endY, overWriteArea);
};

// REMOVE_ALL_AREA_FLAGS:
// ************************************************************************************************
LevelGeneratorUtils.removeAllAreaFlags = function () {
	for (let x = 0; x < NUM_TILES_X; x += 1) {
		for (let y = 0; y < NUM_TILES_Y; y += 1) {
			gs.getTile(x, y).area = null;
		}
	}
};

// GET_NEAREST_AREA:
// ************************************************************************************************
LevelGeneratorUtils.getNearestArea = function (area, areaList) {
	let distance = 1000,
		nearestArea = null;
	
	areaList.forEach(function (area2) {
		let indexPair = this.getShortestHallIndexPair(area, area2);
		
		if (util.distance(indexPair[0], indexPair[1]) < distance) {
			distance = util.distance(indexPair[0], indexPair[1]);
			nearestArea = area2;
		}
	}, this);
	
	return nearestArea;
};



// TRY_TO_PLACE_RANDOM_ROOM:
// ************************************************************************************************
LevelGeneratorUtils.tryToPlaceRandomRoom = function (maxRoomSize = null, boundsBox = null) {
	boundsBox = boundsBox || util.createBox(0, 0, NUM_TILES_X, NUM_TILES_Y);
	
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
			// Try to find a valid tileIndex for room:
			let tileIndex = LevelGeneratorUtils.getTileIndexForClosedBox(roomSize.width, roomSize.height, boundsBox);
			
			// Generate and return the area:
			if (tileIndex) {
				let roomBox = util.createBox(tileIndex.x, tileIndex.y, tileIndex.x + roomSize.width, tileIndex.y + roomSize.height);
				let roomArea = areaGenerator.generate(roomBox);
				return roomArea;
			}
		}
	}
	
	// Failed after many tries:
	return null;
};

// GET_TILE_INDEX_FOR_CLOSED_BOX:
// Return the top-left tileIndex at which a box of size width/height can be placed
// ************************************************************************************************
LevelGeneratorUtils.getTileIndexForClosedBox = function (width, height, boundsBox) {
	// boundsBox defaults to entire level:
	boundsBox = boundsBox || util.createBox(0, 0, NUM_TILES_X, NUM_TILES_Y);
	
	// Will store a list of all valid index:
	let validIndexList = [];
	
	for (let x = boundsBox.startX; x < boundsBox.endX - width; x += 1) {
		for (let y = boundsBox.startY; y < boundsBox.endY - height; y += 1) {
			
			let indexList = gs.getIndexListInBox(x, y, x + width, y + height);
			indexList = indexList.filter(function (tileIndex) {
				return !gs.isPassable(tileIndex)
					&& !gs.isExternalWall(tileIndex)
					&& !gs.getTile(tileIndex).isSolidWall
					&& !gs.getTile(tileIndex).area
					&& !gs.getTile(tileIndex).isClosed;
			});

			if (indexList.length === width * height) {
				validIndexList.push({x: x, y: y});
			}
		}
	}
	
	return validIndexList.length > 0 ? util.randElem(validIndexList) : null;
};


// PLACE_TILE_LINE:
// Place a straight line of tiles
// ************************************************************************************************
LevelGeneratorUtils.placeTileLine = function (fromTileIndex, toTileIndex, width, tileType, func) {
		var deltaVec = util.normal(fromTileIndex, toTileIndex),
		perpVec = {x: -deltaVec.y, y: deltaVec.x},
		currentTileIndex = {x: fromTileIndex.x, y: fromTileIndex.y},
		count = 0,
		i;

	
	func = func || function (tileIndex) {return true; };
	
	while (!util.vectorEqual(currentTileIndex, toTileIndex)) {
		for (i = -Math.floor(width / 2); i < Math.ceil(width / 2); i += 1) {
			if (func({x: currentTileIndex.x + perpVec.x * i, y: currentTileIndex.y + perpVec.y * i})) {
				if (currentTileIndex.x + perpVec.x * i > 0
				   && currentTileIndex.x + perpVec.x * i < NUM_TILES_X - 1
				   && currentTileIndex.y + perpVec.y * i > 0
				   && currentTileIndex.y + perpVec.y * i < NUM_TILES_Y - 1) {
					gs.setTileType({x: currentTileIndex.x + perpVec.x * i,
									y: currentTileIndex.y + perpVec.y * i},
								   tileType);
				}
				
			}
		}
		
		currentTileIndex.x += deltaVec.x;
		currentTileIndex.y += deltaVec.y;
		
		count += 1;
		if (count > 1000) {
			throw 'break';
		}
	}
	
	// Make sure we catch the last one:
	for (i = -Math.floor(width / 2); i < Math.ceil(width / 2); i += 1) {
		if (func({x: currentTileIndex.x + perpVec.x * i, y: currentTileIndex.y + perpVec.y * i})) {
			gs.setTileType({x: currentTileIndex.x + perpVec.x * i, y: currentTileIndex.y + perpVec.y * i}, tileType);
		}
	}
};

// PLACE_TILE_SQUARE:
// Place a square of tiles fromTileIndex (inclusive) to toTileIndex (exclusive):
// ************************************************************************************************
LevelGeneratorUtils.placeTileSquare = function (startX, startY, endX, endY, tileType, onlyEdge) {
	for (let x = startX;  x < endX; x += 1) {
        for (let y = startY; y < endY; y += 1) {
			if (!onlyEdge || x === startX || x === endX - 1 || y === endY || y === endY - 1) {
				gs.setTileType({x: x, y: y}, tileType);
			}
		}
	}
};

// PLACE_TILE_CIRCLE:
// // ************************************************************************************************
LevelGeneratorUtils.placeTileCircle = function (centerTileIndex, radius, tileType) {
    gs.getIndexListInRadius(centerTileIndex, radius + 1).forEach(function (index) {
		if (util.distance(centerTileIndex, index) < radius + 1) {
			gs.setTileType(index, tileType);
		}
    }, this);
};

// PLACE_HALL:
// Start and End can be either Area or TileIndex
// *************************************************************************
LevelGeneratorUtils.placeHall = function (start, end, width) {
	// Convert to tileIndex if box or area:
	let startTileIndex = start.hasOwnProperty('width') ? this.getHallIndex(start) : start;
	let endTileIndex = end.hasOwnProperty('width') ? this.getHallIndex(end) : end;
	
	// Log Errors:
	if (!startTileIndex) {
		console.log('createAStarHall: invalid startTileIndex');
		return;
	}
	
	// Log Errors:
	if (!endTileIndex) {
		console.log('createAStarHall: invalid endTileIndex');
		return;
	}
	
	// Debug Color End Points:
	if (gs.debugProperties.logAStarTunnels) {
		this.HallGenerator.debugColorEndPoints(startTileIndex, endTileIndex);
	}
	
	this.HallGenerator.placeHall(startTileIndex, endTileIndex, width);
};

// PLACE_SHORTEST_HALL:
// ************************************************************************************************
LevelGeneratorUtils.placeShortestHall = function (area1, area2) {
	let indexList = this.getShortestHallIndexPair(area1, area2);

	// Connect Areas:
	LevelGeneratorUtils.placeHall(indexList[0], indexList[1], 1);
};

// GET_SHORTEST_HALL_INDEX_PAIR:
// ************************************************************************************************
LevelGeneratorUtils.getShortestHallIndexPair = function (area1, area2) {
	// Get nearest tileIndex in area1:
	let area1IndexList = gs.getIndexListInArea(area1).filter(index => gs.isHallIndex(index));
	
	if (area1IndexList.length === 0) {
		return null;
	}
	
	let area1TileIndex = util.nearestTo(area2.centerTileIndex, area1IndexList);

	// Get nearest tileIndex in area2:
	let area2IndexList = gs.getIndexListInArea(area2).filter(index => gs.isHallIndex(index));
	
	if (area2IndexList.length === 0) {
		return null;
	}
	
	let area2TileIndex = util.nearestTo(area1.centerTileIndex, area2IndexList);
	
	return [area1TileIndex, area2TileIndex];
};

// GET_HALL_INDEX:
// ************************************************************************************************
LevelGeneratorUtils.getHallIndex = function (box, startY, endX, endY) {
	// Handle argument conversion:
	if (typeof box === 'number') {
		box = {startX: box, startY: startY, endX: endX, endY: endY};
	}
	
	let indexList = gs.getIndexListInBox(box);
	indexList = indexList.filter(index => gs.isHallIndex(index));
	
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// PLACE_DOORS:
// *****************************************************************************
LevelGeneratorUtils.placeDoors = function () {	
	for (let x = 0; x < NUM_TILES_X; x += 1) {
		for (let y = 0; y < NUM_TILES_Y; y += 1) {
			if (this.canPlaceDoor(x, y)) {
				gs.setTileType({x: x, y: y}, gs.tileTypes.Floor);
				gs.createDoor({x: x, y: y}, 'Door');
			}
		}
	}
};

// CAN_PLACE_DOOR:
// *****************************************************************************
LevelGeneratorUtils.canPlaceDoor = function (x, y) {
	var isRoom, isWall;
	
	isWall = function (x, y) {
		return !gs.isInBounds(x, y) || gs.getTile(x, y).type.name === 'Wall';
	};
	
	isRoom = function (x, y) {
		return gs.isInBounds(x, y) 
			&& gs.isPassable(x, y) 
			&& gs.getTile(x, y).area 
			&& gs.getTile(x, y).area.type !== 'HallPoint';
	};
	
	return gs.getTile(x, y).type.name === 'Floor'
		&& !gs.getObj(x, y)
		&& !isRoom(x, y)
		&& ((isWall(x + 1, y) && isWall(x - 1, y) && gs.isPassable(x, y - 1) && gs.isPassable(x, y + 1) && (isRoom(x, y - 1) || isRoom(x, y + 1)))
		   || ((isWall(x, y + 1) && isWall(x, y - 1) && gs.isPassable(x - 1, y) && gs.isPassable(x + 1, y) && (isRoom(x + 1, y) || isRoom(x - 1, y)))));
};

// TRIM_WALLS:
// ************************************************************************************************
LevelGeneratorUtils.trimWalls = function () {
	// Trim Long Walls
	for (let i = 0; i < 10; i += 1) {
		let indexList = gs.getAllIndex();
		
		indexList = indexList.filter(function (index) {
			return util.inArray(gs.getTile(index).type.name,  ['Wall', 'CaveWall'])
				&& !gs.getTile(index).isClosed
				&& !gs.getTile(index).isSolidWall
				&& !gs.getTile(index).isTriggeredDropWall
				&& !gs.getTile(index).isStandardDropWall
				&& gs.getIndexListCardinalAdjacent(index).filter(idx => gs.isPassable(idx) && !gs.getObj(idx, obj => obj.isDoor())).length >= 3;
		});
		
		indexList.forEach(function (index) {
			if (gs.getTile(index).type.name === 'Wall') {
				gs.setTileType(index, gs.tileTypes.Floor);
			}
			else {
				gs.setTileType(index, gs.tileTypes.CaveFloor);
			}
			
			// For debugging:
			//gs.getTile(index).color = '#ff0000';
			
		}, this);
	}	
};

// DISTANCE_TO_TILE:
// Return the distance (in tiles) to the nearest tile that satisfies the predicate function.
// If no such tile exists then return null;
// ************************************************************************************************
LevelGeneratorUtils.distanceToTile = function (tileIndex, func) {
    var list;
    list = gs.getAllIndex();
    list = list.filter(func);
    list = list.sort((a, b) => util.distance(a, tileIndex) - util.distance(b, tileIndex));
    
    return list.length > 0 ? util.distance(tileIndex, list[0]) : null;
};

// GET_BIG_CAVE_MASK:
// A 4x4 mask in which 1 indicates WALL and 0 indicates standard cave generation
// ************************************************************************************************
LevelGeneratorUtils.getBigCaveMask = function () {
	let numNodesX = 4;
	let numNodesY = 4;
	let connectionMapList = [];
	
	for (let i = 0; i < 13; i += 1) {
		connectionMapList.push({x: i * 5, y: 13});
	}
	
	// Create connection map:
	let connectionMap = new ConnectionMap(numNodesX, numNodesY);
	connectionMap.loadRandomMap(connectionMapList);
	connectionMap.rotateMap(util.randElem([0, 90, 180, 270]));
	
	// Convert to mask:
	let bigMask = util.create2DArray(numNodesX, numNodesY, (x, y) => connectionMap.nodes[x][y].isEmpty);
	
	return bigMask;
};



// HALL_GENERATOR:
// ************************************************************************************************
LevelGeneratorUtils.HallGenerator = {};

// PLACE_HALL:
// ************************************************************************************************
// The generic function that can handle tileIndex, box or area:
LevelGeneratorUtils.HallGenerator.placeHall = function (startTileIndex, endTileIndex, width) {
	// Are we connecting dungeonRoom => dungeonRoom?
	let connectingDungeonRooms = gs.getArea(startTileIndex) && gs.getArea(endTileIndex) && gs.getTile(startTileIndex).type.name === 'Floor' && gs.getTile(endTileIndex).type.name === 'Floor';
	
	// Setting Width:
	width = this.getWidth(startTileIndex, endTileIndex, width);
	
	let path = this.getPath(startTileIndex, endTileIndex);
	
	// Failed to find path:
	if (!path) {
		if (gs.debugProperties.logLevelGenExceptions) {
			console.log('placeHall failed to find a valid path');
		}
		
		return;
	}
	
	// Make sure to include the startTileIndex:
	path.push(startTileIndex);
		
	// Walk Path:
	for (let i = 0; i < path.length; i += 1) {
		let tileIndex = path[i];
			
		this.setFloor(tileIndex, connectingDungeonRooms);
			
			
		// Setting wide floor:
		// Note we never set wide floors when we are inside of a room (prevents destroying internal structure)
		if (width > 1 && !gs.getArea(tileIndex)) {
			// Get wide floor indexList:
			let indexList = gs.getIndexListInBox(Math.ceil(tileIndex.x - width / 2),
											 Math.ceil(tileIndex.y - width / 2),
											 Math.ceil(tileIndex.x + width / 2),
											 Math.ceil(tileIndex.y + width / 2));
				
			indexList.forEach(function (index) {
				if (index.x > 1 && index.y > 1 && index.x < NUM_TILES_X - 1 && index.y < NUM_TILES_Y - 1 && !gs.getTile(index).isSolidWall) {
					this.setFloor(index, connectingDungeonRooms);
				}
			}, this);
		}
	}
};

LevelGeneratorUtils.HallGenerator.getPath = function (startTileIndex, endTileIndex) {
	// CalculateH:
	let calculateH = function (tileIndex) {
		return Math.abs(tileIndex.x - endTileIndex.x) + Math.abs(tileIndex.y - endTileIndex.y);
	};
	
	// Path-finding Flags:
	let flags = {
		isValidTileIndex: this.isValidTileIndex, 
		noDiagonal: true, 
		calculateH: calculateH,
	};
	
	// Find Path:
	return gs.findPath(startTileIndex, endTileIndex, flags);
};

// DEBUG_COLOR_END_POINTS:
// ************************************************************************************************
LevelGeneratorUtils.HallGenerator.debugColorEndPoints = function (startTileIndex, endTileIndex) {
	let color = util.randomColor();
	gs.getTile(startTileIndex).color = color;
	gs.getTile(endTileIndex).color = color;
};

// GET_WIDTH:
// ************************************************************************************************
LevelGeneratorUtils.HallGenerator.getWidth = function (startTileIndex, endTileIndex, width = null) {
	// Width:
	width = width || util.randElem([1, 1, 1, 1, 2, 2, 3]);
	
	// Super long halls area always short:
	if (util.distance(startTileIndex, endTileIndex) > 20 ) {
		width = 1;
	}
	
	return width;
};

// IS_VALID_TILE_INDEX:
// ************************************************************************************************
// Returns true if the hall pathFinder can pass the tileIndex
LevelGeneratorUtils.HallGenerator.isValidTileIndex = function (tileIndex) {
	return !gs.getTile(tileIndex).isSolidWall
		&& (!gs.getObj(tileIndex) || gs.getObj(tileIndex, obj => obj.isSimpleDoor() || obj.type.isPassable === 2))
		&& tileIndex.x >= 1
		&& tileIndex.y >= 1
		&& tileIndex.x < NUM_TILES_X - 1
		&& tileIndex.y < NUM_TILES_Y - 1;
};

// SET_FLOOR:
// ************************************************************************************************
LevelGeneratorUtils.HallGenerator.setFloor = function (tileIndex, connectingDungeonRooms) {
	gs.getTile(tileIndex).debugConnectingDungeonRooms = connectingDungeonRooms;

	// Special method when connecting dungeons to create nice halls:
	if (connectingDungeonRooms && util.inArray(gs.getTile(tileIndex).type.name, ['CaveFloor', 'CaveWall', 'Floor', 'Wall']) && !gs.getArea(tileIndex)) {
		gs.setTileType(tileIndex, gs.tileTypes.Floor);
		gs.getTile(tileIndex).debugSetBy = 'Connecting-Dungeon-Rooms';

		// Set adjacent tiles to Wall
		gs.getIndexListAdjacent(tileIndex).forEach(function (adjacentTileIndex) {
			let adjacentTile = gs.getTile(adjacentTileIndex);
			if (adjacentTile.type === gs.tileTypes.CaveWall && !gs.isExternalWall(adjacentTileIndex) && !adjacentTile.isSolidWall) {
				gs.setTileType(adjacentTileIndex, gs.tileTypes.Wall);

				gs.getTile(adjacentTileIndex).debugSetBy = 'Connecting-Dungeon-Rooms';
			}

		}, this);

	}
	// Standard method just breaks dungeon to dungeon floor:
	else if (gs.getTile(tileIndex).type.name === 'Wall') {
		gs.setTileType(tileIndex, gs.tileTypes.Floor);
		
		if (tileIndex.x === 0 || tileIndex.y === 0) {
			throw 'foo';
		}

		gs.getTile(tileIndex).debugSetBy = 'Standard-Dungeon-Wall';
	}
	// Standard method breaks cave to cave floor
	else if (gs.getTile(tileIndex).type.name === 'CaveWall') {
		gs.setTileType(tileIndex, gs.tileTypes.CaveFloor);

		gs.getTile(tileIndex).debugSetBy = 'Standard-CaveWall';
	}
};


