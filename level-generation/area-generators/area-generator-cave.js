/*global gs, util*/
/*global LevelGeneratorUtils*/
/*global SPAWN_VINE_PERCENT, MAX_VINES, SUPER_VINE_PERCENT*/
/*global EXCEPTION_TYPE*/
'use strict';

let AreaGeneratorCave = {
	defaultBigMask: [[0, 0, 0, 0],
					 [0, 0, 0, 0],
					 [0, 0, 0, 0],
					 [0, 0, 0, 0]]
};

// GENERATE:
// For tileMask let 0=null, 1=superFloor, 2=superWall
// Never change a tile in superFloor or superWall passed in tileMask
// ********************************************************************************************
AreaGeneratorCave.generate = function (boundsBox, bigMask, tileMask) {		
	var count = 0;
	
	// Setup properties for FA-Generators:
	this.boundsBox = boundsBox;
	bigMask = bigMask || this.defaultBigMask;
	
    while (true) {
		let genFunc = util.randElem([this.tryToPlaceCave1, this.tryToPlaceCave2]);
				
        if (genFunc.call(this, boundsBox.startTileIndex, boundsBox.endTileIndex, bigMask, tileMask)) {
			break;
		}
		
		count += 1;
		if (count > 100) {
			throw {
				type: EXCEPTION_TYPE.AREA_GENERATION,
				text: 'unable to fill cave'
			};
			
		}
    }
	
	let area = LevelGeneratorUtils.createArea(boundsBox.startX, boundsBox.startY, boundsBox.endX, boundsBox.endY, false);
	
	
	
	// Set Area Properties:
	area.areaGenerator = this;
	
	return area;
};

// IN_BOUNDS:
// *************************************************************************
AreaGeneratorCave.inBounds = function (x, y) {
	return x >= 1 &&  y >= 1 && x < this.boundsBox.width - 1 && y < this.boundsBox.height - 1;
};

// FLOOD FUNC:
// Returns a count of all floor tiles
// Returns a floodMap in which 2 indicates a floor tile
// *************************************************************************
AreaGeneratorCave.floodFunc = function (map, startX, startY) {
	var count = 0;
	
	/*
	let iterFunc = function (x, y) {
		if (floodMap[x][y] === -1) {
			if (map[x][y] === 'Floor' || map[x][y] === 'SuperFloor') {
				// How many floor tiles have we found:
				count += 1;

				// We indicate this is part of the flood:
				floodMap[x][y] = 1;

				// Recursive Step:
				if (AreaGeneratorCave.inBounds(x + 1, y)) {
					iterFunc(x + 1, y);
				}
				if (AreaGeneratorCave.inBounds(x - 1, y)) {
					iterFunc(x - 1, y);
				}
				if (AreaGeneratorCave.inBounds(x, y + 1)) {
					iterFunc(x, y + 1);
				}
				if (AreaGeneratorCave.inBounds(x, y - 1)) {
					iterFunc(x, y - 1);
				}
			}
			else {
				floodMap[x][y] = 0; // Indicate Wall:
			}
		}
	};
	*/

	let iterFunc = function (x, y) {
		if (map[x][y] === 'Floor' || map[x][y] === 'SuperFloor') {
			// How many floor tiles have we found:
			count += 1;

			// We indicate this is part of the flood:
			floodMap[x][y] = 1;

			// Recursive Step:
			if (AreaGeneratorCave.inBounds(x + 1, y) && floodMap[x + 1][y] === -1) {
				iterFunc(x + 1, y);
			}
			if (AreaGeneratorCave.inBounds(x - 1, y) && floodMap[x - 1][y] === -1) {
				iterFunc(x - 1, y);
			}
			if (AreaGeneratorCave.inBounds(x, y + 1) && floodMap[x][y + 1] === -1) {
				iterFunc(x, y + 1);
			}
			if (AreaGeneratorCave.inBounds(x, y - 1) && floodMap[x][y - 1] === -1) {
				iterFunc(x, y - 1);
			}
		}
		else {
			floodMap[x][y] = 0; // Indicate Wall:
		}
	};
	
	// Trivial case:
	if (map[startX][startY] === 'Wall' || map[startX][startY] === 'SuperWall') {
		return {count: 0};
	}

	let floodMap = util.create2DArray(this.boundsBox.width, this.boundsBox.height, (x, y) => -1);
	
	iterFunc(startX, startY);
	return {count: count, map: floodMap};
};

