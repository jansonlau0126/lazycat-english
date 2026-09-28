(function () {
"use strict";
/* ================= helpers ================= */
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, n) => shuffle(a).slice(0, n);
const rand = a => a[Math.floor(Math.random() * a.length)];
function shuffleNE(a) { if (a.length < 2) return a.slice(); let s, k = 0; do { s = shuffle(a); k++; } while (s.join("\u0001") === a.join("\u0001") && k < 20); return s; }

/* ================= constants ================= */
const APP_NAME = "包仔英文";
const KEY = "baozai-english-v1";
const MAX_HEARTS = 5, HEART_MS = 30 * 60 * 1000;
const NEW_DAYS = 30, TOTAL_DAYS = 60;
const INTERVALS = [0, 1, 3, 7, 14, 30];           // Leitner box -> days until next review
const LEVELS = ["未學", "初見", "學緊", "熟悉", "幾熟", "掌握"];
const PRAISE = ["好嘢！", "正呀！", "勁喎！", "做得好！", "冇得頂！", "叻叻豬！", "答啱咗！"];
const OFFS = [0, 44, 70, 44, 0, -44, -70, -44];
const UNITS = [null,
  { t: "日常生活", e: "🍳" }, { t: "返工必備", e: "💼" }, { t: "出街・健康・做人", e: "✈️" },
  { t: "職場進階", e: "🌱" }, { t: "溝通・計劃", e: "🗣️" }, { t: "溫故知新 I", e: "🔁" },
  { t: "溫故知新 II", e: "🧠" }, { t: "溫故知新 III", e: "💡" }, { t: "最後衝刺", e: "🏁" }];
const TYPE_LABEL = { listen: "🎧 聽音揀字", meaning: "💬 揀中文意思", reverse: "🔤 揀英文生字", fill: "✏️ 句子填充", spell: "🧩 串字", arrange: "🧱 砌句子", match: "🔗 配對", gmc: "📘 文法選擇", gfill: "⌨️ 文法填充", gtiles: "🧱 砌句子" };

/* ================= state ================= */
function defaultState() {
  return { v: 1, dayOffset: 0, xp: 0, xpByDate: {}, streak: 0, bestStreak: 0, lastActive: null, activeDates: [],
    done: {}, lastDayLessonDate: null, srs: {}, hearts: MAX_HEARTS, heartsAt: Date.now(), goal: 20,
    unlockAll: false, unlimited: false, sound: true, voice: "", startDate: null, lessons: 0, perfect: 0 };
}
function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) return Object.assign(defaultState(), s); } catch (e) {} return defaultState(); }
let S = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

/* ================= dates ================= */
const pad = n => String(n).padStart(2, "0");
const dstr = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
function nowDate() { const d = new Date(); d.setDate(d.getDate() + S.dayOffset); return d; }
const today = () => dstr(nowDate());
function addDays(ds, n) { const [y, m, d] = ds.split("-").map(Number); return dstr(new Date(y, m - 1, d + n)); }
function diffDays(a, b) { const pa = a.split("-").map(Number), pb = b.split("-").map(Number); return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000); }

/* ================= streak / xp / hearts ================= */
function currentStreak() { if (!S.lastActive) return 0; return diffDays(S.lastActive, today()) <= 1 ? S.streak : 0; }
function markActive() {
  const t = today(); if (S.lastActive === t) return false;
  const d = S.lastActive ? diffDays(S.lastActive, t) : 99;
  S.streak = d === 1 ? S.streak + 1 : 1; S.lastActive = t;
  if (!S.activeDates.includes(t)) S.activeDates.push(t);
  S.bestStreak = Math.max(S.bestStreak, S.streak);
  if (!S.startDate) S.startDate = t;
  return true;
}
function addXP(n) { const t = today(); S.xp += n; S.xpByDate[t] = (S.xpByDate[t] || 0) + n; }
const todayXP = () => S.xpByDate[today()] || 0;
function refillHearts() {
  if (S.hearts >= MAX_HEARTS) { S.heartsAt = Date.now(); return; }
  const n = Math.floor((Date.now() - S.heartsAt) / HEART_MS);
  if (n > 0) { S.hearts = Math.min(MAX_HEARTS, S.hearts + n); S.heartsAt += n * HEART_MS; if (S.hearts >= MAX_HEARTS) S.heartsAt = Date.now(); save(); }
}
function loseHeart() { if (S.unlimited) return; if (S.hearts >= MAX_HEARTS) S.heartsAt = Date.now(); S.hearts = Math.max(0, S.hearts - 1); save(); }
function heartCountdown() { const ms = Math.max(0, HEART_MS - (Date.now() - S.heartsAt)); const m = Math.floor(ms / 60000), s = Math.floor(ms % 60000 / 1000); return m + ":" + pad(s); }

/* ================= SRS (Leitner) ================= */
function srsUpdate(results) {
  const t = today();
  for (const id in results) {
    const r = S.srs[id] || { box: 0, due: t, seen: 0, right: 0, wrong: 0, learned: t };
    r.seen++;
    if (results[id]) { r.box = Math.min(5, r.box + 1); r.right++; r.due = addDays(t, INTERVALS[r.box]); }
    else { r.box = 1; r.wrong++; r.due = t; }   // 答錯：跌返第 1 格，今日再複習
    S.srs[id] = r;
  }
}
const learnedWords = () => WORDS.filter(w => S.srs[w.id]);
const dueWords = () => WORDS.filter(w => S.srs[w.id] && S.srs[w.id].due <= today()).sort((a, b) => S.srs[a.id].box - S.srs[b.id].box);
function weakest(n) { return shuffle(learnedWords()).sort((a, b) => (S.srs[a.id].box - S.srs[b.id].box) || (S.srs[b.id].wrong - S.srs[a.id].wrong)).slice(0, n); }
const wordsOfDay = d => WORDS.filter(w => w.day === d);

/* ================= path ================= */
function buildPath() {
  const nodes = [];
  for (let d = 1; d <= TOTAL_DAYS; d++) {
    const unit = Math.min(9, Math.ceil(d / 7));
    nodes.push({ id: "d" + d, type: d <= NEW_DAYS ? "day" : "rday", day: d, unit });
    if (d % 7 === 0) { const k = d / 7; if (k <= GRAMMAR.length) nodes.push({ id: "g" + k, type: "g", k, unit }); nodes.push({ id: "w" + k, type: "w", k, unit }); }
    if (d % 30 === 0) nodes.push({ id: "m" + d / 30, type: "m", k: d / 30, unit });
  }
  return nodes;
}
const PATH = buildPath();
const isDone = id => !!S.done[id];
const firstIncomplete = () => PATH.findIndex(n => !isDone(n.id));
function nodeState(i, cur) {
  const n = PATH[i];
  if (isDone(n.id)) return "done";
  if (!S.unlockAll && (cur < 0 || i > cur)) return "locked";
  if (!S.unlockAll && (n.type === "day" || n.type === "rday") && S.lastDayLessonDate === today()) return "sleep";
  return "avail";
}
function nodeInfo(n) {
  switch (n.type) {
    case "day": return { icon: "⭐", cls: "", title: `第 ${n.day} 日：3 個新字`, desc: wordsOfDay(n.day).map(w => w.w).join(" · "), xp: 10 };
    case "rday": return { icon: "🔁", cls: "r", title: `第 ${n.day} 日：每日溫習`, desc: "溫返到期同唔熟嘅字，鞏固記憶。", xp: 10 };
    case "g": { const g = GRAMMAR[n.k - 1]; return { icon: g.emoji, cls: "g", title: `文法 ${n.k}：${g.title}`, desc: g.en, xp: 15 }; }
    case "w": return { icon: "🏋️", cls: "w", title: `第 ${n.k} 週總複習`, desc: n.k <= 4 ? `重溫第 ${n.k * 7 - 6}–${n.k * 7} 日嘅 21 個字` : "隨機重溫之前學過嘅字", xp: 20 };
    case "m": return { icon: "🏆", cls: "m", title: `第 ${n.k} 個月大複習`, desc: n.k === 1 ? "挑戰第 1–30 日學過嘅 90 個字！" : "全部 90 個字大考驗！", xp: 40 };
  }
}

