const fs = require('fs');
const https = require('https');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

var options = {
    host: 'oktraffic.org',
    path: '/api/CameraPoles',
    method: 'GET',
    headers: {
        "filter": "{\"include\":[{\"relation\":\"mapCameras\",\"scope\":{\"include\":\"streamDictionary\",\"where\":{\"status\":{\"neq\":\"Out Of Service\"}}}},{\"relation\":\"cameraLocationLinks\",\"scope\":{\"include\":[\"linkedCameraPole\",\"cameraPole\"]}}]}",
    },
    body: null
};

https.request(options, (res) => {
    var data = '';

    res.on('data', (chunk) =>{
        data += chunk;
    });
    
    res.on('end', () => {
        compile(JSON.parse(data));
    });
}).end();

class Camera {
    constructor (cam) {
        this.location = {
            description: cam.location,
            direction: cam.direction,
            latitude: cam.latitude,
            longitude: cam.longitude
        }
        this.url = cam.streamDictionary.streamSrc;
        this.encoding = "H.264";
        this.format = "M3U8";
        this.marked_for_review = false;
    }
}

function compile(data){
    if(!cameras["Oklahoma"]){
        cameras["Oklahoma"] = {};
    }

    let promises = [];
    const delayIncrement = 1000;
    let delay = 0;

    for(var pole of data){
        //The reverse look up could be done here since the cameras on the pole will have the same lat/lng
        for(mapCam of pole.mapCameras){
            let tmpCam = {...mapCam};
            //Email address is required parameter
            promises.push(new Promise((resolve) => setTimeout(resolve, delay)).then(() => getLocationData({reverseUrl:'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + tmpCam.latitude + '&lon=' + tmpCam.longitude + '&email=opentrafficcameras@gmail.com', ...tmpCam})));            
            delay += delayIncrement;
        }        
    }

    console.log("This will take about " + Math.ceil(delay/1000/60) + " minutes.");

    Promise.all(promises).then(() => {
        fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
    })
}

const getLocationData = (cam) => {
    https.request(cam.reverseUrl, (res) => {
        var data = '';
    
        res.on('data', (chunk) =>{
            data += chunk;
        });
        
        res.on('end', () => {
            var location = JSON.parse(data);
            if(!!location.address && !!location.address.county){
                if(!cameras["Oklahoma"][location.address.county]){
                    cameras["Oklahoma"][location.address.county] = [];
                }
                cameras.Oklahoma[location.address.county].push(new Camera(cam));
            } else {
                if(!cameras["Oklahoma"].other){
                    cameras["Oklahoma"].other = [];
                }
                cameras.Oklahoma.other.push(new Camera(cam));
            }
        });
    }).end();  
}