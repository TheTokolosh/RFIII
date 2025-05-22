/*global gs, util, game*/
/*global NPC*/
/*global FACTION, ACTION_TIME*/
/*global RANDOM_MOVE_PERCENT, LOS_DISTANCE, MOVEMENT_SPEED, MOVEMENT_TYPE, DAMAGE_TYPE*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// SHOULD_SKIP_TURN:
// ************************************************************************************************
NPC.prototype.shouldSkipTurn = function () {
	if (this.waitTime > 0) {
		return true;
	}
	
	// Dead npcs skip turn:
	if (!this.isAlive) {
		return true;
	}

	// Stunned and sleeping npcs skip turn:
	// Hidden enemies never take a turn (remember that spot agro checks are made before testing this):
	if (this.isStunned || this.isAsleep || this.isHidden) {
		return true;
	}

	// Non agroed npcs skip turn unless they are wandering around:
	if (!this.isAgroed && !this.isWandering) {
		return true;
	}

	/*
	if (!this.isSlowProjectile && (this.faction === FACTION.NEUTRAL || this.faction === FACTION.DESTRUCTABLE)) {
		return true;
	}
	*/
	if (!this.isSlowProjectile && this.faction === FACTION.DESTRUCTABLE) {
		return true;
	}
};



// GET_NEW_FACING:
// ************************************************************************************************
NPC.prototype.getNewFacing = function (tileIndex) {
	var targetFace = this.getFacingToTarget(tileIndex);
	if (this.rotFacing === 'UP' && (targetFace === 'LEFT' || targetFace === 'DOWN')) {
		return 'LEFT';
	}
	if (this.rotFacing === 'UP' && targetFace === 'RIGHT') {
		return 'RIGHT';
	}
	if (this.rotFacing === 'LEFT' && (targetFace === 'DOWN' || targetFace === 'RIGHT')) {
		return 'DOWN';
	}
	if (this.rotFacing === 'LEFT' && targetFace === 'UP') {
		return 'UP';
	}
	if (this.rotFacing === 'DOWN' && (targetFace === 'RIGHT' || targetFace === 'UP')) {
		return 'RIGHT';
	}
	if (this.rotFacing === 'DOWN' && targetFace === 'LEFT') {
		return 'LEFT';
	}
	if (this.rotFacing === 'RIGHT' && (targetFace === 'UP' || targetFace === 'LEFT')) {
		return 'UP';
	}
	if (this.rotFacing === 'RIGHT' && targetFace === 'DOWN') {
		return 'DOWN';
	}
};

// GET_FACING_TO_TARGET:
// ************************************************************************************************
NPC.prototype.getFacingToTarget = function (tileIndex) {
	var angle = util.angleToFace(this.tileIndex, tileIndex);
	
	if (angle <= 270 && angle > 180) {
		return 'UP';
	} else if (angle <= 180 && angle > 90) {
		return 'RIGHT';
	} else if (angle <= 90 && angle > 0) {
		return 'DOWN';
	} else {
		return 'LEFT';
	}
};

// ROTATE_TO_FACE:
// ************************************************************************************************
NPC.prototype.rotateToFace = function () {
	if (this.rotFacing === 'UP') {
		this.setSpriteAngle(180);
	} 
	else if (this.rotFacing === 'DOWN') {
		this.setSpriteAngle(0);
	} 
	else if (this.rotFacing === 'LEFT') {
		this.setSpriteAngle(90);
	} 
	else {
		this.setSpriteAngle(270);
	}
};


// PROCESS_ACTION_QUEUE:
// ************************************************************************************************
NPC.prototype.processActionQueue = function () {
	var action, tileIndex;
	
	// Get the next action in the queue:
	action = this.actionQueue.pop();
	tileIndex = action.tileIndex;
	
	// Moving:
	if (this.canMoveTo(tileIndex)) {
		gs.createCloud(this.tileIndex, 'Smoke', 0, 2);
		this.moveTo(tileIndex);
		
		// Reaching destination:
		if (action.type === 'DEATH') {
			gs.createExplosion(tileIndex, 1.5, this.burstDamage, {killer: this});
			this.death();
		}
	}
	// Hitting a wall or character:
	else {
		gs.createExplosion(this.tileIndex, 1.5, this.burstDamage, {killer: this});
		this.death();
	}
};

