/*global gs, util, input, console, debug*/
/*global NUM_TILES_X, NUM_TILES_Y*/
/*global PlayerCharacter, help, PlayerTargeting*/
/*global CONFUSION_RANDOM_MOVE_PERCENT, MOVEMENT_TYPE, ACTION_TIME, FACTION, PURPLE_BOX_FRAME*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

/*
PLAYER_CONTROLLER:
- PlayerController acts as an interface between the player object and player-input.
- Any code in Player should be quite low level i.e. perform very simple mono-actions.
- Much of the decision making of what a particular player-input results in is handled here in player-controller
- PlayerController contextually selects mono-actions in player in response to player-input.
*/


// IS_READY_FOR_INPUT:
// ************************************************************************************************
PlayerCharacter.prototype.isReadyForInput = function () {
	return (gs.stateManager.isCurrentState('GameState') || gs.stateManager.isCurrentState('UseAbility'))
		&& gs.activeCharacter() === this
		&& !this.eventQueue.isProcessing()
		&& gs.projectileList.length === 0
		&& !this.isMultiMoving
		&& this.currentHp > 0;
};

// CLICK_TILE_INDEX:
// ************************************************************************************************
PlayerCharacter.prototype.clickTileIndex = function (tileIndex, exploredOnly, movementType = MOVEMENT_TYPE.NORMAL, rightClick = false, moveToAttack = false) {
	var path, i;
	
    // Skip if its not the players turn:
    if (!this.isReadyForInput()) {
        return;
    }
	
	// Skip if tileIndex is out of bounds:
	if (!gs.isInBounds(tileIndex)) {
		return;
	}
	
	
	
	this.movementType = movementType;
	this.actionQueue = [];
	this.attackOnEnterTile = false;
	
	// Confusion causes random clicks:
	if (!rightClick && !util.vectorEqual(tileIndex, this.tileIndex) && this.isConfused ) {
		if (util.frac() <= CONFUSION_RANDOM_MOVE_PERCENT) {
			tileIndex = this.getConfusedClickTileIndex();
		}
		gs.hasNPCActed = true;
	}
	
	// Right Click (Range Attack):
	if (rightClick) {
		if (this.canRangeAttack(tileIndex)) {
			this.rangeWeaponAttack(tileIndex);
		}
		else {
			let errorMsg = this.getRangeAttackError(tileIndex);
			if (errorMsg) {
				this.popUpText(errorMsg, 'Red');
			}
		}
	}
	// Use Ability:
	else if (gs.stateManager.isCurrentState('UseAbility') && this.canZap(tileIndex)) {
		this.zap(tileIndex);
		gs.keyBoardMode = false;
	}
	// Waiting:
	else if (gs.getTile(tileIndex) && gs.getChar(tileIndex) === this && gs.stateManager.isCurrentState('GameState')) {
		// Picking up item:
		if (gs.getItem(tileIndex) && this.inventory.canAddItem(gs.getItem(tileIndex).item)) {
			this.pickUpItem(gs.getItem(tileIndex));
		}
		// Blood:
		else if (this.canConsumeBlood()) {
			this.consumeBlood();
		}
		// Waiting:
		else {
			this.waitClicked();
		}
		gs.keyBoardMode = false;	
	}
	// Stop Slow characters from accidently diagonally moving:
	else if (gs.stateManager.isCurrentState('GameState')
			 && this.movementSpeed === 0
			 && !input.keys.SHIFT.isDown // Ignore safety check when sprinting
			 && util.distance(this.tileIndex, tileIndex) > 1
			 && util.sqDistance(this.tileIndex, tileIndex) === 1
			 && gs.numVisibleDangers() > 0
			 && this.canMoveTo(tileIndex)) {
		
		return;	
	}
	// Else we push a list of clicks ending in the index:
	else if (gs.stateManager.isCurrentState('GameState')) {
		// Pick up item:
		if (this.canReachItem(tileIndex)) {
			this.actionQueue[0] = {type: 'CLICK', tileIndex: tileIndex};
			gs.keyBoardMode = false;
		}
		// Interact: (takes care of no path to target. ex. slow diagonal):
		else if (this.canInteract(tileIndex)) {
			this.actionQueue[0] = {type: 'CLICK', tileIndex: tileIndex};
			gs.keyBoardMode = false;
		}
		// Interact: (takes care of no path to target. ex. slow diagonal):
		else if (this.canTalk(tileIndex)) {
			this.actionQueue[0] = {type: 'CLICK', tileIndex: tileIndex};
			gs.keyBoardMode = false;
		}
		// Attacking: (takes care of no path to target ex. ice, pit):
		else if (this.canAttack(tileIndex)) {
			this.actionQueue[0] = {type: 'CLICK', tileIndex: tileIndex};
			gs.keyBoardMode = false;
		}
		// Pathing:
		else {
			path = this.getPathTo(tileIndex, exploredOnly);
			
		
			if (path && path.length > 0) {
				// Quick Moving:
				if (input.keys.SHIFT.isDown && !this.isExploring) {
					let quickMoveErr = this.getQuickMoveError(tileIndex, path);
					if (quickMoveErr) {
						this.popUpText(quickMoveErr, 'Red');
						return;
					}

					this.movementType = MOVEMENT_TYPE.FAST;
					this.isMultiMoving = true;
					this.isQuickMoving = true;
				} 

				for (i = 0; i < path.length; i += 1) {
					this.actionQueue[i] = {
						type: 'CLICK', 
						tileIndex: path[i],
						isFastMove: input.keys.SHIFT.isDown && !this.isExploring,
						allowUnsafeMove: input.isActionKeyDown('UnsafeMove') || input.keys.SHIFT.isDown || this.isConfused};
				}

				gs.keyBoardMode = false;
			}
		}
		
		
	}
};

