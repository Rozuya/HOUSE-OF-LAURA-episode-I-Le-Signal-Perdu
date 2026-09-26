/* House of Laura · décors dessinés (meubles, façades, végétation géante, machines…)
 * Chaque fonction reçoit (ctx, x, y, d, t, game) avec (x,y) = point au sol, au centre-gauche de la tuile d.x
 */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U, G = HOL.G, T = HOL.T;
  const OL = '#1b1022';
  const P = HOL.Props = {};

  function box(ctx, x, y, w, h, fill, stroke, r) {
    ctx.fillStyle = fill; G.rr(ctx, x, y, w, h, r || 3); ctx.fill();
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.5; ctx.stroke(); }
  }

  // ================= MAISON =================
  P.desk = function (ctx, x, y, d, t, game) {
    const on = !game || game.room.state.power !== false;
    const w = (d.w || 6) * T;
    // bureau
    box(ctx, x, y - 44, w, 8, '#3a2a3a', OL, 2);
    ctx.fillStyle = '#2a1e2a'; ctx.fillRect(x + 6, y - 36, 6, 36); ctx.fillRect(x + w - 12, y - 36, 6, 36);
    ctx.fillStyle = '#ff4fd8'; if (on) { ctx.globalAlpha = 0.8; ctx.fillRect(x + 4, y - 36, w - 8, 2); ctx.globalAlpha = 1; }
    // écrans
    const sx = x + 16;
    for (let i = 0; i < 3; i++) {
      const mw = i === 1 ? 62 : 46, mh = i === 1 ? 38 : 32, mx = sx + (i === 0 ? 0 : i === 1 ? 50 : 116), my = y - 44 - mh - 12 + (i === 1 ? -4 : 0);
      box(ctx, mx, my, mw, mh, '#16121c', OL, 3);
      ctx.fillStyle = '#1a1622'; ctx.fillRect(mx + mw / 2 - 3, my + mh, 6, 12);
      if (on) {
        const g = ctx.createLinearGradient(mx, my, mx + mw, my + mh);
        g.addColorStop(0, i === 1 ? '#7a3aa8' : '#2a4a8a'); g.addColorStop(1, i === 1 ? '#ff5fae' : '#3a8ad0');
        ctx.fillStyle = g; ctx.fillRect(mx + 3, my + 3, mw - 6, mh - 6);
        if (i === 1) {
          G.text(ctx, 'HOUSE OF', mx + mw / 2, my + 16, { size: 8, color: '#fff', align: 'center' });
          G.text(ctx, 'LAURA', mx + mw / 2, my + 27, { size: 11, color: '#fff', align: 'center' });
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          for (let k = 0; k < 4; k++) ctx.fillRect(mx + 6, my + 7 + k * 6, 10 + ((k * 13 + i * 7) % 22), 2);
        }
        G.glow(ctx, mx + mw / 2, my + mh / 2, 50, i === 1 ? '#ff5fae' : '#5a9aff', 0.35);
      } else if (game && game.room.state.static) {
        G.staticNoise(ctx, mx + 3, my + 3, mw - 6, mh - 6, 0.8, t);
      }
    }
    // micro sur bras + clavier
    ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + w - 10, y - 44); ctx.lineTo(x + w - 18, y - 80); ctx.lineTo(x + w - 40, y - 86); ctx.stroke();
    box(ctx, x + w - 48, y - 94, 12, 18, '#2a2a33', OL, 5);
    box(ctx, x + 60, y - 50, 50, 6, '#222', OL, 2);
    if (on) { ctx.fillStyle = '#ff5fae'; ctx.fillRect(x + 62, y - 49, 46, 1.5); }
    // lampe annulaire
    ctx.strokeStyle = on ? '#ffe6f6' : '#555'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + 8, y - 100, 12, 0, U.TAU); ctx.stroke();
    ctx.fillStyle = '#222'; ctx.fillRect(x + 7, y - 88, 2, 44);
    if (on) G.glow(ctx, x + 8, y - 100, 40, '#ffd6ee', 0.4);
  };
  P.chair = function (ctx, x, y, d, t) {
    // fauteuil gamer noir
    ctx.fillStyle = '#1a1a22'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5;
    G.rr(ctx, x + 2, y - 74, 26, 44, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2a2a36'; G.rr(ctx, x + 6, y - 68, 18, 30, 6); ctx.fill();
    ctx.fillStyle = '#ff5fae'; ctx.fillRect(x + 8, y - 64, 2, 22); ctx.fillRect(x + 20, y - 64, 2, 22);
    ctx.fillStyle = '#1a1a22'; G.rr(ctx, x - 2, y - 30, 34, 9, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.fillRect(x + 13, y - 21, 4, 12);
    ctx.fillRect(x + 2, y - 10, 26, 3);
    ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(x + 3, y - 3, 3, 0, U.TAU); ctx.arc(x + 27, y - 3, 3, 0, U.TAU); ctx.fill();
  };
  P.bed = function (ctx, x, y, d) {
    const w = (d.w || 6) * T;
    box(ctx, x, y - 30, w, 30, '#4a2c4a', OL, 4);
    box(ctx, x + 2, y - 44, w - 4, 16, '#e8dff0', OL, 6);
    ctx.fillStyle = '#b388ff'; G.rr(ctx, x + w * 0.35, y - 46, w * 0.63, 18, 6); ctx.fill();
    ctx.fillStyle = '#9a70e8'; for (let i = 0; i < 4; i++) ctx.fillRect(x + w * 0.4 + i * w * 0.14, y - 44, 3, 14);
    box(ctx, x + 6, y - 54, 30, 14, '#fff', OL, 7);
    box(ctx, x - 4, y - 70, 10, 70, '#3a2238', OL, 3);
    // peluche
    ctx.fillStyle = '#ff9ad0'; ctx.beginPath(); ctx.arc(x + 44, y - 52, 7, 0, U.TAU); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 39, y - 58, 3, 0, U.TAU); ctx.arc(x + 49, y - 58, 3, 0, U.TAU); ctx.fill();
  };
  P.poster = function (ctx, x, y, d, t) {
    const w = (d.pw || 40), h = (d.ph || 56);
    const px = x, py = y - h;
    box(ctx, px, py, w, h, d.bg || '#2a1a4a', '#140a20', 2);
    const g = ctx.createLinearGradient(px, py, px, py + h);
    g.addColorStop(0, d.c1 || '#ff5fae'); g.addColorStop(1, d.c2 || '#6a3ad8');
    ctx.fillStyle = g; ctx.fillRect(px + 4, py + 4, w - 8, h - 18);
    if (d.text) G.text(ctx, d.text, px + w / 2, py + h - 5, { size: 8, color: '#fff', align: 'center' });
    if (d.icon === 'heart') { ctx.fillStyle = '#fff'; G.heart(ctx, px + w / 2, py + 12, 16); ctx.fill(); }
    if (d.icon === 'star') { ctx.fillStyle = '#fff'; G.star(ctx, px + w / 2, py + (h - 14) / 2 + 2, 10, 4); ctx.fill(); }
  };
  P.window = function (ctx, x, y, d, t, game) {
    const w = (d.w || 4) * T, h = (d.h || 3) * T;
    const wx = x, wy = y - h;
    ctx.save();
    ctx.beginPath(); ctx.rect(wx, wy, w, h); ctx.clip();
    const g = ctx.createLinearGradient(0, wy, 0, wy + h);
    const gray = game && game.story.windowGray ? game.story.windowGray() : 0;
    g.addColorStop(0, U.gray('#1a1238', gray)); g.addColorStop(1, U.gray('#6a3a6a', gray));
    ctx.fillStyle = g; ctx.fillRect(wx, wy, w, h);
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 12; i++) { ctx.globalAlpha = 0.5 + 0.4 * Math.sin(t * 2 + i); ctx.fillRect(wx + U.hash(i, 1, 3) * w, wy + U.hash(i, 2, 3) * h * 0.5, 1.5, 1.5); }
    ctx.globalAlpha = 1;
    ctx.fillStyle = U.gray('#2a1a44', gray);
    for (let i = 0; i < 8; i++) { const bw = 12 + U.hash(i, 5, 1) * 18, bh = 20 + U.hash(i, 6, 1) * 40; ctx.fillRect(wx + i * (w / 7) - 6, wy + h - bh, bw, bh); }
    ctx.fillStyle = U.gray('#ffcf7a', gray);
    for (let i = 0; i < 20; i++) if (U.hash(i, 9, 2) < 0.5) ctx.fillRect(wx + U.hash(i, 7, 2) * w, wy + h - 10 - U.hash(i, 8, 2) * 40, 2, 3);
    if (d.fog) { ctx.fillStyle = 'rgba(180,175,195,' + (0.35 + 0.1 * Math.sin(t)) + ')'; ctx.fillRect(wx, wy + h * 0.45, w, h); }
    ctx.restore();
    ctx.strokeStyle = '#e8dff0'; ctx.lineWidth = 4; ctx.strokeRect(wx, wy, w, h);
    ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(wx + w / 2, wy); ctx.lineTo(wx + w / 2, wy + h); ctx.moveTo(wx, wy + h / 2); ctx.lineTo(wx + w, wy + h / 2); ctx.stroke();
    ctx.fillStyle = '#d8cfe0'; ctx.fillRect(wx - 6, wy + h, w + 12, 6);
    // rideaux
    ctx.fillStyle = '#7a3a8a';
    ctx.beginPath(); ctx.moveTo(wx - 10, wy - 8); ctx.quadraticCurveTo(wx + 8, wy + h * 0.5, wx - 4, wy + h + 10); ctx.lineTo(wx - 14, wy + h + 10); ctx.lineTo(wx - 14, wy - 8); ctx.fill();
    ctx.beginPath(); ctx.moveTo(wx + w + 10, wy - 8); ctx.quadraticCurveTo(wx + w - 8, wy + h * 0.5, wx + w + 4, wy + h + 10); ctx.lineTo(wx + w + 14, wy + h + 10); ctx.lineTo(wx + w + 14, wy - 8); ctx.fill();
  };
  P.shelfdeco = function (ctx, x, y, d, t) {
    // objets posés sur une étagère (y = dessus de l'étagère)
    const items = d.items || ['book', 'plant', 'figure'];
    let cx = x + 2;
    for (const it of items) {
      if (it === 'book') { for (let i = 0; i < 4; i++) { ctx.fillStyle = ['#ff5fae', '#5a9aff', '#ffd14a', '#9ccc65'][i]; ctx.fillRect(cx + i * 5, y - 16 + (i % 2) * 2, 4, 16 - (i % 2) * 2); } cx += 24; }
      else if (it === 'plant') { ctx.fillStyle = '#d8784a'; ctx.fillRect(cx, y - 8, 10, 8); ctx.fillStyle = '#5aa84a'; ctx.beginPath(); ctx.ellipse(cx + 5, y - 12, 7, 5, 0, 0, U.TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(cx + 1, y - 16, 3, 6, -0.5, 0, U.TAU); ctx.ellipse(cx + 9, y - 16, 3, 6, 0.5, 0, U.TAU); ctx.fill(); cx += 16; }
      else if (it === 'figure') { ctx.fillStyle = '#b388ff'; G.rr(ctx, cx, y - 14, 8, 14, 3); ctx.fill(); ctx.beginPath(); ctx.arc(cx + 4, y - 17, 4, 0, U.TAU); ctx.fill(); cx += 14; }
      else if (it === 'trophy') { ctx.fillStyle = '#e9c35b'; ctx.fillRect(cx + 3, y - 4, 8, 4); ctx.fillRect(cx + 6, y - 10, 2, 6); ctx.beginPath(); ctx.arc(cx + 7, y - 14, 6, 0, Math.PI); ctx.fill(); cx += 16; }
      else if (it === 'cam') { ctx.fillStyle = '#eee'; ctx.beginPath(); ctx.arc(cx + 6, y - 7, 7, 0, U.TAU); ctx.fill(); ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(cx + 7, y - 7, 3, 0, U.TAU); ctx.fill(); cx += 16; }
      else if (it === 'box') { ctx.fillStyle = '#b08a5a'; ctx.fillRect(cx, y - 14, 18, 14); ctx.strokeStyle = '#6a4a2a'; ctx.strokeRect(cx, y - 14, 18, 14); cx += 22; }
    }
  };
  P.wardrobe = function (ctx, x, y, d) {
    const w = (d.w || 3) * T, h = (d.h || 6) * T;
    box(ctx, x, y - h, w, h, '#5a3a4a', OL, 3);
    ctx.strokeStyle = '#3a2230'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + w / 2, y - h + 6); ctx.lineTo(x + w / 2, y - 6); ctx.stroke();
    ctx.fillStyle = '#e9c35b'; ctx.fillRect(x + w / 2 - 6, y - h / 2, 3, 10); ctx.fillRect(x + w / 2 + 3, y - h / 2, 3, 10);
  };
  P.sofa = function (ctx, x, y, d) {
    const w = (d.w || 6) * T;
    box(ctx, x, y - 50, w, 30, '#6a3a7a', OL, 10);
    box(ctx, x - 6, y - 36, 18, 36, '#5a2e6a', OL, 8);
    box(ctx, x + w - 12, y - 36, 18, 36, '#5a2e6a', OL, 8);
    box(ctx, x + 8, y - 30, w - 16, 22, '#7a4a8a', OL, 6);
    ctx.fillStyle = '#ffd14a'; G.rr(ctx, x + 14, y - 48, 22, 18, 5); ctx.fill();
    ctx.fillStyle = '#ff5fae'; G.rr(ctx, x + w - 40, y - 48, 22, 18, 5); ctx.fill();
  };
  P.tv = function (ctx, x, y, d, t, game) {
    box(ctx, x, y - 22, 80, 22, '#3a2a3a', OL, 3);
    box(ctx, x + 4, y - 72, 72, 46, '#101014', OL, 3);
    const st = game && game.room.state;
    if (st && st.tvStatic) G.staticNoise(ctx, x + 8, y - 68, 64, 38, 0.9, t);
    else if (st && st.power !== false) { ctx.fillStyle = '#2a1a4a'; ctx.fillRect(x + 8, y - 68, 64, 38); G.text(ctx, '♥ HoL', x + 40, y - 45, { size: 12, color: '#ff8ad8', align: 'center' }); }
  };
  P.fridge = function (ctx, x, y, d) {
    box(ctx, x, y - 96, 58, 96, '#e8e4ee', OL, 5);
    ctx.strokeStyle = '#9a96a8'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 2, y - 60); ctx.lineTo(x + 56, y - 60); ctx.stroke();
    ctx.fillStyle = '#9a96a8'; ctx.fillRect(x + 48, y - 88, 3, 18); ctx.fillRect(x + 48, y - 52, 3, 22);
    ctx.fillStyle = '#ff5fae'; ctx.beginPath(); ctx.arc(x + 14, y - 80, 4, 0, U.TAU); ctx.fill(); ctx.fillStyle = '#ffd14a'; ctx.fillRect(x + 22, y - 76, 8, 6);
  };
  P.counter = function (ctx, x, y, d) {
    const w = (d.w || 6) * T;
    box(ctx, x, y - 40, w, 40, '#4a3a5a', OL, 2);
    ctx.fillStyle = '#d8d0e0'; ctx.fillRect(x - 3, y - 44, w + 6, 6);
    for (let i = 0; i < Math.floor(w / 36); i++) { ctx.strokeStyle = '#2a1e36'; ctx.strokeRect(x + 4 + i * 36, y - 34, 32, 30); ctx.fillStyle = '#9a8aa8'; ctx.fillRect(x + 18 + i * 36, y - 22, 6, 2); }
    ctx.fillStyle = '#6a5a7a'; G.rr(ctx, x + 16, y - 56, 20, 12, 3); ctx.fill();
  };
  P.cabinets = function (ctx, x, y, d) {
    const w = (d.w || 6) * T;
    box(ctx, x, y, w, 40, '#5a4a6a', OL, 2);
    for (let i = 0; i < Math.floor(w / 36); i++) { ctx.strokeStyle = '#2a1e36'; ctx.strokeRect(x + 4 + i * 36, y + 4, 32, 32); }
  };
  P.plant = function (ctx, x, y, d, t) {
    const s = d.s || 1;
    ctx.fillStyle = '#c8683a'; ctx.beginPath(); ctx.moveTo(x + 6, y - 18 * s); ctx.lineTo(x + 26, y - 18 * s); ctx.lineTo(x + 22, y); ctx.lineTo(x + 10, y); ctx.fill();
    ctx.strokeStyle = OL; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#3f8a44';
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i - 2.5) * 0.35 + Math.sin(t + i) * 0.04;
      ctx.beginPath(); ctx.ellipse(x + 16 + Math.cos(a) * 14 * s, y - 18 * s + Math.sin(a) * 18 * s, 5 * s, 12 * s, a + Math.PI / 2, 0, U.TAU); ctx.fill();
    }
  };
  P.lampfloor = function (ctx, x, y, d, t, game) {
    const on = !game || game.room.state.power !== false;
    ctx.fillStyle = '#2a2a33'; ctx.fillRect(x + 14, y - 80, 3, 80); ctx.fillRect(x + 6, y - 3, 20, 3);
    ctx.fillStyle = on ? '#ffe0b0' : '#6a6070'; ctx.beginPath(); ctx.moveTo(x + 4, y - 80); ctx.lineTo(x + 27, y - 80); ctx.lineTo(x + 22, y - 98); ctx.lineTo(x + 9, y - 98); ctx.fill();
    if (on) G.glow(ctx, x + 16, y - 84, 70, '#ffc880', 0.4);
  };
  P.fairylights = function (ctx, x, y, d, t, game) {
    const w = (d.w || 8) * T;
    const on = !game || game.room.state.power !== false;
    ctx.strokeStyle = '#3a2a3a'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 20; i++) { const px = x + (i / 20) * w, py = y + Math.sin((i / 20) * Math.PI * 3) * 8 + 8; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
    ctx.stroke();
    for (let i = 0; i <= 20; i++) {
      const px = x + (i / 20) * w, py = y + Math.sin((i / 20) * Math.PI * 3) * 8 + 10;
      const col = ['#ff8ad8', '#ffd14a', '#9ae6ff', '#b388ff'][i % 4];
      ctx.fillStyle = on ? col : '#444';
      ctx.beginPath(); ctx.arc(px, py, 2, 0, U.TAU); ctx.fill();
      if (on) G.glow(ctx, px, py, 9, col, 0.5 + 0.3 * Math.sin(t * 3 + i));
    }
  };
  P.boxes = function (ctx, x, y, d) {
    const n = d.n || 2;
    for (let i = 0; i < n; i++) {
      const bw = 30 + (i % 2) * 8, bh = 26 + (i % 3) * 4;
      const bx = x + i * 26, by = y - bh - (i >= 2 ? 26 : 0);
      box(ctx, bx, by, bw, bh, '#b08a5a', '#5a3a1a', 2);
      ctx.fillStyle = '#d8b88a'; ctx.fillRect(bx + bw / 2 - 3, by, 6, bh);
    }
  };
  P.cratestack = function (ctx, x, y, d) {
    const w = d.w || 2, h = d.h || 2;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const bx = x + i * T, by = y - (j + 1) * T;
      const c = U.mix(d.color || '#9a7446', '#6a4a2a', ((i + j * 3) % 4) * 0.12);
      box(ctx, bx + 1, by + 1, T - 2, T - 2, c, '#3a2410', 2);
      ctx.strokeStyle = 'rgba(40,24,10,0.55)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(bx + 4, by + 4); ctx.lineTo(bx + T - 4, by + T - 4); ctx.moveTo(bx + T - 4, by + 4); ctx.lineTo(bx + 4, by + T - 4); ctx.stroke();
      ctx.fillStyle = 'rgba(255,230,190,0.18)'; ctx.fillRect(bx + 2, by + 2, T - 4, 2);
    }
  };
  P.barrels = function (ctx, x, y, d) {
    const h = d.h || 2;
    for (let j = 0; j < h; j++) {
      const by = y - (j + 1) * T;
      box(ctx, x + 2, by + 1, T - 4, T - 2, '#7a4a2e', '#2a160a', 8);
      ctx.fillStyle = '#5a5a66'; ctx.fillRect(x + 2, by + 7, T - 4, 3); ctx.fillRect(x + 2, by + T - 10, T - 4, 3);
      ctx.fillStyle = 'rgba(255,220,180,0.15)'; ctx.fillRect(x + 8, by + 3, 4, T - 6);
    }
  };
  P.car = function (ctx, x, y, d, t, game) {
    const col = d.color || '#5a6aa8';
    const w = (d.w || 5) * T;
    ctx.fillStyle = col; ctx.strokeStyle = OL; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(x + 4, y - 14); ctx.lineTo(x + 4, y - 34); ctx.quadraticCurveTo(x + 6, y - 40, x + 20, y - 40);
    ctx.lineTo(x + w * 0.28, y - 40); ctx.lineTo(x + w * 0.38, y - 62); ctx.lineTo(x + w * 0.74, y - 62); ctx.lineTo(x + w * 0.86, y - 40);
    ctx.lineTo(x + w - 10, y - 38); ctx.quadraticCurveTo(x + w, y - 36, x + w, y - 24); ctx.lineTo(x + w, y - 14); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9ac8e8'; ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.moveTo(x + w * 0.31, y - 41); ctx.lineTo(x + w * 0.39, y - 58); ctx.lineTo(x + w * 0.54, y - 58); ctx.lineTo(x + w * 0.54, y - 41); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + w * 0.57, y - 41); ctx.lineTo(x + w * 0.57, y - 58); ctx.lineTo(x + w * 0.72, y - 58); ctx.lineTo(x + w * 0.82, y - 41); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffe9a0'; ctx.fillRect(x + w - 8, y - 32, 6, 6); ctx.fillStyle = '#ff5a5a'; ctx.fillRect(x + 4, y - 32, 5, 6);
    ctx.fillStyle = '#1a1a22';
    for (const wx of [x + w * 0.2, x + w * 0.8]) { ctx.beginPath(); ctx.arc(wx, y - 12, 12, 0, U.TAU); ctx.fill(); ctx.fillStyle = '#8a8a96'; ctx.beginPath(); ctx.arc(wx, y - 12, 5, 0, U.TAU); ctx.fill(); ctx.fillStyle = '#1a1a22'; }
  };
  P.workbench = function (ctx, x, y, d) {
    const w = (d.w || 5) * T;
    box(ctx, x, y - 38, w, 6, '#7a5a3a', OL, 1);
    ctx.fillStyle = '#5a3a24'; ctx.fillRect(x + 4, y - 32, 5, 32); ctx.fillRect(x + w - 9, y - 32, 5, 32);
    ctx.fillStyle = '#3a3a44'; ctx.fillRect(x + 10, y - 100, w - 20, 50);
    ctx.strokeStyle = '#6a6a78'; ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.arc(x + 20 + i * ((w - 40) / 5), y - 90 + j * 16, 1.5, 0, U.TAU); ctx.stroke(); }
    ctx.strokeStyle = '#9a9aa8'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + 30, y - 92); ctx.lineTo(x + 30, y - 66); ctx.moveTo(x + 52, y - 90); ctx.lineTo(x + 58, y - 70); ctx.stroke();
    ctx.fillStyle = '#d84a3a'; ctx.fillRect(x + 70, y - 90, 14, 6);
  };
  P.radio = function (ctx, x, y, d, t, game) {
    box(ctx, x, y - 26, 44, 26, '#6a4a32', OL, 5);
    ctx.fillStyle = '#d8c8a0'; G.rr(ctx, x + 4, y - 22, 22, 18, 3); ctx.fill();
    ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.arc(x + 34, y - 14, 5, 0, U.TAU); ctx.fill();
    ctx.strokeStyle = '#9a9aa8'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 38, y - 26); ctx.lineTo(x + 50, y - 50); ctx.stroke();
    if (game && game.room.state.radioOn) { G.glow(ctx, x + 15, y - 13, 30, '#c9b8ff', 0.5 + 0.3 * Math.sin(t * 9)); }
  };
  P.stairs = function (ctx, x, y, d) {
    // escalier décoratif (sert de fond aux plateformes)
    const n = d.n || 4;
    for (let i = 0; i < n; i++) box(ctx, x + i * 16, y - (i + 1) * 16, (n - i) * 16, 16, '#5a3a2a', OL, 1);
  };
  P.frame = function (ctx, x, y, d) {
    const w = d.pw || 30, h = d.ph || 24;
    box(ctx, x, y - h, w, h, '#e9c35b', OL, 2);
    const g = ctx.createLinearGradient(x, y - h, x + w, y);
    g.addColorStop(0, d.c1 || '#ff9ad0'); g.addColorStop(1, d.c2 || '#7a5ad8');
    ctx.fillStyle = g; ctx.fillRect(x + 3, y - h + 3, w - 6, h - 6);
  };
  P.fusebox_prop = function (ctx, x, y, d, t, game) {
    box(ctx, x, y - 70, 50, 60, '#8a8a96', OL, 3);
    ctx.fillStyle = '#5a5a66'; ctx.fillRect(x + 5, y - 64, 40, 48);
    const st = game && game.room.state;
    for (let i = 0; i < 4; i++) {
      const up = st && st.fuseSw ? st.fuseSw[i] : 0;
      ctx.fillStyle = '#2a2a33'; ctx.fillRect(x + 9 + i * 9, y - 56, 6, 20);
      ctx.fillStyle = up ? '#5fe07a' : '#e05a5a'; ctx.fillRect(x + 9 + i * 9, up ? y - 56 : y - 44, 6, 8);
    }
    ctx.fillStyle = st && st.power !== false ? '#5fe07a' : '#e05a5a';
    ctx.beginPath(); ctx.arc(x + 25, y - 24, 3, 0, U.TAU); ctx.fill();
    if (st && st.power === false && Math.sin(t * 6) > 0) G.glow(ctx, x + 25, y - 24, 12, '#e05a5a', 0.6);
    ctx.fillStyle = '#ffd14a'; ctx.beginPath(); ctx.moveTo(x + 18, y - 76); ctx.lineTo(x + 32, y - 76); ctx.lineTo(x + 25, y - 88); ctx.fill();
  };

  // ================= QUARTIER =================
  P.facade = function (ctx, x, y, d, t, game) {
    const w = (d.w || 8) * T, h = (d.h || 8) * T;
    const gray = game ? game.story.zoneGray('quartier') : 0;
    const col = U.gray(d.color || '#7a5a6a', gray * 0.8);
    const fx = x, fy = y - h;
    ctx.fillStyle = col; ctx.fillRect(fx, fy, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < h / 10; i++) ctx.fillRect(fx, fy + i * 10, w, 1);
    // toit / corniche
    ctx.fillStyle = U.gray(d.roof || '#3a2a4a', gray * 0.8);
    if (d.gable) { ctx.beginPath(); ctx.moveTo(fx - 10, fy + 4); ctx.lineTo(fx + w / 2, fy - w * 0.28); ctx.lineTo(fx + w + 10, fy + 4); ctx.closePath(); ctx.fill(); }
    else ctx.fillRect(fx - 6, fy - 8, w + 12, 12);
    // fenêtres
    const cols = Math.max(1, Math.floor(w / 72)), rows = Math.max(1, Math.floor((h - 90) / 80));
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const wx = fx + (i + 0.5) * (w / cols) - 18, wy = fy + 24 + j * 80;
      const lit = U.hash(Math.floor(fx) + i, j, 3) < (d.lit === undefined ? 0.5 : d.lit);
      ctx.fillStyle = '#2a2034'; ctx.fillRect(wx - 3, wy - 3, 42, 52);
      ctx.fillStyle = lit ? U.gray('#ffc46b', gray) : '#1a1426'; ctx.fillRect(wx, wy, 36, 46);
      if (lit) G.glow(ctx, wx + 18, wy + 23, 40, U.gray('#ffb050', gray), 0.25);
      ctx.fillStyle = '#2a2034'; ctx.fillRect(wx + 17, wy, 2, 46); ctx.fillRect(wx, wy + 22, 36, 2);
      ctx.fillStyle = U.gray('#8a3a4a', gray); ctx.fillRect(wx - 6, wy + 48, 48, 5);
      if (U.hash(i, j, 7) < 0.5) { ctx.fillStyle = U.gray('#5aa84a', gray); for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(wx - 2 + k * 10, wy + 46, 4, 0, U.TAU); ctx.fill(); } }
    }
    if (d.door) {
      const dx = fx + (d.doorX || w / 2) - 22;
      ctx.fillStyle = '#2a1a24'; ctx.fillRect(dx - 4, y - 74, 52, 74);
      ctx.fillStyle = U.gray(d.doorColor || '#7a3a4a', gray); ctx.fillRect(dx, y - 70, 44, 70);
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(dx + 6, y - 62, 14, 24); ctx.fillRect(dx + 24, y - 62, 14, 24);
      ctx.fillStyle = '#e9c35b'; ctx.beginPath(); ctx.arc(dx + 36, y - 34, 2.5, 0, U.TAU); ctx.fill();
      ctx.fillStyle = '#4a3a4a'; ctx.fillRect(dx - 8, y - 4, 60, 4);
    }
    if (d.sign) {
      ctx.fillStyle = '#1a1226'; G.rr(ctx, fx + w / 2 - 70, fy + h - 130, 140, 26, 5); ctx.fill();
      G.text(ctx, d.sign, fx + w / 2, fy + h - 111, { size: 14, color: U.gray(d.signColor || '#ff8ad8', gray), align: 'center' });
      if (!gray || gray < 0.5) G.glow(ctx, fx + w / 2, fy + h - 117, 60, d.signColor || '#ff8ad8', 0.2);
    }
  };
  P.streetlamp = function (ctx, x, y, d, t, game) {
    const on = d.on || (d.onIf && game && game.story.cond(d.onIf));
    ctx.fillStyle = '#2a2a36'; ctx.fillRect(x + 14, y - 110, 4, 110); ctx.fillRect(x + 8, y - 6, 16, 6);
    ctx.fillRect(x + 14, y - 112, 16, 3);
    ctx.fillStyle = on ? '#ffe0a0' : '#4a4a58'; ctx.beginPath(); ctx.moveTo(x + 22, y - 110); ctx.lineTo(x + 36, y - 110); ctx.lineTo(x + 32, y - 100); ctx.lineTo(x + 26, y - 100); ctx.fill();
    if (on) {
      G.glow(ctx, x + 29, y - 100, 80, '#ffd28a', 0.4);
      const g = ctx.createLinearGradient(0, y - 100, 0, y);
      g.addColorStop(0, 'rgba(255,220,150,0.18)'); g.addColorStop(1, 'rgba(255,220,150,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x + 24, y - 100); ctx.lineTo(x + 34, y - 100); ctx.lineTo(x + 70, y); ctx.lineTo(x - 12, y); ctx.fill();
      if (game) game.lights.push({ x: x + 29, y: y - 90, r: 150, color: '#ffd28a', a: 0.8 });
    }
  };
  P.awning = function (ctx, x, y, d) {
    const w = (d.w || 5) * T;
    for (let i = 0; i < w / 16; i++) {
      ctx.fillStyle = i % 2 ? '#e8e0d0' : '#c25a6a';
      ctx.beginPath(); ctx.moveTo(x + i * 16, y + 2); ctx.lineTo(x + i * 16 + 16, y + 2); ctx.lineTo(x + i * 16 + 16, y + 16); ctx.quadraticCurveTo(x + i * 16 + 8, y + 22, x + i * 16, y + 16); ctx.fill();
    }
    ctx.fillStyle = '#3a2a3a'; ctx.fillRect(x, y, w, 3);
  };
  P.balcony = function (ctx, x, y, d) {
    const w = (d.w || 5) * T;
    ctx.fillStyle = '#3a3448'; ctx.fillRect(x, y, w, 5);
    ctx.fillRect(x, y - 24, w, 3);
    for (let i = 0; i <= w / 10; i++) ctx.fillRect(x + i * 10, y - 24, 2, 24);
    ctx.fillStyle = '#5aa84a'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x + 12 + i * 34, y - 26, 6, 0, U.TAU); ctx.fill(); }
    ctx.fillStyle = '#ff7ab8'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x + 14 + i * 34, y - 30, 2.5, 0, U.TAU); ctx.fill(); }
  };
  P.bookshelf = function (ctx, x, y, d) {
    const w = (d.w || 4) * T, h = (d.h || 5) * T;
    box(ctx, x, y - h, w, h, '#4a2e3a', OL, 3);
    const rows = Math.floor(h / 36);
    for (let r = 0; r < rows; r++) {
      const yy = y - h + 8 + r * 36;
      ctx.fillStyle = '#2e1a24'; ctx.fillRect(x + 5, yy, w - 10, 28);
      let bx = x + 8;
      let k = r * 7;
      while (bx < x + w - 14) {
        const bw = 5 + ((k * 13) % 7), bh = 18 + ((k * 7) % 9);
        ctx.fillStyle = ['#ff5fae', '#5a9aff', '#ffd14a', '#9ccc65', '#b388ff', '#ff9f43'][k % 6];
        ctx.fillRect(bx, yy + 28 - bh, bw, bh);
        bx += bw + 1; k++;
      }
      ctx.fillStyle = '#6a4452'; ctx.fillRect(x + 3, yy + 28, w - 6, 4);
    }
  };
  P.bigmush = function (ctx, x, y, d, t) {
    const s = d.s || 1;
    ctx.fillStyle = '#e8dcc8'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x + 10 * s, y); ctx.quadraticCurveTo(x + 14 * s, y - 30 * s, x + 12 * s, y - 44 * s); ctx.lineTo(x + 24 * s, y - 44 * s); ctx.quadraticCurveTo(x + 22 * s, y - 30 * s, x + 26 * s, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.ellipse(x + 18 * s, y - 44 * s, 30 * s, 20 * s, 0, Math.PI, U.TAU); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff4e0';
    for (const [dx, dy, r] of [[-14, -52, 4], [0, -58, 5], [14, -50, 3.5], [-4, -48, 2.5], [22, -46, 2.5]]) { ctx.beginPath(); ctx.arc(x + 18 * s + dx * s, y + dy * s, r * s, 0, U.TAU); ctx.fill(); }
    G.glow(ctx, x + 18 * s, y - 40 * s, 40 * s, '#ff8a5a', 0.15);
  };
  P.tree = function (ctx, x, y, d, t, game) {
    const s = d.s || 1;
    const gray = game ? game.story.zoneGray(game.room.zone) * 0.7 : 0;
    ctx.fillStyle = U.gray('#4a3222', gray); ctx.beginPath(); ctx.moveTo(x + 10 * s, y); ctx.lineTo(x + 14 * s, y - 70 * s); ctx.lineTo(x + 20 * s, y - 70 * s); ctx.lineTo(x + 24 * s, y); ctx.fill();
    const sw = Math.sin(t * 0.8 + x) * 3;
    const cols = d.pink ? ['#c25a9a', '#e07ab8', '#ffa0d0'] : ['#2f6a34', '#3f8a44', '#5aa84a'];
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = U.gray(cols[i], gray);
      ctx.beginPath();
      ctx.arc(x + 17 * s + sw * (i / 2), y - (90 + i * 16) * s, (36 - i * 8) * s, 0, U.TAU);
      ctx.arc(x + (-8 + i * 4) * s + sw * (i / 2), y - (72 + i * 14) * s, (26 - i * 5) * s, 0, U.TAU);
      ctx.arc(x + (42 - i * 4) * s + sw * (i / 2), y - (74 + i * 14) * s, (26 - i * 5) * s, 0, U.TAU);
      ctx.fill();
    }
  };
  P.bench = function (ctx, x, y) {
    ctx.fillStyle = '#6a4a2e'; ctx.fillRect(x, y - 20, 64, 5); ctx.fillRect(x, y - 36, 64, 4); ctx.fillRect(x, y - 30, 64, 4);
    ctx.fillStyle = '#2a2a33'; ctx.fillRect(x + 4, y - 20, 4, 20); ctx.fillRect(x + 56, y - 20, 4, 20); ctx.fillRect(x + 4, y - 38, 3, 18); ctx.fillRect(x + 57, y - 38, 3, 18);
  };
  P.bin = function (ctx, x, y) {
    box(ctx, x + 2, y - 30, 26, 30, '#3a6a4a', OL, 3);
    box(ctx, x, y - 34, 30, 6, '#2a5a3a', OL, 2);
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; for (let i = 0; i < 3; i++) ctx.fillRect(x + 7 + i * 7, y - 26, 2, 22);
  };
  P.mailbox = function (ctx, x, y) {
    ctx.fillStyle = '#3a3a44'; ctx.fillRect(x + 14, y - 40, 4, 40);
    box(ctx, x + 4, y - 58, 24, 18, '#e0b83a', OL, 6);
    ctx.fillStyle = '#c0392b'; ctx.fillRect(x + 26, y - 58, 3, 10);
  };
  P.busstop = function (ctx, x, y, d) {
    const w = (d.w || 4) * T;
    ctx.fillStyle = '#3a3a48'; ctx.fillRect(x + 4, y - 96, 4, 96); ctx.fillRect(x + w - 8, y - 96, 4, 96);
    ctx.fillStyle = 'rgba(160,200,230,0.25)'; ctx.fillRect(x + 8, y - 90, w - 16, 70);
    ctx.fillStyle = '#e0e0ea'; G.rr(ctx, x + 14, y - 80, 36, 50, 3); ctx.fill();
    ctx.fillStyle = '#ff5fae'; ctx.fillRect(x + 17, y - 76, 30, 20); G.text(ctx, 'HoL', x + 32, y - 60, { size: 9, color: '#fff', align: 'center' });
    ctx.fillStyle = '#5a5a68'; ctx.fillRect(x + 12, y - 26, w - 24, 4);
  };
  P.fountain = function (ctx, x, y, d, t, game) {
    const on = game && game.flag('lamps_done');
    const w = 7 * T;
    box(ctx, x, y - 34, w, 34, '#8a8498', OL, 6);
    ctx.fillStyle = '#6a6478'; ctx.fillRect(x + 6, y - 30, w - 12, 4);
    ctx.fillStyle = '#9a94a8'; ctx.fillRect(x + w / 2 - 10, y - 90, 20, 60);
    box(ctx, x + w / 2 - 34, y - 96, 68, 10, '#9a94a8', OL, 4);
    // statue de cœur au sommet
    ctx.fillStyle = on ? '#ff8ad8' : '#8a8498'; G.heart(ctx, x + w / 2, y - 128, 30); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 1.5; ctx.stroke();
    if (on) {
      G.glow(ctx, x + w / 2, y - 115, 60, '#ff8ad8', 0.4);
      // jets d'eau
      ctx.strokeStyle = 'rgba(190,235,255,0.8)'; ctx.lineWidth = 2;
      for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        ctx.beginPath(); ctx.moveTo(x + w / 2 + i * 6, y - 96);
        ctx.quadraticCurveTo(x + w / 2 + i * 22, y - 130, x + w / 2 + i * 30, y - 36); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(120,200,255,0.55)'; ctx.fillRect(x + 6, y - 32, w - 12, 8);
      for (let i = 0; i < 3; i++) ctx.fillRect(x + 20 + ((t * 40 + i * 70) % (w - 40)), y - 30, 8, 2);
    }
  };
  P.kiosk = function (ctx, x, y, d, t, game) {
    const gray = game ? game.story.zoneGray('quartier') : 0;
    const w = 6 * T;
    ctx.fillStyle = U.gray('#2a5a4a', gray); ctx.fillRect(x, y - 100, w, 100);
    ctx.fillStyle = U.gray('#3a7a5a', gray); ctx.fillRect(x + 8, y - 90, w - 16, 44);
    ctx.fillStyle = '#e8e0d0'; for (let i = 0; i < 5; i++) { ctx.fillRect(x + 14 + i * 32, y - 84, 24, 34); ctx.fillStyle = ['#ff5fae', '#5a9aff', '#ffd14a', '#9ccc65', '#b388ff'][i]; ctx.fillRect(x + 16 + i * 32, y - 82, 20, 8); ctx.fillStyle = '#e8e0d0'; }
    ctx.fillStyle = U.gray('#1a3a2e', gray); ctx.fillRect(x, y - 44, w, 44);
    // auvent rayé
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? U.gray('#e0a84a', gray) : '#f4ece0'; ctx.beginPath(); ctx.moveTo(x - 8 + i * (w + 16) / 8, y - 112); ctx.lineTo(x - 8 + (i + 1) * (w + 16) / 8, y - 112); ctx.lineTo(x - 8 + (i + 1) * (w + 16) / 8, y - 96); ctx.quadraticCurveTo(x - 8 + (i + 0.5) * (w + 16) / 8, y - 88, x - 8 + i * (w + 16) / 8, y - 96); ctx.fill(); }
    ctx.fillStyle = '#1a1226'; G.rr(ctx, x + w / 2 - 60, y - 140, 120, 24, 5); ctx.fill();
    G.text(ctx, 'KIOSQUE · FLO', x + w / 2, y - 123, { size: 12, color: U.gray('#e0a84a', gray), align: 'center' });
  };
  P.foodtruck = function (ctx, x, y, d, t, game) {
    const gray = game ? game.story.zoneGray('quartier') : 0;
    const w = 7 * T, col = U.gray('#ff5e57', gray);
    ctx.fillStyle = col; ctx.strokeStyle = OL; ctx.lineWidth = 2;
    G.rr(ctx, x, y - 104, w - 40, 88, 8); ctx.fill(); ctx.stroke();
    G.rr(ctx, x + w - 44, y - 74, 44, 58, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9ac8e8'; ctx.fillRect(x + w - 34, y - 68, 24, 20);
    ctx.fillStyle = '#2a1a1a'; ctx.fillRect(x + 20, y - 86, w - 90, 40);
    ctx.fillStyle = U.gray('#ffd14a', gray);
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x + 14 + i * 26, y - 104); ctx.lineTo(x + 40 + i * 26, y - 104); ctx.lineTo(x + 27 + i * 26, y - 90); ctx.fill(); }
    ctx.fillStyle = '#f4efe6'; ctx.fillRect(x + 20, y - 48, w - 90, 6);
    G.text(ctx, 'TACOS', x + (w - 40) / 2, y - 112, { size: 18, color: U.gray('#ffd14a', gray), align: 'center', outline: OL, ow: 4 });
    ctx.fillStyle = '#1a1a22';
    for (const wx of [x + 34, x + w - 30]) { ctx.beginPath(); ctx.arc(wx, y - 14, 14, 0, U.TAU); ctx.fill(); ctx.fillStyle = '#8a8a96'; ctx.beginPath(); ctx.arc(wx, y - 14, 6, 0, U.TAU); ctx.fill(); ctx.fillStyle = '#1a1a22'; }
    if (game && game.flag('lamps_done')) { G.glow(ctx, x + (w - 40) / 2, y - 66, 60, '#ffb050', 0.3); }
  };
  P.mural = function (ctx, x, y, d, t, game) {
    const w = 10 * T, h = 5 * T;
    const fx = x, fy = y - h - 24;
    const restored = game && game.flag('mural_seen');
    ctx.fillStyle = '#4a3a4a'; ctx.fillRect(fx - 6, fy - 6, w + 12, h + 12);
    const g = ctx.createLinearGradient(fx, fy, fx + w, fy + h);
    g.addColorStop(0, restored ? '#ff8ad8' : '#8a8494'); g.addColorStop(0.5, restored ? '#7a5ad8' : '#6a6474'); g.addColorStop(1, restored ? '#3ad0c8' : '#7a7484');
    ctx.fillStyle = g; ctx.fillRect(fx, fy, w, h);
    const syms = ['etoile', 'note', 'lune', 'coeur'];
    const cols = ['#ffd14a', '#5fe0a0', '#c9d8ff', '#ff5fae'];
    for (let i = 0; i < 4; i++) {
      const cx = fx + 40 + i * 80, cy = fy + h / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(cx, cy, 30, 0, U.TAU); ctx.fill();
      G.symbol(ctx, syms[i], cx, cy, 40, restored ? cols[i] : U.gray(cols[i], 0.8));
      if (i < 3) { ctx.fillStyle = restored ? '#fff' : '#aaa'; ctx.beginPath(); ctx.moveTo(cx + 36, cy - 6); ctx.lineTo(cx + 46, cy); ctx.lineTo(cx + 36, cy + 6); ctx.fill(); }
      G.text(ctx, String(i + 1), cx, fy + h - 8, { size: 13, color: '#fff', align: 'center', outline: OL, ow: 3 });
    }
    // brume qui masque la fresque tant que Charly n'a pas été reconnecté·e
    if (!restored) {
      ctx.fillStyle = 'rgba(170,165,185,0.8)';
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(fx + 30 + i * 60 + Math.sin(t + i) * 8, fy + 30 + (i % 3) * 30, 60, 30, 0, 0, U.TAU); ctx.fill(); }
    }
    G.text(ctx, 'L\'HISTOIRE DE LA HOUSE', fx + w / 2, fy - 12, { size: 13, color: restored ? '#ffd1f2' : '#aaa', align: 'center', outline: OL, ow: 3 });
  };
  P.fireescape = function (ctx, x, y, d) {
    const h = (d.h || 10) * T;
    ctx.strokeStyle = '#3a4250'; ctx.lineWidth = 2;
    for (let i = 0; i < h / 64; i++) { ctx.beginPath(); ctx.moveTo(x, y - i * 64); ctx.lineTo(x + 60, y - i * 64 - 64); ctx.stroke(); }
  };
  P.antenna = function (ctx, x, y, d, t) {
    ctx.strokeStyle = '#3a3a48'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x + 16, y); ctx.lineTo(x + 16, y - (d.h || 4) * T); ctx.stroke();
    ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + 4, y - i * 28); ctx.lineTo(x + 28, y - i * 28); ctx.stroke(); }
    ctx.fillStyle = Math.sin(t * 3) > 0 ? '#ff3a4a' : '#6a1a2a'; ctx.beginPath(); ctx.arc(x + 16, y - (d.h || 4) * T, 3, 0, U.TAU); ctx.fill();
    if (Math.sin(t * 3) > 0) G.glow(ctx, x + 16, y - (d.h || 4) * T, 16, '#ff3a4a', 0.6);
  };
  P.boombox = function (ctx, x, y, d, t, game) {
    const on = game && game.flag('k974_done');
    box(ctx, x, y - 26, 50, 26, '#2a2a36', OL, 4);
    ctx.fillStyle = '#3fd6b5'; ctx.fillRect(x + 4, y - 22, 42, 3);
    const pump = on ? 1 + Math.abs(Math.sin(t * 8)) * 0.18 : 1;
    for (const sx of [x + 12, x + 38]) { ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(sx, y - 11, 8 * pump, 0, U.TAU); ctx.fill(); ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(sx, y - 11, 3, 0, U.TAU); ctx.fill(); }
    ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 8, y - 26); ctx.lineTo(x + 12, y - 34); ctx.lineTo(x + 38, y - 34); ctx.lineTo(x + 42, y - 26); ctx.stroke();
    if (on && Math.random() < 0.08 && game) game.particles.emit({ x: x + 25, y: y - 30, vx: [-30, 30], vy: [-60, -30], life: 1.2, size: 10, kind: 'text', text: U.pick(['♪', '♫']), color: U.pick(['#3fd6b5', '#ffd14a', '#ff8ad8']) });
  };
  P.parkgate_deco = function (ctx, x, y, d) {
    ctx.fillStyle = '#2a2a33'; ctx.fillRect(x, y - 120, 10, 120); ctx.fillRect(x + 118, y - 120, 10, 120);
    ctx.beginPath(); ctx.arc(x + 64, y - 120, 64, Math.PI, U.TAU); ctx.lineWidth = 6; ctx.strokeStyle = '#2a2a33'; ctx.stroke();
    G.text(ctx, 'PARC', x + 64, y - 150, { size: 14, color: '#c8c0d8', align: 'center' });
  };
  P.signpost = function (ctx, x, y, d) {
    ctx.fillStyle = '#5a3a24'; ctx.fillRect(x + 14, y - 64, 5, 64);
    const dir = d.dir || 1;
    ctx.fillStyle = '#8a6040'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (dir > 0) { ctx.moveTo(x - 10, y - 64); ctx.lineTo(x + 50, y - 64); ctx.lineTo(x + 60, y - 54); ctx.lineTo(x + 50, y - 44); ctx.lineTo(x - 10, y - 44); }
    else { ctx.moveTo(x + 44, y - 64); ctx.lineTo(x - 16, y - 64); ctx.lineTo(x - 26, y - 54); ctx.lineTo(x - 16, y - 44); ctx.lineTo(x + 44, y - 44); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    if (d.label) G.text(ctx, d.label, x + (dir > 0 ? 22 : 12), y - 50, { size: 9, color: '#fff3dc', align: 'center' });
  };

  // ================= FORÊT / NATURE =================
  P.bigtree = function (ctx, x, y, d, t, game) {
    // le Grand Chêne
    const s = d.s || 1;
    const gray = game ? game.story.zoneGray('foret') * 0.6 : 0;
    const trunk = U.gray('#4a3222', gray), dark = U.gray('#2e1e14', gray);
    ctx.fillStyle = dark;
    ctx.beginPath(); ctx.moveTo(x - 120 * s, y); ctx.quadraticCurveTo(x - 60 * s, y - 40 * s, x - 50 * s, y - 200 * s); ctx.lineTo(x + 50 * s, y - 200 * s); ctx.quadraticCurveTo(x + 60 * s, y - 40 * s, x + 130 * s, y); ctx.fill();
    ctx.fillStyle = trunk;
    ctx.beginPath(); ctx.moveTo(x - 90 * s, y); ctx.quadraticCurveTo(x - 40 * s, y - 60 * s, x - 38 * s, y - 520 * s); ctx.lineTo(x + 42 * s, y - 520 * s); ctx.quadraticCurveTo(x + 44 * s, y - 60 * s, x + 100 * s, y); ctx.fill();
    ctx.strokeStyle = dark; ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(x - 30 * s + i * 12 * s, y - 20); ctx.quadraticCurveTo(x - 25 * s + i * 11 * s, y - 250 * s, x - 20 * s + i * 8 * s, y - 500 * s); ctx.stroke(); }
    // branches
    ctx.strokeStyle = trunk; ctx.lineCap = 'round';
    ctx.lineWidth = 22 * s; ctx.beginPath(); ctx.moveTo(x, y - 420 * s); ctx.quadraticCurveTo(x - 140 * s, y - 470 * s, x - 260 * s, y - 440 * s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y - 380 * s); ctx.quadraticCurveTo(x + 150 * s, y - 430 * s, x + 280 * s, y - 400 * s); ctx.stroke();
    // feuillage
    const cols = ['#23502e', '#2f6a3a', '#3f8a48', '#5aa858'];
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = U.gray(cols[k], gray);
      const r = U.rng(99 + k);
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const px = x + (r() - 0.5) * 640 * s + Math.sin(t * 0.6 + i) * 4, py = y - 520 * s - (r() - 0.3) * 200 * s - k * 20;
        ctx.moveTo(px + 90 * s, py); ctx.arc(px, py, (90 - k * 14) * s, 0, U.TAU);
      }
      ctx.fill();
    }
    // lucioles autour
    if (!gray || gray < 0.5) for (let i = 0; i < 10; i++) { const a = t * 0.3 + i; G.glow(ctx, x + Math.cos(a * 1.3) * 200 * s, y - 300 * s + Math.sin(a) * 120 * s, 10, '#f4ff9a', 0.6); }
  };
  P.pine = function (ctx, x, y, d, t, game) {
    const s = d.s || 1;
    const gray = game ? game.story.zoneGray(game.room.zone) * 0.6 : 0;
    ctx.fillStyle = U.gray('#3a2a1e', gray); ctx.fillRect(x + 12 * s, y - 40 * s, 8 * s, 40 * s);
    const cols = ['#1f4a3a', '#2a5e48', '#3a7a58'];
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = U.gray(cols[i % 3], gray);
      const ky = y - 30 * s - i * 36 * s, kw = (60 - i * 12) * s;
      ctx.beginPath(); ctx.moveTo(x + 16 * s - kw, ky); ctx.lineTo(x + 16 * s + Math.sin(t * 0.7 + x) * 2, ky - 60 * s); ctx.lineTo(x + 16 * s + kw, ky); ctx.fill();
    }
  };
  P.log = function (ctx, x, y, d) {
    const w = (d.w || 3) * T;
    ctx.fillStyle = '#6a4a2e'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5;
    G.rr(ctx, x, y - 22, w, 22, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#a07a4e'; ctx.beginPath(); ctx.ellipse(x + w - 6, y - 11, 6, 10, 0, 0, U.TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#7a5a3a'; ctx.beginPath(); ctx.ellipse(x + w - 6, y - 11, 3, 5, 0, 0, U.TAU); ctx.stroke();
    ctx.fillStyle = '#5aa84a'; ctx.beginPath(); ctx.ellipse(x + 20, y - 22, 12, 4, 0, 0, U.TAU); ctx.fill();
  };
  P.stonecircle = function (ctx, x, y, d, t, game) {
    for (let i = 0; i < 5; i++) {
      const px = x + i * 40, h = 40 + (i % 2) * 20;
      ctx.fillStyle = '#5a5a66'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5;
      G.rr(ctx, px, y - h, 22, h, 6); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = game && game.flag('stones_done') ? '#9dff7a' : 'rgba(157,255,122,0.3)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(px + 6, y - h + 10); ctx.lineTo(px + 11, y - h + 22); ctx.lineTo(px + 16, y - h + 10); ctx.stroke();
    }
  };
  P.waterfall = function (ctx, x, y, d, t) {
    const w = (d.w || 3) * T, h = (d.h || 10) * T;
    const top = y - h;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, 'rgba(160,220,255,0.55)'); g.addColorStop(0.5, 'rgba(220,245,255,0.8)'); g.addColorStop(1, 'rgba(160,220,255,0.55)');
    ctx.fillStyle = g; ctx.fillRect(x, top, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2;
    for (let i = 0; i < w / 8; i++) {
      const lx = x + 4 + i * 8, off = ((t * 260 + i * 57) % 80);
      for (let k = -1; k < h / 80 + 1; k++) { ctx.beginPath(); ctx.moveTo(lx, top + k * 80 + off); ctx.lineTo(lx, top + k * 80 + off + 30); ctx.stroke(); }
    }
    // écume
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    for (let i = 0; i < 8; i++) { const a = t * 3 + i; ctx.beginPath(); ctx.arc(x + w / 2 + Math.cos(a) * w * 0.6, y - 6 + Math.sin(a * 1.7) * 4, 8 + Math.sin(a) * 3, 0, U.TAU); ctx.fill(); }
  };
  P.cliffsign = P.signpost;
  P.dock = function (ctx, x, y, d) {
    const w = (d.w || 4) * T;
    ctx.fillStyle = '#5a4030';
    for (let i = 0; i < w / 32; i++) ctx.fillRect(x + 12 + i * 32, y, 6, 70);
  };
  P.rope = function (ctx, x, y, d, t, game) {
    const on = game && game.flag('cable_done');
    const x2 = x + (d.len || 20) * T;
    ctx.strokeStyle = on ? '#c9a46a' : 'rgba(201,164,106,0.4)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, y - 60);
    if (on) ctx.quadraticCurveTo((x + x2) / 2, y - 30, x2, y - 60);
    else ctx.quadraticCurveTo(x + 40, y + 10, x + 60, y + 20);
    ctx.stroke();
    ctx.fillStyle = '#5a3a24'; ctx.fillRect(x - 3, y - 64, 8, 64);
    if (on) ctx.fillRect(x2 - 3, y - 64, 8, 64);
  };

  // ================= RUINES / FINAL =================
  P.pillar = function (ctx, x, y, d, t) {
    const h = (d.h || 5) * T;
    ctx.fillStyle = '#3a3466'; ctx.fillRect(x + 4, y - h, 24, h);
    ctx.fillStyle = '#4a4480'; ctx.fillRect(x, y - h, 32, 10); ctx.fillRect(x, y - 10, 32, 10);
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; for (let i = 0; i < 3; i++) ctx.fillRect(x + 8 + i * 7, y - h + 12, 2, h - 24);
    if (d.broken) { ctx.fillStyle = '#1a1438'; ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x + 14, y - h + 14); ctx.lineTo(x + 32, y - h - 4); ctx.lineTo(x + 32, y - h - 10); ctx.lineTo(x, y - h - 10); ctx.fill(); }
    if (d.rune) { ctx.strokeStyle = 'rgba(94,242,214,' + (0.5 + 0.4 * Math.sin(t * 2)) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 16, y - h / 2, 7, 0, U.TAU); ctx.moveTo(x + 16, y - h / 2 - 12); ctx.lineTo(x + 16, y - h / 2 + 12); ctx.stroke(); }
  };
  P.studio = function (ctx, x, y, d, t, game) {
    // vieux studio radio du Veilleur
    box(ctx, x, y - 40, 160, 40, '#4a3a2a', OL, 3);
    ctx.fillStyle = '#2a2018'; ctx.fillRect(x + 8, y - 34, 144, 20);
    for (let i = 0; i < 10; i++) { ctx.fillStyle = '#c8b890'; ctx.beginPath(); ctx.arc(x + 18 + i * 14, y - 24, 3, 0, U.TAU); ctx.fill(); }
    // micro vintage
    ctx.fillStyle = '#8a8a96'; ctx.fillRect(x + 74, y - 76, 4, 36);
    ctx.fillStyle = '#c8c8d4'; G.rr(ctx, x + 66, y - 100, 20, 28, 8); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.strokeStyle = '#6a6a78'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + 68, y - 94 + i * 6); ctx.lineTo(x + 84, y - 94 + i * 6); ctx.stroke(); }
    // panneau "ON AIR"
    const on = game && game.flag('archives_seen');
    box(ctx, x + 40, y - 150, 80, 26, '#1a1010', OL, 4);
    G.text(ctx, 'ON AIR', x + 80, y - 131, { size: 14, color: on ? '#ff4a5a' : '#5a2a2a', align: 'center' });
    if (on) G.glow(ctx, x + 80, y - 137, 50, '#ff4a5a', 0.35 + 0.15 * Math.sin(t * 4));
  };
  P.tapes = function (ctx, x, y, d) {
    const w = (d.w || 3) * T;
    box(ctx, x, y - 80, w, 80, '#3a2a22', OL, 2);
    for (let r = 0; r < 3; r++) for (let i = 0; i < w / 12 - 1; i++) { ctx.fillStyle = ['#c8b890', '#a89870', '#e0d0a8'][(i + r) % 3]; ctx.fillRect(x + 6 + i * 12, y - 74 + r * 25, 9, 20); }
  };
  P.transmitter = function (ctx, x, y, d, t, game) {
    const on = game && game.save.abilities.pulse;
    box(ctx, x, y - 140, 96, 140, '#2a2440', OL, 6);
    ctx.fillStyle = '#1a1630'; ctx.fillRect(x + 10, y - 128, 76, 60);
    for (let i = 0; i < 5; i++) { ctx.fillStyle = on ? ['#5ef2d6', '#ff8ad8', '#c38aff'][i % 3] : '#3a3450'; ctx.fillRect(x + 16 + i * 14, y - 60, 8, 40); }
    ctx.strokeStyle = on ? '#5ef2d6' : '#4a4466'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 30; i++) { const px = x + 14 + i * 2.3, py = y - 98 + Math.sin(i * 0.6 + t * (on ? 6 : 1)) * (on ? 16 : 3); if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
    ctx.stroke();
    if (on) G.glow(ctx, x + 48, y - 98, 80, '#5ef2d6', 0.3);
  };
  P.letterdesk = function (ctx, x, y, d) {
    box(ctx, x, y - 34, 90, 8, '#5a4030', OL, 2);
    ctx.fillStyle = '#3a2a1e'; ctx.fillRect(x + 6, y - 26, 6, 26); ctx.fillRect(x + 78, y - 26, 6, 26);
    for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(x + 16 + i * 12, y - 36 - (i % 3) * 2); ctx.rotate((i - 3) * 0.1); ctx.fillStyle = '#efe6cc'; ctx.fillRect(-8, -6, 16, 10); ctx.restore(); }
  };
  P.holo = function (ctx, x, y, d, t, game) {
    // silhouette holographique du Veilleur (souvenir)
    if (!game || !game.room.state.holo) return;
    const a = game.room.state.holo;
    ctx.globalAlpha = a * (0.6 + 0.3 * Math.sin(t * 13) * Math.sin(t * 3));
    G.glow(ctx, x + 16, y - 40, 70, '#9d88ff', 0.5);
    ctx.fillStyle = 'rgba(200,184,255,0.7)';
    ctx.beginPath(); ctx.arc(x + 16, y - 70, 10, 0, U.TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 2, y); ctx.lineTo(x + 6, y - 58); ctx.lineTo(x + 26, y - 58); ctx.lineTo(x + 30, y); ctx.fill();
    ctx.fillStyle = 'rgba(20,10,40,0.3)'; for (let i = 0; i < 16; i++) ctx.fillRect(x - 4, y - 84 + i * 5 + ((t * 20) % 5), 40, 1.5);
    ctx.globalAlpha = 1;
  };
  P.bigcrystal = function (ctx, x, y, d, t, game) {
    const s = d.s || 1, col = d.color || '#6ae8ff';
    G.glow(ctx, x + 16, y - 50 * s, 120 * s, col, 0.35 + 0.1 * Math.sin(t * 1.5));
    for (let k = -2; k <= 2; k++) {
      const hh = (90 - Math.abs(k) * 22) * s;
      const g = ctx.createLinearGradient(0, y - hh, 0, y);
      g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, col); g.addColorStop(1, U.shade(col, -0.5));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(x + 16 + k * 16 * s - 12 * s, y); ctx.lineTo(x + 16 + k * 19 * s, y - hh); ctx.lineTo(x + 16 + k * 16 * s + 12 * s, y); ctx.fill();
    }
  };
  P.moon = function (ctx, x, y, d, t) {
    G.glow(ctx, x, y, 140, '#e8dcff', 0.35, true);
    ctx.fillStyle = '#f2ecff'; ctx.beginPath(); ctx.arc(x, y, 46, 0, U.TAU); ctx.fill();
    ctx.fillStyle = 'rgba(180,170,210,0.4)'; ctx.beginPath(); ctx.arc(x - 12, y - 8, 9, 0, U.TAU); ctx.arc(x + 14, y + 10, 6, 0, U.TAU); ctx.fill();
  };
  P.girder = function (ctx, x, y, d) {
    const h = (d.h || 10) * T;
    ctx.strokeStyle = '#2a2640'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.moveTo(x + 40, y); ctx.lineTo(x + 40, y - h); ctx.stroke();
    ctx.lineWidth = 2;
    for (let i = 0; i < h / 40; i++) { ctx.beginPath(); ctx.moveTo(x, y - i * 40); ctx.lineTo(x + 40, y - i * 40 - 40); ctx.moveTo(x + 40, y - i * 40); ctx.lineTo(x, y - i * 40 - 40); ctx.stroke(); }
  };
  P.redlight = function (ctx, x, y, d, t) {
    const on = Math.sin(t * 2.5 + x) > 0;
    ctx.fillStyle = on ? '#ff3a4a' : '#5a1a2a'; ctx.beginPath(); ctx.arc(x + 16, y - 8, 4, 0, U.TAU); ctx.fill();
    if (on) G.glow(ctx, x + 16, y - 8, 30, '#ff3a4a', 0.6);
  };

  // ================= ÉLÉMENTS D'ENTITÉS =================
  P.door = function (ctx, style, x, y, w, h, t, d, game) {
    if (style === 'hatch' || style === 'hatchup') {
      let hy = y + h - 4;
      if (style === 'hatch') {
        const tx = Math.floor((x + w / 2) / T);
        let ty = Math.floor(y / T);
        while (ty > 0 && !game.room.solidAt(tx, ty)) ty--;
        hy = (ty + 1) * T;
      }
      ctx.fillStyle = '#5a3a2a'; ctx.strokeStyle = OL; ctx.lineWidth = 2;
      ctx.fillRect(x - 4, hy - 4, w + 8, 10); ctx.strokeRect(x - 4, hy - 4, w + 8, 10);
      ctx.fillStyle = '#e9c35b'; ctx.fillRect(x + w / 2 - 4, hy - 1, 8, 3);
      if (style === 'hatch') { ctx.strokeStyle = '#8a8a96'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + w / 2, hy + 6); ctx.lineTo(x + w / 2, hy + 18); ctx.stroke(); ctx.fillStyle = '#e9c35b'; ctx.beginPath(); ctx.arc(x + w / 2, hy + 20, 3, 0, U.TAU); ctx.fill(); }
      return;
    }
    if (style === 'arch' || style === 'cave') {
      ctx.fillStyle = style === 'cave' ? '#0a080e' : '#1a1226';
      ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + w / 2); ctx.arc(x + w / 2, y + w / 2, w / 2, Math.PI, U.TAU); ctx.lineTo(x + w, y + h); ctx.fill();
      ctx.strokeStyle = style === 'cave' ? '#3a3450' : '#5a4e8a'; ctx.lineWidth = 4; ctx.stroke();
      if (style === 'arch') { const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(94,242,214,0.0)'); g.addColorStop(1, 'rgba(94,242,214,0.15)'); ctx.fillStyle = g; ctx.fill(); }
      return;
    }
    if (style === 'sas') {
      const open = game && game.story.cond(d.openIf || 'false');
      box(ctx, x - 4, y - 4, w + 8, h + 4, '#3a3a48', OL, 4);
      ctx.fillStyle = open ? '#1a1a22' : '#5a6a78'; G.rr(ctx, x, y, w, h, 3); ctx.fill();
      ctx.fillStyle = open ? '#5fe07a' : '#e05a5a'; ctx.beginPath(); ctx.arc(x + w / 2, y - 10, 4, 0, U.TAU); ctx.fill();
      G.glow(ctx, x + w / 2, y - 10, 16, open ? '#5fe07a' : '#e05a5a', 0.6);
      if (!open) { ctx.strokeStyle = '#3a4250'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 12, 0, U.TAU); ctx.stroke(); }
      return;
    }
    // porte classique
    const col = d.color || '#7a4a3a';
    box(ctx, x - 5, y - 5, w + 10, h + 5, '#2a1a24', null, 3);
    ctx.fillStyle = col; G.rr(ctx, x, y, w, h, 3); ctx.fill();
    ctx.strokeStyle = OL; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + 6, y + 8, w - 12, h * 0.35); ctx.fillRect(x + 6, y + h * 0.5, w - 12, h * 0.4);
    ctx.fillStyle = '#e9c35b'; ctx.beginPath(); ctx.arc(x + w - 9, y + h * 0.52, 3, 0, U.TAU); ctx.fill();
    if (d.sign) { ctx.fillStyle = '#1a1226'; G.rr(ctx, x - 8, y - 26, w + 16, 18, 4); ctx.fill(); G.text(ctx, d.sign, x + w / 2, y - 13, { size: 10, color: '#ffd1f2', align: 'center' }); }
  };
  P.sign = function (ctx, style, x, y, w, h, t, d, game) {
    if (style === 'note') {
      ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(-0.06);
      ctx.fillStyle = '#fff59a'; ctx.fillRect(-12, -12, 24, 24);
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; for (let i = 0; i < 4; i++) ctx.fillRect(-8, -6 + i * 5, 14 - (i % 2) * 4, 1.5);
      ctx.fillStyle = '#e05a5a'; ctx.beginPath(); ctx.arc(0, -12, 2.5, 0, U.TAU); ctx.fill();
      ctx.restore();
      return;
    }
    if (style === 'screen') {
      box(ctx, x, y + h - 30, w, 30, '#16121c', OL, 3);
      ctx.fillStyle = '#2a4a8a'; ctx.fillRect(x + 3, y + h - 27, w - 6, 24);
      return;
    }
    if (style === 'letter' || style === 'tape') {
      if (style === 'letter') { ctx.fillStyle = '#efe6cc'; ctx.save(); ctx.translate(x + w / 2, y + h - 8); ctx.rotate(0.1); ctx.fillRect(-10, -7, 20, 14); ctx.strokeStyle = '#b8a888'; ctx.strokeRect(-10, -7, 20, 14); ctx.restore(); }
      else { box(ctx, x + w / 2 - 12, y + h - 16, 24, 16, '#2a2a33', OL, 2); ctx.fillStyle = '#c8b890'; ctx.fillRect(x + w / 2 - 9, y + h - 13, 18, 6); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + w / 2 - 5, y + h - 5, 2.5, 0, U.TAU); ctx.arc(x + w / 2 + 5, y + h - 5, 2.5, 0, U.TAU); ctx.fill(); }
      G.glow(ctx, x + w / 2, y + h - 8, 20, '#fff2b0', 0.2 + 0.1 * Math.sin(t * 3));
      return;
    }
    if (style === 'stone') {
      box(ctx, x + 2, y + h - 40, w - 4, 40, '#5a5a6a', OL, 8);
      ctx.strokeStyle = 'rgba(157,255,122,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x + 10, y + h - 30); ctx.lineTo(x + w - 10, y + h - 30); ctx.moveTo(x + 10, y + h - 22); ctx.lineTo(x + w - 14, y + h - 22); ctx.stroke();
      return;
    }
    if (style === 'plaque') {
      box(ctx, x, y + h - 36, w, 28, '#6a5a3a', OL, 3);
      ctx.fillStyle = '#e9c35b'; ctx.fillRect(x + 4, y + h - 32, w - 8, 20);
      return;
    }
    // panneau en bois
    ctx.fillStyle = '#5a3a24'; ctx.fillRect(x + w / 2 - 2, y + h - 30, 4, 30);
    box(ctx, x - 6, y + h - 52, w + 12, 26, '#8a6040', OL, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 3; i++) ctx.fillRect(x, y + h - 46 + i * 6, w - 4 - (i % 2) * 6, 1.5);
  };
  P.lever = function (ctx, style, x, y, k, t, d, game) {
    if (style === 'valve') {
      const has = !d.need || (game && game.save.items[d.need]);
      box(ctx, x + 4, y + 18, 24, 14, '#4a4a58', OL, 3);
      ctx.fillStyle = '#6a6a78'; ctx.fillRect(x + 14, y + 6, 4, 14);
      if (has || k > 0) {
        ctx.save(); ctx.translate(x + 16, y + 8); ctx.rotate(k * Math.PI * 2 + t * 0);
        ctx.strokeStyle = '#d84a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 10, 0, U.TAU); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.moveTo(0, -10); ctx.lineTo(0, 10); ctx.stroke();
        ctx.restore();
      } else { ctx.fillStyle = '#2a2a33'; ctx.beginPath(); ctx.arc(x + 16, y + 8, 4, 0, U.TAU); ctx.fill(); }
      return;
    }
    if (style === 'totem') {
      box(ctx, x + 6, y - 22, 20, 54, '#6a5a4a', OL, 5);
      ctx.fillStyle = '#4a3a2a'; ctx.fillRect(x + 9, y - 12, 14, 3); ctx.fillRect(x + 9, y + 4, 14, 3);
      ctx.fillStyle = '#9dff7a'; ctx.beginPath(); ctx.arc(x + 12, y - 4, 2, 0, U.TAU); ctx.arc(x + 20, y - 4, 2, 0, U.TAU); ctx.fill();
      G.glow(ctx, x + 16, y - 4, 22, '#9dff7a', 0.35 + 0.15 * Math.sin(t * 3));
      ctx.strokeStyle = '#9dff7a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x + 16, y + 16, 5, 0, Math.PI); ctx.stroke();
      return;
    }
    if (style === 'winch') {
      box(ctx, x, y + 6, 32, 26, '#6a4a2e', OL, 4);
      ctx.save(); ctx.translate(x + 16, y + 16); ctx.rotate(k * Math.PI * 4);
      ctx.strokeStyle = '#c9a46a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 8, 0, U.TAU); ctx.stroke();
      ctx.fillStyle = '#3a2a1a'; ctx.fillRect(-2, -14, 4, 14);
      ctx.restore();
      return;
    }
    // levier
    box(ctx, x + 6, y + 22, 20, 10, '#4a4a58', OL, 3);
    const a = U.lerp(-0.7, 0.7, k);
    ctx.save(); ctx.translate(x + 16, y + 26); ctx.rotate(a);
    ctx.fillStyle = '#9a9aa8'; ctx.fillRect(-2, -22, 4, 22);
    ctx.fillStyle = k > 0.5 ? '#5fe07a' : '#e05a5a'; ctx.beginPath(); ctx.arc(0, -22, 5, 0, U.TAU); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.restore();
  };
  P.lamppost = function (ctx, x, y, w, h, glow, sym, t, flick) {
    const cx = x + w / 2;
    ctx.fillStyle = '#2a2a36'; ctx.fillRect(cx - 3, y + 16, 6, h - 16); ctx.fillRect(cx - 10, y + h - 8, 20, 8);
    ctx.fillStyle = '#3a3a48'; ctx.fillRect(cx - 8, y + h - 44, 16, 22);
    // symbole sur le socle
    const cols = { etoile: '#ffd14a', note: '#5fe0a0', lune: '#c9d8ff', coeur: '#ff5fae' };
    const c = cols[sym] || '#fff';
    G.symbol(ctx, sym, cx, y + h - 33, 14, glow > 0.5 ? c : U.gray(c, 0.7));
    // tête
    ctx.fillStyle = '#2a2a36'; ctx.beginPath(); ctx.moveTo(cx - 14, y + 16); ctx.lineTo(cx + 14, y + 16); ctx.lineTo(cx + 9, y); ctx.lineTo(cx - 9, y); ctx.fill();
    const lit = flick ? Math.random() < 0.5 : glow > 0.05;
    ctx.fillStyle = lit ? U.mix('#5a5a68', c, glow) : '#4a4a58';
    ctx.fillRect(cx - 9, y + 2, 18, 13);
    if (lit && glow > 0.05) { G.glow(ctx, cx, y + 8, 60 * glow + 10, c, 0.6 * glow); G.glow(ctx, cx, y + 8, 18, '#ffffff', 0.5 * glow); }
    ctx.fillStyle = '#2a2a36'; ctx.fillRect(cx - 2, y - 8, 4, 8);
  };
  P.gate = function (ctx, style, x, y, w, h, k, t) {
    if (k >= 0.99) return;
    if (style === 'roots') {
      ctx.save(); ctx.beginPath(); ctx.rect(x - 10, y, w + 20, h); ctx.clip();
      for (let i = 0; i < 6; i++) {
        const off = k * h;
        ctx.strokeStyle = i % 2 ? '#4a3222' : '#5a3a26'; ctx.lineWidth = 10 - (i % 3) * 2;
        ctx.beginPath(); ctx.moveTo(x + (i / 5) * w, y - 10 + off);
        ctx.bezierCurveTo(x + w * 0.2 + Math.sin(i) * 20, y + h * 0.3 + off, x + w * 0.8 - Math.cos(i) * 20, y + h * 0.6 + off, x + ((5 - i) / 5) * w, y + h + 10 + off); ctx.stroke();
      }
      ctx.fillStyle = '#5aa84a'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(x + 6 + i * 8, y + 20 + i * 18 + k * h, 5, 2.5, i, 0, U.TAU); ctx.fill(); }
      ctx.restore();
      return;
    }
    if (style === 'fog' || style === 'barrier') {
      const a = 1 - k;
      ctx.globalAlpha = a;
      const col = style === 'fog' ? 'rgba(180,175,195,' : 'rgba(190,160,255,';
      for (let i = 0; i < 8; i++) { ctx.fillStyle = col + (0.25 + 0.1 * Math.sin(t * 2 + i)) + ')'; ctx.beginPath(); ctx.ellipse(x + w / 2 + Math.sin(t + i) * 10, y + (i / 7) * h, w * 0.9, 24, 0, 0, U.TAU); ctx.fill(); }
      if (style === 'barrier') { ctx.strokeStyle = 'rgba(220,200,255,0.7)'; ctx.lineWidth = 1.5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(x + i * w / 3, y); for (let yy = y; yy < y + h; yy += 12) ctx.lineTo(x + i * w / 3 + (Math.random() - 0.5) * 8, yy); ctx.stroke(); } }
      ctx.globalAlpha = 1;
      return;
    }
    if (style === 'stone') {
      const off = k * h;
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      box(ctx, x, y - off, w, h, '#4d4678', OL, 2);
      ctx.strokeStyle = 'rgba(94,242,214,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2 - off, Math.min(w, h) * 0.25, 0, U.TAU); ctx.stroke();
      ctx.restore();
      return;
    }
    if (style === 'rocks') {
      ctx.globalAlpha = 1 - k;
      for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#5a5468' : '#4a4458'; ctx.beginPath(); ctx.ellipse(x + w / 2 + ((i * 37) % 20 - 10), y + h - 12 - i * (h / 7), w * 0.55, h / 7, 0, 0, U.TAU); ctx.fill(); }
      ctx.globalAlpha = 1;
      return;
    }
    // grille en fer
    const off = k * h;
    ctx.save(); ctx.beginPath(); ctx.rect(x - 6, y - 20, w + 12, h + 20); ctx.clip();
    ctx.strokeStyle = '#2a2a36'; ctx.lineWidth = 4;
    for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(x + (i / 4) * w, y - off); ctx.lineTo(x + (i / 4) * w, y + h - off); ctx.stroke(); }
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y + 12 - off); ctx.lineTo(x + w, y + 12 - off); ctx.moveTo(x, y + h - 14 - off); ctx.lineTo(x + w, y + h - 14 - off); ctx.stroke();
    ctx.fillStyle = '#2a2a36'; for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(x + (i / 4) * w - 4, y - off); ctx.lineTo(x + (i / 4) * w, y - 10 - off); ctx.lineTo(x + (i / 4) * w + 4, y - off); ctx.fill(); }
    ctx.restore();
  };
  P.spring = function (ctx, x, y, w, h, k, theme) {
    const sq = 1 - k * 0.4;
    const col = theme === 'grotte' ? '#6ae8ff' : theme === 'ruines' ? '#c38aff' : '#ff6a8a';
    ctx.fillStyle = '#e8dcc8'; ctx.fillRect(x + w / 2 - 4, y + h - 10, 8, 10);
    ctx.fillStyle = col; ctx.strokeStyle = OL; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(x + w / 2, y + h - 8 * sq, w / 2, 10 * sq, 0, Math.PI, U.TAU); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + w / 2 - 6, y + h - 12 * sq, 2.2, 0, U.TAU); ctx.arc(x + w / 2 + 5, y + h - 14 * sq, 1.6, 0, U.TAU); ctx.fill();
    G.glow(ctx, x + w / 2, y + h - 8, 24, col, 0.3);
  };
  P.crumble = function (ctx, x, y, theme, shaking) {
    const col = theme === 'ruines' ? '#5a4e8a' : theme === 'grotte' ? '#4a4466' : '#7a6a52';
    ctx.fillStyle = col; G.rr(ctx, x, y, T, 12, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x + 8, y); ctx.lineTo(x + 12, y + 12); ctx.moveTo(x + 22, y); ctx.lineTo(x + 19, y + 12); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(x, y, T, 2);
  };
  P.mover = function (ctx, x, y, w, theme, t) {
    const col = theme === 'final' ? '#4a4466' : theme === 'ruines' ? '#5a4e8a' : '#7a5a3e';
    ctx.fillStyle = col; G.rr(ctx, x, y, w, 12, 4); ctx.fill();
    ctx.strokeStyle = OL; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = 'rgba(94,242,214,0.7)'; ctx.fillRect(x + 6, y + 10, w - 12, 2);
    G.glow(ctx, x + w / 2, y + 12, 30, '#5ef2d6', 0.25);
  };
  P.crate = function (ctx, x, y, w, h, t) {
    box(ctx, x, y, w, 20, '#8a6a42', OL, 3);
    ctx.strokeStyle = '#5a4028'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 4, y + 4); ctx.lineTo(x + w - 4, y + 16); ctx.moveTo(x + w - 4, y + 4); ctx.lineTo(x + 4, y + 16); ctx.stroke();
    ctx.fillStyle = '#a8845a'; ctx.fillRect(x + 2, y + 1, w - 4, 2);
  };
  P.stone = function (ctx, x, y, t, theme) {
    ctx.fillStyle = '#6a6a74'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5;
    G.rr(ctx, x + 1, y + 1, T - 2, T - 1, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#5aa84a'; ctx.beginPath(); ctx.ellipse(x + 12, y + 4, 10, 4, 0, 0, U.TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(157,255,122,' + (0.4 + 0.3 * Math.sin(t * 2)) + ')'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(x + 10, y + 12); ctx.lineTo(x + 16, y + 24); ctx.lineTo(x + 22, y + 12); ctx.stroke();
  };
  P.checkpoint = function (ctx, style, x, y, w, h, lit, k, t) {
    if (style === 'brazier') {
      ctx.fillStyle = '#3a3040'; ctx.fillRect(x + 8, y + 22, 8, h - 22); ctx.fillRect(x + 2, y + h - 4, 20, 4);
      ctx.fillStyle = '#5a4a58'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x - 4, y + 10); ctx.lineTo(x + w + 4, y + 10); ctx.lineTo(x + w - 2, y + 24); ctx.lineTo(x + 2, y + 24); ctx.closePath(); ctx.fill(); ctx.stroke();
      if (lit) {
        const f = Math.sin(t * 18) * 1.5;
        ctx.fillStyle = '#ff7043'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 2 + f * 0.3, 10, 14 + f, 0, 0, U.TAU); ctx.fill();
        ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 5, 6, 9 + f * 0.5, 0, 0, U.TAU); ctx.fill();
        ctx.fillStyle = '#fff2b0'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + 8, 3, 5, 0, 0, U.TAU); ctx.fill();
        G.glow(ctx, x + w / 2, y + 4, 60, '#ff9a3a', 0.6);
      }
      return;
    }
    // balise d'Écho
    ctx.fillStyle = '#3a3448'; ctx.fillRect(x + w / 2 - 3, y + 14, 6, h - 14); ctx.fillRect(x + 2, y + h - 5, w - 4, 5);
    const col = '#ff7ad9';
    ctx.fillStyle = '#efe8f6'; ctx.strokeStyle = OL; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x + w / 2, y + 10, 9, 0, U.TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = U.mix('#554c66', col, k); ctx.beginPath(); ctx.arc(x + w / 2, y + 10, 4.5, 0, U.TAU); ctx.fill();
    G.glow(ctx, x + w / 2, y + 10, 30 * k + 6, col, 0.6 * k);
    if (k > 0.8) { ctx.strokeStyle = U.rgba(col, 0.5 * (1 - ((t * 0.8) % 1))); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x + w / 2, y + 10, 9 + ((t * 0.8) % 1) * 20, 0, U.TAU); ctx.stroke(); }
  };
  P.shrine = function (ctx, ability, x, y, w, h, taken, t, col) {
    // autel de pierre avec l'objet de la capacité
    box(ctx, x + 6, y + h - 24, w - 12, 24, '#5a5a6a', OL, 4);
    box(ctx, x + 14, y + h - 34, w - 28, 12, '#6a6a7a', OL, 3);
    ctx.strokeStyle = U.rgba(col, taken ? 0.3 : 0.8); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x + w / 2, y + h - 12, 6, 0, U.TAU); ctx.stroke();
    if (taken) return;
    const fy = y + h - 60 + Math.sin(t * 2) * 5;
    G.glow(ctx, x + w / 2, fy, 50, col, 0.6);
    ctx.save(); ctx.translate(x + w / 2, fy); ctx.rotate(Math.sin(t) * 0.2);
    if (ability === 'djump') {
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, -16); ctx.quadraticCurveTo(10, 0, 0, 16); ctx.quadraticCurveTo(-7, 0, 0, -16); ctx.fill();
      ctx.strokeStyle = '#cfe'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, 20); ctx.stroke();
    } else if (ability === 'dash') {
      const g = ctx.createLinearGradient(0, -16, 0, 16); g.addColorStop(0, '#fff'); g.addColorStop(1, col);
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(10, 0); ctx.lineTo(0, 18); ctx.lineTo(-10, 0); ctx.closePath(); ctx.fill();
    } else {
      ctx.strokeStyle = col; ctx.lineWidth = 2.5;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, 6 + i * 6 + ((t * 10) % 6), 0, U.TAU); ctx.stroke(); }
    }
    ctx.restore();
  };
  P.resonator = function (ctx, x, y, w, h, col, k, t) {
    box(ctx, x + 3, y + h - 10, w - 6, 10, '#3a3460', OL, 2);
    const s = 1 + k * 0.15;
    ctx.save(); ctx.translate(x + w / 2, y + h - 10); ctx.scale(s, s);
    const g = ctx.createLinearGradient(0, -30, 0, 0); g.addColorStop(0, '#fff'); g.addColorStop(0.4, col); g.addColorStop(1, U.shade(col, -0.5));
    ctx.fillStyle = g; ctx.strokeStyle = OL; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-5, -26); ctx.lineTo(0, -32); ctx.lineTo(5, -26); ctx.lineTo(8, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    G.glow(ctx, x + w / 2, y + h - 24, 30 + k * 40, col, 0.4 + k * 0.5);
  };
  P.diapason = function (ctx, x, y, w, h, k, t, done) {
    const col = done ? '#5ef2d6' : '#c38aff';
    box(ctx, x + 8, y + h - 20, w - 16, 20, '#3a3460', OL, 4);
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, col); g.addColorStop(1, U.shade(col, -0.5));
    ctx.fillStyle = g; ctx.strokeStyle = OL; ctx.lineWidth = 1.5;
    const s = 1 + k * 0.06;
    ctx.save(); ctx.translate(x + w / 2, y + h - 20); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(-20, -70); ctx.lineTo(-10, -100); ctx.lineTo(-4, -70); ctx.lineTo(0, -106); ctx.lineTo(4, -70); ctx.lineTo(10, -100); ctx.lineTo(20, -70); ctx.lineTo(26, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    G.glow(ctx, x + w / 2, y + h - 70, 80 + k * 60, col, 0.35 + k * 0.4);
  };
  P.fogwall = function (ctx, dir, pos, cam, t) {
    // mur de brume/statique qui poursuit Laura
    ctx.save();
    if (dir === 'right') {
      const x = pos;
      const g = ctx.createLinearGradient(x - 400, 0, x + 60, 0);
      g.addColorStop(0, 'rgba(30,24,44,1)'); g.addColorStop(0.75, 'rgba(90,84,110,0.95)'); g.addColorStop(1, 'rgba(170,165,190,0)');
      ctx.fillStyle = g; ctx.fillRect(cam.x - 50, cam.y - 50, Math.max(0, x + 60 - cam.x + 50), HOL.VIEW_H + 100);
      for (let i = 0; i < 10; i++) {
        const yy = cam.y + (i / 9) * HOL.VIEW_H;
        ctx.fillStyle = 'rgba(160,155,180,0.35)';
        ctx.beginPath(); ctx.ellipse(x + Math.sin(t * 2 + i) * 20, yy, 50 + Math.sin(t * 3 + i * 2) * 15, 40, 0, 0, U.TAU); ctx.fill();
      }
      for (let i = 0; i < 4; i++) { const yy = cam.y + ((i * 97 + t * 60) % HOL.VIEW_H); ctx.fillStyle = 'rgba(240,236,255,0.9)'; ctx.fillRect(x - 60 - i * 40, yy, 3, 2); }
    } else {
      const y = pos;
      const g = ctx.createLinearGradient(0, y + 400, 0, y - 60);
      g.addColorStop(0, 'rgba(30,24,44,1)'); g.addColorStop(0.75, 'rgba(90,84,110,0.95)'); g.addColorStop(1, 'rgba(170,165,190,0)');
      ctx.fillStyle = g; ctx.fillRect(cam.x - 50, y - 60, HOL.VIEW_W + 100, Math.max(0, cam.y + HOL.VIEW_H + 50 - (y - 60)));
      for (let i = 0; i < 12; i++) {
        const xx = cam.x + (i / 11) * HOL.VIEW_W;
        ctx.fillStyle = 'rgba(160,155,180,0.35)';
        ctx.beginPath(); ctx.ellipse(xx, y + Math.sin(t * 2 + i) * 16, 50, 40 + Math.sin(t * 3 + i) * 12, 0, 0, U.TAU); ctx.fill();
      }
      // yeux dans la brume
      for (let i = 0; i < 3; i++) { const xx = cam.x + 200 + i * 260 + Math.sin(t + i) * 30, yy = y + 80 + Math.sin(t * 0.7 + i) * 20; ctx.fillStyle = '#f2ecff'; ctx.beginPath(); ctx.ellipse(xx, yy, 6, 2.5, 0, 0, U.TAU); ctx.ellipse(xx + 22, yy, 6, 2.5, 0, 0, U.TAU); ctx.fill(); }
    }
    ctx.restore();
  };
  P.ferry = function (ctx, x, y, w, t) {
    ctx.fillStyle = '#6a4a2e'; ctx.strokeStyle = OL; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x - 6, y); ctx.lineTo(x + w + 6, y); ctx.lineTo(x + w - 8, y + 22); ctx.lineTo(x + 8, y + 22); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#8a6a42'; ctx.fillRect(x - 4, y, w + 8, 4);
    ctx.fillStyle = '#5a3a24'; ctx.fillRect(x + 10, y - 40, 4, 40); ctx.fillRect(x + w - 14, y - 40, 4, 40);
    ctx.strokeStyle = '#c9a46a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 12, y - 38); ctx.lineTo(x + w - 12, y - 38); ctx.stroke();
    ctx.fillStyle = '#29b6f6'; ctx.beginPath(); ctx.moveTo(x + w - 12, y - 40); ctx.lineTo(x + w - 12, y - 60); ctx.lineTo(x + w + 6, y - 50); ctx.fill();
  };
  P.item = function (ctx, item, x, y, t) {
    ctx.save(); ctx.translate(x, y);
    ctx.strokeStyle = OL; ctx.lineWidth = 1.3;
    switch (item) {
      case 'fusible':
        ctx.fillStyle = '#e8e0d0'; G.rr(ctx, -5, -10, 10, 20, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#c9a46a'; ctx.fillRect(-5, -10, 10, 4); ctx.fillRect(-5, 6, 10, 4);
        ctx.fillStyle = '#ff5a5a'; ctx.fillRect(-1, -4, 2, 8);
        break;
      case 'manivelle':
        ctx.strokeStyle = '#d84a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 9, 0, U.TAU); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.moveTo(0, -9); ctx.lineTo(0, 9); ctx.stroke();
        break;
      case 'cassette':
        ctx.fillStyle = '#2a2a33'; G.rr(ctx, -12, -8, 24, 16, 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#3fd6b5'; ctx.fillRect(-9, -5, 18, 5);
        ctx.fillStyle = '#eee'; ctx.beginPath(); ctx.arc(-5, 3, 2.5, 0, U.TAU); ctx.arc(5, 3, 2.5, 0, U.TAU); ctx.fill();
        break;
      case 'piment':
        ctx.fillStyle = '#e8322a'; ctx.beginPath(); ctx.moveTo(-3, -8); ctx.quadraticCurveTo(8, -4, 4, 10); ctx.quadraticCurveTo(-6, 2, -3, -8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#4a8a3a'; ctx.fillRect(-4, -11, 4, 4);
        break;
      case 'menthe':
        ctx.fillStyle = '#5ad07a';
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(-4 + i * 4, -2 + (i % 2) * 4, 4, 7, -0.5 + i * 0.5, 0, U.TAU); ctx.fill(); ctx.stroke(); }
        break;
      case 'sel':
        ctx.fillStyle = '#e8f4ff'; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(7, -2); ctx.lineTo(4, 9); ctx.lineTo(-4, 9); ctx.lineTo(-7, -2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#b8d8ff'; ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(2, 0); ctx.lineTo(-2, 0); ctx.fill();
        break;
      case 'toolbox':
        ctx.fillStyle = '#d84a3a'; G.rr(ctx, -12, -6, 24, 14, 2); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-5, -6); ctx.lineTo(-5, -10); ctx.lineTo(5, -10); ctx.lineTo(5, -6); ctx.stroke();
        break;
      default:
        ctx.fillStyle = '#ffd28a'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, U.TAU); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  };
})();
