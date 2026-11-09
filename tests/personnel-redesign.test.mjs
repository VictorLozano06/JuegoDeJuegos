import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Personnel tabs and panels exist with correct accessibility attributes', () => {
    const html = fs.readFileSync('index.html', 'utf8');
    const tabs = ['staff', 'recruitment', 'training', 'conditions', 'statistics'];

    for (const tab of tabs) {
        assert.ok(html.includes(`data-personnel-tab="${tab}"`), `Tab button ${tab} must exist`);
        assert.ok(html.includes(`id="personnel-panel-${tab}"`), `Panel ${tab} must exist`);
    }

    assert.ok(html.includes('id="personnel-employee-detail"'), 'Employee detail container must exist');
    assert.ok(html.includes('id="personnel-candidate-detail"'), 'Candidate detail container must exist');
    assert.ok(html.includes('id="work-mode-comparison"'), 'Work mode comparison container must exist');
    assert.ok(html.includes('id="training-status-banner"'), 'Training status banner must exist');
    assert.ok(html.includes('id="personnel-statistics"'), 'Personnel statistics container must exist');
});

test('No system emojis exist in personnel redesign files (agentes/iconografia.md)', () => {
    const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const css = fs.readFileSync('src/personnel-redesign.css', 'utf8');
    assert.equal(emojiRegex.test(css), false, 'src/personnel-redesign.css must have 0 emojis');

    const html = fs.readFileSync('index.html', 'utf8');
    const modalSection = html.slice(html.indexOf('id="modal-hire"'), html.indexOf('id="modal-research"'));
    assert.equal(emojiRegex.test(modalSection), false, 'modal-hire must have 0 emojis');
});

test('Personnel actions use in-game modal dialogs without browser alert/confirm (agentes/dialogos.md)', () => {
    const mainJs = fs.readFileSync('src/main.js', 'utf8');
    const dismissalFn = mainJs.slice(mainJs.indexOf('window.confirmStaffDismissal'), mainJs.indexOf('window.hireCandidate'));
    assert.ok(dismissalFn.includes('dismissal-dialog'), 'confirmStaffDismissal must use custom in-game dialog');
    assert.equal(dismissalFn.includes('window.confirm('), false, 'must not use window.confirm');
    assert.equal(dismissalFn.includes('confirm('), false, 'must not use confirm()');
    assert.equal(dismissalFn.includes('alert('), false, 'must not use alert()');
});

