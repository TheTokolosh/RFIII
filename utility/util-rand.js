/*global game, gs, util*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// SEED_RAND:
util.seedRand = function (list) {
	game.rnd.sow(list);
	
	// Apparently first few numbers are not random:
	util.frac();
	util.frac();
};

// RAND_INT:
// ************************************************************************************************
util.randInt = function (min, max) {
	return game.rnd.integerInRange(Math.floor(min), Math.ceil(max));
};

// FRAC:
// ************************************************************************************************
util.frac = function () {
	return game.rnd.frac();
};

// RAND_ELEM:
// ************************************************************************************************
util.randElem = function (list) {
	if (list.length === 0) {
		throw 'list.length === 0';
	}
	if (list.length === 1) {
		return list[0];
	} 
	else {
		return list[util.randInt(0, list.length - 1)];
	}
};

util.shuffleArray = function (arr) {
	return util.randSubset(arr, arr.length);
};

util.isChanceTable = function (table) {
	return Boolean(typeof table === 'object' && table.length && table[0].name && table[0].percent);
};

// CHOOSE_RANDOM:
// ************************************************************************************************
util.chooseRandom = function (table) {
	var sum = table.reduce(function (pV, nV) {return pV + nV.percent; }, 0),
		percentSum = 0,
		rand = util.randInt(0, sum - 1),
		i;

	for (i = 0; i < table.length; i += 1) {
		percentSum += table[i].percent;
		if (rand < percentSum) {
			if (table[i].name && util.isChanceTable(table[i].name)) {
				return util.chooseRandom(table[i].name);
			}
			else {
				return table[i].name;
			}
		}
	}

	// Catch last one:
	if (util.isChanceTable(table[i].name)) {
		return util.chooseRandom(table[i].name);
	}
	else {
		return table[i].name;	
	}
};

// RAND_SUBSET:
// ************************************************************************************************
util.randSubset = function (list, size) {
	var copyList = list.slice(0),
		subset = [],
		i;
	
	if (size > list.length) {
		throw 'size > list.length';
	}
	
	for (i = 0; i < size; i += 1) {
		subset.push(copyList.splice(Math.floor(util.randInt(0, copyList.length - 1)), 1)[0]);
	}
	return subset;
};

// RANDOM_COLOR:
// ************************************************************************************************
util.randomColor = function () {
	return 'rgb(' + util.randInt(0, 255) + ',' + util.randInt(0, 255) + ',' + util.randInt(0, 255) + ')';
};
