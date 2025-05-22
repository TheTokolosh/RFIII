/*global game, gs, Phaser, console, util, levelController, DungeonGenerator, Item*/
/*global SKILL_TRAINER_COST, TALENT_TRAINER_COST, ENCHANTER_COST, PRIEST_COST, ATTRIBUTE_SHRINE_COST, FEATURE_TYPE*/
/*jslint white: true */
'use strict';

let SPECIAL_TEXT = {
Taldorak:
`Journal Entry - Date... Unknown
After many hard fought battles, I, Taldorak the Bloodthirsty, have been defeated by the oldest enemy known to ogrekind... Hunger.

As I rest my back against the cold stone, I am comforted by the knowledge that the tribe shall not rest until I am avenged and the goblet is ours!
`,
Hounds: 
`Here's the body of one of our most recent intruders. I'm working on a new theory that all these damned adventurers are sprouted from the same cursed tree or shrub.

Give the hounds a smell and we'll see if they can sniff out the next one that shows up.

 - Yendor the Theorist`,
	
ArcherTraining:
`Daily target practice is now mandatory for all archers.

According to our work place incident reports, nearly 20% of all injuries are caused by friendly fire!

 - The Glorious Wizard Yendor`,
	
DropWallTrio:
`Another damned adventurer has shown up! He's likely after my goblet just like the rest of those fools.

So here's the plan. I'll seal the three of you up in this wall and when that bozo walks by BAM! you pop out and get him!

 - Yendor The Tactician`,
	
DropWallDead:
`I don't care how long it takes! You three are going to stay in here until that damn thief shows up!

 - Yendor The Unwavering`,
	
DropWallOgre:
`I'm tired of you slackers deserting your post for 'food' and 'rest'... Pathetic!!!

Now heres some food and a magazine, I better not hear any more complaints!

 - Yendor The Generous`,
	
Cafeteria:
`A reminder that the cafeteria is for employees only. This is a subterranian doom fortress not a soup kitchen!
 
 - Yendor the Bountiful`,
	
PillowFort:
`The Barracks is for sleeping only!

Your little pillow fort made the front cover of Evil Lairs Weekly! This sort of behaviour will not be tolerated!

 - Yendor the Severe`,
	
OgreCafeteria:
`A reminder that ogres are limited to one serving only! You lard buckets are costing me a fortune!

 - The Magnificent Wizard Yendor`,
	
GoblinBar:
`All minions are reminded that drinking on the job is strictly forbidden!

 - The Mighty Wizard Yendor`,
	
OrcBar:
`I better not find any of you slackers in here while that damned adventurer is still loose!

 - Yendor the Unforgiving`,
	
RatStorage:
`Clean up this damn storeroom you fools! The health inspectors are coming tomorrow!

 - Yendor the Great`,
	
WizardOfTheMonth:
`----------- WIZARD OF THE MONTH -----------
This months winner is, once again, Yendor The Majestic!

"Its always such a humbling experience to have your greatness acknowledged by others."`,

SlimePit:
`How many times do I have to tell you fools to keep the damn slimes out of the water!

The health inspectors are coming in less than a week so you better get this mess cleaned up!

 - Yendor the Glorious`,
	
WantedPoster: function () {
	let className = gs.capitalSplit(gs.pc.characterClass);
	let str = '';
	
	str += '-------------- WANTED --------------\n';
	str += 'One pesky pathetic ' + className + ' name unknown\n\n';
	str += 'Crime:       trespassing and attempted goblet theft\n';
	str += 'Last seen: killing your colleagues upstairs\n';
	str += 'Reward:    You get to keep your jobs and your heads!';
	
	return str;
},
	
GuardRoomBoss: function () {
	let bossName = gs.npcTypes[DungeonGenerator.getLevelFeatures('TheUpperDungeon', 4).find(e => e.featureType === FEATURE_TYPE.BOSS).bossName].niceName;
	let str = '';
	str += "I want you all on high alert! There's another one of those pesky adventurers running about.\n\n";
	str += "This ones already killed " + bossName + "! I want him stopped!\n\n";
	str += " - Yendor The Vengeful";
	
	return str;
},
	
Motivation1: "A busy worker is a happy worker.\n\n - The Wizard Yendor",
Motivation2: "An unpaid worker is a better worker.\n\n - The Wizard Yendor",
Motivation3: "Live to work, don't work to live.\n\n - The Wizard Yendor",
Motivation4: "Your job is your life.\n\n - The Wizard Yendor",
Motivation5: "Perspiration is better than aspiration.\n\n - The Wizard Yendor",
Motivation6: "Quality means doing it right when no one is watching and I'm always watching, so do it right!\n\n - The Wizard Yendor",
Motivation7: "Today is another chance to get better. We are expecting a critical shortage of chances in the future so act accordingly.\n\n - The Wizard Yendor",
Motivation8: "Your future depends on what you do today. That includes your future survival...\n\n - Yendor the Merciful",	
};

