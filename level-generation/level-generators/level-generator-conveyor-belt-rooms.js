/*global gs, util*/
/*global LevelGeneratorTunnels, LevelGeneratorUtils, AreaGeneratorVault, ConnectionMap*/
/*global FEATURE_TYPE, VAULT_PLACEMENT, VAULT_CONTENT, EXCEPTION_TYPE*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

// LEVEL_GENERATOR_CONVEYOR_BELT_ROOMS:
// ************************************************************************************************
let LevelGeneratorConveyorBeltRooms = Object.create(LevelGeneratorTunnels);
LevelGeneratorConveyorBeltRooms.init = function () {
	this.name = 'LevelGeneratorConveyorBeltRooms';
	
	this.shouldRotateConnectionMap = false;
	
	this.VAULT_SET = 'IronForge-ConveyorBeltRooms';
	this.NUM_NODES = 3;
	this.NODE_SIZE = 13;
	this.NODE_OFFSET = 0;
	
	// Connection Maps:
	// Note that the order connections go:
	// 0 - top
	// 1 - right
	// 2 - bottom 
	// 3 - left
	// The X symbol indicates no connection
	this.connectionMapsList = [
		
		{x: 0, y: 27, 
		 upStairsNodeIndex: {x: 0, y: 0}, 
		 downStairsNodeIndex: {x: 2, y: 2},
		 connections: [
			 ['XRUX', 'XXDR', 'XXXX'],
			 ['ULXX', 'DRUL', 'XXDR'],
			 ['XXXX', 'ULXX', 'DXXL'],
		 ]
		},
		
		
		{x: 4, y: 27, 
		 upStairsNodeIndex: {x: 1, y: 0}, 
		 downStairsNodeIndex: {x: 2, y: 2},
		 connections: [
			 ['XLDX', 'XRUL', 'XXDR'],
			 ['DRXX', 'ULDR', 'DXUL'],
			 ['XXXX', 'DRXX', 'UXXR'],
		 ]
		},
		
		
		
		{x: 8, y: 27, 
		 upStairsNodeIndex: {x: 0, y: 2}, 
		 downStairsNodeIndex: {x: 2, y: 0},
		 connections: [
			 ['XRUX', 'XRXR', 'XXDR'],
			 ['UXUX', 'XXXX', 'DXDX'],
			 ['ULXX', 'XLXL', 'DXXL'],
		 ]
		},
		
		
		{x: 12, y: 27, 
		 upStairsNodeIndex: {x: 0, y: 2}, 
		 downStairsNodeIndex: {x: 2, y: 0},
		 connections: [
			 ['XXXX', 'XRUX', 'XXDR'],
			 ['XRUX', 'ULDR', 'DXXL'],
			 ['ULXX', 'DXXL', 'XXXX'],
		 ]
		},
		
		
		{x: 16, y: 27, 
		 upStairsNodeIndex: {x: 1, y: 2}, 
		 downStairsNodeIndex: {x: 1, y: 0},
		 connections: [
			 ['XRUX', 'XXDR', 'XXXX'],
			 ['URUX', 'DRUR', 'XXDR'],
			 ['ULXX', 'ULXL', 'DXXL'],
		 ]
		},
	];
};
LevelGeneratorConveyorBeltRooms.init();


// GENERATE:
// ************************************************************************************************
LevelGeneratorConveyorBeltRooms.generate = function () {	
	this.roomAreaList = [];
	
	// Connection Map:
	this.createConnectionMap();
	let connectionMapData = this.connectionMap.data;
		
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes[this.initialFillTileType]);
	
	// Place Stair Vaults:
	this.placeStairVault(connectionMapData.upStairsNodeIndex.x, connectionMapData.upStairsNodeIndex.y, 'UpStairs');
	this.placeStairVault(connectionMapData.downStairsNodeIndex.x, connectionMapData.downStairsNodeIndex.y, 'DownStairs');
	
	// Tunnel Vault Generation:
	this.placeTunnelVaults();
	
	// Create Conveyor Belts:
	this.createAllConveyorBelts();
	
	// Side Vaults (mostly for reward vaults)
	this.placeSideVaults(1.0);
	
	
	gs.areaList = this.roomAreaList;
};

// PLACE_STAIR_VAULT:
// ************************************************************************************************
LevelGeneratorConveyorBeltRooms.placeStairVault = function (nodeX, nodeY, stairTypeName) {
	let node = this.nodes[nodeX][nodeY];
	
	// Mark the node as empty so that subsequent generation does not place a vault here:
	node.isEmpty = true;
	
	// Get stair vaults:
	var vaultTypeList = gs.getVaultTypeList('IronForge-ConveyorBeltRooms-Stairs');
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === node.orientation.placementType);
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.allowRotate || vaultType.orientationAngle === node.orientation.angle);
	let vaultType = util.randElem(vaultTypeList);
	
	// Tile Index:
	let tileIndex = {x: nodeX * this.NODE_SIZE + this.NODE_OFFSET, y: nodeY * this.NODE_SIZE + this.NODE_OFFSET};

	// Create the vault:
	let area = AreaGeneratorVault.generate(tileIndex, vaultType, node.orientation.angle);
	
	// Creating the stairs:
	let stairTileIndex = gs.getIndexListInArea(area).find(index => gs.getTile(index).tagID === 1);
	gs.createZoneLine(stairTileIndex, stairTypeName);

	// Storing the area:
	node.area = area;
	this.roomAreaList.push(area);
	
};

// CREATE_ALL_CONVEYOR_BELTS:
// Connects all rooms w/ conveyor belts
// ************************************************************************************************
LevelGeneratorConveyorBeltRooms.createAllConveyorBelts = function () {
	let connections = this.connectionMap.data.connections;
	
	let objTypeNames = {
		U: 'UpConveyorBelt',
		D: 'DownConveyorBelt',
		R: 'RightConveyorBelt',
		L: 'LeftConveyorBelt',
		X: null,
	};
	
	for (let x = 0; x < this.NUM_NODES; x += 1) {
		for (let y = 0; y < this.NUM_NODES; y += 1) {
			let connection = connections[y][x];
			
			// Top:
			if (objTypeNames[connection[0]]) {
				let tileIndex = {x: x * this.NODE_SIZE + Math.floor(this.NODE_SIZE / 2), y: y * this.NODE_SIZE};
				this.createConveyorBelt(tileIndex, {x: 0, y: 1}, objTypeNames[connection[0]]);
			}
			
			// Right:
			if (objTypeNames[connection[1]]) {
				let tileIndex = {x: x * this.NODE_SIZE + this.NODE_SIZE - 1, y: y * this.NODE_SIZE + Math.floor(this.NODE_SIZE / 2)};				
				this.createConveyorBelt(tileIndex, {x: -1, y: 0}, objTypeNames[connection[1]]);
			}
			
			// Bottom:
			if (objTypeNames[connection[2]]) {
				let tileIndex = {x: x * this.NODE_SIZE + Math.floor(this.NODE_SIZE / 2), y: y * this.NODE_SIZE + this.NODE_SIZE - 1};
				this.createConveyorBelt(tileIndex, {x: 0, y: -1}, objTypeNames[connection[2]]);
			}
			
			// Left:
			if (objTypeNames[connection[3]]) {
				let tileIndex = {x: x * this.NODE_SIZE, y: y * this.NODE_SIZE + Math.floor(this.NODE_SIZE / 2)};
				this.createConveyorBelt(tileIndex, {x: 1, y: 0}, objTypeNames[connection[3]]);
			}
		}
	}
};

// CREATE_CONVEYOR_BELT:
// Creates a line of conveyor belts starting from tileIndex and traveling in delta direction.
// Will halt as soon as it reaches the end of the tunnel.
// objTypeName should be one of: ['UpConveyorBelt', 'DownConveyorBelt', 'LeftConveyorBelt', 'RightConveyorBelt']
// ************************************************************************************************
LevelGeneratorConveyorBeltRooms.createConveyorBelt = function (startTileIndex, delta, objTypeName) {
	let isEnd = function (tileIndex) {
		let indexList = gs.getIndexListCardinalAdjacent(tileIndex);
		indexList = indexList.filter(index => gs.isPassable(index));
		
		return indexList.length > 2;
	};
	
	let tileIndex = {x: startTileIndex.x, y: startTileIndex.y};
	
	while (!isEnd(tileIndex)) {
		gs.createObject(tileIndex, objTypeName);
		
		tileIndex.x += delta.x;
		tileIndex.y += delta.y;
	}
};