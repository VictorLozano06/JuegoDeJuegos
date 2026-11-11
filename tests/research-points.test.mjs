import assert from 'node:assert/strict';
import { test } from 'node:test';
import { game } from '../src/simulation.js';

test('el tiempo y el desarrollo de un motor no generan puntos de investigación', () => {
    const studio = new game.constructor();
    studio.isPaused = false;
    const initial = studio.researchPoints;
    studio.advanceCalendar();
    assert.equal(studio.researchPoints, initial);

    studio.activeEngineRD = { totalWeeks: 3, weeksRemaining: 3, leadProgrammerIndex: 0 };
    studio.advanceCalendar();
    assert.equal(studio.researchPoints, initial);
    assert.ok(studio.activeEngineRD.techPoints > 0);
});

test('el análisis post-mortem recompensa con puntos de investigación', () => {
    const studio = new game.constructor();
    studio.gamesHistory = [{ id: 'game-1', name: 'Juego', score: 7 }];
    const initial = studio.researchPoints;
    const result = studio.completePostMortemAnalysis('game-1');
    assert.equal(studio.researchPoints, initial + result.rpGained);
    assert.ok(result.rpGained > 0);
});
