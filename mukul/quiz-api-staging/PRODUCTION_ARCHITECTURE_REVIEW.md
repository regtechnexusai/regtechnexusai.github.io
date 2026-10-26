# MUKUL Quiz API — Production Architecture Review

**Review date:** 2026-10-26  
**Scope:** PR #152 staging scaffold, PostgreSQL schema foundation, CI smoke-test evidence, and production-readiness design gates.  
**Decision:** **NO-GO for production deployment or frontend integration. GO for continued isolated staging work only.**  
**Production endpoint, host/provider, identity provider, data residency, traffic/SLO targets, RPO/RTO, and budget have not been selected. This review does not invent those decisions.

## 1. Executive assessment

The scaffold is appropriately isolated from the existing GitHub Pages quiz experience. The Docker/PostgreSQL smoke test passed in GitHub Actions: the stack built and started, expected schema objects initialized, API readiness succeeded, the runtime role had no superuser/create privileges or table grants, admin authentication behavior passed, and the disposable stack was torn down. API tests, static regression, staging preview, and visual regression also passed for the reviewed commit.

This is evidence that the **local staging scaffold works**, not evidence of production security, availability, backup recoverability, or penetration-test readiness. No external production host, managed database, production secrets, learner identity model, or live API has been configured.

## 2. Architecture decision for the next phase

Keep the current static frontend and the future API as separate deployables:

```text
Existing GitHub Pages
  └── current quiz pages and current client-side scoring (unchanged)

Future database-backed quiz experience (separate feature/route, after approval)
  └── HTTPS edge / WAF / rate limits
        └── Quiz API service (private runtime identity)
              └── private PostgreSQL service
                    ├── versioned question/content tables
                    ├── answer-key tables (never exposed to public read role)
                    └── review/source/audit records
```

Do not move, rewrite, or silently connect `mukul/knowledge/quiz.html` or `mukul/knowledge/crop-quizzes.html` as part of the backend rollout. First ship the API in a non-production environment and integrate a separate, explicitly reviewed frontend path. Preserve current scoring, result/PDF, header/footer, mobile layout, and existing quiz URLs.

## 3. Findings and required actions

| ID | Severity | Finding / evidence | Required disposition |
|---|---|---|---|
| AR-01 | **Blocker** | Production hosting, network boundary, TLS termination, and database provider are not selected. Local Compose binds ports to loopback, but that is not a production network design. | Select an approved host/region and private networking. Require HTTPS at ingress and encrypted database transport with certificate verification. Do not publish PostgreSQL to the internet. |
| AR-02 | **Blocker** | No production secret manager or rotation procedure exists. The sample uses environment variables for local staging, which is acceptable only for the disposable setup. | Store production secrets in the chosen host's secret manager; separate bootstrap, migration, runtime, and administrative credentials; rotate and audit access. Never ship secrets in GitHub Pages JavaScript or the repository. |
| AR-03 | **Blocker before public quiz routes** | The API currently has no quiz-content, scoring, or authoring routes, so answer-key isolation has not yet been tested at an HTTP boundary. The schema stores answers in dedicated tables. | Implement explicit public DTOs/queries that select only learner-safe fields. Keep answer-key tables unavailable to public/runtime read roles; grade server-side for new database-backed quizzes if answer secrecy is required. Add tests asserting correct answers and answer explanations cannot leak through public payloads, errors, logs, or caches. |
| AR-04 | **Blocker before authoring** | The current admin bearer token is a scaffold guard, not a production identity and authorization design. | Use managed identity/SSO where available, MFA for privileged users, RBAC, short-lived credentials, authorization on every write, audit trails, and a separate migration identity. Do not expose authoring/admin endpoints to anonymous users. |
| AR-05 | **High — implementation added; policy sign-off still required** | Schema v1.4 adds `question_version_sources.content_use_type` to distinguish `factual_reference` from `adapted_content`, `quoted_text`, and `media_reuse`. The publication trigger allows factual citations without treating them as reproduction permission; adapted/quoted/media use is blocked unless the source is `open_license`, `permission_granted`, or `public_domain`. An `open_license` source must name the license. | PostgreSQL CI regression covers all seven reuse statuses across all four use types (28 combinations). Before production, a content-policy/legal owner must approve the treatment of licenses, permissions, public-domain evidence, and attribution requirements. |
| AR-06 | **High** | No gateway rate limit, request-size limit, or abuse controls are configured because no public routes exist yet. | Before public access, add per-IP and/or per-session rate limits, request-size/time limits, bot/abuse monitoring, safe error responses, and load/abuse tests at the edge. Avoid relying solely on in-process limits if the service can scale horizontally. |
| AR-07 | **High** | The schema file is an initial foundation, not a production migration/recovery process. The smoke test checks selected tables but not all constraints, triggers, publication invariants, or rollback behavior. | Adopt ordered, immutable migrations with schema-version tracking and a tested forward/rollback strategy. Add real PostgreSQL tests for bilingual publication invariants, source/review gates, version immutability, lifecycle transitions, and constraint failures. Run migrations using a dedicated role, not the application role. |
| AR-08 | **High** | Backup/restore, point-in-time recovery, retention, and recovery objectives have not been selected or rehearsed. | Define business-approved RPO/RTO, automated backups/PITR where supported, retention, access controls, and an actual restore drill before any production data is stored. Document recovery and rollback owners. |
| AR-09 | **High** | Privacy and retention requirements for learner attempts have not been approved; the schema intentionally defers user/attempt tables. | Keep personal data and attempt persistence out of scope until a data inventory, purpose, lawful basis, retention/deletion, access/export, and incident process are approved. Minimize identifiers; do not log raw answers or tokens. |
| AR-10 | **Medium** | Dependency ranges and mutable container tags are not fully reproducible; CI actions use major-version tags. | For production release, lock and review dependencies, pin base images and CI actions to immutable digests/SHAs where practical, generate an SBOM, scan dependencies/images, and define patch cadence. |
| AR-11 | **Medium** | Current health checks prove process liveness and database connectivity, not end-to-end user experience or operational readiness. | Keep liveness and readiness separate; keep readiness/internal diagnostics off public paths where feasible. Add structured redacted logs, metrics, alerting, latency/error dashboards, and an on-call/incident process before launch. |
| AR-12 | **Medium** | CORS is intentionally absent now. A future browser integration needs a known origin and policy. | Once the exact frontend origin is selected, configure an exact origin allowlist, permitted methods/headers, and no wildcard credentialed CORS. Validate CSRF strategy if cookie-based authentication is selected. |

