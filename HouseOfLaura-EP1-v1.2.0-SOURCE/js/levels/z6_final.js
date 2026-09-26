/* ZONE 6 · LE CŒUR DU SILENCE (ascension sous la brume montante, combat final) */
(function () {
  'use strict';
  const HOL = (typeof window !== 'undefined' ? window : globalThis).HOL;
  const MB = HOL.MB, R = HOL.defRoom;

  // ------------------------------------------------------------------ ascension de l'antenne
  {
    const m = MB(34, 64);
    m.rect(0, 0, 34, 1); m.clear(14, 0, 6, 1);
    m.rect(0, 0, 2, 64); m.rect(32, 0, 2, 64);
    m.ground(62);
    m.hl(6, 59, 5);
    m.hl(13, 56, 5);
    m.hl(20, 53, 5);
    m.rect(26, 50, 6, 1);
    m.hl(20, 46, 4);
    m.set(16, 43, 'x'); m.set(14, 43, 'x');
    m.hl(7, 40, 5);
    m.hl(12, 36, 3, 'H'); m.hl(18, 32, 3, 'H');
    m.rect(24, 29, 8, 1);
    m.set(27, 28, 'o');
    m.hl(24, 22, 5);
    m.hl(16, 18, 5);
    m.hl(5, 18, 6);
    m.hl(4, 15, 5);
    m.hl(10, 11, 4);
    m.hl(15, 7, 4, 'H');
    m.hl(14, 4, 6);
    m.set(29, 49, '*'); m.set(6, 17, '*');
    R('x_ascension', {
      zone: 'final', name: 'L\'antenne', theme: 'final', music: 'tension', dark: 0.2,
      map: m.rows(),
      exits: { top: { to: 'x_sommet', spawn: 'bottom', range: [14, 19] } },
      spawns: { bottom: [4, 61, { face: 1 }] },
      entities: [
        { type: 'chaser', id: 'riser', start: 67, speed: 46, dir: 'up' },
        { type: 'trigger', x: 6, y: 58, w: 5, h: 2, event: 'ascension_start', once: false, if: '!ascension_done' },
        { type: 'checkpoint', id: 'c1', x: 9, y: 39 },
        { type: 'checkpoint', id: 'c2', x: 18, y: 17 },
        { type: 'enemy', kind: 'flyer', x: 27, y: 25, range: 3 },
        { type: 'enemy', kind: 'flyer', x: 8, y: 9, range: 3 },
        { type: 'deco', kind: 'girder', x: 3, y: 61, h: 60 },
        { type: 'deco', kind: 'girder', x: 29, y: 61, h: 60 },
        { type: 'deco', kind: 'redlight', x: 2, y: 30 },
        { type: 'deco', kind: 'redlight', x: 31, y: 12 },
        { type: 'deco', kind: 'redlight', x: 31, y: 45 }
      ]
    });
  }

  // ------------------------------------------------------------------ sommet (le Silence)
  {
    const m = MB(30, 17);
    m.ground(14);
    m.rect(0, 0, 2, 17); m.rect(28, 0, 2, 17);
    m.hl(3, 10, 5); m.hl(22, 10, 5);
    m.hl(11, 6, 8, 'H');
    R('x_sommet', {
      zone: 'final', name: 'Le sommet', theme: 'final', music: 'climax', dark: 0.15, openTop: true,
      map: m.rows(),
      // cette salle n'a aucune sortie geometrique : c'est intentionnel pour le
      // combat final, mais le joueur ne doit JAMAIS y rester piege (fin
      // deja vue, ou fin interrompue). D'ou le trigger de retour ci-dessous.
      exits: {},
      spawns: { bottom: [15, 13, { face: 1 }] },
      entities: [
        { type: 'boss', id: 'boss', x: 15, y: 4 },
        { type: 'deco', kind: 'redlight', x: 2, y: 9 },
        { type: 'deco', kind: 'redlight', x: 27, y: 9 },
        // filet de securite : si l'histoire est deja terminee, on propose de redescendre
        { type: 'trigger', x: 11, y: 13, w: 9, h: 2, event: 'sommet_retour', once: false, if: 'ending_done' }
      ]
    });
  }
})();
