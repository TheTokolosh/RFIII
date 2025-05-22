/*global Phaser, game, console, gs, util*/
/*global FrameSelector*/
/*global NUM_TILES_X, NUM_TILES_Y, FACTION, FRIENDLY_NPC_LIST*/
/*global TILE_SIZE, LAVA_DAMAGE*/
/*jshint white: true, laxbreak: true, esversion: 6, loopfunc: true*/
'use strict';

// INITIATE_TILE_MAP:
// ************************************************************************************************
gs.initiateTileMap = function () {
	this.numTilesX = NUM_TILES_X;
	this.numTilesY = NUM_TILES_Y;
	
	// Create empty map:
    this.tileMap = [];
    for (let x = 0; x < this.numTilesX; x += 1) {
        this.tileMap[x] = [];
        for (let y = 0; y < this.numTilesY; y += 1) {
            this.tileMap[x][y] = {
				tileIndex: {x: x, y: y},
		
				// Dynamic:
				explored: false,   
				visible: false,  
				
				// Contents:
				character: null,
				type: null,
				frame: null,       
				item: null,     
				effect: null,	  
				object: null,				  
				cloud: null,
				area: null,
				
				// Flags and Tags:
				isClosed: false,
				isSolidWall: false,
				isDropWallRoom: false,
				isPlatform: false,
				
                // Triggers:
                floorTrigger: null,
                isStandardDropWall: false,
                isTriggeredDropWall: false,
                tagID: 0, // Note that 0 implies no tag
                
			};
		}
	}
};


// TILE_DESC:
// ************************************************************************************************
gs.tileDesc = function (tile) {
	var desc = {title: tile.type.niceName, text: ''};
	
	if (tile.type.name === 'Lava' || tile.type.name === 'ToxicWaste') {
		desc.text += 'Damage: ' + gs.npcDamage(gs.dangerLevel(), 'MLOW') + '\n\n';
	}
	
	if (tile.type.desc) {
		desc.text += tile.type.desc;
	}
	
	return desc;
};


// DESCRIPTION_OF_TILE_INDEX:
// Return a textual description of the tile located at tileIndex
// ************************************************************************************************
gs.descriptionOfTileIndex = function (tileIndex) {
	// Offscreen:
    if (!gs.isInBounds(tileIndex)) {
        return null;
    }
	// Character:
	// Note that char is placed above unexplored in order for telepathy to work
	else if (gs.getChar(tileIndex, char => gs.pc.canSeeCharacter(char) || char.isSpriteDarkVisible())) {
		return gs.getChar(tileIndex).getDesc();
    }
	// Unexplored:
	else if (!gs.getTile(tileIndex).explored) {
        return {title: 'Unexplored', text: ''};
    }
	// Merchant:
	else if (gs.getChar(tileIndex, FRIENDLY_NPC_LIST)) {
		return gs.getChar(tileIndex).getDesc();
    }
	// Effect:
	else if (gs.getCloud(tileIndex) && gs.getTile(tileIndex).visible) {
		return gs.getCloud(tileIndex).getDesc();
    }
	// Item:
	else if (gs.getItem(tileIndex)) {
        return gs.getItem(tileIndex).item.toLongDesc();
	}
	// Object:
	else if (gs.getTile(tileIndex).object && !gs.getTile(tileIndex).object.type.isHidden && !gs.getTile(tileIndex).object.type.hideName) {
		return gs.getTile(tileIndex).object.getDesc();
	}
	// Tile:
	else {
		return gs.tileDesc(gs.getTile(tileIndex));
	}
	
};



// IS_RAY:
// ************************************************************************************************
gs.isRay = function (startTileIndex, endTileIndex, pred, useHitBounds = false) {
	var startPosition = util.toPosition(startTileIndex),
        endPosition = util.toPosition(endTileIndex),
        length = util.distance(startPosition, endPosition),
        normal = util.normal(startPosition, endPosition),
        currentPosition = startPosition,
        currentTileIndex,
        step = 2,
        currentDistance = 0;
	
	for (currentDistance = 0; currentDistance < length; currentDistance += step) {
        currentPosition = {x: startPosition.x + normal.x * currentDistance,
                           y: startPosition.y + normal.y * currentDistance};
        currentTileIndex = util.toTileIndex(currentPosition);
		
		if (!util.vectorEqual(currentTileIndex, startTileIndex) && !util.vectorEqual(currentTileIndex, endTileIndex)) {
			if (!pred(currentTileIndex) && (!useHitBounds || gs.inTileHitBounds(currentPosition))) {
				return false;
			}
		}
	}
		
	return true;
};

// IS_RAY_CLEAR:
// ************************************************************************************************
gs.isRayClear = function (startTileIndex, endTileIndex) {
	return this.isRay(startTileIndex, endTileIndex, function (tileIndex) {
		return gs.isTileIndexTransparent(tileIndex);
	}, true);
};

// IS_RAY_PERFECT_AIM_PASSABLE:
// ************************************************************************************************
gs.isRayPerfectAimPassable = function (startTileIndex, endTileIndex) {
	return this.isRay(startTileIndex, endTileIndex, function (tileIndex) {
		return gs.isProjectilePassable(tileIndex)
			|| gs.getChar(tileIndex);
	}, true);
};

