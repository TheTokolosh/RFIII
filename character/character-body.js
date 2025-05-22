/*global gs, util*/
/*global TIME_SCALAR, TILE_SIZE*/
/*global KNOCK_BACK_SPEED, FAST_MOVEMENT_SPEED, MOVE_ANIM_SPEED, KEYBOARD_MOVEMENT_SPEED*/
/*global CHARACTER_SIZE, MOVEMENT_TYPE, ACTION_TIME*/
/*jshint esversion: 6*/
'use strict';

var pcx, pcy;

// CHARACTER_BODY:
// ************************************************************************************************
function CharacterBody (character) {
	this.character = character;
	
	this.state = 'WAITING';
	this.tileIndex = {x: 0, y:  0};
	this.position = {x: 0, y: 0};
	this.offset = {x: 0, y: 0};
	this.walkBounce = 'UP';
	this.facing = 'RIGHT';
	this.isKnockBack = false;
	this.focusCamera = false; // Should the camera focus upon completing movement
	
	// Make sure to give player an initial tileIndex:
	this.character.tileIndex = {x: 0, y: 0};
}

// MOVE_TO_TILE_INDEX:
// Will perform a tween setting this.state to 'MOVING'
// ************************************************************************************************
CharacterBody.prototype.moveToTileIndex = function (tileIndex, focusCamera) {
	this.setFacing(this.tileIndex, tileIndex);
	this.focusCamera = focusCamera;
	this.setTileIndex(tileIndex);
	this.state = 'MOVING';
};

// SET_FACING:
// ************************************************************************************************
CharacterBody.prototype.setFacing = function (prevIndex, nextIndex) {
	if (!this.isKnockBack) {
		if (nextIndex.x < prevIndex.x) {
        	this.facing = 'LEFT';
		} 
		else if (nextIndex.x > prevIndex.x) {
			this.facing = 'RIGHT';
		}
	}
};

// SNAP_TO_TILE_INDEX:
// Will instantly snap position
// ************************************************************************************************
CharacterBody.prototype.snapToTileIndex = function (tileIndex) {
	this.setFacing(this.tileIndex, tileIndex);
	this.setTileIndex(tileIndex);
	this.position.x = this.destinationPos().x;
    this.position.y = this.destinationPos().y;
	this.finishTween();
};

// SET_TILE_INDEX:
// ************************************************************************************************
CharacterBody.prototype.setTileIndex = function (tileIndex) {
	// Remove from previous tile:
	if (gs.getTile(this.tileIndex) && gs.getTile(this.tileIndex).character === this.character) {
		gs.getTile(this.tileIndex).character = null;
	}
	
	// Set new tileIndex:
    this.tileIndex.x = tileIndex.x;
    this.tileIndex.y = tileIndex.y;
	
	
	// Update characters tileIndex
	this.character.tileIndex.x = tileIndex.x;
	this.character.tileIndex.y = tileIndex.y;
	
	// Update global pc tileIndex (easy access when debugging):
	if (this.character === gs.pc) {
		pcx = this.tileIndex.x;
		pcy = this.tileIndex.y;
	}
	
	// Enter new tile:
	gs.getTile(this.tileIndex).character = this.character;
	
	// Removing casting status effects:
	if (this.character.statusEffects.has('CastingFireStorm')) {
		this.character.statusEffects.remove('CastingFireStorm');
	}
};

// ON_UPDATE_FRAME:
// ************************************************************************************************
CharacterBody.prototype.onUpdateFrame = function () {
	this.tweenPosition();
	this.handleKnockBack();
	this.updateFrameWalkBounce();
	
	// End turn if the sprite has arived at its destination:
	if (this.state === 'MOVING' && this.isAtDestination()) {
        this.finishTween();
    }
};

// FINISH_TWEEN:
// ************************************************************************************************
CharacterBody.prototype.finishTween = function () {
	this.state = 'WAITING';
	
	
	if (this.focusCamera) {
		gs.focusCameraOnPC();
		this.focusCamera = false;
	}
		
	this.character.onEnterTile();
	
	this.isKnockBack = false;

	if (this.character.type.name === 'Penguin') {
		this.character.sprite.frame = this.character.type.frame; // resetting penguin slide
	}
};

// UPDATE_FRAME_WALK_BOUNCE:
// ************************************************************************************************
CharacterBody.prototype.updateFrameWalkBounce = function () {
	// Walk bounce:
	if (this.state === 'MOVING' && gs.pc.movementType !== MOVEMENT_TYPE.SNAP) {
		if (this.walkBounce === 'UP') {
			this.offset.y -= 0.4 * TIME_SCALAR;
			if (this.offset.y <= -3) {
				this.walkBounce = 'DOWN';
			}
		} 
		else if (this.walkBounce === 'DOWN') {
			this.offset.y += 0.4 * TIME_SCALAR;
			if (this.offset.y >= 0) {
				this.walkBounce = 'UP';
			}
		}
	} 
	else {
		this.offset.y *= 0.75 / TIME_SCALAR;
		this.offset.x *= 0.75 / TIME_SCALAR;
	}

	
};

// IS_AT_DESTINATION:
// ************************************************************************************************
CharacterBody.prototype.isAtDestination = function () {	
	return util.distance(this.position, this.destinationPos()) <= this.tweenSpeed();
};

// DESTINATION_POS:
// ************************************************************************************************
CharacterBody.prototype.destinationPos = function () {
	return util.toPosition(this.tileIndex);
};

