# ASSETS.md — Season 1 asset inventory

All paths in the **Package path** column are relative to `handoff-s1/` and are exactly what `data/*.json` and `BUILD-SPEC-S1.md` reference. **Source path** is where the original lives on Janson's design machine (for the design assistant only — the coding agent cannot see it; `tools/build_assets.py` regenerates the package copies from it).

Conversion: cat photos, hero and poses → **WebP, max 800 px wide, quality 82** (Pillow, method 6). Word icons → kept as **PNG with alpha** (originals are 173×173, already under the 256 px limit, so not resized). Mockup PNGs copied unchanged.

## 1. What exists

### 1.1 Cat default (unlock) photos — 15 + hero

| # | Cat | Source path | Package path | Size |
|---|---|---|---|---|
| 1 | 番薯 fanshu (Orange Tabby) | `/workspace/cat-redesign/cats-photo/01-fanshu-orange-tabby.png` | `assets/cats/01-fanshu-orange-tabby.webp` | 800×450, 11 KB |
| 2 | 灰灰 huihui (British Shorthair) | `/workspace/cat-redesign/cats-photo/02-huihui-british-shorthair.png` | `assets/cats/02-huihui-british-shorthair.webp` | 800×450, 13 KB |
| 3 | 芝麻 zima (Black Cat) | `/workspace/cat-redesign/cats-photo/03-zima-black.png` | `assets/cats/03-zima-black.webp` | 800×450, 10 KB |
| 4 | 斑斑 banban (American Shorthair) | `/workspace/cat-redesign/cats-photo/04-banban-american-shorthair.png` | `assets/cats/04-banban-american-shorthair.webp` | 800×450, 17 KB |
| 5 | 花花 fafa (Calico) | `/workspace/cat-redesign/cats-photo/05-fafa-calico.png` | `assets/cats/05-fafa-calico.webp` | 800×450, 10 KB |
| 6 | 咖啡 kafe (Siamese) | `/workspace/cat-redesign/cats-photo/06-kafe-siamese.png` | `assets/cats/06-kafe-siamese.webp` | 800×450, 9 KB |
| 7 | 湯圓 tongyun (Scottish Fold) | `/workspace/cat-redesign/cats-photo/07-tongyun-scottish-fold.png` | `assets/cats/07-tongyun-scottish-fold.webp` | 800×450, 10 KB |
| 8 | 矮瓜 aigwa (Munchkin) | `/workspace/cat-redesign/cats-photo/08-aigwa-munchkin.png` | `assets/cats/08-aigwa-munchkin.webp` | 800×450, 8 KB |
| 9 | 藍莓 lammui (Russian Blue) | `/workspace/cat-redesign/cats-photo/09-lammui-russian-blue.png` | `assets/cats/09-lammui-russian-blue.webp` | 800×450, 11 KB |
| 10 | 棉花 minfa (Chinchilla) | `/workspace/cat-redesign/cats-photo/10-minfa-chinchilla.png` | `assets/cats/10-minfa-chinchilla.webp` | 800×450, 12 KB |
| 11 | 雪糕 suetgo (Ragdoll) | `/workspace/cat-redesign/cats-photo/11-suetgo-ragdoll.png` | `assets/cats/11-suetgo-ragdoll.webp` | 800×450, 9 KB |
| 12 | 大熊 daihung (Maine Coon) | `/workspace/cat-redesign/cats-photo/12-daihung-maine-coon.png` | `assets/cats/12-daihung-maine-coon.webp` | 800×450, 16 KB |
| 13 | 豆腐 daufu (Sphynx) | `/workspace/cat-redesign/cats-photo/13-daufu-sphynx.png` | `assets/cats/13-daufu-sphynx.webp` | 800×450, 17 KB |
| 14 | 奶昔 naisik (Persian) | `/workspace/cat-redesign/cats-photo/14-naisik-persian.png` | `assets/cats/14-naisik-persian.webp` | 800×450, 17 KB |
| 15 | 豹豹 baubau (Bengal) | `/workspace/cat-redesign/cats-photo/15-baubau-bengal.png` | `assets/cats/15-baubau-bengal.webp` | 800×450, 15 KB |
| — | Hero: 番薯 napping on pink cushion (Home hero, 番薯 theme-card header) | `/workspace/cat-redesign/cats-photo/hero-fanshu-napping.png` | `assets/cats/hero-fanshu-napping.webp` | 800×450, 24 KB |

### 1.2 Album poses — 60 (15 cats × 瞓覺 sleep / 伸懶腰 stretch / 開心 happy / 玩毛線 yarn)

Source: `/workspace/cat-redesign/cats-photo/poses/<slug>-<pose>.png` → Package: `assets/poses/<slug>-<pose>.webp` (800×450 WebP). The ① 坐定定 album photo is the cat's default photo (1.1).

