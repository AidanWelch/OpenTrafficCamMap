'use strict';
const xml2json = require('xml2json');
const fs = require('fs');
const http = require('http');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

http.request('http://goakamai.org/services/CameraProxy.svc/cameras/tours/H-1%20And%20H-201%20All/xml', (res) => {
	var data = '';

	res.on('data', (chunk) =>{
		data += chunk;
	});

	res.on('end', () => {
		Compile(JSON.parse(xml2json.toJson(data)));
	});
}).end();

class Camera {
	constructor (cam) {
		this.location = {
			description: cam.Name,
			longitude: cam.Location.Lon,
			latitude: cam.Location.Lat
		};
		this.url = cam.FullImageURL;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
		this.marked_for_review = false;
	}
}

function Compile(data){
	if(!cameras.Hawaii){
		cameras.Hawaii = {};
	}
	for(var cam of data.CameraList.Camera){
		if(!cameras.Hawaii.other){
			cameras.Hawaii.other = [];
		}
		cameras.Hawaii.other.push(new Camera(cam));
	}
	fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}