// CHOOSE_ACTION:
// ************************************************************************************************
NPC.prototype.chooseAction = function () {
	var validAbilityList, tileIndex = null, nearestHostile, char;
	
	// Debugging:
	/*
	if (this.type.name === 'DherossoTheDemonologist') {
		let char = gs.characterList.find(char => char.type.name === 'HellPortal');
		
		if (char.timeToHatch === HELL_PORTAL_HATCH_TURNS + 1) {
			let ability = this.abilities.list[0];
			ability.target = {x: 12, y: 13};
			this.useAbility(ability);
		}
		
		this.endTurn(100);
		return;
	}
	*/
	
	if (this.lightningRodTileIndex && !gs.getObj(this.lightningRodTileIndex, 'LightningRod')) {
		this.lightningRodTileIndex = null;
	}
	
	if (this.body.state === 'MOVING') {
		return;
	}

	// Following an existing actionQueue:
	if (this.actionQueue && this.actionQueue.length > 0) {
		this.processActionQueue();
		return;
	}
	
	// NPC's detect player:
	if (!this.isAgroed && this.faction === FACTION.HOSTILE && this.canDetectPlayer() && !gs.pc.isHidden) {
		this.tryToAgroPlayer();
		
		if (this.waitTime > 0) {
			this.endTurn(this.waitTime);
			return;
		}
	}
	
	// Allies are always counted as agroed i.e. active:
	if (this.faction === FACTION.PLAYER) {
		this.isAgroed = true;
	}
	
	// Special alwaysAgroed npcType tag:
	if (this.type.alwaysAgroed) {
		this.isAgroed = true;
	}

	// Skip turn:
	if (this.shouldSkipTurn()) {
		this.endTurn(ACTION_TIME);
		return;
	}
	
	// Monsters keep shouting for help when agroed:
	let hasMoved = !util.vectorEqual(this.tileIndex, this.previousTileIndex);
	let isVisible = gs.getTile(this.tileIndex).visible;
	if (this.isAgroed && this.faction === FACTION.HOSTILE && !this.isDamageImmune && (hasMoved || isVisible)) {
		this.shout();
	}
	
	// Swimmer and immobile enemies that have not moved and are out of LoS will decay agro faster:
	if (!hasMoved && !isVisible && (this.type.isSwimmer || this.type.isImmobile)) {
		this.unagroTimer += 1;
	}
	
	// Special abilities that should be given priority over most other actions:
	let validSpecialAbility = this.getValidSpecialAbility();
	if (validSpecialAbility) {
		// Returning to wait for player to complete movement
		if (gs.pc.body.state === 'MOVING') {
			this.state = 'PAUSE';
			return;
		}

		this.useAbility(validSpecialAbility);
		return;
	}

	nearestHostile = this.getNearestHostile();
	
	// ROTATION:
	if (this.type.rotateAim && gs.getTile(this.tileIndex).visible && nearestHostile && this.rotFacing !== this.getFacingToTarget(nearestHostile.tileIndex)) {
		this.rotFacing = this.getNewFacing(nearestHostile.tileIndex);
		this.rotateToFace();
		this.endTurn(ACTION_TIME);
		return;
	}
	
	// MOVEMENT:
	if (this.canMove()) {
		// SLOW_PROJECTILE:
		if (this.isSlowProjectile) {
			this.slowProjectileMovement();
			return;
		} 
		
		// RUN AWAY:
		if (this.isFeared && nearestHostile) {
			tileIndex = this.getMoveAwayIndex(nearestHostile);
			if (tileIndex) {
				this.moveTo(tileIndex);
				return;
			}
		}
		
		// SEEKING_MARKED_PLAYER:
		if (!this.isAgroed && this.isWandering && gs.pc.isMarked) {
			tileIndex = this.getMoveTowardsIndex(gs.pc.tileIndex);
			if (tileIndex) {
				this.moveTo(tileIndex);
				return;
			}
		}
		
		// WANDERING:
		if (!this.isAgroed && this.isWandering && !gs.pc.isMarked) {
			tileIndex = this.getWanderIndex();
			if (tileIndex) {
				this.moveTo(tileIndex);
				return;
			}
		}
		
		// MOVE_RANDOM:
		if (this.isAgroed && this.type.isRandomMover && this.faction !== FACTION.PLAYER && util.frac() < RANDOM_MOVE_PERCENT) {
			tileIndex = this.getRandomMoveIndex();
			if (tileIndex) {
				this.moveTo(tileIndex);
				return;
			}
		}
		
		// MOVE_AWAY (KITING):
		if (this.shouldKiteMove(nearestHostile)) {
			tileIndex = this.getMoveAwayIndex(nearestHostile);
			if (tileIndex) {
				this.moveTo(tileIndex);
				return;
			}
		}
		
		// MOVE_TOWARDS_SUMMONER:
		if (this.type.maxDistanceToSummoner && util.distance(this.tileIndex, gs.getCharWithID(this.summonerId).tileIndex) > this.type.maxDistanceToSummoner) {
			tileIndex = this.getMoveTowardsIndex(gs.getCharWithID(this.summonerId).tileIndex);
			if (tileIndex) {
				this.moveTo(tileIndex);
				return;
			}
		}
	}
	
	// nearestHostile
	// Use ability:
	if (this.isAgroed && !this.isFeared) {
		validAbilityList = this.getValidAbility();
		if (validAbilityList.length > 0) {
			// Returning to wait for player to complete movement
			if (gs.pc.body.state === 'MOVING') {
				this.state = 'PAUSE';
				return;
			}
			
			this.useAbility(util.randElem(validAbilityList));
			return;
		}
	}
	
	// Tentacles will end their turn here if they are far away from the player (they only move towards the player if he's already close):
	if (this.type.name === 'Tentacle' && util.distance(this.tileIndex, gs.pc.tileIndex) >= 3) {
		this.endTurn(ACTION_TIME);
		return;
	}
	
	// MOVE_TOWARDS:
	if (this.isAgroed && this.canMove() && !this.isFeared) {
		if (nearestHostile) {
			// Moving to valid attack index:
			if (!gs.getTile(this.tileIndex).visible || !gs.isRayProjectilePassable(this.tileIndex, nearestHostile.tileIndex) || util.distance(nearestHostile.tileIndex, this.tileIndex) > this.type.minAbilityRange) {
				let attackTileIndex = this.getNearestAttackIndex(nearestHostile);
				if (attackTileIndex) {
					tileIndex = this.getMoveTowardsIndex(attackTileIndex);
					if (tileIndex) {
						this.moveTo(tileIndex);
						return;
					}
				}
			}
			
			// Kiters end their turn here:
			// They are nearly to the limit of their minRange so they should not move towards the target
			if (this.type.minRange
				&& util.distance(nearestHostile.tileIndex, this.tileIndex) <= this.type.minAbilityRange
				&& gs.isRayProjectilePassable(this.tileIndex, nearestHostile.tileIndex)) {
				
				this.endTurn(ACTION_TIME);
				return;
			}
			
			// Moving towards target:
			tileIndex = this.getMoveTowardsIndex(nearestHostile.tileIndex);
			if (tileIndex) {
				this.moveTo(tileIndex);
				return;
			}
		}
		
		// FOLLOW_PLAYER (ALLIES):
		if (this.faction === FACTION.PLAYER) {
			// Poof if no enemies (ex. fire balls):
			if (this.type.poofWhenNoTarget && !nearestHostile) {
				// Poof:
				gs.createParticlePoof(this.tileIndex, 'PURPLE');
				this.popUpText('Poof', 'White');
				this.destroy();
				return;
			}
			
			// Allies are close enough to the player:
			if (util.distance(this.tileIndex, gs.pc.tileIndex) < 1.5) {
				this.endTurn(ACTION_TIME);
				return;
			}
			
			// Allies moving towards the player:
			tileIndex = this.getMoveTowardsIndex(gs.pc.tileIndex);
			if (tileIndex) {
				this.moveTo(tileIndex);
				return;
			}
		}
		
		// As a last resort, agroed npcs try to move towards the player:
		tileIndex = this.getMoveTowardsIndex(gs.pc.tileIndex);
		if (tileIndex) {
			this.moveTo(tileIndex);
			return;
		}
		
	}

	// End Turn:
	this.endTurn(ACTION_TIME);
};

