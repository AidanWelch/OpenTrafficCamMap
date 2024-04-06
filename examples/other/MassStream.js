'use strict';
const fs = require( 'fs' );
const http = require( 'http' );

const cameras = JSON.parse( fs.readFileSync( '../../cameras/USA.json' ) );

if ( !fs.existsSync( './shots' ) ) {
	fs.mkdirSync( './shots' );
}

for ( const county in cameras.Kentucky ) {
	if ( !fs.existsSync( `./shots/${county}` ) ) {
		fs.mkdirSync( `./shots/${county}` );
	}

	( async function ( county ) {
		for ( const cam of cameras.Kentucky[county] ) {
			if ( cam.url ) {
				http.request( cam.url, ( res ) => {
					let data = '';
					res.setEncoding( 'binary' );

					res.on( 'error', ( err ) => {
						console.error( cam.url, err );
					});

					res.on( 'data', ( chunk ) => {
						data += chunk;
					});

					res.on( 'end', () => {
						fs.writeFileSync( `./shots/${county}/${cam.location.description.replace( / /g, '_' ).replace( /\//g, '∕' )
							.replace( /\./g, '' )}.jpg`, data, 'binary' );
					});
				}).setTimeout( 10000 )
					.end();
				await new Promise( r => setTimeout( r, 3000 ) );
			}
		}
	})( county );
}