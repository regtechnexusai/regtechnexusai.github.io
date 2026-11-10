# GaaS Dual-AI Assurance Engine — Architecture and Delivery Specification

**Status:** Approved product direction; implementation specification  
**Branch:** feat/gaas-dual-ai-assurance-engine  
**Scope:** Add an independent model review and evidence-led finalisation stage to GaaS Live Research without changing the existing primary research contract until the asynchronous workflow is implemented and tested.

## 1. Product decision

GaaS will use a multi-model workflow:

1. Primary research: OpenAI Responses API with web search.
2. Independent review: a separately configured reviewer provider, initially Google Gemini API or Anthropic Claude API.
3. Finalisation: OpenAI receives the draft and structured review findings, verifies each material finding against the cited primary evidence where possible, and produces a revised report.
4. Quality gate: unresolved critical/high findings remain visible; no AI consensus is represented as legal verification or human approval.
5. Human review: final report remains pending authorised human review.

Google Cloud Vertex AI is a distinct deployment option for enterprise workloads. It is not the same service or contract as Google AI Studio / Gemini Developer API.

## 2. Provider options

### 2.1 Primary model

- OpenAI Responses API remains the primary research and finalisation provider in the first release.
- Keep model ID and provider configuration in server-side Worker variables/secrets, never browser code.
- Preserve web search and citation extraction for primary research.

### 2.2 Independent reviewer providers

Initial supported reviewer adapters:

- **Gemini Developer API (Google AI Studio):** paid Gemini API project for commercial GaaS traffic. Do not use unpaid/free-tier quota for customer or confidential data.
- **Claude API (Anthropic):** commercial API organisation and server-side API key.
- **Vertex AI Gemini (Google Cloud):** enterprise deployment option using Google Cloud IAM/service-account authentication, project and location configuration. Implement as a separate adapter, not as an alias for AI Studio.

Provider names may be shown in an administrator configuration area. Customer-facing UI should use neutral choices such as **Standard Independent Review**, **Enhanced Independent Review**, and **Enterprise Review** unless GaaS deliberately chooses to disclose the selected subprocessor/provider in its privacy notice and product UI.

### 2.3 Provider configuration

Initial server-side configuration (names illustrative; never commit values):

- `GAAS_REVIEW_PROVIDER=gemini|claude|vertex`
- `GEMINI_API_KEY` (encrypted Worker secret; paid project only)
- `GEMINI_REVIEW_MODEL` (Worker variable)
- `ANTHROPIC_API_KEY` (encrypted Worker secret)
- `CLAUDE_REVIEW_MODEL` (Worker variable)
- Vertex configuration: project ID, region/location, service-account credentials stored as encrypted secret or workload identity where supported, and model ID.
- `GAAS_REVIEW_ENABLED=false` until configuration, privacy review, cost controls and acceptance tests pass.

No provider key or credential may be exposed to the browser, repository, logs, error payloads or customer report.

## 3. Plan design and entitlements

- **All plans:** one independent review pass, subject to published usage limits and cost controls.
- **Professional / Professional Plus / Business Plus:** enhanced review with structured issue classification, source-to-claim checks, omission analysis, correction tracking and one finalisation pass.
- **Enterprise:** configurable reviewer provider, stronger deployment/privacy controls, optional second independent reviewer, expanded audit trail and administrator policy controls.
- Do not enforce plan entitlements based only on a client-supplied plan string. Existing GaaS API has no authenticated subscription/tenant entitlement service; paid-plan features must remain disabled until server-side identity, subscription and entitlement checks exist.
- Before that entitlement system exists, use a single server-side reviewer configuration for controlled staging tests. Do not expose provider switching to anonymous public requests.

## 4. Review protocol

The reviewer receives:
- primary report draft;
- original research scope and user inputs;
- source register/citation metadata and accessible source excerpts/URLs;
- explicit review rubric;
- instruction to treat draft and retrieved content as untrusted evidence, not instructions.

The reviewer must return a validated structured object with:

- `overall_assessment`: pass / revise / insufficient_evidence;
- `findings[]`: stable ID, category, severity, report section/claim, issue, evidence reference, rationale, proposed correction, confidence;
- `missing_sources[]`;
- `unsupported_claims[]`;
- `legal_status_and_dates[]`;
- `jurisdiction_coverage_gaps[]`;
- `calculations_or_internal_consistency[]`;
- `review_limitations[]`.

Review categories include citation accuracy, source authenticity, issuer/document identity, legal status, publication/effective dates, amendment/supersession, jurisdiction and entity applicability, omitted authorities/instruments, unsupported assertions, internal consistency, calculations, risk/control mapping and recommendations.

The reviewer must not invent replacement citations or legal conclusions. Where evidence is unavailable, it must mark the issue unverified and request evidence rather than guess.

## 5. Finalisation protocol

OpenAI receives the draft plus structured reviewer findings and must:

1. Evaluate each finding independently.
2. Accept a correction only when supported by original source evidence or clearly identified as a qualified analytical improvement.
3. Reject or qualify reviewer suggestions that are unsupported, contradictory or outside scope.
4. Re-check material changed claims against primary sources using web search where available.
5. Preserve the original source register and add any newly verified sources.
6. Produce a final report, change log, accepted/rejected/partially accepted finding register, unresolved issues and human-review checklist.
7. Never label a report legally approved, regulator-approved or error-free.

