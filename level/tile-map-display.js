/*global gs, game, console, Phaser, util, debug*/
/*global NUM_TILES_X, NUM_TILES_Y*/
/*global TILE_SIZE, SHADOW_COLOR, SPOTTED_OBJECT_LIST, ZONE_FEATURE_OBJECT_LIST*/
/*global NUM_SCREEN_TILES_X, NUM_SCREEN_TILES_Y*/
/*global LOS_DISTANCE, FRIENDLY_NPC_LIST*/
/*jshint esversion: 6, laxbreak: true, loopfunc: true*/
'use strict';
// CREATE_TILE_MAP_SPRITES:
// ************************************************************************************************
gs.createTileMapSprites = function () {
    this.tileMapSprites = [];
    for (let x = 0; x < NUM_SCREEN_TILES_X; x += 1) {
        this.tileMapSprites[x] = [];
        for (let y = 0; y < NUM_SCREEN_TILES_Y; y += 1) {
			this.tileMapSprites[x][y] = gs.createSprite(x * TILE_SIZE, y * TILE_SIZE, 'MapTileset', this.tileMapSpritesGroup);
			this.tileMapSprites[x][y].anchor.setTo(0.5, 0.75);
			this.tileMapSprites[x][y].visible = false;
			//this.tileMapSprites[x][y].enableBody = false;
        }
    }
	
	
	this.createShadowMask();
};




// CREATE_SHADOW_MASK
// ************************************************************************************************
gs.createShadowMask = function () {
	var width = NUM_SCREEN_TILES_X * TILE_SIZE,
		height = NUM_SCREEN_TILES_Y * TILE_SIZE,
		radius = width / 2,
		gradient,
		color = SHADOW_COLOR,
		startAlpha = 'ff';
	
	// Creating Shadow Mask:
	this.shadowMaskBMP = game.add.bitmapData(width, width);
	
	gradient = this.shadowMaskBMP.context.createRadialGradient(radius, radius, radius * 2 * 0.05, radius, radius, radius * 2 * 0.5);
	gradient.addColorStop(0, color + '00');
	gradient.addColorStop(1, color + 'aa');
	this.shadowMaskBMP.context.fillStyle = gradient;
	this.shadowMaskBMP.context.fillRect(0, 0, radius * 2, radius * 2);
	
	this.shadowMaskSprite = this.createSprite(0, 0, this.shadowMaskBMP, this.shadowSpritesGroup);
	this.shadowMaskSprite.anchor.setTo(0.5, 0.5);
	this.shadowMaskBMP.dirty = true;
	
	this.shadowMaskSprite.visible = false;
	this.shadowSpritesGroup.visible = false;
};

