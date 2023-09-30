import standardizeDirection from '../utils/standardizeDirection.cjs';

class Camera {
	constructor ( cam ) {
		this.description = cam.attributes.description;
		if ( cam.attributes.direction !== null ){
			this.direction = standardizeDirection( cam.attributes.direction );
		}

		this.latitude = cam.attributes.latitude;
		this.longitude = cam.attributes.longitude;
		this.url = cam.attributes.snapshot;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
	}
}

async function compile ( ){
	const data = await ( await fetch( 'https://services2.arcgis.com/CcI36Pduqd0OR4W9/arcgis/rest/services/trafficCamerasCur_Prd/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=' ) ).json();
	const cameras = {};

	for ( const cam of data.features ){
		// 'Offline' cams are offline, cams with null status are from out-of-state
		if ( cam.attributes.status === 'Online' ) {
			const county = cam.attributes.county ?? 'other';
			if ( county in cameras === false ) {
				cameras[county] = [];
			}

			cameras[county].push( new Camera( cam ) );
		}
	}

	return cameras;
}

export default [ 'Kentucky', compile ];