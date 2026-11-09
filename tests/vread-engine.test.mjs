import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyVreadPost, generateVreadFeed, getVreadSalesMultiplier, publishVreadPost, getCommunitySentiment } from '../src/vread-engine.js';
import { REPLY_ENDINGS } from '../src/vread-content.js';

function fixture() {
    const a = { id: 'a', name: 'Aventura Solar', score: 4, bugsAtRelease: 18 };
    const b = { id: 'b', name: 'Bosque Lunar', score: 9, bugsAtRelease: 0 };
    return { companyName: 'Estudio', year: 1, month: 1, week: 1, activeSales: [a, b], gamesHistory: [a, b], ipCompanies: [{ id: 'r1', name: 'Sol Games', games: [{ id: 'rgame', name: 'Marea Eterna', score: 8 }] }], notify() {} };
}
function random(seed = 1234) { return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296); }

test('clasifica intención y conserva el contexto de las respuestas', () => {
    assert.equal(classifyVreadPost('Pedimos disculpas por los errores'), 'apology');
    assert.equal(classifyVreadPost('Anunciamos un parche para el juego'), 'patch');
    assert.equal(classifyVreadPost('Los jugadores son idiotas'), 'insult');
    assert.equal(classifyVreadPost('Tenemos bugs pendientes'), 'problem');
    assert.equal(classifyVreadPost('Es perfecto y no tiene bugs'), 'boast');
    assert.equal(classifyVreadPost('¿Tendrá multijugador cooperativo?'), 'multiplayer');
    assert.equal(classifyVreadPost('¿Cuánto cuesta?'), 'monetization');
    const game = fixture();
    const result = publishVreadPost(game, 'Disculpas por los errores de Aventura Solar', random());
    assert.equal(result.impact.kind, 'apology');
    assert.match(result.post.replies[0].text, /Aventura Solar/);
    assert.match(result.post.replies[0].text, /disculpa|problema|reconocer|paso/i);
});

test('el impacto es limitado, afecta al juego mencionado y decae', () => {
    const game = fixture();
    const result = publishVreadPost(game, 'Anunciamos parche para Aventura Solar', random());
    assert.ok(result.impact.sales > 0);
    assert.equal(getVreadSalesMultiplier(game, game.activeSales[0], 1), 1);
    assert.ok(getVreadSalesMultiplier(game, game.activeSales[0], 2) > 1);
    assert.equal(getVreadSalesMultiplier(game, game.activeSales[1], 2), 1);
    assert.ok(getVreadSalesMultiplier(game, game.activeSales[0], 3) < getVreadSalesMultiplier(game, game.activeSales[0], 2));
    assert.equal(getVreadSalesMultiplier(game, game.activeSales[0], 5), 1);
    const repeated = publishVreadPost(game, 'Anunciamos parche para Aventura Solar', random());
    assert.equal(repeated.impact.sales, 0);
    assert.equal(repeated.impact.repeated, true);
});

test('una polémica resta reputación y provoca respuestas y publicaciones críticas', () => {
    const game = fixture();
    const result = publishVreadPost(game, 'Los jugadores son idiotas', random());
    assert.equal(result.impact.backlash, true);
    assert.equal(game.vreadState.reputation, 38);
    assert.ok(getVreadSalesMultiplier(game, game.activeSales[0], 2) < 1);
    const feed = generateVreadFeed(game, random());
    assert.ok(feed.some(post => /polémica|criticando|molestado/i.test(post.text)));
    assert.match(result.post.replies[0].text, /aceptable|insultar|críticas|disculpa/i);
});

test('una publicación sobre un proyecto solo afecta a ese título si se estrena a tiempo', () => {
    const game = fixture();
    game.currentProject = { name: 'Nuevo Horizonte' };
    publishVreadPost(game, 'Anunciamos Nuevo Horizonte', random());
    assert.ok(getVreadSalesMultiplier(game, { id: 'released-project', name: 'Nuevo Horizonte' }, 2) > 1);
    assert.equal(getVreadSalesMultiplier(game, game.activeSales[0], 2), 1);
    assert.equal(getVreadSalesMultiplier(game, { id: 'released-project', name: 'Nuevo Horizonte' }, 5), 1);
});

