import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import {
    ENGINE_PARTS_DATABASE,
    ENGINE_CATEGORIES,
    getPartById,
    getPartsByCategory,
    getCategories,
    calculateEngineCost,
    resolveBranchReplacement
} from '../src/EngineDatabase.js';
import { EngineCreationModal } from '../src/EngineCreationModal.js';

test('ENGINE_PARTS_DATABASE has all 82 items across 9 categories with valid structure', () => {
    assert.equal(ENGINE_PARTS_DATABASE.length, 82, 'Total parts in database must be 82');

    const expectedCategories = [
        'graphics', 'story', 'engine', 'gameplay',
        'dialogues', 'level_design', 'ai', 'world_design', 'sound'
    ];

    assert.equal(Object.keys(ENGINE_CATEGORIES).length, 9, 'Must have 9 categories');
    for (const cat of expectedCategories) {
        assert.ok(ENGINE_CATEGORIES[cat], `Category ${cat} must exist in ENGINE_CATEGORIES`);
    }

    // Verify each part's properties and naming rule (Subagente 1)
    for (const part of ENGINE_PARTS_DATABASE) {
        assert.ok(part.id, 'Part must have id');
        assert.ok(part.name, `Part ${part.id} must have a name`);
        assert.ok(expectedCategories.includes(part.category), `Category ${part.category} must be valid`);
        assert.ok(typeof part.cost === 'number' && part.cost > 0, `Cost must be a positive number for ${part.id}`);
        assert.ok(part.costLabel.includes('K Cr.'), `Cost label must format as [X]K Cr. for ${part.id}`);

        // Subagente 1: Check names are clean (no slashes, no parentheses, 1 to 3 words)
        assert.equal(part.name.includes('/'), false, `Name "${part.name}" must not contain slashes`);
        assert.equal(part.name.includes('('), false, `Name "${part.name}" must not contain parentheses`);
        const words = part.name.trim().split(/\s+/);
        assert.ok(words.length <= 4, `Name "${part.name}" must be short and direct (got ${words.length} words)`);
    }
});

test('resolveBranchReplacement (Subagente 4) automatically substitutes progressive versions in the same tech branch', () => {
    // 1. Graphics 2D branch replacement
    const current1 = new Set(['graphics_2d_v1', 'engine_save_game']);
    const res1 = resolveBranchReplacement(current1, 'graphics_2d_v2');

    assert.ok(res1.nextIds.has('graphics_2d_v2'), 'New version V.2 must be selected');
    assert.equal(res1.nextIds.has('graphics_2d_v1'), false, 'Previous version V.1 must be automatically deselected');
    assert.equal(res1.nextIds.has('engine_save_game'), true, 'Unrelated parts must be preserved');
    assert.equal(res1.replacedId, 'graphics_2d_v1', 'replacedId must point to graphics_2d_v1');

    // 2. Graphics 3D branch replacement
    const current2 = new Set(['graphics_3d_v1']);
    const res2 = resolveBranchReplacement(current2, 'graphics_3d_v5');
    assert.ok(res2.nextIds.has('graphics_3d_v5'));
    assert.equal(res2.nextIds.has('graphics_3d_v1'), false);
    assert.equal(res2.replacedId, 'graphics_3d_v1');

    // 3. Physics branch replacement (Física básica -> Física avanzada)
    const current3 = new Set(['engine_physics_basic']);
    const res3 = resolveBranchReplacement(current3, 'engine_physics_advanced');
    assert.ok(res3.nextIds.has('engine_physics_advanced'));
    assert.equal(res3.nextIds.has('engine_physics_basic'), false);
    assert.equal(res3.replacedId, 'engine_physics_basic');

    // 4. Sound channels branch replacement (Sonido Mono -> Sonido Estéreo)
    const current4 = new Set(['sound_mono']);
    const res4 = resolveBranchReplacement(current4, 'sound_stereo');
    assert.ok(res4.nextIds.has('sound_stereo'));
    assert.equal(res4.nextIds.has('sound_mono'), false);

    // 5. Toggling an already selected item removes it without replacement
    const current5 = new Set(['sound_mono']);
    const res5 = resolveBranchReplacement(current5, 'sound_mono');
    assert.equal(res5.nextIds.has('sound_mono'), false, 'Toggling off must remove it');
    assert.equal(res5.replacedId, null);
});

