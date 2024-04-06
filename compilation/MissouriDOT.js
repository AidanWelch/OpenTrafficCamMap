'use strict';
const fs = require( 'fs' );
const http = require( 'http' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

http.request( 'http://traveler.modot.org/timconfig/feed/desktop/StreamingCams2.json', ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		compile( JSON.parse( data ) );
	});
}).end();

class Camera {
	constructor ( cam ) {
		this.location = {
			description: cam.location,
			longitude: cam.x,
			latitude: cam.y
		};
		this.url = cam.html;
		this.encoding = 'H.264';
		this.format = 'M3U8';
		this.markedForReview = false;
	}
}

function compile ( data ) {
	if ( !cameras.Missouri ) {
		cameras.Missouri = {};
	}

	for ( const cam of data ) {
		if ( !cameras.Missouri.other ) {
			cameras.Missouri.other = [];
		}

		cameras.Missouri.other.push( new Camera( cam ) );
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}