'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { app, BrowserWindow, protocol, shell } = require('electron');

// Match the verified Electron 21.1.1 full-version shells. The renderer files
// remain identical to the live web demo, including its demo/web/[1] settings.
app.setName('SoundStorm Demo');
const gameRoot = fs.existsSync(path.join(app.getAppPath(), 'src', 'index.html'))
  ? path.join(app.getAppPath(), 'src') : app.getAppPath();
// The exported web demo has versioned resource URLs and browser cookies.
// Give it a stable standard origin, using Electron 21's file-protocol API.
protocol.registerSchemesAsPrivileged([{
  scheme: 'soundstorm',
  privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true }
}]);

function openExternal(url) {
  try {
    if (new URL(url).protocol === 'https:') void shell.openExternal(url);
  } catch { /* Ignore invalid URLs. */ }
}

function isGameUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'soundstorm:' && parsed.hostname === 'demo' && parsed.pathname === '/index.html';
  }
  catch { return false; }
}

function createWindow() {
  const win = new BrowserWindow({
    title: 'SoundStorm Demo',
    width: 1280,
    height: process.platform === 'darwin' ? 748 : 800,
    backgroundColor: '#000000',
    icon: path.join(app.getAppPath(), 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });
  win.setMenuBarVisibility(false);
  win.webContents.setWindowOpenHandler(({ url }) => {
    openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (!isGameUrl(url)) {
      event.preventDefault();
      openExternal(url);
    }
  });
  void win.loadURL('soundstorm://demo/index.html');
}

app.whenReady().then(() => {
  protocol.registerFileProtocol('soundstorm', (request, callback) => {
    try {
      const url = new URL(request.url);
      if (url.protocol !== 'soundstorm:' || url.hostname !== 'demo') return callback({ error: -6 });
      const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
      if (!/^(?:index\.html|env\.js|(?:code|pics|sounds)\/.+)$/.test(relative)) return callback({ error: -6 });
      const localFile = path.resolve(gameRoot, relative);
      const inside = path.relative(gameRoot, localFile);
      if (inside.startsWith('..') || path.isAbsolute(inside)) return callback({ error: -10 });
      // URL.search is deliberately excluded from the filesystem pathname.
      callback({ path: localFile });
    } catch { callback({ error: -6 }); }
  });
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(app.getAppPath(), 'build', 'icon.png'));
  }
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
