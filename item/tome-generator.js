/*global gs, util*/
/*global Item*/
/*global ATTRIBUTE_LIST*/
/*jshint esversion: 6, loopfunc: true*/
'use strict';

let TomeGenerator = {};

// CREATE_TOMES:
// Creates and returns 1 or more tomes
// Multiple tomes will guarantee unique
// ************************************************************************************************
TomeGenerator.createTomes = function (maxTalentTier, num) {
	let tomeList = [];
	
	// All valid tomes:
	gs.forEachType(gs.classTalents, function (e) {
		let tome = this.createSingleTome(e.tomeName, maxTalentTier);
		
		let talentList = tome.talentList.filter(talentName => !util.inArray(talentName, ATTRIBUTE_LIST));
		
		if (talentList.length > 0) {
			tomeList.push(tome);
		}
	}, this);
	
	
	return util.randSubset(tomeList, num);
};

// CREATE_SINGLE_TOME:
// ************************************************************************************************
TomeGenerator.createSingleTome = function (tomeName, maxTalentTier) {
	let talentList = [];
	let numTalents = 2;
	
	let classTalents;
	gs.forEachType(gs.classTalents, function (e) {
		if (e.tomeName === tomeName) {
			classTalents = e;
		}
	}, this);
	
	// Active Talents:
	let activeList = classTalents.active;
	activeList = activeList.filter(talentName => !gs.pc.talents.hasTalent(talentName));
	activeList = activeList.filter(talentName => gs.talents[talentName].tier <= maxTalentTier);
	if (activeList.length > 0) {
		talentList.push(util.randElem(activeList));
	}
	
	// Passive Talents:
	let passiveList = classTalents.passive;
	passiveList = passiveList.filter(talentName => !gs.pc.talents.hasTalent(talentName));
	passiveList = passiveList.filter(talentName => gs.talents[talentName].tier <= maxTalentTier);
	if (passiveList.length > 0) {
		talentList.push(util.randElem(passiveList));
	}
	
	// Raw Attributes:
	if (talentList.length < numTalents) {
		talentList.push(classTalents.attribute);
	}
	
	return Item.createItem(classTalents.tomeName, {talentList: talentList});
};

// GET_TOME_OF_KNOWLEDGE_TALENT_LIST:
// Returns 4 unique talents of maxTalentTier or below that the player does not already have.
// Attempts to balance passive and active talents.
// ************************************************************************************************
TomeGenerator.getTomeOfKnowledgeTalentList = function (maxTalentTier) {
	let allTalentList = [],
		activeTalentList = [],
		passiveTalentList = [],
		outTalentList = [];
	
	// Get all talents the player does not have and less than maxTalentTier:
	gs.forEachType(gs.classTalents, function (classTalents) {
		// Add passive talents:
		classTalents.passive.forEach(function (talentName) {
			if (!util.inArray(talentName, allTalentList) && gs.talents[talentName].tier <= maxTalentTier && !gs.pc.talents.hasTalent(talentName)) {
				allTalentList.push(talentName);
				passiveTalentList.push(talentName);
			}
		}, this);
		
		// Add active talents:
		classTalents.active.forEach(function (talentName) {
			if (!util.inArray(talentName, allTalentList) && gs.talents[talentName].tier <= maxTalentTier && !gs.pc.talents.hasTalent(talentName)) {
				allTalentList.push(talentName);
				activeTalentList.push(talentName);
			}
		}, this);
	}, this);
	
	let talentListValue = function (list) {
		let value = 0;
		
		// Active Talent:
		if (list.find(talentName => util.inArray(talentName, activeTalentList))) {
			value += 1;
			
			// 2 Active talents is better:
			if (list.filter(talentName => util.inArray(talentName, activeTalentList)).length >= 2) {
				value += 1;
			}
		}	
		
		// Passive Talent:
		if (list.find(talentName => util.inArray(talentName, passiveTalentList))) {
			value += 1;
			
			// 2 Passive talents is better:
			if (list.filter(talentName => util.inArray(talentName, passiveTalentList)).length >= 2) {
				value += 1;
			}
		}
		
		// Strength Talent:
		if (list.find(talentName => gs.talents[talentName].attrs[0] === 'STR')) {
			value += 1;
		}
		
		// Dexterity Talent:
		if (list.find(talentName => gs.talents[talentName].attrs[0] === 'DEX')) {
			value += 1;
		}
		
		// Intelligence Talent:
		if (list.find(talentName => gs.talents[talentName].attrs[0] === 'INT')) {
			value += 1;
		}
		
		return value;
	};
	
	let bestVal = 0;
	let bestList = [];
	let list;
	
	for (let i = 0; i < 100; i += 1) {
		list = util.randSubset(allTalentList, 4);
		
		if (talentListValue(list) >= bestVal) {
			bestVal = talentListValue(list);
			bestList = list;
		}
	}
	
	return bestList;
};