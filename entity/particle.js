/*global game, gs, console, util*/
/*global KNOCK_BACK_SPEED, SCALE_FACTOR*/
/*global Particle, ParticleGenerator, PARTICLE_FRAMES, TILE_SIZE*/
/*jshint esversion: 6*/

'use strict';

// CREATE_PARTICLE_POOL:
// ************************************************************************************************
gs.createParticlePool = function () {
	this.particlePool = [];
	for (let i = 0; i < 100; i += 1) {
		this.particlePool[i] = new Particle();
	}
};

// PARTICLE:
// ************************************************************************************************
gs.createParticle = function (position, attributes) {
	for (let i = 0; i < this.particlePool.length; i += 1) {
		if (!this.particlePool[i].isAlive) {
			this.particlePool[i].init(position, attributes);
			return this.particlePool[i];
		}
	}
	
	// Pool size exceeded:
	this.particlePool.push(new Particle());
	this.particlePool[this.particlePool.length - 1].init(position, attributes);
	return this.particlePool[this.particlePool.length -1];
	
};

// PARTICLE_CONSTRUCTOR:
// ************************************************************************************************
// attributes: {duration, fadePct, vel, acc, frame}
function Particle() {
	this.isAlive = false;
	
	// Sprite:
	this.sprite = gs.createSprite(0, 0, 'Tileset', gs.projectileSpritesGroup);
	this.sprite.anchor.setTo(0.5, 0.5);
	this.sprite.visible = false;
}

// PARTICLE_INIT:
// ************************************************************************************************
Particle.prototype.init = function (position, attributes) {
	this.isAlive = true;
	this.life = 0;
	
	// Properties:
	this.duration = attributes.duration;
	this.fadePct = attributes.fadePct;
	this.velocity = attributes.vel || {x: 0, y: 0};
	this.acc = attributes.acc || {x: 0, y: -0.01};
	
	// Sprite:
	this.sprite.x = position.x;
	this.sprite.y = position.y;
	this.sprite.frame = attributes.frame;
	this.sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
	this.sprite.visible = true;
	
	gs.particleList.push(this);
};

// PARTICLE_UPDATE:
// ************************************************************************************************
Particle.prototype.update = function () {
	var fade;
	
	// Destroy when the particle runs out of life:
	this.life += 1;
	if (this.life >= this.duration) {
		this.destroy();
	}
	
	// Fading the sprite by reducing size:
	if (this.life >= this.duration * this.fadePct) {
		fade = (this.duration - this.life) / (this.duration * (1 - this.fadePct));
		this.sprite.scale.setTo(fade * SCALE_FACTOR, fade * SCALE_FACTOR);
	}
	
	// Apply Acceleration:
	this.velocity.x += this.acc.x;
	this.velocity.y += this.acc.y;
	
	// Apply velocity:
	this.sprite.x += this.velocity.x;
	this.sprite.y += this.velocity.y;
};

// PARTICLE_DESTROY:
// ************************************************************************************************
Particle.prototype.destroy = function () {
	this.isAlive = false;
	this.sprite.visible = false;
};

// PARTICLE_GENERATOR:
// ************************************************************************************************
gs.createParticleGenerator = function (position, attributes) {
	return new ParticleGenerator(position, attributes);
};

function ParticleGenerator(position, attributes) {
	this.isAlive = true;
	this.life = 0;
	this.particleTimer = 0;
	this.position = {x: position.x, y: position.y};
	
	// Properties:
	this.duration = attributes.duration;
	this.numParticles = attributes.numParticles || 1;
	this.particleTime = attributes.particleTime;
	this.particleFrame = attributes.particleFrame;
	this.particleLife = attributes.particleLife;
	this.particleFadePct = attributes.particleFadePct;
	this.acc = attributes.acc;
	this.vel = attributes.vel;
	
	gs.particleGeneratorList.push(this);
}

// DESTROY:
// ************************************************************************************************
ParticleGenerator.prototype.destroy = function () {
	this.isAlive = false;
};

// PARTICLE_GENERATOR_UPDATE:
// ************************************************************************************************
ParticleGenerator.prototype.update = function () {
	this.life += 1;
	if (this.duration !== 'infinite' && this.life >= this.duration) {
		this.isAlive = false;
	}
	
	this.particleTimer += 1;
	if (this.particleTimer >= this.particleTime) {
		for (let i = 0; i < this.numParticles; i += 1) {
			gs.createParticle({x: this.position.x + util.randInt(-16, 16),
									  y: this.position.y + util.randInt(-4, 4)},
									 {duration: this.particleLife,
									  fadePct: this.particleFadePct,
									  frame: this.particleFrame,
									  acc: this.acc,
									  vel: this.vel});
		}
		this.particleTimer = 0;
	}
};



// UPADATE_PARTICLE_GENERATORS:
// ************************************************************************************************
gs.updateParticleGenerators = function () {
    var i;
    
    // Remove dead particles generators:
    for (i = this.particleGeneratorList.length - 1; i >= 0; i -= 1) {
        if (!this.particleGeneratorList[i].isAlive) {
            this.particleGeneratorList.splice(i, 1);
        }
    }
    
    for (i = 0; i < this.particleGeneratorList.length; i += 1) {
        this.particleGeneratorList[i].update();
    }
};



