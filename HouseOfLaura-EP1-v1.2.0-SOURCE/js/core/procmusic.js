/* House of Laura · musique procédurale de secours (WebAudio)
 * Utilisée UNIQUEMENT quand le fichier audio de la piste est absent.
 * Chaque piste = un petit morceau génératif (accords, arpèges, basse, mélodie, batterie).
 */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U;

  const CH = {
    maj: [0, 4, 7], min: [0, 3, 7], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], dom7: [0, 4, 7, 10],
    sus2: [0, 2, 7], sus4: [0, 5, 7], add9: [0, 4, 7, 14], m9: [0, 3, 7, 10, 14], dim: [0, 3, 6], m6: [0, 3, 7, 9], maj9: [0, 4, 7, 11, 14]
  };
  const SC = {
    major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11], phrygian: [0, 1, 3, 5, 7, 8, 10], pent: [0, 2, 4, 7, 9], minpent: [0, 3, 5, 7, 10],
    whole: [0, 2, 4, 6, 8, 10], harm: [0, 2, 3, 5, 7, 8, 11]
  };
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // ----------------------------------------------------------------
  // Définition des morceaux
  // prog : [décalage en demi-tons depuis la tonique, qualité]
  // ----------------------------------------------------------------
  const SONGS = {
    menu: {
      bpm: 70, root: 50, scale: 'major', bars: 2,
      prog: [[0, 'maj9'], [9, 'm9'], [5, 'maj9'], [7, 'sus4']],
      pad: { inst: 'pad', vol: 0.13 }, arp: { inst: 'bell', vol: 0.05, rate: 4, oct: 2, pattern: [0, 2, 1, 3] },
      lead: { inst: 'bell', vol: 0.07, oct: 2, density: 0.35, seed: 11 }, bass: { inst: 'sub', vol: 0.16, pattern: 'long' },
      verb: 0.6, cutoff: 2600
    },
    maison: {
      bpm: 84, root: 53, scale: 'major', bars: 1, swing: 0.12,
      prog: [[0, 'maj7'], [-1, 'm7'], [-3, 'm7'], [-5, 'maj7']],
      pad: { inst: 'epiano', vol: 0.09, rhythm: [0, 6, 10] }, arp: null,
      lead: { inst: 'epiano', vol: 0.07, oct: 1, density: 0.4, seed: 5 },
      bass: { inst: 'bass', vol: 0.15, pattern: 'lofi' },
      drums: { kick: [0, 7, 10], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], vol: 0.5, lofi: true },
      verb: 0.35, cutoff: 1900
    },
    maison_noir: {
      bpm: 60, root: 45, scale: 'minor', bars: 2,
      prog: [[0, 'min'], [-4, 'maj'], [-2, 'sus2'], [0, 'min']],
      pad: { inst: 'pad', vol: 0.12 }, arp: { inst: 'pluck', vol: 0.035, rate: 2, oct: 2, pattern: [0, 2] },
      lead: null, bass: { inst: 'sub', vol: 0.14, pattern: 'long' }, drone: { note: 33, vol: 0.05 },
      verb: 0.7, cutoff: 1200
    },
    quartier: {
      bpm: 88, root: 57, scale: 'minor', bars: 1,
      prog: [[0, 'm7'], [-4, 'maj7'], [3, 'maj'], [-2, 'sus2']],
      pad: { inst: 'pad', vol: 0.1 }, arp: { inst: 'pluck', vol: 0.06, rate: 8, oct: 1, pattern: [0, 1, 2, 1, 3, 2, 1, 2] },
      lead: { inst: 'bell', vol: 0.05, oct: 2, density: 0.25, seed: 23 }, bass: { inst: 'bass', vol: 0.13, pattern: 'root4' },
      drums: { kick: [0, 8], snare: [], hat: [4, 12], vol: 0.25 },
      verb: 0.5, cutoff: 1800
    },
    quartier_fete: {
      bpm: 108, root: 57, scale: 'dorian', bars: 1, swing: 0.1,
      prog: [[0, 'm7'], [5, 'dom7'], [0, 'm7'], [5, 'dom7'], [3, 'maj7'], [2, 'm7'], [-2, 'maj'], [-2, 'sus4']],
      pad: { inst: 'epiano', vol: 0.08, rhythm: [0, 3, 6, 10, 14] }, arp: { inst: 'pluck', vol: 0.05, rate: 8, oct: 2, pattern: [0, 2, 1, 3, 2, 1, 3, 0] },
      lead: { inst: 'lead', vol: 0.06, oct: 1, density: 0.55, seed: 77 }, bass: { inst: 'bass', vol: 0.17, pattern: 'funk' },
      drums: { kick: [0, 6, 10], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], open: [14], vol: 0.6 },
      verb: 0.3, cutoff: 3200
    },
    foret: {
      bpm: 76, root: 52, scale: 'dorian', bars: 2,
      prog: [[0, 'm9'], [5, 'maj7'], [3, 'add9'], [-2, 'sus2']],
      pad: { inst: 'pad', vol: 0.1 }, arp: { inst: 'harp', vol: 0.06, rate: 6, oct: 1, pattern: [0, 1, 2, 3, 2, 1] },
      lead: { inst: 'flute', vol: 0.07, oct: 2, density: 0.4, seed: 31 }, bass: { inst: 'sub', vol: 0.13, pattern: 'long' },
      drums: { kick: [], snare: [], hat: [], shaker: [2, 6, 10, 14], vol: 0.25 },
      verb: 0.65, cutoff: 2200
    },
    riviere: {
      bpm: 92, root: 55, scale: 'lydian', bars: 1,
      prog: [[0, 'maj7'], [2, 'maj'], [-3, 'm7'], [-5, 'maj9']],
      pad: { inst: 'pad', vol: 0.09 }, arp: { inst: 'harp', vol: 0.055, rate: 16, oct: 1, pattern: [0, 1, 2, 3, 4, 3, 2, 1] },
      lead: { inst: 'bell', vol: 0.05, oct: 2, density: 0.3, seed: 41 }, bass: { inst: 'bass', vol: 0.12, pattern: 'root2' },
      drums: { kick: [0], snare: [], hat: [], shaker: [0, 4, 8, 12], vol: 0.2 },
      verb: 0.55, cutoff: 3000
    },
    grotte: {
      bpm: 58, root: 43, scale: 'phrygian', bars: 4,
      prog: [[0, 'min'], [1, 'maj'], [0, 'sus2'], [-2, 'min']],
      pad: { inst: 'pad', vol: 0.12 }, arp: null,
      lead: { inst: 'drop', vol: 0.06, oct: 3, density: 0.18, seed: 53 }, bass: { inst: 'sub', vol: 0.16, pattern: 'long' },
      drone: { note: 31, vol: 0.06 }, verb: 0.9, cutoff: 900
    },
    mystere: {
      bpm: 64, root: 49, scale: 'whole', bars: 2,
      prog: [[0, 'maj'], [2, 'maj'], [-2, 'maj'], [4, 'dim']],
      pad: { inst: 'pad', vol: 0.11 }, arp: { inst: 'bell', vol: 0.045, rate: 4, oct: 2, pattern: [0, 2, 1, 2] },
      lead: { inst: 'glass', vol: 0.05, oct: 2, density: 0.3, seed: 61 }, bass: { inst: 'sub', vol: 0.13, pattern: 'long' },
      drone: { note: 37, vol: 0.05 }, verb: 0.85, cutoff: 1500
    },
    tension: {
      bpm: 124, root: 50, scale: 'harm', bars: 1,
      prog: [[0, 'min'], [0, 'min'], [-4, 'maj'], [-5, 'maj'], [0, 'min'], [1, 'maj'], [-2, 'maj'], [-5, 'dom7']],
      pad: { inst: 'strings', vol: 0.08 }, arp: { inst: 'pluck', vol: 0.06, rate: 16, oct: 1, pattern: [0, 0, 2, 0, 1, 0, 2, 1] },
      lead: null, bass: { inst: 'bass', vol: 0.17, pattern: 'eighths' },
      drums: { kick: [0, 3, 8, 11], snare: [4, 12], hat: [2, 6, 10, 14], tom: [14, 15], vol: 0.6 },
      verb: 0.4, cutoff: 2600
    },
    climax: {
      bpm: 140, root: 52, scale: 'minor', bars: 1,
      prog: [[0, 'min'], [-4, 'maj'], [-9, 'maj'], [-2, 'maj'], [0, 'min'], [-4, 'maj'], [-7, 'maj'], [-5, 'dom7']],
      pad: { inst: 'strings', vol: 0.09 }, arp: { inst: 'pluck', vol: 0.06, rate: 16, oct: 2, pattern: [0, 1, 2, 3, 2, 1, 2, 3] },
      lead: { inst: 'lead', vol: 0.075, oct: 1, density: 0.6, seed: 97 }, bass: { inst: 'bass', vol: 0.18, pattern: 'eighths' },
      drums: { kick: [0, 4, 8, 10, 12], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], tom: [13, 14, 15], vol: 0.75 },
      verb: 0.4, cutoff: 3600
    },
    fin: {
      bpm: 78, root: 48, scale: 'major', bars: 2,
      prog: [[0, 'add9'], [7, 'maj'], [9, 'm7'], [5, 'maj7'], [0, 'maj'], [4, 'm7'], [5, 'maj9'], [7, 'sus4']],
      pad: { inst: 'strings', vol: 0.1 }, arp: { inst: 'harp', vol: 0.05, rate: 8, oct: 1, pattern: [0, 1, 2, 3, 4, 3, 2, 1] },
      lead: { inst: 'epiano', vol: 0.08, oct: 2, density: 0.45, seed: 101 }, bass: { inst: 'sub', vol: 0.14, pattern: 'root2' },
      drums: { kick: [0, 10], snare: [8], hat: [], shaker: [4, 12], vol: 0.3 },
      verb: 0.6, cutoff: 3000
    },
    teaser: {
      bpm: 60, root: 47, scale: 'harm', bars: 4,
      prog: [[0, 'min'], [-4, 'maj'], [1, 'maj'], [-1, 'dim']],
      pad: { inst: 'pad', vol: 0.12 }, arp: { inst: 'glass', vol: 0.04, rate: 2, oct: 2, pattern: [0, 2] },
      lead: null, bass: { inst: 'sub', vol: 0.15, pattern: 'long' }, drone: { note: 35, vol: 0.06 },
      verb: 0.9, cutoff: 1100
    }
  };

  // ----------------------------------------------------------------
  // Instruments (synthèse)
  // ----------------------------------------------------------------
  function env(g, t, a, d, s, r, dur, peak) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setTargetAtTime(peak * s, t + a, d / 3 + 0.001);
    g.gain.setTargetAtTime(0.0001, t + Math.max(dur, a + 0.01), r / 3 + 0.001);
  }
  function osc(ctx, type, f, t, stop, detune) {
    const o = ctx.createOscillator();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (detune) o.detune.setValueAtTime(detune, t);
    o.start(t); o.stop(stop);
    return o;
  }
  const INST = {
    pad(s, t, m, dur, vel) {
      const ctx = s.ctx, f = mtof(m), end = t + dur + 1.8;
      const g = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = s.def.cutoff * 0.6; lp.Q.value = 0.4;
      env(g, t, 0.9, 1.0, 0.8, 1.6, dur, vel);
      for (const d of [-7, 7]) osc(ctx, 'sawtooth', f, t, end, d).connect(lp);
      osc(ctx, 'triangle', f / 2, t, end).connect(lp);
      lp.connect(g); s.out(g, 0.6);
    },
    strings(s, t, m, dur, vel) {
      const ctx = s.ctx, f = mtof(m), end = t + dur + 1.2;
      const g = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = s.def.cutoff * 0.8;
      env(g, t, 0.35, 0.6, 0.85, 0.9, dur, vel);
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 5; lg.gain.value = 6; lfo.connect(lg); lfo.start(t); lfo.stop(end);
      for (const d of [-9, 0, 9]) { const o = osc(ctx, 'sawtooth', f, t, end, d); lg.connect(o.detune); o.connect(lp); }
      lp.connect(g); s.out(g, 0.5);
    },
    epiano(s, t, m, dur, vel) {
      const ctx = s.ctx, f = mtof(m), end = t + dur + 1.2;
      const g = ctx.createGain();
      env(g, t, 0.005, 0.8, 0.35, 0.8, dur, vel);
      const car = osc(ctx, 'sine', f, t, end);
      const mod = osc(ctx, 'sine', f * 2, t, end);
      const mg = ctx.createGain(); mg.gain.setValueAtTime(f * 1.4, t); mg.gain.exponentialRampToValueAtTime(f * 0.1, t + 0.6);
      mod.connect(mg); mg.connect(car.frequency);
      car.connect(g); s.out(g, 0.35);
    },
    bell(s, t, m, dur, vel) {
      const ctx = s.ctx, f = mtof(m), end = t + 2.5;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
      [[1, 1], [2.76, 0.35], [5.4, 0.15]].forEach(([r, a]) => {
        const o = osc(ctx, 'sine', f * r, t, end); const og = ctx.createGain(); og.gain.value = a; o.connect(og); og.connect(g);
      });
      s.out(g, 0.8);
    },
    glass(s, t, m, dur, vel) {
      const ctx = s.ctx, f = mtof(m), end = t + 3;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
      osc(ctx, 'sine', f, t, end).connect(g); osc(ctx, 'sine', f * 1.5, t, end, 4).connect(g);
      s.out(g, 1);
    },
    drop(s, t, m, dur, vel) {
      const ctx = s.ctx, f = mtof(m), end = t + 1.2;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
      const o = osc(ctx, 'sine', f * 1.3, t, end); o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
      o.connect(g); s.out(g, 1);
    },
    pluck(s, t, m, dur, vel) {
      const ctx = s.ctx, f = mtof(m), end = t + 0.9;
      const g = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(s.def.cutoff * 1.4, t); lp.frequency.exponentialRampToValueAtTime(300, t + 0.4);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      osc(ctx, 'triangle', f, t, end).connect(lp); osc(ctx, 'square', f, t, end, 5).connect(lp);
      lp.connect(g); s.out(g, 0.35);
    },
    harp(s, t, m, dur, vel) {
      const ctx = s.ctx, f = mtof(m), end = t + 1.6;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
      osc(ctx, 'triangle', f, t, end).connect(g);
      const o2 = osc(ctx, 'sine', f * 2, t, end); const g2 = ctx.createGain(); g2.gain.value = 0.3; o2.connect(g2); g2.connect(g);
      s.out(g, 0.5);
    },
    flute(s, t, m, dur, vel) {
      const ctx = s.ctx, f = mtof(m), end = t + dur + 0.6;
      const g = ctx.createGain();
      env(g, t, 0.08, 0.2, 0.8, 0.25, dur, vel);
      const o = osc(ctx, 'sine', f, t, end);
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 5.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.012, t + 0.4);
      lfo.connect(lg); lg.connect(o.frequency); lfo.start(t); lfo.stop(end);
      o.connect(g);
      const n = ctx.createBufferSource(); n.buffer = HOL.Audio.noiseBuf; const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f * 2; bp.Q.value = 8;
      const ng = ctx.createGain(); ng.gain.value = 0.12; n.connect(bp); bp.connect(ng); ng.connect(g); n.start(t); n.stop(end);
      s.out(g, 0.6);
    },
    lead(s, t, m, dur, vel) {
      const ctx = s.ctx, f = mtof(m), end = t + dur + 0.5;
      const g = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.Q.value = 3; lp.frequency.setValueAtTime(600, t); lp.frequency.linearRampToValueAtTime(s.def.cutoff, t + 0.08); lp.frequency.setTargetAtTime(1200, t + 0.1, 0.3);
      env(g, t, 0.02, 0.3, 0.6, 0.3, dur, vel);
      osc(ctx, 'sawtooth', f, t, end, -6).connect(lp); osc(ctx, 'sawtooth', f, t, end, 6).connect(lp);
      lp.connect(g); s.out(g, 0.35);
    },
    bass(s, t, m, dur, vel) {
      const ctx = s.ctx, f = mtof(m), end = t + dur + 0.3;
      const g = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(220, t + 0.25);
      env(g, t, 0.01, 0.2, 0.7, 0.12, dur * 0.9, vel);
      osc(ctx, 'sawtooth', f, t, end).connect(lp); osc(ctx, 'sine', f, t, end).connect(g);
      lp.connect(g); s.out(g, 0.05);
    },
    sub(s, t, m, dur, vel) {
      const ctx = s.ctx, f = mtof(m), end = t + dur + 1;
      const g = ctx.createGain();
      env(g, t, 0.3, 0.5, 0.8, 0.8, dur, vel);
      osc(ctx, 'sine', f, t, end).connect(g); osc(ctx, 'triangle', f * 2, t, end).connect(g);
      s.out(g, 0.05);
    },
    // ---- batterie ----
    kick(s, t, vel) {
      const ctx = s.ctx, g = ctx.createGain();
      g.gain.setValueAtTime(vel, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      const o = osc(ctx, 'sine', 140, t, t + 0.4); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      o.connect(g); s.out(g, 0);
    },
    snare(s, t, vel) {
      const ctx = s.ctx, g = ctx.createGain();
      g.gain.setValueAtTime(vel * 0.7, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      const n = ctx.createBufferSource(); n.buffer = HOL.Audio.noiseBuf;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = s.def.drums.lofi ? 1400 : 2200; bp.Q.value = 0.8;
      n.connect(bp); bp.connect(g); n.start(t, Math.random()); n.stop(t + 0.2);
      const o = osc(ctx, 'triangle', 190, t, t + 0.1); const og = ctx.createGain(); og.gain.setValueAtTime(vel * 0.5, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      o.connect(og); og.connect(g);
      s.out(g, 0.25);
    },
    hat(s, t, vel, open) {
      const ctx = s.ctx, g = ctx.createGain();
      const len = open ? 0.25 : 0.045;
      g.gain.setValueAtTime(vel * 0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
      const n = ctx.createBufferSource(); n.buffer = HOL.Audio.noiseBuf;
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = s.def.drums.lofi ? 6000 : 7500;
      n.connect(hp); hp.connect(g); n.start(t, Math.random()); n.stop(t + len + 0.02);
      s.out(g, 0.1);
    },
    shaker(s, t, vel) {
      const ctx = s.ctx, g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vel * 0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      const n = ctx.createBufferSource(); n.buffer = HOL.Audio.noiseBuf;
      const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 5500; bp.Q.value = 1.5;
      n.connect(bp); bp.connect(g); n.start(t, Math.random()); n.stop(t + 0.12);
      s.out(g, 0.2);
    },
    tom(s, t, vel, i) {
      const ctx = s.ctx, g = ctx.createGain();
      g.gain.setValueAtTime(vel * 0.8, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      const f0 = [180, 140, 110][i % 3];
      const o = osc(ctx, 'sine', f0, t, t + 0.32); o.frequency.exponentialRampToValueAtTime(f0 * 0.55, t + 0.25);
      o.connect(g); s.out(g, 0.3);
    }
  };

  // ----------------------------------------------------------------
  // Séquenceur
  // ----------------------------------------------------------------
  class Song {
    constructor(id, ctx, dest, verb) {
      this.id = id; this.ctx = ctx; this.dest = dest; this.verb = verb;
      this.def = SONGS[id] || SONGS.menu;
      const d = this.def;
      this.step = 60 / d.bpm / 4;           // double-croche
      this.stepsPerBar = 16;
      this.chordSteps = this.stepsPerBar * (d.bars || 1);
      this.totalSteps = this.chordSteps * d.prog.length;
      this.idx = 0; this.nextT = 0; this.running = false;
      this.scale = SC[d.scale] || SC.major;
      this.sendAmt = d.verb === undefined ? 0.5 : d.verb;
      this.buildMelody();
    }
    out(node, send) {
      node.connect(this.dest);
      if (this.verb && send > 0) {
        const s = this.ctx.createGain(); s.gain.value = send * this.sendAmt;
        node.connect(s); s.connect(this.verb);
      }
    }
    chordAt(stepIdx) {
      const ci = Math.floor(stepIdx / this.chordSteps) % this.def.prog.length;
      const c = this.def.prog[ci];
      return { root: this.def.root + c[0], iv: CH[c[1]] || CH.maj };
    }
    scaleNote(root, deg) {
      const sc = this.scale, n = sc.length;
      const o = Math.floor(deg / n), i = ((deg % n) + n) % n;
      return root + o * 12 + sc[i];
    }
    // mélodie : phrases de 2 mesures, structure A A' B A
    buildMelody() {
      const L = this.def.lead;
      this.melody = [];
      if (!L) return;
      const rnd = U.rng(L.seed || 1);
      const phraseLen = 32;
      const makePhrase = () => {
        const notes = [];
        let deg = Math.floor(rnd() * 5);
        for (let s = 0; s < phraseLen;) {
          const r = rnd();
          const len = r < 0.35 ? 2 : r < 0.7 ? 4 : r < 0.9 ? 6 : 8;
          if (rnd() < L.density || s === 0) {
            notes.push({ s, len, deg });
            const mv = rnd();
            deg += mv < 0.35 ? 1 : mv < 0.7 ? -1 : mv < 0.85 ? 2 : -2;
            deg = U.clamp(deg, -2, 9);
          }
          s += len;
        }
        return notes;
      };
      const A = makePhrase(), B = makePhrase();
      const A2 = A.map((n, i) => (i === A.length - 1 ? { s: n.s, len: n.len, deg: 0 } : n));
      this.phrases = [A, A2, B, A];
    }
    start() {
      this.running = true;
      this.nextT = this.ctx.currentTime + 0.08;
      this.idx = 0;
      if (this.def.drone) {
        const d = this.def.drone, ctx = this.ctx;
        this.droneG = ctx.createGain(); this.droneG.gain.setValueAtTime(0.0001, ctx.currentTime);
        this.droneG.gain.linearRampToValueAtTime(d.vol, ctx.currentTime + 3);
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400;
        this.droneO = [osc(ctx, 'sawtooth', mtof(d.note), ctx.currentTime, ctx.currentTime + 3600, -5), osc(ctx, 'sawtooth', mtof(d.note + 7), ctx.currentTime, ctx.currentTime + 3600, 5)];
        const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 200; lfo.connect(lg); lg.connect(lp.frequency); lfo.start(); lfo.stop(ctx.currentTime + 3600);
        this.droneO.push(lfo);
        this.droneO.slice(0, 2).forEach((o) => o.connect(lp));
        lp.connect(this.droneG); this.out(this.droneG, 0.8);
      }
    }
    stop() {
      this.running = false;
      if (this.droneO) { this.droneO.forEach((o) => { try { o.stop(); } catch (e) { /* ignore */ } }); this.droneO = null; }
    }
    tick() {
      if (!this.running) return;
      const ctx = this.ctx;
      if (this.nextT < ctx.currentTime - 0.5) this.nextT = ctx.currentTime + 0.05; // rattrapage (onglet en arrière-plan)
      while (this.nextT < ctx.currentTime + 0.18) {
        this.playStep(this.idx, this.nextT);
        let st = this.step;
        if (this.def.swing) st *= (this.idx % 2 === 0) ? (1 + this.def.swing) : (1 - this.def.swing);
        this.nextT += st;
        this.idx = (this.idx + 1) % (this.totalSteps * 4);
      }
    }
    playStep(i, t) {
      const d = this.def;
      const inChord = i % this.chordSteps;
      const inBar = i % 16;
      const ch = this.chordAt(i);
      const chordDur = this.chordSteps * this.step;
      // nappe / accords
      if (d.pad) {
        if (d.pad.rhythm) {
          if (d.pad.rhythm.indexOf(inBar) >= 0) {
            const vel = d.pad.vol * (inBar === 0 ? 1 : 0.7);
            ch.iv.forEach((iv, k) => INST[d.pad.inst](this, t + k * 0.012, ch.root + iv, this.step * 3, vel));
          }
        } else if (inChord === 0) {
          ch.iv.forEach((iv) => INST[d.pad.inst](this, t, ch.root + iv, chordDur * 0.95, d.pad.vol));
        }
      }
      // arpège
      if (d.arp) {
        const per = 16 / d.arp.rate;
        if (inBar % per === 0) {
          const k = Math.floor(inBar / per);
          const pi = d.arp.pattern[(k + Math.floor(i / 16) * 2) % d.arp.pattern.length];
          const tones = ch.iv;
          const note = ch.root + tones[pi % tones.length] + 12 * (d.arp.oct || 1) + (pi >= tones.length ? 12 : 0);
          INST[d.arp.inst](this, t, note, this.step * per, d.arp.vol * (k === 0 ? 1 : 0.8));
        }
      }
      // basse
      if (d.bass) {
        const b = d.bass, root = ch.root - 12;
        const pat = {
          long: [0], root4: [0, 4, 8, 12], root2: [0, 8], eighths: [0, 2, 4, 6, 8, 10, 12, 14],
          lofi: [0, 7, 10], funk: [0, 3, 6, 10, 11, 14]
        }[b.pattern] || [0];
        if (b.pattern === 'long') { if (inChord === 0) INST[b.inst](this, t, root, chordDur * 0.95, b.vol); }
        else if (pat.indexOf(inBar) >= 0) {
          let n = root;
          if (b.pattern === 'funk' && (inBar === 11 || inBar === 14)) n = root + 12;
          if (b.pattern === 'lofi' && inBar === 10) n = root + 7;
          INST[b.inst](this, t, n, this.step * (b.pattern === 'eighths' ? 1.8 : 3), b.vol);
        }
      }
      // mélodie
      if (d.lead && this.phrases) {
        const pi = Math.floor(i / 32) % this.phrases.length;
        const within = i % 32;
        const ph = this.phrases[pi];
        for (const n of ph) {
          if (n.s === within) {
            let m = this.scaleNote(d.root + 12 * (d.lead.oct || 1), n.deg);
            // accroche sur une note de l'accord pour les temps forts
            if (within % 8 === 0) {
              let best = m, bd = 99;
              for (const iv of ch.iv) for (let o = -1; o <= 2; o++) { const c = ch.root + iv + 12 * ((d.lead.oct || 1) + o); const dd = Math.abs(c - m); if (dd < bd) { bd = dd; best = c; } }
              m = best;
            }
            INST[d.lead.inst](this, t, m, this.step * n.len * 0.95, d.lead.vol);
          }
        }
      }
      // batterie
      if (d.drums) {
        const dr = d.drums, v = dr.vol || 0.5;
        if (dr.kick && dr.kick.indexOf(inBar) >= 0) INST.kick(this, t, v * 0.9);
        if (dr.snare && dr.snare.indexOf(inBar) >= 0) INST.snare(this, t, v * 0.6);
        if (dr.hat && dr.hat.indexOf(inBar) >= 0) INST.hat(this, t, v * (inBar % 4 === 0 ? 0.7 : 0.45), false);
        if (dr.open && dr.open.indexOf(inBar) >= 0) INST.hat(this, t, v * 0.5, true);
        if (dr.shaker && dr.shaker.indexOf(inBar) >= 0) INST.shaker(this, t, v);
        if (dr.tom && dr.tom.indexOf(inBar) >= 0 && (Math.floor(i / 16) % 4 === 3)) INST.tom(this, t, v * 0.7, inBar);
      }
    }
  }

  HOL.ProcMusic = {
    songs: SONGS,
    create(id, ctx, dest, verb) { return new Song(id, ctx, dest, verb); },
    INST, mtof
  };
})();
