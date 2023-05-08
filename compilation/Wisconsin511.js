'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://511wi.gov/List/GetData/Cameras?query={%22columns%22:[{%22data%22:null,%22name%22:%22%22},{%22name%22:%22sortId%22,%22s%22:true},{%22name%22:%22region%22,%22s%22:true},{%22name%22:%22county%22,%22s%22:true},{%22name%22:%22roadway%22,%22s%22:true},{%22name%22:%22description1%22},{%22data%22:6,%22name%22:%22%22}],%22order%22:[{%22column%22:1,%22dir%22:%22asc%22},{%22column%22:4,%22dir%22:%22asc%22}],%22start%22:0,%22length%22:9999,%22search%22:{%22value%22:%22%22}}&lang=en', ( res ) => {
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
			description: cam.displayName,
			longitude: cam.longitude,
			latitude: cam.latitude
		};
		this.url = 'https://511wi.gov/map/Cctv/' + cam.id;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
	}
}

function Compile ( data ){
	if ( !cameras.Wisconsin ){
		cameras.Wisconsin = {};
	}

	for ( const cam of data.data ){
		if ( cam.county !== null ){
			if ( !cameras.Wisconsin[cam.county] ){
				cameras.Wisconsin[cam.county] = [];
			}

			cameras.Wisconsin[cam.county].push( new Camera( cam ) );
		} else {
			if ( !cameras.Wisconsin.other ){
				cameras.Wisconsin.other = [];
			}

			cameras.Wisconsin.other.push( new Camera( cam ) );
		}
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}