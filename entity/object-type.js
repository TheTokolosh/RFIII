/*global game, gs, util, console*/
/*global Item, TomeGenerator*/
/*global FIRE_POT_MIN_DAMAGE, FIRE_POT_MAX_DAMAGE*/
/*global GAS_POT_MIN_DAMAGE, GAS_POT_MAX_DAMAGE*/
/*global FIRE_SHROOM_MIN_DAMAGE, FIRE_SHROOM_MAX_DAMAGE*/
/*global BEAR_TRAP_MIN_DAMAGE, BEAR_TRAP_MAX_DAMAGE*/
/*global FIRE_GLYPH_MIN_DAMAGE, FIRE_GLYPH_MAX_DAMAGE*/
/*global SPIKE_TRAP_MIN_DAMAGE, SPIKE_TRAP_MAX_DAMAGE*/
/*global FIRE_VENT_MIN_DAMAGE, FIRE_VENT_MAX_DAMAGE*/
/*global GAS_VENT_MIN_DAMAGE, GAS_VENT_MAX_DAMAGE*/
/*global DANGEROUS_TERRAIN_HELP*/
/*global LOS_DISTANCE*/

/*global MAX_LEVEL, SKELETON_REVIVE_TIME, ZONE_FADE_TIME*/
/*jshint esversion: 6*/
'use strict';

var ZONE_LINE_TYPE = {
	UP_STAIRS: 'UP_STAIRS',
	DOWN_STAIRS: 'DOWN_STAIRS',
};