test('los mensajes neutrales no cambian ventas y el impacto acumulado tiene un límite', () => {
    const game = fixture();
    assert.equal(publishVreadPost(game, 'Hoy es martes', random()).impact.sales, 0);
    for (let i = 0; i < 12; i++) publishVreadPost(game, `Los jugadores son idiotas ${i}`, random(i + 4));
    assert.ok(getVreadSalesMultiplier(game, game.activeSales[0], 2) >= .55);
    assert.ok(game.vreadState.reputation >= 0);
});

test('el feed mezcla jugadores, rivales y temas variados durante muchas renovaciones', () => {
    const game = fixture(), rng = random(), seen = new Set(), authors = new Set();
    let player = false, rival = false, company = false;
    for (let i = 0; i < 80; i++) {
        const feed = generateVreadFeed(game, rng);
        for (const post of feed) {
            seen.add(post.text); authors.add(post.handle);
            player ||= /Aventura Solar|Bosque Lunar/.test(post.text);
            rival ||= /Marea Eterna/.test(post.text);
            company ||= /Sol Games/.test(post.text);
        }
    }
    assert.ok(player && rival && company);
    assert.ok(authors.size >= 25);
    assert.ok(seen.size > 700, `Solo se generaron ${seen.size} textos distintos`);
});

test('las publicaciones del estudio reciben más respuestas variadas y de perfiles distintos', () => {
    const game = fixture(), rng = random(973), authors = new Set(), replies = new Set();
    for (let i = 0; i < 30; i++) {
        const result = publishVreadPost(game, `Anunciamos un nuevo juego: avance ${i}`, rng);
        assert.ok(result.post.replies.length >= 6);
        assert.equal(new Set(result.post.replies.map(reply => reply.handle)).size, result.post.replies.length);
        assert.equal(new Set(result.post.replies.map(reply => reply.text)).size, result.post.replies.length);
        const endings = result.post.replies.map(reply => REPLY_ENDINGS.find(ending => ending && reply.text.endsWith(ending))).filter(Boolean);
        assert.equal(new Set(endings).size, endings.length);
        for (const reply of result.post.replies) { authors.add(reply.handle); replies.add(reply.text); }
    }
    assert.ok(authors.size >= 150, `Solo participaron ${authors.size} perfiles`);
    assert.ok(replies.size >= 150, `Solo hubo ${replies.size} respuestas diferentes`);
    assert.ok(game.vreadState.recentReplies.length <= 240);
    assert.ok(game.vreadState.recentParticipants.length <= 100);
});

test('las conversaciones del feed tienen varios comentarios y autores diferenciados', () => {
    const feed = generateVreadFeed(fixture(), random(29));
    assert.ok(feed.every(post => post.replies.length >= 3));
    for (const post of feed) {
        assert.ok(post.replies.every(reply => reply.handle !== post.handle));
        assert.equal(new Set(post.replies.map(reply => reply.handle)).size, post.replies.length);
        assert.equal(new Set(post.replies.map(reply => reply.text)).size, post.replies.length);
    }
});

test('sistema de haters genera publicaciones hostiles y termómetro de comunidad coherente', () => {
    const game = fixture();
    const feed = generateVreadFeed(game, random(42));
    const haterPosts = feed.filter(p => p.isHater || p.type === 'hater');
    assert.ok(haterPosts.length >= 1, 'Debe haber publicaciones de haters en el feed');
    assert.ok(haterPosts.some(p => p.text.includes('#Haters') || p.text.includes('bodrio') || p.text.includes('estafa') || p.text.includes('timo') || p.text.includes('basura')));

    const sentiment = getCommunitySentiment(game);
    assert.ok(sentiment.fans >= 0 && sentiment.fans <= 100);
    assert.ok(sentiment.haters >= 0 && sentiment.haters <= 100);
    assert.ok(sentiment.neutral >= 0 && sentiment.neutral <= 100);
    assert.equal(sentiment.fans + sentiment.neutral + sentiment.haters, 100);
    assert.ok(typeof sentiment.label === 'string' && sentiment.label.length > 0);
});
