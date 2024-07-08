# Bu araç @keyiflerolsun tarafından | @KekikAkademi için yazılmıştır.

from Kekik.cli import cikis_yap, hata_yakala
from asyncio   import run
from Turkey    import balikesir, marmaris, alanya, trabzon, rize, giresun, erzurum, caycuma

async def basla():
    await balikesir.basla()
    await marmaris.basla()
    await alanya.basla()
    await trabzon.basla()
    await rize.basla()
    await giresun.basla()
    await erzurum.basla()
    await caycuma.basla()

if __name__ == "__main__":
    try:
        run(basla())
        cikis_yap(False)
    except Exception as hata:
        hata_yakala(hata)