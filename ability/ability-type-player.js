
/*global gs, game, util, console*/
/*global Item*/
/*global RED_SELECT_BOX_FRAME, PURPLE_SELECT_BOX_FRAME, PURPLE_BOX_FRAME, RED_BOX_FRAME*/
/*global LOS_DISTANCE, TILE_SIZE, FACTION, ABILITY_RANGE, MOVEMENT_TYPE*/
/*global SPREAD_DAMAGE_MOD, ACTION_TIME, PARTICLE_FRAMES, GREEN_TARGET_BOX_FRAME*/
/*jshint esversion: 6, laxbreak: true, loopfunc: true*/
'use strict';

// CREATE_PLAYER_ABILITY_TYPES:
// ************************************************************************************************
gs.createPlayerAbilityTypes = function () {
	
	// ********************************************************************************************	
	// INFUSION_ABILITIES:
	// ********************************************************************************************
	
	// INFUSION_OF_BLOOD:
	// ********************************************************************************************
	this.abilityTypes.InfusionOfBlood = {};
	this.abilityTypes.InfusionOfBlood.isSpell = true;
	this.abilityTypes.InfusionOfBlood.useImmediately = true;
	this.abilityTypes.InfusionOfBlood.getIndexList = function (actingChar) {
		let indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.aoeRange(actingChar));
		indexList = indexList.filter(tileIndex => gs.getTile(tileIndex).visible);
		indexList = indexList.filter(tileIndex => gs.getObj(tileIndex, 'Blood'));
		return indexList;
	};
	this.abilityTypes.InfusionOfBlood.canUse = function (actingChar) {
		return this.getIndexList(actingChar).length > 0;
	};
	this.abilityTypes.InfusionOfBlood.showTarget = function (targetTileIndex) {
		let indexList = this.getIndexList(gs.pc);
		
		indexList.forEach(function (tileIndex) {
			gs.targetSprites.create(tileIndex, PURPLE_SELECT_BOX_FRAME);
		}, this);
	};
	this.abilityTypes.InfusionOfBlood.useOn = function (actingChar) {		
		let indexList = this.getIndexList(actingChar);
		
		indexList.forEach(function (tileIndex) {
			gs.destroyObject(gs.getObj(tileIndex));
			
			actingChar.restoreMp(1);
			actingChar.healHp(2);
			
			gs.createParticlePoof(tileIndex, 'RED');
		}, this);

		// Particles:
		gs.createParticlePoof(actingChar.tileIndex, 'RED');
		
		// Play Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	
	// INFUSION_OF_FIRE:
	// ********************************************************************************************
	this.abilityTypes.InfusionOfFire = {};
	this.abilityTypes.InfusionOfFire.isSpell = true;
	this.abilityTypes.InfusionOfFire.range = LOS_DISTANCE;
	this.abilityTypes.InfusionOfFire.canUseOn = function (actingChar, targetTileIndex) {
		return gs.isInBounds(targetTileIndex)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& gs.getTile(targetTileIndex).visible
			&& gs.canBurstOfFlame(targetTileIndex);
	};
	
	this.abilityTypes.InfusionOfFire.showTarget = gs.abilityShowTarget.SingleTarget;
	this.abilityTypes.InfusionOfFire.useOn = function (actingChar, targetTileIndex) {
		// Attributes:
		let restoreMp = this.attributes.restoreMp.value(actingChar);
		let abilityPower = this.attributes.abilityPower.value(actingChar);
		
		// Gain MP:
		actingChar.restoreMp(restoreMp);
		
		// Status Effect:
		actingChar.statusEffects.add('InfusionOfFire', {abilityPower: abilityPower});
		
		// Spell Effect on Char:
		gs.createFireEffect(actingChar.tileIndex);
		
		// Particles on Obj:
		gs.createParticlePoof(targetTileIndex, 'RED');
		gs.createLightCircle(util.toPosition(targetTileIndex), '#ff0000', 60, 10);
		let delta = util.normal(targetTileIndex, actingChar.tileIndex);
		gs.createParticleBurst(util.toPosition(targetTileIndex), delta, 'RED');
		
		
		// Play Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
		
		// Destroying Object:
		if (gs.getObj(targetTileIndex, obj => obj.type.canBurstOfFlame)) {
			gs.extinguishObject(targetTileIndex);
		}
		
		// Destroy Cloud:
		if (gs.getCloud(targetTileIndex, cloud => cloud.type.canBurstOfFlame)) {
			gs.getCloud(targetTileIndex).destroy();
		}

	};
	
	// INFUSION_OF_STORMS:
	// ********************************************************************************************
	this.abilityTypes.InfusionOfStorms = {};
	this.abilityTypes.InfusionOfStorms.isSpell = true;
	this.abilityTypes.InfusionOfStorms.useImmediately = true;
	this.abilityTypes.InfusionOfStorms.getIndexList = function (actingChar) {
		return gs.getIndexListInRadius(actingChar.tileIndex, 2.5);
	};
	this.abilityTypes.InfusionOfStorms.isValid = function (tileIndex) {
		return gs.isProjectilePassable(tileIndex) || gs.getChar(tileIndex);
	};
	this.abilityTypes.InfusionOfStorms.canUse = function (actingChar) {
		// Entire radius must be static passable:
		let indexList = this.getIndexList(actingChar);
		
		if (indexList.find(tileIndex => !this.isValid(tileIndex))) {
			return false;
		}
		else {
			return true;
		}
	};
	this.abilityTypes.InfusionOfStorms.showTarget = function (targetTileIndex) {
		let indexList = this.getIndexList(gs.pc);
		
		indexList.forEach(function (tileIndex) {
			if (this.isValid(tileIndex)) {
				gs.targetSprites.create(tileIndex, PURPLE_BOX_FRAME);
			}
			else {
				gs.targetSprites.create(tileIndex, RED_SELECT_BOX_FRAME);
			}
		}, this);
	};
	this.abilityTypes.InfusionOfStorms.useOn = function (actingChar) {		
		// Attributes:
		let restoreMp = this.attributes.restoreMp.value(actingChar);
		let abilityPower = this.attributes.abilityPower.value(actingChar);
		
		// Gain MP:
		actingChar.restoreMp(restoreMp);
		
		// Status Effect:
		actingChar.statusEffects.add('InfusionOfStorms', {abilityPower: abilityPower});
		
		// Particles:
		let x = actingChar.tileIndex.x;
		let y = actingChar.tileIndex.y;
		let indexList = [
			{x: x + 2, y: y},
			{x: x - 2, y: y},
			{x: x, y: y + 2},
			{x: x, y: y - 2},
			{x: x + 2, y: y + 2},
			{x: x - 2, y: y + 2},
			{x: x + 2, y: y - 2},
			{x: x - 2, y: y - 2},
		];
		indexList.forEach(function (tileIndex) {
			let delta = util.get8WayVector(tileIndex, actingChar.tileIndex);
			gs.createParticleBurst(util.toPosition(tileIndex), delta, 'WHITE');
		}, this);
			
				
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 59);
		
		
		
		// Play Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	

	
	this.abilityTypes.GatherMana = {};
	this.abilityTypes.GatherMana.isSpell = true;
	this.abilityTypes.GatherMana.useImmediately = true;
	this.abilityTypes.GatherMana.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.GatherMana.useOn = function (actingChar) {		
		// Attributes:
		let mpPercent = this.attributes.mpPercent.value(actingChar);
		
		// Gain MP:
		actingChar.restoreMp(Math.ceil(mpPercent * actingChar.maxMp));
		actingChar.mentalCure();
		
		// Particles:
		gs.createManaEffect(actingChar.tileIndex);
		
		// Text:
		actingChar.popUpText('Gather Mana');
		
		// Play Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	
	// ********************************************************************************************
	// DEFENSIVE_ABILITIES:
	// ********************************************************************************************/*
	// SHIELDS_UP:
	// ********************************************************************************************
	this.abilityTypes.ShieldsUp = {};
	this.abilityTypes.ShieldsUp.useImmediately = true;
	this.abilityTypes.ShieldsUp.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.ShieldsUp.canUse = function (actingChar) {
		return gs.abilityCanUse.Shield.call(this, actingChar)
			&& gs.abilityCanUse.MeleeWeapon.call(this, actingChar);
	};
	this.abilityTypes.ShieldsUp.useOn = function (actingChar) {
		actingChar.popUpText('Shields Up!');
		actingChar.statusEffects.add('ShieldsUp', {reflection: actingChar.talents.getTalentRank('ShieldsUp') === 2});
	};
	
	this.abilityTypes.ShieldsUp.getUseError = function (actingChar) {
		let indexList = gs.getIndexListAdjacent(actingChar.tileIndex);
		indexList = indexList.filter(tileIndex => gs.getChar(tileIndex));
		
		if (indexList.length === 0 && actingChar.talents.getTalentRank('ShieldsUp') === 1) {
			actingChar.popUpText('No nearby hostiles!', 'Red');
			return true;
		}
		else {
			return false;
		}
	};
	
	
	// RECOVERY:
	// ********************************************************************************************
	this.abilityTypes.Recovery = {};
	this.abilityTypes.Recovery.useImmediately = true;
	this.abilityTypes.Recovery.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.Recovery.getTarget = this.abilityGetTarget.Self;
	this.abilityTypes.Recovery.shouldUseOn = function (character, targetTileIndex) {
		return character.currentHp <= character.maxHp / 2 && util.frac() <= 0.5;
	};
	this.abilityTypes.Recovery.useOn = function (actingChar) {
		// Attributes:
		let healHp = this.attributes.healHp.value(actingChar);
				
		// Casting Effect:
		gs.createHealingEffect(actingChar.tileIndex);
		gs.playSound(gs.sounds.cure);
		
		// Healing Effect:
		actingChar.healHp(healHp);
		actingChar.cure();
		
		// Popup Text:
		actingChar.popUpText('Recovery');
		actingChar.popUpText('+' + healHp + 'HP', 'Green');
	};
	

	
	// SHIELD_WALL:
	// ********************************************************************************************
	/*
	this.abilityTypes.ShieldWall = {};
	this.abilityTypes.ShieldWall.useImmediately = true;
	this.abilityTypes.ShieldWall.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.ShieldWall.canUse = this.abilityCanUse.Shield;
	this.abilityTypes.ShieldWall.useOn = function (actingChar) {		
		// Attributes:
		let duration = this.attributes.duration.value(actingChar);
		let startTileIndex = {x: actingChar.tileIndex.x, y: actingChar.tileIndex.y};
		
		actingChar.statusEffects.add('ShieldWall', {duration: duration, startTileIndex: startTileIndex});
	};
	*/
	
	// ********************************************************************************************
	// MELEE_ABILITIES:
	// ********************************************************************************************
	// DISENGAGE:
	// Deals a critical hit and steps back a tile
	// Will not set a cooldown if a killstrike is landed
	// ********************************************************************************************
	this.abilityTypes.Disengage = {};
	this.abilityTypes.Disengage.range = this.abilityRange.Weapon;
	this.abilityTypes.Disengage.dontEndTurn = true;
	this.abilityTypes.Disengage.showTarget = function (targetTileIndex) {
		let weapon = gs.pc.inventory.getPrimaryWeapon();	
		
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			// Weapon Target:
			weapon.type.attackEffect.showTarget(targetTileIndex);
			
			// Movement Target:
			let backIndex = this.getBackIndex(gs.pc, targetTileIndex);
			gs.targetSprites.create(backIndex, GREEN_TARGET_BOX_FRAME);
		}
		else {
			gs.targetSprites.create(targetTileIndex, RED_SELECT_BOX_FRAME);
			gs.showTargetLine(targetTileIndex);
		}
	};
	this.abilityTypes.Disengage.canUseOn = function (actingChar, targetTileIndex) {
		let backIndex = this.getBackIndex(actingChar, targetTileIndex);
		
		return gs.abilityCanUseOn.SingleCharacterRay.call(this, actingChar, targetTileIndex)
			&& gs.isRay(actingChar.tileIndex, targetTileIndex, gs.isStaticPassable)
			&& actingChar.canMoveTo(backIndex)
			&& gs.isPassable(backIndex);
	};
	this.abilityTypes.Disengage.canUse = function (actingChar) {
		return gs.abilityCanUse.MeleeWeapon.call(this, actingChar)
			&& !actingChar.isImmobile;
	};
	this.abilityTypes.Disengage.getBackIndex = function (actingChar, targetTileIndex) {
		var normal = util.normal(targetTileIndex, actingChar.tileIndex);
		if (normal.x > 0) 	normal.x = 1;
		if (normal.x < 0) 	normal.x = -1;
		if (normal.y > 0)	normal.y = 1;
		if (normal.y < 0)	normal.y = -1;
		
		return {x: actingChar.tileIndex.x + normal.x, y: actingChar.tileIndex.y + normal.y};
	};
	this.abilityTypes.Disengage.useOn = function (actingChar, targetTileIndex) {
		let prevTileIndex = {x: actingChar.tileIndex.x, y: actingChar.tileIndex.y};
		let toTileIndex = this.getBackIndex(actingChar, targetTileIndex);
		
		// Back Peddle:
		// Perform the back peddle first:
		// Blinking enemies will not blink into the tile
		// Wont take damage from explosions
		if (gs.isPassable(toTileIndex)) {
			actingChar.isMultiMoving = true;
			actingChar.body.moveToTileIndex(toTileIndex);
			actingChar.body.faceTileIndex(targetTileIndex);
		}
		
		// Attributes:
		let damage = Math.ceil(actingChar.weaponDamage() * this.attributes.meleeDamageMultiplier.value(actingChar));
	
		
		// Melee Attack:
		let targetChar = gs.getChar(targetTileIndex);
		let weapon = actingChar.inventory.getPrimaryWeapon();
		
		// Note we need to consider the player on his prevTileIndex for weapons to hit correctly
		actingChar.tileIndex = prevTileIndex;
		weapon.type.attackEffect.useOn(targetTileIndex, weapon, {damage: damage});
		actingChar.tileIndex = toTileIndex;
		
		// No speed point cost on kill strike:
		if (targetChar && !targetChar.isAlive && actingChar.talents.getTalentRank('Disengage') === 2) {
			gs.pc.gainSpeed(1);
		}
		
		// Shake Screen:
		game.camera.shake(0.010, 100);
	};
	
	// POWER_STRIKE:
	// Deals a critical hit and knocks the target back two tiles
	// ********************************************************************************************
	this.abilityTypes.PowerStrike = {};
	this.abilityTypes.PowerStrike.range = this.abilityRange.Weapon;
	this.abilityTypes.PowerStrike.showTarget = function (targetTileIndex) {
		let weapon = gs.pc.inventory.getPrimaryWeapon();	
		
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			weapon.type.attackEffect.showTarget(targetTileIndex);
		}
		else {
			gs.targetSprites.create(targetTileIndex, RED_SELECT_BOX_FRAME);
			gs.showTargetLine(targetTileIndex);
		}
	};
	this.abilityTypes.PowerStrike.canUseOn = function (actingChar, targetTileIndex) {
		let weapon = gs.pc.inventory.getPrimaryWeapon();
		
		return weapon.type.attackEffect.canUseOn(targetTileIndex, weapon);
	};
	this.abilityTypes.PowerStrike.canUse = this.abilityCanUse.MeleeWeapon;
	this.abilityTypes.PowerStrike.useOn = function (actingChar, targetTileIndex) {
		var flags, damage;
		
		// Attributes:
		damage = Math.ceil(actingChar.weaponDamage() * this.attributes.meleeDamageMultiplier.value(actingChar));
		
		
		// Flags:
		flags = {
			damage: damage,
			effectFunc: function (targetChar) {
				targetChar.body.applyKnockBack(util.normal(actingChar.tileIndex, targetTileIndex), 3);
			}
		};
		
		// Melee Attack:
		let weapon = actingChar.inventory.getPrimaryWeapon();
		weapon.type.attackEffect.useOn(targetTileIndex, weapon, flags);
		
		
		// Shake Screen:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 50);
		gs.playSound(gs.sounds.death, this.tileIndex);
	};
	
	// CYCLONE_STRIKE:
	// Deals a critical hit and knocks the target back two tiles
	// ********************************************************************************************
	this.abilityTypes.CycloneStrike = {};
	this.abilityTypes.CycloneStrike.useImmediately = true;
	this.abilityTypes.CycloneStrike.range = this.abilityRange.Weapon;
	
	this.abilityTypes.CycloneStrike.getUseError = function (actingChar) {
		let indexList = this.getIndexList(actingChar.tileIndex);
		
		indexList = indexList.filter(tileIndex => gs.getChar(tileIndex));
		
		if (indexList.length === 0) {
			actingChar.popUpText('No nearby hostiles!', 'Red');
			return true;
		}
		else {
			return false;
		}
	};
	
	this.abilityTypes.CycloneStrike.getIndexList = function () {
		let weapon = gs.pc.inventory.getPrimaryWeapon();
		let indexList = gs.getIndexListInRadius(gs.pc.tileIndex, gs.pc.weaponRange());
		
		indexList = indexList.filter(index => !util.vectorEqual(index, gs.pc.tileIndex));
		indexList = indexList.filter(index => gs.getChar(index) && gs.getChar(index).faction === FACTION.HOSTILE);
		indexList = indexList.filter(index => weapon.type.attackEffect.canUseOn(index, weapon));
		
		indexList.sort((a, b) => util.distance(b, gs.pc.tileIndex) - util.distance(a, gs.pc.tileIndex));
		
		return indexList;	
	};
	this.abilityTypes.CycloneStrike.showTarget = function (targetTileIndex) {
		let indexList = this.getIndexList();
		
		indexList.forEach(function (index) {
			gs.targetSprites.create(index, PURPLE_SELECT_BOX_FRAME);
		}, this);
	};
	this.abilityTypes.CycloneStrike.canUse = this.abilityCanUse.MeleeWeapon;
	this.abilityTypes.CycloneStrike.useOn = function (actingChar, targetTileIndex) {
		var flags, damage;
		
		// Attributes:
		damage = Math.ceil(actingChar.weaponDamage() * this.attributes.meleeDamageMultiplier.value(actingChar));
			
		let weapon = actingChar.inventory.getPrimaryWeapon();
		
		this.getIndexList().forEach(function (index) {
			let event;
			
			// Create event:
			event = {timer: 0, tileIndex: index};
			event.updateFrame = function () {
				// On the first tick:
				if (this.timer === 0) {
					let char = gs.getChar(this.tileIndex);
					
					if (char && char.isAlive) {
						let flags = {
							killer: actingChar,
							damage: damage,
							neverBlink: true, 
							procEffect: weapon.type.procEffect
						};
						
						// Damage:
						weapon.type.attackEffect.hitCharacter(char, damage, flags);
						
						// Triggering damage shields:
						actingChar.triggerDamageShield(char);
						
						// Knock Back:
						if (char && char.isAlive) {
							char.body.applyKnockBack(util.normal(actingChar.tileIndex, char.tileIndex), 3);
						}
						
						// Bounce and Face:
						actingChar.body.faceTileIndex(this.tileIndex);
						actingChar.body.bounceTowards(this.tileIndex);
						
						// Shake Screen:
						game.camera.shake(0.010, 100);
						game.camera.flash(0xffffff, 50);
						gs.playSound(gs.sounds.death, this.tileIndex);
					}
				}
				
				this.timer += 1;
			};
			
			event.isComplete = function () {
				return this.timer > 5;	
			};
			
			// Push event:
			actingChar.eventQueue.addEvent(event);
		}, this);
		
		
	};

	// CHARGE:
	// Charges towards a target and deals a critical hit + knockback
	// ********************************************************************************************
	this.abilityTypes.Charge = {};
	this.abilityTypes.Charge.dontEndTurn = true;
	this.abilityTypes.Charge.range = LOS_DISTANCE;
	this.abilityTypes.Charge.getPath = function (actingChar, targetTileIndex) {
		//return gs.pc.getPathTo(targetTileIndex, true);
		let safePath = gs.findPath(actingChar.tileIndex, targetTileIndex, {
			allowDiagonal: actingChar.movementSpeed > 0,
			avoidTraps: true,
			exploredOnly: true,
			canWalkFunc: actingChar.canWalk.bind(actingChar),
			maxDepth: 1000,
			character: actingChar,
		});
		
		let unsafePath = gs.findPath(actingChar.tileIndex, targetTileIndex, {
			allowDiagonal: actingChar.movementSpeed > 0,
			avoidTraps: false,
			exploredOnly: true,
			canWalkFunc: actingChar.canWalk.bind(actingChar),
			maxDepth: 1000,
			character: actingChar,
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
	};
	this.abilityTypes.Charge.showTarget = function (targetTileIndex) {
		var path;
		
		// Valid Target:
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			path = this.getPath(gs.pc, targetTileIndex);
		
			if (path && path.length > 0) {
				path.forEach(function (tileIndex, i) {
					if (i === 0) {
						gs.targetSprites.create(tileIndex, PURPLE_SELECT_BOX_FRAME);
					}
					else {
						gs.targetSprites.create(tileIndex, PURPLE_BOX_FRAME);
					}
				}, this);
				
				
			}
			
			// Crunch indicator:
			let normal;
			if (path.length > 1) {
				normal = util.get8WayVector(path[1], targetTileIndex);
			}
			else {
				normal = util.get8WayVector(gs.pc.tileIndex, targetTileIndex);
			}
			
			
			
			let wallCoord = {x: targetTileIndex.x + normal.x, y: targetTileIndex.y + normal.y};
			if (!gs.isStaticPassable(wallCoord)) {
				gs.targetSprites.create(wallCoord, PURPLE_SELECT_BOX_FRAME);
			}
		}
		// Invalid Target:
		else {
			gs.targetSprites.create(targetTileIndex, RED_SELECT_BOX_FRAME);
			gs.showTargetLine(targetTileIndex);
		}
	};
	this.abilityTypes.Charge.canUse = function (actingChar) {
		return gs.abilityCanUse.MeleeWeapon.call(this, actingChar)
			&& !actingChar.isImmobile;
	};
	
	this.abilityTypes.Charge.canUseOn = function (actingChar, targetTileIndex) {
		var path = this.getPath(gs.pc, targetTileIndex);
		
		return gs.isInBounds(targetTileIndex)
			&& gs.getChar(targetTileIndex, char => char !== actingChar)
			&& (gs.getChar(targetTileIndex).isSpriteDarkVisible() || gs.getTile(targetTileIndex).visible)
			&& gs.getChar(targetTileIndex).faction !== FACTION.NEUTRAL
			&& gs.getChar(targetTileIndex).faction !== FACTION.PLAYER
			&& !actingChar.cantMoveFromCharm(targetTileIndex)
			&& util.distance(actingChar.tileIndex, targetTileIndex) > 1.5
			&& path
			&& path.length > 1
			&& path.length <= this.attributes.maxPath.value(actingChar);
	};
	this.abilityTypes.Charge.useOn = function (actingChar, targetTileIndex) {
		var path = this.getPath(gs.pc, targetTileIndex),
			damage;

		for (let i = 0; i < path.length; i += 1) {
			actingChar.actionQueue[i] = {type: 'CLICK', tileIndex: path[i], allowUnsafeMove: true};
		}
		
		damage = Math.ceil(actingChar.weaponDamage() * this.attributes.meleeDamageMultiplier.value(actingChar));
		
		actingChar.isMultiMoving = true;
		actingChar.statusEffects.remove('Slow');
		actingChar.statusEffects.add('Charge', {damage: damage});
		gs.keyBoardMode = false;
	};
	
	
	// BERSERK:
	// Doubles the characters damage and movement speed
	// ********************************************************************************************
	/*
	this.abilityTypes.Berserk = {};
	this.abilityTypes.Berserk.useImmediately = true;
	this.abilityTypes.Berserk.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.Berserk.getTarget = this.abilityGetTarget.Self;
	this.abilityTypes.Berserk.useOn = function (actingChar) {
		// Attributes:
		let duration = this.attributes.duration.value(actingChar);
		let meleeDamageMultiplier = this.attributes.meleeDamageMultiplier.value(actingChar);
		
		// Casting Effect:
		gs.createFireEffect(actingChar.tileIndex);
		gs.playSound(gs.sounds.cure);
		
		// Status Effect:
		actingChar.statusEffects.add('Berserk', {duration: duration, meleeDamageMultiplier: meleeDamageMultiplier});
	};
	*/
	
	// WEAPON_SHIELD:
	// ********************************************************************************************
	this.abilityTypes.WeaponShield = {};
	this.abilityTypes.WeaponShield.useImmediately = true;
	this.abilityTypes.WeaponShield.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.WeaponShield.canUse = this.abilityCanUse.MeleeWeapon;
	this.abilityTypes.WeaponShield.useOn = function (actingChar) {
		var duration;
		
		// Attributes:
		duration = this.attributes.duration.value(actingChar);
		
		// Casting Effect:
		gs.createYellowMagicEffect(actingChar.tileIndex);
		gs.playSound(gs.sounds.cure);
		
		// Status Effect:
		actingChar.statusEffects.add('WeaponShield', {duration: duration});
	};
	
	
	// DASH_ATTACK:
	// ********************************************************************************************
	this.abilityTypes.DashAttack = {};
	this.abilityTypes.DashAttack.dontEndTurn = true;
	this.abilityTypes.DashAttack.range = LOS_DISTANCE;
	this.abilityTypes.DashAttack.getPath = function (targetTileIndex) {
		return gs.findPath(gs.pc.tileIndex, targetTileIndex, {
			allowDiagonal: gs.pc.movementSpeed > 0,
			exploredOnly: true,
			isValidTileIndex: gs.isStaticPassable,
			maxDepth: 1000,
			character: gs.pc,
		});
	};
	
	this.abilityTypes.DashAttack.showTarget = function (targetTileIndex) {
		// Valid Target:
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			let path = this.getPath(targetTileIndex);
		
			if (path && path.length > 0) {
				path.forEach(function (tileIndex, i) {
					if (i === 0) {
						gs.targetSprites.create(tileIndex, PURPLE_SELECT_BOX_FRAME);
					}
					else {
						gs.targetSprites.create(tileIndex, PURPLE_BOX_FRAME);
					}
				}, this);
			}
		}
		// Invalid Target:
		else {
			gs.targetSprites.create(targetTileIndex, RED_SELECT_BOX_FRAME);
			gs.showTargetLine(targetTileIndex);
		}
	};
	this.abilityTypes.DashAttack.canUse = function (actingChar) {
		return gs.abilityCanUse.MeleeWeapon.call(this, actingChar)
			&& !actingChar.isImmobile;
	};
	
	this.abilityTypes.DashAttack.canUseOn = function (actingChar, targetTileIndex) {
		let path = this.getPath(targetTileIndex);
		
		return gs.isInBounds(targetTileIndex)
			&& gs.isPassable(targetTileIndex)
			&& (gs.isRayClear(actingChar.tileIndex, targetTileIndex) || gs.getTile(targetTileIndex).visible)
			&& !actingChar.cantMoveFromCharm(targetTileIndex)
			&& path
			&& path.length <= actingChar.currentSp;
	};
	this.abilityTypes.DashAttack.useOn = function (actingChar, targetTileIndex) {
		let path = this.getPath(targetTileIndex);

		for (let i = 0; i < path.length; i += 1) {
			actingChar.actionQueue[i] = {type: 'CLICK', tileIndex: path[i]};
		}
		
		let damage = Math.ceil(actingChar.weaponDamage() * this.attributes.meleeDamageMultiplier.value(actingChar));
		
		actingChar.isMultiMoving = true;
		actingChar.statusEffects.add('DashAttack', {damage: damage});
		gs.keyBoardMode = false;
		
		// Place the player on the final tileIndex to stop slimes from spreading, enemies from blinking etc.
		gs.getTile(targetTileIndex).character = actingChar;
	};
	
	// SECOND_WIND:
	// ********************************************************************************************
	this.abilityTypes.SecondWind = {};
	this.abilityTypes.SecondWind.useImmediately = true;
	this.abilityTypes.SecondWind.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.SecondWind.getTarget = this.abilityGetTarget.Self;
	this.abilityTypes.SecondWind.useOn = function (actingChar) {
		// Attributes:
		let amount = this.attributes.restoreSp.value(actingChar);
				
		// Casting Effect:
		gs.createIceEffect(actingChar.tileIndex);
		gs.playSound(gs.sounds.cure);
		
		// Healing Effect:
		actingChar.gainSpeed(amount);
		
		// Popup Text:
		actingChar.popUpText('SecondWind');
		actingChar.popUpText('+' + amount + 'SP', 'White');
	};
	
	// ********************************************************************************************
	// RANGE_ABILITIES:
	// ********************************************************************************************
	// POWER_SHOT:
	// Fires a single projectile from the players weapon which crit hits and deals knock back
	// ********************************************************************************************
	this.abilityTypes.PowerShot = {};
	this.abilityTypes.PowerShot.range = this.abilityRange.Weapon;
	this.abilityTypes.PowerShot.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.PowerShot.canUseOn = function (actingChar, targetTileIndex) {
		let weapon = gs.pc.inventory.getRangeWeapon();
		return weapon.type.attackEffect.canUseOn(targetTileIndex, weapon);
	};
	this.abilityTypes.PowerShot.canUse = this.abilityCanUse.RangeWeapon;
	this.abilityTypes.PowerShot.useOn = function (actingChar, targetTileIndex) {
		var proj, flags, damage;
		
		// Attributes:
		damage = Math.ceil(actingChar.rangeWeaponDamage() * this.attributes.rangeDamageMultiplier.value(actingChar));
		
		// Projectile Flags:
		flags = {
			knockBack: 2,
			neverBlink: true,
		};
		
		// Create Projectile:
		proj = actingChar.inventory.getRangeWeapon().type.attackEffect.useOn(targetTileIndex, actingChar.inventory.getRangeWeapon(), flags);
		proj.damage = damage;
	};

	
	// TUNNEL_SHOT:
	// Fires a single projectile from the players weapon which passes through targets crit hitting all of them
	// ********************************************************************************************
	this.abilityTypes.TunnelShot = {};
	this.abilityTypes.TunnelShot.range = this.abilityRange.RangeWeapon;
	this.abilityTypes.TunnelShot.canUse = this.abilityCanUse.RangeWeapon;
	this.abilityTypes.TunnelShot.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	
	this.abilityTypes.TunnelShot.getTileIndexList = function (actingChar, targetTileIndex) {
		let normal = util.normal(actingChar.tileIndex, targetTileIndex);
		let lastTileIndex = {x: actingChar.tileIndex.x + normal.x * this.range(actingChar),
							 y: actingChar.tileIndex.y + normal.y * this.range(actingChar)};
		let indexList = gs.getIndexInBRay(actingChar.tileIndex, lastTileIndex);
		let validIndexList = [];
		
		for (let i = 0; i < indexList.length; i += 1) {
			if (gs.isStaticProjectilePassable(indexList[i])) {
				validIndexList.push(indexList[i]);
			}
			else {
				break;
			}
		}
		
		return validIndexList;
	};
	
	this.abilityTypes.TunnelShot.showTarget = function (targetTileIndex) {
		// Valid target:
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			let indexList = this.getTileIndexList(gs.pc, targetTileIndex);
			
			indexList.forEach(function (tileIndex) {
				// Target Cursor:
				if (util.vectorEqual(tileIndex, targetTileIndex)) {
					gs.targetSprites.create(tileIndex, PURPLE_SELECT_BOX_FRAME); 
				}
				// Target Monster:
				else if (gs.getChar(tileIndex) && gs.pc.canSeeCharacter(gs.getChar(tileIndex))) {
					gs.targetSprites.create(tileIndex, PURPLE_SELECT_BOX_FRAME); 
				}
				// Default:
				else {
					gs.targetSprites.create(tileIndex, PURPLE_BOX_FRAME);	
				}
						 			  
			}, this);
			
		}
		// Invalid Target:
		else {
			gs.targetSprites.create(targetTileIndex, RED_SELECT_BOX_FRAME);
			gs.showTargetLine(targetTileIndex);
		}
	};
	
	this.abilityTypes.TunnelShot.useOn = function (actingChar, targetTileIndex) {
		
		// Attributes:
		let damage = Math.ceil(actingChar.rangeWeaponDamage() * this.attributes.rangeDamageMultiplier.value(actingChar));
		
		// Projectile Flags:
		let flags = {
			isTunnelShot: true,
			hitTileIndexList: this.getTileIndexList(actingChar, targetTileIndex)
		};
		
		let proj = actingChar.inventory.getRangeWeapon().type.attackEffect.useOn(targetTileIndex, actingChar.inventory.getRangeWeapon(), flags);
		proj.damage = damage;
	};
	
	// STORM_SHOT:
	// ********************************************************************************************
	this.abilityTypes.StormShot = {};
	this.abilityTypes.StormShot.range = this.abilityRange.Weapon;
	this.abilityTypes.StormShot.getIndexList = function (actingChar, targetTileIndex) {
		if (util.vectorEqual(actingChar.tileIndex, targetTileIndex)) {
			return null;
		}
		
		let delta = util.get8WayVector(actingChar.tileIndex, targetTileIndex),
			list;
		
		if (delta.x === 1 && delta.y === 0) 	list = [{x: 1, y: 0}, {x: 1, y: -1}, {x: 1, y: 1}];
		if (delta.x === -1 && delta.y === 0) 	list = [{x: -1, y: 0}, {x: -1, y: -1}, {x: -1, y: 1}];
		if (delta.x === 0 && delta.y === 1) 	list = [{x: 0, y: 1}, {x: 1, y: 1}, {x: -1, y: 1}];
		if (delta.x === 0 && delta.y === -1) 	list = [{x: 0, y: -1}, {x: 1, y: -1}, {x: -1, y: -1}];
		
		if (delta.x === 1 && delta.y === 1)		list = [{x: 1, y: 1}, {x: 1, y: 0}, {x: 0, y: 1}];
		if (delta.x === -1 && delta.y === 1)	list = [{x: -1, y: 1}, {x: -1, y: 0}, {x: 0, y: 1}];
		if (delta.x === 1 && delta.y === -1)	list = [{x: 1, y: -1}, {x: 1, y: 0}, {x: 0, y: -1}];
		if (delta.x === -1 && delta.y === -1)	list = [{x: -1, y: -1}, {x: -1, y: 0}, {x: 0, y: -1}];
		
		return list;
	};
	this.abilityTypes.StormShot.showTarget = function (targetTileIndex) {
		let indexList = this.getIndexList(gs.pc, targetTileIndex);
		
		if (indexList) {
			indexList.forEach(function (tileIndex) {
				gs.targetSprites.create({x: gs.pc.tileIndex.x + tileIndex.x, y: gs.pc.tileIndex.y + tileIndex.y}, PURPLE_SELECT_BOX_FRAME);
			}, this);
		}
		else {
			gs.targetSprites.create(targetTileIndex, RED_SELECT_BOX_FRAME);
		}
		
	};
	this.abilityTypes.StormShot.canUseOn = function (actingChar, targetTileIndex) {
		let indexList = this.getIndexList(actingChar, targetTileIndex);
		
		return indexList && indexList.length > 0;
	};
	this.abilityTypes.StormShot.canUse = this.abilityCanUse.RangeWeapon;
	this.abilityTypes.StormShot.useOn = function (actingChar, targetTileIndex) {		
		// Attributes:
		let damage = Math.ceil(actingChar.rangeWeaponDamage() * this.attributes.rangeDamageMultiplier.value(actingChar));
		
		let flags = {
			damage: damage, 
			delta: util.get8WayVector(actingChar.tileIndex, targetTileIndex),
			indexList: this.getIndexList(actingChar, targetTileIndex)	
		};
		
		// Status Effect:
		actingChar.statusEffects.add('StormShot', flags);

	};
	
	// DEAD_EYE:
	// ********************************************************************************************
	this.abilityTypes.DeadEye = {};
	this.abilityTypes.DeadEye.useImmediately = true;
	this.abilityTypes.DeadEye.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.DeadEye.useOn = function (actingChar) {
		var duration;
		
		// Attributes:
		duration = this.attributes.duration.value(actingChar);
		
		// Status Effect:
		actingChar.statusEffects.add('DeadEye', {duration: duration});
	};
	
	// ********************************************************************************************
	// STEALTH_ABILITIES:
	// ********************************************************************************************
	// SLEEP_BOMB:
	// ************************************************************************************************
	this.abilityTypes.SleepBomb = {};
	this.abilityTypes.SleepBomb.showTarget = this.abilityShowTarget.TBAoE;
	this.abilityTypes.SleepBomb.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleTileRay.call(this, actingChar, targetTileIndex);
	};
	this.abilityTypes.SleepBomb.useOn = function (actingChar, targetTileIndex) {
		var flags;
		
		flags = {
			duration: this.attributes.duration.value(actingChar),
			aoeRange: this.attributes.aoeRange.value(actingChar),
		};
		
		// Create projectile:
		gs.createProjectile(actingChar, targetTileIndex, 'SleepBomb', 0, this.range, flags);
			
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Play sound:
		gs.playSound(gs.sounds.throw, actingChar.tileIndex);
	}; 
	
	// SLEEPING_DART:
	// ************************************************************************************************
	this.abilityTypes.SleepingDart = {};
	this.abilityTypes.SleepingDart.range = ABILITY_RANGE;
	this.abilityTypes.SleepingDart.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.SleepingDart.canUseOn = this.abilityCanUseOn.SingleCharacterRay;
	this.abilityTypes.SleepingDart.useOn = function (actingChar, targetTileIndex) {
		var flags;
		
		flags = {
			duration: this.attributes.duration.value(actingChar)
		};
		
		// Create projectile:
		gs.createProjectile(actingChar, targetTileIndex, 'SleepingDart', 0, this.range, flags);
		
		// Play sound:
		gs.playSound(gs.sounds.throw, actingChar.tileIndex);
		
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
	}; 
	
	
	
	// BEAR_TRAP:
	// ************************************************************************************************
	this.abilityTypes.BearTrap = {};
	this.abilityTypes.BearTrap.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.BearTrap.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleTileRay.call(this, actingChar, targetTileIndex)
			&& !gs.getChar(targetTileIndex)
			&& (!gs.getObj(targetTileIndex) || gs.getObj(targetTileIndex, obj => obj.type.canOverWrite))
			&& !gs.isPit(targetTileIndex);
	};
	this.abilityTypes.BearTrap.useOn = function (actingChar, targetTileIndex) {
		// Attributes:
		let damage = this.attributes.damage.value(actingChar);
		let numTraps = this.attributes.numTraps.value(actingChar);
		
		// Poof existing traps:
		let existingTraps = gs.objectList.filter(obj => obj.type.name === 'BearTrap' && obj.placedByPlayer);
		if (existingTraps.length >= numTraps) {
			// Find the oldest i.e. lowest id one:
			existingTraps.sort((objA, objB) => objA.id - objB.id);
			let oldestTrap = existingTraps[0];
			
			gs.createPopUpTextAtTileIndex(oldestTrap.tileIndex, 'Poof!');
			gs.destroyObject(oldestTrap);
				
		}
		
		// Create projectile:
		gs.createProjectile(actingChar, targetTileIndex, 'BearTrap', damage, this.range, {killer: actingChar});
	
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Play sound:
		gs.playSound(gs.sounds.throw, actingChar.tileIndex);
	};
	
	// VANISH:
	// ************************************************************************************************
	this.abilityTypes.Vanish = {};
	this.abilityTypes.Vanish.useImmediately = true;
	this.abilityTypes.Vanish.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.Vanish.useOn = function (actingChar) {
		gs.pc.clearAgro();
		gs.createParticlePoof(actingChar.tileIndex, 'SMOKE');
		actingChar.statusEffects.add('Vanish', {duration: 11});
		
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// ********************************************************************************************
	// FIRE_MAGIC_ABILITIES:
	// ********************************************************************************************
	// FIRE_BALL:
	// ********************************************************************************************
	this.abilityTypes.FireBall = {};
	this.abilityTypes.FireBall.isSpell = true;
	this.abilityTypes.FireBall.aoeRange = 1.0;
	this.abilityTypes.FireBall.noParticlePoof = true;
	this.abilityTypes.FireBall.showTarget = this.abilityShowTarget.TBAoE;
	this.abilityTypes.FireBall.canUseOn = this.abilityCanUseOn.SingleTileRay;
	this.abilityTypes.FireBall.useOn = function (actingChar, targetTileIndex) {
		var damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		// Create projectile:
		gs.createProjectile(actingChar, targetTileIndex, 'FireBall', damage, this.range, {killer: actingChar});
	
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Effect:
		gs.createMagicShootEffect(actingChar, targetTileIndex, 'FireShoot');
		
		// Play sound:
		gs.playSound(gs.sounds.throw, actingChar.tileIndex);
	};
	
	// FLAME_BOLT:
	// ********************************************************************************************
	this.abilityTypes.FlameBolt = {};
	this.abilityTypes.FlameBolt.isSpell = true;
	this.abilityTypes.FlameBolt.useSquareRange = true;
	this.abilityTypes.FlameBolt.showTarget = this.abilityShowTarget.Bolt;
	this.abilityTypes.FlameBolt.canUseOn = this.abilityCanUseOn.Bolt;
	this.abilityTypes.FlameBolt.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.FlameBolt.useOn = function (actingChar, targetTileIndex) {
		var indexList, damage, cloudName;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		// Targets:
		indexList = gs.getIndexInBRay(actingChar.tileIndex, targetTileIndex);
		
		// Effect (using events):
		indexList.forEach(function (tileIndex) {
			var event;
			
			// Create event:
			event = {timer: 0};
			event.updateFrame = function () {
				// On the first tick:
				if (this.timer === 0) {
					gs.createCloud(tileIndex, 'FlamingCloud', damage, 4);
					
					gs.playSound(gs.sounds.fire, tileIndex);
					
					// Light Effect:
					gs.createLightCircle(util.toPosition(tileIndex), '#ff0000', 60, 10);
				}
				
				this.timer += 1;
				
			};
			event.isComplete = function () {
				return this.timer > 2;	
			};
			
			// Push event:
			actingChar.eventQueue.addEvent(event);
		}, this);
		
		// Character bounce and face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		gs.createLightCircle(util.toPosition(actingChar.tileIndex), '#ff0000', 60, 20);
	};

	// BURST_OF_FLAME:
	// ********************************************************************************************
	this.abilityTypes.BurstOfFlame = {};
	this.abilityTypes.BurstOfFlame.isSpell = true;
	this.abilityTypes.BurstOfFlame.aoeRange = 3;
	this.abilityTypes.BurstOfFlame.showTarget = this.abilityShowTarget.BurstOfFlame;

	this.abilityTypes.BurstOfFlame.getIndexList = function (actingChar, targetTileIndex) {
		let indexList = [];
		
		// Wall Objects (Torches):
		if (!gs.getTile(targetTileIndex).type.passable) {
			let x = targetTileIndex.x;
			let y = targetTileIndex.y;
			
			// Left:
			if (gs.isStaticPassable(x - 1, y + 1)) {
				indexList.push({x: x - 1, y: y + 1});
				if (gs.isStaticPassable(x - 2, y + 2)) {
					indexList.push({x: x - 2, y: y + 2});
				}
			}
			
			// Center:
			if (gs.isStaticPassable(x, y + 1)) {
				indexList.push({x: x, y: y + 1});
			
				if (gs.isStaticPassable(x, y + 2)) {
					indexList.push({x: x, y: y + 2});
					
					if (gs.isStaticPassable(x, y + 3)) {
						indexList.push({x: x, y: y + 3});
					}
				}
				
				if (gs.isStaticPassable(x - 1, y + 2)) {
					indexList.push({x: x - 1, y: y + 2});
				}
				
				if (gs.isStaticPassable(x + 1, y + 2)) {
					indexList.push({x: x + 1, y: y + 2});
				}
			}
			
			// Right:
			if (gs.isStaticPassable(x + 1, y + 1)) {
				indexList.push({x: x + 1, y: y + 1});
				if (gs.isStaticPassable(x + 2, y + 2)) {
					indexList.push({x: x + 2, y: y + 2});
				}
			}
		}
		// Freestanding Objects:
		else {
			indexList = gs.getIndexListInRadius(targetTileIndex, this.aoeRange(actingChar));
			indexList = indexList.filter(index => gs.isStaticPassable(index));
			indexList = indexList.filter(index => gs.isRayStaticPassable(index, targetTileIndex));
			indexList = indexList.filter(index => index.x === targetTileIndex.x || index.y === targetTileIndex.y);
		}
		
		return indexList;
	};
	this.abilityTypes.BurstOfFlame.canUseOn = function (actingChar, targetTileIndex) {
		return (gs.getTile(targetTileIndex).visible || gs.isRayStaticPassable(actingChar.tileIndex, targetTileIndex))
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& (gs.isPassable(targetTileIndex) || gs.getChar(targetTileIndex) || gs.canBurstOfFlame(targetTileIndex));
	};
	this.abilityTypes.BurstOfFlame.useOn = function (actingChar, targetTileIndex) {
		// Attributes:
		let damage = this.attributes.damage.value(actingChar);
		
		// Used on flaming object or cloud:
		if (gs.canBurstOfFlame(targetTileIndex)) {
			// Create burst flames:
			this.getIndexList(actingChar, targetTileIndex).forEach(function (tileIndex) {
				gs.createFire(tileIndex, damage, {killer: actingChar});
			}, this);
			
			// At Rank-II there is a 50% chance not to consume the object:
			if (gs.pc.talents.getTalentRank('BurstOfFlame') === 1 || util.frac() <= 0.5) {
				gs.extinguishObject(targetTileIndex);
			}
			
			// Destroy Cloud:
			if (gs.getCloud(targetTileIndex, cloud => cloud.type.canBurstOfFlame)) {
				gs.getCloud(targetTileIndex).destroy();
			}
		}
		// Used on ground or enemy:
		else {
			gs.createFire(targetTileIndex, damage, {killer: actingChar});
		}
		
		
		
		
		
	};
	
	// FLAMING_BATTLE_SPHERE:
	// ********************************************************************************************
	this.abilityTypes.FlamingBattleSphere = {};
	this.abilityTypes.FlamingBattleSphere.isSpell = true;
	this.abilityTypes.FlamingBattleSphere.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.FlamingBattleSphere.canUseOn = function (actingChar, targetTileIndex) {
		return (gs.getTile(targetTileIndex).visible || gs.isRayStaticPassable(actingChar.tileIndex, targetTileIndex))
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& gs.isPassable(targetTileIndex);
	};
	this.abilityTypes.FlamingBattleSphere.useOn = function (actingChar, targetTileIndex) {
		// Attributes:
		let monsterLevel = this.attributes.monsterLevel.value(actingChar);
		let duration = this.attributes.duration.value(actingChar);
		
		// Create Battle Sphre:
		gs.createSummonEffect(targetTileIndex, function () {
			let npc = gs.createNPC(targetTileIndex, 'FlamingBattleSphere', {level: monsterLevel});
			npc.faction = FACTION.PLAYER;
			npc.popUpText('Summoned');
			npc.isAgroed = true;
			actingChar.summonIDList.push(npc.id);
			npc.summonerId = actingChar.id;
			npc.summonDuration = duration; // No duration
		}, this);

		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// FIRE_STORM:
	// ********************************************************************************************
	this.abilityTypes.FireStorm = {};
	this.abilityTypes.FireStorm.isSpell = true;
	this.abilityTypes.FireStorm.useImmediately = true;
	this.abilityTypes.FireStorm.canUseOn = gs.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.FireStorm.showTarget = gs.abilityShowTarget.PBAoE;
	this.abilityTypes.FireStorm.useOn = function (actingChar, targetTileIndex) {		
		// Attributes:
		let damage = this.attributes.damage.value(actingChar);
		let aoeRange = this.attributes.aoeRange.value(actingChar);
		
		let flags = {
			damage: damage, 
			aoeRange: this.attributes.aoeRange.value(actingChar)
		};
		
		// Status Effect:
		actingChar.statusEffects.add('FireStorm', flags);
	};
	
	
	// STICKY_FLAME:
	// ********************************************************************************************
	this.abilityTypes.StickyFlame = {};
	this.abilityTypes.StickyFlame.isSpell = true;
	this.abilityTypes.StickyFlame.useSquareRange = true;
	this.abilityTypes.StickyFlame.showTarget = this.abilityShowTarget.Bolt;
	this.abilityTypes.StickyFlame.canUseOn = this.abilityCanUseOn.Bolt;
	this.abilityTypes.StickyFlame.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.StickyFlame.useOn = function (actingChar, targetTileIndex) {
		// Attributes:
		let damage = this.attributes.damage.value(actingChar);
		
		// Targets:
		let indexList = gs.getIndexInBRay(actingChar.tileIndex, targetTileIndex);
		
		// Effect (using events):
		indexList.forEach(function (tileIndex) {
			var event;
			
			// Create event:
			event = {timer: 0};
			event.updateFrame = function () {
				// On the first tick:
				if (this.timer === 0) {
					gs.createFire(tileIndex, damage, {killer: actingChar});
					
					if (gs.getChar(tileIndex)) {
						gs.getChar(tileIndex).statusEffects.add('StickyFlame', {damage: damage});
					}
				}
				
				this.timer += 1;
				
			};
			event.isComplete = function () {
				return this.timer > 2;	
			};
			
			// Push event:
			actingChar.eventQueue.addEvent(event);
		}, this);
		
		// Character bounce and face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		gs.createLightCircle(util.toPosition(actingChar.tileIndex), '#ff0000', 60, 20);
	};
	

	
	// FLAME_STRIKE:
	// ********************************************************************************************
	this.abilityTypes.FireStrike = {};
	this.abilityTypes.FireStrike.isSpell = true;
	this.abilityTypes.FireStrike.range = ABILITY_RANGE;
	this.abilityTypes.FireStrike.dontEndTurn = true;
	this.abilityTypes.FireStrike.noParticlePoof = true;
	this.abilityTypes.FireStrike.useMana = false;
	this.abilityTypes.FireStrike.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.FireStrike.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.FireStrike.getTarget = this.abilityGetTarget.Bolt;
	this.abilityTypes.FireStrike.useOn = function (actingChar, targetTileIndex) {
		
		// Transition to completeAbility:
		this.completeAbility.startTileIndex = targetTileIndex;
		actingChar.selectedAbility = {type: this.completeAbility, coolDown: 0};
		gs.stateManager.pushState('UseAbility');
	};
	
	this.abilityTypes.FireStrike.completeAbility = Object.create(this.abilityTypes.FireStrike);
	this.abilityTypes.FireStrike.completeAbility.dontEndTurn = false;
	this.abilityTypes.FireStrike.completeAbility.isNotRoot = true;
	this.abilityTypes.FireStrike.completeAbility.noParticlePoof = false;
	this.abilityTypes.FireStrike.completeAbility.niceName = 'Select end point';
	this.abilityTypes.FireStrike.completeAbility.useMana = true;
	this.abilityTypes.FireStrike.completeAbility.canUseOn = function (actingChar, targetTileIndex) {
		return gs.isInBounds(targetTileIndex)
			&& !util.vectorEqual(this.startTileIndex, targetTileIndex)
			&& util.distance(this.startTileIndex, targetTileIndex) <= this.range(actingChar)
			&& gs.isBRay(this.startTileIndex, targetTileIndex, gs.isStaticProjectilePassable);
	};
	this.abilityTypes.FireStrike.completeAbility.getIndexList = function (targetTileIndex) {
		let indexList = [this.startTileIndex];
		
		indexList = indexList.concat(gs.getIndexInBRay(this.startTileIndex, targetTileIndex));
		
		return indexList; 
	};
	this.abilityTypes.FireStrike.completeAbility.showTarget = function (targetTileIndex) {		
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			// Show Target Sprites:
			this.getIndexList(targetTileIndex).forEach(function (index) {
				if (util.vectorEqual(this.startTileIndex, index) || util.vectorEqual(targetTileIndex, index)) {
					gs.targetSprites.create(index, PURPLE_SELECT_BOX_FRAME);
				}
				else {
					gs.targetSprites.create(index, PURPLE_BOX_FRAME);
				}
			}, this);
		}
		else {
			gs.targetSprites.create(this.startTileIndex, RED_SELECT_BOX_FRAME);
		}
				
		
	};
	this.abilityTypes.FireStrike.completeAbility.useOn = function (actingChar, targetTileIndex) {		
		// Attributes:
		let damage = this.attributes.damage.value(actingChar);
				
		let indexList = this.getIndexList(targetTileIndex);
		
		indexList.forEach(function (index) {
			gs.createFire(index, damage, {killer: actingChar});
		}, this);
		
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 50);
		
		// Sound:
		gs.playSound(gs.sounds.bolt, actingChar.tileIndex);
	};
	
	// WALL_OF_FIRE:
	// ********************************************************************************************
	this.abilityTypes.WallOfFire = {};
	this.abilityTypes.WallOfFire.isSpell = true;
	this.abilityTypes.WallOfFire.range = 4.0;
	this.abilityTypes.WallOfFire.showTarget = function (targetTileIndex) {
		
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			let indexList = this.getIndexList(gs.pc, targetTileIndex);
			let normal = util.get8WayVector(gs.pc.tileIndex, targetTileIndex);
			let tileIndex = {x: gs.pc.tileIndex.x + normal.x, y: gs.pc.tileIndex.y + normal.y};
		
			indexList.forEach(function (index) {
				if (util.vectorEqual(index, tileIndex)) {
					gs.targetSprites.create(index, PURPLE_SELECT_BOX_FRAME);
				}
				else {
					gs.targetSprites.create(index, PURPLE_BOX_FRAME);
				}
			}, this);
		}
		// Invalid Target:
		else {
			gs.targetSprites.create(targetTileIndex, RED_SELECT_BOX_FRAME);
			gs.showTargetLine(targetTileIndex);
		}
		
		
	};
	this.abilityTypes.WallOfFire.canUseOn = function (actingChar, targetTileIndex) {
		let indexList = this.getIndexList(actingChar, targetTileIndex);
		
		return !util.vectorEqual(actingChar.tileIndex, targetTileIndex)
			&& indexList.length > 0;
	};
	this.abilityTypes.WallOfFire.getIndexList = function (actingChar, targetTileIndex) {
		let list;
		let rank = actingChar.talents.getTalentRank('WallOfFire');
		
		let normal = util.get8WayVector(actingChar.tileIndex, targetTileIndex);
		let tileIndex = {x: actingChar.tileIndex.x + normal.x, y: actingChar.tileIndex.y + normal.y};
		
		if (rank === 1) {
			list = [tileIndex];
		}
		else if (rank === 2) {
			list = gs.getIndexListInRadius(actingChar.tileIndex, 1.5);
			list = list.filter(index => util.isCardinallyAdjacent(index, tileIndex));
			list = list.filter(index => !util.vectorEqual(index, actingChar.tileIndex));
			list.push(tileIndex);
		}
		else if (rank === 3) {
			list = gs.getIndexListInRadius(actingChar.tileIndex, 3.0);
			list = list.filter(index => util.distance(index, tileIndex) <= 1.5);
			list = list.filter(index => !util.vectorEqual(index, actingChar.tileIndex));
			list.push(tileIndex);
		}
		
		list = list.filter(index => gs.isStaticPassable(index));
		list = list.filter(index => gs.isRayStaticPassable(actingChar.tileIndex, index));
		
		return list;
	};
	this.abilityTypes.WallOfFire.useOn = function (actingChar, targetTileIndex) {
		var indexList, damage, duration;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		duration = this.attributes.duration.value(actingChar);
		
		indexList = this.getIndexList(actingChar, targetTileIndex);
		
		indexList.forEach(function (tileIndex) {
			if (gs.isStaticPassable(tileIndex)) {
				gs.createCloud(tileIndex, 'FlamingCloud', damage, duration);
			}
		}, this);
	};

	
	// ********************************************************************************************
	// STORM_MAGIC_ABILITIES:
	// ********************************************************************************************	
	// LIGHTNING_BOLT:
	// ********************************************************************************************
	this.abilityTypes.LightningBolt = {};
	this.abilityTypes.LightningBolt.isSpell = true;
	this.abilityTypes.LightningBolt.useSquareRange = true;
	this.abilityTypes.LightningBolt.showTarget = this.abilityShowTarget.Bolt;
	this.abilityTypes.LightningBolt.canUseOn = this.abilityCanUseOn.Bolt;
	this.abilityTypes.LightningBolt.getTarget = this.abilityGetTarget.Bolt;
	this.abilityTypes.LightningBolt.useOn = function (actingChar, targetTileIndex) {
		var indexList, damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		// Create Shock:
		indexList = gs.getIndexInBRay(actingChar.tileIndex, targetTileIndex);
		indexList.forEach(function (tileIndex) {
			// Create event:
			let event = {timer: 0, tileIndex: tileIndex};
			event.updateFrame = function () {
				if (this.timer === 0) {
					gs.createShock(tileIndex, damage, {killer: actingChar});
				}
				
				this.timer += 1;
			};
			
			event.isComplete = function () {
				return this.timer > 2;	
			};
			
			// Push event:
			actingChar.eventQueue.addEvent(event);
		}, this);
	
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 50);
		
		// Sound:
		gs.playSound(gs.sounds.bolt, actingChar.tileIndex);
	};

	// BURST_OF_WIND:
	// ********************************************************************************************
	this.abilityTypes.BurstOfWind = {};
	this.abilityTypes.BurstOfWind.isSpell = true;
	this.abilityTypes.BurstOfWind.useImmediately = true;
	this.abilityTypes.BurstOfWind.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.BurstOfWind.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.BurstOfWind.showTarget = this.abilityShowTarget.PBAoE;
	this.abilityTypes.BurstOfWind.useOn = function (actingChar) {
		// Attributes:
		let damage = this.attributes.damage.value(actingChar);
		let knockBack = this.attributes.knockBack.value(actingChar);
		
		// Index List:
		let indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.aoeRange(actingChar));
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		indexList = indexList.filter(index => gs.getChar(index));
		
		// Sort to handle furthest characters first:
		indexList.sort((a, b) => util.distance(actingChar.tileIndex, b) - util.distance(actingChar.tileIndex, a));
		
		// Effect:
		indexList.forEach(function (tileIndex) {
			let targetChar = gs.getChar(tileIndex);
			
			if (targetChar) {
				// Damage:
				targetChar.takeDamage(damage, 'Physical', {killer: actingChar, neverBlink: true});

				// Knockback:
				if (targetChar.isAlive) {
					let delta = util.get8WayVector(actingChar.tileIndex, tileIndex);
					targetChar.body.applyKnockBack(delta, knockBack);
				}
			}
		}, this);
		
		// Particle Effect:
		gs.getIndexListAdjacent(actingChar.tileIndex).forEach(function (tileIndex) {
			let delta = util.get8WayVector(actingChar.tileIndex, tileIndex);
			
			// Particles:
			gs.createParticleBurst(actingChar.sprite.position, delta, 'WHITE');
		}, this);
		
		// Popup Text:
		actingChar.popUpText('Burst of Wind');
		
		// Lighting:
		gs.createLightCircle(actingChar.sprite.position, '#cbd7d8', 120, 30, '88');
				
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 59);
		
		// Sound:
		gs.playSound(gs.sounds.bolt, actingChar.tileIndex);	
	};
	
	// SHOCK:
	// ********************************************************************************************
	this.abilityTypes.Shock = {};
	this.abilityTypes.Shock.isSpell = true;
	this.abilityTypes.Shock.getIndexList = function (actingChar, targetTileIndex) {
		let spread = this.attributes.spread.value(actingChar);
		
		let pred = function (tileIndex) {
			return gs.getChar(tileIndex)
				&& gs.getChar(tileIndex).faction === FACTION.HOSTILE
				&& gs.getChar(tileIndex) !== gs.pc;
		};
		
		return gs.getIndexListInFlood(targetTileIndex, tileIndex => pred(tileIndex), spread);
	};
	this.abilityTypes.Shock.showTarget = function (targetTileIndex) {
		// Can use on:
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			let indexList = this.getIndexList(gs.pc, targetTileIndex);
		
			indexList.forEach(function (tileIndex, i) {
				if (util.vectorEqual(tileIndex, targetTileIndex)) {
					gs.targetSprites.create(tileIndex, PURPLE_SELECT_BOX_FRAME);
				}
				else {
					gs.targetSprites.create(tileIndex, PURPLE_BOX_FRAME);
				}
			}, this);
		}
		// Invalid target (show red target line):
		else {
			gs.targetSprites.create(targetTileIndex, RED_SELECT_BOX_FRAME);
			gs.showTargetLine(targetTileIndex);
		}
		
	};
	this.abilityTypes.Shock.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterRay.call(this, actingChar, targetTileIndex)
			&& !gs.getChar(targetTileIndex).type.isDamageImmune;
	};
	this.abilityTypes.Shock.useOn = function (actingChar, targetTileIndex) {
		// Attributes:
		let damage = this.attributes.damage.value(actingChar);
		
		// Index List:
		let indexList = this.getIndexList(actingChar, targetTileIndex);

		indexList.forEach(function (tileIndex) {
			// Create event:
			let event = {timer: 0, tileIndex: tileIndex};
			event.updateFrame = function () {
				if (this.timer === 0) {
					gs.createShock(tileIndex, damage, {killer: actingChar});
				}
				
				this.timer += 1;
			};
			
			event.isComplete = function () {
				return this.timer > 2;	
			};
			
			// Push event:
			actingChar.eventQueue.addEvent(event);
		}, this);
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 50);
		
		// Sound:
		gs.playSound(gs.sounds.bolt, actingChar.tileIndex);
		
	};

	// STATIC_DISCHARGE:
	// ********************************************************************************************
	this.abilityTypes.StaticDischarge = {};
	this.abilityTypes.StaticDischarge.isSpell = true;
	this.abilityTypes.StaticDischarge.useImmediately = true;
	this.abilityTypes.StaticDischarge.aoeRange = 3.0;
	this.abilityTypes.StaticDischarge.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.StaticDischarge.showTarget = this.abilityShowTarget.PBAoE;
	this.abilityTypes.StaticDischarge.useOn = function (actingChar) {
		var indexList, damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.aoeRange(actingChar));
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		
		indexList.forEach(function (tileIndex) {
			gs.createShock(tileIndex, damage, {killer: actingChar});
		}, this);
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 59);
		
		// Sound:
		gs.playSound(gs.sounds.bolt, actingChar.tileIndex);	
	};
	


	// ********************************************************************************************
	// NECROMANCER_ABILITIES:
	// ********************************************************************************************
	// LIFE_SPIKE:
	this.abilityTypes.LifeSpike = {};
	this.abilityTypes.LifeSpike.isSpell = true;
	this.abilityTypes.LifeSpike.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.LifeSpike.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.LifeSpike.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterRay.call(this, actingChar, targetTileIndex)
			&& gs.getChar(targetTileIndex).faction !== actingChar.faction;
	};
	this.abilityTypes.LifeSpike.useOn = function (actingChar, targetTileIndex) {
		var damage, duration;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		duration = this.attributes.duration.value(actingChar);
		
		// Create Projectile:
		gs.createProjectile(actingChar, targetTileIndex, 'LifeSpike', damage, this.range, {killer: actingChar, duration: duration});
		
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Effect:
		gs.createMagicShootEffect(actingChar, targetTileIndex, 'ToxicShoot');
		
		// Play Sound:
		gs.playSound(gs.sounds.throw, actingChar.tileIndex);
	};

	
	// TOXIC_ATTUNEMENT:
	// ********************************************************************************************
	this.abilityTypes.ToxicAttunement = {};
	this.abilityTypes.ToxicAttunement.isSpell = true;
	this.abilityTypes.ToxicAttunement.useImmediately = true;
	this.abilityTypes.ToxicAttunement.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.ToxicAttunement.useOn = function (actingChar) {
		var toxicPower, duration;
		
		// Attributes:
		toxicPower = this.attributes.toxicPower.value(actingChar);
		duration = this.attributes.duration.value(actingChar);
		
		// Status Effect:
		actingChar.statusEffects.add('ToxicAttunement', {toxicPower: toxicPower, duration: duration});
		
		// Particles:
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
		
		// Play Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// SUMMON_SKELETON:
	// ********************************************************************************************
	this.abilityTypes.SummonSkeleton = {};
	this.abilityTypes.SummonSkeleton.isSpell = true;
	this.abilityTypes.SummonSkeleton.isSummon = true;
	this.abilityTypes.SummonSkeleton.useImmediately = true;
	this.abilityTypes.SummonSkeleton.showTarget = function () {
		if (this.canUse(gs.pc)) {
			gs.targetSprites.create(this.getSummonIndex(gs.pc), PURPLE_SELECT_BOX_FRAME);
		}
		else {
			gs.targetSprites.create(gs.pc.tileIndex, RED_SELECT_BOX_FRAME);
		}
	};
	this.abilityTypes.SummonSkeleton.getSummonIndex = function (actingChar) {		
		let indexList = gs.getIndexListInRadius(actingChar.tileIndex, 1.5);
		indexList = indexList.filter(index => gs.isPassable(index));
		indexList = indexList.filter(index => gs.isIndexSafeForCharType(index, gs.npcTypes.Skeleton));
		indexList = indexList.filter(index => !gs.isPit(index));
		
		// No safe location:
		if (indexList.length === 0) {
			indexList = gs.getIndexListInRadius(actingChar.tileIndex, 1.5);
			indexList = indexList.filter(index => gs.isPassable(index));
			indexList = indexList.filter(index => !gs.isPit(index));
		}
		
		// Sort by nearest:
		let nearestHostile = actingChar.getNearestVisibleHostile();
		if (nearestHostile) {
			indexList.sort((a, b) => util.distance(nearestHostile.tileIndex, a) - util.distance(nearestHostile.tileIndex, b));
		}
		
		return indexList.length > 0 ? indexList[0] : null;
	};
	this.abilityTypes.SummonSkeleton.canUse = function (actingChar) {
		return this.getSummonIndex(actingChar);	
	};
	this.abilityTypes.SummonSkeleton.useOn = function (actingChar) {		
		// Attributes:
		let monsterLevel = this.attributes.monsterLevel.value(actingChar);
		
		// Get valid tileIndex:
		let summonIndex = this.getSummonIndex(actingChar);
		
		// Update player stats to take into account MP reduction:
		actingChar.updateStats({maxMp: -(this.mana - actingChar.manaConservation)});
		
		// Create Skeleton:
		gs.createSummonEffect(summonIndex, function () {
			let npc = gs.createNPC(summonIndex, 'Skeleton', {level: monsterLevel});
			npc.faction = FACTION.PLAYER;
			npc.popUpText('Summoned');
			npc.isAgroed = true;
			actingChar.summonIDList.push(npc.id);
			npc.summonerId = actingChar.id;
			npc.summonDuration = -1; // No duration
		}, this);

		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// INFECTIOUS_DISEASE:
	// ************************************************************************************************
	this.abilityTypes.InfectiousDisease = {};
	this.abilityTypes.InfectiousDisease.isSpell = true;
	this.abilityTypes.InfectiousDisease.range = 5.0;
	this.abilityTypes.InfectiousDisease.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.InfectiousDisease.canUseOn = this.abilityCanUseOn.SingleCharacterRay;
	this.abilityTypes.InfectiousDisease.useOn = function (actingChar, targetTileIndex) {
		var damage, duration;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		duration = this.attributes.duration.value(actingChar);
		
		gs.getChar(targetTileIndex).statusEffects.add('InfectiousDisease', {damage: damage, duration: duration});
		
	};

	
	// CANNIBALISE:
	// ************************************************************************************************
	this.abilityTypes.Cannibalise = {};
	this.abilityTypes.Cannibalise.isSpell = true;
	this.abilityTypes.Cannibalise.mana = 0;
	this.abilityTypes.Cannibalise.useImmediately = true;
	this.abilityTypes.Cannibalise.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.Cannibalise.useOn = function (actingChar) {
		actingChar.restoreMp(this.attributes.mana.value(actingChar));
		
		// Effect:
		gs.createManaEffect(gs.pc.tileIndex);
		
		// Sound:
		gs.playSound(gs.sounds.food);
		gs.playSound(gs.sounds.cure);
	};
	
	// POISON_CLOUD:
	// ********************************************************************************************
	this.abilityTypes.PoisonCloud = {};
	this.abilityTypes.PoisonCloud.isSpell = true;
	this.abilityTypes.PoisonCloud.showTarget = function (targetTileIndex) {
		
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			let indexList = this.getIndexList(targetTileIndex, gs.pc);
			
			indexList.forEach(function (tileIndex) {
				gs.targetSprites.create(tileIndex, PURPLE_BOX_FRAME);
			}, this);
			
			gs.targetSprites.create(targetTileIndex, PURPLE_SELECT_BOX_FRAME);
		}
		else {
			gs.targetSprites.create(targetTileIndex, RED_SELECT_BOX_FRAME);
			gs.showTargetLine(targetTileIndex);
		}
	}; 
	this.abilityTypes.PoisonCloud.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.PoisonCloud.getIndexList = function (targetTileIndex, actingChar) {
		let numClouds = this.attributes.numClouds.value(actingChar);
		
		let floodList = gs.getIndexListInFlood(targetTileIndex, index => gs.isTileIndexTransparent(index), 4);
		floodList.sort((a, b) => util.distance(targetTileIndex, a) - util.distance(targetTileIndex, b));
		return floodList.slice(0, Math.min(numClouds, floodList.length));
	};
	this.abilityTypes.PoisonCloud.useOn = function (actingChar, targetTileIndex) {		
		// Attributes:
		let damage = this.attributes.damage.value(actingChar);
		let duration = this.attributes.duration.value(actingChar);
		
		
		
		let indexList = this.getIndexList(targetTileIndex, actingChar);
		
		for (let depth = 0; depth < 10; depth += 1) {
			let event = {timer: 0};
			
			event.updateFrame = function () {
				// On the first tick:
				if (this.timer === 0) {
					let created = false;
					
					indexList.forEach(function (tileIndex) {
						if (tileIndex.depth === depth) {
							let cloud = gs.createCloud(tileIndex, 'PoisonGas', damage, duration);
							cloud.dontSpread = true;
							created = true;
						}
					}, this);
					
					if (created) {
						gs.playSound(gs.sounds.fire, gs.pc.tileIndex);
					}
				}
				
				this.timer += 1;
			};
			
			event.isComplete = function () {
				return this.timer > 5;	
			};
			
			// Push event:
			actingChar.eventQueue.addEvent(event);
		}

	};
	
	// ********************************************************************************************
	// ICE_MAGIC_ABILITIES:
	// ********************************************************************************************
	// CONE_OF_COLD:
	// ********************************************************************************************
	this.abilityTypes.ConeOfCold = {};
	this.abilityTypes.ConeOfCold.isSpell = true;
	this.abilityTypes.ConeOfCold.range = ABILITY_RANGE;
	this.abilityTypes.ConeOfCold.particleColor = 'WHITE';
	this.abilityTypes.ConeOfCold.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.ConeOfCold.showTarget = this.abilityShowTarget.Fan;
	this.abilityTypes.ConeOfCold.canUseOn = function (actingChar, targetTileIndex) {
		let delta = util.get8WayVector(actingChar.tileIndex, targetTileIndex);
		
		let firstTileIndex = {x: actingChar.tileIndex.x + delta.x, y: actingChar.tileIndex.y + delta.y};
		if (!gs.isStaticProjectilePassable(firstTileIndex)) {
			return false;
		}
		
		
		return true;
	};
	this.abilityTypes.ConeOfCold.useOn = function (actingChar, targetTileIndex) {
		var indexList, delta, charList = [], damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		delta = util.get8WayVector(actingChar.tileIndex, targetTileIndex);
		
		// Handle all tiles:
		indexList = gs.getIndexInFan(actingChar.tileIndex, this.aoeRange(actingChar), delta);
		indexList = indexList.filter(index => gs.isRayBeamPassable(gs.pc.tileIndex, index));
		
		indexList.forEach(function (tileIndex) {
			if (gs.getChar(tileIndex)) {
				charList.push(gs.getChar(tileIndex));
			}
			
			this.onTile(tileIndex);
		}, this);
		
		// Sort to handle furthest characters first:
		charList.sort((a, b) => util.distance(actingChar.tileIndex, b.tileIndex) - util.distance(actingChar.tileIndex, a.tileIndex));
		
		// Handle all characters:
		charList.forEach(function (char) {
			this.onChar(actingChar, char, damage, delta);
		}, this);
		
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Lighting and Particles:
		gs.createLightCircle(actingChar.sprite.position, '#cbd7d8', 120, 30, '88');
		gs.createParticleBurst(actingChar.sprite.position, delta, 'WHITE');
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 59);
		
		// Sound:
		gs.playSound(gs.sounds.bolt, actingChar.tileIndex);
	};
	this.abilityTypes.ConeOfCold.onTile = function (tileIndex) {
		// Destroy blood on water:
		if (gs.getTile(tileIndex).type.name === 'Water' && gs.getObj(tileIndex, 'Blood')) {
			gs.destroyObject(gs.getObj(tileIndex));
		}
		
		// Create ice on water:
		if (!gs.getObj(tileIndex) && gs.getTile(tileIndex).type.name === 'Water') {
			gs.createObject(tileIndex, 'Ice');
		}
		
		// Create Obsidian on Lava:
		if (!gs.getObj(tileIndex) && gs.getTile(tileIndex).type.name === 'Lava') {
			gs.createObject(tileIndex, 'Obsidian');
		}
		
		// Destroy flaming clouds:
		if (gs.getCloud(tileIndex) && gs.getCloud(tileIndex).type.niceName === 'Flaming Cloud') {
			gs.getCloud(tileIndex).destroy();
		}
	};
	this.abilityTypes.ConeOfCold.onChar = function (actingChar, targetChar, damage, delta) {
		gs.createParticleBurst(targetChar.sprite.position, delta, this.particleColor);
		targetChar.body.applyKnockBack(delta, 2);
		targetChar.takeDamage(damage, 'Cold', {killer: actingChar, neverBlink: true});
	};

	// FREEZING_CLOUD:
	// ********************************************************************************************
	this.abilityTypes.FreezingCloud = {};
	this.abilityTypes.FreezingCloud.isSpell = true;
	this.abilityTypes.FreezingCloud.aoeRange = 1.5;
	this.abilityTypes.FreezingCloud.showTarget = this.abilityShowTarget.TBAoE;
	this.abilityTypes.FreezingCloud.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.FreezingCloud.useOn = function (actingChar, targetTileIndex) {
		var indexList, damage, duration;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		duration = this.attributes.duration.value(actingChar);
		
		// Create Clouds:
		indexList = gs.getIndexListInRadius(targetTileIndex, this.aoeRange(actingChar));
		indexList.forEach(function (tileIndex) {
			if (gs.isStaticPassable(tileIndex) || gs.isStaticProjectilePassable(tileIndex)) {
				gs.createCloud(tileIndex, 'FreezingCloud', damage, duration);
			}
		}, this);
		
		// Particles:
		gs.createIceEffect(actingChar.tileIndex);
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// SHIELD_OF_ICE:
	// ********************************************************************************************
	/*
	this.abilityTypes.ShieldOfIce = {};
	this.abilityTypes.ShieldOfIce.isSpell = true;
	this.abilityTypes.ShieldOfIce.useImmediately = true;
	this.abilityTypes.ShieldOfIce.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.ShieldOfIce.useOn = function (actingChar) {
		// Attributes:
		let blockDamage = this.attributes.blockDamage.value(actingChar);
		
		// Status Effect:
		actingChar.statusEffects.add('ShieldOfIce', {duration: blockDamage});
		
		// Particles:
		gs.createIceEffect(actingChar.tileIndex);
		
		// Play Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	*/
	
	// ICICLE_STRIKE:
	// ********************************************************************************************
	this.abilityTypes.IcicleStrike = {};
	this.abilityTypes.IcicleStrike.isSpell = true;
	this.abilityTypes.IcicleStrike.range = 4;
	this.abilityTypes.IcicleStrike.getIndexList = function (actingChar, targetTileIndex) {
		if (util.vectorEqual(actingChar.tileIndex, targetTileIndex)) {
			return null;
		}
		
		let delta = util.get8WayVector(actingChar.tileIndex, targetTileIndex),
			list;
		
		if (delta.x === 1 && delta.y === 0) 	list = [{x: 1, y: 0}, {x: 1, y: -1}, {x: 1, y: 1}];
		if (delta.x === -1 && delta.y === 0) 	list = [{x: -1, y: 0}, {x: -1, y: -1}, {x: -1, y: 1}];
		if (delta.x === 0 && delta.y === 1) 	list = [{x: 0, y: 1}, {x: 1, y: 1}, {x: -1, y: 1}];
		if (delta.x === 0 && delta.y === -1) 	list = [{x: 0, y: -1}, {x: 1, y: -1}, {x: -1, y: -1}];
		
		if (delta.x === 1 && delta.y === 1)		list = [{x: 1, y: 1}, {x: 1, y: 0}, {x: 0, y: 1}];
		if (delta.x === -1 && delta.y === 1)	list = [{x: -1, y: 1}, {x: -1, y: 0}, {x: 0, y: 1}];
		if (delta.x === 1 && delta.y === -1)	list = [{x: 1, y: -1}, {x: 1, y: 0}, {x: 0, y: -1}];
		if (delta.x === -1 && delta.y === -1)	list = [{x: -1, y: -1}, {x: -1, y: 0}, {x: 0, y: -1}];
		
		return list;
	};
	this.abilityTypes.IcicleStrike.showTarget = function (targetTileIndex) {
		let indexList = this.getIndexList(gs.pc, targetTileIndex);
		let delta = util.get8WayVector(gs.pc.tileIndex, targetTileIndex);
		
		if (indexList) {
			indexList.forEach(function (offsetTileIndex) {
				let startTileIndex = {x: gs.pc.tileIndex.x + offsetTileIndex.x,
									  y: gs.pc.tileIndex.y + offsetTileIndex.y};
				let endTileIndex = {x: startTileIndex.x + delta.x * 4,
								    y: startTileIndex.y + delta.y * 4}; //this.range(gs.pc)
				
				let rayTileIndexList = gs.getIndexInRay(startTileIndex, endTileIndex, index => !gs.isStaticProjectilePassable(index));
				
				// Include start:
				if (gs.isStaticPassable(startTileIndex)) {
					rayTileIndexList.unshift(startTileIndex);
				}
				
				for (let i = 0; i < rayTileIndexList.length; i += 1) {
					if (gs.getChar(rayTileIndexList[i])) {
						gs.targetSprites.create(rayTileIndexList[i], PURPLE_SELECT_BOX_FRAME);
					}
					else {
						gs.targetSprites.create(rayTileIndexList[i], PURPLE_BOX_FRAME);
					}
				}
			}, this);
		}
		else {
			gs.targetSprites.create(targetTileIndex, RED_SELECT_BOX_FRAME);
		}
		
	};
	this.abilityTypes.IcicleStrike.canUseOn = function (actingChar, targetTileIndex) {
		return this.getIndexList(actingChar, targetTileIndex);
	};
	this.abilityTypes.IcicleStrike.useOn = function (actingChar, targetTileIndex) {
		// Attributes:
		let damage = this.attributes.damage.value(actingChar);
		
		
		let indexList = this.getIndexList(actingChar, targetTileIndex);
		let delta = util.get8WayVector(actingChar.tileIndex, targetTileIndex);
		
		indexList.forEach(function (tileIndex) {
			let range = this.range(actingChar);
			let startTileIndex = {x: actingChar.tileIndex.x + tileIndex.x, y: actingChar.tileIndex.y + tileIndex.y};
			let toTileIndex = {x: startTileIndex.x + delta.x * range, y: startTileIndex.y + delta.y * range};
			
			let hitTileIndexList = gs.getIndexInRay(startTileIndex, toTileIndex);
			hitTileIndexList.unshift(startTileIndex);
			
			let flags = {
				isTunnelShot: true,
				hitTileIndexList: hitTileIndexList,
			};
			
			let proj = gs.createProjectile(actingChar, toTileIndex, 'IceArrow', damage, range, flags);			
			proj.tileIndex = {x: startTileIndex.x, y: startTileIndex.y};
			proj.sprite.x = util.toPosition(proj.tileIndex).x;
			proj.sprite.y = util.toPosition(proj.tileIndex).y;
			proj.sprite.rotation = game.math.angleBetween(startTileIndex.x, startTileIndex.y, toTileIndex.x, toTileIndex.y) + Math.PI / 2;
			proj.normal = delta;
			
		}, this);
		
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 50);
		
		// Sound:
		gs.playSound(gs.sounds.bolt, actingChar.tileIndex);
	};
	
	
	// FREEZE:
	// ********************************************************************************************
	this.abilityTypes.Freeze = {};
	this.abilityTypes.Freeze.isSpell = true;
	this.abilityTypes.Freeze.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.Freeze.canUseOn = function (actingChar, targetTileIndex) {
		// Char Target:
		if (gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex) && !gs.getChar(targetTileIndex).type.isFreezeImmune) {
			return true;
		}
		
		// Tile Target:
		if (gs.abilityCanUseOn.SingleTileSmite.call(this, actingChar, targetTileIndex) && !gs.getChar(targetTileIndex)) {
			return true;
		}
		
		return false;
	};
	this.abilityTypes.Freeze.useOn = function (actingChar, targetTileIndex) {
		let targetChar = gs.getChar(targetTileIndex);
		
		// Attributes:
		let duration = this.attributes.duration.value(actingChar);
		let damage = this.attributes.damage.value(actingChar);
		
		
		// Freezing a character:
		if (targetChar) {
			// Apply Damage and Effect:
			targetChar.takeDamage(damage, 'Cold', {killer: actingChar});
			targetChar.statusEffects.add('Frozen', {duration: duration});		
		}
		// Creating a block of Ice:
		else {
			gs.createCloud(targetTileIndex, 'IceBlock', 0, duration);
		}
			
		// Create ice on water:
		if (!gs.getObj(targetTileIndex) && gs.getTile(targetTileIndex).type.name === 'Water') {
			gs.createObject(targetTileIndex, 'Ice');
		}
		
		// Create Obsidian on Lava:
		if (!gs.getObj(targetTileIndex) && gs.getTile(targetTileIndex).type.name === 'Lava') {
			gs.createObject(targetTileIndex, 'Obsidian');
		}
		
		// Particles
		gs.createParticlePoof(targetTileIndex, 'WHITE');
		
		// Sound:
		gs.playSound(gs.sounds.ice, actingChar.tileIndex);
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 300);
	};
	

	

	
	// ********************************************************************************************
	// ENCHANTER_ABILITIES:
	// ********************************************************************************************
	// CONFUSION:
	// ********************************************************************************************
	this.abilityTypes.Confusion = {};
	this.abilityTypes.Confusion.isSpell = true;
	this.abilityTypes.Confusion.showTarget = this.abilityShowTarget.TBAoE;
	this.abilityTypes.Confusion.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.Confusion.useOn = function (actingChar, targetTileIndex) {
		var indexList, duration;
		
		// Attributes:
		duration = this.attributes.duration.value(actingChar);
		
		// Targets:
		indexList = gs.getIndexListInRadius(targetTileIndex, this.aoeRange(actingChar));
		indexList = indexList.filter(index => gs.getChar(index));
		
		// Effect:
		indexList.forEach(function (tileIndex) {
			if (gs.getChar(tileIndex).type.isMindless) {
				gs.getChar(tileIndex).popUpText('Immune', 'White');
			}
			else {
				gs.getChar(tileIndex).agroPlayer();
				gs.getChar(tileIndex).statusEffects.add('Confusion', {duration: duration, casterId: actingChar.id});
				gs.createParticlePoof(gs.pc.tileIndex, 'PURPLE'); 
			}
		}, this);
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// DISCORD:
	// ********************************************************************************************
	this.abilityTypes.Discord = {};
	this.abilityTypes.Discord.isSpell = true;
	this.abilityTypes.Discord.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.Discord.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.Discord.canUseOn = gs.abilityCanUseOn.SingleCharacterSmite;
	this.abilityTypes.Discord.useOn = function (actingChar, targetTileIndex) {		
		// Attributes:
		let damage = this.attributes.damage.value(actingChar);
		let duration = this.attributes.duration.value(actingChar);
		let damageMultiplier = this.attributes.damageMultiplier.value(actingChar);
		
		
		let char = gs.getChar(targetTileIndex);
		
		// Damage:
		char.takeDamage(damage, 'Magic', {killer: actingChar});
		
		// Effect:
		if (char.isAlive) {
			char.statusEffects.add('Discord', {damageMultiplier: damageMultiplier, duration: duration});
		}
		
		// Particles:
		gs.createManaEffect(targetTileIndex); 
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// SIPHON_MANA:
	// ********************************************************************************************	
	this.abilityTypes.SiphonMana = {};
	this.abilityTypes.SiphonMana.isSpell = true;
	this.abilityTypes.SiphonMana.range = 5.5;
	this.abilityTypes.SiphonMana.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.SiphonMana.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex)
			&& gs.getChar(targetTileIndex).isSpellCaster();
	};
	this.abilityTypes.SiphonMana.useOn = function (actingChar, targetTileIndex) {		
		let restoreMp = this.attributes.restoreMp.value(actingChar);
		
		// Siphon Mana:
		actingChar.restoreMp(restoreMp);
		
		// Lock Down Spells:
		gs.getChar(targetTileIndex).lockAllSpells();
		
		// Sound:
		gs.playSound(gs.sounds.cure);
		
		// Spell Effect on Char:
		gs.createManaEffect(actingChar.tileIndex);
		gs.createManaEffect(targetTileIndex);
	};
	
	// DOMINATE:
	// ********************************************************************************************	
	this.abilityTypes.Dominate = {};
	this.abilityTypes.Dominate.isSpell = true;
	this.abilityTypes.Dominate.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.Dominate.canUse = function (actingChar) {
		let maxCharms = this.attributes.maxCharms.value(actingChar);
		
		let charList = gs.liveCharacterList().filter(char => char.statusEffects.has('Domination'));
		
		return charList.length < maxCharms;
	};
	this.abilityTypes.Dominate.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex)
			&& gs.getChar(targetTileIndex).canDominate();
	};
	this.abilityTypes.Dominate.useOn = function (actingChar, targetTileIndex) {
		// Dominated:
		gs.getChar(targetTileIndex).dominate('Domination');
		
		// Need to update maxMp due to permanent MP cost:
		actingChar.updateStats();
		
		// Sound:
		gs.playSound(gs.sounds.cure);
		
		// Particles:
		gs.createManaEffect(targetTileIndex);
	};
	this.abilityTypes.Dominate.desc = function (talentLevel) {
		let str = gs.talents.Dominate.desc + '\n\n';
		
		let numCharms = gs.liveCharacterList().filter(char => char.statusEffects.has('Domination')).length;
		str += 'Current Charms: ' + numCharms;
		return str;
	};


	

	
	
	// ********************************************************************************************
	// ATHLETICS_ABILITIES:
	// ********************************************************************************************

};

