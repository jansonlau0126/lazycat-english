# 懶貓英文・每日五個字 — 第 1 季 Build Spec（BUILD-SPEC-S1.md）

> **For:** the coding agent building Season 1. **Status:** Season 1 design formally approved by Janson (2026-09-27/28). **All product decisions are final (§18 Decisions, 2026-09-28)** — where an earlier section still mentions an alternative, §18 wins.
> **Language:** spec prose is English (for precision) with all **UI copy in written Cantonese exactly as it must appear**. App UI = Cantonese / Traditional Chinese; learning content = English + Cantonese.
> **Paths** in this document are relative to the package root (`handoff-s1/`). Every mockup/asset path quoted here exists in the package (`python3 tools/validate_data.py` checks it).
> **Source of truth order:** this spec → `data/*.json` → mockups (`mockups/*.png`) → mockup HTML (`mockups/src/`) → design concept (`reference/DESIGN-CONCEPT-v2.md`) → old app (`reference/old-app/`). If two sources disagree, the earlier one wins; note any conflict you hit in the PR description.

---

## 0. Contents
1. Product summary · 2. Approved decisions · 3. Tech constraints & architecture · 4. Visual system · 5. Content data · 6. Season 1 course structure · 7. Screens (with mockups) · 8. Lesson engine & 7 quiz types · 9. Pronunciation & tap-to-speak · 10. Spaced repetition (SRS) · 11. Streak / XP / hearts / goal · 12. Cats: unlocks, companion, album, bonus · 13. Data model & localStorage · 14. Old 包仔 progress (not imported) · 15. Icon placeholders (config flag) + SVG icon trial · 16. Repo, branch & deploy · 17. Out of scope · 18. Decisions (Janson, 2026-09-28)

---

## 1. Product summary
- **What:** a Duolingo-style, mobile-first English learning web app for **Janson** (Hong Kong, English ≈ junior-secondary / 初中). It **replaces** the old 包仔英文・每日三個字 app. The repo was renamed `baozai-english` → **`lazycat-english`** (decision P2), so the site is now **`https://jansonlau0126.github.io/lazycat-english/`** (the old `/baozai-english/` URL no longer serves).
- **Season 1 (this build) = 第 1 季 🌸 伸個懶腰（生活基本）, weeks 1–13:** 12 weekly themes × 25 words = **300 words**, **5 new words per day** (Mon–Fri style days 1–5), a weekly review each week, **grammar every 2 weeks (lessons ①–⑥)**, **3 monthly reviews** (after weeks 4, 8, 12) and a **quarterly review week (week 13)**.
- **New in the redesign:** realistic big-eyed cats instead of the 包仔 mascot; 15 unlockable cats (貓貓圖鑑); a per-cat photo album (畫冊) driven by the day's companion cat (陪讀貓); a collectible 5×5 **theme vocab card** per theme (save/share as image); a year map with Season 1 active and Seasons 2–4 locked/"即將推出".
- **Kept from the old app (must keep working):** Leitner SRS, weekly & monthly reviews, all 7 quiz types, 🔊 normal / 🐢 slow / 🎤 speak-check, streak 🔥, XP ⭐, hearts ❤️, daily goal, word bank with filters, profile stats/calendar, dev panel, localStorage persistence. See §8–§11 for how each works today and what changes.

## 2. Approved decisions (all must be reflected in the build)
| # | Decision | Where in spec |
|---|---|---|
| D1 | App name **懶貓英文・每日五個字** (short brand in top bar: **懶貓英文**). Slogan (optional, e.g. About/meta): 「每日五個字，學完瞓返個晏覺。」 | §4, §7.1 |
| D2 | **包仔 mascot retired** — no 包仔 art/strings anywhere in the new UI (old progress is **not** imported, so there is no migration message either — §14, decision P10). | §7, §14 |
| D3 | Realistic big-eyed cute **cat photos** (15 cats; long-hair, short-hair and hairless mix). | §12, `data/cats.json` |
| D4 | Word icons are **custom hand-drawn watercolour stickers** (not emoji). 25 food icons exist; the other 275 come later (see §15 for the interim placeholder). **All 1,200 words will eventually get icons, one season at a time.** Interim: pastel letter tile (default) + a **trial set of simple SVG vector icons for theme 1** behind a setting so Janson can compare (decision P1). | §15, `ASSETS.md` |
| D5 | **Abstract words** (happy, always, because…) get simple drawn **scene icons** (e.g. happy = a smiling cat; always = a clock with a loop arrow). `abstract` + `icon_idea` fields in the word JSON. | §5.1 |
| D6 | **5 words/day by weekly theme**; **grammar every 2 weeks**; **weekly and monthly reviews kept**. | §6 |
| D7 | Mockups **01–09 approved**; **theme vocab card template approved**; **Season 1 design formally approved**; album photos **provisionally approved**. | §7 |
| D8 | **Cat album:** default unlock photo + 💤 瞓覺 sleep / 🙆 伸懶腰 stretch / 😸 開心 happy. Each extra photo unlocks after **every 5 new-word lessons completed with that cat as the day's 陪讀貓**. Hidden bonus 🧶 **玩毛線 yarn** photo unlocks when a **whole theme is completed with zero mistakes**. | §12.3–12.5 |
| D9 | **Theme vocab card** unlocks when a theme is finished; **5 rows × 5 words**, each row a different pastel colour = one day's words; each cell = icon + English + IPA + Cantonese meaning; header = companion cat photo + season/week + theme name zh+en + word count; footer = completion date. In-app: **swipe** between collected cards, **toggle IPA**, **save as image**, **share**. | §7.4 |
| D10 | **Tap any word** on the theme card (and in word lists generally) → speaks it with the same TTS as the old 🔊; **double-tap → slow** (like 🐢). The saved/shared image is a plain image (no audio). | §9.3 |
| D11 | Repo **renamed** to `jansonlau0126/lazycat-english` (was `baozai-english`); site = `https://jansonlau0126.github.io/lazycat-english/`. Build on branch **`season1-rebuild`**, open a PR to `main`, merge (by Janson) to publish. | §16, §18 |

## 3. Tech constraints & architecture
**Hard constraints**
- **Static site on GitHub Pages**, project-site sub-path `/lazycat-english/`. **No backend, no accounts, no analytics, no external runtime requests** (no CDNs, no Google Fonts). Everything is served from the repo.
- **All URLs relative** (`assets/cats/…`, never `/assets/…`) so it works under `/lazycat-english/` and when opened locally. Never hard-code the repo name.
- **Persistence = `localStorage` only** (key `lazycat-english-v1`, §13). Must survive reload; must not break if storage is full/blocked (wrap in try/catch like the old `save()`).
- **Mobile-first**: design width **390 × 844** (mockups are 390 wide @2x). Must look right from **360 to 430 px** wide; on desktop, centre a max-width **480 px** column on the cream background. Respect iPhone safe areas (`env(safe-area-inset-*)`) for the tab bar and bottom buttons. Tap targets ≥ 44 px. Add `touch-action: manipulation` on tappable word cells (prevents double-tap zoom, see §9.3).
- **Target browsers:** iOS Safari 16+, Chrome Android (current), desktop Chrome/Edge/Safari. No console errors on load or during any flow.

**Recommended architecture** (you may choose differently if you keep the constraints)
- Plain HTML + CSS + vanilla JS (ES modules or one bundled `app.js`). A tiny build script (Python or Node, like the old `reference/old-app/build.py`) is fine; **commit the built output** so Pages serves it without Actions.
- **Inline the data at build time** (e.g. generate `js/data.js` that sets `window.LAZYCAT_DATA = {words, themes, grammar, cats}` from `data/*.json`) so the app works offline from `file://` like the old app and needs no `fetch`. Keep `data/*.json` as the editable source.
- Suggested published layout at repo root: `index.html`, `css/app.css`, `js/app.js`, `js/data.js`, `assets/` (copied from the package), `.nojekyll`. Keep this package at `handoff-s1/` in the repo.
- Cache-busting: append `?v=<build-hash>` to CSS/JS URLs.

**Images & fonts (sizes already prepared in `assets/`)**
| Asset | Package path | Format / size | Notes |
|---|---|---|---|
| 15 default cat photos | `assets/cats/01-fanshu-orange-tabby.webp` … `assets/cats/15-baubau-bengal.webp` | WebP 800×450 (16:9), q82, ~10–20 KB each | Crop with CSS (`object-fit/-position` or the absolute-img technique in `mockups/src/photos.js`) using `crop` hints in `data/cats.json`. |
| Hero (番薯 napping) | `assets/cats/hero-fanshu-napping.webp` | WebP 800×450 | Home hero + theme-card header when card cat = 番薯. |
| 60 album poses | `assets/poses/<slug>-{sleep,stretch,happy,yarn}.webp` | WebP 800×450, ~15–25 KB | **Lazy-load** (`loading="lazy"`); only load a cat's poses when its album/celebration opens. |
| 25 food icons | `assets/icons/<word-id>.png` | PNG with alpha, 173×173 (≤256) | Future icons land here with the same naming (§15). |
| Fonts | `assets/fonts/` | TTF, all SIL OFL 1.1 | jf open 粉圓 (Huninn) 4.9 MB must be **subset** for production (e.g. `pyftsubset` on all characters used in UI + data; target < 1 MB, or WOFF2). Baloo 2 / Nunito / Noto Sans variable fonts can be converted to WOFF2. `font-display: swap`. **Licences:** `assets/fonts/LICENSES.md` — a subset/modified Huninn must be renamed (Reserved Font Name "huninn"), e.g. family `LazyCatRound`; ship the licence texts. |

Performance budget: first load (HTML+CSS+JS+data+fonts+home images) **≤ 2 MB transferred**; poses and non-visible cat photos lazy.

