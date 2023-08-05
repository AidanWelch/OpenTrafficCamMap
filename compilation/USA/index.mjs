import { fileURLToPath } from 'url';
import path from 'path';
import { readdir } from 'fs/promises';

const dir = path.dirname( fileURLToPath( import.meta.url ) );

export default async function () {
	const cameras = {};
	const files = await readdir( dir );
	for ( const f of files ) {
		if ( f === 'index.mjs' || !path.extname( f ).includes( 'js' ) ) {
			continue;
		}

		const [ state, compile ] = ( await import( path.join( dir, f ) ) ).default;
		const fetchinit = {};
		cameras[state] = compile( fetchinit );
	}

	await Promise.all( Object.values( cameras ) );
	return cameras;
}

// should hash all cameras and add hash to list to compare for duplicates