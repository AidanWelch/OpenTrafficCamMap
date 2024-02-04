import standardizeDirection from '../utils/standardizeDirection.cjs';

class Camera {
	constructor ( cam ) {
		if ( cam.attributes.CompassDirection !== null ) {
			this.direction = standardizeDirection( cam.attributes.CompassDirection );
		}

		this.description = cam.attributes.CameraTitle;
		this.latitude = convertLatitude( cam.geometry.y );
		this.longitude = convertLongitude( cam.geometry.x );
		this.url = cam.attributes.ImageURL;
		this.encoding = 'JPG';
		this.format = 'IMAGE_STREAM';
	}
}

async function compile ( ) {
	const data = await ( await fetch( 'https://data.wsdot.wa.gov/travelcenter/Cameras.json' ) ).json();
	const cameras = {};

	for ( const cam of data.features ) {
		if ( cameras.other === undefined ) {
			cameras.other = [];
		}

		cameras.other.push( new Camera( cam ) );
	}

	return cameras;
}

export default [ 'Washington', compile ];

function convertLongitude ( long3857 ) {
	const X = 20037508.34;
	const long4326 = ( long3857*180 )/X;
	return long4326;
}

function convertLatitude ( lat3857 ) {
	const e = 2.7182818284;
	const X = 20037508.34;
	let lat4326 = lat3857/( X / 180 );
	const exponent = ( Math.PI / 180 ) * lat4326;
	lat4326 = Math.atan( e ** exponent );
	lat4326 = lat4326 / ( Math.PI / 360 );
	lat4326 = lat4326 - 90;
	return lat4326;
}