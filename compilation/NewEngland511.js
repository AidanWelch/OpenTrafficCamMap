const fs = require('fs');
const http = require('http');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

http.request("http://www.newengland511.org/Traffic/GetCameras", (res) => {
    var data = '';

    res.on('data', (chunk) =>{
        data += chunk;
    });

    res.on('end', () => {
        Compile(data);
    });
}).end();

class Camera {
    constructor (cam) {
        this.location = {
            description: cam.Name,
            longitude: cam.Longitude,
            latitude: cam.Latitude
        }
        this.url = cam.StreamingURL;
        this.encoding = "JPG";
        this.format = "IMAGE_STREAM";
    }
}

function Compile(data){
    if(!cameras['New Hampshire']){
        cameras['New Hampshire'] = {};
    }
    if(!cameras.Maine){
        cameras.Maine = {};
    }
    if(!cameras.Vermont){
        cameras.Vermont = {};
    }
    for(var cam of data){

    }
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}
