/*global game, console, util*/
/*global VAULT_PLACEMENT*/
/*jshint esversion: 6, loopfunc: true*/
'use strict';



let ORIENTATION = [
	// ONE_WAY:
	{frame: 2, placementType: VAULT_PLACEMENT.ONE_WAY, angle: 0,		left: 0, right: 0, up: 0, down: 1},
	{frame: 4, placementType: VAULT_PLACEMENT.ONE_WAY, angle: 90,		left: 1, right: 0, up: 0, down: 0},
	{frame: 6, placementType: VAULT_PLACEMENT.ONE_WAY, angle: 180,		left: 0, right: 0, up: 1, down: 0},
	{frame: 0, placementType: VAULT_PLACEMENT.ONE_WAY, angle: 270,		left: 0, right: 1, up: 0, down: 0},
	
	// STRAIGHT:
	{frame: 32, placementType: VAULT_PLACEMENT.STRAIGHT, angle: 0,		left: 1, right: 1, up: 0, down: 0},
	{frame: 34, placementType: VAULT_PLACEMENT.STRAIGHT, angle: 90,		left: 0, right: 0, up: 1, down: 1},
	
	// CORNER:
	{frame: 64, placementType: VAULT_PLACEMENT.CORNER, angle: 0,		left: 0, right: 1, up: 1, down: 0},
	{frame: 66, placementType: VAULT_PLACEMENT.CORNER, angle: 90,		left: 0, right: 1, up: 0, down: 1},
	{frame: 68, placementType: VAULT_PLACEMENT.CORNER, angle: 180,		left: 1, right: 0, up: 0, down: 1},
	{frame: 70, placementType: VAULT_PLACEMENT.CORNER, angle: 270,		left: 1, right: 0, up: 1, down: 0},
	
	// THREE_WAY:
	{frame: 100, placementType: VAULT_PLACEMENT.THREE_WAY, angle: 0,	left: 1, right: 1, up: 0, down: 1},
	{frame: 102, placementType: VAULT_PLACEMENT.THREE_WAY, angle: 90,	left: 1, right: 0, up: 1, down: 1},
	{frame: 96, placementType: VAULT_PLACEMENT.THREE_WAY, angle: 180,	left: 1, right: 1, up: 1, down: 0},
	{frame: 98, placementType: VAULT_PLACEMENT.THREE_WAY, angle: 270,	left: 0, right: 1, up: 1, down: 1},
	
	
	
	// FOUR_WAY:
	{frame: 128, placementType: VAULT_PLACEMENT.FOUR_WAY, angle: 0,		left: 1, right: 1, up: 1, down: 1},
];

// CONSTRUCTOR: CONNECTION_MAP:
// ************************************************************************************************
function ConnectionMap (numNodesX, numNodesY) {
	// Properties:
	this.numNodesX = numNodesX;
	this.numNodesY = numNodesY;
	
	// Create 2D nodes map:
	this.nodes = [];
	for (let x = 0; x < numNodesX; x += 1) {
		this.nodes[x] = [];
		for (let y = 0; y < numNodesY; y += 1) {
			this.nodes[x][y] = new ConnectionMapNode(x, y);
		}
	}
}

// LOAD_RANDOM_MAP:
// ************************************************************************************************
ConnectionMap.prototype.loadRandomMap = function (connectionMapList) {
	let mapIndex = util.randElem(connectionMapList);
	
	this.data = mapIndex;
	
	let data = game.cache.getJSON('ConnectionMaps');
	
	for (let x = 0; x < this.numNodesX; x += 1) {
		for (let y = 0; y < this.numNodesY; y += 1) {
			let frame = data.layers[0].data[(y + mapIndex.y) * data.width + (x + mapIndex.x)] - 1;
			
			// No node:
			if (frame === 130) {
				this.nodes[x][y].isEmpty = true;
				continue;
			}
			
			// Pass on simple fills:
			if (frame === 160) {
				this.nodes[x][y].isEmpty = false;
				continue;
			}
			
			// Determine connections:
			let orientation = ORIENTATION.find(e => e.frame === frame);
			
			if (!orientation) {
				throw 'ERROR [ConnectionMap.loadMap] - failed to load from ConnectionMaps.json at x:' + mapIndex.x + ', y:' + mapIndex.y;
			}
			
			this.nodes[x][y].orientation = orientation;
		}
	}
};

// GET_NODE_LIST:
// Returns a list of only non-empty nodes
// ************************************************************************************************
ConnectionMap.prototype.getNodeList = function () {
	let nodeList = [];
	
	for (let x = 0; x < this.numNodesX; x += 1) {
		for (let y = 0; y < this.numNodesY; y += 1) {
			if (!this.nodes[x][y].isEmpty) {
				nodeList.push(this.nodes[x][y]);
			}
		}
	}
	
	return nodeList;
};

// IS_NODE_ADJACENT_TO:
// ************************************************************************************************
ConnectionMap.prototype.isNodeAdjacentTo = function (node, pred) {
	if (node.orientation.right && node.x + 1 < this.numNodesX && pred(this.nodes[node.x + 1][node.y])) {
		return true;
	}
	if (node.orientation.down && node.y + 1 < this.numNodesY && pred(this.nodes[node.x][node.y + 1])) {
		return true;
	}
	if (node.orientation.left && node.x - 1 >= 0 && pred(this.nodes[node.x - 1][node.y])) {
		return true;
	}
	if (node.orientation.up && node.y - 1 >= 0 && pred(this.nodes[node.x][node.y - 1])) {
		return true;
	}
	
	return false;	
};

