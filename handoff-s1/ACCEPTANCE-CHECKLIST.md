# ACCEPTANCE-CHECKLIST.md — Season 1 review (懶貓英文・每日五個字)

How to use: test on the **`season1-rebuild` preview** (local `python3 -m http.server` or `file://`) and again on the **live URL after merge**. Primary device: iPhone Safari (or Chrome DevTools device mode **390 × 844**). Use the dev panel (`?dev=1` or tap the top-left avatar 5×) for time travel and shortcuts. Mark each item ✅ / ❌ + note. Spec section in [brackets].

## A. Build, deploy & basics
1. The app is built on branch `season1-rebuild` (or a branch based on it) of `jansonlau0126/lazycat-english` (renamed from `baozai-english`); nothing was force-pushed to `main`; the PR diff is reviewable. [§16]
2. After merging, `https://jansonlau0126.github.io/lazycat-english/` shows 懶貓英文 (not 包仔) within a few minutes; hard reload shows no stale old app (cache-busted CSS/JS). [§16]
3. All asset URLs are relative — no 404s in DevTools Network on the live sub-path `/lazycat-english/`; the repo name is not hard-coded anywhere. [§3]
4. No requests to external domains (fonts, CDNs, analytics) — Network tab shows only `jansonlau0126.github.io`. [§3]
5. **Zero console errors** (warnings allowed) on first load, on reload, and while completing: a new-word lesson, a weekly review, a grammar lesson, a monthly review, the theme-card save/share, opening every tab. [§3]
6. The page title is 「懶貓英文・每日五個字」; favicon/apple-touch icon shows 番薯; `lang="zh-HK"`. [§16]
7. The page works when opened offline from `index.html` (data inlined) or at least from a local server with no internet. [§3]
8. First-load transfer size ≤ 2 MB (DevTools, cache disabled); pose photos are not loaded until an album/celebration needs them. [§3]
9. No 包仔 image or text anywhere (there is no migration message — old progress is not imported). [D2, §14]
10. Font licence files are shipped; if Huninn is subset, its family name is not "huninn". [`assets/fonts/LICENSES.md`]

## B. Mobile layout
11. At **390 × 844** every screen fits the width with no horizontal scroll; the bottom tab bar and bottom buttons respect the iPhone safe area. [§3]
12. At 360 px and 430 px widths nothing overlaps or is cut off (long words like "comfortable", "grandmother", "vegetable" shrink to fit theme-card cells). [§3, §7.4]
13. On desktop (≥ 1024 px) the app is a centred column ≤ 480 px wide on the cream background. [§3]
14. Tap targets are ≥ 44 px; double-tapping a word does **not** zoom the page on iOS. [§9.3]
15. Colours and fonts match `mockups/src/common.css` (cream `#FFF8EE` background, orange `#F59A3E` primary, cocoa `#5B4636` text; Huninn for Chinese, Baloo 2 for headwords, Noto Sans for IPA). [§4]