| Cat | sleep | stretch | happy | yarn |
|---|---|---|---|---|
| 番薯 fanshu | `assets/poses/fanshu-sleep.webp` (14 KB) | `assets/poses/fanshu-stretch.webp` (12 KB) | `assets/poses/fanshu-happy.webp` (15 KB) | `assets/poses/fanshu-yarn.webp` (17 KB) |
| 灰灰 huihui | `assets/poses/huihui-sleep.webp` (17 KB) | `assets/poses/huihui-stretch.webp` (13 KB) | `assets/poses/huihui-happy.webp` (15 KB) | `assets/poses/huihui-yarn.webp` (16 KB) |
| 芝麻 zima | `assets/poses/zima-sleep.webp` (16 KB) | `assets/poses/zima-stretch.webp` (12 KB) | `assets/poses/zima-happy.webp` (14 KB) | `assets/poses/zima-yarn.webp` (15 KB) |
| 斑斑 banban | `assets/poses/banban-sleep.webp` (26 KB) | `assets/poses/banban-stretch.webp` (25 KB) | `assets/poses/banban-happy.webp` (18 KB) | `assets/poses/banban-yarn.webp` (17 KB) |
| 花花 fafa | `assets/poses/fafa-sleep.webp` (22 KB) | `assets/poses/fafa-stretch.webp` (16 KB) | `assets/poses/fafa-happy.webp` (13 KB) | `assets/poses/fafa-yarn.webp` (16 KB) |
| 咖啡 kafe | `assets/poses/kafe-sleep.webp` (17 KB) | `assets/poses/kafe-stretch.webp` (10 KB) | `assets/poses/kafe-happy.webp` (12 KB) | `assets/poses/kafe-yarn.webp` (15 KB) |
| 湯圓 tongyun | `assets/poses/tongyun-sleep.webp` (19 KB) | `assets/poses/tongyun-stretch.webp` (13 KB) | `assets/poses/tongyun-happy.webp` (12 KB) | `assets/poses/tongyun-yarn.webp` (13 KB) |
| 矮瓜 aigwa | `assets/poses/aigwa-sleep.webp` (12 KB) | `assets/poses/aigwa-stretch.webp` (12 KB) | `assets/poses/aigwa-happy.webp` (9 KB) | `assets/poses/aigwa-yarn.webp` (10 KB) |
| 藍莓 lammui | `assets/poses/lammui-sleep.webp` (14 KB) | `assets/poses/lammui-stretch.webp` (15 KB) | `assets/poses/lammui-happy.webp` (16 KB) | `assets/poses/lammui-yarn.webp` (17 KB) |
| 棉花 minfa | `assets/poses/minfa-sleep.webp` (13 KB) | `assets/poses/minfa-stretch.webp` (13 KB) | `assets/poses/minfa-happy.webp` (13 KB) | `assets/poses/minfa-yarn.webp` (13 KB) |
| 雪糕 suetgo | `assets/poses/suetgo-sleep.webp` (16 KB) | `assets/poses/suetgo-stretch.webp` (8 KB) | `assets/poses/suetgo-happy.webp` (10 KB) | `assets/poses/suetgo-yarn.webp` (9 KB) |
| 大熊 daihung | `assets/poses/daihung-sleep.webp` (28 KB) | `assets/poses/daihung-stretch.webp` (24 KB) | `assets/poses/daihung-happy.webp` (22 KB) | `assets/poses/daihung-yarn.webp` (24 KB) |
| 豆腐 daufu | `assets/poses/daufu-sleep.webp` (23 KB) | `assets/poses/daufu-stretch.webp` (9 KB) | `assets/poses/daufu-happy.webp` (9 KB) | `assets/poses/daufu-yarn.webp` (13 KB) |
| 奶昔 naisik | `assets/poses/naisik-sleep.webp` (13 KB) | `assets/poses/naisik-stretch.webp` (13 KB) | `assets/poses/naisik-happy.webp` (11 KB) | `assets/poses/naisik-yarn.webp` (14 KB) |
| 豹豹 baubau | `assets/poses/baubau-sleep.webp` (32 KB) | `assets/poses/baubau-stretch.webp` (17 KB) | `assets/poses/baubau-happy.webp` (20 KB) | `assets/poses/baubau-yarn.webp` (18 KB) |

### 1.3 Hand-drawn watercolour word icons — 25 (theme 5 食物 Food only)

