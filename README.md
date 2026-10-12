# SoundStorm Demo 0.8.11

Dies ist die erste Stage von SoundStorm, spielbar unter https://soundstorm.uhx.ch.
Die 160 Spieldateien in diesem Repository stimmen bytegenau mit der am
12. Oktober 2026 geprüften öffentlichen Webdemo überein. Das geprüfte Manifest
liegt in `build/web-demo-manifest.json`.

Die separate Electron-Verpackung verwendet die bewährten Electron-21.1.1-
Laufzeiten und die exakt gleichen Icons wie der lokale Vollversions-Build
`beta-20261011`. Windows, macOS und Linux sind x64; der Mac-Build benötigt
mindestens macOS 10.13 und läuft auf Apple Silicon über Rosetta.

`env.js` bleibt unverändert auf `demo`, `web` und `[1]`. Das ist auch in der
Desktop-App erforderlich, damit die Demo nach Stage 1 den Dankbildschirm zeigt.
Die Wrapper-Metadaten verändern keine Spieleinstellungen. Stage 2–5 und deren
exklusive Grafik-/Musikdateien sind nicht enthalten.

Die Webdemo läuft unter dem sicheren Standard-Ursprung
`soundstorm://demo/index.html`. Der Electron-21-kompatible Dateiprotokoll-Handler
liefert ihre unveränderten Dateien aus und trennt Versionsparameter vom
Dateipfad. Dadurch stehen der Demo die üblichen Browser-APIs und dauerhafte
Cookies unter einem festen Ursprung zur Verfügung. Fenstergröße, Original-Icon
und Plattform-Laufzeiten entsprechen dem geprüften Vollversionspaket.

```sh
npm run check
npm run build:win
npm run build:mac
npm run build:linux
npm test
npm run steam:vdf
```

Die Builds übernehmen ausschließlich die geprüfte Laufzeit, nicht den Inhalt
oder die Abhängigkeiten der Vollversion. Die Standardpfade verweisen auf den
lokalen Vollversions-Build im benachbarten `soundstorm-full`-Projekt; ein anderer
Pfad kann nur mit denselben geprüften Laufzeitdateien verwendet werden.
`npm install` ist nur für den optionalen Entwicklungsstart mit `npm start`
erforderlich, nicht für die Paketierung der vorhandenen Laufzeiten.

Build- und Steam-Anleitung: [steam/README.md](steam/README.md).
Geprüfte Icons: [build/README.md](build/README.md).
