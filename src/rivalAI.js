/** Autonomous weekly rival decisions. All entities and titles are plain saveable data. */
import { THEMES_DATABASE } from './data/themes_database.js';
import { GENRES_DATABASE } from './data/genres_database.js';
import { getPlatformsByYear } from './data/platformsData.js';
import { TECH_TREE_NODES } from './data/techTreeData.js';
import { registerIP, recordRelease, updateIPSales, getIPBenefits, getIPValue, setIPForSale, transferIP } from './ipSystem.js';
import { assessLiquidity } from './financeSystem.js';

const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const pick=(values,rng)=>values[Math.min(values.length-1,Math.floor(rng()*values.length))];
const nextId=prefix=>`${prefix}_${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`}`;
const addHistory=(co,game,type,details)=>{co.history.push({year:game.getHistoricalYear(),week:game.getIndustryWeek(),type,details});};
const operating=co=>!['BANKRUPT','CLOSED','ACQUISITION'].includes(co.status);
const annualWages=co=>co.employees.reduce((a,e)=>a+(e.salary||0),0)*12;
const reservedCash=co=>Math.max(3000,annualWages(co)*(co.decisionWeights?.reserve ?? .12));
const companyGames=game=>[...game.gamesHistory,...game.ipCompanies.flatMap(c=>c.games||[])];
const ownedIPs=(game,co)=>game.ipState.properties.filter(ip=>ip.ownerId===co.id);
const GENRE_TECH_REQUIREMENTS = Object.freeze({
 tech_3d: 'tech_graphics_early_3d_polygons',
 network_servers: 'tech_net_dedicated_client_server',
 mass_multiplayer: 'tech_net_massive_spatial_sharding'
});

// Unknown requirements fail closed. A saved or imported future technology is
// never usable before its historical year, even when its ID is present.
export function eligibleRivalGenres(company, year) {
 const known = new Set(company.technologies || []);
 const valid = (id, visited = new Set()) => {
  const node = TECH_TREE_NODES.find(item => item.id === id);
  if (!node || node.eraYear > year || !known.has(id) || visited.has(id)) return false;
  const path = new Set(visited); path.add(id);
  return node.requiredNodes.every(parent => valid(parent, path));
 };
 return GENRES_DATABASE.filter(genre => genre.unlockedYear <= year && (genre.requiredTech || []).every(requirement => {
  const id = GENRE_TECH_REQUIREMENTS[requirement];
  return valid(id);
 }));
}

function sellGames(co,game,year) {
 for(const title of co.games) {
  const age=title.weeksOnMarket||0;
  // The same title supplies the chart, corporate revenue and franchise milestones.
  const sales=Math.max(0,Math.floor(title.salesPotential * (age<20 ? .11*Math.exp(-age/7) : .0015)));
  title.weeklySales=sales; title.weeksOnMarket=age+1; title.unitsSoldTotal+=sales;
  const revenue=Math.floor(sales*title.price*(1-title.platformRoyaltyRate));
  co.funds+=revenue; co.totalRevenue+=revenue;
  title.revenueTotal=(title.revenueTotal||0)+revenue;
  if(title.ipId) updateIPSales(game.ipState,title.ipId,title,{year});
 }
}

function updateFinance(co,game) {
 const wages=Math.ceil(co.employees.reduce((sum,e)=>sum+(e.salary||0),0)/4);
 co.salaryExpenses=(co.salaryExpenses||0)+wages;
 co.operatingExpenses=(co.operatingExpenses||0)+wages;
 co.totalExpenses+=wages;
 const paid=Math.min(Math.max(0,co.funds),wages);
 co.funds-=paid;
 co.debt+=(wages-paid);
 if(co.debt>0 && co.funds>reservedCash(co)*2){ const repayment=Math.min(co.debt,Math.floor((co.funds-reservedCash(co)*2)*.25));co.funds-=repayment;co.debt-=repayment; }
 const was=co.status;
 if(co.debt>Math.max(12000,annualWages(co)*.35)) co.status='BANKRUPT';
 else if(co.debt>0 || co.funds<reservedCash(co)*.5) co.status='CRISIS';
 else if(co.funds<reservedCash(co)) co.status='RESTRUCTURING';
 else if(co.funds>annualWages(co)*2) co.status='EXPANDING';
 else co.status='ACTIVE';
 if(was!==co.status) addHistory(co,game,'STATUS',`Estado: ${co.status}`);
 co.profit=co.totalRevenue-co.totalExpenses;
 const ipAssets=ownedIPs(game,co).reduce((sum,ip)=>sum+getIPValue(ip,companyGames(game),game.getHistoricalYear(),game.ipState.settings),0);
 co.valuation=Math.max(0,Math.round(co.funds-co.debt+ipAssets+co.games.reduce((n,g)=>n+Math.max(0,(g.salesPotential||0)-(g.unitsSoldTotal||0))*(g.price||0)*.2,0)));
 co.developmentBudget=Math.max(0,Math.floor((co.funds-reservedCash(co))*.35));
 co.marketingBudget=Math.max(0,Math.floor((co.funds-reservedCash(co))*(co.decisionWeights?.marketing ?? .1)*.2));
 co.investmentCapacity=Math.max(0,co.funds-reservedCash(co));
 const weeklyIncome=co.games.reduce((sum,title)=>sum+(title.weeklySales||0)*(title.price||0)*(1-(title.platformRoyaltyRate||0)),0);
 co.financialHealth=assessLiquidity({cash:co.funds,weeklyIncome,weeklyCosts:wages,debt:co.debt,cashFlow:weeklyIncome-wages});
}

function research(co,game,year,rng){
 co.researchPoints+=(co.employees.reduce((a,e)=>a+(e.tech||0),0)/100);
 if(!co.engines.length && co.technologies.length>=4 && co.researchPoints>=20 && co.funds>=reservedCash(co)+10000){
  co.funds-=10000; co.totalExpenses+=10000; co.researchPoints-=20;
  const engine={id:nextId('rival_engine'),name:`${co.name} Core`,createdYear:year,technologyIds:[...co.technologies]};
  co.engines.push(engine);addHistory(co,game,'ENGINE',`Desarrolló el motor ${engine.name}.`);
 }
 if(game.getIndustryWeek()%8!==0) return;
 const available=TECH_TREE_NODES.filter(n=>n.eraYear<=year && !co.technologies.includes(n.id) && n.requiredNodes.every(id=>co.technologies.includes(id)) && n.researchCost<=co.researchPoints);
 if(!available.length) return;
 available.sort((a,b)=>((b.eraYear-a.eraYear)*(co.decisionWeights?.innovation??.5)) || (a.researchCost-b.researchCost));
 const chosen=available[Math.min(available.length-1,Math.floor(rng()*Math.min(3,available.length)))];
 co.researchPoints-=chosen.researchCost;co.technologies.push(chosen.id);
 addHistory(co,game,'RESEARCH',`Investigó ${chosen.name}`);
}
function workforce(co,game,rng){
 if(game.getIndustryWeek()%12!==0) return;
 const busy=new Set(co.projects.flatMap(p=>p.teamIds));
 const vacant=co.employees.filter(e=>!busy.has(e.id));
 if((co.status==='CRISIS'||co.status==='RESTRUCTURING') && co.employees.length>1 && vacant.length){
  const removed=vacant[vacant.length-1];co.employees=co.employees.filter(e=>e.id!==removed.id);addHistory(co,game,'LAYOFF',`Salida de ${removed.name} por reducción de gastos.`);return;
 }
 if((co.decisionWeights?.expansion??0)>.4 && co.employees.length<24 && co.funds>annualWages(co)*2.8 && rng()<.3){
  const hiringCost=3000;if(co.funds<hiringCost+reservedCash(co))return;
  co.funds-=hiringCost;co.totalExpenses+=hiringCost;
  const employee={id:nextId('rival_employee'),name:`Especialista ${co.employees.length+1}`,role:'Desarrollador',tech:25+Math.floor(rng()*20),design:25+Math.floor(rng()*20),speed:1,salary:1000+Math.floor(rng()*600),energy:100,stamina:100};
  co.employees.push(employee);addHistory(co,game,'HIRE',`Contrató a ${employee.name}.`);
 }
}
function marketIP(co,game,year,rng){
 if(game.getIndustryWeek()%24!==0 || rng()>.35) return;
 const own=ownedIPs(game,co);
 if(co.status==='CRISIS' || co.status==='RESTRUCTURING'){
  const ip=own.find(x=>!x.forSale&&!co.projects.some(p=>p.ipId===x.id));
  if(ip){const price=Math.max(1,getIPValue(ip,companyGames(game),year,game.ipState.settings));setIPForSale(game.ipState,co.id,ip.id,price,{year});addHistory(co,game,'IP_LISTED',`Puso ${ip.name} a la venta por $${price}.`);} return;
 }
 const opportunities=game.ipState.properties.filter(ip=>ip.forSale&&ip.ownerId!==co.id&&Number.isSafeInteger(ip.askingPrice)&&ip.askingPrice>0&&ip.askingPrice<co.funds-reservedCash(co)&&!(ip.ownerId==='player'&&game.currentProject?.ipId===ip.id));
 opportunities.sort((a,b)=>((b.popularity+b.prestige+b.loyalty)/b.askingPrice)-((a.popularity+a.prestige+a.loyalty)/a.askingPrice));
 const ip=opportunities[0];if(!ip)return;
 const seller=game.getIPOwner(ip.ownerId);if(!seller||seller.id!=='player'&&seller.projects?.some(p=>p.ipId===ip.id))return;
 const price=ip.askingPrice;const result=transferIP(game.ipState,ip.id,seller,co,price,{year});
 if(result.success){co.totalExpenses+=price;if(seller.id!=='player') seller.totalRevenue+=price;addHistory(co,game,'IP_BUY',`Compró ${ip.name} por $${price}.`);}
}
function chooseProject(co,game,year,rng) {
 const availableStaff=co.employees.filter(e=>!co.projects.some(p=>p.teamIds.includes(e.id)));
 if(!availableStaff.length || co.projects.length>=Math.max(1,Math.floor(co.employees.length/4)) || co.funds<=reservedCash(co)*1.25) return;
 const weights=co.decisionWeights || {};
 const genres=eligibleRivalGenres(co,year);
 const themes=THEMES_DATABASE.filter(t=>t.unlockedYear<=year);
 const platforms=getPlatformsByYear(year).filter(p=>p.status==='ACTIVE');
 if(!genres.length||!themes.length||!platforms.length)return;
 // Only published games and their observed sales are considered: no access to
 // unreleased player projects or other companies' future plans.
 const published=companyGames(game);
 const genre=genres.map(g=>{
  const releases=published.filter(title=>title.genreId===g.id && (title.releaseYear ?? year)>=year-3);
  const marketSuccess=releases.reduce((sum,title)=>sum+(title.unitsSoldTotal||0),0);
  const ownSuccess=releases.filter(title=>co.games.includes(title)).reduce((sum,title)=>sum+(title.unitsSoldTotal||0),0);
  const observedDemand=Math.min(1.2,Math.log10(1+marketSuccess)/4);
  const pastSuccess=Math.min(.8,Math.log10(1+ownSuccess)/5);
  return {g,score:((co.genreSpecialties||[]).includes(g.id)?2:0)+(game.marketTrend?.genreId===g.id?1.2:0)+observedDemand+pastSuccess+rng()*(1+(weights.risk||.5))};
 }).sort((a,b)=>b.score-a.score)[0].g;
 const theme=themes.map(t=>({t,score:((t.synergies||[]).includes(genre.id)?1.5:0)+(game.marketTrend?.topicId===t.id?1:0)+rng()})).sort((a,b)=>b.score-a.score)[0].t;
 const selectedPlatform=platforms.map(p=>({p,score:p.marketShare*4-(co.ownedDevKits?.includes(p.id)?0:p.devKitCost/Math.max(1,co.funds))})).sort((a,b)=>b.score-a.score)[0].p;
 const kitCost=(co.ownedDevKits||[]).includes(selectedPlatform.id)?0:selectedPlatform.devKitCost;
 const allocation=clamp(.10+(weights.risk||.5)*.18,.1,.32);
 const budget=Math.max(2500,Math.floor((co.funds-reservedCash(co))*allocation));
 const marketing=Math.min(Math.floor(budget*(weights.marketing||.1)),Math.floor(co.funds*.1));
 if(co.funds-budget-marketing-kitCost<reservedCash(co))return;
 const capacity=Math.max(1,Math.floor(co.employees.length/4));
 const teamSize=Math.max(1,Math.min(availableStaff.length,Math.ceil(co.employees.length/capacity)));
 const team=availableStaff.slice(0,teamSize);
 const franchises=ownedIPs(game,co).filter(ip=>!ip.forSale);
 const sequel=franchises.length&&rng()<(weights.franchise??.4) ? franchises.sort((a,b)=>b.popularity-a.popularity)[0] : null;
 const name=sequel ? `${sequel.name} ${sequel.publishedGameIds.length+1}` : `${theme.name}: ${genre.name} ${co.games.length+co.projects.length+1} (${co.name})`;
 co.funds-=budget+marketing+kitCost;co.totalExpenses+=budget+marketing+kitCost;
 co.ownedDevKits=co.ownedDevKits||[];if(!co.ownedDevKits.includes(selectedPlatform.id))co.ownedDevKits.push(selectedPlatform.id);
 const project={id:nextId('rival_project'),name,genre:genre.name,genreId:genre.id,topic:theme.name,topicId:theme.id,platformId:selectedPlatform.id,platform:selectedPlatform.name,platformRoyaltyRate:selectedPlatform.royaltyRate||0,marketShare:selectedPlatform.marketShare,teamIds:team.map(e=>e.id),budget,marketingBudget:marketing,progress:0,totalWeeks:Math.max(10,Math.round(22+budget/8000-team.length-(co.engines.length?2:0))),ipId:sequel?.id||null,ipReleaseType:sequel?'sequel':'original',engineId:co.engines[0]?.id||null,technologies:[...co.technologies],startYear:year};
 if(!sequel && rng()<.55 && co.funds >= reservedCash(co)+(game.ipState.settings.registrationCost||0)){
  const before=co.funds;
  const registration=registerIP(game.ipState,co,{name,originalGenre:genre.id,originalTopic:theme.id,brandIdentity:co.specialization||co.name},{year});
  if(registration.success){project.ipId=registration.ip.id;co.totalExpenses+=before-co.funds;}
 }
 co.projects.push(project);addHistory(co,game,'PROJECT_START',`Inició ${name}.`);
}
function progressProjects(co,game,year,rng){
 const finished=[];
 for(const project of co.projects){
  const team=co.employees.filter(e=>project.teamIds.includes(e.id));
  if(!team.length)continue;
  project.progress+=1/project.totalWeeks;
  if(project.progress<1)continue;
  const skill=team.reduce((a,e)=>a+((e.tech||0)+(e.design||0))/2,0)/team.length;
  const synergy=(THEMES_DATABASE.find(t=>t.id===project.topicId)?.synergies||[]).includes(project.genreId);
  const score=clamp(Math.round((3.2+skill/18+(synergy?.7:0)+(rng()-.5)*2+(co.technologies.length*.06))*10)/10,1,10);
  const ip=project.ipId?game.ipState.properties.find(p=>p.id===project.ipId&&p.ownerId===co.id):null;
  const benefit=getIPBenefits(ip);
  const marketing=1+Math.min(.35,project.marketingBudget/Math.max(1,project.budget));
  const trend=game.marketTrend?.genreId===project.genreId&&game.marketTrend?.topicId===project.topicId?1.35:1;
  const eraFactor=year<1990?85:year<2010?280:950;
  const salesPotential=Math.max(30,Math.floor(Math.pow(score/2.2,3.85)*eraFactor*(project.marketShare+.25)*marketing*trend*benefit.salesMultiplier));
  const title={id:nextId('rival_game'),name:project.name,genre:project.genre,genreId:project.genreId,topic:project.topic,topicId:project.topicId,platform:project.platform,platformId:project.platformId,platformRoyaltyRate:project.platformRoyaltyRate,engineId:project.engineId,score,releaseYear:year,ipId:ip?.id||null,ipReleaseType:project.ipReleaseType,unitsSoldTotal:0,weeklySales:0,weeksOnMarket:0,salesPotential,price:year<1990?12:year<2010?28:55,revenueTotal:0};
  co.games.unshift(title);if(ip)recordRelease(game.ipState,ip.id,title,companyGames(game),{year});
  co.reputation=clamp((co.reputation||50)+(score-5)*1.5,0,100);co.prestige=clamp((co.prestige||50)+(score-5),0,100);
  addHistory(co,game,'GAME_RELEASED',`Publicó ${title.name} con una nota de ${score}.`);finished.push(project.id);
 }
 co.projects=co.projects.filter(p=>!finished.includes(p.id));
}
export function tickRivals(game,rng=Math.random){
 if(!Array.isArray(game.ipCompanies)||!game.ipState)return;
 const year=game.getHistoricalYear();
 for(const co of game.ipCompanies){
  if(co.status==='BANKRUPT'){
   // The catalogue remains on sale during insolvency; production and hiring
   // are suspended while proceeds are used to repay creditors.
   sellGames(co,game,year);
   const repayment=Math.min(co.debt,co.funds);co.funds-=repayment;co.debt-=repayment;
   if(co.debt===0 && co.funds>=reservedCash(co)*.5){co.status='RESTRUCTURING';addHistory(co,game,'STATUS','Comienza una reestructuración tras pagar sus deudas.');}
   continue;
  }
  if(!operating(co))continue;
  sellGames(co,game,year);updateFinance(co,game);if(!operating(co))continue;
  research(co,game,year,rng);workforce(co,game,rng);progressProjects(co,game,year,rng);marketIP(co,game,year,rng);
  if(game.getIndustryWeek()%4===0)chooseProject(co,game,year,rng);
 }
}
