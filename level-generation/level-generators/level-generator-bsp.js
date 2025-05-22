/*global game, util, gs, console*/
/*global LevelGeneratorBase, LevelGeneratorUtils, DungeonGenerator, AreaGeneratorCave*/
/*global VAULT_CONTENT, VAULT_PLACEMENT, FEATURE_TYPE*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

let LevelGeneratorBSP = Object.create(LevelGeneratorBase);

// INIT:
// ************************************************************************************************
LevelGeneratorBSP.init = function () {
	this.name = 'LevelGeneratorBSP';
	
	this.PARTITION_FACTOR = [
		1.0, 	// Depth: 0
		0.80, 	// Depth: 1
		0.80, 	// Depth: 2
		0.50, 	// Depth: 3
		0, 		// Depth: 4
	];
};

LevelGeneratorBSP.init();

// GENERATE:
// ************************************************************************************************
LevelGeneratorBSP.generate = function () {
	this.initNumVaults();
    this.numAestheticVaults = util.randInt(1, 3);
    
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	// Base Area:
	let baseNode = new BSPNode(0, 0, NUM_TILES_X, NUM_TILES_Y, 0);

	// Partition Map:
	this.leafNodeList = [];
	this.partitionNode(baseNode);

	// Place Rooms:
	this.roomAreaList = [];
	this.placeRooms();
	
	// Connect Rooms:
	this.connectSubNodes(baseNode);
    
    this.placeSideVaults(1.0);

	// Trim Walls
	LevelGeneratorUtils.trimWalls();
	
	// Place Doors:
	LevelGeneratorUtils.placeDoors();
	
	// Room List:
	gs.areaList = this.roomAreaList;
	
};

// PARTITION_NODE:
// The result of this function is that areaList will be populated with all the leaf areas.
// A binary tree has also been constructed starting from rootArea whose leaves are the leaf areas.
// *************************************************************************
LevelGeneratorBSP.partitionNode = function (node) {
	// BASE CASE (minimum area size reached):
	if (util.frac() > this.PARTITION_FACTOR[node.depth]) {
		this.leafNodeList.push(node);
		return;
	} 
	
	// SQUARE_NODE:
	if (node.box.width === node.box.height) {
		if (util.frac() <= 0.5) {
			node.partitionWide();
		}
		else {
			node.partitionTall();
		}
	}
	// WIDE_NODE:
	else if (node.box.width > node.box.height) {
		node.partitionWide();	
	}
	// TALL_NODE:
	else {
		node.partitionTall();
	}
	
	// Recursive Step:
	this.partitionNode(node.subNode1);
	this.partitionNode(node.subNode2);
};

// PLACE_ROOMS:
// *************************************************************************
LevelGeneratorBSP.placeRooms = function () {
	this.leafNodeList.forEach(function (node) {
		let roomArea = null;
		
		let boundsBox = node.box;
		let maxRoomSize = {width: node.box.width, height: node.box.height};
		
		// Vault Type (forced from Dungeon-Generator):
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
		
		
        // BOSS_VAULTS:
        let bossLevelFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.BOSS && !levelFeature.hasGenerated);
        if (!roomArea && node.depth > 1 && bossLevelFeature) {
            let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.bossName === bossLevelFeature.bossName;

            roomArea = this.tryToPlaceVault(vaultTypeFilter, boundsBox);

            if (roomArea) {
                 bossLevelFeature.hasGenerated = true;
            }
        }
		
		// ZONE_LINE_VAULT:
		let zoneLineFeature =  gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.ZONE_LINE && !levelFeature.hasGenerated);
		if (!roomArea && node.depth > 1 && zoneLineFeature) {
			let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.toZoneName === zoneLineFeature.toZoneName;
			roomArea = this.tryToPlaceVault(vaultTypeFilter, boundsBox);

			if (roomArea) {
				zoneLineFeature.hasGenerated = true;
			}
		}
        
        // Always caves on large nodes:
		if (!roomArea && node.depth <= 2) {
			roomArea = AreaGeneratorCave.generate(boundsBox);
		}
		
        // Challenge Vault:
		if (!roomArea && this.shouldPlaceChallengeVault() && util.frac() <= 0.25) {
			let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.contentType === VAULT_CONTENT.CHALLENGE;
			
			roomArea = this.tryToPlaceVault(vaultTypeFilter, boundsBox, maxRoomSize);
		}
		
		// Aesthetic Vault:
		if (!roomArea && this.numAestheticVaults > 0) {
			let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.contentType === VAULT_CONTENT.AESTHETIC;
			
			roomArea = this.tryToPlaceVault(vaultTypeFilter, boundsBox, maxRoomSize);
			
			if (roomArea) {
				this.numAestheticVaults -= 1;
			}
		}
		
		// Random Room:
		if (!roomArea) {
			roomArea = LevelGeneratorUtils.tryToPlaceRandomRoom(maxRoomSize, boundsBox);
		}
		
		// Failed:
		if (!roomArea) {
			throw 'ERROR [LevelGeneratorBSP.createRooms] - failed to place either a vault or random room';
		}
		
		this.roomAreaList.push(roomArea);
	}, this);
};

// CONNECT_SUB_NODES:
// *************************************************************************
LevelGeneratorBSP.connectSubNodes = function (node) {
	// Base case (area is leaf):
	if (!node.subNode1 || !node.subNode2) {
		return;
	} 
	else {
		this.connectSubNodes(node.subNode1);
		this.connectSubNodes(node.subNode2);
	
		// DEPTH 0:
		if (node.depth === 0) {
			this.placeHalls(node.subNode1, node.subNode2, util.randInt(2, 3));
		} 
		// DEPTH 1:
		else if (node.depth === 1) {
			this.placeHalls(node.subNode1, node.subNode2, 2);
		} 
		// DEPTH 2:
		else if (node.depth === 2) {
			this.placeHalls(node.subNode1, node.subNode2, util.randInt(1, 2));
		} 
		// DEPTH 3+:
		else {
			this.placeHalls(node.subNode1, node.subNode2, 1);
		}
	}
};

// PLACE_HALLS:
// Will place a hall connecting the two sub-nodes:
// *************************************************************************
LevelGeneratorBSP.placeHalls = function (subNode1, subNode2, numHalls) {
	// 1 Hall:
	if (numHalls === 1) {
		LevelGeneratorUtils.placeHall(subNode1.box, subNode2.box);	
	}
	// 2-3 Halls:
	else {
		let xDistance = Math.abs(subNode1.box.centerX - subNode2.box.centerX);
		let yDistance = Math.abs(subNode1.box.centerY - subNode2.box.centerY);
	
		let subNode1SubBoxes, subNode2SubBoxes;
		
		// Horizontal halls:
		if (xDistance >= yDistance) {
			subNode1SubBoxes = util.splitTallBox(subNode1.box);
			subNode2SubBoxes = util.splitTallBox(subNode2.box);
		}
		// Vertical halls:
		else {
			subNode1SubBoxes = util.splitWideBox(subNode1.box);
			subNode2SubBoxes = util.splitWideBox(subNode2.box);
		}
		
		// First hall on subBox:
		if (LevelGeneratorUtils.getHallIndex(subNode1SubBoxes[0]) && LevelGeneratorUtils.getHallIndex(subNode2SubBoxes[0])) {
			LevelGeneratorUtils.placeHall(subNode1SubBoxes[0], subNode2SubBoxes[0]);
		}
		// Failed so just standard hall:
		else {
			LevelGeneratorUtils.placeHall(subNode1.box, subNode2.box);
		}
		
		// Second hall on subBox:
		if (LevelGeneratorUtils.getHallIndex(subNode1SubBoxes[1]) && LevelGeneratorUtils.getHallIndex(subNode2SubBoxes[1])) {
			LevelGeneratorUtils.placeHall(subNode1SubBoxes[1], subNode2SubBoxes[1]);
		}
		// Failed so just standard hall:
		else {
			LevelGeneratorUtils.placeHall(subNode1.box, subNode2.box);
		}
		
		// Optional third hall:
		if (numHalls === 3) {
			LevelGeneratorUtils.placeHall(subNode1.box, subNode2.box);
		}
	}
};

// BSP_NODE:
// *************************************************************************
function BSPNode (startX, startY, endX, endY, depth) {
	this.box = util.createBox(startX, startY, endX, endY);
	
	this.subNode1 = null;
	this.subNode2 = null;
	
	this.depth = depth;
}

// BSP_NODE - PARTITION_WIDE:
// *************************************************************************
BSPNode.prototype.partitionWide = function () {
	let subBoxes = util.splitWideBox(this.box);
	
	this.subNode1 = new BSPNode(subBoxes[0].startX, subBoxes[0].startY, subBoxes[0].endX, subBoxes[0].endY, this.depth + 1);
	this.subNode2 = new BSPNode(subBoxes[1].startX, subBoxes[1].startY, subBoxes[1].endX, subBoxes[1].endY, this.depth + 1);
};

// BSP_NODE - PARTITION_TALL:
// *************************************************************************
BSPNode.prototype.partitionTall = function () {
	let subBoxes = util.splitTallBox(this.box);
	
	this.subNode1 = new BSPNode(subBoxes[0].startX, subBoxes[0].startY, subBoxes[0].endX, subBoxes[0].endY, this.depth + 1);
	this.subNode2 = new BSPNode(subBoxes[1].startX, subBoxes[1].startY, subBoxes[1].endX, subBoxes[1].endY, this.depth + 1);
};