// REFLECT_MAP:
// ************************************************************************************************
ConnectionMap.prototype.reflectMap = function () {	
	// Reverse Tile Row:
	for (let y = 0; y < this.numNodesY; y += 1) {
		for (let x = 0; x < Math.floor(this.numNodesX / 2); x += 1) {
			let temp = this.nodes[x][y];
			
			this.nodes[x][y] = this.nodes[this.numNodesX - x - 1][y];
			this.nodes[x][y].x = x;
			this.nodes[x][y].y = y;
			
			this.nodes[this.numNodesX - x - 1][y] = temp;
			this.nodes[this.numNodesX - x - 1][y].x = this.numNodesX - x - 1;
			this.nodes[this.numNodesX - x - 1][y].y = y;
		}
	}
	
	// Reflect individual nodes:
	for (let x = 0; x < this.numNodesX; x += 1) {
		for (let y = 0; y < this.numNodesY; y += 1) {
			if (!this.nodes[x][y].isEmpty) {
				this.nodes[x][y].reflect();
			}
		}
	}
};

// ROTATE_MAP:
// ************************************************************************************************
ConnectionMap.prototype.rotateMap = function (angle) {
	if (angle === 0) {
		return;
	}
	else if (angle === 90) {
		this.rotateMap90();
	}
	else if (angle === 180) {
		this.rotateMap90();
		this.rotateMap90();
	}
	else if (angle === 270) {
		this.rotateMap90();
		this.rotateMap90();
		this.rotateMap90();
	}
	else {
		throw 'ERROR [ConnectionMap.rotateMap] - invalid angle: ' + angle;
	}
};

// ROTATE_MAP_90:
// ************************************************************************************************
ConnectionMap.prototype.rotateMap90 = function () {
	// Rotate the node map:
	let newNodes = [];
	for (let x = 0; x < this.numNodesY; x += 1) {
		newNodes[x] = [];
		for (let y = 0; y < this.numNodesX; y += 1) {		
			newNodes[x][y] = this.nodes[y][x];
			newNodes[x][y].x = y;
			newNodes[x][y].y = x;
		}
	}
	this.nodes = newNodes;
	
	// Rotate the numNodes:
	let newNumNodesX = this.numNodesY;
	let newNumNodesY = this.numNodesX;
	this.numNodesX = newNumNodesX;
	this.numNodesY = newNumNodesY;
	
	// Reverse Tile Row:
	for (let y = 0; y < this.numNodesY; y += 1) {
		for (let x = 0; x < Math.floor(this.numNodesX / 2); x += 1) {
			let temp = this.nodes[x][y];
			
			this.nodes[x][y] = this.nodes[this.numNodesX - x - 1][y];
			this.nodes[x][y].x = x;
			this.nodes[x][y].y = y;
			
			this.nodes[this.numNodesX - x - 1][y] = temp;
			this.nodes[this.numNodesX - x - 1][y].x = this.numNodesX - x - 1;
			this.nodes[this.numNodesX - x - 1][y].y = y;
		}
	}
	
	// Rotate individual nodes:
	for (let x = 0; x < this.numNodesX; x += 1) {
		for (let y = 0; y < this.numNodesY; y += 1) {
			if (!this.nodes[x][y].isEmpty) {
				this.nodes[x][y].rotate();
			}
		}
	}
};


// CONSTRUCTOR: CONNECTION_MAP_NODE:
// ************************************************************************************************
function ConnectionMapNode (x, y) {
	this.x = x;
	this.y = y;
	this.isEmpty = false;
	this.orientation = null;
}

// REFLECT:
// ************************************************************************************************
ConnectionMapNode.prototype.reflect = function () {
	if (this.orientation) {
		this.orientation = ORIENTATION.find(function (orientation) {
			return orientation.placementType === this.orientation.placementType
				&& orientation.right === this.orientation.left
				&& orientation.left  === this.orientation.right
				&& orientation.up === this.orientation.up
				&& orientation.down === this.orientation.down;
		}, this);
	}
};

// ROTATE:
// ************************************************************************************************
ConnectionMapNode.prototype.rotate = function () {
	if (this.orientation) {
		// Four-Way: No rotations:
		if (this.orientation.placementType === VAULT_PLACEMENT.FOUR_WAY) {
			return;	
		}
		// Straight: Only two rotations:
		else if (this.orientation.placementType === VAULT_PLACEMENT.STRAIGHT) {
			this.orientation = ORIENTATION.find(e => e.placementType === VAULT_PLACEMENT.STRAIGHT && e.angle !== this.orientation.angle);
		}
		// Remaining: 4-Rotation:
		else {	
			let newAngle = this.orientation.angle === 270 ? 0 : this.orientation.angle + 90;
			this.orientation = ORIENTATION.find(e => e.placementType === this.orientation.placementType && e.angle === newAngle);
		}
	}
};