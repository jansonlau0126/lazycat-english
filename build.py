#!/usr/bin/env python3
"""Build the static 懶貓英文 site at the repo root.

Copies images, subsets fonts to WOFF2, writes js/data.js from handoff-s1/data,
and cache-busts index.html. Run from anywhere:

    python3 build.py
"""
from __future__ import annotations

import hashlib
import json
import shutil
from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
HAND = ROOT / "handoff-s1"
SRC = HAND / "assets"
OUT = ROOT / "assets"
FONTS = OUT / "fonts"


def copy_dir(name: str) -> None:
    src, dst = SRC / name, OUT / name
    if not src.exists():
        if dst.exists():
            shutil.rmtree(dst)
        return
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst)


def icon_sources():
    return [SRC / "icons", ROOT / "handoff-s2" / "assets" / "icons"]


def find_icon(stem: str):
    for folder in icon_sources():
        png = folder / f"{stem}.png"
        if png.exists():
            return png
    return None


def gather_text() -> str:
    chunks = []
    folders = [
        HAND / "data",
        ROOT / "handoff-s2" / "data",
        ROOT / "handoff-s3" / "data",
        ROOT / "handoff-s4" / "data",
    ]
    for folder in folders:
        if not folder.is_dir():
            continue
        for p in folder.glob("*.json"):
            if p.name.startswith("legacy") or "word-plan" in p.name:
                continue
            chunks.append(p.read_text(encoding="utf-8"))
    copy = ROOT / "content" / "s1-s4-copy.json"
    if copy.exists():
        chunks.append(copy.read_text(encoding="utf-8"))
    for p in list((ROOT / "js").glob("*.js")) + [ROOT / "css" / "app.css", ROOT / "index.html"]:
        if p.name == "data.js":
            continue
        chunks.append(p.read_text(encoding="utf-8"))
    chunks.append("".join(chr(c) for c in range(32, 127)))
    chunks.append("‘’“”—–…·・×✓🔒⭐🐾❤️🔥📚🎯📷🧶")
    return "".join(chunks)


def subset_font(src: Path, dst: Path, text: str, family: str | None = None) -> None:
    font = TTFont(src, lazy=False)
    opt = Options()
    opt.flavor = "woff2"
    opt.layout_features = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk"]
    opt.notdef_outline = True
    opt.recommended_glyphs = True
    opt.hinting = False
    opt.desubroutinize = True
    sub = Subsetter(options=opt)
    sub.populate(text=text)
    sub.subset(font)
    if family:
        rename(font, family)
    font.flavor = "woff2"
    dst.parent.mkdir(parents=True, exist_ok=True)
    font.save(dst)
    font.close()
    check = TTFont(dst)
    names = []
    for rec in check["name"].names:
        try:
            names.append(rec.toUnicode())
        except Exception:
            continue
    for rec in check["name"].names:
        if rec.nameID not in (1, 4, 6, 16):
            continue
        if "huninn" in rec.toUnicode().lower():
            raise SystemExit("subset font family still uses reserved name huninn: " + dst.name)
    check.close()
    print(f"  {dst.relative_to(ROOT)}  {dst.stat().st_size/1024:.0f} KB")


def rename(font: TTFont, family: str) -> None:
    ps = family.replace(" ", "")
    for rec in font["name"].names:
        if rec.nameID in (1, 16):
            rec.string = family
        elif rec.nameID == 4:
            rec.string = family
        elif rec.nameID == 6:
            rec.string = ps
        elif rec.nameID == 3:
            rec.string = ps + "-Subset"


def favicon() -> None:
    im = Image.open(SRC / "cats" / "01-fanshu-orange-tabby.webp").convert("RGBA")
    w, h = im.size
    fx, top, chin = 0.5, 0.05, 0.54
    head = chin - top
    cx, cy = fx * w, ((top + chin) / 2 + head * 0.04) * h
    side = head * 1.28 * h
    x0 = max(0, min(w - side, cx - side / 2))
    y0 = max(0, min(h - side, cy - side / 2))
    crop = im.crop((int(x0), int(y0), int(x0 + side), int(y0 + side))).resize((180, 180), Image.Resampling.LANCZOS)
    mask = Image.new("L", (180, 180), 0)
    ImageDraw.Draw(mask).ellipse((2, 2, 178, 178), fill=255)
    icon = Image.new("RGBA", (180, 180), (255, 248, 238, 255))
    icon.paste(crop, (0, 0), mask)
    icon.save(OUT / "apple-touch-icon.png")
    icon.resize((32, 32), Image.Resampling.LANCZOS).save(OUT / "favicon-32.png")