/* ================= speech ================= */
const TTS = {
  ok: "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined", voices: [],
  init() { if (!this.ok) return; const ld = () => { try { this.voices = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang)); } catch (e) {} }; ld(); try { speechSynthesis.onvoiceschanged = () => { ld(); if (tab === "me" && !L) renderTab(); }; } catch (e) {} },
  pick() {
    if (S.voice) { const v = this.voices.find(v => v.name === S.voice); if (v) return v; }
    for (const re of [/en[-_]GB/i, /en[-_]US/i]) { const c = this.voices.filter(v => re.test(v.lang)); if (c.length) return c.find(v => /Google|Natural|Enhanced|Premium|Siri|Daniel|Samantha|Serena|Kate/i.test(v.name)) || c[0]; }
    return this.voices[0] || null;
  },
  speak(text, slow) {
    if (!this.ok) { toast("你部機唔支援發音 😢"); return; }
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); const v = this.pick(); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-GB"; u.rate = slow ? 0.55 : 0.9; speechSynthesis.speak(u); } catch (e) {}
  }
};
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
function listenWord(target, btn) {
  const out = btn.closest(".lcard").querySelector(".mic-res");
  let r; try { r = new SR(); } catch (e) { out.textContent = "你部機唔支援語音辨識"; return; }
  r.lang = "en-GB"; r.interimResults = false; r.maxAlternatives = 5;
  btn.classList.add("rec"); out.textContent = "🎙️ 聽緊…請讀出：" + target;
  r.onresult = e => { const alts = Array.from(e.results[0]).map(a => a.transcript.toLowerCase().trim()); const ok = alts.some(a => a.includes(target.toLowerCase())); out.innerHTML = ok ? `✅ 讀得好！我聽到「${esc(alts[0])}」` : `🤔 我聽到「${esc(alts[0])}」，再試一次？`; if (ok) beep("ok"); };
  r.onerror = e => { out.textContent = e.error === "not-allowed" ? "要允許使用咪高峰先得 🎤" : "聽唔清楚，再試下 🙏"; };
  r.onend = () => btn.classList.remove("rec");
  try { r.start(); } catch (e) { btn.classList.remove("rec"); }
}

/* ================= sound fx ================= */
let AC = null;
function beep(kind) {
  if (!S.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const seq = kind === "ok" ? [[660, 0], [990, .09]] : kind === "bad" ? [[196, 0], [155, .13]] : [[523, 0], [659, .12], [784, .24], [1047, .38]];
    seq.forEach(([f, t]) => {
      const o = AC.createOscillator(), g = AC.createGain(), t0 = AC.currentTime + t;
      o.type = kind === "bad" ? "sawtooth" : "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(kind === "bad" ? 0.06 : 0.16, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
      o.connect(g); g.connect(AC.destination); o.start(t0); o.stop(t0 + 0.3);
    });
  } catch (e) {}
}

