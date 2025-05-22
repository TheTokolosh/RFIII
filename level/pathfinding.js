/*global gs, util, console*/
/*global LARGE_WHITE_FONT*/
/*global TILE_SIZE*/
/*global FACTION*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// FIND_UNEXPLORED_TILE_INDEX:
// Flood the entire level testing tileType passability until the nearest unexplored tile is found
// ************************************************************************************************
gs.findUnexploredTileIndex = function (fromTileIndex, unsafeMove = false) {
	var openList = [],
		closedList = [],
		currentTileIndex,
		tryToAddChild,
		isInOpenList,
		isInClosedList,
		indexList,
		i,
		canPassDoor,
		isAllyAtIndex,
		nearestUnexploredTileIndex = null,
		allowDiagonal = gs.pc.movementSpeed > 0;
	
	// IS_GOOD_EXPLORED_TILE:
	// This tile is already explored and has something interesting on it that makes it a good destination:
	let isGoodExploredTile = function (tileIndex) {
		return (gs.getItem(tileIndex) && !gs.getItem(tileIndex).wasDropped) // An item
			|| (gs.getObj(tileIndex, obj => obj.isContainer() && !obj.isOpen)) // A container
			|| gs.pc.race.name === 'Vampire' && gs.pc.currentHp < gs.pc.maxHp && gs.getObj(tileIndex, obj => obj.type.niceName === 'Blood'); // blood for vampire
	};
	
	// IS_GOOD_UNEXPLORED_TILE:
	// This tile is unexplored and is a good destination
	let isGoodUnexploredTile = function (tileIndex) {
		// The tile is unexplored and passable:
		if (!gs.getTile(tileIndex).explored && gs.isPassable(tileIndex)) {
			return true;
		}
		// The tile is unexplored and adjacent to a passable tile (ex. walls or solid objects):
		else if (!gs.getTile(tileIndex).explored && gs.getIndexListAdjacent(tileIndex).find(index => gs.isPassable(index))) {
			return true;
		}
		// The tile contains an unopened door adjacent to a passable and unexplored tile:
		else if (gs.getObj(tileIndex, obj => obj.type.name === 'Door' && !obj.isOpen) && gs.getIndexListAdjacent(tileIndex).find(index => gs.isStaticPassable(index) && !gs.getTile(index).explored)) {
			return true;
		}
		else if (isGoodExploredTile(tileIndex)) {
			return true;
		}
		else {
			return false;
		}
	};
	
	
	
	
	isAllyAtIndex = function (tileIndex) {
		return gs.getChar(tileIndex) && gs.getChar(tileIndex).faction === FACTION.PLAYER;
	};
	
	canPassDoor = function (tileIndex) {
		return gs.getObj(tileIndex, obj => obj.isSimpleDoor())
			&& !gs.getChar(tileIndex); // Need this check in case a character is blocking the door
	};
	
	// IS_VALID_TILE_INDEX:
	// Is this tile valid for adding to the search path
	let isValidTileIndex = function (tileIndex) {
		return (gs.isPassable(tileIndex) || isAllyAtIndex(tileIndex) || canPassDoor(tileIndex) || isGoodExploredTile(tileIndex) || isGoodUnexploredTile(tileIndex))
			&& (gs.isIndexSafe(tileIndex, gs.pc) || unsafeMove)
			&& gs.pc.canWalk(tileIndex)
			&& !gs.isPit(tileIndex);
	};

	
	// TRY_TO_ADD_CHILD:
	tryToAddChild = function (tileIndex, prevTileIndex) {
		if (nearestUnexploredTileIndex) {
			return;
		}

		// Conveyor Belt:
		if (gs.getObj(prevTileIndex, obj => obj.type.niceName === 'Conveyor Belt')) {
			// Standard collision checks:
			if (gs.isInBounds(tileIndex) && isValidTileIndex(tileIndex)) {
				let delta = {x: prevTileIndex.x - tileIndex.x, y: prevTileIndex.y - tileIndex.y};
				let beltDelta = gs.getObj(prevTileIndex).type.delta;
				
				if ((beltDelta.y === 1 && delta.y !== 1) || 
					(beltDelta.x === 1 && delta.x !== 1) || 
					(beltDelta.y === -1 && delta.y !== -1) || 
				   	(beltDelta.x === -1 && delta.x !== -1)) {

					openList.push(tileIndex);
					
					if (isGoodUnexploredTile(tileIndex)) {
						nearestUnexploredTileIndex = tileIndex;
					}
				}

			}
		}
		// Portals:
		else if (gs.getObj(tileIndex, 'Portal') && !isInOpenList(gs.getObj(tileIndex, 'Portal').toTileIndexList[0]) && !isInClosedList(gs.getObj(tileIndex, 'Portal').toTileIndexList[0])) {
			openList.push(gs.getObj(tileIndex, 'Portal').toTileIndexList[0]);
		}
		else if (gs.isInBounds(tileIndex)
				&& isValidTileIndex(tileIndex)
				&& !isInOpenList(tileIndex)
				&& !isInClosedList(tileIndex)) {
			
			openList.push(tileIndex);
			
			if (isGoodUnexploredTile(tileIndex)) {
				nearestUnexploredTileIndex = tileIndex;
			}
        }
	};
	
	// IS_IN_OPEN_LIST:
	isInOpenList = function (tileIndex) {
		return openList.find(function (index) {return index.x === tileIndex.x && index.y === tileIndex.y; });
	};
	
	// IS_IN_CLOSED_LIST:
	isInClosedList = function (tileIndex) {
		return closedList.find(function (index) {return index.x === tileIndex.x && index.y === tileIndex.y; });
	};
	
	
	// Return any items, shrooms or containers that have already been discovered before searching further:
	indexList = this.getAllIndex();
	indexList = indexList.filter(index => gs.getTile(index).explored);
	indexList = indexList.filter(index => isGoodExploredTile(index));
	indexList = indexList.filter(index => gs.isIndexSafe(index, gs.pc));
	indexList = indexList.filter(index => util.distance(index, gs.pc.tileIndex) < 10);
	indexList = indexList.sort((indexA,indexB) => util.distance(indexA, gs.pc.tileIndex) - util.distance(indexB, gs.pc.tileIndex));
	for (i = 0; i < indexList.length; i += 1) {
		// Player must have a valid path to it:
		if (this.pc.getPathTo(indexList[i])) {
			return indexList[i];
		}
	}
	
	
	openList.push(fromTileIndex);
	
	while (openList.length > 0) {
		currentTileIndex = openList.shift();
		closedList.push(currentTileIndex);
		
		// Add adjacent:
		tryToAddChild({x: currentTileIndex.x + 1, y: currentTileIndex.y}, currentTileIndex);
		tryToAddChild({x: currentTileIndex.x - 1, y: currentTileIndex.y}, currentTileIndex);
		tryToAddChild({x: currentTileIndex.x, y: currentTileIndex.y + 1}, currentTileIndex);
		tryToAddChild({x: currentTileIndex.x, y: currentTileIndex.y - 1}, currentTileIndex);
		
		// Add adjacent diagonals:
		if (allowDiagonal) {
			tryToAddChild({x: currentTileIndex.x + 1, y: currentTileIndex.y - 1}, currentTileIndex);
			tryToAddChild({x: currentTileIndex.x - 1, y: currentTileIndex.y - 1}, currentTileIndex);
			tryToAddChild({x: currentTileIndex.x + 1, y: currentTileIndex.y + 1}, currentTileIndex);
			tryToAddChild({x: currentTileIndex.x - 1, y: currentTileIndex.y + 1}, currentTileIndex);
		}
		
		if (nearestUnexploredTileIndex) {
			break;
		}
	}
	
	// unsafe move (trim to first 
	if (unsafeMove && nearestUnexploredTileIndex) {
		
		let path = gs.findPath(fromTileIndex, nearestUnexploredTileIndex, {allowDiagonal: allowDiagonal});
		if (path && path.length > 0) {
			let index = path.indexOf(path.find(index => !gs.isIndexSafe(index, gs.pc)));
			
			if (index > -1 && index + 1 < path.length && gs.isIndexSafe(path[index + 1], gs.pc)) {
				nearestUnexploredTileIndex = path[index + 1];	
			}
			else {
				nearestUnexploredTileIndex = null;
			}
		}
		else {
			nearestUnexploredTileIndex = null;
		}
	}
	return nearestUnexploredTileIndex;
};

// FIND_UNEXPLORED_TILE_INDEX:
// Old Code September-11-2021
// ************************************************************************************************
/*
gs.findUnexploredTileIndex = function (fromTileIndex, unsafeMove = false) {
	var openList = [],
		closedList = [],
		currentTileIndex,
		tryToAddChild,
		isInOpenList,
		isInClosedList,
		isGoodTile,
		indexList,
		i,
		canPassDoor,
		isAllyAtIndex,
		nearestUnexploredTileIndex = null,
		allowDiagonal = gs.pc.movementSpeed > 0;
	
	// IS_GOOD_TILE:
	// A good tile will immediately return as the destination as soon as it is found
	// A good tile that is currently visible will also 
	isGoodTile = function (tileIndex) {
		return (!gs.getTile(tileIndex).explored && gs.isPassable(tileIndex))
			|| (!gs.getTile(tileIndex).explored && gs.getIndexListAdjacent(tileIndex).find(index => gs.isPassable(index)))
			|| (gs.getItem(tileIndex) && !gs.getItem(tileIndex).wasDropped)
			|| gs.getObj(tileIndex, ['HealingShroom', 'EnergyShroom'])
			|| gs.getChar(tileIndex) && gs.getChar(tileIndex).type.name === 'Crate'
			|| gs.getObj(tileIndex, obj => obj.isContainer() && !obj.isOpen)
			|| gs.getObj(tileIndex, obj => obj.type.name === 'Door' && !obj.isOpen);
	};
	
	isAllyAtIndex = function (tileIndex) {
		return gs.getChar(tileIndex) && gs.getChar(tileIndex).faction === FACTION.PLAYER;
	};
	
	canPassDoor = function (tileIndex) {
		return gs.getObj(tileIndex, obj => obj.isSimpleDoor())
			&& !gs.getChar(tileIndex); // Need this check in case a character is blocking the door
	};
	
	let isValidTileIndex = function (tileIndex) {
		return (gs.isPassable(tileIndex) || isAllyAtIndex(tileIndex) || canPassDoor(tileIndex) || isGoodTile(tileIndex))
			&& (gs.isIndexSafe(tileIndex, gs.pc) || unsafeMove)
			&& gs.pc.canWalk(tileIndex)
			&& !gs.isPit(tileIndex);
	};

	
	// TRY_TO_ADD_CHILD:
	tryToAddChild = function (tileIndex, prevTileIndex) {
		if (nearestUnexploredTileIndex) {
			return;
		}

		// Conveyor Belt:
		if (gs.getObj(prevTileIndex, obj => obj.type.niceName === 'Conveyor Belt')) {
			// Standard collision checks:
			if (gs.isInBounds(tileIndex) && isValidTileIndex(tileIndex)) {
				let delta = {x: prevTileIndex.x - tileIndex.x, y: prevTileIndex.y - tileIndex.y};
				let beltDelta = gs.getObj(prevTileIndex).type.delta;
				
				if ((beltDelta.y === 1 && delta.y !== 1) || 
					(beltDelta.x === 1 && delta.x !== 1) || 
					(beltDelta.y === -1 && delta.y !== -1) || 
				   	(beltDelta.x === -1 && delta.x !== -1)) {

					openList.push(tileIndex);
					
					if (isGoodTile(tileIndex)) {
						nearestUnexploredTileIndex = tileIndex;
					}
				}

			}
		}
		// Portals:
		else if (gs.getObj(tileIndex, 'Portal') && !isInOpenList(gs.getObj(tileIndex, 'Portal').toTileIndexList[0]) && !isInClosedList(gs.getObj(tileIndex, 'Portal').toTileIndexList[0])) {
			openList.push(gs.getObj(tileIndex, 'Portal').toTileIndexList[0]);
		}
		else if (gs.isInBounds(tileIndex)
				&& isValidTileIndex(tileIndex)
				&& !isInOpenList(tileIndex)
				&& !isInClosedList(tileIndex)) {
			
			openList.push(tileIndex);
			
			if (isGoodTile(tileIndex)) {
				nearestUnexploredTileIndex = tileIndex;
			}
        }
	};
	
	// IS_IN_OPEN_LIST:
	isInOpenList = function (tileIndex) {
		return openList.find(function (index) {return index.x === tileIndex.x && index.y === tileIndex.y; });
	};
	
	// IS_IN_CLOSED_LIST:
	isInClosedList = function (tileIndex) {
		return closedList.find(function (index) {return index.x === tileIndex.x && index.y === tileIndex.y; });
	};
	
	
	// Return any items, shrooms or containers that have already been discovered before searching further:
	indexList = this.getAllIndex();
	indexList = indexList.filter(index => gs.getTile(index).explored);
	indexList = indexList.filter(index => isGoodTile(index));
	indexList = indexList.filter(index => gs.isIndexSafe(index, gs.pc));
	indexList = indexList.filter(index => util.distance(index, gs.pc.tileIndex) < 10);
	indexList = indexList.sort((indexA,indexB) => util.distance(indexA, gs.pc.tileIndex) - util.distance(indexB, gs.pc.tileIndex));
	for (i = 0; i < indexList.length; i += 1) {
		// Player must have a valid path to it:
		if (this.pc.getPathTo(indexList[i])) {
			return indexList[i];
		}
	}
	
	
	openList.push(fromTileIndex);
	
	while (openList.length > 0) {
		currentTileIndex = openList.shift();
		closedList.push(currentTileIndex);
		
		// Add adjacent:
		tryToAddChild({x: currentTileIndex.x + 1, y: currentTileIndex.y}, currentTileIndex);
		tryToAddChild({x: currentTileIndex.x - 1, y: currentTileIndex.y}, currentTileIndex);
		tryToAddChild({x: currentTileIndex.x, y: currentTileIndex.y + 1}, currentTileIndex);
		tryToAddChild({x: currentTileIndex.x, y: currentTileIndex.y - 1}, currentTileIndex);
		
		// Add adjacent diagonals:
		if (allowDiagonal) {
			tryToAddChild({x: currentTileIndex.x + 1, y: currentTileIndex.y - 1}, currentTileIndex);
			tryToAddChild({x: currentTileIndex.x - 1, y: currentTileIndex.y - 1}, currentTileIndex);
			tryToAddChild({x: currentTileIndex.x + 1, y: currentTileIndex.y + 1}, currentTileIndex);
			tryToAddChild({x: currentTileIndex.x - 1, y: currentTileIndex.y + 1}, currentTileIndex);
		}
		
		if (nearestUnexploredTileIndex) {
			break;
		}
	}
	
	// unsafe move (trim to first 
	if (unsafeMove && nearestUnexploredTileIndex) {
		
		let path = gs.findPath(fromTileIndex, nearestUnexploredTileIndex, {allowDiagonal: allowDiagonal});
		if (path && path.length > 0) {
			let index = path.indexOf(path.find(index => !gs.isIndexSafe(index, gs.pc)));
			
			if (index > -1 && index + 1 < path.length && gs.isIndexSafe(path[index + 1], gs.pc)) {
				nearestUnexploredTileIndex = path[index + 1];	
			}
			else {
				nearestUnexploredTileIndex = null;
			}
		}
		else {
			nearestUnexploredTileIndex = null;
		}
	}
	return nearestUnexploredTileIndex;
};
*/