# Calendar weeks: S1 stays 1–12 (review 13). Later seasons shift so weeks never collide.
PACKS = [
    {
        "season": 1, "offset": 0, "review_week": 13, "qid": "q1", "month_start": 1,
        "themes": "handoff-s1/data/season1-themes.json",
        "words": "handoff-s1/data/season1-words.json",
        "grammar": "handoff-s1/data/season1-grammar.json",
        "zh": "伸個懶腰", "en": "Big Stretch", "emoji": "🌸", "subtitle": "生活基本",
        "weeks": "1–13", "place": "屋企",
        "bg": "linear-gradient(180deg,#FFF0F3,#FFF8EE)", "border": "#F9D7DF",
        "exam_cat": "tongyun",
    },
    {
        "season": 2, "offset": 13, "review_week": 26, "qid": "q2", "month_start": 4,
        "themes": "handoff-s2/data/season2-themes.json",
        "words": "handoff-s2/data/season2-words.json",
        "grammar": "handoff-s2/data/season2-grammar.json",
        "zh": "出去曬太陽", "en": "Go Out in the Sun", "emoji": "☀️", "subtitle": "出街用得着",
        "weeks": "14–26", "place": "港鐵／街市",
        "bg": "#FFF7E0", "border": "#F6E3A6",
        "exam_cat": "lammui",
    },
    {
        "season": 3, "offset": 26, "review_week": 39, "qid": "q3", "month_start": 7,
        "themes": "handoff-s3/data/season3-themes.json",
        "words": "handoff-s3/data/season3-words.json",
        "grammar": "handoff-s3/data/season3-grammar.json",
        "zh": "返學返工", "en": "School & Work", "emoji": "🏫", "subtitle": "學校同工作",
        "weeks": "27–39", "place": "學校",
        "bg": "#FFF1E6", "border": "#F4D3B5",
        "exam_cat": "daihung",
    },
    {
        "season": 4, "offset": 39, "review_week": 52, "qid": "q4", "month_start": 10,
        "themes": "handoff-s4/data/season4-themes.json",
        "words": "handoff-s4/data/season4-words.json",
        "grammar": "handoff-s4/data/season4-grammar.json",
        "zh": "一齊過節", "en": "Celebrate Together", "emoji": "🏮", "subtitle": "節日同相處",
        "weeks": "40–52", "place": "年宵／中秋",
        "bg": "#EEF5FB", "border": "#CFE3F2",
        "exam_cat": None,
    },
]

SHORT_ZH = {
    "t13": "數字", "t14": "出街", "t15": "交通", "t16": "城市", "t17": "購物", "t18": "金錢",
    "t19": "餐廳", "t20": "健康", "t21": "運動", "t22": "興趣", "t23": "旅行", "t24": "手機",
    "t25": "學校", "t26": "人物", "t27": "文具", "t28": "學科", "t29": "學習", "t30": "功課",
    "t31": "規矩", "t32": "職業", "t33": "求職", "t34": "時間", "t35": "升學", "t36": "合作",
    "t37": "朋友", "t38": "派對", "t39": "禮物", "t40": "節日", "t41": "其他", "t42": "性格",
    "t43": "自然", "t44": "環保", "t45": "社區", "t46": "禮貌", "t47": "相處", "t48": "夢想",
}
THEME_EMOJI = {
    "t25": "🏫", "t26": "👩‍🏫", "t27": "✏️", "t28": "📚", "t29": "📝", "t30": "📋",
    "t31": "🤫", "t32": "💼", "t33": "🏢", "t34": "⏰", "t35": "🎓", "t36": "🤝",
    "t37": "👋", "t38": "🎉", "t39": "🎁", "t40": "🏮", "t41": "🎄", "t42": "🙂",
    "t43": "🌿", "t44": "♻️", "t45": "🏘️", "t46": "🙏", "t47": "💬", "t48": "🌟",
}


def _load(rel: str):
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))


def _monthlies(pack: dict, themes: list, raw: dict) -> list:
    if pack["season"] == 1 and raw.get("monthly_reviews"):
        months = raw["monthly_reviews"]
        for m in months:
            m["season"] = 1
        return months
    out = []
    for k in range(3):
        group = themes[k * 4:(k + 1) * 4]
        no = pack["month_start"] + k
        out.append({
            "id": f"m{no}",
            "no": no,
            "season": pack["season"],
            "after_week": group[-1]["week"],
            "themes": [t["id"] for t in group],
            "word_pool": 100,
            "questions": 30,
            "match_groups": 3,
            "xp": 40,
            "cat_unlock": None,
        })
    return out


