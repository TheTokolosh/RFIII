/*global gs*/
/*jshint esversion: 6*/
'use strict';

// CREATE_CLOUD_TYPES:
// ************************************************************************************************
gs.createCloudTypes = function () {
	this.cloudUpdateTurn = {};
	this.cloudCharacterTurnEffect = {};
	this.cloudOnEnterTile = {};
	this.cloudOnDestroy = {};
	this.cloudOnCreate = {};
	
	// POISON_GAS_UPDATE_TURN:
	this.cloudUpdateTurn.PoisonGas = function () {
		if (this.maxSpread > 0 && !this.dontSpread && !this.firstTurn) {
			gs.getIndexListCardinalAdjacent(this.tileIndex).forEach(function (tileIndex) {
				if (gs.isTileIndexTransparent(tileIndex) && !gs.getCloud(tileIndex, this.type.name)) {
					let newGas = gs.createCloud(tileIndex, this.type.name, this.damage, this.life, {maxSpread: this.maxSpread - 1});
					
					if (newGas) {
						newGas.startLife = this.startLife;
						newGas.firstTurn = false;
					}
				}
			}, this);
			
			this.maxSpread = 0; // stop from spreading
		}
	};
	
	// SPREADING_FLAMING_CLOUD_UPDATE_TURN:
	this.cloudUpdateTurn.SpreadingFlamingCloud = function () {
		if (this.maxSpread > 0 && !this.dontSpread && !this.firstTurn) {
			gs.getIndexListCardinalAdjacent(this.tileIndex).forEach(function (tileIndex) {
				if (gs.isTileIndexTransparent(tileIndex) && !gs.getCloud(tileIndex, this.type.name)) {
					let newGas = gs.createCloud(tileIndex, this.type.name, this.damage, this.life, {maxSpread: this.maxSpread - 1});
					
					if (newGas) {
						newGas.startLife = this.startLife;
						newGas.firstTurn = false;
					}
				}
			}, this);
			
			this.maxSpread = 0; // stop from spreading
		}
		
		gs.getIndexListCardinalAdjacent(this.tileIndex).forEach(function (tileIndex) {
			if (gs.canFireSpreadOn(tileIndex)) {
				gs.createCloud(tileIndex, 'FlamingCloud', this.damage, this.startLife);
			}
		}, this);
	};
	
	// SMOKE_UPDATE_TURN:
	this.cloudUpdateTurn.Smoke = function () {
		//if (this.sprite.frame === this.type.frame) {
		if (this.life === 1) {
			this.sprite.frame = this.type.frame + 1;
		}
	};
	
	// POISON_GAS_CHARACTER_TURN_EFFECT:
	this.cloudCharacterTurnEffect.PoisonGas = function (character) {
		if (!character.isGasImmune) {
			character.takeDamage(this.damage, 'Toxic', {killer: 'Gas'});
		}
	};
	
	// FLAMING_CLOUD_CHARACTER_TURN_EFFECT:
	this.cloudCharacterTurnEffect.FlamingCloud = function (character) {
		if (!character.type.isFlamingCloudImmune) {
			character.takeDamage(this.damage, 'Fire', {killer: 'FlamingCloud'});
		}
	};
	
	// FLAMING_CLOUD_UPDATE_TURN:
	this.cloudUpdateTurn.FlamingCloud = function () {
		gs.getIndexListCardinalAdjacent(this.tileIndex).forEach(function (tileIndex) {
			if (gs.canFireSpreadOn(tileIndex)) {
				gs.createCloud(tileIndex, 'FlamingCloud', this.damage, this.startLife);
			}
		}, this);
	};
	
	// FREEZING_CLOUD_CHARACTER_TURN_EFFECT:
	this.cloudCharacterTurnEffect.FreezingCloud = function (character) {
		character.takeDamage(this.damage, 'Cold', {killer: 'FreezingCloud'});
	};
	
	// FREEZING_CLOUD_ON_CREATE:
	this.cloudOnCreate.FreezingCloud = function () {
		if (gs.getTile(this.tileIndex).type.name === 'Water' && !gs.getObj(this.tileIndex)) {
			gs.createObject(this.tileIndex, 'Ice');
		}
		
		if (gs.getTile(this.tileIndex).type.name === 'Lava' && !gs.getObj(this.tileIndex)) {
			gs.createObject(this.tileIndex, 'Obsidian');
		}
	};
	
	// FLAMING_CLOUD_ON_DESTROY:
	this.cloudOnDestroy.FlamingCloud = function () {
		gs.createCloud(this.tileIndex, 'Smoke', 0, 2);
	};
	
	// FLAMING_CLOUD_ON_CREATE:
	this.cloudOnCreate.FlamingCloud = function () {
		// Destroy Flammable Objects:
		if (gs.getObj(this.tileIndex, obj => obj.type.isFlammable)) {
			gs.destroyObject(gs.getObj(this.tileIndex));
		}
		
		// Destroy Ice:
		if (gs.getObj(this.tileIndex, obj => obj.type.name === 'Ice')) {
			gs.destroyObject(gs.getObj(this.tileIndex));
		}	
	};
	
	// Create Cloud Types:
	this.cloudTypes = {
		WallOfForce: {
			frame: 1643,
			alpha: 0.75,
			isPassable: false,
		},
		
		IceBlock: {
			frame: 1642,
			alpha: 1.0,
			isPassable: false,
		},
		
		PoisonGas: {
			niceName: 'Poison Cloud',
			frame: 1600,
			alpha: 0.75,
			updateTurn: this.cloudUpdateTurn.PoisonGas,
			characterTurnEffect: this.cloudCharacterTurnEffect.PoisonGas,
			isFlammable: true,
			isDangerous: true,
		},
		
		PoisonCloud: {
			niceName: 'Poison Cloud',
			frame: 1600,
			alpha: 0.75,
			characterTurnEffect: this.cloudCharacterTurnEffect.PoisonGas,
			isFlammable: true,
			isDangerous: true,
		},
		
		FreezingCloud: {
			frame: 1601,
			alpha: 0.6,
			isConductive: true,
			characterTurnEffect: this.cloudCharacterTurnEffect.FreezingCloud,
			onCreate: this.cloudOnCreate.FreezingCloud,
			isDangerous: true,
		},
		
		FlamingCloud: {
			frame: 1603,
			alpha: 0.60,
			updateTurn: this.cloudUpdateTurn.FlamingCloud,
			characterTurnEffect: this.cloudCharacterTurnEffect.FlamingCloud,
			onCreate: this.cloudOnCreate.FlamingCloud,
			onDestroy: this.cloudOnDestroy.FlamingCloud,
			isDangerous: true,
			canBurstOfFlame: true,
		},
		
		SpreadingFlamingCloud: {
			frame: 1603,
			alpha: 0.60,
			updateTurn: this.cloudUpdateTurn.SpreadingFlamingCloud,
			characterTurnEffect: this.cloudCharacterTurnEffect.FlamingCloud,
			isDangerous: true,
			niceName: 'Flaming Cloud',
			canBurstOfFlame: true,
		},
		
		SpreadingFreezingCloud: {
			frame: 1601,
			alpha: 0.6,
			updateTurn: this.cloudUpdateTurn.PoisonGas,
			characterTurnEffect: this.cloudCharacterTurnEffect.FreezingCloud,
			onCreate: this.cloudOnCreate.FreezingCloud,
			isConductive: true,
			isDangerous: true,
			niceName: 'Freezing Cloud',
		},
		
		Smoke: {
			frame: 1604,
			alpha: 0.75,
			updateTurn: this.cloudUpdateTurn.Smoke,
		},
		
		ChargeSmoke: {
			frame: 1604,
			alpha: 0.75,
			niceName: 'Smoke',
		},
		
		WhiteSmoke: {
			frame: 1606,
			alpha: 0.75,
			isTransparent: false,
		},
		
		Steam: {
			frame: 1606,
			alpha: 0.75,
			isTransparent: false,
			isConductive: true,
			updateTurn: this.cloudUpdateTurn.PoisonGas,
		},
		
		Dust: {
			frame: 1608,
			alpha: 0.5,
			isTransparent: false,
		}
	};
	
	this.nameTypes(this.cloudTypes);
	
	this.forEachType(this.cloudTypes, function (type) {
		if (!type.hasOwnProperty('isTransparent')) {
			type.isTransparent = true;
		}
		
		if (!type.hasOwnProperty('isPassable')) {
			type.isPassable = true;
		}
	}, this);
};
