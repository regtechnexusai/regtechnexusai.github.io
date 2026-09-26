(() => {
  const tabs = [...document.querySelectorAll('.jurisdiction-tab')];
  const panels = [...document.querySelectorAll('.assessment-panel')];
  const storagePrefix = 'regtech-nexus-readiness-';
  const statusValues = new Set(['not-assessed', 'ready', 'partial', 'missing', 'na']);
  const scoreValues = { ready: 1, partial: 0.5, missing: 0, 'not-assessed': 0, na: null };

  const today = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  };

  const showPanel = (name, updateHash = true) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.jurisdiction === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      const active = panel.dataset.panel === name;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
    if (updateHash) history.replaceState(null, '', `#${name}`);
  };

  const getState = (panel) => ({
    label: panel.querySelector('[data-field="label"]')?.value || '',
    date: panel.querySelector('[data-field="date"]')?.value || today(),
    statuses: [...panel.querySelectorAll('[data-status]')].map((select) => statusValues.has(select.value) ? select.value : 'not-assessed')
  });

  const saveState = (panel) => {
    try { localStorage.setItem(`${storagePrefix}${panel.dataset.panel}`, JSON.stringify(getState(panel))); } catch (error) { /* Local persistence is optional. */ }
  };

  const loadState = (panel) => {
    const dateInput = panel.querySelector('[data-field="date"]');
    if (dateInput && !dateInput.value) dateInput.value = today();
    try {
      const saved = JSON.parse(localStorage.getItem(`${storagePrefix}${panel.dataset.panel}`) || 'null');
      if (!saved) return;
      const labelInput = panel.querySelector('[data-field="label"]');
      if (labelInput && typeof saved.label === 'string') labelInput.value = saved.label;
      if (dateInput && typeof saved.date === 'string') dateInput.value = saved.date;
      panel.querySelectorAll('[data-status]').forEach((select, index) => {
        if (statusValues.has(saved.statuses?.[index])) select.value = saved.statuses[index];
      });
    } catch (error) { /* Ignore unavailable or malformed local storage. */ }
  };

  const listItem = (text, tone = '') => {
    const item = document.createElement('li');
    if (tone) item.className = tone;
    item.textContent = text;
    return item;
  };

  const evaluate = (panel) => {
    const items = [...panel.querySelectorAll('.assessment-item')];
    const rows = items.map((item) => ({
      item,
      title: item.querySelector('h4')?.textContent.trim() || 'Control area',
      domain: item.dataset.domain || 'Control',
      action: item.dataset.action || 'Assign an owner and document the next review step.',
      status: item.querySelector('[data-status]')?.value || 'not-assessed',
      weight: Number(item.dataset.weight || 1),
      critical: item.dataset.critical === 'true'
    }));
    const applicable = rows.filter((row) => row.status !== 'na');
    const denominator = applicable.reduce((total, row) => total + row.weight, 0);
    const achieved = applicable.reduce((total, row) => total + ((scoreValues[row.status] ?? 0) * row.weight), 0);
    const percentage = denominator ? Math.round((achieved / denominator) * 100) : 100;
    const ready = rows.filter((row) => row.status === 'ready').length;
    const partial = rows.filter((row) => row.status === 'partial').length;
    const openRows = rows.filter((row) => ['not-assessed', 'missing'].includes(row.status));
    const critical = openRows.filter((row) => row.critical).length;
    const gaps = panel.querySelector('[data-gaps]');
    const actions = panel.querySelector('[data-actions]');
    const score = panel.querySelector('[data-score]');
    const progress = panel.querySelector('[data-progress]');
    const resultTitle = panel.querySelector('[data-result-title]');
    const resultMessage = panel.querySelector('[data-result-message]');
    if (score) score.textContent = `${percentage}%`;
    if (progress) progress.style.width = `${percentage}%`;
    panel.querySelector('[data-count="ready"]')?.replaceChildren(String(ready));
    panel.querySelector('[data-count="partial"]')?.replaceChildren(String(partial));
    panel.querySelector('[data-count="open"]')?.replaceChildren(String(openRows.length));
    panel.querySelector('[data-count="critical"]')?.replaceChildren(String(critical));
    if (resultTitle) resultTitle.textContent = critical ? `${critical} critical gap${critical > 1 ? 's' : ''} need attention.` : (openRows.length ? 'Your next actions are ready.' : 'All rated controls are covered.');
    if (resultMessage) resultMessage.textContent = openRows.length ? `${ready} ready, ${partial} partial and ${openRows.length} open control area${openRows.length > 1 ? 's' : ''}.` : 'Every applicable control is marked ready. Validate the evidence with an authorised reviewer.';
    if (gaps) {
      gaps.replaceChildren();
      if (!openRows.length) gaps.append(listItem('No open gaps recorded. Validate the evidence and source version before relying on the result.', 'is-good'));
      openRows.forEach((row) => gaps.append(listItem(`${row.domain}: ${row.title}${row.critical ? ' · critical' : ''}`, row.critical ? 'is-critical' : '')));
    }
    if (actions) {
      actions.replaceChildren();
      const actionRows = openRows.length ? openRows : rows.filter((row) => row.status === 'partial');
      if (!actionRows.length) actions.append(listItem('Maintain the evidence, review date and accountable owner.', 'is-good'));
      [...new Map(actionRows.map((row) => [row.action, row])).values()].slice(0, 6).forEach((row) => actions.append(listItem(row.action)));
    }
    rows.forEach((row) => row.item.dataset.status = row.status);
    return { rows, percentage, ready, partial, openRows, critical };
  };

  const reportText = (panel, result) => {
    const label = panel.querySelector('[data-field="label"]')?.value.trim() || 'Unnamed review';
    const date = panel.querySelector('[data-field="date"]')?.value || today();
    const title = panel.dataset.title || panel.dataset.panel;
    const lines = [
      'REGTECH NEXUS AI · INTERNATIONAL READINESS SNAPSHOT',
      'Independent browser-based review aid — not a regulatory conclusion',
      '',
      `Assessment: ${title}`,
      `Project label: ${label}`,
      `Assessment date: ${date}`,
      `Indicative evidence readiness: ${result.percentage}%`,
      `Ready: ${result.ready} | Partial: ${result.partial} | Open: ${result.openRows.length} | Critical gaps: ${result.critical}`,
      '',
      'CONTROL RESULTS'
    ];
    result.rows.forEach((row, index) => lines.push(`${String(index + 1).padStart(2, '0')}. ${row.title} — ${row.status.replace('-', ' ')}`));
    lines.push('', 'PRIORITY GAPS');
    if (result.openRows.length) result.openRows.forEach((row) => lines.push(`- ${row.domain}: ${row.title}${row.critical ? ' [critical]' : ''}`));
    else lines.push('- No open gaps recorded.');
    lines.push('', 'NEXT ACTIONS');
    const actionRows = result.openRows.length ? result.openRows : result.rows.filter((row) => row.status === 'partial');
    if (actionRows.length) [...new Map(actionRows.map((row) => [row.action, row])).values()].slice(0, 6).forEach((row) => lines.push(`- ${row.action}`));
    else lines.push('- Maintain evidence, review date and accountable owner.');
    lines.push('', 'BOUNDARY', 'Do not treat this output as legal advice, compliance certification, filing instruction or regulator approval.', 'Do not enter or share customer, transaction, personal or confidential data in the public tool.', 'Verify current primary sources and obtain qualified human review before relying on any result.');
    return lines.join('\n');
  };

  const downloadReport = (panel, result) => {
    const blob = new Blob([reportText(panel, result)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = panel.querySelector('[data-field="date"]')?.value || today();
    link.href = url;
    link.download = `${panel.dataset.panel}-readiness-summary-${date}.txt`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const resetPanel = (panel) => {
    panel.querySelector('[data-field="label"]').value = '';
    panel.querySelector('[data-field="date"]').value = today();
    panel.querySelectorAll('[data-status]').forEach((select) => { select.value = 'not-assessed'; });
    try { localStorage.removeItem(`${storagePrefix}${panel.dataset.panel}`); } catch (error) { /* Optional persistence. */ }
    evaluate(panel);
  };

  const initialisePanel = (panel) => {
    loadState(panel);
    panel.querySelectorAll('[data-status], [data-field]').forEach((input) => input.addEventListener('input', () => { saveState(panel); evaluate(panel); }));
    panel.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => {
      const result = evaluate(panel);
      if (button.dataset.action === 'download') downloadReport(panel, result);
      if (button.dataset.action === 'print') window.print();
      if (button.dataset.action === 'reset') resetPanel(panel);
    }));
    evaluate(panel);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => showPanel(tab.dataset.jurisdiction));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      showPanel(tabs[next].dataset.jurisdiction);
    });
  });

  panels.forEach(initialisePanel);
  const requested = window.location.hash.slice(1);
  if (['singapore', 'dubai', 'australia'].includes(requested)) {
    showPanel(requested, false);
    window.setTimeout(() => document.getElementById(`panel-${requested}`)?.scrollIntoView({ block: 'start' }), 0);
  }
})();
