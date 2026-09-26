/* House of Laura · combat final : LE SILENCE */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U, G = HOL.G, T = HOL.T;
  const Ent = HOL.E.Ent;
  const FLOOR = 14 * T;

  class Boss extends Ent {
    constructor(room, d) {
      super(room, d);
      this.bx = d.x * T + 16; this.by = d.y * T;
      this.x = this.bx; this.y = this.by; this.w = 0; this.h = 0;
      const g = room.game;
      // BUG CRITIQUE : x_sommet n'a AUCUNE sortie. Si boss_done est pose mais pas
      // ending_done (fin interrompue : pause -> retour au titre), le boss passait
      // en 'gone' : salle vide, invisible, sans porte => partie non terminable.
      this.state = g.flag('boss_done') ? (g.flag('ending_done') ? 'gone' : 'final') : 'wait';
      this.freed = room.persist.orbs || 0;
      this.atkT = 2.5; this.attacks = 0; this.proj = []; this.orb = null;
      this.appear = this.state === 'gone' ? 0 : 0; this.hit = 0; this.voices = []; this.dissolve = 0; this.veilleur = 0;
      this.handL = { x: this.bx - 160, y: this.by + 150 }; this.handR = { x: this.bx + 160, y: this.by + 150 };
      this.sweep = null;
    }
    get phase() { return this.freed + 1; }
    onRespawn(game) {
      if (this._waveTO) { clearTimeout(this._waveTO); this._waveTO = null; }
      this.proj.length = 0; this.sweep = null; this.orb = null;
      // 'intro' / 'transition' / 'final' etaient des culs-de-sac : rien ne pouvait
      // les faire sortir, le joueur restait verrouille dans l'arene.
      if (this.state !== 'gone') {
        if (this.freed >= 3) {
          if (!game.flag('boss_done')) { this.state = 'final'; game.cutscene.run(this.finalScene()); return; }
          this.state = game.flag('ending_done') ? 'gone' : 'final';
        } else {
          this.state = 'fight'; this.attacks = 0; this.atkT = 1.5; this.appear = 1;
        }
      }
      this.atkT = 2.5; this.attacks = 0;
      this.room.entities.forEach((e) => { if (e.type === 'enemy') e.dead = true; });
    }
    update(dt, game) {
      this.t += dt;
      if (this.hit > 0) this.hit -= dt;
      const p = game.player;
      if (this.state === 'gone') return;
      if (this.state === 'final') {
        // fin jamais vue (interrompue) : on la relance au lieu de laisser
        // le joueur dans une salle sans aucune sortie
        if (!game.cutscene.active && game.fadeA < 0.2 && !game.ui.modal) { game.cutscene.run(this.finalScene()); }
        return;
      }
      if (this.state === 'wait') {
        if (!game.cutscene.active && game.fadeA < 0.2) { this.state = 'intro'; game.cutscene.run(this.introScene()); }
        return;
      }
      if (this.state === 'intro') { this.appear = Math.min(1, this.appear + dt * 0.5); return; }
      this.appear = Math.min(1, this.appear + dt);
      // lumière
      game.lights.push({ x: this.bx, y: this.by + 60, r: 260, color: '#9d88ff', a: 0.5 });
      // projectiles
      this.updateProj(dt, game);
      if (this.state === 'fight') {
        this.atkT -= dt;
        const need = [3, 3, 4][Math.min(2, this.freed)];
        if (this.atkT <= 0 && !this.sweep) {
          if (this.attacks >= need) { this.exposeOrb(game); }
          else { this.attack(game); this.attacks++; this.atkT = [2.3, 1.9, 1.6][Math.min(2, this.freed)]; }
        }
      } else if (this.state === 'orb') {
        const o = this.orb;
        o.t += dt;
        // déplacement de la sphère
        if (o.mode === 'low') { o.x = U.damp(o.x, this.bx + Math.sin(o.t * 0.8) * 120, 2, dt); o.y = U.damp(o.y, FLOOR - 70, 2, dt); }
        else if (o.mode === 'side') { o.x = U.damp(o.x, o.side < 0 ? 5.5 * T : 24.5 * T, 2, dt); o.y = U.damp(o.y, 8 * T + Math.sin(o.t * 2) * 12, 2, dt); }
        else { const a = o.t * 0.7; o.x = U.damp(o.x, this.bx + Math.cos(a) * 250, 3, dt); o.y = U.damp(o.y, 7 * T + Math.sin(a * 2) * 70, 3, dt); }
        game.lights.push({ x: o.x, y: o.y, r: 120, color: o.color, a: 0.9 });
        if (o.t > 2 && Math.random() < dt * 0.5 && this.freed >= 1) this.attack(game, 'rain');
        if (o.t > 11) { this.orb = null; this.state = 'fight'; this.attacks = 0; this.atkT = 1.2; game.ui.toast('La sphère est repartie… Recommence !'); }
      }
      // mains qui suivent
      const hy = this.by + 150 + Math.sin(this.t * 1.3) * 10;
      if (!this.sweep) {
        this.handL.x = U.damp(this.handL.x, this.bx - 170, 3, dt); this.handL.y = U.damp(this.handL.y, hy, 3, dt);
        this.handR.x = U.damp(this.handR.x, this.bx + 170, 3, dt); this.handR.y = U.damp(this.handR.y, hy, 3, dt);
      } else {
        const s = this.sweep;
        s.t += dt;
        const hand = s.side < 0 ? this.handL : this.handR;
        if (s.t < 0.9) { hand.x = U.damp(hand.x, s.side < 0 ? 2 * T : 28 * T, 5, dt); hand.y = U.damp(hand.y, FLOOR - 62, 5, dt); }
        else {
          hand.x += -s.side * 520 * dt; hand.y = FLOOR - 62;
          this.hurtBox(game, hand.x - 34, hand.y - 22, 68, 44);
          if ((s.side < 0 && hand.x > 28 * T) || (s.side > 0 && hand.x < 2 * T)) this.sweep = null;
        }
      }
    }
    hurtBox(game, x, y, w, h) {
      const b = game.player.body, p = game.player;
      if (p.dead || b.dashT > 0 || p.invuln > 0) return;
      if (b.x < x + w && b.x + b.w > x && b.y < y + h && b.y + b.h > y) p.hurt(1, x + w / 2);
    }
    attack(game, force) {
      const ph = this.freed;
      const opts = ph === 0 ? ['wave', 'rain'] : ph === 1 ? ['wave', 'rain', 'sweep', 'minions'] : ['wave', 'rain', 'sweep', 'wave2'];
      let a = force || U.pick(opts);
      if (a === 'minions' && this.room.entities.filter((e) => e.type === 'enemy' && !e.dead).length > 1) a = 'rain';
      HOL.Audio.sfx('static', { dur: 0.3, vol: 0.8 });
      if (a === 'wave' || a === 'wave2') {
        const side = Math.random() < 0.5 ? -1 : 1;
        this.spawnWave(side);
        if (a === 'wave2') { clearTimeout(this._waveTO); this._waveTO = setTimeout(() => { this._waveTO = null; this.spawnWave(-side); }, 700); }
        game.shake(3, 0.3);
      } else if (a === 'rain') {
        const n = 4 + ph;
        const px = game.player.cx;
        for (let i = 0; i < n; i++) {
          const x = i === 0 ? px : U.rand(3 * T, 27 * T);
          this.proj.push({ k: 'mark', x, y: FLOOR, t: 0, delay: 0.9 + i * 0.12 });
        }
      } else if (a === 'sweep') {
        this.sweep = { side: game.player.cx < this.bx ? 1 : -1, t: 0 };
        HOL.Audio.sfx('whoosh');
      } else if (a === 'minions') {
        for (const sx of [4, 25]) {
          const e = this.room.add({ type: 'enemy', kind: 'crawler', x: sx, y: 13, range: 6 });
          if (e) game.particles.burst(e.cx, e.cy, 12, { speed: [30, 100], life: [0.5, 1], size: [4, 8], color: 'rgba(120,110,150,0.5)', kind: 'smoke' });
        }
      }
    }
    spawnWave(side) {
      this.proj.push({ k: 'wave', x: side < 0 ? 2 * T : 28 * T, y: FLOOR, vx: side < 0 ? 330 : -330, t: 0 });
    }
    updateProj(dt, game) {
      for (let i = this.proj.length - 1; i >= 0; i--) {
        const q = this.proj[i];
        q.t += dt;
        if (q.k === 'wave') {
          q.x += q.vx * dt;
          this.hurtBox(game, q.x - 16, q.y - 30, 32, 30);
          if (Math.random() < 0.6) game.particles.emit({ x: q.x, y: q.y - U.rand(0, 26), vx: [-20, 20], vy: [-80, -20], life: [0.3, 0.6], size: [1, 2.5], color: ['#e0d0ff', '#9d88ff'], kind: 'square' });
          if (q.x < 2 * T - 10 || q.x > 28 * T + 10) this.proj.splice(i, 1);
        } else if (q.k === 'mark') {
          if (q.t >= q.delay) { this.proj[i] = { k: 'shard', x: q.x, y: 30, vy: 200, t: 0 }; }
        } else if (q.k === 'shard') {
          q.vy += 1400 * dt; q.y += q.vy * dt;
          this.hurtBox(game, q.x - 9, q.y - 20, 18, 26);
          if (q.y >= FLOOR - 4) {
            game.particles.burst(q.x, FLOOR - 4, 10, { speed: [40, 160], angle: [Math.PI + 0.3, U.TAU - 0.3], life: [0.3, 0.6], size: [1.5, 3], color: ['#e0d0ff', '#ffffff'], kind: 'shard', grav: 600, vr: [-6, 6] });
            HOL.Audio.sfx('crumble', { vol: 0.5 });
            this.proj.splice(i, 1);
          }
        }
      }
    }
    exposeOrb(game) {
      const cols = ['#ff8ad8', '#5ef2d6', '#ffd14a'];
      const mode = ['low', 'side', 'circle'][Math.min(2, this.freed)];
      this.orb = { x: this.bx, y: this.by + 40, t: 0, mode, side: game.player.cx < this.bx ? 1 : -1, color: cols[this.freed % 3] };
      this.state = 'orb';
      HOL.Audio.sfx('crystal', { note: 76 + this.freed * 3 });
      if (!game.flag('orb_tip')) {
        game.setFlag('orb_tip');
        game.story.quickSay('echo', 'UNE SPHÈRE DE VOIX ! APPROCHE-TOI ET LIBÈRE L\'ONDE !');
      } else game.ui.toast('Une sphère de voix ! Utilise l\'Onde près d\'elle.');
    }
    onPulse(game, px, py, r) {
      if (this.state !== 'orb' || !this.orb) return;
      const o = this.orb;
      if (U.dist(px, py, o.x, o.y) > r + 30) return;
      // libérée !
      this.freed++;
      this.room.persist.orbs = this.freed;
      this.hit = 0.6;
      HOL.Audio.sfx('boss_hit');
      game.shake(10, 0.8); game.flash(o.color, 0.4);
      HOL.Input.rumble(1, 1, 400);
      game.particles.burst(o.x, o.y, 50, { speed: [80, 360], life: [0.6, 1.4], size: [2, 6], color: [o.color, '#ffffff'], kind: 'star', drag: 2 });
      game.particles.emit({ x: o.x, y: o.y, size: 10, size1: 200, life: 0.8, kind: 'ring', color: o.color });
      this.orb = null; this.proj.length = 0; this.sweep = null;
      this.room.entities.forEach((e) => { if (e.type === 'enemy') e.kill(game); });
      if (this.freed >= 3) { this.state = 'final'; game.cutscene.run(this.finalScene()); }
      else { this.state = 'transition'; game.cutscene.run(this.orbScene(this.freed)); }
    }

    // ------------------------------------------------------------------ scènes
    introScene() {
      const boss = this;
      return function* (g, C) {
        yield C.call(() => { g.setFlag('ascension_done'); HOL.Audio.stopMusic(1.5); });
        yield C.wait(0.8);
        yield C.call(() => { HOL.Audio.sfx('thunder'); g.shake(8, 2); boss.room.state.lightning = 1; });
        yield C.cam(15 * T, 7 * T, 1.5);
        yield C.until(() => boss.appear >= 1, 3);
        yield C.say('silence', '…POURQUOI… VENIR… ICI…', null);
        yield C.say('laura', 'Pour te parler.', 'determined');
        yield C.say('silence', 'PERSONNE… NE PARLE… PERSONNE… N\'ÉCOUTE…', null);
        yield C.say('silence', 'TOUTES CES VOIX… JE LES GARDE… ELLES NE PARTIRONT PLUS… JAMAIS…', null);
        yield C.say('echo', 'LAURA, REGARDE : LES VOIX QU\'IL A VOLÉES. TROIS SPHÈRES. QUAND ELLES DESCENDENT, LIBÈRE-LES AVEC L\'ONDE !');
        yield C.say('laura', 'Tiens bon, la House. J\'arrive.', 'determined');
        yield C.camReset(0.4);
        yield C.music('climax', 0.8);
        yield C.call(() => { boss.state = 'fight'; boss.atkT = 1.5; g.saveGame(); });
      };
    }
    orbScene(n) {
      const boss = this;
      return function* (g, C) {
        const members = HOL.Chars.HOUSE.filter((id) => g.save.reconnected[id]);
        const who = n === 1 ? 'tony' : (members[(n * 5) % Math.max(1, members.length)] || 'tony');
        yield C.say(who, HOL.Story.VOICES[who], 'determined', { auto: 2.2 });
        if (n === 1) yield C.say('silence', 'NON… RENDS-LA… RENDS-LA MOI…', null, { auto: 2.2 });
        else yield C.say('silence', 'ASSEZ ! ASSEZ DE BRUIT !', null, { auto: 2 });
        yield C.call(() => { boss.state = 'fight'; boss.attacks = 0; boss.atkT = 1.2; });
      };
    }
    finalScene() {
      const boss = this;
      return function* (g, C) {
        yield C.call(() => { HOL.Audio.stopMusic(2); g.shake(6, 2); });
        yield C.wait(1.2);
        yield C.cam(15 * T, 8 * T, 1);
        yield C.say('silence', '…RENDS-LES… MOI… JE NE VEUX PLUS… ÊTRE SEUL…', null);
        yield C.say('laura', 'Tu n\'es pas seul. Tu ne l\'as jamais été.', 'sad');
        yield C.say('laura', 'Tu as juste arrêté d\'entendre ceux qui t\'écoutaient encore.', 'sad');
        yield C.say('laura', 'Alors écoute-les, maintenant.', 'determined');
        yield C.music('fin', 3);
        const members = HOL.Chars.HOUSE.filter((id) => g.save.reconnected[id]);
        for (const id of members) {
          yield C.call(() => { boss.voices.push({ id, t: 0 }); HOL.Audio.sfx('reconnect', { vol: 0.6 }); });
          yield C.say(id, HOL.Story.VOICES[id], 'happy', { auto: 1.9 });
        }
        if (members.length < 13) yield C.say('echo', 'ET TOUTES LES AUTRES VOIX, QUELQUE PART, QUI ATTENDENT ENCORE. ELLES SONT AVEC TOI AUSSI.');
        yield C.say('echo', 'LAURA. TOUTES LES VOIX SONT AVEC TOI. UNE DERNIÈRE ONDE.');
        yield C.call(() => { boss.waitPulse = true; g.ui.bigPrompt('pulse', 'Libérer l\'Onde'); });
        yield C.until((g) => HOL.Input.pressed('pulse') || HOL.Input.clicked(0) || HOL.Input.pressed('confirm'), 60);
        yield C.call(() => {
          boss.waitPulse = false; g.ui.bigPrompt(null);
          g.player.setAnim('pulse', 2);
          HOL.Audio.sfx('pulse', { vol: 1.5 }); HOL.Audio.sfx('ability');
          g.shake(14, 2); HOL.Input.rumble(1, 1, 1200);
          for (let i = 0; i < 4; i++) g.particles.emit({ x: g.player.echo.x, y: g.player.echo.y, size: 10, size1: 700 + i * 200, life: 1.2 + i * 0.3, kind: 'ring', color: ['#ff8ad8', '#5ef2d6', '#ffd14a', '#ffffff'][i] });
          g.particles.burst(boss.bx, boss.by + 60, 120, { speed: [100, 500], life: [1, 2.2], size: [2, 6], color: ['#ff8ad8', '#5ef2d6', '#ffd14a', '#b388ff', '#ffffff'], kind: 'star', drag: 1.5 });
        });
        yield C.until(() => { boss.dissolve = Math.min(1, boss.dissolve + 0.012); g.flashA = Math.max(g.flashA, boss.dissolve * 0.9); return boss.dissolve >= 1; }, 5);
        yield C.call(() => { boss.room.state.dawn = 1; boss.room.state.lightning = 0; boss.veilleur = 0.01; g.setFlag('boss_done'); });
        yield C.wait(1.5);
        yield C.until(() => { boss.veilleur = Math.min(1, boss.veilleur + 0.01); return boss.veilleur >= 1; }, 4);
        yield C.say('veilleur', '…Quelle drôle de lumière. On dirait le matin.', 'neutral');
        yield C.say('veilleur', 'Tu as une belle voix, Laura. Et une drôle de famille.', 'neutral');
        yield C.say('laura', 'La House. Elle t\'aurait plu. Enfin… elle va te plaire.', 'happy');
        yield C.say('veilleur', 'J\'ai parlé dans le vide si longtemps. J\'ai cru que le monde avait oublié comment écouter.', 'neutral');
        yield C.say('laura', 'Ce soir, on fait un stream. Toute la House sera là. Et il y aura une place pour toi.', 'happy');
        yield C.say('veilleur', '…Une place pour moi.', 'neutral');
        yield C.say('veilleur', 'Alors garde mon Écho, veux-tu ? Il a encore beaucoup de choses à entendre.', 'neutral');
        yield C.call(() => { HOL.Audio.sfx('ability'); g.flash('#ffffff', 0.6); boss.veilleurFade = true; g.particles.burst(boss.bx, boss.by + 60, 60, { speed: [40, 200], life: [1, 2], size: [2, 5], color: ['#c9b8ff', '#ffffff'], kind: 'star', drag: 1 }); });
        yield C.until(() => { boss.veilleur = Math.max(0, boss.veilleur - 0.012); return boss.veilleur <= 0; }, 4);
        yield C.echoTo(g.player.cx, g.player.body.y - 40);
        yield C.wait(0.8);
        yield C.say('echo', '…LAURA. JE L\'ENTENDS. IL EST EN PAIX. IL DIT… MERCI.');
        yield C.say('laura', 'Allez. On rentre à la maison.', 'happy');
        yield C.echoTo(null);
        yield C.fade(1, 2.5);
        yield C.call(() => { boss.state = 'gone'; g.startEnding(); });
      };
    }

    // ------------------------------------------------------------------ rendu
    draw(ctx, game) {
      if (this.state === 'gone' && this.veilleur <= 0) return;
      const t = this.t;
      // projectiles
      for (const q of this.proj) {
        if (q.k === 'wave') {
          ctx.fillStyle = 'rgba(40,30,70,0.85)';
          ctx.beginPath(); ctx.moveTo(q.x - 18, q.y); ctx.quadraticCurveTo(q.x, q.y - 50 - Math.sin(t * 20) * 6, q.x + 18, q.y); ctx.fill();
          G.glow(ctx, q.x, q.y - 16, 40, '#9d88ff', 0.6);
          ctx.strokeStyle = '#e0d0ff'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let k = -16; k <= 16; k += 4) ctx.lineTo(q.x + k, q.y - 10 - Math.random() * 30); ctx.stroke();
        } else if (q.k === 'mark') {
          const a = 0.4 + 0.4 * Math.sin(q.t * 20);
          ctx.fillStyle = 'rgba(255,90,120,' + a + ')'; ctx.beginPath(); ctx.ellipse(q.x, q.y - 2, 16, 5, 0, 0, U.TAU); ctx.fill();
          ctx.strokeStyle = 'rgba(255,90,120,' + a * 0.5 + ')'; ctx.lineWidth = 1; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(q.x, 40); ctx.lineTo(q.x, q.y); ctx.stroke(); ctx.setLineDash([]);
        } else if (q.k === 'shard') {
          ctx.fillStyle = '#e8dcff'; ctx.strokeStyle = '#6a5a9a'; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(q.x, q.y + 8); ctx.lineTo(q.x - 7, q.y - 16); ctx.lineTo(q.x + 7, q.y - 16); ctx.closePath(); ctx.fill(); ctx.stroke();
          G.glow(ctx, q.x, q.y - 4, 24, '#b9a3ff', 0.5);
        }
      }
      if (this.appear <= 0 && this.veilleur <= 0) return;
      const a = this.appear * (1 - this.dissolve);
      const x = this.bx, y = this.by + Math.sin(t * 0.9) * 8;
      if (a > 0.01) {
        ctx.save();
        ctx.globalAlpha = a;
        const sc = 1 - this.freed * 0.08 + (this.hit > 0 ? Math.sin(this.hit * 40) * 0.03 : 0);
        // bras (vrilles vers les mains)
        for (const h of [this.handL, this.handR]) {
          ctx.strokeStyle = 'rgba(24,16,40,0.9)'; ctx.lineWidth = 16 * sc; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(x + (h.x < x ? -60 : 60) * sc, y + 70 * sc);
          ctx.quadraticCurveTo((x + h.x) / 2, y + 170 + Math.sin(t * 2 + h.x) * 20, h.x, h.y); ctx.stroke();
          drawHand(ctx, h.x, h.y, t, h.x < x ? -1 : 1);
        }
        // corps de brume
        ctx.fillStyle = 'rgba(18,12,30,0.95)';
        ctx.beginPath();
        const R = 120 * sc;
        for (let i = 0; i <= 40; i++) {
          const ang = (i / 40) * U.TAU;
          let r = R + Math.sin(ang * 5 + t * 2) * 10 + Math.sin(ang * 9 - t * 3) * 6;
          let px = Math.cos(ang) * r * 1.05, py = Math.sin(ang) * r * 0.9;
          if (py > 40) py = 40 + (py - 40) * 1.8 + Math.sin(ang * 12 + t * 4) * 10;
          if (i === 0) ctx.moveTo(x + px, y + 40 + py); else ctx.lineTo(x + px, y + 40 + py);
        }
        ctx.fill();
        // capuche
        ctx.fillStyle = 'rgba(40,28,64,0.95)';
        ctx.beginPath(); ctx.moveTo(x - 80 * sc, y + 30); ctx.quadraticCurveTo(x - 90 * sc, y - 90 * sc, x, y - 110 * sc); ctx.quadraticCurveTo(x + 90 * sc, y - 90 * sc, x + 80 * sc, y + 30); ctx.quadraticCurveTo(x, y - 10, x - 80 * sc, y + 30); ctx.fill();
        // masque
        ctx.save();
        ctx.beginPath(); ctx.ellipse(x, y - 30 * sc, 46 * sc, 58 * sc, 0, 0, U.TAU); ctx.clip();
        ctx.fillStyle = '#e8e2f2'; ctx.fillRect(x - 60, y - 100, 120, 140);
        G.staticNoise(ctx, x - 60, y - 100, 120, 140, 0.28, t);
        ctx.restore();
        ctx.strokeStyle = '#1b1022'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x, y - 30 * sc, 46 * sc, 58 * sc, 0, 0, U.TAU); ctx.stroke();
        // yeux
        const eo = this.hit > 0 ? 1.4 : 1;
        ctx.fillStyle = '#120a1e';
        ctx.beginPath(); ctx.ellipse(x - 18 * sc, y - 36 * sc, 11 * sc, 6 * sc * eo, -0.25, 0, U.TAU); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + 18 * sc, y - 36 * sc, 11 * sc, 6 * sc * eo, 0.25, 0, U.TAU); ctx.fill();
        G.glow(ctx, x - 18 * sc, y - 36 * sc, 26, '#b9a3ff', 0.9); G.glow(ctx, x + 18 * sc, y - 36 * sc, 26, '#b9a3ff', 0.9);
        ctx.fillStyle = '#f2ecff'; ctx.beginPath(); ctx.arc(x - 18 * sc, y - 36 * sc, 2.5, 0, U.TAU); ctx.arc(x + 18 * sc, y - 36 * sc, 2.5, 0, U.TAU); ctx.fill();
        // bouche grésillante
        ctx.strokeStyle = '#3a2a5a'; ctx.lineWidth = 2; ctx.beginPath();
        for (let k = -20; k <= 20; k += 4) ctx.lineTo(x + k * sc, y - 4 * sc + (Math.random() - 0.5) * 6);
        ctx.stroke();
        // sphères orbitales restantes
        const remain = 3 - this.freed - (this.orb ? 1 : 0);
        const cols = ['#ff8ad8', '#5ef2d6', '#ffd14a'];
        for (let i = 0; i < remain; i++) {
          const ang = t * 0.9 + (i / Math.max(1, remain)) * U.TAU;
          const ox = x + Math.cos(ang) * 150 * sc, oy = y + 20 + Math.sin(ang) * 40 * sc;
          drawOrb(ctx, ox, oy, cols[(this.freed + i + (this.orb ? 1 : 0)) % 3], t, 0.7);
        }
        ctx.restore();
      }
      if (this.orb) drawOrb(ctx, this.orb.x, this.orb.y, this.orb.color, t, 1, true);
      // voix de la House (scène finale)
      if (this.voices.length) {
        const cx = game.player.cx, cy = game.player.cy - 20;
        this.voices.forEach((v, i) => {
          v.t += 1 / 60;
          const n = this.voices.length;
          const ang = (i / Math.max(n, 1)) * U.TAU + t * 0.3;
          const r = 170 + Math.sin(t + i) * 10;
          const px = cx + Math.cos(ang) * r, py = cy + Math.sin(ang) * r * 0.55;
          const k = U.clamp(v.t * 2, 0, 1);
          ctx.globalAlpha = k * (1 - this.dissolve * 0.7);
          const col = HOL.Chars.INFO[v.id].color;
          G.glow(ctx, px, py, 40, col, 0.6);
          ctx.save(); ctx.beginPath(); ctx.arc(px, py, 22, 0, U.TAU); ctx.fillStyle = 'rgba(14,7,26,0.8)'; ctx.fill(); ctx.clip();
          HOL.Chars.drawPortrait(ctx, v.id, px, py + 6, 52, 'happy', t, false, 1, 0);
          ctx.restore();
          ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(px, py, 22, 0, U.TAU); ctx.stroke();
          ctx.globalAlpha = 1;
        });
      }
      // le Veilleur apaisé
      if (this.veilleur > 0) {
        const vx = this.bx, vy = FLOOR;
        ctx.save();
        ctx.globalAlpha = this.veilleur * (0.75 + 0.25 * Math.sin(t * 5) * Math.sin(t * 1.3));
        G.glow(ctx, vx, vy - 60, 160, '#fff0c8', 0.6);
        ctx.fillStyle = 'rgba(255,244,220,0.85)'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(vx, vy - 88, 13, 0, U.TAU); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(vx - 20, vy); ctx.quadraticCurveTo(vx - 22, vy - 50, vx - 14, vy - 72); ctx.lineTo(vx + 14, vy - 72); ctx.quadraticCurveTo(vx + 22, vy - 50, vx + 20, vy); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(vx, vy - 90, 17, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,244,220,0.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(vx + 16, vy - 60); ctx.lineTo(vx + 28, vy - 30); ctx.lineTo(vx + 30, vy); ctx.stroke();
        ctx.restore();
      }
    }
  }
  function drawHand(ctx, x, y, t, dir) {
    ctx.fillStyle = 'rgba(24,16,40,0.95)';
    ctx.beginPath(); ctx.ellipse(x, y, 30, 22, 0, 0, U.TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(24,16,40,0.95)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(x + i * 9, y + 10); ctx.quadraticCurveTo(x + i * 12, y + 30, x + i * 10 + Math.sin(t * 3 + i) * 4, y + 42); ctx.stroke(); }
    G.glow(ctx, x, y, 40, '#9d88ff', 0.3);
  }
  function drawOrb(ctx, x, y, col, t, s, big) {
    const r = (big ? 18 : 12) * s * (1 + Math.sin(t * 5) * 0.08);
    G.glow(ctx, x, y, r * 4, col, big ? 0.8 : 0.5);
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, col); g.addColorStop(1, U.shade(col, -0.4));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, U.TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(20,10,40,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r + 3 + Math.sin(t * 8) * 2, 0, U.TAU); ctx.stroke();
    if (big) { ctx.strokeStyle = U.rgba(col, 0.6); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r + 14 + ((t * 30) % 20), 0, U.TAU); ctx.stroke(); }
  }
  HOL.E.types.boss = Boss;
  Boss.prototype.type = 'boss';
})();
