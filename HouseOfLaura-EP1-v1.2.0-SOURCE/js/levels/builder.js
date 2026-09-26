/* House of Laura · constructeur de cartes (coordonnées en tuiles) */
(function () {
  'use strict';
  const G0 = (typeof window !== 'undefined') ? window : globalThis;
  const HOL = G0.HOL;
  HOL.ROOMS = HOL.ROOMS || {};

  HOL.MB = function (w, h) {
    const g = [];
    for (let y = 0; y < h; y++) g.push(new Array(w).fill('.'));
    const inb = (x, y) => x >= 0 && y >= 0 && x < w && y < h;
    const api = {
      w, h,
      set(x, y, c) { if (inb(x, y)) g[y][x] = c; return api; },
      get(x, y) { return inb(x, y) ? g[y][x] : '#'; },
      rect(x, y, rw, rh, c) { c = c || '#'; for (let j = y; j < y + rh; j++) for (let i = x; i < x + rw; i++) api.set(i, j, c); return api; },
      clear(x, y, rw, rh) { return api.rect(x, y, rw, rh, '.'); },
      hl(x, y, len, c) { return api.rect(x, y, len, 1, c || '='); },
      vl(x, y, len, c) { return api.rect(x, y, 1, len, c || '|'); },
      // sol plein à partir de la rangée y (jusqu'en bas), entre x0 et x1 inclus
      ground(y, x0, x1) { x0 = x0 === undefined ? 0 : x0; x1 = x1 === undefined ? w - 1 : x1; return api.rect(x0, y, x1 - x0 + 1, h - y); },
      rows() { return g.map((r) => r.join('')); }
    };
    return api;
  };

  HOL.defRoom = function (id, def) {
    def.id = id;
    HOL.ROOMS[id] = def;
    return def;
  };
})();
