import test from 'node:test';
import assert from 'node:assert/strict';
import { createFinanceState } from '../src/financeSystem.js';
import { createIPState, registerIP } from '../src/ipSystem.js';
import { cancelPlayerProject, reduceStaff, stopResearch, restructureCompany, prepareBankruptcy, confirmBankruptcy } from '../src/bankruptcy.js';

function fixture() {
 const financeState=createFinanceState(-2000); financeState.status='SEVERE';financeState.severeWeeks=8;financeState.creditScore=0;
 const game={funds:-2000,companyName:'Estudio',year:1,era:1,financeState,ipState:createIPState(),ipCompanies:[],gamesHistory:[{id:'published',name:'Juego anterior'}],activeSales:[],
  employees:[{id:'player',name:'Fundador',salary:1200},{id:'e1',name:'Ana',salary:1000}],availableCandidates:[],
  inHouseEngines:[{id:'engine',name:'Motor propio'}],customEngines:[],ownedDevKits:['nes'],
  currentProject:{name:'En curso', progress:75, importantData:{scope:'completo'}},activeResearch:{techId:'research'},
  getHistoricalYear(){return 1982},getIndustryWeek(){return 12}, getIPValue(){return 10000},
  getIPOwner(id='player'){if(id!=='player')return this.ipCompanies.find(co=>co.id===id);const g=this;return {id:'player',name:g.companyName,get funds(){return g.funds},set funds(n){g.funds=n}}}
 };
 financeState.loans.push({id:'loan',lender:'Banco',remaining:1000,arrears:300,status:'DEFAULTED',paymentHistory:[],nextDueWeek:12,installment:100});
 return game;
}

test('recortes y archivo de proyectos conservan datos y no permiten despedir al fundador',()=>{
 const g=fixture();g.funds=5000;
 assert.equal(reduceStaff(g,'player').success,false);assert(reduceStaff(g,'e1').success);assert.equal(g.funds,4000);assert.equal(g.availableCandidates.at(-1).name,'Ana');
 assert(cancelPlayerProject(g).success);assert.equal(g.financeState.archivedProjects[0].project.importantData.scope,'completo');
 assert(stopResearch(g).success);assert(restructureCompany(g).success);assert.equal(g.financeState.restructuring.officeMultiplier,.8);assert.equal(restructureCompany(g).success,false);
});

test('liquidación conserva deuda, activos no vendidos, personal e historial y es idempotente',()=>{
 const g=fixture();const ip=registerIP(g.ipState,{id:'player',name:'Estudio',funds:20000},{name:'Saga'},{year:1982}).ip;
 const preview=prepareBankruptcy(g);assert(preview.success,preview.message);assert.equal(preview.summary.debt,3300);
 const result=confirmBankruptcy(g,{mode:'spectator'});assert(result.success,result.message);assert.equal(g.financeState.status,'BANKRUPT');assert.equal(g.financeState.loans[0].arrears,300);assert.equal(g.financeState.loans[0].remaining,1000);
 assert.equal(ip.ownerId,'player');assert.equal(g.funds,-2000);assert.equal(g.financeState.bankruptcy.unsoldIPs[0].id,ip.id);assert.equal(g.financeState.bankruptcy.estateAssets.engines[0].id,'engine');
 assert.equal(g.gamesHistory[0].id,'published');assert.equal(g.availableCandidates.at(-1).id,'e1');assert.equal(g.employees.length,1);assert.equal(g.financeState.archivedProjects[0].project.importantData.scope,'completo');
 assert.equal(confirmBankruptcy(g).success,false);
});

test('venta real de IP y liquidación pagan primero atrasos con fondos existentes',()=>{
 const g=fixture();g.funds=0;const rival={id:'buyer',name:'Comprador',funds:50000,status:'ACTIVE',employees:[],decisionWeights:{franchise:.9},totalExpenses:0};g.ipCompanies.push(rival);
 const ip=registerIP(g.ipState,{id:'player',name:'Estudio',funds:20000},{name:'Saga'},{year:1982}).ip;
 const result=confirmBankruptcy(g,{mode:'end'});assert(result.success,result.message);assert.equal(ip.ownerId,'buyer');assert.equal(rival.funds,43500);assert.equal(g.ipState.transactions.length,1);
 assert.equal(g.financeState.loans[0].arrears,0);assert.equal(g.financeState.loans[0].remaining,0);assert.equal(g.funds,4200);assert.equal(result.bankruptcy.employeeSeverance.paid,1000);assert.equal(g.isPaused,true);
});

test('no permite bancarrota antes de un deterioro sostenido ni con recuperación previsible',()=>{
 const g=fixture();g.financeState.severeWeeks=7;assert.equal(prepareBankruptcy(g).success,false);
 g.financeState.severeWeeks=8;g.financeState.creditScore=100;g.financeState.loans=[];g.funds=0;
 assert.equal(prepareBankruptcy(g).success,false);
});

test('liquidación parcial respeta el orden de atrasos y conserva principal restante',()=>{
 const g=fixture();g.funds=500;const result=confirmBankruptcy(g,{mode:'spectator'});assert(result.success,result.message);
 assert.equal(g.funds,0);assert.equal(g.financeState.loans[0].arrears,0);assert.equal(g.financeState.loans[0].remaining,800);
 assert.equal(result.bankruptcy.unpaidLoans,800);assert.equal(g.financeState.loans[0].status,'DEFAULTED');
});
