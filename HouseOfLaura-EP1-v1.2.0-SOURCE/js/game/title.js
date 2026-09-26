/* House of Laura · écran titre, extras, jukebox */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U, G = HOL.G;
  const VW = HOL.VIEW_W, VH = HOL.VIEW_H;
  const TRACK_NAMES = {
    menu: 'Menu', maison: 'La maison', maison_noir: 'La maison (panne)', quartier: 'Le quartier', quartier_fete: 'Le quartier (fête)',
    foret: 'La forêt', riviere: 'La rivière', grotte: 'Les grottes', mystere: 'Zone mystérieuse', tension: 'Tension', climax: 'Climax', fin: 'Fin', teaser: 'Teaser Épisode II'
  };

  class Title {
    constructor(game) {
      this.game = game; this.t = 0; this.screen = 'press'; this.stars = [];
      for (let i = 0; i < 120; i++) this.stars.push({ x: Math.random() * VW, y: Math.random() * VH * 0.7, s: Math.random() * 1.6 + 0.4, p: Math.random() * 10 });
      this.build();
    }
    build() {
      const g = this.game;
      this.main = new HOL.MenuList([
        { label: 'Continuer', hidden: () => !HOL.Save.exists(), onSelect: () => g.continueGame() },
        { label: 'Nouvelle partie', onSelect: () => { if (HOL.Save.exists()) { this.screen = 'confirm'; this.confirm.idx = 1; } else g.newGame(); } },
        { label: 'Options', onSelect: () => { this.screen = 'options'; g.ui.optionsMenu.idx = 0; } },
        { label: 'Extras', onSelect: () => { this.screen = 'extras'; } },
        { label: 'Plein écran', onSelect: () => g.toggleFullscreen() }
      ]);
      this.confirm = new HOL.MenuList([
        { label: 'Oui, recommencer depuis le début', onSelect: () => { HOL.Save.clear(); g.newGame(); } },
        { label: 'Non, garder ma partie', onSelect: () => { this.screen = 'menu'; } }
      ], { onCancel: () => { this.screen = 'menu'; } });
      this.extras = new HOL.MenuList([
        { label: 'Jukebox (tester les musiques)', onSelect: () => { this.screen = 'jukebox'; this.buildJukebox(); } },
        { label: 'Crédits', onSelect: () => { this.screen = 'credits'; } },
        { label: 'Salles (TEST)', hidden: () => !HOL.ROOM_PICKER, onSelect: () => { this.screen = 'rooms'; this.buildRooms(); } },
        { label: 'Retour', onSelect: () => { this.screen = 'menu'; } }
      ], { onCancel: () => { this.screen = 'menu'; } });
    }
    // Build de TEST : saute directement dans n'importe quelle salle, avec les
    // 3 capacites, pour verifier qu'aucune n'est une impasse.
    buildRooms() {
      const g = this.game;
      const zones = [
        ['maison', 'Maison'], ['quartier', 'Quartier'], ['foret', 'Foret'],
        ['riviere', 'Riviere'], ['ruines', 'Ruines'], ['final', 'Final']
      ];
      const items = [];
      for (const [z, lib] of zones) {
        for (const id in HOL.ROOMS) {
          if (HOL.ROOMS[id].zone !== z) continue;
          // libelle explicite : "L1." repetait dans chaque zone, c'etait ambigu
          items.push({ label: lib + ' · ' + (HOL.ROOMS[id].name || id), onSelect: () => this.goRoom(id) });
        }
      }
      items.push({ label: 'Retour', onSelect: () => { this.screen = 'extras'; } });
      this.rooms = new HOL.MenuList(items, { onCancel: () => { this.screen = 'extras'; } });
    }
    goRoom(id) {
      const g = this.game;
      const s = g.save;
      s.abilities = { djump: true, dash: true, pulse: true };
      ['intro_done', 'met_tony', 'power_on', 'left_house', 'talkie', 'reso_done', 'ascension_done'].forEach(f => { s.flags[f] = true; });
      HOL.Audio.unlock();
      g.startPlay(id, 'default');
    }
    buildJukebox() {
      const items = HOL.Audio.trackIds().map((id) => ({
        label: TRACK_NAMES[id] || id,
        value: () => (HOL.Audio.currentId === id ? '♪ en lecture · ' : '') + (HOL.Audio.trackStatus(id) === 'file' ? 'fichier' : HOL.Audio.trackStatus(id) === 'probing' ? 'test…' : 'procédural'),
        onSelect: () => HOL.Audio.play(id, 1)
      }));
      items.push({ label: 'Retour', onSelect: () => { this.screen = 'extras'; HOL.Audio.play('menu', 1); } });
      this.juke = new HOL.MenuList(items, { onCancel: () => { this.screen = 'extras'; HOL.Audio.play('menu', 1); } });
    }
    update(dt) {
      this.t += dt;
      const I = HOL.Input;
      if (this.screen === 'press') {
        // Le jeu est uniquement jouable a la manette : on ne demarre que si une
        // manette est reellement detectee, sinon le joueur serait bloque.
        if (I.padReady() && (I.anyPressed || I.clicked(0))) {
          HOL.Audio.unlock(); HOL.Audio.play('menu', 2);
          this.screen = 'menu'; HOL.Audio.sfx('menu_ok');
          I.consume('confirm'); I.consume('jump'); I.consumeClick(0);
        }
        return;
      }
      if (this.screen === 'menu') this.main.update(dt);
      else if (this.screen === 'confirm') this.confirm.update(dt);
      else if (this.screen === 'extras') this.extras.update(dt);
      else if (this.screen === 'jukebox') this.juke.update(dt);
      else if (this.screen === 'options') {
        const um = this.game.ui.optionsMenu;
        const oldCancel = um.o.onCancel;
        um.o.onCancel = () => { this.screen = 'menu'; };
        const back = um.items[um.items.length - 1];
        const oldSel = back.onSelect; back.onSelect = () => { this.screen = 'menu'; };
        um.update(dt);
        um.o.onCancel = oldCancel; back.onSelect = oldSel;
      } else if (this.screen === 'credits') {
        if (I.pressed('cancel') || I.pressed('confirm') || I.clicked(0)) { I.consume('cancel'); I.consume('confirm'); I.consumeClick(0); this.screen = 'extras'; HOL.Audio.sfx('menu_back'); }
      } else if (this.screen === 'rooms') {
        this.rooms.update(dt);
      } else if (this.screen === 'controls') {
        // le titre gere ses propres ecrans : la liste des commandes doit y existir aussi
        if (I.pressed('cancel') || I.pressed('pause') || I.pressed('confirm') || I.clicked(0)) {
          I.consume('cancel'); I.consume('confirm'); I.consumeClick(0);
          this.screen = 'options'; HOL.Audio.sfx('menu_back');
        }
      }
    }
    draw(ctx) {
      const t = this.t;
      // ciel de nuit
      const g = ctx.createLinearGradient(0, 0, 0, VH);
      g.addColorStop(0, '#0b0619'); g.addColorStop(0.55, '#2a1242'); g.addColorStop(1, '#5a2458');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
      for (const s of this.stars) { ctx.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(t * 0.8 + s.p)); ctx.fillStyle = '#fff'; ctx.fillRect(s.x, s.y, s.s, s.s); }
      ctx.globalAlpha = 1;
      // ville en parallaxe
      HOL.layerCache = HOL.layerCache || {};
      const th = HOL.Themes.quartier;
      if (!HOL.layerCache.quartier) HOL.layerCache.quartier = th.buildLayers({ state: {}, def: {} });
      HOL.layerCache.quartier.forEach((L, i) => {
        if (i === 0) return;
        const w = L.c.width, h = L.c.height;
        let ox = -((t * 12 * L.f) % w); if (ox > 0) ox -= w;
        ctx.globalAlpha = 0.85;
        for (let x = ox; x < VW; x += w) ctx.drawImage(L.c, x, VH - h + 60);
      });
      ctx.globalAlpha = 1;
      // brume rose
      const fg = ctx.createLinearGradient(0, VH * 0.55, 0, VH);
      fg.addColorStop(0, 'rgba(255,95,174,0)'); fg.addColorStop(1, 'rgba(120,40,110,0.55)');
      ctx.fillStyle = fg; ctx.fillRect(0, VH * 0.55, VW, VH * 0.45);
      // Laura + Écho
      const lx = VW - 250, ly = VH - 170;
      G.glow(ctx, lx, ly - 40, 260, '#ff5fae', 0.25);
      ctx.save();
      ctx.beginPath(); ctx.rect(lx - 250, 0, 500, VH); ctx.clip();
      HOL.Chars.drawPortrait(ctx, 'laura', lx, ly, 380, this.screen === 'press' ? 'neutral' : 'happy', t, false, -1, 0);
      ctx.restore();
      HOL.Chars.drawEcho(ctx, lx - 170, ly - 150 + Math.sin(t * 2) * 8, { time: t, scale: 2.2, facing: 1, power: 1 });
      // logo
      const flick = Math.sin(t * 13) > 0.97 ? 0.6 : 1;
      const lX = 250, lY = 150;
      G.glow(ctx, lX, lY - 20, 220, '#ff5fae', 0.25 * flick);
      G.text(ctx, 'HOUSE', lX, lY - 34, { size: 64, color: '#fff', align: 'center', font: HOL.FONT_TITLE, weight: '900', shadow: U.rgba('#ff5fae', 0.9 * flick), sdx: 0, sdy: 0, outline: U.rgba('#ff5fae', 0.9 * flick), ow: 6 });
      G.text(ctx, 'OF LAURA', lX, lY + 26, { size: 52, color: '#ffe6f6', align: 'center', font: HOL.FONT_TITLE, weight: '900', outline: U.rgba('#9b5cff', 0.9), ow: 6 });
      G.text(ctx, 'ÉPISODE I · LE SIGNAL PERDU', lX, lY + 62, { size: 16, color: '#ffd1f2', align: 'center' });
      if (this.screen === 'press') {
        const a = 0.5 + 0.5 * Math.sin(t * 3);
        ctx.globalAlpha = a;
        G.text(ctx, 'Appuie sur une touche ou clique pour commencer', lX, 360, { size: 17, color: '#fff', align: 'center' });
        ctx.globalAlpha = 1;
        G.text(ctx, 'Clavier + souris ou manette', lX, 392, { size: 13, color: 'rgba(255,255,255,0.5)', align: 'center' });
      } else if (this.screen === 'menu') this.main.draw(ctx, lX, 250, 320, 42);
      else if (this.screen === 'confirm') {
        G.text(ctx, 'Écraser la partie en cours ?', lX, 250, { size: 18, color: '#fff', align: 'center' });
        this.confirm.draw(ctx, lX, 272, 360, 42);
      } else if (this.screen === 'extras') this.extras.draw(ctx, lX, 250, 360, 42);
      else if (this.screen === 'jukebox') {
        ctx.fillStyle = 'rgba(8,4,16,0.8)'; G.rr(ctx, 40, 20, 520, VH - 40, 20); ctx.fill();
        G.text(ctx, 'JUKEBOX', 300, 56, { size: 24, color: '#fff', align: 'center', font: HOL.FONT_TITLE, weight: '900' });
        G.text(ctx, '« fichier » = ton morceau dans audio/music · « procédural » = musique de secours', 300, 78, { size: 11, color: 'rgba(255,255,255,0.6)', align: 'center' });
        this.juke.draw(ctx, 300, 90, 480, 26);
      } else if (this.screen === 'options') {
        ctx.fillStyle = 'rgba(8,4,16,0.85)'; ctx.fillRect(0, 0, VW, VH);
        G.text(ctx, 'OPTIONS', VW / 2, 60, { size: 34, color: '#fff', align: 'center', font: HOL.FONT_TITLE, weight: '900' });
        this.game.ui.optionsMenu.draw(ctx, VW / 2, 86, 560, 25);
      } else if (this.screen === 'controls') {
        ctx.fillStyle = 'rgba(8,4,16,0.88)'; ctx.fillRect(0, 0, VW, VH);
        this.game.ui.drawControls(ctx);
      } else if (this.screen === 'rooms') {
        ctx.fillStyle = '#0b0616'; ctx.fillRect(0, 0, VW, VH);
        G.text(ctx, 'SALLES', VW / 2, 34, { size: 26, color: '#fff', align: 'center', font: HOL.FONT_TITLE, weight: '900' });
        G.text(ctx, 'Build de test : entre dans n\'import quelle salle avec les 3 capacites.', VW / 2, 54, { size: 12, color: 'rgba(255,255,255,0.6)', align: 'center' });
        // 30 lignes ne tiennent pas dans 540 px : on fait defiler la liste pour
        // garder la ligne selectionnee visible.
        const rowH = 22, pitch = rowH + 6, top = 76, visibles = 15;
        const n = this.rooms.items.length;
        let first = Math.max(0, Math.min(this.rooms.idx - Math.floor(visibles / 2), n - visibles));
        this.rooms.draw(ctx, VW / 2, top - first * pitch, 520, rowH);
        G.text(ctx, 'ligne ' + (this.rooms.idx + 1) + ' sur ' + n, 20, VH - 16, { size: 11, color: 'rgba(255,255,255,0.4)' });
      } else if (this.screen === 'credits') {
        ctx.fillStyle = 'rgba(8,4,16,0.88)'; G.rr(ctx, 60, 60, VW - 120, VH - 120, 20); ctx.fill();
        const L = ['HOUSE OF LAURA · Épisode I', '', 'Un petit jeu d\'aventure 2D fait pour la House.', 'Laura, Tony, MisterFlo, K974, Drulysf, Omas, Charly,', 'Sylvain, Cocol_, Keeli, Tacos, Andyblct, Brazya, Ofire_83.', '', 'Musique : ajoute tes morceaux dans audio/music (voir LISEZMOI).', 'Sans fichier, le jeu joue une musique générative de secours.', '', 'Merci d\'avoir joué ♥'];
        L.forEach((l, i) => G.text(ctx, l, VW / 2, 120 + i * 30, { size: i === 0 ? 24 : 16, color: i === 0 ? '#ff5fae' : '#f4ecff', align: 'center' }));
      }
      G.text(ctx, 'v' + (HOL.VERSION || '1.0.2'), VW - 12, VH - 10, { size: 11, color: 'rgba(255,255,255,0.35)', align: 'right' });
      if (this.screen !== 'press') {
        const dev = HOL.Input.promptDevice();
        G.text(ctx, dev === 'pad' ? 'Manette : ' + HOL.Input.padLabel() : 'Clavier + souris' + (HOL.Input.azerty ? ' (AZERTY)' : ''), 16, VH - 12, { size: 12, color: 'rgba(255,255,255,0.45)' });
      }
    }
  }
  HOL.Title = Title;
})();
