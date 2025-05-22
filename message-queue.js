/*global gs, debug*/
/*jshint esversion: 6*/
'use strict';

gs.messageQueue = {
	queue: []
};

// PUSH_MESSAGE:
// ************************************************************************************************
gs.messageQueue.pushMessage = function (dialog, closePrev = true) {
	this.queue.push({dialog: dialog, closePrev: closePrev});
};

// UPDATE:
// ************************************************************************************************
gs.messageQueue.update = function () {
	if (debug.shouldClearLevel) {
		return;
	}
	
	if (this.queue.length > 0 && gs.stateManager.currentState().name !== 'DialogMenu' && gs.stateManager.currentState().name !== 'EnchantmentMenu') {
		gs.stateManager.pushState('DialogMenu', this.queue[0].dialog, null, this.queue[0].closePrev);
		this.queue.shift(); // Pop first element
	}	
};