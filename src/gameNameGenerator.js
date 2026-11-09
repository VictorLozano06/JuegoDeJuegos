/**
 * Creative game title and franchise name generator.
 * Generates thematic, authentic, professional video game titles for rival companies
 * and IP franchises, completely eliminating generic placeholders like 'Theme: Genre N (Company)'.
 */

const ROMAN_NUMERALS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];

export const THEME_TITLE_POOLS = {
    medieval: [
        'Crónicas de Ávalon', 'El Reino Perdido', 'Leyendas de Acero', 'Sombra y Ceniza',
        'Espada del Destino', 'Señores de Eldoria', 'Corona Maldita', 'Bastión Sagrado',
        'Canto de Hierro', 'Lanza del Destino', 'Tierras de Gloria', 'El Último Paladín',
        'Ecos de Valoria', 'El Trono de Sombras', 'Caballeros de Sangre', 'La Cripta del Rey'
    ],
    sports: [
        'Copa Mundial', 'Supercopa Máster', 'Asfalto Extremo', 'Gol de Oro',
        'Pista de Campeones', 'Balón de Leyenda', 'Gran Derbi Pro', 'Furia en la Cancha',
        'Torneo Supremo', 'Puro Deporte', 'Desafío Atlético', 'Leyendas de la Pista',
        'Copa Continental', 'Remate Final', 'Líderes del Asfalto', 'Penta Campeones'
    ],
    space: [
        'Odisea Estelar', 'Frontera Solar', 'Horizonte Nova', 'Sector Alfa',
        'Navegante Cósmico', 'Eclipse Galáctico', 'Órbita Muerta', 'Proyecto Andrómeda',
        'Cielos Infinitos', 'Viajeros de Orión', 'Estación Némesis', 'Abismo Cósmico',
        'Vanguardia Solar', 'Nebulosa Oscura', 'Misión Interestelar', 'Réquiem Espacial'
    ],
    martial_arts: [
        'Puño del Dragón', 'Senda del Tigre', 'Maestro del Viento', 'Dojo Sagrado',
        'Furia de Acero', 'El Último Shinobi', 'Golpe Definitivo', 'Camino del Guerrero',
        'Garras del Halcón', 'Honor Milenario', 'Espíritu de Lucha', 'Doble Dragón',
        'Sombras del Shogun', 'Puño Relámpago', 'Disciplina de Sangre', 'Venganza Ninja'
    ],
    military: [
        'Operación Trueno', 'Frente de Combate', 'Vanguardia Táctica', 'Línea de Fuego',
        'Comando Élite', 'Asalto Nocturno', 'Zona de Impacto', 'Falcón Bravo',
        'Protocolo Bélico', 'Guerra Total', 'Punto Cero', 'Misión Crítica',
        'Fuego Cruzado', 'Incursión Roja', 'Batallón Negro', 'Fuerza Especial'
    ],
    espionage: [
        'Agente Sombra', 'Operación Vértigo', 'Protocolo Silencio', 'Espía Fantasma',
        'Infiltración Cero', 'Código Enigma', 'Misión Subterránea', 'Filtro de Datos',
        'Conspiración Fría', 'Doble Agente', 'Ojo Blindado', 'Sombra Táctica'
    ],
    western: [
        'Forajidos de Red Rock', 'Fiebre del Oro', 'Duelo al Sol', 'La Ley del Cañón',
        'Tierra Salvaje', 'El Último Renegado', 'Viento del Desierto', 'Cazador de Recompensas',
        'Frontera Letal', 'Plata y Plomo', 'Ruta de la Diligencia', 'El Valle Perdido'
    ],
    pirates: [
        'Corsarios del Caribe', 'La Isla Calavera', 'Mareas Negras', 'El Tesoro Prohibido',
        'Viento en Popa', 'Galeón Fantasma', 'Reina de los Mares', 'Bandera Negra',
        'Bahía Fortuna', 'Motín en Altamar', 'La Brújula de Oro', 'Olas de Sangre'
    ],
    horror: [
        'Pesadilla en la Cripta', 'Sombras de la Niebla', 'La Mansión Negra', 'Silencio Sepulcral',
        'Ecos del Abismo', 'Noche de Réquiem', 'Penumbra Eterna', 'El Sanatorio Maldito',
        'Susurros en la Oscuridad', 'Rito Siniestro', 'Terror en el Pasillo', 'La Maldición de Caín'
    ],
    comedy: [
        'Locura en la Oficina', '¡Menudo Lío!', 'Caos Vecinal', 'Aventuras Chifladas',
        'El Gran Desmadre', 'Vacaciones Desastrosas', 'Pánico en el Supermercado', '¡Vaya Desastre!',
        'Vecinos en Guerra', 'Operación Descontrol', 'Escape Disparatado', 'La Fuga del Ganso'
    ],
    detective: [
        'Caso Sin Resolver', 'Sombras en la Calle 9', 'El Misterio del Cuervo', 'Crimen en la Niebla',
        'Pista Cero', 'Expediente Oculto', 'El Enigma de Medianoche', 'La Huella Falsa',
        'Detective Privado', 'El Testigo Mudo', 'Huellas en el Barro', 'Secreto Confidencial'
    ],
    racing: [
        'Turbo Drive', 'Velocidad Máxima', 'Derrape Total', 'Grand Prix 80',
        'Asfalto Caliente', 'Pista Pro', 'Aceleración Cero', 'Circuito Extremo',
        'Fiebre del Motor', 'Ruta Peligrosa', 'Rally Salvaje', 'Nitro Overdrive'
    ],
    hospital: [
        'Urgencias Totales', 'Clínica San Borja', 'Doctor en Apuros', 'Hospital Central',
        'Turno de Guardia', 'Cirugía Extrema', 'Código Azul', 'Salud y Fortuna'
    ],
    city: [
        'Metrópolis Viva', 'Constructor Urbano', 'Ciudad de Cristal', 'Gran Avenida',
        'Plan Director', 'Distrito Capital', 'Alcaldía Pro', 'Megaciudad'
    ],
    cyberpunk: [
        'Neo Tokio', 'Protocolo Matriz', 'Ciber-Infiltrado', 'Código Sombra',
        'Nexus 2099', 'Sobrecarga de Datos', 'Falla de Sistema', 'Red Sintética',
        'Hacker Prime', 'Circuito Rebelde', 'Megaciudad Zero', 'Ciberpunk Runner'
    ],
    superheroes: [
        'Vigilantes de Acero', 'Héroe Supremo', 'Alianza de Poder', 'Furia del Titán',
        'Escuadrón Guardián', 'El Elegido', 'Fuerza Máxima', 'Legado de Héroes'
    ],
    zombies: [
        'Infestación Z', 'Noche de Muertos', 'Refugio Cero', 'Virus Alfa',
        'Apocalipsis Letal', 'Ciudad Infectada', 'Zona de Cuarentena', 'Supervivencia Z',
        'Horda Letal', 'El Último Amanecer', 'Pandemia Muerta', 'Zona Roja'
    ],
    tuning: [
        'Tuning Nights', 'Callejero Pro', 'Motor Modificado', 'Furia Mecánica',
        'Asfalto y Óxido', 'Carrocería Extrema', 'Tuning Club', 'Gomas Quemadas'
    ],
    apocalypse: [
        'Yermo Infinito', 'Cenizas de la Humanidad', 'Tierra Baldía', 'Sobreviviente',
        'Horizonte Radioactivo', 'Último Refugio', 'Era del Polvo', 'Ruinas del Mundo'
    ],
    pets: [
        'Mascotas Felices', 'Amigos de Cuatro Patas', 'Refugio Animal', 'Parque de Cachorros',
        'Pequeños Compañeros', 'Gatitos en Acción', 'Veterinaria Feliz', 'El Mundo de las Mascotas'
    ],
    prison: [
        'Fuga Imposible', 'Muros de Acero', 'Bloque Máximo', 'El Penal',
        'Plan de Escape', 'Pabellón 4', 'Régimen Cerrado', 'Alcaide'
    ],
    themepark: [
        'Parque Fantasía', 'Montaña Rusa Tycoon', 'Atracciones Mágicas', 'Aventura Park',
        'Diversión Total', 'Feria Encantada', 'Reino de Atracciones', 'Parque de Ilusiones'
    ],
    hacking: [
        'Terminal Root', 'Ciber-Brecha', 'Protocolo Fantasma', 'Backdoor 01',
        'Cero Absoluto', 'Código Vulnerable', 'Infiltrado Digital', 'Seguridad Comprometida'
    ],
    anime: [
        'Crónicas del Destino', 'Academia de Magia', 'Senda de Cristal', 'Guerreros de Luz',
        'Viento Espiritual', 'Espada Luminosa', 'Chicas de Sakura', 'El Despertar del Héroe'
    ],
    mafia: [
        'La Familia', 'Cosa Nostra', 'El Don de la Ciudad', 'Pacto Silencioso',
        'Calles de Sangre', 'Honor y Negocios', 'Imperio Clandestino', 'El Capo Supremo'
    ],
    farming: [
        'Granja Alegre', 'Cosecha Dorada', 'Valle Soleado', 'Vida en el Campo',
        'Rincón Verde', 'El Manantial', 'Tierra Fértil', 'Primavera en el Valle'
    ],
    mythology: [
        'Ira del Olimpo', 'Réquiem Nórdico', 'Hijos de Odín', 'El Juicio de Zeus',
        'Titanes en Guerra', 'Valhalla', 'El Laberinto del Minotauro', 'Lanzas de los Dioses'
    ],
    school: [
        'Días de Instituto', 'Campana Escolar', 'El Pasillo Central', 'Examen Sorpresa',
        'Vida de Estudiante', 'Club de Ciencias', 'El Gran Torneo Escolar', 'Amistad y Letras'
    ],
    folklore: [
        'Mitos del Bosque', 'Cuentos de la Noche', 'Leyendas del Río', 'Espíritus del Monte',
        'Sombras de Aldea', 'Canto Ancestral', 'Brujería y Sal', 'El Guardián del Valle'
    ],
    influencer: [
        'Fiebre de Seguidores', 'Streamer de Éxito', 'Viral Nights', 'En Vivo Ahora',
        'Tendencia Total', 'El Canal Oficial', 'Reto Extremo', 'Fama Digital'
    ],
    tactical: [
        'Operaciones Tácticas', 'Escuadrón Sigilo', 'Zona de Conflicto', 'Orden de Mando',
        'Intervención Rápida', 'Punto de Ruptura', 'Coordinación Alfa', 'Mando Estratégico'
    ],
    crypto: [
        'Cripto Fiebre', 'Mineros de Bloque', 'Cadena de Datos', 'Bolsa Digital',
        'Burbuja Tecnológica', 'El Libro Mayor', 'Token Extremo', 'Fiebre Monetaria'
    ],
    multiverse: [
        'Grieta Dimensional', 'Ecos del Multiverso', 'Paradoja Temporal', 'Universos Paralelos',
        'Línea de Tiempo Cero', 'Saltador de Realidades', 'Colisión Cósmica', 'Fractura Cuántica'
    ],
    cleaning: [
        'Limpieza a Fondo', 'Brillo Extremo', 'Servicio Impecable', 'Manitas y Escoba',
        'Misión Limpieza', 'El Gran Repaso', 'Desinfección Total', 'Orden y Paz'
    ],
    backrooms: [
        'Nivel Cero', 'Pasillos Infinitos', 'La Habitación Amarilla', 'Laberinto Liminal',
        'Sin Salida', 'Entidad en la Sombra', 'Ecos en la Moqueta', 'Escape Liminal'
    ],
    ai: [
        'Inteligencia Singular', 'El Núcleo Consciente', 'Red Neuronal Alfa', 'Sintético Vivo',
        'Protocolo Despierto', 'Mente Mecánica', 'Evolución Silicio', 'El Algoritmo Maestro'
    ]
};

