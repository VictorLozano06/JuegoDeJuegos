import {
    MORE_PROFILES, MORE_OPENERS, MORE_ENDINGS, MORE_MARKET, MORE_PLAYER_GOOD,
    MORE_PLAYER_MIXED, MORE_PLAYER_BAD, MORE_RIVAL_GAME, MORE_RIVAL_STUDIO,
    MORE_REPLIES, MORE_FEED_REPLIES, REPLY_ENDINGS,
    HATER_PROFILES, HATER_OPENERS, HATER_ENDINGS, HATER_PLAYER_ATTACKS,
    HATER_RIVAL_ATTACKS, HATER_MARKET_RANTS, HATER_STUDIO_REPLIES
} from './vread-content.js';
import { cleanLegacyTitle } from './gameNameGenerator.js';

/** Vread: a local, rule-based social simulation. All consequences use game weeks. */
const PROFILES = [
    ['RubiPixel', 'rubipixel'], ['AuroPlay', 'auroplay'], ['NekoByte', 'nekobyte'], ['LunaArcade', 'lunaarcade'],
    ['MeriRetro', 'meriretro'], ['DonMando', 'donmando'], ['MartaDebug', 'martadebug'], ['PatoGlitch', 'patoglitch'],
    ['Capitán Píxel', 'capitanpixel'], ['Cris Reviews', 'crisreviews'], ['NoraBits', 'norabits'], ['Dani Indie', 'daniindie'],
    ['Gameoteca', 'gameoteca'], ['SofiQuest', 'sofiquest'], ['PepinoTV', 'pepinotv'], ['Análisis Crítico', 'analisiscritico'],
    ['MandoManía', 'mandomania'], ['LaPartidaLarga', 'partidalarga'], ['ByteNómada', 'bytenomada'], ['Replay Club', 'replayclub'],
    ['Clara Dev', 'claradev'], ['SalvaFPS', 'salvafps'], ['MundoIndie', 'mundoindie'], ['PíxelSincero', 'pixelsincero'],
    ['Lola Lore', 'lolalore'], ['RafaSpeedrun', 'rafaspeedrun'], ['Nube Gamer', 'nubegamer'], ['Café y Código', 'cafeycodigo'],
    ['Crítica Nocturna', 'criticanocturna'], ['Marina QA', 'marinaqa'], ['ElTallerRetro', 'tallerretro'], ['Miki Plays', 'mikiplays']
];
const OPENERS = ['A ver,', 'Opinión de hoy:', 'Llevo un rato pensando:', 'Debate abierto:', 'Os leo:', 'No sé vosotros, pero', 'Pregunta para la comunidad:', 'Me acaba de venir una idea:', 'Lo digo sin drama:', 'Una cosa:', 'Vengo con esto:', 'Alguien tenía que decirlo:'];
const ENDINGS = ['¿Vosotros cómo lo veis?', 'Quiero leer opiniones.', 'Lo hablamos.', 'Cada partida es un mundo.', 'Igual soy yo, pero tenía que decirlo.', 'Aquí hay debate para rato.', 'Me interesa vuestra experiencia.', 'Sin peleas, por favor.', '¿Alguien más lo ha notado?', 'No hay respuesta fácil.', 'Que empiece el debate.', 'Ojalá más gente hable de esto.'];
const MARKET = [
    'la dificultad ajustable abre las puertas a más gente', 'la música de un menú puede quedarse contigo años',
    'un buen tutorial no debería detener el juego cada dos pasos', 'el rendimiento importa tanto como los gráficos',
    'un final memorable puede salvar una historia irregular', 'los juegos cortos también merecen su espacio',
    'las demos ayudan mucho a decidir una compra', 'las actualizaciones deberían explicar lo que cambian',
    'los precios regionales afectan a quién puede jugar', 'la accesibilidad merece estar en el diseño desde el principio',
    'hay demasiadas secuelas y pocas ideas raras', 'una buena secuela puede mejorar lo que ya funcionaba',
    'las partidas guardadas deberían respetar el tiempo del jugador', 'prefiero mecánicas profundas a mapas enormes vacíos',
    'la comunidad de modders puede alargar la vida de un juego', 'la monetización debe ser clara antes de pagar',
    'un multijugador sin mantenimiento dura muy poco', 'las animaciones cuentan mucho sobre un personaje',
    'echo de menos los manuales y secretos de los juegos antiguos', 'una campaña pequeña bien terminada vale muchísimo',
    'un lanzamiento aplazado puede ser mejor que uno lleno de errores', 'el diseño de sonido transforma incluso una escena sencilla',
    'el equilibrio entre dificultad y diversión cambia según el jugador', 'me encantan los estudios que comparten cómo trabajan'
];
const PLAYER_GOOD = ['me ha sorprendido para bien', 'tiene unas ideas fantásticas', 'me ha tenido pegado a la pantalla', 'destaca por encima de lo que esperaba', 'merece que más gente lo descubra', 'tiene momentos que voy a recordar'];
const PLAYER_MIXED = ['tiene buenas ideas, aunque hay partes que se hacen cuesta arriba', 'es divertido a ratos, pero necesita más pulido', 'me gusta su propuesta, aunque no todo funciona', 'promete bastante y deja algunas dudas', 'tiene aciertos y también cosas que mejorar', 'me ha dejado sensaciones mezcladas'];
const PLAYER_BAD = ['necesita una actualización antes de recomendarlo', 'me ha dado problemas y espero que lo revisen', 'tiene ideas, pero los errores me han sacado de la partida', 'no ha cumplido lo que esperaba', 'necesita más tiempo de desarrollo', 'me cuesta recomendarlo en su estado actual'];
const RIVAL_GAME = ['me está sorprendiendo con su propuesta', 'ha dado mucho que hablar esta semana', 'tiene una comunidad que no para de compartir trucos', 'merece una conversación sobre su diseño', 'ha dividido bastante a la comunidad', 'me ha dejado pensando después de jugar', 'es el juego que más veo recomendar últimamente', 'tiene ideas curiosas aunque no guste a todo el mundo'];
const RIVAL_STUDIO = ['despierta curiosidad por lo que hará a continuación', 'se ha ganado un sitio en la conversación', 'tiene decisiones de diseño que merecen debate', 'está siguiendo una estrategia interesante', 'tiene una comunidad muy apasionada', 'es uno de esos estudios que conviene seguir de cerca'];
const REPLIES = {
    apology: ['Gracias por reconocer el problema. Necesitamos fechas y avances concretos.', 'Se agradece la disculpa; ahora toca demostrarlo con hechos.', 'Un primer paso. Por favor, contadnos qué vais a corregir.', 'Ojalá este mensaje venga acompañado de soluciones.'],
    patch: ['Bien, ¿podéis compartir qué fallos entran en el parche?', 'Buena noticia. Avisad cuando podamos probar la actualización.', 'Gracias por el seguimiento; espero que también reviséis el rendimiento.', 'Se agradece la comunicación. ¿Habrá notas del parche?'],
    announcement: ['Me interesa, ¿cuándo podréis enseñar más?', 'Suena bien; prefiero esperar a ver cómo queda.', 'Ojalá compartáis una demostración antes del lanzamiento.', 'Me apunto, contad también cómo será la jugabilidad.'],
    monetization: ['¿Podéis aclarar cuánto costará y qué incluye?', 'Me preocupa que el precio afecte al equilibrio.', 'Si todo está explicado con transparencia, podremos decidir.', 'Necesitamos detalles sobre pagos y contenido antes de opinar.'],
    insult: ['Ese trato a la comunidad no es aceptable.', 'Se puede discrepar sin insultar a quienes juegan.', 'Esto no es una forma responsable de responder a las críticas.', 'Voy a esperar una disculpa antes de apoyar al estudio.'],
    boast: ['Las promesas son grandes; espero que podáis cumplirlas.', 'Prefiero ver el juego antes de dar nada por hecho.', 'Si sale así será increíble, pero cuidado con crear expectativas.', 'Las palabras están bien; ahora enseñadnos cómo funciona.'],
    thanks: ['¡Gracias a vosotros! Seguiremos atentos.', 'Da gusto que escuchéis a la comunidad.', 'Aquí seguimos, con ganas de ver lo siguiente.', 'Gracias por mantenernos informados.'],
    multiplayer: ['¿Será cooperativo, competitivo o tendrá ambos modos?', 'Si añadís multijugador, espero que también se pueda jugar en solitario.', '¿Habrá juego cruzado entre plataformas?', 'Con amigos puede ser genial; contadnos cuántas personas podrán jugar.'],
    platforms: ['¿En qué plataformas estará disponible?', 'Ojalá llegue también a mi plataforma.', '¿Podréis compartir los requisitos y plataformas compatibles?', 'Espero que todas las versiones reciban el mismo soporte.'],
    performance: ['¿Qué rendimiento esperáis y qué equipos podrán moverlo?', 'Para mí la estabilidad es más importante que los efectos visuales.', 'Se agradecerían opciones gráficas y cifras de rendimiento.', 'Ojalá publiquéis los requisitos antes del lanzamiento.'],
    story: ['Me gustaría saber más de los personajes y del mundo.', 'Una buena historia puede hacer que me quede hasta el final.', '¿La historia tendrá decisiones o será lineal?', 'Espero que la narrativa no se olvide de la jugabilidad.'],
    releaseDate: ['¿Tenéis una fecha aproximada o todavía es pronto?', 'Prefiero esperar a que esté listo antes que tener una fecha precipitada.', 'Avisad cuando tengáis una fecha confirmada.', 'Una ventana de lanzamiento ya ayudaría a planificarse.'],
    question: ['Buena pregunta. A mí me gustaría ver más opciones.', 'Depende de cómo se implemente, pero me interesa.', 'Yo priorizaría la estabilidad y después más contenido.', 'Tengo curiosidad por saber qué piensa el resto.'],
    neutral: ['Os leo; espero conocer más detalles pronto.', 'Interesante. ¿Podéis contar un poco más?', 'Estaré pendiente de lo que compartáis.', 'Gracias por la actualización, espero ver más información.']
};
const FEED_REPLIES = {
    player: ['Yo también lo he probado y tengo una opinión distinta.', '¿En qué plataforma lo has jugado?', 'Coincido con algunas cosas, pero no con todas.', 'Yo esperaré a ver si recibe alguna actualización.'],
    rivalGame: ['Lo tengo en la lista; ¿qué tal funciona?', 'He visto opiniones distintas, me interesa probarlo.', 'La comunidad lleva días hablando de este lanzamiento.', '¿Qué es lo que más te ha gustado?'],
    rival: ['Tengo curiosidad por sus próximos anuncios.', 'Han tomado decisiones interesantes últimamente.', 'Cada estudio tiene su propia forma de hacer juegos.', 'Estoy esperando a ver qué presentan después.'],
    market: ['Es un tema con muchos matices.', 'Depende mucho de cada juego y de cada persona.', 'Me gustaría que más estudios hablaran de esto.', 'Yo añadiría que también importa escuchar a los jugadores.']
};

