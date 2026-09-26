/* ZONE 4 · LA RIVIÈRE ET LES GROTTES (nage, flamme d'Ofire, écluses, Élan, bac de Brazya) */
(function () {
  'use strict';
  const HOL = (typeof window !== 'undefined' ? window : globalThis).HOL;
  const MB = HOL.MB, R = HOL.defRoom, T = HOL.T;

  // ------------------------------------------------------------------ berge (Sylvain, nage)
  {
    const m = MB(100, 24);
    m.ground(16, 0, 14);
    m.ground(23, 15, 64);
    m.rect(15, 18, 50, 5, '~');
    m.hl(15, 16, 10);         // ponton
    // La riviere se traverse en nageant et en sautant : le SAUT sort de l'eau
    // (on monte jusqu'a y=15.2, au-dessus des berges en y=16). Aucune echelle
    // n'est necessaire ici, et les trois piles d'origine sont conserves.
    m.rect(30, 17, 2, 6);
    m.rect(42, 17, 2, 6);
    m.rect(63, 17, 2, 6);
    m.set(31, 16, '*');
    m.ground(16, 65, 99);
    m.rect(80, 6, 7, 10);
    // ALLER ET RETOUR. Le bloc x=80..86 monte jusqu'a y=6 : c'est un mur de
    // 10 tuiles. La salle n'etait concue que dans un sens (gauche -> droite,
    // en passant par les plateformes x=76..78). En revenant de la cascade, le
    // joueur butait dessus a x=87 et ne pouvait PLUS rebrousser chemin.
    // Cette echelle, posee contre la face droite du mur, permet de remonter
    // dessus, de passer a gauche puis de redescendre par les plateformes.
    m.vl(87, 6, 10);
    m.hl(76, 12, 3);
    m.hl(77, 8, 3);
    m.set(82, 5, '*');
    R('r_berge', {
      zone: 'riviere', name: 'La berge', theme: 'riviere', music: 'riviere', openTop: true,
      map: m.rows(), waterColor: '#2a7aa8',
      exits: { left: { to: 'f_sortie', spawn: 'east' }, right: { to: 'r_cascade', spawn: 'west' } },
      spawns: { west: [1, 15, { face: 1 }], east: [98, 15, { face: -1 }] },
      entities: [
        { type: 'checkpoint', x: 3, y: 15 },
        { type: 'sign', x: 8, y: 15, title: 'Rivière', text: '« Baignade à vos risques. » En dessous, au feutre : « L\'eau est froide, mais elle est honnête. · S. »' },
        { type: 'trigger', x: 12, y: 15, w: 2, h: 4, event: 'swim_tuto', flag: 'swim_tuto', once: true },
        { type: 'deco', kind: 'dock', x: 15, y: 16, w: 10 },
        { type: 'npc', id: 'sylvain', x: 11, y: 15, face: 1 },
        { type: 'deco', kind: 'pine', x: 70, y: 15, s: 1.3 },
        { type: 'item', item: 'menthe', x: 85, y: 5 },
        { type: 'deco', kind: 'pine', x: 92, y: 15, s: 1.1 }
      ]
    });
  }

  // ------------------------------------------------------------------ cascade (entrée de la grotte, niche secrète)
  {
    const m = MB(50, 34);
    m.ground(31);
    m.rect(0, 27, 14, 4);
    m.rect(36, 27, 14, 4);
    m.rect(14, 28, 22, 3, '~');
    m.rect(0, 0, 2, 23);
    m.rect(48, 0, 2, 27);
    m.rect(0, 0, 50, 1);
    m.rect(20, 15, 10, 1);
    m.hl(38, 23, 4); m.hl(34, 19, 4); m.hl(30, 15, 4);
    m.hl(12, 11, 4);
    m.hl(9, 9, 4);
    m.rect(0, 6, 9, 1);
    m.rect(0, 9, 9, 1);
    m.vl(7, 7, 2, 'B');
    // Pas d'echelle vers la poche : le mur 'B' ne se casse que pendant un dash
    // (physics.js). Le dash s'obtient a la Galerie aux cristaux, plus loin dans
    // la riviere, et on peut revenir ici apres coup pour recuperer le polaroid p4.
    m.set(39, 22, '*'); m.set(13, 10, '*');
    R('r_cascade', {
      zone: 'riviere', name: 'La cascade', theme: 'riviere', music: 'riviere', layerOffset: 180,
      map: m.rows(), waterColor: '#2a7aa8',
      exits: { left: { to: 'r_berge', spawn: 'east' } },
      spawns: { west: [2, 26, { face: 1 }], cavedoor: [24, 14, { face: -1 }] },
      entities: [
        { type: 'door', x: 24, y: 14, to: 'g_entree', spawn: 'cave', style: 'cave', label: 'Entrer dans la grotte', w: 1.8, h: 2.4 },
        { type: 'deco', kind: 'waterfall', x: 20, y: 27, w: 8, h: 26, fg: true },
        { type: 'polaroid', id: 'p4', x: 4, y: 8 },
        { type: 'checkpoint', x: 42, y: 26 },
        { type: 'deco', kind: 'pine', x: 5, y: 26, s: 1.2 },
        { type: 'light', x: 4, y: 7, r: 90, color: '#ffd28a', a: 0.6 }
      ]
    });
  }

  // ------------------------------------------------------------------ entrée de la grotte (Ofire_83, braseros)
  {
    const m = MB(64, 22);
    m.rect(0, 0, 64, 6);
    m.ground(18, 0, 20);
    m.ground(20, 21, 24); m.hl(21, 19, 4, '^');
    m.ground(18, 25, 34);
    m.ground(15, 35, 40);
    m.set(43, 16, 'x'); m.set(45, 16, 'x');
    m.ground(21, 41, 47); m.hl(41, 20, 7, '^');
    m.ground(17, 48, 63);
    m.rect(0, 6, 1, 12);
    m.set(37, 14, '*');
    m.hl(55, 12, 4); m.set(57, 11, '*');
    R('g_entree', {
      zone: 'riviere', name: 'Grotte des braises', theme: 'grotte', music: 'grotte', dark: 0.9,
      map: m.rows(),
      exits: { right: { to: 'g_ecluses', spawn: 'west' } },
      spawns: { cave: [2, 17, { face: 1 }], east: [62, 16, { face: -1 }] },
      entities: [
        { type: 'door', x: 1, y: 17, to: 'r_cascade', spawn: 'cavedoor', style: 'cave', label: 'Sortir', w: 1.6, h: 2.4 },
        { type: 'npc', id: 'ofire', x: 9, y: 17, face: 1 },
        { type: 'checkpoint', id: 'b1', style: 'brazier', x: 13, y: 17 },
        { type: 'enemy', kind: 'crawler', x: 29, y: 17, range: 3 },
        { type: 'checkpoint', id: 'b2', style: 'brazier', x: 38, y: 14 },
        { type: 'checkpoint', id: 'b3', style: 'brazier', x: 52, y: 16 },
        { type: 'enemy', kind: 'crawler', x: 59, y: 16, range: 3 },
        { type: 'deco', kind: 'bigcrystal', x: 30, y: 17, s: 0.7, color: '#6ae8ff' },
        { type: 'light', x: 30, y: 15, r: 110, color: '#6ae8ff', a: 0.6 }
      ]
    });
  }

  // ------------------------------------------------------------------ écluses (énigme de l'eau)
  {
    const m = MB(44, 32);
    m.rect(0, 0, 44, 4);
    m.rect(0, 0, 2, 10); m.rect(0, 13, 2, 19);
    m.rect(42, 0, 2, 5); m.rect(42, 8, 2, 24);
    m.ground(29);
    m.rect(2, 13, 6, 2);
    m.vl(8, 13, 16);
    m.rect(20, 17, 3, 12);
    m.vl(19, 17, 12);
    m.rect(34, 15, 8, 2);
    m.rect(36, 8, 6, 1);
    // ÉCHELLE VERS LA CORNICHE DU LEVIER (vanne en 37,14).
    // Les deux échelles existantes s'arrêtaient à y=13 et y=17 : la corniche
    // de y=15 était donc inaccessible depuis le bas. Une fois descendu au sol on
    // ne pouvait plus remonter, et l'énigme de l'eau était insoluble.
    // Elle s'arrête à y=15 (le plancher de la corniche reste intact en y=16).
    m.vl(33, 15, 14);
    m.set(12, 28, '*'); m.set(38, 7, '*');
    R('g_ecluses', {
      zone: 'riviere', name: 'Les écluses', theme: 'grotte', music: 'grotte', dark: 0.5,
      map: m.rows(),
      exits: { left: { to: 'g_entree', spawn: 'east' }, right: { to: 'g_galerie', spawn: 'west' } },
      spawns: { west: [2, 12, { face: 1 }], sas: [37, 28, { face: -1 }], east: [40, 7, { face: -1 }] },
      entities: [
        { type: 'water', id: 'eau', x: 2, w: 40, bottom: 28, levels: { low: 29 * T - 14, mid: 18 * T, high: 9 * T }, level: 'mid', color: '#2a6f9a' },
        { type: 'float', id: 'caisse', water: 'eau', x: 29, w: 2, floor: 28 },
        { type: 'sign', x: 5, y: 12, style: 'plaque', title: 'Écluse n°3', text: 'LEVIER DE VIDANGE : pilier central. VANNE DE REMPLISSAGE : corniche est, manivelle rangée dans le sas de maintenance. Le sas ne s\'ouvre qu\'à sec.' },
        { type: 'lever', id: 'drain', x: 21, y: 16, event: 'ecluse_lever', label: 'Levier de vidange' },
        { type: 'lever', id: 'valve', style: 'valve', x: 37, y: 14, event: 'ecluse_valve', need: 'manivelle', label: 'Vanne de remplissage' },
        { type: 'door', x: 38, y: 28, to: 'g_machinerie', spawn: 'sas', style: 'sas', label: 'Ouvrir le sas', locked: 'water:low', lockedMsg: 'La porte du sas refuse de s\'ouvrir sous l\'eau. Il faudrait vider le bassin.', openIf: 'water:low' },
        { type: 'light', x: 21, y: 15, r: 150, color: '#9ae6ff', a: 0.7 },
        { type: 'light', x: 38, y: 13, r: 120, color: '#ffd28a', a: 0.6 },
        { type: 'light', x: 4, y: 11, r: 120, color: '#ffd28a', a: 0.6 },
        { type: 'checkpoint', id: 'b4', style: 'brazier', x: 3, y: 12 }
      ]
    });
  }

  // ------------------------------------------------------------------ salle des machines (manivelle, sel)
  {
    const m = MB(30, 17);
    m.rect(0, 0, 30, 2); m.ground(14); m.rect(0, 0, 2, 17); m.rect(28, 0, 2, 17);
    m.hl(18, 10, 5); m.set(20, 9, '*');
    R('g_machinerie', {
      zone: 'riviere', name: 'Salle des machines', theme: 'grotte', music: 'grotte', dark: 0.45,
      map: m.rows(),
      exits: {},
      spawns: { sas: [4, 13, { face: 1 }] },
      entities: [
        { type: 'door', x: 3, y: 13, to: 'g_ecluses', spawn: 'sas', style: 'sas', label: 'Ressortir', openIf: 'true' },
        { type: 'deco', kind: 'workbench', x: 9, y: 13, w: 5 },
        { type: 'item', item: 'manivelle', x: 12, y: 11 },
        { type: 'sign', x: 7, y: 13, style: 'letter', title: 'Carnet d\'Andyblct', text: '« Les écluses règlent toute la rivière. Si elles se bloquent, le courant devient fou. Je pars cartographier la galerie aux cristaux, plus à l\'est. Note : ne jamais oublier la manivelle ici. »' },
        { type: 'deco', kind: 'bigcrystal', x: 24, y: 13, s: 0.8, color: '#e8f4ff' },
        { type: 'item', item: 'sel', x: 25, y: 12 },
        { type: 'light', x: 12, y: 10, r: 160, color: '#ffd28a', a: 0.8 },
        { type: 'light', x: 24, y: 11, r: 140, color: '#cfe8ff', a: 0.8 }
      ]
    });
  }

  // ------------------------------------------------------------------ galerie aux cristaux (Élan, Andyblct)
  {
    const m = MB(76, 24);
    m.rect(0, 0, 76, 3);
    m.rect(0, 3, 1, 2);
    m.ground(9, 0, 8);
    m.ground(12, 9, 12);
    m.ground(16, 13, 40);
    m.rect(41, 3, 1, 10);
    m.vl(41, 13, 3, 'B');
    m.ground(16, 42, 51);
    m.rect(48, 3, 7, 11);
    m.ground(16, 55, 75);
    m.clear(52, 16, 3, 8);
    m.hl(52, 22, 3, '^'); m.ground(23, 52, 54);
    m.set(6, 8, '*'); m.set(60, 15, '*');
    R('g_galerie', {
      zone: 'riviere', name: 'Galerie aux cristaux', theme: 'grotte', music: 'grotte', dark: 0.55,
      map: m.rows(),
      exits: { left: { to: 'g_ecluses', spawn: 'east' }, right: { to: 'r_passeur', spawn: 'west' } },
      spawns: { west: [1, 8, { face: 1 }], east: [74, 15, { face: -1 }] },
      entities: [
        { type: 'deco', kind: 'bigcrystal', x: 17, y: 15, s: 0.9, color: '#e86aff' },
        { type: 'deco', kind: 'bigcrystal', x: 25, y: 15, s: 1.6, color: '#6ae8ff' },
        { type: 'shrine', ability: 'dash', x: 26, y: 15, color: '#6ae8ff' },
        { type: 'deco', kind: 'bigcrystal', x: 34, y: 15, s: 1.0, color: '#e86aff' },
        { type: 'enemy', kind: 'crawler', x: 33, y: 15, range: 3 },
        { type: 'trigger', x: 37, y: 15, w: 2, h: 4, event: 'andy_voice', flag: 'andy_voice', once: true },
        { type: 'npc', id: 'andyblct', x: 45, y: 15, face: -1 },
        { type: 'deco', kind: 'bigcrystal', x: 62, y: 15, s: 1.2, color: '#7aff9a' },
        { type: 'enemy', kind: 'flyer', x: 66, y: 11, range: 3 },
        { type: 'checkpoint', x: 57, y: 15 },
        { type: 'light', x: 17, y: 12, r: 170, color: '#e86aff', a: 0.8 },
        { type: 'light', x: 26, y: 12, r: 220, color: '#6ae8ff', a: 0.9 },
        { type: 'light', x: 34, y: 12, r: 170, color: '#e86aff', a: 0.8 },
        { type: 'light', x: 45, y: 13, r: 140, color: '#ffd28a', a: 0.6 },
        { type: 'light', x: 62, y: 12, r: 190, color: '#7aff9a', a: 0.8 },
        { type: 'light', x: 5, y: 6, r: 140, color: '#6ae8ff', a: 0.6 }
      ]
    });
  }

  // ------------------------------------------------------------------ bac du passeur (Brazya)
  {
    const m = MB(90, 22);
    m.ground(16, 0, 18);
    // SORTIR DE LA RIVIERE. Le joueur flotte les pieds a y=18.9 et son saut ne
    // monte que de 1.55 tuile, soit y=17.4 : les rives sont a y=16. Il manquait
    // donc 1.4 tuile, et celui qui tombe du bac restait bloque au fond de
    // l'eau, incapable de ressortir. Cette echelle, au bord du quai, lui
    // permet de remonter jusqu'a la rive. Elle ne gene pas le bac : on ne
    // s'accroche a une echelle qu'en appuyant sur HAUT.
    m.vl(19, 16, 5);
    m.rect(4, 8, 4, 8);
    // ALLER ET RETOUR. Le rocher x=4..7 fait 8 tuiles de haut (y=8 a 15) et
    // il BARRE le sol : on ne peut pas aller vers la sortie de gauche sans
    // passer par-dessus. Aucun saut ne permet 8 tuiles, meme avec le double
    // saut. Cette echelle, contre sa face droite, permet de remonter puis de
    // repartir a gauche.
    m.vl(8, 8, 8);
    m.hl(0, 12, 3);
    m.ground(21, 19, 72);
    m.ground(16, 73, 89);
    m.hl(78, 12, 4); m.set(80, 11, '*');
    m.set(5, 7, '*');
    R('r_passeur', {
      zone: 'riviere', name: 'Le bac du passeur', theme: 'riviere', music: 'riviere', openTop: true,
      map: m.rows(), layerOffset: 40,
      exits: { left: { to: 'g_galerie', spawn: 'east' }, right: { to: 'a_sentier', spawn: 'west' } },
      spawns: { west: [1, 15, { face: 1 }], east: [88, 15, { face: -1 }] },
      entities: [
        { type: 'water', id: 'riv', x: 19, w: 54, bottom: 20, levels: { mid: 17 * T + 4 }, level: 'mid', current: -420, color: '#2a7aa8' },
        { type: 'lever', id: 'winch', style: 'winch', x: 6, y: 7, event: 'winch', label: 'Réparer le treuil', flag: 'cable_done' },
        { type: 'deco', kind: 'rope', x: 18, y: 15, len: 55 },
        { type: 'npc', id: 'brazya', x: 14, y: 15, face: 1 },
        { type: 'ferry', id: 'ferry', x: 19, y: 16, w: 4 },
        { type: 'sign', x: 11, y: 15, title: 'Bac de Brazya', text: '« Traversée gratuite pour la House. Pour les autres aussi, en fait. »' },
        { type: 'checkpoint', x: 2, y: 15 },
        { type: 'deco', kind: 'pine', x: 84, y: 15, s: 1.3 }
      ]
    });
  }
})();
