/*global game, console, util*/
/*global nw, path, fs*/
'use strict';

let VaultConverter = {};

VaultConverter.loadVaultTypes = function () {
	this.oldVaultsRoot = nw.App.startPath + '/rogue-fable-III/assets/maps/old-vaults/';
	this.newVaultsRoot = nw.App.startPath + '/rogue-fable-III/assets/maps/new-vaults/';
	
		
	// Parse directories starting at the root:
	this.dirObjList = [];
	let rootDirObj = this.createDirObj('');
	this.parseDir(rootDirObj);
	
	// Construct directories in new-vaults:
	/*
	this.dirObjList.forEach(function (dirObj) {
		let dirPath = path.normalize(this.newVaultsRoot + dirObj.path);
		fs.mkdirSync(dirPath);
	}, this);
	*/
	
	// Load the JSON for all old files:
	this.dirObjList.forEach(function (dirObj) {		
		dirObj.fileList.forEach(function (fileName) {
			let name = dirObj.path + fileName;
			game.load.json(name, 'assets/maps/old-vaults/' + name);
		}, this);
	}, this);
};

VaultConverter.convertAllVaults = function () {
	this.tileManualTable = [
		// Wood span base:
		541, 542,
	];
	
	this.tileTable = [
		// Wall:
		{fromFrame: 480, toFrame: 0}, // Wall
		{fromFrame: 512, toFrame: 0},
		{fromFrame: 2208, toFrame: 0},
		{fromFrame: 576, toFrame: 3648}, // Sewer wall
		{fromFrame: 672, toFrame: 0},
		{fromFrame: 608, toFrame: 0},
		{fromFrame: 544, toFrame: 0},
		
		// Cave Wall:
		{fromFrame: 481, toFrame: 1},
		{fromFrame: 896, toFrame: 2016}, // Swamp Cave Wall
		{fromFrame: 768, toFrame: 1},
		{fromFrame: 800, toFrame: 2785}, // Core Cave Wall
		{fromFrame: 832, toFrame: 3233}, // Ice Wall
		
		// Floor:
		{fromFrame: 482, toFrame: 2}, // Generic
		{fromFrame: util.range(0, 11), toFrame: 2},
		{fromFrame: util.range(248, 255), toFrame: 2},
		{fromFrame: util.range(184, 191), toFrame: 2},
		{fromFrame: util.range(215, 223), toFrame: 2},
		{fromFrame: 28, toFrame: 576},
		{fromFrame: 93, toFrame: 2},
		{fromFrame: 32, toFrame: 3904}, // Forge Floor
		{fromFrame: 64, toFrame: 2}, // Crypt Floor
		
		// Cave Floor:
		{fromFrame: 483, toFrame: 3}, // Generic
		{fromFrame: 272, toFrame: 1856}, // Swamp CaveFloor:
		{fromFrame: 288, toFrame: 3072}, // Ice CaveFloor:
		{fromFrame: 320, toFrame: 1408}, // Desert Cave Floor:
		{fromFrame: 256, toFrame: 512}, // Dungeon Cave Floor
		{fromFrame: 360, toFrame: 2240}, // Grass
		{fromFrame: 352, toFrame: 2624}, // Core 
		
		// Tile Bridge:
		{fromFrame: 384, toFrame: 1887},
		{fromFrame: 385, toFrame: 1888},
		
		// Stairs:
		{fromFrame: 1264, toFrame: 791},
		{fromFrame: 1265, toFrame: 792},
		{fromFrame: 1266, toFrame: 793},
		
		// Half-Walls:
		{fromFrame: 1216, toFrame: 816},
		{fromFrame: 1217, toFrame: 817},
		{fromFrame: 1218, toFrame: 818},
		{fromFrame: 1219, toFrame: 819},
		
		
		// Water:
		{fromFrame: 1280, toFrame: 14},
		{fromFrame: 1296, toFrame: 1920}, // Swamp water
		{fromFrame: 2720, toFrame: 3136}, // Ice Water

		// Lava:
		{fromFrame: 1344, toFrame: 15},
		
		// Toxic Waste:
		{fromFrame: 1472, toFrame: 16},
		
		// Cave Pit:
		{fromFrame: 1056, toFrame: 7},
		{fromFrame: 1088, toFrame: 7},

		// Dungeon Pit:
		{fromFrame: 1024, toFrame: 8},

		// Platform Walls:
		{fromFrame: util.range(1230, 1246), toFrame: 4},

		// Carpet:
		{fromFrame: 24, toFrame: 618},
		{fromFrame: 25, toFrame: 619},
		{fromFrame: 26, toFrame: 620},
		{fromFrame: 56, toFrame: 621},
		{fromFrame: 57, toFrame: 622},
		{fromFrame: 58, toFrame: 623},
		{fromFrame: 88, toFrame: 621},
		{fromFrame: 89, toFrame: 622},
		{fromFrame: 90, toFrame: 623},
		
		// Small Platform:
		{fromFrame: 315, toFrame: 800},
		{fromFrame: 316, toFrame: 801},
		{fromFrame: 317, toFrame: 802},
		{fromFrame: 347, toFrame: 803},
		{fromFrame: 348, toFrame: 804},
		{fromFrame: 349, toFrame: 805},
		{fromFrame: 379, toFrame: 806},
		{fromFrame: 380, toFrame: 807},
		{fromFrame: 381, toFrame: 808},
		
		// Grate:
		{fromFrame: 311, toFrame: 3931},
		{fromFrame: 312, toFrame: 3932},
		{fromFrame: 313, toFrame: 3933},
		
		{fromFrame: 343, toFrame: 3934},
		{fromFrame: 344, toFrame: 3935},
		{fromFrame: 345, toFrame: 3936},
		
		{fromFrame: 375, toFrame: 3937},
		{fromFrame: 376, toFrame: 3938},
		{fromFrame: 377, toFrame: 3939},
	];
	
	this.flagTable = [
		// Solid:
		{fromFrame: 2016, toFrame: 64},
		
		// Liquid Field:
		{fromFrame: 2080, toFrame: 69},
		
		// Close:
		{fromFrame: 2019, toFrame: 68},
		
		// Mob:
		{fromFrame: 2020, toFrame: 73},
		
		// Zoo Mob:
		{fromFrame: 2017, toFrame: 72},
		
		// Flags:
		{fromFrame: 2023, toFrame: 78},
		{fromFrame: 2024, toFrame: 79},
		{fromFrame: 2025, toFrame: 80},
		{fromFrame: 2026, toFrame: 81},
	];
	
	this.objectTable = [
		// Door:
		{fromFrame: 1584, toFrame: 128},
		
		// Glyph Door:
		{fromFrame: 1588, toFrame: 129},
		
		// Pillar Flag:
		{fromFrame: 2048, toFrame: 66},
		
		// Down Stairs:
		{fromFrame: 1616, toFrame: 152},
		
		// Up Stairs:
		{fromFrame: 1617, toFrame: 153},
		
		// Pillar:
		{fromFrame: 1608, toFrame: 896},
		{fromFrame: 1614, toFrame: 5120},
		{fromFrame: 1640, toFrame: 1618},
		{fromFrame: 1609, toFrame: 4032},
		{fromFrame: 1610, toFrame: 896},
		
		// Hall Hook:
		{fromFrame: 2021, toFrame: 65},
		
		// Gas Trap:
		{fromFrame: 1556, toFrame: 272},
		
		// Mob Flag:
		{fromFrame: 2020, toFrame: 73},
		
		// Swamp Tree:
		{fromFrame: 1733, toFrame: 2054},
		
		// Pine Tree:
		{fromFrame: 1739, toFrame: 3272},
		
		// Wooden Span w/ Tusk:
		{fromFrame: 1904, toFrame: 850},
		
		// Wooden Span:
		{fromFrame: 1905, toFrame: 849},
		
		// Swamp Statue:
		{fromFrame: 1749, toFrame: 2056},
		
		// Water Tree:
		{fromFrame: 1734, toFrame: 2055},
		
		// Water Stalagmite:
		{fromFrame: 1732, toFrame: 2049},
		
		// Tiki Torch:
		{fromFrame: 1728, toFrame: 2050},
		
		// Ice Stalagmite:
		{fromFrame: 1601, toFrame: 3264},
		
		// Core Stalagmite:
		{fromFrame: 1602, toFrame: 2816},
		
		// Big Table (tall):
		{fromFrame: 1766, toFrame: 963},
		{fromFrame: 1767, toFrame: 964},
		{fromFrame: 1768, toFrame: 965},
		{fromFrame: 1769, toFrame: 966},
		{fromFrame: 1770, toFrame: 967},
		{fromFrame: 1771, toFrame: 968},
		
		// Small Chair:
		{fromFrame: 1764, toFrame: 969},
		{fromFrame: 1765, toFrame: 969},
		{fromFrame: 1863, toFrame: 969},
		
		// Bench:
		{fromFrame: 1685, toFrame: 975},
		{fromFrame: 1686, toFrame: 977},
		{fromFrame: 1687, toFrame: 976},
		
		// Meat Rack:
		{fromFrame: 1668, toFrame: 196},
		
		// Statue:
		{fromFrame: 1752, toFrame: 912},
		
		// Bed:
		{fromFrame: 1704, toFrame: 1131},
		{fromFrame: 1683, toFrame: 1131},
		
		// Gate:
		{fromFrame: 1586, toFrame: 132},
		
		
		// Barrel:
		{fromFrame: 1753, toFrame: 989},
		
		// Skull Statue:
		{fromFrame: 1772, toFrame: 4802},
		
		// Brazier:
		{fromFrame: 1755, toFrame: 1025},
		{fromFrame: 1840, toFrame: 1025},
		
		// Stone Chips:
		{fromFrame: 1544, toFrame: 328},
		
		// Altar (wide):
		{fromFrame: 1808, toFrame: 1047},
		{fromFrame: 1809, toFrame: 1048},
		{fromFrame: 1810, toFrame: 1049},
		
		// Altar (tall):
		{fromFrame: 1811, toFrame: 1050},
		{fromFrame: 1812, toFrame: 1051},
		{fromFrame: 1813, toFrame: 1052},
		
		// Grass:
		{fromFrame: 1539, toFrame: 323},
		
		// Bones:
		{fromFrame: 1536, toFrame: 320},
		
		// Grove Tree:
		{fromFrame: 1706, toFrame: 2432},
		
		// Fern:
		{fromFrame: 1703, toFrame: 1090},
		
		// Rocks:
		{fromFrame: 1540, toFrame: 324},
		
		// Stallagmite:
		{fromFrame: 1600, toFrame: 1088},
		
		// Big Grove Tree:
		{fromFrame: 1735, toFrame: 2433},
		{fromFrame: 1736, toFrame: 2434},
		{fromFrame: 1737, toFrame: 2435},
		{fromFrame: 1738, toFrame: 2436},
		
		// Big Pine Tree:
		{fromFrame: 1741, toFrame: 3273},
		{fromFrame: 1742, toFrame: 3274},
		{fromFrame: 1743, toFrame: 3275},
		{fromFrame: 1744, toFrame: 3276},
		
		// Palm Tree:
		{fromFrame: 1740, toFrame: 1600},
		
		// Shackles:
		{fromFrame: 1573, toFrame: 1068},
		
		// Zoo Mob:
		{fromFrame: 2017, toFrame: 72},
		
		// Tags:
		{fromFrame: 2023, toFrame: 78},
		{fromFrame: 2024, toFrame: 79},
		{fromFrame: 2025, toFrame: 80},
		{fromFrame: 2026, toFrame: 81},
		
		// Ice:
		{fromFrame: 1541, toFrame: 325},
		
		// Wall Flag:
		{fromFrame: 1575, toFrame: 931},
		
		{fromFrame: 1670, toFrame: 1091},
		
		// Big Table:
		{fromFrame: 1834, toFrame: 960},
		{fromFrame: 1835, toFrame: 961},
		{fromFrame: 1836, toFrame: 962},
		
		// Tusk:
		{fromFrame: 1841, toFrame: 911},
		
		// Standing Flag:
		{fromFrame: 1842, toFrame: 935},
		
		// Blood:
		{fromFrame: 1543, toFrame: 327},
		
		// Casket:
		{fromFrame: 1773, toFrame: 4806},
		{fromFrame: 1774, toFrame: 4807},
		{fromFrame: 1775, toFrame: 4806},
		{fromFrame: 1776, toFrame: 4807},
		
		// Small Casket:
		{fromFrame: 1696, toFrame: 4866},
		
		// Switch:
		{fromFrame: 1671, toFrame: 216},
		
		// Shelf:
		{fromFrame: 1711, toFrame: 983},
		{fromFrame: 1712, toFrame: 985},
		
		
		// Chest:
		{fromFrame: 1664, toFrame: 192},
		
		// Portal:
		{fromFrame: 1559, toFrame: 217},
		
		// Lava Spout Core:
		{fromFrame: 1828, toFrame: 2824},
		
		// Crystal Chest:
		{fromFrame: 1673, toFrame: 193},
	];
	
	this.objectManualTable = [
		1697, // Small Table
		
		1708, 1709, 1710, // Bars
		
		// Tracks:
		util.range(1888, 1899),
		
		// Pipes:
		util.range(1779, 1789),
	].flat();
	
	this.missingObjFrames = [];
	
	this.dirObjList.forEach(function (dirObj) {
		dirObj.fileList.forEach(function (fileName) {
			let name = dirObj.path + fileName;
			
			this.convertVault(name);
			
		}, this);
	}, this);
	
	// Missing obj Frames:
	for (let key in this.missingObjFrames) {
		if (this.missingObjFrames.hasOwnProperty(key)) {
			if (this.missingObjFrames[key] >= 10) {
				console.log(key + ': ' + this.missingObjFrames[key]);
			}
			
		}
	}
};

