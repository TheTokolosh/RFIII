/*global game, gs, console, Phaser, util*/
/*global LevelGeneratorBase, DungeonGenerator, LevelGeneratorUtils*/
/*global FEATURE_TYPE, VAULT_PLACEMENT, VAULT_CONTENT*/
/*global NUM_TILES_X, NUM_TILES_Y*/
/*jshint esversion: 6*/
'use strict';

let LevelGeneratorCycles = Object.create(LevelGeneratorBase);

// INIT:
// ************************************************************************************************
LevelGeneratorCycles.init = function () {
	this.name = 'LevelGeneratorCycles';
	this.maxFloorTiles = 500;
};
LevelGeneratorCycles.init();
	
// GENERATE:
// ************************************************************************************************
LevelGeneratorCycles.generate = function () {
	this.initNumVaults();
    this.numAestheticVaults = util.randInt(1, 3);
	
	// This will hold a list of vaults that failed placement.
	// This helps to speed up generation as the generator will not try to place replace a failed vault.
	this.previouslyPlacedVaultTypes = [];
    
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	// Will hold a list of rooms for later connecting:
	this.roomAreaList = [];
	
	// Generation:
	this.placeRooms();
	this.connectRooms();
    
    // Additional Generation:
    this.placeSideVaults(100);
	
	// Trim Walls
	LevelGeneratorUtils.trimWalls();
	
	// Place Doors:
	LevelGeneratorUtils.placeDoors();
	
	// Room List:
	gs.areaList = this.roomAreaList;
};

// PLACE_ROOMS:
// ************************************************************************************************
LevelGeneratorCycles.placeRooms = function () {
	// Create Rooms:
	let maxLoopCount = 50;
	let maxRooms = 8;
	let minRooms = 4;
	let loopCount = 0;
	let maxRoomSize = {width: 20, height: 20};
	
	while (true) {
		let roomArea = null;
		
		// BOSS_VAULTS:
        let bossLevelFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.BOSS && !levelFeature.hasGenerated);
        if (bossLevelFeature) {
            let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.bossName === bossLevelFeature.bossName;
            
            roomArea = this.tryToPlaceVault(vaultTypeFilter);
            
            if (roomArea) {
                 bossLevelFeature.hasGenerated = true;
            }
        }
		
		// ZONE_LINE_VAULT:
		let zoneLineFeature =  gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.ZONE_LINE && !levelFeature.hasGenerated);
		if (!roomArea && zoneLineFeature) {
			let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.toZoneName === zoneLineFeature.toZoneName;
			roomArea = this.tryToPlaceVault(vaultTypeFilter);

			if (roomArea) {
				zoneLineFeature.hasGenerated = true;
			}
		}
		
		// VAULT_TYPE:
		let vaultLevelFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.VAULT_TYPE && !levelFeature.hasGenerated);
		if (!roomArea && vaultLevelFeature) {
			let vaultType = gs.vaultTypeList.find(function (vaultType) {
				return vaultType.placementType === VAULT_PLACEMENT.SOLID 
					&& (vaultType.name === vaultLevelFeature.vaultTypeName || vaultType.id === vaultLevelFeature.vaultTypeName);
			});

			if (vaultType) {
				roomArea = this.tryToPlaceVault(vaultType);

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
				
				roomArea = this.tryToPlaceVault(vaultType);

				if (roomArea) {
					vaultSetFeature.hasGenerated = true;
				}
			}
		}
		
        
        // CHALLENGE_VAULTS:
		if (!roomArea && this.shouldPlaceChallengeVault() && util.frac() <= 0.5) {
			let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.contentType === VAULT_CONTENT.CHALLENGE;
			
			roomArea = this.tryToPlaceVault(vaultTypeFilter, null, maxRoomSize);
		}
		
		// AESTHETIC_VAULTS:
		if (!roomArea && this.numAestheticVaults > 0) {
			let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.contentType === VAULT_CONTENT.AESTHETIC;
			
			roomArea = this.tryToPlaceVault(vaultTypeFilter, null, maxRoomSize);
		
			if (roomArea) {
				this.numAestheticVaults -= 1;
			}
		}
		
		// RANDOM_ROOM:
		if (!roomArea) {
			roomArea = LevelGeneratorUtils.tryToPlaceRandomRoom(maxRoomSize);
		}
		
		if (roomArea) {
			// Saving to main list:
			this.roomAreaList.push(roomArea);
		}
		
		// We reduce the max room size to try to fit smaller rooms:
		if (util.frac() < 0.5) {
			maxRoomSize.width = Math.max(7, maxRoomSize.width - 1);
		}
		else {
			maxRoomSize.height = Math.max(7, maxRoomSize.height - 1);
		}
		
		// BREAK:
		loopCount += 1;
		if (gs.countFloorTiles() >= this.maxFloorTiles && this.roomAreaList.length >= minRooms) {
			this.exitCondition = 'gs.countFloorTiles() >= maxFloorTiles';
			break;
		}
		else if (this.roomAreaList.length >= maxRooms) {
			this.exitCondition = 'this.roomAreaList.length >= maxRooms';
			break;
		}
		else if (loopCount >= maxLoopCount) {
			this.exitCondition = 'loopCount >= maxLoopCount';
			break;	
		}
	}
};

// CONNECT_ROOMS:
// ************************************************************************************************
LevelGeneratorCycles.connectRooms = function () {
	let roomAreaList = this.roomAreaList.filter(area => !area.isVault || area.vaultType.placementType !== VAULT_PLACEMENT.SIDE);
	
	// Base Connection Step:
	// Guarantees connectivity by connecting all rooms in a 'cycle':
	// Connect each room to the next:
	for (let i = 0; i < roomAreaList.length - 1; i += 1) {
		LevelGeneratorUtils.placeHall(roomAreaList[i], roomAreaList[i + 1]);
	}
	
	// Connect the last room to the first:
	if (roomAreaList.length > 1) {
		LevelGeneratorUtils.placeHall(roomAreaList[0], roomAreaList[roomAreaList.length - 1]);
	}
	
	// Additional Connections:
	// Connect nearby rooms together if they lack a short path
	roomAreaList.forEach(function (roomArea1) {
		roomAreaList.forEach(function (roomArea2) {
		
			// Skip yourself:
			if (roomArea1 === roomArea2) {
				return;
			}
			
			// Shortest Distance:
			let indexPair = LevelGeneratorUtils.getShortestHallIndexPair(roomArea1, roomArea2);
			if (indexPair) {
				let distance = util.distance(indexPair[0], indexPair[1]);
			
				// Current Distance:
				let currentPath = gs.findPath(indexPair[0], indexPair[1]);

				// Only if close and much shorter than current distance:
				if (currentPath && distance <= 10 && currentPath.length > 4 * distance) {
					LevelGeneratorUtils.placeShortestHall(roomArea1, roomArea2);
				}
			}
	
			
		}, this);
	}, this);
};