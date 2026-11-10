import { ensureProduction } from './production.js';
import { InHouseEngine, ScopeDAG, ScopeNode, TechnicalDebtModel, TechTreeManager } from './dag_engine.js';
import { findOffice, migrateOfficeState } from './data/offices.js';
import { ensureBasicEngine } from './basic-engine.js';

const VERSION = 1;
const SLOT_PREFIX = 'dev-empire:save:';
const SETTINGS_KEY = 'dev-empire:settings';
const RUNTIME_FIELDS = new Set(['listeners', 'isPaused']);
const MODEL_TYPES = { InHouseEngine, ScopeDAG, ScopeNode, TechnicalDebtModel, TechTreeManager };

export const DEFAULT_SETTINGS = Object.freeze({
    soundVolume: 0.6,
    musicVolume: 0.3,
    resolution: 'high',
    shadows: 'medium',
    language: 'es',
    autosave: 'weekly'
});

function normalizeSettings(value = {}) {
    const volume = (key) => Number.isFinite(value?.[key])
        ? Math.max(0, Math.min(1, value[key])) : DEFAULT_SETTINGS[key];
    const choice = (key, allowed) => allowed.includes(value?.[key]) ? value[key] : DEFAULT_SETTINGS[key];
    return {
        soundVolume: volume('soundVolume'),
        musicVolume: volume('musicVolume'),
        resolution: choice('resolution', ['low', 'medium', 'high']),
        shadows: choice('shadows', ['off', 'low', 'medium', 'high']),
        language: choice('language', ['es', 'en']),
        autosave: choice('autosave', ['weekly', 'monthly', 'off'])
    };
}

// Games in activeSales and gamesHistory refer to the same objects. The table
// also preserves shared catalogs and the models used by projects in progress.
function encodeState(state) {
    const objects = [];
    const references = new Map();
    function encode(value) {
        if (value === undefined) return { special: 'undefined' };
        if (typeof value === 'number' && !Number.isFinite(value)) return { special: String(value) };
        if (value === null || typeof value !== 'object') return value;
        if (references.has(value)) return { ref: references.get(value) };

        const ref = objects.length;
        const record = {};
        references.set(value, ref);
        objects.push(record);
        if (Array.isArray(value)) {
            Object.assign(record, { type: 'Array', items: value.map(encode) });
        } else if (value instanceof Map) {
            Object.assign(record, { type: 'Map', items: [...value].map(([key, item]) => [encode(key), encode(item)]) });
        } else if (value instanceof Set) {
            Object.assign(record, { type: 'Set', items: [...value].map(encode) });
        } else {
            const model = Object.entries(MODEL_TYPES).find(([, Class]) => value instanceof Class);
            Object.assign(record, {
                type: model?.[0] ?? 'Object',
                items: Object.entries(value).map(([key, item]) => [key, encode(item)])
            });
        }
        return { ref };
    }
    return { root: encode(state), objects };
}

function decodeState({ root, objects }, techTreeManager) {
    const invalid = () => new Error('La estructura de la partida no es válida.');
    if (!Array.isArray(objects)) throw invalid();
    const decoded = objects.map((record) => {
        if (!Array.isArray(record?.items)) throw invalid();
        switch (record.type) {
            case 'Array': return [];
            case 'Map': return new Map();
            case 'Set': return new Set();
            case 'Object': return {};
            default:
                if (!Object.hasOwn(MODEL_TYPES, record.type)) throw invalid();
                return Object.create(MODEL_TYPES[record.type].prototype);
        }
    });

    // The live manager has existing UI subscribers. Decode into detached
    // objects first, then transfer the manager state when the save is valid.
    function decode(value) {
        if (value === null || typeof value !== 'object') return value;
        if (Number.isInteger(value.ref) && Object.hasOwn(decoded, value.ref)) return decoded[value.ref];
        switch (value.special) {
            case 'undefined': return undefined;
            case 'Infinity': return Infinity;
            case '-Infinity': return -Infinity;
            case 'NaN': return NaN;
            default: throw invalid();
        }
    }
    objects.forEach(({ type, items }, index) => {
        const value = decoded[index];
        if (type === 'Array') {
            items.forEach(item => value.push(decode(item)));
        } else if (type === 'Set') {
            items.forEach(item => value.add(decode(item)));
        } else {
            for (const pair of items) {
                if (!Array.isArray(pair) || pair.length !== 2) throw invalid();
                const [key, item] = pair;
                if (type === 'Map') value.set(decode(key), decode(item));
                else {
                    if (typeof key !== 'string' || ['__proto__', 'constructor', 'prototype'].includes(key)) throw invalid();
                    const property = decode(item);
                    Object.defineProperty(value, key, { value: property, writable: true, enumerable: true, configurable: true });
                }
            }
        }
    });
    const state = decode(root);
    validateState(state);
    if (state.currentProject) ensureProduction(state.currentProject);
    Object.assign(state, migrateOfficeState(state));
    // Keep references inside the hydrated project pointed at the UI's live manager.
    for (const value of decoded) {
        if (techTreeManager && value instanceof ScopeDAG && value.options?.techTreeManager === state.techTreeManager) {
            value.options.techTreeManager = techTreeManager;
        }
    }
    return state;
}

