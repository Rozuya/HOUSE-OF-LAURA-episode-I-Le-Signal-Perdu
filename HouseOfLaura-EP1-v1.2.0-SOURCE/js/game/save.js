/* House of Laura · sauvegarde (localStorage) */
(function () {
  'use strict';
  const HOL = window.HOL;
  const KEY0 = 'hol_save_ep1_v1', SKEY = 'hol_settings_v1';
  const KEY = () => KEY0 + (HOL.DEBUG ? (HOL.DEBUG_SLOT || '_debug') : '');
  const DEFAULT_SETTINGS = { master: 0.85, music: 0.7, sfx: 0.8, textSpeed: 'normal', prompts: 'auto', rumble: true, shake: true, assist: false, padType: 'xbox', keyLayout: 'auto' };

  class SaveData {
    constructor(settings) {
      this.settings = settings || Object.assign({}, DEFAULT_SETTINGS);
      this.reset();
    }
    reset() {
      this.v = 1;
      this.flags = {}; this.items = {}; this.abilities = {};
      this.reconnected = { tony: true };
      this.crystals = {}; this.polaroids = {}; this.polaroidsGiven = 0;
      this.rooms = {};
      this.room = 'm_chambre'; this.spawn = 'desk';
      this.checkpoint = null;
      this.hp = 3; this.maxHp = 3;
      this.time = 0;
      this.stats = { deaths: 0, enemies: 0 };
    }
    roomState(id) { return this.rooms[id] || (this.rooms[id] = {}); }
    countCrystals() { let n = 0; for (const k in this.crystals) if (this.crystals[k]) n++; return n; }
    countPolaroids() { let n = 0; for (const k in this.polaroids) if (this.polaroids[k]) n++; return n; }
    countReconnected() { return HOL.Chars.HOUSE.filter((id) => this.reconnected[id]).length; }
    toJSON() {
      return {
        v: this.v, flags: this.flags, items: this.items, abilities: this.abilities, reconnected: this.reconnected,
        crystals: this.crystals, polaroids: this.polaroids, polaroidsGiven: this.polaroidsGiven, rooms: this.rooms,
        room: this.room, spawn: this.spawn, checkpoint: this.checkpoint, hp: this.hp, maxHp: this.maxHp, time: this.time, stats: this.stats
      };
    }
    load(o) {
      this.reset();
      for (const k in o) if (k !== 'settings') this[k] = o[k];
      this.reconnected.tony = true;
    }
  }

  HOL.SaveData = SaveData;
  HOL.Save = {
    exists() { try { return !!localStorage.getItem(KEY()); } catch (e) { return false; } },
    read() {
      try { const s = localStorage.getItem(KEY()); return s ? JSON.parse(s) : null; } catch (e) { return null; }
    },
    write(data) {
      try { localStorage.setItem(KEY(), JSON.stringify(data)); return true; } catch (e) { return false; }
    },
    clear() { try { localStorage.removeItem(KEY()); } catch (e) { /* ignore */ } },
    loadSettings() {
      try { const s = localStorage.getItem(SKEY); if (s) return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(s)); } catch (e) { /* ignore */ }
      return Object.assign({}, DEFAULT_SETTINGS);
    },
    saveSettings(s) { try { localStorage.setItem(SKEY, JSON.stringify(s)); } catch (e) { /* ignore */ } }
  };
})();
