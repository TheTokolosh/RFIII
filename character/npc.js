/*global game, gs, console, util, debug, achievements*/
/*global Character, ItemSlotList, StatusEffects, Item, levelController*/
/*global ASSERT_EQUAL, DAMAGE_TYPES*/
/*global TILE_SIZE, ACTION_TIME*/
/*global INVENTORY_SIZE, NPC_FLEE_HP_PERCENT, NPC_FLEE_CHANCE*/
/*global MAX_SPOT_AGRO_RANGE, SHOUT_RANGE, NPC_UNAGRO_TIME, LOS_DISTANCE, MAX_SHOUT_AGRO_RANGE*/
/*global RANDOM_MOVE_PERCENT*/
/*global FONT_NAME, DROP_GOLD_PERCENT*/
/*global HP_REGEN_TIME*/
/*global FACTION, MAX_ABILITIES, MP_REGEN_TIME*/
/*global NPC_SHOUT_TYPE, YENDOR_MAX_HP*/
/*jshint white: true, laxbreak: true, esversion: 6 */
'use strict';

// CREATE_NPC_POOL:
// ************************************************************************************************
gs.createNPCPool = function () {
	this.npcPool = [];
	for (let i = 0; i < 50; i += 1) {
		this.npcPool[i] = new NPC();
	}
	
	gs.nextCharacterID = 1;
};

// CREATE_NPC:
// Standard function for creating NPCs:
// ************************************************************************************************
gs.createNPC = function (tileIndex, typeName, flags) {
	if (gs.getChar(tileIndex)) {
		console.log('Trying to place ' + typeName + ' tileIndex is occupied by: ' + gs.getChar(tileIndex).type.name);
		return null;	
	}
	
	for (let i = 0; i < this.npcPool.length; i += 1) {
		if (!this.npcPool[i].isAlive && !util.inArray(this.npcPool[i], this.characterList)) {
			this.npcPool[i].init(tileIndex, typeName, flags);
			return this.npcPool[i];
		}
	}
	
	// Pool size exceeded:
	this.npcPool.push(new NPC());
	this.npcPool[this.npcPool.length - 1].init(tileIndex, typeName, flags);
	
	
	return this.npcPool[this.npcPool.length -1];
};

// CONSTRUCTOR:
// ************************************************************************************************
function NPC() {
	this.createSharedProperties();
	this.isAlive = false;
}
NPC.prototype = new Character();

// INIT:
// ************************************************************************************************
NPC.prototype.init = function (tileIndex, typeName, flags) {
	ASSERT_EQUAL(gs.npcTypes.hasOwnProperty(typeName), true, 'Invalid npcTypeName: ' + typeName);
	ASSERT_EQUAL(gs.getChar(tileIndex), null, 'TileIndex is already occupied');
	
	// Default Flags:
	flags = flags || {isAsleep: false, npcClassType: null, isWandering: false};
	
	// Type and name:
	this.type = gs.npcTypes[typeName];
	this.name = this.type.name;
	
	// Setting ID:
	if (flags.id) {
		this.id = flags.id;
	}
	else {
		this.id = gs.nextCharacterID;
		gs.nextCharacterID += 1;
	}
	
	// Negate Sleep:
	if (this.type.neverSleep) {
		flags.isAsleep = false;
	}
	
	// Negate Wandering:
	if (flags.isAsleep || this.type.neverWander) {
		flags.isWandering = false;
	}

	// Property Flags:
	this.isAlive = true;
	this.isAgroed = false;
	this.faction = this.type.faction;
	this.isAsleep = Boolean(flags.isAsleep);
	this.npcClassType = flags.npcClassType;
	this.isWandering = Boolean(flags.isWandering);
	this.isRunning = false;
	this.isFlying = Boolean(this.type.isFlying);
	this.burstDamage = flags.burstDamage || 0;
	this.actionQueue = [];
	this.moveDelta = {x: 0, y: 0};
	this.timeToHatch = 0;
	this.poisonDamage = 0;
	this.lightningRodTileIndex = null;

	if (typeName === 'Merchant') {
		this.hasStockedItems = false;
	}
	
	// Summon Properties:
	this.summonerId = flags.summonerId || null; 		// Summoned creatures store their owner here
	this.summonIDList = []; 							// The summoner stores all summoned creatures so they can poof upon death.
	this.summonDuration = flags.summonDuration || 20;	// The duration before a summon creature will naturally poof
	this.cloudIDList = [];
	
	// Hiding (only used for submerged enemies right now)
	this.isHidden = false;
	
	if (this.type.startHidden) {
		if (this.type.canSwim) {
			// Aquatic enemies are only hidden if they start in a liquid:
			if (gs.isUncoveredLiquid(tileIndex)) {
				this.isHidden = true;
				this.isAsleep = false;
			}		
		} 
		else {
			this.isHidden = true;
			this.isAsleep = false;
		}
		
	} 
	
	
	// AI:
	this.unagroTimer = 0;
	this.wanderVector = {x: util.randInt(-1, 1), y: util.randInt(-1, 1)};
	
	
	// Set Level and stats:
	this.level = flags.level || this.type.level;
	
	// Adjusting maxHP by level:
	if (this.type.hitPointType) {
		this.maxHp = gs.npcMaxHp(this.level, this.type);
	}
	// Unless the npcType only defines a static maxHp (typically uniques)
	else {
		this.maxHp = this.type.maxHp;
	}
	
	this.maxMp = this.type.maxMp;
	
	this.exp = this.type.exp;
	this.regenTimer = 0;

	// Elite:
	if (this.npcClassType) {
		this.exp = this.type.exp * 2;	
	}
	
	// Abilities:
	this.maxAbilityRange = 0;
	this.abilities.clear();
	if (this.type.abilityTypes) {
		this.type.abilityTypes.forEach(function (abilityType) {
			this.abilities.addAbility(abilityType);
			this.maxAbilityRange = Math.max(this.maxAbilityRange, abilityType.range(this));
		}, this);
	}
	
	
	
	// Status effects:
	this.statusEffects = new StatusEffects(this);
	
	// Event Queue:
	this.eventQueue.clear();
	
	// Pop up queue:
	this.popUpTimer = 0;
	this.popUpQueue = [];
	
	// Sprite:
	this.sprite.frame = this.type.frame;
	this.sprite.angle = 0;
	this.ringSprite.frame = 0;
	
	
	// Base Sprite:
	if (this.type.horizontalBaseFrame) {
		this.baseSprite = gs.createSprite(0, 0, 'Tileset', gs.underObjectSpritesGroup);
		this.baseSprite.anchor.setTo(0.5, 0.5);
		this.baseSprite.frame = this.type.horizontalBaseFrame;
	}
	
	// Yendor Head sprite:
	if (this.type.niceName === 'The Wizard Yendor') {
		this.baseSprite = gs.createSprite(0, 0, 'Tileset', gs.overObjectSpritesGroup);
		this.baseSprite.anchor.setTo(0.5, 1.0);
		this.baseSprite.frame = this.type.frame - 32;
	}
	
	// Light:
	if (this.type.light) {
		this.light = gs.createLightCircle(this.sprite.position, this.type.light.color, this.type.light.radius, 0, this.type.light.startAlpha);
		this.light.fade = false;
		this.light.noLife = true;
	}
	else {
		this.light = null;
	}
	
	// Push to lists:
	if (util.inArray(this, gs.characterList)) {
		console.log('In characterList');
	}
	
	gs.characterList.push(this);
	
	// Initial rotation facing:
	if (this.type.rotateAim) {
		this.rotFacing = util.randElem(['UP', 'DOWN', 'LEFT', 'RIGHT']);
		this.rotateToFace();
	}
	
	
	this.updateStats();
	this.currentHp = this.maxHp;
	this.currentMp = this.maxMp;
	
	// We may need to start dominated in case we immediately take damage (slime splitting special case):
	if (flags.startDominated) {
		this.dominate(flags.startDominated);
	}

	// Place in tileMap:
	// Do so last to guarantee that the character has fully initialized (in case it takes damage or something)
	this.body.snapToTileIndex(tileIndex);
	this.facing = util.frac() <= 0.5 ? 'RIGHT' : 'LEFT';
	this.previousTileIndex = {x: tileIndex.x, y: tileIndex.y};
	
	if (this.name === 'GobletShield') {
		gs.getTile(this.tileIndex.x - 1, this.tileIndex.y).character = this;
		gs.getTile(this.tileIndex.x + 1, this.tileIndex.y).character = this;
		this.isAgroed = true;
	}
	
	// For debugging:
	this.startTileIndex = {x: this.tileIndex.x, y: this.tileIndex.y};

};

