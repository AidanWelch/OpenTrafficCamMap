'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://chartexp1.sha.maryland.gov//CHARTExportClientService/getCameraMapDataJSON.do?_dc=1603720111951&page=1&start=0&limit=25&callback=Ext.data.JsonP.callback6', ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		data = data.slice( 'Ext.data.JsonP.callback6('.length, -2 );
		Compile( JSON.parse( data ).data );
	});
}).end();

class Camera {
	constructor ( cam, url ) {
		this.location = {
			description: cam.description,
			latitude: cam.lat,
			longitude: cam.lon
		};
		this.url = url;
		this.encoding = 'H.264';
		this.format = 'M3U8';
		this.marked_for_review = !( cam.opStatus === 'OK' );
	}
}

async function Compile ( data ){
	if ( !cameras.Maryland ){
		cameras.Maryland = {};
	}

	let requests = [];
	for ( const cam of data ){
		if ( requests.length > 25 ){ // This had to be done because these requests take a long time, about a second each
			await Promise.all( requests );
			requests = [];
		}

		if ( cam.cameraCategories[0] ){
			if ( !cameras.Maryland[cam.cameraCategories[0]] ){
				cameras.Maryland[cam.cameraCategories[0]] = [];
			}

			requests.push( GetURLAndPush( cam, cam.cameraCategories[0] ) );
		} else {
			if ( !cameras.Maryland.other ){
				cameras.Maryland.other = [];
			}

			requests.push( GetURLAndPush( cam, 'other' ) );
		}
	}

	await Promise.all( requests );
	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}

function GetURLAndPush ( cam, county ){
	return new Promise( ( resolve, reject ) => {
		const req = https.request( cam.publicVideoURL, ( res ) => {
			let data = '';

			res.on( 'data', ( chunk ) => {
				data += chunk;
			});

			res.on( 'error', ( error ) => {
				console.error( cam.publicVideoURL + ' : ' + error.message );
				reject();
			});

			res.on( 'end', () => {
				let url = data.slice( data.indexOf( 'src:	' ) + 6 );
				url = url.slice( 0, url.indexOf( '\'' ) );
				cameras.Maryland[county].push( new Camera( cam, url ) );
				resolve();
			});
		});
		req.setTimeout( 2000, () => {
			console.error( 'Timeout ' + cam.publicVideoURL );
			reject();
		});
		req.end();
	});
}