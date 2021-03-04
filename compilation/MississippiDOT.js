const fs = require('fs');
const https = require('https');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

var postData = '{}';

var req_options = {
    host: 'www.mdottraffic.com',
    path: '/default.aspx/LoadCameraData',
    port: 443,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
    }
}

var initial_req = https.request(req_options, (res) => {
    var data = '';

    res.on('data', (chunk) =>{
        data += chunk;
    });
    
    res.on('end', () => {
        Compile(JSON.parse(data));
    });
});
initial_req.write(postData);
initial_req.end();

class Camera {
    constructor (cam, url) {
        this.location = {
            description: cam.tooltip,
            latitude: cam.lat,
            longitude: cam.lon
        }
        this.url = url;
        this.encoding = "H.264";
        this.format = "M3U8";
        //this.marked_for_review = false; //the exclusion here was decided to be the new standard, to limit unneeded bytes
    }
}

function getURLandPush(cam){
    return new Promise((resolve, reject) => {
        var info_url = cam.framehtml.slice(cam.framehtml.indexOf('src="') + 5, cam.framehtml.indexOf('" >'));
        https.request("https://www.mdottraffic.com/" + info_url, (res) => {
            var data = '';

            res.on('data', (chunk) =>{
                data += chunk;
            });
            
            res.on('end', () => {
                var link_start = data.indexOf('https://streamingjxn');
                if(link_start !== -1) {
                    var cam_server = data[link_start + + 'https://streamingjxn'.length];
                    data = data.slice(link_start + 'https://streamingjxn#.mdottraffic.com/thumbnail?application=rtplive&streamname='.length)
                    var cam_id = data.slice(0, data.indexOf('.'));
                    var url =  `https://streamingjxn${cam_server}.mdottraffic.com/rtplive/${cam_id}.stream/playlist.m3u8`;
                    cameras.Mississippi.other.push(new Camera(cam, url));
                }
                resolve();
            });
        }).end();
    });
}

async function Compile(data){
    var requests = [];
    if(!cameras.Mississippi){
        cameras.Mississippi = {};
    }
    for(cam of data.d){
        if(!cameras.Mississippi.other){
            cameras.Mississippi.other = [];
        }
        requests.push(getURLandPush(cam));
    }
    await Promise.all(requests);
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}