// DESTROY:
// ************************************************************************************************
NPC.prototype.destroy = function () {	
	this.isAlive = false;
	
	this.sprite.visible = false;
	this.ringSprite.visible = false;
	this.statusText.visible = false;
	
	if (this.hpBar) {
		this.hpBar.visible = false;
		this.hpBarRed.visible = false;
	}
	else {
		this.hpText.visible = false;
	}
	
	this.statusEffects.removeAll();
	
	// Destroy Events:
	this.eventQueue.clear();
	
	// Pop up text:
	this.popUpTimer = 0;
	this.popUpQueue = [];
	this.popUpTextList = [];
	
	// Destroy Light:
	if (this.light) {
		this.light.destroy();
		this.light = null;
	}

	// Destroy Base Sprite:
	if (this.baseSprite) {
		this.baseSprite.destroy();
		this.baseSprite = null;
	}
	
	gs.getTile(this.tileIndex).character = null;
};

// USE_ABILITY:
// ************************************************************************************************
NPC.prototype.useAbility = function (ability) {
	var char;
	
	// Strafe dodging attacks:
	char = gs.getChar(ability.target);
	if (char && this.isHostileToMe(char) && 
		char.previousTileIndex && 
		util.frac() < 0.20 &&
		ability.type.canUseOn(this, char.previousTileIndex)) {
		
		ability.type.useOn(this, {x: char.previousTileIndex.x, y: char.previousTileIndex.y});
	}
	else {
		ability.type.useOn(this, {x: ability.target.x, y: ability.target.y});
	}
	
	ability.coolDown = ability.type.coolDown;
	ability.firstTurn = true;
	
	this.currentMp -= ability.type.mana || 0;
	this.updateStats();
	
	
	this.endTurn(ACTION_TIME);
};

// CAN_MOVE:
// ************************************************************************************************
NPC.prototype.canMove = function () {
	return !this.isImmobile && !this.type.isImmobile;
};

// MOVE_TO:
// Call this function to either move to a tile index or open a door if one is there
// ************************************************************************************************
NPC.prototype.moveTo = function (tileIndex, endTurn = true) {
	let prevTileIndex = {x: this.tileIndex.x, y: this.tileIndex.y};
	
	// Swap places:
	if (gs.getChar(tileIndex)) {
		gs.getChar(tileIndex).body.moveToTileIndex(this.tileIndex);
	}
	
	// Opening Door:
	if (gs.getObj(tileIndex, obj => obj.isSimpleDoor() && !obj.isOpen)) {
		gs.getObj(tileIndex).interact(this);
	}
	// Moving:
	else {
		// Stick sprite if off screen:
		if (!gs.getTile(tileIndex).visible && !gs.getTile(this.tileIndex).visible) {
			this.body.snapToTileIndex(tileIndex);
		}
		else {
			this.body.moveToTileIndex(tileIndex);
		}
	}
	

	// Kraken moving tentacles:
	if (this.type.name === 'TheKraken') {
		this.moveChildren(prevTileIndex, tileIndex);
	}

	
	// Has NPC Acted:
	if (gs.getTile(this.tileIndex).visible && this.faction === FACTION.HOSTILE) {
		gs.hasNPCActed = true;
	}
	
	if (endTurn) {
		this.endTurn(this.moveTime());
	}
	
};

