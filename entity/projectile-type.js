/*global gs, game, console, util*/
/*global PARTICLE_FRAMES, DAMAGE_TYPE, FACTION*/
/*jshint esversion: 6, loopfunc: true*/

'use strict';
// CREATE_PROJECTILE_TYPES:
// ************************************************************************************************
gs.createProjectileTypes = function () {
    this.createProjectileEffects();
    
    // Projectile Types:
    this.projectileTypes = {
		Dart: {
			frame: 1728,
			damageType: DAMAGE_TYPE.PHYSICAL,
			effect: null, 
			particleFrame: PARTICLE_FRAMES.WHITE,
			isFlammable: true
		},
		
		BoneArrow: {
			frame: 1734,
			damageType: DAMAGE_TYPE.PHYSICAL,
			effect: null, 
			particleFrame: PARTICLE_FRAMES.WHITE,
		},
		
		// Ignores protection
		Bolt: {
			frame: 1728,
			damageType: DAMAGE_TYPE.PHYSICAL,
			noMitigation: true,
			effect: null, 
			particleFrame: PARTICLE_FRAMES.WHITE,
			isFlammable: true
		},
		
		// Ignores protection
		Shot: {
			frame: 1743,
			damageType: DAMAGE_TYPE.PHYSICAL,
			noMitigation: true,
			effect: null, 
			particleFrame: PARTICLE_FRAMES.WHITE,
		},
		
		VineDart: {
			frame: 1728,
			damageType: DAMAGE_TYPE.PHYSICAL,
			effect: this.projectileEffects.Vines, 
			particleFrame: PARTICLE_FRAMES.WHITE,
			isFlammable: true
		},
		
		WebDart: {
			frame: 1728,
			damageType: DAMAGE_TYPE.PHYSICAL,
			effect: this.projectileEffects.WebDart, 
			particleFrame: PARTICLE_FRAMES.WHITE,
			isFlammable: true
		},
		
		ConfusionDart: {
			frame: 1728,
			damageType: DAMAGE_TYPE.PHYSICAL,
			effect: this.projectileEffects.Confusion, 
			particleFrame: PARTICLE_FRAMES.WHITE,
			isFlammable: true
		},
		
		Axe: {
			frame: 1749,
			damageType: DAMAGE_TYPE.PHYSICAL,
			effect: null, 
			particleFrame: PARTICLE_FRAMES.WHITE,
			isFlammable: true
		},
		
		Stone: {
			frame: 1743,
			damageType: DAMAGE_TYPE.PHYSICAL,
			effect: null, 
			particleFrame: PARTICLE_FRAMES.WHITE
		},
		
		Oil: {
			frame: 1743,
			damageType: null,
			particleFrame: PARTICLE_FRAMES.WHITE,
			effect: this.projectileEffects.Oil,
			hitTargetTileIndex: true,
			isFlammable: true,
			neverMiss: true,
		},
        
        Chakram: {
			frame: 116,
			damageType: DAMAGE_TYPE.PHYSICAL,
			effect: null,
			particleFrame: PARTICLE_FRAMES.WHITE
		},
		
		SleepingDart: {
			frame: 1728,
			damageType: null,
			effect: this.projectileEffects.SleepingDart,
			particleFrame: PARTICLE_FRAMES.WHITE,
			neverMiss: true,
			isFlammable: true
		},
		
		SleepBomb: {
			frame: 1740,
			damageType: null,
			effect: this.projectileEffects.SleepBomb,
			particleFrame: PARTICLE_FRAMES.WHITE,
			neverMiss: true,
			hitTargetTileIndex: true,
		},
		
		SpiderWeb: {
			frame: 1730,
			damageType: null,
			effect: this.projectileEffects.Web,
			particleFrame: PARTICLE_FRAMES.WHITE,
			isFlammable: true
		},
		
		FlameWeb: {
			frame: 1752,
			damageType: null,
			effect: this.projectileEffects.FlameWeb,
			particleFrame: PARTICLE_FRAMES.RED,
			isFlammable: true
		},
		
		Net: {
			frame: 1738,
			damageType: null,
			effect: this.projectileEffects.Net,
			particleFrame: PARTICLE_FRAMES.WHITE,
			life: 5,
			isFlammable: true
		},
		
		FireArrow: {
			frame: 1732,
			damageType: DAMAGE_TYPE.FIRE,
			effect: this.projectileEffects.Fire,
			particleFrame: PARTICLE_FRAMES.RED,
			hitTargetTileIndex: true,
		},

		
		FireBall: {
			frame: 1744,
			damageType: DAMAGE_TYPE.FIRE,
			effect: this.projectileEffects.FireBall,
			particleFrame: PARTICLE_FRAMES.RED,
			hitTargetTileIndex: true,
			neverMiss: true,
			light: {color: '#ff0000', radius: 120, startAlpha: 66},
		},
		
		KnockBackCannonBall: {
			frame: 1743,
			damageType: DAMAGE_TYPE.PHYSICAL,
			effect: null, 
			particleFrame: PARTICLE_FRAMES.WHITE,
			knockBack: 2,
			knockBackChance: 0.50,
		},
		
		ExplosiveCannonBall: {
			frame: 1743,
			damageType: DAMAGE_TYPE.FIRE,
			effect: this.projectileEffects.FireBall,
			particleFrame: PARTICLE_FRAMES.WHITE,
			hitTargetTileIndex: true,
		},
		
		SparkBall: {
			frame: 1733,
			damageType: DAMAGE_TYPE.SHOCK,
			effect: this.projectileEffects.SparkBall,
			particleFrame: PARTICLE_FRAMES.WHITE,
			hitTargetTileIndex: true,
			light: {color: '#ffffff', radius: 30, startAlpha: 66},
		},
		
		Spark: {
			frame: 1733,
			damageType: DAMAGE_TYPE.SHOCK,
			effect: this.projectileEffects.Shock,
			particleFrame: PARTICLE_FRAMES.WHITE,
			hitTargetTileIndex: true,
			light: {color: '#ffffff', radius: 30, startAlpha: 66},
		},
		
		IceArrow: {
			frame: 1734,
			damageType: DAMAGE_TYPE.COLD,
			particleFrame: PARTICLE_FRAMES.WHITE,
			light: {color: '#ffffff', radius: 60, startAlpha: 44},
		},
		
		FreezeArrow: {
			frame: 1734,
			damageType: DAMAGE_TYPE.COLD,
			effect: this.projectileEffects.Freeze,
			particleFrame: PARTICLE_FRAMES.WHITE,
			light: {color: '#ffffff', radius: 60, startAlpha: 44},
		},
		
		Snowball: {
			frame: 1742,
			damageType: DAMAGE_TYPE.COLD,
			particleFrame: PARTICLE_FRAMES.WHITE,
			isFlammable: true
		},
		
		Acid: {
			frame: 1736,
			damageType: DAMAGE_TYPE.TOXIC,
			particleFrame: PARTICLE_FRAMES.GREEN,
			light: {color: '#aaff00', radius: 60, startAlpha: 66},
		},
		
		PoisonArrow: {
			frame: 1736,
			damageType: DAMAGE_TYPE.TOXIC,
			particleFrame: PARTICLE_FRAMES.GREEN,
			effect: this.projectileEffects.Poison,
			light: {color: '#aaff00', radius: 60, startAlpha: 66},
		},
		
		StrongPoisonArrow: {
			frame: 1736,
			damageType: DAMAGE_TYPE.TOXIC,
			particleFrame: PARTICLE_FRAMES.GREEN,
			effect: this.projectileEffects.StrongPoison,
			light: {color: '#aaff00', radius: 60, startAlpha: 66},
		},
		
		LifeSpike: {
			frame: 1736,
			damageType: DAMAGE_TYPE.TOXIC,
			particleFrame: PARTICLE_FRAMES.GREEN,
			effect: this.projectileEffects.LifeSpike,
			light: {color: '#aaff00', radius: 60, startAlpha: 66},
		},
		
		LifeTap: {
			frame: 1736,
			damageType: DAMAGE_TYPE.TOXIC,
			particleFrame: PARTICLE_FRAMES.GREEN,
			effect: this.projectileEffects.LifeTap,
			light: {color: '#aaff00', radius: 60, startAlpha: 66},
		},
			
		Bomb: {
			frame: 1740,
			hitTargetTileIndex: true,
			particleFrame: PARTICLE_FRAMES.WHITE,
			effect: this.projectileEffects.CreateBomb,
			perfectAim: true,
			isFlammable: true
		},
		
		PlayerBomb: {
			frame: 1740,
			hitTargetTileIndex: true,
			particleFrame: PARTICLE_FRAMES.WHITE,
			effect: this.projectileEffects.FireBall,
			isFlammable: true
		},
		
		PoisonGasBall: {
			frame: 1735,
			hitTargetTileIndex: true,
			particleFrame: PARTICLE_FRAMES.PURPLE,
			effect: this.projectileEffects.createPoisonGas
		},
	
		MagicMissile: {
			frame: 1735,
			particleFrame: PARTICLE_FRAMES.PURPLE,
			damageType: DAMAGE_TYPE.PHYSICAL,
			effect: null,
			light: {color: '#ff00ff', radius: 60, startAlpha: 66},
			hitEffect: function () {
				var light = gs.createLightCircle(this.sprite.position, '#ff00ff', 30, 10);
				light.fade = false;
			}
		},
		
		SlimeBomb: {
			frame: 1736,
			particleFrame: PARTICLE_FRAMES.GREEN,
			neverMiss: true,
			effect: this.projectileEffects.createSlime
		},
		

	};
	
	this.projectileTypes.BearTrap = {
		frame: 1750,
		damageType: null,
		particleFrame: PARTICLE_FRAMES.WHITE,
		hitTargetTileIndex: true,
		effect: function (targetTile, projectile) {
			// Destroy existing object:
			if (gs.getObj(targetTile.tileIndex)) {
				gs.destroyObject(gs.getObj(targetTile.tileIndex));
			}
			
			let obj = gs.createObject(targetTile.tileIndex, 'BearTrap');
			obj.placedByPlayer = true;
			obj.damage = projectile.damage;
		}
	};
	
	gs.nameTypes(this.projectileTypes);
};

