import { rouletteColor } from './casino.js';

const shapes = {
    diamond: '<path d="M12 2 22 9 12 23 2 9Z"/><path d="M2 9h20M7 9l5 14 5-14M7 9l5-7 5 7" fill="none" stroke="currentColor" stroke-width="1.15" opacity=".55"/>',
    cherry: '<path d="M8 14c3-3 6-6 6-12m3 12c-1-4-2-7-3-12 3 0 5 1 7 3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="7" cy="17" r="4.6"/><circle cx="17" cy="18" r="4.6"/>',
    bell: '<path d="M3 18h18v-2l-3-3V9a6 6 0 0 0-12 0v4l-3 3Zm6 2a3 3 0 0 0 6 0Z"/><circle cx="12" cy="3" r="2"/>',
    star: '<path d="m12 1 3.1 7.1 7.9.8-5.9 5.4 1.7 7.8-6.8-4-6.8 4 1.7-7.8L1 8.9l7.9-.8Z"/>',
    spade: '<path d="M12 1c4 5 10 8 10 13a5 5 0 0 1-8 4l2 5H8l2-5a5 5 0 0 1-8-4c0-5 6-8 10-13Z"/>',
    heart: '<path d="M12 22 3 13C-3 6 6-1 12 6c6-7 15 0 9 7Z"/>',
    club: '<path d="M12 2a5 5 0 0 1 4 8 5 5 0 1 1-2 9l2 4H8l2-4a5 5 0 1 1-2-9 5 5 0 0 1 4-8Z"/>',
    wheel: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6m0 6v6M3 12h6m6 0h6" fill="none" stroke="currentColor" stroke-width="2"/>',
    slots: '<rect x="2" y="5" width="20" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M6 9h4l-3 6m7-6h4l-3 6" fill="none" stroke="currentColor" stroke-width="1.7"/>'
};

export function casinoIcon(name) {
    return `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${shapes[name]}</svg>`;
}

const reelIcons = { DIAMANTE: 'diamond', CEREZA: 'cherry', CAMPANA: 'bell', ESTRELLA: 'star' };
export function reelFace(symbol) {
    return `<div class="reel-face" data-symbol="${symbol}">${reelIcons[symbol] ? casinoIcon(reelIcons[symbol]) : `<b>${symbol}</b>`}</div>`;
}

export const WHEEL_ORDER = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
export const POCKET_ANGLE = 360 / WHEEL_ORDER.length;

function point(radius, degrees) {
    const radians = degrees * Math.PI / 180;
    return `${(150 + radius * Math.sin(radians)).toFixed(3)} ${(150 - radius * Math.cos(radians)).toFixed(3)}`;
}

export const wheelArt = `<svg viewBox="0 0 300 300" aria-hidden="true">
    <circle cx="150" cy="150" r="148" fill="#37251e" stroke="#e4bc73" stroke-width="3"/>
    <circle cx="150" cy="150" r="139" fill="#0c1018" stroke="#9e713d" stroke-width="2"/>
    ${WHEEL_ORDER.map((number, index) => {
        const center = index * POCKET_ANGLE;
        const a = center - POCKET_ANGLE / 2;
        const b = center + POCKET_ANGLE / 2;
        return `<path class="pocket-${rouletteColor(number)}" d="M${point(132, a)} A132 132 0 0 1 ${point(132, b)} L${point(93, b)} A93 93 0 0 0 ${point(93, a)}Z"/><text x="150" y="42" transform="rotate(${center} 150 150)">${number}</text>`;
    }).join('')}
    <circle cx="150" cy="150" r="91" fill="#1e171a" stroke="#c79a56" stroke-width="3"/>
    <circle cx="150" cy="150" r="75" fill="#2f2022" stroke="#684738" stroke-width="1"/>
    <path d="M150 77v146m-73-73h146m-125-52 104 104m0-104L98 202" stroke="#9e713d" opacity=".46"/>
    <circle cx="150" cy="150" r="32" fill="#4e3227" stroke="#d0a963" stroke-width="2"/>
    <circle cx="150" cy="150" r="10" fill="#e8bf73"/>
</svg>`;