// SET_ABILITY_STATS:
// ************************************************************************************************
gs.setAbilityStats = function () {
	let _ = this.abilityTypes;
	
	// SPEED_POINTS:
	// ********************************************************************************************
	_.Disengage.speedPoints = 1;
	
	// MANA:
	// ********************************************************************************************
	// Fire Magic:
	_.FireBall.mana = 6;
	_.BurstOfFlame.mana = 6;
	_.FlamingBattleSphere.mana = 6;
	
	// Storm Magic:
	_.LightningBolt.mana = 6;
	_.BurstOfWind.mana = 6;
	_.Shock.mana = 6;
	
	// Necromancer Magic:
	_.LifeSpike.mana = 6;
	_.Cannibalise.hitPointCost = 12;
	_.SummonSkeleton.mana = 6;
	_.PoisonCloud.mana = 6;
	
	// Cold Magic:
	_.ConeOfCold.mana = 6;
	_.FreezingCloud.mana = 6;
	_.Freeze.mana = 6;
	
	// Enchantment Magic:
	_.Confusion.mana = 6;
	_.Discord.mana = 6;
	_.Dominate.mana = 6;
	
	
	// PARTICLE:
	// ********************************************************************************************
	// Fire Magic:
	_.FireBall.particleColor = 'RED';
	_.BurstOfFlame.particleColor = 'RED';
	_.FlamingBattleSphere.particleColor = 'RED';
	
	// Storm Magic:
	_.LightningBolt.particleColor = 'BLUE';
	_.Shock.particleColor = 'BLUE';	

	// Necromancy:
	_.LifeSpike.particleColor = 'PURPLE';
	_.Cannibalise.particleColor = 'PURPLE';
	_.PoisonCloud.particleColor = 'PURPLE';
	
	// Cold:
	_.ConeOfCold.particleColor = 'WHITE';
	_.FreezingCloud.particleColor = 'WHITE';
	_.Freeze.particleColor = 'WHITE';
	
	// Enchantment:
	_.Confusion.particleColor = 'PURPLE';
	_.Discord.particleColor = 'PURPLE';
	_.Dominate.particleColor = 'PURPLE';
	
	// IMAGE_INDEX:
	// ********************************************************************************************
	// Armor and Shields:
	_.ShieldsUp.frame = 1488;
	_.Recovery.frame = 1490;
	//_.ShieldWall.frame = 1489;
	
	// Fire Magic:
	_.FireBall.frame = 1376;
	_.InfusionOfFire.frame = 1377;
	_.FlameBolt.frame = 1381;
	_.FireStorm.frame = 1379;
	_.BurstOfFlame.frame = 1378;
	_.StickyFlame.frame = 1381;
	_.FlamingBattleSphere.frame = 1385;
	
	// Storm Magic:
	_.LightningBolt.frame = 1392;
	_.InfusionOfStorms.frame = 1393;
	_.BurstOfWind.frame = 1394;
	_.Shock.frame = 1395;
	
	// Necromancy:
	_.LifeSpike.frame = 1424;
	_.SummonSkeleton.frame = 1426;
	_.Cannibalise.frame = 1427;
	_.PoisonCloud.frame = 1428;
	
	// Cold Magic:
	_.ConeOfCold.frame = 1408;
	_.FreezingCloud.frame = 1409;
	_.IcicleStrike.frame = 1414;
	_.Freeze.frame = 1412;
	
	// Enchantment:
	_.Confusion.frame = 1520;
	_.Discord.frame = 1522;
	_.SiphonMana.frame = 1536;
	_.Dominate.frame = 1526;
	
	// Melee:
	_.Charge.frame = 1441;
	_.CycloneStrike.frame = 1440;
	//_.Berserk.frame = 1442;
	_.WeaponShield.frame = 1446;
	
	
	// Duelist:
	_.Disengage.frame = 1444;
	_.DashAttack.frame = 1447;
	_.SecondWind.frame = 1448;
	
	// Range:
	_.PowerShot.frame = 1456;
	_.TunnelShot.frame = 1458;
	_.StormShot.frame = 1457;
	
	// Stealth:
	_.SleepBomb.frame = 1473;
	_.Vanish.frame = 1475;
	_.BearTrap.frame = 1476;

	
	this.setAbilityTypeAttributes();
	
	// DEPRICATED:
	// ********************************************************************************************
	/*
	_.AirStrike.mana = 8;
	
	_.WallOfFire.mana = 8;
	
	_.FireStrike.mana = 10;
	_.StaticDischarge.mana = 10;
	_.InfectiousDisease.mana = 10;
	_.Freeze.mana = 8;
	_.FlashFreeze.mana = 10;
	
	
	
	
	_.WallOfFire.particleColor = 'RED';
	_.FireStrike.particleColor = 'RED';
	_.AirStrike.particleColor = 'BLUE';
	_.StaticDischarge.particleColor = 'BLUE';
	_.InfectiousDisease.particleColor = 'PURPLE';
	_.Freeze.particleColor = 'WHITE';
	_.FlashFreeze.particleColor = 'WHITE';
	_.Charm.particleColor = 'PURPLE';
	_.Mesmerize.particleColor = 'PURPLE';
	_.Fear.particleColor = 'PURPLE';
	
	
	
	
	
	_.FireStrike.frame = 1383;
	_.WallOfFire.frame = 1384;
	_.AirStrike.frame = 1397;
	_.StaticDischarge.frame = 1395;
	_.InfectiousDisease.frame = 1429;
	_.InfusionOfBlood.frame = 1425;
	
	_.FlashFreeze.frame = 1412;
	_.Charm.frame = 1521;
	_.Mesmerize.frame = 1522;
	_.Fear.frame = 1523;
	_.PowerStrike.frame = 1440;
	_.DeadEye.frame = 1459;
	_.SleepingDart.frame = 1472;
	_.BearTrap.frame = 1476;
	*/
};

