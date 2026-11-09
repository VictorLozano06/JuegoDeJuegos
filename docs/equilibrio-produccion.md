# Comprobación inicial de equilibrio de producción

Simulación reproducible con semilla 12345, PC, motor inicial, fondos suficientes y empleados con el mismo perfil. El alcance representa `disciplineWorkloads.totalSum`; no es un tamaño configurable por el jugador.

| Caso | Personal | Alcance | Semanas | Nóminas imputadas |
| --- | ---: | ---: | ---: | ---: |
| Pequeño | 1 | 105 | 24 | 7.200 |
| Mediano | 4 | 420 | 12 | 14.400 |
| Grande | 8 | 1.260 | 14 | 33.600 |

Los tres terminaron, pero la muestra no prueba un equilibrio completo: el proyecto mediano termina antes que el pequeño por tener cuatro personas, y no se han comparado géneros, tecnologías, distintos perfiles ni distribuciones. Las nóminas son asignaciones del coste salarial existente, no cargos adicionales. Los valores de alcance se modificaron directamente para esta prueba porque la interfaz no ofrece una selección equivalente de tamaño.

## Comparación controlada de una semana

Semilla 12345, proyecto PC por defecto y un empleado. Se modifica una variable por caso directamente en el estado: son pruebas sintéticas de sensibilidad, no partidas históricas ni selecciones tecnológicas validadas. Trabajo expresado en unidades de producción; los puntos incluyen la bonificación inicial del motor.

| Caso | Motor | Jugabilidad | Historia | Esfuerzo | Deuda |
| --- | ---: | ---: | ---: | ---: | ---: |
| Base | 0,440 | 0,506 | 0,386 | 1,371 | 0,135 |
| Programador, técnica 75 | 1,212 | 0,506 | 0,386 | 1,371 | 0,135 |
| Energía 20 | 0,096 | 0,110 | 0,084 | 0,298 | 1,048 |
| Moral 20 | 0,192 | 0,221 | 0,169 | 0,600 | 0,135 |
| Estrés 90 | 0,288 | 0,332 | 0,253 | 0,900 | 0,135 |
| 100 % motor | 1,332 | 0 | 0 | 1,371 | 0,135 |
| Dos identificadores de código | 0,475 | 0,506 | 0,386 | 1,371 | 0,135 |
| Brecha con multiplicador 2 | 0,220 | 0,253 | 0,193 | 0,686 | 0,270 |

La sensibilidad es observable, pero esto no demuestra equilibrio de calidad ni duración por género o temática. La simulación inyecta tecnologías y brecha directamente, por lo que no valida sus requisitos ni demuestra que sean una selección disponible en 1982. Quedan pendientes comparaciones completas por fases, calidad final, QA, costes y distintos equipos a través de configuraciones reales.

## Pagos por hitos: propuesta pendiente

Los contratos existentes se guardan en `currentProject.publishingContract` y `acceptedOffer`; conceden anticipo al firmar y calculan la penalización por retraso al publicar. No existe una estructura de pagos por hitos ni desembolsos programados. Una ampliación debe centralizarse en el sistema contractual y almacenar por hito un identificador, condición explícita, importe, estado pendiente/pagado y semana de cumplimiento. Su procesamiento semanal debe comprobar y marcar el pago en la misma operación que actualiza fondos e historial financiero, conservando el estado en el guardado. No se ha implementado ni validado ese comportamiento.

## Doce proyectos completos: perfiles y géneros

Ejecutar `node tests/production-scenarios.mjs` para reproducir los 12 casos (semilla 12345). Todos usan PC, motor inicial, fondos suficientes, una persona, alcance predeterminado y barras predeterminadas. Se varían género, temática y perfil; los atributos del empleado se modifican en el fixture y no representan contratación real. El coste inicial es 4.000 y el coste acumulado se obtiene sumando ese importe y la nómina imputada. La salida JSON del script contiene el trabajo de las nueve áreas, puntos, bugs y deuda de cada caso.

| Género / tema | Perfil | Semanas por fase | Semanas | Nóminas | Diseño | Tecnología | Bugs | Deuda | Nota |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Acción / medieval | Generalista | 15/16/16 | 47 | 14.100 | 57,2 | 40,2 | 0,69 | 6,34 | 7,8 |
| Acción / medieval | Especialista | 15/16/16 | 47 | 14.100 | 53,1 | 59,1 | 0 | 6,34 | 8,1 |
| Acción / medieval | Junior | 23/23/24 | 70 | 21.000 | 37,2 | 27,6 | 1,82 | 12,71 | 7,4 |
| Acción / medieval | Senior | 15/16/16 | 47 | 14.100 | 89,3 | 60,4 | 0 | 6,34 | 8,3 |
| Rol / espacio | Generalista | 15/16/16 | 47 | 14.100 | 57,2 | 40,2 | 0,69 | 6,34 | 7,1 |
| Rol / espacio | Especialista | 15/16/16 | 47 | 14.100 | 53,1 | 59,1 | 0 | 6,34 | 7,5 |
| Rol / espacio | Junior | 23/23/24 | 70 | 21.000 | 37,2 | 27,6 | 1,82 | 12,71 | 6,7 |
| Rol / espacio | Senior | 15/16/16 | 47 | 14.100 | 89,3 | 60,4 | 0 | 6,34 | 7,7 |
| Estrategia / deportes | Generalista | 15/16/16 | 47 | 14.100 | 57,2 | 40,2 | 0,69 | 6,34 | 7,3 |
| Estrategia / deportes | Especialista | 15/16/16 | 47 | 14.100 | 53,1 | 59,1 | 0 | 6,34 | 7,7 |
| Estrategia / deportes | Junior | 23/23/24 | 70 | 21.000 | 37,2 | 27,6 | 1,82 | 12,71 | 6,9 |
| Estrategia / deportes | Senior | 15/16/16 | 47 | 14.100 | 89,3 | 60,4 | 0 | 6,34 | 7,8 |

