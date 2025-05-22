/*global gs, game, console*/
/*global PlayerCharacter, Character, NPC*/
/*global PC_MAX_HP_PER_XL, DAMAGE_TYPE, ROMAN_NUMERAL, YENDOR_MAX_HP*/
/*global HP_REGEN_TIME, MP_REGEN_TIME*/
/*global CHARACTER_SIZE, CRIT_MULTIPLIER*/
/*global MAX_REFLECTION, MAX_RESISTANCE, MAX_EVASION, MAX_COOL_DOWN_MODIFIER*/
/*global PC_BASE_MAX_HP, PC_BASE_MAX_MP, PC_BASE_MAX_SP, PC_BASE_MAX_FOOD, MAX_PC_HP_REGEN*/
/*global PC_BASE_MP_REGEN_TURNS*/
/*global MOVEMENT_SPEED, MOVE_TIME, PC_HP_REGEN, PC_BASE_SP_REGEN_TURNS*/
/*global PC_HP_PER_STR, PC_MAX_MP_PER_INT, PC_ABILITY_POWER_PER_INT, PC_EVASION_PER_DEX*/
/*global PC_ABILITY_POWER_PENALTY_PER_ENC*/
/*global achievements*/
/*jshint esversion: 6*/
'use strict';



// UPDATE_STATS:
// ************************************************************************************************
Character.prototype.updateStats = function (tempStats = {}) {
	// Zero Out Bonus Stats:
	this.bonusExpMod = 0;
	this.bonusGoldMod = 0;
	this.bonusProjectileRange = 0;
	this.maxHpModifier = 0;
	this.lifeTap = 0;
	this.manaTap = 0;
	this.maxRage = 0;
	this.coolDownModifier = 0;
	this.isDamageImmune = this.type.isDamageImmune;
	this.manaConservation = 0;
	
	// STATS:
	this.maxHp = 0;
	this.maxMp = 0;
	this.hpRegenTime = 0;
	this.mpRegenTime = 0;
	this.spRegenTime = 0;
	this.hpRegenAmount = 0;
	this.regenPerTurn = this.type.regenPerTurn;
	
	// OFFENSE:
	this.maxRage = 0;
	this.critMultiplier = CRIT_MULTIPLIER;
	this.bonusMeleeDamage = 0;
	this.bonusRangeDamage = 0;
	this.bonusStaffDamage = 0;
	this.lungeDamageMultiplier = 0;
	this.meleeDamageMultiplier = 1.0;
	this.rangeDamageMultiplier = 1.0;
	this.staffDamageMultiplier = 1.0;
	
	// ABILITY_MULTIPLIERS:
	this.abilityPower = 0;
	this.magicPower = 0;
	
	// DEFENSE:
	this.movementSpeed = this.type.movementSpeed;
	this.maxSp = 0;
	this.protection = this.type.protection;
	this.reflection = this.type.reflection;
	this.evasion = this.type.evasion;
	this.blockChance = 0;
	this.parryChance = 0;
	this.stealth = 0;
	
	// RESISTANCE:
	this.resistance.Fire = this.type.resistance.Fire;
	this.resistance.Cold = this.type.resistance.Cold;
	this.resistance.Shock = this.type.resistance.Shock;
	this.resistance.Toxic = this.type.resistance.Toxic;
	
	// DAMAGE_SHIELD:
	this.damageShield.Fire = this.type.damageShield.Fire;
	this.damageShield.Cold = this.type.damageShield.Cold;
	this.damageShield.Shock = this.type.damageShield.Shock;
	this.damageShield.Toxic = this.type.damageShield.Toxic;
	this.damageShield.Physical = this.type.damageShield.Physical;
	
	// Flaggy type stuff:
	// Using integers in the case that multiple effects want to set this same flag (they can all just increment by 1);
	// Also because equipment works by adding to the stat (an integer)
	this.isFlying = this.type.isFlying;
	this.isTelepathic = 0;
	this.hasLifeSaving = 0;
	this.isConfused = 0;
	this.isSlowProjectile = this.type.isSlowProjectile;
	this.hasSustenance = 0;
	this.hasSpiritShield = 0;
	this.isFeared = 0;
	this.damageMultiplier = 0;
	this.isDSImmune = 0;
	this.hasBloodVampirism = 0;
	this.mentalResistance = 0;
	this.hasLunge = 0;
	this.isLavaImmune = this.type.isLavaImmune;
	this.isToxicWasteImmune = this.type.isToxicWasteImmune;
	this.isGasImmune = this.type.isGasImmune;
	this.isPoisonImmune = this.type.isPoisonImmune;
	
	// Mostly status effects:
	this.alwaysCrit = 0;
	this.alwaysProjectileCrit = 0;
	this.knockBackOnHit = 0;
	this.isWet = 0;
	this.isFlammable = 0;
	this.isUnstable = 0;
	this.isStunned = 0;
	this.isMarked = 0;
	this.isImmobile = 0;
	this.hasKeenHearing = 0;
	this.hasPerfectAim = 0;
	
	if (this.type.isImmobile) {
		this.isImmobile = 1;
	}
	
	// Size:
	this.size = this.type.size;
	
	// Attributes:
	this.strength = this.baseAttributes.strength;
	this.dexterity = this.baseAttributes.dexterity;
	this.intelligence = this.baseAttributes.intelligence;
	
	// Encumberance:
	this.maxEncumberance = 0;
	this.encumberance = 0;
	this.isEncumbered = 0;
	
	// Class:
	if (this.characterClass) {
		this.strength 		+= gs.classAttributes[this.characterClass].strength;
		this.dexterity 		+= gs.classAttributes[this.characterClass].dexterity;
		this.intelligence 	+= gs.classAttributes[this.characterClass].intelligence;
	}
	
	// Race:
	if (this.race) {
		this.strength 		+= this.race.attributes.strength;
		this.dexterity 		+= this.race.attributes.dexterity;
		this.intelligence 	+= this.race.attributes.intelligence;
		this.race.effect(this);
	}
	
	// Max Attributes:
	
	// Equipment:
	if (this.inventory) {
		this.inventory.onUpdateStats(this);
	}
	
	// NPC Class:
	if (this.npcClassType && this.npcClassType.effect) {
		this.npcClassType.effect(this);
	}
	
	
	// Talents:
	if (this.talents) {
		this.talents.onUpdateStats(this);
	}
		
	// Sustained Abilities:
	this.abilities.list.forEach(function (ability) {
		if (ability && ability.isOn) {		
			if (ability.type.sustainedEffect) {
				ability.type.sustainedEffect(this);
			}
			this.maxMp -= ability.type.mana;
		}
	}, this);
	
	// Sustained Summons:
	this.getActiveSummonList().forEach(function (char) {
		if (char.type.sustainedMpCost) {
			this.maxMp -= (char.type.sustainedMpCost - this.manaConservation);		
		}
	}, this);
	
	// Sustained Dominate:
	if (this.talents.hasLearnedTalent('Dominate')) {
		let charList = gs.liveCharacterList().filter(char => char.statusEffects.has('Domination'));
		this.maxMp -= charList.length * (gs.abilityTypes.Dominate.mana - this.manaConservation);
	}
	
	// Religion:
	if (this.religion && gs.religionTypes[this.religion].effect) {
		gs.religionTypes[this.religion].effect(this);
	}
	
	// Cap Attributes:
	if (this.characterClass && this.race) {
		this.maxAttributes.strength = 2 * (10 + gs.classAttributes[this.characterClass].strength + this.race.attributes.strength);
		this.maxAttributes.dexterity = 2 * (10 + gs.classAttributes[this.characterClass].dexterity + this.race.attributes.dexterity);
		this.maxAttributes.intelligence = 2 * (10 + gs.classAttributes[this.characterClass].intelligence + this.race.attributes.intelligence);
		
		this.strength = Math.min(this.strength, this.maxAttributes.strength);
		this.dexterity = Math.min(this.dexterity, this.maxAttributes.dexterity);
		this.intelligence = Math.min(this.intelligence, this.maxAttributes.intelligence);
	}
	
	
	// Strength Attribute Bonus:
	if (this.name === 'Player') {
		this.maxHp += 				(this.strength - 10) * PC_HP_PER_STR[this.race.name];
		this.maxEncumberance += 	this.strength;

		// Dexterity Attribute Bonus:
		this.maxSp += 	this.dexterity - 10;
		this.evasion += (this.dexterity - 10) * PC_EVASION_PER_DEX[this.race.name];

		// Intelligence Attribute Bonus:
		this.abilityPower += 		(this.intelligence - 10) * PC_ABILITY_POWER_PER_INT[this.race.name];
		this.maxMp += 				(this.intelligence - 10) * PC_MAX_MP_PER_INT;
	}
	
	
	// Temp Max MP:
	if (tempStats.maxMp) {
		this.maxMp += tempStats.maxMp;
	}
	
	// Encumberance:
	if (this.type.name === 'Player' && this.encumberance > this.maxEncumberance && this.race.name !== 'Ogre') {
		this.isEncumbered += 1;
		
		// Apply Penalties:
		let delta = this.maxEncumberance - this.encumberance;
		this.abilityPower += delta * PC_ABILITY_POWER_PENALTY_PER_ENC;
	}
	
	this.lungeDamageMultiplier += this.abilityPower;
		
	// PC Hit Points:
	if (this.type.name === 'Player') {
		// Hit Points:
		this.maxHp += PC_BASE_MAX_HP;
		//this.maxHp += (this.level - 1) * PC_MAX_HP_PER_XL;
		this.maxHp += this.permanentHpBonus;
		
		// Size Bonus:
		if (this.size === 1) {
			this.maxHp += 8;
		}
		else if (this.size === 2) {
			this.maxHp += 16;
		}
		
		// Modifier:
		this.maxHp = Math.round(this.maxHp + this.maxHp * this.maxHpModifier);
		
		// Mana Points:
		this.maxMp += PC_BASE_MAX_MP;
		this.maxMp += this.permanentMpBonus;
		
		// Speed Points:
		this.maxSp += PC_BASE_MAX_SP;
		
		// HP Regen:
		this.hpRegenTime += this.getPCHPRegen().turns;
		this.hpRegenAmount += this.getPCHPRegen().hp;
		
		// MP Regen:
		this.mpRegenTime += PC_BASE_MP_REGEN_TURNS;
		
		// SP Regen:
		this.spRegenTime += PC_BASE_SP_REGEN_TURNS;
	}
	// NPC Max Hit Points:
	else {
		// Special yendor:
		if (this.type.niceName === 'The Wizard Yendor') {
			this.maxHp = YENDOR_MAX_HP[this.yendorVersion - 1];
		}
		// Scaling hit points:
		else if (this.type.hitPointType) {
			this.maxHp += gs.npcMaxHp(this.level, this.type);
		}
		// Static hit points:
		else {
			this.maxHp += this.type.maxHp;
		}
		
		this.maxMp += this.type.maxMp;
		
		this.hpRegenTime = Math.round(HP_REGEN_TIME / this.maxHp);
		this.mpRegenTime = Math.round(MP_REGEN_TIME / this.maxMp);
		this.hpRegenAmount = 1;
	}
	
	
	
	// Wands and Charms consuming maxMP:
	if (this.inventory) {
		this.inventory.consumeMaxMp(this);
	}
	
	// Make sure to remove sustained effects if player does not have enough mana:
	while (this.maxMp < 0 && this.abilities.list.find(ability => ability && ability.isOn)) {
		let ability = this.abilities.list.find(ability => ability && ability.isOn);
		ability.isOn = false;
		this.maxMp += ability.type.mana;
	}
	
	// Status Effects:
	this.statusEffects.onUpdateStats();
	
	// Shield and Block-Chance:
	if (this.name === 'Player' && !this.inventory.hasShieldEquipped()) {
		this.blockChance = 0;
	}
	
	this.maxFood = PC_BASE_MAX_FOOD;
	this.expMod = 1 + this.bonusExpMod;
	this.goldMod = 1 + this.bonusGoldMod;
	
	// Cap Stats:
	this.capStats();
	
	// Achievements:
	if (this === gs.pc) {
		if (this.maxMp >= 60) {
			achievements.get('INFINITE_ENERGY');
		}
		
		if (this.maxHp >= 200) {
			achievements.get('THE_TANKIEST_TANK');
		}
		
		if (this.maxSp >= 20) {
			achievements.get('TIME_LORD');
		}
		
		
	}
};

