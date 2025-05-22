/*global gs, util, game*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// IS_STRAIGHT:
// Are the two tileIndices on either an orthogonal or diagonal straight line
// ************************************************************************************************
util.isStraight = function (t1, t2) {
	return t1.x === t2.x || t1.y === t2.y || Math.abs(t1.x - t2.x) === Math.abs(t1.y - t2.y);
};

// GET_8_WAY_VECTOR:
// ************************************************************************************************
util.get8WayVector = function (fromTileIndex, toTileIndex) {
	let angle = game.math.angleBetween(fromTileIndex.x, fromTileIndex.y, toTileIndex.x, toTileIndex.y) * 180 / Math.PI;

	if (angle > -26 && angle <= 26) {
		return {x: 1, y: 0};
	}
	if (angle > 26 && angle <= 63) {
		return {x: 1, y: 1};
	}
	if (angle > 63 && angle <= 116) {
		return {x: 0, y: 1};
	}
	if (angle > 116 && angle <= 153) {
		return {x: -1, y: 1};
	}
	if (angle > 153 || angle <= -153) {
		return {x: -1, y: 0};
	}
	if (angle > -153 && angle <= -116) {
		return {x: -1, y: -1};
	}
	if (angle > -116 && angle <= -63) {
		return {x: 0, y: -1};
	}
	if (angle > -63 && angle <= -26) {
		return {x: 1, y: -1};
	}
	/*
	return {x: (toTileIndex.x - fromTileIndex.x) / (Math.abs(toTileIndex.x - fromTileIndex.x) || 1),
			y: (toTileIndex.y - fromTileIndex.y) / (Math.abs(toTileIndex.y - fromTileIndex.y) || 1)};
			*/
};

// IS_CARDINALLY_ADJACENT:
// ************************************************************************************************
util.isCardinallyAdjacent = function (v1, v2) {
	return util.distance(v1, v2) === 1.0;
};

// IS_DIAGONALLY_ADJACENT:
// ************************************************************************************************
util.isDiagonallyAdjacent = function (v1, v2) {
	return v1.x === v2.x - 1 && v1.y === v2.y - 1
		|| v1.x === v2.x - 1 && v1.y === v2.y + 1
		|| v1.x === v2.x + 1 && v1.y === v2.y - 1
		|| v1.x === v2.x + 1 && v1.y === v2.y + 1;
};

// VECTOR_EQUAL:
// ************************************************************************************************
util.vectorEqual = function (v1, v2) {
	return v1.x === v2.x && v1.y === v2.y;
};

// DISTANCE:
// ************************************************************************************************
util.distance = function (v1, v2) {
    return game.math.distance(v1.x, v1.y, v2.x, v2.y);
};

// SQ_DISTANCE:
// ************************************************************************************************
util.sqDistance = function (v1, v2) {
	return Math.max(Math.abs(v1.x - v2.x), Math.abs(v1.y - v2.y));
};

// MIN_SQ_DISTANCE:
// ************************************************************************************************
util.minSqDistance = function (v1, v2) {
	return Math.min(Math.abs(v1.x - v2.x), Math.abs(v1.y - v2.y));
};


// GET_CARDINAL_VECTOR:
// This function returns a vector representing a cardinal direction
// [1, 0], [-1, 0], [0, 1], [0, -1]
// This represents the nearest cardinal direction between fromTileIndex and toTileIndex
// ************************************************************************************************
util.getCardinalVector = function (fromTileIndex, toTileIndex) {
	if (util.vectorEqual(fromTileIndex, toTileIndex)) {
		return null;
	}
	
	// X-axis is longest:
	if (Math.abs(fromTileIndex.x - toTileIndex.x) > Math.abs(fromTileIndex.y - toTileIndex.y)) {
		return {x: fromTileIndex.x < toTileIndex.x ? 1 : -1, y: 0};
	} 
	// Y-axis is longest:
	else {
		return {x: 0, y: fromTileIndex.y < toTileIndex.y ? 1 : -1};
	}
};


// GET_NORMAL_FROM_ANGLE:
// ************************************************************************************************
util.getNormalFromAngle = function (angle) {
	angle = angle * Math.PI / 180;
	return {x: Math.sin(angle), y: Math.cos(angle)};
};

// NORMAL:
// ************************************************************************************************
util.normal = function (startPosition, endPosition) {
    var length = game.math.distance(startPosition.x, startPosition.y, endPosition.x, endPosition.y);
    
    return {x: (endPosition.x - startPosition.x) / length,
            y: (endPosition.y - startPosition.y) / length};
};

// GET_ORTHO_VECTOR:
// ************************************************************************************************
util.getOrthoVector = function (vector) {
	return {x: -vector.y, y: vector.x};
};


// ANGLE_TO_FACE:
// ************************************************************************************************
util.angleToFace = function (fromPos, toPos) {
    return (game.math.angleBetween(fromPos.x, -fromPos.y, toPos.x, -toPos.y)) * 180 / Math.PI + 135;
};

// NEAREST_TO:
// ************************************************************************************************
util.nearestTo = function (tileIndex, indexList) {
	if (indexList.length === 0) {
		throw 'ERROR [util.nearestTo] - empty indexlist';
	}
	
	indexList.sort((a, b) => util.distance(tileIndex, a) - util.distance(tileIndex, b));
	return indexList[0];
};

// FURTHEST_FROM:
// ************************************************************************************************
util.furthestFrom = function (tileIndex, indexList) {
	if (indexList.length === 0) {
		throw 'ERROR [util.nearestTo] - empty indexlist';
	}
	
	indexList.sort((a, b) => util.distance(tileIndex, b) - util.distance(tileIndex, a));
	return indexList[0];
};

util.nearestTileIndices = function (indexList1, indexList2) {
	let nearestIndex1, nearestIndex2, nearestDistance = 1000;
	
	for (let i = 0; i < indexList1.length; i += 1) {
		for (let j = 0; j < indexList2.length; j += 1) {
			if (util.distance(indexList1[i], indexList2[j]) < nearestDistance) {
				nearestIndex1 = indexList1[i];
				nearestIndex2 = indexList2[j];
				nearestDistance = util.distance(indexList1[i], indexList2[j]);
			}
		}
	}
	
	return [nearestIndex1, nearestIndex2];
};