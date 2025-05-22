/*global util*/
/*jshint esversion: 6*/
'use strict';

// ARRAY_INTERSECT:
// Returns a new array that is the intersection of a1 and a2
// ************************************************************************************************
util.arrayIntersect = function (a1, a2) {
	return a1.filter(e => a2.indexOf(e) !== -1);
};

// IN_ARRAY:
// ************************************************************************************************
util.inArray =  function (element, array) {
    for (let i = 0; i < array.length; i += 1) {
        if (array[i] === element) {
            return true;
        }
    }

    return false;
};


// REMOVE_FROM_ARRAY:
// ************************************************************************************************
util.removeFromArray = function (element, array) {
    for (let i = 0; i < array.length; i += 1) {
        if (array[i] === element) {
            array.splice(i, 1);
            return;
        }
    }
};

// REMOVE_DUPLICATES:
// Don't use this for large arrays (quadratic time);
// ************************************************************************************************
util.removeDuplicates = function (list) {
	return list.filter(function(item, pos) {
		return list.indexOf(item) == pos;
	});
};

// CREATE_2D_ARRAY:
// ************************************************************************************************
util.create2DArray = function (numX, numY, createFunc, context) {
    var x, y, array;
    
    array = [];
    for (x = 0; x < numX; x += 1) {
        array[x] = [];
        for (y = 0; y < numY; y += 1) {
            array[x][y] = createFunc.call(context, x, y);
        }
    }
    return array;
};