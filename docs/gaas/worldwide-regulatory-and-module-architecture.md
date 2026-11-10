# GaaS — Worldwide Regulatory Intelligence and Integrated Modules

**Version:** 1.0  
**Prepared:** 10 November 2026  
**Status:** Product and technical baseline — implementation and coverage must be independently evidenced

## 1. Product mandate

GaaS is a worldwide Governance, Regulatory Intelligence, Risk, Compliance and Assurance SaaS platform. It is not a Bangladesh-first or six-country-only service. No country is the default market. Customers must be able to select any supported country, territory, regulator, cross-border regime or international standard relevant to their legal entities and activities.

Worldwide coverage is a target architecture, not a claim that all jurisdictions have already been indexed or verified. Public product copy and customer reports must disclose actual coverage by jurisdiction, authority, topic and last-checked date.

## 2. Customer and sector scope

The platform is designed for:
- Banks, banking groups and branches;
- Non-bank financial institutions and finance companies;
- FinTechs, digital banks, payment institutions, PSPs, PSOs, e-money and remittance providers;
- Insurance and reinsurance firms;
- Securities firms, investment managers, brokers and market infrastructures;
- Digital-asset service providers where relevant law applies;
- Financial-services consultants, compliance advisers and audit firms.

Applicability must be assessed by legal entity, licence, institution type, products, services, activity, customer segment and cross-border footprint. Do not infer that a rule applies to every financial institution in a country.

## 3. Global source and standards universe

### 3.1 National and sub-national sources

Maintain a jurisdiction registry covering countries and relevant territories. Discover and monitor, where available:
- Legislatures, official gazettes and consolidated legislation portals;
- Central banks and prudential supervisors;
- Financial-intelligence units and AML/CFT authorities;
- Securities, insurance, pension and market-conduct regulators;
- Payment-system, e-money, digital banking and fintech authorities;
- Data-protection, privacy, cybersecurity and digital regulators;
- Tax, customs and corporate registries where relevant to financial-services obligations;
- Stock exchanges and self-regulatory organisations where they issue applicable rules.

Do not rely solely on a manually curated list. Registry-first search must be complemented by open-web discovery and analyst-reviewed authority-page expansion. Secondary commentary can provide context but must never be labelled the issuing authority's original instrument.

### 3.2 International standards and frameworks

Maintain separate source records and applicability rules for:
- FATF Recommendations, interpretive notes, mutual evaluations, follow-up reports and relevant FATF-style regional body publications;
- Basel Framework, Basel Core Principles, supervisory guidance and BCBS publications;
- IFRS Accounting Standards and IAS, IFRS Sustainability Disclosure Standards, and official IFRS Foundation materials;
- International Standards on Auditing (ISA) and relevant IAASB publications;
- IOSCO principles and standards;
- IAIS Insurance Core Principles and supervisory material;
- Financial Stability Board (FSB) standards and recommendations;
- OECD instruments and guidance;
- IMF and World Bank financial-sector assessments and guidance;
- UN Security Council sanctions instruments and other relevant UN instruments;
- ISO management-system and technical standards, subject to licensing and access terms;
- COSO, COBIT and other recognised control/governance frameworks, subject to source and licensing restrictions.

The source record must distinguish a binding national law, regulation or supervisory direction from an international standard, recommendation, consultation, guidance, report or non-binding framework. International standards are not automatically domestic law.

### 3.3 Copyright and licensing

Do not reproduce full copyrighted standards, paid standards text or licensed IFRS content without permission. Store metadata, lawful links, permitted extracts and original RegTech Nexus AI analysis. Obtain appropriate licences before offering licensed text, embedded standard content or paid redistribution. Record licence scope and restrictions.

## 4. Shared jurisdiction and source data model

Every regulatory or standards record should support:
- Stable ID, version, title and document/instrument reference;
- Country, territory, regional bloc or global scope;
- Issuing authority, authority type and official-domain evidence;
- Topic, sector, institution type and regulated activity;
- Instrument type: Act, regulation, rule, circular, notice, order, standard, guidance, consultation, report or other;
- Publication, commencement, effective, transition and repeal dates (each independently recorded);
- Status: draft, consultation, adopted, in force, amended, repealed, superseded, expired, withdrawn, guidance, unknown;
- Original URL, canonical URL, retrieval timestamp and source language;
- Original file/page metadata and SHA-256 where a file is lawfully retrieved;
- Amendment, corrigendum, replacement and predecessor/successor links;
- Applicability assessment and exclusions;
- Related obligations, risks, controls, evidence, tests and remediation;
- Verification dimensions, reviewer, review date and history.

