# 懶貓英文・每日五個字 — Season 1 developer handoff package

**Goal:** rebuild the live app at `https://jansonlau0126.github.io/lazycat-english/` (old 包仔英文・每日三個字; the repo was renamed from `baozai-english` to `lazycat-english` on 2026-09-28, so the old `/baozai-english/` URL no longer serves) into **懶貓英文・每日五個字 Season 1**: 12 weekly themes, 300 words, 5 words a day, grammar every 2 weeks, weekly/monthly/quarterly reviews, 15 unlockable realistic cats with photo albums, collectible 5×5 theme vocab cards, and a year map. Learner: Janson (Hong Kong, junior-secondary English). UI language: Cantonese (Traditional Chinese).
Everything you need is in this folder; all paths below are relative to it. Status: **design approved by Janson; all product decisions are final** (BUILD-SPEC §18 Decisions table, summarised below).

## Read in this order
1. **`BUILD-SPEC-S1.md`**: the full build spec. It covers every screen with its mockup, the lesson engine and 7 quiz types, SRS, streak/XP/hearts, cat unlock rules and album maths, the localStorage schema, old progress (not imported), the icon placeholder flag + SVG icon trial, repo/deploy, and Janson's decisions (§18).
2. **`mockups/`**: approved screen designs, 390 px wide @2x: `mockups/01-home.png` … `mockups/09-new-photo-unlocked.png`, plus `mockups/vocab-card-food-export.png` (the saved/shared card image). `mockups/src/` has their HTML/CSS/JS; reuse the CSS. It renders from inside the package.
3. **`data/`**: content to load, don't retype it:
   - `data/season1-words.json`: 300 words.
   - `data/season1-themes.json`: themes, days, map path, reviews, Seasons 2–4 teasers.
   - `data/season1-grammar.json`: 6 grammar lessons.
   - `data/cats.json`: 15 cats, photos, crops, unlock rules, poses.
   - `data/legacy-baozai-words.json`: old word ids — reference only (old progress is **not** imported).
4. **`ACCEPTANCE-CHECKLIST.md`**: 99 numbered checks Janson will review against. Run through it yourself before opening the PR.
5. **`ASSETS.md`**: what images and fonts exist, and the 275 word icons still to be drawn (with briefs).
6. `reference/old-app/`: the old app's source and screenshots. Screens without a new mockup (quizzes, feedback, completion, grammar intro, word bank, profile, dev panel, out-of-hearts) keep the old behaviour, restyled. `reference/DESIGN-CONCEPT-v2.md` is the approved full-year concept (background).

## Folder map
```
handoff-s1/
├── README.md                  ← this file
├── BUILD-SPEC-S1.md           ← the spec
├── ACCEPTANCE-CHECKLIST.md    ← review criteria
├── ASSETS.md                  ← asset inventory + missing icons
├── data/                      ← JSON content (source of truth for content)
├── assets/
│   ├── cats/                  ← 15 default cat photos + hero (WebP 800×450)
│   ├── poses/                 ← 60 album photos <slug>-{sleep,stretch,happy,yarn}.webp
│   ├── icons/                 ← hand-drawn word icons <word-id>.png (25 food; more later)
│   ├── icons-svg/             ← (to create) trial SVG vector icons <word-id>.svg for theme 1 (spec §15.1)
│   └── fonts/                 ← Huninn, Baloo 2, Nunito, Noto Sans (OFL) + LICENSES.md
├── mockups/                   ← approved PNG mockups
│   └── src/                   ← mockup HTML/CSS/JS (common.css = palette & fonts)
├── reference/
│   ├── DESIGN-CONCEPT-v2.md
│   └── old-app/               ← old 包仔 app source + screenshots/
└── tools/
    ├── validate_data.py       ← run: python3 tools/validate_data.py
    ├── sync_icons.py          ← sets icon paths from files in assets/icons/
    ├── build_assets.py        ← (design machine only) regenerates assets/mockups
    └── extract_icons.py       ← (design machine only) cuts icon sheets
```

## Build & deploy expectations
- **Static site, GitHub Pages, no backend, no external requests.** Use relative URLs because the site lives under the `/lazycat-english/` sub-path (never hard-code the repo name). Progress is stored only in `localStorage["lazycat-english-v1"]`.
- **Repo:** `jansonlau0126/lazycat-english` (renamed from `baozai-english`; already done). Work on the existing branch **`season1-rebuild`** (created from `main`; it already holds this package at `handoff-s1/`), or a branch based on it. Put the app at the repo root (`index.html`, `css/`, `js/`, `assets/` copied from this package, `.nojekyll`) and keep this package at `handoff-s1/`. Open a PR to `main` and **do not merge it** — Janson merges; **merging publishes**, because Pages serves `main` / root. Don't push to `main` directly.
- **Stack:** vanilla HTML/CSS/JS is recommended (the old app was one file with no dependencies). A small build step that inlines `data/*.json` into `js/data.js` is fine; commit the built output.
- **Mobile-first:** 390 × 844 is the reference, 360–430 px must work, and desktop gets a centred column of 480 px max. No console errors. First load should be ≤ 2 MB: subset the Huninn font (rename it, per `assets/fonts/LICENSES.md`) and lazy-load poses.
- **Icons:** 275 words have `icon: null`. Render the placeholder set by `ICON_PLACEHOLDER = "tile"` (decision P1; `"emoji"` stays a dev option; spec §15). **Also draw a trial set of simple, soft, rounded SVG vector icons for theme 1 (25 words) in `assets/icons-svg/<word-id>.svg`**, shown only when the user setting 生字圖示 → 向量圖（試用） is on (default off; tile stays the default) — spec §15.1. Priority: hand-drawn PNG → SVG (if enabled) → tile. New PNGs dropped into `assets/icons/` must work with no code change.
- **Old progress:** **not imported — fresh start** (decision P10, spec §14). Don't read, modify or delete the old `baozai-english-v1` key; no migration/welcome modal.
- Before the PR, run `python3 handoff-s1/tools/validate_data.py` and go through `ACCEPTANCE-CHECKLIST.md` at 390 px. In the PR description, note any spec conflicts or checklist items you couldn't meet.

## Janson's decisions (2026-09-28) — full table in BUILD-SPEC §18
- **P1 icons:** tile placeholder by default; plus an SVG vector-icon **trial for theme 1** behind a setting (§15.1). Hand-drawn PNGs win.
- **P2 repo:** renamed to `lazycat-english`; site `https://jansonlau0126.github.io/lazycat-english/`.
- **P5 Sunday 懶貓日:** yes — rest day with streak protection.
- **P6 catching up:** unlimited — when behind schedule, as many extra new-word lessons per day as he likes (no threshold, no cap); otherwise 1/day (§6.3).
- **P10 old 包仔 progress:** not imported; fresh start; leave the old key alone.
- **P12 home hero:** always 番薯 napping.
- **P3, P4, P7, P8, P9, P11, P13:** the design assistant's recommendations, as written in §18.

## Assumptions the design assistant made (flag in the PR if you disagree)
- The 生字庫 (word bank) and 文法 (grammar list) screens live as segments inside the **生字卡** tab. There is no mockup for them.
- Unlock/photo celebration pills show the XP of the lesson that triggered them; unlocks themselves give no XP.
- 灰灰 counts new-app lessons only. A "perfect lesson" (for 棉花) is any first-run, non-practice lesson with 0 mistakes.
- A theme card's header photo is the companion at completion. 番薯 uses the napping hero crop; other cats use their default photo.
- Map and home behaviour beyond what the mockups show is specified in BUILD-SPEC §6–§7.
