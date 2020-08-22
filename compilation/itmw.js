const fs = require('fs');
const https = require('https');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));


var postData = '{"bbox":[-1000, -1000, 1000, 1000]}';

var options = {
    host: 'www.travelmidwest.com',
    path: '/lmiga/cameraMap.json',
    port: 443,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
    }
}

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
    constructor (cam, url, direction) {
        this.location = {
            description: cam.properties.locDesc,
            direction: direction,
            latitude: cam.geometry.coordinates[1],
            longitude: cam.geometry.coordinates[0]
        }
        this.url = url;
        this.encoding = "JPEG";
        this.format = "IMAGE_STREAM";
        this.marked_for_review = false;
    }
}

function PushCam(cam, county){
    for(var i = 0; i < cam.properties.dirs.length; i++){
        var direction = null;
        switch (cam.properties.dirs[i]) {
            case 'N':
                direction = 'North';
                break;
            case 'S':
                direction = 'South';
                break;
            case 'E':
                direction = 'East';
                break;
            case 'W':
                direction = 'West';
                break;
        }
        cameras.Illinois[county].push(new Camera(cam, cam.properties.remUrls[i], direction));
    }
}

function Compile(data){
    if(!cameras.Illinois){
        cameras.Illinois = {};
    }
    for(cam of data.features){
        if(cam.properties.src !== null){
            if(!cameras.Illinois[cam.properties.src]){
                cameras.Illinois[cam.properties.src] = [];
            }
            ;
            PushCam(cam, cam.properties.src);
        } else {
            if(!cameras.Illinois.other){
                cameras.Illinois.other = [];
            }
            PushCam(cam, 'other');
        }
    }
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}