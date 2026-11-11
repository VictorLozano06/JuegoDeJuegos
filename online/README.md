# Multijugador de Dev Empire 3D

El ordenador del anfitrión sirve la sala y el juego para hasta cuatro jugadores, incluido el anfitrión. Los invitados juegan desde el navegador con un enlace.

1. En el ordenador del anfitrión, ejecuta `npm run dev` y abre el juego en la dirección local que muestra Vite. Necesitas Node.js y las dependencias del proyecto.
2. En el menú principal, pulsa **Multijugador online**. También puedes abrir el enlace privado de anfitrión que aparece en la terminal. Mantén el servidor abierto mientras jugáis.
3. Introduce una dirección del anfitrión accesible desde los demás ordenadores y copia el **código de sala**. Cada invitado abre el juego, elige **Unirse con código**, pega el código y escribe su nombre.
4. Inicia la partida. Cada persona crea su estudio y la clasificación se ordena por fondos, con juegos publicados como desempate. La clasificación es para partidas privadas entre amigos y se basa en los resultados que envía cada juego.

Para jugar desde otras redes, la dirección del anfitrión debe ser accesible. Puedes usar una red privada cifrada entre los jugadores, o hacer accesible el puerto TCP 3210 desde Internet. En una conexión con CG-NAT, el reenvío de puertos del router puede no bastar.

Para usar HTTPS directamente, configura `DEV_EMPIRE_ONLINE_TLS_KEY` y `DEV_EMPIRE_ONLINE_TLS_CERT` con las rutas de la clave y el certificado, y `DEV_EMPIRE_ONLINE_ORIGIN` con la dirección del certificado. `DEV_EMPIRE_ONLINE_PORT` cambia el puerto. Sin certificado, usa una red privada cifrada para jugar fuera de tu red local.

El servicio de encuentro se inicia con `npm run online:rendezvous` y escucha en el puerto definido por `RENDEZVOUS_PORT` (3220 por defecto). Configura `DEV_EMPIRE_RENDEZVOUS_URL` en cada ordenador con la dirección HTTPS de ese servicio. Para pruebas locales se permite HTTP en localhost. El servicio conserva códigos temporalmente en memoria y detecta la dirección del anfitrión por la conexión entrante, por lo que necesita recibirla sin un proxy que la sustituya. El código facilita encontrar la dirección, pero el puerto del anfitrión debe seguir siendo accesible. Para redes con CG-NAT o cortafuegos restrictivos se necesita una red virtual o un servicio que retransmita el tráfico.
