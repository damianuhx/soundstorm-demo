'use strict';
const { verifyIcons } = require('./validation.cjs');
try {
  verifyIcons();
  console.log('PNG, ICNS and ICO are byte-identical to the verified full-version 0.8.11 desktop icons.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
