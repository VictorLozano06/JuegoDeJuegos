import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getPortOptions, startPortProject, tickPorting } from '../src/PortingPipeline.js';

function studio() {
    let now = 150;
    const platforms = [
        { id:'pc', name:'PC', releaseYear:1982, marketShare:.6, royaltyRate:0, status:'ACTIVE' },
        { id:'console', name:'Consola', releaseYear:1983, marketShare:.4, royaltyRate:.1, status:'ACTIVE' },
        { id:'future', name:'Futuro', releaseYear:2000, marketShare:.5, status:'ACTIVE' },
        { id:'retired', name:'Retirada', releaseYear:1982, retireYear:1983, status:'RETIRED' }
    ];
    const title = { id:'g1', name:'Juego', score:8, releaseIndustryWeek:130, platformId:'pc', platformIds:['pc'], weeksOnMarket:20, devCost:10000, salesPotential:10000, launchMarketShare:.6, basePrice:20, unitsSoldTotal:100, revenueTotal:2000, profit:0 };
    const game = { funds:10000, lastWeeklySalesIncome:0, gamesHistory:[title], activeSales:[title], employees:[{id:'dev', name:'Dev', tech:50}], ownedDevKits:['pc','console','future','retired'], getHistoricalYear:()=>1984, getIndustryWeek:()=>now, getPlatforms:()=>platforms, getPlatformById:id=>platforms.find(p=>p.id===id), getIndustrySalesMultiplier:()=>1, advance:()=>now++ };
    return { game, title };
}

test('requisitos de nota, antigüedad, plataforma activa y licencia', () => {
    const {game, title} = studio();
    assert.deepEqual(getPortOptions(game, 'g1').platforms.map(p=>p.id), ['console']);
    title.score=6; assert.match(startPortProject(game,'g1','console','dev').message,/nota/);
    title.score=8; title.releaseIndustryWeek=145; assert.match(startPortProject(game,'g1','console','dev').message,/12 semanas/);
    title.releaseIndustryWeek=130; game.ownedDevKits=['pc'];
    assert.equal(startPortProject(game,'g1','console','dev').success,false);
});

test('el port consume un empleado y presupuesto, se publica y vende de forma independiente', () => {
    const {game, title} = studio();
    const result = startPortProject(game,'g1','console','dev');
    assert.equal(result.success,true); assert.equal(result.project.totalWeeks,6);
    assert.equal(game.funds,8000); assert.equal(game.portProjects[0].employeeId,'dev');
    assert.equal(getPortOptions(game,'g1').employees.length,0);
    for(let i=0;i<6;i++) { game.advance(); tickPorting(game); }
    assert.equal(game.portProjects.length,0);
    assert.ok(title.platformIds.includes('console')); assert.equal(title.ports[0].unitsSoldTotal,0);
    game.advance(); const sales = tickPorting(game);
    assert.ok(title.ports[0].unitsSoldTotal>0); assert.ok(sales.income>0);
    assert.equal(game.lastWeeklySalesIncome,sales.income);
    assert.equal(title.unitsSoldTotal,100+title.ports[0].unitsSoldTotal);
    assert.equal(startPortProject(game,'g1','console','dev').success,false);
});

test('si desaparece el empleado, se cancela el port y se devuelve el coste', () => {
    const {game} = studio(); startPortProject(game,'g1','console','dev'); game.employees=[];
    tickPorting(game); assert.equal(game.funds,10000); assert.equal(game.portProjects.length,0);
});
