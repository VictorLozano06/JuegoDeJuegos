import test from 'node:test';
import assert from 'node:assert/strict';
import { handValue, playBlackjack, spinRoulette, spinSlots, startBlackjack } from '../src/casino.js';

function studio(year = 2010) {
    return { funds: 1000, companyName: 'Estudio', financeState: {}, ipState: { properties: [], history: [] },
        getHistoricalYear: () => year, getIPValue: () => 5000, notify() {} };
}
const sequence = (...values) => () => values.shift() ?? 0;

test('casino locked until 2010 and bets cannot exceed available cash', () => {
    const early = studio(2009);
    assert.equal(spinSlots(early, { type: 'cash', amount: 50 }).success, false);
    assert.equal(early.funds, 1000);
    const game = studio();
    assert.equal(spinSlots(game, { type: 'cash', amount: 1001 }).success, false);
    assert.equal(game.funds, 1000);
});

test('slot prizes and roulette zero settle against actual funds', () => {
    const game = studio();
    spinSlots(game, { type: 'cash', amount: 100 }, sequence(0, 0, 0));
    assert.equal(game.funds, 1700);
    spinRoulette(game, { type: 'cash', amount: 100 }, { kind: 'red' }, sequence(0));
    assert.equal(game.funds, 1600);
    spinRoulette(game, { type: 'cash', amount: 100 }, { kind: 'number', number: 0 }, sequence(0));
    assert.equal(game.funds, 5100);
});

test('blackjack retains its hand until settled and handles aces', () => {
    const game = studio();
    assert.equal(handValue(['A', 'A', '9']), 21);
    startBlackjack(game, { type: 'cash', amount: 100 }, sequence(.75, .75, .30, .30));
    assert.equal(game.funds, 900);
    assert.ok(game.casinoState.hand);
    assert.equal(spinSlots(game, { type: 'cash', amount: 10 }).success, false);
    playBlackjack(game, 'stand', sequence(.5, .5));
    assert.equal(game.casinoState.hand, null);
    assert.equal(game.funds, 1100);
});

test('franchise stake transfers on loss and returns with winnings on victory', () => {
    const game = studio();
    const ip = { id: 'ip1', name: 'Franquicia', ownerId: 'player', forSale: false, ownershipHistory: [] };
    game.ipState.properties.push(ip);
    spinSlots(game, { type: 'ip', ipId: ip.id }, sequence(0, .2, .4));
    assert.equal(ip.ownerId, 'casino');
    assert.equal(game.funds, 1000);
    ip.ownerId = 'player';
    spinSlots(game, { type: 'ip', ipId: ip.id }, sequence(0, 0, 0));
    assert.equal(ip.ownerId, 'player');
    assert.equal(game.funds, 36000);
    assert.ok(ip.ownershipHistory.some(entry => entry.reason === 'casino_loss'));
});
