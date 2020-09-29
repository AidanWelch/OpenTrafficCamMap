const fs = require('fs');
const https = require('https');
const http = require('http');
const HTMLParser = require('node-html-parser');
const cameras = JSON.parse(fs.readFileSync('../../cameras/USA.json'));

var date = new Date();
https.request(`http://cwwp2.dot.ca.gov/vm/js/cctvLocations${date.getFullYear()}-${(date.getMonth() < 10) ? "0" + date.getMonth() : date.getMonth()}-${(date.getDate() < 10) ? "0" + date.getDate() : date.getDate()}.js`, (res) => {
    var data = '';

    res.on('data', (chunk) =>{
        data += chunk;
    });
    
    res.on('end', () => {
        Compile(eval(data + 'cctv'));
    });
}).end();

class Camera {
    constructor (cam) {
        this.location = {
            description: cam.attributes.description,
            direction: cam.attributes.direction,
            latitude: cam.attributes.latitude,
            longitude: cam.attributes.longitude
        }
        this.url = cam.attributes.snapshot;
        this.encoding = "JPEG";
        this.format = "IMAGE_STREAM";
        this.marked_for_review = false;
    }
}

function GetCamInfo(cam_string){
    cam_string = cam_string.split('ÿ');
    var cam = {};
    cam.marked_for_review = false;
    cam.location = {};
    cam.location.description = cam_string[3];
    cam.location.longitude = cam_string[1];
    cam.location.latitude = cam_string[2];
    if(cam[4] === "0"){
        cam.encoding = "JPEG";
        cam.format = "IMAGE_STREAM";
    } else {
        cam.encoding = "H.264";
        cam.format = "M3U8";
    }
    http.request(cam[0], (res) => {
        var data = '';

        res.on('data', (chunk) =>{
            data += chunk;
        });
        
        res.on('end', () => {
            if(cam.format === 'IMAGE_STREAM'){
                var cam_page = HTMLParser.parse(data);
                var image_element = cam_page.querySelector('#cctvImage');
                return image_element.getAttribute('src').split('?')[0];
            } else {

            }


        });
    });
}

function Compile(data){
    if(!cameras.California){
        cameras.California = {};
    }
    for(cam_string of data){
        var county;
        var cam;
        [county, cam] = GetCamInfo(cam);
        if(!cameras.California[county]){
            cameras.California[county] = [];
        }
        cameras.California[county].push(camera_object);
    }
    //fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}