/* ================= mascot (original: 包仔, a steamed bun with a sprout) ================= */
function mascot(mood) {
  mood = mood || "happy";
  const cheer = mood === "cheer", sad = mood === "sad", think = mood === "think";
  const eyes = cheer
    ? `<path d="M39 66 Q46 57 53 66" stroke="#2B2B2B" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M67 66 Q74 57 81 66" stroke="#2B2B2B" stroke-width="4.5" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="46" cy="65" rx="6.5" ry="8" fill="#2B2B2B"/><ellipse cx="74" cy="65" rx="6.5" ry="8" fill="#2B2B2B"/><circle cx="44" cy="61.5" r="2.4" fill="#fff"/><circle cx="72" cy="61.5" r="2.4" fill="#fff"/>` +
      (sad ? `<path d="M37 56 Q44 54 51 50" stroke="#6B4A2B" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M83 56 Q76 54 69 50" stroke="#6B4A2B" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M86 72 q3 6 0 8 q-3 -2 0 -8z" fill="#7CC8FF"/>` : "") +
      (think ? `<path d="M38 54 Q45 50 52 54" stroke="#6B4A2B" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M68 51 Q75 47 82 51" stroke="#6B4A2B" stroke-width="3" fill="none" stroke-linecap="round"/>` : "");
  const mouth = sad ? `<path d="M52 84 Q60 77 68 84" stroke="#7A3326" stroke-width="3.5" fill="none" stroke-linecap="round"/>`
    : think ? `<ellipse cx="62" cy="81" rx="4" ry="3.5" fill="#7A3326"/>`
    : `<path d="M51 76 Q60 89 69 76 Z" fill="#7A3326"/><path d="M55 81 Q60 86 65 81 Q60 79 55 81Z" fill="#FF8A8A"/>`;
  const arms = cheer
    ? `<path d="M20 70 Q8 56 12 44" stroke="#EBCB9F" stroke-width="3" fill="#FFF8EC"/><ellipse cx="14" cy="46" rx="7" ry="9" fill="#FFF8EC" stroke="#EBCB9F" stroke-width="3" transform="rotate(-20 14 46)"/><ellipse cx="106" cy="46" rx="7" ry="9" fill="#FFF8EC" stroke="#EBCB9F" stroke-width="3" transform="rotate(20 106 46)"/>
       <path d="M8 26 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#FFC800"/><path d="M110 22 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6z" fill="#FFC800"/><path d="M100 8 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2z" fill="#58C80A"/>`
    : `<ellipse cx="17" cy="84" rx="7" ry="9" fill="#FFF8EC" stroke="#EBCB9F" stroke-width="3" transform="rotate(25 17 84)"/><ellipse cx="103" cy="84" rx="7" ry="9" fill="#FFF8EC" stroke="#EBCB9F" stroke-width="3" transform="rotate(-25 103 84)"/>`;
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-label="包仔">
  <ellipse cx="60" cy="110" rx="36" ry="5" fill="#000" opacity=".08"/>
  ${cheer ? arms : ""}
  <path d="M16 86 C12 54 34 28 60 26 C86 28 108 54 104 86 C104 102 84 106 60 106 C36 106 16 102 16 86 Z" fill="#FFF8EC" stroke="#EBCB9F" stroke-width="3"/>
  <path d="M26 92 C40 100 80 100 94 92" stroke="#F3DFC0" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M60 31 C55 37 49 40 42 41 M60 31 C65 37 71 40 78 41 M60 31 C58 38 54 43 49 47 M60 31 C62 38 66 43 71 47" stroke="#E9C79A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <circle cx="60" cy="29" r="5" fill="#F6DDB6"/>
  <path d="M60 26 Q59 18 61 12" stroke="#3F8F00" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M61 14 Q70 4 80 9 Q72 18 61 14Z" fill="#58C80A"/><path d="M60 16 Q52 8 44 12 Q51 20 60 16Z" fill="#7BDB2F"/>
  ${cheer ? "" : arms}
  <ellipse cx="35" cy="78" rx="7.5" ry="4.8" fill="#FF9EAA" opacity=".75"/><ellipse cx="85" cy="78" rx="7.5" ry="4.8" fill="#FF9EAA" opacity=".75"/>
  ${eyes}${mouth}
</svg>`;
}

/* ================= UI helpers ================= */
function toast(msg, ms) { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; $("#app").appendChild(t); setTimeout(() => t.remove(), ms || 2000); }
function modal(html, onMount) {
  closeModal(); const bg = document.createElement("div"); bg.className = "modal-bg"; bg.id = "modal";
  bg.innerHTML = `<div class="modal">${html}</div>`; bg.addEventListener("click", e => { if (e.target === bg) closeModal(); });
  $("#app").appendChild(bg); if (onMount) onMount(bg);
}
function closeModal() { const m = $("#modal"); if (m) m.remove(); if (heartTimer) { clearInterval(heartTimer); heartTimer = null; } }
const sayBtn = (text, cls) => `<button class="snd ${cls || ""}" data-say="${esc(text)}" aria-label="發音">🔊</button>`;
const slowBtn = (text, cls) => `<button class="snd turtle ${cls || ""}" data-say="${esc(text)}" data-slow="1" aria-label="慢速">🐢</button>`;
function highlight(sentence, word) { return esc(sentence).replace(new RegExp("\\b(" + word + ")\\b", "i"), "<b>$1</b>"); }

function learnCardHTML(w, isNew) {
  return `<div class="lcard">${isNew ? '<div class="newtag">✨ 新字</div>' : ""}
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
      <div><div class="lword">${esc(w.w)}</div><div class="lipa">${esc(w.ipa)}<span class="lpos">${esc(w.pos)}</span></div></div>
      <div style="display:flex;gap:8px;align-items:center">${sayBtn(w.w)}${slowBtn(w.w, "sm")}</div>
    </div>
    <div class="lzh">${esc(w.zh)}</div>
    <div class="lyue">${esc(w.yue)}</div>
    <div class="lsec"><div class="lab">例句 EXAMPLE</div>
      <div class="lex">${highlight(w.ex, w.w)}</div><div class="lexzh">${esc(w.exZh)}</div>
      <div class="lbtns">${sayBtn(w.ex, "sm")}${slowBtn(w.ex, "sm")}${SR ? `<button class="snd sm mic" data-mic="${esc(w.w)}" aria-label="跟住讀">🎤</button><span style="font-size:13px;color:#8a8a8a;font-weight:700">撳 🎤 跟住讀</span>` : `<span style="font-size:13px;color:#8a8a8a;font-weight:700">撳一下聽發音</span>`}</div>
      <div class="mic-res"></div>
    </div>
    <div class="ltip">💡 <b>用法貼士：</b>${esc(w.tip)}</div>
  </div>`;
}

/* ================= exercise generation ================= */
const posGroup = p => p.replace(/\./g, "");
function distract(w, n, mode) {
  let pool = WORDS.filter(x => x.id !== w.id && x.zh !== w.zh && (mode === "diff" ? posGroup(x.pos) !== posGroup(w.pos) : posGroup(x.pos) === posGroup(w.pos)));
  if (pool.length < n) pool = WORDS.filter(x => x.id !== w.id);
  pool.sort((a, b) => Math.abs(a.day - w.day) - Math.abs(b.day - w.day));
  return sample(pool.slice(0, 15), n);
}
const tokenize = s => s.replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean);
const norm = s => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[.,!?]/g, "").replace(/\s+/g, " ").trim();
function makeEx(t, w, group) {
  switch (t) {
    case "listen": return { t, w, opts: shuffle([w, ...distract(w, 3, "same")]).map(x => x.w), ans: w.w };
    case "meaning": return { t, w, opts: shuffle([w, ...distract(w, 3, "same")]).map(x => x.zh), ans: w.zh };
    case "reverse": return { t, w, opts: shuffle([w, ...distract(w, 3, "same")]).map(x => x.w), ans: w.w };
    case "fill": {
      const m = w.ex.match(new RegExp("\\b" + w.w + "\\b", "i"));
      return { t, w, parts: [w.ex.slice(0, m.index), w.ex.slice(m.index + m[0].length)], opts: shuffle([w, ...distract(w, 3, "diff")]).map(x => x.w), ans: w.w };
    }
    case "spell": {
      const letters = w.w.split("");
      if (letters.length <= 7) { const al = "abcdefghiklmnoprstuvwy".split("").filter(c => !letters.includes(c)); letters.push(...sample(al, 2)); }
      return { t, w, tiles: shuffleNE(letters), ans: w.w };
    }
    case "arrange": {
      const toks = tokenize(w.ex); let extra = [];
      if (toks.length <= 7) { const low = toks.map(x => x.toLowerCase()); const pool = [...new Set(WORDS.filter(x => x.id !== w.id).flatMap(x => tokenize(x.ex).map(y => y.toLowerCase())))].filter(y => !low.includes(y) && y !== "i"); extra = sample(pool, 2); }
      return { t, w, tiles: shuffleNE([...toks, ...extra]), ans: toks.join(" ") };
    }
    case "match": return { t, w, group, left: shuffle(group), right: shuffle(group) };
  }
}
const WORD_TYPES = ["listen", "meaning", "reverse", "fill", "spell", "arrange"];
function genSingles(words, n) {
  const out = []; let last = null, ws = shuffle(words);
  for (let i = 0; i < n; i++) { if (i && i % ws.length === 0) ws = shuffle(words); const w = ws[i % ws.length]; const t = rand(WORD_TYPES.filter(x => x !== last)); last = t; out.push(makeEx(t, w)); }
  return out;
}
function composeReview(words, n, matchGroups) {
  let ws = shuffle(words); const matches = [];
  for (let m = 0; m < matchGroups && ws.length >= 3 + 3; m++) { const g = ws.slice(0, 5); ws = ws.slice(5); matches.push(makeEx("match", g[0], g)); }
  const singles = genSingles(ws.length ? ws : words, Math.max(1, n - matches.length));
  matches.forEach((m, i) => singles.splice(Math.min(singles.length, 2 + i * 5), 0, m));
  return singles;
}
function dayLessonSteps(d) {
  const ws = wordsOfDay(d); const [a, b, c] = shuffle(ws);
  const steps = ws.map(w => ({ k: "card", w }));
  const exs = [makeEx("meaning", a), makeEx("listen", b), makeEx("reverse", c), makeEx("match", a, ws), makeEx("fill", b), makeEx("spell", a), makeEx("arrange", c), makeEx("fill", a)];
  return steps.concat(exs.map(e => ({ k: "ex", e })));
}
function grammarSteps(g) {
  return [{ k: "intro", g }].concat(g.ex.map(x => ({ k: "ex", e: { t: x.t === "mc" ? "gmc" : x.t === "fill" ? "gfill" : "gtiles", g: x, tiles: x.t === "tiles" ? shuffleNE([...tokenize(x.a), ...(x.extra || [])]) : null, opts: x.o } })));
}

/* ================= lesson engine ================= */
let L = null, tab = "learn", heartTimer = null;
function startNode(i) {
  const n = PATH[i], info = nodeInfo(n), replay = isDone(n.id);
  let steps, kind = n.type;
  if (n.type === "day") steps = dayLessonSteps(n.day);
  else if (n.type === "g") steps = grammarSteps(GRAMMAR[n.k - 1]);
  else if (n.type === "rday") {
    let ws = dueWords().slice(0, 8); if (ws.length < 5) ws = ws.concat(weakest(8).filter(w => !ws.includes(w))).slice(0, 6);
    if (ws.length < 3) ws = WORDS.slice(0, 6);
    steps = composeReview(ws, 9, ws.length >= 6 ? 1 : 0).map(e => ({ k: "ex", e }));
  } else if (n.type === "w") {
    let ws = n.k <= 4 ? WORDS.filter(w => w.day > n.k * 7 - 7 && w.day <= n.k * 7) : (learnedWords().length >= 21 ? weakest(40).slice(0, 21) : sample(WORDS, 21));
    steps = composeReview(ws, 14, 2).map(e => ({ k: "ex", e }));      // 2 x 配對 (10 字) + 12 題 = 21 字全部覆蓋
  } else if (n.type === "m") {
    const pool = n.k === 1 ? WORDS.filter(w => w.day <= 30) : WORDS;
    steps = composeReview(sample(pool, 25), 17, 3).map(e => ({ k: "ex", e }));
  }
  startLesson({ kind, nodeId: n.id, title: info.title, steps, xp: replay ? 5 : info.xp, replay, day: n.day });
}
function startReview(practice) {
  let ws = dueWords().slice(0, 10), free = false;
  if (!ws.length || practice) { ws = weakest(practice ? 6 : 8); free = true; }
  if (!ws.length) { ws = WORDS.slice(0, 3); }
  const n = practice ? 6 : Math.min(12, Math.max(6, Math.round(ws.length * 1.3)));
  const steps = composeReview(ws, n, ws.length >= 6 ? 1 : 0).map(e => ({ k: "ex", e }));
  startLesson({ kind: practice ? "practice" : "review", title: practice ? "練習補心" : free ? "自由練習" : "今日複習", steps, xp: practice ? 5 : 10, practice: !!practice });
}
function startGrammar(k) {
  const id = "g" + k, replay = isDone(id);
  startLesson({ kind: "g", nodeId: id, title: "文法 " + k, steps: grammarSteps(GRAMMAR[k - 1]), xp: replay ? 5 : 15, replay });
}
function startLesson(cfg) {
  refillHearts();
  if (!cfg.practice && !S.unlimited && S.hearts <= 0) { heartsModal(true); return; }
  closeModal();
  L = Object.assign(cfg, { queue: cfg.steps.slice(), idx: 0, total: cfg.steps.length, doneCount: 0, mistakes: 0, answered: 0, correct: 0, t0: Date.now(), results: {}, requeued: 0 });
  const el = document.createElement("div"); el.className = "lesson"; el.id = "lesson";
  el.innerHTML = `<div class="lhead"><button class="xbtn" data-act="quit" aria-label="離開">✕</button><div class="lprog"><i></i></div><div class="lhearts">${L.practice || S.unlimited ? "♾️" : "❤️ <span>" + S.hearts + "</span>"}</div></div>
    <div class="lbody"></div><div class="lfoot"><button class="btn" data-act="check">檢查</button></div><div class="fb"></div>`;
  $("#app").appendChild(el);
  renderStep();
}
function updateProgress() { const p = $("#lesson .lprog>i"); if (p) p.style.width = Math.round(100 * L.doneCount / L.total) + "%"; const h = $("#lesson .lhearts span"); if (h) h.textContent = S.hearts; }
function setFoot(label, enabled, act, cls) { $("#lesson .lfoot").innerHTML = `<button class="btn ${cls || ""}" data-act="${act || "check"}" ${enabled ? "" : "disabled"}>${label}</button>`; }
function renderStep() {
  updateProgress();
  const fb = $("#lesson .fb"); fb.className = "fb"; fb.innerHTML = "";
  if (L.idx >= L.queue.length) return finishLesson();
  const st = L.queue[L.idx], body = $("#lesson .lbody"); L.cur = st; L.sel = null; L.chosen = []; L.checked = false;
  body.scrollTop = 0;
  if (st.k === "card") {
    const cards = L.steps.filter(s => s.k === "card"), ci = cards.indexOf(st) + 1;
    body.innerHTML = `<div class="qtype" style="color:var(--green-d)">📖 今日新字 ${ci} / ${cards.length}</div><div class="qtitle">記住呢個字 👇</div>${learnCardHTML(st.w, true)}`;
    setFoot(ci === cards.length ? "明白！開始小測驗 💪" : "明白，下一個 →", true, "next");
    setTimeout(() => TTS.speak(st.w.w), 250);
    return;
  }
  if (st.k === "intro") {
    const g = st.g;
    body.innerHTML = `<div class="qtype">📘 文法小課堂</div><div class="qtitle">${g.emoji} ${esc(g.title)}<div style="font-size:14px;color:var(--muted);font-weight:700;margin-top:2px">${esc(g.en)}</div></div>
      <div class="speech" style="margin-bottom:10px">${mascot("think")}<div class="bubble" style="font-size:15px">睇完解說，跟住做 ${g.ex.length} 條練習！撳 🔊 可以聽例句。</div></div>` +
      g.intro.map(s => `<div class="gcard"><h4>${esc(s.h)}</h4><p>${s.p}</p>${s.ex.map(e => `<div class="gex">${sayBtn(e[0], "sm")}<div><div class="ge">${esc(e[0])}</div><div class="gz">${esc(e[1])}</div></div></div>`).join("")}</div>`).join("");
    setFoot("明白！開始練習 ✍️", true, "next", "purple");
    return;
  }
  renderEx(st.e, body);
}
function optBtns(opts, grid) { return `<div class="opts ${grid ? "grid" : ""}">${opts.map((o, i) => `<button class="opt" data-act="opt" data-i="${i}"><span class="k">${i + 1}</span><span>${esc(o)}</span></button>`).join("")}</div>`; }
function renderEx(e, body) {
  const w = e.w; let h = `<div class="qtype">${TYPE_LABEL[e.t]}</div>`;
  switch (e.t) {
    case "listen":
      h += `<div class="qtitle">你聽到邊個字？</div><div style="display:flex;justify-content:center;gap:14px;align-items:flex-end;margin:10px 0 28px">${sayBtn(w.w, "big")}${slowBtn(w.w)}</div>` + optBtns(e.opts, true);
      setTimeout(() => TTS.speak(w.w), 300); break;
    case "meaning":
      h += `<div class="qtitle">呢個字係咩意思？</div><div class="speech">${mascot("happy")}<div class="bubble"><span style="display:flex;align-items:center;gap:10px">${sayBtn(w.w, "sm")}<span style="font-size:24px">${esc(w.w)}</span></span></div></div>` + optBtns(e.opts);
      setTimeout(() => TTS.speak(w.w), 300); break;
    case "reverse":
      h += `<div class="qtitle">揀出啱嘅英文字</div><div class="speech">${mascot("think")}<div class="bubble">「${esc(w.zh)}」<br><span style="font-size:14px;color:var(--muted)">英文點講？</span></div></div>` + optBtns(e.opts, true); break;
    case "fill":
      h += `<div class="qtitle">揀啱嘅字填入空格</div><div class="sentence">${esc(e.parts[0])}<span class="blank" id="blank">&nbsp;</span>${esc(e.parts[1])}</div><div class="hint">${esc(w.exZh)}</div>` + optBtns(e.opts, true); break;
    case "spell":
      h += `<div class="qtitle">用字母串出呢個字</div><div class="speech">${mascot("happy")}<div class="bubble">「${esc(w.zh)}」<div style="display:flex;gap:8px;margin-top:8px">${sayBtn(w.w, "sm")}${slowBtn(w.w, "sm")}</div></div></div>
        <div class="answer-line spell" id="ans"></div><div class="bank" id="bank">${e.tiles.map((c, i) => `<button class="tile letter" data-act="tile" data-i="${i}">${esc(c)}</button>`).join("")}</div>`; break;
    case "arrange": case "gtiles": {
      const zh = e.t === "arrange" ? w.exZh : e.g.zh;
      h += `<div class="qtitle">將句子翻譯做英文</div><div class="speech">${mascot("happy")}<div class="bubble">${esc(zh)}</div></div>
        <div class="answer-line" id="ans"></div><div class="bank" id="bank">${e.tiles.map((c, i) => `<button class="tile" data-act="tile" data-i="${i}">${esc(c)}</button>`).join("")}</div>`; break;
    }
    case "match":
      L.match = { l: null, r: null, done: new Set() };
      h += `<div class="qtitle">撳一下，將英文同中文配對</div><div class="row" style="gap:12px">
        <div class="opts">${e.left.map(x => `<button class="opt" style="justify-content:center" data-act="m" data-side="l" data-id="${x.id}">${esc(x.w)}</button>`).join("")}</div>
        <div class="opts">${e.right.map(x => `<button class="opt" style="justify-content:center;font-size:15px" data-act="m" data-side="r" data-id="${x.id}">${esc(x.zh)}</button>`).join("")}</div></div>`; break;
    case "gmc": case "gfill": {
      const q = esc(e.g.q).replace("___", `<span class="blank" id="blank">&nbsp;</span>`);
      h += `<div class="qtitle">${e.t === "gmc" ? "揀啱嘅答案" : "打字填充"}</div><div class="sentence">${q}</div><div class="hint">${esc(e.g.zh)}</div>`;
      h += e.t === "gmc" ? optBtns(e.opts) : `<input class="tinput" id="tin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="喺度打答案…">`;
      break;
    }
  }
  body.innerHTML = h;
  setFoot("檢查", false);
  if (e.t === "gfill") { const inp = $("#tin"); inp.addEventListener("input", () => { L.sel = inp.value; $("#blank").textContent = inp.value || "\u00a0"; $("#lesson .lfoot .btn").disabled = !inp.value.trim(); }); inp.addEventListener("keydown", ev => { if (ev.key === "Enter" && inp.value.trim()) check(); }); }
  if (e.t === "match") setFoot("檢查", false);
}
function renderTiles() {
  const e = L.cur.e;
  $("#ans").innerHTML = L.chosen.map((ti, j) => `<button class="tile ${e.t === "spell" ? "letter" : ""}" data-act="untile" data-j="${j}">${esc(e.tiles[ti])}</button>`).join("");
  $$("#bank .tile").forEach(b => b.classList.toggle("used", L.chosen.includes(+b.dataset.i)));
  $("#lesson .lfoot .btn").disabled = L.chosen.length === 0;
}
function onMatch(btn) {
  const m = L.match, side = btn.dataset.side, id = +btn.dataset.id; if (m.done.has(id)) return;
  $$(`#lesson [data-act="m"][data-side="${side}"]`).forEach(b => b.classList.remove("sel"));
  btn.classList.add("sel"); m[side] = id;
  if (side === "l") { const w = WORDS[id]; TTS.speak(w.w); }
  if (m.l != null && m.r != null) {
    const bl = $(`#lesson [data-side="l"][data-id="${m.l}"]`), br = $(`#lesson [data-side="r"][data-id="${m.r}"]`);
    if (m.l === m.r) {
      m.done.add(m.l); [bl, br].forEach(b => { b.classList.remove("sel"); b.classList.add("right"); b.style.pointerEvents = "none"; }); beep("ok");
      setTimeout(() => [bl, br].forEach(b => { b.style.opacity = ".45"; }), 350);
    } else {
      L.results[m.l] = false; L.mistakes++; [bl, br].forEach(b => { b.classList.remove("sel"); b.classList.add("wrong"); }); beep("bad");
      setTimeout(() => [bl, br].forEach(b => b.classList.remove("wrong")), 450);
    }
    m.l = m.r = null;
    if (m.done.size === L.cur.e.group.length) {
      L.cur.e.group.forEach(w => { if (L.results[w.id] !== false) L.results[w.id] = true; });
      setTimeout(() => showFeedback(true, "全部配對完成！"), 450);
    }
  }
}
function check() {
  if (L.checked) return; const e = L.cur.e; let ok = false, ansText = "", detail = "";
  switch (e.t) {
    case "listen": case "reverse": case "fill": case "meaning": ok = L.sel != null && e.opts[L.sel] === e.ans; break;
    case "spell": ok = L.chosen.map(i => e.tiles[i]).join("") === e.ans; break;
    case "arrange": ok = norm(L.chosen.map(i => e.tiles[i]).join(" ")) === norm(e.ans); break;
    case "gtiles": ok = norm(L.chosen.map(i => e.tiles[i]).join(" ")) === norm(e.g.a); break;
    case "gmc": ok = L.sel === e.g.a; break;
    case "gfill": ok = e.g.a.some(a => norm(a) === norm(L.sel || "")); break;
  }
  L.checked = true;
  if (e.w) { L.results[e.w.id] = (L.results[e.w.id] !== false) && ok; }
  const w = e.w;
  if (["listen", "reverse", "fill", "spell"].includes(e.t)) { ansText = w.w; detail = `${w.w} ${w.ipa} ＝ ${w.zh}`; }
  if (e.t === "meaning") { ansText = w.zh; detail = `${w.w} ${w.ipa} ＝ ${w.zh}`; }
  if (e.t === "arrange") { ansText = w.ex; detail = w.exZh; }
  if (e.t === "gmc") { ansText = e.g.q.replace("___", e.g.o[e.g.a]); detail = e.g.why; }
  if (e.t === "gfill") { ansText = e.g.q.replace("___", e.g.a[0]).replace(/\s*\(.*?\)\s*/g, " ").trim(); detail = e.g.why; }
  if (e.t === "gtiles") { ansText = e.g.a; detail = e.g.why; }
  // mark options
  const opts = $$("#lesson .opt[data-act='opt']");
  if (opts.length) {
    $("#lesson .opts").classList.add("lock");
    const correctIdx = e.t === "gmc" ? e.g.a : e.opts.indexOf(e.ans);
    opts.forEach((b, i) => { if (i === correctIdx) b.classList.add("right"); else if (i === L.sel) b.classList.add("wrong"); b.classList.remove("sel"); });
  }
  if (e.t === "fill" || e.t === "gmc") { const bl = $("#blank"); if (bl) bl.textContent = e.t === "fill" ? e.ans : e.g.o[e.g.a]; }
  if (e.t === "gfill") $("#tin").disabled = true;
  $$("#lesson .tile").forEach(b => b.style.pointerEvents = "none");
  showFeedback(ok, ok ? detail : "", ok ? "" : ansText, ok ? "" : detail);
  if (ok && (e.t === "arrange")) TTS.speak(w.ex);
  if (ok && (e.t === "gtiles")) TTS.speak(e.g.a);
}
function showFeedback(ok, okDetail, ans, why) {
  L.checked = true; L.answered++; const fb = $("#lesson .fb");
  if (ok) { L.correct++; L.doneCount++; beep("ok"); }
  else { L.mistakes++; beep("bad"); loseHeart(); if (L.requeued < 6) { L.queue.push(L.cur); L.requeued++; } else L.doneCount++; }
  updateProgress();
  fb.className = "fb " + (ok ? "ok" : "bad");
  fb.innerHTML = ok
    ? `<div class="fh"><span class="fi">✅</span>${rand(PRAISE)}</div>${okDetail ? `<p class="fd">${esc(okDetail)}</p>` : ""}<button class="btn" data-act="continue">繼續</button>`
    : `<div class="fh"><span class="fi">❌</span>唔啱喎…</div><p class="fd"><b>正確答案：</b>${esc(ans)}${why ? `<br><span style="font-weight:600">${esc(why)}</span>` : ""}</p><button class="btn" data-act="continue">知道喇</button>`;
  requestAnimationFrame(() => requestAnimationFrame(() => fb.classList.add("show")));
  setFoot("檢查", false);
}
function onContinue() {
  if (!L.practice && !S.unlimited && S.hearts <= 0) { heartsModal(true); return; }
  L.idx++; renderStep();
}
function finishLesson() {
  const t = today(), perfect = L.mistakes === 0;
  const before = todayXP();
  const xp = L.xp + (perfect && !L.replay ? 5 : 0);
  addXP(xp); const ext = markActive(); S.lessons++; if (perfect) S.perfect++;
  if (Object.keys(L.results).length && L.kind !== "g") srsUpdate(L.results);
  if (L.nodeId) { const prev = S.done[L.nodeId]; S.done[L.nodeId] = { date: prev ? prev.date : t, n: (prev ? prev.n : 0) + 1 }; }
  if (!L.replay && (L.kind === "day" || L.kind === "rday")) S.lastDayLessonDate = t;
  if (L.practice) { S.hearts = MAX_HEARTS; S.heartsAt = Date.now(); }
  save();
  const secs = Math.round((Date.now() - L.t0) / 1000), acc = L.answered ? Math.round(100 * L.correct / L.answered) : 100;
  const goalHit = before < S.goal && todayXP() >= S.goal;
  const titles = { day: "今日課程完成！", rday: "溫習完成！", g: "文法課完成！", w: "週複習完成！", m: "月度大複習完成！", review: "複習完成！", practice: "練習完成，心已補滿！❤️" };
  const learned = L.kind === "day" && !L.replay ? `<div class="learned">📚 今日學咗：${wordsOfDay(L.day).map(w => `<span>${esc(w.w)}</span>`).join("")}</div>` : "";
  const body = $("#lesson .lbody");
  $("#lesson .lhead").style.visibility = "hidden";
  body.innerHTML = `<div class="complete"><div class="celebrate" style="width:170px;height:170px">${mascot("cheer")}</div>
    <h2>${titles[L.kind] || "完成！"}</h2><div class="sub">${perfect ? "零錯誤！包仔好欣賞你 🌟" : "包仔同你一齊進步緊 💪"}</div>
    <div class="cstats"><div class="cstat"><div class="cl">總 XP</div><div class="cv">⚡ ${xp}</div></div>
      <div class="cstat g"><div class="cl">${acc >= 90 ? "準確度・好勁" : "準確度"}</div><div class="cv">🎯 ${acc}%</div></div>
      <div class="cstat b"><div class="cl">用時</div><div class="cv">⏱️ ${Math.floor(secs / 60)}:${pad(secs % 60)}</div></div></div>
    ${learned}
    ${ext ? `<div class="learned" style="color:var(--orange)">🔥 連續學習 ${S.streak} 日！</div>` : ""}
    ${goalHit ? `<div class="learned" style="color:var(--gold-d)">🎯 今日目標達成！</div>` : ""}</div>`;
  $("#lesson .fb").className = "fb";
  setFoot("繼續", true, "done");
  beep("win"); confetti();
}
function confetti() {
  const box = $("#lesson .complete"); if (!box) return;
  const cols = ["#58C80A", "#1CB0F6", "#FFC800", "#FF4B4B", "#B46CF0", "#FF9600"];
  for (let i = 0; i < 40; i++) { const c = document.createElement("i"); c.className = "confetti"; c.style.left = Math.random() * 100 + "%"; c.style.background = rand(cols); c.style.animationDuration = 1.8 + Math.random() * 1.8 + "s"; c.style.animationDelay = Math.random() * .6 + "s"; box.appendChild(c); }
}
function closeLesson() { const el = $("#lesson"); if (el) el.remove(); L = null; try { speechSynthesis.cancel(); } catch (e) {} closeModal(); render(); }

