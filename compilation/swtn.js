const fs = require('fs');
const https = require('https');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

https.request("https://smartway.tn.gov/Traffic/api/Cameras/0", (res) => {
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

function Compile(data){
    for(cam of data.features){
        if(cam.attributes.county !== null){
            if(!cameras.Kentucky[cam.attributes.county]){
                cameras.Kentucky[cam.attributes.county] = [];
            }
            cameras.Kentucky[cam.attributes.county].push(new Camera(cam));
        } else {
            if(!cameras.Kentucky.other){
                cameras.Kentucky.other = [];
            }
            cameras.Kentucky.other.push(new Camera(cam));
        }
    }
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}