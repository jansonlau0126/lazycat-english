#!/usr/bin/env python3
"""Draw the theme-1 SVG icon trial (spec §15.1). Soft rounded cats, app palette."""
import math, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "icons-svg")
os.makedirs(OUT, exist_ok=True)

C = "#5B4636"
O = "#F59A3E"
OL = "#FFE7CF"
S = "#FFD66B"
P = "#F7B5C4"
PL = "#FDE8EE"
L = "#B7A6E6"
K = "#8FCBEA"
M = "#8FD6AE"
CR = "#FFF8EE"
W = "#FFFFFF"
INK = "#5B4636"

def st(w=4):
    return f'stroke="{C}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"'

def svg(body):
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none">'
        + body + "</svg>\n"
    )

def ear(cx, cy, r, fill, side):
    # side -1 left, +1 right
    x1 = cx + side * r * 0.15
    y1 = cy - r * 0.55
    x2 = cx + side * r * 0.95
    y2 = cy - r * 1.15
    x3 = cx + side * r * 0.72
    y3 = cy - r * 0.22
    ix1 = cx + side * r * 0.28
    iy1 = cy - r * 0.48
    ix2 = cx + side * r * 0.78
    iy2 = cy - r * 0.95
    ix3 = cx + side * r * 0.62
    iy3 = cy - r * 0.32
    return (
        f'<path d="M{x1:.1f} {y1:.1f} L{x2:.1f} {y2:.1f} L{x3:.1f} {y3:.1f} Z" fill="{fill}" {st()}/>'
        f'<path d="M{ix1:.1f} {iy1:.1f} L{ix2:.1f} {iy2:.1f} L{ix3:.1f} {iy3:.1f} Z" fill="{P}"/>'
    )

def eyes(cx, cy, r, mood="open"):
    dx = r * 0.38
    y = cy - r * 0.02
    if mood == "shut":
        return (
            f'<path d="M{cx-dx-r*0.16:.1f} {y:.1f} Q{cx-dx:.1f} {y+r*0.16:.1f} {cx-dx+r*0.16:.1f} {y:.1f}" {st(3)}/>'
            f'<path d="M{cx+dx-r*0.16:.1f} {y:.1f} Q{cx+dx:.1f} {y+r*0.16:.1f} {cx+dx+r*0.16:.1f} {y:.1f}" {st(3)}/>'
        )
    if mood == "happy":
        return (
            f'<path d="M{cx-dx-r*0.18:.1f} {y+r*0.06:.1f} Q{cx-dx:.1f} {y-r*0.22:.1f} {cx-dx+r*0.18:.1f} {y+r*0.06:.1f}" {st(3.2)}/>'
            f'<path d="M{cx+dx-r*0.18:.1f} {y+r*0.06:.1f} Q{cx+dx:.1f} {y-r*0.22:.1f} {cx+dx+r*0.18:.1f} {y+r*0.06:.1f}" {st(3.2)}/>'
        )
    # open dots with a tiny shine
    er = max(2.4, r * 0.13)
    return (
        f'<circle cx="{cx-dx:.1f}" cy="{y:.1f}" r="{er:.1f}" fill="{C}"/>'
        f'<circle cx="{cx+dx:.1f}" cy="{y:.1f}" r="{er:.1f}" fill="{C}"/>'
        f'<circle cx="{cx-dx-er*0.35:.1f}" cy="{y-er*0.35:.1f}" r="{er*0.28:.1f}" fill="{W}"/>'
        f'<circle cx="{cx+dx-er*0.35:.1f}" cy="{y-er*0.35:.1f}" r="{er*0.28:.1f}" fill="{W}"/>'
    )

def muzzle(cx, cy, r):
    y = cy + r * 0.28
    return (
        f'<path d="M{cx:.1f} {y:.1f} l{-r*0.12:.1f} {r*0.1:.1f} h{r*0.24:.1f} Z" fill="{P}"/>'
        f'<path d="M{cx-r*0.28:.1f} {y+r*0.16:.1f} Q{cx:.1f} {y+r*0.42:.1f} {cx+r*0.28:.1f} {y+r*0.16:.1f}" {st(3)}/>'
    )

def blush(cx, cy, r):
    y = cy + r * 0.22
    rx, ry = r * 0.18, r * 0.1
    return (
        f'<ellipse cx="{cx-r*0.55:.1f}" cy="{y:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{P}" opacity=".85"/>'
        f'<ellipse cx="{cx+r*0.55:.1f}" cy="{y:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{P}" opacity=".85"/>'
    )

