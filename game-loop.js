/*global gs, game, Phaser, console, debug*/
/*global levelController*/
/*global HUD_WIDTH, FACTION, ACTION_TIME*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';
// UPDATE:
// ************************************************************************************************
gs.update = function () {
	if (gs.debugProperties.levelViewMode) {
		debug.updateLevelViewMode();
		return;
	}
	
	// Update State Menus:
	this.stateManager.update();
	
	if (this.globalState === 'MAIN_MENU_STATE') {
		this.mainMenuBase.update();
		return;
	}
	
	this.updateProjectiles();
	this.updateObjects();
	this.updateParticles();
	this.updateParticleGenerators();
	
	if (this.pauseTime > 0) {
		this.pauseTime -= 1;
	}
	
	// NPCs will pause before using abilities until the player finishes moving:
	if (this.activeCharacter().state === 'PAUSE' && gs.pc.body.state === 'WAITING') {
		this.activeCharacter().state = 'WAITING';
	}
		
	if (gs.stateManager.isCurrentState('EndTurn')) {
		if (this.allCharactersReady()) {
			this.startTurn();
			gs.stateManager.clearStates();
		}
	}
	else if (gs.pc.currentHp > 0 && gs.pauseTime === 0) {
		// Characters can start their turn once they have finished moving:
		if (this.activeCharacter().waitingToStartTurn && this.activeCharacter().body.state === 'WAITING') {
			this.activeCharacter().waitingToStartTurn = false;
			this.activeCharacter().onStartTurn();
		}
		
		// Player chooseAction:
		if (this.activeCharacter() === this.pc && this.canCharacterAct(this.pc)) {
			this.pc.chooseAction();
		}
		
		// Characters can start their turn once they have finished moving:
		if (this.activeCharacter().waitingToStartTurn && this.activeCharacter().body.state === 'WAITING') {
			this.activeCharacter().waitingToStartTurn = false;
			this.activeCharacter().onStartTurn();
		}

		// NPC chooseAction:
		// As long as a character does not perform a blocking action, many characters can chooseAction in the same frame
		// This makes turns much faster
		while (this.canCharacterAct(this.activeCharacter()) && (this.activeCharacter() !== this.pc || this.pc.actionQueue.length > 0 && this.pc.actionQueue[0].type === 'WAIT')) {
			// Characters can start their turn once they have finished moving:
			if (this.activeCharacter().waitingToStartTurn && this.activeCharacter().body.state === 'WAITING') {
				this.activeCharacter().waitingToStartTurn = false;
				this.activeCharacter().onStartTurn();
			}
			
			this.activeCharacter().chooseAction();
		}
	}
	
	// Update sprites:
	this.updateCharacterFrames();
	this.updatePopUpText();
	this.updateHUDTileSprites();
	this.HUD.refresh();
	this.messageQueue.update();
	
	// Update camera:
	if (gs.globalData.focusCamera) {
		this.focusCameraOnPC();
	}
	
	
	
	this.updateTileMapSprites();
	
	gs.objectSpritesGroup.sort('y', Phaser.Group.SORT_ASCENDING);
	
	gs.characterList.forEach(function (char) {
		if (char.isAlive && char.type.phaseWalls) {
			gs.objectSpritesGroup.bringToTop(char.sprite);
		}
	}, this);
};

// FOCUS_CAMERA_ON_PC:
// ************************************************************************************************
gs.focusCameraOnPC = function () {
	game.camera.focusOnXY(this.pc.body.position.x + HUD_WIDTH / 2, this.pc.body.position.y);
	
	this.shadowMaskSprite.x = this.pc.body.position.x;
	this.shadowMaskSprite.y = this.pc.body.position.y;
	this.shadowMaskSprite.visible = false; // Turned off for now Jan-31-2020
};


// CAN_CHARACTER_ACT:
// ************************************************************************************************
gs.canCharacterAct = function (character) {
	return this.projectileList.length === 0
		&& gs.pauseTime === 0
		&& gs.stateManager.isCurrentState('GameState')
		&& character.state === 'WAITING'
		&& character.body.state === 'WAITING';
};



// ALL_CHARACTERS_READY:
// Use this to determine if all characters have completed movement
// ************************************************************************************************
gs.allCharactersReady = function () {
	for (let i = 0; i < this.characterList.length; i += 1) {
		if (this.characterList[i].isAlive && (this.characterList[i].body.state !== 'WAITING' || this.characterList[i].eventQueue.isProcessing())) {
			return false;
		}
	}
	
	if (this.projectileList.length > 0) {
		return false;
	}

	
	return true;
};

// END_TURN:
// ************************************************************************************************
gs.endTurn = function () {
	if (!gs.stateManager.isCurrentState('DialogMenu') && (this.projectileList.length > 0 || this.activeCharacter().eventQueue.isProcessing())) {
		gs.stateManager.pushState('EndTurn');
	}
	else {
		this.startTurn();
	}
};

// REMOVE_DEAD_CHARACTERS:
// ************************************************************************************************
gs.removeDeadCharacters = function () {
	// Remove dead Characters:
    for (let i = this.characterList.length - 1; i >= 0; i -= 1) {
        if (!this.characterList[i].isAlive && this.characterList[i] !== gs.pc) {
            this.characterList.splice(i, 1);
        }
    }
};


// START_TURN:
// ************************************************************************************************
gs.startTurn = function () {
	// Dead player:
	if (!gs.pc.isAlive) {
		this.activeCharacterIndex = 0;
		return;
	}
	
	var lastActiveCharacter = this.activeCharacter();
	
	// Remove Dead Characters:
	this.removeDeadCharacters();
	if (this.activeCharacterIndex >= this.characterList.length) {
		this.activeCharacterIndex = 0;
	}
	
	// Ticking the global clock:
	if (lastActiveCharacter === this.pc) {
		this.globalTurnTimer += gs.pc.waitTime;
	}
		
	// Find the next active character:
	while (this.characterList[this.activeCharacterIndex].waitTime > 0) {
		this.characterList[this.activeCharacterIndex].waitTime -= 50;
		this.activeCharacterIndex += 1;
		if (this.activeCharacterIndex >= this.characterList.length) {
			this.activeCharacterIndex = 0;
		}
	}
	
	// Global Turns:
	if (this.activeCharacter() === this.pc) {
		while (this.globalTurnTimer >= 100) {
			this.globalTurnTimer -= 100;
			this.updateGlobalTurn();
		}
	}
	
	this.activeCharacter().waitingToStartTurn = true;
};

// LIVE_CHARACTER_LIST:
// ************************************************************************************************
gs.liveCharacterList = function () {
	return this.characterList.filter(char => char.isAlive);
};

// SET_ACTIVE_CHARACTER:
// ************************************************************************************************
gs.setActiveCharacter = function (character) {
	for (let i = 0; i < this.characterList.length; i += 1) {
		if (this.characterList[i] === character) {
			this.activeCharacterIndex = i;
			break;
		}
	}
};

// ACTIVE_CHARACTER:
// ************************************************************************************************
gs.activeCharacter = function () {
	return this.characterList[this.activeCharacterIndex];
};

// GET_NEXT_ACTIVE_CHARACTER_INDEX:
// ************************************************************************************************
gs.getNextActiveCharacterIndex = function () {
	if (this.activeCharacterIndex >= this.characterList.length - 1) {
		return 0;
	}
	else {
		return this.activeCharacterIndex + 1;
	}
};


// IS_NEARBY_DANGER:
// ************************************************************************************************
gs.isNearbyDanger = function () {
	return this.areEnemiesAgroed() || this.numVisibleDangers();
};

// ARE_ENEMIES_AGROED:
// This is used to halt exploration, resting, movement etc.
// ************************************************************************************************
gs.areEnemiesAgroed = function () {
	return this.hasNPCActed || gs.characterList.find(char => char.faction === FACTION.HOSTILE && char.isAgroed && char.isAlive && (!char.type.isImmobile || gs.getTile(char.tileIndex).visible));
};

// NUM_VISIBLE_DANGERS:
// Returns a count of visible dangers i.e. hostile monsters, bombs, ice eggs etc.
// ************************************************************************************************
gs.numVisibleDangers = function () {
	var count = 0;
	
	count += this.numVisibleMonsters();
	
	// Count dangerous objects:
	count += this.objectList.filter(obj => this.getTile(obj.tileIndex).visible && obj.type.stopTurn).length;
	
	return count;
};

// NUM_VISIBLE_MONSTERS:
// ************************************************************************************************
gs.numVisibleMonsters = function () {
	// Count visible, hostile NPCs:
	if (gs.debugProperties.npcCanAgro) {
		return gs.getAllNPCs().filter(npc => npc.isAlive && npc.faction === FACTION.HOSTILE && gs.pc.canSeeCharacter(npc)).length;
	}
	else {
		return 0;
	}
};


// UPDATE_GLOBAL_TURN:
// ************************************************************************************************
gs.updateGlobalTurn = function () {	
	gs.turn += 1;

	// Update effect:
	// Reverse order so that adding new effects won't immediately update
	for (let i = this.cloudList.length - 1; i >= 0 ; i -= 1) {
		if (this.cloudList[i].isAlive) {
			this.cloudList[i].updateTurn();
		}
	}
	
	// Update objects:
	this.objectList.forEach(function (object) {
		if (object.updateTurn) {
			object.updateTurn();
		}
	}, this);

	// Update Characters:
	for (let i = 0; i < this.characterList.length; i += 1) {
		if (this.characterList[i].isAlive) {
			this.characterList[i].updateTurn();
		}
	}
	
	this.updateTurnConveyorBelt();
	
	// Level Controller:
	levelController.updateTurn();
	
	this.calculateLoS();
};

// UPDATE_TURN_CONVEYOR_BELTS:
// Need special code to handle this so that characters don't block themselves.
// ************************************************************************************************
gs.updateTurnConveyorBelt = function () {
	let charList;
	
	// Right Conveyor Belts:
	charList = gs.characterList.filter(char => char.isAlive && gs.getObj(char.tileIndex, 'RightConveyorBelt'));
	charList = charList.sort((a, b) => b.tileIndex.x - a.tileIndex.x);
	charList.forEach(function (char) {
		char.onTurnConveyorBelt();
	}, this);
	
	// Left Conveyor Belts:
	charList = gs.characterList.filter(char => char.isAlive && gs.getObj(char.tileIndex, 'LeftConveyorBelt'));
	charList = charList.sort((a, b) => a.tileIndex.x - b.tileIndex.x);
	charList.forEach(function (char) {
		char.onTurnConveyorBelt();
	}, this);
	
	// Down Conveyor Belts:
	charList = gs.characterList.filter(char => char.isAlive && gs.getObj(char.tileIndex, 'DownConveyorBelt'));
	charList = charList.sort((a, b) => b.tileIndex.y - a.tileIndex.y);
	charList.forEach(function (char) {
		char.onTurnConveyorBelt();
	}, this);
	
	// Up Conveyor Belts:
	charList = gs.characterList.filter(char => char.isAlive && gs.getObj(char.tileIndex, 'UpConveyorBelt'));
	charList = charList.sort((a, b) => a.tileIndex.y - b.tileIndex.y);
	charList.forEach(function (char) {
		char.onTurnConveyorBelt();
	}, this);
};
