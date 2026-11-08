import test from 'node:test';
import assert from 'node:assert/strict';
import {createFinanceState,getFinanceMetrics,updateFinanceWeek,requestLoan,refinanceLoan,getCreditOffer,assessLiquidity} from '../src/financeSystem.js';
function create(cash=75000){return {funds:cash,financeState:createFinanceState(cash),week:0,era:1,employees:[{salary:1200}],ipState:{properties:[]},ipCompanies:[],activeSales:[],getIndustryWeek(){return this.week},getHistoricalYear(){return 1982+Math.floor(this.week/48)},lastWeeklySalesIncome:0};}
const advance=(g,weeks,net=0,income=0)=>{for(let i=0;i<weeks;i++){g.week++;g.funds+=net;g.lastWeeklySalesIncome=income;updateFinanceWeek(g);}};
test('pure liquidity compares obligations, cash and evidence of revenue',()=>{
 const solvent=assessLiquidity({cash:1000,weeklyCosts:500,weeklyIncome:600});const noIncome=assessLiquidity({cash:1000,weeklyCosts:500,weeklyIncome:0});
 assert(solvent.risk<noIncome.risk);assert(solvent.liquidity>=1);
 const debt=assessLiquidity({cash:100000,weeklyCosts:1000,due:200000,debt:300000,missedPayments:3});assert(debt.risk>20);
});
test('one bad week does not move phase, persistent losses progress and recovery takes time',()=>{
 const g=create(100);advance(g,1,-1000);assert.equal(g.financeState.status,'HEALTHY');advance(g,31,-1000);
 assert(['INSOLVENT','SEVERE'].includes(g.financeState.status),g.financeState.status);assert.equal(g.financeState.bankruptcy,null);
 g.funds=1000000;advance(g,1,2000,2000);assert.notEqual(g.financeState.status,'HEALTHY');advance(g,24,2000,2000);assert.equal(g.financeState.status,'HEALTHY');
});
test('loan adjusts real cash, has limited availability and is excluded from operating cash flow',()=>{
 const g=create();const offer=getCreditOffer(g);assert(offer.available);const before=g.funds;
 const loan=requestLoan(g,{amount:5000});assert(loan.success);assert.equal(g.funds,before+5000);
 assert(!requestLoan(g,{amount:5000}).success);advance(g,1,0);assert.equal(g.financeState.weeklyHistory.at(-1).cashFlow,0);
});
test('unpaid installments enter arrears, penalize credit and cannot be financed repeatedly',()=>{
 const g=create();const {loan}=requestLoan(g,{amount:10000});g.funds=0;advance(g,4);
 assert.equal(loan.missedPayments,1);assert(loan.arrears>=loan.installment);assert.equal(g.financeState.creditScore,92);assert(!getCreditOffer(g).available);
 const original=loan.remaining+loan.arrears;advance(g,4);assert(loan.remaining+loan.arrears>original);
});
test('refinancing adds cost without minting cash and has a bounded count',()=>{
 const g=create();const {loan}=requestLoan(g,{amount:10000});const cash=g.funds;
 const prior=loan.remaining;let result=refinanceLoan(g,loan.id);assert(result.success);assert.equal(g.funds,cash);assert(loan.remaining>prior);
 result=refinanceLoan(g,loan.id);assert(result.success);assert(!refinanceLoan(g,loan.id).success);
});
test('fully serviced loan settles without duplicated arrears',()=>{
 const g=create();const {loan}=requestLoan(g,{amount:10000});advance(g,100,0,0);
 assert.equal(loan.status,'PAID');assert.equal(loan.remaining,0);assert.equal(loan.arrears,0);
});
