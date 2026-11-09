# Validación visual de producción

En una partida de prueba aislada del navegador se creó el proyecto «Validación», con Acción, Medieval y PC. Se verificó la barra de Diseño y una redistribución al 50/29/21, el avance semanal, aportación del fundador, nóminas y deuda. La partida procedía del escenario visual creado en la fase anterior; al continuar se observó el 15 % y los valores guardados de Diseño.

Se observó el cambio a Desarrollo con Gráficos, Sonido y Mundo y contenido. Se guardó y cargó manualmente con 57 %: se conservaron los porcentajes 36/33/31, el trabajo mostrado, 11.800 de coste inicial y nóminas, y 3,5 de deuda. Se observó después el cambio a Pulido y las áreas Optimización, Corrección de errores y Refinamiento. Se guardó y cargó con 75 %, conservando 1,9 de optimización, 1,8 de QA y 4,7 de deuda.

La asignación individual de empleados no se ofrece en el flujo actual: la plantilla disponible participa automáticamente. No se ha completado una prueba visual de guardado manual desde Diseño, ni de guardado y carga del estado final, ni una publicación visual. Los cuatro estados se han probado mediante guardado automatizado, lo cual no sustituye esas comprobaciones visuales.

## Continuación y lanzamiento

El proyecto avanzó visualmente a «Proyecto listo para publicar» con 100 %, 47 semanas y las barras deshabilitadas. Se guardó como «Prueba listo» y se cargó: mantuvo ese estado, los 18.100 de coste inicial y nóminas, 6,3 de deuda y el botón de lanzamiento. Se publicó desde ese botón y apareció el informe de críticas con nota media 8,0 y el panel de ventas. La publicación se hizo en la partida de prueba. Queda pendiente la comprobación visual de guardado manual en Diseño y la selección individual de empleados, que no está disponible en el flujo actual.

## Guardado manual durante Diseño

En una partida de prueba se creó «Prueba Diseño» (Acción, Medieval, PC). Se ajustó el reparto a 50/29/21 y, en la semana de producción 8, se pausó y guardó manualmente «Prueba fase diseño». Antes de guardar se mostraban 17 % de avance, trabajo 5,5/3,2/2,3, puntos de motor 23,541280793609133 y diseño 27,54128079360915, nóminas imputadas 2.400, coste inicial más nóminas 6.400, deuda 1,1 y bugs 0,7. El historial mostraba ocho entradas y la aportación del fundador era 0,7/0,4/0,3. El calendario indicaba año 1982, mes 3, semana 2.

Se salió al menú y se cargó la partida manual. La interfaz reconstruyó los mismos valores, el historial, el fundador y su aportación. Los puntos se presentan con demasiados decimales; esto es un problema de presentación observado. La asignación individual de empleados sigue sin estar disponible.

Tras cargar «Prueba fase diseño» se reanudó a velocidad 4x y el proyecto continuó: llegó a Desarrollo, semana de producción 29 y 64 %. Al llegar a Pulido, el panel de aportación conservaba la última semana de Desarrollo pero mostraba los identificadores internos `graphics`, `sound` y `world`; es un defecto visual reproducible de la transición. No se ha repetido la prueba tras corregirlo.

Se corrigió el formato de puntos para mostrar un decimal y se resolvieron las etiquetas de aportación buscando el área en todas las fases. Vite compila después del cambio; queda pendiente repetir la comprobación visual de la transición con estos ajustes.

## Tecnología, barras y caja: validación adicional

Las pruebas `production.test.js` investigaron mediante calendario Sprites 2D (1983, 15 RP, exige texto ASCII) y Scroll Parallax (1986, 25 RP, exige sprites). Se rechazaron sprites antes de 1983 y parallax antes de 1986, y se verificó el rechazo con RP insuficientes sin gastar; ASCII (1982, 0 RP) y las tecnologías investigadas se seleccionaron antes de crear el proyecto y sobrevivieron al guardado. La selección anticipada fue rechazada sin cobrar el proyecto. No se ejecutó un proyecto completo comparativo con cada selección ni se ha probado aisladamente un requisito ausente en un año en que la tecnología ya exista.

