Desktop icon

Place the SAME high-resolution source icon used by the new full SoundStorm
Electron build here, named icon.png (square PNG, minimum 512x512;
1024x1024 preferred). electron-builder derives macOS (.icns) and
Windows (.ico) icons from this file.

Do not use pics/favicon.png (low-resolution web favicon) or the generic
Electron icon. Build scripts deliberately abort when build/icon.png is missing.
This directory contains instructions only: the actual full-version desktop
icon was not present in the demo GitHub repository.
