/*global gs, console, util*/
/*global EXCEPTION_TYPE*/
/*global NUM_TILES_X, NUM_TILES_Y*/
/*jshint laxbreak: true, esversion: 6*/

'use strict';

var levelVerification = {};

// RUN:
// ************************************************************************************************
levelVerification.run = function () {
	if (gs.zoneName === 'TestZone') {
		return;
	}
	
	// Open Edge Tiles:
	if (this.isEdgeTileOpen()) {
		throw {type: EXCEPTION_TYPE.LEVEL_GENERATION, text: 'LEVEL_VERIFICATION - Open Edge Tile'};
	}
	
	// Connectivity:
	if (gs.currentGenerator.name !== 'LevelGeneratorStatic' && gs.currentGenerator.name !== 'LevelGeneratorBossPortals' && this.isDisconnected()) {
		throw {type: EXCEPTION_TYPE.LEVEL_GENERATION, text: 'LEVEL_VERIFICATION - Disconnected Level'};
	}
	
	
};

// IS_EDGE_TILE_OPEN:
// ************************************************************************************************
levelVerification.isEdgeTileOpen = function () {
	let indexList = gs.getAllIndex();
	indexList = indexList.filter(idx => idx.x === 0 || idx.y === 0 || idx.x === NUM_TILES_X - 1 || idx.y === NUM_TILES_Y - 1);
	
	if (indexList.find(index => gs.isPassable(index))) {
		return true;
	}
	
	return false;
};

// IS_DISCONNECTED:
// Verify that all areas of the level are connected
// ************************************************************************************************
levelVerification.isDisconnected = function () {
	var tileIndex, floodList, indexList, testFunc;
	
	testFunc = function (index) {
		return gs.isStaticPassable(index)
			|| gs.getObj(index, obj => obj.isDoor())
			|| gs.isDropWall(index);
	};
	
	// Flood from a passable point:
	tileIndex = gs.getPassableIndexInBox(0, 0, gs.numTilesX, gs.numTilesY);
	floodList = this.getIndexListInFlood(tileIndex);
	//gs.getIndexListInFlood(tileIndex, testFunc, 1000, true);
	
	// Get list of all passable index:
	indexList = gs.getAllIndex();
	indexList = indexList.filter(index => testFunc(index));
	
	if (floodList.length !== indexList.length) {
		// Color missing tiles:
		indexList.forEach(function (index) {
			if (!floodList.find(idx => util.vectorEqual(idx, index))) {
				gs.getTile(index).color = '#ff0000';
			}
		}, this);
		
		return true;
	}
	
	return false;
};

// GET_INDEX_IN_FLOOD:
// ************************************************************************************************
levelVerification.getIndexListInFlood = function (fromTileIndex) {
	let openList = [],
		closedList = [];
	 
	// IS_IN_OPEN_LIST:
	let isInOpenList = function (tileIndex) {
		return openList.find(function (index) {return index.x === tileIndex.x && index.y === tileIndex.y; });
	};
	
	// IS_IN_CLOSED_LIST:
	let isInClosedList = function (tileIndex) {
		return closedList.find(function (index) {return index.x === tileIndex.x && index.y === tileIndex.y; });
	};
	
	// TRY_TO_ADD_CHILD:
	let tryToAddChild = function (tileIndex) {	
		// Portals:
		let portal = gs.getObj(tileIndex, 'Portal');
		if (portal && !isInOpenList(portal.toTileIndexList[0]) && !isInClosedList(portal.toTileIndexList[0])) {
			openList.push(portal.toTileIndexList[0]);
		}
		// Tiles:
		else if ((gs.isStaticPassable(tileIndex) || gs.getObj(tileIndex, obj => obj.isDoor()) || gs.isDropWall(tileIndex)) && !isInOpenList(tileIndex) && !isInClosedList(tileIndex)) {
			openList.push(tileIndex);
        }
	};
	
	
	openList.push(fromTileIndex);
	
	while (openList.length > 0) {
		let currentTileIndex = openList.shift();
		closedList.push(currentTileIndex);
		
		// Add adjacent:
		tryToAddChild({x: currentTileIndex.x + 1, y: currentTileIndex.y});
		tryToAddChild({x: currentTileIndex.x - 1, y: currentTileIndex.y});
		tryToAddChild({x: currentTileIndex.x, y: currentTileIndex.y + 1});
		tryToAddChild({x: currentTileIndex.x, y: currentTileIndex.y - 1});
		
		// Add adjacent diagonals:
		tryToAddChild({x: currentTileIndex.x + 1, y: currentTileIndex.y - 1});
		tryToAddChild({x: currentTileIndex.x - 1, y: currentTileIndex.y - 1});
		tryToAddChild({x: currentTileIndex.x + 1, y: currentTileIndex.y + 1});
		tryToAddChild({x: currentTileIndex.x - 1, y: currentTileIndex.y + 1});
	}
	
	return closedList;
};
