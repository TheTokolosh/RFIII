/*global gs, util*/
/*jshint esversion: 6*/
'use strict';

// MAKE_RAND_ART_STATS:
// ************************************************************************************************
gs.makeRandArtStats = function (itemType) {
	var stats = {}, brandList, brand;
	
	brandList = [
		// Damage Bonus:
		{name: 'bonusMeleeDamage',		val: 3},
		{name: 'bonusRangeDamage',		val: 3},
		{name: 'bonusStaffDamage',  	val: 3},
		{name: 'abilityPower',			val: 0.15},
		
		// Stats:
		{name: 'maxHp',					val: 15},
		{name: 'maxMp',					val: 9},
		{name: 'stealth',				val: 1},
		{name: 'protection',			val: 3},
		{name: 'reflection',			val: 0.20},
		{name: 'maxSp',					val: 3},
		
		// Resistance:
		{name: 'fireResistance',		val: 0.2},
		{name: 'coldResistance',		val: 0.2},
		{name: 'toxicResistance',		val: 0.2},
		{name: 'shockResistance',		val: 0.2},
		
		// Effects:
		{name: 'isFlying',				val: 1},
		{name: 'lifeTap',				val: 1},
		{name: 'hasSustenance',			val: 1}
	];
	
	// Do not including any stat that the item already has intrinsically
	// i.e. don't add rFire to a fire ring that intrin
	brandList = brandList.filter(brand => !itemType.stats[brand.name]);
	
	// Select a brand:
	brand = util.randElem(brandList);
	
	stats[brand.name] = brand.val;
	
	return stats;
};