# AlfiQ — Phase 1 Implementation Plan

Status: Ready for implementation planning; no application code deployed.
Parent architecture: [AlfiQ Production SaaS Blueprint](./alfiq-production-saas-blueprint.md)

## Approved constraints

- Development budget: BDT 0 / zero-cost.
- Initial document scope: public regulatory documents only.
- Intended market: international.
- Paid tools, APIs, hosting, subscriptions, domains, contractors and other charges: prohibited unless separately approved in writing.
- Existing GitHub Pages pages, pricing, calculators, algorithms and unrelated website functionality: preserve unchanged.
- No production/customer data in local development; use synthetic fixtures and public regulatory documents.

## Phase 1 objective

Create a reproducible local SaaS foundation with explicit frontend/API separation, tenant-aware data structures, role-based authorisation primitives, audit events, automated tests and clear setup instructions. Phase 1 is a development foundation, not a production SaaS release.

## Architecture decisions — mandatory before application code

### Repository boundary
- The SaaS engine must live in a separate **private** GitHub repository, provisionally named `alfiq-saas`.
- The existing `regtechnexusai/regtechnexusai.github.io` repository remains the public website and static prototype only.
- Do not place backend code, Docker configuration, migrations, environment templates or internal SaaS implementation files in the GitHub Pages repository.
- Verify repository visibility, owner access, branch protection and Actions permissions before the first code commit.
- Repository creation is a manual owner action unless a repository-creation capability is explicitly available and authorised. Never create a public substitute.

### Data domains and schema partition
Create two PostgreSQL schemas in the first migration:

1. `public_catalog`: shared public-source metadata, issuing authorities, jurisdictions, official document versions, raw-content hashes, retrieval provenance and source lineage. No tenant_id. Application access is read-only for tenant-facing roles. Ingestion/update operations are restricted to a controlled catalog-maintainer role.
2. `tenant_workspace`: tenant-owned workpapers, comparison runs, change candidates, obligation assessments, overrides, review notes, impact mappings, actions, approvals and tenant audit events. Every tenant-owned table must have a non-null tenant identifier and enforced foreign-key relationships.

Shared public records must not contain tenant notes or assessments. Tenant workpapers reference public catalogue identifiers rather than duplicating official documents for each tenant. Public source content and tenant-derived analysis must have separate access policies and retention rules.

A SHA-256 digest proves byte-level consistency against a trusted digest; it does not establish that a document is authentic or officially issued. Record source authenticity verification separately from integrity verification.

### PostgreSQL tenant isolation
- Enforce application-level tenant filtering and PostgreSQL Row-Level Security (RLS); neither is a substitute for the other.
- At the start of every tenant-scoped transaction, set transaction-local context using parameterised `set_config('app.current_tenant_id', :tenant_id, true)` or an equivalent safe mechanism.
- RLS policies must fail closed when tenant context is absent or invalid.
- Apply RLS to every tenant-owned table, including join tables and audit/workpaper tables.
- Use a non-owner application database role without BYPASSRLS. Migration/owner credentials must never be used by the runtime API.
- Test connection-pool reuse, rollback, nested transactions, missing context and context reset to prevent tenant context leakage.
- Retain ORM-level tenant predicates and object-level authorisation checks as defence in depth.

### Local identity and token validation
- Define a common token-validation interface compatible with future standards-based OIDC/JWKS validation.
- Local development may expose `POST /api/v1/auth/dev-token` only when an explicit local-development environment flag is active. The endpoint must be absent or return a hard failure in test, staging and production configurations.
- Use short-lived signed JWT bearer tokens with explicit algorithm allow-list, issuer, audience, expiry, subject, tenant membership and roles. Validate signature, issuer, audience, expiry and not-before where used.
- Prefer a local asymmetric signing key for development where practical; otherwise use a generated local-only secret excluded from version control. Never reuse development signing material in another environment.
- Model role membership server-side. A token role claim is not sufficient by itself to grant access if the membership has been revoked or changed.
- Do not implement production password storage or a home-grown production identity provider.

## Proposed zero-cost development stack

