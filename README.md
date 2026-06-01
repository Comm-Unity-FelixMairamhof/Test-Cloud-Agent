# IoT-Wizard Temperatursteuerung PWA

Moderne mobile PWA zur Steuerung von Raumtemperaturen über ThingsBoard.

Die Anwendung nutzt die bestehende ThingsBoard-Instanz unter `https://kundenportal.iot-wizard.at` und kommuniziert direkt mit der ThingsBoard REST API. Es gibt kein eigenes Backend.

Ziel ist eine schöne, intuitive und mobile Steuerungs-App für Nutzer, die ihre Gebäude, Stockwerke, Räume und Heizkörper einfach verwalten möchten. Das Design orientiert sich am grünen, nachhaltigen Branding von `iot-wizard.at`.

## Vision

Die technische ThingsBoard-Oberfläche ist mächtig, aber für Endnutzer oft zu komplex. Diese PWA soll daraus eine einfache mobile App machen.

Nutzer sollen schnell verstehen:

- welches Gebäude sie verwalten
- welche Stockwerke vorhanden sind
- welche Räume es gibt
- welche Heizkörper aktiv sind
- welche Temperatur aktuell gemessen wird
- welche Zieltemperatur eingestellt ist
- wie sich Temperatur und Luftfeuchtigkeit entwickelt haben
- wo individuelle Einstellungen von Standardwerten abweichen

Die App soll sich wie eine moderne Smartphone-App anfühlen, aber als Web-App laufen.

## Zielgruppe

Die App richtet sich an Nutzer von IoT-Wizard Lösungen, zum Beispiel:

- `/devices/[deviceId]`
- `/devices/[deviceId]/history`
- `/settings`

## Mobile Navigation

Die App soll für Smartphones optimiert sein.

Mögliche Navigation:

- Bottom Navigation
- Breadcrumbs für Hierarchie
- Zurück-Button
- Gebäudeauswahl
- Schnellsuche
- Raumfavoriten

Beispiel-Breadcrumb:

`Gebäude > Comm-Unity Klagenfurt > Obergeschoss > Großglockner`

## UI-Komponenten

Mögliche zentrale Komponenten:

- `LoginForm`
- `BuildingCard`
- `FloorCard`
- `RoomCard`
- `DeviceCard`
- `TemperatureControl`
- `TemperatureSettingsForm`
- `TelemetryChart`
- `StatusBadge`
- `BatteryIndicator`
- `HumidityIndicator`
- `OverrideSwitch`
- `LoadingState`
- `EmptyState`
- `ErrorState`

## Statusanzeigen

Die App sollte verständliche Statusanzeigen besitzen.

Beispiele:

- Aktiv
- Offline
- Batterie niedrig
- Standardwerte aktiv
- Eigene Einstellungen aktiv
- Fenster offen
- Kindersperre aktiv

## Beispiel: Temperatur-Einstellungen

Mögliche Felder:

- Standard-Einstellungen überschreiben
- Fenster berücksichtigen
- Zieltemperatur
- Kindersperre aktiv
- Maximalwert für Zieltemperatur
- Minimalwert für Zieltemperatur
- Tagesabsenkung aktiv
- Zieltemperatur Tagesabsenkung
- Rückstelltemperatur Tagesabsenkung
- Kalenderabsenkung aktiv
- Vorheizzeit Kalenderabsenkung
- Zieltemperatur Kalenderabsenkung
- Rückstelltemperatur Kalenderabsenkung

## API-Konzept

Die App verwendet direkt die ThingsBoard REST API.

Typische Aufgaben:

- Login
  - `POST https://kundenportal.iot-wizard.at/api/auth/login`
- Aktuellen Nutzer laden
  - `GET https://kundenportal.iot-wizard.at/api/auth/user`
- Assets laden
  - `GET https://kundenportal.iot-wizard.at/api/customer/{customerId}/assets`
- Relations laden
  - `GET https://kundenportal.iot-wizard.at/api/relations`
- Attribute laden
  - `GET https://kundenportal.iot-wizard.at/api/plugins/telemetry/{entityType}/{entityId}/values/attributes`
- Attribute speichern
  - `POST https://kundenportal.iot-wizard.at/api/plugins/telemetry/{entityType}/{entityId}/SERVER_SCOPE`
- Telemetry laden
  - `GET https://kundenportal.iot-wizard.at/api/plugins/telemetry/{entityType}/{entityId}/values/timeseries`

## Wichtiges API-Verhalten

Die App muss sauber mit folgenden Fällen umgehen:

- Token abgelaufen
- Login fehlgeschlagen
- Nutzer hat keine Gebäude
- Gebäude hat keine Stockwerke
- Raum hat keine Geräte
- Gerät ist offline
- Telemetrie ist leer
- Speichern schlägt fehl
- Verbindung ist langsam
- ThingsBoard liefert unvollständige Daten

## Sicherheit

Da die App kein eigenes Backend besitzt, müssen Tokens im Frontend sorgfältig behandelt werden.

Wichtige Punkte:

- JWT nicht unnötig lange speichern
- Refresh-Token-Flow prüfen
- Logout löscht lokale Tokens
- keine sensiblen Daten hardcoden
- API-URL über Environment Variable konfigurieren
- Rollen und Berechtigungen kommen aus ThingsBoard

## Environment Variables

```env
NEXT_PUBLIC_THINGSBOARD_URL=https://kundenportal.iot-wizard.at
```

Optional später:

```env
NEXT_PUBLIC_APP_NAME=IoT-Wizard Temperatursteuerung
NEXT_PUBLIC_DEFAULT_LOCALE=de
```

## PWA-Anforderungen

