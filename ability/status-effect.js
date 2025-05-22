/*global gs, util*/
/*global FACTION, DAMAGE_TYPE, LOS_DISTANCE, STATUS_EFFECT_BREAK_LOS_TURNS*/
/*jshint esversion: 6*/
'use strict';

// STATUS_EFFECTS:
// Added to characters to maintain and manage their list of status effects
// ************************************************************************************************
function StatusEffects (character) {
	this.character = character;
	this.list = [];
}

// CLEAR:
// ************************************************************************************************
StatusEffects.prototype.clear = function () {
	this.list.forEach(function (statusEffect) {
		this.destroyStatusEffect(statusEffect);
	}, this);
	this.list = [];
};

// ON_UPDATE_TURN:
// ************************************************************************************************
StatusEffects.prototype.onUpdateTurn = function () {
	// Apply status effects:
	for (let i = 0; i < this.list.length; i += 1) {
		let statusEffect = this.list[i];
		
		statusEffect.onUpdateTurn(this.character);
		
		// Immediately halt if character was killed by one of his status effects:
		if (!this.character.isAlive) {
			return;
		}
	}
	
	// Tick Duration and Destroy:
	for (let i = this.list.length - 1; i >= 0; i -= 1) {
		let statusEffect = this.list[i];
		
		// Its possible that the status effect does not exist:
		// Constrict is at list[1] and Smite is at list[2]
		// Smite executes first and kills the constricting character which removes constrict
		if (!statusEffect) {
			continue;
		}
		
		// Tick Duration:
		if (!statusEffect.noDuration && !statusEffect.dontTickDuration && !statusEffect.firstTurn) {
			statusEffect.duration -= 1;
		}
		statusEffect.firstTurn = false;
		
		// Tick LoS countdown on PC (only PC):
		// When the player breaks LoS some status effects will quickly fade
		if (statusEffect.requiresLoS && this.character === gs.pc) {
			var casterChar = gs.getCharWithID(statusEffect.casterId);
		
			if (casterChar) {
				if (!gs.isRayClear(this.character.tileIndex, casterChar.tileIndex) || util.distance(this.character.tileIndex, casterChar.tileIndex) > LOS_DISTANCE) {
					statusEffect.noLoSTurns += 1;
				}
				else {
					statusEffect.noLoSTurns = 0;
				}
			}
		}
		
		
		// Requires LoS:
		let noLoS =  statusEffect.requiresLoS && (!gs.getCharWithID(statusEffect.casterId) || statusEffect.noLoSTurns >= STATUS_EFFECT_BREAK_LOS_TURNS);
		
		
		// Destroy:
		if (statusEffect.duration <= 0 || statusEffect.shouldDestroy(this.character) || noLoS) {
			this.list.splice(i, 1);
			
			this.destroyStatusEffect(statusEffect);
			
			// Stop the player from resting if a status effect has worn off:
			if (this.character.actionQueue.length > 0 && this.character.actionQueue[this.character.actionQueue.length - 1].type === 'WAIT') {
				this.actionQueue = [];
			}
		}
	}
};

// ON_NPC_DEATH:
StatusEffects.prototype.onNPCDeath = function () {
	for (let i = this.list.length - 1; i >= 0; i -= 1) {
		if (this.list[i].shouldDestroy(this.character)) {
			this.destroyStatusEffect(this.list[i]);
			this.list.splice(i, 1);
		}
	}		
};


// ON_UPDATE_STATS:
// ************************************************************************************************
StatusEffects.prototype.onUpdateStats = function () {
	this.list.forEach(function (statusEffect) {
		statusEffect.onUpdateStats(this.character);
	}, this);
};

// HAS:
// Returns true if the character has the status effect of type name
// ************************************************************************************************
StatusEffects.prototype.has = function (typeName) {
	return Boolean(this.get(typeName));
};

// GET:
// Returns the status effect with the specified typeName:
// ************************************************************************************************
StatusEffects.prototype.get = function (typeName) {
	return this.list.find(statusEffect => statusEffect.name === typeName);
};

