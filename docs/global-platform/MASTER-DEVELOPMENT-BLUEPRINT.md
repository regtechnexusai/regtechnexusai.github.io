# RegTech Nexus AI — Global Platform Development Blueprint
Version: 1.0
Status: Proposed delivery baseline
Prepared: 6 November 2026

## 1. Product direction

RegTech Nexus AI is being developed as a global Banking RegTech and Intelligence Platform. Bangladesh is a core jurisdiction and research foundation, not the boundary of the platform. International coverage will expand through jurisdiction-specific research and verified primary sources.

The platform will connect:
- Global regulatory intelligence and jurisdiction research
- Financial-crime intelligence and review-support
- Internal control, audit and assurance workflows
- Responsible AI and model governance
- Banking risk and decision tools
- Research and professional learning

This is an incremental evolution of the existing GitHub Pages website. Existing tools, URLs, calculations, algorithms and learning content are protected unless a separately approved change explicitly requires otherwise.

## 2. Research and originality standard

External products, including Tookitaki, may be studied to understand market needs and capability patterns. Their wording, page structures, graphics, proprietary taxonomies, source code and product designs must not be copied.

For every new content or product feature:
1. Identify the user problem and intended audience.
2. Gather authoritative and relevant sources.
3. Verify source owner, publication date, legal status, jurisdiction and applicability.
4. Separate source facts from RegTech Nexus AI analysis and recommendations.
5. Write original explanations with varied sentence lengths.
6. Include a practical example, user benefit and methodology.
7. Disclose technical and regulatory limitations.
8. Validate links, accessibility, responsiveness and functional behaviour before release.

## 3. Platform architecture principles

### 3.1 Global jurisdiction model
Use a common information model with local overlays. A global standard or framework is not automatically a domestic legal requirement. Country profiles must identify the competent authority, official sources, source dates, effective dates where known, applicability and coverage status.

Recommended coverage states:
- Verified: primary source checked and the profile reviewed.
- Partially verified: some material is checked; gaps are disclosed.
- Research pending: a profile is not ready for reliance.
- Not covered: no substantive assessment is published.

A directory listing or link to an international organisation does not constitute a completed country assessment.

### 3.2 Shared intelligence data
Future shared data records should support:
- Stable record identifier and version
- Topic, category and jurisdiction scope
- Original summary and practical review prompts
- Primary source identifiers and source URLs
- Publication date, effective date and date checked
- Legal or publication status
- Applicability and limitations
- Related controls and evidence examples
- Review owner/status and change history

### 3.3 Presentation and service layers
Current phase: retain GitHub Pages and static assets. Structured JSON can support version-controlled reference content and browser-side filtering.

Later phases may introduce an API, PostgreSQL, identity management and institutional workspaces when there is a validated use case, security design, data-protection assessment and operating budget. Do not introduce a backend merely for architectural appearance.

### 3.4 Trust, safety and data boundaries
Public tools should not request confidential bank or customer information unless a separately designed and approved secure environment exists. The current financial-crime reference release uses public information and static review prompts only.

No autonomous suspicion decision, STR filing, customer clearance, live sanctions determination or production transaction monitoring is implied.

## 4. Initial release: Global Financial Crime Intelligence

### Purpose
Provide a source-led reference environment that helps compliance, trade-finance, audit and risk professionals organise potential financial-crime indicators, ask better questions and identify relevant evidence and controls.

### Initial information domains
1. Business structure
2. Trade activity
3. Trade documents and goods
4. Accounts and payments

These domains are informed by FATF/Egmont published TBML risk-indicator work. The initial review patterns are original explanatory prompts, not a reproduced official list or a detection model.

### Review method
Context → Indicator → Corroboration → Control test → Human disposition.

### Source foundation
- FATF/Egmont, Trade-Based Money Laundering: Risk Indicators (11 March 2021).
- Basel Committee/BIS, Basel Consolidated Guidelines, AFS10 AML/CFT module (published 1 January 2026).
- FATF Recommendations (current consolidated publication; amended June 2026).
- FATF Money Laundering National Risk Assessment Guidance (updated 28 August 2025).

### User value
- Compliance officers gain consistent review questions.
- Trade-finance teams can structure document and commercial-context checks.
- Auditors can connect observations to evidence and control testing.
- Risk managers can identify recurring control themes and training needs.

## 5. Roadmap

### Phase 1 — Research and reference foundation
- Publish the initial Global Financial Crime Intelligence page.
- Maintain structured review-pattern data as versioned JSON.
- Add the page to homepage pathways and sitemap.
- Test filter/search behaviour, keyboard use, mobile layouts and source links.

### Phase 2 — Global source and jurisdiction records
- Define a reusable source-register schema.
- Expand jurisdiction profiles based on primary-source availability and user demand.
- Record source date, legal status, applicability and coverage state.
- Avoid claims of global coverage beyond verified research.

### Phase 3 — Scenario and control testing
- Add synthetic scenario examples with expected observations and test cases.
- Map patterns to control objectives and evidence requests.
- Distinguish rule demonstration from production detection.
- Add test coverage, versioning and review notes.

### Phase 4 — Audit and evidence workflows
- Design a case/evidence workflow for internal review support.
- Define role, ownership, approval and audit-trail requirements.
- Conduct privacy and security threat modelling before any institutional data is accepted.

### Phase 5 — Governed intelligence services
- Assess the need for secure backend, API, search and AI services.
- Require source-grounded answers, citation traceability and human review.
- Introduce institution-specific access and retention only after formal security and data-protection design.

## 6. Protected existing functionality

The following are regression-protected:
- PayScale 2026 formulas, calculations, assumptions and logic
- Derivatives calculator formulas and calculation logic
- Existing TradeGuard scope and user-facing boundaries
- ICMS and Policy Gap Analyzer functionality
- International Readiness assessment logic and existing country labs
- Student Knowledge Hub content and learning behaviour
- MUKUL and other unrelated project areas

Changes to shared styles or navigation must be scoped and tested for unintended effects.

## 7. Acceptance criteria for the initial release

- New page is reachable from the homepage and included in sitemap.
- All text is original and source-linked.
- The four information domains are described accurately.
- At least eight review patterns have unique IDs and defined limitations.
- Search and domain filters work without external services.
- Data is rendered using safe DOM APIs; no untrusted HTML injection.
- No personal or confidential data is requested or stored.
- Keyboard focus, labels, mobile layout and reduced-motion preference are supported.
- Primary source links resolve and show publication context.
- Existing tools and calculators are not changed.
- Static regression checks pass before merge.
- Post-deployment visual and link checks remain release tasks.

## 8. Release governance

Development proceeds on a feature branch and is proposed through a pull request. The production branch is not changed directly. A pull request must describe scope, preserved functionality, verification performed and any outstanding release checks.

No claim of production readiness, certification, regulatory endorsement or institutional deployment may be made without evidence.
