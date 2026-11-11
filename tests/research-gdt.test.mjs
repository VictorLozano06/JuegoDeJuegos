import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { TechTreeManager } from '../src/dag_engine.js';
import { game } from '../src/simulation.js';

test('Research GDT Menu - HTML structure complies with Game Dev Tycoon specification', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    const modalSection = html.slice(html.indexOf('id="modal-research"'), html.indexOf('id="modal-history"'));

    assert.ok(modalSection.includes('class="modal-window modal-research-gdt"'), 'Modal window has modal-research-gdt class');
    assert.ok(modalSection.includes('id="rd-header-rp"'), 'Header displays RP badge');
    assert.ok(modalSection.includes('id="rd-header-year"'), 'Header displays historical year badge');
    assert.ok(modalSection.includes('id="rd-active-banner"'), 'Includes active research banner');
    assert.ok(modalSection.includes('id="rd-category-filters"'), 'Includes category filter bar');
    assert.ok(modalSection.includes('id="rd-available-container"'), 'Includes available research list container');
    assert.ok(modalSection.includes('id="rd-unlocked-drawer"'), 'Includes researched tech drawer');
    assert.ok(modalSection.includes('id="btn-toggle-unlocked-tech"'), 'Includes toggle button for researched techs');
});

test('Research GDT Menu - Zero system emojis in all research files (agentes/iconografia.md)', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;

    const files = ['index.html', 'research-lab.css', 'src/data/techTreeData.js'];
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
            assert.ok(!emojiRegex.test(line), `System emoji found in ${file}:${idx + 1}: ${line}`);
        });
    }
});

test('Research GDT Menu - Initial Year 1982 has immediate available technologies across categories', () => {
    const mgr = new TechTreeManager();
    const available1982 = mgr.catalog.filter(n => !mgr.isUnlocked(n.id) && mgr.getNodeState(n.id, 1982).canResearch);

    assert.ok(available1982.length >= 8, `Expected at least 8 available techs in 1982, got ${available1982.length}`);

    // Verify key baseline tier-1 techs are available right away
    const ids = available1982.map(n => n.id);
    assert.ok(ids.includes('graphics_2d_v2'), 'graphics_2d_v2 is available in 1982');
    assert.ok(ids.includes('story_branching'), 'story_branching is available in 1982');
    assert.ok(ids.includes('engine_local_multiplayer'), 'engine_local_multiplayer is available in 1982');
    assert.ok(ids.includes('engine_physics_basic'), 'engine_physics_basic is available in 1982');
    assert.ok(ids.includes('gameplay_tutorials'), 'gameplay_tutorials is available in 1982');
    assert.ok(ids.includes('dialogues_improved'), 'dialogues_improved is available in 1982');
    assert.ok(ids.includes('level_editor'), 'level_editor is available in 1982');
    assert.ok(ids.includes('ai_improved'), 'ai_improved is available in 1982');
    assert.ok(ids.includes('sound_stereo'), 'sound_stereo is available in 1982');
});

test('Research GDT Menu - Future-era technologies and missing-prerequisite nodes are strictly hidden', () => {
    const mgr = new TechTreeManager();

    // Future-locked tech (1993, 2012, 2018)
    const state3D = mgr.getNodeState('graphics_3d_v1', 1982);
    assert.equal(state3D.canResearch, false, '3D graphics cannot be researched in 1982');

    const stateRollback = mgr.getNodeState('engine_rollback_netcode', 1982);
    assert.equal(stateRollback.canResearch, false, 'Rollback netcode cannot be researched in 1982');

    // Missing prerequisite: graphics_2d_v3 requires graphics_2d_v2
    const stateV3 = mgr.getNodeState('graphics_2d_v3', 1982);
    assert.equal(stateV3.canResearch, false, 'graphics_2d_v3 cannot be researched before graphics_2d_v2');
});

test('Research GDT Menu - Researching a technology unlocks it and enables downstream child when era arrives', () => {
    const testGame = new game.constructor();
    testGame.researchPoints = 100;
    const mgr = testGame.techTreeManager;

    assert.equal(mgr.isUnlocked('graphics_2d_v2'), false);

    // Start research on graphics_2d_v2
    const startRes = testGame.startTechResearch('graphics_2d_v2');
    assert.equal(startRes.success, true, startRes.message);
    assert.ok(testGame.activeResearch, 'activeResearch is set');
    assert.equal(testGame.activeResearch.techId, 'graphics_2d_v2');

    // Simulate completion
    while (testGame.activeResearch) {
        testGame.advanceCalendar();
    }

    assert.equal(mgr.isUnlocked('graphics_2d_v2'), true, 'graphics_2d_v2 is now unlocked');
    assert.equal(testGame.activeResearch, null, 'activeResearch is cleared upon completion');

    // In 1988, graphics_2d_v3 should now be researchable because graphics_2d_v2 is unlocked!
    const stateV3_1988 = mgr.getNodeState('graphics_2d_v3', 1988);
    assert.equal(stateV3_1988.canResearch, true, 'graphics_2d_v3 becomes researchable in 1988');
});
