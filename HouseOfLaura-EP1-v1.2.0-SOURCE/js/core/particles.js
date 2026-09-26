/* House of Laura · particules (étincelles, feuilles, plumes, bulles, anneaux…) */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U, G = HOL.G;

  const R = (v) => (Array.isArray(v) ? U.rand(v[0], v[1]) : v);

  class Particles {
    constructor() { this.list = []; this.max = 1400; }
    clear() { this.list.length = 0; }
    emit(o) {
      if (this.list.length >= this.max) this.list.shift();
      const p = {
        x: o.x, y: o.y, vx: R(o.vx || 0), vy: R(o.vy || 0),
        life: 0, max: R(o.life || 1), size: R(o.size || 3), size1: o.size1 !== undefined ? R(o.size1) : null,
        color: Array.isArray(o.color) ? U.pick(o.color) : (o.color || '#fff'),
        alpha: o.alpha === undefined ? 1 : R(o.alpha), grav: o.grav || 0, drag: o.drag || 0,
        kind: o.kind || 'dot', rot: R(o.rot || 0), vr: R(o.vr || 0), front: o.front !== false,
        add: !!o.add, text: o.text || '', fade: o.fade || 'out', seed: Math.random() * 100, sway: o.sway || 0
      };
      this.list.push(p);
      return p;
    }
    burst(x, y, n, o) {
      for (let i = 0; i < n; i++) {
        const q = Object.assign({}, o, { x: x + R(o.dx || 0), y: y + R(o.dy || 0) });
        if (o.speed) {
          const a = o.angle !== undefined ? R(o.angle) : U.rand(0, U.TAU);
          const s = R(o.speed);
          q.vx = Math.cos(a) * s + (o.vx ? R(o.vx) : 0);
          q.vy = Math.sin(a) * s + (o.vy ? R(o.vy) : 0);
        }
        this.emit(q);
      }
    }
    update(dt) {
      const L = this.list;
      for (let i = L.length - 1; i >= 0; i--) {
        const p = L[i];
        p.life += dt;
        if (p.life >= p.max) { L[i] = L[L.length - 1]; L.pop(); continue; }
        p.vy += p.grav * dt;
        if (p.drag) { const d = Math.exp(-p.drag * dt); p.vx *= d; p.vy *= d; }
        if (p.sway) p.vx += Math.sin(p.life * 3 + p.seed) * p.sway * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.rot += p.vr * dt;
      }
    }
    draw(ctx, front) {
      const L = this.list;
      for (let i = 0; i < L.length; i++) {
        const p = L[i];
        if (p.front !== front) continue;
        const t = p.life / p.max;
        let a = p.alpha * (p.fade === 'out' ? 1 - t : p.fade === 'inout' ? Math.sin(t * Math.PI) : 1);
        if (a <= 0.01) continue;
        const s = p.size1 !== null ? U.lerp(p.size, p.size1, t) : p.size;
        ctx.globalAlpha = a;
        if (p.add) ctx.globalCompositeOperation = 'lighter';
        switch (p.kind) {
          case 'glow':
            ctx.globalAlpha = 1;
            G.glow(ctx, p.x, p.y, s, p.color, a);
            break;
          case 'spark': {
            ctx.strokeStyle = p.color; ctx.lineWidth = Math.max(1, s * 0.4); ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04); ctx.stroke();
            break;
          }
          case 'leaf': {
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
            ctx.scale(1, Math.abs(Math.sin(p.life * 4 + p.seed)) * 0.8 + 0.2);
            ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.45, 0, 0, U.TAU); ctx.fill();
            ctx.restore();
            break;
          }
          case 'feather': {
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot + Math.sin(p.life * 5 + p.seed) * 0.5);
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.moveTo(0, -s); ctx.quadraticCurveTo(s * 0.5, 0, 0, s); ctx.quadraticCurveTo(-s * 0.35, 0, 0, -s); ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s * 1.2); ctx.stroke();
            ctx.restore();
            break;
          }
          case 'bubble':
            ctx.strokeStyle = p.color; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, U.TAU); ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(p.x - s * 0.4, p.y - s * 0.5, 1.2, 1.2);
            break;
          case 'ring':
            ctx.strokeStyle = p.color; ctx.lineWidth = Math.max(1, 3 * (1 - t));
            ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, U.TAU); ctx.stroke();
            break;
          case 'star': {
            ctx.fillStyle = p.color;
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
            ctx.beginPath();
            ctx.moveTo(0, -s); ctx.quadraticCurveTo(0, 0, s, 0); ctx.quadraticCurveTo(0, 0, 0, s); ctx.quadraticCurveTo(0, 0, -s, 0); ctx.quadraticCurveTo(0, 0, 0, -s);
            ctx.fill(); ctx.restore();
            break;
          }
          case 'shard': {
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
            ctx.fillStyle = p.color; ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.6, s * 0.6); ctx.lineTo(-s * 0.6, s * 0.4); ctx.closePath(); ctx.fill();
            ctx.restore();
            break;
          }
          case 'smoke':
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, U.TAU); ctx.fill();
            break;
          case 'text':
            ctx.globalAlpha = a;
            G.text(ctx, p.text, p.x, p.y, { size: s, color: p.color, align: 'center', outline: 'rgba(20,8,30,0.8)', ow: 3 });
            break;
          case 'square':
            ctx.fillStyle = p.color;
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-s / 2, -s / 2, s, s); ctx.restore();
            break;
          default:
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, U.TAU); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.globalAlpha = 1;
    }
  }
  HOL.Particles = Particles;
})();