// FIND_LARGE_AREA:
// INPUT: areaMap
// OUTPUT: 2D-Map of either 'Wall' or 'Floor'
// OUTPUT: returns null if cannot find a large enough area
// *****************************************************************************
AreaGeneratorCave.findLargeArea = function (areaMap, minOpenPercent) {
	for (let i = 0; i < 50; i += 1) {
		// Select a random position:
		let x = util.randInt(0, this.boundsBox.width - 1);
		let y = util.randInt(0, this.boundsBox.height - 1);

		// Flood from that position (gives us a count of floors, and a map in which 2 indicates a floor):
		let floodResult = this.floodFunc(areaMap, x, y);

		// If we have found a large enough area then copy it into the area map (all other areas become solid):
		if (floodResult.count > this.boundsBox.width * this.boundsBox.height * minOpenPercent) {
			return floodResult.map;
		}
	}
	
	// Failed after 50 tries:
	return null;
};

// PLACE_LARGE_AREA_TILES:
// *****************************************************************************
AreaGeneratorCave.placeLargeAreaTiles = function (startTileIndex, floodMap, tileMask) {
	// Copy area map back to map:
    for (let x = 0; x < this.boundsBox.width; x += 1) {
        for (let y = 0; y < this.boundsBox.height; y += 1) {
		
			// Handle tileMask superFloor by not doing anything (don't want to mess up a vault):
			if (tileMask && tileMask[x][y] !== 0) {
				// Pass for SuperFloor or Super Wall
			}
			// Floor:
			else if (floodMap[x][y] === 1) {
				gs.setTileType({x: startTileIndex.x + x, y: startTileIndex.y + y}, gs.tileTypes.CaveFloor);
			}
			// Wall:
			else {
				gs.setTileType({x: startTileIndex.x + x, y: startTileIndex.y + y}, gs.tileTypes.CaveWall);
			}
        }
    }
};

// INIT_TILE_MAP:
// *****************************************************************************
AreaGeneratorCave.initTileMap = function (initialWeight, bigMask, tileMask) {
	let bigMaskSize = (this.boundsBox.width / 4);
	
	let tileMap = util.create2DArray(this.boundsBox.width, this.boundsBox.height, (x, y) => null);
	
	// Fill the map w/ noise or masked walls/floors
	for (let x = 0; x < this.boundsBox.width; x += 1) {
		for (let y = 0; y < this.boundsBox.height; y += 1) {
			
			// Super Floor from tileMask:
			if (tileMask && tileMask[x][y] === 1) {
				tileMap[x][y] = 'SuperFloor';
			}
			// Super Wall from tileMask:
			else if (tileMask && tileMask[x][y] === 2) {
				tileMap[x][y] = 'SuperWall';
			}
			// Super Wall from Big Mask:
			else if (bigMask[Math.floor(x / bigMaskSize)][Math.floor(y / bigMaskSize)]) {
				tileMap[x][y] = 'SuperWall';
			}
			// Random Wall:
			else if (util.frac() <= initialWeight) {
				tileMap[x][y] = 'Wall';
			}
			// Random Floor:
			else {
				tileMap[x][y] = 'Floor';
			}
		}
	}
									 
	return tileMap;
};

