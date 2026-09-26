/* House of Laura · personnages
 * - Fiches (nom, couleur, voix, bio) et apparences (modifiables ici !)
 * - Squelette animé 2D (poses, fondus entre poses)
 * - Rendu en jeu + portraits de dialogue avec expressions
 */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U, G = HOL.G;
  const OL = '#1b1022';
  const C = HOL.Chars = {};

  // =====================================================================
  // FICHES
  // =====================================================================
  C.INFO = {
    laura: { name: 'Laura', color: '#ff5fae', voice: 540 },
    echo: { name: 'Écho', color: '#7ff3ff', voice: 1150, wave: 'sine' },
    tony: { name: 'Tony', color: '#4fb3ff', voice: 290, bio: 'Le pilier technique de la House. Il garde le stream allumé, quoi qu\'il arrive.' },
    misterflo: { name: 'MisterFlo', color: '#e0a84a', voice: 250, bio: 'Tient le kiosque de la place. Connaît toutes les légendes du quartier.' },
    k974: { name: 'K974', color: '#3fd6b5', voice: 370, bio: 'DJ des toits. Sans musique, le quartier n\'a plus de cœur.' },
    drulysf: { name: 'Drulysf', color: '#8ad45a', voice: 210, bio: 'Gardien du Grand Chêne. Parle peu, écoute beaucoup.' },
    omas: { name: 'Omas', color: '#f08a5d', voice: 430, bio: 'Parti cueillir des champignons, revenu avec une aventure.' },
    charly: { name: 'Charly', color: '#ff6fae', voice: 470, bio: 'Artiste du quartier. Chaque fresque cache un message.' },
    sylvain: { name: 'Sylvain', color: '#f5d142', voice: 280, bio: 'Pêcheur de la berge. Connaît chaque remous de la rivière.' },
    cocol: { name: 'Cocol_', color: '#ff9f43', voice: 500, bio: 'Photographe officiel de la House. Six polaroïds égarés dans la nature.' },
    keeli: { name: 'Keeli', color: '#b388ff', voice: 560, bio: 'Inséparable de Pixel, un chat beaucoup trop aventureux.' },
    tacos: { name: 'Tacos', color: '#ff5e57', voice: 330, bio: 'Le food truck le plus généreux du quartier. Et le plus épicé.' },
    andyblct: { name: 'Andyblct', color: '#9ccc65', voice: 360, bio: 'Explorateur des grottes et cartographe infatigable.' },
    brazya: { name: 'Brazya', color: '#29b6f6', voice: 390, bio: 'Passeur de la rivière. Son bac relie les deux rives.' },
    ofire: { name: 'Ofire_83', color: '#ff7043', voice: 440, bio: 'Gardien des braseros. Là où Ofire passe, la lumière revient.' },
    veilleur: { name: 'Le Veilleur', color: '#c9b8ff', voice: 200 },
    silence: { name: 'Le Silence', color: '#a99ac4', voice: 110, wave: 'sawtooth' },
    radio: { name: 'Voix dans la radio', color: '#c9b8ff', voice: 240, wave: 'square' },
    pixel: { name: 'Pixel', color: '#ffd28a', voice: 900 },
    chat: { name: 'Chat du stream', color: '#9ae6ff', voice: 700 }
  };
  // Les 13 membres de la House (ordre du carnet)
  C.HOUSE = ['tony', 'keeli', 'cocol', 'misterflo', 'tacos', 'charly', 'k974', 'omas', 'drulysf', 'sylvain', 'ofire', 'andyblct', 'brazya'];

  // =====================================================================
  // APPARENCES (couleurs / styles) · modifiables librement
  // =====================================================================
  C.LOOKS = {
    laura: {
      scale: 1, body: 'slim', skin: '#e2a47c', skinShade: '#c27c58', eyes: '#3b2115', lips: '#c65f68', brows: '#2a1811',
      hair: { style: 'longwavy', color: '#2a1811', color2: '#6f4128', hl: '#94603d' },
      top: { style: 'crop', color: '#f7f4fa', shade: '#d7d0e2' },
      legs: { style: 'jeans', color: '#262937', hl: '#3b4156' },
      shoes: { color: '#f5f5f7', accent: '#ff5fae' },
      acc: ['necklace', 'ring', 'earrings']
    },
    tony: {
      scale: 1.07, body: 'broad', skin: '#e6b38e', skinShade: '#c58e6a', eyes: '#2d1d14', brows: '#1d1512',
      hair: { style: 'short', color: '#1f1814', color2: '#2f241d' },
      top: { style: 'hoodie', color: '#26262f', shade: '#1a1a22', color2: '#ff5fae' },
      legs: { style: 'jeans', color: '#34466e', hl: '#4a5d88' },
      shoes: { color: '#1e1e24', accent: '#ffffff' },
      acc: ['stubble', 'headphones_neck'], accColor: { headphones: '#4fb3ff' }
    },
    misterflo: {
      scale: 1.03, body: 'round', skin: '#efc19c', skinShade: '#cf9c77', eyes: '#2d1d14', brows: '#6b5a4c',
      hair: { style: 'short', color: '#7d6a5a', color2: '#9a8878' },
      top: { style: 'vest', color: '#7a2e3a', shade: '#5e222c', color2: '#f3efe6' },
      legs: { style: 'pants', color: '#3d3a4a' },
      shoes: { color: '#5a3a26', accent: '#3a2618' },
      hat: { style: 'flatcap', color: '#6b4b3a', color2: '#503628' },
      acc: ['mustache', 'bowtie'], accColor: { bowtie: '#e0a84a', mustache: '#8a7666' }
    },
    k974: {
      scale: 1.02, body: 'slim', skin: '#8d5a3b', skinShade: '#6d4229', eyes: '#1d120b', brows: '#1a120d',
      hair: { style: 'buzz', color: '#1a1410', color2: '#1a1410' },
      top: { style: 'jacket', color: '#2fbfa0', shade: '#238f78', color2: '#f7d046' },
      legs: { style: 'pants', color: '#2b2b3b' },
      shoes: { color: '#f7d046', accent: '#2b2b3b' },
      hat: { style: 'capback', color: '#1d1d2b', color2: '#3fd6b5' },
      acc: ['headphones'], accColor: { headphones: '#3fd6b5' }
    },
    drulysf: {
      scale: 1.1, body: 'slim', skin: '#d6a27c', skinShade: '#b27e5a', eyes: '#9dff7a', brows: '#4a5a3a', glowEyes: true,
      hair: { style: 'none', color: '#6b6b5a' },
      top: { style: 'cloak', color: '#3f6b3a', shade: '#2c4d29', color2: '#8ad45a' },
      legs: { style: 'pants', color: '#3a3326' },
      shoes: { color: '#4a3a2a', accent: '#3a2a1a' },
      hat: { style: 'hood', color: '#3f6b3a', color2: '#2c4d29' },
      acc: ['beard', 'staff'], accColor: { beard: '#b9b2a0', staff: '#6b4a2e' }
    },
    omas: {
      scale: 0.95, body: 'slim', skin: '#f2c9a5', skinShade: '#d6a57f', eyes: '#3a2a1a', brows: '#5a3a24',
      hair: { style: 'curly', color: '#6a4228', color2: '#7d5236' },
      top: { style: 'jacket', color: '#6d8a5a', shade: '#526b43', color2: '#e8dcc0' },
      legs: { style: 'pants', color: '#5a4a3a' },
      shoes: { color: '#6a4a2a', accent: '#3a2a1a' },
      hat: { style: 'beanie', color: '#f08a5d', color2: '#d86f44' },
      acc: ['glasses', 'scarf', 'backpack'], accColor: { scarf: '#4a90c2', backpack: '#8a6a4a', glasses: '#2a2a2a' }
    },
    charly: {
      scale: 0.98, body: 'slim', skin: '#f1c7a8', skinShade: '#d6a585', eyes: '#2e6b4a', brows: '#8a3a1c',
      hair: { style: 'bob', color: '#b0522d', color2: '#c96a3f' },
      top: { style: 'overalls', color: '#5b7fc7', shade: '#44639e', color2: '#f4f4f4' },
      legs: { style: 'pants', color: '#5b7fc7' },
      shoes: { color: '#f4f4f4', accent: '#ff6fae' },
      hat: { style: 'beret', color: '#ff6fae', color2: '#d9508f' },
      acc: ['paint'], accColor: { paint: '#ffd14a' }
    },
    sylvain: {
      scale: 1.04, body: 'broad', skin: '#e9b48f', skinShade: '#c88f6b', eyes: '#2a1d14', brows: '#4a3222',
      hair: { style: 'short', color: '#5a3c26', color2: '#6b4a32' },
      top: { style: 'raincoat', color: '#f5d142', shade: '#d4ae25', color2: '#3a3a3a' },
      legs: { style: 'pants', color: '#4a5060' },
      shoes: { color: '#2e5a3a', accent: '#224530' },
      hat: { style: 'bucket', color: '#e8c235', color2: '#c9a41e' },
      acc: ['beard'], accColor: { beard: '#5a3c26' }
    },
    cocol: {
      scale: 0.97, body: 'slim', skin: '#c98e6a', skinShade: '#a8704f', eyes: '#2a1a10', brows: '#2a1a10',
      // Cocol_ est un garcon chauve : crane rase (ombre sous la peau)
      hair: { style: 'buzz', color: '#b57f5c', color2: '#9c6a4a' },
      top: { style: 'sweater', color: '#ff9f43', shade: '#e0842a', color2: '#fff1e0' },
      legs: { style: 'jeans', color: '#6a7fb0', hl: '#8193c0' },
      shoes: { color: '#ff9f43', accent: '#ffffff' },
      acc: ['camera'], accColor: { camera: '#f4f0e8' }
    },
    keeli: {
      scale: 0.96, body: 'slim', skin: '#f5d3be', skinShade: '#dcb098', eyes: '#5a3a8a', brows: '#b8a48a',
      // garcon : cheveux courts, pas de queue de cheval
      hair: { style: 'short', color: '#eadbc4', color2: '#f7ecdc', hl: '#fff8ee' },
      top: { style: 'hoodie', color: '#c9b3ff', shade: '#a992e6', color2: '#ffffff' },
      legs: { style: 'pants', color: '#4b3e6b' },
      shoes: { color: '#ffffff', accent: '#b388ff' },
      hat: { style: 'catears', color: '#b388ff', color2: '#ffb3d9' },
      acc: []
    },
    tacos: {
      scale: 1.02, body: 'round', skin: '#b87a55', skinShade: '#94603f', eyes: '#1d120b', brows: '#1a120d',
      hair: { style: 'short', color: '#1a1410', color2: '#2a2018' },
      top: { style: 'tshirt', color: '#3a3a48', shade: '#2c2c38', color2: '#ff5e57' },
      legs: { style: 'pants', color: '#2f2f3c' },
      shoes: { color: '#e8e8e8', accent: '#ff5e57' },
      hat: { style: 'bandana', color: '#ff5e57', color2: '#ffffff' },
      acc: ['apron'], accColor: { apron: '#f4efe6' }
    },
    andyblct: {
      scale: 1.0, body: 'slim', skin: '#e8b890', skinShade: '#c8946c', eyes: '#2a3a4a', brows: '#4a3222',
      hair: { style: 'short', color: '#6b4a2e', color2: '#7d5a3a' },
      top: { style: 'vest', color: '#9ccc65', shade: '#7ba84a', color2: '#5a6b4a' },
      legs: { style: 'pants', color: '#6b5a45' },
      shoes: { color: '#4a3a2a', accent: '#2a1a0a' },
      hat: { style: 'helmet', color: '#f2b63a', color2: '#fff6c0' },
      acc: ['rope'], accColor: { rope: '#c9a46a' }
    },
    brazya: {
      scale: 1.05, body: 'broad', skin: '#7a4a30', skinShade: '#5e3620', eyes: '#1d120b', brows: '#140c08',
      hair: { style: 'braids', color: '#1a1210', color2: '#2a1e18' },
      top: { style: 'tshirt', color: '#f0f0f0', shade: '#cfcfd8', color2: '#29b6f6' },
      legs: { style: 'pants', color: '#3a4a6a' },
      shoes: { color: '#3a2a1a', accent: '#2a1a0a' },
      hat: { style: 'bandana', color: '#29b6f6', color2: '#ffffff' },
      acc: [], accColor: {}
    },
    // Ofire_83 — d'après le sprite sheet de référence :
    // casquette olive à visière brune + petit logo turquoise, cheveux noirs épais
    // sous la casquette, veste olive ouverte sur un tee noir, pantalon charbon.
    ofire: {
      scale: 1.0, body: 'slim', skin: '#e6a87c', skinShade: '#c4835a', eyes: '#2a1a12', brows: '#17121a',
      hair: { style: 'curly', color: '#17121a', color2: '#3a2a2e' },
      hat: { style: 'cap', color: '#b0a582', color2: '#8a6a48', logo: '#3fa9a0' },
      top: { style: 'jacket', color: '#aaa07e', shade: '#8b8265', color2: '#16161a' },
      legs: { style: 'pants', color: '#3b3a38', hl: '#4c4a47' },
      shoes: { color: '#1a1a1c', accent: '#6a6f78' },
      acc: ['stubble', 'tee_under'], accColor: { stubble: '#3a2a20', tee: '#16161a' }
    }
  };

  // =====================================================================
  // POSES
  // =====================================================================
  const POSE_KEYS = ['lean', 'bob', 'sx', 'sy', 'lHip', 'lKnee', 'rHip', 'rKnee', 'lSh', 'lEl', 'rSh', 'rEl', 'head', 'hairX', 'hairY', 'spin', 'lookX', 'lookY'];
  C.basePose = function () {
    return {
      lean: 0, bob: 0, sx: 1, sy: 1,
      lHip: -0.06, lKnee: 0.02, rHip: 0.08, rKnee: 0.02,
      lSh: -0.12, lEl: 0.2, rSh: 0.12, rEl: 0.25,
      head: 0, hairX: 0, hairY: 0, spin: 1, lookX: 0, lookY: 0,
      face: 'neutral', blink: 0, talk: 0, handMouth: false
    };
  };
  C.blendPose = function (cur, target, k) {
    for (const key of POSE_KEYS) cur[key] = U.lerp(cur[key], target[key], k);
    cur.face = target.face; cur.blink = target.blink; cur.talk = target.talk; cur.handMouth = target.handMouth;
    return cur;
  };

  // calcule la pose cible d'un état d'animation
  // st = { anim, t (temps dans l'état), phase (cycle de marche), vx, vy, time (global) }
  C.poseFor = function (st) {
    const p = C.basePose();
    const t = st.t || 0, time = st.time || 0;
    const breathe = Math.sin(time * 2.3);
    p.bob = breathe * 0.5;
    p.lSh += breathe * 0.02; p.rSh -= breathe * 0.02;
    switch (st.anim) {
      case 'idle': {
        // petit regard autour après un moment
        if (t > 4) { const k = Math.sin((t - 4) * 0.9); p.head = k * 0.08; p.lookX = k; }
        if (t > 7 && (Math.floor(t) % 9 === 0)) { p.rSh = 2.3; p.rEl = 1.9; p.head = -0.12; } // remet ses cheveux
        break;
      }
      case 'walk': {
        const ph = st.phase;
        const s = Math.sin(ph), c = Math.cos(ph);
        p.lHip = s * 0.5; p.rHip = -s * 0.5;
        p.lKnee = Math.max(0, -c) * 0.75 + 0.05; p.rKnee = Math.max(0, c) * 0.75 + 0.05;
        p.lSh = -s * 0.42; p.rSh = s * 0.42; p.lEl = 0.35; p.rEl = 0.35;
        p.bob = -Math.abs(c) * 1.3 + 0.6; p.lean = 0.06;
        p.hairX = -0.25;
        break;
      }
      case 'run': {
        const ph = st.phase;
        const s = Math.sin(ph), c = Math.cos(ph);
        p.lHip = s * 0.85 + 0.12; p.rHip = -s * 0.85 + 0.12;
        p.lKnee = Math.max(0, -c) * 1.35 + 0.15; p.rKnee = Math.max(0, c) * 1.35 + 0.15;
        p.lSh = -s * 0.95; p.rSh = s * 0.95; p.lEl = 1.25; p.rEl = 1.25;
        p.bob = -Math.abs(s) * 2.6 + 1.2; p.lean = 0.2;
        p.hairX = -0.8; p.hairY = Math.abs(s) * 0.2;
        p.face = 'happy';
        break;
      }
      case 'jump': {
        p.lHip = -0.15; p.lKnee = 0.5; p.rHip = 0.85; p.rKnee = 1.35;
        p.rSh = 2.5; p.rEl = 0.35; p.lSh = -0.8; p.lEl = 0.5;
        p.sy = 1.05; p.sx = 0.96; p.lean = 0.05;
        p.hairY = -0.4; p.hairX = -0.3;
        break;
      }
      case 'fall': {
        const w = Math.sin(time * 14) * 0.08;
        p.lHip = -0.1 + w; p.lKnee = 0.35; p.rHip = 0.3 - w; p.rKnee = 0.5;
        p.rSh = 1.9 + w; p.rEl = -0.2; p.lSh = -1.7 - w; p.lEl = -0.2;
        p.hairY = 0.9; p.hairX = -0.2;
        p.face = st.vy > 600 ? 'surprised' : 'neutral';
        break;
      }
      case 'land': {
        const k = 1 - U.clamp(t / 0.16, 0, 1);
        p.sy = 1 - 0.14 * k; p.sx = 1 + 0.1 * k;
        p.lHip = 0.5 * k; p.lKnee = 1.0 * k; p.rHip = 0.55 * k; p.rKnee = 1.0 * k;
        p.bob = 3 * k; p.lSh = -0.6 * k; p.rSh = 0.6 * k;
        break;
      }
      case 'djump': {
        const k = U.clamp(t / 0.38, 0, 1);
        p.spin = Math.cos(k * Math.PI * 2);
        p.lHip = 0.9; p.lKnee = 1.6; p.rHip = 1.0; p.rKnee = 1.7;
        p.lSh = -2.4; p.rSh = 2.4; p.lEl = 0.3; p.rEl = 0.3;
        p.hairY = 0.4; p.face = 'happy';
        break;
      }
      case 'dash': {
        p.lean = 0.55; p.sx = 1.12; p.sy = 0.92;
        p.lHip = 0.9; p.lKnee = 0.4; p.rHip = -0.8; p.rKnee = 0.6;
        p.rSh = -1.4; p.rEl = 0.2; p.lSh = -1.1; p.lEl = 0.2;
        p.hairX = -1.6; p.face = 'determined';
        break;
      }
      case 'pulse': {
        const k = U.ease.outBack(U.clamp(t / 0.25, 0, 1));
        p.lSh = -2.0 * k; p.rSh = 2.0 * k; p.lEl = -0.2; p.rEl = -0.2;
        p.head = -0.12 * k; p.sy = 1 + 0.05 * k;
        p.lHip = -0.18; p.rHip = 0.22;
        p.face = 'determined';
        break;
      }
      case 'interact': {
        const k = Math.sin(U.clamp(t / 0.45, 0, 1) * Math.PI);
        p.rSh = 1.45 * k + 0.1; p.rEl = 0.15; p.lean = 0.1 * k;
        break;
      }
      case 'push': {
        const ph = st.phase;
        p.lean = 0.38; p.rSh = 1.45; p.rEl = 0.4; p.lSh = 1.25; p.lEl = 0.5;
        p.lHip = Math.sin(ph) * 0.35 - 0.2; p.rHip = -Math.sin(ph) * 0.35 - 0.2;
        p.lKnee = 0.4; p.rKnee = 0.4; p.face = 'determined';
        break;
      }
      case 'climb': {
        const ph = st.phase;
        p.rSh = 2.7 + Math.sin(ph) * 0.35; p.rEl = 0.5; p.lSh = 2.5 - Math.sin(ph) * 0.35; p.lEl = 0.6;
        p.lHip = 0.5 + Math.sin(ph) * 0.4; p.lKnee = 0.9; p.rHip = 0.5 - Math.sin(ph) * 0.4; p.rKnee = 0.9;
        p.lean = -0.05; p.head = -0.15;
        break;
      }
      case 'swim': {
        const ph = st.phase;
        p.lean = 0.9; p.rSh = 2.6 + Math.sin(ph) * 1.2; p.lSh = 2.6 - Math.sin(ph) * 1.2; p.rEl = 0.2; p.lEl = 0.2;
        p.lHip = Math.sin(ph * 2) * 0.35; p.rHip = -Math.sin(ph * 2) * 0.35; p.lKnee = 0.3; p.rKnee = 0.3;
        p.hairX = -1.1; p.hairY = -0.3; p.head = -0.5;
        break;
      }
      case 'hurt': {
        p.lean = -0.4; p.lSh = -1.5; p.rSh = 1.2; p.lEl = 0.8; p.rEl = 0.8; p.sy = 0.95; p.face = 'hurt';
        p.lHip = 0.3; p.lKnee = 0.6; p.rHip = -0.2; p.rKnee = 0.3; p.hairX = 0.8;
        break;
      }
      case 'sit': {
        p.lHip = 1.5; p.lKnee = 1.75; p.rHip = 1.45; p.rKnee = 1.8;
        p.rSh = 0.95; p.rEl = 1.0; p.lSh = 0.8; p.lEl = 1.1; p.bob = -5 + breathe * 0.4; p.lean = -0.06;
        break;
      }
      case 'knocked': {
        p.lean = -0.1; p.sy = 0.9; p.lHip = 1.2; p.lKnee = 1.8; p.rHip = 1.1; p.rKnee = 1.9; p.bob = 8; p.head = 0.3; p.face = 'hurt';
        break;
      }
      // ---- réactions de dialogue ----
      case 'happy': {
        const b = Math.abs(Math.sin(t * 9)) * U.clamp(1 - t / 0.9, 0, 1);
        p.bob = -b * 4; p.rSh = 2.4; p.rEl = 0.6 + Math.sin(t * 12) * 0.3; p.face = 'happy';
        break;
      }
      case 'surprised': {
        const k = U.clamp(t / 0.15, 0, 1), h = Math.sin(U.clamp(t / 0.35, 0, 1) * Math.PI);
        p.bob = -h * 5; p.lSh = -1.4 * k; p.rSh = 1.4 * k; p.lEl = 1.2; p.rEl = 1.2; p.lean = -0.15 * k; p.face = 'surprised';
        p.hairY = -0.4 * h;
        break;
      }
      case 'sad': {
        p.head = 0.28; p.lean = 0.08; p.bob = 1.2; p.lSh = -0.02; p.rSh = 0.02; p.lEl = 0.05; p.rEl = 0.05; p.face = 'sad';
        break;
      }
      case 'determined': {
        const k = U.ease.outBack(U.clamp(t / 0.3, 0, 1));
        p.rSh = 1.2 * k; p.rEl = 2.1 * k; p.lean = 0.08; p.face = 'determined';
        p.lHip = -0.2; p.rHip = 0.25;
        break;
      }
      case 'laugh': {
        p.bob = Math.sin(t * 22) * 0.9; p.head = -0.15 + Math.sin(t * 22) * 0.04; p.rSh = 1.9; p.rEl = 2.4; p.handMouth = true; p.face = 'laugh';
        break;
      }
      case 'think': {
        p.rSh = 0.9; p.rEl = 2.6; p.head = -0.1; p.lookY = -1; p.face = 'neutral'; p.lSh = 0.5; p.lEl = 1.4;
        break;
      }
      case 'wave': {
        p.rSh = 2.7; p.rEl = 0.5 + Math.sin(t * 10) * 0.45; p.face = 'happy';
        break;
      }
      case 'worried': {
        p.lSh = 0.4; p.lEl = 1.6; p.rSh = 0.5; p.rEl = 1.7; p.head = 0.1; p.face = 'worried';
        break;
      }
      case 'talk': {
        p.rSh = 0.5 + Math.sin(t * 4) * 0.25; p.rEl = 1.0; p.face = 'neutral';
        break;
      }
      default: break;
    }
    return p;
  };

  // =====================================================================
  // RENDU EN JEU
  // =====================================================================
  function limb(ctx, x, y, a1, l1, rel, l2, w1, w2, col, ol) {
    const kx = x + Math.sin(a1) * l1, ky = y + Math.cos(a1) * l1;
    const a2 = a1 + rel;
    const ex = kx + Math.sin(a2) * l2, ey = ky + Math.cos(a2) * l2;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = ol;
    ctx.lineWidth = w1 + 2.4; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(kx, ky); ctx.stroke();
    ctx.lineWidth = w2 + 2.4; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.strokeStyle = col;
    ctx.lineWidth = w1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(kx, ky); ctx.stroke();
    ctx.lineWidth = w2; ctx.beginPath(); ctx.moveTo(kx, ky); ctx.lineTo(ex, ey); ctx.stroke();
    return { kx, ky, ex, ey, a2 };
  }
  function smoothPath(ctx, pts, close) {
    if (pts.length < 2) return;
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last[0], last[1]);
    if (close) ctx.closePath();
  }
  C.smoothPath = smoothPath;

  // palette résolue (avec désaturation "brume")
  function pal(look, gray) {
    const g = (h) => (h ? U.gray(h, gray) : h);
    const acc = look.accColor || {};
    return {
      skin: g(look.skin), skinShade: g(look.skinShade || U.shade(look.skin, -0.18)), eyes: look.glowEyes ? look.eyes : g(look.eyes),
      lips: g(look.lips || U.shade(look.skin, -0.3)), brows: g(look.brows || look.hair.color),
      hair: g(look.hair.color), hair2: g(look.hair.color2 || look.hair.color), hairHl: g(look.hair.hl || U.shade(look.hair.color2 || look.hair.color, 0.15)),
      top: g(look.top.color), topShade: g(look.top.shade || U.shade(look.top.color, -0.18)), top2: g(look.top.color2 || look.top.color),
      legs: g(look.legs.color), legsHl: g(look.legs.hl || U.shade(look.legs.color, 0.12)), legsShade: g(U.shade(look.legs.color, -0.25)),
      shoe: g(look.shoes.color), shoeAcc: g(look.shoes.accent || look.shoes.color),
      hat: look.hat ? g(look.hat.color) : null, hat2: look.hat ? g(look.hat.color2 || look.hat.color) : null,
      acc: (k, d) => g(acc[k] || d),
      ol: OL, gold: g('#e9c35b')
    };
  }
  C.pal = pal;

  // dessine un personnage : origine = pieds (x,y). o = { facing, gray, alpha, time, scale, noOutline }
  C.drawBody = function (ctx, look, pose, x, y, o) {
    o = o || {};
    const facing = o.facing || 1, gray = o.gray || 0, time = o.time || 0;
    const P = pal(look, gray);
    const sc = (look.scale || 1) * (o.scale || 1);
    const bt = look.body || 'slim';
    const bw = bt === 'broad' ? 1.18 : bt === 'round' ? 1.12 : 1;
    const hipY = -21;
    ctx.save();
    ctx.translate(x, y);
    if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
    ctx.scale(facing * sc * pose.sx * pose.spin, sc * pose.sy);
    const far = (c) => U.shade(c, -0.22);

    // hanches (avec rebond)
    const hx = 0, hy = hipY + pose.bob;
    const lean = pose.lean;
    const cosL = Math.cos(lean), sinL = Math.sin(lean);
    // point du torse local -> monde
    const L = (lx, ly) => [hx + lx * cosL - ly * sinL, hy + lx * sinL + ly * cosL];
    const shoulderF = L(-1.5 * bw, -18), shoulderN = L(1.8 * bw, -18);
    const hipF = [hx - 1.6 * bw, hy + 1], hipN = [hx + 1.8 * bw, hy + 1];
    const headC = L(1.2, -30.5);
    const hairSX = pose.hairX, hairSY = pose.hairY;

    // ---------- cheveux arrière ----------
    if (look.hair.style !== 'none') drawHairBack(ctx, look, P, headC, lean + pose.head, hairSX, hairSY, time, false);
    if (look.acc && look.acc.indexOf('backpack') >= 0) {
      const b = L(-7.5, -12);
      ctx.fillStyle = P.acc('backpack', '#8a6a4a'); ctx.strokeStyle = OL; ctx.lineWidth = 1.2;
      G.rr(ctx, b[0] - 5, b[1] - 8, 9, 15, 3); ctx.fill(); ctx.stroke();
    }
    if (look.top.style === 'cloak') drawCloakBack(ctx, P, L, hx, hy, time, hairSX);

    // ---------- membres arrière ----------
    const sleeveCol = sleeveColor(look, P);
    const armW = 4.4 * (bt === 'broad' ? 1.15 : 1);
    const legW1 = (look.legs.style === 'skirt' ? 3.6 : 5.6) * bw, legW2 = 4.6 * bw;
    // bras arrière
    const armF = drawArm(ctx, look, P, shoulderF[0], shoulderF[1], pose.lSh + lean, pose.lEl, armW, true, sleeveCol);
    // jambe arrière
    drawLeg(ctx, look, P, hipF[0], hipF[1], pose.lHip, pose.lKnee, legW1, legW2, true);
    // jambe avant
    drawLeg(ctx, look, P, hipN[0], hipN[1], pose.rHip, pose.rKnee, legW1, legW2, false);

    // ---------- torse ----------
    ctx.save();
    ctx.translate(hx, hy); ctx.rotate(lean);
    drawTorso(ctx, look, P, bw, time);
    ctx.restore();

    // accessoires portés sur le torse
    if (look.acc) {
      if (look.acc.indexOf('camera') >= 0) {
        const cpos = L(3, -10);
        ctx.strokeStyle = '#3a2a2a'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(L(-2, -19)[0], L(-2, -19)[1]); ctx.lineTo(cpos[0], cpos[1] - 3); ctx.lineTo(L(4, -19)[0], L(4, -19)[1]); ctx.stroke();
        ctx.fillStyle = P.acc('camera', '#f4f0e8'); ctx.strokeStyle = OL; ctx.lineWidth = 1;
        G.rr(ctx, cpos[0] - 3.5, cpos[1] - 3, 7, 5.5, 1.2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#2a2a3a'; ctx.beginPath(); ctx.arc(cpos[0] + 0.5, cpos[1] - 0.3, 1.6, 0, U.TAU); ctx.fill();
        ctx.fillStyle = '#ff5e57'; ctx.fillRect(cpos[0] - 3, cpos[1] - 2.4, 1.2, 1);
      }
      if (look.acc.indexOf('rope') >= 0) {
        const r = L(-1, -8);
        ctx.strokeStyle = P.acc('rope', '#c9a46a'); ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.ellipse(r[0] - 3, r[1], 4, 3, 0.3, 0, U.TAU); ctx.stroke();
      }
    }

    // ---------- tête ----------
    drawHead(ctx, look, P, headC[0], headC[1], lean + pose.head, pose, time, hairSX, hairSY);

    // ---------- bras avant ----------
    const armN = drawArm(ctx, look, P, shoulderN[0], shoulderN[1], pose.rSh + lean, pose.rEl, armW, false, sleeveCol);
    // objets tenus
    if (look.acc) {
      if (look.acc.indexOf('torch') >= 0) drawTorch(ctx, armN.ex, armN.ey, time, P);
      if (look.acc.indexOf('staff') >= 0) drawStaff(ctx, armN.ex, armN.ey, time, P);
      if (look.acc.indexOf('paint') >= 0) {
        ctx.strokeStyle = '#8a5a3a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(armN.ex, armN.ey); ctx.lineTo(armN.ex + 4, armN.ey - 6); ctx.stroke();
        ctx.fillStyle = P.acc('paint', '#ffd14a'); ctx.beginPath(); ctx.arc(armN.ex + 4.5, armN.ey - 7, 1.6, 0, U.TAU); ctx.fill();
      }
    }
    if (look.acc && look.acc.indexOf('ring') >= 0 && !gray) {
      ctx.fillStyle = P.gold; ctx.beginPath(); ctx.arc(armN.ex + 0.6, armN.ey + 0.8, 0.7, 0, U.TAU); ctx.fill();
    }
    ctx.restore();
  };

  function sleeveColor(look, P) {
    const s = look.top.style;
    if (s === 'vest' || s === 'overalls') return P.top2;
    return P.top;
  }

  function drawArm(ctx, look, P, sx, sy, sh, el, w, isFar, sleeve) {
    const s = look.top.style;
    const shortSleeve = (s === 'tshirt' || s === 'overalls');
    const col = isFar ? U.shade(sleeve, -0.18) : sleeve;
    const skin = isFar ? U.shade(P.skin, -0.14) : P.skin;
    let r;
    if (shortSleeve) {
      // manche courte : haut du bras tissu, avant-bras peau
      const kx = sx + Math.sin(sh) * 8.8, ky = sy + Math.cos(sh) * 8.8;
      r = limb(ctx, sx, sy, sh, 8.8, el, 8.6, w, w * 0.88, skin, OL);
      ctx.lineCap = 'round';
      ctx.strokeStyle = OL; ctx.lineWidth = w + 3.4; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + (kx - sx) * 0.55, sy + (ky - sy) * 0.55); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = w + 1.2; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + (kx - sx) * 0.55, sy + (ky - sy) * 0.55); ctx.stroke();
    } else {
      r = limb(ctx, sx, sy, sh, 8.8, el, 8.4, w, w * 0.9, col, OL);
      if (s === 'crop') {
        // léger pli de manche
        ctx.strokeStyle = U.shade(col, -0.12); ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(r.kx - 1.2, r.ky - 0.5); ctx.lineTo(r.kx + 1.2, r.ky + 0.5); ctx.stroke();
      }
    }
    // main
    const hxp = r.ex + Math.sin(r.a2) * 1.6, hyp = r.ey + Math.cos(r.a2) * 1.6;
    ctx.fillStyle = skin; ctx.strokeStyle = OL; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.arc(hxp, hyp, 2.35, 0, U.TAU); ctx.fill(); ctx.stroke();
    r.ex = hxp; r.ey = hyp;
    return r;
  }

  function drawLeg(ctx, look, P, x, y, hip, knee, w1, w2, isFar) {
    const st = look.legs.style;
    let col = P.legs;
    if (isFar) col = U.shade(col, -0.2);
    const skin = isFar ? U.shade(P.skin, -0.14) : P.skin;
    let r;
    if (st === 'shorts') {
      r = limb(ctx, x, y, hip, 10.5, -knee, 10.2, w1 * 0.85, w2 * 0.85, skin, OL);
      ctx.lineCap = 'round';
      const mx = x + Math.sin(hip) * 6.5, my = y + Math.cos(hip) * 6.5;
      ctx.strokeStyle = OL; ctx.lineWidth = w1 + 2.8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(mx, my); ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = w1 + 0.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(mx, my); ctx.stroke();
    } else {
      r = limb(ctx, x, y, hip, 10.5, -knee, 10.2, w1, w2, col, OL);
      if (st === 'jeans' && !isFar) {
        ctx.strokeStyle = P.legsHl; ctx.lineWidth = 1; ctx.globalAlpha *= 0.8;
        ctx.beginPath(); ctx.moveTo(x + Math.sin(hip) * 2 + 1.3, y + Math.cos(hip) * 2); ctx.lineTo(r.kx + 1.2, r.ky); ctx.stroke();
        ctx.globalAlpha /= 0.8;
      }
    }
    // chaussure
    const sa = r.a2;
    ctx.save();
    ctx.translate(r.ex, r.ey);
    ctx.rotate(-sa * 0.35);
    const shoe = isFar ? U.shade(P.shoe, -0.18) : P.shoe;
    ctx.fillStyle = shoe; ctx.strokeStyle = OL; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-3.2, -2.4);
    ctx.lineTo(2.4, -2.6);
    ctx.quadraticCurveTo(6.8, -1.6, 6.8, 1.2);
    ctx.lineTo(6.6, 2.4);
    ctx.lineTo(-3.4, 2.4);
    ctx.quadraticCurveTo(-4.4, 0, -3.2, -2.4);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = isFar ? U.shade(P.shoeAcc, -0.2) : P.shoeAcc;
    ctx.fillRect(-2.2, -1.2, 3.4, 1.1);
    ctx.strokeStyle = U.shade(shoe, -0.3); ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-3.3, 1.2); ctx.lineTo(6.6, 1.2); ctx.stroke();
    ctx.restore();
  }

  // torse dans le repère des hanches (y vers le haut négatif)
  function drawTorso(ctx, look, P, bw, time) {
    const s = look.top.style;
    const sw = 7 * bw, ww = (look.body === 'round' ? 7.4 : 5.8) * bw, hw = 6.6 * bw;
    ctx.lineWidth = 1.3; ctx.strokeStyle = OL; ctx.lineJoin = 'round';
    // bassin / pantalon
    ctx.fillStyle = P.legs;
    ctx.beginPath();
    ctx.moveTo(-ww, -4.5); ctx.lineTo(ww + 0.3, -4.5); ctx.lineTo(hw, 3); ctx.lineTo(-hw, 3); ctx.closePath();
    ctx.fill(); ctx.stroke();
    if (look.legs.style === 'jeans') {
      ctx.strokeStyle = P.legsHl; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.moveTo(-ww + 0.8, -2.6); ctx.lineTo(ww - 0.5, -2.6); ctx.stroke();
      ctx.fillStyle = P.gold; ctx.fillRect(1.2, -3.6, 1.2, 1.2);
    }
    const crop = s === 'crop';
    const topBottom = crop ? -9.2 : (s === 'hoodie' || s === 'raincoat' || s === 'coat') ? 2.5 : -3.5;
    // ventre (crop top)
    if (crop) {
      ctx.fillStyle = P.skin; ctx.strokeStyle = OL; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-ww + 0.3, -10); ctx.lineTo(ww, -10); ctx.lineTo(ww + 0.2, -4.2); ctx.lineTo(-ww, -4.2); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = P.skinShade; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.arc(1.4, -6.5, 0.5, 0, U.TAU); ctx.stroke();
    }
    // haut
    ctx.fillStyle = P.top; ctx.strokeStyle = OL; ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-sw + 0.5, -18.2);
    ctx.quadraticCurveTo(0, -20.6, sw - 0.2, -18.2);
    ctx.quadraticCurveTo(sw + 0.9, -13, ww + (crop ? 0.4 : 0.8), topBottom);
    if (crop) ctx.quadraticCurveTo(0, topBottom + 1.1, -ww, topBottom);
    else ctx.lineTo(-ww - 0.5, topBottom);
    ctx.quadraticCurveTo(-sw - 0.8, -13, -sw + 0.5, -18.2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // ombrage
    ctx.save(); ctx.clip();
    ctx.fillStyle = P.topShade; ctx.globalAlpha *= 0.7;
    ctx.beginPath(); ctx.ellipse(-sw, -12, 3.2, 10, 0, 0, U.TAU); ctx.fill();
    ctx.restore();
    // détails selon le style
    if (crop) {
      // encolure
      ctx.fillStyle = P.skin; ctx.beginPath(); ctx.moveTo(-3.2, -19.6); ctx.quadraticCurveTo(0.8, -15.8, 4.4, -19.6); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = U.shade(P.top, -0.25); ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-3.2, -19.6); ctx.quadraticCurveTo(0.8, -15.8, 4.4, -19.6); ctx.stroke();
    } else if (s === 'hoodie') {
      ctx.strokeStyle = U.shade(P.top, -0.3); ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(-3.8, -3); ctx.lineTo(4.6, -3); ctx.lineTo(4, 0.5); ctx.lineTo(-3.2, 0.5); ctx.closePath(); ctx.stroke();
      ctx.strokeStyle = P.top2; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-0.5, -18); ctx.lineTo(-0.8, -13); ctx.moveTo(2.5, -18); ctx.lineTo(2.8, -13); ctx.stroke();
      ctx.fillStyle = P.top2; G.heart(ctx, 1.1, -12.2, 3.2); ctx.fill();
      // capuche
      ctx.fillStyle = P.topShade; ctx.strokeStyle = OL; ctx.lineWidth = 1.1;
      ctx.beginPath(); ctx.ellipse(-4.2, -19.2, 4.6, 2.6, -0.2, 0, U.TAU); ctx.fill(); ctx.stroke();
    } else if (s === 'jacket') {
      ctx.fillStyle = P.top2; ctx.beginPath(); ctx.moveTo(0, -19.5); ctx.lineTo(3.6, -19.5); ctx.lineTo(3, topBottom); ctx.lineTo(0.6, topBottom); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = U.shade(P.top, -0.3); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(0.3, -19); ctx.lineTo(0.6, topBottom); ctx.stroke();
      ctx.strokeStyle = P.top2; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-sw + 1, -9); ctx.lineTo(-ww + 0.5, -7.5); ctx.stroke();
    } else if (s === 'vest') {
      ctx.fillStyle = P.top2; ctx.beginPath(); ctx.moveTo(-1.5, -19.6); ctx.lineTo(4.2, -19.6); ctx.lineTo(1.4, -10); ctx.closePath(); ctx.fill();
      ctx.fillStyle = P.gold; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(1.8, -9 + i * 2.2, 0.55, 0, U.TAU); ctx.fill(); }
    } else if (s === 'overalls') {
      ctx.fillStyle = P.top2; ctx.beginPath(); ctx.moveTo(-sw + 0.5, -18.2); ctx.quadraticCurveTo(0, -20.6, sw - 0.2, -18.2); ctx.lineTo(sw - 1, -15); ctx.lineTo(-sw + 1.5, -15); ctx.closePath(); ctx.fill();
      ctx.fillStyle = P.top; G.rr(ctx, -3.2, -15, 7.4, 8, 1); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.strokeStyle = P.top; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-2.4, -15); ctx.lineTo(-3.5, -19.2); ctx.moveTo(3.5, -15); ctx.lineTo(4.4, -19.2); ctx.stroke();
      // taches de peinture
      const cols = ['#ffd14a', '#ff6fae', '#5fe0a0', '#ffffff'];
      for (let i = 0; i < 5; i++) { ctx.fillStyle = cols[i % 4]; ctx.beginPath(); ctx.arc(-3 + (i * 7.3) % 8, -12 + (i * 5.1) % 9, 0.8, 0, U.TAU); ctx.fill(); }
    } else if (s === 'raincoat') {
      ctx.strokeStyle = U.shade(P.top, -0.3); ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(1, -19); ctx.lineTo(1.5, 2); ctx.stroke();
      ctx.fillStyle = P.top2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(2.8, -15 + i * 5, 0.6, 0, U.TAU); ctx.fill(); }
    } else if (s === 'sweater') {
      ctx.save(); ctx.beginPath(); ctx.rect(-sw - 2, -18, sw * 2 + 4, 15); ctx.clip();
      ctx.fillStyle = P.top2;
      for (let i = 0; i < 4; i++) ctx.fillRect(-sw - 2, -16 + i * 3.6, sw * 2 + 4, 1.4);
      ctx.restore();
    } else if (s === 'tshirt') {
      ctx.fillStyle = P.top2; ctx.beginPath(); ctx.arc(1, -12, 2.2, 0, U.TAU); ctx.fill();
    } else if (s === 'cloak') {
      ctx.strokeStyle = P.top2; ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.moveTo(-2, -18); ctx.quadraticCurveTo(0, -10, -1, 2); ctx.stroke();
    }
    if (look.acc && look.acc.indexOf('apron') >= 0) {
      ctx.fillStyle = P.acc('apron', '#f4efe6'); ctx.strokeStyle = OL; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-3.5, -16); ctx.lineTo(4.5, -16); ctx.lineTo(6, 5); ctx.lineTo(-5, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ff5e57'; ctx.fillRect(-1, -8, 3, 2);
    }
    if (look.acc && look.acc.indexOf('scarf') >= 0) {
      ctx.fillStyle = P.acc('scarf', '#4a90c2'); ctx.strokeStyle = OL; ctx.lineWidth = 1;
      G.rr(ctx, -5, -21.5, 11, 4.2, 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-3, -18); ctx.lineTo(-4.5, -11); ctx.lineTo(-1.5, -11); ctx.lineTo(-0.5, -18); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (look.acc && look.acc.indexOf('headphones_neck') >= 0) {
      ctx.strokeStyle = OL; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(0.8, -19.5, 5.4, 0.1, Math.PI - 0.1); ctx.stroke();
      ctx.strokeStyle = P.acc('headphones', '#4fb3ff'); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0.8, -19.5, 5.4, 0.1, Math.PI - 0.1); ctx.stroke();
      ctx.fillStyle = '#2a2a33'; ctx.beginPath(); ctx.ellipse(6, -18, 1.8, 2.5, 0, 0, U.TAU); ctx.fill();
    }
    if (look.acc && look.acc.indexOf('bowtie') >= 0) {
      ctx.fillStyle = P.acc('bowtie', '#e0a84a'); ctx.strokeStyle = OL; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(1, -19); ctx.lineTo(-2, -20.6); ctx.lineTo(-2, -17.4); ctx.closePath(); ctx.moveTo(1, -19); ctx.lineTo(4, -20.6); ctx.lineTo(4, -17.4); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    // t-shirt sombre visible sous une veste ouverte
    if (look.acc && look.acc.indexOf('tee_under') >= 0) {
      ctx.fillStyle = P.acc('tee', '#1e1e24'); ctx.strokeStyle = OL; ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(-3.8, -19.6); ctx.quadraticCurveTo(0.8, -17.4, 5.4, -19.8);
      ctx.lineTo(3.4, -10.2); ctx.lineTo(-1.8, -10.2); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
    // cou
    ctx.fillStyle = P.skin; ctx.strokeStyle = OL; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.rect(-1.4, -23.5, 4.4, 4.2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-1.4, -23.5); ctx.lineTo(-1.4, -19.6); ctx.moveTo(3, -23.5); ctx.lineTo(3, -19.6); ctx.stroke();
    ctx.fillStyle = P.skinShade; ctx.globalAlpha *= 0.5; ctx.fillRect(-1.4, -23.5, 4.4, 1.6); ctx.globalAlpha /= 0.5;
    if (look.acc && look.acc.indexOf('necklace') >= 0) {
      ctx.strokeStyle = P.gold; ctx.lineWidth = 0.55;
      ctx.beginPath(); ctx.arc(0.8, -22.2, 3.2, 0.35, Math.PI - 0.35); ctx.stroke();
      ctx.beginPath(); ctx.arc(0.8, -21.5, 4.4, 0.4, Math.PI - 0.4); ctx.stroke();
      ctx.fillStyle = P.gold; ctx.beginPath(); ctx.arc(0.9, -17.2, 0.7, 0, U.TAU); ctx.fill();
    }
  }

  function drawCloakBack(ctx, P, L, hx, hy, time, sway) {
    const a = L(-6, -19), b = L(7, -19);
    const w = Math.sin(time * 2) * 1.2 - sway * 4;
    ctx.fillStyle = P.topShade; ctx.strokeStyle = OL; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.quadraticCurveTo(a[0] - 7 + w, hy + 8, a[0] - 5 + w, hy + 19);
    ctx.lineTo(b[0] + 2 + w * 0.3, hy + 18);
    ctx.quadraticCurveTo(b[0] + 3, hy - 4, b[0], b[1]);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // feuilles
    ctx.fillStyle = P.top2;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(a[0] - 4 + i * 3 + w * 0.5, hy + 12 + (i % 2) * 3, 1.8, 0.9, 0.6 * i, 0, U.TAU); ctx.fill(); }
  }

  function drawTorch(ctx, x, y, time, P) {
    ctx.strokeStyle = P.acc('torch', '#6b4a2e'); ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 1, y + 3); ctx.lineTo(x + 2, y - 10); ctx.stroke();
    const f = Math.sin(time * 20) * 0.8;
    ctx.fillStyle = '#ffb347'; ctx.beginPath(); ctx.ellipse(x + 2.3, y - 13 + f * 0.3, 2.8, 4.2 + f * 0.4, 0, 0, U.TAU); ctx.fill();
    ctx.fillStyle = '#fff2b0'; ctx.beginPath(); ctx.ellipse(x + 2.3, y - 12.2, 1.3, 2.2, 0, 0, U.TAU); ctx.fill();
    G.glow(ctx, x + 2.3, y - 12, 26, '#ff9a3a', 0.45);
  }
  function drawStaff(ctx, x, y, time, P) {
    ctx.strokeStyle = OL; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x + 1, y + 21); ctx.lineTo(x - 1, y - 20); ctx.stroke();
    ctx.strokeStyle = P.acc('staff', '#6b4a2e'); ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(x + 1, y + 21); ctx.lineTo(x - 1, y - 20); ctx.stroke();
    ctx.fillStyle = '#9dff7a'; ctx.beginPath(); ctx.arc(x - 1, y - 21, 2.4, 0, U.TAU); ctx.fill();
    G.glow(ctx, x - 1, y - 21, 16 + Math.sin(time * 3) * 2, '#9dff7a', 0.5);
  }

  // ---------- cheveux (arrière) ----------
  function drawHairBack(ctx, look, P, hc, ang, sx, sy, time, portrait) {
    const st = look.hair.style;
    const hx = hc[0], hy = hc[1];
    ctx.save();
    ctx.translate(hx, hy); ctx.rotate(ang * 0.6);
    ctx.lineWidth = 1.3; ctx.strokeStyle = OL; ctx.lineJoin = 'round';
    if (st === 'longwavy' || st === 'long') {
      const len = st === 'longwavy' ? 31 : 27;
      const N = 12, left = [], right = [];
      for (let i = 0; i <= N; i++) {
        const s = i / N;
        const y = -6 + s * (len + 6) - sy * s * s * 12;
        const wv = st === 'longwavy' ? Math.sin(s * 10 + time * 1.6) * 1.3 * s : 0;
        const dx = sx * s * s * 10;
        left.push([-9.8 - s * 4.2 + wv + dx, y]);
        right.push([4.5 + s * 2.2 + wv * 0.7 + dx, y]);
      }
      ctx.beginPath();
      ctx.moveTo(4.5, -7);
      ctx.bezierCurveTo(2, -13.5, -9, -12.5, -9.8, -6);
      for (let i = 1; i <= N; i++) {
        const p0 = left[i - 1], p1 = left[i];
        ctx.quadraticCurveTo(p0[0] - 1.4 * Math.sin(i * 1.7), (p0[1] + p1[1]) / 2, p1[0], p1[1]);
      }
      // pointes ondulées
      const lb = left[N], rb = right[N];
      const tips = 5;
      for (let k = 1; k <= tips; k++) {
        const tx = U.lerp(lb[0], rb[0], k / tips), ty = U.lerp(lb[1], rb[1], k / tips) + (k % 2 ? 2.6 : -0.6);
        const cx = U.lerp(lb[0], rb[0], (k - 0.5) / tips);
        ctx.quadraticCurveTo(cx, ty + 3.4, tx, ty);
      }
      for (let i = N - 1; i >= 0; i--) {
        const p0 = right[i + 1], p1 = right[i];
        ctx.quadraticCurveTo(p0[0] + 1.2 * Math.sin(i * 1.3), (p0[1] + p1[1]) / 2, p1[0], p1[1]);
      }
      ctx.closePath();
      const g = ctx.createLinearGradient(0, -12, 0, len);
      g.addColorStop(0, P.hair); g.addColorStop(0.55, P.hair); g.addColorStop(1, P.hair2);
      ctx.fillStyle = g; ctx.fill(); ctx.stroke();
      // reflets
      ctx.strokeStyle = P.hairHl; ctx.lineWidth = 0.8; ctx.globalAlpha *= 0.55;
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        const bx = -7 + j * 3.6;
        ctx.moveTo(bx, -2);
        for (let i = 1; i <= 6; i++) {
          const s = i / 6;
          ctx.lineTo(bx - s * 2 + Math.sin(s * 9 + j + time * 1.6) * 1.2 * s + sx * s * s * 9, -2 + s * (len - 3) - sy * s * s * 11);
        }
        ctx.stroke();
      }
      ctx.globalAlpha /= 0.55;
    } else if (st === 'ponytail') {
      const w = Math.sin(time * 3) * 1.5 + sx * 8;
      ctx.fillStyle = P.hair; ctx.beginPath();
      ctx.moveTo(-7, -6); ctx.quadraticCurveTo(-14 + w * 0.4, 0, -12 + w, 14 - sy * 6); ctx.quadraticCurveTo(-9 + w, 8, -5, -1); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = P.hairHl; ctx.beginPath(); ctx.arc(-7, -5, 1.6, 0, U.TAU); ctx.fill();
    } else if (st === 'braids') {
      for (let k = 0; k < 2; k++) {
        const bx = -7 + k * 2.5, w = Math.sin(time * 2 + k) * 1 + sx * 6;
        ctx.strokeStyle = OL; ctx.lineWidth = 4.2; ctx.beginPath(); ctx.moveTo(bx, -2); ctx.quadraticCurveTo(bx - 2 + w * 0.5, 8, bx - 1 + w, 18 - sy * 5); ctx.stroke();
        ctx.strokeStyle = P.hair; ctx.lineWidth = 2.6; ctx.stroke();
        ctx.strokeStyle = P.hair2; ctx.lineWidth = 0.7;
        for (let i = 0; i < 5; i++) { const yy = 1 + i * 3.4; ctx.beginPath(); ctx.moveTo(bx - 1.6 + w * i / 6, yy); ctx.lineTo(bx + 0.6 + w * i / 6, yy + 1.2); ctx.stroke(); }
      }
    } else if (st === 'bob' || st === 'curly') {
      ctx.fillStyle = P.hair; ctx.beginPath();
      if (st === 'curly') {
        for (let i = 0; i < 9; i++) { const a = Math.PI * 0.55 + i * 0.26; ctx.moveTo(0, 0); ctx.arc(-1 + Math.cos(a) * 9, -1 + Math.sin(a) * 8.5, 4, 0, U.TAU); }
        ctx.fill();
      } else {
        ctx.moveTo(-9, -6); ctx.quadraticCurveTo(-11.5, 4, -9, 7.5); ctx.lineTo(-2, 7.5); ctx.lineTo(-2, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
    }
    ctx.restore();
  }

  // ---------- tête ----------
  function drawHead(ctx, look, P, hx, hy, ang, pose, time, sx, sy) {
    ctx.save();
    ctx.translate(hx, hy); ctx.rotate(ang);
    const st = look.hair.style;
    const hat = look.hat ? look.hat.style : null;
    ctx.lineWidth = 1.3; ctx.strokeStyle = OL;
    // capuche (derrière la tête)
    if (hat === 'hood') {
      ctx.fillStyle = P.hat; ctx.beginPath();
      ctx.moveTo(-10.5, 6); ctx.quadraticCurveTo(-12.5, -12, 1, -12.5); ctx.quadraticCurveTo(11.5, -11, 10.5, 2); ctx.lineTo(8, 9); ctx.lineTo(-9, 9); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
    // visage
    ctx.fillStyle = P.skin;
    ctx.beginPath();
    ctx.moveTo(-6.8, -3);
    ctx.bezierCurveTo(-7.4, -10.5, 7.5, -10.8, 8.2, -2.2);
    ctx.bezierCurveTo(8.7, 3, 6.6, 7.4, 3.1, 8.4);
    ctx.bezierCurveTo(-0.4, 9.3, -5.2, 6.8, -6.6, 3.2);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    // ombre de joue
    ctx.save(); ctx.clip();
    ctx.fillStyle = P.skinShade; ctx.globalAlpha *= 0.45;
    ctx.beginPath(); ctx.ellipse(-6.5, 1, 3, 8, 0, 0, U.TAU); ctx.fill();
    ctx.restore();
    // oreille (cachée par les cheveux longs)
    const longHair = ['longwavy', 'long', 'bob', 'curly'].indexOf(st) >= 0 || hat === 'hood';
    if (!longHair) { ctx.fillStyle = P.skin; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(-4.6, 0.8, 1.3, 1.9, 0, 0, U.TAU); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1.3; }
    // barbe
    if (look.acc && look.acc.indexOf('beard') >= 0) {
      ctx.fillStyle = P.acc('beard', look.hair.color); ctx.beginPath();
      ctx.moveTo(-5.5, 1.5); ctx.quadraticCurveTo(-4, 10.5, 3, 10); ctx.quadraticCurveTo(8, 8.5, 8.2, 2.5); ctx.quadraticCurveTo(4, 5.5, 2, 4.4); ctx.quadraticCurveTo(-2, 5, -5.5, 1.5);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (look.acc && look.acc.indexOf('stubble') >= 0) {
      ctx.fillStyle = P.hair; ctx.globalAlpha *= 0.28;
      ctx.beginPath(); ctx.moveTo(-5, 2.5); ctx.quadraticCurveTo(-2, 9.5, 3, 8.6); ctx.quadraticCurveTo(7.5, 7, 8, 2.5); ctx.quadraticCurveTo(3, 5, -5, 2.5); ctx.fill();
      ctx.globalAlpha /= 0.28;
    }
    // traits du visage
    drawFaceSmall(ctx, look, P, pose, time);
    // cheveux dessus
    if (hat !== 'hood' && hat !== 'helmet') drawHairTop(ctx, look, P, st, time, sx, sy);
    // chapeaux
    drawHat(ctx, look, P, hat, time);
    // lunettes
    if (look.acc && look.acc.indexOf('glasses') >= 0) {
      ctx.strokeStyle = P.acc('glasses', '#2a2a2a'); ctx.lineWidth = 0.9;
      ctx.beginPath(); ctx.arc(4.3, 0.2, 2.2, 0, U.TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(-0.6, 0.2, 1.9, 0, U.TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(1.3, 0); ctx.lineTo(2.1, 0); ctx.stroke();
    }
    if (look.acc && look.acc.indexOf('sunglasses_head') >= 0) {
      ctx.fillStyle = '#1a1a22'; G.rr(ctx, -2, -8.4, 9.5, 2.6, 1.2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(4, -7.8, 2, 0.8);
    }
    if (look.acc && look.acc.indexOf('headphones') >= 0) {
      ctx.strokeStyle = OL; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.arc(-1.5, -1, 9.6, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      ctx.strokeStyle = P.acc('headphones', '#3fd6b5'); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#23232d'; ctx.strokeStyle = OL; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(-4.4, 0.8, 2.6, 3.4, 0, 0, U.TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = P.acc('headphones', '#3fd6b5'); ctx.beginPath(); ctx.ellipse(-4.6, 0.8, 1.2, 1.8, 0, 0, U.TAU); ctx.fill();
    }
    ctx.restore();
  }

  function drawFaceSmall(ctx, look, P, pose, time) {
    const face = pose.face || 'neutral';
    const lx = pose.lookX * 0.5, ly = pose.lookY * 0.4;
    // clignement
    const blinkCycle = (time * 0.37 + (look.skin.length * 0.13)) % 1;
    let closed = pose.blink > 0.5 || blinkCycle > 0.965;
    if (face === 'laugh') closed = true;
    const eyeY = 0.2 + ly;
    ctx.fillStyle = P.eyes;
    const eyeH = face === 'surprised' ? 2.1 : face === 'sad' ? 1.3 : 1.75;
    const drawEye = (ex, s) => {
      if (closed || face === 'hurt') {
        ctx.strokeStyle = P.brows; ctx.lineWidth = 0.9; ctx.beginPath();
        if (face === 'laugh' || face === 'happy') { ctx.arc(ex, eyeY + 0.6, 1.2 * s, Math.PI * 1.1, Math.PI * 1.9); }
        else { ctx.moveTo(ex - 1.3 * s, eyeY); ctx.lineTo(ex + 1.3 * s, eyeY); }
        ctx.stroke();
      } else {
        ctx.fillStyle = P.eyes;
        ctx.beginPath(); ctx.ellipse(ex + lx, eyeY, 1.2 * s, eyeH * s, 0, 0, U.TAU); ctx.fill();
        if (look.glowEyes) G.glow(ctx, ex + lx, eyeY, 5, look.eyes, 0.6);
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex + lx + 0.45 * s, eyeY - 0.7 * s, 0.45 * s, 0, U.TAU); ctx.fill();
      }
    };
    drawEye(4.3, 1);
    drawEye(-0.5, 0.85);
    // cils (Laura)
    if (look.hair.style === 'longwavy' && !closed) {
      ctx.strokeStyle = OL; ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(3, eyeY - 1.6); ctx.quadraticCurveTo(4.3, eyeY - 2.4, 5.8, eyeY - 1.8); ctx.stroke();
    }
    // sourcils
    ctx.strokeStyle = P.brows; ctx.lineWidth = 0.95; ctx.lineCap = 'round';
    let bt = 0, by = -3.2;
    if (face === 'surprised') by = -4.4;
    if (face === 'sad' || face === 'worried') bt = -0.35;
    if (face === 'determined' || face === 'angry') bt = 0.35;
    ctx.beginPath(); ctx.moveTo(3 + 0, by + bt * -1.2); ctx.lineTo(6, by + bt * 1.0 - 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-1.8, by + bt * 1.0 - 0.1); ctx.lineTo(0.6, by + bt * -1.1); ctx.stroke();
    // nez
    ctx.strokeStyle = P.skinShade; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(6.8, 1.2); ctx.quadraticCurveTo(7.9, 3.1, 6.6, 3.5); ctx.stroke();
    // joues
    ctx.fillStyle = 'rgba(240,110,120,' + (face === 'happy' || face === 'laugh' ? 0.4 : 0.22) + ')';
    ctx.beginPath(); ctx.ellipse(5.4, 3.6, 1.6, 0.9, 0, 0, U.TAU); ctx.fill();
    // bouche
    const mx = 3.3, my = 5.6;
    ctx.strokeStyle = OL; ctx.lineWidth = 0.85; ctx.fillStyle = '#7a2230';
    const talking = pose.talk > 0 && Math.sin(time * 26) > -0.2;
    if (talking || face === 'laugh' || face === 'surprised') {
      const h = face === 'surprised' ? 1.7 : face === 'laugh' ? 1.8 : 0.8 + Math.abs(Math.sin(time * 26)) * 1.1;
      ctx.beginPath(); ctx.ellipse(mx, my + 0.3, face === 'surprised' ? 1.2 : 1.8, h, 0, 0, U.TAU); ctx.fill();
      if (face !== 'surprised') { ctx.fillStyle = '#fff'; ctx.fillRect(mx - 1.2, my - 0.5 - h * 0.4, 2.4, 0.6); }
    } else if (face === 'sad' || face === 'hurt') {
      ctx.beginPath(); ctx.arc(mx, my + 1.6, 1.6, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke();
    } else if (face === 'worried') {
      ctx.beginPath(); ctx.moveTo(mx - 1.6, my + 0.6); ctx.quadraticCurveTo(mx - 0.5, my - 0.2, mx + 0.4, my + 0.5); ctx.quadraticCurveTo(mx + 1.2, my + 1, mx + 1.8, my + 0.2); ctx.stroke();
    } else if (face === 'determined') {
      ctx.beginPath(); ctx.moveTo(mx - 1.6, my + 0.4); ctx.quadraticCurveTo(mx, my + 1.1, mx + 1.8, my); ctx.stroke();
    } else {
      // sourire
      ctx.beginPath(); ctx.moveTo(mx - 1.9, my - 0.2); ctx.quadraticCurveTo(mx, my + (face === 'happy' ? 2.4 : 1.6), mx + 2, my - 0.4); ctx.stroke();
      if (face === 'happy') { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(mx - 1.6, my); ctx.quadraticCurveTo(mx, my + 1.4, mx + 1.7, my - 0.2); ctx.closePath(); ctx.fill(); }
    }
    if (pose.handMouth) { /* main géré par le bras */ }
  }

  function drawHairTop(ctx, look, P, st, time, sx, sy) {
    ctx.fillStyle = P.hair; ctx.strokeStyle = OL; ctx.lineWidth = 1.3;
    if (st === 'longwavy' || st === 'long') {
      // calotte
      ctx.beginPath();
      ctx.moveTo(8.6, -1);
      ctx.bezierCurveTo(9.5, -11, -2, -14.5, -8.5, -8);
      ctx.bezierCurveTo(-10.6, -5, -10, 2, -8.6, 5);
      ctx.lineTo(-5.6, 3.5);
      ctx.quadraticCurveTo(-5.2, -3, -3, -5.6);
      ctx.quadraticCurveTo(3, -9.2, 6.4, -5.2);
      ctx.quadraticCurveTo(7.6, -3.4, 8.6, -1);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // raie + reflet
      ctx.strokeStyle = P.hairHl; ctx.lineWidth = 0.8; ctx.globalAlpha *= 0.7;
      ctx.beginPath(); ctx.moveTo(-6, -8); ctx.quadraticCurveTo(-1, -12.5, 5, -9.5); ctx.stroke();
      ctx.globalAlpha /= 0.7;
      // mèche avant qui tombe devant l'épaule
      const w = Math.sin(time * 1.7) * 0.8 + sx * 5;
      ctx.fillStyle = P.hair; ctx.strokeStyle = OL; ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(6.4, -5.2);
      ctx.quadraticCurveTo(10.8, 0, 9.4 + w * 0.4, 7);
      ctx.quadraticCurveTo(8.2 + w * 0.8, 13 - sy * 3, 9.8 + w, 19 - sy * 5);
      ctx.quadraticCurveTo(7.4 + w, 17 - sy * 4, 6.6 + w * 0.6, 12);
      ctx.quadraticCurveTo(7.4, 5, 5.6, -1.8);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, -6, 0, 19);
      g.addColorStop(0, P.hair); g.addColorStop(1, P.hair2);
      ctx.fillStyle = g; ctx.fill(); ctx.stroke();
    } else if (st === 'short' || st === 'buzz') {
      ctx.beginPath();
      ctx.moveTo(8.4, -2.5);
      ctx.bezierCurveTo(9, -12, -4, -13.5, -8, -6.5);
      ctx.quadraticCurveTo(-9, -2, -7, 2.5);
      ctx.lineTo(-5, 1);
      ctx.quadraticCurveTo(-4.5, -4, -1, -5.5);
      if (st === 'short') { ctx.lineTo(1.5, -4.5); ctx.lineTo(3, -6); ctx.lineTo(5, -4.5); }
      ctx.quadraticCurveTo(7, -4.8, 8.4, -2.5);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (st === 'spiky') {
      ctx.beginPath();
      ctx.moveTo(8.5, -2.5);
      const spikes = [[9, -8], [6, -10], [6.5, -15], [2, -11], [0, -16], [-2.5, -11.5], [-6, -15], [-6.5, -9], [-10.5, -9], [-8.5, -4], [-9.5, 1]];
      for (const s of spikes) ctx.lineTo(s[0] + (s[1] < -12 ? Math.sin(time * 3 + s[0]) * 0.4 : 0), s[1]);
      ctx.lineTo(-6.5, 2); ctx.quadraticCurveTo(-4, -4, 0, -5); ctx.quadraticCurveTo(5, -5.5, 8.5, -2.5);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, -16, 0, 0); g.addColorStop(0, P.hair2); g.addColorStop(1, P.hair);
      ctx.fillStyle = g; ctx.fill(); ctx.stroke();
    } else if (st === 'curly') {
      ctx.beginPath();
      const pts = [[8, -4], [7, -9], [3, -12], [-2, -12.5], [-6.5, -10], [-9, -5.5], [-9, 0]];
      for (const p of pts) { ctx.moveTo(p[0] + 3, p[1]); ctx.arc(p[0], p[1], 3.2, 0, U.TAU); }
      ctx.fill();
      ctx.beginPath(); ctx.moveTo(8, -4); ctx.bezierCurveTo(8, -12, -8, -13, -9, -3); ctx.lineTo(-6, 0); ctx.quadraticCurveTo(0, -7, 8, -4); ctx.fill();
      ctx.strokeStyle = P.hair2; ctx.lineWidth = 0.7;
      for (const p of pts) { ctx.beginPath(); ctx.arc(p[0], p[1], 1.6, 0.5, 3.5); ctx.stroke(); }
    } else if (st === 'bob') {
      ctx.beginPath();
      ctx.moveTo(9, 3);
      ctx.bezierCurveTo(11, -11, -6, -15, -9.5, -5);
      ctx.quadraticCurveTo(-10.5, 1, -8.5, 6);
      ctx.lineTo(-5.2, 4.5); ctx.quadraticCurveTo(-5, -3, -1, -5.5);
      ctx.quadraticCurveTo(4.5, -6, 6.5, -3);
      ctx.quadraticCurveTo(7.5, 0, 7, 4);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (st === 'ponytail' || st === 'braids') {
      ctx.beginPath();
      ctx.moveTo(8.5, -2);
      ctx.bezierCurveTo(9.5, -12, -4, -14, -8.2, -7);
      ctx.quadraticCurveTo(-9.5, -2, -7.8, 3);
      ctx.lineTo(-5.4, 1.5); ctx.quadraticCurveTo(-5, -3, -2, -5.6);
      ctx.quadraticCurveTo(4, -8.5, 7, -4.5);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      if (st === 'ponytail') {
        ctx.strokeStyle = P.hairHl; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-5, -9); ctx.quadraticCurveTo(0, -12, 5, -8); ctx.stroke();
      }
    }
  }

  function drawHat(ctx, look, P, hat, time) {
    if (!hat) return;
    ctx.strokeStyle = OL; ctx.lineWidth = 1.2;
    switch (hat) {
      case 'cap':
      case 'capback': {
        ctx.fillStyle = P.hat;
        ctx.beginPath(); ctx.moveTo(-9, -4.2); ctx.bezierCurveTo(-9.8, -16.4, 9.4, -16.4, 9.2, -4.6); ctx.closePath(); ctx.fill(); ctx.stroke();
        // visière bombée (vers l'avant du visage)
        ctx.fillStyle = P.hat2;
        ctx.beginPath();
        if (hat === 'capback') {
          ctx.moveTo(-4, -6.4); ctx.bezierCurveTo(-10, -7.6, -15.6, -5.4, -15.3, -3);
          ctx.bezierCurveTo(-12, -3.5, -8, -4.2, -4, -4.6);
        } else {
          ctx.moveTo(4, -6.4); ctx.bezierCurveTo(10, -7.6, 15.6, -5.4, 15.3, -3);
          ctx.bezierCurveTo(12, -3.5, 8, -4.2, 4, -4.6);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = P.hat2; ctx.beginPath(); ctx.arc(0.4, -14.2, 1.1, 0, U.TAU); ctx.fill();
        // petit logo brode sur la calotte (Ofire)
        if (look.hat.logo) {
          ctx.fillStyle = look.hat.logo;
          ctx.beginPath(); ctx.ellipse(2.6, -9.6, 2.1, 1.35, -0.22, 0, U.TAU); ctx.fill();
          ctx.strokeStyle = look.hat.logo; ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(0.9, -8.5); ctx.lineTo(4.3, -10.7); ctx.stroke();
        }
        break;
      }
      case 'beanie': {
        ctx.fillStyle = P.hat;
        ctx.beginPath(); ctx.moveTo(-9, -3); ctx.bezierCurveTo(-9.5, -16, 9.5, -16, 9.2, -3); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = P.hat2; G.rr(ctx, -9.6, -5.5, 19, 3.4, 1.5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = P.hat2; ctx.beginPath(); ctx.arc(0, -14.5, 2.4, 0, U.TAU); ctx.fill(); ctx.stroke();
        break;
      }
      case 'beret': {
        ctx.fillStyle = P.hat;
        ctx.beginPath(); ctx.ellipse(-0.5, -9, 10.5, 4.2, -0.18, 0, U.TAU); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(0.5, -15); ctx.stroke();
        break;
      }
      case 'bucket': {
        ctx.fillStyle = P.hat;
        ctx.beginPath(); ctx.moveTo(-7.5, -6); ctx.bezierCurveTo(-7.5, -14.5, 8, -14.5, 8, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = P.hat2; ctx.beginPath(); ctx.ellipse(0.3, -5.5, 12, 2.6, 0, 0, U.TAU); ctx.fill(); ctx.stroke();
        break;
      }
      case 'flatcap': {
        ctx.fillStyle = P.hat;
        ctx.beginPath(); ctx.moveTo(-9, -4.5); ctx.bezierCurveTo(-9, -12.5, 8, -13.5, 12.5, -6.5); ctx.lineTo(9, -4.2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = P.hat2; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(-5, -10); ctx.quadraticCurveTo(2, -11, 8, -7.5); ctx.stroke();
        break;
      }
      case 'helmet': {
        ctx.fillStyle = P.hat;
        ctx.beginPath(); ctx.moveTo(-9.5, -2); ctx.bezierCurveTo(-10, -15.5, 10, -15.5, 9.8, -2.5); ctx.lineTo(11, -2); ctx.lineTo(-10.5, -1.5); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#3a3a3a'; G.rr(ctx, 5.5, -9, 4, 4, 1); ctx.fill();
        ctx.fillStyle = P.hat2; ctx.beginPath(); ctx.arc(8.6, -7, 1.6, 0, U.TAU); ctx.fill();
        G.glow(ctx, 10, -7, 14, '#fff6c0', 0.55);
        break;
      }
      case 'bandana': {
        ctx.fillStyle = P.hat;
        ctx.beginPath(); ctx.moveTo(-8.5, -3.5); ctx.bezierCurveTo(-9, -13.5, 9, -13.5, 9, -4); ctx.quadraticCurveTo(0, -6.5, -8.5, -3.5); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-8, -5); ctx.lineTo(-13, -2 + Math.sin(time * 4) * 0.8); ctx.lineTo(-10, -1); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = P.hat2; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-5 + i * 3, -9 + (i % 2) * 2, 0.6, 0, U.TAU); ctx.fill(); }
        break;
      }
      case 'catears': {
        ctx.strokeStyle = P.hat; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(0, -2, 9.4, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
        for (const ex of [-5, 4]) {
          ctx.fillStyle = P.hat; ctx.strokeStyle = OL; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(ex - 3, -9.5); ctx.lineTo(ex, -16 + Math.sin(time * 2 + ex) * 0.4); ctx.lineTo(ex + 3, -9.5); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle = P.hat2; ctx.beginPath(); ctx.moveTo(ex - 1.5, -10); ctx.lineTo(ex, -13.8); ctx.lineTo(ex + 1.5, -10); ctx.closePath(); ctx.fill();
        }
        break;
      }
      case 'hood': {
        // bord de capuche devant le visage
        ctx.fillStyle = P.hat;
        ctx.beginPath(); ctx.moveTo(-10.5, 6); ctx.quadraticCurveTo(-12, -12, 1, -12.5); ctx.quadraticCurveTo(10, -11.5, 10, -4);
        ctx.quadraticCurveTo(4, -9, -3, -6); ctx.quadraticCurveTo(-6.5, -2, -6, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
        break;
      }
      default: break;
    }
  }

  // =====================================================================
  // ÉCHO (le compagnon)
  // =====================================================================
  C.drawEcho = function (ctx, x, y, o) {
    o = o || {};
    const t = o.time || 0, s = o.scale || 1, dir = o.facing || 1;
    const glowCol = o.color || '#ff7ad9';
    const power = o.power === undefined ? 1 : o.power;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    if (power > 0) G.glow(ctx, 0, 0, 30 + Math.sin(t * 3) * 3, glowCol, 0.35 * power);
    // antenne (après la fin)
    if (o.antenna) {
      ctx.strokeStyle = '#d8d4e6'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-2, -8.5); ctx.lineTo(-4, -14); ctx.stroke();
      ctx.fillStyle = '#c9b8ff'; ctx.beginPath(); ctx.arc(-4, -14.5, 1.6, 0, U.TAU); ctx.fill();
      G.glow(ctx, -4, -14.5, 8, '#c9b8ff', 0.6 + Math.sin(t * 4) * 0.3);
    }
    // corps (sphère blanche)
    const g = ctx.createRadialGradient(-3, -3, 1, 0, 0, 10);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#eeeaf4'); g.addColorStop(1, '#c9c2d8');
    ctx.fillStyle = g; ctx.strokeStyle = OL; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, U.TAU); ctx.fill(); ctx.stroke();
    // anneau latéral
    ctx.strokeStyle = '#b9b2c9'; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.ellipse(0, 0, 9, 3, 0, 0.1, Math.PI - 0.1); ctx.stroke();
    // objectif
    const lx = dir * 2.6 + (o.lookX || 0), ly = -0.5 + (o.lookY || 0);
    ctx.fillStyle = '#2a2436'; ctx.beginPath(); ctx.arc(lx, ly, 4.6, 0, U.TAU); ctx.fill();
    ctx.strokeStyle = '#8c86a0'; ctx.lineWidth = 0.8; ctx.stroke();
    const pulse = 0.6 + 0.4 * Math.sin(t * (o.talking ? 18 : 3));
    const irisC = power > 0 ? glowCol : '#554c66';
    ctx.fillStyle = irisC; ctx.beginPath(); ctx.arc(lx, ly, 2.6 * (0.8 + pulse * 0.25), 0, U.TAU); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(lx - 1, ly - 1.2, 0.9, 0, U.TAU); ctx.fill();
    if (power > 0) G.glow(ctx, lx, ly, 10, glowCol, 0.5 * pulse * power);
    ctx.restore();
  };

  // =====================================================================
  // PIXEL (le chat de Keeli)
  // =====================================================================
  C.drawCat = function (ctx, x, y, t, facing, sitting) {
    ctx.save(); ctx.translate(x, y); ctx.scale(facing || 1, 1);
    const tail = Math.sin(t * 3) * 0.4;
    ctx.strokeStyle = OL; ctx.lineWidth = 1.1; ctx.fillStyle = '#f2b35c';
    // queue
    ctx.lineCap = 'round'; ctx.lineWidth = 4.2; ctx.beginPath(); ctx.moveTo(-6, -4); ctx.quadraticCurveTo(-13, -6 + tail * 6, -11, -15 + tail * 4); ctx.stroke();
    ctx.strokeStyle = '#f2b35c'; ctx.lineWidth = 2.4; ctx.stroke();
    ctx.strokeStyle = OL; ctx.lineWidth = 1.1;
    // corps
    ctx.beginPath(); ctx.ellipse(-1, -5, 7, sitting ? 5.5 : 4.5, 0, 0, U.TAU); ctx.fill(); ctx.stroke();
    // tête
    ctx.beginPath(); ctx.arc(5, -11, 4.6, 0, U.TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2, -14); ctx.lineTo(2.8, -18.5); ctx.lineTo(5, -15); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -15.2); ctx.lineTo(8.6, -18.3); ctx.lineTo(9, -13.4); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d98a36'; ctx.fillRect(-4, -9, 1.4, 5); ctx.fillRect(-1, -9.5, 1.4, 5);
    ctx.fillStyle = '#2a2a2a';
    const bl = (t * 0.5) % 1 > 0.95;
    if (bl) { ctx.fillRect(4.6, -11.5, 1.6, 0.5); ctx.fillRect(7.2, -11.5, 1.4, 0.5); }
    else { ctx.beginPath(); ctx.ellipse(5.4, -11.4, 0.7, 1.1, 0, 0, U.TAU); ctx.ellipse(7.9, -11.4, 0.6, 1.1, 0, 0, U.TAU); ctx.fill(); }
    ctx.fillStyle = '#ff8fa8'; ctx.beginPath(); ctx.arc(7.9, -9.6, 0.6, 0, U.TAU); ctx.fill();
    // pattes
    ctx.fillStyle = '#f2b35c';
    ctx.beginPath(); ctx.ellipse(3, -0.8, 2, 1.3, 0, 0, U.TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-4, -0.8, 2, 1.3, 0, 0, U.TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  };

  // =====================================================================
  // PORTRAITS DE DIALOGUE
  // =====================================================================
  const EXPR = {
    neutral: { brow: 0, tilt: 0, eye: 1, mouth: 'smile', blush: 0.18 },
    happy: { brow: -1, tilt: 0, eye: 0.9, mouth: 'grin', blush: 0.4, eyeSmile: 0.4 },
    laugh: { brow: -2, tilt: 0, eye: 0, mouth: 'laugh', blush: 0.55, happyClosed: true },
    surprised: { brow: -5, tilt: 0, eye: 1.25, mouth: 'o', blush: 0.15 },
    sad: { brow: 0, tilt: -1, eye: 0.7, mouth: 'frown', blush: 0.1, lookY: 2 },
    worried: { brow: -1, tilt: -1, eye: 1, mouth: 'wavy', blush: 0.12 },
    determined: { brow: 1.5, tilt: 1, eye: 0.85, mouth: 'set', blush: 0.1 },
    angry: { brow: 2, tilt: 1.4, eye: 0.8, mouth: 'frown', blush: 0.05 },
    think: { brow: -1.5, tilt: 0.3, eye: 0.95, mouth: 'side', blush: 0.1, lookX: -2, lookY: -2 },
    wink: { brow: -1, tilt: 0, eye: 1, mouth: 'grin', blush: 0.4, wink: true },
    shy: { brow: 0, tilt: -0.6, eye: 0.85, mouth: 'small', blush: 0.75, lookY: 2, lookX: -1.5 },
    smirk: { brow: 0.5, tilt: 0.3, eye: 0.85, mouth: 'smirk', blush: 0.15 },
    tired: { brow: 0.5, tilt: -0.5, eye: 0.5, mouth: 'flat', blush: 0.05 }
  };
  C.EXPR = EXPR;

  // portrait générique : (x,y) = centre du cadre, size = côté du cadre
  C.drawPortrait = function (ctx, id, x, y, size, expr, time, talking, facing, gray) {
    if (id === 'echo') return drawEchoPortrait(ctx, x, y, size, expr, time, talking);
    if (id === 'veilleur' || id === 'radio') return drawVeilleurPortrait(ctx, x, y, size, time, talking, id === 'radio');
    if (id === 'silence') return drawSilencePortrait(ctx, x, y, size, time, talking);
    if (id === 'pixel') { ctx.save(); ctx.translate(x, y + size * 0.3); ctx.scale(size / 30, size / 30); C.drawCat(ctx, -2, 0, time, facing || -1, true); ctx.restore(); return; }
    if (id === 'chat') return;
    const look = C.LOOKS[id];
    if (!look) return;
    const P = pal(look, gray || 0);
    const E = EXPR[expr] || EXPR.neutral;
    const s = size / 150;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s * (facing || 1), s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    const breathe = Math.sin(time * 2) * 1.2;
    const talkOpen = talking ? Math.max(0, Math.sin(time * 24)) : 0;
    const blinkCycle = (time * 0.31 + id.length * 0.17) % 1;
    const blink = blinkCycle > 0.965;
    const hs = look.hair.style, hat = look.hat ? look.hat.style : null;
    const bw = look.body === 'broad' ? 1.12 : look.body === 'round' ? 1.1 : 1;
    ctx.translate(0, 8 + breathe * 0.4);

    // ----- cheveux arrière -----
    if (hs === 'longwavy' || hs === 'long') {
      ctx.fillStyle = P.hair; ctx.strokeStyle = OL; ctx.lineWidth = 3;
      const sw = Math.sin(time * 1.3) * 2;
      ctx.beginPath();
      ctx.moveTo(-8, -52);
      ctx.bezierCurveTo(-52, -50, -50, 0, -56 + sw, 30);
      for (let i = 0; i < 6; i++) ctx.quadraticCurveTo(-60 + i * 4 + sw, 42 + i * 8, -52 + i * 5 + sw, 52 + i * 6 + (i % 2 ? 6 : 0));
      ctx.lineTo(-20, 90); ctx.lineTo(40, 90);
      for (let i = 0; i < 5; i++) ctx.quadraticCurveTo(52 + i * 2 - sw, 80 - i * 10, 50 - sw + (i % 2 ? 6 : 0), 70 - i * 12);
      ctx.bezierCurveTo(56 - sw, 10, 52, -50, 8, -52);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, -50, 0, 90);
      g.addColorStop(0, P.hair); g.addColorStop(0.55, P.hair); g.addColorStop(1, P.hair2);
      ctx.fillStyle = g; ctx.fill(); ctx.stroke();
      ctx.strokeStyle = P.hairHl; ctx.lineWidth = 1.6; ctx.globalAlpha *= 0.5;
      for (let j = 0; j < 4; j++) {
        ctx.beginPath(); const bx = -46 + j * 6;
        ctx.moveTo(bx, -10);
        for (let k = 1; k <= 8; k++) ctx.lineTo(bx - 3 + Math.sin(k * 1.3 + j + time) * 3, -10 + k * 11);
        ctx.stroke();
        ctx.beginPath(); const bx2 = 38 + j * 3.5;
        ctx.moveTo(bx2, -10);
        for (let k = 1; k <= 8; k++) ctx.lineTo(bx2 + Math.sin(k * 1.4 + j + time) * 3, -10 + k * 11);
        ctx.stroke();
      }
      ctx.globalAlpha /= 0.5;
    } else if (hs === 'ponytail') {
      const sw = Math.sin(time * 2) * 3;
      ctx.fillStyle = P.hair; ctx.strokeStyle = OL; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-30, -30); ctx.bezierCurveTo(-70 + sw, -20, -60 + sw, 40, -48 + sw, 70); ctx.quadraticCurveTo(-40, 30, -22, -10); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (hs === 'braids') {
      for (const bx of [-34, 30]) {
        ctx.strokeStyle = OL; ctx.lineWidth = 13; ctx.beginPath(); ctx.moveTo(bx, -20); ctx.quadraticCurveTo(bx * 1.2, 30, bx * 1.1, 80); ctx.stroke();
        ctx.strokeStyle = P.hair; ctx.lineWidth = 9; ctx.stroke();
        ctx.strokeStyle = P.hair2; ctx.lineWidth = 1.5;
        for (let i = 0; i < 9; i++) { const yy = -14 + i * 10; ctx.beginPath(); ctx.moveTo(bx * (1 + i * 0.02) - 4, yy); ctx.lineTo(bx * (1 + i * 0.02) + 4, yy + 4); ctx.stroke(); }
      }
    } else if (hs === 'curly' && hat !== 'beanie') {
      ctx.fillStyle = P.hair; ctx.strokeStyle = OL; ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 14; i++) { const a = Math.PI * 0.75 + i * 0.12 * Math.PI; ctx.moveTo(Math.cos(a) * 40 + 12, Math.sin(a) * 42 - 8); ctx.arc(Math.cos(a) * 40, Math.sin(a) * 42 - 8, 12, 0, U.TAU); }
      ctx.fill();
    } else if (hs === 'bob') {
      ctx.fillStyle = P.hair; ctx.strokeStyle = OL; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-40, -30); ctx.quadraticCurveTo(-48, 10, -40, 30); ctx.lineTo(44, 30); ctx.quadraticCurveTo(50, 10, 42, -30); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (hat === 'hood' || look.top.style === 'cloak') {
      ctx.fillStyle = P.hat || P.top; ctx.strokeStyle = OL; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-50, 70); ctx.bezierCurveTo(-58, -40, -30, -70, 2, -70); ctx.bezierCurveTo(36, -70, 60, -40, 52, 70); ctx.closePath(); ctx.fill(); ctx.stroke();
    }

    // ----- épaules / buste -----
    drawBust(ctx, look, P, bw, time);

    // ----- cou -----
    ctx.fillStyle = P.skin; ctx.strokeStyle = OL; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-11, 18); ctx.lineTo(-10, 44); ctx.quadraticCurveTo(2, 50, 13, 44); ctx.lineTo(13, 18); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = P.skinShade; ctx.globalAlpha *= 0.55; ctx.beginPath(); ctx.moveTo(-11, 18); ctx.lineTo(13, 18); ctx.lineTo(12, 30); ctx.quadraticCurveTo(0, 34, -11, 28); ctx.closePath(); ctx.fill(); ctx.globalAlpha /= 0.55;
    if (look.acc && look.acc.indexOf('necklace') >= 0) {
      ctx.strokeStyle = P.gold; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(1, 30, 16, 0.45, Math.PI - 0.45); ctx.stroke();
      ctx.beginPath(); ctx.arc(1, 30, 22, 0.55, Math.PI - 0.55); ctx.stroke();
      ctx.fillStyle = P.gold; ctx.beginPath(); ctx.arc(1, 52.5, 2.4, 0, U.TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(1, 46, 1.5, 0, U.TAU); ctx.fill();
    }

    // ----- tête -----
    ctx.save();
    ctx.rotate(Math.sin(time * 0.9) * 0.015 + (expr === 'sad' ? 0.04 : expr === 'think' ? -0.05 : 0));
    // oreille
    ctx.fillStyle = P.skin; ctx.strokeStyle = OL; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(-25, 2, 6, 9, 0.1, 0, U.TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = P.skinShade; ctx.beginPath(); ctx.ellipse(-25, 2, 2.6, 5, 0.1, 0, U.TAU); ctx.fill();
    // visage
    ctx.fillStyle = P.skin; ctx.strokeStyle = OL; ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(-24, -12);
    ctx.bezierCurveTo(-24, -44, 30, -46, 31, -12);
    ctx.bezierCurveTo(32, 6, 25, 22, 12, 29);
    ctx.bezierCurveTo(6, 32, -1, 32, -7, 28);
    ctx.bezierCurveTo(-18, 20, -24, 8, -24, -12);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.clip();
    ctx.fillStyle = P.skinShade; ctx.globalAlpha *= 0.4;
    ctx.beginPath(); ctx.ellipse(-24, 4, 9, 30, 0, 0, U.TAU); ctx.fill();
    ctx.restore();
    // barbe / moustache
    if (look.acc && look.acc.indexOf('beard') >= 0) {
      ctx.fillStyle = P.acc('beard', look.hair.color); ctx.strokeStyle = OL; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(-22, 0); ctx.bezierCurveTo(-20, 38, 26, 40, 31, 0); ctx.bezierCurveTo(24, 16, 14, 14, 6, 16); ctx.bezierCurveTo(-4, 16, -14, 12, -22, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (look.acc && look.acc.indexOf('stubble') >= 0) {
      ctx.fillStyle = P.hair; ctx.globalAlpha *= 0.22;
      ctx.beginPath(); ctx.moveTo(-20, 6); ctx.bezierCurveTo(-16, 34, 24, 34, 30, 4); ctx.bezierCurveTo(20, 16, -6, 18, -20, 6); ctx.fill();
      ctx.globalAlpha /= 0.22;
    }
    // yeux
    const lx = (E.lookX || 0), ly = (E.lookY || 0);
    const eyeOpen = blink ? 0.05 : E.eye;
    drawPEye(ctx, 15, -4, 1, eyeOpen, E, P, lx, ly, look, E.wink, time);
    drawPEye(ctx, -9, -4, 0.86, eyeOpen, E, P, lx, ly, look, false, time);
    // sourcils
    ctx.strokeStyle = P.brows; ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    const by = -17 + E.brow;
    ctx.beginPath(); ctx.moveTo(8, by + E.tilt * 2.5); ctx.quadraticCurveTo(15, by - 3 + E.tilt * 0.5, 23, by - 1 - E.tilt * 1.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-15, by - 1 - E.tilt * 1.5 + 1); ctx.quadraticCurveTo(-9, by - 3 + E.tilt * 0.5, -3, by + E.tilt * 2.5); ctx.stroke();
    // nez
    ctx.strokeStyle = P.skinShade; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(7, 0); ctx.quadraticCurveTo(10, 9, 6, 11); ctx.stroke();
    // joues
    ctx.fillStyle = 'rgba(245,105,125,' + E.blush + ')';
    ctx.beginPath(); ctx.ellipse(21, 9, 6, 3.4, 0, 0, U.TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-12, 9, 5, 3, 0, 0, U.TAU); ctx.fill();
    // bouche
    drawPMouth(ctx, 5, 18, E, P, talkOpen, look);
    if (look.acc && look.acc.indexOf('mustache') >= 0) {
      ctx.fillStyle = P.acc('mustache', '#8a7666'); ctx.strokeStyle = OL; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(5, 13); ctx.bezierCurveTo(-2, 10, -10, 14, -12, 19); ctx.bezierCurveTo(-5, 16, 0, 17, 5, 15.5); ctx.bezierCurveTo(10, 17, 16, 16, 22, 19); ctx.bezierCurveTo(20, 13, 12, 10, 5, 13); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (look.acc && look.acc.indexOf('earrings') >= 0) { ctx.fillStyle = P.gold; ctx.beginPath(); ctx.arc(-25, 13, 2.4, 0, U.TAU); ctx.fill(); ctx.beginPath(); ctx.arc(-25, 18, 1.8, 0, U.TAU); ctx.fill(); }
    // cheveux dessus
    drawPHairTop(ctx, look, P, hs, hat, time);
    drawPHat(ctx, look, P, hat, time);
    if (look.acc && look.acc.indexOf('glasses') >= 0) {
      ctx.strokeStyle = P.acc('glasses', '#2a2a2a'); ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.arc(15, -3, 10, 0, U.TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(-9, -3, 8.5, 0, U.TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-0.5, -4); ctx.lineTo(5, -4); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(10, -8); ctx.lineTo(13, -11); ctx.stroke();
    }
    if (look.acc && look.acc.indexOf('sunglasses_head') >= 0) {
      ctx.fillStyle = '#16161e'; G.rr(ctx, -16, -40, 44, 11, 5); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(14, -38, 8, 3);
    }
    if (look.acc && look.acc.indexOf('headphones') >= 0) {
      ctx.strokeStyle = OL; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(2, -6, 38, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
      ctx.strokeStyle = P.acc('headphones', '#3fd6b5'); ctx.lineWidth = 5.5; ctx.stroke();
      ctx.fillStyle = '#23232d'; ctx.strokeStyle = OL; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(-26, 0, 9, 14, 0, 0, U.TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = P.acc('headphones', '#3fd6b5'); ctx.beginPath(); ctx.ellipse(-27, 0, 4, 7, 0, 0, U.TAU); ctx.fill();
    }
    ctx.restore();
    ctx.restore();
  };

  function drawPEye(ctx, ex, ey, s, open, E, P, lx, ly, look, wink, time) {
    ctx.save();
    ctx.translate(ex, ey);
    ctx.scale(s, s);
    if (E.happyClosed || wink || open < 0.1) {
      ctx.strokeStyle = OL; ctx.lineWidth = 2.6;
      ctx.beginPath();
      if (E.happyClosed || wink) ctx.arc(0, 3, 6.5, Math.PI * 1.15, Math.PI * 1.85);
      else { ctx.moveTo(-7, 1); ctx.quadraticCurveTo(0, 3.5, 7, 1); }
      ctx.stroke();
      if (look.hair.style === 'longwavy') { ctx.beginPath(); ctx.moveTo(6, -1); ctx.lineTo(9, -3); ctx.stroke(); }
      ctx.restore();
      return;
    }
    const h = 6.2 * open, w = 7.2;
    // blanc de l'œil
    ctx.fillStyle = '#fbf8ff';
    ctx.beginPath(); ctx.moveTo(-w, 0.5); ctx.quadraticCurveTo(-1, -h * 1.3, w, -0.5); ctx.quadraticCurveTo(1, h * 1.05, -w, 0.5); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.clip();
    // iris
    const ix = 1 + lx * 0.8, iy = 0.3 + ly * 0.6;
    const g = ctx.createRadialGradient(ix - 1, iy - 1.5, 0.5, ix, iy, 5.2);
    g.addColorStop(0, U.shade(P.eyes, 0.35)); g.addColorStop(0.7, P.eyes); g.addColorStop(1, U.shade(P.eyes, -0.4));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ix, iy, 5.2, 0, U.TAU); ctx.fill();
    ctx.fillStyle = '#120a0e'; ctx.beginPath(); ctx.arc(ix, iy, 2.4, 0, U.TAU); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ix + 1.8, iy - 2, 1.5, 0, U.TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(ix - 1.8, iy + 1.8, 0.7, 0, U.TAU); ctx.fill();
    if (look.glowEyes) { ctx.restore(); G.glow(ctx, ix, iy, 14, look.eyes, 0.6); ctx.save(); }
    ctx.restore();
    // paupière / cils
    ctx.strokeStyle = OL; ctx.lineWidth = 2.8;
    ctx.beginPath(); ctx.moveTo(-w - 0.5, 0.8); ctx.quadraticCurveTo(-1, -h * 1.35, w + 0.5, -0.8); ctx.stroke();
    if (look.hair.style === 'longwavy' || look.hair.style === 'ponytail' || look.hair.style === 'bob') {
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(w - 0.5, -1); ctx.lineTo(w + 3.5, -3.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(w - 3, -h * 0.8); ctx.lineTo(w, -h * 0.8 - 3); ctx.stroke();
    }
    ctx.lineWidth = 1; ctx.strokeStyle = U.shade(P.skinShade, -0.1);
    ctx.beginPath(); ctx.moveTo(-w + 1, 2); ctx.quadraticCurveTo(0, h * 0.95, w - 1, 1); ctx.stroke();
    if (E.eyeSmile) { ctx.strokeStyle = P.skinShade; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-w + 1, h * 0.7 + 1); ctx.quadraticCurveTo(0, h * 0.3, w - 1, h * 0.7); ctx.stroke(); }
    ctx.restore();
  }

  function drawPMouth(ctx, mx, my, E, P, open, look) {
    ctx.strokeStyle = OL; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
    const lips = P.lips;
    let m = E.mouth;
    if (open > 0.15 && (m === 'smile' || m === 'set' || m === 'small' || m === 'flat' || m === 'side' || m === 'smirk')) m = 'talk';
    if (open > 0.15 && m === 'grin') m = 'grinTalk';
    switch (m) {
      case 'smile':
        ctx.beginPath(); ctx.moveTo(mx - 9, my - 1); ctx.quadraticCurveTo(mx + 1, my + 7, mx + 11, my - 2); ctx.stroke();
        ctx.strokeStyle = lips; ctx.lineWidth = 1.5; ctx.globalAlpha *= 0.6; ctx.beginPath(); ctx.moveTo(mx - 5, my + 4.5); ctx.quadraticCurveTo(mx + 1, my + 6.5, mx + 7, my + 4); ctx.stroke(); ctx.globalAlpha /= 0.6;
        break;
      case 'grin':
      case 'grinTalk': {
        const h = m === 'grinTalk' ? 7 + open * 5 : 7;
        ctx.fillStyle = '#6a1c2a';
        ctx.beginPath(); ctx.moveTo(mx - 11, my - 2); ctx.quadraticCurveTo(mx + 1, my + h * 1.6, mx + 13, my - 3); ctx.quadraticCurveTo(mx + 1, my + 1, mx - 11, my - 2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(mx - 9, my - 1); ctx.quadraticCurveTo(mx + 1, my + 3.2, mx + 11, my - 2); ctx.quadraticCurveTo(mx + 1, my + 1, mx - 9, my - 1); ctx.fill();
        ctx.fillStyle = '#e36b7b'; ctx.beginPath(); ctx.ellipse(mx + 2, my + h * 0.55, 5, 2.4, 0, 0, U.TAU); ctx.fill();
        break;
      }
      case 'laugh': {
        ctx.fillStyle = '#6a1c2a';
        ctx.beginPath(); ctx.moveTo(mx - 12, my - 3); ctx.quadraticCurveTo(mx + 1, my + 20, mx + 14, my - 4); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(mx - 10, my - 2); ctx.lineTo(mx + 12, my - 3); ctx.lineTo(mx + 11, my + 1); ctx.lineTo(mx - 9, my + 2); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#e36b7b'; ctx.beginPath(); ctx.ellipse(mx + 1, my + 9, 6, 3, 0, 0, U.TAU); ctx.fill();
        break;
      }
      case 'talk': {
        const h = 2 + open * 7;
        ctx.fillStyle = '#6a1c2a';
        ctx.beginPath(); ctx.ellipse(mx + 1, my + 2, 7, h, 0, 0, U.TAU); ctx.fill(); ctx.stroke();
        if (h > 4) { ctx.fillStyle = '#fff'; ctx.fillRect(mx - 4, my + 2 - h + 1.2, 10, 2.2); }
        break;
      }
      case 'o':
        ctx.fillStyle = '#6a1c2a';
        ctx.beginPath(); ctx.ellipse(mx + 1, my + 3, 4.8 + open * 1.5, 6.5 + open * 2, 0, 0, U.TAU); ctx.fill(); ctx.stroke();
        break;
      case 'frown':
        ctx.beginPath(); ctx.moveTo(mx - 8, my + 5); ctx.quadraticCurveTo(mx + 1, my - 2 + (open * 3), mx + 10, my + 4); ctx.stroke();
        break;
      case 'wavy':
        ctx.beginPath(); ctx.moveTo(mx - 8, my + 3); ctx.quadraticCurveTo(mx - 4, my - 1, mx, my + 2); ctx.quadraticCurveTo(mx + 5, my + 5, mx + 9, my + 1); ctx.stroke();
        break;
      case 'set':
        ctx.beginPath(); ctx.moveTo(mx - 8, my + 1); ctx.quadraticCurveTo(mx + 1, my + 4, mx + 10, my); ctx.stroke();
        break;
      case 'side':
        ctx.beginPath(); ctx.moveTo(mx - 4, my + 2); ctx.quadraticCurveTo(mx + 4, my + 3, mx + 10, my - 1); ctx.stroke();
        break;
      case 'smirk':
        ctx.beginPath(); ctx.moveTo(mx - 7, my + 2); ctx.quadraticCurveTo(mx + 4, my + 4, mx + 11, my - 3); ctx.stroke();
        break;
      case 'small':
        ctx.beginPath(); ctx.moveTo(mx - 4, my + 1); ctx.quadraticCurveTo(mx + 1, my + 4, mx + 6, my + 1); ctx.stroke();
        break;
      default:
        ctx.beginPath(); ctx.moveTo(mx - 6, my + 2); ctx.lineTo(mx + 8, my + 2); ctx.stroke();
    }
  }

  function drawBust(ctx, look, P, bw, time) {
    const s = look.top.style;
    ctx.fillStyle = P.top; ctx.strokeStyle = OL; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-60 * bw, 100);
    ctx.bezierCurveTo(-62 * bw, 60, -52 * bw, 44, -18, 38);
    ctx.lineTo(22, 38);
    ctx.bezierCurveTo(56 * bw, 44, 64 * bw, 60, 62 * bw, 100);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.clip();
    ctx.fillStyle = P.topShade; ctx.globalAlpha *= 0.6;
    ctx.beginPath(); ctx.ellipse(-52 * bw, 80, 16, 44, 0.2, 0, U.TAU); ctx.fill();
    ctx.globalAlpha /= 0.6;
    if (s === 'crop') {
      ctx.fillStyle = P.skin;
      ctx.beginPath(); ctx.moveTo(-22, 37); ctx.bezierCurveTo(-18, 70, 22, 70, 26, 37); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = U.shade(P.top, -0.2); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-22, 37); ctx.bezierCurveTo(-18, 70, 22, 70, 26, 37); ctx.stroke();
      ctx.strokeStyle = P.skinShade; ctx.lineWidth = 1.5; ctx.globalAlpha *= 0.6;
      ctx.beginPath(); ctx.moveTo(-14, 47); ctx.quadraticCurveTo(-6, 44, -2, 47); ctx.moveTo(6, 47); ctx.quadraticCurveTo(12, 44, 18, 47); ctx.stroke();
      ctx.globalAlpha /= 0.6;
    } else if (s === 'hoodie') {
      ctx.fillStyle = P.topShade; ctx.beginPath(); ctx.ellipse(-4, 42, 34, 12, 0, Math.PI, U.TAU); ctx.fill();
      ctx.strokeStyle = P.top2; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-8, 44); ctx.lineTo(-10, 78); ctx.moveTo(10, 44); ctx.lineTo(12, 78); ctx.stroke();
      ctx.fillStyle = P.top2; G.heart(ctx, 30, 62, 14); ctx.fill();
    } else if (s === 'jacket' || s === 'raincoat') {
      ctx.fillStyle = s === 'jacket' ? P.top2 : P.topShade;
      ctx.beginPath(); ctx.moveTo(-14, 38); ctx.lineTo(18, 38); ctx.lineTo(10, 100); ctx.lineTo(-6, 100); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = OL; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-14, 38); ctx.lineTo(-6, 100); ctx.moveTo(18, 38); ctx.lineTo(10, 100); ctx.stroke();
      if (s === 'raincoat') { ctx.fillStyle = P.top2; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(14, 56 + i * 16, 2.4, 0, U.TAU); ctx.fill(); } }
    } else if (s === 'vest') {
      ctx.fillStyle = P.top2; ctx.beginPath(); ctx.moveTo(-14, 38); ctx.lineTo(18, 38); ctx.lineTo(4, 90); ctx.closePath(); ctx.fill();
      ctx.fillStyle = P.gold; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(10, 70 + i * 10, 2.2, 0, U.TAU); ctx.fill(); }
      ctx.fillStyle = P.top2; ctx.beginPath(); ctx.moveTo(-60, 100); ctx.bezierCurveTo(-62, 60, -54, 48, -40, 44); ctx.lineTo(-44, 100); ctx.fill();
    } else if (s === 'overalls') {
      ctx.fillStyle = P.top2; ctx.fillRect(-70, 30, 140, 30);
      ctx.fillStyle = P.top; G.rr(ctx, -24, 60, 50, 50, 4); ctx.fill(); ctx.strokeStyle = OL; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = P.top; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-20, 62); ctx.lineTo(-30, 36); ctx.moveTo(22, 62); ctx.lineTo(32, 36); ctx.stroke();
      const cols = ['#ffd14a', '#ff6fae', '#5fe0a0'];
      for (let i = 0; i < 7; i++) { ctx.fillStyle = cols[i % 3]; ctx.beginPath(); ctx.arc(-18 + (i * 13) % 40, 70 + (i * 7) % 30, 2.5, 0, U.TAU); ctx.fill(); }
    } else if (s === 'sweater') {
      ctx.fillStyle = P.top2; for (let i = 0; i < 5; i++) ctx.fillRect(-70, 48 + i * 12, 140, 5);
    } else if (s === 'tshirt') {
      ctx.strokeStyle = U.shade(P.top, -0.25); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-16, 38); ctx.quadraticCurveTo(2, 52, 20, 38); ctx.stroke();
      ctx.fillStyle = P.top2; ctx.beginPath(); ctx.arc(26, 70, 7, 0, U.TAU); ctx.fill();
    } else if (s === 'cloak') {
      ctx.fillStyle = P.top2; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(-40 + i * 16, 60 + (i % 2) * 8, 7, 3.5, 0.5 * i, 0, U.TAU); ctx.fill(); }
    }
    ctx.restore();
    if (look.acc && look.acc.indexOf('apron') >= 0) {
      ctx.fillStyle = P.acc('apron', '#f4efe6'); ctx.strokeStyle = OL; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(-24, 52); ctx.lineTo(28, 52); ctx.lineTo(34, 100); ctx.lineTo(-30, 100); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = P.acc('apron', '#f4efe6'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-22, 52); ctx.lineTo(-14, 38); ctx.moveTo(26, 52); ctx.lineTo(20, 38); ctx.stroke();
    }
    if (look.acc && look.acc.indexOf('scarf') >= 0) {
      ctx.fillStyle = P.acc('scarf', '#4a90c2'); ctx.strokeStyle = OL; ctx.lineWidth = 2.5;
      G.rr(ctx, -30, 28, 62, 18, 9); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-18, 40); ctx.lineTo(-24, 90); ctx.lineTo(-8, 90); ctx.lineTo(-4, 42); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (look.acc && look.acc.indexOf('camera') >= 0) {
      ctx.strokeStyle = '#3a2a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-20, 38); ctx.lineTo(0, 74); ctx.lineTo(24, 38); ctx.stroke();
      ctx.fillStyle = P.acc('camera', '#f4f0e8'); ctx.strokeStyle = OL; ctx.lineWidth = 2.5;
      G.rr(ctx, -16, 70, 34, 26, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2a2a3a'; ctx.beginPath(); ctx.arc(2, 84, 8, 0, U.TAU); ctx.fill();
      ctx.fillStyle = '#6a7ab0'; ctx.beginPath(); ctx.arc(2, 84, 4, 0, U.TAU); ctx.fill();
      ctx.fillStyle = '#ff5e57'; ctx.fillRect(-13, 73, 5, 4);
    }
    if (look.acc && look.acc.indexOf('bowtie') >= 0) {
      ctx.fillStyle = P.acc('bowtie', '#e0a84a'); ctx.strokeStyle = OL; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(2, 44); ctx.lineTo(-12, 36); ctx.lineTo(-12, 52); ctx.closePath(); ctx.moveTo(2, 44); ctx.lineTo(16, 36); ctx.lineTo(16, 52); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (look.acc && look.acc.indexOf('headphones_neck') >= 0) {
      ctx.strokeStyle = OL; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(1, 36, 26, 0.15, Math.PI - 0.15); ctx.stroke();
      ctx.strokeStyle = P.acc('headphones', '#4fb3ff'); ctx.lineWidth = 5; ctx.stroke();
      ctx.fillStyle = '#23232d'; ctx.strokeStyle = OL; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(28, 44, 8, 11, 0.3, 0, U.TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-26, 44, 8, 11, -0.3, 0, U.TAU); ctx.fill(); ctx.stroke();
    }
    if (look.acc && look.acc.indexOf('rope') >= 0) {
      ctx.strokeStyle = P.acc('rope', '#c9a46a'); ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-50, 50); ctx.lineTo(40, 100); ctx.stroke();
    }
    // t-shirt sombre visible sous une veste ouverte (portrait)
    if (look.acc && look.acc.indexOf('tee_under') >= 0) {
      ctx.fillStyle = P.acc('tee', '#1e1e24'); ctx.strokeStyle = OL; ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-16, 30); ctx.quadraticCurveTo(3, 44, 22, 28);
      ctx.lineTo(16, 74); ctx.lineTo(-9, 74); ctx.closePath();
      ctx.fill(); ctx.stroke();
    }
  }

  function drawPHairTop(ctx, look, P, hs, hat, time) {
    ctx.fillStyle = P.hair; ctx.strokeStyle = OL; ctx.lineWidth = 2.8;
    if (hat === 'hood' || hat === 'helmet') {
      if (hat === 'helmet') {
        ctx.beginPath(); ctx.moveTo(-26, -12); ctx.quadraticCurveTo(-22, -26, -6, -26); ctx.lineTo(30, -24); ctx.quadraticCurveTo(32, -18, 31, -12); ctx.quadraticCurveTo(10, -22, -26, -12); ctx.fill(); ctx.stroke();
      }
      return;
    }
    if (hs === 'longwavy' || hs === 'long') {
      // calotte + raie au milieu
      ctx.beginPath();
      ctx.moveTo(33, 8);
      ctx.bezierCurveTo(40, -40, 10, -58, -6, -54);
      ctx.bezierCurveTo(-34, -50, -42, -24, -34, 20);
      ctx.bezierCurveTo(-30, 6, -26, -12, -18, -22);
      ctx.bezierCurveTo(-10, -32, -2, -36, 2, -40);
      ctx.bezierCurveTo(8, -32, 22, -26, 28, -12);
      ctx.bezierCurveTo(30, -6, 31, 0, 33, 8);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, -56, 0, 20);
      g.addColorStop(0, U.shade(P.hair, 0.08)); g.addColorStop(1, P.hair);
      ctx.fillStyle = g; ctx.fill(); ctx.stroke();
      // mèches encadrant le visage
      const sw = Math.sin(time * 1.5) * 1.5;
      ctx.beginPath();
      ctx.moveTo(26, -16); ctx.bezierCurveTo(40, 4, 34 + sw, 30, 40 + sw, 56);
      ctx.bezierCurveTo(46 + sw, 70, 38 + sw, 84, 46 + sw, 96);
      ctx.lineTo(56, 96); ctx.bezierCurveTo(48, 70, 52, 30, 42, 0); ctx.bezierCurveTo(38, -14, 32, -22, 26, -16);
      ctx.closePath(); ctx.fillStyle = P.hair; ctx.fill(); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-20, -18); ctx.bezierCurveTo(-34, 0, -30 - sw, 26, -38 - sw, 52);
      ctx.bezierCurveTo(-44 - sw, 70, -36, 84, -44, 98);
      ctx.lineTo(-58, 98); ctx.bezierCurveTo(-50, 70, -48, 20, -38, -6);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      // reflets
      ctx.strokeStyle = P.hairHl; ctx.lineWidth = 2; ctx.globalAlpha *= 0.55;
      ctx.beginPath(); ctx.moveTo(-8, -48); ctx.quadraticCurveTo(-22, -40, -28, -18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, -48); ctx.quadraticCurveTo(24, -40, 30, -20); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(40, 10); ctx.quadraticCurveTo(38, 40, 46, 70); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-36, 10); ctx.quadraticCurveTo(-36, 40, -44, 70); ctx.stroke();
      ctx.globalAlpha /= 0.55;
      ctx.strokeStyle = U.shade(P.hair, -0.3); ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(2, -54); ctx.lineTo(2, -40); ctx.stroke();
    } else if (hs === 'short' || hs === 'buzz') {
      ctx.beginPath();
      ctx.moveTo(32, -8);
      ctx.bezierCurveTo(36, -46, -10, -58, -26, -30);
      ctx.bezierCurveTo(-30, -20, -28, -8, -26, -4);
      ctx.lineTo(-20, -10); ctx.quadraticCurveTo(-14, -26, 0, -28);
      if (hs === 'short') { ctx.lineTo(6, -24); ctx.lineTo(12, -30); ctx.lineTo(18, -24); ctx.lineTo(24, -26); }
      ctx.quadraticCurveTo(30, -20, 32, -8);
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (hs === 'spiky') {
      ctx.beginPath(); ctx.moveTo(32, -8);
      const sp = [[38, -30], [24, -38], [28, -62], [10, -46], [2, -70], [-8, -48], [-26, -64], [-24, -40], [-42, -38], [-30, -20], [-34, 0]];
      for (const p of sp) ctx.lineTo(p[0], p[1] + (p[1] < -55 ? Math.sin(time * 3 + p[0]) * 1.5 : 0));
      ctx.lineTo(-24, -6); ctx.quadraticCurveTo(-12, -26, 4, -28); ctx.quadraticCurveTo(24, -26, 32, -8);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, -70, 0, 0); g.addColorStop(0, P.hair2); g.addColorStop(1, P.hair);
      ctx.fillStyle = g; ctx.fill(); ctx.stroke();
    } else if (hs === 'curly') {
      const pts = [[28, -20], [22, -38], [8, -48], [-8, -48], [-22, -40], [-30, -24], [-32, -6], [34, -6]];
      ctx.beginPath();
      for (const p of pts) { ctx.moveTo(p[0] + 13, p[1]); ctx.arc(p[0], p[1], 13, 0, U.TAU); }
      ctx.fill();
      ctx.strokeStyle = P.hair2; ctx.lineWidth = 2;
      for (const p of pts) { ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0.4, 3.4); ctx.stroke(); }
    } else if (hs === 'bob') {
      ctx.beginPath();
      ctx.moveTo(36, 26);
      ctx.bezierCurveTo(46, -40, -10, -64, -36, -30);
      ctx.bezierCurveTo(-44, -14, -42, 12, -38, 28);
      ctx.lineTo(-26, 24); ctx.quadraticCurveTo(-24, -10, -8, -24);
      ctx.quadraticCurveTo(18, -30, 26, -6); ctx.quadraticCurveTo(30, 10, 28, 26);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = P.hair2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-20, -40); ctx.quadraticCurveTo(4, -48, 24, -30); ctx.stroke();
    } else if (hs === 'ponytail' || hs === 'braids') {
      ctx.beginPath();
      ctx.moveTo(33, -2);
      ctx.bezierCurveTo(38, -46, -12, -60, -30, -30);
      ctx.bezierCurveTo(-34, -20, -32, -2, -28, 8);
      ctx.lineTo(-22, -4); ctx.quadraticCurveTo(-16, -24, -2, -30);
      ctx.bezierCurveTo(8, -22, 22, -26, 28, -12);
      ctx.quadraticCurveTo(31, -8, 33, -2);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = P.hairHl; ctx.lineWidth = 2; ctx.globalAlpha *= 0.6; ctx.beginPath(); ctx.moveTo(-18, -42); ctx.quadraticCurveTo(4, -52, 24, -36); ctx.stroke(); ctx.globalAlpha /= 0.6;
    }
  }

  function drawPHat(ctx, look, P, hat, time) {
    if (!hat) return;
    ctx.strokeStyle = OL; ctx.lineWidth = 2.8;
    switch (hat) {
      case 'cap':
      case 'capback':
        ctx.fillStyle = P.hat;
        ctx.beginPath(); ctx.moveTo(-32, -18); ctx.bezierCurveTo(-32, -66, 36, -66, 36, -18); ctx.quadraticCurveTo(2, -27, -32, -18); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = P.hat2;
        ctx.beginPath();
        if (hat === 'capback') {
          ctx.moveTo(-16, -25); ctx.bezierCurveTo(-40, -30, -62, -20, -60, -10);
          ctx.bezierCurveTo(-46, -13, -30, -17, -16, -20);
        } else {
          ctx.moveTo(16, -25); ctx.bezierCurveTo(40, -30, 62, -20, 60, -10);
          ctx.bezierCurveTo(46, -13, 30, -17, 16, -20);
        }
        ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = P.hat2; ctx.beginPath(); ctx.arc(2, -53, 4.4, 0, U.TAU); ctx.fill();
        ctx.strokeStyle = P.hat2; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-9, -35); ctx.lineTo(0, -46); ctx.lineTo(9, -35); ctx.stroke();
        if (look.hat.logo) {
          ctx.fillStyle = look.hat.logo;
          ctx.beginPath(); ctx.ellipse(9, -36, 7, 4.6, -0.22, 0, U.TAU); ctx.fill();
          ctx.strokeStyle = look.hat.logo; ctx.lineWidth = 2.4;
          ctx.beginPath(); ctx.moveTo(3.5, -32.5); ctx.lineTo(14.5, -39.5); ctx.stroke();
        }
        break;
      case 'beanie':
        ctx.fillStyle = P.hat;
        ctx.beginPath(); ctx.moveTo(-32, -10); ctx.bezierCurveTo(-34, -70, 36, -70, 34, -10); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = P.hat2; G.rr(ctx, -35, -20, 72, 14, 6); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, -64, 9, 0, U.TAU); ctx.fill(); ctx.stroke();
        break;
      case 'beret':
        ctx.fillStyle = P.hat;
        ctx.beginPath(); ctx.ellipse(-2, -40, 44, 16, -0.15, 0, U.TAU); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -56); ctx.lineTo(3, -64); ctx.stroke();
        break;
      case 'bucket':
        ctx.fillStyle = P.hat;
        ctx.beginPath(); ctx.moveTo(-28, -24); ctx.bezierCurveTo(-28, -64, 32, -64, 32, -24); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = P.hat2; ctx.beginPath(); ctx.ellipse(2, -22, 48, 10, 0, 0, U.TAU); ctx.fill(); ctx.stroke();
        break;
      case 'flatcap':
        ctx.fillStyle = P.hat;
        ctx.beginPath(); ctx.moveTo(-32, -16); ctx.bezierCurveTo(-34, -56, 30, -60, 50, -26); ctx.lineTo(34, -16); ctx.quadraticCurveTo(0, -24, -32, -16); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = P.hat2; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-18, -44); ctx.quadraticCurveTo(10, -48, 34, -30); ctx.stroke();
        break;
      case 'helmet':
        ctx.fillStyle = P.hat;
        ctx.beginPath(); ctx.moveTo(-36, -10); ctx.bezierCurveTo(-38, -72, 40, -72, 38, -10); ctx.lineTo(44, -8); ctx.lineTo(-42, -6); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#3a3a3a'; G.rr(ctx, 16, -44, 18, 16, 4); ctx.fill();
        ctx.fillStyle = P.hat2; ctx.beginPath(); ctx.arc(28, -36, 6, 0, U.TAU); ctx.fill();
        G.glow(ctx, 30, -36, 40, '#fff6c0', 0.5);
        break;
      case 'bandana':
        ctx.fillStyle = P.hat;
        ctx.beginPath(); ctx.moveTo(-30, -14); ctx.bezierCurveTo(-32, -64, 34, -64, 33, -14); ctx.quadraticCurveTo(0, -26, -30, -14); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-28, -20); ctx.lineTo(-50, -8 + Math.sin(time * 4) * 3); ctx.lineTo(-40, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = P.hat2; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(-20 + i * 7, -40 + (i % 2) * 8, 2, 0, U.TAU); ctx.fill(); }
        break;
      case 'catears':
        ctx.strokeStyle = P.hat; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(2, -8, 38, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
        for (const ex of [-18, 20]) {
          ctx.fillStyle = P.hat; ctx.strokeStyle = OL; ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.moveTo(ex - 12, -40); ctx.lineTo(ex, -68 + Math.sin(time * 2 + ex) * 1.5); ctx.lineTo(ex + 12, -40); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle = P.hat2; ctx.beginPath(); ctx.moveTo(ex - 6, -42); ctx.lineTo(ex, -58); ctx.lineTo(ex + 6, -42); ctx.closePath(); ctx.fill();
        }
        break;
      case 'hood':
        ctx.fillStyle = P.hat;
        ctx.beginPath(); ctx.moveTo(-44, 60); ctx.bezierCurveTo(-52, -30, -30, -66, 2, -66); ctx.bezierCurveTo(34, -66, 50, -40, 44, 10);
        ctx.bezierCurveTo(36, -26, 20, -36, 2, -36); ctx.bezierCurveTo(-20, -36, -30, -20, -30, 30); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(2, -26, 30, 10, 0, 0, U.TAU); ctx.fill();
        break;
      default: break;
    }
  }

  function drawEchoPortrait(ctx, x, y, size, expr, time, talking) {
    ctx.save();
    ctx.translate(x, y);
    const s = size / 150;
    ctx.scale(s, s);
    const bob = Math.sin(time * 2) * 3;
    ctx.translate(0, bob);
    G.glow(ctx, 0, 0, 100, '#ff7ad9', 0.35);
    const g = ctx.createRadialGradient(-18, -18, 4, 0, 0, 52);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#ece8f3'); g.addColorStop(1, '#bdb5ce');
    ctx.fillStyle = g; ctx.strokeStyle = OL; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.arc(0, 0, 48, 0, U.TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#b1a9c2'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 48, 15, 0, 0.1, Math.PI - 0.1); ctx.stroke();
    ctx.fillStyle = '#2a2436'; ctx.beginPath(); ctx.arc(8, -3, 25, 0, U.TAU); ctx.fill();
    ctx.strokeStyle = '#8c86a0'; ctx.lineWidth = 2.5; ctx.stroke();
    const pulse = talking ? 0.7 + 0.3 * Math.sin(time * 20) : 0.85 + 0.15 * Math.sin(time * 3);
    const col = expr === 'alert' ? '#ff5a6a' : expr === 'sad' ? '#8a9aff' : '#ff7ad9';
    const r = 14 * pulse * (expr === 'surprised' ? 1.2 : 1);
    const ig = ctx.createRadialGradient(8, -3, 1, 8, -3, r);
    ig.addColorStop(0, '#ffffff'); ig.addColorStop(0.3, col); ig.addColorStop(1, U.shade(col, -0.4));
    ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(8, -3, r, 0, U.TAU); ctx.fill();
    G.glow(ctx, 8, -3, 50, col, 0.5 * pulse);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(1, -11, 4, 0, U.TAU); ctx.fill();
    // ondes quand il parle
    if (talking) {
      ctx.strokeStyle = U.rgba(col, 0.6); ctx.lineWidth = 2.5;
      for (let i = 0; i < 3; i++) { const k = ((time * 1.5 + i / 3) % 1); ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(0, 0, 52 + k * 30, -0.5, 0.5); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawVeilleurPortrait(ctx, x, y, size, time, talking, radio) {
    ctx.save();
    ctx.translate(x, y);
    const s = size / 150;
    ctx.scale(s, s);
    if (radio) {
      // vieille radio
      ctx.fillStyle = '#5a3a2a'; ctx.strokeStyle = OL; ctx.lineWidth = 3;
      G.rr(ctx, -52, -34, 104, 76, 12); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#d8c8a0'; G.rr(ctx, -40, -22, 50, 40, 6); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#8a6a4a'; ctx.lineWidth = 2; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-36, -14 + i * 6); ctx.lineTo(6, -14 + i * 6); ctx.stroke(); }
      ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.arc(32, -8, 10, 0, U.TAU); ctx.fill(); ctx.beginPath(); ctx.arc(32, 20, 7, 0, U.TAU); ctx.fill();
      ctx.strokeStyle = '#c9b8ff'; ctx.lineWidth = 2;
      if (talking) for (let i = 0; i < 3; i++) { const k = ((time * 2 + i / 3) % 1); ctx.globalAlpha = 1 - k; ctx.beginPath(); ctx.arc(0, -40, 10 + k * 40, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
      ctx.globalAlpha = 1;
      ctx.restore();
      return;
    }
    const fl = 0.75 + 0.25 * Math.sin(time * 7) * Math.sin(time * 3.1);
    G.glow(ctx, 0, 0, 110, '#9d88ff', 0.4 * fl);
    ctx.globalAlpha = 0.85 * fl;
    ctx.fillStyle = '#c9b8ff'; ctx.strokeStyle = '#efe8ff'; ctx.lineWidth = 2;
    // silhouette de vieil homme lumineuse
    ctx.beginPath(); ctx.moveTo(-60, 100); ctx.bezierCurveTo(-60, 50, -40, 40, -14, 36); ctx.lineTo(18, 36); ctx.bezierCurveTo(44, 40, 62, 50, 62, 100); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(2, -6, 28, 34, 0, 0, U.TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#efe8ff';
    ctx.beginPath(); ctx.moveTo(-24, 6); ctx.bezierCurveTo(-20, 42, 26, 42, 30, 6); ctx.bezierCurveTo(20, 18, -14, 18, -24, 6); ctx.fill();
    ctx.fillStyle = '#5a4a8a'; ctx.beginPath(); ctx.ellipse(-8, -8, 3, 2, 0, 0, U.TAU); ctx.ellipse(14, -8, 3, 2, 0, 0, U.TAU); ctx.fill();
    ctx.strokeStyle = '#5a4a8a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-14, -18); ctx.lineTo(-2, -16); ctx.moveTo(8, -16); ctx.lineTo(20, -18); ctx.stroke();
    // casque radio ancien
    ctx.strokeStyle = '#efe8ff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(2, -8, 34, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
    ctx.globalAlpha = 1;
    // lignes de balayage
    ctx.fillStyle = 'rgba(20,10,40,0.25)';
    for (let i = -70; i < 100; i += 5) ctx.fillRect(-70, i + ((time * 30) % 5), 140, 1.5);
    ctx.restore();
  }

  function drawSilencePortrait(ctx, x, y, size, time, talking) {
    ctx.save();
    ctx.translate(x, y);
    const s = size / 150;
    ctx.scale(s, s);
    G.staticNoise(ctx, -70, -70, 140, 140, 0.25, time);
    ctx.fillStyle = '#120c1c';
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const a = (i / 24) * U.TAU, r = 58 + Math.sin(a * 5 + time * 3) * 6 + Math.sin(a * 3 - time * 2) * 4;
      const px = Math.cos(a) * r, py = Math.sin(a) * r * 1.1;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.fill();
    const e = talking ? 0.8 + Math.random() * 0.4 : 1;
    ctx.fillStyle = '#f2ecff';
    ctx.beginPath(); ctx.ellipse(-18, -8, 9 * e, 4, -0.2, 0, U.TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(20, -8, 9 * e, 4, 0.2, 0, U.TAU); ctx.fill();
    G.glow(ctx, -18, -8, 30, '#b9a3ff', 0.6); G.glow(ctx, 20, -8, 30, '#b9a3ff', 0.6);
    if (talking) { ctx.strokeStyle = '#b9a3ff'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = -20; i <= 20; i += 4) ctx.lineTo(i, 22 + (Math.random() - 0.5) * 10); ctx.stroke(); }
    ctx.restore();
  }
})();
