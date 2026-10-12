# SoundStorm-Demo — Arbeitsstand vom 12. Oktober 2026

## Originalauftrag

Original prompt:

Führe den SoundStorm-Demo-Auftrag vollständig in Work aus. Ausgangspunkt ist
der bereits angelegte GitHub-Draft-PR
https://github.com/damianuhx/soundstorm-demo/pull/1 mit
Electron-/SteamPipe-Vorbereitung. Prüfe den neuen lokalen
Electron-Vollversions-Build und übernimm dessen exakt richtiges Icon,
Verpackung/Plattform-Unterstützung und bewährte Einstellungen für die Demo.
Spielinhalt/Versionsstand sollen exakt der Webdemo auf soundstorm.uhx.ch
entsprechen (nur erster Stage, keine Vollversions-Inhalte).
Repariere/ergänze die Vorarbeit falls nötig, baue die Demo für die gewünschten
Desktop-Systeme, prüfe Start und Spielverlauf, lade die Builds authentifiziert
über SteamPipe in die DEMO-App 2284540 hoch (Windows-Depot 2284541,
macOS-Depot 2284542); keinesfalls App 2202400 der Vollversion überschreiben.
Prüfe Upload und Installation/Start. Keine öffentliche Freigabe ohne Nachfrage,
wenn sie separat nötig ist. Dokumentiere Änderungen, Build- und Upload-Status.
Falls Zugang zum lokalen Projekt oder Steam fehlt, benenne den konkreten
benötigten Zugriff.

Ergänzung im laufenden Auftrag: Linux bauen und ebenfalls privat hochladen
(Demo-Depot 2284543).

## Fertige Verpackung

- Der alte 0.8.8-Spielinhalt wurde durch den geprüften öffentlichen 0.8.11-
  Export ersetzt: alle 160 Dateien, 68.946.279 Bytes, bytegenaue SHA-256-
  Übereinstimmung mit Webdemo und Originalmanifest.
- `env.js` bleibt unverändert auf `demo`, `web`, `[1]` mit Asset-Version
  `e5036ac66b6c039d`. Stage 2–5 samt exklusiven Assets sind nicht enthalten.
- PNG, ICNS und ICO stammen unverändert aus dem Vollversions-Build
  `soundstorm-full/output/beta-20261011/icons`. Windows behält das bereits
  korrekt eingebettete Icon des Vollversions-EXE.
- Die geprüften Electron-21.1.1-x64-Laufzeiten der Vollversion wurden für
  Windows, macOS und Linux kopiert. Der vollständige Vollversions-App-Inhalt
  wurde dabei ausgeschlossen und durch die exakt geprüfte Demo ersetzt.
- Steam-Startziele bleiben `SoundStorm.exe`, `SoundStorm Demo.app` und
  `SoundStorm`, passend zur vorhandenen Demo-Konfiguration.
- Mac-Fenster 1280 × 748, Windows/Linux 1280 × 800, Original-Icon, isolierter
  Renderer und deaktivierte Node-Integration. Mac wird ad hoc neu signiert und
  mit `codesign --verify --deep --strict` geprüft.
- Die Mac-Helfer behalten ihre bestehende Namensfamilie: `CFBundleName` und
  Executable bleiben `SoundStorm`; äußerer App-Name und DisplayName sind
  `SoundStorm Demo`. Das vermeidet den beim ersten Versuch gefundenen
  Electron-Helfer-Lookup-Fehler.
- Der Electron-21-Dateiprotokoll-Handler stellt die unveränderte Webdemo unter
  dem sicheren Standard-Ursprung `soundstorm://demo/` bereit. Er unterstützt
  versionierte Browser-URLs und Cookies und sperrt private/entweichende Pfade.

## Abgeschlossene Build-Prüfungen

- Drei Plattform-Builds und deren Datei-/Runtime-/Icon-Berichte liegen in
  `dist/`. Berichte, Tests und Uploadwerkzeuge gehören nicht zum Depot-Inhalt.
- Alle drei Build-Berichte und Spielinhalte werden vor VDF-Erstellung erneut
  geprüft. Falsche App-/Depot-IDs, geänderte Dateien, zusätzliche Laufzeit-
  Dateien und nachträglich geänderte Wrapper brechen die Prüfung ab.
- Vier automatisierte Prüfungen bestanden: Electron-21-Protokoll/URL-Pfade,
  Ablehnung veränderter oder ergänzter Spielinhalte, exakte Original-Icons und
  ausschließlich Demo-Depots ohne automatische Branch-Freigabe.
