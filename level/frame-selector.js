/*global gs, game, util, console*/
/*global NUM_TILES_X, NUM_TILES_Y*/
/*jshint laxbreak: true, loopfunc: true, esversion: 6*/
'use strict';
var FrameSelector = {};

FrameSelector.init = function () {
	this.createWallMasks();
	this.createPitMasks();
	this.createPlatformWallMasks();
};

// SET_ALTERNATE_TILE_FRAMES:
// ************************************************************************************************
FrameSelector.setLevelTileFrames = function (startX, startY, endX, endY) {
	var x, y;
	
	startX = startX || 0;
	startY = startY || 0;
	endX = endX || gs.numTilesX;
	endY = endY || gs.numTilesY;
	
	
	this.convertGlobalBaseFrames();
	this.setFloorTileFrames();
	this.setWallTileFrames();
	this.setPlatformWallTileFrames();
	this.setPitTileFrames();
	this.setWaterTileFrames();
	this.setAlternateTileFrames();
};

// SET_ALTERNATE_TILE_FRAMES:
// ************************************************************************************************
FrameSelector.setAlternateTileFrames = function () {
	let indexList = gs.getAllIndex();
	indexList = indexList.filter(index => gs.isTileSetBaseFrame(gs.getTile(index).frame));
	indexList.forEach(function (index) {
		let tileSet = gs.getTileSet(gs.getTile(index));
		
		if (!tileSet) {
			throw 'ERROR [FrameSelector.setAlternateFrames] - tileSet does not exist for supposidly baseFrame: ' + gs.getTile(index).frame;
		}
		
		if (tileSet.alternate && tileSet.alternate.length > 0 && util.frac() <= 0.40) {
			gs.getTile(index).frame = util.randElem(tileSet.alternate);
		}
	}, this);
	
};

// CONVERT_GLOBAL_BASE_FRAMES:
// Handle the GlobalBaseFrame by converting to the ZoneBaseFrame:
// ************************************************************************************************
FrameSelector.convertGlobalBaseFrames = function () {
	
	let indexList = gs.getAllIndex();
	indexList = indexList.filter(index => gs.isGlobalBaseFrame(gs.getTile(index).frame));
	indexList.forEach(function (index) {
		gs.getTile(index).frame = gs.getZoneTileSetBaseFrame(gs.getTile(index).type);
	}, this);
};


// SET_WALL_TILE_FRAMES:
// ************************************************************************************************
FrameSelector.setWallTileFrames = function () {
	// Select Wall Frames:
	let indexList = gs.getAllIndex();
	indexList = indexList.filter(index => util.inArray(gs.getTile(index).type.name, ['Wall', 'CaveWall']));
	indexList = indexList.filter(index => gs.isTileSetBaseFrame(gs.getTile(index).frame));
	indexList.forEach(function (index) {
		gs.getTile(index).frame = gs.getTile(index).frame + this.getWallOffset(index.x, index.y);
	}, this);
};

// SET_PLATFORM_WALL_TILE_FRAMES:
// ************************************************************************************************
FrameSelector.setPlatformWallTileFrames = function () {
	// We need to handle this process one area at a time so that nested platforms will be handled cleanly
	
	gs.areaList.forEach(function (area) {
		// Skip if a single platform wall has been hand placed
		for (let x = area.startX; x < area.endX; x += 1) {
			for (let y = area.endY - 1; y >= area.startY; y -= 1) {
				if (gs.getArea(x, y) === area && gs.getTile(x, y).type.name === 'PlatformWall' && !gs.isTileSetBaseFrame(gs.getTile(x, y).frame)) {
					return;
				}
			}
		}
		
		// Notice how we have to go bottom to top:
		for (let x = area.startX; x < area.endX; x += 1) {
			for (let y = area.endY - 1; y >= area.startY; y -= 1) {
				// Passing a platform wall:
				if (gs.getArea(x, y) === area
					&& gs.getTile(x, y).type.name === 'PlatformWall'
					&& gs.getTile(x, y + 1).type.passable === 2
					&& gs.getTile(x, y - 1).type.passable === 2
					&& !gs.getTile(x, y - 1).isPlatform
					&& !gs.getTile(x, y + 1).isPlatform) {

					let floodIndexList = gs.getIndexListInFlood({x: x, y: y - 1}, function (tileIndex) {
						return gs.getTile(tileIndex).type.passable === 2
							&& gs.getTile(tileIndex).type.name !== 'Steps'
							&& gs.getArea(tileIndex) === area;
					});

					floodIndexList.forEach(function (floodTileIndex) {
						gs.getTile(floodTileIndex).isPlatform = true;
					}, this);
				}
			}
		}
		
		// Select Wall Frames for area:
		let indexList = gs.getIndexListInArea(area);
		indexList = indexList.filter(index => gs.getTile(index).type.name === 'PlatformWall');
		indexList = indexList.filter(index => gs.isTileSetBaseFrame(gs.getTile(index).frame));
		indexList = indexList.filter(index => gs.getArea(index) === area);
		indexList.forEach(function (index) {
			gs.getTile(index).frame = gs.getTile(index).frame + this.getPlatformWallOffset(index.x, index.y);
		}, this);
	}, this);
};



// GET_PLATFORM_WALL_OFFSET:
// ************************************************************************************************
FrameSelector.getPlatformWallOffset = function (x, y) {
	let pred = function (maskX, maskY) {
		return gs.getTile(maskX, maskY).type.name !== 'PlatformWall';
	};
	
	
	let offset = 0;
		
	for (let i = 0; i < this.platformWallMasks.length; i += 1) {
		if (this.matchPlatformWallMask(x, y, this.platformWallMasks[i].mask, pred)) {
			offset = this.platformWallMasks[i].offset;
		}
	}
		
	return offset;
};

