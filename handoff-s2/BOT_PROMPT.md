# 直接貼畀內容寫手／英文老師 Bot 嘅開場

工作目錄：`handoff-s2/`

## 已完成

| 檔案 | 狀態 |
|------|------|
| data/season2-words.json | 300 字已展開 |
| data/season2-themes.json | 12 主題 |
| data/season2-grammar.json | g07–g12 |
| tools/validate_s2.py | 驗證 |
| data/s1-exclude-words.txt | S1 禁字 |

## 要做

1. `python3 tools/validate_s2.py` 必須 OK
2. 潤飾 tip／港式例句（唔改結構）
3. 覆核 grammar
4. 更新 CHANGELOG.md

## 硬性

- 唔改 t13–t24、季節名、300 字數
- 唔撞 s1-exclude-words.txt
- example_en 含 headword 原形
- icon 保持 null

範圍外（icon／build／產品）→ 交總經理，見 FOR_ENGLISH_TEACHER.md
