/*global gs, util*/
/*global LevelGeneratorBase, CrystalChestGenerator, LevelGeneratorUtils, AreaGeneratorVault*/
/*global NUM_TILES_X, NUM_TILES_Y, FEATURE_TYPE*/
'use strict';

// TEMPLATE_BASE:
// ************************************************************************************************
let LevelGeneratorTemplate = Object.create(LevelGeneratorBase);

// PLACE_TEMPLATE_VAULT:
// ************************************************************************************************
LevelGeneratorTemplate.placeTemplateVault = function (tileIndex, vaultSet, reflect = false) {	
	let vaultType = util.randElem(gs.getVaultTypeList(vaultSet));
	
	let area = AreaGeneratorVault.generate(tileIndex, vaultType, 0, reflect);
	
	return area;
};

// TEMPLATE_TEMPLE:
// ************************************************************************************************
let LevelGeneratorTemple = Object.create(LevelGeneratorTemplate);
LevelGeneratorTemple.init = function () {
	this.name = 'LevelGeneratorTemple';
	
	this.vaultSets = {
		top: 	'TheDarkTemple - Temple-Templates-Top',
		middle: 'TheDarkTemple - Temple-Templates-Middle',
		bottom: 'TheDarkTemple - Temple-Templates-Bottom',
	};
};
LevelGeneratorTemple.init();

// GENERATE:
// ************************************************************************************************
LevelGeneratorTemple.generate = function () {
		
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	// Vaults:
	this.placeTemplateVault({x: 0, y: 0}, this.vaultSets.top);
	this.placeTemplateVault({x: 0, y: 10}, this.vaultSets.middle);
	this.placeTemplateVault({x: 0, y: 20}, this.vaultSets.middle);
	this.placeTemplateVault({x: 0, y: 30}, this.vaultSets.bottom);
	
	// Marking the boss as generated:
	let levelFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.BOSS);
	levelFeature.hasGenerated = true;
};

// TEMPLATE_LICH_KINGS_LAIR:
// ************************************************************************************************
let LevelGeneratorLichKingsLair = Object.create(LevelGeneratorTemplate);
LevelGeneratorLichKingsLair.init = function () {
	this.name = 'LevelGeneratorLichKing';
	
	this.vaultSetRoot = 'TheCrypt/TheLichKingsLairTemplates/';
	
	this.vaultSets = {
		top: [
			'LichKingTop01',
			'LichKingTop02',
			'LichKingTop03',
		],
		
		middle: [
			'LichKingMiddle01',
			'LichKingMiddle02',
			'LichKingMiddle03',
			'LichKingMiddle04',
			'LichKingMiddle05',
		],
		
		bottom: [
			'LichKingBottom01',
			'LichKingBottom02',
		],
		
		side: [
			'LichKingSide01',
			'LichKingSide02',
			'LichKingSide03',
			'LichKingSide04',
			'LichKingSide05',
			'LichKingSide06',
		]
	};
};
LevelGeneratorLichKingsLair.init();

// GENERATE:
// ************************************************************************************************
LevelGeneratorLichKingsLair.generate = function () {
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.CaveWall);
	
	// Place Template Vaults:
	let topArea = this.placeTemplateVault({x: 0, y: 0}, this.vaultSets.top);
	this.placeTemplateVault({x: 10, y: 10}, this.vaultSets.middle);
	this.placeTemplateVault({x: 0, y: 10}, this.vaultSets.side);
	this.placeTemplateVault({x: 29, y: 10}, this.vaultSets.side, true);
	this.placeTemplateVault({x: 0, y: 30}, this.vaultSets.bottom);
};



