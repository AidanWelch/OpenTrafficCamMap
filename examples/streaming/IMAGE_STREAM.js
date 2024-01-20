'use strict';
const fs = require( 'fs' );
const http = require( 'http' );

const cameras = JSON.parse( fs.readFileSync( '../../cameras/USA.json' ) );

const testCam = cameras.Kentucky.Jefferson.find( cam => cam.format === 'IMAGE_STREAM' );

( async function () {
	let lastPic;
	for ( var i = 0; i < 50; i++ ) {
		http.request( testCam.url, ( res ) => {
			let data = '';
			res.setEncoding( 'binary' );

			res.on( 'data', ( chunk ) => {
				data += chunk;
			});

			res.on( 'end', () => {
				if ( data !== lastPic ) {
					fs.writeFileSync( `${i}.jpg`, data, 'binary' );
					lastPic = data;
				}
			});
		}).end();
		await new Promise( r => setTimeout( r, testCam.updateRate || 1000 ) );
	}
})();