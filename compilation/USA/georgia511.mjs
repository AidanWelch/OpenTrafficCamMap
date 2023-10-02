class Camera {
	constructor ( cam ) {
		this.description = cam.description1.trim();
		this.latitude = cam.latitude;
		this.longitude = cam.longitude;

		if ( cam.videoUrl === null ) {
			this.url = 'https://511ga.org/map/Cctv/' + cam.id;
			this.encoding = 'JPEG';
			this.format = 'IMAGE_STREAM';
			this.updateRate = cam.refreshRateMs;
			return;
		}

		if ( cam.videoUrl[cam.videoUrl.length - 1] === '8' ) {
			this.format = 'M3U8';
		} else {
			this.format = 'M3U9';
		}

		this.url = cam.videoUrl;
		this.encoding = 'H.264';
	}
}

async function compile ( ){
	// a requested length of 100,000 is used but otherwise this is the same as
	// taken from https://511ga.org/cctv?start=0&length=10&order%5Bi%5D=1&order%5Bdir%5D=asc
	const data = await ( await fetch( 'https://511ga.org/List/GetData/Cameras?query=%7B%22columns%22%3A%5B%7B%22data%22%3Anull%2C%22name%22%3A%22%22%7D%2C%7B%22name%22%3A%22sortId%22%2C%22s%22%3Atrue%7D%2C%7B%22name%22%3A%22roadway%22%2C%22s%22%3Atrue%7D%2C%7B%22data%22%3A3%2C%22name%22%3A%22%22%7D%5D%2C%22order%22%3A%5B%7B%22column%22%3A1%2C%22dir%22%3A%22asc%22%7D%2C%7B%22column%22%3A2%2C%22dir%22%3A%22asc%22%7D%5D%2C%22start%22%3A0%2C%22length%22%3A100000%2C%22search%22%3A%7B%22value%22%3A%22%22%7D%7D&lang=en-US' ) ).json();

	const cameras = {};

	for ( const cam of data.data ){
		const county = cam.county ?? 'other';
		if ( county in cameras === false ) {
			cameras[county] = [];
		}

		cameras[county].push( new Camera( cam ) );
	}

	return cameras;
}

export default [ 'Georgia', compile ];