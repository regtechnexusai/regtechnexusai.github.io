# RegTech Nexus AI — Independent Audit & Remediation Master Register

**Register ID:** RNX-AUDIT-MASTER-2026-11-18  
**Assessment cut-off:** 18 November 2026  
**Repository:** `regtechnexusai/regtechnexusai.github.io`  
**Status:** Baseline consolidation — remediation not yet independently retested  
**Purpose:** Consolidate three external desk assessments into one evidence-led, maintainable findings register. This document is an internal management tracker, not a certification, penetration-test report, legal opinion, or independent assurance attestation.

---

## 1. Management position

The three assessments supplied for consolidation report maturity scores of **42.6/100**, **40.4/100**, and **54.8/100**. They use different evidence sets, scoring interpretations and confidence levels. Their scores are therefore **not directly comparable and must not be averaged or represented as a trend**.

**Consolidated management classification: High-priority improvement required for institutional reliance.**  
**Permitted positioning pending evidence:** educational, research and synthetic-data decision-support use, with human verification and the published limitations observed.  
**Production banking readiness:** Not demonstrated.  
**Controlled institutional pilot:** Not approved by this register. A separately scoped, synthetic-data-only research or usability exercise may be considered after its own safeguards and acceptance criteria are documented.  
**Global ranking:** **No independently verified global ranking identified.**

The assessments support a credible early-stage regulatory-intelligence and decision-support portfolio, but do not establish production-grade security, validated AI performance, complete functional reliability, enterprise integrations, independent certifications, customer deployments or market leadership.

### 1.1 Score treatment

| Assessment supplied | Reported score | Treatment in this register |
|---|---:|---|
| Assessment A — expanded desk review | 42.6/100 | Retained as a source-reported score only |
| Assessment B — international audit and ranking | 40.4/100 | Retained as a source-reported score only |
| Assessment C — more favourable public-evidence review | 54.8/100 | Retained as a source-reported score only |

**No consolidated numeric score is assigned.** A defensible re-score requires a common rubric, a defined evidence cut-off, reproducible tests, severity weighting, and evidence of closure. A higher desk-review score is not proof that the platform improved.

## 2. Evidence and confidence rules

### 2.1 Evidence classes

- **D — Disclosed:** stated in a public product, privacy, trust or bank-use page, or in the assessment text supplied to the reviewer. A disclosure is not necessarily an independently verified technical fact.
- **O — Observed:** directly reproduced through a controlled test or inspection, with date, URL, environment and result recorded.
- **I — Inferred risk:** plausible consequence of an evidenced design or disclosure; not a confirmed vulnerability.
- **NT — Not Tested:** no test result is available. This must never be converted into a pass or fail.
- **C — Conflicted:** supplied assessments or public statements differ and require reconciliation.

### 2.2 Confidence

- **High:** directly supported by reproducible evidence or consistent explicit disclosures.
- **Medium:** supported by a credible disclosure or multiple consistent secondary observations, but not independently reproduced.
- **Low:** inferred, incomplete, stale, or dependent on unavailable technical evidence.

### 2.3 Severity convention

- **Critical:** demonstrated material compromise or severe exposure requiring immediate containment.
- **High:** material institutional, privacy, security or decision-integrity risk, or a release blocker for the intended use.
- **Medium:** meaningful weakness requiring planned remediation.
- **Low:** limited impact or hygiene improvement.
- **Informational:** scope limitation, design choice or observation without an evidenced vulnerability.

No CVSS score is assigned in this baseline because no exploitable vulnerability has been technically confirmed. CVSS may be added only after a specific vulnerability and its attack conditions are established.

## 3. Consolidated findings register

All items begin with status **Open — evidence/retest pending** unless stated otherwise. “Owner” identifies the accountable function, not a named individual. Target windows are proposed from the register date and may be reprioritised by management.

