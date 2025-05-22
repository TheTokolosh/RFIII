/*global Phaser, game, gs, util, input, debug*/
/*global levelController, Item, CharacterInventory, help, DungeonGenerator, PlayerTargeting*/
/*global console, isNaN, TILE_SIZE*/
/*global ItemSlot, ItemSlotList, Abilities, Character*/
/*global PC_MAX_LEVEL, FOOD_TIME, INVENTORY_SIZE, EXTENDED_WAIT_TURNS, FONT_NAME, PC_BASE_MAX_FOOD*/
/*global DAMAGE_TYPE, AMBIENT_COLD_RESISTANCE*/
/*global COLD_TIME, MAX_COLD_LEVEL, FREEZING_DAMAGE*/
/*global PLAYER_FRAMES, PLAYER_RACE_FRAMES, CONFUSION_RANDOM_MOVE_PERCENT*/
/*global FACTION, MAX_ABILITIES, MAX_PLAYER_SLEEP_TIME*/
/*global INVENTORY_WIDTH, INVENTORY_HEIGHT, CHARACTER_SIZE, MIN_TELEPORT_DISTANCE*/
/*global WEAPON_HOT_BAR_WIDTH, WEAPON_HOT_BAR_HEIGHT, ZONE_FADE_TIME, MOVEMENT_TYPE, ACTION_TIME, ITEM_SLOT*/
/*global MOVEMENT_SPEED, PC_BASE_SP_REGEN_TURNS, PLAYER_AGRO_CHANCE*/
/*global PC_HP_PER_STR, PC_MAX_MP_PER_INT, PC_MAX_MOVEMENT_POINTS_PER_DEX, PC_EVASION_PER_DEX, PC_ABILITY_POWER_PER_INT, ATTRIBUTE_LIST*/
/*global CrystalChestGenerator, achievements*/
/*jshint white: true, laxbreak: true, esversion: 6, loopfunc: true*/
'use strict';

// CREATE_PLAYER_CHARACTER:
// ************************************************************************************************
gs.createPlayerCharacter = function () {
	this.pc = new PlayerCharacter();
	this.characterList.push(this.pc);
};

// CREATE_PLAYER_TYPE:
// ************************************************************************************************
gs.createPlayerType = function () {
	this.playerType = {
		name: 'Player',
		niceName: 'Player',
		frame: 656,
		movementSpeed: MOVEMENT_SPEED.NORMAL,
		protection: 0,
		resistance: {
			Fire: 0,
			Cold: 0,
			Toxic: 0,
			Shock: 0
		},
		bloodTypeName: 'Blood',
		damageShield: {
			Fire: 0,
			Cold: 0,
			Toxic: 0,
			Shock: 0,
			Physical: 0,
		},
		reflection: 0,
		evasion: 0,
		size: CHARACTER_SIZE.MEDIUM,
		statusEffectImmunities: [],
		cropScaleFactor: 0.35,
		immunities: {},
		canOpenDoors: true,
		isFlying: 0,
		regenPerTurn: 0,
		isDamageImmune: 0,
		isLavaImmune: 0,
	};
	
	// Setting up exp per level:
	this.expPerLevel = [0, 0, 250];
	for (let i = 3; i <= PC_MAX_LEVEL; i += 1) {
		let exp = this.expPerLevel[i - 1],
			expPerKill = (i - 1) + 10;
		
		// XL:1-6
		if (i <= 6) {
			exp += expPerKill * 30; // 32 + i
		}
		// XL:7-10
		else if (i <= 10) {
			exp += expPerKill * 40;
		}
		// XL: 11-16
		else {
			exp += expPerKill * 55;
		}
		
		this.expPerLevel[i] = exp;
	}
};

// CONSTRUCTOR:
// ************************************************************************************************
function PlayerCharacter() {
	this.type = gs.playerType;
	
	this.createSharedProperties();

	this.id = gs.nextCharacterID;
	gs.nextCharacterID += 1;
	
	// Inventory:
	this.inventory = new CharacterInventory(this);

	this.reset();
}
PlayerCharacter.prototype = new Character();

// RESET:
// ************************************************************************************************
PlayerCharacter.prototype.reset = function () {
	this.isAlive = true;
	this.state = 'WAITING';
	this.waitTime = 0; // The time the character must wait to take next turn
	this.isMultiMoving = false;
	this.isQuickMoving = false;
	this.isHidden = true;
	this.isAgroed = true;
	
	// Achievement Trackers:
	this.isNudist = true;
	this.isUntouchable = true;
	this.numKills = 0;
	
	// Attributes:
	this.baseAttributes = {
		strength: 10,
		dexterity: 10,
		intelligence: 10,
	};
	
		
	// Components:
	this.abilities.clear();
	this.statusEffects.clear();
	this.eventQueue.clear();
	this.inventory.clear();
	this.talents.clear();
	
	
	
	// Pop up text:
	this.popUpTimer = 0;
	this.popUpQueue = [];
	
	// Defense:
	this.protection = 0;
	this.resistance = {Fire: 0, Cold: 0, Shock: 0, Toxic: 0};
	
	// Health and Mana:
	this.maxHp = 0;
	this.currentHp = 0;
	this.currentMp = 0;
	this.poisonDamage = 0;
	this.hpRegenTime = 0;
	this.mpRegenTime = 0;
	this.spRegenTime = 0;
	this.hpRegenTimer = 0;
	this.mpRegenTimer = 0;
	this.spRegenTimer = 0;
	this.currentFood = PC_BASE_MAX_FOOD;
	
	
	this.name = 'Player';
	this.isExploring = false;
	this.isTravelling = false;
	this.gotoLevelQueue = [];
	this.characterClass = null;
	this.numDeaths = 0;
	this.movementType = MOVEMENT_TYPE.NORMAL;
	this.faction = FACTION.PLAYER;
	this.previousTileIndex = null;
	this.summonIDList = [];
	this.keyHoldTime = 0;
	this.usingZoneLine = false; // Set to true when the player will use a zoneLine on his next turn
	
	// Exp:
	this.exp = gs.expPerLevel[1]; // Due to skills, level 1 actually requires 20 exp
	this.level = 1;
	
	// Attributes:
	this.attributePoints = 0;
	
	// Talents:
	this.talentPoints = 0;
	
	// Religion:
	this.religion = null;
	
	// Rage:
	this.rageTimer = 0;
	this.rage = 0;
	
	// Sleep:
	this.sleepTime = 0;

	// Permanent Bonuses:
	this.permanentHpBonus = 0;
	this.permanentMpBonus = 0;
	
	// Timers:
	this.starveTimer = 0;
	this.foodTimer = 0;
	this.foodTextTimer = 0;
	this.coldTimer = 0;
	this.regenTimer = 0;
	this.levitationTimer = 0;
	this.shieldOfIceTimer = 0;
	
	this.discoveredZoneList = [];


	
	// Cold Level: 0=Normal, 1=Cold, 2=Freezing (take damage)
	this.coldLevel = 0;

	// Click Queue:
	this.actionQueue = [];

	// Update stats before game begins:
	this.poisonDamage = 0;
};


// DROP_ITEM:
// Drops an item (from the cursor).
// This function does not actually remove the item from the inventory but rather places it below the players feet or as close as possible
// ************************************************************************************************
PlayerCharacter.prototype.dropItem = function (item) {
	var indexList, floorItem;
	
	indexList = gs.getIndexListInFlood(this.tileIndex, gs.isStaticPassable.bind(gs), 10);
	indexList = indexList.filter(index => !gs.getItem(index));
	
	floorItem = gs.createFloorItem(indexList[0], item);
	floorItem.wasDropped = true;
};

// CAN_DROP_ITEM:
// ************************************************************************************************
PlayerCharacter.prototype.canDropItem = function () {
	var indexList;
	
	indexList = gs.getIndexListInFlood(this.tileIndex, gs.isStaticPassable.bind(gs), 10);
	indexList = indexList.filter(index => !gs.getItem(index));
	
	return indexList.length > 0;
};

// UPDATE_TURN
// ************************************************************************************************
PlayerCharacter.prototype.updateTurn = function () {
	this.updateTurnFood();
	this.updateTurnCold();
	this.updateTurnSpeed();
	this.inventory.onUpdateTurn();
	
	// Sleep:
	if (this.isAsleep) {
		this.popUpText('Sleeping');
		this.sleepTime += 1;
		
		if (this.sleepTime > MAX_PLAYER_SLEEP_TIME) {
			this.sleepTime = 0;
			this.isAsleep = false;
		}
	}
	
	// Levitation:
	if (this.isFlying && gs.isPit(this.tileIndex)) {
		this.levitationTimer += 1;
		
		if (this.levitationTimer === 11) {
			this.fallDownPit();
		}
	}
	
	// Reset Levitation:
	if (!gs.isPit(this.tileIndex)) {
		this.levitationTimer = 0;
	}
		
	// Rest Help:
	if (!gs.globalData.rest && this.currentHp < this.maxHp / 2 && gs.numVisibleDangers() === 0) {
		help.restDialog();
	}
	
	// Rolling Stealth:
	if (util.frac() < PLAYER_AGRO_CHANCE) {
		this.isHidden = false;
	}
	else {
		this.isHidden = true;
	}
	
	this.updateTurnBase();
	this.updateStats();
};

// UPDATE_TURN_SPEED:
// ************************************************************************************************
PlayerCharacter.prototype.updateTurnSpeed = function () {
	this.spRegenTimer += 1;
	
	if (this.isEncumbered) {
		this.spRegenTimer = 0;
	}
	
	if (this.spRegenTimer >= this.spRegenTime) {
		this.spRegenTimer = 0;
		this.gainSpeed(1);
	}
};

// UPDATE_TURN_COLD:
// ************************************************************************************************
PlayerCharacter.prototype.updateTurnCold = function () {
	if (gs.zoneType().isCold && this.resistance.Cold < AMBIENT_COLD_RESISTANCE) {
		this.coldTimer += 1;
		if (this.coldTimer > COLD_TIME) {
			this.coldTimer = 0;
			if (this.coldLevel < MAX_COLD_LEVEL) {
				this.coldLevel += 1;
			} 
			else {
				this.takeDamage(FREEZING_DAMAGE, 'Cold', {killer: 'Freezing', neverCrit: true});
			}
		}
	} 
	else {
		this.coldLevel = 0;
	}
};

