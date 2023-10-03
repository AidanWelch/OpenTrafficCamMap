// Similar to coloradoDot
class Camera {
	constructor ( view, coordinates, tooltip ) {
		this.description = tooltip.trim();
		this.longitude = coordinates[0];
		this.latitude = coordinates[1];
		this.url = view.url;
		this.encoding = 'JPEG';
		this.format = 'IMAGE_STREAM';
	}
}

async function compile () {
	const cameras = [];

	const query = [
		{
			query: 'query MapFeatures($input: MapFeaturesArgs!, $plowType: String) { mapFeaturesQuery(input: $input) { mapFeatures { bbox tooltip uri features { id geometry properties } __typename ... on Camera { views(limit: 10000) { uri ... on CameraView { title category uri url sources { type src } } category } } ... on Plow { views(limit: 10000, plowType: $plowType) { uri ... on PlowCameraView { url } category } } } error { message type } } }',
			variables: {
				input: {
					north: 42.15051,
					south: 37.56563,
					east: -76.96472,
					west: -93.48816,
					zoom: 1, // zoom 1 ensures that all cameras are clustered except those listed as non-clusterable
					layerSlugs: [
						'normalCameras'
					],
					nonClusterableUris: []
				},
				plowType: 'plowCameras',
				cluster: 'false'
			}
		}
	];

	// As far as I can tell this is the only way to stop cameras from being reported as clustered
	// cameras seem to start at 400 and end somewhere around 100000, requests too large are rejected
	const promises = [];
	const step = 6000; // 6000 is roughly the max before being rejected
	for ( let start = 0; start < 100000 ; start += step ){
		promises.push( ( async () => {
			query[0].variables.input.nonClusterableUris = [];
			for ( let i = start; i < start + step; i++ ) {
				query[0].variables.input.nonClusterableUris.push( 'camera/' + i );
			}

			// plowCameras don't cluser so only query for them on the first call of the loop
			if ( start === 0 ) {
				query[0].variables.input.layerSlugs = [ 'plowCameras', 'normalCameras' ];
			} else {
				query[0].variables.input.layerSlugs = [ 'normalCameras' ];
			}

			const options = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify( query )
			};
			const [ { data } ] = await ( await fetch( 'https://511in.org/api/graphql', options ) ).json();
			for ( const camGroup of data.mapFeaturesQuery.mapFeatures ){
				if ( camGroup.uri.includes( 'cluster' ) ) {
					continue;
				}

				for ( const view of camGroup.views ){
					if ( view.url === undefined || view.url === null ) {
						continue;
					}

					cameras.push( new Camera( view, camGroup.features[0].geometry.coordinates, camGroup.tooltip ) );
				}
			}
		})() );
	}

	await Promise.all( promises );

	return { other: cameras };
}

export default [ 'Indiana', compile ];