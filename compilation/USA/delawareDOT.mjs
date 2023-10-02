class Camera {
	constructor ( cam ) {
		this.description = cam.title.trim();
		this.latitude = cam.lat;
		this.longitude = cam.lon;
		this.url = cam.urls.m3u8;
		this.encoding = 'H.264';
		this.format = 'M3U8';
		if ( !cam.enabled ) {
			this.markedForReview = true;
		}
	}
}

async function compile (){
	const cameras = {};
	const data = await ( await fetch( 'https://tmc.deldot.gov/json/videocamera.json' ) ).json();
	for ( const cam of data.videoCameras ){
		const county = cam.county || 'other';
		if ( county in cameras === false ){
			cameras[county] = [];
		}

		cameras[county].push( new Camera( cam ) );
	}

	return cameras;
}

export default [ 'Delaware', compile ];