let THE_UPPER_DUNGEON_YENDOR_TEXT = [
// TEXT-1:
`Another damned adventurer come to steal my goblet!

I didn't become immortal just to fend off you cursed thieves for all eternity!

No matter. My minions will deal with you like the last dozen would be heros we've had this month!`,	
	
// TEXT-2:
`By the gods, not another one!

Whatever degree mill is churning out you plucky hero types needs to add the definition of 'Immortal' to the curriculum.

I could give you a demonstration myself but my minions need some practice. Its been 3 whole days since they killed the last intruder.`,

// TEXT-3:
`How many of you fools do we need to kill before you get the message: The goblet is mine!

My minions are still cleaning up the mess we made with the last dozen would be heros.

At least my disposal guy is good. Every 9 bodies and the 10th one is free!`,
	
// TEXT-4:
`Whats this? You must be the sixth intruder we've had just this week!

If you blasted thieves want immortality so badly why don't you make your own goblet and leave me to scheme and plot in peace!

No matter. This is exactly the sort of sort of problem I underpay my minions to deal with.`,	
];

let THE_ORC_FORTRESS_YENDOR_TEXT = [
`It seems the wimps upstairs have failed to put a stop to your futile little quest. This will certainly be addressed in the next performance review!

I think you'll find my mighty orc legions a bit more challenging. The last few who made it this far certainly did!`,
];

let THE_DARK_TEMPLE_YENDOR_TEXT = [
`You seem to have evaded the chumps upstairs but I think you'll find the inhabitants of this dark temple to be a bit more of a challenge!

Their magic may pale in comparison to my own infinite powers, but that didn't stop them from making short work of the last fools who made it this far.`,
];

let THE_VAULT_OF_YENDOR_TEXT = [
`Hmmm, it seems you've made it further than they usually do but this is where your silly little quest ends.

I'll admit I'm rather hoping you'll make it through my diabolical labyrinth of doom. It's not every day I get to demonstrate the full extent of my immortal powers!`	
];

