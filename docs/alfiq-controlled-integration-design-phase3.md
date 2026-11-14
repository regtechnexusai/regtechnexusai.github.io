# AlfiQ Controlled Integration Design — Phase 3

**Status:** Design specification only — no integration is active or authorised by this document.  
**Product:** AlfiQ Regulatory Change Impact Agent  
**Parent:** `/alfiq/` browser-based prototype and the RegTech Nexus AI standalone review-support tools.

## 1. Purpose and design decision

Define a safe, evidence-led way for AlfiQ to exchange reviewer-approved regulatory-change information with other RegTech Nexus AI tools in a future release.

The current connected-workflow cards are navigation links only. They do not create a shared case, transfer data, invoke APIs, synchronise records or run background jobs. This remains the current-state disclosure until each integration is separately implemented, tested and approved.

**Phase 3 outcome:** a versioned integration contract and release-control design. It is not permission to build or activate APIs, authentication, database, AI provider calls, customer document upload, automated monitoring or paid services.

## 2. Non-negotiable boundaries

- Preserve the public AlfiQ prototype, exact paragraph matching after whitespace normalisation, duplicate-occurrence handling, keyword heuristics, exports and human-review checklist.
- Do not change PayScale, MD/CEO KPI, other calculators, TradeGuard, ICMS assessment logic, Policy Gap Analyzer logic, GaaS Worker/provider configuration, shared shell, DNS, WAF or production configuration.
- No customer, KYC, transaction, SAR/STR, confidential bank-policy or other sensitive information in the public prototype.
- No automatic cross-tool data transfer. A future transfer requires an authenticated user action, explicit destination, field preview and confirmation.
- No AI-generated finding, obligation, applicability conclusion or action can be approved automatically.
- No paid API, hosting, identity, storage, email, monitoring or payment service without separate written budget approval.
- No production or institutional-readiness claim until the relevant release gates and independent assessments pass.

## 3. Proposed logical flow

```text
Official public source
        |
        v
Source Register — source identity, status, dates, URL, version/hash
        |
        | reviewer verifies source and selected document version
        v
AlfiQ — candidate text changes and heuristic prompts
        |
        | analyst validates paragraph references and candidate classifications
        v
Policy Gap Analyzer — separate policy/control mapping review
        |
        | reviewer-approved mapping only
        v
ICMS — separate control ownership and remediation workflow
        |
        v
Human reviewer / accountable owner — decision, rationale, date, evidence
        |
        v
Tool Assurance / Trust Centre — scope, evidence and limitation disclosures
```

The diagram describes a proposed human-mediated workflow. It does not imply that any of these tools currently exchange data.

## 4. Integration sequence and permitted payloads

| Stage | Future integration | Minimum payload | Current status |
|---|---|---|---|
| 1 | Source Register → AlfiQ | Source ID, issuer, jurisdiction, instrument type, official URL, source status, publication/effective dates, version ID/hash, page/section locator | Manual source notes only |
| 2 | AlfiQ → Policy Gap Analyzer | Reviewer-selected change ID, exact excerpt, source locator, comparison label, reviewer note, verification state | Manual copy only; no API |
| 3 | Policy Gap Analyzer → ICMS | Reviewer-approved policy/control mapping, gap rationale, evidence prompt, suggested owner (not assigned owner) | Separate tools; no transfer |
| 4 | ICMS → AlfiQ evidence record | Action/reference ID, owner decision, status, evidence reference, reviewer/date | No shared case or return channel |
| 5 | Final human decision → audit record | Decision, rationale, actor, timestamp, source/version IDs, accepted/rejected findings | Checklist only in current prototype |

Do not transfer whole documents by default. Prefer minimum necessary metadata and selected excerpts with provenance. Never transfer confidential or personal data through the public prototype.

## 5. Canonical change record — proposed schema

Each future change record should include:

- `change_id`: stable opaque identifier.
- `source_id`, `document_version_id`, `document_hash`: source lineage.
- `jurisdiction`, `issuing_authority`, `instrument_type`, `legal_status`.
- `publication_date`, `effective_date`, `retrieved_at`: retain source-stated values and distinguish unknown from absent.
- `locator`: page, section, paragraph or clause reference where available.
- `comparison_method`: exact paragraph match / other explicitly versioned method.
- `change_classification`: candidate added / removed / retained / modified; not a legal conclusion.
- `before_text`, `after_text`: only selected public or approved excerpts; access-controlled in any future system.
- `heuristic_signals[]`: matched terms and rule-set version; label as prompts only.
- `analyst_status`: unreviewed / verified / rejected / needs-more-evidence.
- `reviewer_id`, `reviewed_at`, `review_note`: mandatory for a verified decision.
- `downstream_references[]`: destination record IDs only after an approved transfer.
- `created_at`, `updated_at`, `schema_version`.