const SUBTITLES = [
    'Orígenes', 'El Despertar', 'Resurrección', 'Nueva Era', 'Revolución',
    'Conquista', 'Edición Oro', 'El Retorno', 'Venganza', 'Destino',
    'Réquiem', 'Trascendencia', 'Fin de la Era', 'Sombra Eterna', 'Horizonte'
];

/**
 * Converts a sequence integer to a clean Roman Numeral (e.g. 2 -> 'II', 3 -> 'III').
 */
export function toRomanNumeral(num) {
    if (!Number.isInteger(num) || num < 1) return '';
    return ROMAN_NUMERALS[num] || String(num);
}

/**
 * Normalizes a theme identifier or display name into a dictionary key.
 */
function normalizeTheme(themeKey) {
    if (!themeKey) return 'medieval';
    const clean = String(themeKey).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (THEME_TITLE_POOLS[clean]) return clean;
    if (clean.includes('espacio') || clean.includes('space') || clean.includes('scifi')) return 'space';
    if (clean.includes('deporte') || clean.includes('sport') || clean.includes('futbol')) return 'sports';
    if (clean.includes('marcial') || clean.includes('ninja')) return 'martial_arts';
    if (clean.includes('comedia') || clean.includes('comedy') || clean.includes('humor')) return 'comedy';
    if (clean.includes('terror') || clean.includes('horror')) return 'horror';
    if (clean.includes('carrera') || clean.includes('racing') || clean.includes('auto')) return 'racing';
    if (clean.includes('oeste') || clean.includes('western')) return 'western';
    if (clean.includes('militar') || clean.includes('war')) return 'military';
    if (clean.includes('misterio') || clean.includes('detective')) return 'detective';
    return 'medieval';
}

