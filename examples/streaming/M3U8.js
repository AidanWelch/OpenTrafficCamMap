'use strict';
//This is a simple example that is non-reliable and should not be relied upon.

const fs = require( 'fs' );
const http = require( 'http' );

const cameras = JSON.parse( fs.readFileSync( '../../cameras/USA.json' ) );

const testCam = cameras.Tennessee.Nashville.find( cam => cam.format === 'M3U8' );

const videoFile = fs.createWriteStream( `${testCam.location.description.replace( / /g, '_' ).replace( /\//g, ']' )
	.replace( /\./g, '' )}.mp4` );

( async function () {
	for ( let i = 0; i < 5; i++ ) {
		await getPlaylist( testCam.url );
		// eslint-disable-next-line no-unused-vars
		await new Promise( ( resolve, _ ) => setTimeout( () => { resolve(); }, 14000 ) );
	}

	videoFile.end();
})();

function getPlaylist ( url ) {
	return new Promise( ( resolve, reject ) => {
		http.request( url, ( res ) => {
			let data = '';

			res.on( 'data', ( chunk ) => {
				data += chunk;
			});

			res.on( 'end', () => {
				getChunklist( data ).then( resolve() );
			});

			res.on( 'timeout', () => {
				reject( 'timeout' );
			});
		}).end();
	});
}

function getChunklist ( data ) {
	return new Promise( ( resolve, reject ) => {
		http.request( testCam.url.slice( 0, -13 ) + data.slice( data.indexOf( 'chunklist' ), -1 ), ( res ) => {
			let data = '';

			res.on( 'data', ( chunk ) => {
				data += chunk;
			});

			res.on( 'end', () => {
				const lines = data.split( '\n' );
				let unloadedChunks = 0;
				for ( const line of lines ) {
					if ( line[0] !== '#' ) {
						unloadedChunks++;
						getChunk( line ).then( () => {
							unloadedChunks--;
							if ( !unloadedChunks ) {
								resolve();
							}
						});
					}
				}
			});

			res.on( 'timeout', () => {
				reject( 'timeout' );
			});
		}).end();
	});
}

function getChunk ( chunkName ) {
	return new Promise( ( resolve, reject ) => {
		http.request( testCam.url.slice( 0, -13 ) + chunkName, ( res ) => {
			res.setEncoding( 'binary' );

			res.on( 'data', ( chunk ) => {
				videoFile.write( chunk, 'binary' );
			});

			res.on( 'end', () => {
				resolve();
			});

			res.on( 'timeout', () => {
				reject( 'timeout' );
			});
		}).end();
	});
}