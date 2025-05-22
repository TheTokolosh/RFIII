/*global game, gs, console, util, Phaser*/
/*global TILE_SIZE, NUM_TILES_X, NUM_TILES_Y*/
/*jshint white: true, laxbreak: true, esversion: 6, loopfunc: true*/
'use strict';

var baseGenerator = new BaseGenerator();

// CONSTRUCTOR:
// ************************************************************************************************
function BaseGenerator() {
	this.numTilesX = NUM_TILES_X;
	this.numTilesY = NUM_TILES_Y;
}













// PLACE_DOOR_ON_BOX:
// Given a box representing a wall square
// Place a door on one of its edges such that the interior of the box and the exterior are connected
// ************************************************************************************************
BaseGenerator.prototype.placeDoorOnBox = function (box) {
	var x, y, canPlaceDoor;
	
	canPlaceDoor = function (x, y) {
		return (gs.isPassable(x, y - 1) && gs.isPassable(x, y + 1))
			|| (gs.isPassable(x - 1, y) && gs.isPassable(x + 1, y));
	};
	
	for (x = box.startX; x < box.endX; x += 1) {
		for (y = box.startY; y < box.endY; y += 1) {
			if (x === box.startX || y === box.startY || x === box.endX - 1 || y === box.endY - 1) {
				if (canPlaceDoor(x, y)) {
					this.placeDoor({x: x, y: y});
					return;
				}
			}
		}
	}
};




// FILL_BORDER_WALL:
// ************************************************************************************************
BaseGenerator.prototype.fillBorderWall = function () {
	var x, y;
	for (x = 0; x < this.numTilesX; x += 1) {
		for (y = 0; y < this.numTilesY; y += 1) {
			if (x === 0 || y === 0 || x === this.numTilesX - 1 || y === this.numTilesY - 1) {
				gs.setTileType({x: x, y: y}, gs.tileTypes.Wall);
			}
		}
	}
};

// PLACE_SIDE_ROOM_DOOR:
// Given a box representing a wall square
// Place a door on one of its edges such that the interior of the box and the exterior are connected
// ************************************************************************************************
BaseGenerator.prototype.placeSideRoomDoor = function (area) {
	var x, y, canPlaceDoor, isSideRoom, box, indexList = [], tileIndex;
	
	box = {startX: area.startX - 1, startY: area.startY - 1, endX: area.endX + 1, endY: area.endY + 1};
	
	isSideRoom = function (x, y) {
		return gs.getTile(x, y).area === area;
	};
	
	canPlaceDoor = function (x, y) {
		if (gs.isPassable(x, y - 1) && gs.isPassable(x, y + 1)) {
			if (!isSideRoom(x, y - 1) && isSideRoom(x, y + 1)) {
				return true;
			}
			
			if (!isSideRoom(x, y + 1) && isSideRoom(x, y - 1)) {
				return true;
			}
		}
		
		if (gs.isPassable(x - 1, y) && gs.isPassable(x + 1, y)) {
			if (!isSideRoom(x - 1, y) && isSideRoom(x + 1, y)) {
				return true;
			}
			
			if (!isSideRoom(x + 1, y) && isSideRoom(x - 1, y)) {
				return true;
			}
		}
		return false;
	};
	
	for (x = box.startX; x < box.endX; x += 1) {
		for (y = box.startY; y < box.endY; y += 1) {
			if (x === box.startX || y === box.startY || x === box.endX - 1 || y === box.endY - 1) {
				if (canPlaceDoor(x, y)) {
					indexList.push({x: x, y: y});
				}
			}
		}
	}
	
	// Choose a random door:
	if (indexList.length > 0) {
		tileIndex = util.randElem(indexList);
		area.doorTileIndex = tileIndex;
		this.placeDoor(tileIndex);
		return true;
	}
	// No possible door:
	else {
		return false;
	}
};