// PLACE_TILE_CAVE_FUNC:
// For tileMask let 0=null, 1=superFloor, 2=superWall
// Never change a tile in superFloor or superWall passed in tileMask
// *****************************************************************************
AreaGeneratorCave.tryToPlaceCave1 = function (fromTileIndex, toTileIndex, bigMask = null, tileMask = null) {
    var areaWidth = toTileIndex.x - fromTileIndex.x,
        areaHeight = toTileIndex.y - fromTileIndex.y,
		minOpenPercent = 0.40,
		initialWeight = 0.40,
        iterateFunc1,
        iterateFunc2,
		countWalls;
    
    // COUNT WALLS:
    // *************************************************************************
    countWalls = function (mapIn, xIn, yIn, dist) {
        var x, y, count = 0;
        for (x = xIn - dist; x <= xIn + dist; x += 1) {
            for (y = yIn - dist; y <= yIn + dist; y += 1) {
				
                if (AreaGeneratorCave.inBounds(x, y)) {
					count += mapIn[x][y] === 'Wall' || mapIn[x][y] === 'SuperWall' ? 1 : 0;
				} 
				else {
					count += 1;
				}
            }
        }
        return count;
    };
    
    // ITERATE FUNC 1:
    // *************************************************************************
    iterateFunc1 = function (oldMap) {
        var newMap = [];
        for (let x = 0;  x < areaWidth; x += 1) {
            newMap[x] = [];
            for (let y = 0; y < areaHeight; y += 1) {
				if (oldMap[x][y] === 'SuperFloor') {
					newMap[x][y] = 'SuperFloor';
				}
				else if (oldMap[x][y] === 'SuperWall') {
					newMap[x][y] = 'SuperWall';
				}
				else if (countWalls(oldMap, x, y, 1) < 5 && countWalls(oldMap, x, y, 2) > 2 && oldMap[x][y] !== 'SuperWall') {
					newMap[x][y] = 'Floor';
				} 
				else {
					newMap[x][y] = 'Wall';
				}
            }
        }
        return newMap;
    };
    
    // ITERATE FUNC 2:
    // *************************************************************************
    iterateFunc2 = function (oldMap) {
        var newMap = [];
        for (let x = 0;  x < areaWidth; x += 1) {
            newMap[x] = [];
            for (let y = 0; y < areaHeight; y += 1) {
				if (oldMap[x][y] === 'SuperFloor') {
					newMap[x][y] = 'SuperFloor';
				}
				else if (oldMap[x][y] === 'SuperWall') {
					newMap[x][y] = 'SuperWall';
				}
				else if (countWalls(oldMap, x, y, 1) < 5 && oldMap[x][y] !== 'SuperWall') {
					newMap[x][y] = 'Floor';
				} 
				else {
					newMap[x][y] = 'Wall';
				}
            }
        }
        return newMap;
    };
    
    // FILL CAVE:
    // *************************************************************************
    // Initial Noise:
    let areaMap = this.initTileMap(initialWeight, bigMask, tileMask);
	
    // First Iteration:
    for (let i = 0; i < 4; i += 1) {
        areaMap = iterateFunc1(areaMap);
    }
    
    // Second Iteration:
    for (let i = 0; i < 3; i += 1) {
        areaMap = iterateFunc2(areaMap);
    }
    
	// Find Large Area
	let floodMap = this.findLargeArea(areaMap, minOpenPercent);
	
	// Place tiles for the largest area:
	if (floodMap) {
		this.placeLargeAreaTiles(fromTileIndex, floodMap, tileMask);
		return true;
	}
	// Failed to find a large enought area:
	else {
		return false;
	}
};

// PLACE_TILE_CAVE_FUNC:
// *****************************************************************************
AreaGeneratorCave.tryToPlaceCave2 = function (fromTileIndex, toTileIndex, bigMask = null, tileMask = null) {
    var areaWidth = toTileIndex.x - fromTileIndex.x,
        areaHeight = toTileIndex.y - fromTileIndex.y,
		minOpenPercent = 0.40,
		initialWeight = 0.35,
        countWalls,
        iterateFunc1,
        iterateFunc2;
   
    // COUNT WALLS:
    // *************************************************************************
    countWalls = function (mapIn, xIn, yIn, dist) {
        var x, y, count = 0;
        for (x = xIn - dist; x <= xIn + dist; x += 1) {
            for (y = yIn - dist; y <= yIn + dist; y += 1) {
                if (!AreaGeneratorCave.inBounds(x, y) || mapIn[x][y] === 'Wall' || mapIn[x][y] === 'SuperWall') {
					count += 1;
				} 
            }
        }
        return count;
    };
    
    // ITERATE FUNC 1:
    // *************************************************************************
    iterateFunc1 = function (oldMap) {
        var newMap = [];
        for (let x = 0;  x < areaWidth; x += 1) {
            newMap[x] = [];
            for (let y = 0; y < areaHeight; y += 1) {
				if (oldMap[x][y] === 'SuperFloor') {
					newMap[x][y] = 'SuperFloor';
				}
				else if (oldMap[x][y] === 'SuperWall') {
					newMap[x][y] = 'SuperWall';
				}
				else if (countWalls(oldMap, x, y, 1) >= 5 || countWalls(oldMap, x, y, 2) <= 2) {
					newMap[x][y] = 'Wall';
				}
				else {
					newMap[x][y] = oldMap[x][y];
				}
            }
        }
        return newMap;
    };
    
    // ITERATE FUNC 2:
    // *************************************************************************
    iterateFunc2 = function (oldMap) {
        var newMap = [];
        for (let x = 0;  x < areaWidth; x += 1) {
            newMap[x] = [];
            for (let y = 0; y < areaHeight; y += 1) {
				if (oldMap[x][y] === 'SuperFloor') {
					newMap[x][y] = 'SuperFloor';
				}
				else if (oldMap[x][y] === 'SuperWall') {
					newMap[x][y] = 'SuperWall';
				}
				else if (countWalls(oldMap, x, y, 1) < 5 && oldMap[x][y] !== 'SuperWall') {
					newMap[x][y] = 'Floor';
				} 
				else {
					newMap[x][y] = 'Wall';
				}
            }
        }
        return newMap;
    };
    
    // FILL CAVE:
    // *************************************************************************
    let areaMap = this.initTileMap(initialWeight, bigMask, tileMask);
	
    // First Iteration:
    for (let i = 0; i < 4; i += 1) {
        areaMap = iterateFunc1(areaMap);
    }
    
    // Second Iteration:
    for (let i = 0; i < 3; i += 1) {
        areaMap = iterateFunc2(areaMap);
    }
    
	// Find Large Area
	let floodMap = this.findLargeArea(areaMap, minOpenPercent);
	
	// Place tiles for the largest area:
	if (floodMap) {
		this.placeLargeAreaTiles(fromTileIndex, floodMap, tileMask);
		return true;
	}
	// Failed to find a large enought area:
	else {
		return false;
	}
};

