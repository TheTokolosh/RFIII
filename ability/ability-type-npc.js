/*global gs, game, util, console, levelController, debug, Item*/
/*global LOS_DISTANCE, ABILITY_RANGE, FACTION, KNOCK_BACK_SPEED*/
/*global SPIDER_EGG_HATCH_TURNS, HELL_PORTAL_HATCH_TURNS*/
/*global FIRE_POT_MIN_DAMAGE, FIRE_POT_MAX_DAMAGE, DAMAGE_TYPE*/
/*global GAS_POT_MIN_DAMAGE, GAS_POT_MAX_DAMAGE, ACTION_TIME, MOVEMENT_TYPE*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// CREATE_NPC_ABILITY_TYPES:
// ********************************************************************************************
gs.createNPCAbilityTypes = function () {
	// MELEE_ATTACK:
	// Used by NPCs to give them melee attacks
	// Note that player melee attacks are handled by weaponEffectTypes
	// ****************************************************************************************
	this.abilityTypes.MeleeAttack = {};
	this.abilityTypes.MeleeAttack.attributes = {damage: {}};
	this.abilityTypes.MeleeAttack.onHitFunc = null;
	this.abilityTypes.MeleeAttack.damageType = DAMAGE_TYPE.PHYSICAL;
	this.abilityTypes.MeleeAttack.range = 1.5;
	this.abilityTypes.MeleeAttack.canUseOn = this.abilityCanUseOn.SingleTileRay;
	this.abilityTypes.MeleeAttack.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.MeleeAttack.useOn = function (character, targetTileIndex) {
		var damage, onHitFunc = null;
		
		// Attributes:
		damage = this.attributes.damage.value(character) + character.bonusMeleeDamage;
		
		if (this.onHitFunc) {
			onHitFunc = this.onHitFunc.bind(this);
		}
				
		// Melee Attack:
		gs.meleeAttack(character, targetTileIndex, null, damage, {effectFunc: onHitFunc, damageType: this.damageType});
		
		// Play Sound:
		gs.playSound(gs.sounds.melee, character.tileIndex);
	};
	this.abilityTypes.MeleeAttack.toShortDesc = function (npc) {
		let meleeDamage = this.attributes.damage.value(npc) + npc.bonusMeleeDamage,
			name = '';
		
		if (this.damageType !== DAMAGE_TYPE.PHYSICAL) {
			name += this.damageType + ' ';
		}
		
		name += 'Melee Attack';
		
		return '*' + name + ': ' + meleeDamage + ' DMG';
	};
	
	// VAMPIRE_ATTACK:
	// Used by NPCs to give them a vampire attack which heals and raises their max hp
	// ****************************************************************************************
	this.abilityTypes.VampireAttack = Object.create(this.abilityTypes.MeleeAttack);
	this.abilityTypes.VampireAttack.healPercent = 0.5;
	this.abilityTypes.VampireAttack.onHitFunc = function (defender, attacker, damage) {
		let amount = Math.ceil(damage * this.healPercent);
		attacker.healHp(amount);
		
		// Pop-Up Text:
		attacker.popUpText('+' + amount, 'Green');
	};
	this.abilityTypes.VampireAttack.toShortDesc = function (npc) {
		let meleeDamage = this.attributes.damage.value(npc);
		return '*Life Tap Melee: ' + meleeDamage + ' DMG';
	};
	
	
	// EXP_DRAIN_ATTACK:
	// Used by NPCs to give them a exp draining melee attacks
	// Note that player melee attacks are handled by weaponEffectTypes
	// ****************************************************************************************
	this.abilityTypes.EXPDrainAttack = Object.create(this.abilityTypes.MeleeAttack);
	this.abilityTypes.EXPDrainAttack.onHitFunc = function (defender, attacker, damage) {
		defender.loseExp(5);
	};
	
	
	// POISON_ATTACK:
	// ********************************************************************************************
	this.abilityTypes.PoisonAttack = Object.create(this.abilityTypes.MeleeAttack);
	this.abilityTypes.PoisonAttack.poisonChance = 0.25;
	this.abilityTypes.PoisonAttack.onHitFunc = function (defender, attacker, damage) {
		// Poison Damage:
		let poisonDamage = this.attributes.damage.value(attacker) * 3;
		if (this.poisonDamage) {
			poisonDamage = this.poisonDamage;
		}
		
		if (util.frac() < this.poisonChance) {
			defender.addPoisonDamage(poisonDamage);
			
			// Particle:
			gs.createPoisonEffect(defender.tileIndex);
		}
	};
	this.abilityTypes.PoisonAttack.toShortDesc = function (npc) {
		let meleeDamage = this.attributes.damage.value(npc);
		let poisonDamage = this.attributes.damage.value(npc) * 3;
		if (this.poisonDamage) {
			poisonDamage = this.poisonDamage;
		}
		
		return '*Poison Melee: ' + meleeDamage + ' [' + poisonDamage + '] DMG';
	};
	
	// MANA_DRAIN_ATTACK:
	// ********************************************************************************************
	this.abilityTypes.ManaDrainAttack = Object.create(this.abilityTypes.MeleeAttack);
	this.abilityTypes.ManaDrainAttack.manaDrainChance = 0.25;
	this.abilityTypes.ManaDrainAttack.onHitFunc = function (defender, attacker, damage) {
		var manaDrainAmount = this.attributes.damage.value(attacker);
		
		if (util.frac() < this.manaDrainChance) {
			let amount = Math.min(manaDrainAmount, defender.currentMp);
			defender.loseMp(amount);
			defender.popUpText('Mana Drain!', 'Red');
		}
	};
	this.abilityTypes.ManaDrainAttack.toShortDesc = function (npc) {
		let meleeDamage = this.attributes.damage.value(npc);
		let manaDrainAmount = this.attributes.damage.value(npc);
		
		return '*Mana Drain Attack: ' + meleeDamage + ' DMG [' + manaDrainAmount + ' MP]';
	};
		
	// SHOCKING_GRASP:
	// ********************************************************************************************
	this.abilityTypes.ShockingGrasp = Object.create(this.abilityTypes.MeleeAttack);
	this.abilityTypes.ShockingGrasp.useOn = function (actingChar, targetTileIndex) {		
		// Attributes:
		let damage = this.attributes.damage.value(actingChar);
		
		// Shock:
		gs.createShock(targetTileIndex, damage, {killer: actingChar});
		
		// Character bounce and face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
	};
	
	
	// DRAINING_ATTACK:
	// ********************************************************************************************
	this.abilityTypes.DrainingAttack = Object.create(this.abilityTypes.MeleeAttack);
	this.abilityTypes.DrainingAttack.onHitFunc = function (defender, attacker, damage) {
		if (util.frac() < 0.25) {
			defender.statusEffects.add('Draining');
		}	
	};
		
	// TRAMPLE_ATTACK:
	// ********************************************************************************************
	this.abilityTypes.Trample = {};
	this.abilityTypes.Trample.attributes = {damage: {}};
	this.abilityTypes.Trample.range = 1.5;
	this.abilityTypes.Trample.canUseOn = this.abilityCanUseOn.SingleTileRay;
	this.abilityTypes.Trample.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.Trample.useOn = function (character, targetTileIndex) {
		var onHit, damage, isCrunch = false;
		
		damage = this.attributes.damage.value(character);
		
		// If immobile then we just perform a standard melee attack:
		if (character.isImmobile) {
			gs.meleeAttack(character, targetTileIndex, null, damage);
			gs.playSound(gs.sounds.melee, character.tileIndex);	
			return;
		}
		
		
		// Crunch:
		let targetChar = gs.getChar(targetTileIndex);
		let normal = util.normal(character.tileIndex, targetTileIndex);
		if (targetChar && !gs.isPassable(targetChar.body.getKnockBackIndex(normal, 1))) {
			isCrunch = true;
		}
		
		onHit = function (targetChar) {
			character.popUpText('Trample!', 'White');
			
			if (isCrunch) {
				targetChar.popUpText('Crunch!', 'Red');
			}
		}.bind(this);
		
		// Melee Attack:
		gs.meleeAttack(character, targetTileIndex, null, damage, {effectFunc: onHit, knockBack: 1, neverMiss: true, isCrit: isCrunch});
		
		if (gs.isPassable(targetTileIndex) && character.isAlive) {
			character.body.isKnockBack = true;
			character.moveTo(targetTileIndex, false);
		}
	
		// Play Sound:
		gs.playSound(gs.sounds.melee, character.tileIndex);	
	};

	
	// PROJECTILE_ATTACK:
	// Used by NPCs to give them projectile attacks
	// Note that player projectile attacks are handled by weaponEffectTypes
	// ********************************************************************************************
	this.abilityTypes.ProjectileAttack = {};
	this.abilityTypes.ProjectileAttack.attributes = {damage: {}};
	this.abilityTypes.ProjectileAttack.canUseOn = this.abilityCanUseOn.NPCProjectileAttack;
	this.abilityTypes.ProjectileAttack.range = 5.0;
	this.abilityTypes.ProjectileAttack.sound = gs.sounds.throw;
	this.abilityTypes.ProjectileAttack.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.ProjectileAttack.useOn = function (character, targetTileIndex) {
		var damage;
		
		damage = this.attributes.damage.value(character);
		
		// Create Projectile:
		gs.createProjectile(character, targetTileIndex, this.projectileTypeName, damage, this.range(), {killer: character});
		
		// Character bounce and face:
		character.body.faceTileIndex(targetTileIndex);
		character.body.bounceTowards(targetTileIndex);
		
		// Effect:
		if (this.shootEffect) {
			gs.createMagicShootEffect(character, targetTileIndex, this.shootEffect);
		}
		
		// Play Sound:
		gs.playSound(this.sound, character.tileIndex);
	};
	this.abilityTypes.ProjectileAttack.toShortDesc = function (npc) {
		let damage = this.attributes.damage.value(npc);
	
		if (damage > 0) {
			return '*' + this.niceName + ': ' + damage + ' DMG';
		}
		else {
			return '*' + this.niceName;
		}

	};
	
	// ROTATE_PROJECTILE_ATTACK:
	// ********************************************************************************************
	this.abilityTypes.RotateProjectileAttack = Object.create(this.abilityTypes.ProjectileAttack);
	this.abilityTypes.RotateProjectileAttack.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.NPCProjectileAttack.call(this, actingChar, targetTileIndex)
			&& actingChar.rotFacing === actingChar.getFacingToTarget(targetTileIndex);
	};
	this.abilityTypes.RotateProjectileAttack.niceName = 'Projectile Attack';
	

	

	
	// SUICIDE:
	// Used by NPCs which kill themselves when in range
	// Note that the actual effects upon death are handled by onNPCDeath
	// ********************************************************************************************
	this.abilityTypes.Suicide = {};
	this.abilityTypes.Suicide.range = 1.5;
	this.abilityTypes.Suicide.canUseOn = this.abilityCanUseOn.SingleCharacterRay;
	this.abilityTypes.Suicide.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.Suicide.useOn = function (character, targetTileIndex) {
		character.death();
	};
	this.abilityTypes.Suicide.toShortDesc = function (npc) {
		let damage = npc.type.onDeath.attributes.damage.value(npc);
		
		return '*Explode: ' + damage + ' DMG';
	};
	
	// NPC_DISCORD:
	// ********************************************************************************************
	this.abilityTypes.NPCDiscord = {};
	this.abilityTypes.NPCDiscord.niceName = 'Discord';
	this.abilityTypes.NPCDiscord.attributes = {
		damage:				{base: [null, 16, 24], modifier: 'magicPower'},
		duration:			{base: [null, 8, 12], modifier: 'magicPower'},
		damageMultiplier:	{base: [null, 2.0, 3.0]},
	};
	this.abilityTypes.NPCDiscord.isSpell = true;
	this.abilityTypes.NPCDiscord.range = 5.5;
	this.abilityTypes.NPCDiscord.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.NPCDiscord.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex)
			&& !gs.getChar(targetTileIndex).statusEffects.has('Discord')
			&& gs.getTile(actingChar.tileIndex).visible;
	};
	this.abilityTypes.NPCDiscord.useOn = function (actingChar, targetTileIndex) {		
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
	
	// SPAWN_NPC:
	// Used by NPC spawners
	// ********************************************************************************************
	this.abilityTypes.SpawnNPC = {};
	this.abilityTypes.SpawnNPC.attributes = {damage: {}};
	this.abilityTypes.SpawnNPC.range = 8;
	this.abilityTypes.SpawnNPC.mana = 1;
	this.abilityTypes.SpawnNPC.numSpawned = 1;
	this.abilityTypes.SpawnNPC.npcTypeName = null; // Set this to the name of the npcType
	this.abilityTypes.SpawnNPC.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.SpawnNPC.getNPCTypeName = function () {
		if (typeof this.npcTypeName === 'string') {
			return this.npcTypeName;
		}
		else {
			return util.randElem(this.npcTypeName);
		}
	};
	
	this.abilityTypes.SpawnNPC.getSpawnIndex = function (actingChar, targetTileIndex) {
		var indexList, npcType;
				
		npcType = gs.npcTypes[this.getNPCTypeName()];
		
		// First attempting to find safe spawn:
		indexList = gs.getIndexListInRadius(actingChar.tileIndex, 1.5);
		indexList = indexList.filter(index => gs.isPassable(index));
		indexList = indexList.filter(index => gs.isIndexSafeForCharType(index, npcType));
		
		// No safe spawn so we default to unsafe spawn:
		if (indexList.length === 0) {
			indexList = gs.getIndexListInRadius(actingChar.tileIndex, 1.5);
			indexList = indexList.filter(index => gs.isPassable(index));
		}
		
		// Sort by nearest to target:
		indexList.sort((a, b) => util.distance(targetTileIndex, a) - util.distance(targetTileIndex, b));
		return indexList.length > 0 ? indexList[0] : null;
	};
	this.abilityTypes.SpawnNPC.canUseOn = function (actingChar, targetTileIndex) {
		return this.getSpawnIndex(actingChar, targetTileIndex);
		/*
    	return util.distance(actingChar.tileIndex, targetTileIndex) <= this.range()
			&& this.getSpawnIndex(actingChar, targetTileIndex);
			*/
	};
	this.abilityTypes.SpawnNPC.useOn = function (actingChar, targetTileIndex) {
		var tileIndex, npc, flags = {};
		
		for (let i = 0; i < this.numSpawned; i += 1) {
			tileIndex = this.getSpawnIndex(actingChar, targetTileIndex);
			if (tileIndex) {
				npc = gs.createNPC(tileIndex, this.getNPCTypeName(), flags);
				npc.spotAgroPlayer();
				npc.waitTime = 100;
				npc.faction = actingChar.faction;
				gs.playSound(gs.sounds.spell, actingChar.tileIndex);
				gs.createParticlePoof(tileIndex, 'WHITE');
			}
		}
		
		// Destroy spawner type NPCs (immobile) that are out of mana:
		if (actingChar.type.isImmobile && actingChar.currentMp === 1) {
			actingChar.death();
		}
	};
	this.abilityTypes.SpawnNPC.toShortDesc = function (npc) {
		if (typeof this.npcTypeName === 'string') {
			return '*Spawn Monsters: ' + gs.capitalSplit(this.npcTypeName);
		}
		else {
			return '*Spawn Monsters';
		}
	};
	
	// SPAWN_TURRETS:
	// spawns turrets on clockwork hatches
	// ********************************************************************************************
	this.abilityTypes.ActivateTurrets = {};
	this.abilityTypes.ActivateTurrets.range = 100;
	this.abilityTypes.ActivateTurrets.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.ActivateTurrets.getSpawnIndexList = function (actingChar) {		
		let objList = gs.objectList.filter(obj => util.inArray(obj.type.name, ['CannonTurretHatch', 'PyroTurretHatch']));
		
		// Find all groupIds:
		let groupIdList = [];
		objList.forEach(function (obj) {
			if (!util.inArray(obj.groupId, groupIdList)) {
				groupIdList.push(obj.groupId);
			}
		}, this);
		
		if (groupIdList.length > 0) {
			// GroupIds contain the vault name so we need to strip down to the number:
			let name = groupIdList[0].substring(0, groupIdList[0].length - 1);
			groupIdList = groupIdList.map(id => id[id.length - 1]);
			
		
			// Select lowest groupId:
			groupIdList = groupIdList.sort((a, b) => a - b);
			let groupId = groupIdList[0];
			
			objList = objList.filter(obj => obj.groupId === name + groupId);
			objList = objList.filter(obj => gs.isPassable(obj.tileIndex));

			let tileIndexList = objList.map(obj => obj.tileIndex);

			return tileIndexList;
		}
		else {
			return null;
		}
	};
	this.abilityTypes.ActivateTurrets.canUseOn = function (actingChar, targetTileIndex) {
		return this.getSpawnIndexList(actingChar);
	};
	this.abilityTypes.ActivateTurrets.useOn = function (actingChar, targetTileIndex) {
		let tileIndexList = this.getSpawnIndexList(actingChar);
		
		// Spawn:
		tileIndexList.forEach(function (tileIndex) {
			let npc = gs.createNPC(tileIndex, gs.getObj(tileIndex).type.npcTypeName);
			npc.isAgroed = true;
			npc.waitTime = 100;
			npc.exp = 0;
			npc.faction = actingChar.faction;
			gs.createParticlePoof(tileIndex, 'WHITE');
			
			// Destory object:
			gs.destroyObject(gs.getObj(tileIndex));
		}, this);
		
		// Text:
		actingChar.popUpText('Activate Turrets');
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	};
	
	// SPAWN_CLOCKWORKS:
	// Spawns clockworks on ClockworkHatches
	// These clockworks will have 0EXP though they will not despawn
	// ********************************************************************************************
	this.abilityTypes.SpawnClockworks = {};
	this.abilityTypes.SpawnClockworks.range = 100;
	this.abilityTypes.SpawnClockworks.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.SpawnClockworks.getSpawnIndexList = function (actingChar) {		
		let objList = gs.objectList.filter(obj => obj.type.name === 'ClockworkHatch');
		
		// Find all groupIds:
		let groupIdList = [];
		objList.forEach(function (obj) {
			if (!util.inArray(obj.groupId, groupIdList)) {
				groupIdList.push(obj.groupId);
			}
		}, this);
		
		// Select a groupId:
		let groupId = util.randElem(groupIdList);
		
		objList = objList.filter(obj => obj.groupId === groupId);
		objList = objList.filter(obj => gs.isPassable(obj.tileIndex));
		
		let tileIndexList = objList.map(obj => obj.tileIndex);
		
		return tileIndexList;
		
	};
	this.abilityTypes.SpawnClockworks.getNPCTypeName = function (actingChar) {
		if (actingChar.currentHp >= actingChar.maxHp * 0.75) {
			return util.randElem(['ClockworkRat', 'ClockworkRat', 'Bombomber']);
		}
		else {
			return util.randElem(['ClockworkWarrior', 'ClockworkWarrior', 'ClockworkArcher']);
		}
	};
	this.abilityTypes.SpawnClockworks.canUseOn = function (actingChar, targetTileIndex) {
		return true;
	};
	this.abilityTypes.SpawnClockworks.useOn = function (actingChar, targetTileIndex) {
		let tileIndexList = this.getSpawnIndexList(actingChar);
		
		// Spawn:
		tileIndexList.forEach(function (tileIndex) {
			let npc = gs.createNPC(tileIndex, this.getNPCTypeName(actingChar));
			npc.isAgroed = true;
			npc.waitTime = 100;
			npc.exp = 0;
			npc.faction = actingChar.faction;
			gs.createParticlePoof(tileIndex, 'WHITE');
		}, this);
		
		// Text:
		actingChar.popUpText('Spawn Clockworks');
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	};
	
	// SUMMON_IMP: 
	// ****************************************************************************************
	this.abilityTypes.SummonImp = Object.create(this.abilityTypes.SpawnNPC);
	this.abilityTypes.SummonImp.toShortDesc = function (npc) {
		return '*Summon Imp';
	};
	
	// HOMING_FIRE_ORB:
	// ****************************************************************************************
	this.abilityTypes.HomingFireOrb = Object.create(this.abilityTypes.SpawnNPC);
	this.abilityTypes.HomingFireOrb.canUseOn = function (actingChar, targetTileIndex) {
		let path = gs.findPath(actingChar.tileIndex, targetTileIndex, {allowDiagonal: true});
		
    	return path && path.length <= 10
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range()
			&& this.getSpawnIndex(actingChar, targetTileIndex);
	};
	this.abilityTypes.HomingFireOrb.useOn = function (actingChar, targetTileIndex) {
		let tileIndex = this.getSpawnIndex(actingChar, targetTileIndex);
		if (tileIndex) {
			// Create NPC:
			let npc = gs.createNPC(tileIndex, this.getNPCTypeName(), {burstDamage: this.attributes.damage.value(actingChar)});
			npc.spotAgroPlayer();
			npc.waitTime = 100;
			npc.faction = actingChar.faction;
			
			// Effects:
			gs.playSound(gs.sounds.spell, actingChar.tileIndex);
			gs.createParticlePoof(tileIndex, 'WHITE');
			
			// Character bounce and face:
			actingChar.body.faceTileIndex(targetTileIndex);
			actingChar.body.bounceTowards(targetTileIndex);
		}
	};
	this.abilityTypes.HomingFireOrb.toShortDesc = function (npc) {
		return '*Homing Fire Orb: ' + this.attributes.damage.value(npc) + ' DMG';
	};
	this.abilityTypes.HomingFireOrb.getNPCTypeName = function () {
		return 'HomingFireOrb';
	};
	
	// SUMMON_HELL_PORTAL:
	// ****************************************************************************************
	this.abilityTypes.SummonHellPortal = {};
	this.abilityTypes.SummonHellPortal.isSpell = true;
	this.abilityTypes.SummonHellPortal.range = ABILITY_RANGE;
	this.abilityTypes.SummonHellPortal.aoeRange = 1.5; // Used by getTarget.TBAoE to select tiles adjacent to hostiles
	this.abilityTypes.SummonHellPortal.getTarget = this.abilityGetTarget.TBAoE;
	this.abilityTypes.SummonHellPortal.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleTileSmite.call(this, actingChar, targetTileIndex)
			&& !gs.getObj(targetTileIndex)
			&& !gs.isPit(targetTileIndex)
			&& gs.isIndexSafe(targetTileIndex)
			&& gs.isPassable(targetTileIndex);
	};
	this.abilityTypes.SummonHellPortal.useOn = function (actingChar, targetTileIndex) {
		var npc;
		
		// Character:
		actingChar.popUpText('Summon Hell Portal', 'White');
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
		
		// Portal:
		npc = gs.createNPC(targetTileIndex, 'HellPortal', {summonerId: actingChar.id});
		npc.popUpText('Hell Portal', 'White');
		npc.isAgroed = true;
		npc.faction = actingChar.faction;
		npc.waitTime = 300;
		actingChar.summonIDList.push(npc.id);
		gs.createParticlePoof(targetTileIndex, 'PURPLE');
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// SPIDER_WEB
	// ********************************************************************************************
	this.abilityTypes.SpiderWeb = {};
	this.abilityTypes.SpiderWeb.projectileTypeName = 'SpiderWeb';
	this.abilityTypes.SpiderWeb.range = 3;
	this.abilityTypes.SpiderWeb.isValidWebIndex = function (tileIndex) {
		if (gs.getObj(tileIndex, obj => !obj.type.canOverWrite)) {
			return false;
		}
		
		return gs.isInBounds(tileIndex)
			&& gs.getTile(tileIndex).type.passable === 2
			&& !gs.isPit(tileIndex)
			&& !util.inArray(gs.getTile(tileIndex).type.name, ['Water', 'Lava', 'ToxicWaste', 'Blood']);
	};
	
	this.abilityTypes.SpiderWeb.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.SpiderWeb.canUseOn = function (character, targetTileIndex) {
		let indexList = gs.getIndexListInRadius(targetTileIndex, 1);
		indexList = indexList.filter(tileIndex => this.isValidWebIndex(tileIndex));
		
		return gs.abilityCanUseOn.SingleCharacterRay.call(this, character, targetTileIndex)
			&& this.isValidWebIndex(targetTileIndex)
			&& indexList.length >= 4;
	};
	this.abilityTypes.SpiderWeb.useOn = function (character, targetTileIndex) {
		gs.createProjectile(character, targetTileIndex, this.projectileTypeName, 0, this.range(character) + 1);
		
		// Play Sound:
		gs.playSound(gs.sounds.throw, character.tileIndex);
		
		// Character bounce and face:
		character.body.faceTileIndex(targetTileIndex);
		character.body.bounceTowards(targetTileIndex);
	};
	
	// FLAME_WEB:
	// ********************************************************************************************
	this.abilityTypes.FlameWeb = Object.create(this.abilityTypes.SpiderWeb);
	this.abilityTypes.FlameWeb.projectileTypeName = 'FlameWeb';
	
	// AIR_STRIKE:
	// ********************************************************************************************
	this.abilityTypes.AirStrike = {};
	this.abilityTypes.AirStrike.attributes = {damage: {}};
	this.abilityTypes.AirStrike.range = 3;
	this.abilityTypes.AirStrike.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.AirStrike.canUseOn = this.abilityCanUseOn.SingleCharacterRay;
	this.abilityTypes.AirStrike.useOn = function (actingChar, targetTileIndex) {
		let targetChar = gs.getChar(targetTileIndex);
		let delta = util.get8WayVector(actingChar.tileIndex, targetTileIndex);
		let damage = this.attributes.damage.value(actingChar);
			
		// Damage:
		targetChar.takeDamage(damage, 'Physical', {killer: actingChar, neverBlink: true});

		// Knockback:
		if (targetChar.isAlive) {
			targetChar.body.applyKnockBack(delta, 2);
		}
		
		// Popup Text:
		actingChar.popUpText('Air Strike');
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 59);
		
		// Particles and Lighting:
		gs.createParticleBurst(actingChar.sprite.position, delta, 'WHITE');
		gs.createLightCircle(actingChar.sprite.position, '#cbd7d8', 120, 30, '88');
		
		// Sound:
		gs.playSound(gs.sounds.bolt, actingChar.tileIndex);
	};
	
	// THROW_NET:
	// ********************************************************************************************
	this.abilityTypes.ThrowNet = {};
	this.abilityTypes.ThrowNet.range = 4;
	this.abilityTypes.ThrowNet.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.ThrowNet.canUseOn = this.abilityCanUseOn.SingleCharacterRay;
	this.abilityTypes.ThrowNet.useOn = function (character, targetTileIndex) {
		gs.createProjectile(character, targetTileIndex, 'Net', 0, this.range, {duration: 5});
	};

	// CONSTRICT:
	// ********************************************************************************************
	this.abilityTypes.Constrict = {};
	this.abilityTypes.Constrict.range = 1.5;
	this.abilityTypes.Constrict.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.Constrict.canUseOn = function (actingChar, targetTileIndex) {
		let char = gs.getChar(targetTileIndex);
		return char
			&& !char.statusEffects.has('Constricted')
			&& gs.abilityCanUseOn.SingleTileRay.call(this, actingChar, targetTileIndex);
	};
	this.abilityTypes.Constrict.canUse = function (actingChar) {
		return !actingChar.statusEffects.has('Constricting');
	};
	this.abilityTypes.Constrict.useOn = function (character, targetTileIndex) {
		var targetChar = gs.getChar(targetTileIndex);
		
		if (targetChar) {
			targetChar.statusEffects.add('Constricted', {duration: 5, casterId: character.id});
			character.statusEffects.add('Constricting' , {duration: 5, targetCharId: targetChar.id});
		}
		
		gs.playSound(gs.sounds.playerHit);
		
		character.body.faceTileIndex(targetTileIndex);
		character.body.bounceTowards(targetTileIndex);
	};
	
	// RAISE_DEAD:
	// Used by The Lich King to raise multiple skeletons or bone vortices
	// ****************************************************************************************
	this.abilityTypes.RaiseDead = {};
	this.abilityTypes.RaiseDead.range = ABILITY_RANGE;
	this.abilityTypes.RaiseDead.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.RaiseDead.canUseOn = function (character, targetTileIndex) {
		let numHostiles = gs.characterList.filter(char => char.isAlive && char.faction === FACTION.HOSTILE).length;
		
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, character, targetTileIndex)
			&& numHostiles <= 12
			&& this.getIndexList(character, targetTileIndex);
	};
	this.abilityTypes.RaiseDead.getIndexList = function (actingChar, targetTileIndex) {
		// A circle around the target character:
		let indexList = gs.getIndexListInFlood(targetTileIndex, gs.isStaticPassable, 5);
		
		// Only tiles containing skeletons or bones:
		indexList = indexList.filter(tileIndex => gs.getObj(tileIndex, ['SkeletonCorpse', 'Bones']));
		
		// Only passable tiles:
		indexList = indexList.filter(tileIndex => gs.isPassable(tileIndex));
		
		if (indexList.length > 0) {
			return indexList;
		}
		else {
			return null;
		}
	};
	this.abilityTypes.RaiseDead.getNumSummons = function (actingChar) {
		if (actingChar.currentHp >= actingChar.maxHp * 0.75) {
			return 2;
		}
		else if (actingChar.currentHp >= actingChar.maxHp * 0.25) {
			return 3;
		}
		else {
			return 4;
		}
	};
	this.abilityTypes.RaiseDead.useOn = function (actingChar, targetTileIndex) {
		let indexList = this.getIndexList(actingChar, targetTileIndex);
		
		let num = Math.min(this.getNumSummons(actingChar), indexList.length);
		
		indexList = util.randSubset(indexList, num);
		
		indexList.forEach(function (tileIndex) {
			let npcTypeName;
			
			if (gs.getObj(tileIndex).type.name === 'SkeletonCorpse') {
				npcTypeName = util.randElem(['SkeletonWarrior', 'SkeletonArcher']);
			}
			else if (gs.getObj(tileIndex).type.name === 'Bones') {
				npcTypeName = 'BoneVortex';
			}
			
			let npc = gs.createNPC(tileIndex, npcTypeName);
			npc.faction = actingChar.faction;
			npc.waitTime = 100;
			npc.exp = 0;
			npc.isAgroed = true;
			npc.popUpText('Revived', 'White');
			gs.createParticlePoof(tileIndex, 'PURPLE');
			gs.destroyObject(gs.getObj(tileIndex));
		}, this);
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
		
		// Caster:
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
		actingChar.popUpText('Raise Dead', 'White');
	};

	// REVIVE_SKELETON:
	// ****************************************************************************************
	this.abilityTypes.ReviveSkeleton = {};
	this.abilityTypes.ReviveSkeleton.isSpell = true;
	this.abilityTypes.ReviveSkeleton.range = LOS_DISTANCE;
	this.abilityTypes.ReviveSkeleton.aoeRange = 5;
	this.abilityTypes.ReviveSkeleton.canUse = function (actingChar) {
		// Charmed NPCs should never revive skeletons:
		return actingChar.faction === FACTION.HOSTILE;
	};
	this.abilityTypes.ReviveSkeleton.canUseOn = function (actingChar, targetTileIndex) {
		let obj = gs.getObj(targetTileIndex, 'SkeletonCorpse');
		return gs.abilityCanUseOn.SingleTileSmite.call(this, actingChar, targetTileIndex) 
			&& obj
			&& (!obj.npcTypeName || !gs.npcTypes[obj.npcTypeName].isBoss)
			&& gs.isPassable(targetTileIndex);
	};
	this.abilityTypes.ReviveSkeleton.getTarget = function (actingChar) {
		var indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.aoeRange(actingChar));
		
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		
		return indexList.length > 0 ? indexList[0] : null;
	};
	this.abilityTypes.ReviveSkeleton.useOn = function (character, targetTileIndex) {
		let npcTypeName = gs.getObj(targetTileIndex).npcTypeName || 'SkeletonWarrior';
		
		gs.createSummonEffect(targetTileIndex, function () {
			// Revive Skeleton:
			let npc = gs.createNPC(targetTileIndex, npcTypeName);
			npc.isAgroed = true;
			npc.waitTime = 100;
			
			// Special Case - Liches:
			// To avoid chain revive we set revive on cooldown:
			let ability = npc.abilities.list.find(ability => ability && ability.type.name === 'ReviveSkeleton');
			if (ability) {
				ability.coolDown = ability.type.coolDown;
			}

			// Particle Poof and text:
			gs.createParticlePoof(targetTileIndex, 'PURPLE');
			npc.popUpText('Revived', 'White');
			
			
		}, this);
		
		// Destroy Bones:
		gs.destroyObject(gs.getObj(targetTileIndex));
		
		// Sound:
		gs.playSound(gs.sounds.cure, targetTileIndex);
		
		// Caster:
		gs.createParticlePoof(character.tileIndex, 'PURPLE');
		character.popUpText('Revive Skeleton', 'White');
	};
	
	// SUMMON_MAGGOT:
	// ****************************************************************************************
	this.abilityTypes.SummonMaggot = {};
	this.abilityTypes.SummonMaggot.isSpell = true;
	this.abilityTypes.SummonMaggot.range = LOS_DISTANCE;
	this.abilityTypes.SummonMaggot.aoeRange = 5;
	this.abilityTypes.SummonMaggot.canUse = function (actingChar) {
		// Charmed NPCs should never revive skeletons:
		return actingChar.faction === FACTION.HOSTILE;
	};
	this.abilityTypes.SummonMaggot.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleTileSmite.call(this, actingChar, targetTileIndex) 
			&& gs.getObj(targetTileIndex, 'Blood') 
			&& gs.isPassable(targetTileIndex);
	};
	this.abilityTypes.SummonMaggot.getTarget = function (actingChar) {
		var indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.aoeRange(actingChar));
		
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		
		return indexList.length > 0 ? indexList[0] : null;
	};
	this.abilityTypes.SummonMaggot.useOn = function (character, targetTileIndex) {
		// Create Maggot Func:
		let createMaggot = function (tileIndex) {
			// Maggot:
			let npc = gs.createNPC(tileIndex, 'Maggot');
			npc.isAgroed = true;
			npc.waitTime = 100;
			npc.exp = 0;
			
			// Pop-Up Text:
			npc.popUpText('Maggot!', 'White');
			
			// Particles:
			gs.createParticlePoof(tileIndex, 'RED');
		};
		
		// Create first maggot on blood:
		createMaggot(targetTileIndex);
		
		// Create 2 more Maggots adjacent:
		let indexList = gs.getIndexListAdjacent(targetTileIndex);
		indexList = indexList.filter(tileIndex => gs.isPassable(tileIndex));
		indexList = util.randSubset(indexList, Math.min(2, indexList.length));
		indexList.forEach(function (tileIndex) {
			createMaggot(tileIndex);
		});
		
		// Destroy Blood:
		gs.destroyObject(gs.getObj(targetTileIndex));
		
		// Caster:
		gs.createParticlePoof(character.tileIndex, 'GREEN');
		character.popUpText('Summon Maggot', 'White');
		
		// Sound:
		gs.playSound(gs.sounds.cure, character.tileIndex);
	};
	

	// SUMMON_ICE_BOMB:
	// ****************************************************************************************
	this.abilityTypes.SummonIceBomb = {};
	this.abilityTypes.SummonIceBomb.isSpell = true;
	this.abilityTypes.SummonIceBomb.attributes = {damage: {}};
	this.abilityTypes.SummonIceBomb.casterText = 'Summon Ice Bomb';
	this.abilityTypes.SummonIceBomb.objectTypeName = 'IceBomb';
	this.abilityTypes.SummonIceBomb.range = ABILITY_RANGE;
	this.abilityTypes.SummonIceBomb.aoeRange = 1.5; // Used by getTarget.TBAoE to select tiles adjacent to hostiles
	this.abilityTypes.SummonIceBomb.getTarget = this.abilityGetTarget.TBAoE;
	this.abilityTypes.SummonIceBomb.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleTileSmite.call(this, actingChar, targetTileIndex)
			&& !gs.getObj(targetTileIndex)
			&& !gs.isPit(targetTileIndex)
			&& !gs.isUncoveredLiquid(targetTileIndex)
			&& gs.isPassable(targetTileIndex);
	};
	this.abilityTypes.SummonIceBomb.useOn = function (character, targetTileIndex) {
		var object;
		
		// Character:
		character.popUpText(this.casterText, 'White');
		gs.createParticlePoof(character.tileIndex, 'WHITE');
		
		// Bomb:
		gs.createSummonEffect(targetTileIndex, function () {
			object = gs.createObject(targetTileIndex, this.objectTypeName);
			object.damage = this.attributes.damage.value(character);
			object.casterId = character.id;
		}, this);
		
		// Sound:
		gs.playSound(gs.sounds.cure, character.tileIndex);
	};
	
	// SUMMON_BONE_BOMB:
	// ****************************************************************************************
	this.abilityTypes.SummonBoneBomb = Object.create(this.abilityTypes.SummonIceBomb);
	this.abilityTypes.SummonBoneBomb.isSpell = true;
	this.abilityTypes.SummonBoneBomb.casterText = 'Bone Bomb!';
	this.abilityTypes.SummonBoneBomb.objectTypeName = 'BoneBomb';	
	
	// SUMMON_FIRE_CROSS_GLYPH:
	// ****************************************************************************************
	this.abilityTypes.SummonFireCrossGlyph = Object.create(this.abilityTypes.SummonIceBomb);
	this.abilityTypes.SummonFireCrossGlyph.isSpell = true;
	this.abilityTypes.SummonFireCrossGlyph.casterText = 'Fire Cross!';
	this.abilityTypes.SummonFireCrossGlyph.objectTypeName = 'FireCrossGlyph';
	
	// SUMMON_SHOCK_CROSS_GLYPH:
	// ****************************************************************************************
	this.abilityTypes.SummonShockCrossGlyph = Object.create(this.abilityTypes.SummonIceBomb);
	this.abilityTypes.SummonShockCrossGlyph.isSpell = true;
	this.abilityTypes.SummonShockCrossGlyph.casterText = 'Shock Cross!';
	this.abilityTypes.SummonShockCrossGlyph.objectTypeName = 'ShockCrossGlyph';
	
	// SUMMON_BATTLE_SPHERE:
	// ****************************************************************************************
	this.abilityTypes.SummonBattleSphere = {};
	this.abilityTypes.SummonBattleSphere.isSpell = true;
	this.abilityTypes.SummonBattleSphere.attributes = {damage: {}};
	this.abilityTypes.SummonBattleSphere.particleColor = 'PURPLE';
	this.abilityTypes.SummonBattleSphere.npcTypeName = null;
	this.abilityTypes.SummonBattleSphere.range = ABILITY_RANGE;
	this.abilityTypes.SummonBattleSphere.aoeRange = 1.5; // Used by getTarget.TBAoE to select tiles adjacent to hostiles
	this.abilityTypes.SummonBattleSphere.getTarget = this.abilityGetTarget.TBAoE;
	this.abilityTypes.SummonBattleSphere.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleTileSmite.call(this, actingChar, targetTileIndex)
			&& !gs.getChar(targetTileIndex)
			&& !gs.isPit(targetTileIndex)
			&& gs.isPassable(targetTileIndex)
			&& gs.isIndexSafe(targetTileIndex);
	};
	this.abilityTypes.SummonBattleSphere.canUse = function (actingChar) {
		return !actingChar.isConfused;
	};
	this.abilityTypes.SummonBattleSphere.useOn = function (actingChar, targetTileIndex) {
		// Summon:
		gs.createSummonEffect(targetTileIndex, function () {
			var npc, flags = {summonerId: actingChar.id, level: actingChar.level};
			npc = gs.createNPC(targetTileIndex, this.npcTypeName, flags);
			npc.summonDuration = 5;
			npc.waitTime = 100;
			npc.isAgroed = true;
			npc.faction = actingChar.faction;
			actingChar.summonIDList.push(npc.id);actingChar.summonIDList.push(npc.id);
			npc.popUpText('Summoned', 'White');
		}, this);
		
		// Character:
		actingChar.popUpText('Summon ' + gs.capitalSplit(this.npcTypeName), 'White');
		gs.createParticlePoof(actingChar.tileIndex, this.particleColor);
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	this.abilityTypes.SummonBattleSphere.toShortDesc = function (npc) {
		return '*Summon ' + gs.capitalSplit(this.npcTypeName);
	};
	
	// ORB_OF_STORM:
	// ****************************************************************************************
	this.abilityTypes.OrbOfStorm = {};
	this.abilityTypes.OrbOfStorm.isSpell = true;
	this.abilityTypes.OrbOfStorm.attributes = {damage: {}};
	this.abilityTypes.OrbOfStorm.range = ABILITY_RANGE;
	this.abilityTypes.OrbOfStorm.aoeRange = 1.5; // Used by getTarget.TBAoE to select tiles adjacent to hostiles
	this.abilityTypes.OrbOfStorm.getTarget = this.abilityGetTarget.TBAoE;
	this.abilityTypes.OrbOfStorm.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleTileSmite.call(this, actingChar, targetTileIndex)
			&& !gs.getCloud(targetTileIndex)
			&& gs.isPassable(targetTileIndex)
			&& gs.isIndexSafe(targetTileIndex);
	};
	this.abilityTypes.OrbOfStorm.canUse = function (actingChar) {
		return !actingChar.isConfused;
	};
	this.abilityTypes.OrbOfStorm.useOn = function (actingChar, targetTileIndex) {
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
		
		
		gs.createSummonEffect(targetTileIndex, function () {
			var npc, flags = {summonerId: actingChar.id, level: actingChar.level};
			npc = gs.createNPC(targetTileIndex, 'OrbOfStorm', flags);
			npc.summonDuration = 15;
			npc.waitTime = 100;
			npc.isAgroed = true;
			npc.faction = actingChar.faction;
			actingChar.summonIDList.push(npc.id);actingChar.summonIDList.push(npc.id);
			npc.popUpText('Summoned', 'White');
		}, this);
	};
	this.abilityTypes.OrbOfStorm.toShortDesc = function (npc) {
		return '*Summon Orb of Storm';
	};
	
	
	// THROW_BOMB:
	// ****************************************************************************************
	this.abilityTypes.ThrowBomb = {};
	this.abilityTypes.ThrowBomb.attributes = {damage: {}};
	this.abilityTypes.ThrowBomb.range = LOS_DISTANCE;
	this.abilityTypes.ThrowBomb.aoeRange = 1.0; // Used by getTarget.TBAoE to select tiles adjacent to hostiles
	this.abilityTypes.ThrowBomb.getTarget = this.abilityGetTarget.TBAoE;
	this.abilityTypes.ThrowBomb.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleTileRay.call(this, actingChar, targetTileIndex)
			&& !gs.getObj(targetTileIndex, obj => !obj.type.canOverWrite)
			&& !gs.isPit(targetTileIndex)
			&& !gs.isUncoveredLiquid(targetTileIndex)
			&& gs.isPassable(targetTileIndex);
	};
	this.abilityTypes.ThrowBomb.useOn = function (character, targetTileIndex) {
		let damage = this.attributes.damage.value(character);
		
		// Projectile:
		gs.createProjectile(character, targetTileIndex, 'Bomb', damage, this.range, {killer: character});
		
		// Sound:
		gs.playSound(gs.sounds.throw, character.tileIndex);
		
		// Character bounce and face:
		character.body.faceTileIndex(targetTileIndex);
		character.body.bounceTowards(targetTileIndex);
	};
	
	
	
	// NPC_SUMMON_CLOUD:
	// ****************************************************************************************
	this.abilityTypes.NPCSummonCloud = {};
	this.abilityTypes.NPCSummonCloud.isSpell = true;
	this.abilityTypes.NPCSummonCloud.attributes = {damage: {}};
	this.abilityTypes.NPCSummonCloud.range = ABILITY_RANGE;
	this.abilityTypes.NPCSummonCloud.aoeRange = 1.5; // Used by getTarget.TBAoE to select tiles adjacent to hostiles
	this.abilityTypes.NPCSummonCloud.getTarget = this.abilityGetTarget.TBAoE;
	this.abilityTypes.NPCSummonCloud.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.NPCSummonCloud.useOn = function (character, targetTileIndex) {
		var damage, position;
		
		damage = this.attributes.damage.value(character);
		
		// Caster Text :
		character.popUpText(this.niceName + '!', 'White');
		
		// Cloud:
		gs.createCloud(targetTileIndex, this.cloudName, damage, this.duration, {firstTurn: true});
		
		// Particles:
		gs.createParticlePoof(character.tileIndex, this.particleColor);
		gs.createParticlePoof(targetTileIndex, this.particleColor);
		
		// Sound:
		gs.playSound(gs.sounds.fire, targetTileIndex);
	};
	
	// NPC_FLAMING_CLOUD:
	// ****************************************************************************************
	this.abilityTypes.NPCFlamingCloud = Object.create(this.abilityTypes.NPCSummonCloud);
	this.abilityTypes.NPCFlamingCloud.cloudName = 'SpreadingFlamingCloud';
	this.abilityTypes.NPCFlamingCloud.niceName = 'Flaming Cloud';
	this.abilityTypes.NPCFlamingCloud.particleColor = 'RED';
	this.abilityTypes.NPCFlamingCloud.duration = 10;
	
	// NPC_POISON_CLOUD:
	// ****************************************************************************************
	this.abilityTypes.NPCPoisonCloud = Object.create(this.abilityTypes.NPCSummonCloud);
	this.abilityTypes.NPCPoisonCloud.cloudName = 'PoisonGas';
	this.abilityTypes.NPCPoisonCloud.niceName = 'Poison Cloud';
	this.abilityTypes.NPCPoisonCloud.particleColor = 'PURPLE';
	this.abilityTypes.NPCPoisonCloud.duration = 10;
	

	
	// SUMMON_MONSTERS:
	// Summons a group of monsters in a radius around the caster.
	// These monsters are flagged as summoned and have a reference to the summoner.
	// If the summoner is killed then the monsters poof automatically.
	// Note: never save summoned creatures when zoning
	// ********************************************************************************************
	this.abilityTypes.SummonMonsters = {};
	this.abilityTypes.SummonMonsters.isSpell = true;
	this.abilityTypes.SummonMonsters.range = LOS_DISTANCE;
	this.abilityTypes.SummonMonsters.num = 4;
	this.abilityTypes.SummonMonsters.summonDuration = 15;
	this.abilityTypes.SummonMonsters.npcTypeName = null; // Set this to the name of the npcType
	this.abilityTypes.SummonMonsters.requireLoS = true;
	this.abilityTypes.SummonMonsters.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.SummonMonsters.getSummonIndexList = function (actingChar) {
		var indexList, charType;
		
		charType = gs.npcTypes[this.npcTypeName];
		
		// Find adjacent indices in which to summon:
		indexList = gs.getIndexListInRadius(actingChar.tileIndex, 2);
		indexList = indexList.filter(index => gs.isPassable(index));
		indexList = indexList.filter(index => gs.isIndexSafeForCharType(index, charType));
		indexList = indexList.filter(index => gs.isRayPassable(actingChar.tileIndex, index));
		
		return indexList;
	};
	this.abilityTypes.SummonMonsters.canUseOn = function (actingChar, targetTileIndex) {
		var indexList = this.getSummonIndexList(actingChar);
		
		if (actingChar.type.maxSummons && actingChar.summonIDList.length >= actingChar.type.maxSummons) {
			return false;
		}
		
		return indexList.length > 0
			&& (!this.requireLoS
				|| (util.distance(actingChar.tileIndex, targetTileIndex) <= this.range()
					&& gs.isRayClear(actingChar.tileIndex, targetTileIndex)));
	};
	this.abilityTypes.SummonMonsters.canUse = function (actingChar) {
		return !actingChar.isConfused;
	};
	this.abilityTypes.SummonMonsters.useOn = function (actingChar, targetTileIndex) {
		var indexList = this.getSummonIndexList(actingChar),
			level;
		
		// MONSTER_LEVEL:
		if (gs.npcTypes[this.npcTypeName].level) {
			level = gs.npcTypes[this.npcTypeName].level;
		}
		else {
			level = Math.ceil(actingChar.level / 2);
		}
		
		// Sort by nearest to target:
		indexList.sort((a, b) => util.distance(targetTileIndex, a) - util.distance(targetTileIndex, b));
		indexList = indexList.slice(0, this.num);
		
		// Spawn summoned npcs:
		indexList.forEach(function (index) {
			gs.createSummonEffect(index, function () {
				let flags = {
					summonerId: actingChar.id,
					summonDuration: this.summonDuration,
					level: level,
				};
				
				let npc = gs.createNPC(index, this.npcTypeName, flags);
				
				npc.isHidden = false;
				npc.waitTime = 100;
				npc.isAgroed = true;
				npc.faction = actingChar.faction;
				actingChar.summonIDList.push(npc.id);
				npc.popUpText('Summoned', 'White');
			}, this);
		}, this);
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	this.abilityTypes.SummonMonsters.toShortDesc = function (npc) {
		return '*Summon Monsters: ' + gs.capitalSplit(this.npcTypeName);
	};
	
	// SUMMON_TENTACLE_SPITTERS:
	// Used by Toxic-Yendor to summon tentacles when he is over toxic waste
	// ********************************************************************************************
	this.abilityTypes.SummonTentacleSpitters = Object.create(this.abilityTypes.SummonMonsters);
	this.abilityTypes.SummonTentacleSpitters.npcTypeName = 'TentacleSpitter';
	this.abilityTypes.SummonTentacleSpitters.num = 8;
	this.abilityTypes.SummonTentacleSpitters.canUse = function (actingChar) {
		return gs.getTile(actingChar.tileIndex).type === gs.tileTypes.ToxicWaste;
	};
	this.abilityTypes.SummonTentacleSpitters.getSummonIndexList = function (actingChar) {
		var indexList;
		
		// Find adjacent indices in which to summon:
		indexList = gs.getIndexListAdjacent(actingChar.tileIndex);
		indexList = indexList.filter(index => gs.isPassable(index));
		indexList = indexList.filter(index => gs.getTile(index).type === gs.tileTypes.ToxicWaste);
		
		
		return indexList;
	};
	
	// WATCH_PLAYER:
	// ********************************************************************************************
	this.abilityTypes.WatchPlayer = {};
	this.abilityTypes.WatchPlayer.range = LOS_DISTANCE;
	this.abilityTypes.WatchPlayer.canUseOn = this.abilityCanUseOn.SingleCharacterSmite;
	this.abilityTypes.WatchPlayer.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.WatchPlayer.useOn = function (character, targetTileIndex) {
		gs.pc.statusEffects.add('Marked');
	};
	
	// EFREETI_FLAMES:
	// Summons an expanding cloud of flames between the caster and the player.
	// ********************************************************************************************
	this.abilityTypes.EfreetiFlames = {};
	this.abilityTypes.EfreetiFlames.attributes = {damage: {}};
	this.abilityTypes.EfreetiFlames.range = ABILITY_RANGE;
	this.abilityTypes.EfreetiFlames.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.EfreetiFlames.canUseOn = function (character, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, character, targetTileIndex)
			&& this.getIndexList(character, targetTileIndex);
	};
	this.abilityTypes.EfreetiFlames.getIndexList = function (actingChar, targetTileIndex) {
		let list = [];
		
		// A circle around the target character:
		let indexList = gs.getIndexListInRadius(targetTileIndex, 3);
		
		// Near side of the ciricle to the caster:
		indexList = indexList.filter(tileIndex => util.sqDistance(tileIndex, actingChar.tileIndex) <= util.sqDistance(targetTileIndex, actingChar.tileIndex));
		
		// Only passable and no clouds:
		indexList = indexList.filter(tileIndex => gs.isPassable(tileIndex) && !gs.getCloud(tileIndex));
		
		if (indexList.length === 0) {
			return null;
		}
		
		// Choose a random tileIndex1:
		list[0] = util.randElem(indexList);
		
		// Find the furthest tileIndex2:
		list[1] = util.furthestFrom(list[0], indexList);
		
		
		return list;
	};
	this.abilityTypes.EfreetiFlames.useOn = function (actingChar, targetTileIndex) {
		// Attributes:
		let damage = this.attributes.damage.value(actingChar);
		
		// Creating 2 x Flaming Clouds:
		let indexList = this.getIndexList(actingChar, targetTileIndex);
		indexList.forEach(function (tileIndex) {
			gs.createFire(tileIndex, damage, {killer: actingChar});
			
			let cloud = gs.createCloud(tileIndex, 'FlamingCloud', damage, 6, {firstTurn: true, maxSpread: 1});
		}, this);
		
		// Sound:
		gs.playSound(gs.sounds.fire, actingChar.tileIndex);
	};
	
	// FIELD_OF_FORCE:
	// ********************************************************************************************
	this.abilityTypes.FieldOfForce = Object.create(this.abilityTypes.EfreetiFlames);
	this.abilityTypes.FieldOfForce.attributes = {};
	this.abilityTypes.FieldOfForce.useOn = function (actingChar, targetTileIndex) {
		// Creating 2 x Wall of Force:
		let indexList = this.getIndexList(actingChar, targetTileIndex);
		indexList.forEach(function (tileIndex) {
			// Wall of Force:
			let cloud = gs.createCloud(tileIndex, 'WallOfForce', 0, 10);
			
			// Light:
			gs.createManaEffect(tileIndex);
		}, this);
		
		// Caster Effects:
		gs.createManaEffect(actingChar.tileIndex);
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// SURROUND_BLINK:
	// The NPC blinks to a minimally populated quadrent around the player i.e. surrounds him
	// ********************************************************************************************
	this.abilityTypes.SurroundBlink = {};
	this.abilityTypes.SurroundBlink.dontShowInDesc = true;
	this.abilityTypes.SurroundBlink.range = ABILITY_RANGE;
	this.abilityTypes.SurroundBlink.blinkDistanceToTarget = LOS_DISTANCE;
	this.abilityTypes.SurroundBlink.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.SurroundBlink.canUseOn = function (actingChar, targetTileIndex) {
		return this.getTileIndex(actingChar, targetTileIndex)
			&& gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex);
	};
	this.abilityTypes.SurroundBlink.getTileIndex = function (actingChar, targetTileIndex) {
		// Flooding from the target to make sure the quadrents are connected:
		let floodList = gs.getIndexListInFlood(targetTileIndex, tileIndex => gs.isStaticPassable(tileIndex), this.blinkDistanceToTarget);
		
		// Quadrents only include tiles that are visible to the target:
		floodList = floodList.filter(tileIndex => gs.isRayClear(tileIndex, targetTileIndex));
		
		// Divide into quadrents:
		let quadrents = [[], [], [], []];
		quadrents[0].allyCount = 0;
		quadrents[1].allyCount = 0;
		quadrents[2].allyCount = 0;
		quadrents[3].allyCount = 0;
		
		let addToQuadrent = function (tileIndex, quadrent) {
			if (gs.isPassable(tileIndex)) {
				quadrent.push(tileIndex);
			}
			
			if (gs.getChar(tileIndex) && gs.getChar(tileIndex).faction === actingChar.faction) {
				quadrent.allyCount += 1;
			}
		};
		
		floodList.forEach(function (tileIndex) {
			// Quadrent 0: left/up
			if (tileIndex.x <= targetTileIndex.x && tileIndex.y <= targetTileIndex.y) {
				addToQuadrent(tileIndex, quadrents[0]);
			}
			
			// Quadrent 1: right/up
			if (tileIndex.x > targetTileIndex.x && tileIndex.y <= targetTileIndex.y) {
				addToQuadrent(tileIndex, quadrents[1]);
			}
			
			// Quadrent 2: left/down
			if (tileIndex.x <= targetTileIndex.x && tileIndex.y > targetTileIndex.y) {
				addToQuadrent(tileIndex, quadrents[2]);
			}
			
			// Quadrent 3: right/down
			if (tileIndex.x > targetTileIndex.x && tileIndex.y > targetTileIndex.y) {
				addToQuadrent(tileIndex, quadrents[3]);
			}
		});
		
		// Only consider quadrents w/ at least 1 valid destination:
		quadrents = quadrents.filter(quadrent => quadrent.length > 0);
		
		if (quadrents.length === 0) {
			return null;
		}
		
		// Find smallest:
		let smallestCount = quadrents.sort((a, b) => a.allyCount - b.allyCount)[0].allyCount;
		
		// Filter by smallest:
		quadrents = quadrents.filter(quadrent => quadrent.allyCount === smallestCount);
		
		// Select random quadrent:
		let quadrent = util.randElem(quadrents);
		
		// Select random tileIndex:
		let tileIndex = util.randElem(quadrent);
		
		return tileIndex;
	};
	this.abilityTypes.SurroundBlink.useOn = function (actingChar, targetTileIndex) {
		let tileIndex = this.getTileIndex(actingChar, targetTileIndex);
		
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
		gs.createPopUpTextAtTileIndex(actingChar.tileIndex, 'Blink');
		gs.playSound(gs.sounds.teleport, actingChar.tileIndex);

		// Teleport:
		actingChar.body.snapToTileIndex(tileIndex);

		// Post-Teleport:
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
		actingChar.popUpText('Blink');
		actingChar.waitTime = 100;		
	};
	
	// MELEE_SURROUND_BLINK:
	// The NPC blinks to a minimally populated quadrent around the player i.e. surrounds him
	// Will only use if out of melee range.
	this.abilityTypes.MeleeSurroundBlink = Object.create(this.abilityTypes.SurroundBlink);
	this.abilityTypes.MeleeSurroundBlink.blinkDistanceToTarget = 2;
	this.abilityTypes.MeleeSurroundBlink.shouldUseOn = function (actingChar, targetTileIndex) {
		return util.distance(actingChar.tileIndex, targetTileIndex) > 1.5;
	};
	
	// ESCAPE_BLINK:
	// The NPC blinks away from the player to the most distant tile possible
	// ********************************************************************************************
	this.abilityTypes.EscapeBlink = {};
	this.abilityTypes.EscapeBlink.dontShowInDesc = true;
	this.abilityTypes.EscapeBlink.maxDistance = 20;
	this.abilityTypes.EscapeBlink.range = 3;
	this.abilityTypes.EscapeBlink.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.EscapeBlink.canUseOn = this.abilityCanUseOn.SingleCharacterSmite;
	this.abilityTypes.EscapeBlink.useOn = function (actingChar, targetTileIndex) {		
		let indexList = gs.getIndexListInFlood(actingChar.tileIndex, tileIndex => gs.isStaticPassable(tileIndex), this.maxDistance, true);
		
		
		indexList = indexList.filter(index => gs.isPassable(index));
		
		let tileIndex = util.furthestFrom(targetTileIndex, indexList);
		
		
		
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
		gs.createPopUpTextAtTileIndex(actingChar.tileIndex, 'Blink');
		gs.playSound(gs.sounds.teleport, actingChar.tileIndex);

		// Teleport:
		actingChar.body.snapToTileIndex(tileIndex);

		// Post-Teleport:
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
		actingChar.popUpText('Blink');
		actingChar.waitTime = 100;
			
	};
	
	
	// WALL_OF_FIRE:
	// The NPC summons a 1x3 flaming clouds behind the player
	// ********************************************************************************************
	this.abilityTypes.NPCWallOfFire = {};
	this.abilityTypes.NPCWallOfFire.niceName = 'Wall of Fire';
	this.abilityTypes.NPCWallOfFire.isSpell = true;
	this.abilityTypes.NPCWallOfFire.particleColor = 'RED';
	this.abilityTypes.NPCWallOfFire.cloudTypeName = 'FlamingCloud';
	this.abilityTypes.NPCWallOfFire.attributes = {damage: {}};
	this.abilityTypes.NPCWallOfFire.range = ABILITY_RANGE;
	this.abilityTypes.NPCWallOfFire.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.NPCWallOfFire.getIndexList = function (character, targetTileIndex) {
		let deltaX = character.tileIndex.x - targetTileIndex.x,
			deltaY = character.tileIndex.y - targetTileIndex.y,
			indexList,
			x = targetTileIndex.x,
			y = targetTileIndex.y;
		
		// Horizontal:
		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			// Left:
			if (deltaX > 0) {
				indexList = [
					{x: x - 1, y: y, id: 0}, 
					{x: x - 1, y: y + 1, id: 1},
					{x: x - 1, y: y - 1, id: 1},
					{x: x - 1, y: y + 2, id: 2},
					{x: x - 1, y: y - 2, id: 2},
				];
			}
			// Right:
			else {
				indexList = [
					{x: x + 1, y: y, id: 0}, 
					{x: x + 1, y: y + 1, id: 1},
					{x: x + 1, y: y - 1, id: 1},
					{x: x + 1, y: y + 2, id: 2},
					{x: x + 1, y: y - 2, id: 2},
				];
			}
		}
		// Vertical:
		else {
			// Above:
			if (deltaY > 0) {
				indexList = [
					{x: x, y: y - 1, id: 0}, 
					{x: x + 1, y: y - 1, id: 1},
					{x: x - 1, y: y - 1, id: 1},
					{x: x + 2, y: y - 1, id: 2},
					{x: x - 2, y: y - 1, id: 2},
				];
			}
			// Below:
			else {
				indexList = [
					{x: x, y: y + 1, id: 0}, 
					{x: x + 1, y: y + 1, id: 1},
					{x: x - 1, y: y + 1, id: 1},
					{x: x + 2, y: y + 1, id: 2},
					{x: x - 2, y: y + 1, id: 2},
				];
			}
		}
		
		indexList = indexList.filter(index => this.isValidTileIndex.call(gs, index));
		indexList = indexList.filter(index => this.isValidRay.call(gs, targetTileIndex, index));
		return indexList;
	};
	this.abilityTypes.NPCWallOfFire.isValidTileIndex = gs.isStaticPassable;
	this.abilityTypes.NPCWallOfFire.isValidRay = gs.isRayStaticPassable;
	this.abilityTypes.NPCWallOfFire.canUseOn = function (character, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, character, targetTileIndex)
			&& this.getIndexList(character, targetTileIndex).length > 0;
	};
	this.abilityTypes.NPCWallOfFire.useOn = function (character, targetTileIndex) {
		var indexList, damage;
		
		// Attributes:
		damage = this.attributes.damage.value(character);
		
		// Caster:
		character.popUpText(gs.capitalSplit(this.name), 'White');
		gs.createParticlePoof(character.tileIndex, this.particleColor);
		
		// Targets:
		indexList = this.getIndexList(character, targetTileIndex);
		
		let cloudTypeName = this.cloudTypeName;
		let particleColor = this.particleColor;
		
		// ID = 0:
		if (indexList.find(index => index.id === 0)) {
			let event = {timer: 0};
			event.updateFrame = function () {
				if (this.timer === 0) {
					let cloud = gs.createCloud(indexList[0], cloudTypeName, damage, 5);
					character.cloudIDList.push(cloud.id);
					
					// Particles:
					gs.createParticlePoof(indexList[0], particleColor);
					
					// Sound:
					gs.playSound(gs.sounds.cure, character.tileIndex);
				}
				
				this.timer += 1;
			};
			
			event.isComplete = function () {
				return this.timer > 2;	
			};
			
			// Push event:
			character.eventQueue.addEvent(event);
		}
		
		// ID = 1:
		if (indexList.find(index => index.id === 1)) {
			let event = {timer: 0};
			event.updateFrame = function () {
				if (this.timer === 0) {
					indexList.forEach(function (index) {
						if (index.id === 1) {
							let cloud = gs.createCloud(index, cloudTypeName, damage, 5);
							character.cloudIDList.push(cloud.id);

							// Particles:
							gs.createParticlePoof(index, particleColor);	
						}
								  
					}, this);
					
					// Sound:
					gs.playSound(gs.sounds.cure, character.tileIndex);
				}
				
				this.timer += 1;
			};
			
			event.isComplete = function () {
				return this.timer > 2;	
			};
			
			// Push event:
			character.eventQueue.addEvent(event);
		}
		
		// ID = 2:
		if (indexList.find(index => index.id === 2)) {
			let event = {timer: 0};
			event.updateFrame = function () {
				if (this.timer === 0) {
					indexList.forEach(function (index) {
						if (index.id === 2) {
							let cloud = gs.createCloud(index, cloudTypeName, damage, 5);
							character.cloudIDList.push(cloud.id);

							// Particles:
							gs.createParticlePoof(index, particleColor);	
						}
								  
					}, this);
					
					// Sound:
					gs.playSound(gs.sounds.cure, character.tileIndex);
				}
				
				this.timer += 1;
			};
			
			event.isComplete = function () {
				return this.timer > 2;	
			};
			
			// Push event:
			character.eventQueue.addEvent(event);
		}
		
		// Bounce and Face
		character.body.faceTileIndex(targetTileIndex);
		character.body.bounceTowards(targetTileIndex);
	};
	
	// WALL_OF_POISON_GAS:
	// ********************************************************************************************
	this.abilityTypes.WallOfPoisonGas = Object.create(this.abilityTypes.NPCWallOfFire);
	this.abilityTypes.WallOfPoisonGas.isSpell = true;
	this.abilityTypes.WallOfPoisonGas.cloudTypeName = 'PoisonCloud';
	this.abilityTypes.WallOfPoisonGas.particleColor = 'PURPLE';
	
	// NPC_FREEZING_CLOUD:
	// ********************************************************************************************
	this.abilityTypes.NPCFreezingCloud = Object.create(this.abilityTypes.NPCWallOfFire);
	this.abilityTypes.NPCFreezingCloud.niceName = 'Freezing Cloud';
	this.abilityTypes.NPCFreezingCloud.isSpell = true;
	this.abilityTypes.NPCFreezingCloud.cloudTypeName = 'FreezingCloud';
	this.abilityTypes.NPCFreezingCloud.particleColor = 'WHITE';
	
	// WALL_OF_FORCE:
	// ********************************************************************************************
	this.abilityTypes.WallOfForce = Object.create(this.abilityTypes.NPCWallOfFire);
	this.abilityTypes.WallOfForce.niceName = 'Wall of Force';
	this.abilityTypes.WallOfForce.isSpell = true;
	this.abilityTypes.WallOfForce.cloudTypeName = 'WallOfForce';
	this.abilityTypes.WallOfForce.particleColor = 'PURPLE';
	this.abilityTypes.WallOfForce.isValidTileIndex = gs.isPassable;
	this.abilityTypes.WallOfForce.isValidRay = gs.isRayPassable;
	
	// SUMMON_LIGHTNING_ROD:
	// ********************************************************************************************
	this.abilityTypes.SummonLightningRod = {};
	this.abilityTypes.SummonLightningRod.isSpell = true;
	this.abilityTypes.SummonLightningRod.particleColor = 'WHITE';
	this.abilityTypes.SummonLightningRod.range = ABILITY_RANGE;
	this.abilityTypes.SummonLightningRod.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.SummonLightningRod.getTileIndex = function (actingChar, targetTileIndex) {
		var indexList;
		
		indexList = gs.getIndexListAdjacent(targetTileIndex);
		indexList = indexList.filter(index => gs.isPassable(index) && !gs.getObj(index) && !gs.isPit(index));
		indexList = indexList.filter(index => this.isTargetInPath(actingChar.tileIndex, targetTileIndex, index));
		
		return indexList.length > 0 ? util.getFurthestIndex(actingChar.tileIndex, indexList) : null;
	};
	this.abilityTypes.SummonLightningRod.isTargetInPath = function (charTileIndex, targetTileIndex, rodIndex) {
		var indexList = gs.getIndexInBRay(charTileIndex, rodIndex);
		
		if (!indexList.find(index => util.vectorEqual(index, targetTileIndex))) {
			return false;
		}
		else {
			return true;
		}
	};
	this.abilityTypes.SummonLightningRod.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex)
			&& this.getTileIndex(actingChar, targetTileIndex);
	};
	this.abilityTypes.SummonLightningRod.useOn = function (actingChar, targetTileIndex) {
		var tileIndex, obj;
		
		tileIndex = this.getTileIndex(actingChar, targetTileIndex);
		obj = gs.createObject(tileIndex, 'LightningRod');
		actingChar.lightningRodTileIndex = {x: obj.tileIndex.x, y: obj.tileIndex.y};
		gs.createParticlePoof(obj.tileIndex, 'WHITE');
		gs.createPopUpTextAtTileIndex(obj.tileIndex, 'Lightning Rod');
		
		actingChar.popUpText('Summon Lightning Rod');
		gs.createParticlePoof(actingChar.tileIndex, 'WHITE');
		
	};
	
	// USE_LIGHTNING_ROD:
	// ********************************************************************************************
	this.abilityTypes.UseLightningRod = {};
	this.abilityTypes.UseLightningRod.isSpell = true;
	this.abilityTypes.UseLightningRod.particleColor = 'WHITE';
	this.abilityTypes.UseLightningRod.attributes = {damage: {}};
	this.abilityTypes.UseLightningRod.range = ABILITY_RANGE;
	this.abilityTypes.UseLightningRod.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.UseLightningRod.canUseOn = function (actingChar, targetTileIndex) {
		var indexList;
		
		if (!actingChar.lightningRodTileIndex) {
			return false;
		}
		
		indexList = gs.getIndexInBRay(actingChar.tileIndex, actingChar.lightningRodTileIndex);
		
		if (!indexList.find(index => util.vectorEqual(index, targetTileIndex))) {
			return false;
		}
		
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex);
	};
	this.abilityTypes.UseLightningRod.useOn = function (actingChar, targetTileIndex) {
		var indexList, damage;
		
		targetTileIndex = actingChar.lightningRodTileIndex;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		indexList = gs.getIndexInBRay(actingChar.tileIndex, targetTileIndex);
		
		indexList.forEach(function (tileIndex) {
			gs.createShock(tileIndex, damage, {killer: actingChar});
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
	
	// HEAL:
	// ********************************************************************************************
	this.abilityTypes.Heal = {};
	this.abilityTypes.Heal.isSpell = true;
	this.abilityTypes.Heal.range = LOS_DISTANCE;
	this.abilityTypes.Heal.healPercent = 0.25;
	this.abilityTypes.Heal.casterText = 'Casting Heal';
	this.abilityTypes.Heal.targetText = 'Healed!';
	this.abilityTypes.Heal.getTarget = this.abilityGetTarget.SingleAlly;
	this.abilityTypes.Heal.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex)
			&& gs.getChar(targetTileIndex).currentHp < gs.getChar(targetTileIndex).maxHp
			&& (!gs.getChar(targetTileIndex).type.noRegen || gs.getChar(targetTileIndex).type.isRepairable);
	};
	this.abilityTypes.Heal.useOn = function (actingChar, targetTileIndex) {
		var npc = gs.getChar(targetTileIndex);

		// Caster:
		actingChar.popUpText(this.casterText, 'White');
		gs.createParticlePoof(actingChar.tileIndex, 'GREEN');
		
		
		// Target Char:
		npc.healHp(Math.round(npc.maxHp * this.healPercent));
		npc.popUpText(this.targetText, 'White');
		gs.createHealingEffect(npc.tileIndex);
		gs.playSound(gs.sounds.cure, npc.tileIndex);
		
	};
	
	// HASTE:
	// ********************************************************************************************
	this.abilityTypes.Haste = {};
	this.abilityTypes.Haste.isSpell = true;
	this.abilityTypes.Haste.range = LOS_DISTANCE;
	this.abilityTypes.Haste.getTarget = this.abilityGetTarget.SingleAlly;
	this.abilityTypes.Haste.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex)
			&& !gs.getChar(targetTileIndex).statusEffects.has('Haste')
			&& !gs.getChar(targetTileIndex).type.isImmobile;
	};
	this.abilityTypes.Haste.canUse = function (actingChar) {
		if (actingChar.faction === FACTION.HOSTILE) {
			return true;
		}
		// Player allies should only cast Haste on the player when there are hostiles agroed
		else {
			return gs.agroedHostileList().length > 0;
		}
	};
	this.abilityTypes.Haste.useOn = function (actingChar, targetTileIndex) {
		var npc = gs.getChar(targetTileIndex);
		
		npc.statusEffects.add('Haste');
		
		// Pop Up Text:
		actingChar.popUpText('Casting Haste', 'White');
		
		// Particles:
		gs.createYellowMagicEffect(npc.tileIndex);
		
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
		
		gs.playSound(gs.sounds.cure);
	};
	
	// SMITE:
	// ********************************************************************************************
	this.abilityTypes.Smite = {};
	this.abilityTypes.Smite.isSpell = true;
	this.abilityTypes.Smite.attributes = {damage: {}};
	this.abilityTypes.Smite.canUseOn = this.abilityCanUseOn.SingleCharacterSmite;
	this.abilityTypes.Smite.range = ABILITY_RANGE;
	this.abilityTypes.Smite.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.Smite.useOn = function (actingChar, targetTileIndex) {
		var damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		// Status Effect:
		actingChar.statusEffects.add('CastingSmite', {damage: damage, tileIndex: {x: targetTileIndex.x, y: targetTileIndex.y}});
		
		// Set Facing:
		actingChar.body.faceTileIndex(targetTileIndex);
	};
	
	
	
	// SLOW_CHARGE:
	// ********************************************************************************************
	this.abilityTypes.SlowCharge = {};
	this.abilityTypes.SlowCharge.niceName = 'Charge';
	this.abilityTypes.SlowCharge.attributes = {damage: {}};
	this.abilityTypes.SlowCharge.range = LOS_DISTANCE;
	this.abilityTypes.SlowCharge.canUseOn = function (actingChar, targetTileIndex) {		
		let isPit = gs.getIndexInRay(actingChar.tileIndex, targetTileIndex).find(index => gs.isPit(index));
		let isImpassable = gs.getIndexInRay(actingChar.tileIndex, targetTileIndex).find(index => !gs.isPassable(index) && !util.vectorEqual(index, targetTileIndex));
		let delta = util.get8WayVector(actingChar.tileIndex, targetTileIndex);
		
		return gs.abilityCanUseOn.SingleCharacterStraightRay.call(this, actingChar, targetTileIndex)
			&& gs.isPassable(actingChar.tileIndex.x + delta.x, actingChar.tileIndex.y + delta.y)
			&& !isPit
			&& !isImpassable;
	};
		
		
		
	this.abilityTypes.SlowCharge.shouldUseOn = function (actingChar, targetTileIndex) {
		return util.distance(actingChar.tileIndex, targetTileIndex) >= 4
			&& !actingChar.isImmobile;
	};
	this.abilityTypes.SlowCharge.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.SlowCharge.useOn = function (actingChar, targetTileIndex) {
		var delta, damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		// Move Delta:
		delta = util.get8WayVector(actingChar.tileIndex, targetTileIndex);
		actingChar.moveDelta = {x: delta.x, y: delta.y};
		
		actingChar.smokeSize = 'Small';
		
		// Status Effect:
		// Note that we record the start and target tileIndex so we can stop the charge if we get past it:
		let flags = {
			damage: damage,
			startTileIndex: {x: actingChar.tileIndex.x, y: actingChar.tileIndex.y},
			targetTileIndex: {x: targetTileIndex.x, y: targetTileIndex.y}
		};
		actingChar.statusEffects.add('SlowCharge', flags);
		
		// First step:
		gs.createCloud(actingChar.tileIndex, 'Smoke', 0, 2);
		actingChar.body.moveToTileIndex({x: actingChar.tileIndex.x + delta.x, y: actingChar.tileIndex.y + delta.y});
		
		// Set Facing:
		actingChar.body.faceTileIndex(targetTileIndex);
	};
	
	// ORB_OF_FIRE:
	// ********************************************************************************************
	this.abilityTypes.OrbOfFire = {};
	this.abilityTypes.OrbOfFire.npcTypeName = 'OrbOfFire';
	this.abilityTypes.OrbOfFire.particleColor = 'RED';
	this.abilityTypes.OrbOfFire.attributes = {damage: {}};
	this.abilityTypes.OrbOfFire.range = LOS_DISTANCE;
	this.abilityTypes.OrbOfFire.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.OrbOfFire.canUseOn = function (actingChar, targetTileIndex) {
		var delta = util.get8WayVector(actingChar.tileIndex, targetTileIndex);
		
		
		return gs.isPassable(actingChar.tileIndex.x + delta.x, actingChar.tileIndex.y + delta.y)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range()
			&& util.isStraight(actingChar.tileIndex, targetTileIndex)
			&& gs.isRayPassable(actingChar.tileIndex, targetTileIndex);
	};
	this.abilityTypes.OrbOfFire.useOn = function (actingChar, targetTileIndex) {
		var delta, proj, damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		// Direction:
		delta = util.get8WayVector(actingChar.tileIndex, targetTileIndex);
		
		// Projectile:
		proj = gs.createNPC({x: actingChar.tileIndex.x + delta.x, y: actingChar.tileIndex.y + delta.y}, this.npcTypeName, {burstDamage: damage});
		proj.moveDelta = {x: delta.x, y: delta.y};
		proj.waitTime = 100;
		proj.isAgroed = true;
		proj.smokeSize = 'Small';
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
		
		// Caster:
		actingChar.popUpText(this.niceName, 'White');
		gs.createParticlePoof(actingChar.tileIndex, this.particleColor);
		
		// Character bounce and face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
	};
	
	// SUMMON_TORNADO:
	// ********************************************************************************************
	this.abilityTypes.SummonTornado = {};
	this.abilityTypes.SummonTornado.attributes = {damage: {}};
	this.abilityTypes.SummonTornado.range = ABILITY_RANGE;
	this.abilityTypes.SummonTornado.getTarget = function (actingChar) {
		// All index in range:
		let charIndexList = gs.getIndexListInRadius(actingChar.tileIndex, this.range(actingChar));
		
		// Only hostile characters:
		charIndexList = charIndexList.filter(index => gs.getChar(index) && actingChar.isHostileToMe(gs.getChar(index)));
		
		// Only hostile characters I can see:
		charIndexList = charIndexList.filter(index => gs.isRayClear(actingChar.tileIndex, index));
		
		// Index list in a radius around each valid target:
		let indexList = [];
		charIndexList.forEach(function (charTileIndex) {
			// All index in radius:
			let list = gs.getIndexListInRadius(charTileIndex, 3);
			
			// Minimum distance (never adjacent):
			list = list.filter(index => util.distance(charTileIndex, index) > 1.5);
			
			// Must be clear to character:
			list = list.filter(index => gs.isRayStaticPassable(charTileIndex, index));
			
			// Must be able to create a char there:
			list = list.filter(index => gs.isPassable(index));
			
			// The caster must be able to see the tile:
			list = list.filter(index => gs.isRayClear(actingChar.tileIndex, index));
			
			// Must be at least 5 tiles away from the nearest tornado:
			let tornadoList = gs.characterList.filter(char => char.type.name === 'Tornado');
			list = list.filter(function (index) {
				let isClear = true;
				
				tornadoList.forEach(function (tornado) {
					if (util.distance(index, tornado.tileIndex) < 3) {
						isClear = false;
					}
				}, this);
				
				return isClear;
			}, this);
			
			indexList = indexList.concat(list);
		}, this);
		
		return indexList.length > 0 ? util.randElem(indexList) : null;
	};
	this.abilityTypes.SummonTornado.canUseOn = gs.abilityCanUseOn.SingleCharacterSmite;
	this.abilityTypes.SummonTornado.canUse = function (actingChar) {
		// Max 2 tornados at a time:
		return gs.characterList.filter(char => char.type.name === 'Tornado' && char.isAlive).length < 2;
	};
	this.abilityTypes.SummonTornado.useOn = function (actingChar, targetTileIndex) {
		// Attributes:
		let damage = this.attributes.damage.value(actingChar);
		
		// Summon Tornado:
		gs.createSummonEffect(targetTileIndex, function () {
			let npc = gs.createNPC(targetTileIndex, 'Tornado');
			npc.burstDamage = damage;
			npc.waitTime = 100;
			npc.isAgroed = true;
			npc.summonDuration = 5;
			npc.summonerId = actingChar.id;
			
			// Push to summoners list:
			actingChar.summonIDList.push(npc.id);
		}, this);
		
		// Caster Animation:
		actingChar.popUpText('Summon Tornado', 'White');
		gs.createParticlePoof(actingChar.tileIndex, 'WHITE');
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	
	// TORNADO_SUCK:
	// ********************************************************************************************
	this.abilityTypes.TornadoSuck = {};
	this.abilityTypes.TornadoSuck.getTarget = this.abilityGetTarget.Self;
	this.abilityTypes.TornadoSuck.canUseOn = this.abilityCanUseOn.SingleCharacterSmite;
	this.abilityTypes.TornadoSuck.useOn = function (actingChar) {
		// Find all nearby characters:
		let indexList = gs.getIndexListInRadius(actingChar.tileIndex, 4);
		
		//indexList = indexList.filter(index => gs.isRayClear(index, actingChar.tileIndex));
		indexList = indexList.filter(index => gs.isRayStaticPassable(index, actingChar.tileIndex));
		
		indexList = indexList.filter(index => gs.getChar(index) && !gs.getChar(index).isImmobile);
		indexList = indexList.filter(index => gs.getChar(index) !== actingChar); // Don't suck self
		indexList = indexList.filter(index => !util.inArray(gs.getChar(index).type.name, ['TheWizardYendorStorm', 'StormVortex', 'DelasTheDjinniLord', 'StormElemental', 'StormImp'])); // Don't suck storm stuff
	
		
		// Apply sucking knockback to all chars:
		indexList.forEach(function (tileIndex) {
			let char = gs.getChar(tileIndex);
			let delta = util.get8WayVector(tileIndex, actingChar.tileIndex);
			
			// Its possible the character has died ex. a summoner died and poof his summons
			if (!char) {
				return;
			}
			
			// Suck when far away:
			if (util.distance(char.tileIndex, actingChar.tileIndex) > 1.5) {
				let toTileIndex = {x: char.tileIndex.x + delta.x, y: char.tileIndex.y + delta.y};
				if (gs.isPassable(toTileIndex)) {
					// Knock back:
					char.body.isKnockBack = true;
					char.movementType = MOVEMENT_TYPE.FAST;
					char.body.moveToTileIndex(toTileIndex);
				}
			}
			// Damage when close:
			else {
				char.takeDamage(actingChar.burstDamage, DAMAGE_TYPE.PHYSICAL);
				char.body.bounceTowards(actingChar.tileIndex);
			}
		}, this);
		
		// Reverse facind:
		if (actingChar.body.facing === 'LEFT') {
			actingChar.body.facing = 'RIGHT';
		}
		else {
			actingChar.body.facing = 'LEFT';
		}
		
		// Bounce:
		actingChar.body.bounceTowards(util.randElem(gs.getIndexListAdjacent(actingChar.tileIndex)));
		
		// Popup Text:
		actingChar.popUpText('Woosh!');
					
		// Camera Effects:
		//game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 59);
		
		// Anim:
		let pos = util.toPosition(actingChar.tileIndex);
		gs.createAnimEffect(pos, 'TornadoSuck');
		gs.createLightCircle(pos, '#cbd7d8', 120, 30, '88');
		
		
		// Sound:
		gs.playSound(gs.sounds.bolt, actingChar.tileIndex);
		
		// Stop player movement on each suck:
		gs.hasNPCActed = true;
	};
	
	// SLIDE:
	// ********************************************************************************************
	this.abilityTypes.Slide = {};
	this.abilityTypes.Slide.range = LOS_DISTANCE;
	this.abilityTypes.Slide.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.Slide.canUseOn = function (actingChar, targetTileIndex) {
		var toTileIndex = actingChar.body.getKnockBackIndex(util.normal(targetTileIndex, actingChar.tileIndex), 4);
		
		return util.distance(actingChar.tileIndex, targetTileIndex) <= 2
			&& gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex)
			&& util.distance(actingChar.tileIndex, toTileIndex) > 1.5;
	};
	this.abilityTypes.Slide.useOn = function (actingChar, targetTileIndex) {
		var toTileIndex = actingChar.body.getKnockBackIndex(util.normal(targetTileIndex, actingChar.tileIndex), 4);
		
		// Sound:
		gs.playSound(gs.sounds.spell);
		
		// Popup text:
		actingChar.popUpText('Slide!', 'White');
		
		// Move to:
		actingChar.body.moveToTileIndex(toTileIndex);
		
		// Set slide frame:
		actingChar.sprite.frame = actingChar.type.slideFrame;
	};
	
	// SEAL_DOORS:
	// ********************************************************************************************
	this.abilityTypes.SealDoors = {};
	this.abilityTypes.SealDoors.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.SealDoors.range = ABILITY_RANGE;
	this.abilityTypes.SealDoors.getTargetList = function (actingChar) {
		var indexList;
		
		indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.range());
		indexList = indexList.filter(index => gs.getObj(index, obj => obj.type.isSimpleDoor() || obj.isZoneLine()));
		indexList = indexList.filter(index => gs.getObj(index, obj => obj.isZoneLine()) || !gs.getChar(index));
		indexList = indexList.filter(index => gs.isRayClear(actingChar.tileIndex, index));
		
		return indexList;
	};
	this.abilityTypes.SealDoors.canUseOn = function (actingChar, targetTileIndex) {
		return this.getTargetList(actingChar).length > 0;
	};
	
	this.abilityTypes.SealDoors.useOn = function (actingChar, targetTileIndex) {
		var indexList = this.getTargetList(actingChar);
		
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
		
		actingChar.statusEffects.add('SealDoors', {indexList: indexList});
		
		indexList.forEach(function (tileIndex) {	
			gs.createParticlePoof(tileIndex, 'PURPLE');
			gs.createPopUpTextAtTileIndex(tileIndex, 'Sealed', 'White');
		}, this);
	};
	
	// TONGUE_PULL:
	// ********************************************************************************************
	this.abilityTypes.TonguePull = {};
	this.abilityTypes.TonguePull.range = 5.5;
	this.abilityTypes.TonguePull.tongueSpeed = 10;
	this.abilityTypes.TonguePull.tongueFrame = 1745;
	this.abilityTypes.TonguePull.minDistance = 1.5;
	this.abilityTypes.TonguePull.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.TonguePull.canUseOn = function (actingChar, targetTileIndex) {
		let pullToIndex = this.getPullToIndex(actingChar, targetTileIndex);
		
		/*
		if (util.vectorEqual(pullToIndex, targetTileIndex)) {
			return gs.abilityCanUseOn.SingleCharacterRay.call(this, actingChar, targetTileIndex);
		}
		*/
		
		return gs.abilityCanUseOn.SingleCharacterRay.call(this, actingChar, targetTileIndex)
			&& !gs.getChar(targetTileIndex).isImmobile
			&& util.distance(actingChar.tileIndex, targetTileIndex) > this.minDistance
			&& gs.isRayPassable(pullToIndex, targetTileIndex)
			&& gs.isPassable(pullToIndex);
	};
	this.abilityTypes.TonguePull.getPullToIndex = function (actingChar, targetTileIndex) {
		
		
		return gs.getIndexInRay(actingChar.tileIndex, targetTileIndex)[0];
	};
	this.abilityTypes.TonguePull.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.TonguePull.useOn = function (actingChar, targetTileIndex) {
		var event, pullToTileIndex, self = this;
		
		gs.playSound(gs.sounds.spell);
		actingChar.popUpText(this.niceName + '!');
		
		// Get the tileIndex that is between the actor and target:
		pullToTileIndex = this.getPullToIndex(actingChar, targetTileIndex);
			
		// Create event:
		event = {
			targetTileIndex: {x: targetTileIndex.x, y: targetTileIndex.y},
			startPos: util.toPosition(actingChar.tileIndex),
			endPos: util.toPosition(targetTileIndex),
			curPos: util.toPosition(actingChar.tileIndex),
			spriteList: [],
			state: 'EXTEND',
			targetChar: gs.getChar(targetTileIndex)
		};
		
		// Create enough sprites for total distance:
		for (let i = 0; i < util.distance(event.startPos, event.endPos) / 20; i += 1) {
			let sprite = gs.createSprite(0, 0, 'Tileset', gs.projectileSpritesGroup);
			sprite.anchor.setTo(0.5, 0.5);
			sprite.frame = this.tongueFrame;
			event.spriteList.push(sprite);
		}
		
		event.updateFrame = function () {
			var normal;
			
			if (this.state === 'EXTEND') {
				// Position of end of tongue:
				normal = util.normal(this.startPos, this.endPos);
				this.curPos.x += normal.x * self.tongueSpeed;
				this.curPos.y += normal.y * self.tongueSpeed;

				// Tongue hitting target:
				if (util.distance(this.curPos, this.endPos) <= self.tongueSpeed + 2) {
					this.state = 'RETRACT';
					this.curPos.x = this.endPos.x;
					this.curPos.y = this.endPos.y;
					
					if (gs.getChar(targetTileIndex)) {
						// Additional onHitTarget func:
						if (self.onHitTarget) {
							self.onHitTarget(actingChar, gs.getChar(targetTileIndex));
						}
					}
					
					// Must check for char again in case he is dead:
					if (gs.getChar(targetTileIndex)) {
						gs.getChar(targetTileIndex).body.isKnockBack = true;
						gs.getChar(targetTileIndex).isMultiMoving = true;
						gs.getChar(targetTileIndex).body.moveToTileIndex(pullToTileIndex);
					}
					
					
					
				}
			}
			else if (this.state === 'RETRACT') {
				// Position of end of tongue:
				normal = util.normal(this.endPos, util.toPosition(pullToTileIndex));
				this.curPos.x += normal.x * KNOCK_BACK_SPEED;
				this.curPos.y += normal.y * KNOCK_BACK_SPEED;
			}
			
			this.updateSprites();
			
		};
		event.updateSprites = function () {
			var normal = util.normal(this.startPos, this.curPos),
				distance = util.distance(this.startPos, this.curPos),
				numSprites = this.spriteList.length;
			
			for (let i = 0; i < numSprites; i += 1) {
				this.spriteList[i].x = this.startPos.x + normal.x * (i + 1) * (distance / numSprites);
				this.spriteList[i].y = this.startPos.y + normal.y * (i + 1) * (distance / numSprites);
			}
			
		};
		event.isComplete = function () {
			if (this.state === 'RETRACT' && util.distance(this.curPos, util.toPosition(pullToTileIndex)) <= 12) {
				return true;
			}
		};
		event.destroy = function () {
			this.spriteList.forEach(sprite => sprite.destroy());
			this.targetChar.isMultiMoving = false;
		};

		// Push event:
		actingChar.eventQueue.addEvent(event);
		
		// Character bounce and face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
	};
	
	// WHIP_ATTACK:
	// ********************************************************************************************
	this.abilityTypes.WhipAttack = Object.create(this.abilityTypes.TonguePull);
	this.abilityTypes.WhipAttack.attributes = {damage: {}};
	this.abilityTypes.WhipAttack.minDistance = 0;
	this.abilityTypes.WhipAttack.tongueSpeed = 20;
	this.abilityTypes.WhipAttack.tongueFrame = 1748;
	this.abilityTypes.WhipAttack.onHitTarget = function (actingChar, targetChar) {
		var damage = this.attributes.damage.value(actingChar);
		
		targetChar.takeDamage(damage, 'Physical');
		
		// Hit effect:
		gs.createAnimEffect(targetChar.sprite.position, 'Hit');
	};
	this.abilityTypes.WhipAttack.getPullToIndex = function (actingChar, targetTileIndex) {
		if (util.distance(actingChar.tileIndex, targetTileIndex) <= 1.5) {
			return targetTileIndex;
		}
		
		var ray = gs.getIndexInRay(actingChar.tileIndex, targetTileIndex);
		return ray[ray.length - 2];
	};
	
	// LURE:
	// ********************************************************************************************
	this.abilityTypes.Lure = {};
	this.abilityTypes.Lure.range = LOS_DISTANCE;
	this.abilityTypes.Lure.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.Lure.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex)
			&& !gs.getChar(targetTileIndex).isImmobile
			&& util.distance(actingChar.tileIndex, targetTileIndex) > 2.0
			&& gs.isPassable(this.getPullToIndex(actingChar, targetTileIndex))
			&& gs.isRayPassable(this.getPullToIndex(actingChar, targetTileIndex), targetTileIndex);
	};
	this.abilityTypes.Lure.getPullToIndex = function (actingChar, targetTileIndex) {
		var ray = gs.getIndexInRay(actingChar.tileIndex, targetTileIndex);
		return ray[ray.length - 2];
	};
	this.abilityTypes.Lure.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.Lure.useOn = function (actingChar, targetTileIndex) {
		let targetChar = gs.getChar(targetTileIndex);
		
		if (targetChar.mentalResistance) {
			targetChar.popUpText('Resisted Lure!');
		}
		else {
			targetChar.body.moveToTileIndex(this.getPullToIndex(actingChar, targetTileIndex));
			targetChar.popUpText('Lured!');
		}
		
		// Target Char:
		gs.createParticlePoof(targetChar.tileIndex, 'PURPLE');
		
		// Acting Char:
		actingChar.popUpText('Lure!');
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Sound and Effect:
		gs.createHeartEffect(actingChar.tileIndex);
		gs.playSound(gs.sounds.cure, targetTileIndex);
	};
	
	// FLAMING_CLOUD_BOLT:
	// ********************************************************************************************
	this.abilityTypes.FlamingCloudBolt = {};
	this.abilityTypes.FlamingCloudBolt.isSpell = true;
	this.abilityTypes.FlamingCloudBolt.cloudName = 'FlamingCloud';
	this.abilityTypes.FlamingCloudBolt.cloudDuration = 5;
	this.abilityTypes.FlamingCloudBolt.attributes = {damage: {}};
	this.abilityTypes.FlamingCloudBolt.range = 5.0;
	this.abilityTypes.FlamingCloudBolt.lightColor = '#ff0000';
	this.abilityTypes.FlamingCloudBolt.showTarget = this.abilityShowTarget.Bolt;
	this.abilityTypes.FlamingCloudBolt.getIndexList = function (actingChar, targetTileIndex) {
		// Targets:
		let normal = util.normal(actingChar.tileIndex, targetTileIndex);
		let endTileIndex = {
			x: Math.round(actingChar.tileIndex.x + normal.x * this.range()),
			y: Math.round(actingChar.tileIndex.y + normal.y * this.range())
		};
		
		return gs.getIndexInBRay(actingChar.tileIndex, endTileIndex);
	};
	this.abilityTypes.FlamingCloudBolt.canUseOn = function (actingChar, targetTileIndex) {
		let indexList = this.getIndexList(actingChar, targetTileIndex);
		
		for (let i = 0; i < indexList.length; i += 1) {
			// As long as we can hit the target then we're fine to shoot:
			if (util.vectorEqual(indexList[i], targetTileIndex)) {
				break;
			}
			
			// Something in the way before target:
			if (!gs.isStaticProjectilePassable(indexList[i])) {
				return false;
			}
		}
		
		return gs.abilityCanUseOn.Bolt.call(this, actingChar, targetTileIndex) 
			&& (gs.isRayStaticPassable(actingChar.tileIndex, targetTileIndex) || gs.isRayClear(actingChar.tileIndex, targetTileIndex));
	};
	this.abilityTypes.FlamingCloudBolt.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.FlamingCloudBolt.useOn = function (actingChar, targetTileIndex) {
		// Attributes:
		let damage = this.attributes.damage.value(actingChar);
		
		let indexList = this.getIndexList(actingChar, targetTileIndex);
		
		// Create local so that event closure captures it below:
		let cloudName = this.cloudName;
		let cloudDuration = this.cloudDuration;
		let lightColor = this.lightColor;
		
		// Effect (using events):
		for (let i = 0; i < indexList.length; i += 1) {
			let tileIndex = indexList[i];
			
			// Break at the first obstruction:
			if (!gs.isTileIndexTransparent(tileIndex)) {
				break;
			}
			
			// Create event:
			let event = {timer: 0};
			event.updateFrame = function () {
				// On the first tick:
				if (this.timer === 0) {
					// Cloud:
					let cloud = gs.createCloud(tileIndex, cloudName, damage, cloudDuration);
					
					// Lighting:
					gs.createLightCircle(util.toPosition(tileIndex), lightColor, 120, 30, '66');
					
					// Sound:
					gs.playSound(gs.sounds.fire, tileIndex);
				}
				
				this.timer += 1;
				
			};
			event.isComplete = function () {
				return this.timer > 2;	
			};
			
			// Push event:
			actingChar.eventQueue.addEvent(event);
		}
		
		// Character bounce and face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
	};
	
	// POISON_CLOUD_BOLT:
	// ********************************************************************************************
	this.abilityTypes.PoisonCloudBolt = Object.create(this.abilityTypes.FlamingCloudBolt);
	this.abilityTypes.PoisonCloudBolt.isSpell = true;
	this.abilityTypes.PoisonCloudBolt.cloudName = 'PoisonCloud';
	this.abilityTypes.PoisonCloudBolt.cloudDuration = 5;
	this.abilityTypes.PoisonCloudBolt.lightColor = '#00ff00';
	
	// NPC_CHARM:
	// ********************************************************************************************
	this.abilityTypes.NPCCharm = {};
	this.abilityTypes.NPCCharm.isSpell = true;
	this.abilityTypes.NPCCharm.range = ABILITY_RANGE;
	this.abilityTypes.NPCCharm.canUseOn = this.abilityCanUseOn.SingleCharacterSmite;
	this.abilityTypes.NPCCharm.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.NPCCharm.useOn = function (character, targetTileIndex) {
		gs.getChar(targetTileIndex).statusEffects.add('NPCCharm', {casterId: character.id});
		
		// Sound and Effect:
		gs.createHeartEffect(targetTileIndex);
		gs.playSound(gs.sounds.cure, targetTileIndex);
	};
	
	
	
	// TORMENT:
	// ********************************************************************************************
	this.abilityTypes.Torment = {};
	this.abilityTypes.Torment.isSpell = true;
	this.abilityTypes.Torment.range = 3.0;
	this.abilityTypes.Torment.canUseOn = this.abilityCanUseOn.SingleCharacterSmite;
	this.abilityTypes.Torment.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.Torment.useOn = function (actingChar, targetTileIndex) {
		let targetChar = gs.getChar(targetTileIndex);
		
		// On target:
		targetChar.popUpText('Tormented!');
		gs.createFireEffect(targetChar.tileIndex);
		let damage = Math.floor(targetChar.currentHp / 2);
		targetChar.takeDamage(damage, DAMAGE_TYPE.NONE, {killer: actingChar, noDiscord: true});
		
		// Character bounce and face:
		gs.createFireEffect(actingChar.tileIndex);
		actingChar.popUpText('Casting Torment!');
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Sound:
		gs.playSound(gs.sounds.bolt);
	};
	

	
	// SAND_BLAST:
	// ********************************************************************************************
	this.abilityTypes.SandBlast = Object.create(this.abilityTypes.ConeOfCold);
	this.abilityTypes.SandBlast.isSpell = true;
	this.abilityTypes.SandBlast.range = 3.0;
	this.abilityTypes.SandBlast.aoeRange = 3.0;
	this.abilityTypes.SandBlast.attributes = {damage: {}};
	this.abilityTypes.SandBlast.particleColor = 'YELLOW';
	this.abilityTypes.SandBlast.useOn = function (actingChar, targetTileIndex) {
		actingChar.popUpText('Sand Blast');
		gs.abilityTypes.ConeOfCold.useOn.call(this, actingChar, targetTileIndex);
	};
	this.abilityTypes.SandBlast.onTile = function (tileIndex) {
		gs.createCloud(tileIndex, 'Dust', 0, 5);
	};
	
	this.abilityTypes.SandBlast.onChar = function (actingChar, targetChar, damage, delta) {
		var distance;
			
		if (util.distance(targetChar.tileIndex, actingChar.tileIndex) < 1.5) {
			distance = 3;
		}
		else {
			distance = 2;
		}
		
		gs.createParticleBurst(targetChar.sprite.position, delta, this.particleColor);
		targetChar.body.applyKnockBack(delta, distance);
		targetChar.takeDamage(damage, 'Physical', {killer: actingChar, neverBlink: true});
	};
	
	// FIRE_STORM:
	// ********************************************************************************************
	this.abilityTypes.NPCFireStorm = {};
	this.abilityTypes.NPCFireStorm.isSpell = true;
	this.abilityTypes.NPCFireStorm.niceName = 'Fire Storm';
	this.abilityTypes.NPCFireStorm.attributes = {damage: {}};
	this.abilityTypes.NPCFireStorm.range = ABILITY_RANGE;
	this.abilityTypes.NPCFireStorm.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.NPCFireStorm.canUseOn = function (actingChar, targetTileIndex) {
		var delta = util.get8WayVector(actingChar.tileIndex, targetTileIndex);
		
		return gs.isPassable(actingChar.tileIndex.x + delta.x, actingChar.tileIndex.y + delta.y)
			&& gs.isRayBeamPassable(actingChar.tileIndex, targetTileIndex)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range()
			&& util.isStraight(actingChar.tileIndex, targetTileIndex);
	};
	this.abilityTypes.NPCFireStorm.useOn = function (actingChar, targetTileIndex) {
		var delta, proj, damage;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		// Direction:
		delta = util.get8WayVector(actingChar.tileIndex, targetTileIndex);
		
		// Status Effect:
		actingChar.statusEffects.add('CastingFireStorm', {
			damage: damage,
			tileIndex: {x: actingChar.tileIndex.x + delta.x, y: actingChar.tileIndex.y + delta.y},
			delta: {x: delta.x, y: delta.y}
		});
		
		// Set Facing:
		actingChar.body.faceTileIndex(targetTileIndex);
	};
	
	// BLINK_ALLY:
	// ********************************************************************************************
	this.abilityTypes.BlinkAlly = {};
	this.abilityTypes.BlinkAlly.isSpell = true;
	this.abilityTypes.BlinkAlly.range = LOS_DISTANCE;
	this.abilityTypes.BlinkAlly.getTarget = this.abilityGetTarget.SingleTarget; // Ex. targets the player
	
	// Determine if we have a valid ally that we can blink towards the target:
	this.abilityTypes.BlinkAlly.getAllyTarget = function (actingChar, targetTileIndex) {
		var charList;
		
		charList = gs.liveCharacterList();
		charList = charList.filter(char => char !== actingChar && !actingChar.isHostileToMe(char) && char.isAgroed);
		charList = charList.filter(char => !char.isDamageImmune && !char.isImmobile);
		charList = charList.filter(char => util.distance(char.tileIndex, actingChar.tileIndex) < this.range(actingChar));
		charList = charList.filter(char => this.getDestIndexForChar(actingChar, targetTileIndex, char));
		charList = charList.filter(char => !char.type.isSwimmer);
		
		return charList.length > 0 ? util.randElem(charList) : null;
	};
	
	this.abilityTypes.BlinkAlly.getDestIndexForChar = function (actingChar, targetTileIndex, blinkChar) {
		var indexList;
		
		// All targetable indices:
		indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.range(actingChar));
		indexList = indexList.filter(index => gs.isPassable(index));
		indexList = indexList.filter(index => gs.isIndexSafeForCharType(index, blinkChar));
		
		// Only consider indices that would move the blinkChar closer to the target:
		indexList = indexList.filter(index => util.distance(index, targetTileIndex) < util.distance(blinkChar.tileIndex, targetTileIndex));
		
		// Don't blink kiters into min range:
		if (blinkChar.type.minRange) {
			indexList = indexList.filter(index => util.distance(index, targetTileIndex) >= blinkChar.type.minRange);
		}
		
		// Only consider indices that have a clear LoS to the player:
		indexList = indexList.filter(index => gs.isRayPassable(index, targetTileIndex));
		
		// Select a nearby random tileIndex:
		if (indexList.length > 0) {
			indexList.sort((a, b) => util.distance(targetTileIndex, a) - util.distance(targetTileIndex, b));
			
			let minDistance = util.distance(targetTileIndex, indexList[0]);
			indexList = indexList.filter(index => util.distance(targetTileIndex, index) === minDistance);
			return util.randElem(indexList);
			
		}
		// No valid dest tileIndex:
		else {
			return null;
		}
	};
	this.abilityTypes.BlinkAlly.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex)
			&& this.getAllyTarget(actingChar, targetTileIndex);
	};
	this.abilityTypes.BlinkAlly.useOn = function (actingChar, targetTileIndex) {
		var npc, blinkToIndex;
		
		npc = this.getAllyTarget(actingChar, targetTileIndex);
		blinkToIndex = this.getDestIndexForChar(actingChar, targetTileIndex, npc);
		
		// Summon Effect on npc:
		gs.createSummonEffect(npc.tileIndex, function () {
			npc.body.snapToTileIndex(blinkToIndex);
			npc.popUpText('Blink', 'White');
			npc.waitTime = 100;
		}, this);
		
		// Summon effect at destination:
		gs.createSummonEffect(blinkToIndex);
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
		
		// Caster:
		actingChar.popUpText('Blink Ally', 'White');
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
		
	};
	
	// GROUP_BUFF:
	// ********************************************************************************************
	this.abilityTypes.GroupBuff = {};
	this.abilityTypes.GroupBuff.isSpell = true;
	this.abilityTypes.GroupBuff.range = LOS_DISTANCE;
	this.abilityTypes.GroupBuff.getTarget = this.abilityGetTarget.Self;
	this.abilityTypes.GroupBuff.canUseOn = this.abilityCanUseOn.SingleCharacterSmite;
	this.abilityTypes.GroupBuff.getAllies = function (actingChar) {
		var indexList;
		
		// All targetable indices:
		indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.range(actingChar));
		
		// Only valid indices:
		indexList = indexList.filter(index => gs.getChar(index));
		indexList = indexList.filter(index => !actingChar.isHostileToMe(gs.getChar(index)));
		indexList = indexList.filter(index => gs.getChar(index).faction !== FACTION.DESTRUCTABLE);
		indexList = indexList.filter(index => !gs.getChar(index).isDamageImmune);
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		
		return indexList.map(index => gs.getChar(index));
	};
	
	this.abilityTypes.GroupBuff.canUse = function (actingChar) {
		if (actingChar.faction === FACTION.HOSTILE) {
			return this.getAllies(actingChar).length > 0;
		}
		// Player allies should only cast buff on the player when there are hostiles agroed
		else {
			return this.getAllies(actingChar).length > 0 && gs.agroedHostileList().length > 0;
		}
	};
	this.abilityTypes.GroupBuff.particleEffect = function (actingChar) {
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
	};
	this.abilityTypes.GroupBuff.useOn = function (actingChar, targetTileIndex) {
		let charList = this.getAllies(actingChar);
		
		charList.forEach(this.onChar.bind(this, actingChar), this);
		
		// Particle Effect:
		this.particleEffect.call(this, actingChar);
		
		// Caster:
		actingChar.popUpText(this.casterText, 'White');
		gs.playSound(gs.sounds.cure);
	};
	
	// GROUP_HEAL:
	// ********************************************************************************************
	this.abilityTypes.GroupHeal = Object.create(this.abilityTypes.GroupBuff);
	this.abilityTypes.GroupHeal.isSpell = true;
	this.abilityTypes.GroupHeal.healPercent = 0.75;
	this.abilityTypes.GroupHeal.casterText = 'Casting Group Heal!';
	this.abilityTypes.GroupHeal.shouldUseOn = function (actingChar) {
		let charList = this.getAllies(actingChar);
		
		// We have at least one ally we can heal
		if (charList.find(char => char.currentHp < char.maxHp && !char.type.noRegen)) {
			return true;
		}
		
		return false;
	};
	this.abilityTypes.GroupHeal.onChar = function (actingChar, targetChar) {
		if (targetChar.currentHp < targetChar.maxHp && !targetChar.type.noRegen) {
			targetChar.healHp(Math.round(targetChar.maxHp * this.healPercent));
			targetChar.popUpText('Healed!', 'White');
			gs.createHealingEffect(targetChar.tileIndex);
		}
	};
	
	// WAR_CRY:
	// ********************************************************************************************
	this.abilityTypes.WarCry = Object.create(this.abilityTypes.GroupBuff);
	this.abilityTypes.WarCry.useOn = function (actingChar, targetTileIndex) {
		let charList = this.getAllies(actingChar);
		
		// Caster:
		gs.createFireEffect(actingChar.tileIndex);
		actingChar.popUpText('War Cry!', 'White');
		
		// Sound:
		gs.playSound(gs.sounds.cure);
		
		// Create event:
		let event = {timer: 0, charList: charList};
		event.updateFrame = function () {
			this.timer += 1;
			
			if (this.timer === 30) {
				// On Char:
				this.charList.forEach(function (targetChar) {
					targetChar.statusEffects.add('NPCBerserk', {duration: 5});
					gs.createFireEffect(targetChar.tileIndex);
				}, this);
			}
		};
		event.isComplete = function () {
			return this.timer > 30;	
		};
		
		// Push event:
		actingChar.eventQueue.addEvent(event);
	};
	

	
	// GROUP_SHIELD_OF_FIRE:
	// ********************************************************************************************
	this.abilityTypes.GroupShieldOfFlames = Object.create(this.abilityTypes.GroupBuff);
	this.abilityTypes.GroupShieldOfFlames.isSpell = true;
	this.abilityTypes.GroupShieldOfFlames.attributes = {damage: {}};
	this.abilityTypes.GroupShieldOfFlames.casterText = 'Casting Shield of Fire';
	this.abilityTypes.GroupShieldOfFlames.onChar = function (actingChar, targetChar) {
		targetChar.statusEffects.add('ShieldOfFlames', {damage: this.attributes.damage.value(actingChar), casterId: actingChar.id});
		gs.createFireEffect(targetChar.tileIndex);
	};
	
	// GROUP_STORM_SHIELD:
	// ********************************************************************************************
	this.abilityTypes.GroupStormShield = Object.create(this.abilityTypes.GroupBuff);
	this.abilityTypes.GroupStormShield.isSpell = true;
	this.abilityTypes.GroupStormShield.attributes = {damage: {}};
	this.abilityTypes.GroupStormShield.casterText = 'Casting Storm Shield';
	this.abilityTypes.GroupStormShield.onChar = function (actingChar, targetChar) {
		targetChar.statusEffects.add('StormShield', {damage: this.attributes.damage.value(actingChar), casterId: actingChar.id});
		gs.createIceEffect(targetChar.tileIndex);
	};
	
	// GROUP_ICE_ARMOR:
	// ********************************************************************************************
	this.abilityTypes.GroupIceArmor = Object.create(this.abilityTypes.GroupBuff);
	this.abilityTypes.GroupIceArmor.isSpell = true;
	this.abilityTypes.GroupIceArmor.attributes = {damage: {}};
	this.abilityTypes.GroupIceArmor.casterText = 'Casting Ice Armor';
	this.abilityTypes.GroupIceArmor.onChar = function (actingChar, targetChar) {
		targetChar.statusEffects.add('IceArmor', {casterId: actingChar.id});
		gs.createIceEffect(targetChar.tileIndex);
	};
	
	// NPC_CONFUSION:
	// ********************************************************************************************
	this.abilityTypes.NPCConfusion = {};
	this.abilityTypes.NPCConfusion.isSpell = true;
	this.abilityTypes.NPCConfusion.range = ABILITY_RANGE;
	this.abilityTypes.NPCConfusion.canUseOn = this.abilityCanUseOn.SingleCharacterSmite;
	this.abilityTypes.NPCConfusion.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.NPCConfusion.useOn = function (character, targetTileIndex) {
		gs.getChar(targetTileIndex).statusEffects.add('Confusion', {casterId: character.id});
		
		gs.createManaEffect(targetTileIndex);
		gs.playSound(gs.sounds.cure);
		
		character.body.faceTileIndex(targetTileIndex);
		character.body.bounceTowards(targetTileIndex);
	};
	
	// CURSE:
	// ********************************************************************************************
	this.abilityTypes.Curse = {};
	this.abilityTypes.Curse.isSpell = true;
	this.abilityTypes.Curse.range = LOS_DISTANCE;
	this.abilityTypes.Curse.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.Curse.canUseOn = gs.abilityCanUseOn.SingleCharacterRay;
	this.abilityTypes.Curse.useOn = function (character, targetTileIndex) {
		var targetChar = gs.getChar(targetTileIndex);
		
		if (targetChar) {
			targetChar.statusEffects.add(this.curseName, {casterId: character.id});
		}
		
		gs.playSound(gs.sounds.cure);
		
		character.body.faceTileIndex(targetTileIndex);
		character.body.bounceTowards(targetTileIndex);
	};
	
	// ARCANE_ARROW:
	// ********************************************************************************************
	this.abilityTypes.ArcaneArrow = {};
	this.abilityTypes.ArcaneArrow.attributes = {damage: {}};
	this.abilityTypes.ArcaneArrow.range = LOS_DISTANCE;
	this.abilityTypes.ArcaneArrow.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.ArcaneArrow.canUseOn = function (actingChar, targetTileIndex) {
		var delta = util.get8WayVector(actingChar.tileIndex, targetTileIndex),
			indexList = this.getIndexList(actingChar, targetTileIndex);
		
		
		return gs.isPassable(actingChar.tileIndex.x + delta.x, actingChar.tileIndex.y + delta.y)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range()
			&& util.isStraight(actingChar.tileIndex, targetTileIndex)
			&& gs.isRayPassable(actingChar.tileIndex, targetTileIndex)
			&& indexList.length > 0;
	};
	this.abilityTypes.ArcaneArrow.getIndexList = function (actingChar, targetTileIndex) {
		let delta = util.get8WayVector(actingChar.tileIndex, targetTileIndex),
			x = actingChar.tileIndex.x,
			y = actingChar.tileIndex.y,
			list;
		
		if (delta.x === 1 && delta.y === 0) 	list = [{x: x + 1, y: y}, {x: x + 1, y: y - 1}, {x: x + 1, y: y + 1}];
		if (delta.x === -1 && delta.y === 0) 	list = [{x: x - 1, y: y}, {x: x - 1, y: y - 1}, {x: x - 1, y: y + 1}];
		if (delta.x === 0 && delta.y === 1) 	list = [{x: x, y: y + 1}, {x: x + 1, y: y + 1}, {x: x - 1, y: y + 1}];
		if (delta.x === 0 && delta.y === -1) 	list = [{x: x, y: y - 1}, {x: x + 1, y: y - 1}, {x: x - 1, y: y - 1}];
		
		if (delta.x === 1 && delta.y === 1)		list = [{x: x + 1, y: y + 1}, {x: x + 1, y: y}, {x: x, y: y + 1}];
		if (delta.x === -1 && delta.y === 1)	list = [{x: x - 1, y: y + 1}, {x: x - 1, y: y}, {x: x, y: y + 1}];
		if (delta.x === 1 && delta.y === -1)	list = [{x: x + 1, y: y - 1}, {x: x + 1, y: y}, {x: x, y: y - 1}];
		if (delta.x === -1 && delta.y === -1)	list = [{x: x - 1, y: y - 1}, {x: x - 1, y: y}, {x: x, y: y - 1}];
		
		list = list.filter(index => gs.isPassable(index));
		
		return list;
	};
	this.abilityTypes.ArcaneArrow.useOn = function (actingChar, targetTileIndex) {
		var delta, damage, angle;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		// Direction:
		delta = util.get8WayVector(actingChar.tileIndex, targetTileIndex);
		angle = 45 - util.angleToFace(actingChar.tileIndex, targetTileIndex);
		
		// Projectiles:
		let indexList = this.getIndexList(actingChar, targetTileIndex);
		indexList.forEach(function (index) {
			let proj = gs.createNPC(index, 'ArcaneArrow', {burstDamage: damage});
			proj.moveDelta = {x: delta.x, y: delta.y};
			proj.waitTime = 100;
			proj.isAgroed = true;
			proj.sprite.angle = angle;
		}, this);
		
		// Caster:
		actingChar.popUpText('Arcane Arrow!', 'White');
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
		
		// Character bounce and face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
	};
	
	// SINGLE_ARCANE_ARROW:
	// ********************************************************************************************
	this.abilityTypes.SingleArcaneArrow = Object.create(this.abilityTypes.ArcaneArrow);
	this.abilityTypes.SingleArcaneArrow.arrowTypeName = 'ArcaneArrow';
	this.abilityTypes.SingleArcaneArrow.niceName = 'Arcane Arrow';
	this.abilityTypes.SingleArcaneArrow.particleColor = 'PURPLE';
	this.abilityTypes.SingleArcaneArrow.useOn  = function (actingChar, targetTileIndex) {
		var delta, damage, angle;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		// Direction:
		delta = util.get8WayVector(actingChar.tileIndex, targetTileIndex);
		angle = 45 - util.angleToFace(actingChar.tileIndex, targetTileIndex);
		
		// Projectile:
		let tileIndex = {x: actingChar.tileIndex.x + delta.x, y: actingChar.tileIndex.y + delta.y};
	
		let proj = gs.createNPC(tileIndex, this.arrowTypeName, {burstDamage: damage});
		proj.moveDelta = {x: delta.x, y: delta.y};
		proj.waitTime = 100;
		proj.isAgroed = true;
		proj.sprite.angle = angle;
		
		// Caster:
		actingChar.popUpText(this.niceName + '!', 'White');
		gs.createParticlePoof(actingChar.tileIndex, this.particleColor);
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
		
		// Character bounce and face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
	};
	
	// SINGLE_FIRE_ARROW:
	// ********************************************************************************************
	this.abilityTypes.SingleFireArrow = Object.create(this.abilityTypes.SingleArcaneArrow);
	this.abilityTypes.SingleFireArrow.niceName = 'Fire Arrow';
	this.abilityTypes.SingleFireArrow.arrowTypeName = 'FireArrow';
	this.abilityTypes.SingleFireArrow.particleColor = 'RED';
	
	// SINGLE_ICE_ARROW:
	// ********************************************************************************************
	this.abilityTypes.SingleIceArrow = Object.create(this.abilityTypes.SingleArcaneArrow);
	this.abilityTypes.SingleIceArrow.niceName = 'Ice Arrow';
	this.abilityTypes.SingleIceArrow.arrowTypeName = 'IceArrow';
	this.abilityTypes.SingleIceArrow.particleColor = 'BLUE';
	
	// SINGLE_SHOCK_ARROW:
	// ********************************************************************************************
	this.abilityTypes.SingleShockArrow = Object.create(this.abilityTypes.SingleArcaneArrow);
	this.abilityTypes.SingleShockArrow.niceName = 'Shock Arrow';
	this.abilityTypes.SingleShockArrow.arrowTypeName = 'ShockArrow';
	this.abilityTypes.SingleShockArrow.particleColor = 'WHITE';
	
	// SINGLE_POISON_ARROW:
	// ********************************************************************************************
	this.abilityTypes.SinglePoisonArrow = Object.create(this.abilityTypes.SingleArcaneArrow);
	this.abilityTypes.SinglePoisonArrow.niceName = 'Poison Arrow';
	this.abilityTypes.SinglePoisonArrow.arrowTypeName = 'PoisonArrow';
	this.abilityTypes.SinglePoisonArrow.particleColor = 'GREEN';
	
	// HIDE_IN_SHELL:
	// ********************************************************************************************
	this.abilityTypes.HideInShell = {};
	this.abilityTypes.HideInShell.getTarget = this.abilityGetTarget.Self;
	this.abilityTypes.HideInShell.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.HideInShell.shouldUseOn = function (actingChar) {
		return actingChar.currentHp <= actingChar.maxHp * 0.25
			&& !actingChar.statusEffects.has('HideInShell')
			&& util.frac() <= 0.5;
	};
	this.abilityTypes.HideInShell.useOn = function (character, targetTileIndex) {
		character.statusEffects.add('HideInShell');
	};
	
	// RETRACT_AND_REPAIR:
	// ********************************************************************************************
	this.abilityTypes.RetractAndRepair = {};
	this.abilityTypes.RetractAndRepair.getTarget = this.abilityGetTarget.Self;
	this.abilityTypes.RetractAndRepair.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.RetractAndRepair.canUse = function (actingChar) {
		return actingChar.currentHp <= actingChar.maxHp * 0.30
			&& !actingChar.statusEffects.has('RetractAndRepair');
	};
	this.abilityTypes.RetractAndRepair.shouldUseOn = function (actingChar) {
		return util.frac() <= 0.75;
	};
	this.abilityTypes.RetractAndRepair.useOn = function (character, targetTileIndex) {
		character.statusEffects.add('RetractAndRepair');
	};
	
	// NPC_BERSERK:
	// Doubles the characters damage and movement speed
	// ********************************************************************************************
	this.abilityTypes.NPCBerserk = {};
	this.abilityTypes.NPCBerserk.useImmediately = true;
	this.abilityTypes.NPCBerserk.niceName = 'Berserk';
	this.abilityTypes.NPCBerserk.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.NPCBerserk.getTarget = this.abilityGetTarget.Self;
	this.abilityTypes.NPCBerserk.shouldUseOn = function (actingChar) {
		return actingChar.currentHp <= actingChar.maxHp / 2
			&& !actingChar.statusEffects.has('NPCBerserk')
			&& util.frac() <= 0.5;
	};
	this.abilityTypes.NPCBerserk.useOn = function (actingChar) {
		// Casting Effect:
		gs.createFireEffect(actingChar.tileIndex);
		gs.playSound(gs.sounds.cure);
		
		// Status Effect:
		actingChar.statusEffects.add('NPCBerserk');
	};
	
	// NPC_SHORT_BERSERK:
	// ********************************************************************************************
	this.abilityTypes.NPCShortBerserk = {};
	this.abilityTypes.NPCShortBerserk.useImmediately = true;
	this.abilityTypes.NPCShortBerserk.niceName = 'Berserk';
	this.abilityTypes.NPCShortBerserk.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.NPCShortBerserk.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.NPCShortBerserk.canUseOn = function (actingChar, targetTileIndex) {
		return util.distance(actingChar.tileIndex, targetTileIndex) <= 3.0;
	};
	this.abilityTypes.NPCShortBerserk.useOn = function (actingChar) {
		// Casting Effect:
		gs.createFireEffect(actingChar.tileIndex);
		gs.playSound(gs.sounds.cure);
		
		// Status Effect:
		actingChar.statusEffects.add('NPCBerserk', {duration: this.duration});
	};
	
	// NPC_SHIELDS_UP:
	// ********************************************************************************************
	this.abilityTypes.NPCShieldsUp = {};
	this.abilityTypes.NPCShieldsUp.useImmediately = true;
	this.abilityTypes.NPCShieldsUp.niceName = 'Shields Up';
	this.abilityTypes.NPCShieldsUp.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.NPCShieldsUp.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.NPCShieldsUp.canUseOn = function (actingChar, targetTileIndex) {
		return util.distance(actingChar.tileIndex, targetTileIndex) <= 1.5;
	};
	this.abilityTypes.NPCShieldsUp.shouldUseOn = function (actingChar) {
		return !actingChar.statusEffects.has('NPCShieldsUp')
			&& util.frac() <= 0.5;
	};
	this.abilityTypes.NPCShieldsUp.useOn = function (actingChar) {
		// Casting Effect:
		gs.playSound(gs.sounds.spell);
		
		// Text:
		actingChar.popUpText('Shields Up!');
		
		// Status Effect:
		actingChar.statusEffects.add('NPCShieldsUp');
	};
	
	// YENDOR_TRANSFORM:
	// Transforms The-Wizard-Yendor into one of his different forms
	// ********************************************************************************************
	this.abilityTypes.YendorTransform = {};
	this.abilityTypes.YendorTransform.useImmediately = true;
	this.abilityTypes.YendorTransform.niceName = 'Transform';
	this.abilityTypes.YendorTransform.dontShowInDesc = true;
	this.abilityTypes.YendorTransform.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.YendorTransform.getTarget = this.abilityGetTarget.Self;
	this.abilityTypes.YendorTransform.useOn = function (actingChar) {
		// To Type:
		let toTypeNameList = ['TheWizardYendorFire', 'TheWizardYendorStorm', 'TheWizardYendorIce', 'TheWizardYendorToxic', 'TheWizardYendorMagic'];
		toTypeNameList = toTypeNameList.filter(name => name !== actingChar.type.name);
		
		// Saving properties:
		let tileIndex = {x: actingChar.tileIndex.x, y: actingChar.tileIndex.y};
		let currentHp = actingChar.currentHp;
		let statusEffectData = actingChar.statusEffects.toData();
		let summonIDList = actingChar.summonIDList;
		let summonedNPCList = gs.characterList.filter(char => char.summonerId === actingChar.id);
		
		// Destroy existing:
		actingChar.destroy();
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
		
		// Summon Effect:
		gs.createSummonEffect(tileIndex, function () {
			// Create new:
			let npc = gs.createNPC(tileIndex, util.randElem(toTypeNameList));
			npc.isAgroed = true;
			npc.waitTime = 100;
			npc.currentHp = currentHp;
			npc.statusEffects.loadData(statusEffectData);
			
			// Summons
			npc.summonIDList = summonIDList;
			summonedNPCList.forEach(function (char) {
				char.death();
				//char.summonerId = npc.id;
			}, this);
			
			// Set cooldown on transform:
			let ability = npc.abilities.list.find(ability => ability.type.name === 'YendorTransform');
			ability.coolDown = ability.type.coolDown;
		});
	};
	
	// SLIME_KING_SPLIT:
	// ********************************************************************************************
	this.abilityTypes.SlimeKingSplit = {};
	this.abilityTypes.SlimeKingSplit.useImmediately = true;
	this.abilityTypes.SlimeKingSplit.niceName = 'Split';
	this.abilityTypes.SlimeKingSplit.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.SlimeKingSplit.getTarget = this.abilityGetTarget.Self;
	this.abilityTypes.SlimeKingSplit.canUse = function (actingChar) {
		return gs.getPassableAdjacentIndex(actingChar.tileIndex)
			&& gs.characterList.filter(char => char.type.name === actingChar.type.name).length < 8;
	};
	this.abilityTypes.SlimeKingSplit.useOn = function (actingChar) {
		let newChar = gs.createNPC(gs.getPassableAdjacentIndex(actingChar.tileIndex), actingChar.type.name);
		
		// Start Agroed:
		newChar.isAgroed = true;
		newChar.waitTime = ACTION_TIME;
		newChar.currentHp = actingChar.currentHp;
		
		// Start cooldowns at max:
		newChar.abilities.list.forEach(function (ability) {
			if (ability) {
				ability.coolDown = ability.type.coolDown;
			}
		}, this);
		
		// Sound and Particles:
		gs.playSound(gs.sounds.cure);
		gs.createParticlePoof(newChar.tileIndex, 'PURPLE');
	};
	
	// BAT_FORM:
	// Used by the vampire lord to poof into a swarm of bats
	// ********************************************************************************************
	this.abilityTypes.BatForm = {};
	this.abilityTypes.BatForm.useImmediately = true;
	this.abilityTypes.BatForm.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.BatForm.getTarget = this.abilityGetTarget.Self;
	this.abilityTypes.BatForm.canUse = function (actingChar) {
		return actingChar.currentHp <= actingChar.maxHp * levelController.flags.batFormHpPercent
			&& util.frac() <= 0.5;
	};
	this.abilityTypes.BatForm.useOn = function (actingChar) {
		let tileIndex = {x: actingChar.tileIndex.x, y: actingChar.tileIndex.y};
		
		// Text:
		actingChar.popUpText('Poof!');
		gs.createParticlePoof(tileIndex, 'WHITE');
		
		// Sound:
		gs.playSound(gs.sounds.death);
		
		// Destroy Vampire Lord:
		actingChar.destroy();

		// Create Bats:
		let indexList = gs.getIndexListInFlood(tileIndex, tileIndex => gs.isPassable(tileIndex), 2, true);
		
		let maxBats = Math.min(levelController.flags.batFormNum, indexList.length);
		
		// Reduce num bats each time:
		if (levelController.flags.batFormNum > 1) {
			levelController.flags.batFormNum -= 1;
		}
		
		for (let i = 0; i < maxBats; i += 1) {
			
			let newNpc = gs.createNPC(indexList[i], 'VampireBat');
			newNpc.isAgroed = true;
			newNpc.waitTime = ACTION_TIME;
			
			gs.createParticlePoof(newNpc.tileIndex, 'WHITE');
		}

		// Start timer:
		levelController.flags.batFormTimer = 0;
		
		
		
	};
	
	
	
	// ********************************************************************************************
    // ON_HIT:
    // Special functionality that NPCs call when they are hit.
    // ********************************************************************************************
	this.npcOnHit = {};
	
	// BLEED:
	// ********************************************************************************************
	this.npcOnHit.Bleed = function (character) {
		if (util.frac() < 0.5) {
			character.bloodSplatter();
		}
	};
	
	// SLIME_SPLIT:
	// ********************************************************************************************
	this.npcOnHit.SlimeSplit = function (character) {
		if (gs.getPassableAdjacentIndex(character.tileIndex) && character.currentHp >= character.maxHp * 0.25) {
			// Handling domination:
			// We always use the scroll version so that the player does not lose more MP:
			let startDominated = false;
			if (character.statusEffects.has('Domination') || character.statusEffects.has('ScrollOfDomination')) {
				startDominated = 'ScrollOfDomination';
			}
			
			let newNpc = gs.createNPC(gs.getPassableAdjacentIndex(character.tileIndex), character.type.name, {startDominated: startDominated});

			newNpc.currentHp = Math.floor(character.currentHp * 0.75);
			character.currentHp = Math.floor(character.currentHp * 0.75);
			
			// Exp:
			character.exp = Math.ceil(character.exp / 2);
			newNpc.exp = Math.ceil(character.exp / 2);
			
			newNpc.isAgroed = true;
			newNpc.waitTime = ACTION_TIME;
			
			
		}
	};
	
	this.npcOnHit.BaseBlink = function (character, preBlinkFunc = null) {
		var indexList;
		
		if (character.isImmobile || character.isStunned) {
			return;
		}
		
		// Finding a valid destination:
		indexList = gs.getIndexListInRadius(character.tileIndex, LOS_DISTANCE);
		indexList = indexList.filter(index => gs.getTile(index).visible);
		indexList = indexList.filter(index => gs.isPassable(index) && character.canMoveTo(index));
		
		if (indexList.length > 0) {
			// Pre Teleport:
			if (preBlinkFunc) {
				preBlinkFunc.call(this, character);
			}
			gs.createParticlePoof(character.tileIndex, 'PURPLE');
			gs.createPopUpTextAtTileIndex(character.tileIndex, 'Blink');
			gs.playSound(gs.sounds.teleport, character.tileIndex);
			
			// Teleport:
			let tileIndex = util.randElem(indexList);
			character.body.snapToTileIndex(tileIndex);
			
			// Post-Teleport:
			gs.createParticlePoof(character.tileIndex, 'PURPLE');
			character.popUpText('Blink');
			character.waitTime = 100;
		}
	};
	
	// BLINK_FROG:
	// ********************************************************************************************
	this.npcOnHit.BlinkFrog = function (character, flags) {
		if (util.frac() < 0.50 && character.currentHp < character.maxHp / 2 && flags.attackType !== 'DamageShield' && !flags.neverBlink) {
			gs.npcOnHit.BaseBlink(character);
		}
	};
	
	// IMP_BLINK:
	// ********************************************************************************************
	this.npcOnHit.ImpBlink = function (character, flags) {
		if (util.frac() < 0.25 && character.currentHp < character.maxHp / 2 && flags.attackType !== 'DamageShield' && !flags.neverBlink) {
			gs.npcOnHit.BaseBlink(character);
		}
	};
	
	// FIRE_BLINK:
	// ********************************************************************************************
	this.npcOnHit.FireBlink = function (character, flags) {
		if (util.frac() < 0.50 && character.currentHp < character.maxHp / 2 && flags.attackType !== 'DamageShield' && !flags.neverBlink) {
			gs.npcOnHit.BaseBlink(character, function (char) {
				gs.createCloud(char.tileIndex, 'FlamingCloud', gs.npcDamage(char.level, 'MLOW'), 10);
			});
		}
	};
};


