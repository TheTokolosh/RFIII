/*global Phaser, util, game, gs, console, TILE_SIZE*/
/*global GREEN_TARGET_BOX_FRAME, RED_SELECT_BOX_FRAME, PURPLE_SELECT_BOX_FRAME*/
/*global MAX_ABILITIES, ITEM_ABILITY_MULTIPLIER_PER_LEVEL, ITEM_SLOT, STAT_AS_PERCENT, ROMAN_NUMERAL*/
/*jshint laxbreak: true, esversion: 6, loopfunc: true*/
'use strict';

// CONSTRUCTOR:
// Abilities is an object that can be added to characters to grant them abilities
// ************************************************************************************************
function Abilities(character) {
	this.character = character;
	this.list = [];
	this.clear();
}

// GET_ABILITY:
// Returns the ability if it exists or null
// ************************************************************************************************
Abilities.prototype.getAbility = function (abilityTypeName) {
	return this.list.find(ability => ability && ability.type.name === abilityTypeName);
};

// GET_ABILITY_INDEX:
Abilities.prototype.getAbilityIndex = function (abilityTypeName) {
	for (let i = 0; i < this.list.length; i += 1) {
		if (this.list[i] && this.list[i].type.name === abilityTypeName) {
			return i;
		}
	}
	return -1;
};

// UPDATE_TURN:
// Ticks cooldowns:
// ************************************************************************************************
Abilities.prototype.updateTurn = function () {
	let abilityList = this.list.filter(ability => ability);
	
	abilityList.forEach(function (ability) {
		// Don't tick on first turn:
		if (ability.firstTurn) {
			ability.firstTurn = false;
			return;
		}
		
		// Cool Downs:
		if (ability.coolDown > 0) {
			ability.coolDown -= 1;
			
			if (this.character === gs.pc && ability.coolDown === 0) {
				this.character.popUpText(gs.capitalSplit(ability.type.name) + ' ready');
			}
		}
	}, this);
};

// RESET_ALL_COOLDOWNS:
// ************************************************************************************************
Abilities.prototype.resetAllCoolDowns = function () {
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		if (this.list[i]) {
			this.list[i].coolDown = 0;
			this.list[i].firstTurn = false;
		}
	}
};

// HAS_COOL_DOWN:
// ************************************************************************************************
Abilities.prototype.hasCoolDown = function () {
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		if (this.list[i] && this.list[i].coolDown > 0) {
			return true;
		}
	}
	return false;
};

// ABILITY_IN_SLOT:
// Returns the ability in the slot or null if no ability
// ************************************************************************************************
Abilities.prototype.abilityInSlot = function (slot) {
	return this.list[slot];
};

// CLEAR:
// ************************************************************************************************
Abilities.prototype.clear = function () {
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		this.list[i] = null;
	}
};

// ADD_ABILITY:
// Returns the slot
// ************************************************************************************************
Abilities.prototype.addAbility = function (type) {
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		if (this.list[i] === null) {
			this.list[i] = {
				type: type, 
				coolDown: 0,
				firstTurn: false,
				isOn: false
			};
			return i;
		}
	}
	
	throw 'Max abilities exceeded: have not implemented checks for this yes';
};

// REMOVE_ABILITY:
// Returns the slot
// ************************************************************************************************
Abilities.prototype.removeAbility = function (type) {
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		if (this.list[i] && this.list[i].type === type) {
			this.list[i] = null;
			return i;
		}
	}
	
	throw 'Could not remove ability...';
};

// TO_DATA:
// ************************************************************************************************
Abilities.prototype.toData = function () {
	var data = [];
	
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		if (this.list[i]) {
			data[i] = {
				typeName: 		this.list[i].type.name,
				coolDown: 		this.list[i].coolDown,
				firstTurn:		this.list[i].firstTurn,
				isOn: 			this.list[i].isOn
			};
		}
		else {
			data[i] = null;
		}
	}
	
	return data;
};

// LOAD_DATA:
// ************************************************************************************************
Abilities.prototype.loadData = function (data) {
	for (let i = 0; i < MAX_ABILITIES; i += 1) {
		if (data[i]) {
			this.list[i] = {
				type: 			gs.abilityTypes[data[i].typeName],
				firstTurn:		data[i].firstTurn,
				coolDown: 		data[i].coolDown,
				isOn: 			data[i].isOn
			};
		}
		else {
			this.list[i] = null;
		}
	}
};