// MOVE_CHILDREN:
// Move your summons in the same direction as you are about to move
// ************************************************************************************************
NPC.prototype.moveChildren = function (prevTileIndex, toTileIndex) {
	let delta = {x: toTileIndex.x - prevTileIndex.x, y: toTileIndex.y - prevTileIndex.y};
	
	// Use this to order the children so those nearest to the direction of movement go first:
	let farTileIndex = {x: this.tileIndex.x + delta.x * 10, y: this.tileIndex.y + delta.y * 10};	
	let charList = this.summonIDList.map(charID => gs.getCharWithID(charID));
	charList.sort((a, b) => util.distance(farTileIndex, a.tileIndex) - util.distance(farTileIndex, b.tileIndex));
	
	charList.forEach(function (char) {
		let destTileIndex = {x: char.tileIndex.x + delta.x, y: char.tileIndex.y + delta.y};
		
		if (gs.isPassable(destTileIndex) && gs.getTile(destTileIndex).type.name === 'Water') {
			char.moveTo(destTileIndex);
		}
	}, this);

};


// TENTACLE_CHOOSE_ACTION:
// ************************************************************************************************
NPC.prototype.tentacleChooseAction = function () {
	// End Turn:
	this.endTurn(ACTION_TIME);
};

// SLOW_PROJECTILE_MOVEMENT:
// ************************************************************************************************
NPC.prototype.slowProjectileMovement = function () {
	// Moving:
	let nextTileIndex = {x: this.tileIndex.x + this.moveDelta.x,
						 y: this.tileIndex.y + this.moveDelta.y};
		
	// Moving (make sure can fall into pits):
	if (this.canMoveTo(nextTileIndex) || (gs.isPit(nextTileIndex) && !gs.getChar(nextTileIndex))) {
		// Create Smoke:
		this.slowProjectileSmoke();
		
		// Move to next tileIndex:
		this.moveTo(nextTileIndex);
	}
	// Hitting solid:
	else {
		// Slow Charge Hit:
		if (this.statusEffects.has('SlowCharge')) {
			// Camera Effects:
			game.camera.shake(0.010, 100);
			game.camera.flash(0xffffff, 59);
			
			gs.playSound(gs.sounds.playerHit, this.tileIndex);
			
			gs.createParticlePoof(this.tileIndex, 'WHITE');

			let char = gs.getChar(nextTileIndex);
			if (char) {
				gs.meleeAttack(this, char.tileIndex, null, this.statusEffects.get('SlowCharge').damage, {neverMiss: true});
			}
			this.statusEffects.remove('SlowCharge');
			this.endTurn(ACTION_TIME);
		}
		// Standard Death:
		else {
			this.death();
		}
	}
};


