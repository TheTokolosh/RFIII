/*global game, gs, console, util*/
/*global TILE_SIZE*/
/*global SPREAD_DAMAGE_MOD*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// CREATE_SHOCK:
// ************************************************************************************************
gs.createShock = function (tileIndex, damage, flags) {
	return new Shock(tileIndex, damage, flags);
};

// CREATE_FIRE:
// ************************************************************************************************
gs.createFire = function (tileIndex, damage, flags) {
	return new Fire(tileIndex, damage, flags);
};


// CREATE_EXPLOSION_CROSS:
// ************************************************************************************************
gs.createExplosionCross = function (tileIndex, range, damage, flags) {
	var indexList;
	
	indexList = gs.getIndexListInRadius(tileIndex, range);
	indexList = indexList.filter(index => gs.isStaticPassable(index));
	indexList = indexList.filter(index => gs.isRayStaticPassable(index, tileIndex));
	indexList = indexList.filter(index => index.x === tileIndex.x || index.y === tileIndex.y);
	
	indexList.forEach(function (index) {
		this.createFire(index, damage, flags);
	}, this);
	
	// Camera shake:
	if (gs.getTile(tileIndex).visible) {
		game.camera.shake(0.010, 100);
	}
	
	// Sound:
	gs.playSound(gs.sounds.explosion, tileIndex);
};

// CREATE_EXPLOSION:
// ************************************************************************************************
gs.createExplosion = function (atTileIndex, range, damage, flags) {
	var indexList;
	
	indexList = gs.getIndexListInRadius(atTileIndex, range);
	indexList = indexList.filter(index => gs.isStaticProjectilePassable(index));
	indexList = indexList.filter(index => gs.isRayStaticProjectilePassable(index, atTileIndex));
	indexList.forEach(function (index) {
		
		if (flags.damageDropOff && util.distance(atTileIndex, index) > 0) {
			this.createFire(index, Math.ceil(damage / 2), flags);
		}
		else {
			this.createFire(index, damage, flags);
		}
	}, this);
	
	// Camera shake:
	if (gs.getTile(atTileIndex).visible) {
		game.camera.shake(0.010, 100);
	}
	
	//game.camera.flash(0xff0000, 25);
	
	// Sound:
	gs.playSound(gs.sounds.explosion, atTileIndex);
};



// SHOCK_CONSTRUCTOR:
// ************************************************************************************************
function Shock (tileIndex, damage, flags = {}) {
	var startPos = util.toPosition(tileIndex),
		character;
	
    this.tileIndex = {x: tileIndex.x, y: tileIndex.y};
    this.damage = damage;
    this.isAlive = true;
    this.flags = flags;
	this.name = 'Electricity';
	this.life = 20;
	this.isTransparent = true;
	this.inProjList = true;
	this.readyToSpread = true;
	
	if (flags.hasOwnProperty('spread')) {
		this.spread = flags.spread;
	}
	else {
		this.spread = 3;
	}
	
	// Create sprite:
    this.sprite = gs.createSprite(startPos.x, startPos.y, 'Tileset', gs.projectileSpritesGroup);
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.animations.add('Explode', [1637, 1638, 1639, 1640, 1641], 10);
    this.sprite.play('Explode');
    
	// Lighting
	gs.createLightCircle(this.sprite.position, '#ffffff', 120, 30, '66');
	
	// Sound:
	gs.playSound(gs.sounds.shock, this.tileIndex);
	
	// Damage characters:
	character = gs.getChar(this.tileIndex);
    if (character && this.shouldDamageCharacter(character)) {
        character.takeDamage(damage, 'Shock', flags);
    }
	
	// Destroy Oil:
	if (gs.getObj(this.tileIndex, 'Oil')) {
		gs.destroyObject(gs.getObj(this.tileIndex));
	}
	
	gs.getTile(this.tileIndex).effect = this;
	gs.projectileList.push(this);
}

// SHOULD_DAMAGE_CHARACTER:
// ************************************************************************************************
Shock.prototype.shouldDamageCharacter = function (character) {
	return character.isAlive && 
		(this.spread === 3 || !character.isFlying || gs.getCloud(this.tileIndex, cloud => cloud.type.isConductive));
};

// STEP_ON:
// ************************************************************************************************
Shock.prototype.stepOn = function () {
	console.log('Shock.stepOn() should never be called (report this)');
};

// CAN_SPREAD_ON:
// ************************************************************************************************
Shock.prototype.canSpreadOn = function (tileIndex) {
	if (gs.getEffect(tileIndex)) {
		return false;
	}
	else {
		return (util.inArray(gs.getTile(tileIndex).type.name, ['Water', 'ToxicWaste', 'Blood']) && !gs.getObj(tileIndex, 'Ice'))
			|| gs.getCloud(tileIndex, cloud => cloud.type.isConductive);
	}
};

// UPDATE_SHOCK:
// ************************************************************************************************
Shock.prototype.update = function () {
	var spreadDamage = Math.floor(this.damage * SPREAD_DAMAGE_MOD),
		shock;
	
	// Spread on first frame:
	if (this.sprite.frame === 1638 && this.readyToSpread && spreadDamage > 0 && this.spread > 0) {
		this.readyToSpread = false;
		// Spread:
		gs.getIndexListCardinalAdjacent(this.tileIndex).forEach(function (tileIndex) {
			if (this.canSpreadOn(tileIndex)) {
				this.flags.spread = this.spread - 1;
				shock = gs.createShock(tileIndex, spreadDamage, this.flags);
			}
		}, this);
		
		// Create Fire on adjacent oil:
		gs.getIndexListCardinalAdjacent(this.tileIndex).forEach(function (tileIndex) {
			if (gs.getObj(tileIndex, 'Oil') || gs.getCloud(tileIndex, 'PoisonGas') || gs.getCloud(tileIndex, 'PoisonCloud')) {
				gs.createFire(tileIndex, spreadDamage, this.flags);
			}
		}, this);
	}
	
	// 
	if (this.sprite.frame === 1639 && this.inProjList) {
		util.removeFromArray(this, gs.projectileList);
		gs.particleList.push(this);
		this.inProjList = false;
	}
			
	// Added life to make sure shock disapears
	this.life -= 1;
	if (this.sprite.frame >= 1641 || this.life <= 0) {
        this.destroy();
    }
};

// DESTROY:
// ************************************************************************************************
Shock.prototype.destroy = function () {
	this.sprite.destroy();
	gs.getTile(this.tileIndex).effect = null;
	this.isAlive = false;
};


// FIRE_CONSTRUCTOR:
// ************************************************************************************************
function Fire (tileIndex, damage, flags) {
    var startPos = util.toPosition(tileIndex);
    
    this.tileIndex = {x: tileIndex.x, y: tileIndex.y};
    this.damage = damage;
    this.isAlive = true;
    this.flags = flags;
	this.life = 20;
	this.isTransparent = true;
	this.spread = 6;
	this.inProjList = true;
	
    // Create sprite:
    this.sprite = gs.createSprite(startPos.x, startPos.y, 'Tileset', gs.projectileSpritesGroup);
    this.sprite.anchor.setTo(0.5, 0.5);
    this.sprite.animations.add('Explode', [1632, 1633, 1634, 1635, 1636], 10);
    this.sprite.play('Explode');
	
	// Particle:
	//gs.createParticlePoof(this.tileIndex, 'RED', 10);
    
	// Light:
	gs.createLightCircle(this.sprite.position, '#ff0000', 120, 30, '66');
	
	// Sound:
	gs.playSound(gs.sounds.fire, this.tileIndex);
	
    // Damage characters:
    if (gs.getChar(this.tileIndex)) {
        gs.getChar(this.tileIndex).takeDamage(damage, 'Fire', flags);
    }
    
    // Destroy Flammable Objects:
	if (gs.getObj(this.tileIndex, obj => obj.type.isFlammable)) {
		gs.destroyObject(gs.getObj(this.tileIndex));
	}
	
	// Destroy Mushrooms:
	if (gs.getObj(this.tileIndex, obj => obj.type.name === 'FireShroom')) {
		gs.destroyObject(gs.getObj(this.tileIndex));
	}
	
	// Destroy Ice:
	if (gs.getObj(this.tileIndex, obj => obj.type.name === 'Ice')) {
		gs.destroyObject(gs.getObj(this.tileIndex));
	}
	
	// Destroy Flammable effects:
	if (gs.getCloud(this.tileIndex, cloud => cloud.type.isFlammable && !cloud.firstTurn)) {
		gs.getCloud(this.tileIndex).destroy();
	}
	
	// Destroy Freezing Cloud:
	if (gs.getCloud(this.tileIndex, 'FreezingCloud')) {
		gs.getCloud(this.tileIndex).destroy();
	}
	
	// Create Steam:
	if (gs.getTile(this.tileIndex).type.name === 'Water') {
		gs.createCloud(this.tileIndex, 'Steam', 0, 5);
		gs.calculateLoS();
	}
	
	
	gs.projectileList.push(this);
	
	/*
	// Only push to projectile list if needs to spread:
	if (gs.getIndexListCardinalAdjacent(this.tileIndex).filter(index => this.canSpreadOn(index)).length > 0) {
		gs.projectileList.push(this);
	}
	else {
		gs.particleList.push(this);
	}
	*/
}