// IS_RAY_PROJECTILE_PASSABLE:
// ************************************************************************************************
gs.isRayProjectilePassable = function (startTileIndex, endTileIndex) {
	return this.isRay(startTileIndex, endTileIndex, function (tileIndex) {
		return gs.isProjectilePassable(tileIndex);
	}, true);
};

// IS_RAY_BEAM_PASSABLE:
// Useful for many abilities that need to:
// #1 Pass through enemies
// #2 Pass over low objects ex. tables
// #3 Pass through opaque clouds
// ************************************************************************************************
gs.isRayBeamPassable = function (startTileIndex, endTileIndex) {
	return this.isRay(startTileIndex, endTileIndex, function (tileIndex) {
		if (!gs.isStaticProjectilePassable(tileIndex)) {
			return false;
		}
		
		return gs.isTileIndexTransparent(tileIndex) || gs.isStaticProjectilePassable(tileIndex);
	}, true);
};

// IS_RAY_SHOOTABLE:
// Used by NPCs so they shoot each other while still moving around terrain:
// ************************************************************************************************
gs.isRayShootable = function (startTileIndex, endTileIndex) {
    return this.isRay(startTileIndex, endTileIndex, function (tileIndex) {
		return gs.isTileIndexTransparent(tileIndex) && gs.isStaticProjectilePassable(tileIndex);
	}, true);
};

// IS_RAY_PASSABLE:
// ************************************************************************************************
gs.isRayPassable = function (startTileIndex, endTileIndex) {
	return this.isRay(startTileIndex, endTileIndex, function (tileIndex) {
		return gs.isPassable(tileIndex);
	}, this);
};

// IS_RAY_STATIC_PASSABLE:
// ************************************************************************************************
gs.isRayStaticPassable = function (startTileIndex, endTileIndex) {
	return this.isRay(startTileIndex, endTileIndex, function (tileIndex) {
		return gs.isStaticPassable(tileIndex);
	}, this);
};

// IS_RAY_STATIC_PROJECTILE_PASSABLE:
// ************************************************************************************************
gs.isRayStaticProjectilePassable = function (startTileIndex, endTileIndex) {
	return this.isRay(startTileIndex, endTileIndex, function (tileIndex) {
		return gs.isStaticProjectilePassable(tileIndex);
	}, this);
};

// IS_B_RAY:
// Returns true if every tileIndex in the BRay satisfies the predicate
// ************************************************************************************************
gs.isBRay = function (startTileIndex, endTileIndex, pred) {
	var indexList = this.getIndexInBRay(startTileIndex, endTileIndex);
	
	for (let i = 0; i < indexList.length; i += 1) {
		if (!pred.call(this, indexList[i])) {
			return false;
		}
	}
	
	return true;
};

// GET_INDEX_IN_B_RAY:
// Returns a list of all tile indices in a line using Bresenham’s algorithm
// ************************************************************************************************
gs.getIndexInBRay = function (startTileIndex, endTileIndex) {
	var deltaX = endTileIndex.x - startTileIndex.x,
		deltaY = endTileIndex.y - startTileIndex.y,
		deltaErr,
		endPred,
		error = 0, // No error at start
		y,
		x,
		indexList = [],
		pushToList;
	
	pushToList = function (x, y) {
		if (!util.vectorEqual({x: x, y: y}, startTileIndex)) {
			indexList.push({x: x, y: y});
		}
	};
	
	// Same start and end will simply return the startTileIndex:
	if (util.vectorEqual(startTileIndex, endTileIndex)) {
		return [{x: startTileIndex.x, y: startTileIndex.y}];
	}
	

	// Vertical line is special case:
	if (startTileIndex.x === endTileIndex.x) {
		if (deltaY > 0) {
			for (y = startTileIndex.y; y <= endTileIndex.y; y += 1) {
				pushToList(startTileIndex.x, y);
			}
		}
		else {
			for (y = startTileIndex.y; y >= endTileIndex.y; y -= 1) {
				pushToList(startTileIndex.x, y);
			}
		}
	
		return indexList;
	}
	// Low (mostly horizontal):
	else if (Math.abs(deltaX) >= Math.abs(deltaY)) {
		deltaErr = Math.abs(deltaY / deltaX);
		y = startTileIndex.y;
	
		if (deltaX > 0) {
			endPred = function (x) {return x <= endTileIndex.x;};
		}
		else {
			endPred = function (x) {return x >= endTileIndex.x;};
		}

		for (x = startTileIndex.x; endPred(x); x += Math.sign(deltaX)) {
			pushToList(x, y);
			error += deltaErr;

			while (error > 0.5) {
				y += Math.sign(deltaY);
				error -= 1;
			}
		}

		return indexList;
	}
	// High (mostly vertical):
	else  {
		deltaErr = Math.abs(deltaX / deltaY);
		x = startTileIndex.x;
	
		if (deltaY > 0) {
			endPred = function (y) {return y <= endTileIndex.y;};
		}
		else {
			endPred = function (y) {return y >= endTileIndex.y;};
		}

		for (y = startTileIndex.y; endPred(y); y += Math.sign(deltaY)) {
			pushToList(x, y);
			error += deltaErr;

			while (error > 0.5) {
				x += Math.sign(deltaX);
				error -= 1;
			}
		}

		return indexList;
	}
};



