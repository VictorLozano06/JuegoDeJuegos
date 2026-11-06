# JuegoDeJuegos

Dev Empire 3D es un juego de gestión de un estudio de videojuegos. Se ejecuta en el navegador.

## Desarrollo

Con Node.js 22.12 o posterior:

```sh
npm ci
npm run dev
```

Abre la URL que muestre Vite. El código del juego está en `src/` y la versión de Three.js que usa el juego está en `public/vendor/`.

## Compilación

```sh
npm run build
npm run preview
```

`npm run preview` sirve la compilación para probarla localmente. Para publicarla, sube el contenido de `dist/` a un alojamiento estático. Las rutas relativas permiten servir el juego también desde una subcarpeta, como la de un proyecto de GitHub Pages.
