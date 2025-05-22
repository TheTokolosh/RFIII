/*global gs, util*/
/*global DANGEROUS_TERRAIN_HELP*/
/*jshint esversion: 6*/
'use strict';

// CREATE_TILE_TYPES:
// ************************************************************************************************
gs.createTileTypes = function () {
	// Tile Types:
    this.tileTypes = {
		FloorGrate:		{frame: 3931,	passable: 2, transparent: 1, isPit: 0},
		Carpet:			{frame: 618,	passable: 2, transparent: 1, isPit: 0},
		
		
		Wall:			{frame: 0, 		passable: 0, transparent: 0, isPit: 0},
		CaveWall:		{frame: 1, 		passable: 0, transparent: 0, isPit: 0},
		Floor:			{frame: 2, 		passable: 2, transparent: 1, isPit: 0},
		CaveFloor:		{frame: 3, 		passable: 2, transparent: 1, isPit: 0},
		
		
		CavePit:		{frame: 7,		passable: 2, transparent: 1, isPit: 1},
		DungeonPit:		{frame: 8,		passable: 2, transparent: 1, isPit: 1},
		
		Water:			{frame: 14, 	passable: 2, transparent: 1, isPit: 0, isLiquid: 1, isWet: true},
		Lava:			{frame: 15, 	passable: 2, transparent: 1, isPit: 0, isLiquid: 1},
		ToxicWaste:		{frame: 16,		passable: 2, transparent: 1, isPit: 0, isLiquid: 1, isWet: true},
		Blood:			{frame: 17,		passable: 2, transparent: 1, isPit: 0, isLiquid: 1, isWet: true},
		
		PlatformWall:	{frame: 4,		passable: 1, transparent: 1, isPit: 0},
		Steps:			{frame: null,	passable: 2, transparent: 1, isPit: 0},
		BridgeWall:		{frame: 816,	passable: 1, transparent: 1, isPit: 0},
		HalfWall:		{frame: 1058,	passable: 1, transparent: 1, isPit: 0},
		
		Bridge:			{frame: null,	passable: 2, transparent: 1, isPit: 0},
		
		/*
		PitWall:		{frame: 1248,	passable: 1, transparent: 1, isPit: 0},
		*/
	};
	
	// DEFAULT_PROPERTIES:
	this.tileTypeList = [];
	this.forEachType(this.tileTypes, function(tileType) {
		tileType.frames = [];
		tileType.tileSets = {};
		
		this.tileTypeList.push(tileType);
	}, this);
	
		
	let _ = this.tileTypes;
	
	// FLOOR_TILE_SETS:
	_.Floor.tileSets = {
		MainDungeon: 		{frame: 520, 	alternate: util.range(534, 541)},
		TheSunlessDesert:	{frame: 1416, 	alternate: util.range(1430, 1437)},
		TheSwamp:			{frame: 1864, 	alternate: util.range(1878, 1885)},
		TheUnderGrove:		{frame: 2248, 	alternate: util.range(2262, 2269)},
		TheCore:			{frame: 2632, 	alternate: util.range(2646, 2653)},
		TheIceCaves:		{frame: 3080, 	alternate: util.range(3094, 3101)},
		TheSewers:			{frame: 3520, 	alternate: util.range(3534, 3541)},
		TheIronForge:		{frame: 3904, 	alternate: util.range(3919, 3922)},
		TheArcaneTower:		{frame: 4352, 	alternate: util.range(4366, 4373)},
		TheCrypt:			{frame: 4672, 	alternate: util.range(4686, 4689)},
		TheVaultOfYendor:	{frame: 5000, 	alternate: util.range(5014, 5017)},
		TheDarkTemple:		{frame: 2899, 	alternate: util.range(2913, 2920)},
	};
	
	// CAVE_FLOOR_SETS:
	_.CaveFloor.tileSets = {
		MainDungeon:		{frame: 512, 	alternate: []},
		TheSunlessDesert:	{frame: 1408,	alternate: []},
		TheSwamp:			{frame: 1856, 	alternate: [1857, 1858]},
		TheUnderGrove:		{frame: 2240,	alternate: []},
		TheCore:			{frame: 2624, 	alternate: []},
		TheIceCaves:		{frame: 3072,	alternate: []},
		TheVaultOfYendor:	{frame: 4992,	alternate: [4993, 4994]},
	};
	
	// WALL_TILE_SETS:
	_.Wall.tileSets = {
		MainDungeon:		{frame: 704, 	alternate: []},
		TheSunlessDesert:	{frame: 1536,	alternate: []},
		TheSwamp:			{frame: 1984,	alternate: []},
		TheUnderGrove:		{frame: 2304,	alternate: []},
		TheCore:			{frame: 2752,	alternate: []},
		TheIceCaves:		{frame: 3200,	alternate: []},
		TheSewers:			{frame: 3648,	alternate: util.range(3663, 3667)},
		TheIronForge:		{frame: 3968, 	alternate: []},
		TheArcaneTower:		{frame: 4416,	alternate: []},
		TheCrypt:			{frame: 4736,	alternate: []},
		TheVaultOfYendor:	{frame: 5056,	alternate: []},
		TheDarkTemple:		{frame: 2880,	alternate: []},
	};
	
	// CAVE_WALL_TILE_SETS:
	_.CaveWall.tileSets = {
		MainDungeon:		{frame: 736, 	alternate: [],	breakToTileType: _.CaveFloor, breakToFrame: _.CaveFloor.tileSets.MainDungeon.frame},
		TheSunlessDesert:	{frame: 1568, 	alternate: [],	breakToTileType: _.CaveFloor, breakToFrame: _.CaveFloor.tileSets.TheSunlessDesert.frame},
		TheSwamp:			{frame: 2016, 	alternate: [],	breakToTileType: _.CaveFloor, breakToFrame: _.CaveFloor.tileSets.TheSwamp.frame},
		TheCore:			{frame: 2785, 	alternate: [],	breakToTileType: _.CaveFloor, breakToFrame: _.CaveFloor.tileSets.TheCore.frame},
		TheIceCaves:		{frame: 3233,	alternate: [],	breakToTileType: _.CaveFloor, breakToFrame: _.CaveFloor.tileSets.TheIceCaves.frame},
		TheVaultOfYendor:	{frame: 5088,	alternate: [],	breakToTileType: _.CaveFloor, breakToFrame: _.CaveFloor.tileSets.TheVaultOfYendor.frame},
		BeeHive:			{frame: 2343,	alternate: [], breakToTileType: _.CaveFloor, breakToFrame: _.CaveFloor.tileSets.MainDungeon.frame},
	};
	
	// PLATFORM_WALL_TILE_SETS:
	_.PlatformWall.tileSets = {
		MainDungeon:		{frame: 768},
		TheArcaneTower: 	{frame: 4379},
	};
	
	// CAVE_PIT_TILE_SETS:
	_.CavePit.tileSets = {
		MainDungeon:		{frame: 755},
		TheSunlessDesert:	{frame: 1587},
		TheSwamp:			{frame: 2035},
		TheCore:			{frame: 2803},
		TheIceCaves:		{frame: 3251},
		TheVaultOfYendor:	{frame: 5107},
	};
	
	// DUNGEON_PIT_TILE_SETS:
	_.DungeonPit.tileSets = {
		MainDungeon:		{frame: 723},
		TheSunlessDesert:	{frame: 1555},
		TheSwamp:			{frame: 2003},
		TheUnderGrove:		{frame: 2323},
		TheCore:			{frame: 2771},
		TheIceCaves:		{frame: 3219},
		TheSewers:			{frame: 3691},
		TheIronForge:		{frame: 3987},
		TheArcaneTower:		{frame: 4435},
		TheCrypt:			{frame: 4756},
		TheVaultOfYendor:	{frame: 5075},
	};
	
	// WATER_TILE_SETS:
	_.Water.tileSets = {
		MainDungeon:		{frame: 5312},
		TheSunlessDesert:	{frame: 5696},
		TheSwamp:			{frame: 5824},
		TheIceCaves:		{frame: 5568},
	};
	
	// LAVA_TILE_SETS:
	_.Lava.tileSets = {
		MainDungeon:		{frame: 5440},
		TheCore:			{frame: 5952},
	};
	
	// TOXIC_WASTE_TILE_SETS:
	_.ToxicWaste.tileSets = {
		MainDungeon:		{frame: 6080},
	};
	
	// BLOOD_TILE_SETS:
	_.Blood.tileSets = {
		TheCrypt:			{frame: 6144},
	};
	
	// FLOOR_ADDITIONAL_FRAMES:
	_.Floor.frames = [
		// Main Dungeon Additional Tiles:
		util.range(544, 556),
		util.range(576, 639),
		
		// Dark Temple:
		util.range(2923, 2935),
		
		// The Arcane Tower (Colored Tiles):
		util.range(4288, 4341)
	].flat();
	
	// FLOOR_GRATE_FRAMES:
	_.FloorGrate.frames = util.range(3931, 3939);
	_.Carpet.frames = util.range(618, 626);
	
	// STEPS_ADDITIONAL_FRAMES:
	_.Steps.frames = [
		// Main Dungeon Set:
		[791, 792, 793,
		 794, 795, 796,
		 797, 798, 799,
		 800, 801, 802],
		
		// Arcane Tower Set:
		[4402, 4403, 4404,
		 4405, 4406, 4407,
		 4408, 4409, 4410]
	].flat();
	
	// BRIDGE_ADDITIONAL_FRAMES:
	_.Bridge.frames = [
		1887, 1888,
	].flat();
	
	// BRIDGE_WALL_ADDITIONAL_FRAMES:
	_.BridgeWall.frames = [
		816, 817, 818, 819
	];
	
	// HALF_WALL_ADDITIONAL_FRAMES:
	_.HalfWall.frames = [
		[4836, 4837, 4838, 4839],
		util.frameBox(1058, 6, 3), // Upper Dungeon / Orc Fortress
		util.frameBox(4718, 6, 3),
		util.frameBox(4014, 6, 3),
		util.frameBox(5139, 6, 3), // The-Vault-Of-Yendor
	].flat();
	
    // Add all floor frames:
    this.setTileSetFrames(gs.tileTypes.Floor, 14);
    this.setTileSetFrames(gs.tileTypes.CaveFloor, 0);
	this.setTileSetFrames(gs.tileTypes.Wall, 17);
    this.setTileSetFrames(gs.tileTypes.CaveWall, 17);
    this.setTileSetFrames(gs.tileTypes.PlatformWall, 20);
    this.setTileSetFrames(gs.tileTypes.CavePit, 13);
    this.setTileSetFrames(gs.tileTypes.DungeonPit, 13);
    this.setTileSetFrames(gs.tileTypes.Water, 128); // 28
    this.setTileSetFrames(gs.tileTypes.Lava, 128);
    this.setTileSetFrames(gs.tileTypes.ToxicWaste, 64);
	this.setTileSetFrames(gs.tileTypes.Blood, 64);
	
	// TILE_FRAME_ROTATIONS:
	this.tileFrameRotations = [
		// Bridge:
		{f1: 1887, f2: 1888},
		
		// Iron-Forge - Half Walls:
		{f1: 4014, f2: 4016},
		{f1: 4015, f2: 4078},
		{f1: 4016, f2: 4144},
		{f1: 4017, f2: 4083},
		{f1: 4018, f2: 4019},
		{f1: 4019, f2: 4017},
		{f1: 4077, f2: 4015},
		{f1: 4080, f2: 4143},
		{f1: 4081, f2: 4145},
		{f1: 4082, f2: 4146},
		{f1: 4083, f2: 4018},
		{f1: 4142, f2: 4014},
		{f1: 4143, f2: 4080},
		{f1: 4144, f2: 4142},
		{f1: 4145, f2: 4082},
		{f1: 4146, f2: 4081},
		
		// Iron-Forge - Floor Grate:
		// This should be made generic (same tile layout for carpet)
		{f1: 3931, f2: 3933},
		{f1: 3932, f2: 3936},
		{f1: 3933, f2: 3939},
		{f1: 3934, f2: 3932},
		{f1: 3936, f2: 3938},
		{f1: 3937, f2: 3931},
		{f1: 3938, f2: 3934},
		{f1: 3939, f2: 3937},
		
		// Iron-Forge - Floor
		// When placed in Tiled to create some sort of floor pattern we want to maintain orientation.
		// This should be generic in order to use with other floors.
		{f1: 3906 + 0, f2: 3906 + 3},
		{f1: 3906 + 1, f2: 3906 + 2},
		{f1: 3906 + 2, f2: 3906 + 0},
		{f1: 3906 + 3, f2: 3906 + 1},
		
		{f1: 3906 + 4, f2: 3906 + 6},
		{f1: 3906 + 5, f2: 3906 + 4},
		{f1: 3906 + 6, f2: 3906 + 7},
		{f1: 3906 + 7, f2: 3906 + 5},
		
		{f1: 3906 + 8, f2: 3906 + 11},
		{f1: 3906 + 9, f2: 3906 + 8},
		{f1: 3906 + 10, f2: 3906 + 9},
		{f1: 3906 + 11, f2: 3906 + 10},
	];
	
	// Half Wall Rotations
	this.createHalfWallFrameRotations(1058);
	
	// Carpet Rotations:
	this.createCarpetTileFrameRotations(618);
	
	// Floor Tile Rotations:
	this.createFloorTileFrameRotations(595); // The Upper Dungeon (Red)
	this.createFloorTileFrameRotations(581); // The Upper Dungeon (Blue)
	this.createFloorTileFrameRotations(545); // The Upper Dungeon (White)
	this.createFloorTileFrameRotations(3906); // Iron Forge
	this.createFloorTileFrameRotations(4289); // The Arcane Tower (Red)
	this.createFloorTileFrameRotations(4303); // The Arcane Tower (Blue)
	this.createFloorTileFrameRotations(4317); // The Arcane Tower (White)


	/*
	// Tile Colors (minimap):
	this.tileTypes.Lava.color = 'rgb(200, 24, 24)';
	this.tileTypes.ToxicWaste.color = '#51af12';
	
	// Tile Desc:
	*/
	
	this.tileTypes.Water.desc = 'Unstable footing causes you to take critical damage from all physical attacks.\n\nMakes you wet and vulnerable to shock';

	this.tileTypes.Lava.desc = DANGEROUS_TERRAIN_HELP;
	this.tileTypes.ToxicWaste.desc = DANGEROUS_TERRAIN_HELP;
	
	this.nameTypes(this.tileTypes);
};

