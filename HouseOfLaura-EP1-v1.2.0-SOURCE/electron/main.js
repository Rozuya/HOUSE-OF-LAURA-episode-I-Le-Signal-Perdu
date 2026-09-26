/* House of Laura · Épisode I — lanceur Windows (Electron)
 * Objectifs : fenetre plein ecran, manette (Gamepad API), audio, sauvegardes
 * persistantes, et FPS stable (pas de bridage quand la fenetre perd le focus).
 */
'use strict';
const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const SAVE_DIR = path.join(app.getPath('userData'), 'saves');
let win = null;
let isFullScreen = false;

// --------------------------------------------------------------------------- instance unique
if (!app.requestSingleInstanceLock()) { app.quit(); }
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });

// --- garde le CPU/GPU actifs : le jeu tourne a 60 fps, on ne veut pas de throttle
function keepAwake() {
  try {
    const { powerSaveBlocker } = require('electron');
    powerSaveBlocker.start('prevent-display-sleep');
  } catch (e) { /* ignore */ }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 720, minWidth: 800, minHeight: 450,
    backgroundColor: '#07040d',
    show: false,
    autoHideMenuBar: true,
    title: 'House of Laura · Épisode I',
    icon: path.join(ROOT, 'build', 'icon.ico'),
    webPreferences: {
      backgroundThrottling: false,   // pas de chute de FPS en fenetre inactive
      contextIsolation: true,
      nodeIntegration: false,
      devTools: false,
      // la manette doit etre vues par le jeu des le lancement
      disableBlinkFeatures: 'Auxclick'
    }
  });

  win.loadFile(path.join(ROOT, 'index.html'));

  win.once('ready-to-show', () => { win.show(); win.focus(); keepAwake(); });

  // F11 / F / Alt+Entree : plein ecran
  const toggleFs = () => {
    if (!win || win.isDestroyed()) return;
    isFullScreen = !isFullScreen;
    win.setFullScreen(isFullScreen);
  };
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    const k = input.key.toLowerCase();
    const bare = !input.control && !input.alt && !input.meta;
    if (k === 'f11' || (k === 'f' && bare)) { e.preventDefault(); toggleFs(); }
    if (k === 'escape' && win.isFullScreen() && isFullScreen) {
      // laisse d'abord le jeu gerer Echap ; on ne sort que si le jeu ne l'a pas fait
      setTimeout(() => { if (isFullScreen && win && win.isFullScreen()) { isFullScreen = false; win.setFullScreen(false); } }, 60);
    }
  });

  // sauvegarde du jeu -> fichier lisible par l'utilisateur
  ipcMain.handle('hol:save', (ev, data) => {
    try {
      fs.mkdirSync(SAVE_DIR, { recursive: true });
      fs.writeFileSync(path.join(SAVE_DIR, 'save_ep1.json'), JSON.stringify(data), 'utf8');
      return true;
    } catch (e) { return false; }
  });
  ipcMain.handle('hol:load', () => {
    try {
      const p = path.join(SAVE_DIR, 'save_ep1.json');
      if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf8'));
    } catch (e) { /* ignore */ }
    return null;
  });
  ipcMain.handle('hol:openFolder', () => { shell.openPath(SAVE_DIR); return true; });

  // pas de navigation externe : tout reste dans la fenetre du jeu
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e) => e.preventDefault());

  win.on('closed', () => { win = null; });
}

app.whenReady().then(() => {
  // le dossier audio/ peut etre vide : on evite les 404 dans la console
  try { app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required'); } catch (e) { }
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { app.quit(); });
