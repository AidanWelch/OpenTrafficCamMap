'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

const requests = [];

https.request( 'https://fl511.com/map/mapIcons/Cameras', ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		compile( JSON.parse( data ) );
	});
}).end();

class Camera {
	constructor ( cam, description ) {
		this.location = {
			description: description,
			latitude: cam.location[0],
			longitude: cam.location[1]
		};
		this.url = 'https://fl511.com/map/Cctv/' + cam.itemId;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
		this.updateRate = 360000; //I found this after checking one camera its possible it could be different across cameras
		this.markedForReview = false;
	}
}

function getDescription ( cam, queue ) {
	return new Promise( ( resolve, reject ) => {
		const req = https.request( `https://fl511.com/tooltip/Cameras/${cam.itemId}?lang=en-US`, ( res ) => {
			let data = '';

			res.on( 'data', ( chunk ) => {
				data += chunk;
			});

			res.on( 'end', () => {
				console.info( queue + ' : ' + cam.itemId );
				data = data.replace( /\r/g, '' );
				data = data.split( '\n' );
				const description = data[25].trim();
				cameras.Florida.other.push( new Camera( cam, description ) );
				resolve();
			});
		});
		req.setTimeout( 5000, () => {
			console.error( '========Timeout ' + cam.itemId );
			requests.push( getDescription( cam, queue ) );
			resolve();
		});
		req.end();
	});
}

async function compile ( data ) {
	//Max of 100 requests per minute, 20 per second.	Yes, that means it takes half an hour
	let totalThisMinute = 0;
	let totalThisSecond = 0;
	let minutes = 0;
	setInterval( () => { totalThisSecond = 0; }, 1000 );
	setInterval( () => { totalThisMinute = 0; minutes++; console.info( minutes + ' minutes' ); }, 60000 );
	if ( !cameras.Florida ) {
		cameras.Florida = {};
	}

	for ( const [ i, cam ] of data.item2.entries() ) {
		if ( !cameras.Florida.other ) {
			cameras.Florida.other = [];
		}

		while ( totalThisSecond > 3 || totalThisMinute > 90 ) {
			await new Promise( ( res ) => { setTimeout( res, 5 ); });
		}

		totalThisMinute++;
		totalThisSecond++;
		requests.push( getDescription( cam, Math.round( ( i/data.item2.length )*100 ) + '%' ) );
	}

	await Promise.all( requests );
	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
	process.exit();
}