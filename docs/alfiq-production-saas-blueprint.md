# AlfiQ Production SaaS — Architecture and Delivery Blueprint

Status: Proposed architecture; implementation not yet started; not production-ready.
Owner: RegTech Nexus AI
Product: AlfiQ — Regulatory Change Impact Agent

## 1. Confirmed product and delivery decisions

| Decision | Approved direction |
|---|---|
| Development budget | Zero-cost only |
| Initial document scope | Public regulatory documents only |
| Target market | International from the outset |
| Paid services | No paid hosting, APIs, subscriptions, tools or other services without separate explicit approval |

The international target does not imply immediate support for every jurisdiction. The first release must use a jurisdiction-neutral data model and configurable source registry, then validate a limited, explicitly named jurisdiction/source set before any pilot.

A zero-cost development environment is not equivalent to production-grade hosting, security, availability or support. Until an affordable production environment is separately approved and independently assessed, the application is a local development/test build and must not accept real customer data or be marketed as production-ready.

## 2. Product boundary

AlfiQ is a regulatory change management and decision-support SaaS. It assists authorised users with public-source intake, version comparison, candidate obligation extraction, impact triage, action tracking and evidence-backed human review.

It must not claim to provide legal advice, regulatory approval, certification, guaranteed completeness, or autonomous compliance determinations. Regulatory source status, applicability, effective dates and legal interpretation require qualified human validation.

## 3. Proposed target architecture

- Web application: Next.js / React with TypeScript; accessible responsive UI.
- API: Python FastAPI, versioned REST endpoints, OpenAPI contract.
- Identity: standards-based OIDC integration; local development identity only until a production identity provider is approved. Do not build custom password storage.
- Tenant model: organisation-scoped tenancy; tenant context enforced server-side on every request; PostgreSQL row-level security as defence in depth.
- Database: PostgreSQL for organisations, users, roles, sources, document versions, extracted clauses, assessments, actions, approvals and audit events.
- Object storage: local development storage adapter initially; production private encrypted object storage requires separate provider, residency and cost approval.
- Processing: asynchronous job interface; local worker for development; production queue and isolated workers require operational review.
- Search: PostgreSQL full-text initially; add vector search only after evaluation and governance approval.
- AI/model gateway: provider-neutral interface. Phase 1 must not require a paid model API. Deterministic comparison and transparent rule-based processing come first; optional AI providers remain disabled until separately approved.
- Regulatory source pipeline: approved source registry, allowlisted official domains, retrieval timestamps, hashes, version lineage, provenance and human source-status verification.
- Observability: structured local logs with sensitive-data redaction; hosted monitoring requires approval.
- Delivery: GitHub Actions for repository checks where available at no cost; local development/test environment; production CI/CD, secrets management, backups and hosting only after approval.

No paid service is authorised by this blueprint.

## 4. Core application modules

1. Organisation and user administration
2. Role and permission management
3. Regulatory source register and public-document ingestion
4. Document parsing and extraction
5. Version comparison and change classification
6. Potential obligation and deadline register
7. Applicability and business-impact assessment
8. Policy, process and control mapping
9. Action register, owners, due dates and escalation
10. Human review, approval and sign-off
11. Evidence and report generation
12. Audit trail and activity history
13. Subscription, plan limits and invoicing integration — deferred; no billing activation in zero-cost phase
14. Platform administration and support

## 5. Minimum data model

- Tenant: organisation, jurisdiction, configuration
- User: identity-provider subject, tenant membership, role, status
- Role/permission: least-privilege capability grants
- Source: authority, jurisdiction, instrument type, official URL, source status
- Document: tenant or shared public-source scope, source, version, hash, dates, file metadata, access classification
- Clause: document version, page/section locator, extracted text, extraction confidence
- Change: old/new clause references, classification, comparison basis, reviewer status
- Obligation: candidate wording, modality, subject, applicability, timing, exceptions, source locator, validation state
- Impact: business area, policy/process/control/system mapping, rationale, reviewer
- Action: owner, due date, priority, status, evidence, approval and closure
- Audit event: actor, tenant, action, object, timestamp, outcome, correlation ID

Every tenant-owned record must carry a tenant identifier and be protected by server-side authorisation and database isolation controls. Public source records must remain distinguishable from tenant-specific assessments derived from them.

## 6. Security and privacy baseline

- MFA for privileged users when production identity is enabled; SSO option for institutional plans
- RBAC and least privilege; tenant isolation tests on every API object path
- TLS in transit and encryption at rest in production
- Managed secrets; no secrets in GitHub, frontend bundles or logs
- Private object storage and short-lived signed access in production
- File validation, malware scanning, archive-bomb and parser limits before accepting uploads
- CSRF, XSS, SSRF, injection, rate-limit and abuse protections
- Secure session management and account recovery
- Immutable or tamper-evident audit events for privileged and material actions
- Configurable retention, export and verified deletion workflows
- Encrypted backups, restore drills and incident response process
- Vulnerability/dependency scanning, penetration test and remediation before production
- Privacy notice, data-processing terms, subprocessor register and breach process
- No customer confidential data sent to external model providers unless contract, configuration and customer approval explicitly permit it

