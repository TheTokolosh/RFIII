/*global util, gs*/
/*global FACTION*/
'use strict';

let PlayerTargeting = {};


// IS_LINE_CLEAR:
// ************************************************************************************************
PlayerTargeting.isLineClear = function (targetTileIndex, allowPerfectAim) {

	let haltPred = function (tileIndex) {
		// A wall or object is in the way
		if (!gs.isStaticProjectilePassable(tileIndex)) {
			return false;
		}
		
		// A visible enemy is in the way:
		if (!(gs.pc.hasPerfectAim && allowPerfectAim)) {
			let char = gs.getChar(tileIndex);
			if (char && (gs.pc.canSeeCharacter(char) || char.isSpriteDarkVisible()) && !char.type.ignoreProjectiles) {
				return false;
			}
		}
		
		return true;
	};
	
	let isValid = gs.isRay(gs.pc.tileIndex, targetTileIndex, haltPred, true);
	
	return isValid;
};

// IS_VALID_CHAR_TARGET:
// ************************************************************************************************
PlayerTargeting.isValidCharTarget = function (tileIndex) {
	// Targeting a Character:
	let targetChar = gs.getChar(tileIndex);
	if (targetChar) {
		let validCharTarget = gs.pc.isHostileToMe(targetChar) || targetChar.faction === FACTION.DESTRUCTABLE;
		let canSeeTarget = gs.pc.canSeeCharacter(targetChar) || targetChar.isSpriteDarkVisible();
		
		if (validCharTarget && canSeeTarget) {
			return true;
		}		
	}
	
	return false;
};

// IS_VALID_TRAP_TARGET:
// ************************************************************************************************
PlayerTargeting.isValidTrapTarget = function (tileIndex) {
	return gs.getTile(tileIndex).explored && gs.canShootTrap(tileIndex);
};