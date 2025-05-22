/*global Phaser, game, gs, console, util*/
/*global SCALE_FACTOR, LARGE_WHITE_FONT, DAMAGE_TYPE*/
/*global Abilities, StatusEffects, CharacterBody, CharacterEventQueue, CharacterTalents*/
/*global CHARACTER_HEALTH_FONT, CHARACTER_STATUS_FONT*/
/*global CRIT_MULTIPLIER, TILE_SIZE*/
/*global INFERNO_RING_DAMAGE*/
/*global PARTICLE_FRAMES*/
/*global MOVEMENT_SPEED, FAST_MOVEMENT_SPEED, KNOCK_BACK_SPEED*/
/*global TIME_SCALAR, FACTION, CORRODE_PERCENT, CHARACTER_SIZE, DAMAGE_TYPES*/
/*global LAVA_DAMAGE*/
/*global achievements*/
/*jshint white: true, laxbreak: true, esversion: 6*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function Character() {
	// Cant add any properties here cause theres only one Character shared prototype
}

Character.prototype.createSharedProperties = function () {
	this.isAlive = true;
	this.state = 'WAITING';
	
	// Speed and Timing:
	this.waitTime = 0; // The time the character must wait to take next turn
	
	// Attributes:
	this.baseAttributes = {strength: 10, dexterity: 10, intelligence: 10};
	this.maxAttributes = {strength: 10, dexterity: 10, intelligence: 10};
	
	

	
	// Components:
	this.abilities 		= new Abilities(this);
	this.statusEffects 	= new StatusEffects(this);
	this.body 			= new CharacterBody(this);
	this.eventQueue 	= new CharacterEventQueue(this);
	this.talents 		= new CharacterTalents(this);
	
	// Defense:
	this.protection = 0;
	this.resistance = {Fire: 0, Cold: 0, Shock: 0, Toxic: 0};
	this.damageShield = {Fire: 0, Cold: 0, Shock: 0, Toxic: 0, Physical: 0};
	
	// Health and Mana:
	this.maxHp = 0;
	this.currentHp = 0;
	this.poisonDamage = 0;
	this.hpRegenTime = 0;
	this.mpRegenTime = 0;
	this.hpRegenTimer = 0;
	this.mpRegenTimer = 0;
	
	// Movement:
	this.movementSpeed = MOVEMENT_SPEED.NORMAL;
	this.maxSp = 0;
	this.currentSp = 0;
	
	// Create sprite:
	this.sprite = gs.createSprite(0, 0, 'Tileset', gs.objectSpritesGroup);
	this.sprite.anchor.setTo(0.5, 0.5);
	this.sprite.visible = false;
	
	this.createCharacterUI();
};


// UPDATE_TURN_BASE:
// ************************************************************************************************
Character.prototype.updateTurnBase = function () {
	this.onTurnRegeneration();
	this.statusEffects.onUpdateTurn();
	this.onTurnPoison();
	
	// Take damage from Lava:
	if (gs.getTile(this.tileIndex).type.name === 'Lava' && !this.isFlying && !this.isLavaImmune && gs.isUncoveredLiquid(this.tileIndex)) {
		this.takeDamage(gs.npcDamage(gs.dangerLevel(), 'MLOW'), 'Fire', {killer: 'Lava', neverCrit: true});
	}
	
	// Take damage from Toxic Waste:
	if (gs.getTile(this.tileIndex).type.name === 'ToxicWaste' && !this.isFlying && !this.type.isToxicWasteImmune) {
		this.takeDamage(gs.npcDamage(gs.dangerLevel(), 'MLOW'), 'Toxic', {killer: 'ToxicWaste', neverCrit: true});
	}
	
	// Apply Cloud Effects:
	if (gs.getCloud(this.tileIndex)) {
		gs.getCloud(this.tileIndex).characterTurnEffect(this);
	}
	

	
	// Terrain effects like unstable, wet, oil etc.
	this.updateTerrainEffects();
	
	// Reduce Cooldown:
	this.abilities.updateTurn();

	// ASSERT:
	if (this.isAlive && gs.getChar(this.tileIndex) !== this) {
		console.log(this);
		throw 'Not on tileindex';
	}
};

// ON_TURN_CONVEYOR_BELT:
// ************************************************************************************************
Character.prototype.onTurnConveyorBelt = function () {
	// Flight ignores conveyor belts:
	if (this.isFlying) {
		return;
	}
	
	
	let obj = gs.getObj(this.tileIndex);
	
	if (obj && obj.type.niceName === 'Conveyor Belt' && gs.isPassable(this.tileIndex.x + obj.type.delta.x, this.tileIndex.y + obj.type.delta.y)) {
		let facing = this.body.facing;
		let toTileIndex = {x: this.tileIndex.x + obj.type.delta.x, y: this.tileIndex.y + obj.type.delta.y};
		
		// We immediatly place the character in the new tileIndex
		gs.getTile(this.tileIndex).character = null;
		gs.getTile(this.tileIndex.x + obj.type.delta.x, this.tileIndex.y + obj.type.delta.y).character = this;
		this.tileIndex = {x: toTileIndex.x, y: toTileIndex.y};
		
		// We need to update the startTileIndex of status effects like netted or frozen
		// Otherwise they think the char was knocked back and will cancel
		this.statusEffects.list.forEach(function (statusEffect) {
			if (statusEffect.startTileIndex) {
				statusEffect.startTileIndex = {x: toTileIndex.x, y: toTileIndex.y};
			}
		}, this);
		
		// Stop action queue:
		this.actionQueue = [];
		
		// Create event to slightly delay the movement
		let event = {
			char: this, 
			complete: false,
			pauseTime: 0,
		};
		event.updateFrame = function () {
			this.pauseTime += 1;
			
			if (this.char.body.state === 'WAITING' && this.pauseTime >= 10) {
				// Move without ending turn:
				this.char.moveTo(toTileIndex, true, false);
				this.char.dontStrafeAttack = true;
				this.complete = true;
				this.char.body.facing = facing;
			}
		};
		event.isComplete = function () {
			return this.complete;
		};
		
		// Push event:
		this.eventQueue.addEvent(event);
	}
};

// ON_TURN_REGENERATION:
// ************************************************************************************************
Character.prototype.onTurnRegeneration = function () {
	// Draining prevents regeneration:
	if (this.statusEffects.has('Draining')) {
		return;
	}
		
	// Health Regeneration:
	if (!this.type.noRegen && (this !== gs.pc || gs.pc.currentFood > 0)) {
		if (this === gs.pc && util.inArray(this.race.name, ['Gargoyle', 'Vampire'])) {
			// Pass (no HP regen)
		}
		else {
			this.hpRegenTimer += 1;
			if (this.hpRegenTimer >= this.hpRegenTime) {
				this.healHp(this.hpRegenAmount);
				this.hpRegenTimer = 0;
			}
		}
	}

	// Mana Regeneration:
	if (this === gs.pc) {
		this.mpRegenTimer += 1;
		if (this.mpRegenTimer >= this.mpRegenTime) {
			this.restoreMp(1);
			this.mpRegenTimer = 0;
		}
	}
	
	// Special Regeneration:
	if (this.regenPerTurn) {
		this.healHp(Math.ceil(this.maxHp * this.regenPerTurn));
	}
	
};

// ON_TURN_POISON:
// ************************************************************************************************
Character.prototype.onTurnPoison = function () {
	var damage;
	
	// Apply poison damage:
	if (this.poisonDamage > 0) {
		damage = Math.min(this.poisonDamage, Math.ceil(this.poisonDamage * 0.25)); // Poison damage will deal at most 5 damage per turn
		
		this.takeDamage(damage, 'Toxic', {killer: 'Poison', neverCrit: true});
		
		this.poisonDamage -= damage;
		this.poisonDamage = Math.max(0, this.poisonDamage);
	}
};


// UPDATE_TERRAIN_EFFECTS:
// ************************************************************************************************
Character.prototype.updateTerrainEffects = function () {
	// Unstable:
	if (this.isTileIndexUnstable(this.tileIndex) && !this.isFlying) {
		this.statusEffects.add('Unstable');
	} 
	else {
		this.statusEffects.remove('Unstable');
	}

	// Wet:
	if (gs.isUncoveredLiquid(this.tileIndex) && gs.getTile(this.tileIndex).type.isWet && !this.isFlying) {
		this.statusEffects.add('Wet');
	} 
	else {
		this.statusEffects.remove('Wet');
	}

	// Flammable:
	if (gs.getObj(this.tileIndex, 'Oil') && !this.isFlying) {
		this.statusEffects.add('Flammable');
	} 
	else {
		this.statusEffects.remove('Flammable');
	}
};

// UPDATE_FRAME:
// ************************************************************************************************
Character.prototype.updateFrame = function () {
    this.body.onUpdateFrame();
	
	// Update sprite position based on character position and offset:
	this.sprite.x = this.body.position.x + Math.round(this.body.offset.x);
	this.sprite.y = this.body.position.y + Math.round(this.body.offset.y);
	
	// Base Sprite:
	if (this.baseSprite) {
		this.baseSprite.x = this.sprite.x;
		this.baseSprite.y = this.sprite.y;
		
		if (this.type.niceName === 'The Wizard Yendor') {
			this.baseSprite.y = this.sprite.y - 20;
		}
	}
	
	
	
	// Characters on solid objects (crypt altar):
	if (this.type.name === 'CryptAltar') {
		this.sprite.y += 1;
	}
	
	if (this.light) {
		this.light.sprite.x = this.sprite.x;
		this.light.sprite.y = this.sprite.y;
	}
	
	
	
	// Crop sprite if submerged:
	if (gs.isUncoveredLiquid(this.tileIndex) && !this.isFlying && !this.type.dontSubmerge) {
		this.sprite.crop(new Phaser.Rectangle(0, 0, TILE_SIZE / 2, TILE_SIZE * this.type.cropScaleFactor));
	} 
	else {
		this.sprite.crop(new Phaser.Rectangle(0, 0, TILE_SIZE / 2, TILE_SIZE / 2));
	}
    
	this.updateSpriteFrame();
	
	// Multi-moving particle trail:
	if ((this.isMultiMoving || this.body.isKnockBack)) {
		let pos = this.sprite.position;
		gs.createParticle(pos, {frame: PARTICLE_FRAMES.WHITE, duration: 30, fadePct: 0.5});
		
		
		
		for (let i = 0; i < 2; i += 1) {
			let pos = {x: this.sprite.position.x, y: this.sprite.position.y};
			pos.x += util.randInt(-10, 10);
			pos.y += util.randInt(-10, 10);
			gs.createParticle(pos, {frame: PARTICLE_FRAMES.WHITE, duration: 15, fadePct: 0.5});
		}
		
	}
		
	this.updateSpriteFacing();
	this.updateSpriteVisibility();
	this.updateUIFrame();
	this.processPopUpText();
	this.eventQueue.updateFrame();
};

// UPDATE_SPRITE_FACING:
// ************************************************************************************************
Character.prototype.updateSpriteFacing = function () {
	// Update sprite facing (some characters never face):
	if (this.body.facing === 'RIGHT' || this.type.dontFace) {
		this.sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
		
		if (this.type.niceName === 'The Wizard Yendor' && this.baseSprite) {
			this.baseSprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
		}
	} 
	else {
		this.sprite.scale.setTo(-SCALE_FACTOR, SCALE_FACTOR);
		
		if (this.type.niceName === 'The Wizard Yendor' && this.baseSprite) {
			this.baseSprite.scale.setTo(-SCALE_FACTOR, SCALE_FACTOR);
		}
	}
	
	// Tentacle Special Case:
	if (this.type.name === 'Tentacle') {
		// Facing Left:
		if (this.tileIndex.x > gs.getCharWithID(this.summonerId).tileIndex.x) {
			this.sprite.scale.setTo(-SCALE_FACTOR, SCALE_FACTOR);
		}
		// Facing Right:
		else {
			this.sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
		}
	}
};

// UPDATE_SPRITE_VISIBILITY:
// ************************************************************************************************
Character.prototype.updateSpriteVisibility = function () {
	// Set sprite visibility based on visibility of tile (Player is always visible):
	// Must test if gs.pc exists to know if we are in a randomMap i.e menu screen
	if (gs.pc) {
		if (this.name === 'GobletShield') {
			this.setVisible(false);
		}
		else if (this.isAlive && gs.pc.canSeeCharacter(this) || this === gs.pc) {
			gs.setSpriteKey(this.sprite, 'Tileset');
			this.setVisible(true);
		}
		else if (this.isSpriteDarkVisible()) {
			gs.setSpriteKey(this.sprite, 'DarkTileset');
			this.setVisible(true);
		}
		else {
			this.setVisible(false);
		}
		
	}
	// Random maps:
	else {
		gs.setSpriteKey(this.sprite, 'Tileset');
		this.setVisible(true);
	}
	
	// Non-hostile mobs hide their interface sprites:
	let hideInterface = this.type.hideInterface ||
						this.faction === FACTION.NEUTRAL || 
						(this.faction === FACTION.DESTRUCTABLE && this.type.name !== 'HellPortal') ||
						this.type.name === 'GobletShield';
	
	
	if (hideInterface) {
		// Text:
		if (gs.globalData.useHPText) {
			this.hpText.visible = false;
			
			if (this.mpText) {
				this.mpText.visible = false;
			}
		}
		// Bar:
		else {
			this.hpBar.visible = false;
			this.hpBarRed.visible = false;
		}
		
		this.statusText.visible = false;
		this.ringSprite.visible = false;
	}
};

// IS_SPRITE_DARK_VISIBLE:
// Returns true if the sprite should be displayed as visible but dark
// ************************************************************************************************
Character.prototype.isSpriteDarkVisible = function () {
	let immobileVisible = this.type.isImmobile && this.type.name !== 'WarEngine' && gs.getTile(this.tileIndex).explored;
	
	return this.isAlive && (immobileVisible || this.isAgroed);
};

// UPDATE_SPRITE_FRAME:
// ************************************************************************************************
Character.prototype.updateSpriteFrame = function () {
	// Hide In Shell:
	if (this.statusEffects.has('HideInShell')) {
		this.sprite.frame = this.type.shellFrame;
	}
	// Retract and Repair:
	else if (this.statusEffects.has('RetractAndRepair')) {
		this.sprite.frame = this.type.retractFrame;
	}
	// Shields Up:
	else if (this.statusEffects.has('NPCShieldsUp')) {
		this.sprite.frame = this.type.shieldsUpFrame;
	}
	// Rotate Aim:
	else if (this.type.rotateAim) {
		this.rotateToFace();
	}
	// Small Frames:
	else if (util.inArray(this.type.name, ['Slime', 'CorrosiveSlime', 'AcidicSlime', 'IndigoSlime'])) {
		if (this.currentHp > this.maxHp * 0.75) {
			this.sprite.frame = this.type.frame;
		}
		else if (this.currentHp > this.maxHp * 0.50) {
			this.sprite.frame = this.type.smallFrame;
		}
		else if (this.currentHp > this.maxHp * 0.25) {
			this.sprite.frame = this.type.smallFrame + 1;
		}
		else {
			this.sprite.frame = this.type.smallFrame + 2;
		}
	}
	// Base Frame:
	else {
		this.sprite.frame = this.type.frame;
	}
};

// SET_VISIBLE:
// ************************************************************************************************
Character.prototype.setVisible = function (bool) {
	// Sprite:
	this.sprite.visible = bool;
	
	// Base Sprite:
	if (this.baseSprite) {
		this.baseSprite.visible = bool;
	}
	
	// Light:
	if (this.light) {
		this.light.sprite.visible = bool;
	}
	
	// UI:
	this.setUIVisible(bool);
};

// SET_SPRITE_ANGLE:
// CharacterTypes can set 90, 180, 270, and 0 frames
// Defaults to just rotating
// ************************************************************************************************
Character.prototype.setSpriteAngle = function (angle) {
	
	if (angle === 0) {
		if (this.type.sprite0) {
			this.sprite.frame = this.type.sprite0;
		}
		else {
			this.sprite.angle = 0;
		}
	}
	
	if (angle === 90) {
		if (this.type.sprite90) {
			this.sprite.frame = this.type.sprite90;
		}
		else {
			this.sprite.angle = 90;
		}
	}
	
	if (angle === 180) {
		if (this.type.sprite180) {
			this.sprite.frame = this.type.sprite180;
		}
		else {
			this.sprite.angle = 180;
		}
	}
	
	if (angle === 270) {
		if (this.type.sprite270) {
			this.sprite.frame = this.type.sprite270;
		}
		else {
			this.sprite.angle = 270;
		}
	}
};


// ON_ENTER_TILE:
// Called once the character has actually finished moving and entered the tile
// Note that his tileIndex is already correct as it was set when beginning the move
// ************************************************************************************************
Character.prototype.onEnterTileBase = function () {
	
	// Fall down pit:
	if (gs.isPit(this.tileIndex) && !this.isFlying) {
		this.fallDownPit();
	}
	
	// Step on object if it exists:
	if (gs.getObj(this.tileIndex)) {
		gs.getObj(this.tileIndex).stepOn(this);
	}
	
	// Enter Effect:
	if (gs.getCloud(this.tileIndex)) {
		gs.getCloud(this.tileIndex).stepOn(this);
	}
	
	this.updateTerrainEffects();
};

// IS_TILE_INDEX_UNSTABLE:
// Is the tileIndex unstable, for the character calling the function:
// ************************************************************************************************
Character.prototype.isTileIndexUnstable = function (tileIndex) {
	// Unstable Objects:
	if (gs.getObj(this.tileIndex, obj => obj.type.hasOwnProperty('isUnstable') && this.size <= obj.type.isUnstable)
			&& !this.type.isUnstableImmune // Spiders
			&& !this.isFlying) {
		return true;
	}
	
	// Liquid:
	if (gs.isUncoveredLiquid(this.tileIndex) && !this.isFlying && !this.type.canSwim) {
		return true;
	}
	
	return false;
};

// HEAL_HP:
// ************************************************************************************************
Character.prototype.healHp = function (amount) {
	if (this.isAlive) {
		this.currentHp += amount;
		this.currentHp = Math.min(this.currentHp, this.maxHp);
		
		// Shield-Wall and Berserk:
		if (this === gs.pc) {
			this.updateShieldWall();
			this.updateBerserk();
		}
		
	}
	
};

// CURE:
// Called from healing effects to cure poison, infection etc.
// ************************************************************************************************
Character.prototype.cure = function () {
	this.poisonDamage = 0;
	this.statusEffects.onCure();
	
};

// MENTAL_CURE:
// ************************************************************************************************
Character.prototype.mentalCure = function () {
	this.statusEffects.onMentalCure();
};

// RESTORE_MP:
// ************************************************************************************************
Character.prototype.restoreMp = function (amount) {
	this.currentMp += amount;
	this.currentMp = Math.min(this.currentMp, this.maxMp);
};

// RESTORE_SP:
// ************************************************************************************************
Character.prototype.restoreSp = function (amount) {
	this.currentSp += amount;
	this.currentSp = Math.min(this.currentSp, this.maxSp);
};

// LOSE_MP:
// ************************************************************************************************
Character.prototype.loseMp = function (amount) {
	this.currentMp -= amount;
	this.currentMp = Math.max(0, this.currentMp);
};

// RESET_ALL_COOLDOWNS:
// ************************************************************************************************
Character.prototype.resetAllCoolDowns = function () {
	this.abilities.resetAllCoolDowns();
};

// HAS_COOL_DOWN:
// ************************************************************************************************
Character.prototype.hasCoolDown = function () {
	return this.abilities.hasCoolDown();
};


// ADD_POISON_DAMAGE:
// ************************************************************************************************
Character.prototype.addPoisonDamage = function (amount) {
	if (this.isPoisonImmune) {
		this.popUpText('Immune to Poison!');
	}
	else if (util.frac() < this.resistance.Toxic) {
		this.popUpText('Resisted Poison!');
	}
	else {
		this.popUpText('Poisoned!', 'Red');
		this.poisonDamage += amount;
		this.poisonDamage = Math.min(this.poisonDamage, this.maxHp);
	}
};

// TAKE_DAMAGE:
// Flags: isCrit, neverCrit, noMitigation, attackType = {'DamageShield'}, noDiscord
// neverBlink:bool (use when applying knockback to stop enemies from blinking)
// ************************************************************************************************
Character.prototype.takeDamage = function (amount, damageType, flags = {}) {
	var isCrit = false,
		critMultiplier;
	
	this.updateStats();
	
	if (this === gs.pc) {
		critMultiplier = CRIT_MULTIPLIER;
	}
	else {
		critMultiplier = gs.pc.critMultiplier;
	}
	
	if (this.isDamageImmune || !this.isAlive) {
		return 0;
	}
	
	// Discord Damage Multiplier:
	if (this.damageMultiplier && !flags.noDiscord) {
		amount = Math.ceil(amount * this.damageMultiplier);
	}
	
	// Unaware Crit (sneak attack):
	if (flags.killer === gs.pc && this !== gs.pc && (!this.isAgroed || this.isAsleep) && this.faction === FACTION.HOSTILE) {
		amount = Math.round(amount * critMultiplier);
		isCrit = true;
	}
	
    // Reduce fire damage when wet:
	if (damageType === DAMAGE_TYPE.FIRE && this.isWet) {
		amount = Math.ceil(amount * 0.25);
		flags.neverCrit = true;
	}
	
	// Flammable Crit:
	if (damageType === DAMAGE_TYPE.FIRE && this.isFlammable) {
		amount = Math.round(amount * critMultiplier);
		isCrit = true;
	}
	
	// Wet Shock:
    if (damageType === DAMAGE_TYPE.SHOCK && this.isWet) {
		amount = Math.round(amount * critMultiplier);
		isCrit = true;
    }
    
	// Unstable Crit:
	if (damageType === DAMAGE_TYPE.PHYSICAL && this.isUnstable) {
		amount = Math.round(amount * critMultiplier);
		isCrit = true;
	}
	
	// Any attacker can force a crit hit:
	if (flags.isCrit) {
		amount = Math.round(amount * critMultiplier);
		isCrit = true;
	}
	
	// DAMAGE_TYPE.NONE: always max damage
	if (damageType === DAMAGE_TYPE.NONE) {
		// None damage type is always max damage
	}
	// 0.5 - 1.0 Random Damage
	else {
		amount = Math.floor(amount * 0.50) + util.randInt(1, Math.ceil(amount * 0.50));
	}
	
    // Defense mitigates damage:
	if (!flags.noMitigation) {
		amount = this.mitigateDamage(amount, damageType);
	}
	
	// Killing Strikes:
	let isKillingStrike = flags.killer === gs.pc
		&& gs.pc.talents.getTalentRank('KillingStrikes') > 0
		&& damageType === DAMAGE_TYPE.PHYSICAL
		&& flags.attackType !== 'DamageShield'
		&& this.currentHp / this.maxHp <= gs.talents.KillingStrikes.attributes.hpPercent[gs.pc.talents.getTalentRank('KillingStrikes')];
	
	// Pop Up Text:
	if (isKillingStrike) {
		this.popUpText('Kill Strike!', 'Red');
		amount = this.currentHp;
	}
	// Crit:
	else if (isCrit) {
		this.popUpText('Crt ' + amount, 'Red');
	}
	// Damage Shield:
	else if (flags.attackType === 'DamageShield') {
		this.popUpText('DS ' + amount, 'Red');
	}
	// Damage:
	else {
		this.popUpText(amount, 'Red');
	}
	
	// Achievements:
	if (this === gs.pc && amount >= 100) {
		achievements.get('STONE_WALL');
	}
	if (this !== gs.pc && amount >= 100 && flags.killer === gs.pc) {
		achievements.get('ONE_PUNCH');
	}
	if (this === gs.pc && amount > 0) {
		this.isUntouchable = false;
	}


    // Cap damage to currentHp (for lifetaps):
	let cappedAmount = Math.min(amount, this.currentHp);

    // Apply damage:
	if (!(this === gs.pc && gs.debugProperties.disableDamage)) {
		// Spirit Shield:
		if (this.hasSpiritShield) {
			let mp = Math.min(this.currentMp, Math.floor(amount / 2));
			this.currentMp -= mp;
			amount -= mp;
		}
		
		// Shield of Ice:
		if (this.statusEffects.has('ShieldOfIce') && !util.inArray(flags.killer, ['Poison', 'Hunger', 'Cannibalise'])) {
			if (amount > this.statusEffects.get('ShieldOfIce').duration) {
				amount -= this.statusEffects.get('ShieldOfIce').duration;
				this.statusEffects.remove('ShieldOfIce');
			}
			else {
				this.statusEffects.get('ShieldOfIce').duration -= amount;
				amount = 0;
			}
		}
		
		this.currentHp -= amount;
	}
	
    // Hit Sound:
	if (this.currentHp > 0) {
		if (isCrit) {
			gs.playSound(gs.sounds.playerHit, this.tileIndex);
			//gs.playSound(gs.sounds.death, this.tileIndex);
		}
		else {
			gs.playSound(gs.sounds.playerHit, this.tileIndex);
		}
	}
	
    // Death:
	if (this.currentHp <= 0) {
		if (flags.killer && flags.killer.onKill) {
			flags.killer.onKill(this);
		}
		else if (this !== gs.pc) {
			gs.pc.onKill(this);
		}
		
		this.death(damageType, flags);
	}
	
	// Blood splatter:
	if (isCrit && this.isAlive && !this.type.noBlood && util.frac() < 0.25) {
		this.bloodSplatter();
	}
    
    this.onTakeDamage(flags);
	this.statusEffects.onTakeDamage(damageType, amount, flags);
	
	// Remove ambient cold:
	if (damageType === DAMAGE_TYPE.FIRE) {
		this.coldLevel = 0;
	}

	return cappedAmount;
};

// BLOOD_SPLATTER:
// When a critical hit lands we splatter some blood randomly
// ************************************************************************************************
Character.prototype.bloodSplatter = function () {
	// These races do not bleed:
	if (this === gs.pc && util.inArray(gs.pc.race.name, ['Vampire', 'Gargoyle', 'Mummy'])) {
		return;
	}
	
	var indexList = gs.getIndexListInRadius(this.tileIndex, 1.5);
	indexList = indexList.filter(index => gs.getTile(index).type.passable === 2 && !gs.isPit(index));
	indexList = indexList.filter(index => !gs.getObj(index));
	indexList = indexList.filter(index => !util.vectorEqual(index, gs.pc.tileIndex));
	indexList = indexList.filter(index => !gs.getChar(index) || !gs.getChar(index).isDamageImmune);
	
	if (indexList.length > 0) {
		gs.createObject(util.randElem(indexList), this.type.bloodTypeName);
	}
};

// IS_HOSTILE_TO_ME:
// ************************************************************************************************
Character.prototype.isHostileToMe = function (character) {
	if (character === this) {
		return false;
	}
	else if (character.isDamageImmune) {
		return false;
	}
	else if (this.isConfused && character.faction !== FACTION.NEUTRAL && character.faction !== FACTION.DESTRUCTABLE) {
		return true;
	}
	else if (this.faction === FACTION.PLAYER && character.faction === FACTION.HOSTILE) {
		return true;
	}
	else if (this.faction === FACTION.HOSTILE && character.faction === FACTION.PLAYER) {
		return true;
	}
	else {
		return false;
	}
};

// CAN_SEE_CHARACTER:
// ************************************************************************************************
Character.prototype.canSeeCharacter = function (character) {
	var isCharVisible;
	
	// Need to determine if the char himself is visible:
	isCharVisible = !character.isHidden || this.isTelepathic;
		
	return (gs.getTile(util.toTileIndex(character.body.position)).visible && isCharVisible)
		|| util.distance(character.tileIndex, this.tileIndex) < 1.5;
};

// UPDATE_CHARACTER_FRAMES:
// ************************************************************************************************
gs.updateCharacterFrames = function () {
    for (let i = 0; i < this.characterList.length; i += 1) {
        if (this.characterList[i].isAlive) {
            this.characterList[i].updateFrame();
        }
    }
};

// ATTACK_RESULT:
// When dealing physical damage, call this function to determine if the attack actually landed.
// Will return {'HIT', 'MISS', 'CRITICAL'}
// This should be called before takeDamage is called (so that missed projectilces can continue on their course)
// type = 'Range', 'Melee'
// ************************************************************************************************
Character.prototype.attackResult = function (attacker, type, neverMiss = false) {
    var result = util.frac(), blockChance;
	
	if (type !== 'Range' && type !== 'Melee') {
		throw 'Invalid attack type: ' + type;
	}
	
	// Weapon Shield:
	if (this.statusEffects.has('WeaponShield')) {
		return 'PARRY';
	}
	
	// Parry:
	if (type === 'Melee' && util.frac() <= this.parryChance) {
		return 'PARRY';
	}
	
	// Block:
	if (util.frac() <= this.blockChance) {
		return 'BLOCK';
	}
	
	// Evade:
	if (this.canDodge() && !neverMiss && util.frac() <= this.evasion) {
		return 'MISS';
	}
	
	return 'HIT';
};

// MITIGATE_DAMAGE:
// ************************************************************************************************
Character.prototype.mitigateDamage = function (amount, damageType) {
	// 'None' damageType is unmitigatable
	if (damageType === DAMAGE_TYPE.NONE) {
		return amount;
	}
	
	// Protection Mitigation:
	if (damageType === DAMAGE_TYPE.PHYSICAL) {
		amount -= util.randInt(0, this.protection);
	}
	// Resistance Mitigation
	else if (this.resistance[damageType] > 0) {
		let maxMitigate = amount * this.resistance[damageType];
		
		amount -= Math.floor(maxMitigate / 2) + util.randInt(1, Math.ceil(maxMitigate / 2));
	}
	// Resistance Vulnerability:
	else if (this.resistance[damageType] < 0) {
		let maxVuln = amount * Math.abs(this.resistance[damageType]);
		
		amount += Math.floor(maxVuln / 2) + util.randInt(1, Math.ceil(maxVuln / 2));
	}
    	
    // Round and cap:
    amount = Math.round(amount);
	
	if (util.frac() < this.noDamageChance(amount)) {
		amount = Math.max(0, amount);
	}
	else {
		amount = Math.max(1, amount);
	}
    
	return amount;
};

// NO_DAMAGE_CHANCE:
// Chance increases the more negative amount is (more damage was blocked):
// ************************************************************************************************
Character.prototype.noDamageChance = function (amount) {
	if (amount > 0) {
		return 0;
	}
	
	return Math.min(0.9, Math.abs(amount) * 0.10);
};

// IS_VULNERABLE_TO_DAMAGE_SHIELD
// ************************************************************************************************
Character.prototype.isVulnerableToDamageShield = function () {
	// All monsters are vulnerable to DS
	if (this !== gs.pc) {
		return true;
	}
	else {
		return this.inventory.getPrimaryWeapon().type.attackEffect !== gs.weaponEffects.PoleArm
			&& !this.isDSImmune;
	}
	
};

// MELEE_ATTACK:
// A general purpose function whenever one character attacks another with melee
// Handles MISS, HIT and CRITICAL 
// Handles damage shields
// flags: {effectFunc, isCrit, killer, neverMiss, knockBack, noKnockBack}
// effectFunc: has arguments (defender, damage)
// ************************************************************************************************
gs.meleeAttack = function (attacker, tileIndex, weaponEffect, damage, flags = {}) {
    var attackResult, isCrit, damageAmount, knockBack, defender, animPos, animNormal;
	
	weaponEffect = weaponEffect || gs.weaponEffects.Melee;
	
	defender = gs.getChar(tileIndex);
	
	// Overriding damage (used by abilities):
	if (flags.damage) {
		damage = flags.damage;
	}
	
	// In case there is no character at the target tileIndex:
	if (!defender) {
		return;
	}
	
	// Bounce and face:
	attacker.body.faceTileIndex(tileIndex);
	attacker.body.bounceTowards(tileIndex);
	
	
	attackResult = defender.attackResult(attacker, 'Melee');
	isCrit = attackResult === 'CRITICAL' || flags.isCrit || attacker.alwaysCrit;
	knockBack = attacker.knockBackOnHit || flags.knockBack || 0;

	// Reposte (ShieldsUp):
	if (defender.statusEffects.has('ShieldsUp')) {
		defender.shieldsUp(attacker);
	}
	// Reposte (Blade Dancers):
	else if (defender.canReposteAttacker(attacker) && util.frac() <= 0.5) {
		gs.meleeAttack(defender, attacker.tileIndex, null, defender.abilities.abilityInSlot(0).type.attributes.damage.value(defender), {neverMiss: true});
		defender.popUpText('Reposte!', 'White');
	}
	// PARRY:
	else if (attackResult === 'PARRY' && !flags.neverMiss) {
		defender.popUpText('Parry', 'White');
	}
	// BLOCK:
	else if (attackResult === 'BLOCK' && !flags.neverMiss) {
		defender.popUpText('Block', 'White');
		
		// Anim:
		gs.createShieldsUpAnim(defender, attacker.tileIndex);

		// Pause:
		gs.pauseTime = 10;
	}
	// Miss:
	else if (attackResult === 'MISS' && !flags.neverMiss) {
		defender.popUpText('Miss', 'White');
	}
	// Hit or Critical:  
	else {
		// Hit Effect:
		animNormal = util.normal(defender.sprite.position, attacker.sprite.position);
		animPos = {x: defender.sprite.position.x + animNormal.x * 15, y: defender.sprite.position.y + animNormal.y * 15};
		gs.createAnimEffect(animPos, 'Hit');

		// Particles:
		let particleNormal = util.normal(attacker.sprite.position, defender.sprite.position);
		gs.createParticleHit(defender.sprite.position, particleNormal, 'WHITE');

		// Shake Screen:
		game.camera.shake(0.0025, 50);

		// Apply the weapons hitCharacter effect:
		damageAmount = weaponEffect.hitCharacter(defender, damage, {
			killer: 			attacker, 
			isCrit: 			isCrit, 
			damageType: 		flags.damageType,
			noMitigation: 		flags.noMitigation,
			procEffect: 		flags.procEffect,
		});
								  
		// Damage Shield:
		attacker.triggerDamageShield(defender);

		// Knockback:
		if (knockBack > 0 && defender.isAlive && !flags.noKnockBack) {
			defender.body.applyKnockBack(util.normal(attacker.tileIndex, defender.tileIndex), knockBack);
		}

		// Ice Knockback:
		if (gs.getObj(defender.tileIndex, obj => obj.type.isSlippery) && defender.isAlive && !defender.isFlying && !flags.noKnockBack) {
			defender.body.applyKnockBack(util.normal(attacker.tileIndex, defender.tileIndex), 1);
		}

		// Corrision:
		if (defender.type.isCorrosive && attacker === gs.pc && util.frac() < CORRODE_PERCENT) {
			gs.pc.corrodeWeapon();
		}

		// Additional Effect:
		if (flags.effectFunc && defender.isAlive) {
			flags.effectFunc(defender, attacker, damageAmount);
		}
	}
};

// TRIGGER_DAMAGE_SHIELD:
// Call this during melee attacks to trigger damage shields
// ************************************************************************************************
Character.prototype.triggerDamageShield = function (defender) {
	let hasTriggeredDS = false;
	
	if (this.isVulnerableToDamageShield()) {
		DAMAGE_TYPES.forEach(function (damageType) {
			if (defender.damageShield[damageType] > 0) {
				this.takeDamage(defender.damageShield[damageType], damageType, {killer: defender, neverCrit: true, attackType: 'DamageShield'});
				hasTriggeredDS = true;
			}
		}, this);
	}
	
	if (hasTriggeredDS) {
		gs.createShieldsUpAnim(defender, this.tileIndex, 1851);
	}
};

// HAS_DAMAGE_SHIELD:
// ************************************************************************************************
Character.prototype.hasDamageShield = function () {
	let result = false;
	
	DAMAGE_TYPES.forEach(function (damageType) {
		if (this.damageShield[damageType] > 0) {
			result = true;
		}
	}, this);
	
	return result;
};

// SHIELDS_UP:
// ************************************************************************************************
Character.prototype.shieldsUp = function (attacker) {
	// Damage:
	let modifier = gs.abilityTypes.ShieldsUp.attributes.meleeDamageMultiplier.base[this.talents.getTalentRank('ShieldsUp')];
	let damage = Math.ceil(this.weaponDamage() * modifier);
	gs.meleeAttack(this, attacker.tileIndex, this.inventory.getPrimaryWeapon().type.attackEffect, damage, {neverMiss: true});
	
	// Anim:
	gs.createShieldsUpAnim(this, attacker.tileIndex);

	// Pause:
	gs.pauseTime = 10;
};

// CAN_REPOSTE_ATTACKER:
// ************************************************************************************************
Character.prototype.canReposteAttacker = function (attacker) {
	return this.type.reposteAttacks
		&& !this.shouldSkipTurn()
		&& !attacker.statusEffects.has('ShieldsUp') // Never reposte a shields up
		&& (attacker !== gs.pc || gs.pc.inventory.getPrimaryWeapon().type.attackEffect !== gs.weaponEffects.PoleArm);
};

// Overwritten in Player type
Character.prototype.getActiveSummonList = function () {
	return [];
};

// CAN_OPEN_DOOR:
// ************************************************************************************************
Character.prototype.canOpenDoor = function (tileIndex) {
	var door = gs.getObj(tileIndex, obj => obj.isSimpleDoor());
		
	return door 
		&& !door.isOpen
		&& this.type.canOpenDoors;
};

// CAN_DOMINATE:
// ************************************************************************************************
Character.prototype.canDominate = function () {
	return !this.type.isImmobile
		&& !this.type.isMindless
		&& !this.type.isDominateImmune
		&& !this.type.isBoss
		&& !this.statusEffects.has('Domination')
		&& !this.statusEffects.has('ScrollOfDomination');
};

// GET_CHARACTER_WITH_ID:
// Returns the character with the unique ID or null if that character no longer exists.
// It is entirely possible for the character to no longer exist (for example he is dead)
// ************************************************************************************************
gs.getCharWithID = function (id) {
	if (typeof id !== 'number') {
		throw 'getCharWithID: id is not a number';
	}
	
	for (let i = 0; i < this.characterList.length; i += 1) {
		if (this.characterList[i].id === id && this.characterList[i].isAlive) {
			return this.characterList[i];
		}
	}
	
	return null;
};



// GET_ALL_NPCS:
// ************************************************************************************************
gs.getAllNPCs = function () {
	return this.characterList.filter(char => char.isAlive && char !== gs.pc);
};

// GET_ALL_ALLIES:
// ************************************************************************************************
gs.getAllAllies = function () {
	let list = this.characterList;
	list = list.filter(char => char !== this.pc && char.isAlive && char.faction === FACTION.PLAYER);
	list = list.filter(char => !char.isImmobile);
	return list;
};

// GET_HOSTILE_NPC_LIST:
// ************************************************************************************************
gs.getHostileNPCList = function () {
	return gs.getAllNPCs().filter(char => char.faction === FACTION.HOSTILE);
};

// AGROED_HOSTILE_LIST:
// ************************************************************************************************
gs.agroedHostileList = function () {
	return this.characterList.filter(char => char.isAlive && char.faction === FACTION.HOSTILE && char.isAgroed);
};

// FIND_CHAR:
// Find an object anywhere on the current level based on either a predicate or a typeName
// ************************************************************************************************
gs.findChar = function (pred) {
	if (typeof pred === 'string') {
		return gs.liveCharacterList().find(obj => obj.name === pred);
	}
	else {
		return gs.liveCharacterList().find(pred);
	}
};


