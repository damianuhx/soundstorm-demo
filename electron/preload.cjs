'use strict';
const { contextBridge } = require('electron');
const platforms = { darwin: 'mac', win32: 'windows', linux: 'linux' };
contextBridge.exposeInMainWorld('soundstormDesktop', {
  platform: platforms[process.platform] || 'web',
  demoAppId: '2284540',
  electronVersion: process.versions.electron
});
// Wrapper metadata only. Never change settings.plattform: 'web' is required
// for the verified Stage 1 completion screen and frozen simulation.
