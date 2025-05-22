/*global game, gs, console, util, input*/
/*global UITargetSprites*/
/*global LARGE_RED_FONT, TILE_SIZE, FONT_NAME*/
/*global GREEN_TARGET_BOX_FRAME, GREEN_SELECT_BOX_FRAME, GREEN_BOX_FRAME*/
/*global RED_BOX_FRAME, RED_SELECT_BOX_FRAME, PURPLE_SELECT_BOX_FRAME, RED_TARGET_BOX_FRAME, X_FRAME*/
/*global FACTION*/
/*jshint laxbreak: true, esversion: 6*/
'use strict';

// CREATE_HUD_SPRITES:
// ************************************************************************************************
gs.createHUDSprites = function () {    
	// Mouse Cursor Sprite:
	this.cursorTileIndex = {x: 0, y: 0};
    this.cursorSprite = this.createSprite(0, 0, 'Tileset', this.hudTileSpritesGroup);
    this.cursorSprite.frame = GREEN_TARGET_BOX_FRAME;
	this.cursorSprite.visible = false;
    
	// Targeting Sprite:
	this.targetSprites = new UITargetSprites();
	
	// Targeting Line Sprite:
	this.targetLineSprites = [];
	for (let i = 0; i < 50; i += 1) {
		this.targetLineSprites[i] = this.createSprite(0, 0, 'Tileset', this.hudTileSpritesGroup);
		this.targetLineSprites[i].anchor.setTo(0.5, 0.5);
		this.targetLineSprites[i].frame = X_FRAME;
		this.targetLineSprites[i].visible = false;
	}
	
	this.createPopUpTextPool();
};

// UPDATE_HUD_TILE_SPRITES:
// ************************************************************************************************
gs.updateHUDTileSprites = function () {
    var i,
        isNPCTargeted,
        showAxeTarget,
        showSingleTarget,
        showMultiTarget,
        showBoltTarget;
    
    // IS NPC TARGETED:
    // ********************************************************************************************
    isNPCTargeted = function () {
        var tile = gs.getTile(gs.cursorTileIndex);
    
		return gs.isInBounds(gs.cursorTileIndex)
			&& tile.character !== null
			&& tile.character !== this
			&& gs.pc.canSeeCharacter(tile.character)
			&& tile.character.isAlive
			&& tile.character.faction === FACTION.HOSTILE;
    };
    
    // Hide all target sprites:
	this.targetSprites.reset();
	
	// Hide all target line sprites:
	for (i = 0; i < 50; i += 1) {
		this.targetLineSprites[i].visible = false;
	}
	
	// Position the cursor at the tile index of the pointer:
	if (!this.keyBoardMode) {
		this.cursorTileIndex.x = this.pointerTileIndex().x;
		this.cursorTileIndex.y = this.pointerTileIndex().y;
	}
	
	// Position the cursor sprite under the pointer:
	this.cursorSprite.x = this.cursorTileIndex.x * TILE_SIZE;
	this.cursorSprite.y = this.cursorTileIndex.y * TILE_SIZE;
	this.cursorSprite.visible = true;
	
	// If we are in game:
    if ((gs.stateManager.isCurrentState('GameState') || gs.stateManager.isCurrentState('UseAbility')) && (gs.isPointerInWorld() || this.keyBoardMode)) {
		this.updateSpecialTargeting();
		
		// USING AN ABILITY:
		if (gs.stateManager.isCurrentState('UseAbility')) {
			this.cursorSprite.visible = false;
			this.pc.selectedAbility.type.showTarget(this.cursorTileIndex);
		}
		// SPRINTING:
		else if (input.keys.SHIFT.isDown) {
			this.showSprintTargeting();
		}
		// ATTACKING MELEE:
		else if (this.pc.weaponSkill() === 'Melee' && this.pc.canAttack(this.cursorTileIndex)) {
			this.pc.inventory.getPrimaryWeapon().type.attackEffect.showTarget(this.cursorTileIndex, this.pc.inventory.getPrimaryWeapon());
        }
		// RANGE:
		else if (this.pc.inventory.getRangeWeapon() && this.pc.canAttack(this.cursorTileIndex, this.pc.inventory.getRangeWeapon())) {
			
			this.cursorSprite.visible = true;
			this.cursorSprite.frame = 1155;
		}
		// ITEM:
		// Shows cursor on items even if they are on objects
		else if (gs.getItem(this.cursorTileIndex) && this.getTile(this.cursorTileIndex).explored && gs.getObj(this.cursorTileIndex)) {
			this.cursorSprite.visible = true;
			this.cursorSprite.frame = GREEN_TARGET_BOX_FRAME;
		}
		// MOVING:
		else if (this.isInBounds(this.cursorTileIndex) && this.getTile(this.cursorTileIndex).explored
				   && (this.isPassable(this.cursorTileIndex) || this.getChar(this.cursorTileIndex) || this.getObj(this.cursorTileIndex, obj => obj.type.interactFunc))) {
			this.cursorSprite.visible = true;
			this.cursorSprite.frame = GREEN_TARGET_BOX_FRAME;
        } 
		else {
            this.cursorSprite.visible = false;
        }
    } 
	else {
		this.cursorSprite.visible = false;
	}
	
	// Mouse over abilities:
	let ability = gs.HUD.abilityBar.getAbilityUnderPointer();
	if (ability && ability.type.useImmediately && ability.type.showTarget) {
		ability.type.showTarget(gs.pc);
	}
	
	// Mouse over consumable:
	let item = gs.HUD.consumableList.getItemUnderPointer();
	if (item && item.type.useEffect && item.type.useEffect.useImmediately && item.type.useEffect.showTarget) {
		item.type.useEffect.showTarget(gs.pc);
	}
};

