'use strict';
const fs = require('fs');
const https = require('https');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));


var postData = `
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

var options = {
	host: '511.alaska.gov',
	path: '/List/GetData/Cameras',
	port: 443,
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'Content-Length': postData.length
	}
};

var req = https.request(options, (res) => {
	var data = '';

	res.on('data', (chunk) =>{
		data += chunk;
	});
    
	res.on('end', () => {
		Compile(JSON.parse(data));
	});
});

req.write(postData);
req.end();

class Camera {
	constructor (cam, url, direction, description) {
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

function PushCam(cam, county){
	for(var i = 0; i < cam.groupedIds.length; i++){
		cameras.Alaska[county].push(new Camera(cam, `https://511.alaska.gov/map/Cctv/${cam.groupedIds[i]}`, cam.directionDescriptions[i], cam.description1[i]));
	}
}

function Compile(data){
	if(!cameras.Alaska){
		cameras.Alaska = {};
	}
	for(const cam of data.data){
		if(cam.county !== null){
			if(!cameras.Alaska[cam.county]){
				cameras.Alaska[cam.county] = [];
			}
			PushCam(cam, cam.county);
		} else {
			if(!cameras.Alaska.other){
				cameras.Alaska.other = [];
			}
			PushCam(cam, 'other');
		}
	}
	fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}