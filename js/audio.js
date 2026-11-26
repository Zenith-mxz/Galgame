(function () {
  "use strict";

  let ctx = null;
  let masterBgm = null;
  let masterSe = null;
  let unlocked = false;

  const BGM_VOL_DEFAULT = 60;
  const SE_VOL_DEFAULT = 60;

  function getConfig() {
    return (window.Game && window.Game.Config) || { bgmVol: BGM_VOL_DEFAULT, seVol: SE_VOL_DEFAULT };
  }

  function bgmGainValue() {
    return Math.max(0, Math.min(1, (getConfig().bgmVol || 0) / 100));
  }
  function seGainValue() {
    return Math.max(0, Math.min(1, (getConfig().seVol || 0) / 100));
  }

  function ensureCtx() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    masterBgm = ctx.createGain();
    masterSe = ctx.createGain();
    masterBgm.gain.value = bgmGainValue();
    masterSe.gain.value = seGainValue();
    masterBgm.connect(ctx.destination);
    masterSe.connect(ctx.destination);
    return ctx;
  }

  function unlock() {
    const c = ensureCtx();
    if (!c) return;
    unlocked = true;
    if (c.state === "suspended") c.resume().catch(() => {});
    if (currentTrack) startTrack(currentTrack, true);
  }

  function applyVolumes() {
    if (!ctx) return;
    masterBgm.gain.setTargetAtTime(bgmGainValue(), ctx.currentTime, 0.1);
    masterSe.gain.setTargetAtTime(seGainValue(), ctx.currentTime, 0.1);
  }

  /* ---------------- Sound effects ---------------- */

  function blip(freq, dur, type, vol, when) {
    const c = ensureCtx();
    if (!c) return;
    const t = when === undefined ? c.currentTime : when;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol || 0.5, t + dur * 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(masterSe);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  const SE = {
    click: function () {
      if (seGainValue() <= 0) return;
      blip(660, 0.09, "triangle", 0.35);
      blip(990, 0.07, "sine", 0.18, (ctx ? ctx.currentTime + 0.02 : undefined));
    },
    select: function () {
      if (seGainValue() <= 0) return;
      const c = ensureCtx();
      if (!c) return;
      blip(520, 0.12, "triangle", 0.4);
      blip(780, 0.14, "sine", 0.3, c.currentTime + 0.06);
      blip(1040, 0.16, "sine", 0.2, c.currentTime + 0.13);
    },
    heart: function () {
      if (seGainValue() <= 0) return;
      const c = ensureCtx();
      if (!c) return;
      blip(880, 0.18, "sine", 0.35);
      blip(1320, 0.2, "sine", 0.25, c.currentTime + 0.08);
    }
  };

  /* ---------------- BGM tracks ---------------- */

  const NOTE = {
    A2: 110.0, B2: 123.47, C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0,
    A3: 220.0, B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0,
    A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99
  };

  const TRACKS = {
    title: {
      pad: { freq: NOTE.A3, type: "sine", vol: 0.16 },
      lead: [["C5", 0.35], ["E5", 0.2], ["C5", 0.25], ["A4", 0.45], ["G4", 0.3], ["E4", 0.4], ["D4", 0.3], ["E4", 0.35]],
      tempo: 1.9,
      wave: "sine",
      leadVol: 0.12
    },
    station: {
      pad: { freq: NOTE.E3, type: "sine", vol: 0.14 },
      lead: [["E4", 0.3], ["G4", 0.25], ["B4", 0.3], ["A4", 0.4], ["G4", 0.3], ["E4", 0.35], ["D4", 0.3], ["E4", 0.4]],
      tempo: 1.7,
      wave: "triangle",
      leadVol: 0.1
    },
    boardwalk: {
      pad: { freq: NOTE.D3, type: "sine", vol: 0.13 },
      lead: [["F4", 0.3], ["A4", 0.25], ["C5", 0.3], ["A4", 0.35], ["G4", 0.3], ["F4", 0.4], ["D4", 0.3], ["A3", 0.35]],
      tempo: 1.6,
      wave: "triangle",
      leadVol: 0.1
    },
    clubroom: {
      pad: { freq: NOTE.F3, type: "sine", vol: 0.12 },
      lead: [["A4", 0.3], ["C5", 0.3], ["E5", 0.35], ["C5", 0.3], ["A4", 0.4], ["G4", 0.3], ["E4", 0.35], ["C4", 0.4]],
      tempo: 2.0,
      wave: "sine",
      leadVol: 0.09
    },
    beach: {
      pad: { freq: NOTE.G3, type: "sine", vol: 0.14 },
      lead: [["B4", 0.3], ["D5", 0.3], ["G5", 0.4], ["E5", 0.35], ["D5", 0.3], ["B4", 0.45], ["A4", 0.3], ["G4", 0.4]],
      tempo: 1.8,
      wave: "triangle",
      leadVol: 0.11
    },
    stairs: {
      pad: { freq: NOTE.C3, type: "sine", vol: 0.13 },
      lead: [["E4", 0.3], ["G4", 0.3], ["C5", 0.4], ["G4", 0.3], ["E4", 0.4], ["F4", 0.3], ["G4", 0.35], ["C4", 0.4]],
      tempo: 1.9,
      wave: "triangle",
      leadVol: 0.1
    },
    lighthouse: {
      pad: { freq: NOTE.A2, type: "sine", vol: 0.12 },
      lead: [["C4", 0.35], ["E4", 0.3], ["A4", 0.4], ["G4", 0.3], ["E4", 0.4], ["D4", 0.35], ["C4", 0.4], ["A3", 0.45]],
      tempo: 2.0,
      wave: "sine",
      leadVol: 0.09
    },
    sky: {
      pad: { freq: NOTE.E3, type: "sine", vol: 0.15 },
      lead: [["G4", 0.3], ["B4", 0.3], ["D5", 0.4], ["E5", 0.4], ["D5", 0.35], ["B4", 0.4], ["G4", 0.3], ["A4", 0.4]],
      tempo: 2.1,
      wave: "sine",
      leadVol: 0.1
    },
    ending: {
      pad: { freq: NOTE.C3, type: "sine", vol: 0.16 },
      lead: [["C5", 0.5], ["G4", 0.4], ["E4", 0.4], ["C4", 0.5], ["E4", 0.4], ["G4", 0.5], ["C5", 0.6], ["E5", 0.5]],
      tempo: 2.2,
      wave: "sine",
      leadVol: 0.11
    }
  };

  const BG_TO_TRACK = {
    station: "station",
    boardwalk: "boardwalk",
    classroom: "clubroom",
    clubroom: "clubroom",
    rooftop: "boardwalk",
    beach: "beach",
    room: "clubroom",
    festival: "boardwalk",
    stairs: "stairs",
    lighthouse: "lighthouse",
    sky: "sky"
  };

  let currentTrack = null;
  let padOsc = null;
  let padGain = null;
  let seqTimer = null;
  let sustained = [];

  function stopTrack(fade) {
    const c = ctx;
    if (!c) return;
    fade = fade === undefined ? 0.6 : fade;
    if (seqTimer) { clearInterval(seqTimer); seqTimer = null; }
    if (padOsc) {
      try {
        padGain.gain.setTargetAtTime(0, c.currentTime, fade / 3);
        padOsc.stop(c.currentTime + fade);
      } catch (e) {}
    }
    sustained.forEach((n) => {
      try {
        n.g.gain.setTargetAtTime(0, c.currentTime, fade / 3);
        n.o.stop(c.currentTime + fade);
      } catch (e) {}
    });
    padOsc = null;
    padGain = null;
    sustained = [];
  }

  function startTrack(trackId, immediate) {
    const c = ctx;
    if (!c) return;
    const track = TRACKS[trackId];
    if (!track) return;
    stopTrack(immediate ? 0.02 : 0.7);
    const fade = immediate ? 0.05 : 0.9;

    padGain = c.createGain();
    padGain.gain.setValueAtTime(0, c.currentTime);
    padGain.gain.setTargetAtTime(track.pad.vol, c.currentTime, fade / 3);
    padGain.connect(masterBgm);

    padOsc = c.createOscillator();
    padOsc.type = track.pad.type;
    padOsc.frequency.value = track.pad.freq;
    padOsc.connect(padGain);
    padOsc.start();
    sustained.push({ o: padOsc, g: padGain });

    let step = 0;
    const scheduleNote = (name, dur, wave, vol) => {
      const freq = NOTE[name];
      if (!freq) return;
      const t = c.currentTime + 0.02;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + dur * 0.25);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g);
      g.connect(masterBgm);
      osc.start(t);
      osc.stop(t + dur + 0.03);
    };

    const beat = () => {
      const item = track.lead[step % track.lead.length];
      const dur = item[1] * track.tempo;
      scheduleNote(item[0], dur, track.wave, track.leadVol);
      step += 1;
    };
    beat();
    seqTimer = setInterval(beat, (track.tempo * 1000) / 2);
  }

  function playBgmForBg(bgId) {
    const track = BG_TO_TRACK[bgId] || "station";
    if (!unlocked) { currentTrack = track; return; }
    if (track === currentTrack && padOsc) return;
    currentTrack = track;
    startTrack(track, false);
  }

  function playTitleBgm() {
    if (!unlocked) { currentTrack = "title"; return; }
    currentTrack = "title";
    startTrack("title", false);
  }

  function playEndingBgm() {
    if (!unlocked) { currentTrack = "ending"; return; }
    currentTrack = "ending";
    startTrack("ending", false);
  }

  function stopBgm() {
    currentTrack = null;
    stopTrack(0.5);
  }

  window.Audio2 = {
    unlock: unlock,
    applyVolumes: applyVolumes,
    se: SE,
    playBgmForBg: playBgmForBg,
    playTitleBgm: playTitleBgm,
    playEndingBgm: playEndingBgm,
    stopBgm: stopBgm
  };
})();