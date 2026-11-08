/**
 * Persistable rival-company data. Numeric fields are game parameters, not real
 * company finances. The simulation mutates these actual wallets and employees;
 * no projections or generated chart entries count as money or released games.
 */
import { TECH_TREE_NODES } from './data/techTreeData.js';

export const RIVAL_COMPANY_DEFAULTS = Object.freeze({
    initialCount: 5,
    maxInitialCount: 100,
    startResearchPoints: 20,
    minFoundationYear: 1975
});

export const RIVAL_PROFILES = Object.freeze({
    indie: Object.freeze({ label: 'Independiente', minEmployees: 3, maxEmployees: 5, minFunds: 75000, maxFunds: 135000,
        risk: .68, innovation: .55, franchise: .32, marketing: .16, reserve: .40, expansion: .38, specialties: ['action','adventure','casual'] }),
    medium: Object.freeze({ label: 'Mediana', minEmployees: 7, maxEmployees: 11, minFunds: 320000, maxFunds: 540000,
        risk: .48, innovation: .48, franchise: .55, marketing: .25, reserve: .42, expansion: .54, specialties: ['strategy','simulation','rpg'] }),
    large: Object.freeze({ label: 'Gran compañía', minEmployees: 17, maxEmployees: 24, minFunds: 1200000, maxFunds: 2000000,
        risk: .48, innovation: .48, franchise: .72, marketing: .40, reserve: .44, expansion: .76, specialties: ['action','rpg','simulation'] }),
    experimental: Object.freeze({ label: 'Experimental', minEmployees: 5, maxEmployees: 8, minFunds: 190000, maxFunds: 330000,
        risk: .86, innovation: .90, franchise: .18, marketing: .20, reserve: .24, expansion: .57, specialties: ['strategy','adventure','simulation'] }),
    conservative: Object.freeze({ label: 'Conservadora', minEmployees: 6, maxEmployees: 10, minFunds: 270000, maxFunds: 470000,
        risk: .23, innovation: .18, franchise: .85, marketing: .18, reserve: .66, expansion: .30, specialties: ['casual','action','adventure'] })
});