// DRESS_AREA:
// *****************************************************************************
AreaGeneratorCave.dressArea = function (area) {
	let zoneName = gs.zoneType().name,
		dressingFunc = null;
		
	if (util.inArray(zoneName, ['TestZone', 'TheUpperDungeon', 'TheOrcFortress', 'TheDarkTemple', 'TheIronForge', 'TheArcaneTower', 'TheCrypt'])) {
		dressingFunc = util.chooseRandom([
			{name: this.dressWaterCave, percent: 50},
			{name: this.dressGrassCave, percent: 50}
		]);
	}
	
	if (zoneName === 'TheUnderGrove') {
		dressingFunc = util.chooseRandom([
			{name: this.dressGroveWaterCave, percent: 50},
			{name: this.dressGroveCave, percent: 50}
		]);
	}
	
	if (zoneName === 'TheSwamp') {
		dressingFunc = this.dressSwampCave;
	}
	
	if (zoneName === 'TheSunlessDesert') {
		dressingFunc = this.dressDesertCave;
	}
	
	if (zoneName === 'TheCore') {
		dressingFunc = this.dressLavaCave;
	}
	
	if (zoneName === 'TheIceCaves') {
		dressingFunc = util.chooseRandom([
			{name: this.dressSnowForest, percent: 100},
		]);
	}
	
	if (dressingFunc) {
		dressingFunc.call(this, area);
	}
	
};

// DRESS_SWAMP_CAVE:
// ************************************************************************************************
AreaGeneratorCave.dressSwampCave = function (area) {
	var waterDistance = 2.5,
		indexList,
		num;
	
	// Initial fill (distance to wall):
	indexList = gs.getAllIndex();
	indexList = indexList.filter(tileIndex => !gs.getArea(tileIndex) || !gs.getArea(tileIndex).isVault);
	indexList = indexList.filter(tileIndex => gs.isPassable(tileIndex));
	indexList = indexList.filter(tileIndex => LevelGeneratorUtils.distanceToTile(tileIndex, index => !gs.isPassable(index)) >= waterDistance);
	
	indexList.forEach(function (tileIndex) {
		gs.setTileType(tileIndex, gs.tileTypes.Water);
	}, this);
	
	// Flooding individual water tiles:
	// Any tile that has less than 2 neighbours (helps to fill little dangling bits)
	indexList = gs.getAllIndex();
	indexList = indexList.filter(index => !gs.getArea(index) || !gs.getArea(index).isVault);
	indexList = indexList.filter(index => gs.getTile(index).type.name === 'Water');
	indexList = indexList.filter(index => gs.getIndexListCardinalAdjacent(index).reduce((pv, nv) => pv + (gs.getTile(nv).type.name === 'Water' ? 1 : 0), 0) < 2);
	indexList.forEach(function (index) {
		gs.getIndexListInRadius(index, 2.5).forEach(function (idx) {
			if (gs.isPassable(idx)) {
				gs.setTileType(idx, gs.tileTypes.Water);
			}
		}, this);
	}, this);
	
	
	// Tiki Torches:
	num = util.randInt(1, 12);
	for (let i = 0; i < num; i += 1) {
		let tileIndex = gs.getWideOpenIndexInLevel();
		if (tileIndex) {
			gs.createObject(tileIndex, 'TikiTorch');
		}
	}
	
	// Water Stalagemite:
	indexList = gs.getAllIndex();
	indexList = indexList.filter(index => !gs.getObj(index) && gs.getTile(index).type.name === 'Water');
	indexList = indexList.filter(index => gs.isWidePassable(index));
	util.randSubset(indexList, 12).forEach(function (index) {
		gs.createObject(index, 'WaterStalagmite', 2049);
	}, this);
	
	// Water Tree:
	indexList = gs.getAllIndex();
	indexList = indexList.filter(index => !gs.getObj(index) && gs.getTile(index).type.name === 'Water');
	indexList = indexList.filter(index => gs.isWidePassable(index));
	util.randSubset(indexList, 12).forEach(function (index) {
		gs.createObject(index, 'WaterTree');
	}, this);
	
	// Trees:
	indexList = gs.getAllIndex();
	indexList = indexList.filter(index => gs.getTile(index).type.name === 'CaveFloor');
	indexList = indexList.filter(index => gs.isWideOpen(index));
	util.randSubset(indexList, Math.min(12, indexList.length)).forEach(function (index) {
		gs.createObject(index, 'Tree', 2054);
	}, this);
	
	
	// Water grass:
	indexList = gs.getAllIndex();
	indexList = indexList.filter(index => gs.isIndexOpen(index));
	indexList = indexList.filter(index => gs.getIndexListCardinalAdjacent(index).reduce((pv, nv) => pv + (gs.getTile(nv).type.name === 'Water' ? 1 : 0), 0) >= 1);
	indexList.forEach(function (tileIndex) {
		if (util.frac() <= 0.1) {
			gs.createVinePatch(tileIndex, util.randInt(1, 2), 'LongGrass');
		}
	}, this);
};