def head(cx, cy, r, fill=O, mood="open", glasses=False, beard=False, extra=""):
    parts = [
        ear(cx, cy, r, fill, -1),
        ear(cx, cy, r, fill, 1),
        f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" {st()}/>',
        blush(cx, cy, r),
        eyes(cx, cy, r, mood),
        muzzle(cx, cy, r),
    ]
    if glasses:
        dx = r * 0.38
        y = cy - r * 0.02
        gr = r * 0.3
        parts.append(
            f'<circle cx="{cx-dx:.1f}" cy="{y:.1f}" r="{gr:.1f}" fill="none" {st(3.2)}/>'
            f'<circle cx="{cx+dx:.1f}" cy="{y:.1f}" r="{gr:.1f}" fill="none" {st(3.2)}/>'
            f'<path d="M{cx-dx+gr:.1f} {y:.1f} H{cx+dx-gr:.1f}" {st(3.2)}/>'
        )
    if beard:
        parts.append(
            f'<ellipse cx="{cx:.1f}" cy="{cy+r*0.72:.1f}" rx="{r*0.42:.1f}" ry="{r*0.28:.1f}" fill="{W}" {st(3)}/>'
        )
    parts.append(extra)
    return "".join(parts)

def paw(cx, cy, s=1, fill=OL, rot=0):
    # a simple 3-toe paw
    t = f'transform="rotate({rot} {cx:.1f} {cy:.1f})"'
    return (
        f'<g {t}>'
        f'<ellipse cx="{cx:.1f}" cy="{cy+6*s:.1f}" rx="{9*s:.1f}" ry="{7.5*s:.1f}" fill="{fill}" {st(3)}/>'
        f'<circle cx="{cx-7*s:.1f}" cy="{cy-4*s:.1f}" r="{3.3*s:.1f}" fill="{fill}" {st(3)}/>'
        f'<circle cx="{cx:.1f}" cy="{cy-7*s:.1f}" r="{3.3*s:.1f}" fill="{fill}" {st(3)}/>'
        f'<circle cx="{cx+7*s:.1f}" cy="{cy-4*s:.1f}" r="{3.3*s:.1f}" fill="{fill}" {st(3)}/>'
        f'</g>'
    )

def body(cx, cy, fill=O, w=34, h=26):
    return f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{w:.1f}" ry="{h:.1f}" fill="{fill}" {st()}/>'

def heart(cx, cy, s=1, fill=P):
    return (
        f'<path d="M{cx:.1f} {cy+6*s:.1f} C{cx-16*s:.1f} {cy-8*s:.1f} {cx-8*s:.1f} {cy-16*s:.1f} {cx:.1f} {cy-6*s:.1f} '
        f'C{cx+8*s:.1f} {cy-16*s:.1f} {cx+16*s:.1f} {cy-8*s:.1f} {cx:.1f} {cy+6*s:.1f} Z" fill="{fill}" {st(3)}/>'
    )

def cap(cx, cy, r, fill=S):
    # baseball cap sitting on the head
    return (
        f'<path d="M{cx-r*0.7:.1f} {cy-r*0.35:.1f} Q{cx:.1f} {cy-r*1.25:.1f} {cx+r*0.55:.1f} {cy-r*0.2:.1f} '
        f'L{cx+r*1.15:.1f} {cy-r*0.05:.1f} Q{cx+r*0.4:.1f} {cy+r*0.05:.1f} {cx-r*0.15:.1f} {cy-r*0.05:.1f} Z" fill="{fill}" {st()}/>'
    )

def bun(cx, cy, r):
    return f'<circle cx="{cx:.1f}" cy="{cy-r*1.05:.1f}" r="{r*0.38:.1f}" fill="{O}" {st()}/>'

def ponytail(cx, cy, r, side=1):
    x = cx + side * r * 0.95
    y = cy - r * 0.1
    return (
        f'<path d="M{cx+side*r*0.4:.1f} {cy-r*0.7:.1f} Q{x:.1f} {y-r*0.2:.1f} {x:.1f} {y+r*0.55:.1f}" {st()} fill="none"/>'
        f'<circle cx="{x:.1f}" cy="{y+r*0.62:.1f}" r="{r*0.28:.1f}" fill="{P}" {st()}/>'
    )

def tie(cx, cy):
    return (
        f'<path d="M{cx-7:.1f} {cy} L{cx+7:.1f} {cy} L{cx:.1f} {cy+28:.1f} Z" fill="{K}" {st(3)}/>'
        f'<path d="M{cx-9:.1f} {cy-2:.1f} H{cx+9:.1f} L{cx:.1f} {cy+8:.1f} Z" fill="{K}" {st(3)}/>'
    )