// CAN_MOVE_TO_TILE:
// Returns true if the NPC can move to the tile without regards to the tiles contents.
// This is just to test flying and swimming creatures
// ************************************************************************************************
NPC.prototype.canMoveToTile = function (tileIndex) {
	
	// Never move out of bounds:
	if (!gs.isInBounds(tileIndex)) {
		return false;
	}
	
	// Swimming enemies can't move out of water:
	if (this.type.isSwimmer && !util.inArray(gs.getTile(tileIndex).type.name, ['Water', 'Lava', 'ToxicWaste'])) {
		return false;
	}
	
	// Swimming enemies can't move onto ice:
	if (this.type.isSwimmer && gs.getObj(tileIndex, obj => obj.type.coversLiquid)) {
		return false;
	}
	
	// Non-flying enemies will not move to pits
	if (gs.isPit(tileIndex) && !this.isFlying) {
		return false;
	}
	
	return true;
};

// CAN_DETECT_PLAYER:
// Returns true if the npc can potentially detect the player i.e. in agro range
// ************************************************************************************************
NPC.prototype.canDetectPlayer = function () {
	// Deep Sleep can never detect:
	if (this.statusEffects.has('DeepSleep')) {
		return false;
	}
	
	let agroRange;
	
	// Sleeping enemies can only detect when adjacent:
	if (this.isAsleep) {
		agroRange = 1.5;
	}
	// Vanish provides 100% stealth:
	else if (gs.pc.statusEffects.has('Vanish')) {
		agroRange = 0;
	}
	else {
		agroRange = MAX_SPOT_AGRO_RANGE;
	}
	
	// Players stealth:
	agroRange -= gs.pc.stealth;
	
	return util.distance(gs.pc.tileIndex, this.tileIndex) <= agroRange
		&& gs.getTile(this.tileIndex).visible;
};

// DETECT_PLAYER_PERCENT:
// ************************************************************************************************
NPC.prototype.detectPlayerPercent = function () {
	var pcStealth,
		npcPerception,
		detectPct;
	
	// Higher pcStealth means the pc is harder to spot:
	pcStealth = util.distance(gs.pc.tileIndex, this.tileIndex) + Math.max(0, gs.pc.stealth) * 2.6;

	// Can't see:
	if (util.distance(gs.pc.tileIndex, this.tileIndex) > MAX_SPOT_AGRO_RANGE || !gs.isRayClear(this.tileIndex, gs.pc.tileIndex)) {
		return 0;		
	}
	// Deep Sleep:
	if (this.statusEffects.has('DeepSleep')) {
		return 0;
	}
	// Sleeping:
	else if (this.isAsleep) {
		if (util.distance(gs.pc.tileIndex, this.tileIndex) > 1) {
			return 0;
		}

		npcPerception = 1;
	}
	// Normal:
	else {
		npcPerception = MAX_SPOT_AGRO_RANGE * 0.3 + (this.type.level - 1);
	}

	// perc === stealth => 0.5 chance to detect
	return Math.max(0, Math.min(0.95, (npcPerception / pcStealth) * 0.5));
};

// TRY_TO_AGRO_PLAYER:
// ************************************************************************************************
NPC.prototype.tryToAgroPlayer = function () {
	if (!gs.debugProperties.npcCanAgro) {
		return;
	}
	
	if (this.shouldAgroPlayer()) {
		
		if (this.isHidden) {
			// Alert nearby hidden enemies:
			this.shout(NPC_SHOUT_TYPE.AMBUSH);
		}
		
		
		this.spotAgroPlayer();
		
		
	}
};

// SHOULD_AGRO_PLAYER:
// ************************************************************************************************
NPC.prototype.shouldAgroPlayer = function (shoutType = NPC_SHOUT_TYPE.STANDARD) {
	// Hidden aquatic mobs are a special case (player must be in their water)
	if (this.isHidden && this.type.isSwimmer && this.maxAbilityRange <= 1.5) {
		let indexList = gs.getIndexListInFlood(this.tileIndex, index => gs.getTile(index).type.name === 'Water', 5, true);
		let pcIsInWater = indexList.find(index => util.vectorEqual(index, gs.pc.tileIndex));
		let pcIsInAmbushRange = util.distance(this.tileIndex, gs.pc.tileIndex) <= this.type.ambushDistance;
		
		if (pcIsInWater && pcIsInAmbushRange || shoutType === NPC_SHOUT_TYPE.AMBUSH) {
			return true;
		}
	}
	// Hidden mobs are a special case (player must be in their ambushDistance):
	else if (this.isHidden) {
		let pcIsInAmbushRange = util.distance(this.tileIndex, gs.pc.tileIndex) <= this.type.ambushDistance;
		
		if (pcIsInAmbushRange || shoutType === NPC_SHOUT_TYPE.AMBUSH) {
			return true;
		}
	}
	// Other mobs agro normally:
	else {
		return true;
	}
	
	return false;
};

// SPOT_AGRO_PLAYER:
// Call when the NPC spots the player for the first time
// This causes the NPC to miss a turn
// ************************************************************************************************
NPC.prototype.spotAgroPlayer = function () {
	this.waitTime = ACTION_TIME;
	this.agroPlayer();
};