## C. Screens vs mockups (compare side by side at 390 px)
16. **Home** matches `mockups/01-home.png`: top bar (companion avatar, 懶貓英文, 🔥/⭐/❤️ pills), napping-番薯 hero (always 番薯, even when another cat is companion — P12) with the Janson speech bubble, current theme card with week 「第 N / 52 週」 and progress 「x / 25」, today card with 5 word tiles (✓ seen, orange current, faded next) + 「已學 x / 5」, main button, week strip 一–日 with 六 「文法+複習」 and 日 「懶貓日」, tab bar with 首頁 active. [§7.1]
17. Home main-button copy changes correctly through: 「開始學 🐾 今日 5 個字」 → 「繼續學 🐾 仲有 N 個字」 → 「繼續學 🐾 做埋小測驗」 → 「今日完成 ✓ 聽日見 🌙」; Saturday/weekly-review state; monthly-review state; Sunday 懶貓日 state; out-of-hearts state. [§7.1]
18. The 🧠 due chip appears on Home only when words are due, and its count equals the 生字卡 tab badge. [§7.1, §10]
19. **Word card** matches `mockups/02-word.png`: chip 「<emoji> <theme>・今日第 n / 5 個字」 + 新字 pill, companion peek, icon tile, headword, IPA, pos pill with Chinese (e.g. 「adj. 形容詞」), 🔊 聽發音 / 🐢 慢速 / 🎤 跟讀, 中文意思, 廣東話解釋, 💬 例句 with the headword highlighted, 💡 懶貓貼士; footer 「明白喇，下一個 →」 and on card 5 「明白喇！開始小測驗 💪」. For `spicy` it shows 「辣；辛辣」 and the 茶餐廳實用 tip lines as in the mockup. [§7.2]
20. **Theme card** matches `mockups/03-theme-card.png`: page header with 「已收集 N / 48 張 ・ 左右掃睇其他主題」 and page dots, card header (cat photo, 「第 1 季 ・ 第 5 週 ・ 主題生字卡」, 食物 Food, 25 個字), 5 pastel rows in the correct day order, footer 「🐾 Janson 已完成 ・ YYYY 年 M 月 D 日」, controls 音標 toggle / 💾 存做圖片 / 📤 分享, lavender info strip with the next theme. [§7.4]
21. **Saved image** of the food card looks like `mockups/vocab-card-food-export.png`: 1080 × 1620 PNG, sharp text, correct fonts (not fallback), icons present, file name `lazycat-s1-w05-food.png`. [§7.4]
22. **Cat collection** matches `mockups/04-cat-collection.png`: 「貓貓圖鑑 🐾」, 「N / 15 隻貓貓」 + bar, companion line, 3-column grid, ⭐ on companion, NEW badge, locked cards grey-blurred with 🔒 + condition + progress text. [§7.5]
23. **Unlock-cat screen** matches `mockups/05-unlock-cat.png`: coral ribbon 「🎉 解鎖新貓貓！」, sunburst + confetti, round photo, name, breed pill, quote bubble, reason pill, XP pill, 「🐾 圖鑑 N / 15」, buttons 設為陪讀貓 🐾 / 收埋入圖鑑先. [§7.6]
24. **Year map** matches `mockups/06-year-map.png`: header 「第 N / 52 週」, 「已學 x / 1,200 字」, 「主題 x / 48 ・ 文法 x / 24」; Season 1 snake path of 16 nodes in the order of `path_order` (row 2 and row 4 run right-to-left); done/current/locked styles; 季度大複習 node with 「解鎖湯圓 🐱」. [§7.10]
25. Seasons 2–4 appear as locked cards (☀️ 出去曬太陽 / 🍂 返學返工 / ❄️ 窩喺被竇, weeks, 12 emojis, blurred cat with 「解鎖 藍莓 / 大熊 / 豹豹」) each with a 「即將推出」 pill; tapping shows a coming-soon toast and nothing breaks. [§7.10]
26. **Album** matches `mockups/07-cat-album.png`: header 「<name>嘅畫冊」 + 📷 k / 4, profile card with 「一齊學咗 N 堂 ・ <label>」, 2×2 photos with tags 解鎖圖鑑時 / 陪讀 5 / 10 / 15 堂, locked hints and 「再陪讀 N 堂」, BONUS 玩毛線 row, next-photo card with 5 paw segments, button 「揀佢做今日陪讀貓 🐾」. [§7.7]
27. **Choose companion** matches `mockups/08-choose-companion.png`: bottom sheet, 「🐾 揀今日陪讀貓」, list of unlocked cats with 5 mini slots, 「k / 4 張相」, 「下一張：再陪讀 N 堂」, 而家陪緊你 / NEW pills, radio selection, locked-count line, 「就揀<name>喇 🐾」 button, 「隨時可以換 ・ 每堂計落當時嘅陪讀貓度」. [§7.8]
28. **New-photo screen** matches `mockups/09-new-photo-unlocked.png`: ribbon 「📷 畫冊新相！」, tilted polaroid with tape, 「③ 伸懶腰 3 / 4」, title 「番薯伸咗個大懶腰！」, 「多謝你陪番薯學咗 10 堂」, quote, 5 thumbnails with NEW, pills 陪讀 / XP / 畫冊, buttons 睇番薯嘅畫冊 🐾 / 繼續. [§7.9]
29. Quiz, feedback, completion, grammar intro, 生字庫, profile, dev panel and out-of-hearts screens exist and work like the old app (`reference/old-app/screenshots/`) but in the new style, with the companion photo instead of 包仔. [§7.3, §7.11, §7.12, §10.1]

