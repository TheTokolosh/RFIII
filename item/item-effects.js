/*global game, gs, util, console*/
/*global MAX_RESPONSES*/
/*global TILE_SIZE, RED_TARGET_BOX_FRAME, SHROOM_HP, SHROOM_EP, FACTION, RED_BOX_FRAME*/
/*jshint esversion: 6, laxbreak: true*/
'use strict';

// CREATE_ITEM_EFFECTS:
// ************************************************************************************************
gs.createItemEffects = function () {
	
	this.itemEffects = {};
	
	// READ_TOME:
	// ********************************************************************************************
	this.itemEffects.ReadTome = {};
	this.itemEffects.ReadTome.useImmediately = true;
	this.itemEffects.ReadTome.dontEndTurn = true;
	this.itemEffects.ReadTome.useOn = function (actingChar, targetTileIndex, item) {
		gs.pc.talents.addTomeTalents(item);
	};
	
	// MAPPING:
	// ********************************************************************************************
	this.itemEffects.Mapping = {};
	this.itemEffects.Mapping.useImmediately = true;
	this.itemEffects.Mapping.useOn = function (actingChar, targetTileIndex) {
		gs.createParticlePoof(gs.pc.tileIndex, 'PURPLE');
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
		gs.exploreMap();
	};
	
	// SCROLL_OF_TELEPORTATION:
	// ********************************************************************************************
	this.itemEffects.Teleportation = {};
	this.itemEffects.Teleportation.useImmediately = true;
	this.itemEffects.Teleportation.useOn = function (actingChar, targetTileIndex) {
		// Popup Text:
		gs.pc.popUpText('Teleport!');
		
		// Sound:
		gs.playSound(gs.sounds.teleport, gs.pc.tileIndex);
		
		// Clear Agro:
		gs.pc.clearAgro();
		
		// Anim Effect:
		gs.createSummonEffect(gs.pc.tileIndex, function () {
			// In this special case we don't want the player to teleport out of the Yendor room he is in:
			if (gs.zoneName === 'TheVaultOfYendor' && gs.zoneLevel === 5) {
				gs.pc.randomTeleport(gs.pc.tileIndex);
			}
			// We normally use the upstairs tileIndex in case the player has become trapped and is trying to teleport out:
			else {
				gs.pc.randomTeleport(gs.getUpStairsTileIndex());
			}
			
				
			// At Dest:
			gs.createSummonEffect(gs.pc.tileIndex);
		}, this, 8);
	};

	// SCROLL_OF_ENCHANTMENT:
	// ********************************************************************************************
	this.itemEffects.ScrollOfEnchantment = {};
	this.itemEffects.ScrollOfEnchantment.useImmediately = true;
	this.itemEffects.ScrollOfEnchantment.dontEndTurn = true;
	this.itemEffects.ScrollOfEnchantment.useOn = function () {
		gs.stateManager.pushState('EnchantmentMenu');
	};
	
	// SCROLL_OF_ACQUIREMENT:
	// ********************************************************************************************
	this.itemEffects.ScrollOfAcquirement = {};
	this.itemEffects.ScrollOfAcquirement.dontEndTurn = true;
	this.itemEffects.ScrollOfAcquirement.useImmediately = true;
	this.itemEffects.ScrollOfAcquirement.useOn = function () {
		gs.stateManager.pushState('AcquirementMenu');
	};
	
	// ********************************************************************************************
	// POTIONS:
	// ********************************************************************************************
	// HEALING_SHROOM:
	// ********************************************************************************************
	this.itemEffects.HealingShroom = {};
	this.itemEffects.HealingShroom.useImmediately = true;
	this.itemEffects.HealingShroom.useOn = function () {
		gs.pc.healHp(SHROOM_HP);
		gs.createParticlePoof(gs.pc.tileIndex, 'GREEN');
	};
	
	// ENERGY_SHROOM:
	// ********************************************************************************************
	this.itemEffects.EnergyShroom = {};
	this.itemEffects.EnergyShroom.useImmediately = true;
	this.itemEffects.EnergyShroom.useOn = function () {
		gs.pc.restoreMp(SHROOM_EP);
		gs.createParticlePoof(gs.pc.tileIndex, 'PURPLE');
	};

	// EAT:
	// ********************************************************************************************
	this.itemEffects.Eat = {};
	this.itemEffects.Eat.useImmediately = true;
	this.itemEffects.Eat.useOn = function (item) {
		gs.pc.currentFood = gs.pc.maxFood;
		gs.pc.healHp(Math.ceil(gs.pc.maxHp / 2));
		gs.pc.restoreMp(Math.ceil(gs.pc.maxMp / 2));
		gs.pc.restoreSp(Math.ceil(gs.pc.maxSp / 2));
	};

	// POTION_OF_HEALING:
	// ********************************************************************************************
	this.itemEffects.PotionOfHealing = {};
	this.itemEffects.PotionOfHealing.useImmediately = true;
	this.itemEffects.PotionOfHealing.useOn = function () {		
		if (gs.pc.currentHp === gs.pc.maxHp) {
			gs.pc.permanentHpBonus += 3;
			gs.pc.popUpText('+3 Max HP');
			gs.pc.updateStats();
		}
		else {
			gs.pc.popUpText('Fully Healed');
		}
		// Full Heal:
		gs.pc.healHp(gs.pc.maxHp);
		gs.pc.cure();
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	
		// Effect:
		gs.createHealingEffect(gs.pc.tileIndex);	
	};
	
	// POTION_OF_GAIN_ATTRIBUTE:
	// ********************************************************************************************
	this.itemEffects.PotionOfGainAttribute = {};
	this.itemEffects.PotionOfGainAttribute.useImmediately = true;
	this.itemEffects.PotionOfGainAttribute.useOn = function () {
		let attributeList = gs.pc.nonMaxAttributeList();
		
		// If possible we provide a choice between two attributes:
		if (attributeList.length >= 2) {
			gs.openAttributeGainMenu(util.randSubset(attributeList, 2));
		}
		else {
			gs.pc.attributePoints += 1;
			gs.pc.popUpText('+1 Attribute Point');
		}
		
		// Spell Effect:
		gs.createFireEffect(gs.pc.tileIndex);
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	};
	
	// POTION_OF_AMNESIA:
	// ********************************************************************************************
	this.itemEffects.PotionOfAmnesia = {};
	this.itemEffects.PotionOfAmnesia.useImmediately = true;
	this.itemEffects.PotionOfAmnesia.useOn = function () {
		let talentList = gs.pc.talents.talentList.filter(talent => talent.rank > 0 && talent.type.name !== 'EnchantItem');
		
		// Setup Dialog:
		let dialog = [];
		
		let forgetTalent = function (talentName) {
			// Adding Talent Points:
			let talentPoints = gs.pc.talents.getTalent(talentName).rank;
			gs.pc.talentPoints += talentPoints;
			
			// Removing Talent:
			gs.pc.talents.getTalent(talentName).rank = 0;
			
			// Removing Ability:
			if (gs.talents[talentName].ability) {
				gs.pc.removeAbility(gs.talents[talentName].ability);
			}
			
			// Text:
			gs.pc.popUpText('Forgot ' + gs.capitalSplit(talentName));
			gs.pc.popUpText('+' + talentPoints + ' talent points');
			
			// Spell Effect:
			gs.createManaEffect(gs.pc.tileIndex);

			// Sound:
			gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
			
			// Remove Potion:
			gs.pc.inventory.removeItem(gs.pc.inventory.itemOfType(gs.itemTypes.PotionOfAmnesia), 1);
		};
		
		let addTalent = function (dialogIndex, talentIndex) {
			dialog[dialogIndex].responses.push({
				text: gs.capitalSplit(talentList[talentIndex].type.name),
				nextLine: 'exit',
				func: forgetTalent.bind(gs, talentList[talentIndex].type.name)
			});
		};
		
		// Single Page:
		if (talentList.length <= 6) {
			// PAGE 1:
			dialog[0] = {};
			dialog[0].text = 'Which talent would you like to forget?';
			dialog[0].responses = [];
			for (let i = 0; i < talentList.length; i += 1) {
				addTalent(0, i);
			}
			dialog[0].responses.push({
				text: '[exit]',
				nextLine: 'exit'
			});
		}
		// Two Pages:
		else if (talentList.length <= 6 + 5) {
			// PAGE 1:
			dialog[0] = {};
			dialog[0].text = 'Which talent would you like to forget?';
			dialog[0].responses = [];
			for (let i = 0; i < 6; i += 1) {
				addTalent(0, i);
			}
			dialog[0].responses.push({
				text: '[next]',
				nextLine: 1
			});
			
			// PAGE 2:
			dialog[1] = {};
			dialog[1].text = 'Which talent would you like to forget?';
			dialog[1].responses = [];
			for (let i = 6; i < talentList.length; i += 1) {
				addTalent(1, i);
			}
			dialog[1].responses.push({
				text: '[back]',
				nextLine: 0
			});
			dialog[1].responses.push({
				text: '[exit]',
				nextLine: 'exit'
			});
		}
		// Three Pages:
		else {
			// PAGE 1:
			dialog[0] = {};
			dialog[0].text = 'Which talent would you like to forget?';
			dialog[0].responses = [];
			for (let i = 0; i < 6; i += 1) {
				addTalent(0, i);
			}
			dialog[0].responses.push({
				text: '[next]',
				nextLine: 1
			});
			
			// PAGE 2:
			dialog[1] = {};
			dialog[1].text = 'Which talent would you like to forget?';
			dialog[1].responses = [];
			for (let i = 6; i < 11; i += 1) {
				addTalent(1, i);
			}
			dialog[1].responses.push({
				text: '[back]',
				nextLine: 0
			});
			dialog[1].responses.push({
				text: '[next]',
				nextLine: 2
			});
			
			// PAGE 3:
			dialog[2] = {};
			dialog[2].text = 'Which talent would you like to forget?';
			dialog[2].responses = [];
			for (let i = 11; i < talentList.length; i += 1) {
				addTalent(2, i);
			}
			dialog[2].responses.push({
				text: '[back]',
				nextLine: 1
			});
			dialog[2].responses.push({
				text: '[exit]',
				nextLine: 'exit'
			});
		}

			
		

		
		

		// Push Dialog:
		gs.messageQueue.pushMessage(dialog);
		
		
	};
	
	// POTION_OF_ENERGY:
	// ********************************************************************************************
	this.itemEffects.PotionOfEnergy = {};
	this.itemEffects.PotionOfEnergy.useImmediately = true;
	this.itemEffects.PotionOfEnergy.useOn = function () {
		if (gs.pc.currentMp === gs.pc.maxMp) {
			gs.pc.permanentMpBonus += 2;
			gs.pc.popUpText('+2 Max MP');
			gs.pc.updateStats();
		}
		else {
			gs.pc.popUpText('Full Energy');
		}
		
		// Full Mana and cool Downs:
		gs.pc.restoreMp(gs.pc.maxMp);
		gs.pc.currentSp = gs.pc.maxSp;
		gs.pc.mentalCure();
		gs.pc.resetAllCoolDowns();
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
		
		// Effect:
		gs.createManaEffect(gs.pc.tileIndex);
	};
	
	// POTION_OF_EXPERIENCE:
	// ********************************************************************************************
	this.itemEffects.PotionOfExperience = {};
	this.itemEffects.PotionOfExperience.useImmediately = true;
	this.itemEffects.PotionOfExperience.useOn = function () {
		// Status Effect:
		gs.pc.statusEffects.add('ExperienceBoost');
		
		// Spell Effect:
		gs.createEXPEffect(gs.pc.tileIndex);
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	};
	
	// POTION_OF_POWER:
	// ********************************************************************************************
	this.itemEffects.PotionOfPower = {};
	this.itemEffects.PotionOfPower.useImmediately = true;
	this.itemEffects.PotionOfPower.useOn = function () {
		// Full Mana and cool Downs:
		gs.pc.restoreMp(gs.pc.maxMp);
		gs.pc.currentSp = gs.pc.maxSp;
		gs.pc.mentalCure();
		gs.pc.resetAllCoolDowns();
		
		// Status Effect:
		gs.pc.statusEffects.add('Power');
		
		// Spell Effect:
		gs.createIceEffect(gs.pc.tileIndex);
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	};
	
	// POTION_OF_RESISTANCE:
	// ********************************************************************************************
	this.itemEffects.PotionOfResistance = {};
	this.itemEffects.PotionOfResistance.useImmediately = true;
	this.itemEffects.PotionOfResistance.useOn = function () {
		// Full Heal:
		gs.pc.healHp(gs.pc.maxHp);
		gs.pc.cure();
		
		// Status Effect:
		gs.pc.statusEffects.add('Resistance');
		
		// Spell Effect:
		gs.createIceEffect(gs.pc.tileIndex);
		
		// Sound:
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	};

};

