'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { root, hashFile, verifyGame, manifestSha256 } = require('../electron/validation.cjs');
const specs = require('../electron/platforms.cjs');
const APP_ID = '2284540';

function runtimePaths(directory, prefix = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const name = prefix + entry.name;
    return entry.isDirectory() ? runtimePaths(path.join(directory, entry.name), name + '/') : [name];
  }).sort();
}

function verifyBuild(platform) {
  const spec = specs[platform];
  if (!spec || !['2284541', '2284542', '2284543'].includes(spec.depot)) throw new Error('Only SoundStorm DEMO depots are permitted.');
  const content = path.join(root, 'dist', spec.folder);
  const runtime = platform === 'mac' ? path.join(content, spec.launch) : content;
  const report = JSON.parse(fs.readFileSync(path.join(root, 'dist', 'build-' + platform + '.json'), 'utf8'));
  if (report.appId !== APP_ID || report.depotId !== spec.depot || report.webManifestSha256 !== manifestSha256 || report.electron !== '21.1.1' || report.version !== '0.8.11' || !report.exactWebContent) throw new Error('Invalid DEMO build report.');
  const gameRoot = path.join(runtime, platform === 'mac' ? 'Contents/Resources/app/src' : 'resources/app/src');
  verifyGame(gameRoot);
  if (JSON.stringify(runtimePaths(runtime)) !== JSON.stringify(report.files.map(file => file.path).sort())) throw new Error('Unexpected or missing files in the runtime package.');
  const appRoot = path.dirname(gameRoot);
  for (const name of ['main.cjs', 'preload.cjs']) {
    if (hashFile(path.join(root, 'electron', name)) !== hashFile(path.join(appRoot, 'electron', name))) throw new Error('The wrapper changed after packaging; rebuild before uploading.');
  }
  for (const file of report.files) {
    if (file.path.includes('..') || path.isAbsolute(file.path)) throw new Error('Invalid build-report path.');
    const filename = path.join(runtime, file.path);
    if (file.symlink) {
      if (fs.readlinkSync(filename) !== file.symlink) throw new Error('Changed runtime link: ' + file.path);
      const resolved = fs.realpathSync(filename);
      if (!resolved.startsWith(runtime + path.sep)) throw new Error('Runtime link escapes packaged shell: ' + file.path);
    } else if (hashFile(filename) !== file.sha256) throw new Error('Changed build file: ' + file.path);
    if (path.basename(filename) === 'steam_appid.txt') throw new Error('Unexpected Steam AppID file in demo payload.');
  }
  if (!fs.existsSync(path.join(content, spec.launch))) throw new Error('Missing Steam launch target.');
  return { platform, spec, content };
}
function quote(s) { return '"' + s.replace(/\\/g, '/').replace(/"/g, '\\"') + '"'; }
function generate(target = 'all') {
  const platforms = target === 'all' ? Object.keys(specs) : [target];
  const builds = platforms.map(verifyBuild);
  const out = path.join(root, 'dist', 'steam-build');
  const logDir = path.join(out, 'logs');
  fs.mkdirSync(logDir, { recursive: true });
  const depots = [];
  for (const { spec, content } of builds) {
    const depotFile = path.join(out, 'depot_' + spec.depot + '.vdf');
    fs.writeFileSync(depotFile, [
      '"DepotBuildConfig"', '{', '  "DepotID" ' + quote(spec.depot),
      '  "ContentRoot" ' + quote(content), '  "FileMapping"', '  {',
      '    "LocalPath" "*"', '    "DepotPath" "."', '    "recursive" "1"', '  }', '}', ''
    ].join('\n'));
    depots.push('    ' + quote(spec.depot) + ' ' + quote(depotFile));
  }
  const appFile = path.join(out, 'app_build_' + APP_ID + '_' + target + '.vdf');
  fs.writeFileSync(appFile, [
    '"appbuild"', '{', '  "appid" "2284540"',
    '  "desc" "SoundStorm Demo 0.8.11 Electron 21.1.1 ' + target + '"',
    '  "buildoutput" ' + quote(logDir), '  "contentroot" ' + quote(path.join(root, 'dist')),
    '  "depots"', '  {', ...depots, '  }', '}', ''
  ].join('\n'));
  console.log('Prepared verified DEMO-only SteamPipe configuration: ' + appFile);
  console.log('No branch is made live by this configuration. Public release requires separate approval.');
  return { appFile, depots: builds.map(build => build.spec.depot) };
}
if (require.main === module) {
  try { generate(process.argv[2]); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { APP_ID, verifyBuild, generate };
