import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createCompetition, reportScore, ranking, openCompetitionGala, visibleGala, saveCompetition, readCompetition } from '../online/competition.mjs';

test('los juegos de ambos estudios participan en la misma gala y esta se recupera en pausa', async () => {
    const folder = await mkdtemp(join(tmpdir(), 'dev-empire-competition-'));
    try {
        const file = join(folder, 'match.json');
        const match = { ...createCompetition(), id: 'shared', week: 48, speed: 2 };
        for (const [seat, score] of [['a', 9.1], ['b', 9.8]]) {
            const player = { seat, name: seat, resumeKey: 'key-' + seat };
            match.members.set(seat, player);
            reportScore(match, player, { studio: 'Estudio ' + seat, funds: 10, releases: 1, rating: score, sales: 600,
                titles: [{ id: 'same-id', name: 'Juego ' + seat, score, unitsSoldTotal: 600, releaseIndustryWeek: 47 }] });
        }
        openCompetitionGala(match);
        const award = match.gala.categories.find(category => category.id === 'goty');
        assert.deepEqual(award.nominees.map(title => title.seat).sort(), ['a', 'b']);
        assert.equal(award.winner.seat, 'b');
        assert.equal(visibleGala(match.gala).categories[0].winner, undefined);
        assert.equal(ranking(match)[0].seat, 'b');
        match.gala.step = 1;
        saveCompetition(file, match);
        const resumed = readCompetition(file);
        assert.equal(resumed.week, 48);
        assert.equal(resumed.speed, 0);
        assert.equal(resumed.gala.step, 1);
        assert.equal(visibleGala(resumed.gala).categories[0].winner.seat, 'b');
        assert.equal(resumed.members.get('b').resumeKey, 'key-b');
    } finally {
        await rm(folder, { recursive: true, force: true });
    }
});