| Word | Source path | Package path | Note |
|---|---|---|---|
| rice | `/workspace/cat-redesign/cats-photo/icons/rice.png` | `assets/icons/rice.png` | 173×173  |
| noodles | `/workspace/cat-redesign/cats-photo/icons/noodles.png` | `assets/icons/noodles.png` | 210×210  |
| bread | `/workspace/cat-redesign/cats-photo/icons/bread.png` | `assets/icons/bread.png` | 205×205  |
| egg | `/workspace/cat-redesign/cats-photo/icons/egg.png` | `assets/icons/egg.png` | 147×147  |
| chicken | `/workspace/cat-redesign/cats-photo/icons/chicken.png` | `assets/icons/chicken.png` | 191×191  |
| beef | `/workspace/cat-redesign/cats-photo/icons/beef.png` | `assets/icons/beef.png` | 209×209  |
| pork | `/workspace/cat-redesign/cats-photo/icons/pork.png` | `assets/icons/pork.png` | 199×199  |
| fish | `/workspace/cat-redesign/cats-photo/icons/fish.png` | `assets/icons/fish.png` | 231×231  |
| shrimp | `/workspace/cat-redesign/cats-photo/icons/shrimp.png` | `assets/icons/shrimp.png` | 153×153  |
| vegetable | `/workspace/cat-redesign/cats-photo/icons/vegetable.png` | `assets/icons/vegetable.png` | 166×166  |
| tomato | `/workspace/cat-redesign/cats-photo/icons/tomato.png` | `assets/icons/tomato.png` | 160×160  |
| carrot | `/workspace/cat-redesign/cats-photo/icons/carrot.png` | `assets/icons/carrot.png` | 187×187  |
| fruit | `/workspace/cat-redesign/cats-photo/icons/grapes.png` | `assets/icons/fruit.png` | 166×166 renamed from grapes.png (bunch of grapes, as on the approved card) |
| apple | `/workspace/cat-redesign/cats-photo/icons/apple.png` | `assets/icons/apple.png` | 156×156  |
| banana | `/workspace/cat-redesign/cats-photo/icons/banana.png` | `assets/icons/banana.png` | 196×196  |
| orange | `/workspace/cat-redesign/cats-photo/icons/orange.png` | `assets/icons/orange.png` | 162×162  |
| soup | `/workspace/cat-redesign/cats-photo/icons/soup.png` | `assets/icons/soup.png` | 183×183  |
| sandwich | `/workspace/cat-redesign/cats-photo/icons/sandwich.png` | `assets/icons/sandwich.png` | 204×204  |
| dumpling | `/workspace/cat-redesign/cats-photo/icons/dumpling.png` | `assets/icons/dumpling.png` | 186×186  |
| cake | `/workspace/cat-redesign/cats-photo/icons/cake.png` | `assets/icons/cake.png` | 169×169  |
| cheese | `/workspace/cat-redesign/cats-photo/icons/cheese.png` | `assets/icons/cheese.png` | 169×169  |
| sweet | `/workspace/cat-redesign/cats-photo/icons/sweet.png` | `assets/icons/sweet.png` | 196×196  |
| salty | `/workspace/cat-redesign/cats-photo/icons/salt.png` | `assets/icons/salty.png` | 169×169 renamed from salt.png (salt shaker) |
| spicy | `/workspace/cat-redesign/cats-photo/icons/spicy.png` | `assets/icons/spicy.png` | 164×164  |
| delicious | `/workspace/cat-redesign/cats-photo/icons/delicious.png` | `assets/icons/delicious.png` | 256×256  |

Also used as the **food theme icon** (`data/season1-themes.json` → t05.icon): `assets/icons/noodles.png`. Source sheet (not in package): `/workspace/cat-redesign/cats-photo/food-icons-sheet.png`; cutter script: `tools/extract_icons.py`.

### 1.4 Fonts (SIL OFL 1.1 — see `assets/fonts/LICENSES.md`)

| Font | Source path | Package path | Size |
|---|---|---|---|
| jf open 粉圓 Huninn (Chinese UI) | `/workspace/cat-redesign/mockups-v2/src/fonts/jf-openhuninn-2.1.ttf` | `assets/fonts/jf-openhuninn-2.1.ttf` | 4.7 MB |
| Baloo 2 (English headwords) | `/usr/share/fonts/truetype/sand-box/google/Baloo 2/Baloo2-VariableFont_wght.ttf` | `assets/fonts/Baloo2-VariableFont_wght.ttf` | 669 KB |
| Nunito (English body) | `/usr/share/fonts/truetype/sand-box/google/Nunito/Nunito-VariableFont_wght.ttf` | `assets/fonts/Nunito-VariableFont_wght.ttf` | 269 KB |
| Noto Sans (IPA) | `/usr/share/fonts/truetype/sand-box/google/Noto Sans/NotoSans-VariableFont_wdth,wght.ttf` | `assets/fonts/NotoSans-VariableFont_wdth-wght.ttf` | 1.9 MB |

Licence texts: `assets/fonts/licenses/` (4 files). Production: subset Huninn (rename family, RFN) and convert to WOFF2.

### 1.5 Mockups (approved) and their HTML/CSS sources

| Mockup | Source path | Package path | Size |
|---|---|---|---|
| 01-home | `/workspace/cat-redesign/mockups-v2/01-home.png` | `mockups/01-home.png` | 780×1688, 536 KB |
| 02-word | `/workspace/cat-redesign/mockups-v2/02-word.png` | `mockups/02-word.png` | 780×1688, 228 KB |
| 03-theme-card | `/workspace/cat-redesign/mockups-v2/03-theme-card.png` | `mockups/03-theme-card.png` | 780×1688, 367 KB |
| 04-cat-collection | `/workspace/cat-redesign/mockups-v2/04-cat-collection.png` | `mockups/04-cat-collection.png` | 780×1688, 352 KB |
| 05-unlock-cat | `/workspace/cat-redesign/mockups-v2/05-unlock-cat.png` | `mockups/05-unlock-cat.png` | 780×1688, 309 KB |
| 06-year-map | `/workspace/cat-redesign/mockups-v2/06-year-map.png` | `mockups/06-year-map.png` | 780×1688, 341 KB |
| 07-cat-album | `/workspace/cat-redesign/mockups-v2/07-cat-album.png` | `mockups/07-cat-album.png` | 780×1688, 387 KB |
| 08-choose-companion | `/workspace/cat-redesign/mockups-v2/08-choose-companion.png` | `mockups/08-choose-companion.png` | 780×1688, 353 KB |
| 09-new-photo-unlocked | `/workspace/cat-redesign/mockups-v2/09-new-photo-unlocked.png` | `mockups/09-new-photo-unlocked.png` | 780×1688, 384 KB |
| album-all-cats | `/workspace/cat-redesign/mockups-v2/album-all-cats.png` | `mockups/album-all-cats.png` | 1770×3026, 4.5 MB |
| cats-gallery | `/workspace/cat-redesign/mockups-v2/cats-gallery.png` | `mockups/cats-gallery.png` | 2560×2180, 2.6 MB |
| overview | `/workspace/cat-redesign/mockups-v2/overview.png` | `mockups/overview.png` | 3230×1120, 1.3 MB |
| vocab-card-food-export | `/workspace/cat-redesign/mockups-v2/vocab-card-food-export.png` | `mockups/vocab-card-food-export.png` | 1080×1620, 503 KB |