// CREATE_HALL:
// *************************************************************************
BaseGenerator.prototype.createHall = function (startTileIndex, endTileIndex, width, tileType) {
    var rand, func;
	
	width = width || util.randElem(util.range(1, this.MAX_HALL_WIDTH));
	tileType = tileType || gs.tileTypes.Floor;
	
	if (!startTileIndex || !endTileIndex) {
		console.log('Failed to create hall');
		return;
	}
	
	func = function (tileIndex) {
		return gs.isInBounds(tileIndex) && !gs.isPit(tileIndex);
	};
	
	this.placeTileLine(startTileIndex, {x: endTileIndex.x, y: startTileIndex.y}, width, tileType, func);
	this.placeTileLine({x: endTileIndex.x, y: startTileIndex.y}, endTileIndex, width, tileType, func);
};

// CLEAR_TO_WALL:
// Return true if there is at least 'distance' tiles of open space between center and the nearest solid
// ************************************************************************************************
BaseGenerator.prototype.clearToWall = function (centerX, centerY, distance) {
	var x, y;
	for (x = centerX - distance; x < centerX + distance; x += 1) {
		for (y = centerY - distance; y < centerY + distance; y += 1) {
			if (game.math.distance(x, y, centerX, centerY) <= distance && gs.isInBounds(x, y) && !gs.isPassable(x, y)) {
				return false;
			}
		}
	}
	
	return true;
};

// CREATE_MASKS
// Call in order to create a huge list of masks for FA to use when generating caves and jungle
// ************************************************************************************************
BaseGenerator.prototype.createMasks = function () {
    this.masks = [];
    
    this.masks = this.masks.concat(this.getMaskRotations([[1, 1, 0, 1],
                                                          [1, 1, 0, 0],
                                                          [0, 0, 0, 0],
                                                          [1, 0, 0, 1]]));
    
    this.masks = this.masks.concat(this.getMaskRotations([[1, 0, 0, 1],
                                                          [0, 1, 0, 0],
                                                          [0, 0, 0, 1],
                                                          [1, 0, 1, 1]]));
    
    this.masks = this.masks.concat(this.getMaskRotations([[1, 0, 0, 1],
                                                          [0, 0, 0, 0],
                                                          [0, 0, 0, 0],
                                                          [1, 0, 0, 1]]));
    
    this.masks = this.masks.concat(this.getMaskRotations([[1, 1, 0, 1],
                                                          [0, 0, 0, 1],
                                                          [1, 0, 0, 0],
                                                          [1, 0, 1, 1]]));
    
    this.masks = this.masks.concat(this.getMaskRotations([[1, 0, 0, 1],
                                                          [0, 1, 0, 0],
                                                          [0, 0, 0, 0],
                                                          [1, 0, 0, 1]]));
    
    this.masks = this.masks.concat(this.getMaskRotations([[0, 0, 0, 1],
                                                          [0, 1, 0, 0],
                                                          [0, 0, 1, 0],
                                                          [1, 0, 0, 0]]));
    
    this.masks = this.masks.concat(this.getMaskRotations([[0, 0, 0, 0],
                                                          [0, 1, 0, 0],
                                                          [0, 1, 1, 0],
                                                          [0, 0, 0, 0]]));
};

// GET_MASK_ROTATIONS:
// ************************************************************************************************
BaseGenerator.prototype.getMaskRotations = function (mask) {
    var rotations = [mask], x, y, newMask;
	
	let size = mask.length;
    
    // Y-Axis Flip:
    newMask = util.create2DArray(size, size, (x,y) => 0);
    for (x = 0; x < size; x += 1) {
        for (y = 0; y < size; y += 1) {
            newMask[x][y] = mask[size - 1 - x][y];
        }
    }
    rotations.push(newMask);
    
    // X-Axis Flip:
    newMask = util.create2DArray(size, size, (x,y) => 0);
    for (x = 0; x < size; x += 1) {
        for (y = 0; y < size; y += 1) {
            newMask[x][y] = mask[x][size - 1 - y];
        }
    }
    rotations.push(newMask);
    
    // XY-Axis Flip:
    newMask = util.create2DArray(size, size, (x,y) => 0);
    for (x = 0; x < size; x += 1) {
        for (y = 0; y < size; y += 1) {
            newMask[x][y] = mask[size - 1 - x][size - 1 - y];
        }
    }
    rotations.push(newMask);
    
    return rotations;
};




