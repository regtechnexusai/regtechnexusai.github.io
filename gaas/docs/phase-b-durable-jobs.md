# GaaS Phase B — durable assurance jobs

Status: isolated hardening branch; not deployed or connected to the live research endpoint.

## Implemented in this branch
- Tenant-scoped idempotency with a unique tenant/key constraint.
- Tenant identity supplied only by trusted authenticated server context.
- Server-side canonical SHA-256 request fingerprint.
- Allowlisted request fields, field bounds, payload byte limit and basic PII-pattern rejection. Pattern checks are not a guarantee of complete personal-data detection.
- Initial audit event created by a database trigger in the same insert transaction.
- State update and audit event written in a D1 batch with optimistic concurrency and tenant scoping.
- Terminal queue failures are not acknowledged until persistence and dead-letter handoff succeed.
- Explicit bounded Retry-After for transient 429; no retry for quota, billing, authentication or permission failures.
- Expired-job deletion helper; verify foreign-key cascade in actual D1.

## Required before staging activation
1. Apply migration to a disposable D1 database and verify trigger, tenant uniqueness and cascade.
2. Add a scheduled cleanup trigger for deleteExpiredAssuranceJobs and monitor retention backlog.
3. Connect tenant identity from the existing authentication layer.
4. Implement a real DLQ and operational alert callback.
5. Run actual Cloudflare D1 integration tests, including transaction rollback and concurrent idempotency.
6. Add authenticated route tests and server-side request/spend controls before provider adapters.
7. Prove independent-review failure never blocks primary report delivery; return primary report with assurance status independent_review_unavailable.

## Safety boundary
- Existing /api/research is unchanged.
- No D1/Queue bindings or public status/result routes are enabled.
- No provider adapters, paid API calls, credentials, billing changes or customer data.
- Keep this PR Draft until all integration and acceptance gates pass.
