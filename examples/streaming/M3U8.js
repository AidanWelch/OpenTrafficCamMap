//This is a simple example that is non-reliable and should not be relied upon.

const fs = require('fs');
const http = require('http');
const cameras = JSON.parse(fs.readFileSync('../../cameras/USA.json'));

const test_cam = cameras.Tennessee.Nashville.find(cam => cam.format === 'M3U8');

var video_file = fs.createWriteStream(`${test_cam.location.description.replace(/ /g, '_').replace(/\//g, ']').replace(/\./g, '')}.mp4`);

(async function(){
    for(var i = 0; i < 5; i++){
        await GetPlaylist(test_cam.url);
        await new Promise((resolve, _) => setTimeout(() => {resolve()}, 14000));
    }
    video_file.end();
})();

function GetPlaylist(url){
    return new Promise((resolve, reject) => {
        http.request(url, (res) => {
            var data = '';
        
            res.on('data', (chunk) =>{
                data += chunk;
            });
            
            res.on('end', () => {
                GetChunklist(data).then(resolve());
            });

            res.on('timeout', () => {
                reject('timeout');
            });
        }).end();
    });
}

function GetChunklist(data){
    return new Promise((resolve, reject) => {
        http.request(test_cam.url.slice(0, -13) + data.slice(data.indexOf('chunklist'), -1), (res) => {
            var data = '';
        
            res.on('data', (chunk) =>{
                data += chunk;
            });
            
            res.on('end', () => {
                var lines = data.split('\n');
                var unloaded_chunks = 0;
                for (var line of lines){
                    if(line[0] !== '#'){
                        unloaded_chunks++;
                        GetChunk(line).then(() => {
                            unloaded_chunks--;
                            if (!unloaded_chunks){
                                resolve();
                            }
                        });
                    }
                }
            });

            res.on('timeout', () => {
                reject('timeout');
            });
        }).end();
    });
}

function GetChunk(chunk_name){ 
    return new Promise((resolve, reject) => {
        http.request(test_cam.url.slice(0, -13) + chunk_name, (res) => {
            res.setEncoding('binary');
        
            res.on('data', (chunk) =>{
                video_file.write(chunk, 'binary');
            });
            
            res.on('end', () => {
                resolve();
            });

            res.on('timeout', () => {
                reject('timeout');
            });
        }).end();
    });
}
