'use strict';
const { contextBridge } = require('electron');
const platforms = { darwin: 'mac', win32: 'windows', linux: 'linux' };
contextBridge.exposeInMainWorld('soundstormDesktop', {
  platform: platforms[process.platform] || 'web'
});
