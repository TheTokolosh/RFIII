/*global gs, game, util*/
/*global PlayerTargeting*/
/*global TILE_SIZE, LOS_DISTANCE, PROJECTILE_SPEED*/
/*global GREEN_TARGET_BOX_FRAME, PURPLE_SELECT_BOX_FRAME, RED_SELECT_BOX_FRAME*/
/*global GREEN_BOX_FRAME, PURPLE_BOX_FRAME, RED_BOX_FRAME*/
/*global FACTION*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// CREATE_ABILITY_HELPERS:
// ************************************************************************************************
gs.createAbilityHelpers = function () {
	this.createAbilityRange();
	this.createAbilityShowTarget();
	this.createAbilityCanUse();
	this.createAbilityCanUseOn();
	this.createAbilityGetTarget();
};

// CREATE_ABILITY_RANGE:
// ************************************************************************************************
gs.createAbilityRange = function () {
	this.abilityRange = {};
	
	// WEAPON:
	// Use the range of the characters currently equipped weapon
	// ********************************************************************************************
	this.abilityRange.Weapon = function () {
		return gs.pc.weaponRange();
	};
	
	// RANGE_WEAPON:
	// ********************************************************************************************
	this.abilityRange.RangeWeapon = function () {
		return gs.pc.weaponRange(gs.pc.inventory.getRangeWeapon());
	};
};

// CREATE_ABILITY_SHOW_TARGET:
// ************************************************************************************************
gs.createAbilityShowTarget = function () {
	this.abilityShowTarget = {};
	
	// SELF_TARGET:
	// ********************************************************************************************
	gs.abilityShowTarget.SelfTarget = function (targetTileIndex) {
		gs.targetSprites.create(gs.pc.tileIndex, PURPLE_SELECT_BOX_FRAME);
	};

	// SINGLE_TARGET:
	// ********************************************************************************************
	gs.abilityShowTarget.SingleTarget = function (targetTileIndex) {
		// Valid Target:
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			gs.targetSprites.create(targetTileIndex, PURPLE_SELECT_BOX_FRAME);
		}
		// Invalid Target:
		else {
			gs.targetSprites.create(targetTileIndex, RED_SELECT_BOX_FRAME);
			gs.showTargetLine(targetTileIndex);
		}
	};
	
	// PATH:
	// ********************************************************************************************
	gs.abilityShowTarget.Path = function (targetTileIndex) {
		var path;
		
		// Valid Target:
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			path = gs.pc.getPathTo(targetTileIndex, true);
		
			if (path && path.length > 0) {
				path.forEach(function (tileIndex, i) {
					if (i === 0) {
						gs.targetSprites.create(tileIndex, PURPLE_SELECT_BOX_FRAME);
					}
					else {
						gs.targetSprites.create(tileIndex, PURPLE_BOX_FRAME);
					}
				}, this);
			}
		}
		// Invalid Target:
		else {
			gs.targetSprites.create(targetTileIndex, RED_SELECT_BOX_FRAME);
		}
	};
	
	
	// TARGET_BASED_AOE:
	// ********************************************************************************************
	gs.abilityShowTarget.TBAoE = function (targetTileIndex) {
		var indexList;
		
		// Valid Target:
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			indexList = gs.getIndexListInRadius(targetTileIndex, this.aoeRange(gs.pc));
			indexList = indexList.filter(index => gs.isStaticProjectilePassable(index));
			
			indexList.forEach(function (index) {
				if (util.vectorEqual(targetTileIndex, index)) {
					gs.targetSprites.create(index, PURPLE_SELECT_BOX_FRAME);
				}
				else {
					gs.targetSprites.create(index, PURPLE_BOX_FRAME);
				}
			}, this);
		}
		// Invalid Target:
		else {
			gs.targetSprites.create(targetTileIndex, RED_SELECT_BOX_FRAME);
			gs.showTargetLine(targetTileIndex);
		}
	};
	
	// BOLT:
	// ********************************************************************************************
	gs.abilityShowTarget.Bolt = function (targetTileIndex) {
		var indexList, frame, endFrame;
		
		// Valid Target:
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			frame = PURPLE_BOX_FRAME;
			endFrame = PURPLE_SELECT_BOX_FRAME;
		}
		// Invalid Target:
		else {
			frame = RED_BOX_FRAME;
			endFrame = RED_SELECT_BOX_FRAME;
		}
			
		indexList = gs.getIndexInBRay(gs.pc.tileIndex, targetTileIndex);

		indexList.forEach(function (index) {
			if (util.vectorEqual(targetTileIndex, index)) {
				gs.targetSprites.create(index, endFrame);
			}
			else {
				gs.targetSprites.create(index, frame);
			}
		}, this);
	};

	// POINT_BLANK_AOE:
	// ********************************************************************************************
	gs.abilityShowTarget.PBAoE = function (targetTileIndex) {
		var indexList = gs.getIndexListInRadius(gs.pc.tileIndex, this.aoeRange(gs.pc));
		
		indexList.forEach(function (index) {
			if (this.canUseOn(gs.pc, index)) {
				if (gs.getChar(index)) {
					gs.targetSprites.create(index, PURPLE_SELECT_BOX_FRAME);
				}
				else {
					gs.targetSprites.create(index, PURPLE_BOX_FRAME);
				}
			}
		}, this);
	};
	
	// LINE_OF_SIGHT:
	// ********************************************************************************************
	gs.abilityShowTarget.LoS = function () {
		gs.liveCharacterList().forEach(function (character) {
			if (gs.getTile(character.tileIndex).visible && character.isAlive && character.faction === FACTION.HOSTILE && this.canUseOn(gs.pc, character.tileIndex)) {
				gs.targetSprites.create(character.tileIndex, PURPLE_SELECT_BOX_FRAME);
			}	
		}, this);
	};

	// BOX:
	// ********************************************************************************************
	gs.abilityShowTarget.Box = function (targetTileIndex, width, height) {
		var indexList = gs.getIndexListInBox(targetTileIndex.x, targetTileIndex.y, targetTileIndex.x + width, targetTileIndex.y + height);
			
		indexList.forEach(function (index) {
			if (gs.isPassable(index) || gs.getChar(index)) {
				gs.targetSprites.create(index, PURPLE_SELECT_BOX_FRAME);				
			}
		}, this);
	};
	
	// BURST_OF_FLAME:
	// ********************************************************************************************
	this.abilityShowTarget.BurstOfFlame = function (targetTileIndex) {		
		// Can Use:
		if (this.canUseOn(gs.pc, targetTileIndex)) {
			// Burst Target:
			if (gs.canBurstOfFlame(targetTileIndex)) {
				// Target:
				gs.targetSprites.create(targetTileIndex, PURPLE_SELECT_BOX_FRAME);
				
				// Burst Target:
				this.getIndexList(gs.pc, targetTileIndex).forEach(function (tileIndex) {
					gs.targetSprites.create(tileIndex, PURPLE_BOX_FRAME);
				}, this);
			}
			// Single target:
			else {
				gs.abilityShowTarget.SingleTarget.call(this, targetTileIndex);
			}
		}
		// Cannot Use (show red invalid target):
		else {
			gs.targetSprites.create(targetTileIndex, RED_SELECT_BOX_FRAME);
			gs.showTargetLine(targetTileIndex);
		}
	};
	

	
	// FAN:
	// ********************************************************************************************
	this.abilityShowTarget.Fan = function (targetTileIndex) {
		var delta, indexList;
		
		delta = util.get8WayVector(gs.pc.tileIndex, targetTileIndex);
		indexList = gs.getIndexInFan(gs.pc.tileIndex, this.aoeRange(gs.pc), delta);
		
		let firstTileIndex = {x: gs.pc.tileIndex.x + delta.x, y: gs.pc.tileIndex.y + delta.y};
		if (!gs.isStaticProjectilePassable(firstTileIndex)) {
			gs.targetSprites.create(firstTileIndex, RED_SELECT_BOX_FRAME);
			return;
		}
		
		indexList.forEach(function (index) {
			if (gs.isRayBeamPassable(gs.pc.tileIndex, index)) {
				if (util.distance(index, gs.pc.tileIndex) < 1.5) {
					gs.targetSprites.create(index, PURPLE_SELECT_BOX_FRAME);
				}
				else {
					gs.targetSprites.create(index, PURPLE_BOX_FRAME);
				}
			}
		}, this);
	};
	
	// TUNNEL_SHOT:
	// ************************************************************************************************
	this.abilityShowTarget.TunnelShot = function (targetTileIndex) {
		// Invalid Target:
		if (!this.canUseOn(gs.pc, targetTileIndex)) {
			gs.targetSprites.create(targetTileIndex, RED_SELECT_BOX_FRAME);
			gs.showTargetLine(targetTileIndex);
			return;
		}
		
		// Show Target Cursor:
		gs.targetSprites.create(targetTileIndex, PURPLE_SELECT_BOX_FRAME);
		
		
		
		
		let startPos = util.toPosition(gs.pc.tileIndex),
			endPos = util.toPosition(targetTileIndex),
			normal = util.normal(startPos, endPos),
			pos = startPos,
			distance = 0,
			charList = [];
		
		while (distance <= this.range() * TILE_SIZE) {
			let tileIndex = util.toTileIndex(pos);
			
			if (!util.vectorEqual(tileIndex, gs.pc.tileIndex)) {
				if (gs.getChar(tileIndex) && !util.inArray(gs.getChar(tileIndex), charList)) {
					charList.push(gs.getChar(tileIndex));
				}
			}
			
			pos.x += normal.x * PROJECTILE_SPEED;
			pos.y += normal.y * PROJECTILE_SPEED;
			distance += PROJECTILE_SPEED;
		}
		
		charList.forEach(function (char) {
			gs.targetSprites.create(char.tileIndex, PURPLE_SELECT_BOX_FRAME);
		}, this);
	};
};

// CREATE_ABILITY_CAN_USE:
// ************************************************************************************************
gs.createAbilityCanUse = function () {
	this.abilityCanUse = {};
	
	// SHIELD:
	// ********************************************************************************************
	this.abilityCanUse.Shield = function (actingChar) {
		return actingChar.inventory.hasShieldEquipped();
	};
	
	// MELEE_WEAPON:
	// ********************************************************************************************
	this.abilityCanUse.MeleeWeapon = function (actingChar) {
		return actingChar.inventory.getPrimaryWeapon();
	};
	
	// RANGE_WEAPON:
	// ********************************************************************************************
	this.abilityCanUse.RangeWeapon = function (actingChar) {
		return actingChar.inventory.getRangeWeapon();
	};
};

// CREATE_ABILITY_CAN_USE_ON:
// ************************************************************************************************
gs.createAbilityCanUseOn = function () {
	this.abilityCanUseOn = {};
	// SINGLE_CHARACTER_STRAIGHT_RAY:
	// ********************************************************************************************
	this.abilityCanUseOn.SingleCharacterStraightRay = function (actingChar, targetTileIndex) {		
		return gs.getChar(targetTileIndex)
			&& gs.isInBounds(targetTileIndex)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& gs.isRayProjectilePassable(actingChar.tileIndex, targetTileIndex)
			&& gs.isRayClear(actingChar.tileIndex, targetTileIndex)
			&& util.isStraight(actingChar.tileIndex, targetTileIndex)
			&& actingChar.isHostileToMe(gs.getChar(targetTileIndex));
			
	};
	
	// NPC_PROJECTILE_ATTACK:
	// Used by NPC projectile attacks to give them a chance of shooting their friends
	// ********************************************************************************************
	this.abilityCanUseOn.NPCProjectileAttack = function (actingChar, targetTileIndex) {
		var lineClear = true;
		
		
		
		// If the ray is not passable (character or level):
		if (!gs.isRayProjectilePassable(actingChar.tileIndex, targetTileIndex)) {
			lineClear = false;
			
			// 25% chance to shoot through a friendly as long as not adjacent
			let normal = util.get8WayVector(actingChar.tileIndex, targetTileIndex);
			let adjacentChar = gs.getChar(actingChar.tileIndex.x + normal.x, actingChar.tileIndex.y + normal.y);
			
			// Note we check in both directions to guarantee symetric LoS:
			let isShootable = gs.isRayShootable(actingChar.tileIndex, targetTileIndex) && gs.isRayShootable(targetTileIndex, actingChar.tileIndex);
			
			if (!adjacentChar && isShootable && util.frac() < 0.25) {
				lineClear = true;
			}
		}
		
		return lineClear
			&& gs.isRayClear(actingChar.tileIndex, targetTileIndex)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar);
	};
	
	// SINGLE_CHARACTER_RAY:
	// Must have a clear (passable) ray to the targetTileIndex
	// targetTileIndex must contain a hostile character
	// ********************************************************************************************
	this.abilityCanUseOn.SingleCharacterRay = function (actingChar, targetTileIndex) {
		
		return gs.isInBounds(targetTileIndex)
			&& gs.getChar(targetTileIndex, char => char !== actingChar && !char.isDamageImmune)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& gs.isRayProjectilePassable(actingChar.tileIndex, targetTileIndex)
			&& (gs.pc.canSeeCharacter(gs.getChar(targetTileIndex)) || gs.getChar(targetTileIndex).isSpriteDarkVisible());
	};
	
	
	
	// SINGLE_TILE_RAY:
	// Must have a clear (passable) ray to the targetTileIndex
	// targetTileIndex can contain a hostile character or it can be passable (staticPassable)
	// ********************************************************************************************
	this.abilityCanUseOn.SingleTileRay = function (actingChar, targetTileIndex) {
		let isLineClear;
		
		if (actingChar === gs.pc) {
			isLineClear = PlayerTargeting.isLineClear(targetTileIndex, false);
		}
		else {
			isLineClear = gs.isRayProjectilePassable(actingChar.tileIndex, targetTileIndex);
		}
		
		return gs.isInBounds(targetTileIndex)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& isLineClear
			&& gs.isStaticProjectilePassable(targetTileIndex)
			&& gs.getChar(targetTileIndex) !== actingChar;
	};
	
	
	// SINGLE_CHARACTER_SMITE:
	// Must have clear (visible) ray to the targetTileIndex
	// targetTileIndex must contain a hostile character
	// ********************************************************************************************
	this.abilityCanUseOn.SingleCharacterSmite = function (actingChar, targetTileIndex) {		
		return gs.isInBounds(targetTileIndex)
			&& gs.getChar(targetTileIndex, char => char !== actingChar)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& (gs.isRayProjectilePassable(actingChar.tileIndex, targetTileIndex) || gs.isRayClear(actingChar.tileIndex, targetTileIndex));
		
		// Note we check both projectilePassable? and Clear? so that we can fire out of clouds
	};
	
	// SINGLE_TILE_SMITE:
	// Must have a clear (visible) ray to the targetTileIndex
	// targetTileIndex can contain a hostile character or it can be passable (staticPassable)
	// ********************************************************************************************
	this.abilityCanUseOn.SingleTileSmite = function (actingChar, targetTileIndex) {		
		return gs.isInBounds(targetTileIndex)
			&& util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar)
			&& gs.isStaticProjectilePassable(targetTileIndex)
			&& gs.isRayBeamPassable(actingChar.tileIndex, targetTileIndex)
			&& gs.getChar(targetTileIndex) !== actingChar;
	};
	
	// BOLT:
	// Must have a static passable BRay to the targetTileIndex
	// ********************************************************************************************
	this.abilityCanUseOn.Bolt = function (actingChar, targetTileIndex) {
		let inRange;
		
		// Square range:
		if (this.useSquareRange) {
			inRange = util.sqDistance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar);
		}
		else {
			inRange = util.distance(actingChar.tileIndex, targetTileIndex) <= this.range(actingChar);
		}
		
		return gs.isInBounds(targetTileIndex)
			&& inRange
			&& !util.vectorEqual(actingChar.tileIndex, targetTileIndex)
			&& gs.isBRay(actingChar.tileIndex, targetTileIndex, gs.isStaticProjectilePassable);
	};

};

// CREATE_ABILITY_GET_TARGET:
// ************************************************************************************************
gs.createAbilityGetTarget = function () {
	this.abilityGetTarget = {};
	
	// SELF:
	// ********************************************************************************************
	this.abilityGetTarget.Self = function (actingChar) {
		return actingChar;
	};
	
	// SINGLE_TARGET:
	// ********************************************************************************************
	this.abilityGetTarget.SingleTarget = function (actingChar) {
		var indexList;
		
		// All targetable indices:
		indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.range(actingChar));
		
		// Only valid indices:
		indexList = indexList.filter(index => gs.getChar(index) && gs.getChar(index).isAgroed && actingChar.isHostileToMe(gs.getChar(index)));
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		
		// Sort by distance:
		indexList.sort((a, b) => util.distance(actingChar.tileIndex, a) - util.distance(actingChar.tileIndex, b));
		
		return indexList.length > 0 ? indexList[0] : null;
	};
	
	// SINGLE_ALLY:
	// ********************************************************************************************
	this.abilityGetTarget.SingleAlly = function (actingChar) {
		var indexList;
		
		// All targetable indices:
		indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.range(actingChar));
		
		// Only valid indices:
		indexList = indexList.filter(index => gs.getChar(index) && gs.getChar(index).isAgroed && !actingChar.isHostileToMe(gs.getChar(index)));
		indexList = indexList.filter(index => gs.getChar(index).faction !== FACTION.NEUTRAL);
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		
		// Sort by distance:
		indexList.sort((a, b) => util.distance(actingChar.tileIndex, a) - util.distance(actingChar.tileIndex, b));
		
		return indexList.length > 0 ? indexList[0] : null;
	};
	
	// BOLT:
	// ********************************************************************************************
	this.abilityGetTarget.Bolt = function (actingChar) {
		var indexList,
			potentialTargetList = [];
		
		// All targetable indices:
		indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.range(actingChar));
		
		// Only valid indices:
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		
		// Count number of hostile and friendly characters in each ray:
		indexList.forEach(function (index) {
			var list;
			
			list = gs.getIndexInBRay(actingChar.tileIndex, index);
			list = list.filter(index => gs.getChar(index) && gs.getChar(index).isAgroed && actingChar.canSeeCharacter(gs.getChar(index)));
			
			potentialTargetList.push({
				tileIndex: index, 
				hostileCount: list.reduce((sum, idx) => sum + (actingChar.isHostileToMe(gs.getChar(idx)) ? 1 : 0), 0),
				allyCount: list.reduce((sum, idx) => sum + (actingChar.faction === gs.getChar(idx).faction ? 1 : 0), 0)
			});
		}, this);
		
		
		// Only consider targets with more hostiles than allies:
		potentialTargetList = potentialTargetList.filter(target => target.hostileCount > target.allyCount);
		
		// Sort by hostile count:
		potentialTargetList.sort((a, b) => b.hostileCount - a.hostileCount);
		
		return potentialTargetList.length > 0 ? potentialTargetList[0].tileIndex : null;
	};
	
	// TARGET_BASED_AOE:
	// More hostiles than allies in AoE
	// ********************************************************************************************
	this.abilityGetTarget.TBAoE = function (actingChar) {
		var indexList, potentialTargetList = [];
		
		// All targetable indices:
		indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.range(actingChar));
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		
		
		
		
		// Count number of hostile and friendly characters in AoE
		indexList.forEach(function (index) {
			var list;
			
			list = gs.getIndexListInRadius(index, this.aoeRange(actingChar));
			list = list.filter(index => gs.getChar(index) && gs.getChar(index).isAgroed && actingChar.canSeeCharacter(gs.getChar(index)));
			
			potentialTargetList.push({
				tileIndex: index, 
				hostileCount: list.reduce((sum, idx) => sum + (actingChar.isHostileToMe(gs.getChar(idx)) ? 1 : 0), 0),
				allyCount: list.reduce((sum, idx) => sum + (actingChar.faction === gs.getChar(idx).faction ? 1 : 0), 0)
			});
		}, this);
		
		// Only consider targets with more hostiles than allies:
		potentialTargetList = potentialTargetList.filter(target => target.hostileCount > target.allyCount);
		
		// Sort by distance:
		potentialTargetList.sort((a, b) => util.distance(actingChar.tileIndex, a.tileIndex) - util.distance(actingChar.tileIndex, b.tileIndex));
		
		return potentialTargetList.length > 0 ? potentialTargetList[0].tileIndex : null;
	};
	
	// POINT_BLANK_AOE:
	// Returns actingChar.tileIndex if more hostiles than allies in AoE
	// Otherwise returns null.
	// In this way NPCs know if its a good idea to use the ability i.e. they won't use it if it returns null
	// ********************************************************************************************
	this.abilityGetTarget.PBAoE = function (actingChar) {
		var indexList, hostileCount, allyCount;
		
		// Get all index around actingChar:
		indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.aoeRange(actingChar));
		
		// Make sure its visible:
		indexList = indexList.filter(index => this.canUseOn(actingChar, index) );
		
		// Count the effected hostiles and allies:
		hostileCount = indexList.reduce((sum, idx) => sum + (actingChar.isHostileToMe(gs.getChar(idx)) && gs.getChar(idx).isAgroed ? 1 : 0), 0);
		allyCount = indexList.reduce((sum, idx) => sum + (actingChar.faction === gs.getChar(idx).faction ? 1 : 0), 0);
			
		return hostileCount > allyCount ? actingChar.tileIndex : null;
	};
	
	// FLOOD:
	// More hostiles than allies in flood.
	// ********************************************************************************************
	this.abilityGetTarget.Flood = function (actingChar) {
		var indexList, potentialTargetList = [], pred;
			
		pred = function (tileIndex) {
			return gs.isStaticPassable(tileIndex);
		};
		
		// All targetable indices:
		indexList = gs.getIndexListInRadius(actingChar.tileIndex, this.range(actingChar));
		
		// Only valid indices:
		indexList = indexList.filter(index => this.canUseOn(actingChar, index));
		
		// Count number of hostile and friendly characters in AoE
		indexList.forEach(function (index) {
			var list;
			
			list = gs.getIndexListInFlood(index, pred, this.floodDepth);
			list = list.filter(index => gs.getChar(index));
			
			potentialTargetList.push({
				tileIndex: index, 
				hostileCount: list.reduce((sum, idx) => sum + (actingChar.isHostileToMe(gs.getChar(idx)) ? 1 : 0), 0),
				allyCount: list.reduce((sum, idx) => sum + (actingChar.faction === gs.getChar(idx).faction ? 1 : 0), 0)
			});
		}, this);
		
		// Only consider targets with more hostiles than allies:
		potentialTargetList = potentialTargetList.filter(target => target.hostileCount > target.allyCount);
		
		// Sort by distance:
		potentialTargetList.sort((a, b) => util.distance(actingChar.tileIndex, a.tileIndex) - util.distance(actingChar.tileIndex, b.tileIndex));
		
		return potentialTargetList.length > 0 ? potentialTargetList[0].tileIndex : null;
	};
	
};