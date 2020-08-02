# OpenTrafficCam
A crowdsourced database of traffic cameras

## Camera list
Cameras will be stored in cameras.json with the following schema.  All information in brackets should be the relevant input and should be in all uppercase.
```json
{
    "[alpha-3 country code]": {
        "[state or standardized administrative region]": {
            "[zipcode or standardized regional breakdown, this should not be skipped but may be a single entry of 'all']": [
                {
                    "address": "[address of camera]",
                    "url": "[url of stream]",
                    "encoding": "[encoding used]",
                    "format": "[the format of the given stream]",
                    "marked_for_review": bool
                }
            ]
        }
    }
}
```
