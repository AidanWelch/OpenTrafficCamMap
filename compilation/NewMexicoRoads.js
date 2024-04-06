'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://servicev4.nmroads.com/RealMapWAR//GetCameraInfo?callback=jQuery112003441981128111502_1603805538231&_=1603805538238', ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		compile( JSON.parse( data.slice( 'jQuery112003441981128111502_1603805538231('.length, -3 ) ) );
	});
}).end();

class Camera {
	constructor ( cam ) {
		this.location = {
			description: cam.title,
			latitude: cam.lat,
			longitude: cam.lon
		};
		this.url = cam.snapshotFile;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
		this.markedForReview = false;
	}
}

function compile ( data ) {
	if ( !cameras['New Mexico'] ) {
		cameras['New Mexico'] = {};
	}

	for ( const cam of data.cameraInfo ) {
		if ( cam.grouping !== null ) {
			if ( !cameras['New Mexico'][cam.grouping] ) {
				cameras['New Mexico'][cam.grouping] = [];
			}

			cameras['New Mexico'][cam.grouping].push( new Camera( cam ) );
		} else {
			if ( !cameras['New Mexico'].other ) {
				cameras['New Mexico'].other = [];
			}

			cameras['New Mexico'].other.push( new Camera( cam ) );
		}
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}