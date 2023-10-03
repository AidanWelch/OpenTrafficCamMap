import standardizeDirection from '../utils/standardizeDirection.cjs';

class Camera {
	constructor ( cam ) {
		this.description = cam.location.locationName.trim();
		if ( cam.location.direction.length !== 0 ) {
			this.direction = standardizeDirection( cam.location.direction );
		}

		this.latitude = parseFloat( cam.location.latitude );
		this.longitude = parseFloat( cam.location.longitude );

		if ( cam.inService !== 'true' ) {
			this.markedForReview = true;
		}

		if ( cam.imageData.streamingVideoURL.length !== 0 ) {
			this.url = cam.imageData.streamingVideoURL;
			this.encoding = 'H.264';
			this.format = 'M3U8';
			return;
		}

		this.url = cam.imageData.static.currentImageURL;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
		this.updateRate = parseFloat( cam.imageData.static.currentImageUpdateFrequency ) * 60 * 1000;
	}
}

async function compile () {
	const cameras = {};
	const promises = [];
	for ( let i = 1; i <= 12; i++ ) {
		promises.push(
			fetch( `https://cwwp2.dot.ca.gov/data/d${i}/cctv/cctvStatusD${String( i ).padStart( 2, '0' )}.json` )
				.then( data => data.json() )
				.then( ({ data }) => {
					for ( const { cctv } of data ) {
						if ( cctv.location.county in cameras === false ) {
							cameras[cctv.location.county] = [];
						}

						cameras[cctv.location.county].push( new Camera( cctv ) );
					}
				})
		);
	}

	await Promise.all( promises );

	return cameras;
}

export default [ 'California', compile ];