// ADD:
// Adds a status effect
// ************************************************************************************************
StatusEffects.prototype.add = function (typeName, properties, flags = {}) {
	var newStatusEffect, oldStatusEffect;
	
	if (!this.character.isAlive) {
		return;
	}
	
	if (this.character.faction === FACTION.NEUTRAL || this.character.isDamageImmune) {
		return;
	}
	
	// Immune:
	if (util.inArray(typeName, this.character.type.statusEffectImmunities)) {
		this.character.popUpText('Immune'); 
		return;
	}
	
	// Mental Resistance:
	if (this.character.mentalResistance && util.inArray(typeName, ['Confusion', 'NPCCharm', 'Feared'])) {
		this.character.popUpText('Resisted ' + gs.statusEffectTypes[typeName].niceName); 
		return;
	}
	
	newStatusEffect = this.createStatusEffect(typeName, properties);
	
	// Existing status effect:
	if (this.has(newStatusEffect.name) && !newStatusEffect.canStack) {
		oldStatusEffect = this.get(newStatusEffect.name);
		
		if (newStatusEffect.addDuration) {
			oldStatusEffect.duration += newStatusEffect.duration;
		}
		else {
			oldStatusEffect.duration = newStatusEffect.duration;
		}
	}
	// New status effect:
	else {
		// Creating new effect:
		newStatusEffect.onCreate(this.character);
		this.list.push(newStatusEffect);
		
		// Creating Lighting:
		if (!this.character.light && newStatusEffect.lightColor) {
			newStatusEffect.light = gs.createLightCircle(this.character.sprite.position, newStatusEffect.lightColor, 40, 0, newStatusEffect.lightAlpha);
			newStatusEffect.light.fade = false;
			newStatusEffect.light.noLife = true;
			this.character.light = newStatusEffect.light;
		}

		// requiresLoS:
		if (newStatusEffect.requiresLoS) {
			newStatusEffect.noLoSTurns = 0;
		}
		
		// Pop Up Text:
		if (gs.getTile(this.character.tileIndex).visible && !newStatusEffect.dontPopUpText && !flags.dontPopUpText) {
			this.character.popUpText(gs.capitalSplit(newStatusEffect.niceName)); 
		}
	}
	
	this.character.updateStats();
	
	if (this.character.isImmobile) {
		this.remove('Charge');
		this.remove('SlowCharge');
	}
	
	return newStatusEffect || oldStatusEffect; 
};

// CREATE_STATUS_EFFECT:
// ************************************************************************************************
StatusEffects.prototype.createStatusEffect = function (typeName, properties = {}) {
	var statusEffect;
	
	if (!gs.statusEffectTypes.hasOwnProperty(typeName)) {
		throw typeName + ' is not a valid statusEffectType';
	}
	
	// Create a copy of the base statusEffectType:
	statusEffect = Object.create(gs.statusEffectTypes[typeName]);
	
	// Property list remembers which properties to save when serializing toData (Always serialize duration):
	statusEffect.propertyList = ['duration'];
	
	statusEffect.firstTurn = true;
	
	for (let key in properties) {
		if (properties.hasOwnProperty(key)) {
			// First copying over the properties to the new statusEffect
			statusEffect[key] = properties[key];
				
			// Recording which properties to serialize:
			statusEffect.propertyList.push(key);
		}
	}
	
	return statusEffect;
};

// REMOVE:
// Removes and destroys all status effect
// ************************************************************************************************
StatusEffects.prototype.remove = function (typeName) {
	var statusEffect;
	
	// Remove from list:
	for (let i = 0; i < this.list.length; i += 1) {
		if (this.list[i].name === typeName) {
			statusEffect = this.list[i];
			this.list.splice(i, 1);
			break;
		}
	}
	
	// Destroy:
	if (statusEffect) {	
		this.destroyStatusEffect(statusEffect);
		this.character.updateStats();
	}
};

// REMOVE_ALL:
// Removes and destroys all status effects
// ************************************************************************************************
StatusEffects.prototype.removeAll = function () {
	this.list.forEach(function (statusEffect) {
		this.destroyStatusEffect(statusEffect);
	}, this);
	
	this.list = [];
};

// DESTROY_STATUS_EFFECT:
// ************************************************************************************************
StatusEffects.prototype.destroyStatusEffect = function (statusEffect) {
	// Destroy lighting:
	if (statusEffect.light) {
		statusEffect.light.destroy();
		this.character.light = null;
	}
	
	statusEffect.onDestroy(this.character);
};

// ON_CHANGE_LEVEL:
// Called when the player is zoning to remove status effects that are destroyed on zoning:
// ************************************************************************************************
StatusEffects.prototype.onChangeLevel = function () {
	for (let i = this.list.length - 1; i >= 0; i -= 1) {
		if (this.list[i].destroyOnZoning) {
			this.remove(this.list[i].name);
		}
	}
};

// ON_AGRO_PLAYER:
// ************************************************************************************************
StatusEffects.prototype.onAgroPlayer = function () {
	if (this.has('DeepSleep')) {
		this.remove('DeepSleep');
	}
};