// HANDLE_KNOCK_BACK:
// ************************************************************************************************
CharacterBody.prototype.handleKnockBack = function () {
	let tempTileIndex = util.toTileIndex(this.position);
	
	// Handling knock back through traps:
	// Notice that we only handle the case in which the player is passing through a tile
	// The case in which the player has arived at the tile can be handled by standard method
	if (this.isKnockBack && !this.isLunging && !util.vectorEqual(tempTileIndex, this.tileIndex)) {
		let obj = gs.getObj(tempTileIndex, obj => obj.type.activate);
		
		// Make sure a char is not on the tileIndex before we place THIS char on it
		// Fixes Bug: player charging an enemy on bear trap on the last turn i.e. the bear trap would be active
		if (obj && !gs.getChar(tempTileIndex)) {
			// We temporarily place the character on the tileIndex in order to trigger the trap
			gs.getTile(tempTileIndex).character = this.character;
			obj.stepOn(this.character);
			gs.getTile(tempTileIndex).character = null;
			
			// If the trap has immobalised the character he needs to halt movement:
			// This will stop his knockback completely
			if (this.character.isImmobile && this.character.isAlive) {
				this.snapToTileIndex(tempTileIndex);
			}
		}
	}
};

// TWEEN_POSITION:
// ************************************************************************************************
CharacterBody.prototype.tweenPosition = function () {
	if (this.isAtDestination() || gs.pc.movementType === MOVEMENT_TYPE.SNAP) {
		this.position.x = this.destinationPos().x;
		this.position.y = this.destinationPos().y;
	}
	else {
		let speed = this.tweenSpeed();
		let normal = util.normal(this.position, this.destinationPos());
		
		this.position.x += normal.x * speed;
		this.position.y += normal.y * speed;
	}
};

// TWEEN_SPEED:
// ************************************************************************************************
CharacterBody.prototype.tweenSpeed = function () {	
	if (this.isKnockBack || this.character.isMultiMoving) {
		return KNOCK_BACK_SPEED;
	}
	else if (gs.pc && gs.pc.movementType === MOVEMENT_TYPE.FAST) {
		return FAST_MOVEMENT_SPEED;
	}
	else {
		return MOVE_ANIM_SPEED;
	}
};

// APPLY_KNOCK_BACK:
// ************************************************************************************************
CharacterBody.prototype.applyKnockBack = function (normalVec, numTiles) {
	var toTileIndex;
	
	
	// Immobile enemies (nests, statues, etc.) can never be knocked back:
	if ((this.character.type.isImmobile || this.character.isImmobile || this.character.type.isKnockBackImmune) && !this.character.statusEffects.has('Constricting')) {
		return;
	}
	
	// Don't knockback dead characters:
	if (!this.character.isAlive) {
		return;
	}
	
	// Size multiplier:
	if (this.character.size === CHARACTER_SIZE.SMALL) {
		numTiles = numTiles * 2;
	}
	else if (this.character.size === CHARACTER_SIZE.LARGE) {
		numTiles = Math.ceil(numTiles / 2);
	}
	
    toTileIndex = this.getKnockBackIndex(normalVec, numTiles);
	
	if (!util.vectorEqual(toTileIndex, this.tileIndex)) {
		this.isKnockBack = true;
		
		if (this.character !== gs.pc) {
			this.character.waitTime = ACTION_TIME;
		}
		
		this.character.movementType = MOVEMENT_TYPE.FAST;
		this.moveToTileIndex(toTileIndex);
	}
	
	if (this.character === gs.pc) {
		gs.hasNPCActed = true;
	}
};

// GET_KNOCK_BACK_INDEX:
// ************************************************************************************************
CharacterBody.prototype.getKnockBackIndex = function (normalVec, numTiles) {
	var startPosition = util.toPosition(this.tileIndex),
        currentPosition = {x: startPosition.x, y: startPosition.y},
		nextPosition,
        step = 4,
        currentDistance = 0,
		newTileIndex = this.tileIndex,
		nextTileIndex;
	
	for (currentDistance = 0; currentDistance <= numTiles * TILE_SIZE; currentDistance += step) {
		nextPosition = {x: startPosition.x + normalVec.x * currentDistance, y: startPosition.y + normalVec.y * currentDistance};
		nextTileIndex = util.toTileIndex(nextPosition);
		
		if (!util.vectorEqual(nextTileIndex, this.tileIndex) && !gs.isPassable(nextTileIndex)) {
			break;
		}
        currentPosition = nextPosition;
    }
	
	return util.toTileIndex(currentPosition);
};

// FACE_TILE_INDEX:
// Used when attacking to face the direction of attack
// ************************************************************************************************
CharacterBody.prototype.faceTileIndex = function (tileIndex) {
	if (this.character.type.rotateAim) {
		return;
	}
	
	// Face target:
    if (tileIndex.x >= this.tileIndex.x) {
        this.facing = 'RIGHT';
    } else {
        this.facing = 'LEFT';
    }
};

// BOUNCE_TOWARDS:
// Used during attacks to give a bit of animation
// ************************************************************************************************
CharacterBody.prototype.bounceTowards = function (tileIndex) {
	var normal;
	
	if (util.vectorEqual(tileIndex, this.tileIndex)) {
		normal = {x: 0, y: 0};
	}
	else {
		normal = util.normal(this.tileIndex, tileIndex);
	}
	
	this.offset.x = normal.x * 10;
	this.offset.y = normal.y * 10;
};