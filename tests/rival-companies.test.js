import test from 'node:test';
import assert from 'node:assert/strict';
import {generateRivalCompanies, RIVAL_PROFILES} from '../src/rivalCompanies.js';
import {TECH_TREE_NODES} from '../src/data/techTreeData.js';

test('industria configurable crea empresas persistibles con identidades y recursos propios', () => {
    const rivals = generateRivalCompanies({count:10,year:1982,random:()=>.5});
    assert.equal(rivals.length,10);
    assert.equal(new Set(rivals.map(r=>r.id)).size,10);
    assert.equal(new Set(rivals.map(r=>r.name)).size,10);
    assert.deepEqual(rivals.slice(0,5).map(r=>r.profile),Object.keys(RIVAL_PROFILES));
    for (const rival of rivals) {
        assert(Number.isFinite(rival.funds) && rival.funds>0);
        assert(rival.employees.length>=RIVAL_PROFILES[rival.profile].minEmployees);
        assert(rival.employees.every(e=>e.id && e.salary>0 && e.tech>0 && e.design>0));
        assert(rival.technologies.every(id=>TECH_TREE_NODES.some(n=>n.id===id && n.eraYear<=1982 && n.researchCost===0)));
        assert.equal(rival.games.length,0); assert.equal(rival.projects.length,0);
        assert(rival.foundedYear<=1982);
    }
    assert.deepEqual(JSON.parse(JSON.stringify(rivals)),rivals);
});

test('perfiles cambian tamaño y comportamiento y límites de configuración se validan', () => {
    const r = generateRivalCompanies({count:5,year:2000,random:()=>.5});
    assert(r[2].funds>r[0].funds && r[2].employees.length>r[0].employees.length);
    assert(r[3].decisionWeights.innovation>r[4].decisionWeights.innovation);
    assert(r[4].decisionWeights.reserve>r[3].decisionWeights.reserve);
    assert.equal(generateRivalCompanies({count:0}).length,0);
    assert.throws(()=>generateRivalCompanies({count:-1}),RangeError);
    assert.throws(()=>generateRivalCompanies({count:1,year:0}),TypeError);
});