// CREATE_HALF_WALL_FRAME_ROTATIONS:
// ************************************************************************************************
gs.createHalfWallFrameRotations = function (baseFrame) {	
	let list = [
		{f1: baseFrame + 0, f2: baseFrame + 2},
		{f1: baseFrame + 1, f2: baseFrame + 64},
		{f1: baseFrame + 2, f2: baseFrame + 130},
		{f1: baseFrame + 3, f2: baseFrame + 69},
		{f1: baseFrame + 4, f2: baseFrame + 5},
		{f1: baseFrame + 5, f2: baseFrame + 3},
		
		{f1: baseFrame + 63, f2: baseFrame + 1},
		{f1: baseFrame + 66, f2: baseFrame + 129},
		{f1: baseFrame + 67, f2: baseFrame + 131},
		{f1: baseFrame + 68, f2: baseFrame + 132},
		{f1: baseFrame + 69, f2: baseFrame + 4},
		
		{f1: baseFrame + 128, f2: baseFrame + 0},
		{f1: baseFrame + 129, f2: baseFrame + 66},
		{f1: baseFrame + 130, f2: baseFrame + 128},
		{f1: baseFrame + 131, f2: baseFrame + 68},
		{f1: baseFrame + 132, f2: baseFrame + 67},
	];
	
	this.tileFrameRotations = this.tileFrameRotations.concat(list);
};

