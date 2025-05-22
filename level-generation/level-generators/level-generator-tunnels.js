/*global gs, util*/
/*global LevelGeneratorUtils, AreaGeneratorVault, ConnectionMap*/
/*global NUM_TILES_X, NUM_TILES_Y*/
/*global VAULT_PLACEMENT, VAULT_CONTENT, FEATURE_TYPE, EXCEPTION_TYPE*/
/*global CONNECTION_MAP_LIST_3x3, CONNECTION_MAP_LIST_4x4*/
/*global LevelGeneratorBase*/
'use strict';



let LevelGeneratorTunnels = Object.create(LevelGeneratorBase);

LevelGeneratorTunnels.init = function () {
	this.shouldPlaceStairsVaults = true;
	this.shouldRotateConnectionMap = true;
	this.initialFillTileType = 'Wall';
};
LevelGeneratorTunnels.init();

// GENERATE:
// ************************************************************************************************
LevelGeneratorTunnels.generate = function () {
	this.initNumVaults();
	this.numAestheticVaults = util.randInt(2, 4);
	
	this.roomAreaList = [];
	
	// Connection Map:
	this.createConnectionMap();
	
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes[this.initialFillTileType]);
	
	// Tunnel Vault Generation:
	this.placeMajorVault();
	this.placeTunnelVaults();
	this.connectTunnelVaults();
	
	// Side Vault Generation:
	if (this.shouldPlaceStairsVaults) {
		this.placeStairsVaults('DownStairs');
		this.placeStairsVaults('UpStairs');
	}
	
	//this.placeFloatingSolidVaults(0.25);
	this.placeSideVaults(1.0);
	
	// Override in sub-generators
	this.postGenerate();
	
	
	gs.areaList = this.roomAreaList;
};

// POST_GENERATE:
// Override in sub-generators
// ************************************************************************************************
LevelGeneratorTunnels.postGenerate = function () {
	// Pass
	
};

// CREATE_CONNECTION_MAP:
// ************************************************************************************************
LevelGeneratorTunnels.createConnectionMap = function () {
	// Create connection map:
	this.connectionMap = new ConnectionMap(this.NUM_NODES, this.NUM_NODES);
	this.connectionMap.loadRandomMap(this.connectionMapsList);
	
	// Rotate connection map:
	if (this.shouldRotateConnectionMap) {
		this.connectionMap.rotateMap(util.randElem([0, 90, 180, 270]));
	}
	
	
	// For quick access:
	this.nodes = this.connectionMap.nodes;
	
	for (let x = 0; x < this.NUM_NODES; x += 1) {
		for (let y = 0; y < this.NUM_NODES; y += 1) {
			this.nodes[x][y].centerTileIndex = {x: Math.floor((x + 0.5) * this.NODE_SIZE) + this.NODE_OFFSET,
											    y: Math.floor((y + 0.5) * this.NODE_SIZE) + this.NODE_OFFSET};
		}
	}
};

// PLACE_MAJOR_VAULT:
// ************************************************************************************************
LevelGeneratorTunnels.placeMajorVault = function () {
	// Only a 25% chance to gen a Major-Vault
	if (util.frac() > 0.25) {
		return;
	}
	
	// BOSS: 25% chance to gen as a Major-Vault
	let bossLevelFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.BOSS);
	if (bossLevelFeature && util.frac() < 0.25) {
		let vaultTypeList = gs.getVaultTypeList(this.VAULT_SET);
		vaultTypeList = vaultTypeList.filter(vaultType => vaultType.bossName === bossLevelFeature.bossName && vaultType.placementType === VAULT_PLACEMENT.MAJOR);
		vaultTypeList = util.shuffleArray(vaultTypeList);
		
		while (vaultTypeList.length > 0) {
			let area = this.tryToPlaceMajorVault(vaultTypeList.pop());
			if (area) {
				bossLevelFeature.hasGenerated = true;
				return;
			}
		}
	}
	
	// AESTHETIC:
	let vaultTypeList = gs.getVaultTypeList(this.VAULT_SET);
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.AESTHETIC && vaultType.placementType === VAULT_PLACEMENT.MAJOR);
	vaultTypeList = util.shuffleArray(vaultTypeList);
	
	while (vaultTypeList.length > 0) {
		let area = this.tryToPlaceMajorVault(vaultTypeList.pop());
		if (area) {
			return area;
		}
	}
};