def _quarterly(pack: dict, themes: list, raw: dict) -> dict:
    if pack["season"] == 1 and raw.get("quarterly_review"):
        q = raw["quarterly_review"]
        q["season"] = 1
        q["after_monthly"] = "m3"
        q["exam_cat"] = pack["exam_cat"]
        return q
    groups = [themes[0:3], themes[3:6], themes[6:8], themes[8:10], themes[10:12]]
    return {
        "id": pack["qid"],
        "season": pack["season"],
        "week": pack["review_week"],
        "emoji": "👑",
        "zh": "季度複習週",
        "map_label_zh": "季度大複習",
        "after_monthly": f"m{pack['season'] * 3}",
        "review_days": [
            {"day": i + 1, "themes": [t["id"] for t in g]} for i, g in enumerate(groups)
        ],
        "review_day_questions": 15,
        "review_day_xp": 20,
        "exam": {
            "day": 6, "zh": "季度大考", "word_pool": 300,
            "questions": 40, "match_groups": 4, "xp": 60,
        },
        "exam_cat": pack["exam_cat"],
    }


def _path_order(pack: dict, themes: list, raw: dict) -> list:
    if pack["season"] == 1 and raw.get("path_order"):
        return list(raw["path_order"])
    ids = [t["id"] for t in themes]
    mids = [f"m{pack['month_start'] + k}" for k in range(3)]
    return ids[0:4] + [mids[0]] + ids[4:8] + [mids[1]] + ids[8:12] + [mids[2]] + [pack["qid"]]


def merge_course() -> tuple:
    words, themes, lessons = [], [], []
    monthlies, quarterlies, seasons = [], [], []
    for pack in PACKS:
        raw = _load(pack["themes"])
        pack_words = _load(pack["words"])
        pack_grammar = _load(pack["grammar"])
        pack_themes = raw["themes"]
        if len(pack_themes) != 12 or len(pack_words) != 300:
            raise SystemExit(f"season {pack['season']}: expected 12 themes and 300 words")
        for w in pack_words:
            w["week"] = int(w["week"]) + pack["offset"]
            w["season"] = pack["season"]
            w["icon"] = f"assets/icons/{w['id']}.png" if find_icon(w["id"]) else None
        for i, t in enumerate(pack_themes):
            t["week"] = int(t["week"]) + pack["offset"]
            t["season"] = pack["season"]
            if not t.get("short_zh"):
                t["short_zh"] = SHORT_ZH.get(t["id"], t["zh"][:4])
            if not t.get("emoji"):
                t["emoji"] = THEME_EMOJI.get(t["id"], "🐾")
            if find_icon(t["id"]):
                t["icon"] = f"assets/icons/{t['id']}.png"
            elif not t.get("icon"):
                t["icon"] = None
            if (i + 1) % 4 == 0 and not t.get("followed_by"):
                t["followed_by"] = f"m{pack['month_start'] + i // 4}"
            elif "followed_by" not in t:
                t["followed_by"] = None
        for g in pack_grammar["lessons"]:
            g["week"] = int(g["week"]) + pack["offset"]
            g["season"] = pack["season"]
            if not g.get("ex"):
                g["ex"] = g.get("exercises") or []
            lessons.append(g)
        monthlies.extend(_monthlies(pack, pack_themes, raw))
        quarterlies.append(_quarterly(pack, pack_themes, raw))
        path = _path_order(pack, pack_themes, raw)
        if len(path) != 16:
            raise SystemExit(f"season {pack['season']}: path has {len(path)} nodes")
        seasons.append({
            "season": pack["season"],
            "zh": raw.get("zh") or pack["zh"],
            "en": raw.get("en") or pack["en"],
            "emoji": raw.get("emoji") or pack["emoji"],
            "subtitle_zh": raw.get("subtitle_zh") or pack["subtitle"],
            "weeks": raw.get("weeks") or pack["weeks"],
            "place_zh": pack["place"],
            "bg": pack["bg"],
            "border": pack["border"],
            "review_id": pack["qid"],
            "review_week": pack["review_week"],
            "exam_cat": pack["exam_cat"],
            "path_order": path,
            "theme_emojis": "".join(t.get("emoji") or "" for t in pack_themes),
        })
        words.extend(pack_words)
        themes.extend(pack_themes)
    for i, w in enumerate(words, 1):
        w["seq"] = i
    ids = [w["id"] for w in words]
    if len(ids) != len(set(ids)):
        raise SystemExit("duplicate word ids across seasons")
    lemmas = [w["word"].lower() for w in words]
    if len(lemmas) != len(set(lemmas)):
        raise SystemExit("duplicate headwords across seasons")
    by_theme = {t["id"]: t for t in themes}
    for w in words:
        t = by_theme[w["theme_id"]]
        if w["week"] != t["week"] or w["season"] != t["season"]:
            raise SystemExit(f"{w['id']}: week/season does not match its theme")
    g_by = {g["id"]: g for g in lessons}
    if len(g_by) != 24:
        raise SystemExit(f"expected 24 grammar lessons, got {len(g_by)}")
    for t in themes:
        if t.get("grammar") and g_by[t["grammar"]]["week"] != t["week"]:
            raise SystemExit(f"{t['id']}: grammar week mismatch")
    if len(monthlies) != 12 or len(quarterlies) != 4:
        raise SystemExit("expected 12 monthly reviews and 4 quarterly reviews")
    copy = _load("content/s1-s4-copy.json")
    if len(copy.get("outings") or []) != 48 or len(copy.get("diaries") or []) != 4:
        raise SystemExit("copy must have 48 outings and 4 diaries")
    theme_ids = {t["id"] for t in themes}
    for o in copy["outings"]:
        if o["theme_id"] not in theme_ids:
            raise SystemExit("outing theme missing: " + o["theme_id"])
    themes_obj = {
        "seasons": seasons,
        "themes": themes,
        "monthly_reviews": monthlies,
        "quarterly_reviews": quarterlies,
        "quarterly_review": quarterlies[0],
        "path_order": seasons[0]["path_order"],
        "later_seasons": [],
        "copy": {
            "rule": copy.get("rule") or "",
            "map": copy["map"],
            "monthly": copy["monthly"],
            "diaries": copy["diaries"],
            "outings": copy["outings"],
        },
    }
    grammar_obj = {"lessons": lessons}
    return words, themes_obj, grammar_obj


