// v2 album (畫冊): 番薯 pose photos. Needs photos.js first.
// Pose photos live in cats-photo/poses/fanshu-<pose>.png. If a pose file is missing, the frame falls back
// to a stand-in and gets class "ph" (placeholder) so a mockup never silently shows the wrong photo.
const POSE_DIR = '../../assets/poses/'; // handoff copy
const POSES = {
  sit:     {n:1, zh:'坐定定', cap:'乖乖坐定定', en:'Sitting',  emoji:'🐱', src: catSrc('orange'),            pos:'50% 40%'},
  sleep:   {n:2, zh:'瞓覺',   cap:'瞓到打呼嚕', en:'Sleeping', emoji:'💤', src: POSE_DIR+'fanshu-sleep.webp',   pos:'50% 55%', fb: catSrc('hero'), fbPos:'32% 60%'},
  stretch: {n:3, zh:'伸懶腰', cap:'伸個大懶腰', en:'Stretch',  emoji:'🙆', src: POSE_DIR+'fanshu-stretch.webp', pos:'50% 55%'},
  happy:   {n:4, zh:'開心',   cap:'開心到彈起', en:'Happy',    emoji:'😸', src: POSE_DIR+'fanshu-happy.webp',   pos:'50% 45%'},
  yarn:    {n:5, zh:'玩毛線', cap:'玩毛線波波', en:'Yarn',     emoji:'🧶', src: POSE_DIR+'fanshu-yarn.webp',    pos:'50% 50%', bonus:true},
};
const POSE_ORDER = ['sit','sleep','stretch','happy'];
function poseFallback(img, k){
  img.onerror = null;
  const p = POSES[k];
  img.src = p.fb || catSrc('orange');
  if (p.fbPos) img.style.objectPosition = p.fbPos;
  if (!p.fb) img.parentNode.classList.add('ph');
  img.parentNode.dataset.missing = 'poses/fanshu-' + k + '.png';
}
// o: w,h,r,cls,style,pos
function poseImg(k, o = {}){
  const p = POSES[k], w = o.w || 120, h = o.h || w;
  return `<span class="pframe ${o.cls||''}" style="width:${w}px;height:${h}px;border-radius:${o.r ?? '16px'};${o.style||''}"><img src="${p.src}" alt="番薯${p.zh}" style="object-position:${o.pos||p.pos}" onerror="poseFallback(this,'${k}')"></span>`;
}
