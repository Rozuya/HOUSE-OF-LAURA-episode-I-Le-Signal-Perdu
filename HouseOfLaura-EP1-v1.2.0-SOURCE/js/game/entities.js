/* House of Laura · entités du monde */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U, G = HOL.G, T = HOL.T;
  const E = HOL.E = { types: {} };
  let autoId = 0;

  E.create = function (room, d) {
    const C = E.types[d.type];
    if (!C) { console.warn('[entité] type inconnu', d.type, d); return null; }
    return new C(room, d);
  };

  class Ent {
    constructor(room, d) {
      this.room = room; this.d = d; this.type = d.type;
      this.id = d.id || (d.type + '_' + (autoId++));
      this.w = (d.w || 1) * T; this.h = (d.h || 1) * T;
      this.x = d.x * T + (d.ox || 0);
      this.y = (d.y + 1) * T - this.h + (d.oy || 0);
      this.t = Math.random() * 10;
      this.dead = false;
    }
    get cx() { return this.x + this.w / 2; }
    get cy() { return this.y + this.h / 2; }
    get game() { return this.room.game; }
    overlapsPlayer(pad) {
      const b = this.game.player.body; pad = pad || 0;
      return b.x < this.x + this.w + pad && b.x + b.w > this.x - pad && b.y < this.y + this.h + pad && b.y + b.h > this.y - pad;
    }
    update(dt) { this.t += dt; }
    draw() {}
    // interaction
    interactBox() { return { x: this.x - 16, y: this.y - 16, w: this.w + 32, h: this.h + 32 }; }
    canInteract() { return null; }
  }
  E.Ent = Ent;
  function reg(name, C) { E.types[name] = C; C.prototype.type = name; }

  // =================================================================
  // PNJ
  // =================================================================
  class NPC extends Ent {
    constructor(room, d) {
      super(room, d);
      this.cid = d.id;
      this.id = d.id;
      this.look = HOL.Chars.LOOKS[d.id];
      this.info = HOL.Chars.INFO[d.id];
      this.w = 22; this.h = 56;
      this.x = d.x * T + 16 - 11 + (d.ox || 0);
      this.y = (d.y + 1) * T - this.h;
      this.facing = d.face || -1;
      this.pose = HOL.Chars.basePose();
      this.anim = d.anim || 'idle'; this.animT = 0;
      this.walk = null; this.phase = 0; this.talking = 0;
      this.grayT = this.isGray() ? 1 : 0;
      this.emote = null;
      this.noDecor = true;
      this.hidden = !!d.hidden;
      this.fixedFace = !!d.fixedFace;
    }
    isGray() {
      if (this.d.alwaysColor) return false;
      return !this.game.save.reconnected[this.cid];
    }
    setAnim(a) { if (this.anim !== a) { this.anim = a; this.animT = 0; } }
    walkTo(x, speed) { this.walk = { x, speed: speed || 90 }; }
    update(dt, game) {
      this.t += dt; this.animT += dt;
      const target = this.isGray() ? 1 : 0;
      this.grayT = U.approach(this.grayT, target, dt * 0.8);
      if (this.walk) {
        const dx = this.walk.x - (this.x + this.w / 2);
        if (Math.abs(dx) < 3) { this.walk = null; this.setAnim('idle'); }
        else {
          this.facing = Math.sign(dx);
          this.x += Math.sign(dx) * Math.min(Math.abs(dx), this.walk.speed * dt);
          this.phase += dt * this.walk.speed * 0.075;
          this.setAnim(this.walk.speed > 150 ? 'run' : 'walk');
        }
      } else if (!this.isGray() && !this.fixedFace && this.anim === 'idle') {
        const p = game.player;
        const dx = p.cx - this.cx;
        if (Math.abs(dx) < 180 && Math.abs(dx) > 6) this.facing = Math.sign(dx);
      }
      if (this.emote) { this.emote.t -= dt; if (this.emote.t <= 0) this.emote = null; }
      const tp = HOL.Chars.poseFor({ anim: this.grayT > 0.6 ? 'idle' : this.anim, t: this.animT, phase: this.phase, time: this.t });
      if (this.grayT > 0.6) { tp.bob = 0; tp.lSh = -0.05; tp.rSh = 0.05; tp.head = 0.12; tp.face = 'tired'; }
      tp.talk = this.talking > 0 ? 1 : 0;
      if (this.talking > 0) this.talking -= dt;
      HOL.Chars.blendPose(this.pose, tp, Math.min(1, dt * 14));
    }
    canInteract(game) {
      if (this.hidden || this.d.noTalk) return null;
      return this.isGray() ? 'Reconnecter' : 'Parler';
    }
    interact(game) { game.story.talk(this.cid, this); }
    draw(ctx, game) {
      if (this.hidden) return;
      const x = this.x + this.w / 2, y = this.y + this.h;
      // ombre au sol
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x, y, 13, 3.5, 0, 0, U.TAU); ctx.fill();
      const gray = this.grayT;
      if (gray > 0.05) {
        // aura grise de "déconnexion"
        ctx.globalAlpha = 0.5 * gray;
        G.glow(ctx, x, y - 30, 40, '#8a8aa0', 0.25 * gray);
        ctx.globalAlpha = 1;
      }
      HOL.Chars.drawBody(ctx, this.look, this.pose, x, y, { facing: this.facing, gray: gray, time: this.t });
      if (gray > 0.3) {
        // grésillement
        if (Math.sin(this.t * 7) > 0.85) { ctx.fillStyle = 'rgba(200,200,220,0.25)'; ctx.fillRect(x - 12, y - 40 + Math.random() * 30, 24, 1.5); }
      }
      // indicateurs
      const hy = y - 70 * (this.look.scale || 1);
      if (this.emote) drawEmote(ctx, x, hy - 4, this.emote.sym, this.emote.t);
      else if (gray > 0.5) { if (Math.sin(this.t * 1.5) > 0.3) drawEmote(ctx, x, hy, '…', 1); }
      else if (game.story.hasNews(this.cid)) drawEmote(ctx, x, hy + Math.sin(this.t * 4) * 2, '!', 1, HOL.Chars.INFO[this.cid].color);
    }
  }
  function drawEmote(ctx, x, y, sym, t, col) {
    const a = U.clamp(t * 3, 0, 1);
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.strokeStyle = '#1b1022'; ctx.lineWidth = 1.5;
    G.rr(ctx, x - 11, y - 20, 22, 18, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 3, y - 2); ctx.lineTo(x, y + 3); ctx.lineTo(x + 3, y - 2); ctx.fill();
    if (sym === '♥') { ctx.fillStyle = '#ff5fae'; G.heart(ctx, x, y - 16, 10); ctx.fill(); }
    else G.text(ctx, sym, x, y - 6, { size: 13, color: col || '#2a1838', align: 'center' });
    ctx.globalAlpha = 1;
  }
  E.drawEmote = drawEmote;
  reg('npc', NPC);

  // =================================================================
  // COLLECTIBLES
  // =================================================================
  class Crystal extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = 20; this.h = 20;
      this.x = d.x * T + 6; this.y = d.y * T + 6;
      this.cid = d.id;
      if (room.game.save.crystals[this.cid]) this.dead = true;
    }
    update(dt, game) {
      this.t += dt;
      if (this.overlapsPlayer(4)) {
        this.dead = true;
        game.save.crystals[this.cid] = 1;
        const n = game.save.countCrystals();
        HOL.Audio.sfx('collect', { step: (n % 5) * 2 });
        game.particles.burst(this.cx, this.cy, 16, { speed: [60, 200], life: [0.4, 0.9], size: [2, 4], color: ['#ff8ad8', '#ffd1f2', '#9ae6ff'], kind: 'star', vr: [-6, 6], drag: 2 });
        game.particles.emit({ x: this.cx, y: this.cy, size: 10, size1: 50, life: 0.5, kind: 'ring', color: '#ff9ae0' });
        game.ui.crystalPing();
      }
    }
    draw(ctx, game) {
      const x = this.cx, y = this.cy + Math.sin(this.t * 2.5) * 3;
      G.glow(ctx, x, y, 26, '#ff7ad9', 0.45 + 0.15 * Math.sin(this.t * 4));
      ctx.save(); ctx.translate(x, y); ctx.scale(Math.cos(this.t * 2) * 0.35 + 0.75, 1);
      ctx.fillStyle = '#ff8ad8'; ctx.strokeStyle = '#5a1a4a'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(7, -2); ctx.lineTo(0, 10); ctx.lineTo(-7, -2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffd1f2'; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(3, -2); ctx.lineTo(0, 4); ctx.lineTo(-3, -2); ctx.closePath(); ctx.fill();
      ctx.restore();
      if (Math.sin(this.t * 3) > 0.95) game.particles.emit({ x: x + U.rand(-8, 8), y: y + U.rand(-8, 8), size: 2.5, life: 0.5, kind: 'star', color: '#fff' });
    }
  }
  reg('crystal', Crystal);

  class Polaroid extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = 24; this.h = 28; this.x = d.x * T + 4; this.y = d.y * T + 2;
      this.pid = d.id;
      if (room.game.save.polaroids[this.pid]) this.dead = true;
    }
    update(dt, game) {
      this.t += dt;
      if (this.overlapsPlayer(4)) {
        this.dead = true;
        game.save.polaroids[this.pid] = 1;
        HOL.Audio.sfx('polaroid');
        game.flash('#ffffff', 0.25);
        game.particles.burst(this.cx, this.cy, 20, { speed: [60, 220], life: [0.5, 1], size: [2, 4], color: ['#fff', '#ffd28a', '#ff9f43'], kind: 'star', drag: 2 });
        const n = game.save.countPolaroids();
        game.ui.banner('Polaroïd retrouvé', HOL.Story.POLAROIDS[this.pid] || '', n + ' / 6 · à rapporter à Cocol_');
      }
    }
    draw(ctx, game) {
      const x = this.cx, y = this.cy + Math.sin(this.t * 2) * 3;
      G.glow(ctx, x, y, 34, '#ffd28a', 0.4);
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(this.t * 1.5) * 0.25); ctx.scale(Math.cos(this.t * 1.7) * 0.2 + 0.9, 1);
      ctx.fillStyle = '#fbf7ee'; ctx.strokeStyle = '#1b1022'; ctx.lineWidth = 1.3;
      ctx.fillRect(-10, -12, 20, 24); ctx.strokeRect(-10, -12, 20, 24);
      const g = ctx.createLinearGradient(0, -9, 0, 5); g.addColorStop(0, '#ff9ad0'); g.addColorStop(1, '#7a5ad8');
      ctx.fillStyle = g; ctx.fillRect(-7.5, -9.5, 15, 14);
      ctx.fillStyle = '#ffe6a0'; ctx.beginPath(); ctx.arc(3, -5, 2.5, 0, U.TAU); ctx.fill();
      ctx.fillStyle = '#2a1838'; ctx.beginPath(); ctx.moveTo(-7.5, 4.5); ctx.lineTo(-2, -2); ctx.lineTo(2, 2); ctx.lineTo(7.5, -3); ctx.lineTo(7.5, 4.5); ctx.fill();
      ctx.restore();
    }
  }
  reg('polaroid', Polaroid);

  class Item extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = 22; this.h = 22; this.x = d.x * T + 5; this.y = d.y * T + 6;
      if (room.game.save.items[d.item] || (d.flag && room.game.flag(d.flag))) this.dead = true;
    }
    update(dt, game) {
      this.t += dt;
      if (!this.d.interactOnly && this.overlapsPlayer(2)) this.take(game);
    }
    canInteract() { return this.d.interactOnly ? (this.d.label || 'Prendre') : null; }
    interact(game) { this.take(game); }
    take(game) {
      if (this.dead) return;
      this.dead = true;
      game.story.giveItem(this.d.item, this);
    }
    draw(ctx, game) {
      const x = this.cx, y = this.cy + Math.sin(this.t * 2.2) * 2.5;
      G.glow(ctx, x, y, 28, '#fff2b0', 0.35);
      HOL.Props.item(ctx, this.d.icon || this.d.item, x, y, this.t);
    }
  }
  reg('item', Item);

  class Heal extends Ent {
    constructor(room, d) { super(room, d); this.w = 18; this.h = 18; this.x = d.x * T + 7; this.y = d.y * T + 8; }
    update(dt, game) {
      this.t += dt;
      const p = game.player;
      if (p.hp < p.maxHp && this.overlapsPlayer(2)) {
        this.dead = true; p.heal(1);
        game.particles.burst(this.cx, this.cy, 12, { speed: [40, 120], life: [0.4, 0.8], size: [2, 4], color: ['#ff5fae', '#ffd1f2'], kind: 'star' });
      }
    }
    draw(ctx) {
      const x = this.cx, y = this.cy + Math.sin(this.t * 3) * 2;
      G.glow(ctx, x, y, 20, '#ff5fae', 0.4);
      ctx.fillStyle = '#ff5fae'; ctx.strokeStyle = '#4a0a2a'; ctx.lineWidth = 1.2;
      G.heart(ctx, x, y - 7, 14); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(x - 3, y - 3, 1.6, 0, U.TAU); ctx.fill();
    }
  }
  reg('heal', Heal);

  // =================================================================
  // PORTES / PANNEAUX / DÉCLENCHEURS
  // =================================================================
  class Door extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = (d.w || 1.4) * T; this.h = (d.h || 2.2) * T;
      this.x = d.x * T + 16 - this.w / 2; this.y = (d.y + 1) * T - this.h;
      this.noDecor = true;
    }
    canInteract(game) { return this.d.label || 'Entrer'; }
    interactBox() { return { x: this.x - 4, y: this.y, w: this.w + 8, h: this.h }; }
    interact(game) {
      if (this.d.locked && !game.story.cond(this.d.locked)) {
        const msg = this.d.lockedMsg || 'C\'est fermé.';
        if (this.d.lockedEvent) game.story.event(this.d.lockedEvent, this);
        else game.story.quickSay(this.d.lockedWho || 'laura', msg, this.d.lockedExpr || 'think');
        return;
      }
      if (this.d.event) { game.story.event(this.d.event, this); return; }
      HOL.Audio.sfx('door');
      game.gotoRoom(this.d.to, this.d.spawn, { fade: true });
    }
    draw(ctx, game) {
      if (this.d.style === 'none') return;
      HOL.Props.door(ctx, this.d.style || 'wood', this.x, this.y, this.w, this.h, this.t, this.d, game);
    }
  }
  reg('door', Door);

  class Sign extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = (d.w || 1) * T; this.h = (d.h || 1) * T;
      this.x = d.x * T + 16 - this.w / 2; this.y = (d.y + 1) * T - this.h;
      this.noDecor = true;
    }
    canInteract() { return this.d.label || 'Lire'; }
    interact(game) {
      if (this.d.event) { game.story.event(this.d.event, this); return; }
      game.story.readSign(this.d);
    }
    draw(ctx, game) {
      if (this.d.style === 'none' || this.d.invisible) return;
      HOL.Props.sign(ctx, this.d.style || 'sign', this.x, this.y, this.w, this.h, this.t, this.d, game);
    }
  }
  reg('sign', Sign);

  class Trigger extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = (d.w || 1) * T; this.h = (d.h || 3) * T;
      this.x = d.x * T; this.y = (d.y + 1) * T - this.h;
      this.fired = false;
      if (d.once && d.flag && room.game.flag(d.flag)) this.dead = true;
    }
    update(dt, game) {
      if (this.fired && this.d.once !== false) return;
      if (game.cutscene.active) return;
      if (this.d.if && !game.story.cond(this.d.if)) return;
      const inside = this.overlapsPlayer(0);
      if (inside && !this.was) {
        this.fired = true;
        if (this.d.flag) game.setFlag(this.d.flag);
        game.story.event(this.d.event, this);
      }
      this.was = inside;
    }
  }
  reg('trigger', Trigger);

  class Lever extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = T; this.h = T; this.x = d.x * T; this.y = d.y * T;
      this.pulled = d.flag ? room.game.flag(d.flag) : false;
      this.anim = this.pulled ? 1 : 0;
      this.noDecor = true;
    }
    canInteract(game) {
      if (this.d.hideIf && game.story.cond(this.d.hideIf)) return null;
      return this.d.label || 'Actionner';
    }
    interact(game) { game.story.event(this.d.event, this); }
    update(dt) { this.t += dt; this.anim = U.approach(this.anim, this.pulled ? 1 : 0, dt * 6); }
    draw(ctx, game) { HOL.Props.lever(ctx, this.d.style || 'lever', this.x, this.y, this.anim, this.t, this.d, game); }
  }
  reg('lever', Lever);

  // =================================================================
  // PUZZLE : lampadaires (quartier)
  // =================================================================
  class Lamp extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = 20; this.h = 4 * T; this.x = d.x * T + 6; this.y = (d.y + 1) * T - this.h;
      this.on = false; this.glow = 0; this.flick = 0;
      this.noDecor = true;
    }
    canInteract(game) { return game.flag('lamps_done') ? null : 'Allumer'; }
    interactBox() { return { x: this.x - 14, y: this.y + this.h - 64, w: this.w + 28, h: 64 }; }
    interact(game) { game.story.lampHit(this); }
    update(dt, game) {
      this.t += dt;
      if (game.flag('lamps_done')) this.on = true;
      this.glow = U.approach(this.glow, this.on ? 1 : 0, dt * 3);
      if (this.flick > 0) this.flick -= dt;
      if (this.glow > 0.1) game.lights.push({ x: this.cx, y: this.y + 10, r: 170 * this.glow, color: '#ffd28a', a: 0.9 * this.glow });
    }
    draw(ctx, game) { HOL.Props.lamppost(ctx, this.x, this.y, this.w, this.h, this.glow, this.d.sym, this.t, this.flick > 0); }
  }
  reg('lamp', Lamp);

  // =================================================================
  // PUZZLE : pierres à pousser + dalles
  // =================================================================
  class Block extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = T; this.h = T; this.home = { x: this.x, y: this.y };
      const st = room.persist.blocks && room.persist.blocks[this.id];
      if (st) { this.x = st.x; this.y = st.y; }
      this.vy = 0; this.solid = true; this.onGround = true;
    }
    solidBox() { return { x: this.x, y: this.y, w: this.w, h: this.h, ent: this, pushable: true, surface: 'stone' }; }
    blockedAt(nx, ny) {
      const r = this.room;
      const l = Math.floor(nx / T), rr = Math.floor((nx + this.w - 0.01) / T), t = Math.floor(ny / T), b = Math.floor((ny + this.h - 0.01) / T);
      for (let ty = t; ty <= b; ty++) for (let tx = l; tx <= rr; tx++) if (r.solidAt(tx, ty)) return true;
      for (const e of r.entities) {
        if (e === this || e.dead) continue;
        if ((e.type === 'block' || (e.type === 'gate' && e.solid)) && nx < e.x + e.w && nx + this.w > e.x && ny < e.y + e.h && ny + this.h > e.y) return true;
      }
      return false;
    }
    push(dir, amount) {
      if (!this.onGround) return false;
      const nx = this.x + dir * amount;
      if (this.blockedAt(nx, this.y)) return false;
      this.x = nx;
      this.pushSnd = (this.pushSnd || 0) + amount;
      if (this.pushSnd > 20) { this.pushSnd = 0; HOL.Audio.sfx('step', { surface: 'stone', vol: 1.5 }); }
      return true;
    }
    update(dt, game) {
      this.t += dt;
      // gravité
      this.vy = Math.min(this.vy + 1600 * dt, 700);
      let ny = this.y + this.vy * dt;
      // on s'aligne sur la grille quand on tombe
      if (this.blockedAt(this.x, ny) || this.landOneWay(ny)) {
        ny = Math.floor((ny + this.h) / T) * T - this.h;
        while (this.blockedAt(this.x, ny)) ny -= 1;
        if (!this.onGround && this.vy > 200) { HOL.Audio.sfx('land', { vol: 1.4 }); game.shake(3, 0.15); game.particles.burst(this.cx, this.y + this.h, 8, { speed: [20, 80], angle: [-Math.PI, 0], life: [0.4, 0.8], size: [6, 10], color: 'rgba(200,190,170,0.4)', kind: 'smoke' }); }
        this.vy = 0; this.onGround = true;
      } else this.onGround = false;
      if (!this.onGround) {
        // en chute : se cale sur la tuile la plus proche
        this.x = U.approach(this.x, Math.round(this.x / T) * T, 200 * dt);
      }
      this.y = ny;
      if (this.y > this.room.ph + 64) { this.x = this.home.x; this.y = this.home.y; this.vy = 0; game.particles.burst(this.cx, this.cy, 12, { speed: [20, 80], life: [0.5, 1], size: [3, 5], color: '#9dff7a', kind: 'glow' }); }
      (this.room.persist.blocks = this.room.persist.blocks || {})[this.id] = { x: this.x, y: this.y };
    }
    landOneWay(ny) {
      if (this.vy <= 0) return false;
      const ty = Math.floor((ny + this.h) / T);
      const oldBot = this.y + this.h;
      const l = Math.floor(this.x / T), r = Math.floor((this.x + this.w - 0.01) / T);
      for (let tx = l; tx <= r; tx++) if (this.room.oneWayAt(tx, ty) && oldBot <= ty * T + 0.5) return true;
      return false;
    }
    reset() { this.x = this.home.x; this.y = this.home.y; this.vy = 0; }
    draw(ctx, game) { HOL.Props.stone(ctx, this.x, this.y, this.t, this.room.theme.name); }
  }
  reg('block', Block);

  class Plate extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = T; this.h = 8; this.x = d.x * T; this.y = (d.y + 1) * T - 8;
      this.pressed = false; this.k = 0;
      // La dalle est l'OBJECTIF de l'enigme : elle doit rester visible. Sans
      // ca, l'herbe et les buissons poses automatiquement sur la tuile du sol
      // la recouvraient et on ne la voyait plus du tout.
      this.noDecor = true;
      this.noDecorPad = 20;
    }
    update(dt, game) {
      this.t += dt;
      let p = false;
      for (const e of this.room.entities) {
        if (e.type === 'block' && Math.abs(e.cx - this.cx) < 14 && Math.abs((e.y + e.h) - (this.y + 8)) < 6) p = true;
      }
      if (p && !this.pressed) { HOL.Audio.sfx('lamp', { note: 60 + (this.d.idx || 0) * 4 }); game.particles.burst(this.cx, this.y, 10, { speed: [30, 90], angle: [-Math.PI, 0], life: [0.5, 1], size: [2, 4], color: '#9dff7a', kind: 'glow' }); }
      this.pressed = p;
      this.k = U.approach(this.k, p ? 1 : 0, dt * 4);
      if (this.k > 0.05) game.lights.push({ x: this.cx, y: this.y, r: 80 * this.k, color: '#9dff7a', a: 0.6 * this.k });
    }
    draw(ctx, game) {
      const x = this.x, y = this.y + this.k * 3;
      const pulse = 0.5 + 0.5 * Math.sin(this.t * 2.2);
      // Tant que la pierre n'est pas posee, la dalle doit sauter aux yeux :
      // c'est l'objectif, et elle se perdait dans l'herbe. Elle pulse donc
      // legerement en attendant, et passe au vert une fois pesee.
      ctx.fillStyle = '#4a4a3e'; ctx.fillRect(x + 1, y + 2, T - 2, 6);
      ctx.fillStyle = U.mix('#d8d2ae', '#9dff7a', this.k); ctx.fillRect(x + 3, y, T - 6, 4);
      ctx.strokeStyle = U.rgba('#9dff7a', 0.35 + this.k * 0.65); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(x + 16, y + 2, 5, Math.PI, U.TAU); ctx.stroke();
      if (this.k > 0.1) G.glow(ctx, x + 16, y, 34, '#9dff7a', 0.55 * this.k);
      else G.glow(ctx, x + 16, y, 20 + 9 * pulse, '#ffe9a8', 0.16 + 0.13 * pulse);
    }
  }
  reg('plate', Plate);

  // =================================================================
  // PORTAIL / BARRIÈRE (solide tant que la condition est fausse)
  // =================================================================
  class Gate extends Ent {
    constructor(room, d) {
      super(room, d);
      this.x = d.x * T; this.y = (d.y + 1) * T - this.h;
      this.openK = room.game.story.cond(d.open) ? 1 : 0;
      this.solid = this.openK < 1;
    }
    solidBox() { return this.openK >= 0.99 ? null : { x: this.x, y: this.y, w: this.w, h: this.h, ent: this }; }
    update(dt, game) {
      this.t += dt;
      const want = game.story.cond(this.d.open) ? 1 : 0;
      if (want && this.openK === 0) { HOL.Audio.sfx(this.d.style === 'barrier' ? 'static' : 'door', { vol: 1.3 }); game.shake(4, 0.4); }
      this.openK = U.approach(this.openK, want, dt * 0.8);
      this.solid = this.openK < 0.99;
      if (this.openK > 0 && this.openK < 1 && Math.random() < 0.5) {
        game.particles.emit({ x: this.x + Math.random() * this.w, y: this.y + this.h * Math.random(), vx: [-20, 20], vy: [-40, -10], life: [0.5, 1], size: [3, 6], color: this.d.style === 'roots' ? '#6a4a2a' : 'rgba(200,190,220,0.5)', kind: this.d.style === 'roots' ? 'leaf' : 'smoke' });
      }
    }
    canInteract(game) { return (this.d.msg && this.openK < 0.5) ? 'Examiner' : null; }
    interact(game) { game.story.quickSay('laura', this.d.msg, 'think'); }
    draw(ctx, game) { HOL.Props.gate(ctx, this.d.style || 'iron', this.x, this.y, this.w, this.h, this.openK, this.t); }
  }
  reg('gate', Gate);

  // =================================================================
  // PLATEFORMES SPÉCIALES
  // =================================================================
  class Spring extends Ent {
    constructor(room, d) { super(room, d); this.w = 28; this.h = 16; this.x = d.x * T + 2; this.y = (d.y + 1) * T - 16; this.k = 0; this.noDecor = true; }
    update(dt, game) {
      this.t += dt;
      this.k = U.approach(this.k, 0, dt * 4);
      const b = game.player.body;
      if (b.vy > 50 && b.x + b.w > this.x + 2 && b.x < this.x + this.w - 2 && b.y + b.h >= this.y && b.y + b.h <= this.y + 14) {
        b.y = this.y - b.h;
        HOL.Phys.bounce(b, HOL.Phys.SPRING_V);
        game.player.onBounce('spring');
        this.k = 1;
        HOL.Audio.sfx('spring');
        game.particles.burst(this.cx, this.y, 10, { speed: [40, 140], angle: [-Math.PI, 0], life: [0.4, 0.8], size: [2, 3], color: ['#ffd1f2', '#ff8ad8'], kind: 'star' });
      }
    }
    draw(ctx, game) { HOL.Props.spring(ctx, this.x, this.y, this.w, this.h, this.k, this.room.theme.name); }
  }
  reg('spring', Spring);

  class Crumble extends Ent {
    constructor(room, d) { super(room, d); this.w = T; this.h = 12; this.x = d.x * T; this.y = d.y * T; this.state = 0; this.timer = 0; this.solid = true; }
    solidBox() { return this.state < 2 ? { x: this.x, y: this.y, w: this.w, h: this.h, oneWay: true, ent: this, surface: 'wood' } : null; }
    update(dt, game) {
      this.t += dt;
      const b = game.player.body;
      const on = b.onGround && b.groundEnt && b.groundEnt.ent === this;
      if (this.state === 0 && on) { this.state = 1; this.timer = 0.45; HOL.Audio.sfx('crumble'); }
      if (this.state === 1) { this.timer -= dt; if (this.timer <= 0) { this.state = 2; this.timer = 2.8; game.particles.burst(this.cx, this.y + 6, 10, { speed: [20, 80], life: [0.6, 1.2], size: [3, 6], color: '#7a6a5a', kind: 'shard', grav: 800, vr: [-6, 6] }); } }
      else if (this.state === 2) { this.timer -= dt; if (this.timer <= 0) { this.state = 0; } }
    }
    draw(ctx, game) {
      if (this.state === 2) { ctx.globalAlpha = 0.15; }
      const sh = this.state === 1 ? (Math.random() - 0.5) * 2 : 0;
      HOL.Props.crumble(ctx, this.x + sh, this.y, this.room.theme.name, this.state === 1);
      ctx.globalAlpha = 1;
    }
  }
  reg('crumble', Crumble);

  class Mover extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = (d.w || 3) * T; this.h = 12; this.x0 = d.x * T; this.y0 = d.y * T; this.x = this.x0; this.y = this.y0;
      this.solid = true; this.dx = 0; this.dy = 0; this.vy = 0;
    }
    solidBox() { return { x: this.x, y: this.y, w: this.w, h: this.h, oneWay: true, ent: this, dx: this.dx, dy: this.dy, vy: this.vy, surface: 'metal' }; }
    update(dt, game) {
      this.t += dt;
      const per = this.d.period || 4;
      const k = (Math.sin((this.t / per) * U.TAU) + 1) / 2;
      const nx = this.x0 + (this.d.dx || 0) * T * k, ny = this.y0 + (this.d.dy || 0) * T * k;
      this.dx = nx - this.x; this.dy = ny - this.y; this.vy = this.dy / Math.max(dt, 1e-4);
      this.x = nx; this.y = ny;
    }
    draw(ctx, game) { HOL.Props.mover(ctx, this.x, this.y, this.w, this.room.theme.name, this.t); }
  }
  reg('mover', Mover);

  // =================================================================
  // EAU DYNAMIQUE (écluses) + flotteurs + vannes
  // =================================================================
  class Water extends Ent {
    constructor(room, d) {
      super(room, d);
      this.x = d.x * T; this.w = d.w * T;
      this.bottom = (d.bottom + 1) * T;
      this.levels = d.levels;
      const saved = room.persist.water && room.persist.water[this.id];
      this.level = saved || d.level || 'mid';
      this.surf = this.levels[this.level];
      this.water = { x: this.x, y: 0, w: this.w, h: this.bottom, surf: this.surf, current: d.current || 0 };
    }
    setLevel(l) {
      if (this.level === l) return;
      this.level = l;
      (this.room.persist.water = this.room.persist.water || {})[this.id] = l;
      HOL.Audio.sfx('water_rise');
      this.game.shake(2, 2.2);
    }
    update(dt, game) {
      this.t += dt;
      const target = this.levels[this.level];
      const before = this.surf;
      this.surf = U.approach(this.surf, target, dt * 110);
      this.water.surf = this.surf; this.water.h = this.bottom; this.water.dy = this.surf - before;
      if (Math.abs(this.surf - target) > 1 && Math.random() < 0.6) {
        game.particles.emit({ x: this.x + Math.random() * this.w, y: this.surf + 4, vx: [-10, 10], vy: [-30, -10], life: [0.4, 0.9], size: [1.5, 3], color: 'rgba(220,250,255,0.8)', kind: 'bubble' });
      }
      if (this.d.current) {
        const b = game.player.body;
        if (b.inWater && b.x + b.w > this.x && b.x < this.x + this.w) {
          // Le courant ne doit PAS pousser le joueur dans la berge. Avant, on
          // modifiait b.x directement, sans aucune collision : a -420 px/s le
          // joueur entrait dans le mur et ne pouvait plus s'en sortir
          // ("je me retrouve dans le mur"). On ne le deplace que si la
          // tuile juste devant lui est libre.
          const T = HOL.T;
          const avant = this.d.current < 0 ? b.x - 3 : b.x + b.w + 3;
          const tx = Math.floor(avant / T);
          const ty = Math.floor((b.y + b.h * 0.5) / T);
          const bloque = this.room.solidAt ? this.room.solidAt(tx, ty) : this.room.tile(tx, ty) === '#';
          if (!bloque) b.x += this.d.current * dt;
        }
        if (Math.random() < 0.4) game.particles.emit({ x: this.x + Math.random() * this.w, y: this.surf + 4 + Math.random() * 30, vx: this.d.current * 1.2, vy: 0, life: [0.5, 1], size: [4, 10], color: 'rgba(230,250,255,0.35)', kind: 'spark', front: true });
      }
    }
    draw(ctx, game) {}
    drawWater(ctx, game, front) {
      const top = this.surf, h = this.bottom - top;
      if (h <= 0) return;
      const col = this.d.color || '#2a6f9a';
      const cam = game.cam;
      const x0 = Math.max(this.x, cam.x - T), x1 = Math.min(this.x + this.w, cam.x + HOL.VIEW_W + T);
      if (!front) {
        const g = ctx.createLinearGradient(0, top, 0, this.bottom);
        g.addColorStop(0, U.rgba(col, 0.5)); g.addColorStop(1, U.rgba(U.shade(col, -0.4), 0.8));
        ctx.fillStyle = g; ctx.fillRect(x0, top + 5, x1 - x0, h - 5);
        // rayons sous-marins
        ctx.fillStyle = 'rgba(180,240,255,0.05)';
        for (let i = 0; i < 6; i++) { const rx = this.x + ((i * 173 + this.t * 12) % this.w); ctx.beginPath(); ctx.moveTo(rx, top); ctx.lineTo(rx + 20, top); ctx.lineTo(rx - 30, this.bottom); ctx.lineTo(rx - 60, this.bottom); ctx.fill(); }
        return;
      }
      ctx.fillStyle = U.rgba(U.shade(col, 0.25), 0.5);
      ctx.beginPath(); ctx.moveTo(x0, top + 10);
      for (let x = x0; x <= x1 + 8; x += 8) ctx.lineTo(x, top + Math.sin(this.t * 3 + x * 0.06) * 2.2 + Math.sin(this.t * 1.4 + x * 0.025) * 1.5);
      ctx.lineTo(x1, top + 10); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(225,250,255,0.75)'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let x = x0; x <= x1 + 8; x += 8) { const y = top + Math.sin(this.t * 3 + x * 0.06) * 2.2 + Math.sin(this.t * 1.4 + x * 0.025) * 1.5; if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
    }
  }
  reg('water', Water);

  class Float extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = (d.w || 2) * T; this.h = 14; this.x = d.x * T; this.solid = true;
      this.y = 0; this.dy = 0; this.dx = 0; this.vy = 0;
    }
    waterEnt() { return this.room.entities.find((e) => e.type === 'water' && e.id === this.d.water); }
    solidBox() { return { x: this.x, y: this.y, w: this.w, h: this.h, oneWay: true, ent: this, dx: 0, dy: this.dy, vy: this.vy, surface: 'wood' }; }
    update(dt, game) {
      this.t += dt;
      const w = this.waterEnt();
      const minY = (this.d.floor + 1) * T - this.h;
      let ny = w ? Math.min(w.surf - 6 + Math.sin(this.t * 2) * 1.5, minY) : minY;
      this.dy = this.y ? ny - this.y : 0; this.vy = this.dy / Math.max(dt, 1e-4);
      this.y = ny;
    }
    draw(ctx) { HOL.Props.crate(ctx, this.x, this.y, this.w, this.h, this.t); }
  }
  reg('float', Float);

  // =================================================================
  // BORNES DE SAUVEGARDE / BRASEROS
  // =================================================================
  class Checkpoint extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = 24; this.h = 44; this.x = d.x * T + 4; this.y = (d.y + 1) * T - 44;
      this.active = false; this.k = 0; this.noDecor = true;
      this.lit = d.style === 'brazier' ? !!(room.persist.lit && room.persist.lit[this.id]) : true;
    }
    canInteract(game) {
      if (this.d.style === 'brazier' && !this.lit) return game.flag('flamme') ? 'Allumer' : null;
      return null;
    }
    interact(game) {
      if (this.d.style === 'brazier' && !this.lit && game.flag('flamme')) {
        this.lit = true; (this.room.persist.lit = this.room.persist.lit || {})[this.id] = 1;
        HOL.Audio.sfx('fire');
        game.particles.burst(this.cx, this.y + 8, 24, { speed: [40, 160], angle: [-Math.PI, 0], life: [0.4, 1], size: [2, 5], color: ['#ffb347', '#ff7043', '#fff2b0'], kind: 'glow' });
        this.activate(game);
      }
    }
    activate(game) {
      if (!this.lit) return;
      const first = !this.active;
      this.active = true;
      game.setCheckpoint(this.room.id, this.cx, this.y + this.h);
      if (first && this.game.player.hp < this.game.player.maxHp) { this.game.player.heal(9); HOL.Audio.sfx('heal'); }
    }
    update(dt, game) {
      this.t += dt;
      if (!this.active && this.lit && this.overlapsPlayer(8)) {
        this.activate(game);
        HOL.Audio.sfx('beep', { freq: 1400 });
        game.particles.burst(this.cx, this.y + 6, 14, { speed: [30, 100], life: [0.5, 1], size: [2, 4], color: this.d.style === 'brazier' ? '#ffb347' : '#ff7ad9', kind: 'star' });
        game.ui.toast('Progression sauvegardée');
      }
      this.k = U.approach(this.k, this.active ? 1 : 0.3, dt * 2);
      if (this.lit) game.lights.push({ x: this.cx, y: this.y + 6, r: this.d.style === 'brazier' ? 230 : 120, color: this.d.style === 'brazier' ? '#ffa24a' : '#ff7ad9', a: this.d.style === 'brazier' ? 1 : 0.6 * this.k, flicker: this.d.style === 'brazier' });
      if (this.lit && this.d.style === 'brazier' && Math.random() < dt * 14) game.particles.emit({ x: this.cx + U.rand(-5, 5), y: this.y + 6, vx: [-10, 10], vy: [-70, -30], life: [0.4, 0.9], size: [1.5, 3], color: ['#ffb347', '#fff2b0', '#ff7043'], kind: 'glow' });
    }
    draw(ctx, game) { HOL.Props.checkpoint(ctx, this.d.style || 'beacon', this.x, this.y, this.w, this.h, this.lit, this.k, this.t); }
  }
  reg('checkpoint', Checkpoint);

  // =================================================================
  // AUTEL DE CAPACITÉ
  // =================================================================
  class Shrine extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = 2 * T; this.h = 2 * T; this.x = d.x * T; this.y = (d.y + 1) * T - this.h;
      this.noDecor = true;
    }
    taken(game) { return !!game.save.abilities[this.d.ability]; }
    canInteract(game) { return this.taken(game) || (this.d.need && !game.story.cond(this.d.need)) ? null : 'Toucher'; }
    interact(game) { game.story.shrine(this); }
    update(dt, game) {
      this.t += dt;
      if (!this.taken(game)) {
        game.lights.push({ x: this.cx, y: this.y, r: 200, color: this.d.color || '#9dff7a', a: 0.8 });
        if (Math.random() < dt * 10) game.particles.emit({ x: this.cx + U.rand(-20, 20), y: this.y + this.h - 10, vx: [-8, 8], vy: [-60, -20], life: [1, 2], size: [2, 4], color: this.d.color || '#9dff7a', kind: 'glow', fade: 'inout' });
      }
    }
    draw(ctx, game) { HOL.Props.shrine(ctx, this.d.ability, this.x, this.y, this.w, this.h, this.taken(game), this.t, this.d.color || '#9dff7a'); }
  }
  reg('shrine', Shrine);

  // =================================================================
  // PUZZLE : résonateurs (ruines)
  // =================================================================
  class Resonator extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = 26; this.h = 40; this.x = d.x * T + 3; this.y = (d.y + 1) * T - 40; this.k = 0; this.noDecor = true;
    }
    canInteract(game) { return game.flag('reso_done') ? null : 'Frapper'; }
    interact(game) { game.story.resoHit(this); }
    ring(game, good) {
      this.k = 1;
      HOL.Audio.sfx('crystal', { note: this.d.note });
      game.particles.emit({ x: this.cx, y: this.cy, size: 8, size1: 70, life: 0.8, kind: 'ring', color: this.d.color });
      game.particles.burst(this.cx, this.cy, 10, { speed: [30, 110], life: [0.5, 1], size: [2, 4], color: this.d.color, kind: 'star' });
    }
    update(dt, game) {
      this.t += dt;
      this.k = U.approach(this.k, 0, dt * 1.5);
      game.lights.push({ x: this.cx, y: this.cy, r: 90 + this.k * 120, color: this.d.color, a: 0.5 + this.k * 0.5 });
    }
    draw(ctx) { HOL.Props.resonator(ctx, this.x, this.y, this.w, this.h, this.d.color, this.k, this.t); }
  }
  reg('resonator', Resonator);

  class Diapason extends Ent {
    constructor(room, d) { super(room, d); this.w = 3 * T; this.h = 4 * T; this.x = d.x * T; this.y = (d.y + 1) * T - this.h; this.k = 0; this.noDecor = true; }
    canInteract(game) { return game.flag('reso_done') ? null : 'Écouter'; }
    interact(game) { game.story.resoListen(this); }
    update(dt, game) {
      this.t += dt; this.k = U.approach(this.k, 0, dt * 1.2);
      game.lights.push({ x: this.cx, y: this.y + 30, r: 220, color: game.flag('reso_done') ? '#5ef2d6' : '#c38aff', a: 0.7 + this.k * 0.3 });
    }
    draw(ctx, game) { HOL.Props.diapason(ctx, this.x, this.y, this.w, this.h, this.k, this.t, game.flag('reso_done')); }
  }
  reg('diapason', Diapason);

  // =================================================================
  // DÉCOR (props dessinés) + LUMIÈRES
  // =================================================================
  class Deco extends Ent {
    constructor(room, d) {
      super(room, d);
      this.x = d.x * T; this.y = (d.y + 1) * T;
      this.fg = !!d.fg; this.noDecor = !!d.clear;
      if (d.clear) { this.w = (d.cw || 3) * T; this.h = (d.ch || 3) * T; this.x = d.x * T - this.w / 2 + 16; this.y = (d.y + 1) * T - this.h; }
      this.bx = d.x * T + (d.dx || 0); this.by = (d.y + 1) * T + (d.dy || 0);
    }
    update(dt, game) {
      this.t += dt;
      if (this.d.light) game.lights.push({ x: this.bx + (this.d.light.dx || 0), y: this.by + (this.d.light.dy || -40), r: this.d.light.r || 140, color: this.d.light.color || '#ffd28a', a: this.d.light.a || 0.9, flicker: this.d.light.flicker });
    }
    draw(ctx, game) {
      if (this.fg) return;
      if (this.d.if && !game.story.cond(this.d.if)) return;
      const f = HOL.Props[this.d.kind];
      if (f) f(ctx, this.bx, this.by, this.d, this.t, game);
    }
    drawFront(ctx, game) {
      if (!this.fg) return;
      const f = HOL.Props[this.d.kind];
      if (f) f(ctx, this.bx, this.by, this.d, this.t, game);
    }
  }
  reg('deco', Deco);

  class Light extends Ent {
    update(dt, game) {
      this.t += dt;
      if (this.d.if && !game.story.cond(this.d.if)) return;
      game.lights.push({ x: this.d.x * T + 16, y: this.d.y * T + 16, r: this.d.r || 160, color: this.d.color || '#ffd28a', a: this.d.a || 1, flicker: this.d.flicker });
    }
  }
  reg('light', Light);

  // =================================================================
  // PIXEL, le chat
  // =================================================================
  class Cat extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = 24; this.h = 20; this.x = d.x * T + 4; this.y = (d.y + 1) * T - 20; this.facing = d.face || -1;
      if (room.game.flag('pixel_found')) this.dead = true;
    }
    canInteract() { return 'Caresser'; }
    interact(game) { game.story.event('cat_found', this); }
    update(dt, game) { this.t += dt; if (Math.random() < dt * 0.2) this.facing *= -1; }
    draw(ctx) { HOL.Chars.drawCat(ctx, this.cx, this.y + this.h, this.t, this.facing, true); }
  }
  reg('cat', Cat);

  // =================================================================
  // MUR DE BRUME (poursuite)
  // =================================================================
  class Chaser extends Ent {
    constructor(room, d) {
      super(room, d);
      this.active = false; this.dir = d.dir || 'right';
      this.pos = d.start * T; this.speed = d.speed || 150;
      this.x = 0; this.y = 0; this.w = 0; this.h = 0;
    }
    start() { this.active = true; this.pos = this.d.start * T; this.grace = 0.8; }
    stop() { this.active = false; }
    update(dt, game) {
      this.t += dt;
      if (!this.active) return;
      if (this.grace > 0) { this.grace -= dt; return; }
      const p = game.player;
      if (this.dir === 'right') {
        // accélère si le joueur est loin (élastique), jamais trop lent
        const gap = p.cx - this.pos;
        const sp = this.speed + (gap > 520 ? (gap - 520) * 0.9 : 0);
        this.pos += sp * dt;
        if (p.cx < this.pos + 10 && !p.dead) game.story.event('chaser_caught', this);
      } else {
        const gap = this.pos - p.cy;
        const sp = this.speed + (gap > 420 ? (gap - 420) * 0.9 : 0);
        this.pos -= sp * dt;
        if (p.cy > this.pos - 10 && !p.dead) game.story.event('chaser_caught', this);
      }
      if (Math.random() < 0.3) HOL.Input.rumble(0.1, 0.2, 60);
    }
    drawFront(ctx, game) {
      if (!this.active && !this.d.alwaysShow) return;
      HOL.Props.fogwall(ctx, this.dir, this.pos, game.cam, this.t);
    }
  }
  reg('chaser', Chaser);

  // =================================================================
  // BAC DU PASSEUR (plateforme scriptée)
  // =================================================================
  class Ferry extends Ent {
    constructor(room, d) {
      super(room, d);
      this.w = (d.w || 5) * T; this.h = 14; this.x = d.x * T; this.solid = true;
      this.y = (d.y + 1) * T - 8;
      const s = room.persist.ferryX; if (s !== undefined) this.x = s;
      this.dx = 0; this.dy = 0; this.vy = 0; this.target = null; this.speed = 80;
    }
    solidBox() { return { x: this.x, y: this.y, w: this.w, h: this.h, oneWay: true, ent: this, dx: this.dx, dy: this.dy, vy: 0, surface: 'wood' }; }
    moveTo(px, speed) { this.target = px; this.speed = speed || 80; }
    update(dt, game) {
      this.t += dt;
      let nx = this.x;
      if (this.target !== null) {
        nx = U.approach(this.x, this.target, this.speed * dt);
        if (nx === this.target) this.target = null;
      }
      this.dx = nx - this.x; this.x = nx;
      const bobY = (this.d.y + 1) * T - 8 + Math.sin(this.t * 1.6) * 2;
      this.dy = bobY - this.y; this.y = bobY;
      this.room.persist.ferryX = this.x;
    }
    draw(ctx) { HOL.Props.ferry(ctx, this.x, this.y, this.w, this.t); }
  }
  reg('ferry', Ferry);
})();
