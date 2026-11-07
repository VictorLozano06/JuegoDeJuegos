// =========================================================================
// CATÁLOGO COMPLETO DE TEMÁTICAS (THEMES_DATABASE)
// Clasificación por Eras, Costes de I+D, Público Ideal y Sinergias con Géneros
// =========================================================================

export const THEMES_DATABASE = [
    // --- A. INICIALES DE GARAJE (Año 1982 | 0 RP | Desbloqueadas por Defecto) ---
    {
        id: 'medieval',
        aliases: ['fantasy', 'fantasia', 'Fantasía Medieval'],
        name: 'Medieval',
        era: 'garage',
        unlockedYear: 1982,
        costRP: 0,
        idealAudience: 'Everyone',
        synergies: ['rpg', 'action', 'soulslike', 'roguelike'],
        incompatibilities: ['racing'],
        description: 'Castillos, espadas, magia arcana y leyendas heroicas.'
    },
    {
        id: 'sports',
        aliases: ['deportes', 'Deportes & Fútbol', 'futbol'],
        name: 'Deportes',
        era: 'garage',
        unlockedYear: 1982,
        costRP: 0,
        idealAudience: 'Everyone',
        synergies: ['simulation', 'action', 'casual'],
        incompatibilities: ['survival_horror', 'soulslike'],
        description: 'Competición atlética, estadios abarrotados y espíritu de equipo.'
    },
    {
        id: 'space',
        aliases: ['espacio', 'Exploración Espacial', 'scifi'],
        name: 'Espacio',
        era: 'garage',
        unlockedYear: 1982,
        costRP: 0,
        idealAudience: 'Everyone',
        synergies: ['shooter', 'strategy', 'simulation'],
        incompatibilities: ['cozy'],
        description: 'Galaxias desconocidas, naves estelares y estaciones orbitales.'
    },
    {
        id: 'martial_arts',
        aliases: ['ninja', 'artes_marciales', 'Artes Marciales & Ninja'],
        name: 'Artes Marciales',
        era: 'garage',
        unlockedYear: 1982,
        costRP: 0,
        idealAudience: 'Everyone',
        synergies: ['fighting', 'action'],
        incompatibilities: ['simulation', 'cozy'],
        description: 'Dojos milenarios, disciplina de combate cuerpo a cuerpo y honor.'
    },

    // --- B. ERA 80s (1983 - 1989 | Coste: 15 - 25 RP) ---
    {
        id: 'military',
        aliases: ['militar', 'Guerra Táctica', 'war'],
        name: 'Militar',
        era: '80s',
        unlockedYear: 1983,
        costRP: 15,
        idealAudience: 'Mature',
        synergies: ['shooter', 'strategy', 'battle_royale', 'extraction'],
        incompatibilities: ['casual', 'cozy'],
        description: 'Operaciones bélicas en el frente, armamento y disciplina táctica.'
    },
    {
        id: 'espionage',
        aliases: ['espionaje', 'Espionaje & Infiltración', 'spy'],
        name: 'Espionaje',
        era: '80s',
        unlockedYear: 1983,
        costRP: 20,
        idealAudience: 'Mature',
        synergies: ['stealth', 'adventure', 'action'],
        incompatibilities: ['casual', 'cozy'],
        description: 'Agentes secretos, gadgets clasificados y misiones encubiertas tras líneas enemigas.'
    },
    {
        id: 'western',
        aliases: ['oeste', 'Viejo Oeste & Forajidos', 'cowboy'],
        name: 'Oeste',
        era: '80s',
        unlockedYear: 1984,
        costRP: 15,
        idealAudience: 'Mature',
        synergies: ['action', 'shooter', 'adventure'],
        incompatibilities: ['cozy', 'casual'],
        description: 'Duelos al mediodía, saloons polvorientos y forajidos en la frontera.'
    },
    {
        id: 'pirates',
        aliases: ['pirate', 'piratas', 'Piratas & Corsarios'],
        name: 'Piratas',
        era: '80s',
        unlockedYear: 1984,
        costRP: 15,
        idealAudience: 'Everyone',
        synergies: ['adventure', 'strategy', 'rpg'],
        incompatibilities: ['racing', 'sports'],
        description: 'Navíos corsarios en altamar, islas del tesoro y motines piratas.'
    },
    {
        id: 'horror',
        aliases: ['terror', 'Terror Psicológico'],
        name: 'Terror',
        era: '80s',
        unlockedYear: 1985,
        costRP: 20,
        idealAudience: 'Mature',
        synergies: ['survival_horror', 'adventure', 'soulslike'],
        incompatibilities: ['casual', 'sports', 'cozy'],
        description: 'Casas encantadas, pesadillas psicológicas y criaturas en la oscuridad.'
    },
    {
        id: 'comedy',
        aliases: ['comedia', 'Comedia Absurda'],
        name: 'Comedia',
        era: '80s',
        unlockedYear: 1985,
        costRP: 15,
        idealAudience: 'Everyone',
        synergies: ['casual', 'adventure', 'platformer'],
        incompatibilities: ['survival_horror', 'soulslike'],
        description: 'Humor disparatado, situaciones ridículas y parodias hilarantes.'
    },
    {
        id: 'detective',
        aliases: ['mystery', 'misterio', 'Misterio Detective', 'noir'],
        name: 'Detective',
        era: '80s',
        unlockedYear: 1986,
        costRP: 20,
        idealAudience: 'Mature',
        synergies: ['adventure', 'strategy'],
        incompatibilities: ['battle_royale', 'racing'],
        description: 'Pistas forenses, interrogatorios en callejones oscuros e intriga policíaca.'
    },
    {
        id: 'racing',
        aliases: ['carreras', 'Carreras Callejeras'],
        name: 'Carreras',
        era: '80s',
        unlockedYear: 1986,
        costRP: 20,
        idealAudience: 'Everyone',
        synergies: ['simulation', 'action', 'casual'],
        incompatibilities: ['rpg', 'soulslike', 'survival_horror'],
        description: 'Velocidad punta, trazadas de curvas y adelantamientos al límite.'
    },
    {
        id: 'hospital',
        aliases: ['Gestor de Hospital', 'medicina'],
        name: 'Hospital',
        era: '80s',
        unlockedYear: 1987,
        costRP: 25,
        idealAudience: 'Everyone',
        synergies: ['simulation', 'strategy'],
        incompatibilities: ['battle_royale', 'shooter', 'fighting', 'action'],
        description: 'Urgencias médicas, diagnósticos insólitos y gestión sanitaria.'
    },
    {
        id: 'city',
        aliases: ['citybuilder', 'ciudad', 'Constructor de Ciudades'],
        name: 'Ciudad',
        era: '80s',
        unlockedYear: 1989,
        costRP: 25,
        idealAudience: 'Everyone',
        synergies: ['strategy', 'simulation'],
        incompatibilities: ['fighting', 'soulslike'],
        description: 'Urbanismo, zonificación de rascacielos y servicios públicos metropolitanos.'
    },

    // --- C. ERA 90s (1990 - 1999 | Coste: 35 - 50 RP) ---
    {
        id: 'cyberpunk',
        aliases: ['cyber', 'distopia'],
        name: 'Cyberpunk',
        era: '90s',
        unlockedYear: 1990,
        costRP: 35,
        idealAudience: 'Mature',
        synergies: ['rpg', 'shooter', 'stealth', 'action'],
        incompatibilities: ['cozy', 'casual'],
        description: 'Luces de neón bajo lluvia ácida, implantes cibernéticos y megacorporaciones.'
    },
    {
        id: 'superheroes',
        aliases: ['superhero', 'Superhéroes', 'heroes'],
        name: 'Superhéroes',
        era: '90s',
        unlockedYear: 1992,
        costRP: 35,
        idealAudience: 'Young',
        synergies: ['action', 'fighting', 'adventure'],
        incompatibilities: ['simulation'],
        description: 'Capas ondeantes, superpoderes destructivos y defensa de la justicia.'
    },
    {
        id: 'zombies',
        aliases: ['zombie', 'Supervivencia Zombie', 'infectados'],
        name: 'Zombies',
        era: '90s',
        unlockedYear: 1993,
        costRP: 40,
        idealAudience: 'Mature',
        synergies: ['survival_horror', 'shooter', 'action'],
        incompatibilities: ['cozy', 'sports'],
        description: 'Hordas de no-muertos, refugios fortificados y peligro biológico.'
    },
    {
        id: 'tuning',
        aliases: ['custom_cars', 'modificaciones'],
        name: 'Tuning',
        era: '90s',
        unlockedYear: 1995,
        costRP: 35,
        idealAudience: 'Young',
        synergies: ['simulation', 'racing'],
        incompatibilities: ['rpg', 'soulslike', 'survival_horror'],
        description: 'Óxido nitroso, tubos de escape personalizados y carreras nocturnas ilegales.'
    },
    {
        id: 'apocalypse',
        aliases: ['postapoc', 'Post-Apocalipsis', 'yermo', 'postapocalyptic'],
        name: 'Apocalipsis',
        era: '90s',
        unlockedYear: 1996,
        costRP: 45,
        idealAudience: 'Mature',
        synergies: ['rpg', 'extraction', 'strategy', 'survival_horror'],
        incompatibilities: ['cozy', 'casual'],
        description: 'Páramos radiactivos, clanes carroñeros y supervivencia en ruinas de la civilización.'
    },
    {
        id: 'pets',
        aliases: ['virtualpet', 'Mascota Virtual', 'animales'],
        name: 'Mascotas',
        era: '90s',
        unlockedYear: 1996,
        costRP: 35,
        idealAudience: 'Young',
        synergies: ['simulation', 'cozy', 'casual'],
        incompatibilities: ['battle_royale', 'extraction', 'shooter', 'fighting'],
        description: 'Crianza afectiva, trucos de entrenamiento y cuidados de cachorros adorables.'
    },
    {
        id: 'prison',
        aliases: ['prision', 'carcel'],
        name: 'Prisión',
        era: '90s',
        unlockedYear: 1997,
        costRP: 45,
        idealAudience: 'Mature',
        synergies: ['strategy', 'simulation', 'stealth'],
        incompatibilities: ['cozy', 'racing'],
        description: 'Módulos penitenciarios de máxima seguridad, motines y planes de fuga.'
    },
    {
        id: 'themepark',
        aliases: ['parque', 'parque_atracciones'],
        name: 'Parque',
        era: '90s',
        unlockedYear: 1999,
        costRP: 50,
        idealAudience: 'Everyone',
        synergies: ['simulation', 'strategy'],
        incompatibilities: ['fighting', 'shooter', 'soulslike'],
        description: 'Montañas rusas vertiginosas, atracciones mecánicas y visitantes satisfechos.'
    },

    // --- D. ERA 2000s (2000 - 2009 | Coste: 60 - 75 RP) ---
    {
        id: 'hacking',
        aliases: ['Simulador Hacker', 'ciberseguridad'],
        name: 'Hacking',
        era: '2000s',
        unlockedYear: 2000,
        costRP: 60,
        idealAudience: 'Mature',
        synergies: ['strategy', 'simulation', 'stealth'],
        incompatibilities: ['casual', 'sports'],
        description: 'Comandos de terminal, intrusiones en servidores proxy y robo de datos cifrados.'
    },
    {
        id: 'anime',
        aliases: ['Anime & Novela Visual', 'manga'],
        name: 'Anime',
        era: '2000s',
        unlockedYear: 2001,
        costRP: 60,
        idealAudience: 'Young',
        synergies: ['rpg', 'fighting', 'auto_battler'],
        incompatibilities: ['simulation'],
        description: 'Estética japonesa estilizada, diálogos dramáticos y ataques especiales cargados.'
    },
    {
        id: 'mafia',
        aliases: ['gangster', 'crimen_organizado'],
        name: 'Mafia',
        era: '2000s',
        unlockedYear: 2002,
        costRP: 70,
        idealAudience: 'Mature',
        synergies: ['shooter', 'strategy', 'action'],
        incompatibilities: ['cozy', 'casual'],
        description: 'Familias criminales, extorsión de negocios y guerras territoriales en la ciudad.'
    },
    {
        id: 'farming',
        aliases: ['Vida Rural & Granja', 'granja'],
        name: 'Granja',
        era: '2000s',
        unlockedYear: 2003,
        costRP: 65,
        idealAudience: 'Everyone',
        synergies: ['cozy', 'simulation', 'casual'],
        incompatibilities: ['shooter', 'battle_royale', 'fighting'],
        description: 'Siembra de cosechas estacionales, cuidado de ganado y vida campestre serena.'
    },
    {
        id: 'mythology',
        aliases: ['mitologia', 'dioses', 'leyendas'],
        name: 'Mitología',
        era: '2000s',
        unlockedYear: 2005,
        costRP: 70,
        idealAudience: 'Everyone',
        synergies: ['soulslike', 'rpg', 'deckbuilder', 'action'],
        incompatibilities: ['racing', 'sports'],
        description: 'Panteones griegos, nórdicos y egipcios; bestias mitológicas y batallas divinas.'
    },
    {
        id: 'school',
        aliases: ['escuela', 'instituto', 'colegio'],
        name: 'Escuela',
        era: '2000s',
        unlockedYear: 2006,
        costRP: 65,
        idealAudience: 'Young',
        synergies: ['adventure', 'simulation', 'cozy'],
        incompatibilities: ['battle_royale', 'extraction', 'shooter'],
        description: 'Pasillos escolares, exámenes decisivos, clubes estudiantiles y amistades juveniles.'
    },

    // --- E. ERA CONTEMPORÁNEA (2010 en adelante | Coste: 90 - 130 RP) ---
    {
        id: 'folklore',
        aliases: ['folclore', 'leyendas_populares'],
        name: 'Folclore',
        era: 'contemporary',
        unlockedYear: 2015,
        costRP: 95,
        idealAudience: 'Mature',
        synergies: ['soulslike', 'adventure', 'horror'],
        incompatibilities: ['racing', 'casual'],
        description: 'Tradiciones locales oscuras, espíritus del bosque y fábulas ancestrales orales.'
    },
    {
        id: 'influencer',
        aliases: ['streamer_life', 'redes_sociales'],
        name: 'Influencer',
        era: 'contemporary',
        unlockedYear: 2015,
        costRP: 100,
        idealAudience: 'Young',
        synergies: ['simulation', 'cozy', 'casual'],
        incompatibilities: ['soulslike', 'survival_horror'],
        description: 'Creación de contenido viral, algoritmos de interacción y directos multitudinarios.'
    },
    {
        id: 'tactical',
        aliases: ['tactico', 'tactical_shooter'],
        name: 'Tactical',
        era: 'contemporary',
        unlockedYear: 2016,
        costRP: 90,
        idealAudience: 'Mature',
        synergies: ['extraction', 'shooter', 'stealth'],
        incompatibilities: ['casual', 'cozy'],
        description: 'Balística realista, comunicación por radio milimétrica y operaciones especiales breves.'
    },
    {
        id: 'crypto',
        aliases: ['cripto', 'blockchain'],
        name: 'Cripto',
        era: 'contemporary',
        unlockedYear: 2017,
        costRP: 105,
        idealAudience: 'Mature',
        synergies: ['simulation', 'strategy'],
        incompatibilities: ['soulslike', 'survival_horror', 'platformer'],
        description: 'Minería digital, fluctuaciones bruscas de mercado y especulación financiera.'
    },
    {
        id: 'multiverse',
        aliases: ['multiverso', 'dimensiones'],
        name: 'Multiverso',
        era: 'contemporary',
        unlockedYear: 2018,
        costRP: 115,
        idealAudience: 'Everyone',
        synergies: ['fighting', 'action', 'auto_battler'],
        incompatibilities: ['simulation'],
        description: 'Líneas temporales fracturadas, variantes interdimensionales y colisión de mundos.'
    },
    {
        id: 'cleaning',
        aliases: ['limpieza', 'powerwash', 'orden'],
        name: 'Limpieza',
        era: 'contemporary',
        unlockedYear: 2019,
        costRP: 90,
        idealAudience: 'Everyone',
        synergies: ['cozy', 'simulation', 'casual'],
        incompatibilities: ['battle_royale', 'extraction', 'shooter', 'fighting'],
        description: 'Lavado a presión ultra-satisfactorio, restauración de entornos y desinfección metódica.'
    },
    {
        id: 'backrooms',
        aliases: ['liminal_spaces', 'espacios_liminales'],
        name: 'Backrooms',
        era: 'contemporary',
        unlockedYear: 2021,
        costRP: 120,
        idealAudience: 'Mature',
        synergies: ['survival_horror', 'adventure'],
        incompatibilities: ['sports', 'cozy', 'casual'],
        description: 'Moqueta húmeda interminable, zumbido de fluorescentes y terror en espacios liminales.'
    },
    {
        id: 'ai',
        aliases: ['ia', 'inteligencia_artificial', 'singularity'],
        name: 'I.A.',
        era: 'contemporary',
        unlockedYear: 2022,
        costRP: 130,
        idealAudience: 'Mature',
        synergies: ['strategy', 'cyberpunk', 'stealth'],
        incompatibilities: ['casual', 'cozy'],
        description: 'Modelos neuronales autorecursivos, agentes autónomos y el dilema de la singularidad.'
    }
];

