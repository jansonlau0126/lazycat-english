// injects status bar / top bar / tab bar
const IC = {
  home:'<svg viewBox="0 0 24 24"><path d="M4 11.5 12 5l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-5h-6v5H5.5A1.5 1.5 0 0 1 4 19z" fill="currentColor"/></svg>',
  map:'<svg viewBox="0 0 24 24"><path d="M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M9 4.5v13M15 6.5v13" stroke="currentColor" stroke-width="2"/></svg>',
  cards:'<svg viewBox="0 0 24 24"><rect x="7" y="3.5" width="13" height="16" rx="3" fill="currentColor" opacity=".45"/><rect x="4" y="5.5" width="13" height="16" rx="3" fill="currentColor"/><path d="M7.5 10h6M7.5 13.5h6M7.5 17h4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>',
  paw:'<svg viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="16" rx="5.2" ry="4.4"/><ellipse cx="6" cy="10.5" rx="2.2" ry="2.8"/><ellipse cx="18" cy="10.5" rx="2.2" ry="2.8"/><ellipse cx="9.3" cy="6.3" rx="2.1" ry="2.7"/><ellipse cx="14.7" cy="6.3" rx="2.1" ry="2.7"/></svg>',
  me:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="4" fill="currentColor"/><path d="M4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6z" fill="currentColor"/></svg>',
};
function statusBar(){
  return `<div class="status"><span>9:41</span><span class="ic">
  <svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="#5B4636"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="#5B4636"/><rect x="10" y="3" width="3" height="9" rx="1" fill="#5B4636"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#5B4636"/></svg>
  <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0zM3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.4 1.4a4.5 4.5 0 0 0-6.4 0zM1 4.4a9.9 9.9 0 0 1 14 0l-1.4 1.4a7.9 7.9 0 0 0-11.2 0z" fill="#5B4636"/></svg>
  <svg width="26" height="12" viewBox="0 0 26 12"><rect x=".5" y=".5" width="22" height="11" rx="3.5" fill="none" stroke="#5B4636" opacity=".5"/><rect x="2.5" y="2.5" width="16" height="7" rx="2" fill="#5B4636"/><rect x="23.5" y="4" width="2" height="4" rx="1" fill="#5B4636" opacity=".5"/></svg></span></div>`;
}
function topBar(){
  return `<div class="topbar"><div class="brand">${catPhoto('orange',{w:32,mode:'face',cls:'ring2',style:'margin-right:3px'})}懶貓英文</div>
  <div class="stats"><span class="stat fire"><i class="emoji">🔥</i>12</span><span class="stat xp"><i class="emoji">⭐</i>340</span><span class="stat heart"><i class="emoji">❤️</i>5</span></div></div>`;
}
function tabBar(on){
  const t=[['home','首頁'],['map','地圖'],['cards','生字卡'],['paw','貓貓'],['me','我']];
  return `<nav class="tabs">${t.map(([k,l])=>`<div class="tab ${k===on?'on':''}">${IC[k]}<span>${l}</span></div>`).join('')}</nav>`;
}
