'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://tmc.deldot.gov/json/videocamera.json', ( res ) => {
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
			description: cam.title,
			latitude: cam.lat,
			longitude: cam.lon
		};
		this.url = cam.urls.m3u8;
		this.encoding = 'H.264';
		this.format = 'M3U8';
		this.marked_for_review = !cam.enabled;
	}
}

function Compile ( data ){
	if ( !cameras.Delaware ){
		cameras.Delaware = {};
	}

	for ( const cam of data.videoCameras ){
		if ( cam.county !== null ){
			if ( !cameras.Delaware[cam.county] ){
				cameras.Delaware[cam.county] = [];
			}

			cameras.Delaware[cam.county].push( new Camera( cam ) );
		} else {
			if ( !cameras.Delaware.other ){
				cameras.Delaware.other = [];
			}

			cameras.Delaware.other.push( new Camera( cam ) );
		}
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}