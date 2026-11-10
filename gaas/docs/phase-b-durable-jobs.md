# GaaS Phase B — durable assurance job foundation

**Delivery status:** isolated implementation foundation; not connected to the live research endpoint.

## Included
- D1 migration for durable job records and append-only status events.
- Unique idempotency key and request-fingerprint conflict detection.
- Explicit workflow status allowlist, transition graph and optimistic concurrency version.
- Status projection excludes request and report payloads.
- Bounded retention input (60 seconds to 30 days) and expiry-aware status lookup.
- Queue retry policy with bounded exponential backoff for transient infrastructure failures.
- No automatic retry for quota, billing, authentication, permission or provider rate-limit errors.
- Unit tests use mocked D1 and injected queue processing; no provider calls.

## Deliberately not enabled
- Existing /api/research remains synchronous and unchanged.
- No D1 binding or Cloudflare Queue producer/consumer is configured.
- No status/result HTTP routes are exposed.
- No Gemini or OpenAI provider adapter is invoked by this module.
- No report/customer data is sent to external providers by these tests.
- No paid API calls, secrets or billing changes are made.

## Required before controlled staging activation
1. Provision D1 and apply migrations/0001_assurance_jobs.sql in staging.
2. Create a Cloudflare Queue and configure producer/consumer bindings.
3. Implement authenticated job creation/status/result routes; never trust client-supplied tenant or plan values.
4. Persist only the minimum necessary request data; complete privacy, retention and deletion review.
5. Add request size limits, rate limiting, idempotency enforcement, tenant isolation and spend caps.
6. Add dead-letter handling, poison-message controls, bounded concurrency and operational alerts.
7. Integrate provider adapters behind server-side feature flags; Gemini remains disabled until paid project configuration and explicit launch approval.
8. Run staging integration tests with synthetic, non-confidential data only.
9. Keep the existing live research route unchanged until the full async workflow passes acceptance tests.

## State model
queued -> primary_research_running -> gemini_review_running -> openai_finalisation_running -> quality_gate -> completed_pending_human_review

Fallback transitions support openai_self_review_running and primary_report_fallback_self_review_unavailable. Terminal states cannot be reopened through ordinary transitions.

## Security and production-readiness notes
- The job store returns status metadata only. Do not add a result endpoint until authentication and authorisation exist.
- request_fingerprint must be a SHA-256 digest calculated server-side from canonicalised request content.
- idempotency_key must be generated or scoped server-side after caller identity is established; a global client-controlled key is insufficient for multi-tenant production.
- D1 expiry timestamps do not delete data automatically. A scheduled cleanup job and verified deletion process are required before production.
- Status update and event insertion must be made atomic using a D1 batch/transaction pattern before production.
- The queue helper is a policy primitive, not a configured Cloudflare Queue consumer.
