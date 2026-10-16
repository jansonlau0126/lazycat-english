#!/usr/bin/env python3
"""Validate Season 3 polished words + themes. Grammar optional until season3-grammar.json exists."""
import json, os, re, sys
from pathlib import Path

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
fails = []

def check(cond, msg):
    if not cond:
        fails.append(msg)

W = json.load(open("data/season3-words.json", encoding="utf-8"))
T = json.load(open("data/season3-themes.json", encoding="utf-8"))
EXCL = set(
    x.strip().lower()
    for x in open("data/s1s2-exclude-words.txt", encoding="utf-8")
    if x.strip()
)

REQ = [
    "id", "season", "week", "theme_id", "theme_zh", "theme_en",
    "day", "order", "word", "ipa", "pos", "meaning_zh",
    "example_en", "example_zh", "icon", "emoji", "abstract", "icon_idea",
    "explain_yue", "tip",
]

check(len(W) == 300, f"expected 300 words, got {len(W)}")
check(len({w["id"] for w in W}) == 300, "word ids not unique")
check(len({w["word"].lower() for w in W}) == 300, "words not unique")
coll = {w["word"].lower() for w in W} & EXCL
check(not coll, f"collides with S1/S2: {sorted(coll)[:20]}")

for w in W:
    for k in REQ:
        check(k in w, f"{w.get('id')}: missing {k}")
    check(w["season"] == 3, f"{w['id']}: season != 3")
    check(1 <= w["day"] <= 5 and 1 <= w["order"] <= 5, f"{w['id']}: bad day/order")
    check(1 <= w["week"] <= 12, f"{w['id']}: bad week")
    check(isinstance(w["ipa"], str) and w["ipa"].startswith("/") and w["ipa"].endswith("/"), f"{w['id']}: bad IPA")
    check(bool(re.search(r"\b" + re.escape(w["word"]) + r"\b", w["example_en"], re.I)),
          f"{w['id']}: example_en must contain headword")
    check(bool(w.get("emoji")), f"{w['id']}: empty emoji")
    check(isinstance(w["abstract"], bool), f"{w['id']}: abstract not bool")
    check(bool(w.get("explain_yue")), f"{w['id']}: empty explain_yue")
    check(bool(w.get("tip")), f"{w['id']}: empty tip")
    check(bool(w.get("example_zh")), f"{w['id']}: empty example_zh")
    check(bool(w.get("icon")), f"{w['id']}: empty icon")
    check(Path(w["icon"]).name == w["id"] + ".png" or w["icon"].endswith("/" + w["id"] + ".png"), f"{w['id']}: icon filename should match id")

themes = T["themes"]
check(len(themes) == 12, f"expected 12 themes, got {len(themes)}")
check(T.get("season") == 3, "themes.season != 3")
for t in themes:
    tw = [w for w in W if w["theme_id"] == t["id"]]
    check(len(tw) == 25, f"{t['id']}: {len(tw)} words, expected 25")
    for d in range(1, 6):
        dw = sorted((w for w in tw if w["day"] == d), key=lambda w: w["order"])
        check([w["order"] for w in dw] == [1, 2, 3, 4, 5], f"{t['id']} day {d}: orders")
        check([w["id"] for w in dw] == t["days"][d - 1]["words"], f"{t['id']} day {d}: theme/words mismatch")
    check(all(w["week"] == t["week"] for w in tw), f"{t['id']}: week mismatch")

# grammar g13–g18 required
gpath = "data/season3-grammar.json"
check(os.path.exists(gpath), "missing season3-grammar.json")
G = json.load(open(gpath, encoding="utf-8"))
lessons = G.get("lessons") or []
check(G.get("season") == 3, "grammar.season != 3")
check(len(lessons) == 6, "expected 6 grammar lessons")
check([g["id"] for g in lessons] == ["g13","g14","g15","g16","g17","g18"], "grammar ids must be g13–g18")
check([g["week"] for g in lessons] == [2, 4, 6, 8, 10, 12], "grammar weeks must be 2,4,...,12")
for g in lessons:
    check(g.get("intro"), f"{g['id']}: missing intro")
    check(len(g.get("intro") or []) >= 1, f"{g['id']}: intro empty")
    check(g.get("exercises"), f"{g['id']}: missing exercises")
    check(len(g.get("exercises") or []) >= 5, f"{g['id']}: need >=5 exercises")
    for ex in g["exercises"]:
        check(ex.get("t") in ("mc","fill","tiles"), f"{g['id']}: bad exercise type {ex.get('t')}")
        check(ex.get("q"), f"{g['id']}: exercise missing q")
grammar_note = f"grammar {len(lessons)} lessons"

if fails:
    print("FAILED:\n  " + "\n  ".join(fails[:40]))
    if len(fails) > 40:
        print(f"  ... and {len(fails)-40} more")
    sys.exit(1)
print(
    f"OK: {len(W)} words, 12 themes x 25; no S1/S2 collisions; "
    f"all examples contain headword; {grammar_note}."
)
