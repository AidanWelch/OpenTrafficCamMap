'use strict';
const fs = require('fs');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));
const axios = require('axios');

axios.post('https://new.511.nebraska.gov/api/graphql',
	[
		{
			'query': 'query ($input: MapFeaturesArgs!) { mapFeaturesQuery(input: $input) { mapFeatures { bbox tooltip uri ...Features __typename ... on Camera { views(limit: 5) { uri url category title } } } error { message type } } } fragment Features on FeatureCollection { features { ... on PointFeature { id geometry properties { zIndex clickable icon { url scaledSize { width height } anchor { x y } } popsicle { degrees weight lengthPx color } } } ... on LineFeature { id geometry properties { visible clickable zIndex strokeColor strokeWeight strokeOpacity icons { icon { path scale strokeOpacity strokeColor fillColor fillOpacity } offset repeat } } } ... on AreaFeature { id geometry properties { visible clickable zIndex fillColor fillOpacity strokeColor strokeWeight strokeOpacity } } } }',
			'variables': {
				'input': {
					'north': 43.15326372429465,
					'south': 40.390658141705075,
					'east': -96.11672664062502,
					'west': -103.03811335937502,
					'zoom': 11,
					'classifications': [
						'normalCameras',
						'hotCameras'
					],
					'nonClusterableUris': [
						'dashboard'
					]
				}
			}
		}
	]
).then((response) => {
	compile(response.data[0].data.mapFeaturesQuery);
}, (error) => {
	console.log(error);
});

class Camera {
	constructor (cam) {
		this.location = {
			description: cam.title,
			latitude: cam.bbox[1],
			longitude: cam.bbox[0]
		};
		if (cam.direction !== null){
			this.direction = cam.direction;
		}
		this.url = cam.imageUrl;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
		this.marked_for_review = false;
	}
}

function compile(data){
    
	if(!cameras.Nebraska){
		cameras.Nebraska = {};
	}
	for(var cam of data.mapFeatures){
		for(var camView of cam.views)
		{
			const tooltip = cam.tooltip;
			cam.imageUrl = camView.url;
			cam.title = camView.title;
			cam.direction = null;
            
			let direction = cam.title.substring(cam.title.lastIndexOf(':'), cam.title.length);
			if (direction.includes('North') || direction.includes('north') || direction.includes('NB'))
				cam.direction = 'N';
			else if (direction.includes('East') || direction.includes('east') || direction.includes('EB'))
				cam.direction = 'E';
			else if (direction.includes('South') || direction.includes('south') || direction.includes('SB'))
				cam.direction = 'S';
			else if (direction.includes('West') || direction.includes('west') || direction.includes('WB'))
				cam.direction = 'W';

			if(tooltip !== null && (tooltip.startsWith('I-') || tooltip.startsWith('I ') || tooltip.startsWith('US ') || tooltip.startsWith('NE '))){
				let urlArr = tooltip.split(':');
				let region = urlArr[0];
				region = region.replace(' ', '-');
				if(!cameras.Nebraska[region]){
					cameras.Nebraska[region] = [];
				}
				cameras.Nebraska[region].push(new Camera(cam));
			} else {
				if(!cameras.Nebraska.other){
					cameras.Nebraska.other = [];
				}
				cameras.Nebraska.other.push(new Camera(cam));
			}
		}
	}
	fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}