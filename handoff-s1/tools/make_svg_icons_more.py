#!/usr/bin/env python3
"""SVG icons for themes 2–4: body, home, daily routine. Same palette as theme 1."""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import make_svg_icons as d

st, svg = d.st, d.svg
C, O, OL, S, P, PL, L, K, M, CR, W = d.C, d.O, d.OL, d.S, d.P, d.PL, d.L, d.K, d.M, d.CR, d.W
head, paw, heart, star = d.head, d.paw, d.heart, d.star
torso = d.body

def R(x, y, w, h, fill, rx=8, sw=4):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" {st(sw)}/>'

def E(cx, cy, rx, ry, fill, sw=4):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{fill}" {st(sw)}/>'

def Pth(path, fill="none", sw=4):
    return f'<path d="{path}" fill="{fill}" {st(sw)}/>'

def spark(cx, cy, s=1):
    return (
        f'<path d="M{cx} {cy-7*s} V{cy+7*s} M{cx-6*s} {cy} H{cx+6*s}" stroke="{S}" stroke-width="3" stroke-linecap="round"/>'
    )

ICONS = {}

# ---- t02 身體 ----
ICONS["head"] = head(64, 70, 36, O, "happy")
ICONS["face"] = (
    E(64, 68, 36, 40, OL)
    + f'<ellipse cx="48" cy="78" rx="8" ry="5" fill="{P}" opacity=".9"/>'
    + f'<ellipse cx="80" cy="78" rx="8" ry="5" fill="{P}" opacity=".9"/>'
    + f'<circle cx="50" cy="62" r="5" fill="{C}"/>'
    + f'<circle cx="78" cy="62" r="5" fill="{C}"/>'
    + f'<circle cx="48" cy="60" r="1.6" fill="{W}"/>'
    + f'<circle cx="76" cy="60" r="1.6" fill="{W}"/>'
    + Pth("M46 88 Q64 102 82 88", sw=3.5)
)
ICONS["hair"] = (
    Pth("M34 78 C28 40 48 18 70 28 C88 12 108 40 96 78", fill=S)
    + R(78, 86, 36, 10, O, 4, 3)
    + f'<path d="M86 86 V70 M96 86 V66 M106 86 V72" {st(3)}/>'
    + f'<rect x="74" y="78" width="44" height="8" rx="3" fill="{OL}" {st(3)}/>'
)
ICONS["eye"] = (
    E(64, 66, 36, 26, W)
    + f'<circle cx="64" cy="66" r="14" fill="{K}"/>'
    + f'<circle cx="64" cy="66" r="7" fill="{C}"/>'
    + f'<circle cx="58" cy="60" r="3.5" fill="{W}"/>'
    + Pth("M28 40 Q64 24 100 40", sw=3.5)
    + spark(104, 28, 0.8)
)
ICONS["ear"] = (
    f'<path d="M64 110 L24 28 L104 36 Z" fill="{O}" {st()}/>'
    + f'<path d="M64 96 L40 40 L88 46 Z" fill="{P}"/>'
    + Pth("M108 48 q14 12 0 24", sw=3)
    + Pth("M116 36 q20 18 0 38", sw=3)
)
ICONS["nose"] = (
    f'<path d="M64 58 l-16 14 h32 Z" fill="{P}" {st()}/>'
    + Pth("M28 78 H52 M76 78 H100", sw=3)
    + Pth("M30 90 H50 M78 90 H98", sw=3)
    + f'<circle cx="64" cy="78" r="3" fill="{C}"/>'
)
ICONS["mouth"] = (
    E(64, 70, 40, 28, OL)
    + Pth("M34 66 Q64 92 94 66", fill=P, sw=3)
    + E(64, 84, 10, 7, "#E07A8A", 3)
)
ICONS["tooth"] = (
    f'<path d="M40 36 H88 L80 96 Q64 108 48 96 Z" fill="{W}" {st()}/>'
    + spark(96, 28)
    + spark(28, 48, 0.7)
)
ICONS["neck"] = (
    E(64, 78, 22, 28, OL)
    + f'<path d="M28 70 Q64 54 100 70 L96 92 Q64 80 32 92 Z" fill="{P}" {st()}/>'
    + f'<path d="M64 70 L58 100 L70 100 Z" fill="{S}" {st(3)}/>'
)
ICONS["shoulder"] = (
    f'<path d="M18 96 Q52 36 108 58" fill="none" {st(8)}/>'
    + f'<path d="M46 58 Q72 34 98 52 L92 78 Q66 62 42 76 Z" fill="{S}" {st()}/>'
    + E(34, 84, 16, 14, OL, 3)
)
ICONS["arm"] = (
    f'<path d="M36 96 Q28 60 48 40 Q70 28 78 48" fill="{OL}" {st()}/>'
    + E(78, 36, 16, 16, OL)
    + heart(100, 28, 0.55, P)
)
ICONS["hand"] = (
    E(64, 78, 28, 22, OL)
    + f'<rect x="34" y="28" width="12" height="40" rx="6" fill="{OL}" {st(3)}/>'
    + f'<rect x="48" y="18" width="12" height="48" rx="6" fill="{OL}" {st(3)}/>'
    + f'<rect x="62" y="22" width="12" height="44" rx="6" fill="{OL}" {st(3)}/>'
    + f'<rect x="76" y="32" width="12" height="36" rx="6" fill="{OL}" {st(3)}/>'
    + E(40, 78, 10, 14, OL, 3)
)
ICONS["finger"] = (
    f'<path d="M70 108 Q40 90 46 48 Q50 28 64 30 Q78 32 74 52 L86 96 Z" fill="{OL}" {st()}/>'
    + R(48, 58, 22, 12, W, 3, 3)
    + f'<rect x="52" y="61" width="14" height="6" rx="2" fill="{P}"/>'
)
ICONS["leg"] = (
    f'<path d="M48 24 H78 L86 78 L70 80 L64 50 L46 92 L30 84 Z" fill="{OL}" {st()}/>'
    + f'<circle cx="34" cy="100" r="16" fill="{S}" {st()}/>'
    + f'<path d="M26 100 H42" {st(3)}/>'
)
ICONS["foot"] = (
    E(64, 78, 36, 22, OL)
    + f'<circle cx="40" cy="48" r="8" fill="{OL}" {st(3)}/>'
    + f'<circle cx="54" cy="40" r="8" fill="{OL}" {st(3)}/>'
    + f'<circle cx="70" cy="40" r="8" fill="{OL}" {st(3)}/>'
    + f'<circle cx="84" cy="48" r="8" fill="{OL}" {st(3)}/>'
)
ICONS["body"] = (
    torso(64, 86, O, 28, 34)
    + head(64, 40, 22, O, "happy")
    + f'<path d="M40 100 Q28 112 36 118" {st(3)} fill="none"/>'
)
ICONS["back"] = (
    E(64, 78, 30, 36, O)
    + f'<path d="M40 48 L28 18 L52 40 Z" fill="{O}" {st()}/>'
    + f'<path d="M88 48 L100 18 L76 40 Z" fill="{O}" {st()}/>'
    + f'<path d="M90 100 Q112 80 104 60" {st()} fill="none"/>'
)
ICONS["stomach"] = (
    E(64, 72, 40, 36, OL)
    + E(64, 78, 18, 14, P)
    + head(64, 28, 16, O, "happy")
)
ICONS["knee"] = (
    f'<path d="M40 20 H68 L78 58 Q88 78 70 96 H46 L36 58 Z" fill="{OL}" {st()}/>'
    + R(46, 52, 28, 16, W, 4, 3)
    + f'<rect x="52" y="56" width="16" height="8" rx="2" fill="{P}"/>'
)
ICONS["toe"] = (
    E(64, 86, 34, 18, OL)
    + f'<circle cx="36" cy="58" r="9" fill="{OL}" {st(3)}/>'
    + f'<circle cx="50" cy="48" r="9" fill="{OL}" {st(3)}/>'
    + f'<circle cx="66" cy="44" r="9" fill="{OL}" {st(3)}/>'
    + f'<circle cx="82" cy="50" r="9" fill="{OL}" {st(3)}/>'
    + f'<circle cx="94" cy="64" r="8" fill="{OL}" {st(3)}/>'
)
ICONS["see"] = (
    head(64, 78, 28, O, "open")
    + f'<circle cx="42" cy="52" r="16" fill="{K}" {st()}/>'
    + f'<circle cx="86" cy="52" r="16" fill="{K}" {st()}/>'
    + f'<path d="M58 52 H70" {st()}/>'
    + f'<circle cx="42" cy="52" r="6" fill="{W}"/>'
    + f'<circle cx="86" cy="52" r="6" fill="{W}"/>'
)
ICONS["hear"] = (
    head(58, 74, 28, O, "open")
    + paw(96, 48, 0.7, OL, 20)
    + Pth("M18 40 q8 10 0 18", sw=3)
    + f'<circle cx="108" cy="30" r="4" fill="{S}" {st(3)}/>'
    + f'<circle cx="112" cy="48" r="3" fill="{L}" {st(3)}/>'
)
ICONS["smell"] = (
    head(48, 74, 26, O, "happy")
    + E(96, 58, 8, 16, P)
    + f'<circle cx="96" cy="36" r="12" fill="{S}" {st()}/>'
    + f'<path d="M96 48 V70" {st(3)}/>'
    + Pth("M70 62 Q80 58 88 64", sw=3)
)
ICONS["touch"] = (
    paw(78, 80, 1.3, OL, 0)
    + f'<path d="M36 100 Q30 60 48 40" fill="none" {st()}/>'
    + E(46, 32, 10, 12, OL, 3)
    + spark(100, 36, 0.7)
)
ICONS["taste"] = (
    E(46, 78, 22, 16, P)
    + f'<path d="M36 74 Q46 88 58 72" fill="#E07A8A" {st(3)}/>'
    + E(92, 48, 16, 22, S)
    + f'<rect x="86" y="66" width="12" height="36" rx="4" fill="{OL}" {st(3)}/>'
)

