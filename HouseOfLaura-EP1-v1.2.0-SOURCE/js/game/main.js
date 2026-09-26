/* House of Laura · boucle principale, caméra, salles, rendu, lumières */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U, G = HOL.G, T = HOL.T;
  const VW = HOL.VIEW_W, VH = HOL.VIEW_H;
  const DT = 1 / 60;
  const params = new URLSearchParams(location.search);
  HOL.DEBUG = params.get('debug') === '1';
  HOL.DEBUG_SLOT = params.get('slot') ? '_' + params.get('slot') : null;

  class Game {
    constructor() {
      this.canvas = document.getElementById('game');
      this.ctx = this.canvas.getContext('2d');
      this.settings = HOL.Save.loadSettings();
      this.save = new HOL.SaveData(this.settings);
      this.particles = new HOL.Particles();
      this.story = new HOL.StoryClass(this);
      this.player = new HOL.Player(this);
      this.dialogue = new HOL.Dialogue(this);
      this.cutscene = new HOL.Cutscene(this);
      this.ui = new HOL.UIClass(this);
      this.cam = { x: 0, y: 0, zoom: 1, focus: null, shakeA: 0, shakeT: 0, lookAhead: 0, sx: 0, sy: 0, snap: false };
      this.lights = [];
      this.time = 0; this.fadeA = 0; this.flashA = 0; this.flashCol = '#fff'; this.pulseFlash = 0;
      this.mode = 'title';
      this.title = new HOL.Title(this);
      this.room = null; this.transition = null; this.deathT = 0; this.blink = null;
      this.lightC = G.canvas(VW / 2, VH / 2); this.lightX = this.lightC.getContext('2d');
      HOL.Input.init(this.canvas);
      HOL.Audio.probe();
      HOL.Audio.setVolumes({ master: this.settings.master, music: this.settings.music, sfx: this.settings.sfx });
      this.ui.applySettings();
      this.resize();
      window.addEventListener('resize', () => this.resize());
      document.addEventListener('fullscreenchange', () => this.resize());
      this.acc = 0; this.last = performance.now();
      const boot = document.getElementById('boot'); if (boot) boot.remove();
      this.canvas.focus();
      if (HOL.DEBUG) this.debugStart();
      requestAnimationFrame((t) => this.frame(t));
    }

    // ------------------------------------------------------------------ affichage
    resize() {
      const dpr = window.devicePixelRatio || 1;
      let w = window.innerWidth, h = window.innerHeight;
      let pw = Math.floor(w * dpr), ph = Math.floor(h * dpr);
      const cap = 1920 * 1080 * 1.1;
      if (pw * ph > cap) { const k = Math.sqrt(cap / (pw * ph)); pw = Math.floor(pw * k); ph = Math.floor(ph * k); }
      this.canvas.width = pw; this.canvas.height = ph;
      this.canvas.style.width = w + 'px'; this.canvas.style.height = h + 'px';
      const scale = Math.min(pw / VW, ph / VH);
      HOL.view = { scale, offX: Math.floor((pw - VW * scale) / 2), offY: Math.floor((ph - VH * scale) / 2), rs: Math.min(2, Math.max(1, scale)) };
      if (this.room) this.room.chunks.clear();
    }
    toggleFullscreen() {
      try {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
      } catch (e) { /* ignore */ }
    }

    // ------------------------------------------------------------------ modes
    newGame() {
      this.save = new HOL.SaveData(this.settings);
      this.player.maxHp = 3; this.player.hp = 3;
      HOL.Save.clear();
      this.startPlay('m_chambre', 'desk');
    }
    continueGame() {
      const d = HOL.Save.read();
      if (!d) { this.newGame(); return; }
      this.save = new HOL.SaveData(this.settings);
      this.save.load(d);
      this.player.maxHp = this.save.maxHp || 3; this.player.hp = this.player.maxHp;
      const cp = this.save.checkpoint;
      if (cp && HOL.ROOMS[cp.room]) this.startPlay(cp.room, null, { x: cp.x, y: cp.y });
      else this.startPlay(this.save.room || 'm_chambre', this.save.spawn || 'default');
    }
    startPlay(roomId, spawn, pos) {
      this.mode = 'play';
      this.cutscene.clear(); this.ui.close();
      this.player.dead = false; this.player.clearAnim(); this.player.echoHidden = false; this.player.echo.target = null; this.player.echo.power = 1;
      this.fadeA = 1;
      this.loadRoom(roomId, spawn, pos);
      this.transition = { phase: 'in', t: 0 };
    }
    toTitle() {
      this.mode = 'title';
      this.cutscene.clear(); this.ui.close(); this.dialogue.close();
      this.title.screen = 'menu'; this.title.main.idx = 0;
      HOL.Audio.play('menu', 1.5);
      this.fadeA = 0;
    }
    startEnding() {
      this.saveGame();
      this.mode = 'ending';
      this.cutscene.clear();
      this.ending = new HOL.Ending(this);
      this.fadeA = 0;
    }
    finishEnding() {
      this.save.flags.ending_done = true;
      this.save.room = 'm_chambre'; this.save.spawn = 'desk';
      this.save.checkpoint = { room: 'm_chambre', x: 7 * T + 20, y: 14 * T };
      this.saveGame();
      this.toTitle();
    }

    // ------------------------------------------------------------------ salles
    spawnInfo(room, spawn) {
      const s = room.spawns[spawn] || room.spawns.default || Object.values(room.spawns)[0] || [2, 2];
      const o = s[2] || {};
      return { x: s[0] * T + 16, y: (s[1] + 1) * T, face: o.face || 1, climb: !!o.climb };
    }
    loadRoom(id, spawn, pos) {
      if (!HOL.ROOMS[id]) { console.error('Salle inconnue', id); id = 'm_chambre'; spawn = 'desk'; }
      this.particles.clear();
      this.room = new HOL.Room(id, this);
      const p = this.player;
      let sp;
      if (pos) sp = { x: pos.x, y: pos.y, face: p.facing, climb: false };
      else sp = this.spawnInfo(this.room, spawn);
      p.place(sp.x, sp.y, sp.face);
      if (sp.climb) { p.body.climbing = true; }
      this.cam.snap = true;
      this.updateCamera(0);
      this.save.room = id; this.save.spawn = spawn || 'default';
      this.save.checkpoint = { room: id, x: sp.x, y: sp.y };
      this.story.onEnterRoom(this.room);
      HOL.Audio.play(this.story.musicFor(this.room));
      this.saveGame();
    }
    gotoRoom(id, spawn, opts) {
      if (this.transition) return;
      this.transition = { phase: 'out', t: 0, to: id, spawn };
    }
    setCheckpoint(roomId, x, y) {
      this.save.checkpoint = { room: roomId, x, y };
      this.saveGame();
    }
    flag(n) { return !!this.save.flags[n]; }
    setFlag(n, v) { this.save.flags[n] = v === undefined ? true : v; }
    shake(a, t) { if (!this.save.settings.shake) return; this.cam.shakeA = Math.max(this.cam.shakeA, a); this.cam.shakeT = Math.max(this.cam.shakeT, t); }
    flash(col, a) { this.flashCol = col; this.flashA = Math.max(this.flashA, a); }
    fadeBlink(cb) { this.blink = { t: 0, cb, done: false }; }
    saveGame() {
      if (this.mode !== 'play' && this.mode !== 'ending') return;
      this.save.hp = this.player.hp; this.save.maxHp = this.player.maxHp;
      HOL.Save.write(this.save.toJSON());
    }
    totalCrystals() {
      if (this._totC) return this._totC;
      let n = 0;
      for (const id in HOL.ROOMS) for (const r of HOL.ROOMS[id].map) for (const c of r) if (c === '*') n++;
      this._totC = n;
      return n;
    }
    crystalsByZone() {
      const out = {};
      for (const id in HOL.ROOMS) {
        const def = HOL.ROOMS[id];
        const z = out[def.zone] = out[def.zone] || { n: 0, tot: 0 };
        def.map.forEach((row, y) => { for (let x = 0; x < row.length; x++) if (row[x] === '*') { z.tot++; if (this.save.crystals[id + ':' + x + ':' + y]) z.n++; } });
      }
      return out;
    }
    onPlayerDeath() {
      this.save.stats.deaths = (this.save.stats.deaths || 0) + 1;
      this.deathT = 1.3;
      HOL.Audio.sfx('hurt', { pitch: 0.7 });
      this.cutscene.clear();
    }
    respawn() {
      const cp = this.save.checkpoint;
      const p = this.player;
      if (cp && cp.room !== this.room.id) this.loadRoom(cp.room, null, { x: cp.x, y: cp.y });
      else if (cp) p.place(cp.x, cp.y);
      this.save.checkpoint = cp;
      p.revive();
      this.particles.clear();
      this.cam.snap = true;
      this.story.onRespawn(this.room);
      this.ui.toast(U.pick(['Laura se relève.', 'On ne lâche rien.', 'Encore une fois !', 'La House croit en toi.']));
    }
    callTony() {
      if (!this.save.flags.talkie) return;
      const o = this.story.objective();
      this.cutscene.run(function* (g, C) {
        yield C.sfx('radio');
        yield C.say('tony', 'Tony à l\'écoute ! Alors, on bloque ?', 'happy', { style: 'radio', name: 'Tony (talkie)' });
        yield C.say('tony', o.hint || 'Continue comme ça, tu gères.', 'think', { style: 'radio', name: 'Tony (talkie)' });
      });
    }

    // ------------------------------------------------------------------ boucle
    frame(now) {
      let dt = (now - this.last) / 1000; this.last = now;
      if (dt > 0.25) dt = 0.25;
      this.acc += dt;
      let steps = 0;
      // Filet de securite : sans try/catch, une seule exception tuerait la boucle
      // requestAnimationFrame => ecran gele definitivement, sans message.
      while (this.acc >= DT && steps < 5) {
        try { this.update(DT); } catch (err) { this.crash(err, 'update'); this.acc = 0; break; }
        this.acc -= DT; steps++;
      }
      if (steps >= 5) this.acc = 0;
      try { this.render(); } catch (err) { this.crash(err, 'render'); }
      requestAnimationFrame((t) => this.frame(t));
    }
    crash(err, where) {
      if (!this._crashing) {
        this._crashing = true;
        console.error('[House of Laura] exception dans ' + where, err);
        try { this.ui && this.ui.toast('Un bug a ete contourne. Reviens a la zone precedente si besoin.'); } catch (e) { }
      }
      // on remet l'etatbloquant a zero pour ne pas rester piege
      try { this.player.autoWalk = null; this.player.locked = false; } catch (e) { }
      try { if (this.cutscene) this.cutscene.clear(); } catch (e) { }
    }
    update(dt) {
      HOL.Input.update(dt);
      HOL.Audio.update(dt);
      this.time += dt;
      if (this.mode === 'title') this.title.update(dt);
      else if (this.mode === 'ending') { this.ending.update(dt); }
      else this.updatePlay(dt);
      if (HOL.DEBUG) this.debugUpdate(dt);
      HOL.Input.endFrame();
    }
    updatePlay(dt) {
      const I = HOL.Input;
      // transitions de salle
      if (this.transition) {
        const tr = this.transition;
        tr.t += dt;
        if (tr.phase === 'out') {
          this.fadeA = Math.min(1, tr.t / 0.22);
          if (tr.t >= 0.22) { this.loadRoom(tr.to, tr.spawn); tr.phase = 'in'; tr.t = 0; }
          this.ui.update(dt);
          return;
        } else {
          this.fadeA = Math.max(0, 1 - tr.t / 0.35);
          if (tr.t >= 0.35) this.transition = null;
        }
      }
      if (this.blink) {
        const b = this.blink; b.t += dt;
        if (!b.done && b.t >= 0.15) { b.done = true; b.cb(); }
        this.fadeA = b.t < 0.15 ? b.t / 0.15 : Math.max(0, 1 - (b.t - 0.15) / 0.25);
        if (b.t > 0.4) { this.blink = null; this.fadeA = 0; }
      }
      if (this.ui.modal) { this.ui.updateScreens(dt); this.ui.update(dt); return; }
      if (!this.cutscene.active && !this.dialogue.active && !this.player.dead) {
        if (I.pressed('pause')) { I.consume('pause'); this.ui.open('pause'); this.ui.pauseMenu.idx = 0; HOL.Audio.sfx('menu_ok'); return; }
        if (I.pressed('journal')) { I.consume('journal'); this.ui.open('journal'); HOL.Audio.sfx('menu_ok'); return; }
      } else if (I.pressed('pause') && !this.dialogue.active && !this.player.dead) { I.consume('pause'); this.ui.open('pause'); return; }
      this.save.time += dt;
      this.lights.length = 0;
      this.cutscene.update(dt);
      this.dialogue.update(dt);
      this.lastInteract = false;
      this.player.update(dt);
      this.room.update(dt, this);
      this.story.update(dt);
      // mort
      if (this.player.dead) {
        this.deathT -= dt;
        this.fadeA = U.clamp((1.3 - this.deathT - 0.5) / 0.6, 0, 1);
        if (this.deathT <= 0) { this.respawn(); this.transition = { phase: 'in', t: 0 }; }
      }
      // interaction
      this.interact = null;
      if (!this.player.locked && !this.cutscene.active && !this.dialogue.active && !this.player.dead && !this.transition) {
        this.interact = this.findInteract();
        if (this.interact && I.pressed('interact')) {
          I.consume('interact');
          this.lastInteract = true;
          this.player.interactT = 0.45;
          this.interact.ent.interact(this);
          this.interact = null;
        }
      }
      if (!this.transition && !this.player.dead) this.checkExits();
      this.updateCamera(dt);
      this.particles.update(dt);
      if (this.room.theme.ambient) this.room.theme.ambient(this, dt, this.room, this.cam);
      this.ui.update(dt);
      if (this.flashA > 0) this.flashA = Math.max(0, this.flashA - dt * 1.8);
      if (this.pulseFlash > 0) this.pulseFlash = Math.max(0, this.pulseFlash - dt * 2);
      if (this.abilityFx) { this.abilityFx.t += dt; if (this.abilityFx.t > 3) this.abilityFx = null; }
      if (this.room.state.lightning > 0 && this.room.theme.name === 'final') this.room.state.lightning = Math.max(0, this.room.state.lightning - dt * 2);
      if (this.room.theme.name === 'final' && !this.room.state.dawn && Math.random() < dt * 0.12) { this.room.state.lightning = 1; this.room.state.boltX = U.rand(100, VW - 100); HOL.Audio.sfx('thunder', { vol: 0.6 }); }
    }
    findInteract() {
      const b = this.player.body;
      if (!b.onGround && !b.climbing && !b.inWater) return null;
      let best = null, bd = 1e9;
      for (const e of this.room.entities) {
        if (e.dead || !e.canInteract) continue;
        const label = e.canInteract(this);
        if (!label) continue;
        const box = e.interactBox();
        if (b.x < box.x + box.w && b.x + b.w > box.x && b.y < box.y + box.h && b.y + b.h > box.y) {
          const d = Math.abs(e.cx - this.player.cx) + (e.type === 'npc' ? -8 : 0);
          if (d < bd) { bd = d; best = { ent: e, label }; }
        }
      }
      return best;
    }
    checkExits() {
      const r = this.room, b = this.player.body, ex = r.exits;
      const cx = b.x + b.w / 2;
      const tx = Math.floor(cx / T);
      const inR = (e) => !e.range || (tx >= e.range[0] && tx <= e.range[1]);
      if (ex.left && cx < 1) return this.gotoRoom(ex.left.to, ex.left.spawn);
      if (ex.right && cx > r.pw - 1) return this.gotoRoom(ex.right.to, ex.right.spawn);
      if (ex.top && b.y < 4 && inR(ex.top)) return this.gotoRoom(ex.top.to, ex.top.spawn);
      if (b.y + b.h / 2 > r.ph) {
        if (ex.bottom && inR(ex.bottom)) return this.gotoRoom(ex.bottom.to, ex.bottom.spawn);
        if (b.y > r.ph + 40) this.player.hurt(1, null, true);
      }
    }
    updateCamera(dt) {
      const c = this.cam, p = this.player, r = this.room;
      let tx, ty;
      if (c.focus) { tx = c.focus.x - VW / 2; ty = c.focus.y - VH / 2; }
      else {
        c.look = U.damp(c.look || 0, p.facing * 70 + (c.lookAhead || 0), 2, dt || 1);
        tx = p.cx - VW / 2 + c.look;
        ty = p.feetY - VH * 0.6;
      }
      const maxX = r.pw - VW, maxY = r.ph - VH;
      tx = maxX > 0 ? U.clamp(tx, 0, maxX) : maxX / 2;
      ty = maxY > 0 ? U.clamp(ty, 0, maxY) : maxY / 2;
      if (c.snap || !dt) { c.x = tx; c.y = ty; c.snap = false; }
      else { c.x = U.damp(c.x, tx, c.focus ? 3 : 7, dt); c.y = U.damp(c.y, ty, c.focus ? 3 : 5, dt); }
      if (c.shakeT > 0 && dt) { c.shakeT -= dt; const a = c.shakeA * U.clamp(c.shakeT * 3, 0, 1); c.sx = U.rand(-a, a); c.sy = U.rand(-a, a); if (c.shakeT <= 0) c.shakeA = 0; }
      else { c.sx = 0; c.sy = 0; }
    }

    // ------------------------------------------------------------------ rendu
    render() {
      const ctx = this.ctx, v = HOL.view;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#07040d'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.setTransform(v.scale, 0, 0, v.scale, v.offX, v.offY);
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, VW, VH); ctx.clip();
      ctx.imageSmoothingEnabled = true;
      if (this.mode === 'title') this.title.draw(ctx);
      else if (this.mode === 'ending') this.ending.draw(ctx);
      else this.renderPlay(ctx);
      ctx.restore();
    }
    renderPlay(ctx) {
      const r = this.room, c = this.cam, t = this.time;
      const cam = { x: Math.round((c.x + c.sx) * 2) / 2, y: Math.round((c.y + c.sy) * 2) / 2, zoom: 1 };
      // 1. fond
      r.drawBackground(ctx, cam, t);
      // 2. monde (étalonné)
      ctx.save();
      ctx.translate(-cam.x, -cam.y);
      r.theme.animated(ctx, r, cam, t);
      r.drawDeco(ctx, cam, t, false);
      const ents = r.entities;
      for (const e of ents) if (e.type === 'deco' && !e.dead) e.draw(ctx, this);
      r.drawTiles(ctx, cam);
      r.drawHidden(ctx, cam, t);
      for (const e of ents) if (!e.dead && e.type !== 'deco' && !VIVID[e.type] && e.type !== 'npc' && e.type !== 'enemy') e.draw(ctx, this);
      for (const e of ents) if (!e.dead && e.type === 'npc' && e.grayT >= 0.5) e.draw(ctx, this);
      for (const e of ents) if (!e.dead && e.type === 'enemy') e.draw(ctx, this);
      r.drawWater(ctx, cam, t, false);
      for (const e of ents) if (e.drawWater) e.drawWater(ctx, this, false);
      r.drawWater(ctx, cam, t, true);
      for (const e of ents) if (e.drawWater) e.drawWater(ctx, this, true);
      ctx.restore();
      // 3. étalonnage de la brume (désaturation par zone)
      const gray = this.story.zoneGray(r.zone);
      if (gray > 0.01) {
        ctx.globalCompositeOperation = 'saturation';
        ctx.fillStyle = 'rgba(128,128,128,' + gray + ')';
        ctx.fillRect(0, 0, VW, VH);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = 'rgba(150,146,172,' + (gray * 0.1) + ')';
        ctx.fillRect(0, 0, VW, VH);
      }
      // 4. Laura, Écho, objets vivants, premier plan
      ctx.save();
      ctx.translate(-cam.x, -cam.y);
      for (const e of ents) if (!e.dead && (VIVID[e.type] || (e.type === 'npc' && e.grayT < 0.5))) e.draw(ctx, this);
      this.player.draw(ctx);
      if (this.player.body.inWater) {
        r.drawWater(ctx, cam, t, true);
        for (const e of ents) if (e.drawWater) e.drawWater(ctx, this, true);
      }
      this.particles.draw(ctx, false);
      this.player.drawEcho(ctx);
      for (const e of ents) if (!e.dead && e.drawFront) e.drawFront(ctx, this);
      r.drawDeco(ctx, cam, t, true);
      this.particles.draw(ctx, true);
      if (this.abilityFx) this.drawAbilityFx(ctx, this.abilityFx);
      if (HOL.DEBUG && this.debugHit) this.drawDebug(ctx);
      ctx.restore();
      // 5. obscurité + lumières
      this.renderLights(ctx, cam);
      // 6. brume de zone qui défile
      if (gray > 0.2) this.drawFog(ctx, cam, gray, t);
      G.vignette(ctx, r.theme.interior ? 0.45 : 0.35);
      // flash / fondu
      if (this.flashA > 0) { ctx.globalAlpha = Math.min(1, this.flashA); ctx.fillStyle = this.flashCol; ctx.fillRect(0, 0, VW, VH); ctx.globalAlpha = 1; }
      // 7. interface
      if (this.interact && !this.ui.modal) this.ui.drawInteractPrompt(ctx, this.interact.ent, this.interact.label);
      // Suite de résonances : dessinée en tout dernier, donc toujours visible
      // (elle doit rester à l'écran pendant qu'on va frapper les cristaux).
      this.ui.drawResoHint(ctx);
      if (!this.cutscene.active || !this.cutscene.locksPlayer) this.ui.drawHUD(ctx);
      else if (this.player.hp < this.player.maxHp) this.ui.drawHUD(ctx);
      this.ui.drawOverlays(ctx);
      this.dialogue.draw(ctx);
      if (this.cutscene.active && this.cutscene.locksPlayer && !this.dialogue.active) {
        // bandes cinéma
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, VW, 26); ctx.fillRect(0, VH - 26, VW, 26);
      }
      this.ui.drawScreens(ctx);
      if (this.fadeA > 0) { ctx.fillStyle = 'rgba(7,4,13,' + this.fadeA + ')'; ctx.fillRect(0, 0, VW, VH); }
      if (HOL.DEBUG) G.text(ctx, this.room.id + '  ' + Math.floor(this.player.cx / T) + ',' + Math.floor(this.player.feetY / T - 1) + (this.debugFly ? '  VOL' : ''), 8, VH - 8, { size: 11, color: '#0f0' });
    }
    renderLights(ctx, cam) {
      const r = this.room;
      let dark = r.def.darkFn ? r.def.darkFn(r, this.story) : (r.dark || 0);
      if (this.story.flag('ending_done') && r.zone !== 'maison') dark *= 0.6;
      const L = this.lights;
      if (dark > 0.02) {
        const lc = this.lightC, lx = this.lightX;
        lx.setTransform(1, 0, 0, 1, 0, 0);
        lx.globalCompositeOperation = 'source-over';
        lx.clearRect(0, 0, lc.width, lc.height);
        lx.fillStyle = 'rgba(6,3,14,' + dark + ')';
        lx.fillRect(0, 0, lc.width, lc.height);
        lx.globalCompositeOperation = 'destination-out';
        const spr = G.lightSprite();
        for (const l of L) {
          const rr = l.r * (l.flicker ? 0.93 + Math.random() * 0.07 : 1);
          const sx = (l.x - cam.x) * 0.5, sy = (l.y - cam.y) * 0.5, rad = rr * 0.5;
          if (sx + rad < 0 || sy + rad < 0 || sx - rad > lc.width || sy - rad > lc.height) continue;
          lx.globalAlpha = U.clamp(l.a === undefined ? 1 : l.a, 0, 1);
          lx.drawImage(spr, sx - rad, sy - rad, rad * 2, rad * 2);
        }
        lx.globalAlpha = 1;
        ctx.drawImage(lc, 0, 0, VW, VH);
      }
      // teinte colorée des lumières
      for (const l of L) {
        if (!l.color || l.color === '#ffd9f2' || l.color === '#ffe8f4') continue;
        const sx = l.x - cam.x, sy = l.y - cam.y;
        if (sx < -l.r || sy < -l.r || sx > VW + l.r || sy > VH + l.r) continue;
        G.glow(ctx, sx, sy, l.r * 0.8, l.color, 0.12 * (l.a === undefined ? 1 : l.a) * (0.5 + dark), true);
      }
    }
    drawFog(ctx, cam, gray, t) {
      ctx.save();
      for (let i = 0; i < 4; i++) {
        const y = VH * (0.35 + i * 0.18) + Math.sin(t * 0.3 + i) * 12;
        const off = ((t * (8 + i * 4) - cam.x * (0.2 + i * 0.1)) % 600 + 600) % 600;
        ctx.globalAlpha = gray * 0.18;
        for (let x = -600 + off; x < VW + 600; x += 600) {
          const g = ctx.createRadialGradient(x + 300, y, 10, x + 300, y, 300);
          g.addColorStop(0, 'rgba(200,196,215,0.9)'); g.addColorStop(1, 'rgba(200,196,215,0)');
          ctx.fillStyle = g; ctx.fillRect(x, y - 120, 600, 240);
        }
      }
      ctx.restore();
    }
    drawAbilityFx(ctx, fx) {
      const k = Math.sin(U.clamp(fx.t / 3, 0, 1) * Math.PI);
      const g = ctx.createLinearGradient(fx.x - 40, 0, fx.x + 40, 0);
      g.addColorStop(0, U.rgba(fx.color, 0)); g.addColorStop(0.5, U.rgba(fx.color, 0.55 * k)); g.addColorStop(1, U.rgba(fx.color, 0));
      ctx.fillStyle = g; ctx.fillRect(fx.x - 40, this.cam.y - 20, 80, fx.y - this.cam.y + 40);
      G.glow(ctx, fx.x, fx.y, 160 * k, fx.color, 0.6 * k);
      if (Math.random() < 0.6) this.particles.emit({ x: fx.x + U.rand(-30, 30), y: fx.y + U.rand(-10, 30), vx: [-10, 10], vy: [-160, -60], life: [0.6, 1.2], size: [2, 4], color: [fx.color, '#ffffff'], kind: 'star' });
    }

    // ------------------------------------------------------------------ outils de test (?debug=1)
    debugStart() {
      const room = params.get('room');
      // En mode test on donne TOUJOURS les 3 capacites : sans elles on ne peut
      // ni casser un mur 'B' (dash), ni faire de double saut, ni utiliser l'onde.
      if (HOL.DEBUG) this.save.abilities = { djump: true, dash: true, pulse: true };
      if (room) {
        const flags = (params.get('flags') || '').split(',').filter(Boolean);
        flags.forEach((f) => { this.save.flags[f] = true; });
        if (params.get('intro') !== '0') { this.save.flags.intro_done = true; this.save.flags.met_tony = true; this.save.flags.power_on = true; this.save.flags.left_house = true; this.save.flags.talkie = true; }
        HOL.Audio.unlock();
        this.startPlay(room, params.get('spawn') || 'default');
      }
    }
    debugUpdate() {
      const I = HOL.Input;
      if (this.mode !== 'play') return;
      if (I.keyQ && false) return;
      const k = I.keys;
      if (k.Digit1 && !this._d1) { this.save.abilities = { djump: true, dash: true, pulse: true }; this.ui.toast('DEBUG : toutes les capacités'); }
      this._d1 = k.Digit1;
      if (k.Digit2 && !this._d2) { this.debugFly = !this.debugFly; }
      this._d2 = k.Digit2;
      if (k.Digit3 && !this._d3) { this.debugHit = !this.debugHit; }
      this._d3 = k.Digit3;
      if (this.debugFly) {
        const b = this.player.body;
        b.vx = 0; b.vy = 0;
        b.x += I.axisX() * 12; b.y += I.axisY() * 12;
      }
    }
    drawDebug(ctx) {
      const b = this.player.body;
      ctx.strokeStyle = '#0f0'; ctx.lineWidth = 1; ctx.strokeRect(b.x, b.y, b.w, b.h);
      for (const s of this.room.dynSolids) { ctx.strokeStyle = s.oneWay ? '#ff0' : '#f0f'; ctx.strokeRect(s.x, s.y, s.w, s.h); }
    }
  }
  const VIVID = { crystal: 1, polaroid: 1, item: 1, heal: 1, cat: 1, shrine: 1 };
  HOL.Game = Game;
  window.addEventListener('load', () => { HOL.game = new Game(); });
  if (HOL.DEBUG) {
    // aides de test automatisé (console)
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    window.TT = {
      wait,
      async press(code, ms) { HOL.Input.keyQ.push(code); HOL.Input.keys[code] = true; await wait(ms || 80); HOL.Input.keys[code] = false; await wait(60); },
      async hold(code, ms) { HOL.Input.keys[code] = true; await wait(ms); HOL.Input.keys[code] = false; await wait(30); },
      async skip(max) { for (let i = 0; i < (max || 60) && (HOL.game.cutscene.active || HOL.game.dialogue.active); i++) { await TT.press('Space'); await wait(200); } },
      async walkTo(tx, maxMs) {
        const g = HOL.game, t0 = performance.now();
        while (performance.now() - t0 < (maxMs || 8000)) {
          const dx = tx * 32 + 16 - g.player.cx;
          if (Math.abs(dx) < 10) break;
          const k = dx > 0 ? 'ArrowRight' : 'ArrowLeft';
          HOL.Input.keys[k] = true; await wait(40); HOL.Input.keys[k] = false;
        }
      },
      tp(tx, ty) { const g = HOL.game; g.player.place(tx * 32 + 16, (ty + 1) * 32); g.cam.snap = true; },
      state() {
        const g = HOL.game;
        return { room: g.room.id, x: +(g.player.cx / 32).toFixed(1), y: +(g.player.feetY / 32 - 1).toFixed(1), ground: g.player.body.onGround, cut: g.cutscene.active, dlg: g.dialogue.active ? g.dialogue.line.text.slice(0, 70) : null, obj: g.story.objective().text, hp: g.player.hp };
      }
    };
  }
})();
