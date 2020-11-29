const fs = require('fs');
const https = require('https');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

https.request("https://opendata.arcgis.com/datasets/8a885da23dfb46caaa1827ad920fb5b1_0.geojson", (res) => {
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
            description: cam.properties.CameraLocation,
            direction: cam.properties.CameraDirection,
            latitude: cam.geometry.coordinates[1],
            longitude: cam.geometry.coordinates[0]
        }
        this.url = cam.properties.SnapShot.replace('\\', '');
        this.encoding = "JPEG";
        this.format = "IMAGE_STREAM";
        this.marked_for_review = false;
    }
}

function Compile(data){
    if(!cameras.Illinois){
        cameras.Illinois = {};
    }
    for(cam of data.features){
        if(!cameras.Illinois.other){
            cameras.Illinois.other = [];
        }
        cameras.Illinois.other.push(new Camera(cam));
    }
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}