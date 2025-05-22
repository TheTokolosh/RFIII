/*global gs, game, Phaser*/
/*global SCALE_FACTOR, SMALL_WHITE_FONT*/
/*jshint esversion: 6*/
'use strict';

// CREATE_SPRITE:
// ************************************************************************************************
gs.createSprite = function (x, y, image, group) {
    var sprite;
	
    //sprite = game.add.sprite(x, y, image);
	sprite = game.add.image(x, y, image);
    sprite.smoothed = false;
	sprite.scale.setTo(SCALE_FACTOR, SCALE_FACTOR);
 
    if (group) {
        group.add(sprite);
    }
    
    return sprite;
};

// CREATE TEXT:
// ************************************************************************************************
gs.createText = function (x, y, textStr, font, fontSize, group) {
	return new UIText(x, y, textStr, font, fontSize, group);
};



// CREATE_ICON_BUTTON:
// ************************************************************************************************
gs.createIconButton = function (x, y, frame, callBack, context, group) {
	var button;
	
	this.createSprite(x, y, 'Slot', group);
	button = this.createButton(x + 2, y + 2, 'InterfaceTileset', callBack, context, group);
	button.frame = frame;
	
	return button;
};