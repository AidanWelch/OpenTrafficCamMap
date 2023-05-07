'use strict';
const fs = require('fs');
const https = require('https');
const parseHTML = require('node-html-parser').parse;
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

https.request('https://lb.511mn.org/mnlb/cameras/routeselect.jsf', (res) => {
	var data = '';

	res.on('data', (chunk) =>{
		data += chunk;
	});
    
	res.on('end', () => {
		Compile(parseHTML(data));
	});
}).end();

class Camera {
	constructor (cam, url) {
		this.location = {
			description: cam.description,
			latitude: Number(cam.latitude),
			longitude: Number(cam.longitude)
		};
		this.url = url;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
		console.log(this);
	}
}

function compileCamera(div){
	return new Promise((resolve, reject) => {
		var cam = {};
		var a = div.firstChild;
		var img = a.firstChild;
		cam.description = img.getAttribute('title');
		var req_link = a.getAttribute('href');
		req_link = 'https://lb.511mn.org' + req_link.slice(0, req_link.indexOf(';')) + req_link.slice(req_link.indexOf('?'));
		https.request(req_link, (res) => {
			var data = '';

			res.on('data', (chunk) =>{
				data += chunk;
			});
            
			res.on('end', () => {
				data = parseHTML(data);

				var center_string = data.querySelector('#j_idt170').nextSibling.getAttribute('src');
				center_string = center_string.slice(center_string.indexOf('center=') + 7, center_string.indexOf('&'));
				cam.latitude = center_string.slice(0, center_string.indexOf('%2C'));
				cam.longitude = center_string.slice(center_string.indexOf('%2C') + 3);
                
				var cams_matched = true;
				var i = 0; 
				while(cams_matched){
					var cam_img = data.querySelector(`#cam-${i}-img`);
					i++;
					if(cam_img){
						cameras.Minnesota.other.push(new Camera(cam, cam_img.getAttribute('src')));
					} else {
						cams_matched = false;
					}
				}
				resolve();
			});
		}).end();

		setTimeout(() => {
			reject(img.getAttribute('title') + ' Timed Out!');
		}, 15000);
	});
}

async function Compile(data){
	if(!cameras.Minnesota){
		cameras.Minnesota = {};
	}

	var divs = data.querySelectorAll('#j_idt115');
	var promises = [];
	for(var div of divs){
		if(!cameras.Minnesota.other){
			cameras.Minnesota.other = [];
		}
		promises.push(compileCamera(div));
	}
	await Promise.all(promises);
	fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}