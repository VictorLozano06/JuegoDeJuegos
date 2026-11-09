import test from 'node:test';
import assert from 'node:assert/strict';
import {profitCompleteness,profitWarning,formatGameProfit} from '../src/profit-display.js';
test('un juego nuevo completo no muestra aviso',()=>{const game={productionCostCompleteness:'complete',productionPayrollCost:0,profit:1200};assert.equal(profitCompleteness(game),'complete');assert.equal(profitWarning(game),'');assert.equal(formatGameProfit(game),'+$1200');});
test('un juego migrado informa que faltan costes',()=>{const game={productionCostCompleteness:'incomplete',profit:-50};assert.equal(profitCompleteness(game),'incomplete');assert.match(profitWarning(game),/faltan costes históricos/);assert.equal(formatGameProfit(game),'$-50');});
test('un registro antiguo sin marca no presume que es completo ni inventa beneficio',()=>{const game={};assert.equal(profitCompleteness(game),'unknown');assert.match(profitWarning(game),/no verificada/);assert.equal(formatGameProfit(game),'Sin datos');});

test('una marca completa sin nóminas verificables se considera desconocida',()=>{const game={productionCostCompleteness:'complete',profit:1};assert.equal(profitCompleteness(game),'unknown');assert.notEqual(profitWarning(game),'');});