La especialización aumenta el trabajo técnico; el perfil junior tarda más y acumula más deuda. Los resultados de trabajo por área son idénticos entre géneros con el mismo perfil y barras; la nota cambia por la valoración y afinidad. No se compararon tecnologías avanzadas, distribuciones alternativas ni composiciones de varios empleados en estos doce ciclos; falta medir eficiencia y riesgos de lanzamiento por escenario.

## Comparaciones completas adicionales

Se ejecutaron 11 proyectos completos con `node tests/production-comparisons.mjs`, semilla 12345, Acción/Medieval, PC, motor inicial, mismos fondos y alcance. El script imprime las nueve áreas, puntos, bugs, deuda y nota. Los perfiles, tecnologías y distribuciones se inyectan en el estado después de iniciar el proyecto para aislar variables: **no validan desbloqueos, costes tecnológicos ni disponibilidad histórica**. Cada combinación usa una sola repetición.

| Caso | Semanas (fases) | Nóminas | Trabajo motor | Diseño / tecnología | Bugs / deuda | Nota |
| --- | --- | ---: | ---: | --- | --- | ---: |
| Tecnología básica | 47 (15/16/16) | 14.100 | 6,85 | 57,20 / 40,19 | 0,69 / 6,34 | 7,8 |
| Un módulo de código | 47 (15/16/16) | 14.100 | 7,13 | 57,20 / 40,76 | 0,69 / 6,34 | 7,8 |
| Dos módulos de código | 47 (15/16/16) | 14.100 | 7,40 | 57,20 / 41,33 | 0,69 / 6,34 | 7,8 |
| Reparto equilibrado | 47 (15/16/16) | 14.100 | 7,06 | 56,99 / 40,40 | 0,69 / 6,34 | 7,8 |
| Solo motor en Diseño | 47 (15/16/16) | 14.100 | 20,76 | 43,29 / 54,10 | 0,69 / 6,34 | 7,8 |
| Dos áreas en Diseño | 47 (15/16/16) | 14.100 | 10,38 | 53,67 / 43,72 | 0,69 / 6,34 | 7,8 |
| Reparto distinto por fase | 47 (15/16/16) | 14.100 | 7,06 | 48,87 / 42,63 | 0 / 6,34 | 7,7 |
| Una persona | 47 (15/16/16) | 14.100 | 6,85 | 57,20 / 40,19 | 0,69 / 6,34 | 7,8 |
| Cuatro generalistas | 12 (4/4/4) | 14.400 | 7,41 | 59,12 / 41,32 | 0,56 / 1,62 | 8,0 |
| Cuatro complementarios | 12 (4/4/4) | 14.400 | 7,88 | 59,12 / 42,79 | 0,42 / 1,62 | 8,1 |
| Cuatro desiguales | 12 (4/4/4) | 14.400 | 8,48 | 64,46 / 44,68 | 0,24 / 1,62 | 8,2 |

Todos los casos tienen coste inicial de 4.000. Las pruebas detectan que la duración no cambia al variar distribución o habilidades con igual velocidad, y que los tres repartos de Diseño obtienen la misma nota redondeada pese a la diferencia de trabajo. No se ha demostrado si esto está equilibrado en un abanico amplio de proyectos. Los casos tecnológicos no representan una selección real validada, y la prueba no verifica la conservación del trabajo al cambiar barras a mitad de fase.

## Comparación histórica con selección válida

`node tests/historical-production-scenarios.mjs` prepara una misma partida en 1983 avanzando el calendario e investigando sprites por 15 RP. Guarda esa partida y la carga por separado para cada proyecto; utiliza semilla 12345 tras cargar. Se comparan ASCII contra ASCII + sprites con el mismo estado inicial, Acción/Medieval y PC. Ambos parten de haber pagado los 15 RP de investigación; no se ha medido el coste de oportunidad de investigarla. Se muestran costes del proyecto como inicial + nóminas imputadas, sin sumar nuevamente esas nóminas a caja.

| Selección | Semanas (fases) | Diseño | Tecnología | Bugs | Deuda | Nota prensa | Inicial + nóminas | Saldo tras publicación |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ASCII | 47 (15/16/16) | 57,26 | 40,54 | 0,70 | 6,34 | 7,3 | 18.100 | 25.353 |
| ASCII + sprites | 48 (16/16/16) | 57,82 | 41,08 | 0,85 | 8,48 | 7,3 | 18.400 | 24.953 |

El script imprime el trabajo completo por área. La fabricación costó 6.847 en cada caso. La mayor deuda inicial de sprites contribuyó a una semana más en la muestra. No hay nota de usuarios en los datos obtenidos. Parallax (1986) se validó para investigación y selección en pruebas, pero falta completar una comparación a la misma fecha; estos dos casos no justifican generalizaciones sobre todas las tecnologías.

## Requisito previo en fecha válida

La prueba automatizada `parallax en 1986 exige sprites antes de investigar y seleccionar` avanza de forma normal a 1986 sin sprites. El estado indica requisito ausente, investigación y proyecto se rechazan sin gastar RP o fondos; después se investigan sprites (15 RP) y parallax (25 RP) a través del calendario y el desbloqueo sobrevive al guardado y carga.

## Límite contable detectado

El historial financiero actual conserva agregados semanales, no un registro desglosado de cada cargo con su identificador de proyecto. Además, al publicar se copia `devCostTotal` como `game.devCost`, mientras las nóminas imputadas se mantienen en `project.production.costs.payroll`; por ello el beneficio del juego no incorpora esas nóminas imputadas. El saldo del estudio sí las descuenta semanalmente. Esta discrepancia impide declarar conciliado el resultado económico del juego. No se ha cambiado el cálculo contable en esta validación.

## Comparación en 1986 con Parallax

