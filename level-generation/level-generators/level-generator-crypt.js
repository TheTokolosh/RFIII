/*global game, util, gs, console*/
/*global LevelGeneratorUtils, ConnectionMap, DungeonGenerator, AreaGeneratorVault*/
/*global VAULT_CONTENT, VAULT_PLACEMENT, FEATURE_TYPE, ORIENTATION*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

let LevelGeneratorCrypt = {};

// INIT:
// ************************************************************************************************
LevelGeneratorCrypt.init = function () {
	this.name = 'LevelGeneratorCrypt';
	
	this.VAULT_SET = 'CryptTemplates';
	this.numNodesX = 3;
	this.numNodesY = 3;
	this.areaSize = Math.floor(NUM_TILES_X / this.numNodesX);
	
};
LevelGeneratorCrypt.init();

// GENERATE:
// ************************************************************************************************
LevelGeneratorCrypt.generate = function () {
	this.roomAreaGrid = util.create2DArray(this.numNodesX, this.numNodesY, (x, y) => null);
	
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	LevelGeneratorUtils.placeTileSquare(1, 1, NUM_TILES_X - 2, NUM_TILES_Y - 2, gs.tileTypes.Floor);
	
	this.placeGridAreas();
};


// PLACE_GRID_AREAS
// ************************************************************************************************
LevelGeneratorCrypt.placeGridAreas = function () {
	let gridAreaTypes = [
		'FILL', 'FILL',
		'EMPTY', 'EMPTY',
		'VAULT', 'VAULT', 'VAULT'
	];
	
	gridAreaTypes.push(util.randElem(['FILL', 'EMPTY', 'VAULT']));
	gridAreaTypes.push(util.randElem(['FILL', 'VAULT']));
	
	gridAreaTypes = util.shuffleArray(gridAreaTypes);
	
	
	
	for (let x = 0; x < this.numNodesX; x += 1) {
		for (let y = 0; y < this.numNodesY; y += 1) {
			let choice = gridAreaTypes.pop();
			
			if (choice === 'FILL') {
				this.fillGridArea(x, y);
			}
			else if (choice === 'VAULT') {
				this.placeCryptVault(x, y);
			}
			else if (choice === 'EMPTY') {
				// Pass
			}
		}
	}
};

// FILL_GRID_AREA:
// ************************************************************************************************
LevelGeneratorCrypt.fillGridArea = function (x, y) {
	let box = util.createBox(x * this.areaSize, y * this.areaSize, (x + 1) * this.areaSize, (y + 1) * this.areaSize);
	
	// Corner:
	if (x === 0 && y === 0) {
		LevelGeneratorUtils.placeTileSquare(box.startX, box.startY, box.endX - 1, box.endY - 1, gs.tileTypes.Wall);
	}
	// Corner:
	else if (x === 0 && y === 2) {
		LevelGeneratorUtils.placeTileSquare(box.startX, box.startY + 1, box.endX - 1, box.endY, gs.tileTypes.Wall);
	}
	// Corner:
	else if (x === 2 && y === 0) {
		LevelGeneratorUtils.placeTileSquare(box.startX + 1, box.startY + 1, box.endX, box.endY - 1, gs.tileTypes.Wall);
	}
	// Corner:
	else if (x === 2 && y === 2) {
		LevelGeneratorUtils.placeTileSquare(box.startX + 1, box.startY + 1, box.endX, box.endY, gs.tileTypes.Wall);
	}
	// Center:
	else if (x === 1 && y === 1) {
		LevelGeneratorUtils.placeTileSquare(box.startX + 1, box.startY + 1, box.endX - 1, box.endY - 1, gs.tileTypes.Wall);
	}
	// Left Edge:
	else if (x === 0 && y === 1) {
		LevelGeneratorUtils.placeTileSquare(box.startX, box.startY + 1, box.endX - 1, box.endY - 1, gs.tileTypes.Wall);
	}
	// Right Edge:
	else if (x === 2 && y === 1) {
		LevelGeneratorUtils.placeTileSquare(box.startX + 1, box.startY + 1, box.endX, box.endY - 1, gs.tileTypes.Wall);
	}
	// Top Edge:
	else if (x === 1 && y === 0) {
		LevelGeneratorUtils.placeTileSquare(box.startX + 1, box.startY, box.endX - 1, box.endY - 1, gs.tileTypes.Wall);
	}
	// Bottom Edge:
	else if (x === 1 && y === 2) {
		LevelGeneratorUtils.placeTileSquare(box.startX + 1, box.startY + 1, box.endX - 1, box.endY, gs.tileTypes.Wall);
	}

};

// PLACE_CRYPT_VAULT:
// ************************************************************************************************
LevelGeneratorCrypt.placeCryptVault = function (x, y) {
	let vaultTypeList = gs.getVaultTypeList(this.VAULT_SET);
	
	let vaultType = util.randElem(vaultTypeList);
	
	let tileIndex = {x: x * this.areaSize + 1, y: y * this.areaSize + 1};
	
	let area = AreaGeneratorVault.generate(tileIndex, vaultType);
	
	this.roomAreaGrid[x][y] = area;
	
	// Create Doors:
	area.hallHookTileIndexList.forEach(function (tileIndex) {
		let horizontal = gs.isPassable(tileIndex.x - 1, tileIndex.y) && gs.isPassable(tileIndex.x + 1, tileIndex.y);
		let vertical = gs.isPassable(tileIndex.x, tileIndex.y - 1) && gs.isPassable(tileIndex.x, tileIndex.y + 1);
		
		// Horizontal Doors:
		if (horizontal || vertical) {
			gs.setTileType(tileIndex, gs.tileTypes.Floor);
			gs.createObject(tileIndex, 'Door');
		}
	}, this);
};



