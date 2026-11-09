import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { GameDevFlowController, ProductionLifecycleState, DevelopmentStageModal } from '../src/GameDevFlowController.js';

test('ProductionLifecycleState enum includes all Game Dev Tycoon discrete states', () => {
    const expected = [
        'STATE_SETUP',
        'STAGE_1_INPUT',
        'STAGE_1_WORK',
        'STAGE_2_INPUT',
        'STAGE_2_WORK',
        'STAGE_3_INPUT',
        'STAGE_3_WORK',
        'STAGE_BUG_FIXING'
    ];
    for (const key of expected) {
        assert.equal(ProductionLifecycleState[key], key, `State ${key} should match key`);
    }
});

test('GameDevFlowController initializes project into STAGE_1_INPUT, pauses game, and opens modal', () => {
    let speed = 1;
    const mockGame = { gameSpeed: 1 };
    const mockWorld = { spawnDevelopmentBubble: () => {} };
    const setGameSpeed = (s) => { speed = s; mockGame.gameSpeed = s; };

    // Setup mini mock DOM
    const elements = new Map();
    globalThis.document = {
        body: {
            append: (el) => elements.set(el.id || 'body-child', el)
        },
        createElement: (tag) => {
            const listeners = {};
            const children = [];
            const el = {
                tagName: tag.toUpperCase(),
                id: '',
                className: '',
                attributes: {},
                children,
                style: {},
                textContent: '',
                innerHTML: '',
                setAttribute: (k, v) => { el.attributes[k] = v; },
                addEventListener: (event, fn) => {
                    listeners[event] = listeners[event] || [];
                    listeners[event].push(fn);
                },
                append: (...args) => children.push(...args),
                appendChild: (child) => children.push(child),
                remove: () => elements.delete(el.id),
                querySelector: () => null,
                focus: () => {}
            };
            return el;
        },
        getElementById: (id) => elements.get(id) || null
    };

    const controller = new GameDevFlowController({
        game: mockGame,
        world: mockWorld,
        setGameSpeed
    });

    const mockProject = {
        name: 'Super RPG',
        techPoints: 0,
        designPoints: 0,
        bugs: 0,
        sliders: {}
    };

    controller.initProject(mockProject);

    assert.equal(controller.state, ProductionLifecycleState.STAGE_1_INPUT);
    assert.equal(mockProject.lifecycleState, ProductionLifecycleState.STAGE_1_INPUT);
    assert.equal(speed, 0, 'Simulation must be paused upon entering stage 1 input');
    assert.ok(controller.currentModal !== null, 'Current stage modal should be instantiated');
});

test('Confirming stage modal removes modal from DOM, saves sliders, resumes time and enters work state', () => {
    let speed = 0;
    const mockGame = { gameSpeed: 0 };
    const mockWorld = { spawnDevelopmentBubble: () => {} };
    const setGameSpeed = (s) => { speed = s; mockGame.gameSpeed = s; };

    const controller = new GameDevFlowController({
        game: mockGame,
        world: mockWorld,
        setGameSpeed
    });

    controller.savedSpeed = 1;
    const mockProject = {
        name: 'Cyber Quest',
        stage: 1,
        overallProgress: 0,
        sliders: {},
        production: { allocations: {} }
    };
    controller.project = mockProject;
    controller.state = ProductionLifecycleState.STAGE_1_INPUT;

    // Simulate modal confirmation
    controller.onStageConfirmed(1, { engine: 80, gameplay: 85, story: 50 }, ['tech_2d_sprites']);

    assert.equal(controller.state, ProductionLifecycleState.STAGE_1_WORK);
    assert.equal(mockProject.lifecycleState, ProductionLifecycleState.STAGE_1_WORK);
    assert.equal(speed, 1, 'Simulation time must resume when stage work begins');
    assert.equal(mockProject.sliders.stage1.engine, 0.8);
    assert.equal(mockProject.sliders.stage1.gameplay, 0.85);
    assert.equal(mockProject.sliders.stage1.story, 0.5);
    assert.equal(controller.currentModal, null, 'Modal should be destroyed and null');
});

