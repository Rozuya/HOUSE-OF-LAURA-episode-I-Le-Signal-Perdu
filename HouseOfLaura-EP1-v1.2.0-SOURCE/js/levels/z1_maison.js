/* ZONE 1 · LA MAISON (introduction, tutoriel, énigme du tableau électrique) */
(function () {
  'use strict';
  const HOL = (typeof window !== 'undefined' ? window : globalThis).HOL;
  const MB = HOL.MB, R = HOL.defRoom;

  // ------------------------------------------------------------------ chambre
  {
    const m = MB(40, 17);
    m.rect(0, 0, 40, 2);
    m.ground(14);
    m.rect(0, 0, 2, 17);
    m.rect(38, 0, 2, 11);
    m.hl(23, 12, 7);          // lit
    m.hl(25, 9, 4);           // étagère
    m.rect(32, 8, 3, 6);      // armoire
    m.set(13, 13, 'F');       // carton
    m.set(26, 8, '*'); m.set(33, 7, '*');
    R('m_chambre', {
      zone: 'maison', name: 'Chambre de Laura', theme: 'maison', music: 'maison', indoor: true,
      ledY: 66, layersKey: 'in',
      map: m.rows(),
      exits: { right: { to: 'm_salon', spawn: 'west' } },
      spawns: { default: [7, 13], desk: [7, 13], east: [36, 13, { face: -1 }] },
      initState: { power: true },
      darkFn: (room, S) => (room.state.power === false ? 0.82 : 0),
      entities: [
        { type: 'deco', kind: 'window', x: 14, y: 9, w: 4, h: 3 },
        { type: 'deco', kind: 'poster', x: 10, y: 8, pw: 40, ph: 56, text: 'HOUSE', icon: 'heart' },
        { type: 'deco', kind: 'poster', x: 19, y: 8, pw: 36, ph: 48, c1: '#3fd6b5', c2: '#2a4a8a', icon: 'star', text: 'LIVE' },
        { type: 'deco', kind: 'frame', x: 29, y: 6, pw: 30, ph: 24 },
        { type: 'deco', kind: 'frame', x: 30, y: 7, pw: 24, ph: 30, c1: '#ffd14a', c2: '#ff5fae' },
        { type: 'deco', kind: 'fairylights', x: 20, y: 1, w: 12 },
        { type: 'deco', kind: 'desk', x: 2, y: 13, w: 6, clear: true, cw: 6, ch: 3 },
        { type: 'deco', kind: 'chair', x: 6, y: 13 },
        { type: 'deco', kind: 'bed', x: 23, y: 13, w: 7 },
        { type: 'deco', kind: 'shelfdeco', x: 25, y: 8, items: ['book', 'figure', 'trophy'] },
        { type: 'deco', kind: 'wardrobe', x: 32, y: 13, w: 3, h: 6 },
        { type: 'deco', kind: 'boxes', x: 13, y: 13, n: 1 },
        { type: 'deco', kind: 'lampfloor', x: 21, y: 13 },
        { type: 'deco', kind: 'plant', x: 35, y: 13 },
        { type: 'deco', kind: 'plant', x: 16, y: 13, s: 0.8 },
        { type: 'sign', x: 5, y: 13, w: 3, h: 3, invisible: true, label: 'Regarder', event: 'pc' },
        { type: 'sign', x: 11, y: 13, w: 2, h: 3, invisible: true, title: 'Affiche', text: 'Une grande affiche « HOUSE OF LAURA ». Dans un coin, des dizaines de petites signatures au feutre. Toute la communauté est passée par là.' },
        { type: 'sign', x: 15, y: 13, w: 3, h: 3, invisible: true, label: 'Regarder', event: 'window_chambre' },
        { type: 'sign', x: 33, y: 13, w: 2, h: 3, invisible: true, title: 'Armoire', text: 'Des vêtements, des sweats de la House… et beaucoup trop de chaussures blanches.' }
      ]
    });
  }

  // ------------------------------------------------------------------ salon
  {
    const m = MB(60, 20);
    m.rect(0, 0, 60, 2);
    m.rect(40, 0, 7, 4);      // plafond bas (trappe du grenier)
    m.ground(16);
    m.rect(0, 0, 2, 13);
    m.rect(58, 0, 2, 20);
    m.vl(51, 16, 4);          // échelle vers le garage
    m.hl(6, 14, 6);           // canapé
    m.hl(3, 11, 4);           // étagère murale
    m.rect(27, 13, 2, 3, 'F'); // frigo
    m.hl(20, 10, 6);          // placards
    m.hl(38, 13, 2);          // guéridon
    m.hl(40, 10, 6);          // bibliothèque (va jusqu'à x=45 pour rejoindre l'échelle)
    m.hl(41, 6, 4);           // étagère haute (la trappe du grenier est au-dessus)
    // ÉCHELLE VERS LA TRAPPE DU GRENIER.
    // Avant, il fallait 4 tuiles d'un coup (bibliothèque y=10 -> étagère y=6),
    // donc le double saut, obtenu bien plus tard au Grand Chêne : le grenier
    // était inaccessible au début de la partie. Le grenier fait partie de la
    // maison, il doit l'être avec les commandes de base.
    // L'échelle s'arrête a y=9 et la bibliothèque passe en x=45 : sans ce pont,
    // le joueur tombe dans le vide en longeant le bord droit de la plateforme.
    m.vl(45, 6, 4);           // échelle x=45, de y=6 (étagère) à y=9
    m.set(4, 10, '*'); m.set(21, 9, '*');
    R('m_salon', {
      zone: 'maison', name: 'Salon', theme: 'maison', music: 'maison', indoor: true,
      ledY: 66, layersKey: 'in',
      map: m.rows(),
      exits: {
        left: { to: 'm_chambre', spawn: 'east' },
        bottom: { to: 'm_garage', spawn: 'top', range: [50, 52] }
      },
      spawns: { west: [2, 15], stairs: [51, 15, { face: -1 }], door: [55, 15, { face: -1 }], hatch: [42, 5, { face: -1 }] },
      initState: { power: true },
      darkFn: (room, S) => (S.flag('power_on') || !S.flag('intro_done') ? 0 : 0.8),
      entities: [
        { type: 'deco', kind: 'sofa', x: 6, y: 15, w: 6 },
        { type: 'deco', kind: 'shelfdeco', x: 3, y: 10, items: ['plant', 'book'] },
        { type: 'deco', kind: 'tv', x: 14, y: 15 },
        { type: 'deco', kind: 'lampfloor', x: 12, y: 15 },
        { type: 'deco', kind: 'counter', x: 20, y: 15, w: 6 },
        { type: 'deco', kind: 'cabinets', x: 20, y: 9, w: 6 },
        { type: 'deco', kind: 'shelfdeco', x: 22, y: 9, items: ['box', 'plant'] },
        { type: 'deco', kind: 'fridge', x: 27, y: 15 },
        { type: 'deco', kind: 'window', x: 30, y: 12, w: 5, h: 3, fog: true },
        { type: 'deco', kind: 'frame', x: 17, y: 11, pw: 34, ph: 26, c1: '#b388ff', c2: '#3fd6b5' },
        { type: 'deco', kind: 'bookshelf', x: 40, y: 15, w: 5, h: 5 },
        { type: 'deco', kind: 'shelfdeco', x: 41, y: 5, items: ['cam', 'box'] },
        { type: 'deco', kind: 'plant', x: 36, y: 15 },
        { type: 'deco', kind: 'plant', x: 47, y: 15, s: 1.2 },
        { type: 'deco', kind: 'fairylights', x: 3, y: 1, w: 14 },
        { type: 'npc', id: 'tony', x: 33, y: 15, face: -1 },
        { type: 'door', x: 55, y: 15, to: 'q_rue', spawn: 'house', style: 'wood', color: '#8a4a5a', label: 'Sortir', locked: 'power_on', lockedEvent: 'door_locked' },
        { type: 'door', x: 42, y: 5, h: 1.6, to: 'm_grenier', spawn: 'hatch', style: 'hatch', label: 'Monter au grenier' },
        { type: 'sign', x: 15, y: 15, w: 2, h: 3, invisible: true, label: 'Regarder', event: 'tv_salon' },
        { type: 'trigger', x: 22, y: 15, w: 2, h: 4, event: 'meet_tony', flag: 'met_tony_trig', once: true }
      ]
    });
  }

  // ------------------------------------------------------------------ garage
  {
    const m = MB(46, 20);
    m.rect(0, 0, 46, 2);
    m.clear(4, 0, 1, 2);
    m.vl(4, 0, 17);           // échelle
    m.ground(17);
    m.rect(0, 0, 2, 20); m.rect(44, 0, 2, 20);
    m.hl(9, 15, 4);           // toit de la voiture (2 tuiles, tres bas)
    // Salle volontairement SIMPLE et SANS RISQUE :
    //   sol degage -> on avance tout droit -> echelle a droite -> fusible
    //   -> on redescend -> tableau electrique -> retour a gauche -> echelle de gauche
    //      (celle-la ramene dans le salon, donc dans la maison).
    // Aucun obstacle au sol, aucune plateforme intermediaire, aucun saut necessaire.
    m.hl(32, 7, 6);           // étagère haute (le fusible est dessus)
    m.vl(34, 7, 10);          // échelle vers l'étagère haute
    m.set(10, 14, '*'); m.set(33, 6, '*');
    R('m_garage', {
      zone: 'maison', name: 'Garage', theme: 'maison', music: 'maison', indoor: true,
      ledY: 66, layersKey: 'in',
      map: m.rows(),
      exits: { top: { to: 'm_salon', spawn: 'stairs' } },
      spawns: { top: [4, 2, { climb: true }] },
      initState: { power: false, fuseSw: [0, 0, 0, 0] },
      darkFn: (room, S) => (S.flag('power_on') ? 0.3 : 0.9),
      entities: [
        { type: 'deco', kind: 'car', x: 8, y: 16, w: 5, color: '#4a6aa8' },
        { type: 'deco', kind: 'workbench', x: 13, y: 16, w: 5 },
        { type: 'deco', kind: 'radio', x: 15, y: 16, dy: -38 },
        { type: 'deco', kind: 'shelfdeco', x: 30, y: 6, items: ['box', 'box'] },
        { type: 'deco', kind: 'fusebox_prop', x: 38, y: 14 },
        { type: 'item', item: 'fusible', icon: 'toolbox', x: 36, y: 6, interactOnly: true, label: 'Fouiller la caisse' },
        { type: 'sign', x: 36, y: 16, h: 2, style: 'note', title: 'Note de Tony', text: 'Si le courant saute encore : interrupteurs 1 EN HAUT · 2 EN BAS · 3 EN BAS · 4 EN HAUT. Puis le gros levier rouge. PAS l\'inverse !! · T.' },
        { type: 'lever', x: 37, y: 16, event: 'fuse_sw', idx: 0, label: 'Interrupteur 1' },
        { type: 'lever', x: 38, y: 16, event: 'fuse_sw', idx: 1, label: 'Interrupteur 2' },
        { type: 'lever', x: 39, y: 16, event: 'fuse_sw', idx: 2, label: 'Interrupteur 3' },
        { type: 'lever', x: 40, y: 16, event: 'fuse_sw', idx: 3, label: 'Interrupteur 4' },
        { type: 'lever', x: 42, y: 16, event: 'fuse_main', label: 'Réarmer', id: 'fuse_main' },
        { type: 'sign', x: 15, y: 16, w: 3, h: 2, invisible: true, label: 'Écouter', event: 'radio_garage' },
        { type: 'light', x: 40, y: 13, r: 60, color: '#e05a5a', a: 0.6, if: '!power_on' }
      ]
    });
  }

  // ------------------------------------------------------------------ grenier (secret, double saut)
  {
    const m = MB(32, 12);
    m.rect(0, 0, 32, 2);
    m.ground(9);
    m.rect(0, 0, 2, 12); m.rect(30, 0, 2, 12);
    m.rect(2, 2, 4, 1); m.rect(2, 3, 2, 1);
    m.rect(26, 2, 4, 1); m.rect(28, 3, 2, 1);
    m.hl(13, 6, 6);           // poutre
    m.rect(26, 7, 3, 2);      // cartons
    m.set(15, 5, '*');
    R('m_grenier', {
      zone: 'maison', name: 'Grenier', theme: 'maison', music: 'maison', indoor: true,
      ledY: -999, layersKey: 'in',
      map: m.rows(),
      exits: {},
      spawns: { hatch: [5, 8, { face: 1 }] },
      initState: { power: false },
      dark: 0.55,
      entities: [
        { type: 'door', x: 4, y: 8, h: 1.2, to: 'm_salon', spawn: 'hatch', style: 'hatchup', label: 'Redescendre' },
        { type: 'deco', kind: 'boxes', x: 26, y: 8, n: 3 },
        { type: 'deco', kind: 'boxes', x: 8, y: 8, n: 2 },
        { type: 'deco', kind: 'window', x: 20, y: 5, w: 2, h: 2 },
        { type: 'light', x: 21, y: 4, r: 200, color: '#b8c8ff', a: 0.9 },
        { type: 'polaroid', id: 'p1', x: 27, y: 6 },
        { type: 'sign', x: 9, y: 8, w: 2, h: 2, invisible: true, title: 'Carton « PREMIERS STREAMS »', text: 'La vieille webcam, un micro rafistolé avec du scotch, et une liste de pseudos griffonnée au stylo. Les tout premiers membres de la House.' },
        { type: 'sign', x: 17, y: 8, w: 2, h: 2, style: 'tape', title: 'Cassette', text: 'Une cassette étiquetée « Rires du chat · best of ». Quelqu\'un l\'a écoutée beaucoup, beaucoup de fois.' }
      ]
    });
  }
})();
