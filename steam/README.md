# SoundStorm Demo — Build und SteamPipe

Das einzige Upload-Ziel dieser Skripte ist die **Demo-App 2284540**.

| System | Demo-Depot | Steam-Startziel | Inhalt |
|---|---|---|---|
| Windows x64 | 2284541 | `SoundStorm.exe` | `dist/windows/` |
| macOS x64 | 2284542 | `SoundStorm Demo.app` | `dist/macos/` |
| Linux x64 | 2284543 | `SoundStorm` | `dist/linux/` |

Die Namen entsprechen den bestehenden Startoptionen der Demo. Die Vollversion
(App 2202400) wird von den Generierungsskripten nicht adressiert.

## Bauen

Die Standard-Laufzeiten stammen aus dem benachbarten Projekt:
`soundstorm-full/output/beta-20261011/release/content/full`.
Das sind die bereits vorhandenen, geprüften Electron-21.1.1-x64-Pakete.

```sh
npm run check
npm run build:win
npm run build:mac
npm run build:linux
npm test
npm run steam:vdf
```

Optional kann ein unveränderter geprüfter Laufzeitordner angegeben werden:
`node electron/build-demo.cjs win /absoluter/pfad/zum/windows-laufzeitordner`.
Mac-Paketierung benötigt macOS für Plist-Anpassung und Ad-hoc-Signatur. Der Mac-
Build wird von Dateiattributen bereinigt, neu signiert und streng verifiziert.
Eine Apple-Developer-Signatur oder Notarisierung wird damit nicht behauptet.

Jeder Build prüft zuerst alle 160 Webdemo-Dateien, die drei Original-Icons und
den Laufzeitfingerabdruck. Er entfernt den gesamten Vollversions-App-Inhalt und
kopiert ausschließlich die verifizierte Demo in `resources/app/src` bzw.
`Contents/Resources/app/src`. Keine `node_modules`, Tests, Quellmanifeste,
Zugangsdaten oder Uploadprotokolle werden mitgeliefert.

Die Berichte `dist/build-win.json`, `dist/build-mac.json` und
`dist/build-linux.json` liegen außerhalb der Depot-Inhalte. Sie dokumentieren
Runtime-/Icon-/Spieldatei-Hashes. Die SteamPipe-Generierung kontrolliert diese
Fingerabdrücke erneut und bricht bei Änderungen oder falschen App-/Depot-IDs ab.

Der Wrapper verwendet den sicheren Standard-Ursprung `soundstorm://demo/`
mit dem Electron-21-API `protocol.registerFileProtocol`. Versionsparameter
bleiben im Browser-URL erhalten, werden aber nicht als Teil des Dateinamens
verwendet. Nur Demo-Spielpfade sind erreichbar; private Paket-/Werkzeugdateien
und Pfade außerhalb des Spielordners werden abgewiesen.

## Hochladen und prüfen

Das gemeinsame VDF ist `dist/steam-build/app_build_2284540_all.vdf`.
Alternativ erstellt `npm run steam:vdf:mac`, `:win` oder `:linux` ein VDF für
nur dieses Depot. Die Konfigurationen setzen **keine** Branch live.

Für SteamCMD ist ein authentifizierter Steamworks-Account mit Upload-Recht für
2284540 erforderlich. Das gemeinsame App-Build-VDF wird mit `+run_app_build`
übergeben. Passwörter und Steam-Guard-Codes gehören weder in das Repository noch
in die VDFs. Alternativ können dieselben ContentRoot-Ordner als Plattform-ZIPs
über das authentifizierte SteamPipe-Webinterface hochgeladen werden.

Beim Ersetzen einer vorhandenen Demo muss der Depot-Inhalt vollständig ersetzt
werden; ein Zusammenführen mit alten Dateien würde die Inhaltsprüfung umgehen.
Danach den resultierenden Build ausschließlich auf einer privaten Testbranch
(z. B. die vorhandene `codexstaging`) aktivieren und über Steam installieren.
Start, Musik/Texturen, Menü, Tutorial, Stage 1, Pause/Fortsetzen und das Demo-Ende
prüfen. Eine öffentliche Freigabe erfordert eine separate Nachfrage.

Ein lokal erfolgreicher Start belegt nicht automatisch die Steam-Installation
oder den Start auf anderen Betriebssystemen. Upload-/Build-ID,
Depot-Manifest-IDs und die tatsächlich durchgeführten Installationsprüfungen
müssen im Abschlussbericht einzeln dokumentiert werden.
