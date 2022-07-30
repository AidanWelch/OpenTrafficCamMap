const fs = require('fs');
const https = require('https');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

https.request("https://data.wsdot.wa.gov/travelcenter/Cameras.json", (res) => {
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
            description: cam.attributes.CameraTitle,
            longitude: convertLongitude(cam.geometry.x),
            latitude: convertLatitude(cam.geometry.y)
        }
        this.url = cam.attributes.ImageURL;
        this.encoding = "JPEG";
        if (cam.attributes.CompassDirection !== null && cam.attributes.CompassDirection !== 'B'){
            this.direction = cam.attributes.CompassDirection
        }
        this.format = "IMAGE_STREAM";
        this.marked_for_review = false;
    }
}

function compile(data){
    if(!cameras.Washington){
        cameras.Washington = {};
    }
    for(var cam of data.features){
        if(cam.attributes.ImageURL !== null && cam.attributes.ImageURL.includes("images.wsdot.wa.gov")){
            const urlArr = cam.attributes.ImageURL.split("/");
            const region = urlArr[3].toLowerCase();
            if(!cameras.Washington[region]){
                cameras.Washington[region] = [];
            }
            cameras.Washington[region].push(new Camera(cam));
        } else {
            if(!cameras.Washington.other){
                cameras.Washington.other = [];
            }
            cameras.Washington.other.push(new Camera(cam));
        }
    }
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}

function convertLongitude(long3857) {

    const X = 20037508.34;
	const long4326 = (long3857*180)/X;	
	return long4326;
}

function convertLatitude(lat3857) {
    const e = 2.7182818284;
    const X = 20037508.34;
    let lat4326 = lat3857/(X / 180);
	const exponent = (Math.PI / 180) * lat4326;
	lat4326 = Math.atan(e ** exponent);
	lat4326 = lat4326 / (Math.PI / 360);
	lat4326 = lat4326 - 90;
    return lat4326;
}