import test from 'node:test';
import assert from 'node:assert/strict';
import { youtubeVideoId } from '../src/youtube-url.js';

test('accepts supported YouTube links and extracts only the video identifier', () => {
    for (const url of ['https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5', 'https://youtu.be/dQw4w9WgXcQ', 'https://youtube.com/shorts/dQw4w9WgXcQ', 'https://music.youtube.com/watch?v=dQw4w9WgXcQ']) {
        assert.equal(youtubeVideoId(url), 'dQw4w9WgXcQ');
    }
});

test('rejects invalid identifiers and lookalike websites', () => {
    for (const url of ['https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ', 'javascript:alert(1)', 'https://youtube.com/watch?v=bad', '']) {
        assert.equal(youtubeVideoId(url), null);
    }
});