// MATCH_PLATFORM_WALL_MASK:
// ************************************************************************************************
FrameSelector.matchPlatformWallMask = function (x, y, mask) {
	let W = 1,
		P = 2;
	
	for (let itX = 0; itX < 3; itX += 1) {
		for (let itY = 0; itY < 3; itY += 1) {
			let tileIndex = {x: x + itX - 1, y: y + itY - 1};
			
			if (gs.isInBounds(tileIndex)) {
				if (mask[itY][itX] === W && gs.getTile(tileIndex).type.name !== 'PlatformWall') {
					return false;
				}
				
				if (mask[itY][itX] === P && !gs.getTile(tileIndex).isPlatform) {
					return false;
				}
				
				if (mask[itY][itX] === 0 && gs.getTile(tileIndex).type.passable !== 2) {
					return false;
				}
			}
		}
	}
	
	return true;
};

// GET_WALL_OFFSET
// ************************************************************************************************
FrameSelector.getWallOffset = function (x, y, hideDropWallRooms = true) {
	let isDropWall = gs.getIndexListAdjacent(x, y).filter(tileIndex => gs.getTile(tileIndex).isDropWallRoom).length > 0;
	let isDropWallRoomWall = gs.getIndexListAdjacent(x, y).filter(tileIndex => gs.getTile(tileIndex).type.passable && !gs.getTile(tileIndex).isDropWallRoom).length > 0;
	
	
	let pred = function (maskX, maskY) {
		// Drop wall rooms count as solid:
		if (isDropWall && isDropWallRoomWall && hideDropWallRooms && gs.getTile(maskX, maskY).isDropWallRoom) {
			return false;	
		}
	
		return gs.getTile(maskX, maskY).type.passable;
	};
	
	if (this.matchMask(x, y, [[1,1,1],[1,1,1],[1,1,1]], pred)) {
		return 0;
	}
	else {
		let offset = 0;
		
		for (let i = 0; i < this.wallMasks.length; i += 1) {
			if (this.matchMask(x, y, this.wallMasks[i].mask, pred)) {
				offset = this.wallMasks[i].offset;
			}
		}
		
		return offset;
	}
};

// CLEAN_WALL_TILE_FRAMES:
// ************************************************************************************************
FrameSelector.cleanWallTileFrames = function (box) {
	// Select Wall Frames:
	let indexList = gs.getIndexListInBox(box);
	indexList = indexList.filter(index => util.inArray(gs.getTile(index).type.name, ['Wall', 'CaveWall']));
	indexList.forEach(function (index) {
		let baseFrame = gs.getZoneTileSetBaseFrame(gs.getTile(index).type);
		gs.getTile(index).frame = baseFrame + this.getWallOffset(index.x, index.y, false);
	}, this);
	
	// Select floor frames:
	this.setFloorTileFrames(box);
	
};

// SET_FLOOR_TILE_FRAMES:
// ************************************************************************************************
FrameSelector.setFloorTileFrames = function (box) {
	box = box || util.createBox(0, 0, NUM_TILES_X, NUM_TILES_Y);
	
	let indexList = gs.getIndexListInBox(box);
	indexList = indexList.filter(index => gs.getTile(index).type.name === 'Floor');
	indexList = indexList.filter(index => gs.isTileSetBaseFrame(gs.getTile(index).frame));
	
	indexList.forEach(function (index) {
		gs.getTile(index).frame = gs.getTile(index).frame + this.getFloorBorderOffset(index.x, index.y);
	}, this);
};

// GET_FLOOR_BORDER_OFFSET:
// ************************************************************************************************
FrameSelector.getFloorBorderOffset = function (x, y) {
	let isSolid = function (x, y) {
		return !gs.getTile(x, y) || !gs.getTile(x, y).type.passable; 
	};
	
	let isHall = function (x, y) {
		return (isSolid(x + 1, y) && isSolid(x - 1, y))  // A Vertical Hall
			|| (isSolid(x, y + 1) && isSolid(x, y - 1)); // A Horizontal Hall
	};
	
	let isEdge = function (x, y) {
		return isSolid(x, y) || isHall(x, y);
	};
	
	if (isHall(x, y)) {
		return 1;
	}
	else if (isHall(x + 1, y) && isHall(x - 1, y)) {
		return 1;
	}
	else if (isHall(x, y + 1) && isHall(x, y - 1)) {
		return 1;
	}
	else if (isEdge(x, y - 1) && isEdge(x - 1, y) && isEdge(x + 1, y + 1)) {
		return 1;
	}
	else if (isEdge(x, y - 1) && isEdge(x + 1, y) && isEdge(x - 1, y + 1)) {
		return 1;
	}
	else if (isEdge(x, y + 1) && isEdge(x + 1, y) && isEdge(x - 1, y - 1)) {
		return 1;
	}
	else if (isEdge(x, y + 1) && isEdge(x - 1, y) && isEdge(x + 1, y - 1)) {
		return 1;
	}
	else if (isEdge(x - 1, y) && isEdge(x, y - 1) && !isEdge(x + 1, y + 1) && !isEdge(x + 1, y) && !isEdge(x, y + 1)) {
		return 8;
	}
	else if (isEdge(x + 1, y) && isEdge(x, y - 1) && !isEdge(x - 1, y + 1) && !isEdge(x - 1, y) && !isEdge(x, y + 1)) {
		return 9;
	}
	else if (isEdge(x - 1, y) && isEdge(x, y + 1) && !isEdge(x + 1, y - 1) && !isEdge(x + 1, y) && !isEdge(x, y - 1)) {
		return 6;
	}
	else if (isEdge(x + 1, y) && isEdge(x, y + 1) && !isEdge(x - 1, y - 1) && !isEdge(x - 1, y) && !isEdge(x, y - 1)) {
		return 7;
	}
	else if (isEdge(x - 1, y) && !isEdge(x + 1, y) && !isEdge(x, y + 1) && !isEdge(x, y - 1)) {
		return 5;
	}
	else if (isEdge(x + 1, y) && !isEdge(x - 1, y) && !isEdge(x, y + 1) && !isEdge(x, y - 1)) {
		return 4;
	}
	else if (isEdge(x, y - 1) && !isEdge(x, y + 1) && !isEdge(x + 1, y) && !isEdge(x - 1, y)) {
		return 3;
	}
	else if (isEdge(x, y + 1) && !isEdge(x, y - 1) && !isEdge(x + 1, y) && !isEdge(x - 1, y)) {
		return 2;
	}
	else if (isEdge(x - 1, y - 1)) {
		return 11;
	}
	else if (isEdge(x - 1, y + 1)) {
		return 12;
	}
	else if (isEdge(x + 1, y - 1)) {
		return 10;
	}
	else if (isEdge(x + 1, y + 1)) {
		return 13;
	}
	else {
		return 0;
	}
};