// GET_QUICK_MOVE_ERROR:
// ************************************************************************************************
PlayerCharacter.prototype.getQuickMoveError = function (tileIndex, path) {
	if (this.statusEffects.has('Slow')) {
		return 'Slowed!';
	}
	else if (this.isEncumbered) {
		return 'Encumbered!';
	}
	else if (this.statusEffects.has('Constricted')) {
		return 'Constricted!';
	}
	else if (this.isImmobile) {
		return 'Immobile!';
	}
	else if (this.currentSp < path.length) {
		return 'No Move Points!';
	}
	else if (this.cantMoveFromCharm(tileIndex)) {
		return "Cannot Run!";
	}
	
	// Non-explored space:
	if (path.find(index => !gs.getTile(index).explored)) {
		return 'Unexplored!';
	}
	
	// Allowed to move onto ally:
	if (this.canSwapWith(tileIndex)) {
		return null;
	}
	
	if (!gs.isPassable(tileIndex)) {
		return 'Invalid Destination!';
	}
	else {
		return null;
	}
};

// GET_RANGE_ATTACK_ERROR:
// ************************************************************************************************
PlayerCharacter.prototype.getRangeAttackError = function (tileIndex) {
	let weapon = this.inventory.getRangeWeapon();
	
	
	// No Weapon:
	if (!weapon) {
		return null;
	}
	
	// No Target:
	if (!PlayerTargeting.isValidCharTarget(tileIndex) && !PlayerTargeting.isValidTrapTarget(tileIndex)) {
		return null;
	}
	
	// Not attackable:
	if (gs.getChar(tileIndex) && gs.getChar(tileIndex).isDamageImmune) {
		return null;
	}

	// Out of Range:
	if (util.distance(this.tileIndex, tileIndex) > this.weaponRange(weapon)) {
		return 'Out of Range';
	}
	
	// No Clear Line:
	if (!this.canAttack(tileIndex, weapon)) {
		return 'No clear line';
	}
};

