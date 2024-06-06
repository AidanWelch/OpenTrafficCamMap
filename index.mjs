import { readFileSync, writeFileSync } from 'fs';
import compileTurkey from './compilation/Turkey/index.mjs';
import compileUSA from './compilation/USA/index.mjs';
import { fileURLToPath } from 'url';
import path from 'path';

const dir = path.dirname( fileURLToPath( import.meta.url ) );
let camTotal = 0;

compileUSA().then( res => {
	const camPath = path.join( dir, 'cameras', 'USA.json' );
	const oldCameras = JSON.parse( readFileSync( camPath ) );
	for ( const state in { ...oldCameras, ...res }) {
		let difference = 0;
		if ( state in res ) {
			for ( const county in res[state] ) {
				difference += res[state][county].length;
				camTotal += res[state][county].length;
			}
		}

		if ( state in oldCameras ) {
			for ( const county in oldCameras[state] ) {
				difference -= oldCameras[state][county].length;
			}
		}

		console.info(
			`${state} has ${( difference < 0 ) ? 'lost' : 'gained'} ${Math.abs( difference )} cameras`
		);
	}

	writeFileSync( camPath, JSON.stringify( res ) );

	const readmePath = path.join( dir, 'README.md' );
	let readme = readFileSync( readmePath, 'utf8' );

	readme = readme.split( '\n' );
	readme[2] = `A crowdsourced database of ${camTotal} traffic cameras.`;
	readme = readme.join( '\n' );

	writeFileSync( readmePath, readme );
});

compileTurkey().then( res => {
	let oldCameras = {};
	const camPath = path.join( dir, 'cameras', 'Turkey.json' );
	// Check if file is empty
	if ( JSON.stringify( readFileSync( camPath ) ) === '{"type":"Buffer","data":[]}' ) {
		console.info( 'Creating new file for Turkey.json' );
		writeFileSync( camPath, JSON.stringify( res ) );
	} else {
		oldCameras = JSON.parse( readFileSync( camPath ) );
	}

	for ( const state in { ...oldCameras, ...res }) {
		let difference = 0;
		if ( state in res ) {
			for ( const county in res[state] ) {
				difference += res[state][county].length;
				camTotal += res[state][county].length;
			}
		}

		if ( state in oldCameras ) {
			for ( const county in oldCameras[state] ) {
				difference -= oldCameras[state][county].length;
			}
		}

		console.info(
			`${state} has ${( difference < 0 ) ? 'lost' : 'gained'} ${Math.abs( difference )} cameras`
		);
	}

	writeFileSync( camPath, JSON.stringify( res ) );

	const readmePath = path.join( dir, 'README.md' );
	let readme = readFileSync( readmePath, 'utf8' );

	readme = readme.split( '\n' );
	readme[2] = `A crowdsourced database of ${camTotal} traffic cameras.`;
	readme = readme.join( '\n' );

	writeFileSync( readmePath, readme );
});