// TRY_TO_PLACE_MAJOR_VAULT:
// ************************************************************************************************
LevelGeneratorTunnels.tryToPlaceMajorVault = function (vaultType) {
	let angleList = [0];
	
	// Rotation:
	if (vaultType.allowRotate) {
		angleList = util.shuffleArray([0, 90, 180, 270]);
	}
	
	for (let i = 0; i < angleList.length; i += 1) {
		let angle = angleList[i];
		
		let nodeMask = this.getMajorVaultNodeMask(vaultType, angle);
		let nodeIndex = this.getNodeIndexForMajorVaultMask(nodeMask);

		if (nodeIndex) {
			// Placing the vault:
			let tileIndex = {x: nodeIndex.x * this.NODE_SIZE + this.NODE_OFFSET, 
							 y: nodeIndex.y * this.NODE_SIZE + this.NODE_OFFSET};

			let area = AreaGeneratorVault.generate(tileIndex, vaultType, angle);

			// Tagging the nodes as MajorVault
			for (let x = 0; x < nodeMask.width; x += 1) {
				for (let y = 0; y < nodeMask.height; y += 1) {
					if (nodeMask[x][y]) {
						this.nodes[nodeIndex.x + x][nodeIndex.y + y].area = area;
						this.nodes[nodeIndex.x + x][nodeIndex.y + y].hasWater = vaultType.hasWater;
						this.nodes[nodeIndex.x + x][nodeIndex.y + y].isMajorVault = true;
					}
				}
			}

			return area;
		}
	}
	
	return false;
};

// GET_NODE_INDEX_FOR_MAJOR_VAULT:
// ************************************************************************************************
LevelGeneratorTunnels.getNodeIndexForMajorVaultMask = function (nodeMask) {
	let validNodeIndexList = [];
	
	for (let nodeX = 0; nodeX <= this.NUM_NODES - nodeMask.width; nodeX += 1) {
		for (let nodeY = 0; nodeY <= this.NUM_NODES - nodeMask.height; nodeY += 1) {
			let success = true;
			
			for (let maskX = 0; maskX < nodeMask.width; maskX += 1) {
				for (let maskY = 0; maskY < nodeMask.height; maskY += 1) {
					if (this.nodes[nodeX + maskX][nodeY + maskY].isEmpty) {
						success = false;
					}
				}
			}
			
			if (success) {
				validNodeIndexList.push({x: nodeX, y: nodeY});
			}
		}
	}
	
	return validNodeIndexList.length > 0 ? util.randElem(validNodeIndexList) : null;
};

