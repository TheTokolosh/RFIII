/*global game, util, gs, console*/
/*global LevelGeneratorBase, LevelGeneratorUtils, DungeonGenerator*/
/*global AreaGeneratorVault*/ 
/*global VAULT_CONTENT, VAULT_PLACEMENT, FEATURE_TYPE, YENDOR_MAX_HP*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

let LevelGeneratorBossPortals = Object.create(LevelGeneratorBase);
LevelGeneratorBossPortals.name = 'LevelGeneratorBossPortals';

// GENERATE:
// ************************************************************************************************
LevelGeneratorBossPortals.generate = function () {
	let vaultTypeList,
		obj,
		npc,
		tileIndexList,
		tileIndex,
		portalTileIndex,
		toTileIndex;
	
	// Initial Fill:
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	// Entrance Vault:
	vaultTypeList = gs.vaultTypeList.filter(vaultType => vaultType.vaultSet === 'TheVaultOfYendor-TeleportBossEntrance');
	let entranceArea = AreaGeneratorVault.generate({x: 15, y: 17}, util.randElem(vaultTypeList));
	
	// Select Vaults:
	vaultTypeList = this.getVaultTypeList();
	
	// First Vault:
	tileIndex = {
		x: Math.floor((17 - vaultTypeList[0].width) / 2),
		y: 25 + Math.floor((15 - vaultTypeList[0].height) / 2)
	};
	let area01 = AreaGeneratorVault.generate(tileIndex, vaultTypeList[0]);
	
	// Second Vault:
	tileIndex = {
		x: 22 + Math.floor((17 - vaultTypeList[1].width) / 2),
		y: 25 + Math.floor((15 - vaultTypeList[1].height) / 2)
	};
	let area02 = AreaGeneratorVault.generate(tileIndex, vaultTypeList[1]);
	
	// Third Vault:
	tileIndex = {
		x: 19 - Math.floor(vaultTypeList[2].width / 2),
		y: 0
	};
	let area03 = AreaGeneratorVault.generate(tileIndex, vaultTypeList[2]);
	
	// Connecting Entrance Portal:
	obj = gs.objectList.find(obj => obj.type.name === 'Portal');
	obj.toTileIndexList = [{x: area01.portalHookTileIndexList[0].x, y: area01.portalHookTileIndexList[0].y}];
	
	// First Portal:
	portalTileIndex = gs.getIndexListInArea(area01).find(index => gs.getTile(index).tagID === 1);
	toTileIndex = {x: area02.portalHookTileIndexList[0].x, y: area02.portalHookTileIndexList[0].y};
	gs.miscLevelData.push({
		name: 'Yendor01-Portal',
		portalTileIndex: {x: portalTileIndex.x, y: portalTileIndex.y},
		toTileIndex: {x: toTileIndex.x, y: toTileIndex.y}
	});
	
	// Second Portal:
	portalTileIndex = gs.getIndexListInArea(area02).find(index => gs.getTile(index).tagID === 1);
	toTileIndex = {x: area03.portalHookTileIndexList[0].x, y: area03.portalHookTileIndexList[0].y};
	gs.miscLevelData.push({
		name: 'Yendor02-Portal',
		portalTileIndex: {x: portalTileIndex.x, y: portalTileIndex.y},
		toTileIndex: {x: toTileIndex.x, y: toTileIndex.y}
	});
	
	/*
	// Verify Portal Hooks:
	if (!area01.portalHookTileIndexList) {
		console.log(area01.vaultType.name + ' is missing a portal hook!');
	}
	else if (!area02.portalHookTileIndexList) {
		console.log(area02.vaultType.name + ' is missing a portal hook!');
	}
	else if (!area03.portalHookTileIndexList) {
		console.log(area03.vaultType.name + ' is missing a portal hook!');
	}
	
	// Connecting Entrance Portal:
	obj = gs.objectList.find(obj => obj.type.name === 'Portal');
	obj.toTileIndexList = [{x: area01.portalHookTileIndexList[0].x, y: area01.portalHookTileIndexList[0].y}];
	
	// Creating Death Portal area01 => area02:
	obj = gs.createObject({x: 0, y: 0}, 'Portal');
	obj.toTileIndexList = [{x: area02.portalHookTileIndexList[0].x, y: area02.portalHookTileIndexList[0].y}];
	
	// Creating Death Portal area02 => area03:
	obj = gs.createObject({x: 1, y: 0}, 'Portal');
	obj.toTileIndexList = [{x: area03.portalHookTileIndexList[0].x, y: area03.portalHookTileIndexList[0].y}];
	*/
	
	// Setting Yendor Version01:
	tileIndexList = gs.getIndexListInArea(area01);
	tileIndex = tileIndexList.find(tileIndex => gs.getChar(tileIndex) && gs.getChar(tileIndex).type.niceName === 'The Wizard Yendor');
	gs.getChar(tileIndex).yendorVersion = 1;
	gs.getChar(tileIndex).currentHp = YENDOR_MAX_HP[0];
	
	// Setting Yendor Version02:
	tileIndexList = gs.getIndexListInArea(area02);
	tileIndex = tileIndexList.find(tileIndex => gs.getChar(tileIndex) && gs.getChar(tileIndex).type.niceName === 'The Wizard Yendor');
	gs.getChar(tileIndex).yendorVersion = 2;
	gs.getChar(tileIndex).currentHp = YENDOR_MAX_HP[1];
	
	// Setting Yendor Version03:
	tileIndexList = gs.getIndexListInArea(area03);
	tileIndex = tileIndexList.find(tileIndex => gs.getChar(tileIndex) && gs.getChar(tileIndex).type.niceName === 'The Wizard Yendor');
	gs.getChar(tileIndex).yendorVersion = 3;
	gs.getChar(tileIndex).currentHp = YENDOR_MAX_HP[2];
};