// DRESS_WATER_CAVE:
// ************************************************************************************************
AreaGeneratorCave.dressWaterCave = function (area) {
	var tileArea, maxObjs, maxPatches;
	
	// The total tileArea will generally be:
	// 40x40 = 1600
	// 40x20 = 800, 
	// 20x20 = 400:
	tileArea = util.boxTileArea(area);
	maxObjs = Math.ceil(tileArea / 100);
	maxPatches = Math.ceil(tileArea / 400);
	
	
	this.createLakes(area, gs.tileTypes.Water);

	// Stalagmites:
	this.createObjects(area, 'Stalagmite', maxObjs);
	
	// Water Stalagmites:
	this.createWaterObjects(area, 'WaterStalagmite', Math.floor(maxObjs / 2));
	
	// Rubble:
	if (util.frac() < 0.25) {
		this.createObjectPatches(area, 'Rubble', maxPatches, 1, 4, 0.75);
	}
};

// DRESS_SNOW_FOREST:
// ************************************************************************************************
AreaGeneratorCave.dressSnowForest = function (area) {
	// The total tileArea will generally be 40x40 = 1600, 40x20 = 800, 20x20 = 400:
	let tileArea = util.boxTileArea(area);
	let maxObjs = Math.ceil(tileArea / 100); // 16 for 40x40
	let maxBigTrees = Math.ceil(tileArea / 400); // 4 for 40x40
	
	// Stallagmites:
	this.createObjects(area, 'Stalagmite', maxObjs, 3264);
	
	// Trees:
	this.createObjects(area, 'Tree', maxObjs, 3272);
	
	// Big Tree:
	if (util.frac() < 0.25) {
		for (let i = 0; i < maxBigTrees; i += 1) {
			let box = gs.getOpenBoxInArea(area, 4, 4);
			if (box) {
				gs.createObject({x: box.startX + 1, y: box.startY + 1}, 'Tree', 3275);
				gs.createObject({x: box.startX + 2, y: box.startY + 1}, 'Tree', 3276);
				gs.createObject({x: box.startX + 1, y: box.startY + 2}, 'Tree', 3273);
				gs.createObject({x: box.startX + 2, y: box.startY + 2}, 'Tree', 3274);
			}
		}
	}
};