// UPDATE_TILE_MAP_SPRITES:
// ************************************************************************************************
gs.updateTileMapSprites = function () {
    var cameraTileIndex = util.toTileIndex(game.camera.position),
		tileIndex = {x: 0, y: 0},
		objectGroupArray = ['Wall', 'CaveWall', 'HalfWall', 'BridgeWall', 'PitWall', 'PlatformWall'],
		tileSprite;
	
	
	
    for (let x = 0; x < NUM_SCREEN_TILES_X; x += 1) {
        for (let y = 0; y < NUM_SCREEN_TILES_Y; y += 1) {
			
			tileIndex.x = cameraTileIndex.x + x;
			tileIndex.y = cameraTileIndex.y + y;
			
			tileSprite = this.tileMapSprites[x][y];
			tileSprite.x = ((tileIndex.x + 0.5) * TILE_SIZE);
            tileSprite.y = ((tileIndex.y + 0.5) * TILE_SIZE);
			
			
            // If in bounds:
            if (this.isInBounds(tileIndex)) {
                // If explored:
                if (this.getTile(tileIndex).explored) {
					tileSprite.visible = true;
				
					// Tile Unique Frame:
					if (this.getTile(tileIndex).frame) {
						tileSprite.frame = this.getTile(tileIndex).frame;
					}
					// Tile Generic Frame:
					else {
						tileSprite.frame = this.getTile(tileIndex).type.frame;
					}
					
					// Moving tile to correct layer:
					if (util.inArray(this.getTile(tileIndex).type.name, objectGroupArray)) {
						this.objectSpritesGroup.add(tileSprite);
					}
					else {
						this.tileMapSpritesGroup.add(tileSprite);
					}

					// Debug show areas (highlights areas in red):
					if (this.debugProperties.showAreas) {
						// Solid Wall:
						if (this.getTile(tileIndex).isSolidWall) {
							tileSprite.tint = 0xff0000;
						}
						// Closed:
						else if (this.getTile(tileIndex).isClosed) {
							tileSprite.tint = 0xaa0000;
						}
						else if (this.getTile(tileIndex).area) {
							tileSprite.tint = 0x00ff00;
						}
						else {
							tileSprite.tint = 0xffffff;
						}
					}
					
					// Make item visible:
					if (this.getItem(tileIndex)) {
						this.getItem(tileIndex).sprite.visible = true;
					}
					
					// Make objects visible:
					if (this.getObj(tileIndex, obj => !obj.type.isHidden)) {
						this.getObj(tileIndex).sprite.visible = true;
						
						// Hiding walls under wall objs:
						if (this.getObj(tileIndex).type.isWallObject) {
							tileSprite.visible = false;
						}
					}

					// Make effects visible:
					if (this.getCloud(tileIndex)) {
						this.getCloud(tileIndex).sprite.visible = true;
					}
					
                    // If explored and visible:
                    if (this.getTile(tileIndex).visible) {
						this.setSpriteKey(tileSprite, 'MapTileset');
						
						// Make item ligth:
						if (this.getItem(tileIndex)) {
							this.setSpriteKey(this.getItem(tileIndex).sprite, 'Tileset');
						}
						
						// Make objects light:
						if (this.getObj(tileIndex)) {
							this.setSpriteKey(this.getObj(tileIndex).sprite, 'MapTileset');
						}
						
						// Make effect light:
						if (this.getCloud(tileIndex)) {
							this.setSpriteKey(this.getCloud(tileIndex).sprite, 'Tileset');
						}
                    }
					// If explored and not visible:
					else {
						this.setSpriteKey(tileSprite, 'DarkMapTileset');
						
						// Make item dark:
						if (this.getItem(tileIndex)) {
							this.setSpriteKey(this.getItem(tileIndex).sprite, 'DarkTileset');
						}
						
						// Make objects dark:
						if (this.getObj(tileIndex)) {
							this.setSpriteKey(this.getObj(tileIndex).sprite, 'DarkMapTileset');
						}
						
						// Make effect dark:
						if (this.getCloud(tileIndex)) {
							this.setSpriteKey(this.getCloud(tileIndex).sprite, 'DarkTileset');
						}
                    }
					
					
                } 
				// If not explored:
				else {
                    tileSprite.visible = false;
                    
                    // Hide item:
                    if (this.getItem(tileIndex)) {
                        this.getItem(tileIndex).sprite.visible = false;
                    }
					
					// Hide Object:
					if (this.getObj(tileIndex)) {
						this.getObj(tileIndex).sprite.visible = false;
					}
					
					// Hide Effect:
					if (this.getCloud(tileIndex)) {
						this.getCloud(tileIndex).sprite.visible = false;
					}
                }
            }
			// If not in bounds:
			else {
                tileSprite.visible = false;
            }
        }
    }
};

// SET_SPRITE_KEY:
// ************************************************************************************************
gs.setSpriteKey = function (sprite, key) {
	var frame;
	
	if (sprite.key !== key) {
		frame = sprite.frame;
		sprite.loadTexture(key, frame, true);
		sprite.frame = frame;

		if (sprite.animations && sprite.animations.getAnimation("anim")) {
			sprite.play('anim', 5, true);
		}
	}
};

