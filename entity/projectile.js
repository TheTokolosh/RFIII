/*global game, gs, console, util*/
/*global LOS_DISTANCE, TILE_SIZE*/
/*global Particle, ParticleGenerator, achievements*/
/*global SPREAD_DAMAGE_MOD, PROJECTILE_SPEED*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';


// CREATE_PROJECTILE_POOL:
// ************************************************************************************************
gs.createProjectilePool = function () {
	this.projectilePool = [];
	for (let i = 0; i < 50; i += 1) {
		this.projectilePool[i] = new Projectile();
	}
};

// CREATE_PROJECTILE:
// ************************************************************************************************
gs.createProjectile = function (fromCharacter, targetTileIndex, typeName, damage, range, flags) {
	for (let i = 0; i < this.projectilePool.length; i += 1) {
		if (!this.projectilePool[i].isAlive) {
			this.projectilePool[i].init(fromCharacter, targetTileIndex, typeName, damage, range, flags);
			return this.projectilePool[i];
		}
	}
	
	// Pool size exceeded:
	this.projectilePool.push(new Projectile());
	this.projectilePool[this.projectilePool.length - 1].init(fromCharacter, targetTileIndex, typeName, damage, range, flags);
	return this.projectilePool[this.projectilePool.length -1];
};

// CONSTRUCTOR:
// ************************************************************************************************
function Projectile() {
	this.isAlive = false;
	
	// Sprite:
    this.sprite = gs.createSprite(0, 0, 'Tileset', gs.projectileSpritesGroup);
	this.sprite.anchor.setTo(0.5, 0.5);
	this.sprite.visible = false;
}

// INIT:
// *******************************************************************************
Projectile.prototype.init = function (fromCharacter, targetTileIndex, typeName, damage, range, flags) {
	 var startPosition = util.toPosition(fromCharacter.tileIndex), light;
    
    flags = flags || {};
    
    // Properties:
    this.normal = util.normal(startPosition, util.toPosition(targetTileIndex));
    this.ignoreCharacters = [fromCharacter];
    this.isAlive = true;
    this.type = gs.projectileTypes[typeName];
    this.targetTileIndex = {x: targetTileIndex.x, y: targetTileIndex.y};
    this.damage = damage;
    this.damageType = this.type.damageType;
    this.flags = flags;
    this.distance = 0;
    this.tileIndex = {x: fromCharacter.tileIndex.x, y: fromCharacter.tileIndex.y};
	this.isTunnelShot = flags.isTunnelShot || false;
	this.isCrit = flags.isCrit;
    this.particleTimer = 0;
	this.fromCharacter = fromCharacter;
	this.perfectAim = flags.perfectAim || this.type.perfectAim;
	this.range = range;
	this.hitTileIndexList = flags.hitTileIndexList || [];
	this.lastTileIndex = {x: this.tileIndex.x, y: this.tileIndex.y};
	this.numReflection = 0;
	
	// Knock Back:
	// Can be passed in from weapon / ability or set by projectile type
	this.knockBack = flags.knockBack || 0;
	if (this.type.knockBack && util.frac() <= this.type.knockBackChance) {
		this.knockBack = 1;
	}
	
	
	// Sprite:
	this.sprite.x = startPosition.x;
	this.sprite.y = startPosition.y;
   	this.sprite.rotation = game.math.angleBetween(fromCharacter.tileIndex.x, fromCharacter.tileIndex.y, targetTileIndex.x, targetTileIndex.y) + Math.PI / 2;
	this.sprite.frame = this.type.frame;
	this.sprite.visible = true;
	
	// Light:
	if (this.type.light) {
		this.light = gs.createLightCircle(this.sprite.position, this.type.light.color, this.type.light.radius, 0, this.type.light.startAlpha);
		this.light.noLife = true;
		this.light.fade = false;
	}
		
	
    // Push to list:
    gs.projectileList.push(this);
};

// UPDATE:
// *******************************************************************************
Projectile.prototype.update = function () {
	for (let i = 0; i < PROJECTILE_SPEED; i += 1) {
		let prevTileIndex = util.toTileIndex(this.sprite.position);
		
		// Move:
		this.sprite.x += this.normal.x;
		this.sprite.y += this.normal.y;
		this.distance += 1;
		
		var tileIndex = util.toTileIndex(this.sprite.position);
		if (!util.vectorEqual(tileIndex, prevTileIndex)) {
			this.lastTileIndex = prevTileIndex;
		}

		if (this.isTunnelShot) {
			if (this.testTunnelShotCollision()) {
				return;
			}
		}
		else {
			if (this.testCollision()) {
				return;
			}
		}
	}
	
	// Move Light:
	if (this.light) {
		this.light.sprite.x = this.sprite.x;
		this.light.sprite.y = this.sprite.y;
	}
	
	// Particles:
	if (this.type.particleFrame) {
		this.particleTimer += 1;
	
		if (this.particleTimer > 0 && this.distance > 25) {
			gs.createParticle(this.sprite.position, {frame: this.type.particleFrame, acc: {x: 0, y: 0}, duration: 12, fadePct: 0.5});
			this.particleTimer = 0;
		}
	}
	
    // Destroy after distance or out of bounds:
	if (this.distance > this.range * TILE_SIZE || !gs.isInBounds(util.toTileIndex(this.sprite.position))) {
		this.destroy();
	}
};

// TEST_TUNNEL_SHOT_COLLISION:
// ************************************************************************************************
Projectile.prototype.testTunnelShotCollision = function () {
	var tileIndex = util.toTileIndex(this.sprite.position);
	let isValidTileIndex = this.hitTileIndexList.find(index => util.vectorEqual(index, tileIndex));
	let char = gs.getChar(tileIndex);
	
	// Hit Characters:
	if (isValidTileIndex && char && !util.inArray(char, this.ignoreCharacters)) {
		this.hitCharacter(gs.getChar(tileIndex));
		this.ignoreCharacters.push(gs.getChar(tileIndex));
	}
	
	// Hit Wall:
	if (isValidTileIndex && !char && !gs.isProjectilePassable(tileIndex)) {
		this.destroy();
		console.log('hitwall');
		return true;
	}
	
	// Last TileIndex:
	if (util.vectorEqual(tileIndex, this.hitTileIndexList[this.hitTileIndexList.length - 1])) {
		this.destroy();
		return true;
	}
	
	return false;
};

// TEST_COLLISION:
// ************************************************************************************************
Projectile.prototype.testCollision = function () {
	 var tileIndex = util.toTileIndex(this.sprite.position), didHit;
	
    // Hit characters:
    // Note the bit about passing solids is to handle perfect aim which passes through non-targets
	if (gs.inTileHitBounds(this.sprite.position) || util.vectorEqual(tileIndex, this.targetTileIndex)) {
		let char = gs.getChar(tileIndex);
		if (char && !char.type.ignoreProjectiles && !util.inArray(char, this.ignoreCharacters) && (!this.perfectAim || util.vectorEqual(tileIndex, this.targetTileIndex))) {

			didHit = this.hitCharacter(char);
			this.ignoreCharacters.push(char);

			// Destroy non tunnel shot projectiles:
			if (didHit) {
				this.destroy();
				return true;
			}
		}

		// Hit Trap:
		if (util.vectorEqual(tileIndex, this.targetTileIndex) && gs.getObj(tileIndex) && gs.canShootTrap(tileIndex) && !gs.getChar(tileIndex)) {
			this.hitTrap(gs.getObj(tileIndex));
			this.destroy();
			return true;
		}
		
		// Hit Wall
		if (!gs.getChar(tileIndex) && !gs.isProjectilePassable(tileIndex)) {
			this.destroy();
			return true;
		}
	}
	
	// Hit targetTileIndex:
	if (util.vectorEqual(tileIndex, this.targetTileIndex) && this.type.hitTargetTileIndex) {
		if (!gs.getChar(tileIndex) || didHit) {
			this.hitTargetTileIndex(tileIndex);
			this.destroy();
			return true;
		}	
	}
	
	// Hit Cloud:
	if (this.type.isFlammable && (gs.getCloud(tileIndex, 'FlamingCloud') || gs.getCloud(tileIndex, 'SpreadingFlamingCloud'))) {
		this.destroy();
		
		if (this.type.hitTargetTileIndex) {
			this.hitTargetTileIndex(tileIndex);
		}
		
		return true;
	}
	
	return false;
};


// HIT_CHARACTER:
// ************************************************************************************************
Projectile.prototype.hitCharacter = function (character) {
    var attackResult = character.attackResult(this.fromCharacter, 'Range', this.type.neverMiss),
        tileIndex = util.toTileIndex(this.sprite.position);
    
	
	let shieldsUp = character.statusEffects.get('ShieldsUp') && character.statusEffects.get('ShieldsUp').reflection;
	
	// REFLECTION:
	if (util.frac() < character.reflection || character.statusEffects.has('WeaponShield') || shieldsUp) {
		character.popUpText('REFLECT');
		
		gs.createShieldsUpAnim(character, this.lastTileIndex, 1821);
		
		// Note how we effectively reset ignoreCharacters so that the shooter can be hit
		this.ignoreCharacters = [character];
		this.perfectAim = false;
		this.normal.x = -this.normal.x;
		this.normal.y = -this.normal.y;
		this.distance = 0;
		
		this.numReflection += 1;
		
		if (this.numReflection === 4) {
			achievements.get('PING_PONG');
		}
		
		return false;
	}
	// MISS:
	else if (attackResult === 'MISS') {
		this.ignoreCharacters = [character];
		character.popUpText('MISS');
		return false;
	}
	// BLOCK:
	else if (attackResult === 'BLOCK') {
		character.popUpText('BLOCK');
		return true;
	}
	// HIT or CRITICAL:
	else {
		// Projectile Effects:
		if (this.type.effect) {
			this.type.effect(character, this);
		}
        // Damaging projectiles hitting characters:
        else {
			if (character !== gs.pc && attackResult === 'CRITICAL') {
				this.flags.isCrit = true;
			}
            
			// Crit:
			if (this.isCrit) {
				this.flags.isCrit = this.isCrit;
			}
			
			// No Mitigation:
			if (this.type.noMitigation) {
				this.flags.noMitigation = true;
			}
						
            character.takeDamage(this.damage, this.damageType, this.flags);
        }
		
		if (this.knockBack > 0 && character.isAlive) {
			character.body.applyKnockBack(this.normal, this.knockBack);
		}
		return true;
    }
	
	// Hitting (or missing) someone with a projectile agros and wakes them up
	character.isAgroed = true;
	character.isAsleep = false;
};

// HIT_TARGET_TILE_INDEX:
// ************************************************************************************************
Projectile.prototype.hitTargetTileIndex = function (tileIndex) {
	if (this.type.effect) {
		this.type.effect({tileIndex: tileIndex}, this);
	}
};

// HIT_TRAP:
// ************************************************************************************************
Projectile.prototype.hitTrap = function (trap) {
	if (gs.canShootTrap(trap.tileIndex)) {
		trap.stepOn(null);
	}
	
	if (this.type.effect) {
		this.type.effect({tileIndex: trap.tileIndex}, this);
	}
};

// DESTROY:
// ************************************************************************************************
Projectile.prototype.destroy = function () {
	gs.createAnimEffect(this.sprite.position, 'Hit');
	
	if (this.type.hitEffect) {
		this.type.hitEffect.call(this);
	}
	
    this.isAlive = false;
    this.sprite.visible = false;
	
	if (this.light) {
		this.light.destroy();
		this.light = null;
	}
};

// UPDATE_PROJECTILES:
// ************************************************************************************************
gs.updateProjectiles = function () {
	
    // Remove dead projectiles:
    for (let i = this.projectileList.length - 1; i >= 0; i -= 1) {
        if (!this.projectileList[i].isAlive) {
            this.projectileList.splice(i, 1);
        }
    }
    
    for (let i = 0; i < this.projectileList.length; i += 1) {
        this.projectileList[i].update();
    }
};

// DESTROY_ALL_PROJECTILES:
// ************************************************************************************************
gs.destroyAllProjectiles = function () {
	// Destroy Projectiles:
	for (let i = 0; i < this.projectileList.length; i += 1) {
		this.projectileList[i].destroy();
	}
	
	// Destroy particles:
	for (let i = 0; i < this.particleList.length; i += 1) {
		this.particleList[i].destroy();
	}
	
	// Destroy particle generators:
	for (let i = 0; i < this.particleGeneratorList.length; i += 1) {
		this.particleGeneratorList[i].destroy();
	}
	
	this.projectileList = [];
	this.particleList = [];
	this.particleGeneratorList = [];
	
};

