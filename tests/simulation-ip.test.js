import test from 'node:test';
import assert from 'node:assert/strict';
import {game as singleton} from '../src/simulation.js';
const fresh = () => new singleton.constructor();

test('registro desde original, proyecto y publicación conectan una sola franquicia', () => {
 const game = fresh();
 const original = {id:'original-1',name:'El inicio',genreId:'action',topicId:'space',score:8,unitsSoldTotal:10000,releaseYear:1982};
 game.gamesHistory.push(original);
 const created = game.registerIP({name:'Saga', originalGameId:original.id});
 assert.equal(created.success,true); assert.equal(game.funds,70000);
 assert.equal(original.ipId,created.ip.id); assert.equal(created.ip.originalTopic,'space');
 assert.equal(game.registerIP({name:'Otra',originalGameId:original.id}).success,false);
 assert.equal(game.linkGameToIP(created.ip.id, original.id).success,false);
 const project = game.startNewGameProject({name:'Saga 2',platformId:'pc',ipId:created.ip.id,ipInstallmentType:'sequel',force:true});
 assert.equal(project.success,true,project.message);
 const released = game.finishAndReleaseGame();
 assert.equal(released.ipId,created.ip.id); assert(created.ip.publishedGameIds.includes(released.id));
 assert.equal(created.ip.gameIds.length,2); assert.equal(created.ip.saturation,25);
});

test('operaciones de mercado usan saldos reales y bloquean transferencias inválidas', () => {
 const game=fresh(); const rival={id:'r1',name:'Rival',funds:200000};game.ipCompanies.push(rival);
 const result=game.registerIP({name:'Saga'}); const ip=result.ip; const price=game.getIPValue(ip.id);
 assert.equal(game.sellIP(ip.id,'r1',price).success,true);
 assert.equal(rival.funds,200000-price); assert.equal(ip.ownerId,'r1');
 assert.equal(game.sellIP(ip.id,'r1',price).success,false);
 assert.equal(game.setIPForSale(ip.id,price).success,false);
 ip.forSale=true; ip.askingPrice=price;
 game.funds=price-1; assert.equal(game.buyIP(ip.id).success,false); assert.equal(ip.ownerId,'r1');
 game.funds=price; assert.equal(game.buyIP(ip.id).success,true);assert.equal(ip.ownerId,'player');
 assert.equal(ip.ownershipHistory.length,3);assert.equal(game.ipState.transactions.length,2);
});

test('proyectos y ventas validan propiedad antes de gastar y no bloquean secuelas por fechas', () => {
 const game=fresh();const ip=game.registerIP({name:'Saga'}).ip;game.ipCompanies.push({id:'r1',name:'Rival',funds:1e6});
 const funds=game.funds;
 assert.equal(game.startNewGameProject({platformId:'pc',ipId:'missing',ipInstallmentType:'sequel',force:true}).success,false);
 assert.equal(game.funds,funds);
 const started=game.startNewGameProject({name:'Secuela',platformId:'pc',ipId:ip.id,ipInstallmentType:'sequel',force:true});
 assert.equal(started.success,true,started.message);
 assert.equal(game.sellIP(ip.id,'r1',10000).success,false);assert.equal(ip.ownerId,'player');
});

test('partida real guarda y recupera franquicia, fondos y vínculo a videojuego', async () => {
 const {SaveSystem}=await import('../src/SaveSystem.js');
 class MemoryStorage {constructor(){this.data=new Map()} get length(){return this.data.size} key(i){return [...this.data.keys()][i]??null} getItem(k){return this.data.get(k)??null} setItem(k,v){this.data.set(k,String(v))} removeItem(k){this.data.delete(k)}}
 const saves=new SaveSystem(new MemoryStorage());const game=fresh();
 const source={id:'test-original',name:'Original',genre:'Acción',topic:'Espacio',score:8,unitsSoldTotal:1234,releaseYear:1982}; game.gamesHistory.push(source);game.activeSales.push(source);
 const {ip}=game.registerIP({name:'Saga guardada',originalGameId:source.id});
 assert.equal(saves.save(game,{id:'ip-save'}).id,'ip-save');const loaded=fresh();assert.equal(saves.load('ip-save',loaded).id,'ip-save');
 assert.equal(loaded.ipState.properties[0].id,ip.id);assert.equal(loaded.funds,70000);assert.strictEqual(loaded.activeSales[0],loaded.gamesHistory[0]);assert.equal(loaded.gamesHistory[0].ipId,ip.id);assert.equal(loaded.ipState.properties[0].publishedGameIds[0],source.id);
});
