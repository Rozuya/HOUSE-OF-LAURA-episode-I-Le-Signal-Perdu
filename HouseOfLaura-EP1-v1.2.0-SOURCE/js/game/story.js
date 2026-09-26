/* House of Laura · HISTOIRE
 * Drapeaux, objectifs, dialogues des personnages, énigmes et scènes scriptées.
 * Tous les textes du jeu sont ici : modifie-les librement pour coller à la vraie House.
 */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U, T = HOL.T;

  const S = HOL.Story = {};
  S.POLAROIDS = {
    p1: 'Le tout premier stream',
    p2: 'La soirée karaoké',
    p3: 'Le fou rire de minuit',
    p4: 'La nuit des records',
    p5: 'Le premier raid',
    p6: 'Toute la House réunie'
  };
  S.ITEMS = {
    fusible: { name: 'Fusible', desc: 'Le fusible principal du tableau électrique.' },
    manivelle: { name: 'Manivelle', desc: 'Elle s\'adapte à la vanne de remplissage des écluses.' },
    cassette: { name: 'Cassette turquoise', desc: 'La cassette préférée de K974. Tous les sons de la House.' },
    piment: { name: 'Piment des bois', desc: 'Pour Tacos. Il pique rien qu\'à le regarder.' },
    menthe: { name: 'Menthe sauvage', desc: 'Pour Tacos. Elle sent la fraîcheur de la rivière.' },
    sel: { name: 'Sel de cristal', desc: 'Pour Tacos. Il scintille comme la galerie.' }
  };
  S.ABILITIES = {
    djump: { name: 'Saut Plume', desc: 'Appuie une seconde fois sur Saut en plein vol.', action: 'jump' },
    dash: { name: 'Élan', desc: 'Fonce droit devant. Brise les parois fissurées et traverse les ombres.', action: 'dash' },
    pulse: { name: 'Onde', desc: 'Libère la voix d\'Écho : révèle les plateformes cachées et dissipe le Silence.', action: 'pulse' }
  };
  S.VOICES = {
    tony: 'Laura ! On est tous là, derrière toi !',
    keeli: 'Vas-y Laura ! Pixel et moi, on croit en toi !',
    cocol: 'Souris, Laura ! C\'est la plus belle photo de l\'année !',
    misterflo: 'Tenez bon, chère Laura. Le quartier vous attend.',
    tacos: 'Le Tacos Suprême t\'attend à la maison !',
    charly: 'Rends-lui ses couleurs, Laura !',
    k974: 'Monte le son, Laura ! Monte le son !',
    omas: 'Tu m\'as sauvé dans la forêt. À toi de le sauver, lui !',
    drulysf: 'Le Chêne t\'écoute. Le monde entier t\'écoute.',
    sylvain: 'Nage à contre-courant, Laura. Comme toujours !',
    ofire: 'Rallume la lumière, Laura !',
    andyblct: 'Aucune carte ne menait ici. Toi, tu y es arrivée !',
    brazya: 'La House compte sur toi. Traverse, Laura !'
  };
  const ZONES = {
    maison: ['LA MAISON', 'Zone 1'], quartier: ['LE QUARTIER', 'Zone 2'], foret: ['LA FORÊT DES MURMURES', 'Zone 3'],
    riviere: ['LA RIVIÈRE ET LES GROTTES', 'Zone 4'], ruines: ['LES RUINES DE L\'ANTENNE', 'Zone 5'], final: ['LE CŒUR DU SILENCE', 'Zone 6']
  };
  S.ZONES = ZONES;
  const RESO_SEQS = [[0, 1, 2], [2, 1, 3, 0], [1, 3, 2, 0, 3]];

  class Story {
    constructor(game) { this.game = game; this.riding = false; }
    get save() { return this.game.save; }
    flag(n) { return !!this.save.flags[n]; }
    set(n, v) { this.save.flags[n] = v === undefined ? true : v; }
    rec(id) { return !!this.save.reconnected[id]; }
    item(n) { return !!this.save.items[n]; }
    abil(n) { return !!this.save.abilities[n]; }

    cond(expr) {
      if (!expr) return true;
      if (expr === 'true') return true;
      if (expr === 'false') return false;
      if (expr.indexOf('|') >= 0) return expr.split('|').some((e) => this.cond(e));
      if (expr.indexOf('&') >= 0) return expr.split('&').every((e) => this.cond(e));
      expr = expr.trim();
      if (expr[0] === '!') return !this.cond(expr.slice(1));
      const i = expr.indexOf(':');
      if (i > 0) {
        const k = expr.slice(0, i), v = expr.slice(i + 1);
        if (k === 'item') return this.item(v);
        if (k === 'abil') return this.abil(v);
        if (k === 'rec') return this.rec(v);
        if (k === 'water') {
          const room = this.game.room;
          const w = room && room.entities.find((e) => e.type === 'water');
          return !!w && w.level === v && Math.abs(w.surf - w.levels[v]) < 4;
        }
      }
      return !!this.save.flags[expr];
    }

    // ------------------------------------------------------------------ couleurs du monde
    zoneGray(zone) {
      if (this.flag('ending_done')) return 0;
      switch (zone) {
        case 'quartier': return this.flag('lamps_done') ? 0.3 : 0.78;
        case 'foret': return this.abil('djump') ? 0.22 : 0.55;
        case 'riviere': return this.abil('dash') ? 0.15 : 0.45;
        case 'ruines': return 0.08;
        default: return 0;
      }
    }
    windowGray() { return this.flag('intro_done') && !this.flag('ending_done') ? 0.8 : 0; }

    // ------------------------------------------------------------------ objectifs + indices (talkie de Tony)
    // Chaque entrée peut porter une 4e valeur : un { salle : indice } qui
    // REMPLACE l'indice general quand tu te trouves dans cette salle.
    // Sans ca Tony repetait le chemin que tu venais de faire : il te disait
    // "le salon est a droite de ta chambre" alors que tu etais deja dans le
    // salon, et "monte sur le bac" alors que tu etais sur le sentier, 2 salles
    // plus loin. Un indice doit parler de la salle ou tu es.
    // (indices verifies salle par salle contre le contenu reel des niveaux)
    objective() {
      const f = (n) => this.flag(n), it = (n) => this.item(n), ab = (n) => this.abil(n);
      const R = (this.game.room && this.game.room.id) || '';
      const L = [
        [!f('intro_done'), 'Lancer le stream', "Assieds-toi devant l'écran : le stream démarre tout seul.", {
          m_chambre: "Assieds-toi devant l'écran, en haut de la chambre. Le stream démarre tout seul."
        }],
        [!f('met_tony'), 'Rejoindre Tony au salon', 'Le salon est juste à droite de ta chambre.', {
          m_salon: 'Tony est là, devant la télé. Parle-lui : c’est lui qui sait ce qu’il se passe.'
        }],
        [!it('fusible') && !f('power_on'), 'Trouver un fusible dans la caisse à outils du garage', "L'échelle de droite du garage monte sur l'étagère haute. La caisse à outils rouge est dessus.", {
          m_salon: "L'échelle au fond du salon, à droite, descend au garage.",
          m_garage: "L'échelle à droite de la pièce monte sur l'étagère haute. La caisse à outils rouge est dessus.",
          m_grenier: "Le fusible est dans le garage : redescends par l'échelle du salon, tout à droite."
        }],
        [!f('power_on'), 'Réparer le tableau électrique du garage', "J'ai scotché une note à côté du tableau : 1 en haut, 2 et 3 en bas, 4 en haut. Ensuite, le gros levier rouge.", {
          m_salon: "Le tableau électrique est dans le garage, en bas de l'échelle du salon."
        }],
        [!f('left_house'), 'Sortir dans le quartier', "La porte d'entrée est tout au bout du salon, à droite.", {
          m_garage: "Remonte par l'échelle du garage. La porte de la maison est au bout du salon, à droite."
        }],
        [!this.rec('misterflo'), 'Chercher de l’aide sur la place du quartier', 'MisterFlo est sur la place. Parle-lui, et parle aussi aux gens figés : ton Écho peut les réveiller.', {
          q_rue: "Suis la rue vers la droite jusqu'à la place. Parle aux gens figés : ton Écho peut les réveiller.",
          q_place: 'MisterFlo est là, devant son kiosque à droite. Parle-lui. Les lampadaires de la place comptent aussi.'
        }],
        [!f('mural_seen'), 'Trouver Charly, dans la ruelle derrière l’arche', "L'arche est sur l'esplanade de la place. Passe dessous : Charly peint une fresque dans la ruelle.", {
          q_place: "L'arche est sur l'esplanade, près du lampadaire à l'étoile. Passe dessous : Charly peint dans la ruelle.",
          q_ruelle: "Charly est là. Regarde sa fresque : l'ordre pour les lampadaires de la place est dessus."
        }],
        [!f('lamps_done'), 'Allumer les lampadaires de la place dans l’ordre de la fresque', "Étoile, note, lune, cœur. L'étoile est sur la fontaine, la lune et le cœur au sol, la note tout à droite.", {
          q_place: "Étoile, note, lune, cœur. L'étoile est sur la fontaine, au milieu. La lune est à gauche, le cœur à droite. La note est tout à droite : il faut sauter pour l'atteindre.",
          q_ruelle: "L'ordre est sur ma fresque : étoile, note, lune, cœur. Ensuite, retour sur la place pour les allumer dans cet ordre.",
          q_toits: "Les lampadaires, c'est sur la place, en bas. L'ordre est étoile, note, lune, cœur."
        }],
        [!f('omas_saved') && !f('stones_done'), 'Traverser la forêt des Murmures', 'Saute sur les Grisailles rampantes pour les dissiper. Omas est plus loin, dans le sous-bois.', {
          q_place: "Le parc est à droite de la place. C'est là que commence la forêt des Murmures.",
          q_parc: "Traverse le parc vers la droite. La lisière de la forêt est au bout.",
          f_lisiere: "Les Grisailles rampantes se dissipent si tu leur sautes dessus. Omas est plus loin, à droite.",
          f_sousbois: "Omas est là, à droite, entouré de deux Grisailles. Saute dessus pour les dissiper, puis parle-lui."
        }],
        [!f('stones_done'), 'Ouvrir le passage des racines dans la clairière', "Prends une pierre, pose-la sur une dalle. Il y en a trois à poser. Le totem à gauche remet tout à zéro.", {
          f_sousbois: "Le passage des racines est dans la clairière, à droite.",
          f_clairiere: "RB attrape la pierre devant toi, RB encore la repose. Trois pierres, trois dalles. Une pierre portée dans le vide tombe toute seule, c'est normal. Le totem à gauche remet tout à zéro."
        }],
        [!ab('djump'), 'Rencontrer le gardien du Grand Chêne', "Drulysf médite au pied du Grand Chêne. Parle-lui, puis touche l'autel.", {
          f_clairiere: "Drulysf t'attend au Grand Chêne, de l'autre côté des racines.",
          f_chene: "Drulysf médite au pied du Grand Chêne. Parle-lui, puis touche l'autel.",
          f_sortie: "Il te faut le Saut Plume : retourne au Grand Chêne, à gauche."
        }],
        [!f('chase1_done'), 'Quitter la forêt par les branches du Grand Chêne', "Avec le Saut Plume, grimpe les branches à droite du Chêne pour sortir de la forêt.", {
          f_chene: "Avec le Saut Plume, grimpe les branches à droite du Chêne pour monter dans la canopée.",
          f_canopee: "Traverse la canopée vers la droite, puis redescends. La sortie de la forêt est en bas à droite.",
          f_sortie: "Cours ! Tout droit vers la droite, ne te retourne pas. La rivière est la sortie."
        }],
        [!f('flamme'), 'Trouver l’entrée de la grotte derrière la cascade', "Traverse la rivière à la nage. L'entrée de la grotte est derrière la cascade, en haut.", {
          f_sortie: "Descends vers la berge, à droite de la forêt.",
          r_berge: "Nage jusqu'à la cascade, en face. L'entrée de la grotte est derrière l'eau, en haut.",
          r_cascade: "L'entrée de la grotte est en haut, derrière le rideau d'eau. Cherche la corniche."
        }],
        [!f('ecluses_done'), 'Remettre les écluses en marche', "Vide le bassin avec le levier du pilier, récupère la manivelle dans le sas, remets l'eau à mi-hauteur avec le levier, puis ouvre la vanne de l'autre côté.", {
          g_entree: "Les écluses sont au bout du couloir, à droite. Une plaque t'y explique quoi faire.",
          g_ecluses: "Vide le bassin avec le levier du pilier, récupère la manivelle dans le sas, remets l'eau à mi-hauteur avec le levier, puis ouvre la vanne de l'autre côté.",
          g_machinerie: "La manivelle est ici, à gauche. Ramène-la à l'écluse, au bout du couloir."
        }],
        [!ab('dash'), 'Explorer la galerie aux cristaux', "L'autel de la galerie donne l'Élan. Il est sur une corniche, à gauche du milieu.", {
          g_ecluses: "La galerie aux cristaux est à droite, au bout de l'écluse.",
          g_galerie: "L'autel est sur une corniche, à gauche du milieu de la galerie. Écho a l'air de l'entendre chanter."
        }],
        [!f('cable_done'), 'Réparer le câble du bac de Brazya', "Le treuil est en haut du rocher, à gauche du bac. Deux doubles sauts et c'est gagné.", {
          g_galerie: "La sortie est à droite de la galerie. Brazya t'attend au bord de la rivière.",
          r_passeur: "Le treuil est en haut du rocher, à gauche du bac. Deux doubles sauts et c'est gagné."
        }],
        [!f('ferry_done'), 'Traverser la rivière avec le bac', "Monte sur le bac, Brazya s'occupe du reste.", {
          r_passeur: "Monte sur le bac, Brazya s'occupe du reste.",
          a_sentier: "Tu es passé ! Le sentier monte vers la station radio, à droite."
        }],
        [!f('archives_seen'), 'Monter jusqu’à la station radio de la colline', "Le studio du Veilleur est au bout du hall de la station.", {
          a_sentier: "Le hall de la station est au bout du sentier, à droite. Continue à monter.",
          a_hall: "L'échelle au milieu du hall monte à la passerelle. De là, un coup d'Élan vers la droite pour atteindre la porte du studio."
        }],
        [!ab('pulse'), 'Trouver le cœur de l’émetteur', "L'autel du cœur de l'émetteur est au centre de la salle. C'est lui qui t'apprendra l'Onde.", {
          a_hall: "La porte du studio est en haut à droite du hall.",
          a_archives: "Continue tout au fond du studio, vers la droite. Écho te tire.",
          a_sanctuaire: "L'autel est au centre de la salle, juste devant toi. Touche-le : c'est l'Onde."
        }],
        [!f('reso_done'), 'Faire chanter les cristaux de résonance', "Écoute le grand cristal, puis frappe les petits dans le même ordre. L'Onde révèle les plateformes cachées.", {
          a_sanctuaire: "La salle des résonances est à droite.",
          a_resonances: "Écoute le grand cristal, puis frappe les petits dans le même ordre. L'Onde révèle les plateformes cachées."
        }],
        [!f('boss_done'), 'Atteindre le sommet de l’antenne', "Monte l'antenne. Et ne regarde pas en bas.", {
          a_resonances: "L'antenne est à droite, au bout du couloir.",
          x_ascension: "Monte, monte, monte. Et ne regarde pas en bas."
        }],
        [true, 'Profiter de la House (et tout retrouver !)', "Il te reste peut-être des éclats de voix, des polaroïds et des amis à retrouver. Le carnet t'indique ce qu'il manque.", {}]
      ];
      for (const l of L) if (l[0]) return { text: l[1], hint: (l[3] && l[3][R]) || l[2] };
      return { text: '', hint: '' };
    }
    sideQuests() {
      const q = [];
      const f = (n) => this.flag(n);
      if (this.rec('keeli')) q.push({ text: 'Retrouver Pixel, le chat de Keeli', done: f('keeli_reward'), sub: f('pixel_found') && !f('keeli_reward') ? 'Pixel est rentré : va voir Keeli !' : 'Il adore grimper tout en haut des arbres.' });
      if (this.rec('tacos')) {
        const n = ['piment', 'menthe', 'sel'].filter((i) => this.item(i)).length;
        q.push({ text: 'Réveiller les papilles de Tacos (' + n + '/3)', done: f('tacos_reward'), sub: 'Piment des bois, menthe sauvage, sel de cristal.' });
      }
      if (this.rec('k974')) q.push({ text: 'Rendre sa cassette à K974', done: f('k974_done'), sub: this.item('cassette') ? 'Tu as la cassette : retourne sur les toits !' : 'Le vent l\'a emportée vers la rivière.' });
      if (this.rec('cocol')) q.push({ text: 'Rapporter les polaroïds de Cocol_ (' + this.save.polaroidsGiven + '/6)', done: this.save.polaroidsGiven >= 6, sub: this.save.countPolaroids() > this.save.polaroidsGiven ? 'Tu en as à rapporter !' : 'Greniers, toits, cimes, cascades…' });
      return q;
    }

    hasNews(id) {
      if (!this.rec(id)) return false;
      const f = (n) => this.flag(n);
      switch (id) {
        case 'keeli': return f('pixel_found') && !f('keeli_reward');
        case 'tacos': return this.item('piment') && this.item('menthe') && this.item('sel') && !f('tacos_reward');
        case 'k974': return this.item('cassette') && !f('k974_done');
        case 'cocol': return this.save.countPolaroids() > this.save.polaroidsGiven;
        default: return false;
      }
    }

    musicFor(room) {
      if (room.zone === 'maison') {
        if (!this.flag('intro_done')) return 'maison';
        return this.flag('power_on') ? 'maison' : 'maison_noir';
      }
      if (room.zone === 'quartier') return this.flag('k974_done') ? 'quartier_fete' : 'quartier';
      if (room.id === 'x_sommet') return this.flag('boss_done') ? 'fin' : 'tension';
      if (room.id === 'f_sortie' && this.chaseOn) return 'tension';
      if (this.flag('ending_done') && room.zone === 'final') return 'fin';
      return room.music;
    }

    // ------------------------------------------------------------------ entrée dans une salle
    onEnterRoom(room) {
      const g = this.game;
      this.chaseOn = false; this.riding = false;
      if (room.zone === 'maison') {
        const on = this.flag('power_on') || !this.flag('intro_done');
        if (room.id !== 'm_grenier') room.state.power = on;
        if (room.id === 'm_garage') {
          room.state.power = this.flag('power_on');
          const sw = room.state.fuseSw || [0, 0, 0, 0];
          room.entities.forEach((e) => { if (e.type === 'lever' && e.d.event === 'fuse_sw') { e.pulled = !!sw[e.d.idx]; e.anim = e.pulled ? 1 : 0; } });
          const main = room.find('fuse_main'); if (main) { main.pulled = this.flag('power_on'); main.anim = main.pulled ? 1 : 0; }
          room.state.radioOn = false;
        }
      }
      if (room.id === 'q_place' && !this.flag('lamps_done')) room.state.lampSeq = [];
      if (room.id === 'g_ecluses') { const v = room.find('valve'); if (v) { v.pulled = this.flag('ecluses_done'); v.anim = v.pulled ? 1 : 0; } }
      if (room.id === 'r_passeur') this.setupFerry(room);
      if (room.id === 'f_clairiere' && this.flag('stones_done')) {
        // pierres posées : on les laisse où elles sont
      }
      // bannière de zone
      const zk = 'zone_' + room.zone;
      if (!this.flag(zk) && ZONES[room.zone] && this.flag('intro_done')) {
        this.set(zk);
        g.ui.zoneBanner(ZONES[room.zone][0], ZONES[room.zone][1] + ' · ' + room.name);
      } else g.ui.roomName(room.name);
      // scènes d'arrivée
      if (room.id === 'm_chambre' && !this.flag('intro_done')) g.cutscene.run(this.introScene());
      else if (room.id === 'q_rue' && !this.flag('left_house')) g.cutscene.run(this.rueIntro());
      else if (room.id === 'x_sommet' && !this.flag('boss_done')) { /* géré par le boss */ }
      else if (room.id === 'm_chambre' && this.flag('ending_done') && !this.flag('postgame_hello')) {
        this.set('postgame_hello');
        g.cutscene.run(function* (g, C) {
          yield C.say('echo', 'LA HOUSE EST RÉUNIE. MAIS IL RESTE PEUT-ÊTRE DES VOIX À RETROUVER, QUELQUE PART.');
          yield C.say('laura', 'Alors on continue d\'écouter. Toujours.', 'happy');
        });
      }
    }

    setupFerry(room) {
      const ferry = room.find('ferry'), br = room.find('brazya');
      if (this.flag('cable_done') && br && ferry) { br.x = ferry.x + ferry.w - 34; br.y = ferry.y - br.h; br.onFerry = true; }
    }

    // ------------------------------------------------------------------ boucle
    update(dt) {
      const g = this.game, room = g.room;
      if (!room) return;
      // pierres chantantes
      if (room.id === 'f_clairiere' && !this.flag('stones_done')) {
        const plates = room.findAll('plate');
        if (plates.length === 3 && plates.every((p) => p.pressed) && !g.cutscene.active) {
          this.set('stones_done');
          g.cutscene.run(this.stonesDone());
        }
      }
      // bac
      if (room.id === 'r_passeur') {
        const ferry = room.find('ferry'), br = room.find('brazya');
        if (br && br.onFerry && ferry) { br.x = ferry.x + ferry.w - 34; br.y = ferry.y - br.h; }
        const b = g.player.body;
        if (this.flag('cable_done') && ferry && !this.riding && !g.cutscene.active && b.onGround && b.groundEnt && b.groundEnt.ent === ferry && ferry.target === null) {
          g.cutscene.run(this.ferryRide(ferry));
        }
      }
    }

    // ------------------------------------------------------------------ utilitaires de scène
    quickSay(who, text, expr) {
      this.game.cutscene.run(function* (g, C) { yield C.say(who, text, expr); });
    }
    readSign(d) {
      const pages = Array.isArray(d.text) ? d.text : [d.text];
      this.game.cutscene.run(function* (g, C) {
        for (const p of pages) yield C.say('sign', p, null, { style: 'sign', title: d.title || '' });
      });
    }
    faceEachOther(npc) {
      const p = this.game.player;
      if (!npc) return;
      p.facing = npc.cx > p.cx ? 1 : -1;
      if (!npc.fixedFace) npc.facing = npc.cx > p.cx ? -1 : 1;
    }
    * reconnectSeq(g, C, npc) {
      const id = npc.cid;
      yield C.echoTo(npc.cx + (g.player.cx < npc.cx ? -26 : 26), npc.y + 6);
      yield C.wait(0.6);
      yield C.call(() => {
        HOL.Audio.sfx('reconnect');
        g.particles.emit({ x: npc.cx, y: npc.cy, size: 6, size1: 90, life: 0.8, kind: 'ring', color: '#ff8ad8' });
        g.particles.emit({ x: npc.cx, y: npc.cy, size: 6, size1: 60, life: 0.6, kind: 'ring', color: '#9ae6ff' });
        g.particles.burst(npc.cx, npc.cy, 30, { speed: [40, 180], life: [0.6, 1.3], size: [2, 5], color: ['#ff8ad8', '#ffd28a', '#9ae6ff', '#b388ff'], kind: 'star', drag: 2 });
        g.save.reconnected[id] = true;
        npc.setAnim('surprised');
      });
      yield C.wait(1.2);
      yield C.echoTo(null);
      yield C.call(() => {
        const n = g.save.countReconnected();
        g.ui.toast('♥ ' + HOL.Chars.INFO[id].name + ' a rejoint la House (' + n + '/13)');
        npc.setAnim('idle');
        if (n >= 13 && !this.flag('all_house')) { this.set('all_house'); }
      });
    }
    talk(id, npc) {
      const self = this;
      const fn = TALK[id];
      if (!fn) return;
      this.game.cutscene.run(function* (g, C) {
        self.faceEachOther(npc);
        const first = !g.save.reconnected[id];
        if (first) yield* self.reconnectSeq(g, C, npc);
        yield* fn.call(self, g, C, npc, first);
      });
    }

    // ------------------------------------------------------------------ objets
    giveItem(item, ent) {
      const g = this.game;
      g.save.items[item] = 1;
      HOL.Audio.sfx('success');
      const it = S.ITEMS[item] || { name: item, desc: '' };
      g.ui.banner(it.name, it.desc, 'Objet obtenu');
      if (ent) g.particles.burst(ent.cx, ent.cy, 20, { speed: [50, 180], life: [0.5, 1], size: [2, 4], color: ['#fff2b0', '#ffd28a', '#ffffff'], kind: 'star', drag: 2 });
      const self = this;
      g.cutscene.run(function* (g, C) {
        yield C.wait(0.3);
        if (item === 'fusible') yield C.say('laura', 'Un fusible tout neuf ! Direction le tableau électrique, près de la porte du garage.', 'happy');
        else if (item === 'manivelle') yield C.say('laura', 'La manivelle ! Maintenant il faut remettre de l\'eau pour atteindre la vanne.', 'determined');
        else if (item === 'piment' || item === 'menthe' || item === 'sel') {
          if (self.rec('tacos')) yield C.say('laura', 'Pour Tacos ! ' + (['piment', 'menthe', 'sel'].filter((i) => self.item(i)).length) + ' sur 3.', 'happy');
          else yield C.say('laura', 'Ça sent drôlement bon. Ça pourrait intéresser quelqu\'un au quartier…', 'think');
        }
      });
    }

    // ------------------------------------------------------------------ évènements
    event(name, ent) {
      const g = this.game, room = g.room;
      const fn = EVENTS[name];
      if (fn) fn.call(this, g, ent, room);
      else console.warn('[histoire] évènement inconnu', name);
    }

    // ------------------------------------------------------------------ énigme : lampadaires
    lampHit(lamp) {
      const g = this.game, st = g.room.state;
      if (this.flag('lamps_done') || lamp.on || this.lampBusy) return;
      const order = ['etoile', 'note', 'lune', 'coeur'];
      st.lampSeq = st.lampSeq || [];
      lamp.on = true;
      g.player.interactT = 0.45;
      st.lampSeq.push(lamp.d.sym);
      const i = st.lampSeq.length - 1;
      HOL.Audio.sfx('lamp', { note: [72, 76, 79, 84][i] || 72 });
      g.particles.burst(lamp.cx, lamp.y + 8, 14, { speed: [30, 120], life: [0.5, 1], size: [2, 4], color: '#ffd28a', kind: 'star' });
      const self = this;
      if (st.lampSeq[i] !== order[i]) {
        this.lampBusy = true;
        st.fails = (st.fails || 0) + 1;
        g.cutscene.run(function* (g, C) {
          yield C.wait(0.5);
          yield C.call(() => {
            HOL.Audio.sfx('fail'); g.shake(4, 0.3);
            g.room.findAll('lamp').forEach((l) => { l.flick = 0.6; });
          });
          yield C.wait(0.6);
          yield C.call(() => { g.room.findAll('lamp').forEach((l) => { l.on = false; }); st.lampSeq = []; self.lampBusy = false; });
          if (st.fails === 1) yield C.say('echo', 'CE N\'EST PAS LE BON ORDRE. LES LAMPADAIRES SE SONT ÉTEINTS.');
          if (st.fails === 1 && !self.flag('mural_seen')) yield C.say('laura', 'Il doit y avoir un ordre précis. MisterFlo saura peut-être quelque chose.', 'think');
          else if (st.fails === 2 && self.flag('mural_seen')) yield C.say('laura', 'Étoile, note, lune, cœur… comme sur la fresque de Charly.', 'think');
        });
      } else if (st.lampSeq.length === 4) {
        this.set('lamps_done');
        g.cutscene.run(this.lampsDone());
      }
    }

    // ------------------------------------------------------------------ énigme : résonances
    resoListen(dia) {
      const g = this.game, st = g.room.state;
      if (this.flag('reso_done') || this.resoBusy) return;
      st.round = st.round || 0;
      const seq = RESO_SEQS[st.round];
      const self = this;
      this.resoBusy = true;
      g.cutscene.run(function* (g, C) {
        // Aide visuelle : on affiche les couleurs dans L'ORDRE a les activer.
        // Avant, il fallait memoriser la suite a l'oreille, sans aucun rappel.
        yield C.call(() => {
          const rs = g.room.findAll('resonator');
          const colors = seq.map((i) => { const r = rs.find((e) => e.d.idx === i); return r ? r.d.color : '#ffffff'; });
          g.ui.resoSeq = { colors: colors, i: -1, t: 0, duree: seq.length * 0.75 + 2.8, room: g.room.id, label: 'Manche ' + (st.round + 1) + ' / 3' };
        });
        yield C.call(() => { dia.k = 1; HOL.Audio.sfx('crystal', { note: 60 }); });
        yield C.wait(0.9);
        let n = 0;
        for (const idx of seq) {
          yield C.call(() => { if (g.ui.resoSeq) g.ui.resoSeq.i = n; const r = g.room.findAll('resonator').find((e) => e.d.idx === idx); if (r) r.ring(g, true); dia.k = 0.6; });
          yield C.wait(0.75);
          n++;
        }
        yield C.call(() => { st.heard = true; st.pos = 0; self.resoBusy = false; });
        if (!self.flag('reso_tip')) {
          self.set('reso_tip');
          yield C.say('echo', 'MANCHE ' + (st.round + 1) + ' SUR 3. FRAPPE LES CRISTAUX DANS LE MÊME ORDRE. L\'ONDE RÉVÈLERA LES PASSAGES POUR ATTEINDRE LES PLUS HAUTS.');
        } else yield C.call(() => g.ui.toast('Manche ' + (st.round + 1) + ' / 3'));
      }, { lock: true });
    }
    resoHit(r) {
      const g = this.game, st = g.room.state;
      if (this.flag('reso_done') || this.resoBusy) return;
      r.ring(g, true);
      g.player.interactT = 0.45;
      if (!st.heard) {
        if (!this.flag('reso_hint')) { this.set('reso_hint'); this.quickSay('echo', 'ÉCOUTE D\'ABORD LE GRAND CRISTAL, AU CENTRE.'); }
        return;
      }
      const seq = RESO_SEQS[st.round || 0];
      // garde-fou : une sauvegarde ancienne/corrompue pourrait avoir round >= 3
      if (!seq) { st.round = 0; st.heard = false; st.pos = 0; return; }
      st.pos = st.pos || 0;
      if (r.d.idx === seq[st.pos]) {
        st.pos++;
        if (st.pos >= seq.length) {
          st.round = (st.round || 0) + 1; st.heard = false; st.pos = 0;
          // la manche est reussie : on retire le panneau de la suite, sinon il
          // reste affiche alors qu'il n'y a plus rien a faire dessus
          g.ui.resoSeq = null;
          if (st.round >= 3) { this.set('reso_done'); g.ui.resoSeq = null; this.game.cutscene.run(this.resoDone()); }
          else {
            HOL.Audio.sfx('success');
            g.ui.toast('Manche réussie ! ' + st.round + ' / 3');
            const dia = g.room.findAll('diapason')[0];
            const self = this;
            setTimeout(() => { if (g.room.id === 'a_resonances' && dia) self.resoListen(dia); }, 1400);
          }
        }
      } else {
        st.pos = 0; st.heard = false;
        HOL.Audio.sfx('fail');
        g.shake(3, 0.2);
        this.quickSay('echo', U.pick(['PAS TOUT À FAIT. RÉÉCOUTE LE GRAND CRISTAL.', 'UNE FAUSSE NOTE. ON RECOMMENCE CETTE MANCHE.', 'PRESQUE ! ÉCOUTE ENCORE.']));
      }
    }

    // ------------------------------------------------------------------ autels de capacités
    shrine(ent) {
      const g = this.game;
      const ab = ent.d.ability;
      if (g.save.abilities[ab]) return;
      if (ent.d.need && !this.cond(ent.d.need)) { this.quickSay('laura', 'Cet autel me semble… endormi. Je devrais d\'abord parler au gardien.', 'think'); return; }
      g.cutscene.run(this.abilityScene(ent, ab));
    }

    onPulse(x, y, r) { /* les entités (boss, ennemis) gèrent l'Onde elles-mêmes */ }

    // ------------------------------------------------------------------ mort / réapparition
    onRespawn(room) {
      const chaser = room.find('chaser');
      if (chaser) { chaser.stop(); this.chaseOn = false; HOL.Audio.play(this.musicFor(room)); }
      const riser = room.find('riser');
      if (riser && this.flag('ascension_on') && !this.flag('ascension_done')) {
        riser.active = true; riser.pos = this.game.player.feetY + 420; riser.grace = 1.5;
      }
      const boss = room.find('boss');
      if (boss && boss.onRespawn) boss.onRespawn(this.game);
    }

    // =================================================================
    // SCÈNES
    // =================================================================
    introScene() {
      const self = this;
      return function* (g, C) {
        const room = g.room, p = g.player;
        yield C.call(() => {
          p.place(6 * T + 15, 14 * T, -1); p.setAnim('sit'); p.echoHidden = true;
          room.state.power = true; g.fadeA = 1;
          g.cam.snap = true;
        });
        yield C.music('maison', 0.5);
        yield C.fade(0, 2.0);
        yield C.wait(0.6);
        yield C.say('laura', 'Bon. Micro, ok. Caméra, ok. Lumières… ok.', 'think');
        yield C.say('laura', 'Ce soir, c\'est le grand stream. Toute la House sera là.', 'happy');
        yield C.say('tony', 'LAURA ! Tu as touché aux câbles ? Le wifi fait n\'importe quoi !', 'surprised', { name: 'Tony (depuis le salon)', noReact: true });
        yield C.say('laura', 'Non ! Enfin… pas beaucoup.', 'laugh');
        yield C.call(() => { room.state.static = true; HOL.Audio.stopMusic(0.3); HOL.Audio.sfx('static', { dur: 1.4 }); g.shake(3, 0.8); });
        yield C.wait(1.3);
        yield C.call(() => { room.state.power = false; room.state.static = false; HOL.Audio.sfx('thunder'); g.flash('#000000', 0.2); });
        yield C.wait(1.0);
        yield C.say('laura', 'Hein ?!', 'surprised');
        yield C.say('laura', 'Plus de courant… et juste avant la coupure, le chat était vide. Complètement vide. Pas un seul message.', 'worried');
        yield C.call(() => { p.echoHidden = false; p.echo.power = 0; p.echo.target = { x: 4.4 * T, y: 11.9 * T }; p.echo.x = 4.4 * T; p.echo.y = 11.9 * T; });
        yield C.wait(0.8);
        yield C.call(() => { HOL.Audio.sfx('beep', { freq: 900 }); p.echo.power = 0.4; });
        yield C.wait(0.7);
        yield C.call(() => { HOL.Audio.sfx('beep', { freq: 1300 }); p.echo.power = 1; p.echo.target = { x: 6 * T, y: 9.5 * T }; g.particles.burst(4.4 * T, 11.9 * T, 18, { speed: [40, 140], life: [0.5, 1], size: [2, 4], color: ['#ff8ad8', '#ffffff'], kind: 'star' }); });
        yield C.music('maison_noir', 3);
        yield C.wait(1.0);
        yield C.say('echo', '…BIP ?');
        yield C.call(() => { p.clearAnim(); p.setAnim('surprised', 1); });
        yield C.say('laura', 'Attends… tu… flottes ?', 'surprised');
        yield C.say('echo', 'SIGNAL PERDU. VOIX DISPERSÉES. RECHERCHE EN COURS.');
        yield C.say('laura', 'Le petit colis sans nom de la semaine dernière ! Je croyais que c\'était une webcam…', 'think');
        yield C.say('echo', 'JE SUIS ÉCHO. JE SUIS FAIT POUR ÉCOUTER. ET DEHORS, J\'ENTENDS DES VOIX. BEAUCOUP DE VOIX. TRÈS FAIBLES.');
        yield C.say('laura', 'Des voix ?… Il faut que je voie Tony.', 'determined');
        yield C.echoTo(null);
        yield C.call(() => {
          self.set('intro_done');
          g.ui.zoneBanner(ZONES.maison[0], ZONES.maison[1] + ' · ' + g.room.name);
          self.set('zone_maison');
          g.ui.tutorial(['move', 'jump', 'interact']);
          g.ui.objectiveChanged();
        });
      };
    }

    rueIntro() {
      const self = this;
      return function* (g, C) {
        yield C.wait(0.4);
        yield C.cam(22 * T, 12 * T, 1.6);
        yield C.say('laura', '…', 'surprised');
        yield C.say('laura', 'Tout est gris. Les maisons, les arbres, le ciel… même Keeli, là-bas. On dirait que le monde a perdu le son.', 'sad');
        yield C.say('echo', 'LE SILENCE EST PASSÉ ICI. MAIS LES VOIX SONT ENCORE LÀ. ÉTOUFFÉES.');
        yield C.say('echo', 'APPROCHE-TOI DES GENS ET PARLE-LEUR. JE PEUX LES RECONNECTER.');
        yield C.camReset(0.6);
        yield C.say('laura', 'Alors on va les chercher. Tous. Un par un.', 'determined');
        yield C.call(() => { self.set('left_house'); g.ui.objectiveChanged(); });
      };
    }

    lampsDone() {
      const self = this;
      return function* (g, C) {
        yield C.wait(0.6);
        yield C.call(() => { HOL.Audio.sfx('success'); g.flash('#ffe6b0', 0.4); g.shake(5, 0.8); });
        yield C.cam(41 * T, 15 * T, 1.2);
        yield C.call(() => { HOL.Audio.sfx('water_rise'); g.particles.burst(41 * T, 15 * T, 40, { speed: [60, 260], life: [0.8, 1.6], size: [2, 5], color: ['#9ae6ff', '#ffffff', '#ff8ad8'], kind: 'star', grav: 200 }); });
        yield C.wait(1.4);
        yield C.say('echo', 'LA FONTAINE CHANTE. LES COULEURS REVIENNENT… UN PEU.');
        yield C.cam(90 * T, 16 * T, 1.4);
        yield C.say('laura', 'La brume du parc se dissipe !', 'happy');
        yield C.camReset(0.6);
        yield C.call(() => HOL.Audio.sfx('radio'));
        yield C.say('tony', 'Laura ? Laura, tu me reçois ? Les lampadaires de la place viennent de se rallumer d\'un coup ! C\'est toi ?', 'surprised', { style: 'radio', name: 'Tony (talkie)' });
        yield C.say('laura', 'Tony ! Oui ! Et la brume recule. Je pars vers la forêt, par le parc.', 'happy');
        yield C.say('tony', 'Fais attention. Et si tu bloques quelque part, appelle-moi avec le talkie : je t\'aiderai.', 'happy', { style: 'radio', name: 'Tony (talkie)' });
        yield C.call(() => { g.ui.objectiveChanged(); g.ui.toast('Astuce : le carnet (' + HOL.Input.prompt('journal').label + ') permet d\'appeler Tony'); });
      };
    }

    stonesDone() {
      return function* (g, C) {
        yield C.wait(0.5);
        yield C.call(() => { HOL.Audio.sfx('success'); g.shake(4, 1.2); });
        yield C.cam(58 * T, 16 * T, 1.8);
        yield C.say('echo', 'LES TROIS PIERRES CHANTENT ENSEMBLE. LES RACINES S\'ÉCARTENT.');
        yield C.camReset(0.5);
        yield C.call(() => g.ui.objectiveChanged());
      };
    }

    abilityScene(ent, ab) {
      const self = this;
      return function* (g, C) {
        const p = g.player;
        yield C.walkPlayer(ent.cx, false);
        yield C.face('laura', 1);
        yield C.call(() => { p.setAnim('interact', 0.6); HOL.Audio.stopMusic(1); });
        yield C.wait(0.6);
        yield C.call(() => { HOL.Audio.sfx('ability'); g.shake(5, 2); g.abilityFx = { t: 0, color: ent.d.color || '#fff', x: ent.cx, y: ent.y + 20 }; });
        yield C.wait(1.4);
        yield C.call(() => {
          g.flash('#ffffff', 0.8);
          g.save.abilities[ab] = true;
          p.setAnim('pulse', 1.2);
          g.particles.burst(p.cx, p.cy, 50, { speed: [80, 320], life: [0.6, 1.4], size: [2, 5], color: [ent.d.color || '#fff', '#ffffff'], kind: ab === 'djump' ? 'feather' : 'star', drag: 2 });
        });
        yield C.wait(1.0);
        yield C.call(() => {
          const A = S.ABILITIES[ab];
          g.ui.abilityBanner(A.name, A.desc, A.action);
          HOL.Audio.play(self.musicFor(g.room), 2);
        });
        yield C.wait(2.5);
        if (ab === 'djump') {
          yield C.say('echo', 'TU ES PLUS LÉGÈRE. JE LE SENS D\'ICI.');
          yield C.say('laura', 'Wow. J\'ai l\'impression de pouvoir toucher les nuages !', 'happy');
          yield C.say('drulysf', 'Les branches, à droite du Chêne, mènent hors de la forêt. Et tout là-haut, la canopée… Il paraît qu\'un chat s\'y promène.', 'smirk');
        } else if (ab === 'dash') {
          yield C.say('laura', 'Je me sens… rapide. Très rapide.', 'determined');
          yield C.say('echo', 'LES PAROIS FISSURÉES NE NOUS ARRÊTERONT PLUS. ESSAIE SUR CELLE-LÀ, À DROITE.');
        } else if (ab === 'pulse') {
          yield C.say('echo', 'L\'ÉMETTEUR EST ENCORE VIVANT. JE PEUX EMPRUNTER SA VOIX.');
          yield C.say('echo', 'ESSAIE, LAURA. LÀ-HAUT, DES CHEMINS ATTENDENT QU\'ON LES ENTENDE.');
          yield C.say('laura', 'Une onde… de voix. C\'est magnifique.', 'happy');
        }
        yield C.call(() => { g.ui.objectiveChanged(); g.saveGame(); });
      };
    }

    ferryRide(ferry) {
      const self = this;
      return function* (g, C) {
        self.riding = true;
        const toRight = ferry.x < 40 * T;
        const target = toRight ? 67 * T : 19 * T;
        const first = !self.flag('ferry_done');
        yield C.call(() => { ferry.moveTo(target, 70); g.cam.lookAhead = 200; });
        if (first) {
          yield C.say('brazya', 'Tiens-toi bien. Le courant est fort, ce soir.', 'determined');
          yield C.wait(2.0);
          yield C.say('brazya', 'La colline, là-bas. L\'antenne s\'est rallumée la nuit dernière. Violette. Personne n\'y monte jamais.', 'worried');
          yield C.say('laura', 'Moi, j\'y monte.', 'determined');
          yield C.say('brazya', 'Je m\'en doutais. Tu as toujours été comme ça : tu tends la main, et tout le monde suit.', 'happy');
          yield C.say('brazya', 'La House compte sur toi, Laura.', 'happy');
        }
        yield C.until((g) => ferry.target === null, 30);
        yield C.call(() => { self.riding = false; g.cam.lookAhead = 0; if (first) { self.set('ferry_done'); g.ui.objectiveChanged(); } });
        // descend du bac
        yield C.walkPlayer(toRight ? 74 * T : 16 * T, false);
      };
    }

    resoDone() {
      return function* (g, C) {
        yield C.wait(0.4);
        const rs = g.room.findAll('resonator');
        for (const r of rs) { yield C.call(() => r.ring(g, true)); yield C.wait(0.15); }
        yield C.call(() => { HOL.Audio.sfx('success'); g.flash('#c9b8ff', 0.5); g.shake(5, 1.2); });
        yield C.cam(49 * T, 4 * T, 1.5);
        yield C.say('echo', 'ILS CHANTENT ENSEMBLE. COMME UNE CHORALE.');
        yield C.camReset(0.5);
        yield C.say('laura', 'Comme la House, un soir de stream.', 'happy');
        yield C.call(() => HOL.Audio.sfx('radio'));
        yield C.say('tony', 'Laura ! Tout le quartier vient de voir un éclair violet au sommet de la colline !', 'surprised', { style: 'radio', name: 'Tony (talkie)' });
        yield C.say('laura', 'C\'est bientôt fini, Tony. Tiens le stream prêt.', 'determined');
        yield C.call(() => g.ui.objectiveChanged());
      };
    }
  }

  // =================================================================
  // ÉVÈNEMENTS (déclencheurs, leviers, panneaux spéciaux)
  // =================================================================
  const EVENTS = {
    // Filet de securite : x_sommet n'a aucune sortie. Si le joueur remonte au
    // sommet alors que l'histoire est deja finie, il proposing de redescendre.
    sommet_retour(g) {
      g.cutscene.run(function* (g, C) {
        yield C.say('laura', 'C\'est fini. Le Silence est parti, et la House est réunie.', 'happy');
        yield C.say('echo', 'IL RESTE PEUT-ÊTRE DES VOIX À RETROUVER, QUELQUE PART.');
        yield C.call(() => { g.fadeBlink(() => { g.loadRoom('m_chambre', 'desk'); g.transition = { phase: 'in', t: 0 }; }); });
      });
    },
    pc(g) {
      const self = this;
      g.cutscene.run(function* (g, C) {
        if (!self.flag('intro_done')) return;
        if (self.flag('ending_done')) { yield C.say('laura', 'Le chat déborde de messages. Toute la House est là. Et un certain « Veilleur » vient de dire bonsoir.', 'happy'); return; }
        if (!self.flag('power_on')) yield C.say('laura', 'L\'écran est noir. Pas de courant.', 'sad');
        else yield C.say('laura', 'Le stream est prêt, mais le chat est toujours vide. Il faut que je retrouve la House.', 'determined');
      });
    },
    window_chambre(g) {
      const self = this;
      g.cutscene.run(function* (g, C) {
        if (!self.flag('intro_done')) yield C.say('laura', 'La ville brille. Parfait pour un stream du soir.', 'happy');
        else if (self.flag('ending_done')) yield C.say('laura', 'Toutes les couleurs sont revenues. Même celles que je n\'avais jamais remarquées.', 'happy');
        else yield C.say('laura', 'Dehors, une brume grise avale tout. Les lumières de la ville s\'éteignent une à une.', 'worried');
      });
    },
    tv_salon(g) {
      const self = this;
      g.cutscene.run(function* (g, C) {
        if (self.flag('power_on')) yield C.say('laura', 'La télé affiche le logo de la House. Tony a dû la brancher sur le stream.', 'happy');
        else yield C.say('laura', 'Écran noir. Rien.', 'sad');
      });
    },
    door_locked(g) {
      const self = this;
      g.cutscene.run(function* (g, C) {
        if (!self.flag('met_tony')) yield C.say('laura', 'Avant de sortir, je dois parler à Tony.', 'think');
        else yield C.say('laura', 'Pas question de sortir dans le noir complet. D\'abord, le courant.', 'determined');
      });
    },
    meet_tony(g) {
      if (this.flag('met_tony')) return;
      const npc = g.room.find('tony');
      g.cutscene.run(TALK_TONY_FIRST.call(this, npc));
    },
    radio_garage(g) {
      const self = this;
      g.cutscene.run(function* (g, C) {
        if (!self.flag('power_on')) yield C.say('laura', 'La vieille radio de Tony. Elle ne marche plus depuis des années.', 'think');
        else yield C.say('laura', 'La radio grésille doucement. Plus aucune voix. Juste le souffle de la colline.', 'think');
      });
    },
    fuse_sw(g, ent, room) {
      ent.pulled = !ent.pulled;
      room.state.fuseSw = room.state.fuseSw || [0, 0, 0, 0];
      room.state.fuseSw[ent.d.idx] = ent.pulled ? 1 : 0;
      HOL.Audio.sfx('lever');
      g.player.interactT = 0.45;
    },
    fuse_main(g, ent, room) {
      const self = this;
      if (this.flag('power_on')) { this.quickSay('laura', 'Le courant est revenu. Pas touche !', 'happy'); return; }
      if (!this.item('fusible')) {
        HOL.Audio.sfx('lever');
        g.cutscene.run(function* (g, C) {
          yield C.say('laura', 'Rien ne se passe. Le logement du fusible principal est vide.', 'think');
          yield C.say('laura', 'Tony a parlé de sa caisse à outils, sur l\'étagère la plus haute.', 'think');
        });
        return;
      }
      const sw = room.state.fuseSw || [0, 0, 0, 0];
      const ok = sw[0] === 1 && sw[1] === 0 && sw[2] === 0 && sw[3] === 1;
      ent.pulled = true;
      HOL.Audio.sfx('lever');
      if (!ok) {
        g.cutscene.run(function* (g, C) {
          yield C.wait(0.4);
          yield C.call(() => { HOL.Audio.sfx('fail'); g.shake(5, 0.3); g.particles.burst(40 * T, 13 * T, 20, { speed: [80, 240], life: [0.3, 0.7], size: [1, 2], color: ['#ffe07a', '#ffffff'], kind: 'spark', grav: 600 }); ent.pulled = false; });
          yield C.say('laura', 'Aïe ! Ça a sauté. Mauvaise combinaison d\'interrupteurs.', 'surprised');
          if (!self.flag('fuse_note_hint')) { self.set('fuse_note_hint'); yield C.say('echo', 'IL Y A UNE NOTE SCOTCHÉE PRÈS DU TABLEAU.'); }
        });
        return;
      }
      this.set('power_on');
      g.cutscene.run(function* (g, C) {
        yield C.wait(0.4);
        yield C.call(() => { HOL.Audio.sfx('success'); g.flash('#fff6d0', 0.5); room.state.power = true; g.save.roomState('m_chambre').power = true; g.save.roomState('m_salon').power = true; });
        yield C.music('maison', 1.5);
        yield C.say('laura', 'Et la lumière fut !', 'happy');
        yield C.wait(0.4);
        yield C.call(() => { room.state.radioOn = true; HOL.Audio.sfx('radio'); HOL.Audio.sfx('static', { dur: 1.5 }); });
        yield C.cam(16 * T, 14 * T, 0.8);
        yield C.say('radio', '…kkhh… ici… le Veilleur… si quelqu\'un m\'entend encore…', null, { style: 'radio' });
        yield C.say('radio', '…le Silence… il dévore les voix… il en veut toujours plus…', null, { style: 'radio' });
        yield C.say('radio', '…l\'antenne… sur la colline… …kkkhhh…', null, { style: 'radio' });
        yield C.call(() => { room.state.radioOn = false; HOL.Audio.sfx('static', { dur: 0.4 }); });
        yield C.camReset(0.5);
        yield C.say('echo', 'SIGNAL DÉTECTÉ. LA COLLINE, APRÈS LA FORÊT ET LA RIVIÈRE.');
        yield C.say('laura', 'Le Veilleur ? C\'est qui, ça ?', 'think');
        yield C.say('echo', 'JE NE SAIS PAS. MAIS SA VOIX… JE LA CONNAIS.');
        yield C.say('tony', 'LAURA ! Le courant est revenu ! …Mais dehors, rien n\'a changé. Toujours ce gris.', 'worried', { name: 'Tony (depuis le salon)', noReact: true });
        yield C.say('laura', 'Tony, je vais sortir. La House est quelque part dehors. Je vais les retrouver, un par un.', 'determined');
        yield C.say('tony', 'Alors prends mon talkie, je l\'ai posé près de la porte. Moi, je garde le stream allumé. Si tu bloques, appelle-moi.', 'determined', { name: 'Tony (depuis le salon)', noReact: true });
        yield C.call(() => { self.set('talkie'); g.ui.toast('Talkie de Tony : ouvre le carnet pour l\'appeler'); g.ui.objectiveChanged(); g.saveGame(); });
      });
    },
    mural(g) {
      const self = this;
      g.cutscene.run(function* (g, C) {
        if (!self.flag('mural_seen')) {
          yield C.say('laura', 'Une grande fresque… mais la brume l\'a presque effacée. On devine des formes, rien de plus.', 'sad');
          if (!self.rec('charly')) yield C.say('echo', 'LA PERSONNE À CÔTÉ TIENT UN PINCEAU. PEUT-ÊTRE QU\'ELLE… ENFIN, CHARLY, SAIT.');
          return;
        }
        yield C.say('sign', 'La fresque de Charly raconte l\'histoire de la House : 1 · l\'étoile, 2 · la note de musique, 3 · la lune, 4 · le cœur.', null, { style: 'sign', title: 'L\'histoire de la House' });
        if (!self.flag('lamps_done')) yield C.say('laura', 'Étoile, note, lune, cœur. Comme les symboles des lampadaires de la place !', 'determined');
      });
    },
    park_call(g) {
      if (this.flag('lamps_done') !== true) return;
      const self = this;
      g.cutscene.run(function* (g, C) {
        yield C.call(() => HOL.Audio.sfx('radio'));
        yield C.say('tony', 'Laura, c\'est Tony. Le chat du stream… quelques messages reviennent ! ' + self.chatNames(3) + '… Ils écrivent tous ton nom.', 'happy', { style: 'radio', name: 'Tony (talkie)' });
        yield C.say('laura', 'Ils vont mieux… On avance, Tony.', 'happy');
        yield C.say('tony', 'Dans la forêt, reste sur tes gardes. Le vieux Drulysf vit là-bas, près du Grand Chêne. Si quelqu\'un comprend ce qui se passe, c\'est lui.', 'think', { style: 'radio', name: 'Tony (talkie)' });
      });
    },
    lisiere_intro(g) {
      g.cutscene.run(function* (g, C) {
        yield C.say('echo', 'ATTENTION. CES FORMES GRISES SONT DES MORCEAUX DE SILENCE. DES GRISAILLES.');
        yield C.say('laura', 'Elles ont l\'air… collantes.', 'worried');
        yield C.say('echo', 'SAUTE-LEUR DESSUS. LE SILENCE DÉTESTE QU\'ON LUI MARCHE SUR LA TÊTE.');
      });
    },
    omas_scene(g) {
      if (this.flag('omas_saved')) return;
      g.cutscene.run(function* (g, C) {
        yield C.cam(37 * T, 18 * T, 1.2);
        yield C.say('echo', 'LÀ-BAS. DEUX GRISAILLES TOURNENT AUTOUR DE QUELQU\'UN.');
        yield C.say('laura', 'C\'est Omas ! Tiens bon, j\'arrive !', 'determined');
        yield C.camReset(0.5);
      });
    },
    stones_reset(g, ent, room) {
      if (this.flag('stones_done')) { this.quickSay('echo', 'LES PIERRES SONT À LEUR PLACE. LE TOTEM SE REPOSE.'); return; }
      room.findAll('block').forEach((b) => b.reset());
      HOL.Audio.sfx('reconnect');
      g.particles.burst(ent.cx, ent.cy, 20, { speed: [40, 140], life: [0.5, 1], size: [2, 4], color: '#9dff7a', kind: 'glow' });
      g.ui.toast('Les pierres reviennent à leur place');
    },
    cat_found(g, ent) {
      const self = this;
      g.cutscene.run(function* (g, C) {
        yield C.call(() => { HOL.Audio.sfx('meow'); });
        yield C.say('pixel', 'Miaou.', null, { name: 'Pixel' });
        if (self.rec('keeli')) yield C.say('laura', 'Pixel ! Keeli te cherche partout. Allez, on rentre à la maison.', 'happy');
        else yield C.say('laura', 'Un chat, tout là-haut ? Il a un collier… « Pixel ». Tu as bien quelqu\'un qui t\'attend, toi.', 'happy');
        yield C.call(() => { HOL.Audio.sfx('meow'); ent.dead = true; g.particles.burst(ent.cx, ent.cy, 16, { speed: [40, 140], life: [0.5, 1], size: [4, 7], color: ['#7cc65a', '#b5d86a'], kind: 'leaf', vr: [-3, 3] }); });
        yield C.say('laura', '…Et il a sauté. Direction le quartier, j\'imagine. Les chats font toujours ce qu\'ils veulent.', 'laugh');
        yield C.call(() => { self.set('pixel_found'); g.ui.toast('Pixel est rentré chez Keeli !'); });
      });
    },
    chase_start(g, ent, room) {
      if (this.flag('chase1_done') || this.chaseOn) return;
      const chaser = room.find('chaser');
      const self = this;
      const firstTime = !this.flag('chase_seen');
      g.cutscene.run(function* (g, C) {
        yield C.call(() => { HOL.Audio.sfx('thunder'); g.shake(6, 1.2); HOL.Input.rumble(0.8, 0.8, 500); });
        if (firstTime) {
          yield C.call(() => { chaser.pos = g.cam.x - 60; chaser.active = true; chaser.grace = 99; });
          yield C.wait(0.8);
          yield C.say('echo', 'LAURA. DERRIÈRE NOUS.', null, {});
          yield C.say('laura', 'C\'est… le Silence ?!', 'surprised');
          yield C.say('echo', 'COURS !');
          yield C.call(() => self.set('chase_seen'));
        }
        yield C.call(() => { chaser.start(); chaser.pos = g.player.cx - 330; self.chaseOn = true; HOL.Audio.play('tension', 0.5); });
      });
    },
    chase_end(g, ent, room) {
      if (this.flag('chase1_done') || !this.chaseOn) return;
      const chaser = room.find('chaser');
      const self = this;
      this.set('chase1_done');
      g.cutscene.run(function* (g, C) {
        yield C.call(() => { chaser.stop(); self.chaseOn = false; HOL.Audio.play('foret', 2); g.flash('#ffffff', 0.2); });
        yield C.say('laura', 'On l\'a… semé ? Je crois.', 'worried');
        yield C.say('echo', 'IL SAIT QUE NOUS VENONS. IL NOUS ATTEND SUR LA COLLINE.');
        yield C.call(() => { g.ui.objectiveChanged(); g.saveGame(); });
      });
    },
    chaser_caught(g, ent, room) {
      if (g.player.dead) return;
      g.player.hp = 0;
      g.player.die();
    },
    swim_tuto(g) {
      g.cutscene.run(function* (g, C) {
        yield C.say('echo', 'LA RIVIÈRE. TU PEUX NAGER : APPUIE SUR SAUT POUR DONNER DES BRASSES. PRÈS DE LA SURFACE, TU BONDIS HORS DE L\'EAU.');
      });
    },
    ecluse_lever(g, ent, room) {
      const w = room.entities.find((e) => e.type === 'water');
      if (!w || Math.abs(w.surf - w.levels[w.level]) > 4) return;
      ent.pulled = !ent.pulled;
      HOL.Audio.sfx('lever');
      g.player.interactT = 0.45;
      const self = this;
      if (w.level !== 'low') {
        w.setLevel('low');
        g.cutscene.run(function* (g, C) {
          yield C.say('echo', 'L\'EAU BAISSE. LE SAS DU FOND VA POUVOIR S\'OUVRIR.');
        });
      } else {
        w.setLevel('mid');
        g.cutscene.run(function* (g, C) {
          yield C.say('echo', 'LE BASSIN SE REMPLIT À MI-HAUTEUR.');
          if (self.item('manivelle') && !self.flag('ecluses_done')) yield C.say('laura', 'Avec l\'eau, je peux rejoindre la vanne, sur la corniche de droite.', 'determined');
        });
      }
    },
    ecluse_valve(g, ent, room) {
      const self = this;
      const w = room.entities.find((e) => e.type === 'water');
      if (this.flag('ecluses_done')) { this.quickSay('echo', 'LA VANNE EST GRANDE OUVERTE. L\'ÉCLUSE RESPIRE.'); return; }
      if (!this.item('manivelle')) {
        g.cutscene.run(function* (g, C) {
          yield C.say('laura', 'La vanne n\'a plus de manivelle. Impossible de la tourner à mains nues.', 'think');
          yield C.say('echo', 'LA PLAQUE PARLAIT D\'UN SAS DE MAINTENANCE. EN BAS.');
        });
        return;
      }
      ent.pulled = true;
      HOL.Audio.sfx('lever');
      this.set('ecluses_done');
      g.cutscene.run(function* (g, C) {
        yield C.call(() => { if (w) w.setLevel('high'); g.shake(4, 3); });
        yield C.say('echo', 'LA VANNE S\'OUVRE. L\'EAU MONTE TOUT EN HAUT !');
        yield C.say('laura', 'Parfait. La sortie est en haut à droite : je n\'ai plus qu\'à nager.', 'happy');
        yield C.call(() => { g.ui.objectiveChanged(); g.saveGame(); });
      });
    },
    andy_voice(g) {
      if (this.rec('andyblct')) return;
      g.cutscene.run(function* (g, C) {
        yield C.say('andyblct', 'Il y a quelqu\'un ?! Je suis coincé derrière ces rochers !', 'worried', { name: 'Voix derrière la roche' });
        yield C.say('laura', 'Tiens bon ! Je vais trouver un moyen de passer.', 'determined');
      });
    },
    winch(g, ent, room) {
      if (this.flag('cable_done')) return;
      const self = this;
      if (!this.rec('brazya')) { this.quickSay('laura', 'Un treuil, avec un câble qui pend jusqu\'à la rivière. Il sert sûrement au bac, en bas.', 'think'); return; }
      g.cutscene.run(function* (g, C) {
        yield C.call(() => { ent.pulled = true; HOL.Audio.sfx('lever'); g.player.setAnim('interact', 0.8); });
        yield C.wait(0.4);
        yield C.call(() => { HOL.Audio.sfx('success'); self.set('cable_done'); self.setupFerry(room); });
        yield C.say('brazya', 'Parfait ! Le câble est tendu. Monte sur le bac, on traverse !', 'happy');
        yield C.call(() => { g.ui.objectiveChanged(); g.saveGame(); });
      });
    },
    sentier_call(g) {
      const self = this;
      g.cutscene.run(function* (g, C) {
        yield C.call(() => HOL.Audio.sfx('radio'));
        yield C.say('tony', 'Laura ? Laura, tu me reçois ?', 'worried', { style: 'radio', name: 'Tony (talkie)' });
        yield C.say('laura', 'Tony ! Je suis au pied de la colline.', 'happy');
        yield C.say('tony', 'J\'ai branché le vieux scanner radio de mon oncle. L\'antenne, là-haut, émet sur la même fréquence que ton Écho. Exactement la même.', 'worried', { style: 'radio', name: 'Tony (talkie)' });
        yield C.say('echo', '…');
        yield C.say('tony', 'Et le chat du stream se remplit ! ' + self.chatNames(5) + '… Tout le monde demande où tu es.', 'happy', { style: 'radio', name: 'Tony (talkie)' });
        yield C.say('laura', 'Dis-leur que j\'arrive.', 'determined');
      });
    },
    archives(g, ent, room) {
      if (this.flag('archives_seen')) return;
      const self = this;
      g.cutscene.run(function* (g, C) {
        const p = g.player;
        yield C.walkPlayer(17 * T, false);
        yield C.face('laura', 1);
        yield C.echoTo(19.6 * T, 11.2 * T);
        yield C.say('laura', 'Écho ? Qu\'est-ce que tu fais ?', 'surprised');
        yield C.say('echo', 'JE… CONNAIS CET ENDROIT.');
        yield C.music(null, 2);
        yield C.call(() => { HOL.Audio.sfx('static', { dur: 1.2 }); });
        yield C.until((g) => { room.state.holo = Math.min(1, (room.state.holo || 0) + 0.02); return room.state.holo >= 1; }, 3);
        yield C.say('veilleur', 'Bonsoir à tous ceux qui ne dorment pas. Ici le Veilleur, et cette nuit encore, je suis là pour vous.', 'neutral');
        yield C.say('veilleur', 'Merci pour vos lettres. Inès, le petit Sami, et tous les autres… Je les lis toutes, vous savez.', 'neutral');
        yield C.call(() => { room.state.holo = 0.3; HOL.Audio.sfx('static', { dur: 0.6 }); });
        yield C.wait(0.8);
        yield C.call(() => { room.state.holo = 1; });
        yield C.say('veilleur', 'Il n\'y a pas eu de lettre cette semaine. Ni la semaine d\'avant.', 'neutral');
        yield C.say('veilleur', 'Est-ce que… quelqu\'un m\'écoute encore ?', 'neutral');
        yield C.call(() => { room.state.holo = 0.2; HOL.Audio.sfx('static', { dur: 1.0 }); });
        yield C.wait(1.0);
        yield C.call(() => { room.state.holo = 0.8; });
        yield C.say('veilleur', 'Si personne n\'écoute… alors je me tairai. Et le silence parlera à ma place.', 'neutral');
        yield C.until((g) => { room.state.holo = Math.max(0, (room.state.holo || 0) - 0.015); return room.state.holo <= 0; }, 3);
        yield C.music('mystere', 3);
        yield C.say('laura', '…', 'sad');
        yield C.say('laura', 'Le Silence. C\'est lui. C\'est tout ce qui reste de lui.', 'sad');
        yield C.say('echo', 'J\'ÉTAIS LE DERNIER ÉMETTEUR DE SA RADIO. AVANT DE SE TAIRE, IL M\'A ENVOYÉ LOIN D\'ICI.');
        yield C.say('echo', 'À QUELQU\'UN QUI SAURAIT ÉCOUTER. À QUELQU\'UN QUI RASSEMBLE LES VOIX.');
        yield C.say('echo', 'À TOI, LAURA.');
        yield C.say('laura', 'Le petit colis sans nom… c\'était toi. C\'était lui.', 'surprised');
        yield C.say('laura', 'Alors on va lui rendre visite. Et on va lui parler. Personne ne devrait rester seul dans le silence.', 'determined');
        yield C.echoTo(null);
        yield C.call(() => { self.set('archives_seen'); g.ui.objectiveChanged(); g.saveGame(); });
      });
    },
    ascension_start(g, ent, room) {
      if (this.flag('ascension_done')) return;
      const riser = room.find('riser');
      if (!riser || riser.active) return;
      const self = this;
      const first = !this.flag('ascension_on');
      g.cutscene.run(function* (g, C) {
        if (first) {
          yield C.call(() => { HOL.Audio.sfx('thunder'); g.shake(8, 1.5); HOL.Input.rumble(0.9, 0.9, 700); });
          yield C.say('echo', 'IL NOUS A SENTIS. LA BRUME MONTE.');
          yield C.say('laura', 'Alors on monte plus vite qu\'elle !', 'determined');
          yield C.call(() => self.set('ascension_on'));
        }
        yield C.call(() => { riser.start(); riser.pos = g.player.feetY + 480; riser.grace = 1.2; });
      });
    },
    boss_intro(g) { /* voir boss.js */ }
  };

  // =================================================================
  // DIALOGUES DES PERSONNAGES
  // =================================================================
  function TALK_TONY_FIRST(npc) {
    const self = this;
    return function* (g, C) {
      self.set('met_tony');
      g.save.reconnected.tony = true;
      yield C.call(() => self.faceEachOther(npc));
      yield C.say('tony', 'Laura ! T\'as vu ça ? Plus rien. Plus de courant, plus de réseau, plus rien du tout.', 'worried');
      yield C.say('laura', 'Mon stream s\'est coupé pile au moment de lancer. Et le chat était… vide.', 'sad');
      yield C.say('tony', 'Vide ? Il y avait trois cents personnes en attente il y a cinq minutes !', 'surprised');
      yield C.say('tony', 'Attends. C\'est quoi, le truc qui flotte à côté de toi ?', 'surprised');
      yield C.say('echo', 'BONJOUR TONY. JE SUIS ÉCHO.');
      yield C.say('tony', '…', 'surprised');
      yield C.say('tony', 'Ok. Ok ok ok. Je vais faire comme si c\'était parfaitement normal.', 'think');
      yield C.say('laura', 'Il dit qu\'il est fait pour écouter. Et qu\'il entend des voix, dehors. Des voix très faibles.', 'think');
      yield C.say('tony', 'Regarde par la fenêtre. Tout est gris. Les lampadaires, les gens, le ciel… Comme si quelqu\'un avait coupé le son du monde.', 'worried');
      yield C.say('tony', 'Bon. Chaque chose en son temps : d\'abord, le courant. Le tableau électrique est au garage, en bas de l\'échelle, au fond du salon.', 'determined');
      yield C.say('tony', 'Il manque le fusible principal. J\'en ai un dans ma caisse à outils rouge, sur l\'étagère la plus haute. Tu grimpes mieux que moi.', 'happy');
      yield C.say('laura', 'Toujours.', 'wink');
      yield C.call(() => g.ui.objectiveChanged());
    };
  }

  const TALK = {
    * tony(g, C, npc) {
      if (!this.flag('met_tony')) { yield* TALK_TONY_FIRST.call(this, npc)(g, C); return; }
      if (this.flag('ending_done')) { yield C.say('tony', 'Le meilleur stream de l\'histoire. Et le Veilleur qui dit bonsoir dans le chat… J\'en ai encore des frissons.', 'happy'); return; }
      if (!this.item('fusible') && !this.flag('power_on')) { yield C.say('tony', "L'échelle à droite du garage monte sur l'étagère du fond. La caisse à outils rouge est dessus.", 'think'); return; }
      if (!this.flag('power_on')) { yield C.say('tony', 'Tu as le fusible ? Génial. J\'ai laissé une note près du tableau pour la combinaison. Je ne m\'en souviens jamais.', 'laugh'); return; }
      const r = U.pick([
        'Je garde le stream allumé. File, la House t\'attend !',
        'Si tu bloques, ouvre ton carnet et appelle-moi au talkie. Je connais le quartier par cœur.',
        'Le chat reste vide… mais je sais que tu vas le remplir.'
      ]);
      yield C.say('tony', r, 'happy');
    },

    * keeli(g, C, npc, first) {
      if (first) {
        yield C.say('keeli', 'Hein ? Laura ? J\'étais en train de rentrer et puis… plus rien. Le trou noir.', 'surprised');
        yield C.say('keeli', 'Attends. Où est Pixel ? PIXEL ?!', 'worried');
        yield C.say('laura', 'Pixel ? Ton chat ?', 'think');
        yield C.say('keeli', 'Quand la brume est arrivée, il a eu peur et il a filé vers la forêt. Il adore grimper tout en haut des arbres…', 'sad');
        const r = yield C.choice('laura', 'Que répondre ?', ['Je le retrouverai, promis.', 'Il reviendra, les chats reviennent toujours.'], 'think');
        if (r === 0) yield C.say('keeli', 'Merci Laura. Tu es la meilleure. Fais attention à toi, d\'accord ?', 'happy');
        else yield C.say('keeli', 'Pas celui-là. Il est encore plus aventureux que toi. Si tu le vois, ramène-le moi… s\'il te plaît.', 'sad');
        return;
      }
      if (this.flag('pixel_found') && !this.flag('keeli_reward')) {
        yield C.say('keeli', 'PIXEL EST RENTRÉ ! Tout seul, fier comme tout, avec une feuille collée sur la tête !', 'laugh');
        yield C.say('keeli', 'Il paraît que c\'est toi qui l\'as trouvé tout en haut de la canopée. Tiens, prends ça. C\'est mon porte-bonheur.', 'happy');
        yield C.call(() => { this.set('keeli_reward'); g.player.maxHp++; g.player.hp = g.player.maxHp; HOL.Audio.sfx('heart'); g.ui.banner('Cœur de la House', 'Ta vie maximale augmente d\'un cœur.', 'Récompense de Keeli'); });
        return;
      }
      if (this.flag('ending_done')) { yield C.say('keeli', 'Pixel dort sur le radiateur. Moi, je rejoue ton stream en boucle. Merci pour tout, Laura.', 'happy'); return; }
      if (this.flag('keeli_reward')) { yield C.say('keeli', 'Pixel ronronne comme un moteur. Il te fait des bisous. Enfin, il cligne des yeux. C\'est pareil.', 'happy'); return; }
      yield C.say('keeli', 'Toujours pas de nouvelles de Pixel… Il adore les hauteurs. Tout en haut des arbres, au-dessus du Grand Chêne peut-être ?', 'sad');
    },

    * cocol(g, C, npc, first) {
      if (first) {
        yield C.call(() => { HOL.Audio.sfx('polaroid'); g.flash('#ffffff', 0.3); });
        yield C.say('cocol', 'Oh ! Laura ! Souris !', 'happy');
        yield C.say('laura', 'Cocol_ ? Tu vas bien ?', 'laugh');
        yield C.say('cocol', 'Moi oui. Mais mes polaroïds… Le vent s\'est levé avec la brume et ils se sont envolés. Six photos de la House. Six souvenirs.', 'sad');
        yield C.say('cocol', 'Le tout premier stream, la soirée karaoké, le fou rire de minuit… Il faut que je les retrouve.', 'sad');
        yield C.say('laura', 'Je garde l\'œil ouvert. Si je trouve un polaroïd, je te le rapporte.', 'determined');
        yield C.say('cocol', 'Ils ont dû voler partout. Dans les endroits où personne ne va jamais : les greniers, les toits, la cime des arbres…', 'think');
        if (this.save.countPolaroids() > this.save.polaroidsGiven) yield* this.givePolaroids(g, C);
        return;
      }
      if (this.save.countPolaroids() > this.save.polaroidsGiven) { yield* this.givePolaroids(g, C); return; }
      if (this.save.polaroidsGiven >= 6) { yield C.say('cocol', 'La collection est complète. Un jour, je ferai une expo. « House of Laura, les archives. »', 'happy'); return; }
      yield C.say('cocol', U.pick([
        'Il me manque encore ' + (6 - this.save.polaroidsGiven) + ' polaroïds. Les endroits secrets, Laura. Là où personne ne regarde.',
        'Un polaroïd, ça se cache bien. Cherche derrière les murs fissurés, au-dessus des nuages…',
        'Tu sais que tu es très photogénique quand tu cours ?'
      ]), 'think');
    },

    * misterflo(g, C, npc, first) {
      if (first) {
        yield C.say('misterflo', 'Ah ! Chère Laura ! Pardonnez-moi, j\'avais l\'impression de dormir debout depuis des heures.', 'surprised');
        yield C.say('laura', 'MisterFlo ! Tout le quartier est dans le même état.', 'worried');
        yield C.say('misterflo', 'Hmm. Des lampadaires éteints, une brume qui avale les couleurs… Ça me rappelle une vieille histoire.', 'think');
        yield C.say('misterflo', 'Il y a longtemps, sur la colline derrière la forêt, un homme parlait chaque nuit dans une petite radio. On l\'appelait le Veilleur.', 'think');
        yield C.say('misterflo', 'Il tenait compagnie à tous ceux qui ne dormaient pas. Et puis un soir, plus rien. Le silence.', 'sad');
        yield C.say('laura', 'Le Veilleur… J\'ai entendu ce nom dans la vieille radio du garage !', 'surprised');
        yield C.say('misterflo', 'Alors ce n\'était pas qu\'une légende.', 'think');
        yield C.say('misterflo', 'Pour la forêt, il faut passer par le parc. Mais la brume bouche la grille. Autrefois, les quatre lampadaires de la place suffisaient à l\'éloigner.', 'think');
        yield C.say('misterflo', 'Charly les a repeints l\'été dernier, et y a caché un message, j\'en mettrais ma casquette à couper. Allez voir Charly, dans la ruelle derrière l\'arche.', 'smirk');
        yield C.call(() => g.ui.objectiveChanged());
        return;
      }
      if (this.flag('ending_done')) { yield C.say('misterflo', 'Le Veilleur… revenu parmi nous. Je le raconterai aux clients du kiosque pendant des années.', 'happy'); return; }
      if (!this.flag('lamps_done')) {
        if (!this.flag('mural_seen')) yield C.say('misterflo', 'Charly. Dans la ruelle, derrière l\'arche de l\'esplanade. Il y a toujours un sens caché dans ce que peint Charly.', 'smirk');
        else yield C.say('misterflo', 'L\'ordre de la fresque, voilà la clé. Le lampadaire à la note est juste au-dessus de mon kiosque : grimpez par les tonneaux.', 'happy');
        return;
      }
      yield C.say('misterflo', U.pick([
        'Les lampadaires brillent à nouveau. Le quartier respire. Merci, chère Laura.',
        'Le Veilleur… Si vous le trouvez, dites-lui que le kiosque a gardé ses vieux journaux.',
        'Prenez soin de vous. Et de ce charmant petit… Écho.'
      ]), 'happy');
    },

    * tacos(g, C, npc, first) {
      if (first) {
        yield C.say('tacos', 'WOUH ! Laura ! J\'ai rêvé que tous les tacos du monde perdaient leur goût. Horrible.', 'surprised');
        yield C.say('tacos', '…Attends. Ce n\'était pas un rêve. Tout est fade ! Même le piment ne pique plus !', 'worried');
        yield C.say('laura', 'C\'est la brume. Elle efface les couleurs… et apparemment le goût.', 'think');
        yield C.say('tacos', 'Inacceptable. Écoute : si tu passes par la forêt, la rivière ou les grottes, ramène-moi de quoi réveiller mes papilles.', 'determined');
        yield C.say('tacos', 'Un piment des bois, de la menthe sauvage et du sel de cristal. Je te préparerai le Tacos Suprême. Il redonne des forces, c\'est scientifique.', 'happy');
        return;
      }
      const have = ['piment', 'menthe', 'sel'].filter((i) => this.item(i)).length;
      if (have === 3 && !this.flag('tacos_reward')) {
        yield C.say('tacos', 'Le piment, la menthe, le sel ! Laura, tu es une légende.', 'happy');
        yield C.call(() => { HOL.Audio.sfx('fire'); g.particles.burst(npc.cx, npc.y, 20, { speed: [40, 140], angle: [-Math.PI, 0], life: [0.6, 1.2], size: [2, 5], color: ['#ffb347', '#ff5e57', '#ffd14a'], kind: 'glow' }); });
        yield C.wait(0.8);
        yield C.say('tacos', 'Et voilà : le Tacos Suprême ! Croque !', 'laugh');
        yield C.say('laura', '…WOW. Ça pique. Ça pique ÉNORMÉMENT. Mais c\'est incroyable.', 'surprised');
        yield C.call(() => { this.set('tacos_reward'); g.player.maxHp++; g.player.hp = g.player.maxHp; HOL.Audio.sfx('heart'); g.ui.banner('Tacos Suprême', 'Ta vie maximale augmente d\'un cœur.', 'Récompense de Tacos'); });
        return;
      }
      if (this.flag('tacos_reward')) { yield C.say('tacos', this.flag('ending_done') ? 'Ce soir, tacos gratuits pour toute la House ! Même pour le Veilleur, s\'il a faim.' : 'Alors, ce Tacos Suprême ? Tu cours plus vite, non ? Je te l\'avais dit : scientifique.', 'happy'); return; }
      yield C.say('tacos', 'Il me faut encore ' + (3 - have) + ' ingrédient' + (3 - have > 1 ? 's' : '') + '. Piment des bois dans la forêt, menthe sauvage près de la rivière, sel de cristal au fond des grottes.', 'think');
    },

    * charly(g, C, npc, first) {
      if (first) {
        yield C.say('charly', 'Laura ? Ouf… J\'avais le pinceau en l\'air depuis des heures. J\'ai une crampe.', 'laugh');
        yield C.say('charly', 'Ma fresque ! La brume l\'a presque effacée. Attends, je répare ça…', 'worried');
        yield C.call(() => { npc.setAnim('interact'); HOL.Audio.sfx('reconnect'); });
        yield C.wait(0.6);
        yield C.call(() => { this.set('mural_seen'); g.flash('#ffd1f2', 0.3); g.particles.burst(8 * T, 26 * T, 40, { speed: [40, 200], life: [0.6, 1.4], size: [3, 6], color: ['#ffd14a', '#5fe0a0', '#c9d8ff', '#ff5fae'], kind: 'star', drag: 2 }); npc.setAnim('idle'); });
        yield C.say('charly', 'Voilà. Elle raconte l\'histoire de la House, en quatre étapes.', 'happy');
        yield C.say('charly', 'D\'abord l\'étoile : le premier soir, quand on s\'est tous connectés. Puis la note : la musique, les soirées karaoké.', 'happy');
        yield C.say('charly', 'Ensuite la lune : les nuits trop longues où personne ne voulait aller dormir. Et à la fin…', 'shy');
        yield C.say('charly', 'Le cœur. Toujours le cœur.', 'happy');
        yield C.say('laura', 'Étoile, note, lune, cœur… Comme les symboles sur les lampadaires de la place !', 'surprised');
        yield C.say('charly', 'Tiens, oui. C\'est moi qui les ai peints. Si tu les allumes dans cet ordre-là… qui sait ce qui se passe ?', 'wink');
        yield C.call(() => g.ui.objectiveChanged());
        return;
      }
      if (this.flag('ending_done')) { yield C.say('charly', 'Je vais ajouter une cinquième étape à la fresque. Une antenne. Et une petite sphère blanche.', 'happy'); return; }
      if (!this.flag('lamps_done')) { yield C.say('charly', 'Étoile, note, lune, cœur. L\'ordre de l\'histoire. N\'oublie pas le cœur, surtout.', 'wink'); return; }
      yield C.say('charly', U.pick(['La place a retrouvé des couleurs ! Enfin, une partie. Je garde mes pinceaux prêts pour le reste.', 'Tu sais que ton Écho ferait un super modèle ? Il ne bouge pas. Enfin, il flotte. Mais il ne bouge pas.']), 'happy');
    },

    * k974(g, C, npc, first) {
      if (first) {
        yield C.say('k974', '…Yo. Laura ?', 'tired');
        yield C.say('k974', 'Je mixais tranquille pour le quartier et d\'un coup, silence total. Même mon enceinte ne sort plus un son.', 'sad');
        yield C.say('k974', 'Et ma cassette préférée, celle avec tous les sons de la House… le vent l\'a emportée vers la rivière.', 'sad');
        yield C.say('laura', 'Sans ta musique, le quartier n\'est plus le même.', 'sad');
        yield C.say('k974', 'Grave. Si tu tombes sur une cassette turquoise, ramène-la moi. Je te fais la meilleure fête que ce quartier ait jamais vue.', 'happy');
        if (this.item('cassette')) { yield C.say('laura', 'Une cassette turquoise ? Comme… celle-ci ?', 'wink'); yield* this.k974Party(g, C, npc); }
        return;
      }
      if (this.item('cassette') && !this.flag('k974_done')) { yield* this.k974Party(g, C, npc); return; }
      if (this.flag('k974_done')) { yield C.say('k974', U.pick(['Tu entends ça ? C\'est le son de la House. Le vrai.', 'Ce morceau, je te le dédicace. Et à ton Écho aussi, il a le rythme.', 'Ce soir, après ton stream, afterparty sur les toits. Tout le monde est invité.']), 'happy'); return; }
      yield C.say('k974', 'Toujours pas de cassette ? Le vent l\'a poussée vers la rivière. Les pêcheurs trouvent de tout, là-bas.', 'think');
    },

    * omas(g, C, npc, first) {
      if (first) {
        yield C.say('omas', 'Laura ?! Oh merci, merci, merci. Ces choses grises me tournaient autour depuis une éternité.', 'surprised');
        yield C.say('omas', 'Je cherchais des champignons pour la soirée et d\'un coup, la forêt est devenue muette. Plus un oiseau. Plus rien.', 'worried');
        yield C.say('laura', 'Tu as croisé quelqu\'un d\'autre par ici ?', 'think');
        yield C.say('omas', 'Juste une silhouette encapuchonnée, près du Grand Chêne, au fond de la forêt. Drulysf, le gardien.', 'think');
        yield C.say('omas', 'Mais le chemin passe par la clairière aux pierres, et les racines ont tout bouché.', 'worried');
        yield C.say('omas', 'Moi, je rentre au quartier. Doucement. Très doucement. En évitant tout ce qui est gris.', 'laugh');
        yield C.call(() => { this.set('omas_saved'); npc.walkTo(npc.x - 400, 110); g.ui.objectiveChanged(); });
        yield C.wait(1.2);
        yield C.call(() => { npc.hidden = true; });
        return;
      }
      if (this.flag('ending_done')) { yield C.say('omas', 'J\'ai enfin trouvé mes champignons. Enfin, Tacos les a trouvés dans son frigo. Mais l\'intention était là.', 'laugh'); return; }
      yield C.say('omas', U.pick(['Ce banc est très bien. Je ne bouge plus d\'ici avant que tout redevienne normal.', 'Merci encore pour la forêt. Je te dois une omelette aux champignons.']), 'happy');
    },

    * drulysf(g, C, npc, first) {
      if (first) {
        yield C.say('drulysf', 'Une voix claire. Enfin.', 'neutral');
        yield C.say('drulysf', 'Bonjour, Laura. Le Chêne m\'a parlé de toi. Enfin… il a bruissé. C\'est pareil.', 'smirk');
        yield C.say('laura', 'Drulysf… Tu sais ce qui se passe ?', 'think');
        yield C.say('drulysf', 'Le Silence n\'est pas une tempête. C\'est un manque. Il prend les voix parce qu\'il n\'en a plus aucune.', 'neutral');
        yield C.say('drulysf', 'Et il vient de la colline. De la vieille antenne.', 'determined');
        yield C.say('drulysf', 'Pour y aller, il te faudra des ailes. Le Chêne garde une plume de vent depuis des siècles. Elle attend quelqu\'un qui porte la voix des autres.', 'neutral');
        yield C.say('drulysf', 'Toi. Et ce petit Écho qui te suit.', 'smirk');
        yield C.say('echo', 'JE NE SUIS PAS PETIT.');
        yield C.say('drulysf', 'Évidemment.', 'smirk');
        yield C.say('drulysf', 'Va. Touche l\'autel, au pied du Chêne.', 'neutral');
        yield C.call(() => { this.set('drulysf_ok'); g.ui.objectiveChanged(); });
        return;
      }
      if (!this.abil('djump')) { yield C.say('drulysf', 'L\'autel, au pied du Chêne. La plume t\'attend.', 'neutral'); return; }
      if (this.flag('ending_done')) { yield C.say('drulysf', 'La forêt chante de nouveau. Et quelque part, une vieille voix chante avec elle.', 'happy'); return; }
      yield C.say('drulysf', U.pick(['Écoute le vent, Laura. Il sait des choses.', 'La canopée… Un chat très fier de lui s\'y promène, paraît-il.', 'Le Silence a peur d\'une seule chose : qu\'on lui réponde.']), 'neutral');
    },

    * sylvain(g, C, npc, first) {
      if (first) {
        yield C.say('sylvain', 'Ho ! Laura ! J\'ai cru que j\'allais rester planté là jusqu\'à l\'hiver.', 'surprised');
        yield C.say('sylvain', 'La rivière ne chante plus. Les vieilles écluses sous la falaise se sont bloquées, et depuis, le courant fait n\'importe quoi.', 'worried');
        yield C.say('sylvain', 'Pour continuer, il faudra les remettre en marche. L\'entrée est derrière la cascade, à droite.', 'think');
        yield C.say('sylvain', 'Nage si tu dois nager. L\'eau est froide, mais elle est honnête.', 'happy');
        yield C.say('sylvain', 'Ah, et j\'ai pêché ça tout à l\'heure. Une cassette turquoise. Ça te parle ?', 'think');
        yield C.call(() => { g.save.items.cassette = 1; HOL.Audio.sfx('success'); g.ui.banner(S.ITEMS.cassette.name, S.ITEMS.cassette.desc, 'Objet obtenu'); });
        if (this.rec('k974')) yield C.say('laura', 'C\'est celle de K974 ! Le DJ des toits. Je la lui rapporterai.', 'happy');
        else yield C.say('laura', 'Pas encore… mais je la garde. Quelqu\'un doit la chercher.', 'think');
        return;
      }
      if (this.flag('ending_done')) { yield C.say('sylvain', 'La rivière chante à nouveau. Et les poissons mordent ! Enfin, un peu.', 'happy'); return; }
      yield C.say('sylvain', U.pick(['Derrière la cascade, Laura. Grimpe à droite, par les corniches.', 'Il paraît que tout en haut de la cascade, il y a une paroi qui sonne creux…', 'Une bonne pêche, c\'est comme une bonne soirée : de la patience et des amis.']), 'think');
    },

    * ofire(g, C, npc, first) {
      if (first) {
        yield C.say('ofire', 'Ah ! De la lumière ! Enfin, pas la mienne. La tienne.', 'surprised');
        yield C.say('ofire', 'Moi c\'est Ofire, gardien des braseros. Enfin, ex-gardien : la brume a soufflé tous mes feux d\'un coup.', 'sad');
        yield C.say('ofire', 'Tu sais quoi ? Ta petite boule lumineuse pourrait porter ma flamme.', 'think');
        yield C.say('echo', 'JE NE SUIS PAS UNE BOULE.');
        yield C.say('ofire', 'Pardon, pardon. Ton magnifique compagnon sphérique pourrait porter ma flamme.', 'laugh');
        yield C.call(() => { HOL.Audio.sfx('fire'); g.flash('#ffb347', 0.3); g.particles.burst(g.player.echo.x, g.player.echo.y, 30, { speed: [40, 160], life: [0.5, 1.1], size: [2, 5], color: ['#ffb347', '#ff7043', '#fff2b0'], kind: 'glow' }); this.set('flamme'); });
        yield C.wait(0.6);
        yield C.call(() => g.ui.banner('La flamme d\'Ofire', 'Allume les braseros : ils éclairent la grotte et sauvegardent ta progression.', 'Nouveau pouvoir'));
        yield C.say('ofire', 'Allume les braseros sur ton chemin. Ils te protégeront de l\'obscurité… et du Silence.', 'happy');
        yield C.call(() => g.ui.objectiveChanged());
        return;
      }
      if (this.flag('ending_done')) { yield C.say('ofire', 'Tous mes braseros brûlent. Même ceux que j\'avais oubliés. Merci, Laura !', 'happy'); return; }
      yield C.say('ofire', U.pick(['Un brasero allumé, c\'est une promesse : on repart de là si ça tourne mal.', 'Les écluses sont plus loin, à droite. Andyblct y traînait souvent, avec ses cartes.']), 'happy');
    },

    * andyblct(g, C, npc, first) {
      if (first) {
        yield C.say('andyblct', 'Laura ?! Tu as traversé la roche comme une fusée !', 'surprised');
        yield C.say('andyblct', 'Je cartographiais la galerie quand tout s\'est éteint. Les éboulements m\'ont enfermé ici.', 'worried');
        yield C.say('andyblct', 'Merci. Vraiment. La sortie est à l\'est, par le couloir bas. Il faut de l\'élan pour passer le trou : ne saute pas, fonce !', 'determined');
        yield C.say('andyblct', 'Et au passage : tout en haut de la cascade, il y a une paroi fissurée. Je n\'ai jamais pu voir ce qu\'il y a derrière.', 'think');
        return;
      }
      if (this.flag('ending_done')) { yield C.say('andyblct', 'Je refais toute la carte de la région. Avec une nouvelle légende : « ici, Laura a tout sauvé ».', 'happy'); return; }
      yield C.say('andyblct', U.pick(['Le couloir bas, à l\'est : fonce avec ton Élan, ne saute pas.', 'La paroi fissurée en haut de la cascade… Tu devrais aller voir, maintenant que tu fonces à travers les murs.']), 'think');
    },

    * brazya(g, C, npc, first) {
      if (first) {
        yield C.say('brazya', 'Laura ! J\'ai perdu la notion du temps, là. Et mon bac est coincé.', 'surprised');
        yield C.say('brazya', 'Le câble a lâché quand la brume est tombée. Il est resté accroché au treuil, là-haut sur le rocher.', 'worried');
        yield C.say('brazya', 'Moi, je n\'y arrive pas. Mais toi, avec tes bonds de cabri…', 'smirk');
        yield C.say('laura', 'Je m\'en occupe.', 'determined');
        yield C.call(() => g.ui.objectiveChanged());
        return;
      }
      if (!this.flag('cable_done')) { yield C.say('brazya', 'Le treuil, en haut du rocher à gauche. Un double saut, puis un autre.', 'think'); return; }
      if (this.flag('ending_done')) { yield C.say('brazya', 'Le bac tourne à plein régime ! Tout le monde veut voir la colline au lever du soleil.', 'happy'); return; }
      yield C.say('brazya', 'Monte sur le bac quand tu veux. Je te fais traverser.', 'happy');
    }
  };

  Story.prototype.givePolaroids = function* (g, C) {
    const found = Object.keys(this.save.polaroids).filter((k) => this.save.polaroids[k]).sort();
    const n = found.length - this.save.polaroidsGiven;
    yield C.say('laura', 'J\'ai retrouvé ' + (n > 1 ? n + ' de tes polaroïds' : 'un de tes polaroïds') + ' !', 'happy');
    const names = found.slice(this.save.polaroidsGiven).map((k) => '« ' + S.POLAROIDS[k] + ' »').join(', ');
    yield C.say('cocol', names + ' ! Oh… je me souviens de chaque seconde.', 'happy');
    yield C.call(() => { this.save.polaroidsGiven = found.length; HOL.Audio.sfx('polaroid'); });
    if (this.save.polaroidsGiven >= 6) {
      yield C.say('cocol', 'Les six ! La collection est complète ! Je vais en faire une grande photo de groupe. La plus belle de toutes.', 'laugh');
      yield C.call(() => { this.set('cocol_done'); g.ui.banner('Collection complète', 'Les six polaroïds de Cocol_ sont rentrés à la maison.', 'Quête terminée'); });
    } else {
      yield C.say('cocol', 'Plus que ' + (6 - this.save.polaroidsGiven) + '. Tu es incroyable, Laura.', 'happy');
    }
  };
  Story.prototype.k974Party = function* (g, C, npc) {
    yield C.say('k974', 'MA CASSETTE ! Laura, tu es une légende. Écoute ça…', 'happy');
    yield C.call(() => { this.set('k974_done'); delete this.save.items.cassette; HOL.Audio.play('quartier_fete', 1.5); g.flash('#3fd6b5', 0.3); npc.setAnim('happy'); });
    yield C.wait(1.6);
    yield C.say('k974', 'Le son de la House ! Tout le quartier va l\'entendre. Ce morceau, je te le dédicace.', 'happy');
    yield C.call(() => g.ui.banner('Le son est revenu', 'Le quartier a retrouvé sa musique.', 'Quête terminée'));
  };
  Story.prototype.chatNames = function (max) {
    const ids = HOL.Chars.HOUSE.filter((id) => id !== 'tony' && this.save.reconnected[id]);
    const names = ids.slice(0, max).map((id) => HOL.Chars.INFO[id].name);
    if (!names.length) return 'Quelques pseudos';
    return names.join(', ');
  };

  HOL.StoryClass = Story;
  HOL.StoryTalk = TALK;
  HOL.StoryEvents = EVENTS;
})();