// AGRO_PLAYER:
// ************************************************************************************************
NPC.prototype.agroPlayer = function () {
	if (this.faction !== FACTION.HOSTILE) {
		return;
	}
	
	if (this.isHidden) {
		this.popUpText('Ambush!');
		this.waitTime = 100;
		this.isHidden = false;
		
		
		// Alert nearby hidden enemies:
		this.shout(NPC_SHOUT_TYPE.AMBUSH);
	}
	else if (!this.isAgroed) {
		this.popUpText('!!!');
	}
	
	
	this.unagroTimer = 0;
	this.isAgroed = true;
	this.isAsleep = false;
	this.statusEffects.onAgroPlayer();
	
	// Wizard Yendor:
	let ability = this.abilities.list.find(ability => ability && ability.type.name === 'YendorTransform');
	if (ability) {
		ability.coolDown = ability.type.coolDown;
	}
};

// SHOUT:
// ************************************************************************************************
NPC.prototype.shout = function (shoutType = NPC_SHOUT_TYPE.STANDARD) {
	gs.shout(this.tileIndex, this.faction, false, shoutType);
};

// UPDATE_TURN:
// ************************************************************************************************
NPC.prototype.updateTurn = function () {
	// Don't update dead npcs:
	if (!this.isAlive) {
		return;
	}

	// Lose agro:
	if (this.isAgroed && !gs.getTile(this.tileIndex).visible && !this.type.alwaysAgroed && this.faction !== FACTION.PLAYER) {
		this.unagroTimer += 1;
		if (this.unagroTimer >= NPC_UNAGRO_TIME && !this.type.neverUnagro) {
			this.isAgroed = false;
		}
	}
	
	// Reset agro timer:
	if (this.isAgroed && gs.getTile(this.tileIndex).visible) {
		this.unagroTimer = 0;
	}
	
	// Special type updateTurn function:
	if (this.type.updateTurn) {
		this.type.updateTurn.call(this);
	}
	
	// Swimmers die if out of lava / water:
	if (this.type.isSwimmer && !util.inArray(gs.getTile(this.tileIndex).type.name, ['Lava', 'Water', 'ToxicWaste'])) {
		this.takeDamage(Math.ceil(this.maxHp / 5), 'NONE', {neverCrit: true});
	}
	
	// An NPC may kill itself during its update turn call and we need to return before proceding:
	if (!this.isAlive) {
		return;
	}
	
	if (this.npcClassType && this.npcClassType.updateTurn) {
		this.npcClassType.updateTurn.call(this);
	}
	
	// Summon Duration:
	if (this.summonerId) {
		this.reduceSummonDuration();
	}

	this.updateTurnBase();
	this.updateStats();
};

// REDUCE_SUMMON_DURATION:
// ************************************************************************************************
NPC.prototype.reduceSummonDuration = function () {
	// Use summon duration -1 to indicate no duration
	if (this.summonDuration === -1) {
		return;
	}
	
	this.summonDuration -= 1;
	
	if (this.summonDuration <= 0) {
		this.poofSummon();
	}
};

// POOF_SUMMON:
// ************************************************************************************************
NPC.prototype.poofSummon = function () {
	// Poof:
	gs.createParticlePoof(this.tileIndex, this.poofColor);
	this.popUpText('Poof');
	gs.playSound(gs.sounds.death);

	// Tell summoner I'm dead:
	if (gs.getCharWithID(this.summonerId)) {
		util.removeFromArray(this.id, gs.getCharWithID(this.summonerId).summonIDList);
	}

	this.destroy();
};


// FALL_DOWN_PIT:
// ************************************************************************************************
NPC.prototype.fallDownPit = function () {
	this.death();
};

// ON_ENTER_TILE:
// Called once the character has actually finished moving and entered the tile
// Note that his tileIndex is already correct as it was set when beginning the move
// ************************************************************************************************
NPC.prototype.onEnterTile = function () {
	this.onEnterTileBase();
};

// ON_TAKE_DAMAGE:
// ************************************************************************************************
NPC.prototype.onTakeDamage = function (flags) {
	if (!this.isAlive) {
		return;
	}
	
	// Damaged npc's always agro player:
	this.agroPlayer();

	// Does the NPC start to run:
	if (this.canStartRunning() && util.frac() < NPC_FLEE_CHANCE) {
		this.statusEffects.add('Fleeing');
	}

	// On Hit Functions:
	if (this.currentHp > 0) {
		if (this.type.onHit) {
			this.type.onHit(this, flags);
		}
		
		if (this.npcClassType && this.npcClassType.onHit) {
			this.npcClassType.onHit(this, flags);
		}
	}
};

// CAN_START_RUNNING:
// ************************************************************************************************
NPC.prototype.canStartRunning = function () {
	return this.currentHp > 0 
		&& this.currentHp <= Math.round(this.maxHp * NPC_FLEE_HP_PERCENT) 
		&& !this.statusEffects.has('NPCBerserk') 
		&& !this.type.neverRun
		&& !this.type.isImmobile
		&& !this.isImmobile
		&& this.faction !== FACTION.PLAYER // allies never run
		&& gs.agroedHostileList().length > 1;
};

// LOSE_EXP:
// ************************************************************************************************
NPC.prototype.loseExp = function () {
	// Pass
};

// DOMINATE:
// Call when the player dominates the NPC to set his faction to the players
// ************************************************************************************************
NPC.prototype.dominate = function (statusEffectName) {
	this.faction = FACTION.PLAYER;
	this.isAsleep = false;
	this.statusEffects.add(statusEffectName);
	
	// Remove hidden:
	this.isHidden = false;
	
	// Remove charm from player if we are dominating the npc who charmed us:
	if (gs.pc.statusEffects.has('NPCCharm')) {
		let statusEffect = gs.pc.statusEffects.get('NPCCharm');
		
		if (statusEffect.casterId === this.id) {
			gs.pc.statusEffects.remove('NPCCharm');
		}
	}
	
	// Special onDominate func:
	if (this.type.onDominate) {
		this.type.onDominate.use(this);
	}
};