// SET_PIT_TILE_FRAMES:
// ************************************************************************************************
FrameSelector.setPitTileFrames = function () {
	let indexList;
	
	// Select Wall Frames:
	indexList = gs.getAllIndex();
	indexList = indexList.filter(index => util.inArray(gs.getTile(index).type.name, ['CavePit', 'DungeonPit']));
	indexList = indexList.filter(index => gs.isTileSetBaseFrame(gs.getTile(index).frame));
	indexList.forEach(function (index) {
		gs.getTile(index).frame = gs.getTile(index).frame + this.getPitFrameOffset(index.x, index.y);
	}, this);
};

// GET_PIT_FRAME_OFFSET:
// ************************************************************************************************
FrameSelector.getPitFrameOffset = function (x, y) {
	let offset = 0;
	
	let pred = function (x, y) {
		return !gs.isPit(x, y)
			&& gs.getTile(x, y).type.name !== 'Bridge' 
			&& gs.getTile(x, y).type.name !== 'BridgeWall';
	};
	
	if (!this.matchMask(x, y, [[1,1,1],[1,1,1],[1,1,1]], pred)) {
		for (let i = 0; i < this.pitMasks.length; i += 1) {
			if (this.matchMask(x, y, this.pitMasks[i].mask, pred)) {
				offset = this.pitMasks[i].offset;
			}
		}
	}
	
	return offset;
};


// SET_WATER_TILE_FRAMES:
// ************************************************************************************************
FrameSelector.setWaterTileFrames = function () {
	let indexList;
	
	// Select Liquid Frames:
	indexList = gs.getAllIndex();
	indexList = indexList.filter(index => util.inArray(gs.getTile(index).type.name, ['Water', 'Lava', 'ToxicWaste', 'Blood']));
	indexList = indexList.filter(index => gs.isTileSetBaseFrame(gs.getTile(index).frame));
	indexList.forEach(function (index) {
		gs.getTile(index).frame = gs.getTile(index).frame + this.getWaterFrameOffset(index.x, index.y);
	}, this);
};

