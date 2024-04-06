'use strict';
const fs = require( 'fs' );
const https = require( 'https' );
const { parse } = require( 'node-html-parser' );

const cameras = JSON.parse( fs.readFileSync( '../cameras/USA.json' ) );

https.request( 'https://www.511pa.com/wsvc/gmap.asmx/buildCamerasJSONjs', ( res ) => {
	let data = '';

	res.on( 'data', ( chunk ) => {
		data += chunk;
	});

	res.on( 'end', () => {
		data = data.split( 'var camera_data = ' )[1];
		compile( JSON.parse( data ) );
	});
}).end();

class Camera {
	constructor ( cam ) {
		const decodedHTMLDescription = decodeEntities( cam.description );
		const parsedObj = parseHTML( cam, decodedHTMLDescription );

		this.location = {
			description: parsedObj.description,
			latitude: Number( cam.start_lat ),
			longitude: Number( cam.start_lng )
		};
		this.url = parsedObj.imageOnly ? parsedObj.imageSrc : parsedObj.streamSrc;
		this.encoding = parsedObj.imageOnly ? 'JPEG' : 'H.264';
		this.format = parsedObj.imageOnly ? 'IMAGE_STREAM' : 'M3U8';
		this.markedForReview = parsedObj.review && !parsedObj.imageOnly;

		console.info( this );
	}
}

function parseHTML ( cam, decodedHTMLDescription ) {
	const html = parse( decodedHTMLDescription );
	const htmlDescriptionObj = html.querySelector( '#camDescription' ); //This usually hints at direction, but is not in a usable format
	const imageSrcObj = html.querySelector( '.webmapcamimg' );
	let description = cam.title;
	let imageSrc;
	let streamSrc;
	if ( htmlDescriptionObj ) { description = description + ' - ' + htmlDescriptionObj.rawText; }

	if ( imageSrcObj ) { imageSrc = imageSrcObj.attributes.src; }

	if ( cam.md5 && ( cam.md5 ).startsWith( 'ptc' ) ) {
		const parts = ( cam.md5 ).split( '_' );
		const result = parts[parts.length - 1];
		imageSrc = 'https://www.paturnpike.com/webmap/1_devices/cam' + result + '.jpg';
	} else {
		//Going through http should allow cross domain streaming
		//if this does not work streams can be accessed through 1 of 3 IPs http://["209.71.158.42", "209.71.158.48", "209.71.158.54"]/live/...stream...
		//Will need to determine correct IP for individual streams.
		streamSrc = 'http://pa511wmedia102.ilchost.com/live/' + cam.md5 + '.stream/playlist.m3u8?wmsAuthSign=';
		//wmsAuthSign param is needed to start the stream, can be obtained by making a req to https://www.511pa.com/wowzKey.aspx
	}

	return {
		description: description,
		review: !( decodedHTMLDescription.includes( 'STREAMING:1' ) ),
		imageOnly: !( decodedHTMLDescription.includes( 'STREAMING' ) ),
		imageSrc: imageSrc,
		streamSrc: streamSrc
	};
}

function decodeEntities ( encodedString ) {
	const translate_re = /&(nbsp|amp|quot|lt|gt);/g;
	const translate = {
		'nbsp': ' ',
		'amp': '&',
		'quot': '"',
		'lt': '<',
		'gt': '>'
	};
	return encodedString.replace( translate_re, function ( match, entity ) {
		return translate[entity];
	}).replace( /&#(\d+);/gi, function ( match, numStr ) {
		const num = parseInt( numStr, 10 );
		return String.fromCharCode( num );
	});
}

function compile ( data ) {
	if ( !cameras.Pennsylvania ) {
		cameras.Pennsylvania = {};
	}

	for ( const cam of data.cams ) {
		if ( !cameras.Pennsylvania.other ) {
			cameras.Pennsylvania.other = [];
		}

		cameras.Pennsylvania.other.push( new Camera( cam ) );
	}

	fs.writeFileSync( '../cameras/USA.json', JSON.stringify( cameras, null, 2 ) );
}