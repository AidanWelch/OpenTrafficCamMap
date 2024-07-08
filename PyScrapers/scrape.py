# Bu araç @keyiflerolsun tarafından | @KekikAkademi için yazılmıştır.

from Kekik.cli import cikis_yap, hata_yakala
from asyncio   import run
from Turkey    import balikesir, marmaris, alanya, trabzon, rize

async def basla():
    await balikesir.basla()
    await marmaris.basla()
    await alanya.basla()
    await trabzon.basla()
    await rize.basla()

if __name__ == "__main__":
    try:
        run(basla())
        cikis_yap(False)
    except Exception as hata:
        hata_yakala(hata)