// GET_WATER_FRAME_OFFSET:
// Deprecated July-23-2021
// ************************************************************************************************
FrameSelector._getWaterFrameOffset = function (x, y) {
	
	let CAVE_FRAME_OFFSET = 64,
		isToxicWaste = gs.getTile(x, y).type.name === 'ToxicWaste';
	
	let isLiquid = function (x, y) {
		return util.inArray(gs.getTile(x, y).type.name, ['Water', 'Lava', 'ToxicWaste', 'Blood']);
	};
	
	let isCave = function (x, y) {
		return util.inArray(gs.getTile(x, y).type.name, ['CaveFloor', 'CaveWall', 'CavePit']);
	};
	
	let isDungeon = function (x, y) {
		// Toxic Waste is a special case that treats all tiles as dungeon:
		if (isToxicWaste && isCave(x, y)) {
			return true;
		}
		
		return util.inArray(gs.getTile(x, y).type.name, ['Floor', 'Wall', 'DungeonPit', 'HalfWall']);
	};
	
	// Dungeon:
	if (isDungeon(x, y - 1) && isDungeon(x - 1, y) && isDungeon(x + 1, y + 1) && isLiquid(x + 1, y)) {
		return 20;
	}
	else if (isDungeon(x, y - 1) && isDungeon(x + 1, y) && isDungeon(x - 1, y + 1) && isLiquid(x - 1, y)) {
		return 21;
	}
	else if (isDungeon(x, y + 1) && isDungeon(x - 1, y) && isDungeon(x + 1, y - 1) && isLiquid(x + 1, y)) {
		return 22;
	}
	else if (isDungeon(x, y + 1) && isDungeon(x + 1, y) && isDungeon(x - 1, y - 1) && isLiquid(x - 1, y)) {
		return 23;
	}
	else if (isDungeon(x, y - 1) && isDungeon(x + 1, y + 1) && isDungeon(x - 1, y + 1) && isLiquid(x, y + 1) && isLiquid(x + 1, y) && isLiquid(x - 1, y)) {
		return 28;
	}
	else if (isDungeon(x, y + 1) && isDungeon(x + 1, y - 1) && isDungeon(x - 1, y - 1) && isLiquid(x, y - 1) && isLiquid(x + 1, y) && isLiquid(x - 1, y)) {
		return 29;
	}
	else if (isDungeon(x - 1, y) && isDungeon(x + 1, y - 1) && isDungeon(x + 1, y + 1) && isLiquid(x + 1, y) && isLiquid(x, y - 1) && isLiquid(x, y + 1)) {
		return 30;
	}
	else if (isDungeon(x + 1, y) && isDungeon(x - 1, y - 1) && isDungeon(x - 1, y + 1) && isLiquid(x - 1, y) && isLiquid(x, y - 1) && isLiquid(x, y + 1)) {
		return 31;
	}
	else if (isDungeon(x, y - 1) && isDungeon(x - 1, y + 1) && isLiquid(x - 1, y) && isLiquid(x + 1, y) && isLiquid(x, y + 1)) {
		return 32;
	}
	else if (isDungeon(x, y - 1) && isDungeon(x + 1, y + 1) && isLiquid(x - 1, y) && isLiquid(x + 1, y) && isLiquid(x, y + 1)) {
		return 33;
	}
	else if (isDungeon(x, y + 1) && isDungeon(x - 1, y - 1) && isLiquid(x - 1, y) && isLiquid(x + 1, y) && isLiquid(x, y - 1)) {
		return 34;
	}
	else if (isDungeon(x, y + 1) && isDungeon(x + 1, y - 1) && isLiquid(x - 1, y) && isLiquid(x + 1, y) && isLiquid(x, y - 1)) {
		return 35;
	}
	else if (isDungeon(x - 1, y) && isDungeon(x + 1, y - 1) && isLiquid(x, y - 1) && isLiquid(x, y + 1) && isLiquid(x + 1, y)) {
		return 36;
	}
	else if (isDungeon(x - 1, y) && isDungeon(x + 1, y + 1) && isLiquid(x, y - 1) && isLiquid(x, y + 1) && isLiquid(x + 1, y)) {
		return 37;
	}
	else if (isDungeon(x + 1, y) && isDungeon(x - 1, y - 1) && isLiquid(x, y - 1) && isLiquid(x, y + 1) && isLiquid(x - 1, y)) {
		return 38;
	}
	else if (isDungeon(x + 1, y) && isDungeon(x - 1, y + 1) && isLiquid(x, y - 1) && isLiquid(x, y + 1) && isLiquid(x - 1, y)) {
		return 39;
	}
	else if (isDungeon(x - 1, y) && isDungeon(x + 1, y) && isDungeon(x, y - 1)) {
		return 13;
	}
	else if (isDungeon(x - 1, y) && isDungeon(x + 1, y) && isDungeon(x, y + 1)) {
		return 14;
	}
	else if (isDungeon(x, y - 1) && isDungeon(x, y + 1) && isDungeon(x - 1, y)) {
		return 11;
	}
	else if (isDungeon(x, y - 1) && isDungeon(x, y + 1) && isDungeon(x + 1, y)) {
		return 12;
	}
	else if (isDungeon(x - 1, y) && isDungeon(x + 1, y)) {
		return 10;
	}
	else if (isDungeon(x, y - 1) && isDungeon(x, y + 1)) {
		return 9;
	}
	else if (isDungeon(x - 1, y) && isDungeon(x, y - 1)) {
		return 5;
	}
	else if (isDungeon(x + 1, y) && isDungeon(x, y - 1)) {
		return 6;
	}
	else if (isDungeon(x - 1, y) && isDungeon(x, y + 1)) {
		return 7;
	}
	else if (isDungeon(x + 1, y) && isDungeon(x, y + 1)) {
		return 8;
	}
	else if (isDungeon(x - 1, y)) {
		return 3;
	}
	else if (isDungeon(x + 1, y)) {
		return 4;
	}
	else if (isDungeon(x, y - 1)) {
		return 1;
	}
	else if (isDungeon(x, y + 1)) {
		return 2;
	}
	else if (isDungeon(x - 1, y - 1) && isDungeon(x + 1, y - 1) && isDungeon(x - 1, y + 1) && isDungeon(x + 1, y + 1)) {
		return 15;
	}
	else if (isDungeon(x - 1, y - 1) && isDungeon(x + 1, y - 1)) {
		return 16;
	}
	else if (isDungeon(x - 1, y + 1) && isDungeon(x + 1, y + 1)) {
		return 17;
	}
	else if (isDungeon(x - 1, y - 1) && isDungeon(x - 1, y + 1)) {
		return 18;
	}
	else if (isDungeon(x + 1, y - 1) && isDungeon(x + 1, y + 1)) {
		return 19;
	}
	else if (isDungeon(x - 1, y - 1)) {
		return 24;
	}
	else if (isDungeon(x + 1, y - 1)) {
		return 25;
	}
	else if (isDungeon(x - 1, y + 1)) {
		return 26;
	}
	else if (isDungeon(x + 1, y + 1)) {
		return 27;
	}
	
	// Cave:
	if (isCave(x, y - 1) && isCave(x - 1, y) && isCave(x + 1, y + 1)) {
		return 20 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x, y - 1) && isCave(x + 1, y) && isCave(x - 1, y + 1)) {
		return 21 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x, y + 1) && isCave(x - 1, y) && isCave(x + 1, y - 1)) {
		return 22 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x, y + 1) && isCave(x + 1, y) && isCave(x - 1, y - 1)) {
		return 23 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x, y - 1) && isCave(x + 1, y + 1) && isCave(x - 1, y + 1) && isLiquid(x, y + 1) && isLiquid(x + 1, y) && isLiquid(x - 1, y)) {
		return 28 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x, y + 1) && isCave(x + 1, y - 1) && isCave(x - 1, y - 1) && isLiquid(x, y - 1) && isLiquid(x + 1, y) && isLiquid(x - 1, y)) {
		return 29 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x - 1, y) && isCave(x + 1, y - 1) && isCave(x + 1, y + 1) && isLiquid(x + 1, y) && isLiquid(x, y - 1) && isLiquid(x, y + 1)) {
		return 30 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x + 1, y) && isCave(x - 1, y - 1) && isCave(x - 1, y + 1) && isLiquid(x - 1, y) && isLiquid(x, y - 1) && isLiquid(x, y + 1)) {
		return 31 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x, y - 1) && isCave(x - 1, y + 1) && isLiquid(x - 1, y) && isLiquid(x + 1, y) && isLiquid(x, y + 1)) {
		return 32 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x, y - 1) && isCave(x + 1, y + 1) && isLiquid(x - 1, y) && isLiquid(x + 1, y) && isLiquid(x, y + 1)) {
		return 33 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x, y + 1) && isCave(x - 1, y - 1) && isLiquid(x - 1, y) && isLiquid(x + 1, y) && isLiquid(x, y - 1)) {
		return 34 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x, y + 1) && isCave(x + 1, y - 1) && isLiquid(x - 1, y) && isLiquid(x + 1, y) && isLiquid(x, y - 1)) {
		return 35 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x - 1, y) && isCave(x + 1, y - 1) && isLiquid(x, y - 1) && isLiquid(x, y + 1) && isLiquid(x + 1, y)) {
		return 36 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x - 1, y) && isCave(x + 1, y + 1) && isLiquid(x, y - 1) && isLiquid(x, y + 1) && isLiquid(x + 1, y)) {
		return 37 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x + 1, y) && isCave(x - 1, y - 1) && isLiquid(x, y - 1) && isLiquid(x, y + 1) && isLiquid(x - 1, y)) {
		return 38 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x + 1, y) && isCave(x - 1, y + 1) && isLiquid(x, y - 1) && isLiquid(x, y + 1) && isLiquid(x - 1, y)) {
		return 39 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x - 1, y) && isCave(x + 1, y) && isCave(x, y - 1)) {
		return 13 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x - 1, y) && isCave(x + 1, y) && isCave(x, y + 1)) {
		return 14 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x, y - 1) && isCave(x, y + 1) && isCave(x - 1, y)) {
		return 11 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x, y - 1) && isCave(x, y + 1) && isCave(x + 1, y)) {
		return 12 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x - 1, y) && isCave(x + 1, y)) {
		return 10 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x, y - 1) && isCave(x, y + 1)) {
		return 9 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x - 1, y) && isCave(x, y - 1)) {
		return 5 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x + 1, y) && isCave(x, y - 1)) {
		return 6 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x - 1, y) && isCave(x, y + 1)) {
		return 7 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x + 1, y) && isCave(x, y + 1)) {
		return 8 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x - 1, y)) {
		return 3 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x + 1, y)) {
		return 4 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x, y - 1)) {
		return 1 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x, y + 1)) {
		return 2 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x - 1, y - 1) && isCave(x + 1, y - 1) && isCave(x - 1, y + 1) && isCave(x + 1, y + 1)) {
		return 15 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x - 1, y - 1) && isCave(x + 1, y - 1)) {
		return 16 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x - 1, y + 1) && isCave(x + 1, y + 1)) {
		return 17 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x - 1, y - 1) && isCave(x - 1, y + 1)) {
		return 18 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x + 1, y - 1) && isCave(x + 1, y + 1)) {
		return 19 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x - 1, y - 1)) {
		return 24 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x + 1, y - 1)) {
		return 25 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x - 1, y + 1)) {
		return 26 + CAVE_FRAME_OFFSET;
	}
	else if (isCave(x + 1, y + 1)) {
		return 27 + CAVE_FRAME_OFFSET;
	}
	
	return 0;
};

