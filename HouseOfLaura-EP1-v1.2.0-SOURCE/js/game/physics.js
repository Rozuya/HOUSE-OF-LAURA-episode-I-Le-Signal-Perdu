/* House of Laura · physique du joueur (pure : aucune dépendance au DOM)
 * Utilisée par le jeu ET par l'outil de vérification des niveaux (tools/validate.js).
 */
(function () {
  'use strict';
  const G0 = (typeof window !== 'undefined') ? window : globalThis;
  const HOL = G0.HOL, U = HOL.U, T = HOL.T;

  const P = HOL.Phys = {
    W: 20, H: 50,
    // JUMP_V 650 -> 700 : la hauteur de saut passe de 100.8 px (3.15 tuiles) a ~123 px
    // (3.8 tuiles). Objectif : un saut de 3 tuiles (96 px) laisse 27 px de marge au lieu
    // de 4.8 px (95 % du maximum, tres juste). Un saut de 4 tuiles (128 px) reste
    // IMPOSSIBLE sans double saut : la conception des niveaux n'est pas invalidatee.
    GRAV: 2000, JUMP_V: 700, DJUMP_V: 620, MAX_FALL: 760,
    WALK: 140, RUN: 250, ACC_G: 1900, DEC_G: 2600, ACC_A: 1500, DEC_A: 800,
    RUN_DELAY: 0.28,
    COYOTE: 0.1, BUFFER: 0.13, CUT: 0.5,
    DASH_V: 560, DASH_T: 0.18, DASH_CD: 0.35,
    CLIMB: 125, SWIM_G: 420, SWIM_MAXF: 110, SWIM_STROKE: 290, SWIM_X: 150,
    SPRING_V: 960
  };

  // Etat de mouvement neuf
  P.newBody = function (x, y) {
    return {
      x, y, w: P.W, h: P.H, vx: 0, vy: 0,
      onGround: false, wasGround: false, groundType: null, groundEnt: null,
      coyote: 0, buffer: 0, jumpHeld: false, cut: false, jumps: 1,
      dashT: 0, dashCd: 0, airDash: true, facing: 1,
      moveT: 0, climbing: false, inWater: false, waterSurface: null,
      landed: 0, lastFall: 0, events: [], dropT: 0,
      grip: null, gripT: 0, pushing: 0, grabP: false, grabT: 0, gripSide: 0
    };
  };

  // --- requêtes sur la salle (interface "room") ---
  // room.tileAt(tx,ty) -> char ; room.isSolidTile(ch) ; room.dynSolids -> [{x,y,w,h,oneWay,vx,vy,ent}]
  function solidAt(room, tx, ty) {
    return room.solidAt(tx, ty);
  }
  function oneWayAt(room, tx, ty) {
    return room.oneWayAt(tx, ty);
  }

  // Collision horizontale contre tuiles + solides dynamiques
  function moveX(b, room, dx, abil) {
    if (dx === 0) return;
    b.x += dx;
    const top = Math.floor(b.y / T), bot = Math.floor((b.y + b.h - 0.01) / T);
    if (dx > 0) {
      const tx = Math.floor((b.x + b.w - 0.01) / T);
      for (let ty = top; ty <= bot; ty++) {
        if (solidAt(room, tx, ty)) {
          if (b.dashT > 0 && room.breakAt && room.breakAt(tx, ty)) continue;
          b.x = tx * T - b.w; b.vx = 0; b.hitWall = 1; break;
        }
      }
    } else {
      const tx = Math.floor(b.x / T);
      for (let ty = top; ty <= bot; ty++) {
        if (solidAt(room, tx, ty)) {
          if (b.dashT > 0 && room.breakAt && room.breakAt(tx, ty)) continue;
          b.x = (tx + 1) * T; b.vx = 0; b.hitWall = -1; break;
        }
      }
    }
    const ds = room.dynSolids;
    if (ds) for (const s of ds) {
      if (s.oneWay || s.disabled) continue;
      if (b.x < s.x + s.w && b.x + b.w > s.x && b.y < s.y + s.h && b.y + b.h > s.y) {
        if (s.pushable && b.onGround && Math.abs(dx) > 0) {
          // Le deplacement du bloc (poussee ET traction) est gere par gripBlock(),
          // appele apres l'integration. Ici on resout seulement la collision.
          if (dx > 0) b.x = s.x - b.w; else b.x = s.x + s.w;
          b.vx = U.clamp(b.vx, -110, 110);
        } else {
          if (dx > 0) b.x = s.x - b.w; else b.x = s.x + s.w;
          b.vx = 0;
        }
      }
    }
  }

  // Collision verticale ; renvoie true si atterrissage
  function moveY(b, room, dy, dropping) {
    if (dy === 0) return false;
    const oldBot = b.y + b.h;
    b.y += dy;
    const l = Math.floor(b.x / T), r = Math.floor((b.x + b.w - 0.01) / T);
    let landed = false;
    if (dy > 0) {
      const newBot = b.y + b.h;
      const ty = Math.floor((newBot - 0.01) / T);
      for (let tx = l; tx <= r; tx++) {
        const solid = solidAt(room, tx, ty);
        const ow = !solid && !dropping && oneWayAt(room, tx, ty) && oldBot <= ty * T + 0.5;
        if (solid || ow) {
          b.y = ty * T - b.h; b.vy = 0; landed = true;
          b.groundType = room.surfaceAt ? room.surfaceAt(tx, ty) : null;
          break;
        }
      }
    } else {
      const ty = Math.floor(b.y / T);
      for (let tx = l; tx <= r; tx++) {
        if (solidAt(room, tx, ty)) { b.y = (ty + 1) * T; b.vy = 0; b.bonk = true; break; }
      }
    }
    const ds = room.dynSolids;
    if (ds) for (const s of ds) {
      if (s.disabled) continue;
      if (b.x < s.x + s.w && b.x + b.w > s.x && b.y < s.y + s.h && b.y + b.h > s.y) {
        if (dy > 0 && oldBot <= s.y + 2 + Math.max(0, s.vy || 0) / 60 && !(s.oneWay && dropping)) {
          b.y = s.y - b.h; b.vy = 0; landed = true; b.groundEnt = s; b.groundType = s.surface || null;
        } else if (!s.oneWay && dy < 0) {
          b.y = s.y + s.h; b.vy = 0;
        } else if (!s.oneWay && dy > 0) {
          b.y = s.y - b.h; b.vy = 0; landed = true; b.groundEnt = s;
        }
      }
    }
    return landed;
  }

  // Test "debout sur quelque chose" (1px sous les pieds)
  function probeGround(b, room) {
    const y = b.y + b.h + 1;
    const ty = Math.floor(y / T);
    const l = Math.floor(b.x / T), r = Math.floor((b.x + b.w - 0.01) / T);
    for (let tx = l; tx <= r; tx++) {
      if (solidAt(room, tx, ty)) return { type: room.surfaceAt ? room.surfaceAt(tx, ty) : null };
      if (oneWayAt(room, tx, ty) && Math.abs(b.y + b.h - ty * T) < 1.5) return { type: room.surfaceAt ? room.surfaceAt(tx, ty) : 'wood' };
    }
    const ds = room.dynSolids;
    if (ds) for (const s of ds) {
      if (s.disabled) continue;
      if (b.x < s.x + s.w && b.x + b.w > s.x && Math.abs(b.y + b.h - s.y) < 2.5) return { ent: s, type: s.surface || null };
    }
    return null;
  }
  P.probeGround = probeGround;

  /* Porter une pierre.
   * Tout est binaire et sans surprise : un appui sur RB (ou G) attrape la
   * pierre juste devant le joueur, un second appui la lache. La pierre reste
   * du cote ou on l'a attrapee et se deplace avec le joueur : si elle est
   * devant elle est poussee, si elle est derriere elle est tiree. Si un mur la
   * bloque, elle s'arrete et le joueur continue tout seul.
   *
   * Le cote est fige au moment de l'attrapage. Sinon la pierre passe de
   * devant a derriere le joueur pendant qu'il la ramene, et comme elle est
   * solide elle entrainait le joueur avec elle vers l'arriere.
   */
  P.gripBlock = function (b, room, dt) {
    const ds = room.dynSolids;
    // ATTENTION : sur un wrapper de room.dynSolids, `s.x` est FIGE (il n'est
    // rafraichi qu'une fois par frame, donc en retard d'une frame). La position
    // reelle de la pierre, c'est `s.ent.x`. Lire `s.x` faisait thinks la pierre
    // 7px trop loin et la poussait dans le sens oppose.
    const ex = (s) => s.ent.x;
    const ew = (s) => (s.ent.w != null ? s.ent.w : s.w);
    const coteReel = (s) => (ex(s) + ew(s) / 2) >= (b.x + b.w / 2) ? 1 : -1;

    // --- appui : on bascule entre "je porte" et "je ne porte pas" ---
    if (b.grabP) {
      if (b.grip) { b.grip = null; b.pushing = 0; b.grabT = 0; b.gripSide = 0; return; }
      const fx = b.facing >= 0 ? b.x + b.w + 2 : b.x - 34;
      for (const s of ds) {
        if (s.oneWay || s.disabled || !s.pushable || !s.ent || !s.ent.push) continue;
        if (fx < ex(s) + ew(s) && fx + 32 > ex(s) && Math.abs((b.y + b.h) - (s.ent.y + s.ent.h)) < 44) {
          b.grip = s; b.gripSide = coteReel(s); b.pushing = b.gripSide; break;
        }
      }
      return;
    }

    // --- on porte : la pierre reste du meme cote, a hauteur constante ---
    if (b.grip) {
      const s = b.grip;
      if (s.disabled || !s.pushable || !s.ent || !s.ent.push) { b.grip = null; b.pushing = 0; b.gripSide = 0; return; }
      const cote = coteReel(s);
      if (cote !== b.gripSide) b.gripSide = cote;
      const want = b.gripSide > 0 ? (b.x + b.w + 3) : (b.x - ew(s) - 3);
      const d = want - ex(s);
      const amt = Math.min(Math.abs(d), 460 * dt);
      if (amt > 0.05) s.ent.push(Math.sign(d) || b.gripSide, amt, room);
      b.pushing = b.gripSide;
      b.grabT = 0.25;
      return;
    }
    if (b.grabT > 0) b.grabT -= dt;
    b.pushing = 0;
  };

  function ladderAt(room, b) {
    const cx = b.x + b.w / 2;
    const tx = Math.floor(cx / T);
    const t1 = Math.floor((b.y + 6) / T), t2 = Math.floor((b.y + b.h - 2) / T);
    for (let ty = t1; ty <= t2; ty++) if (room.ladderAt(tx, ty)) return tx;
    return -1;
  }
  function ladderBelow(room, b) {
    const cx = b.x + b.w / 2;
    const tx = Math.floor(cx / T), ty = Math.floor((b.y + b.h + 2) / T);
    return room.ladderAt(tx, ty) ? tx : -1;
  }

  function waterInfo(room, b) {
    if (!room.waterAt) return null;
    return room.waterAt(b.x + b.w / 2, b.y + b.h * 0.45);
  }

  /* Pas de simulation.
   * inp = { x:-1..1, run:bool(analogique fort), jump:bool (maintenu), jumpP:bool (appui), down, up, dashP, walk }
   * abil = { djump, dash }
   */
  P.step = function (b, inp, dt, room, abil) {
    b.events.length = 0;
    b.hitWall = 0; b.bonk = false; b.pushing = 0;
    abil = abil || {};

    // plateforme mobile : on suit son déplacement
    if (b.onGround && b.groundEnt && b.groundEnt.dx !== undefined) {
      moveX(b, room, b.groundEnt.dx, abil);
      if (b.groundEnt.dy) moveY(b, room, b.groundEnt.dy, false);
    }

    if (b.dashCd > 0) b.dashCd -= dt;
    if (inp.jumpP) b.buffer = P.BUFFER; else if (b.buffer > 0) b.buffer -= dt;

    // --- eau ---
    const w = waterInfo(room, b);
    const wasWater = b.inWater;
    b.inWater = !!w;
    b.waterSurface = w ? w.surface : null;
    if (b.inWater && !wasWater) { b.events.push('splash'); b.vy *= 0.35; b.dashT = 0; }
    if (!b.inWater && wasWater && b.vy < 0) b.events.push('splashout');

    // --- échelles ---
    const lad = ladderAt(room, b);
    if (!b.climbing && lad >= 0 && (inp.up || (inp.down && !b.onGround)) && b.dashT <= 0) {
      b.climbing = true; b.vx = 0; b.vy = 0; b.jumps = 1; b.airDash = true;
    }
    if (!b.climbing && b.onGround && inp.down) {
      const lb = ladderBelow(room, b);
      if (lb >= 0) { b.climbing = true; b.y += 4; b.vx = 0; b.vy = 0; }
    }
    if (b.climbing) {
      const l2 = ladderAt(room, b);
      if (l2 < 0) { b.climbing = false; }
      else {
        const cx = l2 * T + T / 2 - b.w / 2;
        b.x = U.approach(b.x, cx, 300 * dt);
        b.vy = (inp.up ? -P.CLIMB : 0) + (inp.down ? P.CLIMB * 1.2 : 0);
        b.vx = 0;
        if (b.buffer > 0) {
          b.buffer = 0; b.climbing = false; b.vy = -P.JUMP_V * 0.8; b.vx = inp.x * P.WALK; b.events.push('jump');
        } else if (Math.abs(inp.x) > 0.6 && !inp.up && !inp.down) {
          b.climbing = false; b.vx = inp.x * P.WALK;
        }
        if (b.climbing) {
          moveY(b, room, b.vy * dt, true);
          // haut de l'échelle : on sort sur le palier
          if (ladderAt(room, b) < 0 && b.vy < 0) { b.climbing = false; b.vy = -180; }
          const g = probeGround(b, room);
          if (g && inp.down && ladderBelow(room, b) < 0) { b.climbing = false; }
          b.onGround = false;
          if (b.vy !== 0) b.events.push('climbstep');
          return b;
        }
      }
    }

    // --- déplacement horizontal ---
    const ix = inp.x || 0;
    if (Math.abs(ix) > 0.1) {
      b.moveT += dt;
      b.facing = ix > 0 ? 1 : -1;
    } else b.moveT = 0;
    let maxSpd;
    if (inp.walk || (inp.analog && Math.abs(ix) < 0.6)) maxSpd = P.WALK;
    else maxSpd = b.moveT > P.RUN_DELAY || !b.onGround ? P.RUN : P.WALK + (P.RUN - P.WALK) * U.clamp(b.moveT / P.RUN_DELAY, 0, 1) * 0.5;
    if (room.indoorWalk) maxSpd = Math.min(maxSpd, P.RUN * 0.82);
    if (b.inWater) maxSpd = P.SWIM_X;
    const target = Math.abs(ix) > 0.1 ? Math.sign(ix) * maxSpd * (inp.analog ? Math.max(0.45, Math.abs(ix)) : 1) : 0;

    if (b.dashT > 0) {
      b.dashT -= dt;
      b.vx = b.dashDir * P.DASH_V;
      b.vy = 0;
      if (b.dashT <= 0) { b.vx = b.dashDir * P.RUN; b.events.push('dashend'); }
    } else {
      const acc = b.onGround ? (Math.abs(target) > Math.abs(b.vx) || Math.sign(target) !== Math.sign(b.vx) ? P.ACC_G : P.DEC_G) : (target !== 0 ? P.ACC_A : P.DEC_A);
      b.vx = U.approach(b.vx, target, acc * dt);
    }

    // --- dash ---
    if (inp.dashP && abil.dash && b.dashCd <= 0 && b.dashT <= 0 && (b.onGround || b.airDash || b.inWater)) {
      b.dashT = P.DASH_T; b.dashCd = P.DASH_CD; b.dashDir = Math.abs(ix) > 0.2 ? Math.sign(ix) : b.facing;
      b.facing = b.dashDir;
      if (!b.onGround) b.airDash = false;
      b.vy = 0; b.events.push('dash');
    }

    // --- saut ---
    if (b.onGround) { b.coyote = P.COYOTE; b.jumps = 1; b.airDash = true; }
    else if (b.coyote > 0) b.coyote -= dt;

    if (b.inWater) {
      // nage : chaque appui = une brasse ; près de la surface, on bondit hors de l'eau
      if (b.buffer > 0) {
        b.buffer = 0;
        const nearSurf = b.waterSurface !== null && (b.y + b.h * 0.3) - b.waterSurface < 20;
        if (nearSurf) { b.vy = -P.JUMP_V; b.events.push('jump'); }
        else { b.vy = -P.SWIM_STROKE; b.events.push('swim'); }
        b.jumps = 1; b.airDash = true;
      }
    } else if (b.buffer > 0 && b.dashT <= 0) {
      if (b.onGround || b.coyote > 0) {
        if (inp.down && b.onGround && room.canDrop && room.canDrop(b)) {
          b.dropT = 0.2; b.buffer = 0; b.y += 2;
        } else {
          b.vy = -P.JUMP_V; b.onGround = false; b.coyote = 0; b.buffer = 0; b.cut = false; b.jumpHeld = true;
          b.events.push('jump');
        }
      } else if (abil.djump && b.jumps > 0) {
        b.vy = -P.DJUMP_V; b.jumps = 0; b.buffer = 0; b.cut = false; b.jumpHeld = true;
        b.events.push('djump');
      }
    }
    // saut à hauteur variable
    if (!inp.jump && b.vy < -200 && !b.cut && b.jumpHeld) { b.vy *= P.CUT; b.cut = true; }
    if (!inp.jump) b.jumpHeld = false;

    // --- gravité ---
    if (b.dashT <= 0) {
      if (b.inWater) {
        b.vy += P.SWIM_G * dt;
        if (b.vy > P.SWIM_MAXF) b.vy = U.approach(b.vy, P.SWIM_MAXF, 1200 * dt);
        if (inp.down) b.vy = Math.min(b.vy + 400 * dt, 220);
      } else {
        let g = P.GRAV;
        if (Math.abs(b.vy) < 70 && inp.jump) g *= 0.55; // petit flottement au sommet
        b.vy = Math.min(b.vy + g * dt, P.MAX_FALL);
      }
    }

    if (b.dropT > 0) b.dropT -= dt;
    const prevVy = b.vy;
    b.wasGround = b.onGround;

    // --- intégration (sous-pas si besoin) ---
    const dx = b.vx * dt, dy = b.vy * dt;
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / 12));
    let landed = false;
    b.groundEnt = null;
    for (let i = 0; i < steps; i++) {
      moveX(b, room, dx / steps, abil);
      if (moveY(b, room, dy / steps, b.dropT > 0)) landed = true;
    }
    if (b.hitWall && b.dashT > 0) { b.dashT = 0; b.events.push('dashwall'); }

    if (landed) {
      b.onGround = true;
      if (!b.wasGround) { b.events.push('land'); b.lastFall = prevVy; }
    } else {
      const g = b.vy >= 0 ? probeGround(b, room) : null;
      if (g && b.dropT <= 0) { b.onGround = true; if (g.ent) b.groundEnt = g.ent; if (g.type) b.groundType = g.type; }
      else b.onGround = false;
    }
    if (b.onGround && b.vx !== 0 && Math.abs(b.vx) > 20) b.events.push('moving');
    // pousser / tirer les blocs (apres integration : on utilise le deplacement reel)
    if (!b.climbing) { b.grabP = !!(inp && inp.grabP); P.gripBlock(b, room, dt); }
    return b;
  };

  // saut forcé (ressort, rebond sur ennemi)
  P.bounce = function (b, v) {
    b.vy = -v; b.onGround = false; b.coyote = 0; b.jumps = 1; b.airDash = true; b.cut = true; b.jumpHeld = false; b.dashT = 0;
  };
})();