PROFILES.push(...MORE_PROFILES);
OPENERS.push(...MORE_OPENERS);
ENDINGS.push(...MORE_ENDINGS);
MARKET.push(...MORE_MARKET);
PLAYER_GOOD.push(...MORE_PLAYER_GOOD);
PLAYER_MIXED.push(...MORE_PLAYER_MIXED);
PLAYER_BAD.push(...MORE_PLAYER_BAD);
RIVAL_GAME.push(...MORE_RIVAL_GAME);
RIVAL_STUDIO.push(...MORE_RIVAL_STUDIO);
for (const [kind, replies] of Object.entries(MORE_REPLIES)) {
    REPLIES[kind] = [...(REPLIES[kind] || []), ...replies];
}
for (const [kind, replies] of Object.entries(MORE_FEED_REPLIES)) FEED_REPLIES[kind].push(...replies);

const TOPIC_REPLIES = {
    audio: ['La música cambia por completo cómo recuerdo una escena.', 'Yo también me fijo mucho en el diseño de sonido.', 'Agradezco poder ajustar música, voces y efectos por separado.', 'Una buena melodía puede quedarse contigo años.', 'El silencio también puede ser una decisión acertada.', 'Me interesa conocer vuestras bandas sonoras favoritas.'],
    price: ['Para mí es fundamental saber qué incluye antes de pagar.', 'El precio razonable depende también del contenido ofrecido.', 'Las condiciones claras ayudan a decidir con tranquilidad.', 'No todo el mundo tiene el mismo presupuesto.', 'Me fijo mucho en si hay compras adicionales.', 'La transparencia evita muchas discusiones.'],
    access: ['Poder configurar el juego ayuda a personas muy diferentes.', 'Es mejor pensar en accesibilidad desde el inicio.', 'Una opción más puede marcar una gran diferencia.', 'Los controles configurables deberían ser habituales.', 'Las necesidades cambian mucho de una persona a otra.', 'La legibilidad también es una parte de la experiencia.'],
    technical: ['Una tasa estable cambia mucho la experiencia.', 'Me interesa que expliquen los problemas conocidos.', 'Yo también priorizo la estabilidad cuando juego.', 'Las pruebas en equipos diferentes son importantes.', 'Una actualización necesita tiempo para comprobarse bien.', 'Un buen registro de cambios ayuda a la comunidad.'],
    multiplayer: ['Jugar con amistades puede cambiarlo todo.', 'Ojalá no se olviden de quienes juegan en solitario.', 'Las partidas privadas son importantes para mi grupo.', 'El juego local sigue teniendo mucho encanto.', 'La estabilidad de conexión importa tanto como los modos.', 'La comunidad también influye en la experiencia.'],
    story: ['Los personajes secundarios a veces son mis favoritos.', 'Un final bien preparado puede quedarse contigo mucho tiempo.', 'Me importa que la historia respete el ritmo de juego.', 'Los mundos pequeños también pueden contar mucho.', 'Las decisiones se sienten mejor cuando tienen consecuencias.', 'Yo valoro mucho una buena ambientación.']
};