def apron(cx, cy):
    return (
        f'<path d="M{cx-22:.1f} {cy} H{cx+22:.1f} Q{cx+20:.1f} {cy+36:.1f} {cx:.1f} {cy+40:.1f} Q{cx-20:.1f} {cy+36:.1f} {cx-22:.1f} {cy} Z" fill="{PL}" {st()}/>'
        f'<path d="M{cx-8:.1f} {cy+8:.1f} H{cx+8:.1f}" {st(3)}/>'
    )

def curly(cx, cy, r):
    return (
        f'<circle cx="{cx-r*0.85:.1f}" cy="{cy-r*0.55:.1f}" r="{r*0.28:.1f}" fill="{S}" {st(3)}/>'
        f'<circle cx="{cx:.1f}" cy="{cy-r*1.05:.1f}" r="{r*0.3:.1f}" fill="{S}" {st(3)}/>'
        f'<circle cx="{cx+r*0.85:.1f}" cy="{cy-r*0.5:.1f}" r="{r*0.28:.1f}" fill="{S}" {st(3)}/>'
    )

def gift(x, y, s=1):
    return (
        f'<rect x="{x:.1f}" y="{y:.1f}" width="{28*s:.1f}" height="{24*s:.1f}" rx="5" fill="{S}" {st()}/>'
        f'<path d="M{x+14*s:.1f} {y:.1f} V{y+24*s:.1f} M{x:.1f} {y+10*s:.1f} H{x+28*s:.1f}" {st(3)}/>'
        f'<path d="M{x+14*s:.1f} {y:.1f} Q{x+4*s:.1f} {y-12*s:.1f} {x+2*s:.1f} {y:.1f}" fill="{P}" {st(3)}/>'
        f'<path d="M{x+14*s:.1f} {y:.1f} Q{x+24*s:.1f} {y-12*s:.1f} {x+26*s:.1f} {y:.1f}" fill="{P}" {st(3)}/>'
    )

def balloon(cx, cy, fill=S, string_to=None):
    parts = [
        f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="16" ry="20" fill="{fill}" {st()}/>',
        f'<path d="M{cx-4:.1f} {cy+18:.1f} L{cx:.1f} {cy+26:.1f} L{cx+4:.1f} {cy+18:.1f} Z" fill="{fill}" {st(3)}/>',
    ]
    if string_to:
        parts.append(f'<path d="M{cx:.1f} {cy+26:.1f} Q{cx+6:.1f} {(cy+26+string_to)/2:.1f} {cx-2:.1f} {string_to:.1f}" {st(3)}/>')
    return "".join(parts)

def mic(x, y):
    return (
        f'<rect x="{x:.1f}" y="{y:.1f}" width="18" height="28" rx="9" fill="{K}" {st()}/>'
        f'<path d="M{x-6:.1f} {y+20:.1f} Q{x+9:.1f} {y+40:.1f} {x+24:.1f} {y+20:.1f}" {st()} fill="none"/>'
        f'<path d="M{x+9:.1f} {y+36:.1f} V{y+46:.1f}" {st()}/>'
        f'<path d="M{x:.1f} {y+46:.1f} H{x+18:.1f}" {st()}/>'
    )

def pin(cx, cy, fill="#FF7A7A"):
    return (
        f'<path d="M{cx:.1f} {cy-22:.1f} C{cx-14:.1f} {cy-22:.1f} {cx-14:.1f} {cy-6:.1f} {cx-14:.1f} {cy-4:.1f} '
        f'C{cx-14:.1f} {cy+6:.1f} {cx:.1f} {cy+16:.1f} {cx:.1f} {cy+16:.1f} C{cx:.1f} {cy+16:.1f} {cx+14:.1f} {cy+6:.1f} {cx+14:.1f} {cy-4:.1f} '
        f'C{cx+14:.1f} {cy-6:.1f} {cx+14:.1f} {cy-22:.1f} {cx:.1f} {cy-22:.1f} Z" fill="{fill}" {st()}/>'
        f'<circle cx="{cx:.1f}" cy="{cy-6:.1f}" r="5" fill="{W}"/>'
    )

def house():
    return (
        f'<path d="M22 70 L64 40 L106 70" fill="{P}" {st()}/>'
        f'<rect x="34" y="68" width="60" height="40" rx="6" fill="{CR}" {st()}/>'
        f'<rect x="56" y="82" width="16" height="26" rx="3" fill="{O}" {st(3)}/>'
        f'<rect x="42" y="78" width="12" height="12" rx="2" fill="{K}" {st(3)}/>'
        + pin(64, 30, "#FF7A7A")
    )

