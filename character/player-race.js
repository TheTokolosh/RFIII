/*global game, gs, console*/
/*global PlayerCharacter*/
'use strict';

// CREATE_PLAYER_RACES:
// ************************************************************************************************
gs.createPlayerRaces = function () {
	this.playerRaces = {};
	
	// HUMAN:
	this.playerRaces.Human = {};
	this.playerRaces.Human.attributes = {strength: 0, dexterity: 0, intelligence: 0};
	this.playerRaces.Human.effect = function (character) {};
	this.playerRaces.Human.desc = function () {
		var str = 'Human\n';
		str += '*Medium Size';
		return str;
	};
	
	// OGRE:
	this.playerRaces.Ogre = {};
	this.playerRaces.Ogre.attributes = {strength: 2, dexterity: 0, intelligence: -2};
	this.playerRaces.Ogre.effect = function (character) {
		character.movementSpeed -= 1;
		character.size += 1;
	};
	this.playerRaces.Ogre.desc = function () {
		var str = 'Ogre\n';
		
		str += '*Large Size (+8 HP)\n';
		str += '*+2 STR, -2 INT\n';
		str += '*+3 HP per STR\n';
		str += '*Slow (cannot move diagonally)\n';
		str += '*No max encumberance\n';
		return str;
	};
	
	// TROLL:
	this.playerRaces.Troll = {};
	this.playerRaces.Troll.attributes = {strength: 0, dexterity: 0, intelligence: 0};
	this.playerRaces.Troll.effect = function (character) {
		character.size += 1;
		character.resistance.Fire -= 0.5;
	};
	this.playerRaces.Troll.desc = function () {
		var str = 'Troll\n';
		
		str += '*Large Size (+8 HP)\n';
		str += '*3x regen speed\n';
		str += '*2x food consumption rate\n';
		str += '*-50% Fire Resistance\n';
		return str;
	};
	
	// FAIRY:
	this.playerRaces.Fairy = {};
	this.playerRaces.Fairy.attributes = {strength: -2, dexterity: 2, intelligence: 0};
	this.playerRaces.Fairy.effect = function (character) {
		character.size -= 1;
		character.isFlying += 1;
	};
	this.playerRaces.Fairy.desc = function () {
		var str = 'Fairy\n';
		
		str += '*Small Size (-8 HP)\n';
		str += '*+2 DEX, -2 STR\n';
		str += '*-3 HP per STR\n';
		str += '*+2% Evasion per DEX\n';
		str += '*Flying\n';
		str += '*Enchant items on odd levels\n';
		return str;
	};
	
	// GNOME:
	this.playerRaces.Gnome = {};
	this.playerRaces.Gnome.attributes = {strength: -2, dexterity: 0, intelligence: 2};
	this.playerRaces.Gnome.effect = function (character) {
		character.size -= 1;
	};
	this.playerRaces.Gnome.desc = function () {
		var str = 'Gnome\n';
		
		str += '*Small Size (-8 HP)\n';
		str += '*+2 INT, -2 STR\n';
		str += '*-3 HP per STR\n';
		str += '*+5% Ability Power per INT\n';
		str += '*Extra talent point on levels 4,8,12,16\n';
		return str;
	};
	
	// MUMMY:
	this.playerRaces.Mummy = {};
	this.playerRaces.Mummy.attributes = {strength: 0, dexterity: 0, intelligence: 0};
	this.playerRaces.Mummy.effect = function (character) {
		character.resistance.Fire -= 0.5;
		character.isGasImmune = true;
		character.isPoisonImmune = true;
	};
	this.playerRaces.Mummy.desc = function () {
		var str = 'Mummy\n';
		
		str += '*Medium Size\n';
		str += '*No hunger but cannot consume potions\n';
		str += '*Immune to poison and poison clouds\n';
		str += '*Uses level for talent reqs\n';
		str += '*-50% Fire Resistance\n';
		return str;
	};
	
	// GARGOYLE:
	this.playerRaces.Gargoyle = {};
	this.playerRaces.Gargoyle.attributes = {strength: 0, dexterity: 0, intelligence: 0};
	this.playerRaces.Gargoyle.effect = function (character) {
		character.isFlying += 1;
		character.protection += 2;
		character.resistance.Shock += 0.2;
		character.resistance.Toxic += 0.2;
	};
	this.playerRaces.Gargoyle.desc = function () {
		var str = 'Gargoyle\n';
		
		str += '*Medium Size\n';
		str += '*No HP regen\n';
		str += '*Full heal when descending to new level\n';
		str += '*Flying\n';
		str += '*+2 protection\n';
		str += '*+20% Shock and Toxic Resistance\n';
		return str;
	};
	
	// VAMPIRE:
	this.playerRaces.Vampire = {};
	this.playerRaces.Vampire.attributes = {strength: 0, dexterity: 0, intelligence: 0};
	this.playerRaces.Vampire.effect = function (character) {
		character.hasBloodVampirism += 1;
	};
	this.playerRaces.Vampire.desc = function () {
		var str = 'Vampire\n';
		str += '*Medium Size\n';
		
		str += '*No HP regen\n';
		str += '*Heal HP when stepping on blood\n';
		str += '*Uses level for talent reqs\n';
		str += '*Temporary Blood Lust from blood granting increased damage\n';
		return str;
	};
	
	/*
	// ELF:
	this.playerRaces.Elf = {};
	this.playerRaces.Elf.attributes = {strength: -2, dexterity: 2, intelligence: 0};
	this.playerRaces.Elf.effect = function (character) {};
	this.playerRaces.Elf.desc = function () {
		var str = 'Elf\n';
		str += 'Medium Size\n';
		str += '+2 Dexterity\n';
		str += '-2 Strength\n';
		return str;
	};
	*/
	
	this.playerRaceList = [];
	this.forEachType(this.playerRaces, function (playerRace) {
		this.playerRaceList.push(playerRace);
	}, this);
	
	this.nameTypes(this.playerRaces);
};

// SET_RACE:
// ************************************************************************************************
PlayerCharacter.prototype.setRace = function (race) {
	this.race = race;
	
	if (this.race.talents) {
		this.race.talents.forEach(function(talentName) {
			this.talents.addTalent(talentName);
		}, this);
	}
};