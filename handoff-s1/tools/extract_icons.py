# Extract 25 food icons from food-icons-sheet.png -> icons/<word>.png (transparent, square-padded)
from PIL import Image, ImageDraw, ImageFont
import numpy as np
from scipy import ndimage as nd
import os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'food-icons-sheet.png')
WORDS = ['rice','noodles','bread','egg','chicken','beef','pork','fish','shrimp','vegetable',
         'tomato','carrot','grapes','apple','banana','orange','soup','sandwich','dumpling','cake',
         'cheese','sweet','salt','spicy','delicious']
rgb = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
H, W = rgb.shape[:2]
dist = 765 - rgb.sum(2)                      # darkness vs white
mask = dist > 25
lab, n = nd.label(nd.binary_dilation(mask, iterations=3))
objs = nd.find_objects(lab)
areas = nd.sum(mask, lab, range(1, n + 1))
comps = [(sl, a) for sl, a in zip(objs, areas) if a > 30]
big = [(sl, a) for sl, a in comps if a > 3000]
assert len(big) == 25, len(big)
# derive grid centres from the 25 big components (cluster centroids into 5 rows / 5 cols)
cy = np.array([(s[0].start + s[0].stop) / 2 for s, _ in big]); cx = np.array([(s[1].start + s[1].stop) / 2 for s, _ in big])
def centres(v):
    v = np.sort(v); gaps = np.argsort(np.diff(v))[-4:]; cuts = np.sort(gaps)
    groups = np.split(v, cuts + 1); return np.array([g.mean() for g in groups])
RC, CC = centres(cy), centres(cx)
print('row centres', RC.round(), 'col centres', CC.round())
cells = {}
for sl, a in comps:
    y = (sl[0].start + sl[0].stop) / 2; x = (sl[1].start + sl[1].stop) / 2
    r = int(np.argmin(abs(RC - y))); c = int(np.argmin(abs(CC - x)))
    b = cells.get((r, c)); box = [sl[0].start, sl[0].stop, sl[1].start, sl[1].stop]
    cells[(r, c)] = box if b is None else [min(b[0], box[0]), max(b[1], box[1]), min(b[2], box[2]), max(b[3], box[3])]
assert len(cells) == 25
report = []
for i, w in enumerate(WORDS):
    r, c = divmod(i, 5)
    y0, y1, x0, x1 = cells[(r, c)]
    P = 6
    y0, y1, x0, x1 = max(0, y0 - P), min(H, y1 + P), max(0, x0 - P), min(W, x1 + P)
    crop = rgb[y0:y1, x0:x1]; d = dist[y0:y1, x0:x1]
    # components belonging to this cell only (avoid neighbours' bits bleeding into the bbox)
    keep = [k + 1 for k, sl2 in enumerate(objs) if sl2 is not None
            and int(np.argmin(abs(RC - (sl2[0].start + sl2[0].stop) / 2))) == r
            and int(np.argmin(abs(CC - (sl2[1].start + sl2[1].stop) / 2))) == c]
    own = np.isin(lab[y0:y1, x0:x1], keep) & (d > 25)
    # silhouette: close small gaps in the outline, then fill interior (keeps white rice / salt glass / egg white opaque)
    sil = nd.binary_fill_holes(nd.binary_closing(np.pad(own, 8), iterations=5))[8:-8, 8:-8] | own
    # soft edge: ramp by darkness in a thin band around the silhouette boundary, then feather
    ramp = np.clip((d - 6) / 46.0, 0, 1)
    inner = nd.binary_erosion(sil, iterations=2)
    band = nd.binary_dilation(sil, iterations=1) & ~inner
    a = np.where(inner, 1.0, np.where(band, np.maximum(ramp, 0.55 * sil), 0.0)).astype(np.float32)
    a = np.clip(nd.gaussian_filter(a, 0.6), 0, 1)
    # remove white fringe (un-mix white background)
    aa = np.maximum(a, 1e-3)[..., None]
    col = np.clip((crop - (1 - aa) * 255) / aa, 0, 255)
    col = np.where(a[..., None] > 0.98, crop, col)
    out = np.dstack([col, a * 255]).astype(np.uint8)
    h, wd = out.shape[:2]; S = int(max(h, wd) * 1.06)
    canvas = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    canvas.paste(Image.fromarray(out, 'RGBA'), ((S - wd) // 2, (S - h) // 2))
    canvas.save(os.path.join(HERE, f'{w}.png'))
    report.append((w, x0, y0, x1 - x0, y1 - y0, S))
for r in report: print(*r)
# contact sheet on a checker + cream background to check edges
T = 150
sheet = Image.new('RGB', (5 * T * 2, 5 * (T + 18)), 'white'); dr = ImageDraw.Draw(sheet)
for i, w in enumerate(WORDS):
    ic = Image.open(os.path.join(HERE, f'{w}.png')).resize((T - 10, T - 10), Image.LANCZOS)
    r, c = divmod(i, 5)
    for k, bgc in enumerate([(255, 248, 238), (91, 70, 54)]):
        x = (c * 2 + k) * T; y = r * (T + 18)
        tile = Image.new('RGB', (T, T), bgc); tile.paste(ic, (5, 5), ic); sheet.paste(tile, (x, y))
    dr.text((c * 2 * T + 4, r * (T + 18) + T + 3), w, fill=(0, 0, 0))
sheet.save('/tmp/cr/icons-contact.png')