def star(cx, cy, r, fill=O):
    pts = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.42
        pts.append(f"{cx + rr * math.cos(ang):.1f},{cy + rr * math.sin(ang):.1f}")
    return f'<polygon points="{" ".join(pts)}" fill="{fill}" {st(3)}/>'

# ---- 25 icons ----
ICONS = {}

ICONS["hello"] = (
    head(58, 74, 30, O, "happy")
    + paw(96, 46, 0.85, OL, -20)
    + f'<path d="M86 58 Q78 66 70 60" {st(3)} fill="none"/>'
    + f'<rect x="78" y="10" width="40" height="26" rx="10" fill="{W}" {st()}/>'
    + f'<path d="M90 36 L84 46 L100 36" fill="{W}" {st()}/>'
    + f'<circle cx="90" cy="23" r="2.4" fill="{C}"/>'
    + f'<circle cx="98" cy="23" r="2.4" fill="{C}"/>'
    + f'<circle cx="106" cy="23" r="2.4" fill="{C}"/>'
)

ICONS["name"] = (
    f'<path d="M30 28 H86 Q104 28 104 46 V92 Q104 108 86 108 H42 Q28 108 28 94 V46 Q28 28 30 28 Z" fill="{S}" {st()}/>'
    + f'<circle cx="46" cy="48" r="7" fill="{W}" {st(3)}/>'
    + paw(70, 74, 1.15, O, 0)
)

ICONS["meet"] = (
    head(40, 70, 26, O, "happy")
    + head(88, 70, 26, P, "happy")
    + paw(58, 96, 0.7, OL, -30)
    + paw(72, 96, 0.7, PL, 30)
)

ICONS["friend"] = (
    body(46, 96, O, 22, 16)
    + body(84, 96, P, 22, 16)
    + head(44, 62, 24, O, "happy")
    + head(86, 62, 24, S, "happy")
    + heart(64, 28, 0.85, P)
)

ICONS["live"] = house()

ICONS["family"] = (
    heart(64, 68, 3.3, PL)
    + head(64, 58, 16, O, "happy")
    + head(40, 78, 13, S, "open")
    + head(88, 78, 13, P, "open")
)

ICONS["father"] = (
    body(64, 108, O, 28, 18)
    + tie(64, 86)
    + head(64, 58, 32, O, "open", glasses=True)
)

ICONS["mother"] = (
    body(64, 112, OL, 30, 16)
    + apron(64, 84)
    + f'<path d="M42 78 Q64 70 86 78" {st(3)} fill="none"/>'
    + head(64, 52, 30, OL, "happy")
    + f'<path d="M40 40 Q48 30 52 42" fill="{P}" {st(3)}/>'
)

ICONS["brother"] = (
    body(64, 108, O, 26, 16)
    + head(64, 64, 30, O, "happy")
    + cap(64, 40, 30, S)
)

ICONS["sister"] = (
    body(58, 108, PL, 24, 16)
    + head(58, 64, 28, OL, "happy")
    + ponytail(58, 50, 28, 1)
    + f'<rect x="92" y="70" width="10" height="36" rx="4" fill="{O}" {st()} transform="rotate(18 97 88)"/>'
    + f'<path d="M96 66 L108 58 L112 66 Z" fill="{P}" {st(3)} transform="rotate(18 102 64)"/>'
)

ICONS["grandfather"] = (
    f'<path d="M96 108 L108 40" {st()}/>'
    + f'<path d="M100 44 H116" {st()}/>'
    + body(58, 110, OL, 26, 14)
    + head(58, 64, 30, OL, "happy", glasses=True)
    + f'<path d="M34 42 Q58 24 82 42 Q70 34 58 36 Q46 34 34 42 Z" fill="{W}" {st()}/>'
    + f'<ellipse cx="58" cy="92" rx="12" ry="8" fill="{W}" {st(3)}/>'
)

ICONS["grandmother"] = (
    body(64, 110, PL, 28, 16)
    + head(64, 64, 30, OL, "happy", glasses=True)
    + bun(64, 38, 30)
    + f'<path d="M52 18 Q64 8 76 18" fill="{P}" {st(3)}/>'
)

ICONS["uncle"] = (
    body(60, 110, O, 26, 16)
    + head(60, 66, 30, O, "happy", beard=True)
    + paw(104, 40, 0.8, OL, -25)
    + f'<path d="M88 62 Q96 54 100 64" {st(3)} fill="none"/>'
)

