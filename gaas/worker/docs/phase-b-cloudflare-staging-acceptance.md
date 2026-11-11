# GaaS Phase B — Cloudflare staging acceptance runbook

## Purpose and release boundary

This runbook defines the remaining Cloudflare-specific acceptance work for PR #275. It is deliberately documentation-only: it does not bind resources, run migrations, create test jobs, deploy a Worker, or enable provider calls.

The existing synchronous `POST /api/research` route must remain unchanged until the Phase B workflow passes end-to-end staging acceptance and receives separate production approval. Keep `RESEARCH_PROVIDER = "mock"`; do not add or expose provider credentials during this phase.

## Current verified position

- The PR branch has D1-compatible schema and Node SQLite integration tests.
- The Cloudflare D1 Studio checks previously supplied by the operator show `assurance_jobs` and `assurance_job_events`, including `job_version`, tenant/idempotency uniqueness, event foreign key and enabled foreign-key enforcement in that Studio session.
- The specifically named `assurance_job_created_event` trigger was removed and its absence was verified. Before any migration, inspect *all* remaining triggers.
- Wrangler configuration currently has no D1, Queue, DLQ or scheduled-trigger bindings.
- SQLite tests are not proof of Cloudflare D1 runtime behavior. Studio's `PRAGMA foreign_keys=1` is not proof of the Worker runtime's connection setting.
- The existing staging D1 database has not been proven to be a disposable test database. Do not write synthetic records to it until its purpose, data ownership and recovery/backup are confirmed.

## Gate 0 — inventory only (no writes)

In Cloudflare Dashboard, record the following for the staging environment:

1. D1 database name, database ID, region (if displayed), and whether it contains any non-test data.
2. Exact table DDL from `sqlite_master` for both Phase B tables.
3. Every trigger and index definition, including all unique constraints.
4. Worker bindings currently configured for `gaas-research-api-staging`.
5. Existing Queue names, consumers, retry settings and DLQ configuration, if any.
6. Current staging Worker deployment version and route/hostname.

Do not paste secrets, API tokens, account identifiers or customer data into GitHub or ChatGPT.

### Read-only D1 inventory SQL

Run each query separately in D1 Studio:

```sql
SELECT type, name, tbl_name, sql
FROM sqlite_master
WHERE type IN ('table','index','trigger')
  AND name NOT LIKE 'sqlite_%'
ORDER BY type, name;

PRAGMA table_info(assurance_jobs);
PRAGMA table_info(assurance_job_events);
PRAGMA index_list(assurance_jobs);
PRAGMA index_list(assurance_job_events);
PRAGMA foreign_key_list(assurance_job_events);
PRAGMA foreign_keys;
```

Compare the complete DDL with `migrations/0001_assurance_jobs.sql`. Do not assume that matching column names means migration parity. Do not rerun the initial migration against an existing schema without a reviewed, idempotent upgrade migration and a backup/recovery plan.

## Gate 1 — isolated D1 runtime acceptance

Use a **new disposable D1 database**, not the existing staging database, unless its owner confirms it is empty, disposable and recoverable.

1. Apply the reviewed migration to the disposable database once.
2. Bind it only to a temporary test Worker version/preview.
3. Use synthetic test tenants and public test research prompts only.
4. Exercise the same D1 SQL operations used by `createAssuranceJob`, `transitionAssuranceJob`, `getAssuranceJob` and `deleteExpiredAssuranceJobs`.
5. Capture sanitized result summaries, not request bodies or report content.

Required cases:

| ID | Acceptance case | Expected result |
|---|---|---|
| D1-01 | Create a new job | One queued job and exactly one JOB_CREATED event |
| D1-02 | Repeat same tenant + idempotency key + same request | Same job returned; no duplicate event |
| D1-03 | Same idempotency key under another tenant | Separate job |
| D1-04 | Same tenant + same key + different request | Conflict; no second job |
| D1-05 | Concurrent duplicate submissions | Exactly one job and one creation event |
| D1-06 | Force audit-event insert failure during create batch | Job insert rolls back |
| D1-07 | Force audit-event insert failure during transition batch | Status/version update rolls back |
| D1-08 | Read another tenant's job | No row returned |
| D1-09 | Stale expected version | Conflict; no extra event |
| D1-10 | Expired job cleanup | Expired job removed and event rows cascade |
| D1-11 | Foreign-key enforcement | Confirmed using Worker D1 binding, not only Studio |

A passing SQLite suite does not satisfy these D1-specific cases.

## Gate 2 — Queue and DLQ acceptance

Provision queues only after the D1 gate passes and resource names/ownership are confirmed. Use separate staging names; do not reuse production queues.

Required behavior:

- Valid message: process once; acknowledge only after successful durable state/report handling.
- Transient error: retry with bounded delay; no more than five deliveries.
- Terminal provider quota, billing, authentication or permission error: persist terminal failure, publish DLQ record, then acknowledge.
- D1 persistence failure: do not acknowledge.
- DLQ publication failure: do not acknowledge.
- Alert queue failure after durable DLQ publication: do not create a second job; ensure redelivery/DLQ handling is idempotent.
- Malformed message: publish a minimal, non-sensitive invalid-message record to DLQ before acknowledgement.
- DLQ consumer: deduplicate by job ID and event type; never include prompts, report payloads, credentials or PII in DLQ metadata.

Record delivery count, retry delay, final job status, event count, DLQ record count and acknowledgement outcome for each synthetic test. Do not call a live AI provider; inject deterministic mock failures.

## Gate 3 — security and operational readiness

Before any authenticated job route is enabled:

- Identify the trusted authentication mechanism and verify tenant identity server-side.
- Prove cross-tenant create/read/transition denial.
- Derive plan entitlements and spend limits server-side; reject client-supplied tenant, plan, job ID and fingerprint as authoritative values.
- Add request-size controls, abuse controls and upstream DLP/human review.
- Configure monitored retention cleanup, backups and recovery tests.
- Ensure logs and telemetry exclude prompts, report content, PII, SAR/STR data, tokens and secrets.
- Verify the public status/result projection never returns request or report payloads to an unauthorised tenant.
- Keep provider calls disabled until an independently approved usage ledger, concurrency control and aggregate hard spend guard are tested.

## Release decision checklist

A reviewer may recommend removing Draft status only when all are true:

- [ ] Complete D1 DDL parity review recorded.
- [ ] Isolated Cloudflare D1 runtime acceptance D1-01 through D1-11 passed.
- [ ] Queue/DLQ failure-injection acceptance passed.
- [ ] Tenant authentication and isolation tests passed.
- [ ] Retention, backup and recovery checks passed.
- [ ] No paid provider calls occurred during acceptance.
- [ ] Existing synchronous route regression tests passed.
- [ ] Reviewer has inspected CI on the final PR head.

Passing these gates permits a separate deployment decision; it does not itself authorise production deployment or paid provider activation.
