/* House of Laura · créatures du Silence (Grisailles rampantes, Nuées volantes) */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U, G = HOL.G, T = HOL.T;
  const Ent = HOL.E.Ent;

  class Enemy extends Ent {
    constructor(room, d) {
      super(room, d);
      this.kind = d.kind || 'crawler';
      this.w = this.kind === 'flyer' ? 26 : 30; this.h = this.kind === 'flyer' ? 24 : 22;
      this.x = d.x * T + 16 - this.w / 2;
      this.y = this.kind === 'flyer' ? d.y * T + 4 : (d.y + 1) * T - this.h;
      this.ox = this.x; this.oy = this.y;
      this.dir = d.dir || -1; this.speed = d.speed || (this.kind === 'flyer' ? 45 : 55);
      this.range = (d.range || 4) * T;
      this.hp = 1; this.dying = 0; this.hitT = 0;
      this.seed = Math.random() * 10;
    }
    kill(game, how) {
      if (this.dying) return;
      this.dying = 0.001;
      HOL.Audio.sfx('enemy');
      game.particles.burst(this.cx, this.cy, 18, { speed: [40, 160], life: [0.5, 1.1], size: [3, 7], color: ['rgba(150,145,170,0.6)', 'rgba(90,85,110,0.6)'], kind: 'smoke', drag: 2 });
      game.particles.burst(this.cx, this.cy, 8, { speed: [30, 90], life: [0.8, 1.4], size: [2, 4], color: ['#ff8ad8', '#9ae6ff', '#ffd28a'], kind: 'star', vy: [-60, -20], drag: 1 });
      game.save.stats.enemies = (game.save.stats.enemies || 0) + 1;
    }
    update(dt, game) {
      this.t += dt;
      if (this.dying) { this.dying += dt; if (this.dying > 0.35) this.dead = true; return; }
      const p = game.player, b = p.body;
      if (this.kind === 'crawler') {
        const nx = this.x + this.dir * this.speed * dt;
        // bord / mur : demi-tour
        const aheadX = this.dir > 0 ? nx + this.w + 1 : nx - 1;
        const tx = Math.floor(aheadX / T), footY = Math.floor((this.y + this.h + 2) / T), midY = Math.floor((this.y + this.h / 2) / T);
        const r = this.room;
        const wall = r.solidAt(tx, midY);
        const floor = r.solidAt(tx, footY) || r.oneWayAt(tx, footY);
        if (wall || !floor || Math.abs(nx - this.ox) > this.range) this.dir *= -1;
        else this.x = nx;
      } else {
        // nuée : vol ondulant, approche lente de Laura
        const dx = p.cx - this.cx, dy = p.cy - this.cy;
        const near = Math.hypot(dx, dy) < 230;
        if (near) { this.ox += Math.sign(dx) * this.speed * dt * 0.8; this.oy += Math.sign(dy) * this.speed * dt * 0.5; }
        this.ox = U.clamp(this.ox, this.d.x * T - this.range, this.d.x * T + this.range);
        this.oy = U.clamp(this.oy, this.d.y * T - 3 * T, this.d.y * T + 3 * T);
        this.x = this.ox + Math.sin(this.t * 1.3 + this.seed) * 28;
        this.y = this.oy + Math.sin(this.t * 2.1 + this.seed) * 14;
        this.dir = dx > 0 ? 1 : -1;
      }
      // contact avec Laura
      if (p.dead || p.invuln > 0 && !b.dashT) return;
      const pad = 3;
      if (b.x + b.w > this.x + pad && b.x < this.x + this.w - pad && b.y + b.h > this.y + pad && b.y < this.y + this.h - pad) {
        if (b.dashT > 0) { this.kill(game, 'dash'); return; }
        const stomp = b.vy > 60 && (b.y + b.h) - this.y < 16;
        if (stomp) {
          this.kill(game, 'stomp');
          HOL.Phys.bounce(b, 520);
          p.onBounce('stomp');
          game.shake(3, 0.12);
        } else if (p.invuln <= 0) {
          p.hurt(1, this.cx);
        }
      }
    }
    onPulse(game, px, py, r) {
      if (U.dist(px, py, this.cx, this.cy) < r + 10) this.kill(game, 'pulse');
    }
    draw(ctx, game) {
      const x = this.cx, y = this.cy;
      const s = this.dying ? 1 + this.dying * 3 : 1;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(s, s);
      ctx.globalAlpha = this.dying ? Math.max(0, 1 - this.dying / 0.35) : 1;
      const t = this.t;
      // corps de brume
      const R = this.kind === 'flyer' ? 12 : 14;
      ctx.fillStyle = 'rgba(40,36,56,0.9)';
      ctx.beginPath();
      for (let i = 0; i <= 18; i++) {
        const a = (i / 18) * U.TAU;
        let r = R + Math.sin(a * 4 + t * 5 + this.seed) * 2 + Math.sin(a * 7 - t * 7) * 1.2;
        let yy = Math.sin(a) * r * (this.kind === 'flyer' ? 0.85 : 0.75);
        if (this.kind === 'crawler' && yy > 5) yy = 5 + (yy - 5) * 0.3;
        const px = Math.cos(a) * r, py = yy;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.fill();
      ctx.fillStyle = 'rgba(150,140,175,0.45)';
      ctx.beginPath(); ctx.ellipse(-3, -4, R * 0.6, R * 0.35, -0.3, 0, U.TAU); ctx.fill();
      if (this.kind === 'flyer') {
        // traîne
        ctx.fillStyle = 'rgba(40,36,56,0.6)';
        ctx.beginPath(); ctx.moveTo(-this.dir * 6, 4); ctx.quadraticCurveTo(-this.dir * 20, 10 + Math.sin(t * 6) * 4, -this.dir * 28, 4 + Math.sin(t * 5) * 6); ctx.quadraticCurveTo(-this.dir * 16, 0, -this.dir * 6, -4); ctx.fill();
      }
      // yeux
      const ex = this.dir * 3;
      const blink = Math.sin(t * 1.7 + this.seed) > 0.97;
      ctx.fillStyle = '#f2ecff';
      if (blink) { ctx.fillRect(ex - 6, -2, 4, 1); ctx.fillRect(ex + 2, -2, 4, 1); }
      else { ctx.beginPath(); ctx.ellipse(ex - 4, -2, 2.2, 3, 0, 0, U.TAU); ctx.ellipse(ex + 4, -2, 2.2, 3, 0, 0, U.TAU); ctx.fill(); }
      ctx.restore();
      G.glow(ctx, x + this.dir * 3, y - 2, 14, '#b9a3ff', 0.35);
      if (Math.random() < 0.1) game.particles.emit({ x: x + U.rand(-10, 10), y: y + U.rand(-8, 8), vx: [-10, 10], vy: [-30, -10], life: 0.5, size: [1, 2], color: '#a99ac4', kind: 'square', front: false });
    }
  }
  HOL.E.types.enemy = Enemy;
  Enemy.prototype.type = 'enemy';
})();