| ID | Category | Affected component | Consolidated observation and evidence basis | Severity | Confidence | Accountable function | Target | Required action / closure evidence |
|---|---|---|---|---|---|---|---|---|
| GOV-01 | Governance / Privacy | Privacy, Trust, Bank-use Review, Contact, GaaS, individual tools | **C:** The assessments identify inconsistent descriptions of browser-local processing, Google Analytics, Cloudflare Worker/Turnstile, Resend, GaaS staging API and external AI providers. Exact page-by-page flows were not captured in one authoritative inventory. | High | High that reconciliation is needed; actual flow details Medium | Product + Engineering + Privacy | 0–14 days | Create a version-controlled data-flow register covering each page/tool, data categories, browser storage, third parties, purpose, destination, retention, transfer geography, consent/legal basis where applicable, and deletion. Reconcile every public statement. Closure: approved map plus page-by-page copy review and network evidence. |
| PRIV-01 | Privacy / Compliance | Site-wide analytics; especially PayScale | **C:** One assessment reports Google Analytics ID G-TF41MZMKPN loaded on the website and another notes a PayScale statement that analytics/third-party scripts are not used. Whether GA loads on PayScale and whether consent controls operate were not reproduced. | High | High for reported disclosure conflict; Low for page-specific behaviour | Engineering + Privacy | 0–14 days | Inspect actual requests on homepage and each relevant tool, including PayScale, in clean sessions and consent states. Decide whether analytics is used; implement appropriate consent/configuration or remove it; align privacy notice and page disclosures. Closure: timestamped network/HAR evidence and updated policy. |
| SEC-01 | Cybersecurity | Public TLS endpoints | Bank-use Review reportedly discloses a Qualys SSL Labs Grade B screenshot for four endpoints. The underlying screenshot and current scan were not independently inspected in the supplied assessments. Grade B cause is unknown. | High pending verification; do not treat as confirmed current defect | Medium for historical self-disclosure; Low for present state | Infrastructure / DNS | 0–14 days | Run fresh SSL Labs tests for apex, www and every relevant public subdomain/API hostname. Preserve reports. Remediate only evidenced protocol/cipher/certificate/configuration issues. Closure: current reports and configuration diff; target A/A+ where technically achievable. |
| SEC-02 | Cybersecurity / Email | Contact and security/privacy channels; domain DNS | Assessments report use of a consumer Gmail contact route and allege domain SPF/DKIM/DMARC are absent. Gmail routing alone does not prove missing domain authentication. DNS state was not supplied as reproducible output. | High for channel maturity; domain spoofing exposure unconfirmed | Medium | Operations + DNS / Email administrator | 0–30 days | Query authoritative DNS for SPF, DKIM selectors and DMARC; inspect legitimate outbound mail headers. Establish role-based domain addresses (e.g., contact/security/privacy) if approved. Publish DMARC policy progressively after legitimate senders are inventoried; do not jump to p=reject without validation. Closure: DNS output and aligned message-header evidence. |
| SEC-03 | Cybersecurity | All public pages and GaaS API | Security headers, CSP, CORS, HSTS, frame protections and cookie attributes are **Not Tested** in the supplied reviews. No vulnerability is established by this absence of evidence. | Medium (assurance gap) | High | Engineering / Infrastructure | 0–30 days | Capture response headers for representative pages and API preflight/response paths. Design CSP from observed dependencies; deploy in report-only first where appropriate, then enforce. Verify HSTS scope and preload implications before enabling. Closure: header scan, browser console and regression evidence. |
| SEC-04 | Cybersecurity / Governance | `/.well-known/security.txt`, security contact and disclosure process | Assessments did not identify a public vulnerability-disclosure policy or security.txt. This is an absence-of-evidence finding, not proof that no internal process exists. | Medium | Medium | Security / Operations | 0–30 days | Publish valid security.txt with monitored contact and expiry; add coordinated vulnerability disclosure policy, safe-harbour boundaries where legally reviewed, triage and response targets. Closure: live URL and contact-routing test. |
| SEC-05 | Cybersecurity | Third-party scripts and dependencies | External services mentioned include analytics, Google Translate, Cloudflare Turnstile, Resend, external GPT and AI providers. Complete script/dependency inventory, SRI/CSP coverage and version governance are **Not Tested**. | Medium | Medium | Engineering | 15–30 days | Inventory scripts, SDKs, APIs, npm/build dependencies and data access. Record purpose, owner, version, permissions, data sent and fallback. Restrict origins with CSP; use SRI where suitable. Closure: inventory and dependency/security scan. |
| MUK-01 | Cybersecurity / Privacy / AI | MUKUL experimental Gemini workflow | Assessment A reports that the page invites users to paste a personal Gemini API key and may send a selected photo to Google after consent; the page reportedly warns that browser-held keys cannot be protected. Current live behaviour was not independently reproduced in this consolidation. | High | Medium | MUKUL Product + Engineering | 0–14 days | Disable or remove browser-side personal API-key entry pending redesign. Prefer a server-side proxy with secrets in managed secret storage, strict quotas, abuse controls and explicit data-flow/retention disclosure. If no safe proxy is approved, keep the feature disabled and retain the local prototype. Closure: source review, network test and key-exposure test. |
| TRADE-01 | Software / Privacy | TradeGuard document assessment / OCR | Assessment A identifies an OCR-assisted document path while the homepage reportedly says documents are not uploaded or stored. OCR execution location and any network transmission were not verified. | High | Medium | TradeGuard Product + Engineering | 0–14 days | Trace the full OCR path in source and browser network traffic. Document whether OCR is local, remote or provider-hosted; identify temporary files, retention and telemetry. Align UI/privacy claims. Closure: reproducible local/remote test and approved data-flow entry. |
| TRADE-02 | Software / Governance | TradeGuard score and report | A sample score of 55/100 is reportedly labelled HIGH; calibration, thresholds, rule coverage and validation dataset are not documented in the supplied evidence. | Medium | Medium | TradeGuard Product / Risk Methodology | 15–30 days | Publish a transparent scoring methodology, threshold rationale, limitations and synthetic test vectors. Do not imply calibrated risk probability. Closure: expected-vs-actual test report and approved methodology. |
| TRADE-03 | Privacy / Operations | TradeGuard report email/export | Assessment A reports a user-initiated Gmail email-export route. Actual recipient, attachment handling and browser/provider transmission were not tested. | Medium | Medium | TradeGuard Product + Privacy | 15–30 days | Document the exact export/email mechanism, user confirmation, attachment contents and recipient handling. Ensure no silent transmission; add warning against confidential data. Closure: network trace and user-flow test. |
| CALC-01 | Software / Regulatory | MD/CEO KPI Calculator | Assessment A reports three sample rows recomputed correctly (CRAR, Gross NPL, ROE), but full 30-KPI weights, circular mapping, critical-KPI deductions and boundary behaviour remain **Not Tested**. Assessment B also marks full formula testing Not Tested. | High for professional reliance until full verification; no defect established | Medium | Calculator Product Owner + Regulatory Reviewer | 0–30 days | Build a circular-to-formula traceability matrix and unit tests for all 30 KPIs, thresholds, missing values, rounding, lower-/higher-is-better metrics, critical deductions and exact 50% boundary. Preserve current logic unless a test proves a defect and change is approved. Closure: independent expected-vs-actual test pack. |
| CALC-02 | Software / Regulatory | PayScale 2026 | Version/freshness and official-rule mapping are challenged in earlier assessments. Conditional assumptions are disclosed; full formula and effective-date verification is not evidenced. Page-specific analytics behaviour is tracked under PRIV-01. | High for reliance on unverified output; no formula defect established | Medium | PayScale Product Owner + Regulatory Reviewer | 0–30 days | Freeze a versioned rule inventory against official source instruments and effective dates. Add boundary and regression tests. Do not alter calculator logic without demonstrated discrepancy and approval. Closure: source-to-rule matrix, test vectors and release identifier. |
| CALC-03 | Software | Derivatives calculators | Formula accuracy, units, edge cases, conventions and version applicability are **Not Tested** in the supplied assessments. | Medium | Low | Derivatives Product Owner | 31–60 days | Define supported formulas/conventions and authoritative references; create numerical test vectors including zero/negative/near-boundary inputs where valid. Closure: reproducible unit-test report. |
| AI-01 | AI Governance / Software | AlfiQ / Regulatory Copilot / Policy Gap Analyzer | Assessments consistently identify a gap between conceptual source-verification/HITL messaging and publicly demonstrated citation accuracy, hallucination controls, false-positive/false-negative metrics, model evaluation and audit logs. Runtime evaluation was not supplied. | High | High for missing public validation evidence; model performance itself Low | AI Product + Model Risk | 15–60 days | Create a versioned benchmark of regulatory questions and document comparisons using authoritative source texts. Measure citation precision/completeness, unsupported-claim rate, abstention/refusal behaviour, false positives/negatives and reviewer overrides. Publish limitations, not unsupported accuracy claims. Closure: signed evaluation report and reproducible dataset/method. |
| AI-02 | AI / Cybersecurity / Privacy | AlfiQ GaaS Phase 1 Live Research API | Supplied project context states the GaaS public page is a preview, Phase 1 research calls a staging Worker API protected by Turnstile, and the work is not production-deployed. Assessments do not establish live API security, retention, provider terms or production readiness. | High for any institutional reliance; staging boundary must remain explicit | High for disclosed preview status; Low for live technical controls | GaaS Product + Engineering + Privacy | 0–30 days | Verify deployed environment and release state; inspect Worker secrets, rate limiting binding, provider spend limits, timeouts, payload minimisation, logs, retention, provider terms and error sanitisation. Keep preview labels and prohibit sensitive data. Closure: staging test evidence and approved go/no-go checklist. |
| ARCH-01 | Architecture / Software | ICMS, TradeGuard, Gap Analyzer, KPI tools, GaaS | Assessments report standalone tools are not integrated into a unified identity, data bus, case store or audit layer. Browser-local storage is described for some tools. This is a product-scope limitation, not inherently a defect for a static educational tool. | Medium | High for disclosed boundaries | Product Architecture | 31–90 days | Maintain explicit per-tool architecture and persistence matrix. Do not promise unified case management until implemented. If institutional workflow is pursued, design a separate app boundary with identity, RBAC, encrypted persistence, audit logging, tenant isolation and recovery. Closure: approved architecture and tested MVP gates. |
| CLAIM-01 | Product / Marketing | Homepage, GaaS, jurisdiction coverage pages | Assessment C challenges a “200+ jurisdictions” statement against a smaller number of currently interactive labs. The exact claim and full current inventory were not reproduced in this consolidation. | Medium | Medium | Product Marketing + Regulatory Research | 0–14 days | Verify exact wording and count. Separate source-network reach, planned coverage, static reference coverage and interactive validated profiles. Publish dated coverage matrix. Closure: claim-to-inventory reconciliation. |
| LEGAL-01 | Governance / Compliance | Legal imprint, Terms, Privacy, procurement disclosures | Assessments raise questions about contracting-entity disclosure, data-processing terms, subprocessors and certifications. No claim is made here that a particular licence or certification is legally required for the current educational platform. | High for B2B procurement readiness; applicability requires legal review | Medium | Management + Legal / Privacy | 15–60 days | Confirm and accurately disclose the contracting entity and jurisdiction; review Terms, privacy notice, processor/subprocessor list, retention and cross-border processing. State certifications only if independently evidenced. Closure: legal review and approved public disclosures. |
| UX-01 | Accessibility / Performance | Whole site and mobile layouts | Core Web Vitals, responsive behaviour, cross-browser operation, keyboard access and WCAG 2.2 AA have not been consistently tested in the supplied assessments. | Medium | High that testing is outstanding; actual defect level Low | Frontend Engineering + QA | 15–60 days | Run Lighthouse/PageSpeed and device tests; axe-core/WCAG review; keyboard and screen-reader spot checks. Record per-template results and remediate verified defects. Closure: before/after reports and regression suite. |
| BRAND-01 | Product Strategy | Main domain / MUKUL / Student Hub / other initiatives | Assessments disagree on whether cross-vertical breadth materially dilutes institutional credibility. This is a strategic positioning question, not a confirmed technical vulnerability. | Low | Medium | Management / Product Strategy | 31–90 days | Review navigation, audience segmentation and product hierarchy. Prefer clear sections/subdomains before costly domain migration. Do not migrate projects without SEO, ownership, cost and maintenance analysis. Closure: approved brand architecture decision. |
| TEST-01 | Software Quality | All public tools and forms | The three assessments leave substantial interactive testing unperformed: forms, buttons, exports, validation, mobile, browser compatibility, data integrity and error handling. Visibility of a control is not proof it works. | High for professional use until tested | High | QA / Product Owners | 0–60 days | Create a product-by-product regression matrix with environment, test ID, input, expected result, actual result, screenshot/log, defect ID and retest status. Prioritise tools used for financial/regulatory calculations. Closure: all critical/high tests passed or documented exceptions approved. |
| MARKET-01 | Business / Competitive | Public claims and market positioning | All three assessments identify no independently verified global ranking, and no sufficient public evidence of production deployments, market share or global analyst placement. | Informational | High within the supplied evidence scope | Management / Business Development | Ongoing | Use accurate “emerging / early-stage” positioning. Build verifiable pilot references and outcome evidence with permission. Never imply a top-tier ranking, certification or market leadership without a credible source. Closure: independently verifiable evidence. |

