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
| `data/season2-words.json` | ✅ 300 字完整（ipa／例句／tip；icon null） |
| `data/season2-themes.json` | ✅ 12 主題 + review |
| `data/season2-grammar.json` | ✅ g07–g12 |
| `data/s1-exclude-words.txt` | ✅ S1 禁字 |
| `tools/validate_s2.py` | ✅ 已通過 |
| `BOT_PROMPT.md` | ✅ 下一手開場 |
| `CHANGELOG.md` | ✅ 變更紀錄 |
| `data/season2-word-plan.json` | stub 備份 |
| `data/season2-grammar-plan.json` | 大綱備份 |

```bash
cd handoff-s2 && python3 tools/validate_s2.py
# 預期：OK: 300 words, 12 themes x 25, grammar 6 lessons...
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
- `icon` 暫時全部 `null`

---

## 下一手工作（承接）

1. 跑 validate  
2. 潤飾粵語 tip／港式例句（重點詞：mtr, minibus, tram, alight, queue, centre, practise, dessert, luggage, favourite）  
3. 可選加強 grammar 練習  
4. 更新 `CHANGELOG.md`  
5. **唔好**改 theme id、season 名、總字數  

接主站 `build.py`／icon 另開任務。