// CHOOSE_ACTION
// ************************************************************************************************
PlayerCharacter.prototype.chooseAction = function () {
	// The player has input control so we can unpause any paused timers:
	if (gs.timer && gs.timer.paused) {
		gs.timer.resume();
	}
	
	// Frozen or trapped skips turn:
	if (this.isStunned || this.isAsleep) {
		gs.pauseTime = 30;
		this.endTurn(ACTION_TIME);
		return;
	}
	
	// Exploration:
	// Grabbing new unexplored tile indices and 'clicking' on them:
	if (this.isExploring && this.body.state === 'WAITING' && this.actionQueue.length === 0) {
		this.startExploring();
	}
	
	// Travelling:
	if (this.isTravelling && this.body.state === 'WAITING' && this.actionQueue.length === 0) {
		this.startTravelling();
	}
	
	// Keyboard Controls:
	this.keyBoardControls();
	
	// Using Zone Line:
	// The player started to use a zone line in his previous turn.
	// We ended the players turn to give NPCs a turn to act
	// We now complete the turn
	if (this.usingZoneLine) {
		this.usingZoneLine = false;
		
		// We are still standing on a zone line i.e. we did not get knocked off
		if (gs.getObj(this.tileIndex, obj => obj.isZoneLine()) || gs.isPit(this.tileIndex)) {
			this.useZoneLine();
			return;
		}
	}
	
	// Process click queue:
	if (this.body.state === 'WAITING' && this.actionQueue.length > 0 && !this.eventQueue.isProcessing()) {
		// Dash attack handled as special case:
		if (this.statusEffects.has('DashAttack')) {
			this.dashAttackChooseAction();
			return;
		}
		
		// If its possible to complete the click queue ahead of schedule:
		if (this.tryToCompleteActionQueue()) {
			this.actionQueue = [];
			return;
		}

		// Get the next action the player has queued:
		let click = this.actionQueue.pop();

		// Waiting action:
		if (click.type === 'WAIT') {
			this.waitAction();
			return;
		}
		
		// Click tile Index action:
		let tileIndex = click.tileIndex;

		// Attacking:
		// !click.allowUnsafeMove && this.canAttack(tileIndex) && (this.movementType !== MOVEMENT_TYPE.FAST || gs.getChar(tileIndex, 'Crate'))) {
		if (this.canAttack(tileIndex) && (this.movementType !== MOVEMENT_TYPE.FAST || gs.getChar(tileIndex, 'Crate'))) {
			this.attack(tileIndex);
		}
		// Opening Doors (need to continue path):
		else if (gs.getObj(tileIndex, obj => obj.isSimpleDoor()) && this.canInteract(tileIndex)) {
			this.interact(tileIndex);
			
			if (this.actionQueue.length > 0) {
				let path = this.getPathTo(this.actionQueue[0].tileIndex, false);
				if (path && path.length > 0) {
					for (let i = 0; i < path.length; i += 1) {
						this.actionQueue[i] = {type: 'CLICK', tileIndex: path[i]};
					}
				}
			}
		}
		// Items:
		else if (this.canReachItem(tileIndex)) {
			this.tryToPickUpItem(tileIndex);
		}
		// Interact:
		else if (this.canInteract(tileIndex)) {
			this.interact(tileIndex);
		}
		// Dangerous Terrain:
		else if (this.canMoveTo(tileIndex) && gs.isIndexSafe(this.tileIndex, this) && !gs.isIndexSafe(tileIndex, this) && !click.allowUnsafeMove) {
			this.stopExploring();

			if (!gs.globalData.unsafeMove) {
				help.unsafeMoveDialog();
			}
			else {	
				this.popUpText('Dangerous Terrain');
			}
		}
		// Charmed moving:
		else if (this.cantMoveFromCharm(tileIndex)) {
			this.popUpText('Cannot run!', 'Red');
			this.stopExploring();
		}
		// Pit:
		else if (this.canJumpInPit(tileIndex)) {
			this.jumpInPit(tileIndex);
		}
		// Dialog:
		else if (this.canTalk(tileIndex)) {
			this.talk(tileIndex);
		}
		// Moving:
		else if (this.canMoveTo(tileIndex)) {
			this.moveTo(tileIndex, click.focusCamera, !click.isFastMove);
			
			// Clear actionQueue for fastMoves:
			// fastMoves occur one step at a time
			if (click.isFastMove) {
				this.currentSp -= 1;
				this.hasNPCActed = true;
				return;
			}
		}
	}
};