## 4. Not Tested register — explicit evidence backlog

The following are not passed, failed or vulnerabilities. They require authorised, non-destructive testing:

1. HTTP response headers, CSP, HSTS, CORS and cookie attributes.
2. Current TLS protocols, cipher suites, certificate chain and all relevant hostnames.
3. DNS SPF, DKIM and DMARC records; outbound message alignment.
4. Actual analytics requests and consent-state behaviour on each relevant page.
5. TradeGuard OCR execution location and complete network/data flow.
6. MUKUL API-key handling and image transmission behaviour.
7. GaaS staging API rate limiting, CORS, payload validation, secrets, logs, retention and provider processing.
8. XSS, CSRF, injection and output encoding through authorised test cases in a safe staging environment.
9. Core Web Vitals, mobile viewports, cross-browser behaviour and WCAG accessibility.
10. All calculator formulas and boundary cases beyond the three reported MD/CEO sample rows.
11. Export integrity, download behaviour, email egress and form validation.
12. Dependency inventory, vulnerability scanning and build/release reproducibility.
13. Uptime, backup/recovery and operational monitoring; no SLA is assumed.

## 5. Remediation plan and exit gates

### Days 0–14 — reconcile trust and contain obvious design risks

- Close GOV-01 data-flow inventory and PRIV-01 analytics reconciliation.
- Verify current TLS and DNS/email state before changing configuration.
- Remove/disable MUKUL browser-side personal API-key entry until a safe design is approved.
- Determine TradeGuard OCR location and align public claims.
- Verify the “200+ jurisdictions” claim and correct it if necessary.
- Preserve the GaaS preview/staging boundary and no-sensitive-data warning.