// CREATE_CARPET_TILE_FRAME_ROTATIONS:
// ************************************************************************************************
gs.createCarpetTileFrameRotations = function (baseFrame) {
	let list = [
		{f1: baseFrame + 0, f2: baseFrame + 2},
		{f1: baseFrame + 1, f2: baseFrame + 5},
		{f1: baseFrame + 2, f2: baseFrame + 8},
		{f1: baseFrame + 3, f2: baseFrame + 1},
		{f1: baseFrame + 5, f2: baseFrame + 7},
		{f1: baseFrame + 6, f2: baseFrame + 0},
		{f1: baseFrame + 7, f2: baseFrame + 3},
		{f1: baseFrame + 8, f2: baseFrame + 6},
	];
	
	this.tileFrameRotations = this.tileFrameRotations.concat(list);
};

// CREATE_FLOOR_TILE_FRAME_ROTATIONS:
// ************************************************************************************************
gs.createFloorTileFrameRotations = function (baseFrame) {
	let list = [
		{f1: baseFrame + 0, f2: baseFrame + 3},
		{f1: baseFrame + 1, f2: baseFrame + 2},
		{f1: baseFrame + 2, f2: baseFrame + 0},
		{f1: baseFrame + 3, f2: baseFrame + 1},
		
		{f1: baseFrame + 4, f2: baseFrame + 6},
		{f1: baseFrame + 5, f2: baseFrame + 4},
		{f1: baseFrame + 6, f2: baseFrame + 7},
		{f1: baseFrame + 7, f2: baseFrame + 5},
		
		{f1: baseFrame + 8, f2: baseFrame + 11},
		{f1: baseFrame + 9, f2: baseFrame + 8},
		{f1: baseFrame + 10, f2: baseFrame + 9},
		{f1: baseFrame + 11, f2: baseFrame + 10},
	];

	this.tileFrameRotations = this.tileFrameRotations.concat(list);
};

