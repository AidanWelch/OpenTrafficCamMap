'use strict';
const fs = require( 'fs' );
const https = require( 'https' );
const parseHTML = require( 'node-html-parser' ).parse;

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://newengland511.org/map/mapIcons/Cameras', ( res ) => {
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
			longitude: cam.location[0],
			latitude: cam.location[1]
		};
		this.url = 'http://newengland511.org/map/Cctv/' + cam.itemId;
		this.encoding = 'JPG';
		this.format = 'IMAGE_STREAM';
	}
}

function compile ( data ) {
	const promises = [];
	const delayIncrement = 1000;
	let delay = 0;

	if ( !cameras['New Hampshire'] ) {
		cameras['New Hampshire'] = {};
	}

	if ( !cameras.Maine ) {
		cameras.Maine = {};
	}

	if ( !cameras.Vermont ) {
		cameras.Vermont = {};
	}

	data = data.item2;
	for ( const mapCam of data ) {
		const tmpCam = { ...mapCam };
		//Email address is required parameter
		promises.push( new Promise( ( resolve ) => setTimeout( resolve, delay ) ).then( () => getLocationData({ reverseUrl: 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + tmpCam.location[0] + '&lon=' + tmpCam.location[1] + '&email=otc@armchairresearch.org', ...tmpCam }) ) );
		delay += delayIncrement;
	}

	console.log( 'This will take about ' + Math.ceil( delay/1000/60 ) + ' minutes.' );

	Promise.all( promises ).then( () => {
		fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
	});
}

const getLocationData = ( cam ) => {
	https.request( cam.reverseUrl, ( res ) => {
		let data = '';

		res.on( 'data', ( chunk ) => {
			data += chunk;
		});

		res.on( 'end', () => {
			const location = JSON.parse( data );
			let newCamera = {};
			if ( !!location.address && !!location.address.state && !!location.address.county ) {
				if ( !cameras[location.address.state][location.address.county] ) {
					cameras[location.address.state][location.address.county] = [];
				}

				cameras[location.address.state][location.address.county].push( new Camera( cam ) );
				newCamera = cameras[location.address.state][location.address.county][cameras[location.address.state][location.address.county].length - 1];
			} else {
				if ( !cameras[location.address.state].other ) {
					cameras[location.address.state].other = [];
				}

				cameras[location.address.state].other.push( new Camera( cam ) );
				newCamera = cameras[location.address.state].other[cameras[location.address.state].other.length - 1];
			}

			https.request( 'https://newengland511.org/tooltip/Cameras/' + cam.itemId, ( res ) => {
				let data = '';

				res.on( 'data', ( chunk ) => {
					data += chunk;
				});

				res.on( 'end', () => {
					data = parseHTML( data );

					const description = data.querySelector( '#CameraTooltipDescriptionColumn b' ).childNodes[0].rawText;

					let direction = '';
					if ( description.includes( 'North' ) || description.includes( 'north' ) || description.includes( 'NB' ) ) { direction = 'N'; } else if ( description.includes( 'East' ) || description.includes( 'east' ) || description.includes( 'EB' ) ) { direction = 'E'; } else if ( description.includes( 'South' ) || description.includes( 'south' ) || description.includes( 'SB' ) ) { direction = 'S'; } else if ( description.includes( 'West' ) || description.includes( 'west' ) || description.includes( 'WB' ) ) { direction = 'W'; }

					newCamera.description = description;
					newCamera.location.direction = direction;
				});
			}).end();
		});
	}).end();
};