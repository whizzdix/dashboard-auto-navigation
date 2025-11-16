```markdown
# Dashboard Auto-Navigation

Navigiert automatisch zu einer konfigurierten Dashboard-Seite nach einer festgelegten Inaktivitätszeit.

## Funktionen

- Automatische Navigation bei Inaktivität (keine Touch- oder Mouse-Events)
- Konfigurierbar pro Dashboard
- Timeout in Sekunden einstellbar
- Ziel-URL frei wählbar

## Konfiguration

Füge die Konfiguration in der YAML-Konfiguration deines Dashboards hinzu:

```yaml
views:
  - title: Mein Dashboard
    path: home
    auto_navigation:
      timeout: 60  # Sekunden bis zur Navigation
      target_path: /lovelace/screensaver  # Ziel-URL
```

## Installation

1. Installiere die Komponente über HACS
2. Füge die Konfiguration zu deinem Dashboard hinzu
3. Lade das Frontend neu (Ctrl+F5)
```
