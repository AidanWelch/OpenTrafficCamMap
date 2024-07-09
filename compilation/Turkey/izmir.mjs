import standardizeDirection from '../utils/standardizeDirection.cjs';

const options = {
	method: 'GET',
	headers: {
		'Content-Type': 'application/json, text/plain, */*',
		'Accept-Encoding': 'gzip, deflate, br, zstd',
		'X-Requested-With': 'XMLHttpRequest'
	}
};

class Camera {
	constructor ( cam, url, direction, description ) {
		this.description = description.trim();
		if ( direction.length !== 0 ) {
			this.direction = standardizeDirection( direction );
		}

		this.latitude = cam.latitude;
		this.longitude = cam.longitude;
		this.url = url;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
	}
}

async function compile () {
	const data = await ( await fetch( 'http://izum.izmir.bel.tr/v1/workspaces/cameras', options ) ).json();
	const cameras = {};
	/* Exaple data:
		{
			"ufid": "CAM-TR-IZM-K68",
			"name": "TEPECIK KAVSAGI",
			"mjpegStreamUrl": "https://izum-cams.izmir.bel.tr/mjpeg/f83633c5-f837-4f7d-afda-c0446eada095",
			"snapshotUrl": "/v1/api/images/658ad1e5625e4f18f842156b",
			"lat": 38.42222492015706,
			"lng": 27.15298284524139
		}
	*/
	data.forEach( cam => {
		const county = 'İZUM';
		if ( !cameras[county] ) {
			cameras[county] = [];
		}

		const camera = {};
		camera.id = cam?.ufid;
		camera.description = cam?.name;
		camera.latitude = cam?.lat;
		camera.longitude = cam?.lng;
		camera.direction = '';
		camera.url = cam?.mjpegStreamUrl;

		cameras[county].push( new Camera( camera, camera.url, camera.direction, camera.description ) );
	});

	return cameras;
}

export default [ 'İzmir', compile ];