/* ================= modals ================= */
function heartsModal(fromLesson) {
  refillHearts();
  const full = S.hearts >= MAX_HEARTS;
  modal(`<div style="width:110px;height:110px;margin:0 auto">${mascot(S.hearts ? "happy" : "sad")}</div>
    <h3>${S.hearts ? "你嘅心心" : "心已經用晒！💔"}</h3>
    <div class="mhearts">${"❤️".repeat(S.hearts)}${"🤍".repeat(MAX_HEARTS - S.hearts)}</div>
    <p class="mp">${full ? "心心全滿，去學嘢啦！" : `每 30 分鐘補返 1 粒心<br>下一粒：<b id="hcd">${heartCountdown()}</b>`}<br>答錯會扣 1 粒心；做一次「練習」可以即刻補滿。</p>
    ${full ? "" : `<button class="btn blue" data-act="practice">💪 練習補心（唔會扣心）</button>`}
    <button class="btn ghost" data-act="${fromLesson ? "quitnow" : "close"}">${fromLesson ? "結束課程" : "關閉"}</button>`);
  if (!full) heartTimer = setInterval(() => { refillHearts(); const el = $("#hcd"); if (el) el.textContent = heartCountdown(); renderTop(); }, 1000);
}
function wordModal(w) { modal(learnCardHTML(w) + `<button class="btn ghost" data-act="close">關閉</button>`); }
function devModal() {
  const cur = firstIncomplete();
  modal(`<h3>🛠 開發者面板</h3><div class="devinfo">模擬日期：${today()}（偏移 ${S.dayOffset} 日）<br>下一個節點：${cur >= 0 ? PATH[cur].id + "・" + nodeInfo(PATH[cur]).title : "全部完成"}<br>已學字：${learnedWords().length}・今日到期：${dueWords().length}・心：${S.hearts}<br>全部解鎖：${S.unlockAll ? "開" : "關"}・無限心：${S.unlimited ? "開" : "關"}</div>
  <div class="devbtns">
    <button class="btn blue" data-act="dev" data-d="nextday">⏭️ 跳去聽日</button>
    <button class="btn" data-act="dev" data-d="simday">⏩ 模擬學完一日</button>
    <button class="btn" data-act="dev" data-d="sim7">📅 模擬學完 7 日</button>
    <button class="btn orange" data-act="dev" data-d="unlock">🔓 全部解鎖：${S.unlockAll ? "關" : "開"}</button>
    <button class="btn red" data-act="dev" data-d="hearts">❤️ 補滿心</button>
    <button class="btn red" data-act="dev" data-d="unlimited">♾️ 無限心：${S.unlimited ? "關" : "開"}</button>
    <button class="btn purple" data-act="dev" data-d="due">🧠 已學字今日到期</button>
    <button class="btn gold" data-act="dev" data-d="xp">⭐ +50 XP</button>
  </div>
  <button class="btn ghost" style="color:var(--red-d)" data-act="dev" data-d="reset">🗑️ 重設所有進度</button>
  <button class="btn plain" data-act="close">關閉</button>`);
}
function simCompleteNext() {
  const i = firstIncomplete(); if (i < 0) return null; const n = PATH[i], t = today();
  if (n.type === "day") { const r = {}; wordsOfDay(n.day).forEach(w => r[w.id] = true); srsUpdate(r); }
  if (n.type === "day" || n.type === "rday") S.lastDayLessonDate = t;
  S.done[n.id] = { date: t, n: 1 }; addXP(nodeInfo(n).xp + 5); markActive(); S.lessons++;
  return n;
}
function simDay() { let n; do { n = simCompleteNext(); } while (n && n.type !== "day" && n.type !== "rday"); S.dayOffset++; S.hearts = MAX_HEARTS; }
function devAction(d) {
  if (d === "nextday") { S.dayOffset++; S.hearts = MAX_HEARTS; toast("而家係 " + today()); }
  if (d === "simday") { simDay(); toast("已模擬學完一日，而家係 " + today()); }
  if (d === "sim7") { for (let k = 0; k < 7; k++) simDay(); toast("已模擬 7 日，而家係 " + today()); }
  if (d === "unlock") S.unlockAll = !S.unlockAll;
  if (d === "hearts") { S.hearts = MAX_HEARTS; S.heartsAt = Date.now(); }
  if (d === "unlimited") S.unlimited = !S.unlimited;
  if (d === "due") { Object.values(S.srs).forEach(r => r.due = today()); toast("所有已學嘅字今日到期"); }
  if (d === "xp") addXP(50);
  if (d === "reset") { if (!confirm("確定要重設所有進度？")) return; S = defaultState(); toast("已重設"); }
  calMonth = null; save(); render(); devModal();
}

