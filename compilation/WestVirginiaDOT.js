const fs = require('fs');
const http = require('http');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

http.request("http://wv511.org/rest/unifiedEntityService/ids", (res) => {
    var data = '';

    res.on('data', (chunk) =>{
        data += chunk;
    });
    
    res.on('end', () => {
        RequestById(JSON.parse(data));
    });
}).end();
//Someone please explain to me why WV did it this way...
function RequestById(ids){
    var postData = `{"com.orci.opentms.web.public511.components.camera.shared.data.CameraBean":${JSON.stringify(ids.result[5].ids)}}`;
    var options = {
        host: 'wv511.org',
        path: '/rest/unifiedEntityService/byId',
        port: 80,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    }

    var req = http.request(options, (res) => {
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
}

class Camera {
    constructor (cam) {
        this.location = {
            description: cam.entity.description,
            direction: (cam.entity.direction === "") ? null : cam.entity.direction,
            latitude: cam.entity.y,
            longitude: cam.entity.x
        }
        this.url = cam.entity.iosUrl;
        this.encoding = "H.264";
        this.format = "M3U8";
        this.marked_for_review = false;
    }
}



function Compile(data){
    if(!cameras['West Virginia']){
        cameras['West Virginia'] = {};
    }
    for(cam of data.changes['com.orci.opentms.web.public511.components.camera.shared.data.CameraBean'].changes){
        var region = (() => {
            var possible_region = "Entire State";
            for(var region_object of cam.entity.regions){
                if(possible_region === "Entire State"){
                    possible_region = region_object.name;
                }
            }
            if (possible_region === "Entire State"){
                return 'other';
            } else {
                return possible_region;
            }
        })();
        if(!cameras['West Virginia'][region]){
            cameras['West Virginia'][region] = [];
        }
        cameras['West Virginia'][region].push(new Camera(cam));
    }
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}