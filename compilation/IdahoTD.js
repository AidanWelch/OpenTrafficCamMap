'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://hb.511.idaho.gov/tgcameras/api/cameras', ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		Compile( JSON.parse( data ) );
	});
}).end();

class Camera {
	constructor ( cam, icam ) {
		this.location = {
			description: `${cam.name}, ${cam.location.cityReference}, ${icam.name}`,
			latitude: cam.location.latitude,
			longitude: cam.location.longitude
		};
		this.url = icam.url;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
		this.markedForReview = false;
	}
}

function PushCams ( cam, region ) {
	return new Promise( ( resolve, reject ) => {
		for ( var icam of cam.views ) {
			if ( icam.type === 'EXTERNAL_PAGE' ) {
				var requestHostname = icam.url.slice( 0, icam.url.indexOf( '/', 9 ) );
				https.request( icam.url, ( res ) => {
					let data = '';

					res.on( 'data', ( chunk ) => {
						data += chunk;
					});

					res.on( 'end', () => {
						if ( res.statusCode === 200 ) {
							data = data.split( '\n' );
							let newUrl = data.filter( line => ( line.indexOf( 'SRC="/scanweb/Camera.asp' ) !== -1 ) )[0];
							newUrl = newUrl.slice( newUrl.indexOf( 'SRC="' )+5 );
							newUrl = newUrl.slice( 0, newUrl.indexOf( '" ' ) );
							https.request( requestHostname + newUrl, ( res ) => {
								let data = '';

								res.on( 'data', ( chunk ) => {
									data += chunk;
								});

								res.on( 'end', () => {
									if ( res.statusCode === 200 ) {
										data = data.split( '\n' );
										const headers = data.filter( line => ( line.indexOf( 'class="SectionHeader"' ) !== -1 ) );
										const links = data.filter( line => ( line.indexOf( 'class="Phantom"' ) !== -1 ) );
										for ( let i = 0; i < headers.length; i++ ) {
											headers[i] = headers[i].slice( headers[i].indexOf( '>' ) + 1 );
											headers[i] = headers[i].slice( 0, headers[i].indexOf( '<' ) );
											icam.name = headers[i];
											links[i] = links[i].slice( links[i].indexOf( 'SRC=' ) + 4 );
											links[i] = links[i].slice( 0, links[i].indexOf( '></a></TD>' ) );
											icam.url = requestHostname + links[i]; //the 9 magic number is so it only searches after the https://
											cameras.Idaho[region].push( new Camera( cam, icam ) );
										}
									}

									resolve();
								});
							}).end();
						}
					});
				}).end();
			} else {
				cameras.Idaho[region].push( new Camera( cam, icam ) );
				resolve();
			}
		}
	});
}

async function Compile ( data ) {
	if ( !cameras.Idaho ) {
		cameras.Idaho = {};
	}

	for ( const cam of data ) {
		if ( !cameras.Idaho.other ) {
			cameras.Idaho.other = [];
		}

		await PushCams( cam, 'other' );
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}