// UPDATE_TURN:
// Special functionality that NPCs call every turn to update themselves.
// ************************************************************************************************
gs.createNPCUpdateTurnTypes = function () {
	this.npcUpdateTurn = {};
	
	// CONTROL_MODULE:
	// The control module will cause all other modules to move at the same time on his turn
	// ********************************************************************************************
	this.npcUpdateTurn.ControlModule = function () {
		let npc;
		
		// If any of the modules is frozen
		let list = gs.characterList.filter(char => util.inArray(char.type.niceName, ['Cannon Module', 'Bomb Module', 'Control Module', 'Repair Module', 'Pyro Module']));
		list = list.filter(char => char.statusEffects.has('Frozen'));
		if (list.length > 0) {
			return;
		}
		
		// Cannon Module:
		npc = gs.characterList.find(char => char.type.niceName === 'Cannon Module');
		if (npc) {
			gs.npcUpdateTurn.FollowTrainTracks.call(npc);
		}
	
		// Bomb Module:
		npc = gs.characterList.find(char => char.type.niceName === 'Bomb Module');
		if (npc) {
			gs.npcUpdateTurn.FollowTrainTracks.call(npc);
		}
		
		// Myself (Control Module):
		gs.npcUpdateTurn.FollowTrainTracks.call(this);
		
		// Repair Module:
		npc = gs.characterList.find(char => char.type.niceName === 'Repair Module');
		if (npc) {
			gs.npcUpdateTurn.FollowTrainTracks.call(npc);
		}
		
		// Pyro Module:
		npc = gs.characterList.find(char => char.type.niceName === 'Pyro Module');
		if (npc) {
			gs.npcUpdateTurn.FollowTrainTracks.call(npc);
		}
	};
	
	
	// FOLLOW_TRAIN_TRACKS:
	// ********************************************************************************************
	this.npcUpdateTurn.FollowTrainTracks = function () {
		var obj = gs.getObj(this.tileIndex, 'Track'),
			frame,
			toTileIndex;
		
		if (!obj || this.isStunned || !this.isAlive) {
			return;
		}
		
		let moveTo = function (tileIndex) {
			// Character (trample)
			if (gs.getChar(tileIndex) && !gs.getChar(tileIndex).isImmobile && !gs.getChar(tileIndex).type.isDamageImmune) {
				gs.meleeAttack(this, tileIndex, null, 15, {knockBack: 1, neverMiss: true});
				
				this.popUpText('Trample!', 'White');
				
				// Move into clear space:
				if (gs.isPassable(tileIndex)) {
					this.body.isKnockBack = true;
					this.moveTo(tileIndex, false);
				}
		
			}
			// No Character (move):
			else if (gs.isPassable(tileIndex)){
				this.moveTo(tileIndex);
			}
			
		}.bind(this);


		frame = obj.sprite.frame;
		
		// Right:
		toTileIndex = {x: this.tileIndex.x + 1, y: this.tileIndex.y};
		if (frame === 4096 || frame === 4100 || frame === 4104) {
			this.baseSprite.frame = this.type.horizontalBaseFrame;
			moveTo(toTileIndex);
		}
		
		// Up:
		toTileIndex = {x: this.tileIndex.x, y: this.tileIndex.y - 1};
		if (frame === 4097 || frame === 4101 || frame === 4105) {
			this.baseSprite.frame = this.type.verticalBaseFrame;
			moveTo(toTileIndex);
		}
		
		// Left:
		toTileIndex = {x: this.tileIndex.x - 1, y: this.tileIndex.y};
		if (frame === 4098 || frame === 4102 || frame === 4106) {
			this.baseSprite.frame = this.type.horizontalBaseFrame;
			moveTo(toTileIndex);
		}
		
		// Down:
		toTileIndex = {x: this.tileIndex.x, y: this.tileIndex.y + 1};
		if (frame === 4099 || frame === 4103 || frame === 4107) {
			this.baseSprite.frame = this.type.verticalBaseFrame;
			moveTo(toTileIndex);
		}
	};
	
	
	// PLANT_SPITTER_SPROUT:
	// ********************************************************************************************
	this.npcUpdateTurn.PlantSpitterSprout = function () {
		if (this.growTime === undefined) {
			this.growTime = 10;
		} else if (this.growTime > 0) {
			this.growTime -= 1;
		} else {
			this.destroy();
			gs.createNPC(this.tileIndex, 'PlantSpitter');
		}
	};

	// PLANT_SPITTER:
	// ********************************************************************************************
	this.npcUpdateTurn.PlantSpitter = function () {
		if (this.growTime === undefined) {
			this.growTime = 10;
		} else if (this.growTime > 0) {
			this.growTime -= 1;
		} else {
			this.destroy();
			gs.createNPC(this.tileIndex, 'MaturePlantSpitter');
		}
	};
	
	// FIRE_BALL:
	// ********************************************************************************************
	this.npcUpdateTurn.HomingFireOrb = function () {
		this.currentHp -= 1;
		if (this.currentHp <= 0) {
			this.death();
		}
	};
	
	// SPIDER_EGG:
	// ********************************************************************************************
	this.npcUpdateTurn.SpiderEgg = function () {
		if (this.timeToHatch < SPIDER_EGG_HATCH_TURNS) {
			this.timeToHatch += 1;
		} 
		else {
			this.death();
			let npc = gs.createNPC(this.tileIndex, 'Spider');
			npc.isAgroed = true;
		}
	};
	
	// HELL_PORTAL:
	// ********************************************************************************************
	this.npcUpdateTurn.HellPortal = function () {
		if (this.timeToHatch <= HELL_PORTAL_HATCH_TURNS) {
			if (this.timeToHatch > 0) {
				this.popUpText((HELL_PORTAL_HATCH_TURNS - this.timeToHatch) + 1, 'White');
			}
			
			this.timeToHatch += 1;
		} 
		else {
			let indexList = [
				{x: 1, y: 0},
				{x: -1, y: 0},
				{x: 0, y: 1},
				{x: 0, y: -1},
				{x: -1, y: -1},
				{x: 1, y: -1},
				{x: -1, y: 1},
				{x: 1, y: 1},
			].map(function (index) {
				return {x: index.x + this.tileIndex.x, y: index.y + this.tileIndex.y};
			}, this);
			
			let count = 0;
			let faction = this.faction;
			let npcTypeName = util.randElem(['FireImp', 'StormImp', 'IceImp', 'IronImp']);
			for (let i = 0; i < 8; i += 1) {
				if (gs.isPassable(indexList[i])) {
					
					// When two or more hell portals are near each other they both try to spawn imps in the same location.
					// Because the Imp is not created until the animation is complete we need a way to block the tiles we're spawning on.
					// Placing myself in the tile to block it:
					gs.getTile(indexList[i]).character = this;
					
					gs.createSummonEffect(indexList[i], function () {
						// In case the effect occurs off screen we need to clear the hell-portal from this tile
						gs.getTile(indexList[i]).character = null;
						
						let npc = gs.createNPC(indexList[i], npcTypeName);
						npc.faction = faction;
						npc.isAgroed = true;
						npc.waitTime = 100;
						npc.exp = 0;
					});
					count += 1;
				}
				
				if (count === 4) {
					break;
				}
			}
			
			// Sound:
			gs.playSound(gs.sounds.cure, this.tileIndex);
			
			// Destroy Self:
			this.death();
		}
	};
};

