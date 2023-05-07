'use strict';
function standardizeDirection (direction) {
	let res = direction.replaceAll(/NORTH|N|SOUTH|S|EAST|E|WEST|W/gi, 
		(string) => (string.length === 1) ? 
			string.toUpperCase() : string[0].toUpperCase())
		.match(/[a-zA-Z\d]/g);
	if (res === null) {
		return direction;
	}
	res = res.join('');
	if (res.length === 1) {
		return res;
	}
	if (res.length === 2) {
		if (res[0] === 'E' || res[0] === 'W') {
			return [res[1], res[0]].join('');
		}
		return res;
	}
	return direction;
}

module.exports = standardizeDirection;