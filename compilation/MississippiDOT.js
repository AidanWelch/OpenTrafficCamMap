'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

const postData = '{}';

const reqOptions = {
	host: 'www.mdottraffic.com',
	path: '/default.aspx/LoadCameraData',
	port: 443,
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'Content-Length': postData.length
	}
};

const initialReq = https.request( reqOptions, ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		compile( JSON.parse( data ) );
	});
});
initialReq.write( postData );
initialReq.end();

class Camera {
	constructor ( cam, url ) {
		this.location = {
			description: cam.tooltip,
			latitude: cam.lat,
			longitude: cam.lon
		};
		this.url = url;
		this.encoding = 'H.264';
		this.format = 'M3U8';
		//this.markedForReview = false; //the exclusion here was decided to be the new standard, to limit unneeded bytes
	}
}

function getURLandPush ( cam ) {
	return new Promise( ( resolve, reject ) => {
		const infoUrl = cam.framehtml.slice( cam.framehtml.indexOf( 'src="' ) + 5, cam.framehtml.indexOf( '" >' ) );
		https.request( 'https://www.mdottraffic.com/' + infoUrl, ( res ) => {
			let data = '';

			res.on( 'data', ( chunk ) => {
				data += chunk;
			});

			res.on( 'end', () => {
				const linkStart = data.indexOf( 'https://streamingjxn' );
				if ( linkStart !== -1 ) {
					const camServer = data[linkStart + + 'https://streamingjxn'.length];
					data = data.slice( linkStart + 'https://streamingjxn#.mdottraffic.com/thumbnail?application=rtplive&streamname='.length );
					const camId = data.slice( 0, data.indexOf( '.' ) );
					const url = `https://streamingjxn${camServer}.mdottraffic.com/rtplive/${camId}.stream/playlist.m3u8`;
					cameras.Mississippi.other.push( new Camera( cam, url ) );
				}

				resolve();
			});
		}).end();
	});
}

async function compile ( data ) {
	const requests = [];
	if ( !cameras.Mississippi ) {
		cameras.Mississippi = {};
	}

	for ( const cam of data.d ) {
		if ( !cameras.Mississippi.other ) {
			cameras.Mississippi.other = [];
		}

		requests.push( getURLandPush( cam ) );
	}

	await Promise.all( requests );
	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}