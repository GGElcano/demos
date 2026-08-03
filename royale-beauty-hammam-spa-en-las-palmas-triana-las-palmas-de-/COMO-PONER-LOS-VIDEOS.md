# Cómo poner los vídeos de Instagram en la web

Solo hay que tocar **una lista**, al final de `index.html` (y la misma en `ar/index.html`).
Búscala por `var VIDEOS`.

## Opción 1 — enlaces de Instagram (lo más rápido)

En Instagram, abre el reel → los tres puntos → **Copiar enlace**. Pega así:

```js
var VIDEOS = [
  { instagram: "https://www.instagram.com/reel/ABC123/", portada: "assets/img4.jpg", pie: "Ritual de hammam" },
  { instagram: "https://www.instagram.com/reel/DEF456/", portada: "assets/img5.jpg", pie: "Masaje con argán" },
];
```

- `portada` es la foto que se ve antes de darle al play. Puede ser cualquiera de `assets/`.
- `pie` es opcional.
- En la versión árabe las rutas llevan `../` delante: `"../assets/img4.jpg"`.

**El vídeo NO se carga hasta que el visitante lo toca.** Así la página sigue siendo rápida y no se
descarga el código de Meta ni sus cookies sin que nadie lo haya pedido.

## Opción 2 — vídeos propios (mejor, si la dueña los pasa)

Si nos da los archivos de vídeo, se copian a `assets/` y se ponen así:

```js
var VIDEOS = [
  { archivo: "assets/reel1.mp4", portada: "assets/img4.jpg", pie: "Ritual de hammam" },
];
```

Ventajas frente a los enlaces de Instagram: **se reproducen solos, en silencio y en bucle**
como un reel de verdad, cargan mucho más rápido, no dependen de que Instagram cambie nada
y **no usan ninguna cookie**.

Conviene pasarlos a un tamaño razonable antes de subirlos (máximo 1080 px de ancho).

## Si la lista se deja vacía

La web enseña la rejilla de fotos de siempre. No se rompe nada.

## Pendiente legal

Si al final se usan **enlaces de Instagram**, hay que añadir una línea a la política de cookies
diciendo que al reproducir un vídeo se cargan cookies de Meta. Con vídeos propios no hace falta.
