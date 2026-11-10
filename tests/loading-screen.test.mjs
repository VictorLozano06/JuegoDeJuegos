import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { ASSET_CATALOG, AssetPreloader } from '../src/loading-screen.js';

test('Asset catalog includes all essential 3D models and textures', () => {
    assert.ok(ASSET_CATALOG.models.length >= 10, 'Asset catalog should include 3D GLTF models');
    assert.ok(ASSET_CATALOG.models.includes('/models/retro-monitor.glb'));
    assert.ok(ASSET_CATALOG.models.includes('/models/retro-keyboard.glb'));
    assert.ok(ASSET_CATALOG.models.includes('/models/retro-mouse.glb'));
    assert.ok(ASSET_CATALOG.wallpapers.length >= 4, 'Asset catalog should include wallpapers');
    assert.ok(ASSET_CATALOG.avatars.length >= 6, 'Asset catalog should include avatars');
});

test('AssetPreloader reports progress and completes gracefully even in mock environment', async () => {
    const progressUpdates = [];
    let preparedOffice = false;
    const preloader = new AssetPreloader({
        onProgress: (ratio, label) => {
            progressUpdates.push({ ratio, label });
        }
    });

    const mockWorld = {
        createWhiteboardTexture: () => {},
        createArcadePosterTexture: () => {},
        renderer: {},
        scene: {},
        camera: {},
        async prepareOfficeFrame() { preparedOffice = true; }
    };

    await preloader.loadAll(mockWorld);

    assert.ok(preparedOffice, 'The office frame should be prepared before loading completes');
    assert.ok(progressUpdates.length > 5, 'Should emit multiple progress steps');
    const finalUpdate = progressUpdates[progressUpdates.length - 1];
    assert.ok(finalUpdate.ratio >= 0.9, 'Final progress ratio should be near or equal 1.0');
});

test('No system emojis exist in loading screen files (agentes/iconografia.md)', async () => {
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

    const jsCode = await readFile(new URL('../src/loading-screen.js', import.meta.url), 'utf8');
    const cssCode = await readFile(new URL('../src/loading-screen.css', import.meta.url), 'utf8');

    assert.equal(emojiRegex.test(jsCode), false, 'loading-screen.js must not contain system emojis');
    assert.equal(emojiRegex.test(cssCode), false, 'loading-screen.css must not contain system emojis');
});