// CREATE_NPC_ABILITY_TYPE:
// Used by NPCs to create unique abilityTypes giving them each their own unique abilities
// ************************************************************************************************
gs.createNPCAbilityType = function (npcType, abilityTypeName, abilityStats) {
	var abilityType, key;
	
	if (!this.abilityTypes[abilityTypeName]) {
		throw 'createNPCAbilityType - undefined abilityType: ' + abilityTypeName;
	}
	
	// abilityType is now a copy of the abilityType specified in the template:
	abilityType = Object.create(this.abilityTypes[abilityTypeName]);
	
	// We now grab whatever additional properties we need:
	for (key in abilityStats) {
		if (abilityStats.hasOwnProperty(key)) {
			
			if (key === 'range') {
				var range = abilityStats.range;
				abilityType.range = function () {
					return range;
				};
			}
			else if (key === 'aoeRange') {
				var aoeRange = abilityStats.aoeRange;
				abilityType.aoeRange = function () {
					return aoeRange;
				};
			}
			else {
				abilityType[key] = abilityStats[key];
			}
		}
	}
	
	// Attributes:
	if (abilityType.attributes) {
		let attributes = Object.create(abilityType.attributes);
		
		// Damage (scaled by level):
		if (attributes.damage) {
			let damage = Object.create(attributes.damage);
			
			// Damage Type i.e. LOW, MEDIUM, HIGH etc.
			if (abilityStats && abilityStats.damage) {
				
				
				damage.damage = abilityStats.damage;
				
				damage.value = function (character) {
					return gs.npcDamage(character.level, this.damage);
				};
			}
			// Setting damage directly:
			else if (abilityStats && abilityStats.baseDamage) {
				damage.value = function (character) {
					return abilityStats.baseDamage;
				};
			}
			// No Damage:
			else {
				damage.value = function (character) {
					return 0;
				};
			}
			
			attributes.damage = damage;
		}
		
		// Duration (defaults to min):
		if (attributes.duration) {
			let duration = Object.create(attributes.duration);
			
			// Setting duration directly:
			if (abilityStats && abilityStats.duration) {
				duration.value = function (character) {
					return abilityStats.duration;
				};
			}
			// Default to min:
			else {
				duration.value = function (character) {
					return this.base[1];
				};
			}
			
			attributes.duration = duration;
		}
		
		// Knock Back (defaults to min):
		if (attributes.knockBack) {
			let knockBack = Object.create(attributes.knockBack);
			
			// Setting duration directly:
			if (abilityStats && abilityStats.knockBack) {
				knockBack.value = function (character) {
					return abilityStats.knockBack;
				};
			}
			// Default to min:
			else {
				knockBack.value = function (character) {
					return this.base[1];
				};
			}
			
			attributes.knockBack = knockBack;
		}
		
		// Damage Multiplier:
		if (attributes.damageMultiplier) {
			let damageMultiplier = Object.create(attributes.damageMultiplier);
			damageMultiplier.value = function (character) {
				return this.base[1];
			};
			attributes.damageMultiplier = damageMultiplier;
		}
		
		// Heal Hp:
		if (attributes.healHp) {
			let healHp = Object.create(attributes.healHp);
			healHp.value = function (character) {
				return this.base[1];
			};
			attributes.healHp = healHp;
		}
		
		abilityType.attributes = attributes;
	}

	
	return abilityType;
};


