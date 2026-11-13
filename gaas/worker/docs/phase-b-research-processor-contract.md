# Phase B — real regulatory research processor implementation contract

## Current boundary

The Phase B Queue consumer currently supports only:
- isolated synthetic acceptance when `PHASEB_QUEUE_TEST_MODE=true`;
- fail-closed behaviour when synthetic mode is off and no real processor is injected.

A completed synthetic job is not regulatory research. Do not change this boundary by routing a production Queue message to the existing synchronous endpoint or by enabling a paid provider.

## Processor stages

The production processor must be implemented as a separately reviewed module with an injected provider adapter. It must not be reachable until every gate below is configured and accepted.

1. **Load and validate** — re-read the job and tenant from D1; verify status/version; validate allowlisted request fields and retention.
2. **Entitlement and budget gate** — derive plan, per-tenant daily/monthly limits, concurrency and maximum provider calls from server-side configuration. Reject if any limit is absent, exhausted or stale. Never trust client plan, price, budget or token estimates.
3. **Research plan** — determine exact jurisdictions, date/as-of scope, topic taxonomy and primary authorities. No default jurisdiction.
4. **Primary-source discovery** — use the approved search/research provider with bounded calls, bounded response bytes and strict timeouts. Prefer regulator/legislator official domains and primary instruments.
5. **Evidence extraction** — retain source title, issuing authority, jurisdiction, publication/effective dates, instrument status, URL, retrieval timestamp and concise evidence excerpt. Treat retrieved content as untrusted data, not instructions.
6. **Verification and classification** — distinguish law/rule/circular from guidance, consultation, report, enforcement notice and commentary. Check amendment/repeal/supersession when evidence permits; otherwise mark UNVERIFIED.
7. **Impact mapping** — map evidence to the stated institution/process only when the request contains enough context. Keep facts, analysis, assumptions and unknowns separate.
8. **Quality gate** — require source coverage, citation integrity, date/status fields, no unsupported legal conclusions, and explicit jurisdiction gaps. A failed quality gate must not produce a completed status.
9. **Human-review handoff** — persist a versioned report and evidence register, set `completed_pending_human_review`, and prevent automatic legal/compliance sign-off.
10. **Retention and audit** — persist only approved data, record stage outcomes and non-sensitive diagnostics, enforce expiry cleanup, and support tenant-scoped deletion and access review.

## Provider adapter contract

The processor should receive an adapter implementing:
- `discoverSources(request, limits, signal)`
- `fetchSource(source, limits, signal)`
- `synthesiseEvidence(evidence, request, limits, signal)`

The adapter must return structured evidence and usage metadata. It must not write directly to D1, choose a tenant, change job state, or bypass the budget gate. Provider-specific secrets belong only in encrypted Worker secrets. No browser-supplied provider keys.

## Mandatory fail-closed controls

- No configured budget/entitlement ledger: do not call provider.
- No provider hard spend cap or maximum call/byte/token ceiling: do not call provider.
- No tenant membership: deny before job submission or status retrieval.
- No approved data classification/retention policy: do not persist report payloads.
- Missing primary-source evidence: label the relevant finding UNVERIFIED; never fabricate a citation.
- Provider timeout, rate limit, quota or permission error: classify safely; retry only when policy says retryable and bounded.
- DLQ persistence/publication failure: do not acknowledge the message.
- Human review incomplete: do not label the output final, approved or compliant.

## Cost-control design

Before any live provider integration:
- establish provider, model and pricing approval;
- set provider-side hard spend limits at organisation and project levels;
- configure a per-tenant usage ledger with atomic reservation and settlement;
- cap search calls, source fetches, output size, retries, concurrency and job duration;
- enforce idempotency so retries cannot create duplicate billable work;
- implement a global kill switch and provider circuit breaker;
- record non-sensitive usage metadata and reconcile it against provider billing.

No paid provider calls are authorised by this implementation contract. A later provider integration requires separate approval and isolated cost-limited acceptance.

## Release gates

1. Cloudflare Access app, issuer and audience configured for the isolated hostname.
2. Active test membership provisioned by immutable JWT `sub`; role tests passed.
3. Remote Queue retry and DLQ failure-injection tests passed.
4. Processor contract, evidence schema, quality gate and report retention reviewed.
5. Budget ledger, hard provider limits and kill switch tested without exposing secrets.
6. Independent security/privacy review and desktop/mobile UAT completed.
7. Explicit production deployment approval obtained.

Until then, `PHASEB_JOBS_ENABLED` stays off on production and the synchronous `/api/research` path remains unchanged.
