#!/usr/bin/env python3
"""Slice Season 2 5×5 sticker sheets into per-word PNGs.

Sheets are 1280×720. Each card is one cell, left to right, top to bottom,
matching that theme's Day 1–5 word order. The English caption under the
drawing is dropped. Weak cells are not redrawn.

t13–t16 icons already on main are reused and are not sliced here.
When a theme has both a final sheet and a *-original.jpg, the final sheet
is the one named below.

Run from anywhere:

    python3 handoff-s2/tools/slice_stickers.py
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage as nd

ROOT = Path(__file__).resolve().parents[1]
SHEETS = ROOT / "assets" / "sticker-sheets"
OUT = ROOT / "assets" / "icons"
WORDS = ROOT / "data" / "season2-words.json"

# Card bounds measured from the white cards on these sheets (not a naive
# equal split — the wooden margin is uneven).
XS = [(24, 260), (278, 508), (524, 750), (768, 986), (1006, 1246)]
YS = [(14, 162), (170, 302), (310, 440), (448, 564), (572, 704)]

# Final sheet only. Originals (t14-original.jpg, t16-original.jpg, …) are kept
# beside these files and are not used.
FINAL = {
    "t17": "t17-shopping-sheet.jpg",
    "t18": "t18-money-sheet.jpg",
    "t19": "t19-restaurant-sheet.jpg",
    "t20": "t20-health-sheet.jpg",
    "t21": "t21-sports-sheet.jpg",
    "t22": "t22-hobbies-sheet.jpg",
    "t23": "t23-travel-sheet.jpg",
    "t24": "t24-phone-internet-sheet.jpg",
}


def words_for(words: list, theme: str) -> list:
    rows = [w for w in words if w["theme_id"] == theme]
    rows.sort(key=lambda w: (w["day"], w["order"]))
    if len(rows) != 25:
        raise SystemExit(f"{theme}: expected 25 words, got {len(rows)}")
    return rows


def extract(cell: Image.Image) -> Image.Image:
    rgb = np.asarray(cell.convert("RGB")).astype(np.float32)
    h, w = rgb.shape[:2]
    inset = 3
    rgb = rgb[inset:h - inset, inset:w - inset]
    h, w = rgb.shape[:2]
    corners = np.concatenate([
        rgb[1:6, 1:6].reshape(-1, 3),
        rgb[1:6, -6:-1].reshape(-1, 3),
        rgb[-6:-1, 1:6].reshape(-1, 3),
        rgb[-6:-1, -6:-1].reshape(-1, 3),
    ], axis=0)
    bg = np.median(corners, axis=0)
    dist = np.linalg.norm(rgb - bg, axis=2)
    mask = nd.binary_opening(dist > 26, iterations=1)
    lab, n = nd.label(mask)
    keep = np.zeros(mask.shape, bool)
    if n:
        objs = nd.find_objects(lab)
        areas = nd.sum(mask, lab, range(1, n + 1))
        for i, (sl, area) in enumerate(zip(objs, areas), start=1):
            if sl is None or area < 12:
                continue
            y0, y1 = sl[0].start, sl[0].stop
            cy = (y0 + y1) / 2
            bh = y1 - y0
            # Caption sits in a short band along the bottom of the card.
            if cy > h * 0.78 and bh < h * 0.22:
                continue
            keep |= lab == i
    if int(keep.sum()) < 30:
        keep = mask.copy()
        keep[int(h * 0.78):, :] = False
    sil = nd.binary_fill_holes(nd.binary_closing(keep, iterations=2))
    sil = nd.binary_opening(sil, iterations=1) | keep
    ys, xs = np.where(sil)
    if len(ys) == 0:
        return Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    y0, y1 = int(ys.min()), int(ys.max()) + 1
    x0, x1 = int(xs.min()), int(xs.max()) + 1
    crop = rgb[y0:y1, x0:x1]
    d = dist[y0:y1, x0:x1]
    silc = sil[y0:y1, x0:x1]
    ramp = np.clip((d - 8) / 36.0, 0, 1)
    inner = nd.binary_erosion(silc, iterations=1)
    band = nd.binary_dilation(silc, iterations=1) & ~inner
    alpha = np.where(inner, 1.0, np.where(band, np.maximum(ramp, 0.45), 0.0)).astype(np.float32)
    alpha = np.clip(nd.gaussian_filter(alpha, 0.55), 0, 1)
    aa = np.maximum(alpha, 1e-3)[..., None]
    col = np.clip((crop - (1 - aa) * bg) / aa, 0, 255)
    col = np.where(alpha[..., None] > 0.96, crop, col)
    out = np.dstack([col, alpha * 255]).astype(np.uint8)
    ih, iw = out.shape[:2]
    side = int(max(ih, iw) * 1.08)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(Image.fromarray(out, "RGBA"), ((side - iw) // 2, (side - ih) // 2))
    return canvas.resize((256, 256), Image.Resampling.LANCZOS)


def main() -> None:
    words = json.loads(WORDS.read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    n = 0
    for theme, name in FINAL.items():
        sheet = Image.open(SHEETS / name).convert("RGB")
        for i, word in enumerate(words_for(words, theme)):
            r, c = divmod(i, 5)
            x0, x1 = XS[c]
            y0, y1 = YS[r]
            icon = extract(sheet.crop((x0, y0, x1, y1)))
            icon.save(OUT / f"{word['id']}.png", optimize=True)
            n += 1
        print(f"  {name} -> {theme} 25 icons")
    print(f"OK: sliced {n} icons into {OUT.relative_to(ROOT.parent)}")


if __name__ == "__main__":
    main()