// GET_OPEN_INDEX_IN_AREA:
// ************************************************************************************************
gs.getOpenIndexInArea = function (area) {
	var indexList = this.getAllIndex();
	
	indexList = indexList.filter(index => gs.isIndexOpen(index) && gs.getTile(index).area === area);
	
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_RAND_BOX:
// Returns a random box {width, height} such that all tileIndices meet the pred
// Returns null if no such box exists
// ************************************************************************************************
gs.getRandBox = function (width, height, pred, context = gs) {
	var list = [];
	
	gs.getAllIndex().forEach(function (tileIndex) {
		let indexList = gs.getIndexListInBox(tileIndex.x, tileIndex.y, tileIndex.x + width, tileIndex.y + height);
		
		indexList = indexList.filter(index => pred.call(context, index));
		
		if (indexList.length === width * height) {
			list.push(tileIndex);
		}
		
	}, this);
	
	if (list.length > 0) {
		let tileIndex = util.randElem(list);	
		return util.createBox(tileIndex.x, tileIndex.y, tileIndex.x + width, tileIndex.y + height);
	}
	else {
		return null;
	}
};

// GET_OPEN_BOX_IN_AREA:
// ************************************************************************************************
gs.getOpenBoxInArea = function (area, width, height) {
	var indexList = gs.getIndexListInBox(area),
		list = [];
	
	indexList.forEach(function (tileIndex) {
		var boxList = gs.getIndexListInBox(tileIndex.x, tileIndex.y, tileIndex.x + width, tileIndex.y + height);
		boxList = boxList.filter(index => gs.isIndexOpen(index));
		boxList = boxList.filter(index => gs.getTile(index).area === area);
		
		if (boxList.length === width * height) {
			list.push(util.createBox(tileIndex.x, tileIndex.y, tileIndex.x + width, tileIndex.y + height));
		}
	}, this);
	
	return list.length > 0 ? util.randElem(list) : null;
};

// GET_WIDE_OPEN_INDEX_IN_AREA:
// ************************************************************************************************
gs.getWideOpenIndexInArea = function (area) {
	var indexList = this.getAllIndex();
	indexList = indexList.filter(index => gs.isWideOpen(index) && gs.getTile(index).area === area);
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_OPEN_INDEX_IN_BOX
// ************************************************************************************************
gs.getOpenIndexInBox = function (box, startY, endX, endY) {
	var indexList;

	// Handle argument conversion:
	if (typeof box === 'number') {
		box = {startX: box, startY: startY, endX: endX, endY: endY};
	}
	
	indexList = this.getIndexListInBox(box);
	indexList = indexList.filter(index => gs.isIndexOpen(index));
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_WIDE_OPEN_INDEX_IN_BOX:
// ************************************************************************************************
gs.getWideOpenIndexInBox = function (box, startY, endX, endY) {
	var indexList;
	
	// Handle argument conversion:
	if (typeof box === 'number') {
		box = {startX: box, startY: startY, endX: endX, endY: endY};
	}
	
	indexList = this.getIndexListInBox(box);
	indexList = indexList.filter(index => gs.isWideOpen(index));
	return indexList.length > 0 ? util.randElem(indexList) : null;
};



// GET_OPEN_INDEX_IN_LEVEL:
// ************************************************************************************************
gs.getOpenIndexInLevel = function () {
	return this.getOpenIndexInBox(0, 0, this.numTilesX, this.numTilesY);
};

// GET_WIDE_OPEN_INDEX_IN_LEVEL:
// ************************************************************************************************
gs.getWideOpenIndexInLevel = function () {
	return this.getWideOpenIndexInBox(0, 0, this.numTilesX, this.numTilesY);
};

// GET_PASSABLE_INDEX_IN_BOX:
// ************************************************************************************************
gs.getPassableIndexInBox = function (box, startY, endX, endY) {
	var indexList;
	
	// Handle argument conversion:
	if (typeof box === 'number') {
		box = {startX: box, startY: startY, endX: endX, endY: endY};
	}
	
	indexList = this.getIndexListInBox(box);
	indexList = indexList.filter(index => gs.isPassable(index));
	return indexList.length > 0 ? util.randElem(indexList) : null;
};



// GET_PASSABLE_ADJACENT_INDEX:
// ************************************************************************************************
gs.getPassableAdjacentIndex = function (tileIndex) {
	var indexList = this.getIndexListAdjacent(tileIndex);
	indexList = indexList.filter(index => gs.isPassable(index));
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// IS_ADJACENT_TO_TRANSPARENT:
// Returns a tileIndex that is adjacent that is also staticPassable
// ************************************************************************************************
gs.isAdjacentToTransparent = function (tileIndex) {
	var indexList = this.getIndexListAdjacent(tileIndex);
	indexList = indexList.filter(index => gs.isTileIndexTransparent(index));
	return indexList.length > 0 ? true : false;
};


// GET_INDEX_LIST_ADJACENT:
// ************************************************************************************************
gs.getIndexListAdjacent = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	var indexList = this.getIndexListInBox(tileIndex.x - 1, tileIndex.y - 1, tileIndex.x + 2, tileIndex.y + 2);
	indexList = indexList.filter(index => !util.vectorEqual(tileIndex, index));
	return indexList;
};

// GET_INDEX_LIST_CARDINAL_ADJACENT:
// ************************************************************************************************
gs.getIndexListCardinalAdjacent = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	var indexList = this.getIndexListAdjacent(tileIndex);
	indexList = indexList.filter(index => util.distance(index, tileIndex) === 1);
	return indexList;
};

// GET_INDEX_IN_RADIUS:
// Will return the centerTileIndex if tileRadius = 0
// ************************************************************************************************
gs.getIndexListInRadius = function (centerTileIndex, tileRadius) {
	var x, y, indexList = [];
	
	if (tileRadius === 0) {
		return [{x: centerTileIndex.x, y: centerTileIndex.y}];
	}
	
	for (x = centerTileIndex.x - Math.ceil(tileRadius); x <= centerTileIndex.x + Math.ceil(tileRadius); x += 1) {
		for (y = centerTileIndex.y - Math.ceil(tileRadius); y <= centerTileIndex.y + Math.ceil(tileRadius); y += 1) {
			if (gs.isInBounds(x, y) && util.distance(centerTileIndex, {x: x, y: y}) <= tileRadius) {
				indexList.push({x: x, y: y});
			}
		}
	}
	return indexList;
};

// GET_INDEX_IN_RAY:
// Returns a list of all tile indices in a line
// If haltCondition is passed then the function will terminate when that condition evaluates to true
// ************************************************************************************************
gs.getIndexInRay = function (startTileIndex, endTileIndex, haltCondition) {
	var startPos = util.toPosition(startTileIndex),
		endPos = util.toPosition(endTileIndex),
		tiles = [],
		indexList = [],
		distance = 0,
		finalDistance = game.math.distance(startPos.x, startPos.y, endPos.x, endPos.y),
		normal = util.normal(startPos, endPos),
		stepSize = 4,
		tile,
		i,
		x = startPos.x,
		y = startPos.y;

	while (distance < finalDistance) {
        x += normal.x * stepSize;
        y += normal.y * stepSize;
        distance += stepSize;
		
		tile = this.getTile(util.toTileIndex({x: x, y: y}));
        
		if (haltCondition && haltCondition(util.toTileIndex({x: x, y: y}))) {
			break;
		}
		
		if (tile && !util.inArray(tile, tiles)) {
            tiles.push(tile);
        }
    }
  
	for (i = 1; i < tiles.length; i += 1) {
		indexList.push(tiles[i].tileIndex);
	}
	return indexList;
};

// GET_ALL_INDEX:
// ************************************************************************************************
gs.getAllIndex = function () {
	return this.getIndexListInBox(0, 0, this.numTilesX, this.numTilesY);
};

// GET_INDEX_IN_BOX:
// ************************************************************************************************
gs.getIndexListInBox = function (box, startY, endX, endY) {
	var x, y, indexList = [];
	
	if (typeof box === 'number') {
		box = {startX: box, startY: startY, endX: endX, endY: endY};
	}
	
	for (x = box.startX; x < box.endX; x += 1) {
		for (y = box.startY; y < box.endY; y += 1) {
			if (gs.isInBounds(x, y)) {
				indexList.push({x: x, y: y});
			}
		}
	}
	
	return indexList;
};

// GET_INDEX_IN_AREA:
// ************************************************************************************************
gs.getIndexListInArea = function (area) {
	var indexList = this.getIndexListInBox(area);
	indexList = indexList.filter(index => gs.getTile(index).area === area);
	return indexList;
};

// GET_INDEX_IN_FAN:
// Returns all tiles in a 90deg are originating at tileIndex and pointing in dirVector
// dirVector must be one of the major cardinal directions
// ************************************************************************************************
gs.getIndexInFan = function (tileIndex, range, dirVector) {
	var angle,
		indexList,
		arc = 30;
	
	angle = util.angleToFace({x: 0, y: 0}, dirVector);
	
	indexList = this.getIndexListInRadius(tileIndex, range + 1);
	indexList = indexList.filter(index => !util.vectorEqual(index, tileIndex));
	indexList = indexList.filter(index => util.distance(tileIndex, index) < range + 1);
	
	if (angle >= 315 || angle <= 45) {
		indexList = indexList.filter(index => Math.abs(util.angleToFace(tileIndex, index) - angle) <= arc || Math.abs(util.angleToFace(tileIndex, index) - angle) >= 360 - arc);
	}
	else {
		indexList = indexList.filter(index => Math.abs(util.angleToFace(tileIndex, index) - angle) <= arc);
	}
	
	return indexList;
};

// GET_NEAREST_PASSABLE_SAFE_INDEX:
// Used when dragging NPCs up stairs or when using a teleport pad
// Will conduct a large flood fill, sorted by depth and return the nearest passable tileIndex
// ************************************************************************************************
gs.getNearestPassableSafeIndex = function (tileIndex) {
	var indexList, pred;
	
	pred = function (tileIndex) {
		return gs.isPassable(tileIndex)
			&& gs.isIndexSafe(tileIndex);
	};
	
	// Base Case:
	if (pred(tileIndex)) {
		return tileIndex;
	}
	
	// Flood, filter and sort:
	indexList = gs.getIndexListInFlood(tileIndex, index => gs.getTile(index).type.passable, 10, true);
	indexList = indexList.filter(index => pred(index));
	indexList.sort((a, b) => a.depth - b.depth);
	
	return indexList.length > 0 ? indexList[0] : null;
};

// GET_INDEX_IN_FLOOD:
// ************************************************************************************************
gs.getIndexListInFlood = function (startTileIndex, func, maxDepth, allowDiagonal = false, usePortals = false) {
	var openList = [],
		closedList = [],
		currentNode,
		tryToAddChild,
		isInOpenList,
		isInClosedList,
		loopCount = 0;

	maxDepth = maxDepth || 10000;

	// TRY_TO_ADD_CHILD:
	tryToAddChild = function (tileIndex, depth) {
		let portal = gs.getObj(tileIndex, 'Portal');
		
		// Portals:
		if (usePortals && portal && !isInOpenList(portal.toTileIndexList[0]) && !isInClosedList(portal.toTileIndexList[0])) {
			openList.push({x: portal.toTileIndexList[0].x, y: portal.toTileIndexList[0].y, depth: depth});
		}
		// Standard:
		else if (gs.isInBounds(tileIndex)
				&& depth <= maxDepth
				&& func(tileIndex)
				&& !isInOpenList(tileIndex)
				&& !isInClosedList(tileIndex)) {
			
			openList.push({x: tileIndex.x, y: tileIndex.y, depth: depth});
        }
	};
	
	// IS_IN_OPEN_LIST:
	isInOpenList = function (tileIndex) {
		return openList.find(node => util.vectorEqual(node, tileIndex));
	};
	
	// IS_IN_CLOSED_LIST:
	isInClosedList = function (tileIndex) {
		return closedList.find(node => util.vectorEqual(node, tileIndex));
	};
	
	openList.push({x: startTileIndex.x, y: startTileIndex.y, depth: 0});
	
	while (openList.length > 0) {
		currentNode = openList.shift();
		closedList.push(currentNode);
		
		// Add adjacent:
		tryToAddChild({x: currentNode.x + 1, y: currentNode.y}, currentNode.depth + 1);
		tryToAddChild({x: currentNode.x - 1, y: currentNode.y}, currentNode.depth + 1);
		tryToAddChild({x: currentNode.x, y: currentNode.y + 1}, currentNode.depth + 1);
		tryToAddChild({x: currentNode.x, y: currentNode.y - 1}, currentNode.depth + 1);
		
		if (allowDiagonal) {
			tryToAddChild({x: currentNode.x - 1, y: currentNode.y - 1}, currentNode.depth + 1);
			tryToAddChild({x: currentNode.x - 1, y: currentNode.y + 1}, currentNode.depth + 1);
			tryToAddChild({x: currentNode.x + 1, y: currentNode.y - 1}, currentNode.depth + 1);
			tryToAddChild({x: currentNode.x + 1, y: currentNode.y + 1}, currentNode.depth + 1);
		}
		
		loopCount += 1;
		if (loopCount > 10000) {
			throw 'getIndexListInFlood: loopCount exceeded';
		}
	}
	
	return closedList;
};



// IN_TILE_HIT_BOUNDS:
// ************************************************************************************************
gs.inTileHitBounds = function (position, bounds = 3) {
	let tileIndex = util.toTileIndex(position);
	
	
	// Walls have a larger hit box:
	if (!gs.isStaticPassable(tileIndex)) {
		bounds = 2;
	}
	
	
	
	
	return position.x > tileIndex.x * TILE_SIZE + bounds
		&& position.x < (tileIndex.x + 1) * TILE_SIZE - bounds
		&& position.y > tileIndex.y * TILE_SIZE + bounds
		&& position.y < (tileIndex.y + 1) * TILE_SIZE - bounds;
};

// GET_TILE:
// ************************************************************************************************
gs.getTile = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    if (this.isInBounds(tileIndex)) {
        return this.tileMap[tileIndex.x][tileIndex.y];
    } 
	else {
        return null;
    }
};

// GET_ITEM:
// ************************************************************************************************
gs.getItem = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    if (this.isInBounds(tileIndex)) {
        return this.tileMap[tileIndex.x][tileIndex.y].item || null;
    } 
	else {
        return null;
    }
};