// ON_TELEPORT:
// Called when the character teleports
// ************************************************************************************************
StatusEffects.prototype.onTeleport = function () {
	if (this.has('Immobile')) {
		this.remove('Immobile');
	}
	
	if (this.has('Constricted')) {
		this.remove('Constricted');
	}

	if (this.has('Charge')) {
		this.remove('Charge');
	}
};

// ON_CHANGE_EQUIPMENT:
// Called when the character changes equipment
// ************************************************************************************************
StatusEffects.prototype.onChangeEquipment = function () {
	if (this.has('Deflect') && !this.character.inventory.hasShieldEquipped()) {
		this.remove('Deflect');
	}
};

// ON_START_TURN:
// ************************************************************************************************
StatusEffects.prototype.onStartTurn = function () {
	if (this.has('ShieldsUp')) {
		this.remove('ShieldsUp');
	}
};

// ON_KILL:
// ************************************************************************************************
StatusEffects.prototype.onKill = function () {
	for (let i = this.list.length - 1; i >= 0; i -= 1) {
		this.list[i].onKill(this.character);
	}
};

// ON_END_TURN:
// Called when the character ends his turn
// ************************************************************************************************
StatusEffects.prototype.onEndTurn = function () {
	for (let i = this.list.length - 1; i >= 0; i -= 1) {
		this.list[i].onEndTurn(this.character);
	}
	
	if (this.has('Charge')) {
		this.remove('Charge');
	}
	
};

// ON_OPEN_DIALOG:
// ************************************************************************************************
StatusEffects.prototype.onOpenDialog = function () {
	if (this.has('Charge')) {
		this.remove('Charge');
	}
};

// ON_TAKE_DAMAGE:
// ************************************************************************************************
StatusEffects.prototype.onTakeDamage = function (damageType, amount, flags) {
	if (!this.character.isAlive) {
		return;
	}
	
	// Cold attacks will slow:
	if (damageType === DAMAGE_TYPE.COLD && this.character.resistance.Cold < 0.40 && !this.character.type.isImmobile) {
		// Cold Resistance mitigates the damage:
		amount = amount - amount * this.character.resistance.Cold;
		
		// Duration is based on percent of max HP lost:
		let duration = (amount / this.character.maxHp) * 25;
		
		// Max slow is 10
		duration = Math.min(10, duration);
		
		// Round down for small damage:
		duration = Math.floor(duration);
		
		// Add to existing existing (but respect the max cap of 10):
		if (this.has('Slow')) {
			this.get('Slow').duration = Math.min(10, this.get('Slow').duration + duration);
		}
		else {
			this.add('Slow', {duration: duration});
		}
		
	}
	
	// Run it backwards in case they want to remove themselves:
	for (let i = this.list.length - 1; i >= 0; i -= 1) {
		this.list[i].onTakeDamage(this.character, damageType, flags);
	}
};

// ON_CURE:
// ************************************************************************************************
StatusEffects.prototype.onCure = function () {
	if (this.has('InfectiousDisease')) {
		this.remove('InfectiousDisease');
	}
	
	if (this.has('LifeSpike')) {
		this.remove('LifeSpike');
	}
	
	if (this.has('Draining')) {
		this.remove('Draining');
	}
	
	if (this.has('Slow')) {
		this.remove('Slow');
	}
};

// ON_MENTAL_CURE:
// ************************************************************************************************
StatusEffects.prototype.onMentalCure = function () {
	// Cure Confusion:
	if (this.has('Confusion')) {
		this.remove('Confusion');
	}
	
	if (this.has('NPCCharm')) {
		this.remove('NPCCharm');
	}
};

// TO_DATA:
// ************************************************************************************************
StatusEffects.prototype.toData = function () {
	var data = [];
	
	this.list.forEach(function (statusEffect) {
		if (!statusEffect.dontSave) {
			data.push(statusEffect.toData());
		}
	}, this);
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
StatusEffects.prototype.loadData = function (data) {
	for (let i = 0; i < data.length; i += 1) {
		let statusEffect = this.add(data[i].typeName, data[i].properties, {dontPopUpText: true});
		statusEffect.duration = data[i].properties.duration;
	}
};

// TO_UI_STRING:
// ************************************************************************************************
StatusEffects.prototype.toUIString = function () {
	var str = '';
	
	// Symbols for each status effect:
	this.list.forEach(function (statusEffect) {
		str += statusEffect.uiSymbol;
	}, this);
	
	// Poison: P
	// Don't double display if the character also has the Strong Poison effect from staves
	if (this.character.poisonDamage > 0 && !this.has('StrongPoison')) {
		str += 'P';
	}
	
	return str;
};