// CREATE_ITEM_ABILITY_TYPE:
// ************************************************************************************************
gs.createItemAbilityType = function (itemType) {
	var abilityType;
	
	if (!this.abilityTypes[itemType.useEffect]) throw 'undefined abilityType: ' + itemType.useEffect;
	
	// abilityType is now a copy of the abilityType specified in the template:
	abilityType = Object.create(this.abilityTypes[itemType.useEffect]);
	
	abilityType.frame = itemType.f;
	abilityType.mana = 0;
	abilityType.name = itemType.name;
	abilityType.niceName = itemType.niceName;
	abilityType.itemType = itemType;
	
	// Attributes:
	if (abilityType.attributes) {
		let attributes = Object.create(abilityType.attributes);
		
		// Damage (scaled by modifier):
		if (attributes.damage) {
			let damage = Object.create(attributes.damage);
			
			damage.value = function (actingChar) {
				// Range Damage Modifier:
				if (this.modifier === 'bonusRangeDamage') {
					return Math.round((this.base[1] + actingChar.bonusRangeDamage + (actingChar.dexterity - 10)) * actingChar.rangeDamageMultiplier);
					
				}
				else if (this.modifier === 'magicPower') {
					let mod = Math.round((actingChar.magicPower + actingChar.abilityPower) * 100) / 100;
					return Math.ceil(this.base[1] * (mod + 1.0));
				}
				// Modifier:
				else if (this.modifier) {
					return Math.round(this.base[1] * (actingChar[this.modifier] + 1.0));
				}
				else {
					return this.base[1];
				}
			};
			
			damage.baseVal = function (character) {
				return this.base[1];
			};
			
			attributes.damage = damage; 
		}
		

		// Duration (scaled by modifier):
		if (attributes.duration) {
			let duration = Object.create(attributes.duration);
			
			duration.value = function (actingChar) {
				// Modifier:
				if (this.modifier) {
					return Math.round(this.base[1] * (actingChar[this.modifier] + 1.0));
				}
				else {
					return this.base[1];
				}
			};
			
			duration.baseVal = function (character) {
				return this.base[1];
			};
			
			attributes.duration = duration; 
		}
		
		// Num Summoned (scaled by modifier):
		if (attributes.numSummoned) {
			let numSummoned = Object.create(attributes.numSummoned);
			
			numSummoned.value = function (actingChar) {
				// Modifier:
				if (this.modifier) {
					return Math.round(this.base[1] * (actingChar[this.modifier] + 1.0));
				}
				else {
					return this.base[1];
				}
			};
			
			numSummoned.baseVal = function (character) {
				return this.base[1];
			};
			
			attributes.numSummoned = numSummoned; 
		}
		
		// Monster Level (scaled by modifier):
		if (attributes.monsterLevel) {
			let monsterLevel = Object.create(attributes.monsterLevel);
			
			monsterLevel.value = function (actingChar) {
				// Modifier:
				if (this.modifier) {
					return Math.round(this.base[1] * (actingChar[this.modifier] + 1.0));
				}
				else {
					return this.base[1];
				}
			};
			
			monsterLevel.baseVal = function (character) {
				return this.base[1];
			};
			
			attributes.monsterLevel = monsterLevel; 
		}

		// Range (set to max):
		if (attributes.range) {
			let range = Object.create(attributes.range);
			
			range.value = function (character) {
				if (this.modifier === 'bonusProjectileRange') {
					return this.base[this.base.length - 1] + character.bonusProjectileRange;
				}
				else {
					return this.base[this.base.length - 1];
				}
				
			};
			
			range.baseVal = function (character) {
				return this.base[this.base.length - 1];
			};
			
			attributes.range = range;
		}
		
		// Aoe Range (set to max):
		if (attributes.aoeRange) {
			let aoeRange = Object.create(attributes.aoeRange);
			
			aoeRange.value = function (character) {
				return this.base[this.base.length - 1];
			};
			
			aoeRange.baseVal = function (character) {
				return this.base[this.base.length - 1];
			};
			
			attributes.aoeRange = aoeRange;
		}
		
		// maxPath (set to max):
		if (attributes.maxPath) {
			let maxPath = Object.create(attributes.maxPath);
			
			maxPath.value = function (character) {
				return this.base[this.base.length - 1];
			};
			
			maxPath.baseVal = function (character) {
				return this.base[this.base.length - 1];
			};
			
			attributes.maxPath = maxPath;
		}
		
		// knockBack (set to max):
		if (attributes.knockBack) {
			let knockBack = Object.create(attributes.knockBack);
			
			knockBack.value = function (character) {
				return this.base[this.base.length - 1];
			};
			
			knockBack.baseVal = function (character) {
				return this.base[this.base.length - 1];
			};
			
			attributes.knockBack = knockBack;
		}
		
		
		
		
		abilityType.attributes = attributes;
	}
	
	
	
	
	// If New ability (i.e. charm) need to add it to list:
	if (!gs.abilityTypes.hasOwnProperty(abilityType.name)) {
		gs.abilityTypes[abilityType.name] = abilityType;
	}
	
	return abilityType;
};


