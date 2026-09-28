// Theme 5 食物 Food — 25 words (British IPA). Row = one learning day (Mon–Fri).
// v2: first field = hand-drawn icon name (cats-photo/icons/); fruit→grapes, salty→salt via ICON_FOR
const FOOD = [
 ['rice','rice','/raɪs/','飯；米'],['noodles','noodles','/ˈnuːdlz/','麵'],['bread','bread','/bred/','麵包'],['egg','egg','/eɡ/','蛋'],['chicken','chicken','/ˈtʃɪkɪn/','雞；雞肉'],
 ['beef','beef','/biːf/','牛肉'],['pork','pork','/pɔːk/','豬肉'],['fish','fish','/fɪʃ/','魚'],['shrimp','shrimp','/ʃrɪmp/','蝦'],['vegetable','vegetable','/ˈvedʒtəbl/','蔬菜'],
 ['tomato','tomato','/təˈmɑːtəʊ/','番茄'],['carrot','carrot','/ˈkærət/','紅蘿蔔'],['fruit','fruit','/fruːt/','水果'],['apple','apple','/ˈæpl/','蘋果'],['banana','banana','/bəˈnɑːnə/','香蕉'],
 ['orange','orange','/ˈɒrɪndʒ/','橙'],['soup','soup','/suːp/','湯'],['sandwich','sandwich','/ˈsænwɪtʃ/','三文治'],['dumpling','dumpling','/ˈdʌmplɪŋ/','餃子'],['cake','cake','/keɪk/','蛋糕'],
 ['cheese','cheese','/tʃiːz/','芝士'],['sweet','sweet','/swiːt/','甜'],['salty','salty','/ˈsɔːlti/','鹹'],['spicy','spicy','/ˈspaɪsi/','辣'],['delicious','delicious','/dɪˈlɪʃəs/','好味；美味'],
];
const DAYCOL = ['#FFF3E0','#FDEBF0','#EEF7EC','#EAF4FB','#F2EEFB'];
const DAYS = ['一','二','三','四','五'];
function vocabCard(ipa=true){
  return `<div class="vc">
  <div class="vc-head">
    <div class="vc-cat">${catPhoto('hero',{w:84,h:62,r:'14px',cls:'ring2',src:catSrc('hero'),box:{cx:HERO.faceX+150,cy:HERO.faceY+20,h:330}})}</div>
    <div class="vc-title">
      <div class="vc-kicker">第 1 季 ・ 第 5 週 ・ 主題生字卡</div>
      <div class="vc-name">${foodIcon('food',28,'display:inline-block;vertical-align:-5px')} 食物 <span>Food</span></div>
    </div>
    <div class="vc-count"><b>25</b>個字</div>
  </div>
  <div class="vc-grid">
   ${FOOD.map((w,i)=>`<div class="vc-cell" style="background:${DAYCOL[Math.floor(i/5)]}">
     ${foodIcon(w[0],30,'margin:-2px 0 0')}<b>${w[1]}</b>${ipa?`<small>${w[2]}</small>`:''}<span>${w[3]}</span></div>`).join('')}
  </div>
  <div class="vc-foot"><span><i class="emoji">🐾</i> Janson 已完成 ・ 2026 年 10 月 2 日</span><span class="vc-logo">懶貓英文</span></div>
  </div>`;
}
