/*global game, gs, Phaser, console, util, achievements*/
/*global DungeonGenerator*/
/*global LARGE_WHITE_FONT*/
/*jshint esversion: 6*/
'use strict';

// OPEN_TOME_OF_KNOWLEDGE_MENU:
// *****************************************************************************
gs.openTomeOfKnowledgeMenu = function (tomeOfKnowledge) {
	let dialog = [{}];

	dialog[0].text = 'This mystical tome contains knowledge of several talents. You can select a single talent to immediately learn.';
	dialog[0].responses = [];

	let learnTalent = function (talentName) {
		gs.pc.talents.addTalent(talentName);
		gs.pc.talents.learnTalent(talentName);
		gs.pc.popUpText(gs.capitalSplit(talentName));
		gs.playSound(gs.sounds.point);

		tomeOfKnowledge.setIsFull(false);
		gs.HUD.miniMap.refresh();
	};

	// Talents:
	tomeOfKnowledge.talentList.forEach(function (talentName) {
		let talentType = gs.talents[talentName];

		if (!gs.pc.talents.hasTalent(talentName)) {
			let canLearn = gs.pc.talents.hasMetRequirements(talentType.requirements[1]);
			let response;

			// Can Learn:
			if (canLearn) {
				response = {
					text: 'Learn ' + gs.capitalSplit(talentName),
					nextLine: 'exit',
					func: learnTalent.bind(this, talentName),
					desc: gs.getTalentDescription(talentName, true),
				};
			}
			// Cannot Learn:
			else {
				response = {
					text: 'Learn ' + gs.capitalSplit(talentName) + ' - Requires: ' + gs.getTalentReqStr(gs.talents[talentName].requirements[1]),
					font: 'PixelFont6-Red',
					nextLine: 0,
					desc: gs.getTalentDescription(talentName, true),
				};
			}

			dialog[0].responses.push(response);
		}
	}, this);
	
	// Talent Point:
	dialog[0].responses.push({
		text: '+1 Talent Point',
		nextLine: 'exit',
		func: function () {
			gs.pc.talentPoints += 1;
			gs.pc.popUpText('+1 Talent Point');
			gs.playSound(gs.sounds.point);

			tomeOfKnowledge.setIsFull(false);
			gs.HUD.miniMap.refresh();
		},
	});


	dialog[0].responses.push({text: '[exit]', nextLine: 'exit', keys: ['accept', 'escape']});

	gs.messageQueue.pushMessage(dialog);
};

// OPEN_CRYSTAL_CHEST_MENU:
// *****************************************************************************
gs.openCrystalChestMenu = function (crystalChest) {
	
	// OPEN_CHEST_FUNC:
	let openChestFunc = function () {	  
		// Sound:
		gs.playSound(gs.sounds.door, crystalChest.tileIndex);
		
		// Create Item:
		gs.createFloorItem(crystalChest.tileIndex, crystalChest.item);

		// Flag chest group as locked:
		let chestList = gs.objectList.filter(obj => obj.type.name === 'CrystalChest' && obj.groupId === crystalChest.groupId);
		chestList.forEach(function (chest) {
			chest.isLocked = true;
			gs.pc.removeDiscoveredZoneFeature('CrystalChest' + chest.item);
		}, this);

		// Remove item from chest:
		crystalChest.item = null;
		crystalChest.isOpen = true;
		crystalChest.sprite.frame = crystalChest.type.openFrame;

		// Update mini-map to show changes:
		gs.HUD.miniMap.refresh();
	};
	
	// Create dialog:
	let dialog = [{}];
	dialog[0].text = 'This chest contains a ' + crystalChest.item.type.niceName + '\n\n';
	dialog[0].text += 'Opening this chest will permanently seal nearby crystal chests.\n\n';
	dialog[0].responses = [];

	
	// Response #1:
	dialog[0].responses[0] = {
		text: 'Open chest.',
		nextLine: 'exit',
		func: openChestFunc,
		keys: ['accept'],
	};
	
	// Response #2:
	dialog[0].responses[1] = {
		text: 'Nevermind.', 
		nextLine: 'exit', 
		keys: ['escape']
	};
	

	gs.messageQueue.pushMessage(dialog);
};

