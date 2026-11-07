# AlfiQ Production SaaS — Architecture and Delivery Blueprint

Status: Proposed architecture; not implemented or production-ready.
Owner: RegTech Nexus AI
Product: AlfiQ — Regulatory Change Impact Agent

## 1. Product boundary

AlfiQ is a regulatory change management and decision-support SaaS. It assists authorised users with source intake, version comparison, candidate obligation extraction, impact triage, action tracking and evidence-backed human review.

It must not claim to provide legal advice, regulatory approval, certification, guaranteed completeness, or autonomous compliance determinations. Regulatory source status, applicability, effective dates and legal interpretation require qualified human validation.

## 2. Proposed target architecture

- Web application: Next.js / React with TypeScript; accessible responsive UI.
- API: Python FastAPI, versioned REST endpoints, OpenAPI contract.
- Identity: managed OIDC provider with MFA; no home-grown password storage.
- Tenant model: organisation-scoped tenancy; tenant context enforced server-side on every request; PostgreSQL row-level security as defence in depth.
- Database: managed PostgreSQL for organisations, users, roles, sources, document versions, extracted clauses, assessments, actions, approvals, audit events and billing references.
- Object storage: private encrypted bucket for customer-authorised source files and generated reports; short-lived signed URLs; malware scanning and file-type/size limits.
- Processing: asynchronous job queue for extraction, OCR, comparison and report generation; isolated workers; idempotent jobs and retry/dead-letter handling.
- Search: PostgreSQL full-text initially; add vector search only after evaluation and governance approval.
- AI/model gateway: server-side only; provider abstraction, tenant policy, data minimisation, no browser API keys, prompt-injection controls, output validation and model/version logging.
- Regulatory source pipeline: approved source registry, allowlisted official domains, retrieval timestamps, hashes, version lineage, provenance and human source-status verification.
- Observability: centralised logs, metrics, traces, alerting and security event monitoring with sensitive-data redaction.
- Delivery: CI/CD, infrastructure as code, separate dev/staging/production, secrets manager, dependency scanning, backups and tested restore.

Hosting/provider selection is intentionally open pending cost, data residency, privacy, support and Bangladesh/international customer requirements. No paid service is authorised by this blueprint.

## 3. Core application modules

1. Organisation and user administration
2. Role and permission management
3. Regulatory source register and document ingestion
4. Document parsing, OCR and extraction
5. Version comparison and change classification
6. Potential obligation and deadline register
7. Applicability and business-impact assessment
8. Policy, process and control mapping
9. Action register, owners, due dates and escalation
10. Human review, approval and sign-off
11. Evidence and report generation
12. Audit trail and activity history
13. Subscription, plan limits and invoicing integration
14. Platform administration and support

## 4. Minimum data model

- Tenant: organisation, jurisdiction, subscription state, configuration
- User: identity-provider subject, tenant membership, role, status
- Role/permission: least-privilege capability grants
- Source: authority, jurisdiction, instrument type, official URL, source status
- Document: tenant, source, version, hash, dates, file metadata, access classification
- Clause: document version, page/section locator, extracted text, extraction confidence
- Change: old/new clause references, classification, comparison basis, reviewer status
- Obligation: candidate wording, modality, subject, applicability, timing, exceptions, source locator, validation state
- Impact: business area, policy/process/control/system mapping, rationale, reviewer
- Action: owner, due date, priority, status, evidence, approval and closure
- Audit event: actor, tenant, action, object, timestamp, outcome, correlation ID
- Billing reference: provider customer/subscription IDs and invoice status; no raw card data

Every tenant-owned record must carry a tenant identifier and be protected by server-side authorisation and database isolation controls.

## 5. Security and privacy baseline

- MFA for privileged users; SSO option for institutional plans
- RBAC and least privilege; tenant isolation tests on every API object path
- TLS in transit and encryption at rest
- Managed secrets; no secrets in GitHub, frontend bundles or logs
- Private object storage and short-lived signed access
- File validation, malware scanning, archive-bomb and parser limits
- CSRF, XSS, SSRF, injection, rate-limit and abuse protections
- Secure session management and account recovery
- Immutable or tamper-evident audit events for privileged and material actions
- Configurable retention, export and verified deletion workflows
- Encrypted backups, restore drills and incident response process
- Vulnerability/dependency scanning, penetration test and remediation before production
- Privacy notice, data-processing terms, subprocessor register and breach process
- No customer confidential data sent to external model providers unless contract, configuration and customer approval explicitly permit it

## 6. Regulatory intelligence governance

Every regulatory item must record:
- Issuing authority and jurisdiction
- Instrument/document type and binding-status classification
- Official source URL and retrieval timestamp
- Publication, commencement, effective and transition dates where stated
- Document hash and version history
- Supersession/amendment relationships
- Extraction method and confidence
- Human verification status and reviewer
- Clause/page/paragraph references

