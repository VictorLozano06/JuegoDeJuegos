import test from 'node:test';
import assert from 'node:assert/strict';
import { formatHistoryAllocation } from '../src/production-history-display.js';

test('muestra la distribución real con las áreas de la fase', () => {
    assert.equal(formatHistoryAllocation({stage: 1, allocation: {engine: 36, gameplay: 33, story: 31}}), 'Reparto: Motor y tecnología 36% · Jugabilidad 33% · Historia y narrativa 31%');
});
test('una entrada antigua o incompleta no inventa distribución', () => {
    assert.equal(formatHistoryAllocation({stage: 2}), 'Reparto: Sin datos históricos');
    assert.equal(formatHistoryAllocation({stage: 2, allocation: {graphics: 60}}), 'Reparto: Sin datos históricos');
});
test('cada semana presenta su propio reparto de Desarrollo', () => {
    const first = {stage: 2, allocation: {graphics: 36, sound: 33, world: 31}};
    const second = {stage: 2, allocation: {graphics: 60, sound: 21, world: 19}};
    assert.equal(formatHistoryAllocation(first), 'Reparto: Gráficos 36% · Sonido 33% · Mundo y contenido 31%');
    assert.equal(formatHistoryAllocation(second), 'Reparto: Gráficos 60% · Sonido 21% · Mundo y contenido 19%');
});