function feedReplyKind(sentence, fallback) {
    if (fallback !== 'market') return fallback;
    const value = normalize(sentence);
    if (/musica|sonido|voces|audio|banda sonora/.test(value)) return 'audio';
    if (/precio|compra|pagar|monetizacion|tienda/.test(value)) return 'price';
    if (/accesibilidad|subtitulos|daltonismo|contraste|controles/.test(value)) return 'access';
    if (/rendimiento|fluidez|grafico|errores|parche|actualizaci|equipos/.test(value)) return 'technical';
    if (/multijugador|conexi|servidores|amistades/.test(value)) return 'multiplayer';
    if (/historia|narrativa|personaje|final|mundo/.test(value)) return 'story';
    return fallback;
}
const RULES = [
    ['insult', /\b(idiotas?|imbeciles?|estupidos?|gilipollas|inutiles?|incompetentes?|callaos|callate|os jodeis|putos? (?:jugadores|fans)|basura de jugadores|odio (?:a )?(?:los )?(?:jugadores|fans))\b/],
    ['apology', /\b(perdon|disculp(?:a|as|amos|en)|lo sentimos|lamentamos|asumimos|nos equivocamos)\b/],
    ['boast', /\b(mejor juego (?:del|de la) (?:mundo|historia)|perfecto|sin bugs|sin errores|revolucionaremos|garantizamos|obra maestra|nadie nos supera)\b/],
    ['patch', /\b(parche|actualizacion|hotfix|corregir|corregimos|arreglar|arreglamos|solucionar|solucionamos)\b/],
    ['problem', /\b(bugs?|errores?|fallos?|problemas?|crasheos?|crashea)\b/],
    ['monetization', /\b(precio|precios|caro|gratis|gratuito|pagar|pago|costara|cuanto cuesta|microtransacciones?|monetizacion|dlc|subir el precio)\b/],
    ['releaseDate', /\b(cuando sale|cuando saldra|fecha de salida|fecha de lanzamiento|cuando llega)\b/],
    ['announcement', /\b(anunciamos|anuncio|lanzamiento|lanzamos|lanzado|lanzaremos|presentamos|proximo juego|nuevo juego|demo|trailer|disponible|sale hoy|ya a la venta)\b/],
    ['multiplayer', /\b(multijugador|cooperativo|cooperativa|jugar con amigos|juego cruzado|multiplayer|coop)\b/],
    ['platforms', /\b(plataformas?|consolas?|ordenador|pc|steam|switch|playstation|xbox|requisitos)\b/],
    ['performance', /\b(rendimiento|fps|fotogramas|optimizacion|optimizar|graficos)\b/],
    ['story', /\b(historia|narrativa|personajes|trama|guion|argumento)\b/],
    ['thanks', /\b(gracias|agradecemos|agradecer|apoyo|escuchamos|comunidad)\b/],
    ['question', /\b(que opinais|que os parece|cual|preferis|os gustaria)\b|\?/]
];
const normalize = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const pick = (array, rng) => array[Math.min(array.length - 1, Math.floor(rng() * array.length))];
const weekOf = game => typeof game.getIndustryWeek === 'function' ? game.getIndustryWeek() : (Math.max(1, game.year || 1) - 1) * 48 + ((game.month || 1) - 1) * 4 + (game.week || 1);