// SET_TILE_SET_FRAMES:
// ************************************************************************************************
gs.setTileSetFrames = function (tileType, tileSetLength) {
	gs.forEachType(tileType.tileSets, function (tileSet) {
        // Add a range of frames to the tileset:
		if (tileSetLength > 0) {
			tileSet.frames = util.range(tileSet.frame, tileSet.frame + tileSetLength - 1);
		}
		// Adding a single frame:
		else {
			tileSet.frames = [tileSet.frame];
		}
       
		// Add alternate frames to the tileset:
        tileSet.frames = tileSet.frames.concat(tileSet.alternate);
        
        // Add all frames in the TileSet to the TileType:
        tileType.frames = tileType.frames.concat(tileSet.frames);
	}, this);
};

// ROTATE_TILE_FRAME:
// ************************************************************************************************
gs.rotateTileFrame = function (frame) {
	var e;
	
	e = this.tileFrameRotations.find(e => e.f1 === frame);
	if (e) {
		return e.f2;
	}
	
	e = this.tileFrameRotations.find(e => e.f2 === frame);
	if (e) {
		return e.f1;
	}
	
	return frame;
};

// GET_TILE_SET:
// ********************************************************************************************
gs.getTileSet = function (tile) {
	for (let key in gs.tileTypes[tile.type.name].tileSets) {
		if (gs.tileTypes[tile.type.name].tileSets.hasOwnProperty(key)) {
            let tileSet = gs.tileTypes[tile.type.name].tileSets[key];
            
			if (tileSet.frames && util.inArray(tile.frame, tileSet.frames)) {
				return tileSet;
			}
		}
	}
	
	return null;
};

