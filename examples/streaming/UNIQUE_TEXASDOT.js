'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../../cameras/USA.json' ) );
const cam = cameras.Texas.Paris[0];

const postData = `{"arguments": "${cam.url},thisisdumb"}`;

const options = {
	host: 'its.txdot.gov',
	path: '/ITS_WEB/FrontEnd/svc/DataRequestWebService.svc/GetCctvContent',
	port: 443,
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'Content-Length': postData.length
	}
};

const req = https.request( options, ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		let image = data.slice( data.indexOf( 'data' ), -1 );
		image = image.replace( /\\/g, '' ); //At this point this is a valid base64 image
		//below is just for saving
		image = image.replace( /^data:image\/jpeg;base64,/, '' ); //remove the headers
		fs.writeFileSync( cam.location.description + '.jpg', image, 'base64' );
	});
});

req.write( postData );
req.end();