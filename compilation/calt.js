const fs = require('fs');
const http = require('http');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

var date = new Date();
http.request(`http://cwwp2.dot.ca.gov/vm/js/cctvLocations${date.getFullYear()}-${(date.getMonth() < 10) ? "0" + date.getMonth() : date.getMonth()}-${(date.getDate() < 10) ? "0" + date.getDate() : date.getDate()}.js`, (res) => {
    var data = '';

    res.on('data', (chunk) =>{
        data += chunk;
    });
    
    res.on('end', () => {
        Compile(eval(data + 'cctv'));
    });
}).end();

function GetCamInfo(cam_string){
    return new Promise((resolve, reject) =>{
        cam_string = cam_string.split('�');
        var cam = {};
        cam.marked_for_review = false;
        cam.location = {};
        cam.location.description = cam_string[3];
        cam.location.longitude = cam_string[1];
        cam.location.latitude = cam_string[2];
        if(cam_string[4] === "0"){
            cam.encoding = "JPEG";
            cam.format = "IMAGE_STREAM";
        } else {
            cam.encoding = "H.264";
            cam.format = "M3U8";
        }
        http.request(cam_string[0], (res) => {
            var data = '';
            res.on('error', (e) => {
                reject(e);
            })
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if(cam.format === 'IMAGE_STREAM'){
                    cam.url = data.slice(0, data.indexOf('.jpg')+4);
                    cam.url = cam.url.slice(cam.url.lastIndexOf('http:'));
                } else {
                    cam.url = data.slice(0, data.indexOf('.m3u8')+5);
                    cam.url = cam.url.slice(cam.url.lastIndexOf('http:'));
                    cam.url = cam.url.replace(/\\/g, ''); //Thank Node for the stupidity of this, '\\' should work, but no /\\/g it is
                }
                var county = data.slice(data.search(/<title>.* : .* : .* : .*<\/title>/), data.indexOf('</title>')).split(' : ')[1];
                if(!county){
                    county = data.slice(data.search(/<title>.* : .* : .*<\/title>/), data.indexOf('</title>')).split(' : ')[1];
                    if(!county){
                        console.log(cam_string);
                        county = data.slice(data.search(/<title>.* : .*<\/title>/), data.indexOf('</title>')).split(' : ')[1]
                    }
                }
                console.log(county);
                console.log(cam.url);
                resolve([county, cam]);
            });
        }).end();
        setTimeout(() => {
            reject("timeout");
        }, 10000)
    });
}

async function Compile(data){
    data = data.splice(1);
    if(!cameras.California){
        cameras.California = {};
    }
    for(var cam_string of data){
        try {
            var cam_info = await GetCamInfo(cam_string);
            var county = cam_info[0];
            var cam = cam_info[1];
            if(!cameras.California[county]){
                cameras.California[county] = [];
            }
            cameras.California[county].push(cam);
        } catch (error) {
            console.warn("Request error");
        }
    }
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}