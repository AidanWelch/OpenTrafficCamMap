'use strict';
const fs = require( 'fs' );

const cameras = JSON.parse( fs.readFileSync( '../../cameras/USA.json' ) );
let count = 0;
for ( const state in cameras ) {
	for ( const county in cameras[state] ) {
		// eslint-disable-next-line no-unused-vars
		for ( const camera in cameras[state][county] ) {
			count++;
		}
	}
}

console.info( count );

let readme = fs.readFileSync( '../../README.md', 'utf8' );

readme = readme.split( '\n' );
readme[1] = `A crowdsourced database of ${count} traffic cameras.`;
readme = readme.join( '\n' );

fs.writeFileSync( '../../README.md', readme );