`node tests/historical-parallax-scenarios.mjs` prepara una sola partida, avanza el calendario e investiga sprites (15 RP) y parallax (25 RP), después guarda y carga la misma base para cada caso. La partida de ensayo recibe un saldo inicial configurado de 1.000.000 para sobrevivir los años sin publicar; esto es un fixture económico, no una condición inicial normal. Semilla 12345 desde cada carga. Todas las selecciones se hicieron antes de iniciar el proyecto con el validador real.

| Selección | Semanas (fases) | Diseño / tecnología | Bugs / deuda | Nota | Coste inicial / nóminas / fabricación | Beneficio al publicar |
| --- | --- | --- | --- | ---: | --- | ---: |
| ASCII | 47 (15/16/16) | 57,26 / 40,54 | 0,70 / 6,34 | 8,2 | 4.000 / 14.100 / 16.700 | -34.800 |
| ASCII + sprites | 48 (16/16/16) | 57,82 / 41,08 | 0,85 / 8,48 | 8,2 | 4.000 / 14.400 / 16.700 | -35.100 |
| ASCII + sprites + parallax | 48 (16/16/16) | 57,14 / 40,94 | 0,95 / 12,48 | 7,9 | 4.000 / 14.400 / 14.556 | -32.956 |

Beneficio medido inmediatamente al publicar, antes de ventas. El script imprime las nueve áreas. La misma base ya había invertido 40 RP para investigar las tecnologías, por lo que no compara el coste de oportunidad de investigar. No se ha observado nota de usuarios en esta salida.


## Conciliación semanal reproducible

Escenarios A/B/C anteriores: fondos iniciales 100.000, PC, autopublicación o anticipo, y C publica tres semanas después del vencimiento. Semilla 12345. El programa `node tests/production-reconciliation.mjs` compara la ejecución continua con guardado y carga al entrar en cada fase, antes y después de publicar. La semilla se conserva en el arnés durante las reconstrucciones; el juego no guarda por sí mismo el estado aleatorio. Se comparan los historiales de finanzas y producción al cargar. Los costes de oficina y servicios son generales; la imputación de nómina no es un segundo movimiento de caja.

### Escenario A

| Semana | Concepto | Saldo anterior | Caja neta | Saldo posterior | Nómina / oficina / servicios | Ventas netas | Nómina imputada |
| ---: | --- | ---: | ---: | ---: | --- | ---: | ---: |
| 1 | inicio | 100000 | -4000 | 96000 | 0 / 0 / 0 | 0 | 0 |
| 2 | semana | 96000 | -400 | 95600 | 300 / 75 / 25 | 0 | 300 |
| 3 | semana | 95600 | -400 | 95200 | 300 / 75 / 25 | 0 | 300 |
| 4 | semana | 95200 | -400 | 94800 | 300 / 75 / 25 | 0 | 300 |
| 5 | semana | 94800 | -400 | 94400 | 300 / 75 / 25 | 0 | 300 |
| 6 | semana | 94400 | -400 | 94000 | 300 / 75 / 25 | 0 | 300 |
| 7 | semana | 94000 | -400 | 93600 | 300 / 75 / 25 | 0 | 300 |
| 8 | semana | 93600 | -400 | 93200 | 300 / 75 / 25 | 0 | 300 |
| 9 | semana | 93200 | -400 | 92800 | 300 / 75 / 25 | 0 | 300 |
| 10 | semana | 92800 | -400 | 92400 | 300 / 75 / 25 | 0 | 300 |
| 11 | semana | 92400 | -400 | 92000 | 300 / 75 / 25 | 0 | 300 |
| 12 | semana | 92000 | -400 | 91600 | 300 / 75 / 25 | 0 | 300 |
| 13 | semana | 91600 | -400 | 91200 | 300 / 75 / 25 | 0 | 300 |
| 14 | semana | 91200 | -400 | 90800 | 300 / 75 / 25 | 0 | 300 |
| 15 | semana | 90800 | -400 | 90400 | 300 / 75 / 25 | 0 | 300 |
| 16 | semana | 90400 | -400 | 90000 | 300 / 75 / 25 | 0 | 300 |
| 17 | semana | 90000 | -400 | 89600 | 300 / 75 / 25 | 0 | 300 |
| 18 | semana | 89600 | -400 | 89200 | 300 / 75 / 25 | 0 | 300 |
| 19 | semana | 89200 | -400 | 88800 | 300 / 75 / 25 | 0 | 300 |
| 20 | semana | 88800 | -400 | 88400 | 300 / 75 / 25 | 0 | 300 |
| 21 | semana | 88400 | -400 | 88000 | 300 / 75 / 25 | 0 | 300 |
| 22 | semana | 88000 | -400 | 87600 | 300 / 75 / 25 | 0 | 300 |
| 23 | semana | 87600 | -400 | 87200 | 300 / 75 / 25 | 0 | 300 |
| 24 | semana | 87200 | -400 | 86800 | 300 / 75 / 25 | 0 | 300 |
| 25 | semana | 86800 | -400 | 86400 | 300 / 75 / 25 | 0 | 300 |
| 26 | semana | 86400 | -400 | 86000 | 300 / 75 / 25 | 0 | 300 |
| 27 | semana | 86000 | -400 | 85600 | 300 / 75 / 25 | 0 | 300 |
| 28 | semana | 85600 | -400 | 85200 | 300 / 75 / 25 | 0 | 300 |
| 29 | semana | 85200 | -400 | 84800 | 300 / 75 / 25 | 0 | 300 |
| 30 | semana | 84800 | -400 | 84400 | 300 / 75 / 25 | 0 | 300 |
| 31 | semana | 84400 | -400 | 84000 | 300 / 75 / 25 | 0 | 300 |
| 32 | semana | 84000 | -400 | 83600 | 300 / 75 / 25 | 0 | 300 |
| 33 | semana | 83600 | -400 | 83200 | 300 / 75 / 25 | 0 | 300 |
| 34 | semana | 83200 | -400 | 82800 | 300 / 75 / 25 | 0 | 300 |
| 35 | semana | 82800 | -400 | 82400 | 300 / 75 / 25 | 0 | 300 |
| 36 | semana | 82400 | -400 | 82000 | 300 / 75 / 25 | 0 | 300 |
| 37 | semana | 82000 | -400 | 81600 | 300 / 75 / 25 | 0 | 300 |
| 38 | semana | 81600 | -400 | 81200 | 300 / 75 / 25 | 0 | 300 |
| 39 | semana | 81200 | -400 | 80800 | 300 / 75 / 25 | 0 | 300 |
| 40 | semana | 80800 | -400 | 80400 | 300 / 75 / 25 | 0 | 300 |
| 41 | semana | 80400 | -400 | 80000 | 300 / 75 / 25 | 0 | 300 |
| 42 | semana | 80000 | -400 | 79600 | 300 / 75 / 25 | 0 | 300 |
| 43 | semana | 79600 | -400 | 79200 | 300 / 75 / 25 | 0 | 300 |
| 44 | semana | 79200 | -400 | 78800 | 300 / 75 / 25 | 0 | 300 |
| 45 | semana | 78800 | -400 | 78400 | 300 / 75 / 25 | 0 | 300 |
| 46 | semana | 78400 | -400 | 78000 | 300 / 75 / 25 | 0 | 300 |
| 47 | semana | 78000 | -400 | 77600 | 300 / 75 / 25 | 0 | 300 |
| 48 | semana | 77600 | -400 | 77200 | 300 / 75 / 25 | 0 | 300 |
| 48 | publicación | 77200 | -7821 | 69379 | 0 / 0 / 0 | 0 | 0 |
| 49 | ventas | 69379 | 5540 | 74919 | 300 / 75 / 25 | 5940 | 0 |
| 50 | ventas | 74919 | 7532 | 82451 | 300 / 75 / 25 | 7932 | 0 |
| 51 | ventas | 82451 | 6260 | 88711 | 300 / 75 / 25 | 6660 | 0 |

