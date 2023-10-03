class Camera {
	constructor ( view, coordinates ) {
		this.description = view.title.trim();
		this.longitude = coordinates[0];
		this.latitude = coordinates[1];
		if ( view.category === 'IMAGE' ) {
			this.url = view.url;
			this.encoding = 'JPEG';
			this.format = 'IMAGE_STREAM';
			return;
		}

		this.encoding = 'H.264';
		this.format = 'M3U8';
		this.url = view.sources[0].src;
	}
}


async function compile () {
	const cameras = [];

	const query = [
		{
			query: 'query MapFeatures($input: MapFeaturesArgs!, $plowType: String) { mapFeaturesQuery(input: $input) { mapFeatures { bbox tooltip uri features { id geometry properties } __typename ... on Camera { views(limit: 10000) { uri ... on CameraView { title category uri url sources { type src } } category } } ... on Plow { views(limit: 10000, plowType: $plowType) { uri ... on PlowCameraView { url } category } } } error { message type } } }',
			variables: {
				input: {
					north: 50.58834,
					south: 35.42243,
					east: -85.91993,
					west: -118.96681,
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
	for ( let start = 400; start < 100000 ; start += step ) {
		promises.push( ( async () => {
			query[0].variables.input.nonClusterableUris = [];
			for ( let i = start; i < start + step; i++ ) {
				query[0].variables.input.nonClusterableUris.push( 'camera/' + i );
			}

			const options = {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify( query )
			};
			const [ { data } ] = await ( await fetch( 'https://www.cotrip.org/api/graphql', options ) ).json();
			for ( const camGroup of data.mapFeaturesQuery.mapFeatures ) {
				if ( camGroup.uri.includes( 'cluster' ) ) {
					continue;
				}

				for ( const view of camGroup.views ) {
					if ( view.url === undefined || view.url === null ) {
						continue;
					}

					cameras.push( new Camera( view, camGroup.features[0].geometry.coordinates ) );
				}
			}
		})() );
	}

	await Promise.all( promises );

	return { other: cameras };
}

export default [ 'Colorado', compile ];