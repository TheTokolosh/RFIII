/*global game, util, gs, console*/
/*global LevelGeneratorTunnels, LevelGeneratorUtils, ConnectionMap, DungeonGenerator, AreaGeneratorVault*/
/*global VAULT_CONTENT, VAULT_PLACEMENT, FEATURE_TYPE*/
/*global NUM_TILES_X, NUM_TILES_Y, CONNECTION_MAP_LIST_4x4*/
/*global SPAWN_GAS_VENTS_PERCENT, MAX_GAS_VENTS, MAX_GAS_VENTS*/
'use strict';

let LevelGeneratorLiquidTunnels = Object.create(LevelGeneratorTunnels);

// GENERATE:
// ************************************************************************************************
LevelGeneratorLiquidTunnels.generate = function () {
	this.initNumVaults();
	this.numAestheticVaults = util.randInt(0, 3);
	
	this.roomAreaList = [];
	
	// Connection Map:
	this.createConnectionMap();
	
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	// Tunnel Vault Generation:
	this.majorVaultArea = this.placeMajorVault();
	this.placeTunnelVaults();
	this.connectTunnelVaults();
	this.floodTunnelVaults();
	
	// Side Vault Generation:
	this.placeStairsVaults('DownStairs');
	this.placeStairsVaults('UpStairs');
	this.placeSideVaults(1.0);
	
	gs.areaList = this.roomAreaList;
};

// FLOOD_TUNNEL_VAULTS:
// ************************************************************************************************
LevelGeneratorLiquidTunnels.floodTunnelVaults = function () {
	let liquidTileType = gs.tileTypes[util.randElem(this.liquidTypeList)];
	
	if (this.majorVaultArea) {
		AreaGeneratorVault.placeLiquid(this.majorVaultArea, liquidTileType);
		this.majorVaultArea.hasLiquid = true;
		this.majorVaultArea.hasWater = true;
	}
	
	// Place initial water in random aesthetic node:
	let nodeList = this.connectionMap.getNodeList();
	nodeList = nodeList.filter(node => !node.hasWater);
	nodeList = nodeList.filter(node => !node.isMajorVault);
	nodeList = nodeList.filter(node => node.area.vaultType.contentType === VAULT_CONTENT.AESTHETIC);
	nodeList = nodeList.filter(node => node.area.hallHookTileIndexList.length > 0);
	util.randElem(nodeList).hasWater = true;
	
	// Try to place some more adjacent water in aesthetic nodes:
	for (let i = 0; i < 10; i += 1) {
		let nodeList = this.connectionMap.getNodeList();
		nodeList = nodeList.filter(node => !node.hasWater);
		nodeList = nodeList.filter(node => !node.isMajorVault);
		nodeList = nodeList.filter(node => node.area && node.area.vaultType.contentType === VAULT_CONTENT.AESTHETIC);
		nodeList = nodeList.filter(node => node.area.hallHookTileIndexList.length > 0);
		nodeList = nodeList.filter(node => this.connectionMap.isNodeAdjacentTo(node, adjNode => adjNode.hasWater));
		
		if (nodeList.length > 0) {
			util.randElem(nodeList).hasWater = true;
		}
	}
	
	// Dressing Water:
	for (let x = 0; x < this.NUM_NODES; x += 1) {
		for (let y = 0; y < this.NUM_NODES; y += 1) {
			if (this.nodes[x][y].hasWater) {
				AreaGeneratorVault.placeLiquid(this.nodes[x][y].area, liquidTileType);
			}
		}
	}
	
	// Find any non-aesthetic vaults that contain water:
	nodeList = this.connectionMap.getNodeList();
	nodeList.forEach(function (node) {
		if (node.area.vaultType.hasWater || node.area.hasWater) {
			node.hasWater = true;
		}
	}, this);
	
	// We need to store the lines and only create them at the end.
	// This keeps the nearestTileIndices clean.
	let waterLineList = [];
	
	// Function: ConnectAreas
	let connectNodes = function (node1, node2) {
		if (node1.area.hallHookTileIndexList.length > 0 && node2.area.hallHookTileIndexList.length > 0) {
			/*
			let area1Hooks = node1.area.hallHookTileIndexList.filter(tileIndex => tileIndex.x === node1.centerTileIndex.x || tileIndex.y === node1.centerTileIndex.y);
			let tileIndex1 = util.nearestTo(node2.centerTileIndex, area1Hooks);
			
			let area2Hooks = node2.area.hallHookTileIndexList.filter(tileIndex => tileIndex.x === node2.centerTileIndex.x || tileIndex.y === node2.centerTileIndex.y);
			let tileIndex2 = util.nearestTo(node1.centerTileIndex, area2Hooks);
			
			waterLineList.push({tileIndex1, tileIndex2});
			*/
			
			let hallHooks1 = node1.area.hallHookTileIndexList.filter(tileIndex => util.distance(tileIndex, node2.area.centerTileIndex) <= util.distance(node1.area.centerTileIndex, node2.area.centerTileIndex) + 1);
			let hallHooks2 = node2.area.hallHookTileIndexList.filter(tileIndex => util.distance(tileIndex, node1.area.centerTileIndex) <= util.distance(node1.area.centerTileIndex, node2.area.centerTileIndex) + 1);
			
			hallHooks1.forEach(function (tileIndex1) {
				hallHooks2.forEach(function (tileIndex2) {
					if (tileIndex1.x === tileIndex2.x || tileIndex1.y === tileIndex2.y) {
						waterLineList.push({tileIndex1, tileIndex2});
					}
				}, this);
			}, this);
		}
	};
	
	// Creating Water Lines:
	for (let x = 0; x < this.NUM_NODES; x += 1) {
		for (let y = 0; y < this.NUM_NODES; y += 1) {
			if (!this.nodes[x][y].isEmpty) {
				// Connect Water Right:
				if (x < this.NUM_NODES - 1 && this.nodes[x][y].orientation.right && this.nodes[x][y].hasWater && this.nodes[x + 1][y].hasWater) {
					if (!this.nodes[x][y].isMajorVault || !this.nodes[x + 1][y].isMajorVault) {
						connectNodes(this.nodes[x][y], this.nodes[x + 1][y]);
					}
				}
			
				// Connect Water Down:
				if (y < this.NUM_NODES - 1 && this.nodes[x][y].orientation.down && this.nodes[x][y].hasWater && this.nodes[x][y + 1].hasWater) {
					if (!this.nodes[x][y].isMajorVault || !this.nodes[x][y + 1].isMajorVault) {
						connectNodes(this.nodes[x][y], this.nodes[x][y + 1]);
					}
				}
			}
		}
	}
	
	// Placing Water on Water Lines:
	waterLineList.forEach(function (line) {
		LevelGeneratorUtils.placeTileLine(line.tileIndex1, line.tileIndex2, 1, liquidTileType);
	}, this);
	
	// This will stop all vaults from generating additional liquid during their dressing phase:
	this.roomAreaList.forEach(function (area) {
		area.hasLiquid = true;
	}, this);
};