// CLEAN_TILE_AREAS:
// *****************************************************************************
BaseGenerator.prototype.cleanAreaTiles = function () {
	// Clean Area Tiles:
	gs.getAllIndex().forEach(function (tileIndex) {
		if (gs.getTile(tileIndex).type.name === 'Floor' && gs.getTile(tileIndex).area && gs.getTile(tileIndex).area.type === 'Cave') {
			gs.setTileType(tileIndex, gs.tileTypes.CaveFloor);
		}
		
		if (gs.getTile(tileIndex).type.name === 'Wall' && gs.getTile(tileIndex).area && gs.getTile(tileIndex).area.type === 'Cave') {
			gs.setTileType(tileIndex, gs.tileTypes.CaveWall);
		}
	});
};








// FIND_ISLANDS:
// ************************************************************************************************
BaseGenerator.prototype.findIslands = function (area) {
	var mask, x, y, i = 0, islandList = [], func;
	
	mask = [];
	for (x = 0; x < area.width; x += 1) {
		mask[x] = [];
		for (y = 0; y < area.height; y += 1) {
			mask[x][y] = 0;
		}
	}
	
	func = function (idx) {
		return (gs.getTile(idx).type.name === 'Wall' || gs.getTile(idx).type.name === 'CaveWall')
			&& util.isInBox(idx, area)
			&& !gs.getTile(idx).isSolidWall;
	};
	
	
	gs.getIndexListInBox(area).forEach(function (tileIndex) {
		var indexList;
		
		if (func(tileIndex) && !mask[tileIndex.x - area.startX][tileIndex.y - area.startY]) {
			islandList[i] = [];
			
			indexList = gs.getIndexListInFlood(tileIndex, func);
			indexList.forEach(function (index) {
				mask[index.x - area.startX][index.y - area.startY] = 1;
				islandList[i].push(index);
			}, this);
			
			i += 1;
		}
	}, this);
	
	return islandList;
};

// REPLACE_ISLANDS:
// *****************************************************************************
BaseGenerator.prototype.replaceIslands = function (area) {
	var islandList, getType;
	
	getType = function (indexList) {
		if (indexList.reduce((pv, nv) => pv + (gs.getTile(nv).type.name === 'Wall' ? 1 : 0), 0) > indexList.length / 2) {
			return 'Wall';
		}
		else {
			return 'CaveWall';
		}
	};
	
	islandList = this.findIslands(area);
	
	// Remove any islands touching the map boarders:
	islandList = islandList.filter(function (list) {
		return !list.find(index => index.x === 0 || index.y === 0 || index.x === NUM_TILES_X - 1 || index.y === NUM_TILES_Y - 1)
			&& !list.find(index => gs.getTile(index).isClosed);
	});
	
	islandList.forEach(function (indexList) {
		var box, type;
		
		box = util.getBoundingBox(indexList);
		type = getType(indexList);
		
		if (indexList.length > 16 
			&& indexList.length < 100
			&& box.width > 3 && box.height > 3 // Min bounds
			&& (Math.min(box.width, box.height) / Math.max(box.width, box.height)) > 0.5 // Must be mostly square
			&& indexList.length > box.width * box.height * 0.5 // Must be mostly full
		   	&& util.frac() < 0.25) {
			
			indexList.forEach(function (index) {
				if (type === 'CaveWall') {
					gs.setTileType(index, gs.tileTypes.CavePit);
				}
				else {
					gs.setTileType(index, gs.tileTypes.Pit);
				}
			}, this);
		}
	}, this);
	
	
};