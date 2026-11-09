import { AREAS } from './production.js';

export function formatHistoryAllocation(entry) {
    const areas = AREAS[entry?.stage];
    const allocation = entry?.allocation;
    if (!areas || !allocation || !Object.keys(areas).every(key => Number.isFinite(allocation[key]))) {
        return 'Reparto: Sin datos históricos';
    }
    return 'Reparto: ' + Object.entries(areas)
        .map(([key, label]) => `${label} ${allocation[key]}%`).join(' · ');
}
