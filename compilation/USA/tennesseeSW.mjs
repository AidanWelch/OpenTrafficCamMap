import standardizeDirection from '../utils/standardizeDirection.cjs';

class Camera {
	constructor ( cam ) {
		this.description = cam.description;
		this.latitude = cam.location.coordinates[0].lat;
		this.longitude = cam.location.coordinates[0].lng;
		this.url = cam.thumbnailUrl;
		this.encoding = 'PNG';
		this.format = 'IMAGE_STREAM';
	}
}

async function compile ( ) {
	const data = await ( await fetch( 'https://www.tdot.tn.gov/opendata/api/public/RoadwayCameras', { headers: { 'Apikey': '8d3b7a82635d476795c09b2c41facc60' } }) ).json();
	const cameras = {};

	for ( const cam of data ) {
		if ( cameras.other === undefined ) {
			cameras.other = [];
		}

		cameras.other.push( new Camera( cam ) );
	}

	return cameras;
}

export default [ 'Tennessee', compile ];