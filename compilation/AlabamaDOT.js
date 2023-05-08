'use strict';
const fs = require( 'fs' );
const https = require( 'https' );
const standardizeDirection = require( './utils/standardizeDirection.cjs' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://algotraffic.com/api/v1/layers/cameras?null', ( res ) => {
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
			description: cam.primaryRoad + ' ' + cam.crossStreet,
			latitude: cam.latitude,
			longitude: cam.longitude,
			direction: standardizeDirection( cam.direction )
		};
		this.url = cam.streamUrl,
		this.encoding = 'H.264';
		this.format = 'M3U8';
		this.marked_for_review = cam.disabled;
	}
}

function Compile ( data ){
	if ( !cameras.Alabama ){
		cameras.Alabama = {};
	}

	for ( let j = 0; j < data.length; j++ ) {
		const camArr = data[j].entries;

		for ( const cam of camArr ){
			cam.organizationId = cam.organizationId.charAt( 0 ).toUpperCase() + cam.organizationId.slice( 1 ); //made first letter uppercase of consistency
			console.log( cam.organizationId );
			if ( cam.organizationId !== null ){
				if ( !cameras.Alabama[cam.organizationId] ){
					cameras.Alabama[cam.organizationId] = [];
				}

				cameras.Alabama[cam.organizationId].push( new Camera( cam ) );
			} else {
				if ( !cameras.Alabama.other ){
					cameras.Alabama.other = [];
				}

				cameras.Alabama.other.push( new Camera( cam ) );
			}
		}
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}