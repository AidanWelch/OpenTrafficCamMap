'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://map.wyoroad.info/wtimap/data/wtimap-webcameras.json', ( res ) => {
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
			description: cam.title,
			longitude: convertLongitude( cam.geometry.x ),
			latitude: convertLatitude( cam.geometry.y )
		};
		this.url = cam.imageUrl;
		this.encoding = 'JPEG';
		if ( cam.direction !== null ) {
			this.direction = cam.direction;
		}

		this.format = 'IMAGE_STREAM';
		this.marked_for_review = false;
	}
}

function compile ( data ) {
	if ( !cameras.Wyoming ) {
		cameras.Wyoming = {};
	}

	for ( const cam of data.features ) {
		if ( cam.attributes.IMAGEMARKUP !== null ) {
			const markup = cam.attributes.IMAGEMARKUP;
			cam.imageUrl = markup.substring( markup.indexOf( 'src="' ) + 5, markup.indexOf( ' class=' ) - 1 );
			const details = markup.substring( markup.indexOf( '<i>' ) + 3, markup.indexOf( '</i>' ) );
			cam.title = details;
			if ( details.includes( ' - ' ) ) {
				cam.direction = details.substring( details.lastIndexOf( '-' ) + 2, details.lastIndexOf( '-' ) + 3 );
			}

			const index = details.indexOf( ' ', details.indexOf( ' ' ) + 1 );
			let region = index >= 0 ? details.substr( 0, index ) : details.substr( index + 1 );
			if ( region.indexOf( '/' ) > 0 ) { region = region.substring( 0, region.indexOf( '/' ) ); }

			if ( region === 'I-25 Divide' ) { region = 'I 25'; }

			if ( !cameras.Wyoming[region] ) {
				cameras.Wyoming[region] = [];
			}

			cameras.Wyoming[region].push( new Camera( cam ) );
		} else {
			if ( !cameras.Wyoming.other ) {
				cameras.Wyoming.other = [];
			}

			cameras.Wyoming.other.push( new Camera( cam ) );
		}
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}

function convertLongitude ( long3857 ) {
	const X = 20037508.34;
	const long4326 = ( long3857*180 )/X;
	return long4326;
}

function convertLatitude ( lat3857 ) {
	const e = 2.7182818284;
	const X = 20037508.34;
	let lat4326 = lat3857/( X / 180 );
	const exponent = ( Math.PI / 180 ) * lat4326;
	lat4326 = Math.atan( e ** exponent );
	lat4326 = lat4326 / ( Math.PI / 360 );
	lat4326 = lat4326 - 90;
	return lat4326;
}