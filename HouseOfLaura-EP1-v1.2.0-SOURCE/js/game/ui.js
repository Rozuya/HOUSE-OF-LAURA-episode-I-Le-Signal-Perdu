/* House of Laura · interface : HUD, bannières, menus, carnet, écran titre, options, jukebox */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U, G = HOL.G;
  const VW = HOL.VIEW_W, VH = HOL.VIEW_H;
  const PINK = '#ff5fae', LIGHT = '#ffd1f2', DARK = 'rgba(14,7,26,0.92)';
  // noms affichables des zones (pour le repere de lieu en bas a gauche)
  const UI_ZONES = {
    maison: 'La Maison', quartier: 'Le Quartier', foret: 'La Forêt',
    riviere: 'La Rivière', ruines: 'Les Ruines', final: 'Le Sombre'
  };

  // Liste lisible des commandes : sert a l'ecran d'aide ET reste synchronisee
  // avec les tables reelles de js/core/input.js (KEYS / PAD).
  const ACTIONS_LABELS = [
    ['move', 'Se deplacer'], ['jump', 'Sauter'], ['interact', 'Interagir / Parler'],
    ['dash', 'Elan (dash)'], ['pulse', 'Onde'], ['grab', 'Attraper / Porter une pierre'],
    ['walk', 'Marcher lentement'],
    ['up', 'Monter (echelle)'], ['down', 'Descendre (echelle)'],
    ['pause', 'Pause'], ['journal', 'Carnet'], ['confirm', 'Valider / Avancer']
  ];
  function keyList(action) {
    const K = HOL.Input.KEYS[action] || [];
    return K.map((c) => HOL.Input.keyLabel(c));
  }
  function padList(action) {
    const P = HOL.Input.PAD[action] || [];
    const out = [];
    for (const b of P) { const g = HOL.Input.padGlyph(b); if (g && g[0] !== '?') out.push(g[0]); }
    return out;
  }

  // ------------------------------------------------------------------ liste de menu générique
  class MenuList {
    constructor(items, o) { this.items = items; this.idx = 0; this.o = o || {}; this.rects = []; this.t = 0; }
    visible() { return this.items.filter((it) => !it.hidden || !it.hidden()); }
    update(dt) {
      const I = HOL.Input;
      this.t += dt;
      const list = this.visible();
      if (!list.length) return;
      if (this.idx >= list.length) this.idx = list.length - 1;
      const move = (d) => { let n = this.idx; for (let k = 0; k < list.length; k++) { n = (n + d + list.length) % list.length; if (!list[n].disabled || !list[n].disabled()) break; } if (n !== this.idx) { this.idx = n; HOL.Audio.sfx('menu_move'); } };
      if (I.nav.up) move(-1);
      if (I.nav.down) move(1);
      const cur = list[this.idx];
      if (I.nav.left && cur.onLeft) { cur.onLeft(); HOL.Audio.sfx('menu_move'); }
      if (I.nav.right && cur.onRight) { cur.onRight(); HOL.Audio.sfx('menu_move'); }
      // souris
      this.rects.forEach((r, i) => {
        if (I.mouse.x > r.x && I.mouse.x < r.x + r.w && I.mouse.y > r.y && I.mouse.y < r.y + r.h) {
          if (I.mouse.moved && this.idx !== i && !(list[i].disabled && list[i].disabled())) { this.idx = i; HOL.Audio.sfx('menu_move'); }
          if (I.clicked(0)) {
            I.consumeClick(0);
            this.idx = i;
            const it = list[i];
            if (it.onLeft && it.onRight) { if (I.mouse.x < r.x + r.w * 0.5) it.onLeft(); else it.onRight(); HOL.Audio.sfx('menu_move'); }
            else if (it.onSelect && !(it.disabled && it.disabled())) { HOL.Audio.sfx('menu_ok'); it.onSelect(); }
          }
        }
      });
      if ((I.pressed('confirm') || I.pressed('jump')) && cur.onSelect && !(cur.disabled && cur.disabled())) {
        I.consume('confirm'); I.consume('jump'); HOL.Audio.sfx('menu_ok'); cur.onSelect();
      } else if ((I.pressed('confirm')) && cur.onRight && !cur.onSelect) { I.consume('confirm'); cur.onRight(); HOL.Audio.sfx('menu_move'); }
      if (I.pressed('cancel') && this.o.onCancel) { I.consume('cancel'); I.consume('pause'); HOL.Audio.sfx('menu_back'); this.o.onCancel(); }
    }
    draw(ctx, cx, y, w, rowH) {
      rowH = rowH || 44; w = w || 380;
      const list = this.visible();
      this.rects = [];
      list.forEach((it, i) => {
        const sel = i === this.idx;
        const x = cx - w / 2, yy = y + i * (rowH + 6);
        const dis = it.disabled && it.disabled();
        ctx.fillStyle = sel ? U.rgba(PINK, 0.92) : 'rgba(20,10,36,0.78)';
        ctx.strokeStyle = sel ? LIGHT : 'rgba(255,209,242,0.25)'; ctx.lineWidth = 2;
        G.rr(ctx, x, yy, w, rowH, 14); ctx.fill(); ctx.stroke();
        if (sel) G.glow(ctx, cx, yy + rowH / 2, w * 0.5, PINK, 0.15);
        const col = dis ? 'rgba(255,255,255,0.35)' : sel ? '#1a0e24' : '#f4ecff';
        const val = it.value ? it.value() : null;
        if (val !== null && val !== undefined) {
          G.text(ctx, it.label, x + 20, yy + rowH / 2 + 6, { size: 17, color: col });
          G.text(ctx, (it.onLeft ? '◂ ' : '') + val + (it.onRight ? ' ▸' : ''), x + w - 20, yy + rowH / 2 + 6, { size: 17, color: col, align: 'right' });
        } else G.text(ctx, it.label, cx, yy + rowH / 2 + 6, { size: 18, color: col, align: 'center' });
        this.rects.push({ x, y: yy, w, h: rowH });
      });
    }
  }
  HOL.MenuList = MenuList;

  function bar(v) { const n = Math.round(v * 10); return '■'.repeat(n) + '□'.repeat(10 - n); }

  class UI {
    constructor(game) {
      this.game = game;
      this.toasts = []; this.bannerQ = []; this.banner_ = null; this.zone = null; this.roomLabel = null;
      this.crystalT = 0; this.hpT = 0; this.objT = 0; this.tut = null; this.big = null;
      this.screen = null; // 'pause' | 'journal' | 'options' | 'confirm' | 'jukebox'
      this.journalTab = 0; this.houseIdx = 0; this.mouseOverUI = false;
      this.t = 0;
      HOL.UI = this;
      this.buildMenus();
    }
    // ------------------------------------------------------------------ messages
    toast(text) { this.toasts.push({ text, t: 0, life: 3.6 }); if (this.toasts.length > 4) this.toasts.shift(); }
    banner(title, sub, small) { this.bannerQ.push({ title, sub, small, t: 0, life: 3.8 }); }
    abilityBanner(title, sub, action) { this.bannerQ.push({ title, sub, small: 'Nouvelle capacité', action, t: 0, life: 5.5, ability: true }); }
    zoneBanner(title, sub) { this.zone = { title, sub, t: 0, life: 4.2 }; }
    roomName(name) { this.roomLabel = { name, t: 0 }; }
    crystalPing() { this.crystalT = 3; }
    hpPing() { this.hpT = 1; }
    objectiveChanged() { this.objT = 6; HOL.Audio.sfx('beep', { freq: 1000, vol: 0.5 }); }
    tutorial(list) { this.tut = { items: list.map((a) => ({ a, done: false, t: 0 })), t: 0 }; }
    bigPrompt(action, label) { this.big = action ? { action, label } : null; }

    // ------------------------------------------------------------------ mise à jour
    update(dt) {
      for (let i = this.toasts.length - 1; i >= 0; i--) { this.toasts[i].t += dt; if (this.toasts[i].t > this.toasts[i].life) this.toasts.splice(i, 1); }
      if (!this.banner_ && this.bannerQ.length) this.banner_ = this.bannerQ.shift();
      if (this.banner_) { this.banner_.t += dt; if (this.banner_.t > this.banner_.life) this.banner_ = null; }
      if (this.zone) { this.zone.t += dt; if (this.zone.t > this.zone.life) this.zone = null; }
      if (this.roomLabel) { this.roomLabel.t += dt; if (this.roomLabel.t > 3) this.roomLabel = null; }
      if (this.crystalT > 0) this.crystalT -= dt;
      if (this.hpT > 0) this.hpT -= dt;
      if (this.objT > 0) this.objT -= dt;
      if (this.tut) {
        const I = HOL.Input, b = this.game.player.body;
        for (const it of this.tut.items) {
          if (it.done) { it.t += dt; continue; }
          if (it.a === 'move' && Math.abs(b.vx) > 60) it.done = true;
          if (it.a === 'jump' && I.pressed('jump')) it.done = true;
          if (it.a === 'interact' && this.game.lastInteract) it.done = true;
        }
        this.tut.t += dt;
        if (this.tut.items.every((it) => it.done && it.t > 1) || this.tut.t > 90) this.tut = null;
      }
    }

    // ------------------------------------------------------------------ HUD
    drawHUD(ctx) {
      const g = this.game, p = g.player, save = g.save;
      if (g.hideHUD) return;
      // cœurs
      const pulse = this.hpT > 0 ? 1 + Math.sin(this.hpT * 20) * 0.1 : 1;
      for (let i = 0; i < p.maxHp; i++) {
        const x = 24 + i * 30, y = 20;
        const full = i < p.hp;
        ctx.save(); ctx.translate(x + 12, y); ctx.scale(full ? pulse : 1, full ? pulse : 1);
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; G.heart(ctx, 1.5, 2, 24); ctx.fill();
        ctx.fillStyle = full ? PINK : 'rgba(80,50,90,0.8)'; G.heart(ctx, 0, 0, 24); ctx.fill();
        ctx.strokeStyle = '#2a0a1e'; ctx.lineWidth = 1.5; ctx.stroke();
        if (full) { ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.arc(-5, 7, 2.5, 0, U.TAU); ctx.fill(); }
        ctx.restore();
      }
      if (save.settings.assist) G.text(ctx, 'mode assistance', 24, 62, { size: 11, color: 'rgba(255,209,242,0.6)' });
      // capacités
      const ab = [['djump', '#c9f0ff'], ['dash', '#6ae8ff'], ['pulse', '#5ef2d6']];
      let ax = 24;
      for (const [k, col] of ab) {
        if (!save.abilities[k]) continue;
        ctx.fillStyle = 'rgba(14,7,26,0.7)'; ctx.beginPath(); ctx.arc(ax + 12, 82, 12, 0, U.TAU); ctx.fill();
        ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
        drawAbilityIcon(ctx, k, ax + 12, 82, col, g.player.pulseCD > 0 && k === 'pulse');
        ax += 30;
      }
      // éclats de voix
      const tot = g.totalCrystals();
      const n = save.countCrystals();
      const a = this.crystalT > 0 ? Math.min(1, this.crystalT) : 0.55;
      ctx.globalAlpha = a;
      ctx.fillStyle = DARK; G.rr(ctx, VW - 150, 14, 132, 34, 17); ctx.fill();
      ctx.fillStyle = '#ff8ad8'; ctx.beginPath(); ctx.moveTo(VW - 128, 20); ctx.lineTo(VW - 120, 31); ctx.lineTo(VW - 128, 42); ctx.lineTo(VW - 136, 31); ctx.closePath(); ctx.fill();
      G.text(ctx, n + ' / ' + tot, VW - 106, 37, { size: 17, color: '#fff' });
      ctx.globalAlpha = 1;
      // objectif
      if (this.objT > 0) {
        const o = g.story.objective();
        const k = Math.min(1, this.objT, 6 - this.objT);
        ctx.globalAlpha = U.clamp(k * 2, 0, 1);
        ctx.font = 'bold 16px ' + HOL.FONT;
        const w = Math.max(ctx.measureText(o.text).width + 60, 260);
        ctx.fillStyle = DARK; G.rr(ctx, VW / 2 - w / 2, 14, w, 50, 16); ctx.fill();
        ctx.strokeStyle = U.rgba(PINK, 0.6); ctx.lineWidth = 1.5; ctx.stroke();
        G.text(ctx, 'OBJECTIF', VW / 2, 32, { size: 11, color: PINK, align: 'center' });
        G.text(ctx, o.text, VW / 2, 54, { size: 16, color: '#fff', align: 'center' });
        ctx.globalAlpha = 1;
      }
      // nom de salle
      if (this.roomLabel && !this.zone) {
        const k = Math.min(1, this.roomLabel.t * 2, (3 - this.roomLabel.t) * 2);
        ctx.globalAlpha = U.clamp(k, 0, 1);
        G.text(ctx, this.roomLabel.name, VW / 2, VH - 26, { size: 15, color: '#ffd1f2', align: 'center', shadow: 'rgba(0,0,0,0.6)' });
        ctx.globalAlpha = 1;
      }
      // lieu permanent (zone + salle) en bas a gauche : on sait toujours ou on est
      {
        const def = g.room.def;
        const zl = UI_ZONES[def.zone] || def.zone;
        ctx.globalAlpha = 0.5;
        G.text(ctx, zl, 14, VH - 26, { size: 11, color: '#ffd1f2', shadow: 'rgba(0,0,0,0.75)' });
        ctx.globalAlpha = 0.78;
        G.text(ctx, def.name, 14, VH - 11, { size: 14, color: '#ffffff', shadow: 'rgba(0,0,0,0.75)' });
        ctx.globalAlpha = 1;
      }
      // tutoriel
      if (this.tut) {
        let y = VH - 120;
        const labels = { move: 'Se déplacer', jump: 'Sauter', interact: 'Interagir / Parler' };
        for (const it of this.tut.items) {
          const alpha = it.done ? Math.max(0, 1 - it.t) : 1;
          if (alpha <= 0) continue;
          ctx.globalAlpha = alpha;
          G.prompt(ctx, 24, y, it.a === 'move' ? 'move' : it.a, labels[it.a] + (it.done ? '  ✓' : ''), { bg: DARK, size: 14 });
          ctx.globalAlpha = 1;
          y += 34;
        }
      }
      if (this.big) {
        const k = 1 + Math.sin(this.t * 6) * 0.06;
        ctx.save(); ctx.translate(VW / 2, VH - 120); ctx.scale(k, k);
        G.prompt(ctx, 0, 0, this.big.action, this.big.label, { align: 'center', bg: 'rgba(255,95,174,0.85)', size: 20, color: '#1a0e24', showAlt: true });
        ctx.restore();
      }
    }
    drawInteractPrompt(ctx, ent, label) {
      const g = this.game, cam = g.cam;
      const box = ent.interactBox ? ent.interactBox() : ent;
      const sx = (ent.cx - cam.x) * cam.zoom, sy = (box.y - cam.y) * cam.zoom - 14;
      const bob = Math.sin(this.t * 5) * 2;
      G.prompt(ctx, sx, Math.max(30, sy + bob), 'interact', label, { align: 'center', bg: DARK, size: 14 });
    }
    drawOverlays(ctx) {
      // toasts
      const dlg = this.game.dialogue;
      let ty = dlg && dlg.active && dlg.line && dlg.atTop && dlg.atTop() ? 172 : 76;
      for (const tt of this.toasts) {
        const k = Math.min(1, tt.t * 4, (tt.life - tt.t) * 2);
        ctx.globalAlpha = U.clamp(k, 0, 1);
        ctx.font = 'bold 15px ' + HOL.FONT;
        const w = ctx.measureText(tt.text).width + 36;
        ctx.fillStyle = DARK; G.rr(ctx, VW / 2 - w / 2, ty + (1 - k) * -10, w, 32, 16); ctx.fill();
        ctx.strokeStyle = U.rgba(PINK, 0.5); ctx.lineWidth = 1.2; ctx.stroke();
        G.text(ctx, tt.text, VW / 2, ty + 21 + (1 - k) * -10, { size: 15, color: '#fff', align: 'center' });
        ty += 38;
      }
      ctx.globalAlpha = 1;
      // bannière
      const b = this.banner_;
      if (b) {
        const k = U.ease.outBack(U.clamp(b.t * 3, 0, 1)) * U.clamp((b.life - b.t) * 3, 0, 1);
        ctx.save();
        ctx.globalAlpha = U.clamp(k, 0, 1);
        ctx.translate(VW / 2, VH * 0.36);
        ctx.scale(0.8 + 0.2 * k, 0.8 + 0.2 * k);
        const w = 520, h = b.ability ? 150 : 118;
        G.glow(ctx, 0, 0, 300, PINK, 0.25);
        ctx.fillStyle = 'rgba(14,7,26,0.94)'; G.rr(ctx, -w / 2, -h / 2, w, h, 22); ctx.fill();
        ctx.strokeStyle = LIGHT; ctx.lineWidth = 2.5; ctx.stroke();
        G.text(ctx, (b.small || '').toUpperCase(), 0, -h / 2 + 28, { size: 12, color: PINK, align: 'center' });
        G.text(ctx, b.title, 0, -h / 2 + 62, { size: 30, color: '#fff', align: 'center', font: HOL.FONT_TITLE, weight: '900' });
        G.text(ctx, b.sub || '', 0, -h / 2 + 90, { size: 15, color: '#e9dcff', align: 'center' });
        if (b.ability && b.action) G.prompt(ctx, 0, -h / 2 + 122, b.action, 'Essaie maintenant !', { align: 'center', size: 15, showAlt: true });
        ctx.restore();
      }
      // bannière de zone
      const z = this.zone;
      if (z) {
        const k = U.clamp(Math.min(z.t * 1.5, (z.life - z.t) * 1.5), 0, 1);
        ctx.globalAlpha = k;
        const y = VH * 0.26;
        const g2 = ctx.createLinearGradient(0, y - 60, 0, y + 50);
        g2.addColorStop(0, 'rgba(10,5,20,0)'); g2.addColorStop(0.5, 'rgba(10,5,20,0.6)'); g2.addColorStop(1, 'rgba(10,5,20,0)');
        ctx.fillStyle = g2; ctx.fillRect(0, y - 60, VW, 110);
        const lw = 220 * U.ease.outCubic(U.clamp(z.t * 1.2, 0, 1));
        ctx.fillStyle = LIGHT; ctx.fillRect(VW / 2 - lw, y + 16, lw * 2, 1.5);
        G.text(ctx, z.title, VW / 2, y + 2, { size: 40, color: '#fff', align: 'center', font: HOL.FONT_TITLE, weight: '900', shadow: 'rgba(255,95,174,0.6)', sdx: 0, sdy: 3 });
        G.text(ctx, z.sub, VW / 2, y + 42, { size: 16, color: '#ffd1f2', align: 'center' });
        ctx.globalAlpha = 1;
      }
    }

    // ------------------------------------------------------------------ menus
    buildMenus() {
      const g = this.game;
      const settings = () => g.save.settings;
      const setVol = () => { HOL.Audio.setVolumes({ master: settings().master, music: settings().music, sfx: settings().sfx }); HOL.Save.saveSettings(settings()); };
      const step = (k, d) => { settings()[k] = U.clamp(Math.round((settings()[k] + d) * 10) / 10, 0, 1); setVol(); if (k === 'sfx') HOL.Audio.sfx('collect'); };
      const cycle = (k, arr, d) => { const i = arr.indexOf(settings()[k]); settings()[k] = arr[(i + d + arr.length) % arr.length]; HOL.Save.saveSettings(settings()); this.applySettings(); };
      const tog = (k) => { settings()[k] = !settings()[k]; HOL.Save.saveSettings(settings()); this.applySettings(); };
      // Schema de commandes : Xbox / PlayStation / Clavier-Souris.
      // Change a la fois les invites affichees ET le type de manette assume
      // (glyphes corrects meme si la manette branchee est d'une autre marque).
      const PAD_TYPES = ['auto', 'xbox', 'playstation'];
      const PAD_LABELS = { xbox: 'Manette Xbox', playstation: 'Manette PlayStation', auto: 'Detection auto' };
      const setPad = (d) => {
        const i = Math.max(0, PAD_TYPES.indexOf(settings().padType));
        settings().padType = PAD_TYPES[(i + d + PAD_TYPES.length) % PAD_TYPES.length];
        settings().prompts = 'pad';
        HOL.Input.padTypeUser = settings().padType !== 'auto';
        // le choix explicite doit primer sur la detection : sans ca les symboles
        // affiches dans les invites restaient ceux de la detection automatique
        if (HOL.Input.padTypeUser) HOL.Input.padType = settings().padType;
        HOL.Save.saveSettings(settings());
        this.applySettings();
        HOL.Audio.sfx('menu_ok');
        g.ui.toast(PAD_LABELS[settings().padType]);
      };
      const LAYOUTS = ['auto', 'azerty', 'qwerty'];
      const setLayout = (d) => {
        const i = Math.max(0, LAYOUTS.indexOf(settings().keyLayout));
        settings().keyLayout = LAYOUTS[(i + d + LAYOUTS.length) % LAYOUTS.length];
        HOL.Input.layout = settings().keyLayout;
        HOL.Save.saveSettings(settings());
        HOL.Audio.sfx('menu_ok');
      };
      // Le menu des options est partage entre le titre et le menu pause : l'ecran
      // des commandes doit s'ouvrir dans LE MENU OU ON EST (le titre gere ses
      // propres ecrans, pas UI.drawScreens).
      const openControls = () => {
        HOL.Audio.sfx('menu_ok');
        // Attention : g.title.screen garde sa valeur quand on passe en jeu, donc
        // on teste aussi le mode, sinon on ouvre l'ecran dans le titre (invisible)
        // et l'ecran des commandes n'apparait pas en partie.
        if (g.mode === 'title' && g.title && g.title.screen === 'options') { g.title.screen = 'controls'; g.title.ctlLock = 0; return; }
        this.ctlLock = 0;
        this.open('controls');
      };
      this.optionsMenu = new MenuList([
        { label: 'Volume général', value: () => bar(settings().master), onLeft: () => step('master', -0.1), onRight: () => step('master', 0.1) },
        { label: 'Musique', value: () => bar(settings().music), onLeft: () => step('music', -0.1), onRight: () => step('music', 0.1) },
        { label: 'Effets sonores', value: () => bar(settings().sfx), onLeft: () => step('sfx', -0.1), onRight: () => step('sfx', 0.1) },
        { label: 'Vitesse du texte', value: () => settings().textSpeed, onLeft: () => cycle('textSpeed', ['lent', 'normal', 'rapide'], -1), onRight: () => cycle('textSpeed', ['lent', 'normal', 'rapide'], 1) },
        { label: 'Invites de touches', value: () => ({ auto: 'Auto', kbm: 'Clavier', pad: 'Manette' })[settings().prompts], onLeft: () => cycle('prompts', ['auto', 'kbm', 'pad'], -1), onRight: () => cycle('prompts', ['auto', 'kbm', 'pad'], 1) },
        { label: 'Vibrations manette', value: () => (settings().rumble ? 'Oui' : 'Non'), onLeft: () => tog('rumble'), onRight: () => tog('rumble') },
        { label: 'Tremblements d\'écran', value: () => (settings().shake ? 'Oui' : 'Non'), onLeft: () => tog('shake'), onRight: () => tog('shake') },
        { label: 'Mode assistance (aucun dégât)', value: () => (settings().assist ? 'Oui' : 'Non'), onLeft: () => tog('assist'), onRight: () => tog('assist') },
        {
          label: 'Commandes', onSelect: () => openControls(),
          value: () => ({ xbox: 'Manette Xbox', playstation: 'Manette PlayStation', auto: 'Detection auto' })[settings().padType] || 'Manette Xbox',
          onLeft: () => setPad(-1), onRight: () => setPad(1)
        },
        { label: 'Voir les commandes', onSelect: () => openControls() },
        { label: 'Plein écran', onSelect: () => g.toggleFullscreen() },
        // version affichee ici aussi : on sait toujours quel build on lance
        { label: 'Version ' + (HOL.VERSION || '?'), disabled: () => true },
        { label: 'Retour', onSelect: () => this.back() }
      ], { onCancel: () => this.back() });
      this.pauseMenu = new MenuList([
        { label: 'Reprendre', onSelect: () => this.close() },
        { label: 'Carnet', onSelect: () => this.open('journal') },
        { label: 'Appeler Tony (indice)', hidden: () => !g.save.flags.talkie || g.save.flags.ending_done, onSelect: () => { this.close(); g.callTony(); } },
        { label: 'Options', onSelect: () => this.open('options') },
        { label: 'Retour au titre', onSelect: () => { g.saveGame(); this.close(); g.toTitle(); } }
      ], { onCancel: () => this.close() });
    }
    applySettings() {
      const s = this.game.save.settings;
      HOL.Input.forced = 'pad';
      HOL.Input.rumbleOn = s.rumble;
      // schema de commandes choisi par le joueur : force les glyphes affiches
      if (s.padType === 'xbox') HOL.Input.padType = 'xbox';
      else if (s.padType === 'playstation') HOL.Input.padType = 'ps';
      // ...et on marque le choix comme explicite, sinon identifyPad() le
      // reecrasait a chaque reconnexion de la manette
      HOL.Input.padTypeUser = (s.padType === 'xbox' || s.padType === 'playstation');
    }
    open(screen) { this.prev = this.screen; this.screen = screen; if (screen === 'options') this.optionsMenu.idx = 0; }
    back() { if (this.prev && this.prev !== this.screen) { this.screen = this.prev; this.prev = null; } else this.close(); }
    close() { this.screen = null; this.prev = null; }
    get modal() { return !!this.screen; }

    updateScreens(dt) {
      const I = HOL.Input;
      if (this.screen === 'pause') this.pauseMenu.update(dt);
      else if (this.screen === 'options') this.optionsMenu.update(dt);
      else if (this.screen === 'controls') {
        const I = HOL.Input;
        // petit verrou : on ignore les entrees des premieres frames, sinon le
        // bouton qui a ouvert l'ecran le referme dans la meme frame
        this.ctlLock = (this.ctlLock || 0) + dt;
        if (this.ctlLock > 0.13 && (I.pressed('cancel') || I.pressed('pause'))) {
          I.consume('cancel'); HOL.Audio.sfx('menu_back'); this.back();
        }
      }
      else if (this.screen === 'journal') this.updateJournal(dt);
    }
    drawScreens(ctx) {
      if (!this.screen) return;
      ctx.fillStyle = 'rgba(8,4,16,0.72)'; ctx.fillRect(0, 0, VW, VH);
      if (this.screen === 'pause') {
        G.text(ctx, 'PAUSE', VW / 2, 110, { size: 44, color: '#fff', align: 'center', font: HOL.FONT_TITLE, weight: '900', shadow: 'rgba(255,95,174,0.7)', sdx: 0, sdy: 3 });
        const o = this.game.story.objective();
        G.text(ctx, 'Objectif : ' + o.text, VW / 2, 146, { size: 15, color: LIGHT, align: 'center' });
        G.text(ctx, U.fmtTime(this.game.save.time) + '  ·  ' + this.game.room.name, VW / 2, 170, { size: 13, color: 'rgba(255,255,255,0.6)', align: 'center' });
        this.pauseMenu.draw(ctx, VW / 2, 200, 360);
      } else if (this.screen === 'options') {
        G.text(ctx, 'OPTIONS', VW / 2, 70, { size: 36, color: '#fff', align: 'center', font: HOL.FONT_TITLE, weight: '900' });
        // 13 options : pitch de 31px pour que TOUT tienne dans 540px de haut
        // (avant, "Retour" etait coupee en bas de l'ecran)
        this.optionsMenu.draw(ctx, VW / 2, 86, 560, 25);
      } else if (this.screen === 'journal') this.drawJournal(ctx);
      else if (this.screen === 'controls') this.drawControls(ctx);
      this.drawNavHint(ctx);
    }
    // Ecran d'aide : la liste des commandes, avec le statut des capacites
    drawControls(ctx) {
      const I = HOL.Input;
      // fond opaque : sinon le jeu et le menu pause transparaissent derriere
      // (cet ecran est appele depuis le titre ET depuis le menu pause)
      ctx.fillStyle = '#0b0616'; ctx.fillRect(0, 0, VW, VH);
      // 3 colonnes bien separees : le texte jaune ne peut plus passer sur les touches
      const COL_A = 70, COL_M = 440, COL_S = 600;
      G.text(ctx, 'COMMANDES', VW / 2, 50, { size: 30, color: '#fff', align: 'center', font: HOL.FONT_TITLE, weight: '900' });
      const st = this.game.save.settings;
      const sub = st.padType === 'playstation' ? 'Manette PlayStation' : st.padType === 'xbox' ? 'Manette Xbox' : 'Manette (detection auto)';
      G.text(ctx, sub, VW / 2, 74, { size: 13, color: LIGHT, align: 'center' });
      G.text(ctx, 'ACTION', COL_A, 110, { size: 12, color: PINK });
      G.text(ctx, 'MANETTE', COL_M, 110, { size: 12, color: PINK, align: 'center' });
      G.text(ctx, 'STATUT', COL_S, 110, { size: 12, color: PINK });
      ctx.fillStyle = 'rgba(255,95,174,0.25)'; ctx.fillRect(58, 115, VW - 116, 1);
      const rows = ACTIONS_LABELS.slice();
      // certaines commandes n'apparaissent qu'apres un autel : on le dit clairement
      const ABIL_OF = { jump: 'djump', dash: 'dash', pulse: 'pulse' };
      const ab = this.game.save.abilities || {};
      const OU = { djump: 'verrouille · au Grand Chene', dash: 'verrouille · Galerie aux cristaux', pulse: "verrouille · coeur de l'emetteur" };
      let nbVerrous = 0;
      rows.forEach((a, i) => {
        const y = 136 + i * 27;   // 12 lignes : pas de 27px, sinon la note du bas
                                  // et la touche « retour » se chevauchent (VH=540)
        const pads = padList(a[0]);
        const need = ABIL_OF[a[0]];
        const locked = need && !ab[need];
        if (locked) nbVerrous++;
        G.text(ctx, a[1], COL_A, y, { size: 15, color: locked ? 'rgba(255,255,255,0.45)' : '#fff' });
        G.text(ctx, pads.length ? pads.join('  ') : '-', COL_M, y, { size: 15, color: LIGHT, align: 'center' });
        if (locked) G.text(ctx, OU[need], COL_S, y, { size: 11, color: 'rgba(255,209,74,0.9)' });
        else if (need) G.text(ctx, 'acquis', COL_S, y, { size: 11, color: 'rgba(94,242,214,0.85)' });
      });
      const yb = 136 + rows.length * 27 + 6;
      if (nbVerrous) {
        G.text(ctx, nbVerrous + ' commande' + (nbVerrous > 1 ? 's' : '') + ' verrouillee' + (nbVerrous > 1 ? 's' : '') + " : elles s'obtiennent en cours d'aventure.",
          COL_A, yb, { size: 12, color: 'rgba(255,209,74,0.75)' });
      }
      G.text(ctx, 'Le jeu se joue uniquement a la manette : branche-la et appuie sur un bouton pour demarrer.', VW / 2, yb + 20,
        { size: 12, color: 'rgba(255,255,255,0.55)', align: 'center' });
      const back = I.padGlyph(1)[0] + ' ou ' + I.padGlyph(9)[0] + ' : retour';
      G.text(ctx, back, VW / 2, VH - 24, { size: 14, color: PINK, align: 'center' });
    }
    // Panneau de la suite de résonances : les couleurs dans l'ordre, avec celle
    // qui sonne en surbrillance. Dessiné en dernier (voir main.js) pour qu'il
    // reste visible, et il NE s'efface pas tout seul : le joueur en a besoin
    // pendant qu'ilcourt vers les cristaux.
    drawResoHint(ctx) {
      const s = this.resoSeq;
      if (!s) return;
      // Il ne doit SURVIVRE NI à la salle NI à l'énigme. Sans ça le panneau
      // restait affiché partout, y compris après avoir ouvert le chemin.
      const st = this.game.story;
      if (s.room !== this.game.room.id || !this.game.room.findAll('resonator').length || (st && st.flag('reso_done'))) {
        this.resoSeq = null;
        return;
      }
      const n = s.colors.length, gap = 26, r = 8;
      const w = 16 + n * gap, h = 26, x = VW / 2 - w / 2, y = 66;
      // une simple pastille sombre derriere, pour rester lisible sur n'importe
      // quel fond. Pas de cadre, pas de titre, pas de lueur.
      ctx.fillStyle = 'rgba(10,6,22,0.55)';
      G.rr(ctx, x, y, w, h, h / 2); ctx.fill();
      for (let i = 0; i < n; i++) {
        const cx = x + 8 + r + i * gap, cy = y + h / 2;
        const actif = i === s.i;
        ctx.globalAlpha = i < s.i ? 0.3 : 1;
        ctx.fillStyle = s.colors[i];
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
        if (actif) {
          ctx.lineWidth = 2; ctx.strokeStyle = '#ffffff';
          ctx.beginPath(); ctx.arc(cx, cy, r + 3, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        G.text(ctx, String(i + 1), cx, cy + 3, { size: 9, color: 'rgba(0,0,0,0.6)', align: 'center' });
      }
    }
    drawNavHint(ctx) {
      const dev = HOL.Input.promptDevice();
      const txt = dev === 'pad' ? 'Croix / stick : naviguer' : 'Flèches ou souris : naviguer';
      G.prompt(ctx, VW - 20, VH - 22, 'cancel', 'Retour', { align: 'right', size: 13 });
      G.text(ctx, txt, 20, VH - 16, { size: 12, color: 'rgba(255,255,255,0.5)' });
    }

    // ------------------------------------------------------------------ carnet
    updateJournal(dt) {
      const I = HOL.Input;
      const tabs = 4;
      if (I.nav.left || (I.padBtn[4] && !this._lb)) { this.journalTab = (this.journalTab + tabs - 1) % tabs; HOL.Audio.sfx('menu_move'); }
      if (I.nav.right || (I.padBtn[5] && !this._rb)) { this.journalTab = (this.journalTab + 1) % tabs; HOL.Audio.sfx('menu_move'); }
      this._lb = I.padBtn[4]; this._rb = I.padBtn[5];
      if (this.journalTab === 2) {
        if (I.nav.up) this.houseIdx = (this.houseIdx + 13 - 5) % 13;
        if (I.nav.down) this.houseIdx = (this.houseIdx + 5) % 13;
      }
      // onglets à la souris
      if (this.tabRects) this.tabRects.forEach((r, i) => {
        if (I.clicked(0) && I.mouse.x > r.x && I.mouse.x < r.x + r.w && I.mouse.y > r.y && I.mouse.y < r.y + r.h) { I.consumeClick(0); this.journalTab = i; HOL.Audio.sfx('menu_move'); }
      });
      if (this.houseRects && this.journalTab === 2) this.houseRects.forEach((r, i) => {
        if (I.mouse.moved && I.mouse.x > r.x && I.mouse.x < r.x + r.w && I.mouse.y > r.y && I.mouse.y < r.y + r.h) this.houseIdx = i;
      });
      if (this.tonyRect && this.journalTab === 0 && I.clicked(0)) {
        const r = this.tonyRect;
        if (I.mouse.x > r.x && I.mouse.x < r.x + r.w && I.mouse.y > r.y && I.mouse.y < r.y + r.h) { I.consumeClick(0); this.close(); this.game.callTony(); return; }
      }
      if (this.journalTab === 0 && I.pressed('interact') && this.game.save.flags.talkie) { I.consume('interact'); this.close(); this.game.callTony(); return; }
      if (I.pressed('cancel') || I.pressed('journal') || I.pressed('pause')) { I.consume('cancel'); I.consume('journal'); I.consume('pause'); HOL.Audio.sfx('menu_back'); this.back(); }
    }
    drawJournal(ctx) {
      const g = this.game, save = g.save;
      const x0 = 60, y0 = 44, w = VW - 120, h = VH - 100;
      ctx.fillStyle = 'rgba(24,12,40,0.96)'; G.rr(ctx, x0, y0, w, h, 24); ctx.fill();
      ctx.strokeStyle = U.rgba(PINK, 0.6); ctx.lineWidth = 2; ctx.stroke();
      const tabs = ['Objectifs', 'Collection', 'La House', 'Commandes'];
      this.tabRects = [];
      const tw = 170;
      tabs.forEach((tn, i) => {
        const tx = VW / 2 - (tabs.length * tw) / 2 + i * tw;
        const sel = i === this.journalTab;
        ctx.fillStyle = sel ? PINK : 'rgba(255,255,255,0.06)';
        G.rr(ctx, tx + 6, y0 + 14, tw - 12, 34, 17); ctx.fill();
        G.text(ctx, tn, tx + tw / 2, y0 + 37, { size: 16, color: sel ? '#1a0e24' : '#f4ecff', align: 'center' });
        this.tabRects.push({ x: tx + 6, y: y0 + 14, w: tw - 12, h: 34 });
      });
      const dev = HOL.Input.promptDevice();
      if (dev === 'pad') { G.text(ctx, 'LB', VW / 2 - (tabs.length * tw) / 2 - 20, y0 + 37, { size: 13, color: '#aaa', align: 'center' }); G.text(ctx, 'RB', VW / 2 + (tabs.length * tw) / 2 + 20, y0 + 37, { size: 13, color: '#aaa', align: 'center' }); }
      const cx = x0 + 40, cy = y0 + 80;
      this.tonyRect = null;
      if (this.journalTab === 0) {
        const o = g.story.objective();
        G.text(ctx, 'OBJECTIF PRINCIPAL', cx, cy, { size: 12, color: PINK });
        G.text(ctx, o.text, cx, cy + 26, { size: 21, color: '#fff' });
        if (save.flags.talkie && !save.flags.ending_done) {
          const r = { x: cx, y: cy + 42, w: 300, h: 34 };
          ctx.fillStyle = 'rgba(79,179,255,0.18)'; G.rr(ctx, r.x, r.y, r.w, r.h, 12); ctx.fill();
          ctx.strokeStyle = '#4fb3ff'; ctx.lineWidth = 1.5; ctx.stroke();
          G.prompt(ctx, r.x + 10, r.y + 17, 'interact', 'Appeler Tony au talkie (indice)', { size: 14 });
          this.tonyRect = r;
        }
        G.text(ctx, 'QUÊTES DE LA HOUSE', cx, cy + 110, { size: 12, color: PINK });
        const q = g.story.sideQuests();
        if (!q.length) G.text(ctx, 'Reconnecte des membres de la House pour découvrir leurs demandes.', cx, cy + 136, { size: 15, color: 'rgba(255,255,255,0.6)' });
        q.forEach((it, i) => {
          const y = cy + 140 + i * 50;
          ctx.fillStyle = it.done ? '#5fe07a' : '#ffd14a';
          ctx.beginPath(); ctx.arc(cx + 8, y - 5, 6, 0, U.TAU); ctx.fill();
          G.text(ctx, it.text + (it.done ? '  ✓' : ''), cx + 24, y, { size: 16, color: it.done ? 'rgba(255,255,255,0.55)' : '#fff' });
          if (!it.done) G.text(ctx, it.sub, cx + 24, y + 20, { size: 13, color: 'rgba(255,209,242,0.75)' });
        });
      } else if (this.journalTab === 1) {
        G.text(ctx, 'ÉCLATS DE VOIX PAR ZONE', cx, cy, { size: 12, color: PINK });
        const zones = g.crystalsByZone();
        const names = { maison: 'La Maison', quartier: 'Le Quartier', foret: 'La Forêt', riviere: 'Rivière et grottes', ruines: 'Les Ruines', final: 'Le Cœur du Silence' };
        Object.keys(names).forEach((z, i) => {
          const d = zones[z] || { n: 0, tot: 0 };
          const y = cy + 30 + i * 30;
          const visited = save.flags['zone_' + z];
          G.text(ctx, visited ? names[z] : '???', cx, y, { size: 16, color: '#fff' });
          const bw = 180, bx = cx + 200;
          ctx.fillStyle = 'rgba(255,255,255,0.08)'; G.rr(ctx, bx, y - 12, bw, 12, 6); ctx.fill();
          ctx.fillStyle = d.n >= d.tot && d.tot ? '#5fe07a' : '#ff8ad8'; G.rr(ctx, bx, y - 12, bw * (d.tot ? d.n / d.tot : 0), 12, 6); ctx.fill();
          G.text(ctx, d.n + ' / ' + d.tot, bx + bw + 14, y, { size: 14, color: '#ffd1f2' });
        });
        const rx = x0 + w / 2 + 60;
        G.text(ctx, 'POLAROÏDS DE COCOL_', rx, cy, { size: 12, color: PINK });
        Object.keys(HOL.Story.POLAROIDS).forEach((k, i) => {
          const px = rx + (i % 3) * 92, py = cy + 18 + Math.floor(i / 3) * 104;
          const got = save.polaroids[k];
          ctx.fillStyle = got ? '#fbf7ee' : 'rgba(255,255,255,0.08)'; G.rr(ctx, px, py, 76, 90, 4); ctx.fill();
          if (got) {
            const gr = ctx.createLinearGradient(0, py + 6, 0, py + 62); gr.addColorStop(0, ['#ff9ad0', '#ffd14a', '#9ae6ff', '#5ef2d6', '#c38aff', '#ff8a5a'][i]); gr.addColorStop(1, '#5a3a8a');
            ctx.fillStyle = gr; ctx.fillRect(px + 6, py + 6, 64, 56);
            ctx.fillStyle = '#2a1838'; ctx.font = 'bold 9px ' + HOL.FONT; ctx.textAlign = 'center';
            U.wrap(ctx, HOL.Story.POLAROIDS[k], 66).slice(0, 2).forEach((l, j) => ctx.fillText(l, px + 38, py + 73 + j * 10));
          } else G.text(ctx, '?', px + 38, py + 52, { size: 28, color: 'rgba(255,255,255,0.3)', align: 'center' });
        });
        const by = cy + 250;
        G.text(ctx, 'CAPACITÉS', cx, by, { size: 12, color: PINK });
        let i = 0;
        for (const k of ['djump', 'dash', 'pulse']) {
          const A = HOL.Story.ABILITIES[k];
          const got = save.abilities[k];
          const y = by + 26 + i * 26;
          if (got) G.prompt(ctx, cx, y - 5, A.action === 'jump' ? 'jump' : A.action, A.name + (k === 'djump' ? ' (2× en l\'air)' : ''), { size: 14, showAlt: true });
          else G.text(ctx, '??? (pas encore découvert)', cx, y, { size: 14, color: 'rgba(255,255,255,0.4)' });
          i++;
        }
        G.text(ctx, 'Temps de jeu : ' + U.fmtTime(save.time) + '   ·   Cœurs : ' + g.player.maxHp + '   ·   Membres reconnectés : ' + save.countReconnected() + ' / 13', cx, y0 + h - 22, { size: 13, color: 'rgba(255,255,255,0.65)' });
      } else if (this.journalTab === 2) {
        this.houseRects = [];
        const ids = HOL.Chars.HOUSE;
        ids.forEach((id, i) => {
          const col = i % 5, row = Math.floor(i / 5);
          const px = cx + 20 + col * 100, py = cy + 10 + row * 118;
          const rec = save.reconnected[id];
          const sel = i === this.houseIdx;
          ctx.fillStyle = sel ? U.rgba(HOL.Chars.INFO[id].color, 0.35) : 'rgba(255,255,255,0.05)';
          G.rr(ctx, px - 6, py - 6, 88, 108, 14); ctx.fill();
          if (sel) { ctx.strokeStyle = HOL.Chars.INFO[id].color; ctx.lineWidth = 2; ctx.stroke(); }
          ctx.save(); ctx.beginPath(); G.rr(ctx, px, py, 76, 76, 12); ctx.clip();
          ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(px, py, 76, 76);
          if (rec) HOL.Chars.drawPortrait(ctx, id, px + 38, py + 46, 84, sel ? 'happy' : 'neutral', this.t, false, 1, 0);
          else { HOL.Chars.drawPortrait(ctx, id, px + 38, py + 46, 84, 'tired', this.t, false, 1, 1); ctx.fillStyle = 'rgba(20,14,30,0.55)'; ctx.fillRect(px, py, 76, 76); }
          ctx.restore();
          G.text(ctx, rec ? HOL.Chars.INFO[id].name : '???', px + 38, py + 94, { size: 13, color: rec ? '#fff' : 'rgba(255,255,255,0.4)', align: 'center' });
          this.houseRects.push({ x: px - 6, y: py - 6, w: 88, h: 108 });
        });
        const id = ids[this.houseIdx];
        const bx = cx + 540;
        const rec = save.reconnected[id];
        G.text(ctx, rec ? HOL.Chars.INFO[id].name : 'Membre inconnu', bx, cy + 30, { size: 22, color: rec ? HOL.Chars.INFO[id].color : '#aaa' });
        ctx.font = 'bold 14px ' + HOL.FONT;
        const txt = rec ? HOL.Chars.INFO[id].bio : 'Une voix de la House, perdue quelque part dans le silence. Continue d\'explorer pour la retrouver.';
        U.wrap(ctx, txt, 220).forEach((l, j) => G.text(ctx, l, bx, cy + 62 + j * 22, { size: 14, color: '#e9dcff' }));
        G.text(ctx, save.countReconnected() + ' / 13 membres reconnectés', bx, cy + 330, { size: 14, color: PINK });
      } else if (this.journalTab === 3) {
        const rows = [['Se déplacer', 'move'], ['Sauter / Saut Plume', 'jump'], ['Interagir / Parler', 'interact'], ['Élan', 'dash'], ['Onde', 'pulse'], ['Carnet', 'journal'], ['Pause', 'pause']];
        const I = HOL.Input;
        G.text(ctx, 'CLAVIER + SOURIS', cx + 40, cy, { size: 12, color: PINK });
        G.text(ctx, 'MANETTE', cx + 460, cy, { size: 12, color: PINK });
        const saveForced = I.forced;
        rows.forEach(([label, a], i) => {
          const y = cy + 40 + i * 42;
          G.text(ctx, label, cx + 40, y + 5, { size: 16, color: '#fff' });
          I.forced = 'kbm'; G.prompt(ctx, cx + 250, y, a, null, { size: 14 });
          const alt = a === 'pulse' ? 'Clic gauche' : a === 'dash' ? 'Clic droit' : a === 'move' ? 'ou flèches' : a === 'jump' ? 'ou K' : null;
          if (alt) G.text(ctx, alt, cx + 320, y + 5, { size: 13, color: 'rgba(255,255,255,0.6)' });
          I.forced = 'pad'; G.prompt(ctx, cx + 470, y, a, null, { size: 14 });
          const palt = a === 'pulse' ? 'ou LB / LT' : a === 'dash' ? 'ou RB / RT' : a === 'move' ? 'stick ou croix' : null;
          if (palt) G.text(ctx, palt, cx + 540, y + 5, { size: 13, color: 'rgba(255,255,255,0.6)' });
        });
        I.forced = saveForced;
        G.text(ctx, 'Maintiens Ctrl (ou incline légèrement le stick) pour marcher. Bas + Saut : descendre d\'une plateforme.', cx + 40, y0 + h - 44, { size: 13, color: 'rgba(255,255,255,0.65)' });
        G.text(ctx, 'Tu peux passer du clavier à la manette à tout moment : les invites s\'adaptent toutes seules.', cx + 40, y0 + h - 22, { size: 13, color: 'rgba(255,255,255,0.65)' });
      }
    }
  }

  function drawAbilityIcon(ctx, k, x, y, col, cd) {
    ctx.save(); ctx.translate(x, y);
    ctx.globalAlpha = cd ? 0.4 : 1;
    ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 1.8;
    if (k === 'djump') { ctx.beginPath(); ctx.moveTo(0, -7); ctx.quadraticCurveTo(5, 0, 0, 7); ctx.quadraticCurveTo(-3, 0, 0, -7); ctx.fill(); }
    else if (k === 'dash') { ctx.beginPath(); ctx.moveTo(-6, -4); ctx.lineTo(2, -4); ctx.lineTo(2, -7); ctx.lineTo(7, 0); ctx.lineTo(2, 7); ctx.lineTo(2, 4); ctx.lineTo(-6, 4); ctx.closePath(); ctx.fill(); }
    else { for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, 2 + i * 3, 0, U.TAU); ctx.stroke(); } }
    ctx.restore();
  }
  HOL.UIClass = UI;
})();