| Layer | Initial choice | Rationale / boundary |
|---|---|---|
| Frontend | React + TypeScript + Vite | Lightweight local development; no paid hosting required |
| API | Python + FastAPI | Typed request/response contracts and OpenAPI |
| Database | PostgreSQL via local Docker Compose | Production-relevant relational model without hosted database spend |
| Data access | SQLAlchemy + Alembic | Explicit migrations and testable persistence |
| Authentication | Local-only JWT adapter behind OIDC-compatible validation interface | Avoid home-grown production authentication; real identity provider selection deferred |
| Tests | Pytest + frontend unit tests + API integration tests | Local and CI execution |
| CI | GitHub Actions where included within available free allowance | No paid runner or add-on |
| File storage | Local development adapter only | No customer uploads or public production endpoint in this phase |
| AI | Disabled / provider-neutral interface only | No API key, external model call or inference spend |

Use exact dependency pins and committed lockfiles. Pin container images to explicit patch versions and preferably immutable digests after verification; do not use floating `:latest` tags. Verify licensing, maintenance status and security advisories before adoption. Do not introduce dependencies requiring paid licences. Add local pre-commit secret scanning (for example, Gitleaks or detect-secrets) and CI secret scanning where available at no cost.

## Phase 1 work packages

### P1. Repository and environment isolation
- Owner creates and verifies the separate private `alfiq-saas` repository.
- Inspect private-repository access, branch protections and GitHub Actions free allowance before enabling workflows.
- Add local setup, example environment file containing placeholders only, ignore rules and secret-scanning hooks.
- Pin Python, Node, package and container dependencies.
- Ensure no secrets, real user data, private keys, database files or customer/institutional names are committed.

Acceptance:
- SaaS source is isolated from the public GitHub Pages repository.
- Repository visibility is verified as private.
- Fresh local setup succeeds from documented commands.
- Secret scanning is configured locally and in CI where available.

### P2. API and frontend skeleton
- Create `/api/v1` routes and typed request/response schemas.
- Add a correlation-ID middleware: accept a valid incoming `X-Correlation-ID` or generate one; propagate it to request context, structured logs, response headers and related audit events.
- Validate and bound incoming correlation IDs to prevent log injection.
- Keep health/readiness probes minimal and unauthenticated, exposing only a generic status; do not reveal database versions, environment variables or infrastructure metadata.
- Add typed errors, request validation, pagination conventions and accessible frontend loading, empty, error and session-expired states.

Acceptance:
- OpenAPI schema is generated and checked.
- Correlation ID propagation is tested end-to-end.
- Frontend can call local API.
- Basic accessibility and unit tests pass.

### P3. Tenant and identity foundation
- Model organisation, user, membership and role.
- Define an explicit enum: `platform_admin`, `org_admin`, `analyst`, `reviewer`, `viewer`.
- Enforce tenant scope on the server; never trust a client-supplied tenant ID.
- Apply RLS and ORM/object-level checks to every tenant-owned resource.
- Use a local-only JWT development adapter with the validation requirements above.
- Deny by default and check access on every read/write/export.

Acceptance:
- Parameterised negative tests prove an Analyst in Tenant A cannot read, modify or export Tenant B workpapers.
- Cross-tenant resource lookup returns the same 404 response as a non-existent resource, preventing object-existence enumeration.
- A Viewer receives 403 for prohibited state-changing actions such as running analyses or editing review notes.
- Role matrix, revoked-membership and connection-pool isolation tests pass.
- No production authentication claim.

### P4. Regulatory source and document metadata
- Model jurisdiction, issuing authority, source URL, instrument type, publication/effective dates, binding-status classification, retrieval timestamp, content hash, byte size, line/paragraph counts where meaningful, language and version lineage.
- Preserve original bytes and calculate SHA-256 over the exact stored byte sequence. If normalised text is separately stored, hash and identify that representation independently.
- Keep source authenticity verification distinct from file-integrity verification.
- Track document lifecycle: `DRAFT` → `UNVERIFIED_IMPORT` → `ACTIVE_OFFICIAL` → `SUPERSEDED` or `REPEALED`. State transitions require defined permissions and evidence; no automatic activation based solely on successful retrieval or hash calculation.
- Maintain bidirectional amendment/supersession/repeal relationships where supported by the source and human-verified.
- Separate shared public catalogue data from tenant-specific review notes and impact assessments.

Acceptance:
- Every document version has source provenance, retrieval time and integrity digest.
- Source status and legal/binding classification are independently recorded.
- Unverified items cannot be represented as active official instruments.
- Version lineage and amendment links are traceable.