// GET_VAULT_TYPE_LIST:
// ************************************************************************************************
LevelGeneratorBossPortals.getVaultTypeList = function () {
	let vaultTypeList,
		list = [];
	
	let isValid = function (list) {
		if (list.length === 0) {
			return false;
		}
		
		let valid = true;
		let tagList = [];
		
		for (let i = 0; i < list.length; i += 1) {
			for (let j = 0; j < list[i].vaultTags.length; j += 1) {
				if (util.inArray(list[i].vaultTags[j], tagList)) {
					valid = false;
				}
				else {
					tagList.push(list[i].vaultTags[j]);
				}
			}
		}
		
		return valid;
	};
	
	while (!isValid(list)) {
		list = [];
		
		// Select first two Minor-Vaults:
		vaultTypeList = gs.vaultTypeList.filter(vaultType => vaultType.vaultSet === 'TheVaultOfYendor-TeleportBossMinor');
		list.push(util.randElem(vaultTypeList));
		list.push(util.randElem(vaultTypeList));

		// Select the Major-Vault:
		vaultTypeList = gs.vaultTypeList.filter(vaultType => vaultType.vaultSet === 'TheVaultOfYendor-TeleportBossMajor');
		list.push(util.randElem(vaultTypeList));
	}
	
	// Override for debugProperties.forceVaultType
	let vaultLevelFeature = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.VAULT_TYPE && !levelFeature.hasGenerated);
	if (vaultLevelFeature) {
		let vaultTypeName = gs.levelFeatures.find(levelFeature => levelFeature.featureType === FEATURE_TYPE.VAULT_TYPE && !levelFeature.hasGenerated).vaultTypeName;
		
		// Small-Boss:
		vaultTypeList = gs.vaultTypeList.filter(vaultType => vaultType.vaultSet === 'TheVaultOfYendor-TeleportBossMinor');
		if (vaultTypeList.find(vaultType => vaultType.name === vaultTypeName)) {
			list[0] = vaultTypeList.find(vaultType => vaultType.name === vaultTypeName);
			vaultLevelFeature.hasGenerated = true;
		}
		
		// Large-Boss:
		vaultTypeList = gs.vaultTypeList.filter(vaultType => vaultType.vaultSet === 'TheVaultOfYendor-TeleportBossMajor');
		if (vaultTypeList.find(vaultType => vaultType.name === vaultTypeName)) {
			list[2] = vaultTypeList.find(vaultType => vaultType.name === vaultTypeName);
			vaultLevelFeature.hasGenerated = true;
		}
	}
	
	return list;
};