/*global game, util, gs, console*/
/*global LevelGeneratorTunnels, LevelGeneratorUtils, ConnectionMap, DungeonGenerator, AreaGeneratorVault*/
/*global VAULT_CONTENT, VAULT_PLACEMENT, FEATURE_TYPE, ORIENTATION*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

let LevelGeneratorArcane = Object.create(LevelGeneratorTunnels);

// INIT:
// ************************************************************************************************
LevelGeneratorArcane.init = function () {
	this.name = 'LevelGeneratorArcane';
	
	this.NUM_NODES = 3;
	this.NODE_SIZE = Math.floor(NUM_TILES_X / this.NUM_NODES);
	this.NODE_OFFSET = 0;
	
	this.VAULT_SET = 'TheArcaneTower-PortalRooms';
	
	// Connection Maps:
	this.connectionMapsList = [
		{x: 0, y: 9},
		{x: 4, y: 9},
		{x: 8, y: 9},
		{x: 12, y: 9},
		{x: 16, y: 9},
		{x: 20, y: 9},
		{x: 24, y: 9},
	];
};
LevelGeneratorArcane.init();

// GENERATE:
// ************************************************************************************************
LevelGeneratorArcane.generate = function () {
	this.initNumVaults();
	
	// Room Area Grid:
	//this.roomAreaGrid = util.create2DArray(this.NUM_NODES, this.NUM_NODES, (x, y) => null);
	this.roomAreaList = [];
	
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	// Connection Map
	this.selectConnectionMap();
	
	// Portal Vaults:
	this.placeMajorVault();
	this.placePortalVaults();
	this.connectPortalVaults();
	this.placeSideVaults(1.0);
	
	// Trim Walls
	LevelGeneratorUtils.trimWalls();
	
	// Place Doors:
	LevelGeneratorUtils.placeDoors();
	
	// Room List:
	gs.areaList = this.roomAreaList;
};

// SELECT_CONNECTION_MAP:
// ************************************************************************************************
LevelGeneratorArcane.selectConnectionMap = function () {
	this.connectionMap = new ConnectionMap(this.NUM_NODES, this.NUM_NODES);
	this.connectionMap.loadRandomMap(this.connectionMapsList);
	this.connectionMap.rotateMap(util.randElem([0, 90, 180, 270]));
	this.nodes = this.connectionMap.nodes;
};
	
// PLACE_PORTAL_VAULTS
// ************************************************************************************************
LevelGeneratorArcane.placePortalVaults = function () {
	for (let x = 0; x < this.NUM_NODES; x += 1) {
		for (let y = 0; y < this.NUM_NODES; y += 1) {
			if (!this.nodes[x][y].isEmpty && !this.nodes[x][y].isMajorVault) {
				let vaultType = this.selectPortalVaultType(this.nodes[x][y].orientation);

				let centerTileIndex = {x: Math.floor((x + 0.5) * this.NODE_SIZE),
									   y: Math.floor((y + 0.5) * this.NODE_SIZE)};

				let tileIndex = {x: centerTileIndex.x - Math.floor(vaultType.width / 2),
								 y: centerTileIndex.y - Math.floor(vaultType.height / 2)};
				
				let angle = 0;
				// Rotate to fit angle (unless 4-way which never needs to rotate):
				if (vaultType.allowRotate && vaultType.placementType !== VAULT_PLACEMENT.FOUR_WAY) {
					angle = this.nodes[x][y].orientation.angle;
				}

				let area = AreaGeneratorVault.generate(tileIndex, vaultType, angle);

				this.nodes[x][y].area = area;
				this.roomAreaList.push(area);
			}
		}
	}
};

// SELECT_PORTAL_VAULT_TYPE:
// ************************************************************************************************
LevelGeneratorArcane.selectPortalVaultType = function (orientation) {
	let vaultTypeList = gs.getVaultTypeList(this.VAULT_SET);
	
	let validPlacementTypeList = [];
	
	// Always include the actual orientation:
	validPlacementTypeList.push(orientation.placementType);
	
	// Chance to include the generic 4-way orientation:
	if (util.frac() <= 0.50) {
		validPlacementTypeList.push(VAULT_PLACEMENT.FOUR_WAY);
	}
	
	
	vaultTypeList = vaultTypeList.filter(vaultType => util.inArray(vaultType.placementType, validPlacementTypeList));
	
	vaultTypeList = vaultTypeList.filter(function (vaultType) {
		if (vaultType.allowRotate || vaultType.placementType === VAULT_PLACEMENT.FOUR_WAY) {
			return true;
		}
		
		let vaultOrientation = ORIENTATION.find(e => e.placementType === vaultType.placementType && e.angle === vaultType.orientationAngle);
		
		if (orientation.left && !vaultOrientation.left) {
			return false;
		}
		if (orientation.right && !vaultOrientation.right) {
			return false;
		}
		if (orientation.up && !vaultOrientation.up) {
			return false;
		}
		if (orientation.down && !vaultOrientation.down) {
			return false;
		}
		
		return true;
		
	}, this);
		

	// CHALLENGE_VAULTS:
	if (this.shouldPlaceChallengeVault() && util.frac() <= 0.2) {
		let challengeVaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.CHALLENGE);
		if (challengeVaultTypeList.length > 0) {
			return util.randElem(challengeVaultTypeList);
		}
	}
	
	// AESTHETIC_VAULTS:
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.AESTHETIC);
	return util.randElem(vaultTypeList);
};

// CONNECT_PORTAL_VAULTS:
// ************************************************************************************************
LevelGeneratorArcane.connectPortalVaults = function () {
	this.selectConnectionTypes();
	
	// Do this first so hallways don't block portals:
	this.portalConnectRooms();
	
	this.hallwayConnectRooms();
};

// SELECT_CONNECTION_TYPES:
// First select how we will connect each room. Make the decision first so that all portals can all be placed first.
// Then all hallways can be placed in a second pass in such a way as to never cross over a portal.
// ************************************************************************************************
LevelGeneratorArcane.selectConnectionTypes = function () {
	var portalPercent = 0.50;
	
	for (let x = 0; x < this.NUM_NODES; x += 1) {
		for (let y = 0; y < this.NUM_NODES; y += 1) {
			let baseArea = this.nodes[x][y].area,
				rightArea = x < this.NUM_NODES - 1 && this.nodes[x + 1][y].area,
				downArea = y < this.NUM_NODES - 1 && this.nodes[x][y + 1].area;
			
			/*
			// Major vault:
			if (baseArea && this.nodes[x][y].isMajorVault) {
				
				// Connecting left to right:
				if (rightArea && rightArea !== baseArea) {
					
					let baseHallTileIndex = util.nearestTo(rightArea.centerTileIndex, baseArea.hallHookTileIndexList);
					let rightHallTileIndex = util.nearestTo(baseArea.centerTileIndex, rightArea.hallHookTileIndexList);
					
					if (util.distance(baseHallTileIndex, rightHallTileIndex) === 1) {
						baseArea.connectRight = 'HALLWAY';
					}
					else if (util.frac() < portalPercent) {
						baseArea.connectRight = 'PORTAL';
					}
					else {
						baseArea.connectRight = 'HALLWAY';
					}
				}
				
				// Connecting top to bottom:
				if (downArea && downArea !== baseArea) {
					let baseHallTileIndex = util.nearestTo(downArea.centerTileIndex, baseArea.hallHookTileIndexList);
					let downHallTileIndex = util.nearestTo(baseArea.centerTileIndex, downArea.hallHookTileIndexList);
					
					if (util.distance(baseHallTileIndex, downHallTileIndex) === 1) {
						baseArea.connectDown = 'HALLWAY';
					}
					else if (util.frac() < portalPercent) {
						baseArea.connectDown = 'PORTAL';
					}
					else {
						baseArea.connectDown = 'HALLWAY';
					}
				}
				
			}
			*/
			// Standard:
			if (baseArea) {
				// Connecting left to right:
				if (rightArea && baseArea !== rightArea && this.nodes[x][y].orientation.right) {
					
					let baseHallTileIndex = util.nearestTo(rightArea.centerTileIndex, baseArea.hallHookTileIndexList);
					let rightHallTileIndex = util.nearestTo(baseArea.centerTileIndex, rightArea.hallHookTileIndexList);
					
					if (util.distance(baseHallTileIndex, rightHallTileIndex) === 1) {
						this.nodes[x][y].connectRight = 'HALLWAY';
					}
					else if (util.frac() < portalPercent) {
						this.nodes[x][y].connectRight = 'PORTAL';
					}
					else {
						this.nodes[x][y].connectRight = 'HALLWAY';
					}
				}
				
				// Connecting top to bottom:
				if (downArea && baseArea !== downArea && this.nodes[x][y].orientation.down) {
					let baseHallTileIndex = util.nearestTo(downArea.centerTileIndex, baseArea.hallHookTileIndexList);
					let downHallTileIndex = util.nearestTo(baseArea.centerTileIndex, downArea.hallHookTileIndexList);
					
					if (util.distance(baseHallTileIndex, downHallTileIndex) === 1) {
						this.nodes[x][y].connectDown = 'HALLWAY';
					}
					else if (util.frac() < portalPercent) {
						this.nodes[x][y].connectDown = 'PORTAL';
					}
					else {
						this.nodes[x][y].connectDown = 'HALLWAY';
					}
				}
			}
		}
	}
};



