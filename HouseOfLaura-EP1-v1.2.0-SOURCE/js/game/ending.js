/* House of Laura · fin : montage, stream final, générique, bilan, teaser de l'Épisode II */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U, G = HOL.G, T = HOL.T;
  const VW = HOL.VIEW_W, VH = HOL.VIEW_H;
  const C = () => HOL.Chars;

  function fakeRoom(theme, extra) { return Object.assign({ state: { power: true, dawn: 1 }, ph: VH, def: {}, theme: HOL.Themes[theme] }, extra || {}); }
  function backdrop(ctx, theme, camX, t, extraState) {
    const th = HOL.Themes[theme];
    const room = fakeRoom(theme);
    if (extraState) Object.assign(room.state, extraState);
    const cam = { x: camX, y: 0, zoom: 1 };
    th.sky(ctx, room, cam, t);
    HOL.layerCache = HOL.layerCache || {};
    if (!HOL.layerCache[theme]) HOL.layerCache[theme] = th.buildLayers(room);
    for (const L of HOL.layerCache[theme]) {
      const w = L.c.width, h = L.c.height;
      let ox = -((camX * L.f) % w); if (ox > 0) ox -= w;
      for (let x = ox; x < VW; x += w) ctx.drawImage(L.c, x, VH - h + 20);
    }
  }
  function groundStrip(ctx, theme, y) {
    const th = HOL.Themes[theme];
    for (let i = 0; i < VW / T + 1; i++) {
      for (let j = 0; j < 4; j++) th.tile(ctx, i * T, y + j * T, { tx: i, ty: j, depth: j, open: { n: j === 0, s: false, w: false, e: false } });
    }
  }
  function drawChar(ctx, id, x, y, anim, t, facing, scale) {
    const pose = C().poseFor({ anim, t, phase: t * 6, time: t });
    C().drawBody(ctx, C().LOOKS[id], pose, x, y, { facing: facing || 1, time: t, scale: scale || 1.35 });
  }
  function caption(ctx, text, k) {
    ctx.globalAlpha = k;
    const g = ctx.createLinearGradient(0, VH - 110, 0, VH);
    g.addColorStop(0, 'rgba(8,4,16,0)'); g.addColorStop(1, 'rgba(8,4,16,0.85)');
    ctx.fillStyle = g; ctx.fillRect(0, VH - 110, VW, 110);
    G.text(ctx, text, VW / 2, VH - 40, { size: 24, color: '#fff', align: 'center', shadow: 'rgba(0,0,0,0.7)' });
    ctx.globalAlpha = 1;
  }

  class Ending {
    constructor(game) {
      this.game = game; this.t = 0; this.idx = 0; this.st = 0; this.done = false;
      const s = game.save, rec = (id) => s.reconnected[id];
      const scenes = [];
      scenes.push({ dur: 3.5, draw: (ctx, t) => this.titleCard(ctx, t, 'Le matin suivant…') });
      scenes.push({ dur: 7, music: 'fin', draw: (ctx, t, k) => {
        backdrop(ctx, 'quartier', t * 20, t);
        groundStrip(ctx, 'quartier', 440);
        HOL.Props.fountain(ctx, 380, 440, {}, t, { flag: () => true, story: { zoneGray: () => 0 }, room: {}, save: s });
        const cast = ['misterflo', 'tacos', 'charly', 'cocol', 'k974', 'keeli'].filter(rec);
        cast.forEach((id, i) => {
          const x = 120 + i * 140 + (i >= 2 ? 140 : 0);
          const anim = id === 'k974' && s.flags.k974_done ? 'run' : id === 'misterflo' ? 'wave' : id === 'cocol' ? 'interact' : 'happy';
          drawChar(ctx, id, x, 440, anim, t + i, i % 2 ? -1 : 1);
          if (id === 'keeli' && s.flags.pixel_found) C().drawCat(ctx, x + 40, 440, t, -1, true);
        });
        caption(ctx, 'Le quartier a retrouvé ses couleurs.', k);
      } });
      scenes.push({ dur: 6.5, draw: (ctx, t, k) => {
        backdrop(ctx, 'foret', t * 15, t);
        HOL.Props.bigtree(ctx, 560, 440, { s: 0.75 }, t, null);
        groundStrip(ctx, 'foret', 440);
        if (rec('drulysf')) drawChar(ctx, 'drulysf', 470, 440, 'idle', t, 1);
        if (rec('omas')) drawChar(ctx, 'omas', 330, 440, 'happy', t, 1);
        for (let i = 0; i < 14; i++) G.glow(ctx, (i * 97 + t * 30) % VW, 200 + Math.sin(t + i) * 80, 10, '#f4ff9a', 0.6);
        caption(ctx, 'La forêt chante à nouveau.', k);
      } });
      scenes.push({ dur: 6.5, draw: (ctx, t, k) => {
        backdrop(ctx, 'riviere', t * 18, t);
        ctx.fillStyle = 'rgba(42,122,168,0.7)'; ctx.fillRect(0, 440, VW, 100);
        for (let i = 0; i < 20; i++) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect((i * 83 + t * 40) % VW, 448 + (i % 4) * 18, 18, 2); }
        groundStrip(ctx, 'riviere', 440 + 64);
        HOL.Props.ferry(ctx, 560 + Math.sin(t * 0.5) * 30, 444, 160, t);
        if (rec('brazya')) drawChar(ctx, 'brazya', 660 + Math.sin(t * 0.5) * 30, 444, 'wave', t, -1);
        ctx.fillStyle = '#5c5a6c'; ctx.fillRect(0, 440, 300, 100);
        if (rec('sylvain')) drawChar(ctx, 'sylvain', 110, 440, 'idle', t, 1);
        if (rec('ofire')) drawChar(ctx, 'ofire', 190, 440, 'happy', t, 1);
        if (rec('andyblct')) drawChar(ctx, 'andyblct', 260, 440, 'wave', t, 1);
        caption(ctx, 'La rivière a repris son cours.', k);
      } });
      scenes.push({ dur: 6.5, draw: (ctx, t, k) => {
        const room = fakeRoom('final');
        HOL.Themes.final.sky(ctx, room, { x: 0, y: 0 }, t);
        const g = ctx.createLinearGradient(0, 0, 0, VH);
        g.addColorStop(0, 'rgba(255,190,140,0.0)'); g.addColorStop(1, 'rgba(255,180,120,0.55)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
        ctx.strokeStyle = '#2a2040'; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(VW / 2 - 90, VH); ctx.lineTo(VW / 2, 130); ctx.lineTo(VW / 2 + 90, VH); ctx.stroke();
        for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(VW / 2 - 90 + i * 9, VH - i * 45); ctx.lineTo(VW / 2 + 90 - i * 9, VH - i * 45); ctx.stroke(); }
        G.glow(ctx, VW / 2, 130, 90 + Math.sin(t * 3) * 10, '#c9b8ff', 0.8);
        for (let i = 0; i < 3; i++) { ctx.strokeStyle = 'rgba(201,184,255,' + (1 - ((t * 0.5 + i / 3) % 1)) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(VW / 2, 130, 20 + ((t * 0.5 + i / 3) % 1) * 200, 0, U.TAU); ctx.stroke(); }
        caption(ctx, 'Et sur la colline, une vieille radio s\'est remise à chanter.', k);
      } });
      scenes.push({ dur: 16, draw: (ctx, t, k) => this.streamScene(ctx, t, k) });
      if (s.polaroidsGiven >= 6 || s.countPolaroids() >= 6) scenes.push({ dur: 7, draw: (ctx, t, k) => this.groupPhoto(ctx, t, k) });
      scenes.push({ dur: 34, draw: (ctx, t, k) => this.credits(ctx, t, k) });
      scenes.push({ dur: 9999, wait: true, draw: (ctx, t, k) => this.stats(ctx, t, k) });
      scenes.push({ dur: 9999, wait: true, music: 'teaser', teaser: true, draw: (ctx, t, k) => this.teaser(ctx, t, k) });
      this.scenes = scenes;
      HOL.Audio.play('fin', 2);
    }
    update(dt) {
      const I = HOL.Input;
      this.t += dt; this.st += dt;
      const sc = this.scenes[this.idx];
      const press = I.pressed('confirm') || I.pressed('jump') || I.clicked(0) || I.pressed('pause');
      if (press) { I.consume('confirm'); I.consume('jump'); I.consumeClick(0); I.consume('pause'); }
      let next = this.st >= sc.dur;
      if (press && this.st > 0.8) {
        if (sc.teaser) { if (this.st > 16) next = true; }
        else next = true;
      }
      if (next) {
        this.idx++; this.st = 0;
        if (this.idx >= this.scenes.length) { this.done = true; this.game.finishEnding(); return; }
        const ns = this.scenes[this.idx];
        if (ns.music) HOL.Audio.play(ns.music, 2);
      }
    }
    draw(ctx) {
      const sc = this.scenes[this.idx];
      if (!sc) return;
      const k = U.clamp(Math.min(this.st / 0.8, sc.wait ? 1 : (sc.dur - this.st) / 0.8), 0, 1);
      ctx.fillStyle = '#07040d'; ctx.fillRect(0, 0, VW, VH);
      ctx.save();
      sc.draw(ctx, this.st, k);
      ctx.restore();
      // fondu
      ctx.fillStyle = 'rgba(7,4,13,' + (1 - k) + ')'; ctx.fillRect(0, 0, VW, VH);
      if (!sc.wait && this.st > 1) G.text(ctx, HOL.Input.promptDevice() === 'pad' ? 'A : passer' : 'Espace : passer', VW - 16, VH - 12, { size: 11, color: 'rgba(255,255,255,0.3)', align: 'right' });
    }
    titleCard(ctx, t, text) {
      G.text(ctx, text, VW / 2, VH / 2, { size: 28, color: '#ffd1f2', align: 'center', font: HOL.FONT, weight: 'italic bold' });
    }
    streamScene(ctx, t, k) {
      const s = this.game.save;
      // chambre
      const g = ctx.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, '#2e1840'); g.addColorStop(1, '#1b0f28');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      const col = U.mix('#ff4fd8', '#9b5cff', (Math.sin(t * 0.8) + 1) / 2);
      ctx.fillStyle = col; ctx.fillRect(0, 30, VW, 4);
      const lg = ctx.createLinearGradient(0, 30, 0, 260); lg.addColorStop(0, U.rgba(col, 0.3)); lg.addColorStop(1, U.rgba(col, 0));
      ctx.fillStyle = lg; ctx.fillRect(0, 30, VW, 230);
      HOL.Props.window(ctx, 40, 250, { w: 5, h: 4 }, t, null);
      HOL.Props.fairylights(ctx, 20, 40, { w: 18 }, t, null);
      ctx.fillStyle = '#4a2e3a'; ctx.fillRect(0, 440, VW, 100);
      ctx.fillStyle = '#8c5b3d'; ctx.fillRect(0, 440, VW, 10);
      HOL.Props.desk(ctx, 250, 440, { w: 7 }, t, null);
      // Laura assise, Tony debout, Écho avec son antenne
      const pose = C().poseFor({ anim: t > 7 && t < 9 ? 'wave' : 'sit', t: t, time: t });
      if (t > 7 && t < 9) { pose.lHip = 1.5; pose.lKnee = 1.45; pose.rHip = 1.45; pose.rKnee = 1.5; }
      pose.face = t > 3 ? 'happy' : 'neutral';
      pose.talk = (t > 4 && t < 7) || (t > 10 && t < 13) ? 1 : 0;
      HOL.Props.chair(ctx, 430, 440, {}, t);
      C().drawBody(ctx, C().LOOKS.laura, pose, 445, 440, { facing: -1, time: t, scale: 1.35 });
      drawChar(ctx, 'tony', 560, 440, t > 1 && t < 3 ? 'wave' : 'happy', t, -1);
      C().drawEcho(ctx, 500, 330 + Math.sin(t * 2) * 5, { time: t, facing: -1, antenna: true, power: 1 });
      // chat du stream
      const cx = VW - 330, cy = 40, cw = 300, ch = 380;
      ctx.fillStyle = 'rgba(14,7,26,0.9)'; G.rr(ctx, cx, cy, cw, ch, 16); ctx.fill();
      ctx.strokeStyle = '#ff5fae'; ctx.lineWidth = 2; ctx.stroke();
      G.text(ctx, '● EN DIRECT · Chat de la House', cx + 16, cy + 26, { size: 14, color: '#ff5fae' });
      const msgs = [];
      const lines = {
        misterflo: 'Bonsoir chère Laura !', k974: s.flags.k974_done ? 'LE SON EST REVENU' : 'le quartier revit !', keeli: s.flags.pixel_found ? 'Pixel dit bonjour' : 'on est tous là !',
        tacos: 'tacos gratuits ce soir', cocol: 'clic ! photo de groupe', drulysf: 'Le Chêne salue la House.', omas: 'j\'ai trouvé mes champignons (non)',
        sylvain: 'les poissons mordent', ofire: 'tous les feux sont allumés', andyblct: 'carte mise à jour', brazya: 'le bac est à l\'heure', charly: 'nouvelle fresque en cours', tony: 'EN DIRECT !!'
      };
      for (const id of HOL.Chars.HOUSE) if (s.reconnected[id]) msgs.push([HOL.Chars.INFO[id].name, lines[id], HOL.Chars.INFO[id].color]);
      msgs.push(['Le Veilleur', 'Bonsoir à tous ceux qui ne dorment pas.', '#c9b8ff']);
      msgs.push(['Écho', 'BIP. <3', '#7ff3ff']);
      // Les messages doivent tenir DANS le panneau. Avant ils etaient dessines
      // sur une seule ligne a cx+18+nom, donc un nom long ("Le Veilleur")
      // pushingait le texte hors du cadre et il etait coupe.
      const MSG = '13px ' + HOL.FONT;
      const wrap = (txt, maxW) => {
        const out = []; let cur = '';
        for (const w of String(txt).split(' ')) {
          const t = cur ? cur + ' ' + w : w;
          if (ctx.measureText(t).width > maxW && cur) { out.push(cur); cur = w; }
          else cur = t;
        }
        if (cur) out.push(cur);
        return out;
      };
      // on part des messages les plus recents et on remonte tant que ca tient
      const maxY = cy + ch - 34;
      let y = maxY;
      const start = Math.max(0, Math.min(msgs.length, Math.floor(t * 1.1)) - 1);
      for (let i = start; i >= 0; i--) {
        const m = msgs[i];
        ctx.font = 'bold ' + MSG;
        const nw = ctx.measureText(m[0] + ' : ').width;
        ctx.font = MSG;
        const ls = wrap(m[1], cw - 36 - nw);
        const h = Math.max(30, ls.length * 16 + 12);
        if (y - h < cy + 50) break;
        y -= h;
        G.text(ctx, m[0] + ' :', cx + 16, y, { size: 13, color: m[2] });
        for (let k = 0; k < ls.length; k++) G.text(ctx, ls[k], cx + 18 + nw, y + k * 16, { size: 13, color: '#f4ecff' });
      }
      G.text(ctx, '+ ' + (300 + Math.floor(t * 23)) + ' spectateurs', cx + 16, cy + ch - 14, { size: 12, color: 'rgba(255,255,255,0.5)' });
      // sous-titres
      const sub = t < 3.5 ? ['tony', 'En direct dans 3… 2… 1…'] : t < 7 ? ['laura', 'Bonsoir la House ! Vous m\'avez tellement manqué.'] : t < 10 ? ['laura', 'Il s\'est passé des choses… incroyables. Je vous raconte tout.'] : t < 13 ? ['laura', 'Mais d\'abord : ce soir, on a un invité spécial.'] : ['echo', 'BIP BIP.'];
      const info = HOL.Chars.INFO[sub[0]];
      ctx.fillStyle = 'rgba(14,7,26,0.85)'; G.rr(ctx, 60, VH - 86, VW - 400, 62, 16); ctx.fill();
      G.text(ctx, info.name, 84, VH - 60, { size: 13, color: info.color });
      G.text(ctx, sub[1], 84, VH - 36, { size: 18, color: '#fff' });
    }
    groupPhoto(ctx, t, k) {
      ctx.fillStyle = '#1b0f28'; ctx.fillRect(0, 0, VW, VH);
      const px = 120, py = 50, pw = VW - 240, ph = VH - 110;
      ctx.save(); ctx.translate(VW / 2, VH / 2); ctx.rotate(-0.02 + Math.sin(t * 0.5) * 0.005); ctx.translate(-VW / 2, -VH / 2);
      ctx.fillStyle = '#fbf7ee'; ctx.fillRect(px, py, pw, ph);
      ctx.save(); ctx.beginPath(); ctx.rect(px + 18, py + 18, pw - 36, ph - 90); ctx.clip();
      backdrop(ctx, 'quartier', 200, t);
      const ids = ['laura'].concat(HOL.Chars.HOUSE);
      ids.forEach((id, i) => {
        const x = px + 60 + (i % 7) * ((pw - 120) / 6.3), y = py + (i < 7 ? ph - 150 : ph - 110);
        if (id === 'laura' || this.game.save.reconnected[id]) drawChar(ctx, id, x, y, i % 3 === 0 ? 'wave' : 'happy', t + i * 0.3, i % 2 ? -1 : 1, 1.05);
      });
      C().drawEcho(ctx, px + pw / 2, py + 70, { time: t, antenna: true, power: 1 });
      ctx.restore();
      G.text(ctx, 'Toute la House réunie', VW / 2, py + ph - 36, { size: 26, color: '#2a1838', align: 'center', font: HOL.FONT, weight: 'italic bold' });
      ctx.restore();
      if (t < 0.4) { ctx.fillStyle = 'rgba(255,255,255,' + (1 - t / 0.4) + ')'; ctx.fillRect(0, 0, VW, VH); }
    }
    credits(ctx, t, k) {
      ctx.fillStyle = '#0d0716'; ctx.fillRect(0, 0, VW, VH);
      for (let i = 0; i < 60; i++) { ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.3 * Math.sin(t * 2 + i)) + ')'; ctx.fillRect(U.hash(i, 1, 2) * VW, U.hash(i, 2, 2) * VH, 1.5, 1.5); }
      const hasFiles = HOL.Audio.trackIds().some((id) => HOL.Audio.trackStatus(id) === 'file');
      const L = [
        ['title', 'HOUSE OF LAURA'], ['sub', 'Épisode I · Le Signal Perdu'], ['gap'],
        ['head', 'Avec'], ['name', 'Laura', '#ff5fae'], ['gap'],
        ['head', 'et toute la House']
      ];
      for (const id of HOL.Chars.HOUSE) L.push(['name', HOL.Chars.INFO[id].name, HOL.Chars.INFO[id].color]);
      L.push(['gap'], ['head', 'Et aussi'], ['name', 'Écho', '#7ff3ff'], ['name', 'Pixel le chat', '#ffd28a'], ['name', 'Le Veilleur', '#c9b8ff'], ['gap']);
      L.push(['head', 'Musique'], ['line', hasFiles ? 'Les morceaux choisis par la House' : 'Musique générative de secours (en attendant les vrais morceaux)'], ['gap']);
      L.push(['head', 'Un petit jeu fait avec amour'], ['line', 'pour une communauté qui ne laisse jamais personne seul dans le silence.'], ['gap'], ['gap'], ['title2', 'Merci d\'avoir joué ♥']);
      let y = VH + 40 - t * 58;
      for (const l of L) {
        if (l[0] === 'title') { G.text(ctx, l[1], VW / 2, y, { size: 52, color: '#fff', align: 'center', font: HOL.FONT_TITLE, weight: '900', shadow: 'rgba(255,95,174,0.7)', sdx: 0, sdy: 4 }); y += 50; }
        else if (l[0] === 'sub') { G.text(ctx, l[1], VW / 2, y, { size: 20, color: '#ffd1f2', align: 'center' }); y += 40; }
        else if (l[0] === 'head') { G.text(ctx, l[1].toUpperCase(), VW / 2, y, { size: 14, color: '#ff5fae', align: 'center' }); y += 34; }
        else if (l[0] === 'name') { G.text(ctx, l[1], VW / 2, y, { size: 24, color: l[2] || '#fff', align: 'center' }); y += 34; }
        else if (l[0] === 'line') { G.text(ctx, l[1], VW / 2, y, { size: 17, color: '#e9dcff', align: 'center' }); y += 30; }
        else if (l[0] === 'title2') { G.text(ctx, l[1], VW / 2, Math.max(y, VH / 2), { size: 36, color: '#fff', align: 'center', font: HOL.FONT_TITLE, weight: '900' }); y += 60; }
        else y += 30;
      }
      C().drawEcho(ctx, VW - 90, 110 + Math.sin(t * 2) * 8, { time: t, antenna: true, power: 1 });
    }
    stats(ctx, t, k) {
      const g = this.game, s = g.save;
      ctx.fillStyle = '#0d0716'; ctx.fillRect(0, 0, VW, VH);
      G.text(ctx, 'BILAN DE L\'AVENTURE', VW / 2, 90, { size: 32, color: '#fff', align: 'center', font: HOL.FONT_TITLE, weight: '900' });
      const rows = [
        ['Temps de jeu', U.fmtTime(s.time)],
        ['Éclats de voix', s.countCrystals() + ' / ' + g.totalCrystals()],
        ['Polaroïds de Cocol_', s.countPolaroids() + ' / 6'],
        ['Membres de la House reconnectés', s.countReconnected() + ' / 13'],
        ['Cœurs', g.player.maxHp + ' / 5'],
        ['Ombres dissipées', String(s.stats.enemies || 0)],
        ['Chutes et relevés', String(s.stats.deaths || 0)]
      ];
      rows.forEach((r, i) => {
        const y = 160 + i * 42;
        const a = U.clamp((t - i * 0.25) * 3, 0, 1);
        ctx.globalAlpha = a;
        G.text(ctx, r[0], VW / 2 - 20, y, { size: 19, color: '#e9dcff', align: 'right' });
        G.text(ctx, r[1], VW / 2 + 20, y, { size: 21, color: '#ffd1f2' });
      });
      ctx.globalAlpha = 1;
      const all = s.countCrystals() >= g.totalCrystals() && s.countPolaroids() >= 6 && s.countReconnected() >= 13;
      if (t > 2) G.text(ctx, all ? '100 % · Toute la House te dit merci. Vraiment tout le monde.' : 'Après le générique, « Continuer » te ramène chez toi : tout reste à explorer.', VW / 2, 470, { size: 15, color: all ? '#5fe07a' : 'rgba(255,255,255,0.65)', align: 'center' });
      if (t > 1.5) G.prompt(ctx, VW / 2, 505, 'confirm', 'Continuer', { align: 'center', size: 15 });
    }
    teaser(ctx, t, k) {
      ctx.fillStyle = '#05030a'; ctx.fillRect(0, 0, VW, VH);
      if (t < 12) {
        // chambre dans la nuit, Écho s'allume
        ctx.fillStyle = '#120a1a'; ctx.fillRect(0, 0, VW, VH);
        HOL.Props.desk(ctx, 200, 430, { w: 8 }, t, { room: { state: { power: false, static: t > 3 && t < 5 } } });
        ctx.fillStyle = '#1a0f22'; ctx.fillRect(0, 430, VW, 110);
        const ep = t < 2 ? 0 : Math.min(1, (t - 2) * 0.8);
        C().drawEcho(ctx, 470, 370 - ep * 40 + Math.sin(t * 3) * 3, { time: t, antenna: true, power: ep, color: t > 5 ? '#5ef2d6' : '#ff7ad9', talking: t > 8 });
        if (t > 5) {
          // carte avec un nouveau signal
          ctx.globalAlpha = Math.min(1, (t - 5));
          ctx.fillStyle = 'rgba(10,30,40,0.9)'; G.rr(ctx, 560, 80, 340, 240, 14); ctx.fill();
          ctx.strokeStyle = '#5ef2d6'; ctx.lineWidth = 2; ctx.stroke();
          ctx.strokeStyle = 'rgba(94,242,214,0.25)'; ctx.lineWidth = 1;
          for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(560, 80 + i * 30); ctx.lineTo(900, 80 + i * 30); ctx.stroke(); ctx.beginPath(); ctx.moveTo(560 + i * 45, 80); ctx.lineTo(560 + i * 45, 320); ctx.stroke(); }
          ctx.fillStyle = 'rgba(94,242,214,0.35)';
          ctx.beginPath(); ctx.moveTo(580, 300); ctx.quadraticCurveTo(640, 160, 720, 220); ctx.quadraticCurveTo(800, 280, 880, 130); ctx.lineTo(880, 310); ctx.lineTo(580, 310); ctx.fill();
          G.text(ctx, 'ICI', 628, 262, { size: 11, color: '#ffd1f2' }); ctx.fillStyle = '#ff5fae'; ctx.beginPath(); ctx.arc(640, 272, 4, 0, U.TAU); ctx.fill();
          const bl = Math.sin(t * 6) > 0;
          ctx.fillStyle = bl ? '#ff4a5a' : '#5a1a2a'; ctx.beginPath(); ctx.arc(846, 128, 6, 0, U.TAU); ctx.fill();
          if (bl) G.glow(ctx, 846, 128, 40, '#ff4a5a', 0.7);
          G.text(ctx, 'SIGNAL INCONNU', 846, 110, { size: 11, color: '#ff8a9a', align: 'center' });
          ctx.globalAlpha = 1;
        }
        const lines = [
          [5.5, 'radio', '…kkhh… ici… la Maison des Brumes… quelqu\'un nous entend ?'],
          [8, 'radio', '…le Silence n\'était pas seul… il y en a d\'autres… beaucoup d\'autres…'],
          [10.5, 'echo', 'LAURA. NOUVEAU SIGNAL.']
        ];
        let cur = null; for (const l of lines) if (t >= l[0]) cur = l;
        if (cur) {
          const info = HOL.Chars.INFO[cur[1]];
          ctx.fillStyle = 'rgba(14,7,26,0.85)'; G.rr(ctx, 60, VH - 90, VW - 120, 64, 16); ctx.fill();
          G.text(ctx, info.name, 84, VH - 64, { size: 13, color: info.color });
          G.text(ctx, cur[2], 84, VH - 40, { size: 18, color: '#fff' });
        }
        if (t > 5 && t < 5.3) HOL.Audio.sfx('radio');
      } else {
        const a = Math.min(1, (t - 12) * 0.6);
        ctx.globalAlpha = a;
        G.glow(ctx, VW / 2, VH / 2 - 20, 300, '#5ef2d6', 0.2);
        G.text(ctx, 'HOUSE OF LAURA', VW / 2, VH / 2 - 60, { size: 52, color: '#fff', align: 'center', font: HOL.FONT_TITLE, weight: '900', shadow: 'rgba(94,242,214,0.6)', sdx: 0, sdy: 4 });
        G.text(ctx, 'ÉPISODE II', VW / 2, VH / 2 - 6, { size: 26, color: '#5ef2d6', align: 'center', font: HOL.FONT_TITLE, weight: '900' });
        G.text(ctx, 'Les Voix Lointaines', VW / 2, VH / 2 + 32, { size: 24, color: '#ffd1f2', align: 'center', weight: 'italic bold' });
        G.text(ctx, 'Bientôt.', VW / 2, VH / 2 + 90, { size: 18, color: 'rgba(255,255,255,0.7)', align: 'center' });
        ctx.globalAlpha = 1;
        if (t > 16) G.prompt(ctx, VW / 2, VH - 40, 'confirm', 'Revenir au titre', { align: 'center', size: 14 });
      }
    }
  }
  HOL.Ending = Ending;
})();
