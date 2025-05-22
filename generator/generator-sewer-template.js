/*global gs, game, util, console*/
/*global SewerTunnelsGenerator, vaultGenerator*/
/*jshint esversion: 6*/
'use strict';

/*
// SEWER_TEMPLATE_GENERATOR:
// ************************************************************************************************
function SewerTemplateGenerator() {
	this.name = 'SewerTemplateGenerator';
}
SewerTemplateGenerator.prototype = new SewerTunnelsGenerator();
var sewerTemplateGenerator = new SewerTemplateGenerator();

// X >
sewerTemplateGenerator.connect1VaultTypeNames = [
	'Connect1-01',
	'Connect1-02',
	'Connect1-03',
	'Connect1-04',
];

// < X >
sewerTemplateGenerator.connect2StraightVaultTypeNames = [
	'Connect2Straight-01',
	'Connect2Straight-02',
	'Connect2Straight-03',
	'Connect2Straight-04',
	'Connect2Straight-05',
	'Connect2Straight-06',
];

// ^
// X >
sewerTemplateGenerator.connect2CornerVaultTypeNames = [
	'Connect2Corner-01',
	'Connect2Corner-02',
	'Connect2Corner-03',
	'Connect2Corner-04',
	'Connect2Corner-05',
];

//   ^
// < X >
sewerTemplateGenerator.connect3VaultTypeNames = [
	'Connect3-01',
	'Connect3-02',
	'Connect3-03',
	'Connect3-04',
	'Connect3-05',
	
];

//   ^
// < X >
//   v
sewerTemplateGenerator.connect4VaultTypeNames = [
	'Connect4-01',
	'Connect4-02',
	'Connect4-03',
	'Connect4-04',
	'Connect4-05',
	
];

// GENERATE:
// ************************************************************************************************
SewerTemplateGenerator.prototype.generate = function () {
	this.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	// Layout Map:
	this.NUM_NODES = 3;
	this.NODE_SIZE = 13;
	this.BLANK_PERCENT = 0.5;
	
	this.layoutMap();
	this.processNodes();
	this.placeNodeVaults();
	
	// Trim double doors:
	gs.getAllIndex().forEach(function (tileIndex) {
		// Horizontal:
		if (gs.getObj(tileIndex, 'Door') && gs.getObj(tileIndex.x + 1, tileIndex.y, 'Door')) {
			gs.destroyObject(gs.getObj(tileIndex));
		}
		
		// Vertical:
		if (gs.getObj(tileIndex, 'Door') && gs.getObj(tileIndex.x, tileIndex.y + 1, 'Door')) {
			gs.destroyObject(gs.getObj(tileIndex));
		}
	}, this);
	
	return true;
};

// PROCESS_NODES:
// Sewer template generator just creates a list of nodes and edges
// We need to process this data so that each node knows its connections
// ************************************************************************************************
SewerTemplateGenerator.prototype.processNodes = function () {
	// Add connections data to all nodes:
	for (let x = 0; x < this.NUM_NODES; x += 1) {
		for (let y = 0; y < this.NUM_NODES; y += 1) {
			this.nodes[x][y].connections = {};
		}
	}
	
	// Get connections:
	this.edges.forEach(function (edge) {
		let node1 = this.nodes[edge.node1.x][edge.node1.y],
			node2 = this.nodes[edge.node2.x][edge.node2.y];
			
		if (node1.x > node2.x) {
			node1.connections.left = true;
			node2.connections.right = true;
		}
		
		if (node1.x < node2.x) {
			node1.connections.right = true;
			node2.connections.left = true;
		}
		
		if (node1.y > node2.y) {
			node1.connections.up = true;
			node2.connections.down = true;
		}
		
		if (node1.y < node2.y) {
			node1.connections.down = true;
			node2.connections.up = true;
		}
	}, this);
	
	// Figure out the type and rotation:
	for (let x = 0; x < this.NUM_NODES; x += 1) {
		for (let y = 0; y < this.NUM_NODES; y += 1) {
			let node = this.nodes[x][y];
			
			// CONNECT_4:
			if (node.connections.up && node.connections.down && node.connections.left && node.connections.right) {
				node.vaultType = 'Connect4';
				node.vaultRotation = 0;
			}
			// CONNECT_3:
			// ************************************************************************************
			else if (node.connections.left && node.connections.up && node.connections.right) {
				node.vaultType = 'Connect3';
				node.vaultRotation = 0;
			}
			else if (node.connections.up && node.connections.right && node.connections.down) {
				node.vaultType = 'Connect3';
				node.vaultRotation = 90;
			}
			else if (node.connections.right && node.connections.down && node.connections.left) {
				node.vaultType = 'Connect3';
				node.vaultRotation = 180;
			}
			else if (node.connections.down && node.connections.left && node.connections.up) {
				node.vaultType = 'Connect3';
				node.vaultRotation = 270;
			}
			// CONNECT_2_STRAIGHT:
			// ************************************************************************************
			else if (node.connections.left && node.connections.right) {
				node.vaultType = 'Connect2Straight';
				node.vaultRotation = 0;
			}
			else if (node.connections.up && node.connections.down) {
				node.vaultType = 'Connect2Straight';
				node.vaultRotation = 90;
			}
			// CONNECT_2_CORNER:
			// ************************************************************************************
			else if (node.connections.up && node.connections.right) {
				node.vaultType = 'Connect2Corner';
				node.vaultRotation = 0;
			}
			else if (node.connections.right && node.connections.down) {
				node.vaultType = 'Connect2Corner';
				node.vaultRotation = 90;
			}
			else if (node.connections.down && node.connections.left) {
				node.vaultType = 'Connect2Corner';
				node.vaultRotation = 180;
			}
			else if (node.connections.left && node.connections.up) {
				node.vaultType = 'Connect2Corner';
				node.vaultRotation = 270;
			}
			// CONNECT_1
			// ************************************************************************************
			else if (node.connections.right) {
				node.vaultType = 'Connect1';
				node.vaultRotation = 0;
			}
			else if (node.connections.down) {
				node.vaultType = 'Connect1';
				node.vaultRotation = 90;
			}
			else if (node.connections.left) {
				node.vaultType = 'Connect1';
				node.vaultRotation = 180;
			}
			else if (node.connections.up) {
				node.vaultType = 'Connect1';
				node.vaultRotation = 270;
			}
		}
	}
};

// PLACE_NODE_VAULTS:
// ************************************************************************************************
SewerTemplateGenerator.prototype.placeNodeVaults = function () {
	for (let x = 0; x < this.NUM_NODES; x += 1) {
		for (let y = 0; y < this.NUM_NODES; y += 1) {
			let node = this.nodes[x][y],
				tileIndex = {x: node.x * this.NODE_SIZE, y: node.y * this.NODE_SIZE},
				vaultTypeName;
			
			if (node.vaultType === 'Connect4') {
				vaultTypeName = util.randElem(this.connect4VaultTypeNames);
			}
			else if (node.vaultType === 'Connect3') {
				vaultTypeName = util.randElem(this.connect3VaultTypeNames);
			}
			else if (node.vaultType === 'Connect2Straight') {
				vaultTypeName = util.randElem(this.connect2StraightVaultTypeNames);
			}
			else if (node.vaultType === 'Connect2Corner') {
				vaultTypeName = util.randElem(this.connect2CornerVaultTypeNames);
			}
			else if (node.vaultType === 'Connect1') {
				vaultTypeName = util.randElem(this.connect1VaultTypeNames);
			}
			
			if (vaultTypeName) {
				vaultGenerator.placeVault(tileIndex, {vaultTypeName: vaultTypeName, rotate: node.vaultRotation});
			}

		}
	}
};
*/