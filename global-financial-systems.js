(() => {
  const tabs = [...document.querySelectorAll('.jurisdiction-tab')];
  const panels = [...document.querySelectorAll('.assessment-panel')];
  const storagePrefix = 'regtech-nexus-readiness-';
  const allowedStatuses = new Set(['not-assessed', 'ready', 'partial', 'missing', 'na']);
  const scoreValues = { ready: 1, partial: 0.5, missing: 0, 'not-assessed': 0, na: null };
  const statusLabels = { ready: 'Meets / evidence reported', partial: 'Partially meets', missing: 'Does not meet', 'not-assessed': 'Not assessed', na: 'Not applicable' };

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

  const saveState = (panel) => {
    try {
      localStorage.setItem(`${storagePrefix}${panel.dataset.panel}`, JSON.stringify({
        label: panel.querySelector('[data-field="label"]')?.value || '',
        date: panel.querySelector('[data-field="date"]')?.value || today(),
        statuses: [...panel.querySelectorAll('[data-status]')].map((select) => select.value)
      }));
    } catch (error) { /* Optional local persistence. */ }
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
        if (allowedStatuses.has(saved.statuses?.[index])) select.value = saved.statuses[index];
      });
    } catch (error) { /* Ignore unavailable or malformed local storage. */ }
  };

  const setVisibleStatusLabels = (panel) => {
    panel.querySelectorAll('[data-status] option').forEach((option) => {
      if (statusLabels[option.value]) option.textContent = statusLabels[option.value];
    });
  };

  const riskFor = (row) => {
    if (row.status === 'na') return 'Excluded';
    if (row.status === 'missing') return row.critical ? 'Critical' : 'High';
    if (row.status === 'not-assessed') return row.critical ? 'Critical' : 'Medium';
    if (row.status === 'partial') return row.critical ? 'High' : 'Medium';
    return 'Controlled';
  };

  const readableStatus = (status) => statusLabels[status] || 'Not assessed';

  const clearMatrixResult = (panel) => {
    panel.querySelectorAll('[data-matrix-result]').forEach((item) => { item.textContent = 'Awaiting assessment'; });
    panel.querySelectorAll('[data-matrix-risk]').forEach((item) => { item.textContent = 'Not rated'; item.removeAttribute('data-risk'); });
  };

  const evaluate = (panel) => {
    const rows = [...panel.querySelectorAll('.assessment-item')].map((item, index) => ({
      index,
      item,
      title: item.querySelector('h4')?.textContent.trim() || 'Control area',
      domain: item.dataset.domain || 'Control',
      action: item.dataset.action || 'Assign an owner and document the next review step.',
      status: allowedStatuses.has(item.querySelector('[data-status]')?.value) ? item.querySelector('[data-status]').value : 'not-assessed',
      weight: Number(item.dataset.weight || 1),
      critical: item.dataset.critical === 'true'
    }));
    const applicable = rows.filter((row) => row.status !== 'na');
    const denominator = applicable.reduce((total, row) => total + row.weight, 0);
    const achieved = applicable.reduce((total, row) => total + ((scoreValues[row.status] ?? 0) * row.weight), 0);
    const percentage = denominator ? Math.round((achieved / denominator) * 100) : 100;
    const meets = rows.filter((row) => row.status === 'ready').length;
    const partial = rows.filter((row) => row.status === 'partial').length;
    const openRows = rows.filter((row) => ['not-assessed', 'missing'].includes(row.status));
    const critical = openRows.filter((row) => row.critical).length;
    const matrixRows = [...panel.querySelectorAll('.matrix-row')];
    rows.forEach((row) => {
      const matrix = matrixRows.find((candidate) => Number(candidate.dataset.matrixIndex) === row.index);
      if (!matrix) return;
      const result = matrix.querySelector('[data-matrix-result]');
      const risk = matrix.querySelector('[data-matrix-risk]');
      if (result) result.textContent = readableStatus(row.status);
      if (risk) {
        risk.textContent = riskFor(row);
        risk.dataset.risk = riskFor(row).toLowerCase();
      }
    });
    panel.querySelector('[data-score]').textContent = `${percentage}%`;
    panel.querySelector('[data-progress]').style.width = `${percentage}%`;
    panel.querySelector('[data-count="ready"]').textContent = String(meets);
    panel.querySelector('[data-count="partial"]').textContent = String(partial);
    panel.querySelector('[data-count="open"]').textContent = String(openRows.length);
    panel.querySelector('[data-count="critical"]').textContent = String(critical);
    const title = panel.querySelector('[data-result-title]');
    const message = panel.querySelector('[data-result-message]');
    if (title) title.textContent = critical ? `${critical} critical gap${critical > 1 ? 's' : ''} need attention.` : (openRows.length ? 'Your control-level actions are ready.' : 'All rated controls are covered.');
    if (message) message.textContent = `${meets} control${meets === 1 ? '' : 's'} meet, ${partial} partial and ${openRows.length} open. The matrix shows the reason for each risk label.`;
    const gaps = panel.querySelector('[data-gaps]');
    gaps.replaceChildren();
    if (!openRows.length) {
      const item = document.createElement('li');
      item.className = 'is-good';
      item.textContent = 'No open gaps recorded. Validate the evidence and source version before relying on the result.';
      gaps.append(item);
    } else {
      openRows.forEach((row) => {
        const item = document.createElement('li');
        if (row.critical) item.className = 'is-critical';
        item.textContent = `${row.domain}: ${row.title} · ${riskFor(row)}`;
        gaps.append(item);
      });
    }
    const actions = panel.querySelector('[data-actions]');
    actions.replaceChildren();
    const actionRows = openRows.length ? openRows : rows.filter((row) => row.status === 'partial');
    if (!actionRows.length) {
      const item = document.createElement('li');
      item.className = 'is-good';
      item.textContent = 'Maintain the evidence, review date and accountable owner.';
      actions.append(item);
    } else {
      [...new Map(actionRows.map((row) => [row.action, row])).values()].slice(0, 6).forEach((row) => {
        const item = document.createElement('li');
        item.textContent = row.action;
        actions.append(item);
      });
    }
    return { rows, percentage, meets, partial, openRows, critical };
  };

  const requestAssessment = (panel) => {
    const label = panel.querySelector('[data-field="label"]');
    const date = panel.querySelector('[data-field="date"]');
    const statuses = [...panel.querySelectorAll('[data-status]')];
    const message = panel.querySelector('[data-assessment-message]');
    const incomplete = statuses.filter((select) => select.value === 'not-assessed');
    label?.classList.remove('field-error');
    statuses.forEach((select) => select.classList.remove('field-error'));
    if (!label?.value.trim()) {
      label?.classList.add('field-error');
      message.textContent = 'Add a non-sensitive project label before assessing.';
      label?.focus();
      return;
    }
    if (incomplete.length) {
      incomplete.forEach((select) => select.classList.add('field-error'));
      message.textContent = `Select a status for all ${statuses.length} control areas, then press Assess this matrix.`;
      incomplete[0].focus();
      return;
    }
    if (date && !date.value) date.value = today();
    saveState(panel);
    evaluate(panel);
    panel.querySelector('.assessment-result').hidden = false;
    message.textContent = 'Assessment complete. Review the source-to-control matrix and open actions above.';
    panel.querySelector('.assessment-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetPanel = (panel) => {
    panel.querySelector('[data-field="label"]').value = '';
    panel.querySelector('[data-field="date"]').value = today();
    panel.querySelectorAll('[data-status]').forEach((select) => { select.value = 'not-assessed'; });
    panel.querySelectorAll('[data-status]').forEach((select) => select.classList.remove('field-error'));
    panel.querySelector('[data-assessment-message]').textContent = 'Complete all control statuses, then press Assess this matrix.';
    panel.querySelector('.assessment-result').hidden = true;
    panel.querySelectorAll('[data-matrix-result]').forEach((item) => { item.textContent = 'Awaiting assessment'; });
    panel.querySelectorAll('[data-matrix-risk]').forEach((item) => { item.textContent = 'Not rated'; item.removeAttribute('data-risk'); });
    try { localStorage.removeItem(`${storagePrefix}${panel.dataset.panel}`); } catch (error) { /* Optional persistence. */ }
  };

  const initialisePanel = (panel) => {
    loadState(panel);
    setVisibleStatusLabels(panel);
    panel.querySelectorAll('[data-status], [data-field]').forEach((input) => {
      ['input', 'change'].forEach((eventName) => input.addEventListener(eventName, () => {
        saveState(panel);
        clearMatrixResult(panel);
        panel.querySelector('.assessment-result').hidden = true;
        panel.querySelector('[data-assessment-message]').textContent = 'Changes made. Press Assess this matrix to refresh the result.';
      }));
    });
    panel.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => {
      if (button.dataset.action === 'assess') requestAssessment(panel);
      if (button.dataset.action === 'reset') resetPanel(panel);
    }));
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