function validateState(state) {
    const project = state?.currentProject;
    const tree = state?.techTreeManager;
    if (!state || !Number.isFinite(state.funds) || typeof state.companyName !== 'string' ||
        !Number.isInteger(state.year) || state.year < 1 || !Number.isInteger(state.month) || state.month < 1 || state.month > 12 ||
        !Number.isInteger(state.week) || state.week < 1 || state.week > 4 ||
        typeof state.founder?.name !== 'string' || !Array.isArray(state.employees) || !state.employees.length ||
        !state.employees.every(employee => typeof employee?.id === 'string') ||
        !Array.isArray(state.gamesHistory) || !Array.isArray(state.activeSales) ||
        !(tree instanceof TechTreeManager) || !(tree.unlockedTechs instanceof Set) || !(tree.catalogMap instanceof Map) ||
        (project && (!project.genre || !project.platform || !project.topic || !project.sliders ||
            (project.scopeDAG && (!(project.scopeDAG instanceof ScopeDAG) || !(project.scopeDAG.nodes instanceof Map))) ||
            (project.techDebtModel && !(project.techDebtModel instanceof TechnicalDebtModel))))) {
        throw new Error('La estructura de la partida no es válida.');
    }
}

function persistentFields(game) {
    return Object.fromEntries(Object.entries(game).filter(([key, value]) =>
        !RUNTIME_FIELDS.has(key) && typeof value !== 'function'));
}