ICONS["aunt"] = (
    head(52, 64, 28, OL, "happy")
    + curly(52, 48, 28)
    + gift(78, 72, 1.15)
)

ICONS["cousin"] = (
    body(40, 104, O, 20, 14)
    + body(88, 104, K, 20, 14)
    + head(40, 64, 24, O, "happy")
    + head(88, 64, 24, K, "happy")
    + f'<path d="M52 100 H76" {st()}/>'
)

ICONS["son"] = (
    head(46, 58, 26, O, "open", glasses=True)
    + tie(46, 86)
    + head(92, 78, 18, S, "happy")
    + cap(92, 64, 18, S)
    + f'<path d="M66 96 H80" {st()}/>'
)

ICONS["daughter"] = (
    head(44, 56, 26, OL, "happy")
    + apron(44, 86)
    + head(94, 78, 18, PL, "happy")
    + ponytail(94, 68, 18, 1)
    + f'<path d="M64 98 H82" {st()}/>'
)

ICONS["baby"] = (
    f'<ellipse cx="64" cy="96" rx="40" ry="16" fill="{M}" {st()}/>'
    + f'<path d="M30 90 Q64 70 98 90" fill="{K}" {st()}/>'
    + head(64, 62, 26, OL, "shut")
    + f'<circle cx="90" cy="78" r="8" fill="{P}" {st(3)}/>'
    + f'<circle cx="90" cy="78" r="3" fill="{W}"/>'
)

ICONS["child"] = (
    body(58, 104, O, 20, 14)
    + head(58, 68, 24, O, "happy")
    + balloon(96, 36, S, 78)
    + f'<path d="M70 78 Q82 70 90 60" {st(3)} fill="none"/>'
)

ICONS["parent"] = (
    head(48, 64, 30, O, "happy")
    + head(86, 78, 20, S, "shut")
    + f'<path d="M70 70 Q86 58 96 74" {st()} fill="none"/>'
    + f'<path d="M36 78 Q24 96 40 104" {st()} fill="none"/>'
    + heart(108, 36, 0.7, P)
)

ICONS["introduce"] = (
    head(48, 70, 30, O, "happy")
    + paw(78, 48, 0.75, OL, -30)
    + mic(88, 58)
)

ICONS["surname"] = (
    f'<rect x="22" y="24" width="84" height="80" rx="12" fill="{W}" {st()}/>'
    + f'<circle cx="46" cy="52" r="14" fill="{OL}" {st(3)}/>'
    + paw(46, 52, 0.55, O, 0)
    + f'<rect x="66" y="40" width="30" height="8" rx="3" fill="{O}" {st(3)}/>'
    + f'<rect x="66" y="56" width="24" height="6" rx="3" fill="{S}"/>'
    + f'<rect x="34" y="78" width="60" height="6" rx="3" fill="{PL}"/>'
    + f'<rect x="34" y="90" width="44" height="6" rx="3" fill="{PL}"/>'
)

ICONS["nickname"] = (
    f'<rect x="36" y="22" width="56" height="86" rx="16" fill="{S}" {st()}/>'
    + f'<circle cx="64" cy="40" r="8" fill="{W}" {st(3)}/>'
    + star(64, 78, 22, O)
)

# A chunky "7" drawn as a stroke, not a <text> node — reads as "age" at 40px.
ICONS["age"] = (
    balloon(64, 54, P, 116)
    + f'<path d="M50 40 H78 L56 72" stroke="{W}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
)

ICONS["together"] = (
    f'<ellipse cx="64" cy="96" rx="48" ry="18" fill="{P}" {st()}/>'
    + f'<ellipse cx="64" cy="92" rx="36" ry="10" fill="{PL}"/>'
    + head(46, 70, 22, O, "shut")
    + head(82, 72, 22, S, "shut")
    + f'<path d="M60 84 Q64 90 70 82" {st(3)} fill="none"/>'
)

def write_icons(icons):
    for wid, body in icons.items():
        path = os.path.join(OUT, wid + ".svg")
        data = svg(body)
        if len(data.encode()) > 4096:
            raise SystemExit(f"{wid} is {len(data)} bytes")
        if "<text" in data or "href=" in data or "://" in data.replace("http://www.w3.org/2000/svg", ""):
            raise SystemExit(f"{wid} has text or external ref")
        open(path, "w", encoding="utf-8").write(data)

if __name__ == "__main__":
    assert len(ICONS) == 25, len(ICONS)
    write_icons(ICONS)
    print(f"wrote {len(ICONS)} icons to {OUT}")