// CREATE_LOS_RAYS:
// ************************************************************************************************
gs.createLoSRays = function () {
	var angle = 0,
        angleDelta = Math.PI / 24, // Sept-23-2021: was PI / 20
        distance = 0,
        stepDelta = 1,
        sightDistance = TILE_SIZE * LOS_DISTANCE;
	
	this.losRays = [];

    let startPoint = new Phaser.Point(1, 0);
	
    for (angle = 0; angle < Math.PI * 2; angle += angleDelta) {
        startPoint = Phaser.Point.rotate(startPoint, 0, 0, angleDelta);
		
		
		
		let indexList = [];
		
        for (distance = 0; distance <= sightDistance; distance += stepDelta) {
			let point = {x: 20 + startPoint.x * distance, y: 20 + startPoint.y * distance};
			let tileIndex = util.toTileIndex(point);
            
			//if (gs.inTileHitBounds(point, 1) && !indexList.find(index => util.vectorEqual(tileIndex, index))) {
			if (!indexList.find(index => util.vectorEqual(tileIndex, index))) {
				indexList.push({x: tileIndex.x, y: tileIndex.y});
			}
		}
		
		this.losRays.push(indexList);
    }
	
	this.losRays[1].splice(3, 1);
	this.losRays[9].splice(3, 1);
	this.losRays[13].splice(3, 1);
	this.losRays[21].splice(3, 1);
	this.losRays[25].splice(3, 1);
	this.losRays[33].splice(3, 1);
	this.losRays[37].splice(3, 1);
	this.losRays[45].splice(3, 1);
	
	this.losRays[2].splice(2, 1);
	this.losRays[8].splice(2, 1);
	this.losRays[14].splice(2, 1);
	this.losRays[20].splice(2, 1);
	this.losRays[26].splice(2, 1);
	this.losRays[32].splice(2, 1);
	this.losRays[38].splice(2, 1);
	this.losRays[44].splice(2, 1);
	
	// Additional Rays to catch odd stuff in LoS
	this.losRays.push([{x: -1, y: 1}, {x: -2, y: 2}, {x: -3, y: 3}, {x: -4, y: 3}]);
	this.losRays.push([{x: 1, y: -1}, {x: 2, y: -2}, {x: 3, y: -3}, {x: 3, y: -4}]);
	this.losRays.push([{x: 1, y: -1}, {x: 2, y: -2}, {x: 3, y: -3}, {x: 4, y: -3}]);
	this.losRays.push([{x: -1, y: 1}, {x: -2, y: 2}, {x: -3, y: 3}, {x: -3, y: 4}]);
	this.losRays.push([{x: -1, y: -1}, {x: -2, y: -2}, {x: -3, y: -3}, {x: -4, y: -3}]);
	this.losRays.push([{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}, {x: 3, y: 4}]);
	this.losRays.push([{x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}, {x: 4, y: 3}]);
	this.losRays.push([{x: -1, y: -1}, {x: -2, y: -2}, {x: -3, y: -3}, {x: -3, y: -4}]);
};

gs.showDebugLoSRay = function (index) {
	// Destroy existing sprites:
	if(debug.debugSpritesList) {
		debug.debugSpritesList.forEach(function (sprite) {
			sprite.destroy();
		}, this);
	}
	
	let str = '';
	
	this.losRays[index].forEach(function (tileIndex) {
		debug.createDebugSprite({x: gs.pc.tileIndex.x + tileIndex.x, y: gs.pc.tileIndex.y + tileIndex.y});
		
		str += '{x: ' + tileIndex.x + ', y: ' + tileIndex.y + '},\n';
	}, this);
	
	console.log(str);
	
	
};