// UPDATE_TURN_FOOD:
// ************************************************************************************************
PlayerCharacter.prototype.updateTurnFood = function () {
	// Mummy can skip:
	if (this.race.name === 'Mummy') {
		return;
	}
	
	// Eat Food:
	if (this.foodTimer >= this.foodTime()) {
		this.foodTimer = 0;
		if (this.currentFood > 0) {
			this.currentFood -= 1;
		}
	} 
	else {
		this.foodTimer += 1;
	}
	
	
	// Starving Damage:
	this.starveTimer += 1;
	if (this.currentFood === 0 && this.starveTimer >= 3) {
		this.starveTimer = 0;
		this.takeDamage(1, 'None', {killer: 'Hunger', neverCrit: true});
	}

	// Hungry Message:
	if (this.currentFood <= 3 && this.foodTextTimer >= 10) {
		if (this.currentFood <= 1) {
			this.popUpText('VERY HUNGRY', 'Red');
		}
		else {
			this.popUpText('HUNGRY',  'Red');
		}
		
		this.foodTextTimer = 0;
		
		if (this.actionQueue.length > 0 && this.actionQueue[0].type === 'WAIT') {
			this.stopExploring();
		}
	} 
	// Tick food text timer:
	else if (this.foodTextTimer < 10) {
		this.foodTextTimer += 1;
	}
};

// IS_HUNGRY:
// ************************************************************************************************
PlayerCharacter.prototype.isHungry = function () {
	return this.currentFood === 0 && this.race.name !== 'Mummy';
};

// FOOD_TIME:
// ************************************************************************************************
PlayerCharacter.prototype.foodTime = function () {
	let turns = FOOD_TIME;
	
	
	if (this.hasSustenance) {
		turns = turns * 2;
	}
	
	if (this.race.name === 'Troll') {
		turns = turns * 0.5;
	}
	
	return turns;
};


// QUICK_WEAPON_ATTACK:
// ************************************************************************************************
PlayerCharacter.prototype.rangeWeaponAttack = function (tileIndex) {
	gs.keyBoardMode = false;
	this.attack(tileIndex, true, this.inventory.getRangeWeapon());
};



// WEAPON_SKILL:
// ************************************************************************************************
PlayerCharacter.prototype.weaponSkill = function (weapon) {
	weapon = weapon || this.inventory.getPrimaryWeapon();
	
	return weapon.type.attackEffect.skill;
};

// GET_CONFUSED_CLICK_TILE_INDEX:
// Used when the player is confused
// ************************************************************************************************
PlayerCharacter.prototype.getConfusedClickTileIndex = function () {
	var indexList = gs.getIndexListInBox(this.tileIndex.x - 1, this.tileIndex.y - 1, this.tileIndex.x + 2, this.tileIndex.y + 2);
	indexList = indexList.filter(index => !util.vectorEqual(index, this.tileIndex));
	indexList = indexList.filter(index => gs.isPassable(index) || this.canAttack(index));
	return util.randElem(indexList);
};

// GET_PATH_TO:
// ************************************************************************************************
PlayerCharacter.prototype.getPathTo = function (tileIndex, exploredOnly) {
	// Sprinting:
	if (input.keys.SHIFT.isDown) {
		let safePath = gs.findPath(this.tileIndex, tileIndex, {
			allowDiagonal: this.movementSpeed > 0,
			avoidTraps: true,
			exploredOnly: exploredOnly,
			passDoors: true,
			canWalkFunc: this.canWalk.bind(this),
			maxDepth: 1000,
			character: this,
			allowPortals: true,
			isSprinting: true,
		});
		
		let unsafePath = gs.findPath(this.tileIndex, tileIndex, {
			allowDiagonal: this.movementSpeed > 0,
			avoidTraps: false,
			exploredOnly: exploredOnly,
			passDoors: true,
			canWalkFunc: this.canWalk.bind(this),
			maxDepth: 1000,
			character: this,
			allowPortals: true,
			isSprinting: true,
		});
		
		// No path:
		if (!safePath && !unsafePath) {
			return null;
		}
		
		if (safePath && safePath.length <= unsafePath.length) {
			return safePath;
		}
		else {
			return unsafePath;
		}
		
		
	}
	// Normal Movement:
	else {
		return gs.findPath(this.tileIndex, tileIndex, {
			allowDiagonal: this.movementSpeed > 0,
			avoidTraps: gs.isIndexSafe(this.tileIndex, this) && !input.keys.SHIFT.isDown,
			exploredOnly: exploredOnly,
			passDoors: true,
			canWalkFunc: this.canWalk.bind(this),
			maxDepth: 1000,
			character: this,
			allowPortals: true,
			allowPits: gs.isPit(tileIndex) || gs.isPit(this.tileIndex)
		});
	}
};

// CAN_WALK:
// ************************************************************************************************
PlayerCharacter.prototype.canWalk = function (tileIndex) {
	if (gs.isPit(tileIndex) && !this.isFlying) {
		return false;
	}
	
	return true;
};


PlayerCharacter.prototype.waitAction = function () {
	let fullHp = this.currentHp === this.maxHp;
	let fullMp = this.currentMp === this.maxMp;
	
	this.endTurn(100);
	
	if (!fullHp && this.currentHp === this.maxHp) {
		this.popUpText('Full Health');
	}
	
	if (!fullMp && this.currentMp === this.maxMp) {
		this.popUpText('Full Mana');
	}
};

// CANT_MOVE_FROM_CHARM:
// ************************************************************************************************
PlayerCharacter.prototype.cantMoveFromCharm = function (tileIndex) {	
	if (this.statusEffects.has('NPCCharm') && !this.isMultiMoving) {
		let npc = gs.getCharWithID(this.statusEffects.get('NPCCharm').casterId);

		if (util.distance(tileIndex, npc.tileIndex) > util.distance(this.tileIndex, npc.tileIndex) + 0.5) {
			return true;
		}
	}
	
	return false;
};







// ON_ENTER_TILE:
// Called once the character has actually finished moving and entered the tile
// Note that his tileIndex is already correct as it was set when beginning the move
// ************************************************************************************************
PlayerCharacter.prototype.onEnterTile = function () {
	this.onEnterTileBase();
	
	let shouldMoveAttack = 	(this.talents.getTalentRank('StrafeAttack') === 1 && !this.isMultiMoving) ||
							(this.talents.getTalentRank('StrafeAttack') === 2 && !this.isMultiMoving) ||
							(this.talents.getTalentRank('StrafeAttack') === 2 && this.isQuickMoving);
	
	
	// Strafe Attack:
	if (!this.body.isKnockBack && shouldMoveAttack && !this.dontStrafeAttack) {
		this.moveAttack();
	}
	this.dontStrafeAttack = false;
	
	if (this.actionQueue.length === 0) {
		this.isMultiMoving = false;
		this.isQuickMoving = false;
	}

	// Pick Up Items:
	if (gs.getItem(this.tileIndex) && !this.isMultiMoving && !gs.getItem(this.tileIndex).wasDropped) {
		if (this.inventory.canAddItem(gs.getItem(this.tileIndex).item)) {
			this.pickUpItem(gs.getItem(this.tileIndex));
		}
		else {
			this.stopExploring();
			this.popUpText('Inventory Full');
			gs.getItem(this.tileIndex).wasDropped = true;
		}
	}
	
	// Blood Vampirism:
	if (this.canConsumeBlood()) {
		this.consumeBlood();
	}
	
	// Calc LoS:
	gs.calculateLoS();
	
	// Level Controller:
	levelController.onPCEnterTile(this.tileIndex);
	
	// Interact with objects:
	if (this.canInteract(this.tileIndex)) {
		this.interact(this.tileIndex);
	}
	
	if (!gs.globalData.stairs && gs.getObj(this.tileIndex, 'DownStairs')) {
		help.stairsDialog();
	}
};

// CAN_CONSUME_BLOOD:
// ************************************************************************************************
PlayerCharacter.prototype.canConsumeBlood = function () {
	return this.hasBloodVampirism
		&& !this.isMultiMoving
		&& gs.getObj(this.tileIndex, obj => obj.type.niceName === 'Blood') 
		&& this.currentHp < this.maxHp;
};

// CONSUME_BLOOD:
// ************************************************************************************************
PlayerCharacter.prototype.consumeBlood = function () {
	// Destory Blood:
	if (gs.getObj(this.tileIndex, ['Blood', 'WaterBlood'])) {
		gs.destroyObject(gs.getObj(this.tileIndex));
	}
	
	// Heal:
	let amount = Math.min(this.maxHp - this.currentHp, Math.max(1, Math.floor(this.maxHp * 0.05)));	
	this.healHp(amount);
	
	// Particles, text and sound:
	gs.createParticlePoof(gs.pc.tileIndex, 'RED');
	this.popUpText('+' + amount + 'HP', 'Green');
	gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	
	// Blood Lust:
	if (this.statusEffects.has('BloodLust')) {
		
		this.statusEffects.get('BloodLust').timer = 0;
		
		if (this.statusEffects.get('BloodLust').duration < 5) {
			this.statusEffects.get('BloodLust').duration += 1;
		}
	}
	else {
		this.statusEffects.add('BloodLust');
	}
	
	this.updateStats();
	
	
	this.stopExploring();
};

// CAN_REACH_ITEM:
// Seperate from walking over a tile and picking up an item
// ************************************************************************************************
PlayerCharacter.prototype.canReachItem = function (tileIndex) {
	return gs.getItem(tileIndex) 
		&& !gs.isPassable(tileIndex) 
		&& util.distance(tileIndex, this.tileIndex) <= 1.5 
		&& !this.isMultiMoving;
};

// TRY_TO_PICK_UP_ITEM:
// ************************************************************************************************
PlayerCharacter.prototype.tryToPickUpItem = function (tileIndex) {
	if (this.inventory.canAddItem(gs.getItem(tileIndex).item)) {
		this.pickUpItem(gs.getItem(tileIndex));
	}
	else {
		this.popUpText('Inventory Full');
		this.stopExploring();
		gs.getItem(tileIndex).wasDropped = true;
	}
};