export const THEMES_MAP = new Map(THEMES_DATABASE.map(t => [t.id, t]));

// Polyfill dynamic genreFit for backwards compatibility with legacy reviews / UI
THEMES_DATABASE.forEach(t => {
    t.genreFit = {};
    const optimal = t.synergies || [];
    const bad = t.incompatibilities || [];
    const allKnownGenres = [
        'action', 'Action', 'adventure', 'Adventure', 'rpg', 'RPG',
        'strategy', 'Strategy', 'simulation', 'Simulation', 'casual', 'Casual',
        'platformer', 'fighting', 'shooter', 'survival_horror', 'mmo', 'stealth',
        'roguelike', 'soulslike', 'deckbuilder', 'cozy', 'battle_royale', 'extraction', 'auto_battler'
    ];
    allKnownGenres.forEach(gId => {
        const gLow = gId.toLowerCase();
        if (optimal.some(s => s.toLowerCase() === gLow)) {
            t.genreFit[gId] = 1.35;
        } else if (bad.some(b => b.toLowerCase() === gLow)) {
            t.genreFit[gId] = 0.60;
        } else {
            t.genreFit[gId] = 1.00;
        }
    });
});

export function findTheme(idOrName) {
    if (!idOrName) return THEMES_DATABASE[0];
    if (typeof idOrName === 'object' && idOrName.id) return findTheme(idOrName.id);
    const query = String(idOrName).toLowerCase().trim();
    return THEMES_DATABASE.find(t =>
        t.id.toLowerCase() === query ||
        t.name.toLowerCase() === query ||
        (t.aliases && t.aliases.some(a => a.toLowerCase() === query))
    ) || THEMES_DATABASE[0];
}