// DRESS_DESERT_CAVE:
// ************************************************************************************************
AreaGeneratorCave.dressDesertCave = function (area) {
	var tileArea, maxObjs, maxPatches;
	
	// The total tileArea will generally be 40x40 = 1600, 40x20 = 800, 20x20 = 400:
	tileArea = util.boxTileArea(area);
	maxObjs = Math.ceil(tileArea / 100);
	maxPatches = Math.ceil(tileArea / 400);
	
	// Stalagmites:
	this.createObjects(area, 'Stalagmite', maxObjs, 1664);
	
	// Cactus:
	if (util.frac() < 0.5) {
		this.createObjects(area, 'Cactus', maxObjs);
	}
	
	// Rubble:
	if (util.frac() < 0.5) {
		this.createObjectPatches(area, 'Rubble', maxPatches, 1, 4, 0.75);
	}
	
	// Bone Patch:
	if (util.frac() < SPAWN_VINE_PERCENT) {
		let num = util.randInt(Math.ceil(MAX_VINES / 2), MAX_VINES);
		
		// Super Vines:
		if (util.frac() < SUPER_VINE_PERCENT) {
			num = MAX_VINES * 5;
		}
		
		for (let i = 0; i < num; i += 1) {
			let tileIndex = gs.getOpenIndexInLevel();
			if (tileIndex) {
				gs.createVinePatch(tileIndex, util.randInt(2, 4), 'Bones', 0.5);
			}
		}
	}
};

// DRESS_GRASS_CAVE:
// ************************************************************************************************
AreaGeneratorCave.dressGrassCave = function (area) {
	var tileArea, maxObjs, maxPatches;

	// The total tileArea will generally be 40x40 = 1600, 40x20 = 800, 20x20 = 400:
	tileArea = util.boxTileArea(area);
	maxObjs = Math.ceil(tileArea / 100);
	maxPatches = Math.ceil(tileArea / 400);
	
	// Stalagmites:
	this.createObjects(area, 'Stalagmite', maxObjs);
	
	// Grass:
	this.createObjectPatches(area, 'LongGrass', maxPatches, 2, 4, 0.50);
	
	// Rubble:
	if (util.frac() < 0.5) {
		this.createObjectPatches(area, 'Rubble', maxPatches, 1, 4, 0.75);
	}
};

// DRESS_GROVE_CAVE:
// An undergrove cave with folliage
// ************************************************************************************************
AreaGeneratorCave.dressGroveCave = function (area) {
	var tileArea, maxGrass, maxObjs;
	
	// The total tileArea will generally be 40x40 = 1600, 40x20 = 800, 20x20 = 400:
	tileArea = util.boxTileArea(area);
	maxObjs = Math.ceil(tileArea / 100);
	maxGrass = Math.ceil(tileArea / 400); // 4,3,2,1
	
	// Big Tree:
	if (util.frac() < 0.25) {
		for (let i = 0; i < maxGrass; i += 1) {
			let box = gs.getOpenBoxInArea(area, 4, 4);
			if (box) {
				gs.createObject({x: box.startX + 1, y: box.startY + 1}, 'Tree', 2435);
				gs.createObject({x: box.startX + 2, y: box.startY + 1}, 'Tree', 2436);
				gs.createObject({x: box.startX + 1, y: box.startY + 2}, 'Tree', 2433);
				gs.createObject({x: box.startX + 2, y: box.startY + 2}, 'Tree', 2434);
			}
		}
	}
	
	// Ferns:
	this.createObjects(area, 'Fern', maxObjs);
	
	// Stalagmites
	if (util.frac() < 0.5) {
		this.createObjects(area, 'Stalagmite', maxObjs);
	}
	// Trees:
	else {
		this.createObjects(area, 'Tree', maxObjs, 2432);
	}
	
	// Grass Patches:
	this.createObjectPatches(area, 'LongGrass', maxGrass, 2, 6, 0.50);
};

// DRESS_GROVE_WATER_CAVE:
// An Under Grove cave with lakes, rivers and folliage
// ************************************************************************************************
AreaGeneratorCave.dressGroveWaterCave = function (area) {
	this.createLakes(area, gs.tileTypes.Water);
	this.dressGroveCave(area);
};

// DRESS_LAVA_CAVE:
// ************************************************************************************************
AreaGeneratorCave.dressLavaCave = function (area) {
	var tileArea, maxObjs, maxPatches;
	
	// The total tileArea will generally be 40x40 = 1600, 40x20 = 800, 20x20 = 400:
	tileArea = util.boxTileArea(area);
	maxObjs = Math.ceil(tileArea / 100);
	maxPatches = Math.ceil(tileArea / 400);

	// Lava:
	this.createLakes(area, gs.tileTypes.Lava);

	// Stalagmites:
	this.createObjects(area, 'Stalagmite', maxObjs, 2816);
	
	// Rubble:
	if (util.frac() < 0.25) {
		this.createObjectPatches(area, 'Rubble', maxPatches, 1, 4, 0.75);
	}
};

