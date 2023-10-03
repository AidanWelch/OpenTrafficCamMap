'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://mdotjboss.state.mi.us/MiDrive/camera/AllForMap/', ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		Compile( JSON.parse( data ) );
	});
}).end();

class Camera {
	constructor ( cam, url ) {
		this.location = {
			description: cam.title,
			latitude: cam.latitude,
			longitude: cam.longitude
		};
		this.url = url;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
	}
}

async function Compile ( data ) {
	if ( !cameras.Michigan ) {
		cameras.Michigan = {};
	}

	const requests = [];
	if ( !cameras.Michigan.other ) {
		cameras.Michigan.other = [];
	}

	for ( var i = 0; i < data.length; ++i ) {
		requests.push( new Promise( ( resolve, reject ) => {
			const cam = data[i];
			https.request( 'https://mdotjboss.state.mi.us/MiDrive/camera/getCameraInformation/' + cam.id, ( res ) => {
				let info = '';

				res.on( 'data', ( chunk ) => {
					info += chunk;
				});

				res.on( 'end', () => {
					cameras.Michigan.other.push( new Camera( cam, JSON.parse( info ).link ) );
					resolve();
				});
			}).end();
		}) );
	}

	await Promise.all( requests );
	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}