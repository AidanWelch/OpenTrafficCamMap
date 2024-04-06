import standardizeDirection from '../utils/standardizeDirection.cjs';

const options = {
	method: 'GET',
	headers: { 'Content-Type': 'application/json, text/plain, */*' }
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
		this.encoding = 'H.264';
		this.format = 'M3U8';
	}
}

async function compile () {
	const response = await ( await fetch( 'https://publicapi.ramazansancar.com.tr/ankaraBuyukSehirBelediyesi/karAraclari/', options ) ).json();
	const data = response.data;
	const cameras = {};
	/* Exaple data:
		{
			"id": "6587343d23c67473bb67a024",
			"deviceNo": "003500129B",
			"nodeId": "718066",
			"name": "06 DV 5488-718066",
			"plate": "06DV5488",
			"groupId": 386,
			"groupName": "KarKureme",
			"lat": 39.942829,
			"long": 32.555527,
			"camera": {
				"status": false,
				"start": null,
				"check": null,
				"streamUrl": "https://stream.ankara.bel.tr/live/003500129B/index.m3u8"
			},
			"state": false
		},
		{
			"id": "6587343d23c67473bb67a033",
			"deviceNo": "0035000F56",
			"nodeId": "718037",
			"name": "06 DV 5498-718037",
			"plate": "06DV5498",
			"groupId": 386,
			"groupName": "KarKureme",
			"lat": 39.853607,
			"long": 32.817719,
			"camera": {
				"status": true,
				"start": "https://publicapi.ramazansancar.com.tr/ankaraBuyukSehirBelediyesi/karAraclari/start/0035000F56",
				"check": "https://publicapi.ramazansancar.com.tr/ankaraBuyukSehirBelediyesi/karAraclari/check/0035000F56",
				"streamUrl": "https://stream.ankara.bel.tr/live/0035000F56/index.m3u8"
			},
			"state": true
		}
	*/
	data.forEach( cam => {
		const county = 'Kar Takip';
		if ( !cameras[county] ) {
			cameras[county] = [];
		}

		if ( cam?.camera?.status === false ) { return; }

		const camera = {};
		camera.id = cam?.id;
		camera.description = cam?.name;
		camera.latitude = cam?.lat;
		camera.longitude = cam?.long;
		camera.direction = '';
		camera.url = cam?.camera?.streamUrl;

		cameras[county].push( new Camera( camera, camera.url, camera.direction, camera.description ) );
	});

	return cameras;
}

export default [ 'Ankara', compile ];