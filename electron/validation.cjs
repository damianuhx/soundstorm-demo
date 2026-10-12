'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const manifestFilename = path.join(root, 'build', 'web-demo-manifest.json');
const manifestSha256 = 'f3e9ad1020d55c2173e4e98f649ea331e6cca7edf731710088b5b7f8dc23c5a8';
const iconHashes = Object.freeze({
  'icon.png': '881a5b3940b5c24840caacb4ec626d2e2669bd2b3d85139fe38e7485d2fa1a45',
  'icon.icns': '865636bb1b3f32fcde65d6f5a7b41e1ca56f245edd39d33bab80ab75e28915cb',
  'icon.ico': '06bf839ab7e7ef45b9089f79f64ba24794b7bac5c4641f4777ff91e656d4be0e'
});
function hashFile(filename) {
  return crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex');
}
function readManifest() {
  if (hashFile(manifestFilename) !== manifestSha256) throw new Error('The verified web-demo manifest was changed. Re-audit the deployed source before updating its pinned hash.');
  const manifest = JSON.parse(fs.readFileSync(manifestFilename, 'utf8'));
  if (manifest.format !== 'soundstorm-web-demo-v1' || manifest.fileCount !== 160 || manifest.totalBytes !== 68946279) throw new Error('Unexpected web-demo snapshot.');
  return manifest;
}
function listFiles(directory, prefix = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const name = prefix + entry.name;
    if (entry.isSymbolicLink()) throw new Error('Game payload may not contain links: ' + name);
    return entry.isDirectory() ? listFiles(path.join(directory, entry.name), name + '/') : [name];
  }).sort();
}
function verifyGame(gameRoot = root) {
  const manifest = readManifest();
  const expected = manifest.files.map(file => file.path).sort();
  const actual = ['index.html', 'env.js', ...['code', 'pics', 'sounds'].flatMap(directory => listFiles(path.join(gameRoot, directory), directory + '/'))].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    const extras = actual.filter(file => !expected.includes(file));
    const missing = expected.filter(file => !actual.includes(file));
    throw new Error('Game allowlist mismatch. Extra: ' + extras.join(', ') + '; missing: ' + missing.join(', '));
  }
  for (const file of manifest.files) {
    if (file.path.includes('..') || path.isAbsolute(file.path)) throw new Error('Invalid manifest path.');
    const filename = path.join(gameRoot, file.path);
    if (fs.statSync(filename).size !== file.bytes || hashFile(filename) !== file.sha256) throw new Error('Game file differs from the verified live web demo: ' + file.path);
  }
  const env = fs.readFileSync(path.join(gameRoot, 'env.js'), 'utf8');
  const globals = fs.readFileSync(path.join(gameRoot, 'code', 'system', 'globals.js'), 'utf8');
  if (!/settings\.version\s*=\s*'demo'/.test(env) || !/settings\.plattform\s*=\s*'web'/.test(env) || !/settings\.playtest\s*=\s*\[1\]/.test(env)) throw new Error('The exact demo/web/[1] environment is required.');
  if (!/number:\s*'0\.8\.11'/.test(globals)) throw new Error('The live demo version must be 0.8.11.');
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  if (pkg.version !== '0.8.11' || pkg.devDependencies.electron !== '21.1.1') throw new Error('The desktop package must match demo 0.8.11 / Electron 21.1.1.');
  return manifest;
}
function verifyIcons(iconRoot = path.join(root, 'build')) {
  for (const [name, hash] of Object.entries(iconHashes)) {
    if (hashFile(path.join(iconRoot, name)) !== hash) throw new Error('Icon must match the verified full-version icon exactly: ' + name);
  }
  return iconHashes;
}
module.exports = { root, manifestSha256, iconHashes, hashFile, readManifest, listFiles, verifyGame, verifyIcons };