// GET_MAJOR_VAULT_NODE_MASK:
// ************************************************************************************************
LevelGeneratorTunnels.getMajorVaultNodeMask = function (vaultType, angle) {
	let nodeMask = util.create2DArray(vaultType.width, vaultType.height, (x, y) => 0);
	
	let vaultMask = vaultType.getMask();
	
	nodeMask.width = vaultType.width / this.NODE_SIZE;
	nodeMask.height = vaultType.height / this.NODE_SIZE;
	
	for (let x = 0; x < vaultMask.width; x += 1) {
		for (let y = 0; y < vaultMask.height; y += 1) {
			if (vaultMask[x][y]) {
				nodeMask[Math.floor(x / this.NODE_SIZE)][Math.floor(y / this.NODE_SIZE)] = 1;
			}
		}
	}
	
	let rotate90 = function (nodeMask) {
		let newNodeMask = util.create2DArray(nodeMask.height, nodeMask.width, (x, y) => 0);
		
		newNodeMask.width = nodeMask.height;
		newNodeMask.height = nodeMask.width;
		
		// Rotate:
		for (let x = 0; x < nodeMask.height; x += 1) {
			for (let y = 0; y < nodeMask.width; y += 1) {
				newNodeMask[x][y] = nodeMask[y][x];
			}
		}
		
		// Reverse Tile Row:
		for (let y = 0; y < newNodeMask.height; y += 1) {
			for (let x = 0; x < Math.floor(newNodeMask.width / 2); x += 1) {
				let temp = newNodeMask[x][y];
				newNodeMask[x][y] = newNodeMask[newNodeMask.width - x - 1][y];
				newNodeMask[newNodeMask.width - x - 1][y] = temp;
			}
		}
		
		return newNodeMask;
	};
	
	if (angle === 90) {
		nodeMask = rotate90(nodeMask);
	}
	else if (angle === 180) {
		nodeMask = rotate90(nodeMask);
		nodeMask = rotate90(nodeMask);
	}
	else if (angle === 270) {
		nodeMask = rotate90(nodeMask);
		nodeMask = rotate90(nodeMask);
		nodeMask = rotate90(nodeMask);
	}
	
	return nodeMask;
};

// PLACE_TUNNEL_VAULTS:
// ************************************************************************************************
LevelGeneratorTunnels.placeTunnelVaults = function () {
	// Create Rooms:
	for (let x = 0; x < this.NUM_NODES; x += 1) {
		for (let y = 0; y < this.NUM_NODES; y += 1) {
			let node = this.nodes[x][y];
			
			if (!node.isEmpty && !node.isMajorVault) {
				let vaultType = this.selectTunnelVault(node.orientation);

				// If the vault can be rotated we must rotate it
				// Otherwise, the default angle of 0 is fine (the vault tiles themselves achieve the rotation)
				let angle = 0;
				if (vaultType.allowRotate) {
					angle = node.orientation.angle;
				}
				
				// Tile Index:
				let tileIndex = {x: x * this.NODE_SIZE + this.NODE_OFFSET, y: y * this.NODE_SIZE + this.NODE_OFFSET};
				
				// Create the vault:
				let area = AreaGeneratorVault.generate(tileIndex, vaultType, angle);

				// Saving to the grid:
				this.nodes[x][y].area = area;
				
				this.roomAreaList.push(area);
			}
		}
	}
};

// SELECT_TUNNEL_VAULT:
// ************************************************************************************************
LevelGeneratorTunnels.selectTunnelVault = function (orientation) {
	var vaultTypeList = gs.getVaultTypeList(this.VAULT_SET);
	let outVaultTypeList = [];
	
	// Filter: only vaults that actually fit this orientation:
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === orientation.placementType);
	vaultTypeList = vaultTypeList.filter(vaultType => vaultType.allowRotate || vaultType.orientationAngle === orientation.angle);
	
	// We shuffle the levelFeatureList so order doesn't matter
	let levelFeatureList = util.shuffleArray(gs.levelFeatures);
	
	// Handling Level-Features:
	for (let i = 0; i < levelFeatureList.length; i += 1) {
        let levelFeature = levelFeatureList[i];
        
		if (!levelFeature.hasGenerated && outVaultTypeList.length === 0) {
			// VAULT_TYPE:
			if (levelFeature.featureType === FEATURE_TYPE.VAULT_TYPE) {
				let vaultType = vaultTypeList.find(vaultType => vaultType.name === levelFeature.vaultTypeName || vaultType.id === levelFeature.vaultTypeName);
				
				if (vaultType) {
					levelFeature.hasGenerated = true;
					outVaultTypeList.push(vaultType);
				}
			}
			
            // BOSS_VAULT:
            if (levelFeature.featureType === FEATURE_TYPE.BOSS) {
				let bossVaultList = vaultTypeList.filter(vaultType => vaultType.bossName === levelFeature.bossName);

				// We have a 50% chance to generate Boss-Vault as a tunnel:
				if (bossVaultList.length > 0 && util.frac() < 0.5) {
					levelFeature.hasGenerated = true;
					outVaultTypeList = bossVaultList;
				}
            }
		}
	}
	
	// Challenge Vaults:
	if (outVaultTypeList.length === 0) {
		let challengeVaults = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.CHALLENGE);
		if (this.shouldPlaceChallengeVault() && challengeVaults.length > 0 && util.frac() <= 0.25) {
			outVaultTypeList = challengeVaults;
		}
	}
	
	
	// Otherwise we return an aesthetic vault:
	if (outVaultTypeList.length === 0) {
		outVaultTypeList = vaultTypeList.filter(vaultType => vaultType.contentType === VAULT_CONTENT.AESTHETIC);
	}
	
	if (outVaultTypeList.length > 0) {
		return util.randElem(outVaultTypeList);
	}
	else {
		throw this.name + ': No valid tunnel vault for: ' + orientation.placementType + ' - ' + orientation.angle;
	}
};

