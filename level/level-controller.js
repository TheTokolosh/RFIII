/*global gs, game, util, console*/
/*global FrameSelector*/
/*global FACTION, LOS_DISTANCE, NPC_SHOUT_TYPE, ACTION_TIME*/
/*jshint esversion: 6*/
'use strict';

var levelController = {};

// ON_GENERATE_LEVEL:
// ************************************************************************************************
levelController.onGenerateLevel = function () {
	this.flags = {};
	
	// Sunless Desert:
	if (gs.zoneName === 'TheSunlessDesert') {
		this.dustStorms = [];

		for (let i = 0; i < 3; i += 1) {
			this.dustStorms.push({
				tileIndex: gs.getPassableIndexInBox(0, 0, gs.numTilesX, gs.numTilesY),
				wanderVector: {x: util.randInt(-1, 1), y: util.randInt(-1, 1)}
			});
		}
	}
	
	// The Vampire Lord:
	if (gs.characterList.find(char => char.type.name === 'TheVampireLord')) {
		this.flags.isVampireLordLevel = true;
		this.flags.batFormTimer = 0;
		this.flags.batFormHpPercent = 0.5;
		this.flags.batFormNum = 8;
	}
	
};

// UPDATE_TURN:
// ************************************************************************************************
levelController.updateTurn = function () {
	// Sunless Desert:
	if (gs.zoneName === 'TheSunlessDesert') {
		for (let i = 0; i < this.dustStorms.length; i += 1) {
			this.updateDustStorm(this.dustStorms[i]);
		}
	}
	
	// The Vampire Lord:
	if (this.flags.isVampireLordLevel) {
		this.updateVampireLordLevel();
	}
};

// UPDATE_VAMPIRE_LORD_LEVEL:
// ************************************************************************************************
levelController.updateVampireLordLevel = function () {
	let isVampireLordAlive = gs.characterList.find(char => char.type.name === 'TheVampireLord');
	let isVampireBatAlive = gs.characterList.find(char => char.type.name === 'VampireBat' && char.faction === FACTION.HOSTILE);
	
	// Reforming Logic:
	if (!isVampireLordAlive && isVampireBatAlive) {
		this.flags.batFormTimer += 1;
		
		// Time to reform:
		if (this.flags.batFormTimer === 5) {
			let charList = gs.characterList.filter(char => char.type.name === 'VampireBat' && char.faction === FACTION.HOSTILE);
			
			let tileIndex = {x: charList[0].tileIndex.x, y: charList[0].tileIndex.y};
			
			// Destroy bats:
			charList.forEach(function (char) {
				char.popUpText('Poof!');
				gs.createParticlePoof(char.tileIndex, 'WHITE');
				
				char.destroy();
			});
			
			// Sound: 
			gs.playSound(gs.sounds.death);
			
			// Summon Effect:
			gs.createSummonEffect(tileIndex, function () {
				// Create Vampire Lord:
				let newNpc = gs.createNPC(tileIndex, 'TheVampireLord');
				newNpc.isAgroed = true;
				newNpc.waitTime = ACTION_TIME;

				levelController.flags.batFormTimer = 0;
				levelController.flags.batFormHpPercent -= 0.1;
			});
		}
	}
	
	// Open gate if everyone is dead:
	if (!isVampireLordAlive && !isVampireBatAlive) {
		let obj = gs.objectList.find(obj => util.inArray(obj.type.name, ['MetalBarsSwitchGate', 'WoodenBarsSwitchGate']));
		if (obj && !obj.isOpen) {
			obj.openDoor();
		}
	}
	
};

// UPDATE_DUST_STORM:
// ************************************************************************************************
levelController.updateDustStorm = function (dustStorm) {
	// Creating dust:
	gs.getIndexListInFlood(dustStorm.tileIndex, gs.isStaticPassable, 2).forEach(function (tileIndex) {
		gs.createCloud(tileIndex, 'Dust', 0, 5);
	}, this);
		
	
	
	// Only move every 3 turns:
	if (gs.turn % 3 === 0) {
		// Moving:
		var toTileIndex = {x: dustStorm.tileIndex.x + dustStorm.wanderVector.x,
						   y: dustStorm.tileIndex.y + dustStorm.wanderVector.y};

		if (gs.isStaticPassable(toTileIndex)) {
			// Changing direction:
			if (util.frac() < 0.05) {
				dustStorm.wanderVector = {x: util.randInt(-1, 1), y: util.randInt(-1, 1)};
			}

			dustStorm.tileIndex.x = toTileIndex.x;
			dustStorm.tileIndex.y = toTileIndex.y;
		}
		// Hit a wall:
		else {
			dustStorm.wanderVector = {x: util.randInt(-1, 1), y: util.randInt(-1, 1)};
		}
	}
};