// SLOW_PROJECTILE_SMOKE:
// ************************************************************************************************
NPC.prototype.slowProjectileSmoke = function () {
	if (this.type.noSlowMoveSmoke) {
		return;
	}
	
	// Create new cloud:
	let smoke1 = gs.createCloud(this.tileIndex, 'ChargeSmoke', 0, 2);
	
	// Smoke 2:
	let tileIndex = {x: this.tileIndex.x - this.moveDelta.x, 
					 y: this.tileIndex.y - this.moveDelta.y};
	
	let smoke2 = null;
	if (gs.getCloud(tileIndex) && gs.getCloud(tileIndex).type.name === 'ChargeSmoke') {
		smoke2 = gs.getCloud(tileIndex);
	}
	
	if (smoke2) {
		smoke1.sprite.frame = 1604;
		smoke2.sprite.frame = 1605;
	}
	else {
		smoke1.sprite.frame = 1605;
	}
	
	// this.smokeSize
};

// SHOUD_KITE_MOVE:
// ************************************************************************************************
NPC.prototype.shouldKiteMove = function (nearestHostile) {
	return this.isAgroed
		&& this.type.minRange
		&& nearestHostile
		&& util.distance(nearestHostile.tileIndex, this.tileIndex) <= this.type.minRange
		&& gs.isRayPassable(this.tileIndex, nearestHostile)
		&& gs.getTile(this.tileIndex).visible
		&& util.frac() < 0.25;
};


// GET_NEAREST_HOSTILE:
// ************************************************************************************************
NPC.prototype.getNearestHostile = function () {
	var list = gs.liveCharacterList();
	
	if (this.isConfused) {
		list = list.filter(char => char.isAgroed && (char.faction === FACTION.HOSTILE || char.faction === FACTION.PLAYER));
	}
	// Player Allies:
	else if (this.faction === FACTION.PLAYER) {
		list = list.filter(char => char.faction === FACTION.HOSTILE);
		list = list.filter(char => !char.isDamageImmune);
		list = list.filter(char => char.isAgroed);
	}
	// Enemies:
	else if (this.faction === FACTION.HOSTILE) {
		list = list.filter(char => char.faction === FACTION.PLAYER && !char.isDamageImmune);
	}
	else {
		list = [];
	}
	
	// Make sure we can actually see targets:
	list = list.filter(char => char !== this);
	list = list.filter(char => util.distance(char.tileIndex, this.tileIndex) <= LOS_DISTANCE + 3);
	//list = list.filter(char => gs.isRayClear(char.tileIndex, this.tileIndex));
	
	// Sorting to find nearest:
	list.sort((a, b) => util.distance(this.tileIndex, a.tileIndex) - util.distance(this.tileIndex, b.tileIndex));
	
	return list.length > 0 ? list[0] : null;
};

