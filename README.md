# Reproductor

Reproductor de música minimalista hecho con Electron.

## Desarrollo

```bash
npm install
npm start
```

## Crear el .exe

```bash
npm run dist
```

Genera en `dist/` el instalador (`Reproductor Setup x.y.z.exe`) y una versión portable (`Reproductor-x.y.z-portable.exe`).

## Publicar una release

Sube una etiqueta `v*` (por ejemplo `v1.0.0`). GitHub Actions compila el `.exe` en Windows y lo adjunta a la release.