function replaceGame(game, savedState) {
    const defaults = persistentFields(new game.constructor());
    const state = { ...defaults, ...savedState };
    if (defaults.financeState) {
        if (!savedState?.financeState || typeof savedState.financeState !== 'object') {
            state.financeState = { ...defaults.financeState, lastBalance: state.funds };
        } else {
            state.financeState = { ...defaults.financeState, ...savedState.financeState,
                settings: { ...defaults.financeState.settings, ...savedState.financeState.settings } };
            if (!Number.isFinite(savedState.financeState.lastBalance)) state.financeState.lastBalance = state.funds;
        }
    }
    // Old saves had an empty placeholder for future rivals. Generate the initial
    // industry only once on migration; never overwrite existing companies.
    if (defaults.rivalSystemVersion && !savedState?.rivalSystemVersion &&
        (!Array.isArray(savedState?.ipCompanies) || savedState.ipCompanies.length === 0)) {
        state.ipCompanies = defaults.ipCompanies;
    }
    // Version 1 saves predate IP. Preserve existing data and fill only missing fields.
    if (defaults.ipState && state.ipState && typeof state.ipState === 'object' && !Array.isArray(state.ipState)) {
        state.ipState = { ...defaults.ipState, ...state.ipState,
            settings: { ...defaults.ipState.settings, ...state.ipState.settings } };
    }
    const liveManager = game.techTreeManager;
    for (const key of Object.keys(persistentFields(game))) delete game[key];
    for (const [key, value] of Object.entries(state)) {
        if (!RUNTIME_FIELDS.has(key) && typeof game[key] !== 'function') game[key] = value;
    }
    ensureBasicEngine(game);

    // MIGRATION & REFRESH: Always rebuild catalog and catalogMap from the fresh modern database
    // (82 items) so that saved games never retain obsolete research items.
    const freshManager = new defaults.techTreeManager.constructor();
    liveManager.catalog = freshManager.catalog;
    liveManager.allCatalog = freshManager.allCatalog;
    liveManager.catalogMap = freshManager.catalogMap;

    const LEGACY_TECH_MAP = {
        'tech_graphics_text_ascii': 'graphics_2d_v1',
        'tech_graphics_2d_sprites': 'graphics_2d_v2',
        'tech_graphics_fixed_palette': 'graphics_2d_v2',
        'tech_graphics_parallax_scroll': 'graphics_2d_v3',
        'tech_graphics_mode7': 'graphics_2d_v4',
        'tech_graphics_raycasting_pseudo3d': 'graphics_3d_v1',
        'tech_graphics_early_3d_polygons': 'graphics_3d_v1',
        'tech_graphics_gouraud_textures': 'graphics_3d_v2',
        'tech_graphics_hardware_accel': 'graphics_3d_v3',
        'tech_audio_pc_speaker': 'sound_mono',
        'tech_audio_chiptune_fm': 'sound_stereo',
        'tech_audio_midi': 'sound_soundtrack_basic',
        'tech_audio_sampled_wav_mod': 'sound_surround',
        'tech_code_pure_asm': 'engine_save_game',
        'tech_code_real_mode_mem': 'engine_save_game',
        'tech_code_c_cpp_migration': 'engine_local_multiplayer',
        'tech_net_lan_ipx': 'engine_local_multiplayer',
        'tech_net_dedicated_client_server': 'engine_dedicated_servers',
        'tech_net_matchmaking_leaderboards': 'engine_online_play',
        'tech_ai_rigid_patrol': 'ai_improved',
        'tech_ai_astar_pathfinding': 'ai_companions',
        'tech_gameplay_aabb_collision': 'engine_physics_basic'
    };

    const savedUnlocked = state.techTreeManager?.unlockedTechs instanceof Set
        ? Array.from(state.techTreeManager.unlockedTechs)
        : (Array.isArray(state.techTreeManager?.unlockedTechs) ? state.techTreeManager.unlockedTechs : []);

    const mergedUnlocked = new Set(freshManager.unlockedTechs);
    for (const id of savedUnlocked) {
        mergedUnlocked.add(id);
        if (LEGACY_TECH_MAP[id]) {
            mergedUnlocked.add(LEGACY_TECH_MAP[id]);
        }
    }
    liveManager.unlockedTechs = mergedUnlocked;
    liveManager.dismantledHardware = new Set(state.techTreeManager?.dismantledHardware || []);
    game.techTreeManager = liveManager;

    if (game.activeResearch && !liveManager.catalogMap.has(game.activeResearch.techId)) {
        const replacementId = LEGACY_TECH_MAP[game.activeResearch.techId];
        if (replacementId && liveManager.catalogMap.has(replacementId)) {
            const def = liveManager.catalogMap.get(replacementId);
            game.activeResearch.techId = replacementId;
            game.activeResearch.nodeName = def.name;
        } else {
            game.activeResearch = null;
        }
    }
}

export function resetGame(game) {
    replaceGame(game);
}

function readSlot(storage, id) {
    const slot = JSON.parse(storage.getItem(SLOT_PREFIX + id));
    const { year, month, week } = slot?.inGameDate ?? {};
    if (slot?.version !== VERSION || slot.id !== id || typeof slot.saveName !== 'string' ||
        !Number.isFinite(slot.timestamp) || typeof slot.studioName !== 'string' ||
        !Number.isFinite(slot.balance) || ![year, month, week].every(Number.isInteger) ||
        !Array.isArray(slot.gamesHistory) || !Array.isArray(slot.state?.objects) || !slot.state.root) {
        return null;
    }
    return slot;
}

function slotSummary({ state, version, ...summary }, officeState = summary) {
    const { activeOfficeId, unlockedOfficeIds, era } = officeState;
    return { ...summary, activeOfficeId, unlockedOfficeIds, currentOffice: findOffice(activeOfficeId)?.tier ?? era ?? summary.currentOffice };
}

