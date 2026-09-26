/* House of Laura · système audio
 * - Musiques : fichiers réels (audio/manifest.js) avec repli procédural automatique
 * - Fondus enchaînés entre pistes, "ducking" pendant les dialogues
 * - Bruitages : fichiers réels si présents, sinon synthèse (sfx.js)
 */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U;
  const MAN = window.HOL_AUDIO || { music: {}, sfx: {}, crossfade: 2 };

  // ---------------- lecteur de fichier ----------------
  class FilePlayer {
    constructor(id, el, cfg) {
      this.id = id; this.el = el; this.cfg = cfg;
      this.level = 0; this.target = 0; this.rate = 1; this.onDone = null; this.kind = 'file';
      if (cfg.loopStart !== undefined) {
        el.loop = false;
        this._ended = () => { el.currentTime = cfg.loopStart; el.play().catch(() => {}); };
        el.addEventListener('ended', this._ended);
      } else el.loop = cfg.loop !== false;
    }
    start(fade) {
      try { this.el.currentTime = 0; } catch (e) { /* ignore */ }
      this.el.volume = 0;
      const p = this.el.play();
      if (p && p.catch) p.catch(() => {});
      this.fadeTo(1, fade);
    }
    fadeTo(v, fade, done) {
      this.target = v;
      this.rate = fade > 0 ? 1 / fade : 1000;
      this.onDone = done || null;
    }
    stop(fade) { this.fadeTo(0, fade, () => { this.el.pause(); }); }
    update(dt) {
      this.level = U.approach(this.level, this.target, this.rate * dt);
      const v = this.level * (this.cfg.volume === undefined ? 1 : this.cfg.volume) * A.vol.music * A.vol.master * A.duckLevel;
      this.el.volume = U.clamp(v, 0, 1);
      if (this.level === this.target && this.onDone) { const d = this.onDone; this.onDone = null; d(); if (this.target === 0) return true; }
      return false;
    }
  }

  // ---------------- lecteur procédural ----------------
  class ProcPlayer {
    constructor(id, cfg) {
      this.id = id; this.cfg = cfg; this.kind = 'proc';
      this.gain = A.ctx.createGain();
      this.gain.gain.value = 0;
      this.gain.connect(A.musicBus);
      // Envoi de reverberation PAR PISTE, route par le gain du lecteur.
      // Avant, la piste se connectait directement a la reverberation partagee :
      // le fondu de sortie ne coupait que la partie directe, et la musique du
      // menu continuait de resonner PAR-DESSOUS la musique du jeu (double musique).
      this.verbSend = A.ctx.createGain();
      this.verbSend.gain.value = 1;
      this.verbSend.connect(this.gain);
      this.song = HOL.ProcMusic ? HOL.ProcMusic.create(id, A.ctx, this.gain, this.verbSend) : null;
      this.level = 0; this.target = 0; this.rate = 1; this.onDone = null;
    }
    start(fade) { if (this.song) this.song.start(); this.fadeTo(1, fade); }
    fadeTo(v, fade, done) {
      this.target = v; this.rate = fade > 0 ? 1 / fade : 1000; this.onDone = done || null;
    }
    stop(fade) {
      this.fadeTo(0, fade, () => {
        if (this.song) this.song.stop();
        setTimeout(() => { try { this.gain.disconnect(); } catch (e) { /* ignore */ } }, 400);
      });
    }
    update(dt) {
      this.level = U.approach(this.level, this.target, this.rate * dt);
      const v = this.level * (this.cfg && this.cfg.procVolume !== undefined ? this.cfg.procVolume : 1);
      this.gain.gain.setTargetAtTime(v, A.ctx.currentTime, 0.03);
      if (this.song) this.song.tick();
      if (this.level === this.target && this.onDone) { const d = this.onDone; this.onDone = null; d(); if (this.target === 0) return true; }
      return false;
    }
  }

  const A = HOL.Audio = {
    ctx: null,
    vol: { master: 0.85, music: 0.7, sfx: 0.8 },
    duckLevel: 1, duckTarget: 1,
    music: {}, sfxFiles: {},
    players: [], current: null, currentId: null,
    wanted: null, // piste demandée avant déverrouillage
    unlocked: false,

    // Teste la présence des fichiers déclarés dans le manifeste (sans bloquer le jeu)
    probe() {
      const tryFile = (file, cb) => {
        if (!file) { cb(null); return; }
        const el = new Audio();
        let done = false;
        const ok = () => { if (done) return; done = true; cb(el); };
        const ko = () => { if (done) return; done = true; cb(null); };
        el.addEventListener('canplaythrough', ok, { once: true });
        el.addEventListener('loadeddata', ok, { once: true });
        el.addEventListener('error', ko, { once: true });
        el.preload = 'auto';
        el.src = file;
        try { el.load(); } catch (e) { ko(); }
        setTimeout(() => { if (!done) { done = true; if (el.readyState >= 2) cb(el); else cb(null); } }, 4000);
      };
      for (const id in MAN.music) {
        const cfg = MAN.music[id];
        const rec = this.music[id] = { id, cfg, status: cfg.file ? 'probing' : 'proc', el: null };
        tryFile(cfg.file, (el) => {
          rec.el = el; rec.status = el ? 'file' : 'proc';
          if (el && this.currentId === id && this.current && this.current.kind === 'proc' && this.unlocked) {
            // le fichier est arrivé après le démarrage : on bascule en douceur
            const id2 = id; this.currentId = null; this.play(id2, 1.5);
          }
        });
      }
      for (const id in (MAN.sfx || {})) {
        const cfg = MAN.sfx[id];
        const rec = this.sfxFiles[id] = { id, cfg, status: cfg.file ? 'probing' : 'proc', el: null };
        tryFile(cfg.file, (el) => { rec.el = el; rec.status = el ? 'file' : 'proc'; });
      }
    },

    unlock() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        const ctx = this.ctx;
        this.master = ctx.createGain(); this.master.gain.value = this.vol.master;
        this.comp = ctx.createDynamicsCompressor();
        this.comp.threshold.value = -14; this.comp.knee.value = 12; this.comp.ratio.value = 3;
        this.master.connect(this.comp); this.comp.connect(ctx.destination);
        this.musicBus = ctx.createGain(); this.musicBus.gain.value = this.vol.music;
        this.musicDuck = ctx.createGain(); this.musicDuck.gain.value = 1;
        this.musicBus.connect(this.musicDuck); this.musicDuck.connect(this.master);
        this.sfxBus = ctx.createGain(); this.sfxBus.gain.value = this.vol.sfx; this.sfxBus.connect(this.master);
        // réverbération partagée
        this.reverb = ctx.createConvolver();
        this.reverb.buffer = this.makeIR(3.2, 2.4);
        this.reverbIn = ctx.createGain(); this.reverbIn.gain.value = 1;
        this.reverbOut = ctx.createGain(); this.reverbOut.gain.value = 0.55;
        this.reverbIn.connect(this.reverb); this.reverb.connect(this.reverbOut); this.reverbOut.connect(this.musicDuck);
        this.sfxVerb = ctx.createGain(); this.sfxVerb.gain.value = 0.5; this.sfxVerb.connect(this.reverb);
        this.noiseBuf = this.makeNoise(2);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      if (!this.unlocked) {
        this.unlocked = true;
        if (this.wanted) { const w = this.wanted; this.wanted = null; this.play(w.id, w.fade); }
      }
    },

    makeIR(sec, decay) {
      const ctx = this.ctx, len = Math.floor(ctx.sampleRate * sec);
      const buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < len; i++) {
          const t = i / len;
          d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, decay) * (i < 200 ? i / 200 : 1);
        }
      }
      return buf;
    },
    makeNoise(sec) {
      const ctx = this.ctx, len = Math.floor(ctx.sampleRate * sec);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      return buf;
    },

    setVolumes(v) {
      Object.assign(this.vol, v || {});
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      this.master.gain.setTargetAtTime(this.vol.master, t, 0.05);
      this.musicBus.gain.setTargetAtTime(this.vol.music, t, 0.05);
      this.sfxBus.gain.setTargetAtTime(this.vol.sfx, t, 0.05);
    },

    trackStatus(id) { const r = this.music[id]; return r ? r.status : 'inconnu'; },
    trackIds() { return Object.keys(this.music); },

    // Joue une piste avec fondu enchaîné
    play(id, fade) {
      if (fade === undefined) fade = MAN.crossfade || 2;
      if (!id) { this.stopMusic(fade); return; }
      if (this.currentId === id) return;
      if (!this.unlocked || !this.ctx) { this.wanted = { id, fade }; this.currentId = null; return; }
      const rec = this.music[id];
      if (!rec) { console.warn('[audio] piste inconnue', id); return; }
      if (rec.status === 'probing') {
        // on attend un peu la fin du test du fichier
        this.currentId = id;
        const t0 = performance.now();
        const wait = () => {
          if (this.currentId !== id) return;
          if (rec.status !== 'probing' || performance.now() - t0 > 2500) { this.currentId = null; this.play(id, fade); }
          else setTimeout(wait, 100);
        };
        setTimeout(wait, 100);
        return;
      }
      if (this.current) this.current.stop(fade * 0.9);
      let p;
      if (rec.status === 'file' && rec.el) p = new FilePlayer(id, rec.el, rec.cfg);
      else p = new ProcPlayer(id, rec.cfg);
      p.start(fade);
      this.players.push(p);
      this.current = p; this.currentId = id;
    },
    stopMusic(fade) {
      if (this.current) this.current.stop(fade === undefined ? 1.5 : fade);
      this.current = null; this.currentId = null; this.wanted = null;
    },
    duck(on) { this.duckTarget = on ? 0.6 : 1; },

    update(dt) {
      this.duckLevel = U.approach(this.duckLevel, this.duckTarget, dt * 1.5);
      if (this.ctx) this.musicDuck.gain.setTargetAtTime(this.duckLevel, this.ctx.currentTime, 0.05);
      for (let i = this.players.length - 1; i >= 0; i--) {
        const p = this.players[i];
        const finished = p.update(dt);
        if (finished && p !== this.current) this.players.splice(i, 1);
      }
    },

    // ---------------- bruitages ----------------
    sfx(name, opts) {
      if (!this.ctx || !this.unlocked) return;
      opts = opts || {};
      const rec = this.sfxFiles[name];
      if (rec && rec.status === 'file' && rec.el) {
        const el = rec.el.cloneNode();
        el.volume = U.clamp((rec.cfg.volume || 1) * (opts.vol === undefined ? 1 : opts.vol) * this.vol.sfx * this.vol.master, 0, 1);
        if (opts.pitch) { el.playbackRate = U.clamp(opts.pitch, 0.5, 2); el.preservesPitch = false; }
        el.play().catch(() => {});
        return;
      }
      const fn = HOL.Sfx && HOL.Sfx[name];
      if (fn) { try { fn(this.ctx, this.sfxBus, opts, this); } catch (e) { console.warn(e); } }
    }
  };
})();