## 4. Required production topology and identity boundaries

1. **Frontend:** keep GitHub Pages static hosting for the existing pages. Any new database-backed quiz UI must be additive and separately testable.
2. **Ingress:** managed HTTPS endpoint with TLS, request-size/time limits, rate limiting, security headers as appropriate, and a narrow route allowlist.
3. **API runtime:** private service identity, non-root container, minimal image, no debug/docs in production, restricted outbound egress, no privileged database credentials, and controlled deployment access.
4. **Database:** managed PostgreSQL or an equivalently operated private instance; no public database ingress; encrypted connections with certificate verification; automated backups/PITR; monitored storage and connection limits.
5. **Database roles:** separate owner/migration role, application read role, and narrowly scoped write role if needed. Do not grant the public-facing role access to answer-key tables. Keep the current zero-table-grant runtime role until actual reviewed queries require grants.
6. **Secrets:** managed secret storage, least-privilege access, rotation, and redaction from logs/CI output. CI credentials must be short-lived and limited to staging.
7. **Content governance:** source traceability, bilingual review, subject-matter review, licensing/reuse review, versioned publication, and a tested retire/correct process.
8. **Operations:** service owner, alerts, incident runbook, backup restore evidence, release rollback, and defined availability/recovery targets.

## 5. Release gates — must all pass before production

- [ ] Hosting/region, network diagram, HTTPS/TLS and database connectivity reviewed.
- [ ] Secret manager, rotation, least-privilege service identities, and CI permissions reviewed.
- [ ] Migration plan and database owner/runtime role separation implemented.
- [x] Conservative publication gate implemented in schema v1.4; PostgreSQL CI regression covers seven source statuses across factual reference, adapted content, quoted text, and media reuse.
- [ ] Content-policy/legal owner approves the source-reuse policy, attribution requirements, and evidence needed for permission/public-domain claims before production publishing.
- [ ] Public response schema reviewed to exclude answer keys, internal review data, private source metadata, and secrets.
- [ ] Authentication/authorization, rate limits, payload limits, and abuse controls tested.
- [ ] Privacy/retention/deletion decisions approved before storing learner identifiers or attempts.
- [ ] Backup/PITR and restore rehearsal completed against a disposable staging database; RPO/RTO recorded.
- [ ] Monitoring, redacted logs, incident response, and rollback rehearsal completed.
- [ ] Dependency/image scanning and reproducible release artifacts established.
- [ ] New frontend path passes desktop/mobile and English/Bangla regression without changing current quiz behavior.
- [ ] Final human architecture/security approval recorded; only then change the PR from Draft and consider merge/deployment.

## 6. Verification evidence

The following checks passed on the reviewed PR commit:
- Docker/PostgreSQL integration and API tests: https://github.com/regtechnexusai/regtechnexusai.github.io/actions/runs/40308651983
- MUKUL visual and interaction regression: https://github.com/regtechnexusai/regtechnexusai.github.io/actions/runs/40308651901
- Regulatory source/static regression: https://github.com/regtechnexusai/regtechnexusai.github.io/actions/runs/40308651935
- MUKUL staging preview package: https://github.com/regtechnexusai/regtechnexusai.github.io/actions/runs/40308651699

These are automated staging checks, not a penetration test, third-party audit, or production restore rehearsal.

## 7. Final disposition

**Production architecture review: completed with a NO-GO decision for production.** The current scaffold is acceptable for isolated staging and further development. The blockers above are explicit acceptance criteria, not assumed completed work. PR #152 must remain Draft/unmerged until the relevant gates are implemented and verified. No production deployment or existing quiz-page change is authorized by this review.