// KILLED_EXP:
// How much exp does the NPC give when killed
// ************************************************************************************************
NPC.prototype.killedExp = function () {
	let exp = this.exp;
	
	// Handle granting exp for a spawners unspawned NPCs:
	let ability = this.abilities.getAbility('SpawnNPC');
	if (ability) {
		exp += this.currentMp * ability.type.numSpawned * gs.npcTypes[ability.type.npcTypeName].exp;
	}
	
	// Summoned creatures give no exp:
	if (this.summonerId) {
		exp = 0;
	}
	
	return exp;
};

// NPC_TYPE_EXP:
// How much exp does the NPC-Type give when killed
// ************************************************************************************************
gs.NPCTypeExp = function (npcTypeName) {
	let npcType = gs.npcTypes[npcTypeName];
	
	let exp = npcType.exp;
	
	// Handle exp for spawners:
	if (npcType.abilityTypes) {
		let ability = npcType.abilityTypes.find(e => e.name === 'SpawnNPC');
		if (ability) {
			exp += npcType.maxMp * ability.numSpawned * gs.NPCTypeExp(ability.npcTypeName);
		}
	}
	
	
	return exp;
};


// DEATH:
// ************************************************************************************************
NPC.prototype.death = function (damageType, flags) {
	var itemName, dropIndex;
	flags = flags || {};	

	// Drop Loot:
	this.dropLoot();
	
	// Destroy:
	this.destroy();
	
	// Random chance to shout upon death:
	if (util.frac() < 0.5) {
		this.shout();
	}
	
	// Slime King will not give EXP unless he is last one alive:
	if (this.type.name === 'ExpanderisTheSlimeKing' && gs.characterList.filter(char => char.type.name === 'ExpanderisTheSlimeKing' && char.isAlive).length > 0) {
		// Pass
	}
	else {
		gs.pc.gainExperience(this.killedExp());
	}
	

	// Blood:
	if (!gs.getObj(this.tileIndex) && !this.type.noBlood && !gs.isPit(this.tileIndex)) {
		gs.createObject(this.tileIndex, this.type.bloodTypeName);
	}
	
	// Rage:
	if (gs.pc.maxRage > 0 && flags.killer === gs.pc) {
		gs.pc.gainRage(1);
	}
	
	// Poof my summoned mobs:
	this.summonIDList.forEach(function (id) {
		if (gs.getCharWithID(id)) {
			if (gs.getCharWithID(id).type.name !== 'Tentacle') {
				gs.getCharWithID(id).popUpText('Poof!');
			}
			
			gs.getCharWithID(id).death();
		}
	});
	
	// Poof my summoned clouds:
	this.cloudIDList.forEach(function (id) {
		let cloud = gs.getCloudWithID(id);
		if (cloud) {
			gs.createPopUpTextAtTileIndex(cloud.tileIndex, 'Poof!');
			cloud.destroy();
		}
	}, this);
	
	// Tell my summoner I'm dead:
	if (this.summonerId && gs.getCharWithID(this.summonerId)) {
		util.removeFromArray(this.id, gs.getCharWithID(this.summonerId).summonIDList);
	}
	
	// Remove Charm:
	if (gs.pc.statusEffects.has('NPCCharm') && gs.pc.statusEffects.get('NPCCharm').casterId === this.id) {
		gs.pc.statusEffects.remove('NPCCharm');
	}
	
	// Player status effects: charm, constrict, curses etc.
	gs.pc.statusEffects.onNPCDeath();
	
	// Poof:
	if (this.name !== 'GobletShield') {
		gs.createParticlePoof(this.tileIndex);
	}
	
	
	// Sound:
	gs.playSound(gs.sounds.death, this.tileIndex);
	
	// Shake:
	if (this.name === 'GobletShield') {
		game.camera.shake(0.005, 200);
		game.camera.flash(0xffffff, 30);
	}
	else {
		game.camera.shake(0.005, 100);
		game.camera.flash(0xffffff, 10);
	}
	
	
	// onDeath Func:
	if (this.type.onDeath) {
		this.type.onDeath.use(this);
	}
	
	// Special Yendor Stuff:
	if (this.type.niceName === 'The Wizard Yendor') {
		this.yendorDeath();
	}
	
	gs.HUD.miniMap.refresh();
	
	// Achievements:
	if (flags.killer === gs.pc) {
		gs.pc.numKills += 1;
	}
	
	// End turn:
	if (gs.activeCharacter() === this) {
		this.endTurn(ACTION_TIME);
	}
	
	
};