// PORTAL_CONNECT_ROOMS:
// ************************************************************************************************
LevelGeneratorArcane.portalConnectRooms = function () {
	var indexList, object;
	
	let createPortal = function (fromArea, toArea) {
		if (fromArea.hallHookTileIndexList.length === 0) {
			throw 'ERROR [LevelGeneratorArcane.portalConnectRooms] - no hall hooks in: ' + fromArea.vaultType.name;
		}
		
		let tileIndex = util.nearestTo(toArea.centerTileIndex, fromArea.hallHookTileIndexList);
		
		// Create nook:
		gs.setTileType(tileIndex, gs.tileTypes.Floor);
				
		let object = gs.createObject(tileIndex, 'Portal');
		
		// Stops hallways from tunneling over portals
		gs.getIndexListAdjacent(tileIndex).forEach(function (adjacentTileIndex) {
			if (!gs.isPassable(adjacentTileIndex)) {
				gs.getTile(adjacentTileIndex).isSolidWall = true;
			}
		}, this);
		
		let toTileIndex = LevelGeneratorArcane.getPortalToTileIndex(tileIndex, toArea);
		
		// Setup toTileIndex:
		object.toTileIndexList = [toTileIndex];
		gs.getTile(toTileIndex).mustBeFloor = true;
		gs.getTile(toTileIndex).isClosed = true;
		
		// Set tile type:
		if (gs.isUncoveredLiquid(toTileIndex)) {
			gs.setTileType(toTileIndex, gs.tileTypes.Floor);
		}
		
	};
	
	for (let x = 0; x < this.NUM_NODES; x += 1) {
		for (let y = 0; y < this.NUM_NODES; y += 1) {
			// Horizontal Portals:
			if (this.nodes[x][y].area && this.nodes[x][y].connectRight === 'PORTAL') {
				createPortal(this.nodes[x][y].area, this.nodes[x + 1][y].area);
				createPortal(this.nodes[x + 1][y].area, this.nodes[x][y].area);
			}
			
			// Vertical Portals:
			if (this.nodes[x][y].area && this.nodes[x][y].connectDown === 'PORTAL') {
				createPortal(this.nodes[x][y].area, this.nodes[x][y + 1].area);
				createPortal(this.nodes[x][y + 1].area, this.nodes[x][y].area);
			}
		}
	}
};