// STEP_ON:
// ************************************************************************************************
Fire.prototype.stepOn = function () {
	console.log('Fire.stepOn() should never be called (report this)');
};

// CAN_FIRE_SPREAD_ON:
// ************************************************************************************************
gs.canFireSpreadOn = function (tileIndex) {
	return gs.getObj(tileIndex, obj => obj.type.isFlammable)
		|| gs.getCloud(tileIndex, cloud => cloud.type.isFlammable && !cloud.firstTurn);
};

// UPDATE_FIRE:
// ************************************************************************************************
Fire.prototype.update = function () {
	var spreadDamage = this.damage, //Math.floor(this.damage * SPREAD_DAMAGE_MOD),
		fire;
	
	this.life -= 1;
	
    // Set adjacent objects or cloud on fire:
    if (this.sprite.frame === 1633 && spreadDamage > 0 && this.spread > 0) {
		gs.getIndexListCardinalAdjacent(this.tileIndex).forEach(function (tileIndex) {
			if (gs.canFireSpreadOn(tileIndex)) {
				fire = gs.createFire(tileIndex, spreadDamage, this.flags);
				fire.spread = this.spread - 1;
			}
		}, this);
    }
	
	if (this.sprite.frame === 1634 && this.inProjList) {
		util.removeFromArray(this, gs.projectileList);
		gs.particleList.push(this);
		this.inProjList = false;
	}
	
	
	// Destroy fire:
	if (this.sprite.frame >= 1636 || this.life <= 0) {
       this.destroy();
    }
};

// DESTROY:
// ************************************************************************************************
Fire.prototype.destroy = function () {
	this.sprite.destroy();
	this.isAlive = false;
};




