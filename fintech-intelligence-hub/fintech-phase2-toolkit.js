(() => {
  const brief = document.getElementById('phase2-brief-form');
  const readiness = document.getElementById('phase2-readiness-form');
  const caseStudy = document.getElementById('phase2-case');
  if (!brief || !readiness || !caseStudy) return;

  const briefLabels = [
    ['title','Brief title'],['jurisdiction','Country / jurisdiction'],['question','Decision or question to answer'],
    ['problem','Target users and problem'],['sourceTitle','Primary source title'],['sourceAuthority','Primary source issuing authority'],['sourcePublishedDate','Primary source publication / issue date'],['sourceURL','Exact official document URL'],['sourceProvision','Relevant provision and claim supported'],['evidence','Additional evidence, sources and analysis'],['assumptions','Assumptions and limitations'],
    ['risks','Risk / control analysis'],['unknowns','Unresolved questions'],['recommendation','Recommendation and rationale'],
    ['actions','Next actions, owners, dates and closure evidence'],['sourceStatus','Evidence verification status'],['verifiedDate','Evidence last verified date'],['author','Prepared by / team'],['reviewdate','Review date'],['reviewer','Reviewer role / approval owner'],['approval','Approval status (self-reported)']
  ];
  const readinessItems = [
    ['licensing','Regulatory perimeter and authorisation'],
    ['aml','Customer due diligence and AML/CFT'],
    ['disclosure','Customer disclosure and fair conduct'],
    ['privacy','Privacy, data protection and retention'],
    ['security','Cybersecurity, access and identity'],
    ['fraud','Fraud, scams and disputed transactions'],
    ['complaints','Complaints, redress and consumer rights'],
    ['resilience','Operational resilience and third parties'],
    ['governance','Governance, audit and regulatory reporting'],
    ['inclusion','Inclusion outcomes and accessibility'],
    ['prudential','Product-specific financial and prudential requirements (conditional)'],
    ['technology','Technology, AI and model risk (conditional)']
  ];
  const statusLabel = {'not-assessed':'Not assessed','compliant':'Reported compliant — evidence reviewed by human','partial':'Partially compliant','gap':'Non-compliant / gap — action needed','pending':'Pending evidence','legal':'Legal interpretation required','na':'Not applicable — rationale required'};
  const briefStatusLabel = {'not-checked':'Not checked','source-located':'Source located — document not fully reviewed','text-reviewed':'Primary text reviewed by a human','status-verified':'Current status and applicability checked by a human','legal-review':'Legal interpretation / review required','draft':'Draft — not approved','review':'Pending human review','reviewed':'Review completed — approval recorded separately'};
  const field = (form, name) => {
    const el = form.elements.namedItem(name);
    return el ? String(el.value || '').trim() : '';
  };
  const localDate = () => {
    const d = new Date();
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
  };
  const briefValue = (name) => briefStatusLabel[field(brief,name)] || field(brief,name);
  const csvCell = (v) => '"' + String(v == null ? '' : v).replace(/"/g,'""') + '"';
  const download = (name, type, contents) => {
    const blob = new Blob(['\uFEFF', contents], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const safeName = (v, fallback) => (v || fallback).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,65) || fallback;

  function makeBrief() {
    const evidence = field(brief,'evidence');
    const recommendation = field(brief,'recommendation');
    const lines = ['FINTECH INTELLIGENCE BRIEF','DRAFT — HUMAN REVIEW REQUIRED','Prepared on: '+localDate(),''];
    briefLabels.forEach(([name,label]) => {
      lines.push(label.toUpperCase());
      const value = name === 'assumptions' && !field(brief,name)
        ? 'Limitations not supplied; reviewer assessment required.'
        : (['sourceStatus','approval'].includes(name) ? briefValue(name) : field(brief,name));
      lines.push(value || '[Not provided — evidence or input required]');
      lines.push('');
    });
    lines.push('QUALITY AND GOVERNANCE GATE');
    lines.push('- Verify every material factual claim against the original source and record the supporting passage or evidence reference.');
    lines.push('- Distinguish verified facts, analysis, assumptions, estimates and unknowns.');
    lines.push('- Confirm jurisdiction, instrument scope, publication/effective dates, current status, amendments and applicability where relevant.');
    lines.push('- A URL, source-status selection or user-entered verification date does not independently verify a source.');
    lines.push('- Record an accountable role, due date, deliverable, success measure and closure evidence for each action.');
    lines.push('- Record reviewer comments, unresolved exceptions and approval status; draft preparation is not formal approval.');
    if (!evidence) lines.push('- EVIDENCE GAP: no evidence or primary source was supplied; defer substantive conclusions until evidence is obtained and reviewed.');
    if (!evidence && recommendation) lines.push('- RECOMMENDATION CONTROL: a recommendation is present without supporting evidence; treat it as provisional and defer the decision pending evidence and qualified review.');
    if (field(brief,'sourceStatus') === 'status-verified' && !field(brief,'verifiedDate')) lines.push('- VALIDATION WARNING: current-status verification is selected but no verification date is recorded.');
    if (field(brief,'sourceStatus') === 'not-checked' || !field(brief,'sourceStatus')) lines.push('- SOURCE STATUS: not checked; do not describe sources as verified.');
    const primaryUrl = field(brief,'sourceURL');
    if (!primaryUrl) lines.push('- PRIMARY SOURCE GAP: no exact official document URL was recorded in the structured source record.');
    else {
      try { const u = new URL(primaryUrl); if (!u.pathname || u.pathname === '/') lines.push('- PRIMARY SOURCE WARNING: the URL appears to be a homepage, not the exact instrument; replace it with the specific official document link.'); }
      catch(e) { lines.push('- PRIMARY SOURCE WARNING: the source URL could not be parsed; verify and correct it manually.'); }
    }
    if (field(brief,'sourceStatus') === 'status-verified' && !field(brief,'sourceTitle')) lines.push('- VALIDATION WARNING: current-status verification is selected but the exact source title is missing.');
    lines.push('- If evidence is insufficient, defer the recommendation or explicitly qualify it.');
    lines.push('');
    lines.push('Prepared with RegTech Nexus AI FinTech Intelligence Hub. Educational decision support; not legal advice, certification or regulatory approval.');
    return lines.join('\n');
  }
  function renderBrief() {
    const out = document.getElementById('phase2-brief-output');
    const title = document.getElementById('phase2-brief-preview-title');
    const preview = document.getElementById('phase2-brief-preview');
    title.textContent = field(brief,'title') || 'FinTech Intelligence Brief';
    preview.textContent = makeBrief();
    out.hidden = false;
    document.getElementById('phase2-brief-status').textContent = 'Draft generated. Review evidence, assumptions, unresolved questions and all recommendations before sharing.';
  }
  document.getElementById('phase2-brief-generate').addEventListener('click',renderBrief);
  document.getElementById('phase2-brief-export').addEventListener('click',() => {
    renderBrief();
    download(safeName(field(brief,'title'),'fintech-intelligence-brief')+'.txt','text/plain;charset=utf-8',makeBrief());
    document.getElementById('phase2-brief-status').textContent = 'Text export prepared in your browser. Review and store the file securely.';
  });
  const printOnly = (which) => { document.body.setAttribute('data-phase2-print',which); window.addEventListener('afterprint',() => document.body.removeAttribute('data-phase2-print'),{once:true}); window.print(); };
  document.getElementById('phase2-brief-print').addEventListener('click',() => { renderBrief(); printOnly('brief'); });
  brief.addEventListener('reset',() => window.setTimeout(() => {
    document.getElementById('phase2-brief-output').hidden = true;
    document.getElementById('phase2-brief-preview').textContent = '';
    document.getElementById('phase2-brief-status').textContent = 'Fields reset. Enter only information you are authorised to use.';
  },0));

  function getReadinessRows() {
    return readinessItems.map(([id,label]) => ({
      id,label,
      status:field(readiness,'status-'+id) || 'not-assessed',
      evidence:field(readiness,'evidence-'+id),
      owner:field(readiness,'owner-'+id)
    }));
  }
  function renderReadiness() {
    const rows = getReadinessRows();
    const assessed = rows.filter(r => r.status !== 'not-assessed');
    const reviewerRecorded = Boolean(field(readiness,'reviewer'));
    const isClosed = r => Boolean(reviewerRecorded) && ((r.status === 'compliant' && Boolean(r.evidence)) || (r.status === 'na' && Boolean(r.evidence)));
    const needsAction = rows.filter(r => !isClosed(r));
    const compliantCount = rows.filter(r => r.status === 'compliant').length;
    const partialCount = rows.filter(r => r.status === 'partial').length;
    const gapCount = rows.filter(r => r.status === 'gap').length;
    const pendingCount = rows.filter(r => r.status === 'pending').length;
    const legalCount = rows.filter(r => r.status === 'legal').length;
    const naCount = rows.filter(r => r.status === 'na').length;
    const licensing = rows.find(r => r.id === 'licensing');
    const licensingOpen = licensing && !isClosed(licensing);
    const out = document.getElementById('phase2-readiness-output');
    const summary = document.getElementById('phase2-readiness-summary');
    const list = document.getElementById('phase2-readiness-list');
    out.hidden = false;
    if (!assessed.length && !field(readiness,'product') && !field(readiness,'jurisdiction')) {
      summary.textContent = 'Not yet assessed. Enter the product/service and jurisdiction, then review each relevant control area and record evidence, gaps or a reasoned not-applicable rationale. No readiness rating or compliance determination is generated.';
      list.replaceChildren();
      const p = document.createElement('p');
      p.textContent = 'No assessment findings have been generated because no items have been assessed.';
      list.appendChild(p);
      document.getElementById('phase2-readiness-status').textContent = 'Blank checklist: no findings generated. This tool does not determine legal compliance.';
      return;
    }
    const contextGaps = [];
    if (!field(readiness,'product')) contextGaps.push('product/service not specified');
    if (!field(readiness,'jurisdiction')) contextGaps.push('jurisdiction not specified');
    summary.textContent = (field(readiness,'product') || 'Product/service not specified') + ' — ' +
      (field(readiness,'jurisdiction') || 'jurisdiction not specified') + '. ' +
      (contextGaps.length ? 'ASSESSMENT BLOCKER: ' + contextGaps.join(' and ') + '; do not treat this as a scoped assessment. ' : '') +
      (assessed.length ? assessed.length + ' of ' + rows.length + ' item(s) assessed. ' : 'No items assessed yet. ') +
      'Reported compliant: ' + compliantCount + '; partially compliant: ' + partialCount + '; gaps: ' + gapCount + '; pending evidence: ' + pendingCount + '; legal interpretation required: ' + legalCount + '; not applicable: ' + naCount + '. ' +
      needsAction.length + ' item(s) remain open because of status, missing evidence/rationale or missing reviewer confirmation. ' +
      (licensingOpen ? 'CRITICAL GATE: regulatory perimeter / authorisation is not closed; do not treat the product as launch-ready. ' : '') +
      'This is a self-review tracker, not a readiness score, compliance finding or regulatory approval.';
    list.replaceChildren();
    if (!assessed.length) {
      const p = document.createElement('p');
      p.textContent = 'Not yet assessed. Select a status for each relevant area and document supporting evidence, a gap or an explained not-applicable rationale.';
      list.appendChild(p);
    } else if (!needsAction.length) {
      const p = document.createElement('p');
      p.textContent = 'No open follow-up was identified by the selected statuses. This does not establish compliance: a qualified reviewer must still confirm original sources, legal applicability, control effectiveness, approval and critical launch conditions.';
      list.appendChild(p);
    } else needsAction.forEach(r => {
      const article = document.createElement('div');
      article.className = 'fih-phase2-action-row';
      const h = document.createElement('h5');
      let issue = '';
      if (r.status === 'compliant' && !r.evidence) issue = ' — EVIDENCE REQUIRED BEFORE CLOSURE';
      else if (r.status === 'compliant' && !reviewerRecorded) issue = ' — REVIEWER ROLE REQUIRED';
      else if (r.status === 'na' && !r.evidence) issue = ' — APPLICABILITY RATIONALE REQUIRED';
      else if ((r.status === 'na' || r.status === 'compliant') && !reviewerRecorded) issue = ' — REVIEWER ROLE REQUIRED';
      else if (r.status === 'not-assessed') issue = ' — ASSESSMENT REQUIRED';
      h.textContent = r.label + ' — ' + (statusLabel[r.status] || 'Status not recognised') + issue;
      const p = document.createElement('p');
      p.textContent = 'Evidence / official source / rationale: ' + (r.evidence || 'Not recorded. Add the current official source, relevant provision, evidence or reason before closing this item.');
      const owner = document.createElement('p');
      owner.textContent = 'Owner / due date: ' + (r.owner || (['partial','gap','pending','legal','not-assessed'].includes(r.status) ? 'Assign an accountable role and target date.' : 'Not recorded.'));
      article.append(h,p,owner);
      list.appendChild(article);
    });
    document.getElementById('phase2-readiness-status').textContent = 'Summary generated. Statuses and evidence are self-reported; this tool does not verify source currency, legal applicability or control effectiveness.';
  }
  document.getElementById('phase2-readiness-generate').addEventListener('click',renderReadiness);
  document.getElementById('phase2-readiness-export').addEventListener('click',() => {
    renderReadiness();
    const rows = [
      ['Assessment metadata','Value'],
      ['Product / service',field(readiness,'product')],['Jurisdiction(s)',field(readiness,'jurisdiction')],
      ['Review date',field(readiness,'date')],['Review owner / team',field(readiness,'owner')],
      ['Independent reviewer / verification role',field(readiness,'reviewer')],['Next review due',field(readiness,'nextReviewDate')],
      ['Important limitation','Statuses and evidence are user-entered; this export does not independently verify legal requirements or establish compliance.'],
      [],['Control area','Status','Evidence / official source / rationale','Owner / due date'],
      ...getReadinessRows().map(r => [r.label,
        (r.status === 'compliant' && (!r.evidence || !field(readiness,'reviewer'))) ? statusLabel[r.status] + ' — EVIDENCE / REVIEWER REQUIRED' :
        (r.status === 'na' && !r.evidence) ? statusLabel[r.status] + ' — RATIONALE REQUIRED' : (statusLabel[r.status] || 'Status not recognised'),
        r.evidence,r.owner])
    ];
    download(safeName(field(readiness,'product'),'regulatory-readiness')+'-readiness-checklist.csv','text/csv;charset=utf-8',rows.map(row=>row.map(csvCell).join(',')).join('\r\n'));
    document.getElementById('phase2-readiness-status').textContent = 'CSV export prepared in your browser. Store and share only through an approved process.';
  });
  document.getElementById('phase2-readiness-print').addEventListener('click',() => { renderReadiness(); printOnly('readiness'); });
  readiness.addEventListener('reset',() => window.setTimeout(() => {
    document.getElementById('phase2-readiness-output').hidden = true;
    document.getElementById('phase2-readiness-summary').textContent = '';
    document.getElementById('phase2-readiness-list').replaceChildren();
    document.getElementById('phase2-readiness-status').textContent = 'Checklist reset. Reconfirm jurisdiction, reviewer role and current official sources.';
  },0));

  document.getElementById('phase2-case-print').addEventListener('click',() => printOnly('case'));
})();