/* House of Laura · salle : carte de tuiles, collisions, rendu (cache par blocs), eau, plateformes cachées */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U, G = HOL.G, T = HOL.T;
  const VW = HOL.VIEW_W, VH = HOL.VIEW_H;
  const CH = 16; // tuiles par bloc de cache
  HOL.ROOMS = HOL.ROOMS || {};

  // Légende des tuiles
  //  .  vide        #  solide        =  plateforme traversable   |  échelle
  //  ^  piques      ~  eau profonde  B  mur fissuré (Élan)       H  plateforme cachée (Onde)
  //  *  cristal     x  plateforme friable   o  champignon rebond   P  départ
  //  F  meuble solide (collision sans dessin : le décor dessine l'objet)

  class Room {
    constructor(id, game) {
      const def = HOL.ROOMS[id];
      if (!def) throw new Error('Salle inconnue : ' + id);
      this.id = id; this.def = def; this.game = game;
      this.zone = def.zone; this.name = def.name || id;
      this.theme = HOL.Themes[def.theme] || HOL.Themes.quartier;
      this.exits = def.exits || {};
      this.dark = def.dark || 0;
      this.indoorWalk = !!def.indoor;
      this.music = def.music;
      this.persist = game.save.roomState(id);
      this.state = this.persist; // alias (power, etc.)
      if (def.initState) for (const k in def.initState) if (this.state[k] === undefined) this.state[k] = def.initState[k];
      this.ledY = def.ledY;
      this.parse(def.map);
      this.entities = [];
      this.deco = [];
      this.dynSolids = [];
      this.reveal = new Map();
      this.chunks = new Map();
      this.layers = null;
      this.time = 0;
      this.spawns = Object.assign({}, def.spawns || {});
      this.buildEntities();
      const rng = U.rng(U.strHash(id));
      if (this.theme.decorate && !def.noAutoDecor) this.theme.decorate(this, rng);
      this.computeDepth();
      this.collectWater();
    }

    parse(rows) {
      this.h = rows.length;
      this.w = 0;
      for (const r of rows) this.w = Math.max(this.w, r.length);
      this.tiles = new Array(this.w * this.h);
      this.marks = [];
      const broken = this.persist.broken || [];
      for (let y = 0; y < this.h; y++) {
        const r = rows[y];
        for (let x = 0; x < this.w; x++) {
          let c = r[x] || '.';
          if (c === ' ') c = '.';
          if ('*xoPSKLMN'.indexOf(c) >= 0) { this.marks.push({ c, x, y }); c = '.'; }
          if (c === 'B' && broken.indexOf(y * this.w + x) >= 0) c = '.';
          this.tiles[y * this.w + x] = c;
        }
      }
      this.pw = this.w * T; this.ph = this.h * T;
    }

    tile(tx, ty) {
      if (tx < 0) return this.exits.left ? '.' : '#';
      if (tx >= this.w) return this.exits.right ? '.' : '#';
      if (ty < 0) return this.exits.top ? '.' : (this.def.openTop ? '.' : '#');
      if (ty >= this.h) return '.';
      return this.tiles[ty * this.w + tx];
    }
    setTile(tx, ty, c) {
      if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) return;
      this.tiles[ty * this.w + tx] = c;
      this.invalidate(tx, ty);
    }
    invalidate(tx, ty) {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const cx = Math.floor((tx + dx) / CH), cy = Math.floor((ty + dy) / CH);
        this.chunks.delete(cx + ',' + cy);
      }
    }

    // --------- requêtes physiques ---------
    solidAt(tx, ty) {
      const c = this.tile(tx, ty);
      if (c === '#' || c === 'B' || c === 'F') return true;
      if (c === 'H') return (this.reveal.get(ty * this.w + tx) || 0) > 0;
      return false;
    }
    oneWayAt(tx, ty) {
      const c = this.tile(tx, ty);
      if (c === '=') return true;
      if (c === '|' && this.tile(tx, ty - 1) !== '|' && !this.solidAt(tx, ty - 1)) return true;
      return false;
    }
    ladderAt(tx, ty) { return this.tile(tx, ty) === '|'; }
    surfaceAt(tx, ty) {
      const c = this.tile(tx, ty);
      if (c === '=' || c === '|') return this.theme.name === 'quartier' || this.theme.name === 'final' ? 'metal' : 'wood';
      return this.theme.surface;
    }
    breakAt(tx, ty) {
      if (this.tile(tx, ty) !== 'B') return false;
      this.setTile(tx, ty, '.');
      (this.persist.broken = this.persist.broken || []).push(ty * this.w + tx);
      const g = this.game;
      g.particles.burst(tx * T + 16, ty * T + 16, 18, { speed: [80, 260], life: [0.5, 1], size: [3, 6], color: ['#5a5070', '#3a3450', '#8a80a8'], kind: 'shard', grav: 900, vr: [-8, 8] });
      g.particles.burst(tx * T + 16, ty * T + 16, 8, { speed: [20, 60], life: [0.8, 1.4], size: [10, 18], color: 'rgba(200,190,220,0.25)', kind: 'smoke' });
      HOL.Audio.sfx('break');
      g.shake(6, 0.25);
      HOL.Input.rumble(0.6, 0.4, 180);
      return true;
    }
    canDrop(b) {
      const ty = Math.floor((b.y + b.h + 1) / T);
      const l = Math.floor(b.x / T), r = Math.floor((b.x + b.w - 0.01) / T);
      let ow = false;
      for (let tx = l; tx <= r; tx++) {
        if (this.solidAt(tx, ty)) return false;
        if (this.oneWayAt(tx, ty)) ow = true;
      }
      if (!ow && b.groundEnt && b.groundEnt.oneWay) ow = true;
      return ow;
    }
    waterAt(x, y) {
      const tx = Math.floor(x / T), ty = Math.floor(y / T);
      if (this.tile(tx, ty) === '~') {
        let sy = ty;
        while (sy > 0 && this.tile(tx, sy - 1) === '~') sy--;
        return { surface: sy * T + 6 };
      }
      for (const w of this.waters) if (x >= w.x && x < w.x + w.w && y >= w.surf && y < w.y + w.h) return { surface: w.surf };
      return null;
    }
    hazardAt(b) {
      const inset = 5;
      const l = Math.floor((b.x + inset) / T), r = Math.floor((b.x + b.w - inset) / T);
      const t = Math.floor((b.y + inset + 8) / T), bt = Math.floor((b.y + b.h - 2) / T);
      for (let ty = t; ty <= bt; ty++) for (let tx = l; tx <= r; tx++) {
        if (this.tile(tx, ty) === '^') {
          // les piques occupent la moitié basse de la tuile
          if (b.y + b.h - 2 > ty * T + 14) return true;
        }
      }
      return false;
    }
    nearWater(tx, ty) {
      for (let dx = -3; dx <= 3; dx++) if (this.tile(tx + dx, ty) === '~' || this.tile(tx + dx, ty - 1) === '~') return true;
      return false;
    }
    noDecor(tx, ty) {
      // `noDecorPad` permet a une entite de reserver une zone plus large que
      // sa seule emprise (la dalle ne fait que 32x8 px, l'herbe deborde).
      for (const e of this.entities) {
        if (!e.noDecor) continue;
        const px = e.noDecorPad || 8;
        if (tx * T + 16 > e.x - px && tx * T + 16 < e.x + e.w + px && ty * T + 16 > e.y - 40 && ty * T < e.y + e.h + 8) return true;
      }
      return false;
    }

    // --------- plateformes cachées ---------
    pulseReveal(px, py, radius, dur) {
      const t0x = Math.floor((px - radius) / T), t1x = Math.floor((px + radius) / T);
      const t0y = Math.floor((py - radius) / T), t1y = Math.floor((py + radius) / T);
      const pb = this.game.player.body;
      let n = 0;
      for (let ty = t0y; ty <= t1y; ty++) for (let tx = t0x; tx <= t1x; tx++) {
        if (this.tile(tx, ty) !== 'H') continue;
        const cx = tx * T + 16, cy = ty * T + 16;
        if (U.dist(px, py, cx, cy) > radius) continue;
        const inside = pb.x < tx * T + T && pb.x + pb.w > tx * T && pb.y < ty * T + T && pb.y + pb.h > ty * T;
        if (inside) continue;
        this.reveal.set(ty * this.w + tx, dur);
        n++;
      }
      return n;
    }

    // --------- construction ---------
    buildEntities() {
      const def = this.def;
      for (const m of this.marks) {
        if (m.c === 'P') { if (!this.spawns.default) this.spawns.default = [m.x, m.y]; continue; }
        if (m.c === '*') this.add({ type: 'crystal', x: m.x, y: m.y, id: this.id + ':' + m.x + ':' + m.y });
        else if (m.c === 'x') this.add({ type: 'crumble', x: m.x, y: m.y });
        else if (m.c === 'o') this.add({ type: 'spring', x: m.x, y: m.y });
      }
      for (const d of (def.entities || [])) {
        if (d.if && !this.game.story.cond(d.if)) continue;
        if (d.ifnot && this.game.story.cond(d.ifnot)) continue;
        this.add(d);
      }
    }
    add(d) {
      const e = HOL.E.create(this, d);
      if (e) this.entities.push(e);
      return e;
    }
    find(id) { return this.entities.find((e) => e.id === id || (e.d && e.d.id === id)); }
    findAll(type) { return this.entities.filter((e) => e.type === type); }

    computeDepth() {
      const W = this.w, H = this.h;
      const d = new Uint8Array(W * H).fill(9);
      const q = [];
      const isS = (x, y) => { const c = this.tile(x, y); return c === '#' || c === 'B'; };
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (!isS(x, y)) continue;
        if (!isS(x - 1, y) || !isS(x + 1, y) || !isS(x, y - 1) || !isS(x, y + 1)) { d[y * W + x] = 0; q.push(y * W + x); }
      }
      while (q.length) {
        const i = q.shift(), x = i % W, y = (i / W) | 0, v = d[i];
        if (v >= 4) continue;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          const j = ny * W + nx;
          if (isS(nx, ny) && d[j] > v + 1) { d[j] = v + 1; q.push(j); }
        }
      }
      this.depth = d;
    }
    collectWater() {
      this.waters = [];
      this.waterTiles = [];
      for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.tiles[y * this.w + x] === '~') this.waterTiles.push(x, y);
    }

    // --------- boucle ---------
    update(dt, game) {
      this.time += dt;
      // plateformes révélées
      for (const [k, v] of this.reveal) {
        const nv = v - dt;
        if (nv <= 0) {
          this.reveal.delete(k);
          const tx = k % this.w, ty = (k / this.w) | 0;
          game.particles.burst(tx * T + 16, ty * T + 16, 5, { speed: [10, 40], life: [0.4, 0.8], size: [2, 3], color: '#5ef2d6', kind: 'glow' });
        } else this.reveal.set(k, nv);
      }
      this.dynSolids.length = 0;
      this.waters.length = 0;
      for (const e of this.entities) {
        if (e.water) this.waters.push(e.water);
      }
      for (const e of this.entities) {
        if (!e.dead && e.update) e.update(dt, game);
      }
      for (const e of this.entities) {
        if (e.dead) continue;
        if (e.solid) { const s = e.solidBox(); if (s) this.dynSolids.push(s); }
      }
      for (let i = this.entities.length - 1; i >= 0; i--) if (this.entities[i].dead) this.entities.splice(i, 1);
    }

    // --------- rendu ---------
    renderScale() { return Math.min(2, (HOL.view && HOL.view.rs) || 1); }
    getChunk(cx, cy) {
      const key = cx + ',' + cy;
      let c = this.chunks.get(key);
      if (c) return c;
      const rs = this.renderScale();
      const size = CH * T;
      c = G.canvas(size * rs, size * rs);
      const ctx = c.getContext('2d');
      ctx.setTransform(rs, 0, 0, rs, -cx * size * rs, -cy * size * rs);
      const th = this.theme;
      const x0 = cx * CH - 1, y0 = cy * CH - 1, x1 = x0 + CH + 2, y1 = y0 + CH + 2;
      const isR = (x, y) => { const ch = this.tile(x, y); return ch === '#' || ch === 'B'; };
      // passe 1 : échelles et plateformes derrière
      for (let ty = y0; ty < y1; ty++) for (let tx = x0; tx < x1; tx++) {
        const ch = this.tile(tx, ty);
        if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) continue;
        if (ch === '|') th.ladder(ctx, tx * T, ty * T, { tx, ty });
      }
      // passe 2 : solides
      for (let ty = y0; ty < y1; ty++) for (let tx = x0; tx < x1; tx++) {
        if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) continue;
        const ch = this.tile(tx, ty);
        if (ch === '#' || ch === 'B') {
          const info = {
            tx, ty, depth: this.depth[ty * this.w + tx],
            open: { n: !isR(tx, ty - 1) && ty > 0, s: !isR(tx, ty + 1) && ty < this.h - 1, w: !isR(tx - 1, ty) && tx > 0, e: !isR(tx + 1, ty) && tx < this.w - 1 }
          };
          if (ty === 0 && this.exits.top) info.open.n = !isR(tx, ty - 1);
          if (ch === 'B') th.breakable(ctx, tx * T, ty * T, info); else th.tile(ctx, tx * T, ty * T, info);
        } else if (ch === '=') {
          th.oneway(ctx, tx * T, ty * T, { tx, ty, edgeL: this.tile(tx - 1, ty) !== '=', edgeR: this.tile(tx + 1, ty) !== '=' });
        } else if (ch === '^') {
          th.spike(ctx, tx * T, ty * T, { tx, ty });
        }
      }
      this.chunks.set(key, c);
      if (this.chunks.size > 40) { const first = this.chunks.keys().next().value; if (first !== key) this.chunks.delete(first); }
      return c;
    }
    drawTiles(ctx, cam) {
      const size = CH * T;
      const cx0 = Math.floor(cam.x / size), cy0 = Math.floor(cam.y / size);
      const cx1 = Math.floor((cam.x + VW / cam.zoom) / size), cy1 = Math.floor((cam.y + VH / cam.zoom) / size);
      for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
        if (cx < 0 || cy < 0 || cx * size >= this.pw || cy * size >= this.ph) continue;
        ctx.drawImage(this.getChunk(cx, cy), cx * size, cy * size, size, size);
      }
    }
    drawHidden(ctx, cam, t) {
      const x0 = Math.floor(cam.x / T) - 1, x1 = Math.ceil((cam.x + VW) / T) + 1;
      const y0 = Math.floor(cam.y / T) - 1, y1 = Math.ceil((cam.y + VH) / T) + 1;
      for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
        if (this.tile(tx, ty) !== 'H') continue;
        const x = tx * T, y = ty * T;
        const r = this.reveal.get(ty * this.w + tx) || 0;
        if (r > 0) {
          let a = 1;
          if (r < 1.6) a = (Math.sin(t * 30) > 0) ? 0.9 : 0.35;
          ctx.globalAlpha = a;
          ctx.fillStyle = 'rgba(94,242,214,0.35)'; ctx.fillRect(x + 1, y + 1, T - 2, T - 2);
          ctx.strokeStyle = '#5ef2d6'; ctx.lineWidth = 2; ctx.strokeRect(x + 2, y + 2, T - 4, T - 4);
          ctx.fillStyle = '#bafff0'; ctx.fillRect(x + 2, y + 2, T - 4, 2);
          ctx.globalAlpha = 1;
          G.glow(ctx, x + 16, y + 16, 30, '#5ef2d6', 0.25 * a);
        } else {
          const s = 0.07 + 0.07 * Math.max(0, Math.sin(t * 1.3 + tx * 0.7 + ty));
          ctx.strokeStyle = 'rgba(160,255,235,' + s + ')'; ctx.lineWidth = 1;
          ctx.setLineDash([3, 4]); ctx.strokeRect(x + 3, y + 3, T - 6, T - 6); ctx.setLineDash([]);
        }
      }
    }
    drawWater(ctx, cam, t, front) {
      // eau statique (~)
      const wt = this.waterTiles;
      if (!wt.length) return;
      const x0 = cam.x - T, x1 = cam.x + VW + T, y0 = cam.y - T, y1 = cam.y + VH + T;
      const col = this.def.waterColor || '#2a6f9a';
      for (let i = 0; i < wt.length; i += 2) {
        const tx = wt[i], ty = wt[i + 1], x = tx * T, y = ty * T;
        if (x < x0 || x > x1 || y < y0 || y > y1) continue;
        const surf = this.tile(tx, ty - 1) !== '~';
        drawWaterRect(ctx, x, y, T, T, surf, t, col, front);
      }
    }
    drawDeco(ctx, cam, t, fg) {
      const x0 = cam.x - 60, x1 = cam.x + VW + 60, y0 = cam.y - 60, y1 = cam.y + VH + 80;
      const dd = this.theme.drawDeco;
      for (const d of this.deco) {
        if (!!d.fg !== fg) continue;
        if (d.x < x0 || d.x > x1 || d.y < y0 || d.y > y1) continue;
        dd(ctx, d, t);
      }
    }
    getLayers() {
      if (!this.layers) {
        const key = this.theme.name + (this.def.layersKey || '');
        HOL.layerCache = HOL.layerCache || {};
        if (!HOL.layerCache[key]) HOL.layerCache[key] = this.theme.buildLayers(this);
        this.layers = HOL.layerCache[key];
      }
      return this.layers;
    }
    drawBackground(ctx, cam, t) {
      this.theme.sky(ctx, this, cam, t);
      const layers = this.getLayers();
      const bottomGap = this.ph - (cam.y + VH);
      for (const L of layers) {
        const w = L.c.width, h = L.c.height;
        let ox = -((cam.x * L.f) % w);
        if (ox > 0) ox -= w;
        const oy = VH - h + bottomGap * L.f * 0.6 + (this.def.layerOffset || 0) * L.f;
        for (let x = ox; x < VW; x += w) ctx.drawImage(L.c, x, oy);
        // prolonge la couleur du bas si besoin
        if (oy + h < VH) { ctx.drawImage(L.c, 0, h - 2, w, 2, 0, oy + h - 1, VW, VH - (oy + h) + 2); }
      }
    }
  }

  function drawWaterRect(ctx, x, y, w, h, surf, t, col, front) {
    if (!front) {
      const g = ctx.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, U.rgba(col, 0.55)); g.addColorStop(1, U.rgba(U.shade(col, -0.35), 0.75));
      ctx.fillStyle = g;
      ctx.fillRect(x, y + (surf ? 6 : 0), w, h - (surf ? 6 : 0));
      // reflets qui ondulent
      ctx.fillStyle = 'rgba(200,240,255,0.08)';
      const k = Math.sin(t * 2 + x * 0.05 + y * 0.03);
      ctx.fillRect(x + 4 + k * 3, y + 14, 10, 1.5);
      return;
    }
    if (!surf) return;
    // surface animée
    ctx.fillStyle = U.rgba(U.shade(col, 0.2), 0.55);
    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    for (let i = 0; i <= 8; i++) {
      const px = x + (i / 8) * w;
      ctx.lineTo(px, y + 6 + Math.sin(t * 3 + px * 0.08) * 2 + Math.sin(t * 1.7 + px * 0.03) * 1.5);
    }
    ctx.lineTo(x + w, y + 10); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(220,250,255,0.7)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 8; i++) {
      const px = x + (i / 8) * w, py = y + 6 + Math.sin(t * 3 + px * 0.08) * 2 + Math.sin(t * 1.7 + px * 0.03) * 1.5;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    if (Math.sin(t * 2.3 + x * 0.3) > 0.9) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(x + (x * 7 % 20), y + 5, 3, 1.5); }
  }
  HOL.drawWaterRect = drawWaterRect;
  HOL.Room = Room;
})();
