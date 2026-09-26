(() => {
  const BB_CIRCULAR = 'https://www.bb.org.bd/mediaroom/circulars/brpd-2/sep132026brpd-25.pdf';
  const BB_BANK_DIRECTORY = 'https://www.bb.org.bd/en/index.php/links/links/9';
  const BB_STATS = 'https://www.bb.org.bd/en/index.php/publication/publictn/2/14';

  const lenses = [
    {id:'solvency', number:'1', title:'Bank Solvency and Liquidity', weight:25, description:'Capital strength, solvency, stability and resilience to shocks.', kpis:[
      {id:'crar', label:'Capital to Risk-Weighted Assets Ratio (CRAR)', short:'CRAR', weight:25, direction:'higher', expectation:'≥ regulatory minimum + 2.5% buffer (12.5%)'},
      {id:'cet1', label:'Common Equity Tier 1 (CET1) Ratio', short:'CET1', weight:15, direction:'higher', expectation:'≥ regulatory minimum'},
      {id:'adjustedCrar', label:'Adjusted CRAR / CRAR with deferral', short:'Adjusted CRAR', weight:15, direction:'higher', expectation:'≥ regulatory minimum'},
      {id:'lcr', label:'Liquidity Coverage Ratio (LCR)', short:'LCR', weight:15, direction:'higher', expectation:'≥ regulatory threshold'},
      {id:'nsfr', label:'Net Stable Funding Ratio (NSFR)', short:'NSFR', weight:15, direction:'higher', expectation:'Sustainable funding profile'},
      {id:'adr', label:'Advance to Deposit Ratio (ADR)', short:'ADR', weight:15, direction:'higher', expectation:'Compliance with regulatory limits', critical:true}
    ]},
    {id:'assetQuality', number:'2', title:'Asset Quality', weight:25, description:'Loan portfolio quality, concentration and recovery performance.', kpis:[
      {id:'grossNpl', label:'NPL ratio (Gross)', short:'Gross NPL', weight:25, direction:'lower', expectation:'Below industry/peer average; declining trend', critical:true},
      {id:'netNpl', label:'NPL ratio (Net)', short:'Net NPL', weight:10, direction:'lower', expectation:'Below industry/peer average; declining trend', critical:true},
      {id:'stressedAssets', label:'Stressed assets', short:'Stressed assets', weight:15, direction:'lower', expectation:'Below industry/peer average; declining trend'},
      {id:'provisionCoverage', label:'Provision coverage', short:'Provision coverage', weight:15, direction:'higher', expectation:'Fully compliant with Bangladesh Bank guidelines'},
      {id:'largeLoan', label:'Large loan and top-borrower concentration', short:'Large/top borrower', weight:15, direction:'lower', expectation:'Declining trend', critical:true},
      {id:'recovery', label:'Recovery against classified and write-off loan', short:'Recovery', weight:20, direction:'higher', expectation:'Increasing; above industry/peer average', critical:true}
    ]},
    {id:'profitability', number:'3', title:'Profitability', weight:10, description:'Profitability in line with operations, risk appetite and resources.', kpis:[
      {id:'roa', label:'Return on Assets (ROA)', short:'ROA', weight:20, direction:'higher', expectation:'Increasing; above industry/peer average'},
      {id:'roe', label:'Return on Equity (ROE)', short:'ROE', weight:20, direction:'higher', expectation:'Increasing; above industry/peer average'},
      {id:'nim', label:'Net Interest Margin (NIM)', short:'NIM', weight:20, direction:'higher', expectation:'Increasing; above industry/peer average'},
      {id:'opexOperatingProfit', label:'Operating expenses / Operating profit', short:'Opex / operating profit', weight:15, direction:'lower', expectation:'Decreasing trend'},
      {id:'nonInterestIncome', label:'Non-interest income / Total income', short:'Non-interest income', weight:10, direction:'higher', expectation:'Increasing; around 20% of total income'},
      {id:'depositMix', label:'Deposit mix', short:'Deposit mix', weight:15, direction:'higher', expectation:'High-cost ≤45%; low-cost ≤40%; no-cost ≤15%'}
    ]},
    {id:'governance', number:'4', title:'Governance and Internal Control', weight:25, description:'Governance, compliance, reporting, technology risk and leadership.', kpis:[
      {id:'regCompliance', label:'Regulatory compliance', short:'Regulatory compliance', weight:15, direction:'higher', expectation:'No serious unsettled non-compliance or violations'},
      {id:'amlCft', label:'AML/CFT compliance', short:'AML/CFT', weight:15, direction:'higher', expectation:'Strong/Satisfactory or Low/Moderate RBS rating'},
      {id:'crr', label:'Composite risk rating (CRR)', short:'CRR', weight:30, direction:'lower', expectation:'Improvement; Low or Moderate'},
      {id:'regReporting', label:'Regulatory reporting', short:'Regulatory reporting', weight:15, direction:'higher', expectation:'Timely, accurate and improving reporting'},
      {id:'ictRisk', label:'ICT and technology risk mitigation', short:'ICT risk', weight:10, direction:'higher', expectation:'Strong/Satisfactory or Low/Moderate RBS rating'},
      {id:'leadership', label:'Leadership', short:'Leadership', weight:15, direction:'higher', expectation:'Weighted average of other KPIs; 75% and above'}
    ]},
    {id:'inclusion', number:'5', title:'Inclusion, Customer and Market Conduct', weight:15, description:'Financial inclusion, service quality and fair customer treatment.', kpis:[
      {id:'digitalAdoption', label:'Digital services adoption', short:'Digital adoption', weight:20, direction:'higher', expectation:'Increasing trend; notable improvement'},
      {id:'serviceInnovation', label:'Service quality and innovation', short:'Service & innovation', weight:10, direction:'higher', expectation:'Higher complaint settlement and innovation'},
      {id:'cmsmeAgricultureGreen', label:'CMSME, Agriculture, Green finance and financial inclusion outreach', short:'CMSME/agri/green/inclusion', weight:40, direction:'higher', expectation:'Alignment with BB policies', critical:true},
      {id:'geographicalDistribution', label:'Geographical distribution of loans / Total loans', short:'Geographical distribution', weight:10, direction:'higher', expectation:'Increasing; above industry/peer average'},
      {id:'fraudForgery', label:'Fraud and forgery risk mitigation', short:'Fraud/forgery', weight:10, direction:'higher', expectation:'Fraud cases decreasing; detection increasing'},
      {id:'legalRisk', label:'Legal risk mitigation', short:'Legal risk', weight:10, direction:'higher', expectation:'Outstanding litigation decreasing; settlement improving'}
    ]}
  ];

  const banks = [
    ['AB Bank PLC','Conventional PCB','https://www.abbl.com'],['Agrani Bank PLC','State-owned commercial','https://www.agranibank.org'],['Al-Arafah Islami Bank PLC','Islamic PCB','https://www.al-arafahbank.com'],['Bangladesh Commerce Bank Limited','Conventional PCB','https://bcblbd.com'],['Bangladesh Development Bank PLC','State-owned commercial','https://www.bdbl.com.bd'],['Bangladesh Krishi Bank','Specialized bank','https://www.krishibank.org.bd'],['Bank Al-Falah Limited','Foreign commercial','https://www.bankalfalah.com'],['Bank Asia PLC','Conventional PCB','https://www.bankasia-bd.com'],['BASIC Bank PLC','State-owned commercial','https://basicbankplc.com/en'],['Bengal Commercial Bank PLC','New bank','https://bgcb.com.bd'],['BRAC Bank PLC','Conventional PCB','https://bracbank.com'],['Citibank N.A.','Foreign commercial','https://www.citi.com'],['Citizens Bank PLC','New bank','https://www.citizensbankbd.com'],['City Bank PLC','Conventional PCB','https://www.thecitybank.com'],['Commercial Bank of Ceylon Limited','Foreign commercial','https://www.combank.net/bdweb'],['Community Bank Bangladesh PLC','New bank','https://www.communitybankbd.com'],['Dhaka Bank PLC','Conventional PCB','https://dhakabankltd.com'],['Dutch-Bangla Bank PLC','Conventional PCB','https://www.dutchbanglabank.com'],['Eastern Bank PLC','Conventional PCB','https://www.ebl.com.bd'],['Export Import Bank of Bangladesh PLC','Islamic PCB','https://www.eximbankbd.com'],['First Security Islami Bank PLC','Islamic PCB','https://www.fsiblbd.com'],['Global Islami Bank PLC','Islamic PCB','https://www.globalislamibankbd.com'],['Habib Bank Ltd.','Foreign commercial','https://globalhbl.com/Bangladesh'],['ICB Islamic Bank Ltd.','Islamic PCB','https://www.icbislamic-bd.com'],['IFIC Bank PLC','Conventional PCB','https://www.ificbank.com.bd'],['Islami Bank Bangladesh PLC','Islamic PCB','https://www.islamibankbd.com'],['Jamuna Bank PLC','Conventional PCB','https://www.jamunabankbd.com'],['Janata Bank PLC','State-owned commercial','https://www.janatabank-bd.com'],['Meghna Bank PLC','New bank','https://www.meghnabank.com.bd'],['Mercantile Bank PLC','Conventional PCB','https://www.mblbd.com'],['Midland Bank Limited','New bank','https://www.midlandbankbd.net'],['Modhumoti Bank PLC','New bank','https://www.modhumotibankplc.com'],['Mutual Trust Bank PLC','Conventional PCB','https://www.mutualtrustbank.com'],['Nagad Digital Bank PLC','Digital bank · not yet granted commercial operation','',false],['National Bank of Pakistan','Foreign commercial','https://www.nbp.com.pk'],['National Bank PLC','Conventional PCB','https://www.nblbd.com'],['National Credit & Commerce Bank PLC','Conventional PCB','https://www.nccbank.com.bd'],['NRB Bank PLC','New bank','https://www.nrbbankbd.com'],['NRBC Bank PLC','New bank','https://www.nrbcommercialbank.com'],['One Bank PLC','Conventional PCB','https://www.onebankbd.com'],['Padma Bank PLC','Conventional PCB','https://www.padmabankbd.com'],['Prime Bank PLC','Conventional PCB','https://www.primebank.com.bd'],['Probashi Kollyan Bank','Specialized bank','https://www.pkb.gov.bd'],['Pubali Bank PLC','Conventional PCB','https://www.pubalibangla.com'],['Rajshahi Krishi Unnayan Bank','Specialized bank','https://www.rakub.org.bd'],['Rupali Bank PLC','State-owned commercial','https://rupalibank.com.bd'],['Sammilito Islami Bank PLC','Islamic bank · public data mapping pending','',false],['SBAC Bank PLC','New bank','https://www.sbacbank.com'],['Shahjalal Islami Bank PLC','Islamic PCB','https://www.sjiblbd.com'],['Shimanto Bank PLC','New bank','https://www.shimantobank.com'],['Social Islami Bank PLC','Islamic PCB','https://www.siblbd.com'],['Sonali Bank PLC','State-owned commercial','https://www.sonalibank.com.bd'],['Southeast Bank PLC','Conventional PCB','https://www.southeastbank.com.bd'],['Standard Chartered Bank','Foreign commercial','https://www.standardchartered.com/bd'],['Standard Islami Bank PLC','Islamic PCB','https://www.standardbankbd.com'],['State Bank of India','Foreign commercial','https://bd.statebank'],['The Hong Kong and Shanghai Banking Corporation (HSBC)','Foreign commercial','https://www.hsbc.com.bd'],['The Premier Bank PLC','Conventional PCB','https://www.premierbankltd.com'],['Trust Bank PLC','Conventional PCB','https://www.trustbank.com.bd'],['Union Bank PLC','Islamic PCB','https://www.unionbank.com.bd'],['United Commercial Bank PLC','Conventional PCB','https://www.ucb.com.bd'],['Uttara Bank PLC','Conventional PCB','https://www.uttarabank-bd.com'],['Woori Bank','Foreign commercial','https://www.wooribank.com']
  ].map((item,index) => ({id:`bank-${index+1}`,name:item[0],category:item[1],website:item[2],active:item[3] !== false}));

  // Only exact figures visibly published on the named bank website are seeded here.
  // Values are reference actuals; baseline and Board target remain blank by design.
  const publicBankData = {
    'BRAC Bank PLC': {period:'30 June 2025', source:'BRAC Bank company profile', sourceUrl:'https://bracbank.com/en/company-profile', note:'Published profile figures; use as reference actuals only.', metrics:{crar:14.50,grossNpl:3.37,roa:1.26,roe:15.71}},
    'Eastern Bank PLC': {period:'31 December 2025', source:'EBL 2025 performance release', sourceUrl:'https://www.ebl.com.bd/news/ebl-posts-20-profit-growth-in-2025', note:'Published 2025 figures; use as reference actuals only.', metrics:{crar:15.49,grossNpl:2.24,roe:19.13}}
  };

  const criticalIds = new Set(lenses.flatMap(lens => lens.kpis.filter(kpi => kpi.critical).map(kpi => kpi.id)));
  const kpiMap = new Map(lenses.flatMap(lens => lens.kpis.map(kpi => [kpi.id,{...kpi,lensId:lens.id,lensWeight:lens.weight,lensTitle:lens.title}])));
  const formState = {lastLoadedBank:null};

  const bankSelect = document.querySelector('#bank-select');
  const periodSelect = document.querySelector('#period-select');
  const modeSelect = document.querySelector('#mode-select');
  const lensHost = document.querySelector('#kpi-lenses');
  const lensSummary = document.querySelector('#lens-summary');

  const esc = (value) => String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const fmt = (value, digits=2) => Number.isFinite(value) ? value.toLocaleString('en-US',{minimumFractionDigits:digits,maximumFractionDigits:digits}) : '—';
  const allKpis = () => lenses.flatMap(lens => lens.kpis);

  function buildBankOptions() {
    bankSelect.innerHTML = `<option value="">Select a bank</option>${banks.map(bank => `<option value="${esc(bank.name)}" ${bank.active ? '' : 'data-inactive="true"'}>${esc(bank.name)}${bank.active ? '' : ' — public operation mapping pending'}</option>`).join('')}`;
  }

  function buildLensSummary() {
    lensSummary.innerHTML = lenses.map(lens => `<div class="lens-chip" data-summary="${lens.id}"><div class="lens-chip-top"><span>Lens ${lens.number} · ${esc(lens.title)}</span><span>${lens.weight}%</span></div><strong id="summary-score-${lens.id}">—</strong><div class="lens-meter"><span id="summary-meter-${lens.id}"></span></div></div>`).join('');
  }

  function buildTables() {
    lensHost.innerHTML = lenses.map(lens => `<section class="kpi-lens" data-lens="${lens.id}">
      <div class="kpi-lens-header"><div class="kpi-lens-title"><span class="lens-number">${lens.number}</span><div><h3>${esc(lens.title)}</h3><p>${esc(lens.description)}</p></div></div><span class="lens-weight">Lens weight: ${lens.weight}%</span></div>
      <div class="kpi-table-wrap"><table class="kpi-table"><thead><tr><th>KPI / parameter</th><th>Weight</th><th>Direction</th><th>Baseline<br><small>previous quarter</small></th><th>Board target</th><th>Actual</th><th>Evidence / source</th><th>Achievement</th></tr></thead><tbody>${lens.kpis.map(kpi => `<tr data-kpi-row="${kpi.id}"><td class="kpi-name"><strong>${esc(kpi.label)}</strong><small>${esc(kpi.expectation)}</small>${kpi.critical ? '<span class="kpi-public-note">Critical KPI · penalty rule applies</span>' : ''}</td><td class="kpi-weight">${kpi.weight}%</td><td>${kpi.direction === 'higher' ? '↑ Higher' : '↓ Lower'}</td><td><input class="kpi-input" data-kpi="${kpi.id}" data-field="baseline" type="number" step="any" inputmode="decimal" aria-label="${esc(kpi.short)} baseline"></td><td><input class="kpi-input" data-kpi="${kpi.id}" data-field="target" type="number" step="any" inputmode="decimal" aria-label="${esc(kpi.short)} target"></td><td><input class="kpi-input" data-kpi="${kpi.id}" data-field="actual" type="number" step="any" inputmode="decimal" aria-label="${esc(kpi.short)} actual"></td><td><input class="kpi-source" data-kpi="${kpi.id}" data-field="source" type="text" placeholder="e.g. AR 2025" aria-label="${esc(kpi.short)} source"></td><td class="kpi-score-cell"><div class="kpi-achievement" data-output="${kpi.id}-achievement">—</div><div class="kpi-weighted" data-output="${kpi.id}-weighted">Weighted: —</div><div class="kpi-status" data-output="${kpi.id}-status">Awaiting inputs</div></td></tr>`).join('')}</tbody></table></div>
    </section>`).join('');
    lensHost.querySelectorAll('input').forEach(input => input.addEventListener('input', calculate));
  }

  function getValue(kpiId, field) {
    const input = document.querySelector(`[data-kpi="${kpiId}"][data-field="${field}"]`);
    return input ? input.value.trim() : '';
  }

  function setValue(kpiId, field, value) {
    const input = document.querySelector(`[data-kpi="${kpiId}"][data-field="${field}"]`);
    if (input && value !== undefined && value !== null) input.value = value;
  }

  function scoreRatio(kpi, baseline, target, actual) {
    if (![baseline,target,actual].every(Number.isFinite)) return null;
    if (kpi.direction === 'higher') {
      if (target === baseline) return actual >= target ? 1 : Math.max(0, actual / (Math.abs(target) || 1));
      return Math.max(0, Math.min(1, (actual - baseline) / (target - baseline)));
    }
    if (target === baseline) return actual <= target ? 1 : Math.max(0, target / (Math.abs(actual) || 1));
    return Math.max(0, Math.min(1, (baseline - actual) / (baseline - target)));
  }

  function calculate() {
    let filled = 0;
    let earned = 0;
    let availableMax = 0;
    let penalty = 0;
    const lensResults = {};
    allKpis().forEach(kpi => {
      const baseline = Number(getValue(kpi.id,'baseline'));
      const target = Number(getValue(kpi.id,'target'));
      const actual = Number(getValue(kpi.id,'actual'));
      const complete = [baseline,target,actual].every(Number.isFinite);
      const ratio = scoreRatio(kpi,baseline,target,actual);
      const maxContribution = kpi.lensWeight * kpi.weight / 100;
      let contribution = null;
      if (complete && ratio !== null) {
        filled += 1;
        availableMax += maxContribution;
        contribution = ratio >= .5 ? ratio * maxContribution : 0;
        earned += contribution;
        if (criticalIds.has(kpi.id) && ratio < .5) penalty += maxContribution * .25;
      }
      const achievement = document.querySelector(`[data-output="${kpi.id}-achievement"]`);
      const weighted = document.querySelector(`[data-output="${kpi.id}-weighted"]`);
      const status = document.querySelector(`[data-output="${kpi.id}-status"]`);
      if (!complete || ratio === null) { achievement.textContent = '—'; weighted.textContent = 'Weighted: —'; status.textContent = 'Awaiting inputs'; status.className = 'kpi-status'; }
      else { achievement.textContent = `${fmt(ratio*100,1)}%`; weighted.textContent = `Weighted: ${fmt(contribution,2)}`; status.textContent = ratio < .5 ? 'Below 50% → zero score' : (ratio < .75 ? 'Partial achievement' : 'Scored'); status.className = `kpi-status ${ratio < .5 ? 'bad' : ratio < .75 ? 'warn' : 'good'}`; }
    });
    lenses.forEach(lens => {
      const lensKpis = lens.kpis;
      const lensFilled = lensKpis.filter(kpi => [getValue(kpi.id,'baseline'),getValue(kpi.id,'target'),getValue(kpi.id,'actual')].every(value => value !== '' && Number.isFinite(Number(value))));
      const lensMax = lensKpis.reduce((sum,kpi) => sum + lens.weight*kpi.weight/100,0);
      const lensEarned = lensKpis.reduce((sum,kpi) => {
        const b=Number(getValue(kpi.id,'baseline')),t=Number(getValue(kpi.id,'target')),a=Number(getValue(kpi.id,'actual')); const ratio=scoreRatio(kpi,b,t,a); return sum + (ratio === null ? 0 : ratio >= .5 ? ratio*kpi.weight : 0);
      },0);
      const lensAvailableMax = lensKpis.filter(kpi => [getValue(kpi.id,'baseline'),getValue(kpi.id,'target'),getValue(kpi.id,'actual')].every(value => value !== '' && Number.isFinite(Number(value)))).reduce((sum,kpi)=>sum+lens.weight*kpi.weight/100,0);
      const lensPercent = lensAvailableMax ? (lensEarned/lensAvailableMax)*100 : 0;
      lensResults[lens.id] = {filled:lensFilled.length,total:lensKpis.length,percent:lensPercent,lensEarned,lensMax};
      const score = document.querySelector(`#summary-score-${lens.id}`); const meter = document.querySelector(`#summary-meter-${lens.id}`); if (score) score.textContent = lensFilled.length ? `${fmt(lensPercent,1)}% · ${lensFilled.length}/${lensKpis.length}` : '—'; if (meter) meter.style.width = `${Math.min(100,lensPercent)}%`;
    });
    const complete = filled === allKpis().length;
    const finalScore = complete ? Math.max(0,earned-penalty) : (availableMax ? Math.max(0,(earned/availableMax)*100 - penalty) : null);
    document.querySelector('#grand-score').textContent = finalScore === null ? '—' : `${fmt(finalScore,2)} / 100`;
    document.querySelector('#score-label').textContent = complete ? 'Final calculation view' : (filled ? 'Provisional public / partial-input view' : 'Complete the inputs to calculate');
    document.querySelector('#coverage').textContent = `${filled} / ${allKpis().length}`;
    document.querySelector('#coverage-note').textContent = complete ? 'All 30 KPI rows completed' : 'Full assessment requires all KPI rows';
    document.querySelector('#penalty').textContent = complete || penalty ? `−${fmt(penalty,2)}` : '—';
    const ratingEl = document.querySelector('#rating'); const ratingNote = document.querySelector('#rating-note');
    if (finalScore === null) { ratingEl.textContent = '—'; ratingNote.textContent = '75+ Above Average · 65–<75 Average · <65 Below Average'; }
    else if (finalScore >= 75) { ratingEl.textContent = complete ? 'Above Average' : 'Indicative: Above Average'; ratingNote.textContent = complete ? 'Standard performance interpretation under the circular.' : 'Indicative only because the dataset is incomplete.'; }
    else if (finalScore >= 65) { ratingEl.textContent = complete ? 'Average' : 'Indicative: Average'; ratingNote.textContent = complete ? 'Needs improvement in performance level.' : 'Indicative only because the dataset is incomplete.'; }
    else { ratingEl.textContent = complete ? 'Below Average' : 'Indicative: Below Average'; ratingNote.textContent = complete ? 'Needs immediate improvement in performance level.' : 'Indicative only because the dataset is incomplete.'; }
    const note = document.querySelector('#output-note');
    note.innerHTML = complete ? `<strong>Calculation complete:</strong> The displayed final score includes the 50% threshold and critical-KPI penalty rule. It remains a review-support result and must be reconciled with the Board-approved Excel template and evidence.` : `<strong>Partial view:</strong> ${filled} of ${allKpis().length} KPI rows have complete baseline, target and actual inputs. The score is normalised over completed rows and must not be treated as an official appraisal.`;
  }

  function loadPublicProfile() {
    const bank = bankSelect.value;
    const profile = publicBankData[bank];
    const bankMeta = banks.find(item => item.name === bank);
    document.querySelector('#profile-bank').textContent = bank || 'Choose a bank';
    document.querySelector('#profile-category').textContent = bankMeta ? bankMeta.category : '—';
    if (!profile) {
      document.querySelector('#profile-status').textContent = 'No verified metric profile loaded';
      document.querySelector('#profile-period').textContent = 'Enter figures from an authoritative disclosure';
      document.querySelector('#profile-source').textContent = bankMeta && bankMeta.website ? 'Open bank website ↗' : 'Bangladesh Bank directory ↗';
      document.querySelector('#profile-source').href = bankMeta && bankMeta.website ? bankMeta.website : BB_BANK_DIRECTORY;
      document.querySelector('#profile-source-note').textContent = 'The dropdown is available; metric ingestion is currently selective and period-tagged.';
      formState.lastLoadedBank = null;
      document.querySelector('#output-note').innerHTML = '<strong>Public-data status:</strong> No exact, period-tagged public metric profile is loaded for this bank. Use the bank website, annual/quarterly disclosures and Bangladesh Bank publications as evidence sources, then enter the values manually.';
      calculate();
      return;
    }
    Object.entries(profile.metrics).forEach(([id,value]) => { setValue(id,'actual',value); if (!getValue(id,'source')) setValue(id,'source',profile.period); });
    document.querySelector('#profile-status').textContent = `${Object.keys(profile.metrics).length} public actuals loaded`;
    document.querySelector('#profile-period').textContent = profile.period;
    document.querySelector('#profile-source').textContent = `${profile.source} ↗`;
    document.querySelector('#profile-source').href = profile.sourceUrl;
    document.querySelector('#profile-source-note').textContent = profile.note;
    formState.lastLoadedBank = bank;
    document.querySelector('#output-note').innerHTML = `<strong>Public profile loaded:</strong> Selected actuals come from ${esc(profile.source)} for ${esc(profile.period)}. Baseline and Board target remain blank so the calculator does not invent an official target.`;
    calculate();
  }

  function clearInputs() { lensHost.querySelectorAll('input').forEach(input => { input.value=''; }); bankSelect.value=''; formState.lastLoadedBank=null; document.querySelector('#profile-bank').textContent='Choose a bank'; document.querySelector('#profile-category').textContent='—'; document.querySelector('#profile-status').textContent='No profile loaded'; document.querySelector('#profile-period').textContent='—'; document.querySelector('#profile-source').textContent='Public source register'; document.querySelector('#profile-source').href='#public-data'; document.querySelector('#profile-source-note').textContent='Use verified disclosures only.'; calculate(); }

  buildBankOptions(); buildLensSummary(); buildTables();
  document.querySelector('#load-public').addEventListener('click',loadPublicProfile);
  document.querySelector('#clear-form').addEventListener('click',clearInputs);
  bankSelect.addEventListener('change',() => { const meta=banks.find(item=>item.name===bankSelect.value); document.querySelector('#profile-bank').textContent=bankSelect.value||'Choose a bank'; document.querySelector('#profile-category').textContent=meta?meta.category:'—'; });
  modeSelect.addEventListener('change',() => { document.querySelector('#output-note').innerHTML = modeSelect.value === 'public' ? '<strong>Public-data preview:</strong> Use only period-tagged, source-linked disclosures. Missing internal or supervisory evidence is intentionally not imputed.' : '<strong>Board / full KPI assessment:</strong> Enter the Board-approved targets, verified baseline and actual performance for all 30 KPIs.'; calculate(); });
  periodSelect.addEventListener('change',() => { if (periodSelect.value === 'custom') window.alert('For a custom period, record the Board-approved dates in the evidence file and continue using the same baseline/target/actual columns.'); });
  calculate();
})();
