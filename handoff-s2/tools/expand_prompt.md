# Grok Bot：展開／潤飾 Season 2 生字

## 輸入

- data/season2-words.json（300 字，已有完整欄位）
- data/s1-exclude-words.txt（禁止重複）
- data/season2-themes.json
- data/season2-grammar.json

## 要做

1. python3 tools/validate_s2.py
2. 潤飾 tip／港式例句
3. 覆核 grammar
4. 更新 CHANGELOG.md

## 硬性

- example_en 含 headword 原形
- 唔撞 S1
- 唔改 t13–t24／300 字結構
- icon 保持 null