# ---- t03 屋企 ----
ICONS["home"] = (
    f'<path d="M18 62 L64 28 L110 62" fill="{P}" {st()}/>'
    + R(32, 60, 64, 48, CR, 6)
    + R(56, 78, 16, 30, O, 3, 3)
    + head(64, 40, 12, O, "happy")
)
ICONS["flat"] = (
    R(36, 18, 56, 96, K, 8)
    + R(46, 30, 14, 12, S, 2, 3)
    + R(68, 30, 14, 12, W, 2, 3)
    + R(46, 52, 14, 12, W, 2, 3)
    + R(68, 52, 14, 12, S, 2, 3)
    + R(46, 74, 14, 12, W, 2, 3)
    + R(68, 74, 14, 12, O, 2, 3)
)
ICONS["bedroom"] = (
    R(22, 70, 84, 28, K, 8)
    + R(28, 60, 28, 16, W, 6, 3)
    + R(58, 64, 40, 12, PL, 6, 3)
    + f'<path d="M18 40 H110" {st(3)}/>'
    + f'<path d="M30 40 V24 H58 V40" fill="{S}" {st(3)}/>'
)
ICONS["kitchen"] = (
    R(24, 58, 80, 46, CR, 8)
    + E(64, 58, 22, 10, O, 3)
    + Pth("M48 40 Q64 22 80 40", sw=3)
    + Pth("M56 36 Q64 24 72 36", sw=3)
    + f'<rect x="40" y="78" width="48" height="8" rx="3" fill="{S}"/>'
)
ICONS["bathroom"] = (
    E(64, 78, 40, 22, K)
    + E(64, 74, 30, 12, W, 3)
    + f'<circle cx="48" cy="70" r="5" fill="{PL}" {st(3)}/>'
    + f'<circle cx="64" cy="66" r="6" fill="{PL}" {st(3)}/>'
    + f'<circle cx="80" cy="72" r="5" fill="{P}" {st(3)}/>'
)
ICONS["bed"] = (
    R(20, 64, 88, 36, M, 10)
    + R(24, 52, 24, 20, W, 6, 3)
    + f'<path d="M48 70 H100" {st(3)}/>'
    + f'<path d="M20 64 V40 M108 64 V40" {st()}/>'
)
ICONS["table"] = (
    E(64, 62, 40, 14, O)
    + f'<path d="M36 70 L28 108 M92 70 L100 108" {st()}/>'
    + E(64, 48, 6, 10, P, 3)
    + f'<path d="M64 38 V28" {st(3)}/>'
)
ICONS["chair"] = (
    R(36, 48, 56, 14, O, 6)
    + R(40, 22, 48, 30, S, 8)
    + f'<path d="M42 62 V108 M86 62 V108" {st()}/>'
    + E(64, 58, 16, 6, P, 3)
)
ICONS["sofa"] = (
    R(16, 58, 96, 36, P, 16)
    + R(16, 46, 18, 40, P, 8)
    + R(94, 46, 18, 40, P, 8)
    + head(64, 62, 14, O, "shut")
    + E(64, 84, 22, 8, PL, 3)
)
ICONS["desk"] = (
    R(18, 62, 92, 14, O, 4)
    + f'<path d="M28 76 V108 M100 76 V108" {st()}/>'
    + R(70, 36, 22, 26, S, 3, 3)
    + E(40, 48, 8, 12, K, 3)
    + f'<path d="M40 36 V28" {st(3)}/>'
)
ICONS["door"] = (
    R(34, 18, 60, 96, O, 8)
    + f'<circle cx="80" cy="70" r="5" fill="{S}" {st(3)}/>'
    + f'<path d="M34 18 H28 V114 H94" {st()} fill="none"/>'
)
ICONS["window"] = (
    R(24, 24, 80, 72, K, 8)
    + f'<path d="M64 24 V96 M24 60 H104" {st()}/>'
    + f'<path d="M30 108 Q64 88 98 108" fill="{P}" {st(3)}/>'
    + f'<circle cx="64" cy="40" r="8" fill="{S}"/>'
)
ICONS["floor"] = (
    f'<path d="M16 78 L112 78 L96 108 H32 Z" fill="{S}" {st()}/>'
    + f'<path d="M40 78 L32 108 M64 78 L64 108 M88 78 L96 108" {st(3)}/>'
    + E(64, 96, 18, 8, P, 3)
)
ICONS["wall"] = (
    R(16, 28, 96, 72, "#E7D3C0", 4)
    + f'<path d="M16 52 H112 M16 76 H112 M48 28 V100 M80 28 V100" {st(3)}/>'
    + R(50, 40, 28, 22, K, 3, 3)
)
ICONS["lamp"] = (
    f'<path d="M40 48 H88 L80 70 H48 Z" fill="{S}" {st()}/>'
    + f'<path d="M64 70 V100" {st()}/>'
    + E(64, 104, 22, 8, O, 3)
    + f'<circle cx="64" cy="36" r="6" fill="{S}"/>'
)
ICONS["fridge"] = (
    R(34, 16, 60, 96, K, 8)
    + f'<path d="M34 58 H94" {st()}/>'
    + f'<path d="M78 32 V46 M78 74 V92" {st(3)}/>'
    + f'<circle cx="48" cy="36" r="4" fill="{P}"/>'
    + f'<circle cx="58" cy="40" r="3" fill="{S}"/>'
)
ICONS["fan"] = (
    f'<circle cx="64" cy="58" r="8" fill="{O}" {st()}/>'
    + E(64, 30, 14, 20, K, 3)
    + E(36, 74, 20, 14, K, 3)
    + E(92, 74, 20, 14, K, 3)
    + f'<path d="M64 90 V112 M48 112 H80" {st()}/>'
)
ICONS["cupboard"] = (
    R(22, 28, 84, 72, S, 8)
    + f'<path d="M64 28 V100" {st()}/>'
    + f'<circle cx="56" cy="64" r="3" fill="{O}"/>'
    + f'<circle cx="72" cy="64" r="3" fill="{O}"/>'
    + f'<path d="M30 40 H50 M78 40 H98" {st(3)}/>'
)
ICONS["shelf"] = (
    f'<path d="M20 46 H108 M20 78 H108" {st()}/>'
    + R(28, 28, 16, 18, K, 2, 3)
    + R(48, 24, 14, 22, O, 2, 3)
    + R(66, 30, 18, 16, P, 2, 3)
    + E(48, 64, 8, 12, M, 3)
    + f'<path d="M48 52 V64" {st(3)}/>'
)
ICONS["pillow"] = (
    E(64, 72, 40, 26, PL)
    + head(64, 64, 16, O, "shut")
    + Pth("M96 40 q8 -8 6 6", sw=3)
    + Pth("M104 32 q6 -6 4 4", sw=3)
)
ICONS["comfortable"] = (
    E(64, 86, 42, 16, P)
    + torso(64, 70, O, 26, 16)
    + head(64, 48, 18, O, "shut")
    + f'<path d="M40 64 Q28 50 36 44" {st(3)} fill="none"/>'
    + f'<path d="M88 64 Q100 50 92 44" {st(3)} fill="none"/>'
)
ICONS["clean"] = (
    E(64, 74, 28, 8, K, 3)
    + f'<path d="M36 74 Q64 96 92 74" fill="{W}" {st()}/>'
    + spark(28, 36)
    + spark(100, 40, 0.8)
    + spark(64, 24, 0.7)
)
ICONS["messy"] = (
    R(30, 70, 28, 18, P, 4, 3)
    + R(52, 58, 30, 16, S, 4, 3)
    + R(40, 80, 36, 16, K, 4, 3)
    + head(92, 48, 16, O, "open")
    + Pth("M78 40 Q86 32 92 38", sw=3)
)
ICONS["key"] = (
    f'<circle cx="46" cy="52" r="20" fill="{S}" {st()}/>'
    + paw(46, 52, 0.55, O, 0)
    + f'<path d="M64 52 H108" {st()}/>'
    + f'<path d="M96 52 V68 M108 52 V64" {st()}/>'
)
ICONS["lift"] = (
    R(28, 16, 72, 96, K, 10)
    + f'<path d="M64 28 V100" {st()}/>'
    + f'<path d="M46 40 L46 28 L40 34 M46 28 L52 34" {st(3)} fill="none"/>'
    + f'<path d="M82 88 L82 100 L76 94 M82 100 L88 94" {st(3)} fill="none"/>'
)

