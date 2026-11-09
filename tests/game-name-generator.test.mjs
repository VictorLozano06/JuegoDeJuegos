import test from 'node:test';
import assert from 'node:assert/strict';
import { generateGameTitle, generateSequelName, cleanLegacyTitle, sanitizeRivalTitles } from '../src/gameNameGenerator.js';

test('generateGameTitle generates clean, authentic titles without colons, genre names, or company names', () => {
    const existing = new Set();
    const title1 = generateGameTitle('medieval', 'rpg', existing, () => 0.1);
    const title2 = generateGameTitle('space', 'shooter', existing, () => 0.2);
    const title3 = generateGameTitle('comedy', 'adventure', existing, () => 0.3);

    assert(title1.length > 3);
    assert(!title1.includes('('), 'Title must not include company parentheses');
    assert(!title1.includes(':'), 'Title must not include colons');

    assert(title2.length > 3);
    assert(!title2.includes('('));
    assert(!title2.includes(':'));

    assert(title3.length > 3);
    assert(!title3.includes('('));
    assert(!title3.includes(':'));
});

test('generateSequelName produces clean Roman numeral sequel designations', () => {
    assert.equal(generateSequelName('Odisea Estelar', 2), 'Odisea Estelar II');
    assert.equal(generateSequelName('Odisea Estelar II', 3), 'Odisea Estelar III');
    assert.equal(generateSequelName('Odisea Estelar 1', 4), 'Odisea Estelar IV');
    assert.equal(generateSequelName('Crónicas de Ávalon (Nébula Interactive)', 5), 'Crónicas de Ávalon V');
});

test('cleanLegacyTitle transforms ugly placeholder strings into proper titles', () => {
    const cleaned1 = cleanLegacyTitle('Comedia: Aventura 11 (Nébula Interactive) 5');
    assert(!cleaned1.includes('Nébula Interactive'));
    assert(!cleaned1.includes('Comedia:'));
    assert(cleaned1.endsWith(' V'), `Expected clean sequel designation, got: ${cleaned1}`);

    const cleaned2 = cleanLegacyTitle('Deportes: Aventura 1 (Nébula Interactive) 9');
    assert(!cleaned2.includes('Nébula Interactive'));
    assert(!cleaned2.includes('Deportes:'));
    assert(cleaned2.endsWith(' IX'), `Expected clean sequel designation, got: ${cleaned2}`);

    const cleaned3 = cleanLegacyTitle('Oeste: Aventura 7 (Delta Games)');
    assert(!cleaned3.includes('Delta Games'));
    assert(!cleaned3.includes('Oeste:'));
});

test('sanitizeRivalTitles cleans active game state', () => {
    const fakeGame = {
        top10Chart: [
            { title: 'Comedia: Aventura 11 (Nébula Interactive) 5', dev: 'Nébula Interactive' }
        ],
        ipCompanies: [
            {
                games: [{ name: 'Deportes: Aventura 1 (Nébula Interactive) 8' }],
                projects: [{ name: 'Espacio: Simulación 2 (Nébula Interactive)' }],
                history: [{ details: 'Inició Comedia: Aventura 11 (Nébula Interactive) 5.' }]
            }
        ],
        ipState: {
            properties: [
                { name: 'Comedia: Aventura 11 (Nébula Interactive)', originalTopic: 'comedy', originalGenre: 'adventure' }
            ]
        }
    };

    sanitizeRivalTitles(fakeGame);

    assert(!fakeGame.top10Chart[0].title.includes('Nébula'));
    assert(!fakeGame.ipCompanies[0].games[0].name.includes('Nébula'));
    assert(!fakeGame.ipCompanies[0].projects[0].name.includes('Nébula'));
    assert(!fakeGame.ipState.properties[0].name.includes('Nébula'));
});

