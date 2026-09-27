(() => {
  const tabs = [...document.querySelectorAll('.jurisdiction-tab')];
  const panels = [...document.querySelectorAll('.assessment-panel')];
  const storagePrefix = 'regtech-nexus-signal-lab-';
  const allowedStatuses = new Set(['not-assessed', 'ready', 'partial', 'missing', 'na']);
  const scoreValues = { ready: 1, partial: 0.5, missing: 0, 'not-assessed': 0, na: null };
  const statusLabels = { ready: 'Meets / evidence reported', partial: 'Partially meets', missing: 'Does not meet', 'not-assessed': 'Not assessed', na: 'Not applicable' };
  const modelConfig = {
    's-trace': { id: 'RNX-SIG-SG-01', tracks: { ai: 'AI evidence', aml: 'AML/CFT evidence', cosmic: 'Information-sharing' } },
    'u-perimeter': { id: 'RNX-SIG-UAE-01', tracks: { perimeter: 'Regulatory route', aml: 'AML/CFT', va: 'Virtual-asset risk', tbml: 'TBML', token: 'Token/service controls', reporting: 'Reporting' } },
    'a-resolve': { id: 'RNX-SIG-AU-01', tracks: { aml: 'AML/CTF lane', resilience: 'Resilience lane' } }
  };
  const sampleCases = {
    singapore: { label: 'Synthetic RNX-SIG-SG-01 control case', statuses: ['ready', 'partial', 'partial', 'missing', 'partial', 'ready'] },
    dubai: { label: 'Synthetic RNX-SIG-UAE-01 mainland virtual-asset case', route: 'mainland', statuses: ['ready', 'partial', 'partial', 'missing', 'partial', 'ready'] },
    australia: { label: 'Synthetic RNX-SIG-AU-01 AML and resilience case', statuses: ['ready', 'partial', 'missing', 'ready', 'partial', 'missing'] }
  };

  const today = () => {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  };

  const configFor = (panel) => modelConfig[panel.dataset.model] || modelConfig['s-trace'];

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
        route: panel.querySelector('[data-field="route"]')?.value || '',
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
      const routeInput = panel.querySelector('[data-field="route"]');
      if (labelInput && typeof saved.label === 'string') labelInput.value = saved.label;
      if (dateInput && typeof saved.date === 'string') dateInput.value = saved.date;
      if (routeInput && typeof saved.route === 'string') routeInput.value = saved.route;
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
    const trackScores = panel.querySelector('[data-track-scores]');
    if (trackScores) trackScores.replaceChildren();
    const exportActions = panel.querySelector('[data-export-actions]');
    if (exportActions) exportActions.hidden = true;
    const score = panel.querySelector('[data-score]');
    if (score) score.textContent = '—';
    const progress = panel.querySelector('[data-progress]');
    if (progress) progress.style.width = '0%';
  };

  const weightedCoverage = (rows) => {
    const applicable = rows.filter((row) => row.status !== 'na');
    const denominator = applicable.reduce((total, row) => total + row.weight, 0);
    const achieved = applicable.reduce((total, row) => total + ((scoreValues[row.status] ?? 0) * row.weight), 0);
    return { applicable, denominator, achieved, percentage: denominator ? Math.round((achieved / denominator) * 100) : null };
  };

  const gateFor = (rows, panel) => {
    if (panel.dataset.model === 'u-perimeter') {
      const route = panel.querySelector('[data-field="route"]')?.value || '';
      if (!['mainland', 'difc'].includes(route)) return { code: 'ROUTE FIRST', tone: 'route', reason: 'Select Mainland / VARA or DIFC / DFSA before relying on the UAE signal.' };
    }
    const { applicable } = weightedCoverage(rows);
    if (!applicable.length) return { code: 'NOT IN SCOPE', tone: 'excluded', reason: 'Every control was marked Not applicable. Confirm the perimeter before relying on this result.' };
    if (applicable.some((row) => row.critical && ['missing', 'not-assessed'].includes(row.status))) return { code: 'BLOCKED', tone: 'critical', reason: 'At least one critical control is open. Escalate and remediate before relying on the process.' };
    if (applicable.some((row) => row.critical && row.status === 'partial')) return { code: 'CONDITIONAL', tone: 'high', reason: 'A critical control is only partially evidenced. Assign an owner and target date.' };
    if (applicable.some((row) => ['missing', 'not-assessed'].includes(row.status))) return { code: 'REMEDIATE', tone: 'medium', reason: 'An open control remains. Add evidence and review the control design.' };
    if (applicable.some((row) => row.status === 'partial')) return { code: 'CONDITIONAL', tone: 'high', reason: 'Partial evidence remains. Strengthen the evidence before relying on the process.' };
    return { code: 'REVIEWABLE', tone: 'controlled', reason: 'All applicable critical controls are evidenced and no open control remains. Validate evidence quality and source version.' };
  };

  const laneSignal = (rows) => {
    const { applicable } = weightedCoverage(rows);
    if (!applicable.length) return 'NOT IN SCOPE';
    if (applicable.some((row) => row.critical && ['missing', 'not-assessed'].includes(row.status))) return 'BLOCKED';
    if (applicable.some((row) => row.critical && row.status === 'partial')) return 'CONDITIONAL';
    if (applicable.some((row) => ['missing', 'not-assessed'].includes(row.status))) return 'REMEDIATE';
    if (applicable.some((row) => row.status === 'partial')) return 'CONDITIONAL';
    return 'REVIEWABLE';
  };

  const renderLaneScores = (panel, rows) => {
    let container = panel.querySelector('[data-track-scores]');
    if (!container) {
      container = document.createElement('div');
      container.className = 'track-scores';
      container.dataset.trackScores = '';
      panel.querySelector('[data-progress]')?.closest('.assessment-progress')?.after(container);
    }
    container.replaceChildren();
    const config = configFor(panel);
    Object.entries(config.tracks).forEach(([track, label]) => {
      const trackRows = rows.filter((row) => row.track === track);
      const coverage = weightedCoverage(trackRows);
      const signal = laneSignal(trackRows);
      const card = document.createElement('div');
      card.className = 'track-score-card';
      const heading = document.createElement('strong');
      heading.textContent = label;
      const coverageText = document.createElement('span');
      coverageText.textContent = coverage.percentage === null ? 'N/A coverage' : `${coverage.percentage}% coverage`;
      const signalText = document.createElement('em');
      signalText.textContent = signal;
      signalText.dataset.signal = signal.toLowerCase().replaceAll(' ', '-');
      const count = document.createElement('small');
      count.textContent = `${coverage.applicable.length}/${trackRows.length} applicable controls`;
      card.append(heading, coverageText, signalText, count);
      container.append(card);
    });
  };

  const exportSnapshot = (panel) => {
    const config = configFor(panel);
    const label = panel.querySelector('[data-field="label"]')?.value.trim() || 'Untitled assessment';
    const date = panel.querySelector('[data-field="date"]')?.value || today();
    const route = panel.querySelector('[data-field="route"]')?.value || 'Not specified';
    const rows = [...panel.querySelectorAll('.assessment-item')].map((item, index) => {
      const matrix = panel.querySelector('.matrix-row[data-matrix-index="' + index + '"]');
      const status = allowedStatuses.has(item.querySelector('[data-status]')?.value) ? item.querySelector('[data-status]').value : 'not-assessed';
      const critical = item.dataset.critical === 'true';
      return {
        track: config.tracks[item.dataset.track] || item.dataset.track || 'Control',
        source: matrix?.querySelector('div:first-child b')?.textContent.trim() || 'Source row',
        control: item.querySelector('h4')?.textContent.trim() || 'Control area',
        evidence: item.querySelector('p')?.textContent.trim() || '',
        status: readableStatus(status),
        risk: riskFor({ status, critical }),
        weight: item.dataset.weight || '1',
        critical: critical ? 'Yes' : 'No',
        action: item.dataset.action || ''
      };
    });
    return {
      moduleId: config.id,
      country: panel.dataset.panel,
      label,
      date,
      route,
      decision: panel.querySelector('[data-result-title]')?.textContent.trim() || 'Assessment result',
      coverage: panel.querySelector('[data-score]')?.textContent.trim() || 'N/A',
      rows
    };
  };

  const csvEscape = (value) => '"' + String(value ?? '').replace(/"/g, '""') + '"';

  const buildCsv = (snapshot) => {
    const headings = ['module_id', 'country', 'project_label', 'assessment_date', 'route', 'decision_signal', 'coverage', 'lane', 'source', 'control', 'evidence_status', 'risk', 'weight', 'critical', 'next_action'];
    const lines = [headings, ...snapshot.rows.map((row) => [
      snapshot.moduleId, snapshot.country, snapshot.label, snapshot.date, snapshot.route,
      snapshot.decision, snapshot.coverage, row.track, row.source, row.control,
      row.status, row.risk, row.weight, row.critical, row.action
    ])];
    return '\ufeff' + lines.map((line) => line.map(csvEscape).join(',')).join('\r\n');
  };

  const reportText = (snapshot) => {
    const lines = [
      'RegTech Nexus AI — Regulatory Signal Lab',
      'Module: ' + snapshot.moduleId,
      'Country: ' + snapshot.country,
      'Project: ' + snapshot.label,
      'Assessment date: ' + snapshot.date,
      'Route: ' + snapshot.route,
      'Decision signal: ' + snapshot.decision,
      'Weighted evidence coverage: ' + snapshot.coverage,
      '',
      'CONTROL RESULTS'
    ];
    snapshot.rows.forEach((row, index) => {
      lines.push((index + 1) + '. ' + row.control + ' | ' + row.status + ' | ' + row.risk + ' | ' + row.track);
      lines.push('   Source: ' + row.source);
      lines.push('   Next action: ' + row.action);
    });
    lines.push('', 'Independent browser-based review support only. Not a regulatory conclusion or certification.');
    return lines.join('\n');
  };

  const fileStem = (snapshot) => (snapshot.moduleId + '-' + snapshot.label).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 90) || 'regulatory-signal-result';

  const downloadFile = (content, fileName, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const pdfSafe = (value) => String(value ?? '').normalize('NFKD').replace(/[^\x20-\x7E]/g, '?');
  const pdfEscape = (value) => pdfSafe(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const wrapPdfLine = (value, width = 88) => {
    const text = pdfSafe(value);
    const parts = [];
    for (let i = 0; i < text.length; i += width) parts.push(text.slice(i, i + width));
    return parts.length ? parts : [''];
  };

  const buildPdf = (snapshot) => {
    const lines = [];
    reportText(snapshot).split('\n').forEach((line) => wrapPdfLine(line).forEach((wrapped) => lines.push(wrapped)));
    const stream = 'BT\n/F1 10 Tf\n50 760 Td\n14 TL\n' + lines.map((line) => '(' + pdfEscape(line) + ') Tj\nT*\n').join('') + 'ET';
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
      '<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((object, index) => {
      offsets.push(pdf.length);
      pdf += (index + 1) + ' 0 obj\n' + object + '\nendobj\n';
    });
    const xrefOffset = pdf.length;
    pdf += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
    offsets.slice(1).forEach((offset) => { pdf += String(offset).padStart(10, '0') + ' 00000 n \n'; });
    pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xrefOffset + '\n%%EOF';
    return pdf;
  };

  const handleExport = (panel, type) => {
    const snapshot = exportSnapshot(panel);
    const stem = fileStem(snapshot);
    if (type === 'csv') downloadFile(buildCsv(snapshot), stem + '.csv', 'text/csv;charset=utf-8');
    if (type === 'pdf') downloadFile(buildPdf(snapshot), stem + '.pdf', 'application/pdf');
    if (type === 'eml') downloadFile('X-Unsent: 1\r\nSubject: ' + snapshot.moduleId + ' assessment result\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset="UTF-8"\r\n\r\n' + reportText(snapshot), stem + '.eml', 'message/rfc822');
    if (type === 'email') window.location.href = 'mailto:?subject=' + encodeURIComponent(snapshot.moduleId + ' assessment result') + '&body=' + encodeURIComponent(reportText(snapshot));
    if (type === 'print') window.print();
  };

  const evaluate = (panel) => {
    const rows = [...panel.querySelectorAll('.assessment-item')].map((item, index) => ({
      index,
      item,
      title: item.querySelector('h4')?.textContent.trim() || 'Control area',
      domain: item.dataset.domain || 'Control',
      track: item.dataset.track || 'general',
      action: item.dataset.action || 'Assign an owner and document the next review step.',
      status: allowedStatuses.has(item.querySelector('[data-status]')?.value) ? item.querySelector('[data-status]').value : 'not-assessed',
      weight: Number(item.dataset.weight || 1),
      critical: item.dataset.critical === 'true'
    }));
    const coverage = weightedCoverage(rows);
    const gate = gateFor(rows, panel);
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
        const riskLabel = riskFor(row);
        risk.textContent = riskLabel;
        risk.dataset.risk = riskLabel.toLowerCase();
      }
    });
    const score = panel.querySelector('[data-score]');
    if (score) score.textContent = coverage.percentage === null ? 'N/A' : `${coverage.percentage}%`;
    const scoreLabel = panel.querySelector('.score-display span');
    if (scoreLabel) scoreLabel.textContent = 'weighted evidence coverage';
    const progress = panel.querySelector('[data-progress]');
    if (progress) progress.style.width = `${coverage.percentage ?? 0}%`;
    panel.querySelector('[data-count="ready"]').textContent = String(meets);
    panel.querySelector('[data-count="partial"]').textContent = String(partial);
    panel.querySelector('[data-count="open"]').textContent = String(openRows.length);
    panel.querySelector('[data-count="critical"]').textContent = String(critical);
    const title = panel.querySelector('[data-result-title]');
    const message = panel.querySelector('[data-result-message]');
    const config = configFor(panel);
    if (title) title.textContent = `${config.id} signal · ${gate.code}`;
    if (message) message.textContent = `${gate.reason} ${meets} control${meets === 1 ? '' : 's'} meet, ${partial} partial and ${openRows.length} open. Lane coverage is supporting context, not a legal conclusion.`;
    renderLaneScores(panel, rows);
    const exportActions = panel.querySelector('[data-export-actions]');
    if (exportActions) exportActions.hidden = false;
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
    return { rows, coverage, gate, meets, partial, openRows, critical };
  };

  const loadSampleCase = (panel, name) => {
    const sample = sampleCases[name];
    if (!sample) return;
    const label = panel.querySelector('[data-field="label"]');
    const date = panel.querySelector('[data-field="date"]');
    const route = panel.querySelector('[data-field="route"]');
    if (label) label.value = sample.label;
    if (date) date.value = today();
    if (route) route.value = sample.route || '';
    panel.querySelectorAll('[data-status]').forEach((select, index) => {
      select.value = allowedStatuses.has(sample.statuses[index]) ? sample.statuses[index] : 'not-assessed';
      select.classList.remove('field-error');
    });
    route?.classList.remove('field-error');
    saveState(panel);
    clearMatrixResult(panel);
    panel.querySelector('.assessment-result').hidden = true;
    panel.querySelector('[data-assessment-message]').textContent = 'Sample loaded. Review the source rows, then press Assess this matrix.';
    panel.querySelector('[data-action="assess"]')?.focus();
  };

  const requestAssessment = (panel) => {
    const label = panel.querySelector('[data-field="label"]');
    const date = panel.querySelector('[data-field="date"]');
    const route = panel.querySelector('[data-field="route"]');
    const statuses = [...panel.querySelectorAll('[data-status]')];
    const message = panel.querySelector('[data-assessment-message]');
    const incomplete = statuses.filter((select) => select.value === 'not-assessed');
    label?.classList.remove('field-error');
    route?.classList.remove('field-error');
    statuses.forEach((select) => select.classList.remove('field-error'));
    if (!label?.value.trim()) {
      label?.classList.add('field-error');
      message.textContent = 'Add a non-sensitive project label before assessing.';
      label?.focus();
      return;
    }
    if (panel.dataset.model === 'u-perimeter' && !['mainland', 'difc'].includes(route?.value)) {
      route?.classList.add('field-error');
      message.textContent = 'Select Mainland / VARA or DIFC / DFSA before assessing. ADGM is a separate path.';
      route?.focus();
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
    message.textContent = 'Signal complete. Review the source trace, lane cards and open actions above.';
    panel.querySelector('.assessment-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetPanel = (panel) => {
    panel.querySelector('[data-field="label"]').value = '';
    panel.querySelector('[data-field="date"]').value = today();
    const route = panel.querySelector('[data-field="route"]');
    if (route) route.value = '';
    panel.querySelectorAll('[data-status]').forEach((select) => { select.value = 'not-assessed'; });
    panel.querySelectorAll('[data-status], [data-field="route"]').forEach((input) => input.classList.remove('field-error'));
    panel.querySelector('[data-assessment-message]').textContent = 'Complete all control statuses, then press Assess this matrix.';
    panel.querySelector('.assessment-result').hidden = true;
    clearMatrixResult(panel);
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
        panel.querySelector('[data-assessment-message]').textContent = 'Changes made. Press Assess this matrix to refresh the signal.';
      }));
    });
    panel.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => {
      if (button.dataset.action === 'assess') requestAssessment(panel);
      if (button.dataset.action === 'reset') resetPanel(panel);
    }));
    panel.querySelectorAll('[data-sample]').forEach((button) => button.addEventListener('click', () => loadSampleCase(panel, button.dataset.sample)));
    panel.querySelectorAll('[data-export]').forEach((button) => button.addEventListener('click', () => handleExport(panel, button.dataset.export)));
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