## 4. Visual system (from `mockups/src/common.css`; do not invent new colours)
| Role | Name | Hex |
|---|---|---|
| Background | 奶油 cream | `#FFF8EE` |
| Cards | white, border `#F1E4D4` (darker line `#E6D3BD`) | `#FFFFFF` |
| Primary buttons/progress | 橘貓橙 orange | `#F59A3E` (shadow `#D9782A`, light `#FFE7CF`) |
| Highlight / stars | 太陽黃 sun | `#FFD66B` (light `#FFF1C7`) |
| Cute accents | 咕𠱸粉 pink | `#F7B5C4` (light `#FDE8EE`) |
| Grammar / monthly review / long-hair | 毛冷紫 lavender | `#B7A6E6` (deep `#8E7CC9`, light `#EFEAFB`) |
| Pronunciation / examples / short-hair | 天空藍 sky | `#8FCBEA` (deep `#5AA9D1`, light `#E3F3FB`) |
| Correct / done | 薄荷綠 mint | `#8FD6AE` (deep `#5DB585`, light `#E3F6EB`) |
| Wrong / hearts / ribbons | 珊瑚紅 coral | `#FF7A7A` (ribbon shadow `#E05A5F`) |
| Text | 可可啡 cocoa | `#5B4636` (secondary `#A48F80`) — **never pure black** |
| Theme-card day rows 1–5 | orange / pink / green / blue / purple pastels | `#FFF3E0` `#FDEBF0` `#EEF7EC` `#EAF4FB` `#F2EEFB` |

- **Fonts:** Chinese titles/UI = **jf open 粉圓 (Huninn)**; English headwords = **Baloo 2** (700–800); English body = **Nunito**; IPA = **Noto Sans**; fallbacks `"Noto Sans CJK HK","Noto Sans CJK TC","PingFang HK",sans-serif`.
- **Shapes:** big radii (cards 22 px, buttons 18 px, icon tiles 26 px), 2 px light-brown borders, 3–5 px **bottom shadows** ("pressable" Duolingo feel: button moves down on press). Photos: white 3 px ring + soft shadow (`.cphoto` in `mockups/src/common.css`).
- **Lazy-cat motifs:** napping hero, cushion pink, slanting sun, lavender yarn, paw 🐾 as completion mark, Zzz.
- **UI icons:** tab-bar SVGs are in `mockups/src/common.js` (`IC.home/map/cards/paw/me`) — reuse them. Small UI icons (🔥 ⭐ ❤️ 🔊 🐢 🎤 🔒 etc.) stay emoji/SVG; only **word icons** must be hand-drawn.

## 5. Content data (`data/`)
### 5.1 `data/season1-words.json` — 300 words (array, in teaching order)
| Field | Type | Meaning |
|---|---|---|
| `id` | string | Stable id = lowercase word slug (`rice`, `monday`). **Unique across all seasons**; SRS progress is keyed by it; icon file = `assets/icons/<id>.png`. |
| `seq` | int | 1–300 teaching order |
| `season` | int | always `1` |
| `week` | int | 1–12 (week = theme number in Season 1) |
| `theme_id`, `theme_zh`, `theme_en` | string | `t01`…`t12`; names as in `season1-themes.json` |
| `day` | int | 1–5 within the theme (= row on the theme card) |
| `order` | int | 1–5 within the day (= column on the theme card) |
| `word` | string | headword (capitalised only for days of the week) |
| `ipa` | string | British IPA, slashes included (`/raɪs/`) |
| `pos` | string | `n.` `v.` `adj.` `adv.` `num.` `det.` `conj.` `interj.` — display as pill with Chinese: n. 名詞, v. 動詞, adj. 形容詞, adv. 副詞, num. 數詞, det. 限定詞, conj. 連接詞, interj. 感嘆詞 (also pron. 代名詞, prep. 介詞 for later seasons) |
| `meaning_zh` | string | short Cantonese/Traditional meaning (shown on theme card, quizzes, lists) |
| `meaning_full` | string (optional) | longer meaning for the word card only (see below) |
| `explain_yue` | string | 廣東話解釋 (word card, mockup 02) — *extra field beyond the minimum list, taken from the old app format* |
| `example_en`, `example_zh` | string | example sentence (always contains the exact headword → needed by the fill-in quiz) + natural Cantonese translation |
| `tip` | string | 懶貓貼士 usage tip. If it contains `\n`, the **first line (minus a trailing 「：」) is the tip title** and the remaining lines are bullet lines (see `spicy`, which reproduces mockup 02 exactly). |
| `icon` | string \| null | `assets/icons/<id>.png` if the hand-drawn icon exists, else **`null`** |
| `emoji` | string | fallback emoji for placeholder option A (§15) |
| `abstract` | bool | `true` = needs a scene/symbol icon rather than an object |
| `icon_idea` | string | short English brief for the future hand-drawn icon |

Food theme (t05) is **exactly** the approved card order and meanings (`mockups/vocab-card-food-export.png`): rice 飯；米, noodles 麵, bread 麵包, egg 蛋, chicken 雞；雞肉 / beef 牛肉, pork 豬肉, fish 魚, shrimp 蝦, vegetable 蔬菜 / tomato 番茄, carrot 紅蘿蔔, fruit 水果, apple 蘋果, banana 香蕉 / orange 橙, soup 湯, sandwich 三文治, dumpling 餃子, cake 蛋糕 / cheese 芝士, sweet 甜, salty 鹹, spicy 辣, delicious 好味；美味.
Optional field **`meaning_full`**: a longer meaning for the single word card only. Currently only `spicy` has it (「辣；辛辣」, as in `mockups/02-word.png`). Rule: **word card shows `meaning_full ?? meaning_zh`; everything else (theme card, export image, quizzes, lists) shows `meaning_zh`.**

16 of the old app's 90 words are reused in Season 1 (busy, tired, hungry, breakfast, late, weather, umbrella, forget, order, menu, bill, sleep, weekend, relax, holiday, comfortable); `data/legacy-baozai-words.json` maps old numeric ids → words; it is kept for **reference only** — old progress is not imported (§14, decision P10).

### 5.2 `data/season1-themes.json`
Object with `season` metadata, `path_order` (the 16 map nodes), `themes[12]` (id, no, week, emoji, zh, short_zh for the map label, en, description, `icon` (only food has one: `assets/icons/noodles.png`), `days[5]` with word ids + row colour, `saturday` (weekly review + grammar id or story), `grammar`, `cat_unlock`, `followed_by` monthly review), `monthly_reviews[3]`, `quarterly_review` (week 13 plan) and `later_seasons[3]` (Seasons 2–4 teaser data for the map).

### 5.3 `data/season1-grammar.json`
Six lessons (①–⑥) in the **same shape as the old `grammar.js`** (`intro[]` with `h`, `p` (may contain `<b>`/`<br>`), `ex` audio examples; `ex[7]` exercises with `t` = `mc` | `fill` | `tiles`). ② / ④ / ⑤ reuse old lessons; ① / ③ / ⑥ are new. 15 XP each.

### 5.4 `data/cats.json`
15 cats in 圖鑑 order: slug, names, breed zh/en, hair, 懶語錄 quote, default photo, 4 pose paths, face-crop hints, unlock rule (`type`, `value`, `label_zh`, `progress_tpl`), plus the pose table (names, tags, celebration titles/quotes) and album maths.

## 6. Season 1 course structure (weeks 1–13)
Season 1 = 🌸 **第 1 季・伸個懶腰（生活基本）**, weeks 1–13, map background pink. Theme list and numbering follow `reference/DESIGN-CONCEPT-v2.md` §3 exactly.

| Week | Theme id | Theme | Sat. grammar | Extra node after the week | Cat unlocked here (if earned) |
|---|---|---|---|---|---|
| 1 | t01 | 🙋 自我介紹同家人 Me & Family | — (odd week: weekly review; story deferred) | — | 灰灰 on the first lesson (day 1); 芝麻 on the first theme card (day 5) |
| 2 | t02 | 🖐️ 身體 Body | **① be 動詞 am / is / are** (g01) | — | 斑斑 when best streak reaches 7 (typically around here) |
| 3 | t03 | 🏠 屋企同家具 Home | — | — | |
| 4 | t04 | ⏰ 日常作息 Daily Routine | **② 一般現在式** (g02) | **m1 月度複習 1** (t01–t04) | 花花 on the first monthly review |
| 5 | t05 | 🍱 食物 Food | — | — | |
| 6 | t06 | 🧋 飲品同茶餐廳 Drinks & Café | **③ 名詞眾數 + a / an** (g03) | — | |
| 7 | t07 | 👕 衣服 Clothes | — | — | |
| 8 | t08 | 🎨 顏色、形狀、數字 Colours & Numbers | **④ 可數／不可數 + some / any** (g04) | **m2 月度複習 2** (t05–t08) | 咖啡 when best streak reaches 30 (if daily) |
| 9 | t09 | 🌦️ 天氣 Weather | — | — | |
| 10 | t10 | 📅 時間同日期 Time & Dates | **⑤ 現在進行式** (g05) | — | |
| 11 | t11 | 🐾 動物同寵物 Animals & Pets | — | — | |
| 12 | t12 | 😊 情緒 Feelings | **⑥ 代名詞同物主** (g06) | **m3 月度複習 3** (t09–t12) | |
| 13 | q1 | 👑 季度複習週 (5 review days + 季度大考) | — | — | 湯圓 when the 季度大考 is completed |

Other cats that may unlock during Season 1 depending on performance: 矮瓜 (100 words at box 5 「掌握」 — needs ≥ 30 days of SRS so may land in Season 2), 棉花 (30 perfect lessons), 奶昔 (5,000 XP — unlikely in S1). 藍莓 / 大熊 / 雪糕 / 豆腐 / 豹豹 are **not reachable in Season 1** (show locked in 圖鑑).