- Gemeinsames VDF: `dist/steam-build/app_build_2284540_all.vdf`.

## Native Prüfungen und offene Schritte

Die native Mac-Prüfung des endgültigen Wrappers hat bereits Titel/Start,
29 Texturen, 8 Musikdateien, Menü, Tutorial mit echten Tastatureingaben,
Schilde, Pause/Fortsetzen und den Übergang in Stage 1 ohne JavaScript-Fehler
bestätigt. Der abschließende Native-Bericht bestätigt Stage 1, Act 1, Szene >=10 ohne
Renderer-Ausnahmen, lokale Ladefehler oder spätere Level-Anfragen. Weitere
native Stage-1-Steuerungs-/Screenshotprüfungen und ein nativer kompletter
Durchlauf bleiben wegen CDP-Zeitüberschreitungen unbestätigt. Alle temporären
Native-Testprozesse, Kopien und Profile wurden entfernt. Die vollständige
Demo-Ende-Prüfung wurde im Browser bestätigt.

Der Linux-Test läuft in einer x64-Emulation auf dem Mac. Dort traten
wechselnde `net::ERR_FAILED` beim Laden vorhandener Skripte auf, auch mit
resident kopierten Dateien und dem sicheren Standard-Ursprung. Dies ist kein
bestätigter erfolgreicher Linux-Spieltest; der Ursprungwechsel wird nicht als
Lösung dieses Befunds behauptet. Ein echter Windows-Start ist hier ebenfalls
noch nicht bestätigt.

Authentifizierter Upload, Steam-Build-/Depot-Manifest-IDs, private
Branch-Zuordnung und Steam-Installation/Start werden im Hauptauftrag
dokumentiert. Bis dahin wird kein Upload oder Installationserfolg behauptet.
Eine öffentliche Freigabe ist nicht autorisiert.


## Abschlussstand des Work-Auftrags

- Der unveränderte Browserinhalt wurde vollständig durchgespielt: Tutorial,
  Stage 1 mit drei Abschnitten, Mighty Mushroom, Dankbildschirm und weitere
  600 Frames mit gehaltenen Eingaben. 18.168 Frames, 1665 Punkte, keine
  Todesfälle, keine Browser-/Requestfehler und keine späteren Level-Assets.
- Finale Plattform-ZIPs im Work-Ausgabeordner wurden an sämtlichen
  Build-Hashes und ZIP-CRC geprüft. Unix-Startberechtigungen sind enthalten.
- Windows-VM wurde für den Starttest vorübergehend gestartet und anschließend
  wieder beendet. Ihr QEMU-Gastagent ist nicht installiert/erreichbar; daher
  kein bestätigter nativer Windows-Start. Bestehende Linux-VM blieb unverändert.
- Linux-Docker-Emulation wurde beendet; ihr wechselndes Skript-Ladeversagen
  erlaubt keine bestätigte native Gameplay-Prüfung.
- Steamworks ist für die Demo-App 2284540 angemeldet. Direkte SteamCMD-
  Anmeldung meldet „Cached credentials not found“ und verlangt ein Passwort.
- Der ausdrücklich zuerst gewünschte Web-Upload wurde versucht. Dateiauswahl
  ist aktuell durch die fehlende Chrome-Erweiterungsfreigabe „Allow access to
  file URLs“ gesperrt; native Dateiauswahl meldet macOS-Aufnahmefehler.
  Der Nutzer hat angekündigt, die Freigabe einzuschalten; sie ist vom
  Uploadwerkzeug bisher nicht als aktiv bestätigt. Keine Datei hochgeladen.
- Daher keine neue Steam-Build-ID, keine neuen Depot-Manifeste, keine private
  Branch-Aktivierung und keine neue Steam-Installation/Startprüfung.
  Demo default/beta bleiben im beobachteten Stand 17130127; private
  codexstaging im beobachteten Stand 24431107. Kein Zugriffsschritt adressierte
  die Vollversion zum Schreiben. Keine öffentliche Freigabe durchgeführt.
- Login- und geprüfter Demo-Uploadstarter liegen im Work-Ausgabeordner.
  Uploadstarter validiert alle finalen Pakete erneut und adressiert nur
  2284540 sowie 2284541/2/3 ohne SetLive.

Offen: wirksamer Chrome-Dateizugriff oder direkte SteamCMD-Authentifizierung;
anschließend Upload, private Zuordnung und Steam-Installation/Start prüfen.
Echter Windows-/Linux-Testzugang wird für deren native Gameplay-Prüfung benötigt.
