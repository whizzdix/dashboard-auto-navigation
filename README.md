```markdown
# Dashboard Auto-Navigation für Home Assistant

Eine HACS-Frontend-Komponente, die nach einer konfigurierbaren Inaktivitätszeit automatisch zu einer bestimmten Dashboard-Seite navigiert.

## Installation

### Via HACS (empfohlen)

1. Öffne HACS in Home Assistant
2. Gehe zu "Frontend"
3. Klicke auf das Menü (⋮) oben rechts
4. Wähle "Benutzerdefinierte Repositories"
5. Füge die URL dieses Repositories hinzu
6. Wähle Kategorie "Lovelace"
7. Klicke auf "Hinzufügen"
8. Suche nach "Dashboard Auto-Navigation" und installiere es
9. Starte Home Assistant neu

### Manuelle Installation

1. Kopiere `dist/dashboard-auto-navigation.js` nach `config/www/community/dashboard-auto-navigation/`
2. Füge die Ressource in deiner Lovelace-Konfiguration hinzu:
   ```yaml
   resources:
     - url: /hacsfiles/dashboard-auto-navigation/dashboard-auto-navigation.js
       type: module
   ```

## Konfiguration

Füge die Konfiguration direkt in der YAML-Konfiguration deines Dashboards hinzu:

```yaml
views:
  - title: Hauptansicht
    path: home
    auto_navigation:
      timeout: 60  # Sekunden Inaktivität bis zur Navigation
      target_path: /lovelace/screensaver  # Ziel-Dashboard
    cards:
      - type: entities
        entities:
          - sensor.temperature
```

### Parameter

- `timeout`: Anzahl der Sekunden Inaktivität, bevor navigiert wird (Pflichtfeld)
- `target_path`: Ziel-URL für die Navigation (Pflichtfeld)

## Beispiele

### Beispiel 1: Screensaver nach 2 Minuten
```yaml
views:
  - title: Wohnzimmer
    path: living-room
    auto_navigation:
      timeout: 120
      target_path: /lovelace/screensaver
```

### Beispiel 2: Zurück zur Hauptseite nach 30 Sekunden
```yaml
views:
  - title: Einstellungen
    path: settings
    auto_navigation:
      timeout: 30
      target_path: /lovelace/home
```

## Funktionsweise

Die Komponente überwacht folgende Events:
- Mouse-Bewegungen (`mousemove`)
- Mouse-Klicks (`mousedown`)
- Touch-Events (`touchstart`)
- Tastatur-Events (`keydown`)

Bei jedem dieser Events wird der Timer zurückgesetzt. Nach Ablauf der konfigurierten Zeit erfolgt die automatische Navigation.

## Lizenz

MIT

## Support

Bei Fragen oder Problemen erstelle bitte ein Issue auf GitHub.
```
