import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRivalCompanies } from '../src/rivalCompanies.js';
import { tickRivals } from '../src/rivalAI.js';
import { createIPState, registerIP, setIPForSale } from '../src/ipSystem.js';
const random = () => {let n=37; return () => ((n=(n*16807)%2147483647)/2147483647)};
function createGame() { const rng=random(); const game={ipCompanies:generateRivalCompanies({count:5,year:1982,random:rng}),ipState:createIPState(),gamesHistory:[],funds:100000,companyName:'Jugador',marketTrend:{genreId:'action',topicId:'medieval'},week:0,getHistoricalYear(){return 1982+Math.floor(this.week/48)},getIndustryWeek(){return this.week},getIPOwner(id){if(id==='player'){const game=this;return {id:'player',name:game.companyName,get funds(){return game.funds},set funds(v){game.funds=v}}} return this.ipCompanies.find(c=>c.id===id)}}; return {game,rng}; }
test('rivales generan proyectos, lanzamientos y ventas sin crear dinero fuera de las ventas',()=>{const {game,rng}=createGame();for(let w=1;w<=150;w++){game.week=w;tickRivals(game,rng)} const companies=game.ipCompanies;assert(companies.some(c=>c.games.length));assert(companies.some(c=>c.totalRevenue>0));for(const c of companies){assert(c.funds>=0);assert(c.employees.length>0);assert(c.totalExpenses>0);for(const g of c.games){assert(g.releaseYear>=c.foundedYear);assert(g.unitsSoldTotal>=0);if(g.ipId){const ip=game.ipState.properties.find(p=>p.id===g.ipId);assert(ip.publishedGameIds.includes(g.id));}}}});
test('IP de jugador en proyecto activo nunca se adquiere',()=>{const {game,rng}=createGame();const result=registerIP(game.ipState,game.getIPOwner('player'),{name:'Franquicia de prueba'},{year:1982});setIPForSale(game.ipState,'player',result.ip.id,100,{year:1982});game.currentProject={ipId:result.ip.id};for(let w=1;w<120;w++){game.week=w;tickRivals(game,rng)}assert.equal(result.ip.ownerId,'player');});

test('simulación de 240 semanas conserva balances, equipos, tecnologías y años válidos',async()=>{
 const {TECH_TREE_NODES}=await import('../src/data/techTreeData.js'); const {getPlatformsByYear}=await import('../src/data/platformsData.js');
 const {game,rng}=createGame(); const original=new Map(game.ipCompanies.map(c=>[c.id,c.funds]));
 for(let w=1;w<=240;w++){game.week=w;tickRivals(game,rng);}
 for(const c of game.ipCompanies){
  assert.equal(c.funds,original.get(c.id)+c.totalRevenue-c.totalExpenses+c.debt,`balance ${c.name}`);
  for(const tech of c.technologies){const node=TECH_TREE_NODES.find(n=>n.id===tech);assert(node);assert(node.eraYear<=game.getHistoricalYear());for(const dep of node.requiredNodes)assert(c.technologies.includes(dep));}
  for(const p of c.projects){assert(p.teamIds.every(id=>c.employees.some(e=>e.id===id)));assert(p.technologies.every(id=>c.technologies.includes(id)));}
  for(const title of c.games){const available=getPlatformsByYear(title.releaseYear);assert(available.some(p=>p.id===title.platformId&&p.status==='ACTIVE'));}
 }
});

test('una IP rival con proyecto activo no se vende automáticamente',()=>{
 const {game,rng}=createGame(); const seller=game.ipCompanies[0]; const buyer=game.ipCompanies[2];
 const ip=registerIP(game.ipState,seller,{name:'Saga protegida'},{year:1982}).ip;
 setIPForSale(game.ipState,seller.id,ip.id,10,{year:1982});seller.projects.push({id:'ongoing',name:'En curso',teamIds:[],ipId:ip.id});
 for(let w=1;w<=72;w++){game.week=w;tickRivals(game,rng);}
 assert.equal(ip.ownerId,seller.id);assert(buyer.id!==seller.id);
});

test('bancarrota mantiene ventas residuales y permite reestructuración tras pagar deuda',()=>{
 const {game,rng}=createGame();const company=game.ipCompanies[0];
 company.status='BANKRUPT';company.funds=0;company.debt=100;
 company.games.push({id:'residual',name:'Catálogo',genreId:'action',releaseYear:1982,unitsSoldTotal:0,weeklySales:0,weeksOnMarket:21,salesPotential:10000000,price:12,platformRoyaltyRate:0,ipId:null});
 game.week=1;tickRivals(game,rng);
 assert(company.games[0].unitsSoldTotal>0);assert.equal(company.debt,0);assert(company.funds>0);assert.equal(company.status,'RESTRUCTURING');
});

test('empresas grandes ejecutan proyectos paralelos sin asignar una persona dos veces',()=>{
 const {game,rng}=createGame(); const company=game.ipCompanies.find(c=>c.profile==='large'); let maxProjects=0;
 for(let w=1;w<=70;w++){game.week=w;tickRivals(game,rng);maxProjects=Math.max(maxProjects,company.projects.length);const assigned=company.projects.flatMap(p=>p.teamIds);assert.equal(new Set(assigned).size,assigned.length);}
 assert(maxProjects>=2,`Máximo de proyectos simultáneos: ${maxProjects}`);
});

test('géneros tecnológicos exigen árbol completo y se habilitan cuando se investiga', async()=>{
 const {eligibleRivalGenres}=await import('../src/rivalAI.js');const {TECH_TREE_NODES}=await import('../src/data/techTreeData.js');
 const company={technologies:[]};const available=(id,year)=>eligibleRivalGenres(company,year).some(g=>g.id===id);
 assert(!available('shooter',1995));assert(!available('mmo',2005));assert(!available('battle_royale',2025));
 company.technologies=['tech_graphics_early_3d_polygons'];assert(!available('shooter',1995),'nodo sin prerrequisitos');
 company.technologies=TECH_TREE_NODES.filter(n=>n.eraYear<=2025).map(n=>n.id);
 assert(!available('shooter',1992));assert(available('shooter',1995));assert(!available('mmo',2002));assert(available('mmo',2005));assert(!available('battle_royale',2019));assert(available('battle_royale',2025));
});
