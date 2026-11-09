import { game as singleton } from '../src/simulation.js';
const cases=[['action','medieval'],['rpg','space'],['strategy','sports']];
for(const [genreId,topicId] of cases) for(const profile of ['generalista','especialista','junior','senior']) {
 let seed=12345;const old=Math.random;Math.random=()=>((seed=seed*16807%2147483647)/2147483647);
 try {
 const g=new singleton.constructor();g.isPaused=false;g.funds=1e9;g.rivalCompanies=[];
 const result=g.startNewGameProject({name:'Simulación',platformId:'pc',genreId,topicId,force:true});if(!result.success)throw Error(result.message);
 const p=g.currentProject;const e=g.employees[0];if(profile==='especialista'){e.role='Programador Senior';e.tech=65;e.design=30;}if(profile==='junior'){e.role='Generalista Junior';e.tech=15;e.design=15;e.speed=.8;}if(profile==='senior'){e.role='Generalista Senior';e.tech=65;e.design=65;e.speed=1.2;}
 for(let i=0;i<240 && p.stage<4;i++)g.advanceCalendar();
 if(p.stage!==4){console.log(JSON.stringify({genreId,topicId,profile,unfinished:true,weeks:p.production.weeks}));continue;}
 const history=p.production.history;const counts=[1,2,3].map(n=>history.filter(h=>h.stage===n).length);const debt=p.techDebtModel.rawDebt;
 const published=g.finishAndReleaseGame();
 console.log(JSON.stringify({genreId,topicId,profile,weeks:p.production.weeks,phases:counts,costInitial:p.devCostTotal,payroll:p.production.costs.payroll,work:p.production.work,design:p.designPoints,tech:p.techPoints,bugs:p.bugs,debt,score:published.score}));
 }finally{Math.random=old}
}
