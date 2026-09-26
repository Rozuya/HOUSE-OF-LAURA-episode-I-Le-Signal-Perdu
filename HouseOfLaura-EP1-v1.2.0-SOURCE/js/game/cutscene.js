/* House of Laura · scènes scriptées (générateurs) et tâches élémentaires */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U;

  class Cutscene {
    constructor(game) {
      this.game = game;
      this.queue = [];
      this.cur = null; // { gen, task, lock }
      this.active = false;
    }
    run(genFn, opts) {
      opts = opts || {};
      const job = { genFn, lock: opts.lock !== false, name: opts.name || '' };
      if (this.cur) { this.queue.push(job); return; }
      this.startJob(job);
    }
    startJob(job) {
      const game = this.game;
      this.cur = { gen: job.genFn(game, HOL.CS), task: null, lock: job.lock, name: job.name };
      this.active = true;
      this.advance(undefined);
    }
    get locksPlayer() { return !!(this.cur && this.cur.lock); }
    advance(val) {
      const game = this.game;
      let guard = 0;
      while (this.cur && guard++ < 200) {
        let r;
        try { r = this.cur.gen.next(val); }
        catch (err) { console.error('[scène] erreur', err); r = { done: true }; }
        if (r.done) {
          if (game.dialogue.active) game.dialogue.close();
          game.cam.focus = null;
          game.player.locked = false;
          this.cur = null; this.active = false;
          if (this.queue.length) this.startJob(this.queue.shift());
          return;
        }
        const task = r.value;
        if (!task) { val = undefined; continue; }
        if (task.kind !== 'say' && game.dialogue.active) game.dialogue.close();
        if (task.lock !== undefined) this.cur.lock = task.lock;
        task.start && task.start(game);
        if (task.instant) { val = task.result; continue; }
        this.cur.task = task;
        return;
      }
    }
    update(dt) {
      if (!this.cur) return;
      const game = this.game;
      game.player.locked = this.cur.lock;
      const task = this.cur.task;
      if (!task) return;
      if (task.update(dt, game)) {
        this.cur.task = null;
        this.advance(task.result);
      }
    }
    clear() {
      this.queue.length = 0;
      if (this.cur) { this.cur = null; this.active = false; }
      const p = this.game.player;
      p.locked = false;
      // BUG CRITIQUE : sans ceci, autoWalk survit a une cutscene interrompue
      // (pause -> retour au titre) et le joueur reste prisonnier d'une marche
      // automatique qu'il ne peut plus arreter => softlock definitif.
      p.autoWalk = null;
      // Idem pour les verrous d'enigmes : lampBusy/resoBusy ne sont reinitialises
      // que par un C.call() DANS la cutscene. Interrompue => enigme insoluble.
      const st = this.game.story;
      const rm = this.game.room;
      if (st) {
        if (st.lampBusy) {
          st.lampBusy = false;
          if (rm && rm.state) rm.state.lampSeq = [];
          if (rm && rm.findAll) rm.findAll('lamp').forEach((l) => { l.on = false; l.flick = 0; });
        }
        if (st.resoBusy) {
          st.resoBusy = false;
          if (rm && rm.state) { rm.state.heard = false; rm.state.pos = 0; }
        }
      }
      if (this.game.dialogue.active) this.game.dialogue.close();
      this.game.cam.focus = null;
    }
  }

  // ------------------------------------------------------------------
  // Tâches
  // ------------------------------------------------------------------
  const CS = HOL.CS = {};
  CS.say = function (who, text, expr, opts) {
    opts = opts || {};
    return {
      kind: 'say',
      start(game) { game.dialogue.open(Object.assign({ who, text, expr }, opts)); },
      update(dt, game) {
        // Si le dialogue a ete ferme par un autre chemin (pause, changement de
        // salle, clear), dialogue.finished reste faux a jamais et la scene
        // reste bloquee indefiniment. On detecte la fermeture et on continue.
        if (!game.dialogue.active) return true;
        if (game.dialogue.finished) { this.result = game.dialogue.result; return true; }
        return false;
      }
    };
  };
  CS.choice = function (who, text, choices, expr, opts) { return CS.say(who, text, expr, Object.assign({ choices }, opts || {})); };
  CS.sign = function (title, text) { return CS.say('sign', text, null, { style: 'sign', title }); };
  CS.narrate = function (text, auto) { return CS.say('narration', text, null, { style: 'narration', auto }); };
  CS.wait = function (sec) {
    return { start() { this.t = 0; }, update(dt) { this.t += dt; return this.t >= sec; } };
  };
  CS.until = function (fn, timeout) {
    return { start() { this.t = 0; }, update(dt, game) { this.t += dt; return fn(game) || (timeout && this.t > timeout); } };
  };
  CS.call = function (fn) { return { instant: true, start(game) { this.result = fn(game); } }; };
  CS.lock = function (on) { return { instant: true, lock: on, start() {} }; };
  CS.fade = function (to, dur) {
    return {
      start(game) { this.from = game.fadeA; this.t = 0; this.dur = dur === undefined ? 0.6 : dur; },
      update(dt, game) { this.t += dt; const k = this.dur > 0 ? U.clamp(this.t / this.dur, 0, 1) : 1; game.fadeA = U.lerp(this.from, to, k); return k >= 1; }
    };
  };
  CS.cam = function (x, y, dur, zoom) {
    return {
      start(game) { game.cam.focus = { x, y, zoom: zoom || 1 }; this.t = 0; },
      update(dt) { this.t += dt; return this.t >= (dur === undefined ? 1 : dur); }
    };
  };
  CS.camOn = function (entOrFn, dur) {
    return {
      start(game) {
        const e = typeof entOrFn === 'string' ? game.room.find(entOrFn) : entOrFn;
        if (e) game.cam.focus = { x: e.cx !== undefined ? e.cx : e.x, y: (e.cy !== undefined ? e.cy : e.y) - 20, zoom: 1 };
        this.t = 0;
      },
      update(dt) { this.t += dt; return this.t >= (dur === undefined ? 0.8 : dur); }
    };
  };
  CS.camReset = function (dur) {
    return { start(game) { game.cam.focus = null; this.t = 0; }, update(dt) { this.t += dt; return this.t >= (dur || 0.5); } };
  };
  CS.walkPlayer = function (x, run) {
    return {
      start(game) { this.done = false; game.player.autoWalk = { x, run, done: () => { this.done = true; } }; this.t = 0; },
      update(dt, game) { this.t += dt; if (this.t > 8) { game.player.autoWalk = null; return true; } return this.done; }
    };
  };
  CS.walk = function (npcId, x, speed) {
    return {
      start(game) { this.npc = game.room.find(npcId); if (this.npc) this.npc.walkTo(x, speed); },
      update() { return !this.npc || !this.npc.walk; }
    };
  };
  CS.walkNoWait = function (npcId, x, speed) {
    return { instant: true, start(game) { const n = game.room.find(npcId); if (n) n.walkTo(x, speed); } };
  };
  CS.anim = function (who, name, dur) {
    return {
      instant: true,
      start(game) {
        if (who === 'laura') game.player.setAnim(name, dur || 0);
        else { const n = game.room.find(who); if (n && n.setAnim) n.setAnim(name); }
      }
    };
  };
  CS.face = function (who, dir) {
    return {
      instant: true,
      start(game) {
        if (who === 'laura') game.player.facing = dir;
        else { const n = game.room.find(who); if (n) n.facing = dir; }
      }
    };
  };
  CS.emote = function (who, sym, dur) {
    return {
      instant: true,
      start(game) {
        if (who === 'laura') game.player.emote = { sym, t: dur || 1.5 };
        else { const n = game.room.find(who); if (n) n.emote = { sym, t: dur || 1.5 }; }
      }
    };
  };
  CS.sfx = function (name, o) { return { instant: true, start() { HOL.Audio.sfx(name, o); } }; };
  CS.music = function (id, fade) { return { instant: true, start() { HOL.Audio.play(id, fade); } }; };
  CS.flash = function (color, t) { return { instant: true, start(game) { game.flash(color, t); } }; };
  CS.shake = function (a, t) { return { instant: true, start(game) { game.shake(a, t); } }; };
  CS.banner = function (title, sub, small) { return { instant: true, start(game) { game.ui.banner(title, sub, small); } }; };
  CS.toast = function (text) { return { instant: true, start(game) { game.ui.toast(text); } }; };
  CS.echoTo = function (x, y) { return { instant: true, start(game) { game.player.echo.target = x === null ? null : { x, y }; } }; };

  HOL.Cutscene = Cutscene;
})();
