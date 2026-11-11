import assert from 'node:assert/strict';
import { test } from 'node:test';
import { game } from '../src/simulation.js';
import { CommercialEngineCatalog } from '../src/dag_engine.js';
import { getCommercialEngineVersion } from '../src/CommercialEngineVersions.js';
import { TECH_TREE_NODES } from '../src/data/techTreeData.js';

test('las versiones comerciales evolucionan sin incorporar tecnología futura', () => {
    for (const engine of CommercialEngineCatalog) {
        assert.equal(getCommercialEngineVersion(engine, 1989), null);
        const early = getCommercialEngineVersion(engine, 1990);
        const modern = getCommercialEngineVersion(engine, 2026);
        assert.equal(modern.releaseYear, 2026);
        assert.ok(modern.historicalTechIds.includes('graphics_3d_v7'));
        assert.ok(modern.historicalTechIds.includes('engine_crossplay'));
        assert.ok(!early.historicalTechIds.includes('graphics_3d_v7'));
        for (const id of early.historicalTechIds) assert.ok(TECH_TREE_NODES.find(n => n.id === id).eraYear <= 1990);
    }
});

test('usar un motor actualizado aplica sus funciones sin regalar investigación y conserva la versión del proyecto', () => {
    const studio = new game.constructor();
    studio.year = 45; studio.funds = 1000000;
    const engine = CommercialEngineCatalog[0];
    const before = new Set(studio.techTreeManager.unlockedTechs);
    const result = studio.startNewGameProject({ name: 'Futuro', topicId: 'medieval', genreId: 'action', platformId: 'pc',
        pipelineType: 'commercial', engineId: engine.id });
    assert.equal(result.success, true, result.message);
    assert.equal(studio.currentProject.engineObj.releaseYear, 2026);
    assert.ok(studio.currentProject.historicalTechIds.includes('graphics_ray_tracing'));
    assert.deepEqual(studio.techTreeManager.unlockedTechs, before);
    studio.year++;
    assert.equal(studio.currentProject.engineObj.releaseYear, 2026);
    const newer = getCommercialEngineVersion(engine, 2028);
    assert.equal(newer.releaseYear, 2028);
});
