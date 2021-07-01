const fs = require('fs');
const https = require('https');
const { parse } = require('node-html-parser');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

https.request("https://www.511pa.com/wsvc/gmap.asmx/buildCamerasJSONjs", (res) => {
    var data = '';

    res.on('data', (chunk) =>{
        data += chunk;
    });
    
    res.on('end', () => {
        data = data.split('var camera_data = ')[1];
        Compile(JSON.parse(data));
    });
}).end();

class Camera {
    constructor (cam) {
        var decodedHTMLDescription = decodeEntities(cam.description)
        var parsedObj = parseHTML(cam, decodedHTMLDescription)

        this.location = {
            description: parsedObj.description,
            latitude: Number(cam.start_lat),
            longitude: Number(cam.start_lng)
        }
        this.url = parsedObj.imageOnly ? parsedObj.imageSrc : parsedObj.streamSrc;
        this.encoding = parsedObj.imageOnly ? "JPEG" : "H.264";
        this.format = parsedObj.imageOnly ? "IMAGE_STREAM" : "M3U8";
        this.marked_for_review = parsedObj.review && !parsedObj.imageOnly;

        console.log(this)
    }
}

function parseHTML(cam, decodedHTMLDescription) {
    var html = parse(decodedHTMLDescription);
    var htmlDescriptionObj = html.querySelector('#camDescription');  //This usually hints at direction, but is not in a usable format
    var imageSrcObj = html.querySelector(".webmapcamimg")
    var description = cam.title;
    var imageSrc;
    var streamSrc;
    if (htmlDescriptionObj)
        decsription = description + " - " + htmlDescriptionObj.rawText;
    if (imageSrcObj)
        imageSrc = imageSrcObj.attributes.src;

    if (cam.md5 && (cam.md5).startsWith("ptc"))
    {
        var parts = (cam.md5).split("_");
        var result = parts[parts.length - 1]
        imageSrc = "https://www.paturnpike.com/webmap/1_devices/cam" + result + ".jpg";
    }
    else
    {
        //Going through http should allow cross domain streaming
        //if this does not work streams can be accessed through 1 of 3 IPs http://["209.71.158.42", "209.71.158.48", "209.71.158.54"]/live/...stream...
        //Will need to determine correct IP for individual streams.
        streamSrc = "http://pa511wmedia102.ilchost.com/live/" + cam.md5 + ".stream/playlist.m3u8?wmsAuthSign="
        //wmsAuthSign param is needed to start the stream, can be obtained by making a req to https://www.511pa.com/wowzKey.aspx
    }

    return {
        description: decsription,
        review: !(decodedHTMLDescription.includes("STREAMING:1")),
        imageOnly: !(decodedHTMLDescription.includes("STREAMING")),
        imageSrc: imageSrc,
        streamSrc:  streamSrc
    }
}

function decodeEntities(encodedString) {
    var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    var translate = {
        "nbsp":" ",
        "amp" : "&",
        "quot": "\"",
        "lt"  : "<",
        "gt"  : ">"
    };
    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, function(match, numStr) {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}

function Compile(data){
    if(!cameras.Pennsylvania){
        cameras.Pennsylvania = {};
    }
    for(cam of data.cams){  
        if(!cameras.Pennsylvania.other){
            cameras.Pennsylvania.other = [];
        }
        cameras.Pennsylvania.other.push(new Camera(cam));     
    }
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}