// GET_OBJ:
// ************************************************************************************************
gs.getObj = function (tileIndex, y, typeName) {
	var obj; 
	
	// x, y, typeName
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	// index, typeName
	else {
		typeName = y;
	}
	
	// Not in bounds:
	if (!this.isInBounds(tileIndex)) {
		return null;
	}
	
	obj = this.tileMap[tileIndex.x][tileIndex.y].object;
	
	// No Object:
	if (!obj) {
		return null;
	}
	
	// No Pred:
	if (!typeName) {
		return obj;
	}
    
	// With predicate:
	if (typeof typeName === 'function') {
		return typeName.call(this, obj) ? obj : null;
	}
	// With specified typeName list:
	else if (typeof typeName === 'object') {
		return util.inArray(obj.type.name, typeName) ? obj : null;
	}
	// With specified typeName:
	else if (typeName) {
		return obj.type.name === typeName ? obj : null;
	}
};

// GET_CHAR:
// ************************************************************************************************
gs.getChar = function (tileIndex, y, typeName) {
	var char; 
	
	// x, y, typeName
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	// index, typeName
	else {
		typeName = y;
	}
	
	// Not in bounds:
	if (!this.isInBounds(tileIndex)) {
		return null;
	}
	
	char = this.tileMap[tileIndex.x][tileIndex.y].character;
	
	// No Object:
	if (!char || !char.isAlive) {
		return null;
	}
	
	// No Pred:
	if (!typeName) {
		return char;
	}
    
	// With predicate:
	if (typeof typeName === 'function') {
		return typeName.call(this, char) ? char : null;
	}
	// With specified typeName list:
	else if (typeof typeName === 'object') {
		return util.inArray(char.type.name, typeName) ? char : null;
	}
	// With specified typeName:
	else if (typeName) {
		return char.type.name === typeName ? char : null;
	}
};

