#!/usr/bin/env python3
"""Validate Season 2 handoff data. Run from handoff-s2/:  python3 tools/validate_s2.py"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
fails = []

def check(cond, msg):
    if not cond:
        fails.append(msg)

W = json.load(open("data/season2-words.json", encoding="utf-8"))
T = json.load(open("data/season2-themes.json", encoding="utf-8"))
G = json.load(open("data/season2-grammar.json", encoding="utf-8"))
S1 = set(x.strip().lower() for x in open("data/s1-exclude-words.txt", encoding="utf-8") if x.strip())

REQ = [
    "id", "season", "week", "theme_id", "theme_zh", "theme_en",
    "day", "order", "word", "ipa", "pos", "meaning_zh",
    "example_en", "example_zh", "icon", "emoji", "abstract", "icon_idea",
    "explain_yue", "tip",
]

check(len(W) == 300, f"expected 300 words, got {len(W)}")
check(len({w["id"] for w in W}) == 300, "word ids not unique")
check(len({w["word"].lower() for w in W}) == 300, "words not unique")
check(not ({w["word"].lower() for w in W} & S1), f"collides with S1: {sorted({w['word'].lower() for w in W} & S1)[:20]}")

for w in W:
    for k in REQ:
        check(k in w, f"{w.get('id')}: missing {k}")
    check(w["season"] == 2, f"{w['id']}: season != 2")
    check(1 <= w["day"] <= 5 and 1 <= w["order"] <= 5, f"{w['id']}: bad day/order")
    check(isinstance(w["ipa"], str) and w["ipa"].startswith("/") and w["ipa"].endswith("/"), f"{w['id']}: bad IPA")
    check(bool(re.search(r"\b" + re.escape(w["word"]) + r"\b", w["example_en"], re.I)),
          f"{w['id']}: example_en must contain headword")
    check(bool(w.get("emoji")), f"{w['id']}: empty emoji")
    check(isinstance(w["abstract"], bool), f"{w['id']}: abstract not bool")
    check(w.get("explain_yue"), f"{w['id']}: empty explain_yue")
    check(w.get("tip"), f"{w['id']}: empty tip")

themes = T["themes"]
check(len(themes) == 12, f"expected 12 themes, got {len(themes)}")
for t in themes:
    tw = [w for w in W if w["theme_id"] == t["id"]]
    check(len(tw) == 25, f"{t['id']}: {len(tw)} words, expected 25")
    for d in range(1, 6):
        dw = sorted((w for w in tw if w["day"] == d), key=lambda w: w["order"])
        check([w["order"] for w in dw] == [1, 2, 3, 4, 5], f"{t['id']} day {d}: orders")
        check([w["id"] for w in dw] == t["days"][d - 1]["words"], f"{t['id']} day {d}: theme/words mismatch")
    check(all(w["week"] == t["week"] for w in tw), f"{t['id']}: week mismatch")

check(len(G["lessons"]) == 6, "expected 6 grammar lessons")
check([g["week"] for g in G["lessons"]] == [2, 4, 6, 8, 10, 12], "grammar weeks must be 2,4,...,12")
for g in G["lessons"]:
    check(g.get("intro"), f"{g['id']}: missing intro")
    check(g.get("exercises"), f"{g['id']}: missing exercises")

if fails:
    print("FAILED:\n  " + "\n  ".join(fails))
    sys.exit(1)
print(
    f"OK: {len(W)} words, 12 themes x 25, grammar {len(G['lessons'])} lessons; "
    f"no S1 collisions; all examples contain headword."
)
