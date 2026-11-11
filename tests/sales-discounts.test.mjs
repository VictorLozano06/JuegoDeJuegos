import assert from 'node:assert/strict';
import { test, after } from 'node:test';
import { createServer } from 'vite';
import { discountVolumeMultiplier, discountStatus } from '../src/SalesEngine.js';
const vite = await createServer({ server: { middlewareMode: true, ws: false } });
after(() => vite.close());
const { game: template } = await vite.ssrLoadModule('/src/simulation.js');
const { SaveSystem } = await vite.ssrLoadModule('/src/SaveSystem.js');
function storage() { const m = new Map(); return { get length() { return m.size; }, key(i) { return [...m.keys()][i] ?? null; }, getItem(k) { return m.get(k) ?? null; }, setItem(k,v) { m.set(k,String(v)); } }; }
function fixture() { return { id:'discount-test', name:'Prueba', basePrice:20, referencePrice:20, businessModel:'premium', weeksOnMarket:8, maxWeeks:14, initialPeakSales:1000, unitsSoldLastWeek:100, unitsSoldTotal:1000, revenueTotal:0, devCost:0, lifetimeServiceCosts:0, salesPotential:4100, decayRate:0.7, score:7, royaltyRate:0.1, platformRoyaltyRate:0.2, publisherRevenueShare:0.1, weeklySalesHistory:[], workshop:{}, profit:0 }; }
test('la caída debe superar el 80 %, y solo se admiten juegos de pago', () => {
    const title = fixture(); title.unitsSoldLastWeek = 200;
    assert.equal(discountStatus(title).eligible, false);
    title.unitsSoldLastWeek = 199; assert.equal(discountStatus(title).eligible, true);
    title.basePrice = 0; assert.equal(discountStatus(title).eligible, false);
    assert.equal(discountStatus({ ...title, basePrice: 20, businessModel:'early_access', officialReleased:false }).eligible, false);
});
test('la intensidad y la saturación reducen progresivamente el repunte', () => {
    assert.equal(discountVolumeMultiplier(15), 1.3);
    assert.equal(discountVolumeMultiplier(50), 2.5);
    assert.equal(discountVolumeMultiplier(75), 4);
    assert.ok(discountVolumeMultiplier(50, 1) < discountVolumeMultiplier(50, 0));
    assert.ok(discountVolumeMultiplier(75, 100) > 1);
});
test('la oferta dura dos semanas, descuenta ingresos netos y respeta el enfriamiento', () => {
    const sim = new template.constructor(), title = fixture(); sim.activeSales = [title]; sim.gamesHistory = [{...title}];
    assert.equal(sim.startDiscountCampaign(title.id, 50).success, true);
    assert.equal(sim.startDiscountCampaign(title.id, 50).success, false);
    sim.processWeeklySales();
    let week = title.weeklySalesHistory.at(-1);
    assert.equal(week.discountPercent, 50); assert.equal(week.unitPrice, 10);
    assert.equal(week.grossRevenue, week.unitsSold * 10);
    assert.equal(week.netRevenue, week.grossRevenue - Math.floor(week.grossRevenue*.1) - Math.floor(week.grossRevenue*.2) - Math.floor(week.grossRevenue*.1));
    assert.equal(title.discountCampaign.weeksRemaining, 1);
    sim.processWeeklySales(); assert.equal(title.discountCampaign, null); assert.equal(title.discountCooldownWeeks, 5);
    assert.equal(sim.startDiscountCampaign(title.id, 50).success, false);
    for(let i=0;i<5;i++) sim.processWeeklySales();
    assert.equal(title.discountCooldownWeeks, 0);
    assert.equal(sim.startDiscountCampaign(title.id, 50).success, true);
    assert.ok(title.discountCampaign.multiplier < 2.5);
});
test('una campaña en curso sobrevive a guardar y cargar', () => {
    const sim = new template.constructor(), title = fixture(); sim.activeSales = [title]; sim.gamesHistory = [{...title}];
    assert.equal(sim.startDiscountCampaign(title.id,25).success,true); sim.processWeeklySales();
    const saves = new SaveSystem(storage()); saves.save(sim, {id:'discount'});
    const loaded = new template.constructor(); saves.load('discount',loaded);
    const restored = loaded.activeSales.find(item => item.id === title.id);
    assert.equal(restored.discountCampaign.percent,25); assert.equal(restored.discountCampaign.weeksRemaining,1);
    loaded.processWeeklySales(); assert.equal(restored.discountCampaign,null); assert.equal(restored.discountCooldownWeeks,5);
});
test('la duración elegida se respeta y se valida', () => {
    const sim = new template.constructor(), title = fixture(); sim.activeSales = [title]; sim.gamesHistory = [title];
    assert.equal(sim.startDiscountCampaign(title.id, 25, 0).success, false);
    assert.equal(sim.startDiscountCampaign(title.id, 25, 9).success, false);
    assert.equal(sim.startDiscountCampaign(title.id, 25, 3).success, true);
    sim.processWeeklySales(); sim.processWeeklySales();
    assert.equal(title.discountCampaign.weeksRemaining, 1);
    sim.processWeeklySales(); assert.equal(title.discountCampaign, null); assert.equal(title.discountCooldownWeeks, 5);
});
test('finalizar una oferta manualmente inicia el enfriamiento y sincroniza el historial', () => {
    const sim = new template.constructor(), title = fixture(); sim.activeSales = [title]; sim.gamesHistory = [{ ...title }];
    assert.equal(sim.startDiscountCampaign(title.id, 50, 8).success, true);
    assert.equal(sim.endDiscountCampaign(title.id).success, true);
    assert.equal(title.discountCampaign, null); assert.equal(title.discountCooldownWeeks, 5);
    assert.equal(sim.gamesHistory[0].discountCampaign, null); assert.equal(sim.gamesHistory[0].discountCooldownWeeks, 5);
    assert.equal(sim.endDiscountCampaign(title.id).success, false);
    assert.equal(sim.startDiscountCampaign(title.id, 50).success, false);
});