// FIND_PATH:
// ************************************************************************************************
gs.findPath = function (fromIndex, toIndex, flags) {
	var calculateH,
		calculateG,
		tryToAddChild,
		addChild,
		isInOpenList,
		isInClosedList,
		getNodeFromOpenList,
		popOpenListF,
		openList = [],
		closedList = {},
		loopCount = 0,
		exitState = 0,
		currentNode,
		indexPath = [],
		canWalkFunc,
		passDoors,
		exploredOnly,
		avoidTraps,
		character,
		maxDepth,
		allowDiagonal,
		isValidTileIndex,
		accuracy,
		isAllyAtIndex,
		allowPits;
	
	// Flags:
	flags = flags || {};
	passDoors = flags.passDoors || false;
	canWalkFunc = flags.canWalkFunc || null;
	exploredOnly = flags.exploredOnly || false;
	avoidTraps = flags.avoidTraps || false;
	character = flags.character || null;
	maxDepth = flags.maxDepth || 1000;
	allowDiagonal = flags.allowDiagonal || false;
	isValidTileIndex = flags.isValidTileIndex;
	calculateH = flags.calculateH;
	calculateG = flags.calculateG;
	accuracy = flags.drunk ? 0.25 : 1.0;
	
	if (flags.hasOwnProperty('allowPits')) {
		allowPits = flags.allowPits;
	}
	else {
		allowPits = true;
	}
	
	if (!canWalkFunc) {
		canWalkFunc = function () {
			return true;
		};
	}
	
	isAllyAtIndex = function (tileIndex) {
		return character === gs.pc && gs.getChar(tileIndex) && gs.getChar(tileIndex).faction === FACTION.PLAYER && !gs.getChar(tileIndex).isImmobile;
	};
	
	let isPassableDoor = function (tileIndex) {
		return passDoors
			&& gs.getObj(tileIndex, obj => obj.isSimpleDoor())
			&& !gs.getChar(tileIndex);
	};
	
	if (!isValidTileIndex) {
		isValidTileIndex = function (tileIndex) {
			return (gs.isPassable(tileIndex) || isAllyAtIndex(tileIndex) || isPassableDoor(tileIndex))
				&& (!exploredOnly || gs.getTile(tileIndex).explored)
				&& (!avoidTraps || gs.isIndexSafe(tileIndex, character))
				&& (allowPits || !gs.isPit(tileIndex))
				&& canWalkFunc(tileIndex);
		};
	}
	
	if (!calculateH) {
		calculateH = function (tileIndex) {
			return util.distance(tileIndex, toIndex); 
		};
	}
	
	if (!calculateG) {
		calculateG = function (fromTileIndex, tileIndex) {
			if (fromTileIndex.x === tileIndex.x || fromTileIndex.y === tileIndex.y) {
				return 1;
			}
			else {
				return 1.1;
			}
			
		};
	}
	
	addChild = function (parentNode, tileIndex, hCost) {
		var node;
		
		let gCost = calculateG(parentNode.tileIndex, tileIndex);
		
		// Node is not on the open list so create it:
		if (!isInOpenList(tileIndex)) {
			node = {tileIndex: tileIndex, parentNode: parentNode, g: parentNode.g + gCost, h: hCost, f: parentNode.g + gCost + hCost};
			openList.push(node);
			return node;
		} 
		// Node is on the open list, check if this is a shorter path:
		else {
			node = getNodeFromOpenList(tileIndex);
			if (parentNode.g + gCost + hCost < node.f) {
				node.parentNode = parentNode;
				node.g = parentNode.g + gCost;
				node.f = node.h + node.g;
			}
			return node;
		}
	};
	
	isInOpenList = function (tileIndex) {
		return openList.find(node => util.vectorEqual(node.tileIndex, tileIndex));
	};
	
	isInClosedList = function (tileIndex) {
		//return closedList.find(node => util.vectorEqual(node.tileIndex, tileIndex));
		return closedList.hasOwnProperty(tileIndex.x + ',' + tileIndex.y);
	};
	
	getNodeFromOpenList = function (tileIndex) {
		return openList.find(node => util.vectorEqual(node.tileIndex, tileIndex));
	};
	
	popOpenListF = function () {
		var lowestNode = openList[0],
			lowestIndex = 0,
			i;
		
		
		for (i = 0; i < openList.length; i += 1) {
			if ((openList[i].f < lowestNode.f || openList[i].f === lowestNode.f && openList[i].h < lowestNode.h) && (accuracy === 1 || util.frac() <= accuracy)) {
				lowestNode = openList[i];
				lowestIndex = i;
			}
		}
		
		openList.splice(lowestIndex, 1);
		return lowestNode;
	};
	
	tryToAddChild = function (tileIndex, prevTileIndex) {
		let isFlying = false;
		if (character && character.isFlying) {
			isFlying = true;
		}

		// Conveyor Belt:
		if (gs.getObj(prevTileIndex, obj => obj.type.niceName === 'Conveyor Belt') && !isFlying) {
			// Standard collision checks:
			if (gs.isInBounds(tileIndex) && isValidTileIndex(tileIndex)) {
				let delta = {x: prevTileIndex.x - tileIndex.x, y: prevTileIndex.y - tileIndex.y};
				let beltDelta = gs.getObj(prevTileIndex).type.delta;
				
				if (flags.isSprinting || 
					((beltDelta.y === 1 && delta.y !== 1) || 
					(beltDelta.x === 1 && delta.x !== 1) || 
					(beltDelta.y === -1 && delta.y !== -1) || 
				   	(beltDelta.x === -1 && delta.x !== -1))) {

					addChild(currentNode, {x: tileIndex.x, y: tileIndex.y}, calculateH({x: tileIndex.x, y: tileIndex.y}));
				}

			}
		}
		
		// Portals:
		else if (flags.allowPortals && gs.getObj(tileIndex, 'Portal')) {
			let node = addChild(currentNode, {x: tileIndex.x, y: tileIndex.y}, calculateH({x: tileIndex.x, y: tileIndex.y}));
			
			let portal = gs.getObj(tileIndex, 'Portal');
			addChild(node, {x: portal.toTileIndexList[0].x, y: portal.toTileIndexList[0].y}, calculateH({x: portal.toTileIndexList[0].x, y: portal.toTileIndexList[0].y}));
		}
		// Standard validTile:
		else if (gs.isInBounds(tileIndex) && isValidTileIndex(tileIndex) && !isInClosedList(tileIndex)) {
			addChild(currentNode, {x: tileIndex.x, y: tileIndex.y}, calculateH({x: tileIndex.x, y: tileIndex.y}));
        } 
		// Always add the goal
		else if (util.vectorEqual(tileIndex, toIndex)) {
            addChild(currentNode, {x: tileIndex.x, y: tileIndex.y}, calculateH({x: tileIndex.x, y: tileIndex.y}));
        }
	};
	
	// Quick return if destination is invalid:
	let indexList = gs.getIndexListInRadius(toIndex, 1.5);
	indexList = indexList.filter(index => isValidTileIndex(index));
	if (indexList.length === 0) {
		return null;
	}
	
	// Override for moving against conveyor belts:
	let fromObj = gs.getObj(fromIndex);
	let toObj = gs.getObj(toIndex);
	if (fromObj && fromObj.type.niceName === 'Conveyor Belt' && toObj && toObj.type.niceName === 'Conveyor Belt') {
		let delta = {x: toIndex.x - fromIndex.x, y: toIndex.y - fromIndex.y};
		// We are only trying to move one tile:
		if (util.distance(fromIndex, toIndex) < 1.5) {
			if (toObj.type.name === 'DownConveyorBelt' && util.vectorEqual(delta, {x: 0, y: -1})) {
				return [toIndex];
			}
			
			if (toObj.type.name === 'UpConveyorBelt' && util.vectorEqual(delta, {x: 0, y: 1})) {
				return [toIndex];
			}
			
			if (toObj.type.name === 'RightConveyorBelt' && util.vectorEqual(delta, {x: -1, y: 0})) {
				return [toIndex];
			}
			
			if (toObj.type.name === 'LeftConveyorBelt' && util.vectorEqual(delta, {x: 1, y: 0})) {
				return [toIndex];
			}
		}
	}
	
	// Push first node:
	openList.push({tileIndex: fromIndex, parentNode: null, g: 0, h: calculateH(fromIndex), f: calculateH(fromIndex)});
	while (true) {
		// No path exists:
		if (openList.length === 0) {
			exitState = -1;
			break;
		}
		
		// Loop count exceeded:
		if (loopCount > maxDepth) {
			exitState = -2;
			break;
		}
		
		currentNode = popOpenListF();
		
		if (gs.debugProperties.logPathFinding) {
			gs.createText(currentNode.tileIndex.x * TILE_SIZE, currentNode.tileIndex.y * TILE_SIZE, '' + loopCount, 'PixelFont6-White', 12);
		}

		// Found goal:
		if (util.vectorEqual(currentNode.tileIndex, toIndex)) { 
			exitState = 1;
			break;
		}
		
		if (gs.getObj(currentNode.tileIndex, 'Portal') && !util.vectorEqual(currentNode.tileIndex, fromIndex)) {
			// Pass (don't expand on portals)
		}
		else {
			// Add adjacent:
			tryToAddChild({x: currentNode.tileIndex.x + 1, y: currentNode.tileIndex.y}, currentNode.tileIndex);
			tryToAddChild({x: currentNode.tileIndex.x - 1, y: currentNode.tileIndex.y}, currentNode.tileIndex);
			tryToAddChild({x: currentNode.tileIndex.x, y: currentNode.tileIndex.y + 1}, currentNode.tileIndex);
			tryToAddChild({x: currentNode.tileIndex.x, y: currentNode.tileIndex.y - 1}, currentNode.tileIndex);

			if (allowDiagonal) {
				tryToAddChild({x: currentNode.tileIndex.x + 1, y: currentNode.tileIndex.y - 1}, currentNode.tileIndex);
				tryToAddChild({x: currentNode.tileIndex.x - 1, y: currentNode.tileIndex.y - 1}, currentNode.tileIndex);
				tryToAddChild({x: currentNode.tileIndex.x + 1, y: currentNode.tileIndex.y + 1}, currentNode.tileIndex);
				tryToAddChild({x: currentNode.tileIndex.x - 1, y: currentNode.tileIndex.y + 1}, currentNode.tileIndex);
			}
		}
		
		//closedList.push(currentNode);
		closedList[currentNode.tileIndex.x + ',' + currentNode.tileIndex.y] = 1;
		loopCount += 1;
	}
	
	//console.log('loopCount: ' + loopCount);
	//console.log('closedList: ' + closedList.length);
	
	if (exitState === -1 || exitState === -2) {
		return null;
	} 
	else if (exitState === 1) {
		// Start at goal node and work backwords:
		while (currentNode.parentNode) {
			indexPath.push(currentNode.tileIndex);
			currentNode = currentNode.parentNode;
		}
		
		//console.log('pathLength: ' + indexPath.length);
		return indexPath;
	}
};