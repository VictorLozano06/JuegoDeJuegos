# Multijugador de Dev Empire 3D

El ordenador del anfitrión sirve la sala y el juego para hasta cuatro jugadores, incluido el anfitrión. Los invitados juegan desde el navegador con un enlace.

1. En el ordenador del anfitrión, ejecuta `npm run dev` y abre el juego en la dirección local que muestra Vite. Necesitas Node.js y las dependencias del proyecto.
2. En el menú principal, pulsa **Multijugador online**. También puedes abrir el enlace privado de anfitrión que aparece en la terminal. Mantén el servidor abierto mientras jugáis.
3. Copia el **código de sala**. Cada invitado abre el juego, elige **Unirse con código**, pega el código y escribe su nombre.
4. Inicia la partida. Cada persona crea su estudio y la clasificación se ordena por fondos, con juegos publicados como desempate. La clasificación es para partidas privadas entre amigos y se basa en los resultados que envía cada juego.

El servicio de encuentro y retransmisión se ejecuta en Hostinger con `npm start` y utiliza el puerto asignado en `PORT`. Los juegos usan por defecto `https://palegoldenrod-cod-367689.hostingersite.com`. Para otra instalación configura `DEV_EMPIRE_RENDEZVOUS_URL` en cada ordenador con la dirección HTTPS del servicio. Para pruebas locales se permite HTTP en localhost. Los mensajes viajan mediante peticiones salientes, sin abrir puertos. Las salas se conservan en memoria mientras el servicio está en marcha; si se reinicia, hay que crear una sala nueva.
