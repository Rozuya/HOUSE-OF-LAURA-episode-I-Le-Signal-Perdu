/* House of Laura · utilitaires communs (maths, aléatoire, couleurs) */
(function () {
  'use strict';
  const G = (typeof window !== 'undefined') ? window : globalThis;
  const HOL = G.HOL = G.HOL || {};
  HOL.T = 32;            // taille d'une tuile (px logiques)
  HOL.VIEW_W = 960;      // résolution logique
  HOL.VIEW_H = 540;
  HOL.DEBUG = false;
  // version affichee dans les menus (source unique de verite).
  // ATTENTION : c'etait `'1.1.0';` sans affectation, donc HOL.VERSION restait
  // undefined -> le titre affichait « v1.0.2 » et les options « Version ? ».
  HOL.VERSION = '1.2.0';
  // Sélecteur de salle (build de TEST uniquement). On le laisse a false dans la
  // version finale : c'est un outil de verification, pas une feature du jeu.
  HOL.ROOM_PICKER = false;

  const U = HOL.U = {};
  U.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.invLerp = (a, b, v) => (b === a ? 0 : (v - a) / (b - a));
  U.smooth = (t) => { t = U.clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  U.approach = (v, t, d) => (v < t ? Math.min(v + d, t) : Math.max(v - d, t));
  U.damp = (a, b, lambda, dt) => U.lerp(a, b, 1 - Math.exp(-lambda * dt));
  U.sign = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);
  U.rand = (a = 0, b = 1) => a + Math.random() * (b - a);
  U.randi = (a, b) => Math.floor(U.rand(a, b + 1));
  U.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  U.dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
  U.TAU = Math.PI * 2;

  // Générateur pseudo-aléatoire déterministe (mulberry32)
  U.rng = function (seed) {
    let s = (seed >>> 0) || 1;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  U.hash = function (x, y, s) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s | 0) + 1, 982451653)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  U.strHash = function (str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  U.noise1 = function (x, seed) {
    const i = Math.floor(x), f = x - i;
    return U.lerp(U.hash(i, 0, seed), U.hash(i + 1, 0, seed), U.smooth(f));
  };
  U.noise2 = function (x, y, seed) {
    const ix = Math.floor(x), iy = Math.floor(y), fx = U.smooth(x - ix), fy = U.smooth(y - iy);
    const a = U.hash(ix, iy, seed), b = U.hash(ix + 1, iy, seed);
    const c = U.hash(ix, iy + 1, seed), d = U.hash(ix + 1, iy + 1, seed);
    return U.lerp(U.lerp(a, b, fx), U.lerp(c, d, fx), fy);
  };
  U.fbm1 = function (x, oct, seed) {
    let v = 0, a = 0.5, f = 1, n = 0;
    for (let i = 0; i < oct; i++) { v += a * U.noise1(x * f, seed + i * 17); n += a; a *= 0.5; f *= 2; }
    return v / n;
  };

  U.ease = {
    inQuad: (t) => t * t,
    outQuad: (t) => 1 - (1 - t) * (1 - t),
    inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inCubic: (t) => t * t * t,
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outBack: (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    outElastic: (t) => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1)
  };

  // ---------- Couleurs ----------
  const hexCache = new Map();
  U.hex = function (h) {
    let c = hexCache.get(h);
    if (c) return c;
    let s = h.replace('#', '');
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    c = [parseInt(s.substr(0, 2), 16), parseInt(s.substr(2, 2), 16), parseInt(s.substr(4, 2), 16)];
    hexCache.set(h, c);
    return c;
  };
  U.toHex = function (r, g, b) {
    const f = (v) => { v = Math.round(U.clamp(v, 0, 255)).toString(16); return v.length < 2 ? '0' + v : v; };
    return '#' + f(r) + f(g) + f(b);
  };
  U.rgba = function (h, a) {
    const c = U.hex(h);
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (a === undefined ? 1 : a) + ')';
  };
  U.mix = function (h1, h2, t) {
    const a = U.hex(h1), b = U.hex(h2);
    return U.toHex(U.lerp(a[0], b[0], t), U.lerp(a[1], b[1], t), U.lerp(a[2], b[2], t));
  };
  U.shade = function (h, amt) {
    return amt >= 0 ? U.mix(h, '#ffffff', amt) : U.mix(h, '#000000', -amt);
  };
  // désature une couleur (t = 0 : couleur d'origine, 1 : gris)
  const grayCache = new Map();
  U.gray = function (h, t) {
    if (!t || t <= 0) return h;
    const key = h + '|' + Math.round(t * 20);
    let r = grayCache.get(key);
    if (r) return r;
    const c = U.hex(h);
    const l = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11;
    const tq = Math.round(t * 20) / 20;
    r = U.toHex(U.lerp(c[0], l * 0.95 + 8, tq), U.lerp(c[1], l * 0.95 + 8, tq), U.lerp(c[2], l * 0.95 + 12, tq));
    grayCache.set(key, r);
    return r;
  };

  U.overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  U.fmtTime = function (sec) {
    sec = Math.floor(sec);
    const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    const p = (v) => (v < 10 ? '0' + v : '' + v);
    return (h > 0 ? h + ':' + p(m) : m) + ':' + p(s);
  };

  // Découpe un texte en lignes selon une largeur (ctx requis)
  U.wrap = function (ctx, text, maxW) {
    const out = [];
    const paras = String(text).split('\n');
    for (const para of paras) {
      const words = para.split(' ');
      let line = '';
      for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width > maxW && line) { out.push(line); line = w; } else line = test;
      }
      out.push(line);
    }
    return out;
  };
})();
