# Bu araç @keyiflerolsun tarafından | @KekikAkademi için yazılmıştır.

from Kekik.cli import konsol, cikis_yap, hata_yakala
from httpx     import AsyncClient, Timeout
from asyncio   import run
from json      import load, dumps

class Marmaris:
    def __init__(self):
        self.oturum      = AsyncClient(timeout=Timeout(10, connect=10, read=5*60, write=10))
        self.kordinatlar = {
            "Meydan"           : "36.8548769,28.2678585",
            "Uzun Yalı"        : "36.8516576,28.2662401",
            "İçmeler"          : "36.802893,28.2317378",
            "Atatürk Bulvarı"  : "36.8552241,28.2682233",
            "Bozburun"         : "36.6755598,28.0613853",
            "Kordon Caddesi 1" : "36.8512351,28.2686464",
            "Kordon Caddesi 2" : "36.8515991,28.2726258",
        }

    async def kameralar(self) -> dict[str, str]:
        istek = await self.oturum.get("https://wowza.yayin.com.tr/playlist/marmarisbel/playlist_marmarisbel.json")
        return istek.json()

    async def getir(self) -> dict[list[dict]]:
        kameralar = await self.kameralar()

        veri = {"WowzaYayin": []}
        for kamera_veri in kameralar.get("playlist", []):
            latitude, longitude = self.kordinatlar.get(kamera_veri["title"], "0,0").split(",")

            veri["WowzaYayin"].append({
                "description" : kamera_veri["title"],
                "latitude"    : float(latitude),
                "longitude"   : float(longitude),
                "url"         : "https:" + kamera_veri["sources"][0]["file"],
                "encoding"    : "H.264",
                "format"      : "M3U8"
            })

        return veri
        

async def basla():
    belediye      = Marmaris()
    gelen_veriler = await belediye.getir()

    konsol.print(gelen_veriler)
    konsol.log(f"[yellow][+] {len(gelen_veriler['WowzaYayin'])} Adet Kamera Bulundu")

    turkey_json = "../../cameras/Turkey.json"

    with open(turkey_json, "r", encoding="utf-8") as dosya:
        mevcut_veriler = load(dosya)


    if gelen_veriler == mevcut_veriler.get("Marmaris"):
        konsol.log("[red][!] Yeni Veri Yok")
        return

    del mevcut_veriler["Marmaris"]
    mevcut_veriler["Marmaris"] = gelen_veriler

    with open(turkey_json, "w", encoding="utf-8") as dosya:
        dosya.write(dumps(mevcut_veriler, sort_keys=False, ensure_ascii=False, indent=2))

    konsol.log(f"[green][+] {len(gelen_veriler['WowzaYayin'])} Adet Kamera Eklendi")


if __name__ == "__main__":
    try:
        run(basla())
        cikis_yap(False)
    except Exception as hata:
        hata_yakala(hata)