## D. Content (300 words)
30. `python3 handoff-s1/tools/validate_data.py` prints OK (300 unique words, 12 × 25, 5 × 5, icons exist, referenced files exist). [§5]
31. The app's data (`js/data.js` or equivalent) is generated from `data/*.json` — spot-check 10 random words in the app match the JSON exactly (word, IPA, meaning, example). [§5]
32. Theme order and names in the app equal `data/season1-themes.json` (t01 自我介紹同家人 … t12 情緒), weeks 1–12, then week 13 季度複習週. [§6]
33. Each new-word lesson teaches exactly the 5 words of that `day`, in `order`; the theme card rows show the same grouping. [§6.1]
34. Food theme card shows exactly: rice, noodles, bread, egg, chicken / beef, pork, fish, shrimp, vegetable / tomato, carrot, fruit, apple, banana / orange, soup, sandwich, dumpling, cake / cheese, sweet, salty, spicy, delicious, with meanings as on `mockups/vocab-card-food-export.png`. [§5.1]
35. The 25 food words show their watercolour icons; `fruit` shows grapes and `salty` the salt shaker. [ASSETS.md]
36. Grammar lessons ①–⑥ (g01 be 動詞 w2, g02 一般現在式 w4, g03 名詞眾數 + a/an w6, g04 可數／不可數 + some/any w8, g05 現在進行式 w10, g06 代名詞同物主 w12) appear after the matching theme's day 5, show intro cards with 🔊 examples and 7 exercises each. [§6, §5.3]

## E. Icons & placeholders
37. With `ICON_PLACEHOLDER = "tile"`, every word without an icon shows a pastel tile in its day colour with the lowercase first letter (Baloo 2) and faint paw, consistently on: word card, Home tiles, theme card, saved image, 生字庫. No broken-image icons anywhere. [§15]
38. With `ICON_PLACEHOLDER = "emoji"` (dev toggle or constant), the same places show the word's `emoji` on the tile, including in the saved image. [§15]
39. Adding a new file named hello.png to the assets/icons folder, running `tools/sync_icons.py` and rebuilding makes `hello` show its icon with **no code change**. [§15]

## F. Audio
40. 🔊 speaks the word with an en-GB voice when available (normal rate 0.9); 🐢 speaks slowly (0.55); the chosen voice in 我 › settings is used. [§9.1]
41. The word auto-plays once when each word card appears (sound setting on). [§7.2]
42. 🎤 跟讀: saying the word correctly shows 「✅ 讀得好！…」; a wrong word shows 「🤔 我聽到…，再試一次？」; denied mic shows 「要允許使用咪高峰先得 🎤」; the 🎤 button is hidden on browsers without speech recognition. [§9.2]
43. **Tap** a word cell on the theme card → it is spoken at normal speed immediately. [§9.3]
44. **Double-tap** (2 taps < 300 ms) → it is spoken slowly (normal playback is cancelled, not overlapped). [§9.3]
45. Tap/double-tap also work on Home word tiles, 生字庫 rows and map-sheet word lists; the example-sentence 🔊 reads the sentence. [§9.3]

## G. Lesson flow & 7 quiz types
46. A new-word lesson = 5 cards then 10 exercises in the order meaning, listen, reverse, meaning, listen, match(5), spell, fill, arrange, fill. [§8.2]
47. Quitting after card 3 and reopening resumes at card 4 (Home shows 「已學 3 / 5」); quitting during the quiz restarts the quiz only. [§8.2]
48. All 7 types work and show their chips: 🎧 聽音揀字, 💬 揀中文意思, 🔤 揀英文生字, ✏️ 句子填充, 🧩 串字, 🧱 砌句子, 🔗 配對. [§8.3]
49. Fill-in blanks the headword for all 300 examples (check a capitalised case, e.g. `Monday`, and multi-word/hyphen items if any). [§8.3]
50. A wrong answer: red bar with the correct answer, −1 heart, the question returns later in the same lesson (max 6 re-queues). [§8.1]
51. The completion screen shows the right title, XP, accuracy % and time, then the celebration queue. [§7.3]
52. When **on or ahead of schedule**, after finishing today's first new lesson a second new lesson is not offered today (「今日完成 ✓ 聽日見 🌙」); dev ⏭️ 跳去聽日 makes the next one available. Replays remain available. [§6.3]
53. On a real Sunday (dev time travel), Home shows 懶貓日 and no new lesson; reviews still work. [§6.3]

