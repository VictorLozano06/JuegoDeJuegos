export const OFFICE_CATALOG = Object.freeze([
    Object.freeze({
        id: 'garage',
        name: 'Garaje Retro',
        cost: 0,
        tier: 1,
        maxEmployees: 2,
        sceneId: 'garage',
        layoutId: 'garage-workstations',
        theme: 'retro',
        officeType: 'garage',
        description: 'El primer estudio: un garaje adaptado con dos puestos y costes reducidos.',
        monthlyCost: 300
    }),
    Object.freeze({
        id: 'modern',
        name: 'Oficina Moderna',
        cost: 500000,
        tier: 2,
        maxEmployees: 5,
        sceneId: 'modern',
        layoutId: 'modern-workstations',
        theme: 'modern',
        officeType: 'indie-studio',
        description: 'Una oficina moderna y profesional para un estudio en crecimiento, con un puesto de fundador y cuatro para el equipo.',
        monthlyCost: 6000,
        requiresOffice: 'garage'
    }),
    Object.freeze({
        id: 'campus',
        name: 'Campus Tecnológico Cyberpunk AAA',
        cost: 450000,
        tier: 3,
        maxEmployees: 8,
        sceneId: 'campus',
        layoutId: 'campus-workstations',
        theme: 'cyberpunk',
        officeType: 'campus',
        description: 'Una sede de gran capacidad para equipos y producciones AAA.',
        monthlyCost: 28000,
        requiresOffice: 'modern',
        minFunds: 1200000,
        minGames: 6,
        minScore: 8.5
    })
]);

export const STARTING_OFFICE = OFFICE_CATALOG[0];

export function findOffice(id) {
    return OFFICE_CATALOG.find(office => office.id === id);
}

export function migrateOfficeState(state) {
    const hasOfficeFields = Object.hasOwn(state, 'activeOfficeId') || Object.hasOwn(state, 'unlockedOfficeIds');
    if (!hasOfficeFields) {
        // Previously an era could only be reached by upgrading the office.
        const legacyOffice = OFFICE_CATALOG.find(office => office.tier === state.era) ?? STARTING_OFFICE;
        return {
            activeOfficeId: legacyOffice.id,
            unlockedOfficeIds: OFFICE_CATALOG.filter(office => office.tier <= legacyOffice.tier).map(office => office.id),
            era: legacyOffice.tier
        };
    }

    const savedIds = Array.isArray(state.unlockedOfficeIds) ? state.unlockedOfficeIds : [];
    const unlockedOfficeIds = [STARTING_OFFICE.id];
    for (const office of OFFICE_CATALOG.slice(1)) {
        if (savedIds.includes(office.id) && (!office.requiresOffice || unlockedOfficeIds.includes(office.requiresOffice))) {
            unlockedOfficeIds.push(office.id);
        }
    }
    const activeOffice = unlockedOfficeIds.includes(state.activeOfficeId)
        ? findOffice(state.activeOfficeId)
        : STARTING_OFFICE;
    return { activeOfficeId: activeOffice.id, unlockedOfficeIds, era: activeOffice.tier };
}