test('Flow controller gates progress at 33% and 66%, forcing pauses and stage transitions', () => {
    let speed = 1;
    const mockGame = { gameSpeed: 1 };
    const bubblesSpawned = [];
    const mockWorld = {
        spawnDevelopmentBubble: (type) => bubblesSpawned.push(type)
    };
    const setGameSpeed = (s) => { speed = s; mockGame.gameSpeed = s; };

    const controller = new GameDevFlowController({
        game: mockGame,
        world: mockWorld,
        setGameSpeed
    });

    controller.savedSpeed = 1;
    const mockProject = {
        name: 'Space Tycoon',
        stage: 1,
        stageProgress: 50,
        overallProgress: 15,
        techPoints: 20,
        designPoints: 15,
        bugs: 2,
        sliders: {}
    };

    controller.project = mockProject;
    controller.state = ProductionLifecycleState.STAGE_1_WORK;

    // Advance within stage 1
    mockProject.overallProgress = 25;
    mockProject.techPoints = 35;
    controller.syncWithProject(mockProject);
    assert.equal(controller.state, ProductionLifecycleState.STAGE_1_WORK);
    assert.ok(bubblesSpawned.includes('tech'), 'Should emit tech bubbles on tech point increase');

    // Cross 33.3% threshold -> must trigger Stage 2 input & pause
    mockProject.overallProgress = 33.5;
    controller.syncWithProject(mockProject);
    assert.equal(controller.state, ProductionLifecycleState.STAGE_2_INPUT);
    assert.equal(speed, 0, 'Must pause game clock at stage 2 boundary');

    // Confirm stage 2
    controller.onStageConfirmed(2, { dialogues: 70, levelDesign: 80, ai: 60 });
    assert.equal(controller.state, ProductionLifecycleState.STAGE_2_WORK);
    assert.equal(speed, 1, 'Must resume clock in stage 2 work');

    // Cross 66.6% threshold -> must trigger Stage 3 input & pause
    mockProject.overallProgress = 67;
    controller.syncWithProject(mockProject);
    assert.equal(controller.state, ProductionLifecycleState.STAGE_3_INPUT);
    assert.equal(speed, 0, 'Must pause game clock at stage 3 boundary');

    // Confirm stage 3
    controller.onStageConfirmed(3, { graphics: 90, sound: 75, designUI: 70 });
    assert.equal(controller.state, ProductionLifecycleState.STAGE_3_WORK);
    assert.equal(speed, 1, 'Must resume clock in stage 3 work');
});

test('Reaching 100% does NOT publish automatically; transitions to STAGE_BUG_FIXING for manual release', () => {
    let released = false;
    const mockGame = { gameSpeed: 1 };
    const mockWorld = { spawnDevelopmentBubble: () => {} };

    const controller = new GameDevFlowController({
        game: mockGame,
        world: mockWorld,
        setGameSpeed: () => {},
        onRelease: () => { released = true; }
    });

    const mockProject = {
        name: 'Final Fantasy Clone',
        stage: 3,
        overallProgress: 98,
        bugs: 8
    };

    controller.project = mockProject;
    controller.state = ProductionLifecycleState.STAGE_3_WORK;

    // Reach 100%
    mockProject.overallProgress = 100;
    controller.syncWithProject(mockProject);

    assert.equal(controller.state, ProductionLifecycleState.STAGE_BUG_FIXING, 'Must enter STAGE_BUG_FIXING at 100%');
    assert.equal(mockProject.stage, 4, 'Project stage should be set to 4');
    assert.equal(released, false, 'Game must NOT publish automatically without player action');

    // Player decides when to publish
    controller.releaseProject();
    assert.equal(released, true, 'Calling releaseProject() must fire onRelease');
    assert.equal(controller.state, ProductionLifecycleState.STATE_SETUP, 'Controller resets to STATE_SETUP');
});

test('No system emojis in flow controller and styles (agentes/iconografia.md)', async () => {
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    const jsCode = await readFile(new URL('../src/GameDevFlowController.js', import.meta.url), 'utf8');
    const cssCode = await readFile(new URL('../src/game-dev-flow.css', import.meta.url), 'utf8');

    assert.equal(emojiRegex.test(jsCode), false, 'GameDevFlowController.js must not contain system emojis');
    assert.equal(emojiRegex.test(cssCode), false, 'game-dev-flow.css must not contain system emojis');
});