// PICK_UP_ITEM:
// ************************************************************************************************
PlayerCharacter.prototype.pickUpItem = function (floorItem) {
	var item = floorItem.item;
	
	if (item.type.name === 'GoldCoin') {
		item.amount = Math.ceil(item.amount * this.goldMod);	
	}
	
	this.inventory.addItem(item);
	
	// Experience:
	if (!floorItem.wasDropped && item.type.name !== 'GobletOfYendor') {
		this.gainExperience(5 + gs.dangerLevel());
	}
	
	this.actionQueue = [];
	
	if (item.getSound()) {
		gs.playSound(item.getSound(), gs.pc.tileIndex);
	}
	
	gs.destroyFloorItem(floorItem);
	
	this.stopExploring();
	this.keyboardMoveLock = true;
	
	if (item.type.name === 'GoldCoin') {
		gs.createParticlePoof(floorItem.tileIndex, 'YELLOW', 10);	
	}
	
	if (util.inArray(item.type.slot, [ITEM_SLOT.SECONDARY, ITEM_SLOT.RING, ITEM_SLOT.BODY, ITEM_SLOT.HEAD, ITEM_SLOT.HANDS, ITEM_SLOT.FEET])) {
		help.itemDialog();
	}
	if (item.type.isTome) {
		help.bookDialog();
	}
	
	// Test victory condition:
	if (item.type.name === 'GobletOfYendor') {
		gs.popUpGobletDialog();
	}
	
	gs.HUD.miniMap.refresh();
	
	// End turn when picking items off of tables
	if (!util.vectorEqual(this.tileIndex, floorItem.tileIndex) && item.type.name !== 'GobletOfYendor') {
		this.endTurn(100);
	}
	
	// Trigger:
	if (gs.getTile(floorItem.tileIndex).floorTrigger) {
		levelController.activateFloorTrigger(floorItem.tileIndex);
	}
};

// CAN_SWAP_WITH:
// Returns true if there is an ally at the tileIndex, and that ally can swap places with the player.
// Takes into account swimming creatures that cannot leave lava or water
// ************************************************************************************************
PlayerCharacter.prototype.canSwapWith = function (tileIndex) {
	return gs.isStaticPassable(tileIndex)
		&& gs.getChar(tileIndex)
		&& gs.getChar(tileIndex) !== this
		&& gs.getChar(tileIndex).faction === FACTION.PLAYER
		&& !gs.getChar(tileIndex).isImmobile
		&& !gs.getChar(tileIndex).isStunned
		&& gs.getChar(tileIndex).canMoveToTile(this.tileIndex);
};

// CAN_MOVE_TO:
// ************************************************************************************************
PlayerCharacter.prototype.canMoveTo = function (tileIndex) {
	if (this.isImmobile) {
		return false;
	}
	
	if (this.cantMoveFromCharm(tileIndex)) {
		return false;
	}
	
	if (gs.isPit(tileIndex) && !this.isFlying) {
		return false;
	}
	
	return gs.isPassable(tileIndex) || this.canSwapWith(tileIndex);
};

// CAN_JUMP_IN_PIT:
// ************************************************************************************************
PlayerCharacter.prototype.canJumpInPit = function (tileIndex) {
	return gs.isPit(tileIndex) && !this.isFlying;
};

// JUMP_IN_PIT:
// Called when the player intentionally clicks a pit
// ************************************************************************************************
PlayerCharacter.prototype.jumpInPit = function (tileIndex) {
	var pitFunc, dialog;
	
	pitFunc = function () {
		this.body.moveToTileIndex(tileIndex);
	}.bind(this);
	
	dialog = [{}];
	
	// Cannot jump if immobile:
	if (this.isImmobile) {
		this.popUpText('Immobile');
		return;
	}
	
	// Jump down to next level:
	if (gs.nextLevel()) {
		dialog[0].text = 'Really jump into the pit?';
		dialog[0].responses = [
			{text: 'Yes', nextLine: 'exit', func: pitFunc, keys: ['accept']},
			{text: 'No', nextLine: 'exit', keys: ['escape']},
		];
	}
	// Bottomless Pit:
	else {
		dialog[0].text = 'This pit is bottomless...';
		dialog[0].responses = [
			{text: '[ok]', nextLine: 'exit', keys: ['accept', 'escape']},
		];
	}
	
	this.stopExploring();
	gs.messageQueue.pushMessage(dialog);
};

// MOVE_TO:
// ************************************************************************************************
PlayerCharacter.prototype.moveTo = function (tileIndex, focusCamera, endTurn = true) {
	var prevTileIndex = {x: this.tileIndex.x, y: this.tileIndex.y};
	
	// Halt exploration:
	if (this.isExploring && !gs.isIndexSafe(tileIndex, this)) {
		this.stopExploring();
		return;
	}
	
	// Swap places:
	if (this.canSwapWith(tileIndex)) {
		gs.getChar(tileIndex).body.moveToTileIndex(this.tileIndex);
	}
		
	this.moveAttackPrevIndex = {x: this.tileIndex.x, y: this.tileIndex.y};
	this.body.moveToTileIndex(tileIndex, focusCamera);
		
	if (endTurn && (!this.isMultiMoving || this.actionQueue.length === 0) && !this.statusEffects.has('Charge')) {
		this.endTurn(this.moveTime());	
	}
};



// CAN_TALK:
// ************************************************************************************************
PlayerCharacter.prototype.canTalk = function (tileIndex) {
	var character = gs.getChar(tileIndex);
	return character 
		&& character.faction === FACTION.NEUTRAL
		&& gs.dialog[character.type.name]
		&& util.distance(this.tileIndex, character.tileIndex) <= 1.5;
};

// TALK
// ************************************************************************************************
PlayerCharacter.prototype.talk = function (tileIndex) {
	gs.dialogNPC = gs.getChar(tileIndex);
	gs.messageQueue.pushMessage(null); // 
};

// CAN_ATTACK:
// ************************************************************************************************
PlayerCharacter.prototype.canAttack = function (tileIndex, weapon) {	
	weapon = weapon || this.inventory.getPrimaryWeapon();
	
	let isValidCharTarget = PlayerTargeting.isValidCharTarget(tileIndex);
	let isValidTrapTarget = PlayerTargeting.isValidTrapTarget(tileIndex) && weapon.type.range > 1.5;
	let isValidTarget = isValidCharTarget || isValidTrapTarget;
	
	return gs.isInBounds(tileIndex)
		&& isValidTarget
		&& weapon.type.attackEffect.canUseOn(tileIndex, weapon);
};

// CAN_RANGE_ATTACK:
// ************************************************************************************************
PlayerCharacter.prototype.canRangeAttack = function (tileIndex) {	
	// No Range Weapon:
	if (!this.inventory.getRangeWeapon()) {
		return false;
	}
	
	return this.canAttack(tileIndex, this.inventory.getRangeWeapon());
};

// ATTACK:
// ************************************************************************************************
PlayerCharacter.prototype.attack = function (tileIndex, endTurn = true, weapon = null) {
	weapon = weapon || this.inventory.getPrimaryWeapon();
	
	let prevTileIndex = {x: this.tileIndex.x, y: this.tileIndex.y};
	
	// Handle dangerous rapier attacks:
	if (weapon.type.attackEffect.skill === 'Melee' && this.talents.hasLearnedTalent('Lunge') && util.distance(this.tileIndex, tileIndex) > weapon.type.range) {
		let toTileIndex = weapon.type.attackEffect.getStepIndex(tileIndex);
		if (!util.vectorEqual(toTileIndex, this.tileIndex) && !gs.isIndexSafe(toTileIndex, this) && !input.isActionKeyDown('UnsafeMove')) {
			this.popUpText('Dangerous Terrain!', 'Red');
			return;
		}
	}
	
	
	// Handle dangerous fire pots:
	if (gs.getChar(tileIndex) && gs.getChar(tileIndex).type.name === 'FirePot' && !this.statusEffects.has('Charge') && !input.isActionKeyDown('UnsafeMove')) {
		this.popUpText('Dangerous Target!', 'Red');
		return;
	}
	
	
	// Facing the target:
	this.body.faceTileIndex(tileIndex);
	
	// Attacking character (takes priority):
	if (gs.getChar(tileIndex)) {
		this.attackCharacter(tileIndex, weapon);
	}
	// Attacking trap w/ range:
	else if (this.weaponSkill(weapon) === 'Range' && PlayerTargeting.isValidTrapTarget(tileIndex)) {
		weapon.type.attackEffect.useOn(tileIndex, weapon);
	}
	// Attacking trap w/ melee:
	else if (this.weaponSkill(weapon) === 'Melee' && PlayerTargeting.isValidTrapTarget(tileIndex)) {
		this.body.faceTileIndex(tileIndex);
		this.body.bounceTowards(tileIndex);
		gs.getObj(tileIndex).stepOn(null);
	}
	else {
		throw 'Cannot attack tileIndex';
	}
	
	
	// Removing Storm Arrow:
	this.statusEffects.remove('StormShot');
	this.statusEffects.remove('FireStorm');
	this.statusEffects.remove('Vanish');
	
	// End Turn:
	if (endTurn) {
		if (weapon.type.attackEffect.skill === 'Melee' && this.talents.hasLearnedTalent('Lunge') && !util.vectorEqual(this.tileIndex, prevTileIndex)) {
			// Pass (don't end turn after lunging)
		}
		else if (this.statusEffects.has('Charge')) {
			this.statusEffects.remove('Charge');
			this.isMultiMoving = false;
		}
		else {
			this.endTurn(ACTION_TIME);
		}
		
	}
};

// ATTACK_CHARACTER:
// ************************************************************************************************
PlayerCharacter.prototype.attackCharacter = function (tileIndex, weapon) {
	let list = this.statusEffects.list.filter(statusEffect => statusEffect.onAttack);
	
	if (list.length > 0) {
		list.forEach(function (statusEffect) {
			statusEffect.onAttack(this, weapon, tileIndex);
		}, this);
	}
	else {
		weapon.type.attackEffect.useOn(tileIndex, weapon);
	}
};

// AUTO_MELEE_ATTACK:
// Either moves the player safely towards nearest enemy or attacks if in range
// ************************************************************************************************
PlayerCharacter.prototype.autoMeleeAttack = function () {
	if (!this.isReadyForInput()) {
		return;
	}
	
	// Nearest attackable NPC:
	let nearestNPC = null;
	let list = gs.getAllNPCs().filter(npc => this.canAttack(npc.tileIndex) && npc.faction === FACTION.HOSTILE && (gs.pc.canSeeCharacter(npc) || npc.isAgroed) && !npc.isDamageImmune);
	
	list.sort((a, b) => util.distance(gs.pc.tileIndex, a.tileIndex) - util.distance(gs.pc.tileIndex, b.tileIndex));
	if (list.length > 0) {
		nearestNPC = list[0];
	}
	
	// Get nearest visible hostile w/ a clear path:
	if (!nearestNPC) {
		let list = gs.getAllNPCs().filter(npc => npc.faction === FACTION.HOSTILE && (this.canSeeCharacter(npc) || npc.isAgroed) && !npc.isDamageImmune);
		
		// Clear path:
		list = list.filter(npc => this.getPathTo(npc.tileIndex, true));
		
		list.sort((a, b) => util.distance(gs.pc.tileIndex, a.tileIndex) - util.distance(this.tileIndex, b.tileIndex));
	
		if (list.length > 0) {
			nearestNPC = list[0];
		}
	}
	
	if (nearestNPC) {
		gs.hasNPCActed = true;
		this.clickTileIndex(nearestNPC.tileIndex, true, MOVEMENT_TYPE.NORMAL, false, true);
	}
};

