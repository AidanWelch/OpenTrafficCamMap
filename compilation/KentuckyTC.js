'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://services2.arcgis.com/CcI36Pduqd0OR4W9/arcgis/rest/services/trafficCamerasCur_Prd/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=', ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		Compile( JSON.parse( data ) );
	});
}).end();

class Camera {
	constructor ( cam ) {
		this.location = {
			description: cam.attributes.description,
			direction: cam.attributes.direction,
			latitude: cam.attributes.latitude,
			longitude: cam.attributes.longitude
		};
		this.url = cam.attributes.snapshot;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
		this.marked_for_review = false;
	}
}

function Compile ( data ){
	if ( !cameras.Kentucky ){
		cameras.Kentucky = {};
	}

	for ( const cam of data.features ){
		if ( cam.attributes.county !== null ){
			if ( !cameras.Kentucky[cam.attributes.county] ){
				cameras.Kentucky[cam.attributes.county] = [];
			}

			cameras.Kentucky[cam.attributes.county].push( new Camera( cam ) );
		} else {
			if ( !cameras.Kentucky.other ){
				cameras.Kentucky.other = [];
			}

			cameras.Kentucky.other.push( new Camera( cam ) );
		}
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}