// SET_ABILITY_TYPE_ATTRIBUTES:
// ************************************************************************************************
gs.setAbilityTypeAttributes = function () {
	let _ = this.abilityTypes;
	
	// INFUSION_ATTRIBUTES:
	// ********************************************************************************************
	_.InfusionOfBlood.attributes = {
		aoeRange:			{base: [null, 3, 5]},
		coolDown:			{base: [null, 300, 150]},
	};
	
	// NECROMANCY_ATTRIBUTES:
	// ********************************************************************************************
	_.Cannibalise.attributes = {
		mana:				{base: [null, 6, 8]}
	};
	_.LifeSpike.attributes = {
		damage: 			{base: [null, 4, 6], modifier: 'magicPower'},
		duration: 			{base: [null, 4, 4]},
		range:				{base: [null, 7, 7]},
	};
	_.SummonSkeleton.attributes = {
		monsterLevel:		{base: [null, 6, 8], modifier: 'magicPower'},
	};
	_.PoisonCloud.attributes = {
		damage:				{base: [null, 5, 8], modifier: 'magicPower'},
		duration:			{base: [null, 5, 5]},
		numClouds:			{base: [null, 9, 13]},
		range: 				{base: [null, 7, 7]},
	};
	

	// COLD_MAGIC_ATTRIBUTES:
	// ********************************************************************************************
	_.ConeOfCold.attributes = {
		damage:				{base: [null, 12, 12], modifier: 'magicPower'},
		aoeRange:			{base: [null, 3, 4]},
	};
	_.FreezingCloud.attributes = {
		damage:				{base: [null, 6, 9], modifier: 'magicPower'},
		duration:			{base: [null, 5, 5]},
		range:				{base: [null, 6, 6]},
	};
	_.IcicleStrike.attributes = {
		damage:				{base: [null, 20, 30], modifier: 'magicPower'}
	};
	_.Freeze.attributes = {
		damage:				{base: [null, 12, 18], modifier: 'magicPower'},
		duration:			{base: [null, 4, 6]},
		range:				{base: [null, 4, 4]},
	};
	
	// FIRE_MAGIC_ATTRIBUTES:
	// ********************************************************************************************
	_.FireBall.attributes = {
		damage:				{base: [null, 20, 20], modifier: 'magicPower'},
		range: 				{base: [null, 4, 5]},
	};
	
	_.BurstOfFlame.attributes = {
		damage:				{base: [null, 24, 32], modifier: 'magicPower'},
		range:				{base: [null, 7, 7]},
	};
	
	_.FlamingBattleSphere.attributes = {
		monsterLevel:		{base: [null, 8, 12], modifier: 'magicPower'},
		duration:			{base: [null, 6, 9], modifier: 'magicPower'},
		range:				{base: [null, 7, 7]},
		coolDown:			{base: [null, 10, 6]},
	};
	
	_.InfusionOfFire.attributes = {
		restoreMp:			{base: [null, 10, 20], modifier: 'magicPower'},
		abilityPower:		{base: [null, 0.25, 0.5]},
		coolDown:			{base: [null, 50, 50]},
	};

	// STORM_MAGIC_ATTRIBUTES:
	// ********************************************************************************************
	_.LightningBolt.attributes = {
		damage:				{base: [null, 20, 20], modifier: 'magicPower'},
		range:				{base: [null, 4, 5]}
	};
	
	_.BurstOfWind.attributes = {
		damage:				{base: [null, 20, 20], modifier: 'magicPower'},
		aoeRange:			{base: [null, 1.5, 2]},
		knockBack:			{base: [null, 2, 3]},
	};
	
	_.Shock.attributes = {
		damage:				{base: [null, 20, 25], modifier: 'magicPower'},
		spread:				{base: [null, 2, 3]},
		range: 				{base: [null, 5, 5]},
	};
	
	_.InfusionOfStorms.attributes = {
		restoreMp:			{base: [null, 10, 20], modifier: 'magicPower'},
		abilityPower:		{base: [null, 0.25, 0.5]},
		coolDown:			{base: [null, 50, 50]},
	};
	
	
	// ENCHANTMENT_MAGIC_ATTRIBUTES:
	// ********************************************************************************************
	_.Confusion.attributes = {
		duration:			{base: [null, 8, 8], modifier: 'magicPower'},
		aoeRange:			{base: [null, 0, 1.0]},
		range:				{base: [null, 6, 6]},
	};
	
	_.Discord.attributes = {
		damage:				{base: [null, 12, 18], modifier: 'magicPower'},
		duration:			{base: [null, 10, 15], modifier: 'magicPower'},
		damageMultiplier:	{base: [null, 2.0, 3.0]},
		range:				{base: [null, 6, 6]},
	};
	
	_.Dominate.attributes = {
		maxCharms:			{base: [null, 2, 4], modifier: 'magicPower'},
		coolDown:			{base: [null, 10, 6]},
		range:				{base: [null, 6, 6]},
	};
	
	// BARBARIAN:
	// ********************************************************************************************
	_.Charge.attributes = {
		meleeDamageMultiplier:	{base: [null, 1.6, 1.6], modifier: 'abilityPower'},
		maxPath:				{base: [null, 4, 5]},
		coolDown:				{base: [null, 10, 6]},
	};
	_.CycloneStrike.attributes = {
		meleeDamageMultiplier:	{base: [null, 1.6, 2.0], modifier: 'abilityPower'},
		coolDown:				{base: [null, 10, 6]},
	};

	// DUESLIT_ATTRIBUTES:
	// ********************************************************************************************
	_.Disengage.attributes = {
		meleeDamageMultiplier:	{base: [null, 1.6, 2.0], modifier: 'abilityPower'},
	};
	
	_.DashAttack.attributes = {
		meleeDamageMultiplier: {base: [null, 2.0, 3.0], modifier: 'abilityPower'},
	};
	
	_.SecondWind.attributes = {
		restoreSp: 				{base: [null, 4, 8], modifier: 'abilityPower'},
		coolDown:				{base: [null, 50, 50]},
	};
	
	
	// RANGE_ATTRIBUTES:
	// ********************************************************************************************
	_.PowerShot.attributes = {
		rangeDamageMultiplier:	{base: [null, 2.0, 2.4], modifier: 'abilityPower'},
		coolDown:				{base: [null, 10, 6]},
	};
	_.TunnelShot.attributes = {
		rangeDamageMultiplier:	{base: [null, 1.6, 2.0], modifier: 'abilityPower'},
		coolDown:				{base: [null, 10, 6]},
	};
	_.StormShot.attributes = {
		rangeDamageMultiplier:	{base: [null, 1.6, 2.4], modifier: 'abilityPower'},
		coolDown:				{base: [null, 150, 150]},
	};
	
	
	// DEFENSE_ATTRIBUTES:
	// ********************************************************************************************
	_.ShieldsUp.attributes = {
		meleeDamageMultiplier:	{base: [null, 1.6, 2.0], modifier: 'abilityPower'},
		coolDown:				{base: [null, 10, 6]}
	};
	_.Recovery.attributes = {
		healHp:					{base: [null, 30, 60], modifier: 'abilityPower'},
		coolDown:				{base: [null, 50, 50]},
	};

	// STEALTH_ATTRIBUTES:
	// ********************************************************************************************
	_.SleepBomb.attributes = {
		aoeRange:			{base: [null, 0, 1.0]},
		duration:			{base: [null, 6, 9], modifier: 'abilityPower'},
		coolDown:			{base: [null, 10, 6]},
		range:				{base: [null, 7, 7]},
	};
	_.BearTrap.attributes = {
		damage:				{base: [null, 10, 15], modifier: 'abilityPower'},
		numTraps:			{base: [null, 1, 2]},
		coolDown:			{base: [null, 10, 6]},
		range:				{base: [null, 6, 6]},
	};
	_.Vanish.attributes = {
		coolDown:			{base: [null, 150, 100]},
	};
		
	// MISC_ATTRIBUTES:
	// ********************************************************************************************
	// SCROLLS:
	_.HellFire.attributes = {
		damage:				{base: [null, 30], modifier: 'magicPower'}	
	};
	
	_.FlashFreeze.attributes = {
		duration:			{base: [null, 6], modifier: 'magicPower'},
	};
	
	_.ScrollOfFear.attributes = {
		duration:			{base: [null, 8], modifier: 'magicPower'},
	};
	
	// WANDS:
	_.LifeDrain.attributes = {
		damage:				{base: [null, 15], modifier: 'magicPower'}
	};
	
	_.SummonBlades.attributes = {
		numSummoned:		{base: [null, 4], modifier: 'magicPower'},
		monsterLevel:		{base: [null, 6], modifier: 'magicPower'},
	};
	
	_.SummonRats.attributes = {
		numSummoned:		{base: [null, 8], modifier: 'magicPower'},
		monsterLevel:		{base: [null, 1], modifier: 'magicPower'},
	};
	
	_.SummonSewerRats.attributes = {
		numSummoned:		{base: [null, 6], modifier: 'magicPower'},
		monsterLevel:		{base: [null, 8], modifier: 'magicPower'},
	};
	
	_.SummonWolves.attributes = {
		numSummoned:		{base: [null, 12], modifier: 'magicPower'},
		monsterLevel:		{base: [null, 12], modifier: 'magicPower'},
	};
	
	// CONSUMABLE PROJECTILES:
	_.Javelin.attributes = {
		damage:				{base: [null, 18], modifier: 'bonusRangeDamage'},
		range:				{base: [null, 6], modifier: 'bonusProjectileRange'},
	};
	
	_.Chakram.attributes = {
		damage:				{base: [null, 24], modifier: 'bonusRangeDamage'},
		range:				{base: [null, 6], modifier: 'bonusProjectileRange'},
	};
	
	_.ThrowingNet.attributes = {
		range:				{base: [null, 6], modifier: 'bonusProjectileRange'},
	};
	
	_.Bomb.attributes = {
		damage:				{base: [null, 36]},
		range:				{base: [null, 6], modifier: 'bonusProjectileRange'},
	};
	
	// Deprecated:
	/*
	_.SiphonMana.attributes = {
		restoreMp:			{base: [null, 10, 20]},
		coolDown:			{base: [null, 50, 50]},
	};
	
	_.FlameBolt.attributes = {
		damage:				{base: [null, 16, 24], modifier: 'magicPower'},
		range:				{base: [null, 3, 4]},
	};
	
	_.FireStorm.attributes = {
		damage:				{base: [null, 16, 24], modifier: 'magicPower'},
		aoeRange:			{base: [null, 2, 3]}
	};
	_.StickyFlame.attributes = {
		damage:				{base: [null, 10, 15], modifier: 'magicPower'},
		range:				{base: [null, 3, 3]}
	};
	*/

	

	// Create Attribute Value funcs:
	this.forEachType(this.abilityTypes, function (talentType) {
		if (talentType.attributes) {			
			for (let key in talentType.attributes) {
				if (talentType.attributes.hasOwnProperty(key)) {
					let attribute = talentType.attributes[key];
					
					attribute.name = key;
					if (attribute.base) {
						// Base Val Func:
						attribute.baseVal = function (actingChar, talentRank) {
							talentRank = talentRank || actingChar.talents.getTalentRank(talentType.name);
							return this.base[talentRank];
						};
					
						// Value Func:
						attribute.value = function (actingChar, talentRank) {
							talentRank = talentRank || actingChar.talents.getTalentRank(talentType.name);
							
							// NPCs revert to talentRank-1:
							if (actingChar !== gs.pc) {
								talentRank = 1;
							}
						
							if (key === 'coolDown') {
								return this.base[talentRank] - Math.ceil(this.base[talentRank] * actingChar.coolDownModifier);
							}
							else if (this.modifier === 'bonusProjectileRange') {
								return this.base[talentRank] + actingChar.bonusProjectileRange; 
							}
							else if (this.modifier === 'abilityPower' && (key === 'meleeDamageMultiplier' || key === 'rangeDamageMultiplier')) {
								return Math.round((this.base[talentRank] + actingChar.abilityPower) * 100) / 100;
							}
							else if (this.modifier === 'magicPower') {
								let mod = Math.round((actingChar.magicPower + actingChar.abilityPower) * 100) / 100;
								return Math.ceil(this.base[talentRank] * (mod + 1.0));
							}
							else if (this.modifier) {
								return Math.ceil(this.base[talentRank] * (actingChar[this.modifier] + 1.0));
							}
							else {
								return this.base[talentRank];
							}
						};
					}
					
				}
				
			}
		}
	}, this);
};