HTML/CSS/JS sources: `/workspace/cat-redesign/mockups-v2/src/` → `mockups/src/` (paths patched to load `../../assets/…` and the package fonts, so they render from inside the package; `mockups/src/render.py` re-renders PNGs with Playwright). Files: `mockups/src/01-home.html`, `mockups/src/02-word.html`, `mockups/src/03-card.html`, `mockups/src/04-collection.html`, `mockups/src/05-unlock.html`, `mockups/src/06-map.html`, `mockups/src/07-album.html`, `mockups/src/08-companion.html`, `mockups/src/09-new-photo.html`, `mockups/src/album.js`, `mockups/src/card-export.html`, `mockups/src/cats-gallery.html`, `mockups/src/common.css`, `mockups/src/common.js`, `mockups/src/overview.html`, `mockups/src/photos.js`, `mockups/src/render.py`, `mockups/src/vocabcard.css`, `mockups/src/vocabcard.js`.

### 1.6 Reference material

- `reference/DESIGN-CONCEPT-v2.md` — approved full-year design concept (source `/workspace/cat-redesign/DESIGN-CONCEPT-v2.md`).
- `reference/old-app/` — old 包仔 app source (`app.js`, `app.css`, `words.js`, `grammar.js`, `template.html`, `build.py`, `test_walkthrough.py`, `DESIGN-old-baozai.md`; source `/workspace/english-app/src/` and `/workspace/english-app/DESIGN.md`).
- `reference/old-app/screenshots/` — 30 screenshots of the old app (WebP) for screens without a new mockup (quiz types, feedback, completion, grammar intro, review, profile, dev panel, out of hearts).

## 2. What is missing

### 2.1 Word icons — 275 missing (icon: null in `data/season1-words.json`)

Each needs `assets/icons/<id>.png`: transparent PNG, square, ≤ 256 px (draw at 512 and downscale), same soft watercolour sticker style as the food set (warm outline, pastel wash, cute face optional for food/objects). Brief = `icon_idea`; abstract words (★) get a simple **scene icon** (approved: e.g. happy = smiling cat, always = clock with loop arrow). After adding files run `python3 tools/sync_icons.py` then `python3 tools/validate_data.py`.

