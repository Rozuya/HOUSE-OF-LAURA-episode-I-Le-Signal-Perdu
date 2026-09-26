/* ZONE 3 · LA FORÊT DES MURMURES (premiers ennemis, pierres chantantes, Saut Plume, poursuite) */
(function () {
  'use strict';
  const HOL = (typeof window !== 'undefined' ? window : globalThis).HOL;
  const MB = HOL.MB, R = HOL.defRoom;

  // ------------------------------------------------------------------ lisière
  {
    const m = MB(90, 20);
    m.ground(16, 0, 15);
    m.rect(16, 14, 4, 6);
    m.ground(18, 20, 23); m.hl(20, 17, 4, '^');
    m.ground(15, 24, 30);
    m.ground(16, 31, 40);
    m.set(38, 15, 'o');
    m.hl(36, 9, 6);
    m.set(39, 8, '*');
    m.ground(18, 41, 50);
    m.hl(44, 14, 3);
    m.ground(16, 51, 60);
    m.hl(55, 13, 3);
    m.hl(58, 10, 3);
    m.set(59, 9, '*');
    m.ground(16, 61, 89);
    m.hl(66, 15, 2, '^');
    m.hl(78, 15, 1, '^');
    R('f_lisiere', {
      zone: 'foret', name: 'Lisière de la forêt', theme: 'foret', music: 'foret', openTop: true,
      map: m.rows(),
      exits: { left: { to: 'q_parc', spawn: 'east' }, right: { to: 'f_sousbois', spawn: 'west' } },
      spawns: { west: [1, 15], east: [88, 15, { face: -1 }] },
      entities: [
        { type: 'deco', kind: 'pine', x: 3, y: 15, s: 1.3 },
        { type: 'sign', x: 7, y: 15, title: 'Forêt des Murmures', text: 'Un vieux panneau en bois : « Forêt des Murmures. Merci de ne pas nourrir les ombres. » Quelqu\'un a dessiné un petit fantôme à côté.' },
        { type: 'trigger', x: 11, y: 15, w: 2, h: 4, event: 'lisiere_intro', flag: 'lisiere_intro', once: true },
        { type: 'deco', kind: 'pine', x: 21, y: 17, s: 1.1 },
        { type: 'enemy', kind: 'crawler', x: 27, y: 14, range: 2 },
        { type: 'deco', kind: 'log', x: 32, y: 15, w: 3 },
        { type: 'checkpoint', x: 34, y: 15 },
        { type: 'enemy', kind: 'crawler', x: 47, y: 17, range: 3 },
        { type: 'deco', kind: 'pine', x: 52, y: 15, s: 1.5 },
        { type: 'deco', kind: 'pine', x: 64, y: 15, s: 1.2 },
        { type: 'deco', kind: 'log', x: 70, y: 15, w: 4 },
        { type: 'enemy', kind: 'crawler', x: 74, y: 15, range: 3 },
        { type: 'deco', kind: 'pine', x: 84, y: 15, s: 1.4 }
      ]
    });
  }

  // ------------------------------------------------------------------ sous-bois (Omas)
  {
    const m = MB(96, 24);
    m.ground(20, 0, 12);
    m.ground(22, 13, 18); m.hl(13, 21, 6, '^');
    m.set(14, 18, 'x'); m.set(16, 18, 'x');
    m.ground(20, 19, 50);
    m.hl(22, 17, 4); m.hl(26, 14, 4); m.hl(22, 11, 4);
    m.ground(22, 51, 58); m.hl(51, 21, 8, '^');
    m.hl(53, 17, 2); m.hl(57, 17, 2);
    m.ground(20, 59, 95);
    m.rect(66, 17, 6, 3);
    m.set(68, 16, '*');
    m.rect(80, 17, 4, 3);
    m.hl(86, 14, 4);
    m.set(88, 13, '*');
    R('f_sousbois', {
      zone: 'foret', name: 'Sous-bois', theme: 'foret', music: 'foret', openTop: true, dark: 0.35,
      map: m.rows(),
      exits: { left: { to: 'f_lisiere', spawn: 'east' }, right: { to: 'f_clairiere', spawn: 'west' } },
      spawns: { west: [1, 19], east: [94, 19, { face: -1 }] },
      entities: [
        { type: 'deco', kind: 'pine', x: 4, y: 19, s: 1.4 },
        { type: 'deco', kind: 'bigmush', x: 24, y: 19 },
        { type: 'item', item: 'piment', x: 23, y: 10 },
        { type: 'trigger', x: 27, y: 19, w: 2, h: 5, event: 'omas_scene', flag: 'omas_scene', once: true },
        { type: 'enemy', kind: 'crawler', x: 32, y: 19, range: 2, id: 'om_e1' },
        { type: 'deco', kind: 'bigmush', x: 35, y: 19, s: 1.3 },
        { type: 'npc', id: 'omas', x: 37, y: 19, face: -1, ifnot: 'omas_saved' },
        { type: 'enemy', kind: 'crawler', x: 41, y: 19, range: 2, id: 'om_e2' },
        { type: 'checkpoint', x: 46, y: 19 },
        { type: 'deco', kind: 'pine', x: 62, y: 19, s: 1.5 },
        { type: 'enemy', kind: 'flyer', x: 74, y: 13, range: 3 },
        { type: 'enemy', kind: 'crawler', x: 76, y: 19, range: 3 },
        { type: 'deco', kind: 'pine', x: 91, y: 19, s: 1.2 },
        { type: 'light', x: 23, y: 9, r: 90, color: '#ff8a5a', a: 0.6 },
        { type: 'light', x: 36, y: 17, r: 110, color: '#b8ff9a', a: 0.5 }
      ]
    });
  }

  // ------------------------------------------------------------------ clairière (énigme des pierres chantantes)
  {
    const m = MB(62, 22);
    m.ground(19);
    m.rect(60, 0, 2, 15);
    m.rect(16, 16, 2, 3);
    m.rect(18, 14, 9, 2);
    m.hl(34, 16, 3); m.hl(35, 13, 3);
    m.rect(38, 11, 7, 2);
    m.set(43, 10, '*');
    R('f_clairiere', {
      zone: 'foret', name: 'Clairière des pierres', theme: 'foret', music: 'foret', openTop: true,
      map: m.rows(),
      exits: { left: { to: 'f_sousbois', spawn: 'east' }, right: { to: 'f_chene', spawn: 'west' } },
      spawns: { west: [1, 18], east: [60, 18, { face: -1 }] },
      entities: [
        { type: 'lever', x: 3, y: 18, style: 'totem', event: 'stones_reset', label: 'Toucher le totem' },
        { type: 'sign', x: 5, y: 18, style: 'stone', title: 'Pierre gravée', text: 'Trois pierres, trois voix. Posez chacune sur une dalle, et le chemin s\'ouvrira. (Le totem, à gauche, ramène les pierres à leur place.)' },
        { type: 'block', id: 's1', x: 8, y: 18 },
        { type: 'plate', id: 'p1', idx: 0, x: 12, y: 18 },
        { type: 'block', id: 's2', x: 21, y: 13 },
        { type: 'deco', kind: 'stonecircle', x: 24, y: 18 },
        { type: 'plate', id: 'p2', idx: 1, x: 31, y: 18 },
        { type: 'block', id: 's3', x: 40, y: 10 },
        { type: 'plate', id: 'p3', idx: 2, x: 50, y: 18 },
        { type: 'deco', kind: 'pine', x: 53, y: 18, s: 1.3 },
        { type: 'gate', id: 'roots', x: 58, y: 18, w: 2, h: 4, style: 'roots', open: 'stones_done', msg: 'D\'énormes racines bouchent le passage. Elles semblent vibrer faiblement, comme si elles attendaient quelque chose.' }
      ]
    });
  }

  // ------------------------------------------------------------------ le Grand Chêne (Drulysf, Saut Plume)
  {
    const m = MB(48, 30);
    m.ground(26);
    m.rect(0, 0, 48, 1);
    m.clear(7, 0, 6, 1);
    m.rect(40, 13, 8, 13);
    m.rect(0, 0, 2, 22);
    m.hl(30, 22, 4); m.hl(35, 18, 4); m.hl(34, 14, 4);
    m.hl(3, 22, 4); m.hl(8, 18, 4); m.hl(3, 14, 4); m.hl(8, 10, 4); m.hl(3, 6, 4); m.hl(8, 2, 4);
    m.set(5, 21, '*');
    R('f_chene', {
      zone: 'foret', name: 'Le Grand Chêne', theme: 'foret', music: 'foret',
      map: m.rows(),
      exits: {
        left: { to: 'f_clairiere', spawn: 'east' },
        right: { to: 'f_sortie', spawn: 'west' },
        top: { to: 'f_canopee', spawn: 'bottom', range: [7, 12] }
      },
      spawns: { west: [2, 25], top: [9, 1, { face: 1 }], east: [46, 12, { face: -1 }] },
      entities: [
        { type: 'deco', kind: 'bigtree', x: 24, y: 25 },
        { type: 'checkpoint', x: 12, y: 25 },
        { type: 'npc', id: 'drulysf', x: 17, y: 25, face: 1 },
        { type: 'shrine', ability: 'djump', x: 21, y: 25, color: '#c9f0ff', need: 'drulysf_ok' },
        { type: 'deco', kind: 'pine', x: 36, y: 25, s: 1.1 },
        { type: 'light', x: 24, y: 20, r: 260, color: '#e8ffb0', a: 0.5 }
      ]
    });
  }

  // ------------------------------------------------------------------ canopée (optionnel : Pixel, polaroïd)
  {
    const m = MB(72, 20);
    m.ground(18);
    m.clear(9, 18, 3, 2);
    m.hl(8, 17, 5);
    m.hl(16, 14, 5);
    m.rect(24, 11, 4, 1);
    m.set(31, 17, 'o');
    m.hl(30, 8, 5); m.set(32, 7, '*');
    m.set(38, 12, 'x'); m.set(40, 12, 'x');
    m.hl(44, 10, 5);
    m.hl(52, 7, 5); m.set(54, 6, '*');
    m.hl(60, 11, 4);
    m.rect(64, 9, 7, 1);
    m.hl(68, 4, 3);
    R('f_canopee', {
      zone: 'foret', name: 'La canopée', theme: 'foret', music: 'foret', openTop: true, layerOffset: 120,
      map: m.rows(),
      exits: { bottom: { to: 'f_chene', spawn: 'top', range: [9, 11] } },
      spawns: { bottom: [10, 16, { face: 1 }] },
      entities: [
        { type: 'enemy', kind: 'flyer', x: 46, y: 6, range: 3 },
        { type: 'cat', x: 67, y: 8, face: -1 },
        { type: 'polaroid', id: 'p3', x: 69, y: 3 },
        { type: 'sign', x: 18, y: 13, title: 'Nid abandonné', text: 'Un nid tout rond, vide. Quelques plumes blanches dépassent. Écho les regarde avec beaucoup d\'intérêt.' }
      ]
    });
  }

  // ------------------------------------------------------------------ sortie de la forêt (poursuite)
  {
    const m = MB(120, 20);
    m.ground(13, 0, 10);
    m.ground(13, 15, 24);
    m.rect(25, 11, 1, 2);
    m.ground(13, 25, 35);
    m.hl(30, 12, 2, '^');
    m.set(38, 12, 'x');
    m.ground(13, 41, 45);
    m.ground(12, 46, 49); m.ground(11, 50, 53);
    m.ground(10, 54, 70);
    m.rect(60, 8, 1, 2);
    m.set(60, 5, '*');
    m.ground(11, 76, 89);
    m.ground(12, 90, 95);
    m.ground(14, 100, 105); m.ground(16, 106, 111); m.ground(17, 112, 119);
    m.set(108, 13, '*');
    R('f_sortie', {
      zone: 'foret', name: 'Orée de la forêt', theme: 'foret', music: 'foret', openTop: true,
      map: m.rows(),
      exits: { left: { to: 'f_chene', spawn: 'east' }, right: { to: 'r_berge', spawn: 'west' } },
      spawns: { west: [1, 12, { face: 1 }], east: [118, 16, { face: -1 }] },
      entities: [
        { type: 'chaser', id: 'chaser', start: -8, speed: 175, dir: 'right' },
        { type: 'trigger', x: 5, y: 12, w: 2, h: 5, event: 'chase_start', once: false, if: '!chase1_done' },
        { type: 'trigger', x: 101, y: 13, w: 2, h: 8, event: 'chase_end', once: false, if: '!chase1_done' },
        { type: 'deco', kind: 'pine', x: 8, y: 12, s: 1.2 },
        { type: 'deco', kind: 'pine', x: 20, y: 12, s: 1.4 },
        { type: 'deco', kind: 'log', x: 43, y: 12, w: 2 },
        { type: 'deco', kind: 'pine', x: 57, y: 9, s: 1.2 },
        { type: 'deco', kind: 'pine', x: 66, y: 9, s: 1.5 },
        { type: 'deco', kind: 'pine', x: 84, y: 10, s: 1.3 },
        { type: 'deco', kind: 'signpost', x: 114, y: 16, label: 'RIVIÈRE', dir: 1 }
      ]
    });
  }
})();