// SET_ABILITY_TYPE_DEFAULTS:
// ************************************************************************************************
gs.setAbilityTypeDefaults = function () {
	var trueFunc = function () {return true;};
	
	this.nameTypes(this.abilityTypes);
	
	
	
	this.forEachType(this.abilityTypes, function (abilityType) {
		abilityType.attributes = abilityType.attributes || {};
		
		// RANGE:
		// Attribute:
		if (abilityType.attributes.range) {
			abilityType.range = function (actingChar) {
				return this.attributes.range.value(actingChar);
			};
		}
		// Number:
		else if (typeof abilityType.range === 'number') {
			var range = abilityType.range;
			abilityType.range = function (actingChar) {
				return range;
			};
		}
		// Default (max range):
		else if (!abilityType.range){
			abilityType.range = function () {
				return ABILITY_RANGE;
			};
		}
		
		// AOE_RANGE:
		// Attribute:
		if (abilityType.attributes.aoeRange) {
			abilityType.aoeRange = function (actingChar) {
				return this.attributes.aoeRange.value(actingChar);
			};
		}
		// Number:
		else if (typeof abilityType.aoeRange === 'number') {
			var aoeRange = abilityType.aoeRange;
			abilityType.aoeRange = function (actingChar) {
				return aoeRange;
			};
		}
		
		// USE_ERROR:
		if (!abilityType.getUseError) {
			abilityType.getUseError = function () {
				return false;
			};
		}
		
	
		abilityType.canUse = abilityType.canUse || trueFunc;
		abilityType.mana = abilityType.mana || 0;
		abilityType.coolDown = abilityType.coolDown || 0;
		abilityType.hitPointCost = abilityType.hitPointCost || 0;
		
		if (!abilityType.hasOwnProperty('useMana')) {
			abilityType.useMana = true;
		}
		
		// Desc:
		if (!abilityType.desc && gs.talents[abilityType.name] && gs.talents[abilityType.name].desc) {
			abilityType.desc = gs.talents[abilityType.name].desc;
		}
		else if (!abilityType.desc) {
			abilityType.desc = '';
		}
	}, this);
};

