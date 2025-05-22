/*global game, gs, console, nw, window, util*/
/*global UIMenuBase*/
/*global LARGE_WHITE_FONT, HUGE_WHITE_FONT, HEALTH_BAR_FRAME*/
/*global HUD_START_X, SCREEN_HEIGHT*/
/*jshint esversion: 6*/
'use strict';

// CONSTRUCTOR
// ************************************************************************************************
function UIOptionsMenu() {
	UIMenuBase.prototype.init.call(this, 'Game Options');
	
	// Sound:
	this.soundVolumeSlider = gs.createBar(this.startX + 6, this.startY + 50, HEALTH_BAR_FRAME, this.group);
	
	// Music:
	this.musicVolumeSlider = gs.createBar(this.startX + 6, this.startY + 80, HEALTH_BAR_FRAME, this.group);
	
	// Full Screen:
	this.fullScreenButton = this.createTextButton(this.startX + 100 + 6, this.startY + 124, 'Toggle Full Screen', this.onFullScreenClicked, this, this.group);
	
	// Focus Button:
	gs.createText(this.startX + 6, this.startY + 148, 'Auto Focus Camera', 'PixelFont6-White', 12, this.group);
	this.focusButton = gs.createSmallButton(this.startX + 190, this.startY + 134, 1303, this.onFocusButtonClicked, this, this.group);
	
	// HP Text Button:
	gs.createText(this.startX + 6, this.startY + 176, 'Use HP Text', 'PixelFont6-White', 12, this.group);
	this.useHPTextButton = gs.createSmallButton(this.startX + 190, this.startY + 162, 1303, this.onUseHpTextClicked, this, this.group);
	
	// HP Text Button:
	gs.createText(this.startX + 6, this.startY + 204, 'Use MP Text', 'PixelFont6-White', 12, this.group);
	this.useMPTextButton = gs.createSmallButton(this.startX + 190, this.startY + 190, 1303, this.onUseMpTextClicked, this, this.group);
	
	
	this.group.visible = false;
}
UIOptionsMenu.prototype = new UIMenuBase();

// UPDATE:
// ************************************************************************************************
UIOptionsMenu.prototype.update = function () {
	// Testing in case the dialog window is open:
	if (!gs.stateManager.isCurrentState('OptionsMenu')) {
		return;
	}
	
	// Sound Volume:
	if (this.soundVolumeSlider.isPointerOver() && game.input.activePointer.isDown) {
		let percent = (game.input.activePointer.x - this.soundVolumeSlider.frame.x) / this.soundVolumeSlider.frame.width,
			prevPercent = gs.soundVolume;
		percent = Math.round(percent * 10) / 10;
		
		gs.soundVolume = percent;
		
		if (gs.soundVolume !== prevPercent) {
			gs.playSound(gs.sounds.melee);
		}
		
		this.refresh();
	}
	
	if (this.musicVolumeSlider.isPointerOver() && game.input.activePointer.isDown) {
		let percent = (game.input.activePointer.x - this.musicVolumeSlider.frame.x) / this.musicVolumeSlider.frame.width;
		percent = Math.round(percent * 10) / 10;
		gs.musicVolume = percent;
		gs.setMusicVolume(gs.musicVolume);
		this.refresh();
	}
};

// REFRESH:
// ************************************************************************************************
UIOptionsMenu.prototype.refresh = function () {
	// Sound Slider:
	this.soundVolumeSlider.setPercent(gs.soundVolume);
	this.soundVolumeSlider.setText('Sound: ' + util.toPercentStr(gs.soundVolume));
	
	// Music Slider:
	this.musicVolumeSlider.setPercent(gs.musicVolume);
	this.musicVolumeSlider.setText('Music: ' + util.toPercentStr(gs.musicVolume));
	
	// Focus Camera:
	if (gs.globalData.focusCamera) {
		this.focusButton.setFrames(1304, 1303);
	}
	else {
		this.focusButton.setFrames(1306, 1305);
	}
	
	// Use HP Text:
	if (gs.globalData.useHPText) {
		this.useHPTextButton.setFrames(1304, 1303);
	}
	else {
		this.useHPTextButton.setFrames(1306, 1305);
	}
	
	// Use MP Text:
	if (gs.globalData.useMPText) {
		this.useMPTextButton.setFrames(1304, 1303);
	}
	else {
		this.useMPTextButton.setFrames(1306, 1305);
	}
};

// ON_FOCUS_BUTTON_CLICKED:
// ************************************************************************************************
UIOptionsMenu.prototype.onFocusButtonClicked = function () {
	// Testing in case the dialog window is open:
	if (!gs.stateManager.isCurrentState('OptionsMenu')) {
		return;
	}
	
	gs.globalData.focusCamera = !gs.globalData.focusCamera;
	this.refresh();
};

// ON_USE_HP_TEXT_CLICKED:
// ************************************************************************************************
UIOptionsMenu.prototype.onUseHpTextClicked = function () {
	// Testing in case the dialog window is open:
	if (!gs.stateManager.isCurrentState('OptionsMenu')) {
		return;
	}
	
	gs.globalData.useHPText = !gs.globalData.useHPText;
	this.refresh();
	
	let list = [gs.pc, gs.npcPool].flat();
	
	// Destroy and recreate all character UI:
	list.forEach(function (char) {
		char.destroyUI();
		
		// HP Text:
		if (gs.globalData.useHPText) {
			char.createUIText();
		}
		// HP Bars:
		else {
			char.createUIBars();
		}
	}, this);
};

// ON_USE_MP_TEXT_CLICKED:
// ************************************************************************************************
UIOptionsMenu.prototype.onUseMpTextClicked = function () {
	gs.globalData.useMPText = !gs.globalData.useMPText;
	this.refresh();
	
};


// ON_FULL_SCREEN_CLICKED:
// ************************************************************************************************
UIOptionsMenu.prototype.onFullScreenClicked = function () {
	// Testing in case the dialog window is open:
	if (!gs.stateManager.isCurrentState('OptionsMenu')) {
		return;
	}
	
	if (gs.fullScreen) {
		gs.fullScreen = false;
		nw.Window.get().leaveFullscreen();
	}
	else {
		gs.fullScreen = true;
		nw.Window.get().enterFullscreen();
	}
};

// OPEN:
// ************************************************************************************************
UIOptionsMenu.prototype.open = function () {
	this.refresh();
	gs.timer.pause();
	this.group.visible = true;
	this.resetButtons();
};

// CLOSE:
// ************************************************************************************************
UIOptionsMenu.prototype.close = function () {
	gs.saveGlobalData();	
	this.group.visible = false;
};

// IS_OPEN:
// ************************************************************************************************
UIOptionsMenu.prototype.isOpen = function () {
	return this.group.visible;
};