### P5. Audit and governance foundation
- Record actor, tenant, action, target object, timestamp, outcome and correlation ID for material events.
- Never log passwords, bearer tokens, secrets, authentication cookies or full sensitive request bodies.
- Audit events are append-only for application roles: revoke UPDATE/DELETE privileges and add a database trigger that raises an explicit exception on attempted mutation. Do not use silent `DO INSTEAD NOTHING` rules as the primary safeguard.
- Separate controlled archival/retention administration from normal application permissions; record any privileged maintenance activity.
- Add explicit allow-list-based audit payload construction and sanitisation tests for authorization headers, passwords, cookies and secret-like fields.
- Add data export/deletion design notes; any legal retention exception must be explicit and documented.
- Require attributable human review and approval; no AI output may be marked approved automatically.

Acceptance:
- Tests verify audit events are generated for material actions.
- Application roles cannot update or delete audit events.
- Sanitisation tests prove secrets and authentication material are absent from stored audit payloads.
- Reviewer identity, approval timestamp and decision rationale are attributable.

### P6. Quality gates
- Unit tests, API integration tests, schema migration tests, tenant isolation tests and frontend tests.
- Run migrations from empty database to head, downgrade to base, then upgrade to head again; all steps must succeed.
- Test migration downgrade data-loss implications; irreversible migrations require an explicit documented exception and restore strategy.
- Run ephemeral PostgreSQL service tests in CI if supported within the available free allowance.
- Cache dependencies where appropriate without weakening lockfile integrity.
- Run dependency vulnerability checks and secret scanning where available at no cost.
- Review full branch history for accidental secrets before merge; rotate and remediate if any secret was ever committed, even if later deleted.
- Document reproducible commands and known limitations.

Acceptance:
- CI passes on a clean branch.
- Migration upgrade/downgrade/re-upgrade succeeds from a clean database.
- Cross-tenant and role-negative tests pass.
- No secrets or customer/institutional identifying data appear in branch history.
- No known critical/high dependency finding is knowingly introduced without documented risk acceptance.
- No paid dependency or service appears in the build.

## Phase 1 exclusions

- Public production hosting or customer onboarding
- Production authentication provider, MFA/SSO deployment
- Customer confidential documents or personal data
- Automated web crawling or continuous regulatory monitoring
- AI inference, embeddings or paid model APIs
- OCR for scanned documents unless a free local option is separately evaluated
- Billing, subscriptions, payment processing and email delivery
- SLA, uptime or security certification claims

## International readiness principles

- Use ISO 3166 country/jurisdiction identifiers where applicable, with room for supranational authorities.
- Store timestamps in UTC and preserve source-local dates/time zones where relevant.
- Store original document language and do not silently translate authoritative text.
- Keep instrument type and legal/binding status separate from jurisdiction.
- Do not assume a single global definition of regulator, circular, rule, guidance or effective date.
- Build a source catalogue only from official or otherwise explicitly approved public sources.
- Select pilot jurisdictions after assessing source availability, language, document formats and legal review capacity.

## Definition of done

Phase 1 is complete only when:
1. The separate private repository is verified and the local setup is reproducible from documentation.
2. Existing GitHub Pages routes and behaviour remain unchanged.
3. API schema and database migrations are version-controlled.
4. Public catalogue and tenant workspace schemas are separate and their access boundaries are tested.
5. Tenant and role isolation tests pass, including 404 anti-enumeration behaviour and Viewer 403 restrictions.
6. PostgreSQL RLS fails closed and survives pooled-connection reuse tests.
7. JWT validation tests cover signature, algorithm, issuer, audience, expiry and local-endpoint environment restrictions.
8. Document hashes, source provenance, lifecycle transitions and supersession links pass tests.
9. Audit append-only and secret-sanitisation tests pass.
10. Migration upgrade/downgrade/re-upgrade succeeds from a clean database.
11. Secret scanning and branch-history review show no exposed secrets or customer/institutional identifying data.
12. CI passes without paid dependencies or services.
13. Limitations and non-production status are clearly documented.

Passing Phase 1 does not authorise production deployment or customer use. Production readiness requires the later security, privacy, hosting, identity, operational and independent assessment gates in the parent blueprint.
