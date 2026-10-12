This is the source code of the demo of my rhythm shoot 'em up.
It can be played at https://soundstorm.uhx.ch.

## Steam Electron demo

The original web demo (version 0.8.8, first stage) stays unchanged.
The separate Electron wrapper loads this same content and selects
the desktop platform at runtime. There is no full-game content in
this repository.

See [steam/README.md](steam/README.md) for building and uploading to
the separate **SoundStorm Demo** Steam app (2284540). The real
full-version desktop icon must first be copied to build/icon.png;
a generic or low-resolution fallback is intentionally forbidden.