Caja: 100.000 + 19332 - 30621 = 88711; diferencia 0. Inicial del juego 4.000; nóminas imputadas 14100; ingresos netos de ventas 20532; anticipo 0; multa 0; fabricación 7821; beneficio analítico -5389. El movimiento de inicio agrupa coste inicial y anticipo; la publicación agrupa fabricación y multa. No hay libro de movimientos detallado por proyecto: estas filas se reconstruyen del flujo de caja observado y los costes semanales existentes.

### Escenario B

| Semana | Concepto | Saldo anterior | Caja neta | Saldo posterior | Nómina / oficina / servicios | Ventas netas | Nómina imputada |
| ---: | --- | ---: | ---: | ---: | --- | ---: | ---: |
| 1 | inicio | 100000 | 11000 | 111000 | 0 / 0 / 0 | 0 | 0 |
| 2 | semana | 111000 | -400 | 110600 | 300 / 75 / 25 | 0 | 300 |
| 3 | semana | 110600 | -400 | 110200 | 300 / 75 / 25 | 0 | 300 |
| 4 | semana | 110200 | -400 | 109800 | 300 / 75 / 25 | 0 | 300 |
| 5 | semana | 109800 | -400 | 109400 | 300 / 75 / 25 | 0 | 300 |
| 6 | semana | 109400 | -400 | 109000 | 300 / 75 / 25 | 0 | 300 |
| 7 | semana | 109000 | -400 | 108600 | 300 / 75 / 25 | 0 | 300 |
| 8 | semana | 108600 | -400 | 108200 | 300 / 75 / 25 | 0 | 300 |
| 9 | semana | 108200 | -400 | 107800 | 300 / 75 / 25 | 0 | 300 |
| 10 | semana | 107800 | -400 | 107400 | 300 / 75 / 25 | 0 | 300 |
| 11 | semana | 107400 | -400 | 107000 | 300 / 75 / 25 | 0 | 300 |
| 12 | semana | 107000 | -400 | 106600 | 300 / 75 / 25 | 0 | 300 |
| 13 | semana | 106600 | -400 | 106200 | 300 / 75 / 25 | 0 | 300 |
| 14 | semana | 106200 | -400 | 105800 | 300 / 75 / 25 | 0 | 300 |
| 15 | semana | 105800 | -400 | 105400 | 300 / 75 / 25 | 0 | 300 |
| 16 | semana | 105400 | -400 | 105000 | 300 / 75 / 25 | 0 | 300 |
| 17 | semana | 105000 | -400 | 104600 | 300 / 75 / 25 | 0 | 300 |
| 18 | semana | 104600 | -400 | 104200 | 300 / 75 / 25 | 0 | 300 |
| 19 | semana | 104200 | -400 | 103800 | 300 / 75 / 25 | 0 | 300 |
| 20 | semana | 103800 | -400 | 103400 | 300 / 75 / 25 | 0 | 300 |
| 21 | semana | 103400 | -400 | 103000 | 300 / 75 / 25 | 0 | 300 |
| 22 | semana | 103000 | -400 | 102600 | 300 / 75 / 25 | 0 | 300 |
| 23 | semana | 102600 | -400 | 102200 | 300 / 75 / 25 | 0 | 300 |
| 24 | semana | 102200 | -400 | 101800 | 300 / 75 / 25 | 0 | 300 |
| 25 | semana | 101800 | -400 | 101400 | 300 / 75 / 25 | 0 | 300 |
| 26 | semana | 101400 | -400 | 101000 | 300 / 75 / 25 | 0 | 300 |
| 27 | semana | 101000 | -400 | 100600 | 300 / 75 / 25 | 0 | 300 |
| 28 | semana | 100600 | -400 | 100200 | 300 / 75 / 25 | 0 | 300 |
| 29 | semana | 100200 | -400 | 99800 | 300 / 75 / 25 | 0 | 300 |
| 30 | semana | 99800 | -400 | 99400 | 300 / 75 / 25 | 0 | 300 |
| 31 | semana | 99400 | -400 | 99000 | 300 / 75 / 25 | 0 | 300 |
| 32 | semana | 99000 | -400 | 98600 | 300 / 75 / 25 | 0 | 300 |
| 33 | semana | 98600 | -400 | 98200 | 300 / 75 / 25 | 0 | 300 |
| 34 | semana | 98200 | -400 | 97800 | 300 / 75 / 25 | 0 | 300 |
| 35 | semana | 97800 | -400 | 97400 | 300 / 75 / 25 | 0 | 300 |
| 36 | semana | 97400 | -400 | 97000 | 300 / 75 / 25 | 0 | 300 |
| 37 | semana | 97000 | -400 | 96600 | 300 / 75 / 25 | 0 | 300 |
| 38 | semana | 96600 | -400 | 96200 | 300 / 75 / 25 | 0 | 300 |
| 39 | semana | 96200 | -400 | 95800 | 300 / 75 / 25 | 0 | 300 |
| 40 | semana | 95800 | -400 | 95400 | 300 / 75 / 25 | 0 | 300 |
| 41 | semana | 95400 | -400 | 95000 | 300 / 75 / 25 | 0 | 300 |
| 42 | semana | 95000 | -400 | 94600 | 300 / 75 / 25 | 0 | 300 |
| 43 | semana | 94600 | -400 | 94200 | 300 / 75 / 25 | 0 | 300 |
| 44 | semana | 94200 | -400 | 93800 | 300 / 75 / 25 | 0 | 300 |
| 45 | semana | 93800 | -400 | 93400 | 300 / 75 / 25 | 0 | 300 |
| 46 | semana | 93400 | -400 | 93000 | 300 / 75 / 25 | 0 | 300 |
| 47 | semana | 93000 | -400 | 92600 | 300 / 75 / 25 | 0 | 300 |
| 48 | semana | 92600 | -400 | 92200 | 300 / 75 / 25 | 0 | 300 |
| 48 | publicación | 92200 | 0 | 92200 | 0 / 0 / 0 | 0 | 0 |
| 49 | ventas | 92200 | 6212 | 98412 | 300 / 75 / 25 | 6612 | 0 |
| 50 | ventas | 98412 | 8414 | 106826 | 300 / 75 / 25 | 8814 | 0 |
| 51 | ventas | 106826 | 6998 | 113824 | 300 / 75 / 25 | 7398 | 0 |