Change labels:
- New: no supported predecessor identified
- Modified: candidate predecessor and successor pair requiring review
- Removed: prior text not located in the new version; confirm repeal/supersession context
- Retained: text match within defined comparison rules

These are document-comparison classifications, not legal conclusions. Similarity scores must never be presented as legal equivalence.

## 7. Human review and control workflow

Draft → automated extraction/comparison → analyst validation → compliance/legal review → accountable owner acceptance → action tracking → evidence upload → independent closure review.

No AI-generated change, obligation, applicability conclusion or action may be treated as approved without an identified human reviewer and timestamp.

## 8. Delivery phases and release gates

### Phase 0 — Product and risk definition
- Confirm target customers, jurisdictions, data classification and service boundary.
- Approve threat model, data-flow map, privacy impact assessment and retention policy.
- Select hosting, identity, database, storage and model providers only after cost and residency review.
- Define measurable acceptance tests and service-level objectives.

Gate: architecture, budget and data governance approved.

### Phase 1 — Secure SaaS foundation
- Environments, CI/CD, identity, MFA, tenant model, RBAC, database, private file storage, audit logs.
- Tenant isolation and access-control automated tests.
- Admin and organisation setup.

Gate: security review and tenant-isolation tests pass.

### Phase 2 — Regulatory document lifecycle
- Secure upload, parsing, OCR, source register, hashes, versioning and provenance.
- Extraction confidence and manual correction workflow.

Gate: supported file types and source traceability pass test corpus.

### Phase 3 — Change and impact workflow
- Version comparison, New/Modified/Removed/Retained candidate classification.
- Obligation and timing extraction with source locators.
- Human review, impact mapping, action register and approvals.

Gate: labelled evaluation corpus, precision/recall thresholds agreed and met; false-positive/false-negative analysis documented.

### Phase 4 — Reporting and customer operations
- Reports, exports, notifications, organisation admin, support and billing integration.
- Retention, export and deletion tests.

Gate: end-to-end UAT and operational readiness.

### Phase 5 — Controlled production pilot
- Limited customers, approved jurisdictions, public or explicitly authorised data.
- Monitoring, incident response, support, backups and rollback tested.
- Independent security assessment and customer acceptance.

Gate: formal production go/no-go approval.

## 9. Non-functional acceptance criteria

Before production:
- Tenant isolation: automated negative tests show no cross-tenant read/write/export.
- Authorisation: every API endpoint has role and tenant checks.
- Auditability: material user/system actions have actor, timestamp and object references.
- Provenance: every extracted clause/change links to source version and page/section where available.
- Reliability: tested backup restore, queue retry, failure handling and rollback.
- Security: no critical/high unresolved findings from independent security assessment.
- Performance: agreed load profile and response-time targets measured, not assumed.
- Accessibility: WCAG 2.2 AA target with automated and manual checks.
- Privacy: documented retention, deletion, subprocessors, data residency and incident response.
- AI governance: model inventory, evaluation dataset, versioning, prompt-injection tests, human override and monitoring.

## 10. Commercial and operating prerequisites

- Written service terms, scope, exclusions and customer responsibilities
- Data processing agreement and confidentiality terms where applicable
- Pricing validated through customer interviews and paid-pilot evidence
- Support hours, escalation, service availability and incident communications
- Tax, invoicing, payment provider and cross-border payment eligibility reviewed before activation
- No payment gateway or paid infrastructure is to be purchased without explicit budget approval

## 11. Explicitly out of scope until separately approved

- Automated legal interpretation or legal advice
- Guaranteed regulatory completeness
- Autonomous control-gap determination or remediation approval
- Production sanctions/transaction screening engine
- Processing of SAR/STR, KYC, customer or transaction records in the prototype
- Any claim of certification, regulator endorsement or compliance guarantee

## 12. Current-state migration principle

Keep the existing GitHub Pages AlfiQ workspace and services pages available as a clearly labelled prototype/marketing surface during development. Build the SaaS application in a separate application path/repository or isolated deployment. Do not replace the current prototype until the new service passes all release gates and the owner explicitly approves migration.

## 13. Decisions required before implementation

1. Approved initial budget and monthly operating-cost ceiling
2. First launch jurisdiction(s) and customer segment
3. Whether first pilot is public-document-only or includes customer-authorised confidential documents
4. Data residency and retention requirements
5. Hosting and identity provider selection
6. AI provider/model policy and whether customer data may leave the hosting region
7. Payment and invoicing approach
8. Named human reviewer/accountable service owner

Until these decisions and release gates are satisfied, AlfiQ must not be described as a complete production SaaS.