/**
 * Generates an authentic, immersive game title.
 */
export function generateGameTitle(themeId, genreId, existingTitles = new Set(), rng = Math.random) {
    const key = normalizeTheme(themeId);
    const pool = THEME_TITLE_POOLS[key] || THEME_TITLE_POOLS.medieval;
    const available = pool.filter(title => !existingTitles.has(title));

    if (available.length > 0) {
        const index = Math.floor(rng() * available.length);
        return available[index];
    }

    // If pool is exhausted in this session, pick from pool with a subtitle
    const baseIndex = Math.floor(rng() * pool.length);
    const subIndex = Math.floor(rng() * SUBTITLES.length);
    const combined = `${pool[baseIndex]}: ${SUBTITLES[subIndex]}`;
    if (!existingTitles.has(combined)) return combined;

    // Guaranteed fallback
    return `${pool[baseIndex]} (${toRomanNumeral(2 + Math.floor(rng() * 6))})`;
}

/**
 * Generates a clean sequel title (e.g. 'Odisea Estelar' -> 'Odisea Estelar II').
 * Strips any legacy trailing company or numbers before appending Roman numerals.
 */
export function generateSequelName(baseName, installment = 2) {
    if (!baseName) return `Franquicia ${toRomanNumeral(installment)}`;
    let cleanBase = String(baseName)
        .replace(/\s*\([^)]*\)\s*$/, '') // remove trailing company like (Nébula Interactive)
        .replace(/\s+(?:[IVXLCDM]+|\d+)$/i, '') // remove existing trailing roman or digit
        .trim();

    // Check if cleanBase has colon formatting like 'Comedia: Aventura 11'
    if (cleanBase.includes(':') && /^[A-ZÁÉÍÓÚa-záéíóú\s]+:\s*[A-ZÁÉÍÓÚa-záéíóú\s]+(?:\s*\d+)?$/.test(cleanBase)) {
        cleanBase = cleanLegacyTitle(cleanBase);
        cleanBase = cleanBase.replace(/\s+(?:[IVXLCDM]+|\d+)$/i, '').trim();
    }

    const roman = toRomanNumeral(installment);
    return roman ? `${cleanBase} ${roman}` : cleanBase;
}