VaultConverter.getTileConversion = function (fromFrame) {
	for (let i = 0; i < this.tileTable.length; i += 1) {		
		// Frame List:
		if (typeof this.tileTable[i].fromFrame === 'object') {
			if (util.inArray(fromFrame, this.tileTable[i].fromFrame)) {
				return this.tileTable[i].toFrame;
			}
			
		}
		// Single:
		else {
			if (this.tileTable[i].fromFrame === fromFrame) {
				return this.tileTable[i].toFrame;
			}
		}
	}
	
	return null;
};

VaultConverter.getFlagConversion = function (fromFrame) {
	for (let i = 0; i < this.flagTable.length; i += 1) {
		if (this.flagTable[i].fromFrame === fromFrame) {
			return this.flagTable[i].toFrame;
		}
	}
	
	return null;
};

VaultConverter.getObjectConversion = function (fromFrame) {
	for (let i = 0; i < this.objectTable.length; i += 1) {
		if (this.objectTable[i].fromFrame === fromFrame) {
			return this.objectTable[i].toFrame;
		}
	}
	
	return null;
};

VaultConverter.convertVault = function (name) {
	let requiresManualFix = false;
	
	let data = game.cache.getJSON(name);
	
	let setFrame = function (x, y, frame) {
		data.layers[0].data[y * data.width + x] = frame + 1;
	};
	
	let setFlagFrame = function (x, y, frame) {
		data.layers[2].data[y * data.width + x] = frame + 1;
	};
	
	// Creating mising flag layer:
	if (!data.layers[2]) {
		data.layers[2] = this.createFlagLayer(data.width, data.height);
	}
	
	
	// CONVERTING_TILE_LAYER:
	// ********************************************************************************************
	for (let x = 0; x < data.width; x += 1) {
		for (let y = 0; y < data.height; y += 1) {
			// Frame from the JSON file:
			let frame = data.layers[0].data[y * data.width + x] - 1;
			
			// Empty:
			if (frame === -1) {
				continue;
			}
			
			// Manual Fix:
			if (this.tileManualTable.find(e => e === frame)) {
				requiresManualFix = true;
				continue;
			}
			
			// Replace Frame:
			let toFrame = this.getTileConversion(frame);
			if (toFrame !== null) {
				setFrame(x, y, toFrame);
			}
			else {
				console.log('TileLayerFrame: ' + frame + ', ' + name);
				return;
			}
		}
	}
	
	// CONVERTING_FLAG_LAYER:
	// ********************************************************************************************
	for (let x = 0; x < data.width; x += 1) {
		for (let y = 0; y < data.height; y += 1) {
			// Frame from the JSON file:
			let frame = data.layers[2].data[y * data.width + x] - 1;
			
			// Empty:
			if (frame === -1) {
				continue;
			}
			
			// Replace Frame:
			let toFrame = this.getFlagConversion(frame);
			if (toFrame !== null) {
				setFlagFrame(x, y, toFrame);
			}
			else {
				console.log('FlagLayerFrame: ' + frame + ', ' + name);
				return;
			}
		}
	}

	// CONVERTING_OBJECT_LAYER:
	// ********************************************************************************************
	for (let i = 0; i < data.layers[1].objects.length; i += 1) {
		let object = data.layers[1].objects[i];
		
		// Skipping no frame (insertVaultRect):
		if (!object.gid) {
			continue;
			
		}
		let frame = object.gid - 1;
		
		// Skipping tilemap frames:
		if (frame > data.tilesets[1].firstgid - 1) {
			continue;
		}
		
		// Manual Fix:
		if (this.objectManualTable.find(e => e === frame)) {
			requiresManualFix = true;
			continue;
		}
		
		let toFrame = this.getObjectConversion(frame);
		if (toFrame !== null) {
			object.gid = toFrame + 1;
		}
		else {
			if (!this.missingObjFrames['frame' + frame]) {
				this.missingObjFrames['frame' + frame] = 1;
			}
			else {
				this.missingObjFrames['frame' + frame] += 1;
			}
		}
	}
	
	// Manual Fix:
	if (requiresManualFix) {
		//console.log('Requires Manual Fix: ' + name);
	}
	
	data.tilesets[1].firstgid = 5249;
	
	if (!data.properties) {
		data.properties = {};
		data.propertytypes = {};
	}
	
	data.properties.allowRotate = false;
	data.propertytypes.allowRotate = "bool";
	
	fs.writeFileSync(this.newVaultsRoot + name, JSON.stringify(data));
};