// AUTO_RANGE_ATTACK:
// ************************************************************************************************
PlayerCharacter.prototype.autoRangeAttack = function () {
	if (!this.isReadyForInput()) {
		return;
	}
	
	// Nearest attackable NPC:
	let nearestNPC = null;
	//let list = gs.getAllNPCs().filter(npc => this.canRangeAttack(npc.tileIndex) && npc.faction === FACTION.HOSTILE && gs.pc.canSeeCharacter(npc) && !npc.isDamageImmune);
	let list = gs.getAllNPCs().filter(npc => this.canRangeAttack(npc.tileIndex) && npc.faction === FACTION.HOSTILE && !npc.isDamageImmune);
	
	list.sort((a, b) => util.distance(gs.pc.tileIndex, a.tileIndex) - util.distance(gs.pc.tileIndex, b.tileIndex));
	if (list.length > 0) {
		nearestNPC = list[0];
	}
	
	// Nearest visible:
	if (!nearestNPC) {
		nearestNPC = this.getNearestVisibleHostile();
	}
	
	if (nearestNPC) {
		gs.hasNPCActed = true;
		this.clickTileIndex(nearestNPC.tileIndex, true, MOVEMENT_TYPE.NORMAL, true, true);
	}
};
	



// GET_NEAREST_VISIBLE_HOSTILE:
// ************************************************************************************************
PlayerCharacter.prototype.getNearestVisibleHostile = function () {
	var list = gs.getAllNPCs().filter(npc => npc.faction === FACTION.HOSTILE && this.canSeeCharacter(npc) && !npc.isDamageImmune);
	
	list.sort((a, b) => util.distance(gs.pc.tileIndex, a.tileIndex) - util.distance(this.tileIndex, b.tileIndex));
	
	return list.length > 0 ? list[0] : null;
};



// STRAFE_ATTACK:
// ************************************************************************************************
PlayerCharacter.prototype.moveAttack = function () {
	
	if (!this.previousTileIndex || !this.moveAttackPrevIndex) {
		return;
	}
	
	if (this.statusEffects.has('StormShot') || this.statusEffects.has('FireStorm')) {
		return;
	}
	
	// Melee First:
	let weapon = this.inventory.getPrimaryWeapon();
	var targetTileIndex = this.getMoveAttackTarget(weapon);
	if (targetTileIndex && this.canAttack(targetTileIndex, weapon)) {
		gs.hasNPCActed = true;
		this.attack(targetTileIndex, false);
		
		return;
	}
	
	// Range:
	weapon = this.inventory.getRangeWeapon();
	if (weapon) {
		targetTileIndex = this.getMoveAttackTarget(weapon);
		if (targetTileIndex && this.canAttack(targetTileIndex, weapon)) {
			gs.hasNPCActed = true;
			this.attack(targetTileIndex, false, weapon);
			return;
		}
	}
};

// GET_STRAFE_ATTACK_TARGET:
// Call this the moment the player starts his turn to determine if there is a valid moveAttack target
// Will return null if now valid target
// Player will need to remember his target in order to attack him when he completes his move
// ************************************************************************************************
PlayerCharacter.prototype.getMoveAttackTarget = function (weapon) {
	var list;
	
	// Attackable NPCs:
	list = gs.getAllNPCs().filter(npc => this.canAttack(npc.tileIndex, weapon));
	
	// Only move attacking visible and hostile npcs:
	list = list.filter(npc => this.isHostileToMe(npc) && this.canSeeCharacter(npc) && npc.isAgroed && npc.name !== 'GobletShield'); 
	
	// Only move attack if in weaponRange (need to double check due to rapiers odd canAttack handling):
	list = list.filter(npc => util.distance(this.tileIndex, npc.tileIndex) <= gs.pc.weaponRange(weapon));
	
	// Never attack sleeping enemies:
	list = list.filter(npc => !npc.isAsleep);
	
	// Never attack reflective enemies:
	if (weapon.type.attackEffect.skill === 'Range') {
		list = list.filter(npc => npc.reflection === 0);
	}
	
	// Never melee attack damage shield enemies:
	if (weapon.type.attackEffect.skill === 'Melee' && this.isVulnerableToDamageShield()) {
		list = list.filter(npc => !npc.hasDamageShield());
	}
	
	// Only npcs that we are not moving away from:
	list = list.filter(function (npc) {
		// Some quick checks to not include un-initialized NPCs:
		if (!npc.previousTileIndex) {
			return false;
		}
		
		return util.distance(npc.previousTileIndex, this.tileIndex) - util.distance(npc.previousTileIndex, this.moveAttackPrevIndex) <= 0
			|| util.sqDistance(npc.previousTileIndex, this.tileIndex) === 1;
	}, this);

	// Targeting the nearest enemy:
	list.sort((a, b) => util.distance(this.tileIndex, a.tileIndex) - util.distance(this.tileIndex, b.tileIndex));
		
	return list.length > 0 ? list[0].tileIndex : null;
};

// CANNOT_USE_ABILITY:
// Returns a string (true) as to why player cannot use ability
// Returns false otherwise
// ************************************************************************************************
PlayerCharacter.prototype.cannotUseAbility = function (abilityIndex) {
	var ability = this.abilities.list[abilityIndex];

	// Confused:
	if (this.isConfused && !ability.type.itemType) {
		return 'Confused!';
	}
	
	// Magic Abilities:
	if (ability.type.mana && this.currentMp < this.manaCost(ability)) {
		// Mana not enough:
		if (!gs.debugProperties.disableMana) {
			return 'Out of Mana';
		}
	}
	// Speed Points:
	else if (ability.type.speedPoints && this.currentSp < ability.type.speedPoints) {
		// Speed Points not enough:
		if (!gs.debugProperties.disableMana) {
			return 'Out of Speed Points';
		}
	}
	// Non-magic:
	else {
		// Cooldown not done:
		if (ability.coolDown > 0) {
			return 'Not Ready';
		}
	}
	
	// Sustained abilities:
	if (ability.type.isSustained) {
		// Can always turn an ability off:
		if (ability.isOn) {
			return false;
		}
		// Not enough max mana:
		else if (ability.type.isSustained && !ability.isOn && this.maxMp < this.manaCost(ability)) {
			return 'Out of Mana';
		}
	} 
	
	
	
	// Hit Points not enough:
	if (this.currentHp <= ability.type.hitPointCost) {
		return 'Out of Health';
	}
	
	// Basic canUse requirement not met:
	if (!ability.type.canUse(this)) {
		return 'Cannot use';
	}
	
	return false;
};

// CLICK_ABILITY:
// ************************************************************************************************
PlayerCharacter.prototype.clickAbility = function (abilityIndex) {
	if (!this.isReadyForInput() || !this.abilities.abilityInSlot(abilityIndex)) {
		return;
	}

	if (gs.stateManager.isCurrentState('UseAbility')) {
		gs.pc.cancelUseAbility();
		return;		
	}

	if (!gs.stateManager.isCurrentState('GameState')) {
		return;
	}
	
	if (this.cannotUseAbility(abilityIndex)) {
		this.popUpText(this.cannotUseAbility(abilityIndex));
		return;
	}
	
	// Set selectedAbility and selectedItem:
	this.selectedAbility = this.abilities.list[abilityIndex];

	// Turn off a sustained ability:
	if (this.selectedAbility.isOn) {
		this.selectedAbility.isOn = false;
		this.updateStats();
		this.popUpText(gs.capitalSplit(this.selectedAbility.type.name) + ' off');
		this.endTurn(ACTION_TIME);
	}
	// Turn on sustained ability:
	else if (this.selectedAbility.type.isSustained) {
		this.selectedAbility.isOn = true;
		this.popUpText(gs.capitalSplit(this.selectedAbility.type.name) + ' on');
		this.updateStats();
		this.endTurn(ACTION_TIME);
	}
	// Use Immediately:
	else if (this.selectedAbility.type.useImmediately) {
		this.zap();
		gs.keyBoardMode = false;
	} 
	// Switching to ability targeting state:
	else {
		gs.stateManager.pushState('UseAbility');
		
		gs.playSound(gs.sounds.spell, gs.pc.tileIndex);

		// Popup Text:
		this.popUpText(gs.capitalSplit(this.selectedAbility.type.name));

		// Particle Generator:
		if (this.particleGenerator) {
			this.particleGenerator.isAlive = false;
		}

		if (this.selectedAbility.type.particleColor) {
			this.particleGenerator = gs.createCastingParticle(this.tileIndex, this.selectedAbility.type.particleColor);
		}
	}
};

// IS_ABILITY_ON:
// Is the sustained ability turned on?
// ************************************************************************************************
PlayerCharacter.prototype.isAbilityOn = function (abilityName) {
	var isOn = false;
	
	this.abilities.list.forEach(function (ability) {
		if (ability && ability.type.name === abilityName && ability.isOn) {
			isOn = true;
		}
	}, this);
	
	return isOn;
};

// CAN_ZAP:
// ************************************************************************************************
PlayerCharacter.prototype.canZap = function (tileIndex) {
	return gs.stateManager.isCurrentState('UseAbility')
		&& gs.isInBounds(gs.cursorTileIndex)
		&& this.selectedAbility.type.canUse(this)
		&& this.selectedAbility.type.canUseOn(this, tileIndex);
};



// MANA_COST:
// ************************************************************************************************
PlayerCharacter.prototype.manaCost = function (ability) {
	return ability.type.mana - this.manaConservation;
};

