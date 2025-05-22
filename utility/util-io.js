/*global gs, game, util, console, require, nw*/
/*jshint esversion: 6*/
'use strict';

var fs = require('fs');
var path = require('path');

// WRITE_FILE:
// ************************************************************************************************
util.writeFile = function (fileName, data) {
	var dirPath = nw.App.dataPath + '/SaveData/';
	
	// Changes slashes to / or \ depending on OS:
	dirPath = path.normalize(dirPath);
	
	// Make a save data folder if it does not exist:
	if (!fs.existsSync(dirPath)){
		console.log('Creating save game folder at: ' + dirPath);
    	fs.mkdirSync(dirPath);
	}
	
	fs.writeFileSync(dirPath + fileName + '.json', data);
};

// READ_FILE:
// ************************************************************************************************
util.readFile = function (fileName) {
	var dirPath = nw.App.dataPath + '/SaveData/', data;
	
	// Changes slashes to / or \ depending on OS:
	dirPath = path.normalize(dirPath);
	
	if (this.doesFileExist(fileName)) {
		data = fs.readFileSync(dirPath + fileName + '.json', 'utf8');
	}
	
	try {
		data = JSON.parse(data);
	} 
	catch (e) {
		this.popUpFileError(dirPath, fileName);
	}
	
	return data;
};

// POP_UP_FILE_ERROR:
// ************************************************************************************************
util.popUpFileError = function (dirPath, fileName) {
	// Create a new window and get it
	nw.Window.open('rogue-fable-III/file-error.html', {}, function(new_win) {


		// And listen to new window's focus event
		new_win.on('loaded', function() {
			let text = '';

			text += 'Corrupted file detected: ' + fileName + '\n';
			text += dirPath + '\n';

			new_win.window.document.getElementById('text').textContent = text;

			// Get the current window
			var win = nw.Window.get();
			win.close();
		});
	});
};


// DOES_FILE_EXIST
// ************************************************************************************************
util.doesFileExist = function (fileName) {
	var dirPath = nw.App.dataPath + '/SaveData/';
	
	// Changes slashes to / or \ depending on OS:
	dirPath = path.normalize(dirPath);
	
	return fs.existsSync(dirPath + fileName + '.json');
};

// CLEAR_GAME_DATA:
// This DOES NOT clear the score table
// ************************************************************************************************
gs.clearGameData = function () {
    let dirPath =  path.normalize(nw.App.dataPath + '/SaveData/');
    
    // If SaveData/ path exists:
    if (fs.existsSync(dirPath)) {
        let fileList = fs.readdirSync(dirPath);
        
        fileList.forEach(function (fileName) {
            // Delete files:
            if (!util.inArray(fileName, ['Achievements.json', 'GlobalData.json', 'GameRecords.json'])) {
                fs.unlinkSync(dirPath + fileName);
            }
        }, this);
    }
    else {
        console.log('making dir');
        fs.mkdirSync(dirPath);
    }
        

	// Just in case theres some fiddle fuckery here:
	game.camera.onFadeComplete.removeAll();
};
