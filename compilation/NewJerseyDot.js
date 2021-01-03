const fs = require('fs');
const https = require('https');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

https.request("https://511nj.org/api/client/camera/GetCameraDataByTourId?tourid=3", (res) => {
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
        var parsedObj = videoOrImage(cam)

        this.location = {
            decsription: cam.name + " " + cam.devicedescription,
            latitude: cam.latitude,
            longitude: cam.longitude
        }
        this.url = parsedObj.imageOnly ? parsedObj.imageSrc : parsedObj.streamSrc;
        this.encoding = parsedObj.imageOnly ? "JPEG" : "H.264";
        this.format = parsedObj.imageOnly ? "IMAGE_STREAM" : "M3U8";
        this.marked_for_review = cam.StopCameraFlag;
    }
}

function videoOrImage(cam) {
    var imageOnly = true;
    var streamSrc, imageSrc;
    for (camType of cam.CameraMainDetail)
    {
        if (camType.cameratype === 'Video' && !camType.URL.includes("Camera-Unavailable.png"))
        {
            imageOnly = false;
            streamSrc = camType.URL.replace("https://", "http://") + "?otp=";
            //http for cross domain streaming
            //Wowza otp key can be obtained by making requests to "https://511nj.org/api/client/camera/getHlsToken?Id=2"
            //Required for streaming
            //I have not found a way to get the turnkpike streams to work cross domain https://njtpk-wink.xcmdata.org/turnpike/hls/....
        }
        else
        {
            imageSrc = camType.URL; // These all appear to be "image unavailable" images
        }
    }

    return {
        imageOnly: imageOnly,
        imageSrc: imageSrc,
        streamSrc:  streamSrc
    }
}


function Compile(data){
    if(!cameras['New Jersey']){
        cameras['New Jersey'] = {};
    }
    for(cam of data.Data.CameraData){  
        if(!cameras['New Jersey'].other){
            cameras['New Jersey'].other = [];
        }
        cameras['New Jersey'].other.push(new Camera(cam));     
    }
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}