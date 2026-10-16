# Season 3 Go-Live Pack — 返學返工（本地）

> Draft PR 接入中。**唔好 merge**，等 Janson 拍板。

日期：2026-10-16（HK）

---

## 已齊（本機 `/workspace/s3-draft/`）

| 項目 | 路徑 | 狀態 |
|------|------|------|
| 生字 | `data/season3-words.json` | ✅ 300（ipa／粵語／例句／tip／**icon 已填**） |
| 主題 | `data/season3-themes.json` | ✅ t25–t36 + m7–m9 + q3／daihung |
| 文法 | `data/season3-grammar.json` | ✅ g13–g18 |
| 禁字 | `data/s1s2-exclude-words.txt` | ✅ |
| icon manifest | `data/icon-manifest.json` | ✅ word → path |
| 驗證 | `tools/validate_s3.py` | ✅ OK |
| 貼紙 brief | `STICKER-BRIEF-S3.md` | ✅ |
| App 用 icons（symlink） | `assets/icons/{word}.png` | ✅ 300 → `cat-redesign/s3-icons/icons/` |

### 貼紙原表同切圖

| | path |
|--|------|
| Sheets（12） | `/workspace/cat-redesign/s3-icons/t25-*-sheet.jpg` … `t36-*-sheet.jpg` |
| Sliced PNG | `/workspace/cat-redesign/s3-icons/icons/{word}.png`（300，RGBA） |
| Draft symlink | `/workspace/s3-draft/assets/icons/{word}.png` |

切法：每張 sheet **1280×720** → 偵測內容外框 → **等分 5×5**（inset ~3.5%）→ 去近白底 → 正方形 pad（約 200–256px）。L→R、T→B = themes days order。

---

## Known sticker text leaks（圖上有可讀英文字）

Brief 要求「唔好有可讀文字」，但現有 sheet 仍有：

| word | theme | 洩漏 |
|------|-------|------|
| `pass` | t27 | 綠色印章 **PASS** |
| `fail` | t27 | 粉紅印章 **FAIL** |
| `english` | t26 | 書頁 **ABC** |

可接受作 go-live 暫用，或之後重畫呢三格（建議模糊／符號化）。其餘抽樣（school／blackboard／cv 等）無清晰 label。

---

## 未做／唔好自己做

- ❌ Push／merge `lazycat-english` GitHub
- ❌ 交 總經理 handoff
- ❌ 接主站 `build.py`／改 live map（另開任務）
- ❌ 重畫有字洩漏嘅三格（等 Janson 拍板）

---

## 建議上線步驟（等人手批核後）

1. Janson 抽樣 `assets/icons/`（尤其 t29 身形、t27 pass／fail）
2. 決定是否重畫 PASS／FAIL／ABC 三格
3. 將 `data/season3-*.json` + `assets/icons/` 併入 app handoff／repo
4. 工程：map 解鎖、季度考試 → `daihung`
5. 先 draft PR，Janson／總經理再 merge

---

## 快速自檢

```bash
cd /workspace/s3-draft && python3 tools/validate_s3.py
ls assets/icons | wc -l          # 預期 300
ls /workspace/cat-redesign/s3-icons/icons | wc -l   # 預期 300
```
