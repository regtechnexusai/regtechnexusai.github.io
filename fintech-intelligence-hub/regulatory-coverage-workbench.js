(() => {
  'use strict';
  const root = document.getElementById('regulatory-coverage-workbench');
  if (!root) return;
  const countryNames = "Global standards and cross-border frameworks|Bangladesh|United States|United Kingdom|European Union (EU-level)|China|India|Singapore|Hong Kong|Japan|South Korea|Australia|Canada|Brazil|United Arab Emirates (federal)|DIFC / DFSA (UAE)|ADGM / FSRA (UAE)|Saudi Arabia|Malaysia|Indonesia|Thailand|Philippines|Vietnam|Pakistan|Sri Lanka|Nepal|New Zealand|Switzerland|Norway|Liechtenstein|Türkiye|Bahrain|Qatar|Kuwait|Oman|Jordan|Israel|South Africa|Nigeria|Kenya|Ghana|Rwanda|Egypt|Morocco|Mauritius|Tanzania|Uganda|Ethiopia|Senegal / WAEMU|CEMAC regional framework|Mexico|Chile|Colombia|Argentina|Peru|The Bahamas|Barbados|Jamaica|Bermuda|Kazakhstan|Uzbekistan|Brunei Darussalam|Cambodia|Laos|Taiwan|Mongolia|Fiji|Papua New Guinea|Angola|Botswana|Burundi|Eswatini|Gabon|The Gambia|Liberia|Malawi|Mali|Mozambique|Niger|Algeria|Tunisia|Côte d’Ivoire|Burkina Faso|Benin|Togo|Guinea|Democratic Republic of the Congo|Zambia|Zimbabwe|Namibia|Lesotho|Seychelles|Cape Verde|France|Germany|Italy|Spain|Netherlands|Ireland|Poland|Sweden|Denmark|Belgium|Austria|Portugal|Greece|Finland|Luxembourg|Malta|Iceland|Serbia|Georgia|Armenia|Azerbaijan|Bosnia and Herzegovina|Montenegro|Moldova|Belarus|Ukraine|Russia|Kosovo|North Macedonia|Albania|Kyrgyz Republic|Tajikistan|Costa Rica|Panama|El Salvador|Ecuador|Uruguay|Trinidad and Tobago|Eastern Caribbean Currency Union|Maldives|Afghanistan|Bhutan|Macau SAR|Samoa|Vanuatu|Solomon Islands|Tonga|Timor-Leste|Cayman Islands|British Virgin Islands|Bolivia|Guatemala|Honduras|Paraguay|Czechia|Hungary|Romania|Lebanon|South Sudan|Côte d’Ivoire / WAEMU regional record|Turkmenistan|Curaçao and Sint Maarten|Jersey|Guernsey|Isle of Man|Gibraltar|Estonia|Cyprus|Bulgaria|Iraq|Yemen|Syria|Haiti|Venezuela|Cook Islands|Macao, China|Marshall Islands|Nauru|Niue|Palau|Tuvalu|Chinese Taipei|Myanmar|Anguilla|Antigua and Barbuda|Aruba|Belize|Curaçao|Dominica|Grenada|Guyana|Montserrat|Saint Kitts and Nevis|Saint Lucia|Sint Maarten|Saint Vincent and the Grenadines|Suriname|Turks and Caicos Islands|Comoros|Guinea-Bissau|São Tomé and Príncipe|Sierra Leone|Eritrea|Madagascar|Cuba|Dominican Republic|Nicaragua|Djibouti|Sudan|Somalia|State of Palestine|Libya|Mauritania|Andorra|Croatia|Latvia|Lithuania|Monaco|San Marino|Slovakia|Slovenia|Holy See|Cameroon|Central African Republic|Republic of the Congo|Equatorial Guinea|Chad|Senegal".split('|');
  const sources = {
    'Bangladesh': [
      ['Bangladesh Bank','Banking, prudential regulation, payments and MFS','https://www.bb.org.bd/'],
      ['Bangladesh Financial Intelligence Unit (BFIU)','AML/CFT, financial intelligence, circulars and circular letters','https://www.bfiu.org.bd/index.php/legislation/circular'],
      ['Bangladesh Securities and Exchange Commission (BSEC)','Capital markets and securities','https://sec.gov.bd/'],
      ['Insurance Development and Regulatory Authority (IDRA)','Insurance supervision','https://idra.org.bd/'],
      ['Official laws and gazette sources','Acts, rules and gazette publications','https://bdlaws.minlaw.gov.bd/']
    ],
    'United States': [
      ['Federal Reserve','Bank supervision and financial stability','https://www.federalreserve.gov/'],
      ['Office of the Comptroller of the Currency (OCC)','National banks and federal savings associations','https://www.occ.gov/'],
      ['Federal Deposit Insurance Corporation (FDIC)','Deposit insurance and bank supervision','https://www.fdic.gov/'],
      ['FinCEN','AML/CFT and financial intelligence','https://www.fincen.gov/'],
      ['U.S. Securities and Exchange Commission (SEC)','Securities markets','https://www.sec.gov/'],
      ['Office of Foreign Assets Control (OFAC)','U.S. sanctions','https://ofac.treasury.gov/']
    ],
    'United Kingdom': [
      ['Financial Conduct Authority (FCA)','Financial services conduct and markets','https://www.fca.org.uk/'],
      ['Prudential Regulation Authority (PRA) / Bank of England','Prudential supervision','https://www.bankofengland.co.uk/prudential-regulation'],
      ['HM Treasury','Financial policy and sanctions policy','https://www.gov.uk/government/organisations/hm-treasury'],
      ['Office of Financial Sanctions Implementation (OFSI)','Financial sanctions implementation','https://www.gov.uk/government/organisations/office-of-financial-sanctions-implementation']
    ],
    'European Union (EU-level)': [
      ['European Commission','EU policy and legislative proposals','https://commission.europa.eu/'],
      ['European Banking Authority (EBA)','Banking and AML/CFT supervisory standards','https://www.eba.europa.eu/'],
      ['European Securities and Markets Authority (ESMA)','Securities and markets','https://www.esma.europa.eu/'],
      ['European Central Bank (ECB)','Euro-area banking supervision and monetary policy','https://www.bankingsupervision.europa.eu/'],
      ['EUR-Lex','Official EU law and legal acts','https://eur-lex.europa.eu/']
    ],
    'India': [
      ['Reserve Bank of India (RBI)','Banking, payments and financial regulation','https://www.rbi.org.in/'],
      ['Securities and Exchange Board of India (SEBI)','Securities markets','https://www.sebi.gov.in/'],
      ['Financial Intelligence Unit–India (FIU-IND)','AML/CFT reporting and financial intelligence','https://fiuindia.gov.in/']
    ],
    'Singapore': [
      ['Monetary Authority of Singapore (MAS)','Integrated financial regulator and central bank','https://www.mas.gov.sg/'],
      ['Singapore Statutes Online','Legislation and subsidiary legislation','https://sso.agc.gov.sg/']
    ],
    'China': [
      ['People’s Bank of China (PBOC)','Central banking and payments','http://www.pbc.gov.cn/'],
      ['National Financial Regulatory Administration (NFRA)','Financial sector supervision','https://www.nfra.gov.cn/'],
      ['China Securities Regulatory Commission (CSRC)','Securities regulation','http://www.csrc.gov.cn/']
    ],
    'Japan': [
      ['Financial Services Agency (JFSA)','Financial supervision and regulation','https://www.fsa.go.jp/en/'],
      ['Bank of Japan','Central banking and financial system','https://www.boj.or.jp/en/']
    ],
    'South Korea': [
      ['Financial Services Commission (FSC)','Financial policy and regulation','https://www.fsc.go.kr/eng/'],
      ['Financial Supervisory Service (FSS)','Financial supervision','https://www.fss.or.kr/eng/']
    ],
    'Australia': [
      ['Australian Prudential Regulation Authority (APRA)','Prudential supervision','https://www.apra.gov.au/'],
      ['Australian Securities and Investments Commission (ASIC)','Financial services and markets','https://asic.gov.au/'],
      ['AUSTRAC','AML/CTF regulator and financial intelligence','https://www.austrac.gov.au/']
    ],
    'Canada': [
      ['Office of the Superintendent of Financial Institutions (OSFI)','Prudential supervision','https://www.osfi-bsif.gc.ca/'],
      ['Financial Transactions and Reports Analysis Centre of Canada (FINTRAC)','AML/ATF and financial intelligence','https://fintrac-canafe.canada.ca/'],
      ['Bank of Canada','Central banking and payment systems','https://www.bankofcanada.ca/']
    ],
    'Malaysia': [
      ['Bank Negara Malaysia (BNM)','Central bank and financial regulation','https://www.bnm.gov.my/'],
      ['Securities Commission Malaysia','Capital markets','https://www.sc.com.my/']
    ],
    'Indonesia': [
      ['Bank Indonesia (BI)','Central banking and payment systems','https://www.bi.go.id/'],
      ['Otoritas Jasa Keuangan (OJK)','Financial services supervision','https://www.ojk.go.id/']
    ],
    'Pakistan': [
      ['State Bank of Pakistan (SBP)','Banking and payments','https://www.sbp.org.pk/'],
      ['Securities and Exchange Commission of Pakistan (SECP)','Securities and corporate regulation','https://www.secp.gov.pk/'],
      ['Financial Monitoring Unit (FMU)','Financial intelligence','https://www.fmu.gov.pk/']
    ],
    'Sri Lanka': [
      ['Central Bank of Sri Lanka','Banking and financial regulation','https://www.cbsl.gov.lk/'],
      ['Financial Intelligence Unit of Sri Lanka','AML/CFT and financial intelligence','https://fiusrilanka.gov.lk/']
    ],
    'United Arab Emirates (federal)': [
      ['Central Bank of the UAE (CBUAE)','Banking, payments and insurance','https://www.centralbank.ae/'],
      ['Securities and Commodities Authority (SCA)','Securities and commodities markets','https://www.sca.gov.ae/'],
      ['UAE Financial Intelligence Unit','Financial intelligence and AML/CFT','https://www.uaefiu.gov.ae/']
    ],
    'Saudi Arabia': [
      ['Saudi Central Bank (SAMA)','Banking, payments and insurance','https://www.sama.gov.sa/'],
      ['Capital Market Authority (CMA)','Capital markets','https://cma.org.sa/']
    ],
    'South Africa': [
      ['South African Reserve Bank (SARB)','Central banking and prudential supervision','https://www.resbank.co.za/'],
      ['Financial Intelligence Centre (FIC)','AML/CFT and financial intelligence','https://www.fic.gov.za/'],
      ['Financial Sector Conduct Authority (FSCA)','Financial services conduct','https://www.fsca.co.za/']
    ],
    'Brazil': [
      ['Banco Central do Brasil','Central banking and financial regulation','https://www.bcb.gov.br/en/'],
      ['Comissão de Valores Mobiliários (CVM)','Securities markets','https://www.gov.br/cvm/en']
    ],
    'Hong Kong': [
      ['Hong Kong Monetary Authority (HKMA)','Banking and monetary stability','https://www.hkma.gov.hk/'],
      ['Securities and Futures Commission (SFC)','Securities and futures markets','https://www.sfc.hk/'],
      ['Hong Kong Customs and Excise Department','AML/CFT for designated non-financial businesses and professions','https://www.customs.gov.hk/']
    ],
    'Global standards and cross-border frameworks': [
      ['FATF','Global AML/CFT/CPF standards; verify domestic implementation separately','https://www.fatf-gafi.org/'],
      ['BIS / Basel Committee on Banking Supervision','Prudential banking standards and guidance','https://www.bis.org/committees/bcbs/overview'],
      ['Financial Stability Board (FSB)','Financial stability policy coordination and recommendations','https://www.fsb.org/'],
      ['CPMI','Payments and financial market infrastructures','https://www.bis.org/committees/cpmi/overview'],
      ['IOSCO','International securities regulation','https://www.iosco.org/'],
      ['IAIS','Insurance supervision standards','https://www.iais.org/'],
      ['APG','Asia/Pacific AML/CFT regional body; not a domestic regulator','https://www.fatf-gafi.org/en/countries/global-network/asia-pacific-group-on-money-laundering--apg-.html'],
      ['Egmont Group','FIU cooperation network; not an FSRB or domestic regulator','https://egmontgroup.org/members-by-region/'],
      ['UN Security Council sanctions','Official sanctions regimes and information','https://main.un.org/securitycouncil/en/sanctions/information'],
      ['IMF','Financial stability surveillance and technical assistance','https://www.imf.org/en/Home'],
      ['World Bank','Financial inclusion, development and policy research','https://www.worldbank.org/ext/en/home'],
      ['OECD','Policy guidance, AI principles and digital economy','https://www.oecd.org/']
    ]
  };
  const bdCirculars = [
    ['2026-09-30','BFIU Circular No. 33','NGO/NPO','Instructions for NGO/NPOs for prevention of ML, TF and PF','https://www.bfiu.org.bd/pdf/circular/aml/sep302026bfiu33b.pdf','Catalogue metadata only; full text not verified'],
    ['2026-09-24','BFIU Circular No. 32','PSP/PSO','Instructions for PSP/PSO for prevention of ML, TF and PF','https://www.bfiu.org.bd/pdf/circular/aml/sep242026bfiu32b.pdf','Catalogue metadata only; full text not verified'],
    ['2026-09-15','BFIU Circular No. 31','Capital-market intermediaries','Instructions for capital market intermediaries for prevention of ML, TF and PF','https://www.bfiu.org.bd/pdf/circular/aml/sep152026bfiu31.pdf','Catalogue metadata only; full text not verified'],
    ['2026-08-18','BFIU Circular No. 30','Money changers','Instructions for money changers to comply with MLPA 2012 and ATA 2009','https://www.bfiu.org.bd/pdf/circular/aml/aug182026bfiu30b.pdf','Catalogue metadata only; full text not verified'],
    ['2026-03-30','BFIU Circular No. 29','Insurance companies and capital market intermediaries','Guidelines on e-KYC for Insurance Companies and CMIs','https://www.bfiu.org.bd/pdf/circular/aml/mar302026bfiu29e.pdf','Partial metadata/indexed text; clause review pending'],
    ['2023-05-30','BFIU Circular No. 28','Financial institutions','Instructions for FIs for prevention of ML, TF and PF','','Full text not reviewed in this pass'],
    ['2022-04-18','BFIU Circular No. 27','Insurance companies','Instructions for insurance companies for prevention of ML, TF and PF','','Full text not reviewed in this pass'],
    ['2020-06-16','BFIU Circular No. 26','Scheduled banks','Instructions for scheduled banks for prevention of ML, TF and PF','https://www.bfiu.org.bd/pdf/circular/aml/jun162020bfiu26.pdf','Partial full-text verification: CTR paragraph 6 and STR paragraph 7 reviewed; later amendments require review'],
    ['2020-01-08','BFIU Circular No. 25','e-KYC — general','Guidelines on Electronic Know Your Customer (e-KYC)','','Full text not reviewed; later sector-specific circular listed separately'],
    ['2019-12-10','BFIU Circular No. 24','Trade-based money laundering / trade finance','Guidelines for Prevention of Trade Based Money Laundering','https://www.bfiu.org.bd/pdf/circular/aml/dec102019bfiu24.pdf','Partial: cover/instruction letter reviewed; underlying guideline and later extension not fully reviewed'],
    ['2019-01-31','BFIU Circular No. 23','Financial institution groups / internal control','Internal control and foreign branches/subsidiaries of financial institution group','','Catalogue metadata only'],
    ['2019-01-31','BFIU Circular No. 22','Information exchange among reporting organisations','Exchange of information among reporting organizations','','Catalogue metadata only'],
    ['2017-09-17','BFIU Circular No. 20','Mobile financial services','Instructions for MFS institutions for prevention of ML, TF and PF','','Catalogue metadata only; later instruments do not alone prove repeal'],
    ['2017-09-17','BFIU Circular No. 19','Scheduled banks','Instructions for scheduled banks for prevention of ML, TF and PF','','Historical sectoral circular; amendment/repeal relationship requires review'],
    ['2015-07-09','BFIU Circular No. 13','DNFBPs / real estate / precious metals / TCSP / legal and accounting professions','Instructions for listed DNFBPs and professions for prevention of ML and TF','','Catalogue metadata only'],
    ['2015-09-02','BFIU Circular No. 14','NGO/NPO','Instructions for NGO/NPOs to comply with MLPA 2012 and ATA 2009','','Historical instrument; supersession relationship requires verification']
  ];
  const bdLetters = [
    ['2026-02-26','BFIU Circular Letter No. 04/2026','Scheduled banks; CTR reporting','Cancellation of BFIU Circular Letter No. 1','https://www.bfiu.org.bd/pdf/circular/aml/feb262026bfiul04.pdf','Partially verified: cancellation/effective date reviewed; full legal history remains open'],
    ['2026-02-05','BFIU Circular Letter No. 02/2026','Scheduled banks; transaction monitoring','Instructions for the Scheduled Banks for the Enforcement of Transaction Monitoring System','https://www.bfiu.org.bd/pdf/circular/aml/feb052026bfiul02.pdf','Catalogue title/date only; PDF text not extracted'],
    ['2026-02-05','BFIU Circular Letter No. 03/2026','MFS; transaction monitoring','Instructions for the MFS for the Enforcement of Transaction Monitoring System','https://www.bfiu.org.bd/pdf/circular/aml/feb052026bfiul03.pdf','Catalogue title/date only; PDF text not extracted'],
    ['2026-08-19','BFIU Circular Letter No. 05/2026','Reporting organisations; accounts related to freezing orders','Reporting of Related Accounts Following BFIU Freezing Order','https://www.bfiu.org.bd/pdf/circular/aml/aug192026bfiul5b.pdf','Catalogue title/date only; PDF text not extracted'],
    ['2026-01-08','BFIU Circular Letter No. 01/2026 — HISTORICAL / CANCELLED','Scheduled banks; CTR reporting','Instructions to be followed by Scheduled Banks regarding submission of Cash Transaction Report (CTR)','https://www.bfiu.org.bd/pdf/circular/aml/jan082026bfiul01.pdf','Superseded/cancelled from 1 Mar 2026 per Letter 04/2026; historical evidence only']
  ];
  const form = root.querySelector('#rcw-form');
  const country = root.querySelector('#rcw-country');
  const authority = root.querySelector('#rcw-authority');
  const instrument = root.querySelector('#rcw-instrument');
  const issueDate = root.querySelector('#rcw-issue-date');
  const referenceDate = root.querySelector('#rcw-reference-date');
  const circularNo = root.querySelector('#rcw-circular-no');
  const sourceUrl = root.querySelector('#rcw-source-url');
  const decision = root.querySelector('#rcw-decision');
  const facts = root.querySelector('#rcw-facts');
  const limitations = root.querySelector('#rcw-limitations');
  const output = root.querySelector('#rcw-output');
  const preview = root.querySelector('#rcw-report-preview');
  const evidenceTable = root.querySelector('#rcw-evidence-list');
  const status = root.querySelector('#rcw-status');
  const allOptions = (el, arr, placeholder) => {
    el.innerHTML = '';
    if (placeholder) { const opt=document.createElement('option'); opt.value=''; opt.textContent=placeholder; el.appendChild(opt); }
    arr.forEach(v=>{const opt=document.createElement('option'); opt.value=v; opt.textContent=v; el.appendChild(opt);});
  };
  allOptions(country, countryNames.slice().sort((a,b)=>a.localeCompare(b)), 'Select a country / jurisdiction');
  const renderAuthorities = () => {
    const list = sources[country.value] || [];
    authority.innerHTML = '';
    const first=document.createElement('option'); first.value=''; first.textContent=list.length?'Select authority / organisation':'No pre-mapped authority — enter or select a source manually'; authority.appendChild(first);
    list.forEach(([name,focus,url])=>{const o=document.createElement('option');o.value=name;o.textContent=name; o.dataset.focus=focus; o.dataset.url=url; authority.appendChild(o);});
    root.querySelector('#rcw-authority-help').textContent = list.length ? 'Choose a listed authority; confirm the actual instrument and applicable legal status at its official source.' : 'The jurisdiction exists in the coverage register, but a verified local authority map is not yet loaded. Do not infer coverage from the country listing alone.';
    renderEvidence();
  };
  const recordArray = () => country.value==='Bangladesh' ? bdCirculars.concat(bdLetters).map(r=>({date:r[0],number:r[1],scope:r[2],title:r[3],url:r[4],verification:r[5]})) : [];
  const renderEvidence = () => {
    const arr=recordArray();
    const q=(root.querySelector('#rcw-record-search').value||'').toLowerCase();
    const filtered=arr.filter(r=>[r.date,r.number,r.scope,r.title,r.verification].join(' ').toLowerCase().includes(q));
    evidenceTable.innerHTML='';
    if(!filtered.length){const tr=document.createElement('tr'); const td=document.createElement('td');td.colSpan=5;td.textContent=arr.length?'No matching records.':'No preloaded instrument register for this jurisdiction. Add the official reference in the form above; coverage listing is not proof of a complete register.';tr.appendChild(td);evidenceTable.appendChild(tr);return;}
    filtered.forEach(r=>{const tr=document.createElement('tr');[r.date,r.number,r.scope,r.verification].forEach(v=>{const td=document.createElement('td');td.textContent=v||'Not stated';tr.appendChild(td);});const td=document.createElement('td');if(r.url){const a=document.createElement('a');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Official document';td.appendChild(a);}else{td.textContent='Catalogue only';}tr.appendChild(td);evidenceTable.appendChild(tr);});
  };
  country.addEventListener('change',renderAuthorities);
  authority.addEventListener('change',()=>{const o=authority.selectedOptions[0]; if(o && o.dataset.url && !sourceUrl.value) sourceUrl.value=o.dataset.url;});
  root.querySelector('#rcw-record-search').addEventListener('input',renderEvidence);
  root.querySelector('#rcw-fill-record').addEventListener('click',()=>{
    const match=recordArray().find(r=>r.number.toLowerCase().includes((root.querySelector('#rcw-record-search').value||'').toLowerCase()) || r.title.toLowerCase().includes((root.querySelector('#rcw-record-search').value||'').toLowerCase()));
    if(!match){status.textContent='Enter a search term matching a Bangladesh record, then select the reference manually.';return;}
    circularNo.value=match.number; issueDate.value=match.date; instrument.value=match.title; sourceUrl.value=match.url||'';
    status.textContent='Loaded register metadata. Review verification status and confirm the original source before relying on it.';
  });
  const val = el => (el.value||'').trim();
  const esc = s => String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function generate(){
    const authorityName=val(authority)||'[Authority not selected]';
    const selectedSource=authority.selectedOptions[0];
    const focus=selectedSource && selectedSource.dataset.focus ? selectedSource.dataset.focus : '';
    const checked=val(referenceDate)||new Date().toISOString().slice(0,10);
    const lines=[
      'REGTECH NEXUS AI — FINTECH REGULATORY DECISION INTELLIGENCE BRIEF',
      'DRAFT — HUMAN REVIEW REQUIRED',
      '',
      'REPORT METADATA',
      'Prepared on: '+new Date().toISOString().slice(0,10),
      'Reference / verification date: '+checked,
      'Jurisdiction: '+(val(country)||'[Not provided]'),
      'Issuing authority / source body: '+authorityName,
      'Instrument type: '+(val(root.querySelector('#rcw-type'))||'[Not provided]'),
      'Circular / reference number: '+(val(circularNo)||'[Not stated / not provided]'),
      'Issue / publication date: '+(val(issueDate)||'[Not provided]'),
      'Effective date: '+(val(root.querySelector('#rcw-effective-date'))||'[Not stated / not provided]'),
      'Instrument title: '+(val(instrument)||'[Not provided]'),
      'Official source URL: '+(val(sourceUrl)||'[Not provided]'),
      '',
      'DECISION OR QUESTION',
      val(decision)||'[Not provided — evidence or input required]',
      '',
      'FACTS / EVIDENCE SUPPLIED',
      val(facts)||'[No evidence supplied]',
      '',
      'AUTHORITY / TOPIC SCOPE',
      focus||'[Confirm the authority’s mandate and applicable scope from official sources.]',
      '',
      'ASSUMPTIONS, LIMITATIONS AND OPEN QUESTIONS',
      val(limitations)||'[No limitations recorded — reviewer must identify missing evidence, legal status, amendments and applicability.]',
      '',
      'EVIDENCE QUALITY GATE',
      '- Confirm the instrument number, title, issue date and effective date against the original official source.',
      '- Confirm whether the instrument is in force, amended, superseded, withdrawn or proposed.',
      '- Separate official catalogue metadata from full-text clause verification.',
      '- Record the exact source URL and the date the source was checked.',
      '- Do not infer that an instrument applies merely because the jurisdiction or regulator appears in the register.',
      '- Treat international standards and recommendations separately from domestic binding law.',
      '',
      'DECISION SUPPORT STATUS',
      'This output structures the supplied information. It does not perform live legal research or independently verify the source. Any analysis and recommendations require human review.',
      '',
      'Published by RegTech Nexus AI — Audit & Regulatory Intelligence',
      'Educational and decision-support resource; not legal advice, regulatory approval or a compliance certification.',
      'Do not enter confidential customer, account, transaction, credential or other restricted banking data into a public-facing form.'
    ];
    const report=lines.join('\n');
    preview.textContent=report;
    output.hidden=false;
    status.textContent='Draft report generated. Use Print / Save as PDF to create the report. Verify every source before reliance.';
    return report;
  }
  form.addEventListener('submit',e=>{e.preventDefault();generate();});
  root.querySelector('#rcw-print').addEventListener('click',()=>{if(output.hidden)generate();window.print();});
  root.querySelector('#rcw-download').addEventListener('click',()=>{
    const report=output.hidden?generate():preview.textContent;
    const blob=new Blob(['\uFEFF',report],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');
    const base=(val(decision)||'fintech-regulatory-brief').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,50)||'fintech-regulatory-brief';
    a.href=url;a.download=base+'.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  renderAuthorities();
})();