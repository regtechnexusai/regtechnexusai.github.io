(() => {
  const form = document.getElementById('inclusion-canvas-form');
  if (!form) return;

  const dimensions = [
    {id:'access', title:'Reach and practical access', action:'Test the full journey with intended users across device, connectivity, location, support and cash access. Document which users cannot complete a critical task and why.'},
    {id:'affordability', title:'Affordability and transparency', action:'Map total user cost—including fees, data, minimum balances, penalties and currency conversion—and test comprehension with the target group.'},
    {id:'usability', title:'Language, literacy and accessibility', action:'Run accessible task-based usability tests across relevant languages, assistive technologies and digital-literacy levels; prioritise barriers that block completion.'},
    {id:'onboarding', title:'Fair and workable onboarding', action:'Map identity and verification steps against applicable official requirements. Investigate lawful, risk-based alternatives and escalation paths for users who cannot complete standard steps.'},
    {id:'trust', title:'Trust, privacy and informed choice', action:'Review consent and privacy explanations with users. Minimise data collection, clarify sharing and automated decisions, and test whether users understand their choices.'},
    {id:'safety', title:'Fraud prevention and safe recovery', action:'Test scam reporting, account recovery, unauthorised-transaction handling and customer support using synthetic scenarios. Measure response time and successful recovery.'},
    {id:'redress', title:'Complaints and customer redress', action:'Map complaint channels, accessibility, acknowledgement, resolution, appeal and external escalation. Test whether users can track progress and understand the outcome.'},
    {id:'fairness', title:'Fair treatment and outcome gaps', action:'Define a lawful, privacy-preserving approach to checking relevant group-level outcomes. Investigate unexplained disparities in approval, pricing, fraud flags, service and drop-off.'},
    {id:'resilience', title:'Reliability and continuity', action:'Run failure scenarios for outages, weak connectivity, failed transfers and agent downtime. Verify user communication, reconciliation, reversals and recovery ownership.'},
    {id:'impact', title:'Measurable benefit—not just sign-ups', action:'Choose a small set of outcome measures tied to a real customer need, establish a baseline, capture unintended harms and review results after a defined period.'}
  ];
  const statusLabels = {
    'not-assessed':'Not assessed',
    'supported':'Evidence supports',
    'gap':'Gap identified',
    'na':'Not applicable (explanation required)'
  };
  const get = (id) => form.querySelector('#' + id);
  const value = (name) => {
    const el = form.elements.namedItem(name);
    return el ? String(el.value || '').trim() : '';
  };
  const csvCell = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const entries = () => dimensions.map((d) => ({
    ...d,
    status:value('status-' + d.id) || 'not-assessed',
    evidence:value('evidence-' + d.id),
    evidenceRequired: (value('status-' + d.id) === 'supported' || value('status-' + d.id) === 'gap') && !value('evidence-' + d.id),
    explanationRequired: value('status-' + d.id) === 'na' && !value('evidence-' + d.id)
  }));
  const setStatus = (message) => {
    const status = get('inclusion-status');
    if (status) status.textContent = message;
  };

  function render() {
    const records = entries();
    const pending = records.filter(r => r.status === 'gap' || r.status === 'not-assessed' || r.evidenceRequired || r.explanationRequired);
    const gaps = records.filter(r => r.status === 'gap' || r.evidenceRequired);
    const unassessed = records.filter(r => r.status === 'not-assessed');
    const unsupportedNA = records.filter(r => r.explanationRequired);
    const output = get('inclusion-output');
    const list = get('inclusion-actions-list');
    const count = get('inclusion-summary-count');
    const summary = get('inclusion-summary-text');
    if (!output || !list || !count || !summary) return;

    output.hidden = false;
    count.textContent = pending.length + ' follow-up item' + (pending.length === 1 ? '' : 's');
    summary.textContent = (get('inclusion-product').value.trim() || 'This service') +
      ' in ' + (get('inclusion-market').value.trim() || 'the market to be specified') +
      ' is being reviewed for ' + (get('inclusion-users').value.trim() || 'the intended user group') +
      '. ' + gaps.length + ' dimension(s) have a reported gap, ' + unassessed.length +
      ' remain unassessed, and ' + unsupportedNA.length +
      ' not-applicable response(s) need an explanation. This is a work plan, not a validated impact score.';
    list.replaceChildren();

    const renderRows = pending;
    if (!renderRows.length) {
      const p = document.createElement('p');
      p.textContent = 'No gap or unassessed items were selected. Confirm that evidence is current, relevant to the target group and independently reviewable. Revisit the canvas when the service or context changes.';
      list.appendChild(p);
    } else {
      renderRows.forEach((r) => {
        const article = document.createElement('article');
        article.className = 'fih-inclusion-action-row';
        const h = document.createElement('h4');
        h.textContent = r.title + ' — ' + statusLabels[r.status] + (r.evidenceRequired ? ' — EVIDENCE REQUIRED' : '') + (r.explanationRequired ? ' — EXPLANATION REQUIRED' : '');
        const statusP = document.createElement('p');
        statusP.textContent = 'Evidence / notes: ' + (r.evidence || (r.explanationRequired ? 'Explanation required before marking not applicable.' : 'Evidence required before this status can be relied on. Record a source, user observation or test result.'));
        const actionP = document.createElement('p');
        actionP.className = 'fih-inclusion-next';
        actionP.textContent = 'Suggested next step: ' + r.action;
        article.append(h, statusP, actionP);
        list.appendChild(article);
      });
    }
    if (unsupportedNA.length) {
      const note = document.createElement('p');
      note.textContent = 'Important: explain each “not applicable” response in the evidence field before relying on the review.';
      list.appendChild(note);
    }
    setStatus('Action register generated in this browser. Review the proposed follow-up, assign owners and dates in your approved process, and export a copy if needed.');
  }

  function exportCSV() {
    const records = entries();
    const rows = [
      ['Dimension','Status','Evidence / notes','Suggested follow-up'],
      ...records.map(r => [r.title,
        r.evidenceRequired ? statusLabels[r.status] + ' — EVIDENCE REQUIRED' :
        r.explanationRequired ? statusLabels[r.status] + ' — EXPLANATION REQUIRED' : statusLabels[r.status],
        r.evidence,
        (r.status === 'gap' || r.status === 'not-assessed' || r.evidenceRequired || r.explanationRequired) ? r.action : ''])
    ];
    const csv = '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safe = (get('inclusion-product').value.trim() || 'fintech-inclusion-review').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60) || 'fintech-inclusion-review';
    a.href = url;
    a.download = safe + '-inclusion-action-register.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus('CSV export prepared in your browser. Store and share it only through your organisation’s approved process.');
  }

  get('inclusion-generate').addEventListener('click', render);
  get('inclusion-export').addEventListener('click', () => {
    render();
    exportCSV();
  });
  get('inclusion-print').addEventListener('click', () => {
    render();
    window.print();
  });
  form.addEventListener('reset', () => {
    window.setTimeout(() => {
      get('inclusion-output').hidden = true;
      get('inclusion-actions-list').replaceChildren();
      get('inclusion-summary-count').textContent = '';
      get('inclusion-summary-text').textContent = '';
      setStatus('Worksheet reset in this browser. Start by describing the service and reviewing each dimension.');
    }, 0);
  });
})();