// ZAP:
// ************************************************************************************************
PlayerCharacter.prototype.zap = function (tileIndex) {
	var abilityType = this.selectedAbility.type;
	
	// Use Error:
	if (abilityType.getUseError(this)) {
		gs.stateManager.popState();
	}
	else if (!abilityType.useImmediately && abilityType.range && util.distance(this.tileIndex, tileIndex) > abilityType.range) {
		this.popUpText('Out of Range', 'Red');
		gs.stateManager.popState();
	} 
	else {
		if (!gs.debugProperties.disableMana) {
			let rootAbility = this.selectedAbility;	
			if (this.selectedAbility.type.isNotRoot) {
				rootAbility = this.abilities.list.find(e => e.type.name === this.selectedAbility.type.name);
			}
			
			// Use Mana:
			if (abilityType.mana && abilityType.useMana) {
				this.currentMp -= this.manaCost(rootAbility);
			}
			
			// Use Speed Points:
			if (abilityType.speedPoints) {
				this.currentSp -= abilityType.speedPoints;
			}
			
			// Use Hit Points:
			if (abilityType.hitPointCost) {
				this.takeDamage(abilityType.hitPointCost, 'None', {killer: 'Cannibalise', neverCrit: true});
			}
			
			// Set cooldown:
			if (abilityType.attributes && abilityType.attributes.coolDown) {
				let coolDown = abilityType.attributes.coolDown.value(this);
				
				rootAbility.firstTurn = true;
				rootAbility.coolDown = coolDown;
			}
		}
		
		// Removing Storm Arrow:
		this.statusEffects.remove('StormShot');
		this.statusEffects.remove('FireStorm');
		this.statusEffects.remove('Vanish');
		
		// Use Ability:
		abilityType.useOn(this, tileIndex);

		// Change state:
		gs.stateManager.popState();
		
		// Particles:
		if (abilityType.particleColor && !abilityType.noParticlePoof) {
			gs.createParticlePoof(this.tileIndex, abilityType.particleColor);
		}
		
		if (!abilityType.dontEndTurn) {
			this.endTurn(ACTION_TIME);
		}
		
		// Consumables (wands and scrolls):
		if (this.selectedItem && !gs.debugProperties.disableMana) {
			// Charged wands:
			if (this.selectedItem.type.coolDown) {
				this.selectedItem.chargeTimer = this.selectedItem.getModdedStat('coolDown');
			}
			// Charges:
			else if (this.selectedItem.getModdedStat('maxCharges')) {
				this.selectedItem.charges -= 1;

				if (this.selectedItem.charges === 0) {
					this.inventory.removeItem(this.selectedItem);
				}
			}
			// Scrolls:
			else if (!abilityType.itemType.stats || !abilityType.itemType.coolDown) {
				this.inventory.removeItem(this.selectedItem);
			}
		}
		
		
	}

	if (this.particleGenerator) {
		this.particleGenerator.isAlive = false;
	}

	this.selectedItem = null;
};

// CAN_INTERACT:
// ************************************************************************************************
PlayerCharacter.prototype.canInteract = function (tileIndex) {
	return gs.isInBounds(tileIndex)
		&& gs.getObj(tileIndex, obj => obj.canInteract(this));
};

// INTERACT:
// ************************************************************************************************
PlayerCharacter.prototype.interact = function (tileIndex) {
	this.keyboardMoveLock = true;
	
	// End Turn (except zonelines and portals):
	if (!gs.getObj(tileIndex, obj => obj.isZoneLine() || obj.type.name === 'Portal')) {
		this.endTurn(ACTION_TIME);
	}
	
	gs.getObj(tileIndex).interact(this);
	
	
};

// CLICK_ZONE_LINE:
// ************************************************************************************************
PlayerCharacter.prototype.clickZoneLine = function (tileIndex) {
	let zoneLine = gs.getObj(tileIndex);
	
	if (zoneLine && zoneLine.type.oneWay) {
		let dialog;
	
		// Setup Dialog:
		dialog = [{}];
		dialog[0].text = 'These stairs are one way. Really descend?';
		dialog[0].responses = [
			{text: 'Yes', nextLine: 'exit', func: this.startUsingZoneLine.bind(this)},
			{text: 'No', nextLine: 'exit', keys: ['escape']},
		];
		
		// Push Dialog:
		gs.messageQueue.pushMessage(dialog);
	}
	else {
		this.startUsingZoneLine();
	}
};

// START_USING_ZONE_LINE:
// Call this function when the player tries to use a zone line.
// This will end his turn so that enemies have a chance to hit him.
// He will then automatically use the zone line on his next turn as long as he is still able.
// ************************************************************************************************
PlayerCharacter.prototype.startUsingZoneLine = function () {
	// Immobile:
	if (this.isImmobile) {
		this.popUpText('Immobile!');
		return;
	}
	
	// Using stairs will end the players turn
	// This gives enemies a single turn to attack the player and prevents stair dancing exploits
	this.usingZoneLine = true;
	this.endTurn(ACTION_TIME);
};

// USE_ZONE_LINE:
// ************************************************************************************************
PlayerCharacter.prototype.useZoneLine = function (zoneLine = null) {
	if (gs.activeCharacter() !== this || !gs.stateManager.isCurrentState('GameState')) {
		return;
	}
	
	if (game.camera.inTransition || game.camera.onFlashComplete.getNumListeners() > 0 || game.camera.onFadeComplete.getNumListeners() > 0) {
		return;
	}
	
	this.usingZoneLine = false;
	
	// Pit:
	if (gs.isPit(this.tileIndex)) {
		this.descendPit();
		return;
	}
	
	zoneLine = zoneLine || gs.getObj(this.tileIndex);
	
	// Sealed zone line:
	if (zoneLine.isSealed) {
		this.popUpText('Sealed');
		return;
	}
	
	// Immobile:
	if (this.isImmobile) {
		this.popUpText('Immobile!');
		return;
	}
	
	// onFadeComplete Function:
	let func = function () {
		gs.zoneTo(zoneLine);
		game.camera.flash('#ffffff', ZONE_FADE_TIME * 2);
		game.camera.onFlashComplete.addOnce(function () {
			// We need to add this event even though it does nothing in itself.
			// Above where we check for numListeners on flashComplete we will stop player from zoning again until he has completed the flash
		}, this);
	};
	
	// Clear all existing FX:
	game.camera.resetFX();
	
	game.camera.fade('#000000', ZONE_FADE_TIME);
	game.camera.onFadeComplete.addOnce(func, this);
	gs.stateManager.pushState('ZoningState');
};

// DESCEND_PIT:
// With levitation:
// ************************************************************************************************
PlayerCharacter.prototype.descendPit = function () {	
	if (gs.nextLevel()) {
		let pullNPCList = gs.getPullAllyList();
		
		let func = function () {
			gs.descendLevel();
			
			// Place player at random location with a clear path to stairs:
			this.randomTeleport(gs.getUpStairsTileIndex());
			
			gs.placePulledNPCs(pullNPCList);
			
			gs.onEnterNewLevel();
			
			game.camera.flash('#ffffff', ZONE_FADE_TIME * 2);
			game.camera.onFlashComplete.addOnce(function () {
				// We need to add this event even though it does nothing in itself.
				// Above where we check for numListeners on flashComplete we will stop player from zoning again until he has completed the flash
			}, this);	
		};
		
		// Clear all existing FX:
		game.camera.resetFX();

		game.camera.fade('#000000', ZONE_FADE_TIME);
		game.camera.onFadeComplete.addOnce(func, this);
		gs.stateManager.pushState('ZoningState');
	}
	else {
		this.popUpText('Bottemless Pit!');
	}
	
};

// FALL_DOWN_PIT:
// ************************************************************************************************
PlayerCharacter.prototype.fallDownPit = function () {
	var pullNPCList;
	
	// Falling down:
	if (gs.nextLevel()) {
		pullNPCList = gs.getPullAllyList();
		
		gs.descendLevel();
		
		// Use Portals:
		let usePortals = true;
		if (gs.zoneLevel === 5 && util.inArray(gs.zoneName, ['TheCrypt', 'TheIronForge', 'TheArcaneTower', 'TheSewers', 'TheCore', 'TheIceCaves'])) {
			usePortals = false;
		}
	
		// Place player at random location with a clear path to stairs:
		this.randomTeleport(gs.getUpStairsTileIndex(), usePortals);
		
		gs.pc.popUpText('Fell down pit!');
		gs.createParticlePoof(gs.pc.tileIndex, 'WHITE');
		
		// Take Damage:
		gs.pc.takeDamage(Math.floor(gs.pc.currentHp / 2), 'None', {neverCrit: true, noDiscord: true});
		
		gs.placePulledNPCs(pullNPCList);
		
		gs.pc.stopExploring();
		
		gs.onEnterNewLevel();
	}
	// Death:
	else {
		gs.pc.death(null, {killer: 'Pit'});
	}
};

// ON_EQUIP_ITEM:
// ************************************************************************************************
PlayerCharacter.prototype.onEquipItem = function (item) {
	
	// Nudist Achievement:
	if (util.inArray(item.type.slot, [ITEM_SLOT.BODY, ITEM_SLOT.HEAD, ITEM_SLOT.HANDS, ITEM_SLOT.FEET])) {
		this.isNudist = false;
	}

	gs.HUD.miniMap.refresh(); // Helm of telepathy
	this.statusEffects.onChangeEquipment();
	this.updateTerrainEffects();
};

// ON_UNEQUIP_ITEM:
// ************************************************************************************************
PlayerCharacter.prototype.onUnequipItem = function (item) {

	gs.HUD.miniMap.refresh(); // Helm of telepathy
	this.statusEffects.onChangeEquipment();
	this.updateTerrainEffects();
};