/*

	// THUNDER_CLAP:
	// ********************************************************************************************
	this.abilityTypes.ThunderClap = {};
	this.abilityTypes.ThunderClap.useImmediately = true;
	this.abilityTypes.ThunderClap.aoeRange = 3;
	this.abilityTypes.ThunderClap.showTarget = this.abilityShowTarget.PBAoE;
	this.abilityTypes.ThunderClap.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.ThunderClap.useOn = function (actingChar, targetTileIndex) {
		var indexList, stunTurns;
		
		// Attributes:
		stunTurns = this.attributes.stunTurns.value(actingChar);
		
		indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.aoeRange(actingChar));
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		indexList = indexList.filter(index => gs.getChar(index) && actingChar.isHostileToMe(gs.getChar(index)));
		
		indexList.forEach(function (tileIndex) {
			gs.getChar(tileIndex).statusEffects.add('Stunned', {duration: stunTurns + 1});
			gs.createParticlePoof(tileIndex, 'WHITE');
		}, this);
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 300);
		
		// Sound:
		gs.playSound(gs.sounds.bolt, actingChar.tileIndex);
	};
	
	this.abilityTypes.ThunderClap.attributes = {
		stunTurns:			{base: [null, 3, 5, 6], nodifier: null}
	};
	this.abilityTypes.ThunderClap.mana = 7;
	this.abilityTypes.ThunderClap.particleColor = 'BLUE';
	this.abilityTypes.ThunderClap.frame = 1394;
	
	
	
	
	
	
	// NIMBLE_FINGERS:
	// ************************************************************************************************
	gs.isTrap = function (obj) {
		return obj.type.name === 'FireShroom'
			|| obj.type.name === 'BearTrap'
			|| obj.type.name === 'FirePot'
			|| obj.type.name === 'GasPot';
	};
	
	this.abilityTypes.NimbleFingers = {};
	this.abilityTypes.NimbleFingers.range = 1.5;
	this.abilityTypes.NimbleFingers.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.NimbleFingers.canUseOn = function (actingChar, targetTileIndex) {
		return util.distance(actingChar.tileIndex, targetTileIndex) < this.range()
			&& (gs.getObj(targetTileIndex, obj => gs.isTrap(obj))
				|| gs.getChar(targetTileIndex) && gs.isTrap(gs.getChar(targetTileIndex)));
	};
	this.abilityTypes.NimbleFingers.canUse = function (actingChar) {
		var count = 0;
		
		count += actingChar.inventory.countItemOfType(gs.itemTypes.FireShroom);
		count += actingChar.inventory.countItemOfType(gs.itemTypes.BearTrap);
		count += actingChar.inventory.countItemOfType(gs.itemTypes.FirePot);
		count += actingChar.inventory.countItemOfType(gs.itemTypes.GasPot);
		
		return count < this.attributes.numTraps.value(actingChar);
	};
	this.abilityTypes.NimbleFingers.useOn = function (actingChar, targetTileIndex) {
		// Char:
		if (gs.getChar(targetTileIndex) && gs.isTrap(gs.getChar(targetTileIndex))) {
			
			gs.pc.inventory.addItem(Item.createItem(gs.getChar(targetTileIndex).type.name));
			gs.getChar(targetTileIndex).destroy();
		}
		// Object:
		else {
			gs.pc.inventory.addItem(Item.createItem(gs.getObj(targetTileIndex).type.name));
			
			gs.destroyObject(gs.getObj(targetTileIndex));
		}
	};
	this.abilityTypes.NimbleFingers.frame = 1474;
	this.abilityTypes.NimbleFingers.attributes = {
		numTraps:			{base: [null, 3, 5, 7]}
	};
	this.abilityTypes.NimbleFingers.coolDown = 10;
	
	// PLACE_TRAP:
	// ************************************************************************************************
	this.abilityTypes.PlaceTrap = {};
	this.abilityTypes.PlaceTrap.range = 1.5;
	this.abilityTypes.PlaceTrap.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.PlaceTrap.canUseOn = function (actingChar, targetTileIndex) {
		return util.distance(actingChar.tileIndex, targetTileIndex) < this.range()
			&& !gs.getObj(targetTileIndex) 
			&& gs.isPassable(targetTileIndex)
			&& !gs.isPit(targetTileIndex);
	};
	this.abilityTypes.PlaceTrap.useOn = function (actingChar, targetTileIndex) {
		// Char:
		if (util.inArray(gs.pc.selectedItem.type.name, ['FireShroom', 'BearTrap'])) {
			gs.createObject(targetTileIndex, gs.pc.selectedItem.type.name);
		}
		// Object:
		else if (util.inArray(gs.pc.selectedItem.type.name, ['FirePot', 'GasPot'])) {
			gs.createNPC(targetTileIndex, gs.pc.selectedItem.type.name);
		}
	};
	
	
*/

	// FEAR:
	// ********************************************************************************************
	/*
	this.abilityTypes.Fear = {};
	this.abilityTypes.Fear.isSpell = true;
	this.abilityTypes.Fear.useImmediately = true;
	this.abilityTypes.Fear.showTarget = this.abilityShowTarget.PBAoE;
	this.abilityTypes.Fear.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.Fear.useOn = function (actingChar, targetTileIndex) {
		var indexList, duration;
		
		// Attributes:
		duration = this.attributes.duration.value(actingChar);
		
		// Targets:
		indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.aoeRange(actingChar));
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		indexList = indexList.filter(index => gs.getChar(index) && actingChar.isHostileToMe(gs.getChar(index)));
		
		// Effect:
		indexList.forEach(function (tileIndex) {
			if (gs.getChar(tileIndex).type.neverRun) {
				gs.getChar(tileIndex).popUpText('Immune');
			}
			else {
				gs.createParticlePoof(tileIndex, 'PURPLE');
				gs.getChar(tileIndex).agroPlayer();
				gs.getChar(tileIndex).statusEffects.add('Feared', {duration: duration});
			}
			
		}, this);
		
		// Caster particles and text:
		gs.pc.popUpText('Fear!');
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
	};
	

	
	
	// CHARM:
	// ********************************************************************************************
	this.abilityTypes.Charm = {};
	this.abilityTypes.Charm.isSpell = true;
	this.abilityTypes.Charm.range = 5.5;
	this.abilityTypes.Charm.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.Charm.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex)
			&& !gs.getChar(targetTileIndex).type.isImmobile
			&& !gs.getChar(targetTileIndex).type.isMindless
			&& gs.getChar(targetTileIndex).faction !== actingChar.faction;
	};
	this.abilityTypes.Charm.useOn = function (actingChar, targetTileIndex) {
		var char, duration;
		
		// Attributes:
		duration = this.attributes.duration.value(actingChar);
		
		// Effect:
		char = gs.getChar(targetTileIndex);
		char.agroPlayer();
		char.faction = FACTION.PLAYER;
		char.statusEffects.add('Charm', {duration: duration});
		
		// Pop Up:
		char.popUpText('Charmed!');
		
		// Particles:
		gs.createParticlePoof(targetTileIndex, 'PURPLE'); 
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	*/