// YENDOR_DEATH:
// ************************************************************************************************
NPC.prototype.yendorDeath = function () {
	// Win the game:
	if (this.yendorVersion === 3 && gs.pc.inventory.hasItemType(gs.itemTypes.GobletOfYendor)) {
		// Immediately clear game data:	
		gs.clearGameData();
		
		// Immediately log the win:
		gs.logGameRecord('successfully defeated The Wizard Yendor and retrieved the Goblet.', true);
	
		// Immediately log achievements:
		achievements.onWinGame();
		
		// Dialog:
		gs.popUpYendorDeathDialog(this);
		
		return;
	}
	
	// Respawn last yendor version if player does not hold the goblet:
	if (this.yendorVersion === 3 && !gs.pc.inventory.hasItemType(gs.itemTypes.GobletOfYendor)) {
		
		// Summon Effect:
		gs.createSummonEffect(this.tileIndex, function () {
			// Find a clear tile index (in case charge has blocked his tile):
			let tileIndex = gs.getNearestPassableSafeIndex(this.tileIndex);
			
			let yendorChar = gs.createNPC(tileIndex, this.type.name);
			yendorChar.yendorVersion = 3;
			yendorChar.currentHp = YENDOR_MAX_HP[2];
			yendorChar.isAgroed = true;
			
			// Dialog:
			gs.popUpYendorDeathDialog(this);
		}, this);
		
		// Sound:
		gs.playSound(gs.sounds.cure, this.tileIndex);
		
		return;
	}
	
	let portalTileIndex, toTileIndex;
	if (this.yendorVersion === 1) {
		portalTileIndex = gs.miscLevelData.find(e => e.name === 'Yendor01-Portal').portalTileIndex;
		toTileIndex = gs.miscLevelData.find(e => e.name === 'Yendor01-Portal').toTileIndex;
	}
	else if (this.yendorVersion === 2) {
		portalTileIndex = gs.miscLevelData.find(e => e.name === 'Yendor02-Portal').portalTileIndex;
		toTileIndex = gs.miscLevelData.find(e => e.name === 'Yendor02-Portal').toTileIndex;
	}
	
	
	
	// Summon Effect:
	gs.createSummonEffect(portalTileIndex, function () {
		// Remove any objects:
		if (gs.getObj(portalTileIndex)) {
			gs.destroyObject(gs.getObj(portalTileIndex));
		}
		
		// Place portal:
		let obj = gs.createObject(portalTileIndex, 'Portal');
		obj.toTileIndexList = [{x: toTileIndex.x, y: toTileIndex.y}];
	}, this);
	
	// Sound:
	gs.playSound(gs.sounds.cure, this.tileIndex);
	
	// Dialog:
	gs.popUpYendorDeathDialog(this);	
};

// DROP_LOOT:
// Call when an NPC dies to drop loot
// ************************************************************************************************
NPC.prototype.dropLoot = function () {
	var tileIndex;
	
	// Dominated enemies never drop their loot:
	if (this.statusEffects.has('Domination') || this.statusEffects.has('ScrollOfDomination')) {
		return;
	}
	
	// Slime King will not drop loot if he's not the last one alive:
	if (this.type.name === 'ExpanderisTheSlimeKing' && gs.characterList.filter(char => char.type.name === 'ExpanderisTheSlimeKing' && char.isAlive).length > 1) {
		return;
	}
	
	tileIndex = gs.getValidDropIndex(this.tileIndex);
	
	// Special logic for Vampire Bats in Crypt:4 The Vampire Lord
	if (levelController.flags.isVampireLordLevel) {
		let npcList = gs.characterList.filter(char => char.isAlive && char.type.name === 'VampireBat' && char.faction === FACTION.HOSTILE);
		if (this.type.name === 'VampireBat' && this.faction === FACTION.HOSTILE && npcList.length === 1) {
			gs.createFloorItem(tileIndex, Item.createItem('RingOfBlood'));
		}
	}
	
	
	// Preset dropTable loot:
	if (this.type.dropTable && tileIndex) {
		// We use the level specific seed to guarantee item consistancy between seeds.
		util.seedRand([gs.seed, gs.zoneName, gs.zoneLevel]);
				 
		let itemTypeName = util.chooseRandom(this.type.dropTable);
		
		if (itemTypeName) {
			gs.createFloorItem(tileIndex, Item.createItem(itemTypeName));
		}
	}
	// Dropping random loot:
	else if (this.type.dropPercent && tileIndex) {
		if (util.frac() <= this.type.dropPercent) {
			if (util.frac() <= DROP_GOLD_PERCENT) {
				gs.createFloorItem(tileIndex, Item.createItem('GoldCoin', {amount: util.randInt(Math.ceil(gs.dropGoldAmount() / 2), gs.dropGoldAmount())}));
			} 
			else {
				gs.createRandomFloorItem(tileIndex);
			}
		}
	}
};

// GO_TO_SLEEP:
// ************************************************************************************************
NPC.prototype.goToSleep = function () {	
	if (!this.isDamageImmune && !this.type.immunities.sleep) {
		this.isAgroed = false;
		this.isAsleep = true;
	}
};

// ON_START_TURN:
// Called when the character starts their turn
// ************************************************************************************************
NPC.prototype.onStartTurn = function () {
	this.isMultiMoving = false;
	this.previousTileIndex = {x: this.tileIndex.x, y: this.tileIndex.y};
};

// TO_DATA:
// ************************************************************************************************
NPC.prototype.toData = function () {
	var data, i; 
	
	data = {
		id:						this.id,
		typeName: 				this.type.name,
		isAsleep: 				this.isAsleep,
		isAgroed:				this.isAgroed,
		isHidden:				this.isHidden,
		faction: 				this.faction,
		tileIndex: 				this.tileIndex,
		currentHp: 				this.currentHp,
		currentMp:				this.currentMp,
		maxHp:					this.maxHp,
		summonerId:				this.summonerId,
		summonIDList:			this.summonIDList,
		cloudIDList:			this.cloudIDList,
		summonDuration: 		this.summonDuration,
		actionQueue: 			this.actionQueue,
		timeToHatch:			this.timeToHatch,
		level:					this.level,
		lightningRodTileIndex:	this.lightningRodTileIndex,
		exp:					this.exp,
		rotFacing:				this.rotFacing,
		spriteAngle:			this.sprite.angle,
	};
	
	if (this.yendorVersion) {
		data.yendorVersion = this.yendorVersion;
	}
	
	if (this.name === 'Merchant') {
		data.hasStockedItems = this.hasStockedItems;
	}
	
	if (this.npcClassType) {
		data.npcClassName = this.npcClassType.name;
	}
	
	// Move Delta (for slow fire balls):
	if (this.moveDelta) {
		data.moveDelta = this.moveDelta;
	}
	
	if (this.burstDamage) {
		data.burstDamage = this.burstDamage;
	}
	
	// Abilities:
	data.coolDowns = [];
	for (i = 0; i < MAX_ABILITIES; i += 1) {
		if (this.abilities.list[i]) {
			data.coolDowns[i] = this.abilities.list[i].coolDown;
		}
		else {
			data.coolDowns[i] = 0;
		}
	}
	
	// Status Effects:
	data.statusEffects = this.statusEffects.toData();
	
	return data;
};