// OPEN_GOTO_LEVEL_MENU:
// *****************************************************************************
gs.openGotoLevelMenu = function () {
	let dialog;
	
	// Setup Dialog:
	dialog = [{}];
	dialog[0].text = 'Goto which Zone?';
	dialog[0].responses = [];
	
	// Push all zones:
	let zoneList = DungeonGenerator.zoneList;
	zoneList = [zoneList, 'TestZone'].flat();
	
	zoneList.forEach(function (zoneName, i) {
		if (gs.pc.discoveredZoneList.find(e => e.zoneName === zoneName)) {
			dialog[0].responses.push({
				text: gs.capitalSplit(zoneName),
				nextLine: i + 1,
			});
		}
	}, this);
	
	// Exit:
	dialog[0].responses.push({
		text: '[Cancel]',
		nextLine: 'exit',
		keys: ['escape']
	});
	
	// Push all levels:
	zoneList.forEach(function (zoneName, i) {
		let zoneDialog = {};
		
		zoneDialog.text = 'Goto which Level?';
		zoneDialog.responses = [];
		
		for (let i = 1; i <= gs.zoneTypes[zoneName].numLevels; i += 1) {
			let zone = gs.pc.discoveredZoneList.find(e => e.zoneName === zoneName && e.zoneLevel === i);
			if (zone) {
				let niceZoneName = gs.niceZoneName(zoneName, i);
				
				let response = {
					text: niceZoneName,
					nextLine: 'exit',
					func: function () {
						gs.pc.gotoLevel(zoneName, i);
					},
					desc: {
						title: niceZoneName,
						text: ''
					}
				};
				
				// Zone Feature:
				if (zone.features.length > 0) {
					response.text += ' *';
					
					zone.features.forEach(function (feature) {
						response.desc.text += '*' + gs.capitalSplit(feature) + '\n';
					}, this);
				}
				
				zoneDialog.responses.push(response);
			}
		}
		
		// Exit:
		zoneDialog.responses.push({
			text: '[Cancel]',
			nextLine: 'exit',
			keys: ['escape']
		});
		
		dialog[i + 1] = zoneDialog;
	}, this);
	
	// Push Dialog:
	gs.messageQueue.pushMessage(dialog);
};

// OPEN_GOTO_STAIRS_MENU:
// *****************************************************************************
gs.openGotoStairsMenu = function (zoneLineList) {
	let dialog;
	
	// Make sure current zone always comes first in zoneLineList:
	
	if (zoneLineList.find(zoneLine => zoneLine.toZoneName === gs.zoneName)) {
		let sortedList = [];
		
		// Push current zone first:
		sortedList.push(zoneLineList.find(zoneLine => zoneLine.toZoneName === gs.zoneName));
		
		// All other zones:
		zoneLineList.forEach(function (zoneLine) {
			if (zoneLine.toZoneName !== gs.zoneName) {
				sortedList.push(zoneLine);
			}
		}, this);
		
		zoneLineList = sortedList;
	}
	
	// Setup Dialog:
	dialog = [{}];
	dialog[0].text = 'Which Stairs?';
	dialog[0].responses = [];

	for (let i = 0; i < zoneLineList.length; i += 1) {
		let response = {};
		
		response.text = gs.niceZoneName(zoneLineList[i].toZoneName, zoneLineList[i].toZoneLevel);
		response.nextLine = 'exit';
		response.func = gs.pc.gotoStairs.bind(gs.pc, zoneLineList[i].tileIndex);

		dialog[0].responses.push(response);
	}

	dialog[0].responses.push({text: '[cancel]', nextLine: 'exit', keys: ['escape']});

	// Push Dialog:
	gs.messageQueue.pushMessage(dialog);
};

// OPEN_DEATH_MENU:
// *****************************************************************************
gs.openDeathMenu = function () {	
	let deathText = 'Your level ' + gs.pc.level + ' ' + gs.capitalSplit(gs.pc.characterClass) + ' ' + gs.deathText + ' in ' + gs.capitalSplit(gs.zoneName) + '.';
	
	let respawnClicked = function () {
		gs.pc.poisonDamage = 0;
		gs.pc.isAlive = true;
		gs.pc.healHp(1000);
	};
	
	let replayClicked = function () {
		gs.playerClass = gs.pc.characterClass;
		gs.playerRace = gs.pc.race;
		gs.stateManager.clearStates();
		gs.destroyLevel();
		gs.startGame();
	};
	
	let mainMenuClicked = function () {
		gs.stateManager.clearStates();
		gs.destroyLevel();
		gs.startMainMenu();
	};
	
	let charClicked = function () {
		gs.stateManager.pushState('CharacterMenu');
	};
	
	let replayPrereq = function () {
		return !gs.isDailyChallenge;
	};
	
	// Setup Dialog:
	let dialog = [{}];
	dialog[0].text = deathText;
	dialog[0].responses = [
		{text: 'View Character', nextLine: 'none', func: charClicked},
		{text: 'Replay ' + gs.pc.race.name + ' ' + gs.capitalSplit(gs.pc.characterClass), func: replayClicked, nextLine: 'exit', prereq: replayPrereq},
		{text: 'Main Menu', nextLine: 'exit', func: mainMenuClicked}
	];
				  
	// DEBUG Respawn:
	if (gs.debugProperties.allowRespawn) {
		dialog[0].responses.push({text: 'Instant Respawn (Testing)', nextLine: 'exit', func: respawnClicked});
	}
	
	
	gs.messageQueue.pushMessage(dialog);
};