// GET_EFFECT:
// ************************************************************************************************
gs.getEffect = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    if (this.isInBounds(tileIndex)) {
        return this.tileMap[tileIndex.x][tileIndex.y].effect || null;
    } 
	else {
        return null;
    }
};


// GET_CLOUD:
// ************************************************************************************************
gs.getCloud = function (tileIndex, y, typeName) {
	var cloud; 
	
	// x, y, typeName
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	// index, typeName
	else {
		typeName = y;
	}
	
	// Not in bounds:
	if (!this.isInBounds(tileIndex)) {
		return null;
	}
	
	cloud = this.tileMap[tileIndex.x][tileIndex.y].cloud;
	
	// No Object:
	if (!cloud) {
		return null;
	}
	
	// No Pred:
	if (!typeName) {
		return cloud;
	}
    
	// With predicate:
	if (typeof typeName === 'function') {
		return typeName.call(this, cloud) ? cloud : null;
	}
	// With specified typeName list:
	else if (typeof typeName === 'object') {
		return util.inArray(cloud.type.name, typeName) ? cloud : null;
	}
	// With specified typeName:
	else if (typeName) {
		return cloud.type.name === typeName ? cloud : null;
	}
};

// GET_AREA:
// ************************************************************************************************
gs.getArea = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    if (this.isInBounds(tileIndex)) {
        return this.tileMap[tileIndex.x][tileIndex.y].area || null;
    } 
	else {
        return null;
    }
};