## H. Reviews & SRS
54. Weekly review unlocks after the theme's day 5, covers all 25 words with 3 match groups, gives 20 XP. [§8.4]
55. Monthly review m1 appears after week 4 (m2 after 8, m3 after 12), draws from the 100 words of its 4 themes, gives 40 XP, and **blocks** the next theme until done. [§6.2, §8.4]
56. Week 13: 5 quarterly review days (themes 1–3, 4–6, 7–8, 9–10, 11–12) and the 季度大考 (40 questions, all 300 words); finishing the exam marks Season 1 complete. [§6.1]
57. SRS: a word answered fully right moves up one box with due = today + [0,1,3,7,14,30][box]; any mistake sends it to box 1, due today (inspect state in dev panel). [§10]
58. 生字庫 shows learned words with level pills 初見/學緊/熟悉/幾熟/掌握 and filters 全部 / 今日到期 / 未熟 / 已掌握 + theme filter; 「開始複習 (N)」 runs a review of due words (10 XP). [§10.1]
59. 練習補心 refills hearts to 5 and never removes hearts. [§11.3]

## I. Streak, XP, hearts, goal
60. Completing any lesson today increments the streak once per day; skipping a weekday resets it to 1 on the next lesson; skipping only a Sunday keeps it (dev time travel). [§11.1]
61. bestStreak never decreases. [§11.1]
62. XP amounts: new lesson 15 (+5 if 0 mistakes), grammar 15, weekly 20, monthly 40, quarterly day 20, exam 60, SRS review 10, practice 5, any replay 5 (exam replay 10), no perfect bonus on replays. [§11.2]
63. Daily goal (10/20/30/50) ring and 7-day chart in 我 reflect `xpByDate`. [§11.2]
64. Hearts: 5 max, −1 per wrong answer, +1 per 30 minutes (countdown correct), can't start a non-practice lesson at 0, ∞ with dev unlimited. [§11.3]

## J. Cat unlocks (maths)
65. New install: only 番薯 unlocked, companion = 番薯, 圖鑑 shows 1 / 15. [§12.1]
66. Finish the first new-word lesson → 灰灰 unlock screen (reason 完成第一課). [§12.1]
67. Finish t01 day 5 → theme card stamp, then 芝麻 unlock (收集第一張生字卡). [§12.1, §12.6]
68. bestStreak reaches 7 → 斑斑; 30 → 咖啡; 100 → 雪糕 (use dev set-streak / time travel). [§12.1]
69. Finish m1 → 花花 unlock with 「⭐ +40 XP」 pill. [§12.1, §7.6]
70. Finish q1x → 湯圓 unlock. [§12.1]
71. 100 words at box 5 → 矮瓜; 30 perfect lessons → 棉花; 5,000 XP → 奶昔. Locked-card progress texts update (e.g. 「22 / 100」, 「8 / 30」, 「第 5 / 13 週」, 「12 / 30 日」 for the next streak cat). [§12.1, §7.5]
72. 藍莓, 大熊, 豆腐, 豹豹 cannot unlock in Season 1 and show 「未解鎖」. [§12.1]
73. Several unlocks at once are shown one after another in the order theme card → photos → yarn → cats (by number), and survive a reload in the middle. [§12.6]