/* ================= main render ================= */
function renderTop() {
  refillHearts(); const st = currentStreak(), active = S.lastActive === today();
  $("#top").innerHTML = `<div class="brand">${mascot("happy")}<span>${APP_NAME}</span></div>
    <div class="stats"><button class="stat streak ${active ? "" : "off"}" data-act="tab" data-t="me" aria-label="連續日數"><span class="ic">🔥</span>${st}</button>
    <button class="stat xp" data-act="tab" data-t="me" aria-label="XP"><span class="ic">⭐</span>${S.xp}</button>
    <button class="stat hearts" data-act="hearts" aria-label="心"><span class="ic">❤️</span>${S.unlimited ? "∞" : S.hearts}</button></div>`;
}
function renderTabs() {
  const due = dueWords().length;
  const T = [["learn", "🏠", "學習"], ["review", "🧠", "複習"], ["grammar", "📘", "文法"], ["me", "🙂", "我"]];
  $("#tabs").innerHTML = T.map(([k, i, l]) => `<button class="tab ${tab === k ? "active" : ""}" data-act="tab" data-t="${k}"><span class="ti">${i}</span>${l}${k === "review" && due ? `<span class="badge">${due}</span>` : ""}</button>`).join("");
}
function render() { renderTop(); renderTabs(); renderTab(); }
function renderTab() {
  const m = $("#main");
  if (tab === "learn") { m.innerHTML = renderLearn(); const c = $(".node.current") || $(".node.sleep"); if (c) c.scrollIntoView({ block: "center" }); else m.scrollTop = 0; }
  else { m.innerHTML = tab === "review" ? renderReview() : tab === "grammar" ? renderGrammar() : renderMe(); m.scrollTop = 0; }
}
function renderLearn() {
  const cur = firstIncomplete(), due = dueWords().length, tx = todayXP();
  let h = `<div class="page"><div class="goal-card"><div style="font-size:34px">🎯</div><div style="flex:1"><div class="gt">今日目標　<span style="color:var(--gold-d)">${Math.min(tx, S.goal)} / ${S.goal} XP</span></div><div class="bar"><i style="width:${Math.min(100, 100 * tx / S.goal)}%"></i></div><div class="gs">${tx >= S.goal ? "今日目標已達成，好嘢！🎉" : "每日學 3 個字，積少成多！"}</div></div></div>`;
  if (due) h += `<button class="due-chip" data-act="tab" data-t="review">🧠 你有 <b>${due}</b> 個字今日要複習<span style="margin-left:auto">去複習 →</span></button>`;
  h += `<div class="path">`;
  let unit = 0, j = 0, mascotPlaced = false;
  PATH.forEach((n, i) => {
    if (n.unit !== unit) {
      unit = n.unit; j = 0; mascotPlaced = false; const U = UNITS[unit];
      const from = unit * 7 - 6, to = Math.min(TOTAL_DAYS, unit === 8 ? 56 : unit * 7 + (unit === 9 ? 0 : 0));
      h += `<div class="unit c${unit % 6}" style="width:100%"><div><div class="un">第 ${unit} 單元・第 ${from}–${unit === 9 ? TOTAL_DAYS : to} 日</div><div class="ut">${U.t}</div></div><div class="ue">${U.e}</div></div>`;
    }
    const off = OFFS[j % 8], st = nodeState(i, cur), info = nodeInfo(n), big = n.type === "m";
    const isCur = i === cur || (S.unlockAll && i === cur);
    const cls = ["node", info.cls, st, big ? "big" : "", isCur && st === "avail" ? "current" : ""].join(" ");
    const icon = st === "locked" ? (n.type === "day" || n.type === "rday" ? "🔒" : info.icon) : st === "sleep" ? "🌙" : info.icon;
    const half = big ? 43 : 36;
    h += `<div class="node-wrap" data-i="${i}" style="${big ? "height:104px" : ""}">`;
    if (isCur && st === "avail") h += `<div class="start-bubble" style="left:calc(50% + ${off}px)">${isDone(n.id) ? "重溫" : "開始！"}</div>`;
    if (isCur && st === "sleep") h += `<div class="start-bubble sleepy" style="left:calc(50% + ${off}px)">聽日見 🌙</div>`;
    h += `<button class="${cls}" style="left:calc(50% - ${half}px + ${off}px)" data-off="${off}" data-act="node" data-i="${i}" aria-label="${esc(info.title)}"><span class="ni">${icon}</span></button>`;
    if (!mascotPlaced && Math.abs(off) === 70) { mascotPlaced = true; const moods = ["happy", "cheer", "think"]; h += `<div class="path-mascot" style="left:calc(50% - 48px + ${-Math.sign(off) * 105}px);top:-6px">${mascot(moods[unit % 3])}</div>`; }
    h += `</div>`; j++;
  });
  h += `</div><div class="finish-flag">🏁 完成 60 日課程之後，繼續用「複習」保持記憶！</div></div>`;
  return h;
}
function showNodePop(i) {
  const old = $(".pop"); const oldWrap = old && old.parentElement; if (old) { old.remove(); oldWrap.style.zIndex = ""; if (oldWrap.dataset.i == i) return; }
  const n = PATH[i], cur = firstIncomplete(), st = nodeState(i, cur), info = nodeInfo(n), wrap = $(`.node-wrap[data-i="${i}"]`);
  const j = +$(`.node-wrap[data-i="${i}"] .node`).dataset.off || 0;
  let inner;
  if (st === "locked") inner = `<h4>🔒 ${esc(info.title)}</h4><p>${esc(info.desc)}<br>完成前面嘅課程先可以解鎖。</p><button class="btn disabled" style="background:#e5e5e5;color:#afafaf">未解鎖</button>`;
  else if (st === "sleep") inner = `<h4>🌙 ${esc(info.title)}</h4><p>今日嘅新課已經完成！每日 3 個字，聽日再嚟學啦。<br>而家可以去「複習」練下之前學過嘅字。</p><button class="btn" data-act="tab" data-t="review">去複習 🧠</button>`;
  else inner = `<h4>${esc(info.title)}</h4><p>${esc(info.desc)}</p><button class="btn" data-act="start" data-i="${i}">${st === "done" ? "重溫 +5 XP" : `開始 +${info.xp} XP`}</button>`;
  const pop = document.createElement("div"); pop.className = "pop " + (st === "locked" ? "locked" : info.cls); pop.style.top = (n.type === "m" ? 104 : 92) + "px";
  pop.innerHTML = `<div class="arrow" style="left:calc(50% + ${j}px)"></div>` + inner;
  wrap.style.zIndex = 6; wrap.appendChild(pop);
  setTimeout(() => pop.scrollIntoView({ block: "nearest", behavior: "smooth" }), 30);
}
let reviewFilter = "all";
function masteryBars(box) { return `<span class="mastery">${[1, 2, 3, 4, 5].map(k => `<i class="${box >= k ? "on" : ""}"></i>`).join("")}</span>`; }
function renderReview() {
  const due = dueWords(), learned = learnedWords(), t = today();
  let h = `<div class="page"><h2 class="pt">複習</h2><div class="hero">${mascot(due.length ? "think" : "cheer")}<div style="flex:1">`;
  if (due.length) h += `<div class="ht">今日有 ${due.length} 個字要複習</div><div class="hs">答錯嘅字會更快再出現，答啱就隔耐啲先再溫。</div><button class="btn blue" data-act="review">開始複習 +10 XP</button>`;
  else if (learned.length) h += `<div class="ht">今日冇字要複習 🎉</div><div class="hs">想加深印象？揀最唔熟嘅字練下。</div><button class="btn" data-act="freepractice">自由練習</button>`;
  else h += `<div class="ht">仲未學字喎</div><div class="hs">去「學習」完成第一課，就會有字複習。</div><button class="btn" data-act="tab" data-t="learn">去學習</button>`;
  h += `</div></div>`;
  if (S.hearts < MAX_HEARTS && !S.unlimited) h += `<button class="btn ghost" style="margin-bottom:14px" data-act="practice">❤️ 練習補心（而家 ${S.hearts} / ${MAX_HEARTS}）</button>`;
  h += `<div class="section-t">📚 生字庫　<span style="color:var(--muted);font-size:15px">${learned.length} / ${WORDS.length}</span></div>`;
  const F = [["all", "全部"], ["due", "今日到期"], ["weak", "未熟"], ["master", "已掌握"]];
  h += `<div class="chips">${F.map(([k, l]) => `<button class="chip ${reviewFilter === k ? "on" : ""}" data-act="filter" data-f="${k}">${l}</button>`).join("")}</div>`;
  let list = learned;
  if (reviewFilter === "due") list = due; if (reviewFilter === "weak") list = learned.filter(w => S.srs[w.id].box <= 2); if (reviewFilter === "master") list = learned.filter(w => S.srs[w.id].box >= 4);
  if (!list.length) h += `<div class="empty">呢度暫時冇字 🌱</div>`;
  h += list.map(w => { const r = S.srs[w.id], dd = diffDays(t, r.due); return `<button class="witem" data-act="word" data-id="${w.id}"><div><div class="ww">${esc(w.w)} <span style="font-size:13px;color:var(--muted);font-weight:600">${esc(w.ipa)}</span></div><div class="wz">${esc(w.pos)} ${esc(w.zh)}</div></div>
    <div class="wr">${masteryBars(r.box)}${dd <= 0 ? `<span class="duetag">今日溫</span>` : `<span class="lvl">${LEVELS[r.box]}・${dd} 日後</span>`}</div></button>`; }).join("");
  const locked = WORDS.length - learned.length;
  if (locked && reviewFilter === "all") h += `<div class="empty">🔒 仲有 ${locked} 個字等緊你去學</div>`;
  return h + `</div>`;
}
function grammarUnlocked(k) { return S.unlockAll || isDone("g" + k) || isDone("d" + k * 7); }
function renderGrammar() {
  let h = `<div class="page"><h2 class="pt">文法</h2><div class="hero">${mascot("think")}<div><div class="ht">每星期一課文法</div><div class="hs">每學完 7 日新字，就解鎖一課。每課有廣東話解說同 7 條練習。</div></div></div>`;
  h += GRAMMAR.map((g, i) => { const k = i + 1, un = grammarUnlocked(k), dn = isDone("g" + k);
    return `<button class="gitem ${un ? "" : "locked"}" data-act="grammar" data-k="${k}"><div class="ge">${g.emoji}</div><div><div class="gt">${k}. ${esc(g.title)}</div><div class="gs">${esc(g.en)}</div></div><div class="gst" style="color:${dn ? "var(--green-d)" : un ? "var(--purple-d)" : "var(--grey-d)"}">${dn ? "✓ 完成" : un ? "開始 ›" : `🔒 第 ${k} 週`}</div></button>`; }).join("");
  return h + `</div>`;
}
let calMonth = null, tapCount = 0, tapTimer = null;
function renderMe() {
  const now = nowDate(); if (!calMonth) calMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const gDone = GRAMMAR.filter((g, i) => isDone("g" + (i + 1))).length;
  let h = `<div class="page"><div style="display:flex;flex-direction:column;align-items:center;margin-bottom:14px">
    <button id="meMascot" data-act="mascot" style="width:120px;height:120px" aria-label="包仔">${mascot("happy")}</button>
    <div style="font-size:22px;font-weight:900">包仔學員</div><div style="color:var(--muted);font-weight:700;font-size:14px">${S.startDate ? `由 ${S.startDate} 開始學英文` : "今日就開始你嘅英文之旅！"}</div></div>
  <div class="sgrid">
    <div class="sbox"><span class="si">🔥</span><div><div class="sv">${currentStreak()}</div><div class="sl">連續日數</div></div></div>
    <div class="sbox"><span class="si">⭐</span><div><div class="sv">${S.xp}</div><div class="sl">總 XP</div></div></div>
    <div class="sbox"><span class="si">📚</span><div><div class="sv">${learnedWords().length}</div><div class="sl">學咗嘅字</div></div></div>
    <div class="sbox"><span class="si">📘</span><div><div class="sv">${gDone} / ${GRAMMAR.length}</div><div class="sl">文法課</div></div></div>
    <div class="sbox"><span class="si">🏅</span><div><div class="sv">${S.bestStreak}</div><div class="sl">最長連續</div></div></div>
    <div class="sbox"><span class="si">✅</span><div><div class="sv">${S.lessons}</div><div class="sl">完成課數</div></div></div>
  </div>`;
  h += `<div class="section-t">🎯 每日目標</div><div class="goals">${[[10, "輕鬆", "每日約 5 分鐘"], [20, "普通", "每日約 10 分鐘"], [30, "認真", "每日約 15 分鐘"], [50, "勁抽", "每日約 25 分鐘"]].map(([v, l, s]) => `<button class="goalopt ${S.goal === v ? "on" : ""}" data-act="goal" data-v="${v}">${l}・${v} XP<small>${s}</small></button>`).join("")}</div>`;
  // week chart
  const days = []; for (let k = 6; k >= 0; k--) { const ds = addDays(today(), -k); const [y, mo, d] = ds.split("-").map(Number); days.push({ ds, v: S.xpByDate[ds] || 0, l: "日一二三四五六"[new Date(y, mo - 1, d).getDay()] }); }
  const mx = Math.max(S.goal, ...days.map(d => d.v));
  h += `<div class="section-t">📊 最近 7 日 XP</div><div class="week-chart">${days.map(d => `<div class="col"><span class="colv">${d.v || ""}</span><div class="colb" style="height:${Math.round(70 * d.v / mx)}%;${d.v >= S.goal ? "" : "background:#FFE38A"}"></div><span class="coll">${d.l}</span></div>`).join("")}</div>`;
  // calendar
  const y = calMonth.getFullYear(), mo = calMonth.getMonth(), first = (new Date(y, mo, 1).getDay() + 6) % 7, nd = new Date(y, mo + 1, 0).getDate(), t = today();
  let cells = ["一", "二", "三", "四", "五", "六", "日"].map(x => `<div class="dw">${x}</div>`).join("");
  for (let k = 0; k < first; k++) cells += `<div></div>`;
  for (let d = 1; d <= nd; d++) { const ds = `${y}-${pad(mo + 1)}-${pad(d)}`; cells += `<div class="dd ${S.activeDates.includes(ds) ? "act" : ""} ${ds === t ? "today" : ""}">${d}</div>`; }
  h += `<div class="section-t">📅 練習日曆</div><div class="cal"><div class="calh"><button data-act="cal" data-d="-1">‹</button><span>${y} 年 ${mo + 1} 月</span><button data-act="cal" data-d="1">›</button></div><div class="calg">${cells}</div>
    <div style="font-size:13px;color:var(--muted);font-weight:700;margin-top:8px">🟠 有練習嘅日子　🔵 今日</div></div>`;
  // settings
  const vs = TTS.voices;
  h += `<div class="section-t">⚙️ 設定</div>
    <div class="setrow"><span>🔔 音效</span><button class="switch ${S.sound ? "on" : ""}" data-act="sound" aria-label="音效"></button></div>
    <div class="setrow"><span>🗣️ 英文發音聲線</span>${TTS.ok ? `<select id="voiceSel"><option value="">自動（英式優先）</option>${vs.map(v => `<option value="${esc(v.name)}" ${S.voice === v.name ? "selected" : ""}>${esc(v.name)} (${esc(v.lang)})</option>`).join("")}</select>` : `<span style="color:var(--muted)">唔支援</span>`}</div>
    <div class="setrow"><span>🔊 試聽</span><button class="btn sm blue" data-say="Hello! Nice to meet you.">Hello!</button></div>
    <div class="setrow"><span>🎤 語音練習</span><span style="color:var(--muted);font-size:14px">${SR ? "支援 ✅" : "呢個瀏覽器唔支援"}</span></div>
    <p style="text-align:center;color:#c4c4c4;font-size:12px;font-weight:700;margin-top:20px">${APP_NAME} v0.1 prototype・資料只儲存喺呢部機</p></div>`;
  return h;
}