Die App soll als Progressive Web App funktionieren.

Geplante Features:

- installierbar auf dem Smartphone
- App Icon
- Splash Screen
- Manifest
- responsive Layouts
- schnelle Ladezeiten
- Offline-Hinweis
- mobile-first Bedienung

## UX-Ziele

Die App soll für normale Nutzer verständlich sein.

Wichtige Prinzipien:

- keine technische ThingsBoard-Sprache in der Oberfläche
- einfache Begriffe wie Gebäude, Stockwerk, Raum, Heizkörper
- klare Temperaturanzeige
- schnelle Änderung der Zieltemperatur
- verständliche Fehlermeldungen
- klare Bestätigung nach Speichern
- schöne Diagramme
- wenig Klicks bis zur gewünschten Einstellung

## Beispiel Nutzerfluss

1. Nutzer öffnet die PWA
2. Nutzer loggt sich mit ThingsBoard-Zugangsdaten ein
3. App lädt verfügbare Gebäude
4. Nutzer wählt ein Gebäude
5. Nutzer wählt ein Stockwerk
6. Nutzer wählt einen Raum
7. Nutzer sieht aktuelle Temperatur und Zieltemperatur
8. Nutzer ändert Zieltemperatur
9. App speichert Wert über ThingsBoard API
10. App zeigt Erfolgsmeldung und aktualisierte Werte

## Beispiel: Raumdetail

```text
Raum: Großglockner
Aktuelle Temperatur: 24.12 °C
Zieltemperatur: 20 °C
Luftfeuchtigkeit: 51.95 %
Status: Aktiv
Heizkörper: Heizkörper Besprechungsraum
Diagramm: Temperaturverlauf der letzten 24 Stunden
```

## Beispiel: Gerätdetail

```text
Gerät: Heizkörper Besprechungsraum
Typ: MCLIMATE Vicki L
Status: Aktiv
Aktuelle Temperatur: 24.12 °C
Zieltemperatur: 20 °C
Luftfeuchtigkeit: 51.95 %
Batterie: 3.3 V
Kindersperre: Nein
```

## Mögliche Ordnerstruktur

```text
src
├── app
│   ├── login
│   ├── dashboard
│   ├── buildings
│   ├── rooms
│   └── devices
├── components
│   ├── ui
│   ├── layout
│   ├── temperature
│   ├── charts
│   └── entities
├── lib
│   ├── thingsboard
│   ├── auth
│   └── utils
├── hooks
├── types
└── styles
```

## Mögliche technische Module

- `lib/thingsboard/client.ts`
- `lib/thingsboard/auth.ts`
- `lib/thingsboard/assets.ts`
- `lib/thingsboard/devices.ts`
- `lib/thingsboard/relations.ts`
- `lib/thingsboard/telemetry.ts`
- `lib/thingsboard/attributes.ts`

## Prioritäten

### Phase 1

- Next.js PWA Setup
- Login über ThingsBoard
- Gebäude laden
- Stockwerke laden
- Räume laden
- Geräte anzeigen
- einfache Zieltemperatur anzeigen

### Phase 2

- Zieltemperatur setzen
- Raumdetailseite
- Gerätedetailseite
- Telemetrie laden
- Temperaturdiagramme

### Phase 3

- hierarchische Einstellungen
- Standardwerte überschreiben
- Ausnahmen pro Raum oder Gerät
- Tagesabsenkung
- Kalenderabsenkung

### Phase 4

- UI Polishing
- PWA Installation
- Offline-Hinweise
- bessere Fehlerbehandlung
- Performance-Optimierung

## Entwicklung

```bash
npm install
npm run dev
```

Die App läuft lokal unter:

`http://localhost:3000`

## Build

```bash
npm run build
npm run start
```

## Zusammenfassung

Diese PWA soll die ThingsBoard-Temperatursteuerung von IoT-Wizard in eine moderne, mobile und nutzerfreundliche App übersetzen.

Sie nutzt direkt die bestehende ThingsBoard API unter `kundenportal.iot-wizard.at`, benötigt kein eigenes Backend und bildet die reale Struktur aus Gebäude, Stockwerk, Raum und Heizkörper verständlich ab.

Das Ergebnis soll eine hochwertige Steuerungs-App sein, die optisch zum grünen IoT-Wizard-Branding passt und Nutzern eine einfache Kontrolle über Temperatur, Zielwerte und Messverläufe gibt.

- Besprechungsraum soll wärmer sein
- Lagerraum soll kühler sein
- WC soll eigene Werte haben
- ein Heizkörper soll gesperrt sein
- ein Raum soll keine Tagesabsenkung verwenden

## Diagramme

Die App soll Messwerte schön visualisieren.

Mögliche Diagramme:

- Temperaturverlauf
- Zieltemperaturverlauf
- Luftfeuchtigkeit
- Batterie
- manuelle Änderungen am Thermostat
- Heizverhalten über Zeit

Zeiträume:

- letzte 24 Stunden
- letzte 7 Tage
- letzter Monat
- eigener Zeitraum

Diagramme sollen mobil gut lesbar sein.

Beispiel für Diagrammwerte

- Temperatur
- Zieltemperatur
- Luftfeuchtigkeit
- Manuelle Temperaturänderung am Thermostat

Die Werte werden über ThingsBoard Telemetry APIs geladen.

## Geplante Seiten

- `/login`
- `/dashboard`
- `/buildings`
- `/buildings/[buildingId]`
- `/buildings/[buildingId]/floors/[floorId]`
- `/rooms/[roomId]`
- `/rooms/[roomId]/temperature`
- `/devices/[deviceId]`
- `/devices/[deviceId]/history`
- `/settings`
