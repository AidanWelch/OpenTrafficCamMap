'use strict';
const xml2json = require( 'xml2json' );
const fs = require( 'fs' );

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0; //Nevada is incompetent so we need this
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://www.nvroads.com/services/MapServiceProxy.asmx/GetFullCameraListXML', ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		Compile( JSON.parse( xml2json.toJson( JSON.parse( xml2json.toJson( data ) ).string['$t'] ) ) );
	});
}).end();

class Camera {
	constructor ( cam ) {
		this.location = {
			description: cam.Description,
			longitude: cam.lon,
			latitude: cam.lat
		};
		this.url = cam.StreamingURL;
		this.encoding = 'H.264';
		this.format = 'M3U8';
		this.marked_for_review = false;
	}
}

function Compile ( data ) {
	if ( !cameras.Nevada ) {
		cameras.Nevada = {};
	}

	for ( const cam of data.cameras.camera ) {
		if ( !cameras.Nevada.other ) {
			cameras.Nevada.other = [];
		}

		cameras.Nevada.other.push( new Camera( cam ) );
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}