/*
	// LUNGE:
	// ********************************************************************************************
	this.abilityTypes.Lunge = {};
	this.abilityTypes.Lunge.dontEndTurn = true;
	this.abilityTypes.Lunge.showTarget = this.abilityShowTarget.Lunge;
	this.abilityTypes.Lunge.canUse = function (actingChar) {
		return gs.abilityCanUse.MeleeWeapon.call(this, actingChar)
			&& !actingChar.isImmobile;
	};
	this.abilityTypes.Lunge.canUseOn = function (actingChar, targetTileIndex) {
		var path = this.getPath(actingChar, targetTileIndex);
		
		return gs.isInBounds(targetTileIndex)
			&& gs.getChar(targetTileIndex)
			&& actingChar.isHostileToMe(gs.getChar(targetTileIndex))
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& path && path.length > 1;
	};
	
	this.abilityTypes.Lunge.getPath = function (actingChar, targetTileIndex) {
		var path = gs.getIndexInBRay(actingChar.tileIndex, targetTileIndex);
		
		if (path.find(index => !util.vectorEqual(index, targetTileIndex) && !gs.isPassable(index))) {
			return null;
		}
		
		return path.length >= 2 ? path : null;
	};
	
	this.abilityTypes.Lunge.useOn = function (actingChar, targetTileIndex) {
		var event, damage, flags, path;
		
		// Attributes:
		damage = Math.ceil(actingChar.weaponDamage() * this.attributes.meleeDamageMultiplier.value(actingChar));
		
		// Move player:
		path = this.getPath(actingChar, targetTileIndex);
		actingChar.isMultiMoving = true;
		actingChar.body.moveToTileIndex(path[path.length - 2]);
		actingChar.body.isKnockBack = true;
		actingChar.body.isLunging = true; // Will cause the character to avoid traps
		
		// Add the attack event:
		event = {};
		event.updateFrame = function () {
			
		};
		event.isComplete = function () {
			if (actingChar.body.isAtDestination()) {
				let targetChar = gs.getChar(targetTileIndex);
				
				gs.meleeAttack(actingChar, targetTileIndex, actingChar.inventory.getPrimaryWeapon().type.attackEffect, damage, flags);
				
				actingChar.endTurn(ACTION_TIME);
				
				// No cooldown on kill strike:
				if (targetChar && !targetChar.isAlive) {
					actingChar.selectedAbility.coolDown = 0;
				}
				
				actingChar.body.isLunging = false;
				
				return true;
			}
			else {
				return false;
			}
		};
		
		actingChar.eventQueue.addEvent(event);
	};
	
	
	// MESMERIZE:
	// ********************************************************************************************
	this.abilityTypes.Mesmerize = {};
	this.abilityTypes.Mesmerize.isSpell = true;
	this.abilityTypes.Mesmerize.range = 5.5;
	this.abilityTypes.Mesmerize.aoeRange = 1.5;
	this.abilityTypes.Mesmerize.showTarget = this.abilityShowTarget.TBAoE;
	this.abilityTypes.Mesmerize.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.Mesmerize.useOn = function (actingChar, targetTileIndex) {
		var indexList, duration;
		
		// Attributes:
		duration = this.attributes.duration.value(actingChar);
		
		// Targets:
		indexList = gs.getIndexListInRadius(targetTileIndex, this.aoeRange(actingChar));
		indexList = indexList.filter(index => gs.getChar(index) && !gs.getChar(index).type.isMindless);
		
		// Effect:
		indexList.forEach(function (tileIndex) {
			gs.getChar(tileIndex).agroPlayer();
			gs.getChar(tileIndex).goToSleep();
			gs.getChar(tileIndex).statusEffects.add('DeepSleep', {duration: duration});
			gs.createParticlePoof(tileIndex, 'MEZ', 10); 
		}, this);
		
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	*/
	// AIR_STRIKE:
	// ********************************************************************************************
	/*
	this.abilityTypes.AirStrike = {};
	this.abilityTypes.AirStrike.isSpell = true;
	this.abilityTypes.AirStrike.range = ABILITY_RANGE;
	this.abilityTypes.AirStrike.dontEndTurn = true;
	this.abilityTypes.AirStrike.noParticlePoof = true;
	this.abilityTypes.AirStrike.useMana = false;
	this.abilityTypes.AirStrike.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.AirStrike.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.AirStrike.getTarget = this.abilityGetTarget.Bolt;
	this.abilityTypes.AirStrike.useOn = function (actingChar, targetTileIndex) {
		
		// Transition to completeAbility:
		this.completeAbility.startTileIndex = targetTileIndex;
		actingChar.selectedAbility = {type: this.completeAbility, coolDown: 0};
		gs.stateManager.pushState('UseAbility');
	};
	
	this.abilityTypes.AirStrike.completeAbility = Object.create(this.abilityTypes.AirStrike);
	this.abilityTypes.AirStrike.completeAbility.isNotRoot = true;
	this.abilityTypes.AirStrike.completeAbility.dontEndTurn = false;
	this.abilityTypes.AirStrike.completeAbility.noParticlePoof = false;
	this.abilityTypes.AirStrike.completeAbility.niceName = 'Select end point';
	this.abilityTypes.AirStrike.completeAbility.useMana = true;
	this.abilityTypes.AirStrike.completeAbility.canUseOn = function (actingChar, targetTileIndex) {
		return !util.vectorEqual(targetTileIndex, this.startTileIndex);
	};
	this.abilityTypes.AirStrike.completeAbility.getIndexList = function (targetTileIndex) {
		let delta = util.get8WayVector(this.startTileIndex, targetTileIndex);
		
		// Handle all tiles:
		let startTileIndex = {x: this.startTileIndex.x - delta.x, 
							  y: this.startTileIndex.y - delta.y};
		let indexList = gs.getIndexInFan(startTileIndex, 3, delta);
		indexList = indexList.filter(index => gs.isRayClear(this.startTileIndex, index));
		
		return indexList; 
	};
	this.abilityTypes.AirStrike.completeAbility.showTarget = function (targetTileIndex) {		
		// Show origin:
		//
		
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			// Show Target Sprites:
			this.getIndexList(targetTileIndex).forEach(function (index) {
				if (util.vectorEqual(this.startTileIndex, index)) {
					gs.targetSprites.create(index, PURPLE_SELECT_BOX_FRAME);
				}
				else {
					gs.targetSprites.create(index, PURPLE_BOX_FRAME);
				}
			}, this);
		}
		else {
			gs.targetSprites.create(this.startTileIndex, RED_SELECT_BOX_FRAME);
		}
				
		
	};
	this.abilityTypes.AirStrike.completeAbility.useOn = function (actingChar, targetTileIndex) {		
		// Attributes:
		let damage = this.attributes.damage.value(actingChar);
				
		// Get all characters:
		let charList = [];
		this.getIndexList(targetTileIndex).forEach(function (tileIndex) {
			if (gs.getChar(tileIndex)) {
				charList.push(gs.getChar(tileIndex));
			}
		}, this);
		
		// Sort to handle furthest characters first:
		charList.sort((a, b) => util.distance(this.startTileIndex, b.tileIndex) - util.distance(this.startTileIndex, a.tileIndex));
		
		// Apply effect to chars:
		let delta = util.get8WayVector(this.startTileIndex, targetTileIndex);
		charList.forEach(function (targetChar) {
			gs.createParticleBurst(targetChar.sprite.position, delta, 'WHITE');
			targetChar.takeDamage(damage, 'Physical', {killer: actingChar, neverBlink: true});
			
			if (targetChar.isAlive) {
				targetChar.body.applyKnockBack(delta, 3);
			}
			
		}, this);
		
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 50);
		
		// Sound:
		gs.playSound(gs.sounds.bolt, actingChar.tileIndex);
	};
	*/