VaultConverter.createFlagLayer = function (width, height) {
	let flagLayer = {};
	
	flagLayer.width = width;
	flagLayer.height = height;
	flagLayer.type = "tilelayer";
	flagLayer.name = "Flag Layer";
	flagLayer.opacity = 1;
	flagLayer.visible = true;
	flagLayer.x = 0;
	flagLayer.y = 0;
	
	// Data:
	flagLayer.data = [];		
	for (let i = 0; i < width * height; i += 1) {
		flagLayer.data.push(0);
	}
	
	return flagLayer;
};

VaultConverter.parseDir = function (dirObj) {
	let fileList = fs.readdirSync(path.normalize(this.oldVaultsRoot + dirObj.path));
	
	fileList.forEach(function (fileName) {
		if (this.isDir(fileName)) {
			let newDirObj  = this.createDirObj(dirObj.path + fileName + '/');
			this.parseDir(newDirObj);
		}
		else {
			dirObj.fileList.push(fileName);
		}
	}, this);
};

VaultConverter.createDirObj = function (dirPath) {
	let dirObj = {};
	
	dirObj.path = dirPath;
	dirObj.fileList = [];
	
	this.dirObjList.push(dirObj);
	
	return dirObj;
};

VaultConverter.isDir = function (fileName) {
	return path.parse(fileName).ext === '';
};