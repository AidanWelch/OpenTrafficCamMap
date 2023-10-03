import standardizeDirection from '../utils/standardizeDirection.cjs';

const postData = `
{
    "draw":1,
    "columns":[
       {
          "data":"sortId",
          "name":"sortId",
          "searchable":true,
          "orderable":true,
          "search":{
             "value":"",
             "regex":false
          },
          "visible":false,
          "isUtcDate":false,
          "isCollection":false
       },
       {
          "data":"roadway",
          "name":"roadway",
          "searchable":true,
          "orderable":true,
          "search":{
             "value":"",
             "regex":false
          },
          "visible":false,
          "isUtcDate":false,
          "isCollection":false
       },
       {
          "data":2,
          "name":"",
          "searchable":false,
          "orderable":false,
          "search":{
             "value":"",
             "regex":false
          },
          "isUtcDate":false,
          "isCollection":false
       }
    ],
    "order":[
       {
          "column":0,
          "dir":"asc"
       },
       {
          "column":1,
          "dir":"asc"
       }
    ],
    "start":0,
    "length":9000,
    "search":{
       "value":"",
       "regex":false
    }
 }
 `;

const options = {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'Content-Length': postData.length
	},
	body: postData
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
	const data = await ( await fetch( 'https://511.alaska.gov/List/GetData/Cameras', options ) ).json();
	const cameras = {};
	for ( const cam of data.data ) {
		const county = cam.county ?? 'other';
		if ( county in cameras === false ) {
			cameras[county] = [];
		}

		for ( let i = 0; i < cam.groupedIds.length; i++ ) {
			cameras[county].push( new Camera( cam, `https://511.alaska.gov/map/Cctv/${cam.groupedIds[i]}`, cam.directionDescriptions[i], cam.description1[i] ) );
		}
	}

	return cameras;
}

export default [ 'Alaska', compile ];