### 6.1 Week structure
- **Days 1–5** (「一」–「五」 in the week strip): one **new-word lesson** each = the 5 words of that `day` (row of the theme card), in `order`.
- **Day 6** (「六 文法+複習」): **weekly review** of that theme's 25 words (node `tNNw`) **and**, on even weeks, the **grammar lesson** (node `gNN`). On odd weeks only the weekly review (the design doc's "mini story" is **deferred** to a later release — decision P7). Both unlock once day 5 of that theme is done.
- **Day 7** (「日 懶貓日」): rest day — no new content (§6.3).
- After weeks 4/8/12 the **monthly review** node (`m1`/`m2`/`m3`) appears on the map between themes and **must be done before the next theme starts** (it gates `t05`, `t09`, `q1`).
- **Week 13 (q1)**: 5 review days (`q1d1`–`q1d5`: themes 1–3 / 4–6 / 7–8 / 9–10 / 11–12, 15 questions each, 20 XP) then the **季度大考** `q1x` (40 questions over all 300 words incl. 4 match groups, 60 XP). Completing `q1x` = Season 1 complete → 湯圓 unlocks and the map shows Season 2 as 「即將推出」.

### 6.2 Node ids & order (`path_order` in `data/season1-themes.json`)
Node ids: `t01d1`…`t01d5`, `t01w` (weekly review), `g01`…`g06`, `m1`–`m3`, `q1d1`…`q1d5`, `q1x`.
Unlock order is strictly sequential: `tNNd1 → … → tNNd5 → {tNNw, gNN (even weeks)} → next theme d1` (the weekly review and grammar are **recommended** but do not block the next theme; the monthly review **does** block). Rationale: Janson is self-paced; gating only at monthly reviews keeps momentum while guaranteeing a check every 4 themes.

### 6.3 Pacing rules (config constants, defaults shown)
| Constant | Default | Meaning |
|---|---|---|
| `NEW_LESSONS_PER_DAY` | `1` | Normal number of **first-time** new-word lessons per calendar day when the learner is **on or ahead of schedule** (after it, home shows 「今日完成 ✓ 聽日見 🌙」). Replays, weekly review, grammar, monthly/quarterly reviews, SRS review and practice are always unlimited. |
| `CATCHUP_UNLIMITED` | `true` | **Decision P6:** when the learner is **behind schedule** (see below), he may do **as many extra new-word lessons per day as he likes** until caught up — no "> 3 behind" threshold, **no per-day cap**. |
| `CATCHUP_ON_SUNDAY` | `false` | Sunday stays a 懶貓日 rest day (P5) even when behind; set `true` to allow catch-up lessons on Sundays too. |
| `SUNDAY_REST` | `true` | On real Sundays, home shows the 懶貓日 card and does **not** offer a new-word lesson (reviews still available). |
| `SUNDAY_KEEPS_STREAK` | `true` | A missed Sunday does not break the streak (streak rule §11.1). |
| `ASK_COMPANION_DAILY` | `true` (user setting) | Open the choose-companion sheet before the day's first new-word lesson when ≥ 2 cats are unlocked. |
| `ICON_PLACEHOLDER` | `"tile"` | **Decision P1: `"tile"`** (pastel tile + first letter). `"emoji"` remains as a dev option, §15. |
| `SVG_ICON_TRIAL` | `true` | Enables the **SVG vector-icon trial** (theme 1 only, §15.1). Whether SVGs are shown is the user setting `settings.svgIcons` (default **`false`** → the tile stays the default). |

The week strip on Home shows **course days** (一–五 = lesson 1–5 of the current theme, 六 = weekly review/grammar, 日 = 懶貓日), not calendar weekdays; the 「星期五」 label in mockup 01 is the **real** weekday. If Janson falls behind, the course simply continues where he is (no penalties), and he may **catch up with unlimited extra lessons** (decision P6):
- **Schedule** (Mon-start): week 1 starts on the Monday on/before `startDate` (date of the first new-word lesson). Each Mon–Fri adds one expected new-word lesson; Sat/Sun add none. `expected(today) = min(60, 5 × fullWeeksElapsed + weekdaysElapsedThisWeek incl. today if Mon–Fri)`. Time travel (`dayOffset`) applies.
- **Behind** = number of first-time-completed new-word lessons (`done[tNNdD]`) `< expected(today)`.
- A new-word lesson may be **started** when the next node is a new-word lesson, it is not a rested Sunday (`SUNDAY_REST` and not `CATCHUP_ON_SUNDAY`), and either fewer than `NEW_LESSONS_PER_DAY` new lessons were started/finished today **or** the learner is behind (`CATCHUP_UNLIMITED`). No per-day cap while behind; once caught up the normal 1/day rule applies again.
- Monthly reviews still gate the next theme (§6.2); they don't count toward `expected`.
- Week strip = **course days** (unchanged; no calendar alignment).

## 7. Screens
Navigation = bottom **tab bar with 5 tabs** (SVG icons from `mockups/src/common.js`): **首頁 · 地圖 · 生字卡 · 貓貓 · 我**. Active tab = orange icon/label on a light-orange rounded pill (see any mockup). The **生字卡** tab shows a coral badge with the number of words due for SRS review today (like the old 複習 tab badge).
**Top bar** (mockups 01/04/06): left = circular face photo of the current companion (white ring) + 「懶貓英文」 in Huninn orange; right = three pills 🔥 streak · ⭐ XP · ❤️ hearts (or ∞ when unlimited). Tapping the avatar opens the companion sheet (§7.8). Tapping the avatar 5× quickly opens the dev panel (as the old mascot did); `?dev=1` also works.

### Mockup ↔ screen map
| Screen | Mockup (package path) | HTML source |
|---|---|---|
| 首頁 Home | `mockups/01-home.png` | `mockups/src/01-home.html` |
| 生字卡 Word card (lesson learn phase) | `mockups/02-word.png` | `mockups/src/02-word.html` |
| 主題生字卡 Theme vocab card (in app) | `mockups/03-theme-card.png` | `mockups/src/03-card.html`, `mockups/src/vocabcard.js`, `mockups/src/vocabcard.css` |
| Theme vocab card export / share image | `mockups/vocab-card-food-export.png` | `mockups/src/card-export.html` |
| 貓貓圖鑑 Cat collection | `mockups/04-cat-collection.png` | `mockups/src/04-collection.html` |
| 解鎖新貓貓 Unlock-cat celebration | `mockups/05-unlock-cat.png` | `mockups/src/05-unlock.html` |
| 年度課程地圖 Year map | `mockups/06-year-map.png` | `mockups/src/06-map.html` |
| 畫冊 Cat album | `mockups/07-cat-album.png` | `mockups/src/07-album.html`, `mockups/src/album.js` |
| 揀今日陪讀貓 Choose companion sheet | `mockups/08-choose-companion.png` | `mockups/src/08-companion.html` |
| 畫冊新相 New-photo celebration | `mockups/09-new-photo-unlocked.png` | `mockups/src/09-new-photo.html` |
| Overview board (all screens) | `mockups/overview.png` | `mockups/src/overview.html` |
| All 15 cats (reference) | `mockups/cats-gallery.png` | `mockups/src/cats-gallery.html` |
| All 15 cats' albums (reference) | `mockups/album-all-cats.png` | — |
| Quiz screens, feedback bar, completion, grammar intro, word bank, profile, dev panel, out-of-hearts (**no new mockup — restyle the old screens with the new palette/fonts**) | `reference/old-app/screenshots/03-quiz-meaning.webp` … `reference/old-app/screenshots/10-out-of-hearts.webp` | `reference/old-app/app.js`, `reference/old-app/app.css` |

The mockup HTML renders from inside the package (open `mockups/src/01-home.html` in a browser; `mockups/src/render.py` re-renders PNGs with Playwright). Reuse its CSS freely; its data is hard-coded demo data — the app must use `data/*.json` + state.