// IS_GLOBAL_BASE_FRAME:
// ********************************************************************************************
gs.isGlobalBaseFrame = function (frame) {
	let tileType = this.tileTypeList.find(tileType => tileType.frame === frame);
	
	if (tileType && util.inArray(tileType.name, ['Steps', 'HalfWall', 'BridgeWall', 'FloorGrate', 'Carpet'])) {
		return false;
	}
	else if (tileType) {
		return true;
	}
	
	return false;
};

// IS_TILE_SET_BASE_FRAME:
// ********************************************************************************************
gs.isTileSetBaseFrame = function (frame) {
	for (let i = 0; i < this.tileTypeList.length; i += 1) {
		for (let key in this.tileTypeList[i].tileSets) {
			if (this.tileTypeList[i].tileSets.hasOwnProperty(key) && this.tileTypeList[i].tileSets[key].frame === frame) {
				return true;
			}
		}
	}
	
	return false;
};

// GET_ZONE_TILE_SET_BASE_FRAME:
// ********************************************************************************************
gs.getZoneTileSetBaseFrame = function (tileType) {
	if (!gs.zoneType().tileFrames[tileType.name]) {
		throw 'ERROR [getZoneTileSetBaseFrame] - zoneType: ' + gs.zoneName + ' does not have a tileSet for tileType: ' + tileType.name;
	}
	
	return gs.zoneType().tileFrames[tileType.name].frame;
};