// DASH_ATTACK_CHOOSE_ACTION:
// ************************************************************************************************
PlayerCharacter.prototype.dashAttackChooseAction = function () {
	let click = this.actionQueue.pop();
	let tileIndex = click.tileIndex;
	let char = gs.getChar(tileIndex);
	
	// Consume a speed point:
	this.currentSp -= 1;
	
	// If there is a char we need to melee attack him:
	if (char && char !== this) {
		/*
		// Attack w/ weapon:
		let weapon = this.inventory.getPrimaryWeapon();
		let meleeDamageMultiplier = gs.abilityTypes.DashAttack.attributes.meleeDamageMultiplier.value(gs.pc);
		let attackFlags = {
			damage: this.weaponDamage() * meleeDamageMultiplier,
			noKnockBack: true,
		};
		
		weapon.type.attackEffect.useOn(tileIndex, weapon, attackFlags);
		*/
		
		// Attack w/ weapon:
		let weapon = this.inventory.getPrimaryWeapon();
		let meleeDamageMultiplier = gs.abilityTypes.DashAttack.attributes.meleeDamageMultiplier.value(gs.pc);
		let attackFlags = {
			damage: this.weaponDamage() * meleeDamageMultiplier,
			noKnockBack: true,
		};
		
		// We use the standard melee attack to prevent spears and axes from multi-hitting:
		gs.weaponEffects.Melee.useOn(tileIndex, weapon, attackFlags);
	}
	
	// If there is a char here we need to temporariliy remove him from the tile:
	if (char && char.isAlive) {
		gs.getTile(tileIndex).character = null;
	}
	
	// Now we move the player:
	this.moveTo(tileIndex, click.focusCamera, false);
	
	// We place the char back:
	if (char && char.isAlive && util.vectorEqual(char.tileIndex, tileIndex)) {
		gs.getTile(tileIndex).character = char;
	}
	
	// Recover speed points:
	if (this.talents.getTalentRank('DashAttack') === 2 && char && !char.isAlive) {
		gs.pc.gainSpeed(1);
	}
	
	// Last move:
	if (this.actionQueue.length === 0) {
		this.statusEffects.remove('DashAttack');
	}
};

// KEYBOARD_CONTROLS:
// ************************************************************************************************
PlayerCharacter.prototype.keyBoardControls = function () {
	var vector = null;
	if (this.keyHoldTime > 0 || !gs.stateManager.isCurrentState('GameState')) {
		this.keyHoldTime -= 1;
		return;
	}
	
	// Unlock keyboard:
	if (input.isActionKeyDown('SlowExplore')) {
		if (!this.keyboardMoveLock) {
			this.slowExplore();
			this.keyHoldTime = 5;
		}
		
	}
	else if (input.isActionKeyDown('Up')) {
		vector = {x: 0, y: -1};
	}
	else if (input.isActionKeyDown('Down')) {
		vector = {x: 0, y: 1};	 
	}
	else if (input.isActionKeyDown('Left')) {
		vector = {x: -1, y: 0};	 
	}
	else if (input.isActionKeyDown('Right')) {
		vector = {x: 1, y: 0};	 
	}
	else if (input.isActionKeyDown('UpLeft')) {
		vector = {x: -1, y: -1};	 
	}
	else if (input.isActionKeyDown('UpRight')) {
		vector = {x: 1, y: -1};	 
	}
	else if (input.isActionKeyDown('DownLeft')) {
		vector = {x: -1, y: 1};	 
	}
	else if (input.isActionKeyDown('DownRight')) {
		vector = {x: 1, y: 1};	 
	}
	// Unlock keyboard:
	else {
		this.keyboardMoveLock = false;
	}

	
	if (vector && this.keyboardMoveLock === false) {
		// Moving the cursor:
		if (gs.keyBoardMode) {
			this.moveCursor(vector);
		}
		// Moving the player:
		else {
			this.clickTileIndex({x: this.tileIndex.x + vector.x, y: this.tileIndex.y + vector.y}, false, MOVEMENT_TYPE.SNAP);
			this.isExploring = false;
		}
		
		this.keyHoldTime = 5;
	}
};

// MOVE_CURSOR:
// ************************************************************************************************
PlayerCharacter.prototype.moveCursor = function (vector) {
	// Moving Right:
	if (vector.x > 0 && gs.cursorTileIndex.x + 1 < NUM_TILES_X && gs.cursorTileIndex.x + 1 < gs.pc.tileIndex.x + 8) {
		gs.cursorTileIndex.x += vector.x;
	}
	// Moving Left:
	else if (vector.x < 0 && gs.cursorTileIndex.x - 1 >= 0 && gs.cursorTileIndex.x - 1 > gs.pc.tileIndex.x - 8) {
		gs.cursorTileIndex.x += vector.x;
	}
	
	// Moving Down:
	if (vector.y > 0 && gs.cursorTileIndex.y + 1 < NUM_TILES_Y && gs.cursorTileIndex.y + 1 < gs.pc.tileIndex.y + 8) {
		gs.cursorTileIndex.y += vector.y;
	}
	// Moving Up:
	else if (vector.y < 0 && gs.cursorTileIndex.y - 1 >= 0 && gs.cursorTileIndex.y - 1 > gs.pc.tileIndex.y - 8) {
		gs.cursorTileIndex.y += vector.y;
	}
};

