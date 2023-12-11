'use strict';
const fs = require( 'fs' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );
const axios = require( 'axios' );

axios.post( 'https://kandrive.org/api/graphql',
	[
		{
			'query': 'query MapFeatures($input: MapFeaturesArgs!, $plowType: String) { mapFeaturesQuery(input: $input) { mapFeatures { bbox tooltip uri ...Features __typename ... on Camera { views(limit: 5) { uri url category } } ... on Plow { views(limit: 5, plowType: $plowType) { uri url category } } } error { message type } } } fragment Features on FeatureCollection { features { id geometry properties } }',
			'variables': {
				'input': {
					'north': 40.11178,
					'south': 36.84016,
					'east': -94.04641,
					'west': -101.86318,
					'zoom': 9,
					'layerSlugs': [
						'normalCameras'
					],
					'nonClusterableUris': [
						'dashboard'
					]
				},
				'plowType': 'plowCameras'
			}
		}
	]
).then( ( response ) => {
	compile( response.data[0].data.mapFeaturesQuery );
}, ( error ) => {
	console.log( error );
});

class Camera {
	constructor ( cam ) {
		this.location = {
			description: cam.tooltip,
			longitude: cam.features[0].geometry.coordinates[0],
			latitude: cam.features[0].geometry.coordinates[1]
		};
		this.url = cam.views[0].url;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
		this.markedForReview = false;
	}
}

function compile ( data ) {
	if ( !cameras.Kansas ) {
		cameras.Kansas = {};
	}

	for ( const cam of data.mapFeatures ) {
		const tooltip = cam.tooltip.replace( 'DMS_', '' );
		if ( tooltip !== null && ( tooltip.startsWith( 'I-' ) || tooltip.startsWith( 'US-' ) || tooltip.startsWith( 'M-' ) || tooltip.startsWith( 'K-' ) ) ) {
			const urlArr = tooltip.split( ' ' );
			const region = urlArr[0];
			if ( !cameras.Kansas[region] ) {
				cameras.Kansas[region] = [];
			}

			cameras.Kansas[region].push( new Camera( cam ) );
		} else {
			if ( !cameras.Kansas.other ) {
				cameras.Kansas.other = [];
			}

			cameras.Kansas.other.push( new Camera( cam ) );
		}
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}