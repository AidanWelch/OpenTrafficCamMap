import standardizeDirection from '../utils/standardizeDirection.cjs';

class Camera {
	constructor ( cam ) {
		this.location = {
			description: cam.primaryRoad + ' ' + cam.crossStreet,
			latitude: cam.latitude,
			longitude: cam.longitude,
			direction: standardizeDirection( cam.direction )
		};
		this.url = cam.streamUrl,
		this.encoding = 'H.264';
		this.format = 'M3U8';
		this.markedForReview = cam.disabled;
	}
}

async function compile ( fetchinit ){
	const data = JSON.parse( await fetch( 'https://algotraffic.com/api/v1/layers/cameras?null', fetchinit ) );
	const res = {};
	for ( let j = 0; j < data.length; j++ ) {
		const camArr = data[j].entries;

		for ( const cam of camArr ){
			if ( cam.organizationId !== null ){
				if ( cam.organizationId in res === false ){
					res[cam.organizationId] = [];
				}

				res[cam.organizationId].push( new Camera( cam ) );
			} else {
				if ( 'other' in res === false ){
					res.other = [];
				}

				res.other.push( new Camera( cam ) );
			}
		}
	}

	return res;
}

export default [ 'Alabama', compile ];