// CONSUMABLE_SLOT_CLICKED:
// ************************************************************************************************
PlayerCharacter.prototype.consumableSlotClicked = function (slot) {
	var item = slot.item,
		itemType = slot.item.type;
	
	if (!this.isReadyForInput()) {
		return;
	}
	
	// Block mummy eating:
	if (this.race.name === 'Mummy' && itemType.edible) {
		this.popUpText('Cannot Eat');	
		return;
	}
	
	// Block uncharged devices:
	if (slot.item.chargeTimer > 0 && !gs.debugProperties.disableMana) {
		this.popUpText('Not Ready!');
		return;
	}
	
	// Cancel use ability:
	if (gs.stateManager.isCurrentState('UseAbility')) {
		gs.pc.cancelUseAbility();
		return;		
	}
	
	// Sound:
	gs.playSound(itemType.sound, this.tileIndex);
	
	if (!gs.debugProperties.disableMana) {
		// Cooldown:
		if (itemType.coolDown && itemType.useEffect && itemType.useEffect.useImmediately) {
			slot.item.chargeTimer = slot.item.getModdedStat('coolDown');
		}
		// Charges:
		else if (slot.item.getModdedStat('maxCharges') && itemType.useEffect.useImmediately) {
			slot.item.charges -= 1;
			
			if (slot.item.charges === 0) {
				slot.removeItem(1);
			}
		}
		// Remove consumable (not charges)
		// Testing for UseAbility state so that targetable scrolls can be canceled
		else if (!slot.item.type.coolDown && (itemType.statusEffectName || itemType.useEffect.useImmediately) && !gs.stateManager.isCurrentState('UseAbility') && !util.inArray(itemType.name, ['ScrollOfEnchantment', 'ScrollOfAcquirement', 'PotionOfAmnesia'])) {
			slot.removeItem(1);
		}
	}
	
		
	// Effect happens immediately:
	if (itemType.useEffect && itemType.useEffect.useImmediately) {
		itemType.useEffect.useOn(this, null, item);
		
		// Removing Storm Arrow:
		this.statusEffects.remove('StormShot');
		this.statusEffects.remove('FireStorm');
		this.statusEffects.remove('Vanish');
		
		if (!itemType.useEffect.dontEndTurn) {
			this.endTurn(ACTION_TIME);
		}
	}
	// Status Effect:
	else if (itemType.statusEffectName) {
		this.statusEffects.add(itemType.statusEffectName);
		
		// Removing Storm Arrow:
		this.statusEffects.remove('StormShot');
		this.statusEffects.remove('FireStorm');
		this.statusEffects.remove('Vanish');
		
		this.endTurn(ACTION_TIME);
	}
	// Ability:
	else {
		this.selectedAbility = {type: itemType.useEffect};
		this.selectedItem = slot.item;

		gs.stateManager.pushState('UseAbility');

		gs.playSound(gs.sounds.spell, gs.pc.tileIndex);
		
		// Popup Text:
		this.popUpText(gs.capitalSplit(this.selectedAbility.type.name));

		// Particle Generator:
		if (this.particleGenerator) {
			this.particleGenerator.isAlive = false;
		}

		if (this.selectedAbility.type.particleColor) {
			this.particleGenerator = gs.createCastingParticle(this.tileIndex, this.selectedAbility.type.particleColor);
		}
	}	
	
	// Update stats:
	this.updateStats();
};

// CANCEL_USE_ABILITY:
// ************************************************************************************************
PlayerCharacter.prototype.cancelUseAbility = function () {
	gs.stateManager.popState();
	
	this.selectedScroll = null;
	this.selectedAbility = null;
	this.selectedItem = null;
	
	gs.playSound(gs.sounds.scroll, this.tileIndex);

	if (this.particleGenerator) {
		this.particleGenerator.isAlive = false;
	}
};

// WAIT_CLICKED:
// ************************************************************************************************
PlayerCharacter.prototype.waitClicked = function () {
	// Rest:
	if (input.keys.SHIFT.isDown) {
		this.rest();
	}
	// Wait:
	else {
		this.actionQueue = [{type: 'WAIT'}];
		this.popUpText('WAIT');
	}
};

// REST:
// Rest until either HP or EP is full (whichever takes less time)
// ************************************************************************************************
PlayerCharacter.prototype.rest = function () {
	let minTurns, restMsg;
	
	if (gs.isNearbyDanger()) {
		this.popUpText('Nearby Danger!', 'Red');
		return;
	}
	
	if (gs.isPit(this.tileIndex)) {
		this.popUpText('Over Pit!', 'Red');
		return;
	}
	
	// Rest until recovery:
	if ((this.currentHp < this.maxHp && !util.inArray(this.race.name, ['Gargoyle', 'Vampire'])) || this.currentMp < this.maxMp) {
		let turnsToMaxHp = Math.ceil(this.hpRegenTime * (this.maxHp - this.currentHp + 1) / this.hpRegenAmount),
			turnsToMaxMp = this.mpRegenTime * (this.maxMp - this.currentMp);
	
		// Rest to full MP:
		if (this.currentHp === this.maxHp || util.inArray(this.race.name, ['Gargoyle', 'Vampire'])) {
			minTurns = turnsToMaxMp;
			
		}
		// Rest to full HP:
		else if (this.currentMp === this.maxMp) {
			minTurns = turnsToMaxHp;
		}
		// Rest to whichever is lowest:
		else {
			if (turnsToMaxHp > 0 && turnsToMaxHp < turnsToMaxMp) {
				minTurns = turnsToMaxHp;
			}
			else {
				minTurns = turnsToMaxMp;
			}
		}
	}
	// Rest 10 turns:
	else {
		minTurns = 10;
		restMsg = '10 Turns';
	}
	
		
	this.actionQueue = [];
	for (let i = 0; i < minTurns; i += 1) {
		this.actionQueue.push({type: 'WAIT'});
	}
	
	this.popUpText('REST');
	
	if (restMsg) {
		this.popUpText(restMsg);
	}
};

// GAIN_EXPERIENCE:
// ************************************************************************************************
PlayerCharacter.prototype.gainExperience = function (amount) {
	if (!this.isAlive) {
		return;
	}
	
	// Apply exp modifiers:
	amount = Math.floor(amount * this.expMod);

	if (isNaN(amount)) {
		throw 'gainExperience NaN';
	}

	// Increase experience:
	if (this.level < PC_MAX_LEVEL) {
		this.exp += amount;
	}

	// Check for level up:
	while (this.exp >= gs.expPerLevel[this.level + 1]) {
		this.gainLevel();
	}
};

// LOSE_EXP:
// ************************************************************************************************
PlayerCharacter.prototype.loseExp = function (amount) {
	if (this.exp - amount < gs.expPerLevel[this.level]) {
		this.exp = gs.expPerLevel[this.level];
	} else {
		this.exp -= amount;
	}
};

// GO_TO_SLEEP:
// ************************************************************************************************
PlayerCharacter.prototype.goToSleep = function () {

};

// ON_START_TURN:
// Called when the character starts their turn
// ************************************************************************************************
PlayerCharacter.prototype.onStartTurn = function () {
	// Achievements:
	if (this.numKills >= 10) {
		achievements.get('STRIKE');
	}
	this.numKills = 0;
	
	this.isAgroed = true;
	this.isMultiMoving = false;
	this.isQuickMoving = false;
	
	
	// Have we encountered a new enemy:
	if (this.lastNumVisibleMonsters < gs.numVisibleMonsters()) {
		this.keyboardMoveLock = true;
	}
	this.lastNumVisibleMonsters = gs.numVisibleMonsters();
	
	gs.HUD.miniMap.refresh();
	
	this.previousTileIndex = {x: this.tileIndex.x, y: this.tileIndex.y};
	
	// Stop all movement, exploration and travel if we have agroed enemies:
	if (gs.isNearbyDanger()) {
		this.stopExploring();
	}
	
	this.statusEffects.onStartTurn();
	
	// The player has just started his turn so we set hasNPCActed to false
	// If an npc acts in between then we stop the player from moving
	gs.hasNPCActed = false;
	
	// Open level up dialog:
	if (this.levelUpDialog) {
		this.openLevelUpDialog();
	}
	
	// Shield of Ice:
	if (this.talents.getTalentRank('ShieldOfIce') > 0) {
		if (this.shieldOfIceTimer > 0) {
			this.shieldOfIceTimer -= 1;
		}
		
		if (!this.statusEffects.has('ShieldOfIce') && this.shieldOfIceTimer === 0) {
			this.statusEffects.add('ShieldOfIce');
		}
		
	} 
};

// NON_MAX_ATTRIBUTE_LIST:
// ************************************************************************************************
PlayerCharacter.prototype.nonMaxAttributeList = function () {
	let attributeList = [];
	
	ATTRIBUTE_LIST.forEach(function (attributeName) {
		let val = this.baseAttributes[attributeName];
		val += gs.classAttributes[this.characterClass][attributeName];
		val += this.race.attributes[attributeName];
		
		if (val < this.maxAttributes[attributeName]) {
			attributeList.push(attributeName);
		}
		
	}, this);
	
	return attributeList;
};

// GAIN_LEVEL:
// ************************************************************************************************
PlayerCharacter.prototype.gainLevel = function () {
	if (!this.isAlive) {
		return;
	}
	
	let choiceAttributePoints = 0;
	let choiceTalentPoints = 0;
	let randAttributePoint = null;
	
	// Pop Up Text:
	this.popUpText('LEVEL UP',  'Yellow');
	
	// Sound:
	gs.playSound(gs.sounds.levelUp, this.tileIndex);

	// Effect:
	gs.createEXPEffect(this.tileIndex);
	
	// Gain level:
	this.level += 1;
		
	// Attribute point on even levels:
	if (this.level % 2 === 0) {
		choiceAttributePoints = 1;
		this.attributePoints += 1;
	}
	
	// Talent points on odd levels:
	if (this.level % 2 === 1) {
		choiceTalentPoints = 1;
		this.talentPoints += 1;
	}
	
	// Gnome extra talents:
	if (this.race.name === 'Gnome' && util.inArray(this.level, [4, 8, 12, 16])) {
		choiceTalentPoints = 1;
		this.talentPoints += 1;
	}
	
	
	
	this.updateStats();

	// Restore HP and EP to full:
	this.currentHp = this.maxHp;
	this.currentMp = this.maxMp;
	this.currentSp = this.maxSp;
	this.cure();
	this.mentalCure();
	this.resetAllCoolDowns();
	
	// Update Berserk and Shield Wall:
	this.updateBerserk();
	this.updateShieldWall();
	
	// Data to open the levelUp dialog next time its the players turn:
	this.levelUpDialog = {
		choiceTalentPoints: choiceTalentPoints,
		choiceAttributePoints: choiceAttributePoints,
		randAttributePoint: randAttributePoint,
	};
	
	if (!gs.pc.statusEffects.has('ShieldsUp')) {
		this.openLevelUpDialog();
	}
};