// CREATE_OBJECT_TYPES:
// ************************************************************************************************
gs.createObjectTypes = function () {
	this.createObjectFuncs();
	
	// Object Types:
	this.objectTypes = {
		// Control Objects:
		PCSpawnPoint:			{frame: 75, isPassable: 2, isTransparent: 1, isHidden: 1},
		SignPost:				{frame: 218, isPassable: 1, isTransparent: 1, interactFunc: 'readSignPost'}, 
		Note:					{frame: 219, isPassable: 1, isTransparent: 1, interactFunc: 'readSignPost'}, 
		WallSign:				{frame: 220, isPassable: 1, isTransparent: 1, interactFunc: 'readSignPost'}, 
		
		// Simple Doors:
		Door:					{frame: 128, isPassable: 0, isTransparent: 0, interactFunc: 'openSimpleDoor', openFrame: 160, floodExplore: true},
		WoodenBarsGate:			{frame: 836, isPassable: 0, isTransparent: 1, interactFunc: 'openSimpleDoor', openFrame: 884, niceName: 'Gate'},
		MetalBarsGate:			{frame: 1156, isPassable: 0, isTransparent: 1, interactFunc: 'openSimpleDoor', openFrame: 1204, niceName: 'Gate'},
		
		// Glyph Doors:
		GlyphDoor: 				{frame: 129, isPassable: 0, isTransparent: 0, interactFunc: 'openGlyphDoor', openFrame: 162, floodExplore: true},
		
		// Key Doors:
		KeyDoor: 				{frame: 132, isPassable: 0, isTransparent: 1, interactFunc: 'openKeyDoor', openFrame: 163},
		WoodenBarsKeyGate:		{frame: 837, isPassable: 0, isTransparent: 1, interactFunc: 'openKeyDoor', openFrame: 885, niceName: 'Key Gate'},
		
		// Timed Doors:
		TimedDoor:				{frame: 133, isPassable: 0, isTransparent: 1, interactFunc: 'openTimedDoor', updateTurn: 'timedGateUpdateTurn', activate: 'timedDoorStepOn', openFrame: 161},
		WoodenBarsTimedGate:	{frame: 838, isPassable: 0, isTransparent: 1, interactFunc: 'openTimedDoor', openFrame: 886, niceName: 'Timed Gate'},
		
		// Switch Doors:
		SwitchDoor:				{frame: 134, isPassable: 0, isTransparent: 1, interactFunc: 'openSwitchDoor', openFrame: 164},
		WoodenBarsSwitchGate:	{frame: 839, isPassable: 0, isTransparent: 1, interactFunc: 'openSwitchDoor', openFrame: 887, niceName: 'Switch Gate'},
		MetalBarsSwitchGate:	{frame: 1159, isPassable: 0, isTransparent: 1, interactFunc: 'openSwitchDoor', openFrame: 1207, niceName: 'Switch Gate'},
		Porticulus:				{frame: 855, isPassable: 0, isTransparent: 1},
								 			 
		// Fountains:
		HealthFountain:			{frame: 138, isPassable: 1, isTransparent: 1, interactFunc: 'drinkHealthFountain', emptyFrame: 170},
		EnergyFountain:			{frame: 139, isPassable: 1, isTransparent: 1, interactFunc: 'drinkEnergyFountain', emptyFrame: 170},
		ExperienceFountain:		{frame: 140, isPassable: 1, isTransparent: 1, interactFunc: 'drinkExperienceFountain', emptyFrame: 170},
		WellOfWishing:			{frame: 141, isPassable: 1, isTransparent: 1, interactFunc: 'wellOfWishing', emptyFrame: 170},
		FountainOfKnowledge:	{frame: 143, isPassable: 1, isTransparent: 1, interactFunc: 'drinkKnowledgeFountain', emptyFrame: 170},
		FountainOfGainAttribute:{frame: 142, isPassable: 1, isTransparent: 1, interactFunc: 'drinkFountainOfGainAttribute', emptyFrame: 170},
		
		// Shrines:
		ShrineOfStrength:		{frame: 348, isPassable: 1, isTransparent: 1, interactFunc: 'useShrineOfStrength', floodExplore: true},
		ShrineOfIntelligence:	{frame: 351, isPassable: 1, isTransparent: 1, interactFunc: 'useShrineOfIntelligence', floodExplore: true},
		ShrineOfDexterity:		{frame: 354, isPassable: 1, isTransparent: 1, interactFunc: 'useShrineOfDexterity', floodExplore: true},
		
		// Containers:
		Chest:					{frame: 192, isPassable: 1, isTransparent: 1, interactFunc: 'openChest', openFrame: 224},
		CrystalChest:			{frame: 193, isPassable: 1, isTransparent: 1, interactFunc: 'openCrystalChest', openFrame: 225},
		MeatRack:				{frame: 196, isPassable: 0, isTransparent: 1, interactFunc: 'meatRack', emptyFrame: 228},
		
		// Special Tables:
		EnchantmentTable:		{frame: 202, isPassable: 1, isTransparent: 1, interactFunc: 'useEnchantmentTable', emptyFrame: 234},
		TransferanceTable:		{frame: 203, isPassable: 1, isTransparent: 1, interactFunc: 'useTransferanceTable', emptyFrame: 235},
		TomeOfKnowledge:		{frame: 344, isPassable: 1, isTransparent: 1, interactFunc: 'useTomeOfKnowledge', emptyFrame: 346},
								 
		// Special Objects:
		Portal:					{frame: 217, isPassable: 2, isTransparent: 1, isDangerous: 1, interactFunc: 'portalActivate'},
		Switch:					{frame: 216, isPassable: 1, isTransparent: 1, interactFunc: 'useSwitch', emptyFrame: 244},
		
		// Trap Objects:
		FireShroom:				{frame: 260, isPassable: 2, isTransparent: 1, isDangerous: 1, activate: 'fireShroomActivate', canBurstOfFlame: true},
		HealingShroom:			{frame: 261, isPassable: 2, isTransparent: 1, activate: 'healingShroomActivate'},
		EnergyShroom:			{frame: 262, isPassable: 2, isTransparent: 1, activate: 'manaShroomActivate'},
		PitTrap:				{frame: 266, isPassable: 2, isTransparent: 1, isHidden: 1, activate: 'pitTrapActivate'},
		TeleportTrap:			{frame: 267, isPassable: 2, isTransparent: 1, isHidden: 1, activate: 'teleportTrapActivate'},
		ShockReeds:				{frame: 270, isPassable: 2, isTransparent: 1, isDangerous: 1, activate: 'shockReedsActivate'},
		BearTrap:				{frame: 271, isPassable: 2, isTransparent: 1, isDangerous: 1, activate: 'bearTrapActivate', updateTurn: 'bearTrapUpdateTurn'},
		FireVent:				{frame: 273, isPassable: 2, isTransparent: 1, isDangerous: 1, activate: 'fireVentActivate', updateTurn: 'FireVentUpdateTurn', canBurstOfFlame: true},
		SpikeTrap:				{frame: 275, isPassable: 2, isTransparent: 1, isDangerous: 1, activate: 'spikeTrapActivate', updateTurn: 'spikeTrapUpdateTurn'},
		FireGlyph:				{frame: 280, isPassable: 2, isTransparent: 1, isDangerous: 1, activate: 'fireGlyphActivate'},
		
		// Vents:
		GasVent:				{frame: 334, isPassable: 2, isTransparent: 1, isDangerous: 0, updateTurn: 'gasVentUpdateTurn'},
		FlamimgCloudVent:		{frame: 335, isPassable: 2, isTransparent: 1, isDangerous: 0, updateTurn: 'flamingCloudVentUpdateTurn'},
		FreezingCloudVent:		{frame: 336, isPassable: 2, isTransparent: 1, isDangerous: 0, updateTurn: 'freezingCloudVentUpdateTurn'},
		SteamVent:				{frame: 337, isPassable: 2, isTransparent: 1, isDangerous: 0, updateTurn: 'steamVentUpdateTurn'},
	
		
		
		// Floor Objects:
		Bones:					{frame: 320, isPassable: 2, isTransparent: 1, isUnstable: 1},
		Vine:					{frame: 321, isPassable: 2, isTransparent: 1, isUnstable: 1, isFlammable: 1},
		SpiderWeb:				{frame: 322, isPassable: 2, isTransparent: 1, isUnstable: 1, isFlammable: 1},
		LongGrass:				{frame: 323, isPassable: 2, isTransparent: 1, isUnstable: 0, isFlammable: 1},
		Rubble:					{frame: 324, isPassable: 2, isTransparent: 1, isUnstable: 1},
		Ice:					{frame: 325, isPassable: 2, isTransparent: 1, coversLiquid: 1, isUnstable: 2, isSlippery: 1},
		Obsidian:				{frame: 332, isPassable: 2, isTransparent: 1, coversLiquid: 1},
		Oil:					{frame: 326, isPassable: 2, isTransparent: 1, isUnstable: 2, isSlippery: 1, isFlammable: 1},
		Blood:					{frame: 327, isPassable: 2, isTransparent: 1},
		WaterBlood:				{frame: 327, isPassable: 2, isTransparent: 1, updateTurn: 'bloodUpdateTurn', niceName: 'Blood'},
		StoneChips:				{frame: 328, isPassable: 2, isTransparent: 1, isUnstable: 1},
		Slime:					{frame: 329, isPassable: 2, isTransparent: 1, isUnstable: 1, isSlippery: 1},
        Scrap:					{frame: 330, isPassable: 2, isTransparent: 1, isUnstable: 1},
		FlameWeb:				{frame: 331, isPassable: 2, isTransparent: 1, isUnstable: 1, isFlammable: 1, isDangerous: 1, activate: 'flameWebActivate'},
		RightConveyorBelt:		{frame: 4108, isPassable: 2, isTransparent: 1, floorLayer: 1, delta: {x: 1, y: 0}, niceName: 'Conveyor Belt'},
		LeftConveyorBelt:		{frame: 4109, isPassable: 2, isTransparent: 1, floorLayer: 1, delta: {x: -1, y: 0}, niceName: 'Conveyor Belt'},
		UpConveyorBelt:			{frame: 4110, isPassable: 2, isTransparent: 1, floorLayer: 1, delta: {x: 0, y: -1}, niceName: 'Conveyor Belt'},
		DownConveyorBelt:		{frame: 4111, isPassable: 2, isTransparent: 1, floorLayer: 1, delta: {x: 0, y: 1}, niceName: 'Conveyor Belt'},
		ClockworkHatch:			{frame: 4112, isPassable: 2, isTransparent: 1},
		CannonTurretHatch:		{frame: 4172, isPassable: 2, isTransparent: 1, npcTypeName: 'CannonTurret'},
		PyroTurretHatch:		{frame: 4173, isPassable: 2, isTransparent: 1, npcTypeName: 'PyroTurret'},
		
		// Structural Objects:
		WoodenBars:				{frame: 832, isPassable: 0, isTransparent: 1},
		MetalBars:				{frame: 1152, isPassable: 0, isTransparent: 1},
		WoodenPost:				{frame: 845, isPassable: 0, isTransparent: 0},
        StonePost:              {frame: 4829, isPassable: 0, isTransparent: 0},
		StoneArch:				{frame: 858, isPassable: 0, isTransparent: 1},
		WoodenSpikes:			{frame: 1005, isPassable: 0, isTransparent: 1},
		MetalFence:				{frame: 2948, isPassable: 0, isTransparent: 1},
		
		// Decorative Objects (Won't show name):
		WoodenCrossBeam:		{frame: 849, isPassable: 2, isTransparent: 1, objectLayer: 1, hideName: 1},
		StoneCrossBeam:			{frame: 868, isPassable: 2, isTransparent: 1, objectLayer: 1, hideName: 1},
		
		// Big Wall Objects (Facades):
		FirePlace:				{frame: 875, isPassable: 0, isTransparent: 0, isWallObject: 1},
		FirePlaceCenter:		{frame: 876, isPassable: 0, isTransparent: 0, isWallObject: 1, niceName: 'Fire Place', canBurstOfFlame: true},
		UnlitFirePlace:			{frame: 891, isPassable: 0, isTransparent: 0, isWallObject: 1},
		CaveEntrance:			{frame: 1103, isPassable: 2, isTransparent: 1, objectLayer: true, offset: {x: 0, y: 10}},
		TombEntrance:			{frame: 1605, isPassable: 2, isTransparent: 0, objectLayer: true, offset: {x: 0, y: 10}},
		SkullEntrance:			{frame: 2057, isPassable: 2, isTransparent: 1, objectLayer: true, offset: {x: 0, y: 10}},
		
		
		// Pillar-Like Objects:
		Pillar:					{frame: 896, isPassable: 0, isTransparent: 1},
		ArcanePillar:			{frame: 900, isPassable: 0, isTransparent: 1},
		Totem:					{frame: 905, isPassable: 0, isTransparent: 1},
		Tusk:					{frame: 911, isPassable: 0, isTransparent: 1},
		Statue:					{frame: 912, isPassable: 0, isTransparent: 1},
		SnakeStatue:			{frame: 1619, isPassable: 0, isTransparent: 1},
		FireObelisk:			{frame: 919, isPassable: 0, isTransparent: 1},
		ToxicObelisk:			{frame: 920, isPassable: 0, isTransparent: 1},
		StormObelisk:			{frame: 921, isPassable: 0, isTransparent: 1},
		IceObelisk:				{frame: 922, isPassable: 0, isTransparent: 1},
		YellowObelisk:			{frame: 923, isPassable: 0, isTransparent: 1},
        ArcaneObelisk:          {frame: 924, isPassable: 0, isTransparent: 1},
		Flag:					{frame: 935, isPassable: 0, isTransparent: 1},
		MinotaurStatue:			{frame: 1069, isPassable: 0, isTransparent: 1},
		WizardStatue:			{frame: 3013, isPassable: 0, isTransparent: 1},
		
		// Wall Objects:
		Torch:				{frame: 256, isPassable: 0, isTransparent: 1, canBurstOfFlame: true},
		WallFlag:			{frame: 931, isPassable: 0, isTransparent: 1},
		EyeOfYendor:		{frame: 269, isPassable: 0, isTransparent: 1, updateTurn: 'eyeOfYendorUpdateTurn'},
		
		// Main Dungeon:
		Table:				{frame: 960, isPassable: 1, isTransparent: 1},
		Stool:				{frame: 969, isPassable: 2, isTransparent: 1, isUnstable: 1},
		Chair:				{frame: 970, isPassable: 1, isTransparent: 1},
		Throne:				{frame: 971, isPassable: 1, isTransparent: 1},
		Bench:				{frame: 975, isPassable: 2, isTransparent: 1, isUnstable: 1},
		Shelf:				{frame: 983, isPassable: 0, isTransparent: 1},
		Barrel:				{frame: 989, isPassable: 1, isTransparent: 1},
		Crate:				{frame: 990, isPassable: 0, isTransparent: 1},
		PracticeDummy:		{frame: 1003, isPassable: 0, isTransparent: 1},
		ArcheryTarget:		{frame: 1004, isPassable: 0, isTransparent: 1},			 
		Stock:				{frame: 1067, isPassable: 0, isTransparent: 1},				 
		Shackles:			{frame: 1068, isPassable: 0, isTransparent: 1},
		Bed:				{frame: 1131, isPassable: 1, isTransparent: 1},
		Furnace:            {frame: 1132, isPassable: 0, isTransparent: 1, canBurstOfFlame: true},
		UnlitFurnace:       {frame: 1146, isPassable: 0, isTransparent: 1},
		BearSkin:			{frame: 1133, isPassable: 1, isTransparent: 1},
		UnlitBrazier:		{frame: 1024, isPassable: 1, isTransparent: 1},
		Brazier:			{frame: 1025, isPassable: 1, isTransparent: 1, canBurstOfFlame: true},
		BlueBrazier:		{frame: 1026, isPassable: 1, isTransparent: 1, canBurstOfFlame: true},
		GoblinShrine:		{frame: 1033, isPassable: 0, isTransparent: 1},
		StatueOfGrimrot:	{frame: 1039, isPassable: 0, isTransparent: 1},
		Altar:				{frame: 1047, isPassable: 1, isTransparent: 1},
		BookShelf:			{frame: 1135, isPassable: 0, isTransparent: 1},
		Bar:				{frame: 978, isPassable: 1, isTransparent: 1},
		ShieldedAltar:		{frame: 407, isPassable: 1, isTransparent: 1},
		
		// CAVE_OBJECTS:
		Tent:				{frame: 1097, isPassable: 0, isTransparent: 1},
		Fern:				{frame: 1090, isPassable: 1, isTransparent: 1, isFlammable: 1},
		CampFire:			{frame: 1091, isPassable: 1, isTransparent: 1, updateTurn: 'campFireUpdateTurn', canBurstOfFlame: true},
		UnlitCampFire:		{frame: 1147, isPassable: 1, isTransparent: 1},
		
		Tree:				{frame: 2432, isPassable: 0, isTransparent: 1},
		WaterTree:			{frame: 2055, isPassable: 0, isTransparent: 1},
		Cactus:				{frame: 1601, isPassable: 0, isTransparent: 1},
		TikiTorch:			{frame: 2050, isPassable: 0, isTransparent: 1, canBurstOfFlame: true},
		UnlitTikiTorch:		{frame: 2107, isPassable: 0, isTransparent: 1},
		Stalagmite:			{frame: 1088, isPassable: 0, isTransparent: 1},
		WaterStalagmite:	{frame: 1089, isPassable: 0, isTransparent: 1},
		
		// THE_CORE:
		StoneLavaSpout:		{frame: 2824, isPassable: 0, isTransparent: 1},
		
		// THE_SEWERS:
		Pipe:				{frame: 3712, isPassable: 1, isTransparent: 1},
		SlimeTank:			{frame: 3731, isPassable: 0, isTransparent: 1},
		WallGrate:			{frame: 3672, isPassable: 0, isTransparent: 1, offset: {x: 0, y: 8}},
		
		// THE_DARK_TEMPLE:
		SpiderShrine:		{frame: 3010, isPassable: 0, isTransparent: 1},
		
		// THE_IRON_FORGE:
		GasLamp:			{frame: 4033, isPassable: 0, isTransparent: 1},
		MetalLavaSpout:		{frame: 4051, isPassable: 0, isTransparent: 1},
		OilTank:			{frame: 4035, isPassable: 0, isTransparent: 1},
       	LavaTank:			{frame: 4041, isPassable: 0, isTransparent: 1},
		
		// THE_ARCANE_TOWER:
		StepLadder:			{frame: 4483, isPassable: 1, isTransparent: 1},
		UnfinishedGolem:	{frame: 4481, isPassable: 0, isTransparent: 1},
		StoneBlocks:		{frame: 4482, isPassable: 1, isTransparent: 1},
		
		// THE_CRYPT:
		Casket:				{frame: 4866, isPassable: 1, isTransparent: 1},
		TombStone:			{frame: 4864, isPassable: 1, isTransparent: 1},
		SkullStatue:		{frame: 4865, isPassable: 0, isTransparent: 1},
		SkeletonPlinth:		{frame: 4884, isPassable: 1, isTransparent: 1},
		Candle:				{frame: 4803, isPassable: 0, isTransparent: 1, canBurstOfFlame: true},
		UnlitCandle:		{frame: 4863, isPassable: 0, isTransparent: 1},
		
		// Timer Objects:
		Bomb:				{frame: 385, isPassable: 2, isTransparent: 1, updateTurn: 'bombUpdateTurn', stopTurn: true},
		IceBomb:			{frame: 386, isPassable: 1, isTransparent: 1, updateTurn: 'IceBombUpdateTurn', stopTurn: true},
		BoneBomb:			{frame: 392, isPassable: 1, isTransparent: 1, updateTurn: 'BoneBombUpdateTurn', stopTurn: true},
		SkeletonCorpse:		{frame: 387, isPassable: 2, isTransparent: 1, updateTurn: 'skeletonUpdateTurn', isUnstable: 1},
		LightningRod:		{frame: 384, isPassable: 0, isTransparent: 1, updateTurn: 'lightningRodUpdateTurn'},
		FireCrossGlyph:		{frame: 388, isPassable: 2, isTransparent: 1, updateTurn: 'fireCrossGlyphUpdateTurn', stopTurn: true},
		ShockCrossGlyph:	{frame: 390, isPassable: 2, isTransparent: 1, updateTurn: 'fireCrossGlyphUpdateTurn', stopTurn: true},
		
		// Tracks:
		Track:				{frame: 4096, isPassable: 2, isTransparent: 1, coversLiquid: 1},
		
		// Zone Lines:
		DownStairs:				{frame: 152, 	isPassable: 2, isTransparent: 1, zoneLineType: ZONE_LINE_TYPE.DOWN_STAIRS},
		UpStairs:				{frame: 153, 	isPassable: 2, isTransparent: 1, zoneLineType: ZONE_LINE_TYPE.UP_STAIRS},
		OneWayDownStairs:		{frame: 154,	isPassable: 1, isTransparent: 1, zoneLineType: ZONE_LINE_TYPE.DOWN_STAIRS, oneWay: true},
		OneWayUpStairs:			{frame: 155,	isPassable: 1, isTransparent: 1, oneWay: true},
		
		// Zone Stairs (Part of a 3x1 Facade):
		SewerEntranceStairs:	{frame: 3777,	isPassable: 0, isTransparent: 1, zoneLineType: ZONE_LINE_TYPE.DOWN_STAIRS, interactFunc: 'useZoneLine', offset: {x: 0, y: 10}},
		CoreEntranceStairs:		{frame: 2850,	isPassable: 0, isTransparent: 1, zoneLineType: ZONE_LINE_TYPE.DOWN_STAIRS, interactFunc: 'useZoneLine', offset: {x: 0, y: 10}},
		IceCavesEntranceStairs:	{frame: 3298,	isPassable: 0, isTransparent: 1, zoneLineType: ZONE_LINE_TYPE.DOWN_STAIRS, interactFunc: 'useZoneLine', offset: {x: 0, y: 10}},
		YendorEntranceStairs:	{frame: 5122,	isPassable: 0, isTransparent: 1, zoneLineType: ZONE_LINE_TYPE.DOWN_STAIRS, interactFunc: 'useYendorGate', offset: {x: 0, y: 10}},
		
		CryptEntranceStairs:	{frame: 4877,	isPassable: 0, isTransparent: 1, zoneLineType: ZONE_LINE_TYPE.DOWN_STAIRS, interactFunc: 'useZoneLine', offset: {x: 0, y: 0}},

		
		// Zone Stairs 3x1 Facade:
		SewerEntrance:			{frame: 3776, 	isPassable: 0, isTransparent: 1, objectLayer: true, offset: {x: 0, y: 10}},
		CoreEntrance:			{frame: 2849, 	isPassable: 0, isTransparent: 1, objectLayer: true, offset: {x: 0, y: 10}},
		IceCavesEntrance:		{frame: 3297, 	isPassable: 0, isTransparent: 1, objectLayer: true, offset: {x: 0, y: 10}},
		YendorEntrance:			{frame: 5121, 	isPassable: 0, isTransparent: 1, objectLayer: true, offset: {x: 0, y: 10}},
		CryptEntrance:			{frame: 4875, 	isPassable: 0, isTransparent: 1, objectLayer: true, offset: {x: 0, y: 0}},
		
		// MISC:
		Corpse:					{frame: 398, isPassable: 1, isTransparent: 1}
	};
	
	// canOverWrite:
	// Abilities that create objects (like webs) can overwrite these objects:
	this.objectTypes.Bones.canOverWrite = true;
	this.objectTypes.Vine.canOverWrite = true;
	this.objectTypes.SpiderWeb.canOverWrite = true;
	this.objectTypes.LongGrass.canOverWrite = true;
	this.objectTypes.Rubble.canOverWrite = true;
	this.objectTypes.Ice.canOverWrite = true;
	this.objectTypes.Oil.canOverWrite = true;
	this.objectTypes.Blood.canOverWrite = true;
	this.objectTypes.StoneChips.canOverWrite = true;
	this.objectTypes.Slime.canOverWrite = true;
	this.objectTypes.Scrap.canOverWrite = true;
	this.objectTypes.FlameWeb.canOverWrite = true;
	this.objectTypes.TeleportTrap.canOverWrite = true;
	this.objectTypes.PitTrap.canOverWrite = true;
	
	// Open Frames:
	this.objectTypes.MetalBarsSwitchGate.openFrames = [
		{f1: 1159, f2: 1207}, // Upper Dungeon (default)
		{f1: 4493, f2: 4543}, // The Arcane Tower
	];
	this.objectTypes.MetalBarsGate.openFrames = [
		{f1: 4872, f2: 4924}, // TheCrypt
		{f1: 2973, f2: 3007},
		
	];
	this.objectTypes.Door.openFrames = [
		{f1: 128, f2: 160}, // Left Door
		{f1: 130, f2: 159}, // Right Door
		{f1: 145, f2: 160}, // Left Triple Door
		{f1: 146, f2: 158}, // Middle Triple Door
		{f1: 147, f2: 159}, // Right Triple Door
	];
	

	// Frames:
	this.objectTypes.ShieldedAltar.frames = [
		407, 408, 409
	];
	this.objectTypes.MetalFence.frames = [
		2948, 2949, 2950
	];
	this.objectTypes.ShrineOfStrength.frames = [
		348, 349, 350,
	];
	this.objectTypes.ShrineOfIntelligence.frames = [
		351, 352, 353,
	];
	this.objectTypes.ShrineOfDexterity.frames = [
		354, 355, 356,
	];
	this.objectTypes.Door.frames = [
		128, 130, 
		145, 146, 147 // Triple Door
	];
	this.objectTypes.StepLadder.frames = [
		4483, 4484
	];
	this.objectTypes.MetalBarsGate.frames = [
		4872, // The-Crypt
		2973, // The-Dark-Temple
		
	];
	this.objectTypes.MetalBarsSwitchGate.frames = [
		1159, // Upper Dungeon (default)
		4493, // The Arcane Tower
	];
	this.objectTypes.BookShelf.frames = [
		983, 984, 985, // Empty
		4486, 4487, 4488, // Books
	];
	this.objectTypes.Bar.frames = [
		978, 979, 980
	];
	this.objectTypes.Porticulus.frames =[855, 856, 857];
	this.objectTypes.WoodenBars.frames = [832, 833, 834];
	this.objectTypes.MetalBars.frames = [
		1152, 1153, 1154, // Upper Dungeon (default)
		4490, 4491, 4492, // The Arcane Tower
		4868, 4869, 4870, // The Crypt
		2970, 2971, 2972, // The-Dark-Temple
	];
	this.objectTypes.WoodenPost.frames = [
		[845, 846, 847, 848],
		[3795, 3796] // The Sewers
	].flat();
	this.objectTypes.StonePost.frames = [
		[4496, 4497],			// The Arcane Tower
		[4829, 4830], 			// The Crypt
		util.range(2951, 2958), // The Dark Temple
		[4115, 4116], 			// The Iron Forge
	].flat();
	this.objectTypes.StoneArch.frames = [
		util.range(858, 865),
		[3780, 3781]
	].flat();
	this.objectTypes.WoodenCrossBeam.frames = [
		util.range(849, 852),  
		util.range(3797, 3800), // The Sewers
	].flat();
	this.objectTypes.StoneCrossBeam.frames = [
		util.range(868, 871),
		util.range(3782, 3783), 	// The Sewers
		util.range(4831, 4835), 	// The Crypt
		util.range(2959, 2966), 	// The Dark Temple
		[4117, 4118], 				// The Iron Forge
		[4498, 4499, 4500, 4501],	// The Arcane Tower
		
	].flat();
	this.objectTypes.FirePlace.frames = [875, 877];
	this.objectTypes.CaveEntrance.frames = [
		[1103, 1104, 1105], // Main Dungeon
		[1602, 1603, 1604], // Sunless Desert
		[2818, 2819, 2820], // The Core
		[3266, 3267, 3268], // Ice Cave
	].flat();
	this.objectTypes.Tusk.frames = [911, 952];
	this.objectTypes.TombEntrance.frames = util.range(1605, 1611);
	this.objectTypes.SkullEntrance.frames = util.range(2057, 2062);
	this.objectTypes.Pillar.frames = [896, 1618, 3784, 4032, 4480, 4800, 5120, 2944];
	this.objectTypes.ArcanePillar.frames = [900, 901, 902, 903, 950, 951, 3008, 4549, 4550, 4551];
	this.objectTypes.Totem.frames = [905, 906, 907, 908, 948, 949, 4801];
	this.objectTypes.Statue.frames = [912, 2056];
	this.objectTypes.Flag.frames = util.range(935, 947);
	this.objectTypes.WallFlag.frames = [931, 932, 4544, 4545, 4546, 4547, 4548];
	this.objectTypes.Table.frames = [util.range(960, 968), util.range(1027, 1032), 1092, 1093, 1094, 972, 973, 974, 1036, 1037, 1038].flat();
	this.objectTypes.Bench.frames = [975, 976, 977];
	this.objectTypes.Shelf.frames = [983, 984, 985];
	this.objectTypes.Crate.frames = [990, 991, 992, 993];
	this.objectTypes.BearSkin.frames = [1133, 1134];
	this.objectTypes.GoblinShrine.frames = [1033, 1034, 1035];
	this.objectTypes.SpiderShrine.frames = [3010, 3011, 3012];
	this.objectTypes.StatueOfGrimrot.frames = util.range(1039, 1044);
	this.objectTypes.Altar.frames = util.range(1047, 1052);
	this.objectTypes.Tent.frames = [
		343, 345, // Tome of Knowledge
		util.range(1097, 1102), // Main Dungeon
		util.range(1612, 1617), // Sunless Desert
	].flat();
	this.objectTypes.Tree.frames = [
		[2432, 2054, 3272, 1600], // Single Trees
		util.range(2433, 2436), // Under Grove Big Tree
		util.range(3273, 3276), // Ice Cave Big Tree
	].flat();
	this.objectTypes.Stalagmite.frames = [1088, 2048, 2816, 3264, 1664];
	this.objectTypes.WaterStalagmite.frames = [1089, 2049];
	this.objectTypes.Pipe.frames = util.range(3712, 3724);
	this.objectTypes.SlimeTank.frames = [3731, 3732];
	this.objectTypes.WallGrate.frames = util.range(3672, 3676);
	this.objectTypes.OilTank.frames = util.range(4035, 4040);
	this.objectTypes.LavaTank.frames = util.range(4041, 4044);
	this.objectTypes.Casket.frames = util.range(4804, 4809);
	this.objectTypes.SkullStatue.frames = [1772, 1798, 4802, 3789, 3009];
	this.objectTypes.SkeletonPlinth.frames = [
		util.range(4884, 4885), 
		878, 879, 880, // Wall Plinth (Dungeon)
		4820, 4821, 4822, // Wall Plinth (Crypt)
		4823, 4824, 4825, // Empty Wall Plinth
	].flat();
	this.objectTypes.Track.frames = util.range(4096, 4107);
	this.objectTypes.SewerEntrance.frames = [3776, 3778];
	this.objectTypes.CoreEntrance.frames = [2849, 2851];
	this.objectTypes.IceCavesEntrance.frames = [3297, 3299];
	this.objectTypes.YendorEntrance.frames = [5121, 5123];
	this.objectTypes.CryptEntrance.frames = [4875, 4876, 4878, 4879, 4813];
	
	// Animations:
	this.objectTypes.Torch.anim 			= util.range(288, 291);
	this.objectTypes.FireShroom.anim 		= util.range(292, 293);
	this.objectTypes.HealingShroom.anim 	= util.range(294, 295);
	this.objectTypes.EnergyShroom.anim 		= util.range(296, 297);
	this.objectTypes.ShockReeds.anim 		= util.range(298, 301);
	this.objectTypes.StoneLavaSpout.anim 	= util.range(2876, 2879);
	this.objectTypes.TikiTorch.anim 		= util.range(2108, 2111);
	this.objectTypes.GasLamp.anim 			= util.range(4094, 4095);
	this.objectTypes.MetalLavaSpout.anim 	= util.range(4090, 4093);
	this.objectTypes.CampFire.anim			= util.range(1148, 1151);
	this.objectTypes.FirePlaceCenter.anim	= util.range(892, 895);
	this.objectTypes.Brazier.anim 			= util.range(1084, 1087);
	this.objectTypes.BlueBrazier.anim		= util.range(1080, 1083);
	this.objectTypes.Candle.anim			= util.range(4860, 4862);
	
	this.objectTypes.RightConveyorBelt.anim	= util.range(4150, 4159);
	this.objectTypes.LeftConveyorBelt.anim	= util.range(4214, 4223);
	this.objectTypes.DownConveyorBelt.anim	= util.range(4278, 4287);
	this.objectTypes.UpConveyorBelt.anim	= util.range(4342, 4351);
	
	
	// Sync Anims:
	// Animations on the map will have same frames
	this.objectTypes.RightConveyorBelt.syncAnim = true;
	this.objectTypes.LeftConveyorBelt.syncAnim = true;
	this.objectTypes.UpConveyorBelt.syncAnim = true;
	this.objectTypes.DownConveyorBelt.syncAnim = true;
	
	
	// Reflections:
	this.objectFrameReflections = [
		// Casket:
		{f1: 4806, f2: 4807},
		
		// Altar (table):
		{f1: 1047, f2: 1049},
		
		// Table:
		{f1: 960, f2: 962},
	];
	
	this.objectFrameRotations = [
		// Casket:
		{f1: 4806, f2: 4809},
		{f1: 4807, f2: 4808},
		
		// Altar (table):
		{f1: 1047, f2: 1052},
		{f1: 1048, f2: 1051},
		{f1: 1049, f2: 1050},
		
		// Table:
		{f1: 960, f2: 1094},
		{f1: 961, f2: 1093},
		{f1: 962, f2: 1092}
	];
	
	this.objectTypeRotations = [
		{typeName1: 'RightConveyorBelt', typeName2: 'DownConveyorBelt'},
		{typeName1: 'DownConveyorBelt', typeName2: 'LeftConveyorBelt'},
		{typeName1: 'LeftConveyorBelt', typeName2: 'UpConveyorBelt'},
		{typeName1: 'UpConveyorBelt', typeName2: 'RightConveyorBelt'},
	];
											 
	// Set Default Properties:
	this.nameTypes(this.objectTypes);
	this.forEachType(this.objectTypes, function (type) {
		// Interact:
		if (type.interactFunc) {
			type.interactFunc = this.objectFuncs[type.interactFunc];
		}
		
		// Activate:
		if (type.activate) {
			type.activate = this.objectFuncs[type.activate];
		}
		
		// Update Turn:
		if (type.updateTurn) {
			type.updateTurn = this.objectFuncs[type.updateTurn];
		}
        
        //onTrigger:
        if (type.onTrigger) {
            type.onTrigger = this.objectFuncs[type.onTrigger];
        }
	}, this);

	// Object Descriptions:
	this.objectTypes.LongGrass.desc = 'Ignites and spreads fire.';
	this.objectTypes.FireShroom.desc = 'Dangerous mushrooms which explode in a burst of fire when stepped on.\n\n' + DANGEROUS_TERRAIN_HELP;
	this.objectTypes.ShockReeds.desc = 'Dangerous reeds which will shock when stepped on.\n\n' + DANGEROUS_TERRAIN_HELP;
	this.objectTypes.HealingShroom.desc = 'Pick them to eat later and restore your hit points.';
	this.objectTypes.EnergyShroom.desc = 'Pick them to eat later and restore your mana points.';
	this.objectTypes.FlameWeb.desc = 'Unstable Terrain: Physical attacks against unstable characters are always criticals.\n\n' + DANGEROUS_TERRAIN_HELP;
	this.objectTypes.EyeOfYendor.desc = 'It seems to be watching you...';
	this.objectTypes.FireGlyph.desc = DANGEROUS_TERRAIN_HELP;
	this.objectTypes.SpikeTrap.desc = DANGEROUS_TERRAIN_HELP;

	let UNSTABLE_TERRAIN = 'Unstable Terrain: Physical attacks against unstable characters are always criticals.';
	this.objectTypes.Vine.desc = UNSTABLE_TERRAIN;
	this.objectTypes.Bones.desc = UNSTABLE_TERRAIN;
	this.objectTypes.SpiderWeb.desc = UNSTABLE_TERRAIN;
	this.objectTypes.Rubble.desc = UNSTABLE_TERRAIN;
	this.objectTypes.Scrap.desc = UNSTABLE_TERRAIN;
	this.objectTypes.StoneChips.desc = UNSTABLE_TERRAIN;
	this.objectTypes.Ice.desc = UNSTABLE_TERRAIN + '\n\nSlippery: Knockback when taking damage.';
	this.objectTypes.Oil.desc = UNSTABLE_TERRAIN + '\n\nSlippery: Knockback when taking damage.';
	

		
	// Interactive Objects:
	this.objectTypes.HealthFountain.desc = 'Completely restores your hit points.';
	this.objectTypes.EnergyFountain.desc = 'Completely restores your mana and speed points.';
	this.objectTypes.FountainOfKnowledge.desc = 'Grants +1 Talent points.';
};