export function ensureVreadState(game) {
    if (!game.vreadState || typeof game.vreadState !== 'object') game.vreadState = {};
    const s = game.vreadState;
    if (!Array.isArray(s.posts)) s.posts = [];
    if (!Array.isArray(s.effects)) s.effects = [];
    if (!Array.isArray(s.recentFeed)) s.recentFeed = [];
    if (!Array.isArray(s.recentReplies)) s.recentReplies = [];
    if (!Array.isArray(s.recentParticipants)) s.recentParticipants = [];
    if (!Number.isFinite(s.sequence)) s.sequence = 0;
    if (!Number.isFinite(s.reputation)) s.reputation = 50;
    return s;
}

function chooseParticipants(state, count, rng, exclude = []) {
    const selected = [];
    const blocked = new Set(exclude);
    while (selected.length < count) {
        let candidates = PROFILES.filter(profile => !blocked.has(profile[1]) && !state.recentParticipants.includes(profile[1]));
        if (!candidates.length) candidates = PROFILES.filter(profile => !blocked.has(profile[1]));
        if (!candidates.length) break;
        const person = pick(candidates, rng);
        selected.push(person);
        blocked.add(person[1]);
        state.recentParticipants.push(person[1]);
        if (state.recentParticipants.length > 100) state.recentParticipants.shift();
    }
    return selected;
}