A source hash proves byte-level identity of a stored file; it does not prove that the source is official, legally current or applicable.

## 6. Identity, permissions and consent

A future API must enforce organisation and role permissions server-side on every read, write, export and transfer. Client-supplied tenant IDs are never authoritative.

| Role | Proposed capability |
|---|---|
| Organisation Administrator | Manage members and permissions; cannot approve legal applicability merely by role |
| Analyst | Create draft comparisons and proposed mappings |
| Reviewer | Verify source and comparison evidence; accept/reject candidate findings |
| Control Owner | Respond to assigned, approved actions and attach evidence |
| Read-only Viewer | View authorised records only |
| Platform Administrator | Operate platform; access to customer content must be exceptional, logged and justified |

Every cross-tool transfer must record the initiating user, organisation, source record, destination, exact fields/excerpts, purpose, timestamp and explicit confirmation. Deny by default. No silent background synchronisation.

## 7. Provenance and audit requirements

For every material finding, preserve:

1. Original official source URL and issuing authority.
2. Retrieval timestamp, document version and cryptographic hash.
3. Publication/effective dates exactly as stated by the source, or an explicit unknown state.
4. Page/section/paragraph locator and the exact excerpt used.
5. Comparison method and version, including normalisation rules.
6. Heuristic rule-set version and matched terms.
7. Analyst/reviewer identity, decision, rationale and timestamp.
8. Any downstream mapping or action reference and the actor who approved the transfer.

Never replace the original source excerpt with an AI paraphrase. Corrections must create a traceable version/change event rather than overwrite prior reviewer decisions.

## 8. Security and privacy controls before implementation

- Authentication with a reviewed OIDC identity provider; no custom production password store.
- Tenant isolation enforced at API and data layers, with negative cross-tenant tests.
- Least-privilege role checks and object-level authorisation.
- TLS, managed secrets, encryption at rest and private storage in a separately approved production environment.
- Strict schema validation, size limits, safe text handling, rate limits and CSRF/SSRF/XSS controls as applicable.
- No credentials or sensitive document text in logs.
- Retention, export, deletion, backup/restore and incident-response procedures.
- Threat model covering prompt injection and malicious source content before any AI component is enabled.
- Data-protection, jurisdictional, contractual and subprocessor review before external processing.
- Independent security assessment and remediation before production or institutional pilot.

## 9. Integration acceptance tests

A future integration is not releasable until all applicable tests pass:

- Source ID, URL, version/hash and locator remain intact end to end.
- A changed source version creates a new lineage event; it does not silently overwrite the previous one.
- A reviewer can reject an incorrect change and the rejection persists with actor/date/rationale.
- Unreviewed candidate findings cannot be sent to a downstream control/action workflow.
- User confirmation is required before every cross-tool transfer.
- Tenant A cannot read, alter, enumerate or export Tenant B records.
- Role-negative tests deny unauthorised review, approval, assignment and export.
- Data minimisation tests confirm only selected fields/excerpts are transferred.
- Audit logs capture transfer, decision, export and deletion events without storing secrets.
- Failure, retry, duplicate request and rollback tests do not create duplicate or orphaned actions.
- Deletion and retention tests cover both source and downstream references.
- Browser network inspection confirms no unintended external transmission.
- Regression tests prove all standalone tools and existing calculators remain unchanged.

## 10. Release gates and owner decisions

| Gate | Required evidence | Status |
|---|---|---|
| G0 — Design | This contract and data-flow boundary reviewed | Documented; owner review pending |
| G1 — Product scope | First supported jurisdictions, authorities, instrument types and document formats named | Open |
| G2 — Privacy/security | Threat model, data-flow map, retention/deletion and provider assessment | Open |
| G3 — Identity/tenancy | Identity decision, RBAC matrix, tenant-isolation proof | Open |
| G4 — API/data model | Versioned API, schema, provenance and migration tests | Open |
| G5 — Integration tests | End-to-end positive/negative, failure, audit and regression evidence | Open |
| G6 — Pilot readiness | Written customer scope, terms, support, security review and explicit owner go/no-go | Open |

No integration should be activated while any required gate is open. A separate implementation proposal and explicit owner approval are required before changing application behaviour.

## 11. Current public product statement

Until implementation and verification are complete, use this exact distinction:

> AlfiQ and the other RegTech Nexus AI review-support tools are accessible as separate pages. The connected workflow is a guided manual process; automatic data exchange, shared case management and background monitoring are not enabled. Outputs are preliminary review signals and require source verification and accountable human judgement.
