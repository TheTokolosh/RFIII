/*global game, util, gs, console*/
/*global LevelGeneratorBase, LevelGeneratorUtils, ConnectionMap, DungeonGenerator*/
/*global AreaGeneratorSquare, AreaGeneratorCave*/ 
/*global VAULT_CONTENT, VAULT_PLACEMENT, FEATURE_TYPE*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

let LevelGeneratorRoomGrid = Object.create(LevelGeneratorBase);

// INIT:
// ************************************************************************************************
LevelGeneratorRoomGrid.init = function () {
	this.name = 'LevelGeneratorRoomGrid';
	
	// Properties:
	this.numNodesX = 3;
	this.numNodesY = 3;
	this.maxRoomSize = Math.floor(NUM_TILES_X / this.numNodesX);
	this.PLACE_VAULT_MAX_ATTEMPTS = 20;
	
	// Connection Maps:
	this.connectionMapsList = [
		{x: 0, y: 5},
		{x: 4, y: 5},
		{x: 8, y: 5},
		{x: 12, y: 5},
		{x: 16, y: 5},
		{x: 20, y: 5},
		{x: 24, y: 5},
		{x: 28, y: 5},
	];
};

LevelGeneratorRoomGrid.init();

// GENERATE:
// ************************************************************************************************
LevelGeneratorRoomGrid.generate = function () {
    this.initNumVaults();
    this.numAestheticVaults = util.randInt(1, 3);
    
	// Room Area Grid:
	this.roomAreaGrid = util.create2DArray(this.numNodesX, this.numNodesY, (x, y) => null);
	this.roomAreaList = [];
	
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	
	// Create connection map:
	this.connectionMap = new ConnectionMap(this.numNodesX, this.numNodesY);
	this.connectionMap.loadRandomMap(this.connectionMapsList);
	this.connectionMap.rotateMap(util.randElem([0, 90, 180, 270]));
	
	// Create Rooms:
	this.placeRooms();
	
	// Connect Rooms:
	this.connectRooms();
    
    this.placeSideVaults(1.0);
	
	// Trim Walls
	LevelGeneratorUtils.trimWalls();
	
	// Place Doors:
	LevelGeneratorUtils.placeDoors();
	
	// Room List:
	gs.areaList = this.roomAreaList;
};

// GET_ROOMS_INDEX_LIST:
// ************************************************************************************************
LevelGeneratorRoomGrid.getRoomsIndexList = function () {
	// Randomize the order:
	let indexList = [];
	for (let x = 0; x < this.numNodesX; x += 1) {
		for (let y = 0; y < this.numNodesY; y += 1) {
			indexList.push({x: x, y: y});
		}
	}
	indexList = util.shuffleArray(indexList);
	
	return indexList;
};

// PLACE_ROOMS:
// ************************************************************************************************
LevelGeneratorRoomGrid.placeRooms = function () {
	// Create rooms for each boundsBox:
	this.getRoomsIndexList().forEach(function (roomGridIndex) {
		let x = roomGridIndex.x;
		let y = roomGridIndex.y;
	
		let node = this.connectionMap.nodes[x][y];

		if (!node.isEmpty) {
			// Bounds Box for Room:
			let boundsBox = util.createBox(x * this.maxRoomSize, y * this.maxRoomSize, (x + 1) * this.maxRoomSize, (y + 1) * this.maxRoomSize);
			
			// Creating Room:
			let roomArea;
			
			// VAULT_TYPE:
			let vaultLevelFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.VAULT_TYPE && !levelFeature.hasGenerated);
            if (vaultLevelFeature) {
                let vaultType = gs.vaultTypeList.find(vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.name === vaultLevelFeature.vaultTypeName);
                
                if (vaultType) {
                    roomArea = this.tryToPlaceVault(vaultType, boundsBox);
					
					if (roomArea) {
						vaultLevelFeature.hasGenerated = true;
					}
                }
            }
			
			// VAULT_SET
            let vaultSetFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.VAULT_SET && !levelFeature.hasGenerated);
            if (!roomArea && vaultSetFeature) {
				let vaultTypeList = gs.vaultTypeList;
				vaultTypeList = vaultTypeList.filter(vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID);
				vaultTypeList = vaultTypeList.filter(vaultType => vaultType.vaultSet === vaultSetFeature.vaultSet);

				if (vaultTypeList.length > 0) {
					let vaultType = util.randElem(vaultTypeList);
					roomArea = this.tryToPlaceVault(vaultType, boundsBox);
					
					if (roomArea) {
						vaultSetFeature.hasGenerated = true;
					}
				}
            }
			
            // BOSS_VAULT
            let bossLevelFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.BOSS && !levelFeature.hasGenerated);
            if (!roomArea && bossLevelFeature) {
                let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.bossName === bossLevelFeature.bossName;

                roomArea = this.tryToPlaceVault(vaultTypeFilter, boundsBox);

                if (roomArea) {
                     bossLevelFeature.hasGenerated = true;
                }
            }
			
			// ZONE_LINE_VAULT:
			let zoneLineFeature =  gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.ZONE_LINE && !levelFeature.hasGenerated);
			if (!roomArea && zoneLineFeature && util.frac() <= 0.1) {
				let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.toZoneName === zoneLineFeature.toZoneName;
				roomArea = this.tryToPlaceVault(vaultTypeFilter, boundsBox);
			
				if (roomArea) {
					zoneLineFeature.hasGenerated = true;
				}
			}
            
            // CHALLENGE_VAULT:
			if (!roomArea && this.shouldPlaceChallengeVault() && util.frac() <= 0.1) {
				let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.contentType === VAULT_CONTENT.CHALLENGE;
				roomArea = this.tryToPlaceVault(vaultTypeFilter, boundsBox);
			}
			
			// AESTHETIC_VAULT:
			if (!roomArea && this.numAestheticVaults > 0) {
				let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.contentType === VAULT_CONTENT.AESTHETIC;
				roomArea = this.tryToPlaceVault(vaultTypeFilter, boundsBox);
			
				if (roomArea) {
					this.numAestheticVaults -= 1;
				}
			}
			
			// Random Room:
			if (!roomArea) {
				let maxRoomSize = {width: boundsBox.width - 2, height: boundsBox.height - 2};
				roomArea = LevelGeneratorUtils.tryToPlaceRandomRoom(maxRoomSize, boundsBox);
			}

			// Failed:
			if (!roomArea) {
				throw 'ERROR [LevelGeneratorRoomGrid.createRooms] - failed to place either a vault or random room';
			}

			// Saving to the grid:
			this.roomAreaGrid[x][y] = roomArea;

			// Saving to main list:
			this.roomAreaList.push(roomArea);
		}
	}, this);
};

// CONNECT_ROOMS:
// ************************************************************************************************
LevelGeneratorRoomGrid.connectRooms = function () {
	// Horizontal Halls:
	for (let x = 0; x < this.numNodesX - 1; x += 1) {
		for (let y = 0; y < this.numNodesY; y += 1) {
			let room1 = this.roomAreaGrid[x][y];
			let room2 = this.roomAreaGrid[x + 1][y];
			
			// Connection to the right:
			if (room1 && room2) {
				LevelGeneratorUtils.placeHall(room1, room2, util.randInt(1, 3));
				
				// Second Hall:
				if (util.frac() < 0.5) {
					LevelGeneratorUtils.placeHall(room1, room2, 1);
				}
			}
		}
	}
	
	// Vertical Halls:
	for (let x = 0; x < this.numNodesX; x += 1) {
		for (let y = 0; y < this.numNodesY - 1; y += 1) {
			let room1 = this.roomAreaGrid[x][y];
			let room2 = this.roomAreaGrid[x][y + 1];
			
			// Connecting downwards:
			if (room1 && room2) {
				LevelGeneratorUtils.placeHall(room1, room2, util.randInt(1, 3));
				
				// Second Hall:
				if (util.frac() < 0.5) {
					LevelGeneratorUtils.placeHall(room1, room2, 1);
				}
			}
		}
	}
};


