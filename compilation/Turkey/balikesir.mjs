import standardizeDirection from '../utils/standardizeDirection.cjs';
import * as cheerio from 'cheerio';

const options = {
	method: 'GET',
	headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Content-Type': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
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
		this.encoding = 'H.264';
		this.format = 'M3U8';
	}
}


async function getDetail ( url ) {
    const data = await ( await fetch( url, options ) ).text();
    const $ = cheerio.load( data );

    const haritaLink = $('a[href*="maps.google"]').attr('href');
    if ( !haritaLink ) return '';
    
    const enlemBoylam = haritaLink.split( 'loc:@' )[1].split(',');
    if ( !enlemBoylam ) return '';

    let latitude = enlemBoylam[0];
    // Check 2 . in latitude
    let latitudeLenght = enlemBoylam[0].toString().split('.');
    if ( latitudeLenght.length > 2 ) {
        latitude = latitudeLenght.join('');
        latitude = latitude.slice( 0, 2 ) + '.' + latitude.slice( 2 );
    }
    latitude = parseFloat( latitude );

    let longitude = enlemBoylam[1];
    // Check 2 . in longitude
    let longitudeLenght = enlemBoylam[1].toString().split('.');
    if ( longitudeLenght.length > 2 ) {
        longitude = longitudeLenght.join('');
        longitude = longitude.slice( 0, 2 ) + '.' + longitude.slice( 2 );
    }
    longitude = parseFloat( longitude );

    if(url === 'https://sehirkamera.balikesir.bel.tr/Kamera?KameraID=23'){ // Altınoluk Kordon 2
        if(!latitude || !longitude){
            latitude = 39.566041;
            longitude = 26.747277;
        }
    }

    const iframe = $('iframe').attr('src');
    if ( !iframe ) return '';

    /*
    <iframe id="frameDemo" style="border: 4px solid #ffffff; box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px; border-radius: 1em !important;" frameborder="0" scrolling="no" width="100%" src="https://player.tvkur.com/l/cisjnt1aojt2lfp2k5q0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>
    */
    const hlsId = data.match( /https:\/\/player.tvkur.com\/l\/(.*?)"/ );
    if ( !hlsId ) return '';

    const hls = `https://content.tvkur.com/l/${hlsId[1]}/master.m3u8`;

    return {
        latitude,
        longitude,
        hls
    };
}

async function compile () {
	const data = await ( await fetch( 'https://sehirkamera.balikesir.bel.tr', options ) ).text();
    let $ = cheerio.load( data );
    const cameras = {};
    let tempCams = [];
    $('section#Kameralar').find('div.kesfet_kutu').each( ( i, el ) => {
        return tempCams.push({
            id: i,
            description: $(el).find('div.kesfet_kutu_baslik').text(),
            url: `https://sehirkamera.balikesir.bel.tr${$(el).find('a').attr('href')}`
        });
    });

    for ( const cam of tempCams ) {
        const county = 'Belediye';
		if ( !cameras[county] ) {
			cameras[county] = [];
		}
        
        const data = await getDetail( cam.url );
        if ( !data ) continue;

        const camera = {};
        camera.id = cam.id;
        camera.description = cam.description;
        camera.latitude = data.latitude || '';
        camera.longitude = data.longitude || '';
        camera.direction = '';
        camera.url = data.hls;

        cameras[county].push( new Camera( camera, camera.url, camera.direction, camera.description ) );
        
    }

    return cameras;
}

export default [ 'Balıkesir', compile ];