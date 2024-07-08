# Bu araç @keyiflerolsun tarafından | @KekikAkademi için yazılmıştır.

from Kekik.cli import konsol, cikis_yap, hata_yakala
from httpx     import AsyncClient, Timeout
from parsel    import Selector
from re        import search
from asyncio   import run
from json      import load, dumps

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

        harita_link      = secici.css("a[href*='maps.google']::attr(href)").get()
        enlem_boylam     = search(r"loc:@(.*?)&z", harita_link).group(1)
        lat_str, lon_str = enlem_boylam.split(",")
        if not lat_str or not lon_str:
            return None

        latitude  = float(lat_str.replace(".", "", lat_str.count(".") - 1))
        longitude = float(lon_str.replace(".", "", lon_str.count(".") - 1))

        return {
            "ilce"        : secici.css("div.card-body span:nth-of-type(2)::text").get(),
            "harita_link" : harita_link,
            "latitude"    : latitude,
            "longitude"   : longitude,
            "hls"         : await self.iframe2hls(secici.css("iframe::attr(src)").get())
        }

    async def iframe2hls(self, iframe_url:str) -> str:
        istek  = await self.oturum.get(iframe_url)
        hls_id = search(r"id: '(.*)'", istek.text).group(1)

        return f"https://content.tvkur.com/l/{hls_id}/master.m3u8"

    async def getir(self) -> dict[list[dict]]:
        kameralar = await self.kameralar()

        veri = {"SehirKamera": []}
        for kamera_adi, kamera_url in kameralar.items():
            kamera_detay = await self.kamera_detay(kamera_url)
            if not kamera_detay:
                continue

            veri["SehirKamera"].append({
                "description" : kamera_adi,
                "latitude"    : kamera_detay["latitude"],
                "longitude"   : kamera_detay["longitude"],
                "url"         : kamera_detay["hls"],
                "encoding"    : "H.264",
                "format"      : "M3U8"
            })

        return veri
        

async def basla():
    belediye      = Balikesir()
    gelen_veriler = await belediye.getir()

    konsol.print(gelen_veriler)
    konsol.log(f"[yellow][+] {len(gelen_veriler['SehirKamera'])} Adet Kamera Bulundu")

    turkey_json = "../../cameras/Turkey.json"

    with open(turkey_json, "r", encoding="utf-8") as dosya:
        mevcut_veriler = load(dosya)


    if gelen_veriler == mevcut_veriler.get("Balikesir"):
        konsol.log("[red][!] Yeni Veri Yok")
        return

    del mevcut_veriler["Balikesir"]
    mevcut_veriler["Balikesir"] = gelen_veriler

    with open(turkey_json, "w", encoding="utf-8") as dosya:
        dosya.write(dumps(mevcut_veriler, sort_keys=False, ensure_ascii=False, indent=2))

    konsol.log(f"[green][+] {len(gelen_veriler['SehirKamera'])} Adet Kamera Eklendi")


if __name__ == "__main__":
    try:
        run(basla())
        cikis_yap(False)
    except Exception as hata:
        hata_yakala(hata)