// GET_WATER_FRAME_OFFSET:
// ************************************************************************************************
FrameSelector.getWaterFrameOffset = function (x, y) {
	let frame = 0;
	
	let isLiquid = function (x, y) {
		return util.inArray(gs.getTile(x, y).type.name, ['Water', 'Lava', 'ToxicWaste', 'Blood']);
	};
	
	let isGround = function (x, y) {
		return !isLiquid(x, y) && gs.getTile(x, y).type.name !== 'Bridge';
	};
	
	// Dungeon:
	if (isGround(x - 1, y) && isGround(x + 1, y) && isGround(x, y - 1)) {
		frame = 13;
	}
	else if (isGround(x - 1, y) && isGround(x + 1, y) && isGround(x, y + 1)) {
		frame = 14;
	}
	else if (isGround(x, y - 1) && isGround(x, y + 1) && isGround(x - 1, y)) {
		frame = 11;
	}
	else if (isGround(x, y - 1) && isGround(x, y + 1) && isGround(x + 1, y)) {
		frame = 12;
	}
	else if (isGround(x, y - 1) && isGround(x - 1, y) && isGround(x + 1, y + 1) && isLiquid(x + 1, y)) {
		frame = 20;
	}
	else if (isGround(x, y - 1) && isGround(x + 1, y) && isGround(x - 1, y + 1) && isLiquid(x - 1, y)) {
		frame = 21;
	}
	else if (isGround(x, y + 1) && isGround(x - 1, y) && isGround(x + 1, y - 1) && isLiquid(x + 1, y)) {
		frame = 22;
	}
	else if (isGround(x, y + 1) && isGround(x + 1, y) && isGround(x - 1, y - 1) && isLiquid(x - 1, y)) {
		frame = 23;
	}
	else if (isGround(x, y - 1) && isGround(x + 1, y + 1) && isGround(x - 1, y + 1) && isLiquid(x, y + 1) && isLiquid(x + 1, y) && isLiquid(x - 1, y)) {
		frame = 28;
	}
	else if (isGround(x, y + 1) && isGround(x + 1, y - 1) && isGround(x - 1, y - 1) && isLiquid(x, y - 1) && isLiquid(x + 1, y) && isLiquid(x - 1, y)) {
		frame = 29;
	}
	else if (isGround(x - 1, y) && isGround(x + 1, y - 1) && isGround(x + 1, y + 1) && isLiquid(x + 1, y) && isLiquid(x, y - 1) && isLiquid(x, y + 1)) {
		frame = 30;
	}
	else if (isGround(x + 1, y) && isGround(x - 1, y - 1) && isGround(x - 1, y + 1) && isLiquid(x - 1, y) && isLiquid(x, y - 1) && isLiquid(x, y + 1)) {
		frame = 31;
	}
	else if (isGround(x, y - 1) && isGround(x - 1, y + 1) && isLiquid(x - 1, y) && isLiquid(x + 1, y) && isLiquid(x, y + 1)) {
		frame = 32;
	}
	else if (isGround(x, y - 1) && isGround(x + 1, y + 1) && isLiquid(x - 1, y) && isLiquid(x + 1, y) && isLiquid(x, y + 1)) {
		frame = 33;
	}
	else if (isGround(x, y + 1) && isGround(x - 1, y - 1) && isLiquid(x - 1, y) && isLiquid(x + 1, y) && isLiquid(x, y - 1)) {
		frame = 34;
	}
	else if (isGround(x, y + 1) && isGround(x + 1, y - 1) && isLiquid(x - 1, y) && isLiquid(x + 1, y) && isLiquid(x, y - 1)) {
		frame = 35;
	}
	else if (isGround(x - 1, y) && isGround(x + 1, y - 1) && isLiquid(x, y - 1) && isLiquid(x, y + 1) && isLiquid(x + 1, y)) {
		frame = 36;
	}
	else if (isGround(x - 1, y) && isGround(x + 1, y + 1) && isLiquid(x, y - 1) && isLiquid(x, y + 1) && isLiquid(x + 1, y)) {
		frame = 37;
	}
	else if (isGround(x + 1, y) && isGround(x - 1, y - 1) && isLiquid(x, y - 1) && isLiquid(x, y + 1) && isLiquid(x - 1, y)) {
		frame = 38;
	}
	else if (isGround(x + 1, y) && isGround(x - 1, y + 1) && isLiquid(x, y - 1) && isLiquid(x, y + 1) && isLiquid(x - 1, y)) {
		frame = 39;
	}
	else if (isGround(x - 1, y) && isGround(x + 1, y)) {
		frame = 10;
	}
	else if (isGround(x, y - 1) && isGround(x, y + 1)) {
		frame = 9;
	}
	else if (isGround(x - 1, y) && isGround(x, y - 1)) {
		frame = 5;
	}
	else if (isGround(x + 1, y) && isGround(x, y - 1)) {
		frame = 6;
	}
	else if (isGround(x - 1, y) && isGround(x, y + 1)) {
		frame = 7;
	}
	else if (isGround(x + 1, y) && isGround(x, y + 1)) {
		frame = 8;
	}
	else if (isGround(x - 1, y)) {
		frame = 3;
	}
	else if (isGround(x + 1, y)) {
		frame = 4;
	}
	else if (isGround(x, y - 1)) {
		frame = 1;
	}
	else if (isGround(x, y + 1)) {
		frame = 2;
	}
	else if (isGround(x - 1, y - 1) && isGround(x + 1, y - 1) && isGround(x - 1, y + 1) && isGround(x + 1, y + 1)) {
		frame = 15;
	}
	else if (isGround(x - 1, y - 1) && isGround(x + 1, y - 1)) {
		frame = 16;
	}
	else if (isGround(x - 1, y + 1) && isGround(x + 1, y + 1)) {
		frame = 17;
	}
	else if (isGround(x - 1, y - 1) && isGround(x - 1, y + 1)) {
		frame = 18;
	}
	else if (isGround(x + 1, y - 1) && isGround(x + 1, y + 1)) {
		frame = 19;
	}
	else if (isGround(x - 1, y - 1)) {
		frame = 24;
	}
	else if (isGround(x + 1, y - 1)) {
		frame = 25;
	}
	else if (isGround(x - 1, y + 1)) {
		frame = 26;
	}
	else if (isGround(x + 1, y + 1)) {
		frame = 27;
	}
	
	// Count number of cave tiles:
	let caveCount = 0;
	gs.getIndexListAdjacent(x, y).forEach(function (tileIndex) {
		if (util.inArray(gs.getTile(tileIndex).type.name, ['CaveFloor', 'CaveWall', 'CavePit'])) {
			caveCount += 1;
		}
	}, this);
	
	let dungeonCount = 0;
	gs.getIndexListAdjacent(x, y).forEach(function (tileIndex) {
		if (util.inArray(gs.getTile(tileIndex).type.name, ['Floor', 'Wall', 'DungeonPit', 'HalfWall'])) {
			dungeonCount += 1;
		}
	}, this);
	
	if (caveCount > dungeonCount) {
		frame += 64;
	}
	
	return frame;
};
	

