# SoundStorm Demo — Steam upload

Steam demo app: **2284540** (separate from full app 2202400).

- Windows demo depot: **2284541**
- macOS demo depot: **2284542**

The game content comes from this repository (0.8.8; first stage), not
soundstorm-full. The SteamPipe scripts generate configs ONLY for these
demo IDs, and do not set a public or beta branch live.

1. Copy the full version's exact 512+ PNG desktop icon to build/icon.png.
2. Run npm install.
3. On a Mac run npm run build:mac (universal Intel + Apple Silicon).
   For Windows run npm run build:win (x64), preferably on Windows.
4. Test the unpacked app: dist/mac-universal/SoundStorm Demo.app or
   dist/win-unpacked/SoundStorm Demo.exe. Check music, XHR-loaded textures,
   fullscreen controls, progression, and first-stage ending.
5. Generate the matching SteamPipe config:
   npm run steam:vdf:mac OR npm run steam:vdf:win.
6. Use authenticated steamcmd on the build host to run:
   steamcmd +login YOUR_STEAM_ACCOUNT +run_app_build
   "/absolute/path/to/dist/steam-build/app_build_2284540_mac.vdf" +quit
   (Use the _win.vdf file for Windows.)
7. In Steamworks for demo 2284540, select/test the uploaded build
   and adjust launch paths to the app or exe above. Set live only after
   a successful installation/launch test on Steam.

The upload credentials, the Steamworks configuration, code signing,
and the exact full-version icon are NOT stored in this repository.
A successful SteamPipe upload alone does not publish the new build.