Suggested order = teaching order (one 5×5 sheet per theme, drawn ahead of Janson's pace): t01 → t02 → t03 → t04 → t06 → … → t12.

#### t01 · 第 1 週 · 🙋 自我介紹同家人 Me & Family — 25 icons

| Day | id | Word | Icon idea |
|---|---|---|---|
| 1 | `hello` | hello ★ | a kitten waving one paw with a small speech bubble |
| 1 | `name` | name | a name tag sticker with a paw print |
| 1 | `meet` | meet ★ | two kittens touching paws like a handshake |
| 1 | `friend` | friend | two kittens sitting side by side with a small heart above |
| 1 | `live` | live ★ | a small house with a map pin on top |
| 2 | `family` | family | a family of cats inside a heart-shaped frame |
| 2 | `father` | father | a dad with glasses and a tie, soft smile |
| 2 | `mother` | mother | a mum wearing an apron, soft smile |
| 2 | `brother` | brother | a boy in a cap |
| 2 | `sister` | sister | a girl with a ponytail holding a crayon |
| 3 | `grandfather` | grandfather | a grandpa with white hair and a walking stick |
| 3 | `grandmother` | grandmother | a grandma with a hair bun and round glasses |
| 3 | `uncle` | uncle | a smiling man with a beard waving |
| 3 | `aunt` | aunt | a lady with curly hair holding a gift box |
| 3 | `cousin` | cousin | two children of the same height holding hands |
| 4 | `son` | son | a dad holding a little boy's hand |
| 4 | `daughter` | daughter | a mum holding a little girl's hand |
| 4 | `baby` | baby | a sleeping baby with a dummy |
| 4 | `child` | child | a small child holding a balloon |
| 4 | `parent` | parent | a mother cat hugging a kitten |
| 5 | `introduce` | introduce ★ | a kitten raising one paw beside a tiny microphone |
| 5 | `surname` | surname | an ID card with the top line highlighted |
| 5 | `nickname` | nickname | a cute luggage tag with a star doodle |
| 5 | `age` | age ★ | a balloon with a number on it |
| 5 | `together` | together ★ | two kittens curled up together on one cushion |

#### t02 · 第 2 週 · 🖐️ 身體 Body — 25 icons

| Day | id | Word | Icon idea |
|---|---|---|---|
| 1 | `head` | head | a round kitten head, front view |
| 1 | `face` | face | a round smiling face with rosy cheeks |
| 1 | `hair` | hair | a comb brushing a wavy lock of hair |
| 1 | `eye` | eye | a big sparkly cartoon eye with lashes |
| 1 | `ear` | ear | a cute ear with small sound waves |
| 2 | `nose` | nose | a little pink cat nose with whiskers |
| 2 | `mouth` | mouth | a smiling mouth with a little tongue |
| 2 | `tooth` | tooth | a smiling tooth with a sparkle |
| 2 | `neck` | neck | a giraffe's long neck wearing a little scarf |
| 2 | `shoulder` | shoulder | a shoulder with a bag strap over it |
| 3 | `arm` | arm | a flexing arm with a tiny heart |
| 3 | `hand` | hand | an open hand waving |
| 3 | `finger` | finger | a pointing finger with a small plaster |
| 3 | `leg` | leg | a leg kicking a small ball |
| 3 | `foot` | foot | a single footprint |
| 4 | `body` | body | a standing kitten silhouette with sparkles |
| 4 | `back` | back | a kitten seen from behind with a curved spine line |
| 4 | `stomach` | stomach | a round tummy with a little grumble line |
| 4 | `knee` | knee | a bent knee with a round plaster |
| 4 | `toe` | toe | a small foot with five round toes |
| 5 | `see` | see ★ | a kitten looking through binoculars |
| 5 | `hear` | hear ★ | a kitten cupping its ear with music notes |
| 5 | `smell` | smell ★ | a kitten sniffing a flower with wavy scent lines |
| 5 | `touch` | touch ★ | a finger gently touching a soft paw |
| 5 | `taste` | taste ★ | a tongue with a little spoon |

#### t03 · 第 3 週 · 🏠 屋企同家具 Home — 25 icons

| Day | id | Word | Icon idea |
|---|---|---|---|
| 1 | `home` | home | a cosy house with a cat on the roof |
| 1 | `flat` | flat | a tall building with one warm lit window |
| 1 | `bedroom` | bedroom | a small room with a bed under a window |
| 1 | `kitchen` | kitchen | a stove with a little pot and steam |
| 1 | `bathroom` | bathroom | a bathtub full of bubbles |
| 2 | `bed` | bed | a cosy bed with a patchwork blanket |
| 2 | `table` | table | a round wooden table with a vase |
| 2 | `chair` | chair | a wooden chair with a cushion |
| 2 | `sofa` | sofa | a soft pink sofa with a sleeping cat |
| 2 | `desk` | desk | a study desk with a lamp and books |
| 3 | `door` | door | a wooden door with a round knob |
| 3 | `window` | window | a window with curtains and sunlight |
| 3 | `floor` | floor | a wooden floor with a small round rug |
| 3 | `wall` | wall | a brick wall with a hanging picture |
| 3 | `lamp` | lamp | a desk lamp glowing warmly |
| 4 | `fridge` | fridge | a small fridge with magnets on the door |
| 4 | `fan` | fan | an electric fan with breezy wind lines |
| 4 | `cupboard` | cupboard | a cupboard with one door open showing cups |
| 4 | `shelf` | shelf | a wall shelf with books and a plant |
| 4 | `pillow` | pillow | a fluffy pillow with a kitten napping on it |
| 5 | `comfortable` | comfortable ★ | a cat melting happily into a soft cushion |
| 5 | `clean` | clean ★ | a shiny plate with sparkle stars |
| 5 | `messy` | messy ★ | a pile of clothes and books with a confused kitten |
| 5 | `key` | key | a golden key with a paw-shaped head |
| 5 | `lift` | lift | lift doors with up and down arrow buttons |

#### t04 · 第 4 週 · ⏰ 日常作息 Daily Routine — 25 icons

| Day | id | Word | Icon idea |
|---|---|---|---|
| 1 | `wake` | wake ★ | a kitten stretching in bed as the sun rises |
| 1 | `alarm` | alarm | a ringing twin-bell alarm clock |
| 1 | `brush` | brush | a toothbrush with foam bubbles |
| 1 | `wash` | wash | two paws washing with soap bubbles |
| 1 | `breakfast` | breakfast | a breakfast plate with toast and a fried egg |
| 2 | `shower` | shower | a shower head with water drops |
| 2 | `lunch` | lunch | a lunch box with rice and vegetables |
| 2 | `dinner` | dinner | a family dinner table with a steaming pot |
| 2 | `bedtime` | bedtime ★ | a crescent moon over a clock showing 11 |
| 2 | `sleep` | sleep ★ | a curled-up sleeping kitten with Zzz |
| 3 | `morning` | morning ★ | a sunrise over hills with a coffee cup |
| 3 | `afternoon` | afternoon ★ | a slanting afternoon sun with a teacup |
| 3 | `evening` | evening ★ | a sunset sky with city lights coming on |
| 3 | `night` | night ★ | a dark blue sky with a moon and stars |
| 3 | `early` | early ★ | a rooster crowing on top of an alarm clock at sunrise |
| 4 | `always` | always ★ | a clock with a looping arrow around it |
| 4 | `usually` | usually ★ | a calendar with most days ticked |
| 4 | `often` | often ★ | a calendar covered with many paw stamps |
| 4 | `sometimes` | sometimes ★ | a calendar with only a few days ticked |
| 4 | `never` | never ★ | a crossed-out alarm clock beside a sleepy cat |
| 5 | `busy` | busy ★ | a kitten juggling books and a clock |
| 5 | `late` | late ★ | a kitten running past a clock whose hand has passed 12 |
| 5 | `forget` | forget ★ | a kitten with an empty thought bubble and a question mark |
| 5 | `relax` | relax ★ | a cat lying on its back in a sunbeam |
| 5 | `weekend` | weekend ★ | a calendar with Saturday and Sunday circled with hearts |

#### t06 · 第 6 週 · 🧋 飲品同茶餐廳 Drinks & Café — 25 icons

| Day | id | Word | Icon idea |
|---|---|---|---|
| 1 | `water` | water | a glass of water with a drop |
| 1 | `milk` | milk | a milk carton and a glass of milk |
| 1 | `tea` | tea | a Hong Kong milk tea cup on a saucer |
| 1 | `coffee` | coffee | a coffee cup with latte-art heart |
| 1 | `juice` | juice | a juice box with an orange slice |
| 2 | `lemon` | lemon | a lemon with a slice cut |
| 2 | `ice` | ice | three ice cubes with sparkles |
| 2 | `sugar` | sugar | a sugar bowl with a small spoon and cubes |
| 2 | `cup` | cup | an empty teacup with a handle |
| 2 | `straw` | straw | a striped paper straw in a cup |
| 3 | `toast` | toast | a slice of French toast with butter and syrup |
| 3 | `butter` | butter | a pat of butter on a small dish |
| 3 | `sausage` | sausage | two little sausages on a plate |
| 3 | `ham` | ham | a pink slice of ham |
| 3 | `macaroni` | macaroni | a bowl of macaroni soup with ham strips |
| 4 | `order` | order ★ | a notepad with a pencil and a tick |
| 4 | `menu` | menu | a cha chaan teng menu card |
| 4 | `bill` | bill | a paper receipt with a total line |
| 4 | `waiter` | waiter | a waiter carrying a tray with a drink |
| 4 | `takeaway` | takeaway | a takeaway box and a drink in a plastic bag |
| 5 | `hungry` | hungry ★ | a kitten with a rumbling tummy looking at food |
| 5 | `thirsty` | thirsty ★ | a kitten panting next to an empty glass |
| 5 | `drink` | drink ★ | a kitten sipping from a cup through a straw |
| 5 | `full` | full ★ | a kitten lying back with a round full tummy |
| 5 | `less` | less ★ | a cup with a small down arrow and only a few ice cubes |

#### t07 · 第 7 週 · 👕 衣服 Clothes — 25 icons

| Day | id | Word | Icon idea |
|---|---|---|---|
| 1 | `clothes` | clothes | a pile of folded clothes |
| 1 | `shirt` | shirt | a white collared shirt on a hanger |
| 1 | `trousers` | trousers | a pair of grey trousers folded |
| 1 | `skirt` | skirt | a pleated skirt with a bow |
| 1 | `dress` | dress | a flowing dress on a hanger |
| 2 | `jacket` | jacket | a short zip-up jacket |
| 2 | `coat` | coat | a long warm coat with big buttons |
| 2 | `sweater` | sweater | a knitted sweater with a cat face pattern |
| 2 | `jeans` | jeans | a pair of blue jeans |
| 2 | `shorts` | shorts | a pair of summer shorts |
| 3 | `shoes` | shoes | a pair of trainers |
| 3 | `socks` | socks | a pair of striped socks |
| 3 | `hat` | hat | a straw sun hat with a ribbon |
| 3 | `scarf` | scarf | a striped knitted scarf |
| 3 | `gloves` | gloves | a pair of woolly gloves |
| 4 | `bag` | bag | a school backpack |
| 4 | `belt` | belt | a brown leather belt with a buckle |
| 4 | `pocket` | pocket | a jeans pocket with a coin peeking out |
| 4 | `button` | button | a round four-hole button with thread |
| 4 | `uniform` | uniform | a school uniform shirt with a badge |
| 5 | `wear` | wear ★ | a kitten trying on a hat in front of a mirror |
| 5 | `size` | size ★ | three T-shirts in S, M and L sizes |
| 5 | `loose` | loose ★ | baggy trousers held up by a kitten |
| 5 | `tight` | tight ★ | a kitten squeezing into a tiny sweater |
| 5 | `pair` | pair ★ | two matching socks tied with a ribbon |

#### t08 · 第 8 週 · 🎨 顏色、形狀、數字 Colours & Numbers — 25 icons

| Day | id | Word | Icon idea |
|---|---|---|---|
| 1 | `red` | red ★ | a red paint splash with a little brush |
| 1 | `yellow` | yellow ★ | a yellow paint splash with a little brush |
| 1 | `blue` | blue ★ | a blue paint splash with a little brush |
| 1 | `green` | green ★ | a green paint splash with a leaf |
| 1 | `pink` | pink ★ | a pink paint splash with a paw print |
| 2 | `white` | white ★ | a white paint splash with a milk drop |
| 2 | `black` | black ★ | a black paint splash with a black cat silhouette |
| 2 | `brown` | brown ★ | a brown paint splash with a chocolate square |
| 2 | `grey` | grey ★ | a grey paint splash with a small cloud |
| 2 | `purple` | purple ★ | a purple paint splash with a ball of yarn |
| 3 | `colour` | colour ★ | a painter's palette with five colour dots |
| 3 | `shape` | shape ★ | a circle, a square and a triangle stacked playfully |
| 3 | `circle` | circle | a hand-drawn circle with a pencil |
| 3 | `square` | square | a soft square block with a smile |
| 3 | `triangle` | triangle | a triangle made from a pizza slice |
| 4 | `number` | number ★ | number blocks 1, 2 and 3 stacked |
| 4 | `hundred` | hundred ★ | a banknote with 100 on it |
| 4 | `thousand` | thousand ★ | an abacus beside the number 1,000 |
| 4 | `million` | million ★ | a big money bag with six zeros |
| 4 | `half` | half ★ | an orange cut exactly in half |
| 5 | `count` | count ★ | a kitten counting on its paw toes |
| 5 | `first` | first ★ | a gold medal with number 1 |
| 5 | `big` | big ★ | a big cat next to a tiny mouse, the big one highlighted |
| 5 | `small` | small ★ | a tiny kitten next to a big cushion, the tiny one highlighted |
| 5 | `round` | round ★ | a round full moon with a cat silhouette |

#### t09 · 第 9 週 · 🌦️ 天氣 Weather — 25 icons

| Day | id | Word | Icon idea |
|---|---|---|---|
| 1 | `weather` | weather ★ | a sun peeking out behind a rain cloud |
| 1 | `sunny` | sunny ★ | a smiling sun with rays |
| 1 | `cloudy` | cloudy ★ | two fluffy grey clouds |
| 1 | `rainy` | rainy ★ | a cloud with falling raindrops |
| 1 | `windy` | windy ★ | a tree bending with swirly wind lines |
| 2 | `hot` | hot ★ | a kitten fanning itself under a blazing sun |
| 2 | `cold` | cold ★ | a shivering kitten wrapped in a scarf |
| 2 | `warm` | warm ★ | a kitten basking in a warm sunbeam |
| 2 | `cool` | cool ★ | a kitten in sunglasses with a gentle breeze |
| 2 | `humid` | humid ★ | a foggy window with water drops |
| 3 | `rain` | rain ★ | big raindrops falling on a puddle |
| 3 | `snow` | snow | a snowflake above a little snowman |
| 3 | `storm` | storm | a dark cloud with heavy rain and wind |
| 3 | `typhoon` | typhoon | a swirling typhoon with a No. 8 signal sign |
| 3 | `thunder` | thunder | a cloud with a zigzag boom sound |
| 4 | `sun` | sun | a round warm sun |
| 4 | `sky` | sky | a blue sky with a small cloud and a bird |
| 4 | `rainbow` | rainbow | a rainbow arching over two clouds |
| 4 | `temperature` | temperature ★ | a thermometer showing a high reading |
| 4 | `forecast` | forecast ★ | a small TV showing weather symbols |
| 5 | `umbrella` | umbrella | an open polka-dot umbrella |
| 5 | `spring` | spring ★ | cherry blossom branch with a small bird |
| 5 | `summer` | summer ★ | a beach with a parasol and a watermelon slice |
| 5 | `autumn` | autumn ★ | falling orange maple leaves |
| 5 | `winter` | winter ★ | a snowman wearing a scarf |

#### t10 · 第 10 週 · 📅 時間同日期 Time & Dates — 25 icons

| Day | id | Word | Icon idea |
|---|---|---|---|
| 1 | `time` | time ★ | a wristwatch with a paw on the dial |
| 1 | `clock` | clock | a round wall clock |
| 1 | `hour` | hour ★ | an hourglass with sand flowing |
| 1 | `minute` | minute ★ | a stopwatch with the hand at one minute |
| 1 | `second` | second ★ | a stopwatch with a tiny ticking hand |
| 2 | `monday` | Monday ★ | a calendar page with MON and a sleepy cat |
| 2 | `tuesday` | Tuesday ★ | a calendar page with TUE and a ball |
| 2 | `wednesday` | Wednesday ★ | a calendar page with WED and a see-saw |
| 2 | `thursday` | Thursday ★ | a calendar page with THU and a waving paw |
| 2 | `friday` | Friday ★ | a calendar page with FRI and confetti |
| 3 | `saturday` | Saturday ★ | a calendar page with SAT and a football |
| 3 | `sunday` | Sunday ★ | a calendar page with SUN and a napping cat |
| 3 | `week` | week ★ | a strip of seven day boxes with paw stamps |
| 3 | `month` | month ★ | a month calendar page with a circled date |
| 3 | `year` | year ★ | fireworks over a calendar showing a new year |
| 4 | `today` | today ★ | a calendar with today's box glowing |
| 4 | `tomorrow` | tomorrow ★ | a calendar with an arrow pointing to the next day |
| 4 | `yesterday` | yesterday ★ | a calendar with an arrow pointing back one day |
| 4 | `date` | date ★ | a calendar page with a pin on one date |
| 4 | `calendar` | calendar | a hanging wall calendar |
| 5 | `birthday` | birthday | a birthday cake with candles |
| 5 | `holiday` | holiday ★ | a suitcase beside a palm tree |
| 5 | `quarter` | quarter ★ | a clock face with one quarter shaded |
| 5 | `weekday` | weekday ★ | five day boxes Mon–Fri highlighted |
| 5 | `tonight` | tonight ★ | a crescent moon over a lit window |

#### t11 · 第 11 週 · 🐾 動物同寵物 Animals & Pets — 25 icons

| Day | id | Word | Icon idea |
|---|---|---|---|
| 1 | `animal` | animal | a group of small animals: cat, dog, rabbit |
| 1 | `pet` | pet | a pet bed with a food bowl |
| 1 | `cat` | cat | a sitting orange tabby cat |
| 1 | `dog` | dog | a happy puppy with a wagging tail |
| 1 | `rabbit` | rabbit | a white rabbit holding a carrot |
| 2 | `bird` | bird | a small bird singing on a branch |
| 2 | `hamster` | hamster | a round hamster with full cheeks |
| 2 | `goldfish` | goldfish | a goldfish in a round bowl |
| 2 | `turtle` | turtle | a green turtle with a patterned shell |
| 2 | `mouse` | mouse | a little grey mouse with big ears |
| 3 | `lion` | lion | a friendly lion with a fluffy mane |
| 3 | `tiger` | tiger | a baby tiger with bold stripes |
| 3 | `elephant` | elephant | a grey elephant spraying water from its trunk |
| 3 | `monkey` | monkey | a monkey hanging from a branch holding a banana |
| 3 | `panda` | panda | a panda munching bamboo |
| 4 | `cow` | cow | a black-and-white cow with a bell |
| 4 | `pig` | pig | a pink piglet with a curly tail |
| 4 | `horse` | horse | a brown horse with a flowing mane |
| 4 | `sheep` | sheep | a fluffy white sheep |
| 4 | `duck` | duck | a yellow duck swimming |
| 5 | `feed` | feed ★ | a hand pouring kibble into a cat bowl |
| 5 | `tail` | tail | a fluffy striped cat tail curling |
| 5 | `cute` | cute ★ | a kitten with sparkly eyes and little hearts |
| 5 | `kitten` | kitten | a tiny kitten peeking out of a basket |
| 5 | `zoo` | zoo | a zoo gate with a giraffe peeking over |

#### t12 · 第 12 週 · 😊 情緒 Feelings — 25 icons

| Day | id | Word | Icon idea |
|---|---|---|---|
| 1 | `happy` | happy ★ | a smiling cat with closed happy eyes |
| 1 | `sad` | sad ★ | a kitten with droopy ears and a small tear |
| 1 | `angry` | angry ★ | a puffed-up kitten with a steam puff |
| 1 | `scared` | scared ★ | a kitten hiding under a blanket, only eyes showing |
| 1 | `excited` | excited ★ | a kitten jumping with stars around it |
| 2 | `tired` | tired ★ | a yawning kitten with heavy eyelids |
| 2 | `bored` | bored ★ | a kitten resting its chin on its paws, flat eyes |
| 2 | `nervous` | nervous ★ | a kitten biting its paw with sweat drops |
| 2 | `worried` | worried ★ | a kitten with furrowed brows and a small cloud above |
| 2 | `surprised` | surprised ★ | a kitten with wide eyes and an exclamation mark |
| 3 | `feel` | feel ★ | a kitten with a thought bubble containing a heart |
| 3 | `smile` | smile ★ | a kitten smiling at a camera |
| 3 | `laugh` | laugh ★ | a kitten rolling on its back laughing |
| 3 | `cry` | cry ★ | a kitten with big tears and a tissue |
| 3 | `hug` | hug ★ | two kittens hugging |
| 4 | `love` | love ★ | a kitten holding a big heart |
| 4 | `hate` | hate ★ | a grumpy kitten turning away from an alarm clock |
| 4 | `hope` | hope ★ | a kitten looking up at a shooting star |
| 4 | `miss` | miss ★ | a kitten looking at a photo frame by the window |
| 4 | `sorry` | sorry ★ | a kitten with lowered ears offering a flower |
| 5 | `calm` | calm ★ | a kitten meditating on a cushion by still water |
| 5 | `proud` | proud ★ | a kitten wearing a medal, chest puffed out |
| 5 | `lonely` | lonely ★ | a kitten alone by a rainy window |
| 5 | `shy` | shy ★ | a kitten half hiding behind a curtain, blushing |
| 5 | `because` | because ★ | a lightbulb connecting a question mark to an arrow |

**Total missing: 275** (★ abstract: 131).

### 2.2 Other UI art (none blocks the build)

| Item | Status | Proposal |
|---|---|---|
| **SVG vector icons — trial, theme 1 only (decision P1)** | to be drawn by the coding agent | 25 simple soft/rounded SVGs in `assets/icons-svg/<word-id>.svg` for the t01 words, shown only when the 生字圖示 setting is switched to 向量圖（試用）; tile stays default; hand-drawn PNGs win. Spec §15.1. |
| Theme icons for the other 11 themes (Home theme tile, map nodes, card header) | missing | Use the theme emoji on a pastel tile (spec §7.1/§15) until drawn; can reuse one word icon per theme later (as food uses noodles). |
| Favicon / apple-touch-icon / PWA icons | missing | Generate at build time by cropping 番薯's face from `assets/cats/01-fanshu-orange-tabby.webp` (crop hints in `data/cats.json`) onto a cream circle — code only, no new art. |
| Open Graph / share preview image | missing (optional) | Crop `assets/cats/hero-fanshu-napping.webp` to 1200×630 with the app name. |
| Theme-card stamp / confetti / sunburst | CSS only | As in `mockups/src/05-unlock.html` / `mockups/src/09-new-photo.html`. |
| Tab-bar and UI icons | exist as SVG in `mockups/src/common.js` | Reuse. |
| Font licence texts | added | `assets/fonts/LICENSES.md` + `assets/fonts/licenses/`. |
| Season 2–4 content & new cats' poses | out of scope | Map shows 「即將推出」. |

## 3. Package size (measured 2026-09-28)

| Folder | Size | Needed by the published app? |
|---|---|---|
| `assets/cats/` (16 WebP) | 252 KB | yes |
| `assets/poses/` (60 WebP) | 1.1 MB | yes (lazy-loaded) |
| `assets/icons/` (25 PNG) | 1.1 MB | yes |
| `assets/fonts/` (4 TTF + licences) | 7.7 MB | yes, but subset/WOFF2 in production (Huninn alone is 4.9 MB) |
| `data/` | 248 KB | yes (inlined at build) |
| `mockups/` (13 PNG + src) | 13 MB | no — review material |
| `reference/` | 1.2 MB | no |
| `tools/` | 28 KB | no |
| **Total package** | **≈ 24 MB** (194 files) | |
