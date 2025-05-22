/*global gs, console, game, util*/
/*global ROMAN_NUMERAL, LARGE_WHITE_FONT*/
/*global PC_ABILITY_POWER_PENALTY_PER_ENC, STAT_AS_PERCENT*/
/*global AMBIENT_COLD_RESISTANCE*/
/*global HIT_POINTS_DESC, MANA_POINTS_DESC, SPEED_POINTS_DESC*/
/*global MAX_EVASION, MAX_RESISTANCE, MAX_REFLECTION*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

function UIStatPanel (startX, startY, group) {
	this.group = game.add.group();
	
	this.statLines = {};
	
	this.width = 260;
	this.centerX = startX + this.width / 2;
	
	// Panel:
	gs.createSprite(startX, startY, 'StatPanel', this.group);
	
	
	this.statHighLight = gs.createSprite(startX + 2, 0, 'StatHighlight', this.group);
	
	// Stat Blocks:
	this.createStatBlock(startX, startY, 'Character', ['class', 'race', 'level']);
	this.createStatBlock(startX, startY + 92 * 1, 'Basic Stats', ['hitPoints', 'manaPoints', 'speedPoints', 'abilityPower', 'protection', 'evasion']);
	
	
	// Status Effects:
	this.statusEffectNames = [];
	for (let i = 0; i < 11; i += 1) {
		this.statusEffectNames[i] = 'statusEffect' + i;
	}
	this.createStatBlock(startX, startY + 244, 'Special Stats', this.statusEffectNames);
	
	
	group.add(this.group);
}

// CREATE_STAT_BLOCK:
// ************************************************************************************************
UIStatPanel.prototype.createStatBlock = function (startX, startY, titleStr, statNameList) {
	// CHARACTER_PANEL:
	let text = gs.createText(this.centerX, startY + 4, titleStr, 'PixelFont6-White', 18, this.group);
	text.setAnchor(0.5, 0);
	
	statNameList.forEach(function (statName, i) {
		this.statLines[statName] = {};
		
		this.statLines[statName].nameText = gs.createText(startX + 8, startY + 34 + 20 * i, '*' + gs.capitalSplit(statName), 'PixelFont6-White', 12, this.group);
		
		this.statLines[statName].valText = gs.createText(startX + this.width - 6, startY + 34 + 20 * i, '0', 'PixelFont6-White', 12, this.group);
		this.statLines[statName].valText.setAnchor(1, 0);
		
		this.statLines[statName].tag = statName;
	}, this);
};

// REFRESH:
// ************************************************************************************************
UIStatPanel.prototype.refresh = function (deltaChar = null) {
	// Character Panel:
	this.statLines.class.valText.setText(gs.capitalSplit(gs.pc.characterClass));
	this.statLines.race.valText.setText(gs.capitalSplit(gs.pc.race.name));
	this.statLines.level.valText.setText(gs.pc.level);
	
	// Basic Stat Panel:
	this.setStatVal(this.statLines.hitPoints, 'maxHp', deltaChar);
	this.setStatVal(this.statLines.manaPoints, 'maxMp', deltaChar);
	this.setStatVal(this.statLines.protection, 'protection', deltaChar);
	this.setStatVal(this.statLines.speedPoints, 'maxSp', deltaChar);
	this.setStatVal(this.statLines.abilityPower, 'abilityPower', deltaChar);
	this.setStatVal(this.statLines.evasion, 'evasion', deltaChar);

	// Status Effect Panel:
	this.statusEffectNames.forEach(function (name) {
		this.statLines[name].nameText.visible = false;
		this.statLines[name].valText.visible = false;
	}, this);
	
	this.getStatusEffectList(deltaChar).forEach(function (e, i) {
		let statLine = this.statLines['statusEffect' + i];
		
		// Don't crash on overflow:
		if (!statLine) {
			return;
		}
		
		statLine.nameText.setText('*' + e.name);
		statLine.valText.setText('');
		
		statLine.nameText.setFont('PixelFont6-White');
		statLine.valText.setFont('PixelFont6-White');
		
		if (e.hasOwnProperty('deltaVal')) {
			if (util.inArray(e.tag, [
				'CoolDownModifier',
				'Reflection',
				'DamageShield',
				'Stealth',
				'LifeTap',
				'ManaTap',
				'Stealth',
				'FireResistance',
				'ShockResistance',
				'ColdResistance',
				'ToxicResistance',
				'MagicPower',
				'BlockChance',
			])) {
				
				// Percent:
				if (util.inArray(e.tag, ['CoolDownModifier', 'Reflection', 'BlockChance', 'FireResistance', 'ShockResistance', 'ColdResistance', 'ToxicResistance', 'MagicPower'])) {
					if (e.deltaVal !== e.val) {
						statLine.valText.setText(util.toPercentStr(e.deltaVal) + ' { ' + util.toPercentStr(e.val));
					}
					else {
						statLine.valText.setText(util.toPercentStr(e.val));
					}
				}
				else {
					if (e.deltaVal !== e.val) {
						statLine.valText.setText(e.deltaVal + ' { ' + e.val);
					}
					else {
						statLine.valText.setText(e.val);
					}
				}
		
				if (e.deltaVal < e.val) {
					statLine.nameText.setFont('PixelFont6-Red');
					statLine.valText.setFont('PixelFont6-Red');
				}
				else if (e.deltaVal > e.val) {
					statLine.nameText.setFont('PixelFont6-Green');
					statLine.valText.setFont('PixelFont6-Green');
				}
				
			}
			// Tier Status Effects:
			else {
				
				if (e.deltaVal === 'remove') {
					statLine.nameText.setFont('PixelFont6-Red');
					statLine.valText.setFont('PixelFont6-Red');
				}
				else {
					statLine.nameText.setFont('PixelFont6-Green');
					statLine.valText.setFont('PixelFont6-Green');
				}
			}
				
		}
		else {
			if (util.inArray(e.tag, ['CoolDownModifier', 'Reflection', 'BlockChance', 'FireResistance', 'ShockResistance', 'ColdResistance', 'ToxicResistance', 'MagicPower'])) {
				statLine.valText.setText(util.toPercentStr(e.val));
			}
			else {
				statLine.valText.setText(e.val);
			}
			
		}
		
		statLine.tag = e.tag;
		
		// Set visible:
		statLine.nameText.visible = true;
		statLine.valText.visible = true;
	}, this);
};



// SET_STAT_VAL:
// Can optionally be passed a deltaChar to show stat comparisons
// ************************************************************************************************
UIStatPanel.prototype.setStatVal = function (statLine, stat, deltaChar = null) {
	// No Delta:
	if (!deltaChar || gs.pc[stat] === deltaChar[stat]) {
		if (STAT_AS_PERCENT[stat]) {
			statLine.valText.setText(util.toPercentStr(gs.pc[stat]));
		}
		else {
			statLine.valText.setText(gs.pc[stat]);
		}
		
		
		statLine.valText.setFont('PixelFont6-White');
		statLine.nameText.setFont('PixelFont6-White');
	}
	// Delta:
	else {
		if (STAT_AS_PERCENT[stat]) {
			statLine.valText.setText(util.toPercentStr(deltaChar[stat]) + ' { ' + util.toPercentStr(gs.pc[stat]));
		}
		else {
			statLine.valText.setText(deltaChar[stat] + ' { ' + gs.pc[stat]);
		}
		
		// Positive:
		if (gs.pc[stat] < deltaChar[stat]) {
			statLine.valText.setFont('PixelFont6-Green');
			statLine.nameText.setFont('PixelFont6-Green');
		}
		// Negative:
		else {
			statLine.valText.setFont('PixelFont6-Red');
			statLine.nameText.setFont('PixelFont6-Red');
		}		
	}
};

// UPDATE:
// ************************************************************************************************
UIStatPanel.prototype.update = function () {
	this.statHighLight.visible = false;
	
	let statName = this.getStatNameUnderPointer();
	if (statName) {
		this.statHighLight.y = this.statLines[statName].nameText.y - 4;
		this.statHighLight.visible = true;
	}
	

};

// GET_STATUS_EFFECT_LIST:
// ************************************************************************************************
UIStatPanel.prototype.getStatusEffectList = function (deltaChar) {
	let list = [];
	
	// Magic Power:
	if (gs.pc.magicPower > 0) {
		list.push({name: 'Magic Power:', val: gs.pc.magicPower, tag: 'MagicPower'});
		
		if (deltaChar && deltaChar.magicPower > 0) {
			list[list.length - 1].deltaVal = deltaChar.magicPower;
		}
	}
	else if (deltaChar && deltaChar.magicPower > 0) {
		list.push({name: 'Magic Power: ', val: gs.pc.magicPower, tag: 'MagicPower'});
		list[list.length - 1].deltaVal = deltaChar.magicPower;		
	}
	
	// Resistance:
	['Fire', 'Shock', 'Cold', 'Toxic'].forEach(function (typeName) {
		if (gs.pc.resistance[typeName] !== 0) {
			list.push({
				name: typeName + ' Resistance:', 
				val: gs.pc.resistance[typeName], 
				tag: typeName + 'Resistance'
			});

			if (deltaChar && deltaChar.resistance[typeName] !== gs.pc.resistance[typeName]) {
				list[list.length - 1].deltaVal = deltaChar.resistance[typeName];
			}
		}
		else if (deltaChar && deltaChar.resistance[typeName] !== 0) {
			list.push({
				name: typeName + ' Resistance:', 
				val: gs.pc.resistance[typeName], 
				tag: typeName + 'Resistance'
			});
			
			list[list.length - 1].deltaVal = deltaChar.resistance[typeName];		
		}
	}, this);
	
	// Damage Shield:
	let totalDamageShield = 0;
	let deltaDamageShield = 0;
	['Fire', 'Shock', 'Cold', 'Toxic', 'Physical'].forEach(function (typeName) {
		if (gs.pc.damageShield[typeName] > 0) {
			totalDamageShield += gs.pc.damageShield[typeName];
		}
		
		if (deltaChar && deltaChar.damageShield[typeName] > 0) {
			deltaDamageShield += deltaChar.damageShield[typeName];
		}
	}, this);
	
	if (totalDamageShield > 0) {
		list.push({name: 'Damage Shield:', val: totalDamageShield, tag: 'DamageShield'});
		
		if (deltaChar && deltaDamageShield !== totalDamageShield) {
			list[list.length - 1].deltaVal = deltaDamageShield;
		}
	}
	else if (deltaDamageShield > 0) {
		list.push({name: 'Damage Shield:', val: 0, deltaVal: deltaDamageShield, tag: 'DamageShield'});
	}
	
	// Melee Life Tap:
	if (gs.pc.lifeTap > 0) {
		list.push({name: 'Life Tap:', val: gs.pc.lifeTap, tag: 'LifeTap'});
		
		if (deltaChar && deltaChar.lifeTap !== gs.pc.lifeTap) {
			list[list.length - 1].deltaVal = deltaChar.lifeTap;
		}
	}
	else if (deltaChar && deltaChar.lifeTap > 0) {
		list.push({name: 'Life Tap: ', val: gs.pc.lifeTap, tag: 'LifeTap'});
		list[list.length - 1].deltaVal = deltaChar.lifeTap;		
	}
	
	//  Mana Tap:
	if (gs.pc.manaTap > 0) {
		list.push({name: 'Mana Tap:', val: gs.pc.manaTap, tag: 'ManaTap'});
		
		if (deltaChar && deltaChar.manaTap !== gs.pc.manaTap) {
			list[list.length - 1].deltaVal = deltaChar.manaTap;
		}
	}
	else if (deltaChar && deltaChar.manaTap > 0) {
		list.push({name: 'Mana Tap: ', val: gs.pc.manaTap, tag: 'ManaTap'});
		list[list.length - 1].deltaVal = deltaChar.manaTap;		
	}

	
	// Reflection:
	if (gs.pc.reflection > 0) {
		list.push({name: 'Reflection:', val: gs.pc.reflection, tag: 'Reflection'});
		
		if (deltaChar && deltaChar.reflection !== gs.pc.reflection) {
			list[list.length - 1].deltaVal = deltaChar.reflection;
		}
	}
	else if (deltaChar && deltaChar.reflection > 0) {
		list.push({name: 'Reflection: ', val: gs.pc.reflection, tag: 'Reflection'});
		list[list.length - 1].deltaVal = deltaChar.reflection;		
	}
	
	// Cool Down Modifier:
	if (gs.pc.coolDownModifier > 0) {
		list.push({name: 'Cool Down Mod:', val: gs.pc.coolDownModifier, tag: 'CoolDownModifier'});
		
		if (deltaChar && deltaChar.coolDownModifier !== gs.pc.coolDownModifier) {
			list[list.length - 1].deltaVal = deltaChar.coolDownModifier;
		}
	}
	else if (deltaChar && deltaChar.coolDownModifier > 0) {
		list.push({name: 'Cool Down Mod: ', val: gs.pc.coolDownModifier, tag: 'CoolDownModifier'});
		list[list.length - 1].deltaVal = deltaChar.coolDownModifier;		
	}
	
	// Block Chance:
	if (gs.pc.blockChance > 0) {
		list.push({name: 'Block Chance:', val: gs.pc.blockChance, tag: 'BlockChance'});
		
		if (deltaChar && deltaChar.blockChance !== gs.pc.blockChance) {
			list[list.length - 1].deltaVal = deltaChar.blockChance;
		}
	}
	else if (deltaChar && deltaChar.blockChance > 0) {
		list.push({name: 'Block Chance: ', val: gs.pc.blockChance, tag: 'BlockChance'});
		list[list.length - 1].deltaVal = deltaChar.blockChance;		
	}
	
	// Stealth:
	if (gs.pc.stealth > 0) {
		list.push({name: 'Stealth:', val: gs.pc.stealth, tag: 'Stealth'});
		
		if (deltaChar && deltaChar.stealth !== gs.pc.stealth) {
			list[list.length - 1].deltaVal = deltaChar.stealth;
		}
	}
	else if (deltaChar && deltaChar.stealth > 0) {
		list.push({name: 'Stealth: ', val: gs.pc.stealth, tag: 'Stealth'});
		list[list.length - 1].deltaVal = deltaChar.stealth;		
	}
	
	// Flag Type Status Effects:
	let flagStatusEffect = function (statName, niceName, tag) {
		if (gs.pc[statName]) {
			list.push({name: niceName, val: '', tag: tag});
			
			// Removing the status effect:
			if (deltaChar && !deltaChar[statName]) {
				list[list.length - 1].deltaVal = 'remove';
			}
		}
		// Adding the status effect:
		else if (deltaChar && deltaChar[statName]) {
			list.push({name: niceName, val: '', tag: tag, deltaVal: 'add'});
		}
	};
	
	flagStatusEffect('isFlying', 'Levitation', 'Levitation');
	flagStatusEffect('isTelepathic', 'Telepathy', 'Telepathy');
	flagStatusEffect('isPoisonImmune', 'Poison Immune', 'PoisonImmune');
	flagStatusEffect('isGasImmune', 'Gas Immune', 'GasImmune');

	
	return list;
};



// GET_STAT_DESC:
// ************************************************************************************************
UIStatPanel.prototype.getStatDesc = function (tag) {
	var desc = {title: '', text: ''};
	
	if (tag === 'protection') {
		desc.title = 'Protection:\n';
		
		if (gs.pc.protection > 0) {
			desc.text += 'Reduces physical damage by 0-' + gs.pc.protection + '.';
		}
		else {
			desc.text += 'Reduce physical damage by 0.';
		}
	}
	else if (tag === 'evasion') {
		desc.title = 'Evasion';
		desc.text = 'You have a ' + util.toPercentStr(gs.pc.evasion) + ' chance to dodge melee and projectile attacks.\n\n';
		desc.text += 'Your max evasion is ' + util.toPercentStr(MAX_EVASION) + '.';
	}
	else if (tag === 'Stealth') {
		desc.title = 'Stealth';
		desc.text += 'Reduces the max range at which enemies can spot you.';
	}
	else if (tag === 'Reflection') {
		desc.title = 'Reflection';
		desc.text += 'Provides a ' + util.toPercentStr(gs.pc.reflection) + ' chance to reflect projectile attacks.\n\n';
		desc.text += 'Your max reflection is ' + util.toPercentStr(MAX_REFLECTION) + '.';
	}
	else if (tag === 'CoolDownModifier') {
		desc.title = 'Cool Down Modifier';
		desc.text += 'Reduces the cool down of abilities by ' + util.toPercentStr(gs.pc.coolDownModifier) + '\n\n';
	}
	else if (tag === 'BlockChance') {
		desc.title = 'Block Chance';
		desc.text += 'Provies a ' + util.toPercentStr(gs.pc.blockChance) + ' chance to block melee or projectile attacks with your shield.';
	}
	else if (tag === 'stealth') {
		desc.title = 'Stealth:\n';
		desc.text += 'Decreases the maximum range at which monsters can detect you.';
	}
	else if (tag === 'FireResistance') {
		desc.title = 'Fire Resistance:\n';
		
		if (gs.pc.resistance.Fire >= 0) {
			desc.text += 'Gives you a chance to resist up to ' + util.toPercentStr(gs.pc.resistance.Fire) + ' of all fire damage.\n\n';
			desc.text += 'Your max fire resistance is ' + util.toPercentStr(MAX_RESISTANCE) + '.';
		}
		else {
			desc.text += 'You will suffer ' + util.toPercentStr(Math.abs(gs.pc.resistance.Fire)) + ' more fire damage.';
		}
		
	}
	else if (tag === 'ColdResistance') {
		desc.title = 'Cold Resistance:\n';
		
		if (gs.pc.resistance.Cold >= 0) {
			desc.text += 'Gives you a chance to resist up to ' + util.toPercentStr(gs.pc.resistance.Cold) + ' of all cold damage.\n\n';
			desc.text += 'Your max cold resistance is ' + util.toPercentStr(MAX_RESISTANCE) + '.';
		}
		else {
			desc.text += 'You will suffer ' + util.toPercentStr(Math.abs(gs.pc.resistance.Cold)) + ' more cold damage.';
		}
		
		if (gs.pc.resistance.Cold >= AMBIENT_COLD_RESISTANCE) {
			desc.text += '\n\nYour cold resistance grants you immunity to the ambient cold of The Ice Caves.';
		}
	}
	else if (tag === 'ShockResistance') {
		desc.title = 'Shock Resistance:\n';
		
		if (gs.pc.resistance.Shock >= 0) {
			desc.text += 'Gives you a chance to resist up to ' + util.toPercentStr(gs.pc.resistance.Shock) + ' of all shock damage.\n\n';
			desc.text += 'Your max shock resistance is ' + util.toPercentStr(MAX_RESISTANCE) + '.';
		}
		else {
			desc.text += 'You will suffer ' + util.toPercentStr(Math.abs(gs.pc.resistance.Shock)) + ' more shock damage.';
		}
	}
	else if (tag === 'ToxicResistance') {
		desc.title = 'Toxic Resistance:\n';
		
		if (gs.pc.resistance.Toxic >= 0) {
			desc.text += 'Gives you a chance to resist up to ' + util.toPercentStr(gs.pc.resistance.Toxic) + ' of all toxic damage.\n\n';
			desc.text += 'Your max toxic resistance is ' + util.toPercentStr(MAX_RESISTANCE) + '.';
		}
		else {
			desc.text += 'You will suffer ' + util.toPercentStr(Math.abs(gs.pc.resistance.Toxic)) + ' more toxic damage.';
		}
	}
	else if (tag === 'abilityPower') {
		desc.title = 'Ability Power:\n';
		desc.text += 'Improves the power of ability effects.\n\n';
	}
	else if (tag === 'MagicPower') {
		desc.title = 'Magic Power:\n';
		desc.text += 'Improves the power of magic ability effects.\n\nMagic Power is added to Ability Power when casting magic spells.';
	}
	else if (tag === 'DamageShield') {
		desc.title = 'Damage Shield:\n';
		desc.text = 'Enemies will take damage when attacking you with melee.\n\n';
		
		['Physical', 'Fire', 'Cold', 'Shock', 'Toxic'].forEach(function (typeName) {
			if (gs.pc.damageShield[typeName] > 0) {
				desc.text += typeName + ': ' + gs.pc.damageShield[typeName] + '\n';
			}
		}, this);
	}
	else if (tag === 'LifeTap') {
		desc.title = 'Life Tap:\n';
		desc.text = 'Will heal you for ' + gs.pc.lifeTap + 'HP every time you kill an enemy.';
	}
	else if (tag === 'ManaTap') {
		desc.title = 'Mana Tap:\n';
		desc.text = 'You will gain ' + gs.pc.manaTap + 'MP every time you kill an enemy.';
	}
	else if (tag === 'hitPoints') {
		desc.title = 'Hit Points:';
		desc.text = HIT_POINTS_DESC;
	}
	else if (tag === 'manaPoints') {
		desc.title = 'Mana Points:';
		desc.text = MANA_POINTS_DESC;
	}
	else if (tag === 'speedPoints') {
		desc.title = 'Speed Points:';
		desc.text = SPEED_POINTS_DESC;
	}
	else if (tag === 'MeleeDamage') {
		desc.title = 'Bonus Melee Damage:';
		desc.text = 'Your bonus melee damage will be added to the base damage of your melee weapons.';
	}
	else if (tag === 'RangeDamage') {
		desc.title = 'Bonus Range Damage:';
		desc.text = 'Your bonus range damage will be added to the base damage of your bows and staves.';
	}
	else if (tag === 'Encumberance') {
		desc.title = 'Encumberance:\n';
		
		if (gs.pc.isEncumbered) {
			desc.text = 'Some of your equipment is to heavy for your strength.\n\n';
			
			desc.text += 'You are unable to sprint.\n';

			let delta = gs.pc.maxEncumberance - gs.pc.encumberance;
			desc.text += 'Ability Power: ' + util.toPercentStr(delta * PC_ABILITY_POWER_PENALTY_PER_ENC) + '\n';
		}
	}
	else if (tag === 'Levitation') {
		desc.title = 'Levitation';
		desc.text = 'You are flying and will avoid all negative terrain effects.';
	}
	else if (tag === 'PoisonImmune') {
		desc.title = 'Poison Immune';
		desc.text = 'You are completely immune to poison.';
	}
	else if (tag === 'GasImmune') {
		desc.title = 'Gas Immune';
		desc.text = 'You are completely immune to poison gas.';
	}
	
	
	return desc;
};


// GET_STAT_NAME_UNDER_POINTER:
// ************************************************************************************************
UIStatPanel.prototype.getStatNameUnderPointer = function () {
	for (let name in this.statLines) {
		if (this.statLines.hasOwnProperty(name)) {
			if (game.input.activePointer.y > this.statLines[name].nameText.y - 6 &&
				game.input.activePointer.y <= this.statLines[name].nameText.y + 16 &&
			   	game.input.activePointer.x < this.width + 36 &&
			   	this.statLines[name].nameText.visible) {
				return name;
			}
		}
	}
	
	return null;
};

// GET_DESC_UNDER_POINTER:
// ************************************************************************************************
UIStatPanel.prototype.getDescUnderPointer = function () {
	let statName = this.getStatNameUnderPointer();
	
	// Race desc:
	if (statName === 'race') {
		var desc = {title: '', text: ''};
		desc.title = gs.pc.race.name;
		desc.text = gs.pc.race.desc();
		
		// Need to remove the race name from the text (the first line):
		let lines = desc.text.split('\n');
		lines.splice(0,1);
		desc.text = lines.join('\n');
		
		return desc;
	}
	else if (statName) {
		return this.getStatDesc(this.statLines[statName].tag);
	}
	else {
		return null;
	}
};


