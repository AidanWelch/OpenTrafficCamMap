import path from 'path';
import { readdir } from 'fs/promises';

const dir = new URL( path.dirname( import.meta.url ) );

export default async function () {
	const cameras = {};
	const files = await readdir( dir );
	for ( const f of files ) {
		if ( f === 'index.mjs' || !path.extname( f ).includes( 'js' ) ) {
			continue;
		}

		const [ state, compile ] = ( await import( path.join( dir.href, f ) ) ).default;
		const fetchinit = {};
		cameras[state] = compile( fetchinit );
		console.info( state, 'Fetching..' );
	}

	await Promise.all( Object.keys( cameras ).map( async state => cameras[state] = await cameras[state] ) );

	return cameras;
}

// should hash all cameras and add hash to list to compare for duplicates