// CAN_DODGE:
// ************************************************************************************************
Character.prototype.canDodge = function () {
	return !this.isUnstable && !this.isImmobile;
};

// GET_PC_HP_REGEN:
// ************************************************************************************************
Character.prototype.getPCHPRegen = function () {
	for (let i = 0; i < PC_HP_REGEN.length; i += 1) {
		if (gs.pc.maxHp <= PC_HP_REGEN[i].maxHp) {
			if (gs.pc.race.name === 'Troll') {
				return {turns: PC_HP_REGEN[i].turns, hp: PC_HP_REGEN[i].hp * 3};
			}
			else {
				return PC_HP_REGEN[i];
			}
			
		}
	}
	
	// Max:
	if (gs.pc.race.name === 'Troll') {
		return {turns: MAX_PC_HP_REGEN.turns, hp: MAX_PC_HP_REGEN.hp * 3};
	}
	else {
		return MAX_PC_HP_REGEN;
	}
};



// CAP_STATS:
// ************************************************************************************************
Character.prototype.capStats = function () {
	this.maxHp = Math.max(0, this.maxHp);
	this.maxMp = Math.max(0, this.maxMp);
	this.maxSp = Math.max(0, this.maxSp);
	
	
	this.currentFood = Math.min(this.currentFood, this.maxFood);
	this.currentHp = Math.min(this.currentHp, this.maxHp);
	this.currentMp = Math.min(this.currentMp, this.maxMp);
	this.currentSp = Math.min(this.currentSp, this.maxSp);
	
	// Resistance Cap:
	this.resistance.Shock = Math.min(this.resistance.Shock, MAX_RESISTANCE);
	this.resistance.Fire = Math.min(this.resistance.Fire, MAX_RESISTANCE);
	this.resistance.Cold = Math.min(this.resistance.Cold, MAX_RESISTANCE);
	this.resistance.Toxic = Math.min(this.resistance.Toxic, MAX_RESISTANCE);
	
	// Reflection:
	this.reflection = Math.min(this.reflection, MAX_REFLECTION);
	
	// Cool Down Modifier:
	this.coolDownModifier = Math.min(this.coolDownModifier, MAX_COOL_DOWN_MODIFIER);
	
	// Evasion:
	this.evasion = Math.max(0, Math.min(this.evasion, MAX_EVASION));

	// Block Chance:
	this.blockChance = Math.max(0, Math.min(this.blockChance, MAX_EVASION));
	
	// Regen:
	this.hpRegenTime = Math.max(this.hpRegenTime, 1);
	this.mpRegenTime = Math.max(this.mpRegenTime, 1);
	
	this.size = Math.max(CHARACTER_SIZE.SMALL, Math.min(CHARACTER_SIZE.LARGE, this.size));
	
	this.movementSpeed = Math.min(MOVEMENT_SPEED.FAST, Math.max(MOVEMENT_SPEED.SLOW, this.movementSpeed));
};



