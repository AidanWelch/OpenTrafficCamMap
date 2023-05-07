'use strict';
const fs = require('fs');
const cameras = JSON.parse(fs.readFileSync('../cameras/USA.json'));
const axios = require('axios');

axios.post('https://www.511ia.org/api/graphql',
	[
		{
			'query': 'query MapFeatures($input: MapFeaturesArgs!, $plowType: String) { mapFeaturesQuery(input: $input) { mapFeatures { bbox tooltip uri ...Features __typename ... on Camera { views(limit: 5) { uri url category title } } ... on Plow { views(limit: 5, plowType: $plowType) { uri url category } } } error { message type } } } fragment Features on FeatureCollection { features { id geometry properties } }',
			'variables': {
				'input': {
					'north': 46.15757,
					'south': 37.68447,
					'east': -87.11057,
					'west': -97.5366,
					'zoom': 7,
					'layerSlugs': [
						'normalCameras'
					],
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
		this.url = cam.imageUrl;
		this.encoding = cam.encoding;
		this.format = cam.format;
		this.marked_for_review = false;
	}
}

function compile(data){    
	if(!cameras.Iowa){
		cameras.Iowa = {};
	}
	for(var cam of data.mapFeatures){
		const tooltip = cam.tooltip;
		for(var camView of cam.views)
		{
			cam.imageUrl = camView.category === 'VIDEO' ?  buildCamUrl(camView.url) : camView.url;            
			cam.title = camView.title;
			cam.encoding = camView.category === 'VIDEO' ? 'H.264' : 'JPEG';
			cam.format = camView.category === 'VIDEO' ? 'M3U8' : 'IMAGE_STREAM';

			if(tooltip !== null && (tooltip.startsWith('I-') || tooltip.startsWith('I ') || tooltip.startsWith('US ') || tooltip.startsWith('IA '))){
				let urlArr = tooltip.split(':');
				let region = urlArr[0];
				region = region.replace(' ', '-');
				if(!cameras.Iowa[region]){
					cameras.Iowa[region] = [];
				}
				cameras.Iowa[region].push(new Camera(cam));
			} else {
				if(!cameras.Iowa.other){
					cameras.Iowa.other = [];
				}
				cameras.Iowa.other.push(new Camera(cam));
			}
		}
	}
	fs.writeFileSync('../cameras/USA.json', JSON.stringify(cameras, null, 2));
}

function buildCamUrl(url){
	let camId = url.substring(url.lastIndexOf('/thumbs/') + 8, url.lastIndexOf('.flv.jpg'));
	return 'https://iowadotsfs1.us-east-1.skyvdn.com/rtplive/' + camId + '/playlist.m3u8';
}