// LOAD_NPC:
// ************************************************************************************************
gs.loadNPC = function (data) {
	var npc, flags;
	
	flags = {
		id:			data.id,
		isAsleep: 	data.isAsleep,
		level:		data.level,
		
	};
	
	if (data.npcClassName) {
		flags.npcClassType = gs.npcClassTypes[data.npcClassName];
	}
	
	// Create NPC:
	npc = this.createNPC(data.tileIndex, data.typeName, flags);
	
	
	// Test for failure:
	if (!npc) {
		throw 'Failed to create NPC';
	}
	
	// For slow fire ball:
	if (data.moveDelta) {
		npc.moveDelta = data.moveDelta;
	}
	
	if (data.burstDamage) {
		npc.burstDamage = data.burstDamage;
	}
	
	if (data.hasStockedItems) {
		npc.hasStockedItems = data.hasStockedItems;
	}
	
	if (data.yendorVersion) {
		npc.yendorVersion = data.yendorVersion;
	}

	npc.isAgroed = data.isAgroed;
	npc.summonerId = data.summonerId;
	npc.summonIDList = data.summonIDList;
	npc.summonDuration = data.summonDuration;
	npc.actionQueue = data.actionQueue;
	npc.faction = data.faction;
	npc.isHidden = data.isHidden;
	npc.timeToHatch = data.timeToHatch;
	npc.lightningRodTileIndex = data.lightningRodTileIndex;
	npc.rotFacing = data.rotFacing || 'LEFT';
	npc.maxHp = data.maxHp;
	
	npc.sprite.angle = data.spriteAngle || 0;
	
	// Dec 30th to not break old saves
	if (data.hasOwnProperty('exp')) {
		npc.exp = data.exp;
	}
	
	
	
	// Set HP																			
	npc.currentHp = data.currentHp;
	npc.currentMp = data.currentMp;

	// Load Ability Cooldowns:
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		if (npc.abilities.list[i]) {
			npc.abilities.list[i].coolDown = data.coolDowns[i];
		}
	}
	
	// Load Status Effects:
	npc.statusEffects.loadData(data.statusEffects);
	
	
	
	
	return npc;
};

// END_TURN:
// ************************************************************************************************
NPC.prototype.endTurn = function (waitTime) {
	// End Turn:
	// Need to add test in case enemies try to end their turn twice in a single turn
	// This occurs during kite projectile attacks where an enemies both fires and moves
	
	if (waitTime === 0) {
		throw 'Invalid waittime';
	}
	
	if (gs.activeCharacter() === this) {
		
		this.waitTime = waitTime;
		
		// NPCs ending their turn visible to the player will halt his queued actions:
		if (gs.pc.canSeeCharacter(this) && this.faction === FACTION.HOSTILE && !this.type.isHidden) {
			gs.hasNPCActed = true;
		}
		
		gs.endTurn();
	}	
};

// IS_SPELL_CASTER:
// ************************************************************************************************
NPC.prototype.isSpellCaster = function () {
	let hasSpell = false;
	
	this.abilities.list.forEach(function (ability) {
		if (ability && ability.type.isSpell) {
			hasSpell = true;
		}							
	}, this);
	
	return hasSpell;
};

// LOCK_ALL_SPELLS:
// ************************************************************************************************
NPC.prototype.lockAllSpells = function (coolDown) {
	this.abilities.list.forEach(function (ability) {
		if (ability && ability.type.isSpell) {
			ability.coolDown = coolDown;
		}							
	}, this);
};