// CONNECT_TUNNEL_VAULTS:
// ************************************************************************************************
LevelGeneratorTunnels.connectTunnelVaults = function () {
	let setFloor = function (x, y) {
		if (gs.getTile(x, y).type === gs.tileTypes.Wall) {
			gs.setTileType({x: x, y: y}, gs.tileTypes.Floor);
		}
		else if (gs.getTile(x, y).type === gs.tileTypes.CaveWall) {
			gs.setTileType({x: x, y: y}, gs.tileTypes.CaveFloor);
		}
		else {
			throw 'LevelGeneratorTunnels.connectTunnelVaults: failed to connect to major vault, invalid wallType: ' + gs.getTile(x, y).type.name;
		}
	};
	
	for (let nodeX = 0; nodeX < this.NUM_NODES; nodeX += 1) {
		for (let nodeY = 0; nodeY < this.NUM_NODES; nodeY += 1) {
			let node = this.nodes[nodeX][nodeY];
			
			if (!node.isEmpty && !node.isMajorVault) {
				// Connect Right:
				if (node.orientation.right && this.nodes[nodeX + 1][nodeY].isMajorVault) {
					let x = (nodeX + 1) * this.NODE_SIZE + this.NODE_OFFSET;
					let y = Math.floor((nodeY + 0.5) * this.NODE_SIZE + this.NODE_OFFSET);
					
					setFloor(x, y);
					setFloor(x, y + 1);
					setFloor(x, y - 1);
				}
				
				// Connect Left:
				if (node.orientation.left && this.nodes[nodeX - 1][nodeY].isMajorVault) {
					let x = nodeX * this.NODE_SIZE - 1 + this.NODE_OFFSET;
					let y = Math.floor((nodeY + 0.5) * this.NODE_SIZE + this.NODE_OFFSET);
					
					setFloor(x, y);
					setFloor(x, y + 1);
					setFloor(x, y - 1);
				}
				
				// Connect Down:
				if (node.orientation.down && this.nodes[nodeX][nodeY + 1].isMajorVault) {
					let x = Math.floor((nodeX + 0.5) * this.NODE_SIZE + this.NODE_OFFSET);
					let y = (nodeY + 1) * this.NODE_SIZE + this.NODE_OFFSET;
					
					setFloor(x, y);
					setFloor(x + 1, y);
					setFloor(x - 1, y);
				}
				
				// Connect Up:
				if (node.orientation.up && this.nodes[nodeX][nodeY - 1].isMajorVault) {
					let x = Math.floor((nodeX + 0.5) * this.NODE_SIZE + this.NODE_OFFSET);
					let y = nodeY * this.NODE_SIZE - 1 + this.NODE_OFFSET;
					
					setFloor(x, y);
					setFloor(x + 1, y);
					setFloor(x - 1, y);
				}
			}
		}
	}
};

