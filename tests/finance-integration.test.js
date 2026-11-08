import test from 'node:test';
import assert from 'node:assert/strict';
import { game as singleton } from '../src/simulation.js';
import { SaveSystem } from '../src/SaveSystem.js';
class MemoryStorage {constructor(){this.map=new Map()} get length(){return this.map.size} key(i){return [...this.map.keys()][i]??null} getItem(k){return this.map.get(k)??null} setItem(k,v){this.map.set(k,String(v))} removeItem(k){this.map.delete(k)}}
const fresh=()=>new singleton.constructor({rivalCount:0});
test('el calendario incorpora préstamos e impagos a la economía real',()=>{
 const g=fresh();const loan=g.requestFinanceLoan({type:'bank',amount:5000});assert(loan.success,loan.message);assert.equal(g.funds,80000);
 for(let i=0;i<4;i++)g.advanceCalendar();assert(loan.loan.paymentHistory.length);assert(g.financeState.weeklyHistory.length===4);assert(g.funds<80000);
});
test('migración y guardado durante crisis conservan el saldo y las obligaciones',()=>{
 const saves=new SaveSystem(new MemoryStorage()),old=fresh();delete old.financeState;old.funds=1234;saves.save(old,{id:'old'});
 const loaded=fresh();saves.load('old',loaded);assert.equal(loaded.financeState.lastBalance,1234);loaded.advanceCalendar();assert(loaded.financeState.weeklyHistory[0].cashFlow > -2000);
 const crisis=fresh();assert(crisis.requestFinanceLoan({type:'bank',amount:5000}).success);crisis.funds=-8000;for(let i=0;i<24;i++)crisis.advanceCalendar();
 saves.save(crisis,{id:'crisis'});const again=fresh();saves.load('crisis',again);assert.equal(again.financeState.status,crisis.financeState.status);assert.deepEqual(again.financeState.loans,crisis.financeState.loans);assert.equal(again.funds,crisis.funds);
});
test('quiebra es idempotente, impide inversiones y modo final no avanza',()=>{
 const g=fresh();g.funds=-100000;g.financeState.status='SEVERE';g.financeState.severeWeeks=20;g.financeState.creditScore=0;
 const original={id:'publicado',name:'Título histórico',score:8};g.gamesHistory.push(original);
 const result=g.confirmBankruptcy({mode:'end'});assert(result.success,result.message);assert.equal(g.financeState.bankruptcy.confirmed,true);
 assert.equal(g.confirmBankruptcy({mode:'end'}).success,false);assert.equal(g.startNewGameProject({platformId:'pc'}).success,false);assert.equal(g.registerIP({name:'Bloqueada'}).success,false);assert.strictEqual(g.gamesHistory[0],original);
 const week=g.getIndustryWeek();g.isPaused=false;g.advanceCalendar();assert.equal(g.getIndustryWeek(),week);
});
test('modo histórico avanza competidores sin operaciones ni gastos del jugador',()=>{
 const g=fresh();g.funds=-100000;g.financeState.status='SEVERE';g.financeState.severeWeeks=20;g.financeState.creditScore=0;
 assert(g.confirmBankruptcy({mode:'spectator'}).success);const cash=g.funds,week=g.getIndustryWeek();g.advanceCalendar();assert.equal(g.getIndustryWeek(),week+1);assert.equal(g.funds,cash);assert.equal(g.hireEmployee({salary:1}).success,false);
});

test('pérdidas estructurales sostenidas conducen a insolvencia grave sin quiebra automática',()=>{
 const g=fresh();g.funds=0;g.financeState.creditScore=0;
 for(let i=0;i<120;i++)g.advanceCalendar();
 assert.equal(g.financeState.status,'SEVERE');assert(g.financeState.severeWeeks>=8);assert.equal(g.financeState.bankruptcy,null);
 assert.equal(g.prepareBankruptcy().success,true);
 assert.equal(g.financeState.procedurePending,true);assert.equal(g.isPaused,true);
 const week=g.getIndustryWeek();g.isPaused=false;g.advanceCalendar();assert.equal(g.getIndustryWeek(),week);
 g.funds=100000;g.isPaused=false;g.advanceCalendar();assert.equal(g.financeState.procedurePending,false);assert.equal(g.getIndustryWeek(),week+1);
});
test('reestructuración reduce costes reales sin inventar ingresos',()=>{
 const g=fresh();const initial=g.getFinancialReport().weeklyCosts;const funds=g.funds;
 assert(g.beginRestructuring().success);assert(g.getFinancialReport().weeklyCosts<initial);assert.equal(g.funds,funds);
 const before=g.funds;g.advanceCalendar();assert.equal(g.funds,before-g.getFinancialReport().weeklyCosts);
});
