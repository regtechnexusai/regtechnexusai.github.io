# GaaS Phase B — durable assurance jobs

## Implemented
- Tenant-scoped uniqueness on (tenant_id, idempotency_key); tenant comes only from trusted server-side authentication context.
- Server-generated job IDs and SHA-256 request fingerprints over canonical allowlisted fields.
- Atomic job creation + initial JOB_CREATED event and atomic state/event transitions using D1 batch().
- Tenant-filtered reads; status projections omit request and report payloads.
- Allowlisted fields, per-field bounds, 4 KiB canonical payload limit and defensive rejection of common PII, account/identity numbers and SAR/STR terms.
- Bounded jittered retry; quota, billing, authentication and permission errors are terminal. 429 retries only with positive Retry-After and no quota-exhaustion signal. Maximum five deliveries.
- Terminal state is persisted before DLQ publication and message acknowledgement. DLQ is mandatory; alert queue optional. DLQ consumers must deduplicate by jobId if publication is retried after an alert failure.
- Explicit expiry deletion helper; foreign-key cascade removes related event records.
- Node 22 SQLite integration suite executes the migration and verifies tenant separation, idempotency, transactional rollback, stale writes, input controls and retention cascade.

## Trusted integration contract
1. Authenticate before createAssuranceJob and pass only a verified { tenantId } as authContext. Never derive it from request JSON or unverified client headers.
2. Derive plan entitlements and spend limits server-side; never accept client plan, tenant, fingerprint or generated job ID.
3. Client may supply an idempotency token; server scopes it to tenant and derives the authoritative fingerprint and job ID.
4. Use a server-side persistTerminal closure calling persistTerminalQueueFailure(DB, authContext, { jobId, failureCode }).
5. Configure a dead-letter queue before enabling the consumer. The helper refuses to acknowledge if persistence or DLQ publication fails.
6. Invoke deleteExpiredAssuranceJobs(DB, now, limit) from a scheduled monitored cleanup task; validate backup and provider retention separately.
7. Add upstream DLP/human review. Heuristic filters cannot guarantee detection of all sensitive content.

## Not activated
No D1, Queue, DLQ, scheduled trigger, Worker binding, public job/result route, authentication provider, provider adapter, secret, billing change or paid call is provisioned. Existing synchronous /api/research remains unchanged. This PR does not write report payloads.

## Staging activation gates
- Verify identity provider and tenant mapping; test cross-tenant read/write denial.
- Apply migration to disposable Cloudflare D1 and repeat transaction/cleanup tests against D1 itself.
- Configure queue retry count/DLQ; failure-inject D1, provider, DLQ and alert failures.
- Add monitored scheduled deletion and verify backup retention.
- Add authenticated status/result routes only after tenant authorisation and data-retention review.
- Implement server-side usage ledger, concurrency controls and aggregate hard spend guard before any provider adapter is reachable.
- Prove primary report delivery despite optional reviewer failure.
- Keep /api/research unchanged until end-to-end UAT and explicit production approval.


## Queue consumer integration (PR follow-up)

The Worker entrypoint exports a Queue handler through `src/phaseb-queue-consumer.js`.
The handler requires the D1 binding and durable DLQ binding and delegates retry/ack
semantics to `handleAssuranceQueueMessage`. Duplicate deliveries after a durable
state transition are treated as idempotent no-ops.

**Important processing boundary:** the production regulatory research processor is
not implemented in this PR. Until a separately reviewed provider-neutral research
pipeline is implemented, the consumer fails closed and routes the job through the
terminal-failure/DLQ path; it must not represent this as completed research.
The isolated Queue config sets `PHASEB_QUEUE_TEST_MODE=true`, which runs only
synthetic state transitions ending in `completed_pending_human_review` with
`assurance_status=synthetic_test_only`. This is queue plumbing acceptance only,
not evidence of regulatory research functionality.

Job submission is disabled unless `PHASEB_JOBS_ENABLED=true`. The normal
`wrangler.toml` does not enable it. Do not enable the flag in staging or production
until the real processor, Access application, D1 membership provisioning, Queue
consumer, DLQ and spend controls have passed separate acceptance.
