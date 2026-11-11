import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateFranchiseRegistration, validateFranchiseProject, getFranchiseStatus, evaluateFranchiseRelease, franchiseTechnologyIds } from '../src/FranchiseSystem.js';

const make = (elapsed = 20) => {
    const previous = { id: 'one', name: 'Primero', score: 8, ipId: 'ip', ipReleaseType: 'original', releaseIndustryWeek: 100, franchiseTechnologyIds: ['a', 'b'], franchiseFansGained: 42 };
    const ip = { id: 'ip', ownerId: 'player', publishedGameIds: ['one'] };
    return { gamesHistory: [previous], ipState: { properties: [ip] }, getIndustryWeek: () => 100 + elapsed, ip };
};

test('solo se registra un juego original con nota mínima', () => {
    assert.equal(validateFranchiseRegistration({score: 7.4}).success, false);
    assert.equal(validateFranchiseRegistration({score: 7.5}).success, true);
    assert.equal(validateFranchiseRegistration({score: 9, ipId: 'x'}).success, false);
});

test('fatiga por semanas, innovación y bonus de descanso', () => {
    const project = {ipId:'ip', ipInstallmentType:'sequel', engineObj:{bakedNodes:['a', 'b']}};
    const game = make(39), effects = evaluateFranchiseRelease(game, project);
    assert.equal(effects.salesMultiplier, 0.6);
    assert.equal(effects.reviewPenalty, 1);
    assert.equal(getFranchiseStatus(game, game.ip).fans, 42);
    assert.equal(getFranchiseStatus(game, game.ip).status, 'saturado');
    const rested = evaluateFranchiseRelease(make(60), {...project, engineObj:{bakedNodes:['a','b','c','d']}});
    assert.equal(rested.firstWeekMultiplier, 1.3);
    assert.equal(rested.reviewPenalty, 0);
    assert.equal(evaluateFranchiseRelease(make(121), project).firstWeekMultiplier, 1);
    assert.equal(evaluateFranchiseRelease(game, {...project, ipInstallmentType:'spin_off'}).reviewPenalty, 0);
    assert.deepEqual(franchiseTechnologyIds({engineObj:{features:['a','a','b']}}), ['a','b']);
});

test('remake o remaster requiere original de ocho años y franquicia propia', () => {
    const config = {ipId:'ip', ipInstallmentType:'remake'};
    assert.equal(validateFranchiseProject(make(383), config).success, false);
    assert.equal(validateFranchiseProject(make(384), config).success, true);
    assert.equal(validateFranchiseProject(make(384), {...config, ipId:'otra'}).success, false);
});
