/*global game, gs, console, Phaser, util*/
/*global RED_BOX_FRAME, RED_SELECT_BOX_FRAME, FACTION, SAFE_TURNS_TO_STOP_FLEEING, LOS_DISTANCE, DAMAGE_TYPE*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// STATUS_EFFECT_TYPE:
// Status effect instances are cloned from the generic status effect type.
// Instances then overwrite default properties to set unique damage, duration etc.
// ************************************************************************************************
function StatusEffectType () {
	// Default values
	this.duration = 10; 
	this.addDuration = true;
	this.uiSymbol = '';
	this.desc = '';
}

// ON_CREATE:
// ************************************************************************************************
StatusEffectType.prototype.onCreate = function (character) {
	// Pass
};

// ON_UPDATE_TURN:
// Called when the character updates his global turn.
// character: the character who has the status effect.
// ************************************************************************************************
StatusEffectType.prototype.onUpdateTurn = function (character) {
	// Pass
};

// ON_END_TURN:
// ************************************************************************************************
StatusEffectType.prototype.onEndTurn = function (character) {
	// Pass
};

// ON_KILL:
// ************************************************************************************************
StatusEffectType.prototype.onKill = function (character) {
	// Pass
};

// ON_UPDATE_STATS:
// Called when the player is updating his stats.
// character: the character who has the status effect.
// ************************************************************************************************
StatusEffectType.prototype.onUpdateStats = function (character) {
	// Pass
};

// SHOULD_DESTROY:
// Called when the character updates his global turn and determines if the status effect should be prematurely destroyed.
// ************************************************************************************************
StatusEffectType.prototype.shouldDestroy = function (character) {
	return false; // By default, status effects do not end prematurely
};

// ON_TAKE_DAMAGE:
// Called when the character takes damage
StatusEffectType.prototype.onTakeDamage = function (character, damageType) {
	// Pass
};

// DESTROY:
// Called when the status effect is removed from a character
// Duration ends, character dies, forcibly removed etc.
// character: the character who has the status effect.
// ************************************************************************************************
StatusEffectType.prototype.onDestroy = function (character) {
	// Pass
};


// TO_DATA:
// Serializes the status effect type for saving
// ************************************************************************************************
StatusEffectType.prototype.toData = function () {
	var data = {};
	
	data.typeName = this.name;
	data.properties = {};
	
	// Properties:
	this.propertyList.forEach(function (key) {
		data.properties[key] = this[key];
	}, this);
	
	return data;
};

// TO_SHORT_DESC:
// The short name + duration that shows up on the HUD
// ************************************************************************************************
StatusEffectType.prototype.toShortDesc = function () {
	var str = gs.capitalSplit(this.name);
	
	if (this.duration > 1 && !this.noDuration) {
		str += ': ' + this.duration;
	}
	
	return str;
};

// TO_LONG_DESC:
// Fills the players chat box when mousing over the status effect.
// ************************************************************************************************
StatusEffectType.prototype.toLongDesc = function () {
	var desc = {}, str = '';
	
	desc.title = gs.capitalSplit(this.name) + ':';
	
	if (this.duration > 1 && !this.noDuration && this.name !== 'ShieldOfIce' && this.name !== 'BloodLust') {
		str += 'Duration: ' + this.duration + '\n\n';
	}
	
	if (typeof this.desc === 'function') {
		str += this.desc();
	}
	else {
		str += this.desc;
	}
	
	
	desc.text = str;
			
	return desc;
};


// CREATE_STATUS_EFFECT_TYPES:
// ************************************************************************************************
gs.createStatusEffectTypes = function () {
	this.statusEffectTypes = {};
	
	// HIDE_IN_SHELL:
	// ********************************************************************************************
	this.statusEffectTypes.HideInShell = new StatusEffectType();
	this.statusEffectTypes.HideInShell.duration = 5;
	this.statusEffectTypes.HideInShell.onUpdateTurn = function (character) {
		let amount = Math.ceil(character.maxHp * 0.1);
		character.healHp(amount);
		character.popUpText('+' + amount + ' HP', 'Green');
	};
	this.statusEffectTypes.HideInShell.onUpdateStats = function (character) {
		character.protection += 6;
		character.isImmobile += 1;
	};
	this.statusEffectTypes.HideInShell.shouldDestroy = function (character) {
		return character.currentHp >= character.maxHp * 0.9;
	};
	
	// RETRACT_AND_REPAIR:
	// ********************************************************************************************
	this.statusEffectTypes.RetractAndRepair = new StatusEffectType();
	this.statusEffectTypes.RetractAndRepair.duration = 4;
	this.statusEffectTypes.RetractAndRepair.onUpdateTurn = function (character) {
		let amount = Math.ceil(character.maxHp * 0.10);
		character.healHp(amount);
		character.popUpText('+' + amount + ' HP', 'Green');
	};
	this.statusEffectTypes.RetractAndRepair.onUpdateStats = function (character) {
		character.isDamageImmune += 1;
		character.isStunned += 1;
	};
	this.statusEffectTypes.RetractAndRepair.shouldDestroy = function (character) {
		return character.currentHp >= character.maxHp * 0.9;
	};
	
	
	
	// CHARM:
	// Cast by player on NPCs, converts the NPC to the players faction.
	// ********************************************************************************************
	this.statusEffectTypes.Charm = new StatusEffectType();
	this.statusEffectTypes.Charm.duration = 10;
	this.statusEffectTypes.Charm.onDestroy = function (character) {
		character.faction = FACTION.HOSTILE;
	};
	this.statusEffectTypes.Charm.dontPopUpText = true;
	
	// DOMINATION:
	// Talent form of the status effect that permanently turns the NPC into an ally
	// ********************************************************************************************
	this.statusEffectTypes.Domination = new StatusEffectType();
	this.statusEffectTypes.Domination.noDuration = true;
	
	// SCROLL_OF_DOMINATION:
	// Scroll form of the status effect that permanently turns the NPC into an ally
	// ********************************************************************************************
	this.statusEffectTypes.ScrollOfDomination = new StatusEffectType();
	this.statusEffectTypes.ScrollOfDomination.noDuration = true;
	this.statusEffectTypes.ScrollOfDomination.niceName = 'Domination';

	
	// DRAINING:
	// ********************************************************************************************
	this.statusEffectTypes.Draining = new StatusEffectType();
	this.statusEffectTypes.Draining.duration = 50;
	this.statusEffectTypes.Draining.addDuration = true;
	this.statusEffectTypes.Draining.desc = 'You are unable to regenerate HP or MP.';
	
	
	// DEEP_SLEEP:
	// ********************************************************************************************
	this.statusEffectTypes.DeepSleep = new StatusEffectType();
	this.statusEffectTypes.DeepSleep.duration = 20;
	this.statusEffectTypes.DeepSleep.neverOnPlayer = true;
	this.statusEffectTypes.DeepSleep.onCreate = function (character) {
		// Agro the character:
		character.isAgroed = true;
		
		// Remove Constrict:
		if (character.statusEffects.has('Constricting')) {
			character.statusEffects.remove('Constricting');
		}
		
		// Remove Berserk:
		if (character.statusEffects.has('NPCBerserk')) {
			character.statusEffects.remove('NPCBerserk');
		}
		
		// Remove Charge:
		if (character.statusEffects.has('SlowCharge')) {
			character.statusEffects.remove('SlowCharge');
		}
	};
	
	this.statusEffectTypes.DeepSleep.onUpdateStats = function (character) {
		character.isAsleep = true;
	};
	this.statusEffectTypes.DeepSleep.onTakeDamage = function (character, damageType) {
		character.statusEffects.remove('DeepSleep');
	};
	this.statusEffectTypes.DeepSleep.onDestroy = function (character) {
		// Enemies wake up when sleep wears off:
		character.isAsleep = false;
	};
	
	// SLOW_CHARGE:
	// ********************************************************************************************
	this.statusEffectTypes.SlowCharge = new StatusEffectType();
	this.statusEffectTypes.SlowCharge.noDuration = true;
	this.statusEffectTypes.SlowCharge.niceName = 'Charge';
	this.statusEffectTypes.SlowCharge.onUpdateStats = function (character) {
		character.isSlowProjectile += 1;
		character.movementSpeed += 2;
		character.knockBackOnHit += 2;
	};
	this.statusEffectTypes.SlowCharge.niceName = 'Charge';
	this.statusEffectTypes.SlowCharge.shouldDestroy = function (character) {
		if (util.distance(character.tileIndex, this.startTileIndex) > util.distance(this.startTileIndex, this.targetTileIndex) &&
			util.distance(character.tileIndex, this.targetTileIndex) > 4) {
			
			character.waitTime = 200;
			
			return true;
		}
		else {
			return false;
		}
	};
	
	// WET:
	// ********************************************************************************************
	this.statusEffectTypes.Wet = new StatusEffectType();
	this.statusEffectTypes.Wet.onUpdateStats = function (character) {
		character.isWet = true;
	};
	this.statusEffectTypes.Wet.onUpdateTurn = function (character) {
		if (gs.zoneType().isCold) {
			character.coldTimer += 2;
		}
	};
	this.statusEffectTypes.Wet.noDuration = true;
	this.statusEffectTypes.Wet.dontPopUpText = true;
	this.statusEffectTypes.Wet.desc = 'You will take double damage from all electric attacks and half damage from fire.';
	
	// FLAMMABLE:
	// ********************************************************************************************
	this.statusEffectTypes.Flammable = new StatusEffectType();
	this.statusEffectTypes.Flammable.onUpdateStats = function (character) {
		character.isFlammable = true;
	};
	this.statusEffectTypes.Flammable.noDuration = true;
	this.statusEffectTypes.Flammable.addDuration = false;
	this.statusEffectTypes.Flammable.dontPopUpText = true;
	this.statusEffectTypes.Flammable.desc = 'You will take double damage from all fire attacks.';
	
	
	
	// UNSTABLE:
	// ********************************************************************************************
	this.statusEffectTypes.Unstable = new StatusEffectType();
	this.statusEffectTypes.Unstable.onUpdateStats = function (character) {
		character.isUnstable += 1;
	};
	this.statusEffectTypes.Unstable.noDuration = true;
	this.statusEffectTypes.Unstable.addDuration = false;
	this.statusEffectTypes.Unstable.dontPopUpText = true;
	this.statusEffectTypes.Unstable.desc = 'Your unstable footing will cause you to be critically hit by all physical attacks.\n\nYou will also be unable to dodge attacks.';
	
	// IMMOBILE:
	// ********************************************************************************************
	this.statusEffectTypes.Immobile = new StatusEffectType();
	this.statusEffectTypes.Immobile.onCreate = function (character) {
		if (character.statusEffects.has('DashAttack')) {
			character.statusEffects.remove('DashAttack');
		}
	};
	this.statusEffectTypes.Immobile.onUpdateStats = function (character) {
		character.isUnstable += 1;
		character.isImmobile += 1;
	};
	this.statusEffectTypes.Immobile.duration = 5;
	this.statusEffectTypes.Immobile.addDuration = false;
	this.statusEffectTypes.Immobile.desc = 'You are unable to move ad will be critically hit by all physical attacks.\n\nYou will also be unable to dodge attacks.';
	
	// CONSTRICTING:
	// When a character constricts another character, he adds this status effect to himself to prevent himself from moving
	// ********************************************************************************************
	this.statusEffectTypes.Constricting = new StatusEffectType();
	this.statusEffectTypes.Constricting.duration = 5;
	this.statusEffectTypes.Constricting.addDuration = false;
	this.statusEffectTypes.Constricting.dontPopUpText = true;
	this.statusEffectTypes.Constricting.onUpdateStats = function (character) {
		character.isImmobile += 1;
	};
	this.statusEffectTypes.Constricting.shouldDestroy = function (character) {
		var targetChar = gs.getCharWithID(this.targetCharId);
		return !targetChar || util.distance(character.tileIndex, targetChar.tileIndex) > 1.5; 
	};
	this.statusEffectTypes.Constricting.onDestroy = function (character) {
		var targetChar = gs.getCharWithID(this.targetCharId);
		
		if (targetChar) {
			targetChar.statusEffects.remove('Constricted');
		}
	};
	
	// CONSTRICTED:
	// ********************************************************************************************
	this.statusEffectTypes.Constricted = new StatusEffectType();
	this.statusEffectTypes.Constricted.duration = 5;
	this.statusEffectTypes.Constricted.addDuration = true;
	this.statusEffectTypes.Constricted.onUpdateStats = function (character) {
		character.isImmobile += 1;
		character.isUnstable += 1;
	};
	this.statusEffectTypes.Constricted.shouldDestroy = function (character) {
		var constrictingChar = gs.getCharWithID(this.casterId);
		return !constrictingChar || util.distance(character.tileIndex, constrictingChar.tileIndex) > 1.5; 
	};
	this.statusEffectTypes.Constricted.onDestroy = function (character) {
		var constrictingChar = gs.getCharWithID(this.casterId);
		
		if (constrictingChar) {
			constrictingChar.statusEffects.remove('Constricting');
		}
	};
	this.statusEffectTypes.Constricted.desc = function () {
		var constrictingChar = gs.getCharWithID(this.casterId);
		
		let str = 'You have been Constricted by ';
		
		if (!constrictingChar.isBoss) {
			str += 'a ';
		}
		
		str += gs.capitalSplit(constrictingChar.name);
		
		str += ' and are unable to move!\n\n';
		
		str += 'All physical attacks made against you will be critical hits!';
		
		return str;
	};
	
	
	
	// FEARED:
	// ********************************************************************************************
	this.statusEffectTypes.Feared = new StatusEffectType();
	this.statusEffectTypes.Feared.duration = 10;
	this.statusEffectTypes.Feared.addDuration = true;
	this.statusEffectTypes.Feared.onCreate = function (character) {
		if (character.statusEffects.has('Constricting')) {
			character.statusEffects.remove('Constricting');
		}
	};
	this.statusEffectTypes.Feared.onUpdateStats = function (character) {
		character.isFeared += 1;
	};
	
	// FLEEING:
	// ********************************************************************************************
	this.statusEffectTypes.Fleeing = new StatusEffectType();
	this.statusEffectTypes.Fleeing.duration = 10;
	this.statusEffectTypes.Fleeing.safeTurnsCount = 0;
	this.statusEffectTypes.Fleeing.onUpdateStats = function (character) {
		character.isFeared += 1;
	};
	this.statusEffectTypes.Fleeing.onUpdateTurn = function (character) {
		if (!gs.getTile(character.tileIndex).visible) {
			this.safeTurnsCount += 1;
		}
		else {
			this.safeTurnsCount = 0;
		}
	};
	this.statusEffectTypes.Fleeing.shouldDestroy = function (character) {
		return character.currentHp >= character.maxHp * 0.5 || this.safeTurnsCount >= SAFE_TURNS_TO_STOP_FLEEING;
	};
	this.statusEffectTypes.Fleeing.onDestroy = function (character) {
		if (character.canStartRunning()) {
			character.isAgroed = false;
		}
	};
	
	
	
	
	
	
	// EXPERIENCE_BOOST:
	// ********************************************************************************************
	this.statusEffectTypes.ExperienceBoost = new StatusEffectType();
	this.statusEffectTypes.ExperienceBoost.onUpdateStats = function (character) {
			character.bonusExpMod += 1.0;
	};
	this.statusEffectTypes.ExperienceBoost.duration = 100;
	this.statusEffectTypes.ExperienceBoost.addDuration = true;
	this.statusEffectTypes.ExperienceBoost.desc = 'Doubles the experience you gain from killing enemies.';
	
	// REGENERATION:
	// ********************************************************************************************
	this.statusEffectTypes.Regeneration = new StatusEffectType();
	this.statusEffectTypes.Regeneration.duration = 50;
	this.statusEffectTypes.Regeneration.onUpdateTurn = function (character) {
		character.healHp(1);
	};
	this.statusEffectTypes.Regeneration.addDuration = true;
	this.statusEffectTypes.Regeneration.desc = 'Heals you for 1HP per turn.';
	
	// RESTORATION:
	// ********************************************************************************************
	this.statusEffectTypes.Restoration = new StatusEffectType();
	this.statusEffectTypes.Restoration.duration = 50;
	this.statusEffectTypes.Restoration.onUpdateTurn = function (character) {
		if (gs.turn % 2 === 0) {
			character.restoreMp(1);
		}
		
	};
	this.statusEffectTypes.Restoration.addDuration = true;
	this.statusEffectTypes.Restoration.desc = 'Restores 1MP every 2 Turns.';
	
	// STUNNED:
	// ********************************************************************************************
	this.statusEffectTypes.Stunned = new StatusEffectType();
	this.statusEffectTypes.Stunned.onUpdateStats = function (character) {
			character.isStunned += 1;
	};
	this.statusEffectTypes.Stunned.duration = 3;
	this.statusEffectTypes.Stunned.addDuration = true;
	
	// WEBBED:
	// ********************************************************************************************
	this.statusEffectTypes.Webbed = new StatusEffectType();
	this.statusEffectTypes.Webbed.duration = 3;
	this.statusEffectTypes.Webbed.addDuration = false;
	this.statusEffectTypes.Webbed.destroyOnZoning = true;
	this.statusEffectTypes.Webbed.frame = 1730;
	this.statusEffectTypes.Webbed.onUpdateStats = function (character) {
		character.isUnstable += 1;
		character.isImmobile += 1;
	};
	this.statusEffectTypes.Webbed.onCreate = function (character) {
		// Sprite:
		this.sprite = gs.createSprite(0, 0, 'Tileset', gs.projectileSpritesGroup);
    	this.sprite.anchor.setTo(0.5, 0.5);
    	this.sprite.frame = this.frame;
		this.sprite.scale.setTo(1, 1);
		character.sprite.addChild(this.sprite);
		
		// Remember the tileIndex in which the character was webbed so can remove:
		this.startTileIndex = {x: character.tileIndex.x, y: character.tileIndex.y};
	};
	this.statusEffectTypes.Webbed.shouldDestroy = function (character) {
		return !util.vectorEqual(character.tileIndex, this.startTileIndex);
	};
	this.statusEffectTypes.Webbed.onDestroy = function (character) {
		this.sprite.destroy();	
	};
	this.statusEffectTypes.Webbed.onTakeDamage = function (character, damageType, flags) {
		if (damageType === DAMAGE_TYPE.FIRE && flags.attackType !== 'DamageShield') {
			character.statusEffects.remove(this.name);
		}
	};
	this.statusEffectTypes.Webbed.desc = 'You are unable to move and will be critically hit by all physical attacks.';

		
	// NETTED:
	// ********************************************************************************************
	this.statusEffectTypes.Netted = Object.create(this.statusEffectTypes.Webbed);
	this.statusEffectTypes.Netted.frame = 1738;
	
	// FROZEN:
	this.statusEffectTypes.Frozen = Object.create(this.statusEffectTypes.Webbed);
	this.statusEffectTypes.Frozen.frame = 1642;
	this.statusEffectTypes.Frozen.onUpdateStats = function (character) {
		character.isUnstable += 1;
		character.isImmobile += 1;
		character.isStunned += 1;
	};
	this.statusEffectTypes.Frozen.onCreate = function (character) {		
		// Sprite:
		if (!this.sprite) {			
			this.sprite = gs.createSprite(0, 0, 'Tileset', gs.projectileSpritesGroup);
			this.sprite.anchor.setTo(0.5, 0.5);
			this.sprite.alpha = 0.75;
			this.sprite.frame = this.frame;
			this.sprite.scale.setTo(1, 1);
			character.sprite.addChild(this.sprite);
		}
		
		// Remember the tileIndex in which the character was webbed so can remove if knocked back
		this.startTileIndex = {x: character.tileIndex.x, y: character.tileIndex.y};
		
		// Remove Constrict:
		if (character.statusEffects.has('Constricting')) {
			character.statusEffects.remove('Constricting');
		}
	};
	
	
	// SLOW:
	// ********************************************************************************************
	this.statusEffectTypes.Slow = new StatusEffectType();
	this.statusEffectTypes.Slow.onUpdateStats = function (character) {
		character.movementSpeed -= 1;
	};
	this.statusEffectTypes.Slow.duration = 5;
	this.statusEffectTypes.Slow.addDuration = false;
	this.statusEffectTypes.Slow.onTakeDamage = function (character, damageType) {
		if (damageType === DAMAGE_TYPE.FIRE) {
			character.statusEffects.remove('Slow');
		}
	};
	this.statusEffectTypes.Slow.desc = 'You are unable to move diagonally or sprint.';

	
	// MARKED:
	// ********************************************************************************************
	this.statusEffectTypes.Marked = new StatusEffectType();
	this.statusEffectTypes.Marked.onUpdateStats = function (character) {
			character.isMarked += 1;
	};
	this.statusEffectTypes.Marked.duration = 10;
	this.statusEffectTypes.Marked.addDuration = false;
	this.statusEffectTypes.Marked.desc = 'You have been magically marked causing all creatures to track you.';


	
	
	// CONFUSION:
	// ********************************************************************************************
	this.statusEffectTypes.Confusion = new StatusEffectType();
	this.statusEffectTypes.Confusion.duration = 5;
	this.statusEffectTypes.Confusion.requiresLoS = true;
	this.statusEffectTypes.Confusion.onUpdateStats = function (character) {
		character.isConfused += 1;
	};
	this.statusEffectTypes.Confusion.desc = function () {
		let casterName = gs.getCharWithID(this.casterId).type.name;
		
		let str = 'You have been confused by ' + gs.capitalSplit(casterName) + '. Breaking line of sight for a few turns will cause the confusion to fade.\n\n';
		
		str += 'While confused you will occasionally move in a random direction and are unable to use abilities.';
		return str;
	};
	
	// NPC_CHARM:
	// Cast by NPCs on the player, stops the player from moving away from the NPC.
	// ********************************************************************************************
	this.statusEffectTypes.NPCCharm = new StatusEffectType();
	this.statusEffectTypes.NPCCharm.niceName = 'Charm';
	this.statusEffectTypes.NPCCharm.duration = 10;
	this.statusEffectTypes.NPCCharm.requiresLoS = true;
	this.statusEffectTypes.NPCCharm.destroyOnZoning = true;
	this.statusEffectTypes.NPCCharm.dontSave = true;
	this.statusEffectTypes.NPCCharm.desc = function () {
		var caster = gs.getCharWithID(this.casterId);
		
		let str = 'You have been charmed by ';
		
		if (!caster.isBoss) {
			str += 'a ';
		}
		
		str += gs.capitalSplit(caster.name);
		
		str += ' Breaking line of sight for a few turns will cause the charm to fade.\n\n';
		
		str += 'While charmed you will not be able to move away from the caster.';
		return str;
	};

	// VANISH:
	// ********************************************************************************************
	this.statusEffectTypes.Vanish = new StatusEffectType();
	this.statusEffectTypes.Vanish.onUpdateStats = function (character) {};
	this.statusEffectTypes.Vanish.duration = 20;
	this.statusEffectTypes.Vanish.addDuration = true;
	this.statusEffectTypes.Vanish.desc = 'You are completely hidden, preventing monsters from spotting you.';
	
	// DEAD_EYE:
	// ********************************************************************************************
	this.statusEffectTypes.DeadEye = new StatusEffectType();
	this.statusEffectTypes.DeadEye.onUpdateStats = function (character) {
			character.alwaysProjectileCrit += 1;
	};
	this.statusEffectTypes.DeadEye.duration = 10;
	this.statusEffectTypes.DeadEye.addDuration = true;
	
	// DASH_ATTACK:
	// ********************************************************************************************
	this.statusEffectTypes.DashAttack = new StatusEffectType();
	this.statusEffectTypes.DashAttack.duration = 1;
	this.statusEffectTypes.DashAttack.destroyOnZoning = true;
	this.statusEffectTypes.DashAttack.dontPopUpText = true;
	this.statusEffectTypes.DashAttack.dontShowOnHUD = true;
	this.statusEffectTypes.DashAttack.dontSave = true;
	
	// CHARGE:
	// ********************************************************************************************
	this.statusEffectTypes.Charge = new StatusEffectType();
	this.statusEffectTypes.Charge.destroyOnZoning = true;
	this.statusEffectTypes.Charge.onAttack = function (actingChar, weapon, targetTileIndex) {
		let targetChar = gs.getChar(targetTileIndex),
			normal = util.get8WayVector(actingChar.tileIndex, targetChar.tileIndex),
			attackFlags = {},
			isCrunch = false;
	
		// Is crush:
		if (!gs.isStaticPassable(targetTileIndex.x + normal.x, targetTileIndex.y + normal.y)) {
			attackFlags.isCrit = true;
			targetChar.popUpText('Crunch!');
			isCrunch = true;
			
			// Shake Screen:
			game.camera.shake(0.010, 100);
			game.camera.flash(0xffffff, 50);
			gs.playSound(gs.sounds.death);
		}
		
		
		// Attack w/ weapon:
		attackFlags.damage = this.damage;
		weapon.type.attackEffect.useOn(targetTileIndex, weapon, attackFlags);
		
		if (isCrunch) {
			// Push char into wall:
			targetChar.body.offset.x = normal.x * 40;
			targetChar.body.offset.y = normal.y * 40;
			
			// Push char into wall:
			actingChar.body.offset.x = normal.x * 40;
			actingChar.body.offset.y = normal.y * 40;
		}
		else {
			// Apply knockback:
			if (targetChar.isAlive) {
				targetChar.body.applyKnockBack(normal, 1);
			}
			
			// Move to position:
			if (gs.isPassable(targetTileIndex)) {
				// Make sure we don't fall down pits:
				if (!gs.isPit(targetTileIndex) || actingChar.isFlying) {
					actingChar.moveTo(targetTileIndex, gs.globalData.focusCamera, false);
				}
			}
		}
		
		actingChar.statusEffects.remove('Charge');
	};
	this.statusEffectTypes.Charge.duration = 1;
	this.statusEffectTypes.Charge.addDuration = true;
	this.statusEffectTypes.Charge.dontPopUpText = true;
	this.statusEffectTypes.Charge.dontShowOnHUD = true;
	this.statusEffectTypes.Charge.dontSave = true;

	// NPC_BERSERK:
	// ********************************************************************************************
	this.statusEffectTypes.NPCBerserk = new StatusEffectType();
	this.statusEffectTypes.NPCBerserk.lightColor = '#ff0000';
	this.statusEffectTypes.NPCBerserk.lightAlpha = 'CC';
	this.statusEffectTypes.NPCBerserk.onUpdateStats = function (character) {
		character.alwaysCrit += 1;
		character.knockBackOnHit += 1;
	};
	
	this.statusEffectTypes.NPCBerserk.duration = 10;
	this.statusEffectTypes.NPCBerserk.addDuration = true;
	
	// WEAPON_SHIELD:
	// ********************************************************************************************
	this.statusEffectTypes.WeaponShield = new StatusEffectType();
	this.statusEffectTypes.WeaponShield.onEndTurn = function (character) {
		// Removed Weapon:
		if (character.inventory.getPrimaryWeapon().type.name === 'Fists') {
			character.statusEffects.remove('WeaponShield');
		}
	};
	this.statusEffectTypes.WeaponShield.duration = 10;
	this.statusEffectTypes.WeaponShield.addDuration = true;
		
	
	
	// LIFE_SPIKE:
	// ********************************************************************************************
	this.statusEffectTypes.LifeSpike = new StatusEffectType();
	this.statusEffectTypes.LifeSpike.duration = 8;
	this.statusEffectTypes.LifeSpike.damage = 2;
	this.statusEffectTypes.LifeSpike.onUpdateTurn = function (character) {
		var amount, actingChar;
		
		actingChar = gs.getCharWithID(this.actingCharId);
		
		amount = character.takeDamage(this.damage, 'Toxic', {killer: actingChar, neverCrit: true});
		
		gs.createPoisonEffect(character.tileIndex);
		
		if (actingChar && actingChar.isAlive) {
			amount = Math.ceil(amount / 2);
			
			if (amount > actingChar.maxHp - actingChar.currentHp) {
				amount = actingChar.maxHp - actingChar.currentHp;
			}

			if (amount > 0) {
				actingChar.healHp(amount);
				actingChar.popUpText('+' + amount + 'HP', 'Green');
			}
		}
	};
	this.statusEffectTypes.LifeSpike.addDuration = false;
	this.statusEffectTypes.LifeSpike.canStack = true;
	
	// DISCORD:
	// ********************************************************************************************
	this.statusEffectTypes.Discord = new StatusEffectType();
	this.statusEffectTypes.Discord.onUpdateStats = function (character) {
		character.damageMultiplier += this.damageMultiplier;
	};
	this.statusEffectTypes.Discord.desc = function () {
		return 'You will suffer ' + util.toPercentStr(this.damageMultiplier) + ' more damage from all attack types.';
	};
	
	
	// STRONG_POISON:
	// ********************************************************************************************
	this.statusEffectTypes.StrongPoison = new StatusEffectType();
	this.statusEffectTypes.StrongPoison.duration = 5; 
	this.statusEffectTypes.StrongPoison.onCreate = function (character) {
		this.firstTurn = true;
	};
	this.statusEffectTypes.StrongPoison.onUpdateTurn = function (character) {
		let damage = Math.floor(this.damage / 4);
		
		if (!this.firstTurn) {
			character.takeDamage(damage, 'Toxic', {neverCrit: true});
		}
		
		this.firstTurn = false;
	};
	this.statusEffectTypes.StrongPoison.addDuration = false;
	this.statusEffectTypes.StrongPoison.dontPopUpText = true;
	
	// STICKY_FLAME:
	// ********************************************************************************************
	this.statusEffectTypes.StickyFlame = new StatusEffectType();
	this.statusEffectTypes.StickyFlame.duration = 4; 
	this.statusEffectTypes.StickyFlame.onCreate = function (character) {
		var pos = util.toPosition(character.tileIndex);
	
		this.sprite = gs.createSprite(0, 0, 'Tileset', gs.projectileSpritesGroup);
    	this.sprite.anchor.setTo(0.5, 0.5);
    	this.sprite.frame = 1603;
		this.sprite.scale.setTo(1, 1);
		this.sprite.alpha = 0.75;
		character.sprite.addChild(this.sprite);
	};
	this.statusEffectTypes.StickyFlame.onDestroy = function (character) {
		this.sprite.destroy();	
	};
	this.statusEffectTypes.StickyFlame.shouldDestroy = function (character) {
		return gs.getTile(character.tileIndex).type.name === 'Water';
	};
	this.statusEffectTypes.StickyFlame.onUpdateTurn = function (character) {
		if (!this.firstTurn) {
			character.takeDamage(this.damage, 'Fire', {neverCrit: true});
		}
	};
	this.statusEffectTypes.StickyFlame.addDuration = false;
	
	
	// RESISTANCE:
	// ********************************************************************************************
	this.statusEffectTypes.Resistance = new StatusEffectType();
	this.statusEffectTypes.Resistance.onUpdateStats = function (character) {
		character.resistance.Fire += 0.2;
		character.resistance.Cold += 0.2;
		character.resistance.Shock += 0.2;
		character.resistance.Toxic += 0.2;
		character.protection += 4;
	};
	this.statusEffectTypes.Resistance.duration = 50;
	this.statusEffectTypes.Resistance.addDuration = true;
	this.statusEffectTypes.Resistance.desc = '+20% Fire Resistance\n+20% Cold Resistance\n+20% Toxic Resistance\n+20% Shock Resistance\n+4 Protection';
	
	// BLESS:
	// ********************************************************************************************
	this.statusEffectTypes.Bless = new StatusEffectType();
	this.statusEffectTypes.Bless.onUpdateStats = function (character) {
		character.resistance.Fire += 0.2;
		character.resistance.Cold += 0.2;
		character.resistance.Shock += 0.2;
		character.resistance.Toxic += 0.2;
		character.protection += 4;
	};
	this.statusEffectTypes.Bless.duration = 100;
	this.statusEffectTypes.Bless.addDuration = true;
	this.statusEffectTypes.Bless.desc = '+20% Fire Resistance\n+20% Cold Resistance\n+20% Toxic Resistance\n+20% Shock Resistance\n+4 Protection';
	
	// POWER:
	// ********************************************************************************************
	this.statusEffectTypes.Power = new StatusEffectType();
	this.statusEffectTypes.Power.onUpdateStats = function (character) {
		character.rangeDamageMultiplier += 1.0;
		character.staffDamageMultiplier += 1.0;
		character.meleeDamageMultiplier += 1.0;
		character.magicPower += 1.0;
	};
	this.statusEffectTypes.Power.duration = 20;
	this.statusEffectTypes.Power.addDuration = true;
	this.statusEffectTypes.Power.desc = '+10 Melee Damage\n+10 Range Damage\n+10 Stave Damage';
	
	// LEVITATION:
	// ********************************************************************************************
	this.statusEffectTypes.Levitation = new StatusEffectType();
	this.statusEffectTypes.Levitation.onUpdateStats = function (character) {
		character.isFlying += 1;
	};
	this.statusEffectTypes.Levitation.duration = 200;
	this.statusEffectTypes.Levitation.addDuration = true;
	
	// TELEPATHY:
	// ********************************************************************************************
	this.statusEffectTypes.Telepathy = new StatusEffectType();
	this.statusEffectTypes.Telepathy.onUpdateStats = function (character) {
		character.isTelepathic += 1;
	};
	this.statusEffectTypes.Telepathy.duration = 200;
	this.statusEffectTypes.Telepathy.addDuration = true;
	

	
	// HASTE:
	// ********************************************************************************************
	this.statusEffectTypes.Haste = new StatusEffectType();
	this.statusEffectTypes.Haste.lightColor = '#ffff00';
	this.statusEffectTypes.Haste.lightAlpha = 'AA';
	this.statusEffectTypes.Haste.onUpdateStats = function (character) {
		character.movementSpeed += 1;
	};
	this.statusEffectTypes.Haste.duration = 10;
	this.statusEffectTypes.Haste.addDuration = true;
	
	// SHIELD_OF_FIRE:
	// ********************************************************************************************
	this.statusEffectTypes.ShieldOfFlames = new StatusEffectType();
	this.statusEffectTypes.ShieldOfFlames.shouldDestroy = function (character) {
		var casterChar = gs.getCharWithID(this.casterId);
		return !casterChar;
	};
	this.statusEffectTypes.ShieldOfFlames.onUpdateStats = function (character) {
		character.resistance.Fire += 0.5;
		character.damageShield.Fire += this.damage;
	};
	this.statusEffectTypes.ShieldOfFlames.duration = 20;
	this.statusEffectTypes.ShieldOfFlames.addDuration = false;
	
	// STORM_SHIELD:
	// ********************************************************************************************
	this.statusEffectTypes.StormShield = new StatusEffectType();
	this.statusEffectTypes.StormShield.shouldDestroy = function (character) {
		var casterChar = gs.getCharWithID(this.casterId);
		return !casterChar;
	};
	this.statusEffectTypes.StormShield.onUpdateStats = function (character) {
		character.resistance.Shock += 0.5;
		character.damageShield.Shock += this.damage;
	};
	this.statusEffectTypes.StormShield.duration = 20;
	this.statusEffectTypes.StormShield.addDuration = false;
	
	// ICE_ARMOR:
	// ********************************************************************************************
	this.statusEffectTypes.IceArmor = new StatusEffectType();
	this.statusEffectTypes.IceArmor.shouldDestroy = function (character) {
		var casterChar = gs.getCharWithID(this.casterId);
		return !casterChar;
	};
	this.statusEffectTypes.IceArmor.onUpdateStats = function (character) {
		character.resistance.Cold += 0.2;
		character.protection += 5;
	};
	this.statusEffectTypes.IceArmor.onTakeDamage = function (character, damageType) {
		// Destroyed by fire:
		if (damageType === DAMAGE_TYPE.FIRE) {
			character.statusEffects.remove(this.name);
		}
	};
	this.statusEffectTypes.IceArmor.duration = 20;
	this.statusEffectTypes.IceArmor.addDuration = false;
	
	// CASTING_SMITE:
	// ********************************************************************************************
	this.statusEffectTypes.CastingSmite = new StatusEffectType();
	this.statusEffectTypes.CastingSmite.dontSave = true;
	this.statusEffectTypes.CastingSmite.onCreate = function (character) {
		var pos = util.toPosition(this.tileIndex);
		this.sprite = gs.createSprite(pos.x, pos.y, 'Tileset', gs.projectileSpritesGroup);
    	this.sprite.anchor.setTo(0.5, 0.5);
    	this.sprite.frame = RED_SELECT_BOX_FRAME;
	};
	this.statusEffectTypes.CastingSmite.onDestroy = function (character) {
		var targetChar;
		
		// Note that destroyFunc is called when the character dies, as well as when the status effect naturally ends.
		// Only want to cast the smite if the character is still alive
		// Also check to make sure he isn't sleeping:
		// Also check to make sure still LoS ex. door was closed
		if (character.isAlive && !character.isAsleep && gs.isRayClear(this.tileIndex, character.tileIndex)) {
			gs.createParticlePoof(character.tileIndex, 'PURPLE');
		
			targetChar = gs.getChar(this.tileIndex);
			if (targetChar) {
				targetChar.takeDamage(this.damage, 'Magic', {killer: character});
			}
			
			gs.playSound(gs.sounds.bolt);
			gs.createSmiteEffect(this.tileIndex);
		}
		
		
		this.sprite.destroy();	
	};
	this.statusEffectTypes.CastingSmite.onUpdateStats = function (character) {
		character.isStunned += 1;
	};
	this.statusEffectTypes.CastingSmite.duration = 1;
	
	// CASTING_FIRE_STORM:
	// ********************************************************************************************
	this.statusEffectTypes.CastingFireStorm = new StatusEffectType();
	this.statusEffectTypes.CastingFireStorm.dontSave = true;
	this.statusEffectTypes.CastingFireStorm.skipFirstTurn = true;
	this.statusEffectTypes.CastingFireStorm.size = 0.5;
	this.statusEffectTypes.CastingFireStorm.duration = 5;
	this.statusEffectTypes.CastingFireStorm.onCreate = function (character) {
		this.spriteList = [];	
		this.createSprites(this.tileIndex);
		this.startTileIndex = {x: character.tileIndex.x, y: character.tileIndex.y};
	};
	
	this.statusEffectTypes.CastingFireStorm.onUpdateTurn = function (character) {
		if (this.skipFirstTurn) {
			this.skipFirstTurn = false;
			return;
		}
		
		// Character has moved (knockback, blinks etc.) so we remove the status effect:
		if (!util.vectorEqual(character.tileIndex, this.startTileIndex)) {
			character.statusEffects.remove('CastingFireStorm');
			return;
		}
		
		// Character is sleeping so we remove the status effect:
		if (character.isAsleep) {
			character.statusEffects.remove('CastingFireStorm');
			return;
		}
		
		// Create Fire:
		gs.getIndexListInRadius(this.tileIndex, this.size).forEach(function (index) {
			if (gs.isRayStaticPassable(this.tileIndex, index) && gs.isStaticPassable(index)) {
				gs.createFire(index, this.damage);
			}
		}, this);
		
		// Destroy existing sprites:
		this.onDestroy();
		
		// Early break in case the character has killed himself:
		if (!character.isAlive) {
			return;
		}
		
		if (this.size < 2) {
			this.size += 0.5;
		}
		
		// Move up:
		if (gs.isStaticPassable(this.tileIndex.x + this.delta.x, this.tileIndex.y + this.delta.y)) {
			this.tileIndex = {x: this.tileIndex.x + this.delta.x, y: this.tileIndex.y + this.delta.y};
			this.createSprites(this.tileIndex);
		}
		else {
			this.duration = 0;
		}
	};
	this.statusEffectTypes.CastingFireStorm.createSprites = function (tileIndex) {
		gs.getIndexListInRadius(tileIndex, this.size).forEach(function (index) {
			if (gs.isRayStaticPassable(tileIndex, index) && gs.isStaticPassable(index)) {
				this.createSprite(index);
			}
		}, this);
	};
	this.statusEffectTypes.CastingFireStorm.createSprite = function (tileIndex) {
		var sprite,
			pos = util.toPosition(tileIndex);
		
		sprite = gs.createSprite(pos.x, pos.y, 'Tileset', gs.projectileSpritesGroup);
    	sprite.anchor.setTo(0.5, 0.5);
    	sprite.frame = RED_BOX_FRAME;
		
		this.spriteList.push(sprite);
	};
	this.statusEffectTypes.CastingFireStorm.onDestroy = function (character) {
		
		this.spriteList.forEach(function (sprite) {
			sprite.destroy();
		}, this);
	};
	this.statusEffectTypes.CastingFireStorm.onUpdateStats = function (character) {
		character.isStunned += 1;
	};
	
	
	this.statusEffectTypes.CastingFireStorm.toData = function () {
		var data = {};

		data.typeName = this.name;
		data.properties = {};

		// Properties:
		this.propertyList.forEach(function (key) {
			data.properties[key] = this[key];
		}, this);
		
		data.properties.size = this.size;
		data.properties.skipFirstTurn = this.skipFirstTurn;

		return data;
	};
	
	// SEAL_DOORS:
	// When an NPC seals doors they add this status effect to themselves to keep the doors sealed
	// The status effect will unseal the doors when it completes (either duration or when the npc is killed)
	// Make sure to set indexList when creating the status effect
	// ********************************************************************************************
	this.statusEffectTypes.SealDoors = new StatusEffectType();
	this.statusEffectTypes.SealDoors.onCreate = function (character) {
		this.spriteList = [];
		
		this.indexList.forEach(function (tileIndex) {
			var sprite;
			
			// Create sprite:
			sprite = gs.createSprite(util.toPosition(tileIndex).x, util.toPosition(tileIndex).y, 'Tileset', gs.projectileSpritesGroup);
    		sprite.anchor.setTo(0.5, 0.5);
    		sprite.frame = RED_SELECT_BOX_FRAME;
			this.spriteList.push(sprite);
			
			// Seal Doors:
			gs.getObj(tileIndex).seal();
			
		}, this);
		
	};
	this.statusEffectTypes.SealDoors.onDestroy = function (character) {
		// Destroy sprites:
		this.spriteList.forEach(function (sprite) {
			sprite.destroy();
		}, this);
		
		// Unseal doors:
		this.indexList.forEach(function (tileIndex) {
			gs.getObj(tileIndex).isSealed = false;
		}, this);
	};
	this.statusEffectTypes.SealDoors.duration = 20;
	this.statusEffectTypes.SealDoors.dontSave = true;
	
	// SHIELDS_UP:
	// ********************************************************************************************
	this.statusEffectTypes.ShieldsUp = new StatusEffectType();
	this.statusEffectTypes.ShieldsUp.duration = 10;
	this.statusEffectTypes.ShieldsUp.dontPopUpText = true;
	this.statusEffectTypes.ShieldsUp.dontShowOnHUD = true;
	this.statusEffectTypes.ShieldsUp.destroyOnNextTurn = true;
	
	// NPC_SHIELDS_UP:
	// ********************************************************************************************
	this.statusEffectTypes.NPCShieldsUp = new StatusEffectType();
	this.statusEffectTypes.NPCShieldsUp.niceName = 'Shields Up';
	this.statusEffectTypes.NPCShieldsUp.duration = 3;
	this.statusEffectTypes.NPCShieldsUp.onUpdateStats = function (character) {
		character.reflection += 1.0;
		character.isImmobile += 1;
	};
	
	// DEFLECT:
	// ********************************************************************************************
	this.statusEffectTypes.Deflect = new StatusEffectType();
	this.statusEffectTypes.Deflect.onUpdateStats = function (character) {
		character.reflection += this.reflection;
	};
	this.statusEffectTypes.Deflect.duration = 5;
	
	// SHIELD_WALL:
	// ********************************************************************************************
	this.statusEffectTypes.ShieldWall = new StatusEffectType();
	this.statusEffectTypes.ShieldWall.noDuration = true;
	this.statusEffectTypes.ShieldWall.lightColor = '#ffffff';
	this.statusEffectTypes.ShieldWall.lightAlpha = 'CC';
	this.statusEffectTypes.ShieldWall.getBlockChance = function () {
		let blockChance = 0;
		
		if (gs.pc.talents.getTalentRank('ShieldWall') === 1) {
			blockChance += 0.20;
		}
		else if (gs.pc.talents.getTalentRank('ShieldWall') === 2) {
			blockChance += 0.30;
		}
		
		blockChance += gs.pc.abilityPower;
		
		// Removing trailing decimels:
		blockChance = Math.round(blockChance * 100) / 100;
		
		// Cap:
		blockChance = Math.min(1.0, blockChance);
		
		return blockChance;
	};
	this.statusEffectTypes.ShieldWall.onUpdateStats = function (character) {
		character.blockChance += this.getBlockChance();
	};
	this.statusEffectTypes.ShieldWall.onEndTurn = function (character) {
		if (!gs.pc.inventory.hasShieldEquipped()) {
			gs.pc.statusEffects.remove('ShieldWall');
		}
	};
	this.statusEffectTypes.ShieldWall.desc = function () {
		let str = '';
		str += '+' + util.toPercentStr(this.getBlockChance()) + ' Block Chance.';
		return str;
	};
	/*
	this.statusEffectTypes.ShieldWall = new StatusEffectType();
	this.statusEffectTypes.ShieldWall.onUpdateStats = function (character) {};
	this.statusEffectTypes.ShieldWall.onUpdateTurn = function (character) {
		// Moved:
		if (!util.vectorEqual(character.tileIndex, this.startTileIndex)) {
			character.statusEffects.remove('ShieldWall');
		}
		
		// Removed Shield:
		if (!character.inventory.hasShieldEquipped()) {
			character.statusEffects.remove('ShieldWall');
		}
	};
	this.statusEffectTypes.ShieldWall.duration = 10;
	*/
	
		
	// BLOOD_LUST:
	// ********************************************************************************************
	this.statusEffectTypes.BloodLust = new StatusEffectType();
	this.statusEffectTypes.BloodLust.lightColor = '#ff0000';
	this.statusEffectTypes.BloodLust.lightAlpha = 'CC';
	this.statusEffectTypes.BloodLust.dontTickDuration = true;
	this.statusEffectTypes.BloodLust.duration = 1;
	this.statusEffectTypes.BloodLust.dontPopUpText = true;
	this.statusEffectTypes.BloodLust.addDuration = true;
	
	this.statusEffectTypes.BloodLust.onCreate = function (character) {
		this.timer = 0;
	};
	this.statusEffectTypes.BloodLust.onUpdateStats = function (character) {
		character.rangeDamageMultiplier += 0.1 * this.duration;
		character.staffDamageMultiplier += 0.1 * this.duration;
		character.meleeDamageMultiplier += 0.1 * this.duration;
		character.magicPower += 0.1 * this.duration;
		
	};
	this.statusEffectTypes.BloodLust.onUpdateTurn = function (character) {
		this.timer += 1;
		
		if (this.timer === 6) {
			this.timer = 0;
			this.duration -= 1;
			
			if (this.duration === 0) {
				character.statusEffects.remove('BloodLust');
			}
		}
	};
	this.statusEffectTypes.BloodLust.desc = function () {
		return 'Increases melee, range, staff and magic power by ' + util.toPercentStr(0.1 * this.duration) + '.';
	};
	
	
	// BERSERK:
	// ********************************************************************************************
	this.statusEffectTypes.Berserk = new StatusEffectType();
	this.statusEffectTypes.Berserk.noDuration = true;
	this.statusEffectTypes.Berserk.lightColor = '#ff0000';
	this.statusEffectTypes.Berserk.lightAlpha = 'CC';
	this.statusEffectTypes.Berserk.getMeleeDamageMultiplier = function () {
		let meleeDamageMultiplier = 0;
		
		if (gs.pc.talents.getTalentRank('Berserk') === 1) {
			meleeDamageMultiplier += 0.20;
		}
		else if (gs.pc.talents.getTalentRank('Berserk') === 2) {
			meleeDamageMultiplier += 0.30;
		}
		
		meleeDamageMultiplier += gs.pc.abilityPower;
		
		// Removing trailing decimels:
		meleeDamageMultiplier = Math.round(meleeDamageMultiplier * 100) / 100;
		
		return meleeDamageMultiplier;
	};
	this.statusEffectTypes.Berserk.onUpdateStats = function (character) {
		character.meleeDamageMultiplier += this.getMeleeDamageMultiplier();
	};
	this.statusEffectTypes.Berserk.desc = function () {
		let str = '';
		str += '+' + util.toPercentStr(this.getMeleeDamageMultiplier()) + ' Melee Damage.';
		return str;
	};

	
	// SHIELD_OF_ICE:
	// ********************************************************************************************
	this.statusEffectTypes.ShieldOfIce = new StatusEffectType();
	this.statusEffectTypes.ShieldOfIce.onUpdateStats = function (character) {};
	this.statusEffectTypes.ShieldOfIce.duration = 10;
	this.statusEffectTypes.ShieldOfIce.dontTickDuration = true;
	this.statusEffectTypes.ShieldOfIce.addDuration = false;
	this.statusEffectTypes.ShieldOfIce.getProtectHp = function () {
		let protectHp = gs.talents.ShieldOfIce.attributes.protectHp[gs.pc.talents.getTalentRank('ShieldOfIce')];
		
		protectHp *= (1.0 + gs.pc.abilityPower + gs.pc.magicPower);
		
		protectHp = Math.round(protectHp);
		
		return protectHp;
	};
	this.statusEffectTypes.ShieldOfIce.onUpdateTurn = function () {
		if (this.regenTimer > 0) {
			this.regenTimer -= 1;
		}
		
		if (this.regenTimer === 0 && this.duration < this.getProtectHp()) {
			this.duration += 1;
			this.regenTimer = 4;
		}
	};
	this.statusEffectTypes.ShieldOfIce.onCreate = function () {
		gs.playSound(gs.sounds.ice);
		this.duration = 1;
		
		this.regenTimer = 3;
	};
	this.statusEffectTypes.ShieldOfIce.onDestroy = function () {
		gs.pc.shieldOfIceTimer = 10;
	};
	this.statusEffectTypes.ShieldOfIce.onTakeDamage = function (character, damageType, flags) {
		if (damageType === DAMAGE_TYPE.FIRE && flags.attackType !== 'DamageShield') {
			character.statusEffects.remove('ShieldOfIce');
		}
	};
	this.statusEffectTypes.ShieldOfIce.desc = function () {
		return 'Protect HP: ' + this.duration + '/' + this.getProtectHp();
	};
	
	// STORM_SHOT:
	// ********************************************************************************************
	this.statusEffectTypes.StormShot = new StatusEffectType();
	this.statusEffectTypes.StormShot.onUpdateStats = function (character) {};
	this.statusEffectTypes.StormShot.onEndTurn = function (character) {
		// Removed Range:
		if (!character.inventory.getRangeWeapon()) {
			character.statusEffects.remove('StormShot');
		}
		
		// Create Projectiles:
		this.indexList.forEach(function (offsetIndex) {
			
			let tileIndex = {x: character.tileIndex.x + offsetIndex.x, y: character.tileIndex.y + offsetIndex.y};
			
			if (gs.isStaticProjectilePassable(tileIndex)) {
				let targetTileIndex = {x: tileIndex.x + this.delta.x, y: tileIndex.y + this.delta.y};
				
				let proj = character.inventory.getRangeWeapon().type.attackEffect.useOn(targetTileIndex, character.inventory.getRangeWeapon());
				proj.tileIndex = {x: tileIndex.x, y: tileIndex.y};
				proj.sprite.x = util.toPosition(proj.tileIndex).x;
				proj.sprite.y = util.toPosition(proj.tileIndex).y;
				proj.sprite.rotation = game.math.angleBetween(tileIndex.x, tileIndex.y, targetTileIndex.x, targetTileIndex.y) + Math.PI / 2;
				proj.normal = {x: this.delta.x, y: this.delta.y};
				proj.damage = this.damage;
				proj.perfectAim = false;
				
				// Stop magic projectiles from hitting the targetTileIndex:
				proj.targetTileIndex = {x: -1, y: -1};
			}
			
		}, this);
		
		// Character bounce:
		character.body.faceTileIndex({x: character.tileIndex.x + this.delta.x, y: character.tileIndex.y + this.delta.y});
		character.body.bounceTowards({x: character.tileIndex.x + this.delta.x, y: character.tileIndex.y + this.delta.y});
		
	};
	this.statusEffectTypes.StormShot.duration = 3;
	
	// FIRE_STORM:
	// ********************************************************************************************
	this.statusEffectTypes.FireStorm = new StatusEffectType();
	this.statusEffectTypes.FireStorm.onUpdateStats = function (character) {};
	this.statusEffectTypes.FireStorm.onEndTurn = function (character) {
		// Creating Fire:
		gs.getIndexListInRadius(character.tileIndex, this.aoeRange).forEach(function (tileIndex) {
			if (!util.vectorEqual(character.tileIndex, tileIndex) && gs.isRayClear(character.tileIndex, tileIndex)) {
				gs.createFire(tileIndex, this.damage);
			}
		}, this);
	};
	this.statusEffectTypes.FireStorm.duration = 4;
	
	// INFUSION_OF_FIRE:
	// ********************************************************************************************
	this.statusEffectTypes.InfusionOfFire = new StatusEffectType();
	this.statusEffectTypes.InfusionOfFire.lightColor = '#ff0000';
	this.statusEffectTypes.InfusionOfFire.lightAlpha = 'CC';
	this.statusEffectTypes.InfusionOfFire.onUpdateStats = function (character) {
		character.abilityPower += this.abilityPower;
	};
	this.statusEffectTypes.InfusionOfFire.duration = 5;
	this.statusEffectTypes.InfusionOfFire.desc = function () {
		let str = '';
		
		str += 'You have been infused with the power of fire.\n\n';
		str += '+' + util.toPercentStr(this.abilityPower) + ' Ability Power.';
		return str;
	};
	
	
	// INFUSION_OF_STORMS:
	// ********************************************************************************************
	this.statusEffectTypes.InfusionOfStorms = new StatusEffectType();
	this.statusEffectTypes.InfusionOfStorms.lightColor = '#ffffff';
	this.statusEffectTypes.InfusionOfStorms.lightAlpha = '99';
	this.statusEffectTypes.InfusionOfStorms.onUpdateStats = function (character) {
		character.abilityPower += this.abilityPower;
	};
	this.statusEffectTypes.InfusionOfStorms.duration = 5;
	this.statusEffectTypes.InfusionOfStorms.desc = function () {
		let str = '';
		
		str += 'You have been infused with the power of storms.\n\n';
		str += '+' + util.toPercentStr(this.abilityPower) + ' Ability Power.';
		return str;
	};


	
	
	// TOXIC_ATTUNEMENT:
	// ********************************************************************************************
	this.statusEffectTypes.ToxicAttunement = new StatusEffectType();
	this.statusEffectTypes.ToxicAttunement.onUpdateStats = function (character) {
		character.toxicPower += this.toxicPower;
	};
	this.statusEffectTypes.ToxicAttunement.duration = 10;
	
	
	
	// INFECTIOUS_DISEASE:
	// ********************************************************************************************
	this.statusEffectTypes.InfectiousDisease = new StatusEffectType();
	this.statusEffectTypes.InfectiousDisease.onUpdateTurn = function (character) {
		character.takeDamage(this.damage, 'Toxic', {neverCrit: true});
		
		// Spread:
		gs.getIndexListCardinalAdjacent(character.tileIndex).forEach(function (tileIndex) {
			var char = gs.getChar(tileIndex);
			
			if (char && (char.faction === FACTION.PLAYER || char.faction === FACTION.HOSTILE) && !char.statusEffects.has('InfectiousDisease') && !util.inArray('InfectiousDisease', char.type.statusEffectImmunities)) {
				char.statusEffects.add('InfectiousDisease', {damage: this.damage, duration: this.duration});
			}
		}, this);
	};
	this.statusEffectTypes.InfectiousDisease.duration = 15;
	

	
	// UI_SYMBOLS:
	// ********************************************************************************************
	this.statusEffectTypes.NPCBerserk.uiSymbol = 		'B';
	this.statusEffectTypes.Slow.uiSymbol = 				'S';
	this.statusEffectTypes.Stunned.uiSymbol = 			'S';
	this.statusEffectTypes.Haste.uiSymbol = 			'H';
	this.statusEffectTypes.Confusion.uiSymbol = 		'C';
	this.statusEffectTypes.InfectiousDisease.uiSymbol = 'D';
	this.statusEffectTypes.Discord.uiSymbol = 			'D';
	this.statusEffectTypes.LifeSpike.uiSymbol = 		'L';
	this.statusEffectTypes.StrongPoison.uiSymbol =		'P';
	
	this.nameTypes(this.statusEffectTypes);
};