// CREATE_OBJECTS:
// Places 1-max objects in the area on wideOpen tiles
// ************************************************************************************************
AreaGeneratorCave.createObjects = function (area, typeName, max, frame = null) {
	var tileIndex, num;
	
	num = util.randInt(1, max);
	
	for (let i = 0; i < num; i += 1) {
		let indexList = gs.getIndexListInArea(area);
		indexList = indexList.filter(tileIndex => gs.isWideOpen(tileIndex));
		indexList = indexList.filter(tileIndex => gs.getTile(tileIndex).type.name === 'CaveFloor');
		
		if (indexList.length > 0) {
			let tileIndex = util.randElem(indexList);
			gs.createObject(tileIndex, typeName, frame);
		}
	}
};

// CREATE_WATER_OBJECTS:
// Places 1-max objects in the area on wideOpen water tiles:
// ************************************************************************************************
AreaGeneratorCave.createWaterObjects = function (area, typeName, max) {
	let tileIndex, num, indexList;
	
	indexList = gs.getIndexListInArea(area);
	indexList = indexList.filter(index => gs.getTile(index).type === gs.tileTypes.Water);
	
	
	
	num = util.randInt(1, max);
	
	
	for (let i = 0; i < num; i += 1) {
		indexList = indexList.filter(index => !gs.getObj(index) && gs.isWidePassable(index));
		
		if (indexList.length > 0) {
			tileIndex = util.randElem(indexList);
			gs.createObject(tileIndex, typeName);
		}
	}
};

// CREATE_OBJECT_PATCHES:
// Places 1-maxPatches patches in the area on wideOpen tiles
// ************************************************************************************************
AreaGeneratorCave.createObjectPatches = function (area, typeName, maxPatches, minSize, maxSize, percent) {
	var num, tileIndex, pred;
	
	pred = function (tileIndex) {
		return gs.getTile(tileIndex).type.name === 'CaveFloor';
	};
	
	num = util.randInt(1, maxPatches);
	
	for (let i = 0; i < num; i += 1) {
		let indexList = gs.getIndexListInArea(area);
		indexList = indexList.filter(tileIndex => gs.isIndexOpen(tileIndex));
		indexList = indexList.filter(tileIndex => gs.getTile(tileIndex).type.name === 'CaveFloor');
		
		if (indexList.length > 0) {
			let tileIndex = util.randElem(indexList);
			gs.createVinePatch(tileIndex, util.randInt(minSize, maxSize), typeName, percent, pred);
		}
	}
};

// CREATE_LAKES:
// ************************************************************************************************
AreaGeneratorCave.createLakes = function (area, tileType) {
	let tileArea = util.boxTileArea(area);
	// 40x40 = 8
	// 40x20 = 4
	// 20x20 = 2
	let maxLakes = Math.ceil(tileArea / 200);
	let minLakes = Math.ceil(maxLakes / 2);
	let numLakes = util.randInt(minLakes, maxLakes);
	
	var waterIndexList = [];

	// Water:
	for (let i = 0; i < numLakes; i += 1) {
		let indexList = gs.getIndexListInArea(area);
		indexList = indexList.filter(function (tileIndex) {
			return gs.getTile(tileIndex).type.name === 'CaveFloor'
				&& !gs.getObj(tileIndex)
				&& !gs.getChar(tileIndex)
				&& !gs.getItem(tileIndex)
				&& !gs.getTile(tileIndex).isClosed;
		}, this);
		
		if (indexList.length > 0) {
			let tileIndex = util.randElem(indexList);
			this.floodTileType(tileIndex, tileType, util.randInt(3, 7));
			waterIndexList.push(tileIndex);
		}
	}

	// Don't make rivers near pits:
	let canWalkFunc = function (tileIndex) {
		return gs.getIndexListAdjacent(tileIndex).filter(index => gs.isPit(index)).length === 0;
	};
	
	// First River:
	if (util.frac() < 0.75 && numLakes > 1) {
		let path = gs.findPath(waterIndexList[0], waterIndexList[1], {noDiagonal: true, maxDepth: 1000, canWalkFunc: canWalkFunc});
		if (path && path.length > 0) {
			for (let i = 0; i < path.length; i += 1) {
				gs.setTileType(path[i], tileType);
			}
		}
	}

	// Second River:
	if (util.frac() < 0.50 && numLakes > 2) {
		let path = gs.findPath(waterIndexList[1], waterIndexList[2], {noDiagonal: true, maxDepth: 1000, canWalkFunc: canWalkFunc});
		if (path && path.length > 0) {
			for (let i = 0; i < path.length; i += 1) {
				gs.setTileType(path[i], tileType);
			}
		}
	}

	// Grass around water:
	if (tileType === gs.tileTypes.Water) {
		gs.getIndexListInArea(area).forEach(function (tileIndex) {
			if (gs.isIndexOpen(tileIndex) && gs.getIndexListCardinalAdjacent(tileIndex).find(index => gs.getTile(index).type.name === 'Water')) {
				gs.createVinePatch(tileIndex, util.randInt(1, 3), 'LongGrass', 1.0, tileIndex => gs.getTile(tileIndex).type.name === 'CaveFloor');
			}
		}, this);
	}
};

