import assert from 'node:assert/strict';
import { test } from 'node:test';
import { game } from '../src/simulation.js';
import { getMultiplatformQuote } from '../src/MultiplatformManager.js';

const config = { name: 'Prueba', topicId: 'medieval', genreId: 'action', platformId: 'pc' };

test('la plataforma secundaria exige una licencia previa y suma coste, tiempo y deuda', () => {
    const studio = new game.constructor();
    studio.funds = 1000000;
    const initial = studio.funds;
    assert.equal(studio.startNewGameProject({ ...config, platformIds: ['pc', 'g64'] }).success, false);
    assert.equal(studio.funds, initial);
    const bought = studio.purchaseDevKit('g64');
    assert.equal(bought.success, true);
    assert.equal(studio.funds, initial - bought.cost);
    const quote = getMultiplatformQuote(studio, ['pc', 'g64']);
    assert.equal(quote.timeMultiplier, 1.15);
    assert.equal(quote.adaptationCost, 3000);
    assert.equal(quote.additionalDebt, 15);
    const result = studio.startNewGameProject({ ...config, platformIds: ['pc', 'g64'] });
    assert.equal(result.success, true);
    assert.deepEqual(studio.currentProject.platformIds, ['pc', 'g64']);
    assert.equal(studio.currentProject.multiplatformDebt, 15);
    assert.equal(studio.currentProject.multiplatformTimeMultiplier, 1.15);
});

test('compatibilidad, perfil sénior y licencias imposibles se calculan correctamente', () => {
    const studio = new game.constructor();
    studio.funds = 1000000;
    assert.equal(studio.purchaseDevKit('ps2').success, false);
    assert.equal(getMultiplatformQuote(studio, ['pc', 'g64'], { features: ['cross_play'] }).additionalDebt, 0);
    studio.employees.push({ id: 's', role: 'Programador Senior', experience: 'Senior' });
    assert.equal(getMultiplatformQuote(studio, ['pc', 'g64']).additionalDebt, 10);
    studio.purchaseDevKit('g64');
    assert.equal(studio.startNewGameProject({ ...config, platformIds: ['pc', 'g64'], publishingContractType: 'platform_exclusive' }).success, false);
});

test('un empleado dedicado a un port no produce en otro proyecto simultáneamente', () => {
    const studio = new game.constructor();
    studio.funds = 1000000;
    assert.equal(studio.startNewGameProject(config).success, true);
    studio.portProjects = [{ employeeId: studio.employees[0].id, weeksRemaining: 5 }];
    const before = studio.currentProject.overallProgress;
    studio.advanceDevTick();
    assert.equal(studio.currentProject.overallProgress, before);
});