Caja: 100.000 + 32624 - 18800 = 113824; diferencia 0. Inicial del juego 4.000; nóminas imputadas 14100; ingresos netos de ventas 22824; anticipo 15000; multa 0; fabricación 0; beneficio analítico 19724. El movimiento de inicio agrupa coste inicial y anticipo; la publicación agrupa fabricación y multa. No hay libro de movimientos detallado por proyecto: estas filas se reconstruyen del flujo de caja observado y los costes semanales existentes.

### Escenario C

| Semana | Concepto | Saldo anterior | Caja neta | Saldo posterior | Nómina / oficina / servicios | Ventas netas | Nómina imputada |
| ---: | --- | ---: | ---: | ---: | --- | ---: | ---: |
| 1 | inicio | 100000 | 11000 | 111000 | 0 / 0 / 0 | 0 | 0 |
| 2 | semana | 111000 | -400 | 110600 | 300 / 75 / 25 | 0 | 300 |
| 3 | semana | 110600 | -400 | 110200 | 300 / 75 / 25 | 0 | 300 |
| 4 | semana | 110200 | -400 | 109800 | 300 / 75 / 25 | 0 | 300 |
| 5 | semana | 109800 | -400 | 109400 | 300 / 75 / 25 | 0 | 300 |
| 6 | semana | 109400 | -400 | 109000 | 300 / 75 / 25 | 0 | 300 |
| 7 | semana | 109000 | -400 | 108600 | 300 / 75 / 25 | 0 | 300 |
| 8 | semana | 108600 | -400 | 108200 | 300 / 75 / 25 | 0 | 300 |
| 9 | semana | 108200 | -400 | 107800 | 300 / 75 / 25 | 0 | 300 |
| 10 | semana | 107800 | -400 | 107400 | 300 / 75 / 25 | 0 | 300 |
| 11 | semana | 107400 | -400 | 107000 | 300 / 75 / 25 | 0 | 300 |
| 12 | semana | 107000 | -400 | 106600 | 300 / 75 / 25 | 0 | 300 |
| 13 | semana | 106600 | -400 | 106200 | 300 / 75 / 25 | 0 | 300 |
| 14 | semana | 106200 | -400 | 105800 | 300 / 75 / 25 | 0 | 300 |
| 15 | semana | 105800 | -400 | 105400 | 300 / 75 / 25 | 0 | 300 |
| 16 | semana | 105400 | -400 | 105000 | 300 / 75 / 25 | 0 | 300 |
| 17 | semana | 105000 | -400 | 104600 | 300 / 75 / 25 | 0 | 300 |
| 18 | semana | 104600 | -400 | 104200 | 300 / 75 / 25 | 0 | 300 |
| 19 | semana | 104200 | -400 | 103800 | 300 / 75 / 25 | 0 | 300 |
| 20 | semana | 103800 | -400 | 103400 | 300 / 75 / 25 | 0 | 300 |
| 21 | semana | 103400 | -400 | 103000 | 300 / 75 / 25 | 0 | 300 |
| 22 | semana | 103000 | -400 | 102600 | 300 / 75 / 25 | 0 | 300 |
| 23 | semana | 102600 | -400 | 102200 | 300 / 75 / 25 | 0 | 300 |
| 24 | semana | 102200 | -400 | 101800 | 300 / 75 / 25 | 0 | 300 |
| 25 | semana | 101800 | -400 | 101400 | 300 / 75 / 25 | 0 | 300 |
| 26 | semana | 101400 | -400 | 101000 | 300 / 75 / 25 | 0 | 300 |
| 27 | semana | 101000 | -400 | 100600 | 300 / 75 / 25 | 0 | 300 |
| 28 | semana | 100600 | -400 | 100200 | 300 / 75 / 25 | 0 | 300 |
| 29 | semana | 100200 | -400 | 99800 | 300 / 75 / 25 | 0 | 300 |
| 30 | semana | 99800 | -400 | 99400 | 300 / 75 / 25 | 0 | 300 |
| 31 | semana | 99400 | -400 | 99000 | 300 / 75 / 25 | 0 | 300 |
| 32 | semana | 99000 | -400 | 98600 | 300 / 75 / 25 | 0 | 300 |
| 33 | semana | 98600 | -400 | 98200 | 300 / 75 / 25 | 0 | 300 |
| 34 | semana | 98200 | -400 | 97800 | 300 / 75 / 25 | 0 | 300 |
| 35 | semana | 97800 | -400 | 97400 | 300 / 75 / 25 | 0 | 300 |
| 36 | semana | 97400 | -400 | 97000 | 300 / 75 / 25 | 0 | 300 |
| 37 | semana | 97000 | -400 | 96600 | 300 / 75 / 25 | 0 | 300 |
| 38 | semana | 96600 | -400 | 96200 | 300 / 75 / 25 | 0 | 300 |
| 39 | semana | 96200 | -400 | 95800 | 300 / 75 / 25 | 0 | 300 |
| 40 | semana | 95800 | -400 | 95400 | 300 / 75 / 25 | 0 | 300 |
| 41 | semana | 95400 | -400 | 95000 | 300 / 75 / 25 | 0 | 300 |
| 42 | semana | 95000 | -400 | 94600 | 300 / 75 / 25 | 0 | 300 |
| 43 | semana | 94600 | -400 | 94200 | 300 / 75 / 25 | 0 | 300 |
| 44 | semana | 94200 | -400 | 93800 | 300 / 75 / 25 | 0 | 300 |
| 45 | semana | 93800 | -400 | 93400 | 300 / 75 / 25 | 0 | 300 |
| 46 | semana | 93400 | -400 | 93000 | 300 / 75 / 25 | 0 | 300 |
| 47 | semana | 93000 | -400 | 92600 | 300 / 75 / 25 | 0 | 300 |
| 48 | semana | 92600 | -400 | 92200 | 300 / 75 / 25 | 0 | 300 |
| 49 | espera | 92200 | -400 | 91800 | 300 / 75 / 25 | 0 | 0 |
| 50 | espera | 91800 | -400 | 91400 | 300 / 75 / 25 | 0 | 0 |
| 51 | espera | 91400 | -400 | 91000 | 300 / 75 / 25 | 0 | 0 |
| 52 | espera | 91000 | -400 | 90600 | 300 / 75 / 25 | 0 | 0 |
| 52 | publicación | 90600 | -1500 | 89100 | 0 / 0 / 0 | 0 | 0 |
| 53 | ventas | 89100 | 6212 | 95312 | 300 / 75 / 25 | 6612 | 0 |
| 54 | ventas | 95312 | 8414 | 103726 | 300 / 75 / 25 | 8814 | 0 |
| 55 | ventas | 103726 | 7004 | 110730 | 300 / 75 / 25 | 7404 | 0 |