En las tres fases se cambió una barra al 100 % tras acumular trabajo: no cambió el trabajo ya acumulado ni el registro anterior, la semana siguiente usó el nuevo reparto y el guardado/carga conservó el estado. Los tres casos son pruebas automatizadas independientes; no constituyen un único recorrido que modifique las tres fases y publique.

### Muestra de movimientos de caja

Ejecutada con 100.000 iniciales, PC y sin ventas previas; importes en dólares. La fabricación y ventas dependen de resultados aleatorios: esta muestra no se fijó con semilla. La nómina imputada es informativa y forma parte del cargo semanal, no es un cargo adicional. Las semanas entre la primera y la publicación no se detallan en esta tabla.

| Caso | Movimiento | Antes | Variación | Después | Tipo |
| --- | --- | ---: | ---: | ---: | --- |
| A autopublicación | Coste inicial | 100.000 | -4.000 | 96.000 | Caja |
| A | Gastos primera semana: nómina 300, oficina 75, servicios 25 | 96.000 | -400 | 95.600 | Caja; nómina imputada 300 |
| A | Fabricación al publicar | 77.200 | -9.341 | 67.859 | Caja |
| A | Semana posterior: ventas netas 7.188, gastos 400 | 67.859 | +6.788 | 74.647 | Caja |
| B publisher | Coste inicial y anticipo 15.000 | 100.000 | +11.000 | 111.000 | Caja |
| B | Primera semana | 111.000 | -400 | 110.600 | Caja; nómina imputada 300 |
| B | Publicación sin retraso ni fabricación propia | 92.200 | 0 | 92.200 | Caja |
| B | Semana posterior: ventas netas 6.294, gastos 400 | 92.200 | +5.894 | 98.094 | Caja |
| C publisher | Coste inicial y anticipo 15.000 | 100.000 | +11.000 | 111.000 | Caja |
| C | Primera semana | 111.000 | -400 | 110.600 | Caja; nómina imputada 300 |
| C | Penalización por 3 semanas | 90.600 | -1.500 | 89.100 | Caja |
| C | Semana posterior: ventas netas 5.994, gastos 400 | 89.100 | +5.594 | 94.694 | Caja |

Las pruebas previas comprueban cargas repetidas del anticipo y penalización una sola vez; no existe un libro detallado por movimiento para cotejar toda la vida de los tres proyectos. La muestra anterior no demuestra que todas las partidas y todos los movimientos sean correctos. Falta el desglose completo y reproducible, la comparación de saldo con el historial financiero semanal y la comprobación de cargas repetidas en todos los momentos solicitados.

## Revisión visual posterior de Pulido

Se cargó un autoguardado en Desarrollo al 64 %. Al avanzar llegó a Pulido, semana 36 y 77 %: el equipo mostró «Optimización», «Corrección de errores» y «Refinamiento» con valores 0,5; los costes mostraron 1.500 imputados en la fase y deuda 4,9. Se cambió Optimización al 50 % y las otras barras se ajustaron al 25 % cada una. Se observó el formato de puntos en Desarrollo con un decimal; no se comprobó de nuevo el panel de puntos en Pulido ni se avanzó varias semanas después de cambiar las barras.

## Rentabilidad analítica: corrección parcial

Las nóminas de producción se conservan ahora en `productionPayrollCost` y `productionCostHistory` del videojuego. El beneficio resta ese coste tanto al publicar como en el cálculo semanal de ventas, sin volver a descontarlo de caja. Los proyectos migrados sin histórico se marcan `productionCostCompleteness: incomplete`; las nóminas anteriores desconocidas no se inventan. Los gastos de oficina y servicios siguen siendo generales.

Se han probado el cargo único semanal, beneficio al publicar y tras una semana de ventas, guardado/carga de ese beneficio y el indicador de proyecto histórico incompleto. No se ha realizado todavía la conciliación completa de todos los movimientos de los escenarios A, B y C, ni se ha comparado su historial financiero íntegro en múltiples cargas. Las tablas de muestra anteriores no cubren ese requisito.
