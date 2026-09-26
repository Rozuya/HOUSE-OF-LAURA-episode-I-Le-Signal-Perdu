/* House of Laura · entrées : clavier + souris + manette (Gamepad API), bascule automatique */
(function () {
  'use strict';
  const HOL = window.HOL, U = HOL.U;

  // Clavier : on utilise event.code (position physique) -> ZQSD sur AZERTY = WASD sur QWERTY
  const KEYS = {
    left: ['ArrowLeft', 'KeyA'],
    right: ['ArrowRight', 'KeyD'],
    up: ['ArrowUp', 'KeyW'],
    down: ['ArrowDown', 'KeyS'],
    jump: ['Space', 'KeyK'],
    interact: ['KeyE', 'Enter', 'NumpadEnter'],
    dash: ['ShiftLeft', 'ShiftRight', 'KeyL'],
    grab: ['KeyG'],
    pulse: ['KeyF', 'KeyJ'],
    walk: ['ControlLeft', 'ControlRight', 'AltLeft'],
    pause: ['Escape', 'KeyP'],
    journal: ['Tab', 'KeyI'],
    confirm: ['Enter', 'NumpadEnter', 'Space', 'KeyE'],
    cancel: ['Escape', 'Backspace'],
    skip: ['Escape']
  };
  // Manette (mapping "standard") : 0 A · 1 B · 2 X · 3 Y · 4 LB · 5 RB · 6 LT · 7 RT · 8 Back · 9 Start · 12-15 croix
  const PAD = {
    left: [14], right: [15], up: [12], down: [13],
    jump: [0],
    interact: [2],
    dash: [1, 7],
    // RB : attraper / porter une pierre. On a retire RB du dash parce que le
    // pousser/tirer par friction etait trop subtil : la pierre se colle au
    // joueur quand on appuie, et se detache quand on appuie encore.
    grab: [5],
    pulse: [3, 4, 6],
    walk: [10, 11],
    pause: [9],
    journal: [8],
    confirm: [0, 2],
    cancel: [1],
    skip: [9]
  };
  const ACTIONS = Object.keys(KEYS);
  const PREVENT = new Set(['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'AltLeft']);

  const Input = HOL.Input = {
    keys: Object.create(null),
    keyQ: [],
    mouse: { x: 0, y: 0, down: [false, false, false], clickQ: [false, false, false], clicked: [false, false, false], moved: false },
    padIdx: -1, padBtn: [], padAxes: [0, 0, 0, 0], padType: 'xbox', padName: '',
    device: 'kbm', forced: 'auto',
    cur: {}, prev: {}, pressedF: {}, releasedF: {}, consumed: {},
    navRepeat: { up: 0, down: 0, left: 0, right: 0 }, nav: { up: false, down: false, left: false, right: false },
    layoutMap: null, azerty: /^fr/i.test((navigator.language || '')),
    anyPressed: false, rumbleOn: true,
    layout: 'auto', padTypeUser: false,

    init(canvas) {
      this.canvas = canvas;
      window.addEventListener('keydown', (e) => {
        if (PREVENT.has(e.code)) e.preventDefault();
        if (e.code === 'Tab') e.preventDefault();
        if (!e.repeat) this.keyQ.push(e.code);
        this.keys[e.code] = true;
        this.setDevice('kbm');
        this.detectLayout(e);
        if (HOL.Audio) HOL.Audio.unlock();
      });
      window.addEventListener('keyup', (e) => { this.keys[e.code] = false; });
      window.addEventListener('blur', () => { this.keys = Object.create(null); });
      canvas.addEventListener('mousemove', (e) => {
        this.setMouse(e);
        if (Math.abs(e.movementX) + Math.abs(e.movementY) > 3) { this.mouse.moved = true; this.setDevice('kbm'); }
      });
      canvas.addEventListener('mousedown', (e) => {
        this.setMouse(e);
        if (e.button < 3) { this.mouse.down[e.button] = true; this.mouse.clickQ[e.button] = true; }
        this.setDevice('kbm');
        canvas.focus();
        if (HOL.Audio) HOL.Audio.unlock();
        e.preventDefault();
      });
      window.addEventListener('mouseup', (e) => { if (e.button < 3) this.mouse.down[e.button] = false; });
      canvas.addEventListener('contextmenu', (e) => e.preventDefault());
      canvas.addEventListener('wheel', (e) => { this.mouse.wheel = (this.mouse.wheel || 0) + Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
      window.addEventListener('gamepadconnected', (e) => {
        this.padIdx = e.gamepad.index;
        this.identifyPad(e.gamepad);
        this.setDevice('pad');
        if (HOL.UI && HOL.UI.toast) HOL.UI.toast('Manette connectée : ' + this.padLabel());
      });
      window.addEventListener('gamepaddisconnected', (e) => {
        if (e.gamepad.index === this.padIdx) {
          this.padIdx = -1; this.padBtn = [];
          this.setDevice('kbm');
          if (HOL.UI && HOL.UI.toast) HOL.UI.toast('Manette déconnectée');
        }
      });
      try {
        if (navigator.keyboard && navigator.keyboard.getLayoutMap) {
          navigator.keyboard.getLayoutMap().then((m) => {
            this.layoutMap = m;
            const w = m.get('KeyW');
            if (w) this.azerty = (w.toLowerCase() === 'z');
          }).catch(() => {});
        }
      } catch (err) { /* navigateur sans Keyboard API */ }
    },

    detectLayout(e) {
      if (!e.key || e.key.length !== 1) return;
      const k = e.key.toLowerCase();
      if (e.code === 'KeyW') this.azerty = (k === 'z');
      else if (e.code === 'KeyA') this.azerty = (k === 'q');
      else if (e.code === 'KeyQ') this.azerty = (k === 'a');
    },

    setMouse(e) {
      const r = this.canvas.getBoundingClientRect();
      const v = HOL.view || { scale: 1, offX: 0, offY: 0, dpr: 1 };
      const px = (e.clientX - r.left) * (this.canvas.width / r.width);
      const py = (e.clientY - r.top) * (this.canvas.height / r.height);
      this.mouse.x = (px - v.offX) / v.scale;
      this.mouse.y = (py - v.offY) / v.scale;
    },

    identifyPad(gp) {
      const id = (gp.id || '').toLowerCase();
      this.padName = gp.id || '';
      // si le joueur a choisi explicitement un schema de commandes dans les options,
      // on ne l'ecrase pas avec la detection automatique
      if (this.padTypeUser) return;
      // ATTENTION : "Xbox Wireless Controller" contient "wireless controller",
      // il faut donc tester xbox EN PREMIER sinon la manette Xbox est detectee
      // comme une manette PlayStation et affiche de faux symboles.
      if (id.includes('xbox') || id.includes('045e') || id.includes('028e')) this.padType = 'xbox';
      else if (id.includes('054c') || id.includes('playstation') || id.includes('dualsense') || id.includes('dualshock') || id.includes('wireless controller')) this.padType = 'ps';
      else if (id.includes('057e') || id.includes('nintendo') || id.includes('switch') || id.includes('pro controller')) this.padType = 'nintendo';
      else this.padType = 'xbox';
    },
    padLabel() {
      return this.padType === 'ps' ? 'PlayStation' : this.padType === 'nintendo' ? 'Nintendo' : 'Xbox / générique';
    },

    setDevice(d) {
      if (this.device !== d) { this.device = d; }
    },
    promptDevice() {
      if (this.forced === 'kbm' || this.forced === 'pad') return this.forced;
      return this.device;
    },

    pollPad() {
      let gp = null;
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      if (this.padIdx >= 0 && pads[this.padIdx]) gp = pads[this.padIdx];
      else {
        for (let i = 0; i < pads.length; i++) if (pads[i] && pads[i].connected) { gp = pads[i]; this.padIdx = i; this.identifyPad(gp); break; }
      }
      this.gp = gp;
      if (!gp) { this.padBtn = []; this.padAxes = [0, 0, 0, 0]; return; }
      const btn = [];
      let any = false;
      for (let i = 0; i < gp.buttons.length; i++) {
        const b = gp.buttons[i];
        const v = typeof b === 'object' ? (b.pressed || b.value > 0.5) : b > 0.5;
        btn[i] = v;
        if (v) any = true;
      }
      this.padBtn = btn;
      const ax = gp.axes || [];
      this.padAxes = [ax[0] || 0, ax[1] || 0, ax[2] || 0, ax[3] || 0];
      if (any || Math.abs(this.padAxes[0]) > 0.5 || Math.abs(this.padAxes[1]) > 0.5) this.setDevice('pad');
      // Un joueur 100% manette n'appuie jamais sur une touche : le navigateur ne
      // compte pas la manette comme "user activation", donc l'AudioContext reste
      // suspendu et le jeu est totalement muet. On tente de le reveiller ici.
      if (any && HOL.Audio && HOL.Audio.unlock) HOL.Audio.unlock();
    },

    // Le jeu est 100% manette : sert a bloquer le demarrage tant qu'aucune
    // manette n'est branchee (et a rafraichir l'etat de la detection).
    padReady() {
      this.pollPad();
      if (!this.gp) {
        try {
          const p = navigator.getGamepads ? navigator.getGamepads() : [];
          for (let i = 0; i < p.length; i++) if (p[i]) { this.padIdx = i; this.identifyPad(p[i]); this.gp = p[i]; break; }
        } catch (e) { }
      }
      return !!this.gp;
    },

    update(dt) {
      this.pollPad();
      const q = new Set(this.keyQ);
      this.keyQ.length = 0;
      this.mouse.clicked = this.mouse.clickQ.slice();
      this.mouse.clickQ = [false, false, false];
      this.anyPressed = q.size > 0 || this.mouse.clicked[0];
      const sx = this.padAxes[0], sy = this.padAxes[1];
      for (const a of ACTIONS) {
        this.prev[a] = this.cur[a];
        let c = false, qp = false;
        for (const k of KEYS[a]) { if (this.keys[k]) c = true; if (q.has(k)) qp = true; }
        for (const b of PAD[a]) if (this.padBtn[b]) c = true;
        if (a === 'left' && sx < -0.45) c = true;
        if (a === 'right' && sx > 0.45) c = true;
        if (a === 'up' && sy < -0.55) c = true;
        if (a === 'down' && sy > 0.55) c = true;
        this.cur[a] = c;
        this.pressedF[a] = (c && !this.prev[a]) || qp;
        this.releasedF[a] = !c && !!this.prev[a];
        this.consumed[a] = false;
        if (this.pressedF[a] && a !== 'walk') this.anyPressed = true;
      }
      // navigation de menu avec répétition
      for (const d of ['up', 'down', 'left', 'right']) {
        if (this.pressedF[d]) { this.nav[d] = true; this.navRepeat[d] = 0.38; }
        else if (this.cur[d]) {
          this.navRepeat[d] -= dt;
          if (this.navRepeat[d] <= 0) { this.nav[d] = true; this.navRepeat[d] = 0.09; } else this.nav[d] = false;
        } else this.nav[d] = false;
      }
      if (this.rumbleT > 0) this.rumbleT -= dt;
    },
    endFrame() { this.mouse.wheel = 0; this.mouse.moved = false; },

    down(a) { return !!this.cur[a]; },
    pressed(a) { return !!this.pressedF[a] && !this.consumed[a]; },
    released(a) { return !!this.releasedF[a]; },
    consume(a) { this.consumed[a] = true; },
    clicked(b) { return !!this.mouse.clicked[b || 0]; },
    consumeClick(b) { this.mouse.clicked[b || 0] = false; },

    // axe horizontal analogique (-1..1)
    axisX() {
      const sx = this.padAxes[0];
      if (Math.abs(sx) > 0.22) return U.clamp((Math.abs(sx) - 0.22) / 0.7, 0, 1) * Math.sign(sx);
      let v = 0;
      if (this.cur.left) v -= 1;
      if (this.cur.right) v += 1;
      return v;
    },
    axisY() {
      const sy = this.padAxes[1];
      if (Math.abs(sy) > 0.3) return Math.sign(sy) * U.clamp((Math.abs(sy) - 0.3) / 0.6, 0, 1);
      let v = 0;
      if (this.cur.up) v -= 1;
      if (this.cur.down) v += 1;
      return v;
    },
    analogMag() { return Math.abs(this.padAxes[0]) > 0.22 ? Math.abs(this.padAxes[0]) : 1; },
    usingStick() { return Math.abs(this.padAxes[0]) > 0.22; },

    rumble(strong, weak, ms) {
      if (!this.rumbleOn || !this.gp || !this.gp.vibrationActuator) return;
      try {
        this.gp.vibrationActuator.playEffect('dual-rumble', { duration: ms || 120, strongMagnitude: strong || 0.4, weakMagnitude: weak || 0.3 });
      } catch (e) { /* pas de vibration */ }
    },

    // ------- libellés pour les invites à l'écran -------
    keyLabel(code) {
      // Disposition choisie par le joueur (AZERTY / QWERTY) : si elle est forcee,
      // on ignore la detection auto et on affiche les touches correspondantes.
      const forced = this.layout === 'azerty' || this.layout === 'qwerty';
      if (!forced && this.layoutMap && /^Key[A-Z]$/.test(code)) {
        const k = this.layoutMap.get(code);
        if (k) return k.toUpperCase();
      }
      const az = forced ? (this.layout === 'azerty') : this.azerty;
      const m = {
        Space: 'Espace', Enter: 'Entrée', NumpadEnter: 'Entrée', Escape: 'Échap', Tab: 'Tab', Backspace: 'Retour',
        ShiftLeft: 'Maj', ShiftRight: 'Maj', ControlLeft: 'Ctrl', ControlRight: 'Ctrl', AltLeft: 'Alt',
        ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓',
        KeyW: az ? 'Z' : 'W', KeyA: az ? 'Q' : 'A', KeyQ: az ? 'A' : 'Q', KeyZ: az ? 'W' : 'Z'
      };
      if (m[code]) return m[code];
      if (/^Key[A-Z]$/.test(code)) return code.slice(3);
      return code;
    },
    padGlyph(i) {
      const t = this.padType;
      if (t === 'ps') {
        const g = { 0: ['✕', '#7aa7ff'], 1: ['○', '#ff6b6b'], 2: ['□', '#ff8ad8'], 3: ['△', '#5fe0a0'], 4: ['L1', '#cccccc'], 5: ['R1', '#cccccc'], 6: ['L2', '#cccccc'], 7: ['R2', '#cccccc'], 8: ['Share', '#cccccc'], 9: ['Options', '#cccccc'] };
        return g[i] || ['?', '#ccc'];
      }
      if (t === 'nintendo') {
        const g = { 0: ['B', '#dddddd'], 1: ['A', '#dddddd'], 2: ['Y', '#dddddd'], 3: ['X', '#dddddd'], 4: ['L', '#cccccc'], 5: ['R', '#cccccc'], 6: ['ZL', '#cccccc'], 7: ['ZR', '#cccccc'], 8: ['−', '#cccccc'], 9: ['+', '#cccccc'] };
        return g[i] || ['?', '#ccc'];
      }
      const g = { 0: ['A', '#5ec35a'], 1: ['B', '#e5534b'], 2: ['X', '#3f8ee0'], 3: ['Y', '#e8c23a'], 4: ['LB', '#cccccc'], 5: ['RB', '#cccccc'], 6: ['LT', '#cccccc'], 7: ['RT', '#cccccc'], 8: ['View', '#cccccc'], 9: ['Menu', '#cccccc'] };
      return g[i] || ['?', '#ccc'];
    },
    // renvoie { kind:'key'|'pad'|'mouse', label, color }
    prompt(action) {
      const dev = this.promptDevice();
      if (dev === 'pad') {
        if (action === 'move') return { kind: 'pad', label: 'L', color: '#bbbbbb' };
        const b = PAD[action] && PAD[action][0];
        if (b === undefined) return { kind: 'pad', label: '?', color: '#aaa' };
        const g = this.padGlyph(b);
        return { kind: 'pad', label: g[0], color: g[1] };
      }
      if (action === 'move') return { kind: 'key', label: this.keyLabel('KeyA') + ' ' + this.keyLabel('KeyD') };
      if (action === 'moveUD') return { kind: 'key', label: this.keyLabel('KeyW') + ' ' + this.keyLabel('KeyS') };
      const code = KEYS[action] && KEYS[action][0];
      return { kind: 'key', label: code ? this.keyLabel(code) : '?' };
    },
    mouseAlt(action) {
      if (this.promptDevice() === 'pad') return null;
      if (action === 'pulse') return 'Clic G';
      if (action === 'dash') return 'Clic D';
      return null;
    },
    KEYS, PAD
  };
})();
