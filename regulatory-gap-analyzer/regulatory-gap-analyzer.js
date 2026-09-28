(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const today = () => new Date().toISOString().slice(0, 10);

  /*
   * These are original review prompts and keyword anchors. They are not copied
   * regulatory text. Each pack points the reviewer back to an official source.
   */
  const packs = {
    'bb-aml': {
      label: 'Bangladesh · AML/CFT control pack',
      id: 'RNX-PCA-BD-AML-01',
      sourceName: 'Bangladesh Bank and Bangladesh FIU source paths',
      sourceUrl: 'https://www.bb.org.bd/en/index.php/mediaroom/circular',
      sourceLabel: 'Open official source path ↗',
      sourceLinks: [{ label: 'Bangladesh Bank', url: 'https://www.bb.org.bd/en/index.php/mediaroom/circular' }, { label: 'Bangladesh FIU', url: 'https://bfiu.org.bd/' }],
      note: 'Use the current circular, guideline or instruction that applies to the institution and activity under review.',
      sample: 'The institution identifies and verifies customers and beneficial owners at onboarding. Customers assessed as high risk receive enhanced due diligence and additional approval. The transaction monitoring team reviews alerts and escalates suspicious activity to the MLRO. AML/CFT training is delivered annually, and relevant records are retained under the approved retention policy.',
      controls: [
        { id: 'bd-01', title: 'Risk-based AML/CFT governance', evidence: 'Board or senior-management approval, institutional risk assessment, accountable owner and review trigger.', anchors: ['risk assessment', 'ml/tf risk', 'aml/cft risk', 'board approval', 'senior management'], support: ['risk-based', 'accountable owner', 'review trigger'], critical: true, owner: 'MLRO / Compliance', action: 'Document the institution-wide ML/TF risk assessment, approval route, accountable owner and next review trigger.' },
        { id: 'bd-02', title: 'Customer and beneficial-owner identification', evidence: 'Customer identification, verification, beneficial-owner record and refresh or escalation trigger.', anchors: ['customer identification', 'identify and verify', 'customer due diligence', 'beneficial owner', 'beneficial ownership'], support: ['onboarding', 'refresh', 'ownership map'], critical: true, owner: 'KYC / Operations', action: 'Map the CDD and beneficial-owner requirements to evidence, refresh triggers and an escalation route.' },
        { id: 'bd-03', title: 'Enhanced due diligence for higher risk', evidence: 'High-risk criteria, enhanced measures, approval, source-of-funds or source-of-wealth evidence and review frequency.', anchors: ['enhanced due diligence', 'edd', 'high risk', 'source of funds', 'source of wealth'], support: ['additional approval', 'senior approval', 'enhanced review'], critical: true, owner: 'MLRO / Compliance', action: 'Specify high-risk triggers, enhanced measures, approval authority and review frequency.' },
        { id: 'bd-04', title: 'Transaction monitoring and suspicious-activity escalation', evidence: 'Monitoring coverage, alert review, rationale, escalation to the MLRO/FIU channel and recordkeeping.', anchors: ['transaction monitoring', 'suspicious activity', 'suspicious transaction', 'alert review', 'mlro'], support: ['escalat', 'report', 'case record', 'red flag'], critical: true, owner: 'Financial Crime Operations', action: 'Connect monitoring alerts to documented escalation, decision rationale, filing responsibility and records.' },
        { id: 'bd-05', title: 'Training, testing and independent assurance', evidence: 'Role-based training, completion records, testing or independent review and tracked remediation.', anchors: ['aml/cft training', 'aml training', 'staff training', 'independent testing', 'independent review'], support: ['annually', 'periodic', 'completion record', 'remediation'], critical: false, owner: 'Compliance / Internal Audit', action: 'Add role-based training, testing cadence, evidence retention and a tracked remediation process.' },
        { id: 'bd-06', title: 'Records, retention and information access', evidence: 'Records covered, retention period, retrieval capability, access controls and audit trail.', anchors: ['record retention', 'records retained', 'retention policy', 'recordkeeping', 'audit trail'], support: ['retrieve', 'access control', 'retention period'], critical: false, owner: 'Operations / Information Security', action: 'Define retained records, retention period, retrieval standard, access owner and audit evidence.' }
      ]
    },
    'mas-aml': {
      label: 'Singapore · MAS AML/CFT control pack',
      id: 'RNX-PCA-SG-AML-01',
      sourceName: 'MAS Notice 626 source path',
      sourceUrl: 'https://www.mas.gov.sg/regulation/notices/notice-626',
      sourceLabel: 'Open MAS source path ↗',
      sourceLinks: [{ label: 'MAS Notice 626', url: 'https://www.mas.gov.sg/regulation/notices/notice-626' }],
      note: 'Confirm the entity type, notice scope, current version and any applicable MAS guidance before relying on the review.',
      sample: 'The institution maintains an enterprise money-laundering and terrorism-financing risk assessment. It identifies and verifies customers and beneficial owners, applies enhanced measures to higher-risk relationships, monitors transactions on an ongoing basis and escalates suspicious activity to the appointed reporting officer. Training and independent testing are scheduled annually.',
      controls: [
        { id: 'sg-01', title: 'Enterprise ML/TF risk assessment', evidence: 'Documented risk assessment covering customers, products, delivery channels and geography with approval and refresh triggers.', anchors: ['risk assessment', 'ml/tf risk', 'money laundering', 'terrorism financing'], support: ['enterprise', 'customer risk', 'product risk', 'geographic risk'], critical: true, owner: 'MLRO / Compliance', action: 'Document the enterprise risk assessment scope, approval, risk factors, mitigation and refresh trigger.' },
        { id: 'sg-02', title: 'CDD and beneficial ownership', evidence: 'Identity, beneficial ownership, purpose and nature of relationship, verification and refresh evidence.', anchors: ['customer due diligence', 'identify and verify', 'beneficial owner', 'beneficial ownership'], support: ['purpose and nature', 'refresh', 'verification'], critical: true, owner: 'KYC / Operations', action: 'Map CDD and beneficial-owner evidence to onboarding, refresh and escalation controls.' },
        { id: 'sg-03', title: 'Enhanced measures for higher risk', evidence: 'Risk triggers, enhanced measures, senior approval and source-of-wealth or source-of-funds checks where applicable.', anchors: ['enhanced due diligence', 'enhanced measures', 'high risk', 'source of wealth', 'source of funds'], support: ['senior approval', 'higher risk', 'additional information'], critical: true, owner: 'MLRO / Compliance', action: 'Specify higher-risk triggers, enhanced measures, approval evidence and review frequency.' },
        { id: 'sg-04', title: 'Ongoing monitoring and suspicious-transaction escalation', evidence: 'Ongoing monitoring, alert investigation, reporting-officer escalation, rationale and records.', anchors: ['ongoing monitoring', 'transaction monitoring', 'suspicious transaction', 'reporting officer'], support: ['alert', 'escalat', 'case record', 'unusual'], critical: true, owner: 'Financial Crime Operations', action: 'Link monitoring to investigation, reporting-officer escalation, rationale and retention.' },
        { id: 'sg-05', title: 'Training and independent testing', evidence: 'Role-based AML/CFT training, completion records, independent testing and issue remediation.', anchors: ['aml/cft training', 'training', 'independent testing', 'independent review'], support: ['annual', 'periodic', 'completion', 'remediation'], critical: false, owner: 'Compliance / Internal Audit', action: 'Define training coverage, test methodology, frequency, evidence and issue closure.' },
        { id: 'sg-06', title: 'Records and access governance', evidence: 'Required records, retention, retrieval, confidentiality, access and auditability.', anchors: ['record keeping', 'recordkeeping', 'retention', 'audit trail', 'access control'], support: ['retrieve', 'confidentiality', 'records retained'], critical: false, owner: 'Operations / Information Security', action: 'Set record categories, retention, retrieval, access and audit-trail expectations.' }
      ]
    },
    'uae-aml': {
      label: 'UAE · multi-route AML/CFT control pack',
      id: 'RNX-PCA-UAE-AML-01',
      sourceName: 'CBUAE, VARA and DFSA route-specific source paths',
      sourceUrl: 'https://rulebook.centralbank.ae/en/rulebook/amlcft',
      sourceLabel: 'Open CBUAE source path ↗',
      sourceLinks: [{ label: 'CBUAE Rulebook', url: 'https://rulebook.centralbank.ae/en/rulebook/amlcft' }, { label: 'VARA AML/CFT', url: 'https://rulebooks.vara.ae/rulebook/c-amlcft-controls' }, { label: 'DFSA Crypto', url: 'https://www.dfsa.ae/crypto' }],
      note: 'UAE routes are not interchangeable. Confirm whether the case is federal/onshore, VARA, DIFC/DFSA or ADGM/FSRA before relying on a control conclusion.',
      sample: 'The entity records its licence, regulated activity and operating location. It identifies customers and beneficial owners, applies enhanced measures to higher-risk relationships, reviews transactions for unusual trade and virtual-asset activity, escalates suspicious activity to the responsible officer and retains the review record. Route-specific obligations are confirmed before approval.',
      controls: [
        { id: 'ae-01', title: 'Entity, licence and regulatory route', evidence: 'Entity location, licence, regulated activity, delivery channel and selected federal, VARA, DFSA or ADGM route.', anchors: ['licence', 'regulated activity', 'operating location', 'regulatory route', 'regulator'], support: ['onshore', 'mainland', 'free zone', 'difc', 'vara', 'adgm', 'fsra'], critical: true, owner: 'Legal / Compliance', action: 'Record entity perimeter, licence, location, activity and the regulator route before assessing downstream controls.' },
        { id: 'ae-02', title: 'CDD and beneficial ownership', evidence: 'CDD, beneficial-owner verification, PEP/sanctions checks, source-of-funds evidence and refresh triggers.', anchors: ['customer due diligence', 'beneficial owner', 'beneficial ownership', 'source of funds', 'pep'], support: ['verify', 'sanctions', 'refresh', 'ownership'], critical: true, owner: 'MLRO / KYC', action: 'Document CDD, ownership verification, screening, source-of-funds and refresh evidence.' },
        { id: 'ae-03', title: 'Risk assessment and enhanced measures', evidence: 'Customer, product, geography, technology and counterparty risk assessment with mitigation and approval.', anchors: ['risk assessment', 'high risk', 'enhanced due diligence', 'enhanced measures'], support: ['product risk', 'geographic risk', 'technology risk', 'counterparty'], critical: true, owner: 'MLRO / Compliance', action: 'Define risk factors, enhanced measures, approvals, mitigation and review triggers.' },
        { id: 'ae-04', title: 'Transaction, trade and virtual-asset monitoring', evidence: 'Transaction monitoring, trade-document review, valuation or route red flags, wallet/transfer evidence where relevant.', anchors: ['transaction monitoring', 'trade finance', 'trade document', 'virtual asset', 'travel rule'], support: ['red flag', 'blockchain', 'wallet', 'unusual route', 'valuation'], critical: true, owner: 'Financial Crime Operations', action: 'Connect trade, payment and virtual-asset indicators to monitoring, investigation and escalation.' },
        { id: 'ae-05', title: 'Suspicious-activity escalation and reporting', evidence: 'Responsible officer, internal escalation, rationale, filing route and recordkeeping.', anchors: ['suspicious activity', 'suspicious transaction', 'responsible officer', 'reporting'], support: ['escalat', 'decision record', 'filing', 'retention'], critical: true, owner: 'MLRO / Reporting Officer', action: 'Set the internal escalation, reporting responsibility, rationale, approval and retention trail.' },
        { id: 'ae-06', title: 'Training, testing and independent review', evidence: 'Role-based training, testing, independent review, issue management and senior reporting.', anchors: ['training', 'independent testing', 'independent review', 'issue management'], support: ['annual', 'periodic', 'remediation', 'senior reporting'], critical: false, owner: 'Compliance / Internal Audit', action: 'Define training, testing, independent review and issue reporting evidence.' }
      ]
    },
    'au-aml': {
      label: 'Australia · AML/CTF and resilience pack',
      id: 'RNX-PCA-AU-AML-01',
      sourceName: 'AUSTRAC and APRA source paths',
      sourceUrl: 'https://www.austrac.gov.au/industry-and-business/obligations-and-guidance/your-obligations',
      sourceLabel: 'Open AUSTRAC source path ↗',
      sourceLinks: [{ label: 'AUSTRAC obligations', url: 'https://www.austrac.gov.au/industry-and-business/obligations-and-guidance/your-obligations' }, { label: 'APRA CPS 230', url: 'https://www.apra.gov.au/standards/cps-230' }],
      note: 'AML/CTF and operational-resilience controls answer different questions. Keep the AUSTRAC and APRA lanes separate in institutional review.',
      sample: 'The reporting entity maintains an AML/CTF program, identifies and verifies customers, conducts ongoing customer due diligence and escalates suspicious matters for SMR consideration. It retains records and provides role-based training. Critical services have owners, tolerance levels and a material service-provider register with exit planning.',
      controls: [
        { id: 'au-01', title: 'Entity and designated-service scope', evidence: 'Entity classification, designated service, registration and transition or applicability assessment.', anchors: ['designated service', 'reporting entity', 'registration', 'applicability'], support: ['transition', 'scope', 'regulated service'], critical: true, owner: 'Legal / AML Compliance', action: 'Record entity classification, designated service, registration and the applicable transition or scope position.' },
        { id: 'au-02', title: 'AML/CTF program and customer due diligence', evidence: 'ML/TF risk assessment, AML/CTF program, initial and ongoing CDD and escalation process.', anchors: ['aml/ctf program', 'risk assessment', 'customer due diligence', 'ongoing due diligence'], support: ['initial cdd', 'customer risk', 'mitigation'], critical: true, owner: 'AML/CTF Compliance', action: 'Map the AML/CTF program to risk assessment, initial CDD, ongoing CDD and escalation evidence.' },
        { id: 'au-03', title: 'SMR/TTR reporting and records', evidence: 'Suspicious matter or threshold transaction workflow, deadline checks, reporting owner and records.', anchors: ['suspicious matter report', 'smr', 'threshold transaction report', 'ttr', 'recordkeeping'], support: ['deadline', 'reporting owner', 'travel rule', 'records'], critical: true, owner: 'AML/CTF Reporting Officer', action: 'Document reportability checks, deadlines, owner, approval rationale and retained records.' },
        { id: 'au-04', title: 'Training, testing and independent evaluation', evidence: 'Training, independent evaluation, scenario testing, issue log and remediation evidence.', anchors: ['training', 'independent evaluation', 'independent testing', 'scenario testing'], support: ['issue log', 'remediation', 'completion'], critical: false, owner: 'Compliance / Internal Audit', action: 'Set training, independent evaluation, scenario testing, issue logging and remediation evidence.' },
        { id: 'au-05', title: 'Critical operations and tolerance', evidence: 'Important business services, impact tolerance, scenario testing, continuity and incident escalation.', anchors: ['critical operations', 'important business service', 'impact tolerance', 'business continuity'], support: ['scenario testing', 'incident', 'recovery', 'tolerance'], critical: true, owner: 'Operational Risk', action: 'Identify important services, tolerance levels, testing evidence, recovery plans and incident escalation.' },
        { id: 'au-06', title: 'Material service providers and exit planning', evidence: 'Provider register, criticality, due diligence, contract controls, monitoring and workable exit plan.', anchors: ['service provider', 'material service provider', 'outsourcing', 'exit plan'], support: ['vendor register', 'due diligence', 'contract', 'subcontractor'], critical: true, owner: 'Third-Party Risk / Procurement', action: 'Maintain provider criticality, due diligence, contract controls, monitoring and exit evidence.' }
      ]
    },
    'ai-governance': {
      label: 'International · responsible AI governance pack',
      id: 'RNX-PCA-AI-GOV-01',
      sourceName: 'MAS FEAT and NIST AI RMF reference paths',
      sourceUrl: 'https://www.nist.gov/itl/ai-risk-management-framework',
      sourceLabel: 'Open NIST reference path ↗',
      sourceLinks: [{ label: 'NIST AI RMF', url: 'https://www.nist.gov/itl/ai-risk-management-framework' }, { label: 'MAS FEAT', url: 'https://www.mas.gov.sg/publications/monographs-or-information-paper/2018/feat' }],
      note: 'This is a governance reference pack, not a universal AI law mapping. Confirm the applicable sector, jurisdiction, use-case impact and internal policy.',
      sample: 'The institution keeps an AI use-case inventory with a named owner and impact assessment. Data lineage and quality checks are documented. Human reviewers can challenge or override material outputs. Model performance, drift, incidents and vendor changes are monitored, and the system can be suspended when controls fail.',
      controls: [
        { id: 'ai-01', title: 'Use-case ownership and impact assessment', evidence: 'Use-case inventory, purpose, affected parties, materiality, owner and approval route.', anchors: ['use case inventory', 'use-case owner', 'impact assessment', 'affected parties', 'risk classification'], support: ['purpose', 'materiality', 'approval'], critical: true, owner: 'AI Governance / Business Owner', action: 'Record each use case, purpose, affected parties, materiality, risk tier, owner and approval route.' },
        { id: 'ai-02', title: 'Data lineage, quality and permitted use', evidence: 'Data sources, lineage, quality checks, permissions, retention and change controls.', anchors: ['data lineage', 'data quality', 'permitted use', 'data source', 'data governance'], support: ['retention', 'access control', 'change control', 'privacy'], critical: true, owner: 'Data Governance / Model Owner', action: 'Document data lineage, quality tests, permission basis, retention and change controls.' },
        { id: 'ai-03', title: 'Human oversight and challengeability', evidence: 'Human review, override, escalation, explainability and decision record for material outputs.', anchors: ['human oversight', 'human review', 'override', 'explainability', 'challenge'], support: ['escalat', 'decision record', 'appeal', 'reviewer'], critical: true, owner: 'Business Owner / Control Function', action: 'Define human checkpoints, override authority, escalation and an auditable decision record.' },
        { id: 'ai-04', title: 'Testing, fairness and performance monitoring', evidence: 'Pre-deployment testing, bias or fairness analysis, validation, drift and ongoing monitoring.', anchors: ['testing', 'fairness', 'bias', 'validation', 'performance monitoring'], support: ['drift', 'benchmark', 'threshold', 'periodic review'], critical: true, owner: 'Model Risk / Validation', action: 'Set testing, fairness, validation, monitoring thresholds, drift triggers and review frequency.' },
        { id: 'ai-05', title: 'Third-party, security and incident controls', evidence: 'Vendor due diligence, subcontractor visibility, security, incident reporting and exit or suspension plan.', anchors: ['vendor due diligence', 'third-party', 'incident response', 'security', 'exit plan'], support: ['subcontractor', 'suspend', 'kill switch', 'contract'], critical: true, owner: 'Technology Risk / Procurement', action: 'Map vendor, security, subcontractor, incident, suspension and exit controls to evidence.' },
        { id: 'ai-06', title: 'Documentation and accountability trail', evidence: 'Model or system card, approvals, change log, monitoring results, exceptions and accountable sign-off.', anchors: ['model card', 'documentation', 'change log', 'accountable sign-off', 'audit trail'], support: ['approval', 'exception', 'version', 'record'], critical: false, owner: 'AI Governance Committee', action: 'Maintain documentation, version history, approval, exception and accountable sign-off evidence.' }
      ]
    }
  };

  const statusLabels = { covered: 'Covered signal', partial: 'Partial signal', missing: 'Missing signal', conflict: 'Conflict signal' };
  const priorityLabels = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };
  const conflictPatterns = [
    'not required', 'no need to', 'does not apply', 'do not apply', 'never required', 'only when necessary', 'only above', 'no enhanced due diligence', 'without review'
  ];
  let lastRun = null;

  const elements = {
    framework: $('#framework-select'), label: $('#review-label'), policy: $('#policy-text'), count: $('#character-count'), source: $('#source-strip'),
    load: $('#load-sample'), analyze: $('#analyze-policy'), clear: $('#clear-policy'), formStatus: $('#form-status'), results: $('#results'),
    resultsTitle: $('#results-title'), resultsSummary: $('#results-summary'), resultCount: $('#result-count'), resultStats: $('#result-stats'), resultBody: $('#results-body'), actionBody: $('#action-body'),
    download: $('#download-csv'), copy: $('#copy-summary'), print: $('#print-report'), exportStatus: $('#export-status')
  };

  const normalise = (value) => String(value || '').toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' ').trim();
  const contains = (text, term) => normalise(text).includes(normalise(term));
  const hits = (text, terms) => terms.filter((term) => contains(text, term));
  const escCsv = (value) => {
    let output = String(value ?? '').replace(/\r?\n/g, ' ').trim();
    if (/^[=+\-@]/.test(output)) output = "'" + output;
    return '"' + output.replace(/"/g, '""') + '"';
  };

  function currentPack() { return packs[elements.framework.value] || packs['bb-aml']; }

  function renderSource() {
    const pack = currentPack();
    elements.source.replaceChildren();
    const copy = document.createElement('div'); copy.className = 'reggap-source-copy';
    const strong = document.createElement('strong'); strong.textContent = `${pack.id} · ${pack.sourceName}`;
    const note = document.createElement('span'); note.textContent = `${pack.note} Source paths are for verification; this page does not reproduce protected regulatory text.`;
    copy.append(strong, note);
    const links = document.createElement('div'); links.className = 'reggap-source-links';
    pack.sourceLinks.slice(0, 3).forEach((item) => { const link = document.createElement('a'); link.className = 'reggap-source-link'; link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = `${item.label} ↗`; links.append(link); });
    elements.source.append(copy, links);
  }

  function setStatus(message, tone = '') { elements.formStatus.textContent = message; elements.formStatus.className = `reggap-form-status${tone ? ` is-${tone}` : ''}`; }

  function classify(policy, control) {
    const text = normalise(policy);
    const conflict = conflictPatterns.find((pattern) => text.includes(pattern) && control.anchors.some((anchor) => text.includes(normalise(anchor))));
    const anchorHits = hits(text, control.anchors);
    const supportHits = hits(text, control.support);
    let status = 'missing';
    if (conflict) status = 'conflict';
    else if (anchorHits.length >= 2 && supportHits.length >= 1) status = 'covered';
    else if (anchorHits.length >= 1 || supportHits.length >= 1) status = 'partial';
    let priority = 'low';
    if (status === 'conflict') priority = 'critical';
    else if (status === 'missing' && control.critical) priority = 'high';
    else if (status === 'missing' || (status === 'partial' && control.critical)) priority = 'medium';
    else if (status === 'partial') priority = 'low';
    const signal = status === 'covered' ? `Matched anchors: ${anchorHits.slice(0, 3).join(', ') || 'supporting wording'}` : status === 'partial' ? `Found: ${[...anchorHits, ...supportHits].slice(0, 3).join(', ') || 'limited wording'}` : status === 'conflict' ? `Potential conflict wording: “${conflict}”` : 'No reliable control anchor found in the excerpt.';
    return { control, status, priority, anchorHits, supportHits, signal };
  }

  function makeCell(text, className = '') { const cell = document.createElement('td'); if (className) cell.className = className; cell.textContent = text; return cell; }

  function renderStats(results) {
    const stats = [
      { label: 'Covered signals', value: results.filter((item) => item.status === 'covered').length, tone: 'good' },
      { label: 'Partial signals', value: results.filter((item) => item.status === 'partial').length, tone: 'medium' },
      { label: 'Open or conflicting', value: results.filter((item) => ['missing', 'conflict'].includes(item.status)).length, tone: 'high' },
      { label: 'High-priority items', value: results.filter((item) => ['critical', 'high'].includes(item.priority)).length, tone: 'high' }
    ];
    elements.resultStats.replaceChildren();
    stats.forEach((stat) => { const card = document.createElement('div'); card.className = 'reggap-result-stat'; card.dataset.tone = stat.tone; const value = document.createElement('strong'); value.textContent = stat.value; const label = document.createElement('span'); label.textContent = stat.label; card.append(value, label); elements.resultStats.append(card); });
  }

  function renderResults(results) {
    const pack = currentPack();
    elements.resultBody.replaceChildren();
    results.forEach((result) => {
      const row = document.createElement('tr');
      const controlCell = document.createElement('td'); const title = document.createElement('span'); title.className = 'reggap-control-title'; title.textContent = result.control.title; const evidence = document.createElement('span'); evidence.className = 'reggap-control-evidence'; evidence.textContent = `Evidence to look for: ${result.control.evidence}`; controlCell.append(title, evidence);
      const signalCell = document.createElement('td'); const signal = document.createElement('span'); signal.className = 'reggap-signal'; signal.dataset.status = result.status; signal.textContent = statusLabels[result.status]; const signalText = document.createElement('span'); signalText.className = 'reggap-cell-action'; signalText.textContent = result.signal; signalCell.append(signal, signalText);
      const priorityCell = document.createElement('td'); const priority = document.createElement('span'); priority.className = 'reggap-priority'; priority.dataset.priority = result.priority; priority.textContent = priorityLabels[result.priority]; priorityCell.append(priority);
      const actionCell = document.createElement('td'); const source = document.createElement('span'); source.className = 'reggap-cell-source'; source.textContent = `${pack.id} · ${pack.sourceName}`; const action = document.createElement('span'); action.className = 'reggap-cell-action'; action.textContent = result.status === 'covered' ? 'Validate operating evidence, date and accountable owner.' : result.control.action; actionCell.append(source, action);
      row.append(controlCell, signalCell, priorityCell, actionCell); elements.resultBody.append(row);
    });
  }

  function renderActionPlan(results) {
    elements.actionBody.replaceChildren();
    const open = results.filter((item) => item.status !== 'covered');
    if (!open.length) {
      const row = document.createElement('tr'); const cell = document.createElement('td'); cell.colSpan = 5; cell.textContent = 'No open signals were identified by this transparent matcher. Validate operating evidence, source applicability and the policy version before relying on the result.'; row.append(cell); elements.actionBody.append(row); return;
    }
    open.forEach((result) => {
      const row = document.createElement('tr');
      const priority = document.createElement('td'); const badge = document.createElement('span'); badge.className = 'reggap-priority'; badge.dataset.priority = result.priority; badge.textContent = priorityLabels[result.priority]; priority.append(badge);
      const action = document.createElement('td'); const title = document.createElement('span'); title.className = 'reggap-action-title'; title.textContent = result.control.action; const source = document.createElement('span'); source.className = 'reggap-action-source'; source.textContent = `${result.control.title} · ${statusLabels[result.status]}`; action.append(title, source);
      const evidence = document.createElement('td'); const evidenceInput = document.createElement('input'); evidenceInput.type = 'text'; evidenceInput.placeholder = 'e.g. policy §4.2'; evidenceInput.maxLength = 160; evidenceInput.dataset.actionEvidence = result.control.id; evidenceInput.setAttribute('aria-label', `Evidence reference for ${result.control.title}`); evidence.append(evidenceInput);
      const owner = document.createElement('td'); const ownerInput = document.createElement('input'); ownerInput.type = 'text'; ownerInput.value = result.control.owner; ownerInput.maxLength = 80; ownerInput.dataset.actionOwner = result.control.id; ownerInput.setAttribute('aria-label', `Action owner for ${result.control.title}`); owner.append(ownerInput);
      const date = document.createElement('td'); const dateInput = document.createElement('input'); dateInput.type = 'date'; dateInput.dataset.actionDate = result.control.id; dateInput.setAttribute('aria-label', `Target date for ${result.control.title}`); date.append(dateInput);
      row.append(priority, action, evidence, owner, date); elements.actionBody.append(row);
    });
  }

  function analyse() {
    const policy = elements.policy.value.trim();
    if (policy.length < 20) { setStatus('Enter at least a short, non-sensitive policy excerpt before analysis.', 'error'); elements.policy.focus(); return; }
    const pack = currentPack();
    const results = pack.controls.map((control) => classify(policy, control));
    lastRun = { pack, results, policy, label: elements.label.value.trim() || 'Untitled policy review', date: today() };
    elements.results.hidden = false; elements.resultsTitle.textContent = `Evidence gap review · ${pack.label}`; elements.resultsSummary.textContent = `${lastRun.label} · ${pack.id} · ${results.length} control areas reviewed in the browser.`; elements.resultCount.textContent = results.length;
    renderStats(results); renderResults(results); renderActionPlan(results); setStatus('Analysis complete. Review each signal, add evidence references outside this public pilot and assign accountable owners.', 'success'); elements.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function sample() { const pack = currentPack(); elements.policy.value = pack.sample; if (!elements.label.value.trim()) elements.label.value = 'Synthetic policy review'; updateCount(); setStatus('Synthetic sample loaded. Review the text, then run the analysis.'); elements.policy.focus(); }
  function updateCount() { elements.count.textContent = `${elements.policy.value.length.toLocaleString()} / 12,000`; }
  function clearAll() { elements.policy.value = ''; elements.label.value = ''; elements.results.hidden = true; lastRun = null; updateCount(); setStatus('Fields cleared. Choose a pack and enter a policy excerpt to begin.'); elements.exportStatus.textContent = ''; }

  function actionRows() {
    return $$('#action-body tr').map((row) => ({ priority: row.cells[0]?.textContent.trim() || '', action: row.cells[1]?.querySelector('.reggap-action-title')?.textContent.trim() || row.cells[1]?.textContent.trim() || '', evidence: row.cells[2]?.querySelector('input')?.value.trim() || '', owner: row.cells[3]?.querySelector('input')?.value.trim() || '', targetDate: row.cells[4]?.querySelector('input')?.value || '' }));
  }
  function buildCsv() {
    if (!lastRun) return '';
    const rows = [['RegTech Nexus AI · Regulatory Control & Policy Gap Analyzer', 'Independent review-support output', 'Not an official compliance determination'], ['Review label', lastRun.label], ['Framework', lastRun.pack.label], ['Module ID', lastRun.pack.id], ['Review date', lastRun.date], [], ['Control', 'Signal', 'Priority', 'Signal detail', 'Suggested action', 'Suggested owner']];
    lastRun.results.forEach((result) => rows.push([result.control.title, statusLabels[result.status], priorityLabels[result.priority], result.signal, result.control.action, result.control.owner]));
    rows.push([], ['Evidence Gap Action Plan', 'Priority', 'Action', 'Evidence reference / note', 'Owner', 'Target date']); actionRows().forEach((row) => rows.push(['', row.priority, row.action, row.evidence, row.owner, row.targetDate]));
    rows.push([], ['Boundary', 'Browser-local review support only. Validate current official sources, applicability, operating evidence and professional judgment before use.']);
    return '\uFEFF' + rows.map((row) => row.map(escCsv).join(',')).join('\r\n');
  }
  function downloadCsv() { const blob = new Blob([buildCsv()], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `rnx-policy-gap-review-${today()}.csv`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); elements.exportStatus.textContent = 'CSV downloaded. Keep the source version and review rationale with the exported file.'; }
  async function copySummary() { if (!lastRun) return; const open = lastRun.results.filter((result) => result.status !== 'covered'); const content = [`RegTech Nexus AI · Regulatory Control & Policy Gap Analyzer`, `Review: ${lastRun.label}`, `Framework: ${lastRun.pack.label} (${lastRun.pack.id})`, `Date: ${lastRun.date}`, '', `Covered: ${lastRun.results.filter((r) => r.status === 'covered').length}`, `Partial: ${lastRun.results.filter((r) => r.status === 'partial').length}`, `Open/conflicting: ${open.length}`, '', ...open.map((result, index) => `${index + 1}. ${priorityLabels[result.priority]} · ${result.control.title} — ${result.control.action}`), '', 'Independent browser-local review support only; verify official sources, applicability and evidence.'].join('\n'); try { await navigator.clipboard.writeText(content); elements.exportStatus.textContent = 'Summary copied to the clipboard.'; } catch { elements.exportStatus.textContent = 'Clipboard access was unavailable. Use Download CSV or Print / Save PDF.'; } }

  elements.framework.addEventListener('change', () => { renderSource(); if (!elements.results.hidden) elements.results.hidden = true; setStatus('Framework changed. Review the source path and run the analysis again.'); });
  elements.policy.addEventListener('input', updateCount); elements.load.addEventListener('click', sample); elements.analyze.addEventListener('click', analyse); elements.clear.addEventListener('click', clearAll); elements.download.addEventListener('click', downloadCsv); elements.copy.addEventListener('click', copySummary); elements.print.addEventListener('click', () => window.print());
  renderSource(); updateCount();
})();
