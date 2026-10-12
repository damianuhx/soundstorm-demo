'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function exists(relativePath) { return fs.existsSync(path.join(root, relativePath)); }

const required = [
  'index.html', 'env.js', 'code/system/globals.js',
  'code/stages/stage0.js', 'code/stages/stage1.js',
  'pics/img01/greengrass.jpg', 'sounds/music01/greengrass.mp3'
];
const forbidden = [
  'code/stages/stage2.js', 'code/stages/stage3.js',
  'code/stages/stage4.js', 'code/stages/stage5.js',
  'pics/img02', 'pics/img03', 'pics/img04', 'pics/img05',
  'sounds/music02', 'sounds/music03', 'sounds/music04', 'sounds/music05'
];
const env = fs.readFileSync(path.join(root, 'env.js'), 'utf8');
const globals = fs.readFileSync(path.join(root, 'code/system/globals.js'), 'utf8');
const errors = [];
for (const item of required) if (!exists(item)) errors.push('Missing demo content: ' + item);
for (const item of forbidden) if (exists(item)) errors.push('Full-game content must not be shipped: ' + item);
if (!/settings\.version\s*=\s*['"]demo['"]/.test(env)) errors.push('env.js must select the demo.');
if (!/number:\s*['"]0\.8\.8['"]/.test(globals)) errors.push('The game version is not the website-demo repository version 0.8.8.');
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('SoundStorm Demo 0.8.8: first-stage assets and demo flag verified.');
