/* ZONE 2 · LE QUARTIER (reconnexions, fresque, énigme des lampadaires) */
(function () {
  'use strict';
  const HOL = (typeof window !== 'undefined' ? window : globalThis).HOL;
  const MB = HOL.MB, R = HOL.defRoom;

  // ------------------------------------------------------------------ rue des Lilas
  {
    const m = MB(100, 20);
    m.ground(16);
    m.hl(31, 14, 4);          // toit voiture 1
    m.hl(38, 12, 4);          // abribus
    m.hl(44, 12, 6);          // auvent boulangerie
    m.hl(46, 9, 5);           // balcon
    m.set(56, 15, 'F');       // poubelle
    m.rect(60, 14, 2, 2);     // muret
    m.hl(75, 14, 4);          // toit voiture 2
    m.set(39, 11, '*'); m.set(48, 8, '*');
    R('q_rue', {
      zone: 'quartier', name: 'Rue des Lilas', theme: 'quartier', music: 'quartier', openTop: true,
      map: m.rows(),
      exits: { right: { to: 'q_place', spawn: 'west' } },
      spawns: { house: [5, 15, { face: 1 }], east: [98, 15, { face: -1 }] },
      entities: [
        { type: 'deco', kind: 'facade', x: 0, y: 15, w: 10, h: 9, color: '#8a5a7a', door: true, doorX: 176, doorColor: '#8a4a5a', lit: 0.8 },
        { type: 'door', x: 5, y: 15, to: 'm_salon', spawn: 'door', style: 'none', label: 'Rentrer' },
        { type: 'deco', kind: 'tree', x: 11, y: 15, s: 1 },
        { type: 'deco', kind: 'mailbox', x: 14, y: 15 },
        { type: 'deco', kind: 'facade', x: 17, y: 15, w: 9, h: 8, color: '#5a6a98', door: true, doorX: 150, lit: 0.3 },
        { type: 'npc', id: 'keeli', x: 21, y: 15, face: 1 },
        { type: 'deco', kind: 'tree', x: 27, y: 15, s: 0.9, pink: true },
        { type: 'deco', kind: 'car', x: 30, y: 15, w: 5, color: '#c25a6a' },
        { type: 'deco', kind: 'busstop', x: 38, y: 15, w: 4 },
        { type: 'deco', kind: 'facade', x: 43, y: 15, w: 9, h: 10, color: '#a07050', sign: 'BOULANGERIE', signColor: '#ffd14a', lit: 0.4 },
        { type: 'deco', kind: 'awning', x: 44, y: 11, w: 6 },
        { type: 'deco', kind: 'balcony', x: 46, y: 8, w: 5 },
        { type: 'deco', kind: 'bin', x: 56, y: 15 },
        { type: 'deco', kind: 'bench', x: 63, y: 15 },
        { type: 'npc', id: 'cocol', x: 66, y: 15, face: -1 },
        { type: 'deco', kind: 'tree', x: 69, y: 15, s: 1.1 },
        { type: 'deco', kind: 'car', x: 74, y: 15, w: 5, color: '#5aa89a' },
        { type: 'deco', kind: 'facade', x: 81, y: 15, w: 12, h: 9, color: '#6a4a8a', sign: 'CAFÉ DE LA HOUSE', signColor: '#ff8ad8', door: true, doorX: 190, lit: 0.6 },
        { type: 'deco', kind: 'streetlamp', x: 9, y: 15, onIf: 'lamps_done' },
        { type: 'deco', kind: 'streetlamp', x: 35, y: 15, onIf: 'lamps_done' },
        { type: 'deco', kind: 'streetlamp', x: 58, y: 15, onIf: 'lamps_done' },
        { type: 'deco', kind: 'streetlamp', x: 94, y: 15, onIf: 'lamps_done' },
        { type: 'sign', x: 12, y: 15, title: 'Rue des Lilas', text: 'Une plaque de rue. Juste en dessous, un autocollant de la House à moitié décollé.' },
        { type: 'sign', x: 86, y: 15, w: 2, h: 3, invisible: true, title: 'Café de la House', text: 'Fermé. Sur la porte : « De retour après le stream ». Les chaises sont encore sorties, grises comme tout le reste.' }
      ]
    });
  }

  // ------------------------------------------------------------------ place de la House
  {
    const m = MB(96, 24);
    m.ground(20);
    m.hl(6, 17, 6);           // toit du food truck
    m.rect(22, 18, 1, 2);     // marches
    m.rect(23, 17, 1, 3);
    m.rect(24, 16, 10, 4);    // esplanade surélevée
    m.hl(40, 17, 3);          // vasque de la fontaine
    m.hl(57, 17, 8);          // toit du kiosque
    // Le toit est a y=17, soit 3 tuiles au-dessus du sol : on ne l'atteint
    // qu'en sautant en courant. Cette caisse basse, a gauche du kiosque,
    // rend le saut tolerant (on part de 19 au lieu de 20). Une seule tuile
    // de haut, pour ne pas generer le passage du joueur vers le parc.
    m.rect(56, 19, 1, 1);
    m.rect(66, 18, 1, 2, 'F'); // tonneaux
    m.set(8, 16, '*'); m.set(41, 14, '*'); m.set(63, 16, '*');
    R('q_place', {
      zone: 'quartier', name: 'Place de la House', theme: 'quartier', music: 'quartier', openTop: true,
      map: m.rows(),
      exits: { left: { to: 'q_rue', spawn: 'east' }, right: { to: 'q_parc', spawn: 'west' } },
      spawns: { west: [1, 19], east: [94, 19, { face: -1 }], arch: [31, 15, { face: 1 }] },
      initState: { lampSeq: [] },
      entities: [
        { type: 'deco', kind: 'foodtruck', x: 5, y: 19 },
        { type: 'npc', id: 'tacos', x: 14, y: 19, face: 1 },
        { type: 'lamp', id: 'lamp_lune', sym: 'lune', x: 18, y: 19 },
        { type: 'deco', kind: 'tree', x: 20, y: 19, s: 0.8 },
        { type: 'lamp', id: 'lamp_etoile', sym: 'etoile', x: 26, y: 15 },
        { type: 'door', x: 31, y: 15, to: 'q_ruelle', spawn: 'door', style: 'arch', label: 'Entrer dans la ruelle', w: 1.6, h: 2.6 },
        { type: 'deco', kind: 'fountain', x: 38, y: 19 },
        { type: 'sign', x: 46, y: 19, style: 'plaque', title: 'Place de la House', text: 'Sur la plaque : « Ici bat le cœur du quartier ». Quatre lampadaires entourent la fontaine, chacun marqué d\'un symbole.' },
        { type: 'lamp', id: 'lamp_coeur', sym: 'coeur', x: 50, y: 19 },
        { type: 'npc', id: 'misterflo', x: 55, y: 19, face: -1 },
        { type: 'deco', kind: 'kiosk', x: 58, y: 19 },
        { type: 'lamp', id: 'lamp_note', sym: 'note', x: 61, y: 16 },
        { type: 'deco', kind: 'barrels', x: 66, y: 19, h: 2 },
        { type: 'deco', kind: 'tree', x: 72, y: 19, s: 1.1 },
        { type: 'deco', kind: 'bench', x: 77, y: 19 },
        { type: 'deco', kind: 'tree', x: 82, y: 19, s: 0.9, pink: true },
        { type: 'deco', kind: 'parkgate_deco', x: 88, y: 19 },
        { type: 'gate', id: 'park_gate', x: 90, y: 19, w: 2, h: 5, style: 'fog', open: 'lamps_done', msg: 'Une brume épaisse bouche l\'entrée du parc. Impossible de passer. Tous les lampadaires de la place sont éteints…' },
        { type: 'checkpoint', x: 3, y: 19 }
      ]
    });
  }

  // ------------------------------------------------------------------ ruelle (fresque de Charly, escaliers de secours)
  {
    const m = MB(36, 34);
    m.ground(30);
    m.rect(0, 0, 2, 34); m.rect(34, 0, 2, 34);
    m.hl(18, 24, 10);         // palier 1
    m.vl(25, 24, 6);          // échelle 1
    m.hl(10, 18, 12);         // palier 2
    m.vl(20, 18, 6);          // échelle 2
    m.hl(18, 12, 12);         // palier 3
    m.vl(19, 12, 6);          // échelle 3
    m.hl(16, 6, 13);          // palier 4
    m.vl(26, 6, 6);           // échelle 4
    m.vl(17, 0, 6);           // échelle 5 (vers les toits)
    m.set(22, 23, '*'); m.set(11, 17, '*');
    R('q_ruelle', {
      zone: 'quartier', name: 'La ruelle', theme: 'quartier', music: 'quartier', openTop: true,
      map: m.rows(),
      exits: { top: { to: 'q_toits', spawn: 'bottom', range: [16, 18] } },
      spawns: { door: [30, 29, { face: -1 }], top: [17, 1, { climb: true }] },
      entities: [
        { type: 'deco', kind: 'mural', x: 3, y: 29 },
        { type: 'sign', x: 7, y: 29, w: 4, h: 4, invisible: true, label: 'Regarder la fresque', event: 'mural' },
        { type: 'npc', id: 'charly', x: 15, y: 29, face: -1 },
        { type: 'deco', kind: 'bin', x: 27, y: 29 },
        { type: 'deco', kind: 'boxes', x: 22, y: 29, n: 2 },
        { type: 'door', x: 31, y: 29, to: 'q_place', spawn: 'arch', style: 'arch', label: 'Retour sur la place', w: 1.6, h: 2.6 },
        { type: 'light', x: 31, y: 27, r: 120, color: '#ffc46b', a: 0.5 }
      ]
    });
  }

  // ------------------------------------------------------------------ les toits (K974, secret en double saut)
  {
    const m = MB(84, 20);
    m.rect(0, 13, 11, 7);     // toit 1
    m.vl(3, 13, 7);           // échelle vers la ruelle
    m.rect(14, 14, 13, 6);    // toit 2
    m.rect(30, 12, 11, 8);    // toit 3
    m.rect(34, 10, 1, 2);     // cheminée
    m.rect(45, 8, 14, 12);    // toit 4 (haut)
    m.hl(55, 4, 3);           // plateforme de l'antenne
    m.rect(62, 13, 22, 7);    // toit 5
    // ACCES SANS DOUBLE SAUT.
    // Le quartier se fait AVANT le Grand Chene (ou Laura gagne le double saut),
    // donc aucun saut de 4 tuiles ne peut etre obligatoire ici. Le toit 4 etait
    // a 4 tuiles du toit 3 : impossible de monter avec un saut simple.
    m.hl(41, 12, 4);          // passerelle du toit 3 vers l'echelle
    m.vl(44, 8, 4);           // echelle x=44, du toit 3 (y=12) au toit 4 (y=8)
    m.vl(54, 3, 5);           // echelle x=54 (elle depasse de 1 tuile pour pouvoir se poser)
    m.hl(58, 12, 4);          // passerelle du toit 4 vers le toit 5 (cristal)
    // La passerelle ci-dessus est 4 tuiles SOUS le toit 4 : sans cette echelle
    // on pouvait y descendre (vers le cristal) mais plus jamais remonter, donc
    // impasse. Elle passe par x=59, juste a droite du toit 4.
    // IMPORTANT : l'echelle s'arrete a y=11, pas y=12. Si elle prenait aussi la
    // tuile (59,12) de la passerelle, le sol disparaitrait et Laura tomberait
    // en marchant vers l'echelle (une tuile '|' n'est pas une plateforme).
    m.vl(59, 8, 4);           // echelle x=59, de y=8 (toit 4) a y=11
    m.set(34, 9, '*'); m.set(50, 7, '*'); m.set(70, 12, '*');
    R('q_toits', {
      zone: 'quartier', name: 'Les toits', theme: 'quartier', music: 'quartier', openTop: true,
      map: m.rows(),
      exits: { bottom: { to: 'q_ruelle', spawn: 'top', range: [3, 3] } },
      spawns: { bottom: [3, 12, { face: 1 }] },
      entities: [
        { type: 'deco', kind: 'antenna', x: 8, y: 12, h: 2 },
        { type: 'npc', id: 'k974', x: 20, y: 13, face: -1 },
        { type: 'deco', kind: 'boombox', x: 22, y: 13 },
        { type: 'deco', kind: 'antenna', x: 38, y: 11, h: 2 },
        { type: 'deco', kind: 'antenna', x: 56, y: 7, h: 4 },
        { type: 'polaroid', id: 'p2', x: 56, y: 3 },
        { type: 'sign', x: 76, y: 12, title: 'Vue sur la colline', text: 'Au loin, derrière la forêt et la rivière, une antenne clignote en violet sur la colline. Écho frissonne.' },
        { type: 'checkpoint', x: 6, y: 12 }
      ]
    });
  }

  // ------------------------------------------------------------------ parc (vers la forêt)
  {
    const m = MB(50, 20);
    m.ground(16);
    m.rect(20, 14, 8, 2);
    m.rect(28, 13, 6, 3);
    m.hl(30, 10, 3);
    m.set(31, 9, '*');
    R('q_parc', {
      zone: 'quartier', name: 'Le parc', theme: 'quartier', music: 'quartier', openTop: true,
      map: m.rows(),
      exits: { left: { to: 'q_place', spawn: 'east' }, right: { to: 'f_lisiere', spawn: 'west' } },
      spawns: { west: [1, 15], east: [48, 15, { face: -1 }] },
      entities: [
        { type: 'checkpoint', x: 5, y: 15 },
        { type: 'deco', kind: 'bench', x: 8, y: 15 },
        { type: 'npc', id: 'omas', x: 10, y: 15, face: 1, if: 'omas_saved' },
        { type: 'deco', kind: 'tree', x: 13, y: 15, s: 1.2 },
        { type: 'deco', kind: 'tree', x: 24, y: 13, s: 0.9 },
        { type: 'deco', kind: 'tree', x: 36, y: 15, s: 1.3 },
        { type: 'deco', kind: 'signpost', x: 42, y: 15, label: 'FORÊT', dir: 1 },
        { type: 'deco', kind: 'tree', x: 45, y: 15, s: 1, pink: true },
        { type: 'deco', kind: 'streetlamp', x: 18, y: 15, onIf: 'lamps_done' },
        { type: 'trigger', x: 16, y: 15, w: 2, h: 4, event: 'park_call', flag: 'park_call', once: true }
      ]
    });
  }
})();
