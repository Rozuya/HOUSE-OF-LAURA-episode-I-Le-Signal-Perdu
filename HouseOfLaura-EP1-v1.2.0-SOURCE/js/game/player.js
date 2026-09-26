/* House of Laura · Laura (contrôle, capacités, animations) et Écho */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U, G = HOL.G, T = HOL.T;
  const Phys = HOL.Phys, Chars = HOL.Chars;

  class Player {
    constructor(game) {
      this.game = game;
      this.body = Phys.newBody(0, 0);
      this.pose = Chars.basePose();
      this.anim = 'idle'; this.animT = 0; this.phase = 0;
      this.override = null; this.overrideT = 0; this.overrideDur = 0;
      this.hp = 3; this.maxHp = 3; this.invuln = 0; this.hurtT = 0;
      this.locked = false; this.dead = false;
      this.echo = { x: 0, y: 0, vx: 0, vy: 0, target: null, talking: 0, power: 1, look: 0 };
      this.pulseCD = 0; this.pulseT = 0; this.djumpT = 0; this.landT = 0; this.interactT = 0;
      this.trail = []; this.safe = null; this.safeT = 0;
      this.t = 0; this.stepPhase = 0; this.hidden = false;
      this.autoWalk = null;
    }
    get cx() { return this.body.x + this.body.w / 2; }
    get cy() { return this.body.y + this.body.h / 2; }
    get feetY() { return this.body.y + this.body.h; }
    get facing() { return this.body.facing; }
    set facing(v) { this.body.facing = v; }

    place(x, feetY, facing) {
      const b = this.body;
      b.x = x - b.w / 2; b.y = feetY - b.h; b.vx = 0; b.vy = 0;
      b.onGround = false; b.climbing = false; b.dashT = 0; b.inWater = false;
      if (facing) b.facing = facing;
      this.echo.x = this.cx - b.facing * 24; this.echo.y = this.cy - 36;
      this.safe = { x: this.cx, y: feetY };
      this.trail.length = 0;
    }

    setAnim(a, dur) { this.override = a; this.overrideT = 0; this.overrideDur = dur || 0; }
    clearAnim() { this.override = null; }

    abilities() { return this.game.save.abilities; }

    readInput(dt) {
      const I = HOL.Input;
      if (this.autoWalk) {
        const dx = this.autoWalk.x - this.cx;
        const done = Math.abs(dx) < 4;
        if (done) { const cb = this.autoWalk.done; this.autoWalk = null; if (cb) cb(); }
        return { x: done ? 0 : Math.sign(dx) * (this.autoWalk && this.autoWalk.run ? 1 : 0.5), analog: !(this.autoWalk && this.autoWalk.run), jump: false, jumpP: false, dashP: false, up: false, down: false, walk: false };
      }
      if (this.locked || this.dead) return { x: 0, jump: false, jumpP: false, dashP: false, up: false, down: false };
      const game = this.game;
      const clickPulse = I.clicked(0) && !game.ui.mouseOverUI;
      return {
        x: I.axisX(), analog: I.usingStick(), walk: I.down('walk'),
        jump: I.down('jump'), jumpP: I.pressed('jump'),
        dashP: I.pressed('dash') || I.clicked(2),
        pulseP: I.pressed('pulse') || clickPulse,
        grabP: I.pressed('grab'),
        up: I.down('up'), down: I.down('down')
      };
    }

    update(dt) {
      const game = this.game, room = game.room, b = this.body;
      this.t += dt;
      if (this.invuln > 0) this.invuln -= dt;
      if (this.hurtT > 0) this.hurtT -= dt;
      if (this.pulseCD > 0) this.pulseCD -= dt;
      if (this.pulseT > 0) this.pulseT -= dt;
      if (this.djumpT > 0) this.djumpT -= dt;
      if (this.landT > 0) this.landT -= dt;
      if (this.interactT > 0) this.interactT -= dt;
      if (this.override) { this.overrideT += dt; if (this.overrideDur && this.overrideT > this.overrideDur) this.override = null; }

      if (this.dead) { this.updatePose(dt); this.updateEcho(dt); return; }

      const inp = this.readInput(dt);
      const ab = this.abilities();
      // flottaison douce : on remonte vers la surface
      if (b.inWater && b.waterSurface !== null && !inp.down) {
        const depth = (b.y + 10) - b.waterSurface;
        if (depth > 8) b.vy -= 900 * dt;
      }
      Phys.step(b, inp, dt, room, { djump: ab.djump, dash: ab.dash });

      // --- évènements physiques ---
      for (const ev of b.events) this.onEvent(ev, b);
      if (b.dashT > 0) {
        this.trail.push({ x: this.cx, y: this.feetY, pose: Object.assign({}, this.pose), f: b.facing, a: 0.5 });
        if (Math.random() < 0.8) game.particles.emit({ x: this.cx - b.facing * 10, y: this.cy + U.rand(-15, 15), vx: -b.facing * U.rand(40, 120), vy: [-10, 10], life: [0.2, 0.4], size: [2, 3], color: ['#ff8ad8', '#ffffff', '#9ae6ff'], kind: 'spark' });
      }
      for (let i = this.trail.length - 1; i >= 0; i--) { this.trail[i].a -= dt * 2.5; if (this.trail[i].a <= 0) this.trail.splice(i, 1); }

      // --- Onde ---
      if (inp.pulseP && ab.pulse && this.pulseCD <= 0) this.doPulse();

      // --- pas ---
      if (b.onGround && Math.abs(b.vx) > 20) {
        const before = Math.floor(this.stepPhase / Math.PI);
        this.stepPhase += Math.abs(b.vx) * dt * (Math.abs(b.vx) > 170 ? 0.075 : 0.1);
        if (Math.floor(this.stepPhase / Math.PI) !== before) {
          HOL.Audio.sfx('step', { surface: b.groundType || room.theme.surface, vol: Math.abs(b.vx) > 170 ? 1.1 : 0.7 });
          if (Math.abs(b.vx) > 170 && Math.random() < 0.6) game.particles.emit({ x: this.cx - b.facing * 6, y: this.feetY - 2, vx: -b.facing * U.rand(10, 40), vy: [-20, -5], life: [0.3, 0.5], size: [3, 5], color: 'rgba(220,210,230,0.35)', kind: 'smoke' });
        }
      }

      // --- dangers ---
      if (room.hazardAt(b) && !this.game.blink) { this.hurt(1, null, true); }

      // --- position sûre ---
      if (b.onGround && !b.inWater && !(b.groundEnt && b.groundEnt.ent && (b.groundEnt.ent.type === 'crumble' || b.groundEnt.ent.type === 'mover' || b.groundEnt.ent.type === 'ferry' || b.groundEnt.ent.type === 'float' || b.groundEnt.ent.type === 'block'))) {
        this.safeT += dt;
        if (this.safeT > 0.25 && !this.nearHazard()) { this.safe = { x: this.cx, y: this.feetY }; this.safeT = 0; }
      } else this.safeT = 0;

      this.updatePose(dt);
      this.updateEcho(dt);
    }

    nearHazard() {
      const room = this.game.room, b = this.body;
      const tx0 = Math.floor((b.x - 24) / T), tx1 = Math.floor((b.x + b.w + 24) / T), ty = Math.floor((this.feetY + 4) / T);
      for (let tx = tx0; tx <= tx1; tx++) {
        if (room.tile(tx, ty) === '^' || room.tile(tx, ty - 1) === '^') return true;
        // bord de vide
        let empty = true;
        for (let k = 0; k < 6; k++) { const c = room.tile(tx, ty + k); if (c !== '.' && c !== '*') { empty = false; break; } }
        if (empty && Math.abs(tx * T + 16 - this.cx) < 28) return true;
      }
      return false;
    }

    onEvent(ev, b) {
      const game = this.game;
      switch (ev) {
        case 'jump':
          HOL.Audio.sfx('jump');
          game.particles.burst(this.cx, this.feetY, 6, { speed: [20, 70], angle: [Math.PI * 0.9, Math.PI * 2.1], life: [0.3, 0.5], size: [3, 5], color: 'rgba(230,220,240,0.4)', kind: 'smoke' });
          break;
        case 'djump':
          HOL.Audio.sfx('djump'); this.djumpT = 0.38;
          game.particles.burst(this.cx, this.feetY, 12, { speed: [60, 160], angle: [0.2, Math.PI - 0.2], life: [0.6, 1.2], size: [4, 7], color: ['#ffffff', '#ffd1f2', '#c9f0ff'], kind: 'feather', grav: 60, drag: 2.5, vr: [-3, 3] });
          game.particles.emit({ x: this.cx, y: this.feetY, size: 6, size1: 34, life: 0.35, kind: 'ring', color: '#ffffff' });
          HOL.Input.rumble(0.1, 0.3, 80);
          break;
        case 'land': {
          const v = b.lastFall;
          this.landT = v > 500 ? 0.16 : 0.1;
          HOL.Audio.sfx('land', { vol: U.clamp(v / 700, 0.3, 1.3) });
          game.particles.burst(this.cx, this.feetY, v > 500 ? 10 : 5, { speed: [30, 110], angle: [Math.PI + 0.2, U.TAU - 0.2], life: [0.3, 0.6], size: [4, 7], color: 'rgba(230,220,240,0.35)', kind: 'smoke' });
          if (v > 650) { game.shake(3, 0.12); HOL.Input.rumble(0.3, 0.2, 90); }
          break;
        }
        case 'dash':
          HOL.Audio.sfx('dash'); game.shake(2, 0.1); HOL.Input.rumble(0.2, 0.4, 100);
          game.particles.emit({ x: this.cx, y: this.cy, size: 8, size1: 40, life: 0.3, kind: 'ring', color: '#ff8ad8' });
          break;
        case 'splash':
          HOL.Audio.sfx('splash');
          game.particles.burst(this.cx, b.waterSurface || this.cy, 16, { speed: [60, 200], angle: [Math.PI + 0.4, U.TAU - 0.4], life: [0.4, 0.8], size: [2, 4], color: ['#cfefff', '#ffffff', '#8ad0f0'], grav: 700 });
          break;
        case 'splashout':
          game.particles.burst(this.cx, this.feetY, 8, { speed: [40, 120], angle: [Math.PI + 0.4, U.TAU - 0.4], life: [0.3, 0.6], size: [2, 3], color: '#cfefff', grav: 700 });
          break;
        case 'swim':
          HOL.Audio.sfx('step', { surface: 'water', vol: 1.3 });
          game.particles.burst(this.cx, this.cy, 4, { speed: [10, 40], life: [0.5, 1], size: [1.5, 3], color: 'rgba(220,250,255,0.8)', kind: 'bubble', vy: [-60, -30] });
          break;
        case 'climbstep':
          if (Math.random() < 0.08) HOL.Audio.sfx('step', { surface: 'metal', vol: 0.5 });
          break;
        default: break;
      }
    }

    onBounce(kind) {
      this.djumpT = 0;
      if (kind === 'stomp') HOL.Audio.sfx('jump', { pitch: 1.3 });
    }

    doPulse() {
      const game = this.game;
      this.pulseCD = 0.85; this.pulseT = 0.45;
      const ex = this.echo.x, ey = this.echo.y;
      const R = 200;
      HOL.Audio.sfx('pulse');
      game.shake(4, 0.2);
      HOL.Input.rumble(0.5, 0.5, 200);
      game.particles.emit({ x: ex, y: ey, size: 10, size1: R, life: 0.55, kind: 'ring', color: '#5ef2d6' });
      game.particles.emit({ x: ex, y: ey, size: 6, size1: R * 0.7, life: 0.45, kind: 'ring', color: '#ff8ad8' });
      game.particles.burst(ex, ey, 24, { speed: [120, 320], life: [0.3, 0.6], size: [2, 3], color: ['#5ef2d6', '#ffffff', '#ff8ad8'], kind: 'star', drag: 4 });
      game.pulseFlash = 1;
      const n = game.room.pulseReveal(ex, ey, R, 7);
      if (n > 0) HOL.Audio.sfx('crystal', { note: 84, vol: 0.5 });
      for (const e of game.room.entities) if (e.onPulse && !e.dead) e.onPulse(game, ex, ey, R);
      if (game.story.onPulse) game.story.onPulse(ex, ey, R);
    }

    hurt(n, fromX, hazard) {
      const game = this.game, b = this.body;
      if (this.dead) return;
      if (!hazard && this.invuln > 0) return;
      if (game.save.settings.assist && !hazard) n = 0;
      this.hp -= n;
      this.invuln = 1.3; this.hurtT = 0.35;
      HOL.Audio.sfx('hurt');
      game.shake(6, 0.25); game.flash('#ff3a6a', 0.18);
      HOL.Input.rumble(0.7, 0.6, 220);
      game.particles.burst(this.cx, this.cy, 10, { speed: [60, 160], life: [0.3, 0.6], size: [2, 4], color: ['#ff5fae', '#ffffff'], kind: 'star' });
      if (this.hp <= 0) { this.hp = 0; this.die(); return; }
      if (hazard) {
        // retour au dernier point sûr
        game.fadeBlink(() => {
          if (this.safe) this.place(this.safe.x, this.safe.y);
          this.invuln = 1.2;
        });
      } else {
        const dir = fromX !== null && fromX !== undefined ? Math.sign(this.cx - fromX) || 1 : -b.facing;
        b.vx = dir * 260; b.vy = -360; b.onGround = false; b.dashT = 0;
      }
    }
    heal(n) {
      this.hp = Math.min(this.maxHp, this.hp + n);
      HOL.Audio.sfx('heal');
      this.game.ui.hpPing();
    }
    die() {
      this.dead = true;
      this.setAnim('knocked');
      this.game.onPlayerDeath();
    }
    revive() {
      this.dead = false; this.hp = this.maxHp; this.invuln = 1.5; this.clearAnim();
    }

    // --------- animation ---------
    updatePose(dt) {
      const b = this.body;
      let anim;
      if (this.override) anim = this.override;
      else if (this.dead) anim = 'knocked';
      else if (this.hurtT > 0) anim = 'hurt';
      else if (b.climbing) { anim = 'climb'; this.phase += Math.abs(b.vy) * dt * 0.09; }
      else if (b.inWater) { anim = 'swim'; this.phase += dt * (3 + Math.abs(b.vx) * 0.02); }
      else if (b.dashT > 0) anim = 'dash';
      else if (this.djumpT > 0) anim = 'djump';
      else if (this.pulseT > 0) anim = 'pulse';
      else if (!b.onGround) anim = b.vy < 0 ? 'jump' : 'fall';
      else if (this.landT > 0) anim = 'land';
      else if (b.pushing) { anim = 'push'; this.phase += dt * 5; }
      else if (Math.abs(b.vx) > 175) { anim = 'run'; this.phase += Math.abs(b.vx) * dt * 0.075; }
      else if (Math.abs(b.vx) > 12) { anim = 'walk'; this.phase += Math.abs(b.vx) * dt * 0.1; }
      else if (this.interactT > 0) anim = 'interact';
      else anim = 'idle';
      if (anim !== this.anim) { this.anim = anim; this.animT = 0; }
      else this.animT += dt;
      const tp = Chars.poseFor({ anim, t: this.override ? this.overrideT : this.animT, phase: this.phase, vx: b.vx, vy: b.vy, time: this.t });
      // cheveux : inertie selon la vitesse
      tp.hairX += U.clamp(-b.vx / 300, -1, 1) * 0.6 * (anim === 'run' || anim === 'walk' ? 0.3 : 1);
      tp.hairY += U.clamp(-b.vy / 700, -1, 1) * 0.6;
      tp.talk = this.talking > 0 ? 1 : 0;
      if (this.talking > 0) this.talking -= dt;
      if (this.faceOverride) tp.face = this.faceOverride;
      const k = anim === 'djump' || anim === 'land' ? 1 : Math.min(1, dt * 16);
      Chars.blendPose(this.pose, tp, k);
      if (anim === 'djump') this.pose.spin = tp.spin; else this.pose.spin = U.approach(this.pose.spin, 1, dt * 10);
    }

    updateEcho(dt) {
      const e = this.echo, b = this.body;
      let tx, ty;
      if (e.target) { tx = e.target.x; ty = e.target.y; }
      else {
        tx = this.cx - b.facing * 26;
        ty = this.body.y - 10 + Math.sin(this.t * 2.2) * 4;
        if (b.inWater) ty = Math.min(ty, (b.waterSurface || ty) - 20);
      }
      const k = e.target ? 3 : 6;
      e.x = U.damp(e.x, tx, k, dt);
      e.y = U.damp(e.y, ty, k, dt);
      if (e.talking > 0) e.talking -= dt;
      // lumière d'Écho
      const game = this.game;
      if (!this.hidden) {
        const bright = game.flag('flamme') ? 1.15 : 1;
        game.lights.push({ x: e.x, y: e.y, r: 175 * bright * e.power, color: '#ffd9f2', a: 1 * e.power });
        game.lights.push({ x: this.cx, y: this.cy, r: 70, color: '#ffe8f4', a: 0.5 });
      }
    }

    draw(ctx) {
      if (this.hidden) return;
      const b = this.body;
      const x = this.cx, y = this.feetY;
      // ombre
      if (b.onGround) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, y, 12, 3.5, 0, 0, U.TAU); ctx.fill(); }
      // images rémanentes (Élan)
      for (const tr of this.trail) {
        ctx.globalAlpha = tr.a * 0.55;
        Chars.drawBody(ctx, Chars.LOOKS.laura, tr.pose, tr.x, tr.y, { facing: tr.f, time: this.t });
      }
      ctx.globalAlpha = 1;
      if (this.invuln > 0 && !this.dead && Math.floor(this.invuln * 14) % 2 === 0) ctx.globalAlpha = 0.45;
      Chars.drawBody(ctx, Chars.LOOKS.laura, this.pose, x, y, { facing: b.facing, time: this.t });
      ctx.globalAlpha = 1;
    }
    drawEcho(ctx) {
      if (this.hidden || this.echoHidden) return;
      const e = this.echo;
      const game = this.game;
      const p = game.pulseFlash || 0;
      C.drawEcho(ctx, e.x, e.y, { time: this.t, facing: e.x < this.cx ? 1 : -1, talking: e.talking > 0, power: e.power, color: p > 0.1 ? '#5ef2d6' : '#ff7ad9', antenna: game.flag('ending_done') });
    }
  }
  const C = Chars;
  HOL.Player = Player;
})();
