'use strict';
const xml2json = require( 'xml2json' );
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://udottraffic.utah.gov/KmlFile.aspx?kmlFileType=Camera', ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		Compile( JSON.parse( xml2json.toJson( data ) ) );
	});
}).end();

class Camera {
	constructor ( cam ) {
		const extendedData = new Map();
		for ( let i = 0; i < cam.ExtendedData.SchemaData.SimpleData.length; i++ ) {
			extendedData.set( cam.ExtendedData.SchemaData.SimpleData[i].name, cam.ExtendedData.SchemaData.SimpleData[i].$t );
		}

		const coords = cam.Point.coordinates.split( ',' );
		this.location = {
			description: cam.name,
			direction: extendedData.get( 'TrafficDirection' ),
			longitude: coords[0],
			latitude: coords[1]
		};
		this.url = extendedData.get( 'ImageUrl' );
		this.encoding = ( extendedData.get( 'ImageUrl' )[extendedData.get( 'ImageUrl' ).length - 1] === 'g' ) ? 'JPEG' : 'GIF';
		this.format = 'IMAGE_STREAM';
		this.markedForReview = false;
	}
}

function Compile ( data ) {
	if ( !cameras.Utah ) {
		cameras.Utah = {};
	}

	for ( const cam of data.kml.Document.Placemark ) {
		if ( !cameras.Utah.other ) {
			cameras.Utah.other = [];
		}

		cameras.Utah.other.push( new Camera( cam ) );
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}