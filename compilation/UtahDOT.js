const xml2json = require('xml2json');
const fs = require('fs');
const https = require('https');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));

https.request("https://udottraffic.utah.gov/KmlFile.aspx?kmlFileType=Camera", (res) => {
    var data = '';

    res.on('data', (chunk) =>{
        data += chunk;
    });

    res.on('end', () => {
        Compile(JSON.parse(xml2json.toJson(data)));
    });
}).end();

class Camera {
    constructor (cam) {
        var extended_data = new Map();
        for(var i = 0; i < cam.ExtendedData.SchemaData.SimpleData.length; i++){
            extended_data.set(cam.ExtendedData.SchemaData.SimpleData[i].name, cam.ExtendedData.SchemaData.SimpleData[i].$t);
        }
        let coords = cam.Point.coordinates.split(',');
        this.location = {
            description: cam.name,
            direction: extended_data.get('TrafficDirection'),
            longitude: coords[0],
            latitude: coords[1]
        }
        this.url = extended_data.get('ImageUrl');
        this.encoding = (extended_data.get('ImageUrl')[extended_data.get('ImageUrl').length - 1] === 'g') ? "JPEG" : "GIF";
        this.format = "IMAGE_STREAM";
        this.marked_for_review = false;
    }
}

function Compile(data){
    if(!cameras.Utah){
        cameras.Utah = {};
    }
    for(var cam of data.kml.Document.Placemark){
        if(!cameras.Utah.other){
            cameras.Utah.other = [];
        }
        cameras.Utah.other.push(new Camera(cam));
    }
    fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}
