'use strict';
const fs = require('fs');
const http = require('http');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

http.request('http://traveler.modot.org/timconfig/feed/desktop/StreamingCams2.json', (res) => {
	var data = '';

	res.on('data', (chunk) =>{
		data += chunk;
	});
    
	res.on('end', () => {
		Compile(JSON.parse(data));
	});
}).end();

class Camera {
	constructor (cam) {
		this.location = {
			description: cam.location,
			longitude: cam.x,
			latitude: cam.y
		};
		this.url = cam.html;
		this.encoding = 'H.264';
		this.format = 'M3U8';
		this.marked_for_review = false;
	}
}

function Compile(data){
	if(!cameras.Missouri){
		cameras.Missouri = {};
	}
	for(var cam of data){
		if(!cameras.Missouri.other){
			cameras.Missouri.other = [];
		}
		cameras.Missouri.other.push(new Camera(cam));
	}
	fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}