Initial public-document scope does not remove the need to protect user accounts, tenant assessments, notes, exports or audit data.

## 7. Regulatory intelligence governance

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

## 8. Human review and control workflow

Draft → automated extraction/comparison → analyst validation → compliance/legal review → accountable owner acceptance → action tracking → evidence upload → independent closure review.

No AI-generated change, obligation, applicability conclusion or action may be treated as approved without an identified human reviewer and timestamp.

## 9. Delivery phases and release gates

### Phase 0 — Decisions and product risk definition (confirmed)
- Budget: zero-cost development only.
- Initial data scope: public regulatory documents only.
- Target market: international; first supported jurisdictions and source authorities must be selected through a documented source-coverage plan.
- Preserve the existing GitHub Pages AlfiQ workspace and services pages.
- Keep production hosting, identity, storage, AI provider and billing choices unapproved until separately assessed.

Gate: confirmed scope recorded; no paid dependency introduced.

### Phase 1 — Local SaaS foundation (next implementation phase)
- Create a separate application workspace/repository or isolated application directory; do not alter existing AlfiQ pages or unrelated site files.
- Establish frontend/API boundaries, versioned API contract and environment configuration.
- Build a local development stack using open-source components and documented setup; no paid hosted services.
- Implement the initial relational schema for tenants, memberships, roles, sources, documents, versions and audit events.
- Implement organisation/tenant context and server-side authorisation primitives before business features.
- Add public-source registry and metadata-only source records; do not crawl broadly or scrape sites without checking terms and robots/access constraints.
- Add test fixtures made only from synthetic data and public documents.
- Add CI checks, dependency inventory, secret scanning where available without cost, and automated unit/integration tests.

Gate: a developer can run the stack locally from documented instructions; API contract and schema tests pass; tenant-isolation negative tests pass; no secrets or paid dependencies are introduced. This gate does not authorise production use.

### Phase 2 — Public regulatory document lifecycle
- Public official-source metadata, manual document import and supported-file parsing.
- PDF text extraction where technically feasible; scanned PDF/OCR remains deferred unless a free, locally runnable option passes quality and security evaluation.
- Hashes, versioning, provenance, extraction confidence and manual correction workflow.

Gate: supported file types and source traceability pass a labelled public-document test corpus.

### Phase 3 — Change and impact workflow
- Version comparison, New/Modified/Removed/Retained candidate classification.
- Obligation and timing extraction with source locators.
- Human review, impact mapping, action register and approvals.

Gate: labelled evaluation corpus, precision/recall thresholds agreed and met; false-positive/false-negative analysis documented.

### Phase 4 — Reporting and customer operations
- Reports, exports, organisation administration and support workflow.
- Retention, export and deletion tests.
- Billing remains disabled until a separate commercial and cost approval.

Gate: end-to-end UAT and operational readiness.

### Phase 5 — Controlled international pilot readiness
- Select a limited initial jurisdiction set and official-source catalogue.
- Confirm local regulatory terminology, date handling, language support and source-status methodology.
- Production hosting, identity, data residency, monitoring, backups and support must be separately approved and funded if not genuinely available at zero cost.
- Independent security assessment and customer acceptance.

Gate: formal production go/no-go approval. A zero-cost local build alone cannot pass this gate.

## 10. Non-functional acceptance criteria

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

## 11. Commercial and operating prerequisites

- Written service terms, scope, exclusions and customer responsibilities
- Data processing agreement and confidentiality terms where applicable
- Pricing validated through customer interviews and paid-pilot evidence
- Support hours, escalation, service availability and incident communications
- Tax, invoicing, payment provider and cross-border payment eligibility reviewed before activation
- No payment gateway or paid infrastructure is to be purchased without explicit budget approval

## 12. Explicitly out of scope until separately approved

- Automated legal interpretation or legal advice
- Guaranteed regulatory completeness
- Autonomous control-gap determination or remediation approval
- Production sanctions/transaction screening engine
- Processing of SAR/STR, KYC, customer or transaction records in the prototype
- Any claim of certification, regulator endorsement or compliance guarantee
- Paid APIs, paid hosting, paid identity, paid storage, paid monitoring or subscription services

## 13. Current-state migration principle

Keep the existing GitHub Pages AlfiQ workspace and services pages available as a clearly labelled prototype/marketing surface during development. Build the SaaS application in a separate application path/repository or isolated deployment. Do not replace the current prototype until the new service passes all release gates and the owner explicitly approves migration.
