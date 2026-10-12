# Season 2 Handoff — 出去曬太陽 (Go Out in the Sun)

> 畀下一手 Grok bot／內容寫手用。核心資料已齊，下一步係**品質潤飾**同埋接 `build.py`（另開任務）。

**先讀：`BOT_PROMPT.md`（可直接複製貼上）**

---

## 產品定位（已鎖定，唔好改）

| 欄位 | 值 |
|------|-----|
| season | 2 |
| zh | 出去曬太陽 |
| en | Go Out in the Sun |
| emoji | ☀️ |
| 日曆週 | 14–26（12 學習週 + 第 26 週季度複習） |
| level | A1 完成 → A2 開頭 |
| total_words | 300（12 × 25） |
| unlock_cat | lammui |
| 上一季 | 伸個懶腰（屋企） |
| 下一季 | 返學返工（學校／工作——S2 唔好搶） |

---

## 檔案狀態

| 檔案 | 狀態 |
|------|------|
| `data/season2-words.json` | ✅ 300 字定稿（ipa／例句／tip／icon） |
| `data/season2-themes.json` | ✅ 12 主題 + m4／m5／m6 + q2 |
| `data/season2-grammar.json` | ✅ g07–g12 定稿 |
| `assets/icons/` | ✅ 300 PNG（t13–t16 沿用舊圖；t17–t24 由貼紙表切出） |
| `assets/sticker-sheets/` | ✅ t13–t24 原表；t14／t16 另有最終版 |
| `data/s1-exclude-words.txt` | ✅ S1 禁字 |
| `tools/validate_s2.py` | ✅ 已通過 |
| `BOT_PROMPT.md` | ✅ 下一手開場 |
| `CHANGELOG.md` | ✅ 變更紀錄 |
| `data/season2-word-plan.json` | stub 備份 |
| `data/season2-grammar-plan.json` | 大綱備份 |

```bash
cd handoff-s2 && python3 tools/validate_s2.py
# 預期：OK: 300 words, 12 themes x 25, grammar 6 lessons... icons 300.
```

---

## 主題一覽

| 季內週 | id | emoji | zh | grammar |
|--------|-----|-------|----|---------|
| 1 | t13 | 🔢 | 數字同數量 | — |
| 2 | t14 | 🚶 | 出街動詞 | g07 can/can't |
| 3 | t15 | 🚌 | 交通 | — |
| 4 | t16 | 🧭 | 城市地方 | g08 there is + 介詞 |
| 5 | t17 | 🛍️ | 購物 | — |
| 6 | t18 | 💰 | 金錢 | g09 how much/many |
| 7 | t19 | 🍽️ | 餐廳食嘢 | — |
| 8 | t20 | 🏥 | 健康 | g10 祈使句 |
| 9 | t21 | ⚽ | 運動 | — |
| 10 | t22 | 🎸 | 興趣娛樂 | g11 like + -ing |
| 11 | t23 | ✈️ | 旅行 | — |
| 12 | t24 | 📱 | 手機同網絡 | g12 進行式 |

---

## Word schema（同 S1）

必填：`id, season, week, theme_id, theme_zh, theme_en, day, order, word, ipa, pos, meaning_zh, example_en, example_zh, icon, emoji, abstract, icon_idea, explain_yue, tip`

- `example_en` 必須含 **headword 原形**（`\bword\b`）
- `ipa` 格式 `/.../`
- 唔好撞 `s1-exclude-words.txt`
- `icon` 係 `assets/icons/<id>.png`

---

## 上線

內容已定稿。`python3 build.py` 會讀呢份 handoff，日曆週 14–26，季度複習跟 themes 入面嘅 q2，大考解鎖藍莓。

唔好改 theme id、季節名、總字數。貼紙弱格唔重畫。Merge 先會發佈 GitHub Pages。
