# GaaS Multi-Provider Research and Assurance Design

**Status:** Design proposal only — not activated, not production-approved  
**Scope:** OpenAI primary research with optional Claude (Anthropic) and Gemini independent assurance  
**Budget boundary:** Proposed aggregate evaluation ceiling USD 5; no provider credits, billing, API keys or paid calls are authorised by this document.

## 1. Non-negotiable operating principles

1. The primary research report must be created and made available independently of any assurance provider.
2. Claude and Gemini are optional reviewers. Their unavailability must never block primary report delivery.
3. An unavailable reviewer produces an explicit status such as `independent_review_unavailable`; it must not be represented as a successful review.
4. No provider is treated as an authoritative legal source. Official instruments and issuing-authority publications remain the evidence base.
5. Preserve the existing synchronous `POST /api/research` route until a replacement workflow has passed acceptance testing.
6. Keep all provider calls disabled by default. Staging remains `RESEARCH_PROVIDER=mock` until separately authorised.
7. Do not transmit customer PII, account data, transaction-level data, SAR/STR material or confidential institutional information during evaluation.

## 2. Target workflow

1. Validate request, origin, Turnstile and abuse controls.
2. Apply authenticated tenant entitlement and server-side request limits before any paid call. Client-supplied plan labels are not entitlements.
3. Create a durable research job with tenant-scoped idempotency and an audit event.
4. Run primary research (currently OpenAI adapter) and persist the primary report plus source register.
5. Return/deliver the primary report as soon as it is complete, with assurance status `pending`.
6. Dispatch independent review jobs to enabled providers (Claude and/or Gemini) using a minimised report and source set.
7. Persist each review independently; classify outcomes as `completed`, `unavailable`, `rejected`, or `failed`.
8. Compare reviewer findings, preserve disagreements and unsupported claims, and produce an assurance summary for human review.
9. Never overwrite the primary report with a reviewer response. Retain separate provenance and timestamps.

## 3. Provider adapter contract

Each provider adapter should expose the same internal interface:

- `providerId`: fixed allowlisted identifier (`openai`, `anthropic`, `google`).
- `isEnabled(env)`: false unless an explicit server-side feature flag is enabled.
- `estimateUsage(input)`: conservative preflight estimate where provider tokenisation/pricing data is available; unknown estimates fail closed for paid execution.
- `review(input, context)`: bounded request with timeout, output cap and request correlation ID.
- `normalise(result)`: structured findings, citations/source references, limitations, token usage and provider request ID.
- `classifyError(error)`: terminal billing/auth/quota/permission errors versus bounded transient failures.
- `neverLogSensitiveData`: logs contain request/job IDs, provider ID, status, usage metadata and diagnostic codes only.

Provider-specific API keys must be separate encrypted Worker secrets. Never place secrets in Git, Pages JavaScript, browser storage, issue comments or chat.

## 4. Claude assurance scope

Claude should act as an independent challenger, not as a second primary report generator. The review prompt should ask it to:

- identify claims not supported by cited official sources;
- detect incorrect legal-status, effective-date, amendment or jurisdiction assumptions;
- identify missing issuing-authority publications and material scope gaps;
- distinguish binding requirements from guidance, consultation, enforcement commentary and analysis;
- challenge clause references and applicability statements;
- flag conflicting sources and unresolved interpretations;
- label each finding as verified from cited source, analytical concern, assumption or unverified;
- avoid inventing citations, clause numbers or regulatory obligations.

Claude's output must include source URLs and a concise rationale for each material challenge. A model's assertion is not source verification.

## 5. Cost and spend controls

- The USD 5 figure is a proposed aggregate test budget across all providers, not USD 5 per provider.
- Do not assume that an application-level budget alone is a hard provider-side cap.
- Before activation, confirm each provider's current billing model, minimum credit purchase (if any), project-level limits, prepaid balance behaviour and auto-reload settings from official documentation.
- Disable auto-reload and automatic credit purchase wherever supported.
- Configure provider-side spend/usage limits and alerts where available.
- Add an application-level aggregate ledger and hard stop. Reserve estimated cost before dispatch; reconcile actual usage after response; release unused reservation.
- Enforce per-job and per-provider token/output limits, concurrency limits, duplicate-call prevention and bounded retries.
- Do not retry authentication, permission, billing, quota or exhausted-credit failures.
- If the combined test cannot be run within the authorised USD 5 ceiling, stop and seek approval before any increase.

## 6. Privacy, security and logging

- Minimise reviewer input: send the primary report, source register and only the necessary non-sensitive request context.
- Reject or redact prohibited sensitive information before dispatch; do not rely solely on model instructions.
- Review provider retention, training, regional processing and contractual terms before sending any production data.
- Do not claim Zero Data Retention unless the account is explicitly eligible and the setting/contract is verified.
- Do not log prompts, full reports, API keys, customer data or raw provider error messages.
- Apply tenant isolation, access controls, retention/deletion and audit-event integrity before enabling durable report history.
- Use timeouts, circuit breakers and bounded retries only for explicitly transient errors.

## 7. Required implementation sequence and gates

### Gate A — Existing Phase B foundation
Resolve PR #266 review blockers before enabling durable jobs: atomic state/event writes, tenant-scoped idempotency, initial event creation, bounded queue/DLQ handling, retention/deletion, schema allowlisting, retry classification, and real D1/Queue integration and failure-injection tests.

### Gate B — Provider-neutral orchestration
Implement provider registry, disabled-by-default flags, normalised result schema, per-provider status, independent review records and primary-report-first delivery. Keep existing synchronous route unchanged.

### Gate C — Security and cost controls
Implement authenticated entitlements, tenant isolation, spend ledger/reservations, aggregate hard stop, input minimisation, secret handling, retention controls and safe diagnostics.

### Gate D — Non-paid regression
Use mocked adapters only. Test provider disabled, missing secret, provider timeout, malformed response, quota/billing/auth failure, duplicate job, concurrent dispatch, reviewer unavailable, primary report delivered despite reviewer failure, and no sensitive logging. CI must never call paid provider endpoints.

### Gate E — Separately authorised live evaluation
Only after the user receives the security/billing assessment and explicitly approves activation. Use synthetic public regulatory research only. No customer or confidential banking data. Record actual provider usage and stop at the approved aggregate ceiling.

### Gate F — Production approval
Require source-quality comparison, human review, security acceptance, privacy/contract review, operational monitoring, rollback plan and separate production approval.

## 8. Acceptance criteria

- Primary report is persisted and delivered even if all reviewers fail.
- Reviewer status is explicit and never falsely marked complete.
- Provider calls are impossible when feature flags are off.
- No secret or sensitive prompt/report data appears in logs.
- Tenant-scoped idempotency prevents duplicate paid dispatch.
- The aggregate spend guard blocks dispatch when budget is exhausted or cannot be estimated safely.
- Billing/auth/quota failures do not trigger automatic retries.
- CI and ordinary regression tests use mocked providers only.
- Existing synchronous `/api/research` behaviour remains unchanged until the replacement is accepted.

## 9. Current disposition

This document does not add provider code, secrets, bindings, billing settings or network calls. It does not change `RESEARCH_PROVIDER=mock`, deploy a Worker, merge PR #266 or authorise any paid usage. Those are separate approval gates.