// OPEN_LEVEL_UP_DIALOG:
// ************************************************************************************************
PlayerCharacter.prototype.openLevelUpDialog = function () {
	// Grabbing data from levelUpDialog:
	let choiceTalentPoints = this.levelUpDialog.choiceTalentPoints;
	let choiceAttributePoints = this.levelUpDialog.choiceAttributePoints;
	let randAttributePoint = this.levelUpDialog.randAttributePoint;
	this.levelUpDialog = null;
	
	// We skip if we have killed Yendor-3
	// Prevents the level-up dialog from interfering with the win game dialog
	if (gs.zoneName === 'TheVaultOfYendor' && gs.zoneLevel === 5 && gs.pc.inventory.hasItemType(gs.itemTypes.GobletOfYendor) && !gs.characterList.find(npc => npc.type.niceName === 'The Wizard Yendor' && npc.yendorVersion === 3 && npc.isAlive)) {
		return;
	}
	
	let dialog = [{}];
	dialog[0].text = 'You have reached level: ' + this.level + '\n\n';
	
	if (choiceTalentPoints === 1) {
		dialog[0].text += '+1 talent point.\n';
	}
	else if (choiceTalentPoints === 2) {
		dialog[0].text += '+2 talent points.\n';
	}
	
	if (choiceAttributePoints === 1) {
		dialog[0].text += '+1 attribute point.\n';
	}
	else if (choiceAttributePoints === 2) {
		dialog[0].text += '+2 attribute points.\n';
	}
	
	if (gs.pc.race.name === 'Fairy' && gs.pc.level % 2 === 1) {
		dialog[0].text += 'Enchant an item.';
	}
	
	if (randAttributePoint) {
		dialog[0].text += '+1 ' + randAttributePoint + '\n';
	}
	
	let func = function () {
		// Fairies get enchantment on odd levels:
		if (gs.pc.race.name === 'Fairy' && gs.pc.level % 2 === 1) {
			gs.pc.levelUpEnchant = true;
			gs.stateManager.pushState('EnchantmentMenu');
		}
	};
	
	dialog[0].responses = [
		{text: 'ok', nextLine: 'exit', func: func, keys: ['accept', 'escape']}
	];
	
	gs.messageQueue.pushMessage(dialog);
};

// AGRO_PLAYER:
// Called when a character is confused so must handle for player
// ************************************************************************************************
PlayerCharacter.prototype.agroPlayer = function () {
	
};

// CLEAR_AGRO:
// ************************************************************************************************
PlayerCharacter.prototype.clearAgro = function () {
	for (let i = 0; i < gs.liveCharacterList().length; i += 1) {
		if (gs.characterList[i].isAgroed && !gs.characterList[i].isDamageImmune && gs.characterList[i].faction === FACTION.HOSTILE) {
			gs.characterList[i].isAgroed = false;
		}
	}
};

// ON_TAKE_DAMAGE:
// ************************************************************************************************
PlayerCharacter.prototype.onTakeDamage = function () {
	gs.hasNPCActed = true;
	
	// Shield-Wall and Berserk:
	this.updateShieldWall();
	this.updateBerserk();
	
	// Stopping multi-move when taking damage:
	if (this.actionQueue.length > 0 && !this.statusEffects.has('Charge') && !this.statusEffects.has('DashAttack')) {
		this.actionQueue = [];
	}
	
	if (this.isAsleep) {
		this.isAsleep = false;
	}
};

// UPDATE_SHIELD_WALL:
// ************************************************************************************************
PlayerCharacter.prototype.updateShieldWall = function () {
	let hpPercent;
	
	// No Shield Wall:
	if (this.talents.getTalentRank('ShieldWall') === 0) {
		return;
	}
	else {
		hpPercent = gs.talents.ShieldWall.attributes.hpPercent[this.talents.getTalentRank('ShieldWall')];
	}
	
	// Gain Shield Wall:
	if (this.currentHp <= this.maxHp * hpPercent && !this.statusEffects.has('ShieldWall')) {
		this.statusEffects.add('ShieldWall');
	}

	// Lose Shield Wall:
	if (this.currentHp > this.maxHp * hpPercent && this.statusEffects.has('ShieldWall')) {
		this.statusEffects.remove('ShieldWall');
	}
};

// UPDATE_BERSERK:
// ************************************************************************************************
PlayerCharacter.prototype.updateBerserk = function () {
	let hpPercent;
	
	// No berserk:
	if (this.talents.getTalentRank('Berserk') === 0) {
		return;
	}
	else {
		hpPercent = gs.talents.Berserk.attributes.hpPercent[this.talents.getTalentRank('Berserk')];
	}
	
	// Gain Beserk:
	if (this.currentHp <= this.maxHp * hpPercent && !this.statusEffects.has('Berserk')) {
		this.statusEffects.add('Berserk');
	}

	// Lose Berserk:
	if (this.currentHp > this.maxHp * hpPercent && this.statusEffects.has('Berserk')) {
		this.statusEffects.remove('Berserk');
	}
};

// DEATH:
// ************************************************************************************************
PlayerCharacter.prototype.death = function (damageType, flags) {
	// Avoid killing the player twice in a single turn:
	if (!this.isAlive) {
		return;
	}
	
	
	
	// Burning self to death:
	if (damageType === DAMAGE_TYPE.FIRE && flags.killer === this) {
		gs.deathText = 'burned himself to death';
		achievements.get('WENT_UP_IN_FLAMES');
	}
	// Shock self to death:
	else if (damageType === DAMAGE_TYPE.SHOCK && flags.killer === this) {
		gs.deathText = 'shocked himself to death';
		achievements.get('A_SHOCKING_CONCLUSION');
	}
	// Fire Shroom:
	else if (flags.killer === 'FireShroom') {
		gs.deathText = 'was burned to death by a fire shroom';
	}
	//Fire Glyph:
	else if (flags.killer === 'FireGlyph') {
		gs.deathText = 'was burned to death by an exploding fire glyph';
	}
	// Spike Trap:
	else if (flags.killer === 'SpikeTrap') {
		gs.deathText = 'was impaled by spikes';
	}
	// Bear Trap:
	else if (flags.killer === 'BearTrap') {
		gs.deathText = 'was killed by a bear trap';
	}
	// Killed Self:
	else if (flags.killer === 'Lava') {
		gs.deathText = 'was burned to death in a pool of lava';
	}
	// Gas:
	else if (flags.killer === 'Gas') {
		gs.deathText = 'suffocated to death in toxic gas';	
	} 
	// Killed self:
	else if (flags.killer === this) {
		gs.deathText = 'killed himself';
	}
	// Unique Killer:
	else if (flags.killer && flags.killer.type && flags.killer.type.isBoss) {
		gs.deathText = 'was killed by ' + flags.killer.type.niceName;
	}
	// Killer:
	else if (flags.killer && flags.killer.type) {
		gs.deathText = 'was killed by a ' + flags.killer.type.niceName;
	}
	// Pit:
	else if (flags.killer && flags.killer === 'Pit') {
		gs.deathText = 'fell to his death.';
	}
	// Generic:
	else {
		gs.deathText = 'was killed';
	}

	this.isAlive = false;
	this.currentHp = 0;
	this.poisonDamage = 0;
	
	this.updateUIFrame();
	
	// Life Saving:
	if (this.hasLifeSaving) {
		gs.createHealingEffect(gs.pc.tileIndex);
		gs.playSound(gs.sounds.cure);
		gs.openLifeSavingMenu();
	}
	// Actual death (clear save):
	else {
		if (!gs.debugProperties.allowRespawn) {
			gs.logGameRecord(gs.deathText, false);
			gs.clearGameData();
		}
		
		gs.openDeathMenu();
	}
	
	

};

// GAIN_RAGE:
// ************************************************************************************************
PlayerCharacter.prototype.gainRage = function (amount) {
	if (this.rage < this.maxRage) {
		this.rage += amount;
		this.rageTimer = 0;
	}
};

// GAIN_SPEED:
// ************************************************************************************************
PlayerCharacter.prototype.gainSpeed = function (amount) {
	this.currentSp += amount;
	this.currentSp = Math.min(this.maxSp, this.currentSp);
};

// GAIN_FOOD:
// ************************************************************************************************
PlayerCharacter.prototype.gainFood = function (amount) {
	this.currentFood += 1;
	this.currentFood = Math.min(this.maxFood, this.currentFood);
};

// ON_KILL:
// ************************************************************************************************
PlayerCharacter.prototype.onKill = function (character) {
	
	// Life Tap:
	if (this.lifeTap > 0 && character.faction === FACTION.HOSTILE && !character.type.immunities.lifeTap) {
		let amount = this.lifeTap;
		
		if (amount > this.maxHp - this.currentHp) {
			amount = this.maxHp - this.currentHp;
		}
		
		if (amount > 0) {
			this.healHp(amount);
			this.popUpText('+' + amount + 'HP', 'Green');
		}
	}
	
	// Mana Tap:
	if (this.manaTap > 0 && character.faction === FACTION.HOSTILE && !character.type.immunities.lifeTap) {
		let amount = this.manaTap;
		
		if (amount > this.maxMp - this.currentMp) {
			amount = this.maxMp - this.currentMp;
		}
		
		if (amount > 0) {
			this.restoreMp(amount);
			this.popUpText('+' + amount + 'MP', 'Purple');
		}
	}
	
	this.statusEffects.onKill();
};

// EXP_PERCENT:
// ************************************************************************************************
PlayerCharacter.prototype.expPercent = function () {
	var expToLevel = this.exp - gs.expPerLevel[this.level],
		totalExpToLevel = gs.expPerLevel[this.level + 1] - gs.expPerLevel[this.level];
	return Math.floor(expToLevel / totalExpToLevel * 100);

};



// GAIN_ATTRIBUTE:
// ************************************************************************************************
PlayerCharacter.prototype.gainAttribute = function (attributeName, amount = 1) {
	
	this.baseAttributes[attributeName] += amount;
	this.updateStats();

	if (attributeName === 'strength') {
		this.currentHp += amount * PC_HP_PER_STR[this.race.name];
	}

	if (attributeName === 'dexterity') {
		this.currentSp += amount * PC_MAX_MOVEMENT_POINTS_PER_DEX;
	}

	if (attributeName === 'intelligence') {
		this.currentMp += amount * PC_MAX_MP_PER_INT;
	}

	this.updateStats();
};

// ADD_ABILITY:
// ************************************************************************************************
PlayerCharacter.prototype.addAbility = function (ability) {
	var abilitySlot;
	
	// Add ability to abilities:
	abilitySlot = this.abilities.addAbility(ability);
			
	// Add ability to UI:
	gs.HUD.abilityBar.addAbility(abilitySlot);
};

// REMOVE_ABILITY:
// ************************************************************************************************
PlayerCharacter.prototype.removeAbility = function (ability) {
	var abilitySlot;
	
	abilitySlot = this.abilities.removeAbility(ability);
	
	gs.HUD.abilityBar.removeAbility(abilitySlot);
};

// SET_RELIGION:
// ************************************************************************************************
PlayerCharacter.prototype.setReligion = function (religionName) {
	if (!gs.religionTypes[religionName]) {
		throw 'Invalid religionName: ' + religionName;
	}

	this.religion = religionName;
	
	if (gs.religionTypes[this.religion].onSet) {
		gs.religionTypes[this.religion].onSet(this);
	}
};

