# Multijugador de Dev Empire 3D

El ordenador del anfitrión sirve la sala y el juego para hasta cuatro jugadores, incluido el anfitrión. Los invitados juegan desde el navegador con un enlace.

1. En el ordenador del anfitrión, ejecuta `npm run dev` y abre el juego en la dirección local que muestra Vite. Necesitas Node.js y las dependencias del proyecto.
2. En el menú principal, pulsa **Multijugador online**. También puedes abrir el enlace privado de anfitrión que aparece en la terminal. Mantén el servidor abierto mientras jugáis.
3. Copia el **código de sala**. Cada invitado abre el juego, elige **Unirse con código**, pega el código y escribe su nombre.
4. Inicia la partida. Cada persona crea su estudio. El anfitrión controla la velocidad desde la barra superior, donde se ven los lanzamientos y la clasificación por notas, ventas, fans, fondos y premios.
5. Al final del año, los lanzamientos de la sala que cumplan los requisitos compiten en la misma gala. El anfitrión abre los sobres y pasa de categoría. El escritorio tiene **Mensajes** para el chat y **Vread → Publicaciones de la sala** para las publicaciones entre estudios.

Al salir el anfitrión, la competición se pone en pausa. Cuando vuelva a entrar desde el mismo ordenador, se recuperará la competición guardada. Si el servidor se ha reiniciado, comparte el nuevo código. Para recuperar cada estudio hay que entrar desde el mismo navegador y perfil, donde se guarda su progreso. El calendario, la clasificación, los mensajes y la gala se guardan en el equipo del anfitrión, en `.dev-empire/online-3210.json` dentro de su carpeta personal con el puerto por defecto. El anfitrión puede sustituir la partida guardada con **Nueva competición**.

El servicio de encuentro y retransmisión se ejecuta en Hostinger con `npm start` y utiliza el puerto asignado en `PORT`. Los juegos usan por defecto `https://palegoldenrod-cod-367689.hostingersite.com`. Para otra instalación configura `DEV_EMPIRE_RENDEZVOUS_URL` en cada ordenador con la dirección HTTPS del servicio. Para pruebas locales se permite HTTP en localhost. Si se reinicia el servicio de encuentro, los códigos anteriores dejan de funcionar, pero se puede volver a abrir la partida guardada.