Suggested final statuses:
- `finalised_pending_human_review`
- `review_incomplete_provider_unavailable`
- `revision_required_unresolved_critical_findings`
- `insufficient_evidence`

## 6. Workflow, time and reliability

This is a multi-step workflow and must not be implemented as a fragile long-running browser request. Use a durable job architecture (Cloudflare Queues plus D1 or another approved persistent job store; evaluate Durable Objects if appropriate).

Suggested states:
`queued` → `primary_research_running` → `independent_review_running` → `finalisation_running` → `quality_gate` → `completed_pending_human_review`.

Failure states must distinguish provider timeout, rate limit, invalid credentials, quota/billing exhaustion, malformed reviewer output, missing citations and retryable infrastructure failure.

- Persist only necessary job state and report versions; apply a documented retention/deletion policy.
- Use idempotency keys and bounded retries with exponential backoff and jitter for transient errors only.
- Never automatically retry billing/quota failures or purchase credits.
- Apply per-tenant/per-plan concurrency and daily/monthly spend caps after authentication/entitlements exist.
- Display a realistic estimated duration only after measuring pilot latency. Initially label estimates as indicative and update progress from actual job states.
- Never return a draft as final if independent review or finalisation did not complete.

## 7. Data protection and provider governance

- Send the minimum necessary report and evidence to the reviewer. Do not send customer confidential information, PII, account details, transaction records, SAR/STR content or restricted institutional documents in the public preview.
- Google AI Studio / Gemini API unpaid services may use submitted prompts and responses to improve Google products and may involve human review. Do not use unpaid quota for customer content. Paid Gemini API terms state prompts/responses are not used to improve Google products.
- Vertex AI has separate Google Cloud enterprise data-processing, IAM and governance controls. Confirm region, service terms, logging, retention and applicable compliance scope before enabling it.
- Anthropic commercial API standard retention is generally 30 days, subject to documented exceptions; Zero Data Retention is a separately requested arrangement and must not be assumed enabled.
- Review current provider terms, DPA, retention, regional processing, subprocessors and customer disclosure before launch.
- Provider choice does not by itself establish regulatory compliance or data residency.
- Keep provider secrets encrypted server-side. Do not log prompts, full reports, tokens or raw provider errors.

## 8. Cost and rollout controls

- Start with one independent reviewer per research case.
- Add a second independent reviewer only for Enterprise or explicitly authorised high-assurance cases.
- Use model-specific input/output limits, report truncation controls and budget alerts.
- Track provider, model, token usage, latency, retries, estimated cost and review findings in privacy-minimised operational telemetry.
- No production customer traffic until paid API billing, hard spend limits, terms/privacy disclosure and abuse/rate limiting are verified.

## 9. Implementation phases

### Phase A — Provider-neutral orchestration and tests
- Add provider adapter interfaces and schema validation.
- Add mocked tests for Gemini, Claude and Vertex adapter contracts.
- Add reviewer output validation, prompt-injection resistance, failure handling and finalisation decision tests.
- No live paid provider calls.

### Phase B — Controlled staging integration
- Configure one paid reviewer provider using encrypted staging secrets.
- Add durable job/status persistence and frontend progress polling.
- Run synthetic, non-confidential evaluation cases only.
- Measure accuracy, false positives, missed issues, latency and cost.

### Phase C — Comparative evaluation
- Run the same benchmark set through Gemini and Claude independently.
- Compare citation verification, legal-status classification, omission detection, hallucination rate, unsupported corrections, reviewer agreement and cost.
- Select a default based on measured performance, not brand preference.

### Phase D — Entitlements and enterprise options
- Add authentication, tenant isolation, plan entitlements and usage limits.
- Enable admin-configurable provider selection and Enterprise Vertex AI deployment.
- Complete privacy, security, legal and operational acceptance before customer release.

## 10. Acceptance criteria

- Primary research, independent review and finalisation are separately identifiable and versioned.
- Reviewer output must validate against a strict schema; malformed output cannot silently pass.
- Every finding has a traceable claim/section and evidence reference or an explicit evidence gap.
- Finalisation records accepted, rejected and unresolved reviewer findings.
- Critical unresolved issues prevent the report from receiving a completed quality-gate status.
- Provider failure cannot silently downgrade to an unreviewed final report.
- All provider credentials remain server-side and are never logged or returned.
- Mocked tests cover provider success, malformed output, timeout, rate limit, quota exhaustion, retry boundaries and prompt-injection attempts.
- No paid live API test is run without separate explicit authorisation.
- Human review remains mandatory for regulatory/legal conclusions.

## 11. Current implementation boundary

The existing GaaS Worker currently performs synchronous OpenAI primary research only. It has no reviewer provider, durable job queue, persistent job status, authenticated customer identity or server-side subscription entitlement enforcement. This specification does not claim those capabilities are live. The current production/staging research path must remain unchanged until the new workflow passes its own CI, security, privacy and staging acceptance gates.
