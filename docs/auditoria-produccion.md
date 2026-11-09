# Auditoría inicial del sistema de producción

## Flujo existente

- `startNewGameProject` valida catálogo, plataforma, franquicia y tecnologías; descuenta el coste inicial y crea `currentProject`, el grafo de alcance, el modelo de deuda y el contrato de publicación.
- Toda la plantilla disponible participa en `advanceDevTick`; sus atributos de tecnología, diseño, velocidad, energía y rasgos influyen en los puntos y los errores. No hay una asignación específica por proyecto.
- El desarrollo se ejecuta en un temporizador propio, independiente del calendario semanal. Tiene tres etapas de producción y una cuarta de pulido. El progreso mezcla el de las etapas con el del grafo de alcance.
- Las barras actuales no suman necesariamente 100 %. La nota de lanzamiento compara directamente sus valores con las preferencias del género, además de considerar puntos, afinidad, errores, deuda y otros factores.
- El calendario procesa ventas, salarios y gastos de oficina semanalmente. El coste inicial del proyecto se cobra al crearlo; el contrato calcula su penalización por retraso al lanzamiento.
- `SaveSystem` serializa el proyecto y reconstruye las clases del grafo y la deuda. La validación requiere que los proyectos antiguos conserven `sliders`.

## Adaptación necesaria

La producción debe pasar a actualizarse una sola vez por semana desde el calendario, con tres fases y distribuciones normalizadas. El grafo debe seguir representando alcance y requisitos, sin convertirse en un segundo reloj de progreso. La migración debe preservar puntos, errores, deuda y porcentaje alcanzado, y traducir la etapa antigua de pulido. Deben actualizarse los controles de publicación, acceso anticipado, contratos e interfaz que actualmente dependen de `stage === 4`.

El cálculo de calidad debe basarse en trabajo realizado por área y en los resultados existentes, sustituyendo la comparación directa de porcentajes. Los gastos semanales deben seguir en el calendario para evitar cobrarlos dos veces. Las tecnologías y los perfiles de género deben proceder de sus catálogos actuales.

Este documento recoge la auditoría inicial; no acredita que el rework esté implementado ni probado.
