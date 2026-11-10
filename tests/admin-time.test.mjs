import test from 'node:test';
import assert from 'node:assert/strict';
import { jumpToYear } from '../src/admin-time.js';

function game() {
    return { year: 24, month: 6, week: 3, funds: 25000, financeState: {}, announcements: [],
        getHistoricalYear() { return 1981 + this.year; },
        createIndustryEvent(id) { this.announcements.push(id); }, notify() {} };
}

test('admin jump changes the year without spending money or advancing weeks', () => {
    const g = game();
    assert.equal(jumpToYear(g, 2010).success, true);
    assert.equal(g.getHistoricalYear(), 2010);
    assert.equal(g.month, 6);
    assert.equal(g.week, 3);
    assert.equal(g.funds, 25000);
    assert.deepEqual(g.announcements, ['os_launch_2006']);
    jumpToYear(g, 2020);
    assert.equal(g.announcements.length, 1);
});

test('admin jump rejects invalid, past and blocked dates without changes', () => {
    const g = game();
    for (const year of [2005, 2004, 2201, 2010.5, NaN]) assert.equal(jumpToYear(g, year).success, false);
    g.financeState.procedurePending = true;
    assert.equal(jumpToYear(g, 2010).success, false);
    assert.equal(g.getHistoricalYear(), 2005);
    assert.deepEqual(g.announcements, []);
});
