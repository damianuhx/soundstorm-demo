'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { root, manifestSha256, iconHashes, hashFile, verifyGame, verifyIcons, listFiles } = require('./validation.cjs');
const specs = require('./platforms.cjs');

function runtimeEntries(directory, prefix = '') {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const name = prefix + entry.name;
    const filename = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) return [{ path: name, symlink: fs.readlinkSync(filename) }];
    if (entry.isDirectory()) return runtimeEntries(filename, name + '/');
    return [{ path: name, sha256: hashFile(filename), bytes: fs.statSync(filename).size }];
  }).sort((a, b) => a.path.localeCompare(b.path));
}

function build(platform, shellOverride) {
  const spec = specs[platform];
  if (!spec) throw new Error('Usage: node electron/build-demo.cjs <mac|win|linux> [verified-full-runtime-directory]');
  const manifest = verifyGame();
  verifyIcons();
  const source = shellOverride ? path.resolve(shellOverride) : path.resolve(root, '../soundstorm-full/output/beta-20261011/release/content/full', spec.shell);
  if (hashFile(path.join(source, spec.executable)) !== spec.sha256) throw new Error('The runtime executable must match the verified full-version Electron 21.1.1 x64 shell.');
  if (platform !== 'mac' && fs.readFileSync(path.join(source, 'version'), 'utf8').trim() !== '21.1.1') throw new Error('Wrong Electron runtime version.');
  const destination = path.join(root, 'dist', spec.folder);
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(destination, { recursive: true });
  const runtime = platform === 'mac' ? path.join(destination, spec.launch) : destination;
  const resourcesRelative = platform === 'mac' ? 'Contents/Resources' : 'resources';
  const oldPayload = path.join(source, resourcesRelative, 'app');
  // Copy the runtime shell, never the full-game app or its dependencies.
  fs.cpSync(source, runtime, {
    recursive: true, preserveTimestamps: true, verbatimSymlinks: true,
    filter: filename => filename !== oldPayload && !filename.startsWith(oldPayload + path.sep)
      && !['app.asar', 'default_app.asar', '.DS_Store', 'steam_appid.txt'].includes(path.basename(filename))
  });
  const appRoot = path.join(runtime, resourcesRelative, 'app');
  const gameRoot = path.join(appRoot, 'src');
  fs.mkdirSync(gameRoot, { recursive: true });
  for (const file of manifest.files) {
    const destinationFile = path.join(gameRoot, file.path);
    fs.mkdirSync(path.dirname(destinationFile), { recursive: true });
    fs.copyFileSync(path.join(root, file.path), destinationFile);
  }
  fs.mkdirSync(path.join(appRoot, 'electron'), { recursive: true });
  for (const name of ['main.cjs', 'preload.cjs']) fs.copyFileSync(path.join(root, 'electron', name), path.join(appRoot, 'electron', name));
  fs.mkdirSync(path.join(appRoot, 'build'), { recursive: true });
  fs.copyFileSync(path.join(root, 'build', 'icon.png'), path.join(appRoot, 'build', 'icon.png'));
  const pkg = { name: 'soundstorm-demo', productName: 'SoundStorm Demo', version: '0.8.11', description: 'Exact first-stage SoundStorm web demo.', main: 'electron/main.cjs', private: true };
  fs.writeFileSync(path.join(appRoot, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
  if (platform === 'mac') {
    fs.copyFileSync(path.join(root, 'build', 'icon.icns'), path.join(runtime, resourcesRelative, 'SoundStorm.icns'));
    const plist = path.join(runtime, 'Contents', 'Info.plist');
    // Electron resolves its helper-app family using CFBundleName. Keep the
    // source shell's name/executable paired with its existing SoundStorm helpers.
    const values = { CFBundleName: 'SoundStorm', CFBundleDisplayName: 'SoundStorm Demo', CFBundleIdentifier: 'ch.uhx.soundstorm.demo', CFBundleVersion: '0.8.11', CFBundleShortVersionString: '0.8.11', CFBundleIconFile: 'SoundStorm.icns' };
    for (const [key, value] of Object.entries(values)) execFileSync('/usr/bin/plutil', ['-replace', key, '-string', value, plist]);
    // OneDrive may restore resource forks on a copied shell; clear only our build.
    execFileSync('/usr/bin/xattr', ['-cr', runtime]);
    execFileSync('/usr/bin/codesign', ['--force', '--deep', '--sign', '-', runtime], { stdio: 'pipe' });
    execFileSync('/usr/bin/codesign', ['--verify', '--deep', '--strict', runtime], { stdio: 'pipe' });
  } else if (platform === 'linux') {
    fs.copyFileSync(path.join(root, 'build', 'icon.png'), path.join(runtime, 'SoundStorm.png'));
    fs.chmodSync(path.join(runtime, 'SoundStorm'), 0o755);
    fs.chmodSync(path.join(runtime, 'chrome-sandbox'), 0o755);
  }
  verifyGame(gameRoot);
  const allowedAppFiles = ['package.json', 'electron/main.cjs', 'electron/preload.cjs', 'build/icon.png', ...manifest.files.map(file => 'src/' + file.path)].sort();
  if (JSON.stringify(listFiles(appRoot)) !== JSON.stringify(allowedAppFiles)) throw new Error('Unexpected files in the packaged app.');
  const buildReport = {
    format: 'soundstorm-demo-desktop-v1', builtAt: new Date().toISOString(), platform,
    appId: '2284540', depotId: spec.depot, version: '0.8.11', electron: '21.1.1', arch: 'x64',
    launch: spec.launch, runtimeSource: source, sourceRuntimeSha256: spec.sha256,
    webManifestSha256: manifestSha256, gameFiles: manifest.fileCount, gameBytes: manifest.totalBytes,
    exactWebContent: true, environment: manifest.environment, iconHashes,
    files: runtimeEntries(runtime)
  };
  // Reports stay outside Steam content; no test/log/source tooling in depots.
  fs.writeFileSync(path.join(root, 'dist', 'build-' + platform + '.json'), JSON.stringify(buildReport, null, 2) + '\n');
  console.log('Built DEMO ' + platform + ' for app 2284540 / depot ' + spec.depot + ': ' + destination);
  return buildReport;
}
if (require.main === module) {
  try { build(process.argv[2], process.argv[3]); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { build };
