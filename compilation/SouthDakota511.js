'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://sd.cdn.iteris-atis.com/geojson/icons/metadata/icons.cameras.geojson', ( res ) => {
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
			description: cam.description,
			longitude: cam.longitude,
			latitude: cam.latitude
		};
		this.url = cam.image;
		this.encoding = 'JPEG';
		if ( cam.direction !== null ){
			this.direction = cam.direction;
		}

		this.format = 'IMAGE_STREAM';
		this.marked_for_review = false;
	}
}

function compile ( data ){
	if ( !cameras['South Dakota'] ){
		cameras['South Dakota'] = {};
	}

	for ( const cam of data.features ){
		for ( const camView of cam.properties.cameras ){
			camView.longitude = cam.geometry.coordinates[0];
			camView.latitude = cam.geometry.coordinates[1];
			const direction = camView.name;
			if ( direction !== null ){
				if ( direction.includes( 'North' ) || direction.includes( 'north' ) || direction.includes( 'NB' ) ) { camView.direction = 'N'; } else if ( direction.includes( 'East' ) || direction.includes( 'east' ) || direction.includes( 'EB' ) ) { camView.direction = 'E'; } else if ( direction.includes( 'South' ) || direction.includes( 'south' ) || direction.includes( 'SB' ) ) { camView.direction = 'S'; } else if ( direction.includes( 'West' ) || direction.includes( 'west' ) || direction.includes( 'WB' ) ) { camView.direction = 'W'; }
			}

			if ( cam.properties.route !== null ){
				if ( !cameras['South Dakota'][cam.properties.route] ){
					cameras['South Dakota'][cam.properties.route] = [];
				}

				cameras['South Dakota'][cam.properties.route].push( new Camera( camView ) );
			} else {
				if ( !cameras['South Dakota'].other ){
					cameras['South Dakota'].other = [];
				}

				cameras['South Dakota'].other.push( new Camera( camView ) );
			}
		}
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}