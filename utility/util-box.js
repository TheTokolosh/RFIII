/*global gs, util*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

// CONSTURCTOR:
// ************************************************************************************************
function Box (startX, startY, endX, endY) {
	this.init(startX, startY, endX, endY);
}

// INIT:
// ************************************************************************************************
Box.prototype.init = function (startX, startY, endX, endY) {
	// Start:
	this.startX = startX;
	this.startY = startY;
	this.startTileIndex = {x: startX, y: startY};
	
	// End:
	this.endX = endX;
	this.endY = endY;
	this.endTileIndex = {x: endX, y: endY};
	
	// Size:
	this.width = endX - startX;
	this.height = endY - startY;
	
	// Center:
	this.centerX = startX + Math.floor(this.width / 2);
	this.centerY = startY + Math.floor(this.height / 2);
	this.centerTileIndex = {x: this.centerX, y: this.centerY};
};

// CREATE_BOX:
// ************************************************************************************************
util.createBox = function (startX, startY, endX, endY) {
	return new Box(startX, startY, endX, endY);
};

// CREATE_BOX_SET:
// ************************************************************************************************
util.createBoxSet = function (setStartX, setStartY, width, height, offsetX, offsetY, numX, numY) {
	let list = [];
	
	for (let y = 0; y < numY; y += 1) {
		for (let x = 0; x < numX; x += 1) {
		
			let startX = setStartX + x * (width + offsetX);
			let startY = setStartY + y * (height + offsetY);
			
			list.push(this.createBox(startX, startY, startX + width, startY + height));
		}
	}
	
	return list;
};

// SPLIT_TALL_BOX:
// Splits the box along its tall axis into two subBoxes and returns [subBox1, subBox2]
// ************************************************************************************************
util.splitTallBox = function (box) {
	let subBox1 = util.createBox(box.startX, box.startY, box.endX, box.centerY);
	let subBox2 = util.createBox(box.startX, box.centerY, box.endX, box.endY);
	return [subBox1, subBox2];
};

// SPLIT_WIDE_BOX:
// Splits the box along its tall axis into two subBoxes and returns [subBox1, subBox2]
// ************************************************************************************************
util.splitWideBox = function (box) {
	let subBox1 = util.createBox(box.startX, box.startY, box.centerX, box.endY);
	let subBox2 = util.createBox(box.centerX, box.startY, box.endX, box.endY);
	return [subBox1, subBox2];
};

// BOX_TYPE:
// ************************************************************************************************
util.boxType = function (box) {
	if (Math.min(box.width, box.height) / Math.max(box.width, box.height) > 0.8) {
		return 'SQUARE';
	}
	else if (box.width > box.height) {
		return 'WIDE';
	}
	else {
		return 'TALL';
	}
};

// BOX_TILE_AREA:
// ************************************************************************************************
util.boxTileArea = function (box) {
	return box.width * box.height;
};

// INTERSECT_BOX:
// Returns the box that is the intersection of both boxes:
// ************************************************************************************************
util.intersectBox = function (box1, box2) {
	var minX = 1000, minY = 10000, maxX = -1, maxY = -1;
	
	gs.getIndexListInBox(box1).forEach(function (tileIndex) {
		if (util.isInBox(tileIndex, box2)) {
			minX = Math.min(minX, tileIndex.x);
			minY = Math.min(minY, tileIndex.y);
			maxX = Math.max(maxX, tileIndex.x);
			maxY = Math.max(maxY, tileIndex.y);
		}
	}, this);
	
	if (minX < maxX && minY < maxY) {
		return util.createBox(minX, minY, maxX + 1, maxY + 1);
	}
	else {
		return null;
	}
};

// IS_IN_BOX:
// Returns true if the tileIndex is inside the box:
// Remember that boxes are lower bounds inclusive and upper bounds exclusive
// ************************************************************************************************
util.isInBox = function (tileIndex, box) {
	return tileIndex.x >= box.startX
		&& tileIndex.y >= box.startY
		&& tileIndex.x < box.endX
		&& tileIndex.y < box.endY;
};

// GET_BOUNDING_BOX:
// ************************************************************************************************
util.getBoundingBox = function (indexList) {
	var minX = NUM_TILES_X,
		minY = NUM_TILES_Y,
		maxX = 0,
		maxY = 0;
	
	indexList.forEach(function (index) {
		minX = Math.min(minX, index.x);
		minY = Math.min(minY, index.y);
		maxX = Math.max(maxX, index.x);
		maxY = Math.max(maxY, index.y);
	}, this);
	
	return util.createBox(minX, minY, maxX + 1, maxY + 1);
};

// EDGE_BOX_INDEX_LIST:
// Returns a list of tileIndices that are on the edges of the box:
// ************************************************************************************************
util.edgeBoxIndexList = function (box) {
	var indexList = [];
	
	gs.getIndexListInBox(box).forEach(function (tileIndex) {
		if (tileIndex.x === box.startX || tileIndex.y === box.startY || tileIndex.x === box.endX - 1 || tileIndex.y === box.endY - 1) {
			indexList.push({x: tileIndex.x, y: tileIndex.y});
		}
	}, this);
	
	return indexList;
};

// INNER_BOX:
// Returns the box that is 1 smaller on all edges
// ************************************************************************************************
util.innerBox = function (box, offset = 1) {
	return util.createBox(box.startX + offset, box.startY + offset, box.endX - offset, box.endY - offset);
};