**Exit gate:** no unresolved contradictory data-flow statements for the identified services; high-risk browser-key path disabled or demonstrably redesigned; TLS/DNS evidence captured.

### Days 15–30 — baseline security and core calculator assurance

- Complete SEC-03/04/05 baseline: headers/CSP, security.txt and third-party inventory.
- Complete MD/CEO and PayScale source-to-rule matrices and regression tests.
- Document TradeGuard scoring thresholds and email/export flow.
- Complete GaaS staging configuration review and go/no-go checklist.
- Publish accurate legal/privacy/subprocessor disclosures after review.

**Exit gate:** critical calculator test cases have expected-vs-actual evidence; no unsupported security/certification claims; staging API controls reviewed.

### Days 31–60 — product validation and accessibility

- Complete AI-01 evaluation benchmark and model/output documentation.
- Complete derivatives test vectors.
- Run performance, mobile, browser and accessibility checks.
- Complete legal/privacy assessment for intended markets and data categories.
- Establish a release evidence pack for each public tool.

**Exit gate:** product owners sign off intended-use boundaries and test results; high-severity defects are fixed or the affected feature is disabled/clearly restricted.

### Days 61–90 — institutional foundation decision

- Decide whether to fund a separate institutional application architecture; no backend rebuild is assumed or authorised by this register.
- If proceeding, approve threat model, identity/RBAC, tenant isolation, encryption, audit logging, retention, backup and recovery requirements before implementation.
- Consider independent penetration testing after the target environment and scope are stable.
- Begin ISO/IEC 27001 readiness gap analysis only if commercially justified.
- Obtain permissioned, measurable pilot evidence before making deployment claims.

