const fs = require('fs');
const http = require('http');
const cameras = JSON.parse(fs.readFileSync('../../cameras/USA.json'));

const test_cam = cameras.Kentucky.Jefferson.find(cam => cam.format === 'IMAGE_STREAM');

(async function(){
    var last_pic;
    for(var i = 0; i < 50; i++){
        http.request(test_cam.url, (res) => {
            var data = '';
            res.setEncoding('binary');

            res.on('data', (chunk) =>{
                data += chunk;
            });
            
            res.on('end', () => {
                if(data !== last_pic){
                    fs.writeFileSync(`${i}.jpg`, data, 'binary');
                    last_pic = data;
                }
            });
        }).end();
        await new Promise(r => setTimeout(r, test_cam.update_rate || 1000));
    }
})();