/* 懶貓英文・每日五個字 — state, course, SRS, cats, icons, speech */
(function (LC) {
  "use strict";
  const DATA = window.LAZYCAT_DATA;
  const WORDS = DATA.words;
  const WORD = Object.fromEntries(WORDS.map(w => [w.id, w]));
  const TDATA = DATA.themes;
  const THEMES = TDATA.themes;
  const THEME = Object.fromEntries(THEMES.map(t => [t.id, t]));
  const GRAMMAR = DATA.grammar.lessons;
  const GBY = Object.fromEntries(GRAMMAR.map(g => [g.id, g]));
  const CATS = DATA.cats.cats;
  const CAT = Object.fromEntries(CATS.map(c => [c.slug, c]));
  const POSES = DATA.cats.poses;
  const HERO = DATA.cats.hero;
  const SVG_SET = new Set(DATA.svgIds || []);

  const ICON_PLACEHOLDER = "tile";
  const SVG_ICON_TRIAL = false;
  const NEW_LESSONS_PER_DAY = 1;
  const CATCHUP_UNLIMITED = true;
  const CATCHUP_ON_SUNDAY = false;
  const SUNDAY_REST = true;
  const SUNDAY_KEEPS_STREAK = true;
  const KEY = "lazycat-english-v1";
  const MAX_HEARTS = 5;
  const HEART_MS = 30 * 60 * 1000;
  const INTERVALS = [0, 1, 3, 7, 14, 30];
  const LEVELS = ["未學", "初見", "學緊", "熟悉", "幾熟", "掌握"];
  const PRAISE = ["好嘢！", "正呀！", "勁喎！", "做得好！", "冇得頂！", "叻叻豬！", "答啱咗！"];
  const DAY_COLORS = [null,
    { bg: "#FFF3E0", tile: "#FFE3BF", ink: "#E58A2E" },
    { bg: "#FDEBF0", tile: "#F9D3DF", ink: "#E0718F" },
    { bg: "#EEF7EC", tile: "#D9EFD5", ink: "#5DB585" },
    { bg: "#EAF4FB", tile: "#D3E9F6", ink: "#5AA9D1" },
    { bg: "#F2EEFB", tile: "#E2DAF6", ink: "#8E7CC9" }];
  const POS_ZH = { "n.": "名詞", "v.": "動詞", "adj.": "形容詞", "adv.": "副詞", "num.": "數詞", "det.": "限定詞", "conj.": "連接詞", "interj.": "感嘆詞", "pron.": "代名詞", "prep.": "介詞" };
  const UNLOCK_REASON = {
    fanshu: "新手貓", huihui: "完成第一課", zima: "收集第一張生字卡", banban: "連續學習 7 日",
    fafa: "完成第 1 次月度大複習", kafe: "連續學習 30 日", tongyun: "完成第 1 季",
    aigwa: "100 個字達「掌握」", minfa: "30 課零錯誤", suetgo: "連續學習 100 日",
    naisik: "累積 5,000 XP", lammui: "完成第 2 季", daihung: "完成第 3 季",
    daufu: "完成 24 課文法", baubau: "完成全年 1,200 字"
  };
  const WD = ["日", "一", "二", "三", "四", "五", "六"];

  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeRich = s => esc(s).replace(/&lt;(\/)?b&gt;/gi, "<$1b>").replace(/&lt;br\s*\/?&gt;/gi, "<br>");
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (a, n) => shuffle(a).slice(0, n);
  const rand = a => a[Math.floor(Math.random() * a.length)];
  function shuffleNE(a) { if (a.length < 2) return a.slice(); let s, k = 0; do { s = shuffle(a); k++; } while (s.join("\u0001") === a.join("\u0001") && k < 20); return s; }
  const pad = n => String(n).padStart(2, "0");
  const dstr = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());

  function defaultState() {
    const t = dstr(new Date());
    return {
      v: 1, createdAt: t,
      profile: { name: "Janson" },
      settings: { sound: true, voice: null, goal: 20, showIPA: true, askCompanionDaily: true, svgIcons: false },
      devIconMode: null, dayOffset: 0,
      xp: 0, xpByDate: {}, streak: 0, bestStreak: 0, lastActive: null, activeDates: [],
      hearts: MAX_HEARTS, heartsAt: Date.now(), unlimited: false, unlockAll: false,
      startDate: null, lessons: 0, perfectLessons: 0,
      done: {}, lastNewLessonDate: null, newLessonsToday: 0, inProgress: null,
      srs: {}, themeCards: {}, perfectThemes: [],
      companion: "fanshu", companionAskedDate: null,
      cats: { fanshu: { unlocked: t, lessons: 0, bonus: null, seen: false } },
      celebrationQueue: []
    };
  }
  function load() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { s = null; }
    const d = defaultState();
    if (!s || typeof s !== "object") return d;
    const out = Object.assign(d, s);
    out.profile = Object.assign(d.profile, s.profile || {});
    out.settings = Object.assign(d.settings, s.settings || {});
    out.done = s.done && typeof s.done === "object" ? s.done : {};
    out.srs = s.srs && typeof s.srs === "object" ? s.srs : {};
    out.xpByDate = s.xpByDate && typeof s.xpByDate === "object" ? s.xpByDate : {};
    out.themeCards = s.themeCards && typeof s.themeCards === "object" ? s.themeCards : {};
    out.cats = s.cats && typeof s.cats === "object" ? s.cats : d.cats;
    out.activeDates = Array.isArray(s.activeDates) ? s.activeDates : [];
    out.perfectThemes = Array.isArray(s.perfectThemes) ? s.perfectThemes : [];
    out.celebrationQueue = Array.isArray(s.celebrationQueue) ? s.celebrationQueue : [];
    if (!out.cats.fanshu) out.cats.fanshu = { unlocked: out.createdAt || d.createdAt, lessons: 0, bonus: null, seen: false };
    out.settings.svgIcons = false;
    if (out.devIconMode !== "emoji" && out.devIconMode !== "tile") out.devIconMode = null;
    return out;
  }
  let S = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch (e) { if (!save.warned) { save.warned = true; toast("儲存唔到進度（瀏覽器儲存空間滿？）"); } }
  }

  function nowDate() { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + (S.dayOffset || 0)); return d; }
  const today = () => dstr(nowDate());
  function addDays(ds, n) { const [y, m, d] = ds.split("-").map(Number); return dstr(new Date(y, m - 1, d + n)); }
  function diffDays(a, b) { const pa = a.split("-").map(Number), pb = b.split("-").map(Number); return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000); }
  function weekdayOf(ds) { const [y, m, d] = ds.split("-").map(Number); return new Date(y, m - 1, d).getDay(); }
  function mondayOnOrBefore(ds) { const wd = weekdayOf(ds); return addDays(ds, wd === 0 ? -6 : 1 - wd); }
  function zhDate(ds) { const [y, m, d] = ds.split("-").map(Number); return y + " 年 " + m + " 月 " + d + " 日"; }
  function weekdayLabel() { return "星期" + WD[nowDate().getDay()]; }
  const isSunday = () => nowDate().getDay() === 0;

  function gapOnlySundays(from, to) {
    if (!from || !to || from >= to) return false;
    let d = addDays(from, 1);
    while (d < to) { if (weekdayOf(d) !== 0) return false; d = addDays(d, 1); }
    return true;
  }
  function currentStreak() {
    if (!S.lastActive) return 0;
    const diff = diffDays(S.lastActive, today());
    if (diff <= 1) return S.streak;
    if (SUNDAY_KEEPS_STREAK && gapOnlySundays(S.lastActive, today())) return S.streak;
    return 0;
  }
  function markActive() {
    const t = today();
    if (S.lastActive === t) return false;
    if (!S.lastActive) S.streak = 1;
    else {
      const diff = diffDays(S.lastActive, t);
      if (diff === 1) S.streak += 1;
      else if (SUNDAY_KEEPS_STREAK && gapOnlySundays(S.lastActive, t)) S.streak += 1;
      else S.streak = 1;
    }
    S.lastActive = t;
    if (!S.activeDates.includes(t)) S.activeDates.push(t);
    S.bestStreak = Math.max(S.bestStreak || 0, S.streak);
    return true;
  }
  function addXP(n) { const t = today(); S.xp += n; S.xpByDate[t] = (S.xpByDate[t] || 0) + n; return n; }
  const todayXP = () => S.xpByDate[today()] || 0;
  function refillHearts() {
    if (S.unlimited) return;
    if (S.hearts >= MAX_HEARTS) { S.heartsAt = Date.now(); return; }
    const n = Math.floor((Date.now() - S.heartsAt) / HEART_MS);
    if (n > 0) {
      S.hearts = Math.min(MAX_HEARTS, S.hearts + n);
      S.heartsAt += n * HEART_MS;
      if (S.hearts >= MAX_HEARTS) S.heartsAt = Date.now();
      save();
    }
  }
  function loseHeart() {
    if (S.unlimited) return;
    if (S.hearts >= MAX_HEARTS) S.heartsAt = Date.now();
    S.hearts = Math.max(0, S.hearts - 1);
    save();
  }
  function heartCountdown() {
    const ms = Math.max(0, HEART_MS - (Date.now() - S.heartsAt));
    const m = Math.floor(ms / 60000), s = Math.floor(ms % 60000 / 1000);
    return m + ":" + pad(s);
  }

  function srsUpdate(results) {
    const t = today();
    for (const id in results) {
      const r = S.srs[id] || { box: 0, due: t, seen: 0, right: 0, wrong: 0, learned: t };
      r.seen++;
      if (results[id]) { r.box = Math.min(5, r.box + 1); r.right++; r.due = addDays(t, INTERVALS[r.box]); }
      else { r.box = 1; r.wrong++; r.due = t; }
      S.srs[id] = r;
    }
  }
  const learnedWords = () => WORDS.filter(w => S.srs[w.id]);
  const dueWords = () => WORDS.filter(w => S.srs[w.id] && S.srs[w.id].due <= today()).sort((a, b) => (S.srs[a.id].box - S.srs[b.id].box) || (a.seq - b.seq));
  function weakest(n, pool) {
    const src = pool || learnedWords();
    return src.slice().sort((a, b) => {
      const ba = (S.srs[a.id] || { box: 0, wrong: 0 }), bb = (S.srs[b.id] || { box: 0, wrong: 0 });
      return (ba.box - bb.box) || ((bb.wrong || 0) - (ba.wrong || 0)) || (Math.random() - 0.5);
    }).slice(0, n);
  }
  function weightedSample(words, n) {
    const pool = words.slice(), out = [];
    while (out.length < n && pool.length) {
      const weights = pool.map(w => 6 - ((S.srs[w.id] || { box: 0 }).box));
      let r = Math.random() * weights.reduce((a, b) => a + b, 0), i = 0;
      for (; i < pool.length; i++) { r -= weights[i]; if (r <= 0) break; }
      if (i >= pool.length) i = pool.length - 1;
      out.push(pool.splice(i, 1)[0]);
    }
    return out;
  }
  const masteredCount = () => Object.values(S.srs).filter(r => r.box === 5).length;
  const wordsOf = (themeId, day) => THEME[themeId].days[day - 1].words.map(id => WORD[id]);
  const themeWords = t => WORDS.filter(w => w.theme_id === (t.id || t));

  function buildPath() {
    const nodes = [];
    THEMES.forEach(t => {
      for (let d = 1; d <= 5; d++) nodes.push({ id: t.id + "d" + d, type: "day", theme: t.id, day: d, week: t.week });
      nodes.push({ id: t.id + "w", type: "weekly", theme: t.id, week: t.week });
      if (t.grammar) nodes.push({ id: t.grammar, type: "grammar", theme: t.id, week: t.week, gid: t.grammar });
      if (t.followed_by) nodes.push({ id: t.followed_by, type: "monthly", theme: t.id, week: t.week, mid: t.followed_by });
    });
    for (let d = 1; d <= 5; d++) nodes.push({ id: "q1d" + d, type: "qday", day: d, week: 13 });
    nodes.push({ id: "q1x", type: "exam", week: 13 });
    return nodes;
  }
  const PATH = buildPath();
  const NODE = Object.fromEntries(PATH.map(n => [n.id, n]));
  const isDone = id => !!(S.done[id]);
  function nodeUnlocked(n) {
    if (!n) return false;
    if (S.unlockAll || isDone(n.id)) return true;
    if (n.type === "day") {
      if (n.day > 1) return isDone(n.theme + "d" + (n.day - 1));
      const ti = THEMES.findIndex(t => t.id === n.theme);
      if (ti <= 0) return true;
      const prev = THEMES[ti - 1];
      if (!isDone(prev.id + "d5")) return false;
      if (prev.followed_by && !isDone(prev.followed_by)) return false;
      return true;
    }
    if (n.type === "weekly" || n.type === "grammar") return isDone(n.theme + "d5");
    if (n.type === "monthly") return isDone(n.theme + "d5");
    if (n.type === "qday") return n.day === 1 ? isDone("m3") : isDone("q1d" + (n.day - 1));
    if (n.type === "exam") return isDone("q1d5");
    return false;
  }
  function nextNewNode() {
    return PATH.find(n => n.type === "day" && !isDone(n.id) && nodeUnlocked(n)) || null;
  }
  function newLessonsDone() { return PATH.filter(n => n.type === "day" && isDone(n.id)).length; }
  function newCountToday() { return S.lastNewLessonDate === today() ? (S.newLessonsToday || 0) : 0; }
  function expectedCount() {
    if (!S.startDate) return 0;
    const monday = mondayOnOrBefore(S.startDate);
    const t = today();
    if (t < monday) return 0;
    let count = 0, d = monday;
    while (d <= t) { const wd = weekdayOf(d); if (wd >= 1 && wd <= 5) count++; d = addDays(d, 1); }
    return Math.min(60, count);
  }
  const isBehind = () => newLessonsDone() < expectedCount();
  const behindBy = () => Math.max(0, expectedCount() - newLessonsDone());
  function isSundayRest() { return SUNDAY_REST && isSunday() && !CATCHUP_ON_SUNDAY; }
  function canStartNewToday() {
    if (isSundayRest()) return false;
    if (!nextNewNode()) return false;
    if (S.unlockAll) return true;
    if (newCountToday() < NEW_LESSONS_PER_DAY) return true;
    return CATCHUP_UNLIMITED && isBehind();
  }
  function openSaturday() {
    const out = [];
    THEMES.forEach(t => {
      if (!isDone(t.id + "d5")) return;
      if (!isDone(t.id + "w")) out.push(NODE[t.id + "w"]);
      if (t.grammar && !isDone(t.grammar)) out.push(NODE[t.grammar]);
    });
    return out;
  }
  function blockingMonthly() {
    return PATH.find(n => n.type === "monthly" && !isDone(n.id) && nodeUnlocked(n)) || null;
  }
  function nextQuarterly() {
    return PATH.find(n => (n.type === "qday" || n.type === "exam") && !isDone(n.id) && nodeUnlocked(n)) || null;
  }
  function activeTheme() {
    const n = nextNewNode();
    if (n) return THEME[n.theme];
    for (const t of THEMES) {
      if (!isDone(t.id + "d5")) return t;
      if (t.followed_by && !isDone(t.followed_by)) return t;
    }
    return null;
  }
  function currentWeek() {
    if (isDone("q1x")) return 13;
    const q = nextQuarterly();
    if (q && isDone("m3")) return 13;
    const t = activeTheme();
    return t ? t.week : 1;
  }
  function themeWordsLearned(t) {
    let n = 0;
    for (let d = 1; d <= 5; d++) {
      const id = t.id + "d" + d;
      if (isDone(id)) n += 5;
      else if (S.inProgress && S.inProgress.nodeId === id) n += S.inProgress.cardsSeen || 0;
    }
    return Math.min(25, n);
  }
  function wordLearnedOnCard(w) {
    const id = w.theme_id + "d" + w.day;
    if (isDone(id)) return true;
    if (S.inProgress && S.inProgress.nodeId === id && w.order <= (S.inProgress.cardsSeen || 0)) return true;
    return false;
  }

  function seasonDoneCount() { return isDone("q1x") ? 1 : 0; }
  function grammarDoneCount() { return GRAMMAR.filter(g => isDone(g.id)).length; }
  function monthlyDoneCount() { return ["m1", "m2", "m3"].filter(isDone).length; }
  function unlockValue(cat) {
    const u = cat.unlock;
    switch (u.type) {
      case "starter": return 1;
      case "lessons_completed": return newLessonsDone();
      case "theme_cards": return Object.keys(S.themeCards).length;
      case "best_streak": return S.bestStreak || 0;
      case "monthly_reviews": return monthlyDoneCount();
      case "season_complete": return seasonDoneCount();
      case "mastered_words": return masteredCount();
      case "perfect_lessons": return S.perfectLessons || 0;
      case "grammar_done": return grammarDoneCount();
      case "xp": return S.xp || 0;
      case "words_learned": return Object.keys(S.srs).length;
      default: return 0;
    }
  }
  function ruleMet(cat) {
    if (cat.unlock.type === "starter") return true;
    if (cat.unlock.type === "season_complete") return seasonDoneCount() >= cat.unlock.value;
    return unlockValue(cat) >= cat.unlock.value;
  }
  function checkUnlocks() {
    const newly = [];
    CATS.forEach(c => {
      if (S.cats[c.slug]) return;
      if (ruleMet(c)) {
        S.cats[c.slug] = { unlocked: today(), lessons: 0, bonus: null, seen: false };
        newly.push(c.slug);
      }
    });
    return newly;
  }
  function albumMath(lessons) {
    lessons = lessons || 0;
    const regular = 1 + Math.min(3, Math.floor(lessons / 5));
    const done = lessons >= 15;
    return { regular, nextN: done ? 0 : 5 - (lessons % 5), paws: done ? 5 : (lessons % 5), done };
  }
  function poseUnlocked(catSlug, pose, lessons) {
    if (pose.key === "sit") return !!S.cats[catSlug];
    if (pose.key === "yarn") return !!(S.cats[catSlug] && S.cats[catSlug].bonus);
    return (lessons || 0) >= pose.lessons_needed;
  }
  function lockedProgressText(cat) {
    if (cat.slug === "tongyun") return "第 " + currentWeek() + " / 13 週";
    if (cat.slug === "aigwa") return masteredCount() + " / 100";
    if (cat.slug === "minfa") return (S.perfectLessons || 0) + " / 30";
    const order = ["banban", "kafe", "suetgo"];
    const next = order.find(s => !S.cats[s]);
    if (cat.slug === next) return (S.bestStreak || 0) + " / " + cat.unlock.value + " 日";
    return "未解鎖";
  }
  function hairTint(cat, companion) {
    if (cat.slug === companion) return "tint-on";
    if (cat.hair_zh === "長毛") return "tint-long";
    if (cat.hair_zh === "無毛") return "tint-none";
    return "tint-short";
  }

  function placeholderMode() { return S.devIconMode === "emoji" ? "emoji" : "tile"; }
  function iconKind(word) {
    if (word.icon) return "png";
    return placeholderMode();
  }
  const PAW_SVG = '<svg class="ipaw" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="16" rx="5.2" ry="4.2"/><ellipse cx="6.2" cy="10.6" rx="2.1" ry="2.6"/><ellipse cx="17.8" cy="10.6" rx="2.1" ry="2.6"/><ellipse cx="9.2" cy="6.6" rx="2" ry="2.5"/><ellipse cx="14.8" cy="6.6" rx="2" ry="2.5"/></svg>';
  function tileInner(word, size, mode) {
    const c = DAY_COLORS[word.day] || DAY_COLORS[1];
    if (mode === "emoji") return '<span class="iemoji" style="font-size:' + Math.round(size * 0.58) + 'px">' + word.emoji + "</span>" + PAW_SVG;
    const ch = esc((word.word || "?").charAt(0).toLowerCase());
    return '<span class="ilet" style="font-size:' + Math.round(size * 0.52) + 'px;color:' + c.ink + '">' + ch + "</span>" + PAW_SVG;
  }
  function tileHTML(word, size, mode) {
    const c = DAY_COLORS[word.day] || DAY_COLORS[1];
    const r = Math.round(size * 0.28);
    return '<span class="itile" style="width:' + size + "px;height:" + size + "px;border-radius:" + r + "px;background:" + c.tile + '">' + tileInner(word, size, mode) + "</span>";
  }
  function renderIcon(word, size) {
    const kind = iconKind(word);
    if (kind === "png") return '<img class="ficon" alt="" width="' + size + '" height="' + size + '" src="' + esc(word.icon) + '" data-wid="' + word.id + '" data-sz="' + size + '" onerror="LC.iconErr(this)">';
    if (kind === "svg") {
      const c = DAY_COLORS[word.day] || DAY_COLORS[1];
      const r = Math.round(size * 0.28);
      return '<span class="itile svg" style="width:' + size + "px;height:" + size + "px;border-radius:" + r + "px;background:" + c.tile + '"><img alt="" src="assets/icons-svg/' + word.id + '.svg" data-wid="' + word.id + '" data-sz="' + size + '" onerror="LC.iconErr(this)"></span>';
    }
    return tileHTML(word, size, kind);
  }
  function iconErr(img) {
    const w = WORD[img.dataset.wid];
    if (!w) return;
    const size = +img.dataset.sz || 40;
    const span = document.createElement("span");
    span.innerHTML = tileHTML(w, size, "tile");
    (img.closest(".itile") || img).replaceWith(span.firstChild);
  }
  function themeIconHTML(theme, size) {
    if (theme.icon) return '<img class="ficon" alt="" src="' + esc(theme.icon) + '" style="width:' + size + "px;height:" + size + 'px">';
    return '<span class="emoji" style="font-size:' + Math.round(size * 0.72) + 'px">' + theme.emoji + "</span>";
  }
  function themeSlug(en) {
    return String(en || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function cardFileName(theme) { return "lazycat-s" + theme.season + "-w" + pad(theme.week) + "-" + themeSlug(theme.en) + ".png"; }

  function cropStyle(crop, mode, frameW, frameH) {
    const imgW = 800, imgH = 450;
    const head = (crop.chin - crop.top);
    let cx, cy, h;
    if (mode === "hero") { cx = 0.29; cy = 0.50; h = 0.62; }
    else if (mode === "face") { cx = crop.fx; cy = (crop.top + crop.chin) / 2 + head * 0.04; h = head * 1.28; }
    else if (mode === "bust") { h = head * 1.65; cx = crop.fx; cy = crop.top - head * 0.06 + h / 2; }
    else { cx = crop.fx; cy = 0.5; h = 0.98; }
    let H = h * imgH, CX = cx * imgW, CY = cy * imgH, aspect = frameW / frameH;
    let hh = H, ww = hh * aspect;
    if (hh > imgH) { hh = imgH; ww = hh * aspect; }
    if (ww > imgW) { ww = imgW; hh = ww / aspect; }
    const x0 = Math.min(Math.max(CX - ww / 2, 0), imgW - ww);
    const y0 = Math.min(Math.max(CY - hh / 2, 0), imgH - hh);
    return "width:" + (imgW / ww * 100).toFixed(3) + "%;left:" + (-x0 / ww * 100).toFixed(3) + "%;top:" + (-y0 / hh * 100).toFixed(3) + "%";
  }
  function faceHTML(slug, size, opt) {
    opt = opt || {};
    const cat = CAT[slug] || CAT.fanshu;
    const src = opt.hero ? HERO.file : (opt.src || cat.photo);
    const crop = opt.hero ? { fx: 0.29, top: 0.32, chin: 0.72 } : cat.crop;
    const mode = opt.hero ? "hero" : (opt.mode || "face");
    const r = opt.r != null ? opt.r : "50%";
    const stl = cropStyle(crop, mode, size, opt.h || size);
    const lazy = opt.eager ? "" : ' loading="lazy"';
    return '<span class="cphoto ' + (opt.cls || "") + '" style="width:' + size + "px;height:" + (opt.h || size) + "px;border-radius:" + r + ";" + (opt.style || "") + '"><img src="' + esc(src) + '" alt="' + esc(opt.hero ? "番薯" : cat.name_zh) + '"' + lazy + ' style="' + stl + '"></span>';
  }
  const companion = () => CAT[S.companion] || CAT.fanshu;

  function toast(msg, ms) {
    const app = $("#app"); if (!app) return;
    const t = document.createElement("div"); t.className = "toast"; t.textContent = msg;
    app.appendChild(t); setTimeout(() => t.remove(), ms || 2200);
  }
  function closeModal() { const m = $("#modal"); if (m) m.remove(); if (LC.heartTimer) { clearInterval(LC.heartTimer); LC.heartTimer = null; } }
  function modal(html, opt) {
    opt = opt || {};
    closeModal();
    const bg = document.createElement("div"); bg.className = "modal-bg" + (opt.sheet ? " sheet" : ""); bg.id = "modal";
    if (opt.lock) bg.dataset.lock = "1";
    bg.innerHTML = '<div class="modal' + (opt.sheet ? " sheet" : "") + (opt.wide ? " wide" : "") + '">' + html + "</div>";
    bg.addEventListener("click", e => { if (e.target === bg && !bg.dataset.lock) closeModal(); });
    $("#app").appendChild(bg);
    return bg;
  }

  const TTS = {
    ok: "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined",
    voices: [],
    init() {
      if (!this.ok) return;
      const ld = () => { try { this.voices = speechSynthesis.getVoices().filter(v => /^en([-_]|$)/i.test(v.lang)); } catch (e) {} };
      ld();
      try { speechSynthesis.onvoiceschanged = () => { ld(); if (LC.onVoices) LC.onVoices(); }; } catch (e) {}
    },
    pick() {
      if (S.settings.voice) { const v = this.voices.find(v => v.name === S.settings.voice); if (v) return v; }
      const prefer = /Google|Natural|Enhanced|Premium|Siri|Daniel|Samantha|Serena|Kate/i;
      for (const re of [/en[-_]GB/i, /en[-_]US/i, /en/i]) {
        const c = this.voices.filter(v => re.test(v.lang));
        if (c.length) return c.find(v => prefer.test(v.name)) || c[0];
      }
      return this.voices[0] || null;
    },
    speak(text, slow, opt) {
      if (!text) return;
      if (!this.ok) { toast("你部機唔支援發音 😢"); return; }
      opt = opt || {};
      if (!opt.auto) {
        this.userAt = Date.now();
        clearTimeout(this.autoTimer);
      }
      this.gen = (this.gen || 0) + 1;
      const gen = this.gen;
      clearTimeout(this.timer);
      try { speechSynthesis.cancel(); } catch (e) {}
      // Chrome and Safari drop the rate when speak() follows cancel() in the same turn.
      this.timer = setTimeout(() => {
        if (gen !== this.gen) return;
        try {
          if (speechSynthesis.paused) speechSynthesis.resume();
          const u = new SpeechSynthesisUtterance(text);
          const v = this.pick();
          if (v) u.voice = v;
          u.lang = (v && v.lang) || "en-GB";
          u.rate = slow ? 0.5 : 0.9;
          u.pitch = slow ? 0.92 : 1;
          speechSynthesis.speak(u);
        } catch (e) {}
      }, 120);
    },
    armAuto(text, ms) {
      clearTimeout(this.autoTimer);
      const t0 = Date.now();
      this.autoTimer = setTimeout(() => {
        if (this.userAt && this.userAt >= t0) return;
        this.speak(text, false, { auto: true });
      }, ms || 280);
    },
    cancel() {
      this.gen = (this.gen || 0) + 1;
      clearTimeout(this.timer);
      clearTimeout(this.autoTimer);
      try { speechSynthesis.cancel(); } catch (e) {}
    }
  };
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  let AC = null;
  function audioCtx() {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === "suspended") AC.resume();
      return AC;
    } catch (e) { return null; }
  }
  function unlockAudio() { audioCtx(); }
  // Adult meow: F0 rises then falls; the mouth opens from a close "ee" to an open "ow"
  // (F1 rises, F2 falls). Kittens sit higher and shorter; big cats sit lower and longer.
  const MEOWS = {
    fanshu: { a: 480, b: 640, c: 390, dur: 0.62, vib: 5, depth: 16, f1: [520, 920], f2: [2100, 1350] },
    huihui: { a: 560, b: 690, c: 500, dur: 0.46, vib: 4, depth: 8, f1: [480, 780], f2: [1800, 1400] },
    zima: { a: 320, b: 420, c: 250, dur: 0.78, vib: 4.2, depth: 12, f1: [420, 760], f2: [1700, 1200] },
    banban: { a: 500, b: 700, c: 430, dur: 0.52, vib: 6, depth: 18, f1: [540, 980], f2: [2200, 1400] },
    fafa: { a: 640, b: 840, c: 560, dur: 0.44, vib: 6.2, depth: 14, f1: [560, 1000], f2: [2300, 1500] },
    kafe: { a: 700, b: 880, c: 600, dur: 0.5, vib: 5, depth: 10, f1: [450, 700], f2: [2400, 1900] },
    tongyun: { a: 400, b: 510, c: 340, dur: 0.58, vib: 3.4, depth: 7, f1: [400, 680], f2: [1500, 1100] },
    aigwa: { a: 900, b: 1120, c: 780, dur: 0.36, vib: 7, depth: 20, f1: [620, 1100], f2: [2600, 1700] },
    lammui: { a: 440, b: 580, c: 360, dur: 0.6, vib: 5, depth: 11, f1: [500, 860], f2: [1900, 1300] },
    minfa: { a: 520, b: 660, c: 450, dur: 0.5, vib: 4, depth: 8, f1: [480, 820], f2: [2000, 1450] },
    suetgo: { a: 760, b: 980, c: 660, dur: 0.36, vib: 7, depth: 16, f1: [600, 1050], f2: [2500, 1600] },
    naisik: { a: 460, b: 600, c: 400, dur: 0.64, vib: 4, depth: 9, f1: [500, 880], f2: [1850, 1280] },
    daihung: { a: 240, b: 310, c: 190, dur: 0.92, vib: 3.2, depth: 8, f1: [360, 640], f2: [1400, 1000] },
    daufu: { a: 500, b: 640, c: 430, dur: 0.54, vib: 5, depth: 11, f1: [510, 900], f2: [2000, 1380] },
    baubau: { a: 680, b: 880, c: 560, dur: 0.4, vib: 6.5, depth: 18, f1: [580, 1020], f2: [2400, 1550] }
  };
  function scheduleMeow(ac, slug, kind, when) {
    const p = MEOWS[slug] || MEOWS.fanshu;
    const n = kind === "done" ? 2 : 1;
    for (let i = 0; i < n; i++) {
      const dur = Math.max(0.32, p.dur * (i ? 0.72 : 1));
      const t0 = when + i * (p.dur * 0.7 + 0.12);
      const lift = i ? 1.12 : 1;
      const a = p.a * lift, b = p.b * lift, c = Math.max(80, p.c * lift);
      const src = ac.createOscillator();
      const vib = ac.createOscillator();
      const vibG = ac.createGain();
      const dry = ac.createGain();
      const g1 = ac.createGain();
      const g2 = ac.createGain();
      const master = ac.createGain();
      const f1 = ac.createBiquadFilter();
      const f2 = ac.createBiquadFilter();
      const lp = ac.createBiquadFilter();
      src.type = "sawtooth";
      vib.type = "sine";
      vib.frequency.value = p.vib;
      vibG.gain.value = p.depth;
      vib.connect(vibG);
      vibG.connect(src.frequency);
      src.frequency.setValueAtTime(a, t0);
      src.frequency.linearRampToValueAtTime(b, t0 + dur * 0.32);
      src.frequency.linearRampToValueAtTime(c, t0 + dur);
      f1.type = "bandpass";
      f1.Q.value = 3.2;
      f1.frequency.setValueAtTime(p.f1[0], t0);
      f1.frequency.linearRampToValueAtTime(p.f1[1], t0 + dur * 0.62);
      f2.type = "bandpass";
      f2.Q.value = 4;
      f2.frequency.setValueAtTime(p.f2[0], t0);
      f2.frequency.linearRampToValueAtTime(p.f2[1], t0 + dur * 0.55);
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(900, t0);
      lp.frequency.linearRampToValueAtTime(1800, t0 + dur * 0.4);
      lp.frequency.linearRampToValueAtTime(700, t0 + dur);
      dry.gain.value = 0.1;
      g1.gain.value = 0.34;
      g2.gain.value = 0.2;
      const peak = 0.85;
      master.gain.setValueAtTime(0.0001, t0);
      master.gain.exponentialRampToValueAtTime(peak, t0 + 0.07);
      master.gain.setValueAtTime(peak * 0.8, t0 + dur * 0.55);
      master.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(lp); lp.connect(dry); dry.connect(master);
      src.connect(f1); f1.connect(g1); g1.connect(master);
      src.connect(f2); f2.connect(g2); g2.connect(master);
      master.connect(ac.destination);
      vib.start(t0); vib.stop(t0 + dur + 0.04);
      src.start(t0); src.stop(t0 + dur + 0.04);
    }
  }
  function meow(slug, kind) {
    if (!S.settings.sound) return;
    const ac = audioCtx();
    if (!ac) return;
    const go = () => { try { scheduleMeow(ac, slug, kind, ac.currentTime + 0.02); } catch (e) {} };
    if (ac.state === "running") go();
    else {
      const pending = ac.resume();
      if (pending && pending.then) pending.then(go);
      else go();
    }
  }
  function beep(kind) {
    if (!S.settings.sound) return;
    const ac = audioCtx();
    if (!ac) return;
    try {
      const seq = kind === "ok" ? [[660, 0], [990, .09]] : kind === "bad" ? [[196, 0], [155, .13]] : [[523, 0], [659, .12], [784, .24], [1047, .38]];
      seq.forEach(([f, t]) => {
        const o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + t;
        o.type = kind === "bad" ? "sawtooth" : "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(kind === "bad" ? 0.06 : 0.15, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
        o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + 0.3);
      });
    } catch (e) {}
  }
  function highlight(sentence, word) {
    const re = new RegExp("\\b(" + String(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")\\b", "i");
    return esc(sentence).replace(re, "<b>$1</b>");
  }
  function tipHTML(tip) {
    if (!tip) return "";
    if (tip.indexOf("\n") < 0) return "<p>" + esc(tip) + "</p>";
    const lines = tip.split("\n");
    let title = lines[0].replace(/：$/, "").replace(/:$/, "");
    const rest = lines.slice(1).map(ln => {
      const i = ln.indexOf("→");
      if (i < 0) return esc(ln);
      return esc(ln.slice(0, i + 1)) + " <b>" + esc(ln.slice(i + 1).trim()) + "</b>";
    }).join("<br>");
    return '<h4><span class="emoji">💡</span>懶貓貼士：' + esc(title) + "</h4><p>" + rest + "</p>";
  }

  function maybeAwardYarn(themeId) {
    if (S.perfectThemes.includes(themeId)) return null;
    const t = THEME[themeId];
    const ids = [1, 2, 3, 4, 5].map(d => t.id + "d" + d).concat([t.id + "w"]);
    if (!ids.every(isDone)) return null;
    if (!ids.every(id => S.done[id] && S.done[id].perfect)) return null;
    S.perfectThemes.push(themeId);
    let slug = S.companion;
    if (S.cats[slug] && S.cats[slug].bonus) {
      const next = CATS.find(c => S.cats[c.slug] && !S.cats[c.slug].bonus);
      if (!next) { addXP(20); return { type: "yarn-xp" }; }
      slug = next.slug;
    }
    if (!S.cats[slug]) return null;
    S.cats[slug].bonus = { theme: themeId, date: today() };
    return { type: "yarn", cat: slug, theme: themeId };
  }

  const ui = { tab: "home", segment: "cards", cardIndex: 0, bankFilter: "all", bankTheme: "all", album: null, calMonth: null, mapNode: null };

  Object.defineProperty(LC, "S", {
    get() { return S; },
    set(v) {
      if (!v || typeof v !== "object") return;
      Object.keys(S).forEach(k => { delete S[k]; });
      Object.assign(S, v);
    },
    enumerable: true
  });
  Object.assign(LC, {
    DATA, WORDS, WORD, TDATA, THEMES, THEME, GRAMMAR, GBY, CATS, CAT, POSES, HERO, SVG_SET,
    ICON_PLACEHOLDER, SVG_ICON_TRIAL, NEW_LESSONS_PER_DAY, KEY, MAX_HEARTS, HEART_MS, INTERVALS, LEVELS, PRAISE, DAY_COLORS, POS_ZH, UNLOCK_REASON, WD,
    $, $$, esc, safeRich, shuffle, sample, rand, shuffleNE, pad,
    save, load, defaultState,
    nowDate, today, addDays, diffDays, weekdayOf, mondayOnOrBefore, zhDate, weekdayLabel, isSunday, gapOnlySundays,
    currentStreak, markActive, addXP, todayXP, refillHearts, loseHeart, heartCountdown,
    srsUpdate, learnedWords, dueWords, weakest, weightedSample, masteredCount, wordsOf, themeWords,
    PATH, NODE, isDone, nodeUnlocked, nextNewNode, newLessonsDone, newCountToday, expectedCount, isBehind, behindBy, isSundayRest, canStartNewToday,
    openSaturday, blockingMonthly, nextQuarterly, activeTheme, currentWeek, themeWordsLearned, wordLearnedOnCard,
    grammarDoneCount, monthlyDoneCount, unlockValue, ruleMet, checkUnlocks, albumMath, poseUnlocked, lockedProgressText, hairTint,
    placeholderMode, iconKind, renderIcon, tileHTML, iconErr, themeIconHTML, themeSlug, cardFileName, cropStyle, faceHTML, companion,
    toast, closeModal, modal, TTS, SR, beep, meow, scheduleMeow, unlockAudio, highlight, tipHTML, maybeAwardYarn, ui
  });
})(window.LC = window.LC || {});
