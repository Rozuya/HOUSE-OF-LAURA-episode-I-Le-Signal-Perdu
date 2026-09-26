/* House of Laura · thèmes visuels des zones
 * ciel, parallaxe multicouche pré-rendue, tuiles procédurales, décor automatique, ambiance
 */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U, G = HOL.G, T = HOL.T;
  const VW = HOL.VIEW_W, VH = HOL.VIEW_H;
  const TH = HOL.Themes = {};
  const LW = 1280; // largeur des couches de parallaxe (bouclent)

  // ------------------------------------------------------------------
  // outils de génération de silhouettes (bouclage horizontal parfait)
  // ------------------------------------------------------------------
  function periodic(x, w, seed, harmonics) {
    let v = 0, n = 0;
    const r = U.rng(seed);
    for (let k = 1; k <= harmonics; k++) {
      const a = (r() * 0.8 + 0.2) / k, ph = r() * U.TAU;
      v += Math.sin((x / w) * U.TAU * k * (k < 3 ? 1 : 2) + ph) * a; n += a;
    }
    return v / n;
  }
  function mountains(ctx, w, h, base, amp, color, seed, harm, jag) {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 4) {
      let y = base - amp * (0.5 + 0.5 * periodic(x, w, seed, harm || 6));
      if (jag) y -= Math.abs(periodic(x, w / 8, seed + 9, 3)) * jag;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
  }
  function wrapDraw(w, x, r, fn) { fn(x); if (x - r < 0) fn(x + w); if (x + r > w) fn(x - w); }
  function treeline(ctx, w, base, color, seed, o) {
    const r = U.rng(seed);
    const n = o.count || 40;
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
      const x = r() * w, s = U.lerp(o.min || 20, o.max || 50, r());
      const y = base + r() * (o.jit || 10);
      wrapDraw(w, x, s, (px) => {
        if (o.kind === 'pine') {
          ctx.beginPath();
          for (let k = 0; k < 4; k++) {
            const ky = y - s * 0.4 - k * s * 0.42, kw = s * (0.55 - k * 0.1);
            ctx.moveTo(px - kw, ky + s * 0.28); ctx.lineTo(px, ky - s * 0.45); ctx.lineTo(px + kw, ky + s * 0.28);
          }
          ctx.fill();
          ctx.fillRect(px - s * 0.06, y - s * 0.5, s * 0.12, s * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(px, y - s * 0.9, s * 0.55, 0, U.TAU);
          ctx.arc(px - s * 0.4, y - s * 0.55, s * 0.42, 0, U.TAU);
          ctx.arc(px + s * 0.42, y - s * 0.6, s * 0.45, 0, U.TAU);
          ctx.arc(px, y - s * 1.35, s * 0.4, 0, U.TAU);
          ctx.fill();
          ctx.fillRect(px - s * 0.08, y - s * 0.6, s * 0.16, s * 0.7);
        }
      });
    }
    ctx.fillRect(0, base + (o.jit || 10) - 2, w, 1000);
  }
  function skyline(ctx, w, base, color, win, seed, o) {
    const r = U.rng(seed);
    let x = 0;
    while (x < w) {
      const bw = U.lerp(o.wMin, o.wMax, r()), bh = U.lerp(o.hMin, o.hMax, r());
      const bx = x, by = base - bh;
      ctx.fillStyle = color;
      ctx.fillRect(bx, by, bw - 2, bh + 200);
      if (r() < 0.3) { ctx.fillRect(bx + bw * 0.4, by - 14, 3, 14); }
      if (r() < 0.25) { ctx.beginPath(); ctx.moveTo(bx - 2, by); ctx.lineTo(bx + bw / 2, by - bw * 0.35); ctx.lineTo(bx + bw, by); ctx.fill(); }
      if (win) {
        for (let wy = by + 8; wy < base - 6; wy += o.winGap || 10) for (let wx = bx + 5; wx < bx + bw - 8; wx += o.winGap || 10) {
          if (r() < (o.winP || 0.18)) { ctx.fillStyle = r() < 0.7 ? win : U.shade(win, -0.3); ctx.fillRect(wx, wy, o.winW || 3, o.winH || 4); }
        }
      }
      x += bw;
    }
  }
  function houses(ctx, w, base, P, seed) {
    const r = U.rng(seed);
    let x = 0;
    while (x < w - 40) {
      const hw = U.lerp(90, 150, r()), hh = U.lerp(70, 120, r());
      const bx = x + r() * 10, by = base - hh;
      ctx.fillStyle = P.wall;
      ctx.fillRect(bx, by, hw, hh + 100);
      // toit
      ctx.fillStyle = P.roof;
      ctx.beginPath(); ctx.moveTo(bx - 8, by + 2); ctx.lineTo(bx + hw / 2, by - hw * 0.32); ctx.lineTo(bx + hw + 8, by + 2); ctx.closePath(); ctx.fill();
      if (r() < 0.7) ctx.fillRect(bx + hw * 0.7, by - hw * 0.3, 10, hw * 0.25);
      // fenêtres
      const rows = Math.floor(hh / 38);
      for (let j = 0; j < rows; j++) for (let i = 0; i < 3; i++) {
        const wx = bx + 14 + i * (hw - 28) / 2 - 8, wy = by + 14 + j * 38;
        const lit = r() < 0.45;
        ctx.fillStyle = lit ? P.win : P.winOff;
        ctx.fillRect(wx, wy, 16, 20);
        ctx.fillStyle = P.wall; ctx.fillRect(wx + 7, wy, 2, 20); ctx.fillRect(wx, wy + 9, 16, 2);
      }
      x += hw + U.lerp(10, 40, r());
    }
  }
  function cloudsLayer(ctx, w, h, color, seed, n, yMin, yMax, sMin, sMax) {
    const r = U.rng(seed);
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
      const x = r() * w, y = U.lerp(yMin, yMax, r()), s = U.lerp(sMin, sMax, r());
      wrapDraw(w, x, s * 2, (px) => {
        ctx.beginPath();
        ctx.ellipse(px, y, s * 1.6, s * 0.45, 0, 0, U.TAU);
        ctx.ellipse(px - s * 0.6, y - s * 0.2, s * 0.7, s * 0.4, 0, 0, U.TAU);
        ctx.ellipse(px + s * 0.5, y - s * 0.28, s * 0.8, s * 0.48, 0, 0, U.TAU);
        ctx.fill();
      });
    }
  }
  function fogBand(ctx, w, y, h, color, a) {
    const g = ctx.createLinearGradient(0, y - h, 0, y + h);
    g.addColorStop(0, U.rgba(color, 0)); g.addColorStop(0.5, U.rgba(color, a)); g.addColorStop(1, U.rgba(color, 0));
    ctx.fillStyle = g; ctx.fillRect(0, y - h, w, h * 2);
  }
  function layer(h, fn) { const c = G.canvas(LW, h); fn(c.getContext('2d'), LW, h); return c; }

  // ------------------------------------------------------------------
  // tuiles : forme de base avec coins arrondis
  // ------------------------------------------------------------------
  function tileShape(ctx, x, y, o, r) {
    const tl = o.n && o.w ? r : 0, tr = o.n && o.e ? r : 0, br = o.s && o.e ? r : 0, bl = o.s && o.w ? r : 0;
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + T - tr, y); if (tr) ctx.quadraticCurveTo(x + T, y, x + T, y + tr);
    ctx.lineTo(x + T, y + T - br); if (br) ctx.quadraticCurveTo(x + T, y + T, x + T - br, y + T);
    ctx.lineTo(x + bl, y + T); if (bl) ctx.quadraticCurveTo(x, y + T, x, y + T - bl);
    ctx.lineTo(x, y + tl); if (tl) ctx.quadraticCurveTo(x, y, x + tl, y);
    ctx.closePath();
  }
  function depthCol(a, b, d) { return U.mix(a, b, U.clamp(d / 4, 0, 1)); }
  function specks(ctx, x, y, info, color, n, size) {
    ctx.fillStyle = color;
    for (let i = 0; i < n; i++) {
      const rx = U.hash(info.tx * 7 + i, info.ty * 13, 3), ry = U.hash(info.tx * 11, info.ty * 5 + i, 7);
      const s = (size || 2) * (0.5 + U.hash(info.tx + i, info.ty, 9));
      ctx.fillRect(x + rx * (T - s), y + ry * (T - s), s, s * 0.8);
    }
  }
  function grassCap(ctx, x, y, info, top, hl, under, h) {
    const o = info.open;
    const hh = h || 8;
    ctx.fillStyle = under;
    ctx.beginPath();
    ctx.moveTo(x - (o.w ? 1 : 0), y);
    ctx.lineTo(x + T + (o.e ? 1 : 0), y);
    for (let i = 4; i >= 0; i--) {
      const px = x + (i / 4) * T;
      ctx.lineTo(px, y + hh + 2 + U.hash(info.tx * 5 + i, info.ty, 2) * 4);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = top;
    ctx.beginPath();
    ctx.moveTo(x - (o.w ? 2 : 0), y - 1);
    ctx.lineTo(x + T + (o.e ? 2 : 0), y - 1);
    for (let i = 4; i >= 0; i--) {
      const px = x + (i / 4) * T;
      ctx.lineTo(px, y + hh + U.hash(info.tx * 3 + i, info.ty, 4) * 3);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = hl;
    ctx.fillRect(x, y - 1, T, 2);
    // petits brins
    for (let i = 0; i < 5; i++) {
      const bx = x + U.hash(info.tx, info.ty * 3 + i, 5) * T, bh = 2 + U.hash(info.tx + i, info.ty, 6) * 4;
      ctx.fillStyle = i % 2 ? top : hl;
      ctx.beginPath(); ctx.moveTo(bx - 1.2, y); ctx.lineTo(bx, y - bh); ctx.lineTo(bx + 1.2, y); ctx.fill();
    }
  }

  // ------------------------------------------------------------------
  // THÈMES
  // ------------------------------------------------------------------
  const base = {
    interior: false,
    surface: 'default',
    buildLayers() { return []; },
    sky(ctx) { ctx.fillStyle = '#101018'; ctx.fillRect(0, 0, VW, VH); },
    ambient() {},
    animated() {},
    fogColor: '#9a93a8',
    decorate() {},
    drawDeco() {},
    oneway(ctx, x, y) { ctx.fillStyle = '#8a6040'; ctx.fillRect(x, y, T, 7); },
    spike(ctx, x, y, info) {
      ctx.fillStyle = '#c8c0d8';
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + i * 8, y + T); ctx.lineTo(x + i * 8 + 4, y + T - 18); ctx.lineTo(x + i * 8 + 8, y + T); ctx.fill(); }
    },
    ladder(ctx, x, y) {
      ctx.fillStyle = '#7a5234';
      ctx.fillRect(x + 6, y, 4, T); ctx.fillRect(x + T - 10, y, 4, T);
      for (let i = 0; i < 3; i++) ctx.fillRect(x + 6, y + 5 + i * 11, T - 12, 3);
    },
    breakable(ctx, x, y, info) {
      this.tile(ctx, x, y, info);
      ctx.strokeStyle = 'rgba(10,5,15,0.8)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + 6, y + 4); ctx.lineTo(x + 14, y + 14); ctx.lineTo(x + 10, y + 22); ctx.lineTo(x + 18, y + 30);
      ctx.moveTo(x + 14, y + 14); ctx.lineTo(x + 26, y + 10); ctx.moveTo(x + 10, y + 22); ctx.lineTo(x + 24, y + 24); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,240,200,0.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + 7, y + 5); ctx.lineTo(x + 15, y + 15); ctx.stroke();
    }
  };
  function theme(name, def) { TH[name] = Object.assign({}, base, def, { name }); return TH[name]; }

  // ================= MAISON =================
  theme('maison', {
    interior: true, surface: 'wood', fogColor: '#6b4c7a',
    tile(ctx, x, y, info) {
      const o = info.open, d = info.depth;
      ctx.fillStyle = depthCol('#3a2446', '#1f1228', d);
      tileShape(ctx, x, y, o, 3); ctx.fill();
      if (o.n) {
        // parquet
        ctx.fillStyle = '#8c5b3d'; ctx.fillRect(x, y, T, 9);
        ctx.fillStyle = '#a8734f'; ctx.fillRect(x, y, T, 2);
        ctx.fillStyle = '#6a412a'; ctx.fillRect(x, y + 9, T, 2);
        const seam = Math.floor(U.hash(info.tx, info.ty, 1) * 3) * 10 + 6;
        ctx.fillRect(x + seam, y + 2, 1.5, 7);
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x, y + 11, T, 3);
      }
      if (o.s) { ctx.fillStyle = '#51345c'; ctx.fillRect(x, y + T - 6, T, 6); ctx.fillStyle = '#6a4a78'; ctx.fillRect(x, y + T - 6, T, 1.5); }
      if (o.w && !o.n) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(x, y, 3, T); }
      if (o.e && !o.n) { ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x + T - 3, y, 3, T); }
      if (d >= 1 && !o.n) { ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(x + 2, y + 2, T - 4, 1); }
    },
    oneway(ctx, x, y, info) {
      ctx.fillStyle = '#7a4d33'; ctx.fillRect(x, y, T, 7);
      ctx.fillStyle = '#a06a45'; ctx.fillRect(x, y, T, 2);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, y + 7, T, 2);
      if (info.edgeL) { ctx.fillStyle = '#5a3a26'; ctx.fillRect(x + 4, y + 7, 3, 8); }
      if (info.edgeR) { ctx.fillStyle = '#5a3a26'; ctx.fillRect(x + T - 7, y + 7, 3, 8); }
    },
    ladder(ctx, x, y) {
      ctx.fillStyle = '#9a9aa8'; ctx.fillRect(x + 7, y, 3, T); ctx.fillRect(x + T - 10, y, 3, T);
      ctx.fillStyle = '#c8c8d4'; for (let i = 0; i < 3; i++) ctx.fillRect(x + 7, y + 5 + i * 11, T - 14, 2.5);
    },
    sky(ctx, room, cam, t) {
      const powered = room.state.power !== false;
      const g = ctx.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, powered ? '#2e1840' : '#140b1c'); g.addColorStop(1, powered ? '#1b0f28' : '#0b0610');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      // papier peint (rayures) qui défile avec la caméra
      const off = -(cam.x * 0.95) % 48;
      ctx.fillStyle = powered ? 'rgba(255,160,230,0.035)' : 'rgba(255,255,255,0.015)';
      for (let x = off - 48; x < VW + 48; x += 48) ctx.fillRect(x, 0, 18, VH);
    },
    animated(ctx, room, cam, t) {
      // ruban LED au plafond (dans l'espace monde)
      if (room.state.power === false) return;
      const c1 = '#ff4fd8', c2 = '#9b5cff';
      const y = room.ledY !== undefined ? room.ledY : 2 * T + 4;
      const k = (Math.sin(t * 0.8) + 1) / 2;
      const col = U.mix(c1, c2, k);
      ctx.fillStyle = col; ctx.fillRect(cam.x - 20, y, VW + 40, 3);
      const g = ctx.createLinearGradient(0, y, 0, y + 180);
      g.addColorStop(0, U.rgba(col, 0.28)); g.addColorStop(1, U.rgba(col, 0));
      ctx.fillStyle = g; ctx.fillRect(cam.x - 20, y, VW + 40, 180);
    }
  });

  // ================= QUARTIER =================
  theme('quartier', {
    surface: 'stone', fogColor: '#9a93a8',
    buildLayers(room) {
      return [
        { f: 0.08, c: layer(420, (x, w, h) => { mountains(x, w, h, 330, 120, '#4a3a6a', 11, 5); }) },
        { f: 0.18, c: layer(460, (x, w, h) => { skyline(x, w, 430, '#3b2d58', '#ffcf7a', 21, { wMin: 40, wMax: 90, hMin: 80, hMax: 230, winP: 0.12 }); }) },
        { f: 0.32, c: layer(480, (x, w, h) => { skyline(x, w, 455, '#2e2346', '#ffb85c', 33, { wMin: 60, wMax: 120, hMin: 60, hMax: 160, winP: 0.2, winW: 5, winH: 6, winGap: 14 }); }) },
        { f: 0.5, c: layer(500, (x, w, h) => { houses(x, w, 480, { wall: '#271d3a', roof: '#1e1630', win: '#ffc46b', winOff: '#1a1328' }, 44); }) },
        { f: 0.72, c: layer(520, (x, w, h) => { treeline(x, w, 505, '#171126', 55, { count: 18, min: 40, max: 80, jit: 6 }); }) }
      ];
    },
    sky(ctx, room, cam, t) {
      const g = ctx.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, '#1f1638'); g.addColorStop(0.45, '#4b2a5e'); g.addColorStop(0.8, '#c9667a'); g.addColorStop(1, '#f3a66e');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      // soleil couchant
      G.glow(ctx, VW * 0.7 - cam.x * 0.02, VH * 0.78, 220, '#ffb070', 0.5, true);
      ctx.fillStyle = '#ffd6a0'; ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(VW * 0.7 - cam.x * 0.02, VH * 0.8, 38, 0, U.TAU); ctx.fill(); ctx.globalAlpha = 1;
      // nuages lents
      ctx.fillStyle = 'rgba(255,190,200,0.12)';
      for (let i = 0; i < 6; i++) {
        const x = ((i * 260 + t * 6 - cam.x * 0.05) % (VW + 400)) - 200, y = 60 + (i * 53) % 170;
        ctx.beginPath(); ctx.ellipse(x, y, 120, 16, 0, 0, U.TAU); ctx.ellipse(x + 50, y - 10, 70, 14, 0, 0, U.TAU); ctx.fill();
      }
      // étoiles naissantes
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 40; i++) {
        const sx = U.hash(i, 1, 5) * VW, sy = U.hash(i, 2, 5) * VH * 0.4;
        ctx.globalAlpha = 0.3 + 0.3 * Math.sin(t * 2 + i); ctx.fillRect(sx, sy, 1.5, 1.5);
      }
      ctx.globalAlpha = 1;
    },
    tile(ctx, x, y, info) {
      const o = info.open, d = info.depth;
      ctx.fillStyle = depthCol('#4d4458', '#2a2433', d);
      tileShape(ctx, x, y, o, 4); ctx.fill();
      // briques
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      const off = (info.ty % 2) * 8;
      for (let r = 0; r < 4; r++) { ctx.fillRect(x, y + r * 8 + 7, T, 1); for (let c = 0; c < 2; c++) ctx.fillRect(x + ((c * 16 + off + (r % 2) * 8) % T), y + r * 8, 1, 7); }
      if (d > 0) { ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x, y, T, T); }
      if (o.n) {
        ctx.fillStyle = '#9b96a8'; ctx.fillRect(x, y, T, 7);
        ctx.fillStyle = '#bbb6c6'; ctx.fillRect(x, y, T, 2);
        ctx.fillStyle = '#6e687c'; ctx.fillRect(x, y + 7, T, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(x + 15, y + 2, 1, 5);
        if (U.hash(info.tx, info.ty, 8) < 0.2) { ctx.fillStyle = '#5da04a'; ctx.fillRect(x + 20, y - 2, 2, 3); ctx.fillRect(x + 23, y - 3, 1.5, 4); }
      }
      if (o.s) { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, y + T - 4, T, 4); }
      if (o.w && !o.n) { ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(x, y, 3, T); }
    },
    oneway(ctx, x, y, info) {
      // grille d'escalier de secours / auvent
      ctx.fillStyle = '#4f5a6a'; ctx.fillRect(x, y, T, 5);
      ctx.fillStyle = '#7a889a'; ctx.fillRect(x, y, T, 1.5);
      ctx.fillStyle = '#2f3642'; for (let i = 0; i < 4; i++) ctx.fillRect(x + 2 + i * 8, y + 1.5, 4, 2);
      if (info.edgeL) { ctx.fillStyle = '#4f5a6a'; ctx.fillRect(x + 1, y - 14, 2, 14); ctx.fillRect(x + 1, y - 14, T, 2); }
      else { ctx.fillStyle = '#4f5a6a'; ctx.fillRect(x, y - 14, T, 2); if (info.tx % 2 === 0) ctx.fillRect(x + 15, y - 14, 2, 14); }
      if (info.edgeR) ctx.fillRect(x + T - 3, y - 14, 2, 14);
    },
    ladder(ctx, x, y) {
      ctx.fillStyle = '#5a6576'; ctx.fillRect(x + 7, y, 3, T); ctx.fillRect(x + T - 10, y, 3, T);
      ctx.fillStyle = '#8894a6'; for (let i = 0; i < 3; i++) ctx.fillRect(x + 7, y + 5 + i * 11, T - 14, 2);
    },
    spike(ctx, x, y) {
      ctx.strokeStyle = '#7a7488'; ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x, y + 18 + i * 5); for (let k = 0; k <= 8; k++) ctx.lineTo(x + k * 4, y + 18 + i * 5 + (k % 2 ? -3 : 3)); ctx.stroke(); }
      ctx.fillStyle = '#4a4458'; ctx.fillRect(x, y + T - 4, T, 4);
    },
    ambient(game, dt, room, cam) {
      if (Math.random() < dt * 3) {
        game.particles.emit({ x: cam.x + U.rand(0, VW), y: cam.y + U.rand(0, VH), vx: [-10, 10], vy: [-6, -2], life: [4, 7], size: [1, 2], color: '#ffe0f0', alpha: 0.4, fade: 'inout', front: true });
      }
    }
  });

  // ================= FORÊT =================
  theme('foret', {
    surface: 'grass', fogColor: '#a7c4b0',
    buildLayers(room) {
      return [
        { f: 0.06, c: layer(420, (x, w, h) => { mountains(x, w, h, 320, 150, '#6f9a8c', 3, 5, 20); fogBand(x, w, 330, 60, '#cfe8d8', 0.5); }) },
        { f: 0.15, c: layer(460, (x, w, h) => { treeline(x, w, 420, '#4f7d6a', 12, { kind: 'pine', count: 60, min: 60, max: 120, jit: 20 }); fogBand(x, w, 430, 40, '#bfe0cc', 0.45); }) },
        { f: 0.3, c: layer(480, (x, w, h) => { treeline(x, w, 450, '#3a624f', 13, { count: 26, min: 70, max: 120, jit: 16 }); fogBand(x, w, 460, 30, '#a8d0b8', 0.35); }) },
        { f: 0.5, c: layer(500, (x, w, h) => { treeline(x, w, 480, '#284837', 14, { kind: 'pine', count: 30, min: 90, max: 160, jit: 10 }); }) },
        { f: 0.7, c: layer(520, (x, w, h) => { treeline(x, w, 500, '#1a3326', 15, { count: 14, min: 90, max: 150, jit: 10 }); }) }
      ];
    },
    sky(ctx, room, cam, t) {
      const g = ctx.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, '#2c5a5a'); g.addColorStop(0.5, '#7fb59a'); g.addColorStop(1, '#e8f0c0');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      G.glow(ctx, VW * 0.3 - cam.x * 0.03, 90, 260, '#fff6c8', 0.55, true);
    },
    animated(ctx, room, cam, t) {
      // rayons de lumière
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 5; i++) {
        const bx = cam.x + ((i * 230 - cam.x * 0.3) % (VW + 300) + VW + 300) % (VW + 300) - 150;
        const a = 0.05 + 0.03 * Math.sin(t * 0.5 + i * 1.7);
        const g = ctx.createLinearGradient(bx, cam.y, bx + 140, cam.y + VH);
        g.addColorStop(0, 'rgba(255,250,210,' + a + ')'); g.addColorStop(1, 'rgba(255,250,210,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.moveTo(bx, cam.y - 10); ctx.lineTo(bx + 60, cam.y - 10); ctx.lineTo(bx + 260, cam.y + VH); ctx.lineTo(bx + 120, cam.y + VH); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    },
    tile(ctx, x, y, info) {
      const o = info.open, d = info.depth;
      ctx.fillStyle = depthCol('#56392a', '#26170f', d);
      tileShape(ctx, x, y, o, 7); ctx.fill();
      specks(ctx, x, y, info, 'rgba(0,0,0,0.18)', 5, 3);
      specks(ctx, x, y, { tx: info.tx + 50, ty: info.ty }, 'rgba(255,220,180,0.08)', 3, 2);
      if (U.hash(info.tx, info.ty, 31) < 0.15 && d >= 1) {
        ctx.fillStyle = '#7a7a82'; ctx.beginPath(); ctx.ellipse(x + 16, y + 18, 7, 5, 0.3, 0, U.TAU); ctx.fill();
        ctx.fillStyle = '#9a9aa4'; ctx.beginPath(); ctx.ellipse(x + 14, y + 16, 4, 2, 0.3, 0, U.TAU); ctx.fill();
      }
      if (o.n) grassCap(ctx, x, y, info, '#5aa84a', '#8fd463', '#2f5a2a', 8);
      if (o.s) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, y + T - 5, T, 5);
        // racines pendantes
        if (U.hash(info.tx, info.ty, 12) < 0.5) {
          ctx.strokeStyle = '#3a2618'; ctx.lineWidth = 1.5;
          ctx.beginPath(); const rx = x + 6 + U.hash(info.tx, 3, 1) * 20; ctx.moveTo(rx, y + T); ctx.quadraticCurveTo(rx + 4, y + T + 8, rx - 2, y + T + 14); ctx.stroke();
        }
      }
      if (o.w && !o.n) { ctx.fillStyle = '#3f6a33'; ctx.fillRect(x, y + 2, 3, T - 4); }
      if (o.e && !o.n) { ctx.fillStyle = '#3f6a33'; ctx.fillRect(x + T - 3, y + 2, 3, T - 4); }
    },
    oneway(ctx, x, y, info) {
      ctx.fillStyle = '#6e4a2e'; G.rr(ctx, x - 1, y, T + 2, 8, 3); ctx.fill();
      ctx.fillStyle = '#8f6440'; ctx.fillRect(x, y + 1, T, 2);
      ctx.fillStyle = '#4a2f1c'; ctx.fillRect(x + 10, y + 3, 1, 4); ctx.fillRect(x + 22, y + 2, 1, 5);
      ctx.fillStyle = '#5aa84a'; if (U.hash(info.tx, info.ty, 2) < 0.5) { ctx.beginPath(); ctx.ellipse(x + 8, y, 5, 2, 0, 0, U.TAU); ctx.fill(); }
      if (info.edgeL || info.edgeR) { ctx.strokeStyle = '#4a3a2a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + (info.edgeL ? 4 : T - 4), y + 7); ctx.lineTo(x + (info.edgeL ? 2 : T - 2), y + 20); ctx.stroke(); }
    },
    spike(ctx, x, y, info) {
      // ronces
      ctx.strokeStyle = '#3a1f3a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x, y + 26); ctx.quadraticCurveTo(x + 8, y + 12, x + 16, y + 22); ctx.quadraticCurveTo(x + 24, y + 30, x + T, y + 18); ctx.stroke();
      ctx.fillStyle = '#5a2a4a';
      for (let i = 0; i < 6; i++) { const px = x + 3 + i * 5, py = y + 20 + Math.sin(i * 2) * 5; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 2, py - 7); ctx.lineTo(px + 4, py); ctx.fill(); }
      ctx.fillStyle = '#2a1a2a'; ctx.fillRect(x, y + T - 5, T, 5);
    },
    decorate(room, rng) { autoDecor(room, rng, { tuft: 0.85, flower: 0.25, mush: 0.08, fern: 0.2, rock: 0.06, bush: 0.08, vine: 0.3 }); },
    drawDeco: drawNatureDeco,
    ambient(game, dt, room, cam) {
      if (Math.random() < dt * 1.5) game.particles.emit({ x: cam.x + U.rand(-50, VW + 50), y: cam.y - 10, vx: [-20, 20], vy: [20, 40], life: [6, 10], size: [2.5, 4], color: ['#7cc65a', '#b5d86a', '#e0c060'], kind: 'leaf', vr: [-2, 2], sway: 30, front: Math.random() < 0.5, alpha: 0.9 });
      if (Math.random() < dt * 4) game.particles.emit({ x: cam.x + U.rand(0, VW), y: cam.y + U.rand(VH * 0.3, VH), vx: [-12, 12], vy: [-12, 6], life: [2, 4], size: [3, 6], color: '#f4ff9a', kind: 'glow', fade: 'inout', front: true, sway: 20 });
    }
  });

  // ================= RIVIÈRE =================
  theme('riviere', {
    surface: 'stone', fogColor: '#c4c8d8',
    buildLayers(room) {
      return [
        { f: 0.05, c: layer(430, (x, w, h) => { mountains(x, w, h, 300, 180, '#8a8ab8', 5, 4, 40); ctx2snow(x, w, 300, 180, 5); }) },
        { f: 0.14, c: layer(460, (x, w, h) => { mountains(x, w, h, 400, 140, '#5f6f96', 6, 6, 15); fogBand(x, w, 410, 40, '#e8d8e8', 0.4); }) },
        { f: 0.28, c: layer(480, (x, w, h) => { treeline(x, w, 450, '#3a4f6a', 7, { kind: 'pine', count: 50, min: 50, max: 110, jit: 16 }); }) },
        { f: 0.5, c: layer(510, (x, w, h) => { treeline(x, w, 490, '#26344a', 8, { kind: 'pine', count: 22, min: 90, max: 170, jit: 10 }); }) }
      ];
    },
    sky(ctx, room, cam, t) {
      const g = ctx.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, '#2e4a7e'); g.addColorStop(0.55, '#b48ab0'); g.addColorStop(1, '#f7c890');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      G.glow(ctx, VW * 0.2 - cam.x * 0.02, VH * 0.7, 260, '#ffd8a0', 0.5, true);
      ctx.fillStyle = 'rgba(255,230,240,0.18)';
      for (let i = 0; i < 5; i++) {
        const x = ((i * 300 + t * 4 - cam.x * 0.04) % (VW + 400)) - 200, y = 50 + (i * 61) % 150;
        ctx.beginPath(); ctx.ellipse(x, y, 130, 14, 0, 0, U.TAU); ctx.fill();
      }
    },
    tile(ctx, x, y, info) {
      const o = info.open, d = info.depth;
      ctx.fillStyle = depthCol('#5c5a6c', '#2c2a38', d);
      tileShape(ctx, x, y, o, 8); ctx.fill();
      // galets
      for (let i = 0; i < 3; i++) {
        const rx = x + 5 + U.hash(info.tx, info.ty + i, 4) * 22, ry = y + 6 + U.hash(info.tx + i, info.ty, 5) * 20;
        ctx.fillStyle = U.mix('#6e6c80', '#3a3848', d / 4 + U.hash(i, info.tx, 1) * 0.3);
        ctx.beginPath(); ctx.ellipse(rx, ry, 6 + i, 4.5, U.hash(i, info.ty, 2), 0, U.TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.ellipse(rx - 1, ry - 2, 3, 1.5, 0, 0, U.TAU); ctx.fill();
      }
      if (o.n) {
        const moss = U.hash(info.tx, 0, 3) < 0.6;
        if (moss) grassCap(ctx, x, y, info, '#5c9a58', '#8cc47a', '#3d6a40', 6);
        else { ctx.fillStyle = '#c8b484'; ctx.fillRect(x, y, T, 6); ctx.fillStyle = '#e0cc9c'; ctx.fillRect(x, y, T, 2); }
      }
      if (o.s) { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, y + T - 5, T, 5); }
    },
    oneway(ctx, x, y, info) {
      ctx.fillStyle = '#7a5a3e'; ctx.fillRect(x, y, T, 7);
      ctx.fillStyle = '#9c7654'; ctx.fillRect(x, y, T, 2);
      ctx.fillStyle = '#4e3824'; ctx.fillRect(x + 15, y + 1, 1, 6);
      if (info.tx % 2 === 0) { ctx.fillStyle = '#5a4030'; ctx.fillRect(x + 12, y + 7, 5, 26); }
    },
    decorate(room, rng) { autoDecor(room, rng, { tuft: 0.5, reed: 0.3, flower: 0.1, rock: 0.12, fern: 0.08 }); },
    drawDeco: drawNatureDeco,
    ambient(game, dt, room, cam) {
      if (Math.random() < dt * 2) game.particles.emit({ x: cam.x + U.rand(0, VW), y: cam.y + U.rand(0, VH), vx: [-8, 8], vy: [-8, 4], life: [3, 6], size: [1, 2], color: '#fff0d0', alpha: 0.5, fade: 'inout', front: true });
    }
  });
  function ctx2snow(x, w, base, amp, seed) {
    x.save();
    x.globalCompositeOperation = 'source-atop';
    const g = x.createLinearGradient(0, base - amp, 0, base - amp * 0.4);
    g.addColorStop(0, 'rgba(255,255,255,0.8)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, w, base);
    x.restore();
  }

  // ================= GROTTE =================
  theme('grotte', {
    surface: 'stone', fogColor: '#3a3a5a',
    buildLayers(room) {
      return [
        { f: 0.15, c: layer(560, (x, w, h) => {
          x.fillStyle = '#16131f'; x.fillRect(0, 0, w, h);
          mountains(x, w, h, 520, 200, '#1d1929', 41, 6, 30);
          // stalactites de fond
          const r = U.rng(42);
          x.fillStyle = '#1d1929';
          for (let i = 0; i < 40; i++) { const px = r() * w, len = 40 + r() * 140, wd = 10 + r() * 30; wrapDraw(w, px, wd, (qx) => { x.beginPath(); x.moveTo(qx - wd, 0); x.lineTo(qx, len); x.lineTo(qx + wd, 0); x.fill(); }); }
        }) },
        { f: 0.35, c: layer(560, (x, w, h) => {
          const r = U.rng(43);
          x.fillStyle = '#231e32';
          for (let i = 0; i < 26; i++) { const px = r() * w, len = 60 + r() * 160, wd = 14 + r() * 30; wrapDraw(w, px, wd, (qx) => { x.beginPath(); x.moveTo(qx - wd, 0); x.quadraticCurveTo(qx - 4, len * 0.7, qx, len); x.quadraticCurveTo(qx + 4, len * 0.7, qx + wd, 0); x.fill(); }); }
          mountains(x, w, h, 540, 120, '#231e32', 44, 7, 20);
          // cristaux lumineux
          for (let i = 0; i < 18; i++) {
            const px = r() * w, py = 360 + r() * 160, s = 8 + r() * 16, col = r() < 0.5 ? '#6ae8ff' : '#e86aff';
            wrapDraw(w, px, s * 3, (qx) => {
              x.fillStyle = U.rgba(col, 0.15); x.beginPath(); x.arc(qx, py, s * 3, 0, U.TAU); x.fill();
              x.fillStyle = U.rgba(col, 0.7);
              for (let k = -1; k <= 1; k++) { x.beginPath(); x.moveTo(qx + k * s * 0.5 - s * 0.25, py + s * 0.5); x.lineTo(qx + k * s * 0.6, py - s * (1.2 - Math.abs(k) * 0.4)); x.lineTo(qx + k * s * 0.5 + s * 0.25, py + s * 0.5); x.fill(); }
            });
          }
        }) }
      ];
    },
    sky(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, '#0c0a12'); g.addColorStop(1, '#15111f');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
    },
    tile(ctx, x, y, info) {
      const o = info.open, d = info.depth;
      ctx.fillStyle = depthCol('#3a3450', '#15121e', d);
      tileShape(ctx, x, y, o, 9); ctx.fill();
      specks(ctx, x, y, info, 'rgba(0,0,0,0.25)', 4, 4);
      specks(ctx, x, y, { tx: info.tx + 9, ty: info.ty + 3 }, 'rgba(180,170,230,0.08)', 4, 2);
      if (o.n) { ctx.fillStyle = '#56507a'; ctx.fillRect(x, y, T, 4); ctx.fillStyle = '#7a72a8'; ctx.fillRect(x, y, T, 1.5); }
      if (o.w) { ctx.fillStyle = 'rgba(122,114,168,0.3)'; ctx.fillRect(x, y, 2, T); }
      if (o.e) { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x + T - 3, y, 3, T); }
      if (o.s) {
        ctx.fillStyle = '#2a253a';
        const h = U.hash(info.tx, info.ty, 17);
        if (h < 0.45) { const sx = x + 6 + h * 30; ctx.beginPath(); ctx.moveTo(sx - 5, y + T); ctx.lineTo(sx, y + T + 10 + h * 20); ctx.lineTo(sx + 5, y + T); ctx.fill(); }
      }
      if (o.n && U.hash(info.tx, info.ty, 23) < 0.12) {
        const col = U.hash(info.tx, 1, 1) < 0.5 ? '#6ae8ff' : '#e86aff';
        ctx.fillStyle = col;
        for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(x + 16 + k * 5 - 3, y + 2); ctx.lineTo(x + 16 + k * 6, y - 9 + Math.abs(k) * 4); ctx.lineTo(x + 16 + k * 5 + 3, y + 2); ctx.fill(); }
      }
    },
    oneway(ctx, x, y, info) {
      ctx.fillStyle = '#4a4466'; G.rr(ctx, x - 1, y, T + 2, 9, 4); ctx.fill();
      ctx.fillStyle = '#6e6694'; ctx.fillRect(x, y, T, 2);
      ctx.fillStyle = '#2a253a'; ctx.beginPath(); ctx.moveTo(x + 4, y + 9); ctx.lineTo(x + 10, y + 15); ctx.lineTo(x + 16, y + 9); ctx.fill();
    },
    spike(ctx, x, y) {
      for (let i = 0; i < 4; i++) {
        const col = i % 2 ? '#8af0ff' : '#b58aff';
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x + i * 8, y + T); ctx.lineTo(x + i * 8 + 4, y + T - 16 - (i % 2) * 6); ctx.lineTo(x + i * 8 + 8, y + T); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(x + i * 8 + 3, y + T - 12, 1, 8);
      }
    },
    ladder(ctx, x, y) {
      ctx.strokeStyle = '#a88a5a'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x + 9, y); ctx.lineTo(x + 9, y + T); ctx.moveTo(x + T - 9, y); ctx.lineTo(x + T - 9, y + T); ctx.stroke();
      ctx.lineWidth = 2.5; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x + 9, y + 6 + i * 11); ctx.lineTo(x + T - 9, y + 6 + i * 11); ctx.stroke(); }
    },
    decorate(room, rng) { autoDecor(room, rng, { cmush: 0.12, crystal: 0.08, stalag: 0.1, rock: 0.06 }); },
    drawDeco: drawNatureDeco,
    ambient(game, dt, room, cam) {
      if (Math.random() < dt * 2.5) game.particles.emit({ x: cam.x + U.rand(0, VW), y: cam.y + U.rand(0, VH), vx: [-5, 5], vy: [-10, -2], life: [3, 6], size: [2, 4], color: ['#6ae8ff', '#e86aff'], kind: 'glow', fade: 'inout', front: true, alpha: 0.6 });
    }
  });

  // ================= RUINES (zone mystérieuse) =================
  theme('ruines', {
    surface: 'stone', fogColor: '#8a6ab8',
    buildLayers(room) {
      return [
        { f: 0.05, c: layer(440, (x, w, h) => {
          mountains(x, w, h, 380, 90, '#241a48', 51, 5);
          // antenne lointaine
          x.strokeStyle = '#1a1236'; x.lineWidth = 3;
          const ax = w * 0.62;
          x.beginPath(); x.moveTo(ax - 30, 300); x.lineTo(ax, 60); x.lineTo(ax + 30, 300); x.stroke();
          for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(ax - 30 + i * 3.5, 300 - i * 30); x.lineTo(ax + 30 - i * 3.5, 300 - i * 30); x.stroke(); }
        }) },
        { f: 0.16, c: layer(470, (x, w, h) => {
          const r = U.rng(52);
          // îles flottantes
          for (let i = 0; i < 7; i++) {
            const px = r() * w, py = 120 + r() * 200, s = 30 + r() * 60;
            wrapDraw(w, px, s * 1.3, (qx) => {
              x.fillStyle = '#2d2256';
              x.beginPath(); x.moveTo(qx - s, py); x.quadraticCurveTo(qx, py - s * 0.25, qx + s, py); x.lineTo(qx + s * 0.3, py + s * 0.9); x.lineTo(qx - s * 0.2, py + s * 0.7); x.closePath(); x.fill();
              x.fillStyle = '#3a2e6e'; x.fillRect(qx - s * 0.6, py - s * 0.28, 5, s * 0.3); x.fillRect(qx + s * 0.3, py - s * 0.4, 6, s * 0.42);
            });
          }
          mountains(x, w, h, 440, 70, '#2d2256', 53, 6);
        }) },
        { f: 0.3, c: layer(500, (x, w, h) => {
          const r = U.rng(54);
          x.fillStyle = '#1f1740';
          // colonnes et arches brisées
          for (let i = 0; i < 12; i++) {
            const px = r() * w, ph = 80 + r() * 160;
            wrapDraw(w, px, 30, (qx) => {
              x.fillRect(qx - 12, 480 - ph, 24, ph + 40);
              x.fillRect(qx - 16, 480 - ph, 32, 10);
              if (r() < 0.4) { x.beginPath(); x.arc(qx + 40, 480 - ph + 10, 40, Math.PI, U.TAU); x.lineTo(qx + 72, 480 - ph + 10); x.arc(qx + 40, 480 - ph + 10, 28, 0, Math.PI, true); x.fill(); }
            });
          }
          x.fillRect(0, 470, w, 100);
        }) },
        { f: 0.55, c: layer(520, (x, w, h) => { treeline(x, w, 505, '#150f2e', 55, { count: 12, min: 60, max: 110, jit: 8 }); }) }
      ];
    },
    sky(ctx, room, cam, t) {
      const g = ctx.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, '#070519'); g.addColorStop(0.6, '#23124a'); g.addColorStop(1, '#4a2470');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      // étoiles
      for (let i = 0; i < 90; i++) {
        const sx = (U.hash(i, 1, 9) * VW * 1.2 - cam.x * 0.01) % VW, sy = U.hash(i, 2, 9) * VH * 0.7;
        ctx.fillStyle = i % 7 === 0 ? '#bfe8ff' : '#ffffff';
        ctx.globalAlpha = 0.35 + 0.5 * Math.abs(Math.sin(t * (0.5 + U.hash(i, 3, 9)) + i));
        ctx.fillRect(sx < 0 ? sx + VW : sx, sy, 1.6, 1.6);
      }
      ctx.globalAlpha = 1;
      // aurore boréale
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 3; k++) {
        const col = ['#3cffb8', '#5ad0ff', '#ff6ad8'][k];
        ctx.beginPath();
        const yb = 90 + k * 40;
        for (let x = -20; x <= VW + 20; x += 20) {
          const y = yb + Math.sin(x * 0.006 + t * 0.35 + k) * 30 + Math.sin(x * 0.013 - t * 0.5 + k * 2) * 14;
          if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        for (let x = VW + 20; x >= -20; x -= 20) {
          const y = yb + 70 + Math.sin(x * 0.006 + t * 0.35 + k) * 30 + Math.sin(x * 0.011 + t * 0.4) * 20;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        const ag = ctx.createLinearGradient(0, yb - 30, 0, yb + 100);
        ag.addColorStop(0, U.rgba(col, 0)); ag.addColorStop(0.4, U.rgba(col, 0.13)); ag.addColorStop(1, U.rgba(col, 0));
        ctx.fillStyle = ag; ctx.fill();
      }
      ctx.restore();
      // étoile filante
      const st = (t * 0.13) % 1;
      if (st < 0.06) {
        const k = st / 0.06, sx = VW * 0.8 - k * 300, sy = 60 + k * 120;
        ctx.strokeStyle = 'rgba(255,255,255,' + (1 - k) + ')'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 40, sy - 16); ctx.stroke();
      }
    },
    tile(ctx, x, y, info) {
      const o = info.open, d = info.depth;
      ctx.fillStyle = depthCol('#4d4678', '#1d1838', d);
      tileShape(ctx, x, y, o, 3); ctx.fill();
      // blocs taillés
      ctx.fillStyle = 'rgba(10,5,30,0.35)';
      const off = (info.ty % 2) * 16;
      ctx.fillRect(x, y + 15, T, 1.5); ctx.fillRect(x + (off + 8) % T, y, 1.5, 15); ctx.fillRect(x + (off + 24) % T, y + 16, 1.5, 16);
      ctx.fillStyle = 'rgba(200,190,255,0.06)'; ctx.fillRect(x + 1, y + 1, T - 2, 1);
      // runes
      if (U.hash(info.tx, info.ty, 61) < 0.09) {
        ctx.strokeStyle = 'rgba(94,242,214,0.8)'; ctx.lineWidth = 1.5;
        const k = Math.floor(U.hash(info.tx, info.ty, 62) * 4);
        ctx.beginPath();
        if (k === 0) { ctx.moveTo(x + 10, y + 8); ctx.lineTo(x + 16, y + 24); ctx.lineTo(x + 22, y + 8); }
        else if (k === 1) { ctx.arc(x + 16, y + 16, 6, 0, U.TAU); ctx.moveTo(x + 16, y + 6); ctx.lineTo(x + 16, y + 26); }
        else if (k === 2) { ctx.moveTo(x + 9, y + 10); ctx.lineTo(x + 23, y + 10); ctx.moveTo(x + 16, y + 10); ctx.lineTo(x + 12, y + 24); ctx.moveTo(x + 16, y + 10); ctx.lineTo(x + 20, y + 24); }
        else { ctx.moveTo(x + 10, y + 16); ctx.lineTo(x + 16, y + 9); ctx.lineTo(x + 22, y + 16); ctx.lineTo(x + 16, y + 23); ctx.closePath(); }
        ctx.stroke();
      }
      if (o.n) {
        ctx.fillStyle = '#6a5a9a'; ctx.fillRect(x, y, T, 4);
        ctx.fillStyle = '#9a7ada'; ctx.fillRect(x, y, T, 1.5);
        if (U.hash(info.tx, info.ty, 5) < 0.4) { ctx.fillStyle = '#b06ad8'; for (let i = 0; i < 3; i++) { const bx = x + 4 + i * 10 + U.hash(i, info.tx, 1) * 4; ctx.beginPath(); ctx.moveTo(bx - 1.5, y); ctx.lineTo(bx, y - 5); ctx.lineTo(bx + 1.5, y); ctx.fill(); } }
      }
      if (o.s) { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(x, y + T - 4, T, 4); }
    },
    oneway(ctx, x, y, info) {
      ctx.fillStyle = '#5a4e8a'; G.rr(ctx, x, y, T, 9, 2); ctx.fill();
      ctx.fillStyle = '#8a7ac8'; ctx.fillRect(x, y, T, 2);
      ctx.fillStyle = 'rgba(94,242,214,0.6)'; ctx.fillRect(x + 4, y + 8, T - 8, 1.5);
    },
    spike(ctx, x, y) {
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#8a6ad8'; ctx.beginPath(); ctx.moveTo(x + i * 8, y + T); ctx.lineTo(x + i * 8 + 4, y + T - 18); ctx.lineTo(x + i * 8 + 8, y + T); ctx.fill();
      }
      ctx.fillStyle = 'rgba(94,242,214,0.5)'; ctx.fillRect(x, y + T - 3, T, 3);
    },
    decorate(room, rng) { autoDecor(room, rng, { ptuft: 0.6, gflower: 0.18, rubble: 0.12 }); },
    drawDeco: drawNatureDeco,
    ambient(game, dt, room, cam) {
      if (Math.random() < dt * 3) game.particles.emit({ x: cam.x + U.rand(0, VW), y: cam.y + VH + 10, vx: [-6, 6], vy: [-30, -14], life: [5, 9], size: [2, 4], color: ['#5ef2d6', '#c38aff'], kind: 'glow', fade: 'inout', front: Math.random() < 0.6, alpha: 0.7, sway: 10 });
    }
  });

  // ================= FINAL (cœur du Silence) =================
  theme('final', {
    surface: 'metal', fogColor: '#6a5a8a',
    buildLayers(room) {
      return [
        { f: 0.06, c: layer(480, (x, w, h) => { cloudsLayer(x, w, h, '#1e1432', 71, 22, 60, 400, 50, 120); }) },
        { f: 0.2, c: layer(520, (x, w, h) => {
          // structure métallique de l'antenne
          x.strokeStyle = '#1c1530'; x.lineWidth = 6;
          for (let k = 0; k < 3; k++) {
            const bx = 200 + k * 420;
            x.beginPath(); x.moveTo(bx - 90, 520); x.lineTo(bx - 20, 0); x.moveTo(bx + 90, 520); x.lineTo(bx + 20, 0); x.stroke();
            x.lineWidth = 3;
            for (let i = 0; i < 12; i++) { const yy = 520 - i * 45, wd = 90 - i * 6; x.beginPath(); x.moveTo(bx - wd, yy); x.lineTo(bx + wd - 6, yy - 45); x.moveTo(bx + wd, yy); x.lineTo(bx - wd + 6, yy - 45); x.stroke(); }
            x.lineWidth = 6;
          }
        }) }
      ];
    },
    sky(ctx, room, cam, t) {
      if (room.state.dawn) {
        const d = ctx.createLinearGradient(0, 0, 0, VH);
        d.addColorStop(0, '#3a3a8a'); d.addColorStop(0.45, '#c97aa8'); d.addColorStop(0.8, '#ffb58a'); d.addColorStop(1, '#ffe2a8');
        ctx.fillStyle = d; ctx.fillRect(0, 0, VW, VH);
        G.glow(ctx, VW * 0.5, VH * 0.95, 380, '#fff0c0', 0.7, true);
        ctx.fillStyle = 'rgba(255,245,220,0.9)'; ctx.beginPath(); ctx.arc(VW * 0.5, VH * 0.98, 70, 0, U.TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,220,230,0.25)';
        for (let i = 0; i < 6; i++) { const x = ((i * 220 + t * 6) % (VW + 300)) - 150, y = 70 + (i * 41) % 160; ctx.beginPath(); ctx.ellipse(x, y, 130, 14, 0, 0, U.TAU); ctx.fill(); }
        return;
      }
      const g = ctx.createLinearGradient(0, 0, 0, VH);
      const fl = room.state.lightning || 0;
      g.addColorStop(0, U.mix('#0a0614', '#9a8ad8', fl * 0.6)); g.addColorStop(0.6, U.mix('#1c1030', '#c8b8ff', fl * 0.5)); g.addColorStop(1, U.mix('#3a1a4a', '#ffffff', fl * 0.3));
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      // lune voilée
      ctx.fillStyle = 'rgba(230,220,255,0.18)'; ctx.beginPath(); ctx.arc(VW * 0.75, 110, 60, 0, U.TAU); ctx.fill();
      G.glow(ctx, VW * 0.75, 110, 160, '#b9a3ff', 0.3, true);
      // nuages tourbillonnants
      ctx.fillStyle = 'rgba(60,40,90,0.5)';
      for (let i = 0; i < 8; i++) {
        const x = ((i * 190 + t * (10 + i * 3)) % (VW + 400)) - 200, y = 40 + (i * 47) % 200;
        ctx.beginPath(); ctx.ellipse(x, y, 160, 26, 0, 0, U.TAU); ctx.fill();
      }
      if (fl > 0.05) {
        ctx.strokeStyle = 'rgba(240,230,255,' + fl + ')'; ctx.lineWidth = 2.5;
        const lx = room.state.boltX || VW * 0.4;
        ctx.beginPath(); ctx.moveTo(lx, 0); let yy = 0, xx = lx;
        while (yy < VH * 0.7) { yy += 30 + Math.random() * 30; xx += (Math.random() - 0.5) * 60; ctx.lineTo(xx, yy); }
        ctx.stroke();
      }
    },
    tile(ctx, x, y, info) {
      const o = info.open, d = info.depth;
      ctx.fillStyle = depthCol('#34304a', '#14121e', d);
      tileShape(ctx, x, y, o, 2); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(x + 1.5, y + 1.5, T - 3, T - 3);
      ctx.fillStyle = '#5a5470';
      ctx.fillRect(x + 4, y + 4, 2, 2); ctx.fillRect(x + T - 6, y + 4, 2, 2); ctx.fillRect(x + 4, y + T - 6, 2, 2); ctx.fillRect(x + T - 6, y + T - 6, 2, 2);
      if (U.hash(info.tx, info.ty, 81) < 0.12) {
        ctx.strokeStyle = 'rgba(190,120,255,0.8)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x + 6, y + 10); ctx.lineTo(x + 14, y + 16); ctx.lineTo(x + 12, y + 24); ctx.lineTo(x + 22, y + 28); ctx.stroke();
      }
      if (o.n) { ctx.fillStyle = '#6e6890'; ctx.fillRect(x, y, T, 3); ctx.fillStyle = '#ffd24a'; for (let i = 0; i < 4; i++) ctx.fillRect(x + i * 8 + (info.tx % 2) * 4, y + 3, 4, 2); }
    },
    oneway(ctx, x, y, info) {
      ctx.fillStyle = '#4a4466'; ctx.fillRect(x, y, T, 6);
      ctx.fillStyle = '#7a74a0'; ctx.fillRect(x, y, T, 1.5);
      ctx.strokeStyle = '#2a2640'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y + 6); ctx.lineTo(x + 16, y + 16); ctx.lineTo(x + T, y + 6); ctx.stroke();
    },
    spike(ctx, x, y, info) {
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 ? '#d8c8ff' : '#9a7ae8';
        ctx.beginPath(); ctx.moveTo(x + i * 8, y + T); ctx.lineTo(x + i * 8 + 4, y + T - 14 - (i % 2) * 6); ctx.lineTo(x + i * 8 + 8, y + T); ctx.fill();
      }
    },
    ambient(game, dt, room, cam) {
      if (Math.random() < dt * 6) game.particles.emit({ x: cam.x + U.rand(0, VW), y: cam.y - 10, vx: [-80, -40], vy: [200, 320], life: [1.5, 2.5], size: [1, 1.5], color: '#b8b0e0', kind: 'spark', alpha: 0.5, front: true });
      if (Math.random() < dt * 2) game.particles.emit({ x: cam.x + U.rand(0, VW), y: cam.y + U.rand(0, VH), vx: [-20, 20], vy: [-20, 20], life: [0.3, 0.6], size: [1, 2], color: '#e0d0ff', kind: 'square', front: true });
    }
  });

  // ------------------------------------------------------------------
  // décor automatique (herbes, fleurs, champignons…) posé sur les surfaces
  // ------------------------------------------------------------------
  function autoDecor(room, rng, p) {
    const W = room.w, H = room.h;
    for (let ty = 1; ty < H; ty++) for (let tx = 0; tx < W; tx++) {
      const ch = room.tile(tx, ty);
      if (ch !== '#') continue;
      const above = room.tile(tx, ty - 1);
      const x = tx * T, y = ty * T;
      if (above === '.' || above === '*' || above === 'P') {
        if (room.noDecor && room.noDecor(tx, ty - 1)) continue;
        const r = rng();
        if (p.tuft && rng() < p.tuft) room.deco.push({ k: 'tuft', x: x + rng() * T, y, s: 0.7 + rng() * 0.6, fg: rng() < 0.5, seed: rng() * 10 });
        if (p.ptuft && rng() < p.ptuft) room.deco.push({ k: 'ptuft', x: x + rng() * T, y, s: 0.7 + rng() * 0.6, fg: rng() < 0.5, seed: rng() * 10 });
        if (p.flower && r < p.flower) room.deco.push({ k: 'flower', x: x + rng() * T, y, c: U.pick(['#ff7ab8', '#ffd54a', '#9ad0ff', '#ffffff', '#c38aff']), fg: false, seed: rng() * 10 });
        if (p.gflower && rng() < p.gflower) room.deco.push({ k: 'gflower', x: x + rng() * T, y, c: U.pick(['#5ef2d6', '#c38aff', '#ff8ad8']), fg: false, seed: rng() * 10 });
        if (p.mush && rng() < p.mush) room.deco.push({ k: 'mush', x: x + rng() * T, y, fg: false, s: 0.8 + rng() * 0.5 });
        if (p.cmush && rng() < p.cmush) room.deco.push({ k: 'cmush', x: x + rng() * T, y, fg: false, s: 0.8 + rng() * 0.6, c: U.pick(['#6ae8ff', '#e86aff', '#7aff9a']) });
        if (p.fern && rng() < p.fern) room.deco.push({ k: 'fern', x: x + rng() * T, y, fg: rng() < 0.3, s: 0.8 + rng() * 0.5, seed: rng() * 10 });
        if (p.rock && rng() < p.rock) room.deco.push({ k: 'rock', x: x + rng() * T, y, fg: false, s: 0.7 + rng() * 0.7 });
        if (p.rubble && rng() < p.rubble) room.deco.push({ k: 'rubble', x: x + rng() * T, y, fg: false, s: 0.7 + rng() * 0.7 });
        if (p.bush && rng() < p.bush) room.deco.push({ k: 'bush', x: x + rng() * T, y, fg: rng() < 0.4, s: 0.8 + rng() * 0.6, seed: rng() * 10 });
        if (p.reed && rng() < p.reed && room.nearWater && room.nearWater(tx, ty)) room.deco.push({ k: 'reed', x: x + rng() * T, y, fg: rng() < 0.5, s: 0.8 + rng() * 0.5, seed: rng() * 10 });
        if (p.crystal && rng() < p.crystal) room.deco.push({ k: 'crystal', x: x + rng() * T, y, fg: false, s: 0.8 + rng() * 0.8, c: U.pick(['#6ae8ff', '#e86aff']) });
        if (p.stalag && rng() < p.stalag) room.deco.push({ k: 'stalag', x: x + rng() * T, y, fg: false, s: 0.7 + rng() * 0.8 });
      }
      const below = room.tile(tx, ty + 1);
      if (below === '.' && p.vine && rng() < p.vine * 0.4) room.deco.push({ k: 'vine', x: x + rng() * T, y: y + T, len: 20 + rng() * 50, fg: false, seed: rng() * 10 });
    }
  }
  TH.autoDecor = autoDecor;

  function drawNatureDeco(ctx, d, t, gray) {
    const sway = Math.sin(t * 1.8 + d.x * 0.05 + (d.seed || 0)) * 0.12;
    switch (d.k) {
      case 'tuft':
      case 'ptuft': {
        const cols = d.k === 'tuft' ? ['#4e9a40', '#6cbf52', '#8fd463'] : ['#6a4aa0', '#8a5ac8', '#b07ae8'];
        for (let i = 0; i < 5; i++) {
          const bx = d.x + (i - 2) * 2.5 * d.s, h = (8 + (i % 3) * 4) * d.s;
          ctx.strokeStyle = cols[i % 3]; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(bx, d.y + 1); ctx.quadraticCurveTo(bx + sway * 10, d.y - h * 0.6, bx + sway * h * 1.4 + (i - 2) * 1.5, d.y - h); ctx.stroke();
        }
        break;
      }
      case 'flower':
      case 'gflower': {
        ctx.strokeStyle = d.k === 'flower' ? '#4e8a40' : '#5a4a8a'; ctx.lineWidth = 1.2;
        const tx = d.x + sway * 12, ty = d.y - 12;
        ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.quadraticCurveTo(d.x, d.y - 6, tx, ty); ctx.stroke();
        ctx.fillStyle = d.c;
        for (let i = 0; i < 5; i++) { const a = i * 1.256 + t * 0.2; ctx.beginPath(); ctx.arc(tx + Math.cos(a) * 2.4, ty + Math.sin(a) * 2.4, 1.8, 0, U.TAU); ctx.fill(); }
        ctx.fillStyle = '#fff3a0'; ctx.beginPath(); ctx.arc(tx, ty, 1.4, 0, U.TAU); ctx.fill();
        if (d.k === 'gflower') G.glow(ctx, tx, ty, 12, d.c, 0.5 + 0.2 * Math.sin(t * 2 + d.seed));
        break;
      }
      case 'mush': {
        const s = d.s;
        ctx.fillStyle = '#efe6d0'; ctx.fillRect(d.x - 1.5 * s, d.y - 6 * s, 3 * s, 6 * s);
        ctx.fillStyle = '#d8453a'; ctx.beginPath(); ctx.ellipse(d.x, d.y - 6 * s, 5 * s, 3.5 * s, 0, Math.PI, U.TAU); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(d.x - 2 * s, d.y - 7.5 * s, 0.9 * s, 0, U.TAU); ctx.arc(d.x + 1.5 * s, d.y - 8 * s, 0.7 * s, 0, U.TAU); ctx.fill();
        break;
      }
      case 'cmush': {
        const s = d.s;
        ctx.fillStyle = '#c8c0e0'; ctx.fillRect(d.x - 1.2 * s, d.y - 7 * s, 2.4 * s, 7 * s);
        ctx.fillStyle = d.c; ctx.beginPath(); ctx.ellipse(d.x, d.y - 7 * s, 5 * s, 3 * s, 0, Math.PI, U.TAU); ctx.fill();
        G.glow(ctx, d.x, d.y - 7 * s, 18 * s, d.c, 0.45 + 0.15 * Math.sin(t * 1.5 + d.x));
        break;
      }
      case 'fern': {
        ctx.strokeStyle = '#3f7a3a'; ctx.lineWidth = 1.3;
        for (let k = -2; k <= 2; k++) {
          const a = k * 0.35 + sway, l = 16 * d.s;
          ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.quadraticCurveTo(d.x + Math.sin(a) * l * 0.5, d.y - l * 0.7, d.x + Math.sin(a) * l, d.y - Math.cos(a) * l * 0.8); ctx.stroke();
        }
        break;
      }
      case 'rock':
      case 'rubble': {
        ctx.fillStyle = d.k === 'rock' ? '#6a6878' : '#5a4e8a';
        ctx.beginPath(); ctx.ellipse(d.x, d.y - 3 * d.s, 7 * d.s, 4.5 * d.s, 0, Math.PI, U.TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.ellipse(d.x - 2, d.y - 5 * d.s, 3 * d.s, 1.4 * d.s, 0, 0, U.TAU); ctx.fill();
        break;
      }
      case 'bush': {
        const s = d.s;
        ctx.fillStyle = '#2f6a34';
        ctx.beginPath(); ctx.arc(d.x - 8 * s, d.y - 7 * s, 9 * s, 0, U.TAU); ctx.arc(d.x + 6 * s, d.y - 8 * s, 10 * s, 0, U.TAU); ctx.arc(d.x, d.y - 13 * s, 9 * s, 0, U.TAU); ctx.fill();
        ctx.fillStyle = '#4a9a48'; ctx.beginPath(); ctx.arc(d.x - 3 * s, d.y - 15 * s, 5 * s, 0, U.TAU); ctx.arc(d.x + 7 * s, d.y - 11 * s, 4 * s, 0, U.TAU); ctx.fill();
        break;
      }
      case 'reed': {
        ctx.strokeStyle = '#6a8a4a'; ctx.lineWidth = 1.4;
        for (let i = 0; i < 3; i++) { const bx = d.x + i * 3; ctx.beginPath(); ctx.moveTo(bx, d.y); ctx.quadraticCurveTo(bx + sway * 8, d.y - 14, bx + sway * 20, d.y - 26 * d.s); ctx.stroke(); }
        ctx.fillStyle = '#7a5a3a'; ctx.beginPath(); ctx.ellipse(d.x + 3 + sway * 20, d.y - 24 * d.s, 1.8, 4, sway, 0, U.TAU); ctx.fill();
        break;
      }
      case 'crystal': {
        ctx.fillStyle = d.c;
        for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(d.x + k * 5 * d.s - 3, d.y); ctx.lineTo(d.x + k * 6 * d.s, d.y - (14 - Math.abs(k) * 5) * d.s); ctx.lineTo(d.x + k * 5 * d.s + 3, d.y); ctx.fill(); }
        G.glow(ctx, d.x, d.y - 6, 26 * d.s, d.c, 0.4 + 0.15 * Math.sin(t * 2 + d.x));
        break;
      }
      case 'stalag': {
        ctx.fillStyle = '#3a3450'; ctx.beginPath(); ctx.moveTo(d.x - 5 * d.s, d.y); ctx.lineTo(d.x, d.y - 18 * d.s); ctx.lineTo(d.x + 5 * d.s, d.y); ctx.fill();
        break;
      }
      case 'vine': {
        ctx.strokeStyle = '#3f7a3a'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(d.x, d.y);
        for (let i = 1; i <= 6; i++) ctx.lineTo(d.x + Math.sin(i + t + d.seed) * 2, d.y + (i / 6) * d.len);
        ctx.stroke();
        ctx.fillStyle = '#5aa84a'; for (let i = 1; i < 6; i += 2) { ctx.beginPath(); ctx.ellipse(d.x + Math.sin(i + t + d.seed) * 2 + 2, d.y + (i / 6) * d.len, 2.5, 1.2, 0.5, 0, U.TAU); ctx.fill(); }
        break;
      }
      default: break;
    }
  }
  TH.drawNatureDeco = drawNatureDeco;
})();
