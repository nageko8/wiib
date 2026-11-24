# Reproductor

Reproductor de música minimalista hecho con Electron (Windows) y React Native / Expo (Android).

Botones: Anterior · Reproducir/Pausar · Siguiente · Repetir. *Repetir* repite la canción actual en bucle (atajo `R` en escritorio).

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

## Android

El código está en `movil/` (Expo + React Native). El tema claro u oscuro se aplica solo, según el del sistema.

```bash
cd movil
npm install
npm run android   # compila e instala en un móvil/emulador conectado
npm run apk       # genera android/app/build/outputs/apk/release/app-release.apk
```

Requiere JDK 17 y el SDK de Android.

## Publicar una release

Sube una etiqueta `v*` (por ejemplo `v1.0.0`). GitHub Actions compila el `.exe` en Windows y el `.apk` de Android y los adjunta a la release.
