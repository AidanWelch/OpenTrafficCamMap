import standardizeDirection from '../utils/standardizeDirection.cjs';

class Camera {
	constructor ( cam ) {
		this.description = cam.Description;
		if ( cam.Cameras[0].Direction !== 'View' ) {
			this.direction = standardizeDirection( cam.Cameras[0].Direction );
		}

		this.latitude = cam.Latitude;
		this.longitude = cam.Longitude;
		this.url = cam.Cameras[0].LargeURL;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
	}
}

async function compile ( ) {
	const data = await ( await fetch( 'https://api.ohgo.com/roadmarkers/TrafficSpeedAndAlertMarkers?pointData=%7B%22lowLongitude%22%3A-89.66187570628011,%22highLongitude%22%3A-77.75269601878011,%22lowLatitude%22%3A34.02226667937285,%22highLatitude%22%3A44.423279507563336,%22routeDirection%22%3A%22%22,%22routeName%22%3A%22%22%7D' ) ).json();
	const cameras = {};

	for ( const cam of data.CameraMarkers ) {
		if ( cameras.other === undefined ) {
			cameras.other = [];
		}

		cameras.other.push( new Camera( cam ) );
	}

	return cameras;
}

export default [ 'Ohio', compile ];