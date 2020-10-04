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
            description: cam.dataItem.title,
            latitude: cam.dataItem.coordinates.lat,
            longitude: cam.dataItem.coordinates.lng
        }
        this.url = cam.dataItem.httpVideoUrl;
        this.encoding = "H.264";
        this.format = "M3U8";
        this.marked_for_review = false;
    }
}

function Compile(data){
    if(!cameras.Tennessee){
        cameras.Tennessee = {};
    }
    for(cam of data.actions){
        if(cam.dataItem.jurisdiction !== null){
            if(!cameras.Tennessee[cam.dataItem.jurisdiction]){
                cameras.Tennessee[cam.dataItem.jurisdiction] = [];
            }
            cameras.Tennessee[cam.dataItem.jurisdiction].push(new Camera(cam));
        } else {
            if(!cameras.Tennessee.other){
                cameras.Tennessee.other = [];
            }
            cameras.Tennessee.other.push(new Camera(cam));
        }
    }
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}