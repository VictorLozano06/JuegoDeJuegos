import { TECH_TREE_NODES } from './data/techTreeData.js';
import { DAG_CATALOG } from './dag_engine.js';

const nodes = new Map(TECH_TREE_NODES.map(node => [node.id, node]));
const latest = (ids, year) => ids.filter(id => (nodes.get(id)?.eraYear ?? Infinity) <= year).at(-1);
const GRAPHICS = ['graphics_2d_v1', 'graphics_2d_v2', 'graphics_2d_v3', 'graphics_3d_v1', 'graphics_3d_v2', 'graphics_3d_v3', 'graphics_3d_v4', 'graphics_3d_v5', 'graphics_3d_v6', 'graphics_3d_v7'];
const PHYSICS = ['engine_physics_basic', 'engine_physics_advanced'];
const NETWORK = ['engine_local_multiplayer', 'engine_online_play', 'engine_dedicated_servers', 'engine_crossplay'];
const AUDIO = ['sound_stereo', 'sound_soundtrack_basic', 'sound_surround', 'sound_spatial_3d', 'sound_adaptive_music'];

/** Snapshot de la versión disponible en un año; no modifica el catálogo ni el I+D del estudio. */
export function getCommercialEngineVersion(engine, year) {
    if (!engine) return null;
    const currentYear = Math.floor(Number(year));
    const minYear = engine.minYear ?? 1990;
    if (!Number.isFinite(currentYear) || currentYear < minYear) return null;
    const releaseYear = minYear + Math.floor((currentYear - minYear) / 2) * 2;
    const features = [latest(GRAPHICS, currentYear), latest(PHYSICS, currentYear), latest(NETWORK, currentYear), latest(AUDIO, currentYear)];
    if (engine.id === 'commercial_unreal_pro') features.push('graphics_ray_tracing', 'graphics_ai_upscaling');
    if (engine.id === 'commercial_unity_apex') features.push('graphics_ai_upscaling');
    const historicalTechIds = [...new Set(features.filter(id => id && (nodes.get(id)?.eraYear ?? Infinity) <= currentYear))];
    const unlockedNodes = (engine.unlockedNodes || []).filter(id => {
        const node = DAG_CATALOG.find(item => item.id === id);
        return node && (node.minYear ?? 1982) <= currentYear;
    });
    return { ...engine, type: 'commercial', version: `${1 + Math.floor((releaseYear - minYear) / 2)}.0`, releaseYear, historicalTechIds, unlockedNodes,
        desc: 'Versión comercial actualizada por su proveedor. Incluye tecnologías de su época durante el proyecto; la licencia conserva sus costes y regalías.' };
}