// TRY_TO_COMPLETE_CLICK_QUEUE:
// ************************************************************************************************
PlayerCharacter.prototype.tryToCompleteActionQueue = function () {
	if (this.actionQueue[0].type === 'WAIT') {
		return false;
	}
	else if (this.actionQueue[0].type === 'USE_ZONE_LINE') {
		return false;
	}

	var tileIndex = this.actionQueue[0].tileIndex;

	// Attacking:
	if (this.canAttack(tileIndex) && !this.isMultiMoving && this.movementType !== MOVEMENT_TYPE.FAST && (!this.actionQueue[0].allowUnsafeMove || gs.isIndexSafe(tileIndex))) {
		this.attack(tileIndex);
		return true;
	}

	return false;
};

// SLOW_EXPLORE:
// ************************************************************************************************
PlayerCharacter.prototype.slowExplore = function () {
	let tileIndex;
	
	if (gs.activeCharacter() !== this || !gs.stateManager.isCurrentState('GameState') || !this.isReadyForInput()) {
		return;
	}
	
	if (gs.numVisibleDangers() === 0) {
		// First looking for cleared paths:
		tileIndex = gs.findUnexploredTileIndex(this.tileIndex);
		if (tileIndex) {
			let path = this.getPathTo(tileIndex, false);
			if (path && path.length > 0) {
				this.clickTileIndex(path[path.length - 1], false, MOVEMENT_TYPE.SNAP);
			}
			else {
				this.clickTileIndex(tileIndex, false, MOVEMENT_TYPE.SNAP);
			}
			
		}
		// Now looking for blocked (trapped) paths:
		else if (gs.unexploredTilesRemaining()) {
			this.popUpText('Partially Explored');
			this.stopExploring();
			this.keyboardMoveLock = true;
		}
		// No more tiles to explore:
		else {
			this.popUpText('Exploration Complete');
			this.stopExploring();
			this.keyboardMoveLock = true;
		}
	} 
	else {
		this.popUpText('Nearby Danger!', 'Red');
		this.stopExploring();
		this.keyboardMoveLock = true;
	}
};


// START_EXPLORING:
// ************************************************************************************************
PlayerCharacter.prototype.startExploring = function () {
	var tileIndex;

	if (gs.activeCharacter() !== this || !gs.stateManager.isCurrentState('GameState')) {
		return;
	}
	
	// Nearby Danger:
	if (gs.numVisibleDangers() > 0 || gs.isNearbyDanger()) {
		this.popUpText('Nearby Danger!', 'Red');
		this.stopExploring();
		return;
	}
	
	// First looking for cleared paths:
	tileIndex = gs.findUnexploredTileIndex(this.tileIndex);
	if (tileIndex) {
		this.isExploring = true;
		this.clickTileIndex(tileIndex, false, MOVEMENT_TYPE.FAST);
	}
	// Now looking for blocked (trapped) paths:
	else if (gs.unexploredTilesRemaining()) {
		/*
		tileIndex = gs.findUnexploredTileIndex(this.tileIndex, true);

		// Found a blocked path (will bring player to nearest index):
		if (tileIndex) {
			this.isExploring = true;
			this.clickTileIndex(tileIndex, false, MOVEMENT_TYPE.FAST);

		}
		else {
			this.popUpText('Partially Explored');
			this.stopExploring();
		}
		*/
		
		this.popUpText('Partially Explored');
		this.stopExploring();
	}
	// No more tiles to explore:
	else {
		this.popUpText('Exploration Complete');
		this.stopExploring();
	}
};

// STOP_EXPLORING:
// ************************************************************************************************
PlayerCharacter.prototype.stopExploring = function () {
	if (debug.shouldClearLevel) {
		return;
	}
	
	if (this.isExploring) {
		gs.focusCameraOnPC();
	}
	
	this.isTravelling = false;
	this.isExploring = false;
	this.actionQueue = [];
	this.isMultiMoving = false;
	this.isQuickMoving = false;
	
	// Just in case something calls us while we're multimoving:
	this.statusEffects.remove('Charge');
};