// SET_TILE_TYPE:
// ************************************************************************************************
gs.setTileType = function (tileIndex, tileType, frame) {	
	if (!this.isInBounds(tileIndex)) {
		return;
	}

	// Breaking walls into correct tiles:
	if (!frame && gs.getTile(tileIndex).type) {
		let tileSet = gs.getTileSet(gs.getTile(tileIndex));
    
		if (tileSet && tileSet.breakToTileType === tileType) {
			frame = tileSet.breakToFrame;
		}
	}
    
    // Setting tileType:
	this.tileMap[tileIndex.x][tileIndex.y].type = tileType;
		
	this.tileMap[tileIndex.x][tileIndex.y].frame = frame || tileType.frame;
	
	// Remove area flags if we are making this tile impassable:
	if (!tileType.passable) {
		this.getTile(tileIndex).area = null;
	}
};




// IS_PIT:
// ************************************************************************************************
gs.isPit = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return this.isInBounds(tileIndex)
		&& this.getTile(tileIndex).type.isPit;
};

// CAN_BURST_OF_FLAME:
// ************************************************************************************************
gs.canBurstOfFlame = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return gs.getObj(tileIndex, obj => obj.type.canBurstOfFlame)
		|| gs.getCloud(tileIndex, cloud => cloud.type.canBurstOfFlame);
};
    
// IS_PASSABLE:
// ************************************************************************************************
gs.isPassable = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    return this.isInBounds(tileIndex)
			&& this.isStaticPassable(tileIndex)
            && this.getTile(tileIndex).character === null
            && !this.getCloud(tileIndex, cloud => !cloud.isPassable);
};

// IS_STATIC_PASSABLE:
// Returns true if the tileType and object are passable
// Ignores characters
// Useful for lots of ability targeting
// ************************************************************************************************
gs.isStaticPassable = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    return gs.isInBounds(tileIndex)
		&& gs.getTile(tileIndex).type.passable === 2
		&& (!gs.getObj(tileIndex) || gs.getObj(tileIndex, obj => obj.isPassable() === 2));
	
		// Removed Sept-23-2021 - EscapeBlink could not flood past force walls.
		//&& (!gs.getCloud(tileIndex) || gs.getCloud(tileIndex).type.isPassable);
};

// IS_EXTERNAL_WALL:
// ************************************************************************************************
gs.isExternalWall = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	// Must be a wall:
	if (gs.getTile(tileIndex).type.passable !== 0) {
		return false;
	}
	
	// Has no adjacent floor:
	if (gs.getIndexListCardinalAdjacent(tileIndex).filter(idx => gs.isStaticPassable(idx) && !gs.isPit(idx)).length === 0) {
		return false;
	}
    
	return true;
};

// IS_PROJECTILE_PASSABLE:
// ************************************************************************************************
gs.isProjectilePassable = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
    return this.isInBounds(tileIndex)
            && this.getTile(tileIndex).type.passable >= 1
			&& !this.getObj(tileIndex, obj => !obj.isPassable())
            && !this.getChar(tileIndex)
            && !this.getCloud(tileIndex, cloud => !cloud.isPassable);
};