function makeReplies(state, pool, count, rng, { exclude = [], target = null, includeHaters = false } = {}) {
    const people = chooseParticipants(state, count, rng, exclude);
    const availableBases = [...pool];
    const usedEndings = new Set();
    const replies = [];
    const isHaterProfile = new Set(HATER_PROFILES.map(h => h[1]));
    for (const [index, person] of people.entries()) {
        if (!availableBases.length) availableBases.push(...(index === 0 || !includeHaters ? pool : (rng() < 0.4 ? HATER_STUDIO_REPLIES : pool)));
        const options = availableBases.flatMap(base => REPLY_ENDINGS
            .filter(ending => !ending || !usedEndings.has(ending))
            .filter(ending => !ending || !normalize(ending).split(/\W+/).some(word => word.length > 5 && normalize(base).includes(word)))
            .map(ending => ({ base, ending, text: base + ending })));
        const fresh = options.filter(option => !state.recentReplies.includes(option.text));
        const selected = pick(fresh.length ? fresh : options, rng);
        availableBases.splice(availableBases.indexOf(selected.base), 1);
        if (selected.ending) usedEndings.add(selected.ending);
        state.recentReplies.push(selected.text);
        if (state.recentReplies.length > 240) state.recentReplies.shift();
        const isHater = isHaterProfile.has(person[1]) || (includeHaters && HATER_STUDIO_REPLIES.includes(selected.base));
        replies.push({ author: person[0], handle: person[1], text: target && index === 0 ? `Sobre ${target}: ${selected.text}` : selected.text, isHater: !!isHater });
        if (index === 0 && includeHaters) {
            availableBases.push(...HATER_STUDIO_REPLIES);
        }
    }
    return replies;
}

function pickFreshView(state, category, id, pool, rng) {
    const available = pool.filter(view => !state.recentFeed.includes(`${category}:${id}:${view}`));
    return pick(available.length ? available : pool, rng);
}

export function classifyVreadPost(text) {
    const value = normalize(text);
    return RULES.find(([, pattern]) => pattern.test(value))?.[0] || 'neutral';
}

function findMentionedGame(game, text) {
    const phrase = normalize(text);
    const games = [...(game.activeSales || []), ...(game.gamesHistory || []), ...(game.currentProject ? [game.currentProject] : [])];
    return games.filter(item => typeof item?.name === 'string' && normalize(item.name).length >= 3 && phrase.includes(normalize(item.name)))
        .sort((a, b) => b.name.length - a.name.length)[0] || null;
}

