"""Rebuild handoff-s1/assets + mockups from the design sources on Janson's box.
Run from anywhere: /workspace/.venv/bin/python tools/build_assets.py  (not needed by the coding agent)."""
import shutil, os, glob
from PIL import Image
SRC = "/workspace/cat-redesign"
PKG = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(PKG, "assets")
def webp(src, dst, maxw=800, q=82):
    im = Image.open(src).convert("RGB")
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    im.save(dst, "WEBP", quality=q, method=6)
for f in sorted(glob.glob(f"{SRC}/cats-photo/[0-9][0-9]-*.png")) + [f"{SRC}/cats-photo/hero-fanshu-napping.png"]:
    webp(f, os.path.join(A, "cats", os.path.basename(f)[:-4] + ".webp"))
for f in sorted(glob.glob(f"{SRC}/cats-photo/poses/*.png")):
    webp(f, os.path.join(A, "poses", os.path.basename(f)[:-4] + ".webp"))
# food icons: keep PNG (alpha), downscale to 256 if larger; rename grapes->fruit, salt->salty (words on the card)
RENAME = {"grapes": "fruit", "salt": "salty"}
for f in sorted(glob.glob(f"{SRC}/cats-photo/icons/*.png")):
    name = os.path.basename(f)[:-4]
    im = Image.open(f)
    if max(im.size) > 256:
        im.thumbnail((256, 256), Image.LANCZOS)
    im.save(os.path.join(A, "icons", RENAME.get(name, name) + ".png"), optimize=True)
# fonts (all SIL OFL 1.1)
G = "/usr/share/fonts/truetype/sand-box/google"
for s, d in [(f"{SRC}/mockups-v2/src/fonts/jf-openhuninn-2.1.ttf", "jf-openhuninn-2.1.ttf"),
             (f"{G}/Baloo 2/Baloo2-VariableFont_wght.ttf", "Baloo2-VariableFont_wght.ttf"),
             (f"{G}/Nunito/Nunito-VariableFont_wght.ttf", "Nunito-VariableFont_wght.ttf"),
             (f"{G}/Noto Sans/NotoSans-VariableFont_wdth,wght.ttf", "NotoSans-VariableFont_wdth-wght.ttf")]:
    shutil.copy2(s, os.path.join(A, "fonts", d))
# mockups
M = os.path.join(PKG, "mockups")
for f in glob.glob(f"{SRC}/mockups-v2/*.png"):
    shutil.copy2(f, M)
for f in glob.glob(f"{SRC}/mockups-v2/src/*"):
    if os.path.isfile(f):
        shutil.copy2(f, os.path.join(M, "src"))
print("done")
