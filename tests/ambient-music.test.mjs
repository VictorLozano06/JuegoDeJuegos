import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createServer } from 'vite';

const vite = await createServer({ server: { middlewareMode: true, ws: false } });
after(() => vite.close());
const { soundEngine } = await vite.ssrLoadModule('/src/audio.js');

test('la música elige una pista inicial y alterna al terminar, también después de pausar', () => {
    const originalAudio = globalThis.Audio;
    const originalRandom = Math.random;
    class FakeAudio {
        constructor(src) { this.src = src; this.handlers = {}; this.paused = true; }
        addEventListener(name, callback) { this.handlers[name] = callback; }
        play() { this.paused = false; return Promise.resolve(); }
        pause() { this.paused = true; }
    }
    globalThis.Audio = FakeAudio;
    Math.random = () => 0.9;
    try {
        const engine = new soundEngine.constructor();
        engine.ctx = { createMediaElementSource: () => ({ connect() {} }) };
        engine.musicGain = {};
        engine.startAmbientMusic();
        const player = engine.musicElement;
        assert.match(player.src, /cancion2\.mp3$/);
        player.handlers.ended();
        assert.match(player.src, /cancion1\.mp3$/);
        engine.stopAmbientMusic();
        player.handlers.ended();
        assert.match(player.src, /cancion1\.mp3$/);
        engine.startAmbientMusic();
        assert.equal(engine.musicElement, player);
        player.handlers.ended();
        assert.match(player.src, /cancion2\.mp3$/);
    } finally {
        globalThis.Audio = originalAudio;
        Math.random = originalRandom;
    }
});
