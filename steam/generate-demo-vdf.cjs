'use strict';
const fs = require('node:fs');
const path = require('node:path');
const platform = process.argv[2];
const spec = {
  mac: { depot: '2284542', folder: 'mac-universal', executable: 'SoundStorm Demo.app' },
  win: { depot: '2284541', folder: 'win-unpacked', executable: 'SoundStorm Demo.exe' }
}[platform];
if (!spec) {
  console.error('Usage: node steam/generate-demo-vdf.cjs <mac|win>');
  process.exit(1);
}
const root = path.resolve(__dirname, '..');
const content = path.join(root, 'dist', spec.folder);
if (!fs.existsSync(path.join(content, spec.executable))) {
  console.error('Missing unpacked Steam build: ' + path.join(content, spec.executable));
  process.exit(1);
}
const out = path.join(root, 'dist', 'steam-build');
fs.mkdirSync(out, { recursive: true });
function quote(s) { return '"' + s.replace(/\\/g, '/').replace(/"/g, '\\"') + '"'; }
const depotFile = path.join(out, 'depot_' + spec.depot + '.vdf');
const appFile = path.join(out, 'app_build_2284540_' + platform + '.vdf');
const logDir = path.join(out, 'logs');
fs.mkdirSync(logDir, { recursive: true });
fs.writeFileSync(depotFile, [
  '"DepotBuildConfig"',
  '{',
  '  "DepotID" ' + quote(spec.depot),
  '  "ContentRoot" ' + quote(content),
  '  "FileMapping"',
  '  {',
  '    "LocalPath" "*"',
  '    "DepotPath" "."',
  '    "recursive" "1"',
  '  }',
  '}',
  ''
].join('\n'));
fs.writeFileSync(appFile, [
  '"appbuild"',
  '{',
  '  "appid" "2284540"',
  '  "desc" "SoundStorm Demo 0.8.8 Electron ' + platform + '"',
  '  "buildoutput" ' + quote(logDir),
  '  "contentroot" ' + quote(content),
  '  "depots"',
  '  {',
  '    ' + quote(spec.depot) + ' ' + quote(depotFile),
  '  }',
  '}',
  ''
].join('\n'));
console.log('Prepared DEMO-only SteamPipe config: ' + appFile);
console.log('Upload requires authenticated steamcmd. No public branch is set live automatically.');