/**
 * Cleans ugly placeholder names like 'Comedia: Aventura 11 (Nébula Interactive) 5'
 * into authentic titles like 'Locura en la Oficina V'.
 */
export function cleanLegacyTitle(title, fallbackTheme = 'comedy', fallbackGenre = 'adventure', rng = Math.random) {
    if (!title || typeof title !== 'string') return title;
    const match = title.match(/^([^:]+):\s*(.+?)(?:\s+\d+)?(?:\s*\(([^)]+)\))?(?:\s+(\d+))?$/);
    if (!match) {
        // Just strip company parentheses if present
        return title.replace(/\s*\([^)]+\)/g, '').trim();
    }

    const themeString = match[1];
    const themeKey = normalizeTheme(themeString);
    const pool = THEME_TITLE_POOLS[themeKey] || THEME_TITLE_POOLS[normalizeTheme(fallbackTheme)] || THEME_TITLE_POOLS.medieval;
    
    // Pick deterministic index based on title hash so the same legacy string always gets the same clean title
    let hash = 0;
    for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
    const baseTitle = pool[hash % pool.length];

    const seq = match[4] ? parseInt(match[4], 10) : null;
    if (seq && seq > 1) {
        return `${baseTitle} ${toRomanNumeral(seq)}`;
    }
    return baseTitle;
}

/**
 * Sanitizes all rival titles, projects, IPs and top10Chart entries in a live game instance.
 */
export function sanitizeRivalTitles(game) {
    if (!game) return;

    // 1. Sanitize IP properties
    if (game.ipState?.properties) {
        for (const ip of game.ipState.properties) {
            if (ip.name && (ip.name.includes(':') || ip.name.includes('('))) {
                ip.name = cleanLegacyTitle(ip.name, ip.originalTopic, ip.originalGenre);
            }
        }
    }

    // 2. Sanitize Companies (games, projects, history)
    for (const company of game.ipCompanies || []) {
        for (const title of company.games || []) {
            if (title.name && (title.name.includes(':') || title.name.includes('('))) {
                title.name = cleanLegacyTitle(title.name, title.topicId || title.topic, title.genreId || title.genre);
            }
        }
        for (const project of company.projects || []) {
            if (project.name && (project.name.includes(':') || project.name.includes('('))) {
                project.name = cleanLegacyTitle(project.name, project.topicId || project.topic, project.genreId || project.genre);
            }
        }
        for (const item of company.history || []) {
            if (item.details && (item.details.includes(':') || item.details.includes('('))) {
                item.details = item.details.replace(/(Inició|Publicó)\s+([^.]+)/g, (full, verb, titleStr) => {
                    return `${verb} ${cleanLegacyTitle(titleStr.trim())}`;
                });
            }
        }
    }

    // 3. Sanitize top10Chart entries
    if (Array.isArray(game.top10Chart)) {
        for (const entry of game.top10Chart) {
            if (entry.title && (entry.title.includes(':') || entry.title.includes('('))) {
                entry.title = cleanLegacyTitle(entry.title);
            }
        }
    }
}

