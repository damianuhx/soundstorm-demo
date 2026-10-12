'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { root, readManifest, verifyGame, verifyIcons } = require('./validation.cjs');
const { APP_ID, generate } = require('../steam/generate-demo-vdf.cjs');

test('Electron 21 secure origin serves versioned game files and rejects private paths', async () => {
  let handler, window, scheme;
  const app = { setName() {}, getAppPath: () => root, whenReady: () => Promise.resolve(), on() {} };
  class BrowserWindow {
    constructor(options) { this.options = options; this.webContents = { setWindowOpenHandler() {}, on() {} }; window = this; }
    setMenuBarVisibility() {}
    loadURL(url) { this.url = url; return Promise.resolve(); }
    static getAllWindows() { return []; }
  }
  const protocol = {
    registerSchemesAsPrivileged(spec) { scheme = spec[0]; },
    registerFileProtocol(name, callback) { assert.equal(name, 'soundstorm'); handler = callback; }
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'electron', 'main.cjs'), 'utf8'), {
    require: name => name === 'electron' ? { app, BrowserWindow, protocol, shell: { openExternal() {} } } : require(name),
    __dirname: path.join(root, 'electron'), process: { platform: 'linux' }, URL
  });
  await Promise.resolve();
  assert.equal(window.url, 'soundstorm://demo/index.html');
  assert.equal(scheme.privileges.standard, true);
  assert.equal(scheme.privileges.secure, true);
  assert.equal(window.options.webPreferences.nodeIntegration, false);
  const response = url => { let result; handler({ url }, value => { result = value; }); return result; };
  assert.equal(response('soundstorm://demo/env.js?v=123').path, path.join(root, 'env.js'));
  assert.equal(response('soundstorm://demo/code/system/clock.js?v=123').path, path.join(root, 'code', 'system', 'clock.js'));
  assert.equal(response('soundstorm://demo/package.json').error, -6);
  assert.equal(response('soundstorm://other/env.js').error, -6);
  assert.equal(response('soundstorm://demo/code/..%2f..%2fenv.js').error, -10);
});

test('verified demo rejects changed content, missing files, and additional full-game files', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'soundstorm-demo-guard-'));
  try {
    const manifest = readManifest();
    for (const file of manifest.files) {
      const destination = path.join(temporary, file.path);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(path.join(root, file.path), destination);
    }
    assert.equal(verifyGame(temporary).fileCount, 160);
    const envFile = path.join(temporary, 'env.js');
    const original = fs.readFileSync(envFile);
    fs.writeFileSync(envFile, original.toString().replace("'web'", "'mac'"));
    assert.throws(() => verifyGame(temporary), /differs from the verified live web demo: env.js/);
    fs.writeFileSync(envFile, original);
    const extra = path.join(temporary, 'code', 'stages', 'stage2.js');
    fs.writeFileSync(extra, 'full-game-stage');
    assert.throws(() => verifyGame(temporary), /allowlist mismatch.*stage2.js/);
    fs.unlinkSync(extra);
    fs.unlinkSync(path.join(temporary, 'sounds', 'music01', 'greengrass.mp3'));
    assert.throws(() => verifyGame(temporary), /allowlist mismatch.*greengrass.mp3/);
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
});

test('icons are pinned to the exact full-version assets', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'soundstorm-demo-icons-'));
  try {
    for (const name of ['icon.png', 'icon.icns', 'icon.ico']) fs.copyFileSync(path.join(root, 'build', name), path.join(temporary, name));
    assert.equal(Object.keys(verifyIcons(temporary)).length, 3);
    fs.appendFileSync(path.join(temporary, 'icon.png'), 'different');
    assert.throws(() => verifyIcons(temporary), /exactly: icon.png/);
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
});

test('SteamPipe configuration only targets the three demo depots and does not release a branch', () => {
  assert.equal(APP_ID, '2284540');
  assert.throws(() => generate('full'), /Only SoundStorm DEMO depots/);
  const config = generate('all');
  assert.deepEqual(config.depots.sort(), ['2284541', '2284542', '2284543']);
  const appText = fs.readFileSync(config.appFile, 'utf8');
  assert.match(appText, /"appid" "2284540"/);
  assert.doesNotMatch(appText, /2202400|[Ss]et[Ll]ive/);
  for (const depot of config.depots) {
    const text = fs.readFileSync(path.join(path.dirname(config.appFile), 'depot_' + depot + '.vdf'), 'utf8');
    assert.match(text, new RegExp('"DepotID" "' + depot + '"'));
    assert.doesNotMatch(text, /2202400|[Ss]et[Ll]ive/);
  }
});
