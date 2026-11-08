/** Player finance over the existing funds and operating accounts; all data is saveable. */
export const FINANCE_DEFAULTS = Object.freeze({
 evaluationWeeks:4, transitionWeeks:4, recoveryWeeks:4, bankruptcyGraceWeeks:8,
 loanIntervalWeeks:4, bankInstallments:24, emergencyInstallments:12,
 baseCredit:15000, creditIncomeWeeks:24, creditAssetFraction:.12, creditCashFraction:.25,
 maxCredit:300000, emergencyCredit:30000, maxActiveLoans:2, loanCooldownWeeks:8,
 baseAnnualRate:.09, riskRateSpread:.10, emergencyRateExtra:.10, earlyEraRateExtra:.04, middleEraRateExtra:.02,
 missedPenaltyRate:.025, missedPenaltyMinimum:100, maxRefinances:2,
 refinanceFeeRate:.04, maxHistory:260
});
const statuses=['HEALTHY','WATCH','DIFFICULTIES','INSOLVENT','SEVERE'];
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const nonnegative=n=>Math.max(0,Number(n)||0);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const id=prefix=>`${prefix}_${globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`}`;
const config=s=>({...FINANCE_DEFAULTS,...s.settings});
const weekOf=g=>g.getIndustryWeek();
const yearOf=g=>g.getHistoricalYear();
const activeLoans=s=>s.loans.filter(l=>l.status==='ACTIVE'||l.status==='DEFAULTED');
const fail=message=>({success:false,message});
const event=(game,type,data={})=>{const f=game.financeState;const item={id:id('finance_event'),type,week:weekOf(game),year:yearOf(game),...data};f.history.push(item);return item;};

export function createFinanceState(initialBalance=null, options={}) {
 return {status:'HEALTHY',loans:[],history:[],weeklyHistory:[],settings:{...FINANCE_DEFAULTS,...options},
  creditScore:100,lastBalance:finite(initialBalance)?initialBalance:null,financingNet:0,
  worseWeeks:0,betterWeeks:0,severeWeeks:0,lastLoanWeek:null,bankruptcy:null};
}

/** Shared, side-effect-free assessment usable for player or rival wallets. */
export function assessLiquidity({cash=0,weeklyIncome=0,weeklyCosts=0,debt=0,due=0,arrears=0,realizableAssets=0,cashFlow=0,missedPayments=0}={}) {
 const c=Number(cash)||0, income=nonnegative(weeklyIncome),costs=nonnegative(weeklyCosts),obligations=nonnegative(due)+nonnegative(arrears);
 const needs=Math.max(1000,costs*4+obligations),resources=Math.max(0,c)+income*4+nonnegative(realizableAssets)*.25;
 const liquidity=resources/needs, debtRatio=nonnegative(debt)/Math.max(1000,Math.max(0,c)+income*24+nonnegative(realizableAssets));
 let risk=0;
 if(liquidity<1)risk+=(1-Math.min(1,liquidity))*48;
 if(c<0)risk+=Math.min(20,5+(-c/needs)*15);
 risk+=Math.min(15,debtRatio*10);
 if(cashFlow<0)risk+=Math.min(12,(-cashFlow/Math.max(1000,costs))*8);
 risk+=Math.min(20,nonnegative(missedPayments)*5);
 risk+=Math.min(15,nonnegative(arrears)/needs*15);
 risk=clamp(risk,0,100);
 return {liquidity,debtRatio,risk,health:Math.round(100-risk),resources,needs};
}
function projectedWeeklyCosts(game) {
 const salaries=(game.employees||[]).reduce((sum,e)=>sum+nonnegative(e.salary),0);
 const year=yearOf(game),office=game.getActiveOffice?.()?.monthlyCost ?? (game.era===1?300:game.era===2?6000:28000);
 const officeMultiplier=game.financeState?.restructuring?.active ? (game.financeState.restructuring.officeMultiplier ?? 1) : 1;
 return (salaries+office*officeMultiplier+(year<1990?100:year<2000?700:1800)+(year>=1995?(game.era===3?3000:600):0))/4;
}
function liquidAssets(game) {
 let assetValue=0, realizableAssetValue=0;
 for(const ip of game.ipState?.properties||[]) if(ip.ownerId==='player') {
  const value=nonnegative(typeof game.getIPValue==='function'?game.getIPValue(ip.id):0);
  assetValue+=value;
  if((game.ipCompanies||[]).some(c=>!['BANKRUPT','CLOSED','ACQUISITION'].includes(c.status) && (c.decisionWeights?.franchise ?? 0)>=.3 && Number.isFinite(c.funds) && c.funds-value>= (c.employees||[]).reduce((sum,e)=>sum+nonnegative(e.salary),0)*2)) realizableAssetValue+=value;
 }
 return {assetValue,realizableAssetValue};
}
export function getFinanceMetrics(game) {
 const f=game.financeState,cfg=config(f),samples=(f.weeklyHistory||[]).slice(-cfg.evaluationWeeks);
 const weeklyIncome=samples.length?samples.reduce((a,h)=>a+nonnegative(h.income),0)/samples.length:0;
 const cashFlow=samples.length?samples.reduce((a,h)=>a+(Number(h.cashFlow)||0),0)/samples.length:0;
 const weeklyCosts=projectedWeeklyCosts(game),loans=activeLoans(f),loanDebt=loans.reduce((a,l)=>a+nonnegative(l.remaining)+nonnegative(l.arrears),0);
 const overdraft=Math.max(0,-(Number(game.funds)||0)),laborDebt=nonnegative(f.bankruptcy?.employeeSeverance?.unpaid),debt=loanDebt+overdraft+laborDebt;
 const due=loans.filter(l=>l.nextDueWeek<=weekOf(game)+4).reduce((a,l)=>a+nonnegative(l.installment),0);
 const arrears=loans.reduce((a,l)=>a+nonnegative(l.arrears),0);
 const missedPayments=loans.reduce((a,l)=>a+nonnegative(l.consecutiveMisses),0);
 const assets=liquidAssets(game);
 const assessment=assessLiquidity({cash:game.funds,weeklyIncome,weeklyCosts,debt,due,arrears,realizableAssets:assets.realizableAssetValue,cashFlow,missedPayments});
 const expenses=samples.length?samples.reduce((a,h)=>a+nonnegative(h.expenses),0)/samples.length:weeklyCosts;
 return {cash:game.funds,debt,loanDebt,overdraft,laborDebt,due,arrears,weeklyCosts,weeklyIncome,expenses,cashFlow,profitability:weeklyIncome-expenses,...assets,...assessment,status:f.status,creditScore:f.creditScore};
}
function paymentAmount(balance,annualRate,installments) {
 const rate=annualRate/12;
 return Math.max(1,Math.ceil(rate===0?balance/installments:balance*rate/(1-Math.pow(1+rate,-installments))));
}
export function getCreditOffer(game,type='bank') {
 const f=game.financeState,cfg=config(f),m=getFinanceMetrics(game),now=weekOf(game),loans=activeLoans(f);
 if(!['bank','emergency'].includes(type))return {available:false,limit:0,reason:'Modalidad de financiación desconocida.'};
 if(f.status==='BANKRUPT'||f.bankruptcy)return {available:false,limit:0,reason:'La empresa está en bancarrota.'};
 if(loans.length>=cfg.maxActiveLoans)return {available:false,limit:0,reason:'Se ha alcanzado el límite de préstamos activos.'};
 if(f.lastLoanWeek!==null&&now-f.lastLoanWeek<cfg.loanCooldownWeeks)return {available:false,limit:0,reason:'Debe transcurrir el periodo mínimo entre concesiones.'};
 if(loans.some(l=>l.arrears>0)||f.creditScore<35)return {available:false,limit:0,reason:'Los impagos o la reputación financiera bloquean nuevo crédito.'};
 if(type==='emergency' && !['DIFFICULTIES','INSOLVENT','SEVERE'].includes(f.status))return {available:false,limit:0,reason:'La financiación de emergencia se reserva para empresas en dificultades.'};
 if(type==='bank' && (f.creditScore<55||['INSOLVENT','SEVERE'].includes(f.status)))return {available:false,limit:0,reason:'La situación financiera no permite un préstamo bancario.'};
 const creditLimit=Math.min(cfg.maxCredit,Math.max(0,cfg.baseCredit+m.weeklyIncome*cfg.creditIncomeWeeks+m.realizableAssetValue*cfg.creditAssetFraction+Math.max(0,m.cash)*cfg.creditCashFraction-m.debt));
 const limit=Math.floor(type==='emergency'?Math.min(cfg.emergencyCredit,creditLimit):creditLimit);
 const historicalRate = yearOf(game)<1990 ? cfg.earlyEraRateExtra : yearOf(game)<2000 ? cfg.middleEraRateExtra : 0;
 const rate=cfg.baseAnnualRate+historicalRate+(m.risk/100)*cfg.riskRateSpread+(type==='emergency'?cfg.emergencyRateExtra:0);
 return {available:limit>=1000,limit,annualInterestRate:rate,installments:type==='emergency'?cfg.emergencyInstallments:cfg.bankInstallments,reason:limit<1000?'No hay capacidad de crédito disponible.':''};
}
export function requestLoan(game,{type='bank',amount}={}) {
 const f=game.financeState,offer=getCreditOffer(game,type),principal=Number(amount);
 if(!offer.available)return fail(offer.reason);
 if(!Number.isSafeInteger(principal)||principal<1000||principal>offer.limit)return fail(`El importe debe estar entre $1.000 y $${offer.limit.toLocaleString()}.`);
 const cfg=config(f),now=weekOf(game),loan={id:id('loan'),type,lender:type==='bank'?'Banco comercial':'Fondo de emergencia',principal,remaining:principal,arrears:0,
  annualInterestRate:offer.annualInterestRate,termWeeks:offer.installments*cfg.loanIntervalWeeks,installment:paymentAmount(principal,offer.annualInterestRate,offer.installments),
  grantedYear:yearOf(game),grantedWeek:now,nextDueWeek:now+cfg.loanIntervalWeeks,status:'ACTIVE',paymentHistory:[],missedPayments:0,consecutiveMisses:0,refinanceCount:0};
 f.loans.push(loan);game.funds+=principal;f.financingNet+=principal;f.lastLoanWeek=now;event(game,'LOAN_GRANTED',{loanId:loan.id,amount:principal});
 return {success:true,loan,message:`Financiación concedida: $${principal.toLocaleString()}.`};
}
export function refinanceLoan(game,loanId) {
 const f=game.financeState,cfg=config(f),loan=activeLoans(f).find(l=>l.id===loanId);
 if(!loan||f.status==='BANKRUPT'||f.bankruptcy)return fail('Préstamo no disponible para refinanciación.');
 if(loan.refinanceCount>=cfg.maxRefinances)return fail('Se ha alcanzado el límite de refinanciaciones.');
 const oldPrincipal=loan.remaining,oldArrears=loan.arrears,fee=Math.ceil((oldPrincipal+oldArrears)*cfg.refinanceFeeRate);
 if(!(oldPrincipal+oldArrears>0))return fail('No hay deuda pendiente que refinanciar.');
 loan.remaining=oldPrincipal+oldArrears+fee;loan.arrears=0;loan.annualInterestRate=Math.min(.6,loan.annualInterestRate+.03);
 loan.termWeeks=cfg.bankInstallments*cfg.loanIntervalWeeks;loan.installment=paymentAmount(loan.remaining,loan.annualInterestRate,cfg.bankInstallments);
 loan.nextDueWeek=weekOf(game)+cfg.loanIntervalWeeks;loan.refinanceCount++;loan.consecutiveMisses=0;loan.status='ACTIVE';
 event(game,'LOAN_REFINANCED',{loanId:loan.id,fee,amount:loan.remaining});
 return {success:true,loan,fee,message:'La deuda se ha reorganizado; los intereses y el coste total pueden aumentar.'};
}
function processLoanPayments(game) {
 const f=game.financeState,cfg=config(f),now=weekOf(game);
 for(const loan of activeLoans(f)) {
  if(loan.nextDueWeek>now)continue;
  const interest=Math.round(loan.remaining*loan.annualInterestRate/12);
  const scheduled=Math.min(loan.installment,loan.remaining+interest);
  const principalDue=Math.min(loan.remaining,Math.max(0,scheduled-interest));
  const due=Math.round(scheduled+loan.arrears);
  const paid=Math.min(Math.max(0,game.funds),due);game.funds-=paid;f.financingNet-=paid;
  // The due principal moves out of future principal into arrears if unpaid;
  // the same obligation is never counted in both balances.
  const unpaid=Math.max(0,due-paid);
  loan.remaining=Math.max(0,loan.remaining-principalDue);
  loan.arrears=unpaid;
  if(unpaid>0){const penalty=Math.max(cfg.missedPenaltyMinimum,Math.ceil(unpaid*cfg.missedPenaltyRate));loan.arrears+=penalty;loan.missedPayments++;loan.consecutiveMisses++;f.creditScore=Math.max(0,f.creditScore-8);loan.status='DEFAULTED';event(game,'PAYMENT_MISSED',{loanId:loan.id,due,paid,penalty});}
  else {loan.consecutiveMisses=0;loan.status='ACTIVE';f.creditScore=Math.min(100,f.creditScore+1);event(game,'PAYMENT_MADE',{loanId:loan.id,due,paid});}
  loan.paymentHistory.push({week:now,year:yearOf(game),due,paid,remaining:loan.remaining,arrears:loan.arrears});
  loan.nextDueWeek+=cfg.loanIntervalWeeks;
  if(loan.remaining<.01 && loan.arrears<.01){loan.remaining=0;loan.arrears=0;loan.status='PAID';event(game,'LOAN_PAID',{loanId:loan.id});}
 }
}
function targetLevel(m) {
 if(m.risk>=75)return 4;
 if(m.risk>=55)return 3;
 if(m.risk>=35)return 2;
 if(m.risk>=15)return 1;
 return 0;
}
export function updateFinanceWeek(game) {
 const f=game.financeState,cfg=config(f);if(f.status==='BANKRUPT')return getFinanceMetrics(game);
 processLoanPayments(game);
 const current=Number(game.funds)||0,delta=f.lastBalance===null?0:current-f.lastBalance;
 const cashFlow=delta-f.financingNet,income=nonnegative(game.lastWeeklySalesIncome),expenses=Math.max(0,income-cashFlow);
 f.weeklyHistory.push({week:weekOf(game),year:yearOf(game),cash:current,income,expenses,cashFlow});
 if(f.weeklyHistory.length>cfg.maxHistory)f.weeklyHistory.splice(0,f.weeklyHistory.length-cfg.maxHistory);
 f.lastBalance=current;f.financingNet=0;
 const m=getFinanceMetrics(game),old=f.status,index=Math.max(0,statuses.indexOf(f.status)),target=targetLevel(m);
 if(target>index){f.worseWeeks++;f.betterWeeks=0;if(f.worseWeeks>=cfg.transitionWeeks){f.status=statuses[index+1];f.worseWeeks=0;}}
 else if(target<index){f.betterWeeks++;f.worseWeeks=0;if(f.betterWeeks>=cfg.recoveryWeeks){f.status=statuses[index-1];f.betterWeeks=0;}}
 else {f.worseWeeks=0;f.betterWeeks=0;}
 f.severeWeeks=f.status==='SEVERE'?f.severeWeeks+1:0;
 if(old!==f.status)event(game,'STATUS_CHANGED',{from:old,to:f.status,risk:m.risk});
 return {...getFinanceMetrics(game),previousStatus:old};
}
