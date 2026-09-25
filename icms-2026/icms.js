(() => {
  const form = document.getElementById('icms-assessment-form');
  const progress = document.getElementById('assessment-progress');
  const error = document.getElementById('assessment-error');
  const result = document.getElementById('assessment-result');
  const questionCount = 24;
  let latestResult = null;

  const sectionNames = [
    'Governance, Board & management oversight',
    'Three Lines of Defense',
    'Compliance & Internal Audit maturity',
    'MIS, data analytics & monitoring',
    'TBML red flags & financial-crime monitoring',
    'Corrective action & annual reporting'
  ];

  const bandFor = (score) => {
    if (score < 18) return ['Foundation required', 'Core architecture, ownership and evidence require immediate attention.'];
    if (score < 36) return ['Developing', 'Important control components exist, but material gaps or inconsistent evidence remain.'];
    if (score < 54) return ['Progressing', 'The control environment shows meaningful progress and should move into evidence-led validation.'];
    return ['Ready for validation', 'The self-assessment indicates stronger readiness, subject to independent testing and management approval.'];
  };

  const updateProgress = () => {
    const answered = [...form.querySelectorAll('select[name^="q"]')].filter((field) => field.value !== '').length;
    progress.textContent = `${answered} of ${questionCount} answered`;
  };

  const calculate = () => {
    const fields = [...form.querySelectorAll('select[name^="q"]')];
    const unanswered = fields.filter((field) => field.value === '');
    error.textContent = '';
    if (unanswered.length) {
      error.textContent = `Please complete all ${questionCount} controls before generating a full result. ${unanswered.length} remain unanswered.`;
      unanswered[0].focus();
      return;
    }

    const values = fields.map((field) => Number(field.value));
    const score = values.reduce((sum, value) => sum + value, 0);
    const sectionScores = sectionNames.map((name, index) => ({
      name,
      score: values.slice(index * 4, index * 4 + 4).reduce((sum, value) => sum + value, 0)
    }));
    const strongest = [...sectionScores].sort((a, b) => b.score - a.score)[0];
    const priority = [...sectionScores].sort((a, b) => a.score - b.score)[0];
    const [band, summary] = bandFor(score);
    latestResult = { score, band, summary, sectionScores, values, created: new Date() };

    document.getElementById('result-score').textContent = score;
    document.getElementById('result-band').textContent = band;
    document.getElementById('result-summary').textContent = summary;
    document.getElementById('result-strongest').textContent = `${strongest.name} (${strongest.score}/12)`;
    document.getElementById('result-priority').textContent = `${priority.name} (${priority.score}/12)`;
    document.getElementById('result-count').textContent = `${questionCount} / ${questionCount}`;
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const makeReport = () => {
    if (!latestResult) return;
    const date = latestResult.created.toISOString().slice(0, 10);
    const lines = [
      'REGTECH NEXUS AI',
      'ICMS 2026 READINESS & CONTROL REVIEW TOOLKIT',
      'Independent professional review-support output',
      '',
      `Generated: ${latestResult.created.toLocaleString()}`,
      'Toolkit version: 1.0',
      `Indicative score: ${latestResult.score}/72`,
      `Readiness band: ${latestResult.band}`,
      `Summary: ${latestResult.summary}`,
      '',
      'SECTION RESULTS',
      ...latestResult.sectionScores.map((item) => `- ${item.name}: ${item.score}/12`),
      '',
      'IMPORTANT BOUNDARIES',
      '- Self-reported and not evidence-verified.',
      '- Not a regulatory rating, audit opinion, certification or compliance determination.',
      '- Independently prepared by RegTech Nexus AI based on the Bangladesh Bank ICMS Guideline, July 2026.',
      '- Not issued, approved, certified or endorsed by Bangladesh Bank.',
      '- Verify every conclusion against the official guideline, institutional policy and available evidence.'
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `icms-2026-readiness-report-${date}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  form.addEventListener('change', updateProgress);
  form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
  form.addEventListener('reset', () => {
    window.setTimeout(() => {
      updateProgress();
      error.textContent = '';
      result.hidden = true;
      latestResult = null;
    }, 0);
  });
  document.getElementById('download-report').addEventListener('click', makeReport);
  document.getElementById('print-report').addEventListener('click', () => window.print());

  const capTable = document.querySelector('#cap-table tbody');
  const capRow = () => {
    const row = document.createElement('tr');
    row.innerHTML = '<td contenteditable="true">New corrective action</td><td contenteditable="true">Assign owner</td><td><select><option>High</option><option>Medium</option><option>Low</option></select></td><td><input type="date"></td><td><select><option>Open</option><option>Planned</option><option>In progress</option><option>Closed</option></select></td><td contenteditable="true">Required evidence</td><td><button class="remove-cap" type="button" aria-label="Remove action">×</button></td>';
    return row;
  };
  document.getElementById('add-cap-row').addEventListener('click', () => capTable.appendChild(capRow()));
  capTable.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-cap')) event.target.closest('tr').remove();
  });
  document.getElementById('download-cap').addEventListener('click', () => {
    const rows = [...capTable.querySelectorAll('tr')].map((row) => [...row.children].slice(0, 6).map((cell) => {
      const control = cell.querySelector('select, input');
      return (control ? control.value : cell.textContent).trim().replaceAll('"', '""');
    }));
    const csv = [['Issue / action', 'Owner', 'Priority', 'Due date', 'Status', 'Evidence / notes'], ...rows].map((row) => row.map((value) => `"${value}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `icms-2026-corrective-action-plan-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  });

  updateProgress();
})();
