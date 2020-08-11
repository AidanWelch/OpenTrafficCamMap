# OpenTrafficCam
A crowdsourced database of traffic cameras

## Camera list
Cameras will be stored in cameras/[Alpha-3 Country Code].json with the following schema.  All information in brackets should be the relevant input and should be in all uppercase.
```json
{
        "[state or standardized administrative region]": {
            "[zipcode or standardized regional breakdown, this should not be skipped but may be a single entry of 'all']": [
                {
                    "location": "[address of camera or best description of location]",
                    "url": "[url of stream]",
                    "encoding": "[encoding used]",
                    "format": "[the format of the given stream]",
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
Not only can the stream be encoded in various ways, it can be sent and requested in various way.  This just like the encoding list is not exhaustive and should be added to.

Format | Description
-------|------------
IMAGE_STREAM_BY_EPOCH_IN_MILLISECONDS | A format for a stream of images requested by epoch time in milliseconds