// REFLECT_OBJECT_FRAME:
// ************************************************************************************************
gs.reflectObjectFrame = function (frame) {
	var e;
	
	e = this.objectFrameReflections.find(e => e.f1 === frame);
	if (e) {
		return e.f2;
	}
	
	e = this.objectFrameReflections.find(e => e.f2 === frame);
	if (e) {
		return e.f1;
	}
	
	return frame;
};

// ROTATE_OBJECT_TYPE:
// ************************************************************************************************
gs.rotateObjectType = function (object) {	
	let rotation = this.objectTypeRotations.find(e => e.typeName1 === object.type.name);
		
	if (rotation) {
		let objectType = gs.objectTypes[rotation.typeName2];
		object.type = objectType;
		object.typeFrame = objectType.frame;
		object.frame = objectType.frame;
	}
	
};

// ROTATE_OBJECT_FRAME:
// ************************************************************************************************
gs.rotateObjectFrame = function (frame) {
	var e;
	
	e = this.objectFrameRotations.find(e => e.f1 === frame);
	if (e) {
		return e.f2;
	}
	
	e = this.objectFrameRotations.find(e => e.f2 === frame);
	if (e) {
		return e.f1;
	}
	
	return frame;
};


gs.getTrapDamage = function (trapTypeName) {
	if (trapTypeName === 'BearTrap') {
		return gs.getScaledTrapDamage(BEAR_TRAP_MIN_DAMAGE, BEAR_TRAP_MAX_DAMAGE);
	}
	else if (trapTypeName === 'SpikeTrap') {
		return gs.getScaledTrapDamage(SPIKE_TRAP_MIN_DAMAGE, SPIKE_TRAP_MAX_DAMAGE);
	}
	else if (trapTypeName === 'FireVent') {
		return gs.getScaledTrapDamage(FIRE_VENT_MIN_DAMAGE, FIRE_VENT_MAX_DAMAGE);
	}
	else if (trapTypeName === 'FireShroom') {
		return gs.getScaledTrapDamage(FIRE_SHROOM_MIN_DAMAGE, FIRE_SHROOM_MAX_DAMAGE);
	}
	else if (trapTypeName === 'ShockReeds') {
		return Math.ceil(gs.getScaledTrapDamage(FIRE_SHROOM_MIN_DAMAGE, FIRE_SHROOM_MAX_DAMAGE) * 0.75);
	}
	else if (trapTypeName === 'FlameWeb') {
		return Math.ceil(gs.getScaledTrapDamage(FIRE_SHROOM_MIN_DAMAGE, FIRE_SHROOM_MAX_DAMAGE) / 2);
	}
	else if (trapTypeName === 'FireGlyph') {
		return gs.getScaledTrapDamage(FIRE_GLYPH_MIN_DAMAGE, FIRE_GLYPH_MAX_DAMAGE);
	}
	else if (trapTypeName === 'PoisonGas') {
		return gs.getScaledTrapDamage(GAS_VENT_MIN_DAMAGE, GAS_VENT_MAX_DAMAGE);
	}
	else if (trapTypeName === 'FirePot') {
		return gs.getScaledTrapDamage(FIRE_POT_MIN_DAMAGE, FIRE_POT_MAX_DAMAGE);
	}
	else if (trapTypeName === 'GasPot') {
		return gs.getScaledTrapDamage(GAS_POT_MIN_DAMAGE, GAS_POT_MAX_DAMAGE);	
	}
	else {
		return 0;
	}
};

// GET_SCALED_TRAP_DAMAGE:
// ************************************************************************************************
gs.getScaledTrapDamage = function (min, max, DL) {
	DL = DL || gs.dangerLevel();
	
	return Math.ceil(min + (DL - 1) * ((max - min) / (MAX_LEVEL - 1)));
};