// CALCULATE_LOS:
// ************************************************************************************************
gs.calculateLoS = function (forceRefresh = false) {
    // Make all tiles not visible:
	if (forceRefresh) {
		for (let x = 0; x < this.numTilesX; x += 1) {
			for (let y = 0; y < this.numTilesY; y += 1) {
				this.tileMap[x][y].visible = this.debugProperties.mapVisible;
			}
    	}
	}
	else {
		let minX = Math.max(0, gs.pc.tileIndex.x - LOS_DISTANCE - 4),
			minY = Math.max(0, gs.pc.tileIndex.y - LOS_DISTANCE - 4),
			maxX = Math.min(this.numTilesX, gs.pc.tileIndex.x + LOS_DISTANCE + 4),
			maxY = Math.min(this.numTilesY, gs.pc.tileIndex.y + LOS_DISTANCE + 4);
		
		for (let x = minX; x < maxX; x += 1) {
			for (let y = minY; y < maxY; y += 1) {
				this.tileMap[x][y].visible = this.debugProperties.mapVisible;
			}
    	}
	}
    
	
	// Tiles adjacent to player are always visible:
	this.getIndexListInBox(this.pc.tileIndex.x - 1, this.pc.tileIndex.y - 1, this.pc.tileIndex.x + 2, this.pc.tileIndex.y + 2).forEach(function (tileIndex) {
		// Visible:
        this.tileMap[tileIndex.x][tileIndex.y].visible = true;
		
		// Explored:
		this.setTileIndexExplored(tileIndex);
	}, this);
	
	this.losRays.forEach(function (ray) {
		for (let i = 0; i < ray.length; i += 1) {
			let tileIndex = {x: ray[i].x + gs.pc.tileIndex.x, y: ray[i].y + gs.pc.tileIndex.y};
			
			if (this.isTileIndexTransparent(tileIndex)) {
				gs.setTileIndexVisible(tileIndex);
            } 
			else {
                break;
            }
		}
		
	}, this);
};



// SET_TILE_INDEX_VISIBLE:
// ************************************************************************************************
gs.setTileIndexVisible = function (tileIndex) {
	// Handling the tile itself:
    if (this.isInBounds(tileIndex)) {
		// Visible:
        this.tileMap[tileIndex.x][tileIndex.y].visible = true;
		
		// Explored:
		this.setTileIndexExplored(tileIndex);
    }
	
	
	// Handling adjacent wall tiles:
	[{x: tileIndex.x - 1, y: tileIndex.y}, 
	 {x: tileIndex.x + 1, y: tileIndex.y},
	 {x: tileIndex.x, y: tileIndex.y + 1},
	 {x: tileIndex.x, y: tileIndex.y - 1}].forEach(function (index) {
		if (!this.isTileIndexTransparent(index)) {
			// Visible:
			this.tileMap[index.x][index.y].visible = true;

			// Explored:
			this.setTileIndexExplored(index);
		}
	}, this);
	
	// Handling Corner wall tiles:
	[{x: tileIndex.x - 1, y: tileIndex.y - 1}, 
	 {x: tileIndex.x + 1, y: tileIndex.y - 1},
	 {x: tileIndex.x - 1, y: tileIndex.y + 1},
	 {x: tileIndex.x + 1, y: tileIndex.y + 1}].forEach(function (index) {
		if (!this.isTileIndexTransparent(index) && gs.getTile(index).isCorner) {
			// Visible:
			this.tileMap[index.x][index.y].visible = true;

			// Explored:
			this.setTileIndexExplored(index);
		}
	}, this);
	
	
	
	
	/*
	let indexList = this.getIndexListInBox(tileIndex.x - 1, tileIndex.y -1, tileIndex.x + 2, tileIndex.y + 2);
	indexList.forEach(function (index) {
		if (!this.isTileIndexTransparent(index)) {
			// Visible:
			this.tileMap[index.x][index.y].visible = true;

			// Explored:
			this.setTileIndexExplored(index);
		}
	}, this);
	*/
};

