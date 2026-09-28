import asyncio, json, sys
from playwright.async_api import async_playwright
URL = "file:///workspace/english-app/index.html"
SS = "/workspace/english-app/screenshots/"
errors = []
FB_DONE = []

ANSWER_JS = """
() => {
  const L = BZ.L, st = L.cur; if (st.k !== 'ex') return {kind: st.k};
  const e = st.e; const r = {kind:'ex', t:e.t};
  if (['listen','reverse','fill','meaning'].includes(e.t)) r.opt = e.opts.indexOf(e.ans);
  if (e.t === 'gmc') r.opt = e.g.a;
  if (e.t === 'gfill') r.text = e.g.a[0];
  if (['spell','arrange','gtiles'].includes(e.t)) {
    const target = e.t === 'spell' ? e.ans.split('') : (e.t === 'arrange' ? e.ans : e.g.a).split(' ');
    const used = new Set(); r.tiles = target.map(tok => { const i = e.tiles.findIndex((x, k) => !used.has(k) && x.toLowerCase() === tok.toLowerCase()); used.add(i); return i; });
  }
  if (e.t === 'match') r.pairs = e.group.map(w => w.id);
  return r;
}
"""

async def answer(page, correct=True, shot_before_check=None):
    info = await page.evaluate(ANSWER_JS)
    if info['kind'] != 'ex':
        await page.click('#lesson .lfoot .btn'); return info
    t = info['t']
    if 'opt' in info:
        idx = info['opt'] if correct else (info['opt'] + 1) % 4
        await page.click(f'#lesson .opt[data-i="{idx}"]')
    elif 'text' in info:
        await page.fill('#tin', info['text'] if correct else 'xyz')
    elif 'tiles' in info:
        tiles = info['tiles'] if correct else list(reversed(info['tiles']))
        for i in tiles:
            await page.click(f'#bank .tile[data-i="{i}"]')
    elif 'pairs' in info:
        for k, pid in enumerate(info['pairs']):
            if k == 1 and shot_before_check:
                await page.click(f'#lesson [data-side="l"][data-id="{pid}"]'); await page.wait_for_timeout(150)
                await page.screenshot(path=SS + shot_before_check); shot_before_check = None
            await page.click(f'#lesson [data-side="l"][data-id="{pid}"]')
            await page.click(f'#lesson [data-side="r"][data-id="{pid}"]')
            await page.wait_for_timeout(120)
        await page.wait_for_selector('#lesson .fb.show')
    if shot_before_check:
        await page.screenshot(path=SS + shot_before_check)
    if t != 'match':
        await page.click('#lesson .lfoot .btn')
        await page.wait_for_selector('#lesson .fb.show')
    await page.wait_for_timeout(300)
    return info

async def cont(page):
    await page.click('#lesson .fb.show .btn')
    await page.wait_for_timeout(200)

async def run_lesson(page, shots=None, wrong_at=None):
    """shots: dict of exercise-type -> filename (taken once, before check)."""
    shots = dict(shots or {}); n = 0; fb_shots = {}
    while True:
        if await page.query_selector('#lesson .complete'): break
        info = await page.evaluate("() => { const s = BZ.L.cur; return s.k === 'ex' ? {k:'ex', t:s.e.t} : {k:s.k}; }")
        if info['k'] != 'ex':
            await page.click('#lesson .lfoot .btn'); await page.wait_for_timeout(150); continue
        t = info['t']; fname = shots.pop(t, None)
        wrong = (wrong_at == n)
        await answer(page, correct=not wrong, shot_before_check=fname)
        if wrong and 'bad' not in fb_shots and not FB_DONE:
            await page.screenshot(path=SS + '04-feedback-wrong.png'); fb_shots['bad'] = 1
        elif not wrong and 'ok' not in fb_shots and n >= 1 and wrong_at is not None and not FB_DONE:
            await page.screenshot(path=SS + '04b-feedback-correct.png'); fb_shots['ok'] = 1
        await cont(page); n += 1
        if n > 40: raise Exception('lesson loop too long')
    if fb_shots: FB_DONE.append(1)
    await page.wait_for_timeout(900)

