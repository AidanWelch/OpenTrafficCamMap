const fs = require('fs');
const https = require('https');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

https.request("https://www.cotrip.org/camera/getStillCameras.do", (res) => {
    var still_data = '';

    res.on('data', (chunk) =>{
        still_data += chunk;
    });
    
    res.on('end', () => {
        https.request("https://www.cotrip.org/camera/getStreamingCameras.do", (res) => {
            var streaming_data = '';

            res.on('data', (chunk) =>{
                streaming_data += chunk;
            });
            
            res.on('end', () => {
                Compile(JSON.parse(still_data), JSON.parse(streaming_data));
            });
        }).end();
    });
}).end();

class Camera {
    constructor (cam, view) {
        this.location = {
            description: view.CameraName,
            latitude: parseFloat(cam.Location.Latitude),
            longitude: parseFloat(cam.Location.Longitude),
            direction: view.Direction
        }
        this.url = (view.CameraType === 'Still') ? "https://www.cotrip.org/" + view.ImageLocation : "https://www.cotrip.org/auth/getStreamingCameraAccessToken.do?streamApplication=liveStreams&streamName=" + view.StreamName,
        this.encoding = (view.CameraType === 'Still') ? "JPEG" : "H.264";
        this.format = (view.CameraType === 'Still') ? "IMAGE_STREAM" : "UNIQUE_COLORADODOT";
        this.marked_for_review = !(cam.Status === 'enabled');
    }
}

function Compile(still_data, streaming_data){
    cameras.Colorado = {};
    if(!cameras.Colorado){
        cameras.Colorado = {};
    }
    for(cam of still_data.CameraDetails.Camera){
        if(!cameras.Colorado.other){
            cameras.Colorado.other = [];
        }
        for(view of cam.CameraView){
            cameras.Colorado.other.push(new Camera(cam, view));
        }   
    }
    for(cam of streaming_data.CameraDetails.Camera){
        if(!cameras.Colorado.other){
            cameras.Colorado.other = [];
        }
        for(view of cam.CameraView){
            cameras.Colorado.other.push(new Camera(cam, view));
        }   
    }
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}