// START_TRAVELLING:
// ************************************************************************************************
PlayerCharacter.prototype.startTravelling = function () {
	// Not ready yet:
	if (!this.isReadyForInput()) {
		return;
	}
	
	// Done travelling:
	if (this.gotoLevelQueue.length === 0) {
		this.isTravelling = false;
		return;
	}
	
	// Popping level if we have arrived:
	if (gs.zoneName === this.gotoLevelQueue[this.gotoLevelQueue.length - 1].zoneName && gs.zoneLevel === this.gotoLevelQueue[this.gotoLevelQueue.length - 1].zoneLevel) {
		this.gotoLevelQueue.pop();
		
		// Debug Clear:
		if (debug.shouldClearLevel) {
			debug.clearLevel();
		}
		
		// Done travelling:
		if (this.gotoLevelQueue.length === 0) {
			this.isTravelling = false;
			return;
		}
	}
	
	let nextLevel = this.gotoLevelQueue[this.gotoLevelQueue.length - 1];
	let zoneLine = gs.objectList.find(obj => obj.toZoneName === nextLevel.zoneName && obj.toZoneLevel === nextLevel.zoneLevel);
	
	// Goto Stairs:
	if (!util.vectorEqual(this.tileIndex, zoneLine.tileIndex)) {
		
		if (debug.shouldClearLevel) {
			this.body.snapToTileIndex(zoneLine.tileIndex);
		}
		else {
			this.clickTileIndex(zoneLine.tileIndex, true, MOVEMENT_TYPE.FAST);
			
			// Failed path:
			if (gs.pc.actionQueue.length === 0) {
				this.stopExploring();
				this.popUpText('Goto Level Failed');
			}
		}
	}
	// Use Stairs:
	else {
		this.useZoneLine(zoneLine);
	}
	
	// Done travelling:
	if (this.gotoLevelQueue.length === 0) {
		this.isTravelling = false;
	}
	
	
};

// GOTO_STAIRS:
// ************************************************************************************************
PlayerCharacter.prototype.gotoStairs = function (tileIndex) {
	// Warp to Stairs:
	if (tileIndex && gs.debugProperties.warpStairs) {
		this.body.snapToTileIndex(tileIndex);
	}
	// Goto Stairs:
	else if (tileIndex && gs.getTile(tileIndex).explored) {
		let zoneName = gs.getObj(tileIndex).toZoneName;
		let zoneLevel = gs.getObj(tileIndex).toZoneLevel;
		
		this.stopExploring();
		this.isTravelling = true;
		this.gotoLevelQueue = [{zoneName: zoneName, zoneLevel: zoneLevel}];
		
	}
};

// GOTO_LEVEL:
// ************************************************************************************************
PlayerCharacter.prototype.gotoLevel = function (zoneName, zoneLevel) {
	
	
	// Find the path between current level and destination level:
	var openList = [], closedList = [], currentNode, goal;
	
	// TRY_TO_ADD_CHILD:
	let tryToAddChild = function (zoneName, zoneLevel, prevNode) {
		if (!isInList(zoneName, zoneLevel, openList) && !isInList(zoneName, zoneLevel, closedList)) {
			openList.push({
				zoneName: zoneName,
				zoneLevel: zoneLevel,
				prevNode: prevNode
			});
		}
	};
	
	// IS_IN_LIST:
	let isInList = function (zoneName, zoneLevel, list) {
		return list.find(node => node.zoneName === zoneName && node.zoneLevel === zoneLevel);
	};
	

	// First level (current):
	openList.push({zoneName: gs.zoneName, zoneLevel: gs.zoneLevel, prevNode: null});
		
	while (openList.length > 0) {
		currentNode = openList.shift();
		closedList.push(currentNode);
		
		// Adding all connections:
		let connectionList = gs.getLevelConnections(currentNode.zoneName, currentNode.zoneLevel);
		connectionList.forEach(function (e) {
			tryToAddChild(e.zoneName, e.zoneLevel, currentNode);
		}, this);
		
		goal = openList.find(e => e.zoneName === zoneName && e.zoneLevel === zoneLevel);
		if (goal) {
			break;
		}
	}
	
	if (goal) {
		
		this.gotoLevelQueue = [];
		
		let currentNode = goal;
		
		while (currentNode && !(currentNode.zoneName === gs.zoneName && currentNode.zoneLevel === gs.zoneLevel)) {
			this.gotoLevelQueue.push({zoneName: currentNode.zoneName, zoneLevel: currentNode.zoneLevel});
			currentNode = currentNode.prevNode;
		}
		
		this.isTravelling = true;
	}
};