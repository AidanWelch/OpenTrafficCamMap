'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://ga.cdn.iteris-atis.com/geojson/icons/metadata/icons.cctv.geojson', ( res ) => {
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
			description: cam.properties.location_description,
			direction: cam.properties.dir,
			latitude: cam.geometry.coordinates[1],
			longitude: cam.geometry.coordinates[0]
		};
		this.url = cam.properties.url;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
	}
}

function Compile ( data ){
	if ( !cameras.Georgia ){
		cameras.Georgia = {};
	}

	for ( const cam of data.features ){
		if ( cam.properties.county !== null ){
			if ( !cameras.Georgia[cam.properties.county] ){
				cameras.Georgia[cam.properties.county] = [];
			}

			cameras.Georgia[cam.properties.county].push( new Camera( cam ) );
		} else {
			if ( !cameras.Georgia.other ){
				cameras.Georgia.other = [];
			}

			cameras.Georgia.other.push( new Camera( cam ) );
		}
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}