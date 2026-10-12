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

Die native Mac-Prüfung der unveränderten temporären Kopie des tatsächlich
von Steam installierten Builds 25882325 hat Titel/Start, 29 Texturen,
8 Musikdateien, NORMAL/CASUAL-Menüs, Tutorial mit echten Tastatureingaben,
Schilde, Pause/Fortsetzen sowie Stage 1 nach dem Intro mit Bewegung und
Schild bestätigt. Keine Renderer-/Konsolenfehler, lokalen Ladefehler,
WebGL-Kontextverluste oder späteren Level-Anfragen. Screenshots wurden
visuell geprüft; alle temporären Native-Testprozesse/Kopien/Profile entfernt.
Ein vollständiger nativer Durchlauf bleibt unbestätigt. Die vollständige
Demo-Ende-Prüfung wurde mit identischem Inhalt im Browser bestanden.

Der Linux-Test lief in einer x64-Emulation auf dem Mac. Dort traten
wechselnde `net::ERR_FAILED` beim Laden vorhandener Skripte auf, auch mit
resident kopierten Dateien und dem sicheren Standard-Ursprung. Dies ist kein
bestätigter erfolgreicher Linux-Spieltest; der Ursprungwechsel wird nicht als
Lösung dieses Befunds behauptet. Ein echter Windows-Start ist hier ebenfalls
noch nicht bestätigt.

Authentifizierter Upload und private Branch-Zuordnung sind im folgenden
Status bestätigt. Die SteamCMD-Installationen und native macOS-Prüfung sind
bestanden; native Windows-/Linux- und grafische Steam-Client-Prüfungen bleiben offen.
Eine öffentliche Freigabe ist nicht autorisiert.


## Build- und Uploadstatus des Work-Auftrags

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
- Nach direkter Anmeldung durch den Nutzer hat SteamCMD den Build 25882325
  für Demo-App 2284540 am 12.10.2026 um 14:44:18 erfolgreich abgeschlossen.
  Windows 2284541: Manifest 2099039018106072395 (237 Dateien);
  macOS 2284542: Manifest 4879303814563553486 (266 Dateien);
  Linux 2284543: Manifest 5694010941410543529 (238 Dateien).
- Steamworks bestätigt den Build ausschliesslich im privaten Branch
  `codexstaging`. Default und beta bleiben auf 17130127. Keine öffentliche
  Freigabe und keine Änderung an Vollversions-App 2202400. Bestehende
  unveröffentlichte Metadaten wurden nicht veröffentlicht.
- Alle drei aktuellen lokalen Payloads stimmen unverändert mit den finalen
  Build-Berichten überein. Steam-Builddetails bestätigen alle drei Manifeste.
- Die Chrome-Dateifreigabe funktioniert. Zuvor mehrfach gescheiterte HTTP-
  Uploads (Fehler 9, unvollständiger Dateiempfang) wurden durch den oben
  bestätigten SteamCMD-Upload abgelöst.
- Alle drei Pakete wurden aus dem privaten Branch mit SteamCMD `app_update`
  tatsächlich installiert und validiert. Steam-generierte Manifeste bestätigen
  Build 25882325, Installationsstatus 4, `codexstaging` und jeweils das richtige
  Depot/Manifest. Alle 741 Payload-Dateien sind SHA-256-/grössengenau identisch
  mit den finalen Builds; keine fehlenden/zusätzlichen/veränderten Dateien.
  Unix-Startberechtigungen sind vorhanden. Der erste reine Depot-Download-
  Versuch ohne privaten Branch-Kontext scheiterte; der korrigierte
  `app_update`-Installationslauf war erfolgreich.
- Native macOS-Start-/Spielprüfung aus einer unveränderten Kopie der Steam-
  Installation bestanden: exakter Titel/Assets, Menüs, Tutorial, Bewegung/
  Schild, Pause/Fortsetzen und Stage 1 mit Bewegung/Schild nach dem Intro.
  Keine Renderer-/Konsolenfehler, lokalen Ladefehler oder Kontextverluste.
- Normaler Start über die grafische Steam-Bibliothek ist unbestätigt, weil
  Fernbedienung am macOS-Aufnahmefehler SCStreamError -3811 scheitert.
  SteamCMD-Installation und nativer macOS-Spielstart sind getrennt bestätigt.

Offen: native Windows-/Linux-Starts und Spielverläufe. Erforderlich sind ein
nutzbares natives Windows-Testsystem (vorhandener QEMU-Gastagent fehlt) und
ein natives Linux-x64-Testsystem statt ARM-Emulation. Zusätzlicher Start über
den grafischen Steam-Client benötigt bei fortbestehendem Aufnahmefehler
direkte Bedienung. PR bleibt wegen dieser Prüfgrenzen Draft. Keine öffentliche
Freigabe durchgeführt oder ohne separaten Auftrag autorisiert.