// FLOOD_TILE_TYPE:
// ************************************************************************************************
AreaGeneratorCave.floodTileType = function (tileIndex, tileType, maxDepth) {
	var area = gs.getTile(tileIndex).area,
		floodFunc,
		index;


	// FLOOD FUNC:
	// *************************************************************************
	floodFunc = function (x, y, depth) {
		// Max depth reached:
		if (depth > maxDepth) {
			return;
		}
		
		// Narrow hall:
		if ((!gs.isPassable(x + 1, y) && !gs.isPassable(x - 1, y)) || (!gs.isPassable(x, y + 1) && !gs.isPassable(x, y - 1))) {
			return;
		}
		
		// Non-Cave:
		if (gs.getTile(x, y).type.name !== 'CaveFloor') {
			return;
		}

		// Set Tile Type:
		gs.setTileType({x: x, y: y}, tileType);

		// Recursive Calls:
		if (gs.isIndexOpen(x + 1, y)) {
			floodFunc(x + 1, y, depth + 1);
		}
		if (gs.isIndexOpen(x - 1, y)) {
			floodFunc(x - 1, y, depth + 1);
		}
		if (gs.isIndexOpen(x, y + 1)) {
			floodFunc(x, y + 1, depth + 1);
		}
		if (gs.isIndexOpen(x, y - 1)) {
			floodFunc(x, y - 1, depth + 1);
		}
	};
		
	// Call with initial position:
	floodFunc(tileIndex.x, tileIndex.y, 0);
	

	// NUM_WATER_WALL_NEIGHBOURS:
	// *************************************************************************
	let numWaterWallNeighbours = function (x, y) {
		var count = 0;
		count += gs.isInBounds(x + 1, y) && (gs.getTile(x + 1, y).type === tileType || !gs.isIndexOpen(x + 1, y)) ? 1 : 0;
		count += gs.isInBounds(x - 1, y) && (gs.getTile(x - 1, y).type === tileType || !gs.isIndexOpen(x - 1, y)) ? 1 : 0;
		count += gs.isInBounds(x, y + 1) && (gs.getTile(x, y + 1).type === tileType || !gs.isIndexOpen(x, y + 1)) ? 1 : 0;
		count += gs.isInBounds(x, y - 1) && (gs.getTile(x, y - 1).type === tileType || !gs.isIndexOpen(x, y - 1)) ? 1 : 0;
		return count;
	};

	// NUM_WATER_NEIGHBOURS:
	// *************************************************************************
	let numWaterNeighbours = function (x, y) {
		var count = 0;
		count += gs.isInBounds(x + 1, y) && gs.getTile(x + 1, y).type === tileType ? 1 : 0;
		count += gs.isInBounds(x - 1, y) && gs.getTile(x - 1, y).type === tileType ? 1 : 0;
		count += gs.isInBounds(x, y + 1) && gs.getTile(x, y + 1).type === tileType ? 1 : 0;
		count += gs.isInBounds(x, y - 1) && gs.getTile(x, y - 1).type === tileType ? 1 : 0;
		return count;
	};
	
	// NUM_WALLS:
	let numWallNeighbours = function (tileIndex) {
		return gs.getIndexListCardinalAdjacent(tileIndex).filter(index => !gs.isPassable(index)).length;
		
	};
	
	
	gs.getIndexListInArea(area).forEach(function (tileIndex) {
		let numWater = numWaterNeighbours(tileIndex.x, tileIndex.y);
		let numWalls = numWallNeighbours(tileIndex);
		let numWaterWalls = numWaterWallNeighbours(tileIndex.x, tileIndex.y);
		
		if (gs.isIndexOpen(tileIndex) && numWater >= 1 && numWaterWalls >= 3) {
			gs.setTileType(tileIndex, tileType);
		}
		
		if (gs.getTile(tileIndex).type === tileType && numWater === 1 && numWalls === 0) {
			gs.setTileType(tileIndex, gs.tileTypes.CaveFloor);
		}
	}, this);
	
	
};


