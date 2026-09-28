#!/usr/bin/env python3
"""After dropping new hand-drawn icons into assets/icons/<word-id>.png, run:
    python3 tools/sync_icons.py
It sets "icon" for every word whose PNG now exists (and null where it doesn't). No app code change needed."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
p = os.path.join(ROOT, "data", "season1-words.json")
W = json.load(open(p, encoding="utf-8"))
n = 0
for w in W:
    f = f"assets/icons/{w['id']}.png"
    new = f if os.path.isfile(os.path.join(ROOT, f)) else None
    if new != w["icon"]:
        w["icon"] = new; n += 1
json.dump(W, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"updated {n} words; {sum(1 for w in W if w['icon'])}/{len(W)} have icons")