**Exit gate:** documented management go/no-go decision for any institutional pilot. No production banking use until security, legal, privacy, validation, resilience and operational acceptance criteria are independently evidenced.

## 6. Product-specific protection rules

The remediation programme must preserve the following constraints:

1. Do not change PayScale, MD/CEO KPI, derivatives or other calculator formulas, algorithms or business logic merely to improve a maturity score. Change only when a reproducible test demonstrates a defect and the owner approves the correction.
2. Do not break the existing GitHub Pages architecture or existing public URLs.
3. Keep GaaS in its approved preview/staging state. No production launch, paid infrastructure or subscription commitments without explicit management approval.
4. Preserve TradeGuard's synthetic-data and decision-support limitations unless a separately approved product scope changes them.
5. Preserve MUKUL's prototype/non-diagnostic boundaries; do not introduce agronomic diagnosis or dosage recommendations through this audit remediation.
6. Every code change must be isolated, reviewed, regression-tested and merged only after required checks pass.
7. A finding is not “Closed” when a code change is committed. It is closed only after the specified retest evidence is attached and accepted.

## 7. Finding lifecycle and evidence requirements

Use the following statuses:

- **Open — evidence pending**
- **Confirmed — remediation required**
- **In progress**
- **Implemented — retest pending**
- **Retest passed**
- **Closed — evidence accepted**
- **Accepted risk** (requires named approver, rationale, expiry/review date)
- **Not applicable** (requires documented rationale)

