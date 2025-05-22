/*global gs, console, game, util*/
/*global PlayerTargeting*/
/*global LOS_DISTANCE, FACTION, PURPLE_SELECT_BOX_FRAME, PURPLE_BOX_FRAME, RED_SELECT_BOX_FRAME*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// CREATE_ITEM_ABILITY_TYPES:
// ************************************************************************************************
gs.createItemAbilityTypes = function () {	
	// SCROLL_OF_FEAR:
	// ********************************************************************************************
	this.abilityTypes.ScrollOfFear = {};
	this.abilityTypes.ScrollOfFear.useImmediately = true;
	this.abilityTypes.ScrollOfFear.range = LOS_DISTANCE;
	this.abilityTypes.ScrollOfFear.showTarget  = function () {
		gs.liveCharacterList().forEach(function (character) {
			if (gs.getTile(character.tileIndex).visible && character.isAlive && character.faction === FACTION.HOSTILE && !character.type.neverRun && !character.type.isImmobile) {
				gs.targetSprites.create(character.tileIndex, PURPLE_SELECT_BOX_FRAME);
			}	
		}, this);
	};
	this.abilityTypes.ScrollOfFear.useOn = function (actingChar, targetTileIndex) {
		let duration = this.attributes.duration.value(actingChar);
		
		gs.liveCharacterList().forEach(function (character) {
			if (gs.getTile(character.tileIndex).visible && character.faction === FACTION.HOSTILE) {
				// Immune:
				if (character.type.neverRun || character.type.isImmobile) {
					character.agroPlayer();
					character.popUpText('Immune', 'White');
				}
				// Apply effect:
				else {
					gs.createParticlePoof(character.tileIndex, 'PURPLE');
					character.agroPlayer();
					character.statusEffects.add('Feared', {duration: duration});
				}
			}	
		}, this);
		
		// Play Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
		
		// Caster particles and text:
		gs.pc.popUpText('Fear!', 'White');
		gs.createParticlePoof(actingChar.tileIndex, 'PURPLE');
	};
	
	// DOMINATION:
	// ********************************************************************************************
	this.abilityTypes.Domination = {};
	this.abilityTypes.Domination.range = LOS_DISTANCE;
	this.abilityTypes.Domination.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.Domination.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex)
			&& gs.getChar(targetTileIndex).canDominate();
	};
	this.abilityTypes.Domination.useOn = function (actingChar, targetTileIndex) {
		// Dominated:
		gs.getChar(targetTileIndex).dominate('ScrollOfDomination');
		
		// Sound:
		gs.playSound(gs.sounds.cure);
		
		// Particles:
		gs.createManaEffect(targetTileIndex);
	};
	
	// SUMMON_VINES:
	// ********************************************************************************************
	this.abilityTypes.SummonVines = {};
	this.abilityTypes.SummonVines.range = 5.5;
	this.abilityTypes.SummonVines.aoeRange = 1.5;
	this.abilityTypes.SummonVines.showTarget = function (targetTileIndex) {
		var indexList;
		
		// Valid Target:
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			indexList = gs.getIndexListInRadius(targetTileIndex, this.aoeRange(gs.pc));
			indexList = indexList.filter(index => this.isValidVineIndex(index));
			
			indexList.forEach(function (index) {
				if (util.vectorEqual(targetTileIndex, index)) {
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
	this.abilityTypes.SummonVines.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleTileSmite.call(this, actingChar, targetTileIndex)
			&& this.isValidVineIndex(targetTileIndex);
	};
	this.abilityTypes.SummonVines.useOn = function (actingChar, targetTileIndex) {
	
		// Targets:
		let indexList = gs.getIndexListInRadius(targetTileIndex, this.aoeRange(actingChar));
		indexList = indexList.filter(tileIndex => this.isValidVineIndex(tileIndex));
		
		// Effect:
		indexList.forEach(function (tileIndex) {
			if (gs.getObj(tileIndex, obj => obj.type.canOverWrite)) {
				gs.destroyObject(gs.getObj(tileIndex));
			}
			
			gs.createObject(tileIndex, 'Vine');
			
			gs.createParticlePoof(tileIndex, 'GREEN');
		}, this);
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	this.abilityTypes.SummonVines.isValidVineIndex = function (tileIndex) {
		return gs.isStaticPassable(tileIndex)
			&& (!gs.getObj(tileIndex) || gs.getObj(tileIndex, obj => obj.type.canOverWrite))
			&& !gs.isPit(tileIndex)
			&& !gs.isUncoveredLiquid(tileIndex);
	};
	
	
	
	// HELL_FIRE:
	// ********************************************************************************************
	this.abilityTypes.HellFire = {};
	this.abilityTypes.HellFire.range = LOS_DISTANCE;
	this.abilityTypes.HellFire.showTarget = this.abilityShowTarget.LoS;
	this.abilityTypes.HellFire.canUseOn = function (actingChar, targetTileIndex) {
		return gs.getChar(targetTileIndex).type.name !== 'GobletShield';
	};
	this.abilityTypes.HellFire.useImmediately = true;
	this.abilityTypes.HellFire.useOn = function (actingChar, targetTileIndex) {
		var damage, charList;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		// Targets:
		charList = gs.liveCharacterList().filter(char => gs.getTile(char.tileIndex).visible && char.faction === FACTION.HOSTILE && this.canUseOn(actingChar, char.tileIndex));
		
		// Effect:
		charList.forEach(function (character) {
			gs.createFire(character.tileIndex, damage, {killer:gs.pc});
		}, this);
		
		game.camera.shake(0.02, 300);
		game.camera.flash(0xff0000, 20);
		gs.playSound(gs.sounds.explosion, gs.pc.tileIndex);
	};
	
	// FLASH_FREEZE:
	// ********************************************************************************************
	this.abilityTypes.FlashFreeze = {};
	this.abilityTypes.FlashFreeze.isSpell = true;
	this.abilityTypes.FlashFreeze.useImmediately = true;
	this.abilityTypes.FlashFreeze.range = LOS_DISTANCE;
	this.abilityTypes.FlashFreeze.showTarget = this.abilityShowTarget.LoS;
	this.abilityTypes.FlashFreeze.canUseOn = function (actingChar, targetTileIndex) {
		return gs.abilityCanUseOn.SingleCharacterSmite.call(this, actingChar, targetTileIndex)
			&& gs.getChar(targetTileIndex).type.name !== 'GobletShield';
	};
	this.abilityTypes.FlashFreeze.useOn = function (actingChar, targetTileIndex) {
		// Attributes:
		let duration = this.attributes.duration.value(actingChar);
		
		gs.liveCharacterList().forEach(function (character) {
			if (gs.getTile(character.tileIndex).visible && character.faction === FACTION.HOSTILE && this.canUseOn(actingChar, character.tileIndex)) {
				gs.createParticlePoof(character.tileIndex, 'WHITE');
				
				character.statusEffects.add('Frozen', {duration: duration});
				
				character.agroPlayer();
			}	
		}, this);
		
		// Sound:
		gs.playSound(gs.sounds.ice, actingChar.tileIndex);
		
		// Camera Effects:
		game.camera.shake(0.010, 100);
		game.camera.flash(0xffffff, 300);
	};
	
	// BLINK:
	// ********************************************************************************************
	this.abilityTypes.Blink = {};
	this.abilityTypes.Blink.range = LOS_DISTANCE;
	this.abilityTypes.Blink.dontEndTurn = true;
	this.abilityTypes.Blink.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.Blink.canUseOn = function (actingChar, targetTileIndex) {
		return gs.isInBounds(targetTileIndex)
			&& gs.isPassable(targetTileIndex)
			&& gs.getTile(targetTileIndex).visible;
	};
	this.abilityTypes.Blink.useOn = function (actingChar, targetTileIndex) {
		// Sound:
		gs.playSound(gs.sounds.teleport, gs.pc.tileIndex);
		
		// Pop Up Text:
		actingChar.popUpText('Blink!');
		
		
		
		// Anim Effect:
		gs.createSummonEffect(gs.pc.tileIndex, function () {
			// At Dest:
			gs.createSummonEffect(targetTileIndex);
			
			actingChar.teleportTo(targetTileIndex);
		}, this, 8);
	};
	
	// HEALING:
	// ********************************************************************************************
	this.abilityTypes.Healing = {};
	this.abilityTypes.Healing.useImmediately = true;
	this.abilityTypes.Healing.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.Healing.useOn = function (actingChar) {
		gs.pc.cure();
		
		gs.pc.healHp(gs.pc.maxHp);
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	
		// Effect:
		gs.createHealingEffect(gs.pc.tileIndex);
		
	};
	this.abilityTypes.Healing.desc = "Completely restores your HP and cures physical effects.";
	
	// ENERGY:
	// ********************************************************************************************
	this.abilityTypes.Energy = {};
	this.abilityTypes.Energy.useImmediately = true;
	this.abilityTypes.Energy.showTarget = this.abilityShowTarget.SelfTarget;
	this.abilityTypes.Energy.useOn = function (actingChar) {
		gs.pc.mentalCure();
		
		gs.pc.restoreMp(gs.pc.maxMp);
		gs.pc.resetAllCoolDowns();
		
		// Sound:
		gs.playSound(gs.sounds.cure, this.tileIndex);
		
		// Effect:
		gs.createManaEffect(gs.pc.tileIndex);
	};
	this.abilityTypes.Energy.desc = "- Completely restores your MP\n- Resets all cooldowns\n- Cures mental effects.";
	

	
	// PLAYER_SUMMON_MONSTERS:
	// ********************************************************************************************
	this.abilityTypes.PlayerSummonMonsters = {};
	this.abilityTypes.PlayerSummonMonsters.useImmediately = true;
	this.abilityTypes.PlayerSummonMonsters.showTarget = function (actingChar) {
		let indexList = this.getIndexList(actingChar);
		let num = this.attributes.numSummoned.value(actingChar);
		
		for (let i = 0; i < Math.min(num, indexList.length); i += 1) {
			gs.targetSprites.create(indexList[i], PURPLE_SELECT_BOX_FRAME);
		}
	};

	
	this.abilityTypes.PlayerSummonMonsters.getIndexList = function (actingChar) {
		
		let indexList = [
			// Ortho:
			{x: 0, y: -1},
			{x: 1, y: 0},
			{x: 0, y: 1},
			{x: -1, y: 0},
			
			// Angle:
			{x: -1, y: -1},
			{x: 1, y: -1},
			{x: 1, y: 1},
			{x: -1, y: 1},
			
			// Big Ortho:
			{x: 0, y: -2},
			{x: 2, y: 0},
			{x: 0, y: 2},
			{x: -2, y: 0},
			
		].map(function (tileIndex) {
			return {x: tileIndex.x + actingChar.tileIndex.x, y: tileIndex.y + actingChar.tileIndex.y};
		});
		
		// Only in LoS:
		indexList = indexList.filter(tileIndex => gs.isRayStaticPassable(tileIndex, actingChar.tileIndex) || gs.isRayClear(tileIndex, actingChar.tileIndex));
		
		// Get safe tileIndex:
		let safeList = indexList;
		safeList = safeList.filter(index => gs.isPassable(index));
		safeList = safeList.filter(index => gs.isIndexSafeForCharType(index, gs.npcTypes[this.npcTypeName]));
		
		// Get unsafe tileIndex:
		let unsafeList = indexList;
		unsafeList = unsafeList.filter(index => gs.isPassable(index));
		unsafeList = unsafeList.filter(index => !gs.isIndexSafe(index, gs.npcTypes[this.npcTypeName]));
		
		return safeList.concat(unsafeList);
		
	};
	this.abilityTypes.PlayerSummonMonsters.canUse = function (actingChar) {
		return this.getIndexList(actingChar).length > 0;
	};
	this.abilityTypes.PlayerSummonMonsters.useOn = function (actingChar) {		
		let indexList = this.getIndexList(actingChar);
		let num = this.attributes.numSummoned.value(actingChar);
		let level = this.attributes.monsterLevel.value(actingChar);
		let npcTypeName = this.npcTypeName;
		
		let summonFunc = function (tileIndex) {
			let npc = gs.createNPC(tileIndex, npcTypeName, {summonerId: actingChar.id, level: level});
			npc.faction = FACTION.PLAYER;
			actingChar.summonIDList.push(npc.id);
			npc.summonerId = actingChar.id;
			npc.isAgroed = true;
			npc.popUpText('Summoned', 'White');
		};
		
		// Summon blades
		for (let i = 0; i < Math.min(num, indexList.length); i += 1) {
			gs.createSummonEffect(indexList[i], summonFunc.bind(this, indexList[i]), this);
		}
		
		// Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
	};
	

	
	// SUMMON_BLADES:
	// Used by: Wand of Blades
	// ********************************************************************************************
	this.abilityTypes.SummonBlades = Object.create(this.abilityTypes.PlayerSummonMonsters);
	this.abilityTypes.SummonBlades.npcTypeName = 'SpectralBlade';
	
	// SUMMON_RATS:
	// Used by: Pipes of The Scavengers
	// ********************************************************************************************
	this.abilityTypes.SummonRats = Object.create(this.abilityTypes.PlayerSummonMonsters);
	this.abilityTypes.SummonRats.npcTypeName = 'Rat';
	
	// SUMMON_SEWER_RATS:
	// Used by: Pipes of The Sewers
	// ********************************************************************************************
	this.abilityTypes.SummonSewerRats = Object.create(this.abilityTypes.PlayerSummonMonsters);
	this.abilityTypes.SummonSewerRats.npcTypeName = 'SewerRat';
	
	// SUMMON_WOLVES:
	// Used by: Totem of The Beasts
	// ********************************************************************************************
	this.abilityTypes.SummonWolves = Object.create(this.abilityTypes.PlayerSummonMonsters);
	this.abilityTypes.SummonWolves.npcTypeName = 'Wolf';


	// LIFE_DRAIN:
	// Used by the wand of draining to drain the health of enemies in a radius around the player.
	// ********************************************************************************************
	this.abilityTypes.LifeDrain = {};
	this.abilityTypes.LifeDrain.useImmediately = true;
	this.abilityTypes.LifeDrain.aoeRange = 3.0;
	this.abilityTypes.LifeDrain.showTarget = function (targetTileIndex) {
		var indexList = gs.getIndexListInRadius(gs.pc.tileIndex, this.aoeRange(gs.pc));
		
		indexList.forEach(function (index) {
			if (this.canUseOn(gs.pc, index)) {
				if (gs.getChar(index) && gs.pc.isHostileToMe(gs.getChar(index))) {
					gs.targetSprites.create(index, PURPLE_SELECT_BOX_FRAME);
				}
				else {
					gs.targetSprites.create(index, PURPLE_BOX_FRAME);
				}
			}
		}, this);
	};
	this.abilityTypes.LifeDrain.canUseOn = this.abilityCanUseOn.SingleTileSmite;
	this.abilityTypes.LifeDrain.useOn = function (actingChar, targetTileIndex) {
		var indexList, damage, totalDamage = 0;
		
		// Attributes:
		damage = this.attributes.damage.value(actingChar);
		
		// Targets:
		indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.aoeRange(actingChar));
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		indexList = indexList.filter(index => gs.getChar(index) && actingChar.isHostileToMe(gs.getChar(index)));
		
		// Effect:
		indexList.forEach(function (tileIndex) {
			let char = gs.getChar(tileIndex);
			
			if (char && char.isAlive) {
				// Damage:
				totalDamage += char.takeDamage(damage, 'Toxic');
			
				// Anim:
				gs.createPoisonEffect(tileIndex);
			}
			
		}, this);
		
		actingChar.healHp(totalDamage);
		
		// Play Sound:
		gs.playSound(gs.sounds.cure, actingChar.tileIndex);
		
		// Caster particles and text:
		gs.createHealingEffect(actingChar.tileIndex);
		actingChar.popUpText('+' + totalDamage + 'HP', 'Green');
	};
	
	// CHAKRAM:
	// ********************************************************************************************
	this.abilityTypes.Chakram = Object.create(this.abilityTypes.TunnelShot);
	this.abilityTypes.Chakram.desc = null;
	this.abilityTypes.Chakram.canUse = null;
	this.abilityTypes.Chakram.useOn = function (actingChar, targetTileIndex) {
		
		// Attributes:
		let damage = this.attributes.damage.value(actingChar);
		
		// Projectile Flags:
		let flags = {
			isTunnelShot: true,
			hitTileIndexList: this.getTileIndexList(actingChar, targetTileIndex),
			killer: actingChar
		};
		
		gs.createProjectile(actingChar, targetTileIndex, 'Chakram', damage, this.range(actingChar), flags);
		
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
				
		// Play Sound:
		gs.playSound(gs.sounds.throw, actingChar.tileIndex);
	};
	
	// THROWING_NET:
	// ********************************************************************************************
	this.abilityTypes.ThrowingNet = {};
	this.abilityTypes.ThrowingNet.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.ThrowingNet.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.ThrowingNet.canUseOn = gs.abilityCanUseOn.SingleCharacterRay;
	this.abilityTypes.ThrowingNet.useOn = function (actingChar, targetTileIndex) {
		// Create Projectile:
		gs.createProjectile(actingChar, targetTileIndex, 'Net', 0, this.range(actingChar));
		
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Play Sound:
		gs.playSound(gs.sounds.throw, actingChar.tileIndex);
	};
	
	// JAVELIN:
	// ********************************************************************************************
	this.abilityTypes.Javelin = {};
	this.abilityTypes.Javelin.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.Javelin.showTarget = this.abilityShowTarget.SingleTarget;
	this.abilityTypes.Javelin.canUseOn = function (actingChar, targetTileIndex) {
		return PlayerTargeting.isLineClear(targetTileIndex, true)
			&& gs.isInBounds(targetTileIndex)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& gs.isStaticProjectilePassable(targetTileIndex)
			&& gs.getChar(targetTileIndex) !== actingChar
			&& (gs.getChar(targetTileIndex, char => char !== actingChar) || PlayerTargeting.isValidTrapTarget(targetTileIndex));
	};
	this.abilityTypes.Javelin.useOn = function (actingChar, targetTileIndex) {
		let damage = this.attributes.damage.value(actingChar);
		
		// Create Projectile:
		gs.createProjectile(actingChar, targetTileIndex, 'Dart', damage, this.range(actingChar), {killer: actingChar, perfectAim: gs.pc.hasPerfectAim});
		
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Play Sound:
		gs.playSound(gs.sounds.throw, actingChar.tileIndex);
	};
	
	// BOMB:
	// ********************************************************************************************
	this.abilityTypes.Bomb = {};
	this.abilityTypes.Bomb.aoeRange = 1.0;
	this.abilityTypes.Bomb.getTarget = this.abilityGetTarget.SingleTarget;
	this.abilityTypes.Bomb.showTarget = this.abilityShowTarget.TBAoE;
	this.abilityTypes.Bomb.canUseOn = gs.abilityCanUseOn.SingleTileRay;
	this.abilityTypes.Bomb.useOn = function (actingChar, targetTileIndex) {
		let damage = this.attributes.damage.value(actingChar);
		
		// Create Projectile:
		gs.createProjectile(actingChar, targetTileIndex, 'PlayerBomb', damage, this.range(actingChar), {killer: actingChar});
		
		// Bounce and Face:
		actingChar.body.faceTileIndex(targetTileIndex);
		actingChar.body.bounceTowards(targetTileIndex);
		
		// Play Sound:
		gs.playSound(gs.sounds.throw, actingChar.tileIndex);
	};
};