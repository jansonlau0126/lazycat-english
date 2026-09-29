# Season 2 handoff changelog

## 2026-09-29 — 字檔入庫
- `data/season2-words.json` 用已確認嘅 300 字檔（部分 tip 仍然短）
- `data/season2-themes.json` 按字檔日次寫低
- `data/season2-grammar.json` 為 g07–g12
- `python3 tools/validate_s2.py` 通過

## 2026-09-29 — 前期包 v1（可交接）

### 已完成
- 鎖定品牌：出去曬太陽；theme id t13–t24；12×25 = 300 字
- `season2-themes.json`：主題、每日字表、m4/m5/m6、q2 季度複習
- `season2-words.json`：300 字完整欄位（ipa、explain_yue、example_en/zh、tip）；icon 全 null
- `season2-grammar.json`：g07 can／g08 there is／g09 how much|many／g10 祈使句／g11 like -ing／g12 進行式
- 與 S1 零撞字（對照 `s1-exclude-words.txt`）
- `tools/validate_s2.py` 通過
- `BOT_PROMPT.md` 畀下一手 Grok bot 直接貼用
- `FOR_ENGLISH_TEACHER.md` / `FOR_GM.md` 分工交接

### 下一手建議
- 潤飾偏短嘅名詞 tip（部分仍係模板味）
- 人工覆核港式詞：mtr、minibus、tram、alight、queue、dollar
- icon 未畫；build.py 接 S2 另開任務
