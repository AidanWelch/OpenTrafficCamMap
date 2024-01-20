# OpenTrafficCamMap
A crowdsourced database of 7921 traffic cameras.

[Checkout the interactive map!](http://otc.armchairresearch.org/map)

⚠️ USA.json has had a breaking change as this project is being modernized. ⚠️
[You can find the previous data in the v1 branch](https://github.com/AidanWelch/OpenTrafficCamMap/tree/v1)

## Camera list

Cameras will be stored in cameras/[Alpha-3 Country Code].json with the following schema.  All information in brackets should be the relevant input.
The list can be compiled to from transport authority provided lists or it can added to manually.

```json
{
    "[state or standardized administrative region]": {
        "[county or standardized regional breakdown, this should not be skipped but if not applicable or unknown use 'other']": [
            {
                "description": "[address of camera or best description of location]",
                "direction": "[the cardinal direction the camera is facing, optional, is in the format of 'N', 'NE', 'SW', etc]",
                "latitude": "[the latitude of the camera]",
                "longitude": "[the longitude of the camera]",
                "url": "[url of stream]",
                "encoding": "[encoding used]",
                "format": "[the format of the given stream]",
                "updateRate": "[only relevant on image stream formats, and even then is optional, but provides the rate at which the image provided can be pinged for an update, measured in milliseconds]",
                "markedForReview": "[bool, should(not is) only be included if true]"
            }
        ]
    }
}
```

## Encoding

Encoding standards should be consistently named, if you contribute a stream encoded in a different way than already listed, please contribute the standard name to the list.
Standards |
----------|
H.264 |
VP8 |
VP9 |
JPEG |

## Format

Not only can the stream be encoded in various ways, it can be sent and requested in various way.  This, just like the encoding list, is not exhaustive and should be added to.

Format | Description
-------|------------
IMAGE_STREAM | A format for a stream of images where the most recent one is sent on each request.
IMAGE_STREAM_BY_EPOCH_IN_MILLISECONDS | A format for a stream of images requested by epoch time in milliseconds.
M3U8 | A format which points to a chunklist which points to chunks, using m3u8 standard.
M3U9 | A format which points to a chunklist which points to chunks, using m3u9 standard.
UNIQUE_TEXASDOT | They just had to be special, didn't they?  Well, you have to post the following object: ```{"arguments": "[the cameras URL],[literally anything or nothing, only the comma was needed]"}``` to [this page.](https://its.txdot.gov/ITS_WEB/FrontEnd/svc/DataRequestWebService.svc/GetCctvContent)  A list seperated by commas that can't be split by commas will be returned.  The 4th element and everything that follows is the Base64 image, I recommend just slicing from the index of the start of the word "data".  You also have to remove all forward slashes(`\`).  All this should be shown [here.](./examples/streaming/UNIQUE_TEXASDOT.js)
UNIQUE_COLORADODOT | Not exactly worth it to try to stream.  The DRM implemented is a significant hassle for only a few cameras.  The example for streaming is not a high priority issue.
UNIQUE_NEWJERSEYDOT | An example for this is yet to be implemented but it is described [here.](./compilation/NewJerseyDot.js)  It requires WOWZA keys and is M3U8.

## Compilation

The compilation folder contains scripts for compiling from sources listed in the file name.

## FAQ

### Why are there traffic cameras in the Gulf of Guinea?

Because for various reasons transportation, or other, authorities of traffic cameras mistakenly or intentionally put a camera in their database at (0, 0); any camera there should be assumed to be innaccurate.

### Will any of the fields change?

"<https://raw.githubusercontent.com/AidanWelch/OpenTrafficCamMap/master/cameras/[country].json>" yes probably!  This project
is still in development so please clone it if you want unchanging data.

### What about when multiple sources for a camera are avaiable?

Sources that are simple to pull data from, are of the highest quality, and video should be preferred.  If those conflict video should be the highest priority, but beyond that it is up to the disgression of contributors and maintainers.

## Contribution Tips

[This FHWA site has helpful streaming information.](https://ops.fhwa.dot.gov/publications/fhwahop19037/appb.htm)