export function publishVreadPost(game, input, rng = Math.random) {
    const text = String(input || '').trim();
    if (!text) return { success: false, message: 'Escribe una publicación antes de enviarla.' };
    if (text.length > 500) return { success: false, message: 'La publicación puede tener hasta 500 caracteres.' };
    const s = ensureVreadState(game), week = weekOf(game);
    const kind = classifyVreadPost(text), mentioned = findMentionedGame(game, text);
    const target = mentioned || game.activeSales?.[0] || game.gamesHistory?.[0] || null;
    const recent = s.posts.filter(post => post.week === week);
    const repeated = s.posts.slice(0, 8).some(post => normalize(post.text) === normalize(text));
    const fatigue = repeated ? 0 : Math.max(0.2, 1 - recent.length * 0.35);
    const ranges = { insult: [-.24, -12, 5], apology: [.055, 4, 3], patch: [.095, 3, 3], problem: [-.035, 1, 2], announcement: [.10, 3, 3], thanks: [.04, 2, 2], monetization: [-.07, -3, 3], boast: [-.06, -3, 3], question: [.015, 1, 2], multiplayer: [.015, 1, 2], platforms: [0, 0, 0], performance: [0, 0, 0], story: [0, 0, 0], releaseDate: [0, 0, 0], neutral: [0, 0, 0] };
    let [sales, reputation, duration] = ranges[kind];
    const troubled = target && (Number(target.score) < 6 || Number(target.technicalDebt ?? target.techDebt ?? 0) > 35 || Number(target.bugsAtRelease ?? target.bugs ?? 0) > 10);
    if (kind === 'apology' && !s.effects.some(effect => effect.amount < 0 && effect.expiresWeek >= week) && !troubled) { sales = .015; reputation = 1; }
    if (kind === 'boast' && troubled) { sales = -.16; reputation = -8; duration = 4; }
    if (kind === 'monetization' && /\b(gratis|gratuito|sin microtransacciones)\b/.test(normalize(text))) { sales = .04; reputation = 2; }
    sales *= fatigue; reputation = Math.round(reputation * fatigue);
    const previousReputation = s.reputation;
    s.reputation = Math.max(0, Math.min(100, s.reputation + reputation));
    reputation = s.reputation - previousReputation;
    if (sales && duration && !repeated) s.effects.push({ amount: sales, targetId: mentioned?.id ?? null, targetName: mentioned?.name ?? null, startWeek: week + 1, expiresWeek: week + duration, reason: kind });
    s.effects = s.effects.filter(effect => effect.expiresWeek >= week).slice(-30);
    const possibleReplies = REPLIES[kind] || REPLIES.patch;
    const backlash = kind === 'insult' || (kind === 'boast' && troubled);
    const includeHaters = backlash || s.reputation < 35;
    const replies = makeReplies(s, possibleReplies, (backlash ? 9 : 6) + Math.floor(rng() * 4), rng, { target: mentioned?.name, includeHaters });
    const isRatioed = backlash || (replies.filter(r => r.isHater).length >= Math.ceil(replies.length / 2));
    const post = { id: `user-${++s.sequence}`, isStudio: true, type: 'reviews', author: game.companyName || 'Tu Estudio', handle: normalize(game.companyName || 'estudio').replace(/[^a-z0-9]/g, ''), verified: true, time: 'Ahora', week, text,
        likes: Math.floor((backlash ? 20 : 55) + rng() * 90), reposts: Math.floor((backlash ? 120 : 20) + rng() * 80),
        replies,
        isRatioed,
        impact: { kind, sales: Math.round(sales * 1000) / 10, reputation, duration, targetName: mentioned?.name || null, backlash, repeated, isRatioed } };
    s.posts.unshift(post); s.posts = s.posts.slice(0, 100);
    if (typeof game.notify === 'function') game.notify();
    return { success: true, post, impact: post.impact };
}

export function getVreadSalesMultiplier(game, title, week = weekOf(game)) {
    const effects = ensureVreadState(game).effects;
    const delta = effects.reduce((sum, effect) => {
        if (week < effect.startWeek || week > effect.expiresWeek) return sum;
        if (effect.targetId != null && effect.targetId !== title.id && (!effect.targetName || normalize(effect.targetName) !== normalize(title.name))) return sum;
        if (effect.targetId == null && effect.targetName && normalize(effect.targetName) !== normalize(title.name)) return sum;
        const duration = effect.expiresWeek - effect.startWeek + 1;
        return sum + effect.amount * ((effect.expiresWeek - week + 1) / duration);
    }, 0);
    return Math.max(.55, Math.min(1.35, 1 + delta));
}

