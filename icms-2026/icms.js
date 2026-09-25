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
    fields.forEach((field) => {
      field.classList.remove('icms-unanswered');
      field.removeAttribute('aria-invalid');
      field.closest('.assessment-item')?.classList.remove('has-unanswered');
    });
    if (unanswered.length) {
      unanswered.forEach((field) => {
        field.classList.add('icms-unanswered');
        field.setAttribute('aria-invalid', 'true');
        field.closest('.assessment-item')?.classList.add('has-unanswered');
      });
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

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);

  const makeReport = () => {
    if (!latestResult) return;
    const date = latestResult.created.toISOString().slice(0, 10);
    const strongest = [...latestResult.sectionScores].sort((a, b) => b.score - a.score)[0];
    const priority = [...latestResult.sectionScores].sort((a, b) => a.score - b.score)[0];
    const sectionCards = latestResult.sectionScores.map((item) => {
      const percentage = Math.round((item.score / 12) * 100);
      return `<article class="section-card"><div class="section-card-top"><span>${escapeHtml(item.name)}</span><strong>${item.score}/12</strong></div><div class="bar"><i style="width:${percentage}%"></i></div><small>${percentage}% indicative strength</small></article>`;
    }).join('');
    const reportHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ICMS Readiness Review Report</title>
<style>
 :root{--navy:#10203b;--blue:#0956a8;--teal:#0c8d98;--ink:#26364d;--muted:#637286;--line:#d9e5e8;--pale:#f3f8f8;--gold:#b99a4a}
*{box-sizing:border-box}body{margin:0;background:#eef4f4;color:var(--ink);font-family:Arial,Helvetica,sans-serif;line-height:1.55}.page{max-width:980px;margin:32px auto;background:#fff;box-shadow:0 18px 55px rgba(16,32,59,.12)}header{padding:34px 42px;background:linear-gradient(135deg,var(--navy),#17466a);color:#fff;display:flex;justify-content:space-between;gap:24px;align-items:flex-start}header .brand{font-size:22px;font-weight:700;letter-spacing:.02em}header .brand .report-logo{display:block;width:230px;height:auto;object-fit:contain;margin-bottom:13px}header .brand small{display:block;color:#9ee6e2;font-size:10px;letter-spacing:.15em;text-transform:uppercase;margin-top:8px}header .official{border:1px solid var(--gold);color:#f2d99b;font-size:10px;font-weight:700;letter-spacing:.12em;padding:8px 10px;white-space:nowrap}.content{padding:38px 42px}.eyebrow{color:var(--blue);font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}.title{font-size:34px;line-height:1.12;margin:10px 0 5px;color:var(--navy)}.subtitle{color:var(--muted);margin:0}.hero{display:grid;grid-template-columns:1fr 160px;gap:28px;align-items:center;border-bottom:1px solid var(--line);padding-bottom:30px}.score{display:flex;flex-direction:column;align-items:center;justify-content:center;width:142px;height:142px;border:9px solid #64c9c2;border-radius:50%;color:var(--blue);margin-left:auto}.score strong{font-size:36px;line-height:1}.score span{font-size:12px;color:var(--muted);margin-top:5px}.summary{margin:28px 0;background:var(--pale);border-left:4px solid var(--teal);padding:18px 20px}.summary h2{font-size:20px;color:var(--navy);margin:0 0 6px}.summary p{margin:0;color:var(--muted)}.facts{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:24px 0 36px}.fact{border:1px solid var(--line);padding:15px}.fact span{display:block;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.1em}.fact strong{display:block;color:var(--navy);font-size:14px;margin-top:6px}.section-title{font-size:22px;color:var(--navy);margin:26px 0 14px}.section-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.section-card{border:1px solid var(--line);padding:15px 16px;background:#fff}.section-card-top{display:flex;justify-content:space-between;gap:12px;font-size:13px}.section-card-top span{font-weight:700}.section-card-top strong{color:var(--blue);white-space:nowrap}.bar{height:7px;background:#e8eff1;margin:13px 0 7px;overflow:hidden}.bar i{display:block;height:100%;background:linear-gradient(90deg,var(--blue),var(--teal))}.section-card small{color:var(--muted);font-size:11px}.boundary{margin-top:32px;border:1px solid #eadbb6;background:#fffaf0;padding:18px 20px}.boundary h2{font-size:17px;color:#725e2e;margin:0 0 8px}.boundary ul{margin:0;padding-left:19px;color:#6d6243;font-size:12px}.footer{border-top:1px solid var(--line);padding:20px 42px;color:var(--muted);font-size:11px;display:flex;justify-content:space-between;gap:20px}.footer strong{color:var(--navy)}@media(max-width:680px){.page{margin:0;box-shadow:none}.content{padding:28px 20px}header{padding:26px 20px}.hero{grid-template-columns:1fr}.score{margin:0}.facts,.section-grid{grid-template-columns:1fr}.footer{padding:18px 20px;display:block}.footer span{display:block;margin-top:8px}}
@media print{body{background:#fff}.page{margin:0;box-shadow:none}header{-webkit-print-color-adjust:exact;print-color-adjust:exact}.score,.bar i{print-color-adjust:exact;-webkit-print-color-adjust:exact}}
</style></head><body><main class="page"><header><div class="brand"><img class="report-logo" src="https://regtechnexusai.com/regtech-nexus-ai-logo-2026.png" alt="RegTech Nexus AI"><small>Independent review-support output</small></div><div class="official">NOT OFFICIAL</div></header><div class="content"><section class="hero"><div><div class="eyebrow">ICMS · READINESS &amp; CONTROL REVIEW</div><h1 class="title">Indicative self-assessment report</h1><p class="subtitle">Generated ${escapeHtml(latestResult.created.toLocaleString())} · Toolkit version 1.0</p></div><div class="score"><strong>${latestResult.score}</strong><span>of 72</span></div></section><section class="summary"><h2>${escapeHtml(latestResult.band)}</h2><p>${escapeHtml(latestResult.summary)}</p></section><section class="facts"><div class="fact"><span>Strongest area</span><strong>${escapeHtml(strongest.name)} (${strongest.score}/12)</strong></div><div class="fact"><span>Priority area</span><strong>${escapeHtml(priority.name)} (${priority.score}/12)</strong></div><div class="fact"><span>Controls answered</span><strong>24 / 24</strong></div></section><h2 class="section-title">Section results</h2><section class="section-grid">${sectionCards}</section><section class="boundary"><h2>Important boundaries</h2><ul><li>Self-reported and not evidence-verified.</li><li>Not a regulatory rating, audit opinion, certification or compliance determination.</li><li>Independently prepared by RegTech Nexus AI based on the Bangladesh Bank ICMS Guideline, July 2026.</li><li>Not issued, approved, certified or endorsed by Bangladesh Bank.</li><li>Verify every conclusion against the official guideline, institutional policy and available evidence.</li></ul></section></div><div class="footer"><span><strong>RegTech Nexus AI</strong> · ICMS Readiness &amp; Control Review Toolkit</span><span>Professional review support · Not official</span></div></main></body></html>`;
    const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `icms-readiness-report-${date}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  const normaliseRemoveButtons = () => {
    document.querySelectorAll('.remove-cap').forEach((button) => {
      button.textContent = 'Remove action';
      button.setAttribute('aria-label', 'Remove action');
      button.setAttribute('title', 'Remove this action');
    });
  };

  form.addEventListener('change', (event) => {
    updateProgress();
    if (event.target.matches('select[name^="q"]') && event.target.value !== '') {
      event.target.classList.remove('icms-unanswered');
      event.target.removeAttribute('aria-invalid');
      event.target.closest('.assessment-item')?.classList.remove('has-unanswered');
    }
  });
  form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
  form.addEventListener('reset', () => {
    window.setTimeout(() => {
      updateProgress();
      error.textContent = '';
      form.querySelectorAll('select[name^="q"]').forEach((field) => {
        field.classList.remove('icms-unanswered');
        field.removeAttribute('aria-invalid');
        field.closest('.assessment-item')?.classList.remove('has-unanswered');
      });
      result.hidden = true;
      latestResult = null;
    }, 0);
  });
  document.getElementById('download-report').addEventListener('click', makeReport);
  document.getElementById('print-report').addEventListener('click', () => window.print());

  const capTable = document.querySelector('#cap-table tbody');
  const capRow = () => {
    const row = document.createElement('tr');
    row.innerHTML = '<td data-label="Issue / action" contenteditable="true">New corrective action</td><td data-label="Owner" contenteditable="true">Assign owner</td><td data-label="Priority"><select><option>High</option><option>Medium</option><option>Low</option></select></td><td data-label="Due date"><input type="date"></td><td data-label="Status"><select><option>Open</option><option>Planned</option><option>In progress</option><option>Closed</option></select></td><td data-label="Evidence / notes" contenteditable="true">Required evidence</td><td data-label="" class="cap-remove-cell"><button class="remove-cap" type="button" aria-label="Remove action" title="Remove this action">Remove action</button></td>';
    return row;
  };
  document.getElementById('add-cap-row').addEventListener('click', () => {
    capTable.appendChild(capRow());
    normaliseRemoveButtons();
  });
  capTable.addEventListener('click', (event) => {
    const removeButton = event.target.closest('.remove-cap');
    if (removeButton) removeButton.closest('tr')?.remove();
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
    link.download = `icms-corrective-action-plan-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  });

  normaliseRemoveButtons();
  updateProgress();
})();
