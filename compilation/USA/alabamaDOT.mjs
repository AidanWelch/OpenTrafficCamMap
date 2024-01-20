import standardizeDirection from '../utils/standardizeDirection.cjs';

class Camera {
	constructor ( cam ) {
		this.description = cam.location.displayRouteDesignator.trim() + ' ' + cam.location.crossStreet.trim();
		this.latitude = cam.location.latitude;
		this.longitude = cam.location.longitude;
		if ( cam.location.direction.length !== 0 ) {
			this.direction = standardizeDirection( cam.location.direction );
		}

		if ( cam.hlsUrl ) {
			this.url = cam.hlsUrl,
			this.encoding = 'H.264';
			this.format = 'M3U8';
		} else {
			this.url = cam.imageUrl;
			this.encoding = 'JPEG';
			this.format = 'IMAGE_STREAM';
		}

		if ( cam.disabled ) {
			this.markedForReview = true;
		}
	}
}

async function compile ( fetchinit ) {
	// OLD: https://algotraffic.com/api/v1/layers/cameras?null=
	const data = await ( await fetch( 'https://api.algotraffic.com/v3.0/Cameras', fetchinit ) ).json();
	const cameras = {};
	for ( let j = 0; j < data.length; j++ ) {
		const cam = data[j];

		const county = cam.location.county ?? 'other';
		if ( county in cameras === false ) {
			cameras[county] = [];
		}

		cameras[county].push( new Camera( cam ) );
	}

	return cameras;
}

export default [ 'Alabama', compile ];