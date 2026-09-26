/* House of Laura · aides de dessin (formes, lueurs, texte, invites de touches) */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U;
  HOL.FONT = '"Trebuchet MS", "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  HOL.FONT_TITLE = '"Segoe UI Black", "Arial Black", "Trebuchet MS", sans-serif';

  const G = HOL.G = {};

  G.canvas = function (w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h));
    return c;
  };

  G.rr = function (ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // sprites de lueur mis en cache (dégradé radial) -> drawImage rapide
  const glowCache = new Map();
  G.glowSprite = function (color, soft) {
    const key = color + (soft ? 's' : '');
    let c = glowCache.get(key);
    if (c) return c;
    c = G.canvas(128, 128);
    const x = c.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    const col = U.hex(color);
    const rgb = col[0] + ',' + col[1] + ',' + col[2];
    if (soft) {
      g.addColorStop(0, 'rgba(' + rgb + ',0.55)'); g.addColorStop(0.35, 'rgba(' + rgb + ',0.25)'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    } else {
      g.addColorStop(0, 'rgba(' + rgb + ',1)'); g.addColorStop(0.2, 'rgba(' + rgb + ',0.6)'); g.addColorStop(0.5, 'rgba(' + rgb + ',0.18)'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    }
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    glowCache.set(key, c);
    return c;
  };
  // découpe de lumière dans l'obscurité (centre plein, bords doux)
  let lightSpr = null;
  G.lightSprite = function () {
    if (lightSpr) return lightSpr;
    lightSpr = G.canvas(128, 128);
    const x = lightSpr.getContext('2d');
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.92)');
    g.addColorStop(0.7, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return lightSpr;
  };
  G.glow = function (ctx, x, y, r, color, alpha, soft) {
    if (alpha <= 0 || r <= 0) return;
    const s = G.glowSprite(color, soft);
    const pa = ctx.globalAlpha, pc = ctx.globalCompositeOperation;
    ctx.globalAlpha = pa * U.clamp(alpha, 0, 1);
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(s, x - r, y - r, r * 2, r * 2);
    ctx.globalAlpha = pa; ctx.globalCompositeOperation = pc;
  };

  G.text = function (ctx, str, x, y, o) {
    o = o || {};
    ctx.font = (o.weight || 'bold') + ' ' + (o.size || 16) + 'px ' + (o.font || HOL.FONT);
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = o.base || 'alphabetic';
    if (o.shadow) {
      ctx.fillStyle = o.shadow;
      ctx.fillText(str, x + (o.sdx === undefined ? 1.5 : o.sdx), y + (o.sdy === undefined ? 2 : o.sdy));
    }
    if (o.outline) {
      ctx.lineJoin = 'round';
      ctx.strokeStyle = o.outline; ctx.lineWidth = o.ow || 3;
      ctx.strokeText(str, x, y);
    }
    ctx.fillStyle = o.color || '#fff';
    ctx.fillText(str, x, y);
    return ctx.measureText(str).width;
  };

  // ---- symboles ----
  G.star = function (ctx, x, y, r1, r2, n, rot) {
    n = n || 5; rot = rot || -Math.PI / 2;
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 === 0 ? r1 : r2, a = rot + (i * Math.PI) / n;
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };
  G.heart = function (ctx, x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(x, y, x - s * 0.5, y - s * 0.1, x - s * 0.5, y + s * 0.3);
    ctx.bezierCurveTo(x - s * 0.5, y + s * 0.6, x - s * 0.1, y + s * 0.75, x, y + s);
    ctx.bezierCurveTo(x + s * 0.1, y + s * 0.75, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
    ctx.bezierCurveTo(x + s * 0.5, y - s * 0.1, x, y, x, y + s * 0.35);
    ctx.closePath();
  };
  G.moon = function (ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI * 0.35, Math.PI * 1.65, false);
    ctx.arc(x + r * 0.45, y - r * 0.05, r * 0.78, Math.PI * 1.55, Math.PI * 0.45, true);
    ctx.closePath();
  };
  G.note = function (ctx, x, y, s, color) {
    ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = s * 0.14;
    ctx.beginPath(); ctx.ellipse(x - s * 0.2, y + s * 0.3, s * 0.22, s * 0.16, -0.4, 0, U.TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + s * 0.3, y + s * 0.2, s * 0.22, s * 0.16, -0.4, 0, U.TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - s * 0.02, y + s * 0.28); ctx.lineTo(x - s * 0.02, y - s * 0.4); ctx.lineTo(x + s * 0.5, y - s * 0.5); ctx.lineTo(x + s * 0.5, y + s * 0.18); ctx.stroke();
  };
  G.symbol = function (ctx, sym, x, y, s, color) {
    ctx.fillStyle = color;
    if (sym === 'etoile') { G.star(ctx, x, y, s * 0.5, s * 0.22, 5); ctx.fill(); }
    else if (sym === 'coeur') { G.heart(ctx, x, y - s * 0.45, s * 0.9); ctx.fill(); }
    else if (sym === 'lune') { G.moon(ctx, x, y, s * 0.45); ctx.fill(); }
    else if (sym === 'note') { G.note(ctx, x, y, s * 0.8, color); }
  };

  // ---- invites (touche / bouton) ----
  // dessine une touche ou un bouton de manette ; renvoie la largeur utilisée
  G.keycap = function (ctx, x, y, pr, size) {
    size = size || 18;
    ctx.save();
    ctx.font = 'bold ' + Math.round(size * 0.62) + 'px ' + HOL.FONT;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let w;
    if (pr.kind === 'pad') {
      const round = pr.label.length <= 1 || ['✕', '○', '□', '△'].indexOf(pr.label) >= 0;
      w = round ? size : Math.max(size * 1.4, ctx.measureText(pr.label).width + 10);
      ctx.fillStyle = 'rgba(10,6,20,0.85)';
      if (round) { ctx.beginPath(); ctx.arc(x + w / 2, y, size / 2, 0, U.TAU); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = pr.color; ctx.stroke(); }
      else { G.rr(ctx, x, y - size / 2, w, size, size / 2); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = pr.color; ctx.stroke(); }
      ctx.fillStyle = pr.color;
      ctx.fillText(pr.label, x + w / 2, y + 0.5);
    } else {
      w = Math.max(size, ctx.measureText(pr.label).width + 10);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      G.rr(ctx, x, y - size / 2 + 2, w, size, 4); ctx.fill();
      ctx.fillStyle = '#f4ecff';
      G.rr(ctx, x, y - size / 2, w, size - 2, 4); ctx.fill();
      ctx.fillStyle = '#2a1838';
      ctx.fillText(pr.label, x + w / 2, y - 0.5);
    }
    ctx.restore();
    return w;
  };
  // "[E] Parler" avec la touche du périphérique actif
  G.prompt = function (ctx, x, y, action, label, o) {
    o = o || {};
    const pr = HOL.Input.prompt(action);
    ctx.save();
    ctx.font = 'bold ' + (o.size || 14) + 'px ' + HOL.FONT;
    const lw = label ? ctx.measureText(label).width : 0;
    // mesure de la touche
    ctx.font = 'bold ' + Math.round(18 * 0.62) + 'px ' + HOL.FONT;
    const kLabelW = ctx.measureText(pr.label).width;
    const kW = pr.kind === 'pad' ? (pr.label.length <= 1 ? 18 : Math.max(25, kLabelW + 10)) : Math.max(18, kLabelW + 10);
    const alt = HOL.Input.mouseAlt(action);
    let altW = 0;
    if (alt && o.showAlt) { ctx.font = 'bold 11px ' + HOL.FONT; altW = ctx.measureText('/ ' + alt).width + 6; }
    const total = kW + (label ? 6 + lw : 0) + altW;
    let sx = x;
    if (o.align === 'center') sx = x - total / 2;
    else if (o.align === 'right') sx = x - total;
    if (o.bg) {
      ctx.fillStyle = o.bg;
      G.rr(ctx, sx - 8, y - 14, total + 16, 28, 14); ctx.fill();
    }
    const w = G.keycap(ctx, sx, y, pr, 18);
    let cx = sx + w;
    if (altW) { G.text(ctx, '/ ' + alt, cx + 4, y + 4, { size: 11, color: '#e9dcff' }); cx += altW; }
    if (label) G.text(ctx, label, cx + 6, y + 5, { size: o.size || 14, color: o.color || '#fff', shadow: 'rgba(0,0,0,0.6)' });
    ctx.restore();
    return total;
  };

  // vignette + grain appliqués à l'écran
  let vignetteC = null;
  G.vignette = function (ctx, strength, color) {
    if (!vignetteC) {
      vignetteC = G.canvas(480, 270);
      const x = vignetteC.getContext('2d');
      const g = x.createRadialGradient(240, 135, 60, 240, 135, 290);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.6, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,1)');
      x.fillStyle = g; x.fillRect(0, 0, 480, 270);
    }
    ctx.save();
    ctx.globalAlpha = strength;
    ctx.drawImage(vignetteC, 0, 0, HOL.VIEW_W, HOL.VIEW_H);
    ctx.restore();
  };

  // effet "neige" de télé (statique)
  let staticC = null, staticT = 0;
  G.staticNoise = function (ctx, x, y, w, h, alpha, t) {
    if (!staticC) { staticC = G.canvas(128, 72); }
    if (t - staticT > 0.05) {
      staticT = t;
      const sx = staticC.getContext('2d');
      const img = sx.createImageData(128, 72);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v * 1.05; img.data[i + 3] = 255;
      }
      sx.putImageData(img, 0, 0);
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(staticC, x, y, w, h);
    ctx.restore();
  };
})();
