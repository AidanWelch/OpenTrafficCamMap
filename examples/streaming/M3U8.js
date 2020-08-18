const fs = require('fs');
const http = require('http');
const cameras = JSON.parse(fs.readFileSync('../../cameras/USA.json'));

const test_cam = cameras.Tennessee.Nashville.find(cam => cam.format === 'M3U8');

var stream = http.request(test_cam.url, (res) => {
    var data = '';

    res.on('data', (chunk) =>{
        data += chunk;
    });
    
    res.on('end', () => {
        fs.writeFileSync(`stream.m3u8`, data);
    });
});

setTimeout(() => stream.end(), 30000);