#!/usr/bin/env python3
"""Validate Season 3 handoff data. Run from handoff-s3/:  python3 tools/validate_s3.py"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
fails = []

def check(cond, msg):
    if not cond:
        fails.append(msg)

W = json.load(open("data/season3-words.json", encoding="utf-8"))
T = json.load(open("data/season3-themes.json", encoding="utf-8"))
G = json.load(open("data/season3-grammar.json", encoding="utf-8"))
PREV = set(x.strip().lower() for x in open("data/s1s2-exclude-words.txt", encoding="utf-8") if x.strip() and not x.startswith("#"))

REQ = [
    "id", "season", "week", "theme_id", "theme_zh", "theme_en",
    "day", "order", "word", "ipa", "pos", "meaning_zh",
    "example_en", "example_zh", "icon", "emoji", "abstract", "icon_idea",
    "explain_yue", "tip",
]
check(len(W) == 300, f"expected 300 words, got {len(W)}")
check(len({w["id"] for w in W}) == 300, "word ids not unique")
check(len({w["word"].lower() for w in W}) == 300, "words not unique")
hit = {w["word"].lower() for w in W} & PREV
check(not hit, f"collides with S1/S2: {sorted(hit)[:20]}")
for w in W:
    for k in REQ:
        check(k in w, f"{w.get('id')}: missing {k}")
    check(w["season"] == 3, f"{w['id']}: season != 3")
    check(w["id"] == w["word"], f"{w.get('id')}: id != word")
    check(1 <= w["day"] <= 5 and 1 <= w["order"] <= 5, f"{w['id']}: bad day/order")
    check(isinstance(w["ipa"], str) and w["ipa"].startswith("/") and w["ipa"].endswith("/"), f"{w['id']}: bad IPA")
    check(bool(re.search(r"\b" + re.escape(w["word"]) + r"\b", w["example_en"], re.I)), f"{w['id']}: example missing headword")
    check(w.get("icon") is None, f"{w['id']}: icon must stay null")
    check(isinstance(w["abstract"], bool), f"{w['id']}: abstract not bool")
    check(w.get("explain_yue") and w.get("tip") and w.get("example_zh"), f"{w['id']}: empty copy")

themes = T["themes"]
check(len(themes) == 12, f"expected 12 themes, got {len(themes)}")
for t in themes:
    tw = [w for w in W if w["theme_id"] == t["id"]]
    check(len(tw) == 25, f"{t['id']}: {len(tw)} words")
    check(t.get("outing_task", {}).get("en") and t.get("outing_task", {}).get("scene_zh"), f"{t['id']}: outing missing")
    for d in range(1, 6):
        dw = sorted((w for w in tw if w["day"] == d), key=lambda w: w["order"])
        check([w["order"] for w in dw] == [1, 2, 3, 4, 5], f"{t['id']} day {d}: orders")
        check([w["id"] for w in dw] == t["days"][d - 1]["words"], f"{t['id']} day {d}: theme mismatch")
    check(all(w["week"] == t["week"] for w in tw), f"{t['id']}: week mismatch")

by = {w["word"]: w for w in W}
for word, bit in {"break": "小息", "class": "班", "grade": "年級", "form": "表格", "mark": "分數", "present": "出席", "apply": "申請", "fire": "解僱", "homeroom": "班主任", "scholarship": "獎學"}.items():
    check(bit in by[word]["tip"] or bit in by[word]["explain_yue"], f"{word}: missing note {bit}")

check(len(G["lessons"]) == 6, "expected 6 grammar lessons")
check([g["id"] for g in G["lessons"]] == ["g13", "g14", "g15", "g16", "g17", "g18"], "grammar ids")
check([g["week"] for g in G["lessons"]] == [2, 4, 6, 8, 10, 12], "grammar weeks")
for g in G["lessons"]:
    check(g.get("intro") and g.get("exercises"), f"{g['id']}: incomplete")

if fails:
    print("FAILED:\n  " + "\n  ".join(fails))
    sys.exit(1)
print(f"OK: {len(W)} words, 12 themes x 25, grammar {len(G['lessons'])} lessons; no S1/S2 collisions.")