// CREATE_PLATFORM_WALL_MASKS:
// ************************************************************************************************
FrameSelector.createPlatformWallMasks = function () {
	let W = 1,
		P = 2,
		X = 3;
	
	this.platformWallMasks = [
		// Front Corners (outer):
		{mask: [[X, W, P],
				[0, W, W],
				[0, 0, X]
			   ],
		 offset: 1
		},
		
		{mask: [[P, W, X],
				[W, W, 0],
				[X, 0, 0]
			   ],
		 offset: 2
		},
		
		// Front Corner (inner):
		{mask: [[P, P, X],
				[P, W, W],
				[X, W, 0]
			   ],
		 offset: 3
		},
		
		{mask: [[X, P, P],
				[W, W, P],
				[0, W, X]
			   ],
		 offset: 4
		},
		
		// Sides (end):
		{mask: [[0, 0, 0],
				[P, W, 0],
				[P, W, X]
			   ],
		 offset: 5
		},
		
		// Sides (end):
		{mask: [[0, 0, 0],
				[P, W, 0],
				[W, W, X]
			   ],
		 offset: 5
		},
		
		{mask: [[0, 0, 0],
				[0, W, P],
				[X, W, P]
			   ],
		 offset: 6
		},
		
		{mask: [[0, 0, 0],
				[0, W, P],
				[X, W, W]
			   ],
		 offset: 6
		},
		
		// Sides (mid):
		{mask: [[X, W, X],
				[P, W, 0],
				[X, W, X]
			   ],
		 offset: 7
		},
		
		
		{mask: [[X, W, X],
				[0, 1, P],
				[X, W, X]
			   ],
		 offset: 8
		},
		
		
		// Back Corner:
		{mask: [[0, 0, X],
				[0, W, W],
				[X, W, P]
			   ],
		 offset: 9
		},
		
		{mask: [[X, 0, 0],
				[W, W, 0],
				[P, W, X]
			   ],
		 offset: 10
		},
		
		
		// Back Corner (inner):
		{mask: [[X, W, 0],
				[P, W, W],
				[P, P, X]
			   ],
		 offset: 11
		},
		
		{mask: [[0, W, X],
				[W, W, P],
				[X, P, P]
			   ],
		 offset: 12
		},
		
		// Back:
		{mask: [[X, 0, X],
				[W, W, W],
				[X, P, X]
			   ],
		 offset: 13
		},
		
	];
};

