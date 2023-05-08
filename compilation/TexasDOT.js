'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

function getRequestOptions ( path, data ) {
	return {
		host: 'its.txdot.gov',
		path: path,
		port: 443,
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Content-Length': data.length
		}
	};
}

const req = https.request( getRequestOptions( '/ITS_WEB/FrontEnd/svc/DataRequestWebService.svc/GetMapRegions', '{}' ), ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		compile( data.split( ',' ) );
	});
});

req.write( '{}' );
req.end();

class Camera {
	constructor ( url, direction, description, latitude, longitude ) {
		this.location = {
			description: description,
			direction: direction,
			latitude: latitude,
			longitude: longitude
		};
		this.url = url;
		this.encoding = 'JPEG';
		this.format = 'UNIQUE_TEXASDOT';
		this.marked_for_review = false;
	}
}

async function compile ( data ){
	const regions = new Map();
	for ( let i = 0; i < data.length; i++ ){
		if ( /^[A-Z][A-Z][A-Z]$/.test( data[i] ) ){
			regions.set( data[i], data[i+1] );
		}
	}

	const requests = [];

	if ( !cameras.Texas ){
		cameras.Texas = {};
	}

	regions.forEach( ( name, key, _ ) => {
		requests.push( new Promise( ( resolve, reject ) => {
			if ( !cameras.Texas[name] ){
				cameras.Texas[name] = [];
			}

			const requestData = '{"arguments": "' + key + ',100,-200,0,0"}';
			const req = https.request( getRequestOptions( '/ITS_WEB/FrontEnd/svc/DataRequestWebService.svc/GetCctvDataOfArea', requestData ), ( res ) => {
				let data = '';

				res.on( 'data', ( chunk ) => {
					data += chunk;
				});

				res.on( 'end', () => {
					cameras.Texas[name] = cameras.Texas[name].concat( compileRegion( data.split( ',' ) ) );
					resolve();
				});
			});
			req.write( requestData );
			req.setTimeout( 10000, () => {
				console.error( 'Timeout ' + name );
				reject();
			});
			req.end();
		}) );
	});

	await Promise.all( requests );

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}

function compileRegion ( data ){
	const cams = [];
	for ( let i = 0; i < data.length; i++ ){
		if ( /__/.test( data[i] ) ){ //This is possibly the dumbest thing I've ever written
			if ( data[i + 1] === 'Device Online' ){
				cams.push( new Camera( data[i], data[i+9], data[i-1], parseInt( data[i+3] )/1000000, parseInt( data[i+4] )/1000000 ) );
			}
		}
	}

	return cams;
}