// TO_DATA:
// ************************************************************************************************
levelController.toData = function () {
	var data = {};
	
	if (gs.zoneName === 'TheSunlessDesert') {
		data.dustStorms = this.dustStorms;
	}
	
	data.flags = this.flags;
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
levelController.loadData = function (data) {
	if (gs.zoneName === 'TheSunlessDesert') {
		this.dustStorms = data.dustStorms;
	}
	
	this.flags = data.flags;
};

// ON_PC_ENTER_TILE:
// ************************************************************************************************
levelController.onPCEnterTile = function (tileIndex) {
    // Standard Drop Walls:
    let indexList = gs.getIndexListInRadius(gs.pc.tileIndex, 3);
	indexList.forEach(function (tileIndex) {
		// Do we see at least 1 dropWall:
		if (gs.getTile(tileIndex).isStandardDropWall && gs.getTile(tileIndex).visible) {
			// Get all tiles that are part of the drop wall:
			let indexList = gs.getIndexListInFlood(tileIndex, index => gs.getTile(index).isStandardDropWall);
			
			if (indexList.length === indexList.filter(index => gs.getTile(index).visible).length) {
				this.explodeWall(indexList);
			}	
		}
    }, this);
    
	// Floor Trigger:
	if (gs.getTile(tileIndex).floorTrigger) {
		this.activateFloorTrigger(tileIndex);
	}
};

// ACTIVATE_FLOOR_TRIGGER:
// ************************************************************************************************
levelController.activateFloorTrigger = function (tileIndex) {
	// Sending signal to toTileIndexList:
	gs.getTile(tileIndex).floorTrigger.toTileIndexList.forEach(function (tileIndex) {
		this.sendSignal(tileIndex);
	}, this);

	// Destroy connected triggers:
	let indexList = gs.getIndexListInFlood(tileIndex, index => gs.getTile(index).floorTrigger);
	indexList.forEach(function (tileIndex) {
		gs.getTile(tileIndex).floorTrigger = null;
	}, this);
};

// SEND_SIGNAL:
// ************************************************************************************************
levelController.sendSignal = function (tileIndex) {
	// Portal Spawn Monsters:
	if (gs.getTile(tileIndex).spawnNPCName) {
		if (gs.isPassable(tileIndex)) {
			gs.createSummonEffect(tileIndex, function () {

				let npc = gs.createNPC(tileIndex, gs.getTile(tileIndex).spawnNPCName);

				if (gs.getTile(tileIndex).spawnNPCIsAgroed) {
					npc.isAgroed = true;
				}
				
				if (gs.activeCharacter() !== gs.pc) {
					npc.waitTime = 100;
				}
				
				// Update the Mini-Map:
				gs.HUD.miniMap.refresh();
				
				// Clear action queue to halt movement:
				if (!gs.pc.statusEffects.has('Charge')) {
					gs.pc.stopExploring();
				}
				
			});
		}
		
		// Sound:
		gs.playSound(gs.sounds.cure, tileIndex);
	}
	
	// Triggered drop walls:
	if (gs.getTile(tileIndex).isTriggeredDropWall) {
		let indexList = gs.getIndexListInFlood(tileIndex, index => gs.getTile(index).isTriggeredDropWall);
		this.explodeWall(indexList);
	}
	
	// Objects:
	if (gs.getObj(tileIndex)) {
		gs.getObj(tileIndex).onTrigger();
	}
};

// EXPLODE_WALL:
// Used by drop walls or triggered drop walls
// Requires a list of tileIndices
// ************************************************************************************************
levelController.explodeWall = function (indexList) {
	indexList.forEach(function (tileIndex) {
		// Set to Floor:
        if (gs.getTile(tileIndex).type.name === 'Wall') {
            gs.setTileType(tileIndex, gs.tileTypes.Floor);
        }
        else {
            gs.setTileType(tileIndex, gs.tileTypes.CaveFloor);
        }
        
        // Destroy Objects:
        if (gs.getObj(tileIndex)) {
			gs.destroyObject(gs.getObj(tileIndex));
		}
        
        gs.getTile(tileIndex).isTriggeredDropWall = false;
		gs.getTile(tileIndex).isStandardDropWall = false;	
        
        // Particles:
		gs.createParticlePoof(tileIndex, 'WHITE');
		
        // Shout:
		gs.shout(tileIndex, FACTION.HOSTILE, true, NPC_SHOUT_TYPE.STRONG);
	}, this);
	
	// Clean Frames:
	indexList.forEach(function (tileIndex) {
		// All adjacent drop wall tiles:
		let floorIndexList = gs.getIndexListInFlood(tileIndex, index => gs.getTile(index).isDropWallRoom);
		
		// Convert to box (one wider to catch walls):
		let box = util.getBoundingBox(floorIndexList);
		box = util.createBox(box.startX - 1, box.startY - 1, box.endX + 1, box.endY + 1);
		
		// Set Frame:
		gs.getIndexListInBox(box).forEach(function (tileIndex) {
			// Don't clean sand:
			if (gs.getTile(tileIndex).frame === 1408) {
				// pass
			}
			else {
				gs.getTile(tileIndex).frame = gs.getZoneTileSetBaseFrame(gs.getTile(tileIndex).type);
			}
			
		}, this);
		
		
        FrameSelector.cleanWallTileFrames(box);
	}, this);
	
	// Set room to explored:
	indexList.forEach(function (tileIndex) {
		let floorIndexList = gs.getIndexListInFlood(tileIndex, index => gs.getTile(index).isDropWallRoom);
		
		floorIndexList.forEach(function (index) {
			gs.setTileIndexVisible(index);
		}, this);
	}, this);
	
	
	game.camera.shake(0.020, 200);
	gs.playSound(gs.sounds.explosion, gs.pc.tileIndex);
	gs.calculateLoS();
	gs.hasNPCActed = true;
};

// YENDOR_BOSS_TELEPORT:
// Runs when teleporting within the Vault-Of-Yendor:
// ************************************************************************************************
levelController.yendorBossTeleport = function () {
	let yendorChar;
	
	// We agro The-Wizard-Yendor as soon as we teleport into his field of view:
	let indexList = gs.getIndexListInFlood(gs.pc.tileIndex, gs.isStaticPassable, 100);
	indexList.forEach(function (index) {
		if (gs.getChar(index) && gs.getChar(index).type.niceName === 'The Wizard Yendor') {
			yendorChar = gs.getChar(index);
			yendorChar.isAgroed = true;
		}
	}, this);
	
	// Dialog:
	gs.popUpYendorGreetingDialog(yendorChar);
};
