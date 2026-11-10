# GaaS Dual-AI Assurance Engine — Architecture and Delivery Specification

**Status:** Approved product direction; implementation specification  
**Branch:** feat/gaas-dual-ai-assurance-engine  
**Scope:** Add an independent model review and evidence-led finalisation stage to GaaS Live Research without changing the existing primary research contract until the asynchronous workflow is implemented and tested.

## 1. Product decision

GaaS will use a multi-model workflow:

1. Primary research: OpenAI Responses API with web search.
2. One independent review option: Google Gemini Developer API (Google AI Studio), using a paid API project.
3. Finalisation: OpenAI evaluates Gemini's structured findings against the original sources and produces a revised report.
4. Mandatory fallback: if Gemini is unavailable, times out, rejects the request, exhausts quota, or returns unusable output, OpenAI performs a separate self-review pass using an explicit verification checklist and produces the report. If the second OpenAI pass also fails, return the already-generated primary report with a clear `primary_report_fallback_self_review_unavailable` status and visible review limitation. Never withhold the primary report solely because independent verification failed.
5. Human review: report status and limitations remain explicit; AI output is not legal approval or human sign-off.

The initial release has exactly one secondary provider: Gemini. Claude and Vertex AI are not in the initial provider scope.

## 2. Provider options

### 2.1 Primary model

- OpenAI Responses API remains the primary research and finalisation provider in the first release.
- Keep model ID and provider configuration in server-side Worker variables/secrets, never browser code.
- Preserve web search and citation extraction for primary research.

### 2.2 The single secondary reviewer: Gemini

- **Gemini Developer API (Google AI Studio):** the only independent reviewer in the initial release. Use a paid Google API project for commercial GaaS traffic; do not use unpaid/free-tier quota for customer or confidential content.
- Google AI Studio is the development/model-evaluation interface; the GaaS backend calls the Gemini API directly. It does not open Google AI Studio for the customer.
- Claude and Vertex AI are deliberately deferred. They are not selectable options or dependencies in the initial release.

Customer-facing UI remains provider-neutral. Show review progress and status, not a provider selector. Provider selection is a single administrator-controlled server setting.

### 2.3 Provider configuration

Initial server-side configuration (names illustrative; never commit values):

- `GEMINI_API_KEY` (encrypted Worker secret; paid project only)
- `GEMINI_REVIEW_MODEL` (Worker variable)
- `GAAS_GEMINI_REVIEW_ENABLED=false` until configuration, privacy review, cost controls and acceptance tests pass.
- `GAAS_REVIEW_TIMEOUT_MS` (bounded timeout; exact value set after staging latency tests)

No provider key or credential may be exposed to the browser, repository, logs, error payloads or customer report.

## 3. Plan design and entitlements

- **All plans:** one independent review pass, subject to published usage limits and cost controls.
- **Professional / Professional Plus / Business Plus:** enhanced review with structured issue classification, source-to-claim checks, omission analysis, correction tracking and one finalisation pass.
- **Enterprise:** the same single Gemini reviewer in the initial release, with enhanced review depth, stronger deployment/privacy controls and expanded audit trail. A second reviewer is a future upgrade, not part of the initial release.
- Do not enforce plan entitlements based only on a client-supplied plan string. Existing GaaS API has no authenticated subscription/tenant entitlement service; paid-plan feature differentiation must remain disabled until server-side identity, subscription and entitlement checks exist.
- Before that entitlement system exists, use one server-side Gemini reviewer configuration for controlled staging tests. Do not expose provider switching to anonymous public requests.

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
- `finalised_pending_human_review` — Gemini review and OpenAI finalisation completed.
- `finalised_after_openai_self_review` — Gemini was unavailable or unusable; OpenAI performed a separate self-review and finalisation.
- `primary_report_fallback_self_review_unavailable` — primary report is returned because the second OpenAI pass also failed; limitations are prominently disclosed.
- `review_incomplete_provider_unavailable` — optional diagnostic flag, never a reason to suppress the primary report.
- `insufficient_evidence` — the report is delivered with evidence gaps clearly identified.

## 6. Workflow, time and reliability

This is a multi-step workflow and must not be implemented as a fragile long-running browser request. Use a durable job architecture (Cloudflare Queues plus D1 or another approved persistent job store; evaluate Durable Objects if appropriate).

