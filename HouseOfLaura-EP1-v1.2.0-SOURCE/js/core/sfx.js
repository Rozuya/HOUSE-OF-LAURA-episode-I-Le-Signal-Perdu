/* House of Laura · bruitages synthétisés (repli quand audio/sfx/*.ogg est absent) */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function tone(ctx, bus, type, f0, f1, dur, vol, t0, verb) {
    const t = ctx.currentTime + (t0 || 0);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + Math.min(0.01, dur * 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(bus);
    if (verb && HOL.Audio.sfxVerb) { const s = ctx.createGain(); s.gain.value = verb; g.connect(s); s.connect(HOL.Audio.sfxVerb); }
    o.start(t); o.stop(t + dur + 0.05);
    return o;
  }
  function noise(ctx, bus, type, f0, f1, dur, vol, q, t0, verb) {
    const t = ctx.currentTime + (t0 || 0);
    const n = ctx.createBufferSource(); n.buffer = HOL.Audio.noiseBuf;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(f0, t);
    if (f1) f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    f.Q.value = q || 1;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + Math.min(0.015, dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f); f.connect(g); g.connect(bus);
    if (verb && HOL.Audio.sfxVerb) { const s = ctx.createGain(); s.gain.value = verb; g.connect(s); s.connect(HOL.Audio.sfxVerb); }
    n.start(t, Math.random() * 1.5); n.stop(t + dur + 0.05);
  }
  const v = (o, d) => (o && o.vol !== undefined ? o.vol : 1) * d;
  const p = (o) => (o && o.pitch ? o.pitch : 1);

  HOL.Sfx = {
    jump(ctx, bus, o) { tone(ctx, bus, 'sine', 320 * p(o), 620 * p(o), 0.14, v(o, 0.18)); noise(ctx, bus, 'highpass', 3000, 5000, 0.08, v(o, 0.05)); },
    djump(ctx, bus, o) {
      tone(ctx, bus, 'sine', 500, 1100, 0.18, v(o, 0.16), 0, 0.4);
      [0, 0.04, 0.08].forEach((d, i) => tone(ctx, bus, 'triangle', mtof(84 + i * 4), null, 0.25, v(o, 0.05), d, 0.6));
      noise(ctx, bus, 'bandpass', 2500, 6000, 0.2, v(o, 0.06), 2);
    },
    land(ctx, bus, o) { noise(ctx, bus, 'lowpass', 900, 200, 0.12, v(o, 0.25)); tone(ctx, bus, 'sine', 120, 60, 0.1, v(o, 0.15)); },
    step(ctx, bus, o) {
      const s = (o && o.surface) || 'default';
      if (s === 'wood') { tone(ctx, bus, 'triangle', U.rand(180, 230), 120, 0.05, v(o, 0.06)); noise(ctx, bus, 'bandpass', 800, 500, 0.04, v(o, 0.05), 3); }
      else if (s === 'grass') noise(ctx, bus, 'highpass', 2500, 4000, 0.06, v(o, 0.05));
      else if (s === 'water') noise(ctx, bus, 'bandpass', 1400, 700, 0.08, v(o, 0.07), 2);
      else if (s === 'metal') { tone(ctx, bus, 'square', U.rand(400, 500), 300, 0.04, v(o, 0.02)); noise(ctx, bus, 'bandpass', 3000, 2000, 0.05, v(o, 0.04), 5); }
      else noise(ctx, bus, 'bandpass', U.rand(900, 1300), 600, 0.05, v(o, 0.07), 2);
    },
    dash(ctx, bus, o) { noise(ctx, bus, 'bandpass', 600, 4000, 0.22, v(o, 0.3), 1.2); tone(ctx, bus, 'sawtooth', 200, 90, 0.15, v(o, 0.05)); },
    pulse(ctx, bus, o) {
      tone(ctx, bus, 'sine', 90, 40, 0.8, v(o, 0.4), 0, 0.3);
      tone(ctx, bus, 'sine', 660, 330, 0.9, v(o, 0.09), 0, 0.9);
      [0, 0.06, 0.12, 0.18].forEach((d, i) => tone(ctx, bus, 'triangle', mtof(76 + [0, 4, 7, 12][i]), null, 0.6, v(o, 0.05), d, 0.9));
      noise(ctx, bus, 'lowpass', 2000, 200, 0.6, v(o, 0.12));
    },
    collect(ctx, bus, o) {
      const base = 79 + ((o && o.step) || 0);
      [0, 0.06, 0.12].forEach((d, i) => tone(ctx, bus, 'triangle', mtof(base + [0, 4, 7][i]), null, 0.35, v(o, 0.12), d, 0.5));
      tone(ctx, bus, 'sine', mtof(base + 12), null, 0.6, v(o, 0.06), 0.18, 0.8);
    },
    polaroid(ctx, bus, o) {
      noise(ctx, bus, 'highpass', 2000, 1000, 0.05, v(o, 0.3)); noise(ctx, bus, 'bandpass', 1500, 800, 0.12, v(o, 0.15), 1, 0.07);
      [0, 0.1, 0.2, 0.3].forEach((d, i) => tone(ctx, bus, 'sine', mtof(72 + [0, 4, 7, 12][i]), null, 0.7, v(o, 0.1), 0.2 + d, 0.8));
    },
    hurt(ctx, bus, o) { tone(ctx, bus, 'square', 330, 110, 0.25, v(o, 0.12)); noise(ctx, bus, 'lowpass', 1500, 300, 0.25, v(o, 0.2)); },
    door(ctx, bus, o) { noise(ctx, bus, 'lowpass', 600, 200, 0.35, v(o, 0.25)); tone(ctx, bus, 'triangle', 160, 90, 0.2, v(o, 0.1), 0.05); },
    lever(ctx, bus, o) { tone(ctx, bus, 'square', 220, 180, 0.06, v(o, 0.08)); noise(ctx, bus, 'bandpass', 2000, 1200, 0.1, v(o, 0.15), 4, 0.03); tone(ctx, bus, 'triangle', 110, 100, 0.2, v(o, 0.1), 0.08); },
    success(ctx, bus, o) {
      [72, 76, 79, 84].forEach((m, i) => tone(ctx, bus, 'triangle', mtof(m), null, 0.5, v(o, 0.12), i * 0.09, 0.6));
      [84, 88, 91].forEach((m) => tone(ctx, bus, 'sine', mtof(m), null, 1.2, v(o, 0.06), 0.36, 0.9));
    },
    fail(ctx, bus, o) { tone(ctx, bus, 'sawtooth', 180, 90, 0.35, v(o, 0.08)); tone(ctx, bus, 'sawtooth', 185, 92, 0.35, v(o, 0.08)); noise(ctx, bus, 'bandpass', 3000, 3000, 0.25, v(o, 0.08), 6); },
    ability(ctx, bus, o) {
      tone(ctx, bus, 'sine', 55, 110, 2.0, v(o, 0.25), 0, 0.5);
      [60, 64, 67, 71, 74, 79, 83, 86].forEach((m, i) => tone(ctx, bus, 'triangle', mtof(m + 12), null, 1.4, v(o, 0.07), i * 0.08, 0.9));
      noise(ctx, bus, 'highpass', 4000, 9000, 1.8, v(o, 0.05), 1, 0.3, 0.8);
    },
    reconnect(ctx, bus, o) {
      tone(ctx, bus, 'sine', 200, 800, 0.6, v(o, 0.1), 0, 0.6);
      [67, 71, 74, 79].forEach((m, i) => tone(ctx, bus, 'sine', mtof(m + 5), null, 0.9, v(o, 0.08), 0.25 + i * 0.07, 0.9));
    },
    splash(ctx, bus, o) { noise(ctx, bus, 'lowpass', 3000, 400, 0.4, v(o, 0.3)); noise(ctx, bus, 'bandpass', 1200, 600, 0.3, v(o, 0.15), 2, 0.05); },
    break(ctx, bus, o) { noise(ctx, bus, 'lowpass', 2500, 150, 0.5, v(o, 0.45)); tone(ctx, bus, 'sine', 90, 35, 0.4, v(o, 0.3)); noise(ctx, bus, 'bandpass', 900, 400, 0.3, v(o, 0.2), 3, 0.1); },
    fire(ctx, bus, o) { noise(ctx, bus, 'lowpass', 400, 2500, 0.5, v(o, 0.3)); noise(ctx, bus, 'bandpass', 800, 300, 0.6, v(o, 0.15), 1, 0.2); },
    menu_move(ctx, bus, o) { tone(ctx, bus, 'sine', 880, 880, 0.05, v(o, 0.06)); },
    menu_ok(ctx, bus, o) { tone(ctx, bus, 'triangle', 660, 660, 0.08, v(o, 0.1)); tone(ctx, bus, 'triangle', 990, 990, 0.12, v(o, 0.08), 0.06); },
    menu_back(ctx, bus, o) { tone(ctx, bus, 'triangle', 660, 440, 0.12, v(o, 0.08)); },
    enemy(ctx, bus, o) { noise(ctx, bus, 'bandpass', 1800, 300, 0.3, v(o, 0.2), 3); tone(ctx, bus, 'sine', 600, 150, 0.25, v(o, 0.08)); },
    boss_hit(ctx, bus, o) { tone(ctx, bus, 'sawtooth', 110, 40, 0.8, v(o, 0.2), 0, 0.5); noise(ctx, bus, 'lowpass', 3000, 100, 1.0, v(o, 0.35), 1, 0, 0.6); },
    thunder(ctx, bus, o) { noise(ctx, bus, 'lowpass', 1200, 80, 2.2, v(o, 0.5), 0.7, 0, 0.8); noise(ctx, bus, 'lowpass', 400, 60, 2.8, v(o, 0.35), 0.5, 0.25, 0.8); },
    blip(ctx, bus, o) {
      const f = (o && o.freq) || 440;
      tone(ctx, bus, (o && o.wave) || 'triangle', f * U.rand(0.96, 1.05), f * 0.9, 0.05, v(o, 0.05));
    },
    beep(ctx, bus, o) {
      const f = (o && o.freq) || 1200;
      tone(ctx, bus, 'sine', f, f, 0.06, v(o, 0.06), 0, 0.3); tone(ctx, bus, 'sine', f * 1.5, f * 1.5, 0.06, v(o, 0.05), 0.07, 0.3);
    },
    lamp(ctx, bus, o) { tone(ctx, bus, 'sine', mtof((o && o.note) || 72), null, 1.2, v(o, 0.12), 0, 0.8); noise(ctx, bus, 'highpass', 5000, 8000, 0.15, v(o, 0.05)); },
    crystal(ctx, bus, o) {
      const m = (o && o.note) || 76;
      tone(ctx, bus, 'sine', mtof(m), null, 2.0, v(o, 0.18), 0, 1.0); tone(ctx, bus, 'sine', mtof(m + 12), null, 1.4, v(o, 0.06), 0, 1.0);
      tone(ctx, bus, 'triangle', mtof(m + 19), null, 0.8, v(o, 0.03), 0.01, 1.0);
    },
    spring(ctx, bus, o) { tone(ctx, bus, 'sine', 200, 900, 0.25, v(o, 0.18)); tone(ctx, bus, 'triangle', 300, 1200, 0.2, v(o, 0.06), 0.03); },
    crumble(ctx, bus, o) { noise(ctx, bus, 'bandpass', 700, 300, 0.4, v(o, 0.2), 1.5); },
    water_rise(ctx, bus, o) { noise(ctx, bus, 'lowpass', 300, 900, 2.5, v(o, 0.25), 1); tone(ctx, bus, 'sine', 60, 90, 2.5, v(o, 0.12)); },
    static(ctx, bus, o) { noise(ctx, bus, 'bandpass', 3000, 2500, (o && o.dur) || 0.6, v(o, 0.15), 0.5); },
    heart(ctx, bus, o) { [60, 64, 67, 72, 76].forEach((m, i) => tone(ctx, bus, 'triangle', mtof(m + 12), null, 0.6, v(o, 0.1), i * 0.07, 0.7)); },
    whoosh(ctx, bus, o) { noise(ctx, bus, 'bandpass', 300, 2000, 0.6, v(o, 0.2), 0.8); },
    radio(ctx, bus, o) { noise(ctx, bus, 'bandpass', 2500, 2000, 0.25, v(o, 0.12), 2); tone(ctx, bus, 'square', 1400, 1400, 0.05, v(o, 0.03), 0.2); },
    meow(ctx, bus, o) { tone(ctx, bus, 'sawtooth', 700, 1000, 0.12, v(o, 0.05)); tone(ctx, bus, 'sawtooth', 1000, 600, 0.3, v(o, 0.05), 0.12); },
    heal(ctx, bus, o) { [72, 79, 84].forEach((m, i) => tone(ctx, bus, 'sine', mtof(m), null, 0.8, v(o, 0.08), i * 0.1, 0.9)); }
  };
})();