// GET_PORTAL_TO_TILE_INDEX:
// ************************************************************************************************
LevelGeneratorArcane.getPortalToTileIndex = function (portalTileIndex, toArea) {
	// Default to center:
	let toTileIndex = toArea.centerTileIndex;
	
	// Override with the nearest portal hook:
	if (toArea.portalHookTileIndexList) {
		toTileIndex = util.nearestTo(portalTileIndex, toArea.portalHookTileIndexList);
	}
	
	// If the destination is solid then try directly below it:
	if (!gs.isPassable(toTileIndex)) {
		toTileIndex = {x: toTileIndex.x, y: toTileIndex.y + 1};
	}
	
	return toTileIndex;
};

// HALLWAY_CONNECT_ROOMS:
// ************************************************************************************************
LevelGeneratorArcane.hallwayConnectRooms = function () {
	let hallWidth = [1, 1, 3];
	
	for (let x = 0; x < this.NUM_NODES; x += 1) {
		for (let y = 0; y < this.NUM_NODES; y += 1) {
			let baseArea = this.nodes[x][y].area;
			
			if (baseArea) {
				// Horizontal Hallways:
				if (this.nodes[x][y].connectRight === 'HALLWAY') {
					let rightArea = this.nodes[x + 1][y].area,
						baseTileIndex = util.nearestTo(rightArea.centerTileIndex, baseArea.hallHookTileIndexList),
						rightTileIndex = util.nearestTo(baseArea.centerTileIndex, rightArea.hallHookTileIndexList);

					LevelGeneratorUtils.placeHall(baseTileIndex, rightTileIndex, util.randElem(hallWidth));
				}

				// Vertical Hallways:
				if (this.nodes[x][y].connectDown === 'HALLWAY') {
					let downArea = this.nodes[x][y + 1].area,
						baseTileIndex = util.nearestTo(downArea.centerTileIndex, baseArea.hallHookTileIndexList),
						downTileIndex = util.nearestTo(baseArea.centerTileIndex, downArea.hallHookTileIndexList);

					LevelGeneratorUtils.placeHall(baseTileIndex, downTileIndex, util.randElem(hallWidth));

				}
			}
		}
	}
};