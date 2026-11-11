import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateLaunchPrice, getPricingContext } from '../src/PricingStrategySystem.js';

test('clasifica proyectos usando equipo, oficina y tecnologías reales', () => {
    assert.equal(getPricingContext({ employeeCount: 1, officeTier: 4, technologyCount: 10 }).tier, 'indie');
    assert.equal(getPricingContext({ employeeCount: 3, officeTier: 2 }).tier, 'medium');
    assert.equal(getPricingContext({ employeeCount: 8, officeTier: 3, project: { engine: { features: ['a', 'b', 'c', 'd', 'e'] } } }).tier, 'aaa');
    assert.equal(getPricingContext({ employeeCount: 8, officeTier: 3, technologyCount: 1 }).tier, 'medium');
});

test('reseña y reputación ajustan la expectativa sin salir del rango recomendado', () => {
    const basic = getPricingContext();
    const established = getPricingContext({ reputation: 100, reviewScore: 10 });
    assert.ok(established.expectedPrice > basic.expectedPrice);
    assert.ok(established.expectedPrice <= established.recommendedMax);
    assert.ok(getPricingContext({ reputation: 0, reviewScore: 1 }).expectedPrice >= 10);
});

test('precio justo sigue la fórmula de elasticidad y calidad', () => {
    const result = evaluateLaunchPrice({ price: 15, reviewScore: 7 });
    assert.equal(result.expectedPrice, 15);
    assert.equal(result.category, 'standard');
    assert.equal(result.multiplier, 1);
    const quality = evaluateLaunchPrice({ price: 15, reviewScore: 8 });
    assert.ok(Math.abs(quality.multiplier - Math.pow(quality.expectedPrice / 15, 0.85) * 1.1) < 1e-10);
});

test('indie novato con precio excesivo sufre una pérdida grave; ganga aumenta volumen', () => {
    const expensive = evaluateLaunchPrice({ price: 50, employeeCount: 1, officeTier: 1, reputation: 20, reviewScore: 6 });
    assert.equal(expensive.isOverpriced, true);
    assert.ok(expensive.multiplier <= 0.3);
    const bargain = evaluateLaunchPrice({ price: 10, employeeCount: 1, officeTier: 1, reputation: 50, reviewScore: 7 });
    assert.equal(bargain.category, 'affordable');
    assert.ok(bargain.multiplier >= 1.25 && bargain.multiplier <= 1.4);
});

test('valida límites y rechaza números ausentes o no finitos', () => {
    for (const price of [undefined, null, '', 4, 71, Infinity, 'invalido']) assert.equal(evaluateLaunchPrice({ price }).valid, false);
    assert.equal(evaluateLaunchPrice({ price: 5 }).valid, true);
    assert.equal(evaluateLaunchPrice({ price: 70 }).valid, true);
});