// GET_DESC:
// ************************************************************************************************
NPC.prototype.getDesc = function () {
	var desc = {title: '', text: ''};
	
	// Name:
	if (this.npcClassType) {
		desc.title += this.npcClassType.name + ' ' + this.type.niceName;
	}
	else {
		desc.title += this.type.niceName;
	}
	
	// Hidden Title:
	if (this.isHidden) {
		desc.title += ' (Hidden)';
	}
	
	
	// Early Return for Pots:
	if (this.name === 'FirePot' || this.name === 'GasPot') {
		desc.text += 'Damage: ' + gs.getTrapDamage(this.name) + '\n\n';
		
		desc.text += 'Hold [Z] key to attack.';
		
		return desc;
	}
	
	// Early return for neutral enemies like merchants, crates, etc.
	if (this.faction === FACTION.NEUTRAL || this.faction === FACTION.DESTRUCTABLE || this.type.hideInterface) {
		if (this.burstDamage) {
			desc.text = 'Damage: ' + this.burstDamage;
		}
		return desc;
	}
	
	// Early Return for Goblet Shield:
	if (this.name === 'GobletShield') {
		desc.text = 'HP: ' + this.currentHp + '/' + this.maxHp + '\n';
		return desc;
	}
	
	// Early Return for Inferno Orb:
	if (this.name === 'SpectralOrb') {
		desc.text = 'Damage: ' + this.burstDamage + '\n';
		desc.text += 'Duration: ' + this.summonDuration;
		return desc;
	}
	
	// Early Return for Fire Ball:
	if (this.name === 'HomingFireOrb') {
		desc.text = 'HP: ' + this.currentHp + '/' + this.maxHp + '\n';
		desc.text += 'Damage: ' + this.burstDamage;
		return desc;
	}
	
	// Set level color:
	if (this.level < gs.pc.level - 2) {
		desc.font = 'PixelFont6-Green';
	}
	else if (this.level < gs.pc.level) {
		desc.font = 'PixelFont6-Blue';
	}
	else if (this.level > gs.pc.level + 2) {
		desc.font = 'PixelFont6-Red';
	}
	else if (this.level > gs.pc.level) {
		desc.font = 'PixelFont6-Yellow';
	}
	else {
		desc.font = null;
	}
	
	// Level:
	desc.text += 'Level: ' + this.level + '\n';
	
	// HP:
	desc.text += 'HP: ' + this.currentHp + '/' + this.maxHp + '\n';
	
	// size:
	desc.text += 'Size: ' + ['SMALL', 'MEDIUM', 'LARGE'][this.size] + '\n';

	// Defense:
	DAMAGE_TYPES.forEach(function (type) {
		if (this.resistance[type] > 0) {
			desc.text += type + ' Resistant\n';
		}
		else if (this.resistance[type] < 0) {
			desc.text += 'Vulnerable to ' + type + '\n';
		}
	}, this);
	
	// Armored:
	if (this.protection > 0) {
		desc.text += 'Protection: ' + this.protection + '\n';
	}
	
	// Reflective:
	if (this.reflection > 0) {
		desc.text += 'Reflective\n';
	}
	
	// DAMAGE_SHIELD:
	DAMAGE_TYPES.forEach(function (damageType) {
		if (this.damageShield[damageType] > 0) {
			desc.text += damageType + ' Damage Shield: ' + this.damageShield[damageType] + '\n';
		}
	}, this);
	
	// ABILITIES:
	this.abilities.list.forEach(function (ability) {
		if (ability && !ability.type.dontShowInDesc) {
			let str = '';
			
			// Ability has a specific toShortDesc function:
			if (ability.type.toShortDesc) {
				str += ability.type.toShortDesc(this);
			}
			// Generic Desc:
			else {
				str += '*' + ability.type.niceName;

				if (ability.type.attributes && ability.type.attributes.damage) {
					str += ': ' + ability.type.attributes.damage.value(this) + ' DMG';
				}
			}
				
			desc.text += str + '\n';
		}
	}, this);
	
	// Reflective:
	if (this.type.isCorrosive) {
		desc.text += '\nDegrades the enchantment of melee weapons when attacked.\n';
	}
	
	return desc;
};

// DESTROY_ALL_NPCS:
// ************************************************************************************************
gs.destroyAllNPCs = function () {
	gs.getAllNPCs().forEach(function (npc) {
		npc.destroy();
	}, this);
	
	// Clear character list:
	//gs.removeDeadCharacters();
};

// SHOUT:
// A global shout function that can be used to agro NPCs
// ************************************************************************************************
gs.shout = function (shoutTileIndex, faction, missTurn = false, shoutType = NPC_SHOUT_TYPE.STANDARD) {
	var shoutRange;
	
	let pred = function (tileIndex) {
		return gs.isStaticPassable(tileIndex) || gs.isTileIndexTransparent(tileIndex);
	};
	
	let shoutFloodRange = Math.floor(SHOUT_RANGE / 2) + 1;
	let tileIndexList = gs.getIndexListInFlood(shoutTileIndex, pred, shoutFloodRange, true);
	
	/*
	// Debug - Show shout flood range:
	tileIndexList.forEach(function (tileIndex) {
		debug.createDebugSprite(tileIndex);
	}, this);
	*/
	
	// Need to check if each NPC is in range of the shout:
	gs.getAllNPCs().forEach(function (npc) {
		// Skip if the NPC is the source of the shout (he doesn't alert himself and reset his timer):
		if (util.vectorEqual(npc.tileIndex, shoutTileIndex)) {
			return;
		}
		
		// Deep sleep enemies cannot respond to shouts:
		if (npc.statusEffects.has('DeepSleep')) {
			shoutRange = 0;
		}
		// Sleeping enemies have reduced range for shouts:
		else if (npc.isAsleep) {
			shoutRange = SHOUT_RANGE / 2;
		}
		// A shout originating far from the player has reduced range:
		else if (util.distance(shoutTileIndex, gs.pc.tileIndex) > LOS_DISTANCE && shoutType !== NPC_SHOUT_TYPE.STRONG) {
			shoutRange = SHOUT_RANGE / 2;
		}
		else {
			shoutRange = SHOUT_RANGE;
		}


				
		if (npc.shouldAgroPlayer(shoutType)
			&& npc.faction === faction
			&& util.distance(shoutTileIndex, npc.tileIndex) <= shoutRange
			&& (util.distance(gs.pc.tileIndex, npc.tileIndex) <= MAX_SHOUT_AGRO_RANGE || shoutType === NPC_SHOUT_TYPE.STRONG)
			&& (gs.isRayClear(shoutTileIndex, npc.tileIndex) || tileIndexList.find(index => util.vectorEqual(index, npc.tileIndex)))) {
			
			if (npc.isAgroed && util.vectorEqual(npc.tileIndex, npc.previousTileIndex)) {
				// An npc that is already agroed and has not moved in last turn will not respond to shout
				// This handles cases of aquatic enemies that are stuck when the player is out of LoS
				// This stops them from shouting to each other
			}
			else {
				npc.agroPlayer();
			}
			
			
			
			if (missTurn && gs.activeCharacter() !== gs.pc) {
				npc.waitTime = 100;
			}
		}
	
	}, this);
};

// ADJUSTED_MONSTER_LEVEL:
// ************************************************************************************************
gs.adjustedMonsterLevel = function (level) {
	if (level <= gs.dangerLevel() - 8) {
		return level + 2;
	}
	else if (level <= gs.dangerLevel() - 4) {
		return level + 1;
	}
	else {
		return level;
	}
};