// SET_TILE_INDEX_EXPLORED:
// ************************************************************************************************
gs.setTileIndexExplored = function (tileIndex) {
	// Explored:
	if (!this.tileMap[tileIndex.x][tileIndex.y].explored) {
		this.tileMap[tileIndex.x][tileIndex.y].explored = true;
				
		// Flood Explore:
		if (gs.getObj(tileIndex, obj => obj.type.floodExplore)) {
			let indexList = gs.getIndexListInFlood(tileIndex, index => gs.getObj(index, obj => obj.type.floodExplore));
			indexList.forEach(function (index) {
				this.tileMap[index.x][index.y].explored = true;
			}, this);
		}
		
		// Discovering special zone features:
		this.discoverTileIndex(tileIndex);
		
		// Reveal Reward rooms:
		this.revealRewardRooms(tileIndex);
		
		// Need to be very careful here so as not to fuck up charge and sprint w/ popup messages:
		if (!gs.pc.isMultiMoving) {
			// Halting exploration if something interesting is discovered:
			if (this.getObj(tileIndex, SPOTTED_OBJECT_LIST) || this.getObj(tileIndex, obj => obj.isZoneLine())) {
				gs.pc.stopExploring();
				gs.pc.keyboardMoveLock = true;
				gs.pc.popUpText('Spotted ' + gs.capitalSplit(this.getObj(tileIndex).type.name));
			} 
			// Halting exploration if character spotted:
			else if (this.getChar(tileIndex) && util.inArray(this.getChar(tileIndex).name, FRIENDLY_NPC_LIST)) {
				gs.pc.stopExploring();
				gs.pc.keyboardMoveLock = true;
				gs.pc.popUpText('Spotted ' + gs.capitalSplit(this.getChar(tileIndex).type.name));
			}	
		}
		
	}
};

// REVEAL_REWARD_ROOMS:
// Called the first time a tileIndex is explored in order to reveal entire reward room:
// ************************************************************************************************
gs.revealRewardRooms = function (tileIndex) {
	let area = gs.getArea(tileIndex);
	
	let contentTypeList = [
		'MajorReward',
		'ShrineOfStrength',
		'ShrineOfDexterity',
		'ShrineOfIntelligence',
		'Library'
	];
	
	// Discovered a Major-Reward area:
	if (area && area.vaultType && util.inArray(area.vaultType.contentType,  contentTypeList)) {
		// Don't activate until we see a clear floor tile:
		if (!gs.getObj(tileIndex)) {
			let indexList = gs.getIndexListInFlood(tileIndex, index => gs.getArea(index) === area);
		
			indexList.forEach(function (index) {
				gs.setTileIndexExplored(index);			  
			}, this);
		}
		
	}
};

// DISCOVER_TILE_INDEX:
// Called the first time a tileIndex is explored and adds any interesting features to the players discoveredZones feature list
// ************************************************************************************************
gs.discoverTileIndex = function (tileIndex) {
	// Discovering Zone Lines:
	if (this.getObj(tileIndex, obj => obj.isZoneLine())) {
		gs.pc.discoverZone(this.getObj(tileIndex).toZoneName, this.getObj(tileIndex).toZoneLevel);
	}
	
	// Discovering Objects:
	if (this.getObj(tileIndex) && util.inArray(this.getObj(tileIndex).type.name, ZONE_FEATURE_OBJECT_LIST)) {
		gs.pc.addDiscoveredZoneFeature(this.getObj(tileIndex).type.name);
	}
	
	// Crystal Chest:
	if (this.getObj(tileIndex, 'CrystalChest')) {
		gs.pc.addDiscoveredZoneFeature('CrystalChest' + this.getObj(tileIndex).item);
	}
	
	// Discovering NPCs:
	if (this.getChar(tileIndex) && util.inArray(this.getChar(tileIndex).name, FRIENDLY_NPC_LIST)) {
		gs.pc.addDiscoveredZoneFeature(this.getChar(tileIndex).name);
	}
};