// GET_VALID_SPECIAL_ABILITY:
// ************************************************************************************************
NPC.prototype.getValidSpecialAbility = function () {
	let validAbilityList = this.getValidAbility();
	
	for (let i = 0; i < validAbilityList.length; i += 1) {
		if (validAbilityList[i].type.name === 'RetractAndRepair') {
			return validAbilityList[i];
		}
	}
	
	return null;
};

// GET_VALID_ABILITY:
// ************************************************************************************************
NPC.prototype.getValidAbility = function () {
	var validAbilities;

	validAbilities = this.abilities.list.filter(ability => ability);
	
	// Checking Energy and Cooldowns:
	validAbilities = validAbilities.filter(ability => ability.coolDown === 0);
	validAbilities = validAbilities.filter(ability => ability.type.mana <= this.currentMp);
	validAbilities = validAbilities.filter(ability => ability.type.canUse(this));
	
	// Don't use when charmed:
	if (this.faction === FACTION.PLAYER) {
		validAbilities = validAbilities.filter(ability => !ability.type.dontUseWhenCharmed);
	}

	// Add targets to each ability:
	validAbilities.forEach(function (ability) {
		ability.target = ability.type.getTarget(this);
	}, this);
	
	// Only those that have a valid target:
	validAbilities = validAbilities.filter(ability => ability.target);
	
	// Filter only if shouldUseOn
	validAbilities = validAbilities.filter(ability => !ability.type.shouldUseOn || ability.type.shouldUseOn(this, ability.target));
	return validAbilities;
	
};

// IS_VALID_WANDER_TILE_INDEX:
// ************************************************************************************************
NPC.prototype.isValidWanderTileIndex = function (tileIndex) {
	return this.canMoveTo(tileIndex) 
		&& gs.isIndexSafe(tileIndex) 
		&& !gs.isNearGasVent(tileIndex)
		&& !gs.getObj(tileIndex, 'Track') 
		&& !gs.getObj(tileIndex, obj => obj.type.niceName === 'Conveyor Belt');
};

// GET_WANDER_INDEX:
// ************************************************************************************************
NPC.prototype.getWanderIndex = function () {
	var toTileIndex = {x: this.tileIndex.x + this.wanderVector.x,
					   y: this.tileIndex.y + this.wanderVector.y};

	if (this.isValidWanderTileIndex(toTileIndex)) {
		// Changing direction:
		if (util.frac() < 0.05) {
			this.wanderVector = this.newWanderVector();
		}
		
		return toTileIndex;
	}
	// Hit a wall:
	else {
		this.wanderVector = this.newWanderVector();
	}
	
	return null;
};

// NEW_WANDER_VECTOR:
// ************************************************************************************************
NPC.prototype.newWanderVector = function () {
	var vec = {};

	// Move to player:
	if (util.frac() < 0.10) {
		if (this.tileIndex.x < gs.pc.tileIndex.x) {
			vec.x = 1;
		} else if (this.tileIndex.x > gs.pc.tileIndex.x) {
			vec.x = -1;
		} else {
			vec.x = 0;
		}

		if (this.tileIndex.y < gs.pc.tileIndex.y) {
			vec.y = 1;
		} else if (this.tileIndex.y > gs.pc.tileIndex.y) {
			vec.y = -1;
		} else {
			vec.y = 0;
		}
	}
	// Random move:
	else {
		vec = {x: util.randInt(-1, 1), y: util.randInt(-1, 1)};
	}
	
	// Make sure slow enemies don't move diagonally:
	if (this.movementSpeed === MOVEMENT_SPEED.SLOW && vec.x !== 0 && vec.y !== 0) {
		if (util.frac() < 0.5) {
			vec.x = 0;
		}
		else {
			vec.y = 0;
		}
	}
	
	return vec;
};

// GET_PATH_TO:
// ************************************************************************************************
NPC.prototype.getPathTo = function (tileIndex) {
	return gs.findPath(this.tileIndex, tileIndex, {
		allowDiagonal: this.movementSpeed !== MOVEMENT_SPEED.SLOW,
		avoidTraps: false,
		exploredOnly: false,
		passDoors: this.type.canOpenDoors,
		isValidTileIndex: this.canMoveTo.bind(this),
		maxDepth: 150
	});
};

