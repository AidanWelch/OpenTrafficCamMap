const fs = require('fs');
const http = require('http');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

http.request("http://pws.trafficwise.org/aries/cctv.json", (res) => {
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
            description: cam.properties.description,
            longitude: cam.geometry.coordinates[0],
            latitude: cam.geometry.coordinates[1]
        }
        this.url = `http://pws.trafficwise.org${cam.properties.image}`;
        this.encoding = "JPEG";
        this.format = "IMAGE_STREAM";
        this.marked_for_review = false;
    }
}

function Compile(data){
    if(!cameras.Indiana){
        cameras.Indiana = {};
    }
    for(cam of data.features){
        if(!cameras.Indiana.other){
            cameras.Indiana.other = [];
        }
        cameras.Indiana.other.push(new Camera(cam));
    }
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}