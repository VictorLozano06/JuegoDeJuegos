const SIZE = 128;
const BLINK_DURATION = 0.12;
const IRISES = ['#482734', '#31565b', '#563529', '#425138'];

function seedValue(seed) {
    let value = 2166136261;
    for (const char of String(seed)) {
        value = Math.imul(value ^ char.codePointAt(0), 16777619);
    }
    return value >>> 0;
}

function oval(ctx, x, y, rx, ry, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
}

function curve(ctx, color, width, x, y, cx, cy, endX, endY) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(cx, cy, endX, endY);
    ctx.stroke();
}

function drawFace(ctx, { closed, state, iris, warmShade, variant }) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    const thinking = state === 'thinking';
    const happy = state === 'celebrating';
    const ink = '#2b1d29';

    for (const side of [-1, 1]) {
        const eyeX = SIZE * (0.5 + side * 0.215);
        const eyeY = SIZE * 0.4;
        const browY = SIZE * 0.24 - (happy ? 2 : 0) - (thinking && side > 0 ? 4 : 0);
        const browTilt = thinking ? 3 : variant;

        curve(ctx, ink, 4, eyeX - side * 11, browY + browTilt,
            eyeX, browY - 5, eyeX + side * 12, browY + 1);

        if (closed) {
            curve(ctx, ink, 3.6, eyeX - 12, eyeY,
                eyeX, eyeY + (happy ? -7 : 6), eyeX + 12, eyeY);
        } else {
            const height = happy ? 7.5 : 9;
            const irisX = eyeX + (thinking ? 3 : side * -1);
            oval(ctx, eyeX, eyeY, 13, height + 1.5, ink);
            oval(ctx, eyeX, eyeY + 1, 11, height - 1.25, '#fff7e8');
            oval(ctx, irisX, eyeY, 6.4, height - 1.5, iris);
            oval(ctx, irisX, eyeY, 3.6, 4.9, ink);
            oval(ctx, irisX - 2, eyeY - 3, 2.1, 2.1, '#fffaf0');
            oval(ctx, irisX + 2.4, eyeY + 2.6, 0.9, 0.9, '#f7e5d6');
        }

        oval(ctx, eyeX + side * 3, 72, 8, 3, warmShade);
    }

    curve(ctx, warmShade, 3.5, 59, 78, 64, 81, 69, 77);
    if (happy) {
        oval(ctx, 64, 94, 12, 5.2, '#673747');
        curve(ctx, '#fff1dd', 2.2, 56, 92, 64, 94, 72, 92);
    } else if (thinking) {
        curve(ctx, '#6b3c48', 3, 59, 95, 65, 91, 71, 94);
    } else {
        curve(ctx, '#6b3c48', 3, 54, 92, 63, 100, 74, 91 - variant);
    }
}

/**
 * Adds a single decal to the flat front of the head. The anchor's local +Z
 * faces away from the skin. Animation time is the caller's elapsed seconds.
 */
export function createEmployeeFace(THREE, faceAnchor, faceSize, skinColor, seed) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        // The geometry is still usable when Canvas 2D is unavailable.
        return { update() {}, dispose() {} };
    }
    ctx.lineCap = 'round';

    let randomState = seedValue(seed);
    const iris = IRISES[randomState % IRISES.length];
    const variant = (randomState >>> 8) % 4;
    const warmShade = new THREE.Color(skinColor).lerp(new THREE.Color(0xa84857), 0.28).getStyle();
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;

    const geometry = new THREE.PlaneGeometry(faceSize.width, faceSize.height);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        alphaTest: 0.015,
        roughness: 0.7,
        metalness: 0.1
    });
    const face = new THREE.Mesh(geometry, material);
    face.name = 'Employee face decal';
    face.receiveShadow = true;
    faceAnchor.add(face);

    let nextBlink;
    let lastClosed = false;
    let lastState = 'typing';

    function blinkInterval() {
        randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
        return 3 + 2 * randomState / 4294967296;
    }

    function paint(closed, state) {
        drawFace(ctx, { closed, state, iris, warmShade, variant });
        texture.needsUpdate = true;
    }

    paint(lastClosed, lastState);

    return {
        update(timeSeconds, state) {
            nextBlink ??= timeSeconds + blinkInterval();
            if (timeSeconds >= nextBlink + BLINK_DURATION) {
                // Reset after a suspended tab as well as after a normal blink.
                nextBlink = timeSeconds + blinkInterval();
            }
            const closed = timeSeconds >= nextBlink;
            if (closed !== lastClosed || state !== lastState) {
                paint(closed, state);
                lastClosed = closed;
                lastState = state;
            }
        },
        dispose() {
            faceAnchor.remove(face);
            texture.dispose();
            material.dispose();
            geometry.dispose();
        }
    };
}
