import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isCompanyLogoImage, prepareCompanyLogo, syncStudioAvatars } from '../src/company-logo.js';

test('only accepts supported image files within the size limit', async () => {
    await assert.rejects(prepareCompanyLogo({ type: 'image/svg+xml', size: 10 }), /PNG, JPG o WebP/);
    await assert.rejects(prepareCompanyLogo({ type: 'image/png', size: 5 * 1024 * 1024 + 1 }), /5 MB/);
    assert.equal(isCompanyLogoImage('[[DE_ICON_001]]'), false);
    assert.equal(isCompanyLogoImage('data:image/webp;base64,AAAA'), true);
});

test('resizes large images and releases the temporary object URL', async () => {
    const originalImage = globalThis.Image;
    const originalDocument = globalThis.document;
    const create = URL.createObjectURL;
    const revoke = URL.revokeObjectURL;
    const revoked = [];
    let canvas;
    try {
        globalThis.Image = class {
            naturalWidth = 1200;
            naturalHeight = 600;
            async decode() {}
        };
        globalThis.document = { createElement() {
            canvas = { getContext: () => ({ drawImage() {} }), toDataURL: () => 'data:image/webp;base64,AAAA' };
            return canvas;
        } };
        URL.createObjectURL = () => 'blob:logo-test';
        URL.revokeObjectURL = url => revoked.push(url);
        const logo = await prepareCompanyLogo({ type: 'image/png', size: 100 });
        assert.equal(logo, 'data:image/webp;base64,AAAA');
        assert.deepEqual([canvas.width, canvas.height], [256, 128]);
        assert.deepEqual(revoked, ['blob:logo-test']);
    } finally {
        globalThis.Image = originalImage;
        globalThis.document = originalDocument;
        URL.createObjectURL = create;
        URL.revokeObjectURL = revoke;
    }
});

test('updates studio avatars without changing another user’s avatar', () => {
    const originalDocument = globalThis.document;
    const own = { replaceChildren(image) { this.image = image; }, textContent: '' };
    const other = { textContent: 'Otro usuario' };
    const root = { querySelectorAll: selector => selector === '[data-studio-avatar]' ? [own] : [other] };
    try {
        globalThis.document = { createElement: () => ({}) };
        syncStudioAvatars(root, 'data:image/webp;base64,AAAA');
        assert.equal(own.image.src, 'data:image/webp;base64,AAAA');
        assert.equal(other.textContent, 'Otro usuario');
        syncStudioAvatars(root, '[[DE_ICON_001]]');
        assert.equal(own.textContent, '[[DE_ICON_001]]');
    } finally {
        globalThis.document = originalDocument;
    }
});
