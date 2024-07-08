import standardizeDirection from '../utils/standardizeDirection.cjs';

const options = {
	method: 'GET',
	headers: { 'Content-Type': 'application/json, text/plain, */*' }
};

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
}

class Camera {
	constructor ( cam, url, direction, description ) {
		this.description = description.trim().replaceAll('  ',' ');
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
	const data = await ( await fetch( 'https://tkmservices.ibb.gov.tr/web/api/IntensityMap/v1/Camera', options ) ).json();
	const cameras = {};
	/* Exaple data:
    {
      "Group": [],
      "ID": 1,
      "Name": "ACIBADEM SARAYARDI CD.",
      "XCoord": "29.0358434",
      "YCoord": "40.9965959",
      "VideoURL": "https://hls.ibb.gov.tr/tkm4/hls/1.stream/playlist.m3u8",
      "VideoURL_SSL": "https://hls.ibb.gov.tr/tkm4/hls/1.stream/playlist.m3u8",
      "GroupId": 0,
      "Images": [
        "https://tkmservices.ibb.gov.tr/web/Handlers/CameraImage.ashx?pno=0&cno=1",
        "https://tkmservices.ibb.gov.tr/web/Handlers/CameraImage.ashx?pno=1&cno=1",
        "https://tkmservices.ibb.gov.tr/web/Handlers/CameraImage.ashx?pno=2&cno=1"
      ]
    },
    {
      "Group": [
        {
          "ID": 70,
          "Name": "D100 ANITMEZAR 1",
          "XCoord": "28.92451832",
          "YCoord": "41.02760902",
          "VideoURL": "",
          "VideoURL_SSL": "",
          "GroupId": 69,
          "Images": [
            "https://tkmservices.ibb.gov.tr/web/Handlers/CameraImage.ashx?pno=0&cno=70",
            "https://tkmservices.ibb.gov.tr/web/Handlers/CameraImage.ashx?pno=1&cno=70",
            "https://tkmservices.ibb.gov.tr/web/Handlers/CameraImage.ashx?pno=2&cno=70"
          ]
        }
      ],
      "ID": 69,
      "Name": "D100 ANITMEZAR",
      "XCoord": "28.92451832",
      "YCoord": "41.02760902",
      "VideoURL": "https://hls.ibb.gov.tr/tkm4/hls/69.stream/playlist.m3u8",
      "VideoURL_SSL": "https://hls.ibb.gov.tr/tkm4/hls/69.stream/playlist.m3u8",
      "GroupId": 0,
      "Images": [
        "https://tkmservices.ibb.gov.tr/web/Handlers/CameraImage.ashx?pno=0&cno=69",
        "https://tkmservices.ibb.gov.tr/web/Handlers/CameraImage.ashx?pno=1&cno=69",
        "https://tkmservices.ibb.gov.tr/web/Handlers/CameraImage.ashx?pno=2&cno=69"
      ]
    }

    if(asd){
      asafsa
      
    }

    {
      "description": "US 90/98 East Bankhead Tunnel Portal",
      "latitude": 30.69345,
      "longitude": -88.02954,
      "direction": "Any",
      "url": "https://cdn3.wowza.com/5/STdsVlh5eDk3OHBa/mobile-fastly/mob-cam-c010.stream/playlist.m3u8",
      "encoding": "H.264",
      "format": "M3U8"
    }
    */
	data.forEach( cam => {
		const county = 'UYM';
		if ( !cameras[county] ) {
			cameras[county] = [];
		}

		if ( cam.Group.length > 0 ) {
			cam.Group.forEach( camGroup => {
				const camera = {};
				camera.id = camGroup?.ID;
				camera.description = camGroup?.Name;
				camera.latitude = camGroup?.YCoord;
				camera.longitude = camGroup?.XCoord;
				camera.direction = '';
				camera.url = camGroup?.VideoURL || camGroup?.VideoURL_SSL;

				cameras[county].push( new Camera( camera, camera.url, camera.direction, camera.description ) );
			});
		}

		const camera = {};
		camera.id = cam?.ID;
		camera.description = cam?.Name;
		camera.latitude = cam?.YCoord;
		camera.longitude = cam?.XCoord;
		camera.direction = '';
		camera.url = cam?.VideoURL || cam?.VideoURL_SSL;

		cameras[county].push( new Camera( camera, camera.url, camera.direction, camera.description ) );
	});

	return cameras;
}

export default [ 'İstanbul', compile ];