async def open_dev(page):
    await page.click('.tab[data-t="me"]'); await page.wait_for_timeout(200)
    for _ in range(5):
        await page.click('#meMascot'); await page.wait_for_timeout(60)
    await page.wait_for_selector('#modal')
    await page.wait_for_timeout(400)

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        page = await ctx.new_page()
        page.on('console', lambda m: errors.append(f'console.{m.type}: {m.text}') if m.type in ('error', 'warning') else None)
        page.on('pageerror', lambda e: errors.append(f'pageerror: {e}'))
        await page.goto(URL); await page.wait_for_timeout(500)
        await page.screenshot(path=SS + '00-home-fresh.png')
        # --- day 1 lesson
        await page.click('.node.current'); await page.wait_for_timeout(300)
        await page.screenshot(path=SS + '00b-node-popover.png')
        await page.click('.pop .btn'); await page.wait_for_timeout(400)
        await page.screenshot(path=SS + '02-word-card.png')
        for _ in range(3):
            await page.click('#lesson .lfoot .btn'); await page.wait_for_timeout(200)
        await run_lesson(page, shots={'meaning': '03-quiz-meaning.png', 'listen': '03b-quiz-listen.png', 'match': '03c-quiz-match.png', 'spell': '03d-quiz-spell.png', 'arrange': '03e-quiz-arrange.png'}, wrong_at=4)
        await page.screenshot(path=SS + '05-lesson-complete.png')
        await page.click('#lesson .lfoot .btn'); await page.wait_for_timeout(300)
        st = await page.evaluate("() => ({xp: BZ.S.xp, hearts: BZ.S.hearts, srs: Object.keys(BZ.S.srs).length, streak: BZ.S.streak, sleep: !!document.querySelector('.node.sleep')})")
        print('after day1:', st)
        # --- dev panel: simulate days 2..7
        await open_dev(page)
        await page.screenshot(path=SS + '09-dev-panel.png')
        for _ in range(6):
            await page.click('[data-d="simday"]'); await page.wait_for_timeout(100)
        await page.click('#modal .btn.plain'); await page.wait_for_timeout(2300)
        await page.click('.tab[data-t="review"]'); await page.wait_for_timeout(300)
        await page.screenshot(path=SS + '07-review.png')
        await page.click('.tab[data-t="learn"]'); await page.wait_for_timeout(500)
        await page.screenshot(path=SS + '01-home-path.png')
        cur = await page.evaluate("() => BZ.PATH[BZ.PATH.findIndex(n => !BZ.S.done[n.id])].id")
        print('current node after sim:', cur)
        # --- grammar lesson 1 via path
        await page.click('.node.current'); await page.wait_for_timeout(200); await page.click('.pop .btn'); await page.wait_for_timeout(400)
        await page.screenshot(path=SS + '06-grammar-intro.png')
        await page.click('#lesson .lfoot .btn'); await page.wait_for_timeout(200)
        await run_lesson(page, shots={'gmc': '06b-grammar-exercise.png', 'gfill': '06c-grammar-fill.png', 'gtiles': '06d-grammar-tiles.png'})
        await page.click('#lesson .lfoot .btn'); await page.wait_for_timeout(300)
        # --- weekly review
        cur = await page.evaluate("() => BZ.PATH[BZ.PATH.findIndex(n => !BZ.S.done[n.id])].id"); print('now current:', cur)
        await page.click('.node.current'); await page.wait_for_timeout(200)
        await page.screenshot(path=SS + '07a-weekly-review-node.png')
        await page.click('.pop .btn'); await page.wait_for_timeout(400)
        nq = await page.evaluate("() => ({n: BZ.L.total, words: new Set(BZ.L.steps.flatMap(s => s.e.t === 'match' ? s.e.group.map(w=>w.w) : [s.e.w.w])).size})")
        print('weekly review:', nq)
        await run_lesson(page, shots={'match': '07b-weekly-review-match.png', 'fill': '03f-quiz-fill.png', 'reverse': '03g-quiz-reverse.png'}, wrong_at=3)
        await page.screenshot(path=SS + '07c-weekly-complete.png')
        await page.click('#lesson .lfoot .btn'); await page.wait_for_timeout(300)
        # d8 should be available (new calendar day), then sleep after completing it
        # --- review tab
        await page.click('.tab[data-t="review"]'); await page.wait_for_timeout(300)
        await page.screenshot(path=SS + '07e-review-after-weekly.png')
        due = await page.evaluate("() => document.querySelectorAll('.duetag').length"); print('due tags:', due)
        if await page.query_selector('[data-act="review"]'):
            await page.click('[data-act="review"]'); await page.wait_for_timeout(300)
            await run_lesson(page); await page.click('#lesson .lfoot .btn'); await page.wait_for_timeout(300)
        # word detail modal
        await page.click('.witem'); await page.wait_for_timeout(300)
        await page.screenshot(path=SS + '07d-word-detail.png'); await page.click('#modal .btn.ghost')
        # --- grammar tab
        await page.click('.tab[data-t="grammar"]'); await page.wait_for_timeout(300)
        await page.screenshot(path=SS + '06e-grammar-list.png')
        # --- profile
        await page.click('.tab[data-t="me"]'); await page.wait_for_timeout(300)
        await page.screenshot(path=SS + '08-profile.png')
        await page.evaluate("() => document.querySelector('#main').scrollTop = 820"); await page.wait_for_timeout(200)
        await page.screenshot(path=SS + '08b-profile-calendar.png')
        # --- hearts: run out
        await page.evaluate("() => { BZ.S.hearts = 1; }")
        await page.click('.tab[data-t="learn"]'); await page.wait_for_timeout(300)
        await page.click('.node.current'); await page.wait_for_timeout(200); await page.click('.pop .btn'); await page.wait_for_timeout(300)
        for _ in range(3):
            await page.click('#lesson .lfoot .btn'); await page.wait_for_timeout(150)
        await answer(page, correct=False); await cont(page); await page.wait_for_timeout(600)
        await page.screenshot(path=SS + '10-out-of-hearts.png')
        await page.click('#modal [data-act="practice"]'); await page.wait_for_timeout(300)
        await run_lesson(page); await page.click('#lesson .lfoot .btn'); await page.wait_for_timeout(300)
        print('hearts after practice:', await page.evaluate("() => BZ.S.hearts"))
        # --- day gating: complete d8 then check sleep
        await page.click('.node.current'); await page.wait_for_timeout(200); await page.click('.pop .btn'); await page.wait_for_timeout(300)
        for _ in range(3):
            await page.click('#lesson .lfoot .btn'); await page.wait_for_timeout(150)
        await run_lesson(page); await page.click('#lesson .lfoot .btn'); await page.wait_for_timeout(400)
        print('sleep node present:', await page.evaluate("() => !!document.querySelector('.node.sleep')"))
        await page.screenshot(path=SS + '11-home-after-daily-done.png')
        # monthly: unlock all & run m1
        await page.evaluate("() => { BZ.S.unlockAll = true; }")
        idx = await page.evaluate("() => BZ.PATH.findIndex(n => n.id === 'm1')")
        await page.click('.tab[data-t="review"]'); await page.click('.tab[data-t="learn"]'); await page.wait_for_timeout(300)
        await page.click(f'.node[data-i="{idx}"]'); await page.wait_for_timeout(300); await page.click('.pop .btn'); await page.wait_for_timeout(300)
        print('monthly total:', await page.evaluate("() => BZ.L.total"))
        await run_lesson(page); await page.click('#lesson .lfoot .btn'); await page.wait_for_timeout(300)
        # persistence check: reload
        xp1 = await page.evaluate("() => BZ.S.xp"); await page.reload(); await page.wait_for_timeout(400)
        xp2 = await page.evaluate("() => BZ.S.xp"); print('persist xp', xp1, xp2)
        # ?dev=1
        await page.goto(URL + '?dev=1'); await page.wait_for_timeout(300)
        print('dev fab:', bool(await page.query_selector('.devfab')))
        await b.close()
    print('ERRORS:', json.dumps(errors, ensure_ascii=False, indent=1))

asyncio.run(main())