// CREATE_UNIQUE_NPC_TYPES:
// ************************************************************************************************
gs.createUniqueNPCTypes = function () {
	this.dialog = {};
	this.dialogInit = {};
	this.npcInventories = {};
	this.dialogFuncs = {};
	
	// THE_UPPER_DUNGEON_YENDOR:
	this.dialog.TheUpperDungeonYendor = [
		{title: 'The Wizard Yendor',
		 text: util.randElem(THE_UPPER_DUNGEON_YENDOR_TEXT),
		 responses: [{text: '[Done]', nextLine: 'exit', keys: ['accept', 'escape']}]
		}
	];
	
	// THE_ORC_FORTRESS_YENDOR:
	this.dialog.TheOrcFortressYendor = [
		{title: 'The Wizard Yendor',
		 text: util.randElem(THE_ORC_FORTRESS_YENDOR_TEXT),
		 responses: [{text: '[Done]', nextLine: 'exit', keys: ['accept', 'escape']}]
		}
	];
	
	// THE_DARK_TEMPLE_YENDOR:
	this.dialog.TheDarkTempleYendor = [
		{title: 'The Wizard Yendor',
		 text: util.randElem(THE_DARK_TEMPLE_YENDOR_TEXT),
		 responses: [{text: '[Done]', nextLine: 'exit', keys: ['accept', 'escape']}]
		}
	];
	
	// THE_VAULT_OF_YENDOR:
	this.dialog.TheVaultOfYendor = [
		{title: 'The Wizard Yendor',
		 text: util.randElem(THE_VAULT_OF_YENDOR_TEXT),
		 responses: [{text: '[Done]', nextLine: 'exit', keys: ['accept', 'escape']}]
		}
	];
	
	// YENDOR_TALDORAK:
	this.dialog.YendorTaldorak = [
		{title: 'The Wizard Yendor',
		 text: "Do you see what kind of zealots I'm dealing with here?! Can't a wizard enjoy his immortality in peace!",
		 responses: [{text: '[Done]', nextLine: 'exit', keys: ['accept', 'escape']}]
		}
	];
	
	// Yendor Greeting Dialog:
	this.popUpYendorGreetingDialog = function (yendorChar) {
		let textStr;
		
		// Get Text String:
		if (yendorChar.yendorVersion === 1) {
			textStr = "Well well, Look who finally showed up! You seem to have gotten the best of my minions, I admit, our recruiting standards have been slipping lately.\n\nI suppose if you want something done right you have to do it yourself!";
		}
		else if (yendorChar.yendorVersion === 2) {
			textStr = "Didn't you hear? Through the powers of my goblet I have become a mighty immortal!\n\nDeath only makes me stronger!";
		}
		else if (yendorChar.yendorVersion === 3) {
			textStr = "You don't seem to understand. As long as I possess the goblet you cannot hope to defeat me!";
		}
		
		// Setup Dialog:
		let dialog = [{
			text: textStr,
			responses: [{text: 'Ok', nextLine: 'exit', keys: ['accept', 'escape']}]
		}];
	
		gs.messageQueue.pushMessage(dialog);
	};
	
	// Yendor Death Dialog:
	this.popUpYendorDeathDialog = function (yendorChar) {
		let dialog = [{}];
		
		// Get Text String:
		if (yendorChar.yendorVersion === 1) {
			dialog[0].text = "Bwahaha you're going to have to try harder than that!";
			dialog[0].responses = [{text: "ok", nextLine: 'exit', keys: ['accept', 'escape']}];
		}
		else if (yendorChar.yendorVersion === 2) {
			dialog[0].text = "I admit you have some talent but your quest is futile!";
			dialog[0].responses = [{text: "ok", nextLine: 'exit', keys: ['accept', 'escape']}];
		}
		else if (yendorChar.yendorVersion === 3 && !gs.pc.inventory.hasItemType(gs.itemTypes.GobletOfYendor)) {
			dialog[0].text = "You don't seem to understand. As long as I possess the goblet you cannot hope to defeat me!";
			dialog[0].responses = [{text: "ok", nextLine: 'exit', keys: ['accept', 'escape']}];
		}
		else if (yendorChar.yendorVersion === 3) {
			dialog[0].text = "How can this be? I have the goblet... I'm a mighty immortal...";
			dialog[0].responses = [{
				text: "'had' the goblet",
				nextLine: 'exit',
				keys: ['accept', 'escape'],
				func: function () {
					gs.playSound(gs.sounds.levelUp, gs.pc.tileIndex);
					gs.openVictoryMenu();
				}
			}];
		}
		
	
	
		gs.messageQueue.pushMessage(dialog);
	};
	
	// Pick Up Goblet Dialog
	this.popUpGobletDialog = function () {
		let textStr = "Hey! Get your grubby hands off that! As if a fool like you has any hope of wielding its powers!";
		
		
		// Setup Dialog:
		let dialog = [{
			text: textStr,
			responses: [{text: 'Ok', nextLine: 'exit', keys: ['accept', 'escape']}]
		}];
	
		gs.messageQueue.pushMessage(dialog);
	};


	// DEFAULT:
	this.dialog.Default = [
		{text: 'No Dialog',
		 responses: [{text: '[Done]', nextLine: 'exit'}]
		}
	];
	
	// SHRINE_OF_STRENGTH:
	this.dialog.ShrineOfStrength = [
		{text: function () {
			return "Make an offering of " + ATTRIBUTE_SHRINE_COST + " gold at the shrine of strength?\n\nYou have " + gs.pc.inventory.gold + ' gold.';
		},
		 responses: [
			 {text: 'Ok',
			  prereq: function () {
				  let baseStrength = gs.pc.baseAttributes.strength + gs.pc.race.attributes.strength + gs.classAttributes[gs.pc.characterClass].strength;

				  return gs.pc.inventory.gold >= ATTRIBUTE_SHRINE_COST && baseStrength < gs.pc.maxAttributes.strength;
			  },
			  func: function () {
				  gs.pc.gainAttribute('strength');
				  
				  
				  gs.pc.inventory.gold -= ATTRIBUTE_SHRINE_COST;
				  gs.playSound(gs.sounds.point);
				  gs.pc.popUpText('+1 Strength');
				  gs.createFireEffect(gs.pc.tileIndex);
			  },
			  nextLine: 'exit',
			  keys: ['accept']
			 },
			 {text: 'No thanks', 
			  nextLine: 'exit',
			  keys: ['escape']
			 }
		 ]
		}
	];
	
	// SHRINE_OF_INTELLIGENCE:
	this.dialog.ShrineOfIntelligence = [
		{text: function () {
			return "Make an offering of " + ATTRIBUTE_SHRINE_COST + " gold at the shrine of intelligence?\n\nYou have " + gs.pc.inventory.gold + ' gold.';
		},
		 responses: [
			 {text: 'Ok',
			  prereq: function () {
				  let baseIntelligence = gs.pc.baseAttributes.intelligence + gs.pc.race.attributes.intelligence + gs.classAttributes[gs.pc.characterClass].intelligence;

				  return gs.pc.inventory.gold >= ATTRIBUTE_SHRINE_COST && baseIntelligence < gs.pc.maxAttributes.intelligence;
			  },
			  func: function () {
				  gs.pc.gainAttribute('intelligence');
				  
				  gs.pc.inventory.gold -= ATTRIBUTE_SHRINE_COST;
				  gs.playSound(gs.sounds.point);
				  gs.pc.popUpText('+1 Intelligence');
				  gs.createManaEffect(gs.pc.tileIndex);
			  },
			  nextLine: 'exit',
			  keys: ['accept']
			 },
			 {text: 'No thanks', 
			  nextLine: 'exit',
			  keys: ['escape']
			 }
		 ]
		}
	];
	
	// SHRINE_OF_DEXTERITY:
	this.dialog.ShrineOfDexterity = [
		{text: function () {
			return "Make an offering of " + ATTRIBUTE_SHRINE_COST + " gold at the shrine of dexterity?\n\nYou have " + gs.pc.inventory.gold + ' gold.';
		},
		 responses: [
			 {text: 'Ok',
			  prereq: function () {
				  let baseDexterity = gs.pc.baseAttributes.dexterity + gs.pc.race.attributes.dexterity + gs.classAttributes[gs.pc.characterClass].dexterity;

				  return gs.pc.inventory.gold >= ATTRIBUTE_SHRINE_COST && baseDexterity < gs.pc.maxAttributes.dexterity;
			  },
			  func: function () {
				  gs.pc.gainAttribute('dexterity');
				  
				  gs.pc.inventory.gold -= ATTRIBUTE_SHRINE_COST;
				  gs.playSound(gs.sounds.point);
				  gs.pc.popUpText('+1 Dexterity');
				  gs.createEXPEffect(gs.pc.tileIndex);
			  },
			  nextLine: 'exit',
			  keys: ['accept']
			 },
			 {text: 'No thanks', 
			  nextLine: 'exit',
			  keys: ['escape']
			 }
		 ]
		}
	];

	// MERCHANT:
	this.dialog.Merchant = [
		{text: "Greetings brave adventurer and welcome to my humble shop! Can I interest you in some items?",
		 responses: [
			 {text: "[View Items]", nextLine: 'barter', keys: ['accept']},
			 {text: "[Done]", nextLine: 'exit', keys: ['escape']}
		 ],
		 func: function () {
			 let merchant = gs.characterList.find(char => char.name === 'Merchant');
			 if (!merchant.hasStockedItems) {
				 
				 // We use the level specific seed to guarantee item consistancy between seeds.
				 util.seedRand([gs.seed, gs.zoneName, gs.zoneLevel]);
				 
				 gs.stockMerchant();
				 gs.sortMerchant();
				 merchant.hasStockedItems = true;
			 }
		 }
		},
	];
	
	// THE_LIBRARIAN:
	this.dialog.TheLibrarian = [
		{text: "Greetings brave adventurer and welcome to my humble library!",
		 responses: [
			 {text: "[View Talents]", nextLine: 'library', keys: ['accept']},
			 {text: "[Done]", nextLine: 'exit', keys: ['escape']}
		 ]
		}
	];
	

	
	// TALENT_TRAINER:
	this.dialog.TalentTrainer = [
		{text: function () {
			return "Hello brave adventurer. I can provide you with additional talent points for " + TALENT_TRAINER_COST + " gold each.\n\nYou have " + gs.pc.inventory.gold + ' gold.';
		},
		 
		 responses: [
			 {text: 'Ok',
			  prereq: function () {
				  return gs.pc.inventory.gold >= TALENT_TRAINER_COST;
			  },
			  func: function () {
				  gs.pc.talentPoints += 1;
				  gs.pc.inventory.gold -= TALENT_TRAINER_COST;
				  gs.playSound(gs.sounds.point);
				  gs.pc.popUpText('+1 Talent Point');
				  gs.createEXPEffect(gs.pc.tileIndex);
				  
			  },
			  nextLine: 'exit',
			  keys: ['accept']
			 },
			 
			 {text: 'No thanks', nextLine: 'exit', keys: ['escape']}
		 ]
		}
	];
	
	// ENCHANTER:
	this.dialog.Enchanter = [
		{text: function () {
			return "Hello brave adventurer. I can provide you with Scrolls of Enchantment points for " + ENCHANTER_COST + " gold each.\n\nYou have " + gs.pc.inventory.gold + ' gold.';
		},
		 
		 responses: [
			 {text: 'Ok',
			  prereq: function () {
				  return gs.pc.inventory.gold >= ENCHANTER_COST;
			  },
			  func: function () {
				  gs.pc.inventory.addItem(Item.createItem('ScrollOfEnchantment'));
				  gs.pc.inventory.gold -= ENCHANTER_COST;
				  gs.playSound(gs.sounds.point);
				  
			  },
			  nextLine: 'exit',
			  keys: ['accept']
			 },
			 
			 {text: 'No thanks', nextLine: 'exit', keys: ['escape']}
		 ]
		}
	];
	
	// PRIEST:
	this.dialog.Priest = [
		{text: function () {
			return "Hello brave adventurer. For a small donation of " + PRIEST_COST + " gold I can fully restore your health and mana and provide you with a powerful blessing.\n\nYou have " + gs.pc.inventory.gold + ' gold.';
		},
		 
		 responses: [
			 {text: 'Ok',
			  prereq: function () {return gs.pc.inventory.gold >= PRIEST_COST;},
			  func: function () {
				  gs.pc.cure();
				  gs.pc.mentalCure();
				  gs.pc.healHp(gs.pc.maxHp);
				  gs.pc.restoreMp(gs.pc.maxMp);
				  gs.pc.statusEffects.add('Bless');
				  gs.pc.inventory.gold -= PRIEST_COST;
				  
				  gs.playSound(gs.sounds.cure, this.tileIndex);
				  gs.createHealingEffect(gs.pc.tileIndex);
			  },
			  nextLine: 'exit',
			  keys: ['accept']},
			 {text: 'No thanks', nextLine: 'exit', keys: ['escape']}
		 ]
		}
	];
    
	// GUARDED_DOOR:
	this.dialog.GlyphDoor = [
		{text: 'This door is covered in warning glyphs. Really open it?',
		 responses: [
			 {text: 'Yes', nextLine: 'exit', func: function () {gs.openingDoor.openDoor(); }, keys: ['accept']},
			 {text: 'No', nextLine: 'exit', keys: ['escape']}
		 ]
		}
	];
	

	
	// LOCKED_CRYSTAL_CHEST:
	this.dialog.LockedCrystalChest = [
		{text: 'This chest has been permanently sealed.',
		 responses: [
			 {text: 'Ok.', nextLine: 'exit', keys: ['accept', 'escape']}
		 ]
		}
	];
	
	// KEY_GATE:
	this.dialog.KeyGate = [
		{text: function () {
			return 'This gate is locked, would you like to use a key to open it?\n\nYou have ' + gs.pc.inventory.countItemOfType(gs.itemTypes.Key) + ' keys.';
		},
		 responses: [
			 {text: 'Yes', nextLine: 'exit',
			  prereq: function () {
				  return gs.pc.inventory.countItemOfType(gs.itemTypes.Key) > 0;
			  },
			  func: function () {
				  gs.pc.inventory.removeItemType(gs.itemTypes.Key);
				  gs.openingDoor.openDoor();
			  }, 
			  keys: ['accept']
			 },
			 
			 {text: 'No', nextLine: 'exit', keys: ['escape']}
		 ]
		}
	];
	
	// SEALED_TIMED_GATE:
	this.dialog.SealedTimedGate = [
		{text: 'The timer has run out and this gate is now permanently sealed.',
		 responses: [{text: 'Ok', nextLine: 'exit', keys: ['accept', 'escape']}]
		}
	];
	
	// SWITCH_GATE:
	this.dialog.SwitchGate = [
		{text: 'This gate is sealed shut. There must be a switch somewhere on the level that opens it.',
		 responses: [{text: 'Ok', nextLine: 'exit', keys: ['accept', 'escape']}]
		}
	];
	
	// BOSS_GATE:
	this.dialog.BossGate = [
		{text: 'This gate is sealed shut. Defeating the boss of this level will unlock it.',
		 responses: [{text: 'Ok', nextLine: 'exit', keys: ['accept', 'escape']}]
		}
	];
	
	// TIMED_TREASURE_ROOM:
	this.dialog.TimedTreasureRoom = [
		{text: 'You hear the sound of a gate slowly grinding shut somewhere on this level.',
		 responses: [{text: 'Ok', nextLine: 'exit', keys: ['accept', 'escape']}]
		}
	];
	
	// BRANCH_HELP:
	this.dialog.BranchHelp = [
		{text: 'You have entered an optional side branch of the dungeon. You can return to the previous level at any time in order to continue your quest.',
		 responses: [{text: 'Ok', nextLine: 'exit', keys: ['accept', 'escape']}]
		}
	];
	
	// THE_LICH_KINGS_LAIR:
	this.dialog.TheLichKingsLair = [
		{text: 'A strange, ghostly chanting emanates from somewhere up ahead. Something is weakening the barrier between the world of the living and the world of the dead.',
		 responses: [{text: 'Ok', nextLine: 'exit', keys: ['accept', 'escape']}]
		}
	];
	
	// DEMONOLOGIST:
	this.dialog.Demonologist = [
		{text: 'A wave of noxious, chaotic energy washes over you while an eerie, arcane chant echos from somewhere up ahead.',
		 responses: [{text: 'Ok', nextLine: 'exit', keys: ['accept', 'escape']}]
		}
	];
};