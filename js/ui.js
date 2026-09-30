/* Screens: home, map, cards, cats, album, profile, celebrations, dev. */
(function (LC) {
  "use strict";
  const { $, $$, esc, S, save, today, toast, modal, closeModal, faceHTML, renderIcon, themeIconHTML, companion,
    PATH, NODE, THEMES, THEME, CATS, CAT, GBY, GRAMMAR, WORDS, WORD, POSES, TDATA, HERO,
    isDone, nextNewNode, canStartNewToday, isBehind, behindBy, isSundayRest, newCountToday, openSaturday,
    blockingMonthly, nextQuarterly, activeTheme, currentWeek, themeWordsLearned, wordLearnedOnCard,
    dueWords, learnedWords, currentStreak, masteredCount, grammarDoneCount, albumMath, poseUnlocked,
    lockedProgressText, hairTint, weekdayLabel, zhDate, cardFileName, DAY_COLORS, LEVELS, UNLOCK_REASON,
    tileHTML, placeholderMode, checkUnlocks, nowDate, addDays, pad, refillHearts, heartCountdown, MAX_HEARTS,
    ui, beep, TTS, SR } = LC;

  const IC = {
    home: '<svg viewBox="0 0 24 24"><path d="M4 11.5 12 5l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-5h-6v5H5.5A1.5 1.5 0 0 1 4 19z" fill="currentColor"/></svg>',
    map: '<svg viewBox="0 0 24 24"><path d="M3.5 6.5 9 4.5l6 2 5.5-2v13l-5.5 2-6-2-5.5 2z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M9 4.5v13M15 6.5v13" stroke="currentColor" stroke-width="2"/></svg>',
    cards: '<svg viewBox="0 0 24 24"><rect x="7" y="3.5" width="13" height="16" rx="3" fill="currentColor" opacity=".45"/><rect x="4" y="5.5" width="13" height="16" rx="3" fill="currentColor"/><path d="M7.5 10h6M7.5 13.5h6M7.5 17h4" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>',
    paw: '<svg viewBox="0 0 24 24" fill="currentColor"><ellipse cx="12" cy="16" rx="5.2" ry="4.4"/><ellipse cx="6" cy="10.5" rx="2.2" ry="2.8"/><ellipse cx="18" cy="10.5" rx="2.2" ry="2.8"/><ellipse cx="9.3" cy="6.3" rx="2.1" ry="2.7"/><ellipse cx="14.7" cy="6.3" rx="2.1" ry="2.7"/></svg>',
    me: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="4" fill="currentColor"/><path d="M4.5 20.5c.8-4 3.8-6 7.5-6s6.7 2 7.5 6z" fill="currentColor"/></svg>'
  };
  const PAW_W = IC.paw.replace("<svg", '<svg class="paww"');

  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function name() { return ((S.profile && S.profile.name) || "").trim(); }
  function cardSigner() { const n = name(); return n ? "🐾 " + n + " 已完成" : "🐾 已完成"; }

  function renderTop() {
    refillHearts();
    const st = currentStreak();
    const active = S.lastActive === today();
    $("#top").innerHTML =
      '<button class="brand" data-act="avatar" aria-label="陪讀貓">' + faceHTML(S.companion, 36, { cls: "ring2", eager: true }) + "<span>懶貓英文</span></button>" +
      '<div class="stats"><button class="stat fire' + (active ? "" : " off") + '" data-act="tab" data-t="me" aria-label="連續日數"><span class="emoji">🔥</span>' + st + '</button>' +
      '<button class="stat xp" data-act="tab" data-t="me" aria-label="XP"><span class="emoji">⭐</span>' + S.xp + '</button>' +
      '<button class="stat heart" data-act="hearts" aria-label="心"><span class="emoji">❤️</span>' + (S.unlimited ? "∞" : S.hearts) + "</button></div>";
  }
  function renderTabs() {
    const due = dueWords().length;
    const tabs = [["home", "首頁", "home"], ["map", "地圖", "map"], ["cards", "生字卡", "cards"], ["cats", "貓貓", "paw"], ["me", "我", "me"]];
    $("#tabs").innerHTML = tabs.map(([id, label, ic]) => {
      const on = ui.tab === id;
      const badge = id === "cards" && due ? '<span class="badge">' + due + "</span>" : "";
      return '<button class="tab' + (on ? " on" : "") + '" data-act="tab" data-t="' + id + '">' + IC[ic] + "<span>" + label + "</span>" + badge + "</button>";
    }).join("");
  }

  function seasonMeta(n) {
    return LC.seasonByNo(n) || { season: n || 1, zh: "", emoji: "🌸", weeks: "", place_zh: "", subtitle_zh: "" };
  }
  function seasonKicker(s, week) {
    return "第 " + s.season + " 季・" + s.emoji + " " + s.zh + " ・ 第 " + week + " / 52 週";
  }
  function heroCopy() {
    if (isDone("q4x") && !nextNewNode()) return ["全年四個季節都學完！", "1,200 個字都學過，想溫就溫下到期嘅字 🌸"];
    if (isSundayRest()) return ["今日懶貓日 😴", "冇新嘢學，想溫就溫下到期嘅字。"];
    const doneToday = newCountToday() > 0 && !canStartNewToday();
    if (doneToday || (newCountToday() > 0 && !isBehind())) return ["今日學完喇！", "我哋一齊瞓返個晏覺 😴"];
    const who = name();
    return [who ? "喵～瞓醒未呀 " + who + "？" : "喵～瞓醒未呀？", "今日學埋 5 個字，就可以一齊瞓返個晏覺 😴"];
  }
  function needsHearts(act) {
    return !S.unlimited && S.hearts <= 0 && act !== "review" && act !== "practice";
  }
  function mainButton(label, act, extra) {
    if (needsHearts(act) && act !== "done") return '<button class="btn hearts" data-act="hearts">❤️ 冇心喇</button>';
    return '<button class="btn' + (extra || "") + '" data-act="' + act + '">' + label + "</button>";
  }

  function homeToday() {
    const ip = S.inProgress && NODE[S.inProgress.nodeId] && NODE[S.inProgress.nodeId].type === "day" && !isDone(S.inProgress.nodeId) ? S.inProgress : null;
    const nxt = nextNewNode();
    const monthly = blockingMonthly();
    const quarterly = nextQuarterly();
    const sats = openSaturday();
    const sunday = isSundayRest();
    const resumeNode = ip ? NODE[ip.nodeId] : null;

    if (ip) {
      const node = resumeNode;
      const ws = LC.wordsOf(node.theme, node.day);
      const seen = ip.cardsSeen || 0;
      const left = 5 - seen;
      const label = seen >= 5 ? "繼續學 🐾 做埋小測驗" : seen === 0 ? "開始學 🐾 今日 5 個字" : "繼續學 🐾 仲有 " + left + " 個字";
      return { title: "今日 5 個字 ・ " + weekdayLabel(), tiles: wordTiles(ws, seen, false), learned: "已學 " + Math.min(5, seen) + " / 5", btns: mainButton(label, "resume"), mode: "resume", extra: satRow(sats) };
    }
    if (sunday) {
      let btns = "";
      if (dueWords().length) btns += '<button class="btn" data-act="review">溫下到期嘅字</button>';
      sats.forEach(n => { btns += satButton(n); });
      if (monthly) btns += '<button class="btn lav" data-act="startnode" data-id="' + monthly.id + '">開始月度複習 💪</button>';
      if (quarterly) btns += '<button class="btn" data-act="startnode" data-id="' + quarterly.id + '">開始季度複習 💪</button>';
      if (!btns) btns = '<button class="btn" disabled>今日休息下 😴</button>';
      return { title: "今日懶貓日 😴", sub: weekdayLabel(), tiles: "", learned: "", btns, mode: "sunday" };
    }
    if (monthly && !(nxt && canStartNewToday() && THEMES.findIndex(t => t.id === nxt.theme) < THEMES.findIndex(t => t.followed_by === monthly.id))) {
      // monthly blocks the next theme; show it when the next new lesson is not yet available
      if (!nxt || !canStartNewToday()) {
        let btns = mainButton("開始複習 💪", "startnode") ;
        // fix: mainButton doesn't pass id. custom:
        btns = needsHearts("monthly") ? '<button class="btn hearts" data-act="hearts">❤️ 冇心喇</button>' : '<button class="btn" data-act="startnode" data-id="' + monthly.id + '">開始複習 💪</button>';
        return { title: "🏆 月度大複習", sub: "完成先可以開下一個主題", tiles: "", learned: "", btns: btns + satRow(sats), mode: "monthly" };
      }
    }
    if (!nxt && quarterly) {
      const label = quarterly.type === "exam" ? "開始季度大考 👑" : "開始複習 💪";
      const btn = needsHearts("q") ? '<button class="btn hearts" data-act="hearts">❤️ 冇心喇</button>' : '<button class="btn" data-act="startnode" data-id="' + quarterly.id + '">' + label + "</button>";
      return { title: "👑 季度複習週", sub: quarterly.type === "exam" ? "季度大考" : "第 " + quarterly.day + " / 5 日", tiles: "", learned: "", btns: btn, mode: "q" };
    }
    if (nxt && canStartNewToday() && newCountToday() === 0) {
      const ws = LC.wordsOf(nxt.theme, nxt.day);
      return { title: "今日 5 個字 ・ " + weekdayLabel(), tiles: wordTiles(ws, 0, false), learned: "已學 0 / 5", btns: mainButton("開始學 🐾 今日 5 個字", "startnew"), extra: satRow(sats), mode: "start" };
    }
    if (nxt && canStartNewToday() && isBehind()) {
      const ws = LC.wordsOf(nxt.theme, nxt.day);
      const n = behindBy();
      return { title: "今日 5 個字 ・ " + weekdayLabel(), tiles: wordTiles(ws, 0, false), learned: "已學 0 / 5", btns: mainButton("追進度 🐾 再學 5 個字", "startnew") + '<p class="catch">仲差 ' + n + " 課追上進度</p>", extra: satRow(sats), mode: "catch" };
    }
    if (sats.length && !canStartNewToday()) {
      let btns = "";
      if (newCountToday() > 0) btns += '<button class="btn" disabled>今日完成 ✓ 聽日見 🌙</button>';
      sats.forEach(n => { btns += satButton(n); });
      const odd = sats.every(n => n.type === "weekly");
      return { title: odd ? "星期六：週複習" : "星期六：週複習＋文法", sub: weekdayLabel(), tiles: "", learned: "", btns, mode: "sat" };
    }
    if (!nxt && !quarterly && isDone("q4x")) {
      return { title: "全年完成 🌸", tiles: "", learned: "", btns: '<button class="btn ghost" data-act="tab" data-t="map">去地圖睇吓</button>', mode: "done-year" };
    }
    const shown = lastFinishedDay();
    const tiles = shown ? wordTiles(LC.wordsOf(shown.theme, shown.day), 5, true) : "";
    return { title: "今日 5 個字 ・ " + weekdayLabel(), tiles, learned: shown ? "已學 5 / 5" : "", btns: '<button class="btn" disabled>今日完成 ✓ 聽日見 🌙</button>' + satRow(sats), mode: "done" };
  }
  function satButton(n) {
    if (needsHearts(n.type)) return '<button class="btn hearts" data-act="hearts">❤️ 冇心喇</button>';
    if (n.type === "weekly") return '<button class="btn ghost" data-act="startnode" data-id="' + n.id + '">做週複習 📝</button>';
    return '<button class="btn lav" data-act="startnode" data-id="' + n.id + '">上文法課 📖</button>';
  }
  function satRow(sats) { return sats.map(satButton).join(""); }
  function lastFinishedDay() {
    const days = PATH.filter(n => n.type === "day" && isDone(n.id));
    return days.length ? days[days.length - 1] : null;
  }
  function wordTiles(ws, seen, allDone) {
    return '<div class="words">' + ws.map((w, i) => {
      const cls = allDone || i < seen ? "done" : i === seen ? "cur" : "lock";
      return '<button class="w ' + cls + ' speakable" data-speak="' + esc(w.word) + '">' + renderIcon(w, 46) + "<span class=\"fit\">" + esc(w.word) + "</span></button>";
    }).join("") + "</div>";
  }

  function renderHome() {
    const [ht, hb] = heroCopy();
    const theme = activeTheme();
    const week = currentWeek();
    const qNow = nextQuarterly();
    const seas = theme ? seasonMeta(theme.season) : seasonMeta((qNow && qNow.season) || (isDone("q4x") ? 4 : 1));
    let themeCard = "";
    if (theme) {
      const learned = themeWordsLearned(theme);
      themeCard = '<button class="card theme" data-act="opentheme" data-id="' + theme.id + '"><div class="ttile">' + themeIconHTML(theme, 46) + "</div><div class=\"tmeta\"><div class=\"t1\">" + esc(seasonKicker(seas, week)) + '</div><div class="t2">' + esc(theme.zh) + ' <span class="en">' + esc(theme.en) + '</span></div><div class="bar"><i style="width:' + Math.round(100 * learned / 25) + '%"></i></div></div><div class="tfrac">' + learned + "/25</div></button>";
    } else if (qNow) {
      themeCard = '<div class="card theme"><div class="ttile"><span class="emoji">👑</span></div><div class="tmeta"><div class="t1">' + esc(seasonKicker(seas, qNow.week)) + '</div><div class="t2">季度複習週 <span class="en">Review</span></div></div></div>';
    } else {
      themeCard = '<div class="card theme"><div class="ttile"><span class="emoji">🌸</span></div><div class="tmeta"><div class="t1">全年 ・ 第 52 / 52 週</div><div class="t2">四個季節都學完 <span class="en">Year complete</span></div></div></div>';
    }
    const todayCard = homeToday();
    const mapEntry = '<button class="mapentry" data-act="tab" data-t="map"><span class="mapmini" aria-hidden="true"><i>🏠</i><i>🚇</i><i>🏫</i><i>🏮</i></span><span class="mapentry-t"><b>你同貓一齊行到邊？</b><small>四個地方，慢慢亮</small></span></button>';
    const due = dueWords().length;
    const dueChip = due ? '<button class="due-chip" data-act="review">🧠 你有 <b>' + due + "</b> 個字今日要複習<span>去複習 →</span></button>" : "";
    const strip = weekStrip(theme);
    const frame = heroFrame();
    const zzz = frame.nap ? '<span class="zzz z1">z</span><span class="zzz z2">z</span><span class="zzz z3">Z</span>' : "";
    return '<div class="page home">' +
      '<div class="hero"><img class="heroimg" src="' + esc(frame.src) + '" alt="' + esc(frame.alt) + '" style="object-position:' + frame.pos + '"><div class="shade"></div>' + zzz + '<span class="heroname">' + esc(frame.label) + '</span><div class="bubble"><b>' + esc(ht) + "</b>" + esc(hb) + "</div></div>" +
      themeCard + mapEntry +
      '<div class="card today"><div class="row"><h3>' + esc(todayCard.title) + "</h3>" + (todayCard.learned ? '<span class="pill sun">' + todayCard.learned + "</span>" : "") + "</div>" +
      (todayCard.sub && !todayCard.learned ? '<p class="muted">' + esc(todayCard.sub) + "</p>" : "") +
      todayCard.tiles + '<div class="btncol">' + todayCard.btns + "</div>" + (todayCard.extra || "") + "</div>" +
      dueChip + strip + "</div>";
  }
  function weekStrip(theme) {
    if (!theme) {
      const q = nextQuarterly();
      const seas = q ? seasonMeta(q.season) : null;
      const lastId = seas && (seas.path_order || []).filter(id => String(id).startsWith("t")).slice(-1)[0];
      theme = (lastId && THEME[lastId]) || THEMES[0];
    }
    const days = ["一", "二", "三", "四", "五"];
    let cur = 0;
    for (let d = 1; d <= 5; d++) { if (!isDone(theme.id + "d" + d)) { cur = d; break; } }
    const cells = days.map((lab, i) => {
      const d = i + 1; const done = isDone(theme.id + "d" + d);
      if (done) return '<div class="d ok"><i>' + PAW_W + "</i>" + lab + "</div>";
      if (d === cur) return '<div class="d now"><i>' + d + "</i>" + lab + "</div>";
      return '<div class="d"><i>' + d + "</i>" + lab + "</div>";
    }).join("");
    return '<div class="card week">' + cells +
      '<div class="d gr"><i class="emoji">📖</i>六<small>文法+複習</small></div>' +
      '<div class="d rest"><i class="emoji">😴</i>日<small>懶貓日</small></div></div>';
  }

  const MAP_SLOTS = [
    [0, 0], [1, 0], [2, 0], [3, 0],
    [3, 1], [2, 1], [1, 1], [0, 1],
    [0, 2], [1, 2], [2, 2], [3, 2],
    [3, 3], [2, 3], [1, 3], [0, 3]
  ];
  function viewingSeason() {
    if (ui.mapSeason && LC.seasonOpen(ui.mapSeason)) return ui.mapSeason;
    const t = activeTheme();
    if (t && LC.seasonOpen(t.season)) return t.season;
    const q = nextQuarterly();
    if (q && LC.seasonOpen(q.season)) return q.season;
    for (let n = 4; n >= 1; n--) if (LC.seasonOpen(n)) return n;
    return 1;
  }
  function mapNodeState(id) {
    if (String(id).startsWith("q")) {
      const exam = id + "x";
      const first = NODE[id + "d1"];
      return isDone(exam) ? "done" : (first && LC.nodeUnlocked(first) ? "cur" : "lock");
    }
    if (String(id).startsWith("m")) return isDone(id) ? "done" : (NODE[id] && LC.nodeUnlocked(NODE[id]) ? "cur" : "lock");
    const doneDays = [1, 2, 3, 4, 5].filter(d => isDone(id + "d" + d)).length;
    if (doneDays === 5) return "done";
    const nxt = nextNewNode();
    if ((nxt && nxt.theme === id) || doneDays > 0) return "cur";
    if (NODE[id + "d1"] && LC.nodeUnlocked(NODE[id + "d1"])) return "cur";
    return "lock";
  }
  function snakeHTML(season) {
    const ids = season.path_order || [];
    const curI = ids.findIndex(id => mapNodeState(id) === "cur");
    let nodes = "";
    ids.forEach((id, i) => {
      const [c, r] = MAP_SLOTS[i];
      const st = mapNodeState(id);
      const q = String(id).startsWith("q");
      const m = String(id).startsWith("m");
      let emoji = "🏆", label = "", sub = "";
      if (q) {
        const spec = LC.quarterlyById(id);
        emoji = "👑";
        label = "季度大複習";
        if (spec && spec.exam_cat && CAT[spec.exam_cat]) sub = "解鎖" + CAT[spec.exam_cat].name_zh + " 🐱";
      } else if (m) { emoji = "🏆"; label = "月度複習"; }
      else { const t = THEME[id]; emoji = (t && t.emoji) || "🐾"; label = (t && (t.short_zh || t.zh)) || id; }
      const cls = "nd " + (m ? "rev " : "") + (q ? "q " : "") + (st === "done" ? "done" : st === "cur" ? "cur" : "lockd");
      const icon = (id === "t05" && THEME.t05 && THEME.t05.icon) ? '<img alt="" src="' + esc(THEME.t05.icon) + '" style="width:32px;height:32px">' : '<span class="emoji">' + emoji + "</span>";
      const lab = st === "cur" && !m && !q ? '<span class="here-lab">' + esc(label) + "・學緊</span>" : esc(label);
      nodes += '<button class="' + cls + '" style="--c:' + c + ';--r:' + r + '" data-act="mapnode" data-id="' + id + '" aria-label="' + esc(label) + '">' + icon + (st === "done" ? '<span class="ck">✓</span>' : "") + "</button>" +
        '<div class="lb" style="--c:' + c + ';--r:' + r + '">' + lab + (sub ? '<b class="subcat">' + esc(sub) + "</b>" : "") + "</div>";
    });
    const avatar = curI >= 0 ? '<div class="here" data-c="' + MAP_SLOTS[curI][0] + '" data-r="' + MAP_SLOTS[curI][1] + '">' + faceHTML(S.companion, 36) + "</div>" : "";
    return '<div class="snake" id="snake"><svg class="path" viewBox="0 0 334 294" id="mappath" data-path="' + esc(ids.join(",")) + '"></svg>' + nodes + avatar + "</div>";
  }
  const ZONES = {
    1: { name: "屋企", mark: "🪟", done: "「屋企」行完喇。窗台亮起。" },
    2: { name: "出街", mark: "🚇", done: "「出街」行完喇。港鐵站牌亮起。" },
    3: { name: "學校", mark: "🏫", done: "「學校」行完喇。校門牌亮起。" },
    4: { name: "過節", mark: "🏮", done: "「過節」行完喇。燈籠亮起。" }
  };
  const SIGNS = { 2: "出門記得帶鎖匙。", 3: "鐘響之前，買個麵包都得。", 4: "功課放下，燈籠點起。" };
  function weekLamp(theme) {
    const days = [1, 2, 3, 4, 5].filter(d => isDone(theme.id + "d" + d)).length;
    if (days >= 5) return "on";
    if (days > 0) return "half";
    return "";
  }
  function lifeMapHTML(view) {
    const seasons = TDATA.seasons || [];
    let html = '<div class="lifemap"><p class="lifelead">同懶貓一齊行嘅香港</p><p class="legend"><i class="lamp week on"></i> 學完一週　<i class="lamp street on"></i> 出過街</p>';
    seasons.forEach(s => {
      const z = ZONES[s.season] || { name: s.place_zh || s.zh, mark: s.emoji || "🐾", done: "" };
      const open = LC.seasonOpen(s.season);
      const themes = THEMES.filter(t => t.season === s.season);
      const exam = isDone("q" + s.season + "x");
      if (SIGNS[s.season]) {
        const walked = isDone("q" + (s.season - 1) + "x");
        html += '<div class="sign' + (walked ? " lit" : "") + '"><span aria-hidden="true">🪧</span><b>' + esc(SIGNS[s.season]) + "</b></div>";
      }
      html += '<button class="zone' + (s.season === view ? " on" : "") + (open ? "" : " fog") + '" style="background:' + (s.bg || "#fff") + ";border-color:" + (s.border || "#E7D5C3") + '" data-act="mapseason" data-season="' + s.season + '">';
      html += '<div class="zmark' + (exam ? " lit" : "") + '" aria-hidden="true">' + z.mark + "</div><div class=\"zbody\"><b>" + esc(z.name) + "</b><small>" + esc((s.place_zh || "") + (s.zh ? " · " + s.zh : "")) + "</small>";
      if (!open) html += "<p>仲未行到呢度。慢慢嚟。</p>";
      else {
        html += '<div class="lamps">' + themes.map(t => '<i class="lamp week ' + weekLamp(t) + '"></i>').join("") + "</div>";
        html += '<div class="lamps">' + themes.map(t => '<i class="lamp street' + (S.outings && S.outings[t.id] ? " on" : "") + '" data-out="' + esc(t.id) + '"></i>').join("") + "</div>";
        if (exam) {
          const spec = LC.quarterlyById("q" + s.season);
          const cat = spec && spec.exam_cat && CAT[spec.exam_cat];
          html += '<p class="zdone">' + esc(z.done) + (cat ? " 解鎖新朋友：" + esc(cat.name_zh) + "。" : "") + "</p>";
        }
      }
      html += "</div></button>";
    });
    return html + "</div>";
  }
  function nowOuting(season) {
    const theme = activeTheme();
    if (!theme || theme.season !== season.season) return "";
    const o = ((TDATA.copy && TDATA.copy.outings) || []).find(x => x.theme_id === theme.id);
    if (!o) return "";
    const z = ZONES[season.season] || { name: season.place_zh || "" };
    const themes = THEMES.filter(t => t.season === season.season);
    const i = Math.max(1, themes.findIndex(t => t.id === theme.id) + 1);
    const said = S.outings && S.outings[theme.id];
    return '<div class="card outing"><b>' + esc(z.name) + " · 第 " + i + " 週</b><p>" + esc(o.scene_zh) + '</p><p class="enline">' + esc(o.en) + "</p>" +
      (said ? '<button class="btn ghost" disabled>講過 ✓</button>' : '<button class="btn" data-act="outing" data-id="' + theme.id + '">我講過</button>') + "</div>";
  }
  function diaryHTML(season) {
    const diaries = (TDATA.copy && TDATA.copy.diaries) || [];
    const d = diaries.find(x => x.season === season.season);
    if (!d) return "";
    if (!LC.seasonOpen(season.season)) {
      return '<div class="card diary"><h3>' + esc(d.title) + "</h3><p>" + esc(LC.seasonLockLine(season.season)) + "</p></div>";
    }
    const note = (S.diary && S.diary[String(season.season)]) || "";
    return '<div class="card diary" id="seasonDiary"><h3>' + esc(d.title) + "</h3><p>" + esc(d.body) + '</p><label class="mp" for="diaryNote">你想記低嘅一句</label><textarea id="diaryNote" maxlength="80">' + esc(note) + '</textarea><button class="btn ghost" data-act="savediary" data-season="' + season.season + '">記低</button></div>';
  }
  function renderMap() {
    const week = currentWeek();
    const learned = Object.keys(S.srs).length;
    const cards = Object.keys(S.themeCards).length;
    const g = grammarDoneCount();
    const outN = Object.keys(S.outings || {}).length;
    const studyN = (S.activeDates || []).length;
    const seasons = TDATA.seasons || [];
    const view = viewingSeason();
    const season = seasons.find(s => s.season === view) || seasons[0];
    const head = '<div class="card yh"><div class="row"><h2>我哋去到邊？</h2><span class="wk">第 ' + week + ' / 52 週</span></div><div class="bar"><i style="width:' + Math.min(100, (week / 52) * 100) + '%"></i></div><div class="sub"><span>已學 ' + fmt(learned) + ' / 1,200 字</span><span>主題 ' + cards + " / 48 ・ 文法 " + g + ' / 24</span></div><div class="sub"><span id="outingCount">出街 ' + outN + ' 次</span><span>學習日 ' + studyN + " 日</span></div></div>";
    if (!season) return '<div class="page mapage">' + head + "</div>";
    const z = ZONES[season.season] || { name: season.place_zh || "" };
    const box = '<div class="s1" style="background:' + season.bg + ";border-color:" + season.border + '"><div class="sh"><span class="emoji">' + season.emoji + "</span>" + esc(z.name) + "・" + esc(season.zh) + "<small>第 " + esc(season.weeks) + " 週</small></div>" + snakeHTML(season) + "</div>";
    const read = isDone("q" + season.season + "x") ? '<button class="btn ghost" data-act="readdiary">讀懶貓日記</button>' : "";
    return '<div class="page mapage">' + head + lifeMapHTML(view) + nowOuting(season) + read + box + diaryHTML(season) + "</div>";
  }
  function paintMap() {
    const svg = $("#mappath"); if (!svg) return;
    const X = [42, 125, 208, 291], Y = [24, 96, 168, 240];
    const d = "M" + X[0] + " " + Y[0] + " H" + X[3] + " A36 36 0 0 1 " + X[3] + " " + Y[1] + " H" + X[0] + " A36 36 0 0 0 " + X[0] + " " + Y[2] + " H" + X[3] + " A36 36 0 0 1 " + X[3] + " " + Y[3] + " H" + X[0];
    svg.innerHTML = '<path d="' + d + '" fill="none" stroke="#EAD9C8" stroke-width="7" stroke-dasharray="2 11" stroke-linecap="round"/><path id="mapdone" d="' + d + '" fill="none" stroke="#FFD66B" stroke-width="7" stroke-linecap="round"/>';
    const ids = (svg.getAttribute("data-path") || "").split(",").filter(Boolean);
    let lastDone = -1;
    ids.forEach((id, i) => { if (mapNodeState(id) === "done") lastDone = i; });
    const path = svg.querySelector("#mapdone");
    if (!path || lastDone < 0) { if (path) path.style.display = "none"; return; }
    const len = path.getTotalLength();
    const [c, r] = MAP_SLOTS[lastDone];
    const tx = X[c], ty = Y[r];
    let best = 0, bestD = 1e9;
    for (let l = 0; l <= len; l += 3) {
      const p = path.getPointAtLength(l);
      const dd = (p.x - tx) ** 2 + (p.y - ty) ** 2;
      if (dd < bestD) { bestD = dd; best = l; }
    }
    path.style.strokeDasharray = best + " " + len;
  }
  function openMapSheet(id) {
    if (String(id).startsWith("q")) return quarterlySheet(id);
    if (String(id).startsWith("m")) return monthlySheet(id);
    const t = THEME[id];
    const st = mapNodeState(id);
    let rows = "";
    for (let d = 1; d <= 5; d++) {
      const ws = LC.wordsOf(t.id, d);
      const done = isDone(t.id + "d" + d);
      const node = NODE[t.id + "d" + d];
      const open = LC.nodeUnlocked(node);
      rows += '<div class="dayrow"><div class="dn">' + (done ? "✓" : d) + "</div><div class=\"dwords\">" + ws.map(w => '<button class="speakable" data-speak="' + esc(w.word) + '">' + renderIcon(w, 36) + "<span>" + esc(w.word) + "</span></button>").join("") + "</div>" +
        (done ? '<button class="mini" data-act="startnode" data-id="' + node.id + '" data-replay="1">重溫</button>' : open && st !== "lock" ? '<button class="mini" data-act="startnode" data-id="' + node.id + '">開始</button>' : "") + "</div>";
    }
    const sat = isDone(t.id + "d5") ? '<div class="dayrow"><div class="dn">六</div><div>週複習' + (t.grammar ? "＋文法" : "") + "</div>" +
      (!isDone(t.id + "w") ? '<button class="mini" data-act="startnode" data-id="' + t.id + 'w">開始</button>' : '<button class="mini" data-act="startnode" data-id="' + t.id + 'w" data-replay="1">重溫</button>') +
      (t.grammar ? (!isDone(t.grammar) ? '<button class="mini" data-act="startnode" data-id="' + t.grammar + '">文法</button>' : '<button class="mini" data-act="startnode" data-id="' + t.grammar + '" data-replay="1">文法</button>') : "") + "</div>" : "";
    const cardBtn = (Object.keys(S.themeCards).includes(t.id) || themeWordsLearned(t) > 0) ? '<button class="btn ghost" data-act="opentheme" data-id="' + t.id + '">睇生字卡</button>' : "";
    const locked = st === "lock" ? '<p class="mp">完成之前嘅課就會解鎖</p>' : "";
    const o = ((TDATA.copy && TDATA.copy.outings) || []).find(x => x.theme_id === t.id);
    const said = S.outings && S.outings[t.id];
    const outing = o ? '<div class="outing"><b>' + esc(o.scene_zh) + '</b><p class="enline">' + esc(o.en) + "</p>" +
      (said ? '<button class="btn ghost" disabled>講過 ✓</button>' : st === "lock" ? '<p class="mp">解鎖呢個主題之後，可以記低你講過</p>' : '<button class="btn" data-act="outing" data-id="' + t.id + '">我講過</button>') +
      "</div>" : "";
    modal('<h3>' + t.emoji + " " + esc(t.zh) + "</h3><p class=\"mp\">第 " + t.week + " 週 ・ " + esc(t.en) + "</p>" + locked + rows + sat + outing + cardBtn + '<button class="btn plain" data-act="close">關閉</button>', { sheet: true });
  }
  function monthlySheet(id) {
    const spec = TDATA.monthly_reviews.find(m => m.id === id);
    const open = LC.nodeUnlocked(NODE[id]);
    const copy = (TDATA.copy && TDATA.copy.monthly) || {};
    const n = (spec.themes || []).filter(tid => S.outings && S.outings[tid]).length;
    const lamps = (spec.themes || []).filter(tid => isDone(tid + "d5")).length;
    const line = n === 0 && lamps === 0 ? (copy.empty || "") : "今個月你同我亮咗 " + lamps + " 盞燈，出咗 " + n + " 次街。";
    const study = (S.activeDates || []).length;
    const place = seasonMeta(spec.season || 1).place_zh || "";
    const extra = copy.title ? '<div class="outing"><b>' + esc(copy.title) + "</b><p>" + esc(line) + "</p><p class=\"mp\">" + esc(copy.outing_label || "出街次數") + " " + n + " ・ " + esc(copy.study_days_label || "學習日") + " " + study + "</p><p class=\"mp\">" + esc(copy.study_days_hint || "") + "</p><p class=\"mp\">" + esc(copy.map_label || "地圖去到") + " " + esc(place) + "</p><p class=\"mp\">" + esc(copy.prompt || "") + "</p><p class=\"mp\">" + esc(copy.no_compare || "") + "</p></div>" : "";
    const btn = !open ? '<p class="mp">完成之前嘅課就會解鎖</p>' : isDone(id) ? '<button class="btn" data-act="startnode" data-id="' + id + '">重溫</button>' : '<button class="btn" data-act="startnode" data-id="' + id + '">開始 +40 XP</button>';
    modal("<h3>🏆 月度大複習 " + spec.no + "</h3><p class=\"mp\">" + spec.themes.map(t => THEME[t].zh).join("、") + " ・ " + spec.questions + " 題</p>" + extra + btn + '<button class="btn plain" data-act="close">關閉</button>', { sheet: true });
  }
  function quarterlySheet(qid) {
    const spec = LC.quarterlyById(qid) || TDATA.quarterly_review;
    const open0 = NODE[spec.id + "d1"] && LC.nodeUnlocked(NODE[spec.id + "d1"]);
    let rows = spec.review_days.map((d, i) => {
      const id = spec.id + "d" + (i + 1);
      const node = NODE[id];
      const btn = isDone(id) ? '<button class="mini" data-act="startnode" data-id="' + id + '" data-replay="1">重溫</button>' : node && LC.nodeUnlocked(node) ? '<button class="mini" data-act="startnode" data-id="' + id + '">開始</button>' : "";
      return "<div class=\"dayrow\"><div class=\"dn\">" + (i + 1) + "</div><div>主題 " + d.themes.map(t => THEME[t].short_zh || THEME[t].zh).join("・") + "</div>" + btn + "</div>";
    }).join("");
    const examId = spec.id + "x";
    const ex = isDone(examId) ? '<button class="btn ghost" data-act="startnode" data-id="' + examId + '">重溫大考</button>' : NODE[examId] && LC.nodeUnlocked(NODE[examId]) ? '<button class="btn" data-act="startnode" data-id="' + examId + '">開始季度大考 👑</button>' : "";
    const cat = spec.exam_cat && CAT[spec.exam_cat];
    const catLine = cat ? "完成大考解鎖" + cat.name_zh + " 🐱" : "學完全年 1,200 個字先解鎖豹豹 🐱";
    modal("<h3>👑 季度複習週</h3>" + (open0 ? "" : '<p class="mp">完成之前嘅課就會解鎖</p>') + rows + ex + '<p class="mp">' + esc(catLine) + '</p><button class="btn plain" data-act="close">關閉</button>', { sheet: true });
  }

  function carouselThemes() {
    const list = [];
    THEMES.forEach(t => {
      const started = !!S.themeCards[t.id] || themeWordsLearned(t) > 0 || (activeTheme() && activeTheme().id === t.id);
      if (started) list.push(t);
    });
    if (!list.length && THEMES[0]) list.push(THEMES[0]);
    return list;
  }
  function renderCards() {
    if (ui.segment === "bank") return renderBank();
    if (ui.segment === "grammar") return renderGrammar();
    const list = carouselThemes();
    if (ui.cardIndex >= list.length) ui.cardIndex = list.length - 1;
    if (ui.cardIndex < 0) ui.cardIndex = 0;
    const t = list[ui.cardIndex];
    const dots = list.map((_, i) => '<i class="' + (i === ui.cardIndex ? "on" : "") + '"></i>').join("");
    const collected = Object.keys(S.themeCards).length;
    const next = THEMES[THEMES.findIndex(x => x.id === t.id) + 1];
    const complete = !!S.themeCards[t.id];
    return '<div class="page cards">' + segBar() +
      '<div class="chead"><button class="back" data-act="tab" data-t="home" aria-label="返回">‹</button><div><h2>主題生字卡</h2><p>已收集 ' + collected + ' / 48 張 ・ 左右掃睇其他主題</p></div><div class="dots">' + dots + "</div></div>" +
      '<div class="swipe" data-swipe="cards">' + vocabCardHTML(t) + "</div>" +
      '<div class="cardtools"><label class="switchline"><span>音標</span><button class="switch' + (S.settings.showIPA ? " on" : "") + '" data-act="ipa" aria-label="音標"></button></label>' +
      '<button class="btn ghost" data-act="saveimg" data-id="' + t.id + '"' + (complete ? "" : " disabled") + '>💾 存做圖片</button>' +
      '<button class="btn" data-act="shareimg" data-id="' + t.id + '"' + (complete ? "" : " disabled") + ">📤 分享</button></div>" +
      '<div class="infostrip">✨ 每學完一個主題就解鎖一張生字卡<div>' + (next ? "下一張：" + next.emoji + " " + esc(next.zh) + "（第 " + next.week + " 週）" : "全年最後一張") + "</div></div></div>";
  }
  function segBar() {
    const segs = [["cards", "主題卡"], ["bank", "生字庫"], ["grammar", "文法"]];
    return '<div class="segs">' + segs.map(([k, l]) => '<button class="' + (ui.segment === k ? "on" : "") + '" data-act="seg" data-s="' + k + '">' + l + "</button>").join("") + "</div>";
  }
  function vocabCardHTML(t) {
    const rec = S.themeCards[t.id];
    const catSlug = rec ? rec.cat : S.companion;
    const cat = CAT[catSlug] || CAT.fanshu;
    const hero = cat.slug === "fanshu";
    const photo = hero ? faceHTML("fanshu", 72, { hero: true, r: "16px", h: 72 }) : faceHTML(cat.slug, 72, { r: "16px" });
    let cells = "";
    for (let d = 1; d <= 5; d++) {
      const ws = LC.wordsOf(t.id, d);
      const col = DAY_COLORS[d].bg;
      ws.forEach(w => {
        if (!wordLearnedOnCard(w) && !rec) {
          cells += '<div class="vc-cell empty" style="background:#F3EEE8"><b>' + d + "</b></div>";
        } else {
          cells += '<button class="vc-cell speakable" data-speak="' + esc(w.word) + '" style="background:' + col + '">' + renderIcon(w, 46) +
            '<b class="fit">' + esc(w.word) + "</b>" + (S.settings.showIPA ? "<small>" + esc(w.ipa) + "</small>" : "") + "<span>" + esc(w.meaning_zh) + "</span></button>";
        }
      });
    }
    const learned = themeWordsLearned(t);
    const foot = rec ? esc(cardSigner()) + " ・ " + zhDate(rec.date) : "學緊 ・ 已學 " + learned + " / 25";
    return '<div class="vc" id="vcard" data-theme="' + t.id + '"><div class="vc-head">' + photo +
      '<div class="vc-title"><div class="vc-kicker">第 ' + (t.season || 1) + ' 季 ・ 第 ' + t.week + ' 週 ・ 主題生字卡</div><div class="vc-name">' + (t.emoji || "") + " " + esc(t.zh) + ' <span>' + esc(t.en) + '</span></div></div>' +
      '<div class="vc-count"><b>25</b>個字</div></div><div class="vc-grid">' + cells + '</div><div class="vc-foot"><span>' + foot + '</span><span class="vc-logo">懶貓英文</span></div></div>';
  }
  function renderBank() {
    const due = dueWords();
    const learned = learnedWords();
    let head;
    if (due.length) head = '<div class="hero2">' + faceHTML(S.companion, 64) + '<div><div class="ht">今日有 ' + due.length + ' 個字要複習</div><button class="btn" data-act="review">開始複習 (' + due.length + ")</button></div></div>";
    else if (learned.length) head = '<div class="hero2">' + faceHTML(S.companion, 64) + '<div><div class="ht">今日冇字要複習 🎉</div><button class="btn ghost" data-act="review">自由練習</button></div></div>';
    else head = '<div class="hero2">' + faceHTML(S.companion, 64) + '<div><div class="ht">仲未學字喎</div><p class="muted">去首頁完成第一課，就會有字複習。</p></div></div>';
    const hearts = (!S.unlimited && S.hearts < MAX_HEARTS) ? '<button class="btn ghost" data-act="practice">❤️ 練習補心（而家 ' + S.hearts + " / " + MAX_HEARTS + "）</button>" : "";
    const F = [["all", "全部"], ["due", "今日到期"], ["weak", "未熟"], ["master", "已掌握"]];
    const chips = '<div class="chips">' + F.map(([k, l]) => '<button class="chip' + (ui.bankFilter === k ? " on" : "") + '" data-act="bfilter" data-f="' + k + '">' + l + "</button>").join("") + "</div>";
    const th = '<div class="chips scroll"><button class="chip' + (ui.bankTheme === "all" ? " on" : "") + '" data-act="btheme" data-id="all">全部主題</button>' + THEMES.map(t => '<button class="chip' + (ui.bankTheme === t.id ? " on" : "") + '" data-act="btheme" data-id="' + t.id + '">' + t.emoji + esc(t.short_zh || t.zh) + "</button>").join("") + "</div>";
    let list = learned;
    if (ui.bankFilter === "due") list = due;
    if (ui.bankFilter === "weak") list = learned.filter(w => S.srs[w.id].box <= 2);
    if (ui.bankFilter === "master") list = learned.filter(w => S.srs[w.id].box >= 4);
    if (ui.bankTheme !== "all") list = list.filter(w => w.theme_id === ui.bankTheme);
    const rows = list.map(w => {
      const r = S.srs[w.id];
      const dueNow = r.due <= today();
      return '<div class="wrow speakable" data-speak="' + esc(w.word) + '">' + renderIcon(w, 56) + '<div class="wmeta"><div class="ww">' + esc(w.word) + ' <small>' + esc(w.ipa) + '</small></div><div class="wz">' + esc(w.meaning_zh) + '</div></div><span class="lv lv' + r.box + '">' + LEVELS[r.box] + (dueNow ? "・今日" : "") + '</span><button class="info" data-act="info" data-id="' + w.id + '" aria-label="詳情">ⓘ</button></div>';
    }).join("") || '<div class="empty">呢度暫時冇字 🌱</div>';
    const locked = WORDS.length - learned.length;
    return '<div class="page">' + segBar() + head + hearts + '<div class="section-t">📚 生字庫　<span>' + learned.length + " / " + WORDS.length + "</span></div>" + chips + th + rows + (locked && ui.bankFilter === "all" ? '<div class="empty">🔒 仲有 ' + locked + " 個字等緊你去學</div>" : "") + "</div>";
  }
  function renderGrammar() {
    const items = GRAMMAR.map(g => {
      const theme = THEMES.find(t => t.week === g.week);
      const un = S.unlockAll || isDone(g.id) || (theme && isDone(theme.id + "d5"));
      const dn = isDone(g.id);
      return '<button class="gitem' + (un ? "" : " locked") + '" data-act="startnode" data-id="' + g.id + '"><div class="ge">' + g.emoji + '</div><div><div class="gt">' + g.no + ". " + esc(g.title) + '</div><div class="gs">' + esc(g.en) + "</div></div><div class=\"gst\">" + (dn ? "✓ 完成" : un ? "開始 ›" : "🔒 第 " + g.week + " 週") + "</div></button>";
    }).join("");
    return '<div class="page">' + segBar() + '<div class="hero2">' + faceHTML(S.companion, 64) + '<div><div class="ht">每兩個星期一篇文法</div><p class="muted">學完嗰週五日，星期六就可以上堂。</p></div></div>' + items + "</div>";
  }

  function renderCats() {
    const unlocked = CATS.filter(c => S.cats[c.slug]).length;
    const comp = companion();
    const cards = CATS.map(c => {
      const on = !!S.cats[c.slug];
      if (!on) {
        return '<button class="ccard locked" data-act="lockedcat" data-id="' + c.slug + '"><div class="ph">' + faceHTML(c.slug, 74) + '<span class="lk">🔒</span></div><div class="nm">' + esc(c.name_zh) + '</div><div class="cond">' + esc(c.unlock.label_zh) + '</div><div class="prog">' + esc(lockedProgressText(c)) + "</div></button>";
      }
      const seen = S.cats[c.slug].seen;
      const star = c.slug === S.companion ? '<span class="star">⭐</span>' : "";
      const neu = seen ? "" : '<span class="newb">NEW</span>';
      return '<button class="ccard ' + hairTint(c, S.companion) + '" data-act="album" data-id="' + c.slug + '">' + star + neu + '<div class="ph">' + faceHTML(c.slug, 74) + '</div><div class="nm">' + esc(c.name_zh) + '</div><div class="br">' + esc(c.breed_zh) + "・" + esc(c.hair_zh) + "</div></button>";
    }).join("");
    return '<div class="page"><div class="row"><h2>貓貓圖鑑 🐾</h2><div class="count"><b>' + unlocked + "</b> / 15 隻貓貓</div></div><div class=\"bar\"><i style=\"width:" + (unlocked / 15 * 100) + '%"></i></div><button class="compline" data-act="companion">陪讀貓： ' + esc(comp.name_zh) + "（" + esc(comp.breed_zh) + "） ・ 撳一下可以換陪讀貓</button><div class=\"cgrid\">" + cards + "</div></div>";
  }
  function poseCopy(cat, pose) {
    const slot = pose.key === "actA" ? "a" : pose.key === "actB" ? "b" : "";
    const extra = slot && cat.act && cat.act[slot];
    return {
      zh: (extra && extra.zh) || pose.zh,
      title: ((extra && extra.title) || pose.title_tpl || "").replace("{name}", cat.name_zh),
      quote: (extra && extra.quote) || pose.quote || ""
    };
  }
  function nextRegularPose(lessons) {
    return POSES.find(p => !p.bonus && (p.lessons_needed || 0) > (lessons || 0)) || null;
  }
  function renderAlbum(slug) {
    const c = CAT[slug];
    const rec = S.cats[slug];
    if (!rec) { ui.album = null; return renderCats(); }
    if (!rec.seen) { rec.seen = true; save(); }
    const lessons = rec.lessons || 0;
    const math = albumMath(lessons);
    const poses = POSES;
    let grid = "";
    poses.filter(p => !p.bonus).forEach(p => {
      const on = poseUnlocked(slug, p, lessons);
      const src = c.poses[p.key];
      const pos = p.object_position || "50% 40%";
      const label = poseCopy(c, p).zh;
      if (on) {
        grid += '<button class="photo on" data-act="light" data-id="' + slug + '" data-pose="' + p.key + '"><div class="pframe"><img alt="" src="' + esc(src) + '" style="object-position:' + pos + '"></div><span class="tag">' + esc(p.tag_zh) + '</span><div class="cap"><i>' + p.n + "</i>" + p.emoji + " " + esc(label) + ' <span class="ok">已解鎖</span></div></button>';
      } else {
        const left = Math.max(0, (p.lessons_needed || 0) - lessons);
        grid += '<div class="photo off"><div class="pframe locked"><img alt="" src="' + esc(src) + '" style="object-position:' + pos + '"></div><span class="lockc">🔒</span><div class="hint">' + esc(p.locked_hint || "") + '</div><div class="cap"><i>' + p.n + "</i>" + esc(label) + ' <span class="wait">再陪讀 ' + left + " 堂</span></div></div>";
      }
    });
    const yarn = POSES.find(p => p.key === "yarn");
    const bonus = rec.bonus
      ? '<div class="bonus on"><div class="pframe"><img alt="" src="' + esc(c.poses.yarn) + '" style="object-position:50% 50%"></div><div><b>🧶 玩毛線 ・ ' + esc(THEME[rec.bonus.theme].zh) + ' 零錯誤獎勵</b></div></div>'
      : '<div class="bonus"><div class="pframe locked"><img alt="" src="' + esc(c.poses.yarn) + '"></div><div><b>🧶 隱藏相：玩毛線 <span class="bon">BONUS</span></b><p>🔒 任何一個主題全部答啱（零錯誤）</p><p>就會解鎖呢張隱藏相</p></div></div>';
    const nextPose = nextRegularPose(lessons);
    const paws = [0, 1, 2, 3, 4].map(i => '<i class="' + (i < math.paws ? "on" : "") + '">🐾</i>').join("");
    const nextCard = math.done ? '<div class="nextph">🎉 六張相都解鎖咗！</div>' :
      '<div class="nextph"><div class="row"><b>📷 下一張相：' + esc(poseCopy(c, nextPose).zh) + '</b><span>' + math.paws + ' / 5 堂</span></div><div class="paws">' + paws + "</div><p>揀" + esc(c.name_zh) + "做陪讀貓，再陪讀 " + math.nextN + " 堂就解鎖新相！</p></div>";
    const btn = slug === S.companion ? '<button class="btn" disabled>而家陪緊你 ✓</button>' : '<button class="btn" data-act="setcomp" data-id="' + slug + '">揀佢做今日陪讀貓 🐾</button>';
    const cur = companion();
    return '<div class="page album"><div class="chead"><button class="back" data-act="closealbum" aria-label="返回">‹</button><h2>' + esc(c.name_zh) + '嘅畫冊</h2><span class="pill sun">📷 ' + math.regular + " / " + math.total + "</span></div>" +
      '<div class="card profile tint-on"><div class="row">' + faceHTML(slug, 72) + '<div><b class="nm">' + esc(c.name_zh) + '</b> <span class="pill">' + esc(c.breed_zh) + "・" + esc(c.hair_zh) + '</span><p class="quote">「' + esc(c.quote_zh) + '」</p><p>一齊學咗 ' + lessons + " 堂 ・ " + esc(c.unlock.label_zh) + "</p></div></div></div>" +
      '<div class="row section-t"><span>📖 畫冊</span><small>每陪你學 5 堂，就多一張相</small></div><div class="agrid">' + grid + "</div>" + bonus + nextCard + btn +
      '<p class="fine">今日陪讀貓：' + esc(cur.name_zh) + " ・ 換咗都唔會蝕咗進度</p></div>";
  }

  function renderMe() {
    const now = nowDate();
    if (!ui.calMonth) ui.calMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const unlocked = CATS.filter(c => S.cats[c.slug]).length;
    const cardsN = Object.keys(S.themeCards).length;
    const boxes = [
      ["🔥", currentStreak(), "連續 " + currentStreak() + " 日", "最長 " + (S.bestStreak || 0) + " 日"],
      ["⭐", S.xp, "總 XP"],
      ["📚", Object.keys(S.srs).length, "已學字數"],
      ["🏆", masteredCount(), "掌握字數"],
      ["🐱", unlocked + " / 15", "貓貓"],
      ["🃏", cardsN + " / 48", "生字卡"],
      ["📖", grammarDoneCount() + " / 24", "文法"],
      ["✨", S.perfectLessons || 0, "零錯誤課"]
    ];
    const grid = '<div class="sgrid">' + boxes.map(([ic, v, l, sub]) => '<div class="sbox"><span class="si">' + ic + '</span><div><div class="sv">' + v + '</div><div class="sl">' + l + (sub ? '<small>' + sub + "</small>" : "") + "</div></div></div>").join("") + "</div>";
    const tx = LC.todayXP();
    const goal = S.settings.goal || 20;
    const ring = ringSVG(Math.min(1, tx / goal));
    const goals = [10, 20, 30, 50].map(v => '<button class="goalopt' + (goal === v ? " on" : "") + '" data-act="goal" data-v="' + v + '">' + v + "</button>").join("");
    const days = [];
    for (let k = 6; k >= 0; k--) {
      const ds = addDays(today(), -k);
      const [y, mo, d] = ds.split("-").map(Number);
      days.push({ v: S.xpByDate[ds] || 0, l: "日一二三四五六"[new Date(y, mo - 1, d).getDay()] });
    }
    const mx = Math.max(goal, ...days.map(d => d.v), 1);
    const chart = '<div class="week-chart">' + days.map(d => '<div class="col"><span class="colv">' + (d.v || "") + '</span><div class="colb" style="height:' + Math.round(70 * d.v / mx) + "%;" + (d.v >= goal ? "" : "background:#FFE38A") + '"></div><span class="coll">' + d.l + "</span></div>").join("") + "</div>";
    const y = ui.calMonth.getFullYear(), mo = ui.calMonth.getMonth();
    const first = (new Date(y, mo, 1).getDay() + 6) % 7, nd = new Date(y, mo + 1, 0).getDate(), t = today();
    let cells = "一二三四五六日".split("").map(x => '<div class="dw">' + x + "</div>").join("");
    for (let k = 0; k < first; k++) cells += "<div></div>";
    for (let d = 1; d <= nd; d++) {
      const ds = y + "-" + pad(mo + 1) + "-" + pad(d);
      cells += '<div class="dd' + (S.activeDates.includes(ds) ? " act" : "") + (ds === t ? " today" : "") + '">' + d + "</div>";
    }
    const vs = TTS.voices;
    const voice = TTS.ok ? '<select id="voiceSel"><option value="">自動（英式優先）</option>' + vs.map(v => '<option value="' + esc(v.name) + '"' + (S.settings.voice === v.name ? " selected" : "") + ">" + esc(v.name) + "</option>").join("") + "</select>" : "<span>唔支援</span>";
    return '<div class="page me"><div class="mehead">' + faceHTML(S.companion, 96, { r: "28px" }) + "<h2>" + esc(name() || "你") + "</h2><p class=\"muted\">" + (S.startDate ? "由 " + S.startDate + " 開始" : "今日就開始") + "</p></div>" +
      grid +
      '<div class="section-t">🎯 每日目標</div><div class="goalrow">' + ring + '<div><div class="gt">' + Math.min(tx, goal) + " / " + goal + ' XP</div><div class="goals">' + goals + "</div></div></div>" +
      '<div class="section-t">📊 最近 7 日 XP</div>' + chart +
      '<div class="section-t">📅 練習日曆</div><div class="cal"><div class="calh"><button data-act="cal" data-d="-1">‹</button><span>' + y + " 年 " + (mo + 1) + ' 月</span><button data-act="cal" data-d="1">›</button></div><div class="calg">' + cells + "</div></div>" +
      '<div class="section-t">⚙️ 設定</div>' +
      '<div class="setrow"><span>你嘅名</span><input id="nameInp" value="' + esc(name()) + '" maxlength="16" placeholder="你想點稱呼"></div>' +
      '<div class="setrow"><span>🔊 音效</span><button class="switch' + (S.settings.sound ? " on" : "") + '" data-act="sound" aria-label="音效"></button></div>' +
      '<div class="setrow"><span>🗣️ 英文聲線</span>' + voice + "</div>" +
      '<div class="setrow"><span>🔊 試聽</span><button class="btn sm" data-speak="Hello! Nice to meet you.">Hello!</button></div>' +
      '<div class="setrow"><span>每日問我揀陪讀貓</span><button class="switch' + (S.settings.askCompanionDaily ? " on" : "") + '" data-act="askcat"></button></div>' +
      '<div class="setrow"><span>顯示音標</span><button class="switch' + (S.settings.showIPA ? " on" : "") + '" data-act="ipa"></button></div>' +
      '<div class="setrow"><button class="btn ghost sm" data-act="export">匯出進度</button><button class="btn ghost sm" data-act="import">匯入進度</button></div>' +
      '<p class="fine center">懶貓英文・每日五個字　全年四個季節</p><input id="importFile" type="file" accept="application/json" hidden></div>';
  }
  function ringSVG(p) {
    const r = 28, c = 2 * Math.PI * r, dash = Math.max(0.01, p) * c;
    return '<svg class="ring" viewBox="0 0 72 72" width="72" height="72"><circle cx="36" cy="36" r="' + r + '" fill="none" stroke="#F4EADF" stroke-width="8"/><circle cx="36" cy="36" r="' + r + '" fill="none" stroke="#F59A3E" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + dash.toFixed(1) + " " + c.toFixed(1) + '" transform="rotate(-90 36 36)"/></svg>';
  }

  function shouldAskCompanion() {
    if (!S.settings.askCompanionDaily) return false;
    const n = CATS.filter(c => S.cats[c.slug]).length;
    if (n < 2) return false;
    return S.companionAskedDate !== today();
  }
  function openCompanion(opt) {
    opt = opt || {};
    ui.afterCompanion = opt.then || null;
    const unlocked = CATS.filter(c => S.cats[c.slug]).sort((a, b) => (a.slug === S.companion ? -1 : b.slug === S.companion ? 1 : a.no - b.no));
    ui.pick = S.companion;
    const rows = unlocked.map(c => companionRow(c)).join("");
    const lockedN = 15 - unlocked.length;
    const cur = CAT[ui.pick];
    modal('<div class="handle"></div><button class="xbtn abs" data-act="compclose" aria-label="關閉">✕</button><h3>🐾 揀今日陪讀貓</h3><p class="mp">陪你學完 5 堂，佢嘅畫冊就會多一張新相 📷</p><div class="clist" id="clist">' + rows + '</div><button class="morecats" data-act="tab" data-t="cats">仲有 ' + lockedN + ' 隻貓貓未解鎖，去圖鑑睇吓</button><button class="btn" id="compok" data-act="comppick">就揀' + esc(cur.name_zh) + '喇 🐾</button><p class="fine center">隨時可以換 ・ 每堂計落當時嘅陪讀貓度</p>', { sheet: true, lock: true });
  }
  function companionRow(c) {
    const rec = S.cats[c.slug];
    const lessons = rec.lessons || 0;
    const math = albumMath(lessons);
    const slots = POSES.map(p => {
      const on = poseUnlocked(c.slug, p, lessons);
      const cls = p.bonus ? "slot yarn" : "slot";
      return '<i class="' + cls + (on ? " on" : "") + '">' + (on ? p.emoji : "🔒") + "</i>";
    }).join("");
    const sel = c.slug === (ui.pick || S.companion);
    const pills = (c.slug === S.companion ? '<span class="pill mint">而家陪緊你</span>' : "") + (!rec.seen ? '<span class="pill coral">NEW</span>' : "");
    const next = math.done ? "相已集齊" : "下一張：再陪讀 " + math.nextN + " 堂";
    return '<button class="crow' + (sel ? " sel" : "") + '" data-act="compradio" data-id="' + c.slug + '">' + faceHTML(c.slug, 52) + '<div class="cbody"><div class="row"><b>' + esc(c.name_zh) + "</b> " + pills + '</div><div class="fine">' + esc(c.breed_zh) + '</div><div class="slots">' + slots + '</div><div class="fine">📷 ' + math.regular + " / " + math.total + " 張相 ・ " + next + '</div><div class="bar thin"><i style="width:' + (math.paws / 5 * 100) + '%"></i></div></div><span class="radio">' + (sel ? "✓" : "") + "</span></button>";
  }

  function showCelebration() {
    const q = S.celebrationQueue || [];
    const old = $("#celebrate"); if (old) old.remove();
    if (!q.length || $("#lesson")) return;
    const item = q[0];
    if (item.type === "toast") { toast(item.msg); S.celebrationQueue.shift(); save(); return showCelebration(); }
    if (item.type === "photo" || item.type === "yarn") LC.meow(item.cat, "song");
    const el = document.createElement("div"); el.id = "celebrate"; el.className = "celebrate-bg";
    el.innerHTML = '<div class="cel">' + celebrationHTML(item) + "</div>";
    $("#app").appendChild(el);
  }
  function celebrationHTML(item) {
    const xp = item.xp ? '<span class="pill sun">⭐ +' + item.xp + " XP</span>" : "";
    if (item.type === "themeCard") {
      const t = THEME[item.theme];
      return '<div class="ribbon">🎉 解鎖主題生字卡！</div>' + vocabCardHTML(t) + '<div class="btncol"><button class="btn" data-act="see-card" data-id="' + t.id + '">睇生字卡</button><button class="btn ghost" data-act="cel-next">繼續</button></div>';
    }
    if (item.type === "cat") {
      const c = CAT[item.cat];
      const n = CATS.filter(x => S.cats[x.slug]).length;
      return '<div class="ribbon">🎉 解鎖新貓貓！</div><div class="sunburst"></div><div class="celphoto">' + faceHTML(c.slug, 150, { r: "50%", eager: true }) + '</div><h2>' + esc(c.name_zh) + '</h2><span class="pill">' + esc(c.breed_zh) + " ・ " + esc(c.breed_en) + " ・ " + esc(c.hair_zh) + '</span><div class="bubble quote">「' + esc(c.quote_zh) + '」</div><div class="pills"><span class="pill lav">🏆 ' + esc(UNLOCK_REASON[c.slug] || c.unlock.label_zh) + "</span>" + xp + '<span class="pill mint">🐾 圖鑑 ' + n + ' / 15</span></div><button class="btn" data-act="cel-comp" data-id="' + c.slug + '">設為陪讀貓 🐾</button><button class="btn ghost" data-act="cel-next">收埋入圖鑑先</button>';
    }
    const c = CAT[item.cat];
    const yarn = item.type === "yarn";
    const pose = yarn ? POSES.find(p => p.key === "yarn") : POSES.find(p => p.key === item.pose);
    const src = c.poses[yarn ? "yarn" : item.pose];
    const lessons = (S.cats[c.slug] && S.cats[c.slug].lessons) || item.lessons || 0;
    const math = albumMath(lessons);
    const copy = poseCopy(c, pose);
    const title = copy.title;
    const sub = yarn ? esc(THEME[item.theme].zh) + " 全部答啱，零錯誤！" : "多謝你陪" + esc(c.name_zh) + "學咗 " + lessons + " 堂";
    const circ = ["", "①", "②", "③", "④", "⑤", "⑥"];
    const cap = yarn ? "🧶 玩毛線" : (circ[pose.n] || "") + " " + copy.zh;
    const pill = yarn ? "BONUS" : math.regular + " / " + math.total;
    const thumbs = POSES.map(p => {
      const on = poseUnlocked(c.slug, p, lessons) || (yarn && p.key === "yarn");
      const isNew = (yarn && p.key === "yarn") || (!yarn && p.key === item.pose);
      return '<div class="th' + (isNew ? " new" : "") + (p.bonus ? " yarn" : "") + '">' + (on ? '<img alt="" src="' + esc(c.poses[p.key]) + '">' : '<span>🔒</span>') + (isNew ? '<em>NEW</em>' : "") + "</div>";
    }).join("");
    return '<div class="ribbon">' + (yarn ? "🧶 隱藏相！" : "📷 畫冊新相！") + '</div><div class="polaroid"><div class="tape"></div><img alt="" src="' + esc(src) + '"><div class="pcap">' + cap + ' <span class="pill">' + pill + "</span></div></div><h2>" + esc(title) + "</h2><p>" + sub + '</p><div class="bubble">' + esc(copy.quote) + '</div><div class="thumbs">' + thumbs + '</div><div class="pills"><span class="pill mint">🐾 陪讀 ' + lessons + " 堂</span>" + xp + '<span class="pill">📷 畫冊 ' + math.regular + " / " + math.total + '</span></div><button class="btn" data-act="cel-album" data-id="' + c.slug + '">睇' + esc(c.name_zh) + '嘅畫冊 🐾</button><button class="btn ghost" data-act="cel-next">繼續</button>';
  }
  function nextCelebration() {
    const el = $("#celebrate"); if (el) el.remove();
    if (S.celebrationQueue && S.celebrationQueue.length) S.celebrationQueue.shift();
    save();
    if (S.celebrationQueue && S.celebrationQueue.length) showCelebration();
    else render();
  }

  function heartsModal(fromLesson) {
    refillHearts();
    const full = S.hearts >= MAX_HEARTS;
    modal('<div class="celphoto">' + faceHTML(S.companion, 110, { mode: "bust", r: "28px" }) + "</div><h3>" + (S.hearts ? "你嘅心心" : "冇心喇 💔") + '</h3><div class="mhearts">' + "❤️".repeat(S.hearts) + "🤍".repeat(MAX_HEARTS - S.hearts) + "</div><p class=\"mp\">" +
      (full ? "心心全滿，去學嘢啦！" : '每 30 分鐘補返 1 粒心<br>下一粒：<b id="hcd">' + heartCountdown() + "</b>") + "<br>答錯會扣 1 粒心；做一次「練習」可以即刻補滿。</p>" +
      (full ? "" : '<button class="btn" data-act="practice">💪 練習補心（唔會扣心）</button>') +
      '<button class="btn ghost" data-act="' + (fromLesson ? "quitnow" : "close") + '">' + (fromLesson ? "結束課程" : "關閉") + "</button>");
    if (!full) LC.heartTimer = setInterval(() => { refillHearts(); const el = $("#hcd"); if (el) el.textContent = heartCountdown(); renderTop(); }, 1000);
  }

  function openDev() {
    const nxt = nextNewNode();
    modal('<h3>🛠 開發者面板</h3><div class="devinfo">日期 ' + today() + "（偏移 " + (S.dayOffset || 0) + " 日）<br>下一課：" + (nxt ? nxt.id : "—") + "<br>已學 " + newLessonsDoneSafe() + " ・ 預期 " + LC.expectedCount() + " ・ 落後 " + behindBy() + "<br>今日新課 " + newCountToday() + " ・ 心 " + S.hearts + " ・ 圖示 " + placeholderMode() + "</div>" +
      '<div class="devbtns">' +
      '<button class="btn sm" data-act="dev" data-d="prevday">⏮️ 前一日</button>' +
      '<button class="btn sm" data-act="dev" data-d="nextday">⏭️ 跳去聽日</button>' +
      '<button class="btn sm" data-act="dev" data-d="xp">⭐ +50 XP</button>' +
      '<button class="btn sm" data-act="dev" data-d="xp500">⭐ +500 XP</button>' +
      '<button class="btn sm" data-act="dev" data-d="streak">🔥 設連續日數</button>' +
      '<button class="btn sm" data-act="dev" data-d="hearts">❤️ 補滿心</button>' +
      '<button class="btn sm" data-act="dev" data-d="empty">💔 清空心</button>' +
      '<button class="btn sm" data-act="dev" data-d="unlimited">♾️ 無限心：' + (S.unlimited ? "開" : "關") + "</button>" +
      '<button class="btn sm" data-act="dev" data-d="unlock">🔓 全部節點：' + (S.unlockAll ? "開" : "關") + "</button>" +
      '<label class="btn sm ghost">跳去第 <input id="weekN" type="number" min="1" max="52" value="5" style="width:52px"> 週</label>' +
      '<button class="btn sm" data-act="dev" data-d="jump">跳去呢週</button>' +
      '<button class="btn sm" data-act="dev" data-d="allcats">🐱 解鎖所有貓</button>' +
      '<button class="btn sm" data-act="dev" data-d="plus5">陪讀貓 +5 堂</button>' +
      '<button class="btn sm" data-act="dev" data-d="set4">設 4 堂</button>' +
      '<button class="btn sm" data-act="dev" data-d="set9">設 9 堂</button>' +
      '<button class="btn sm" data-act="dev" data-d="set14">設 14 堂</button>' +
      '<button class="btn sm" data-act="dev" data-d="perfect">模擬零錯誤主題</button>' +
      '<button class="btn sm" data-act="dev" data-d="icon-tile">圖示 tile</button>' +
      '<button class="btn sm" data-act="dev" data-d="icon-emoji">圖示 emoji</button>' +
      '<button class="btn sm" data-act="dev" data-d="prev-card">預覽生字卡</button>' +
      '<button class="btn sm" data-act="dev" data-d="prev-photo">預覽新相</button>' +
      '<button class="btn sm" data-act="dev" data-d="prev-yarn">預覽毛線</button>' +
      '<button class="btn sm" data-act="dev" data-d="prev-cat">預覽解鎖貓</button>' +
      '<button class="btn sm" data-act="dev" data-d="due">已學字今日到期</button>' +
      "</div>" +
      '<pre class="raw">' + esc(JSON.stringify(S, null, 1).slice(0, 4000)) + "</pre>" +
      '<button class="btn ghost" data-act="dev" data-d="reset">🗑️ 重設所有進度</button><button class="btn plain" data-act="close">關閉</button>', { wide: true });
  }
  function newLessonsDoneSafe() { return LC.newLessonsDone(); }
  function devAction(d) {
    if (d === "prevday") S.dayOffset = (S.dayOffset || 0) - 1;
    if (d === "nextday") { S.dayOffset = (S.dayOffset || 0) + 1; S.hearts = MAX_HEARTS; S.heartsAt = Date.now(); toast("而家係 " + today()); }
    if (d === "xp") LC.addXP(50);
    if (d === "xp500") LC.addXP(500);
    if (d === "streak") {
      const n = parseInt(prompt("連續日數", String(S.bestStreak || 7)) || "", 10);
      if (!isNaN(n)) { S.streak = n; S.bestStreak = Math.max(S.bestStreak || 0, n); S.lastActive = today(); if (!S.activeDates.includes(today())) S.activeDates.push(today()); }
    }
    if (d === "hearts") { S.hearts = MAX_HEARTS; S.heartsAt = Date.now(); }
    if (d === "empty") { S.hearts = 0; S.heartsAt = Date.now(); }
    if (d === "unlimited") S.unlimited = !S.unlimited;
    if (d === "unlock") S.unlockAll = !S.unlockAll;
    if (d === "jump") jumpWeek(parseInt(($("#weekN") || {}).value || "1", 10));
    if (d === "allcats") CATS.forEach(c => { if (!S.cats[c.slug]) S.cats[c.slug] = { unlocked: today(), lessons: 0, bonus: null, seen: false }; });
    if (d === "plus5") { ensureComp(); S.cats[S.companion].lessons += 5; toast(companion().name_zh + " 而家 " + S.cats[S.companion].lessons + " 堂"); }
    if (d === "set4" || d === "set9" || d === "set14") { ensureComp(); S.cats[S.companion].lessons = d === "set4" ? 4 : d === "set9" ? 9 : 14; toast("設為 " + S.cats[S.companion].lessons + " 堂"); }
    if (d === "perfect") simPerfect();
    if (d === "icon-tile") S.devIconMode = "tile";
    if (d === "icon-emoji") S.devIconMode = "emoji";
    if (d === "due") Object.values(S.srs).forEach(r => r.due = today());
    if (d === "prev-card") { closeModal(); preview({ type: "themeCard", theme: "t01", xp: 15 }); return; }
    if (d === "prev-photo") { closeModal(); preview({ type: "photo", cat: S.companion, pose: "stretch", xp: 20, lessons: 10 }); return; }
    if (d === "prev-yarn") { closeModal(); preview({ type: "yarn", cat: S.companion, theme: "t01", xp: 20 }); return; }
    if (d === "prev-cat") { closeModal(); preview({ type: "cat", cat: "huihui", xp: 15 }); return; }
    if (d === "reset") {
      if (!confirm("確定要重設所有進度？")) return;
      try { localStorage.removeItem(LC.KEY); } catch (e) {}
      LC.S = LC.defaultState();
      toast("已重設");
    }
    checkUnlocks();
    save(); render(); if (d !== "reset") openDev();
  }
  function ensureComp() { if (!S.cats[S.companion]) S.cats[S.companion] = { unlocked: today(), lessons: 0, bonus: null, seen: false }; }
  function jumpWeek(week) {
    week = Math.max(1, Math.min(52, week || 1));
    PATH.forEach(n => {
      if (n.week >= week) return;
      if (!isDone(n.id)) S.done[n.id] = { date: today(), n: 1, mistakes: 1, perfect: false };
      if (n.type === "day") {
        LC.wordsOf(n.theme, n.day).forEach(w => {
          if (!S.srs[w.id]) S.srs[w.id] = { box: 2, due: addDays(today(), 3), seen: 1, right: 1, wrong: 0, learned: today() };
        });
        if (n.day === 5 && !S.themeCards[n.theme]) S.themeCards[n.theme] = { date: today(), cat: S.companion };
      }
    });
    if (!S.startDate) S.startDate = addDays(today(), -((week - 1) * 7));
    S.inProgress = null;
    checkUnlocks();
    toast("已跳到第 " + week + " 週");
  }
  function simPerfect() {
    const t = THEMES.find(t => !S.perfectThemes.includes(t.id)) || THEMES[0];
    [1, 2, 3, 4, 5].forEach(d => {
      const id = t.id + "d" + d;
      S.done[id] = { date: today(), n: 1, mistakes: 0, perfect: true };
      LC.wordsOf(t.id, d).forEach(w => { if (!S.srs[w.id]) S.srs[w.id] = { box: 2, due: addDays(today(), 3), seen: 1, right: 1, wrong: 0, learned: today() }; });
    });
    S.done[t.id + "w"] = { date: today(), n: 1, mistakes: 0, perfect: true };
    if (!S.themeCards[t.id]) S.themeCards[t.id] = { date: today(), cat: S.companion };
    const y = LC.maybeAwardYarn(t.id);
    if (y && y.type === "yarn") S.celebrationQueue.push({ type: "yarn", cat: y.cat, theme: t.id, xp: 20 });
    else if (y && y.type === "yarn-xp") toast("零錯誤主題！全部貓貓都有毛線相喇 🧶");
    checkUnlocks();
    toast(t.zh + " 模擬零錯誤");
  }
  let previewing = null;
  function preview(item) {
    previewing = item;
    const el = document.createElement("div"); el.id = "celebrate"; el.className = "celebrate-bg";
    el.innerHTML = '<div class="cel">' + celebrationHTML(item).replace('data-act="cel-next"', 'data-act="prev-close"').replace('data-act="see-card"', 'data-act="prev-close"').replace('data-act="cel-comp"', 'data-act="prev-close"').replace('data-act="cel-album"', 'data-act="prev-close"') + "</div>";
    $("#app").appendChild(el);
  }
  function renderCompare() {
    const themes = THEMES.filter(t => t.days.some(d => d.words.some(id => LC.SVG_SET.has(id))));
    const theme = themes.find(t => t.id === ui.compareTheme) || themes[0] || THEMES[0];
    const tabs = themes.map(t => '<button class="' + (t.id === theme.id ? "on" : "") + '" data-act="cmp" data-id="' + t.id + '">' + t.emoji + "</button>").join("");
    const ids = theme.days.flatMap(d => d.words);
    const cells = ids.map(id => {
      const w = WORD[id];
      const svg = LC.SVG_SET.has(id)
        ? '<span class="itile svg" style="width:56px;height:56px;border-radius:16px;background:' + DAY_COLORS[w.day].tile + '"><img alt="" src="assets/icons-svg/' + id + '.svg" width="48" height="48"></span>'
        : tileHTML(w, 56, "tile");
      return '<div class="cmp"><div class="cmprow"><div>' + tileHTML(w, 56, "tile") + '<small>字母</small></div><div>' + svg + '<small>向量</small></div><div>' + tileHTML(w, 56, "emoji") + '<small>表情</small></div></div><b>' + esc(w.word) + "</b></div>";
    }).join("");
    return '<div class="page"><div class="chead"><button class="back" data-act="closecompare" aria-label="返回">‹</button><h2>生字圖樣</h2></div><div class="segs tiny">' + tabs + '</div><p class="fine">' + esc(theme.zh) + " ・ 字母 │ 向量 │ 表情。懶洋洋小貓畫風。手繪 PNG 永遠優先。</p><div class=\"cmpgrid\">" + cells + "</div></div>";
  }

  async function exportCard(themeId, share) {
    const t = THEME[themeId];
    if (!S.themeCards[t.id]) { toast("學完呢個主題先可以存"); return; }
    await document.fonts.ready;
    const canvas = document.createElement("canvas");
    canvas.width = 1080; canvas.height = 1620;
    const ctx = canvas.getContext("2d");
    await drawExport(ctx, t);
    const filename = cardFileName(t);
    const blob = await new Promise(res => canvas.toBlob(res, "image/png"));
    const file = new File([blob], filename, { type: "image/png" });
    const text = "我喺懶貓英文學完「" + t.zh + " " + t.en + "」25 個字 🐾";
    if (share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: "懶貓英文", text }); return; } catch (e) { if (e && e.name === "AbortError") return; }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast("已儲存圖片");
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function loadImage(src) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; }); }
  async function drawExport(ctx, t) {
    const W = 1080, H = 1620;
    ctx.fillStyle = "#FFF8EE"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#F7E6D2";
    for (let y = 24; y < H; y += 36) for (let x = 24; x < W; x += 36) { ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); }
    roundRect(ctx, 36, 36, W - 72, H - 72, 48); ctx.fillStyle = "#FFF8EE"; ctx.fill();
    ctx.strokeStyle = "#F3D7B4"; ctx.lineWidth = 8; ctx.stroke();
    const rec = S.themeCards[t.id];
    const cat = CAT[rec.cat] || CAT.fanshu;
    const src = cat.slug === "fanshu" ? HERO.file : cat.photo;
    try {
      const im = await loadImage(src);
      ctx.save(); roundRect(ctx, 70, 70, 200, 200, 36); ctx.clip();
      const crop = cat.slug === "fanshu" ? { fx: 0.29, top: 0.32, chin: 0.72 } : cat.crop;
      const mode = cat.slug === "fanshu" ? "hero" : "face";
      const head = crop.chin - crop.top;
      let cx = mode === "hero" ? 0.29 * im.width : crop.fx * im.width;
      let cy = mode === "hero" ? 0.5 * im.height : ((crop.top + crop.chin) / 2 + head * 0.04) * im.height;
      let hh = (mode === "hero" ? 0.62 : head * 1.28) * im.height;
      let ww = hh;
      const x0 = Math.min(Math.max(cx - ww / 2, 0), im.width - ww);
      const y0 = Math.min(Math.max(cy - hh / 2, 0), im.height - hh);
      ctx.drawImage(im, x0, y0, ww, hh, 70, 70, 200, 200); ctx.restore();
    } catch (e) {}
    ctx.fillStyle = "#B89F8A"; ctx.font = "32px LazyCatRound, sans-serif"; ctx.textAlign = "left";
    ctx.fillText("第 " + (t.season || 1) + " 季 ・ 第 " + t.week + " 週 ・ 主題生字卡", 290, 120);
    ctx.fillStyle = "#5B4636"; ctx.font = "64px LazyCatRound, sans-serif";
    ctx.fillText(t.emoji + " " + t.zh, 290, 190);
    ctx.fillStyle = "#E0822F"; ctx.font = "700 48px Baloo 2, Nunito, sans-serif";
    ctx.fillText(t.en, 290, 250);
    ctx.textAlign = "right"; ctx.fillStyle = "#F59A3E"; ctx.font = "800 72px Baloo 2, sans-serif";
    ctx.fillText("25", 1000, 180); ctx.fillStyle = "#B89F8A"; ctx.font = "28px LazyCatRound"; ctx.fillText("個字", 1000, 220);
    const words = [];
    for (let d = 1; d <= 5; d++) LC.wordsOf(t.id, d).forEach(w => words.push(w));
    const gx = 70, gy = 300, gw = 940, gh = 1120, gap = 12;
    const cw = (gw - gap * 4) / 5, ch = (gh - gap * 4) / 5;
    for (let i = 0; i < 25; i++) {
      const w = words[i];
      const col = i % 5, row = Math.floor(i / 5);
      const x = gx + col * (cw + gap), y = gy + row * (ch + gap);
      ctx.fillStyle = DAY_COLORS[w.day].bg;
      roundRect(ctx, x, y, cw, ch, 22); ctx.fill();
      await drawIconCanvas(ctx, w, x + cw / 2 - 42, y + 8, 84);
      ctx.fillStyle = "#4A3A30"; ctx.textAlign = "center";
      let fs = 32;
      ctx.font = "800 " + fs + "px Nunito, Baloo 2, sans-serif";
      while (ctx.measureText(w.word).width > cw - 12 && fs > 16) { fs -= 1; ctx.font = "800 " + fs + "px Nunito, Baloo 2, sans-serif"; }
      ctx.fillText(w.word, x + cw / 2, y + 116);
      if (S.settings.showIPA) { ctx.fillStyle = "#9C8676"; ctx.font = "22px Noto Sans, Nunito, sans-serif"; ctx.fillText(w.ipa, x + cw / 2, y + 142); }
      ctx.fillStyle = "#6B5444"; ctx.font = "28px LazyCatRound, sans-serif";
      const my = S.settings.showIPA ? y + 176 : y + 156;
      ctx.fillText(w.meaning_zh, x + cw / 2, my);
    }
    ctx.textAlign = "left"; ctx.fillStyle = "#B89F8A"; ctx.font = "32px LazyCatRound";
    ctx.fillText(cardSigner() + " ・ " + zhDate(rec.date), 70, 1540);
    ctx.textAlign = "right"; ctx.fillStyle = "#E0822F"; ctx.fillText("懶貓英文", 1010, 1540);
  }
  async function drawIconCanvas(ctx, word, x, y, size) {
    const kind = LC.iconKind(word);
    const c = DAY_COLORS[word.day];
    const r = size * 0.28;
    if (kind === "png" || kind === "svg") {
      try {
        const src = kind === "png" ? word.icon : "assets/icons-svg/" + word.id + ".svg";
        const im = await loadImage(src);
        if (kind === "svg") {
          ctx.fillStyle = c.tile; roundRect(ctx, x, y, size, size, r); ctx.fill();
          const p = size * 0.08; ctx.drawImage(im, x + p, y + p, size - p * 2, size - p * 2);
        } else ctx.drawImage(im, x, y, size, size);
        return;
      } catch (e) {}
    }
    ctx.fillStyle = c.tile; roundRect(ctx, x, y, size, size, r); ctx.fill();
    if (placeholderMode() === "emoji" && kind !== "png") {
      ctx.font = Math.round(size * 0.58) + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(word.emoji, x + size / 2, y + size / 2 + 2);
    } else {
      ctx.fillStyle = c.ink; ctx.font = "800 " + Math.round(size * 0.52) + "px Baloo 2, Nunito, sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(word.word.charAt(0).toLowerCase(), x + size / 2, y + size / 2 + 2);
    }
    ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = c.ink;
    const px = x + size * 0.72, py = y + size * 0.7, s = size * 0.22;
    ctx.beginPath(); ctx.ellipse(px, py + s * 0.4, s * 0.45, s * 0.35, 0, 0, 7); ctx.fill();
    ctx.restore();
    ctx.textBaseline = "alphabetic";
  }

  function fitWords() {
    $$(".fit").forEach(el => {
      const parent = el.parentElement; if (!parent) return;
      el.style.fontSize = "";
      let s = parseFloat(getComputedStyle(el).fontSize) || 12;
      el.style.whiteSpace = "nowrap";
      let guard = 0;
      while (el.scrollWidth > parent.clientWidth - 2 && s > 7 && guard++ < 16) {
        s -= 0.5; el.style.fontSize = s + "px";
      }
    });
  }
  function render() {
    const lesson = $("#lesson");
    if (lesson) return;
    renderTop(); renderTabs();
    const main = $("#main");
    if (ui.tab === "icons") main.innerHTML = renderCompare();
    else if (ui.tab === "home") main.innerHTML = renderHome();
    else if (ui.tab === "map") { main.innerHTML = renderMap(); paintMap(); }
    else if (ui.tab === "cards") main.innerHTML = renderCards();
    else if (ui.tab === "cats") main.innerHTML = ui.album ? renderAlbum(ui.album) : renderCats();
    else main.innerHTML = renderMe();
    main.scrollTop = 0;
    fitWords();
    if (!$("#lesson") && !$("#celebrate") && S.celebrationQueue && S.celebrationQueue.length) showCelebration();
  }
  function openLightbox(slug, pose) {
    const c = CAT[slug];
    const rec = S.cats[slug];
    const lessons = rec.lessons || 0;
    const keys = POSES.filter(p => poseUnlocked(slug, p, lessons)).map(p => p.key);
    let i = Math.max(0, keys.indexOf(pose));
    const show = () => {
      const p = POSES.find(x => x.key === keys[i]);
      modal('<button class="xbtn" data-act="close" aria-label="關閉">✕</button><div class="pframe big"><img alt="" src="' + esc(c.poses[keys[i]]) + '" style="object-position:' + (p.object_position || "50% 40%") + '"></div><p class="mp">' + p.emoji + " " + esc(poseCopy(c, p).zh) + "</p>" + (keys.length > 1 ? '<div class="row"><button class="btn ghost" data-act="lightprev">‹</button><button class="btn ghost" data-act="lightnext">›</button></div>' : ""), { lock: false });
    };
    ui.light = { keys, i, show, slug };
    ui.light.show = show;
    show();
    ui.lightNav = dir => { i = (i + dir + keys.length) % keys.length; ui.light.i = i; show(); };
  }

  function exportProgress() {
    const blob = new Blob([JSON.stringify(S, null, 1)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "lazycat-english-v1.json"; a.click();
  }
  function importProgress(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || data.v !== 1) { toast("呢個檔唔係懶貓進度"); return; }
        const d = LC.defaultState();
        const out = Object.assign(d, data);
        out.settings = Object.assign(d.settings, data.settings || {});
        out.profile = Object.assign(d.profile, data.profile || {});
        LC.S = out; save(); render(); toast("已匯入進度");
      } catch (e) { toast("讀唔到呢個檔"); }
    };
    reader.readAsText(file);
  }

  function heroFrame() {
    const cat = companion();
    const lessons = (S.cats[cat.slug] && S.cats[cat.slug].lessons) || 0;
    const opened = key => {
      const meta = POSES.find(p => p.key === key);
      return !!(meta && cat.poses && cat.poses[key] && poseUnlocked(cat.slug, meta, lessons));
    };
    if (cat.slug === "fanshu") {
      return { src: HERO.file, pos: "40% 62%", alt: "番薯瞓緊", nap: true, label: cat.name_zh };
    }
    if (opened("sleep")) {
      return { src: cat.poses.sleep, pos: "50% 55%", alt: cat.name_zh + "瞓緊", nap: true, label: cat.name_zh };
    }
    const pos = Math.round((cat.crop.fx || 0.5) * 100) + "% " + Math.round((cat.crop.ey || 0.4) * 100) + "%";
    return { src: cat.photo, pos, alt: cat.name_zh, nap: false, label: cat.name_zh };
  }

  Object.assign(LC, {
    render, renderTop, showCelebration, nextCelebration, heartsModal, openCompanion, shouldAskCompanion,
    openDev, devAction, exportCard, openMapSheet, openLightbox, fitWords, preview, exportProgress, importProgress,
    homeToday, MAP_SLOTS, mapNodeState
  });
})(window.LC);