# ---- t04 日常作息 ----
ICONS["wake"] = (
    head(58, 74, 26, O, "happy")
    + f'<path d="M34 90 Q22 70 40 62" {st()} fill="none"/>'
    + f'<path d="M86 88 Q104 68 90 56" {st()} fill="none"/>'
    + f'<circle cx="100" cy="30" r="12" fill="{S}" {st()}/>'
)
ICONS["alarm"] = (
    f'<circle cx="64" cy="68" r="32" fill="{W}" {st()}/>'
    + f'<path d="M64 68 L64 48 M64 68 L80 76" {st()}/>'
    + f'<circle cx="28" cy="40" r="12" fill="{S}" {st()}/>'
    + f'<circle cx="100" cy="40" r="12" fill="{S}" {st()}/>'
    + f'<path d="M48 100 H80" {st()}/>'
)
ICONS["brush"] = (
    R(58, 28, 16, 70, K, 6)
    + f'<path d="M54 24 H78 L74 40 H58 Z" fill="{W}" {st(3)}/>'
    + f'<circle cx="40" cy="78" r="8" fill="{PL}" {st(3)}/>'
    + f'<circle cx="30" cy="64" r="6" fill="{PL}" opacity=".8"/>'
)
ICONS["wash"] = (
    paw(48, 78, 1.15, OL, -10)
    + E(86, 70, 18, 14, K, 3)
    + f'<circle cx="78" cy="62" r="6" fill="{W}" {st(3)}/>'
    + f'<circle cx="96" cy="74" r="5" fill="{W}" {st(3)}/>'
    + spark(64, 36, 0.7)
)
ICONS["breakfast"] = (
    E(40, 78, 22, 12, S)
    + f'<path d="M28 70 Q40 58 52 70" fill="{O}" {st(3)}/>'
    + E(88, 74, 16, 18, W, 3)
    + f'<circle cx="88" cy="74" r="6" fill="{S}"/>'
    + f'<rect x="70" y="40" width="36" height="8" rx="3" fill="{O}" {st(3)}/>'
)
ICONS["shower"] = (
    E(64, 36, 22, 10, K)
    + f'<path d="M64 26 V16" {st()}/>'
    + f'<path d="M48 50 V78 M64 48 V84 M80 50 V76" {st(3)}/>'
    + f'<circle cx="48" cy="84" r="3" fill="{K}"/>'
    + f'<circle cx="64" cy="90" r="3" fill="{K}"/>'
    + f'<circle cx="80" cy="82" r="3" fill="{K}"/>'
)
ICONS["lunch"] = (
    R(28, 40, 72, 48, O, 10)
    + R(36, 48, 24, 16, M, 4, 3)
    + E(78, 58, 12, 8, S, 3)
    + f'<path d="M40 28 H88" {st()}/>'
)
ICONS["dinner"] = (
    E(64, 78, 36, 12, O)
    + E(64, 62, 22, 16, P, 3)
    + Pth("M48 48 Q64 30 80 48", sw=3)
    + Pth("M56 44 Q64 32 72 44", sw=3)
)
ICONS["bedtime"] = (
    f'<circle cx="40" cy="40" r="16" fill="{S}" {st()}/>'
    + f'<circle cx="48" cy="36" r="14" fill="{CR}"/>'
    + f'<circle cx="86" cy="78" r="28" fill="{W}" {st()}/>'
    + f'<path d="M86 78 V62 M86 78 L98 86" {st()}/>'
)
ICONS["sleep"] = (
    torso(70, 86, O, 34, 18)
    + head(40, 74, 20, O, "shut")
    + Pth("M96 36 q8 -10 4 6", sw=3)
    + Pth("M108 24 q8 -10 4 6", sw=3)
    + Pth("M118 14 q6 -8 3 5", sw=3)
)
ICONS["morning"] = (
    f'<path d="M16 84 H112" {st()}/>'
    + f'<path d="M24 84 Q40 60 56 84" fill="{M}" {st(3)}/>'
    + f'<circle cx="86" cy="48" r="16" fill="{S}" {st()}/>'
    + E(40, 100, 14, 8, O, 3)
)
ICONS["afternoon"] = (
    f'<circle cx="36" cy="40" r="16" fill="{S}" {st()}/>'
    + f'<path d="M20 40 H8 M36 22 V12 M52 40 H64" {st(3)}/>'
    + E(88, 80, 22, 12, W, 3)
    + f'<path d="M74 80 H102" {st(3)}/>'
    + f'<rect x="84" y="68" width="8" height="12" rx="2" fill="{O}" {st(3)}/>'
)
ICONS["evening"] = (
    f'<circle cx="30" cy="86" r="22" fill="{O}" {st()}/>'
    + R(48, 48, 14, 48, L, 2, 3)
    + R(68, 36, 12, 60, P, 2, 3)
    + R(86, 52, 16, 44, K, 2, 3)
    + f'<circle cx="100" cy="28" r="3" fill="{S}"/>'
    + f'<circle cx="78" cy="22" r="2" fill="{S}"/>'
)
ICONS["night"] = (
    f'<path d="M70 24 A28 28 0 1 0 96 70 A22 22 0 1 1 70 24 Z" fill="{S}" {st()}/>'
    + f'<circle cx="36" cy="36" r="3" fill="{S}"/>'
    + f'<circle cx="28" cy="58" r="2" fill="{S}"/>'
    + f'<circle cx="48" cy="70" r="2.4" fill="{L}"/>'
)
ICONS["early"] = (
    f'<circle cx="64" cy="70" r="28" fill="{W}" {st()}/>'
    + f'<path d="M64 70 L64 52" {st()}/>'
    + head(28, 40, 14, O, "open")
    + f'<path d="M18 28 Q28 18 36 30" fill="{S}" {st(3)}/>'
)
ICONS["always"] = (
    f'<circle cx="64" cy="64" r="34" fill="{W}" {st()}/>'
    + f'<path d="M64 64 L64 42 M64 64 L80 74" {st()}/>'
    + f'<path d="M96 40 A40 40 0 0 0 40 24" fill="none" {st()}/>'
    + f'<path d="M40 24 L48 20 L46 30" fill="{O}" {st(3)}/>'
)
ICONS["usually"] = (
    R(28, 24, 72, 80, W, 10)
    + f'<rect x="28" y="24" width="72" height="16" rx="8" fill="{O}"/>'
    + "".join(f'<circle cx="{44 + (i%3)*18}" cy="{58 + (i//3)*16}" r="5" fill="{M if i < 5 else CR}" {st(3)}/>' for i in range(6))
)
ICONS["often"] = (
    R(28, 24, 72, 80, W, 10)
    + f'<rect x="28" y="24" width="72" height="16" rx="8" fill="{P}"/>'
    + paw(46, 62, 0.45, O, 0)
    + paw(70, 62, 0.45, O, 0)
    + paw(58, 86, 0.45, O, 0)
)
ICONS["sometimes"] = (
    R(28, 24, 72, 80, W, 10)
    + f'<rect x="28" y="24" width="72" height="16" rx="8" fill="{K}"/>'
    + f'<circle cx="48" cy="64" r="6" fill="{M}" {st(3)}/>'
    + f'<circle cx="80" cy="86" r="6" fill="{M}" {st(3)}/>'
    + f'<circle cx="48" cy="86" r="6" fill="{CR}" {st(3)}/>'
    + f'<circle cx="80" cy="64" r="6" fill="{CR}" {st(3)}/>'
)
ICONS["never"] = (
    f'<circle cx="64" cy="70" r="30" fill="{W}" {st()}/>'
    + f'<path d="M44 50 L84 90 M84 50 L44 90" stroke="#E07A7A" stroke-width="6" stroke-linecap="round"/>'
    + head(64, 28, 14, O, "shut")
)
ICONS["busy"] = (
    head(64, 70, 24, O, "open")
    + R(18, 28, 22, 28, K, 3, 3)
    + f'<circle cx="100" cy="36" r="16" fill="{W}" {st(3)}/>'
    + f'<path d="M100 36 V26 M100 36 L108 42" {st(3)}/>'
    + R(86, 70, 28, 22, S, 3, 3)
)
ICONS["late"] = (
    head(40, 74, 22, O, "open")
    + f'<path d="M58 80 L86 64" {st()}/>'
    + f'<circle cx="96" cy="48" r="20" fill="{W}" {st()}/>'
    + f'<path d="M96 48 V36 M96 48 L106 54" {st()}/>'
)
ICONS["forget"] = (
    head(48, 78, 26, O, "open")
    + E(96, 40, 22, 16, W)
    + f'<circle cx="90" cy="40" r="2" fill="{C}"/>'
    + f'<circle cx="100" cy="40" r="2" fill="{C}"/>'
    + f'<circle cx="96" cy="48" r="2" fill="{C}"/>'
)
ICONS["relax"] = (
    E(70, 90, 36, 12, S)
    + torso(64, 74, O, 30, 14)
    + head(36, 66, 16, O, "shut")
    + f'<path d="M16 40 H40" {st(3)}/>'
    + f'<circle cx="100" cy="36" r="10" fill="{S}" {st(3)}/>'
)
ICONS["weekend"] = (
    R(24, 28, 80, 76, W, 10)
    + f'<rect x="24" y="28" width="80" height="16" rx="8" fill="{P}"/>'
    + f'<circle cx="48" cy="78" r="10" fill="{PL}" {st(3)}/>'
    + f'<circle cx="80" cy="78" r="10" fill="{PL}" {st(3)}/>'
    + heart(48, 76, 0.35, P)
    + heart(80, 76, 0.35, P)
)


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    words = json.load(open(os.path.join(root, "data", "season1-words.json"), encoding="utf-8"))
    need = [w["id"] for w in words if w["theme_id"] in ("t02", "t03", "t04")]
    missing = [i for i in need if i not in ICONS]
    extra = [i for i in ICONS if i not in need]
    if missing or extra:
        raise SystemExit(f"missing {missing} extra {extra}")
    d.write_icons(ICONS)
    print(f"wrote {len(ICONS)} more icons")


if __name__ == "__main__":
    main()
