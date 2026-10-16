# Season 3 Handoff — 返學返工 (School & Work)

300 張完整生字卡、6 篇文法（g13–g18）、12 主題（t25–t36）。跨季零撞字。季度大考解鎖 **大熊（daihung）**。

| 欄位 | 值 |
|------|-----|
| season | 3 |
| zh | 返學返工 |
| theme id | t25–t36 |
| weeks | 27–39 |
| total_words | 300 |
| exam_cat | daihung |

## 檔案
- `data/season3-words.json` — 300 張生字卡（ipa、粵語、例句、tip、icon）
- `data/season3-themes.json` — 12 主題、m7–m9、q3／daihung
- `data/season3-grammar.json` — g13–g18
- `data/s1s2-exclude-words.txt` — 禁字
- `assets/icons/{word}.png` — 300 水彩橘貓 icon
- `tools/validate_s3.py` — 內容驗證
- `GO_LIVE_S3.md` — 上線說明同已知圖上文字洩漏

## 驗證
```bash
python3 handoff-s3/tools/validate_s3.py
python3 build.py
```
