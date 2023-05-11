import compileUSA from './compilation/USA/index.mjs';
import { fileURLToPath } from 'url';
import path from 'path';
import { writeFile } from 'fs/promises';

const dir = path.dirname( fileURLToPath( import.meta.url ) );

compileUSA().then(res => {
	console.log(res)
	//writeFile(path.join())
});