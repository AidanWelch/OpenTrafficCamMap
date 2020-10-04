const fs = require('fs');
const https = require('https');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

https.request("https://dotfiles.azureedge.net/geojson/cameras/cameras.json", (res) => {
    var data = '';

    res.on('data', (chunk) =>{
        data += chunk;
    });
    
    res.on('end', () => {
        Compile(JSON.parse(data));
    });
}).end();

class Camera {
    constructor (cam, icam) {
        this.location = {
            description: icam.Description,
            direction: icam.Direction,
            latitude: cam.geometry.coordinates[1],
            longitude: cam.geometry.coordinates[0]
        }
        this.url = icam.FullPath;
        this.encoding = "JPEG";
        this.format = "IMAGE_STREAM";
        this.marked_for_review = false;
    }
}

function PushCams(cam, region){
    for(var icam of cam.properties.Cameras){
        cameras["North Dakota"][region].push(new Camera(cam, icam));
    }
}

function Compile(data){
    if(!cameras["North Dakota"]){
        cameras["North Dakota"] = {};
    }
    for(var cam of data.features){
        if(cam.properties.Region !== null){
            if(!cameras["North Dakota"][cam.properties.Region]){
                cameras["North Dakota"][cam.properties.Region] = [];
            }
            PushCams(cam, cam.properties.Region);
        } else {
            if(!cameras["North Dakota"].other){
                cameras["North Dakota"].other = [];
            }
            PushCams(cam, 'other');
        }
    }
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}