// CREATE_NPC_ON_DEATH_TYPES:
// Special functionality that NPCs call when they die.
// ********************************************************************************************
gs.createNPCOnDeathTypes = function () {
	
	// CONTROL_MODULE_DEATH:
	// ****************************************************************************************
	this.abilityTypes.ControlModuleDeath = {};
	this.abilityTypes.ControlModuleDeath.use = function (actingChar) {
		let char;
		
		gs.createFire(actingChar.tileIndex, 20);
		gs.playSound(gs.sounds.explosion);
		
		char = gs.characterList.find(char => char.type.niceName === 'Cannon Module' && char.isAlive);
		if (char) {
			char.death();
			gs.createFire(char.tileIndex, 20);
		}
		
		char = gs.characterList.find(char => char.type.niceName === 'Pyro Module' && char.isAlive);
		if (char) {
			char.death();
			gs.createFire(char.tileIndex, 20);
		}
		
		char = gs.characterList.find(char => char.type.niceName === 'Repair Module' && char.isAlive);
		if (char) {
			char.death();
			gs.createFire(char.tileIndex, 20);
		}
		
		char = gs.characterList.find(char => char.type.niceName === 'Bomb Module' && char.isAlive);
		if (char) {
			char.death();
			gs.createFire(char.tileIndex, 20);
		}
		
		gs.abilityTypes.OpenLockedGate.use(actingChar);
	};
	
	// TRAIN_MODULE_DEATH:
	// ****************************************************************************************
	this.abilityTypes.TrainModuleDeath = {};
	this.abilityTypes.TrainModuleDeath.use = function (actingChar) {
		
		let char = gs.characterList.find(char => char.type.name === 'ControlModule');
		if (!char || !char.isAlive) {
			return;
		}
		
		if (actingChar.type.name === 'CannonModule') {
			gs.createNPC(actingChar.tileIndex, 'CannonModuleDead');
		}
		
		if (actingChar.type.name === 'PyroModule') {
			gs.createNPC(actingChar.tileIndex, 'PyroModuleDead');
		}
		
		if (actingChar.type.name === 'RepairModule') {
			gs.createNPC(actingChar.tileIndex, 'RepairModuleDead');
		}
		
		if (actingChar.type.name === 'BombModule') {
			gs.createNPC(actingChar.tileIndex, 'BombModuleDead');
		}
	};
	
	
	// EXPLODE:
	// ****************************************************************************************
	this.abilityTypes.Explode = {};
	this.abilityTypes.Explode.attributes = {damage: {}};
	this.abilityTypes.Explode.use = function (actingChar) {
		var damage = actingChar.burstDamage || this.attributes.damage.value(actingChar);
		
		gs.createExplosion(actingChar.tileIndex, 1.5, damage, {killer: actingChar});
	};
	
	// BIG_EXPLODE:
	// ****************************************************************************************
	this.abilityTypes.BigExplode = {};
	this.abilityTypes.BigExplode.attributes = {damage: {}};
	this.abilityTypes.BigExplode.use = function (actingChar) {
		var damage = actingChar.burstDamage || this.attributes.damage.value(actingChar);
		
		gs.createExplosion(actingChar.tileIndex, 1.5, damage, {killer: actingChar});
	};
	
	// ARCANE_ARROW_BURST:
	// ****************************************************************************************
	this.abilityTypes.ArcaneArrowBurst = {};
	this.abilityTypes.ArcaneArrowBurst.damageType = 'None';
	this.abilityTypes.ArcaneArrowBurst.attributes = {damage: {}};
	this.abilityTypes.ArcaneArrowBurst.use = function (actingChar) {
		var damage = actingChar.burstDamage || this.attributes.damage.value(actingChar),
			hitTileIndex = {x: actingChar.tileIndex.x + actingChar.moveDelta.x, y: actingChar.tileIndex.y + actingChar.moveDelta.y},
			hitChar = gs.getChar(hitTileIndex);
		
		if (hitChar) {
			hitChar.takeDamage(damage, this.damageType, {neverBlink: true});
			
			if (hitChar.isAlive) {
				hitChar.body.applyKnockBack(actingChar.moveDelta, 2);
			}
			
		}
	};
	
	// FIRE_ARROW_BURST:
	// ****************************************************************************************
	this.abilityTypes.FireArrowBurst = {};
	this.abilityTypes.FireArrowBurst.attributes = {damage: {}};
	this.abilityTypes.FireArrowBurst.use = function (actingChar) {
		var damage = actingChar.burstDamage || this.attributes.damage.value(actingChar),
			hitTileIndex = {x: actingChar.tileIndex.x + actingChar.moveDelta.x, y: actingChar.tileIndex.y + actingChar.moveDelta.y},
			hitChar = gs.getChar(hitTileIndex);
		
		if (gs.isStaticPassable(hitTileIndex)) {
			gs.createFire(hitTileIndex, damage);
		}
		else {
			gs.createFire(actingChar.tileIndex, damage);
		}
	};
	
	// SHOCK_ARROW_BURST:
	// ****************************************************************************************
	this.abilityTypes.ShockArrowBurst = {};
	this.abilityTypes.ShockArrowBurst.attributes = {damage: {}};
	this.abilityTypes.ShockArrowBurst.use = function (actingChar) {
		var damage = actingChar.burstDamage || this.attributes.damage.value(actingChar),
			hitTileIndex = {x: actingChar.tileIndex.x + actingChar.moveDelta.x, y: actingChar.tileIndex.y + actingChar.moveDelta.y},
			hitChar = gs.getChar(hitTileIndex);
		
		if (gs.isStaticPassable(hitTileIndex)) {
			gs.createShock(hitTileIndex, damage);
		}
		else {
			gs.createShock(actingChar.tileIndex, damage);
		}
	};
	
	// ICE_ARROW_BURST:
	// ****************************************************************************************
	this.abilityTypes.IceArrowBurst = Object.create(this.abilityTypes.ArcaneArrowBurst);
	this.abilityTypes.IceArrowBurst.damageType = 'Cold';

	// POISON_ARROW_BURST:
	// ****************************************************************************************
	this.abilityTypes.PoisonArrowBurst = {};
	this.abilityTypes.PoisonArrowBurst.attributes = {damage: {}};
	this.abilityTypes.PoisonArrowBurst.use = function (actingChar) {
		var damage = actingChar.burstDamage || this.attributes.damage.value(actingChar),
			hitTileIndex = {x: actingChar.tileIndex.x + actingChar.moveDelta.x, y: actingChar.tileIndex.y + actingChar.moveDelta.y},
			hitChar = gs.getChar(hitTileIndex);
		
		if (hitChar) {
			hitChar.addPoisonDamage(damage);
			
			// Particle:
			gs.createPoisonEffect(hitChar.tileIndex);
		}
		else {
			gs.createPoisonEffect(actingChar.tileIndex);
		}
	};
	
	// EXPLODE_CROSS:
	// ****************************************************************************************
	this.abilityTypes.CrossExplode = {};
	this.abilityTypes.CrossExplode.use = function (actingChar) {		
		gs.createExplosionCross(actingChar.tileIndex, 3, gs.getTrapDamage('FirePot'), {killer: actingChar});
	};
	
	// BREAK_GAS_POT:
	// ****************************************************************************************
	this.abilityTypes.BreakGasPot = {};
	this.abilityTypes.BreakGasPot.use = function (actingChar) {
		gs.createCloud(actingChar.tileIndex, 'PoisonGas', gs.getTrapDamage('GasPot'), 15, {firstTurn: true});
	};
	
	// BLOAT:
	// ****************************************************************************************
	this.abilityTypes.Bloat = {};
	this.abilityTypes.Bloat.attributes = {damage: {}};
	this.abilityTypes.Bloat.maxSpread = 1;
	this.abilityTypes.Bloat.use = function (actingChar) {
		var damage = actingChar.burstDamage || this.attributes.damage.value(actingChar);
		
		gs.createCloud(actingChar.tileIndex, 'PoisonGas', damage, 5, {maxSpread: this.maxSpread, firstTurn: true});
		
		gs.playSound(gs.sounds.fire, actingChar.tileIndex);
	};
	
	// SKELETON_CORPSE:
	// ****************************************************************************************
	this.abilityTypes.SkeletonCorpse = {};
	this.abilityTypes.SkeletonCorpse.use = function (actingChar) {
		var obj;
		if (!gs.getObj(actingChar.tileIndex) && !gs.isPit(actingChar.tileIndex)) {
			obj = gs.createObject(actingChar.tileIndex, 'SkeletonCorpse');
			
			if (actingChar.type.name === 'FrostLich') {
				obj.sprite.frame = 394;
			}
			else if (actingChar.type.name === 'InfernoLich') {
				obj.sprite.frame = 395;
			}
			else if (actingChar.type.name === 'StormLich') {
				obj.sprite.frame = 396;
			}
			else if (actingChar.type.name === 'ToxicLich') {
				obj.sprite.frame = 397;
			}
			
			obj.npcTypeName = actingChar.type.name;
		}
	};
	
	// OPEN_LOCKED_GATE:
	// ****************************************************************************************
	this.abilityTypes.OpenLockedGate = {};
	this.abilityTypes.OpenLockedGate.use = function (actingChar) {
		// Slime King only opens door if he is the last one
		if (actingChar.type.name === 'ExpanderisTheSlimeKing' && gs.characterList.filter(char => char.type.name === 'ExpanderisTheSlimeKing' && char.isAlive).length >= 1) {
			return;
		}
		
		let objList = gs.objectList.filter(obj => util.inArray(obj.type.name, ['MetalBarsSwitchGate', 'WoodenBarsSwitchGate']));
		objList.forEach(function (obj) {
			obj.openDoor();
		}, this);
	};
	
	// BREAK_GOBLET_SHIELD:
	// ****************************************************************************************
	this.abilityTypes.BreakGobletShield = {};
	this.abilityTypes.BreakGobletShield.use = function (actingChar) {
		// Destroy existing shielded altar:
		gs.objectList.filter(obj => obj.type.name === 'ShieldedAltar').forEach(function (obj) {
			let tileIndex = obj.tileIndex;
			let frame = obj.sprite.frame;
			gs.destroyObject(obj);

			if (frame === 407) {
				gs.createObject(tileIndex, 'Altar', 1047);
				
			}
			else if (frame === 408) {
				gs.createObject(tileIndex, 'Altar', 1048);
				gs.createFloorItem(tileIndex, Item.createItem('GobletOfYendor'));
				gs.createShieldBreakEffect(tileIndex);
				
			}
			else {
				gs.createObject(tileIndex, 'Altar', 1049);
			}
		}, this);
		
		// Animation:
		
	};
	
};