// IS_STATIC_PROJECTILE_PASSABLE:
// Returns true if the tileType and object are passable
// Ignores characters
// Useful for lots of ability targeting
// ************************************************************************************************
gs.isStaticProjectilePassable = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    return gs.isInBounds(tileIndex)
		&& gs.getTile(tileIndex).type.passable >= 1
		&& !gs.getObj(tileIndex, obj => !obj.isPassable())
		&& !this.getCloud(tileIndex, cloud => !cloud.isPassable);
};




// IS_DROP_WALL:
// ************************************************************************************************
gs.isDropWall = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
    
    return gs.getTile(tileIndex).isStandardDropWall || gs.getTile(tileIndex).isTriggeredDropWall;
};

// IS_HALL_INDEX:
// ************************************************************************************************
gs.isHallIndex = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return tileIndex.x > 0 && tileIndex.y > 0 && tileIndex.x < NUM_TILES_X - 1 && tileIndex.y < NUM_TILES_Y - 1
		&& this.isPassable(tileIndex)
		&& !this.isUncoveredLiquid(tileIndex)
		&& !this.isPit(tileIndex)
		&& !this.getObj(tileIndex, obj => !obj.type.isPassable)
		&& !this.getChar(tileIndex)
		&& !this.getTile(tileIndex).isSolidWall;
};



// IS_INDEX_OPEN:
// ************************************************************************************************
gs.isIndexOpen = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return this.isInBounds(tileIndex)
		&& this.isPassable(tileIndex)
		&& !this.isUncoveredLiquid(tileIndex)
		&& !this.isPit(tileIndex)
		&& !this.getObj(tileIndex)
		&& !this.getChar(tileIndex)
		&& !this.getItem(tileIndex)
		&& !this.getTile(tileIndex).isClosed;
};

// IS_INDEX_UNCOVERED_LIQUID:
// Determines if the tile is both a liquid and if it is uncovered
// Stuff like ice will stop a liquid from being uncovered
// Characters can use this to determine if they should show their submerged graphic.
// ************************************************************************************************
gs.isUncoveredLiquid = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	return util.inArray(gs.getTile(tileIndex).type.name, ['Water', 'Lava', 'ToxicWaste', 'Blood'])
		&& !gs.getObj(tileIndex, obj => obj.type.coversLiquid);
};

// IS_WIDE_OPEN:
// Returns true if the 3x3 box centered on tileIndex is all open
// ************************************************************************************************
gs.isWideOpen = function (tileIndex, y) {
	var indexList;
	
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	if (!gs.isIndexOpen(tileIndex)) {
		return false;
	}
	
	indexList = gs.getIndexListAdjacent(tileIndex);
	indexList = indexList.filter(index => this.isIndexOpen(index));
	return indexList.length === 8;
};
	
// IS_WIDE_PASSABLE:
// ************************************************************************************************
gs.isWidePassable = function (tileIndex, y) {
	var indexList;
	
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
	if (!gs.isPassable(tileIndex)) {
		return false;
	}
	
	indexList = gs.getIndexListAdjacent(tileIndex);
	indexList = indexList.filter(index => this.isPassable(index));
	return indexList.length === 8;
};
	

// IS_INDEX_SAFE:
// ************************************************************************************************
gs.isIndexSafe = function (tileIndex, character) {
	character = character || {};
	
	if (this.getTile(tileIndex).type.name === 'Lava' && !(character.isFlying || character.isLavaImmune || !gs.isUncoveredLiquid(tileIndex))) {
		return false;
	}
	
	if (this.getTile(tileIndex).type.name === 'ToxicWaste' && !(character.isFlying || character.isToxicWasteImmune)) {
		return false;
	}
	
	
	// Cloud:
	let isCloudDangerous = false;
	if (this.getCloud(tileIndex, cloud => cloud.type.niceName === 'Poison Cloud')) {
		if (!character.isGasImmune) {
			isCloudDangerous = true;
		}
	}
	else if (this.getCloud(tileIndex, cloud => cloud.type.isDangerous)) {
		isCloudDangerous = true;
	}
	
	// Objects:
	let isObjectDangerous = false;
	if (this.getObj(tileIndex, 'FlameWeb') && !character.isFlying) {
		isObjectDangerous = true;
	}
	else if (this.getObj(tileIndex, ['FireVent', 'SpikeTrap'])) {
		if (this.getObj(tileIndex).currentTurn <= 1) {
			isObjectDangerous = true;
		}
	}
	else if (this.getObj(tileIndex, 'FlameWeb')) {
		if (!character.isFlying) {
			isObjectDangerous = true;
		}
	}
	else if (this.getObj(tileIndex, obj => obj.type.isDangerous)) {
		isObjectDangerous = true;
	}
	
	return (!this.isPit(tileIndex) || character.isFlying)
		&& !isObjectDangerous
		&& !isCloudDangerous;
};

// IS_INDEX_SAFE_FOR_CHAR_TYPE:
// ************************************************************************************************
gs.isIndexSafeForCharType = function (tileIndex, charType) {
	
	if (this.getTile(tileIndex).type.name === 'Lava' && !(charType.isFlying || charType.isLavaImmune || !gs.isUncoveredLiquid(tileIndex))) {
		return false;
	}
	
	if (this.getTile(tileIndex).type.name === 'ToxicWaste' && !(charType.isFlying || charType.isToxicWasteImmune)) {
		return false;
	}
	
	let isCloudDangerous = false;
	// Poison Gas is special case due to immunity:
	if (this.getCloud(tileIndex, cloud => cloud.type.niceName === 'Poison Cloud')) {
		if (!charType.isGasImmune) {
			isCloudDangerous = true;
		}
	}
	else if (this.getCloud(tileIndex, cloud => cloud.type.isDangerous)) {
		isCloudDangerous = true;
	}
	
	
	return (!this.isPit(tileIndex) || charType.isFlying)
		&& !this.getObj(tileIndex, obj => obj.type.isDangerous)
		&& !isCloudDangerous;
};