### 4.1 Independent verification dimensions

Do not use one generic "verified" flag. Maintain separate states:
- Discovery: not searched / candidate found / no result;
- Origin: unknown / authority domain matched / issuer corroborated;
- Document identity: unchecked / matched / mismatch / unclear;
- Integrity: not checked / hash recorded / corroborated;
- Publication date: unknown / corroborated / conflicting;
- Legal status: unknown / in force / amended / repealed / superseded / guidance / consultation / other;
- Effective date: unknown / future / effective / retrospective / not applicable;
- Applicability: not assessed / potentially relevant / reviewer-confirmed / not applicable;
- Review: pending / approved / rejected / qualified.

Coverage states at jurisdiction/authority/topic level:
- Verified — defined scope has been checked against primary sources;
- Partially verified — some sources/topics are checked and remaining gaps are disclosed;
- Research pending — not yet ready for reliance;
- Not covered — no substantive assessment is published.

A domain match alone is not sufficient proof of source authenticity. If a primary source is unavailable, preserve the uncertainty rather than reconstructing legal text or guessing status.

## 5. Integrated GaaS product modules

### Core intelligence
1. Circular and Regulatory Intelligence — global source discovery, instrument classification, amendment/status checks and evidence-linked records.
2. AlfiQ Regulatory Change Impact — mapping from source clause to obligation, entity, product, process, risk, control, evidence, test and owner.
3. Regulatory Copilot — source-grounded research and analyst assistance with citations and explicit uncertainty.

### Financial crime and prudential
4. AML/CFT/CPF Intelligence — KYC/CDD/EDD, programme governance, transaction-monitoring controls, sanctions governance, suspicious-activity escalation and FATF-aligned assessment. This is not automatically a live screening or transaction-monitoring engine.
5. FATF and Financial Crime Standards — Recommendations, interpretive notes, mutual evaluation findings and jurisdictional implementation overlays.
6. Basel and Prudential Intelligence — capital, liquidity, leverage, credit, market and operational risk, supervisory review, disclosure and Core Principles.

### Financial reporting and sector compliance
7. IFRS/IAS Intelligence — accounting standards research, IFRS 9/ECL, financial instrument disclosures, revenue, leases, insurance contracts, presentation and sustainability disclosure. Confirm local endorsement, regulator modifications and licensing before making applicability claims.
8. FinTech and Digital Finance Compliance — payment services, e-money, digital banks, remittance, open banking, outsourcing, digital assets and technology risk where applicable.
9. Insurance and Securities Compliance — separate regulator, licence, product and conduct overlays.

### Existing RegTech Nexus AI tools
10. ICMS Manager — existing standalone internal-control and compliance tool; GaaS integration is not live until API/data-flow/access-control tests pass.
11. ICMS Gap Analyzer / Regulatory Gap Analyzer — existing standalone gap assessment tool; preserve its current business rules and calculations during integration.
12. TradeGuard — existing standalone TBML and trade-risk review tool; do not represent it as automated transaction monitoring or a suspicion determination engine.
13. MD/CEO Performance Evaluation — existing standalone executive KPI/performance tool; preserve its formulas and assessment logic.
14. Audit and Assurance Intelligence — audit planning, test procedures, evidence, findings, remediation and retesting.
15. AI Governance and Model Risk — AI inventory, model risk, validation, third-party AI, human oversight and governance evidence.

Existing tools remain independent until integration is demonstrably implemented. A link, product card or shared brand does not constitute integration. Integrations must define API contracts, identity, role permissions, data ownership, tenancy, audit events, error handling, version compatibility and regression tests.

## 6. Common workflow

Discover → Identify source → Verify origin/document/status → Determine applicability → Extract clauses → Structure obligations → Assess impact → Map controls/evidence/tests → Human review → Remediate → Retest → Assure.

Every output must separate:
- Verified source facts;
- AI-generated analysis;
- Analyst assessment;
- Assumptions;
- Unverified items and unresolved questions;
- Reviewer-approved conclusions.

