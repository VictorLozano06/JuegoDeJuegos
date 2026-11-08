// Additional original voices and conversation fragments for Vread.
const firstNames = ['Alba','Álex','Noa','Hugo','Inés','Leo','Vera','Celia','Izan','Iris','Teo','Aitana','Joel','Mar','Nil','Eva'];
const identities = ['Pixel','Mando','Arcade','Retro','Byte','Juega','Crítico','Indie','Quest','Replay','Bits','Código'];
export const MORE_PROFILES = firstNames.flatMap(first => identities.map(identity => {
    const name = `${first} ${identity}`;
    const handle = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return [name, handle];
}));

export const MORE_OPENERS = [
    'Vengo después de pensarlo:', 'A propósito de videojuegos:', 'Tema del día:', 'Os dejo una reflexión:',
    'Charla de sobremesa:', 'Hoy me apetece hablar de esto:', 'Una opinión personal:', 'Sin ánimo de sentar cátedra:',
    'Ayer salió esta conversación:', 'Cambio de tema:', 'Lo he estado comentando:', 'Después de jugar un rato:',
    'Quizá sea impopular:', 'A la comunidad:', 'Dejo esto por aquí:', 'Entre partida y partida:',
    'Mi pequeña reflexión:', 'Me gustaría debatir algo:', 'Desde el sofá:', 'Un pensamiento rápido:'
];
export const MORE_ENDINGS = [
    'Cada cual tendrá su respuesta.', 'Tengo curiosidad por lo que opináis.', 'Me gustaría conocer otros puntos de vista.',
    'No espero que todo el mundo piense igual.', 'A ver qué experiencias habéis tenido.', 'Os escucho sin prisas.',
    'Por supuesto, depende del caso.', 'Seguro que a alguien más le ha pasado.', 'Me apunto vuestras recomendaciones.',
    'Lo interesante es comparar experiencias.', 'Puedo cambiar de opinión si me convencéis.', '¿Qué ejemplos se os ocurren?',
    'Acepto recomendaciones relacionadas.', 'Cada estudio tiene su manera de hacerlo.', 'Lo comento con cariño.',
    'También hay excepciones, claro.', 'Es una conversación que merece tiempo.', 'Me pregunto si soy la única persona.',
    '¿Qué pondríais vosotros en primer lugar?', 'Estoy leyendo todas las respuestas.'
];
export const MORE_MARKET = [
    'los menús deberían poder manejarse sin pelearse con la interfaz', 'una opción para reducir efectos visuales ayuda a mucha gente',
    'los subtítulos necesitan buen contraste y tamaño configurable', 'el guardado automático no debería borrar una partida manual',
    'una dirección artística coherente envejece mejor que perseguir una moda', 'poder reasignar controles debería ser habitual',
    'las voces de la comunidad son diversas y no siempre piden lo mismo', 'me gusta descubrir mecánicas sin un marcador encima',
    'las buenas opciones de audio permiten escuchar a cada cual a su manera', 'un buen mapa ayuda sin revelar todos los secretos',
    'las animaciones de espera también pueden enseñar personalidad', 'una cámara cómoda cambia por completo la experiencia',
    'las escenas largas necesitan una opción para pausarlas', 'no todos los juegos necesitan una tienda interna',
    'la conservación de videojuegos es también conservar su historia', 'las traducciones tienen que respetar el tono de cada personaje',
    'un desafío justo puede ser difícil sin castigar cada error', 'me encanta cuando los créditos reconocen a todo el equipo',
    'la ciencia ficción da para algo más que naves y explosiones', 'la fantasía también puede contar historias pequeñas',
    'un modo foto invita a mirar escenarios con otros ojos', 'a veces el mejor tutorial consiste en dejar experimentar',
    'el control con mando y teclado merece el mismo cuidado', 'la variedad de enemigos cambia mucho el ritmo de una partida',
    'las misiones secundarias pueden hacer creíble un mundo', 'una interfaz clara también es parte de la dirección artística',
    'las versiones para equipos modestos no deberían quedarse sin atención', 'el multijugador local sigue siendo maravilloso',
    'los tiempos de carga importan cuando solo tienes media hora libre', 'las opciones de daltonismo deben probarse con personas reales',
    'una comunidad sana necesita moderación y normas claras', 'me gustan los finales que responden a las decisiones anteriores',
    'el precio por sí solo no cuenta toda la historia de un juego', 'un parche bien documentado da más confianza',
    'las dificultades de los estudios pequeños no deberían invisibilizar su trabajo', 'no hace falta un mapa gigante para encontrar historias interesantes',
    'las bandas sonoras dinámicas pueden mejorar incluso un combate sencillo', 'un buen botón de pausa es un detalle que se agradece',
    'la rejugabilidad también puede venir de aprender a jugar mejor', 'el rendimiento de una actualización debería compararse con la versión anterior',
    'los juegos de puzles son fantásticos para compartir soluciones', 'disfruto más una buena historia que una lista interminable de tareas',
    'los logros funcionan mejor cuando invitan a experimentar', 'los personajes secundarios pueden robarse una aventura',
    'los estudios deberían avisar antes de cerrar servidores', 'la fidelidad visual es solo una parte de la presentación',
    'a veces un error gracioso se convierte en la anécdota del año', 'los modos accesibles benefician a jugadores muy distintos'
];
export const MORE_PLAYER_GOOD = [
    'ha conseguido que pierda la noción del tiempo', 'me ha convencido más de lo que esperaba', 'ofrece momentos realmente especiales',
    'tiene una dirección que me apetece volver a explorar', 'ha sabido ganarse mi atención desde el principio',
    'me está dejando muy buenas sensaciones', 'es de esos juegos que apetece recomendar a una amistad',
    'tiene detalles que se notan hechos con cariño', 'me ha hecho volver para una segunda partida',
    'ha cumplido lo que buscaba este fin de semana', 'es una sorpresa agradable dentro de su género',
    'me ha dejado con ganas de ver qué hará el equipo después', 'combina ideas conocidas de una forma que funciona',
    'me ha dado varias historias para contar', 'consigue mantener mi interés sin complicarse de más'
];
export const MORE_PLAYER_MIXED = [
    'tiene momentos brillantes y otros que no terminan de funcionar', 'me ha gustado más al principio que al final',
    'tiene una buena base, aunque le vendría bien más variedad', 'deja ver buenas ideas que podrían desarrollarse mejor',
    'se disfruta, pero algunas decisiones me han desconcertado', 'tiene partes memorables y otras bastante normales',
    'puede gustar mucho si conectas con su propuesta', 'me entretiene, aunque todavía veo margen de mejora',
    'se atreve con cosas interesantes sin acertar siempre', 'gana puntos por sus ideas y pierde otros por su ritmo',
    'tiene sus virtudes, pero también varios detalles discutibles', 'me ha convencido a medias y quiero darle otra oportunidad',
    'es de esos juegos sobre los que no tengo una opinión sencilla', 'me ha sorprendido en unas cosas y decepcionado en otras',
    'funciona mejor cuando se centra en sus mejores mecánicas'
];
export const MORE_PLAYER_BAD = [
    'me ha frustrado más de lo que me ha divertido', 'está lejos de lo que esperaba por ahora',
    'me ha dejado con demasiadas cosas pendientes de arreglar', 'necesita una revisión seria antes de que vuelva',
    'no ha conectado conmigo y he terminado dejándolo', 'tiene problemas que me cuesta pasar por alto',
    'me ha hecho perder la paciencia en varias ocasiones', 'no termina de sacar partido a su propuesta',
    'necesita escuchar las críticas de quienes lo han probado', 'me ha dejado una sensación bastante amarga',
    'tiene potencial, pero ahora mismo no me convence', 'no ha sido una buena experiencia para mí',
    'me ha costado disfrutarlo por cómo se siente al jugar', 'agradecería una respuesta del equipo sobre sus problemas',
    'necesita recuperar mi confianza con mejoras concretas'
];
export const MORE_RIVAL_GAME = [
    'ha encontrado un público muy fiel', 'está reuniendo opiniones muy diferentes', 'me ha dejado con ganas de comentarlo',
    'ha abierto una discusión interesante sobre su género', 'se ha convertido en tema habitual entre mis amistades',
    'parece tener defensores y detractores por igual', 'ha conseguido llamar la atención de la comunidad',
    'me ha parecido una propuesta peculiar', 'se presta a muchas interpretaciones', 'está apareciendo en bastantes recomendaciones',
    'tiene una comunidad que comparte experiencias muy distintas', 'da para un debate largo sobre lo que funciona y lo que no',
    'es uno de esos lanzamientos de los que todo el mundo parece tener una opinión', 'me ha sorprendido por su enfoque',
    'tiene una personalidad que se reconoce enseguida'
];
export const MORE_RIVAL_STUDIO = [
    'tiene seguidores que esperan cada noticia', 'está construyendo su propio espacio en la industria',
    'tiene una trayectoria que merece atención', 'ha despertado bastante interés entre los aficionados',
    'suele generar opiniones enfrentadas', 'tiene una forma de trabajar que me intriga',
    'es un nombre que aparece cada vez más en las conversaciones', 'tiene una comunidad que se fija en cada detalle',
    'plantea preguntas interesantes sobre el futuro de sus juegos', 'es un estudio del que me gustaría conocer más',
    'ha conseguido reunir a jugadores con gustos muy distintos', 'nos dará mucho de qué hablar',
    'tiene delante decisiones que pueden marcar su rumbo', 'es una empresa que conviene observar de cerca',
    'ha despertado mi curiosidad como jugador'
];
export const MORE_REPLIES = {
    apology: ['Aprecio que deis la cara. Seguiré los próximos avances.', 'Reconocerlo ayuda; espero información sobre los siguientes pasos.', 'Gracias por explicarlo. La confianza se recupera poco a poco.', 'Acepto la disculpa si viene acompañada de mejoras.', 'Estaré pendiente de lo que hagáis a partir de ahora.', 'No es fácil admitir un error; espero que el equipo tenga tiempo para arreglarlo.', 'Sería útil una lista pública de problemas conocidos.', 'Gracias por responder sin esquivar la cuestión.'],
    patch: ['¿Podéis publicar una lista de cambios cuando esté listo?', 'Espero que incluya las incidencias que más afectan a las partidas.', 'Avisad también si hay que empezar una partida nueva.', 'Me gustaría saber qué problemas quedan pendientes.', 'Bien por mantener el juego después del lanzamiento.', '¿La actualización llegará a todas las plataformas?', 'Agradezco la información; probaré los cambios cuando estén disponibles.', 'Ojalá el equipo tenga tiempo para probarlo bien antes de publicarlo.'],
    problem: ['Gracias por avisar. ¿Tenéis localizados los fallos?', 'Sería bueno mantener una lista de incidencias conocidas.', 'Agradezco la sinceridad; espero una solución cuando sea posible.', '¿Podemos enviaros información para reproducir el problema?', 'Me ha pasado algo parecido; estaré pendiente.', 'Por favor, no dejéis de comunicar los avances.', 'Saber que lo habéis visto ya es un comienzo.', '¿Afecta a todas las versiones o solo a algunas?'],
    announcement: ['¿Podréis enseñar una partida completa más adelante?', 'La idea me interesa; esperaré a conocer más detalles.', 'Me apunto la noticia. Mucha suerte al equipo.', '¿Tendremos un diario de desarrollo?', 'Ojalá llegue una demostración para probarlo.', 'Estoy pendiente, aunque prefiero juzgar el resultado final.', 'Tengo curiosidad por el estilo que vais a elegir.', 'Espero conocer qué tiene de especial cuando podáis contarlo.'],
    monetization: ['¿Habrá alguna compra opcional y qué incluirá?', 'Una explicación clara del precio ayudaría mucho.', '¿El contenido adicional será necesario para disfrutarlo?', 'Espero que no haya sorpresas después de comprar.', 'Si es gratuito, me gustaría saber cómo se financia.', '¿Tendréis en cuenta precios para distintas regiones?', 'Las condiciones deberían estar claras antes del lanzamiento.', 'Quiero conocer el contenido completo antes de decidir.'],
    insult: ['No me parece bien responder así a la gente que os apoya.', 'Las críticas no justifican tratar mal a la comunidad.', 'Espero que alguien del estudio rectifique este mensaje.', 'Esta forma de comunicarse me hace perder confianza.', 'No estoy de acuerdo con todas las críticas, pero esto sobra.', 'Una disculpa sería un buen comienzo.', 'Podíais haber explicado vuestra postura con respeto.', 'Me preocupa ver al estudio tratar así a sus jugadores.'],
    boast: ['Suena ambicioso. Espero que tengáis margen para cumplirlo.', 'Me entusiasma la idea, pero esperaré a ver el resultado.', 'Las expectativas están muy altas con esa afirmación.', 'Prefiero una promesa modesta y un buen juego.', 'Enseñadnos más cuando tengáis material listo.', 'Ojalá el equipo no tenga que correr para cumplirlo.', 'Me gusta la confianza, aunque quiero pruebas antes de celebrarlo.', 'Una demo ayudaría a entender lo que prometéis.'],
    thanks: ['Gracias por acompañarnos durante el desarrollo.', 'Es bonito ver que leéis a quienes estamos aquí.', 'Mucho ánimo a todo el equipo.', 'Seguiremos compartiendo nuestras impresiones.', 'Da gusto sentir que hay comunicación.', 'Gracias por contar con la comunidad.', 'Aquí estaremos para lo próximo.', 'Agradezco que os toméis el tiempo de decirlo.'],
    multiplayer: ['¿Se podrá jugar con amistades en distintas plataformas?', 'Espero que el cooperativo funcione también con conexión limitada.', '¿El multijugador será opcional?', '¿Tendrá partidas privadas?', 'Me encantaría compartirlo con mi grupo.', 'No olvidéis a quienes preferimos jugar en solitario.', '¿Habrá algún modo local para jugar en el mismo sofá?', 'Contad cómo funcionará la conexión cuando podáis.'],
    platforms: ['¿Habrá diferencias de contenido entre plataformas?', '¿Las partidas podrán trasladarse entre versiones?', 'Espero que publiquéis los requisitos antes de comprar.', 'Me interesa saber qué mandos serán compatibles.', '¿Todas las versiones recibirán las actualizaciones a la vez?', 'Ojalá tengáis en cuenta equipos más modestos.', 'Una lista de plataformas compatibles vendría muy bien.', 'Espero que el soporte continúe después del lanzamiento.'],
    performance: ['¿Se podrán ajustar los efectos y la resolución?', 'La fluidez también importa en equipos modestos.', '¿Publicaréis requisitos mínimos y recomendados?', 'Espero que haya opciones para elegir entre calidad y rendimiento.', 'La estabilidad de las partidas guardadas también cuenta.', 'Me gustaría ver pruebas en varios equipos.', 'Prefiero una tasa estable a más efectos.', 'Gracias por tener en cuenta el rendimiento.'],
    story: ['¿Podremos conocer mejor a los personajes secundarios?', 'Me encantaría ver cómo se construye ese mundo.', 'Ojalá las decisiones tengan consecuencias interesantes.', 'Me interesa que la historia respete el ritmo del juego.', 'Una narrativa breve también puede dejar huella.', '¿Habrá espacio para explorar la historia a nuestro ritmo?', 'Tengo curiosidad por el tono que vais a elegir.', 'Espero que el final cierre bien los personajes.'],
    releaseDate: ['Una fecha aproximada ayudaría, pero sin comprometer la calidad.', 'No pasa nada si todavía no tenéis día confirmado.', 'Prefiero que aviséis cuando estéis seguros.', 'Ojalá sepamos algo cuando el equipo tenga una estimación.', 'Esperaré al anuncio oficial para organizarme.', 'Tomaros el tiempo que necesitéis para terminarlo.', '¿Avisaréis con suficiente antelación?', 'Una ventana de salida sería suficiente por ahora.'],
    question: ['Mi preferencia sería tener varias opciones.', 'Me gustaría conocer las opiniones del resto antes de decidir.', 'Para mí dependería de cómo funcione en la práctica.', 'Yo daría prioridad a que sea cómodo de usar.', 'Tengo una idea distinta, pero ambas podrían funcionar.', 'Lo importante es probarlo con jugadores diferentes.', 'No tengo una respuesta cerrada; leo a los demás.', 'Quizá se pueda ofrecer una opción para cada estilo.'],
    neutral: ['Gracias por compartirlo. Esperaré más detalles.', 'Os sigo para ver cómo evoluciona.', 'Interesante, me gustaría saber un poco más.', 'Quedo pendiente de futuras noticias.', 'Gracias por mantener abierta la conversación.', 'Tengo curiosidad por lo que anunciaréis después.', 'Lo comentaré con mi grupo de juego.', 'Voy a seguir de cerca lo que compartáis.']
};
export const MORE_FEED_REPLIES = {
    player: ['Lo he jugado de otra manera y mi experiencia ha sido distinta.', 'Me gustaría ver qué opina quien lo haya terminado.', 'Yo lo probé hace poco y todavía estoy decidiendo.', '¿Qué parte te ha parecido más interesante?', 'Coincido con una parte, aunque mi conclusión es otra.', 'Esperaré a leer más experiencias antes de comprar.', 'Lo tengo pendiente; gracias por compartir tu opinión.', 'Creo que dependerá mucho de lo que busque cada jugador.'],
    rivalGame: ['¿Lo recomendarías a alguien nuevo en el género?', 'He leído reseñas muy diferentes de ese juego.', 'Quiero probarlo cuando tenga un hueco.', 'Una amistad lo está jugando y también lo comenta.', 'Me interesa conocer más experiencias antes de decidir.', '¿Qué tal se adapta a partidas cortas?', 'Lo añadiré a mi lista para investigarlo.', 'Hay opiniones para todos los gustos sobre ese lanzamiento.'],
    rival: ['Seguiré las noticias de ese equipo.', 'Me interesa cómo evolucionará su catálogo.', 'No conozco mucho al estudio; investigaré su trayectoria.', 'Cada empresa tiene puntos fuertes y débiles.', 'Sus próximos movimientos pueden ser interesantes.', 'He visto a su comunidad debatir sobre eso.', 'Habrá que esperar a ver qué anuncian oficialmente.', 'Tengo curiosidad por sus decisiones futuras.'],
    market: ['En mi caso depende mucho del tipo de juego.', 'Es una conversación con más de una respuesta.', 'Me gustaría escuchar también a otros jugadores.', 'Cada persona valora cosas distintas al jugar.', 'La clave está en cómo se aplica cada idea.', 'Tengo una opinión diferente, pero entiendo el argumento.', 'Hay buenos ejemplos a favor y en contra.', 'Me apunto la reflexión para seguir el debate.']
};
export const REPLY_ENDINGS = [
    '', '', '', ' Estaré pendiente.', ' A ver cómo evoluciona.', ' Es mi opinión personal.', ' Leo al resto.',
    ' Gracias por abrir el debate.', ' Ojalá sepamos más pronto.', ' Cada experiencia es distinta.',
    ' Me interesa seguir la conversación.', ' Me gustaría saber más.', ' Habrá que esperar y ver.',
    ' No todo el mundo lo verá igual.', ' Por mi parte, seguiré atento.', ' Ojalá haya más información.'
];