// IS_NEAR_GAS_VENT:
// Returns true if tileIndex is within range of a gas trap.
// This is useful for determining if the tile is 'dangerous' despite not currently having gas on it.
// ************************************************************************************************
gs.isNearGasVent = function (tileIndex) {
	let indexList = gs.getIndexListInRadius(tileIndex, 2);
	
	for (let i = 0; i < indexList.length; i += 1) {
		if (gs.getObj(indexList[i], 'GasVent')) {
			return true;
		}
	}
	
	return false;
};



// IS_TILE_INDEX_TRANSPARENT:
// ************************************************************************************************
gs.isTileIndexTransparent = function (tileIndex) {
    return tileIndex.x >= 0 
		&& tileIndex.x < this.numTilesX 
		&& tileIndex.y >= 0 
		&& tileIndex.y < this.numTilesY
		&& this.tileMap[tileIndex.x][tileIndex.y].type.transparent
		&& (!this.tileMap[tileIndex.x][tileIndex.y].cloud || this.tileMap[tileIndex.x][tileIndex.y].cloud.isTransparent)
		&& (!this.tileMap[tileIndex.x][tileIndex.y].object || this.tileMap[tileIndex.x][tileIndex.y].object.isTransparent());
};

// IS_TILE_INDEX_IN_BOUNDS:
// ************************************************************************************************
gs.isInBounds = function (tileIndex, y) {
	if (typeof tileIndex === 'number') {
		tileIndex = {x: tileIndex, y: y};
	}
	
    return tileIndex.x >= 0  && tileIndex.y >= 0 && tileIndex.x < this.numTilesX && tileIndex.y < this.numTilesY;
};

// IS_VISIBLE_WALL:
// Returns true if the tile at tileIndex is both a wall and has a frame in which the graphic shows the wall itself 
// ************************************************************************************************
gs.isVisibleWall = function (tileIndex) {
	var typeName = this.getTile(tileIndex).type.name;

	if (typeName !== 'Wall' && typeName !== 'CaveWall') {
		return false;
	}
	
	if (!gs.isPassable(tileIndex.x, tileIndex.y + 1)) {
		return false;
	}
	
	return true;
};

// EXPLORE_MAP:
// ************************************************************************************************
gs.exploreMap = function () {
    for (let x = 0; x < this.numTilesX; x += 1) {
        for (let y = 0; y < this.numTilesY; y += 1) {
            if (this.getChar(x, y) ||
				this.getObj(x, y) ||
				this.isPassable(x, y) ||
				this.isAdjacentToTransparent({x: x, y: y})) {
                this.getTile(x, y).explored = true;
            }
        }
    }
};

// REVEAL_DUNGEON_SENSE:
// Explore any tile with an item, chest, or down stair
// ************************************************************************************************
gs.revealDungeonSenese = function () {
	var shouldReveal = function (x, y) {
		return gs.getItem(x, y)
			|| gs.getObj(x, y, 'Chest')
			|| gs.getObj(x, y, 'CrystalChest')
			|| gs.getObj(x, y, obj => obj.isZoneLine());
	};
	
	for (let x = 0; x < this.numTilesX; x += 1) {
        for (let y = 0; y < this.numTilesY; y += 1) {
			if (shouldReveal(x, y))  {
				gs.getTile(x, y).explored = true;
			}
		}
	}
	this.HUD.miniMap.refresh(true);
};



// DISTANCE_TO_NEAREST_MONSTER:
// Return the tileIndex that is furthest away from any enemy
// ************************************************************************************************
gs.distanceToNearestMonster = function (tileIndex) {
	let npcList = gs.getAllNPCs();
	npcList = npcList.filter(npc => npc.faction === FACTION.HOSTILE);
	npcList.sort((a, b) => util.distance(a.tileIndex, tileIndex) - util.distance(b.tileIndex, tileIndex));
		
	return npcList.length > 0 ? util.distance(npcList[0].tileIndex, tileIndex) : 1000;
};

// GET_SAFEST_INDEX:
// Return the tileIndex that is furthest away from any enemy
// ************************************************************************************************
gs.getSafestIndex = function () {
	var list = [],
		indexList;
	

	
	indexList = this.getAllIndex();
	indexList = indexList.filter(index => gs.isIndexOpen(index) && !gs.isPit(index));
	
	
	indexList.forEach(function (tileIndex) {
		list.push({tileIndex: tileIndex, distance: this.distanceToNearestMonster(tileIndex)}); 
	}, this);
	
	list.sort((a, b) => b.distance - a.distance);
	
	return list.length > 0 ? list[0].tileIndex : null;
};



// COUNT_FLOOR_TILES:
// ************************************************************************************************
gs.countFloorTiles = function () {
	return this.getAllIndex().filter(index => this.getTile(index).type.passable && !this.getTile(index).type.isPit).length;
};