// PLACE_STAIRS_VAULT:
// ************************************************************************************************
LevelGeneratorTunnels.placeStairsVaults = function (stairsTypeName) {
	// Locked Down Stairs:
	if (stairsTypeName === 'DownStairs' && util.frac() < 0.25) {
		let vaultType = gs.getVaultType('SewersTunnels-LockedStairs');
		let area = this.tryToPlaceVault(vaultType);
		
		if (!area) {
			throw {
				type: EXCEPTION_TYPE.LEVEL_GENERATION, 
				text: 'Failed to place stairs.',
			};
		}
		
		let doorTileIndex = gs.getIndexListInArea(area).find(tileIndex => gs.getObj(tileIndex) && gs.getObj(tileIndex).isDoor());
		
		gs.levelFeatures.push({
			featureType: FEATURE_TYPE.SWITCH,
			toTileIndex: {x: doorTileIndex.x, y: doorTileIndex.y}
		});
	}
	// Standard Stairs:
	else {
		// Creating Side Room:
		let vaultType = gs.getVaultType('SewersTunnels-Stairs');
		let area = this.tryToPlaceVault(vaultType);
	
		if (!area) {
			throw {
				type: EXCEPTION_TYPE.LEVEL_GENERATION, 
				text: 'Failed to place stairs.',
			};
		}
		
		// Creating the stairs:
		let tileIndex = gs.getIndexListInArea(area).find(tileIndex => gs.getObj(tileIndex) && gs.getObj(tileIndex).isZoneLine());
		gs.destroyObject(gs.getObj(tileIndex));
		gs.createObject(tileIndex, stairsTypeName);
	}
};

// LEVEL_GENERATOR_WIDE_CAVE_TUNNELS:
// The Upper Dungeon
// ************************************************************************************************
let LevelGeneratorUpperDungeonCaveTunnels = Object.create(LevelGeneratorTunnels);
LevelGeneratorUpperDungeonCaveTunnels.init = function () {
	this.name = 'LevelGeneratorUpperDungeonCaveTunnels';
	
	this.VAULT_SET = 'UpperDungeonCaveTunnels';
	this.NUM_NODES = 3;
	this.NODE_SIZE = 13;
	this.NODE_OFFSET = 0;
	
	// Connection Maps:
	this.connectionMapsList = CONNECTION_MAP_LIST_3x3;
	
	this.shouldPlaceStairsVaults = false;
};
LevelGeneratorUpperDungeonCaveTunnels.init();

// LEVEL_GENERATOR_LAVA_TUNNELS:
// The Core
// ************************************************************************************************
let LevelGeneratorLavaTunnels = Object.create(LevelGeneratorTunnels);
LevelGeneratorLavaTunnels.init = function () {
	this.name = 'LevelGeneratorLavaTunnels';
	
	this.VAULT_SET = 'TheCore-LavaTunnels';
	this.NUM_NODES = 3;
	this.NODE_SIZE = 13;
	this.NODE_OFFSET = 0;
	
	this.initialFillTileType = 'CaveWall';
	
	// Connection Maps:
	this.connectionMapsList = CONNECTION_MAP_LIST_3x3;
	
	this.shouldPlaceStairsVaults = false;
};
LevelGeneratorLavaTunnels.init();

// LEVEL_GENERATOR_CRYPT_TUNNELS:
// ************************************************************************************************
let LevelGeneratorCryptTunnels = Object.create(LevelGeneratorTunnels);
LevelGeneratorCryptTunnels.init = function () {
	this.name = 'LevelGeneratorCryptTunnels';
	
	this.VAULT_SET = 'TheCrypt-CryptTunnels';
	this.NUM_NODES = 4;
	this.NODE_SIZE = 9;
	this.NODE_OFFSET = 2;
	
	// Connection Maps:
	this.connectionMapsList = CONNECTION_MAP_LIST_4x4;
	
};
LevelGeneratorCryptTunnels.init();

