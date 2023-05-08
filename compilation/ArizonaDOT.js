'use strict';
const fs = require( 'fs' );
const https = require( 'https' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );


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
          "data":"cityName",
          "name":"cityName",
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
          "data":3,
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
          "column":2,
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
	host: 'az511.gov', //Ironically Arizona and Alaska are very similar
	path: '/List/GetData/Cameras',
	port: 443,
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'Content-Length': postData.length
	}
};

const req = https.request( options, ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		Compile( JSON.parse( data ) );
	});
});

req.write( postData );
req.end();

class Camera {
	constructor ( cam, url, direction, description ) {
		this.location = {
			description: description,
			direction: direction,
			latitude: cam.latitude,
			longitude: cam.longitude
		};
		this.url = url;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
		this.marked_for_review = false;
	}
}

function PushCam ( cam, county ){
	for ( let i = 0; i < cam.groupedIds.length; i++ ){
		cameras.Arizona[county].push( new Camera( cam, `https://az511.gov/map/Cctv/${cam.groupedIds[i]}`, cam.directionDescriptions[i], cam.description1[i] ) );
	}
}

function Compile ( data ){
	if ( !cameras.Arizona ){
		cameras.Arizona = {};
	}

	for ( const cam of data.data ){
		if ( cam.county !== null ){
			if ( !cameras.Arizona[cam.county] ){
				cameras.Arizona[cam.county] = [];
			}

			PushCam( cam, cam.county );
		} else {
			if ( !cameras.Arizona.other ){
				cameras.Arizona.other = [];
			}

			PushCam( cam, 'other' );
		}
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}