Caja: 100.000 + 32630 - 21900 = 110730; diferencia 0. Inicial del juego 4.000; nóminas imputadas 14100; ingresos netos de ventas 22830; anticipo 15000; multa 1500; fabricación 0; beneficio analítico 18230. El movimiento de inicio agrupa coste inicial y anticipo; la publicación agrupa fabricación y multa. No hay libro de movimientos detallado por proyecto: estas filas se reconstruyen del flujo de caja observado y los costes semanales existentes.

## Interpretación del ensayo tecnológico

Los nodos históricos aportan deuda base al crear el proyecto: ASCII 0, sprites 2 y parallax 4. Esa deuda alimenta el modelo de fricción y regresiones y puede alargar el desarrollo. El cálculo semanal concede hasta un 4 % por identificador de categoría gráfica a la producción de gráficos; suma identificadores seleccionados y limita el incremento al 30 %. No hay en ese cálculo una brecha específica entre habilidades individuales y tecnología: la capacidad del equipo y la deuda actúan por separado. La nota también depende de puntos, deuda, bugs y otros factores. Por ello un resultado peor con más tecnología es posible, pero esta comparación no permite cuantificar de forma aislada cada factor ni afirmar que el equilibrio es correcto.

### Limitación del historial financiero

`weeklyHistory` almacena saldo, ingresos de ventas, gastos estimados y flujo por semana, no movimientos individuales. El anticipo y el coste inicial ocurren entre cierres y pueden quedar agregados en el mismo flujo que los gastos semanales. Las tablas anteriores comparan íntegramente los registros existentes antes y después de cargar y reconstruyen los conceptos desde los costes observados; no prueban un libro detallado inexistente ni constituyen una conciliación independiente de cada movimiento. Las fechas de la tabla son el número de semana de industria, no una fecha de calendario desglosada.

# Fase 11: estado de la validación

## Validación visual completa

**Parcial.** Se creó el proyecto nuevo «Validación integral», Acción/Medieval para PC. En Diseño, una primera manipulación de la barra falló porque el control se volvió a renderizar; tras pausar se ajustó el reparto a 50/26/24 y se guardó manualmente «Prueba integral diseño». Tras salir al menú y cargar se conservaron el reparto, semana 1, trabajo 0,5/0,5/0,4, coste inicial y nóminas 4.300, deuda 0,1 y bugs 0,1. Al continuar, en semana 9 se observaron 6,0/3,4/3,1 de trabajo y 6.700 de coste inicial y nóminas. No se obtuvo el reparto exacto 50/25/25 en este recorrido.

