/* Event wiring. Classic script so file:// works. */
(function (LC) {
  "use strict";
  const { $, $$, S, save, toast, modal, closeModal, TTS, NODE, WORD, CAT, ui } = LC;

  let lastSpeak = { el: null, t: 0 };
  let taps = 0;
  let tapReset = null;
  let avatarOpen = null;
  let ptr = null;

  function speakEl(el) {
    if (!el) return;
    const text = el.getAttribute("data-speak");
    if (!text) return;
    const now = Date.now();
    const dbl = lastSpeak.el === el && now - lastSpeak.t < 300;
    const slow = el.getAttribute("data-slow") === "1" || dbl;
    lastSpeak = { el, t: now };
    el.classList.remove("is-speak", "is-slow");
    void el.offsetWidth;
    el.classList.add(slow ? "is-slow" : "is-speak");
    clearTimeout(el._speakT);
    el._speakT = setTimeout(() => el.classList.remove("is-speak", "is-slow"), slow ? 1100 : 500);
    TTS.speak(text, slow);
  }

  function nudgeCard(dir) {
    if (ui.tab !== "cards" || ui.segment !== "cards") return;
    if ($("#lesson") || $("#modal") || $("#celebrate")) return;
    ui.cardIndex += dir;
    LC.render();
  }

  function onAvatar() {
    taps += 1;
    clearTimeout(avatarOpen);
    clearTimeout(tapReset);
    if (taps >= 5) {
      taps = 0;
      LC.openDev();
      return;
    }
    tapReset = setTimeout(() => { taps = 0; }, 1600);
    avatarOpen = setTimeout(() => {
      if (taps > 0 && taps < 5) {
        taps = 0;
        LC.openCompanion();
      }
    }, 450);
  }

  function wordSheet(id) {
    const w = WORD[id];
    if (!w) return;
    const meaning = w.meaning_full || w.meaning_zh;
    modal(
      '<div class="handle"></div><h3>' + LC.esc(w.word) + '</h3><p class="mp">' + LC.esc(w.ipa) + " · " + LC.esc(w.meaning_zh) + "</p>" +
      '<div class="wtop" style="margin-bottom:10px">' + LC.renderIcon(w, 72) + "</div>" +
      '<p><b>' + LC.esc(meaning) + "</b></p>" +
      '<p class="mp">' + LC.esc(w.explain_yue || "") + "</p>" +
      '<p class="mp"><button class="spk" data-speak="' + LC.esc(w.example_en) + '">🔊</button> ' + LC.esc(w.example_en) + "<br>" + LC.esc(w.example_zh) + "</p>" +
      '<div class="sec tip">' + LC.tipHTML(w.tip) + '</div><button class="btn plain" data-act="close">關閉</button>',
      { sheet: true }
    );
  }

  function quitPrompt() {
    const L = LC.lesson;
    if (!L) return;
    const quiz = L.phase === "quiz" || (L.cardsSeen || 0) >= 5;
    const msg = quiz
      ? "確定要離開？小測驗要由頭做過，生字卡進度會留低。"
      : "確定要離開？進度會保存到呢張卡";
    modal('<h3>離開課程？</h3><p class="mp">' + msg + '</p><div class="btncol"><button class="btn" data-act="close">繼續學</button><button class="btn ghost" data-act="quitnow">離開</button></div>');
  }

  function pickOpt(btn) {
    const L = LC.lesson;
    if (!L || L.checked || !L.cur || L.cur.k !== "ex") return;
    L.sel = +btn.dataset.i;
    $$("#lesson .opt[data-act='opt']").forEach(b => b.classList.toggle("sel", b === btn));
    const e = L.cur.e;
    const blank = $("#blank");
    if (blank && e) {
      if (e.t === "fill") blank.textContent = e.opts[L.sel];
      if (e.t === "gmc" && e.g && e.g.o) blank.textContent = e.g.o[L.sel];
    }
    const foot = $("#lesson .lfoot .btn");
    if (foot) foot.disabled = false;
  }

  function refreshCompanionRows() {
    const box = $("#clist");
    if (!box) return;
    const unlocked = LC.CATS.filter(c => S.cats[c.slug]).sort((a, b) => (a.slug === ui.pick ? -1 : b.slug === ui.pick ? 1 : a.no - b.no));
    box.innerHTML = unlocked.map(c => {
      const rec = S.cats[c.slug];
      const lessons = rec.lessons || 0;
      const math = LC.albumMath(lessons);
      const slots = LC.POSES.map(p => {
        const on = LC.poseUnlocked(c.slug, p, lessons);
        return '<i class="' + (on ? "on" : "") + '">' + (on ? p.emoji : "🔒") + "</i>";
      }).join("");
      const sel = c.slug === ui.pick;
      const pills = (c.slug === S.companion ? '<span class="pill mint">而家陪緊你</span>' : "") + (!rec.seen ? '<span class="pill coral">NEW</span>' : "");
      const next = math.done ? "相已集齊" : "下一張：再陪讀 " + math.nextN + " 堂";
      return '<button class="crow' + (sel ? " sel" : "") + '" data-act="compradio" data-id="' + c.slug + '">' + LC.faceHTML(c.slug, 52) +
        '<div class="cbody"><div class="row"><b>' + LC.esc(c.name_zh) + "</b> " + pills + '</div><div class="fine">' + LC.esc(c.breed_zh) +
        '</div><div class="slots">' + slots + '</div><div class="fine">📷 ' + math.regular + " / 4 張相 ・ " + next +
        '</div><div class="bar thin"><i style="width:' + (math.paws / 5 * 100) + '%"></i></div></div><span class="radio">' + (sel ? "✓" : "") + "</span></button>";
    }).join("");
    const ok = $("#compok");
    const cur = CAT[ui.pick];
    if (ok && cur) ok.textContent = "就揀" + cur.name_zh + "喇 🐾";
  }

  function act(name, el) {
    const L = LC.lesson;
    if (name === "tab") {
      ui.tab = el.dataset.t || "home";
      if (ui.tab !== "cats") ui.album = null;
      if (ui.tab === "cats" && el.closest(".modal")) ui.album = null;
      ui.afterCompanion = null;
      closeModal();
      const cel = $("#celebrate");
      if (cel && !cel.closest) {}
      LC.render();
      return;
    }
    if (name === "avatar") { onAvatar(); return; }
    if (name === "hearts") { LC.heartsModal(!!L && !L.finished); return; }
    if (name === "review") { closeModal(); LC.startReview(false); return; }
    if (name === "practice") {
      if (L && !L.practice && !L.finished) LC.persistCardProgress();
      if (L) LC.closeLesson();
      closeModal();
      LC.startReview(true);
      return;
    }
    if (name === "resume") {
      const ip = S.inProgress;
      if (ip && NODE[ip.nodeId]) LC.startNode(NODE[ip.nodeId], false);
      return;
    }
    if (name === "startnew") { const n = LC.nextNewNode(); if (n) LC.startNode(n, false); return; }
    if (name === "startnode") {
      const n = NODE[el.dataset.id];
      closeModal();
      if (n) LC.startNode(n, el.dataset.replay === "1");
      return;
    }
    if (name === "opentheme") {
      const id = el.dataset.id;
      ui.tab = "cards";
      ui.segment = "cards";
      const list = LC.THEMES.filter(t => S.themeCards[t.id] || LC.themeWordsLearned(t) > 0 || (LC.activeTheme() && LC.activeTheme().id === t.id));
      const i = Math.max(0, list.findIndex(t => t.id === id));
      ui.cardIndex = i < 0 ? 0 : i;
      closeModal();
      LC.render();
      return;
    }
    if (name === "mapnode") { LC.openMapSheet(el.dataset.id); return; }
    if (name === "soon") { toast("第 " + el.dataset.season + " 季即將推出，學完第 1 季先 🐾"); return; }
    if (name === "seg") { ui.segment = el.dataset.s; LC.render(); return; }
    if (name === "ipa") { S.settings.showIPA = !S.settings.showIPA; save(); LC.render(); return; }
    if (name === "saveimg") { LC.exportCard(el.dataset.id, false); return; }
    if (name === "shareimg") { LC.exportCard(el.dataset.id, true); return; }
    if (name === "bfilter") { ui.bankFilter = el.dataset.f; LC.render(); return; }
    if (name === "btheme") { ui.bankTheme = el.dataset.id; LC.render(); return; }
    if (name === "info") { wordSheet(el.dataset.id); return; }
    if (name === "closealbum") { ui.album = null; LC.render(); return; }
    if (name === "album") { ui.album = el.dataset.id; LC.render(); return; }
    if (name === "setcomp") { S.companion = el.dataset.id; save(); toast("今日陪讀貓換成" + (CAT[S.companion] || {}).name_zh); LC.meow(S.companion, "pick"); LC.render(); return; }
    if (name === "goal") { S.settings.goal = +el.dataset.v; save(); LC.render(); return; }
    if (name === "cal") {
      const d = ui.calMonth || new Date();
      ui.calMonth = new Date(d.getFullYear(), d.getMonth() + (+el.dataset.d || 0), 1);
      LC.render();
      return;
    }
    if (name === "sound") { S.settings.sound = !S.settings.sound; save(); LC.render(); return; }
    if (name === "askcat") { S.settings.askCompanionDaily = !S.settings.askCompanionDaily; save(); LC.render(); return; }
    if (name === "svg") { S.settings.svgIcons = el.dataset.v === "1"; save(); LC.render(); return; }
    if (name === "export") { LC.exportProgress(); return; }
    if (name === "import") { const f = $("#importFile"); if (f) f.click(); return; }
    if (name === "quit") { quitPrompt(); return; }
    if (name === "quitnow") { LC.quitLesson(); return; }
    if (name === "close") { closeModal(); return; }
    if (name === "next") {
      if (!L) return;
      if (L.cur && L.cur.k === "card") { L.cardsSeen = (L.cardsSeen || 0) + 1; LC.persistCardProgress(); }
      L.doneCount++;
      L.idx++;
      LC.renderStep();
      return;
    }
    if (name === "skipcards") {
      if (!L) return;
      const n = L.queue.filter(s => s.k === "card").length;
      L.cardsSeen = n;
      L.doneCount = n;
      const i = L.queue.findIndex(s => s.k !== "card");
      L.idx = i < 0 ? L.queue.length : i;
      L.phase = "quiz";
      LC.renderStep();
      return;
    }
    if (name === "opt") { pickOpt(el); return; }
    if (name === "tile") {
      if (!L || L.checked) return;
      const i = +el.dataset.i;
      if (L.chosen.includes(i)) return;
      L.chosen.push(i);
      LC.renderTiles();
      return;
    }
    if (name === "untile") {
      if (!L || L.checked) return;
      L.chosen.splice(+el.dataset.j, 1);
      LC.renderTiles();
      return;
    }
    if (name === "m") { LC.onMatch(el); return; }
    if (name === "check") { LC.check(); return; }
    if (name === "continue") { LC.onContinue(); return; }
    if (name === "done") {
      LC.closeLesson();
      LC.render();
      return;
    }
    if (name === "mic") { LC.listenWord(el.dataset.mic || "", el); return; }
    if (name === "cel-next" || name === "prev-close") {
      if (name === "prev-close") { const p = $("#celebrate"); if (p) p.remove(); return; }
      LC.nextCelebration();
      return;
    }
    if (name === "cel-comp") { S.companion = el.dataset.id; save(); LC.meow(S.companion, "pick"); LC.nextCelebration(); return; }
    if (name === "cel-album") {
      if (S.celebrationQueue && S.celebrationQueue.length) S.celebrationQueue.shift();
      save();
      const cel = $("#celebrate"); if (cel) cel.remove();
      ui.tab = "cats";
      ui.album = el.dataset.id;
      LC.render();
      return;
    }
    if (name === "see-card") {
      const id = el.dataset.id;
      if (S.celebrationQueue && S.celebrationQueue.length) S.celebrationQueue.shift();
      save();
      const cel = $("#celebrate"); if (cel) cel.remove();
      ui.tab = "cards";
      ui.segment = "cards";
      const list = LC.THEMES.filter(t => S.themeCards[t.id] || LC.themeWordsLearned(t) > 0 || (LC.activeTheme() && LC.activeTheme().id === t.id));
      ui.cardIndex = Math.max(0, list.findIndex(t => t.id === id));
      LC.render();
      return;
    }
    if (name === "compclose") { ui.afterCompanion = null; closeModal(); return; }
    if (name === "compradio") { ui.pick = el.dataset.id; refreshCompanionRows(); LC.meow(ui.pick, "pick"); return; }
    if (name === "comppick") {
      S.companion = ui.pick || S.companion;
      save();
      LC.meow(S.companion, "pick");
      const then = ui.afterCompanion;
      ui.afterCompanion = null;
      closeModal();
      if (then) then();
      else LC.render();
      return;
    }
    if (name === "light") { LC.openLightbox(el.dataset.id, el.dataset.pose); return; }
    if (name === "lightprev") { if (ui.lightNav) ui.lightNav(-1); return; }
    if (name === "lightnext") { if (ui.lightNav) ui.lightNav(1); return; }
    if (name === "lockedcat") {
      const c = CAT[el.dataset.id];
      toast(c ? c.unlock.label_zh : "未解鎖");
      return;
    }
    if (name === "companion") { LC.openCompanion(); return; }
    if (name === "dev") { LC.devAction(el.dataset.d); return; }
    if (name === "closecompare") { ui.tab = "home"; LC.render(); return; }
    if (name === "cmp") { ui.compareTheme = el.dataset.id; LC.render(); return; }
  }

  document.addEventListener("click", e => {
    const sp = e.target.closest("[data-speak]");
    if (sp && e.detail === 0) {
      const hit = e.target.closest("[data-act]");
      if (!(hit && sp.contains(hit) && hit !== sp)) speakEl(sp);
    }
    const el = e.target.closest("[data-act]");
    if (!el || el.disabled) return;
    if (el.tagName === "BUTTON" || el.tagName === "A" || el.getAttribute("role") === "button") e.preventDefault();
    act(el.dataset.act, el);
  });

  document.addEventListener("pointerdown", () => { if (LC.unlockAudio) LC.unlockAudio(); }, { capture: true });

  document.addEventListener("pointerdown", e => {
    ptr = {
      x: e.clientX, y: e.clientY,
      swipe: e.target.closest("[data-swipe], .swipe"),
      speak: e.target.closest("[data-speak]")
    };
  });
  document.addEventListener("pointerup", e => {
    if (!ptr) return;
    const dx = e.clientX - ptr.x;
    const dy = e.clientY - ptr.y;
    const moved = Math.hypot(dx, dy) > 12;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if ($("#modal") && ui.lightNav) ui.lightNav(dx < 0 ? 1 : -1);
      else if (ptr.swipe) nudgeCard(dx < 0 ? 1 : -1);
    } else if (ptr.speak && !moved && e.pointerType !== "mouse") {
      const hit = e.target.closest("[data-act]");
      if (!(hit && ptr.speak.contains(hit) && hit !== ptr.speak)) speakEl(ptr.speak);
    } else if (ptr.speak && !moved && e.pointerType === "mouse") {
      const hit = e.target.closest("[data-act]");
      if (!(hit && ptr.speak.contains(hit) && hit !== ptr.speak)) speakEl(ptr.speak);
    }
    ptr = null;
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if ($("#modal") && !$("#modal").dataset.lock) { closeModal(); return; }
      if ($("#lesson") && !(LC.lesson && LC.lesson.finished)) { quitPrompt(); return; }
    }
    const L = LC.lesson;
    if (L && !e.target.closest("input, textarea")) {
      if (e.key === "Enter") {
        const cont = $("#lesson .fb.show [data-act='continue']");
        const next = $("#lesson .lfoot [data-act='next'], #lesson .lfoot [data-act='done']");
        const check = $("#lesson .lfoot [data-act='check']");
        if (cont) { e.preventDefault(); cont.click(); }
        else if (check && !check.disabled) { e.preventDefault(); check.click(); }
        else if (next) { e.preventDefault(); next.click(); }
      }
      if (e.key >= "1" && e.key <= "4") {
        const opt = $$("#lesson .opt[data-act='opt']")[+e.key - 1];
        if (opt) opt.click();
      }
    }
    if (!L && !$("#modal") && !$("#celebrate") && ui.tab === "cards" && ui.segment === "cards") {
      if (e.key === "ArrowLeft") nudgeCard(-1);
      if (e.key === "ArrowRight") nudgeCard(1);
    }
  });

  document.addEventListener("change", e => {
    if (e.target.id === "nameInp") {
      S.profile.name = (e.target.value || "").trim().slice(0, 16) || "Janson";
      save();
      LC.renderTop();
    }
    if (e.target.id === "voiceSel") {
      S.settings.voice = e.target.value || null;
      save();
    }
    if (e.target.id === "importFile" && e.target.files && e.target.files[0]) {
      LC.importProgress(e.target.files[0]);
      e.target.value = "";
    }
  });

  LC.onVoices = () => { if (ui.tab === "me" && !$("#lesson")) LC.render(); };

  function boot() {
    TTS.init();
    LC.refillHearts();
    const newly = LC.checkUnlocks();
    (newly || []).forEach(slug => {
      if (!(S.celebrationQueue || []).some(q => q.type === "cat" && q.cat === slug)) {
        S.celebrationQueue.push({ type: "cat", cat: slug, xp: 0 });
      }
    });
    save();
    LC.render();
    if (/[?&]dev=1(?:&|$)/.test(location.search)) {
      const b = document.createElement("button");
      b.id = "devfab";
      b.type = "button";
      b.textContent = "🛠";
      b.setAttribute("aria-label", "開發者面板");
      b.addEventListener("click", () => LC.openDev());
      $("#app").appendChild(b);
    }
    setInterval(() => {
      const before = S.hearts;
      LC.refillHearts();
      if (S.hearts !== before && !$("#lesson")) LC.renderTop();
    }, 15000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.LC);
