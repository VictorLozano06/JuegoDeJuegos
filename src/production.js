export const AREAS = {
  1: { engine: 'Motor y tecnología', gameplay: 'Jugabilidad', story: 'Historia y narrativa' },
  2: { graphics: 'Gráficos', sound: 'Sonido', world: 'Mundo y contenido' },
  3: { optimization: 'Optimización', bugs: 'Corrección de errores', refinement: 'Refinamiento' }
};

export function normalize(values, keys) {
  const w = keys.map(k => Math.max(0, Number(values?.[k]) || 0));
  const total = w.reduce((a,b) => a+b,0);
  const exact = w.map(n => total ? n / total * 100 : 100 / keys.length);
  const result = exact.map(Math.floor);
  const order = exact.map((n,i) => ({i, fraction:n-result[i]})).sort((a,b)=>b.fraction-a.fraction);
  const missing=100-result.reduce((a,b)=>a+b,0);
  for (let i=0; i<missing; i++) result[order[i].i]++;
  return Object.fromEntries(keys.map((k,i)=>[k,result[i]]));
}

export function redistribute(values, key, value) {
  const keys=Object.keys(values); if (!keys.includes(key)) return values;
  const chosen=Math.max(0,Math.min(100,Math.round(Number(value)||0)));
  const rest=keys.filter(k=>k!==key), proportions=normalize(values,rest);
  const exact=rest.map(k=>proportions[k]*(100-chosen)/100), parts=exact.map(Math.floor);
  const remainder=100-chosen-parts.reduce((a,b)=>a+b,0);
  exact.map((n,i)=>({i,f:n-parts[i]})).sort((a,b)=>b.f-a.f).slice(0,remainder).forEach(x=>parts[x.i]++);
  return Object.fromEntries(keys.map(k=>[k,k===key?chosen:parts[rest.indexOf(k)]]));
}

export function ensureProduction(p) {
  if (!p || p.production?.version===1) return p?.production;
  const oldStage=p.stage||1, oldProgress=Math.max(0,Math.min(100,Number(p.overallProgress)||0));
  const defaults={1:p.sliders?.stage1,2:{graphics:p.sliders?.stage3?.graphics,sound:p.sliders?.stage3?.sound,world:p.sliders?.stage3?.worldDesign},3:{optimization:34,bugs:33,refinement:33}};
  const allocations=Object.fromEntries(Object.entries(AREAS).map(([n,areas])=>[n,normalize(defaults[n],Object.keys(areas))]));
  const work=Object.fromEntries(Object.values(AREAS).flatMap(a=>Object.keys(a)).map(k=>[k,0]));
  const phase=oldStage===4 ? 4 : Math.min(3,Math.floor(oldProgress/33.3334)+1);
  p.production={version:1,allocations,work,history:[],phaseHistory:[],weeks:0,legacyProgress:oldProgress,legacy:true};
  p.stage=phase; p.stageProgress=oldStage===4 ? (Number(p.stageProgress)||0) : Math.max(0,Math.min(99,oldProgress*3-(phase-1)*100));
  p.overallProgress=oldProgress;
  return p.production;
}

export function createProduction(p) { const result=ensureProduction(p); result.legacy=false; return result; }

export function workQuality(p) {
  const prod=ensureProduction(p); if (!prod || prod.legacy && !prod.weeks) return 0.8;
  const work=prod.work, genre=p.genre||{};
  const weights={
    engine:genre.idealStage1?.engine||.7,gameplay:genre.idealStage1?.gameplay||.7,story:genre.idealStage1?.story||.7,
    dialogues:genre.idealStage2?.dialogues||.7,levelDesign:genre.idealStage2?.levelDesign||.7,ai:genre.idealStage2?.ai||.7,
    worldDesign:genre.idealStage3?.worldDesign||.7,graphics:genre.idealStage3?.graphics||.7,sound:genre.idealStage3?.sound||.7,
    designUI:genre.idealStage3?.designUI||.7,
    world:genre.idealStage3?.worldDesign||.7,optimization:.6,bugs:.6,refinement:.6
  };
  let sum=0,total=0; for (const [k,w] of Object.entries(weights)) { if (work[k] !== undefined) { sum+=Math.min(1.2,(work[k]||0)/25)*w;total+=w; } }
  return total > 0 ? Math.min(1.2,sum/total + (prod.legacy ? 0.55 : 0)) : 1.0;
}
