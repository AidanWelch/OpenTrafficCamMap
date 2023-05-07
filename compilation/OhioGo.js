'use strict';
const fs = require('fs');
const https = require('https');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

https.request('https://api.ohgo.com/roadmarkers/cameras?pointData={"lowLongitude":-88.312451171875,"highLongitude":-77.787548828125,"lowLatitude":36.2910363107023,"highLatitude":43.423237328106715,"routeDirection":"","routeName":""}', (res) => {
	var data = '';

	res.on('data', (chunk) =>{
		data += chunk;
	});
    
	res.on('end', () => {
		Compile(JSON.parse(data));
	});
}).end();

class Camera {
	constructor (cam, url, direction) {
		this.location = {
			description: cam.Location,
			direction: direction,
			latitude: cam.Latitude,
			longitude: cam.Longitude
		};
		this.url = url;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
		this.marked_for_review = false;
	}
}

function Compile(data){
	if(!cameras.Ohio){
		cameras.Ohio = {};
	}
	for(const cam of data){
		if(!cameras.Ohio.other){
			cameras.Ohio.other = [];
		}
		for(var i = 0; i < cam.Cameras.length; i++){
			cameras.Ohio.other.push(new Camera(cam, cam.Cameras[i].LargeURL, (cam.Cameras[i].Direction === 'PTZ') ? null : cam.Cameras[i].Direction));
		}   
	}
	fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}