// =========================================================================
// MATRIZ DE SINERGIA GÉNERO - TEMÁTICA
// =========================================================================

export function calculateSynergy(genreIdOrObj, themeIdOrObj) {
    const genreId = (typeof genreIdOrObj === 'object' ? genreIdOrObj?.id : genreIdOrObj) || '';
    const themeId = (typeof themeIdOrObj === 'object' ? themeIdOrObj?.id : themeIdOrObj) || '';

    const theme = findTheme(themeId);
    const gKey = String(genreId).toLowerCase().trim();

    // 1. Comprobar compatibilidad Óptima
    const isOptimal = (theme.synergies || []).some(s => s.toLowerCase() === gKey);
    if (isOptimal) {
        return {
            level: 'OPTIMAL',
            fit: 'OPTIMAL',
            label: 'ÓPTIMA',
            multiplier: 1.35,
            hypeBonus: 25,
            badgeClass: 'synergy-optimal',
            verdict: '¡Combinación Legendaria!',
            desc: `La temática "${theme.name}" encaja de forma magistral con la naturaleza del género.`
        };
    }

    // 2. Comprobar incompatibilidad Mala
    const isBad = (theme.incompatibilities || []).some(b => b.toLowerCase() === gKey);
    if (isBad) {
        return {
            level: 'BAD',
            fit: 'BAD',
            label: 'MALA',
            multiplier: 0.60,
            hypeBonus: -15,
            badgeClass: 'synergy-bad',
            verdict: 'Combinación Incompatible',
            desc: `Mezclar "${theme.name}" con este género desconcierta al público y a los analistas.`
        };
    }

    // 3. Neutro / Normal
    return {
        level: 'NORMAL',
        fit: 'NORMAL',
        label: 'NORMAL',
        multiplier: 1.00,
        hypeBonus: 0,
        badgeClass: 'synergy-normal',
        verdict: 'Combinación Viable',
        desc: `La combinación de "${theme.name}" resulta creíble y razonablemente equilibrada.`
    };
}