export function generateVreadFeed(game, rng = Math.random) {
    const s = ensureVreadState(game), week = weekOf(game);
    const currentName = game.companyName || 'Tu Estudio';
    const currentHandle = normalize(currentName).replace(/[^a-z0-9]/g, '') || 'estudio';
    const published = s.posts.slice(0, 20).map(post => ({ ...post, author: currentName, handle: currentHandle, isStudio: true,
        time: week > post.week ? `hace ${week - post.week} sem` : 'Ahora' }));
    const playerGames = (game.gamesHistory || []).filter(item => item?.name);
    const rivals = (game.ipCompanies || []).filter(co => co?.name);
    const rivalGames = rivals.flatMap(co => (co.games || []).filter(item => item?.name).map(item => ({ ...item, studio: co.name })));
    const starters = [...OPENERS], endings = [...ENDINGS], people = [...PROFILES];
    const generated = [];
    const controversy = s.posts.find(post => post.impact?.backlash && week - post.week <= post.impact.duration && week >= post.week);
    if (controversy) {
        const reactions = [
            `La publicación reciente de ${currentName} ha molestado a parte de la comunidad. Espero que expliquen lo ocurrido.`,
            `Muchos jugadores están criticando la respuesta de ${currentName}. Una disculpa y medidas concretas ayudarían.`,
            `La polémica alrededor de ${currentName} sigue dando que hablar. La confianza se recupera con hechos.`,
            `No comparto el tono del mensaje de ${currentName}. Las críticas merecen una respuesta respetuosa.`
        ];
        for (let i = 0; i < 3; i++) {
            const person = people.splice(Math.floor(rng() * people.length), 1)[0];
            const text = reactions.splice(Math.floor(rng() * reactions.length), 1)[0];
            generated.push({ id: `backlash-${week}-${++s.sequence}`, type: 'reviews', author: person[0], handle: person[1], time: `${1 + i} h`, text, likes: Math.floor(100 + rng() * 1500), reposts: Math.floor(30 + rng() * 350), replies: makeReplies(s, REPLIES.insult, 3 + Math.floor(rng() * 3), rng, { exclude: [person[1]] }) });
        }
    }
    const categories = Array.from({ length: 14 }, (_, index) => index % 4);
    for (let i = categories.length - 1; i > 0; i--) {
        const other = Math.floor(rng() * (i + 1));
        [categories[i], categories[other]] = [categories[other], categories[i]];
    }
    let trendIncluded = false;
    for (let i = 0; i < categories.length; i++) {
        const candidate = categories[i];
        let key, sentence, replyKind = 'market', hashtags = '';
        if (candidate === 0 && playerGames.length) {
            const title = pick(playerGames.slice(0, 10), rng);
            const cleanTitle = cleanLegacyTitle(title.name);
            const score = Number(title.score ?? 6.5);
            const pool = rng() < 0.23 ? (score >= 8 ? PLAYER_MIXED : PLAYER_GOOD) : score >= 8 ? PLAYER_GOOD : score < 6 ? PLAYER_BAD : PLAYER_MIXED;
            const view = pickFreshView(s, 'player', title.id, pool, rng); key = `player:${title.id}:${view}`;
            sentence = `${cleanTitle} de ${currentName} ${view}.`;
            replyKind = 'player';
            hashtags = ` #${currentHandle}`;
        } else if (candidate === 1 && rivalGames.length) {
            const title = pick(rivalGames.slice(-50), rng), view = pickFreshView(s, 'rival-game', title.id, RIVAL_GAME, rng);
            const cleanTitle = cleanLegacyTitle(title.name);
            key = `rival-game:${title.id}:${view}`; sentence = `${cleanTitle} de ${title.studio} ${view}.`;
            replyKind = 'rivalGame';
            hashtags = ` #${normalize(title.studio).replace(/[^a-z0-9]/g, '')}`;
        } else if (candidate === 2 && rivals.length) {
            const company = pick(rivals, rng), view = pickFreshView(s, 'rival', company.id, RIVAL_STUDIO, rng);
            key = `rival:${company.id}:${view}`; sentence = `${company.name} ${view}.`;
            replyKind = 'rival';
            hashtags = ` #${normalize(company.name).replace(/[^a-z0-9]/g, '')}`;
        } else if (candidate === 3 && !trendIncluded && game.marketTrend?.topicName && game.marketTrend?.genreName) {
            trendIncluded = true;
            const trend = game.marketTrend;
            key = `trend:${trend.topicId}:${trend.genreId}`;
            sentence = `Ahora mismo se habla mucho de ${trend.topicName} y ${trend.genreName} en el mercado.`;
            hashtags = ` #${normalize(trend.topicId || trend.topicName).replace(/[^a-z0-9_]/g, '')} #${normalize(trend.genreId || trend.genreName).replace(/[^a-z0-9_]/g, '')}`;
        } else {
            const view = pick(MARKET, rng); key = `market:${view}`; sentence = view.charAt(0).toUpperCase() + view.slice(1) + '.';
            hashtags = ' #GameDev';
        }
        if (key.startsWith('market:') && s.recentFeed.includes(key)) {
            const available = MARKET.filter(text => !s.recentFeed.includes(`market:${text}`));
            if (available.length) { const view = pick(available, rng); key = `market:${view}`; sentence = view.charAt(0).toUpperCase() + view.slice(1) + '.'; }
        }
        s.recentFeed.push(key); if (s.recentFeed.length > 70) s.recentFeed.shift();
        const person = people.splice(Math.floor(rng() * people.length), 1)[0] || pick(PROFILES, rng);
        const opener = starters.splice(Math.floor(rng() * starters.length), 1)[0] || pick(OPENERS, rng);
        const ending = endings.splice(Math.floor(rng() * endings.length), 1)[0] || pick(ENDINGS, rng);
        const responseKind = feedReplyKind(sentence, replyKind);
        const responsePool = TOPIC_REPLIES[responseKind] || FEED_REPLIES[responseKind] || FEED_REPLIES.market;
        const replies = makeReplies(s, responsePool, 3 + Math.floor(rng() * 4), rng, { exclude: [person[1]] });
        const isLive = i % 6 === 5;
        const renderedSentence = opener.endsWith(',') ? sentence.charAt(0).toLowerCase() + sentence.slice(1) : sentence;
        generated.push({ id: `feed-${week}-${++s.sequence}`, type: isLive ? 'live' : candidate === 0 ? 'reviews' : 'trend', isLive, author: person[0], handle: person[1], verified: rng() < .25, time: isLive ? 'AHORA' : `${1 + Math.floor(rng() * 23)} h`, text: `${isLive ? 'En directo: estamos comentando esto. ' : ''}${opener} ${renderedSentence} ${ending}${hashtags}`, likes: Math.floor(30 + rng() * 3900), reposts: Math.floor(rng() * 500), replies });
    }

    // Add dynamic Hater posts into the feed
    const haterCount = rng() < 0.4 ? 3 : 2;
    for (let h = 0; h < haterCount; h++) {
        const haterPerson = pick(HATER_PROFILES, rng);
        const opener = pick(HATER_OPENERS, rng);
        const ending = pick(HATER_ENDINGS, rng);
        let attackSentence = '';
        let haterTag = 'Haters';

        if (h === 0 && playerGames.length) {
            const title = pick(playerGames.slice(0, 6), rng);
            const cleanTitle = cleanLegacyTitle(title.name);
            const attack = pick(HATER_PLAYER_ATTACKS, rng);
            attackSentence = `${cleanTitle} de ${currentName} ${attack}.`;
            haterTag = currentHandle;
        } else if (h === 1 && rivalGames.length) {
            const title = pick(rivalGames.slice(-25), rng);
            const cleanTitle = cleanLegacyTitle(title.name);
            const attack = pick(HATER_RIVAL_ATTACKS, rng);
            attackSentence = `${cleanTitle} de ${title.studio} ${attack}.`;
            haterTag = normalize(title.studio).replace(/[^a-z0-9]/g, '');
        } else {
            const rant = pick(HATER_MARKET_RANTS, rng);
            attackSentence = rant.charAt(0).toUpperCase() + rant.slice(1) + '.';
            haterTag = 'Gaming';
        }

        const haterReplies = makeReplies(s, FEED_REPLIES.player, 3 + Math.floor(rng() * 3), rng, { exclude: [haterPerson[1]], includeHaters: true });

        generated.push({
            id: `hater-${week}-${++s.sequence}`,
            type: 'hater',
            isHater: true,
            author: haterPerson[0],
            handle: haterPerson[1],
            verified: false,
            time: `${1 + Math.floor(rng() * 10)} h`,
            text: `${opener} ${attackSentence} ${ending} #${haterTag} #Haters #Gaming`,
            likes: Math.floor(50 + rng() * 950),
            reposts: Math.floor(25 + rng() * 450),
            replies: haterReplies
        });
    }

    return [...published, ...generated];
}

