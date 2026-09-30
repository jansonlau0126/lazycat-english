/* Lesson engine and the 7 quiz types. */
(function (LC) {
  "use strict";
  const { $, $$, esc, shuffle, sample, rand, shuffleNE, WORD, WORDS, THEME, GBY, S, save, today, isDone,
    srsUpdate, dueWords, weakest, weightedSample, wordsOf, themeWords, beep, TTS, PRAISE, highlight, tipHTML,
    faceHTML, companion, renderIcon, POS_ZH, toast, modal, loseHeart, MAX_HEARTS, markActive, addXP, todayXP,
    checkUnlocks, maybeAwardYarn, albumMath, PATH, NODE } = LC;

  const TYPE_LABEL = {
    listen: "🎧 聽音揀字", meaning: "💬 揀中文意思", reverse: "🔤 揀英文生字", fill: "✏️ 句子填充",
    spell: "🧩 串字", arrange: "🧱 砌句子", match: "🔗 配對",
    gmc: "🧠 文法選擇", gfill: "✏️ 文法填充", gtiles: "🧱 砌句子"
  };
  const tokenize = s => String(s).replace(/[.,!?]/g, "").split(/\s+/).filter(Boolean);
  const norm = s => String(s).toLowerCase().replace(/[’‘]/g, "'").replace(/[.,!?]/g, "").replace(/\s+/g, " ").trim();

  function distract(w, n) {
    const bad = x => x.id === w.id || x.meaning_zh === w.meaning_zh;
    const same = x => (x.season || 1) === (w.season || 1);
    let pool = WORDS.filter(x => !bad(x) && x.theme_id === w.theme_id);
    if (pool.length < n) pool = pool.concat(WORDS.filter(x => !bad(x) && same(x) && S.srs[x.id] && x.theme_id !== w.theme_id));
    if (pool.length < n) pool = WORDS.filter(x => !bad(x) && same(x));
    const seen = new Set();
    const uniq = [];
    shuffle(pool).forEach(x => { if (!seen.has(x.id)) { seen.add(x.id); uniq.push(x); } });
    return uniq.slice(0, n);
  }
  function makeEx(t, w, group) {
    if (t === "listen") return { t, w, opts: shuffle([w, ...distract(w, 3)]).map(x => x.word), ans: w.word };
    if (t === "meaning") return { t, w, opts: shuffle([w, ...distract(w, 3)]).map(x => x.meaning_zh), ans: w.meaning_zh };
    if (t === "reverse") return { t, w, opts: shuffle([w, ...distract(w, 3)]).map(x => x.word), ans: w.word };
    if (t === "fill") {
      const re = new RegExp("\\b" + w.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i");
      const m = w.example_en.match(re);
      const parts = m ? [w.example_en.slice(0, m.index), w.example_en.slice(m.index + m[0].length)] : [w.example_en, ""];
      const shown = m ? m[0] : w.word;
      return { t, w, parts, opts: shuffle([w, ...distract(w, 3)]).map(x => x.word), ans: w.word, shown };
    }
    if (t === "spell") {
      const letters = w.word.toLowerCase().split("").filter(c => c !== " " && c !== "-");
      const tiles = letters.slice();
      if (tiles.length <= 7) {
        const al = "abcdefghiklmnoprstuvwy".split("").filter(c => !tiles.includes(c));
        tiles.push(...sample(al, Math.min(2, al.length)));
      }
      return { t, w, tiles: shuffleNE(tiles), ans: w.word };
    }
    if (t === "arrange") {
      const toks = tokenize(w.example_en);
      let extra = [];
      if (toks.length <= 7) {
        const low = toks.map(x => x.toLowerCase());
        const pool = [...new Set(WORDS.filter(x => x.id !== w.id && (x.season || 1) === (w.season || 1)).flatMap(x => tokenize(x.example_en).map(y => y.toLowerCase())))].filter(y => !low.includes(y) && y !== "i");
        extra = sample(pool, Math.min(2, pool.length));
      }
      return { t, w, tiles: shuffleNE([...toks, ...extra]), ans: toks.join(" ") };
    }
    if (t === "match") return { t, w, group, left: shuffle(group), right: shuffle(group) };
  }
  const WORD_TYPES = ["listen", "meaning", "reverse", "fill", "spell", "arrange"];
  function genSingles(words, n) {
    const out = []; let last = null; let ws = shuffle(words.length ? words : []);
    const base = ws.length ? ws : words;
    for (let i = 0; i < n; i++) {
      if (i && base.length && i % base.length === 0) ws = shuffle(base);
      const w = (ws.length ? ws : base)[i % (ws.length || base.length)];
      const t = rand(WORD_TYPES.filter(x => x !== last)); last = t; out.push(makeEx(t, w));
    }
    return out;
  }
  function composeReview(words, n, matchGroups) {
    let ws = shuffle(words); const matches = [];
    for (let m = 0; m < matchGroups && ws.length >= 5; m++) { const g = ws.slice(0, 5); ws = ws.slice(5); matches.push(makeEx("match", g[0], g)); }
    const singles = genSingles(ws.length ? ws : words, Math.max(1, n - matches.length));
    matches.forEach((m, i) => singles.splice(Math.min(singles.length, 2 + i * 5), 0, m));
    return singles;
  }
  function longestSpell(ws) {
    const ok = ws.filter(w => w.word.length <= 10);
    if (!ok.length) return ws[0];
    return ok.slice().sort((a, b) => b.word.length - a.word.length)[0];
  }
  function daySteps(themeId, day) {
    const ws = wordsOf(themeId, day);
    const [a, b, c, d, e] = shuffle(ws);
    const sp = longestSpell(ws);
    const exs = [makeEx("meaning", a), makeEx("listen", b), makeEx("reverse", c), makeEx("meaning", d), makeEx("listen", e),
      makeEx("match", a, ws), makeEx("spell", sp), makeEx("fill", b), makeEx("arrange", c), makeEx("fill", d)];
    return ws.map(w => ({ k: "card", w })).concat(exs.map(e => ({ k: "ex", e })));
  }
  function grammarSteps(g) {
    const intro = (g.intro || []).map(section => ({ k: "intro", g, section }));
    const exs = g.ex.map(x => {
      if (x.t === "mc") return { k: "ex", e: { t: "gmc", g: x, opts: x.o } };
      if (x.t === "fill") return { k: "ex", e: { t: "gfill", g: x } };
      return { k: "ex", e: { t: "gtiles", g: x, tiles: shuffleNE([...tokenize(x.a), ...(x.extra || [])]) } };
    });
    return intro.concat(exs);
  }
  function reviewSteps(words, n, groups) { return composeReview(words, n, groups).map(e => ({ k: "ex", e })); }

  let L = null;
  function xpBase(kind, replay) {
    if (kind === "practice") return 5;
    if (replay) return kind === "exam" ? 10 : 5;
    return { day: 15, grammar: 15, weekly: 20, monthly: 40, qday: 20, exam: 60, review: 10 }[kind] || 10;
  }
  function lessonTitle(kind) {
    return { day: "今日 5 個字學完！", weekly: "週複習完成！", grammar: "文法課完成！", monthly: "月度大複習完成！", qday: "季度複習完成！", exam: "季度大考完成！", review: "複習完成！", practice: "練習完成，心已補滿！" }[kind] || "完成！";
  }

  function persistCardProgress() {
    if (!L || L.kind !== "day" || L.replay || L.finished) return;
    const seen = L.phase === "quiz" ? 5 : L.cardsSeen;
    S.inProgress = { nodeId: L.nodeId, cardsSeen: seen, date: today() };
    save();
  }
  function startLesson(cfg) {
    LC.refillHearts();
    if (!cfg.practice && !S.unlimited && S.hearts <= 0) { LC.heartsModal(true); return; }
    LC.closeModal();
    const steps = cfg.steps;
    L = Object.assign(cfg, {
      queue: steps.slice(), idx: 0, total: steps.length, doneCount: 0, mistakes: 0, answered: 0, correct: 0,
      t0: Date.now(), results: {}, requeued: 0, cardsSeen: 0, phase: "cards"
    });
    if (cfg.resume && S.inProgress && S.inProgress.nodeId === cfg.nodeId) {
      const seen = Math.min(5, S.inProgress.cardsSeen || 0);
      L.cardsSeen = seen; L.doneCount = seen; L.idx = seen;
      if (seen >= 5) L.phase = "quiz";
    }
    const el = document.createElement("div"); el.className = "lesson"; el.id = "lesson";
    el.innerHTML = '<div class="lhead"><button class="xbtn" data-act="quit" aria-label="離開">✕</button><div class="lprog"><i></i></div><div class="lhearts"></div></div><div class="lbody"></div><div class="lfoot"></div><div class="fb"></div>';
    $("#app").appendChild(el);
    el.classList.add("arriving");
    renderStep();
    LC.meow(S.companion, "start");
    setTimeout(() => { if (el.isConnected) el.classList.remove("arriving"); }, 700);
  }
  function updateProgress() {
    const p = $("#lesson .lprog>i"); if (p) p.style.width = Math.min(100, Math.round(100 * L.doneCount / L.total)) + "%";
    const h = $("#lesson .lhearts");
    if (h) h.innerHTML = L.practice || S.unlimited ? "∞" : '<span class="emoji">❤️</span> ' + S.hearts;
  }
  function setFoot(html) { $("#lesson .lfoot").innerHTML = html; }
  function renderStep() {
    updateProgress();
    const fb = $("#lesson .fb"); fb.className = "fb"; fb.innerHTML = "";
    if (!L || L.idx >= L.queue.length) return finishLesson();
    const st = L.queue[L.idx];
    const body = $("#lesson .lbody");
    L.cur = st; L.sel = null; L.chosen = []; L.checked = false;
    body.scrollTop = 0;
    if (st.k === "card") return renderCard(st, body);
    if (st.k === "intro") return renderIntro(st, body);
    L.phase = "quiz";
    renderEx(st.e, body);
  }
  function renderCard(st, body) {
    L.phase = "cards";
    const w = st.w;
    const cards = L.queue.filter(s => s.k === "card");
    const ci = L.cardsSeen + 1;
    const pos = (w.pos || "") + (LC.POS_ZH[w.pos] ? " " + LC.POS_ZH[w.pos] : "");
    const theme = THEME[w.theme_id];
    const meaning = w.meaning_full || w.meaning_zh;
    const last = ci === cards.length;
    body.innerHTML =
      '<div class="wchiprow"><span class="pill sun">' + theme.emoji + " " + esc(theme.zh) + "・今日第 " + ci + " / " + cards.length + ' 個字</span><span class="pill pink">' + (L.replay ? "溫習" : "新字") + "</span></div>" +
      '<div class="card wordcard"><div class="peek">' + faceHTML(S.companion, 72, { r: "22px" }) + "</div>" +
      '<div class="wtop"><div class="wicon">' + renderIcon(w, 108) + "</div><div><div class=\"wd speakable\" data-speak=\"" + esc(w.word) + "\">" + esc(w.word) + "</div>" +
      '<div class="ipa">' + esc(w.ipa) + '</div><span class="pill lav">' + esc(pos) + "</span></div></div>" +
      '<div class="audio">' +
      '<button class="ab orange" data-speak="' + esc(w.word) + '"><span class="emoji">🔊</span>聽發音</button>' +
      '<button class="ab" data-speak="' + esc(w.word) + '" data-slow="1"><span class="emoji">🐢</span>慢速</button>' +
      (LC.SR ? '<button class="ab pink" data-act="mic" data-mic="' + esc(w.word) + '"><span class="emoji">🎤</span>跟讀</button>' : "") +
      "</div>" +
      '<div class="meaning"><span class="zh">' + esc(meaning) + '</span><span class="mlab">中文意思</span></div></div>' +
      '<div class="sec plain"><h4>' + faceHTML(S.companion, 22, { cls: "ring2" }) + "廣東話解釋</h4><p>" + esc(w.explain_yue || "") + "</p></div>" +
      '<div class="sec ex"><h4><span class="emoji">💬</span>例句</h4><div class="en2"><span>' + highlight(w.example_en, w.word) + '</span><button class="spk" data-speak="' + esc(w.example_en) + '" aria-label="讀例句">🔊</button></div><p class="exzh">' + esc(w.example_zh) + "</p><div class=\"mic-res\"></div></div>" +
      '<div class="sec tip">' + tipHTML(w.tip) + "</div>";
    const skip = L.replay ? '<button class="btn ghost sm" data-act="skipcards">跳過生字卡</button>' : "";
    setFoot(skip + '<button class="btn" data-act="next">' + (last ? "明白喇！開始小測驗 💪" : "明白喇，下一個 →") + "</button>");
    if (S.settings.sound) TTS.armAuto(w.word, 680);
  }
  function renderIntro(st, body) {
    const g = st.g, s = st.section;
    const ex = (s.ex || []).map(e => '<div class="gex"><button class="spk" data-speak="' + esc(e[0]) + '" aria-label="讀例句">🔊</button><div><div class="ge">' + esc(e[0]) + '</div><div class="gz">' + esc(e[1]) + "</div></div></div>").join("");
    body.innerHTML = '<div class="qtype">📘 文法小課堂</div><div class="qtitle">' + g.emoji + " " + esc(g.title) + '<div class="qsub">' + esc(g.en) + "</div></div>" +
      '<div class="speech">' + faceHTML(S.companion, 64) + '<div class="bubble">睇完解說，跟住做 ' + g.ex.length + " 條練習！撳 🔊 可以聽例句。</div></div>" +
      '<div class="gcard"><h4>' + esc(s.h) + "</h4><p>" + LC.safeRich(s.p || "") + "</p>" + ex + "</div>";
    setFoot('<button class="btn lav" data-act="next">明白！繼續 ✍️</button>');
  }
  function optBtns(opts) {
    return '<div class="opts">' + opts.map((o, i) => '<button class="opt" data-act="opt" data-i="' + i + '"><span class="k">' + (i + 1) + "</span><span>" + esc(o) + "</span></button>").join("") + "</div>";
  }
  function renderEx(e, body) {
    const w = e.w;
    const cat = faceHTML(S.companion, 64);
    let h = '<div class="qtype">' + TYPE_LABEL[e.t] + "</div>";
    if (e.t === "listen") {
      h += '<div class="qtitle">你聽到邊個字？</div><div class="playrow"><button class="ab orange big" data-speak="' + esc(w.word) + '"><span class="emoji">🔊</span>聽發音</button><button class="ab" data-speak="' + esc(w.word) + '" data-slow="1"><span class="emoji">🐢</span>慢速</button></div>' + optBtns(e.opts);
      if (S.settings.sound) TTS.armAuto(w.word, 280);
    } else if (e.t === "meaning") {
      h += '<div class="qtitle">呢個字係咩意思？</div><div class="speech">' + cat + '<div class="bubble"><button class="spk" data-speak="' + esc(w.word) + '">🔊</button><span class="bigword speakable" data-speak="' + esc(w.word) + '">' + esc(w.word) + "</span></div></div>" + optBtns(e.opts);
      if (S.settings.sound) TTS.armAuto(w.word, 280);
    } else if (e.t === "reverse") {
      h += '<div class="qtitle">揀出啱嘅英文字</div><div class="speech">' + cat + '<div class="bubble">「' + esc(w.meaning_zh) + '」<div class="qsub">英文點講？</div></div></div>' + optBtns(e.opts);
    } else if (e.t === "fill") {
      h += '<div class="qtitle">揀啱嘅字填入空格</div><div class="sentence">' + esc(e.parts[0]) + '<span class="blank" id="blank">&nbsp;</span>' + esc(e.parts[1]) + '</div><div class="hint">' + esc(w.example_zh) + "</div>" + optBtns(e.opts);
    } else if (e.t === "spell") {
      h += '<div class="qtitle">用字母串出呢個字</div><div class="speech">' + cat + '<div class="bubble">「' + esc(w.meaning_zh) + '」<div class="playrow" style="margin-top:8px"><button class="spk" data-speak="' + esc(w.word) + '">🔊</button><button class="spk" data-speak="' + esc(w.word) + '" data-slow="1">🐢</button></div></div></div><div class="answer-line" id="ans"></div><div class="bank" id="bank">' + e.tiles.map((c, i) => '<button class="tile letter" data-act="tile" data-i="' + i + '">' + esc(c) + "</button>").join("") + "</div>";
    } else if (e.t === "arrange" || e.t === "gtiles") {
      const zh = e.t === "arrange" ? w.example_zh : e.g.zh;
      h += '<div class="qtitle">將句子砌做英文</div><div class="speech">' + cat + '<div class="bubble">' + esc(zh) + '</div></div><div class="answer-line" id="ans"></div><div class="bank" id="bank">' + e.tiles.map((c, i) => '<button class="tile" data-act="tile" data-i="' + i + '">' + esc(c) + "</button>").join("") + "</div>";
    } else if (e.t === "match") {
      L.match = { l: null, r: null, done: new Set() };
      h += '<div class="qtitle">撳一下，將英文同中文配對</div><div class="match"><div class="opts">' + e.left.map(x => '<button class="opt speakable" data-act="m" data-side="l" data-id="' + esc(x.id) + '" data-speak="' + esc(x.word) + '">' + esc(x.word) + "</button>").join("") + '</div><div class="opts">' + e.right.map(x => '<button class="opt" data-act="m" data-side="r" data-id="' + esc(x.id) + '">' + esc(x.meaning_zh) + "</button>").join("") + "</div></div>";
    } else if (e.t === "gmc" || e.t === "gfill") {
      const q = esc(e.g.q).replace("___", '<span class="blank" id="blank">&nbsp;</span>');
      h += '<div class="qtitle">' + (e.t === "gmc" ? "揀啱嘅答案" : "打字填充") + '</div><div class="sentence">' + q + '</div><div class="hint">' + esc(e.g.zh) + "</div>";
      h += e.t === "gmc" ? optBtns(e.opts) : '<input class="tinput" id="tin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="喺度打答案…">';
    }
    body.innerHTML = h;
    setFoot('<button class="btn" data-act="check" disabled>檢查</button>');
    if (e.t === "match") $("#lesson .lfoot .btn").style.visibility = "hidden";
    if (e.t === "gfill") {
      const inp = $("#tin");
      inp.addEventListener("input", () => { L.sel = inp.value; const b = $("#blank"); if (b) b.textContent = inp.value || "\u00a0"; $("#lesson .lfoot .btn").disabled = !inp.value.trim(); });
      inp.addEventListener("keydown", ev => { if (ev.key === "Enter" && inp.value.trim()) check(); });
    }
  }
  function renderTiles() {
    const e = L.cur.e;
    $("#ans").innerHTML = L.chosen.map((ti, j) => '<button class="tile' + (e.t === "spell" ? " letter" : "") + '" data-act="untile" data-j="' + j + '">' + esc(e.tiles[ti]) + "</button>").join("");
    $$("#bank .tile").forEach(b => b.classList.toggle("used", L.chosen.includes(+b.dataset.i)));
    const btn = $("#lesson .lfoot .btn"); if (btn) btn.disabled = L.chosen.length === 0;
  }
  function onMatch(btn) {
    const m = L.match; if (!m || m.done.has(btn.dataset.id)) return;
    const side = btn.dataset.side, id = btn.dataset.id;
    $$('#lesson [data-act="m"][data-side="' + side + '"]').forEach(b => b.classList.remove("sel"));
    btn.classList.add("sel"); m[side] = id;
    if (m.l != null && m.r != null) {
      const bl = $('#lesson [data-side="l"][data-id="' + m.l + '"]'), br = $('#lesson [data-side="r"][data-id="' + m.r + '"]');
      if (m.l === m.r) {
        m.done.add(m.l); [bl, br].forEach(b => { b.classList.remove("sel"); b.classList.add("right"); });
        beep("ok");
        setTimeout(() => [bl, br].forEach(b => { if (b) b.style.opacity = ".45"; }), 280);
      } else {
        L.results[m.l] = false; L.mistakes++;
        [bl, br].forEach(b => { if (b) { b.classList.remove("sel"); b.classList.add("wrong"); } });
        beep("bad"); if (!L.practice) loseHeart(); updateProgress();
        setTimeout(() => [bl, br].forEach(b => b && b.classList.remove("wrong")), 420);
      }
      m.l = m.r = null;
      if (m.done.size === L.cur.e.group.length) {
        L.cur.e.group.forEach(w => { if (L.results[w.id] !== false) L.results[w.id] = true; });
        setTimeout(() => showFeedback(true, "全部配對完成！"), 380);
      }
    }
  }
  function check() {
    if (!L || L.checked || !L.cur || L.cur.k !== "ex") return;
    const e = L.cur.e; let ok = false, ansText = "", detail = "";
    if (["listen", "reverse", "fill", "meaning"].includes(e.t)) ok = L.sel != null && e.opts[L.sel] === e.ans;
    else if (e.t === "spell") ok = L.chosen.map(i => e.tiles[i]).join("").toLowerCase() === e.ans.toLowerCase();
    else if (e.t === "arrange") ok = norm(L.chosen.map(i => e.tiles[i]).join(" ")) === norm(e.ans);
    else if (e.t === "gtiles") ok = norm(L.chosen.map(i => e.tiles[i]).join(" ")) === norm(e.g.a);
    else if (e.t === "gmc") ok = L.sel === e.g.a;
    else if (e.t === "gfill") ok = (e.g.a || []).some(a => norm(a) === norm(L.sel || ""));
    else return;
    L.checked = true;
    if (e.w) L.results[e.w.id] = (L.results[e.w.id] !== false) && ok;
    const w = e.w;
    if (["listen", "reverse", "fill", "spell"].includes(e.t)) { ansText = w.word; detail = w.word + " " + w.ipa + " ＝ " + w.meaning_zh; }
    if (e.t === "meaning") { ansText = w.word; detail = w.word + " " + w.ipa + " ＝ " + w.meaning_zh; }
    if (e.t === "arrange") { ansText = w.example_en; detail = w.example_zh; }
    if (e.t === "gmc") { ansText = e.g.q.replace("___", e.g.o[e.g.a]); detail = e.g.why || ""; }
    if (e.t === "gfill") { ansText = e.g.q.replace("___", e.g.a[0]); detail = e.g.why || ""; }
    if (e.t === "gtiles") { ansText = e.g.a; detail = e.g.why || ""; }
    const opts = $$("#lesson .opt[data-act='opt']");
    if (opts.length) {
      $("#lesson .opts").classList.add("lock");
      const correctIdx = e.t === "gmc" ? e.g.a : e.opts.indexOf(e.ans);
      opts.forEach((b, i) => { if (i === correctIdx) b.classList.add("right"); else if (i === L.sel) b.classList.add("wrong"); b.classList.remove("sel"); });
    }
    if (e.t === "fill" || e.t === "gmc") { const bl = $("#blank"); if (bl) bl.textContent = e.t === "fill" ? (e.shown || e.ans) : e.g.o[e.g.a]; }
    if (e.t === "gfill") { const inp = $("#tin"); if (inp) inp.disabled = true; }
    $$("#lesson .tile").forEach(b => b.style.pointerEvents = "none");
    showFeedback(ok, ok ? detail : "", ok ? "" : ansText, ok ? "" : detail);
    if (ansText && e.t !== "meaning") TTS.speak(e.t === "gmc" || e.t === "gfill" || e.t === "gtiles" || e.t === "arrange" ? ansText : (w && w.word));
    if (e.t === "meaning" && w) TTS.speak(w.word);
  }
  function showFeedback(ok, okDetail, ans, why) {
    L.checked = true; L.answered++;
    const fb = $("#lesson .fb");
    const lesson = $("#lesson");
    if (lesson) {
      lesson.classList.remove("okpeek", "badpeek");
      void lesson.offsetWidth;
      lesson.classList.add(ok ? "okpeek" : "badpeek");
    }
    if (ok) { L.correct++; L.doneCount++; beep("ok"); }
    else {
      L.mistakes++; beep("bad");
      if (!L.practice) loseHeart();
      if (L.requeued < 6) { L.queue.push(L.cur); L.requeued++; } else L.doneCount++;
    }
    updateProgress();
    fb.className = "fb " + (ok ? "ok" : "bad");
    fb.innerHTML = ok
      ? '<div class="fh"><span class="fi">✅</span>' + rand(PRAISE) + "</div>" + (okDetail ? '<p class="fd">' + esc(okDetail) + "</p>" : "") + '<button class="btn" data-act="continue">繼續</button>'
      : '<div class="fh"><span class="fi">❌</span>差少少！</div><p class="fd"><b>正確答案：</b>' + esc(ans) + (why ? "<br>" + esc(why) : "") + '</p><button class="btn" data-act="continue">繼續</button>';
    requestAnimationFrame(() => requestAnimationFrame(() => fb.classList.add("show")));
    const foot = $("#lesson .lfoot .btn"); if (foot) foot.disabled = true;
  }
  function onContinue() {
    if (!L.practice && !S.unlimited && S.hearts <= 0) { LC.heartsModal(true); return; }
    L.idx++; renderStep();
  }
  function finishLesson() {
    const perfect = L.mistakes === 0;
    const before = todayXP();
    const base = xpBase(L.kind, L.replay);
    const bonus = perfect && !L.replay && !L.practice ? 5 : 0;
    const xp = base + bonus;
    addXP(xp);
    const ext = markActive();
    S.lessons = (S.lessons || 0) + 1;
    if (perfect && !L.replay && !L.practice) S.perfectLessons = (S.perfectLessons || 0) + 1;
    if (Object.keys(L.results).length && L.kind !== "grammar") srsUpdate(L.results);
    const queue = [];
    if (L.nodeId && !L.practice) {
      const prev = S.done[L.nodeId];
      if (!prev) S.done[L.nodeId] = { date: today(), n: 1, mistakes: L.mistakes, perfect: perfect };
      else S.done[L.nodeId] = { date: prev.date, n: (prev.n || 1) + 1, mistakes: prev.mistakes, perfect: prev.perfect };
    }
    if (L.kind === "day" && !L.replay) {
      if (S.lastNewLessonDate !== today()) { S.lastNewLessonDate = today(); S.newLessonsToday = 0; }
      S.newLessonsToday = (S.newLessonsToday || 0) + 1;
      if (!S.startDate) S.startDate = today();
      const slug = S.companion;
      if (!S.cats[slug]) S.cats[slug] = { unlocked: today(), lessons: 0, bonus: null, seen: false };
      const beforeL = S.cats[slug].lessons || 0;
      S.cats[slug].lessons = beforeL + 1;
      const afterL = S.cats[slug].lessons;
      const node = NODE[L.nodeId];
      if (node && node.day === 5 && !S.themeCards[node.theme]) {
        S.themeCards[node.theme] = { date: today(), cat: slug };
        queue.push({ type: "themeCard", theme: node.theme, xp });
      }
      [["sleep", 5], ["stretch", 10], ["happy", 15], ["actA", 20], ["actB", 25]].forEach(([pose, need]) => {
        if (beforeL < need && afterL >= need) queue.push({ type: "photo", cat: slug, pose, xp, lessons: afterL });
      });
    }
    if (L.practice) { S.hearts = MAX_HEARTS; S.heartsAt = Date.now(); }
    if (L.kind === "day" && L.nodeId) {
      const node = NODE[L.nodeId];
      const y = maybeAwardYarn(node.theme);
      if (y && y.type === "yarn") queue.push({ type: "yarn", cat: y.cat, theme: y.theme, xp });
      else if (y && y.type === "yarn-xp") queue.push({ type: "toast", msg: "零錯誤主題！全部貓貓都有毛線相喇 🧶" });
    }
    if (L.kind === "weekly" && L.nodeId && !L.replay) {
      const node = NODE[L.nodeId];
      const y = maybeAwardYarn(node.theme);
      if (y && y.type === "yarn") queue.push({ type: "yarn", cat: y.cat, theme: y.theme, xp });
      else if (y && y.type === "yarn-xp") queue.push({ type: "toast", msg: "零錯誤主題！全部貓貓都有毛線相喇 🧶" });
    }
    if (L.kind === "day" && !L.replay) S.inProgress = null;
    const cats = checkUnlocks();
    cats.forEach(slug => queue.push({ type: "cat", cat: slug, xp }));
    S.celebrationQueue = (S.celebrationQueue || []).concat(queue);
    save();
    const goalHit = before < S.settings.goal && todayXP() >= S.settings.goal;
    if (goalHit) toast("今日目標達成！🎯");
    const secs = Math.round((Date.now() - L.t0) / 1000);
    const acc = L.answered ? Math.round(100 * L.correct / L.answered) : 100;
    const cat = companion();
    const happy = cat.poses && cat.poses.happy && S.cats[cat.slug] && (S.cats[cat.slug].lessons || 0) >= 15;
    const photo = happy
      ? '<div class="pframe cheer"><img alt="" src="' + esc(cat.poses.happy) + '" style="object-position:50% 45%"></div>'
      : faceHTML(cat.slug, 150, { mode: "bust", r: "28px" });
    const learned = L.kind === "day" && !L.replay ? '<div class="learned">📚 今日學咗：' + wordsOf(NODE[L.nodeId].theme, NODE[L.nodeId].day).map(w => "<span>" + esc(w.word) + "</span>").join("") + "</div>" : "";
    $("#lesson .lhead").style.visibility = "hidden";
    $("#lesson .lbody").innerHTML = '<div class="complete"><div class="celebrate">' + photo + "</div><h2>" + lessonTitle(L.kind) + "</h2><div class=\"sub\">" + (perfect ? "零錯誤！貓貓好欣賞你 🌟" : "我哋一齊慢慢進步 💪") + "</div>" +
      '<div class="cstats"><div class="cstat"><div class="cl">XP</div><div class="cv">⭐ ' + xp + '</div></div><div class="cstat"><div class="cl">準確率</div><div class="cv">🎯 ' + acc + '%</div></div><div class="cstat"><div class="cl">用時</div><div class="cv">⏱ ' + Math.floor(secs / 60) + ":" + LC.pad(secs % 60) + "</div></div></div>" +
      learned + (ext ? '<div class="learned fire">🔥 連續學習 ' + S.streak + " 日！</div>" : "") + "</div>";
    $("#lesson .fb").className = "fb";
    setFoot('<button class="btn" data-act="done">繼續</button>');
    LC.meow(S.companion, "done");
    const box = $("#lesson .complete");
    if (box) ["#F59A3E", "#FFD66B", "#F7B5C4", "#8FD6AE", "#8FCBEA", "#B7A6E6"].forEach((col, i) => {});
    for (let i = 0; i < 28; i++) {
      const c = document.createElement("i"); c.className = "confetti";
      c.style.left = Math.random() * 100 + "%";
      c.style.background = ["#F59A3E", "#FFD66B", "#F7B5C4", "#8FD6AE", "#8FCBEA", "#B7A6E6"][i % 6];
      c.style.animationDuration = (1.6 + Math.random() * 1.4) + "s";
      box.appendChild(c);
    }
    L.finished = true; L.xpEarned = xp;
  }
  function closeLesson() {
    const el = $("#lesson"); if (el) el.remove();
    TTS.cancel();
    L = null;
  }
  function quitLesson() {
    if (L && L.kind === "day" && !L.finished) persistCardProgress();
    closeLesson();
    LC.closeModal();
    LC.render();
  }

  function startDay(node, replay) {
    if (!node) return;
    const steps = daySteps(node.theme, node.day);
    const resume = !replay && S.inProgress && S.inProgress.nodeId === node.id;
    startLesson({ kind: "day", nodeId: node.id, steps, replay: !!replay || isDone(node.id) && !resume ? isDone(node.id) : false, resume, practice: false });
    if (isDone(node.id)) L.replay = true;
  }
  function startWeekly(node) { startLesson({ kind: "weekly", nodeId: node.id, steps: reviewSteps(themeWords(node.theme), 17, 3), replay: isDone(node.id) }); }
  function startGrammar(node) {
    const g = GBY[node.gid || node.id];
    startLesson({ kind: "grammar", nodeId: node.id, steps: grammarSteps(g), replay: isDone(node.id) });
  }
  function startMonthly(node) {
    const spec = LC.TDATA.monthly_reviews.find(m => m.id === node.id);
    const pool = spec.themes.flatMap(id => themeWords(id));
    startLesson({ kind: "monthly", nodeId: node.id, steps: reviewSteps(weakest(spec.questions, pool), spec.questions, spec.match_groups), replay: isDone(node.id) });
  }
  function startQDay(node) {
    const spec = LC.quarterlyById(node.qid) || LC.TDATA.quarterly_review;
    const day = spec.review_days[node.day - 1];
    const pool = day.themes.flatMap(id => themeWords(id));
    const n = spec.review_day_questions || 15;
    startLesson({ kind: "qday", nodeId: node.id, steps: reviewSteps(weakest(Math.max(n, 20), pool), n, 1), replay: isDone(node.id) });
  }
  function startExam(node) {
    const spec = LC.quarterlyById(node.qid) || LC.TDATA.quarterly_review || { season: 1 };
    const season = spec.season || node.season || 1;
    const pool = WORDS.filter(w => w.season === season);
    const src = pool.length ? pool : WORDS.filter(w => w.season === 1);
    const n = (spec.exam && spec.exam.questions) || 40;
    const groups = (spec.exam && spec.exam.match_groups) || 4;
    startLesson({ kind: "exam", nodeId: node.id, steps: reviewSteps(weightedSample(src, n), n, groups), replay: isDone(node.id) });
  }
  function startReview(practice) {
    let ws, free = false;
    if (practice) ws = weakest(6);
    else { ws = dueWords().slice(0, 10); if (!ws.length) { ws = weakest(8); free = true; } }
    if (!ws.length) { toast(practice ? "學完第一課先可以練習" : "仲未學字喎"); return; }
    const n = practice ? 6 : Math.min(12, Math.max(6, Math.round(ws.length * 1.3)));
    const groups = !practice && ws.length >= 6 ? 1 : 0;
    startLesson({ kind: practice ? "practice" : "review", title: practice ? "練習補心" : free ? "自由練習" : "今日複習", steps: reviewSteps(ws, n, groups), xpKind: practice ? "practice" : "review", practice: !!practice, replay: false });
  }
  function startNode(node, replay) {
    if (!node) return;
    if (!LC.nodeUnlocked(node) && !S.unlockAll) { toast("完成之前嘅課就會解鎖"); return; }
    if (node.type === "day") {
      const isReplay = replay || isDone(node.id);
      const resume = !isReplay && S.inProgress && S.inProgress.nodeId === node.id;
      if (!isReplay && !resume && LC.shouldAskCompanion && LC.shouldAskCompanion()) {
        S.companionAskedDate = today(); save();
        LC.openCompanion({ then() { reallyDay(node, false); } });
        return;
      }
      reallyDay(node, isReplay);
      return;
    }
    if (node.type === "weekly") return startWeekly(node);
    if (node.type === "grammar") return startGrammar(node);
    if (node.type === "monthly") return startMonthly(node);
    if (node.type === "qday") return startQDay(node);
    if (node.type === "exam") return startExam(node);
  }
  function reallyDay(node, isReplay) {
    const steps = daySteps(node.theme, node.day);
    const resume = !isReplay && S.inProgress && S.inProgress.nodeId === node.id;
    startLesson({ kind: "day", nodeId: node.id, steps, replay: !!isReplay, resume });
  }

  function listenWord(target, btn) {
    const out = btn.closest(".lesson").querySelector(".mic-res") || btn.parentElement;
    let host = $("#lesson .mic-res"); if (!host) { host = document.createElement("div"); host.className = "mic-res"; btn.parentElement.appendChild(host); }
    let r; try { r = new LC.SR(); } catch (e) { host.textContent = "你部機唔支援語音辨識"; return; }
    r.lang = "en-GB"; r.interimResults = false; r.maxAlternatives = 5;
    btn.classList.add("rec"); host.textContent = "🎙️ 聽緊…請讀出：" + target;
    r.onresult = e => {
      const alts = Array.from(e.results[0]).map(a => a.transcript.toLowerCase().trim());
      const ok = alts.some(a => a.includes(target.toLowerCase()));
      host.innerHTML = ok ? "✅ 讀得好！我聽到「" + esc(alts[0]) + "」" : "🤔 我聽到「" + esc(alts[0]) + "」，再試一次？";
      if (ok) beep("ok");
    };
    r.onerror = e => { host.textContent = e.error === "not-allowed" ? "要允許使用咪高峰先得 🎤" : "聽唔清楚，再試下 🙏"; };
    r.onend = () => btn.classList.remove("rec");
    try { r.start(); } catch (e) { btn.classList.remove("rec"); }
  }

  LC.L = () => L;
  LC.startLesson = startLesson;
  LC.startNode = startNode;
  LC.startReview = startReview;
  LC.renderStep = renderStep;
  LC.check = check;
  LC.onContinue = onContinue;
  LC.onMatch = onMatch;
  LC.renderTiles = renderTiles;
  LC.quitLesson = quitLesson;
  LC.closeLesson = closeLesson;
  LC.persistCardProgress = persistCardProgress;
  LC.listenWord = listenWord;
  LC.composeReview = composeReview;
  LC.makeEx = makeEx;
  LC.daySteps = daySteps;
  LC.TYPE_LABEL = TYPE_LABEL;
  Object.defineProperty(LC, "lesson", { get() { return L; } });
})(window.LC);
