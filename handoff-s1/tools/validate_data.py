#!/usr/bin/env python3
"""Validate the Season 1 handoff package. Run from the package root:  python3 tools/validate_data.py
Pure standard library. Exit code 0 = all checks passed."""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
fails = []
def check(cond, msg):
    if not cond: fails.append(msg)

W = json.load(open("data/season1-words.json", encoding="utf-8"))
T = json.load(open("data/season1-themes.json", encoding="utf-8"))
G = json.load(open("data/season1-grammar.json", encoding="utf-8"))
C = json.load(open("data/cats.json", encoding="utf-8"))

REQ = ["id","season","week","theme_id","theme_zh","theme_en","day","order","word","ipa","pos","meaning_zh",
       "example_en","example_zh","icon","emoji","abstract","icon_idea"]
check(len(W) == 300, f"expected 300 words, got {len(W)}")
check(len({w['id'] for w in W}) == 300, "word ids not unique")
check(len({w['word'].lower() for w in W}) == 300, "words not unique (case-insensitive)")
for w in W:
    for k in REQ:
        check(k in w, f"{w.get('id')}: missing field {k}")
    check(w["season"] == 1, f"{w['id']}: season != 1")
    check(1 <= w["day"] <= 5 and 1 <= w["order"] <= 5, f"{w['id']}: bad day/order")
    check(w["ipa"].startswith("/") and w["ipa"].endswith("/"), f"{w['id']}: IPA must be /.../")
    check(bool(re.search(r"\b" + re.escape(w["word"]) + r"\b", w["example_en"], re.I)), f"{w['id']}: example_en must contain the exact headword (fill-in-the-blank quiz)")
    check(bool(w["emoji"]), f"{w['id']}: emoji empty")
    check(isinstance(w["abstract"], bool), f"{w['id']}: abstract must be bool")
    if w["icon"] is not None:
        check(os.path.isfile(w["icon"]), f"{w['id']}: icon file missing: {w['icon']}")
    else:
        check(not os.path.isfile(f"assets/icons/{w['id']}.png"), f"{w['id']}: icon exists on disk but JSON says null")
themes = T["themes"]
check(len(themes) == 12, "expected 12 themes")
for t in themes:
    tw = [w for w in W if w["theme_id"] == t["id"]]
    check(len(tw) == 25, f"{t['id']}: {len(tw)} words, expected 25")
    for d in range(1, 6):
        dw = sorted((w for w in tw if w["day"] == d), key=lambda w: w["order"])
        check([w["order"] for w in dw] == [1,2,3,4,5], f"{t['id']} day {d}: orders not 1..5")
        check([w["id"] for w in dw] == t["days"][d-1]["words"], f"{t['id']} day {d}: themes.json day list mismatch")
    check(all(w["week"] == t["week"] for w in tw), f"{t['id']}: week mismatch")
    if t.get("icon"): check(os.path.isfile(t["icon"]), f"{t['id']}: theme icon missing")
food = [w["word"] for w in sorted((w for w in W if w["theme_id"] == "t05"), key=lambda w: (w["day"], w["order"]))]
check(food == "rice noodles bread egg chicken beef pork fish shrimp vegetable tomato carrot fruit apple banana orange soup sandwich dumpling cake cheese sweet salty spicy delicious".split(), "food theme order differs from the approved card")
check(all(w["icon"] for w in W if w["theme_id"] == "t05"), "every food word must have an icon")
check(len(G["lessons"]) == 6, "expected 6 grammar lessons")
check([g["week"] for g in G["lessons"]] == [2,4,6,8,10,12], "grammar weeks must be 2,4,...,12")
check(len(C["cats"]) == 15, "expected 15 cats")
for c in C["cats"]:
    check(os.path.isfile(c["photo"]), f"cat photo missing {c['photo']}")
    for p in c["poses"].values(): check(os.path.isfile(p), f"pose missing {p}")
check(os.path.isfile(C["hero"]["file"]), "hero missing")
# optional SVG icon trial (spec §15.1): assets/icons-svg/<word-id>.svg — names must be word ids, files must be self-contained SVG
SVG_DIR = "assets/icons-svg"
svg_ids = []
if os.path.isdir(SVG_DIR):
    ids = {w["id"] for w in W}
    for f in sorted(os.listdir(SVG_DIR)):
        if not f.endswith(".svg"): continue
        sid = f[:-4]; svg_ids.append(sid)
        check(sid in ids, f"{SVG_DIR}/{f}: not a Season 1 word id")
        txt = open(os.path.join(SVG_DIR, f), encoding="utf-8").read()
        check("<svg" in txt and "viewBox" in txt, f"{SVG_DIR}/{f}: not an SVG with a viewBox")
        check(not re.search(r"(?:href|src)\s*=\s*[\"'](?:https?:)?//", txt), f"{SVG_DIR}/{f}: external reference")
# every package-relative path mentioned in the markdown docs must exist
for md in [f for f in os.listdir(".") if f.endswith(".md")]:
    txt = open(md, encoding="utf-8").read()
    for p in set(re.findall(r"`((?:mockups|assets|data|reference|tools)/[^`*<>{} ]+?\.(?:png|webp|json|md|html|css|js|py|ttf))`", txt)):
        check(os.path.isfile(p), f"{md}: referenced file does not exist: {p}")
if fails:
    print("FAILED:\n  " + "\n  ".join(fails)); sys.exit(1)
photos = sum(len(c["poses"]) for c in C["cats"])
print(f"OK: {len(W)} unique words, 12 themes x 25, 5 days x 5; {sum(1 for w in W if w['icon'])} icons present, "
      f"{sum(1 for w in W if not w['icon'])} icon: null; {len(svg_ids)} trial SVG icons; 6 grammar lessons; 15 cats with {photos} photos; all referenced files exist.")
