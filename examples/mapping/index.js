const http = require('http');
const fs = require('fs');

const server = http.createServer((req, res) =>{
    switch(req.url){
        case '/':
            res.writeHead(200);
            res.end(fs.readFileSync('./served/index.html'));
            break;
        case '/index.js':
            res.writeHead(200);
            res.end(fs.readFileSync('./served/index.js'));
            break;
        case '/USA.json':
            res.writeHead(200)
            res.end(fs.readFileSync('../../cameras/USA.json'));
            break;
        default:
            res.writeHead(404);
            res.end("Not found");
    }
});

server.listen(80);