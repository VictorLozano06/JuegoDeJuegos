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

La compraventa transfiere la propiedad y el dinero entre entidades con tesorerías persistentes. Los estudios rivales pueden registrar, desarrollar, anunciar y adquirir franquicias. Las IP, sus operaciones y referencias a juegos se guardan mediante el sistema de partidas existente; los guardados anteriores reciben valores predeterminados.

## Empresas rivales

Cada partida genera cinco estudios por defecto; `RIVAL_COMPANY_DEFAULTS.initialCount` y la opción `rivalCount` del constructor permiten ajustar la cantidad. Cada empresa conserva su identidad, plantilla, finanzas, tecnologías, proyectos, juegos e historial. Sus perfiles influyen en el riesgo, la innovación, la inversión y el uso de franquicias. La simulación semanal paga salarios, investiga, desarrolla y comercializa juegos; el ranking usa sus ventas reales. Los guardados anteriores incorporan estudios al migrarse y después conservan sus identidades. Los estudios y sus carteras son ficticios y se generan como parte de la simulación.

Pruebas del sistema (Node.js 22 o posterior):

```sh
node --no-warnings --experimental-loader ./tests/json-loader.mjs --test tests/*.test.js
```

## Finanzas e insolvencia

El panel Empresa / Finanzas muestra el saldo real, los compromisos de préstamos y los indicadores calculados semanalmente. La liquidez considera costes recurrentes, cuotas, ingresos recientes y una fracción de los activos para los que existen compradores con capacidad económica. El riesgo también incorpora saldo negativo, endeudamiento, pérdidas e impagos. Los umbrales, plazos y coeficientes son parámetros de juego en `FINANCE_DEFAULTS` de `src/financeSystem.js`; los intereses por época son aproximaciones configurables, no datos históricos de tipos bancarios.

Los préstamos tienen límites, cuotas, intereses, impagos y refinanciaciones acotadas. En dificultades se restringen inversiones; en insolvencia se bloquean más inversiones, pero se conservan las opciones de recuperación. Las fases exigen varias semanas de deterioro o recuperación. Tras una insolvencia grave sostenida sin cobertura inmediata, la simulación se detiene para revisar medidas o confirmar la bancarrota; no se liquida automáticamente. Si una medida resuelve la situación inmediata, el panel permite reanudar.

La liquidación archiva proyectos e investigación, registra deudas y pagos, preserva los juegos y el historial, y solo transfiere IP con una compraventa real. Las franquicias sin comprador y los motores y kits sin mercado permanecen en el patrimonio de liquidación; no generan dinero ficticio. La plantilla afectada pasa al mercado laboral, con indemnizaciones pagadas según fondos y obligaciones impagadas registradas. El fundador se conserva con salario cero por compatibilidad de la partida. Es posible finalizar o continuar en modo histórico; la partida no se borra.

La IA rival mantiene su propio procedimiento existente de nóminas y reestructuración, pero comparte el cálculo de liquidez para sus indicadores; no se ha sustituido su comportamiento por el del jugador. No hay aún mercado de motores o equipos ni creación de una segunda empresa tras la quiebra.

## Ejecutable para Windows

Descarga `Dev-Empire-3D-Windows.exe` desde las versiones (Releases) del repositorio y ejecútalo. Es una aplicación portátil; no necesita instalación. Para generarla localmente en Windows, ejecuta `npm ci` y `npm run dist:win`. El archivo se crea en `release/`. GitHub Actions también genera el ejecutable al ejecutar manualmente el flujo o publicar una etiqueta `v*`.