def write_data() -> None:
    words, themes, grammar = merge_course()
    cats = json.loads((HAND / "data" / "cats.json").read_text(encoding="utf-8"))
    svg_dir = OUT / "icons-svg"
    svg_ids = sorted(p.stem for p in svg_dir.glob("*.svg")) if svg_dir.is_dir() else []
    data = {"words": words, "themes": themes, "grammar": grammar, "cats": cats, "svgIds": svg_ids}
    text = "window.LAZYCAT_DATA=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (ROOT / "js" / "data.js").write_text(text, encoding="utf-8")
    icons = sum(1 for w in words if w.get("icon"))
    print(f"  js/data.js  {len(text)/1024:.0f} KB  words={len(words)} themes={len(themes['themes'])} grammar={len(grammar['lessons'])} icons={icons} svgIds={len(svg_ids)}")


def cache_bust() -> None:
    index = ROOT / "index.html"
    html = index.read_text(encoding="utf-8")
    blob = b""
    for rel in ("css/app.css", "js/data.js", "js/core.js", "js/lesson.js", "js/ui.js", "js/boot.js"):
        blob += (ROOT / rel).read_bytes()
    ver = hashlib.sha256(blob).hexdigest()[:10]
    import re
    html = re.sub(r"\?v=[^\"']+", "?v=" + ver, html)
    html = html.replace("__BUILD__", ver)
    index.write_text(html, encoding="utf-8")
    print("  cache", ver)


def main() -> None:
    print("copy assets")
    OUT.mkdir(exist_ok=True)
    for name in ("cats", "poses", "icons", "icons-svg", "meows"):
        copy_dir(name)
    extra_icons = ROOT / "handoff-s2" / "assets" / "icons"
    if extra_icons.is_dir():
        dest = OUT / "icons"
        dest.mkdir(exist_ok=True)
        for png in extra_icons.glob("*.png"):
            shutil.copy2(png, dest / png.name)
    if FONTS.exists():
        shutil.rmtree(FONTS)
    lic = FONTS / "licenses"
    shutil.copytree(SRC / "fonts" / "licenses", lic)
    note = (SRC / "fonts" / "LICENSES.md").read_text(encoding="utf-8")
    note += (
        "\n\nThe published site ships **subset WOFF2** files, not the original TTFs.\n"
        "`LazyCatRound.woff2` is a subset of jf open 粉圓. The Reserved Font Names "
        "\"huninn\" and \"open huninn\" are not used; the family name is **LazyCatRound**.\n"
    )
    (FONTS / "LICENSES.md").write_text(note, encoding="utf-8")
    print("subset fonts")
    text = gather_text()
    latin = "".join(ch for ch in text if ord(ch) < 512)
    subset_font(SRC / "fonts" / "jf-openhuninn-2.1.ttf", FONTS / "LazyCatRound.woff2", text, "LazyCatRound")
    subset_font(SRC / "fonts" / "Baloo2-VariableFont_wght.ttf", FONTS / "Baloo2.woff2", latin)
    subset_font(SRC / "fonts" / "Nunito-VariableFont_wght.ttf", FONTS / "Nunito.woff2", latin)
    subset_font(SRC / "fonts" / "NotoSans-VariableFont_wdth-wght.ttf", FONTS / "NotoSans.woff2", text)
    print("data + icons")
    write_data()
    favicon()
    cache_bust()
    print("OK")


if __name__ == "__main__":
    main()
