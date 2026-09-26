/* House of Laura · boîte de dialogue (portraits, expressions, machine à écrire, choix) */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U, G = HOL.G;
  const VW = HOL.VIEW_W, VH = HOL.VIEW_H;

  // Réactions en jeu de Laura selon l'expression
  const REACT = { happy: 'happy', laugh: 'laugh', surprised: 'surprised', sad: 'sad', determined: 'determined', think: 'think', worried: 'worried', wink: 'wave', shy: 'sad', angry: 'determined' };

  class Dialogue {
    constructor(game) {
      this.game = game;
      this.active = false;
      this.line = null; this.shown = 0; this.t = 0; this.done = false; this.finished = false;
      this.choiceIdx = 0; this.result = null;
      this.segments = []; this.total = 0;
      this.appear = 0; this.blipAcc = 0;
    }
    open(line) {
      this.active = true; this.line = line; this.shown = 0; this.t = 0; this.finished = false; this.result = null;
      this.choiceIdx = 0; this.appear = this.appear > 0.5 ? this.appear : 0;
      this.segments = parse(line.text || '', HOL.Chars.INFO[line.who] ? HOL.Chars.INFO[line.who].color : '#ffd28a');
      this.total = this.segments.reduce((a, s) => a + s.text.length, 0);
      this.pauseT = 0;
      const game = this.game;
      // réaction en jeu
      if (line.who === 'laura' && line.expr && REACT[line.expr] && !line.noReact) game.player.setAnim(REACT[line.expr], 1.2);
      if (line.who === 'laura') game.player.faceOverride = mapFace(line.expr);
      const npc = game.room && game.room.find(line.who);
      if (npc && npc.type === 'npc' && line.anim) npc.setAnim(line.anim);
      HOL.Audio.duck(true);
    }
    close() {
      this.active = false; this.line = null;
      this.game.player.faceOverride = null;
      HOL.Audio.duck(false);
    }
    speed() { const s = this.game.save.settings.textSpeed; return s === 'lent' ? 28 : s === 'rapide' ? 90 : 50; }
    update(dt) {
      if (!this.active) return;
      const I = HOL.Input, game = this.game, L = this.line;
      this.t += dt;
      this.appear = Math.min(1, this.appear + dt * 6);
      const advance = I.pressed('confirm') || I.pressed('jump') || I.pressed('interact') || (I.clicked(0));
      if (advance) { I.consume('confirm'); I.consume('jump'); I.consume('interact'); I.consumeClick(0); }
      if (this.shown < this.total) {
        if (this.pauseT > 0) this.pauseT -= dt;
        else {
          const before = Math.floor(this.shown);
          this.shown = Math.min(this.total, this.shown + dt * this.speed());
          const now = Math.floor(this.shown);
          if (now !== before) {
            const ch = charAt(this.segments, now - 1);
            if (ch === '.' || ch === '!' || ch === '?') this.pauseT = 0.18;
            else if (ch === ',') this.pauseT = 0.08;
            this.blipAcc += now - before;
            if (this.blipAcc >= 2 && ch !== ' ') {
              this.blipAcc = 0;
              const info = HOL.Chars.INFO[L.who] || { voice: 500 };
              if (L.style !== 'sign' && L.style !== 'narration') HOL.Audio.sfx(L.who === 'echo' ? 'beep' : 'blip', { freq: info.voice, wave: info.wave, vol: L.who === 'echo' ? 0.4 : 1 });
            }
          }
          // animation de parole
          if (L.who === 'laura') game.player.talking = 0.15;
          else if (L.who === 'echo') game.player.echo.talking = 0.15;
          else { const npc = game.room && game.room.find(L.who); if (npc && npc.type === 'npc') npc.talking = 0.15; }
        }
        if (advance && this.t > 0.12) this.shown = this.total;
        return;
      }
      // texte complet
      if (L.choices) {
        if (I.nav.up) { this.choiceIdx = (this.choiceIdx + L.choices.length - 1) % L.choices.length; HOL.Audio.sfx('menu_move'); }
        if (I.nav.down) { this.choiceIdx = (this.choiceIdx + 1) % L.choices.length; HOL.Audio.sfx('menu_move'); }
        // souris
        if (this.choiceRects) {
          this.choiceRects.forEach((r, i) => {
            if (I.mouse.x > r.x && I.mouse.x < r.x + r.w && I.mouse.y > r.y && I.mouse.y < r.y + r.h) {
              if (I.mouse.moved && this.choiceIdx !== i) { this.choiceIdx = i; HOL.Audio.sfx('menu_move'); }
            }
          });
        }
        if (advance && this.t > 0.2) {
          HOL.Audio.sfx('menu_ok');
          this.result = this.choiceIdx;
          this.finished = true;
        }
        return;
      }
      if ((advance && this.t > 0.15) || (L.auto && this.t > L.auto)) {
        this.finished = true;
      }
    }
    draw(ctx) {
      if (!this.active) return;
      const L = this.line, game = this.game;
      const a = U.ease.outCubic(this.appear);
      const style = L.style || 'normal';
      const info = HOL.Chars.INFO[L.who] || { name: L.who, color: '#ffd28a' };
      const leftSide = L.who === 'laura' || L.who === 'echo' || L.side === 'left';
      const top = this.atTop();
      const bx = 40, bw = VW - 80, bh = 140, by = top ? 18 - (1 - a) * 30 : VH - bh - 18 + (1 - a) * 30;
      ctx.save();
      ctx.globalAlpha = a;
      if (style === 'narration') {
        ctx.fillStyle = 'rgba(8,4,16,0.78)';
        G.rr(ctx, 120, VH / 2 - 70, VW - 240, 140, 16); ctx.fill();
        this.drawText(ctx, 150, VH / 2 - 30, VW - 300, '#f4ecff', 'center');
        this.drawNext(ctx, VW / 2, VH / 2 + 56);
        ctx.restore();
        return;
      }
      const portrait = style !== 'sign' && L.who !== 'chat';
      // portrait
      const px = leftSide ? bx + 88 : bx + bw - 88, py = top ? by + bh + 38 : by - 38;
      if (portrait) {
        ctx.save();
        const psize = 176;
        // halo coloré
        G.glow(ctx, px, py + 10, 110, info.color, 0.3);
        ctx.fillStyle = 'rgba(12,6,24,0.88)';
        ctx.strokeStyle = U.rgba(info.color, 0.9); ctx.lineWidth = 3;
        G.rr(ctx, px - 78, py - 84, 156, 168, 22); ctx.fill(); ctx.stroke();
        ctx.beginPath(); G.rr(ctx, px - 76, py - 82, 152, 164, 20); ctx.clip();
        const bg = ctx.createLinearGradient(0, py - 84, 0, py + 84);
        bg.addColorStop(0, U.rgba(info.color, 0.35)); bg.addColorStop(1, 'rgba(20,10,35,0.2)');
        ctx.fillStyle = bg; ctx.fillRect(px - 80, py - 90, 160, 180);
        const talking = this.shown < this.total && this.pauseT <= 0;
        const gray = (L.who !== 'laura' && L.who !== 'echo' && HOL.Chars.LOOKS[L.who] && !game.save.reconnected[L.who] && !L.color) ? 1 : 0;
        HOL.Chars.drawPortrait(ctx, L.who, px, py + 14, psize, L.expr || 'neutral', game.time, talking, leftSide ? 1 : -1, gray);
        if (style === 'radio') { G.staticNoise(ctx, px - 80, py - 90, 160, 180, 0.18, game.time); }
        ctx.restore();
      }
      // boîte
      ctx.fillStyle = 'rgba(14,7,26,0.9)';
      ctx.strokeStyle = style === 'sign' ? 'rgba(255,220,160,0.7)' : U.rgba(info.color, 0.75); ctx.lineWidth = 2.5;
      G.rr(ctx, bx, by, bw, bh, 18); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; G.rr(ctx, bx + 4, by + 4, bw - 8, 36, 14); ctx.fill();
      // nom
      const name = L.name || (style === 'sign' ? (L.title || '') : info.name);
      const tx = portrait ? (leftSide ? bx + 190 : bx + 28) : bx + 28;
      const tw = portrait ? bw - 220 : bw - 56;
      if (name) {
        ctx.font = 'bold 17px ' + HOL.FONT;
        const nw = ctx.measureText(name).width + 28;
        const nx = portrait ? (leftSide ? tx - 6 : bx + bw - 190 - nw + 6) : tx - 6;
        ctx.fillStyle = style === 'sign' ? '#c8a060' : info.color;
        const ny = top ? by + bh - 14 : by - 16;
        G.rr(ctx, nx, ny, nw, 30, 15); ctx.fill();
        G.text(ctx, name, nx + nw / 2, ny + 21, { size: 17, color: '#1a0e24', align: 'center' });
      }
      this.drawText(ctx, tx, by + (top ? 38 : 44), tw, style === 'sign' ? '#fff3dc' : '#f7efff');
      if (this.shown >= this.total) {
        if (L.choices) this.drawChoices(ctx, bx, by, bw, info, top, bh);
        else this.drawNext(ctx, bx + bw - 30, by + bh - 20);
      }
      ctx.restore();
    }
    drawText(ctx, x, y, w, color, align) {
      const L = this.line;
      const size = 20;
      ctx.font = (L.style === 'thought' ? 'italic ' : '') + 'bold ' + size + 'px ' + HOL.FONT;
      // mise en page mot à mot, révélée caractère par caractère
      const words = [];
      for (const s of this.segments) {
        const parts = s.text.split(/(\s+)/);
        for (const p of parts) if (p.length) words.push({ text: p, color: s.color || color });
      }
      let cx = 0, cy = 0, count = 0;
      const lines = [[]];
      for (const wd of words) {
        const ww = ctx.measureText(wd.text).width;
        if (wd.text.indexOf('\n') >= 0) { lines.push([]); cx = 0; count += wd.text.length; continue; }
        if (cx + ww > w && /\S/.test(wd.text) && cx > 0) { lines.push([]); cx = 0; }
        if (cx === 0 && !/\S/.test(wd.text)) { count += wd.text.length; continue; }
        lines[lines.length - 1].push({ text: wd.text, color: wd.color, x: cx, start: count });
        cx += ww; count += wd.text.length;
      }
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'left';
      for (let li = 0; li < lines.length; li++) {
        const ln = lines[li];
        let lw = 0; if (ln.length) { const last = ln[ln.length - 1]; lw = last.x + ctx.measureText(last.text).width; }
        const ox = align === 'center' ? x + (w - lw) / 2 : x;
        for (const wd of ln) {
          const vis = Math.max(0, Math.min(wd.text.length, Math.floor(this.shown) - wd.start));
          if (vis <= 0) continue;
          const txt = wd.text.substr(0, vis);
          ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillText(txt, ox + wd.x + 1.5, y + li * 27 + 2);
          ctx.fillStyle = wd.color; ctx.fillText(txt, ox + wd.x, y + li * 27);
        }
      }
    }
    drawNext(ctx, x, y) {
      const b = Math.sin(this.game.time * 6) * 3;
      const pr = HOL.Input.prompt('confirm');
      if (HOL.Input.promptDevice() === 'pad') { G.keycap(ctx, x - 12, y + b * 0.3, pr, 18); return; }
      ctx.fillStyle = '#ffd1f2';
      ctx.beginPath(); ctx.moveTo(x - 8, y - 5 + b); ctx.lineTo(x + 8, y - 5 + b); ctx.lineTo(x, y + 5 + b); ctx.closePath(); ctx.fill();
    }
    atTop() {
      const g = this.game;
      if (!g.room || this.line.style === 'narration') return false;
      if (this.topLock !== undefined && this.topT > 0) return this.topLock;
      const p = g.player;
      let sy = p.feetY - g.cam.y;
      const npc = g.room.find(this.line.who);
      if (npc && npc.type === 'npc') sy = Math.max(sy, npc.y + npc.h - g.cam.y);
      return sy > VH - 180;
    }
    drawChoices(ctx, bx, by, bw, info, top, bh) {
      const L = this.line;
      const n = L.choices.length;
      const cw = 380, ch = 38;
      const cx = VW / 2 - cw / 2, cy0 = top ? by + bh + 22 : by - 22 - n * (ch + 8);
      this.choiceRects = [];
      for (let i = 0; i < n; i++) {
        const y = cy0 + i * (ch + 8);
        const sel = i === this.choiceIdx;
        ctx.fillStyle = sel ? U.rgba('#ff5fae', 0.9) : 'rgba(14,7,26,0.9)';
        ctx.strokeStyle = sel ? '#ffd1f2' : 'rgba(255,209,242,0.4)'; ctx.lineWidth = 2;
        G.rr(ctx, cx, y, cw, ch, 12); ctx.fill(); ctx.stroke();
        G.text(ctx, (sel ? '▸ ' : '') + L.choices[i], VW / 2, y + 25, { size: 17, color: sel ? '#1a0e24' : '#f4ecff', align: 'center' });
        this.choiceRects.push({ x: cx, y, w: cw, h: ch });
      }
    }
  }

  function mapFace(expr) {
    const m = { happy: 'happy', laugh: 'laugh', surprised: 'surprised', sad: 'sad', worried: 'worried', determined: 'determined', angry: 'determined', wink: 'happy', shy: 'happy', think: 'neutral', tired: 'sad' };
    return m[expr] || null;
  }
  // [[mot]] = mis en couleur
  function parse(text, hl) {
    const out = [];
    const re = /\[\[(.+?)\]\]/g;
    let last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) out.push({ text: text.slice(last, m.index) });
      out.push({ text: m[1], color: hl });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ text: text.slice(last) });
    return out;
  }
  function charAt(segs, i) {
    for (const s of segs) { if (i < s.text.length) return s.text[i]; i -= s.text.length; }
    return '';
  }
  HOL.Dialogue = Dialogue;
})();
