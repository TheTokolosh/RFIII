/*global game, gs, console, Phaser*/
/*global LARGE_WHITE_FONT, FACTION, NUM_TILES_X, NUM_TILES_Y, LARGE_BOLD_WHITE_FONT, SMALL_WHITE_FONT*/
/*global TILE_SIZE, ITEM_SLOT*/
'use strict';

var util = {};

// GET_NAME_FROM_FRAME:
// ************************************************************************************************
gs.getNameFromFrame = function (frame, typeList) {
	for (let key in typeList) {
		if (typeList.hasOwnProperty(key)) {
			if (typeList[key].frame === frame || (typeList[key].frames && util.inArray(frame, typeList[key].frames))) {
				return typeList[key].name;
			}
		}
	}

	return null;
};

// TO_POSITION:
// ************************************************************************************************
util.toPosition = function (tileIndex) {
    return {x: (tileIndex.x * TILE_SIZE) + (TILE_SIZE / 2),
            y: (tileIndex.y * TILE_SIZE) + (TILE_SIZE / 2)};
};

// TO_TILE_INDEX:
// ************************************************************************************************
util.toTileIndex = function (position) {
    return {x: Math.floor(position.x / TILE_SIZE), y: Math.floor(position.y / TILE_SIZE)};
};

// TO_PERCENT_STRING:
// ************************************************************************************************
util.toPercentStr = function (frac) {
	return Math.round(gs.roundValue(frac) * 100) + '%';
};

// TO_SIGN_STR:
// ************************************************************************************************
util.toSignStr = function (val) {
	if (val > 0) {
		return '+';
	}
	else if (val < 0) {
		return '';
	}
	else {
		return '';
	}
};



// FOR_EACH_TYPE:
// ************************************************************************************************
gs.forEachType = function (types, func, context) {
	var key;
	
	for (key in types) {
		if (types.hasOwnProperty(key)) {
			func.call(context, types[key]);
		}
	}
};

// INNER_AREA_INDEX_LIST:
// Returns a list of tileIndices that belong to the area and are at least 1 tile away from walls
// This is useful for dressing the interior of a room while guaranteeing traversability
// ************************************************************************************************
util.innerAreaIndexList = function (area) {
	var indexList;
	
	indexList = gs.getIndexListInBox(area);
	indexList = indexList.filter(index => gs.getTile(index).area === area);
	
	indexList = indexList.filter(function (index) {
		return !gs.getIndexListCardinalAdjacent(index).some(idx => !gs.getTile(idx).type.passable)
			&& !gs.getIndexListCardinalAdjacent(index).some(idx => gs.getArea(idx) !== area);
	}, this);
	
	return indexList;
};




// CAPITAL_SPLIT:
// ************************************************************************************************
gs.capitalSplit = function (string) {
	var array;
	
	if (!string || string.length === 0) {
		return "";
	}
	
	// Make sure to capitalize first letter:
	string = string.charAt(0).toUpperCase() + string.slice(1);
	
	array = string.match(/[A-Z][a-z]+/g);
	return array.join(' ');
};

// WRAP_TEXT:
// ************************************************************************************************
gs.wrapText = function (text, maxWidth) {
    var i, j, lineStart = 0, lineEnd = 0, breaklines = [], lines = [];

    if (typeof (String.prototype.trim) === "undefined") {
        String.prototype.trim = function () {
            return String(this).replace(/^\s+|\s+$/g, '');
        };
    }

    breaklines = text.split('\n');

    for (j = 0; j < breaklines.length; j += 1) {
        lineStart = 0;
        lineEnd = 0;
        for (i = 0; i < breaklines[j].length; i += 1) {
            if (breaklines[j][i] === ' ') {
                lineEnd = i;
            }

            if (i - lineStart === maxWidth) {
                lines.push(breaklines[j].substring(lineStart, lineEnd));
                lineStart = lineEnd;
            }
        }

        // add remaining text:
        lines.push(breaklines[j].substring(lineStart, breaklines[j].length));
    }


    for (i = 0; i < lines.length; i += 1) {
        lines[i] = lines[i].trim();
    }

    return lines;
};