// MOVE_TIME:
// ************************************************************************************************
Character.prototype.moveTime = function () {
	return MOVE_TIME[this.movementSpeed];
};

// RANGE_WEAPON_DAMAGE:
// ************************************************************************************************
PlayerCharacter.prototype.rangeWeaponDamage = function () {
	return this.weaponDamage(this.inventory.getRangeWeapon());
};

// MAX_WEAPON_DAMAGE:
// ************************************************************************************************
PlayerCharacter.prototype.maxWeaponDamage = function (weapon, mod) {
	weapon = weapon || this.inventory.getPrimaryWeapon();
	
	mod = mod || weapon.mod;
	
	let damage = weapon.getModdedStat('damage', mod);
	return weapon.getModdedStat('damage', mod) * 2;
};

// WEAPON_DAMAGE:
// Can pass mod to get the players weapon damage with an arbitrary modifier
// This is used when displaying the damage of an item after it has been enchanted
// ************************************************************************************************
PlayerCharacter.prototype.weaponDamage = function (weapon, mod) {
	weapon = weapon || this.inventory.getPrimaryWeapon();
	
	mod = mod || weapon.mod;
	
	let damage = weapon.getModdedStat('damage', mod);
	
	// Melee Weapon:
	if (weapon.type.attackEffect.skill === 'Melee') {
		// Add strength bonus:
		damage += (this.strength - 10);
		
		// Max strength bonus:
		damage = Math.min(damage, this.maxWeaponDamage(weapon, mod));
		
		// Additional bonus from items or abilities:		
		damage = damage + this.bonusMeleeDamage;
	}
	// Staff Damage:
	else if (weapon.type.attackEffect.skill === 'Range' && weapon.type.attackEffect === gs.weaponEffects.MagicStaff) {
		// Add intelligence bonus:
		damage += (this.intelligence - 10);
		
		// Max dexterity bonus:
		damage = Math.min(damage, this.maxWeaponDamage(weapon, mod));
		
		// Additional bonus from items or abilities:
		damage = damage + this.bonusStaffDamage;
	}
	// Range Weapon:
	else if (weapon.type.attackEffect.skill === 'Range') {
		// Add dexterity bonus:
		damage += (this.dexterity - 10);
		
		// Max dexterity bonus:
		damage = Math.min(damage, this.maxWeaponDamage(weapon, mod));
		
		// Additional bonus from items or abilities:
		damage = damage + this.bonusRangeDamage;
	}
	
	// Melee Damage Multiplier:
	if (weapon.type.attackEffect.skill === 'Melee') {
		damage = Math.ceil(damage * this.meleeDamageMultiplier);
	}
	// Staff Damage Multiplier:
	else if (weapon.type.attackEffect.skill === 'Range' && weapon.type.attackEffect === gs.weaponEffects.MagicStaff) {
		damage = Math.ceil(damage * this.staffDamageMultiplier);
	}
	// Range Weapon Multiplier:
	else if (weapon.type.attackEffect.skill === 'Range') {
		damage = Math.ceil(damage * this.rangeDamageMultiplier);
	}
	
	// Round:
	damage = Math.ceil(damage);
	
	return damage;
};

// WEAPON_RANGE:
// ************************************************************************************************
PlayerCharacter.prototype.weaponRange = function (weapon) {
	var range;
	
	weapon = weapon || this.inventory.getPrimaryWeapon();
	
	// Melee:
	if (weapon.type.attackEffect.skill === 'Melee') {
		range = weapon.type.range;
	}
	// Range:
	else if (weapon.type.attackEffect.skill === 'Range') {
		range = weapon.type.range + this.bonusProjectileRange;
	}
	
	return range;
};

// WEAPON_MIN_RANGE:
// ************************************************************************************************
PlayerCharacter.prototype.weaponMinRange = function (weapon) {
	weapon = weapon || this.inventory.getPrimaryWeapon();
	
	// Elves have no minRange:
	if (this.race.name === 'Elf') {
		return 0;
	}
	else {
		return weapon.type.minRange;
	}
};