// CREATE_SPELL_PARTICLE:
// Standard spell particle generator
// Color: [GREEN, PURPLE, RED, BLUE]
// ************************************************************************************************
gs.createParticlePoof = function (tileIndex, color) {
	var position = util.toPosition(tileIndex);
	
	if (!gs.getTile(tileIndex).visible) {
		return;
	}
	
	return gs.createParticleGenerator({x: position.x, y: position.y + 12},
									   {duration: 4,
										numParticles: 10,
										particleTime: 1,
										particleLife: 90,
										particleFadePct: 0.3,
										particleFrame: PARTICLE_FRAMES[color]});
};



// POOF:
gs.createParticlePoof = function (tileIndex, color, num) {
	var position = util.toPosition(tileIndex),
		i;
	
	num = num || 20;
	
	if (!gs.getTile(tileIndex).visible) {
		return;
	}
	
	color = color || 'WHITE';
	
	for (i = 0; i < num; i += 1) {
		
		this.createParticle({x: position.x + util.randInt(-20, 20), y: position.y + 10 + util.randInt(-10, 10)},
						    {duration: 50,
							 fadePct: 0.75,
							 vel: {x: util.randInt(-200, 200) * 0.005, y: -3.0 + util.randInt(0, 100) * 0.005},
							 acc: {x: 0, y: 0.1},
							 frame: PARTICLE_FRAMES[color]});
	}
};

// CREATE_PARTICLE_BURST:
// An angled burst of particles:
// ************************************************************************************************
gs.createParticleBurst = function (position, normal, color) {
	var i, num = 10;
	
	if (!gs.getTile(util.toTileIndex(position)).visible) {
		return;
	}
	
	color = color || 'WHITE';
	
	for (i = 0; i < num; i += 1) {
		
		this.createParticle({x: position.x + util.randInt(-15, 15), y: position.y + util.randInt(-15, 15)},
						    {duration: 20,
							 fadePct: 0.75,
							 vel: {x: normal.x * 5, y: normal.y * 5},
							 acc: {x: 0, y: 0},
							 frame: PARTICLE_FRAMES[color]});
	}
};

// CREATE_PARTICLE_HIT:
// ************************************************************************************************
gs.createParticleHit = function (position, normal, color) {
	var i, num = 5;
	
	if (!gs.getTile(util.toTileIndex(position)).visible) {
		return;
	}
	
	color = color || 'WHITE';
	
	for (i = 0; i < num; i += 1) {
		//let pos = {x: position.x + util.randInt(-15, 15), y: position.y + util.randInt(-15, 15)};
		
		let attributes = {
			duration: 10,
			fadePct: 0.75,//1,//0.75,
			vel: {x: normal.x + util.randInt(-2, 2), y: normal.y + util.randInt(-2, 2)},
			acc: {x: 0, y: 0},
			frame: PARTICLE_FRAMES[color]
		};
		
		
		this.createParticle(position, attributes);
	}
};




// CREATE_CASTING_PARTICLE:
// Standard spell particle generator
// Color: [GREEN, PURPLE, RED, BLUE]
// ************************************************************************************************
gs.createCastingParticle = function (tileIndex, color) {
	var position = util.toPosition(tileIndex);
	
	if (!gs.getTile(tileIndex).visible) {
		return;
	}
	return gs.createParticleGenerator({x: position.x, y: position.y + 6},
																   {duration: 'infinite',
																	particleTime: 10,
																	particleLife: 90,
																	particleFadePct: 0.3,
																	particleFrame: PARTICLE_FRAMES[color]});
};

// CREATE_SHIELDS_UP_ANIM:
// ************************************************************************************************
gs.createShieldsUpAnim = function (defender, attackerTileIndex, frame = 1819) {
	let delta = {x: (attackerTileIndex.x - defender.tileIndex.x) / 2, y: (attackerTileIndex.y - defender.tileIndex.y) / 2};
	let pos = util.toPosition(defender.tileIndex);
	let angle;
	
	// Ortho:
	if (delta.x === 0 || delta.y === 0) {
		pos.x += delta.x * 40;
		pos.y += delta.y * 40;
		angle = 225 - util.angleToFace(defender.tileIndex, attackerTileIndex);
	}
	// Angle:
	else {
		pos.x += delta.x * 40;
		pos.y += delta.y * 40;
		frame = frame + 1;
		angle = 180 - util.angleToFace(defender.tileIndex, attackerTileIndex);
	}
	
	let attributes = {
		frame: frame,
		acc: {x: 0, y: 0},
		duration: 30,
	};
	
	let particle = gs.createParticle(pos, attributes);
	
	// Setting angle:
	particle.sprite.angle = angle;
};

// UPADTE_PARTICLES:
// ************************************************************************************************
gs.updateParticles = function () {    
    // Remove dead particles:
    for (let i = this.particleList.length - 1; i >= 0; i -= 1) {
        if (!this.particleList[i].isAlive) {
            this.particleList.splice(i, 1);
        }
    }
    
    for (let i = 0; i < this.particleList.length; i += 1) {
        this.particleList[i].update();
    }
};