// LEVEL_GENERATOR_SEWERS_TUNNELS:
// ************************************************************************************************
let LevelGeneratorSewersTunnels = Object.create(LevelGeneratorLiquidTunnels);
LevelGeneratorSewersTunnels.init = function () {
	this.name = 'LevelGeneratorSewersTunnels';
	
	this.VAULT_SET = 'TheSewers-SewersTunnels';
	this.NUM_NODES = 4;
	this.NODE_SIZE = 9;
	this.NODE_OFFSET = 2;
	
	this.liquidTypeList = ['Water'];
	
	// Connection Maps:
	this.connectionMapsList = CONNECTION_MAP_LIST_4x4;
};
LevelGeneratorSewersTunnels.init();

// LEVEL_GENERATOR_YENDOR_LIQUID_TUNNELS:
// ************************************************************************************************
let LevelGeneratorYendorLiquidTunnels = Object.create(LevelGeneratorLiquidTunnels);
LevelGeneratorYendorLiquidTunnels.init = function () {
	this.name = 'LevelGeneratorYendorLiquidTunnels';
	
	this.VAULT_SET = 'YendorLiquidTunnels';
	this.NUM_NODES = 4;
	this.NODE_SIZE = 9;
	this.NODE_OFFSET = 2;
	
	this.liquidTypeList = ['Water', 'Lava', 'ToxicWaste'];
	
	// Connection Maps:
	this.connectionMapsList = [
		{x: 0, y: 0},
		{x: 5, y: 0},
		{x: 10, y: 0},
		{x: 15, y: 0},
		{x: 20, y: 0},
		{x: 25, y: 0},
	];
	
};
LevelGeneratorYendorLiquidTunnels.init();