## Conciliación económica

**Verificado mediante simulación:** el arnés `tests/production-reconciliation.mjs` volvió a ejecutar A/B/C con y sin cargas y sus comprobaciones pasaron. Las tablas reconstruidas y condiciones figuran arriba. No son un libro de movimientos: `financeState.weeklyHistory` guarda flujo, saldo, ingresos y gastos agregados del estudio. En el proyecto se almacenan `devCostTotal`, `production.costs.payroll`, `production.history` (nóminas y aportaciones), `offerRevenue`, `marketingCostTotal` y el contrato. En el juego publicado se guardan `devCost`, `productionPayrollCost`, `productionCostHistory`, `upfrontOfferRevenue`, `contractLatePenalty`, `physicalManufacturingCost`, `revenueTotal` y `profit`. El beneficio se calcula a partir de esos valores; oficina y servicios permanecen generales. Las filas semanales detalladas de A/B/C se reconstruyen de saldos y costes observados, no se almacenan como asientos individuales en el juego.

**Limitación histórica:** proyectos migrados sin historial anterior se marcan `productionCostCompleteness: incomplete` y no reciben nóminas inventadas, pero la interfaz no muestra esa marca junto al beneficio. Los juegos antiguos sin ese campo tampoco quedan identificados de forma explícita. No se puede afirmar que el jugador vea advertido el carácter incompleto.

## Auditoría tecnológica

**Inspección de código y pruebas existentes:** la selección consulta `TechTreeManager.validateSelection`, que revisa catálogo, año, desbloqueo y prerequisitos. `startTechResearch` verifica estado, RP y exclusión de otra investigación, descuenta RP al iniciar y el calendario completa el desbloqueo. Al crear el proyecto se suman las deudas base de los IDs históricos seleccionados, multiplicadas por la incompatibilidad entre eras; no se observó una tarifa de adopción adicional para esos nodos. El trabajo semanal cuenta identificadores que contienen `graphics`, `audio` o `code` para bonificar el área correspondiente un 4 % por ID hasta el 30 %. No es un análisis semántico de cada tecnología. La deuda y su fricción afectan a la velocidad y pueden causar regresiones; la deuda inicial y bugs afectan a la calidad. El modelo de deuda del DAG también compara la técnica media del equipo con el nivel de un nodo de alcance activo; esto es distinto de una comparación específica entre cada tecnología histórica y las habilidades individuales. No existe esa segunda comparación específica.

## Limitaciones conocidas

**No comprobado en esta fase:** ciclo visual completo nuevo hasta publicación, cambios y tres semanas de observación en Desarrollo y Pulido, y cargas visuales de esas fases en el mismo proyecto. La prueba visual no cumple todos los criterios solicitados. **No implementado:** pagos por hitos y asignación individual de empleados. No se ha modificado el motor tecnológico ni creado un segundo sistema financiero.

En el mismo proyecto nuevo se observó la transición a Desarrollo: en la semana de producción 29, con trabajo acumulado 6,4/5,9/5,5, se ajustaron las barras al 60/21/19 y los valores acumulados permanecieron visibles. No se observaron tres semanas posteriores a ese ajuste ni se completaron los guardados de Desarrollo y Pulido en este recorrido. La interfaz de historial muestra semana, fase, avance, trabajo, nómina y bugs, pero no expone la distribución guardada en cada entrada; no se ha validado visualmente ese dato.

## Fase 13: comprobación visual adicional

**Validado visualmente:** se recuperó «Validación integral» en Desarrollo, semana 29, con 36/33/31; el cambio previo 60/21/19 no estaba en el autoguardado. Al pausar ya había llegado a Pulido, semana 32. Se ajustó Pulido a 60/20/20 y se observaron 14 semanas de producción adicionales: en semana 46 mostraba trabajo 11,4/3,8/3,8, bugs 1,7, deuda 6,2 y coste inicial más nóminas 17.800. Se guardó y cargó «Fase13 pulido» con esos valores. Posteriormente llegó a 100 % en semana 48 y se publicó, con nota 7,8 y beneficio inicial -26.749. Tras 12 semanas de ventas se mostraron ingresos netos 37.152 y beneficio 10.403; se guardó y cargó «Fase13 ventas» con esas cifras.

**No comprobado visualmente:** tres semanas después de un cambio en Desarrollo, guardado/carga específico de Desarrollo en esta sesión, la visualización de distribuciones antiguas en el historial, y los dos avisos de histórico incompleto y no verificado. El caso completo se había revisado en el panel de ventas, pero no se revisaron los tres casos históricos en ambos lugares. Las pruebas automatizadas del indicador no sustituyen esa revisión. El proyecto es el mismo que se guardó en Diseño en una sesión anterior; no se inició desde Diseño en esta sesión.

**Pruebas automatizadas:** 110 superadas; las 35 específicas de producción, indicador y guardado pasaron; la conciliación A/B/C y Vite también pasaron. Resultado de esta fase: **NO LISTO** porque faltan los pasos visuales indicados.

## Fase 14: validación visual y regresión