/* ================= events ================= */
document.addEventListener("click", e => {
  const say = e.target.closest("[data-say]"); if (say) { TTS.speak(say.dataset.say, !!say.dataset.slow); return; }
  const mic = e.target.closest("[data-mic]"); if (mic) { listenWord(mic.dataset.mic, mic); return; }
  const a = e.target.closest("[data-act]");
  if (!a) { const p = $(".pop"); if (p && !e.target.closest(".pop")) { p.parentElement.style.zIndex = ""; p.remove(); } return; }
  const act = a.dataset.act, d = a.dataset;
  switch (act) {
    case "tab": closeModal(); if (L) return; tab = d.t; if (tab === "me") calMonth = null; render(); break;
    case "node": showNodePop(+d.i); break;
    case "start": startNode(+d.i); break;
    case "hearts": heartsModal(false); break;
    case "practice": if (L) { $("#lesson").remove(); L = null; } startReview(true); break;
    case "quitnow": closeLesson(); break;
    case "close": closeModal(); break;
    case "review": startReview(false); break;
    case "freepractice": startReview(false); break;
    case "filter": reviewFilter = d.f; renderTab(); break;
    case "word": wordModal(WORDS[+d.id]); break;
    case "grammar": if (!grammarUnlocked(+d.k)) { toast(`完成第 ${d.k * 7} 日課程就會解鎖 🔒`); return; } startGrammar(+d.k); break;
    case "goal": S.goal = +d.v; save(); renderTab(); toast(`每日目標：${d.v} XP`); break;
    case "sound": S.sound = !S.sound; save(); renderTab(); break;
    case "cal": calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + (+d.d), 1); renderTab(); break;
    case "mascot": tapCount++; clearTimeout(tapTimer); tapTimer = setTimeout(() => tapCount = 0, 1500); a.querySelector("svg").style.transform = "scale(.92)"; setTimeout(() => a.querySelector("svg").style.transform = "", 120); if (tapCount >= 5) { tapCount = 0; devModal(); } break;
    case "dev": devAction(d.d); break;
    // lesson
    case "quit": modal(`<div style="width:100px;height:100px;margin:0 auto">${mascot("sad")}</div><h3>真係要走？</h3><p class="mp">而家離開，今課嘅進度會冇咗㗎。</p><button class="btn" data-act="close">繼續學 💪</button><button class="btn plain" style="color:var(--red-d)" data-act="quitnow">離開</button>`); break;
    case "next": L.doneCount++; L.idx++; renderStep(); break;
    case "opt": if (L.checked) return; $$("#lesson .opt").forEach(b => b.classList.remove("sel")); a.classList.add("sel"); L.sel = +d.i; $("#lesson .lfoot .btn").disabled = false;
      { const e2 = L.cur.e; if (e2.t === "fill" || e2.t === "gmc") $("#blank").textContent = e2.opts[L.sel]; if (["listen", "reverse", "fill"].includes(e2.t)) TTS.speak(e2.opts[L.sel]); } break;
    case "tile": if (L.checked) return; L.chosen.push(+d.i); renderTiles(); break;
    case "untile": if (L.checked) return; L.chosen.splice(+d.j, 1); renderTiles(); break;
    case "m": onMatch(a); break;
    case "check": check(); break;
    case "continue": onContinue(); break;
    case "done": closeLesson(); break;
  }
});
document.addEventListener("change", e => { if (e.target.id === "voiceSel") { S.voice = e.target.value; save(); TTS.speak("Hello! Nice to meet you."); } });
document.addEventListener("keydown", e => {
  if (!L || $("#modal")) return; if (e.target.tagName === "INPUT") return;
  if (e.key === "Enter") { const b = $("#lesson .fb.show .btn") || $("#lesson .lfoot .btn:not([disabled])"); if (b) b.click(); }
  if (/^[1-4]$/.test(e.key)) { const o = $$("#lesson .opt[data-act='opt']")[+e.key - 1]; if (o) o.click(); }
});

/* ================= boot ================= */
TTS.init();
if (/[?&]dev=1/.test(location.search)) { const b = document.createElement("button"); b.className = "devfab"; b.textContent = "🛠"; b.addEventListener("click", devModal); $("#app").appendChild(b); }
render();
setInterval(() => { if (!L) { const before = S.hearts; refillHearts(); if (S.hearts !== before) renderTop(); } }, 30000);
window.BZ = { get L() { return L; }, get S() { return S; }, PATH, WORDS, GRAMMAR };   // test hook
})();