// ZONE_TILE_FRAMES:
// zoneTileFrames are used so that each zone can have different frames for each tile.
// For example we may want slimy walls in the sewer and normal walls in the main dungeon.
// base: the basic frame used most of the time for the tile.
// alternate: a list of alternative tiles to use some small percentage of the time.
// ********************************************************************************************
gs.createZoneTileFrames = function () {
	this.zoneTileFrames = {};
	
	// MAIN_DUNGEON:
	this.zoneTileFrames.MainDungeon = {
		Floor: 			'MainDungeon',
		Wall: 			'MainDungeon',
		DungeonPit:		'MainDungeon',
		CaveFloor:		'MainDungeon',
		CaveWall:		'MainDungeon',
		CavePit:		'MainDungeon',
		Water:			'MainDungeon',
		Lava:			'MainDungeon',
		ToxicWaste: 	'MainDungeon',
		PlatformWall: 	'MainDungeon',
		Blood:			'TheCrypt',
	};
	
	// THE_DARK_TEMPLE:
	this.zoneTileFrames.TheDarkTemple = {
		Floor: 			'TheDarkTemple',
		Wall: 			'TheDarkTemple',
		DungeonPit:		'MainDungeon',
		CaveFloor:		'MainDungeon',
		CaveWall:		'MainDungeon',
		CavePit:		'MainDungeon',
		Water:			'MainDungeon',
		Lava:			'MainDungeon',
		ToxicWaste: 	'MainDungeon',
		PlatformWall: 	'MainDungeon',
	};
	
	// THE_SUNLESS_DESERT:
	this.zoneTileFrames.TheSunlessDesert = {
		Floor: 		'TheSunlessDesert',
		Wall: 		'TheSunlessDesert',
		DungeonPit:	'TheSunlessDesert',
		CaveFloor:	'TheSunlessDesert',
		CaveWall:	'TheSunlessDesert',
		CavePit:	'TheSunlessDesert',
		Water:		'TheSunlessDesert',
		Lava:		'MainDungeon',
		ToxicWaste: 'MainDungeon',
		PlatformWall: 	'MainDungeon',
	};
	
	// THE_SWAMP:
	this.zoneTileFrames.TheSwamp = {
		Floor: 		'TheSwamp',
		Wall: 		'TheSwamp',
		DungeonPit:	'TheSwamp',
		CaveFloor:	'TheSwamp',
		CaveWall:	'TheSwamp',
		CavePit:	'TheSwamp',
		Water:		'TheSwamp',
		Lava:		'MainDungeon',
		ToxicWaste: 'MainDungeon',
		PlatformWall: 	'MainDungeon',
	};
	
	// THE_UNDER_GROVE:
	this.zoneTileFrames.TheUnderGrove = {
		Floor: 		'TheUnderGrove',
		Wall: 		'TheUnderGrove',
		DungeonPit:	'TheUnderGrove',
		CaveFloor:	'TheUnderGrove',
		CaveWall:	'MainDungeon',
		CavePit:	'MainDungeon',
		Water:		'MainDungeon',
		Lava:		'MainDungeon',
		ToxicWaste: 'MainDungeon',
		PlatformWall: 	'MainDungeon',
	};
	
	// THE_CORE:
	this.zoneTileFrames.TheCore = {
		Floor: 		'TheCore',
		Wall: 		'TheCore',
		DungeonPit:	'TheCore',
		CaveFloor:	'TheCore',
		CaveWall:	'TheCore',
		CavePit:	'TheCore',
		Water:		'MainDungeon',
		Lava:		'TheCore',
		ToxicWaste: 'MainDungeon',
		PlatformWall: 	'MainDungeon',
	};
	
	// THE_ICE_CAVES:
	this.zoneTileFrames.TheIceCaves = {
		Floor: 		'TheIceCaves',
		Wall: 		'TheIceCaves',
		DungeonPit:	'TheIceCaves',
		CaveFloor:	'TheIceCaves',
		CaveWall:	'TheIceCaves',
		CavePit:	'TheIceCaves',
		Water:		'TheIceCaves',
		Lava:		'MainDungeon',
		ToxicWaste: 'MainDungeon',
		PlatformWall: 	'MainDungeon',
	};
	
	// THE_SEWERS:
	this.zoneTileFrames.TheSewers = {
		Floor: 		'TheSewers',
		Wall: 		'TheSewers',
		DungeonPit:	'TheSewers',
		CaveFloor:	'MainDungeon',
		CaveWall:	'MainDungeon',
		CavePit:	'MainDungeon',
		Water:		'MainDungeon',
		Lava:		'MainDungeon',
		ToxicWaste: 'MainDungeon',
		PlatformWall: 	'MainDungeon',
	};
	
	// THE_IRON_FORGE:
	this.zoneTileFrames.TheIronForge = {
		Floor: 		'TheIronForge',
		Wall: 		'TheIronForge',
		DungeonPit:	'TheIronForge',
		CaveFloor:	'MainDungeon',
		CaveWall:	'MainDungeon',
		CavePit:	'MainDungeon',
		Water:		'MainDungeon',
		Lava:		'MainDungeon',
		ToxicWaste: 'MainDungeon',
		PlatformWall: 	'MainDungeon',
	};
	
	// THE_ARCANE_TOWER:
	this.zoneTileFrames.TheArcaneTower = {
		Floor: 		'TheArcaneTower',
		Wall: 		'TheArcaneTower',
		DungeonPit:	'TheArcaneTower',
		CaveFloor:	'MainDungeon',
		CaveWall:	'MainDungeon',
		CavePit:	'MainDungeon',
		Water:		'MainDungeon',
		Lava:		'MainDungeon',
		ToxicWaste: 'MainDungeon',
		PlatformWall: 	'TheArcaneTower',
	};
	
	// THE_CRYPT:
	this.zoneTileFrames.TheCrypt = {
		Floor: 		'TheCrypt',
		Wall: 		'TheCrypt',
		DungeonPit:	'TheCrypt',
		CaveFloor:	'MainDungeon',
		CaveWall:	'MainDungeon',
		CavePit:	'MainDungeon',
		Water:		'MainDungeon',
		Lava:		'MainDungeon',
		ToxicWaste: 'MainDungeon',
		Blood:		'TheCrypt',
		PlatformWall: 	'MainDungeon',
	};
	
	// THE_VAULT_OF_YENDOR:
	this.zoneTileFrames.TheVaultOfYendor = {
		Floor: 		'TheVaultOfYendor',
		Wall: 		'TheVaultOfYendor',
		DungeonPit:	'TheVaultOfYendor',
		CaveFloor:	'TheVaultOfYendor',
		CaveWall:	'TheVaultOfYendor',
		CavePit:	'TheVaultOfYendor',
		Water:		'MainDungeon',
		Lava:		'MainDungeon',
		ToxicWaste: 'MainDungeon',
		PlatformWall: 	'MainDungeon',
		Blood:		'TheCrypt',
	};
	
	this.nameTypes(this.zoneTileFrames);
	
	
	this.forEachType(this.zoneTileFrames, function (zoneTileFrames) {
		for (let key in zoneTileFrames) {
			if (zoneTileFrames.hasOwnProperty(key)) {
				// Link to Tile Sets:
				if (gs.tileTypes[key]) {
					zoneTileFrames[key] = gs.tileTypes[key].tileSets[zoneTileFrames[key]];
				}
				
				// Verification:
				if (!zoneTileFrames[key]) {
					throw 'ERROR [createZoneTileFrames] - invalid tileSet: ' + key + ' in zone: ' + zoneTileFrames.name;
				}
			}
		}
	}, this);
};
