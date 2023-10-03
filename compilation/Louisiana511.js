'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

const requests = [];

https.request( 'https://www.511la.org/map/mapIcons/Cameras', ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		Compile( JSON.parse( data ) );
	});
}).end();

class Camera {
	constructor ( cam, description, url ) {
		this.location = {
			description: description,
			latitude: cam.location[0],
			longitude: cam.location[1]
		};
		this.url = url;
		this.encoding = 'H.264';
		this.format = 'M3U8';
		this.marked_for_review = false;
	}
}

function getDescription ( cam, queue ) {
	return new Promise( ( resolve, reject ) => {
		const req = https.request( `https://www.511la.org/tooltip/Cameras/${cam.itemId.split( '|' )[0]}%7C${cam.itemId.split( '|' )[1]}?lang=en-US`, ( res ) => {
			let data = '';

			res.on( 'data', ( chunk ) => {
				data += chunk;
			});

			res.on( 'end', () => {
				console.log( queue + ' : ' + cam.itemId );
				const description = data.slice( data.indexOf( '<b>' ) + 3, data.indexOf( '</b>' ) );
				const url = data.slice( data.indexOf( 'data-videourl="' ) + 15, data.indexOf( '" data-streamtype=' ) );
				cameras.Louisiana.other.push( new Camera( cam, description, url ) );
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

async function Compile ( data ) {
	//Max of 100 requests per minute, 20 per second.  This system is essentially the same as Florida's probably the same company
	let total_this_minute = 0;
	let total_this_second = 0;
	let minutes = 0;
	setInterval( () => { total_this_second = 0; }, 1000 );
	setInterval( () => { total_this_minute = 0; minutes++; console.log( minutes + ' minutes' ); }, 60000 );
	if ( !cameras.Louisiana ) {
		cameras.Louisiana = {};
	}

	for ( const [ i, cam ] of data.item2.entries() ) {
		if ( !cameras.Louisiana.other ) {
			cameras.Louisiana.other = [];
		}

		while ( total_this_second > 15 || total_this_minute > 90 ) {
			await new Promise( ( res ) => { setTimeout( res, 5 ); });
		}

		total_this_minute++;
		total_this_second++;
		requests.push( getDescription( cam, Math.round( ( i/data.item2.length )*100 ) + '%' ) );
	}

	await Promise.all( requests );
	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
	process.exit();
}