'use strict';
const { verifyGame } = require('./validation.cjs');
try {
  const manifest = verifyGame(process.argv[2]);
  console.log('SoundStorm Demo 0.8.11: all ' + manifest.fileCount + ' files / ' + manifest.totalBytes + ' bytes match the live web demo exactly (demo/web/[1]).');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