// CREATE_WALL_MASKS:
// During this function later masks can overwrite earlier masks
// Use later masks to specify more specific masks
// ************************************************************************************************
FrameSelector.createWallMasks = function () {
	var X = 2;
	
	let FRONT_LEFT = 1,
		FRONT_RIGHT = 2,
		WALL_LEFT = 3,
		WALL_RIGHT = 4,
		BACK_OUTER_LEFT = 5,
		BACK = 6,
		BACK_OUTER_RIGHT = 7,
		BACK_INNER_LEFT = 8,
		BACK_INNER_RIGHT = 9,
		FRONT_SINGLE = 10,
		SINGLE_WALL = 11,
		SINGLE_BACK = 12,
		WALL_RIGHT_AND_CORNER = 13,
		WALL_LEFT_AND_CORNER = 14;
	
	this.wallMasks = [
		// Front Corners:
		{mask: [[X, 1, X],
				[0, 1, 1],
				[0, 0, X]
			   ],
		 offset: FRONT_LEFT
		},
		
		{mask: [[X, 1, X],
				[1, 1, 0],
				[X, 0, 0]
			   ],
		 offset: FRONT_RIGHT
		},
		
		{mask: [[X, 1, X],
			    [0, 1, 1],
				[X, 1, X]],
		 offset: WALL_LEFT
		},
		{mask: [[X, 1, X],
			    [1, 1, 0],
				[X, 1, X]],
		 offset: WALL_RIGHT
		},
		{mask: [[0, 0, X],
			    [0, 1, 1],
				[X, 1, X]],
		 offset: BACK_OUTER_LEFT
		},
		{mask: [[X, 0, X],
			    [1, 1, 1],
				[X, 1, X]],
		 offset: BACK
		},
		{mask: [[X, 0, 0],
			    [1, 1, 0],
				[X, 1, X]],
		 offset: BACK_OUTER_RIGHT
		},
		
		{mask: [[1, 1, X],
			    [1, 1, 1],
				[X, 1, 0]],
		 offset: WALL_RIGHT
		},
		{mask: [[X, 1, 1],
			    [1, 1, 1],
				[0, 1, X]],
		 offset: WALL_LEFT
		},
		
		{mask: [[X, 1, 0],
			    [1, 1, 1],
				[1, 1, X]],
		 offset: BACK_INNER_LEFT
		},
		{mask: [[0, 1, X],
			    [1, 1, 1],
				[X, 1, 1]],
		 offset: BACK_INNER_RIGHT
		},
		{mask: [[X, 1, X],
			    [0, 1, 0],
				[X, 0, X]],
		 offset: FRONT_SINGLE
		},
		{mask: [[0, 1, 0],
			    [1, 1, 0],
				[0, 1, 0]],
		 offset: SINGLE_WALL
		},
		{mask: [[0, 1, X],
			    [0, 1, 1],
				[0, 1, 0]],
		 offset: SINGLE_WALL
		},
		{mask: [[X, 1, X],
			    [0, 1, 0],
				[X, 1, X]],
		 offset: SINGLE_WALL
		},
		{mask: [[1, 1, X],
			    [1, 1, 0],
				[0, 1, 0]],
		 offset: SINGLE_WALL
		},
		{mask: [[0, 1, 1],
			    [0, 1, 1],
				[1, 1, 0]],
		 offset: SINGLE_WALL
		},
		{mask: [[X, 0, X],
			    [0, 1, 0],
				[X, 1, X]],
		 offset: SINGLE_BACK
		},
		{mask: [[0, 0, 0],
			    [1, 1, 1],
				[0, 1, 0]],
		 offset: SINGLE_BACK
		},
		{mask: [[0, 0, 0],
			    [1, 1, 0],
				[0, 1, 0]],
		 offset: SINGLE_BACK
		},
		{mask: [[0, 1, 1],
			    [1, 1, 1],
				[0, 1, 1]],
		 offset: WALL_LEFT
		},
		{mask: [[0, 0, 0],
			    [1, 1, 1],
				[1, 1, 0]],
		 offset: BACK_OUTER_RIGHT
		},
		{mask: [[0, 0, X],
			    [1, 1, 1],
				[0, 1, 1]],
		 offset: BACK_OUTER_LEFT
		},
		{mask: [[1, 1, 0],
			    [1, 1, 1],
				[1, 1, 0]],
		 offset: WALL_RIGHT
		},
		{mask: [[0, 0, 1],
			    [1, 1, 1],
				[1, 1, 0]],
		 offset: BACK_OUTER_RIGHT
		},
		{mask: [[1, 0, 0],
			    [1, 1, 1],
				[0, 1, 0]],
		 offset: SINGLE_BACK
		},
		{mask: [[1, 1, 1],
			    [0, 1, 1],
				[0, 1, 0]],
		 offset: SINGLE_WALL
		},
		{mask: [[1, 1, 0],
			    [1, 1, 0],
				[0, 1, 1]],
		 offset: SINGLE_WALL
		},
		{mask: [[0, 0, 1],
			    [1, 1, 1],
				[0, 1, 0]],
		 offset: SINGLE_BACK
		},
		{mask: [[0, 1, 0],
			    [1, 1, 1],
				[0, 1, 0]],
		 offset: SINGLE_WALL
		},
		{mask: [[1, 0, 0],
			    [1, 1, 0],
				[0, 1, 0]],
		 offset: SINGLE_BACK
		},
		{mask: [[0, 1, 1],
			    [1, 1, 1],
				[1, 1, 0]],
		 offset: BACK_OUTER_RIGHT
		},
		{mask: [[1, 1, 1],
			    [1, 1, 1],
				[0, 1, 0]],
		 offset: SINGLE_BACK
		},
	
		{mask: [[0, 1, 0],
			    [1, 1, 1],
				[1, 1, 1]],
		 offset: BACK
		},
		
		{mask: [[0, 0, 0],
			    [0, 1, 1],
				[0, 1, 0]],
		 offset: SINGLE_BACK
		},
		
		{mask: [[0, 1, X],
			    [1, 1, 0],
				[1, 1, 0]],
		 offset: WALL_RIGHT_AND_CORNER
		},
		
		{mask: [[X, 1, 0],
			    [0, 1, 1],
				[0, 1, 1]],
		 offset: WALL_LEFT_AND_CORNER
		},
		
		{mask: [[0, 1, 1],
			    [0, 1, 1],
				[0, 1, 0]],
		 offset: SINGLE_WALL
		},
		
		{mask: [[0, 1, 0],
			    [0, 1, 1],
				[1, 1, 1]],
		 offset: WALL_LEFT_AND_CORNER
		},
	
		{mask: [[0, 1, 0],
			    [1, 1, 0],
				[1, 1, 1]],
		 offset: WALL_RIGHT_AND_CORNER
		},
		
		{mask: [[1, 0, 0],
			    [1, 1, 1],
				[0, 1, 1]],
		 offset: BACK_OUTER_LEFT
		},
		
		{mask: [[0, 0, 0],
			    [1, 1, 0],
				[0, 1, 1]],
		 offset: SINGLE_BACK
		},
		
		{mask: [[1, 1, 0],
			    [1, 1, 1],
				[0, 1, 1]],
		 offset: BACK_OUTER_LEFT
		},
		
		{mask: [[1, 0, 0],
			    [1, 1, 1],
				[1, 1, 0]],
		 offset: BACK_OUTER_RIGHT
		},
		
		{mask: [[0, 0, 1],
			    [0, 1, 1],
				[1, 1, 0]],
		 offset: SINGLE_BACK
		},
		
		{mask: [[1, 0, 0],
			    [1, 1, 0],
				[0, 1, 1]],
		 offset: SINGLE_BACK
		},
		
		{mask: [[0, 0, 1],
			    [0, 1, 1],
				[0, 1, 0]],
		 offset: SINGLE_BACK
		},
		
		{mask: [[0, 0, 0],
			    [0, 1, 1],
				[1, 1, 0]],
		 offset: SINGLE_BACK
		},
		
		{mask: [[X, 0, 0],
			    [1, 1, 0],
				[X, 0, 0]],
		 offset: FRONT_RIGHT
		},
		
		{mask: [[0, 0, X],
			    [0, 1, 1],
				[0, 0, X]],
		 offset: FRONT_LEFT
		},
		
		{mask: [[1, 1, 0],
			    [1, 1, 1],
				[0, 1, 0]],
		 offset: SINGLE_WALL
		},
		
		{mask: [[0, 1, 1],
			    [1, 1, 1],
				[0, 1, 0]],
		 offset: SINGLE_WALL
		},
		
		{mask: [[0, 1, 0],
			    [1, 1, 1],
				[1, 1, 0]],
		 offset: WALL_RIGHT_AND_CORNER
		},
		
		{mask: [[0, 1, 0],
			    [1, 1, 1],
				[0, 1, 1]],
		 offset: WALL_LEFT_AND_CORNER
		},
		
		
	];
	
};



