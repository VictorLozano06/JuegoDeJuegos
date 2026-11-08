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

function drawFace(ctx, { closed, state, iris, blush, freckles }) {
    ctx.clearRect(0, 0, SIZE, SIZE);
    const thinking = state === 'thinking';
    const happy = state === 'celebrating';
    const ink = '#36241e';

    for (const side of [-1, 1]) {
        const eyeX = 64 + side * 23;
        const eyeY = 52;
        const browY = 34 - (happy ? 3 : 0) - (thinking && side > 0 ? 5 : 0);

        curve(ctx, ink, 4, eyeX - side * 9, browY + (thinking ? 3 : 0),
            eyeX, browY - 6, eyeX + side * 9, browY + 1);

        if (closed) {
            curve(ctx, ink, 3.8, eyeX - 9, eyeY,
                eyeX, eyeY + (happy ? -7 : 5), eyeX + 9, eyeY);
        } else {
            const irisX = eyeX + (thinking ? 3 : 0);
            oval(ctx, eyeX, eyeY, 9.5, happy ? 8.5 : 11, '#fff2dc');
            oval(ctx, irisX, eyeY + 1, 6.5, happy ? 7 : 8, iris);
            oval(ctx, irisX, eyeY + 0.5, 4.3, 6.3, ink);
            oval(ctx, irisX - 2, eyeY - 3, 2.4, 2.4, '#fffaf0');
        }

        oval(ctx, eyeX + side * 7, 74, 9.5, 3.8, blush);
        if (freckles) {
            for (let i = 0; i < 3; i++) {
                oval(ctx, eyeX + side * (i * 4 + 2), 72 + (i % 2) * 2, 1.15, 1, ink);
            }
        }
    }

    oval(ctx, 65, 72, 4.2, 2.8, blush);
    if (happy) {
        oval(ctx, 64, 94, 12, 5.2, '#673747');
        curve(ctx, '#fff1dd', 2.2, 56, 92, 64, 94, 72, 92);
    } else if (thinking) {
        curve(ctx, ink, 3, 59, 93, 65, 90, 71, 93);
    } else {
        curve(ctx, ink, 3.7, 54, 89, 65, 102, 76, 88);
    }
}

/**
 * Adds a single decal that follows the shape of the head. The anchor's local +Z
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
    const freckles = (randomState & 1) === 0;
    const blush = new THREE.Color(skinColor).lerp(new THREE.Color(0xb24c41), 0.37).getStyle();
    const texture = new THREE.CanvasTexture(canvas);
    texture.encoding = THREE.sRGBEncoding;

    const geometry = new THREE.PlaneGeometry(faceSize.width, faceSize.height, 12, 12);
    const points = geometry.getAttribute('position');
    for (let i = 0; i < points.count; i++) {
        points.setZ(i, faceSize.depth(points.getX(i), points.getY(i)));
    }
    geometry.computeVertexNormals();
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
        drawFace(ctx, { closed, state, iris, blush, freckles });
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
