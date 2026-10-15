(() => {
  const brief = document.getElementById('phase2-brief-form');
  const readiness = document.getElementById('phase2-readiness-form');
  const caseStudy = document.getElementById('phase2-case');
  if (!brief || !readiness || !caseStudy) return;

  const briefLabels = [
    ['title','Brief title'],['jurisdiction','Country / jurisdiction'],['question','Decision or question to answer'],
    ['problem','Target users and problem'],['evidence','Evidence and primary sources'],['assumptions','Assumptions and limitations'],
    ['risks','Risk / control analysis'],['unknowns','Unresolved questions'],['recommendation','Recommendation and rationale'],
    ['actions','Next actions, owners and dates'],['author','Prepared by / team'],['reviewdate','Review date']
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
    ['inclusion','Inclusion outcomes and accessibility']
  ];
  const statusLabel = {'not-assessed':'Not assessed','evidence':'Evidence recorded','gap':'Gap / action needed','na':'Not applicable — explanation required'};
  const field = (form, name) => {
    const el = form.elements.namedItem(name);
    return el ? String(el.value || '').trim() : '';
  };
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
    const lines = ['FINTECH INTELLIGENCE BRIEF','DRAFT — HUMAN REVIEW REQUIRED',''];
    briefLabels.forEach(([name,label]) => {
      lines.push(label.toUpperCase());
      lines.push(field(brief,name) || '[Not provided — evidence or input required]');
      lines.push('');
    });
    lines.push('QUALITY GATE');
    lines.push('- Verify every factual claim against its original source.');
    lines.push('- Distinguish primary-source facts, analysis, assumptions and unknowns.');
    lines.push('- Confirm jurisdiction, source date, applicability and current legal text.');
    lines.push('- Record a named accountable role, due date and success measure for each action.');
    lines.push('');
    lines.push('Prepared with RegTech Nexus AI FinTech Intelligence Hub. Educational decision support; not legal advice or certification.');
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
    const needsAction = rows.filter(r => r.status === 'not-assessed' || r.status === 'gap' ||
      ((r.status === 'evidence' || r.status === 'gap') && !r.evidence) || (r.status === 'na' && !r.evidence));
    const out = document.getElementById('phase2-readiness-output');
    const summary = document.getElementById('phase2-readiness-summary');
    const list = document.getElementById('phase2-readiness-list');
    out.hidden = false;
    if (!assessed.length && !field(readiness,'product') && !field(readiness,'jurisdiction')) {
      summary.textContent = 'Not yet assessed. Enter the product/service and jurisdiction, then review each control area and record evidence, gaps or an explained not-applicable rationale.';
      list.replaceChildren();
      const p = document.createElement('p');
      p.textContent = 'No assessment findings have been generated because no items have been assessed.';
      list.appendChild(p);
      document.getElementById('phase2-readiness-status').textContent = 'Blank checklist: no findings generated. This tool does not determine legal compliance.';
      return;
    }
    summary.textContent = (field(readiness,'product') || 'Product/service not specified') + ' — ' +
      (field(readiness,'jurisdiction') || 'jurisdiction not specified') + '. ' +
      (assessed.length ? assessed.length + ' of ' + rows.length + ' item(s) assessed; ' : 'No items assessed yet; ') +
      needsAction.length + ' item(s) require assessment, action, evidence or explanation. ' +
      'This is a self-review tracker, not a finding of compliance.';
    list.replaceChildren();
    if (!assessed.length) {
      const p = document.createElement('p');
      p.textContent = 'Not yet assessed. Select a status for each relevant area and document the supporting evidence or rationale.';
      list.appendChild(p);
    } else if (!needsAction.length) {
      const p = document.createElement('p');
      p.textContent = 'No open follow-up was identified by the selected statuses. A qualified reviewer must still validate source currency, legal applicability, evidence quality and approvals.';
      list.appendChild(p);
    } else needsAction.forEach(r => {
      const article = document.createElement('div');
      article.className = 'fih-phase2-action-row';
      const h = document.createElement('h5');
      const issue = (r.status === 'evidence' || r.status === 'gap') && !r.evidence ? ' — EVIDENCE REQUIRED' : (r.status === 'na' && !r.evidence ? ' — EXPLANATION REQUIRED' : '');
      h.textContent = r.label + ' — ' + statusLabel[r.status] + issue;
      const p = document.createElement('p');
      p.textContent = 'Evidence / official source: ' + (r.evidence || 'Not recorded. Add the current official source, evidence or reason before closing this item.');
      const owner = document.createElement('p');
      owner.textContent = 'Owner / due date: ' + (r.owner || 'Assign an accountable role and target date.');
      article.append(h,p,owner);
      list.appendChild(article);
    });
    document.getElementById('phase2-readiness-status').textContent = 'Summary generated. A status is a self-reported assessment only; it does not mean the source was independently verified or an obligation was satisfied.';
  }
  document.getElementById('phase2-readiness-generate').addEventListener('click',renderReadiness);
  document.getElementById('phase2-readiness-export').addEventListener('click',() => {
    renderReadiness();
    const rows = [
      ['Control area','Status','Evidence / official source / rationale','Owner / due date'],
      ...getReadinessRows().map(r => [r.label,
        ((r.status === 'evidence' || r.status === 'gap') && !r.evidence) ? statusLabel[r.status] + ' — EVIDENCE REQUIRED' :
        (r.status === 'na' && !r.evidence) ? statusLabel[r.status] + ' — EXPLANATION REQUIRED' : statusLabel[r.status],
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
    document.getElementById('phase2-readiness-status').textContent = 'Checklist reset. Reconfirm jurisdiction and use current official sources.';
  },0));

  document.getElementById('phase2-case-print').addEventListener('click',() => printOnly('case'));
})();