// GET_STATIC_PASSABLE_PATH_TO:
// ************************************************************************************************
NPC.prototype.getStaticPassablePathTo = function (tileIndex) {
	return gs.findPath(this.tileIndex, tileIndex, {
		allowDiagonal: this.movementSpeed !== MOVEMENT_SPEED.SLOW,
		avoidTraps: false,
		exploredOnly: false,
		passDoors: true,
		isValidTileIndex: this.canStaticPassableMoveTo.bind(this),
		maxDepth: 150
	});
};

// CAN_MOVE_TO:
// Call this function to see if the npc can move to the tile index or open a door there
// Important Note: this function does not consider whether the NPC can move to the tileIndex from their current position
// i.e. it simply tests if the tileIndex is valid given the NPCs behaviour type
// This means it can be passed into path finding to 'test ahead' of the NPC
// ************************************************************************************************
NPC.prototype.canMoveTo = function (tileIndex) {	
	if (!this.canMoveToTile(tileIndex)) {
		return false;
	}
	
	// Players allies will not move onto dangerous terrain:
	if (this.faction === FACTION.PLAYER && !gs.isIndexSafeForCharType(tileIndex, this.type)) {
		return false;
	}
	
	// Summoned npcs locked to their summoner:
	if (this.summonerId && this.type.maxDistanceToSummoner) {
		let summoner = gs.getCharWithID(this.summonerId);
		
		// The restriction only applies while the summons are already in range
		// This allows an enemy that has gotten out of range will be able to path back
		if (util.distance(this.tileIndex, summoner.tileIndex) <= this.type.maxDistanceToSummoner && util.distance(tileIndex, summoner.tileIndex) > this.type.maxDistanceToSummoner) {
			return false;
		}
	}
	
	// Phase Walls:
	if (this.type.phaseWalls) {
		if (gs.isInBounds(tileIndex) && !gs.getChar(tileIndex)) {
			return true;
		}
		else {
			return false;
		}
	}
	else if (gs.getChar(tileIndex) && gs.getChar(tileIndex).faction === this.faction && this.type.canPassAllies) {
		return true;
	}
	else if (gs.isPassable(tileIndex) || this.canOpenDoor(tileIndex)) {
		return true;
	} 
	else {
		return false;
	}
};

// CAN_STATIC_PASSABLE_MOVE_TO:
// ************************************************************************************************
NPC.prototype.canStaticPassableMoveTo = function (tileIndex) {	
	if (!this.canMoveToTile(tileIndex)) {
		return false;
	}
	
	// Players allies will not move onto dangerous terrain:
	if (this.faction === FACTION.PLAYER && !gs.isIndexSafe(tileIndex)) {
		return false;
	}
	
	// Phase Walls:
	if (this.type.phaseWalls) {
		if (gs.isInBounds(tileIndex) && !gs.getChar(tileIndex)) {
			return true;
		}
		else {
			return false;
		}
	}
	else if (gs.getChar(tileIndex) && gs.getChar(tileIndex).faction === this.faction && this.type.canPassAllies) {
		return true;
	}
	else if (gs.isStaticPassable(tileIndex) || this.canOpenDoor(tileIndex)) {
		return true;
	} 
	else {
		return false;
	}
};



