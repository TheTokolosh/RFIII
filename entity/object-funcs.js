/*global gs, util, game*/
/*global TomeGenerator, Item, levelController*/
/*global DAMAGE_TYPE, SPECIAL_TEXT, FACTION*/
/*global FIRE_GLYPH_MIN_DAMAGE, FIRE_GLYPH_MAX_DAMAGE*/
/*global SPIKE_TRAP_MIN_DAMAGE, SPIKE_TRAP_MAX_DAMAGE*/
/*global LOS_DISTANCE, SKELETON_REVIVE_TIME, CROSS_GLYPH_DURATION*/
/*jshint esversion: 6*/
'use strict';

// CREATE_OBJECT_FUNCS:
// ************************************************************************************************
gs.createObjectFuncs = function () {
	this.objectFuncs = {};
	
	// READ_SIGN_POST:
	// ********************************************************************************************
	this.objectFuncs.readSignPost = function (character) {
		let toTileIndexList = this.toTileIndexList;
		
		let text = this.customDesc;
		
		// Replacing #keys w/ text from SPECIAL_TEXT:
		text = text.replace(/#.*/, function(match) {
			let key = match.substring(1);
			if (SPECIAL_TEXT.hasOwnProperty(key)) {
				if (typeof SPECIAL_TEXT[key] === 'function') {
					return SPECIAL_TEXT[key]();
				}
				else {
					return SPECIAL_TEXT[key];
				}
			}
			else {
				return match;
			}
		});
		
		let postDialog = null;
		if (this.customDesc === '#Taldorak') {
			postDialog = gs.dialog.YendorTaldorak;
		}
		
		let dialog = [{
			text: text,
			responses: [{
				text: '[Done]', 
				nextLine: 'exit',
				keys: ['accept', 'escape'],
				func: function () {
					// Emitting signal when closing the dialog:
					toTileIndexList.forEach(function (tileIndex) {
						levelController.sendSignal(tileIndex);
					}, this);
					
					// We open a dialog after (generally a yendor quip)
					// The dialog is delayed a bit
					if (postDialog) {
						let event = {timer: 0};
						event.updateFrame = function () {
							
							this.timer += 1;
								
							if (this.timer === 20) {
								gs.messageQueue.pushMessage(postDialog);
							}
						};
							
						event.isComplete = function () {
							return this.timer >= 20;	
						};
						
						// Push event:
						gs.pc.eventQueue.addEvent(event);
					}
				}
			}]
		}];
		
		gs.messageQueue.pushMessage(dialog);
		gs.pc.actionQueue = [];
	};
	
	
	// USE_SHRINE_OF_STRENGTH:
	// ********************************************************************************************
	this.objectFuncs.useShrineOfStrength = function (character) {
		gs.messageQueue.pushMessage(gs.dialog.ShrineOfStrength);
		gs.pc.actionQueue = [];
	};
	
	// USE_SHRINE_OF_INTELLIGENCE:
	// ********************************************************************************************
	this.objectFuncs.useShrineOfIntelligence = function (character) {
		gs.messageQueue.pushMessage(gs.dialog.ShrineOfIntelligence);
		gs.pc.actionQueue = [];
	};
	
	// USE_SHRINE_OF_DEXTERITY:
	// ********************************************************************************************
	this.objectFuncs.useShrineOfDexterity = function (character) {
		gs.messageQueue.pushMessage(gs.dialog.ShrineOfDexterity);
		gs.pc.actionQueue = [];
	};
	
	// OPEN_SIMPLE_DOOR:
	// ********************************************************************************************
	this.objectFuncs.openSimpleDoor = function (character) {
		this.openDoor();
	};
	
	// OPEN_GLYPH_DOOR:
	// ********************************************************************************************
	this.objectFuncs.openGlyphDoor = function (character) {
		if (!this.isOpen) {
			gs.messageQueue.pushMessage(gs.dialog.GlyphDoor);
			gs.openingDoor = this;
			gs.pc.actionQueue = [];
		}
	};
	
	// OPEN_KEY_DOOR:
	// ********************************************************************************************
	this.objectFuncs.openKeyDoor = function (character) {
		if (!this.isOpen) {
			gs.messageQueue.pushMessage(gs.dialog.KeyGate);
			gs.openingDoor = this;
			gs.pc.actionQueue = [];
		}
	};
	
	// OPEN_TIMED_DOOR:
	// ********************************************************************************************
	this.objectFuncs.openTimedDoor = function (character) {
		if (!this.isOpen) {
			gs.messageQueue.pushMessage(gs.dialog.SealedTimedGate);
			gs.openingDoor = this;
			gs.pc.actionQueue = [];
		}
	};
	
	// OPEN_SWITCH_GATE:
	// ********************************************************************************************
	this.objectFuncs.openSwitchDoor = function (character) {
		if (!this.isOpen) {
			if (util.inArray(gs.zoneName, ['TheSewers', 'TheCore', 'TheIceCaves']) && gs.zoneLevel === 4) {
				gs.messageQueue.pushMessage(gs.dialog.BossGate);
			}
			else {
				gs.messageQueue.pushMessage(gs.dialog.SwitchGate);
			}
			
			gs.openingDoor = this;
			gs.pc.actionQueue = [];
		}
	};
		

	
	
	
	
	this.objectFuncs.useZoneLine = function () {
		gs.pc.useZoneLine(this);
	};
	
	this.objectFuncs.useYendorGate = function () {
		let dialog = [{}],
			gate = this;
		
		// Gate is Locked:
		if (this.isLocked) {
			// Opening gate w/ runes:
			if (gs.pc.inventory.numRunes() >= 2) {
				
				dialog[0].text = 'Your runes glow as the gate slowly grinds open.';
				dialog[0].responses = [
					{text: ['OK'], 
					 nextLine: 'exit',
					 keys: ['accept', 'escape'],
					 func: function () {
						gate.isLocked = false;
						gs.pc.useZoneLine(gate);
					}}
				];
			}
			// Not enough runes:
			else {
				dialog[0].text = 'The gate is sealed. You will need the magic of at least two runes to unlock it.';
				dialog[0].responses = [{text: ['OK'], nextLine: 'exit', keys: ['accept', 'escape']}];
			}
			
			gs.messageQueue.pushMessage(dialog);
		}
		// Gate is already unlocked:
		else {
			gs.pc.useZoneLine(gate);
		}
	};
	
	this.objectFuncs.eyeOfYendorUpdateTurn = function () {
		let angle = game.math.angleBetween(this.tileIndex.x, this.tileIndex.y, gs.pc.tileIndex.x, gs.pc.tileIndex.y);
		
		if (angle < 0.79 && angle > -0.78) {
			this.sprite.frame = 319;
		}
		else if (angle > 2.3 || angle < -2.3) {
			this.sprite.frame = 318;
		}
		else {
			this.sprite.frame = 269;
		}
	};
	
	
	this.objectFuncs.fireBallLauncherUpdateTurn = function () {
		var delta, proj, damage;
		
		damage = gs.getScaledTrapDamage(FIRE_GLYPH_MIN_DAMAGE, FIRE_GLYPH_MAX_DAMAGE);
		
		if (this.sprite.frame === 1856) delta = {x: 0, y: 1};
		if (this.sprite.frame === 1857) delta = {x: 1, y: 0};
		if (this.sprite.frame === 1858) delta = {x: 0, y: -1};
		if (this.sprite.frame === 1859) delta = {x: -1, y: 0};
		
		// Activate:
		if (this.currentTurn <= 0) {
			if (gs.isPassable(this.tileIndex.x + delta.x, this.tileIndex.y + delta.y)) {
				proj = gs.createNPC({x: this.tileIndex.x + delta.x, y: this.tileIndex.y + delta.y}, 'OrbOfFire', {burstDamage: damage});
				proj.moveDelta = {x: delta.x, y: delta.y};
				proj.waitTime = 100;
				proj.isAgroed = true;
			}
			this.currentTurn = this.loopTurns || 25;
		} 
		// Ticking Time:
		else {
			this.currentTurn -= 1;
		}
	};
	
	this.objectFuncs.pressurePlateActivate = function () {
		if (this.currentTurn === 0) {
			this.emitSignal();
			this.currentTurn = this.loopTurns || 0;
		}
	};
	
	this.objectFuncs.pressurePlateUpdateTurn = function () {
		if (this.currentTurn !== 0) {
			this.currentTurn -= 1;
			this.sprite.frame = this.type.frame + 1;
		}
		else {
			this.sprite.frame = this.type.frame;
		}
	};
	
	this.objectFuncs.timedSpikeTrapUpdateTurn = function () {
		var damage;
		
		damage = gs.getScaledTrapDamage(SPIKE_TRAP_MIN_DAMAGE, SPIKE_TRAP_MAX_DAMAGE);
		
		// Activate:
		if (this.currentTurn <= 0) {
			this.currentTurn = this.loopTurns || 5;
			if (gs.getChar(this.tileIndex)) {
				gs.playSound(gs.sounds.melee, this.tileIndex);
				gs.getChar(this.tileIndex).takeDamage(gs.getTrapDamage('SpikeTrap'), 'Physical', {killer: 'SpikeTrap'});
			}
			this.sprite.frame = this.type.frame + 1;
		}
		// Ticking Time:
		else {
			this.sprite.frame = this.type.frame;
			this.currentTurn -= 1;
		}
		
	};
	
	
	this.objectFuncs.drinkHealthFountain = function (character) {
		// Full Heal:
		character.healHp(character.maxHp);
		gs.pc.cure();

		// Regeneration Effect:
		character.statusEffects.add('Regeneration');
		
		// Sound and Effect:
		gs.playSound(gs.sounds.cure, this.tileIndex);
		gs.createHealingEffect(gs.pc.tileIndex);
		
		// Sending Signals
		this.toTileIndexList.forEach(function (toTileIndex) {
			levelController.sendSignal(toTileIndex);
		}, this);
		
		// Update Fountain:
		this.setIsFull(false);
		gs.HUD.miniMap.refresh();
	};
	
	this.objectFuncs.drinkEnergyFountain = function (character) {
		// Full Restore:
		gs.pc.mentalCure();	
		gs.pc.currentSp = gs.pc.maxSp;
		character.restoreMp(character.maxMp);
		character.resetAllCoolDowns();
		
		// Restoration Status Effect:
		character.statusEffects.add('Restoration');
		
		// Sound and Effect:
		gs.playSound(gs.sounds.cure, this.tileIndex);
		gs.createManaEffect(gs.pc.tileIndex);
		
		// Sending Signals
		this.toTileIndexList.forEach(function (toTileIndex) {
			levelController.sendSignal(toTileIndex);
		}, this);
		
		// Update Fountain:
		this.setIsFull(false);
		gs.HUD.miniMap.refresh();
	};

	this.objectFuncs.drinkExperienceFountain = function (character) {
		// Status Effect:
		character.statusEffects.add('ExperienceBoost');
		
		// Spell Effect:
		gs.createEXPEffect(character.tileIndex);
		
		// Sending Signals
		this.toTileIndexList.forEach(function (toTileIndex) {
			levelController.sendSignal(toTileIndex);
		}, this);
		
		// Sound:
		gs.playSound(gs.sounds.cure, character.tileIndex);
		
		// Update Fountain:
		this.setIsFull(false);
		gs.HUD.miniMap.refresh();
	};
	
	this.objectFuncs.wellOfWishing = function (character) {
		gs.usingFountain = this;
		gs.stateManager.pushState('AcquirementMenu');
	};
	
	this.objectFuncs.useEnchantmentTable = function (character) {
		gs.usingFountain = this;
		gs.stateManager.pushState('EnchantmentMenu');
	};
	
	this.objectFuncs.useTransferanceTable = function (character) {
		gs.usingFountain = this;
		gs.stateManager.pushState('TransferanceMenu');
	};
	
	this.objectFuncs.useTomeOfKnowledge = function (character) {
		gs.openTomeOfKnowledgeMenu(this);
	};
	
	this.objectFuncs.drinkKnowledgeFountain = function (character) {
		// Talent Point:
		gs.pc.talentPoints += 1;
		
		// Popup Text:
		gs.pc.popUpText('+1 Talent Point');
		
		// Sound:
		gs.playSound(gs.sounds.cure, this.tileIndex);
		
		// Consume Fountain:
		this.setIsFull(false);
		
		// Spell Effect:
		gs.createEXPEffect(gs.pc.tileIndex);
	};
	
	
	this.objectFuncs.drinkFountainOfGainAttribute = function (character) {
		let attributeList = gs.pc.nonMaxAttributeList();
		
		// If possible we provide a choice between two attributes:
		if (attributeList.length >= 2) {
			gs.usingFountain = this;
			gs.openAttributeGainMenu(util.randSubset(attributeList, 2));
		}
		else {
			gs.pc.attributePoints += 1;
			gs.pc.popUpText('+1 Attribute Point');
		}
	
		// Sound:
		gs.playSound(gs.sounds.cure, this.tileIndex);
		
		// Consume Fountain:
		this.setIsFull(false);
		
		// Spell Effect:
		gs.createFireEffect(gs.pc.tileIndex);
		
		// Refresh to show empty fountain:
		gs.HUD.miniMap.refresh();
	};
	
	
	
	this.objectFuncs.readBookShelf = function (character) {
		var talentName = TomeGenerator.getBookShelfTalent(),
			skillName = gs.pc.getRandomSkillName(),
			choice,
			list = [
				{name: 'Scroll', percent: 40}, 
				{name: 'TalentPoint', percent: 5},
				//{name: 'SkillPoint', percent: 20},
			];
			
		/*
		if (skillName) {
			list.push({name: 'RandomSkill', percent: 80});
		}
		*/
		
		if (talentName) {
			list.push({name: 'RandomTalent', percent: 10});
		}
		
		choice = util.chooseRandom(list);
		
		if (choice === 'Scroll') {
			gs.pc.inventory.addItem(gs.createRandomItem('Scrolls'));
		}
		else if (choice === 'SkillPoint') {
			gs.pc.skillPoints += 1;
			gs.pc.popUpText('+1 Skill Point');
			gs.createEXPEffect(gs.pc.tileIndex);
		}
		else if (choice === 'RandomSkill') {
			gs.pc.skillPoints += 1; // gainSkill will -1 skillPoints
			gs.pc.gainSkill(skillName);
			gs.pc.popUpText('+1 ' + gs.capitalSplit(skillName) + ' skill');
			gs.createEXPEffect(gs.pc.tileIndex);
		}
		else if (choice === 'TalentPoint') {
			gs.pc.talentPoints += 1;
			gs.pc.popUpText('+1 Talent Point');
			gs.createEXPEffect(gs.pc.tileIndex);
		}
		else if ( choice === 'RandomTalent') {
			gs.pc.talents.addTalent(talentName);
			gs.pc.popUpText(gs.capitalSplit(talentName) + ' Talent');
			gs.createEXPEffect(gs.pc.tileIndex);
		}
		
		// Stop exploration:
		gs.pc.stopExploring();
		
		gs.createParticlePoof(character.tileIndex, 'WHITE');
		gs.playSound(gs.sounds.point, this.tileIndex);
		
		this.setIsFull(false);
		
		gs.HUD.miniMap.refresh();
	};
	

	this.objectFuncs.meatRack = function (character) {
		gs.pc.inventory.addItem(Item.createItem('Meat'));
		gs.playSound(gs.sounds.food, this.tileIndex);
		this.setIsFull(false);
		this.isOpen = true;
		gs.pc.stopExploring();
		
		gs.HUD.miniMap.refresh();
	};
	
	this.objectFuncs.openCrystalChest = function (character) {
		gs.openingContainer = this;
		
		if (this.isOpen) {
			return;
		}
		// Locked:
		else if (this.isLocked) {
			gs.messageQueue.pushMessage(gs.dialog.LockedCrystalChest);
		}
		// Not sealed:
		else {
			gs.openCrystalChestMenu(this);
		}
	};
	
	
	
	this.objectFuncs.timedDoorStepOn = function (character) {
		if (character === gs.pc && this.timer > 0) {
			this.timer = -2;
			gs.createPopUpTextAtTileIndex(this.tileIndex, 'Click!');
			gs.playSound(gs.sounds.door, this.tileIndex);
		}
	};
	
	this.objectFuncs.timedGateUpdateTurn = function () {
		// Ticking timer:
		if (this.timer > 0) {
			this.timer -= 1;
		}
		
		// Closing Gate:
		if (this.isOpen && this.timer === 0 && !gs.getChar(this.tileIndex)) {
			this.isOpen = false;
			this.sprite.frame = this.type.frame;
			this.timer = -1; // Stops gate from closing again (if switch opens it)
		}
	};
	
	// BLOOD:
	// ********************************************************************************************
	this.objectFuncs.bloodUpdateTurn = function () {
		if (!this.currentTurn) {
			this.currentTurn = 0;
		}

		this.currentTurn += 1;

		if (this.currentTurn >= 10) {
			gs.destroyObject(this);
		}
	};
	
	this.objectFuncs.openChest = function () {
		this.isOpen = true;
		
		this.sprite.frame = this.type.openFrame;
		
		gs.playSound(gs.sounds.door, this.tileIndex);
		
		gs.createFloorItem(this.tileIndex, this.item);
		
		this.emitSignal();
	};
	

	this.objectFuncs.bearTrapActivate = function (character) {
		if (this.currentTurn === 0) {
			// Orbs of Fire, Arcane Arrows etc. will not trigger bear trap:
			if (character && character.isDamageImmune) {
				return;
			}
			
			// Very special case:
			// An NPC is standing on a now open bear trap and the player has dash attacked through him.
			// In this special case, the bear trap will not trigger
			if (character === gs.pc && character.statusEffects.has('DashAttack') && gs.getTile(this.tileIndex) !== gs.pc) {
				return;
			}
			
			gs.playSound(gs.sounds.melee, this.tileIndex);
			this.currentTurn = 6;
			
			
			if (character) {
				let damage = gs.getTrapDamage(this.type.name);
				
				// Override with saved damage (player bear traps):
				if (this.damage) {
					damage = this.damage;
				}
				
				character.statusEffects.add('Immobile', {duration: 5, firstTurn: false});
				character.takeDamage(damage, 'Physical', {killer: 'BearTrap'});
			}
			this.sprite.frame = 302;
		}
	};

	this.objectFuncs.bearTrapUpdateTurn = function () {
		if (this.currentTurn > 0) {
			this.currentTurn -= 1;
			
			// Reset:
			if (this.currentTurn === 0) {
				gs.createPopUpTextAtTileIndex(this.tileIndex, 'Click!');
				this.sprite.frame = this.type.frame;
			}
		} 

	};
	
	this.objectFuncs.IceBombUpdateTurn = function () {
		// Count Down:
		if (this.currentTurn < 3) {
			this.currentTurn += 1;
			
			// Popup Text:
			gs.createPopUpTextAtTileIndex(this.tileIndex, 4 - this.currentTurn);
		} 
		// Explode:
		else {
			gs.getIndexListInBox(this.tileIndex.x - 1, this.tileIndex.y - 1, this.tileIndex.x + 2, this.tileIndex.y + 2).forEach(function (index) {
				if (!util.vectorEqual(this.tileIndex, index)) {
					gs.createProjectile(this, index, 'IceArrow', this.damage, 4, {killer: this});
				}
			}, this);
			
			gs.playSound(gs.sounds.ice, this.tileIndex);
			gs.destroyObject(this);
		}
	};
	
	this.objectFuncs.BoneBombUpdateTurn = function () {
		// Count Down:
		if (this.currentTurn < 3) {
			this.currentTurn += 1;
			
			// Popup Text:
			gs.createPopUpTextAtTileIndex(this.tileIndex, 4 - this.currentTurn);
		} 
		// Explode:
		else {
			gs.getIndexListInBox(this.tileIndex.x - 1, this.tileIndex.y - 1, this.tileIndex.x + 2, this.tileIndex.y + 2).forEach(function (index) {
				if (!util.vectorEqual(this.tileIndex, index)) {
					gs.createProjectile(this, index, 'BoneArrow', this.damage, 4, {killer: this});
				}
			}, this);
			
			gs.playSound(gs.sounds.bolt, this.tileIndex);
			gs.destroyObject(this);
		}
	};
	
	this.objectFuncs.fireCrossGlyphUpdateTurn = function () {
		let indexList, tileIndex;
		
		let effect;
		
		// Count Down:
		if (this.currentTurn < CROSS_GLYPH_DURATION && gs.getCharWithID(this.casterId)) {
			this.currentTurn += 1;
		}
		// Poof:
		else {
			gs.createPopUpTextAtTileIndex(this.tileIndex, 'Poof!');
			gs.createParticlePoof(this.tileIndex, 'WHITE');
			gs.playSound(gs.sounds.death);
			gs.destroyObject(this);
			return;
		}
		
		if (this.type.name === 'FireCrossGlyph') {
			effect = function (tileIndex) {
				gs.createFire(tileIndex, this.damage);
			}.bind(this);
		}
		else if (this.type.name === 'ShockCrossGlyph') {
			effect = function (tileIndex) {
				gs.createShock(tileIndex, this.damage);
			}.bind(this);
		}
		
		this.distance = this.distance || 1;
		
		// Shoot:
		if (this.currentTurn > 1) {
			// Shoot Horizontal 
			if (this.currentTurn % 2 === 0) {
				effect(this.tileIndex);

				// Right:
				tileIndex = {x: this.tileIndex.x + this.distance, y: this.tileIndex.y};
				indexList = gs.getIndexInRay(this.tileIndex, tileIndex, index => !gs.isStaticPassable(index));
				indexList.forEach(index => effect(index));

				// Left:
				tileIndex = {x: this.tileIndex.x - this.distance, y: this.tileIndex.y};
				indexList = gs.getIndexInRay(this.tileIndex, tileIndex, index => !gs.isStaticPassable(index));
				indexList.forEach(index => effect(index));

				// Top:
				tileIndex = {x: this.tileIndex.x, y: this.tileIndex.y - this.distance};
				indexList = gs.getIndexInRay(this.tileIndex, tileIndex, index => !gs.isStaticPassable(index));
				indexList.forEach(index => effect(index));

				// Bottom:
				tileIndex = {x: this.tileIndex.x, y: this.tileIndex.y + this.distance};
				indexList = gs.getIndexInRay(this.tileIndex, tileIndex, index => !gs.isStaticPassable(index));
				indexList.forEach(index => effect(index));

				// Face Diagonal:
				this.sprite.frame = this.type.frame + 1;
			}
			// Shoot Diagonal:
			else if (this.currentTurn % 2 === 1) {
				effect(this.tileIndex);

				// Right + Up:
				tileIndex = {x: this.tileIndex.x + this.distance, y: this.tileIndex.y - this.distance};
				indexList = gs.getIndexInRay(this.tileIndex, tileIndex, index => !gs.isStaticPassable(index));
				indexList.forEach(index => effect(index));

				// Left + Up:
				tileIndex = {x: this.tileIndex.x - this.distance, y: this.tileIndex.y - this.distance};
				indexList = gs.getIndexInRay(this.tileIndex, tileIndex, index => !gs.isStaticPassable(index));
				indexList.forEach(index => effect(index));

				// Right + Down:
				tileIndex = {x: this.tileIndex.x + this.distance, y: this.tileIndex.y + this.distance};
				indexList = gs.getIndexInRay(this.tileIndex, tileIndex, index => !gs.isStaticPassable(index));
				indexList.forEach(index => effect(index));

				// Left Down:
				tileIndex = {x: this.tileIndex.x - this.distance, y: this.tileIndex.y + this.distance};
				indexList = gs.getIndexInRay(this.tileIndex, tileIndex, index => !gs.isStaticPassable(index));
				indexList.forEach(index => effect(index));

				// Face Horizontal:
				this.sprite.frame = this.type.frame;

				this.distance += 1;
			}
		}

		
	
	};
	
	this.objectFuncs.bombUpdateTurn = function () {
		// Count Down:
		if (this.currentTurn < 1) {
			this.currentTurn += 1;
		} 
		// Explode:
		else {
			gs.destroyObject(this);
			gs.createExplosionCross(this.tileIndex, 1, this.damage || 4, {killer: 'Bomb'});
		}
	};
	
	
	this.objectFuncs.skeletonUpdateTurn = function () {
		if (gs.findChar('CryptAltar')) {
			// Count Down:
			if (this.currentTurn < SKELETON_REVIVE_TIME) {
				this.currentTurn += 1;
			}
			// Revive:
			else if (gs.isPassable(this.tileIndex)) {
				let npc = gs.createNPC(this.tileIndex, this.npcTypeName || 'SkeletonWarrior');
				
				// Set exp to 0:
				npc.exp = 0;
				
				gs.destroyObject(this);
			}
		}
	};
	
	this.objectFuncs.lightningRodUpdateTurn = function () {
		// Count Down:
		if (this.currentTurn < 5) {
			this.currentTurn += 1;
		} 
		// Explode:
		else {
			gs.createPopUpTextAtTileIndex(this.tileIndex, 'Poof');
			gs.createParticlePoof(this.tileIndex, 'WHITE');
			gs.destroyObject(this);
		
		}
	};
	
	this.objectFuncs.spikeTrapActivate = function (character) {
		// Orbs of Fire, Arcane Arrows etc. will not trigger bear trap:
		if (character && character.isDamageImmune) {
			return;
		}
		
		if (this.currentTurn === 0) {
			gs.playSound(gs.sounds.melee, this.tileIndex);
			this.currentTurn = 5;
			if (character) {
				character.takeDamage(gs.getTrapDamage(this.type.name), 'Physical', {killer: 'SpikeTrap'});
			}
			this.sprite.frame = 303;
		}
	};

	this.objectFuncs.spikeTrapUpdateTurn = function () {
		if (this.currentTurn > 0) {
			this.currentTurn -= 1;
			
			if (this.currentTurn === 0) {
				this.sprite.frame = this.type.frame;
			}
		} 
	};
	
	this.objectFuncs.fireVentActivate = function () {
		if (this.currentTurn === 0) {
			gs.createExplosion(this.tileIndex, 1, gs.getTrapDamage('FireVent'), {killer: 'FireVent'});
			this.currentTurn = 3;
			this.sprite.frame = 304;
		}
	};
	
	this.objectFuncs.FireVentUpdateTurn = function () {
		if (this.currentTurn > 0) {
			this.currentTurn -= 1;
			
			if (this.currentTurn === 0) {
				this.sprite.frame = this.type.frame;
			}
		} 
	};
    
	// Used for one time triggered fire vents (trap rooms):
    this.objectFuncs.activateFireVent = function () {
		gs.createExplosion(this.tileIndex, 1, gs.getTrapDamage('FireVent'), {killer: 'FireVent'});
    };
	

	this.objectFuncs.healingShroomActivate = function (character) {
		if (character === gs.pc) {
			gs.pc.inventory.addItem(Item.createItem('HealingShroom'));
		} 
		
		gs.playSound(gs.sounds.point, this.tileIndex);
		gs.createParticlePoof(this.tileIndex, 'GREEN', 10);
		gs.destroyObject(this);
	};
	
	this.objectFuncs.manaShroomActivate = function (character) {
		if (character === gs.pc) {
			gs.pc.inventory.addItem(Item.createItem('EnergyShroom'));
		}
		
		gs.playSound(gs.sounds.point, this.tileIndex);
		gs.createParticlePoof(this.tileIndex, 'PURPLE', 10);
		gs.destroyObject(this);
	};

	this.objectFuncs.fireShroomActivate = function (character) {
		gs.destroyObject(this);
		gs.createFire(this.tileIndex, gs.getTrapDamage('FireShroom'), {killer: 'FireShroom'});
	};
	
	this.objectFuncs.flameWebActivate = function (character) {
		if (!character.isFlying && !character.type.isFlameWebImmune) {
			let damage = Math.floor(gs.getTrapDamage('FlameWeb'));
			character.takeDamage(damage, DAMAGE_TYPE.FIRE, {killer: 'FlameWeb'});
		}
	};
	
	this.objectFuncs.shockReedsActivate = function (character) {
		let damage = gs.getTrapDamage('ShockReeds');
		
		
		gs.destroyObject(this);
		gs.createShock(this.tileIndex, damage, {killer: 'ShockReed', spread: 3});
	};
	
	this.objectFuncs.fireGlyphActivate = function (character) {
		var damage = gs.getTrapDamage('FireGlyph');
		gs.destroyObject(this);
		gs.createFire(this.tileIndex, damage, {killer: 'FireGlyph'});
		
		gs.createCloud(this.tileIndex, 'FlamingCloud', Math.ceil(damage / 2), 10);
		
	};

	this.objectFuncs.gasVentUpdateTurn = function () {
		if (this.currentTurn <= 0) {
			let cloud = gs.createCloud(this.tileIndex, 'PoisonGas', gs.getTrapDamage('PoisonGas'), 10);
			cloud.firstTurn = false;
			this.currentTurn = 20;
		} else {
			this.currentTurn -= 1;
		}
	};
	
	this.objectFuncs.flamingCloudVentUpdateTurn = function () {
		if (this.currentTurn <= 0) {
			let cloud = gs.createCloud(this.tileIndex, 'SpreadingFlamingCloud', gs.getTrapDamage('PoisonGas'), 10);
			cloud.firstTurn = false;
			this.currentTurn = 20;
		} else {
			this.currentTurn -= 1;
		}
	};
	
	this.objectFuncs.freezingCloudVentUpdateTurn = function () {
		if (this.currentTurn <= 0) {
			let cloud = gs.createCloud(this.tileIndex, 'SpreadingFreezingCloud', gs.getTrapDamage('PoisonGas'), 10);
			cloud.firstTurn = false;
			this.currentTurn = 20;
		} else {
			this.currentTurn -= 1;
		}
	};
	
	this.objectFuncs.steamVentUpdateTurn = function () {
		if (this.currentTurn <= 0) {
			// Steam:
			let cloud = gs.createCloud(this.tileIndex, 'Steam', 0, 10);
			// Need to check if it was actually created in case a cloud was already on the tile:
			if (cloud) {
				cloud.firstTurn = false;
			}
			
			this.currentTurn = 20;
		} 
		else {
			this.currentTurn -= 1;
		}
	};
    
    this.objectFuncs.activateGasVent = function () {
        gs.createCloud(this.tileIndex, 'PoisonGas', gs.getTrapDamage('PoisonGas'), 15);   
    };
	
	this.objectFuncs.pitTrapActivate = function (character) {
		if (character === gs.pc && !gs.pc.isFlying) {
			gs.destroyObject(this);
			
			
			let pullNPCList = gs.getPullAllyList();
			
			// Descend Level:
			gs.descendLevel();
			
			// Use Portals:
			let usePortals = true;
			if (gs.zoneLevel === 5 && util.inArray(gs.zoneName, ['TheCrypt', 'TheIronForge', 'TheArcaneTower', 'TheSewers', 'TheCore', 'TheIceCaves'])) {
				usePortals = false;
			}
			
			// Place player at random location with a clear path to stairs:
			gs.pc.randomTeleport(gs.getUpStairsTileIndex(), usePortals);
			gs.playSound(gs.sounds.pitTrap, gs.pc.tileIndex);
			gs.pc.popUpText('Pit Trap!');
			gs.createParticlePoof(gs.pc.tileIndex, 'WHITE');
			
			gs.placePulledNPCs(pullNPCList);
			
			gs.pc.stopExploring();
			
			gs.onEnterNewLevel();
		}
	};
	
	this.objectFuncs.teleportTrapActivate = function (character) {
		// Only activate if there are still enemies on the level
		if (gs.characterList.filter(char => char.faction === FACTION.HOSTILE).length === 0) {
			return;
		}
		
		if (character === gs.pc) {
			// Destroy Trap:
			gs.destroyObject(this);
			
			// Text:
			gs.pc.popUpText('Teleport Trap!');
			
			// Sound:
			gs.playSound(gs.sounds.teleport, gs.pc.tileIndex);
			
			// Clear Agro:
			gs.pc.clearAgro();
			
			// Stop Exploring:
			gs.pc.stopExploring();
			
			// Anim Effect:
			gs.createSummonEffect(this.tileIndex, function () {
				// Specified Destination:
				if (this.toTileIndexList[0]) {
					gs.pc.teleportTo(this.toTileIndexList[0]);
				}
				// Random Teleport:
				else {
					gs.pc.randomTeleport();
				}
				
				// At Dest:
				gs.createSummonEffect(character.tileIndex);
			}, this, 8);
		}
	};
	
	this.objectFuncs.portalActivate = function (character) {
		var pos;
		
		if (character === gs.pc) {
			// Sound:
			gs.playSound(gs.sounds.teleport, character.tileIndex);
			
			// Particles at source:
			gs.createParticlePoof(character.tileIndex, 'PURPLE');
			
			// Teleport:
			gs.pc.teleportTo(gs.getNearestPassableSafeIndex(this.toTileIndexList[0]));
			
			// Yendor Boss:
			if (gs.zoneName === 'TheVaultOfYendor' && gs.zoneLevel === 5) {
				levelController.yendorBossTeleport();
			}
			
			// Particles at destination:
			gs.createParticlePoof(character.tileIndex, 'PURPLE');
			pos = util.toPosition(character.tileIndex);
			gs.createLightCircle({x: pos.x, y: pos.y + 10}, '#ff00ff', 120, 50, '88');
			
			// Pull all allies to new position:
			gs.getAllAllies().forEach(function (char) {
				let tileIndex = gs.getNearestPassableSafeIndex(gs.pc.tileIndex);
				
				if (tileIndex) {
					char.body.snapToTileIndex(tileIndex);
				}
		
			}, this);
		}
	};
	
	this.objectFuncs.useAltar = function (character) {
		gs.currentAltar = this;
		gs.openAltarMenu();
		
	};
	
	this.objectFuncs.campFireUpdateTurn = function () {
		if (util.distance(this.tileIndex, gs.pc.tileIndex) < 2 && gs.pc.coldLevel > 0) {
			gs.pc.coldLevel -= 1;
		}
	};
	
	this.objectFuncs.useSwitch = function () {	
		if (!this.isFull) {
			return;
		}
		
		this.toTileIndexList.forEach(function (toTileIndex) {
			// Opening a Door:
			if (gs.getObj(toTileIndex) && !gs.getObj(toTileIndex).isOpen) {
				gs.getObj(toTileIndex).openDoor();
			}
			
			// Triggering a drop wall:
			levelController.sendSignal(toTileIndex);
		}, this);
	
		
		this.setIsFull(false);
		gs.playSound(gs.sounds.door);		
	};

};