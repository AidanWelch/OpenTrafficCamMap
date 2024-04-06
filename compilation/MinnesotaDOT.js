/* eslint-disable no-console */
'use strict';
const fs = require( 'fs' );
const https = require( 'https' );
const parseHTML = require( 'node-html-parser' ).parse;

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://lb.511mn.org/mnlb/cameras/routeselect.jsf', ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		compile( parseHTML( data ) );
	});
}).end();

class Camera {
	constructor ( cam, url ) {
		this.location = {
			description: cam.description,
			latitude: Number( cam.latitude ),
			longitude: Number( cam.longitude )
		};
		this.url = url;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
		console.info( this );
	}
}

function compileCamera ( div ) {
	return new Promise( ( resolve, reject ) => {
		const cam = {};
		const a = div.firstChild;
		const img = a.firstChild;
		cam.description = img.getAttribute( 'title' );
		let reqLink = a.getAttribute( 'href' );
		reqLink = 'https://lb.511mn.org' + reqLink.slice( 0, reqLink.indexOf( ';' ) ) + reqLink.slice( reqLink.indexOf( '?' ) );
		https.request( reqLink, ( res ) => {
			let data = '';

			res.on( 'data', ( chunk ) => {
				data += chunk;
			});

			res.on( 'end', () => {
				data = parseHTML( data );

				let centerString = data.querySelector( '#j_idt170' ).nextSibling.getAttribute( 'src' );
				centerString = centerString.slice( centerString.indexOf( 'center=' ) + 7, centerString.indexOf( '&' ) );
				cam.latitude = centerString.slice( 0, centerString.indexOf( '%2C' ) );
				cam.longitude = centerString.slice( centerString.indexOf( '%2C' ) + 3 );

				let camsMatched = true;
				let i = 0;
				while ( camsMatched ) {
					const camImg = data.querySelector( `#cam-${i}-img` );
					i++;
					if ( camImg ) {
						cameras.Minnesota.other.push( new Camera( cam, camImg.getAttribute( 'src' ) ) );
					} else {
						camsMatched = false;
					}
				}

				resolve();
			});
		}).end();

		setTimeout( () => {
			reject( img.getAttribute( 'title' ) + ' Timed Out!' );
		}, 15000 );
	});
}

async function compile ( data ) {
	if ( !cameras.Minnesota ) {
		cameras.Minnesota = {};
	}

	const divs = data.querySelectorAll( '#j_idt115' );
	const promises = [];
	for ( const div of divs ) {
		if ( !cameras.Minnesota.other ) {
			cameras.Minnesota.other = [];
		}

		promises.push( compileCamera( div ) );
	}

	await Promise.all( promises );
	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}