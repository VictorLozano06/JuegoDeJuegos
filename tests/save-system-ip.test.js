import test from 'node:test';
import assert from 'node:assert/strict';
import { SaveSystem } from '../src/SaveSystem.js';
import { TechTreeManager } from '../src/dag_engine.js';

class MemoryStorage {
    constructor() { this.data = new Map(); }
    get length() { return this.data.size; }
    key(index) { return [...this.data.keys()][index] ?? null; }
    getItem(key) { return this.data.get(key) ?? null; }
    setItem(key, value) { this.data.set(key, String(value)); }
    removeItem(key) { this.data.delete(key); }
}
class GameFixture {
    constructor() {
        Object.assign(this, {
            funds: 50000, companyName: 'Estudio', year: 1, month: 1, week: 1, era: 1,
            founder: { name: 'Autora' }, employees: [{ id: 'emp-1' }],
            gamesHistory: [], activeSales: [], characterCustomization: {},
            techTreeManager: new TechTreeManager(),
            ipState: { properties: [], history: [], transactions: [], settings: { registrationCost: 5000, decay: 0.02 } }
        });
    }
    getHistoricalYear() { return 1981 + this.year; }
}

test('IP, transfer history and shared game references survive a save and load', () => {
    const saves = new SaveSystem(new MemoryStorage());
    const game = new GameFixture();
    const release = { id: 'game-1', name: 'Primera entrega', score: 8, ipId: 'ip-1' };
    game.gamesHistory.push(release);
    game.activeSales.push(release);
    game.ipState.properties.push({ id: 'ip-1', name: 'Saga', ownerId: 'rival-1', gameIds: ['game-1'],
        popularity: 67, ownershipHistory: [{ ownerId: 'player' }, { ownerId: 'rival-1' }] });
    game.ipState.history.push({ type: 'CREATED', ipId: 'ip-1' }, { type: 'TRANSFER', ipId: 'ip-1' });
    game.ipState.transactions.push({ ipId: 'ip-1', sellerId: 'player', buyerId: 'rival-1', price: 9000 });
    saves.save(game, { id: 'slot-1' });
    const loaded = new GameFixture();
    const manager = loaded.techTreeManager;
    saves.load('slot-1', loaded);
    assert.deepEqual(loaded.ipState, game.ipState);
    assert.equal(loaded.gamesHistory[0].ipId, loaded.ipState.properties[0].id);
    assert.strictEqual(loaded.gamesHistory[0], loaded.activeSales[0]);
    assert.strictEqual(loaded.techTreeManager, manager);
});

test('pre-IP saves load with empty IP defaults and preserve original game data', () => {
    const saves = new SaveSystem(new MemoryStorage());
    const oldGame = new GameFixture();
    delete oldGame.ipState;
    oldGame.gamesHistory.push({ id: 'old-1', name: 'Juego anterior', score: 6 });
    saves.save(oldGame, { id: 'old' });
    const loaded = new GameFixture();
    saves.load('old', loaded);
    assert.deepEqual(loaded.ipState, new GameFixture().ipState);
    assert.equal(loaded.gamesHistory[0].name, 'Juego anterior');
    assert.equal(loaded.gamesHistory[0].ipId, undefined);
});

test('partially upgraded IP state keeps existing records and fills missing defaults', () => {
    const saves = new SaveSystem(new MemoryStorage());
    const oldGame = new GameFixture();
    oldGame.ipState = { properties: [{ id: 'legacy', name: 'Anterior' }], settings: { registrationCost: 4200 } };
    saves.save(oldGame, { id: 'partial' });
    const loaded = new GameFixture();
    saves.load('partial', loaded);
    assert.deepEqual(loaded.ipState.properties, oldGame.ipState.properties);
    assert.deepEqual(loaded.ipState.history, []);
    assert.deepEqual(loaded.ipState.transactions, []);
    assert.equal(loaded.ipState.settings.registrationCost, 4200);
    assert.equal(loaded.ipState.settings.decay, 0.02);
});
