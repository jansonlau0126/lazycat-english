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


def gather_text() -> str:
    chunks = []
    for p in (HAND / "data").glob("*.json"):
        if p.name.startswith("legacy"):
            continue
        chunks.append(p.read_text(encoding="utf-8"))
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


def write_data() -> None:
    words = json.loads((HAND / "data" / "season1-words.json").read_text(encoding="utf-8"))
    themes = json.loads((HAND / "data" / "season1-themes.json").read_text(encoding="utf-8"))
    grammar = json.loads((HAND / "data" / "season1-grammar.json").read_text(encoding="utf-8"))
    cats = json.loads((HAND / "data" / "cats.json").read_text(encoding="utf-8"))
    icon_dir = SRC / "icons"
    for w in words:
        png = icon_dir / f"{w['id']}.png"
        if png.exists():
            w["icon"] = f"assets/icons/{w['id']}.png"
        elif not w.get("icon"):
            w["icon"] = None
    for t in themes.get("themes", []):
        png = icon_dir / f"{t['id']}.png"
        if png.exists():
            t["icon"] = f"assets/icons/{t['id']}.png"
    svg_dir = OUT / "icons-svg"
    svg_ids = sorted(p.stem for p in svg_dir.glob("*.svg")) if svg_dir.is_dir() else []
    data = {"words": words, "themes": themes, "grammar": grammar, "cats": cats, "svgIds": svg_ids}
    text = "window.LAZYCAT_DATA=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n"
    (ROOT / "js" / "data.js").write_text(text, encoding="utf-8")
    print(f"  js/data.js  {len(text)/1024:.0f} KB  svgIds={len(svg_ids)}")


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