test('DevelopmentStageModal renders cleanly without side panel when no options exist (Image 3) and adds side panel when options exist (Image 4)', () => {
    const elements = new Map();
    const createdNodes = [];
    globalThis.document = {
        body: {
            append: (el) => elements.set(el.id || 'body-child', el)
        },
        createElement: (tag) => {
            const listeners = {};
            const children = [];
            const el = {
                tagName: tag.toUpperCase(),
                id: '',
                className: '',
                attributes: {},
                children,
                style: {},
                textContent: '',
                innerHTML: '',
                setAttribute: (k, v) => { el.attributes[k] = v; },
                addEventListener: (event, fn) => {
                    listeners[event] = listeners[event] || [];
                    listeners[event].push(fn);
                },
                append: (...args) => children.push(...args),
                appendChild: (child) => children.push(child),
                remove: () => elements.delete(el.id),
                querySelector: () => null,
                focus: () => {}
            };
            createdNodes.push(el);
            return el;
        },
        getElementById: (id) => elements.get(id) || null
    };

    const mockProject = {
        name: 'Juego#3',
        topic: { name: 'Viaje en el Tiempo' },
        genre: { name: 'Estrategia' }
    };

    // Stage 1: No extra options -> No side panel (Image 3)
    const modalStage1 = new DevelopmentStageModal({
        stage: 1,
        project: mockProject,
        onConfirm: () => {}
    });
    modalStage1.render();

    const stage1SidePanel = createdNodes.find(n => n.className === 'dev-modal-side-panel');
    assert.equal(stage1SidePanel, undefined, 'Stage 1 should have NO side panel when no options exist (matches Image 3)');
    modalStage1.destroy();

    // Stage 3: Options exist (Gráfico, Sonido) -> Side panel is attached (Image 4)
    createdNodes.length = 0;
    const modalStage3 = new DevelopmentStageModal({
        stage: 3,
        project: mockProject,
        onConfirm: () => {}
    });
    modalStage3.render();

    const stage3SidePanel = createdNodes.find(n => n.className === 'dev-modal-side-panel');
    assert.ok(stage3SidePanel !== undefined, 'Stage 3 must include the features side panel (matches Image 4)');
    modalStage3.destroy();
});

test('Top Status HUD displays dimmed nodes when idle (Image 1) and vibrant nodes when active (Image 2)', () => {
    let hudHtml = '';
    const mockHudEl = {
        id: 'gdt-top-status-hud',
        className: 'gdt-top-hud',
        set innerHTML(val) { hudHtml = val; },
        get innerHTML() { return hudHtml; },
        querySelector: () => null
    };

    globalThis.document = {
        getElementById: (id) => (id === 'gdt-top-status-hud' ? mockHudEl : null),
        body: { append: () => {} }
    };

    const controller = new GameDevFlowController({
        game: { researchPoints: 38 },
        world: {},
        setGameSpeed: () => {}
    });
    controller.hudEl = mockHudEl;

    // 1. Idle state (Image 1)
    controller.project = null;
    controller.state = ProductionLifecycleState.STATE_SETUP;
    controller.updateTopHUD();

    assert.ok(hudHtml.includes('Ningun proyecto'), 'Idle HUD must display "Ningun proyecto"');
    assert.ok(hudHtml.includes('is-dimmed'), 'Errores, Diseño, Tecnología circles must be dimmed in idle state');
    assert.ok(hudHtml.includes('is-rp'), 'Investigación circle is present');
    assert.ok(hudHtml.includes('38'), 'Investigación circle must show 38 RP in idle state');

    // 2. Active state (Image 2)
    controller.project = {
        name: 'Juego#3',
        topic: { name: 'Viaje en el Tiempo' },
        genre: { name: 'Estrategia' },
        bugs: 0,
        designPoints: 0,
        techPoints: 0,
        stage: 1,
        overallProgress: 0
    };
    controller.state = ProductionLifecycleState.STAGE_1_WORK;
    controller.updateTopHUD();

    assert.ok(hudHtml.includes('Juego#3'), 'Active HUD card must display project title');
    assert.ok(hudHtml.includes('Viaje en el Tiempo / Estrategia'), 'Active HUD card must display topic / genre');
    assert.ok(hudHtml.includes('is-active'), 'Circles must light up in is-active state');

    // 3. removeWidget cleanup
    assert.equal(typeof controller.removeWidget, 'function', 'removeWidget must be a callable method');
    controller.removeWidget();
    assert.equal(controller.project, null, 'removeWidget must clear project');
    assert.equal(controller.state, ProductionLifecycleState.STATE_SETUP, 'removeWidget must reset to STATE_SETUP');
    assert.ok(hudHtml.includes('Ningun proyecto'), 'HUD must return to idle state after removeWidget');
});


