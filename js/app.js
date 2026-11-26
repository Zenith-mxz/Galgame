(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const SAVE_KEY = "citrus_summer_save_v1";
  const GLOBAL_KEY = "citrus_summer_global_v1";
  const CONFIG_KEY = "citrus_summer_config_v1";

  const State = {
    nodeId: "prologue",
    lineIndex: 0,
    affection: { kasumi: 0, yuina: 0, sion: 0 },
    flags: {},
    backlog: [],
    read: {},
    unlockedEndings: {},
    chapterName: "序章 · 归来的夏天",
    spriteTheme: null,
    position: "center",
    emotion: "normal",
    bgId: null,
    playing: false,
    typing: false,
    typeTimer: null,
    auto: false,
    skip: false,
    autoTimer: null,
    currentSpeaker: null,
    currentText: ""
  };

  const Config = {
    textSpeed: 40,
    autoDelay: 1800,
    bgmVol: 60,
    seVol: 60,
    voiceVol: 60,
    skipMode: "read",
    fullscreen: false,
    textboxOpacity: 1
  };

  const LineIds = {};
  let lineCounter = 0;

  function freshLineId() {
    lineCounter += 1;
    return "L" + lineCounter;
  }

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  }

  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 1800);
  }

  /* ---------------- Sprites ---------------- */

  let uidCounter = 0;

  function renderSprite(el, theme, emotion) {
    if (!theme) {
      el.innerHTML = "";
      el.classList.remove("show", "dim");
      el.removeAttribute("data-theme");
      return;
    }
    uidCounter += 1;
    el.setAttribute("data-theme", theme);
    el.innerHTML = Art.build(theme, emotion || "normal", uidCounter);
  }

  function setSpriteLayer(slot, theme, emotion) {
    const el = $("#sprite-" + slot);
    if (!theme) {
      el.classList.remove("show", "dim");
      return;
    }
    renderSprite(el, theme, emotion);
    requestAnimationFrame(() => el.classList.add("show"));
  }

  function updateSprites() {
    setSpriteLayer(State.position, State.spriteTheme, State.emotion);
    const otherSlots = ["left", "center", "right"].filter((s) => s !== State.position);
    otherSlots.forEach((s) => {
      renderSprite($("#sprite-" + s), null, null);
    });
    const cur = $("#sprite-" + State.position);
    cur.classList.remove("dim");
  }

  function showSideSprites(themes, activeTheme) {
    ["left", "center", "right"].forEach((slot) => {
      renderSprite($("#sprite-" + slot), null, null);
    });
    themes.forEach((t, i) => {
      const slot = ["left", "center", "right"][i];
      if (!slot) return;
      renderSprite($("#sprite-" + slot), t.theme, t.emotion || "smile");
      requestAnimationFrame(() => $("#sprite-" + slot).classList.add("show"));
      if (t.theme !== activeTheme) $("#sprite-" + slot).classList.add("dim");
    });
  }

  /* ---------------- Background ---------------- */

  let activeBg = "a";

  function setBackground(bgId) {
    if (!bgId || bgId === State.bgId) {
      State.bgId = bgId;
      return;
    }
    const nextLayer = activeBg === "a" ? "b" : "a";
    const next = $("#bg-" + nextLayer);
    next.style.background = Backgrounds.bgCss(bgId);
    next.style.backgroundSize = "cover";
    next.classList.add("active");
    const prev = $("#bg-" + activeBg);
    prev.classList.remove("active");
    activeBg = nextLayer;
    State.bgId = bgId;
    if (window.Audio2) Audio2.playBgmForBg(bgId);
  }

  function flash() {
    const f = $("#flash");
    f.style.opacity = "0.9";
    setTimeout(() => { f.style.opacity = "0"; }, 120);
  }

  function shake() {
    const vp = $("#viewport");
    vp.animate(
      [
        { transform: "translate(0,0)" },
        { transform: "translate(-10px, 4px)" },
        { transform: "translate(8px,-3px)" },
        { transform: "translate(-6px,2px)" },
        { transform: "translate(0,0)" }
      ],
      { duration: 420, easing: "ease-out" }
    );
  }

  /* ---------------- Textbox ---------------- */

  function showTextbox(show) {
    $("#textbox").classList.toggle("hidden", !show);
  }

  function setName(name, color) {
    const nb = $("#namebox");
    if (!name) {
      nb.textContent = "";
      nb.classList.remove("show");
      return;
    }
    nb.textContent = name;
    nb.style.color = color || "#fff";
    nb.style.borderColor = color ? color + "99" : "rgba(255,214,180,0.4)";
    nb.style.textShadow = "0 0 18px " + (color || "#fff") + "55";
    nb.classList.add("show");
  }

  function hideNext() {
    $("#next-indicator").classList.remove("show");
  }

  function showNext() {
    $("#next-indicator").classList.add("show");
  }

  function typeText(text, cb) {
    const el = $("#text-content");
    clearTimeout(State.typeTimer);
    State.typing = true;
    hideNext();
    if (Config.textSpeed >= 100) {
      el.textContent = text;
      State.typing = false;
      cb && cb();
      return;
    }
    const chars = Array.from(text);
    let i = 0;
    el.textContent = "";
    const speed = Math.max(6, 1000 / Config.textSpeed);
    function step() {
      if (i >= chars.length) {
        State.typing = false;
        cb && cb();
        return;
      }
      el.textContent += chars[i];
      i += 1;
      State.typeTimer = setTimeout(step, speed);
    }
    step();
  }

  function completeText() {
    clearTimeout(State.typeTimer);
    State.typing = false;
    $("#text-content").textContent = State.currentText;
    showNext();
    scheduleAuto();
  }

  function scheduleAuto() {
    clearTimeout(State.autoTimer);
    if (State.auto && State.playing) {
      State.autoTimer = setTimeout(() => {
        if (State.auto && !State.typing && State.playing) advance();
      }, Config.autoDelay);
    }
  }

  /* ---------------- Backlog ---------------- */

  function pushBacklog(speaker, text) {
    if (!text) return;
    State.backlog.push({ speaker: speaker, text: text });
    if (State.backlog.length > 80) State.backlog.shift();
  }

  function markRead(lineId) {
    if (!lineId) return;
    State.read[lineId] = true;
    saveJson(GLOBAL_KEY + "_read", State.read);
  }

  function isRead(lineId) {
    return !!State.read[lineId];
  }

  /* ---------------- Engine ---------------- */

  const DIRECTORIES = {
    prologue: "序章 · 归来的夏天",
    kasumi_1: "霞线 · 观星台",
    yuina_1: "结衣线 · 海滩",
    sion_1: "栞音线 · 灯塔",
    kasumi_2: "霞线 · 星空之下",
    yuina_2: "结衣线 · 浪花之上",
    sion_2: "栞音线 · 灯塔顶端"
  };

  function setChapterForNode(nodeId) {
    if (DIRECTORIES[nodeId]) State.chapterName = DIRECTORIES[nodeId];
    $("#chapter-tag").textContent = State.chapterName;
  }

  function goToNode(nodeId) {
    const node = Story.getNode(nodeId);
    if (!node) {
      console.warn("missing node", nodeId);
      return;
    }
    State.nodeId = nodeId;
    State.lineIndex = 0;
    setChapterForNode(nodeId);
    if (node.routeTheme) {
      State.spriteTheme = node.routeTheme;
      State.emotion = "normal";
    }
    if (node.type === "choice") {
      renderChoice(node);
      killAuto();
      return;
    }
    showTextbox(true);
    playLines();
  }

  function killAuto() {
    clearTimeout(State.autoTimer);
    clearTimeout(State.typeTimer);
  }

  const NODE_FLOW = {
    prologue: "prologue_choice",
    prologue_a: "part2_choice",
    prologue_b: "part2_choice",
    prologue_c: "part2_choice",
    kasumi_1: "kasumi_c",
    kasumi_2: "kasumi_end",
    yuina_1: "yuina_c",
    yuina_2: "yuina_end",
    sion_1: "sion_c",
    sion_2: "sion_end"
  };

  function playLines() {
    const node = Story.getNode(State.nodeId);
    if (!node || node.type !== "lines") return;
    const list = node.list;
    if (State.lineIndex >= list.length) {
      finishNode(State.nodeId);
      return;
    }
    const item = list[State.lineIndex];
    processItem(item);
  }

  function itemIsCommand(item) {
    return Array.isArray(item);
  }

  function processItem(item) {
    State.playing = true;
    if (itemIsCommand(item)) {
      handleCommand(item);
      return;
    }
    showTextbox(true);
    const c = Story.CHARS[item.speaker];
    if (item.theme) State.spriteTheme = item.theme;
    if (item.emotion) State.emotion = item.emotion;
    if (item.pos) State.position = item.pos;
    if (item.speaker && Story.CHARS[item.speaker] && Story.CHARS[item.speaker].theme) {
      State.spriteTheme = Story.CHARS[item.speaker].theme;
    }

    if (State.spriteTheme) updateSprites();

    if (c) {
      setName(c.name, c.color);
    } else {
      setName(null);
    }

    const lineId = State.nodeId + "_" + State.lineIndex;
    markRead(lineId);
    State.currentSpeaker = item.speaker || null;
    State.currentText = item.text || "";
    pushBacklog(c ? c.name : "", item.text);

    const el = $("#text-content");
    el.textContent = "";
    el.className = c ? "" : "narration";

    if (State.skip && isRead(lineId)) {
      State.typeTimer = setTimeout(() => advance(), 30);
      return;
    }

    typeText(item.text, showNext);
    scheduleAuto();
  }

  function handleCommand(cmds) {
    const kind = cmds[0];
    if (kind === "bg") {
      setBackground(cmds[1]);
      State.lineIndex += 1;
      showTextbox(false);
      setTimeout(playLines, 320);
      return;
    }
    if (kind === "effect") {
      if (cmds[1] === "fade") flash();
      if (cmds[1] === "shake") shake();
      State.lineIndex += 1;
      setTimeout(playLines, 260);
      return;
    }
    if (kind === "choice") {
      State.lineIndex += 1;
      goToNode(cmds[1]);
      return;
    }
  }

  function advance() {
    if (!State.playing) return;
    if (State.typing) {
      if (window.Audio2) Audio2.se.click();
      completeText();
      return;
    }
    if (window.Audio2) Audio2.se.click();
    const node = Story.getNode(State.nodeId);
    if (!node || node.type !== "lines") return;
    State.lineIndex += 1;
    if (State.lineIndex >= node.list.length) {
      finishNode(State.nodeId);
      return;
    }
    playLines();
  }

  function finishNode(nodeId) {
    if (NODE_FLOW[nodeId]) {
      const next = NODE_FLOW[nodeId];
      const nextNode = Story.getNode(next);
      if (nextNode && nextNode.type === "choice") {
        State.nodeId = next;
        State.lineIndex = 0;
        renderChoice(nextNode);
      } else {
        goToNode(next);
      }
      return;
    }
    console.warn("no flow for node", nodeId);
    showTitle();
  }

  /* ---------------- Choices ---------------- */

  function renderChoice(node) {
    State.playing = true;
    const layer = $("#choice-layer");
    layer.innerHTML = "";
    const prompt = document.createElement("div");
    prompt.className = "choice-prompt";
    prompt.textContent = node.prompt || "";
    layer.appendChild(prompt);

    node.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = opt.text;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        selectChoice(opt);
      });
      layer.appendChild(btn);
    });
    layer.classList.remove("hidden");
    showTextbox(false);
    setName(null);
    hideNext();
    clearTimeout(State.autoTimer);
    if (State.auto) toggleAuto(false);
    if (State.skip) toggleSkip(false);
  }

  function selectChoice(opt) {
    if (window.Audio2) Audio2.se.select();
    const layer = $("#choice-layer");
    layer.classList.add("hidden");
    layer.innerHTML = "";
    applyEffects(opt.effects);
    State.backlog.push({ speaker: "", text: "▸ 选择：" + opt.text });
    const target = opt.goto;
    if (typeof target === "string") {
      goToNode(target);
    } else if (target && target.end) {
      applyEnding(target.end);
    }
  }

  function applyEffects(eff) {
    if (!eff) return;
    if (eff.affection) {
      Object.keys(eff.affection).forEach((k) => {
        State.affection[k] = (State.affection[k] || 0) + eff.affection[k];
      });
    }
    if (eff.flag) {
      Object.keys(eff.flag).forEach((k) => { State.flags[k] = eff.flag[k]; });
    }
    if (eff.tag) State.flags["route_" + eff.tag] = true;
  }

  /* ---------------- Ending ---------------- */

  function applyEnding(endId) {
    State.playing = false;
    showTextbox(false);
    setName(null);
    const data = Story.ENDINGS[endId];
    if (!data) {
      console.warn("missing ending", endId);
      return;
    }
    State.unlockedEndings[endId] = true;
    const glob = loadJson(GLOBAL_KEY, {});
    glob[endingsKey()] = Object.assign({}, glob[endingsKey()], State.unlockedEndings);
    saveJson(GLOBAL_KEY, glob);

    renderEndingScreen(data, endId);
    if (window.Audio2) Audio2.playEndingBgm();
  }

  function endingsKey() { return "endings"; }

  function renderEndingScreen(data, endId) {
    const typeLabel = { true: "TRUE END", normal: "NORMAL END", secret: "SECRET END" }[data.type] || "END";
    $("#ending-label").textContent = typeLabel;
    $("#ending-title").textContent = data.title;
    $("#ending-text").textContent = data.text;
    const cg = $("#ending-cg");
    uidCounter += 1;
    cg.setAttribute("data-theme", data.theme || "");
    cg.innerHTML = Art.build(data.theme, data.emotion, uidCounter);
    $("#ending-screen").classList.remove("hidden");
    $("#game-screen").classList.add("hidden");
    $("#title-endcount").textContent = countEndings() + " / 9";
  }

  function countEndings() {
    const glob = loadJson(GLOBAL_KEY, {});
    const e = glob[endingsKey()] || {};
    return Object.keys(e).length;
  }

  /* ---------------- Save / Load ---------------- */

  function endingsFromGlobal() {
    const glob = loadJson(GLOBAL_KEY, {});
    return glob[endingsKey()] || {};
  }

  function buildSaveData() {
    return {
      version: 1,
      nodeId: State.nodeId,
      lineIndex: State.lineIndex,
      affection: State.affection,
      flags: State.flags,
      backlog: State.backlog.slice(-40),
      chapterName: State.chapterName,
      spriteTheme: State.spriteTheme,
      emotion: State.emotion,
      position: State.position,
      bgId: State.bgId,
      savedAt: Date.now()
    };
  }

  function saveToSlot(slot) {
    const saves = loadJson(SAVE_KEY, {});
    saves[slot] = buildSaveData();
    saveJson(SAVE_KEY, saves);
    if (slot === "quick") toast("快速存档完成");
  }

  function applySaveData(data) {
    killAuto();
    State.nodeId = data.nodeId;
    State.lineIndex = data.lineIndex;
    State.affection = Object.assign({ kasumi: 0, yuina: 0, sion: 0 }, data.affection || {});
    State.flags = data.flags || {};
    State.backlog = data.backlog || [];
    State.chapterName = data.chapterName || "";
    State.spriteTheme = data.spriteTheme || null;
    State.emotion = data.emotion || "normal";
    State.position = data.position || "center";
    $("#chapter-tag").textContent = State.chapterName;
    if (data.bgId) {
      State.bgId = null;
      activeBg = "a";
      $("#bg-a").classList.remove("active");
      $("#bg-b").classList.remove("active");
      setBackground(data.bgId);
    }
    if (State.spriteTheme) updateSprites();
    hideAllScreens();
    $("#game-screen").classList.remove("hidden");
    $("#title-screen").classList.add("hidden");
    const node = Story.getNode(State.nodeId);
    if (!node) {
      toast("存档数据版本不兼容");
      return;
    }
    if (node.type === "choice") {
      State.playing = true;
      renderChoice(node);
      return;
    }
    State.playing = true;
    State.lineIndex = Math.min(State.lineIndex, node.list.length - 1);
    playLines();
  }

  function loadFromSlot(slot) {
    if (slot === "quick") {
      const d = loadJson(SAVE_KEY, {})["quick"];
      if (!d) { toast("没有快速存档"); return false; }
      applySaveData(d);
      toast("已读取快速存档");
      return true;
    }
    const saves = loadJson(SAVE_KEY, {});
    if (!saves[slot]) return false;
    applySaveData(saves[slot]);
    return true;
  }

  function hasContinue() {
    const saves = loadJson(SAVE_KEY, {});
    return !!saves["quick"];
  }

  /* ---------------- Screens ---------------- */

  function hideAllScreens() {
    $("#title-screen").classList.add("hidden");
    $("#game-screen").classList.add("hidden");
    $("#ending-screen").classList.add("hidden");
    $("#modal-layer").classList.add("hidden");
  }

  function showTitle() {
    killAuto();
    State.playing = false;
    hideAllScreens();
    $("#title-screen").classList.remove("hidden");
    $("#title-endcount").textContent = countEndings() + " / 9";
    $("#sprite-left").innerHTML = "";
    $("#sprite-center").innerHTML = "";
    $("#sprite-right").innerHTML = "";
    if (window.Audio2) Audio2.playTitleBgm();
  }

  function newGame() {
    killAuto();
    State.playing = false;
    State.nodeId = "prologue";
    State.lineIndex = 0;
    State.affection = { kasumi: 0, yuina: 0, sion: 0 };
    State.flags = {};
    State.backlog = [];
    State.spriteTheme = null;
    State.emotion = "normal";
    State.position = "center";
    State.bgId = null;
    activeBg = "a";
    $("#bg-a").classList.remove("active");
    $("#bg-b").classList.remove("active");
    ["left", "center", "right"].forEach((s) => {
      $("#sprite-" + s).innerHTML = "";
      $("#sprite-" + s).classList.remove("show", "dim");
    });
    hideAllScreens();
    $("#game-screen").classList.remove("hidden");
    State.chapterName = DIRECTORIES["prologue"];
    $("#chapter-tag").textContent = State.chapterName;
    State.playing = true;
    State.lineIndex = 0;
    showTextbox(true);
    playLines();
  }

  /* ---------------- Title screen sprites ---------------- */

  function renderTitleSprites() {
    $$(".title-sprite").forEach((el) => {
      const theme = el.dataset.theme;
      uidCounter += 1;
      el.innerHTML = Art.build(theme, "smile", uidCounter);
    });
  }

  /* ---------------- Config ---------------- */

  function loadConfig() {
    const c = loadJson(CONFIG_KEY, null);
    if (c) Object.assign(Config, c);
  }

  function applyConfig() {
    const tb = $("#textbox");
    tb.style.opacity = Config.textboxOpacity;
  }

  function persistConfig() { saveJson(CONFIG_KEY, Config); }

  /* ---------------- Modals ---------------- */

  function openModal(title, html) {
    $("#modal-title").textContent = title;
    $("#modal-body").innerHTML = html;
    $("#modal-layer").classList.remove("hidden");
  }

  function closeModal() {
    $("#modal-layer").classList.add("hidden");
  }

  function openBacklog() {
    openModal("回看 · Backlog", backlogHtml());
  }

  function backlogHtml() {
    if (!State.backlog.length) return "<p>还没有可回看的台词。</p>";
    return State.backlog.map((b) => {
      const color = b.speaker ? (Object.values(Story.CHARS).find((c) => c.name === b.speaker) || {}).color || "#ffd0a8" : "#cfc6d0";
      return `<div class="log-item">${b.speaker ? `<div class="log-name" style="color:${color}">${b.speaker}</div>` : ""}<div class="log-text">${escapeHtml(b.text)}</div></div>`;
    }).join("");
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function openSave(mode) {
    const saves = loadJson(SAVE_KEY, {});
    const slots = [];
    for (let i = 1; i <= 12; i++) slots.push(i);
    const html = slots.map((i) => {
      const d = saves[i];
      if (mode === "load" && !d) {
        return `<div class="slot empty"><div class="slot-no">存档 ${String(i).padStart(2, "0")}</div><div class="slot-chapter">— 空 —</div><div class="slot-time">&nbsp;</div></div>`;
      }
      if (!d) {
        return `<div class="slot" data-slot="${i}" data-mode="save"><div class="slot-no">存档 ${String(i).padStart(2, "0")}</div><div class="slot-chapter">— 空 —</div><div class="slot-time">点击保存</div></div>`;
      }
      const t = new Date(d.savedAt || 0);
      const timeStr = `${t.getMonth() + 1}/${t.getDate()} ${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`;
      return `<div class="slot" data-slot="${i}" data-mode="${mode}"><div class="slot-no">存档 ${String(i).padStart(2, "0")}</div><div class="slot-chapter">${escapeHtml(d.chapterName || "")}</div><div class="slot-time">${timeStr}</div></div>`;
    }).join("");
    openModal(mode === "load" ? "读取存档" : "保存存档", `<div class="slot-grid">${html}</div>`);
    $$("#modal-body .slot[data-slot]").forEach((el) => {
      el.addEventListener("click", () => {
        const slot = el.dataset.slot;
        const m = el.dataset.mode;
        if (m === "save") {
          saveToSlot(slot);
          toast("已保存到存档 " + slot);
          openSave("save");
        } else {
          if (loadFromSlot(slot)) {
            closeModal();
            toast("已读取存档 " + slot);
          }
        }
      });
    });
  }

  function openConfig() {
    const html = `
      <div class="config-row"><label>文字速度</label><div><input type="range" id="cfg-speed" min="10" max="100" value="${Config.textSpeed}"><span class="val" id="cfg-speed-v">${Config.textSpeed}</span></div></div>
      <div class="config-row"><label>自动播放间隔 (ms)</label><div><input type="range" id="cfg-auto" min="600" max="4000" step="100" value="${Config.autoDelay}"><span class="val" id="cfg-auto-v">${Config.autoDelay}</span></div></div>
      <div class="config-row"><label>BGM 音量</label><div><input type="range" id="cfg-bgm" min="0" max="100" value="${Config.bgmVol}"><span class="val" id="cfg-bgm-v">${Config.bgmVol}</span></div></div>
      <div class="config-row"><label>音效音量</label><div><input type="range" id="cfg-se" min="0" max="100" value="${Config.seVol}"><span class="val" id="cfg-se-v">${Config.seVol}</span></div></div>
      <div class="config-row"><label>文本框透明度</label><div><input type="range" id="cfg-op" min="40" max="100" step="5" value="${Math.round(Config.textboxOpacity * 100)}"><span class="val" id="cfg-op-v">${Math.round(Config.textboxOpacity * 100)}</span></div></div>
      <div class="config-row"><label>跳过模式</label><select id="cfg-skip"><option value="read"${Config.skipMode === "read" ? " selected" : ""}>仅跳过已读</option><option value="all"${Config.skipMode === "all" ? " selected" : ""}>全部跳过</option></select></div>
      <div class="config-row"><label>全屏显示</label><label><input type="checkbox" id="cfg-fs"${Config.fullscreen ? " checked" : ""}> 启用</label></div>
    `;
    openModal("设置", html);

    const bind = (id, key, valId, fn) => {
      const input = $("#" + id);
      input.addEventListener("input", () => {
        const v = input.type === "checkbox" ? input.checked : Number(input.value);
        if (valId) $("#" + valId).textContent = v;
        fn(v);
        persistConfig();
        applyConfig();
      });
    };
    bind("cfg-speed", "textSpeed", "cfg-speed-v", (v) => { Config.textSpeed = v; });
    bind("cfg-auto", "autoDelay", "cfg-auto-v", (v) => { Config.autoDelay = v; });
    bind("cfg-bgm", "bgmVol", "cfg-bgm-v", (v) => { Config.bgmVol = v; if (window.Audio2) Audio2.applyVolumes(); });
    bind("cfg-se", "seVol", "cfg-se-v", (v) => { Config.seVol = v; if (window.Audio2) Audio2.applyVolumes(); });
    bind("cfg-op", "textboxOpacity", "cfg-op-v", (v) => { Config.textboxOpacity = v / 100; });
    $("#cfg-skip").addEventListener("change", (e) => { Config.skipMode = e.target.value; persistConfig(); });
    $("#cfg-fs").addEventListener("change", (e) => {
      Config.fullscreen = e.target.checked;
      persistConfig();
      if (Config.fullscreen) {
        document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen && document.fullscreenElement && document.exitFullscreen().catch(() => {});
      }
    });
  }

  function openGallery() {
    const glob = endingsFromGlobal();
    const cards = Object.keys(Story.ENDINGS).map((id) => {
      const d = Story.ENDINGS[id];
      const unlocked = !!glob[id];
      const typeText = { true: "TRUE", normal: "NORMAL", secret: "SECRET" }[d.type] || "END";
      if (!unlocked) {
        return `<div class="ending-card locked"><span class="ec-type ${d.type}">${typeText}</span><div class="ec-title"></div></div>`;
      }
      return `<div class="ending-card"><span class="ec-type ${d.type}">${typeText}</span><div class="ec-title">${escapeHtml(d.title)}</div><div class="ec-text">${escapeHtml(d.text)}</div></div>`;
    }).join("");
    openModal("结局图鉴", `<div class="gallery-tabs"><button class="gal-tab active">结局</button></div><div class="ending-grid">${cards}</div>`);
  }

  function openAffection() {
    const names = { kasumi: "霞", yuina: "结衣", sion: "栞音" };
    const colors = { kasumi: "#f08aa8", yuina: "#7fb6f0", sion: "#f6b968" };
    const html = Object.keys(names).map((k) => {
      const v = State.affection[k] || 0;
      const pct = Math.min(100, (v / 20) * 100);
      return `<div class="aff-item"><span class="aff-name" style="color:${colors[k]}">${names[k]}</span><div class="aff-track"><div class="aff-fill" style="width:${pct}%;background:linear-gradient(90deg,${colors[k]},#ffd6a8)"></div></div><span style="width:2rem;text-align:right;color:#ffd0a8">${v}</span></div>`;
    }).join("");
    openModal("好感度", `<div class="aff-section">${html}</div><div class="affection-bar">数值随选择变化，决定最终结局。</div>`);
  }

  /* ---------------- Toggles ---------------- */

  function toggleAuto(force) {
    State.auto = force === undefined ? !State.auto : force;
    $("#auto-badge").classList.toggle("hidden", !State.auto);
    const btn = $$(".qb").find((b) => b.dataset.action === "auto");
    if (btn) btn.classList.toggle("active", State.auto);
    if (State.auto) scheduleAuto();
    else clearTimeout(State.autoTimer);
  }

  function toggleSkip(force) {
    State.skip = force === undefined ? !State.skip : force;
    $("#skip-badge").classList.toggle("hidden", !State.skip);
    const btn = $$(".qb").find((b) => b.dataset.action === "skip");
    if (btn) btn.classList.toggle("active", State.skip);
    if (State.skip && State.typing) completeText();
    if (State.skip && !State.typing && State.playing) {
      const node = Story.getNode(State.nodeId);
      if (node && node.type === "lines") advance();
    }
  }

  /* ---------------- Events ---------------- */

  function bindGlobalEvents() {
    document.addEventListener("pointerdown", function once() {
      Audio2.unlock();
      Audio2.applyVolumes();
    }, { once: true });

    $("#title-screen").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      Audio2.unlock();
      Audio2.applyVolumes();
      Audio2.se.click();
      const act = btn.dataset.action;
      if (act === "new-game") newGame();
      else if (act === "continue") {
        if (hasContinue()) loadFromSlot("quick");
        else toast("还没有可继续的存档");
      }
      else if (act === "load") openSave("load");
      else if (act === "gallery") openGallery();
      else if (act === "config") openConfig();
    });

    $("#top-bar").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      e.stopPropagation();
      if (window.Audio2) Audio2.se.click();
      const act = btn.dataset.action;
      if (act === "backlog") { if (State.backlog.length) openModal("回看 · Backlog", backlogHtml()); }
      else if (act === "auto") toggleAuto();
      else if (act === "skip") toggleSkip();
      else if (act === "quick-save") saveToSlot("quick");
      else if (act === "quick-load") loadFromSlot("quick");
      else if (act === "save") openSave("save");
      else if (act === "load") openSave("load");
      else if (act === "config") openConfig();
      else if (act === "menu") showTitle();
    });

    $("#ending-screen").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const act = btn.dataset.action;
      if (act === "ending-back") {
        showTitle();
      } else if (act === "ending-gallery") {
        showTitle();
        openGallery();
      }
    });

    $("#modal-layer").addEventListener("click", (e) => {
      if (e.target.id === "modal-layer" || e.target.closest("[data-action='modal-close']")) closeModal();
    });

    $("#viewport").addEventListener("click", (e) => {
      if (e.target.closest("[data-action]") || e.target.closest("#choice-layer") || e.target.closest("#modal-layer")) return;
      if ($("#game-screen").classList.contains("hidden")) return;
      advance();
    });

    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
      const gameVisible = !$("#game-screen").classList.contains("hidden");
      if (!gameVisible) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        advance();
      } else if (e.key === "Escape") {
        openConfig();
      } else if (e.key === "Control") {
        if (!State.skip) toggleSkip(true);
      }
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "Control" && State.skip) toggleSkip(false);
    });

    $("#textbox").addEventListener("click", (e) => {
      e.stopPropagation();
      advance();
    });
  }

  /* ---------------- Boot ---------------- */

  function boot() {
    loadConfig();
    applyConfig();
    renderTitleSprites();
    $("#title-endcount").textContent = countEndings() + " / 9";
    bindGlobalEvents();
    showTitle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.Game = {
    State: State,
    Config: Config,
    newGame: newGame,
    loadFromSlot: loadFromSlot,
    openGallery: openGallery
  };
})();