// GET_MOVE_TOWARDS_INDEX:
// Returns the tileIndex that will move the NPC closest towards targetTileIndex
// ************************************************************************************************
NPC.prototype.getMoveTowardsIndex = function (targetTileIndex) {
	// NPC is already at the targetTileIndex:
	if (util.vectorEqual(this.tileIndex, targetTileIndex)) {
		return null;
	}


	// Version 01:
	/*
	let passablePath = this.getPathTo(targetTileIndex);
	let staticPassablePath = this.getStaticPassablePathTo(targetTileIndex);
	// Passable (not much longer than static passable):
	// We have a passable (totally walkable) path to the target. This path may be longer than a path blocked by our allies.
	// As long as the path is not to much longer (less than 2 times), we take this path.
	if (staticPassablePath && staticPassablePath.length > 0 && passablePath && passablePath.length > 0 && passablePath.length < staticPassablePath.length * 2 && this.canMoveTo(staticPassablePath[staticPassablePath.length - 1])) {
		return passablePath[passablePath.length - 1];
	}
	// Static Passable:
	// We have a path to the target that is blocked by some of our allies and is not too long.
	else if (staticPassablePath && staticPassablePath.length > 0 && staticPassablePath.length < 20 && this.canMoveTo(staticPassablePath[staticPassablePath.length - 1])) {
		return staticPassablePath[staticPassablePath.length - 1];
	}
	// Passable:
	else if (passablePath && passablePath.length > 0 && passablePath.length < 20 && this.canMoveTo(passablePath[passablePath.length - 1])) {
		return passablePath[passablePath.length - 1];
	}
	*/
	
	// Version 02:
	/*
	// We will always take a very short path even if blocked by allies:
	if (staticPassablePath && staticPassablePath.length > 0 && staticPassablePath.length <= 3 && (!passablePath || passablePath.length > 5)) {
		if (this.canMoveTo(staticPassablePath[staticPassablePath.length - 1])) {
			return staticPassablePath[staticPassablePath.length - 1];
		}
		else {
			return null;
		}
	}
	// Passable (not much longer than static passable):
	// We have a passable (totally walkable) path to the target. This path may be longer than a path blocked by our allies.
	// As long as the path is not to much longer (less than 2 times), we take this path.
	else if (staticPassablePath && staticPassablePath.length > 0 && passablePath && passablePath.length > 0 && passablePath.length <= staticPassablePath.length * 4 && this.canMoveTo(passablePath[passablePath.length - 1])) {
		return passablePath[passablePath.length - 1];
	}
	// Static Passable:
	// We have a path to the target that is blocked by some of our allies and is not too long.
	else if (staticPassablePath && staticPassablePath.length > 0 && staticPassablePath.length < 20) {
		if (this.canMoveTo(staticPassablePath[staticPassablePath.length - 1])) {
			return staticPassablePath[staticPassablePath.length - 1];
		}
		else {
			return null;
		}
		
	}
	// Passable:
	else if (passablePath && passablePath.length > 0 && passablePath.length < 20 && this.canMoveTo(passablePath[passablePath.length - 1])) {
		return passablePath[passablePath.length - 1];
	}
	*/
	
	
	let clearPath = this.getPathTo(targetTileIndex);
	let blockedPath = this.getStaticPassablePathTo(targetTileIndex);
	if (clearPath && clearPath.length === 0) {
		clearPath = null;
	}
	if (blockedPath && blockedPath.length === 0) {
		blockedPath = null;
	}
	
	// We always take a short clear path:
	if (clearPath && clearPath.length <= 6 && this.canMoveTo(clearPath[clearPath.length - 1])) {
		return clearPath[clearPath.length - 1];
	}
	
	// If we are close but blocked and the clear path is long, its better to wait:
	// CHANGED-1.40: More likely to wait
	//if (blockedPath && blockedPath.length <= 4 && (!clearPath || (clearPath.length > 8 - blockedPath.length))) {
	if (blockedPath && blockedPath.length <= 3 && (!clearPath || (clearPath.length > 8 - blockedPath.length))) {
		if (this.canMoveTo(blockedPath[blockedPath.length - 1])) {
			return blockedPath[blockedPath.length - 1];
		}
		// We're going to wait for our friends to move
		else {
			return null;
		}
	}
	
	// CHANGED-1.40: Added this additional check
	// We have a short blocked path and can actually take a step along it
	if (blockedPath && blockedPath.length <= 10 && this.canMoveTo(blockedPath[blockedPath.length - 1])) {
		return blockedPath[blockedPath.length - 1];
	}
	
	// If we have a reasonably short clear path we take it:
	if (clearPath && clearPath.length <= 25 && this.canMoveTo(clearPath[clearPath.length - 1])) {
		return clearPath[clearPath.length - 1];
	}
	
	// If we have a reasonably short blocked path we take it:
	if (blockedPath && blockedPath.length <= 25 && this.canMoveTo(blockedPath[blockedPath.length - 1])) {
		return blockedPath[blockedPath.length - 1];
	}
	
	
	
	// Niave Path:
	// Right:
	if (this.tileIndex.x < targetTileIndex.x && this.canMoveTo({x: this.tileIndex.x + 1, y: this.tileIndex.y})) {
		return {x: this.tileIndex.x + 1, y: this.tileIndex.y};
	}
	// Left:
	else if (this.tileIndex.x > targetTileIndex.x && this.canMoveTo({x: this.tileIndex.x - 1, y: this.tileIndex.y})) {
		return {x: this.tileIndex.x - 1, y: this.tileIndex.y};
	}
	// Up:
	else if (this.tileIndex.y > targetTileIndex.y && this.canMoveTo({x: this.tileIndex.x, y: this.tileIndex.y - 1})) {
		return {x: this.tileIndex.x, y: this.tileIndex.y - 1};
	}
	// Down:
	else if (this.tileIndex.y < targetTileIndex.y && this.canMoveTo({x: this.tileIndex.x, y: this.tileIndex.y + 1})) {
		return {x: this.tileIndex.x, y: this.tileIndex.y + 1};
	}
	
	
	return null;
	
};

