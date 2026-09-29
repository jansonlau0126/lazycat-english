#!/usr/bin/env python3
"""Validate Season 4 handoff data. Run from handoff-s4/:  python3 tools/validate_s4.py"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
fails = []

def check(cond, msg):
    if not cond:
        fails.append(msg)

W = json.load(open("data/season4-words.json", encoding="utf-8"))
T = json.load(open("data/season4-themes.json", encoding="utf-8"))
G = json.load(open("data/season4-grammar.json", encoding="utf-8"))
PREV = set(x.strip().lower() for x in open("data/s1s2s3-exclude-words.txt", encoding="utf-8") if x.strip() and not x.startswith("#"))
FORBIDDEN = {"basis", "method", "flair", "justice", "ally", "remark", "dedication", "steady", "cable", "socket", "plug"}

REQ = [
    "id", "season", "week", "theme_id", "theme_zh", "theme_en",
    "day", "order", "word", "ipa", "pos", "meaning_zh",
    "example_en", "example_zh", "icon", "emoji", "abstract", "icon_idea",
    "explain_yue", "tip",
]
check(len(W) == 300, f"expected 300 words, got {len(W)}")
check(len({w["id"] for w in W}) == 300, "word ids not unique")
check(len({w["word"].lower() for w in W}) == 300, "words not unique")
words = {w["word"].lower() for w in W}
check(not (words & PREV), f"collides with earlier seasons: {sorted(words & PREV)[:20]}")
check(not (words & FORBIDDEN), f"off-theme words: {sorted(words & FORBIDDEN)}")
for need in ("flatmate", "wrapping", "bow", "include", "passion", "rights"):
    check(need in words, f"missing v1.1 word {need}")
for w in W:
    for k in REQ:
        check(k in w, f"{w.get('id')}: missing {k}")
    check(w["season"] == 4, f"{w['id']}: season != 4")
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
for word, bit in {"leave": "放假", "interest": "興趣", "flatmate": "同住", "bow": "蝴蝶結", "wrapping": "包裝", "include": "包括", "passion": "熱", "rights": "權利"}.items():
    check(bit in by[word]["tip"] or bit in by[word]["explain_yue"], f"{word}: missing note {bit}")

check(len(G["lessons"]) == 6, "expected 6 grammar lessons")
check([g["id"] for g in G["lessons"]] == ["g19", "g20", "g21", "g22", "g23", "g24"], "grammar ids")
check([g["week"] for g in G["lessons"]] == [2, 4, 6, 8, 10, 12], "grammar weeks")
for g in G["lessons"]:
    check(g.get("intro") and g.get("exercises"), f"{g['id']}: incomplete")

copy = json.load(open("../content/s1-s4-copy.json", encoding="utf-8"))
check(len(copy["outings"]) == 48, "expected 48 outing tasks in the copy file")
check(len(copy["diaries"]) == 4, "expected 4 season diaries")

if fails:
    print("FAILED:\n  " + "\n  ".join(fails))
    sys.exit(1)
print(f"OK: {len(W)} words, 12 themes x 25, grammar {len(G['lessons'])} lessons; v1.1 words kept; no earlier collisions.")
