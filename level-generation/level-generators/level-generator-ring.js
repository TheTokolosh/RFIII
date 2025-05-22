/*global game, util, gs, console*/
/*global LevelGeneratorBase, LevelGeneratorUtils, ConnectionMap, DungeonGenerator, AreaGeneratorVault*/
/*global VAULT_CONTENT, VAULT_PLACEMENT, FEATURE_TYPE, ORIENTATION*/
/*global NUM_TILES_X, NUM_TILES_Y*/
'use strict';

let LevelGeneratorRing = Object.create(LevelGeneratorBase);

// INIT:
// ************************************************************************************************
LevelGeneratorRing.init = function () {
	this.name = 'LevelGeneratorRing';
};
LevelGeneratorRing.init();

// GENERATE:
// ************************************************************************************************
LevelGeneratorRing.generate = function () {
	this.initNumVaults();
	
	LevelGeneratorUtils.placeTileSquare(0, 0, NUM_TILES_X, NUM_TILES_Y, gs.tileTypes.Wall);
	
	// Generate Outer, Middle and Inner Vaults:
	this.outerArea = this.placeTemplateVault('ArcaneRingOuter');
	this.middleArea = this.placeTemplateVault('ArcaneRingMiddle');
	this.innerArea = this.placeTemplateVault('ArcaneRingInner');
	this.placePortals();
	this.dressVaults();
	
	// Place Solid Vaults:
	this.placeSolidVaults();
};
	
// PLACE_TEMPLATE_VAULTS:
// ************************************************************************************************
LevelGeneratorRing.placeTemplateVault = function (vaultSet) {
	// Outer:
	let vaultTypeList = gs.getVaultTypeList(vaultSet);
	let vaultType = util.randElem(vaultTypeList);
	
	let angle = util.randElem([0, 90, 180, 270]);	
	
	let area = AreaGeneratorVault.generate({x: 0, y: 0}, vaultType, angle);
	
	area.inPortalTileIndexList = [];
	area.outPortalTileIndexList = [];
	
	// Finding the portal tags:
	let tileTypeMap = vaultType.getTileTypeMap(angle);
	for (let x = 0; x < tileTypeMap.width; x += 1) {
		for (let y = 0; y < tileTypeMap.height; y += 1) {
			// In Portals:
			if (tileTypeMap[x][y].t === 1) {
				area.inPortalTileIndexList.push({x: x, y: y});
			}
			
			// Out Porals:
			if (tileTypeMap[x][y].t === 2) {
				area.outPortalTileIndexList.push({x: x, y: y});
			}
		}
	}
	
	return area;
};

// PLACE_PORTALS:
// ************************************************************************************************
LevelGeneratorRing.placePortals = function () {
	let portalTileIndex, toTileIndex, obj;
	
	// Outer => Middle:
	portalTileIndex = util.randElem(this.outerArea.inPortalTileIndexList);
	toTileIndex = this.middleArea.portalHookTileIndex;
	gs.setTileType(portalTileIndex, gs.tileTypes.Floor);
	obj = gs.createObject(portalTileIndex, 'Portal');
	obj.toTileIndexList = [toTileIndex];
	gs.getTile(toTileIndex).isClosed = true;
	
	// Middle => Outer:
	portalTileIndex = util.randElem(this.middleArea.outPortalTileIndexList);
	toTileIndex = this.outerArea.portalHookTileIndex;
	gs.setTileType(portalTileIndex, gs.tileTypes.Floor);
	obj = gs.createObject(portalTileIndex, 'Portal');
	obj.toTileIndexList = [toTileIndex];
	gs.getTile(toTileIndex).isClosed = true;
	
	// Middle => Inner:
	portalTileIndex = util.randElem(this.middleArea.inPortalTileIndexList);
	toTileIndex = this.innerArea.portalHookTileIndex;
	gs.setTileType(portalTileIndex, gs.tileTypes.Floor);
	obj = gs.createObject(portalTileIndex, 'Portal');
	obj.toTileIndexList = [toTileIndex];
	gs.getTile(toTileIndex).isClosed = true;
	
	// Inner => Middle:
	portalTileIndex = util.randElem(this.innerArea.outPortalTileIndexList);
	toTileIndex = this.middleArea.portalHookTileIndex;
	gs.setTileType(portalTileIndex, gs.tileTypes.Floor);
	obj = gs.createObject(portalTileIndex, 'Portal');
	obj.toTileIndexList = [toTileIndex];
	gs.getTile(toTileIndex).isClosed = true;
	
};

// DRESS_VAULTS:
// ************************************************************************************************
LevelGeneratorRing.dressVaults = function () {
	[this.outerArea, this.middleArea, this.innerArea].forEach(function (area) {
		// Pillars:
		if (util.frac() < 0.5) {
			AreaGeneratorVault.placePillars(area);
		}
		
		// Liquid:
		AreaGeneratorVault.placeLiquid(area, util.randElem([gs.tileTypes.Water, gs.tileTypes.Lava]));
	}, this);
	
	
	
	
};

// PLACE_SOLID_VAULTS:
// ************************************************************************************************
LevelGeneratorRing.placeSolidVaults = function () {
	// Chance to handle Level-Feature-Vault:
	gs.levelFeatures.forEach(function (levelFeature) {
		
		// Note how Solid-Vaults are the last type to generate so must try to catch all remaining Level-Feature vaults:
		if (!levelFeature.hasGenerated && util.frac() < 1.0) {
			let vaultTypeFilter = vaultType => vaultType.placementType === VAULT_PLACEMENT.SOLID && vaultType.contentType === levelFeature.contentType;
	
			let area = this.tryToPlaceVault(vaultTypeFilter);
	
			if (area) {
				levelFeature.hasGenerated = true;
				
				console.log(area);
				
				// Create Hall:
				LevelGeneratorUtils.placeShortestHall(area, this.outerArea);
			}
		}
	}, this);	
};