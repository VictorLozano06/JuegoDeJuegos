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

## Propiedad intelectual

En Empresa / Propiedad intelectual se puede registrar una franquicia (también desde un juego publicado), consultar sus entregas e historial, y seleccionarla al iniciar un proyecto. El registro tiene un coste inicial configurable en `game.ipState.settings.registrationCost`; los demás parámetros de evolución y valoración parten de `IP_DEFAULTS` en `src/ipSystem.js`. Las estadísticas se limitan entre 0 y 100 por defecto. La calidad y los hitos de ventas o instalaciones reales afectan a la franquicia; la popularidad, prestigio, fidelidad, expectativas y saturación influyen en el potencial de ventas y el interés de próximas entregas. La saturación se reduce anualmente y la relevancia cae tras un periodo configurable de inactividad. No hay bloqueo temporal para desarrollar entregas.

La compraventa transfiere la propiedad y el dinero entre entidades con tesorerías persistentes. Los rivales actuales del ranking no son empresas con saldo propio: el mercado queda vacío hasta integrar dichas entidades, sin generar ofertas o saldos ficticios. Las IP, sus operaciones y referencias a juegos se guardan mediante el sistema de partidas existente; los guardados anteriores reciben valores predeterminados.

Pruebas del sistema (Node.js 22 o posterior):

```sh
node --no-warnings --experimental-loader ./tests/json-loader.mjs --test tests/*.test.js
```
