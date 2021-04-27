var puppeteer = require('puppeteer');
var query_url = `https://www.cotrip.org/auth/getStreamingCameraAccessToken.do?streamApplication=liveStreams&streamName=11419_I25_3.8_mi_S_PlumCreekPkwy.stream&reqTime=${new Date().getTime()}`;

//console.log(`https://live.cotrip.org/liveStreams02/${streamName}/playlist.m3u8?wowzatokenhash=${data.wowzatokenhash}&wowzatokenendtime=${data.wowzatokenendtime}`);