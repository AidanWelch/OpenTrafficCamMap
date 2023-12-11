'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://www.tripcheck.com/Scripts/map/data/cctvinventory.js', ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		Compile( JSON.parse( data ) );
	});
}).end();

class Camera {
	constructor ( cam ) {
		this.location = {
			description: cam.attributes.title,
			longitude: cam.attributes.longitude,
			latitude: cam.attributes.latitude
		};
		this.url = `https://tripcheck.com/RoadCams/cams/${cam.attributes.filename}`;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
		this.markedForReview = false;
	}
}

function Compile ( data ) {
	if ( !cameras.Oregon ) {
		cameras.Oregon = {};
	}

	for ( const cam of data.features ) {
		if ( cam.attributes.route !== null ) {
			if ( !cameras.Oregon[cam.attributes.route] ) {
				cameras.Oregon[cam.attributes.route] = [];
			}

			cameras.Oregon[cam.attributes.route].push( new Camera( cam ) );
		} else {
			if ( !cameras.Oregon.other ) {
				cameras.Oregon.other = [];
			}

			cameras.Oregon.other.push( new Camera( cam ) );
		}
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}