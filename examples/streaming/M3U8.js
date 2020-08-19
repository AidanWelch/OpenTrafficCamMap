const fs = require('fs');
const http = require('http');
const cameras = JSON.parse(fs.readFileSync('../../cameras/USA.json'));

const test_cam = cameras.Tennessee.Nashville.find(cam => cam.format === 'M3U8');

http.request(test_cam.url, (res) => {
    var data = '';

    res.on('data', (chunk) =>{
        data += chunk;
    });
    
    res.on('end', () => {
        GetChunklist(data);
    });
}).end();

function GetChunklist(data){
    http.request(test_cam.url.slice(0, -13) + data.slice(data.indexOf('chunklist'), -1), (res) => {
        var data = '';
    
        res.on('data', (chunk) =>{
            data += chunk;
        });
        
        res.on('end', () => {
            fs.writeFileSync('cam.m3u8', data);
        });
    }).end();
}