// UPDATE_TARGETING:
// ************************************************************************************************
gs.updateSpecialTargeting = function () {
	let char = gs.getChar(gs.cursorTileIndex);
	let obj = gs.getObj(gs.cursorTileIndex);
	
	// Don't show on unexplored tiles:
	if (!gs.getTile(gs.cursorTileIndex).explored) {
		return;
	}
	
	// Ice Bomb and Bone Bomb:
	if (obj && (obj.type.name === 'IceBomb' || obj.type.name === 'BoneBomb')) {
		let tileIndex = obj.tileIndex;
		let indexList = gs.getIndexListInBox(tileIndex.x - 4, tileIndex.y - 4, tileIndex.x + 5, tileIndex.y + 5);
		indexList = indexList.filter(index => gs.isStaticPassable(index));
		indexList = indexList.filter(index => gs.isRayPassable(index, tileIndex));
		indexList = indexList.filter(index => index.x === tileIndex.x || index.y === tileIndex.y || (util.distance(tileIndex, index) <= 5 && Math.abs(tileIndex.x - index.x) === Math.abs(tileIndex.y - index.y)));
		
		indexList.forEach(function (tileIndex) {
			gs.targetSprites.create(tileIndex, RED_BOX_FRAME);
		}, this);
	}
	
	// Bomb:
	if (obj && obj.type.name === 'Bomb') {
		let tileIndex = obj.tileIndex;
		let indexList = gs.getIndexListInRadius(tileIndex, 1);
		indexList = indexList.filter(index => gs.isStaticPassable(index));
		indexList = indexList.filter(index => gs.isRayStaticPassable(index, tileIndex));
		indexList = indexList.filter(index => index.x === tileIndex.x || index.y === tileIndex.y);
		
		indexList.forEach(function (tileIndex) {
			gs.targetSprites.create(tileIndex, RED_BOX_FRAME);
		}, this);
	}
	
	// Fire Pot:
	if (char && char.type.name === 'FirePot') {
		let tileIndex = char.tileIndex;
		let indexList = gs.getIndexListInRadius(tileIndex, 3);
		indexList = indexList.filter(index => gs.isStaticPassable(index));
		indexList = indexList.filter(index => gs.isRayStaticPassable(index, tileIndex));
		indexList = indexList.filter(index => index.x === tileIndex.x || index.y === tileIndex.y);
		
		indexList.forEach(function (tileIndex) {
			gs.targetSprites.create(tileIndex, RED_BOX_FRAME);
		}, this);
	}
	
	// Tornado:
	if (char && char.type.name === 'Tornado') {
		let tileIndex = char.tileIndex;
		let indexList = gs.getIndexListInRadius(tileIndex, 4);
		indexList = indexList.filter(index => gs.isStaticPassable(index));
		indexList = indexList.filter(index => gs.isRayStaticPassable(index, tileIndex));
		
		indexList.forEach(function (tileIndex) {
			gs.targetSprites.create(tileIndex, RED_BOX_FRAME);
		}, this);
	}
};

// SHOW_SPRINT_TARGETING:
// ************************************************************************************************
gs.showSprintTargeting = function () {
	this.cursorSprite.visible = false;
	
	let path = gs.pc.getPathTo(gs.cursorTileIndex, false);
	
	if (path && path.length > 0) {
		let validMove = true;
		
		if (gs.pc.getQuickMoveError(gs.cursorTileIndex, path)) {
			validMove = false;
		}
				
		let selectBoxFrame = validMove ? GREEN_TARGET_BOX_FRAME : RED_TARGET_BOX_FRAME;
		let boxFrame = validMove? GREEN_TARGET_BOX_FRAME : RED_TARGET_BOX_FRAME;
		
		
		// End Point:
		//gs.targetSprites.create(path[0], selectBoxFrame);
		
		// Path:
		for (let i = path.length - 1; i >= 0; i -= 1) {
			gs.targetSprites.create(path[i], boxFrame);
			
			// Break if we hit unexplored space:
			if (!gs.getTile(path[i]).explored) {
				break;
			}
		}
	}
	
};

// SHOW_TARGET_LINE:
// ************************************************************************************************
gs.showTargetLine = function (tileIndex) {
	var x,
		y,
		stepSize = 20,
		distance = 0,
		finalDistance,
		normal,
		i = 0,
		j = 0;

	x = util.toPosition(gs.pc.tileIndex).x;
	y = util.toPosition(gs.pc.tileIndex).y;
	finalDistance = util.distance({x: x, y: y}, util.toPosition(tileIndex));
	normal = util.normal({x: x, y: y}, util.toPosition(tileIndex));

	while (distance < finalDistance - stepSize) {
		x += normal.x * stepSize;
		y += normal.y * stepSize;
		distance += stepSize;

		gs.targetLineSprites[i].x = x;
		gs.targetLineSprites[i].y = y;
		gs.targetLineSprites[i].visible = true;

		while (gs.targetLineSprites[i].visible) {
			i += 1;
		}
	}
};

