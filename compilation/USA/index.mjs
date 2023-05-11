import { fileURLToPath } from 'url';
import path from 'path';
import { readdir } from 'fs/promises';

const dir = path.dirname( fileURLToPath( import.meta.url ) );

export default async function () {
	const cameras = {};
	const files = ( await readdir( dir ) ).sort( ( a, b ) => a.localeCompare( b ) );
	for ( const f of files ) {
		if ( f === 'index.mjs' || !path.extname( f ).includes( 'js' ) ) {
			continue;
		}

		const [ state, compile ] = ( await import( path.join( dir, f ) ) ).default;
		cameras[state] = compile();
	}

	await Promise.all( Object.values( cameras ) );
	return cameras;
}