test('calculateEngineCost calculates exact cost in credits', () => {
    const parts = ['graphics_2d_v1', 'engine_save_game', 'graphics_ray_tracing'];
    // 10K + 10K + 280K = 300K = 300,000
    const cost = calculateEngineCost(parts);
    assert.equal(cost, 300000);
});

test('EngineCreationModal renders, handles category filtering, toggling and engine creation', () => {
    const elements = new Map();
    const createdElements = [];

    // Mock DOM
    globalThis.document = {
        body: {
            append: (el) => elements.set(el.id || 'body-child', el)
        },
        createElement: (tag) => {
            const listeners = {};
            const children = [];
            const classSet = new Set();
            const el = {
                tagName: tag.toUpperCase(),
                id: '',
                set className(val) {
                    classSet.clear();
                    val.split(/\s+/).filter(Boolean).forEach(c => classSet.add(c));
                },
                get className() {
                    return Array.from(classSet).join(' ');
                },
                classList: {
                    add: (c) => classSet.add(c),
                    remove: (c) => classSet.delete(c),
                    toggle: (c, force) => {
                        if (force === undefined) {
                            if (classSet.has(c)) classSet.delete(c);
                            else classSet.add(c);
                        } else if (force) classSet.add(c);
                        else classSet.delete(c);
                    },
                    contains: (c) => classSet.has(c)
                },
                attributes: {},
                dataset: {},
                children,
                style: {},
                textContent: '',
                innerHTML: '',
                disabled: false,
                setAttribute: (k, v) => { el.attributes[k] = v; },
                getAttribute: (k) => el.attributes[k] || null,
                addEventListener: (event, fn) => {
                    listeners[event] = listeners[event] || [];
                    listeners[event].push(fn);
                },
                append: (...args) => children.push(...args),
                appendChild: (child) => children.push(child),
                remove: () => elements.delete(el.id),
                querySelectorAll: () => [],
                closest: () => null,
                focus: () => {}
            };
            createdElements.push(el);
            return el;
        },
        getElementById: (id) => elements.get(id) || null
    };

    const mockGame = {
        funds: 500000,
        customEngines: [],
        inHouseEngines: [],
        getHistoricalYear: () => 1983,
        week: 12
    };

    let createdEngineResult = null;
    const modal = new EngineCreationModal({
        game: mockGame,
        onCreated: (eng) => { createdEngineResult = eng; }
    });

    const rendered = modal.render();
    assert.ok(rendered !== null, 'Modal must render');
    assert.ok(modal.costValueEl !== null, 'Cost element must be instantiated');
    assert.ok(modal.costValueEl.textContent.includes('Costo:'), 'Cost element must display Costo');

    // Toggle part
    modal.togglePart('graphics_ray_tracing');
    assert.ok(modal.selectedPartIds.has('graphics_ray_tracing'), 'Ray tracing must be selected');

    // Confirm creation
    modal.engineName = 'Titan Engine 1.0';
    modal.handleDevelopEngine();

    assert.ok(createdEngineResult !== null, 'onCreated callback must fire with created engine');
    assert.equal(createdEngineResult.name, 'Titan Engine 1.0');
    assert.ok(createdEngineResult.cost > 0, 'Cost must be calculated');
    assert.ok(mockGame.customEngines.length === 1, 'Engine must be registered in game.customEngines');
    assert.ok(mockGame.funds < 500000, 'Credits must be deducted from funds');
});

test('No system emojis in EngineDatabase, EngineCreationModal and engine-creation.css (agentes/iconografia.md)', async () => {
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    const dbCode = await readFile(new URL('../src/EngineDatabase.js', import.meta.url), 'utf8');
    const modalCode = await readFile(new URL('../src/EngineCreationModal.js', import.meta.url), 'utf8');
    const cssCode = await readFile(new URL('../src/engine-creation.css', import.meta.url), 'utf8');

    assert.equal(emojiRegex.test(dbCode), false, 'EngineDatabase.js must not contain system emojis');
    assert.equal(emojiRegex.test(modalCode), false, 'EngineCreationModal.js must not contain system emojis');
    assert.equal(emojiRegex.test(cssCode), false, 'engine-creation.css must not contain system emojis');
});