// CREATE_PROJECTILE_EFFECTS:
// ************************************************************************************************
gs.createProjectileEffects = function () {
    this.projectileEffects = {};
	
	// FREEZE:
	// ********************************************************************************************
	this.projectileEffects.Freeze = function (targetChar, projectile) {
		// Damage Character:
		if (targetChar.takeDamage) {
			targetChar.takeDamage(projectile.damage, DAMAGE_TYPE.COLD, projectile.flags);
		}
		
		// Added test for traps:
		if (targetChar.statusEffects && !targetChar.statusEffects.has('Frozen') && targetChar.isAlive && util.frac() <= 0.10) {
			targetChar.statusEffects.add('Frozen', {duration: 2});
			
			// Sound:
			gs.playSound(gs.sounds.ice, targetChar.tileIndex);

			// Camera Effects:
			game.camera.shake(0.010, 100);
			game.camera.flash(0xffffff, 300);
		}
	};
	
	// CONFUSION:
	// ********************************************************************************************
	this.projectileEffects.Confusion = function (targetChar, projectile) {
		// Damage Character:
		if (targetChar.takeDamage) {
			targetChar.takeDamage(projectile.damage, DAMAGE_TYPE.PHYSICAL, projectile.flags);
			
			// Confusion:
			if (util.frac() < 0.25) {
				gs.playSound(gs.sounds.cure);

				targetChar.statusEffects.add('Confusion', {duration: 5});
				gs.createParticlePoof(targetChar.tileIndex, 'PURPLE'); 
			}
		}
	};
	

	
	// Net:
	// ********************************************************************************************
	this.projectileEffects.Net = function (targetChar, projectile) {
		// Added test for traps:
		if (targetChar.statusEffects) {
			let duration = projectile.flags.duration || 8;
			
			targetChar.statusEffects.add('Netted', {duration: duration});
			
			targetChar.agroPlayer();
		}
	};
	
	// Fire:
	// ********************************************************************************************
	this.projectileEffects.Fire = function (targetChar, projectile) {
		gs.createFire(targetChar.tileIndex, projectile.damage, projectile.flags);
	};
	

	
	// Poison:
	// Used by NPCs
	// ********************************************************************************************
	this.projectileEffects.Poison = function (targetChar, projectile) {
		// Added test for traps:
		if (targetChar.statusEffects) {
			// Poison Damage:
			targetChar.addPoisonDamage(projectile.damage);
			
			// Particle:
			gs.createPoisonEffect(targetChar.tileIndex);
		}
	};
	
	// Strong Poison:
	// Used by player staves:
	this.projectileEffects.StrongPoison = function (targetChar, projectile) {
		// Added test for traps:
		if (targetChar.statusEffects) {
			targetChar.takeDamage(projectile.damage, DAMAGE_TYPE.TOXIC);
			targetChar.statusEffects.add('StrongPoison', {damage: projectile.damage});
		}
	};
	
	// Life Spike:
	// ********************************************************************************************
	this.projectileEffects.LifeSpike = function (targetChar, projectile) {
		// Status Effect:
		targetChar.statusEffects.add('LifeSpike', {duration: projectile.flags.duration, damage: projectile.damage, actingCharId: projectile.fromCharacter.id});
		
		// Sound:
		gs.playSound(gs.sounds.playerHit, targetChar.tileIndex);
	};
	
	// Life Tap:
	// ********************************************************************************************
	this.projectileEffects.LifeTap = function (targetChar, projectile) {
		
		if (targetChar.takeDamage) {
			var damageAmount = targetChar.takeDamage(projectile.damage, DAMAGE_TYPE.TOXIC, projectile.flags);
		
			// Heal HP:
			if (util.frac() < 0.25 && targetChar.faction !== FACTION.DESTRUCTABLE) {
				// Heals 25% HP:
				damageAmount = Math.ceil(damageAmount * 0.25);
				projectile.fromCharacter.healHp(damageAmount);
				projectile.fromCharacter.popUpText('+' + damageAmount + 'HP', 'Green');
				
				// Anim:
				gs.createPoisonEffect(targetChar.tileIndex);
				
				// Sound:
				gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
			}
		}
	};
	
	// FireBall:
	// ********************************************************************************************
	this.projectileEffects.FireBall = function (targetChar, projectile) {
		gs.createExplosion(targetChar.tileIndex, 1, projectile.damage, projectile.flags);
	};
	
	// SparkBall:
	// ********************************************************************************************
	this.projectileEffects.SparkBall = function (targetChar, projectile) {
		var indexList = gs.getIndexListInRadius(targetChar.tileIndex, 1.0);
		
		indexList = indexList.filter(index => util.vectorEqual(index, targetChar.tileIndex) || gs.getChar(index) && projectile.fromCharacter.isHostileToMe(gs.getChar(index)));
		
		indexList.forEach(function (index) {
			gs.createShock(index, projectile.damage, projectile.flags);
		}, this);
	};
	
	// Shock:
	// ********************************************************************************************
	this.projectileEffects.Shock = function (targetChar, projectile) {
		gs.createShock(targetChar.tileIndex, projectile.damage, projectile.flags);
	};
	
	// Create Bomb:
	// ********************************************************************************************
	this.projectileEffects.CreateBomb = function (targetTile, projectile) {
		if (!gs.getObj(targetTile.tileIndex, obj => !obj.type.canOverWrite)) {
			
			if (gs.getObj(targetTile.tileIndex)) {
				gs.destroyObject(gs.getObj(targetTile.tileIndex));
			}
			
			var bomb = gs.createObject(targetTile.tileIndex, 'Bomb');
			bomb.damage = projectile.damage;
		}
		else {
			gs.createExplosion(targetTile.tileIndex, 1, projectile.damage, projectile.flags);
		}
		
	};
	
	// Sleep Bomb:
	// ********************************************************************************************
	this.projectileEffects.SleepBomb = function (targetTile, projectile) {
		// AoE Effect:
		gs.getIndexListInRadius(targetTile.tileIndex, projectile.flags.aoeRange).forEach(function (tileIndex) {
			// Smoke:
			if (gs.isStaticPassable(tileIndex)) {
				gs.createCloud(tileIndex, 'WhiteSmoke', 0, 2);
			}
		
			// Sleep:
			let char = gs.getChar(tileIndex);
			if (char) {
				char.goToSleep();
		
				if (char.type.immunities.sleep) {
					char.popUpText('Immune to sleep!');
				}
				else {
					char.statusEffects.add('DeepSleep', {duration: projectile.flags.duration});
				}
			}
		}, this);
		
		
		
		
		// Light Effect:
		gs.createLightCircle(util.toPosition(targetTile.tileIndex), '#ffffff', 120, 10);
		
		// Calc LoS for smoke:
		gs.calculateLoS();
	};
	
	// Oil:
	// ********************************************************************************************
	this.projectileEffects.Oil = function (targetTile, projectile) {
		gs.getIndexListInRadius(targetTile.tileIndex, 1.5).forEach(function (tileIndex) {
			if (gs.isStaticPassable(tileIndex) && !gs.getObj(tileIndex) && !gs.isUncoveredLiquid(tileIndex)) {
				gs.createObject(tileIndex, 'Oil');
			}
		}, this);
	};
	
	// Sleeping Dart:
	// ********************************************************************************************
	this.projectileEffects.SleepingDart = function (targetChar, projectile) {
		targetChar.goToSleep();
		
		if (targetChar.type.immunities.sleep) {
			targetChar.popUpText('Immune to sleep!');
		}
		else {
			targetChar.statusEffects.add('DeepSleep', {duration: projectile.flags.duration});
		}
		
	};
	
	// Poison Gas Ball:
	// ********************************************************************************************
	this.projectileEffects.createPoisonGas = function (targetTile, projectile) {
		gs.playSound(gs.sounds.fire, targetTile.tileIndex);
		gs.createCloud(targetTile.tileIndex, 'PoisonGas', projectile.damage, 15);	
	};
	
	// Create Slime:
	// ********************************************************************************************
	this.projectileEffects.createSlime = function (targetChar, projectile) {
		gs.createVinePatch(targetChar.tileIndex, 2, 'Slime', 0.75);
		targetChar.onEnterTileBase();
	};
	

	
	// CREATE_OBJECTS:
	// Used by web, flame-web, and vines:
	// ********************************************************************************************
	let createObjects = function (targetTileIndex, objectTypeName) {
		let indexList = [];
		gs.getIndexListInRadius(targetTileIndex, 1).forEach(function (tileIndex) {
			if (gs.abilityTypes.SpiderWeb.isValidWebIndex(tileIndex)) {
				if (gs.getObj(tileIndex)) {
					gs.destroyObject(gs.getObj(tileIndex));
				}
				
				gs.createObject(tileIndex, objectTypeName);
				
				indexList.push({x: tileIndex.x, y: tileIndex.y});
			}
		}, this);
		
		return indexList;
	};
	
	// WEB:
	// ********************************************************************************************
	this.projectileEffects.Web = function (targetChar, projectile) {
		createObjects(targetChar.tileIndex, 'SpiderWeb');
	};
	
	// FLAME_WEB:
	// ********************************************************************************************
	this.projectileEffects.FlameWeb = function (targetChar, projectile) {
		createObjects(targetChar.tileIndex, 'FlameWeb');
	};
	
	// VINES:
	// ********************************************************************************************
	this.projectileEffects.Vines = function (targetChar, projectile) {
		// Damage Character:
		if (targetChar.takeDamage) {
			targetChar.takeDamage(projectile.damage, DAMAGE_TYPE.PHYSICAL, projectile.flags);
		}
		
		// Create Vines:
		if (util.frac() < 0.20 && gs.abilityTypes.SpiderWeb.isValidWebIndex(targetChar.tileIndex)) {
			let indexList = createObjects(targetChar.tileIndex, 'Vine');
			
			if (indexList.length > 0) {
				gs.playSound(gs.sounds.cure);
				indexList.forEach(function (tileIndex) {
					gs.createParticlePoof(tileIndex, 'GREEN');
				}, this);
				
			}
		}
	};
	
	// WEB_DART:
	// ********************************************************************************************
	this.projectileEffects.WebDart = function (targetChar, projectile) {
		// Damage Character:
		if (targetChar.takeDamage) {
			targetChar.takeDamage(projectile.damage, DAMAGE_TYPE.PHYSICAL, projectile.flags);
		}
		
		// Create Web:
		if (util.frac() < 0.20 && gs.abilityTypes.SpiderWeb.isValidWebIndex(targetChar.tileIndex)) {
			let indexList = createObjects(targetChar.tileIndex, 'SpiderWeb');
			
			if (indexList.length > 0) {
				gs.playSound(gs.sounds.cure);
				indexList.forEach(function (tileIndex) {
					gs.createParticlePoof(tileIndex, 'WHITE');
				}, this);
				
			}
		}
	};
};