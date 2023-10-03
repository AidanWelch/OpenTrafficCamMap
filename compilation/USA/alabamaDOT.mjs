import standardizeDirection from '../utils/standardizeDirection.cjs';

class Camera {
	constructor ( cam ) {
		this.description = cam.primaryRoad.trim() + ' ' + cam.crossStreet.trim();
		this.latitude = cam.latitude;
		this.longitude = cam.longitude;
		if ( cam.direction.length !== 0 ) {
			this.direction = standardizeDirection( cam.direction );
		}

		this.url = cam.streamUrl,
		this.encoding = 'H.264';
		this.format = 'M3U8';
		if ( cam.disabled ) {
			this.markedForReview = true;
		}
	}
}

async function compile ( fetchinit ) {
	const data = await ( await fetch( 'https://algotraffic.com/api/v1/layers/cameras?null=', fetchinit ) ).json();
	const cameras = {};
	for ( let j = 0; j < data.length; j++ ) {
		const camArr = data[j].entries;

		for ( const cam of camArr ) {
			const county = cam.organizationId ?? 'other';
			if ( county in cameras === false ) {
				cameras[county] = [];
			}

			cameras[county].push( new Camera( cam ) );
		}
	}

	return cameras;
}

export default [ 'Alabama', compile ];