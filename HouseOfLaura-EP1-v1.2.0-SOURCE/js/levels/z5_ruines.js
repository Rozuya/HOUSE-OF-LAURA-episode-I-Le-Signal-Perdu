/* ZONE 5 · LES RUINES DE L'ANTENNE (révélation, Onde, cristaux de résonance) */
(function () {
  'use strict';
  const HOL = (typeof window !== 'undefined' ? window : globalThis).HOL;
  const MB = HOL.MB, R = HOL.defRoom;

  // ------------------------------------------------------------------ sentier de la colline
  {
    const m = MB(110, 26);
    m.ground(22, 0, 10);
    m.ground(20, 11, 20);
    m.ground(18, 21, 30);
    m.hl(32, 16, 4); m.hl(38, 14, 4);
    m.ground(14, 44, 56);
    m.ground(12, 63, 75);
    m.hl(76, 9, 4);
    m.ground(10, 82, 95);
    m.ground(8, 96, 109);
    m.set(40, 13, '*'); m.set(86, 9, '*');
    R('a_sentier', {
      zone: 'ruines', name: 'Sentier de la colline', theme: 'ruines', music: 'mystere', openTop: true,
      map: m.rows(),
      exits: { left: { to: 'r_passeur', spawn: 'east' }, right: { to: 'a_hall', spawn: 'west' } },
      spawns: { west: [1, 21, { face: 1 }], east: [108, 7, { face: -1 }] },
      entities: [
        { type: 'checkpoint', x: 2, y: 21 },
        { type: 'deco', kind: 'signpost', x: 5, y: 21, label: 'STATION', dir: 1 },
        { type: 'trigger', x: 8, y: 21, w: 2, h: 4, event: 'sentier_call', flag: 'sentier_call', once: true },
        { type: 'deco', kind: 'pillar', x: 16, y: 19, h: 3, broken: true },
        { type: 'deco', kind: 'pillar', x: 27, y: 17, h: 4, rune: true },
        { type: 'enemy', kind: 'flyer', x: 50, y: 10, range: 4 },
        { type: 'deco', kind: 'pillar', x: 47, y: 13, h: 5, broken: true },
        { type: 'enemy', kind: 'crawler', x: 69, y: 11, range: 3 },
        { type: 'deco', kind: 'pillar', x: 72, y: 11, h: 3, rune: true },
        { type: 'enemy', kind: 'flyer', x: 88, y: 5, range: 3 },
        { type: 'deco', kind: 'pillar', x: 99, y: 7, h: 6, rune: true },
        { type: 'checkpoint', x: 90, y: 9 }
      ]
    });
  }

  // ------------------------------------------------------------------ grand hall en ruine
  {
    const m = MB(70, 26);
    m.rect(0, 0, 70, 2);
    m.ground(22);
    m.rect(0, 8, 7, 14);
    m.hl(8, 11, 3); m.hl(12, 14, 3); m.hl(8, 17, 3);
    m.hl(14, 19, 3);
    // Les trois piliers s'arrêtaient a y=21, c'est-a-dire qu'ils touchaient
    // presque le sol : ils coupaient le sol en trois segments et Laura ne
    // pouvait plus avancer au sol (elle butait a x=17). On les raccourcit d'une
    // tuile (fin a y=19) pour qu'on passe dessous et qu'on atteigne l'echelle.
    m.rect(18, 16, 3, 4);
    m.rect(26, 13, 3, 7);
    m.rect(34, 10, 3, 10);
    m.hl(40, 10, 6);
    // ÉCHELLE VERS LA PLATEFORME DU MUR CASSABLE.
    // Une fois tombée au sol, Laura ne pouvait plus remonter : les marches de
    // gauche s'arrêtaient à y=11, et il y avait 30 tuiles de vide jusqu'à la
    // plateforme du mur. Aucun saut ne peut franchir 30 tuiles.
    // L'echelle est collee a la plateforme du mur (x=40-45) : en haut on marche
    // directement dessus, il n'y a pas de trou a sauter.
    m.vl(39, 10, 12);
    m.vl(46, 8, 4, 'B'); m.rect(46, 2, 1, 6);
    m.hl(47, 10, 8);
    m.rect(56, 14, 14, 8);
    m.hl(29, 10, 3, 'H'); m.hl(24, 7, 3, 'H');
    m.set(27, 12, '*'); m.set(52, 9, '*'); m.set(25, 4, '*');
    R('a_hall', {
      zone: 'ruines', name: 'Hall de la station', theme: 'ruines', music: 'mystere', dark: 0.25,
      map: m.rows(),
      exits: { left: { to: 'a_sentier', spawn: 'east' } },
      spawns: { west: [1, 7, { face: 1 }], archdoor: [62, 13, { face: -1 }] },
      entities: [
        { type: 'deco', kind: 'pillar', x: 10, y: 21, h: 5, rune: true },
        { type: 'enemy', kind: 'flyer', x: 22, y: 18, range: 3 },
        { type: 'enemy', kind: 'crawler', x: 40, y: 21, range: 4 },
        { type: 'sign', x: 44, y: 9, style: 'plaque', title: 'Plaque gravée', text: '« STATION RADIO DU VEILLEUR. Ici, chaque nuit, une voix pour ceux qui ne dorment pas. »' },
        { type: 'enemy', kind: 'flyer', x: 50, y: 15, range: 3 },
        { type: 'door', x: 64, y: 13, to: 'a_archives', spawn: 'door', style: 'arch', label: 'Entrer dans le studio', w: 1.8, h: 2.8 },
        { type: 'deco', kind: 'pillar', x: 59, y: 13, h: 4, rune: true },
        { type: 'checkpoint', x: 58, y: 13 },
        { type: 'light', x: 64, y: 11, r: 150, color: '#5ef2d6', a: 0.6 }
      ]
    });
  }

  // ------------------------------------------------------------------ archives (le studio du Veilleur)
  {
    const m = MB(44, 17);
    m.rect(0, 0, 44, 2); m.ground(14); m.rect(0, 0, 2, 17);
    m.rect(42, 0, 2, 10);
    m.hl(28, 10, 5); m.set(30, 9, '*');
    R('a_archives', {
      zone: 'ruines', name: 'Le studio du Veilleur', theme: 'ruines', music: 'mystere', dark: 0.5, indoor: true,
      map: m.rows(),
      exits: { right: { to: 'a_sanctuaire', spawn: 'west' } },
      spawns: { door: [4, 13, { face: 1 }], east: [42, 13, { face: -1 }] },
      entities: [
        { type: 'door', x: 3, y: 13, to: 'a_hall', spawn: 'archdoor', style: 'arch', label: 'Sortir', w: 1.8, h: 2.8 },
        { type: 'deco', kind: 'tapes', x: 5, y: 13, w: 3 },
        { type: 'deco', kind: 'letterdesk', x: 9, y: 13 },
        { type: 'sign', x: 10, y: 13, style: 'letter', title: 'Lettre', text: '« Cher Veilleur, grâce à vous je n\'ai plus peur des nuits d\'hiver. Continuez de parler, s\'il vous plaît. » Signé : Inès.' },
        { type: 'sign', x: 12, y: 13, style: 'letter', title: 'Lettre', text: '« Salut le Veilleur ! C\'est Sami. Ma maman dit que tu es un ami imaginaire. Moi je sais que tu existes. »' },
        { type: 'deco', kind: 'studio', x: 15, y: 13 },
        { type: 'deco', kind: 'holo', x: 20, y: 13 },
        { type: 'trigger', x: 17, y: 13, w: 3, h: 4, event: 'archives', flag: 'archives_trig', once: true },
        { type: 'deco', kind: 'tapes', x: 34, y: 13, w: 3 },
        { type: 'sign', x: 36, y: 13, style: 'tape', title: 'Bande magnétique', text: 'Étiquette : « Dernière émission ». Le ruban a été soigneusement rembobiné, puis rangé à part. Comme un adieu.' },
        { type: 'gate', id: 'arch_gate', x: 40, y: 13, w: 2, h: 4, style: 'stone', open: 'archives_seen' },
        { type: 'light', x: 18, y: 10, r: 200, color: '#ffc880', a: 0.8 },
        { type: 'light', x: 6, y: 11, r: 120, color: '#ffc880', a: 0.6 },
        { type: 'light', x: 35, y: 11, r: 120, color: '#ffc880', a: 0.6 }
      ]
    });
  }

  // ------------------------------------------------------------------ sanctuaire (l'émetteur, Onde)
  {
    const m = MB(40, 24);
    m.rect(0, 0, 40, 1);
    m.ground(20);
    m.rect(0, 0, 2, 16);
    m.rect(38, 5, 2, 15);
    m.rect(35, 5, 3, 1);
    m.hl(24, 16, 3, 'H'); m.hl(29, 12, 3, 'H'); m.hl(33, 8, 3, 'H');
    m.hl(8, 16, 3, 'H'); m.hl(3, 12, 3, 'H');
    m.set(36, 4, '*');
    R('a_sanctuaire', {
      zone: 'ruines', name: 'Le cœur de l\'émetteur', theme: 'ruines', music: 'mystere', dark: 0.35,
      map: m.rows(),
      exits: { left: { to: 'a_archives', spawn: 'east' }, right: { to: 'a_resonances', spawn: 'west' } },
      spawns: { west: [2, 19, { face: 1 }], east: [36, 4, { face: -1 }] },
      entities: [
        { type: 'deco', kind: 'transmitter', x: 13, y: 19 },
        { type: 'shrine', ability: 'pulse', x: 19, y: 19, color: '#5ef2d6' },
        { type: 'deco', kind: 'pillar', x: 27, y: 19, h: 4, rune: true },
        { type: 'polaroid', id: 'p5', x: 4, y: 11 },
        { type: 'enemy', kind: 'flyer', x: 29, y: 9, range: 2 },
        { type: 'enemy', kind: 'flyer', x: 10, y: 9, range: 2 },
        { type: 'light', x: 15, y: 15, r: 200, color: '#5ef2d6', a: 0.7 },
        { type: 'checkpoint', x: 4, y: 19 }
      ]
    });
  }

  // ------------------------------------------------------------------ salle des résonances (énigme musicale)
  {
    const m = MB(52, 28);
    m.rect(0, 0, 52, 1);
    m.ground(25);
    m.rect(0, 5, 6, 1);
    m.rect(0, 6, 1, 19);
    m.hl(7, 9, 3); m.hl(3, 13, 3); m.hl(7, 17, 3); m.hl(3, 21, 3);
    m.rect(11, 16, 5, 1);
    m.rect(38, 12, 5, 1);
    m.rect(44, 22, 5, 1);
    m.rect(49, 22, 2, 1);
    m.vl(48, 23, 2, 'B');
    m.hl(40, 18, 3, 'H'); m.hl(36, 15, 3, 'H');
    m.hl(43, 9, 2, 'H');
    m.rect(45, 6, 6, 1);
    m.rect(51, 1, 1, 1);
    m.rect(51, 6, 1, 22);
    m.set(4, 12, '*'); m.set(42, 11, '*');
    R('a_resonances', {
      zone: 'ruines', name: 'Salle des résonances', theme: 'ruines', music: 'mystere', dark: 0.45,
      map: m.rows(),
      exits: { left: { to: 'a_sanctuaire', spawn: 'east' }, right: { to: 'x_ascension', spawn: 'bottom' } },
      spawns: { west: [1, 4, { face: 1 }] },
      entities: [
        { type: 'resonator', id: 'r1', idx: 0, note: 72, color: '#ff8ad8', x: 8, y: 24 },
        { type: 'resonator', id: 'r2', idx: 1, note: 76, color: '#ffd14a', x: 13, y: 15 },
        { type: 'resonator', id: 'r3', idx: 2, note: 79, color: '#5ef2d6', x: 40, y: 11 },
        { type: 'resonator', id: 'r4', idx: 3, note: 84, color: '#c38aff', x: 46, y: 21 },
        { type: 'diapason', x: 24, y: 24 },
        { type: 'sign', x: 20, y: 24, style: 'plaque', title: 'Inscription', text: '« Écoute le grand cristal. Puis rends-lui sa chanson, note après note. »' },
        { type: 'gate', id: 'reso_gate', x: 49, y: 5, w: 2, h: 4, style: 'stone', open: 'reso_done' },
        { type: 'polaroid', id: 'p6', x: 50, y: 24 },
        { type: 'enemy', kind: 'flyer', x: 30, y: 12, range: 3 },
        { type: 'checkpoint', x: 18, y: 24 }
      ]
    });
  }
})();