### 7.1 首頁 Home — `mockups/01-home.png`
Top to bottom:
1. **Top bar** (above).
2. **Hero card**: `assets/cats/hero-fanshu-napping.webp` (番薯 asleep on a pink cushion, purple 「z z Z」 floating top-right), rounded 22 px, cream border. White speech bubble top-left: title 「喵～瞓醒未呀 Janson？」 (orange) + body 「今日學埋 5 個字，就可以一齊瞓返個晏覺 😴」. Name from `profile.name` (default "Janson"). Bubble copy by state: done today → 「今日學完喇！我哋一齊瞓返個晏覺 😴」; 懶貓日 → 「今日懶貓日 😴 冇新嘢學，想溫就溫下到期嘅字。」; season complete → 「第 1 季完成！第 2 季即將推出 🌸」. (**Decision P12: the hero photo is always 番薯 napping** — it does not change with the companion.)
3. **Current theme card**: theme icon tile (food = `assets/icons/noodles.png`; other themes: the theme emoji on a light tile until theme icons exist) · small grey line 「第 1 季・🌸 伸個懶腰 ・ 第 5 / 52 週」 · theme name 「食物」 (Huninn, cocoa) + 「Food」 (Baloo, orange) · orange progress bar + 「23 / 25」 (words learned in this theme). Tap → opens this theme's card (half-filled) in 生字卡.
4. **Today card**: header 「今日 5 個字 ・ 星期五」 (real weekday) + orange pill 「已學 3 / 5」 (cards seen in today's lesson). Row of 5 word tiles (icon + word): seen = mint border + green ✓ badge; current = orange border + light-orange fill; not yet = faded/grey. Big orange 3D button (states):
   - not started → 「開始學 🐾 今日 5 個字」
   - partly through the cards → 「繼續學 🐾 仲有 N 個字」 (mockup shows 「仲有 2 個字」)
   - all 5 cards seen but quiz not finished → 「繼續學 🐾 做埋小測驗」
   - done today → button disabled style 「今日完成 ✓ 聽日見 🌙」; if Saturday nodes are open, a second button 「做週複習 📝」 / 「上文法課 📖」
   - done today **but behind schedule** (P6, §6.3) → main button 「追進度 🐾 再學 5 個字」 + small muted line 「仲差 N 課追上進度」 (N = expected − done); pressing it starts the next new-word lesson (unlimited while behind). Bubble copy may stay the done-today text.
   - weekly review / grammar pending (after day 5) → card title 「星期六：週複習＋文法」, buttons for each open node
   - monthly / quarterly review due → card title 「🏆 月度大複習」 / 「👑 季度複習週」 with button 「開始複習 💪」
   - 懶貓日 (Sunday, `SUNDAY_REST`) → 「今日懶貓日 😴」, button 「溫下到期嘅字」 (goes to SRS review) if anything is due
   - out of hearts → button shows 「❤️ 冇心喇」 and opens the out-of-hearts sheet (old behaviour)
5. **SRS due chip** (only when due > 0; not in the mockup — add under the today card): 「🧠 你有 N 個字今日要複習　去複習 →」 → starts SRS review.
6. **Week strip**: 7 circles labelled 一 二 三 四 五 六 日; done = orange filled with white paw; current = white with orange ring and the number; 六 = lavender circle 📖 with caption 「文法+複習」; 日 = sky circle 😴 with caption 「懶貓日」.
7. Tab bar.

### 7.2 生字卡 Word card (lesson "learn" phase) — `mockups/02-word.png`
Top: ✕ close (asks 「確定要離開？進度會保存到呢張卡」) · progress bar with segments. Chip 「🍜 食物・今日第 4 / 5 個字」 (theme emoji + short name + position) and pink pill 「新字」 (or 「溫習」 on replays). The companion cat's face peeks from the top-right corner, slightly tilted.
Body: large rounded **icon tile** (icon PNG, or placeholder §15) · headword (Baloo 2, ~44 px, cocoa) · IPA (Noto Sans, muted) · pos pill 「adj. 形容詞」 · three buttons 「🔊 聽發音」 (orange) / 「🐢 慢速」 (sky) / 「🎤 跟讀」 (pink; hidden if speech recognition is unsupported) · meaning line with small label 「中文意思」 + `meaning_full ?? meaning_zh` large.
Cards below: **廣東話解釋** (cat avatar + `explain_yue`) · **💬 例句** (sky-blue card: `example_en` with the headword bold/orange, `example_zh` below, small 🔊 that reads the sentence) · **💡 懶貓貼士** (yellow card: `tip`; multi-line tips render title + bullet lines, e.g. spicy's 「茶餐廳實用」 lines).
Footer button: 「明白喇，下一個 →」; on card 5: 「明白喇！開始小測驗 💪」. Word auto-plays once (normal speed) when the card appears (if sound on).

### 7.3 Quiz, feedback & completion (restyle of old screens)
- Quiz layout as old app (`reference/old-app/screenshots/03-quiz-meaning.webp` etc.): header ✕ + progress bar + ❤️ count; type label chip (e.g. 「💬 揀中文意思」); prompt bubble with the **companion's face photo** (replaces 包仔); options as big white 3D buttons; 「檢查」 button.
- Feedback bar (`reference/old-app/screenshots/04-feedback-wrong.webp`): mint 「答啱喇！」 or coral 「差少少！正確答案：…」 + 「繼續」. Correct answer is spoken.
- Completion (`reference/old-app/screenshots/05-lesson-complete.webp`): companion photo (happy pose if unlocked, else default) + confetti; title 「今日 5 個字學完！」 (new-word lesson) / 「週複習完成！」 / 「文法課完成！」 / 「月度大複習完成！」 / 「季度大考完成！」; three stat cards ⭐ XP · 🎯 準確率 · ⏱ 用時; button 「繼續」 → runs the celebration queue (§12.6).
- Out of hearts sheet (`reference/old-app/screenshots/10-out-of-hearts.webp`): as old: 「冇心喇 💔」, refill countdown, 「練習補心」 button.

### 7.4 主題生字卡 Theme vocab card — `mockups/03-theme-card.png`, export `mockups/vocab-card-food-export.png`
Lives in the **生字卡 tab** (segment 「主題卡」, default) and is also opened from Home and the celebration.
- **Page header**: back chevron in a white rounded square · title 「主題生字卡」 · sub 「已收集 5 / 48 張 ・ 左右掃睇其他主題」 · page dots top-right (one per card in S1 carousel; current = orange pill).
- **Card frame**: cream card with dotted border pattern and rounded corners, drop shadow.
  - **Header**: rounded photo (left) of the card's cat — if the cat is 番薯 use the napping hero crop (as mockup); otherwise that cat's default photo cropped to face (crop hints in `data/cats.json`) · line 「第 1 季 ・ 第 5 週 ・ 主題生字卡」 (muted) · theme emoji/icon + 「食物」 (Huninn, large) + 「Food」 (Baloo, orange) · right: big orange 「25」 over 「個字」.
  - **Grid 5 × 5**: row = day (row colours day 1–5 `#FFF3E0` `#FDEBF0` `#EEF7EC` `#EAF4FB` `#F2EEFB`), column = order. Cell = icon (≈40 px) · English (Baloo/Nunito bold, auto-shrink for long words like "vegetable", "comfortable", "grandmother") · IPA (small muted; hidden when 音標 toggle off) · `meaning_zh` (Huninn).
  - **Footer**: 「🐾 Janson 已完成 ・ 2026 年 10 月 2 日」 left, 「懶貓英文」 orange right. Date = date of first completion of day 5, format `YYYY 年 M 月 D 日`.
- **Controls under the card**: 「音標」 toggle (mint switch; persisted in `settings.showIPA`, default on) · 「💾 存做圖片」 white button · 「📤 分享」 orange button.
- **Info strip** (lavender): 「✨ 每學完一個主題就解鎖一張生字卡」 + 「下一張：🧋 飲品同茶餐廳（第 6 週）」.
- **Before completion** (current theme): the card shows with learned words filled and unlearned cells as grey empty tiles with the day number; footer 「學緊 ・ 已學 N / 25」; save/share disabled. Themes not started are not in the carousel.
- **Swipe** left/right (touch + mouse drag + arrow keys) between collected cards; carousel ordered by week; opens on the most recent.
- **Tap a word cell → speak (normal); double-tap → speak slowly** (§9.3). Brief highlight on the tapped cell.
- **Card size**: base layout 360 × 540 CSS px (2:3) as in `mockups/src/vocabcard.css`, scaled to fit the screen width (390 px phone → ~350 px card).
- **Save as image**: draw the card to a `<canvas>` (not a DOM screenshot library — keep zero deps; fonts must be loaded first via `document.fonts.ready`) at **1080 × 1620 px** (2:3) matching `mockups/vocab-card-food-export.png`: header with photo, the grid, footer, IPA shown per current toggle; placeholders drawn per §15. Download as `lazycat-s1-w05-food.png` (`lazycat-s<season>-w<week2>-<theme_en slug>.png`).
- **Share**: `navigator.share({files:[png], title:'懶貓英文', text:'我喺懶貓英文學完「食物 Food」25 個字 🐾'})` when `navigator.canShare({files})` is true; otherwise fall back to download + toast 「已儲存圖片」. The exported image has no audio (approved).
- Segment 2 **「生字庫」**: the old 複習 word bank (§10.3) — list of all learned words with filters. Segment 3 **「文法」**: list of grammar lessons ①–⑥ (locked until reached, replayable after) — old 文法 tab. *(No mockup for these two; build in the new style. My placement choice — see "unsure" list in README.)*

### 7.5 貓貓圖鑑 Cat collection — `mockups/04-cat-collection.png`
Header 「貓貓圖鑑 🐾」 + right 「5 / 15 隻貓貓」 (orange number) · orange progress bar · line 「陪讀貓： 番薯（橘貓） ・ 撳一下可以換陪讀貓」.
3-column grid of 15 cards in `no` order:
- **Unlocked**: round photo (face crop), name (Huninn), 「品種・長/短毛」 small; card tinted (orange tint for current companion with ⭐ top-right; others light blue/lavender by hair type as in mockup: short-hair = sky tint, long-hair = lavender tint, hairless = pink tint). Pink 「NEW」 badge until the cat's album has been opened once (`cats[slug].seen`).
- **Locked**: dashed border, greyscale + blurred photo (CSS `filter: grayscale(1) blur(6px)`), white 🔒 badge, condition `unlock.label_zh` (e.g. 「🔥 連續 30 日」, 「完成第 1 季」, 「100 字達「掌握」」, 「30 課零錯誤」) and a muted progress line: show `progress_tpl` filled for **tongyun** (「第 5 / 13 週」), **aigwa** (「22 / 100」), **minfa** (「8 / 30」) and for the **next** unmet streak cat only (banban → kafe → suetgo; mockup shows kafe 「12 / 30 日」 and suetgo 「未解鎖」); all others show 「未解鎖」.
- Tap unlocked card → album (§7.7). Tap locked card → small toast with the rule. Long-press/secondary: none.

### 7.6 解鎖新貓貓 Unlock-cat celebration — `mockups/05-unlock-cat.png`
Full-screen dimmed overlay, cream modal with coral ribbon title 「🎉 解鎖新貓貓！」; sunburst rays + confetti + ✨ behind a large circular photo (white ring, yellow outer ring); name (Huninn, large) · pill 「三色貓 ・ Calico ・ 短毛」 · speech bubble with the cat's 懶語錄 in 「」 · pills: lavender 「🏆 <reason>」, yellow 「⭐ +40 XP」 (XP earned by the lesson that triggered it; hide if 0), mint 「🐾 圖鑑 5 / 15」 · buttons 「設為陪讀貓 🐾」 (orange; sets companion) and 「收埋入圖鑑先」 (white).
Reason strings (unlock screen): huihui 「完成第一課」, zima 「收集第一張生字卡」, banban 「連續學習 7 日」, fafa 「完成第 1 次月度大複習」, kafe 「連續學習 30 日」, tongyun 「完成第 1 季」, aigwa 「100 個字達「掌握」」, minfa 「30 課零錯誤」, suetgo 「連續學習 100 日」, naisik 「累積 5,000 XP」 (daufu/lammui/daihung/baubau not reachable in S1).

### 7.7 畫冊 Cat album — `mockups/07-cat-album.png`, all cats: `mockups/album-all-cats.png`
- Header: 「< 圖鑑」 back · title 「番薯嘅畫冊」 · pill 「📷 2 / 4」 (regular photos unlocked / 4).
- Profile card (orange tint): round photo · name + pill 「橘貓・短毛」 · quote 「瞓醒先算，英文慢慢嚟。」 · 「一齊學咗 7 堂 ・ 新手貓」 (companion lessons + the cat's `unlock.label_zh`).
- Section 「📖 畫冊」 + right hint 「每陪你學 5 堂，就多一張相」.
- 2×2 grid of photo cards (rounded, photo 4:3 using pose `object_position`): tag top-left (「解鎖圖鑑時」, 「陪讀 5 堂」, 「陪讀 10 堂」, 「陪讀 15 堂」); caption with number circle ① 坐定定 ② 瞓覺 ③ 伸懶腰 ④ 開心 and mint 「已解鎖」 pill. Locked: dashed, blurred grey silhouette, 🔒 in a white circle, hint (「佢會點瞓呢？」 / 「伸咩姿勢呢？」 / 「？？？」), grey number, pill 「再陪讀 N 堂」.
  - Locked placeholder: use the locked pose image with `filter: blur(14px) grayscale(1) opacity(.5)` (as `mockups/src/album.js`) — acceptable because it is unrecognisable.
- **Bonus row** (lavender dashed): blurred thumb · 「🧶 隱藏相：玩毛線」 + purple pill 「BONUS」 · 「🔒 任何一個主題全部答啱（零錯誤）」 / 「就會解鎖呢張隱藏相」. When unlocked: shows the yarn photo + 「🧶 玩毛線 ・ <theme> 零錯誤獎勵」.
- **Next photo card**: 「📷 下一張相：伸懶腰」 + right 「2 / 5 堂」 · 5 paw segments (filled orange = lessons toward next photo) · 「揀番薯做陪讀貓，再學 3 堂就解鎖新相！」. When all 3 regular photos unlocked: 「🎉 全部相都解鎖咗！」.
- Button 「揀佢做今日陪讀貓 🐾」 (hidden/disabled 「而家陪緊你 ✓」 if already companion) · caption 「今日陪讀貓：花花 ・ 換咗都唔會蝕咗進度」.
- Tap an unlocked photo → lightbox (full width, caption, swipe between unlocked photos, ✕).

### 7.8 揀今日陪讀貓 Choose companion — `mockups/08-choose-companion.png`
Bottom sheet over dimmed Home (drag handle, ✕). Title 「🐾 揀今日陪讀貓」 · sub 「陪你學完 5 堂，佢嘅畫冊就會多一張新相 📷」.
List of **unlocked** cats (current companion first, then by `no`): round photo · name + breed · pills 「而家陪緊你」 (mint, current companion) and 「NEW」 (coral, unseen) · 5 mini album slots (🐱 default, 💤 sleep, 🙆 stretch, 😸 happy — unlocked slots show the emoji on light orange, locked = grey lock; 5th = 🧶 slot in lavender dashed, shows 🧶 when earned) · 「2 / 4 張相」 · 「下一張：再陪讀 3 堂」 + small orange progress bar (lessons mod 5 / 5) · radio circle on the right (selected = orange ✓, card gets orange border).
Footer: stacked blurred avatars + 「仲有 10 隻貓貓未解鎖，去圖鑑睇吓」 (link to 圖鑑) · button 「就揀<name>喇 🐾」 · caption 「隨時可以換 ・ 每堂計落當時嘅陪讀貓度」.
Opened by: top-bar avatar, 圖鑑 header line, album button, and automatically before the first new-word lesson of a day (`askCompanionDaily`, ≥ 2 cats unlocked; remember `companionAskedDate`).

### 7.9 畫冊新相 New-photo celebration — `mockups/09-new-photo-unlocked.png`
Dim overlay; cream modal; coral ribbon 「📷 畫冊新相！」; polaroid-style photo tilted ~-3° with pink washi tape, caption 「③ 伸懶腰」 + pill 「3 / 4」; title from `poses[].title_tpl` (「番薯伸咗個大懶腰！」); sub 「多謝你陪番薯學咗 10 堂」; bubble with pose quote (「伸完呢個懶腰，就有力氣陪你學多 5 個字……先瞓。」); 5 thumbnails of the album (unlocked photos, the new one with orange ring and 「NEW」 tag, locked = grey blur + 🔒, yarn = lavender ring + 🧶); pills 「🐾 陪讀 10 堂」 · 「⭐ +20 XP」 (XP of the triggering lesson: 15 + 5 perfect) · 「📷 畫冊 3 / 4」; buttons 「睇番薯嘅畫冊 🐾」 and 「繼續」.
Yarn bonus variant: ribbon 「🧶 隱藏相！」, caption 「🧶 玩毛線」 + pill 「BONUS」, sub 「<theme_zh> 全部答啱，零錯誤！」, quote from yarn pose.

### 7.10 年度課程地圖 Year map — `mockups/06-year-map.png`
- **Header card**: 「年度課程地圖 🗺️」 + right orange 「第 5 / 52 週」 · orange progress bar (weeks) · 「已學 123 / 1,200 字」 · right 「主題 4 / 48 ・ 文法 2 / 24」. (Week = current theme's week; words = SRS `learned` count; 主題 = theme cards collected; 文法 = grammar lessons done.)
- **Season 1 panel** (pink bg `#FFF0F3`-ish, pink border): 「🌸 第 1 季・伸個懶腰」 + right 「第 1–13 週 ・ 生活基本」. Snake path of 16 nodes in 4 rows of 4 (`path_order`):
  - row 1 (→): 自我介紹 · 身體 · 屋企 · 日常作息
  - row 2 (←): 月度複習 (m1) · 食物 · 茶餐廳 · 衣服 (drawn right-to-left: m1 on the right)
  - row 3 (→): 顏色數字 · 月度複習 (m2) · 天氣 · 時間日期
  - row 4 (←): 動物寵物 · 情緒 · 月度複習 (m3) · 季度大複習 (q1, bigger yellow crown node, label 「季度大複習」 + orange 「解鎖湯圓 🐱」)
  - Connectors: solid yellow line between completed nodes, dotted beige line ahead; curved ends between rows.
  - Node styles: **done** = sun-yellow 3D circle + theme emoji + mint ✓ badge; **current** = orange circle with glow ring, label 「食物・學緊」 in orange, companion face avatar bubble beside it; **locked** = beige/grey circle, faded emoji; monthly review nodes = lavender with 🏆 (done = lavender + ✓).
  - Tap node → bottom sheet: title, week, status, words (for themes: 5 day rows with ✓), buttons 「開始」/「重溫」/「睇生字卡」; locked → 「完成之前嘅課就會解鎖」.
- **Seasons 2–4** cards (collapsed, from `later_seasons`): 「☀️ 第 2 季・出去曬太陽 第 14–26 週」 (yellow), 「🍂 第 3 季・返學返工 第 27–39 週」 (peach), 「❄️ 第 4 季・窩喺被竇 第 40–52 週」 (blue); row of 12 theme emojis; right: blurred round cat photo with 🔒 and 「解鎖 藍莓 / 大熊 / 豹豹」. **Add** a small grey pill 「即將推出」 on each (not in the mockup; required since content doesn't exist yet). Tapping shows toast 「第 2 季即將推出，學完第 1 季先 🐾」.

### 7.11 我 Profile (restyle of old — `reference/old-app/screenshots/08-profile.webp`)
Companion photo + name; stat tiles: 🔥 連續 N 日 (最長 M 日) · ⭐ 總 XP · 📚 已學字數 · 🏆 掌握字數 · 🐱 貓貓 x / 15 · 🃏 生字卡 x / 48 · 📖 文法 x / 24 · ✨ 零錯誤 N 課; daily goal picker (10/20/30/50 XP) with today's ring; 7-day XP bar chart; month calendar with active days; settings: 🔊 音效 on/off, voice picker (English voices, 「試聽」), 每日問我揀陪讀貓 on/off, 顯示音標 on/off, **生字圖示** 「字母方塊（預設）／向量圖（試用・第 1 課題）」 (`settings.svgIcons`, §15.1); (nice-to-have) 匯出／匯入進度 (JSON file); version line 「懶貓英文 v1.0（第 1 季）」.

### 7.12 Dev panel (`reference/old-app/screenshots/09-dev-panel.webp`)
Keep all old tools (time travel ±1 day, add XP, set streak, refill/empty hearts, unlimited hearts, unlock all nodes, reset progress) and add: 跳去第 N 週 (mark all earlier nodes done with SRS seeded), 解鎖所有貓, 陪讀貓 +5 堂, 模擬零錯誤主題 (trigger yarn), preview each celebration (theme card / new photo / yarn / unlock cat), switch `ICON_PLACEHOLDER` tile/emoji and toggle SVG icons at runtime, **圖示比較** (theme 1: tile │ SVG │ emoji side by side for all 25 words, §15.1), show raw state JSON. (No 測試搬屋 / migration tools — old progress is not imported, §14.)

## 8. Lesson engine & the 7 quiz types (keep old behaviour — `reference/old-app/app.js`)
### 8.1 Engine (unchanged unless stated)
- A lesson = queue of steps: `card` (learn), `intro` (grammar), `ex` (exercise). Progress bar = done steps / total.
- **Wrong answer** → lose 1 heart (unless practice/unlimited), red feedback bar showing the correct answer (+ `why` for grammar), the step is **re-queued at the end** (max 6 re-queues per lesson; after that it counts as done). `mistakes++`.
- Correct → mint bar with random praise from 「好嘢！」「正呀！」「勁喎！」「做得好！」「冇得頂！」「叻叻豬！」「答啱咗！」; sound effect (WebAudio beeps, respects `settings.sound`).
- Per-word result for SRS: a word is "right" only if **all** its exercises in the lesson were first-time correct.
- Quit ✕ → confirm; progress in the quiz is lost (cards-seen progress is kept, §8.2).
- Can't **start** a non-practice lesson with 0 hearts; if hearts hit 0 mid-lesson, the out-of-hearts sheet appears on 「繼續」.
- Finish → XP (+5 perfect bonus if 0 mistakes and not a replay), `markActive()` (streak), `lessons++`, `perfectLessons++` if perfect (not practice, not replay), SRS update (not for grammar), `done[nodeId]` updated, companion credit (§12.2), unlock checks (§12.1), celebration queue (§12.6).

### 8.2 New-word lesson (node `tNNdD`) — 5 cards + 10 exercises
1. 5 **word cards** (§7.2) in `order` 1→5. Persist `inProgress = {nodeId, cardsSeen, date}` after each card so Home shows 「已學 N / 5」 and resumes at the next card.
2. **10 exercises** (old lesson had 8 for 3 words; scaled to 5): with `a…e` = the 5 words shuffled:
   `meaning(a) · listen(b) · reverse(c) · meaning(d) · listen(e) · match(all 5) · spell(a|longest ≤ 10 letters preferred) · fill(b) · arrange(c) · fill(d)`.
   Every word appears in ≥ 2 exercises + the match.
3. Don't show the word's icon in prompts where it would reveal the answer (listen, reverse, spell); icons may appear in 「揀中文意思」 options only as decoration — simplest: **no icons in quizzes**.
4. Replays of a done lesson: cards optional (「跳過生字卡」 button), 5 XP, no companion credit, no perfect bonus, no yarn eligibility.

### 8.3 The 7 exercise types (TYPE_LABEL chip text must stay)
| Type | Chip | Behaviour |
|---|---|---|
| `listen` | 🎧 聽音揀字 | Auto-plays the word (🔊 + 🐢 buttons); pick the English word from 4 options (3 decoys from the same theme first, then other learned words). |
| `meaning` | 💬 揀中文意思 | Show the English word (tap to hear); pick `meaning_zh` from 4. |
| `reverse` | 🔤 揀英文生字 | Show `meaning_zh`; pick the English word from 4. |
| `fill` | ✏️ 句子填充 | `example_en` with the headword blanked (regex `\bword\b`, case-insensitive; every example contains its headword — validated) + `example_zh` hint; pick from 4. |
| `spell` | 🧩 串字 | Show `meaning_zh` + 🔊; tap letter tiles to spell (letters shuffled + 2 decoy letters when the word has ≤ 7 letters); backspace; spaces/hyphens pre-filled. Case-insensitive check (Monday etc.). |
| `arrange` | 🧱 砌句子 | `example_zh` shown; tap word tiles to build `example_en` (tokens + 2 extra tokens from other examples when ≤ 7 tokens); punctuation attached to tokens as the old `tokenize()`. |
| `match` | 🔗 配對 | 5 English ↔ 5 Chinese in two columns; tap pairs; wrong pair flashes red and costs a heart; done when all matched. Speaking the English on tap. |
Grammar exercise types (from `data/season1-grammar.json`): `mc` → 「🧠 文法選擇」, `fill` → 「✏️ 文法填充」, `tiles` → 「🧱 砌句子」 (tiles = tokens of `a` + `extra`).
Reference screenshots: `reference/old-app/screenshots/03-quiz-meaning.webp`, `reference/old-app/screenshots/03b-quiz-listen.webp`, `reference/old-app/screenshots/03c-quiz-match.webp`, `reference/old-app/screenshots/03d-quiz-spell.webp`, `reference/old-app/screenshots/03e-quiz-arrange.webp`, `reference/old-app/screenshots/03f-quiz-fill.webp`, `reference/old-app/screenshots/03g-quiz-reverse.webp`.

### 8.4 Reviews (old `composeReview(words, n, matchGroups)` — match groups of 5 inserted at positions 2, 7, 12…, the rest single exercises with random non-repeating types from the 6 word types)
| Node | Words | Exercises | XP (first / replay) |
|---|---|---|---|
| Weekly review `tNNw` | the theme's 25 words | `composeReview(25 words, 17, 3)` → 3 matches (15 words) + 14 singles covering the other 10 + weakest | 20 / 5 |
| Grammar `gNN` | — | intro cards + 7 exercises | 15 / 5 |
| Monthly review `m1`–`m3` | 100 words of its 4 themes; sample 30, prefer lowest SRS box | `composeReview(30, 30, 3)` (per `monthly_reviews`) | 40 / 5 |
| Quarterly review day `q1d1`–`q1d5` | themes per `quarterly_review.review_days` | `composeReview(20 weakest-first, 15, 1)` | 20 / 5 |
| 季度大考 `q1x` | all 300; sample 40 weighted to low boxes | `composeReview(40, 40, 4)` | 60 / 10 |
| SRS 今日複習 (生字卡 › 生字庫 or Home chip) | due words (max 10; else weakest 8 → 「自由練習」) | `n = clamp(round(1.3 × words), 6, 12)`, 1 match if ≥ 6 words | 10 |
| 練習補心 | weakest 6 | 6, no heart loss, refills hearts to 5 | 5 |
All review types update SRS.

## 9. Pronunciation & tap-to-speak
### 9.1 TTS (same as old `TTS` object)
`speechSynthesis`; voice = user-chosen (`settings.voice`) else first **en-GB** voice (preferring names matching Google|Natural|Enhanced|Premium|Siri|Daniel|Samantha|Serena|Kate), else en-US, else any English. `rate` **0.9 normal, 0.55 slow**. `speechSynthesis.cancel()` before each utterance. If unsupported → toast 「你部機唔支援發音 😢」. Voices load async (`onvoiceschanged`).
### 9.2 🎤 跟讀 speak-check (same as old `listenWord`)
`SpeechRecognition || webkitSpeechRecognition`, `lang='en-GB'`, `maxAlternatives=5`; pass if any alternative (lower-cased) **includes** the word → 「✅ 讀得好！我聽到「…」」 + ok sound; else 「🤔 我聽到「…」，再試一次？」; errors: not-allowed → 「要允許使用咪高峰先得 🎤」, other → 「聽唔清楚，再試下 🙏」. **Hide the 🎤 button when unsupported** (e.g. Firefox; iOS Safari supports it since 14.5 with permission).
### 9.3 Tap / double-tap on words (approved decision D10)
Applies to: theme-card cells, the Home today tiles, word lists in 生字庫, map sheet word lists, match-quiz English tiles, word-card headword and 🔊 buttons.
- **1st tap → speak immediately at normal rate.** If a **2nd tap on the same element arrives within 300 ms**, cancel and speak **slowly** (0.55). (Speaking immediately avoids a laggy feel; the double-tap simply overrides.)
- Use `pointerup` handling + `touch-action: manipulation` to stop iOS double-tap zoom and the 300 ms click delay; don't also bind `dblclick`.
- Visual feedback: cell scales to 0.96 and gets an orange outline for ~250 ms; slow playback shows a tiny 🐢 badge.
- Respect the global sound setting only for sound **effects**; word audio always plays when tapped.
- The exported/shared PNG has no audio.

## 10. Spaced repetition (keep old Leitner system)
- Per word `srs[wordId] = {box 0–5, due 'YYYY-MM-DD', seen, right, wrong, learned 'YYYY-MM-DD'}`, created when the word's new lesson finishes.
- **Intervals by box: `[0, 1, 3, 7, 14, 30]` days.** Word fully right in a lesson → `box = min(5, box+1)`, `due = today + INTERVALS[box]`. Any wrong → `box = 1`, `due = today` (review again today), `wrong++`.
- Levels (labels/colours as old): box 0 未學 · 1 初見 · 2 學緊 · 3 熟悉 · 4 幾熟 · 5 **掌握** (used for 矮瓜's 100-word rule).
- `dueWords()` = learned words with `due ≤ today`, sorted by box then due. Badge on 生字卡 tab = count.
### 10.1 生字庫 word bank (old 複習 tab, `reference/old-app/screenshots/07-review.webp`)
Header with due count and 「開始複習 (N)」 button (or 「今日冇字要複習 🎉」 + 「自由練習」); 「❤️ 練習補心（而家 N / 5）」 when not full; filters 「全部 / 今日到期 / 未熟 / 已掌握」 + theme filter chips; each row = icon/placeholder · word · IPA · meaning · level pill; tap = speak, double-tap = slow (§9.3); tap the row's ⓘ → word card sheet (§7.2 layout, read-only).

## 11. Streak, XP, hearts, daily goal
### 11.1 Streak 🔥
Calendar days (local time, respecting dev `dayOffset`). Finishing **any** lesson (incl. review/practice) marks today active. If `lastActive` was yesterday → `streak+1`; today already → no change; otherwise → `streak = 1`, **except** with `SUNDAY_KEEPS_STREAK`: if every day between `lastActive` and today (exclusive) is a Sunday, the streak continues (`+1`). Displayed streak = 0 if the gap already breaks it. `bestStreak = max(bestStreak, streak)` (drives 斑斑 7 / 咖啡 30 / 雪糕 100).
### 11.2 XP ⭐
| Activity | First time | Replay |
|---|---|---|
| New-word lesson (5 words) | **15** (old 3-word lesson was 10) | 5 |
| Grammar lesson | 15 | 5 |
| Weekly review | 20 | 5 |
| Monthly review | 40 | 5 |
| Quarterly review day | 20 | 5 |
| 季度大考 | 60 | 10 |
| SRS 今日複習 / 自由練習 | 10 | — |
| 練習補心 | 5 | — |
| **Perfect bonus** (0 mistakes, not replay) | +5 | — |
Unlocks give **no extra XP**; celebration pills show the XP earned by the lesson that triggered them (this is why mockup 05 shows +40 = monthly review and 09 shows +20 = 15 + 5 perfect). `xpByDate` feeds the 7-day chart and daily goal (10/20/30/50, default 20; 「今日目標達成！🎯」 toast when crossed).
### 11.3 Hearts ❤️
Max **5**; −1 per wrong answer; +1 every **30 min** (`heartsAt` timestamp maths as old `refillHearts`); 練習補心 refills to 5 without costing hearts; `unlimited` (dev) shows ∞. Out-of-hearts sheet shows hearts row (❤️/🤍), countdown 「下一粒：mm:ss」, 「💪 練習補心（唔會扣心）」.

## 12. Cats: unlocks, companion, album, yarn bonus
### 12.1 Unlock rules (`data/cats.json` `unlock`) — evaluated after every lesson finish, on load and on dev actions
| # | Cat | Rule (type, value) | Condition in state |
|---|---|---|---|
| 1 | 番薯 fanshu | starter | always unlocked, default companion |
| 2 | 灰灰 huihui | lessons_completed 1 | first **new-word lesson** completed in the new app (`count(done[tNNdD]) ≥ 1`) |
| 3 | 芝麻 zima | theme_cards 1 | `Object.keys(themeCards).length ≥ 1` |
| 4 | 斑斑 banban | best_streak 7 | `bestStreak ≥ 7` |
| 5 | 花花 fafa | monthly_reviews 1 | any of `done.m1/m2/m3` |
| 6 | 咖啡 kafe | best_streak 30 | `bestStreak ≥ 30` |
| 7 | 湯圓 tongyun | season_complete 1 | `done.q1x` |
| 8 | 矮瓜 aigwa | mastered_words 100 | count of `srs[*].box === 5` ≥ 100 |
| 9 | 藍莓 lammui | season_complete 2 | not reachable in S1 |
| 10 | 棉花 minfa | perfect_lessons 30 | `perfectLessons ≥ 30` (any finished first-run lesson with 0 mistakes, excluding practice and replays; includes reviews/grammar) |
| 11 | 雪糕 suetgo | best_streak 100 | `bestStreak ≥ 100` |
| 12 | 大熊 daihung | season_complete 3 | not reachable in S1 |
| 13 | 豆腐 daufu | grammar_done 24 | count of `done.gNN` ≥ 24 (max 6 in S1) |
| 14 | 奶昔 naisik | xp 5000 | `xp ≥ 5000` |
| 15 | 豹豹 baubau | words_learned 1200 | `Object.keys(srs).length ≥ 1200` |
Newly unlocked cats → `cats[slug] = {unlocked: date, lessons: 0, bonus: null, seen: false}` and pushed to the celebration queue (in `no` order).

### 12.2 Companion 陪讀貓
- `companion` = slug (default `fanshu`). Change any time (sheet §7.8, album button, unlock screen 「設為陪讀貓」).
- On **first completion of a new-word lesson** (`tNNdD`, not replay), `cats[companion].lessons += 1`. Nothing else counts (reviews, grammar, practice, replays don't).
- The companion at the moment of finishing a theme's day 5 is stored as `themeCards[tid].cat` (theme-card header photo).
- The companion's face appears in: top-bar avatar, quiz prompt bubble, word-card peek, map current-node bubble, completion screen.

### 12.3 Album maths
- Regular photos: ① 坐定定 (default photo, on unlock) + ② 瞓覺 at 5, ③ 伸懶腰 at 10, ④ 開心 at 15 companion lessons. `regular = 1 + min(3, floor(lessons / 5))`; album counter = `regular / 4` (bonus not counted).
- 「下一張：再陪讀 N 堂」 → `N = 5 − (lessons % 5)` while `lessons < 15`. Paw segments = `lessons % 5` filled of 5 (mockup 07: 7 lessons → 2/5, 「再學 3 堂」).
- When `lessons` crosses 5/10/15 on a lesson finish → push `{type:'photo', cat, pose}` to the celebration queue (mockup 09).

### 12.4 🧶 Yarn bonus (hidden photo)
- A theme is **perfect** when the **first run** of each of its 5 new-word lessons **and** its weekly review `tNNw` had 0 mistakes (`done[id].perfect === true`). Replays can't earn or fix it. Grammar is not part of the theme.
- Evaluated when the last of those 6 nodes is completed (normally the weekly review). If perfect and not already awarded for this theme: award to the **current companion**; if that cat already has yarn, award to the lowest-`no` unlocked cat without yarn; if every unlocked cat already has yarn, give +20 XP and toast 「零錯誤主題！全部貓貓都有毛線相喇 🧶」 (decision P8: as specified).
- Store `cats[slug].bonus = {theme: tid, date}`; push `{type:'yarn', cat, theme}` celebration.
- Each theme can award at most one yarn photo (`perfectThemes[]` list).

### 12.5 Photos & crops
All cat photos are 16:9 (800×450). For round face crops use the `crop` hints (`fx` face-centre x, `ey` eye line y, `top` ear top y, `chin` y as fractions) the same way `mockups/src/photos.js` `faceImg()` does; album/celebration photos use pose `object_position`.

### 12.6 Celebration queue (persisted in state so a reload mid-way doesn't lose them)
After a lesson's completion screen 「繼續」, show in order: ① **theme card stamp** (if day 5 first completed: card flies in with 「🎉 解鎖主題生字卡！」 ribbon, buttons 「睇生字卡」 / 「繼續」) → ② **album new photo(s)** (mockup 09) → ③ **yarn bonus** → ④ **new cats** (mockup 05, in `no` order). Each item is removed from the queue when dismissed.

## 13. Data model & localStorage schema
Key **`lazycat-english-v1`** (JSON). Load → deep-merge over defaults (so new fields get defaults) → `refillHearts()` → unlock check. (No migration step — §14.) Save after every state change (try/catch; on failure toast 「儲存唔到進度（瀏覽器儲存空間滿？）」).
```jsonc
{
  "v": 1,
  "createdAt": "2026-10-01",
  "profile":  { "name": "Janson" },
  "settings": { "sound": true, "voice": null, "goal": 20, "showIPA": true, "askCompanionDaily": true, "svgIcons": false },   // svgIcons = SVG icon trial (§15.1), default off
  "dayOffset": 0,                       // dev time travel (days)
  "xp": 0, "xpByDate": { "2026-10-01": 20 },
  "streak": 0, "bestStreak": 0, "lastActive": null, "activeDates": [],
  "hearts": 5, "heartsAt": 1759300000000, "unlimited": false, "unlockAll": false,
  "startDate": null, "lessons": 0, "perfectLessons": 0,
  "done": { "t05d4": { "date": "2026-10-01", "n": 1, "mistakes": 0, "perfect": true } },  // perfect = first run only, never overwritten by replays
  "lastNewLessonDate": null, "newLessonsToday": 0,   // enforce NEW_LESSONS_PER_DAY (catch-up exempt when behind, §6.3)
  "inProgress": { "nodeId": "t05d5", "cardsSeen": 3, "date": "2026-10-02" },           // or null
  "srs": { "rice": { "box": 2, "due": "2026-10-04", "seen": 2, "right": 2, "wrong": 0, "learned": "2026-09-28" } },
  "themeCards": { "t05": { "date": "2026-10-02", "cat": "fanshu" } },
  "perfectThemes": ["t05"],
  "companion": "fanshu", "companionAskedDate": "2026-10-02",
  "cats": { "fanshu": { "unlocked": "2026-09-28", "lessons": 10, "bonus": null, "seen": true } },  // only unlocked cats have entries
  "celebrationQueue": [ { "type": "photo", "cat": "fanshu", "pose": "stretch" } ]      // types: themeCard | photo | yarn | cat
}
```
Derived values (don't store): words learned = `Object.keys(srs).length`; mastered = box 5 count; current node = first node in the flattened path not done; current week/theme; album counts; due count.
Dates are local `YYYY-MM-DD` of `today()` (which applies `dayOffset`), exactly like the old app.

## 14. Old 包仔 progress — NOT imported (decision P10: fresh start)
Janson chose a **fresh start**. The new app starts with default state under `lazycat-english-v1` and **does not import anything** from the old app.
1. **Do not read, modify or delete** the old key `baozai-english-v1` (leave it exactly as it is — rollback safety). Dev 🗑️ 重設所有進度 clears only `lazycat-english-v1`.
2. No welcome/「搬屋」 modal, no `migratedFrom` / `legacy` fields, no 測試搬屋 dev tool, no 包仔 strings anywhere (D2).
3. The 16 words shared with the old app (§5.1) are simply taught fresh in their theme lessons. `data/legacy-baozai-words.json` stays in the package for reference only.
4. Optional (unchanged): keep the old app at `old/index.html` for comparison; it keeps using its own `baozai-english-v1` key.

## 15. Icon placeholders (config flag) — until hand-drawn icons exist
Words with `icon: null` (275 of 300 at launch) render a placeholder chosen by **one config constant**:
```js
const ICON_PLACEHOLDER = "tile";   // "tile" = option B (recommended)  |  "emoji" = option A
```
(The dev panel can toggle it at runtime for review; persisted only as a dev override.)
- **Everywhere an icon appears** (word card tile, Home today tiles, theme card cells, export canvas, 生字庫 rows, map sheet), call one function `renderIcon(word, sizePx, ctx?)`. **Priority:** ① hand-drawn PNG → ② trial SVG (only if `settings.svgIcons` is on and `assets/icons-svg/<id>.svg` exists, §15.1) → ③ `ICON_PLACEHOLDER`:
  - `word.icon` set → `<img src=word.icon alt="" loading="lazy">` (canvas: `drawImage` after preload). **A hand-drawn PNG in `assets/icons/` always wins** over the SVG and the placeholder.
  - else SVG trial active and an SVG exists for the word → `<img src="assets/icons-svg/<id>.svg">` on the same pastel day-colour tile (canvas: load the SVG into an `Image` and `drawImage` after preload).
  - else `"tile"` (B) → rounded square (radius 28 %) filled with the word's **day-row light colour** (`#FFF3E0` `#FDEBF0` `#EEF7EC` `#EAF4FB` `#F2EEFB`, slightly darker variant `#FFE3BF` `#F9D3DF` `#D9EFD5` `#D3E9F6` `#E2DAF6` for the tile so it reads on the row), the **lowercase first letter** of the word centred in **Baloo 2 800** in that day's deep colour (`#E58A2E` `#E0718F` `#5DB585` `#5AA9D1` `#8E7CC9`), plus a small 🐾-shaped paw watermark (SVG, 12 % opacity) bottom-right. Identical drawing code on canvas.
  - else `"emoji"` (A) → `word.emoji` centred on the same tile (font-size ≈ 60 % of tile). On canvas use `fillText` with the emoji font stack (`"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji"`); rendering depends on the device's emoji font.
- **Adding real icons later needs no code change:** drop `assets/icons/<word-id>.png` (transparent PNG, ≤ 256 px square, same watercolour style) and run `python3 tools/sync_icons.py` to fill the `icon` paths in `data/season1-words.json`, then rebuild `js/data.js`.
- Theme icons on Home/map for themes other than food: show the theme emoji on a light tile (same rule) until theme icons are drawn.
Decision: §18 P1 (tile by default + SVG trial for theme 1).

### 15.1 SVG vector-icon trial (theme 1 only — decision P1)
Janson wants to compare simple vector icons against the letter tile before committing to a style.
- **Draw** one SVG per word of **theme 1 (`t01` 自我介紹同家人 Me & Family, 25 words: hello, name, meet, friend, live, family, father, mother, brother, sister, grandfather, grandmother, uncle, aunt, cousin, son, daughter, baby, child, parent, introduce, surname, nickname, age, together)** and save as **`assets/icons-svg/<word-id>.svg`**. Use each word's `icon_idea` as the brief (abstract words → simple scene icons, D5).
- **Style:** soft, rounded, friendly — chunky rounded shapes, round line caps/joins, stroke in cocoa `#5B4636` (≈ 3–4 px at 128 px), flat fills from the app palette (§4: orange `#F59A3E`/`#FFE7CF`, sun `#FFD66B`, pink `#F7B5C4`, lavender `#B7A6E6`, sky `#8FCBEA`, mint `#8FD6AE`, cream `#FFF8EE`); people/family members may be drawn as cute cats/kittens to match the lazy-cat theme. No text/letters, no gradients-heavy detail, no external references or fonts, transparent background, `viewBox="0 0 128 128"`, each file small (target < 4 KB). They must read clearly at 40 px (theme-card cell) and look good at ~120 px (word card).
- **Setting / flag:** `SVG_ICON_TRIAL = true` (config) enables the feature; the user setting `settings.svgIcons` (我 › 設定 › 生字圖示: 「字母方塊（預設）」／「向量圖（試用）」) switches it. **Default = off → the tile stays the default.** When on, SVGs replace the tile only for words that have an SVG; everything else (incl. the saved/shared image) follows the same priority rule.
- **Discovery without code changes:** generate the list of available SVG ids at build time (e.g. into `js/data.js`) by scanning `assets/icons-svg/`, so more SVGs can be added later by dropping files + rebuilding.
- **Comparison:** dev panel 「圖示比較」 shows all 25 theme-1 words in a grid: tile │ SVG │ emoji, so Janson can judge side by side.
- Mention the SVG trial (and how to switch it on) in the PR description.

## 16. Repo, branch & deploy
- **Repo:** `jansonlau0126/lazycat-english` (public; **renamed from `baozai-english` on 2026-09-28**, decision P2). GitHub Pages serves **`main` / root** at **`https://jansonlau0126.github.io/lazycat-english/`**; `main` currently holds only the old app (`index.html` + `.nojekyll`). GitHub does not redirect the old Pages URL `/baozai-english/`. Use relative URLs so the repo name never matters.
- **Branch:** **`season1-rebuild`** already exists (created from `main`) and already contains this package at `handoff-s1/`. Build the new app at the repo root (`index.html`, `css/`, `js/`, `assets/`, `.nojekyll`) on that branch (or a branch based on it); keep `handoff-s1/` as reference. Optionally keep the old app as `old/index.html` for comparison (it will still read its own `baozai-english-v1` key).
- **Preview before merge:** open `index.html` locally (works from `file://` if data is inlined) and/or `python3 -m http.server`; test at 390×844 in device emulation + a real iPhone.
- **Publish:** open a PR `season1-rebuild → main` (**do not merge it yourself**); Janson reviews using `ACCEPTANCE-CHECKLIST.md`; **merge = publish** (Pages rebuilds in ~1 min). Rollback = revert the merge commit. Never push to `main` directly.
- Note: the repo is public, so the `handoff-s1/` folder (spec, mockups, photos) will be publicly readable/served at `/lazycat-english/handoff-s1/…` once merged. Decision P3: accepted (harmless content) — keep `handoff-s1/` in the repo.
- The rename is done. localStorage is per origin (`jansonlau0126.github.io`), not per path, so the old app's `baozai-english-v1` key still exists in Janson's browser — leave it untouched (§14).
- `<head>`: `<title>懶貓英文・每日五個字</title>`, `lang="zh-HK"`, viewport with `viewport-fit=cover`, `theme-color #FFF8EE`, apple-touch-icon + favicon (generate from 番薯's face crop at build time; no new art needed), `manifest.webmanifest` optional (nice-to-have: installable PWA; if added, `start_url`/`scope` must be relative, e.g. `./`).

## 17. Out of scope for Season 1 build
Seasons 2–4 content (map teasers only); odd-week mini stories; accounts/cloud sync; push notifications; leaderboards; new cat photos; drawing the 275 missing icons (tracked separately in `ASSETS.md`); 遮中文 self-test mode on the theme card (nice-to-have); progress export/import (nice-to-have).

## 18. Decisions (Janson, 2026-09-28) — final; these override any alternative mentioned earlier
| # | Topic | Decision | What to build |
|---|---|---|---|
| **P1** | Icons for the 275 words without hand-drawn icons | **Tile + SVG trial.** Build with `ICON_PLACEHOLDER = "tile"` (pastel day-colour tile + lowercase first letter + faint paw). **Additionally**, as a trial, draw simple SVG vector icons for **theme 1 (t01, 25 words)** in a soft, rounded style matching the palette, stored separately in `assets/icons-svg/<word-id>.svg`, shown only when the setting `settings.svgIcons` is on. **The tile stays the default.** Hand-drawn PNGs in `assets/icons/` always take priority. | §6.3, §15, §15.1, §7.11, §7.12 |
| P2 | Rename the repo? | **Renamed** `baozai-english` → **`lazycat-english`** (done 2026-09-28). Site: `https://jansonlau0126.github.io/lazycat-english/`. Use relative URLs anyway. | §1, §3, §16 |
| P3 | Public repo exposes the handoff package & photos | Recommendation adopted: acceptable (harmless content); keep `handoff-s1/` in the repo. | §16 |
| P4 | IPA style | Recommendation adopted: **British only** (matches en-GB TTS). | §5.1, §9.1 |
| P5 | Sunday 懶貓日 | **Yes** — Sunday is a rest day with streak protection (`SUNDAY_REST = true`, `SUNDAY_KEEPS_STREAK = true`). | §6.3, §11.1 |
| P6 | Catching up & calendar alignment | **Unlimited catch-up.** When behind the Mon-start schedule, the learner may do as many extra new-word lessons per day as he likes (no > 3-behind threshold, no per-day cap). When on/ahead of schedule: 1 new lesson per day. Week strip keeps **course-day** labels (recommendation). | §6.3, §7.1 |
| P7 | Odd-week mini stories | Recommendation adopted: **defer**; weekly review covers the Saturday slot. | §6.1, §17 |
| P8 | Yarn bonus details | Recommendation adopted: **as specified** (same yarn pose for all cats; companion → next cat without yarn → else +20 XP). | §12.4 |
| P9 | Abstract-word icon style | Recommendation adopted: **drawn scene icons** (applies to the theme-1 SVG trial too; use `icon_idea`). | §5.1, D5 |
| P10 | Old 包仔 progress | **Do NOT import — fresh start.** Do not read, change or delete `baozai-english-v1`. No welcome/migration modal. | §13, §14 |
| P11 | XP for quarterly review | Recommendation adopted: **20 XP per review day, 60 XP for the 季度大考** (replay 5 / 10). | §8.4, §11.2 |
| P12 | Home hero photo | **Always 番薯 napping** (`assets/cats/hero-fanshu-napping.webp`), regardless of companion. | §7.1 |
| P13 | Food icons "fruit" = grapes, "salty" = salt shaker | Recommendation adopted: **keep** (approved card). | §5.1, `ASSETS.md` |
