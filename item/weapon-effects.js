/*global gs, util, game, console*/
/*global PlayerTargeting*/
/*global TILE_SIZE, RED_SELECT_BOX_FRAME, LOS_DISTANCE, PROJECTILE_SPEED, PURPLE_SELECT_BOX_FRAME*/
/*global RED_TARGET_BOX_FRAME, GREEN_TARGET_BOX_FRAME, FACTION, PC_PROC_CHANCE*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';



// CREATE_WEAPON_EFFECTS:
// ********************************************************************************************
gs.createWeaponEffects = function () {
	this.weaponEffects = {};

    // WEAPON_EFFECT_MELEE:
    // ********************************************************************************************
	this.weaponEffects.Melee = {};
	this.weaponEffects.Melee.skill = 'Melee';
	this.weaponEffects.Melee.useOn = function (tileIndex, item, flags = {}) {
		let targetChar = gs.getChar(tileIndex),
			isLunge = false;
		
		// Damage:
        let damage = flags.damage || gs.pc.weaponDamage(item);
		
		// Knock Back:
		if (item.type.knockBack && util.frac() < 0.25) {
			flags.knockBack = 1;
		}
		
		// No Mitigation:
		if (item.type.noMitigation) {
			flags.noMitigation = true;
		}
		
		// Proc Effect:
		if (item.type.procEffect) {
			flags.procEffect = item.type.procEffect;
		}
		
		// Move to attack:
		if (this.canLunge() && util.distance(gs.pc.tileIndex, tileIndex) > 1.5) {
			damage = damage * gs.pc.lungeDamageMultiplier;
			gs.pc.isMultiMoving = true;
			gs.pc.body.moveToTileIndex(this.getStepIndex(tileIndex));
			gs.pc.currentSp -= 1;
			isLunge = true;
		}
		
		// Melee Attack:
		gs.meleeAttack(gs.pc, tileIndex, this, damage, flags);
		
		// Play Sound:
		gs.playSound(gs.sounds.melee, gs.pc.tileIndex);
		
		// Recover Lunge Points:
		if (isLunge && targetChar && !targetChar.isAlive && gs.pc.talents.getTalentRank('Lunge') === 2) {
			gs.pc.gainSpeed(1);
		}
	};
	this.weaponEffects.Melee.showTarget = function (tileIndex, weapon) {
		gs.targetSprites.create(tileIndex, RED_TARGET_BOX_FRAME);
		
		// Show step index:
		if (gs.pc.hasLunge && util.distance(gs.pc.tileIndex, tileIndex) > 1.5) {
			gs.targetSprites.create(this.getStepIndex(tileIndex), GREEN_TARGET_BOX_FRAME);
		}
	};
	this.weaponEffects.Melee.canUseOn = function (targetTileIndex, weapon) {
		if (this.canLunge()) {
			var range = gs.pc.isImmobile ? 1.5 : 2.0;
		
			return util.sqDistance(gs.pc.tileIndex, targetTileIndex) <= range
				&& gs.isRayPassable(gs.pc.tileIndex, targetTileIndex);
		}
		else {
			return gs.getChar(targetTileIndex)
				&& gs.getChar(targetTileIndex) !== gs.pc
				&& util.distance(gs.pc.tileIndex, targetTileIndex) <= weapon.type.range
				&& gs.isRayPassable(gs.pc.tileIndex, targetTileIndex);
		}
	};
	this.weaponEffects.Melee.hitCharacter = function (targetChar, damage, flags) {
		let damageType = flags.damageType || 'Physical';
		
		let resultDamage = targetChar.takeDamage(damage, damageType, flags);
		
		// Proc Effect:
		if (flags.procEffect && targetChar.isAlive) {
			flags.procEffect(targetChar, damage);
		}
		
		// Returns the damage:
		return resultDamage;
	};
	this.weaponEffects.Melee.getStepIndex = function (targetTileIndex) {
		if (util.distance(gs.pc.tileIndex, targetTileIndex) > 1.5) {
			return gs.getIndexInRay(gs.pc.tileIndex, targetTileIndex)[0];
		}
		else {
			return gs.pc.tileIndex;
		}
	};
	this.weaponEffects.Melee.canLunge = function () {
		return gs.pc.hasLunge
			&& gs.pc.currentSp >= 1
			&& !gs.pc.statusEffects.has('Charge')
			&& !gs.pc.isImmobile;
	};
	
	// WEAPON_EFFECTS_POLEARM:
	// ********************************************************************************************
	this.weaponEffects.PoleArm = Object.create(this.weaponEffects.Melee);
	this.weaponEffects.PoleArm.skill = 'Melee';
	this.weaponEffects.PoleArm.useOn = function (tileIndex, item, flags = {}) {
		let targetChar = gs.getChar(tileIndex),
			isLunge = false;
		
		// Damage:
		let damage = flags.damage || gs.pc.weaponDamage(item);
		
		// Weapon Knock Back:
		if (item.type.knockBack && util.frac() < 0.25) {
			flags.knockBack = 1;
		}
		
		// Proc Effect:
		if (item.type.procEffect) {
			flags.procEffect = item.type.procEffect;
		}
		
		// Move to attack:
		if (this.canLunge() && gs.isPassable(this.getStepIndex(tileIndex)) && util.distance(gs.pc.tileIndex, tileIndex) > 2.0) {
			damage = damage * gs.pc.lungeDamageMultiplier;
			gs.pc.isMultiMoving = true;
			gs.pc.body.moveToTileIndex(this.getStepIndex(tileIndex));
			gs.pc.currentSp -= 1;
			isLunge = true;
		}
		
		// Polearm Attack:
		this.getTargetList(tileIndex).forEach(function (index) {
			gs.meleeAttack(gs.pc, index, this, damage, flags);
		}, this);
		
		// Play Sound:
		gs.playSound(gs.sounds.melee, gs.pc.tileIndex);
		
		// Recover Lunge Points:
		if (isLunge && targetChar && !targetChar.isAlive && gs.pc.talents.getTalentRank('Lunge') === 2) {
			gs.pc.gainSpeed(1);
		}
	};
	this.weaponEffects.PoleArm.showTarget = function (tileIndex, weapon) {
		var indexList = this.getTargetList(tileIndex);
		
		// Targeting enemies:
		if (indexList.length > 0) {
			indexList.forEach(function (index) {
				gs.targetSprites.create(index, RED_TARGET_BOX_FRAME);
			}, this);
		}
		// Targeting a trap:
		else if (PlayerTargeting.isValidTrapTarget(tileIndex)){
			gs.targetSprites.create(tileIndex, RED_TARGET_BOX_FRAME);
		}
		
		// Show step index:
		if (gs.pc.hasLunge && util.distance(gs.pc.tileIndex, tileIndex) > 2.0) {
			gs.targetSprites.create(this.getStepIndex(tileIndex), GREEN_TARGET_BOX_FRAME);
		}
	};
	this.weaponEffects.PoleArm.getTargetList = function (tileIndex) {
		var list, normal, newTileIndex;
		
		let pcTileIndex = gs.pc.tileIndex;
		
		// Show step index:
		if (gs.pc.hasLunge && util.distance(gs.pc.tileIndex, tileIndex) > 2.0) {
			pcTileIndex = this.getStepIndex(tileIndex);
		}
		
		normal = util.normal(pcTileIndex, tileIndex);
		newTileIndex = {x: pcTileIndex.x + normal.x * 2, y: pcTileIndex.y + normal.y * 2};
		
		// Targeting an object:
		if (gs.getChar(tileIndex) && gs.getChar(tileIndex).faction === FACTION.DESTRUCTABLE) {
			if (util.distance(pcTileIndex, tileIndex) <= 2.0) {
				return [tileIndex];
			}
			else {
				return [];
			}
		}
		// Targeting a character:
		else {
			list = gs.getIndexInRay(pcTileIndex, newTileIndex);
			list = list.filter(index => gs.getChar(index) && (gs.pc.isHostileToMe(gs.getChar(index))));
			

			// Sort so that we hit the furthest enemy first:
			// This is critical for applying knockback
			list.sort((a, b) => util.distance(pcTileIndex, b) - util.distance(pcTileIndex, a));

			return list;
		}
	};
	this.weaponEffects.PoleArm.canUseOn = function (targetTileIndex, weapon) {
		let stepTileIndex = this.getStepIndex(targetTileIndex);
		
		// Lunge:
		if (this.canLunge() && gs.isPassable(stepTileIndex) && util.distance(stepTileIndex, targetTileIndex) <= weapon.type.range && gs.isRayPassable(stepTileIndex, targetTileIndex)) {
			return true;
		}
		
		// Normal Attack:
		return gs.getChar(targetTileIndex)
			&& gs.getChar(targetTileIndex) !== gs.pc
			&& util.distance(gs.pc.tileIndex, targetTileIndex) <= weapon.type.range
			&& gs.isRayStaticPassable(gs.pc.tileIndex, targetTileIndex);
	};
	
	 // WEAPON_EFFECT_CLEAVE:
    // ************************************************************************************************
	this.weaponEffects.Cleave = Object.create(this.weaponEffects.Melee);
	this.weaponEffects.Cleave.skill = 'Melee';
	this.weaponEffects.Cleave.useOn = function (tileIndex, item, flags = {}) {
		let targetChar = gs.getChar(tileIndex),
			isLunge = false;
		
		// Damage:
		let damage = flags.damage || gs.pc.weaponDamage(item);
		
		// Proc Effect:
		if (item.type.procEffect) {
			flags.procEffect = item.type.procEffect;
		}
		
		// Move to attack:
		if (this.canLunge() && util.distance(gs.pc.tileIndex, tileIndex) > 1.5) {
			damage = damage * gs.pc.lungeDamageMultiplier;
			gs.pc.isMultiMoving = true;
			gs.pc.body.moveToTileIndex(this.getStepIndex(tileIndex));
			gs.pc.currentSp -= 1;
			isLunge = true;
		}
		
        // Cleave Hit:
		this.getTargetList(tileIndex).forEach(function (index) {
			gs.meleeAttack(gs.pc, index, this, damage, flags);
		}, this);
		
		// Sound:
        gs.playSound(gs.sounds.melee, gs.pc.tileIndex);
		
		// Recover Lunge Points:
		if (isLunge && targetChar && !targetChar.isAlive && gs.pc.talents.getTalentRank('Lunge') === 2) {
			gs.pc.gainSpeed(1);
		}
        
	};
	this.weaponEffects.Cleave.showTarget = function (tileIndex, weapon) {
		// Cleave Target:
		this.getTargetList(tileIndex).forEach(function (index) {
			gs.targetSprites.create(index, RED_TARGET_BOX_FRAME);
		}, this);
		
		// Show step index:
		if (gs.pc.hasLunge && util.distance(gs.pc.tileIndex, tileIndex) > 1.5) {
			gs.targetSprites.create(this.getStepIndex(tileIndex), GREEN_TARGET_BOX_FRAME);
		}
	};
	this.weaponEffects.Cleave.getTargetList = function (tileIndex) {
		let pcTileIndex = gs.pc.tileIndex;
		
		// Show step index:
		if (gs.pc.hasLunge && util.distance(gs.pc.tileIndex, tileIndex) > 1.5) {
			pcTileIndex = this.getStepIndex(tileIndex);
		}
		
		// Targeting an object:
		if (gs.getChar(tileIndex) && gs.getChar(tileIndex).faction === FACTION.DESTRUCTABLE) {
			if (util.distance(pcTileIndex, tileIndex) <= 1.5) {
				return [tileIndex];
			}
			else {
				return [];
			}
		}
		// Targeting a character:
		else {
			var list = gs.getIndexListInRadius(pcTileIndex, 1.5);
			
			// All tiles in range:
			list = list.filter(index => !util.vectorEqual(pcTileIndex, index));
			list = list.filter(index => util.distance(index, tileIndex) <= 2.0);
		
			// 3-Arc:
			list = list.filter(index => util.vectorEqual(index, tileIndex) || util.isStraight(index, tileIndex));
			list.sort((a, b) => util.distance(a, tileIndex) - util.distance(b, tileIndex));
			list = list.slice(0, Math.min(3, list.length));
			
			// Hostiles:
			list = list.filter(index => gs.getChar(index) && gs.pc.isHostileToMe(gs.getChar(index)));
			
			
			
			return list;
		}
	};
	
	// WEAPON_EFFECT_CRUSH:
	// ********************************************************************************************
	this.weaponEffects.Crush = Object.create(this.weaponEffects.Melee);
	this.weaponEffects.Crush.skill = 'Melee';
	this.weaponEffects.Crush.useOn = function (tileIndex, item, flags = {}) {
		let targetChar = gs.getChar(tileIndex),
			isLunge = false;
		
		// Damage:
        let damage = flags.damage || gs.pc.weaponDamage(item);
		
		// Move to attack:
		if (this.canLunge() && util.distance(gs.pc.tileIndex, tileIndex) > 1.5) {
			damage = damage * gs.pc.lungeDamageMultiplier;
			gs.pc.isMultiMoving = true;
			gs.pc.body.moveToTileIndex(this.getStepIndex(tileIndex));
			gs.pc.currentSp -= 1;
			isLunge = true;
		}
		
		// Crush Effect:
		let normal = util.get8WayVector(gs.pc.tileIndex, tileIndex);
		if (!gs.isStaticPassable(tileIndex.x + normal.x, tileIndex.y + normal.y)) {
			flags.isCrit = true;
		}
			
		// Proc Effect:
		if (item.type.procEffect) {
			flags.procEffect = item.type.procEffect;
		}
		
		// Melee Attack:
		gs.meleeAttack(gs.pc, tileIndex, this, damage, flags);
		
		// Play Sound:
		gs.playSound(gs.sounds.melee, gs.pc.tileIndex);
		
		// Recover Lunge Points:
		if (isLunge && targetChar && !targetChar.isAlive && gs.pc.talents.getTalentRank('Lunge') === 2) {
			gs.pc.gainSpeed(1);
		}
	};
	this.weaponEffects.Crush.showTarget = function (tileIndex, weapon) {
		// Target enemy:
		gs.targetSprites.create(tileIndex, RED_TARGET_BOX_FRAME);
		
		// Show step index:
		if (gs.pc.hasLunge && util.distance(gs.pc.tileIndex, tileIndex) > 1.5) {
			gs.targetSprites.create(this.getStepIndex(tileIndex), GREEN_TARGET_BOX_FRAME);
		}
		
		// Show Crunch Target:
		let normal = util.get8WayVector(gs.pc.tileIndex, tileIndex);
		let wallTileIndex = {x: tileIndex.x + normal.x, y: tileIndex.y + normal.y};
		if (!gs.isStaticPassable(wallTileIndex)) {
			gs.targetSprites.create(wallTileIndex, RED_TARGET_BOX_FRAME);
		
		}
	};

	// WEAPON_EFFECT_FLAME:
	// Used by Inferno Sword
    // ********************************************************************************************
	this.weaponEffects.Flame = Object.create(this.weaponEffects.Melee);
	this.weaponEffects.Flame.hitCharacter = function (defender, damage, flags) {
		gs.createFire(defender.tileIndex, damage, flags);
		return damage;
	};
	
   	// WEAPON_EFFECT_STORM_CHOPPER:
	// Used by Storm Chopper
    // ************************************************************************************************
	this.weaponEffects.StormChopper = Object.create(this.weaponEffects.Cleave);
	this.weaponEffects.StormChopper.hitCharacter = function (defender, damage, flags) {
		gs.createShock(defender.tileIndex, damage, flags);
		return damage;
	};
	
	// WEAPON_EFFECT_MOB_FUCKER:
	// ********************************************************************************************
	this.weaponEffects.MobFucker = {};
	this.weaponEffects.MobFucker.useOn = function (tileIndex, item) {
		var i;

		gs.liveCharacterList().forEach(function (character) {
			if (gs.getTile(character.tileIndex).visible && character !== gs.pc) {
				gs.createFire(character.tileIndex, item.type.stats.damage, {killer: gs.pc});
			}
		}, this);
	};
	this.weaponEffects.MobFucker.showTarget = function (tileIndex, weapon) {
		gs.targetSprites.create(tileIndex, RED_TARGET_BOX_FRAME);
	};
	this.weaponEffects.MobFucker.skill = 'Range';
	this.weaponEffects.MobFucker.canUseOn = function (targetTileIndex, weapon) {
		return true;
	};
	
	// SINGLE_PROJECTILE_WEAPON_EFFECT:
	// ********************************************************************************************
	this.weaponEffects.SingleProjectile = {};
	this.weaponEffects.SingleProjectile.useOn = function (tileIndex, item, flags) {
		var projectile;
		
		flags = flags || {};
		flags.killer = gs.pc;
		flags.isCrit = flags.isCrit || gs.pc.alwaysProjectileCrit;
		
		if (gs.pc.hasPerfectAim) {
			flags.perfectAim = true;
		}
		
		if (item.type.knockBack && util.frac() < 0.25) {
			flags.knockBack = 1;
		}
		
		gs.playSound(item.type.shootSound || gs.sounds.throw, gs.pc.tileIndex);
		
		projectile = gs.createProjectile(gs.pc, tileIndex, item.type.projectileName, gs.pc.weaponDamage(item), gs.pc.weaponRange(item), flags);
			
		// Character bounce:
		gs.pc.body.faceTileIndex(tileIndex);
		gs.pc.body.bounceTowards(tileIndex);
		
		return projectile;
		
	};
	this.weaponEffects.SingleProjectile.showTarget = function (tileIndex, weapon) {
		// Show red line to indicate invalid target:
		if (!this.canUseOn(tileIndex, weapon)) {
			gs.showTargetLine(tileIndex);
		}
	
		// Show red target:	
		gs.targetSprites.create(tileIndex, RED_TARGET_BOX_FRAME);
		
	};
	this.weaponEffects.SingleProjectile.skill = 'Range';
	this.weaponEffects.SingleProjectile.canUseOn = function (targetTileIndex, weapon) {
		return PlayerTargeting.isLineClear(targetTileIndex, true)
			&& (PlayerTargeting.isValidCharTarget(targetTileIndex) || PlayerTargeting.isValidTrapTarget(targetTileIndex))
			&& util.distance(gs.pc.tileIndex, targetTileIndex) <= gs.pc.weaponRange(weapon);
	};
	
	// CHAKRAM:
	// ********************************************************************************************
	this.weaponEffects.Chakram = Object.create(this.weaponEffects.SingleProjectile);
	this.weaponEffects.Chakram.canUseOn = function (targetTileIndex, weapon) {
		var lineClear;
		lineClear = gs.isRayStaticPassable(gs.pc.tileIndex, targetTileIndex);
		
		return lineClear 
			&& util.distance(gs.pc.tileIndex, targetTileIndex) <= gs.pc.weaponRange(weapon);
	};
	this.weaponEffects.Chakram.showTarget = function (targetTileIndex, weapon) {
		if (!this.canUseOn(targetTileIndex, weapon)) {
			gs.targetSprites.create(targetTileIndex, RED_SELECT_BOX_FRAME);
			gs.showTargetLine(targetTileIndex);
			return;
		}
		
		let startPos = util.toPosition(gs.pc.tileIndex),
			endPos = util.toPosition(targetTileIndex),
			normal = util.normal(startPos, endPos),
			pos = startPos,
			distance = 0,
			charList = [];
		
		while (distance < LOS_DISTANCE * TILE_SIZE) {
			pos.x += normal.x * PROJECTILE_SPEED;
			pos.y += normal.y * PROJECTILE_SPEED;
			distance += PROJECTILE_SPEED;
			
			let tileIndex = util.toTileIndex(pos);
			
			if (!util.vectorEqual(tileIndex, gs.pc.tileIndex)) {
				if (gs.getChar(tileIndex) && !util.inArray(gs.getChar(tileIndex), charList)) {
					charList.push(gs.getChar(tileIndex));
				}
			}
		}
		
		charList.forEach(function (char) {
			gs.targetSprites.create(char.tileIndex, PURPLE_SELECT_BOX_FRAME);
		}, this);
	};
	
	// MAGIC_STAFF:
	// ********************************************************************************************
	this.weaponEffects.MagicStaff = {};
	this.weaponEffects.MagicStaff.skill = 'Range';
	this.weaponEffects.MagicStaff.useOn = function (tileIndex, item, flags = {}) {
		let proj;
		
		flags.killer = gs.pc;
		
		// Sound:
		gs.playSound(gs.sounds.throw, gs.pc.tileIndex);
		
		// Perfect Aim:
		if (gs.pc.hasPerfectAim) {
			flags.perfectAim = true;
		}
		
		// Knock Back:
		if (item.type.knockBack && util.frac() < 0.25) {
			flags.knockBack = 1;
		}
		
		// Projectile:
		proj = gs.createProjectile(gs.pc, tileIndex, item.type.projectileName, gs.pc.weaponDamage(item), gs.pc.weaponRange(item), flags);
		
		// Character bounce:
		gs.pc.body.faceTileIndex(tileIndex);
		gs.pc.body.bounceTowards(tileIndex);
		
		// Shoot effect:
		if (item.type.shootEffect) {
			gs.createMagicShootEffect(gs.pc, tileIndex, item.type.shootEffect);
		}
		
		return proj;
	};
	this.weaponEffects.MagicStaff.showTarget = function (tileIndex, weapon) {
		var indexList, validTarget = true;
		
	
		// Invalid target:
		if (!this.canUseOn(tileIndex, weapon)) {
			validTarget = false;
		}
		
		
		// Show valid target (staff of storms):
		if (validTarget && weapon.type === gs.itemTypes.GreaterStaffOfStorms) {
			indexList = gs.getIndexListInRadius(tileIndex, 1.0);
			indexList = indexList.filter(index => util.vectorEqual(index, tileIndex) || gs.getChar(index) && gs.pc.isHostileToMe(gs.getChar(index)));
		
			indexList.forEach(function (index) {
				gs.targetSprites.create(index, RED_TARGET_BOX_FRAME);
			}, this);
		}
		// Show valid target:
		else if (validTarget) {
			gs.targetSprites.create(tileIndex, RED_TARGET_BOX_FRAME);
		}
		// Invalid Target:
		else {
			gs.showTargetLine(tileIndex);
			gs.targetSprites.create(tileIndex, RED_TARGET_BOX_FRAME);
		}
	};
	this.weaponEffects.MagicStaff.canUseOn = this.weaponEffects.SingleProjectile.canUseOn;
	
	gs.nameTypes(this.weaponEffects);
};

// CREATE_WEAPON_PROC_EFFECTS:
// ********************************************************************************************
gs.createWeaponProcEffects = function () {
	this.weaponProcEffects = {};
	
	// FREEZE:
	this.weaponProcEffects.Freeze = function (targetChar, damage) {
		if (util.frac() <= 0.10 && !targetChar.statusEffects.has('Frozen') && !targetChar.type.isFreezeImmune) {
			targetChar.statusEffects.add('Frozen', {duration: 2});
			
			// Sound:
			gs.playSound(gs.sounds.ice, targetChar.tileIndex);

			// Camera Effects:
			game.camera.shake(0.010, 100);
			game.camera.flash(0xffffff, 300);
		}
	};
	
	// POISON:
	this.weaponProcEffects.Poison = function (targetChar, damage) {
		if (util.frac() <= PC_PROC_CHANCE) {
			let poisonDamage = damage * 2;
			targetChar.addPoisonDamage(poisonDamage);
			
			// Particle:
			gs.createPoisonEffect(targetChar.tileIndex);
		}
	};
	
	// LIFE_TAP:
	this.weaponProcEffects.LifeTap = function (targetChar, damage) {
		if (util.frac() <= PC_PROC_CHANCE) {
			let lifeTap = Math.ceil(damage * 0.25);
		
			if (!targetChar.type.noBlood) {
				gs.pc.healHp(lifeTap);
				gs.pc.popUpText('+' + lifeTap + 'HP', 'Green');
				
				gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
			}
		}
	};
	
	// ENERGY_DRAIN:
	this.weaponProcEffects.EnergyDrain = function (targetChar, damage) {
		if (util.frac() <= PC_PROC_CHANCE) {
			let energyDrain = Math.ceil(damage * 0.25);
		
			gs.pc.restoreMp(energyDrain);
			gs.pc.popUpText('+' + energyDrain + 'MP', 'Purple');
			gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
		}
	};
};