Every retest record must include: finding ID, test date/time and timezone, tester, environment/URL, tool and version, exact steps/inputs, expected result, actual result, evidence link or file, defect/commit/PR reference, outcome and reviewer.

Do not store secrets, personal data, customer data, production credentials or sensitive security artefacts in this public repository. Keep restricted evidence in an appropriately access-controlled location and link only to sanitised evidence.

## 8. Source register and provenance

This register consolidates the three assessment texts supplied by the organisation in the current review. Their observations are treated as assessment inputs, not as independently reproduced test results.

Relevant public pages and artefacts named in those assessments include:

- https://regtechnexusai.com/
- https://regtechnexusai.com/privacy.html
- https://regtechnexusai.com/bank-use-review.html
- https://regtechnexusai.com/terms.html
- https://regtechnexusai.com/contact.html
- https://regtechnexusai.com/gaas/
- https://regtechnexusai.com/mukul/
- https://regtechnexusai.com/tradeguard/
- https://regtechnexusai.com/payscale-2026/
- https://regtechnexusai.com/md-ceo-performance-calculator/
- https://regtechnexusai.com/regulatory-gap-analyzer/
- https://regtechnexusai.com/creations/

URLs above are assessment leads; their current content and runtime behaviour must be checked before a finding is marked verified. The path names are not assertions that a page is currently available.

Relevant benchmark frameworks for scoping future tests include OWASP Top 10 and ASVS, NIST CSF, NIST AI RMF, ISO/IEC 27001, ISO/IEC 42001, ISO/IEC 23894, FATF Recommendations, applicable Basel Committee publications and applicable data-protection law. Referencing a framework does not establish conformity or certification.

---

## 9. Management approval record

| Decision | Status |
|---|---|
| Adopt this as the consolidated working register | Pending management approval |
| Approve 0–14 day evidence and disclosure reconciliation | Pending |
| Approve changes to live infrastructure or third-party settings | Not authorised by this register |
| Approve paid services, external penetration test or certification programme | Not authorised; separate approval required |
| Approve production or institutional banking pilot | Not approved |
| Approve changes to calculator logic or algorithms | Not authorised; defect evidence and separate approval required |

**Prepared:** 18 November 2026  
**Next review:** After the first evidence-reconciliation and security-verification cycle.
