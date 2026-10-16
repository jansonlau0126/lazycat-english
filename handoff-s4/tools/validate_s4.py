#!/usr/bin/env python3
"""Validate Season 4 polished words + themes + grammar."""
import json, os, re, sys
from pathlib import Path

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
fails = []

def check(cond, msg):
    if not cond:
        fails.append(msg)

W = json.load(open("data/season4-words.json", encoding="utf-8"))
T = json.load(open("data/season4-themes.json", encoding="utf-8"))
EXCL = set(
    x.strip().lower()
    for x in open("data/s1s2s3-exclude-words.txt", encoding="utf-8")
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
check(not coll, f"collides with S1/S2/S3: {sorted(coll)[:20]}")

# reserved S3 leftovers that must appear
for need in ("agree", "suggest", "discuss"):
    check(need in {w["word"].lower() for w in W}, f"missing reserved word {need}")

for w in W:
    for k in REQ:
        check(k in w, f"{w.get('id')}: missing {k}")
    check(w["season"] == 4, f"{w['id']}: season != 4")
    check(w["id"] == w["word"], f"{w.get('id')}: id != word")
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
    icon_path = Path("assets/icons") / f"{w['id']}.png"
    check(icon_path.exists(), f"{w['id']}: missing {icon_path}")

themes = T["themes"]
check(len(themes) == 12, f"expected 12 themes, got {len(themes)}")
check(T.get("season") == 4, "themes.season != 4")
check(T.get("zh") == "窩喺被竇", "themes.zh must be 窩喺被竇")
check(T.get("en") == "Cosy in the Den", "themes.en must be Cosy in the Den")
expected = [
    ("t37", "環境同回收"), ("t38", "新聞同社會"), ("t39", "科技"), ("t40", "安全同緊急情況"),
    ("t41", "規則同禮貌"), ("t42", "表達意見"), ("t43", "人際關係"), ("t44", "計劃同目標"),
    ("t45", "節日同慶祝"), ("t46", "香港文化"), ("t47", "人生經歷"), ("t48", "未來同夢想"),
]
for th, (eid, ezh) in zip(themes, expected):
    check(th["id"] == eid and th["zh"] == ezh, f"theme mismatch {th.get('id')}/{th.get('zh')}")

for t in themes:
    tw = [w for w in W if w["theme_id"] == t["id"]]
    check(len(tw) == 25, f"{t['id']}: {len(tw)} words, expected 25")
    for d in range(1, 6):
        dw = sorted((w for w in tw if w["day"] == d), key=lambda w: w["order"])
        check([w["order"] for w in dw] == [1, 2, 3, 4, 5], f"{t['id']} day {d}: orders")
        check([w["id"] for w in dw] == t["days"][d - 1]["words"], f"{t['id']} day {d}: theme/words mismatch")
    check(all(w["week"] == t["week"] for w in tw), f"{t['id']}: week mismatch")

gpath = "data/season4-grammar.json"
check(os.path.exists(gpath), "missing season4-grammar.json")
G = json.load(open(gpath, encoding="utf-8"))
lessons = G.get("lessons") or []
check(G.get("season") == 4, "grammar.season != 4")
check(len(lessons) == 6, "expected 6 grammar lessons")
check([g["id"] for g in lessons] == ["g19","g20","g21","g22","g23","g24"], "grammar ids must be g19–g24")
check([g["week"] for g in lessons] == [2, 4, 6, 8, 10, 12], "grammar weeks must be 2,4,...,12")
for g in lessons:
    check(g.get("intro"), f"{g['id']}: missing intro")
    check(len(g.get("intro") or []) == 2, f"{g['id']}: intro must have 2 cards")
    check(g.get("exercises"), f"{g['id']}: missing exercises")
    check(len(g.get("exercises") or []) == 5, f"{g['id']}: need 5 exercises")
    types = [ex.get("t") for ex in g["exercises"]]
    check(types == ["mc","mc","fill","fill","tiles"], f"{g['id']}: exercise types {types}")

# monthly + q4
check(len(T.get("monthly_reviews") or []) == 3, "need m10–m12")
check([m["id"] for m in T["monthly_reviews"]] == ["m10","m11","m12"], "monthly ids")
q = T.get("quarterly_review") or {}
check(q.get("id") == "q4", "quarterly id q4")
unlock = q.get("cat_unlock") or {}
check(unlock.get("cat") == "baubau", "q4 should unlock baubau")

if fails:
    print("FAIL:")
    for f in fails[:40]:
        print("-", f)
    if len(fails) > 40:
        print(f"... +{len(fails)-40} more")
    sys.exit(1)
print("OK: Season 4 — 300 words, 12 themes, g19–g24, icons, m10–m12, q4/baubau")
