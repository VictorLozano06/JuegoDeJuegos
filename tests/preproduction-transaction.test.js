import test from 'node:test';
import assert from 'node:assert/strict';
import { game as singleton } from '../src/simulation.js';
import { commitPreproduction } from '../src/project-transaction.js';

const fresh = () => new singleton.constructor();
const config = { name: 'Proyecto de prueba', platformId: 'pc', force: true };

test('registrar una nueva IP y crear el proyecto ocurre en una sola confirmación', () => {
    const game = fresh();
    const result = commitPreproduction(game, config, 'Saga nueva');
    assert.equal(result.success, true, result.message);
    assert.equal(game.ipState.properties.length, 1);
    assert.equal(game.ipState.properties[0].name, 'Saga nueva');
    assert.equal(game.currentProject.ipId, game.ipState.properties[0].id);
    assert.equal(game.currentProject.ipInstallmentType, 'original');
    const funds = game.funds;
    assert.equal(commitPreproduction(game, config, 'Otra saga').success, false);
    assert.equal(game.funds, funds);
    assert.equal(game.ipState.properties.length, 1);
});

test('si falla la producción, devuelve el registro, los fondos y el devkit', () => {
    const game = fresh();
    game.funds = 6000;
    const funds = game.funds;
    const result = commitPreproduction(game, config, 'Saga sin presupuesto');
    assert.equal(result.success, false);
    assert.equal(game.funds, funds);
    assert.equal(game.ipState.properties.length, 0);
    assert.equal(game.ipState.history.length, 0);
    assert.deepEqual(game.ownedDevKits, []);
    assert.equal(game.currentProject, null);
});
