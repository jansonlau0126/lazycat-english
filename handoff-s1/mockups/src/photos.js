// [handoff copy: paths repointed to ../../assets/, photos are now 800x450 .webp; crop maths uses fractions so IMG_W/IMG_H stay 1280x720]
// v2: realistic cat photos (cats-photo/*.png, 1280x720) + hand-drawn watercolour food icons (cats-photo/icons/*.png)
const PHOTO_DIR = '../../assets/cats/';
const IMG_W = 1280, IMG_H = 720;
// fx = face centre x, ey = eye line y, top = top of ears, chin = chin (fractions of image w/h)
const CATS = {
  orange:    {n:1, file:'01-fanshu-orange-tabby',       name:'番薯', breed:'橘貓',         en:'Orange Tabby',       hair:'短毛', fx:.50, ey:.38, top:.05, chin:.54},
  british:   {n:2, file:'02-huihui-british-shorthair',  name:'灰灰', breed:'英國短毛貓',   en:'British Shorthair',  hair:'短毛', fx:.51, ey:.32, top:.05, chin:.49},
  black:     {n:3, file:'03-zima-black',                name:'芝麻', breed:'黑貓',         en:'Black Cat',          hair:'短毛', fx:.49, ey:.30, top:.02, chin:.46},
  american:  {n:4, file:'04-banban-american-shorthair', name:'斑斑', breed:'美國短毛貓',   en:'American Shorthair', hair:'短毛', fx:.47, ey:.35, top:.05, chin:.51},
  calico:    {n:5, file:'05-fafa-calico',               name:'花花', breed:'三色貓',       en:'Calico',             hair:'短毛', fx:.49, ey:.37, top:.06, chin:.51},
  siamese:   {n:6, file:'06-kafe-siamese',              name:'咖啡', breed:'暹羅貓',       en:'Siamese',            hair:'短毛', fx:.49, ey:.30, top:.02, chin:.46},
  fold:      {n:7, file:'07-tongyun-scottish-fold',     name:'湯圓', breed:'蘇格蘭摺耳貓', en:'Scottish Fold',      hair:'短毛', fx:.50, ey:.36, top:.18, chin:.51},
  munchkin:  {n:8, file:'08-aigwa-munchkin',            name:'矮瓜', breed:'曼赤肯',       en:'Munchkin',           hair:'短毛', fx:.50, ey:.36, top:.15, chin:.51},
  russian:   {n:9, file:'09-lammui-russian-blue',       name:'藍莓', breed:'俄羅斯藍貓',   en:'Russian Blue',       hair:'短毛', fx:.50, ey:.26, top:.04, chin:.39},
  chinchilla:{n:10,file:'10-minfa-chinchilla',          name:'棉花', breed:'金吉拉',       en:'Chinchilla',         hair:'長毛', fx:.505,ey:.35, top:.10, chin:.49},
  ragdoll:   {n:11,file:'11-suetgo-ragdoll',            name:'雪糕', breed:'布偶貓',       en:'Ragdoll',            hair:'長毛', fx:.48, ey:.32, top:.02, chin:.44},
  mainecoon: {n:12,file:'12-daihung-maine-coon',        name:'大熊', breed:'緬因貓',       en:'Maine Coon',         hair:'長毛', fx:.50, ey:.37, top:.02, chin:.51},
  sphynx:    {n:13,file:'13-daufu-sphynx',              name:'豆腐', breed:'無毛貓',       en:'Sphynx',             hair:'無毛', fx:.51, ey:.41, top:.04, chin:.61},
  persian:   {n:14,file:'14-naisik-persian',            name:'奶昔', breed:'波斯貓',       en:'Persian',            hair:'長毛', fx:.51, ey:.44, top:.10, chin:.63},
  bengal:    {n:15,file:'15-baubau-bengal',             name:'豹豹', breed:'孟加拉豹貓',   en:'Bengal',             hair:'短毛', fx:.52, ey:.30, top:.04, chin:.45},
};
const CAT_ORDER = Object.keys(CATS);
const catSrc = k => PHOTO_DIR + (k === 'hero' ? 'hero-fanshu-napping' : CATS[k].file) + '.webp';

// Crop box (in image px) -> absolutely-positioned <img> inside an overflow:hidden frame.
function cropBox(k, mode, aspect){
  const c = CATS[k];
  let cx, cy, h;
  const head = (c.chin - c.top) * IMG_H;
  if (mode === 'face')      { cx = c.fx*IMG_W; cy = (c.top + c.chin)/2*IMG_H + head*.04; h = head*1.28; }
  else if (mode === 'bust') { h = head*1.65; cx = c.fx*IMG_W; cy = c.top*IMG_H - head*.06 + h/2; }
  else                      { cx = c.fx*IMG_W; cy = IMG_H*.5;                            h = IMG_H*.98; } // body
  return clampBox(cx, cy, h, aspect);
}
function clampBox(cx, cy, h, aspect){
  let w = h * aspect;
  if (h > IMG_H) { h = IMG_H; w = h*aspect; }
  if (w > IMG_W) { w = IMG_W; h = w/aspect; }
  let x0 = Math.min(Math.max(cx - w/2, 0), IMG_W - w);
  let y0 = Math.min(Math.max(cy - h/2, 0), IMG_H - h);
  return {x0, y0, w, h};
}
// opts: w,h (px), mode face|bust|body, r (border-radius), cls, style, box (explicit {cx,cy,h} in px), src
function catPhoto(k, o = {}){
  const w = o.w || 64, h = o.h || w, asp = w/h;
  const b = o.box ? clampBox(o.box.cx, o.box.cy, o.box.h, asp) : cropBox(k, o.mode || 'face', asp);
  const src = o.src || catSrc(k);
  const iw = IMG_W / b.w * 100, l = -b.x0 / b.w * 100, t = -b.y0 / b.h * 100;
  return `<span class="cphoto ${o.cls||''}" style="width:${w}px;height:${h}px;border-radius:${o.r ?? '50%'};${o.style||''}"><img src="${src}" alt="${k==='hero'?'番薯':CATS[k].name}" style="width:${iw.toFixed(3)}%;left:${l.toFixed(3)}%;top:${t.toFixed(3)}%"></span>`;
}
// hero napping kitten: sleeping face approx (29%, 51%), body spans x 20–90%, y 30–80%
const HERO = {faceX:.29*IMG_W, faceY:.51*IMG_H};

// hand-drawn food icons
const ICON_DIR = '../../assets/icons/';
const ICON_FOR = {food:'noodles'}; // handoff: grapes.png/salt.png were renamed fruit.png/salty.png
const foodIcon = (word, size, style='') => `<img class="ficon" src="${ICON_DIR}${ICON_FOR[word]||word}.png" alt="${word}" style="width:${size}px;height:${size}px;${style}">`;