// ABILITY_DESC:
// ************************************************************************************************
gs.abilityDesc = function (ability, item) {
	var str = '', desc = {};
	

	// Ability Name:
	if (!item) {
		desc.title = ability.type.niceName;
		
		if (gs.pc.talents.getTalentRank(ability.type.name)) {
			desc.title += ' ' + ROMAN_NUMERAL[gs.pc.talents.getTalentRank(ability.type.name)];
		}
	}
	else {
		desc.title = '';
	}
	
	// Sustained:
	if (ability.type.isSustained) {
		str += 'Sustained Effect' + '\n';
	}
	
	// Mana:
	if (ability.type.mana) {
		str += '*Mana: ' + ability.type.mana;
		
		if (gs.pc.manaCost(ability) !== ability.type.mana) {
			str += ' [' + gs.pc.manaCost(ability) + ']';
		}
		
		str += '\n';
	}
	
	// Hit Points:
	if (ability.type.hitPointCost) {
		str += '*Hit Points: ' + ability.type.hitPointCost + '\n';
	}
	
	// Cool Down:
	if (ability.type.coolDown) {
		if (gs.pc.coolDownModifier) {
			str += '*Cool Down: ' + ability.type.coolDown + ' [' + (ability.type.coolDown - Math.ceil(ability.type.coolDown * gs.pc.coolDownModifier)) + ']\n';
		}
		else {
			str += '*Cool Down: ' + ability.type.coolDown + '\n';
		}
	}
	
	// Attributes:
	if (ability.type.attributes) {
		this.forEachType(ability.type.attributes, function (attribute) {
			// Melee Damage (special case):
			if (attribute.name === 'meleeDamageMultiplier' && ability.type.canUse(gs.pc)) {
				str += '*Damage: ';
				str += Math.ceil(gs.pc.weaponDamage() * attribute.value(gs.pc));
				str += '\n';
			}
			// Range Damage (special case):
			else if (attribute.name === 'rangeDamageMultiplier' && ability.type.canUse(gs.pc)) {
				str += '*Damage: ';
				str += Math.ceil(gs.pc.rangeWeaponDamage() * attribute.value(gs.pc));
				str += '\n';
			}
			// Modified Attributes:
			else if (attribute.baseVal(gs.pc) !== attribute.value(gs.pc)) {
				str += '*' + gs.capitalSplit(attribute.name) + ': ';
				
				str += attribute.baseVal(gs.pc) + ' [' + attribute.value(gs.pc) + ']\n';
			}
			// Unmodified attribute:
			else {
				// Discord:
				if (attribute.name === 'damageMultiplier' && ability.type.name === 'Discord') {
					str += '*Damage Multiplier: ';
					str += attribute.value(gs.pc);
					str += '\n';
				}				
				else if (attribute.name === 'healPercent') {
					str += '*Heal HP: ';
					str += Math.ceil(gs.pc.maxHp * attribute.value(gs.pc));
					str += '\n';
				}
				else if (attribute.name === 'mpPercent') {
					str += '*Restore MP: ';
					str += Math.ceil(gs.pc.maxMp * attribute.value(gs.pc));
					str += '\n';
				}
				else if (STAT_AS_PERCENT[attribute.name]) {
					str += '*' + gs.capitalSplit(attribute.name) + ': ';
					str += util.toPercentStr(attribute.baseVal(gs.pc)) +'\n';
				}
				else if (attribute.name === 'aoeRange') {
					if (attribute.baseVal(gs.pc) === 0) {
						// Pass
					}
					else {
						str += '*' + gs.capitalSplit(attribute.name) + ': ';
						str += attribute.baseVal(gs.pc) +'\n';
					}
					
				}
				else {
					str += '*' + gs.capitalSplit(attribute.name) + ': ';
					str += attribute.baseVal(gs.pc) +'\n';
				}
			}
		}, this);
	}
	
	
	
	// Ability Desc:
	if (typeof ability.type.desc === 'function' && ability.type.desc()) {
		str += '\n';
		str += ability.type.desc(gs.pc.talents.getTalentRank(ability.type.name));
	}
	else if (ability.type.desc) {
		str += '\n';
		str += ability.type.desc;
	}
	
	desc.text = str;
	
	return desc;
};

// CREATE_ABILITY_TYPES:
// ********************************************************************************************
gs.createAbilityTypes = function () {
	this.abilityTypes = {};
	
	this.createAbilityHelpers();
	this.createPlayerAbilityTypes();
	this.createNPCAbilityTypes();
	this.createItemAbilityTypes();
	this.createNPCOnDeathTypes();
	this.createNPCUpdateTurnTypes();
	
	this.setAbilityStats();
};