// OPEN_VICTORY_MENU:
// *****************************************************************************
gs.openVictoryMenu = function () {
	var dialog = [{}],
		okClicked,
		time,
		mins,
		charClicked,
		text;
	
	time = gs.gameTime();
	
	if (gs.achievements[gs.pc.characterClass] === 0 || time < gs.achievements[gs.pc.characterClass]) {
		gs.achievements[gs.pc.characterClass] = time;
	}
	
	gs.globalState = 'VICTORY_STATE';
	
	okClicked = function () {
		gs.stopAllMusic();
		util.writeFile('Achievements', JSON.stringify(gs.achievements));
		
		gs.stateManager.clearStates();
		gs.destroyLevel();
		gs.startMainMenu();
	};
	
	charClicked = function () {
		gs.stateManager.pushState('CharacterMenu');
	};
	
	text = 'successfully defeated The Wizard Yendor and retrieved the Goblet';

	dialog[0].text = 'Your level ' + gs.pc.level + ' ' + gs.capitalSplit(gs.pc.characterClass) + ' ' + text + ' in ' + this.timeToString(time) + '.';
	dialog[0].responses = [
		{text: 'View Character', nextLine: 'none', func: charClicked},
		{text: '[Done]', nextLine: 'exit', func: okClicked}
	];
	
	gs.createEXPEffect(gs.pc.tileIndex);
	
	
	
	gs.messageQueue.pushMessage(dialog);
};

// LIFE_SAVING_MENU:
// *****************************************************************************
gs.openLifeSavingMenu = function () {
	var dialog;
	
	gs.pc.inventory.removeItem(gs.pc.inventory.itemOfType(gs.itemTypes.RingOfLifeSaving));
		
	gs.pc.isAlive = true;
	gs.pc.healHp(gs.pc.maxHp);
	gs.pc.restoreMp(gs.pc.maxMp);
		
	// Force players turn:
	gs.pc.waitTime = 0;
	gs.activeCharacterIndex = 0;
	
	// Setup Dialog:
	dialog = [{}];
	dialog[0].text = 'You have been killed. Your Ring of Life Saving flashes brightly and dissolves, bringing you back to life.';
	dialog[0].responses = [
		{text: 'ok', nextLine: 'exit'}
	];
	
	gs.messageQueue.pushMessage(dialog);
};

// OPEN_ALTER_MENU:
// *****************************************************************************
gs.openAltarMenu = function () {
	var okClicked, dialog, religionName;
	
	religionName = gs.currentAltar.type.religion;
	
	okClicked = function () {
		gs.pc.setReligion(religionName);
		gs.playSound(gs.sounds.cure, gs.pc.tileIndex);
	};
	
	dialog = [{}];
	
	if (gs.pc.religion) {
		dialog[0].text = 'You pray at the altar of ' + gs.capitalSplit(religionName) + '. You are already worshipping a god!';
		dialog[0].responses = [{text: 'Ok', nextLine: 'exit', keys: ['accept', 'escape']}];
	}
	else {
		dialog[0].text = 'You pray at the altar of ' + gs.capitalSplit(religionName) + ". " + gs.religionTypes[religionName].desc + ' Would you like to join this religion?';
		dialog[0].responses = [
			{text: 'Yes', nextLine: 'exit', func: okClicked, keys: ['accept']},
			{text: 'No', nextLine: 'exit', keys: ['escape']}
		];
	}
	
	gs.messageQueue.pushMessage(dialog);
};

// OPEN_ATTRIBUTE_GAIN_MENU:
// *****************************************************************************
gs.openAttributeGainMenu = function (attributeList) {
	
	let gainFunc = function (attributeName) {
		gs.pc.gainAttribute(attributeName, 1);
		gs.pc.popUpText('+1 ' + attributeName);
		gs.pc.updateStats();
		gs.usingFountain = null;
		gs.playSound(gs.sounds.point);
	};
	
	let dialog = [{}];
	dialog[0].text = 'Select an attribute to increase.';
	dialog[0].responses = [];
	
	// Choice Resonses:
	attributeList.forEach(function (attributeName) {
		dialog[0].responses.push({
			text: function () {
				// Already at max:
				if (gs.pc[attributeName] === gs.pc.maxAttributes[attributeName]) {
					return attributeName + ': ' + gs.pc[attributeName] + ' } ' + gs.pc.maxAttributes[attributeName] + ' [Max]';
				}
				// Sub max:
				else {
					return attributeName + ': ' + gs.pc[attributeName] + ' } ' + (gs.pc[attributeName] + 1);
				}
				 
			},
			nextLine: 'exit', 
			func: gainFunc.bind(this, attributeName),
			desc: {title: attributeName + ':', text: gs.pc.getAttributeDesc(attributeName)}
		});
	}, this);
	
	// View Character Response:
	dialog[0].responses.push({
		text: '[View Character]',
		nextLine: 0,
		func: () => gs.stateManager.pushState('CharacterMenu')
	});
	
	gs.messageQueue.pushMessage(dialog);
};