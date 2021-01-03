const fs = require('fs');
const https = require('https');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

https.request("https://files0.iteriscdn.com/WebApps/SC/SafeTravel4/data/geojson/icons/metadata/icons.cctv.geojsonp", (res) => {
    var data = '';

    res.on('data', (chunk) =>{
        data += chunk;
    });
    
    res.on('end', () => {
        data = data.replace("OpenLayers.Protocol.ScriptLite.registry.load_cameras(", "");
        data = data.substring(0, data.length - 3);
        Compile(JSON.parse(data));
    });
}).end();

class Camera {
    constructor (cam) {
        this.location = {
            description: cam.properties.dot_description,
            latitude: cam.geometry.coordinates[1],
            longitude: cam.geometry.coordinates[0],
            direction: (() => {
                switch (cam.properties.route_direction) {
                    case 'NB':
                        return 'North';
                        break;
                    case 'SB':
                        return 'South';
                        break;
                    case 'EB':
                        return'East';
                        break;
                    case 'WB':
                        return'West';
                        break;
                }
            })(),
        }
        this.url = cam.properties.http_url,
        this.encoding = "H.264";
        this.format = "M3U8";
        this.marked_for_review = !cam.properties.active;
    }
}

function Compile(data){
    if(!cameras.SouthCarolina){
        cameras.SouthCarolina = {};
    }
    for(cam of data.features){
        if(cam.county !== null){
            if(!cameras.SouthCarolina[cam.properties.region]){
                cameras.SouthCarolina[cam.properties.region] = [];
            }
            cameras.SouthCarolina[cam.properties.region].push(new Camera(cam));
        } else {
            if(!cameras.SouthCarolina.other){
                cameras.SouthCarolina.other = [];
            }
            cameras.SouthCarolina.other.push(new Camera(cam));
        }
    }
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}