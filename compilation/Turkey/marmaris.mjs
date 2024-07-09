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
	let data = await ( await fetch( 'https://wowza.yayin.com.tr/playlist/marmarisbel/playlist_marmarisbel.json', options ) ).json();
	const cameras = {};

  data = data.playlist;

  const locations = {
    "Meydan"           : "36.8548769,28.2678585",
    "Uzun Yalı"        : "36.8516576,28.2662401",
    "İçmeler"          : "36.802893,28.2317378",
    "Atatürk Bulvarı"  : "36.8552241,28.2682233",
    "Bozburun"         : "36.6755598,28.0613853",
    "Kordon Caddesi 1" : "36.8512351,28.2686464",
    "Kordon Caddesi 2" : "36.8515991,28.2726258",
  }
	/* Exaple data:
    {
      "mediaid": "meydan",
      "description": "Meydan",
      "tags": "Meydan",
      "title": "Meydan",
      "variations": [],
      "feedid": "Meydan",
      "pubdate": 1720446794,
      "image": "//wowza.yayin.com.tr/playlist/marmarisbel/meydan.jpg",
      "sources": [
        {
          "file": "//cdn-ipkamera.yayin.com.tr/marmarisbel/meydan/playlist.m3u8",
          "type": "application/vnd.apple.mpegurl"
        },
        {
          "file": "//cdn-ipkamera.yayin.com.tr/marmarisbel/meydan/manifest.mpd",
          "type": "dash"
        }
      ],
      "recommendations": "//wowza.yayin.com.tr/playlist/marmarisbel/playlist_marmarisbel.json",
      "origPlatform": "Kamera"
    },
    */
	data.forEach( cam => {
		const county = 'Belediye';
		if ( !cameras[county] ) {
			cameras[county] = [];
		}

		const camera = {};
		camera.id = cam?.mediaid;
		camera.description = cam?.description;
		camera.latitude = locations.hasOwnProperty(cam?.description) ? locations[cam?.description].split(',')[0] : '';
		camera.longitude = locations.hasOwnProperty(cam?.description) ? locations[cam?.description].split(',')[1] : '';
		camera.direction = '',
		camera.url = (cam?.sources[0]?.file.includes('https://')) ? cam?.sources[0]?.file.replaceAll('//', 'https://') : cam?.sources[0]?.file;

		cameras[county].push( new Camera( camera, camera.url, camera.direction, camera.description ) );
	});

	return cameras;
}

export default [ 'Marmaris', compile ];