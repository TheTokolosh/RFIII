/*global gs, util*/
/*global PlayerCharacter*/
/*global MAX_TALENT_RANK, ATTRIBUTE_LIST, TALENT_LEVEL_REQS*/
/*jshint esversion: 6*/
'use strict';

// TALENT_CONSTRUCTOR:
// ************************************************************************************************
function Talent (talentName) {
	this.type = gs.talents[talentName];
	this.rank = 0;
}

// CHARACTER_TALENTS:
// ************************************************************************************************
function CharacterTalents (character) {
	this.character = character;
	this.talentList = [];
}

// CLEAR:
// ************************************************************************************************
CharacterTalents.prototype.clear = function () {
	this.talentList = [];
};

// ADD_TALENT:
// ************************************************************************************************
CharacterTalents.prototype.addTalent = function (talentName) {
	if (!this.hasTalent(talentName)) {
		this.talentList.push(new Talent(talentName));
	}
};

// ADD_TOME_TALENTS:
// ************************************************************************************************
CharacterTalents.prototype.addTomeTalents = function (tome) {
	for (let i = 0; i < tome.talentList.length; i += 1) {
		let talentName = tome.talentList[i];
		
		// Attributes:
		if (util.inArray(talentName, ATTRIBUTE_LIST)) {
			let attributeName = talentName;
			
			if (gs.pc.baseAttributes[attributeName] < gs.pc.maxAttributes[attributeName]) {
				gs.pc.gainAttribute(attributeName);
				gs.pc.popUpText('+1 ' + attributeName);
			}
		}
		// Talents:
		else {
			this.addTalent(talentName);
			gs.pc.popUpText(gs.capitalSplit(talentName));
		}
		
		
	}
};

// CAN_ADD_TALENT:
// ************************************************************************************************
CharacterTalents.prototype.canAddTalent = function (talentName) {
	return !this.hasTalent(talentName);
};


// LEARN_TALENT:
// ************************************************************************************************
CharacterTalents.prototype.learnTalent = function (talentName) {
	let talentType = gs.talents[talentName];
		
	// Learning first time needs to add associated ability:
	if (!this.hasLearnedTalent(talentName) && talentType.ability) {
		this.character.addAbility(talentType.ability);
	}
	
	// Reset the ability cool-down:
	if (talentType.ability) {
		this.character.abilities.getAbility(talentType.ability.name).coolDown = 0;
	}
	
	// Increase the rank:
	this.getTalent(talentName).rank += 1;
	
	// Update Stats:
	this.character.updateStats();
	if (talentType.onLearn) {
		talentType.onLearn(this.character);
	}
	this.character.updateStats();
};

// CAN_LEARN_TALENT:
// ************************************************************************************************
CharacterTalents.prototype.canLearnTalent = function (talentName) {
	let talentType = gs.talents[talentName];
	
	// Player does not have the talent available:
	if (!this.hasTalent(talentName)) {
		return false;
	}
	
	// Player is at maxRank:
	if (this.getTalent(talentName).rank === MAX_TALENT_RANK) {
		return false;
	}
	
	// Player has not met the min requirements:
	if (!this.hasMetRequirements(talentType.requirements[this.getTalent(talentName).rank + 1])) {
		return false;
	}
	
	return true;	
};


// HAS_MET_REQUIREMENTS:
// requirements = {strength, dexterity, intelligence, level} 
// ************************************************************************************************
CharacterTalents.prototype.hasMetRequirements = function (requirements) {
	/*
	// Gnome:
	if (this.character.race.name === 'Gnome') {
		// Strength/Intelligence Req:
		if (requirements.strength && this.character.intelligence >= requirements.strength) {
			return true;
		}

		// Dexterity/Intelligence Req:
		if (requirements.dexterity && this.character.intelligence >= requirements.dexterity) {
			return true;
		}
	}
	*/
	
	// Mummy:
	if (this.character.race.name === 'Mummy' || this.character.race.name === 'Vampire') {
		// Level/Intelligence Req:
		if (requirements.intelligence && this.character.level >= TALENT_LEVEL_REQS[requirements.intelligence]) {
			return true;
		}

		// Level/Strength Req:
		if (requirements.strength && this.character.level >= TALENT_LEVEL_REQS[requirements.strength]) {
			return true;
		}

		// Level/Dexterity Req:
		if (requirements.dexterity && this.character.level >= TALENT_LEVEL_REQS[requirements.dexterity]) {
			return true;
		}
		
		// Must satisfy with XL:
		return false;
	}
	
	// Standard Intelligence Req:
	if (requirements.intelligence && this.character.intelligence >= requirements.intelligence) {
		return true;
	}

	// Standard Strength Req:
	if (requirements.strength && this.character.strength >= requirements.strength) {
		return true;
	}

	// Standard Dexterity Req:
	if (requirements.dexterity && this.character.dexterity >= requirements.dexterity) {
		return true;
	}
	
	// Standard XL Req:
	if (requirements.level && this.character.level >= requirements.level) {
		return true;
	}	
	
	return false;
};

// GET_TALENT:
// ************************************************************************************************
CharacterTalents.prototype.getTalent = function (talentName) {
	return this.talentList.find(talent => talent.type.name === talentName);
};

// HAS_TALENT:
// ************************************************************************************************
CharacterTalents.prototype.hasTalent = function (talentName) {
	return Boolean(this.getTalent(talentName));
};

// GET_TALENT_RANK:
// ************************************************************************************************
CharacterTalents.prototype.getTalentRank = function (talentName) {
	if (this.hasTalent(talentName)) {
		return this.getTalent(talentName).rank;
	}
	else {
		return 0;
	}
};

// HAS_LEARNED_TALENT:
// ************************************************************************************************
CharacterTalents.prototype.hasLearnedTalent = function (talentName) {
	return this.talentList.find(talent => talent.type.name === talentName && talent.rank > 0);
};

// ON_UPDATE_STATS:
// ************************************************************************************************
CharacterTalents.prototype.onUpdateStats = function (character) {
	this.character = character;

	this.talentList.forEach(function (talent) {
		if (talent.rank > 0 && talent.type.effect) {
			talent.type.effect(this.character);
		}
	}, this);
};

// TO_DATA:
// ************************************************************************************************
CharacterTalents.prototype.toData = function () {
	let list = [];
	
	for (let i = 0; i < this.talentList.length; i += 1) {
		list.push({
			name: this.talentList[i].type.name,
			rank: this.talentList[i].rank,
		});
	}
	
	return list;
};

// LOAD_DATA:
// ************************************************************************************************
CharacterTalents.prototype.loadData = function (data) {
	for (let i = 0; i < data.length; i += 1) {
		this.talentList.push({
			type: gs.talents[data[i].name],
			rank: data[i].rank,
		});
	}
};