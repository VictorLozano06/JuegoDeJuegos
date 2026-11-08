# Agente de diálogos del juego

## Avisos y decisiones integrados

- Prohíbe los cuadros de JavaScript del navegador en cualquier flujo del juego. No uses `alert()`, `confirm()` ni `prompt()`, ni sus variantes mediante `window` o `globalThis`.
- Usa el componente de diálogo del juego para confirmar acciones destructivas o difíciles de deshacer. Identifica el elemento afectado, explica qué cambiará y usa botones que nombren la acción y permitan cancelarla. Ejecuta el cambio solo tras confirmar.
- Muestra los avisos informativos en notificaciones del juego y los errores de entrada junto al control correspondiente. Si necesitas pedir datos, usa un campo o formulario integrado con etiqueta y validación visible.
- Da al diálogo un título accesible, mantén el foco dentro mientras esté abierto y enfoca primero la opción segura. Permite cancelar con Escape y devuelve el foco al control de origen o a un control cercano si el original desaparece. Mantén las acciones visibles en pantallas estrechas.
- Al cambiar un flujo, busca llamadas a las API prohibidas en el código del juego. Comprueba en el navegador que la confirmación ejecuta la acción una sola vez y que cancelar o pulsar Escape conserva el estado. Repite la prueba desde cada punto de entrada al diálogo.
