/* global gs*/
/* global Box*/
'use strict';

// CONSTRUCTOR:
// ************************************************************************************************
function Area (startX, startY, endX, endY, overWriteArea = true) {
    // Box Init:
    this.init(startX, startY, endX, endY);
	
	this.hallHookTileIndexList = [];
	
	
	// Flag all passable tiles w/ the area:
	for (let x = this.startX; x < this.endX; x += 1) {
		for (let y = this.startY; y < this.endY; y += 1) {
			if (gs.getTile(x, y).type.passable) {
				// Cave generator will not overwrite the precave vaults:
				if (overWriteArea || !gs.getTile(x, y).area) {
					gs.getTile(x, y).area = this;	
				}
			}
		}
	}
}
Area.prototype = new Box();

// ADD_AREA:
// ************************************************************************************************
Area.prototype.addArea = function (area) {
    let startX = Math.min(this.startX, area.startX),
        startY = Math.min(this.startY, area.startY),
        endX = Math.max(this.endX, area.endX),
        endY = Math.max(this.endY, area.endY);
    
    // Box Init:
    this.init(startX, startY, endX, endY);
    
    gs.getAllIndex().forEach(function (tileIndex) {
        if (gs.getTile(tileIndex).area === area) {
            gs.getTile(tileIndex).area = this;
        }
    }, this);
};
				  