function writeSlot(storage, slot, officeState) {
    // One storage write commits the complete slot. Quota errors leave the
    // previous value intact and there is no separate index to sync.
    storage.setItem(SLOT_PREFIX + slot.id, JSON.stringify(slot));
    return slotSummary(slot, officeState);
}

export class SaveSystem {
    constructor(storage) {
        this.storage = storage;
    }

    getStorage() {
        return this.storage ?? globalThis.localStorage;
    }

    list() {
        const slots = [];
        try {
            const storage = this.getStorage();
            for (let index = 0; index < storage.length; index++) {
                const key = storage.key(index);
                if (!key?.startsWith(SLOT_PREFIX)) continue;
                try {
                    const slot = readSlot(storage, key.slice(SLOT_PREFIX.length));
                    if (slot) {
                        const state = decodeState(slot.state);
                        slots.push(slotSummary(slot, state));
                    }
                } catch {
                    // A damaged slot does not hide the other saves.
                }
            }
        } catch {
            // Browsers can disable storage entirely.
        }
        return slots.sort((a, b) => b.timestamp - a.timestamp || Number(b.id === 'auto_save') - Number(a.id === 'auto_save'));
    }

    latest() {
        return this.list()[0] ?? null;
    }

    save(game, { id = globalThis.crypto?.randomUUID?.() ?? `slot_${Date.now()}_${Math.random().toString(36).slice(2)}`, saveName } = {}) {
        const state = persistentFields(game);
        validateState(state);
        Object.assign(state, migrateOfficeState(state));
        const slot = {
            version: VERSION,
            id,
            saveName: saveName?.trim() || game.companyName,
            timestamp: Date.now(),
            inGameDate: { year: game.getHistoricalYear(), month: game.month, week: game.week },
            studioName: game.companyName,
            balance: game.funds,
            reputation: game.reputation ?? 50,
            founderData: { ...game.founder, customization: { ...game.characterCustomization } },
            gamesHistory: game.gamesHistory.map(({ id: gameId, name, score }) => ({ id: gameId, name, score })),
            currentOffice: game.getActiveOffice().tier,
            activeOfficeId: state.activeOfficeId,
            unlockedOfficeIds: state.unlockedOfficeIds,
            lastGame: game.gamesHistory[0]?.name ?? null,
            state: encodeState(state)
        };
        try {
            return writeSlot(this.getStorage(), slot);
        } catch {
            throw new Error('No se pudo guardar la partida. Comprueba el almacenamiento disponible del navegador.');
        }
    }

    autosave(game) {
        return this.save(game, { id: 'auto_save', saveName: 'Autoguardado' });
    }

    archiveAutosave() {
        const storage = this.getStorage();
        let slot;
        let state;
        try {
            slot = readSlot(storage, 'auto_save');
            if (!slot) return null;
            state = decodeState(slot.state);
        } catch {
            return null;
        }
        const id = `archived_${slot.timestamp}`;
        try {
            return writeSlot(storage, { ...slot, id, saveName: slot.studioName }, state);
        } catch {
            throw new Error('No se pudo conservar el autoguardado anterior. Comprueba el espacio disponible del navegador.');
        }
    }

    load(id, game) {
        let slot;
        try {
            slot = readSlot(this.getStorage(), id);
        } catch {
            throw new Error('No se pudo leer esta partida guardada.');
        }
        if (!slot) throw new Error('La partida guardada falta o usa una versión incompatible.');
        const state = decodeState(slot.state, game.techTreeManager);
        replaceGame(game, state);
        return slotSummary(slot, state);
    }

    remove(id) {
        this.getStorage().removeItem(SLOT_PREFIX + id);
    }

    getSettings() {
        try {
            return normalizeSettings(JSON.parse(this.getStorage().getItem(SETTINGS_KEY)));
        } catch {
            return { ...DEFAULT_SETTINGS };
        }
    }

    updateSettings(patch) {
        const settings = normalizeSettings({ ...this.getSettings(), ...patch });
        this.getStorage().setItem(SETTINGS_KEY, JSON.stringify(settings));
        return settings;
    }
}

export const saveSystem = new SaveSystem();
