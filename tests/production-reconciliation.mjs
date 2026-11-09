import assert from 'node:assert/strict';
import {game as singleton} from '../src/simulation.js';
import {SaveSystem} from '../src/SaveSystem.js';
class Store{constructor(){this.data=new Map()}get length(){return this.data.size}key(i){return [...this.data.keys()][i]??null}getItem(k){return this.data.get(k)??null}setItem(k,v){this.data.set(k,String(v))}removeItem(k){this.data.delete(k)}}
function run(label,reload){let seed=12345;const orig=Math.random;Math.random=()=>((seed=seed*16807%2147483647)/2147483647);try{
 let g=new singleton.constructor();g.isPaused=false;g.funds=100000;g.financeState.lastBalance=100000;const save=new SaveSystem(new Store());let before=g.funds;
 let start=g.startNewGameProject({platformId:'pc',force:true,publishingContractType:label==='A'?'self_publishing':'publisher_advance'});assert(start.success);let p=start.project;
 const rows=[{week:g.getIndustryWeek(),action:'inicio',before,delta:g.funds-before,after:g.funds,initial:p.devCostTotal,advance:p.offerRevenue}];const snapshots=new Set();
 const roundtrip=()=>{let snapshot=JSON.stringify({funds:g.funds,finance:g.financeState,project:g.currentProject,history:g.gamesHistory},(key,value)=>value instanceof Map?[...value]:value instanceof Set?[...value]:value);save.save(g,{id:'check'});const rngBefore=seed;const next=new singleton.constructor();seed=rngBefore;save.load('check',next);seed=rngBefore;next.isPaused=false;let actual=JSON.stringify({funds:next.funds,finance:next.financeState,project:next.currentProject,history:next.gamesHistory},(key,value)=>value instanceof Map?[...value]:value instanceof Set?[...value]:value);assert.equal(actual,snapshot);g=next;p=g.currentProject;};
 for(let i=0;i<180 && p.stage<4;i++){
 if(reload&&!snapshots.has(p.stage)){snapshots.add(p.stage);roundtrip();}
 before=g.funds;let week=g.getIndustryWeek();g.advanceCalendar();let c=g.lastMonthlyOperatingCosts;let income=g.lastWeeklySalesIncome||0;let expected=income-(c.salaries+c.office+c.utilities+c.network)/4;
 assert.equal(g.funds-before,expected);rows.push({week:week+1,action:'semana',before,delta:expected,after:g.funds,salary:c.salaries/4,office:c.office/4,utilities:c.utilities/4,income,imputed:p.production.history.at(-1)?.salaries||0});
 }
 assert.equal(p.stage,4);if(label==='C')while(g.getIndustryWeek()<p.contractDeadlineWeek+3){before=g.funds;const week=g.getIndustryWeek();g.advanceCalendar();let c=g.lastMonthlyOperatingCosts;let delta=(g.lastWeeklySalesIncome||0)-(c.salaries+c.office+c.utilities+c.network)/4;assert.equal(g.funds-before,delta);rows.push({week:week+1,action:'espera',before,delta,after:g.funds,salary:c.salaries/4,office:c.office/4,utilities:c.utilities/4});}
 if(reload)roundtrip();before=g.funds;const released=g.finishAndReleaseGame();assert(released);assert.equal(g.funds-before,0-(released.contractLatePenalty+released.physicalManufacturingCost));rows.push({week:g.getIndustryWeek(),action:'publicación',before,delta:g.funds-before,after:g.funds,penalty:released.contractLatePenalty,manufacturing:released.physicalManufacturingCost,profit:released.profit});
 if(reload)roundtrip();for(let i=0;i<3;i++){before=g.funds;const week=g.getIndustryWeek();g.advanceCalendar();let c=g.lastMonthlyOperatingCosts;let revenue=g.lastWeeklySalesIncome;let delta=revenue-(c.salaries+c.office+c.utilities+c.network)/4;assert.equal(g.funds-before,delta);rows.push({week:week+1,action:'ventas',before,delta,after:g.funds,salary:c.salaries/4,office:c.office/4,utilities:c.utilities/4,income:revenue,profit:g.gamesHistory[0].profit});}
 const game=g.gamesHistory[0];
 const expectedProfit=(game.upfrontOfferRevenue||0)+game.revenueTotal-game.devCost-game.productionPayrollCost-game.lifetimeServiceCosts-game.contractLatePenalty-game.physicalManufacturingCost-game.marketingCostTotal;
 assert.equal(game.profit,expectedProfit);assert.equal(100000+rows.reduce((sum,row)=>sum+row.delta,0),g.funds);
 return {rows,final:g.funds,profit:game.profit,payroll:game.productionPayrollCost,revenue:game.revenueTotal,advance:game.upfrontOfferRevenue,penalty:game.contractLatePenalty,manufacturing:game.physicalManufacturingCost,finance:g.financeState.weeklyHistory};
 }finally{Math.random=orig}}
for(const label of ['A','B','C']){try{const a=run(label,false),b=run(label,true);assert.deepEqual(b,a);console.log(JSON.stringify({label,ok:true,...a}));}catch(error){console.error(label,error.stack);process.exitCode=1;}}