// COUNT_CHILDREN:
// ************************************************************************************************
gs.countChildren = function (group) {
	var i, sum = 0;
	// Base Case:
	if (!group.children || group.children.length === 0) {
		return 1;
	}
	
	// Recursive Case:
	for (i = 0; i < group.children.length; i += 1) {
		sum += gs.countChildren(group.children[i]);
	}
	return sum;
};

// NAME_TYPES:
// ************************************************************************************************
gs.nameTypes = function (types) {
	var key;
	
	for (key in types) {
		if (types.hasOwnProperty(key)) {
			types[key].name = key;
			
			if (!types[key].hasOwnProperty('niceName')) {
				types[key].niceName = this.capitalSplit(key);
			}
		}
	}
};

// RANGE:
// ************************************************************************************************
util.range = function (startNum, endNum, step) {
	var i, arr = [];
	
	step = step || 1;
	
	for (i = startNum; i <= endNum; i += step) {
		arr.push(i);
	}
	return arr;
};

// FRAME_BOX:
// ************************************************************************************************
util.frameBox = function (startNum, width, height) {
	let frameList = [];
	
	for (let y = 0; y < height; y += 1) {
		for (let x = 0; x < width; x += 1) {	
			frameList.push(startNum + x + y * 64);
		}
	}
	
	return frameList;
};



// ROUND_VALUE:
// ************************************************************************************************
gs.roundValue = function (value, numDec) {
	numDec = numDec || 2;
	return Math.round(value * Math.pow(10, numDec)) / Math.pow(10, numDec);
};

// ROUND_STR:
// ************************************************************************************************
gs.roundStr = function (value, numDec) {
	numDec = numDec || 2;
	
	value = this.roundValue(value, numDec);
	value = String(value);
	
	while (value.length < 5) {
		value += ' ';
	}
	
	return value;
};

// COUNT_TYPES:
// ************************************************************************************************
gs.countTypes = function (types) {
	var key, count = 0;
	
	for (key in types) {
		if (types.hasOwnProperty(key) && !types[key].hasOwnProperty('faction') || types[key].faction === FACTION.HOSTILE) {
			if (types[key].slot === undefined || types[key].slot !== ITEM_SLOT.NONE) {
				count += 1;
			}
			
		}
	}
	return count;
};

// CENTER_TEXT:
// ************************************************************************************************
gs.centerText = function (text) {
	text.anchor.x = Math.round(text.width * 0.5) / text.width;
	text.anchor.y = Math.round(text.height * 0.5) / text.height;
	
	if (text.anchor.x % 2 === 1) {
		text.anchor.x += 1;
	}
};

// CENTER_TEXT_X:
// ************************************************************************************************
gs.centerTextX = function (text) {
	text.anchor.x = Math.round(text.width * 0.5) / text.width;
	
	if (text.anchor.x % 2 === 1) {
		text.anchor.x += 1;
	}
};

// LAST_LINES:
// Return the last [num] lines:
// ************************************************************************************************
gs.lastLines = function (lines, num) {
	if (lines.length <= num) {
		return lines;
	} else {
		return lines.slice(lines.length - num);
	}
};

// ASSERT:
// ************************************************************************************************
gs.ASSERT = function (predicate, text) {
	if (this.debugProperties.throwExceps && !predicate) {
		throw text;
	}
};

// TIME_TO_STRING:
// ************************************************************************************************
gs.timeToString = function (time) {
	var seconds = Math.round(time / 1000) % 60,
		mins = Math.floor(Math.round(time / 1000) / 60);
		
	if (seconds < 10) {
		return '' + mins + ':0' + seconds;
	}
	else {
		return '' + mins + ':' + seconds;
	}
	
};



// FURTHEST_INDEX:
// Given an indexList, get the index that is furthest from tileIndex:
// ************************************************************************************************
util.getFurthestIndex = function (tileIndex, indexList) {
	indexList.sort((a, b) => util.distance(b, tileIndex) - util.distance(a, tileIndex));
	return indexList[0];
};