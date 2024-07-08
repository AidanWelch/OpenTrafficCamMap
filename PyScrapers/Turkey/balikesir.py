# Bu araç @keyiflerolsun tarafından | @KekikAkademi için yazılmıştır.

from Kekik.cli import konsol
from httpx     import AsyncClient, Timeout
from parsel    import Selector
from re        import search
from json      import load, dumps
from helpers   import str2latlng

class Balikesir:
    def __init__(self):
        self.belediye_url = "https://sehirkamera.balikesir.bel.tr"
        self.oturum       = AsyncClient(timeout=Timeout(10, connect=10, read=5*60, write=10))

    async def kameralar(self) -> dict[str, str]:
        istek  = await self.oturum.get(self.belediye_url)
        secici = Selector(istek.text)

        return {
            kamera.css("div.kesfet_kutu_baslik::text").get() : self.belediye_url + kamera.css("a::attr(href)").get()
                for kamera in secici.css("div#kesfet_kutu_1")
        }

    async def kamera_detay(self, kamera_url:str) -> dict | None:
        istek  = await self.oturum.get(kamera_url)
        secici = Selector(istek.text)

        # harita_link      = secici.css("a[href*='maps.google']::attr(href)").get()
        # enlem_boylam     = search(r"loc:@(.*?)&z", harita_link).group(1)
        # lat_str, lon_str = enlem_boylam.split(",")
        # if not lat_str or not lon_str:
        #     return None

        # latitude_parts = lat_str.split(".")
        # latitude = float(f"{latitude_parts[0]}." + "".join(latitude_parts[1:]))

        # longitude_parts = lon_str.split(".")
        # longitude = float(f"{longitude_parts[0]}." + "".join(longitude_parts[1:]))

        return {
            "ilce"        : secici.css("div.card-body span:nth-of-type(2)::text").get(),
            # "harita_link" : harita_link,
            # "latitude"    : latitude,
            # "longitude"   : longitude,
            "hls"         : await self.iframe2hls(secici.css("iframe::attr(src)").get())
        }

    async def iframe2hls(self, iframe_url:str) -> str:
        istek  = await self.oturum.get(iframe_url)
        hls_id = search(r"id: '(.*)'", istek.text).group(1)

        return f"https://content.tvkur.com/l/{hls_id}/master.m3u8"

    async def getir(self) -> dict[list[dict]]:
        kameralar = await self.kameralar()

        veri = {"Belediye": []}
        for kamera_adi, kamera_url in kameralar.items():
            kamera_detay = await self.kamera_detay(kamera_url)
            if not kamera_detay:
                continue

            latitude, longitude = await str2latlng(f"{kamera_adi}, Balıkesir")

            veri["Belediye"].append({
                "description" : kamera_adi,
                "latitude"    : latitude,
                "longitude"   : longitude,
                "url"         : kamera_detay["hls"],
                "encoding"    : "H.264",
                "format"      : "M3U8"
            })

        return veri
        

async def basla():
    belediye      = Balikesir()
    gelen_veriler = await belediye.getir()

    konsol.print(gelen_veriler)
    konsol.log(f"[yellow][Balikesir] [+] {len(gelen_veriler['Belediye'])} Adet Kamera Bulundu")

    turkey_json = "../cameras/Turkey.json"

    with open(turkey_json, "r", encoding="utf-8") as dosya:
        mevcut_veriler = load(dosya)


    if gelen_veriler == mevcut_veriler.get("Balıkesir"):
        konsol.log("[red][!] [Balikesir] Yeni Veri Yok")
        return

    if mevcut_veriler.get("Balıkesir"):
        del mevcut_veriler["Balıkesir"]
    mevcut_veriler["Balıkesir"] = gelen_veriler

    with open(turkey_json, "w", encoding="utf-8") as dosya:
        dosya.write(dumps(mevcut_veriler, sort_keys=False, ensure_ascii=False, indent=2))

    konsol.log(f"[green][Balikesir] [+] {len(gelen_veriler['Belediye'])} Adet Kamera Eklendi")