// LEVEL_GENERATOR_CRYPT_BIG_TUNNELS:
// ************************************************************************************************
let LevelGeneratorCryptBigTunnels = Object.create(LevelGeneratorTunnels);
LevelGeneratorCryptBigTunnels.init = function () {
	this.name = 'LevelGeneratorCryptBigTunnels';
	
	this.VAULT_SET = 'TheCrypt-BigTunnels';
	this.NUM_NODES = 3;
	this.NODE_SIZE = 13;
	this.NODE_OFFSET = 0;
	
	// Connection Maps:
	this.connectionMapsList = CONNECTION_MAP_LIST_3x3;
	
};
LevelGeneratorCryptBigTunnels.init();

// LEVEL_GENERATOR_CRYPT_SMALL_TUNNELS:
// ************************************************************************************************
let LevelGeneratorCryptSmallTunnels = Object.create(LevelGeneratorTunnels);
LevelGeneratorCryptSmallTunnels.init = function () {
	this.name = 'LevelGeneratorCryptSmallTunnels';
	
	this.VAULT_SET = 'TheCryptSmallTunnels';
	this.NUM_NODES = 4;
	this.NODE_SIZE = 9;
	this.NODE_OFFSET = 2;
	
    // Connection Maps:
	this.connectionMapsList = CONNECTION_MAP_LIST_4x4;
	
};
LevelGeneratorCryptSmallTunnels.init();

// LEVEL_GENERATOR_FACTORY_TUNNELS:
// ************************************************************************************************
let LevelGeneratorFactoryTunnels = Object.create(LevelGeneratorTunnels);
LevelGeneratorFactoryTunnels.init = function () {
	this.name = 'LevelGeneratorFactoryTunnels';
	
	this.VAULT_SET = 'IronForge-FactoryTunnels';
	this.NUM_NODES = 3;
	this.NODE_SIZE = 13;
	this.NODE_OFFSET = 0;
	
	// Connection Maps:
	this.connectionMapsList = CONNECTION_MAP_LIST_3x3;
	
};
LevelGeneratorFactoryTunnels.init();


// LEVEL_GENERATOR_IRON_FORGE_TUNNELS:
// ************************************************************************************************
let LevelGeneratorIronForgeTunnels = Object.create(LevelGeneratorTunnels);
LevelGeneratorIronForgeTunnels.init = function () {
	this.name = 'LevelGeneratorIronForgeTunnels';
	
	this.VAULT_SET = 'IronForgeTunnels';
	this.NUM_NODES = 3;
	this.NODE_SIZE = 13;
	this.NODE_OFFSET = 0;
	
	// Connection Maps:
	this.connectionMapsList = CONNECTION_MAP_LIST_3x3;
	
};
LevelGeneratorIronForgeTunnels.init();

// LEVEL_GENERATOR_IRON_FORGE_LAVA_TUNNELS:
// ************************************************************************************************
let LevelGeneratorIronForgeLavaTunnels = Object.create(LevelGeneratorTunnels);
LevelGeneratorIronForgeLavaTunnels.init = function () {
	this.name = 'LevelGeneratorIronForgeLavaTunnels';
	
	this.VAULT_SET = 'IronForgeLavaTunnels';
	this.NUM_NODES = 3;
	this.NODE_SIZE = 13;
	this.NODE_OFFSET = 0;
	
	// Connection Maps:
	this.connectionMapsList = CONNECTION_MAP_LIST_3x3;
	
};
LevelGeneratorIronForgeLavaTunnels.init();

// LEVEL_GENERATOR_CONNECTED_CIRCLES:
// ************************************************************************************************
let LevelGeneratorConnectedCircles = Object.create(LevelGeneratorTunnels);
LevelGeneratorConnectedCircles.init = function () {
	this.name = 'LevelGeneratorConnectedCircles';
	
	this.VAULT_SET = 'ConnectedCircles';
	this.NUM_NODES = 3;
	this.NODE_SIZE = 13;
	this.NODE_OFFSET = 0;
	
	// Connection Maps:
	this.connectionMapsList = CONNECTION_MAP_LIST_3x3;
	
};
LevelGeneratorConnectedCircles.init();