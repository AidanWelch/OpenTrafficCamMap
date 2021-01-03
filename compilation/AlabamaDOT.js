const fs = require('fs');
const https = require('https');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

https.request("https://algotraffic.com/api/v1/layers/cameras?null", (res) => {
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
            description: cam.primaryRoad + " " + cam.crossStreet,
            latitude: cam.latitude,
            longitude: cam.longitude,
            direction: (() => {
                switch (cam.direction) {
                    case 'n':
                        return 'North';
                        break;
                    case 's':
                        return 'South';
                        break;
                    case 'e':
                        return'East';
                        break;
                    case 'w':
                        return'West';
                        break;
                }
            })(),
        }
        this.url = cam.streamUrl,
        this.encoding = "H.264";
        this.format = "M3U8";
        this.marked_for_review = cam.disabled;
    }
}

function Compile(data){
    if(!cameras.Alabama){
        cameras.Alabama = {};
    }
    for (var j = 0; j < data.length; j++) {
        var camArr = data[j].entries;
        
        for(cam of camArr){
            console.log(cam.organizationId)
            if(cam.organizationId !== null){
                if(!cameras.Alabama[cam.organizationId]){
                    cameras.Alabama[cam.organizationId] = [];
                }
                cameras.Alabama[cam.organizationId].push(new Camera(cam));
            } else {
                if(!cameras.Alabama.other){
                    cameras.Alabama.other = [];
                }
                cameras.Alabama.other.push(new Camera(cam));
            }
        }
    }
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}