## K. Companion & album
74. Changing the companion updates the top-bar avatar, quiz bubble face, word-card peek and map avatar immediately. [§12.2]
75. Only the **first completion of a new-word lesson** adds +1 陪讀 to the current companion (check: a weekly review, grammar, practice or replay adds nothing). [§12.2]
76. With a cat at 4 lessons, finishing one more new lesson with it as companion shows the 瞓覺 photo celebration (「② 瞓覺 2 / 4」); at 10 → 伸懶腰 (3 / 4); at 15 → 開心 (4 / 4). Use dev 「陪讀貓 +5 堂」 to speed up. [§12.3]
77. Album and companion sheet show 「再陪讀 N 堂」 with N = 5 − (lessons mod 5) and paw segments = lessons mod 5 (e.g. 7 lessons → 2/5 filled, 再學 3 堂). [§12.3]
78. Photos earned by one cat are kept when switching companion (「換咗都唔會蝕咗進度」). [§12.2]
79. The choose-companion sheet opens automatically before the day's first new lesson when ≥ 2 cats are unlocked (once per day), and never when the setting is off. [§7.8]
80. Tapping an unlocked album photo opens a lightbox; locked photos are unrecognisable. [§7.7]

## L. Zero-mistake yarn bonus
81. Complete all 5 lessons and the weekly review of a theme with **0 mistakes on the first run** → 🧶 玩毛線 bonus celebration for the current companion; album bonus row shows the photo and the theme. [§12.4]
82. One mistake in any of those 6 first runs → no bonus for that theme, even if replays are perfect. [§12.4]
83. A theme can award the bonus only once; if the companion already has yarn it goes to the next unlocked cat without it; if all have it, +20 XP + toast. [§12.4]
84. The yarn photo does not count in the 「k / 4」 album counter. [§12.3]

## M. Theme vocab cards
85. The card unlocks exactly when day 5 of the theme is first completed; the footer date is that day; the header cat is the companion at that moment (番薯 → napping hero crop). [§7.4, §12.2]
86. During a theme the card is half-filled (unlearned cells grey) and save/share are disabled. [§7.4]
87. Swipe left/right (touch and mouse/arrow keys) moves between collected cards; 「已收集 N / 48 張」 is correct. [§7.4]
88. 音標 toggle hides/shows IPA on the card (and in the saved image) and is remembered after reload. [§7.4]
89. 📤 分享 opens the iOS/Android share sheet with the PNG and text 「我喺懶貓英文學完「<zh> <en>」25 個字 🐾」; on desktop it falls back to download. [§7.4]

## N. Persistence & old data
90. Reloading at any point keeps: XP, streak, hearts (with refill), done nodes, SRS, cards-seen progress, theme cards, cats, companion, album progress, settings, pending celebrations. [§13]
91. State lives under `localStorage["lazycat-english-v1"]` in the schema of §13. [§13]
92. With an old `baozai-english-v1` key present (e.g. set one manually in DevTools): the app **starts fresh** — no welcome/migration modal, XP 0, streak 0, no SRS words, course at t01 day 1 — and `baozai-english-v1` is **unchanged** (same value before and after). [§14, P10]
93. Corrupt or absent old data makes no difference: fresh start, no console error (the app never reads the old key). [§14]
94. Dev 🗑️ 重設所有進度 clears only `lazycat-english-v1`. [§7.12]

## O. Janson's decisions (2026-09-28) [§18]
95. **Catch-up (P6):** with dev time travel put the learner ≥ 2 lessons behind the Mon-start schedule; after today's lesson Home offers 「追進度 🐾 再學 5 個字」 and he can complete several more new-word lessons the same day with no cap; once caught up, the 1-per-day rule applies again. Sunday still shows 懶貓日 with no new lesson. [§6.3, §7.1]
96. **SVG icon trial (P1):** `assets/icons-svg/` contains 25 SVGs, one per theme-1 (t01) word, in a soft rounded style using the app palette; each is small, has no external references, and reads clearly at 40 px. [§15.1]
97. By default (setting off) every icon-less word shows the **tile**; switching 我 › 設定 › 生字圖示 to 「向量圖（試用）」 shows the SVGs for theme-1 words on the word card, Home tiles, theme card, saved image and 生字庫, and the setting survives reload. Words without an SVG keep the tile. [§15.1]
98. A hand-drawn PNG in `assets/icons/` takes priority over the SVG (e.g. adding a hello.png to the assets/icons folder + sync + rebuild shows the PNG even with SVGs on). The dev panel 「圖示比較」 shows tile │ SVG │ emoji for all 25 theme-1 words. [§15, §15.1]
99. `python3 handoff-s1/tools/validate_data.py` also passes its SVG check (every `assets/icons-svg/*.svg` name is a Season 1 word id). [§15.1]