Each material conclusion must link to the original authority/source and relevant clause, page or paragraph where available. Never fabricate a circular, rule, deadline, threshold, regulator, legal status or applicability conclusion.

## 7. Security, privacy and enterprise requirements

Before institutional or confidential data is accepted, implement and independently test:
- Authentication, MFA and secure account recovery;
- Multi-tenant isolation across APIs, databases, files, indexes and exports;
- Role-based and least-privilege access, maker-checker approval and segregation of duties;
- Encryption in transit and at rest, secrets management and key rotation;
- Secure document quarantine, malware scanning, file validation, SSRF-safe URL fetching and sandboxed parsing;
- Prompt-injection isolation for web pages and uploaded documents;
- Audit logging, retention/deletion, backup lifecycle and legal-hold controls;
- Data residency and cross-border processing configuration where legally/contractually required;
- Rate limits, quotas, abuse monitoring, provider-cost controls and safe failure handling;
- Privacy notices, processor disclosures, contractual controls and security incident response.

The public static preview must not accept confidential bank/customer data. A successful unit test or health endpoint does not establish security acceptance.

## 8. Delivery sequence and release gates

### Phase 1 — Live research foundation
- Staging-only research API and source-led web search;
- Origin allowlist, Turnstile verification, request validation and safe diagnostics;
- Unit tests, dependency audit and browser/mobile UAT;
- Confirm staging deployment and health check;
- Live paid-provider smoke test only with separately authorised budget;
- No production release until security, source quality and human-review gates pass.

### Phase 2 — Global regulatory change impact
- Jurisdiction and authority registry schema;
- Clause-level obligation register;
- Entity/product/process applicability;
- Obligation-to-control/evidence/test mapping;
- Gap and remediation register;
- Reviewer workflow, version history and management summary;
- Synthetic tests for prompt injection, missing dates, contradictions, fabricated citations and superseded instruments.

### Phase 3 — Specialist modules and integrations
- AML/CFT/CPF, FATF and Basel packs;
- IFRS/IAS and financial reporting pack;
- FinTech and digital finance pack;
- ICMS, Gap Analyzer, TradeGuard and MD/CEO Evaluation integration assessment and controlled API integration;
- Preserve all existing tool URLs, formulas, calculation logic and business rules.

### Phase 4 — Enterprise SaaS foundation
- Identity, tenancy, access control and audit trail;
- Secure file/URL intake and private storage;
- Subscription entitlements, billing and usage metering;
- Data residency, retention and enterprise contracts;
- Independent penetration test and privacy/security review.

### Phase 5 — Worldwide coverage expansion
- Add country/territory source profiles in a repeatable process;
- Expand language and regulator coverage based on evidence;
- Publish per-jurisdiction/topic coverage states and last-checked dates;
- Measure source freshness, retrieval success, citation accuracy and change-detection recall;
- Do not advertise universal comprehensive coverage until independently measured.

## 9. Acceptance criteria

- Global-first product copy does not privilege a single country or a fixed six-country list.
- Any available jurisdiction can be selected without assuming legal applicability.
- Global standards and national law are clearly distinguished.
- Each coverage claim has source evidence and a last-checked date.
- Original standalone modules are not described as integrated until their integration is tested.
- Existing pricing plans, calculations, formulas and unrelated website functions remain unchanged unless separately approved.
- All test cases have evidence, critical defects are remediated and retested, and human approval is recorded.
- Staging and production release states are disclosed accurately; no live billing, secure uploads, production monitoring or regulatory verification is claimed unless actually enabled and tested.

## 10. Current known release constraints (10 November 2026)

- The GaaS public page and guided plan previews are deployed as a product preview.
- Phase 1 Worker implementation and automated tests exist; the latest main-branch Worker test and dependency audit passed.
- The latest main-branch staging deployment workflow failed at Cloudflare credential validation because `CF_API_TOKEN` and `CF_ACCOUNT_ID` were unavailable to the workflow. Deployment and post-deployment health verification were therefore skipped.
- The live research endpoint has not passed a current paid-provider end-to-end smoke test in this acceptance cycle.
- Accounts, secure customer document intake, tenant isolation, continuous monitoring and live billing are not connected.
- Existing ICMS, Gap Analyzer, TradeGuard and MD/CEO tools remain standalone until integration work is implemented and verified.

These constraints must remain visible until evidence changes their status.
