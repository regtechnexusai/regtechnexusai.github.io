# GaaS Full SaaS — Phase 0 Architecture and Release Decision Record

**Status:** Proposed architecture; not production authorization  
**Date:** 12 November 2026  
**Tracking:** GitHub issue #311  
**Target delivery:** 8–12 weeks, subject to external dependencies and security findings

## 1. Product scope for the first commercial release

The first production release will focus on **AlfiQ — Regulatory Change Impact Agent**, supported by a dependable regulatory research and evidence pipeline.

Included in the first release:
- Customer identity, tenant workspaces and role-based access.
- User-submitted regulatory research requests with clear scope and jurisdiction.
- Source discovery prioritising official regulator and standard-setter publications.
- Evidence-linked research reports with provenance and verification status.
- Candidate obligation and business-impact mapping.
- Human review, approval and an auditable decision trail.
- Usage metering, tenant quotas, cost controls and operational monitoring.
- Subscription and payment only after merchant and legal/commercial readiness.

Excluded from the first production release unless separately approved:
- Automated sanctions screening or transaction monitoring.
- Autonomous legal conclusions or compliance attestations.
- Unreviewed AI decisions or automatic control closure.
- Customer document uploads until secure intake, malware scanning, access controls, retention and deletion are independently tested.
- Broad integration claims for existing standalone RegTech tools before each integration is implemented and tested.

## 2. Current baseline

- The public `/gaas/` page is a product preview with a local synthetic demo and proposed pricing.
- The production Worker configuration currently uses `RESEARCH_PROVIDER=mock`; this must remain unchanged until all release gates are met.
- The existing synchronous research API uses Turnstile, rate limiting and a provider adapter path, but the currently configured provider is mock.
- Phase B D1 runtime tests and synthetic Queue end-to-end acceptance passed in isolated test infrastructure.
- Phase B queue processing is not a production regulatory research processor.
- Cloudflare Access onboarding was blocked by account activation/billing flow. Do not make Cloudflare Access a hard dependency; assess alternative identity providers.
- PR #276 remains separate and must be reviewed independently.

## 3. Proposed logical architecture

```text
Customer browser
  |
  | HTTPS + verified session
  v
Static GaaS frontend (GitHub Pages initially)
  |
  v
API / Edge gateway
  |-- identity token verification
  |-- tenant membership and role authorization
  |-- request validation, rate limits and abuse controls
  |
  +--> Tenant / usage / job database
  |
  +--> Durable job queue
          |
          v
     Research orchestration worker
          |-- provider-neutral research adapter
          |-- official-source discovery and retrieval
          |-- evidence/provenance validation
          |-- report quality gates
          |-- human-review state
          |
          v
     Report store + audit events
  |
  v
Customer workspace: status, report, citations, review actions

Separate operational plane:
- usage ledger and per-tenant quotas
- provider hard spend limit and global kill switch
- alerting, audit monitoring, backup/restore
- deletion and retention workflows
```

This is a logical target. It does not assert that all components are currently implemented or deployed.

## 4. Identity architecture decision — open

Cloudflare Access is one candidate, not a committed dependency. Evaluate hosted identity options against:
- Free/development tier suitability without unexpected card or overage authorization.
- Verified email and secure account recovery.
- OIDC/OAuth standards support and stable subject identifiers.
- JWT issuer/audience validation and key rotation.
- Tenant membership enforcement in the application database (identity provider groups alone are insufficient).
- MFA support, session expiry/revocation and audit events.
- Data location, subprocessors, DPA, retention and export/deletion.
- Pricing at pilot scale and migration portability.

**Decision gate:** select one provider only after current official documentation, pricing, data-processing terms and an isolated proof-of-concept have been reviewed. Never store passwords directly in the application database if a managed identity service is selected.

## 5. Research provider architecture decision — open

Use a provider-neutral adapter. Do not couple tenant workflows or report schemas directly to a single model vendor.

Before selecting a provider/model, assess:
- Official web/source discovery capability and citation metadata.
- Reliability, regional availability and data-processing terms.
- Prompt/data retention, training use, subprocessors and cross-border transfer.
- Per-request cost, rate limits, prepaid credits and hard spending controls.
- Model versioning, evaluation and fallback behavior.
- Contractual rights and restrictions for regulatory/standards content.

