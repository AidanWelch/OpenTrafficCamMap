# OpenTrafficCam
A crowdsourced database of 7256 traffic cameras.

[Checkout the interactive map!](http://otc.armchairresearch.org/map)

## Camera list
Cameras will be stored in cameras/[Alpha-3 Country Code].json with the following schema.  All information in brackets should be the relevant input.
The list can be compiled to from transport authority provided lists or it can added to manually.
```json
{
    "[state or standardized administrative region]": {
        "[county or standardized regional breakdown, this should not be skipped but if not applicable or unknown use 'other']": [
            {
                "location": {
                    "description": "[address of camera or best description of location]",
                    "direction": "[the cardinal direction the camera is facing, optional]",
                    "latitude": "[the latitude of the camera, optional]",
                    "longitude": "[the longitude of the camera, optional]"
                },
                "url": "[url of stream]",
                "encoding": "[encoding used]",
                "format": "[the format of the given stream]",
                "update_rate": "[only relevant on image stream formats, and even then is optional, but provides the rate at which the image provided can be pinged for an update]",
                "marked_for_review": bool
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
M3U8 | A format which points to a chunklist which points to chunks.

## Compilation
The compilation folder contains scripts for compiling from sources listed in the file name.

## Contribution Tips

[This FHWA site has helpful streaming information.](https://ops.fhwa.dot.gov/publications/fhwahop19037/appb.htm)