// CREATE_PIT_MASKS:
// During this function later masks can overwrite earlier masks
// Use later masks to specify more specific masks
// ************************************************************************************************
FrameSelector.createPitMasks = function () {
	var X = 2;
	
	this.pitMasks = [
		// Straight:
		{mask: [[X, 0, X],
				[1, 1, 1],
				[X, 1, X]],
		 offset: 2
		},
		
		{mask: [[X, 1, X],
				[0, 1, 1],
				[X, 1, X]],
		 offset: 4
		},
		
		{mask: [[X, 1, X],
				[1, 1, 0],
				[X, 1, X]],
		 offset: 5
		},
		
		{mask: [[X, 1, X],
				[1, 1, 1],
				[X, 0, X]],
		 offset: 7
		},
		
		// Inner Corner:
		{mask: [[0, 0, X],
				[0, 1, X],
				[X, X, X]],
		 offset: 1
		},
		
		{mask: [[X, 0, 0],
				[X, 1, 0],
				[X, X, X]],
		 offset: 3
		},
		
		{mask: [[X, X, X],
				[0, 1, X],
				[0, 0, X]],
		 offset: 6
		},
		
		{mask: [[X, X, X],
				[X, 1, 0],
				[X, 0, 0]],
		 offset: 8
		},
		
		// Outter Corner:
		{mask: [[X, X, X],
				[X, 1, 1],
				[X, 1, 0]],
		 offset: 9
		},
		
		{mask: [[X, X, X],
				[1, 1, X],
				[0, 1, X]],
		 offset: 10
		},
		
		{mask: [[X, 1, 0],
				[X, 1, 1],
				[X, X, X]],
		 offset: 11
		},
		
		{mask: [[0, 1, X],
				[1, 1, X],
				[X, X, X]],
		 offset: 12
		},
	];
};



// MATCH_MASK:
// ************************************************************************************************
FrameSelector.matchMask = function (x, y, bitMask, pred) {
	for (let itX = 0; itX < 3; itX += 1) {
		for (let itY = 0; itY < 3; itY += 1) {
			if (bitMask[itY][itX] === 1 && gs.isInBounds(x + itX - 1, y + itY - 1) && pred(x + itX - 1, y + itY - 1)) {
				return false;
			}
			if (bitMask[itY][itX] === 0 && (!gs.isInBounds(x + itX - 1, y + itY - 1) || !pred(x + itX - 1, y + itY - 1))) {
				return false;
			}
		}
	}
	
	return true;
};