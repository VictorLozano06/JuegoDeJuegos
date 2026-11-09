import test from 'node:test';
import assert from 'node:assert/strict';
import { normalize, redistribute, ensureProduction } from '../src/production.js';
import { game as singleton } from '../src/simulation.js';

test('las distribuciones siempre suman 100 y permiten redistribuir', () => {
 for(let i=0;i<=100;i++){const v=redistribute({a:34,b:33,c:33},'a',i);assert.equal(v.a,i);assert.equal(Object.values(v).reduce((a,b)=>a+b,0),100);}
 assert.equal(Object.values(normalize({},['a','b','c'])).reduce((a,b)=>a+b,0),100);
});
test('la migración conserva progreso y es idempotente',()=>{
 const p={stage:4,stageProgress:20,overallProgress:85,techPoints:100,designPoints:80,sliders:{stage1:{engine:.7,gameplay:.8,story:.6}}};
 const data=ensureProduction(p);assert.equal(p.overallProgress,85);assert.equal(p.stage,4);assert.equal(p.techPoints,100);assert.equal(ensureProduction(p),data);
});
test('el calendario produce trabajo y puntos una vez por semana',()=>{
 const game=new singleton.constructor();game.isPaused=false;
 assert.equal(game.startNewGameProject({name:'Prueba',platformId:'pc',force:true}).success,true);
 const p=game.currentProject, before=p.techPoints+p.designPoints;
 game.advanceCalendar();assert.equal(p.production.weeks,1);assert(p.techPoints+p.designPoints>before);assert(Object.values(p.production.work).some(n=>n>0));
});
test('el proyecto atraviesa las tres fases y queda listo sin duplicar semanas',()=>{
 const game=new singleton.constructor();game.isPaused=false;game.funds=1e9;
 assert.equal(game.startNewGameProject({name:'Proyecto',platformId:'pc',force:true}).success,true);
 const p=game.currentProject;
 for(let i=0;i<150 && p.stage<4;i++) game.advanceCalendar();
 assert.equal(p.stage,4);assert.equal(p.production.phaseHistory.length,3);assert.equal(p.overallProgress,100);
 const weeks=p.production.weeks;game.advanceCalendar();assert.equal(p.production.weeks,weeks);
});
test('el coste imputado coincide con nóminas y no añade otro cargo',()=>{
 const game=new singleton.constructor();game.isPaused=false;game.funds=1e8;game.startNewGameProject({platformId:'pc',force:true});
 const p=game.currentProject;const salary=game.employees.reduce((a,e)=>a+e.salary,0)/4;
 game.advanceCalendar();assert.equal(p.production.costs.payroll,salary);assert.equal(p.production.history[0].salaries,salary);
 assert.equal(p.production.lastContributions.length,game.employees.length);
 for(const [area,total] of Object.entries(p.production.lastAreaWork)) assert(Math.abs(p.production.lastContributions.reduce((sum,e)=>sum+(e.areas[area]||0),0)-total)<1e-9);
});
import { SaveSystem } from '../src/SaveSystem.js';
class Store { constructor(){this.data=new Map()} get length(){return this.data.size} key(i){return [...this.data.keys()][i]??null} getItem(k){return this.data.get(k)??null} setItem(k,v){this.data.set(k,String(v))} removeItem(k){this.data.delete(k)} }
test('el historial conserva repartos semanales distintos tras guardar y cargar',()=>{
 const game=new singleton.constructor();game.isPaused=false;game.funds=1e8;game.startNewGameProject({platformId:'pc',force:true});
 while(game.currentProject.stage<2)game.advanceCalendar();
 const project=game.currentProject;game.advanceCalendar();const first=structuredClone(project.production.history.at(-1).allocation);
 game.updateProductionAllocation('graphics',60);game.advanceCalendar();const second=structuredClone(project.production.history.at(-1).allocation);
 assert.notDeepEqual(first,second);game.updateProductionAllocation('graphics',10);
 const saves=new SaveSystem(new Store());saves.save(game,{id:'history'});const loaded=new singleton.constructor();saves.load('history',loaded);
 assert.deepEqual(loaded.currentProject.production.history.slice(-2).map(entry=>entry.allocation),[first,second]);
});
for (const stage of [1,2,3,4]) test(`guardar y cargar fase ${stage} conserva el proyecto`,()=>{
 const game=new singleton.constructor();game.isPaused=false;game.funds=1e8;
 game.startNewGameProject({platformId:'pc',force:true,publishingContractType:'publisher_advance'});
 const p=game.currentProject; for(let i=0;i<150 && p.stage<stage;i++)game.advanceCalendar();
 assert.equal(p.stage,stage);if(stage<4)game.updateProductionAllocation(Object.keys(p.production.allocations[stage])[0],55);
 const before=JSON.parse(JSON.stringify({production:p.production,stage:p.stage,progress:p.overallProgress,tech:p.techPoints,design:p.designPoints,bugs:p.bugs,debt:p.techDebtModel.rawDebt,contract:p.publishingContract,funds:game.funds}));
 const saves=new SaveSystem(new Store());saves.save(game,{id:'test'});const loaded=new singleton.constructor();saves.load('test',loaded);
 const q=loaded.currentProject;const after=JSON.parse(JSON.stringify({production:q.production,stage:q.stage,progress:q.overallProgress,tech:q.techPoints,design:q.designPoints,bugs:q.bugs,debt:q.techDebtModel.rawDebt,contract:q.publishingContract,funds:loaded.funds}));
 assert.deepEqual(after,before);
});
test('el publisher no aplica 48 semanas de retraso ficticio',()=>{
 const game=new singleton.constructor();game.isPaused=false;game.funds=1e8;game.startNewGameProject({platformId:'pc',force:true,publishingContractType:'publisher_advance'});
 const p=game.currentProject;p.stage=4;p.overallProgress=100;const result=game.finishAndReleaseGame();assert.equal(result.contractLateWeeks,0);assert.equal(result.contractLatePenalty,0);
});
test('anticipo no se repite al cargar y el retraso se cobra una vez al publicar',()=>{
 const game=new singleton.constructor();game.isPaused=false;game.funds=1e8;
 const before=game.funds;const result=game.startNewGameProject({platformId:'pc',force:true,publishingContractType:'publisher_advance'});assert(result.success);
 const p=game.currentProject;assert.equal(game.funds,before-p.devCostTotal+p.offerRevenue);
 p.contractDeadlineWeek=game.getIndustryWeek()-3;p.stage=4;p.overallProgress=100;
 const storage=new Store(),saves=new SaveSystem(storage);saves.save(game,{id:'late'});const loaded=new singleton.constructor();saves.load('late',loaded);const funds=loaded.funds;saves.load('late',loaded);assert.equal(loaded.funds,funds);
 const released=loaded.finishAndReleaseGame();assert.equal(released.contractLateWeeks,3);assert.equal(released.contractLatePenalty,Math.min(p.contractLatePenaltyCap,p.contractLatePenaltyPerWeek*3));assert.equal(loaded.finishAndReleaseGame(),null);
});
for (const stage of [1,2,3,4]) test(`migración histórica fase ${stage} conserva datos sin generar trabajo ni costes`,()=>{
 const p={stage,stageProgress:25,overallProgress:stage===4?100:(stage-1)*33+8,techPoints:19,designPoints:13,bugs:7,devCostTotal:5000,contractDeadlineWeek:55,assignedEmployees:['uno'],sliders:{stage1:{engine:.8,gameplay:.4,story:.3}}};
 const orig=structuredClone(p);const prod=ensureProduction(p);assert.equal(p.overallProgress,orig.overallProgress);assert.equal(p.techPoints,orig.techPoints);assert.equal(p.devCostTotal,5000);assert.deepEqual(p.assignedEmployees,['uno']);assert.equal(p.contractDeadlineWeek,55);assert.equal(prod.weeks,0);assert.equal(Object.values(prod.work).reduce((a,b)=>a+b,0),0);assert.equal(prod.history.length,0);if(stage===4)assert.equal(p.stage,4);const copy=structuredClone(p);ensureProduction(p);assert.deepEqual(p,copy);
});
test('especialización, energía, moral, estrés y tecnología afectan al trabajo semanal',()=>{
 const run=(mutate)=>{const g=new singleton.constructor();g.isPaused=false;g.funds=1e8;g.startNewGameProject({platformId:'pc',force:true});mutate(g,g.currentProject);const old=Math.random;Math.random=()=>.99;try{g.advanceCalendar();return g.currentProject.production.lastAreaWork.engine}finally{Math.random=old}};
 const base=run(()=>{});assert(run(g=>{g.employees[0].role='Programador';g.employees[0].tech=75})>base);
 assert(run(g=>{g.employees[0].energy=20;g.employees[0].stamina=20})<base);
 assert(run(g=>{g.employees[0].morale=20})<base);assert(run(g=>{g.employees[0].stress=90})<base);
 assert(run((g,p)=>{p.historicalTechIds=['tech_code_pure_asm']})>base);
 assert(run((g,p)=>{p.historicalIncompatibility={multiplier:2}})<base);
});
test('contrato progresa por calendario real y aplica retraso al publicar',()=>{
 const g=new singleton.constructor();g.isPaused=false;g.funds=1e8;g.startNewGameProject({platformId:'pc',force:true,publishingContractType:'publisher_advance'});
 let p=g.currentProject;const deadline=p.contractDeadlineWeek;while(g.getIndustryWeek()<=deadline+2)g.advanceCalendar();
 assert.equal(g.getIndustryWeek()-deadline,3);assert.equal(p.stage,4);
 const storage=new Store(),saves=new SaveSystem(storage);saves.save(g,{id:'contrato'});const loaded=new singleton.constructor();saves.load('contrato',loaded);const balance=loaded.funds;const out=loaded.finishAndReleaseGame();
 assert.equal(out.contractLateWeeks,3);assert.equal(out.contractLatePenalty,Math.min(p.contractLatePenaltyCap,3*p.contractLatePenaltyPerWeek));assert(loaded.funds<=balance-out.contractLatePenalty);assert.equal(loaded.finishAndReleaseGame(),null);
});
for (const phase of [1,2,3]) test(`cambiar barras durante fase ${phase} conserva trabajo e historial tras carga`,()=>{
 let g=new singleton.constructor();g.isPaused=false;g.funds=1e8;assert(g.startNewGameProject({platformId:'pc',force:true}).success);
 while(g.currentProject.stage<phase)g.advanceCalendar();let p=g.currentProject;const keys=Object.keys(p.production.allocations[phase]);
 for(let i=0;i<2&&p.stage===phase;i++)g.advanceCalendar();assert.equal(p.stage,phase);
 const work={...p.production.work}, last=structuredClone(p.production.history.at(-1));g.updateProductionAllocation(keys[0],100);
 assert.deepEqual(p.production.work,work);assert.deepEqual(p.production.history.at(-1),last);assert.equal(Object.values(p.production.allocations[phase]).reduce((a,b)=>a+b,0),100);
 g.advanceCalendar();assert(p.production.work[keys[0]]>=work[keys[0]]);for(const key of keys.slice(1))assert.equal(p.production.work[key],work[key]);assert.deepEqual(p.production.history.at(-1).allocation,p.production.allocations[phase]);
 const store=new Store(),saves=new SaveSystem(store);saves.save(g,{id:'save'});const snapshot=structuredClone(p.production);const loaded=new singleton.constructor();saves.load('save',loaded);assert.deepEqual(loaded.currentProject.production,snapshot);
});
test('investigación histórica rechaza fecha, requisitos y RP sin gastar',()=>{
 const g=new singleton.constructor();g.isPaused=false;const rp=g.researchPoints, funds=g.funds;
 assert.equal(g.startTechResearch('tech_graphics_2d_sprites').success,false);assert.equal(g.researchPoints,rp);
 assert.equal(g.startTechResearch('tech_graphics_mode7').success,false);assert.equal(g.researchPoints,rp);
 const project=g.startNewGameProject({platformId:'pc',historicalTechIds:['tech_graphics_2d_sprites'],force:true});assert.equal(project.success,false);assert.equal(g.funds,funds);
 g.year=3;g.researchPoints=0;assert.equal(g.startTechResearch('tech_graphics_2d_sprites').success,false);assert.equal(g.researchPoints,0);
});
test('selección histórica básica conserva identificadores tras guardar y cargar',()=>{
 const g=new singleton.constructor();g.isPaused=false;const id='tech_graphics_text_ascii';assert(g.techTreeManager.isUnlocked(id));
 assert(g.startNewGameProject({platformId:'pc',historicalTechIds:[id],force:true}).success);const save=new SaveSystem(new Store());save.save(g,{id:'tech'});const copy=new singleton.constructor();save.load('tech',copy);assert(copy.techTreeManager.isUnlocked(id));assert(copy.currentProject.historicalTechIds.includes(id));
});
test('nómina del proyecto se imputa sin segundo cargo de caja',()=>{
 const g=new singleton.constructor();g.isPaused=false;g.funds=100000;assert(g.startNewGameProject({platformId:'pc',force:true}).success);
 const before=g.funds;g.advanceCalendar();const cost=g.lastMonthlyOperatingCosts;const weekly=(cost.salaries+cost.office+cost.utilities+cost.network)/4;
 assert.equal(g.funds,before-weekly+g.lastWeeklySalesIncome);assert.equal(g.currentProject.production.costs.payroll,cost.salaries/4);
});
test('investigación de sprites en 1983 se paga, completa y permite selección persistente',()=>{
 const g=new singleton.constructor();g.isPaused=false;g.funds=1e8;while(g.getHistoricalYear()<1983)g.advanceCalendar();
 const id='tech_graphics_2d_sprites',before=g.researchPoints;const research=g.startTechResearch(id);assert.equal(research.success,true);assert.equal(g.researchPoints,before-15);
 while(g.activeResearch)g.advanceCalendar();assert(g.techTreeManager.isUnlocked(id));
 const project=g.startNewGameProject({platformId:'pc',historicalTechIds:[id],force:true});assert.equal(project.success,true,project.message);assert(project.project.historicalTechIds.includes(id));
 const saves=new SaveSystem(new Store());saves.save(g,{id:'researched'});const loaded=new singleton.constructor();saves.load('researched',loaded);assert(loaded.techTreeManager.isUnlocked(id));assert(loaded.currentProject.historicalTechIds.includes(id));
});
test('progresión histórica investiga parallax y selecciona la cadena en 1986',()=>{
 const g=new singleton.constructor();g.isPaused=false;g.funds=1e8;while(g.getHistoricalYear()<1983)g.advanceCalendar();
 assert(g.startTechResearch('tech_graphics_2d_sprites').success);while(g.activeResearch)g.advanceCalendar();
 const before=g.researchPoints;assert.equal(g.startTechResearch('tech_graphics_parallax_scroll').success,false);assert.equal(g.researchPoints,before);
 while(g.getHistoricalYear()<1986)g.advanceCalendar();const rp=g.researchPoints;const started=g.startTechResearch('tech_graphics_parallax_scroll');assert.equal(started.success,true,started.message);assert.equal(g.researchPoints,rp-25);while(g.activeResearch)g.advanceCalendar();
 const result=g.startNewGameProject({platformId:'pc',force:true,historicalTechIds:['tech_graphics_text_ascii','tech_graphics_2d_sprites','tech_graphics_parallax_scroll']});assert.equal(result.success,true,result.message);
 const saves=new SaveSystem(new Store());saves.save(g,{id:'advanced'});const loaded=new singleton.constructor();saves.load('advanced',loaded);assert(loaded.techTreeManager.isUnlocked('tech_graphics_parallax_scroll'));assert(loaded.currentProject.historicalTechIds.includes('tech_graphics_parallax_scroll'));
});
test('parallax en 1986 exige sprites antes de investigar y seleccionar',()=>{
 const g=new singleton.constructor();g.isPaused=false;g.funds=1e8;while(g.getHistoricalYear()<1986)g.advanceCalendar();
 const id='tech_graphics_parallax_scroll',rp=g.researchPoints,funds=g.funds,state=g.techTreeManager.getNodeState(id,1986);
 assert.equal(state.isPrereqLock,true);assert(state.missingPrereqs.includes('tech_graphics_2d_sprites'));
 assert.equal(g.startTechResearch(id).success,false);assert.equal(g.researchPoints,rp);assert.equal(g.techTreeManager.isUnlocked(id),false);
 assert.equal(g.startNewGameProject({platformId:'pc',force:true,historicalTechIds:[id]}).success,false);assert.equal(g.funds,funds);
 assert(g.startTechResearch('tech_graphics_2d_sprites').success);while(g.activeResearch)g.advanceCalendar();assert(g.startTechResearch(id).success);while(g.activeResearch)g.advanceCalendar();
 const saves=new SaveSystem(new Store());saves.save(g,{id:'prereq'});const restored=new singleton.constructor();saves.load('prereq',restored);assert(restored.techTreeManager.isUnlocked(id));
});
test('rentabilidad analítica incluye nóminas sin descontarlas otra vez de caja',()=>{
 const g=new singleton.constructor();g.isPaused=false;g.funds=100000;assert(g.startNewGameProject({platformId:'pc',force:true,publishingContractType:'publisher_advance'}).success);const p=g.currentProject;
 for(let i=0;i<5;i++)g.advanceCalendar();const payroll=p.production.costs.payroll;const before=g.funds;const game=g.finishAndReleaseGame();
 assert.equal(game.productionPayrollCost,payroll);assert.equal(game.productionCostHistory.length,5);assert.equal(g.funds,before-game.contractLatePenalty-game.physicalManufacturingCost);
 assert.equal(game.profit,game.upfrontOfferRevenue-game.devCost-payroll-game.contractLatePenalty-game.physicalManufacturingCost-game.marketingCostTotal);
 g.advanceCalendar();assert.equal(game.profit,game.upfrontOfferRevenue+game.revenueTotal-game.devCost-payroll-game.lifetimeServiceCosts-game.contractLatePenalty-game.physicalManufacturingCost-game.marketingCostTotal);
 const saves=new SaveSystem(new Store());saves.save(g,{id:'profit'});const loaded=new singleton.constructor();saves.load('profit',loaded);const restored=loaded.gamesHistory.find(x=>x.id===game.id);assert.equal(restored.profit,game.profit);assert.equal(restored.productionPayrollCost,payroll);
});
test('proyecto migrado identifica nóminas históricas desconocidas sin inventarlas',()=>{
 const g=new singleton.constructor();g.isPaused=false;g.funds=1e8;g.startNewGameProject({platformId:'pc',force:true});delete g.currentProject.production;const out=g.finishAndReleaseGame();assert.equal(out.productionPayrollCost,0);assert.equal(out.productionCostCompleteness,'incomplete');
});
