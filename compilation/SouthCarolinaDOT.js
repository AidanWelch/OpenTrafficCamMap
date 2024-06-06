'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://files0.iteriscdn.com/WebApps/SC/SafeTravel4/data/geojson/icons/metadata/icons.cctv.geojsonp', ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		data = data.replace( 'OpenLayers.Protocol.ScriptLite.registry.load_cameras(', '' );
		data = data.substring( 0, data.length - 3 );
		compile( JSON.parse( data ) );
	});
}).end();

class Camera {
	constructor ( cam ) {
		this.location = {
			description: cam.properties.dot_description,
			latitude: cam.geometry.coordinates[1],
			longitude: cam.geometry.coordinates[0],
			direction: ( () => {
				switch ( cam.properties.route_direction ) {
				case 'NB':
					return 'North';
					break;
				case 'SB':
					return 'South';
					break;
				case 'EB':
					return 'East';
					break;
				case 'WB':
					return 'West';
					break;
				}
			})()
		};
		this.url = cam.properties.http_url,
		this.encoding = 'H.264';
		this.format = 'M3U8';
		this.markedForReview = !cam.properties.active;
	}
}

function compile ( data ) {
	if ( !cameras['South Carolina'] ) {
		cameras['South Carolina'] = {};
	}

	for ( const cam of data.features ) {
		if ( cam.county !== null ) {
			if ( !cameras['South Carolina'][cam.properties.region] ) {
				cameras['South Carolina'][cam.properties.region] = [];
			}

			cameras['South Carolina'][cam.properties.region].push( new Camera( cam ) );
		} else {
			if ( !cameras['South Carolina'].other ) {
				cameras['South Carolina'].other = [];
			}

			cameras['South Carolina'].other.push( new Camera( cam ) );
		}
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}