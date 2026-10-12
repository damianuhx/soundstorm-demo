'use strict';

const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { app, BrowserWindow, protocol, net, shell } = require('electron');

// Use a normal, secure origin instead of file:// so the existing PIXI, audio,
// XHR and cookie code behaves like the deployed web demo.
protocol.registerSchemesAsPrivileged([{
  scheme: 'soundstorm',
  privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true }
}]);

function openExternal(url) {
  try {
    if (new URL(url).protocol === 'https:') void shell.openExternal(url);
  } catch { /* Ignore invalid URLs. */ }
}

function createWindow() {
  const win = new BrowserWindow({
    title: 'SoundStorm Demo',
    width: 1280,
    height: 720,
    minWidth: 960,
    minHeight: 540,
    useContentSize: true,
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('soundstorm://demo/')) {
      event.preventDefault();
      openExternal(url);
    }
  });
  void win.loadURL('soundstorm://demo/index.html');
}

app.whenReady().then(async () => {
  const root = path.resolve(app.getAppPath());
  await protocol.handle('soundstorm', (request) => {
    const url = new URL(request.url);
    if (url.hostname !== 'demo') return new Response('Not found', { status: 404 });
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); }
    catch { return new Response('Bad path', { status: 400 }); }
    const localFile = path.resolve(root, '.' + pathname);
    if (!localFile.startsWith(root + path.sep)) {
      return new Response('Forbidden', { status: 403 });
    }
    return net.fetch(pathToFileURL(localFile).toString());
  });
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => app.quit());