const PLACES = [
    {country:'España',headquarters:'Madrid'}, {country:'Japón',headquarters:'Kioto'},
    {country:'Estados Unidos',headquarters:'Seattle'}, {country:'Reino Unido',headquarters:'Manchester'},
    {country:'Canadá',headquarters:'Montreal'}, {country:'Francia',headquarters:'Lyon'},
    {country:'Alemania',headquarters:'Berlín'}, {country:'Suecia',headquarters:'Estocolmo'}
];
const PREFIXES = ['Aurora','Horizonte','Nébula','Faro','Umbral','Cobalto','Crisol','Atlas','Brújula','Lumen','Onda','Prisma','Píxel','Marea','Delta','Órbita'];
const SUFFIXES = ['Interactive','Digital','Works','Estudios','Games','Software','Labs','Entertainment'];
const GIVEN = ['Alex','Andrea','Carmen','Diego','Elena','Hana','Kai','Laura','Marina','Nora','Sam','Sora','Tomás','Yuki','Daniel','Irene'];
const FAMILY = ['Acosta','Campos','Chen','Duarte','Hernández','Kim','López','Martín','Mori','Navarro','Parker','Ruiz','Sato','Torres','Vega','Walker'];
const ROLES = ['Programación','Diseño','Arte','Control de calidad','Producción'];
const clampRandom = rng => Math.max(0, Math.min(.999999999, Number(rng()) || 0));
const integer = (rng,min,max) => min + Math.floor(clampRandom(rng) * (max - min + 1));
const pick = (rng,items) => items[integer(rng,0,items.length-1)];
const uid = (prefix, index, rng) => `${prefix}_${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}_${index.toString(36)}_${integer(rng,0,0x7fffffff).toString(36)}`}`;

/**
 * Generate an initial industry only on creation of a new simulation. `random`
 * can be injected for deterministic tests; the resulting objects are saved,
 * never regenerated during load. Count and economic ranges are configurable.
 */
export function generateRivalCompanies({count = RIVAL_COMPANY_DEFAULTS.initialCount, year = 1982, random = Math.random, profiles = RIVAL_PROFILES, minFoundationYear = RIVAL_COMPANY_DEFAULTS.minFoundationYear} = {}) {
    if (!Number.isInteger(year) || year < 1) throw new TypeError('El año histórico no es válido.');
    if (typeof random !== 'function') throw new TypeError('El generador aleatorio no es válido.');
    if (!Number.isInteger(count) || count < 0 || count > RIVAL_COMPANY_DEFAULTS.maxInitialCount) throw new RangeError('El número de empresas iniciales no es válido.');
    const profileKeys = Object.keys(profiles);
    if (count && !profileKeys.length) throw new Error('Se necesita al menos un perfil empresarial.');
    const usedNames = new Set();
    const companies = [];
    for (let index = 0; index < count; index++) {
        // Cycle through profiles to ensure a genuinely mixed initial industry.
        const profile = profileKeys[index % profileKeys.length];
        const spec = profiles[profile];
        const place = pick(random,PLACES);
        const baseName = `${pick(random,PREFIXES)} ${pick(random,SUFFIXES)}`;
        let name = baseName, suffix = 2;
        while (usedNames.has(name.toLocaleLowerCase('es'))) name = `${baseName} ${suffix++}`;
        usedNames.add(name.toLocaleLowerCase('es'));
        const id = uid('studio',index,random);
        const countEmployees = integer(random,spec.minEmployees,spec.maxEmployees);
        const funds = integer(random,spec.minFunds,spec.maxFunds);
        const employees = Array.from({length:countEmployees},(_,staffIndex) => {
            const role = ROLES[staffIndex % ROLES.length];
            const tech = integer(random,25,65), design = integer(random,25,65);
            return {id:uid(`${id}_employee`,staffIndex,random),name:`${pick(random,GIVEN)} ${pick(random,FAMILY)}`,
                role,tech,design,speed:1 + integer(random,-15,20)/100,
                salary:integer(random,900,2200),energy:100,stamina:100,morale:integer(random,60,85)};
        });
        const foundedYear = integer(random,Math.min(year,minFoundationYear),year);
        const technologies = TECH_TREE_NODES.filter(node => node.eraYear <= year && node.researchCost === 0 && node.requiredNodes.length === 0).map(node => node.id);
        const totalSalary = employees.reduce((sum,employee) => sum + employee.salary,0);
        const decisionWeights = {risk:spec.risk,innovation:spec.innovation,franchise:spec.franchise,
            marketing:spec.marketing,reserve:spec.reserve,expansion:spec.expansion};
        companies.push({id,name,legalName:`${name} ${place.country === 'España' ? 'S.L.' : 'Ltd.'}`,
            profile,personality:profile,strategy:profile === 'large' ? 'balanced' : profile,
            decisionWeights, foundedYear,country:place.country,headquarters:place.headquarters,
            description:`Estudio ${spec.label.toLocaleLowerCase('es')} de ${place.headquarters}, especializado en ${spec.specialties.join(', ')}.`,
            identityColor:pick(random,['#4d9fbe','#a16bb5','#d68755','#78a879','#b7a25b','#b26073']),
            reputation:integer(random,25,45),prestige:integer(random,15,35),funds,
            totalRevenue:0,totalExpenses:0,salaryExpenses:0,operatingExpenses:0,debt:0,
            developmentBudget:Math.round(funds * (1-spec.reserve)), marketingBudget:Math.round(funds * spec.marketing),
            investmentCapacity:Math.max(0,Math.round(funds * (1-spec.reserve) - totalSalary)),
            employees, projects:[], games:[], technologies,engines:[],
            genreSpecialties:[...spec.specialties], researchPoints:RIVAL_COMPANY_DEFAULTS.startResearchPoints,
            status:'ACTIVE', history:[{year,type:'FOUNDED',description:`${name} inicia su actividad.`}]
        });
    }
    return companies;
}