// GET_MOVE_AWAY_INDEX:
// Get an index which will move this character away from hostileCharacter
// ************************************************************************************************
NPC.prototype.getMoveAwayIndex = function (hostileCharacter) {
	var indexList;
	
	indexList = gs.getIndexListInRadius(this.tileIndex, 1);
	indexList = indexList.filter(index => this.canMoveTo(index));
	
	// No tiles to go to:
	if (indexList.length === 0) {
		return null;
	}
	
	// Find the tile thats furthest from the player:
	indexList.sort((a, b) => util.distance(hostileCharacter.tileIndex, b) - util.distance(hostileCharacter.tileIndex, a));
	
	if (util.distance(hostileCharacter.tileIndex, indexList[0]) > util.distance(hostileCharacter.tileIndex, this.tileIndex)) {
		return indexList[0];
	} 
	else {
		return null;
	}
};

// GET_RANDOM_MOVE_INDEX:
// ************************************************************************************************
NPC.prototype.getRandomMoveIndex = function () {
	var indexList;
	
	indexList = gs.getIndexListAdjacent(this.tileIndex);
	indexList = indexList.filter(index => this.canMoveTo(index));
	
	return indexList.length > 0 ? util.randElem(indexList) : null;
};

// GET_NEAREST_ATTACK_INDEX:
// ************************************************************************************************
NPC.prototype.getNearestAttackIndex = function (nearestHostile) {
	// Override for lightning rod:
	if (this.lightningRodTileIndex) {
		return this.getLightningRodAttackIndex(nearestHostile);
	}
	
	// Get a list of tileIndex around the NPC that he can potentially move to:
	let indexList = gs.getIndexListInFlood(this.tileIndex, function (tileIndex) {
		return this.canMoveTo(tileIndex)
			&& (this.isFlying || !gs.isPit(tileIndex));
	}.bind(this), 10);
	
	
	// Must have a clear (shootable) line to the target:
	//indexList = indexList.filter(index => gs.isRayShootable(index, nearestHostile.tileIndex));
	indexList = indexList.filter(index => gs.isRayPassable(index, nearestHostile.tileIndex));
	
	// Must be visible:
	indexList = indexList.filter(index => gs.getTile(index).visible);
	
	// Must be in min range to the target:
	indexList = indexList.filter(index => util.distance(index, nearestHostile.tileIndex) < this.type.minAbilityRange);
	
	// Kiters will look for furthest to target:
	if (this.type.minRange) {
		// Distance to hostile = good
		// Distance to me (path length) = bad
		let valFunc = function (tileIndex) {
			return util.distance(nearestHostile.tileIndex, tileIndex) - util.distance(this.tileIndex, tileIndex);
		}.bind(this);
		
		indexList.sort((a, b) => valFunc(b) - valFunc(a));
	}
	// Melee will look for nearest to target
	else {
		// Old: Update-1.40
		//indexList.sort((a, b) => util.distance(nearestHostile.tileIndex, a) - util.distance(nearestHostile.tileIndex, b));
		
		// New: Update-1.40.1:
		// Distance to hostile = bad
		// Distance to me (path length) = bad
		let valFunc = function (tileIndex) {
			return -util.distance(nearestHostile.tileIndex, tileIndex) - util.distance(this.tileIndex, tileIndex);
		}.bind(this);
		
		indexList.sort((a, b) => valFunc(b) - valFunc(a));
	}
	
	return indexList.length > 0 ? indexList[0] : null;
};

// GET_LIGHTNING_ROD_ATTACK_INDEX:
// ************************************************************************************************
NPC.prototype.getLightningRodAttackIndex = function (nearestHostile) {
	var pred, indexList;
	
	pred = function (tileIndex) {
		return this.canMoveTo(tileIndex);
	}.bind(this);
	
	indexList = gs.getIndexListInFlood(this.tileIndex, pred, 3);
	indexList = indexList.filter(index => gs.abilityTypes.SummonLightningRod.isTargetInPath(index, nearestHostile.tileIndex, this.lightningRodTileIndex));
	indexList.sort((a, b) => util.distance(this.tileIndex, a) - util.distance(this.tileIndex, b));
	
	return indexList.length > 0 ? indexList[0] : null;
};

