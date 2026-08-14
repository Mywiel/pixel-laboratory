# Pixel Laboratory

Kleines Pixel-Puzzle-Spiel mit Vanilla JavaScript und Vite.

## Entwicklung starten

Im Projektordner:

(wenn lokal daran gearbeitet und etwas verändert wird)

```
cd D:\dev\pixel-laboratory
npm run dev
```

---

## Build für mywiel.de

Für mywiel.de wird die Umgebungsvariable aus

```
.env.mywiel
```

verwendet.

Inhalt:

```
VITE_ARCADE_URL=/games/
```

Dadurch führt `BACK TO ARCADE` auf mywiel.de zurück zur Games-Seite.

Build erstellen:

```
npm run build -- --mode mywiel
```

Der fertige Build liegt anschließend unter:

```
D:\dev\pixel-laboratory\dist
```

## Build testen

Nach dem Build:

```
npm run preview
```

Dann die von Vite angezeigte lokale Adresse öffnen und testen.

---

## Pixel Laboratory in mywiel.de aktualisieren

Den **Inhalt** von:

```
D:\dev\pixel-laboratory\dist
```

nach:

```
D:\dev\mywiel-website\portal\public\games\pixel-laboratory
```

kopieren und den alten Inhalt dort ersetzen.

Danach die komplette mywiel-Website neu bauen:

```
cd D:\dev\mywiel-website\portal
npm run build
```

Der fertige Website-Build liegt dann unter:

```
D:\dev\mywiel-website\portal\dist
```

Für den Upload zu Netcup den **Inhalt dieses `dist`-Ordners** verwenden.

---

## Später: Build für pixel-arcade.de

Dafür kann eine zweite Datei angelegt werden:

```
.env.pixelarcade
```

mit:

```
VITE_ARCADE_URL=/
```

Build:

```
npm run build -- --mode pixelarcade
```

**Wichtig:** Aktuell steht in `vite.config.js` noch:

```
base: '/games/pixel-laboratory/'
```

Das passt zu mywiel.de.

Für die Veröffentlichung direkt unter `pixel-arcade.de` muss der `base`-Pfad später ebenfalls passend konfiguriert werden.

---

## Git

Änderungen speichern:

```
git add .
git commit -m "Beschreibung der Änderung"
git push
```