export function getCommunitySentiment(game) {
    const s = ensureVreadState(game);
    const rep = s.reputation ?? 50;
    const history = game.gamesHistory || [];
    const avgScore = history.length ? history.reduce((sum, g) => sum + (Number(g.score) || 6), 0) / history.length : 6.5;
    const hasBacklash = s.posts.some(p => p.impact?.backlash && (weekOf(game) - p.week <= (p.impact.duration || 3)));

    let haters = Math.max(8, Math.min(65, Math.round(30 - (rep - 50) * 0.4 + (6.5 - avgScore) * 5 + (hasBacklash ? 25 : 0))));
    let fans = Math.max(12, Math.min(80, Math.round(rep * 0.7 + (avgScore - 5) * 4 - (hasBacklash ? 20 : 0))));
    let neutral = Math.max(8, 100 - haters - fans);

    const total = haters + fans + neutral;
    haters = Math.round((haters / total) * 100);
    fans = Math.round((fans / total) * 100);
    neutral = 100 - haters - fans;

    let label = 'Comunidad Equilibrada';
    if (haters >= 40) label = 'Alerta: Oleada de Haters';
    else if (fans >= 65) label = 'Fandom Entregado';
    else if (hasBacklash) label = 'Polémica en Llamas';
    else if (rep >= 70) label = 'Excelente Reputación';
    else if (rep <= 30) label = 'Ambiente Hostil';

    return { fans, neutral, haters, label };
}
