const fs = require('fs');
const https = require('https');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

https.request("https://mdotjboss.state.mi.us/MiDrive/camera/AllForMap/", (res) => {
    var data = '';

    res.on('data', (chunk) =>{
        data += chunk;
    });
    
    res.on('end', () => {
        Compile(JSON.parse(data));
    });
}).end();

class Camera {
    constructor (cam, url) {
        this.location = {
            description: cam.title,
            latitude: cam.latitude,
            longitude: cam.longitude
        }
        this.url = url;
        this.encoding = "JPEG";
        this.format = "IMAGE_STREAM";
    }
}

async function Compile(data){
    if(!cameras.Michigan){
        cameras.Michigan = {};
    }
    var requests = [];
    if(!cameras.Michigan.other){
        cameras.Michigan.other = [];
    }
    for(var i = 0; i < data.length; ++i){
        var cam = data[i]
        console.log(cam.id)
        requests.push(new Promise((resolve, reject) => {
            https.request("https://mdotjboss.state.mi.us/MiDrive/camera/getCameraInformation/" + cam.id, (res) => {
                var info = '';

                res.on('data', (chunk) =>{
                    info += chunk;
                });
                
                res.on('end', () => {
                    cameras.Michigan.other.push(new Camera(cam, JSON.parse(info).link));
                    resolve();
                });
            }).end();
            setTimeout(() => {
                console.error('Timeout ' + cam.id);
                reject();
            }, 100);
        }));
        if(i % 10 === 0){
            await new Promise((r, _) => {setTimeout(() => {r();}, 15000)});
        }
    }
    await Promise.all(requests);
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}