'use strict';
const fs = require('node:fs');
const path = require('node:path');
const filename = path.join(__dirname, '..', 'build', 'icon.png');
if (!fs.existsSync(filename)) {
  console.error('Missing build/icon.png. Copy/export the EXACT desktop icon from the new SoundStorm full-version Electron project (at least 512x512).');
  process.exit(1);
}
const fd = fs.openSync(filename, 'r');
const header = Buffer.alloc(24);
try { fs.readSync(fd, header, 0, header.length, 0); }
finally { fs.closeSync(fd); }
const signature = Buffer.from([137,80,78,71,13,10,26,10]);
const width = header.readUInt32BE(16), height = header.readUInt32BE(20);
if (!header.subarray(0, 8).equals(signature) || width !== height || width < 512) {
  console.error('build/icon.png must be a square PNG of 512px or more, sourced from the full-version icon.');
  process.exit(1);
}
console.log('Icon file found: ' + width + 'x' + height + ' (verify it matches the full version visually).');
