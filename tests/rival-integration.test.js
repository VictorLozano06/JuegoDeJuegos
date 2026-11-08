import test from 'node:test';
import assert from 'node:assert/strict';
import { game as singleton } from '../src/simulation.js';
import { SaveSystem } from '../src/SaveSystem.js';
class MemoryStorage { constructor(){this.map=new Map()} get length(){return this.map.size} key(i){return [...this.map.keys()][i]??null} getItem(k){return this.map.get(k)??null} setItem(k,v){this.map.set(k,String(v))} removeItem(k){this.map.delete(k)} }
const fresh = count => new singleton.constructor({rivalCount:count});
test('calendario produce juegos reales y ranking basado en ventas de rivales', () => {
 const game=fresh(5); assert.equal(game.top10Chart.length,0);
 for(let i=0;i<160;i++) game.advanceCalendar();
 const games=game.ipCompanies.flatMap(c=>c.games);
 assert(games.length>0,'deben publicarse juegos');
 assert(games.some(g=>g.unitsSoldTotal>0),'debe haber ventas');
 for(const entry of game.top10Chart.filter(e=>!e.isPlayer)) {
  const original=games.find(g=>g.id===entry.gameId); assert(original);assert.equal(entry.weeklySales,original.weeklySales);
 }
 assert(game.ipState.properties.some(ip=>ip.ownerId!=='player'),'deben surgir franquicias rivales');
});
test('partida conserva identidad, cartera y cero rivales cuando se ha configurado así', () => {
 const saves=new SaveSystem(new MemoryStorage()),game=fresh(2);
 for(let i=0;i<15;i++)game.advanceCalendar();
 const snapshot=game.ipCompanies.map(c=>[c.id,c.name,c.funds]);saves.save(game,{id:'rivals'});
 const restored=fresh(4);saves.load('rivals',restored);assert.deepEqual(restored.ipCompanies.map(c=>[c.id,c.name,c.funds]),snapshot);
 const noRivals=fresh(0);saves.save(noRivals,{id:'none'});const zeroLoaded=fresh(5);saves.load('none',zeroLoaded);assert.equal(zeroLoaded.ipCompanies.length,0);
});
test('guardado anterior migra sin perder franquicias y no regenera al volver a cargar', () => {
 const saves=new SaveSystem(new MemoryStorage()),old=fresh(0);delete old.rivalSystemVersion;delete old.rivalSettings;
 old.registerIP({name:'Franquicia anterior'});saves.save(old,{id:'old'});
 const loaded=fresh(3);saves.load('old',loaded);assert.equal(loaded.ipCompanies.length,5);assert.equal(loaded.ipState.properties[0].name,'Franquicia anterior');
 const ids=loaded.ipCompanies.map(c=>c.id);saves.save(loaded,{id:'new'});const loadedAgain=fresh(1);saves.load('new',loadedAgain);assert.deepEqual(loadedAgain.ipCompanies.map(c=>c.id),ids);
});

test('la compra directa respeta proyectos activos del propietario rival', async () => {
 const {registerIP,setIPForSale}=await import('../src/ipSystem.js');const game=fresh(1);const rival=game.ipCompanies[0];
 const ip=registerIP(game.ipState,rival,{name:'Saga rival protegida'},{year:1982}).ip;
 setIPForSale(game.ipState,rival.id,ip.id,100,{year:1982});rival.projects.push({id:'proyecto',ipId:ip.id});
 const before=game.funds;assert.equal(game.buyIP(ip.id).success,false);assert.equal(game.funds,before);assert.equal(ip.ownerId,rival.id);assert.equal(game.getIPMarket().some(item=>item.id===ip.id),false);
});
