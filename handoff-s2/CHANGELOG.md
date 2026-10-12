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

## 2026-10-13 — 英文老師內容定稿

- 潤稿完成：`season2-words.json` 全部 300 字（explain_yue／example_en／example_zh／tip）
- 潤稿完成：`season2-grammar.json` g07–g12
- `season2-themes.json` 還原 m4／m5／m6 同 q2 季度節奏（複習日 3+3+2+2+2；大考解鎖藍莓）
- Janson：貼紙弱格唔重畫

## 2026-10-13 — 接入 app（上線 PR，未 merge）

- `build.py` 用 themes 入面嘅月結／季度複習；季內週次加 13，變成日曆週 14–26
- 300 個 icon：t13–t16 沿用 main 已有 PNG；t17–t24 由最終 5×5 貼紙表切出（`tools/slice_stickers.py`），冇重畫
- 解鎖貓仍然係藍莓（`lammui`，完成 q2 大考）
