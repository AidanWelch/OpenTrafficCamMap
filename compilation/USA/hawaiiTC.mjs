
class Camera {
	constructor ( cam ) {
		this.description = cam.description;
		this.latitude = cam.location.coordinates.latitude;
		this.longitude = cam.location.coordinates.longitude;
        
		const lastImage = cam.images[cam.images.length - 1];
		this.url = lastImage.nativeURL;
		if ( lastImage.type === 'Snapshot' ) {
			this.encoding = 'JPEG';
			this.format = 'IMAGE_STREAM';
		} else {
			this.encoding = 'H.264';
		    this.format = 'M3U8';
		}
	}
}

async function compile ( ) {
	const data = await ( await fetch( 'http://a.cameraservice.goakamai.org/cameras', { headers: { 'X-Icx-Copyright': 'ICxTransportationGroup', 'X-Icx-Ts': Date.now(), 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36', 'Origin': 'http://goakamai.org' } }) ).json();
	const cameras = {};

	for ( const cam of data ) {
		if ( cameras.other === undefined ) {
			cameras.other = [];
		}

		cameras.other.push( new Camera( cam ) );
	}

	return cameras;
}

export default [ 'Hawaii', compile ];