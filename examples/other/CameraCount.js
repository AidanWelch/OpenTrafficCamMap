'use strict';
const fs = require('fs');
const cameras = JSON.parse(fs.readFileSync('../../cameras/USA.json'));
var count = 0;
for(var state in cameras){
	for(var county in cameras[state]){
		for(var camera in cameras[state][county]){
			count++;
		}
	}
}

console.log(count);

var readme = fs.readFileSync('../../README.md', 'utf8');

readme = readme.split('\n');
readme[1] = `A crowdsourced database of ${count} traffic cameras.`;
readme = readme.join('\n');

fs.writeFileSync('../../README.md', readme);