- **Desarrollo, comprobado en navegador:** no había un guardado identificado de «Validación integral» en Desarrollo con el reparto solicitado; se utilizó el guardado más próximo, «Prueba integral diseño», y se avanzó hasta Desarrollo. En la semana 26 el reparto era 36/33/31 y el trabajo acumulado en gráficos, sonido y mundo era 5,0/4,5/4,3. Se cambió a 60/21/19 y se guardó como «Fase14 desarrollo»; al cargar se conservaron reparto y trabajo.
- Se avanzaron cuatro semanas, hasta la semana 30 del proyecto. El trabajo pasó a 8,2/5,7/5,3; la producción de la última semana fue 0,8/0,3/0,3, los bugs 2,6, la deuda 4,0, el coste inicial y nóminas 13.000 y la caja 58.600. Tras guardar como «Fase14 cuatro semanas» y cargar, esos valores y el reparto seguían visibles. El trabajo anterior no se reinició.
- **Limitación visual:** el historial desplegable muestra semana, fase, avance, trabajo total, nómina y bugs, pero no muestra el reparto de cada semana. Por ello no se puede confirmar visualmente en ese panel el reparto anterior y el nuevo. Los números de semana del historial y del indicador de proyecto no son iguales en la interfaz observada.
- **Rentabilidad histórica:** el caso completo se conserva como referencia de la fase anterior. Los casos incompleto y no verificado no se han comprobado visualmente en historial ni ventas en esta fase; las pruebas automatizadas de presentación no sustituyen esa comprobación.
- **Regresión:** batería general 110 pruebas superadas; ejecución específica de producción, presentación de rentabilidad y guardado 35 superadas; script existente de conciliación A/B/C terminó con código 0; compilación Vite correcta con aviso de tamaño de paquete.
- **Resultado: NO LISTO.** Faltan las comprobaciones visuales de los avisos históricos en ambas pantallas y la verificación visual del reparto histórico por semana.

## Fase 14: intento de cierre definitivo (9 de noviembre de 2026)

**Resultado: NO LISTO.** En este intento no fue posible realizar el recorrido en navegador: el control de Windows se detuvo al no poder determinar con suficiente confianza la URL actual del navegador. No se accedió a los guardados ni se comprobaron visualmente los avisos históricos. Los resultados visuales de la sección anterior siguen siendo la última evidencia disponible, no una nueva verificación de este intento.

- Desarrollo: la evidencia anterior registra 36/33/31 en semana 26, cambio a 60/21/19 y cuatro semanas hasta la 30, con trabajo 5,0/4,5/4,3 → 8,2/5,7/5,3. Ambos guardados y cargas anteriores conservaron los valores descritos en la sección precedente. No se han observado por separado las tres primeras semanas en este intento; el historial visual no mostraba porcentajes por entrada.
- Rentabilidad completa: referencia de la validación visual anterior del panel de ventas. Incompleta y no verificada: pendientes de comprobación visual tanto en historial como en ventas; no se han preparado ni alterado datos económicos para este intento.
- Regresión de este intento: `node --test tests/*.test.js tests/*.test.mjs`, 110/110; `node --test tests/production.test.js tests/profit-display.test.js tests/save-system-ip.test.js`, 35/35; conciliación A/B/C existente, código 0; `node node_modules/vite/bin/vite.js build`, correcta con aviso de chunks superiores a 500 kB. El comando `npm` no estaba disponible en PATH, por lo que se ejecutó directamente Vite con Node.
- Pendientes: repetir el recorrido solicitado de Desarrollo y registrar las tres semanas, verificar la distribución anterior y nueva en el historial, y observar ambos avisos en las dos pantallas. Los criterios visuales pendientes impiden declarar completada la fase.

## Fase 16: reintento visual en partida aislada

En `127.0.0.1:5175`, con una partida nueva aislada «Validación aislada», se observó Desarrollo con 36/33/31 y trabajo de gráficos/sonido/mundo 0,5/0,5/0,4. Se cambió a 60/21/19, se guardó manualmente y se cargó conservando reparto y trabajo. Las observaciones visuales posteriores fueron: primera semana 1,3/0,7/0,7; segunda 2,1/1,0/0,9; tercera 3,0/1,3/1,2; cuarta 3,8/1,6/1,5. El historial mostró una entrada previa con 36/33/31 y cuatro entradas posteriores con 60/21/19. Tras guardar y cargar después de la cuarta, se conservaron el reparto, el trabajo y esas entradas. Las semanas del historial eran 23 y 24–27, respectivamente; el indicador del proyecto iba de 16 a 20.

Limitación: el segundo guardado/carga ocurrió después de la cuarta semana, no después de la tercera y antes de la cuarta como se solicitó. Los casos de rentabilidad incompleta y no verificada siguen sin comprobarse visualmente en las dos pantallas. Resultado: **NO LISTO**. La regresión de la implementación anterior fue 114/114 general y 39/39 específica, A/B/C correcta y Vite correcto con aviso de tamaño de paquete; no se modificó código en este reintento.

## Fase 17: rentabilidad histórica en navegador

**Validación visual completada en fixtures aislados.** Se generaron dos partidas en el origen local temporal `127.0.0.1:5180` con el motor del juego, sin ventas posteriores a la publicación. Para el caso incompleto se migró un proyecto cuyo historial previo no estaba disponible; para el no verificado se preparó un registro de prueba sin marca de completitud ni beneficio. Las partidas reales no se modificaron.

- Incompleto, Historial y Ventas: ambos mostraron `$-25.380` y «Rentabilidad incompleta: se usan los costes disponibles; faltan costes históricos que no pudieron reconstruirse.» Ventas mostró ingresos netos `$0` y coste de producción `$4000`; el historial no desglosa ingresos ni costes.
- No verificado, Historial y Ventas: ambos mostraron «Sin datos» y «Rentabilidad histórica no verificada: se usan los costes disponibles y pueden faltar costes históricos que no pudieron reconstruirse.» Ventas mostró ingresos netos `$0` y coste de producción `$4000`; el historial no desglosa ingresos ni costes. El cero es el ingreso generado por el fixture antes de ninguna semana de ventas, no un beneficio.
- Los avisos se observaron en ambas pantallas y son coherentes. El estado completo queda como referencia de la validación anterior. Se eliminaron los dos guardados de fixture y su autoguardado del origen aislado, así como los archivos temporales. No se cambió código funcional ni se repitió la regresión; se conserva la referencia anterior de 114/114, 39/39, conciliación A/B/C y compilación Vite correcta.