Suggested states:
`queued` → `primary_research_running` → `gemini_review_running` → `openai_finalisation_running` → `quality_gate` → `completed_pending_human_review`.

Fallback path: `gemini_review_failed_or_unavailable` → `openai_self_review_running` → `openai_finalisation_running` → `completed_pending_human_review`.

If the OpenAI self-review/finalisation pass fails after the primary report exists, deliver the primary report with `primary_report_fallback_self_review_unavailable`; never block delivery.

Failure states must distinguish provider timeout, rate limit, invalid credentials, quota/billing exhaustion, malformed reviewer output, missing citations and retryable infrastructure failure.

- Persist only necessary job state and report versions; apply a documented retention/deletion policy.
- Use idempotency keys and bounded retries with exponential backoff and jitter for transient errors only.
- Never automatically retry billing/quota failures or purchase credits.
- Apply per-tenant/per-plan concurrency and daily/monthly spend caps after authentication/entitlements exist.
- Display a realistic estimated duration only after measuring pilot latency. Initially label estimates as indicative and update progress from actual job states.
- Never withhold the primary report because Gemini is unavailable. Always attempt an independent OpenAI self-review and finalisation. If that second pass fails, return the original primary report with a clear fallback status, timestamp and limitations; do not mislabel it as independently verified.

## 7. Data protection and provider governance

- Send the minimum necessary report and evidence to the reviewer. Do not send customer confidential information, PII, account details, transaction records, SAR/STR content or restricted institutional documents in the public preview.
- Google AI Studio / Gemini API unpaid services may use submitted prompts and responses to improve Google products and may involve human review. Do not use unpaid quota for customer content. Use a paid Gemini API project and verify current terms, retention, processing region and contractual commitments before customer launch.
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

### Phase A — Gemini review and guaranteed report fallback
- Add one Gemini reviewer adapter and strict structured-output validation.
- Add OpenAI self-review/finalisation fallback when Gemini is unavailable or returns unusable output.
- Add tests proving the primary report is always delivered if Gemini fails, including when the second OpenAI pass also fails.
- Add prompt-injection resistance, bounded timeout, retry and cost-control tests.
- No live paid provider calls.

### Phase B — Controlled staging integration
- Configure one paid reviewer provider using encrypted staging secrets.
- Add durable job/status persistence and frontend progress polling.
- Run synthetic, non-confidential evaluation cases only.
- Measure accuracy, false positives, missed issues, latency and cost.

### Phase C — Gemini evaluation
- Run the benchmark set through Gemini and OpenAI self-review fallback.
- Compare citation verification, legal-status classification, omission detection, hallucination rate, unsupported corrections, latency and cost.
- Tune the single reviewer configuration based on measured results.

### Phase D — Entitlements and future expansion
- Add authentication, tenant isolation, plan entitlements and usage limits.
- Consider a second independent provider only after business traction and a separate product/security decision.
- Complete privacy, security, legal and operational acceptance before customer release.

## 10. Acceptance criteria

- Primary research, independent review and finalisation are separately identifiable and versioned.
- Reviewer output must validate against a strict schema; malformed output cannot silently pass.
- Every finding has a traceable claim/section and evidence reference or an explicit evidence gap.
- Finalisation records accepted, rejected and unresolved reviewer findings.
- Critical unresolved issues prevent the report from receiving a completed quality-gate status.
- Gemini failure always triggers OpenAI self-review; failure of that fallback still returns the primary report with an explicit limitation status.
- All provider credentials remain server-side and are never logged or returned.
- Mocked tests cover provider success, malformed output, timeout, rate limit, quota exhaustion, retry boundaries and prompt-injection attempts.
- No paid live API test is run without separate explicit authorisation.
- Human review remains mandatory for regulatory/legal conclusions.

## 11. Current implementation boundary

The existing GaaS Worker currently performs synchronous OpenAI primary research only. It has no Gemini reviewer, OpenAI self-review fallback, durable job queue, persistent job status, authenticated customer identity or server-side subscription entitlement enforcement. This specification does not claim those capabilities are live. The current production/staging research path must remain unchanged until the new workflow passes its own CI, security, privacy and staging acceptance gates.
