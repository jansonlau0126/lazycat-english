import asyncio, sys
from playwright.async_api import async_playwright
# usage: render.py file.html out.png w h scale [file.html out.png w h scale ...]
async def main():
    args = sys.argv[1:]
    jobs = [args[i:i+5] for i in range(0, len(args), 5)]
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for src, out, w, h, sc in jobs:
            pg = await b.new_page(viewport={'width': int(w), 'height': int(h)}, device_scale_factor=float(sc))
            import os
            await pg.goto('file://' + os.path.dirname(os.path.abspath(__file__)) + '/' + src)
            await pg.evaluate('document.fonts.ready')
            await pg.evaluate('Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; })))')
            await pg.wait_for_timeout(300)
            await pg.screenshot(path=out, full_page=False)
            await pg.close()
        await b.close()
asyncio.run(main())
