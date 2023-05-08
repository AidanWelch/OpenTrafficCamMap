'use strict';
const NORTH = [ 'NORTH', 'NB', 'N' ];
const SOUTH = [ 'SOUTH', 'SB', 'S' ];
const EAST = [ 'EAST', 'EB', 'E' ];
const WEST = [ 'WEST', 'WB', 'W' ];
const directionRegex = new RegExp( [ ...NORTH, ...SOUTH, ...EAST, ...WEST ].join( '|' ), 'gi' );

function standardizeDirection ( direction ) {
	let res = direction.replaceAll( directionRegex,
		( string ) => ( string.length === 1 ) ?
			string.toUpperCase() : string[0].toUpperCase() )
		.match( /[a-zA-Z\d]/g );
	if ( res === null ) {
		return direction;
	}

	res = res.join( '' );
	if ( res.length === 1 ) {
		return res;
	}

	if ( res.length === 2 ) {
		if ( res[0] === 'E' || res[0] === 'W' ) {
			return [ res[1], res[0] ].join( '' );
		}

		return res;
	}

	return direction;
}

module.exports = standardizeDirection;