// RANDOM_TELEPORT:
// Use this function to randomly teleport the player to a random open tileIndex in the level
// Will 'flood' the map starting at fromTileIndex to find a tileIndex that has a clear path
// This will stop the player from teleporting behind closed doors
// ************************************************************************************************
PlayerCharacter.prototype.randomTeleport = function (fromTileIndex, usePortals = true) {
	fromTileIndex = fromTileIndex || this.tileIndex;
	
	// Don't use portals in Yendor boss levels
	if (gs.zoneName === 'TheVaultOfYendor' && gs.zoneLevel === 5) {
		usePortals = false;
	}
	
	// Get index in flood:
	// We want to flood the map passing through open tiles and doors to guarantee a walkable path to fromTileIndex
	let indexList = gs.getIndexListInFlood(fromTileIndex, function (tileIndex) {
		return gs.isStaticPassable(tileIndex)
			|| gs.getObj(tileIndex, obj => obj.isSimpleDoor());
	}, 1000, true, usePortals);
	
	// Filter open tiles:
	indexList = indexList.filter(index => gs.isIndexOpen(index));
	
	// Filter trigger tiles
	indexList = indexList.filter(index => !gs.getTile(index).floorTrigger);
	
	// Filter away from gas traps:
	indexList = indexList.filter(index => !gs.isNearGasVent(index));
	
	// Filter dangerous clouds:
	indexList = indexList.filter(index => !gs.getCloud(index));
	
	if (indexList.length > 0) {
		let distanceList = indexList.filter(index => util.distance(index, this.tileIndex) >= MIN_TELEPORT_DISTANCE);
		
		// Valid index that is 'far' away from current tileIndex:
		if (distanceList.length > 0) {
			this.teleportTo(util.randElem(distanceList));
		}
		// No valid index that is 'far' enough away:
		else {
			this.teleportTo(util.randElem(indexList));
		}
	}
	// No valid index to teleport to:
	else {
		this.teleportTo(fromTileIndex);
	}
};

// TELEPORT_TO:
// Use this function to teleport the player to a specified tileIndex
// ************************************************************************************************
PlayerCharacter.prototype.teleportTo = function (tileIndex) {
	// We don't stop movement if we're just traveling between zones:
	if (!this.isTravelling) {
		this.stopExploring();
	}
	
	
	
	this.previousTileIndex = {x: tileIndex.x, y: tileIndex.y};
	this.body.snapToTileIndex(tileIndex);
	
	gs.focusCameraOnPC();
	gs.calculateLoS(true);
	
	
	
	
	gs.HUD.miniMap.refresh();
	
	if (this.gotoLevelQueue.length === 0) {
		this.stopExploring();
	}
	
	this.statusEffects.onTeleport();
};



// GET_ACTIVE_SUMMON_LIST:
// Returns a list of characters that were summoned by the player and are present on the current level
// ************************************************************************************************
PlayerCharacter.prototype.getActiveSummonList = function () {
	return this.summonIDList.filter(id => gs.getCharWithID(id)).map(id => gs.getCharWithID(id));
};

// CORRODE_WEAPON:
// Will corrode the players weapon (subtract 1 mod)
// ************************************************************************************************
PlayerCharacter.prototype.corrodeWeapon = function () {
	if (this.inventory.getPrimaryWeapon().type.name !== 'Fists' && this.inventory.getPrimaryWeapon().type.name !== 'Staff' && this.inventory.getPrimaryWeapon().mod > 0) {
		this.inventory.getPrimaryWeapon().mod -= 1;
		this.popUpText('Corroded ' + gs.capitalSplit(this.inventory.getPrimaryWeapon().type.name), 'Red');
	}
};

// END_TURN:
// ************************************************************************************************
PlayerCharacter.prototype.endTurn = function (waitTime) {
	// Levitation pop-ups:
	if (this.isFlying && gs.isPit(this.tileIndex)) {
		this.popUpText(10 - this.levitationTimer);
	}
	
	// Drink Blood:
	if (this.race.name === 'Vampire' && gs.getTile(this.tileIndex).type.name === 'Blood' && this.currentHp < this.maxHp) {
		this.consumeBlood();
	}
	
	this.statusEffects.onEndTurn();
	this.waitTime = waitTime;
	gs.endTurn();
};




// GET_DESC:
// ************************************************************************************************
PlayerCharacter.prototype.getDesc = function () {
	var desc = {title: '', text: ''};
	
	desc.title += 'Player';
	desc.text += '*Click yourself to wait a turn.\n';
	desc.text += '*Shift + click yourself to rest until full HP or full MP.';
	
	return desc;
};

// DISCOVER_ZONE:
// ************************************************************************************************
PlayerCharacter.prototype.discoverZone = function (zoneName, zoneLevel) {

	if (!this.discoveredZoneList.find(e => e.zoneName === zoneName && e.zoneLevel === zoneLevel)) {
		this.discoveredZoneList.push({
			zoneName: zoneName,
			zoneLevel: zoneLevel,
			features: [],
		});
	}
};

// ADD_DISCOVERED_ZONE_FEATURE:
// ************************************************************************************************
PlayerCharacter.prototype.addDiscoveredZoneFeature = function (feature) {
	this.discoveredZoneList.find(e => e.zoneName === gs.zoneName && e.zoneLevel === gs.zoneLevel).features.push(feature);
};

// REMOVE_DISCOVERED_ZONE_FEATURE:
// ************************************************************************************************
PlayerCharacter.prototype.removeDiscoveredZoneFeature = function (feature) {
	util.removeFromArray(feature, this.discoveredZoneList.find(e => e.zoneName === gs.zoneName && e.zoneLevel === gs.zoneLevel).features);
};

// GET_SPRITE_FRAME:
// ************************************************************************************************
PlayerCharacter.prototype.getSpriteFrame = function () {
	if (PLAYER_RACE_FRAMES[this.race.name]) {
		return PLAYER_RACE_FRAMES[this.race.name][this.characterClass];
	}
	else {
		return PLAYER_FRAMES[this.characterClass];
	}
};

// GET_ATTRIBUTE_DESC: 
// ************************************************************************************************
PlayerCharacter.prototype.getAttributeDesc = function (attributeName) {
	let str = '';
	
	if (attributeName === 'strength') {
		str += '*Hit Points: +' + PC_HP_PER_STR[this.race.name] + '\n';
		str += '*Melee Damage: +1\n';
		str += '*Encumberance: +1\n';
		
	}
	else if (attributeName === 'dexterity') {
		str += '*Speed Points: +1\n';
		str += '*Range Damage: +1\n';
		str += '*Evasion: +' + util.toPercentStr(PC_EVASION_PER_DEX[this.race.name]) + '\n';
	}
	else if (attributeName === 'intelligence') {
		str += '*Mana Points: +3\n';
		str += '*Staff Damage: +1\n';
		str += '*Ability Power: +' + util.toPercentStr(PC_ABILITY_POWER_PER_INT[this.race.name]) + '\n';
		
	}
	
	return str;
};


// TO_DATA:
// ************************************************************************************************
PlayerCharacter.prototype.toData = function () {
	var data = {};
	
	// Achievement Trackers:
	data.isNudist				= this.isNudist;
	data.isUntouchable			= this.isUntouchable;

	// Current Stats:
	data.currentHp 				= this.currentHp;
	data.currentMp 				= this.currentMp;
	data.currentSp 				= this.currentSp;
	data.currentFood 			= this.currentFood;
	data.rage 					= this.rage;
	data.poisonDamage 			= this.poisonDamage;
	data.coldLevel 				= this.coldLevel;
	data.summonIDList 			= this.summonIDList;
	
	// Timers:
	data.levitationTimer		= this.levitationTimer;
	data.shieldOfIceTimer		= this.shieldOfIceTimer;
	
	// Base Stats:
	data.baseAttributes 		= this.baseAttributes;
	data.permanentHpBonus 		= this.permanentHpBonus;
	data.permanentMpBonus 		= this.permanentMpBonus;
	
	// Level and Exp:
	data.exp 					= this.exp;
	data.level 					= this.level;
	data.attributePoints 		= this.attributePoints;
	data.talentPoints 			= this.talentPoints;
	
	// Race, Class, and Religion:
	data.characterClass 		= this.characterClass;
	data.race 					= this.race.name;
	data.religion 				= this.religion;

	// Sub-Systems::
	data.inventory 				= this.inventory.toData();
	data.abilities 				= this.abilities.toData();
	data.talents 				= this.talents.toData();
	data.statusEffects 			= this.statusEffects.toData();
	data.abilityBar 			= gs.HUD.abilityBar.toData();
	
	data.discoveredZoneList		= this.discoveredZoneList;
	
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
PlayerCharacter.prototype.loadData = function (data) {
	// Achievement Trackers:
	this.isNudist				= data.isNudist;
	this.isUntouchable			= data.isUntouchable;
	
	// Current Stats:
	this.currentHp 				= data.currentHp;
	this.currentMp 				= data.currentMp;
	this.currentSp 				= data.currentSp;
	this.currentFood 			= data.currentFood;
	this.rage 					= data.rage || 0;
	this.poisonDamage 			= data.poisonDamage || 0;
	this.coldLevel 				= data.coldLevel || 0;
	this.summonIDList 			= data.summonIDList;
	
	// Timers:
	this.levitationTimer		= data.levitationTimer || 0;
	this.shieldOfIceTimer		= data.shieldOfIceTimer || 0;
	
	// Base Stats:
	this.baseAttributes 		= data.baseAttributes;
	this.permanentHpBonus 		= data.permanentHpBonus;
	this.permanentMpBonus 		= data.permanentMpBonus;
	
	// Level and Exp
	this.exp 					= data.exp;
	this.level 					= data.level;
	this.attributePoints 		= data.attributePoints;
	this.talentPoints 			= data.talentPoints;
	
	// Class, Race and Religion:
	this.characterClass 		= data.characterClass;
	this.race 					= gs.playerRaces[data.race];
	this.religion 				= data.religion;

	// Sub-Systems::
	this.inventory.loadData(data.inventory);
	this.abilities.loadData(data.abilities);
	this.talents.loadData(data.talents);
	this.statusEffects.loadData(data.statusEffects);
	gs.HUD.abilityBar.loadData(data.abilityBar);
	
	
	this.discoveredZoneList		= data.discoveredZoneList;
	
	// Setup Player:
	this.sprite.frame = this.getSpriteFrame();
	this.type.frame = this.getSpriteFrame();
	this.updateStats();
	
	
};