No paid inference is permitted until a budget is approved, provider hard limits are configured and tested, per-tenant quotas and a global kill switch are active, and the user explicitly approves activation.

## 6. Research evidence and report contract

Every report must distinguish:
1. **Verified facts** — directly supported by an accessible source.
2. **AI analysis** — interpretation or mapping derived from facts.
3. **Assumptions** — explicitly stated assumptions.
4. **Unverified / research pending** — missing, inaccessible, ambiguous or conflicting evidence.
5. **Human review required** — decisions that require an authorised professional.

For each material source, capture where available:
- Issuing authority and jurisdiction.
- Exact title and reference.
- Source URL and retrieval timestamp.
- Publication date and effective date (do not infer missing dates).
- Instrument type and legal status.
- Amendment, repeal or supersession evidence.
- Verification state and reviewer action.

Primary sources take priority. International standards must not be represented as domestic law without checking local adoption. No AI report is legal advice or a final compliance determination.

## 7. Tenant and authorization model

- Each customer organisation has a distinct tenant identifier.
- Every tenant-owned row and object is tenant-scoped at the data-access layer.
- Server-side authorization is mandatory on every request; frontend filtering is not a security control.
- Roles should separate tenant administration, analyst, reviewer and read-only access.
- Job IDs are server-generated and are not authorization credentials.
- Idempotency keys are scoped to tenant and user/client context.
- Cross-tenant access tests are mandatory for read, write, export and deletion paths.
- Administrative access is least-privilege, time-bounded where practical and audit logged.

## 8. Cost and billing controls

Before any live AI provider or billing activation:
- Provider organisation/project hard spend limit.
- Global kill switch and per-tenant request/token/cost quotas.
- Maximum request size, output size, tool calls, timeout and concurrency.
- Usage ledger with provider reconciliation and alert thresholds.
- No automatic retries for non-retryable quota/credit failures.
- Billing provider webhook signature verification, idempotency and replay protection.
- Explicit plan entitlements; proposed public prices must not be treated as active contracts.
- Refund, cancellation, tax, chargeback and customer-support procedures documented.

## 9. Privacy, security and operational gates

- Data-flow and threat model, including identity, research prompts, provider transfer, logs, reports and support access.
- Data minimisation; prohibit unnecessary sensitive customer data and SAR/STR details in public research forms.
- Encryption in transit and at rest; managed secrets; least privilege.
- Redacted logs; never log credentials, access tokens, full prompts or unnecessary personal data.
- Published privacy notice, subprocessors, processing locations, retention and deletion terms.
- Tested tenant export/deletion, backup/restore and incident response.
- Independent security review and remediation of critical/high findings.
- Desktop/mobile UAT, accessibility and browser compatibility.
- Monitoring, alerting, runbooks and rollback procedure.

## 10. Delivery sequence and exit criteria

| Workstream | Exit criteria |
|---|---|
| Foundation and identity | Verified login, session lifecycle, tenant RBAC and cross-tenant isolation tests pass |
| Research processor | Real official-source research; citations/provenance checks; quality evaluation; human review gate |
| Durable jobs | Remote retry/DLQ failure injection, idempotency and recovery tests pass |
| Usage and billing | Reconciled usage ledger, tested hard limits/kill switch, verified billing webhooks and approved commercial terms |
| Security and privacy | Threat model, independent review, privacy controls, deletion and incident response tests complete |
| Release | CI green, UAT complete, rollback ready, customer claims match implementation, explicit activation approval recorded |

Indicative delivery window is 8–12 weeks from 12 November 2026. Any material security issue, provider/legal dependency or account provisioning delay may extend the schedule.

## 11. Non-negotiable release controls

- Keep production `RESEARCH_PROVIDER=mock` until approved production readiness.
- Keep production Phase B job processing disabled until authenticated tenant controls and all reliability gates pass.
- Keep live billing disabled until merchant onboarding, entitlements and webhook verification pass.
- Do not merge this architecture document or other planning work as a substitute for release approval.
- Do not deploy production changes without explicit production activation approval.
