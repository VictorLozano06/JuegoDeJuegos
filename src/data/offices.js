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
        cost: 0,
        tier: 3,
        maxEmployees: 10,
        sceneId: 'campus',
        layoutId: 'campus-workstations',
        theme: 'cyberpunk',
        officeType: 'campus',
        description: 'Una sede tecnológica con un puesto para el fundador y nueve para el equipo.',
        monthlyCost: 28000
    }),
    Object.freeze({
        id: 'pera-park',
        name: 'Pera Park',
        cost: 0,
        tier: 4,
        simulationEra: 3,
        maxEmployees: 10,
        sceneId: 'pera-park',
        layoutId: 'park-ring',
        theme: 'park',
        officeType: 'campus',
        description: 'La sede final: un anillo de cristal, jardines y tres edificios que puedes visitar.',
        monthlyCost: 28000
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
            era: legacyOffice.simulationEra ?? legacyOffice.tier
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
    return { activeOfficeId: activeOffice.id, unlockedOfficeIds, era: activeOffice.simulationEra ?? activeOffice.tier };
}
